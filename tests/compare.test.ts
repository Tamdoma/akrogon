import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fixture, cli, leaf, yaml, fakeHerdr, fakeAkrogon, storeDir, type Fixture, type HerdrFixture } from './helpers';
import { readState, saveState } from '../src/state';
import { type Phase } from '../src/routing';
import { command, type Result } from '../src/shell';

const PROMPTED: string = '2026-01-01T00:00:00.000Z';
const CHECK: string[] = ['sh', '-c', 'exit 3'];

type Setup = { leafPath: string; worktree: string; head: string; base: string };

async function setup(
  f: Fixture,
  slug: string,
  phase: string,
  slots: readonly string[],
  extra: object = {},
): Promise<Setup> {
  yaml(resolve(f.root, 'issues/config.yaml'), {
    setup: 'mkdir -p node_modules',
    checks: { test: 'bun test' },
    grounding: 'none',
  });
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  writeFileSync(resolve(worktree, 'leaf-change'), 'change\n');
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', 'leaf change'], worktree);
  const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
  const base: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], worktree);
  const prompted_at: Record<string, string> = Object.fromEntries(slots.map((slot) => [slot, PROMPTED]));
  const leafPath: string = leaf(f, slug, phase, { worktree, prompted_at, ...extra });
  mkdirSync(resolve(leafPath, 'implementation'), { recursive: true });
  return { leafPath, worktree, head, base };
}

function logFile(leafPath: string, name: string): string {
  const path: string = resolve(leafPath, 'implementation', name);
  writeFileSync(path, `output of ${name}\n`);
  return path;
}

function baseRunLine(
  f: Fixture,
  fields: { leaf: string; slot: string; base: string; command: string[]; log: string; start?: string; end?: boolean },
): void {
  const run: Record<string, unknown> = {
    run: 'run-1',
    repo: 'repo',
    leaf: fields.leaf,
    slot: fields.slot,
    base: fields.base,
    command: fields.command,
    cwd: '',
    path: resolve(f.home, 'gone'),
    env_generation: 0,
    pid: 1,
    boot_id: 'boot',
    start: fields.start ?? '2026-02-01T00:00:00.000Z',
    log: fields.log,
  };
  if (fields.end !== false) {
    run.end = '2026-02-01T00:00:20.000Z';
    run.exit = 3;
  }
  appendFileSync(resolve(f.root, 'issues/base-runs.jsonl'), JSON.stringify(run) + '\n');
}

type Unit = {
  runner?: string;
  file?: string;
  name?: string;
  own_criterion?: boolean;
  leafOutcome?: string;
  retryOutcome?: string;
  baseOutcome?: string;
  verdict?: string;
};

function record(
  s: Setup,
  leafPath: string,
  opts: {
    command?: string[];
    state?: string;
    counterpart?: string;
    leafRevision?: string;
    baseLog?: string;
    units?: Unit[];
    retry?: object | null;
    extra?: object;
  } = {},
): Record<string, unknown> {
  const runLog: string = logFile(leafPath, 'run-1.log');
  const retryLog: string = logFile(leafPath, 'retry-1.log');
  const baseLog: string = opts.baseLog ?? logFile(leafPath, 'base-1.log');
  const unit = (u: Unit): Record<string, unknown> => ({
    runner: u.runner ?? 'bun test',
    file: u.file ?? 'tests/x.test.ts',
    name: u.name ?? 'unit one',
    ...(u.own_criterion === true ? { own_criterion: true } : {}),
    leaf: { outcome: u.leafOutcome ?? 'fail', log: runLog },
    retry: { outcome: u.retryOutcome ?? 'fail', log: retryLog },
    ...(opts.state === 'inconsistent' ? {} : { base: { outcome: u.baseOutcome ?? 'fail', log: baseLog } }),
    verdict: u.verdict ?? 'known-red',
  });
  const state: string = opts.state ?? 'compared';
  return {
    command: opts.command ?? CHECK,
    cwd: '',
    scope: 'tests/x.test.ts',
    material: 'same environment',
    leaf_revision: opts.leafRevision ?? s.head,
    log: runLog,
    run: { complete: true },
    retry: opts.retry === null ? undefined : (opts.retry ?? { log: retryLog, complete: true, outcome: 'fail' }),
    state,
    ...(state === 'compared'
      ? {
          counterpart_revision: opts.counterpart ?? s.base,
          base: { log: baseLog, complete: true },
        }
      : {}),
    units: (opts.units ?? [{}]).map(unit),
    ...(opts.extra ?? {}),
  };
}

