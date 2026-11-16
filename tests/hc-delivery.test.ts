// Criteria 4 and 5: one prompt per seat per turn, the silent-stop bound and the send guards,
// on a real hc core with the stand-in agent. `next <slug>` stands in for the listener's wake.
import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, entry, fixture, leaf, leafTempRoot, killTree, unitBin, yaml, type Fixture } from './helpers';
import { coreBin, hcCore, setSeat, shortStartProof, type HcCore, type Terminal } from './hc-fixture';
import { readState } from '../src/state';
import { leafSlice } from '../src/scope';
import { readTimings, type TimingEvent } from '../src/timing';
import { finishCaptured, spawnCaptured, spawnFiles, type Result, type SpawnResult } from '../src/shell';

async function setup(slug: string, harness: 'fake' | 'agy', mode: string) {
  const f: Fixture = await fixture();
  setSeat(f, 'a', harness, mode);
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, slug, 'plan.synthesis');
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: f.repo }, slug)]);
  f.clean();
}

// The stand-in's first turn waits on a FIFO the test opens, so the seat is `working` on demand.
function gateFirstTurn(core: HcCore): string {
  const gate: string = resolve(core.standin, 'gate');
  writeFileSync(
    resolve(core.standin, 'hook'),
    `#!/bin/sh\nif [ -p '${gate}' ]; then cat '${gate}' >/dev/null; rm -f '${gate}'; fi\n`,
  );
  chmodSync(resolve(core.standin, 'hook'), 0o755);
  Bun.spawnSync(['mkfifo', gate]);
  return gate;
}

async function seatA(core: HcCore, slug: string): Promise<Terminal> {
  const found: Terminal[] = await core.terminals({ 'akrogon.leaf': slug, 'akrogon.seat': 'a' }, false);
  expect(found).toHaveLength(1);
  return found[0];
}

const idleAfter =
  (turn: number) =>
  (t: Terminal): boolean =>
    t.turn >= turn && t.status?.state === 'idle';

