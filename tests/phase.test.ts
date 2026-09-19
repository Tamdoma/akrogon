import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fixture, cli, leaf, yaml, fakeGh, fakeHerdr, type GhFixture, type Fixture } from './helpers';
import { readState, saveState } from '../src/state';
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
test('valid phase transition rejects a mismatched repo key without changing state or history', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    const before: string = bytes(path);
    const history: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(history, '');
    const result: Result = await cli(f, ['phase', 'wrong-key', 'implement', '--slot', 'B']);
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

test('review aggregates verdicts, rechecks only A, caps repairs and permits operator restart', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 1, grounding: 'none' });
    const path: string = leaf(f, 'repair', 'check.review');
    const herdr = fakeHerdr(f);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A'])).code).not.toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'A', '--verdict', 'nits'])).stdout).toBe('recorded');
    expect((await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'B', '--verdict', 'fix'])).stdout).toBe(
      'moved check.fix',
    );
    expect(readState(path).fix_rounds).toBe(1);
    expect((await cli(f, ['phase', 'repair', 'check.review'])).code).toBe(0);
    expect((await cli(f, ['phase', 'repair', 'merge', '--slot', 'B', '--verdict', 'ready'])).code).not.toBe(0);
    expect(
      (await cli(f, ['phase', 'repair', 'check.fix', '--slot', 'A', '--verdict', 'fix'], f.root, herdr.env)).stdout,
    ).toBe('moved failed');
    expect((await cli(f, ['phase', 'repair', 'implement'], f.root, herdr.env)).code).toBe(0);
    expect(readState(path)).toMatchObject({ phase: 'implement', fix_rounds: 0 });
    const mergePath: string = leaf(f, 'conflict', 'merge');
    expect((await cli(f, ['phase', 'conflict', 'check.fix'])).code).toBe(0);
    expect(readState(mergePath).fix_rounds).toBe(0);
    const cappedPath: string = leaf(f, 'capped', 'merge', { fix_rounds: 1 });
    expect((await cli(f, ['phase', 'capped', 'check.fix'])).stdout).toBe('moved check.fix');
    expect(readState(cappedPath)).toMatchObject({ phase: 'check.fix', fix_rounds: 1 });
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

test('handoff to review refuses a dirty worktree at every move and issue files on the branch, then passes', async () => {
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
    mkdirSync(resolve(worktree, 'issues/open/issue/dirty'), { recursive: true });
    writeFileSync(resolve(worktree, 'issues/open/issue/dirty/review-B.md'), 'stray artifact\n');
    await command(['git', 'add', 'issues'], worktree);
    await command(['git', 'commit', '-m', 'artifact on branch'], worktree);
    const artifacts: Result = await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'B']);
    expect(artifacts.code).not.toBe(0);
    expect(artifacts.stderr).toContain('Issue files on leaf branch');
    expect(readState(path).phase).toBe('implement');
    await command(['git', 'reset', '--hard', 'HEAD~1'], worktree);
    expect((await cli(f, ['phase', 'dirty', 'check.review', '--slot', 'B'])).code).toBe(0);
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

test('completion reports each issue once, moves only finished containers, and refuses repeated merged', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'one', 'merge', {}, 'epic/first');
    leaf(f, 'two', 'merge', {}, 'epic/first');
    leaf(f, 'three', 'merge', {}, 'epic/second');
    mkdirSync(resolve(f.root, 'issues/chart/epic'), { recursive: true });
    writeFileSync(resolve(f.root, 'issues/chart/epic/CHART.md'), '# Chart: epic\n');
    const race: Result[] = await Promise.all(['one', 'two'].map((slug) => cli(f, ['phase', slug, 'merged'])));
    expect(race.every((r) => r.code === 0)).toBe(true);
    expect(race.filter((r) => r.stdout.includes('issue complete first'))).toHaveLength(1);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
    expect((await cli(f, ['phase', 'three', 'merged'])).stdout).toContain('issue complete second');
    expect(existsSync(resolve(f.root, 'issues/closed/epic/first/one/state.yaml'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/closed/epic/chart/CHART.md'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/chart/epic'))).toBe(false);
    const repeated: Result = await cli(f, ['phase', 'three', 'merged']);
    expect(repeated.code).not.toBe(0);
    expect(repeated.stdout).not.toContain('issue complete');
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
    leaf(f, 'one', 'merge', { worktree: first, sources: ['team/project#1', 'team/project#2'] }, 'epic/first');
    leaf(f, 'empty', 'merged', {}, 'epic/first');
    leaf(f, 'two', 'merge', { worktree: last, sources: ['team/project#2', 'team/project#3'] }, 'epic/second');
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
    expect(earlier.stdout).toContain('issue complete first');
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
    expect(final.stdout).toContain('issue complete last');
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
      expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
      expect(existsSync(probe.open)).toBe(false);
      expect(existsSync(resolve(probe.closed, 'chart/CHART.md'))).toBe(true);
      expect(existsSync(chart)).toBe(false);
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

test('failed exits by command reset attempts and allow check.fix', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'stuck', 'failed', {
      fix_rounds: 3,
      attempts: { A: 1, B: 2 },
      done: ['A'],
    });
    expect((await cli(f, ['phase', 'stuck', 'plan.synthesis'])).code).toBe(0);
    expect(readState(path)).toMatchObject({ attempts: { A: 0, B: 0 }, done: [], fix_rounds: 0 });
    const second: string = leaf(f, 'still-stuck', 'failed');
    const result: Result = await cli(f, ['phase', 'still-stuck', 'check.fix']);
    expect(result.stdout).toBe('moved check.fix');
    expect(readState(second)).toMatchObject({ phase: 'check.fix', fix_rounds: 0 });
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
    const result: Result = await cli(f, ['phase', 'empty', 'check.review', '--slot', 'B']);
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
    const refused: Result = await cli(f, ['phase', 'stray', 'plan.rebuttal', '--slot', 'B']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(resolve(f.root, 'issues/open/issue/stray'));
    expect(refused.stderr).toContain('positions-B.md');
    expect(readState(path)).toMatchObject({ phase: 'plan.positions', done: [] });
    await command(['git', 'reset', '--hard', 'HEAD~1'], worktree);
    const recorded: Result = await cli(f, ['phase', 'stray', 'plan.rebuttal', '--slot', 'B']);
    expect(recorded.stdout).toBe('recorded');
    expect(readState(path).done).toEqual(['B']);
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
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'x', delivery: 'shown' },
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
      slot: 'A',
      reason: 'x',
      delivery: 'shown',
    });
    leaf(f, 'bad-slot', 'implement');
    const bad: Result = await cli(f, ['phase', 'bad-slot', 'failed', '--slot', 'A', '--reason', 'x']);
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
    const path: string = leaf(f, 'cap', 'check.review', { fix_rounds: 1 });
    const herdr = fakeHerdr(f);
    const result: Result = await cli(
      f,
      ['phase', 'cap', 'check.fix', '--slot', 'A', '--verdict', 'fix'],
      f.root,
      herdr.env,
    );
    expect(result.stdout).toBe('moved failed');
    expect(readState(path).failure).toEqual({
      cause: 'attempts',
      phase: 'check.review',
      slot: 'A',
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
    const result: Result = await cli(f, ['phase', 'clear-error', 'implement', '--slot', 'B']);
    expect(result.code).toBe(0);
    expect(readState(path).delivery_error).toEqual({});
  } finally {
    f.clean();
  }
});
