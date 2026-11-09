import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { command, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
import { readState, saveState, type State } from '../src/state';
import { cli, leaf, yaml } from './helpers';
import { delivered, hcFixture, type HcFixture, type Terminal } from './hc-fixture';

type StopFixture = HcFixture & { systemctlLog: string };

// Logs argv one line per call; exits 1 with a message when an argument equals $FAKE_SYSTEMCTL_FAIL.
// A regular file in the fixture's bin/, ahead of hcFixture's fake: removed first so the write never
// goes through a link.
async function stopFixture(): Promise<StopFixture> {
  const f: HcFixture = await hcFixture();
  const script: string = resolve(f.home, 'bin', 'systemctl');
  rmSync(script, { force: true });
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
  return { ...f, env: { ...f.env, FAKE_SYSTEMCTL_LOG: systemctlLog }, systemctlLog };
}

// Every task any seat terminal received, finished terminals included: the old fake herdr prompts.
async function prompts(f: StopFixture): Promise<string[]> {
  const seats: Terminal[] = await f.core.terminals({ akrogon: '1' }, true);
  return seats.flatMap((t: Terminal) => f.core.tasks(t.address));
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

/** Allocate a leaf, then wait until its seats ended their turn, so any later pass would prompt again (D13). */
async function allocatedIdle(f: StopFixture, slug: string): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await run(f, ['next', slug])).code).toBe(0);
  expect((await delivered(f, slug)).length).toBeGreaterThan(0);
  await idle(f, path);
  return path;
}

// Waits until every recorded live seat is idle at a turn past its prompt: a re-promptable seat. A seat
// that stop already ended and removed is skipped; the next pass starts a new one.
async function idle(f: StopFixture, path: string): Promise<void> {
  const state: State = readState(path);
  const live: string[] = (await f.core.terminals({ akrogon: '1' }, false)).map((t: Terminal) => t.address);
  for (const slot of ['A', 'B'] as const) {
    const seat = state.seat[slot];
    const prompted = state.prompted[slot];
    if (seat === undefined || typeof prompted !== 'object' || !live.includes(seat.address)) continue;
    await f.core.waitFor(seat.address, (t: Terminal) => t.status?.state === 'idle' && t.turn > prompted.turn);
  }
}

test('stop records the leaf, then stops its leaf slice and keeps the worktree', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const worktree: string = z.string().parse(readState(path).worktree);
    const stopped: Result = await run(f, ['stop', 'build']);
    expect(stopped.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([`${f.repo}/build`]);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(path)}`]);
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
});

test('a stopped leaf is not dispatched by an automatic pass, and a picked manual pass names start', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    await idle(f, path);
    const before: string[] = await prompts(f);
    const woken: Result = await run(f, ['next', '--wake']);
    expect(woken.code).toBe(0);
    expect(await prompts(f)).toEqual(before);
    const bare: Result = await run(f, ['next']);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('akrogon start build');
    expect(await prompts(f)).toEqual(before);
    const targeted: Result = await run(f, ['next', 'build']);
    expect(targeted.code).not.toBe(0);
    expect(targeted.stderr).toContain('akrogon start build');
    expect(await prompts(f)).toEqual(before);
  } finally {
    await f.clean();
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
    await run(f, ['next']);
    expect(readState(aa).batch).toBeUndefined();
    const holder: State = readState(bb);
    expect(holder.batch).toBeDefined();
    expect((await prompts(f)).filter((text) => text.startsWith('merge-issue aa'))).toEqual([]);
    expect(holder.batch?.owner).toBe('command');
  } finally {
    await f.clean();
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
    expect(stoppedKeys(f)).toEqual([`${f.repo}/build`]);
    const retried: Result = await run(f, ['stop', 'build']);
    expect(retried.code).toBe(0);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(path)}`, `--user stop ${slice(path)}`]);
    expect(stoppedKeys(f)).toEqual([`${f.repo}/build`]);
  } finally {
    await f.clean();
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
    expect(stoppedKeys(f)).toEqual([`${f.repo}/aa`, `${f.repo}/bb`]);
  } finally {
    await f.clean();
  }
});

test('start removes the stopped record and runs the targeted pass, and refuses a leaf that is not stopped', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    await idle(f, path);
    const before: number = (await delivered(f, 'build')).length;
    const started: Result = await run(f, ['start', 'build']);
    expect(started.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([]);
    expect((await delivered(f, 'build')).length).toBeGreaterThan(before);
    const again: Result = await run(f, ['start', 'build']);
    expect(again.code).not.toBe(0);
  } finally {
    await f.clean();
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
    await f.clean();
  }
});

test('start runs the targeted pass for a leaf whose issue shares its name', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis', {}, 'build');
    expect((await run(f, ['next', 'issues/open/build/build'])).code).toBe(0);
    await idle(f, path);
    expect((await run(f, ['stop', 'build'])).code).toBe(0);
    await idle(f, path);
    const before: number = (await delivered(f, 'build')).length;
    const started: Result = await run(f, ['start', 'build']);
    expect(started.stderr).not.toContain('Ambiguous');
    expect(started.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([]);
    expect((await delivered(f, 'build')).length).toBeGreaterThan(before);
  } finally {
    await f.clean();
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
    const before: number = (await prompts(f)).filter((text) => text.startsWith('merge-issue')).length;
    await run(f, ['next']);
    expect(readState(bb).batch).toBeUndefined();
    expect(readState(aa).batch?.attempt).toBe(applied?.attempt);
    expect((await prompts(f)).filter((text) => text.startsWith('merge-issue'))).toHaveLength(before);
  } finally {
    await f.clean();
  }
}, 15000);

test('stop --all skips merged and closed leaves that keep their tab', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const live: string = await allocatedIdle(f, 'live');
    leaf(f, 'landed', 'merged', { tab: 'aklandedtab' });
    const closed: string = resolve(f.root, 'issues/closed/old/done');
    mkdirSync(closed, { recursive: true });
    yaml(resolve(closed, 'state.yaml'), {
      slug: 'done',
      phase: 'merged',
      created: '2026-09-10',
      repo: f.repo,
      'blocked-by': [],
      tab: 'akclosedtab',
    });
    const all: Result = await run(f, ['stop', '--all']);
    expect(all.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([`${f.repo}/live`]);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(live)}`]);
  } finally {
    await f.clean();
  }
});
