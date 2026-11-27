import { test, expect } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const repoRoot: string = resolve(import.meta.dir, '..');
const EM_DASH: RegExp = /\u2014|&mdash;|&#8212;|&#x2014;/i;
const RETIRED_PHRASES: RegExp = /manual mode|manual route|quick fix|autopilot signposts/i;
const OLD_RECORD_PREFIX: string = 'Old record words:';
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

function trackedSkillMarkdown(root: string): { rel: string; content: string }[] {
  const listing: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['git', 'ls-files', '-s', 'skills/'], {
    cwd: root,
  });
  if (listing.exitCode !== 0) {
    throw new Error(`git ls-files skills/ failed in ${root}: ${listing.stderr.toString().trim()}`);
  }
  const rels: string[] = listing.stdout
    .toString()
    .split('\n')
    .map((line: string): string | undefined => /^\d{6} [0-9a-f]{40} \d\t(.+)$/.exec(line)?.[1])
    .filter((rel: string | undefined): rel is string => rel !== undefined && rel.endsWith('.md'))
    .sort();
  return rels.map((rel: string): { rel: string; content: string } => {
    const abs: string = join(root, rel);
    if (existsSync(abs)) return { rel, content: readFileSync(abs, 'utf8') };
    const blob: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['git', 'cat-file', '-p', `HEAD:${rel}`], {
      cwd: root,
    });
    if (blob.exitCode !== 0) throw new Error(`Tracked skill file unreadable: ${rel}`);
    return { rel, content: blob.stdout.toString() };
  });
}

function collectRetiredPhraseFiles(root: string): { rel: string; content: string }[] {
  const readme: string = join(root, 'README.md');
  if (!statSync(readme).isFile()) throw new Error(`Missing README.md at ${readme}`);
  const docsDir: string = join(root, 'docs');
  const markdownFiles: string[] = readdirSync(docsDir, { recursive: true })
    .map((entry: string | Buffer): string => join(docsDir, String(entry)))
    .filter((file: string): boolean => file.endsWith('.md') && statSync(file).isFile())
    .sort();
  return [
    { rel: 'README.md', content: readFileSync(readme, 'utf8') },
    ...markdownFiles.map((file: string): { rel: string; content: string } => ({
      rel: relative(root, file),
      content: readFileSync(file, 'utf8'),
    })),
    ...trackedSkillMarkdown(root),
  ];
}

function findRetiredPhrases(root: string): string[] {
  const hits: string[] = [];
  for (const { rel, content } of collectRetiredPhraseFiles(root)) {
    const lines: string[] = content.split(LINE_SPLIT);
    for (let i: number = 0; i < lines.length; i += 1) {
      if (lines[i].startsWith(OLD_RECORD_PREFIX)) continue;
      if (RETIRED_PHRASES.test(lines[i])) {
        hits.push(`${rel}:${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
  return hits;
}

test('README, docs markdown and tracked skills markdown hold no retired phrases', (): void => {
  const files: { rel: string; content: string }[] = collectRetiredPhraseFiles(repoRoot);
  const rels: string[] = files.map((entry: { rel: string; content: string }): string => entry.rel);
  expect(rels).toContain('README.md');
  expect(rels.some((rel: string): boolean => rel.startsWith('docs/guide/'))).toBe(true);
  expect(rels).toContain('skills/chart-issues/SKILL.md');
  expect(findRetiredPhrases(repoRoot)).toEqual([]);
});

test('retired-phrase guard checks README, fresh docs on disk and tracked skills while ignoring vendored node_modules and Old record words lines', (): void => {
  const dir: string = mkdtempSync(join(tmpdir(), 'akrogon-retired-phrases-'));
  const git = (args: string[]): void => {
    const result: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['git', ...args], { cwd: dir });
    if (result.exitCode !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.toString()}`);
  };
  try {
    git(['init', '-q']);
    git(['config', 'user.email', 'test@example.invalid']);
    git(['config', 'user.name', 'Test']);
    mkdirSync(join(dir, 'docs', 'nested'), { recursive: true });
    mkdirSync(join(dir, 'skills', 'demo', 'node_modules', 'pkg'), { recursive: true });

    const readme: string = join(dir, 'README.md');
    const nestedMd: string = join(dir, 'docs', 'nested', 'page.md');
    const skillMd: string = join(dir, 'skills', 'demo', 'SKILL.md');
    const vendoredMd: string = join(dir, 'skills', 'demo', 'node_modules', 'pkg', 'README.md');

    writeFileSync(readme, '# Clean README\n');
    writeFileSync(nestedMd, '# Clean docs\n');
    writeFileSync(
      skillMd,
      '# Demo skill\nOld record words: `autopilot signposts`, `manual mode`, `manual route`, `quick fix`.\n',
    );
    // Untracked vendored node_modules file containing every retired phrase must never count.
    writeFileSync(vendoredMd, 'Quick fix and manual mode and manual route and autopilot signposts\n');
    git(['add', 'skills/demo/SKILL.md']);
    git(['commit', '-q', '-m', 'seed skill']);

    expect(findRetiredPhrases(dir)).toEqual([]);

    // README.md case-insensitive hit
    writeFileSync(readme, 'Try a Quick Fix today.\n');
    expect(findRetiredPhrases(dir)).toEqual(['README.md:1: Try a Quick Fix today.']);
    writeFileSync(readme, '# Clean README\n');

    // Nested docs/**/*.md case-insensitive hits for manual mode and manual route
    writeFileSync(nestedMd, 'Use MANUAL MODE or Manual Route here.\n');
    expect(findRetiredPhrases(dir)).toEqual(['docs/nested/page.md:1: Use MANUAL MODE or Manual Route here.']);
    writeFileSync(nestedMd, '# Clean docs\n');

    // Newly added docs file discovered fresh on disk in the same process (no cached list)
    mkdirSync(join(dir, 'docs', 'fresh'), { recursive: true });
    const freshMd: string = join(dir, 'docs', 'fresh', 'added.md');
    writeFileSync(freshMd, 'Heading: Autopilot Signposts\n');
    expect(findRetiredPhrases(dir)).toEqual(['docs/fresh/added.md:1: Heading: Autopilot Signposts']);
    rmSync(freshMd);

    // Non-LF (\r) line after an exempted Old record words: line is still checked
    writeFileSync(nestedMd, 'Old record words: autopilot signposts\rquick fix\n');
    expect(findRetiredPhrases(dir)).toEqual(['docs/nested/page.md:2: quick fix']);

    // Old record words: not at line start is NOT exempted
    writeFileSync(nestedMd, 'Note: Old record words: manual mode\n');
    expect(findRetiredPhrases(dir)).toEqual(['docs/nested/page.md:1: Note: Old record words: manual mode']);
    writeFileSync(nestedMd, '# Clean docs\n');

    // Tracked skill file with non-exempted line IS caught while vendored node_modules stays ignored
    writeFileSync(skillMd, '# Demo skill\nDo not use manual route here.\n');
    expect(findRetiredPhrases(dir)).toEqual(['skills/demo/SKILL.md:2: Do not use manual route here.']);
    writeFileSync(skillMd, '# Demo skill\nOld record words: `autopilot signposts`.\n');
    expect(findRetiredPhrases(dir)).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