test('a phase run during the turn and the turn-end pass prompt the next idle turn exactly once', async () => {
  const { f, core, path } = await setup('hd-turn', 'fake', 'work');
  try {
    const gate: string = gateFirstTurn(core);
    expect((await cli(f, ['next', 'hd-turn'], f.root, core.env)).code).toBe(0);
    const seat: Terminal = await core.waitFor(
      (await seatA(core, 'hd-turn')).address,
      (t) => t.status?.state === 'working',
    );
    // The seat reports its phase from inside its turn: the phase's own pass must not prompt a working seat.
    expect((await cli(f, ['phase', 'hd-turn', 'implement', '--slot', 'A'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(seat.address)).toHaveLength(1);
    writeFileSync(gate, 'go\n');
    await core.waitFor(seat.address, idleAfter(1));
    // The implement turn is held working as well: a turn the stand-in ends without reporting is a silent
    // stop that D13 re-prompts, so the second pass must run while the prompted turn is still open.
    Bun.spawnSync(['mkfifo', gate]);
    // C4.1: two passes over the same idle turn send one task.
    expect((await cli(f, ['next', 'hd-turn'], f.root, core.env)).code).toBe(0);
    expect((await cli(f, ['next', 'hd-turn'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(seat.address)).toEqual([
      `plan-issue hd-turn slot=A phase=plan.synthesis leaf=${path}`,
      `implement-issue hd-turn slot=A phase=implement leaf=${path}`,
    ]);
    expect(readState(path).prompted.A).toMatchObject({ address: seat.address });
    writeFileSync(gate, 'go\n');
  } finally {
    await teardown(f, core, 'hd-turn');
  }
});

test('silent stops are re-prompted, the third fails the leaf, and a phase move resets the count', async () => {
  const { f, core, path } = await setup('hd-silent', 'fake', 'work');
  try {
    expect((await cli(f, ['next', 'hd-silent'], f.root, core.env)).code).toBe(0);
    const address: string = (await seatA(core, 'hd-silent')).address;
    // A start or a delivery counts nothing: the count moves only at a seen silent turn end.
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    expect(readState(path).lost).toEqual({ A: 0, B: 0 });
    // plan.synthesis: initial prompt, two silent stops re-prompted.
    for (const turn of [1, 2]) {
      await core.waitFor(address, idleAfter(turn));
      expect((await cli(f, ['next', 'hd-silent'], f.root, core.env)).code).toBe(0);
      expect(readState(path).attempts).toEqual({ A: turn, B: 0 });
    }
    expect(core.tasks(address)).toHaveLength(3);
    // C4.2: a phase move resets the count, so implement gets its own three prompts.
    await core.waitFor(address, idleAfter(3));
    expect((await cli(f, ['phase', 'hd-silent', 'implement', '--slot', 'A'], f.root, core.env)).code).toBe(0);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    expect(core.tasks(address)).toHaveLength(4);
    for (const turn of [4, 5]) {
      await core.waitFor(address, idleAfter(turn));
      expect((await cli(f, ['next', 'hd-silent'], f.root, core.env)).code).toBe(0);
      expect(readState(path).phase).toBe('implement');
      expect(readState(path).attempts).toEqual({ A: turn - 3, B: 0 });
    }
    expect(core.tasks(address)).toHaveLength(6);
    await core.waitFor(address, idleAfter(6));
    await cli(f, ['next', 'hd-silent'], f.root, core.env);
    const failed = readState(path);
    expect(failed.phase).toBe('failed');
    expect(failed.failure?.reason).toBe('seat A ended 3 turns without reporting');
    expect(core.tasks(address)).toHaveLength(6);
  } finally {
    await teardown(f, core, 'hd-silent');
  }
});

test('one silent turn end is counted once, including a pass where the redelivery send throws', async () => {
  const { f, core, path } = await setup('hd-once', 'fake', 'work');
  const hold: string = resolve(core.standin, 'hold');
  writeFileSync(resolve(core.standin, 'hook'), `#!/bin/sh\nwhile [ -e '${hold}' ]; do sleep 0.05; done\n`);
  chmodSync(resolve(core.standin, 'hook'), 0o755);
  try {
    expect((await cli(f, ['next', 'hd-once'], f.root, core.env)).code).toBe(0);
    const address: string = (await seatA(core, 'hd-once')).address;
    await core.waitFor(address, idleAfter(1));
    // The count is written before the redelivery send: a throwing send leaves it charged once.
    writeFileSync(hold, '');
    const unavailable: string = resolve(f.home, 'unavailable-once');
    writeFileSync(unavailable, '');
    const thrown = await cli(f, ['next', 'hd-once'], f.root, { ...core.env, HC_SHIM_UNAVAILABLE: unavailable });
    expect(thrown.code).not.toBe(0);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect(core.tasks(address)).toHaveLength(1);
    // The same ended turn is not recounted: the retry delivers and leaves the count at 1. The
    // delivered turn is held open working.
    expect((await cli(f, ['next', 'hd-once'], f.root, core.env)).code).toBe(0);
    await core.waitFor(address, (t: Terminal) => t.status?.state === 'working');
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect(core.tasks(address)).toHaveLength(2);
    // A pass over the still-open turn neither counts nor sends.
    expect((await cli(f, ['next', 'hd-once'], f.root, core.env)).code).toBe(0);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect(core.tasks(address)).toHaveLength(2);
  } finally {
    rmSync(hold, { force: true });
    await teardown(f, core, 'hd-once');
  }
});

type RunRecordRow = { state: string; repo: string; leaf: string; check: string; pid: number };

// The admission records a run-check leaves in the fixture's AKROGON_HOME while it runs.
function runRecords(f: Fixture): RunRecordRow[] {
  const dir: string = resolve(f.home, 'runs');
  const records: RunRecordRow[] = [];
  if (!existsSync(dir)) return records;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.yaml')) continue;
    records.push(
      z
        .object({ state: z.string(), repo: z.string(), leaf: z.string(), check: z.string(), pid: z.number() })
        .parse(Bun.YAML.parse(readFileSync(resolve(dir, name), 'utf8'))),
    );
  }
  return records;
}

async function waitRunRecord(f: Fixture, state: string, ms: number = 15000): Promise<RunRecordRow> {
  const deadline: number = Date.now() + ms;
  for (;;) {
    const found: RunRecordRow | undefined = runRecords(f).find((record) => record.state === state);
    if (found !== undefined) return found;
    if (Date.now() > deadline) throw new Error(`No ${state} run record`);
    await Bun.sleep(50);
  }
}

type LiveCheck = { proc: Bun.Subprocess; result: Promise<SpawnResult> };

function spawnRunCheck(f: Fixture, args: string[], env: NodeJS.ProcessEnv): LiveCheck {
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
      ...env,
    },
  });
  return { proc: child, result: finishCaptured(child, captured) };
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// What liveRuns() sees: live or waiting records whose recorded pid still runs.
function liveRecords(f: Fixture): RunRecordRow[] {
  return runRecords(f).filter((record) => (record.state === 'live' || record.state === 'waiting') && alive(record.pid));
}

test('a live or waiting run-check record suppresses counting and redelivery until it is gone', async () => {
  const { f, core, path } = await setup('hd-runs', 'fake', 'work');
  try {
    expect((await cli(f, ['next', 'hd-runs'], f.root, core.env)).code).toBe(0);
    const address: string = (await seatA(core, 'hd-runs')).address;
    // A real admission record for this repo and leaf, from a sleeping run-check named in full.
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { held: 'sleep 60', queued: 'sleep 60' },
      full: ['held', 'queued'],
      grounding: 'none',
    });
    const held = spawnRunCheck(
      f,
      ['run-check', '--leaf', path, '--name', 'held', '--', 'sh', '-c', 'sleep 60'],
      core.env,
    );
    const live: RunRecordRow = await waitRunRecord(f, 'live');
    expect(live).toMatchObject({ repo: f.repo, leaf: 'hd-runs', check: 'held' });
    await core.waitFor(address, idleAfter(1));
    // The seat's turn ended silently, but its own run is live: no count, no prompt.
    expect((await cli(f, ['next', 'hd-runs'], f.root, core.env)).code).toBe(0);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    expect(core.tasks(address)).toHaveLength(1);
    // A waiting record behind the live one suppresses the same way.
    const queued = spawnRunCheck(
      f,
      ['run-check', '--leaf', path, '--name', 'queued', '--', 'sh', '-c', 'sleep 60'],
      core.env,
    );
    expect((await waitRunRecord(f, 'waiting')).check).toBe('queued');
    expect((await cli(f, ['next', 'hd-runs'], f.root, core.env)).code).toBe(0);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    expect(core.tasks(address)).toHaveLength(1);
    killTree(held.proc);
    killTree(queued.proc);
    const deadline: number = Date.now() + 15000;
    while (liveRecords(f).length > 0) {
      if (Date.now() > deadline) throw new Error('run records never cleared');
      await Bun.sleep(50);
    }
    // With the record gone, the ended turn counts and the seat is re-prompted once.
    expect((await cli(f, ['next', 'hd-runs'], f.root, core.env)).code).toBe(0);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect(core.tasks(address)).toHaveLength(2);
  } finally {
    await teardown(f, core, 'hd-runs');
  }
});

function seatLostRows(f: Fixture): TimingEvent[] {
  return readTimings(f.root).filter((event) => event.kind === 'seat_lost');
}

test('a lost seat is charged and rowed, a finished silent end is not, and the third loss fails', async () => {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'fake', 'work');
  setSeat(f, 'b', 'fake', 'work');
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, 'hd-lost', 'check.review');
  const hold: string = resolve(core.standin, 'hold');
  writeFileSync(hold, '');
  writeFileSync(
    resolve(core.standin, 'hook'),
    `#!/bin/sh\nwhile [ -e '${hold}' ] && [ ! -e "${core.standin}/free-$1" ]; do sleep 0.05; done\n`,
  );
  chmodSync(resolve(core.standin, 'hook'), 0o755);
  try {
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    // A loss is a recorded seat whose terminal is missing: kill removes it, rm unlists it. A seat
    // killed mid-turn ended that turn (hc advances the turn on any terminal end), so kill alone
    // never reaches the loss path; the finished silent end is the carve-out case below.
    const goneCalls = (address: string): string[] =>
      readFileSync(core.shimLog, 'utf8')
        .split('\n')
        .map((line: string) => line.split('\t'))
        .filter((args: string[]) => args.includes(address))
        .map((args: string[]) => args[0]);
    const loseSeat = async (): Promise<string> => {
      const address: string = (await seatA(core, 'hd-lost')).address;
      expect((await core.hc(['kill', address])).code).toBe(0);
      expect((await core.hc(['rm', address])).code).toBe(0);
      return address;
    };
    const first: string = await loseSeat();
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    expect(readState(path).lost).toEqual({ A: 1, B: 0 });
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    const second: string = (await seatA(core, 'hd-lost')).address;
    expect(second).not.toBe(first);
    // Each loss is one row with gone: true and no screen; a gone terminal is never read or sent to
    // (test kills bypass the shim log), so its only shim-logged call is the not_found get.
    const lost1: TimingEvent[] = seatLostRows(f);
    expect(lost1).toHaveLength(1);
    expect(lost1[0]).toMatchObject({ slot: 'A', phase: 'check.review', slug: 'hd-lost', address: first, gone: true });
    expect(lost1[0]).not.toHaveProperty('screen');
    const calls1: string[] = goneCalls(first);
    expect(calls1).toContain('get');
    expect(calls1.filter((call: string) => call !== 'get' && call !== 'events' && call !== 'run')).toHaveLength(0);
    // Loss 2.
    expect(await loseSeat()).toBe(second);
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    expect(readState(path).lost).toEqual({ A: 2, B: 0 });
    const third: string = (await seatA(core, 'hd-lost')).address;
    expect(third).not.toBe(second);
    expect(seatLostRows(f)).toHaveLength(2);
    expect(seatLostRows(f)[1]).toMatchObject({ slot: 'A', address: second, gone: true });
    // A seen turn end resets the count: free the hold so the turn ends, kill the seat after the
    // end, and the pass counts a silent end instead of a loss.
    writeFileSync(resolve(core.standin, `free-${third}`), '');
    await core.waitFor(third, idleAfter(1));
    expect((await core.hc(['kill', third])).code).toBe(0);
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    expect(readState(path).lost).toEqual({ A: 0, B: 0 });
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect(seatLostRows(f)).toHaveLength(2);
    const fourth: string = (await seatA(core, 'hd-lost')).address;
    expect(fourth).not.toBe(third);
    // Losses 1 and 2 after the reset, then the third charges the leaf as failed and starts nothing.
    expect(await loseSeat()).toBe(fourth);
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    expect(readState(path).lost).toEqual({ A: 1, B: 0 });
    const fifth: string = (await seatA(core, 'hd-lost')).address;
    expect(fifth).not.toBe(fourth);
    expect(await loseSeat()).toBe(fifth);
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    expect(readState(path).lost).toEqual({ A: 2, B: 0 });
    const sixth: string = (await seatA(core, 'hd-lost')).address;
    expect(sixth).not.toBe(fifth);
    expect(await loseSeat()).toBe(sixth);
    expect((await cli(f, ['next', 'hd-lost'], f.root, core.env)).code).toBe(0);
    const failed = readState(path);
    expect(failed.phase).toBe('failed');
    expect(failed.failure?.cause).toBe('attempts');
    expect(failed.failure?.reason).toBe('seat A was lost 3 times before ending a turn');
    // B still stands; no replacement A was started for the third loss.
    expect(await core.terminals({ 'akrogon.leaf': 'hd-lost', 'akrogon.seat': 'a' }, false)).toHaveLength(0);
    expect(seatLostRows(f)).toHaveLength(5);
  } finally {
    rmSync(hold, { force: true });
    await teardown(f, core, 'hd-lost');
  }
});

