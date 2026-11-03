import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  board,
  pinIntent,
  filesChanged,
  leafRows,
  since,
  type Envelope,
  type BoardContext,
  type Board,
  type LeafJson,
  type RowModel,
  type SectionName,
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

function derived(): Envelope {
  return JSON.parse(JSON.stringify(envelope));
}

function leafOf(env: Envelope, repo: string, slug: string): LeafJson {
  return env.repos.find((r) => r.name === repo)!.leaves.find((l) => l.slug === slug)!;
}

function sectionOf(b: Board, name: SectionName): RowModel[] {
  return b.sections.find((s) => s.name === name)?.rows ?? [];
}

function rowOf(b: Board, slug: string): RowModel | undefined {
  return leafRows(b).find((r) => r.slug === slug);
}

// The criterion-1 envelope: one repo holding a failed leaf, a working leaf, a
// leaf blocked by a live leaf, a stopped leaf and a merged leaf under an open
// epic, plus a merged leaf still broadcasting and a parked entry.
function criterionEnvelope(): Envelope {
  const env = derived();
  const repo = env.repos.find((r) => r.name === 'akrogon')!;
  const base = repo.leaves.find((l) => l.slug === 'tasks-mod')!;
  const make = (slug: string, extra: Partial<LeafJson>): LeafJson =>
    ({ ...JSON.parse(JSON.stringify(base)), slug, group: ['epic-open'], ...extra }) as LeafJson;
  repo.leaves = [
    make('failed-leaf', {
      phase: 'failed',
      attention: ['failed: check: review found defects'],
      red: true,
      busy_since: { a: null, b: null },
      blocked_by: [],
    }),
    make('working-leaf', {
      phase: 'implement',
      busy_since: { a: env.generated - 9 * 60_000, b: null },
      blocked_by: [],
      attention: [],
    }),
    make('blocked-leaf', {
      phase: 'plan.synthesis',
      busy_since: { a: null, b: null },
      blocked_by: [{ slug: 'working-leaf', label: 'implement' }],
      attention: [],
      waits_on: [],
    }),
    make('stopped-leaf', {
      phase: 'implement',
      stopped: true,
      busy_since: { a: env.generated - 30 * 60_000, b: null },
      blocked_by: [],
      attention: [],
    }),
    make('merged-leaf', { phase: 'merged', busy_since: { a: null, b: null }, blocked_by: [], attention: [] }),
    make('broadcast-leaf', {
      phase: 'merged',
      broadcast_pending: true,
      busy_since: { a: null, b: null },
      blocked_by: [],
      attention: [],
    }),
  ];
  repo.parked = ['parked-slug'];
  return env;
}

test('the board groups rows under Needs you, Working, Waiting, Paused; merged and empty sections hidden; parked rows carry no target', () => {
  const out: Board = board(criterionEnvelope(), noSpace);
  expect(out.sections.map((s) => s.name)).toEqual(['Needs you', 'Working', 'Waiting', 'Paused']);
  expect(sectionOf(out, 'Needs you').map((r) => r.slug)).toEqual(['failed-leaf']);
  expect(sectionOf(out, 'Working').map((r) => r.slug)).toContain('working-leaf');
  expect(sectionOf(out, 'Waiting').map((r) => r.slug)).toEqual(
    expect.arrayContaining(['blocked-leaf', 'broadcast-leaf']),
  );
  const paused: RowModel[] = sectionOf(out, 'Paused');
  expect(paused.map((r) => r.slug).sort()).toEqual(['parked-slug', 'stopped-leaf']);
  expect(rowOf(out, 'merged-leaf')).toBeUndefined();
  const broadcast: RowModel = rowOf(out, 'broadcast-leaf')!;
  expect(broadcast.reason).toBe('broadcast pending');
  const parked: RowModel = paused.find((r) => r.slug === 'parked-slug')!;
  expect(parked.parked).toBe(true);
  expect(parked.folder).toBeNull();
  expect(parked.worktree).toBeNull();
  expect(parked.reason).toBe('parked');
  // Empty sections are omitted: the plain fixture has no attention rows.
  const plain: Board = board(envelope, akrogonSpace);
  expect(plain.sections.map((s) => s.name)).not.toContain('Needs you');
  expect(plain.sections.map((s) => s.name)).not.toContain('Paused');
  // No repo or issue-folder heading survives in the row data.
  for (const row of leafRows(out)) expect('groupPath' in row).toBe(false);
});

