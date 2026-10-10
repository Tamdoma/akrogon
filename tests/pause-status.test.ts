import { test, expect } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { command, type Result } from '../src/shell';
import { cli, fixture, leaf, yaml, type Fixture } from './helpers';

async function secondRoot(f: Fixture, name: string): Promise<string> {
  const root: string = resolve(f.home, name);
  mkdirSync(resolve(root, 'issues'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  yaml(resolve(root, 'issues/config.yaml'), { grounding: 'none' });
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as {
    repos: Record<string, string>;
  };
  global.repos[name] = root;
  yaml(resolve(f.home, 'config.yaml'), global);
  return root;
}

function heading(output: string, repo: string): string {
  const line: string | undefined = output
    .split('\n')
    .find((candidate) => candidate.trim() === repo || candidate.trim().startsWith(`${repo} (`));
  expect(line).not.toBe(undefined);
  return line as string;
}

test('status marks the paused repo beside its heading, including an empty repo', async () => {
  const f: Fixture = await fixture();
  const outside: string = mkdtempSync(resolve(tmpdir(), 'akrogon-outside-'));
  try {
    leaf(f, 'build', 'plan.synthesis');
    const y: string = await secondRoot(f, 'y');
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    expect((await cli(f, ['pause'], y)).code).toBe(0);
    const run: Result = await cli(f, ['status'], outside);
    expect(run.code).toBe(0);
    expect(heading(run.stdout, 'repo')).toContain('paused');
    expect(heading(run.stdout, 'y')).toContain('paused');
    expect(run.stdout).toContain('no open leaves');
    expect(run.stdout).toContain('build');
    expect((await cli(f, ['unpause'], y)).code).toBe(0);
    const after: Result = await cli(f, ['status'], outside);
    expect(after.code).toBe(0);
    expect(heading(after.stdout, 'repo')).toContain('paused');
    expect(heading(after.stdout, 'y')).not.toContain('paused');
  } finally {
    rmSync(outside, { recursive: true, force: true });
    f.clean();
  }
});

test('status charts marks the paused repo heading', async () => {
  const f: Fixture = await fixture();
  const outside: string = mkdtempSync(resolve(tmpdir(), 'akrogon-outside-'));
  try {
    leaf(f, 'build', 'plan.synthesis');
    await secondRoot(f, 'y');
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const run: Result = await cli(f, ['status', '--charts'], outside);
    expect(run.code).toBe(0);
    expect(heading(run.stdout, 'repo')).toContain('paused');
    expect(heading(run.stdout, 'y')).not.toContain('paused');
  } finally {
    rmSync(outside, { recursive: true, force: true });
    f.clean();
  }
});

test('targeted status names the pause for a leaf of a paused repo', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const before: Result = await cli(f, ['status', 'build']);
    expect(before.code).toBe(0);
    expect(before.stdout).not.toContain('paused');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['status', 'build']);
    expect(run.code).toBe(0);
    const line: string | undefined = run.stdout.split('\n').find((candidate) => candidate.includes('paused'));
    expect(line).not.toBe(undefined);
    expect(line).toContain('repo');
  } finally {
    f.clean();
  }
});

test('unpaused repos print as before with phases and blockers unchanged', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'first', 'implement');
    leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] });
    const run: Result = await cli(f, ['status']);
    expect(run.code).toBe(0);
    expect(run.stdout).not.toContain('paused');
    expect(run.stdout).toContain('first');
    expect(run.stdout).toContain('implement');
    expect(run.stdout).toContain('second');
    expect(run.stdout).toContain('first');
  } finally {
    f.clean();
  }
});

function hold(f: Fixture, sha: string = '0123456789abcdef0123456789abcdef01234567'): void {
  yaml(resolve(f.home, 'held.yaml'), {
    repo: {
      sha,
      command: 'bun test',
      holder: 'hold',
      attempt: 'a1',
      at: '2026-10-10T00:00:00.000Z',
      evidence: '/x/review-B.md',
    },
  });
}

test('status marks the held repo beside its heading, alone and with paused, until unhold', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    hold(f);
    const held: Result = await cli(f, ['status']);
    expect(held.code).toBe(0);
    expect(heading(held.stdout, 'repo')).toContain('(held)');
    expect(heading(held.stdout, 'repo')).not.toContain('(paused)');
    const charts: Result = await cli(f, ['status', '--charts']);
    expect(charts.code).toBe(0);
    expect(heading(charts.stdout, 'repo')).toContain('(held)');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const both: Result = await cli(f, ['status']);
    expect(both.code).toBe(0);
    expect(heading(both.stdout, 'repo')).toContain('(paused) (held)');
    expect((await cli(f, ['unhold'])).code).toBe(0);
    const after: Result = await cli(f, ['status']);
    expect(after.code).toBe(0);
    expect(heading(after.stdout, 'repo')).toContain('(paused)');
    expect(heading(after.stdout, 'repo')).not.toContain('held');
  } finally {
    f.clean();
  }
});

test('unpause prints the hold after unpausing a held repo', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const plain: Result = await cli(f, ['unpause']);
    expect(plain.code).toBe(0);
    expect(plain.stdout).toContain('unpaused');
    expect(plain.stdout).not.toContain('held');
    hold(f, '89abcdef0123456789abcdef0123456789abcdef');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause']);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('unpaused');
    expect(run.stdout).toContain('held repo on 89abcdef0123456789abcdef0123456789abcdef: bun test');
  } finally {
    f.clean();
  }
});

test('targeted status prints the held line while the repo is held', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const before: Result = await cli(f, ['status', 'build']);
    expect(before.code).toBe(0);
    expect(before.stdout).not.toContain('held:');
    hold(f);
    const run: Result = await cli(f, ['status', 'build']);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('held: 0123456789abcdef0123456789abcdef01234567 bun test');
    expect((await cli(f, ['unhold'])).code).toBe(0);
    const after: Result = await cli(f, ['status', 'build']);
    expect(after.code).toBe(0);
    expect(after.stdout).not.toContain('held:');
  } finally {
    f.clean();
  }
});

test('invalid held file fails status naming the file', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const file: string = resolve(f.home, 'held.yaml');
    writeFileSync(file, '["just", "a", "list"]\n');
    const board: Result = await cli(f, ['status']);
    expect(board.code).not.toBe(0);
    expect(board.stderr).toContain(file);
    const targeted: Result = await cli(f, ['status', 'build']);
    expect(targeted.code).not.toBe(0);
    expect(targeted.stderr).toContain(file);
  } finally {
    f.clean();
  }
});

test('invalid pause file fails status naming the file', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const file: string = resolve(f.home, 'paused.yaml');
    writeFileSync(file, '["not", "a", "map"]\n');
    const board: Result = await cli(f, ['status']);
    expect(board.code).not.toBe(0);
    expect(board.stderr).toContain(file);
    const targeted: Result = await cli(f, ['status', 'build']);
    expect(targeted.code).not.toBe(0);
    expect(targeted.stderr).toContain(file);
  } finally {
    f.clean();
  }
});