test('a seat that dies during its start proof is charged as a loss', async () => {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'fake', 'exit');
  setSeat(f, 'b', 'fake', 'exit');
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, 'hd-dead-start', 'plan.synthesis');
  try {
    const first: Result = await cli(f, ['next', 'hd-dead-start'], f.root, core.env);
    expect(first.code).not.toBe(0);
    expect(readState(path).lost).toEqual({ A: 0, B: 0 });
    const second = await cli(f, ['next', 'hd-dead-start'], f.root, core.env);
    expect(second.code).not.toBe(0);
    expect(readState(path).lost).toEqual({ A: 1, B: 0 });
    const rows: TimingEvent[] = seatLostRows(f);
    expect(rows).toHaveLength(1);
    const row = rows[0] as { address?: string; turn?: number; exit_code?: number | null; screen?: string };
    expect(rows[0]).toMatchObject({ slot: 'A', phase: 'plan.synthesis', slug: 'hd-dead-start', turn: 0, exit_code: 3 });
    expect(rows[0]).not.toHaveProperty('gone');
    expect(typeof row.screen).toBe('string');
    expect((row.screen ?? '').split('\n').length).toBeLessThanOrEqual(40);
    // The row's fields are read before end()'s kill/rm removes the terminal.
    const calls: string[] = readFileSync(core.shimLog, 'utf8')
      .split('\n')
      .map((line: string) => line.split('\t'))
      .filter((args: string[]) => args.includes(z.string().parse(row.address)))
      .map((args: string[]) => args[0]);
    expect(calls).toContain('read');
    expect(calls.lastIndexOf('read')).toBeLessThan(calls.indexOf('kill'));
    expect(calls.indexOf('kill')).toBeLessThan(calls.indexOf('rm'));
  } finally {
    await teardown(f, core, 'hd-dead-start');
  }
});