test('attention puts a busy leaf in Needs you with its first phrase; stopped with a busy timestamp is Paused, not Working', () => {
  const env = criterionEnvelope();
  const out: Board = board(env, noSpace);
  const failed: RowModel = rowOf(out, 'failed-leaf')!;
  expect(failed.section).toBe('Needs you');
  expect(failed.reason).toBe('failed: check: review found defects');
  expect(failed.reasonRed).toBe(true);
  // Attention beats activity: give the failed leaf a busy seat too.
  leafOf(env, 'akrogon', 'failed-leaf').busy_since.a = env.generated - 60_000;
  const still: RowModel = rowOf(board(env, noSpace), 'failed-leaf')!;
  expect(still.section).toBe('Needs you');
  expect(still.seats.a.busy).toBe(true);
  const stopped: RowModel = rowOf(board(env, noSpace), 'stopped-leaf')!;
  expect(stopped.section).toBe('Paused');
  expect(stopped.reason).toBe('stopped');
  // Attention also beats a hold.
  leafOf(env, 'akrogon', 'stopped-leaf').attention = ['merge job stopped'];
  expect(rowOf(board(env, noSpace), 'stopped-leaf')!.section).toBe('Needs you');
  // A merged leaf under a paused repo stays hidden; an attention merged leaf surfaces.
  leafOf(env, 'akrogon', 'merged-leaf').attention = ['B prompt timeout'];
  const out2: Board = board(env, noSpace);
  expect(rowOf(out2, 'merged-leaf')!.section).toBe('Needs you');
});

test('Waiting rows show live blockers, merge queue place or next seats; times use busy duration or phase age', () => {
  const env = criterionEnvelope();
  const repo = env.repos.find((r) => r.name === 'akrogon')!;
  repo.queue = [{ slug: 'broadcast-leaf', place: 2, no_record: false }];
  const out: Board = board(env, noSpace);
  expect(rowOf(out, 'blocked-leaf')!.reason).toBe('waiting on akrogon/working-leaf');
  expect(rowOf(out, 'broadcast-leaf')!.reason).toBe('broadcast pending');
  // Queue only when there is no better reason: a live dep wins over the queue.
  leafOf(env, 'akrogon', 'broadcast-leaf').broadcast_pending = false;
  leafOf(env, 'akrogon', 'broadcast-leaf').phase = 'merge';
  leafOf(env, 'akrogon', 'broadcast-leaf').blocked_by = [];
  expect(rowOf(board(env, noSpace), 'broadcast-leaf')!.reason).toBe('merge queue #2');
  // waits_on names the unstarted required seats.
  leafOf(env, 'akrogon', 'blocked-leaf').blocked_by = [];
  leafOf(env, 'akrogon', 'blocked-leaf').waits_on = ['A'];
  expect(rowOf(board(env, noSpace), 'blocked-leaf')!.reason).toBe('next: A');
  leafOf(env, 'akrogon', 'blocked-leaf').waits_on = ['A', 'B'];
  expect(rowOf(board(env, noSpace), 'blocked-leaf')!.reason).toBe('next: A+B');
  // Busy rows show the busy duration, others the phase age, in the short form.
  const working: RowModel = rowOf(board(env, noSpace), 'working-leaf')!;
  expect(working.time).toBe('10m');
  leafOf(env, 'akrogon', 'working-leaf').busy_since = { a: null, b: null };
  leafOf(env, 'akrogon', 'working-leaf').land = { alive: true, unit: 'u' };
  leafOf(env, 'akrogon', 'working-leaf').phase_since = env.generated - 4 * 3_600_000;
  const held: RowModel = rowOf(board(env, noSpace), 'working-leaf')!;
  expect(held.section).toBe('Working');
  expect(held.time).toBe('4h');
  // A dep beats the queue and merge-broadcast: first-match reason order.
  leafOf(env, 'akrogon', 'broadcast-leaf').blocked_by = [{ slug: 'working-leaf', label: 'implement' }];
  expect(rowOf(board(env, noSpace), 'broadcast-leaf')!.reason).toBe('waiting on akrogon/working-leaf');
});

