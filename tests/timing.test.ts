import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, fakeHerdr, fakeAkrogon, leaf, storeDir, yaml, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command, type Result } from '../src/shell';
import type { Database } from './fake-herdr';

type Event = { kind: string; slug?: string; [key: string]: unknown };

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function timings(f: Fixture): Event[] {
  const path: string = resolve(f.root, 'issues/timings.jsonl');
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line) as Event);
}
function leafEvents(f: Fixture, slug: string): Event[] {
  return timings(f).filter((event) => event.slug === slug);
}
function ofKind(events: Event[], kind: string): Event[] {
  return events.filter((event) => event.kind === kind);
}
async function next(f: DispatchFixture, args: string[]): Promise<Result> {
  return cli(f, ['next', ...args], f.root, f.env);
}
async function phase(f: DispatchFixture, args: string[]): Promise<Result> {
  return cli(f, ['phase', ...args], f.root, f.env);
}
async function commitFile(f: DispatchFixture, path: string, name: string): Promise<void> {
  const worktree: string = readState(path).worktree!;
  writeFileSync(resolve(worktree, name), `${name}\n`);
  await command(['git', 'add', name], worktree);
  await command(['git', 'commit', '-m', name], worktree);
}
function idleAll(f: DispatchFixture): void {
  const db: Database = database(f);
  writeFileSync(f.db, JSON.stringify({ ...db, panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) }));
}
function warnings(result: Result): string[] {
  return result.stderr.split('\n').filter((line) => line.includes('timing append failed'));
}

