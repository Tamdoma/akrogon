import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {
  fixture,
  cli,
  leaf,
  yaml,
  fakeGh,
  fakeHerdr,
  type GhFixture,
  type HerdrFixture,
  type Fixture,
} from './helpers';
import { readState, saveState, type Failure } from '../src/state';
import { command, type Result } from '../src/shell';
import type { GhStep } from './fake-gh';
import { z } from 'zod';

function bytes(path: string): string {
  return readFileSync(resolve(path, 'state.yaml'), 'utf8');
}
function herdrCalls(db: string): string[][] {
  const callsPath: string = db + '.calls';
  return existsSync(callsPath)
    ? readFileSync(callsPath, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    : [];
}
const seatRefusal: string =
  'Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved.';
test('valid phase transition rejects a mismatched repo key without changing state or history', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    const before: string = bytes(path);
    const history: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(history, '');
    const result: Result = await cli(f, ['phase', 'wrong-key', 'implement', '--slot', 'A']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(path);
    expect(result.stderr).toMatch(/stored[^\n]*other/i);
    expect(result.stderr).toMatch(/registered[^\n]*repo/i);
    expect(bytes(path)).toBe(before);
    expect(readFileSync(history, 'utf8')).toBe('');
  } finally {
    f.clean();
  }
});

test('real same-slot and different-slot races record once and refuse stale moves unchanged', async () => {
  const f: Fixture = await fixture();
  try {
    const stamp: string = '2026-09-11T12:00:00.000Z';
    const path: string = leaf(f, 'race', 'plan.positions', {
      busy_since: { A: stamp },
      busy_notified: { A: stamp },
    });
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
    expect(readState(path)).toMatchObject({
      phase: 'plan.rebuttal',
      busy_since: { A: stamp },
      busy_notified: { A: stamp },
    });
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

test('review fix routes to check.repair, B hands to A, rechecks only B, caps handoffs and permits operator restart', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 1, grounding: 'none' });
    const path: string = leaf(f, 'repair', 'check.review');
    const herdr = fakeHerdr(f);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A', '--verdict', 'nits'])).stdout).toBe('recorded');
    expect((await cli(f, ['phase', 'repair', 'check.repair', '--slot', 'B', '--verdict', 'fix'])).stdout).toBe(
      'moved check.repair',
    );
    expect(readState(path).fix_rounds).toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'B'])).stdout).toBe('moved check.fix');
    expect(readState(path).fix_rounds).toBe(1);
    expect((await cli(f, ['phase', 'repair', 'check.review'])).code).toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A', '--verdict', 'ready'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'check.repair', '--slot', 'B', '--verdict', 'fix'])).stdout).toBe(
      'moved check.repair',
    );
    expect(readState(path).fix_rounds).toBe(1);
    expect((await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'B'], f.root, herdr.env)).stdout).toBe(
      'moved failed',
    );
    expect(readState(path)).toMatchObject({
      failure: { cause: 'attempts', phase: 'check.repair', slot: 'B', reason: 'fix rounds exhausted' },
      fix_rounds: 1,
    });
    expect((await cli(f, ['phase', 'repair', 'implement'], f.root, herdr.env)).code).toBe(0);
    expect(readState(path)).toMatchObject({ phase: 'implement', fix_rounds: 1 });
    const mergePath: string = leaf(f, 'conflict', 'merge');
    expect((await cli(f, ['phase', 'conflict', 'check.fix'])).code).toBe(0);
    expect(readState(mergePath).fix_rounds).toBe(0);
    const cappedPath: string = leaf(f, 'capped', 'merge', { fix_rounds: 1 });
    expect((await cli(f, ['phase', 'capped', 'check.fix'])).stdout).toBe('moved check.fix');
    expect(readState(cappedPath)).toMatchObject({ phase: 'check.fix', fix_rounds: 1 });
    const log = JSON.parse(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').split('\n')[0]);
    expect(log).toMatchObject({
      from: 'check.review',
      to: 'check.repair',
      slot: 'B',
      verdict: { A: 'nits', B: 'fix' },
      fix_rounds: 0,
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

test('a failed move logs the state failure object while a moved record omits failure and prints in status', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const path: string = leaf(f, 'log-failure', 'plan.synthesis');
    const moved: Result = await cli(f, ['phase', 'log-failure', 'implement', '--slot', 'A']);
    expect(moved.stdout).toBe('moved implement');
    const history: string = resolve(f.root, 'issues/log.jsonl');
    const lines: string[] = readFileSync(history, 'utf8').trim().split('\n');
    const movedRecord = JSON.parse(lines[0]);
    expect(movedRecord).toMatchObject({ from: 'plan.synthesis', to: 'implement' });
    expect('failure' in movedRecord).toBe(false);
    const status: Result = await cli(f, ['status', 'log-failure']);
    expect(status.code).toBe(0);
    expect(status.stdout).toContain('History:');
    expect(status.stdout).toContain(lines[0]);
    const failed: Result = await cli(
      f,
      ['phase', 'log-failure', 'failed', '--slot', 'A', '--reason', 'seats disagree'],
      f.root,
      herdr.env,
    );
    expect(failed.stdout).toBe('moved failed');
    const failedRecord = JSON.parse(readFileSync(history, 'utf8').trim().split('\n')[1]);
    expect(failedRecord).toMatchObject({ from: 'implement', to: 'failed' });
    expect(failedRecord.failure).toEqual(readState(path).failure);
    expect(failedRecord.failure).toMatchObject({
      cause: 'blocked',
      phase: 'implement',
      slot: 'A',
      reason: 'seats disagree',
    });
  } finally {
    f.clean();
  }
});

test('handoff to review refuses a dirty worktree at every move and issue files on the branch, then passes', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'dirty', worktree], f.root);
    const path: string = leaf(f, 'dirty', 'implement', { worktree });
    writeFileSync(resolve(worktree, 'work'), 'done\n');
    const refused: Result = await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'A']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('Uncommitted work');
    expect(readState(path).phase).toBe('implement');
    await command(['git', 'add', 'work'], worktree);
    await command(['git', 'commit', '-m', 'work'], worktree);
    mkdirSync(resolve(worktree, 'issues/open/issue/dirty'), { recursive: true });
    writeFileSync(resolve(worktree, 'issues/open/issue/dirty/review-B.md'), 'stray artifact\n');
    await command(['git', 'add', 'issues'], worktree);
    await command(['git', 'commit', '-m', 'artifact on branch'], worktree);
    const artifacts: Result = await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'A']);
    expect(artifacts.code).not.toBe(0);
    expect(artifacts.stderr).toContain('Issue files on leaf branch');
    expect(readState(path).phase).toBe('implement');
    await command(['git', 'reset', '--hard', 'HEAD~1'], worktree);
    expect((await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'A'])).code).toBe(0);
    expect(readState(path).phase).toBe('check.review');
    writeFileSync(resolve(worktree, 'lesson'), 'late\n');
    const late: Result = await cli(f, ['phase', 'dirty', 'merge', '--slot', 'A', '--verdict', 'ready']);
    expect(late.code).not.toBe(0);
    expect(late.stderr).toContain('Uncommitted work');
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('completion prints only when the owner finishes, stays silent on inner issues and retries', async () => {
  const f: Fixture = await fixture();
  try {
    // merge_stamp fixes the queue order the dropped Promise.all race relied on; the
    // one-holder-per-repo rule requires sequential merges.
    leaf(f, 'one', 'merge', { merge_stamp: '2026-10-05T20:00:00Z', solo: true }, 'epic/first');
    leaf(f, 'two', 'merge', { merge_stamp: '2026-10-05T20:00:01Z', solo: true }, 'epic/first');
    leaf(f, 'three', 'merge', { merge_stamp: '2026-10-05T20:00:02Z', solo: true }, 'epic/second');
    mkdirSync(resolve(f.root, 'issues/chart/epic'), { recursive: true });
    writeFileSync(resolve(f.root, 'issues/chart/epic/CHART.md'), '# Chart: epic\n');
    const race: Result[] = [];
    for (const slug of ['one', 'two']) race.push(await cli(f, ['phase', slug, 'merged']));
    expect(race.every((r) => r.code === 0)).toBe(true);
    for (const r of race) {
      expect(r.stdout).not.toContain('issue complete');
      expect(r.stdout).not.toContain('epic complete');
    }
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
    const final: Result = await cli(f, ['phase', 'three', 'merged']);
    expect(final.code).toBe(0);
    expect(final.stdout.split('\n').filter((line) => line.includes('complete'))).toEqual(['epic complete epic']);
    expect(existsSync(resolve(f.root, 'issues/closed/epic/first/one/state.yaml'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/chart/epic/CHART.md'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/closed/epic/chart'))).toBe(false);
    const repeated: Result = await cli(f, ['phase', 'three', 'merged']);
    expect(repeated.code).not.toBe(0);
    expect(repeated.stdout).not.toContain('complete');
    leaf(f, 'penultimate', 'merge', { merge_stamp: '2026-10-05T20:00:03Z', solo: true }, 'standalone');
    leaf(f, 'last', 'merge', { merge_stamp: '2026-10-05T20:00:04Z', solo: true }, 'standalone');
    const standalone: Result[] = [];
    for (const slug of ['penultimate', 'last']) standalone.push(await cli(f, ['phase', slug, 'merged']));
    expect(standalone.every((r) => r.code === 0)).toBe(true);
    expect(standalone.flatMap((r) => r.stdout.split('\n')).filter((line) => line.includes('complete'))).toEqual([
      'issue complete standalone',
    ]);
    expect(existsSync(resolve(f.root, 'issues/closed/standalone/last/state.yaml'))).toBe(true);
  } finally {
    f.clean();
  }
});

