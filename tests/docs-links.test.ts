import { test, expect } from 'bun:test';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';

type FileResolver = (absolutePath: string) => string | null;

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
    .replace(/ +/g, '-');
}

// Text inside a fenced code block is example content: it carries neither links nor headings.
function proseOnly(markdown: string): string {
  let openingFence: string = '';
  const kept: string[] = [];
  for (const line of markdown.split('\n')) {
    const fence: RegExpExecArray | null = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence !== null) {
      if (openingFence === '') openingFence = fence[1];
      else if (fence[1][0] === openingFence[0] && fence[1].length >= openingFence.length) openingFence = '';
    } else if (openingFence === '') kept.push(line);
  }
  return kept.join('\n');
}

function headingSlugs(markdown: string): Set<string> {
  const slugs: Set<string> = new Set<string>();
  const lines: string[] = proseOnly(markdown).split('\n');
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
  const prose: string = proseOnly(markdown);
  const matches: IterableIterator<RegExpMatchArray> = prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of matches) {
    const raw: string = match[1].trim();
    if (raw === '') continue;
    const token: string = raw.split(/\s+/)[0].replace(/^<|>$/g, '');
    if (token === '') continue;
    targets.push(token);
  }
  const images: IterableIterator<RegExpMatchArray> = prose.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/g);
  for (const match of images) targets.push(match[1].trim());
  return targets;
}

// bound confines a skill file's relative links to its own skill folder, the shape an
// installed per-folder link keeps: a link outside it reports, whatever the source tree holds.
function brokenLinks(sourcePath: string, markdown: string, resolveFile: FileResolver, bound?: string): string[] {
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
    if (bound !== undefined && resolved !== bound && !resolved.startsWith(bound + '/')) {
      broken.push(sourcePath + ': link outside its folder ' + target);
      continue;
    }
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

const repoRoot: string = resolve(import.meta.dir, '..');

// Leaf worktrees are sparse checkouts without issues/, so a path missing on disk is looked up in
// the committed tree; a git link's blob is its target text and is dereferenced, never read as content.
function diskResolver(absolutePath: string, seen: ReadonlySet<string> = new Set<string>()): string | null {
  if (existsSync(absolutePath)) return statSync(absolutePath).isDirectory() ? '' : readFileSync(absolutePath, 'utf8');
  const rel: string = relative(repoRoot, absolutePath);
  const entry: string = Bun.spawnSync(['git', 'ls-tree', 'HEAD', rel], { cwd: repoRoot }).stdout.toString();
  if (entry.startsWith('120000 ')) {
    if (seen.has(absolutePath)) return null;
    const blob: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['git', 'cat-file', '-p', 'HEAD:' + rel], {
      cwd: repoRoot,
    });
    if (blob.exitCode !== 0) return null;
    return diskResolver(
      resolve(dirname(absolutePath), blob.stdout.toString().trim()),
      new Set<string>([...seen, absolutePath]),
    );
  }
  const committed: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['git', 'cat-file', '-p', 'HEAD:' + rel], {
    cwd: repoRoot,
  });
  return committed.exitCode === 0 ? committed.stdout.toString() : null;
}

test('README, docs and skill links resolve to files and anchors', () => {
  const root: string = repoRoot;
  const docFiles: string[] = readdirSync(join(root, 'docs'), { recursive: true })
    .map((entry) => join(root, 'docs', String(entry)))
    .filter((file: string) => file.endsWith('.md'))
    .sort();
  const skillsDir: string = join(root, 'skills');
  const listing: string = Bun.spawnSync(['git', 'ls-files', '-s', 'skills/'], { cwd: root }).stdout.toString();
  const skillFiles: string[] = listing
    .split('\n')
    .map((line: string) => /^\d{6} [0-9a-f]{40} \d\t(.+)$/.exec(line)?.[1])
    .filter((rel: string | undefined): rel is string => rel !== undefined && rel.endsWith('.md'));
  const files: string[] = [join(root, 'README.md'), ...docFiles];
  const broken: string[] = [];
  for (const file of files) {
    const content: string = readFileSync(file, 'utf8');
    broken.push(...brokenLinks(file, content, diskResolver));
  }
  for (const rel of skillFiles.sort()) {
    const parts: string[] = rel.split('/');
    const bound: string = parts.length === 2 ? skillsDir : join(root, parts.slice(0, 2).join('/'));
    const content: string | null = diskResolver(join(root, rel));
    if (content === null) {
      broken.push(rel + ': tracked file unreadable');
      continue;
    }
    broken.push(...brokenLinks(join(root, rel), content, diskResolver, bound));
  }
  expect(broken).toEqual([]);
});

