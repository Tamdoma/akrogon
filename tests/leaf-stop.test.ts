import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { command, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
import { readState, saveState, type State } from '../src/state';
import type { Database } from './fake-herdr';
import { cli, fakeHerdr, fixture, leaf, yaml, type Fixture } from './helpers';

type StopFixture = Fixture & { db: string; env: NodeJS.ProcessEnv; systemctlLog: string };

// Logs argv one line per call; exits 1 with a message when an argument equals $FAKE_SYSTEMCTL_FAIL.
async function stopFixture(): Promise<StopFixture> {
  const f: Fixture = await fixture();
  const herdr: { db: string; env: NodeJS.ProcessEnv } = fakeHerdr(f);
  const script: string = resolve(f.home, 'bin', 'systemctl');
  writeFileSync(
    script,
    [
      '#!/bin/sh',
      'printf "%s\\n" "$*" >> "$FAKE_SYSTEMCTL_LOG"',
      'for arg in "$@"; do',
      '  if [ -n "$FAKE_SYSTEMCTL_FAIL" ] && [ "$arg" = "$FAKE_SYSTEMCTL_FAIL" ]; then',
      '    echo "Failed to stop $arg: fake failure" >&2',
      '    exit 1',
      '  fi',
      'done',
      '',
    ].join('\n'),
  );
  chmodSync(script, 0o755);
  const systemctlLog: string = resolve(f.home, 'systemctl.log');
  return { ...f, ...herdr, env: { ...herdr.env, FAKE_SYSTEMCTL_LOG: systemctlLog }, systemctlLog };
}

function database(f: StopFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}

function saveDatabase(f: StopFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}

function systemctlCalls(f: StopFixture): string[] {
  // Reconcile also calls the fake (list-units, reset-failed); only stop calls
  // prove the leaf's slice was stopped.
  return existsSync(f.systemctlLog)
    ? readFileSync(f.systemctlLog, 'utf8')
        .trim()
        .split('\n')
        .filter((line) => line.includes(' stop '))
    : [];
}

function stoppedKeys(f: StopFixture): string[] {
  const file: string = resolve(f.home, 'stopped.yaml');
  if (!existsSync(file)) return [];
  const parsed: Record<string, unknown> | null = Bun.YAML.parse(readFileSync(file, 'utf8')) as Record<
    string,
    unknown
  > | null;
  return Object.keys(parsed ?? {}).sort();
}

async function run(f: StopFixture, args: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, args, f.root, { ...f.env, ...env });
}

function slice(path: string): string {
  const state: State = readState(path);
  return leafSlice({ name: state.repo }, state.slug);
}

/** Allocate a leaf, then leave its seats idle with expired grace so any later pass would prompt again. */
async function allocatedIdle(f: StopFixture, slug: string): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await run(f, ['next', slug])).code).toBe(0);
  expect(database(f).prompts.length).toBeGreaterThan(0);
  idle(f, path);
  return path;
}

function idle(f: StopFixture, path: string): void {
  const db: Database = database(f);
  saveDatabase(f, { ...db, prompts: [], panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) });
  const state: State = readState(path);
  saveState(path, { ...state, prompted_at: { ...state.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
}

function paneEvent(pane: string): string {
  return JSON.stringify({
    event: 'pane_agent_status_changed',
    data: { type: 'pane_agent_status_changed', pane_id: pane, agent_status: 'idle' },
  });
}

test('stop records the leaf, then stops its leaf slice and keeps the worktree', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const worktree: string = z.string().parse(readState(path).worktree);
    const stopped: Result = await run(f, ['stop', 'build']);
    expect(stopped.code).toBe(0);
    expect(stoppedKeys(f)).toEqual(['repo/build']);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(path)}`]);
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    f.clean();
  }
});

test('a stopped leaf is not dispatched by an automatic pass, and a picked manual pass names start', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const pane: string = z.string().parse(readState(path).pane.A);
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    idle(f, path);
    const hooked: Result = await run(f, ['next'], { HERDR_PANE_ID: pane, HERDR_PLUGIN_EVENT_JSON: paneEvent(pane) });
    expect(hooked.code).toBe(0);
    expect(database(f).prompts).toEqual([]);
    const bare: Result = await run(f, ['next']);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('akrogon start build');
    expect(database(f).prompts).toEqual([]);
    const targeted: Result = await run(f, ['next', 'build']);
    expect(targeted.code).not.toBe(0);
    expect(targeted.stderr).toContain('akrogon start build');
    expect(database(f).prompts).toEqual([]);
  } finally {
    f.clean();
  }
});

test('the merge path builds no stack and starts no merge seat for a stopped leaf', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const aa: string = await allocatedIdle(f, 'aa');
    const bb: string = await allocatedIdle(f, 'bb');
    for (const [path, name] of [
      [aa, 'aa-file'],
      [bb, 'bb-file'],
    ] as const) {
      const worktree: string = z.string().parse(readState(path).worktree);
      writeFileSync(resolve(worktree, name), `${name}\n`);
      await command(['git', 'add', name], worktree);
      await command(['git', 'commit', '-m', name], worktree);
    }
    saveState(aa, { ...readState(aa), phase: 'merge', merge_stamp: '2026-09-11T00:00:00.000Z' });
    saveState(bb, { ...readState(bb), phase: 'merge', merge_stamp: '2026-09-12T00:00:00.000Z' });
    expect((await run(f, ['stop', 'aa'])).code).toBe(0);
    saveDatabase(f, { ...database(f), prompts: [] });
    await run(f, ['next']);
    expect(readState(aa).batch).toBeUndefined();
    const holder: State = readState(bb);
    expect(holder.batch).toBeDefined();
    expect(database(f).prompts.filter((prompt) => prompt.text.startsWith('merge-issue aa'))).toEqual([]);
    expect(holder.batch?.owner).toBe('command');
  } finally {
    f.clean();
  }
}, 15000);

test('a failed slice stop keeps the record, prints the error, exits non-zero and is retryable', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const failed: Result = await run(f, ['stop', 'build'], { FAKE_SYSTEMCTL_FAIL: slice(path) });
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain(slice(path));
    expect(failed.stderr).toContain('fake failure');
    expect(stoppedKeys(f)).toEqual(['repo/build']);
    const retried: Result = await run(f, ['stop', 'build']);
    expect(retried.code).toBe(0);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(path)}`, `--user stop ${slice(path)}`]);
    expect(stoppedKeys(f)).toEqual(['repo/build']);
  } finally {
    f.clean();
  }
});