function snapshot(dir: string, prefix: string = ''): Map<string, Buffer> {
  return new Map(
    readdirSync(dir).flatMap((entry): [string, Buffer][] => {
      const path: string = resolve(dir, entry);
      const name: string = prefix === '' ? entry : `${prefix}/${entry}`;
      return statSync(path).isDirectory() ? [...snapshot(path, name)] : [[name, readFileSync(path)]];
    }),
  );
}

test('completion leaves a chart holding a same-slug draft in place and keeps the inventory readable', async () => {
  const f: Fixture = await fixture();
  try {
    const alpha: string = leaf(f, 'alpha', 'merge', { solo: true }, 'epic/one');
    leaf(f, 'beta', 'merge', { solo: true }, 'epic/two');
    const chart: string = resolve(f.root, 'issues/chart/epic');
    const slot: string = resolve(chart, 'slots/leaf-draft/alpha');
    mkdirSync(slot, { recursive: true });
    writeFileSync(resolve(chart, 'CHART.md'), '# Chart: epic\n');
    writeFileSync(resolve(slot, 'state.yaml'), readFileSync(resolve(alpha, 'state.yaml')));
    const before: Map<string, Buffer> = snapshot(chart);
    for (const slug of ['alpha', 'beta']) expect((await cli(f, ['phase', slug, 'merged'])).code).toBe(0);
    expect(snapshot(chart)).toEqual(before);
    const all: Result = await cli(f, ['next', '--all'], f.root, fakeHerdr(f).env);
    expect(all.code).toBe(0);
    expect(all.stderr).not.toContain('Invalid leaf depth');
    expect(all.stderr).not.toContain('Duplicate leaf slug');
    expect((await cli(f, ['status', 'alpha'])).code).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('failed log preserves committed state and failed container rename retries without replay', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'log-error', 'plan.synthesis');
    mkdirSync(resolve(f.root, 'issues/log.jsonl'));
    const failed: Result = await cli(f, ['phase', 'log-error', 'implement']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('implement');
    expect(failed.stderr).toContain('committed');
    expect(failed.stderr).toContain('log append failed');
    expect(failed.stderr).toContain('EISDIR');
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
    expect(retried.stdout).not.toContain('epic complete');
    expect(existsSync(resolve(f.root, 'issues/closed/closing/close-error/state.yaml'))).toBe(true);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('failed log diagnostics report committed state without replay', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'diagnostic-error', 'plan.synthesis');
    yaml(resolve(f.root, 'issues/config.yaml'), { default_branch: 'missing-base', grounding: 'none' });
    const failed: Result = await cli(f, ['phase', 'diagnostic-error', 'implement']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('implement');
    expect(failed.stderr).toContain('committed');
    expect(failed.stderr).toContain('log append failed');
    expect(failed.stderr).toContain('merge-base');
    expect(failed.stderr).toContain('origin/missing-base');
    expect(failed.stderr).toContain('Not a valid object name');
    expect(readState(path).phase).toBe('implement');
    const before: string = bytes(path);
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none' });
    const retried: Result = await cli(f, ['phase', 'diagnostic-error', 'implement']);
    expect(retried.code).not.toBe(0);
    expect(retried.stderr).toContain('Illegal move');
    expect(bytes(path)).toBe(before);
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
  } finally {
    f.clean();
  }
});

async function sourceWorktree(f: Fixture, name: string): Promise<string> {
  const worktree: string = resolve(f.home, name);
  await command(['git', 'worktree', 'add', '-b', name, worktree], f.root);
  writeFileSync(resolve(worktree, name), name);
  await command(['git', 'add', name], worktree);
  await command(['git', 'commit', '-m', name], worktree);
  return worktree;
}

test('asymmetric and empty leaf sources defer until epic completion under open locks', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const first: string = await sourceWorktree(f, 'earlier');
    const last: string = await sourceWorktree(f, 'trigger');
    const head: string = await command(['git', 'rev-parse', 'HEAD'], last);
    expect(head).not.toBe(await command(['git', 'rev-parse', 'HEAD'], f.root));
    expect(head).not.toBe(await command(['git', 'rev-parse', 'HEAD'], first));
    leaf(
      f,
      'one',
      'merge',
      { worktree: first, sources: ['team/project#1', 'team/project#2'], solo: true },
      'epic/first',
    );
    leaf(f, 'empty', 'merged', {}, 'epic/first');
    leaf(
      f,
      'two',
      'merge',
      { worktree: last, sources: ['team/project#2', 'team/project#3'], solo: true },
      'epic/second',
    );
    expect((await cli(f, ['phase', 'one', 'merged'], f.root, gh.env)).code).toBe(0);
    expect(existsSync(gh.db + '.calls')).toBe(false);
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/epic'),
      closed: resolve(f.root, 'issues/closed/epic'),
      lock: resolve(f.home, '.lock'),
      worktree: last,
    };
    writeFileSync(
      gh.db,
      JSON.stringify(
        [1, 2, 3].flatMap((): GhStep[] => [
          { stdout: '{"state":"OPEN"}', probe },
          { stdout: '', probe },
        ]),
      ),
    );
    const result: Result = await cli(f, ['phase', 'two', 'merged'], f.root, {
      ...gh.env,
      GH_HOST: 'elsewhere.invalid',
      GH_REPO: 'elsewhere/other',
    });
    expect(result).toMatchObject({ code: 0 });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(6);
    const calls: { args: string[]; cwd: string }[] = readFileSync(gh.db + '.calls', 'utf8')
      .trim()
      .split('\n')
      .map((line) => z.object({ args: z.array(z.string()), cwd: z.string() }).parse(JSON.parse(line)));
    expect(
      calls
        .filter((call) => call.args[1] === 'close')
        .map((call) => call.args)
        .sort(),
    ).toEqual([1, 2, 3].map((n) => ['issue', 'close', '-R', 'team/project', String(n), '--comment', `merged ${head}`]));
    expect(
      calls
        .filter((call) => call.args[1] === 'view')
        .map((call) => call.args)
        .sort(),
    ).toEqual([1, 2, 3].map((n) => ['issue', 'view', '-R', 'team/project', String(n), '--json', 'state']));
    expect(calls.every((call) => call.cwd === f.root)).toBe(true);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.object({ host: z.string() }).parse(JSON.parse(line)).host),
    ).toEqual(Array(6).fill('github.com'));
  } finally {
    f.clean();
  }
});

