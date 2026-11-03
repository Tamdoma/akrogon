import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  board,
  pill,
  pinIntent,
  filesChanged,
  leafRows,
  type Envelope,
  type BoardContext,
  type Board,
  type RowModel,
} from '../herdr-app/tasks/model';
import { next, type ScanEvent } from '../herdr-app/tasks/schedule';

const envelope: Envelope = JSON.parse(readFileSync(resolve(import.meta.dir, 'fixtures/status-envelope.json'), 'utf8'));

const noSpace: BoardContext = {
  now: envelope.generated + 90_000,
  spaceName: 'unmatched-space',
  spaceFolder: '/nonexistent/folder',
  agents: [
    {
      key: 'pi',
      run: ['pi'],
      icon: 'icons/pi.svg',
      tint: true,
      tile: null,
      color: '#fff',
      name: 'Pi',
      shell: false,
      agent: true,
      installed: true,
    },
    {
      key: 'codex',
      run: ['codex'],
      icon: 'icons/codex.png',
      tint: false,
      tile: null,
      color: null,
      name: 'Codex',
      shell: false,
      agent: true,
      installed: true,
    },
  ],
};

const akrogonSpace: BoardContext = {
  ...noSpace,
  spaceName: 'akrogon',
  spaceFolder: '/home/ivan',
};

test('board orders the current space repo first, then alphabetical, and folds every empty repo into one quiet line', () => {
  const withSpace: Board = board(envelope, akrogonSpace);
  const named = envelope.repos
    .filter((repo) => repo.leaves.length === 0 && repo.error === null && repo.unreadable.length === 0)
    .map((repo) => repo.name);
  expect(named.length).toBeGreaterThan(0);
  expect(withSpace.repos.some((repo) => named.includes(repo.name))).toBe(false);
  expect(withSpace.quiet).toEqual([...named].sort((a, b) => a.localeCompare(b)));
  expect(withSpace.quietLine).toBe(`No open tasks: ${withSpace.quiet.join(', ')}`);
  const shown = envelope.repos.filter((repo) => !named.includes(repo.name)).map((repo) => repo.name);
  if (shown.includes('akrogon')) expect(withSpace.repos[0].name).toBe('akrogon');
  const rest: string[] = withSpace.repos.filter((repo) => repo.name !== 'akrogon').map((repo) => repo.name);
  expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b)));
  const withoutMatch: Board = board(envelope, noSpace);
  expect(withoutMatch.repos.map((repo) => repo.name)).toEqual([...shown].sort((a, b) => a.localeCompare(b)));
});

test('a space folder inside the repo root or its worktree store counts as that repo', () => {
  const inRoot: Board = board(envelope, { ...noSpace, spaceFolder: '/home/ivan/Work/infra/herdr-setup/docs' });
  expect(inRoot.repos[0].name).toBe('herdr-setup');
  const inStore: Board = board(envelope, {
    ...noSpace,
    spaceFolder: '/home/ivan/.akrogon/worktrees/framework/about-identity-title',
  });
  expect(inStore.repos[0].name).toBe('framework');
});

test('leaf rows carry seat logo choices, red flag, uncolored time and tags; red only where the envelope marks it', () => {
  const out: Board = board(envelope, akrogonSpace);
  const rows: RowModel[] = leafRows(out);
  const tasksMod: RowModel | undefined = rows.find((row) => row.slug === 'tasks-mod');
  expect(tasksMod).toBeDefined();
  expect(tasksMod!.seats.a.logo).toBe('icons/pi.svg');
  expect(tasksMod!.seats.a.tint).toBe(true);
  expect(tasksMod!.seats.a.busy).toBe(true);
  expect(tasksMod!.seats.b.logo).toBe('icons/codex.png');
  expect(tasksMod!.seats.b.busy).toBe(false);
  expect(tasksMod!.pill?.slot).toBe('ansi4');
  expect(tasksMod!.groupPath).toBe('tasks-board');
  expect(typeof tasksMod!.time).toBe('string');
  expect(tasksMod!.time).not.toMatch(/ansi|\x1b/);
  const redRows: RowModel[] = rows.filter((row) => row.red);
  const flagged: string[] = envelope.repos.flatMap((repo) =>
    repo.leaves.filter((leaf) => leaf.red).map((leaf) => leaf.slug),
  );
  expect(redRows.map((row) => row.slug).sort()).toEqual(flagged.sort());
  expect(tasksMod!.tags).toContain('blocked-by status-json (merged)');
  const merged: RowModel | undefined = rows.find((row) => row.slug === 'status-json');
  expect(merged!.pill).toBeNull();
});

