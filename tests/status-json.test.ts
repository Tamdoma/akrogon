import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fakeSystemctl, fixture, cli, leaf, yaml, storeDir, type Fixture, type SystemctlFixture } from './helpers';
import { event, log, mergeRecord, needs, prompt, register, seedRunRecord, snapshot, timings } from './status-fixture';
import type { Result } from '../src/shell';
import { z } from 'zod';
import { readState, saveState } from '../src/state';

const gapSchema = z.strictObject({ kind: z.string(), name: z.string(), holder: z.string(), steps: z.string() });
const seatSchema = z.strictObject({ harness: z.string(), command: z.string(), source: z.string() });
const leafSchema = z.strictObject({
  slug: z.string(),
  group: z.array(z.string()),
  phase: z.string(),
  phase_since: z.number().nullable(),
  first_prompt: z.number().nullable(),
  stopped: z.boolean(),
  blocked_by: z.array(z.strictObject({ slug: z.string(), label: z.string() })),
  broadcast_pending: z.boolean(),
  land: z.strictObject({ alive: z.boolean(), unit: z.string() }).nullable(),
  busy_since: z.strictObject({ a: z.number().nullable(), b: z.number().nullable() }),
  done: z.array(z.string()),
  attempts: z.strictObject({ A: z.number(), B: z.number() }),
  fix_rounds: z.number(),
  verdict: z.record(z.string(), z.string()),
  delivery_errors: z.strictObject({
    a: z.record(z.string(), z.unknown()).nullable(),
    b: z.record(z.string(), z.unknown()).nullable(),
  }),
  failure: z.record(z.string(), z.unknown()).nullable(),
  missing: z.array(gapSchema),
  attention: z.array(z.string()),
  waits_on: z.array(z.enum(['A', 'B'])),
  worktree: z.string(),
  plan: z.string(),
  red: z.boolean(),
  seats: z.strictObject({ a: seatSchema, b: seatSchema }),
  history: z.array(z.string()),
});
const repoSchema = z.strictObject({
  name: z.string(),
  root: z.string(),
  paused: z.boolean(),
  error: z.string().nullable(),
  unreadable: z.array(z.strictObject({ path: z.string(), error: z.string() })),
  slow: z.strictObject({ leaf: z.string(), run: z.string(), ms: z.number(), normal_ms: z.number() }).nullable(),
  unpacked: z.array(z.strictObject({ path: z.string(), command: z.string() })),
  queue: z.array(z.strictObject({ slug: z.string(), place: z.number(), no_record: z.boolean() })),
  kept: z.array(z.strictObject({ path: z.string(), reason: z.string() })),
  charts: z.array(z.array(z.string())),
  parked: z.array(z.string()),
  leaves: z.array(leafSchema),
});
const envelopeSchema = z.strictObject({
  schema: z.literal(1),
  generated: z.number(),
  red: z.number(),
  watch: z.strictObject({ folders: z.array(z.string()), files: z.array(z.string()) }),
  deploy: z
    .strictObject({
      failed: z.boolean(),
      attempted: z.string().nullable(),
      active: z.string().nullable(),
      step: z.string().nullable(),
      error: z.string().nullable(),
    })
    .nullable(),
  run: z.string().nullable(),
  kept: z.array(z.strictObject({ path: z.string(), reason: z.string() })),
  merges: z.array(
    z.strictObject({
      repo: z.string(),
      slug: z.string(),
      merged: z.number().nullable(),
      total_ms: z.number().nullable(),
    }),
  ),
  repos: z.array(repoSchema),
});
type Envelope = z.infer<typeof envelopeSchema>;

function envelope(result: Result): Envelope {
  return envelopeSchema.parse(JSON.parse(result.stdout));
}
function repoOf(env: Envelope, name: string): Envelope['repos'][number] {
  const repo: Envelope['repos'][number] | undefined = env.repos.find((r) => r.name === name);
  expect(repo).toBeDefined();
  return repo!;
}
function leafOf(env: Envelope, repo: string, slug: string): z.infer<typeof leafSchema> {
  const l: z.infer<typeof leafSchema> | undefined = repoOf(env, repo).leaves.find((l) => l.slug === slug);
  expect(l).toBeDefined();
  return l!;
}