test('source retries recheck state, skip CLOSED, and continue after final failures without moving', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const worktree: string = await sourceWorktree(f, 'source');
    const sources: string[] = [
      'team/project#1',
      'team/project#2',
      'team/project#3',
      'team/project#4',
      'team/project#5',
      'team/project#6',
      'team/project#8',
      'team/project#7',
    ];
    leaf(f, 'source', 'merge', { worktree, sources });
    const view = (n: number, stdout: string = '{"state":"OPEN"}', code: number = 0): GhStep => ({
      args: ['issue', 'view', '-R', 'team/project', String(n), '--json', 'state'],
      stdout,
      code,
      stderr: code ? 'view failure' : '',
    });
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const close = (n: number, code: number = 0): GhStep => ({
      args: ['issue', 'close', '-R', 'team/project', String(n), '--comment', `merged ${head}`],
      stdout: '',
      code,
      stderr: code ? 'close failure' : '',
    });
    writeFileSync(
      gh.db,
      JSON.stringify([
        view(1, '{"state":"CLOSED"}'),
        view(2),
        close(2, 1),
        view(2),
        { stdout: JSON.stringify([[{ body: `merged ${head} extra` }]]) },
        close(2),
        view(3),
        close(3, 1),
        view(3, '{"state":"CLOSED"}'),
        view(4),
        close(4, 1),
        view(4),
        { stdout: '[[]]' },
        close(4, 1),
        view(5, '', 1),
        view(5, '', 1),
        view(6, '{"state":"INVALID"}'),
        view(8, '{malformed-json'),
        view(7),
        close(7),
      ]),
    );
    const result: Result = await cli(f, ['phase', 'source', 'merged'], f.root, gh.env);
    expect(result.code).not.toBe(0);
    const warnings: { warning?: string; source: string; code?: number }[] = result.stderr
      .split('\n')
      .filter((line) => /^\s*\{.*\}\s*$/.test(line))
      .map((line) =>
        z
          .object({ warning: z.string().optional(), source: z.string(), code: z.number().optional() })
          .parse(JSON.parse(line)),
      )
      .filter((item) => item.warning !== undefined);
    expect(warnings).toHaveLength(4);
    expect(warnings).toEqual(
      [2, 3, 4, 5].map((n) => ({ warning: expect.any(String), source: `team/project#${n}`, code: 1 })),
    );
    expect(result.stderr).toContain('close failure');
    expect(result.stderr).toContain('view failure');
    expect(result.stderr).toContain('malformed');
    expect(result.stderr).toContain('INVALID');
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(readState(resolve(f.root, 'issues/open/issue/source')).phase).toBe('merged');
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"merged"');
    expect(result.stdout).not.toContain('issue complete');
    expect(existsSync(resolve(f.root, 'issues/closed/issue'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('sourced completion without worktree context fails before rename without a fabricated commit', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    leaf(f, 'missing', 'merge', { sources: ['team/project#1'] });
    const result: Result = await cli(f, ['phase', 'missing', 'merged'], f.root, gh.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('worktree');
    expect(readState(resolve(f.root, 'issues/open/issue/missing')).phase).toBe('merged');
    expect(existsSync(gh.db + '.calls')).toBe(false);
  } finally {
    f.clean();
  }
});

test('partial commented close success retries without duplicating a merged comment on a later page', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const worktree: string = await sourceWorktree(f, 'partial');
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    leaf(f, 'partial', 'merge', { worktree, sources: ['team/project#1'] });
    const comments: string[] = Array.from({ length: 100 }, (_, i) => `earlier ${i}`);
    writeFileSync(gh.db + '.state', JSON.stringify({ state: 'OPEN', comments, attempts: 0 }));
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '', stateful: true },
        { stdout: '', stateful: true, code: 1, stderr: 'close failed after comment' },
        { stdout: '', stateful: true },
        { stdout: '', stateful: true },
        { stdout: '', stateful: true },
      ]),
    );
    const result: Result = await cli(f, ['phase', 'partial', 'merged'], f.root, gh.env);
    expect(result.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db + '.state', 'utf8'))).toEqual({
      state: 'CLOSED',
      comments: [...comments, `merged ${head}`],
      attempts: 2,
    });
    expect(JSON.parse(result.stderr)).toMatchObject({ warning: expect.any(String), source: 'team/project#1', code: 1 });
    expect(readState(resolve(f.root, 'issues/closed/issue/partial')).phase).toBe('merged');
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    const calls: string[][] = readFileSync(gh.db + '.calls', 'utf8')
      .trim()
      .split('\n')
      .map((line) => z.object({ args: z.array(z.string()) }).parse(JSON.parse(line)).args);
    expect(calls).toEqual([
      ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'],
      ['issue', 'close', '-R', 'team/project', '1', '--comment', `merged ${head}`],
      ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'],
      ['api', '--hostname', 'github.com', 'repos/team/project/issues/1/comments?per_page=100', '--paginate', '--slurp'],
      ['issue', 'close', '-R', 'team/project', '1'],
    ]);
  } finally {
    f.clean();
  }
});

test('failed or malformed retry comment listing prevents another close and continues later sources', async () => {
  for (const listing of [
    { stdout: '[[', stderr: 'comment page failed', code: 2 },
    { stdout: '{malformed-json', code: 0 },
    { stdout: '[[{"body":"merged PLACEHOLDER"}],[{"body":42}]]', code: 0 },
  ]) {
    const f: Fixture = await fixture();
    try {
      const gh: GhFixture = fakeGh(f);
      const worktree: string = await sourceWorktree(f, 'listing');
      const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
      leaf(f, 'listing', 'merge', { worktree, sources: ['team/project#1', 'team/project#2'] });
      const args: string[] = [
        'api',
        '--hostname',
        'github.com',
        'repos/team/project/issues/1/comments?per_page=100',
        '--paginate',
        '--slurp',
      ];
      const response: string = listing.stdout.replace('PLACEHOLDER', head);
      writeFileSync(
        gh.db,
        JSON.stringify([
          { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'] },
          { stdout: '', code: 1, args: ['issue', 'close', '-R', 'team/project', '1', '--comment', `merged ${head}`] },
          { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'] },
          { ...listing, stdout: response, args },
          { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'] },
          { stdout: '', args: ['issue', 'close', '-R', 'team/project', '2', '--comment', `merged ${head}`] },
        ]),
      );
      const result: Result = await cli(f, ['phase', 'listing', 'merged'], f.root, gh.env);
      expect(result.code).not.toBe(0);
      expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
      const messages: { source: string; warning?: string; error?: string }[] = result.stderr
        .split('\n')
        .filter((line) => /^\s*\{.*\}\s*$/.test(line))
        .map((line) =>
          z
            .object({ source: z.string(), warning: z.string().optional(), error: z.string().optional() })
            .parse(JSON.parse(line)),
        );
      expect(messages.filter((item) => item.warning !== undefined)).toHaveLength(1);
      const failure: { source: string; error: string } = z
        .object({ source: z.string(), error: z.string() })
        .parse(messages.find((item) => item.error !== undefined));
      expect(failure.source).toBe('team/project#1');
      expect(JSON.parse(failure.error)).toMatchObject({
        command: ['gh', ...args],
        cwd: f.root,
        ...(listing.code === 0 ? { response } : { code: 2, stdout: response, stderr: 'comment page failed' }),
      });
      expect(readState(resolve(f.root, 'issues/open/issue/listing')).phase).toBe('merged');
    } finally {
      f.clean();
    }
  }
});

test('each completed issue closes only its all-leaf private sources before the final epic closure', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const first: string = await sourceWorktree(f, 'first');
    const last: string = await sourceWorktree(f, 'last');
    const firstHead: string = await command(['git', 'rev-parse', 'HEAD'], first);
    const lastHead: string = await command(['git', 'rev-parse', 'HEAD'], last);
    for (const [name, worktree, privateSource] of [
      ['first', first, '2'],
      ['last', last, '3'],
    ]) {
      const sources: string[] = ['team/project#1', `team/project#${privateSource}`];
      leaf(f, `${name}-done`, 'merged', { sources }, `epic/${name}`);
      leaf(f, name, 'merge', { worktree, sources: [...sources, ...sources] }, `epic/${name}`);
    }
    const firstProbe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/epic'),
      closed: resolve(f.root, 'issues/closed/epic'),
      lock: resolve(f.home, '.lock'),
      worktree: first,
    };
    const lastProbe: NonNullable<GhStep['probe']> = {
      ...firstProbe,
      lock: resolve(f.home, '.lock'),
      worktree: last,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        {
          stdout: '{"state":"OPEN"}',
          args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'],
          probe: firstProbe,
        },
        {
          stdout: '',
          args: ['issue', 'close', '-R', 'team/project', '2', '--comment', `merged ${firstHead}`],
          probe: firstProbe,
        },
      ]),
    );
    const earlier: Result = await cli(f, ['phase', 'first', 'merged'], f.root, gh.env);
    expect(earlier.code).toBe(0);
    expect(earlier.stdout).not.toContain('issue complete');
    expect(earlier.stdout).not.toContain('epic complete');
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(firstProbe.open)).toBe(true);
    expect(existsSync(firstProbe.closed)).toBe(false);
    writeFileSync(
      gh.db,
      JSON.stringify([
        {
          stdout: '{"state":"OPEN"}',
          args: ['issue', 'view', '-R', 'team/project', '3', '--json', 'state'],
          probe: lastProbe,
        },
        {
          stdout: '',
          args: ['issue', 'close', '-R', 'team/project', '3', '--comment', `merged ${lastHead}`],
          probe: lastProbe,
        },
        {
          stdout: '{"state":"OPEN"}',
          args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'],
          probe: lastProbe,
        },
        {
          stdout: '',
          args: ['issue', 'close', '-R', 'team/project', '1', '--comment', `merged ${lastHead}`],
          probe: lastProbe,
        },
        {
          stdout: '{"state":"CLOSED"}',
          args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'],
          probe: lastProbe,
        },
      ]),
    );
    const final: Result = await cli(f, ['phase', 'last', 'merged'], f.root, gh.env);
    expect(final.code).toBe(0);
    expect(final.stdout.split('\n').filter((line) => line.includes('complete'))).toEqual(['epic complete epic']);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(firstProbe.open)).toBe(false);
    expect(existsSync(firstProbe.closed)).toBe(true);
  } finally {
    f.clean();
  }
});

