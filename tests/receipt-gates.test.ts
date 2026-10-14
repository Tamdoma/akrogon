import { test, expect } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeHerdr, fixture, greenReceipt, leaf, type Fixture } from './helpers';
import { readState, saveState, type Batch } from '../src/state';
import { command, spawnCaptured, type Result } from '../src/shell';

const stale: { name: string; command: string }[] = [{ name: 'test', command: 'bun test --old' }];

async function branch(f: Fixture, slug: string): Promise<{ worktree: string; head: string }> {
  const worktree: string = resolve(f.home, slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree], f.root);
  writeFileSync(resolve(worktree, 'code.ts'), 'x\n');
  await command(['git', 'add', 'code.ts'], worktree);
  await command(['git', 'commit', '-m', 'code'], worktree);
  return { worktree, head: await command(['git', 'rev-parse', 'HEAD'], worktree) };
}

test('a move into check.review needs a green leaf receipt for HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'gated');
    const path: string = leaf(f, 'gated', 'implement', { worktree });
    const move: string[] = ['phase', 'gated', 'check.review', '--slot', 'A'];
    const missing: Result = await cli(f, move);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green leaf verify receipt for ${head}`);
    greenReceipt(f, head, 'leaf', stale);
    const mismatched: Result = await cli(f, move);
    expect(mismatched.code).not.toBe(0);
    expect(mismatched.stderr).toContain('No green leaf verify receipt');
    expect(readState(path).phase).toBe('implement');
    greenReceipt(f, head, 'leaf');
    expect((await cli(f, move)).code).toBe(0);
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('merged --check stamps tested_top only with a green merge receipt for HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'landing');
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const path: string = leaf(f, 'landing', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' });
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: builtOn, head },
      applied: true,
      solo: true,
      members: [],
    };
    saveState(path, { ...readState(path), batch: record });
    const herdr: { env: NodeJS.ProcessEnv } = fakeHerdr(f);
    const check: string[] = ['phase', 'landing', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'];
    const missing: Result = await cli(f, check, f.root, herdr.env);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green merge verify receipt for ${head}`);
    greenReceipt(f, head, 'merge', stale);
    const mismatched: Result = await cli(f, check, f.root, herdr.env);
    expect(mismatched.code).not.toBe(0);
    expect(readState(path).batch?.tested_top).toBeUndefined();
    greenReceipt(f, head, 'merge');
    expect((await cli(f, check, f.root, herdr.env)).code).toBe(0);
    expect(readState(path).batch?.tested_top).toBe(head);
  } finally {
    f.clean();
  }
});

test('direct guards need a green merge receipt for the worktree HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'direct');
    const run = async (): Promise<Result> =>
      spawnCaptured(
        [
          process.execPath,
          resolve(import.meta.dir, '../skills/chart-issues/scripts/direct-guards.ts'),
          worktree,
          'repo',
          resolve(f.home, 'chart'),
        ],
        { env: { ...process.env, AKROGON_HOME: f.home } },
      );
    const missing: Result = await run();
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green merge verify receipt for ${head}`);
    greenReceipt(f, head, 'merge', stale);
    expect((await run()).code).not.toBe(0);
    greenReceipt(f, head, 'merge');
    const passed: Result = await run();
    expect(passed.stderr).toBe('');
    expect(passed.code).toBe(0);
  } finally {
    f.clean();
  }
});
