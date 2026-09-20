import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { fixture, cli, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';

test('init writes proposal, registration and toolkit and preserves repeated user files', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { checks: { test: 'bun test' }, implement: 'inline', grounding: 'none' });
    expect((await cli(f, ['init', '--from', proposal, '--toolkit', 'typescript=bun:test'])).code).toBe(0);
    expect(readFileSync(resolve(f.root, '.gitignore'), 'utf8')).toBe('issues/worktrees/\nissues/seeds/\n.lock\n');
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      implement: 'inline',
      remote: 'origin',
    });
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8'))).toMatchObject({
      repos: { repo: f.root },
      toolkits: { typescript: 'bun:test' },
    });
    const lessons: string = resolve(f.root, 'learnings/LESSONS.md');
    expect(readFileSync(lessons, 'utf8')).toBe('# Lessons\n');
    writeFileSync(lessons, '# Lessons\nExisting lesson\n');
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(readFileSync(lessons, 'utf8')).toContain('Existing lesson');
    expect(
      readFileSync(resolve(f.root, '.gitignore'), 'utf8')
        .split('\n')
        .filter((x) => x === '.lock'),
    ).toHaveLength(1);
    const before: string = readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8');
    yaml(proposal, { scripts_dir: 'retired' });
    expect((await cli(f, ['init', '--from', proposal])).code).not.toBe(0);
    expect(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8')).toBe(before);
    expect(existsSync(resolve(f.root, 'package.json'))).toBe(false);
    rmSync(resolve(f.root, 'issues/config.yaml'));
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      implement: 'subagents',
      checks: {},
    });
  } finally {
    f.clean();
  }
});

test('init ignores the custom worktree root and preserves user rules on repeated init', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { worktree_root: 'work/trees', grounding: 'none' });
    const ignore: string = resolve(f.root, '.gitignore');
    writeFileSync(ignore, '# User rules\nlocal/\nissues/seeds/\n.lock');
    expect((await cli(f, ['init', '--from', proposal])).code).toBe(0);
    const before: string = readFileSync(ignore, 'utf8');
    expect(before).toBe('# User rules\nlocal/\nissues/seeds/\n.lock\nwork/trees/\n');
    mkdirSync(resolve(f.root, 'work/trees/leaf'), { recursive: true });
    writeFileSync(resolve(f.root, 'work/trees/leaf/file'), 'worktree content\n');
    expect(await command(['git', 'check-ignore', 'work/trees/leaf/file'], f.root)).toBe('work/trees/leaf/file');
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(readFileSync(ignore, 'utf8')).toBe(before);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      worktree_root: 'work/trees',
    });
  } finally {
    f.clean();
  }
});

const rootCases: [string, (f: Fixture) => string, string][] = [
  ['relative external', () => '../trees', ''],
  ['absolute external', (f: Fixture) => resolve(f.home, 'trees'), ''],
  ['repo-prefix sibling', (f: Fixture) => `${f.root}-trees`, ''],
  ['normalized relative internal', () => './work/temporary/../trees/', 'work/trees/\n'],
  ['absolute internal', (f: Fixture) => resolve(f.root, 'work/trees'), 'work/trees/\n'],
  ['relative repo-equal', () => '.', ''],
  ['absolute repo-equal', (f: Fixture) => f.root, ''],
];

test.each(rootCases)('init resolves %s worktree root from nested cwd', async (_, worktreeRoot, expected) => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { worktree_root: worktreeRoot(f), grounding: 'none' });
    expect((await cli(f, ['init', '--from', proposal], resolve(f.root, 'issues/open'))).code).toBe(0);
    expect(readFileSync(resolve(f.root, '.gitignore'), 'utf8')).toBe(`${expected}issues/seeds/\n.lock\n`);
  } finally {
    f.clean();
  }
});

