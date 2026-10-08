import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fixture, cli, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';

function pausedFile(f: Fixture): string {
  return resolve(f.home, 'paused.yaml');
}

function pausedKeys(f: Fixture): string[] {
  return Object.keys(Bun.YAML.parse(readFileSync(pausedFile(f), 'utf8')) as Record<string, unknown>);
}

test('pause and unpause record repo state from root, idempotent', async () => {
  const f: Fixture = await fixture();
  try {
    expect(existsSync(pausedFile(f))).toBe(false);
    const first: Result = await cli(f, ['pause']);
    expect(first.code).toBe(0);
    expect(first.stdout).toContain('repo');
    expect(first.stdout).toContain('paused');
    expect(pausedKeys(f)).toEqual(['repo']);
    const repeat: Result = await cli(f, ['pause']);
    expect(repeat.code).toBe(0);
    expect(repeat.stdout).toContain('repo');
    expect(repeat.stdout).toContain('paused');
    expect(pausedKeys(f)).toEqual(['repo']);
    const clear: Result = await cli(f, ['unpause']);
    expect(clear.code).toBe(0);
    expect(clear.stdout).toContain('repo');
    expect(clear.stdout).toContain('unpaused');
    expect(pausedKeys(f)).toEqual([]);
    const clearRepeat: Result = await cli(f, ['unpause']);
    expect(clearRepeat.code).toBe(0);
    expect(pausedKeys(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('pause resolves the repo from a subfolder and a leaf worktree', async () => {
  const f: Fixture = await fixture();
  try {
    const sub: string = resolve(f.root, 'sub');
    mkdirSync(sub);
    expect((await cli(f, ['pause'], sub)).code).toBe(0);
    expect(pausedKeys(f)).toEqual(['repo']);
    expect((await cli(f, ['unpause'], sub)).code).toBe(0);
    expect(pausedKeys(f)).toEqual([]);
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'wt-leaf', worktree], f.root);
    const fromWorktree: Result = await cli(f, ['pause'], worktree);
    expect(fromWorktree.code).toBe(0);
    expect(fromWorktree.stdout).toContain('repo');
    expect(pausedKeys(f)).toEqual(['repo']);
    expect((await cli(f, ['unpause'], worktree)).code).toBe(0);
    expect(pausedKeys(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('pause and unpause refuse folders outside every registered repo', async () => {
  const f: Fixture = await fixture();
  const outside: string = mkdtempSync(resolve(tmpdir(), 'akrogon-outside-'));
  try {
    const paused: Result = await cli(f, ['pause'], outside);
    expect(paused.code).not.toBe(0);
    expect(paused.stderr).toContain('No initialized registered checkout');
    const unpaused: Result = await cli(f, ['unpause'], outside);
    expect(unpaused.code).not.toBe(0);
    expect(unpaused.stderr).toContain('No initialized registered checkout');
    expect(existsSync(pausedFile(f))).toBe(false);
  } finally {
    rmSync(outside, { recursive: true, force: true });
    f.clean();
  }
});

test('missing pause file means nothing paused, invalid file fails naming the path', async () => {
  const f: Fixture = await fixture();
  try {
    const clear: Result = await cli(f, ['unpause']);
    expect(clear.code).toBe(0);
    expect(clear.stdout).toContain('unpaused');
    for (const body of ['not: [valid', '["just", "a", "list"]', '{ repo: false }', 'null']) {
      writeFileSync(pausedFile(f), body + '\n');
      const paused: Result = await cli(f, ['pause']);
      expect(paused.code).not.toBe(0);
      expect(paused.stderr).toContain(pausedFile(f));
      const unpaused: Result = await cli(f, ['unpause']);
      expect(unpaused.code).not.toBe(0);
      expect(unpaused.stderr).toContain(pausedFile(f));
    }
  } finally {
    f.clean();
  }
});