test('status --json covers every registered repo from any folder', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    leaf(f, 'home-leaf', 'implement');
    leaf(g, 'other-leaf', 'check.review', { repo: 'other' });
    register(f, { repo: f.root, other: g.root });
    for (const cwd of [f.root, '/']) {
      const before: number = Date.now();
      const result: Result = await cli(f, ['status', '--json'], cwd);
      expect(result.code).toBe(0);
      const env: Envelope = envelope(result);
      expect(env.generated).toBeGreaterThanOrEqual(before);
      expect(env.repos.map((r) => r.name)).toEqual(['other', 'repo']);
      expect(repoOf(env, 'repo').root).toBe(f.root);
      expect(repoOf(env, 'other').root).toBe(g.root);
      expect(repoOf(env, 'other').leaves.map((l) => l.slug)).toEqual(['other-leaf']);
    }
    for (const args of [
      ['status', '--json', 'x'],
      ['status', '--json', '--charts'],
    ]) {
      expect((await cli(f, args)).code).not.toBe(0);
    }
  } finally {
    f.clean();
    g.clean();
  }
});

test('envelope carries every board alert fact', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'broken', 'failed', { failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'no key' } });
    const needy: string = leaf(f, 'needy', 'implement');
    yaml(resolve(needy, 'readiness.yaml'), needs('needy'));
    const bad: string = leaf(f, 'bad-leaf', 'implement');
    writeFileSync(resolve(bad, 'state.yaml'), 'slug: [');
    yaml(resolve(f.home, 'deploy.yaml'), {
      attempted: 'abc123def4567890abc123def4567890abc123de',
      ok: false,
      step: 'verify',
      error: 'typecheck failed',
    });
    yaml(resolve(f.home, 'paused.yaml'), { other: true });
    register(f, { repo: f.root, other: '/nonexistent-registered-path' });
    mkdirSync(resolve(f.root, 'issues/closed/finished'), { recursive: true });
    writeFileSync(resolve(f.root, 'issues/closed/finished/x.log'), 'x\n');
    const slowLine: string = JSON.stringify({
      run: 'slowrun',
      repo: 'repo',
      leaf: 'old',
      sha: 'a',
      tree: 't',
      scope: 'merge',
      path: '/p',
      pid: 1,
      boot_id: 'b',
      commands: [],
      start: '2026-01-01T00:00:00.000Z',
      slow: { ms: 600000, normal_ms: 300000, first: { run: 'first-run', leaf: 'firstleaf' } },
    });
    writeFileSync(resolve(f.root, 'issues/verify-runs.jsonl'), slowLine + '\n');
    seedRunRecord(f, { run: 'waiting-run', state: 'waiting' });
    const result: Result = await cli(f, ['status', '--json']);
    expect(result.code).toBe(1);
    const env: Envelope = envelope(result);
    const repo = repoOf(env, 'repo');
    expect(leafOf(env, 'repo', 'broken').red).toBe(true);
    expect(leafOf(env, 'repo', 'broken').failure).toMatchObject({ cause: 'blocked', reason: 'no key' });
    expect(leafOf(env, 'repo', 'needy').missing).toEqual([
      { kind: 'env', name: 'FOO', holder: 'repo', steps: 'ask the vault for FOO' },
    ]);
    expect(leafOf(env, 'repo', 'needy').red).toBe(true);
    expect(repo.unreadable).toEqual([{ path: resolve(bad, 'state.yaml'), error: expect.any(String) }]);
    expect(repo.slow).toEqual({ leaf: 'firstleaf', run: 'first-run', ms: 600000, normal_ms: 300000 });
    expect(repo.unpacked).toEqual([{ path: 'issues/closed/finished', command: 'akrogon pack issues/closed/finished' }]);
    expect(env.deploy).toMatchObject({
      failed: true,
      attempted: 'abc123def4567890abc123def4567890abc123de',
      step: 'verify',
    });
    expect(env.run).toContain('run line (one per repo)');
    expect(env.run).toContain('waiting-run');
    expect(repoOf(env, 'other').error).toContain('/nonexistent-registered-path');
    expect(repoOf(env, 'other').unreadable).toHaveLength(1);
    // red = broken + needy + bad-leaf + other + deploy = 5
    expect(env.red).toBe(5);
  } finally {
    f.clean();
  }
});

