// Setup-before-seat criterion 4 on a real core: when setup is due and a recorded seat of the leaf
// is busy (live with status working, blocked or null) or the leaf has a live run-check, nothing is
// delivered to the leaf, no capacity wait or error is recorded, other leaves still dispatch and
// `akrogon seat` refuses naming the busy seat or run; once the seat settles the next pass runs
// setup and delivers. The run-check helpers mirror tests/hc-delivery.test.ts.
import { test, expect } from 'bun:test';
import { chmodSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, entry, leaf, leafTempRoot, killTree, storeDir, unitBin, WAIT_MS, type Fixture } from './helpers';
import { hcFixture, shortStartProof, stopCoresAfterFile, type HcFixture, type Terminal } from './hc-fixture';
import { readState } from '../src/state';
import { ownLive } from '../src/admission';
import { readTimings } from '../src/timing';
import { finishCaptured, spawnFiles, type Result, type SpawnResult } from '../src/shell';
import {
  declareEnv,
  next,
  setupCalls,
  setupCallsFor,
  setupLines,
  setupLog,
  setupScript,
  waitIdle,
  writeSetup,
} from './setup-fixture';

stopCoresAfterFile();

// The stand-in hook: every delivery is tagged into the shared setup log, then the turn holds at
// the reported status while the hold file exists. The hold file is armed separately, after the
// first turn has settled, so the first delivery runs through.
function writeHook(f: HcFixture, status?: string): void {
  const report: string = status === undefined ? '' : `printf '\\033]7501;state=${status}\\007'\n`;
  writeFileSync(
    resolve(f.core.standin, 'hook'),
    `#!/bin/sh\n` +
      `echo "task-$(basename "$PWD")" >> '${setupLog(f)}'\n` +
      `${report}while [ -e '${resolve(f.core.standin, 'hold')}' ]; do sleep 0.05; done\n`,
  );
  chmodSync(resolve(f.core.standin, 'hook'), 0o755);
}

const runRecordRow = z.object({
  state: z.string(),
  repo: z.string(),
  leaf: z.string(),
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  slice: z.string(),
  unit: z.string(),
  run: z.string(),
});
type RunRecordRow = z.infer<typeof runRecordRow>;

function runRecords(f: Fixture): RunRecordRow[] {
  const dir: string = resolve(f.home, 'runs');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => runRecordRow.parse(Bun.YAML.parse(readFileSync(resolve(dir, name), 'utf8'))));
}

async function waitRunRecord(f: Fixture, state: string, ms: number = WAIT_MS): Promise<RunRecordRow> {
  const deadline: number = Date.now() + ms;
  for (;;) {
    const found: RunRecordRow | undefined = runRecords(f).find((record) => record.state === state);
    if (found !== undefined) return found;
    if (Date.now() > deadline) throw new Error(`No ${state} run record`);
    await Bun.sleep(50);
  }
}

function liveRecords(f: Fixture): RunRecordRow[] {
  const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
  return runRecords(f).filter(
    (record) => (record.state === 'live' || record.state === 'waiting') && ownLive(record, boot),
  );
}

async function waitUntil(done: () => boolean, failure: string): Promise<void> {
  const deadline: number = Date.now() + WAIT_MS;
  while (!done()) {
    if (Date.now() > deadline) throw new Error(failure);
    await Bun.sleep(50);
  }
}

function spawnRunCheck(f: HcFixture, args: string[]): { proc: Bun.Subprocess; result: Promise<SpawnResult> } {
  const { child, captured } = spawnFiles([process.execPath, entry, ...args], {
    cwd: f.root,
    env: {
      ...process.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      HOME: f.home,
      AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      AKROGON_RUN: '',
      PATH: `${resolve(f.home, 'bin')}:${unitBin(f)}:${process.env.PATH}`,
    },
  });
  return { proc: child, result: finishCaptured(child, captured) };
}

// The first allocation installs v1, then `akrogon seat` re-records a fresh seat whose first turn
// the hold keeps busy at the reported status while the config moves to v2: setup is due against a
// recorded busy seat. Returns the busy seat's terminal.
async function busySetup(f: HcFixture, slug: string, status?: string): Promise<Terminal> {
  declareEnv(f);
  writeHook(f, status);
  writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await next(f, [slug])).code).toBe(0);
  expect(setupCalls(f)).toBe(1);
  const first: Terminal = await waitIdle(f, slug, 'a');
  writeFileSync(resolve(f.core.standin, 'hold'), '');
  // hc refuses a second terminal under the seat's name, so the live seat is retired first; the
  // fresh `akrogon seat` terminal is the recorded seat whose first turn the hold keeps busy.
  expect((await f.core.hc(['kill', first.address])).code).toBe(0);
  expect((await f.core.hc(['rm', first.address])).code).toBe(0);
  expect((await cli(f, ['seat', slug, 'A'], f.root, f.env)).code).toBe(0);
  const recorded: string = readState(path).seat.A?.address ?? first.address;
  expect(recorded).not.toBe(first.address);
  const busy: Terminal = await f.core.waitFor(recorded, (t: Terminal) =>
    status === undefined ? t.status?.state === 'working' : t.status?.state === status.split(':')[0],
  );
  writeSetup(f, setupScript(f, 2), { env: ['SETUP_PROBE'] });
  return busy;
}

