import { test, expect } from 'bun:test';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

type FileResolver = (absolutePath: string) => string | null;

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
    .replace(/ +/g, '-');
}

function headingSlugs(markdown: string): Set<string> {
  const slugs: Set<string> = new Set<string>();
  const lines: string[] = markdown.split('\n');
  for (const line of lines) {
    const match: RegExpExecArray | null = /^#{1,6}\s+(.+)$/.exec(line);
    if (match === null) continue;
    const text: string = match[1].replace(/\s+#+$/, '').trim();
    slugs.add(slugify(text));
  }
  return slugs;
}

function linkTargets(markdown: string): string[] {
  const targets: string[] = [];
  const matches: IterableIterator<RegExpMatchArray> = markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of matches) {
    const raw: string = match[1].trim();
    if (raw === '') continue;
    const token: string = raw.split(/\s+/)[0].replace(/^<|>$/g, '');
    if (token === '') continue;
    targets.push(token);
  }
  return targets;
}

function brokenLinks(sourcePath: string, markdown: string, resolveFile: FileResolver): string[] {
  const broken: string[] = [];
  const targets: string[] = linkTargets(markdown);
  for (const target of targets) {
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:')) continue;
    const hashIndex: number = target.indexOf('#');
    const pathPart: string = hashIndex === -1 ? target : target.slice(0, hashIndex);
    const anchor: string | null = hashIndex === -1 ? null : target.slice(hashIndex + 1);
    if (pathPart === '') {
      if (anchor !== null && anchor !== '') {
        const slugs: Set<string> = headingSlugs(markdown);
        if (!slugs.has(anchor)) broken.push(sourcePath + ': missing anchor #' + anchor);
      }
      continue;
    }
    const resolved: string = resolve(dirname(sourcePath), pathPart);
    const content: string | null = resolveFile(resolved);
    if (content === null) {
      broken.push(sourcePath + ': missing file ' + target);
      continue;
    }
    if (anchor !== null && anchor !== '') {
      const slugs: Set<string> = headingSlugs(content);
      if (!slugs.has(anchor)) broken.push(sourcePath + ': missing anchor #' + anchor + ' in ' + target);
    }
  }
  return broken;
}

function diskResolver(absolutePath: string): string | null {
  if (!existsSync(absolutePath)) return null;
  if (statSync(absolutePath).isDirectory()) return '';
  return readFileSync(absolutePath, 'utf8');
}

test('README and guide links resolve to files and anchors', () => {
  const root: string = resolve(import.meta.dir, '..');
  const guideDir: string = join(root, 'docs/guide');
  const guideFiles: string[] = readdirSync(guideDir)
    .filter((name: string) => name.endsWith('.md'))
    .sort()
    .map((name: string) => join(guideDir, name));
  const files: string[] = [join(root, 'README.md'), ...guideFiles];
  const broken: string[] = [];
  for (const file of files) {
    const content: string = readFileSync(file, 'utf8');
    broken.push(...brokenLinks(file, content, diskResolver));
  }
  expect(broken).toEqual([]);
});

test('broken relative link is reported', () => {
  const files: Record<string, string> = { '/docs/a.md': '# Title\n' };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const broken: string[] = brokenLinks('/docs/a.md', '[dead](missing.md)', resolveFile);
  expect(broken.length).toBe(1);
  expect(broken[0]).toContain('missing.md');
});

test('missing anchors with and without a path part are reported', () => {
  const target: string = '# Real heading\n';
  const files: Record<string, string> = { '/docs/b.md': target };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const anchorOnly: string[] = brokenLinks('/docs/a.md', '# Title\n[bad](#nope)', resolveFile);
  expect(anchorOnly.length).toBe(1);
  expect(anchorOnly[0]).toContain('#nope');
  const withPath: string[] = brokenLinks('/docs/a.md', '[bad](b.md#nope)', resolveFile);
  expect(withPath.length).toBe(1);
  expect(withPath[0]).toContain('#nope');
  const valid: string[] = brokenLinks(
    '/docs/a.md',
    '# Title\n[ok](#title) [ok2](b.md#real-heading) [ext](https://example.com) [mail](mailto:a@b.c)',
    resolveFile,
  );
  expect(valid).toEqual([]);
});
