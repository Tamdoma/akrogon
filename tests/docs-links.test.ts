import { test, expect } from 'bun:test';
import { readFileSync, existsSync, lstatSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { globalSchema } from '../src/config';
import { harnessArgv } from '../src/seat';

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

test('lesson-rule files stay symlinks to the shared rule', () => {
  const rows: string[] = Bun.spawnSync(['git', 'ls-files', '-s', '--', 'skills/*/lesson-rule.md'], {
    cwd: repoRoot,
  })
    .stdout.toString()
    .split('\n')
    .filter((line) => line !== '');
  expect(rows.length).toBe(5);
  for (const row of rows) expect(row).toMatch(/^120000 /);
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
});

test('seat texts and refs name every non-title red name', (): void => {
  const root: string = resolve(import.meta.dir, '..');
  for (const file of ['skills/lifecycle-rules.md']) {
    const text: string = readFileSync(resolve(root, file), 'utf8');
    expect(text, `${file} lists the script name`).toContain('(script)');
    expect(text, `${file} lists the nameless name`).toContain('(no test name)');
    const linkRows: string[] = Bun.spawnSync(['git', 'ls-files', '-s', '--', 'skills/*/lifecycle-rules.md'], {
      cwd: root,
    })
      .stdout.toString()
      .split('\n')
      .filter((line: string) => line !== '');
    expect(linkRows.length, 'five skills link lifecycle-rules.md').toBe(5);
    for (const row of linkRows) {
      const link: string = join(root, row.split('\t')[1]);
      expect(lstatSync(link).isSymbolicLink(), `${link} stays a symlink`).toBe(true);
    }
  }
  const checks: string = readFileSync(resolve(root, 'docs/reference/checks.md'), 'utf8');
  expect(checks, 'checks.md states the script name').toContain('(script)');
  const files: string = readFileSync(resolve(root, 'docs/reference/files.md'), 'utf8');
  expect(files, 'files.md states the script name').toContain('(script)');
  const area: string = readFileSync(resolve(root, 'src/AREA.md'), 'utf8');
  expect(area, 'AREA.md states the script name').toContain('(script)');
});

test('chart-issues skill names akrogon pack at every end-marker site', (): void => {
  const root: string = resolve(import.meta.dir, '..');
  const content: string = readFileSync(join(root, 'skills/chart-issues/SKILL.md'), 'utf8');
  const markers: string[] = ['Handed off', 'Closed', 'Held'];
  for (const marker of markers) expect(content).toContain(marker);
  // C6 is a doc contract: the pack command literal must stand at each of the
  // three end-marker sites. Ordering and phrasing are judgment, not mechanics.
  expect(content.match(/`akrogon pack <chart>`/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
});

test('files.md documents verify-runs timeouts, durations and attempt', (): void => {
  const files: string = readFileSync(resolve(import.meta.dir, '../docs/reference/files.md'), 'utf8');
  const row: string | undefined = files
    .split('\n')
    .filter((line: string) => line.startsWith('|'))
    .find((line: string) => line.startsWith('| `verify-runs.jsonl`'));
  expect(row, 'files.md holds a verify-runs.jsonl row').not.toBeUndefined();
  for (const needed of ['`timeouts`', '`durations`', '`attempt`'])
    expect(row!, `verify-runs.jsonl row names ${needed}`).toContain(needed);
});

const GUIDE_PAGES: readonly string[] = [
  '01-install.md',
  '02-set-up-a-repo.md',
  '03-your-three-tabs.md',
  '04-a-charting-session.md',
  '05-signposts.md',
  '06-charting-mode.md',
  '07-build-route.md',
  '08-hand-off.md',
  '09-lifecycle.md',
  '10-merging.md',
  '11-while-you-are-away.md',
  '12-when-work-stops.md',
];

function yamlCodeBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  let inYaml: boolean = false;
  let current: string[] = [];
  for (const line of markdown.split(/\r\n|[\n\r\u2028\u2029]/)) {
    if (!inYaml) {
      if (/^ {0,3}```yaml\s*$/.test(line)) {
        inYaml = true;
        current = [];
      }
    } else if (/^ {0,3}```\s*$/.test(line)) {
      blocks.push(current.join('\n'));
      inYaml = false;
      current = [];
    } else {
      current.push(line);
    }
  }
  return blocks;
}

function validateInstallConfigMarkdown(markdown: string): string[] {
  const errors: string[] = [];
  const blocks: string[] = yamlCodeBlocks(markdown);
  if (blocks.length < 2) {
    return [`expected primary machine config block and optional harnesses block, found ${blocks.length} yaml block(s)`];
  }

  const primaryRaw: string = blocks[0];
  if (/<[^>\n]+>/.test(primaryRaw)) {
    errors.push('primary machine config contains angle-bracket placeholder');
  }
  let parsedPrimary: ReturnType<typeof globalSchema.parse> | null = null;
  try {
    const rawObj: unknown = Bun.YAML.parse(primaryRaw);
    parsedPrimary = globalSchema.parse(rawObj);
    const harnessNames: string[] = Object.keys(parsedPrimary.harnesses);
    if (harnessNames.length !== 1) {
      errors.push(`primary machine config must define exactly 1 harness, found ${harnessNames.length}`);
    }
    for (const slot of ['a', 'b', 'consultant'] as const) {
      harnessArgv(parsedPrimary, parsedPrimary.slots[slot]);
    }
  } catch (error) {
    errors.push(`primary machine config invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  const optionalRaw: string | undefined = blocks.slice(1).find((block: string): boolean => {
    try {
      const obj = Bun.YAML.parse(block) as { harnesses?: Record<string, unknown> } | null;
      return (
        obj !== null && typeof obj === 'object' && obj.harnesses !== undefined && typeof obj.harnesses === 'object'
      );
    } catch {
      return false;
    }
  });
  if (optionalRaw === undefined) {
    errors.push('missing optional harnesses yaml block');
    return errors;
  }
  if (/<[^>\n]+>/.test(optionalRaw)) {
    errors.push('optional harnesses block contains angle-bracket placeholder');
  }
  try {
    const obj = Bun.YAML.parse(optionalRaw) as { harnesses: Record<string, string> };
    const names: string[] = Object.keys(obj.harnesses);
    if (!names.includes('agy')) errors.push('optional harnesses block missing agy');
    if (names.length < 2) errors.push(`optional harnesses block must list multiple harnesses, found ${names.length}`);
    const baseConfig =
      parsedPrimary ??
      globalSchema.parse({
        slots: {
          a: { harness: names[0], model: 'test-model', effort: 'high' },
          b: { harness: names[0], model: 'test-model', effort: 'high' },
          consultant: { harness: names[0], model: 'test-model', effort: 'high' },
        },
        harnesses: obj.harnesses,
      });
    const combined = { ...baseConfig, harnesses: { ...baseConfig.harnesses, ...obj.harnesses } };
    for (const harness of names) {
      harnessArgv(combined, { harness, model: 'test-model', effort: 'high' });
    }
  } catch (error) {
    errors.push(`optional harnesses block invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  return errors;
}

test('guide pages 01 to 12 exist, retired folders are gone, roll-back moved, and README carries no picture', () => {
  for (const page of GUIDE_PAGES) {
    expect(existsSync(join(repoRoot, 'docs', 'guide', page)), `missing docs/guide/${page}`).toBe(true);
  }
  expect(existsSync(join(repoRoot, 'docs', 'reference', 'roll-back-a-release.md'))).toBe(true);
  for (const retired of ['start', 'use', 'examples']) {
    expect(existsSync(join(repoRoot, 'docs', retired)), `docs/${retired} should be removed`).toBe(false);
  }
  const readmeProse: string = proseOnly(readFileSync(join(repoRoot, 'README.md'), 'utf8'));
  expect(readmeProse).not.toMatch(/!\[[^\]]*\]\(/);
  expect(readmeProse).not.toMatch(/<img\b/i);
});

test('every guide page previous/next line links its neighbours', () => {
  for (let i: number = 0; i < GUIDE_PAGES.length; i += 1) {
    const file: string = join(repoRoot, 'docs', 'guide', GUIDE_PAGES[i]);
    const lines: string[] = readFileSync(file, 'utf8')
      .split(/\r\n|[\n\r\u2028\u2029]/)
      .map((line: string): string => line.trim())
      .filter((line: string): boolean => line !== '');
    const footer: string = lines[lines.length - 1] ?? '';
    const targets: string[] = linkTargets(footer);
    if (i > 0) {
      expect(targets, `${GUIDE_PAGES[i]} footer missing previous ${GUIDE_PAGES[i - 1]}`).toContain(GUIDE_PAGES[i - 1]);
    }
    if (i < GUIDE_PAGES.length - 1) {
      expect(targets, `${GUIDE_PAGES[i]} footer missing next ${GUIDE_PAGES[i + 1]}`).toContain(GUIDE_PAGES[i + 1]);
    }
  }
});

test('install guide copyable machine config passes globalSchema and harnessArgv with one CLI and optional agy block', () => {
  const markdown: string = readFileSync(join(repoRoot, 'docs', 'guide', '01-install.md'), 'utf8');
  expect(validateInstallConfigMarkdown(markdown)).toEqual([]);
});

test('install config validator rejects placeholders, multi-CLI primary configs, bad claude settings and missing agy', () => {
  const validDoc: string = [
    '```yaml',
    'max_active: 3',
    'slots:',
    '  a: { harness: claude, model: claude-opus-5-5, effort: high }',
    '  b: { harness: claude, model: claude-opus-5-5, effort: high }',
    '  consultant: { harness: claude, model: claude-opus-5-5, effort: high }',
    'harnesses:',
    '  claude: "claude --model {model} --effort {effort} --dangerously-skip-permissions"',
    'repos: {}',
    '```',
    '```yaml',
    'harnesses:',
    '  codex: "codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access"',
    '  agy: "agy --model {model} --effort {effort} --mode auto"',
    '```',
  ].join('\n');
  expect(validateInstallConfigMarkdown(validDoc)).toEqual([]);
  expect(validateInstallConfigMarkdown(validDoc.replace('claude-opus-5-5', '<model>'))).toContain(
    'primary machine config contains angle-bracket placeholder',
  );
  expect(
    validateInstallConfigMarkdown(
      validDoc.replace('repos: {}', '  agy: "agy --model {model} --effort {effort} --mode auto"\nrepos: {}'),
    ),
  ).toContain('primary machine config must define exactly 1 harness, found 2');
  expect(
    validateInstallConfigMarkdown(validDoc.replace('--dangerously-skip-permissions', '--settings not-json')).some(
      (msg: string): boolean => msg.startsWith('primary machine config invalid:'),
    ),
  ).toBe(true);
  expect(
    validateInstallConfigMarkdown(
      validDoc.replace(
        '  agy: "agy --model {model} --effort {effort} --mode auto"',
        '  pi: "pi --model {model} --thinking {effort} -a"',
      ),
    ),
  ).toContain('optional harnesses block missing agy');
});

test('where-things-go describes docs/guide and drops retired folders', () => {
  const text: string = readFileSync(join(repoRoot, 'docs', 'reference', 'where-things-go.md'), 'utf8');
  expect(text).toContain('docs/guide/');
  expect(text).not.toContain('docs/start/');
  expect(text).not.toContain('docs/use/');
  expect(text).not.toContain('docs/examples/');
});