type InitSnapshot = {
  repo: string;
  global: string;
  open: string[];
  learnings: boolean;
  ignore: string | null;
};
function snapshotInit(f: Fixture): InitSnapshot {
  return {
    repo: readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'),
    global: readFileSync(resolve(f.home, 'config.yaml'), 'utf8'),
    open: readdirSync(resolve(f.root, 'issues/open')),
    learnings: existsSync(resolve(f.root, 'learnings')),
    ignore: existsSync(resolve(f.root, '.gitignore')) ? readFileSync(resolve(f.root, '.gitignore'), 'utf8') : null,
  };
}
function expectInitUnchanged(f: Fixture, before: InitSnapshot): void {
  expect(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8')).toBe(before.repo);
  expect(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')).toBe(before.global);
  expect(readdirSync(resolve(f.root, 'issues/open'))).toEqual(before.open);
  expect(existsSync(resolve(f.root, 'learnings'))).toBe(before.learnings);
  expect(existsSync(resolve(f.root, '.gitignore')) ? readFileSync(resolve(f.root, '.gitignore'), 'utf8') : null).toBe(
    before.ignore,
  );
}

test('init refuses missing grounding index without changing files', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { grounding: { index: 'docs/missing.md' } });
    const before: InitSnapshot = snapshotInit(f);
    const result: Result = await cli(f, ['init', '--from', proposal]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Grounding index is not a readable non-empty file');
    expect(result.stderr).toContain(resolve(f.root, 'docs/missing.md'));
    expect(result.stderr).toContain('Complete setup with the init-issues skill.');
    expectInitUnchanged(f, before);
  } finally {
    f.clean();
  }
});

test('init refuses directory grounding index without changing files', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'docs/index'), { recursive: true });
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { grounding: { index: 'docs/index' } });
    const before: InitSnapshot = snapshotInit(f);
    const result: Result = await cli(f, ['init', '--from', proposal]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Grounding index is not a readable non-empty file');
    expect(result.stderr).toContain(resolve(f.root, 'docs/index'));
    expect(result.stderr).toContain('Complete setup with the init-issues skill.');
    expectInitUnchanged(f, before);
  } finally {
    f.clean();
  }
});

test('init refuses empty and whitespace-only grounding index without changing files', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'docs'), { recursive: true });
    writeFileSync(resolve(f.root, 'docs/empty.md'), '');
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { grounding: { index: 'docs/empty.md' } });
    const before: InitSnapshot = snapshotInit(f);
    const result: Result = await cli(f, ['init', '--from', proposal]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Grounding index is not a readable non-empty file');
    expect(result.stderr).toContain(resolve(f.root, 'docs/empty.md'));
    expect(result.stderr).toContain('Complete setup with the init-issues skill.');
    expectInitUnchanged(f, before);
    writeFileSync(resolve(f.root, 'docs/empty.md'), '  \n\t\n');
    const beforeWhitespace: InitSnapshot = snapshotInit(f);
    const whitespace: Result = await cli(f, ['init', '--from', proposal]);
    expect(whitespace.code).not.toBe(0);
    expect(whitespace.stderr).toContain('Grounding index is not a readable non-empty file');
    expect(whitespace.stderr).toContain(resolve(f.root, 'docs/empty.md'));
    expect(whitespace.stderr).toContain('Complete setup with the init-issues skill.');
    expectInitUnchanged(f, beforeWhitespace);
  } finally {
    f.clean();
  }
});

test('init succeeds with non-empty grounding index and preserves it on repeat', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'docs'), { recursive: true });
    writeFileSync(resolve(f.root, 'docs/index.md'), '# Index\n');
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { grounding: { index: 'docs/index.md' }, checks: { test: 'bun test' } });
    expect((await cli(f, ['init', '--from', proposal])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      grounding: { index: 'docs/index.md' },
    });
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      grounding: { index: 'docs/index.md' },
      checks: { test: 'bun test' },
    });
  } finally {
    f.clean();
  }
});

test('init refuses unknown harness in slots without changing files', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, {
      grounding: 'none',
      slots: { a: { harness: 'ghost', model: 'm', effort: 'e' } },
    });
    const before: InitSnapshot = snapshotInit(f);
    const result: Result = await cli(f, ['init', '--from', proposal]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('ghost');
    expectInitUnchanged(f, before);
  } finally {
    f.clean();
  }
});

test('init preserves stored slots override on repeat', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'repo-a', effort: 'low' } },
    });
    expect((await cli(f, ['init', '--from', proposal])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      slots: { a: { harness: 'fake', model: 'repo-a', effort: 'low' } },
    });
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      slots: { a: { harness: 'fake', model: 'repo-a', effort: 'low' } },
    });
  } finally {
    f.clean();
  }
});

test('init with explicit none succeeds and preserves choices on repeat', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { grounding: 'none', implement: 'inline' });
    expect((await cli(f, ['init', '--from', proposal])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      grounding: 'none',
      implement: 'inline',
    });
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      grounding: 'none',
      implement: 'inline',
    });
    rmSync(resolve(f.root, 'issues/config.yaml'));
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({
      grounding: 'none',
    });
  } finally {
    f.clean();
  }
});
