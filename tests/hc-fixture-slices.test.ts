// The hc fixture stops exactly the leaf slices its own seats entered, recorded at launch: a removed
// terminal or an abandoned worker still gets its slices stopped, and a labelled terminal of another
// core never selects a live seat's slice.
import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { hcCore, setSeat, shortStartProof, sweepAbandoned, type HcCore, stopCoresAfterFile } from './hc-fixture';
import { readState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured, type SpawnResult } from '../src/shell';

stopCoresAfterFile();

const uid: number = process.getuid!();
const userBus: string[] = [
  'env',
  `XDG_RUNTIME_DIR=/run/user/${uid}`,
  `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/${uid}/bus`,
];

async function active(slice: string): Promise<string> {
  return (await spawnCaptured([...userBus, 'systemctl', '--user', 'is-active', slice])).stdout.trim();
}

// One live idle seat of `slug`, started through the fixture core's systemd-run.
async function seated(slug: string): Promise<{ f: Fixture; core: HcCore; slice: string; address: string }> {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'fake', 'idle');
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await cli(f, ['next', slug], f.root, { ...core.env, ...shortStartProof })).code).toBe(0);
  const slice: string = leafSlice({ name: f.repo }, slug, f.home);
  expect(await active(slice)).toBe('active');
  return { f, core, slice, address: z.string().parse(readState(path).seat.A?.address) };
}

test('stop ends the slice of a seat whose terminal was killed and removed', async () => {
  const { f, core, slice, address } = await seated('fs-removed');
  try {
    expect((await core.hc(['kill', address])).code).toBe(0);
    await core.waitFor(address, (t) => t.state !== 'live');
    expect((await core.hc(['rm', address])).code).toBe(0);
    expect(await core.terminals({ akrogon: '1' })).toEqual([]);
    await core.stop();
    expect(await active(slice)).toBe('inactive');
  } finally {
    await core.stop();
    f.clean();
  }
});

test('the abandoned-core sweep stops the slices in the dead core ledger before removing its runtime', async () => {
  const dead: Bun.Subprocess = Bun.spawn(['true']);
  await dead.exited;
  const name: string = `akt${dead.pid.toString(36)}-1`;
  const runtime: string = resolve(`/run/user/${uid}`, name);
  const slice: string = `akrogon-sweep-${dead.pid}.slice`;
  const made: SpawnResult = await spawnCaptured([
    ...userBus,
    'systemd-run',
    '--user',
    '--scope',
    '--quiet',
    `--slice=${slice}`,
    '--',
    'true',
  ]);
  expect(made.code, made.stderr).toBe(0);
  expect(await active(slice)).toBe('active');
  mkdirSync(resolve(runtime, 'core'), { recursive: true });
  writeFileSync(resolve(runtime, 'core/slices'), `${slice}\n`);
  await sweepAbandoned();
  expect(await active(slice)).toBe('inactive');
  expect(existsSync(runtime)).toBe(false);
});

test("a labelled terminal in a sibling core never stops another core's live seat", async () => {
  const { f, core, slice, address } = await seated('fs-decoy');
  const decoy: HcCore = await hcCore(f);
  try {
    const labels: string[] = ['akrogon=1', `akrogon.repo=${f.repo}`, 'akrogon.leaf=fs-decoy', 'akrogon.seat=a'];
    const run: SpawnResult = await decoy.hc(['run', '--bg', ...labels.flatMap((l) => ['--label', l]), 'sleep', '600']);
    expect(run.code, run.stderr).toBe(0);
    await decoy.stop();
    expect(await active(slice)).toBe('active');
    expect((await core.get(address)).state).toBe('live');
  } finally {
    await decoy.stop();
    await core.stop();
    f.clean();
  }
});