test('envelope carries row and section facts', async () => {
  const f: Fixture = await fixture();
  try {
    const parked = resolve(f.root, 'issues/parked/dormant');
    mkdirSync(resolve(parked, 'resting'), { recursive: true });
    writeFileSync(resolve(parked, 'resting/state.yaml'), 'slug: resting\n');
    leaf(f, 'dep-open', 'implement');
    leaf(f, 'dep-done', 'merged');
    const depParked = 'resting';
    leaf(f, 'waiter', 'implement', { 'blocked-by': ['dep-open', 'dep-done', depParked, 'ghost'] });
    yaml(resolve(f.home, 'stopped.yaml'), { 'repo/stopped-leaf': true });
    leaf(f, 'stopped-leaf', 'implement');
    leaf(f, 'holder', 'merge', { merge_stamp: new Date(Date.now() - 20 * 60000).toISOString() });
    leaf(f, 'second', 'merge', { merge_stamp: new Date(Date.now() - 10 * 60000).toISOString() });
    leaf(f, 'unmarked', 'merge');
    leaf(f, 'broad', 'merged', {
      broadcast: { kind: 'issue', name: 'broad', destination: 'discord', pushed: 'now', sources: [] },
    });
    leaf(f, 'landing', 'merge', {
      batch: { attempt: 'xyz123', built_on: 'main', holder: { base: 'a', head: 'b' }, applied: true, owner: 'command' },
    });
    mkdirSync(resolve(f.home, 'reconcile'), { recursive: true });
    writeFileSync(
      resolve(f.home, 'reconcile', 'repo.json'),
      JSON.stringify({ kept: [{ path: '/kept-one', reason: 'uncommitted changes' }] }) + '\n',
    );
    writeFileSync(
      resolve(f.home, 'reconcile-host.json'),
      JSON.stringify({ kept: [{ path: 'akrogon-x.slice', reason: 'live tab' }] }) + '\n',
    );
    mkdirSync(resolve(f.root, 'issues/chart/alpha'), { recursive: true });
    writeFileSync(resolve(f.root, 'issues/chart/alpha/CHART.md'), '# Chart: alpha\n\n## Fog\n- a gap\n');
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    const repo = repoOf(env, 'repo');
    expect(leafOf(env, 'repo', 'stopped-leaf').stopped).toBe(true);
    expect(leafOf(env, 'repo', 'waiter').stopped).toBe(false);
    expect(leafOf(env, 'repo', 'waiter').blocked_by).toEqual([
      { slug: 'dep-open', label: 'implement' },
      { slug: 'dep-done', label: 'merged' },
      { slug: 'resting', label: 'parked' },
      { slug: 'ghost', label: 'missing' },
    ]);
    expect(leafOf(env, 'repo', 'broad').broadcast_pending).toBe(true);
    expect(leafOf(env, 'repo', 'holder').broadcast_pending).toBe(false);
    const land = leafOf(env, 'repo', 'landing').land;
    expect(land).not.toBeNull();
    expect(land!.unit).toBe('akrogon-land-xyz123');
    expect(leafOf(env, 'repo', 'holder').land).toBeNull();
    expect(repo.queue).toEqual([
      { slug: 'landing', place: 1, no_record: true },
      { slug: 'holder', place: 2, no_record: false },
      { slug: 'second', place: 3, no_record: false },
      { slug: 'unmarked', place: 4, no_record: true },
    ]);
    expect(repo.kept).toEqual([{ path: '/kept-one', reason: 'uncommitted changes' }]);
    expect(env.kept).toEqual([{ path: 'akrogon-x.slice', reason: 'live tab' }]);
    expect(repo.parked).toEqual(['dormant']);
    expect(repo.charts).toHaveLength(1);
    expect(repo.charts[0][0].trim()).toBe('alpha');
  } finally {
    f.clean();
  }
});