test('a turn that ends in done without reporting is a silent stop and is re-prompted', async () => {
  const { f, core, path } = await setup('hd-done', 'fake', 'done');
  try {
    expect((await cli(f, ['next', 'hd-done'], f.root, core.env)).code).toBe(0);
    const address: string = (await seatA(core, 'hd-done')).address;
    await core.waitFor(address, (t: Terminal) => t.turn >= 1 && t.status?.state === 'done');
    expect((await cli(f, ['next', 'hd-done'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(address)).toHaveLength(2);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
  } finally {
    await teardown(f, core, 'hd-done');
  }
});

test('a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves', async () => {
  const { f, core, path } = await setup('hd-send', 'fake', 'idle');
  try {
    expect((await cli(f, ['next', 'hd-send'], f.root, { ...core.env, ...shortStartProof })).code).toBe(0);
    const address: string = (await seatA(core, 'hd-send')).address;
    expect(readState(path).delivery_error.A).toMatchObject({ code: 'not_confirmed' });
    // The phase move clears the record; its own pass sends the implement task, which never starts.
    expect((await cli(f, ['phase', 'hd-send', 'implement', '--slot', 'A'], f.root, core.env)).code).toBe(0);
    const error = z
      .object({ code: z.literal('not_started'), turn: z.number(), address: z.string() })
      .passthrough()
      .parse(readState(path).delivery_error.A);
    expect(error.address).toBe(address);
    expect(core.tasks(address)).toHaveLength(2);
    // C5.1: nothing is resent while the turn is unchanged.
    expect((await cli(f, ['next', 'hd-send'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(address)).toHaveLength(2);
    // The seat's turn moves; the next pass resettles the send as delivered.
    expect((await core.hc(['send', '--json', address, 'WORK'])).code).toBe(0);
    await core.waitFor(address, idleAfter(error.turn + 1));
    expect((await cli(f, ['next', 'hd-send'], f.root, core.env)).code).toBe(0);
    const settled = readState(path);
    // The late turn's recorded send is treated as the prompt for that turn; its end with no report is a
    // silent stop: it counts once and clears prompted, then the resettled send fails not_started again.
    expect(settled.prompted.A).toBeUndefined();
    expect(settled.delivery_error.A).toMatchObject({ code: 'not_started', turn: error.turn + 1, address });
    expect(settled.attempts).toEqual({ A: 1, B: 0 });
  } finally {
    await teardown(f, core, 'hd-send');
  }
});

test('an agy seat answers the trust dialog once and its first task, refused unavailable, goes in once', async () => {
  const { f, core, path } = await setup('hd-agy', 'agy', 'trust');
  try {
    const unavailable: string = resolve(f.home, 'unavailable-once');
    writeFileSync(unavailable, '');
    const started = await cli(f, ['seat', 'hd-agy', 'A'], f.root, { ...core.env, HC_SHIM_UNAVAILABLE: unavailable });
    expect(started.code).toBe(0);
    const address: string = (await seatA(core, 'hd-agy')).address;
    await core.waitFor(address, idleAfter(1));
    expect(core.tasks(address)).toEqual(['ENTER', `plan-issue hd-agy slot=A phase=plan.synthesis leaf=${path}`]);
    const calls: string[] = (await Bun.file(core.shimLog).text()).split('\n');
    expect(calls.filter((line: string) => line.startsWith('send\t'))).toHaveLength(2);
    expect(calls.filter((line: string) => line.startsWith('keys\t') && line.endsWith('\tenter'))).toHaveLength(1);
    expect(readState(path).prompted.A).toMatchObject({ address });
  } finally {
    await teardown(f, core, 'hd-agy');
  }
});

test('an unavailable first agy task waits for a new status before retrying', async () => {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'agy', 'work');
  const bin: string = resolve(f.home, 'ready-bin');
  const gate: string = resolve(f.home, 'ready.fifo');
  mkdirSync(bin);
  expect(Bun.spawnSync(['mkfifo', gate]).exitCode).toBe(0);
  writeFileSync(
    resolve(bin, 'agy'),
    `#!/bin/sh
printf '\\033]7501;state=idle\\007'
cat '${gate}' >/dev/null
printf '\\033]7501;state=done\\007'
while IFS= read -r task; do
  printf '%s\\n' "$task" >> "$STANDIN_DIR/$HC_TERMINAL_ID.tasks"
  printf '\\033]7501;state=working\\007\\033]7501;state=idle\\007'
done
`,
  );
  chmodSync(resolve(bin, 'agy'), 0o755);
  const core: HcCore = await hcCore(f, { coreEnv: { PATH: `${bin}:${coreBin}:${process.env.PATH}` } });
  const path: string = leaf(f, 'hd-status-retry', 'plan.synthesis');
  const unavailable: string = resolve(f.home, 'unavailable-once');
  writeFileSync(unavailable, '');
  const sends = (): number =>
    readFileSync(core.shimLog, 'utf8')
      .split('\n')
      .filter((line: string) => line.startsWith('send\t')).length;
  const sent = (count: number, ms: number): Promise<boolean> =>
    new Promise<boolean>((done) => {
      const changed = (): void => {
        if (sends() >= count) finish(true);
      };
      const watcher = watch(core.shimLog, changed);
      const timer = setTimeout(() => finish(false), ms);
      function finish(found: boolean): void {
        clearTimeout(timer);
        watcher.close();
        done(found);
      }
      changed();
    });
  const starting: ReturnType<typeof cli> = cli(f, ['seat', 'hd-status-retry', 'A'], f.root, {
    ...core.env,
    HC_SHIM_UNAVAILABLE: unavailable,
  });
  try {
    expect(await sent(1, 5000)).toBe(true);
    expect(await sent(2, 200)).toBe(false);
    writeFileSync(gate, 'ready\n');
    expect((await starting).code).toBe(0);
    const address: string = (await seatA(core, 'hd-status-retry')).address;
    await core.waitFor(address, idleAfter(1));
    expect(sends()).toBe(2);
    expect(core.tasks(address)).toEqual([`plan-issue hd-status-retry slot=A phase=plan.synthesis leaf=${path}`]);
    expect(readState(path).prompted.A).toMatchObject({ address, turn: 0 });
  } finally {
    await core.stop();
    await starting;
    await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: f.repo }, 'hd-status-retry')]);
    f.clean();
  }
});
