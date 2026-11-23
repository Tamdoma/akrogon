// A core whose teardown fails stays queued and a later stop finishes it: a slice stop the user manager
// refuses, or an `hc server stop` that leaves the daemon running; the abandoned sweep keeps such a core too.
import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fixture, type Fixture } from './helpers';
import { hcCore, sweepAbandoned, type HcCore, stopCoresAfterFile } from './hc-fixture';
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

test('a refused slice stop keeps the core queued and a later stop finishes it', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const slice: string = `akrogon-retry-${core.session}.slice`;
  const path: string | undefined = process.env.PATH;
  try {
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
    writeFileSync(resolve(core.runtime, 'core/slices'), `${slice}\n`);
    // A systemctl that refuses, ahead of the real one only for the first stop.
    const refuse: string = resolve(f.home, 'refuse-bin');
    mkdirSync(refuse);
    writeFileSync(resolve(refuse, 'systemctl'), '#!/bin/sh\necho refused >&2\nexit 1\n');
    chmodSync(resolve(refuse, 'systemctl'), 0o755);
    process.env.PATH = `${refuse}:${path}`;
    await expect(core.stop()).rejects.toThrow('leaf slice stop failed');
    process.env.PATH = path;
    expect(existsSync(core.runtime)).toBe(true);
    await core.stop();
    expect(existsSync(core.runtime)).toBe(false);
    expect(await active(slice)).toBe('inactive');
  } finally {
    process.env.PATH = path;
    await core.stop();
    f.clean();
  }
});

test('a core whose daemon outlives hc server stop stays queued and a later stop finishes it', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const aside: string = `${core.socket}.aside`;
  try {
    // With its socket moved, `hc server stop` reaches no daemon and exits 0 while the daemon runs on.
    renameSync(core.socket, aside);
    await expect(core.stop(2000)).rejects.toThrow('hc daemon still running');
    expect(existsSync(core.runtime)).toBe(true);
    renameSync(aside, core.socket);
    await core.stop();
    expect(existsSync(core.runtime)).toBe(false);
  } finally {
    if (existsSync(aside)) renameSync(aside, core.socket);
    await core.stop();
    f.clean();
  }
});

test('the abandoned-core sweep keeps a runtime whose daemon outlives hc server stop', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const dead: Bun.Subprocess = Bun.spawn(['true']);
  await dead.exited;
  const name: string = `akt${dead.pid.toString(36)}-1`;
  const abandoned: string = resolve(dirname(core.runtime), name);
  try {
    // Under a dead worker's name the daemon's socket is not where the sweep's `hc server stop` looks.
    renameSync(core.runtime, abandoned);
    await expect(sweepAbandoned(2000)).rejects.toThrow(name);
    expect(existsSync(abandoned)).toBe(true);
    renameSync(abandoned, core.runtime);
    await core.stop();
    expect(existsSync(core.runtime)).toBe(false);
  } finally {
    if (existsSync(abandoned)) renameSync(abandoned, core.runtime);
    await core.stop();
    f.clean();
  }
});