test('a leaf waits on parked, missing and unreadable deps while merged and live ones stay calm', async () => {
  const f: Fixture = await fixture();
  try {
    const parked: string = resolve(f.root, 'issues/parked/dormant');
    mkdirSync(resolve(parked, 'resting'), { recursive: true });
    writeFileSync(resolve(parked, 'resting/state.yaml'), 'slug: resting\n');
    leaf(f, 'dep-live', 'implement');
    leaf(f, 'dep-done', 'merged');
    const depDead: string = leaf(f, 'dep-dead', 'implement');
    writeFileSync(resolve(depDead, 'state.yaml'), 'slug: [');
    leaf(f, 'waiter', 'implement', {
      'blocked-by': ['dep-live', 'dep-done', 'resting', 'dep-dead', 'ghost'],
    });
    leaf(f, 'quiet', 'implement', { 'blocked-by': ['dep-live', 'dep-done'] });
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    const waiter = leafOf(env, 'repo', 'waiter');
    const quiet = leafOf(env, 'repo', 'quiet');
    expect([waiter.attention, quiet.attention]).toEqual([
      [
        'waiting on resting (parked)',
        'waiting on dep-dead (unreadable)',
        'waiting on ghost (missing)',
      ],
      [],
    ]);
    expect([waiter.red, quiet.red]).toEqual([true, false]);
    // env.red = 1 red leaf + 1 unreadable dep leaf.
    expect(env.red).toBe(2);
  } finally {
    f.clean();
  }
});

test('a stopped command-owned land job is an attention fact only while unrecorded and dead', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const batch = (attempt: string, extra: object = {}): object => ({
      attempt,
      built_on: 'main',
      holder: { base: 'a', head: 'b' },
      applied: true,
      owner: 'command',
      ...extra,
    });
    leaf(f, 'land-dead', 'merge', { batch: batch('deadjob') });
    leaf(f, 'land-live', 'merge', { batch: batch('livejob') });
    leaf(f, 'land-pushed', 'merge', { batch: batch('pushedjob', { recorded: true }) });
    leaf(f, 'land-seat', 'merge', { batch: batch('seatjob', { owner: 'seat' }) });
    writeFileSync(
      systemctl.db,
      JSON.stringify({ units: [{ unit: 'akrogon-land-livejob.service', sub: 'running' }] }),
    );
    const env: Envelope = envelope(
      await cli(f, ['status', '--json'], f.root, {
        ...systemctl.env,
        PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
      }),
    );
    expect(
      ['land-dead', 'land-live', 'land-pushed', 'land-seat'].map(
        (slug) => leafOf(env, 'repo', slug).attention,
      ),
    ).toEqual([['merge job stopped'], [], [], []]);
    expect(leafOf(env, 'repo', 'land-dead').red).toBe(true);
    expect(env.red).toBe(1);
  } finally {
    f.clean();
  }
});