function writeRecord(f: Fixture, leafPath: string, name: string, data: object): string {
  const path: string = resolve(leafPath, name);
  yaml(path, data);
  return path;
}

function redRecords(f: Fixture): Record<string, unknown>[] {
  const path: string = resolve(f.root, 'issues/red-records.jsonl');
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line));
}

function noticeCalls(db: string): number {
  const callsPath: string = db + '.calls';
  if (!existsSync(callsPath)) return 0;
  return readFileSync(callsPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    .filter((args) => args[0] === 'notification' && args[1] === 'show').length;
}

function openedEntry(f: Fixture, unit: string, firstSeen: string, command: string[] = CHECK): Record<string, unknown> {
  return {
    event: 'opened',
    id: `entry-${unit}`,
    repo: 'repo',
    unit: { runner: 'bun test', file: 'tests/x.test.ts', name: unit },
    provenance: { command, cwd: '', scope: 'tests/x.test.ts', material: 'same environment' },
    first_seen: firstSeen,
    at: '2026-02-01T00:00:30.000Z',
    file: 'compare-1.yaml',
  };
}

test('a valid compared record opens one red entry, sends one notice and moves like green', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const ak = fakeAkrogon(f);
    const env: NodeJS.ProcessEnv = { ...herdr.env, ...ak.env };
    const s: Setup = await setup(f, 'leaf-a', 'plan.synthesis', ['A']);
    const run: Result = await cli(f, ['base-run', '--base', s.base, '--', ...CHECK], s.worktree, env);
    expect(run.code).toBe(3);
    const baseLog: string = run.stdout.split('\n')[0].replace(/^log: /, '');
    const file: string = writeRecord(
      f,
      s.leafPath,
      'compare-1.yaml',
      record(s, s.leafPath, { baseLog, command: CHECK }),
    );
    const moved: Result = await cli(f, ['phase', 'leaf-a', 'implement', '--slot', 'A', '--compare', file], f.root, env);
    expect(moved.code).toBe(0);
    expect(moved.stdout).toContain('moved implement');
    expect(readState(s.leafPath).phase).toBe('implement');
    const events = redRecords(f);
    expect(events.map((event) => event.event)).toEqual(['opened', 'notice']);
    const opened = z.object({ unit: z.object({ name: z.string() }), first_seen: z.string() }).parse(events[0]);
    expect(opened.first_seen).toBe(s.base);
    expect(opened.unit.name).toBe('unit one');
    expect(noticeCalls(herdr.db)).toBe(1);
    // A second identical record joins the active entry silently.
    saveState(s.leafPath, {
      ...readState(s.leafPath),
      prompted_at: { A: PROMPTED },
    });
    const run2: Result = await cli(f, ['base-run', '--base', s.base, '--', ...CHECK], s.worktree, env);
    const baseLog2: string = run2.stdout.split('\n')[0].replace(/^log: /, '');
    const file2: string = writeRecord(
      f,
      s.leafPath,
      'compare-2.yaml',
      record(s, s.leafPath, { baseLog: baseLog2, command: CHECK }),
    );
    const moved2: Result = await cli(
      f,
      ['phase', 'leaf-a', 'check.review', '--slot', 'A', '--compare', file2],
      f.root,
      env,
    );
    expect(moved2.code).toBe(0);
    expect(readState(s.leafPath).phase).toBe('check.review');
    expect(redRecords(f).length).toBe(2);
    expect(noticeCalls(herdr.db)).toBe(1);
  } finally {
    f.clean();
  }
});