for (const status of [undefined, 'blocked:kind=permission']) {
  test(`criterion 4: a ${status === undefined ? 'working' : 'blocked'} seat holds the due setup, then the settled pass delivers`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const seat: Terminal = await busySetup(f, 'build', status);
      leaf(f, 'other', 'plan.synthesis');
      const second: Result = await next(f, []);
      expect(second.code).toBe(0);
      expect(second.stderr).not.toContain('build');
      // No setup runs for the busy leaf and nothing is delivered to it this pass.
      expect(setupCallsFor(f, 'build')).toBe(1);
      expect(f.core.tasks(seat.address)).toHaveLength(1);
      // No capacity wait and no error row for the leaf: it simply waits for the next pass.
      expect(
        readTimings(f.root).filter(
          (event) => event.kind === 'wait' && event.slug === 'build' && event.reason === 'capacity',
        ),
      ).toEqual([]);
      // The unstarted sibling in the same pass runs setup and dispatches.
      expect(setupLines(f).some((line: string) => line === `cwd=${resolve(storeDir(f), 'other')}`)).toBe(true);
      expect((await f.core.terminals({ 'akrogon.leaf': 'other' }, false)).length).toBe(1);
      // `akrogon seat` refuses, naming the busy seat.
      const refused: Result = await cli(f, ['seat', 'build', 'A'], f.root, f.env);
      expect(refused.code).not.toBe(0);
      expect(refused.stderr).toContain(seat.address);
      // Once the seat is idle again the next pass runs setup and then delivers.
      rmSync(resolve(f.core.standin, 'hold'), { force: true });
      await f.core.waitFor(seat.address, (t: Terminal) => t.status?.state === 'idle');
      expect((await next(f, ['build'])).code).toBe(0);
      expect(setupCallsFor(f, 'build')).toBe(2);
      // The re-prompt delivered the seat's second task (its argv task was the first); the retired
      // predecessor's delivery lines also sit in the shared log, so the seat's own task file counts.
      expect(f.core.tasks(seat.address)).toHaveLength(2);
      const lines: string[] = setupLines(f);
      expect(lines.lastIndexOf('task-build')).toBeGreaterThan(
        lines.lastIndexOf(`cwd=${resolve(storeDir(f), 'build')}`),
      );
    } finally {
      await f.clean();
    }
  });
}

test('criterion 4: a live run-check of the leaf holds the due setup and the seat refusal names the run', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    writeHook(f);
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const seat: Terminal = await waitIdle(f, 'build', 'a');
    writeSetup(f, setupScript(f, 2), { env: ['SETUP_PROBE'] });
    const held = spawnRunCheck(f, ['run-check', '--leaf', path, '--name', 'held', '--', 'sh', '-c', 'sleep 60']);
    const live: RunRecordRow = await waitRunRecord(f, 'live');
    expect(live).toMatchObject({ repo: f.repo, leaf: 'build' });
    try {
      expect((await next(f, ['build'])).code).toBe(0);
      expect(setupCalls(f)).toBe(1);
      expect(f.core.tasks(seat.address)).toHaveLength(1);
      const refused: Result = await cli(f, ['seat', 'build', 'A'], f.root, f.env);
      expect(refused.code).not.toBe(0);
      expect(refused.stderr).toContain(live.run);
    } finally {
      killTree(held.proc);
      await waitUntil(() => liveRecords(f).length === 0, 'run records never cleared');
    }
    // With the run gone the next pass runs setup and re-prompts the idle seat.
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(2);
    expect(f.core.tasks(seat.address).length).toBeGreaterThanOrEqual(2);
  } finally {
    await f.clean();
  }
});

test('criterion 4: a seat reporting error does not hold the due setup', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const seat: Terminal = await busySetup(f, 'build', 'error');
    await f.core.waitFor(seat.address, (t: Terminal) => t.status?.state === 'error');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(2);
    // The erroring seat is no delivery target either; the send waits for idle or done.
    expect(f.core.tasks(seat.address)).toHaveLength(1);
    rmSync(resolve(f.core.standin, 'hold'), { force: true });
  } finally {
    await f.clean();
  }
});

test('criterion 4: a live seat with a null status holds the due setup', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    writeHook(f);
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(1);
    // A second seat whose stand-in sleeps 20 s before its first status: live with a null status
    // while setup is due. The delay file keys on the worktree's basename. The live seat is retired
    // first, since hc refuses a second terminal under the seat's name. The config moves to v2 only
    // after the seat started, so `akrogon seat` itself runs no setup.
    const first: Terminal = (await f.core.terminals({ 'akrogon.leaf': 'build' }, false))[0];
    expect((await f.core.hc(['kill', first.address])).code).toBe(0);
    expect((await f.core.hc(['rm', first.address])).code).toBe(0);
    writeFileSync(resolve(f.core.standin, 'delay-build'), '20\n');
    expect((await cli(f, ['seat', 'build', 'A'], f.root, { ...f.env, ...shortStartProof })).code).toBe(0);
    writeSetup(f, setupScript(f, 2), { env: ['SETUP_PROBE'] });
    const seats: Terminal[] = await f.core.terminals({ 'akrogon.leaf': 'build' }, false);
    const delayed: Terminal | undefined = seats.find((t: Terminal) => t.status === null);
    if (delayed === undefined) throw new Error('the delayed seat already reported a status');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(1);
    const refused: Result = await cli(f, ['seat', 'build', 'A'], f.root, { ...f.env, ...shortStartProof });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(delayed.address);
    expect((await f.core.get(delayed.address)).status).toBeNull();
    // Once the seat reports idle the next pass runs setup.
    await f.core.waitFor(delayed.address, (t: Terminal) => t.status?.state === 'idle', 30_000);
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(2);
  } finally {
    await f.clean();
  }
});
