import { test, expect } from 'bun:test';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const repoRoot: string = resolve(import.meta.dir, '..');
const EM_DASH: RegExp = /\u2014|&mdash;|&#8212;|&#x2014;/i;
const LINE_SPLIT: RegExp = /\r\n|[\n\r\u2028\u2029]/;

function collectDocFiles(root: string): string[] {
  const readme: string = join(root, 'README.md');
  if (!statSync(readme).isFile()) throw new Error(`Missing README.md at ${readme}`);

  const docsDir: string = join(root, 'docs');
  const markdownFiles: string[] = readdirSync(docsDir, { recursive: true })
    .map((entry: string | Buffer): string => join(docsDir, String(entry)))
    .filter((file: string): boolean => file.endsWith('.md') && statSync(file).isFile());

  const picturesDir: string = join(root, 'docs', 'pictures');
  const svgFiles: string[] = readdirSync(picturesDir, { recursive: true })
    .map((entry: string | Buffer): string => join(picturesDir, String(entry)))
    .filter((file: string): boolean => file.endsWith('.svg') && statSync(file).isFile());

  return [readme, ...new Set([...markdownFiles, ...svgFiles])].sort();
}

function findEmDashes(root: string): string[] {
  const hits: string[] = [];
  for (const file of collectDocFiles(root)) {
    const content: string = readFileSync(file, 'utf8');
    const lines: string[] = content.split(LINE_SPLIT);
    for (let i: number = 0; i < lines.length; i += 1) {
      if (EM_DASH.test(lines[i])) {
        hits.push(`${relative(root, file)}:${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
  return hits;
}

test('README, docs markdown and docs pictures hold no em dashes', (): void => {
  const files: string[] = collectDocFiles(repoRoot);
  expect(files).toContain(join(repoRoot, 'README.md'));
  expect(files.some((file: string): boolean => file.startsWith(join(repoRoot, 'docs', 'guide') + '/'))).toBe(true);
  expect(files.some((file: string): boolean => file.startsWith(join(repoRoot, 'docs', 'pictures') + '/'))).toBe(true);
  expect(findEmDashes(repoRoot)).toEqual([]);
});

test('em-dash guard catches README, nested docs markdown, SVG pictures, newly added files and non-LF lines on disk', (): void => {
  const dir: string = mkdtempSync(join(tmpdir(), 'akrogon-em-dash-'));
  try {
    mkdirSync(join(dir, 'docs', 'nested', 'deep'), { recursive: true });
    mkdirSync(join(dir, 'docs', 'pictures'), { recursive: true });
    const readme: string = join(dir, 'README.md');
    const nestedMd: string = join(dir, 'docs', 'nested', 'deep', 'page.md');
    const svg: string = join(dir, 'docs', 'pictures', 'diagram.svg');

    writeFileSync(readme, '# Clean README with --flag and 5–40 range\n');
    writeFileSync(nestedMd, '# Clean nested page - ok\n');
    writeFileSync(svg, '<svg><text>Clean diagram</text></svg>\n');
    expect(findEmDashes(dir)).toEqual([]);

    // README.md hit
    writeFileSync(readme, '# README — dash here\n');
    expect(findEmDashes(dir)).toEqual(['README.md:1: # README — dash here']);
    writeFileSync(readme, '# Clean README\n');

    // Nested docs/**/*.md hit on a non-LF (\r) line terminator
    writeFileSync(nestedMd, 'first line\rsecond line — dash here\r\n');
    expect(findEmDashes(dir)).toEqual(['docs/nested/deep/page.md:2: second line — dash here']);
    writeFileSync(nestedMd, '# Clean nested page\n');

    // Newly added file on disk discovered in the same process (no cached/static list)
    mkdirSync(join(dir, 'docs', 'fresh'), { recursive: true });
    const addedMd: string = join(dir, 'docs', 'fresh', 'added.md');
    writeFileSync(addedMd, 'Newly added — dash\n');
    expect(findEmDashes(dir)).toEqual(['docs/fresh/added.md:1: Newly added — dash']);
    rmSync(addedMd);

    // docs/pictures/*.svg literal em dash and XML entities
    writeFileSync(svg, '<svg>\n<text>Label — one</text>\n</svg>\n');
    expect(findEmDashes(dir)).toEqual(['docs/pictures/diagram.svg:2: <text>Label — one</text>']);
    writeFileSync(svg, '<svg>\n<text>Entity &#8212; two</text>\n<text>Named &mdash; three</text>\n</svg>\n');
    expect(findEmDashes(dir)).toEqual([
      'docs/pictures/diagram.svg:2: <text>Entity &#8212; two</text>',
      'docs/pictures/diagram.svg:3: <text>Named &mdash; three</text>',
    ]);
    writeFileSync(svg, '<svg><text>Clean diagram</text></svg>\n');

    expect(findEmDashes(dir)).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