test('an inconsistent record needs no base run and a check-only move validates without effects', async () => {
  const f: Fixture = await fixture();
  try {
    const s: Setup = await setup(f, 'leaf-b', 'implement', ['A']);
    const file: string = writeRecord(
      f,
      s.leafPath,
      'compare-flaky.yaml',
      record(s, s.leafPath, {
        state: 'inconsistent',
        retry: { log: logFile(s.leafPath, 'retry-1.log'), complete: true, outcome: 'pass' },
        units: [],
      }),
    );
    const checked: Result = await cli(
      f,
      ['phase', 'leaf-b', 'check.review', '--slot', 'A', '--check', '--compare', file],
      f.root,
    );
    expect(checked.code).toBe(0);
    expect(checked.stdout).toContain('ok');
    expect(readState(s.leafPath).phase).toBe('implement');
    expect(redRecords(f)).toEqual([]);
    const moved: Result = await cli(f, ['phase', 'leaf-b', 'check.review', '--slot', 'A', '--compare', file], f.root);
    expect(moved.code).toBe(0);
    expect(readState(s.leafPath).phase).toBe('check.review');
    expect(redRecords(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('--compare is refused on failed moves and from the merge phase', async () => {
  const f: Fixture = await fixture();
  try {
    const s: Setup = await setup(f, 'leaf-c', 'implement', ['A']);
    const file: string = writeRecord(
      f,
      s.leafPath,
      'compare-1.yaml',
      record(s, s.leafPath, {
        state: 'inconsistent',
        retry: { log: logFile(s.leafPath, 'r.log'), complete: true, outcome: 'pass' },
        units: [],
      }),
    );
    const failed: Result = await cli(
      f,
      ['phase', 'leaf-c', 'failed', '--slot', 'A', '--reason', 'x', '--compare', file],
      f.root,
    );
    expect(failed.code).not.toBe(0);
    expect(readState(s.leafPath).phase).toBe('implement');
    const mergePath: string = leaf(f, 'leaf-merging', 'merge', {
      worktree: s.worktree,
      batch: {
        attempt: 'a1',
        built_on: s.base,
        holder: { base: s.base, head: 'HEAD' },
        started: '2026-01-01T00:00:00Z',
        members: [],
        tools: [],
        solo: true,
        applied: true,
      },
    });
    const merging: Result = await cli(
      f,
      ['phase', 'leaf-merging', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--compare', file],
      f.root,
    );
    expect(merging.code).not.toBe(0);
    expect(merging.stderr).toMatch(/compare/i);
    expect(readState(mergePath).phase).toBe('merge');
  } finally {
    f.clean();
  }
});

type Refusal = {
  name: string;
  phase?: 'plan.synthesis' | 'implement';
  slot?: string;
  slots?: readonly ('A' | 'B')[];
  line?: boolean;
  mutate?: (data: Record<string, unknown>, s: Setup, leafPath: string) => void;
  mutateLine?: { start?: string; end?: boolean };
  write?: (f: Fixture, s: Setup, leafPath: string, data: Record<string, unknown>) => string;
  match: RegExp;
};

const refusals: Refusal[] = [
  {
    name: 'does not parse',
    write: (f, s, leafPath) => {
      const path: string = resolve(leafPath, 'broken.yaml');
      writeFileSync(path, 'command: [unclosed\n  bad:');
      return path;
    },
    match: /broken\.yaml/,
  },
  {
    name: 'state outside the allowed set',
    mutate: (data) => {
      data.state = 'verified';
    },
    match: /state/i,
  },
  {
    name: 'a blank required field',
    mutate: (data) => {
      data.scope = '  ';
    },
    match: /scope/,
  },
  {
    name: 'a missing log file',
    mutate: (data) => {
      data.log = '/nonexistent/run.log';
    },
    match: /run\.log|log/,
  },
  {
    name: 'leaf revision differs from HEAD',
    mutate: (data, s) => {
      data.leaf_revision = s.base;
    },
    match: /leaf_revision/,
  },
  {
    name: 'the retry run is missing',
    mutate: (data) => {
      delete data.retry;
    },
    match: /retry/,
  },
  {
    name: 'more than one retry is recorded',
    mutate: (data) => {
      data.retry2 = data.retry;
    },
    match: /retry2|retry/,
  },
  {
    name: 'counterpart differs from the leaf base',
    mutate: (data, s) => {
      data.counterpart_revision = s.head;
    },
    match: /counterpart_revision/,
  },
  {
    name: 'the base log is not from a base-run record line',
    line: false,
    match: /base.*log|log/i,
  },
  {
    name: 'the base-run started before this pass',
    mutateLine: { start: '2020-01-01T00:00:00.000Z' },
    match: /base-run|prompted|start/i,
  },
  {
    name: 'the base-run line records no end and exit',
    mutateLine: { end: false },
    match: /end|exit|base-run/i,
  },
  {
    name: 'the base-run command differs',
    mutate: (data) => {
      data.command = ['sh', '-c', 'exit 9'];
    },
    match: /command/,
  },
  {
    name: 'the record file is outside the leaf folder',
    write: (f, s, leafPath, data) => {
      const path: string = resolve(f.root, 'compare-outside.yaml');
      yaml(path, data);
      return path;
    },
    match: /leaf|outside/i,
  },
];

for (const refusal of refusals) {
  test(`a record is refused when it ${refusal.name}`, async () => {
    const f: Fixture = await fixture();
    try {
      const slots: readonly string[] = refusal.slots ?? ['A'];
      const s: Setup = await setup(f, 'leaf-r', refusal.phase ?? 'plan.synthesis', slots);
      const data: Record<string, unknown> = record(s, s.leafPath, {});
      refusal.mutate?.(data, s, s.leafPath);
      if (refusal.line !== false)
        baseRunLine(f, {
          leaf: 'leaf-r',
          slot: slots[0],
          base: s.base,
          command: CHECK,
          log: (data.base as { log: string }).log,
          ...refusal.mutateLine,
        });
      const file: string = refusal.write
        ? refusal.write(f, s, s.leafPath, data)
        : writeRecord(f, s.leafPath, 'compare-1.yaml', data);
      const result: Result = await cli(f, ['phase', 'leaf-r', 'implement', '--slot', 'A', '--compare', file], f.root);
      expect(result.code).not.toBe(0);
      expect(result.stderr).not.toContain('Unknown option');
      expect(result.stderr).toMatch(refusal.match);
      expect(readState(s.leafPath).phase).toBe(refusal.phase ?? ('plan.synthesis' as const));
      expect(redRecords(f)).toEqual([]);
    } finally {
      f.clean();
    }
  });
}

test('a slot-mismatched base-run line is refused', async () => {
  const f: Fixture = await fixture();
  try {
    const s: Setup = await setup(f, 'leaf-slot', 'plan.synthesis', ['A']);
    const data: Record<string, unknown> = record(s, s.leafPath, {});
    baseRunLine(f, {
      leaf: 'leaf-slot',
      slot: 'B',
      base: s.base,
      command: CHECK,
      log: (data.base as { log: string }).log,
    });
    const file: string = writeRecord(f, s.leafPath, 'compare-1.yaml', data);
    const result: Result = await cli(f, ['phase', 'leaf-slot', 'implement', '--slot', 'A', '--compare', file], f.root);
    expect(result.code).not.toBe(0);
    expect(result.stderr).not.toContain('Unknown option');
    expect(result.stderr).toMatch(/slot|base-run/i);
  } finally {
    f.clean();
  }
});

type VerdictCase = {
  name: string;
  phase: Phase;
  slots: readonly ('A' | 'B')[];
  done?: string[];
  move: (slug: string, file: string) => string[];
  units: Unit[];
  refuse: RegExp | null;
};

const verdictCases: VerdictCase[] = [
  {
    name: 'a new unit refuses a move to implement',
    phase: 'plan.synthesis',
    slots: ['A'],
    move: (slug, file) => ['phase', slug, 'implement', '--slot', 'A', '--compare', file],
    units: [{ verdict: 'new', baseOutcome: 'pass' }],
    refuse: /new|unit/i,
  },
  {
    name: 'an unverified unit refuses a move to check.review',
    phase: 'implement',
    slots: ['A'],
    move: (slug, file) => ['phase', slug, 'check.review', '--slot', 'A', '--compare', file],
    units: [{ verdict: 'unverified', baseOutcome: 'missing' }],
    refuse: /unverified|unit/i,
  },
  {
    name: 'a unit of the leaf own criteria refuses a move to check.review',
    phase: 'implement',
    slots: ['A'],
    move: (slug, file) => ['phase', slug, 'check.review', '--slot', 'A', '--compare', file],
    units: [{ own_criterion: true }],
    refuse: /criterion|criteria|own/i,
  },
  {
    name: 'a new unit refuses a move to merge',
    phase: 'check.review',
    slots: ['B'],
    done: ['A'],
    move: (slug, file) => ['phase', slug, 'merge', '--slot', 'B', '--verdict', 'ready', '--compare', file],
    units: [{ verdict: 'new', baseOutcome: 'pass' }],
    refuse: /new|unit/i,
  },
  {
    name: 'a new unit is admitted on a move to check.fix',
    phase: 'check.repair',
    slots: ['B'],
    move: (slug, file) => ['phase', slug, 'check.fix', '--slot', 'B', '--compare', file],
    units: [{ verdict: 'new', baseOutcome: 'pass' }],
    refuse: null,
  },
];

for (const item of verdictCases) {
  test(item.name, async () => {
    const f: Fixture = await fixture();
    try {
      const s: Setup = await setup(f, 'leaf-v', item.phase, item.slots, {
        done: item.done ?? [],
      });
      const data: Record<string, unknown> = record(s, s.leafPath, { units: item.units });
      baseRunLine(f, {
        leaf: 'leaf-v',
        slot: item.slots[0],
        base: s.base,
        command: CHECK,
        log: (data.base as { log: string }).log,
      });
      const file: string = writeRecord(f, s.leafPath, 'compare-1.yaml', data);
      const result: Result = await cli(f, item.move('leaf-v', file), f.root);
      if (item.refuse === null) {
        expect(result.code).toBe(0);
        expect(readState(s.leafPath).phase).not.toBe(item.phase);
      } else {
        expect(result.code).not.toBe(0);
        expect(result.stderr).not.toContain('Unknown option');
        expect(result.stderr).toMatch(item.refuse);
        expect(readState(s.leafPath).phase).toBe(item.phase);
      }
    } finally {
      f.clean();
    }
  });
}

test('a failing notice does not block the move and is stored apart from the entry', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const db = JSON.parse(readFileSync(herdr.db, 'utf8'));
    db.failNotification = true;
    writeFileSync(herdr.db, JSON.stringify(db));
    const s: Setup = await setup(f, 'leaf-n', 'plan.synthesis', ['A']);
    const data: Record<string, unknown> = record(s, s.leafPath, {});
    baseRunLine(f, {
      leaf: 'leaf-n',
      slot: 'A',
      base: s.base,
      command: CHECK,
      log: (data.base as { log: string }).log,
    });
    const file: string = writeRecord(f, s.leafPath, 'compare-1.yaml', data);
    const moved: Result = await cli(
      f,
      ['phase', 'leaf-n', 'implement', '--slot', 'A', '--compare', file],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    expect(readState(s.leafPath).phase).toBe('implement');
    const events = redRecords(f);
    expect(events.map((event) => event.event)).toEqual(['opened', 'notice']);
    expect(events[1].error).toBeDefined();
  } finally {
    f.clean();
  }
});

test('a base pass resolves only the matching active entry at or below its revision; a recurrence opens a new entry and notice', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const env: NodeJS.ProcessEnv = { ...herdr.env, ...fakeAkrogon(f).env };
    const s: Setup = await setup(f, 'leaf-x', 'check.repair', ['B']);
    // Active entries: unit one opened at s.base, unit two (different provenance command) at s.base,
    // unit three (same command, never resolves) at s.base.
    const recordsPath: string = resolve(f.root, 'issues/red-records.jsonl');
    appendFileSync(
      recordsPath,
      [
        JSON.stringify(openedEntry(f, 'unit one', s.base)),
        JSON.stringify(openedEntry(f, 'unit two', s.base, ['bun', 'test'])),
        JSON.stringify(openedEntry(f, 'unit three', s.base)),
      ].join('\n') + '\n',
    );
    // Advance main and rebase the leaf so counterpart (merge-base) is a descendant of first_seen.
    writeFileSync(resolve(f.root, 'main-advance'), 'advance\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'advance main'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'fetch', 'origin'], s.worktree);
    await command(['git', 'rebase', 'origin/main'], s.worktree);
    const head2: string = await command(['git', 'rev-parse', 'HEAD'], s.worktree);
    const base2: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], s.worktree);
    expect(base2).not.toBe(s.base);
    const s2: Setup = { ...s, head: head2, base: base2 };
    const data: Record<string, unknown> = record(s2, s.leafPath, {
      units: [
        { name: 'unit one', verdict: 'new', baseOutcome: 'pass' },
        { name: 'unit two', verdict: 'new', baseOutcome: 'pass' },
        { name: 'unit three', verdict: 'known-red', baseOutcome: 'fail' },
      ],
    });
    baseRunLine(f, {
      leaf: 'leaf-x',
      slot: 'B',
      base: base2,
      command: CHECK,
      log: (data.base as { log: string }).log,
    });
    const file: string = writeRecord(f, s.leafPath, 'compare-1.yaml', data);
    const moved: Result = await cli(f, ['phase', 'leaf-x', 'check.fix', '--slot', 'B', '--compare', file], f.root, env);
    expect(moved.code).toBe(0);
    const events = redRecords(f);
    const resolved = events.filter((event) => event.event === 'resolved');
    // unit one resolves (same provenance, descendant revision); unit two does not (different command);
    // unit three stays active (still failing on base).
    expect(resolved.length).toBe(1);
    expect(resolved[0].id).toBe('entry-unit one');
    // Recurrence: the same unit known-red again opens a fresh entry and a fresh notice.
    saveState(s.leafPath, { ...readState(s.leafPath), prompted_at: { A: PROMPTED } });
    const again: Record<string, unknown> = record(s2, s.leafPath, {
      units: [{ name: 'unit one', verdict: 'known-red', baseOutcome: 'fail' }],
    });
    baseRunLine(f, {
      leaf: 'leaf-x',
      slot: 'A',
      base: base2,
      command: CHECK,
      log: (again.base as { log: string }).log,
      start: '2026-02-02T00:00:00.000Z',
    });
    const file2: string = writeRecord(f, s.leafPath, 'compare-2.yaml', again);
    const moved2: Result = await cli(
      f,
      ['phase', 'leaf-x', 'check.review', '--slot', 'A', '--compare', file2],
      f.root,
      env,
    );
    expect(moved2.code).toBe(0);
    const reopened = redRecords(f).filter(
      (event) => event.event === 'opened' && event.file === 'compare-2.yaml',
    );
    expect(reopened.length).toBe(1);
    expect(noticeCalls(herdr.db)).toBe(1);
  } finally {
    f.clean();
  }
});

test('an entry opened on a newer revision than the evidence stays active', async () => {
  const f: Fixture = await fixture();
  try {
    const s: Setup = await setup(f, 'leaf-y', 'check.repair', ['B']);
    // Fabricate an entry first seen at a revision the evidence predates: create a real descendant
    // commit on main without rebasing the leaf, so counterpart stays at s.base.
    writeFileSync(resolve(f.root, 'main-advance'), 'advance\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'advance main'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const newer: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    appendFileSync(
      resolve(f.root, 'issues/red-records.jsonl'),
      JSON.stringify(openedEntry(f, 'unit one', newer)) + '\n',
    );
    const data: Record<string, unknown> = record(s, s.leafPath, {
      units: [{ name: 'unit one', verdict: 'new', baseOutcome: 'pass' }],
    });
    baseRunLine(f, {
      leaf: 'leaf-y',
      slot: 'B',
      base: s.base,
      command: CHECK,
      log: (data.base as { log: string }).log,
    });
    const file: string = writeRecord(f, s.leafPath, 'compare-1.yaml', data);
    const moved: Result = await cli(f, ['phase', 'leaf-y', 'check.fix', '--slot', 'B', '--compare', file], f.root);
    expect(moved.code).toBe(0);
    expect(redRecords(f).filter((event) => event.event === 'resolved')).toEqual([]);
  } finally {
    f.clean();
  }
});

test('status prints each active entry with unit, command, first-seen revision and notice result', async () => {
  const f: Fixture = await fixture();
  try {
    const s: Setup = await setup(f, 'leaf-s', 'implement', ['A']);
    const recordsPath: string = resolve(f.root, 'issues/red-records.jsonl');
    const entry = openedEntry(f, 'unit one', s.base);
    appendFileSync(
      recordsPath,
      [
        JSON.stringify(entry),
        JSON.stringify({
          event: 'notice',
          id: 'entry-unit one',
          shown: true,
          reason: 'shown',
          at: '2026-02-01T00:00:31.000Z',
        }),
      ].join('\n') + '\n',
    );
    const single: Result = await cli(f, ['status', 'leaf-s'], f.root);
    expect(single.code).toBe(0);
    expect(single.stdout).toMatch(/unit one/);
    expect(single.stdout).toContain(s.base);
    expect(single.stdout).toMatch(/shown|notice/i);
    expect(single.stdout).toMatch(/exit 3|sh -c/);
    const board: Result = await cli(f, ['status'], f.root);
    expect(board.code).toBe(0);
    expect(board.stdout).toMatch(/unit one/);
  } finally {
    f.clean();
  }
});