test('rows with more unmerged same-repo dependents come first, ties oldest first, and show blocks N', () => {
  const env = derived();
  const repo = env.repos.find((r) => r.name === 'framework')!;
  const dep: LeafJson = leafOf(env, 'framework', 'about-identity-title');
  dep.blocked_by = [{ slug: 'fixture-weave-recorder', label: 'implement' }];
  const base: LeafJson = dep;
  const make = (slug: string, extra: Partial<LeafJson>): LeafJson =>
    ({ ...JSON.parse(JSON.stringify(base)), slug, ...extra }) as LeafJson;
  repo.leaves.push(
    make('other-waiting', { blocked_by: [], waits_on: ['A'], phase_since: env.generated - 60_000 }),
    make('second-dependent', {
      blocked_by: [{ slug: 'fixture-weave-recorder', label: 'implement' }],
      phase_since: env.generated - 40_000,
    }),
    make('unmerged-then-merged', {
      blocked_by: [
        { slug: 'fixture-weave-recorder', label: 'merged' },
        { slug: 'other-waiting', label: 'plan.synthesis' },
      ],
      phase_since: env.generated - 50_000,
    }),
  );
  const out: Board = board(env, noSpace);
  const waiting: RowModel[] = sectionOf(out, 'Waiting');
  const names: string[] = waiting.map((r) => r.slug);
  // other-waiting blocks 1 (unmerged-then-merged); fixture-weave-recorder is
  // busy so it lands in Working, ordered before the single waiting blocker.
  expect(names.indexOf('other-waiting')).toBeLessThan(names.indexOf('unmerged-then-merged'));
  expect(rowOf(out, 'other-waiting')!.blocks).toBe(1);
  expect(rowOf(out, 'unmerged-then-merged')!.blocks).toBe(0);
  // fixture-weave-recorder has two unmerged dependents; it leads its section.
  const working: RowModel[] = sectionOf(out, 'Working');
  expect(working[0].slug).toBe('fixture-weave-recorder');
  expect(working[0].blocks).toBe(2);
  // Tie on blocks: oldest phase age first, then stable input order.
  expect(names.indexOf('unmerged-then-merged')).toBeLessThan(names.indexOf('second-dependent'));
  const zero: RowModel[] = waiting.filter((r) => r.repo === 'framework' && r.blocks === 0);
  const ages: (number | null)[] = zero.map((r) => repo.leaves.find((l) => l.slug === r.slug)!.phase_since);
  expect(ages).toEqual([...ages].sort((a, b) => (a ?? Infinity) - (b ?? Infinity)));
});

test('machine lines carry deploy, unreadable, repo error and one dim run line; leaf alerts and slow merge stay off', () => {
  const env = derived();
  env.deploy = { failed: true, attempted: 'abcd1234efgh', active: '9999', step: 'links', error: 'conflict at /home/x' };
  const broken = env.repos.find((r) => r.name === 'blepsis')!;
  broken.unreadable = [{ path: '/x/state.yaml', error: 'zod: state.yaml missing slug' }];
  const errored = env.repos.find((r) => r.name === 'framework')!;
  errored.error = 'scan exploded';
  errored.slow = { leaf: 'l', run: 'r1', ms: 3_900_000, normal_ms: 1_200_000 };
  env.run = 'full test waiting behind run abc';
  const out: Board = board(env, noSpace);
  const texts: string[] = out.machine.map((l) => l.text);
  expect(texts).toContain('deploy failed at links: conflict at /home/x');
  expect(texts).toContain('blepsis · /x/state.yaml unreadable: zod: state.yaml missing slug');
  expect(texts).toContain('framework · scan exploded');
  const runLines = out.machine.filter((l) => l.text === 'run waiting');
  expect(runLines.length).toBe(1);
  expect(runLines[0].tone).toBe('dim');
  expect(runLines[0].detail).toBe('full test waiting behind run abc');
  expect(texts.some((t) => t.includes('Slow merge'))).toBe(false);
  expect(texts.some((t) => t.startsWith('Failed:') || t.startsWith('Missing:'))).toBe(false);
  // A repo with both error and unreadable entries reports the entries only.
  broken.error = 'also broken';
  const out2: Board = board(env, noSpace);
  expect(out2.machine.some((l) => l.text === 'blepsis · also broken')).toBe(false);
  // problems carries the envelope red count for the header.
  env.red = 2;
  expect(board(env, noSpace).problems).toBe(2);
});