for (const scope of ['standalone', 'epic'] as const) {
  test(`${scope} closure failure retries outstanding sources on next without replaying completion`, async () => {
    const f: Fixture = await fixture();
    try {
      const container: string = scope === 'epic' ? 'epic/final' : 'standalone';
      const owner: string = scope === 'epic' ? 'epic' : 'standalone';
      const worktree: string = await sourceWorktree(f, 'retry');
      const path: string = leaf(
        f,
        'retry',
        'merge',
        { worktree, sources: ['team/project#2', 'team/project#1'] },
        container,
      );
      const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
      if (scope === 'epic') leaf(f, 'earlier', 'merged', { sources: ['team/project#1'] }, 'epic/earlier');
      const chart: string = resolve(f.root, 'issues/chart', owner);
      mkdirSync(chart, { recursive: true });
      writeFileSync(resolve(chart, 'CHART.md'), 'chart');
      const gh: GhFixture = fakeGh(f);
      const probe: NonNullable<GhStep['probe']> = {
        open: resolve(f.root, 'issues/open', owner),
        closed: resolve(f.root, 'issues/closed', owner),
        lock: resolve(f.home, '.lock'),
        worktree,
      };
      writeFileSync(
        gh.db,
        JSON.stringify([
          { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'], probe },
          { stdout: '', args: ['issue', 'close', '-R', 'team/project', '2', '--comment', `merged ${head}`], probe },
          { stdout: '', code: 1, stderr: 'offline', probe },
          { stdout: '', code: 1, stderr: 'offline', probe },
        ]),
      );
      const failed: Result = await cli(f, ['phase', 'retry', 'merged'], f.root, gh.env);
      expect(failed.code).not.toBe(0);
      expect(failed.stdout).not.toContain('issue complete');
      expect(failed.stdout).not.toContain('epic complete');
      expect(failed.stderr).toContain('offline');
      expect(readState(path).phase).toBe('merged');
      expect(existsSync(chart)).toBe(true);
      expect(existsSync(probe.closed)).toBe(false);
      expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"merged"');
      writeFileSync(
        gh.db,
        JSON.stringify([
          {
            stdout: '{"state":"CLOSED"}',
            args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'],
            probe,
          },
          { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'], probe },
          { stdout: '', args: ['issue', 'close', '-R', 'team/project', '1', '--comment', `merged ${head}`], probe },
        ]),
      );
      const retried: Result = await cli(f, ['next', 'retry'], f.root, gh.env);
      expect(retried.code).toBe(0);
      expect(retried.stdout).not.toContain('issue complete');
      expect(retried.stdout).not.toContain('epic complete');
      expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
      expect(existsSync(probe.open)).toBe(false);
      expect(existsSync(resolve(chart, 'CHART.md'))).toBe(true);
      expect(existsSync(resolve(probe.closed, 'chart'))).toBe(false);
      expect((await cli(f, ['phase', 'retry', 'merged'], f.root, gh.env)).code).not.toBe(0);
      expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('standalone completion closes the union of asymmetric leaf sources', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const worktree: string = await sourceWorktree(f, 'union');
    leaf(f, 'earlier', 'merged', { sources: ['team/project#1'] });
    leaf(f, 'union', 'merge', { worktree, sources: ['team/project#2'] });
    writeFileSync(
      gh.db,
      JSON.stringify([{ stdout: '{"state":"OPEN"}' }, { stdout: '' }, { stdout: '{"state":"OPEN"}' }, { stdout: '' }]),
    );
    expect((await cli(f, ['phase', 'union', 'merged'], f.root, gh.env)).code).toBe(0);
    const calls: string[][] = readFileSync(gh.db + '.calls', 'utf8')
      .trim()
      .split('\n')
      .map((line) => z.object({ args: z.array(z.string()) }).parse(JSON.parse(line)).args);
    expect(
      calls
        .filter((args) => args[1] === 'close')
        .map((args) => args[4])
        .sort(),
    ).toEqual(['1', '2']);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(resolve(f.root, 'issues/closed/issue/union'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('invalid sources and empty worktree fail at load without state, log or gh changes', async () => {
  const cases: { slug: string; extra: object; field: string }[] = [
    { slug: 'bad-source', extra: { sources: ['malformed'] }, field: 'sources' },
    { slug: 'empty-worktree', extra: { worktree: '' }, field: 'worktree' },
  ];
  for (const item of cases) {
    const f: Fixture = await fixture();
    try {
      const gh: GhFixture = fakeGh(f);
      const path: string = leaf(f, item.slug, 'plan.synthesis', item.extra);
      const before: string = bytes(path);
      const result: Result = await cli(f, ['phase', item.slug, 'implement'], f.root, gh.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(item.field);
      expect(bytes(path)).toBe(before);
      expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
      expect(existsSync(gh.db + '.calls')).toBe(false);
    } finally {
      f.clean();
    }
  }
});

test('phase implement fails with Missing worktree when the recorded folder is gone', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'gone');
    mkdirSync(worktree);
    rmSync(worktree, { recursive: true });
    const path: string = leaf(f, 'gone', 'plan.synthesis', { worktree });
    const before: string = bytes(path);
    const result: Result = await cli(f, ['phase', 'gone', 'implement']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Missing worktree:');
    expect(result.stderr).toContain(worktree);
    expect(bytes(path)).toBe(before);
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('check.repair hands B to merge uncounted and failed recovers to check.repair', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'handoff', 'check.repair', { fix_rounds: 1 });
    expect((await cli(f, ['phase', 'handoff', 'merge', '--slot', 'B'])).stdout).toBe('moved merge');
    expect(readState(path)).toMatchObject({ phase: 'merge', fix_rounds: 1 });
    const stuck: string = leaf(f, 'stuck-repair', 'failed', { fix_rounds: 1 });
    expect((await cli(f, ['phase', 'stuck-repair', 'check.repair'])).stdout).toBe('moved check.repair');
    expect(readState(stuck)).toMatchObject({ phase: 'check.repair', fix_rounds: 1 });
  } finally {
    f.clean();
  }
});

test('failed exits by command reset attempts and keep fix_rounds', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'stuck', 'failed', {
      fix_rounds: 3,
      attempts: { A: 1, B: 2 },
      done: ['A'],
    });
    expect((await cli(f, ['phase', 'stuck', 'plan.synthesis'])).code).toBe(0);
    expect(readState(path)).toMatchObject({ attempts: { A: 0, B: 0 }, done: [], fix_rounds: 3 });
    const second: string = leaf(f, 'still-stuck', 'failed', { fix_rounds: 2 });
    const result: Result = await cli(f, ['phase', 'still-stuck', 'check.fix']);
    expect(result.stdout).toBe('moved check.fix');
    expect(readState(second)).toMatchObject({ phase: 'check.fix', fix_rounds: 2 });
  } finally {
    f.clean();
  }
});

test('empty branch refuses review naming target', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'empty', worktree], f.root);
    const path: string = leaf(f, 'empty', 'implement', { worktree });
    const before: string = bytes(path);
    const logPath: string = resolve(f.root, 'issues/log.jsonl');
    const result: Result = await cli(f, ['phase', 'empty', 'check.review', '--slot', 'A']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('origin/main');
    expect(bytes(path)).toBe(before);
    expect(existsSync(logPath)).toBe(false);
  } finally {
    f.clean();
  }
});

test('planning move refuses issue files on branch naming leaf path, then records when clean', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt-stray');
    await command(['git', 'worktree', 'add', '-b', 'stray', worktree], f.root);
    const path: string = leaf(f, 'stray', 'plan.positions', { worktree });
    mkdirSync(resolve(worktree, 'issues/open/issue/stray'), { recursive: true });
    writeFileSync(resolve(worktree, 'issues/open/issue/stray/positions-B.md'), 'stray artifact\n');
    await command(['git', 'add', 'issues'], worktree);
    await command(['git', 'commit', '-m', 'artifact on branch'], worktree);
    const refused: Result = await cli(f, ['phase', 'stray', 'plan.rebuttal', '--slot', 'A']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(resolve(f.root, 'issues/open/issue/stray'));
    expect(refused.stderr).toContain('positions-B.md');
    expect(readState(path)).toMatchObject({ phase: 'plan.positions', done: [] });
    await command(['git', 'reset', '--hard', 'HEAD~1'], worktree);
    const recorded: Result = await cli(f, ['phase', 'stray', 'plan.rebuttal', '--slot', 'A']);
    expect(recorded.stdout).toBe('recorded');
    expect(readState(path).done).toEqual(['A']);
  } finally {
    f.clean();
  }
});

test('planning synthesis with empty branch moves to implement', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt-empty-plan');
    await command(['git', 'worktree', 'add', '-b', 'empty-plan', worktree], f.root);
    leaf(f, 'empty-plan', 'plan.synthesis', { worktree });
    const result: Result = await cli(f, ['phase', 'empty-plan', 'implement']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe('moved implement');
  } finally {
    f.clean();
  }
});

