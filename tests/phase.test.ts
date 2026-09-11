import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fixture, cli, leaf, yaml, type Fixture } from './helpers';
import { readState } from '../src/state';
import { command, type Result } from '../src/shell';

function bytes(path: string): string {
  return readFileSync(resolve(path, 'state.yaml'), 'utf8');
}
test('real same-slot and different-slot races record once and refuse stale moves unchanged', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'race', 'plan.positions');
    const same: Result[] = await Promise.all([
      cli(f, ['phase', 'race', 'plan.rebuttal', '--slot', 'A']),
      cli(f, ['phase', 'race', 'plan.rebuttal', '--slot', 'A']),
    ]);
    expect(same.map((r) => r.code).sort()).toEqual([0, 1]);
    expect(readState(path).done).toEqual(['A']);
    const before: string = bytes(path);
    expect((await cli(f, ['phase', 'race', 'merge', '--slot', 'B'])).code).not.toBe(0);
    expect(bytes(path)).toBe(before);
    expect((await cli(f, ['phase', 'race', 'plan.rebuttal', '--slot', 'B'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.rebuttal');
    const moved: string = bytes(path);
    expect((await cli(f, ['phase', 'race', 'plan.rebuttal', '--slot', 'B'])).code).not.toBe(0);
    expect(bytes(path)).toBe(moved);
    const other: string = leaf(f, 'other', 'plan.positions');
    const different: Result[] = await Promise.all(
      ['A', 'B'].map((slot) => cli(f, ['phase', 'other', 'plan.rebuttal', '--slot', slot])),
    );
    expect(different.every((r) => r.code === 0)).toBe(true);
    expect(different.filter((r) => r.stdout === 'moved plan.rebuttal')).toHaveLength(1);
    expect(readState(other)).toMatchObject({ phase: 'plan.rebuttal', done: [], attempts: { A: 0, B: 0 } });
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n')).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('review aggregates verdicts, rechecks only A, caps repairs and permits operator restart', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 1 });
    const path: string = leaf(f, 'repair', 'check.review');
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A', '--verdict', 'nits'])).stdout).toBe('recorded');
    expect((await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'B', '--verdict', 'fix'])).stdout).toBe(
      'moved check.fix',
    );
    expect(readState(path).fix_rounds).toBe(1);
    expect((await cli(f, ['phase', 'repair', 'check.review'])).code).toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'B', '--verdict', 'ready'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'A', '--verdict', 'fix'])).stdout).toBe(
      'moved failed',
    );
    expect((await cli(f, ['phase', 'repair', 'implement'])).code).toBe(0);
    expect(readState(path)).toMatchObject({ phase: 'implement', fix_rounds: 0 });
    const mergePath: string = leaf(f, 'conflict', 'merge');
    expect((await cli(f, ['phase', 'conflict', 'check.fix'])).code).toBe(0);
    expect(readState(mergePath).fix_rounds).toBe(1);
    const log = JSON.parse(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').split('\n')[0]);
    expect(log).toMatchObject({
      from: 'check.review',
      to: 'check.fix',
      slot: 'B',
      verdict: { A: 'nits', B: 'fix' },
      fix_rounds: 1,
      session: null,
    });
    expect(Object.keys(log).sort()).toEqual(
      [
        'ts',
        'repo',
        'slug',
        'from',
        'to',
        'slot',
        'attempts',
        'fix_rounds',
        'verdict',
        'head',
        'diff',
        'session',
      ].sort(),
    );
  } finally {
    f.clean();
  }
});

test('handoff to review refuses a dirty worktree and passes once committed', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'dirty', worktree], f.root);
    const path: string = leaf(f, 'dirty', 'implement', { worktree });
    writeFileSync(resolve(worktree, 'work'), 'done\n');
    const refused: Result = await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'B']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('Uncommitted work');
    expect(readState(path).phase).toBe('implement');
    await command(['git', 'add', 'work'], worktree);
    await command(['git', 'commit', '-m', 'work'], worktree);
    expect((await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'B'])).code).toBe(0);
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('completion reports each issue once, moves only finished containers, and refuses repeated merged', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'one', 'merge', {}, 'epic/first');
    leaf(f, 'two', 'merge', {}, 'epic/first');
    leaf(f, 'three', 'merge', {}, 'epic/second');
    const race: Result[] = await Promise.all(['one', 'two'].map((slug) => cli(f, ['phase', slug, 'merged'])));
    expect(race.every((r) => r.code === 0)).toBe(true);
    expect(race.filter((r) => r.stdout.includes('issue complete first'))).toHaveLength(1);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
    expect((await cli(f, ['phase', 'three', 'merged'])).stdout).toContain('issue complete second');
    expect(existsSync(resolve(f.root, 'issues/closed/epic/first/one/state.yaml'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(false);
    expect((await cli(f, ['phase', 'three', 'merged'])).code).not.toBe(0);
    leaf(f, 'single', 'merge', {}, 'standalone');
    expect((await cli(f, ['phase', 'single', 'merged'])).stdout).toContain('issue complete standalone');
    expect(existsSync(resolve(f.root, 'issues/closed/standalone/single/state.yaml'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('failed log preserves committed state and failed container rename retries without replay', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'log-error', 'plan.synthesis');
    mkdirSync(resolve(f.root, 'issues/log.jsonl'));
    expect((await cli(f, ['phase', 'log-error', 'implement'])).code).not.toBe(0);
    expect(readState(path).phase).toBe('implement');
    const before: string = bytes(path);
    expect((await cli(f, ['phase', 'log-error', 'implement'])).code).not.toBe(0);
    expect(bytes(path)).toBe(before);
    rmSync(resolve(f.root, 'issues/log.jsonl'), { recursive: true });
    leaf(f, 'close-error', 'merge', {}, 'closing');
    mkdirSync(resolve(f.root, 'issues/closed/closing'), { recursive: true });
    expect((await cli(f, ['phase', 'close-error', 'merged'])).code).not.toBe(0);
    rmSync(resolve(f.root, 'issues/closed/closing'), { recursive: true });
    const retried: Result = await cli(f, ['phase', 'close-error', 'merged']);
    expect(retried.stdout).not.toContain('issue complete');
    expect(existsSync(resolve(f.root, 'issues/closed/closing/close-error/state.yaml'))).toBe(true);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n')).toHaveLength(1);
  } finally {
    f.clean();
  }
});