test('stop --all stops every allocated leaf, reports each, and one failure does not block the others', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const aa: string = await allocatedIdle(f, 'aa');
    const bb: string = await allocatedIdle(f, 'bb');
    leaf(f, 'cc', 'plan.synthesis', { 'blocked-by': ['aa'] });
    const all: Result = await run(f, ['stop', '--all'], { FAKE_SYSTEMCTL_FAIL: slice(aa) });
    expect(all.code).not.toBe(0);
    expect(`${all.stdout}\n${all.stderr}`).toContain('aa');
    expect(`${all.stdout}\n${all.stderr}`).toContain('bb');
    expect(systemctlCalls(f).sort()).toEqual([`--user stop ${slice(aa)}`, `--user stop ${slice(bb)}`].sort());
    expect(stoppedKeys(f)).toEqual(['repo/aa', 'repo/bb']);
  } finally {
    f.clean();
  }
});

test('start removes the stopped record and runs the targeted pass, and refuses a leaf that is not stopped', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    idle(f, path);
    const started: Result = await run(f, ['start', 'build']);
    expect(started.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([]);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    const again: Result = await run(f, ['start', 'build']);
    expect(again.code).not.toBe(0);
  } finally {
    f.clean();
  }
});

test('status marks a stopped leaf on the board and in its leaf view', async () => {
  const f: StopFixture = await stopFixture();
  try {
    await allocatedIdle(f, 'build');
    leaf(f, 'other', 'plan.synthesis', { 'blocked-by': ['build'] });
    const before: Result = await run(f, ['status']);
    expect(before.stdout).not.toContain('stopped');
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    const board: Result = await run(f, ['status']);
    const row: string | undefined = board.stdout.split('\n').find((line) => /^\s+build\s/.test(line));
    expect(row).toContain('stopped');
    expect(board.stdout.split('\n').find((line) => /^\s+other\s/.test(line))).not.toContain('stopped');
    const view: Result = await run(f, ['status', 'build']);
    expect(view.stdout).toContain('stopped');
  } finally {
    f.clean();
  }
});

test('start runs the targeted pass for a leaf whose issue shares its name', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis', {}, 'build');
    expect((await run(f, ['next', 'issues/open/build/build'])).code).toBe(0);
    idle(f, path);
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    idle(f, path);
    const started: Result = await run(f, ['start', 'build']);
    expect(started.stderr).not.toContain('Ambiguous');
    expect(started.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([]);
    expect(database(f).prompts.length).toBeGreaterThan(0);
  } finally {
    f.clean();
  }
});

test('stopping the holder of an applied batch builds no second batch and prompts no merge seat', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const aa: string = await allocatedIdle(f, 'aa');
    const bb: string = await allocatedIdle(f, 'bb');
    for (const [path, name] of [
      [aa, 'aa-file'],
      [bb, 'bb-file'],
    ] as const) {
      const worktree: string = z.string().parse(readState(path).worktree);
      writeFileSync(resolve(worktree, name), `${name}\n`);
      await command(['git', 'add', name], worktree);
      await command(['git', 'commit', '-m', name], worktree);
    }
    saveState(aa, { ...readState(aa), phase: 'merge', merge_stamp: '2026-09-11T00:00:00.000Z' });
    saveState(bb, { ...readState(bb), phase: 'merge', merge_stamp: '2026-09-12T00:00:00.000Z' });
    await run(f, ['next']);
    const applied: State['batch'] = readState(aa).batch;
    expect(applied?.applied).toBe(true);
    expect((await run(f, ['stop', 'aa'])).code).toBe(0);
    saveDatabase(f, { ...database(f), prompts: [] });
    await run(f, ['next']);
    expect(readState(bb).batch).toBeUndefined();
    expect(readState(aa).batch?.attempt).toBe(applied?.attempt);
    expect(database(f).prompts.filter((prompt) => prompt.text.startsWith('merge-issue'))).toEqual([]);
  } finally {
    f.clean();
  }
}, 15000);

test('stop --all skips merged and closed leaves that keep their tab', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const live: string = await allocatedIdle(f, 'live');
    leaf(f, 'landed', 'merged', { tab: 'w1:t9' });
    const closed: string = resolve(f.root, 'issues/closed/old/done');
    mkdirSync(closed, { recursive: true });
    yaml(resolve(closed, 'state.yaml'), {
      slug: 'done',
      phase: 'merged',
      created: '2026-09-10',
      repo: 'repo',
      debate: 'no',
      'blocked-by': [],
      tab: 'w1:t8',
    });
    const all: Result = await run(f, ['stop', '--all']);
    expect(all.code).toBe(0);
    expect(stoppedKeys(f)).toEqual(['repo/live']);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(live)}`]);
  } finally {
    f.clean();
  }
});