test('rows carry seat logo choices, busy flags and the leaf folder as click target', () => {
  const out: Board = board(envelope, akrogonSpace);
  const tasksMod: RowModel = rowOf(out, 'tasks-mod')!;
  expect(tasksMod.seats.a.logo).toBe('icons/pi.svg');
  expect(tasksMod.seats.a.tint).toBe(true);
  expect(tasksMod.seats.a.busy).toBe(true);
  expect(tasksMod.seats.b.logo).toBe('icons/codex.png');
  expect(tasksMod.seats.b.busy).toBe(false);
  const leaf: LeafJson = leafOf(envelope, 'akrogon', 'tasks-mod');
  expect(tasksMod.folder).toBe(dirname(leaf.plan));
  expect(tasksMod.worktree).toBe(leaf.worktree);
  expect(tasksMod.parked).toBe(false);
});

test('unknown seat programs keep an empty cell', () => {
  const env = derived();
  const leaf = leafOf(env, 'akrogon', 'tasks-mod');
  leaf.seats = {
    a: { harness: 'mystery', command: 'mystery-bin', source: 'x' },
    b: { harness: 'pi', command: 'pi', source: 'x' },
  };
  const row: RowModel = rowOf(board(env, akrogonSpace), 'tasks-mod')!;
  expect(row.seats.a.logo).toBeNull();
  expect(row.seats.b.logo).toBe('icons/pi.svg');
});

test('the expansion detail shows the reason whole, blockers, missing steps, three moves and kept, nothing else', () => {
  const env = derived();
  const leaf = leafOf(env, 'akrogon', 'tasks-mod');
  leaf.attention = ['failed: check: review found defects that do not fit on one row line ever'];
  leaf.red = true;
  leaf.missing = [{ kind: 'env', name: 'TOKEN', holder: 'akrogon', steps: 'add TOKEN to config env' }];
  leaf.history = [
    ...leaf.history,
    JSON.stringify({ ts: '2026-11-03T16:35:52.734Z', from: 'check.review', to: 'check.repair', slot: 'B' }),
  ].slice(-5);
  const row: RowModel = rowOf(board(env, akrogonSpace), 'tasks-mod')!;
  expect(row.detail.reasons).toEqual(leaf.attention);
  expect(row.detail.blockedBy).toEqual(['status-json merged']);
  expect(row.detail.missing).toEqual(['env TOKEN in akrogon: add TOKEN to config env']);
  expect(row.detail.moves.length).toBeLessThanOrEqual(3);
  for (const move of row.detail.moves) expect(move).toMatch(/ago {2}\S+ → \S+$/);
  expect(row.detail.moves.some((m) => m.includes('{'))).toBe(false);
  expect(row.detail.kept).toEqual(env.repos.find((r) => r.name === 'akrogon')!.kept);
  const keys: string[] = Object.keys(row.detail).sort();
  expect(keys).toEqual(['blockedBy', 'kept', 'missing', 'moves', 'reasons']);
});

test('since stays the short form', () => {
  expect(since(9 * 60_000)).toBe('9m');
  expect(since(4 * 3_600_000)).toBe('4h');
  expect(since(2 * 86_400_000)).toBe('2d');
});

test('pin intents merge the space pin for a folder and emit an open request with a higher seq', () => {
  const existing = { otherSpace: { machine: 'vps', folder: '/x' } };
  const intents = pinIntent('w8:s1', '/leaf/folder', 'files', existing, 7);
  expect(intents.pin).toEqual({
    otherSpace: { machine: 'vps', folder: '/x' },
    'w8:s1': { machine: null, folder: '/leaf/folder' },
  });
  expect(intents.request).toEqual({ op: 'open', view: 'files', seq: 8 });
  const changes = pinIntent('w8:s1', '/leaf/worktree', 'changes', existing, 8);
  expect(changes.request).toEqual({ op: 'open', view: 'changes', seq: 9 });
  expect(changes.pin['w8:s1'].folder).toBe('/leaf/worktree');
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
  for (const event of ['folder-hit', 'files-changed'] as const) {
    expect(next(event, false)).toEqual({ rescan: true });
    expect(next(event, true)).toEqual({ rescan: false });
  }
  expect(next('scan-failed', false)).toEqual({ rescan: true });
  expect(next('tick', false)).toEqual({ rescan: false });
  expect(next('tick', true)).toEqual({ rescan: false });
});
