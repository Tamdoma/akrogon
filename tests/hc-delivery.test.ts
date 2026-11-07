// Criteria 4 and 5: one prompt per seat per turn, the silent-stop bound and the send guards,
// on a real hc core with the stand-in agent. `next <slug>` stands in for the listener's wake.
import { test, expect } from 'bun:test';
import { chmodSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { readState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';

async function setup(slug: string, harness: 'fake' | 'agy', mode: string) {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', harness, mode);
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, slug, 'plan.synthesis');
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
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
    // plan.synthesis: initial prompt, two silent stops re-prompted.
    for (const turn of [1, 2]) {
      await core.waitFor(address, idleAfter(turn));
      expect((await cli(f, ['next', 'hd-silent'], f.root, core.env)).code).toBe(0);
    }
    expect(core.tasks(address)).toHaveLength(3);
    // C4.2: a phase move resets the count, so implement gets its own three prompts.
    await core.waitFor(address, idleAfter(3));
    expect((await cli(f, ['phase', 'hd-silent', 'implement', '--slot', 'A'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(address)).toHaveLength(4);
    for (const turn of [4, 5]) {
      await core.waitFor(address, idleAfter(turn));
      expect((await cli(f, ['next', 'hd-silent'], f.root, core.env)).code).toBe(0);
      expect(readState(path).phase).toBe('implement');
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

test('a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves', async () => {
  const { f, core, path } = await setup('hd-send', 'fake', 'idle');
  try {
    expect((await cli(f, ['next', 'hd-send'], f.root, core.env)).code).toBe(0);
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
    expect(settled.delivery_error.A).toBeUndefined();
    expect(settled.prompted.A).toMatchObject({ address });
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
