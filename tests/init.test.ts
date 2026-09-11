import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { fixture, cli, yaml, type Fixture } from './helpers';
import { command } from '../src/shell';

test('init writes proposal, registration and toolkit and preserves repeated user files', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { checks: { test: 'bun test' }, implement: 'inline' });
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
    yaml(proposal, { worktree_root: 'work/trees' });
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
    yaml(proposal, { worktree_root: worktreeRoot(f) });
    expect((await cli(f, ['init', '--from', proposal], resolve(f.root, 'issues/open'))).code).toBe(0);
    expect(readFileSync(resolve(f.root, '.gitignore'), 'utf8')).toBe(`${expected}issues/seeds/\n.lock\n`);
  } finally {
    f.clean();
  }
});