test('stop from implement on dirty worktree records blocked failure and clears busy fields', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt-stop');
    await command(['git', 'worktree', 'add', '-b', 'stop', worktree], f.root);
    const stamp: string = '2026-09-11T12:00:00.000Z';
    const path: string = leaf(f, 'stop', 'implement', {
      worktree,
      tab: 'tab-1',
      pane: { B: 'pane-b' },
      busy_since: { B: stamp },
      busy_notified: { B: stamp },
      prompted: { B: 'sess' },
      prompted_at: { B: stamp },
    });
    const herdr = fakeHerdr(f);
    writeFileSync(herdr.db, JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'stop' }], serial: 0 }));
    writeFileSync(resolve(worktree, 'dirty'), 'x\n');
    const result: Result = await cli(f, ['phase', 'stop', 'failed', '--reason', 'x'], f.root, herdr.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe('moved failed');
    expect(readState(path)).toMatchObject({
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x', delivery: 'shown' },
      busy_since: {},
      busy_notified: {},
      prompted: {},
      prompted_at: {},
      tab: 'tab-1',
      worktree,
      pane: { B: 'pane-b' },
    });
    expect(readState(path).failure?.delivery).toBe('shown');
    const recorded: string[][] = herdrCalls(herdr.db);
    expect(recorded.filter((c) => c[0] === 'notification')).toEqual([
      ['notification', 'show', 'repo/stop failed', '--body', 'blocked: x', '--sound', 'request'],
    ]);
    expect(recorded.filter((c) => c[1] === 'rename')).toEqual([['tab', 'rename', 'tab-1', 'stop failed']]);
    expect(existsSync(resolve(worktree, 'dirty'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('stops land in failed immediately without phase advance and validate slots', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr = fakeHerdr(f);
    yaml(resolve(f.root, 'issues/config.yaml'), { rebuttal: true, grounding: 'none' });
    const truePath: string = leaf(f, 'pos-true', 'plan.positions');
    expect(
      (await cli(f, ['phase', 'pos-true', 'failed', '--slot', 'A', '--reason', 'x'], f.root, herdr.env)).stdout,
    ).toBe('moved failed');
    expect(readState(truePath)).toMatchObject({
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.positions', slot: 'A', reason: 'x' },
    });
    yaml(resolve(f.root, 'issues/config.yaml'), { rebuttal: false, grounding: 'none' });
    const falsePath: string = leaf(f, 'pos-false', 'plan.positions');
    expect(
      (await cli(f, ['phase', 'pos-false', 'failed', '--slot', 'A', '--reason', 'x'], f.root, herdr.env)).stdout,
    ).toBe('moved failed');
    expect(readState(falsePath).failure).toEqual({
      cause: 'blocked',
      phase: 'plan.positions',
      slot: 'A',
      reason: 'x',
      delivery: 'shown',
    });
    const reviewPath: string = leaf(f, 'stop-review', 'check.review');
    const review: Result = await cli(
      f,
      ['phase', 'stop-review', 'failed', '--slot', 'A', '--reason', 'x'],
      f.root,
      herdr.env,
    );
    expect(review.stdout).toBe('moved failed');
    expect(readState(reviewPath).failure).toEqual({
      cause: 'blocked',
      phase: 'check.review',
      slot: 'A',
      reason: 'x',
      delivery: 'shown',
    });
    const mergePath: string = leaf(f, 'stop-merge', 'merge');
    const merge: Result = await cli(f, ['phase', 'stop-merge', 'failed', '--reason', 'x'], f.root, herdr.env);
    expect(merge.stdout).toBe('moved failed');
    expect(readState(mergePath).failure).toEqual({
      cause: 'blocked',
      phase: 'merge',
      slot: 'B',
      reason: 'x',
      delivery: 'shown',
    });
    leaf(f, 'bad-slot', 'implement');
    const bad: Result = await cli(f, ['phase', 'bad-slot', 'failed', '--slot', 'B', '--reason', 'x']);
    expect(bad.code).not.toBe(0);
    expect(bad.stderr).toContain('required --slot');
    const donePath: string = leaf(f, 'done-slot', 'plan.positions', { done: ['A'] });
    const doneBefore: string = bytes(donePath);
    const done: Result = await cli(f, ['phase', 'done-slot', 'failed', '--slot', 'A', '--reason', 'x']);
    expect(done.code).not.toBe(0);
    expect(done.stderr).toContain('Slot already recorded');
    expect(bytes(donePath)).toBe(doneBefore);
  } finally {
    f.clean();
  }
});

test('blocked restart skips clean check and removes failure while attempts restart refuses dirty', async () => {
  const f: Fixture = await fixture();
  try {
    const blockedWt: string = resolve(f.home, 'wt-blocked');
    await command(['git', 'worktree', 'add', '-b', 'blocked', blockedWt], f.root);
    const blockedPath: string = leaf(f, 'blocked-restart', 'failed', {
      worktree: blockedWt,
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'x' },
    });
    writeFileSync(resolve(blockedWt, 'dirty'), 'x\n');
    const moved: Result = await cli(f, ['phase', 'blocked-restart', 'implement']);
    expect(moved.code).toBe(0);
    expect(moved.stdout).toBe('moved implement');
    expect(existsSync(resolve(blockedWt, 'dirty'))).toBe(true);
    expect(readState(blockedPath).failure).toBeUndefined();
    expect(readFileSync(resolve(blockedPath, 'state.yaml'), 'utf8')).not.toMatch(/^failure:/m);
    const attemptsWt: string = resolve(f.home, 'wt-attempts');
    await command(['git', 'worktree', 'add', '-b', 'attempts', attemptsWt], f.root);
    const attemptsPath: string = leaf(f, 'attempts-restart', 'failed', {
      worktree: attemptsWt,
      failure: { cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'fix rounds exhausted' },
    });
    writeFileSync(resolve(attemptsWt, 'dirty'), 'x\n');
    const refused: Result = await cli(f, ['phase', 'attempts-restart', 'implement']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('Uncommitted work');
    expect(readState(attemptsPath).phase).toBe('failed');
  } finally {
    f.clean();
  }
});

test('failed routing and reason misuse are guarded', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr = fakeHerdr(f);
    const fixPath: string = leaf(f, 'to-fix', 'failed');
    expect((await cli(f, ['phase', 'to-fix', 'check.fix'])).stdout).toBe('moved check.fix');
    expect(readState(fixPath).phase).toBe('check.fix');
    leaf(f, 'to-merged', 'failed');
    const merged: Result = await cli(f, ['phase', 'to-merged', 'merged']);
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain('Illegal move');
    leaf(f, 'no-reason', 'implement');
    const missing: Result = await cli(f, ['phase', 'no-reason', 'failed', '--slot', 'B']);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('Failed requires --reason');
    leaf(f, 'bad-reason', 'implement');
    const misuse: Result = await cli(f, ['phase', 'bad-reason', 'check.review', '--slot', 'B', '--reason', 'x']);
    expect(misuse.code).not.toBe(0);
    expect(misuse.stderr).toContain('--reason is only valid for failed');
    const blankPath: string = leaf(f, 'blank-reason', 'implement');
    const blankBefore: string = bytes(blankPath);
    const blank: Result = await cli(f, ['phase', 'blank-reason', 'failed', '--reason', ' ']);
    expect(blank.code).not.toBe(0);
    expect(bytes(blankPath)).toBe(blankBefore);
    const emptyPath: string = leaf(f, 'empty-reason', 'implement');
    const emptyBefore: string = bytes(emptyPath);
    const empty: Result = await cli(f, ['phase', 'empty-reason', 'failed', '--reason', '']);
    expect(empty.code).not.toBe(0);
    expect(bytes(emptyPath)).toBe(emptyBefore);
    const paddedPath: string = leaf(f, 'padded-reason', 'implement');
    const padded: Result = await cli(
      f,
      ['phase', 'padded-reason', 'failed', '--reason', '  real reason  '],
      f.root,
      herdr.env,
    );
    expect(padded.code).toBe(0);
    expect(readState(paddedPath).failure).toMatchObject({ reason: 'real reason' });
  } finally {
    f.clean();
  }
});

test('merge to merged clears busy fields', async () => {
  const f: Fixture = await fixture();
  try {
    const stamp: string = '2026-09-11T12:00:00.000Z';
    leaf(f, 'busy-merged', 'merge', { busy_since: { A: stamp }, busy_notified: { A: stamp } }, 'standalone');
    const result: Result = await cli(f, ['phase', 'busy-merged', 'merged']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('moved merged');
    const closed: string = resolve(f.root, 'issues/closed/standalone/busy-merged');
    expect(readState(closed)).toMatchObject({ busy_since: {}, busy_notified: {} });
  } finally {
    f.clean();
  }
});

test('fix cap records attempts failure', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 1, grounding: 'none' });
    const path: string = leaf(f, 'cap', 'check.repair', { fix_rounds: 1 });
    const herdr = fakeHerdr(f);
    const result: Result = await cli(f, ['phase', 'cap', 'check.fix', '--slot', 'B'], f.root, herdr.env);
    expect(result.stdout).toBe('moved failed');
    expect(readState(path).failure).toEqual({
      cause: 'attempts',
      phase: 'check.repair',
      slot: 'B',
      reason: 'fix rounds exhausted',
      delivery: 'shown',
    });
  } finally {
    f.clean();
  }
});