test('a leaf carries failed, missing and prompt facts and a clean leaf carries none', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'failed-rec', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'no key' },
    });
    leaf(f, 'failed-bare', 'failed');
    const needy: string = leaf(f, 'needy', 'implement');
    yaml(resolve(needy, 'readiness.yaml'), needs('needy'));
    const undeliv: string = leaf(f, 'undeliv', 'implement');
    saveState(undeliv, {
      ...readState(undeliv),
      delivery_error: {
        A: { command: ['x'], code: 'timeout', message: 'm', pane: 'p', session: null, at: new Date().toISOString() },
      },
    });
    const undelivBusy: string = leaf(f, 'undeliv-busy', 'implement', {
      busy_since: { B: new Date().toISOString() },
    });
    saveState(undelivBusy, {
      ...readState(undelivBusy),
      delivery_error: {
        B: { command: ['x'], code: 'gone', message: 'm', pane: 'p', session: null, at: new Date().toISOString() },
      },
    });
    leaf(f, 'clean', 'implement');
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    expect(
      ['failed-rec', 'failed-bare', 'needy', 'undeliv', 'undeliv-busy', 'clean'].map(
        (slug) => leafOf(env, 'repo', slug).attention,
      ),
    ).toEqual([
      ['failed: blocked: no key'],
      ['failed'],
      ['missing env FOO'],
      ['A prompt timeout'],
      [],
      [],
    ]);
    expect([leafOf(env, 'repo', 'undeliv-busy').red, leafOf(env, 'repo', 'clean').red]).toEqual([
      false,
      false,
    ]);
  } finally {
    f.clean();
  }
});

test('waits_on names the unfinished idle required seats of the phase', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'both-idle', 'check.review');
    leaf(f, 'after-fix', 'check.review', { fix_rounds: 1 });
    leaf(f, 'a-done', 'check.review', { done: ['A'] });
    leaf(f, 'a-busy', 'check.review', { busy_since: { A: new Date().toISOString() } });
    leaf(f, 'single', 'implement');
    leaf(f, 'over', 'merged');
    leaf(f, 'dead', 'failed');
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    expect(
      ['both-idle', 'after-fix', 'a-done', 'a-busy', 'single', 'over', 'dead'].map(
        (slug) => leafOf(env, 'repo', slug).waits_on,
      ),
    ).toEqual([['A', 'B'], ['B'], ['B'], ['B'], ['A'], [], []]);
  } finally {
    f.clean();
  }
});

test('blocked_by resolves a merged dependency in a closed owner', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'done-dep', 'merged', {}, 'finished');
    mkdirSync(resolve(f.root, 'issues/closed/finished'), { recursive: true });
    renameSync(path, resolve(f.root, 'issues/closed/finished/done-dep'));
    leaf(f, 'waiter', 'implement', { 'blocked-by': ['done-dep'] });

    const result: Result = await cli(f, ['status', '--json']);
    expect(result.code).toBe(0);
    const env: Envelope = envelope(result);
    expect(leafOf(env, 'repo', 'waiter').blocked_by).toEqual([{ slug: 'done-dep', label: 'merged' }]);
  } finally {
    f.clean();
  }
});

test('one unreadable repo exits 1 and still prints the full envelope', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    leaf(g, 'visible', 'implement', { repo: 'good' });
    register(f, { bad: resolve(f.home, 'missing-repo'), good: g.root });
    const result: Result = await cli(f, ['status', '--json'], f.home);
    expect(result.code).toBe(1);
    const env: Envelope = envelope(result);
    expect(repoOf(env, 'good').leaves.map((l) => l.slug)).toEqual(['visible']);
    const bad = repoOf(env, 'bad');
    expect(bad.error).toContain('missing-repo');
    expect(bad.root).toBe(resolve(f.home, 'missing-repo'));
    expect(bad.leaves).toEqual([]);
    expect(env.red).toBe(1);
  } finally {
    f.clean();
    g.clean();
  }
});