test('unknown seat programs fall back to the seat letter', () => {
  const derived: Envelope = JSON.parse(JSON.stringify(envelope));
  const leaf = derived.repos[0].leaves[1];
  leaf.seats = {
    a: { harness: 'mystery', command: 'mystery-bin', source: 'x' },
    b: { harness: 'pi', command: 'pi', source: 'x' },
  };
  const rows: RowModel[] = leafRows(board(derived, akrogonSpace));
  const row: RowModel = rows.find((r) => r.slug === leaf.slug)!;
  expect(row.seats.a.logo).toBeNull();
  expect(row.seats.b.logo).toBe('icons/pi.svg');
});

test('pill maps stage words to ANSI slots and merged to none', () => {
  expect(pill('plan')).toEqual({ slot: 'ansi4' });
  expect(pill('implement')).toEqual({ slot: 'ansi6' });
  expect(pill('check')).toEqual({ slot: 'ansi5' });
  expect(pill('merge')).toEqual({ slot: 'ansi2' });
  expect(pill('failed')).toEqual({ slot: 'ansi1' });
  expect(pill('merged')).toBeNull();
  expect(pill('parked')).toEqual({ slot: 'muted' });
  expect(pill('plan.synthesis')).toEqual({ slot: 'ansi4' });
});

test('an error envelope keeps healthy repos and yields alert lines, never blank', () => {
  const derived: Envelope = JSON.parse(JSON.stringify(envelope));
  const broken = derived.repos.find((repo) => repo.name === 'blepsis')!;
  broken.error = 'zod: state.yaml missing slug';
  broken.unreadable = [{ path: '/x/state.yaml', error: 'zod: state.yaml missing slug' }];
  derived.deploy = {
    failed: true,
    attempted: 'abcd1234efgh',
    active: '9999',
    step: 'links',
    error: 'conflict at /home/x',
  };
  derived.repos.find((repo) => repo.name === 'framework')!.slow = {
    leaf: 'fixture-weave-recorder',
    run: 'r1',
    ms: 3_900_000,
    normal_ms: 1_200_000,
  };
  const out: Board = board(derived, akrogonSpace);
  expect(out.repos.length).toBeGreaterThan(0);
  expect(out.alerts.length).toBeGreaterThan(0);
  expect(out.alerts.some((line) => line.color === 'ansi1' && line.text.includes('deploy failed'))).toBe(true);
  expect(out.alerts.some((line) => line.color === 'ansi1' && line.text.includes('state.yaml missing slug'))).toBe(true);
  expect(out.alerts.some((line) => line.color === 'ansi3' && line.text.includes('Slow merge: framework'))).toBe(true);
  const blepsis = out.repos.find((repo) => repo.name === 'blepsis')!;
  expect(blepsis.folded).toBe(false);
  const allError: Envelope = JSON.parse(JSON.stringify(envelope));
  for (const repo of allError.repos) repo.error = 'unreadable';
  expect(board(allError, akrogonSpace).alerts.length).toBeGreaterThan(0);
});

test('pin intents merge the space pin and emit an open request with a higher seq', () => {
  const leaf = envelope.repos[0].leaves[1];
  const existing = { otherSpace: { machine: 'vps', folder: '/x' } };
  const intents = pinIntent('w8:s1', leaf, 'files', existing, 7);
  expect(intents.pin).toEqual({
    otherSpace: { machine: 'vps', folder: '/x' },
    'w8:s1': { machine: null, folder: leaf.worktree },
  });
  expect(intents.request).toEqual({ op: 'open', view: 'files', seq: 8 });
  const changes = pinIntent('w8:s1', leaf, 'changes', existing, 8);
  expect(changes.request).toEqual({ op: 'open', view: 'changes', seq: 9 });
});