test('failed restart refuses issue files on branch but allows move without worktree', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt-recover');
    await command(['git', 'worktree', 'add', '-b', 'recover', worktree], f.root);
    const recoverPath: string = leaf(f, 'recover', 'failed', { worktree });
    mkdirSync(resolve(worktree, 'issues/open/issue/recover'), { recursive: true });
    writeFileSync(resolve(worktree, 'issues/open/issue/recover/artifact.md'), 'stray\n');
    await command(['git', 'add', 'issues'], worktree);
    await command(['git', 'commit', '-m', 'artifact on branch'], worktree);
    const refused: Result = await cli(f, ['phase', 'recover', 'implement']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(recoverPath);
    expect(readState(recoverPath).phase).toBe('failed');
    leaf(f, 'no-wt', 'failed');
    const moved: Result = await cli(f, ['phase', 'no-wt', 'implement']);
    expect(moved.code).toBe(0);
    expect(moved.stdout).toBe('moved implement');
  } finally {
    f.clean();
  }
});

for (const [mode, delivery] of [
  ['failNotification', 'error'],
  ['failRename', 'shown'],
] as const) {
  test(`failed move logs persisted delivery after ${mode}`, async () => {
    const f: Fixture = await fixture();
    try {
      const herdr: HerdrFixture = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'oops' }], serial: 0, [mode]: true }),
      );
      const path: string = leaf(f, 'oops', 'implement', { tab: 'tab-1' });
      const result: Result = await cli(
        f,
        ['phase', 'oops', 'failed', '--slot', 'A', '--reason', 'Required permission is missing'],
        f.root,
        herdr.env,
      );
      expect(result.code).not.toBe(0);
      expect(readState(path).failure?.delivery).toBe(delivery);
      const record: { failure?: Failure } = JSON.parse(
        readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim(),
      );
      expect(record.failure).toEqual(readState(path).failure);
    } finally {
      f.clean();
    }
  });
}

test('failed announce renames tabs, tolerates missing tabs, and retries herdr calls', async () => {
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'back failed' }], serial: 0 }),
      );
      const path: string = leaf(f, 'back', 'failed', { tab: 'tab-1' });
      const result: Result = await cli(f, ['phase', 'back', 'implement'], f.root, herdr.env);
      expect(result.code).toBe(0);
      expect(herdrCalls(herdr.db)).toEqual([['tab', 'rename', 'tab-1', 'back']]);
      expect(readState(path).phase).toBe('implement');
    } finally {
      f.clean();
    }
  }
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'back failed' }], serial: 0, failRename: true }),
      );
      const path: string = leaf(f, 'back', 'failed', { tab: 'tab-1' });
      const result: Result = await cli(f, ['phase', 'back', 'implement'], f.root, herdr.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('timeout');
      expect(readState(path).phase).toBe('implement');
      expect(herdrCalls(herdr.db)).toEqual([
        ['tab', 'rename', 'tab-1', 'back'],
        ['tab', 'rename', 'tab-1', 'back'],
      ]);
    } finally {
      f.clean();
    }
  }
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      const path: string = leaf(f, 'notab', 'implement');
      const result: Result = await cli(f, ['phase', 'notab', 'failed', '--reason', 'x'], f.root, herdr.env);
      expect(result.code).toBe(0);
      expect(herdrCalls(herdr.db)).toEqual([
        ['notification', 'show', 'repo/notab failed', '--body', 'blocked: x', '--sound', 'request'],
      ]);
      expect(readState(path).failure?.delivery).toBe('shown');
    } finally {
      f.clean();
    }
  }
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'oops' }], serial: 0, failNotification: true }),
      );
      const path: string = leaf(f, 'oops', 'implement', { tab: 'tab-1' });
      const result: Result = await cli(f, ['phase', 'oops', 'failed', '--reason', 'x'], f.root, herdr.env);
      expect(result.code).not.toBe(0);
      const recorded: string[][] = herdrCalls(herdr.db);
      expect(recorded.filter((c) => c[0] === 'notification')).toHaveLength(1);
      expect(recorded).toContainEqual(['tab', 'rename', 'tab-1', 'oops failed']);
      expect(readState(path)).toMatchObject({ phase: 'failed', failure: { delivery: 'error' } });
      const db: { tabs: { label: string }[] } = JSON.parse(readFileSync(herdr.db, 'utf8'));
      expect(db.tabs[0].label).toBe('oops failed');
    } finally {
      f.clean();
    }
  }
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [{ tab_id: 'tab-1', label: 'oops' }], serial: 0, failRename: true }),
      );
      const path: string = leaf(f, 'oops', 'implement', { tab: 'tab-1' });
      const result: Result = await cli(f, ['phase', 'oops', 'failed', '--reason', 'x'], f.root, herdr.env);
      expect(result.code).not.toBe(0);
      expect(readState(path)).toMatchObject({ phase: 'failed', failure: { delivery: 'shown' } });
      const recorded: string[][] = herdrCalls(herdr.db);
      expect(recorded.filter((c) => c[0] === 'notification')).toHaveLength(1);
      expect(recorded.filter((c) => c[1] === 'rename')).toHaveLength(2);
    } finally {
      f.clean();
    }
  }
  {
    const f: Fixture = await fixture();
    try {
      const herdr = fakeHerdr(f);
      writeFileSync(herdr.db, JSON.stringify({ panes: [], tabs: [], serial: 0, failNotificationOnce: true }));
      const path: string = leaf(f, 'flaky', 'implement');
      const result: Result = await cli(f, ['phase', 'flaky', 'failed', '--reason', 'x'], f.root, herdr.env);
      expect(result.code).toBe(0);
      expect(herdrCalls(herdr.db)).toEqual([
        ['notification', 'show', 'repo/flaky failed', '--body', 'blocked: x', '--sound', 'request'],
        ['notification', 'show', 'repo/flaky failed', '--body', 'blocked: x', '--sound', 'request'],
      ]);
      expect(readState(path).failure?.delivery).toBe('shown');
    } finally {
      f.clean();
    }
  }
});

for (const { slug, phase, args, failNotification, code, calls, delivery } of [
  {
    slug: 'stale-resume',
    phase: 'failed',
    args: ['phase', 'stale-resume', 'implement'],
    code: 0,
    calls: [['tab', 'rename', 'tab-1', 'stale-resume']],
  },
  {
    slug: 'stale-fail',
    phase: 'implement',
    args: ['phase', 'stale-fail', 'failed', '--slot', 'A', '--reason', 'x'],
    code: 0,
    calls: [
      ['notification', 'show', 'repo/stale-fail failed', '--body', 'blocked: x', '--sound', 'request'],
      ['tab', 'rename', 'tab-1', 'stale-fail failed'],
    ],
    delivery: 'shown',
  },
  {
    slug: 'stale-fail',
    phase: 'implement',
    args: ['phase', 'stale-fail', 'failed', '--slot', 'A', '--reason', 'x'],
    failNotification: true,
    code: 1,
    calls: [
      ['notification', 'show', 'repo/stale-fail failed', '--body', 'blocked: x', '--sound', 'request'],
      ['tab', 'rename', 'tab-1', 'stale-fail failed'],
    ],
    delivery: 'error',
  },
] as {
  slug: string;
  phase: string;
  args: string[];
  failNotification?: boolean;
  code: number;
  calls: string[][];
  delivery?: string;
}[]) {
  test(`rename on a missing tab warns once and continues (${slug} ${failNotification === true ? 'notification error' : 'clean'})`, async () => {
    const f: Fixture = await fixture();
    try {
      const herdr: HerdrFixture = fakeHerdr(f);
      writeFileSync(
        herdr.db,
        JSON.stringify({ panes: [], tabs: [], serial: 0, failNotification: failNotification === true }),
      );
      const path: string = leaf(f, slug, phase, { tab: 'tab-1' });
      const result: Result = await cli(f, [...args], f.root, herdr.env);
      expect(result.code).toBe(code);
      if (failNotification === true) expect(result.stderr).toContain('fixture_notification_failed');
      const warnings: {
        warning: string;
        slug: string;
        command: string[];
        code: string;
        message: string;
        stderr: string;
      }[] = result.stderr
        .split('\n')
        .filter((line) => line.startsWith('{'))
        .map((line) => JSON.parse(line));
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({
        slug,
        command: ['herdr', ...calls[calls.length - 1]],
        code: 'tab_not_found',
        message: 'fixture failure',
      });
      expect(warnings[0].stderr).toContain('tab_not_found');
      expect(herdrCalls(herdr.db)).toEqual(calls);
      const state: { phase: string; tab?: string; failure?: { delivery?: string } } = readState(path);
      expect(state.phase).toBe(args[2]);
      expect(state.tab).toBe('tab-1');
      if (delivery !== undefined) expect(state.failure?.delivery).toBe(delivery);
      expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n')).toHaveLength(1);
    } finally {
      f.clean();
    }
  });
}