test('each open leaf carries the detail fields status <slug> prints', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(
      f,
      'deep',
      'implement',
      { attempts: { A: 2, B: 1 }, fix_rounds: 1, verdict: { A: 'fix' }, done: ['A'] },
      'epic/job',
    );
    const at: number = Date.now();
    timings(f, [prompt('deep', 30, 'delivered', at)]);
    log(
      f,
      Array.from({ length: 13 }, (_, i) =>
        event('deep', i % 2 === 0 ? 'implement' : 'check.review', 20 - i, `r${i}`, at),
      ),
    );
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    const l = leafOf(env, 'repo', 'deep');
    expect(l.group).toEqual(['epic', 'job']);
    expect(l.phase).toBe('implement');
    expect(l.phase_since).toBe(at - 8 * 60000);
    expect(l.first_prompt).toBe(at - 30 * 60000);
    expect(l.attempts).toEqual({ A: 2, B: 1 });
    expect(l.fix_rounds).toBe(1);
    expect(l.verdict).toEqual({ A: 'fix' });
    expect(l.done).toEqual(['A']);
    expect(l.worktree).toBe(resolve(storeDir(f), 'deep'));
    expect(l.plan).toBe(resolve(path, 'plan.md'));
    expect(l.seats.a).toEqual({
      harness: 'fake',
      command: 'fake',
      source: resolve(f.home, 'config.yaml'),
    });
    expect(l.seats.b.harness).toBe('fake');
    expect(l.history).toHaveLength(10);
    expect(l.history[9]).toContain('r12');
    expect(l.delivery_errors).toEqual({ a: null, b: null });
    expect(l.busy_since).toEqual({ a: null, b: null });
  } finally {
    f.clean();
  }
});

test('merges hold the 5 most recent across repos and charts match --charts rows', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    register(f, { repo: f.root, other: g.root });
    const at: number = Date.now();
    mkdirSync(resolve(f.root, 'issues/closed/issue'), { recursive: true });
    const lines: string[] = [];
    const tlines: string[] = [];
    for (let i = 0; i < 4; i++) {
      const p: string = leaf(f, `merged-${i}`, 'merged', {}, 'issue');
      renameSync(p, resolve(f.root, 'issues/closed', `issue/merged-${i}`));
      lines.push(event(`merged-${i}`, 'merged', 100 - i * 10, '', at));
      tlines.push(prompt(`merged-${i}`, 130 - i * 10, 'delivered', at));
    }
    mkdirSync(resolve(g.root, 'issues/closed/issue'), { recursive: true });
    const glines: string[] = [];
    const gtlines: string[] = [];
    for (let i = 0; i < 3; i++) {
      const p: string = leaf(g, `other-${i}`, 'merged', { repo: 'other' }, 'issue');
      renameSync(p, resolve(g.root, 'issues/closed', `issue/other-${i}`));
      glines.push(JSON.stringify({ ...JSON.parse(event(`other-${i}`, 'merged', 45 - i * 10, '', at)), repo: 'other' }));
      gtlines.push(prompt(`other-${i}`, 80 - i * 10, 'delivered', at));
    }
    // A merged leaf still in open counts once via closed only; a closed non-merged leaf is excluded.
    leaf(f, 'staying', 'failed');
    log(f, lines);
    timings(f, tlines);
    log(g, glines);
    timings(g, gtlines);
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    expect(env.merges).toHaveLength(5);
    expect(env.merges.map((m) => `${m.repo}/${m.slug}`)).toEqual([
      'other/other-2',
      'other/other-1',
      'other/other-0',
      'repo/merged-3',
      'repo/merged-2',
    ]);
    expect(env.merges[0].merged).toBe(at - 25 * 60000);
    expect(env.merges[0].total_ms).toBe(35 * 60000);
    const texts: string[] = env.merges.map((m) => `${m.slug}`);
    expect(texts).not.toContain('staying');
    expect(repoOf(env, 'repo').leaves.map((l) => l.slug)).toEqual(['staying']);
  } finally {
    f.clean();
    g.clean();
  }
});

test('recent merges include merged leaves in unfinished owners', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'older', 'merged', {}, 'finished');
    mkdirSync(resolve(f.root, 'issues/closed/finished'), { recursive: true });
    renameSync(path, resolve(f.root, 'issues/closed/finished/older'));
    leaf(f, 'latest', 'merged');
    leaf(f, 'unfinished', 'implement');
    const at: number = Date.now();
    log(f, [event('older', 'merged', 20, '', at), event('latest', 'merged', 5, '', at)]);
    timings(f, [prompt('older', 60, 'delivered', at), prompt('latest', 15, 'delivered', at)]);

    const result: Result = await cli(f, ['status', '--json']);
    expect(result.code).toBe(0);
    const env: Envelope = envelope(result);
    expect(env.merges).toEqual([
      { repo: 'repo', slug: 'latest', merged: at - 5 * 60000, total_ms: 10 * 60000 },
      { repo: 'repo', slug: 'older', merged: at - 20 * 60000, total_ms: 40 * 60000 },
    ]);
  } finally {
    f.clean();
  }
});