test('lesson write sites link the shared lesson rule', () => {
  const root: string = resolve(import.meta.dir, '..');
  const writeSites: string[] = [
    'skills/plan-issue/SKILL.md',
    'skills/implement-issue/SKILL.md',
    'skills/check-issue/SKILL.md',
    'skills/chart-issues/SKILL.md',
  ];
  const missing: string[] = [];
  for (const site of writeSites) {
    const content: string = readFileSync(join(root, site), 'utf8');
    if (!content.includes('lesson-rule.md')) missing.push(site);
  }
  expect(missing).toEqual([]);
});

test('broken relative link is reported', () => {
  const files: Record<string, string> = { '/docs/a.md': '# Title\n' };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const broken: string[] = brokenLinks('/docs/a.md', '[dead](missing.md)', resolveFile);
  expect(broken.length).toBe(1);
  expect(broken[0]).toContain('missing.md');
});

test('missing images in a nested page are reported in Markdown and img forms', () => {
  const files: Record<string, string> = { '/docs/pictures/real.svg': '<svg/>' };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const broken: string[] = brokenLinks(
    '/docs/reference/a.md',
    '![gone](../pictures/gone.svg)\n<img alt="lost" src="../pictures/lost.svg">\n![ok](../pictures/real.svg) <img src="../pictures/real.svg">',
    resolveFile,
  );
  expect(broken).toEqual([
    '/docs/reference/a.md: missing file ../pictures/gone.svg',
    '/docs/reference/a.md: missing file ../pictures/lost.svg',
  ]);
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

test('a relative link leaving its skill folder is reported even when the file exists', () => {
  const files: Record<string, string> = { '/skills/lesson-rule.md': '# Rule\n' };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const escaped: string[] = brokenLinks(
    '/skills/plan-issue/SKILL.md',
    '[rule](../lesson-rule.md)',
    resolveFile,
    '/skills/plan-issue',
  );
  expect(escaped.length).toBe(1);
  expect(escaped[0]).toContain('../lesson-rule.md');
  const inside: string[] = brokenLinks(
    '/skills/plan-issue/SKILL.md',
    '[rule](lesson-rule.md)',
    resolveFile,
    '/skills/plan-issue',
  );
  expect(inside.length).toBe(1);
  expect(inside[0]).toContain('missing file');
});

test('link-shaped text inside a fenced block is not a link', () => {
  const files: Record<string, string> = { '/skills/plan-issue/ok.md': '# Ok\n' };
  const resolveFile: FileResolver = (path: string): string | null => (Object.hasOwn(files, path) ? files[path] : null);
  const markdown: string = '```markdown\n[ex](nope.md)\n```\n[real](also-nope.md) [ok](ok.md)';
  const broken: string[] = brokenLinks('/skills/plan-issue/SKILL.md', markdown, resolveFile, '/skills/plan-issue');
  expect(broken).toEqual(['/skills/plan-issue/SKILL.md: missing file also-nope.md']);
});

test('shorter nested fences keep example links inside the outer block', (): void => {
  const markdown: string = '````markdown\n```text\n[example](missing.md)\n```\n````\n';
  const broken: string[] = brokenLinks(
    join(repoRoot, 'skills/chart-issues/assets/questions.md'),
    markdown,
    diskResolver,
    join(repoRoot, 'skills/chart-issues'),
  );
  expect(broken).toEqual([]);
});

test('seat skills name the known-red command', (): void => {
  const root: string = resolve(import.meta.dir, '..');
  expect(readFileSync(join(root, 'skills/lifecycle-rules.md'), 'utf8')).toContain('akrogon verify --known-red');
  expect(readFileSync(join(root, 'skills/merge-issue/SKILL.md'), 'utf8')).toContain(
    'akrogon verify --attempt <id> --known-red',
  );
});

test('chart-issues direct landing names the known-red command', (): void => {
  const content: string = readFileSync(
    resolve(import.meta.dir, '../skills/chart-issues/assets/direct-route.md'),
    'utf8',
  );
  expect(content).toContain('verify --holder <chart>/direct --known-red');
});

test('chart-issues skill names akrogon pack at every end-marker site', (): void => {
  const root: string = resolve(import.meta.dir, '..');
  const content: string = ['skills/chart-issues/SKILL.md', 'skills/chart-issues/assets/direct-route.md']
    .map((file: string) => readFileSync(join(root, file), 'utf8'))
    .join('\n');
  const markers: string[] = ['Handed off', 'Closed', 'Held'];
  for (const marker of markers) expect(content).toContain(marker);
  // C6 is a doc contract: the pack command literal must stand at each of the
  // three end-marker sites. Ordering and phrasing are judgment, not mechanics.
  expect(content.match(/`akrogon pack <chart>`/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
});