test('rename failure other than tab_not_found keeps existing handling', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    writeFileSync(
      herdr.db,
      JSON.stringify({
        panes: [],
        tabs: [{ tab_id: 'tab-1', label: 'back failed' }],
        serial: 0,
        renameScript: [{ code: 'fixture_rename_denied', message: 'denied' }],
      }),
    );
    leaf(f, 'denied', 'failed', { tab: 'tab-1' });
    const result: Result = await cli(f, ['phase', 'denied', 'implement'], f.root, herdr.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('fixture_rename_denied');
    expect(herdrCalls(herdr.db)).toEqual([['tab', 'rename', 'tab-1', 'denied']]);
  } finally {
    f.clean();
  }
});

test('phase move clears delivery_error', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'clear-error', 'plan.synthesis');
    saveState(path, {
      ...readState(path),
      delivery_error: {
        B: {
          command: ['herdr', 'agent', 'prompt'],
          code: 'timeout',
          message: 'slow',
          pane: 'p1',
          session: 's1',
          at: '2026-09-19T00:00:00.000Z',
        },
      },
    });
    expect(readState(path).delivery_error).not.toEqual({});
    const result: Result = await cli(f, ['phase', 'clear-error', 'implement', '--slot', 'A']);
    expect(result.code).toBe(0);
    expect(readState(path).delivery_error).toEqual({});
  } finally {
    f.clean();
  }
});