test('red counts real blocks once and never counts amber or time', async () => {
  const f: Fixture = await fixture();
  try {
    // Amber-only state: slow merge and a paused repo contribute no red.
    const slowLine: string = JSON.stringify({
      run: 'r',
      repo: 'repo',
      leaf: 'l',
      sha: 's',
      tree: 't',
      scope: 'merge',
      path: '/p',
      pid: 1,
      boot_id: 'b',
      commands: [],
      start: '2026-01-01T00:00:00.000Z',
      slow: { ms: 600000, normal_ms: 300000, first: { run: 'fr', leaf: 'fl' } },
    });
    writeFileSync(resolve(f.root, 'issues/verify-runs.jsonl'), slowLine + '\n');
    leaf(f, 'live-dep', 'implement');
    leaf(f, 'quiet', 'implement', { 'blocked-by': ['live-dep'] });
    const busyPath: string = leaf(f, 'busy-err', 'implement', { busy_since: { A: new Date().toISOString() } });
    saveState(busyPath, {
      ...readState(busyPath),
      delivery_error: {
        A: { command: ['x'], code: 'timeout', message: 'm', pane: 'p', session: null, at: new Date().toISOString() },
      },
    });
    yaml(resolve(f.home, 'paused.yaml'), { repo: true });
    let env: Envelope = envelope(await cli(f, ['status', '--json']));
    expect(env.red).toBe(0);
    expect(leafOf(env, 'repo', 'busy-err').red).toBe(false);
    expect(leafOf(env, 'repo', 'busy-err').delivery_errors.a).toMatchObject({ code: 'timeout' });
    expect(repoOf(env, 'repo').paused).toBe(true);
    // Now the delivery error is visible and a gap appears: each counts once.
    saveState(busyPath, { ...readState(busyPath), busy_since: {} });
    const needy: string = leaf(f, 'needy', 'implement');
    yaml(resolve(needy, 'readiness.yaml'), needs('needy'));
    leaf(f, 'dead', 'failed');
    env = envelope(await cli(f, ['status', '--json']));
    expect(env.red).toBe(3);
    expect(leafOf(env, 'repo', 'busy-err').red).toBe(true);
    expect(leafOf(env, 'repo', 'needy').red).toBe(true);
    expect(leafOf(env, 'repo', 'dead').red).toBe(true);
    expect(leafOf(env, 'repo', 'quiet').red).toBe(false);
  } finally {
    f.clean();
  }
});

test('watch names each repo issues dir and runs plus the named files, never the home itself', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    register(f, { repo: f.root, other: g.root });
    const env: Envelope = envelope(await cli(f, ['status', '--json']));
    expect(env.watch.folders).toEqual([resolve(g.root, 'issues'), resolve(f.root, 'issues'), resolve(f.home, 'runs')]);
    expect(env.watch.files).toEqual([
      resolve(f.home, 'config.yaml'),
      resolve(f.home, 'paused.yaml'),
      resolve(f.home, 'stopped.yaml'),
      resolve(f.home, 'reconcile-host.json'),
      resolve(f.home, 'deploy.yaml'),
      resolve(f.home, 'current'),
    ]);
    expect(env.watch.folders).not.toContain(f.home);
    expect(env.watch.files).not.toContain(f.home);
  } finally {
    f.clean();
    g.clean();
  }
});

test('status --json writes nothing under the home or any repo', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'idle', 'implement');
    const before: Record<string, string> = snapshot(f.home);
    const result: Result = await cli(f, ['status', '--json']);
    expect(result.code).toBe(0);
    envelope(result);
    expect(snapshot(f.home)).toEqual(before);
    expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
  } finally {
    f.clean();
  }
});