test('visit events: a leaf driven to merged records every visit, prompt, seat_done and batch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'solo', 'plan.synthesis');
    expect((await next(f, ['solo'])).code).toBe(0);
    await commitFile(f, path, 'app.ts');
    expect((await phase(f, ['solo', 'implement', '--slot', 'A'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    expect((await phase(f, ['solo', 'check.review', '--slot', 'A'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    await commitFile(f, path, 'app2.ts');
    expect((await phase(f, ['solo', 'merge', '--slot', 'A', '--verdict', 'fix'])).stdout).toBe('recorded');
    expect((await phase(f, ['solo', 'check.repair', '--slot', 'B', '--verdict', 'fix'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    expect((await phase(f, ['solo', 'check.fix', '--slot', 'B'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    expect((await phase(f, ['solo', 'check.review', '--slot', 'A'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    expect((await phase(f, ['solo', 'merge', '--slot', 'B', '--verdict', 'ready'])).code).toBe(0);
    idleAll(f);
    expect((await next(f, ['solo'])).code).toBe(0);
    const attempt: string = readState(path).batch!.attempt;
    expect((await phase(f, ['solo', 'merged', '--check', '--slot', 'B', '--attempt', attempt])).code).toBe(0);
    expect((await phase(f, ['solo', 'merged', '--slot', 'B', '--attempt', attempt])).code).toBe(0);

    const events: Event[] = leafEvents(f, 'solo');
    const startPhases: [string, number][] = ofKind(events, 'visit_start').map((v) => [
      v.phase as string,
      v.visit as number,
    ]);
    expect(startPhases).toContainEqual(['plan.synthesis', 0]);
    expect(startPhases).toContainEqual(['implement', 0]);
    expect(startPhases).toContainEqual(['check.review', 0]);
    expect(startPhases).toContainEqual(['check.repair', 0]);
    expect(startPhases).toContainEqual(['check.fix', 0]);
    expect(startPhases).toContainEqual(['check.review', 1]);
    expect(startPhases).toContainEqual(['merge', 0]);
    expect(startPhases).toContainEqual(['merged', 0]);

    const prompts: Event[] = ofKind(events, 'prompt');
    const delivered: [string, string, number][] = prompts
      .filter((p) => p.outcome === 'delivered')
      .map((p) => [p.slot as string, p.phase as string, p.visit as number]);
    expect(delivered).toContainEqual(['A', 'plan.synthesis', 0]);
    expect(delivered).toContainEqual(['A', 'implement', 0]);
    expect(delivered).toContainEqual(['A', 'check.review', 0]);
    expect(delivered).toContainEqual(['B', 'check.review', 0]);
    expect(delivered).toContainEqual(['B', 'check.repair', 0]);
    expect(delivered).toContainEqual(['A', 'check.fix', 0]);
    expect(delivered).toContainEqual(['B', 'check.review', 1]);
    expect(delivered).toContainEqual(['B', 'merge', 0]);
    const mergePrompt: Event | undefined = prompts.find((p) => p.phase === 'merge' && p.outcome === 'delivered');
    expect(mergePrompt?.attempt).toBe(attempt);
    expect(prompts.every((p) => typeof p.session === 'string')).toBe(true);

    const seatDone: Event[] = ofKind(events, 'seat_done');
    expect(seatDone).toHaveLength(1);
    expect(seatDone[0]).toMatchObject({ slot: 'A', phase: 'check.review', visit: 0 });

    const batches: Event[] = ofKind(events, 'batch');
    expect(batches).toHaveLength(1);
    expect(batches[0]).toMatchObject({ attempt, holder: 'solo', members: [] });
    expect(typeof batches[0].built_on).toBe('string');
  } finally {
    f.clean();
  }
}, 60000);

test('check events: scope, ordering, exit and duration; killed and worker and base runs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'chks', 'implement');
    expect((await next(f, ['chks'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;

    const failed: Result = await cli(f, ['run-check', '--name', 'smoke', '--', 'sh', '-c', 'exit 3'], worktree, f.env);
    expect(failed.code).toBe(3);
    const events: Event[] = leafEvents(f, 'chks');
    const smokeStart: Event | undefined = ofKind(events, 'check_start').find((e) => e.name === 'smoke');
    const smokeEnd: Event | undefined = ofKind(events, 'check_end').find((e) => e.name === 'smoke');
    expect(smokeStart).toMatchObject({ scope: 'leaf', name: 'smoke', phase: 'implement' });
    expect(smokeEnd).toMatchObject({ scope: 'leaf', name: 'smoke', exit: 3 });
    expect(smokeEnd?.duration_ms).toBeGreaterThanOrEqual(0);
    expect(smokeEnd?.log).toContain('check-smoke-');
    expect(smokeEnd?.run).toBe(smokeStart?.run);

    await expect(cli(f, ['run-check', '--name', 'hang', '--', 'sleep', '30'], worktree, f.env, 2000)).rejects.toThrow();
    expect(ofKind(leafEvents(f, 'chks'), 'check_start').some((e) => e.name === 'hang')).toBe(true);
    expect(ofKind(leafEvents(f, 'chks'), 'check_end').some((e) => e.name === 'hang')).toBe(false);

    const worker: string = resolve(storeDir(f), 'chks-u1');
    await command(['git', 'worktree', 'add', '--detach', worker, 'HEAD'], f.root);
    const workerRun: Result = await cli(f, ['run-check', '--name', 'wrk', '--', 'true'], worker, f.env);
    expect(workerRun.code).toBe(0);
    const workerStart: Event | undefined = ofKind(leafEvents(f, 'chks'), 'check_start').find((e) => e.name === 'wrk');
    expect(workerStart).toMatchObject({ scope: 'worker', unit: 'u1' });
    await command(['git', 'worktree', 'remove', '--force', worker], f.root);

    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      setup: 'mkdir -p node_modules',
      checks: { test: 'bun test' },
      grounding: 'none',
    });
    const shim: { env: NodeJS.ProcessEnv } = fakeAkrogon(f);
    const baseHead: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const baseRun: Result = await cli(
      f,
      ['base-run', '--base', baseHead, '--', 'akrogon', 'run-check', '--name', 'b', '--', 'true'],
      worktree,
      { ...f.env, ...shim.env },
    );
    expect(baseRun.code).toBe(0);
    const baseStart: Event | undefined = ofKind(leafEvents(f, 'chks'), 'check_start').find((e) => e.name === 'b');
    expect(baseStart?.scope).toBe('base');
  } finally {
    f.clean();
  }
}, 60000);

test('check events carry the merge attempt id inside a merge attempt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'att', 'implement');
    expect((await next(f, ['att'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    await commitFile(f, path, 'a.ts');
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    saveState(path, {
      ...readState(path),
      phase: 'merge',
      merge_stamp: '2026-10-13T00:00:00.000Z',
      batch: {
        attempt: 'att-9',
        built_on: head,
        holder: { base: head, head },
        members: [],
        applied: true,
        solo: true,
      },
    });
    const run: Result = await cli(f, ['run-check', '--name', 'm', '--', 'true'], worktree, f.env);
    expect(run.code).toBe(0);
    const events: Event[] = leafEvents(f, 'att');
    const start: Event | undefined = ofKind(events, 'check_start').find((e) => e.name === 'm');
    const end: Event | undefined = ofKind(events, 'check_end').find((e) => e.name === 'm');
    expect(start).toMatchObject({ attempt: 'att-9', phase: 'merge' });
    expect(end).toMatchObject({ attempt: 'att-9' });
  } finally {
    f.clean();
  }
}, 30000);

test('waits: pause writes repo_pause on and off; parked, prerequisite and merge waits open and close once', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    expect((await cli(f, ['pause'], f.root, f.env)).code).toBe(0);
    expect((await cli(f, ['unpause'], f.root, f.env)).code).toBe(0);
    const pauses: Event[] = ofKind(timings(f), 'repo_pause');
    expect(pauses.map((p) => p.pause)).toEqual(['on', 'off']);
    expect(pauses[0].slug).toBeUndefined();

    leaf(f, 'dep', 'plan.synthesis', {}, 'dep-issue');
    expect((await cli(f, ['park', 'dep-issue'], f.root, f.env)).code).toBe(0);
    expect(ofKind(leafEvents(f, 'dep'), 'wait').map((e) => e.reason)).toEqual(['parked']);

    leaf(f, 'w', 'plan.synthesis', { 'blocked-by': ['dep'] });
    // A picked leaf with a parked dependency is refused like other fatal dep labels; the wait is still recorded.
    expect((await next(f, ['w'])).code).not.toBe(0);
    expect((await next(f, ['w'])).code).not.toBe(0);
    let waits: Event[] = ofKind(leafEvents(f, 'w'), 'wait');
    expect(waits).toHaveLength(1);
    expect(waits[0]).toMatchObject({ reason: 'parked', blocking: 'dep' });

    expect((await cli(f, ['unpark', 'dep-issue'], f.root, f.env)).code).toBe(0);
    expect(ofKind(leafEvents(f, 'dep'), 'wait').map((e) => e.reason)).toEqual(['parked', 'none']);
    expect((await next(f, ['w'])).code).toBe(0);
    expect((await next(f, ['w'])).code).toBe(0);
    waits = ofKind(leafEvents(f, 'w'), 'wait');
    expect(waits.map((e) => e.reason)).toEqual(['parked', 'prerequisite']);
    expect(waits[1].blocking).toBe('dep');

    const m1: string = leaf(f, 'm1', 'plan.synthesis');
    expect((await next(f, ['m1'])).code).toBe(0);
    await commitFile(f, m1, 'm1.ts');
    saveState(m1, {
      ...readState(m1),
      phase: 'merge',
      merge_stamp: '2026-10-13T00:00:00.000Z',
    });
    leaf(f, 'm2', 'merge', { merge_stamp: '2026-10-13T01:00:00.000Z' });
    expect((await next(f, ['m2'])).code).toBe(0);
    expect((await next(f, ['m2'])).code).toBe(0);
    const m2Waits: Event[] = ofKind(leafEvents(f, 'm2'), 'wait');
    expect(m2Waits.filter((e) => e.reason === 'merge_turn')).toHaveLength(1);
    expect(m2Waits[0]).toMatchObject({ reason: 'merge_turn', blocking: 'm1' });
    expect(ofKind(leafEvents(f, 'm1'), 'batch')).toHaveLength(1);
    expect(ofKind(leafEvents(f, 'm1'), 'prompt').some((p) => p.outcome === 'delivered')).toBe(true);

    const attempt: string = readState(m1).batch!.attempt;
    expect((await phase(f, ['m1', 'merged', '--check', '--slot', 'B', '--attempt', attempt])).code).toBe(0);
    expect((await phase(f, ['m1', 'merged', '--slot', 'B', '--attempt', attempt])).code).toBe(0);
    expect(readState(m1).phase).toBe('merged');
    const m2State: State = readState(resolve(f.root, 'issues/open/issue/m2'));
    expect(m2State.phase).toBe('merged');

    expect((await next(f, ['m2'])).code).toBe(0);
    const m2All: Event[] = ofKind(leafEvents(f, 'm2'), 'wait');
    expect(m2All.map((e) => e.reason)).toEqual(['merge_turn', 'none']);
  } finally {
    f.clean();
  }
}, 60000);

test('unwritable timings: prompts, checks and moves complete with one warning per append', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    mkdirSync(resolve(f.root, 'issues/timings.jsonl'));
    const path: string = leaf(f, 'unw', 'plan.synthesis');
    const dispatched: Result = await next(f, ['unw']);
    expect(dispatched.code).toBe(0);
    expect(database(f).prompts.some((p) => p.text.startsWith('plan-issue unw '))).toBe(true);
    expect(warnings(dispatched).length).toBeGreaterThanOrEqual(1);

    const moved: Result = await phase(f, ['unw', 'implement', '--slot', 'A']);
    expect(moved.code).toBe(0);
    expect(moved.stdout).toContain('moved implement');
    expect(warnings(moved)).toHaveLength(1);
    expect(readState(path).phase).toBe('implement');

    const check: Result = await cli(
      f,
      ['run-check', '--leaf', path, '--name', 'c', '--', 'sh', '-c', 'exit 5'],
      f.root,
      f.env,
    );
    expect(check.code).toBe(5);
    expect(warnings(check)).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 30000);

test('wait ends when an operator removes a prerequisite and a picked leaf has missing inputs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'dep', 'plan.synthesis');
    const path: string = leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['dep'] });
    yaml(resolve(path, 'readiness.yaml'), {
      inputs: [
        {
          kind: 'file',
          name: 'approval.txt',
          holder: 'repo',
          purpose: 'operator approval',
          consumers: ['waiting'],
          steps: 'create approval.txt',
          source: 'operator',
          done: 'file exists',
        },
      ],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    expect((await next(f, ['waiting'])).code).toBe(0);
    saveState(path, { ...readState(path), 'blocked-by': [] });
    const blocked: Result = await next(f, ['waiting']);
    expect(blocked.code).toBe(1);
    expect(blocked.stderr).toContain('Leaf inputs are missing');
    expect(ofKind(leafEvents(f, 'waiting'), 'wait').map((event) => event.reason)).toEqual(['prerequisite', 'none']);
  } finally {
    f.clean();
  }
}, 30000);

test('repo pause event is persisted before its state lock is released', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    writeFileSync(
      resolve(f.home, 'bin/flock'),
      '#!/bin/sh\n/usr/bin/flock "$@"\nstatus=$?\nif [ -f "$AKROGON_HOME/repo/issues/timings.jsonl" ]; then\n  cp "$AKROGON_HOME/repo/issues/timings.jsonl" "$AKROGON_HOME/timings-at-unlock.jsonl"\nelse\n  : > "$AKROGON_HOME/timings-at-unlock.jsonl"\nfi\nexit "$status"\n',
      { mode: 0o755 },
    );
    expect((await cli(f, ['pause'], f.root, f.env)).code).toBe(0);
    const snapshot: string = readFileSync(resolve(f.home, 'timings-at-unlock.jsonl'), 'utf8');
    const events: Event[] = snapshot
      .trim()
      .split('\n')
      .filter((line) => line !== '')
      .map((line) => JSON.parse(line) as Event);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: 'repo_pause', repo: 'repo', pause: 'on' });
  } finally {
    f.clean();
  }
}, 30000);