for (const { phase, slot, extra } of [
  { phase: 'plan.synthesis', slot: 'B' },
  { phase: 'implement', slot: 'B' },
  { phase: 'check.fix', slot: 'B' },
  { phase: 'merge', slot: 'A' },
  { phase: 'check.review', slot: 'A', extra: { fix_rounds: 1 } },
  { phase: 'check.repair', slot: 'A' },
]) {
  test(`${phase} refuses a --slot ${slot} move without changing state or log`, async () => {
    const f: Fixture = await fixture();
    try {
      const path: string = leaf(f, 'wrong-seat', phase, extra ?? {});
      const before: string = bytes(path);
      const result: Result = await cli(f, ['phase', 'wrong-seat', 'failed', '--slot', slot, '--reason', 'x']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('required --slot');
      expect(bytes(path)).toBe(before);
      expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    } finally {
      f.clean();
    }
  });
}

test('failed leaf with explicit slot is refused without effect', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const history: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(history, '');
    const cases: { slug: string; extra: object; args: string[]; reason?: string }[] = [
      {
        slug: 'seat-review',
        extra: { failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs decision' } },
        args: ['phase', 'seat-review', 'check.review', '--slot', 'A'],
        reason: 'needs decision',
      },
      {
        slug: 'seat-implement',
        extra: { failure: { cause: 'blocked', phase: 'check.fix', slot: 'A', reason: 'worktree locked' } },
        args: ['phase', 'seat-implement', 'implement', '--slot', 'B'],
        reason: 'worktree locked',
      },
      {
        slug: 'seat-merge',
        extra: { failure: { cause: 'blocked', phase: 'check.review', slot: 'A', reason: 'verdict dispute' } },
        args: ['phase', 'seat-merge', 'merge', '--slot', 'B', '--verdict', 'ready'],
        reason: 'verdict dispute',
      },
      {
        slug: 'seat-attempts',
        extra: {
          failure: { cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'fix rounds exhausted' },
        },
        args: ['phase', 'seat-attempts', 'check.review', '--slot', 'B'],
        reason: 'fix rounds exhausted',
      },
      {
        slug: 'seat-recordless',
        extra: {},
        args: ['phase', 'seat-recordless', 'implement', '--slot', 'A'],
      },
    ];
    for (const item of cases) {
      const path: string = leaf(f, item.slug, 'failed', item.extra);
      const before: string = bytes(path);
      const result: Result = await cli(f, item.args, f.root, herdr.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(seatRefusal);
      if (item.reason !== undefined) expect(result.stderr).toContain(item.reason);
      expect(bytes(path)).toBe(before);
      expect(readFileSync(history, 'utf8')).toBe('');
    }
    expect(herdrCalls(herdr.db)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('in-flight seat move after stop stays failed', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const path: string = leaf(f, 'seat', 'check.fix', { fix_rounds: 1 });
    const stopped: Result = await cli(
      f,
      ['phase', 'seat', 'failed', '--slot', 'A', '--reason', 'x'],
      f.root,
      herdr.env,
    );
    expect(stopped.stdout).toBe('moved failed');
    const before: string = bytes(path);
    const calls: number = herdrCalls(herdr.db).length;
    const refused: Result = await cli(f, ['phase', 'seat', 'check.review', '--slot', 'A'], f.root, herdr.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(seatRefusal);
    expect(bytes(path)).toBe(before);
    expect(readState(path)).toMatchObject({ phase: 'failed', fix_rounds: 1 });
    expect(herdrCalls(herdr.db)).toHaveLength(calls);
  } finally {
    f.clean();
  }
});

async function oldFileBranch(f: Fixture, name: string): Promise<string> {
  if (!existsSync(resolve(f.root, 'x.test.ts'))) {
    writeFileSync(resolve(f.root, 'x.test.ts'), 'old test\n');
    mkdirSync(resolve(f.root, 'src'), { recursive: true });
    writeFileSync(resolve(f.root, 'src/x.spec.ts'), 'old spec\n');
    await command(['git', 'add', 'x.test.ts', 'src/x.spec.ts'], f.root);
    await command(['git', 'commit', '-m', 'old test files'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  }
  const worktree: string = resolve(f.home, `wt-${name}`);
  await command(['git', 'worktree', 'add', '-b', name, worktree], f.root);
  return worktree;
}

async function commitAll(worktree: string, messages: string[]): Promise<void> {
  await command(['git', 'add', '-A'], worktree);
  await command(['git', 'commit', ...messages.flatMap((m) => ['-m', m])], worktree);
}

test('modified old test files need a Test-Change trailer on every guarded move', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = await oldFileBranch(f, 'cite');
    const path: string = leaf(f, 'cite', 'implement', { worktree });
    const before: string = bytes(path);
    writeFileSync(resolve(worktree, 'x.test.ts'), 'edited\n');
    await commitAll(worktree, ['edit test', 'Test-Change: x.test.ts']);
    const bare: Result = await cli(f, ['phase', 'cite', 'check.review', '--slot', 'A']);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('x.test.ts');
    expect(bare.stderr).toContain('Test-Change: x.test.ts <source and reason>');
    expect(bare.stderr).toContain('final trailer block');
    expect(bare.stderr).toContain('empty commit');
    expect(bytes(path)).toBe(before);
    await command(
      ['git', 'commit', '--allow-empty', '-m', 'cite\n\nTest-Change: x.test.ts src change edited the test'],
      worktree,
    );
    const moved: Result = await cli(f, ['phase', 'cite', 'check.review', '--slot', 'A']);
    expect(moved.code).toBe(0);
    expect(moved.stdout).toBe('moved check.review');
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('deleted and typechanged old test files need one trailer each naming the file', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = await oldFileBranch(f, 'cite-both');
    const path: string = leaf(f, 'cite-both', 'implement', { worktree });
    const before: string = bytes(path);
    await command(['git', 'rm', 'src/x.spec.ts'], worktree);
    await command(['git', 'rm', 'x.test.ts'], worktree);
    symlinkSync('file', resolve(worktree, 'x.test.ts'));
    await commitAll(worktree, ['delete spec, link test']);
    const refused: Result = await cli(f, ['phase', 'cite-both', 'check.review', '--slot', 'A']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('src/x.spec.ts');
    expect(refused.stderr).toContain('Test-Change: src/x.spec.ts <source and reason>');
    expect(refused.stderr).toContain('x.test.ts');
    expect(refused.stderr).toContain('Test-Change: x.test.ts <source and reason>');
    expect(bytes(path)).toBe(before);
    await command(
      [
        'git',
        'commit',
        '--allow-empty',
        '-m',
        'cite\n\nTest-Change: src/x.spec.ts removed\nTest-Change: x.test.ts retyped',
      ],
      worktree,
    );
    const moved: Result = await cli(f, ['phase', 'cite-both', 'check.review', '--slot', 'A']);
    expect(moved.stdout).toBe('moved check.review');
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('a trailer naming a different path does not cite and the old path of a rename is the citation', async () => {
  const f: Fixture = await fixture();
  try {
    const wrong: string = await oldFileBranch(f, 'cite-wrong');
    const wrongPath: string = leaf(f, 'cite-wrong', 'implement', { worktree: wrong });
    writeFileSync(resolve(wrong, 'x.test.ts'), 'edited\n');
    await commitAll(wrong, ['edit test', 'Test-Change: src/x.spec.ts cited the untouched spec']);
    const refused: Result = await cli(f, ['phase', 'cite-wrong', 'check.review', '--slot', 'A']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('x.test.ts');
    expect(readState(wrongPath).phase).toBe('implement');
    const renamed: string = await oldFileBranch(f, 'cite-rename');
    const renamedPath: string = leaf(f, 'cite-rename', 'implement', { worktree: renamed });
    await command(['git', 'mv', 'x.test.ts', 'y.test.ts'], renamed);
    await commitAll(renamed, ['rename test', 'Test-Change: y.test.ts cited the new name']);
    const oldRefused: Result = await cli(f, ['phase', 'cite-rename', 'check.review', '--slot', 'A']);
    expect(oldRefused.code).not.toBe(0);
    expect(oldRefused.stderr).toContain('Test-Change: x.test.ts <source and reason>');
    expect(readState(renamedPath).phase).toBe('implement');
    await command(
      ['git', 'commit', '--allow-empty', '-m', 'cite\n\nTest-Change: x.test.ts renamed to y.test.ts'],
      renamed,
    );
    const moved: Result = await cli(f, ['phase', 'cite-rename', 'check.review', '--slot', 'A']);
    expect(moved.stdout).toBe('moved check.review');
    expect(readState(renamedPath).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('added-only test files and non-test diffs move without a trailer, and recovery re-runs the guard', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = await oldFileBranch(f, 'cite-add');
    const addPath: string = leaf(f, 'cite-add', 'implement', { worktree });
    writeFileSync(resolve(worktree, 'new.test.ts'), 'new\n');
    writeFileSync(resolve(worktree, 'file'), 'edited\n');
    await commitAll(worktree, ['add test, edit file']);
    const added: Result = await cli(f, ['phase', 'cite-add', 'check.review', '--slot', 'A']);
    expect(added.stdout).toBe('moved check.review');
    expect(readState(addPath).phase).toBe('check.review');
    const recover: string = await oldFileBranch(f, 'cite-recover');
    const recoverPath: string = leaf(f, 'cite-recover', 'failed', {
      worktree: recover,
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x' },
    });
    const recoverBefore: string = bytes(recoverPath);
    writeFileSync(resolve(recover, 'x.test.ts'), 'edited\n');
    await commitAll(recover, ['edit test']);
    const refused: Result = await cli(f, ['phase', 'cite-recover', 'implement']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('x.test.ts');
    expect(readState(recoverPath).phase).toBe('failed');
    expect(bytes(recoverPath)).toBe(recoverBefore);
    await command(['git', 'commit', '--allow-empty', '-m', 'cite\n\nTest-Change: x.test.ts fixed the test'], recover);
    const moved: Result = await cli(f, ['phase', 'cite-recover', 'implement']);
    expect(moved.stdout).toBe('moved implement');
    expect(readState(recoverPath).phase).toBe('implement');
  } finally {
    f.clean();
  }
});

test('phase --check runs the move guards without recording, moving or closing the owner', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = await oldFileBranch(f, 'check');
    const path: string = leaf(f, 'check', 'implement', { worktree });
    const before: string = bytes(path);
    writeFileSync(resolve(worktree, 'src/new.ts'), 'code\n');
    await commitAll(worktree, ['code change']);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const ok: Result = await cli(f, ['phase', 'check', 'check.review', '--slot', 'A', '--check']);
    expect(ok.code).toBe(0);
    expect(ok.stdout).toBe('ok');
    expect(bytes(path)).toBe(before);
    expect(readState(path).phase).toBe('implement');
    expect(await command(['git', 'rev-parse', 'HEAD'], worktree)).toBe(head);
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    writeFileSync(resolve(worktree, 'x.test.ts'), 'edited\n');
    await commitAll(worktree, ['edit test']);
    const checkedRefused: Result = await cli(f, ['phase', 'check', 'check.review', '--slot', 'A', '--check']);
    expect(checkedRefused.code).not.toBe(0);
    expect(checkedRefused.stderr).toContain('x.test.ts');
    expect(bytes(path)).toBe(before);
    expect(await command(['git', 'rev-parse', 'HEAD'], worktree)).not.toBe(head);
    await command(['git', 'reset', '--hard', head], worktree);
    const dirtyWt: string = await oldFileBranch(f, 'check-dirty');
    const dirtyPath: string = leaf(f, 'check-dirty', 'implement', { worktree: dirtyWt });
    writeFileSync(resolve(dirtyWt, 'unstaged'), 'x\n');
    const dirtyBefore: string = bytes(dirtyPath);
    const dirty: Result = await cli(f, ['phase', 'check-dirty', 'check.review', '--slot', 'A', '--check']);
    expect(dirty.code).not.toBe(0);
    expect(dirty.stderr).toContain('Uncommitted work');
    expect(bytes(dirtyPath)).toBe(dirtyBefore);
    expect(readState(dirtyPath).phase).toBe('implement');
    const failed: Result = await cli(
      f,
      ['phase', 'check-dirty', 'failed', '--reason', 'x', '--check'],
      f.root,
      fakeHerdr(f).env,
    );
    expect(failed.code).not.toBe(0);
    expect(bytes(dirtyPath)).toBe(dirtyBefore);
    expect(readState(dirtyPath).phase).toBe('implement');
    leaf(f, 'check-merged', 'merged', {}, 'epic/final');
    const merged: Result = await cli(f, ['phase', 'check-merged', 'merged', '--check']);
    expect(merged.code).not.toBe(0);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/closed/epic'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('merge turn refusal names the holder for merged and check.fix while failed is never refused', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const holderPath: string = leaf(f, 'aa', 'merge');
    const nonHolderPath: string = leaf(f, 'bb', 'merge');
    // Unstamped merge leaves take turns in slug order, so aa holds the queue.
    const refuses: Result[] = [
      await cli(f, ['phase', 'bb', 'merged']),
      await cli(f, ['phase', 'bb', 'merged', '--check']),
      await cli(f, ['phase', 'bb', 'check.fix']),
    ];
    for (const result of refuses) {
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('aa');
    }
    expect(readState(nonHolderPath).phase).toBe('merge');
    const failed: Result = await cli(f, ['phase', 'bb', 'failed', '--reason', 'x'], f.root, herdr.env);
    expect(failed.code).toBe(0);
    expect(readState(nonHolderPath).phase).toBe('failed');
    expect((await cli(f, ['phase', 'aa', 'merged', '--check'])).stdout).toBe('ok');
    const moved: Result = await cli(f, ['phase', 'aa', 'merged']);
    expect(moved.code).toBe(0);
    expect(readState(holderPath).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

test('merge turn refusal fires before worktree guards on a missing worktree', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'aa', 'merge');
    leaf(f, 'bb', 'merge', { worktree: resolve(f.home, 'gone') });
    const refuses: Result[] = [await cli(f, ['phase', 'bb', 'merged']), await cli(f, ['phase', 'bb', 'check.fix'])];
    for (const result of refuses) {
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('aa');
      expect(result.stderr).not.toContain('Missing worktree');
      expect(result.stderr).not.toContain('Uncommitted work');
    }
  } finally {
    f.clean();
  }
});

test('an earlier merge_stamp takes the turn over slug order', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'aa', 'merge', { merge_stamp: '2026-10-05T20:00:02Z', solo: true }, 'epic/first');
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-05T20:00:01Z', solo: true }, 'epic/second');
    const refused: Result = await cli(f, ['phase', 'aa', 'merged']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('bb');
    expect((await cli(f, ['phase', 'bb', 'merged'])).code).toBe(0);
    expect((await cli(f, ['phase', 'aa', 'merged'])).code).toBe(0);
  } finally {
    f.clean();
  }
});

test('moving into merge writes merge_stamp and re-entering refreshes it', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const path: string = leaf(f, 'stamper', 'check.repair');
    expect((await cli(f, ['phase', 'stamper', 'merge', '--slot', 'B'])).stdout).toBe('moved merge');
    const first: string | undefined = readState(path).merge_stamp;
    expect(Date.parse(first ?? '')).not.toBeNaN();
    expect((await cli(f, ['phase', 'stamper', 'failed', '--reason', 'x'], f.root, herdr.env)).stdout).toBe(
      'moved failed',
    );
    expect((await cli(f, ['phase', 'stamper', 'merge'])).stdout).toBe('moved merge');
    const second: string | undefined = readState(path).merge_stamp;
    expect(Date.parse(second ?? '')).not.toBeNaN();
    expect(second).not.toBe(first);
  } finally {
    f.clean();
  }
});