test('filesChanged rescan triggers on changed, absent or appearing watch.files', () => {
  const before: Record<string, string | null> = { '/a': 'one', '/b': 'two' };
  expect(filesChanged(before, { '/a': 'one', '/b': 'two' })).toBe(false);
  expect(filesChanged(before, { '/a': 'one', '/b': 'changed' })).toBe(true);
  expect(filesChanged(before, { '/a': 'one' })).toBe(true);
  expect(filesChanged(before, { '/a': 'one', '/b': 'two', '/c': 'new' })).toBe(true);
  expect(filesChanged({ '/a': null }, { '/a': 'appeared' })).toBe(true);
});

test('a folder hit or file diff rescans only when no scan runs', () => {
  const events: ScanEvent[] = ['folder-hit', 'files-changed', 'scan-failed', 'tick'];
  for (const event of ['folder-hit', 'files-changed'] as const) {
    expect(next(event, false)).toEqual({ rescan: true });
    expect(next(event, true)).toEqual({ rescan: false });
  }
  expect(next('scan-failed', false)).toEqual({ rescan: true });
  expect(next('tick', false)).toEqual({ rescan: false });
  expect(next('tick', true)).toEqual({ rescan: false });
});

test('last merges fold across repos with age and total time', () => {
  const out: Board = board(envelope, { ...noSpace, now: envelope.generated + 3_600_000 });
  expect(out.mergesFolded).toBeTruthy();
  expect(out.merges.length).toBeLessThanOrEqual(5);
  expect(out.merges[0]).toMatchObject({ repo: 'akrogon', slug: 'status-json' });
  expect(out.merges[0].age).toMatch(/\d+[mhd]/);
});

test('paused repository rows use grey pills and merged rows retain no pill', () => {
  const paused: Envelope = structuredClone(envelope);
  const repo = paused.repos.find((repo) => repo.name === 'akrogon')!;
  repo.paused = true;
  const rows: RowModel[] = leafRows(board(paused, akrogonSpace)).filter((row) => row.repo === repo.name);
  for (const row of rows) expect(row.pill).toEqual(row.phase === 'merged' ? null : { slot: 'muted' });
});

test('housekeeping lines fold under one count, apart from the alerts', () => {
  const derived: Envelope = JSON.parse(JSON.stringify(envelope));
  derived.repos[0].unpacked = [
    { path: 'issues/closed/a', command: 'akrogon pack issues/closed/a' },
    { path: 'issues/closed/b', command: 'akrogon pack issues/closed/b' },
  ];
  derived.kept = [{ path: '/x/verify-passes/1', reason: 'verify pass younger than 60m' }];
  const others = derived.repos.slice(1).reduce((sum, repo) => sum + repo.unpacked.length, 0);
  const out: Board = board(derived, akrogonSpace);
  expect(out.alerts.some((line) => line.text.startsWith('Unpacked:') || line.text.startsWith('Kept:'))).toBe(false);
  expect(out.housekeeping.length).toBe(2 + others + 1);
  expect(out.housekeepingFolded).toBe(`Housekeeping (${2 + others + 1})`);
});

test("a leaf's second line shows its last move, never the raw log line", () => {
  const derived: Envelope = JSON.parse(JSON.stringify(envelope));
  const repo = derived.repos.find((r) => r.leaves.length > 0)!;
  const leaf = repo.leaves[0];
  leaf.history = [
    JSON.stringify({ ts: '2026-11-03T16:35:52.734Z', repo: repo.name, slug: leaf.slug, from: 'implement', to: 'failed', slot: 'A' }),
  ];
  const row: RowModel = leafRows(board(derived, akrogonSpace)).find((r) => r.slug === leaf.slug)!;
  expect(row.line2).not.toContain('{');
  expect(row.line2).toContain('implement → failed');
});

test('quiet repos keep their charts reachable under one fold', () => {
  const out: Board = board(envelope, akrogonSpace);
  const expected = envelope.repos
    .filter((repo) => out.quiet.includes(repo.name) && repo.charts.length > 0)
    .map((repo) => ({ repo: repo.name, charts: repo.charts }))
    .sort((a, b) => a.repo.localeCompare(b.repo));
  expect(expected.length).toBeGreaterThan(0);
  expect(out.quietCharts).toEqual(expected);
  expect(out.quietChartsFolded).toBe(`Charts (${expected.reduce((sum, entry) => sum + entry.charts.length, 0)})`);
});
