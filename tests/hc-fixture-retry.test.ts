// A core whose teardown fails stays queued and a later stop finishes it: a slice stop the user manager
// refuses, or an `hc server stop` that leaves the daemon running or never returns; the abandoned sweep
// keeps such a core too, and stops a daemon whose worker died before anything recorded it.
import { test, expect } from 'bun:test';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { z } from 'zod';
import { resolve } from 'node:path';
import { fixture, type Fixture } from './helpers';
import { hcCore, procFile, sweepAbandoned, type HcCore, stopCoresAfterFile } from './hc-fixture';
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

// Serial: it swaps process.env.PATH, which every concurrent teardown's systemctl reads.
test.serial('a refused slice stop keeps the core queued and a later stop finishes it', async () => {
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

// The daemon's state letter from ps: empty once it has gone, Z while a zombie.
async function daemonState(pid: number): Promise<string> {
  return (await spawnCaptured(['ps', '-o', 'stat=', '-p', String(pid)])).stdout.trim();
}

const exited = (state: string): boolean => /^(Z.*)?$/.test(state);

type Abandoned = { root: string; name: string; runtime: string; socket: string; pid: number };

// A worker that died right after `hc server start` returned: a live daemon under a dead worker's
// session name and nothing else in its runtime. It lives in a private sweep root, which the startup
// sweeps of other workers never read; `bin` is the hc binary that starts it.
async function abandonedDaemon(f: Fixture, bin: string): Promise<Abandoned> {
  const dead: Bun.Subprocess = Bun.spawn(['true']);
  await dead.exited;
  const root: string = mkdtempSync(`/run/user/${uid}/akrogon-sweep-`);
  const name: string = `akt${dead.pid.toString(36)}-1`;
  const runtime: string = resolve(root, name);
  const coreRuntime: string = resolve(runtime, 'core');
  mkdirSync(resolve(coreRuntime, 'herdr-core'), { recursive: true });
  const started: SpawnResult = await spawnCaptured([bin, 'server', 'start'], {
    cwd: f.home,
    env: {
      HOME: process.env.HOME,
      PATH: process.env.PATH,
      XDG_RUNTIME_DIR: coreRuntime,
      XDG_STATE_HOME: resolve(f.home, 'hc-state'),
      HC_SESSION: name,
    },
  });
  expect(started.code, started.stderr).toBe(0);
  const pid: number = z.object({ pid: z.number().int() }).parse(JSON.parse(started.stdout)).pid;
  return { root, name, runtime, socket: resolve(coreRuntime, 'herdr-core', `${name}.sock`), pid };
}

async function discard(f: Fixture, gone: Abandoned): Promise<void> {
  if (!exited(await daemonState(gone.pid))) process.kill(gone.pid);
  rmSync(gone.root, { recursive: true, force: true });
  f.clean();
}

test('the abandoned-core sweep stops a reachable daemon of a dead worker that recorded nothing', async () => {
  const f: Fixture = await fixture();
  // The same binary under another name: the sweep finds the daemon by its session, not its name.
  const bin: string = resolve(f.home, 'bin/hc');
  mkdirSync(resolve(f.home, 'bin'));
  copyFileSync(z.string().parse(Bun.which('hc')), bin);
  chmodSync(bin, 0o755);
  const gone: Abandoned = await abandonedDaemon(f, bin);
  try {
    expect(exited(await daemonState(gone.pid))).toBe(false);
    await sweepAbandoned(undefined, gone.root);
    expect(existsSync(gone.runtime)).toBe(false);
    expect(exited(await daemonState(gone.pid))).toBe(true);
  } finally {
    await discard(f, gone);
  }
});

test('the abandoned-core sweep keeps a runtime whose daemon outlives hc server stop', async () => {
  const f: Fixture = await fixture();
  const gone: Abandoned = await abandonedDaemon(f, 'hc');
  const aside: string = `${gone.socket}.aside`;
  try {
    renameSync(gone.socket, aside);
    await expect(sweepAbandoned(2000, gone.root)).rejects.toThrow(gone.name);
    expect(existsSync(gone.runtime)).toBe(true);
    renameSync(aside, gone.socket);
    await sweepAbandoned(undefined, gone.root);
    expect(existsSync(gone.runtime)).toBe(false);
    expect(exited(await daemonState(gone.pid))).toBe(true);
  } finally {
    if (existsSync(aside)) renameSync(aside, gone.socket);
    await discard(f, gone);
  }
});

// The pid of a session's running `hc server stop` client, once it has started.
async function stopClient(session: string): Promise<number> {
  const deadline: number = Date.now() + 5000;
  for (;;) {
    const pid: string | undefined = readdirSync('/proc').find(
      (entry: string): boolean =>
        /^\d+$/.test(entry) &&
        (procFile(Number(entry), 'cmdline') ?? '').split('\0').slice(1, 3).join(' ') === 'server stop' &&
        (procFile(Number(entry), 'environ') ?? '').split('\0').includes(`HC_SESSION=${session}`),
    );
    if (pid !== undefined) return Number(pid);
    if (Date.now() > deadline) throw new Error(`no hc server stop client: ${JSON.stringify({ session })}`);
    await Bun.sleep(20);
  }
}

test('one deadline covers an hc server stop that never returns, and the core stays queued', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const status: SpawnResult = await core.hc(['server', 'status']);
  const pid: number = z.object({ pid: z.number().int() }).parse(JSON.parse(status.stdout)).pid;
  // A suspended daemon accepts the stop request and never answers it.
  process.kill(pid, 'SIGSTOP');
  const resume: Timer = setTimeout(() => process.kill(pid, 'SIGCONT'), 15_000);
  let client: number | null = null;
  try {
    const began: number = Date.now();
    const stopping: Promise<void> = core.stop(2000);
    // A suspended client ignores every signal but SIGKILL.
    client = await stopClient(core.session);
    process.kill(client, 'SIGSTOP');
    await expect(stopping).rejects.toThrow('hc daemon still running');
    expect(Date.now() - began).toBeLessThan(10_000);
    expect(existsSync(core.runtime)).toBe(true);
  } finally {
    clearTimeout(resume);
    if (client !== null && existsSync(`/proc/${client}`)) process.kill(client, 'SIGKILL');
    process.kill(pid, 'SIGCONT');
    await core.stop();
    f.clean();
  }
});

// A detached `cat serve` blocks on its fifo and outlives the terminal, carrying HC_SESSION, with
// the terminal's own variables or, as src/hc.ts launches its helpers, without them.
test.each([
  ['inherits the terminal variables', 'setsid cat serve'],
  ['clears the terminal variables', 'setsid env -u HC_TERMINAL_ID -u HC_TERMINAL_SOCKET -u HC_SCOPE cat serve'],
])(
  'a program a terminal runs as `serve` that %s does not hold the core stop',
  async (_case: string, launch: string) => {
    const f: Fixture = await fixture();
    const core: HcCore = await hcCore(f);
    const out: string = resolve(f.home, 'serve.pid');
    let program: number | null = null;
    try {
      const run: SpawnResult = await core.hc([
        'run',
        '--bg',
        '--json',
        '--no-parent',
        '--name',
        'serve',
        '--cwd',
        f.home,
        '--',
        'bash',
        '-c',
        `mkfifo serve; ${launch} & echo $! > ${out}.tmp; mv ${out}.tmp ${out}; exec cat`,
      ]);
      expect(run.code, run.stderr).toBe(0);
      const deadline: number = Date.now() + 10_000;
      while (!existsSync(out) && Date.now() < deadline) await Bun.sleep(20);
      program = Number(readFileSync(out, 'utf8'));
      // The stop must see the program running as `cat serve`, not the shell that forks it.
      const argv = (): string[] => (procFile(z.number().parse(program), 'cmdline') ?? '').split('\0').slice(0, 2);
      while (argv().join(' ') !== 'cat serve' && Date.now() < deadline) await Bun.sleep(20);
      expect(argv()).toEqual(['cat', 'serve']);
      await core.stop(5000);
      expect(existsSync(core.runtime)).toBe(false);
    } finally {
      if (program !== null && existsSync(`/proc/${program}`)) process.kill(program, 'SIGKILL');
      await core.stop();
      f.clean();
    }
  },
);
