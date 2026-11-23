import { expect, test } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { realRuntime, required } from './tier';
import { absent, coreRuntime, coreState, session } from './watch-tier';

// One watch-consults run on the fake harnesses in `bin`, which go first on PATH.
const consults = (bin: string, root: string, extra: Record<string, string> = {}): Promise<SpawnResult> =>
  spawnCaptured([process.execPath, 'test', resolve(import.meta.dir, 'watch-consults.e2e.ts')], {
    env: {
      ...process.env,
      PATH: `${bin}:${required('PATH')}`,
      AKROGON_E2E: 'watch-consults',
      AKROGON_E2E_ROOT: join(root, 't'),
      AKROGON_E2E_OUT: join(root, 'evidence'),
      AKROGON_SESSIONS: '2',
      AKROGON_SESSION_MINUTES: '1',
      ...extra,
    },
  });

test('watch-consults stops a nonresponsive watcher at the reserved deadline', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'd-'));
  const bin: string = join(root, 'bin');
  const tierRoot: string = join(root, 't');
  mkdirSync(bin);
  mkdirSync(tierRoot);
  writeFileSync(
    join(bin, 'pi'),
    `#!/bin/sh
set -eu
for name in first replacement; do
  started=$(hc run --bg --json --name "$name" --label akrogon.watch-consult=akre2e -- sleep 180)
  address=$(printf '%s' "$started" | bun -e 'console.log(JSON.parse(await Bun.stdin.text()).address)')
  hc kill "$address"
  hc rm "$address"
done
touch "$(dirname "$0")/launched"
exec sleep 180
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, 'agy'), '#!/bin/sh\nexit 97\n', { mode: 0o755 });
  try {
    const started: number = performance.now();
    const result: SpawnResult = await consults(bin, root);
    expect(existsSync(join(bin, 'launched')), `${result.stdout}\n${result.stderr}`).toBe(true);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher started');
    expect(absent()).toEqual([]);
    expect(performance.now() - started).toBeLessThan(90_000);
    const usage = z
      .object({ watcher: z.string(), consultants: z.array(z.string()), sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(new Set([usage.watcher, ...usage.consultants]).size).toBe(3);
    expect(usage.sessions).toBe(3);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 180_000);

// A watcher that takes each task as one working-to-idle turn, never starts a consultant and touches
// `<bin>/beat` every half second while it lives, and an hc that runs the shell `hook` before each call.
function idleWatcher(bin: string, hook: string): void {
  writeFileSync(
    join(bin, 'pi'),
    `#!/bin/sh
status() { printf '\\033]7501;state=%s\\007' "$1"; }
pi=$$
(while kill -0 "$pi" 2>/dev/null; do touch '${join(bin, 'beat')}'; sleep 0.5; done) &
status idle
while IFS= read -r line; do status working; status idle; done
exec sleep 180
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, 'agy'), '#!/bin/sh\nexit 97\n', { mode: 0o755 });
  writeFileSync(join(bin, 'hc'), `#!/bin/sh\n${hook}\nexec '${z.string().parse(Bun.which('hc'))}' "$@"\n`, {
    mode: 0o755,
  });
}

// A /proc file of `pid`, or null once that process exited.
function procFile(pid: string, name: string): string | null {
  try {
    return readFileSync(`/proc/${pid}/${name}`, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || (error as NodeJS.ErrnoException).code === 'ESRCH')
      return null;
    throw error;
  }
}

// Live hc daemons (`herdr-core serve`) serving the akr-e2e-watch session.
const daemons = (): string[] =>
  readdirSync('/proc')
    .filter((pid: string) => /^\d+$/.test(pid))
    .filter((pid: string) => {
      const argv: string[] = (procFile(pid, 'cmdline') ?? '').split('\0');
      return (
        argv[0].endsWith('herdr-core') &&
        argv[1] === 'serve' &&
        (procFile(pid, 'environ') ?? '').split('\0').includes(`HC_SESSION=${session}`)
      );
    });

// The session deadline the watch-consults run printed.
const deadlineOf = (result: SpawnResult): number =>
  Date.parse(z.string().parse(/session deadline: (\S+) /.exec(result.stdout)?.[1]));

// An hc hook that makes the first `hc <verb>` sleep `seconds`, leaving the marker `<bin>/slowed`.
const slowFirst = (bin: string, verb: string, seconds: number): string =>
  `if [ "$1" = ${verb} ] && [ ! -e '${join(bin, 'slowed')}' ]; then
  touch '${join(bin, 'slowed')}'
  sleep ${seconds}
fi`;

test('a red before the deadline stays a red, and the deadline still ends the watcher during its diagnostics', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'l-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  // The send fails about 9 s before the 1-minute deadline, and the first diagnostic read outlasts it.
  idleWatcher(bin, `if [ "$1" = send ]; then sleep 50; exit 11; fi\n${slowFirst(bin, 'read', 30)}`);
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(existsSync(join(bin, 'slowed')), `${result.stdout}\n${result.stderr}`).toBe(true);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Received: 11');
    expect(result.stderr).not.toContain('session deadline;');
    expect(statSync(join(bin, 'beat')).mtimeMs).toBeLessThan(deadlineOf(result) + 5_000);
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test('the deadline ends a watcher that ignores SIGTERM and a launch still pending, and no core is left', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'k-'));
  const bin: string = join(root, 'bin');
  const beat: string = join(root, 'beat');
  const launch: string = join(root, 'launch');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  const real: string = z.string().parse(Bun.which('hc'));
  // The watcher starts at once, but its launch client stays pending past the 1-minute deadline and
  // would then launch again, which would start a new core if none were left.
  idleWatcher(
    bin,
    `case "$*" in *akr-e2e-watcher*) '${real}' "$@"; sleep 70; '${real}' "$@" > '${launch}' 2>&1; exit;; esac`,
  );
  writeFileSync(join(bin, 'pi'), `#!/bin/sh\ntrap '' TERM HUP\nwhile :; do touch '${beat}'; sleep 0.5; done\n`, {
    mode: 0o755,
  });
  // Daemons an earlier run left behind are not this run's.
  const before: Set<string> = new Set(daemons());
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: leaf staged');
    expect(statSync(beat).mtimeMs).toBeLessThan(deadlineOf(result) + 5_000);
    await Bun.sleep(15_000);
    expect(existsSync(launch)).toBe(false);
    expect(daemons().filter((pid: string) => !before.has(pid))).toEqual([]);
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test('a teardown failure is reported with the deadline outcome', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'u-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  // The watcher leaves a folder in the repo whose file teardown cannot remove.
  const pi: string = readFileSync(join(bin, 'pi'), 'utf8');
  writeFileSync(
    join(bin, 'pi'),
    pi.replace('pi=$$', 'mkdir -p locked/in && touch locked/in/f && chmod 500 locked/in\npi=$$'),
  );
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
    expect(result.stderr).toContain('teardown also failed:');
    expect(result.stderr).toContain('EACCES');
  } finally {
    await spawnCaptured(['chmod', '-R', 'u+rwx', root]);
    for (const path of [root, coreRuntime]) rmSync(path, { recursive: true, force: true });
  }
}, 240_000);

test('a watcher launch and a consultant seat still pending at the deadline both count as paid sessions', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'p-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  const real: string = z.string().parse(Bun.which('hc'));
  // The watcher's launch reply is held past the 1-minute deadline, and the watcher asks for a consultant
  // seat whose start never shows.
  idleWatcher(bin, `case "$*" in *akr-e2e-watcher*) '${real}' "$@"; sleep 70; exit;; esac`);
  writeFileSync(join(bin, 'pi'), '#!/bin/sh\nakrogon seat --watch-consultant >/dev/null 2>&1\nexec sleep 180\n', {
    mode: 0o755,
  });
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: leaf staged');
    const usage = z
      .object({ watcher: z.string().nullable(), consultants: z.array(z.string().nullable()), sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(usage.sessions).toBe(2);
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test('a run that reuses an output folder reports only its own outcome and sessions', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'o-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  // The first run fails its send at once; the second, in the same output folder, reaches the deadline.
  idleWatcher(bin, 'if [ "$1" = send ] && [ ! -e "$(dirname "$0")/second" ]; then exit 11; fi');
  try {
    const first: SpawnResult = await consults(bin, root);
    expect(first.stderr, `${first.stdout}\n${first.stderr}`).toContain('Received: 11');
    writeFileSync(join(bin, 'second'), '');
    mkdirSync(join(root, 't'));
    const second: SpawnResult = await consults(bin, root);
    expect(second.code, `${second.stdout}\n${second.stderr}`).toBe(1);
    expect(second.stderr).toContain('session deadline; last completed stage: watcher idle');
    expect(second.stderr).not.toContain('Received: 11');
    const usage = z
      .object({ sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(usage.sessions).toBe(1);
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 300_000);

test("a run refused at startup leaves another run's core runtime, state and leaf slices alone", async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'a-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  const other: string = `akrogon-e2eother${process.pid}.slice`;
  const unit: string = `akr-e2e-other-${process.pid}`;
  const bus: NodeJS.ProcessEnv = {
    ...process.env,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    XDG_RUNTIME_DIR: realRuntime,
  };
  // Another run's core runtime, state and a seat in its leaf slice.
  mkdirSync(join(coreRuntime, 'herdr-core'), { recursive: true });
  writeFileSync(join(coreRuntime, 'slices'), `${other}\n`);
  mkdirSync(coreState, { recursive: true });
  const seat: SpawnResult = await spawnCaptured(
    ['systemd-run', '--user', '--quiet', `--unit=${unit}`, `--slice=${other}`, 'sleep', '300'],
    { env: bus },
  );
  expect(seat.code, seat.stderr).toBe(0);
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('akr-e2e-watch leftovers before the run');
    expect(existsSync(join(coreRuntime, 'slices'))).toBe(true);
    expect(existsSync(coreState)).toBe(true);
    const active: SpawnResult = await spawnCaptured(['systemctl', '--user', 'is-active', `${unit}.service`], {
      env: bus,
    });
    expect(active.stdout.trim()).toBe('active');
  } finally {
    await spawnCaptured(['systemctl', '--user', 'stop', other], { env: bus });
    for (const path of [root, coreRuntime, coreState]) rmSync(path, { recursive: true, force: true });
  }
}, 240_000);

test('a launcher still registering at the deadline is ended and starts nothing', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'n-'));
  const bin: string = join(root, 'bin');
  const reached: string = join(root, 'reached');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  // A launcher that would register the scope 5 s in, past the 3 s budget.
  writeFileSync(join(bin, 'systemd-run'), `#!/bin/sh\nsleep 5\ntouch '${reached}'\n`, { mode: 0o755 });
  try {
    const result: SpawnResult = await consults(bin, root, { AKROGON_SESSION_MINUTES: '0.05' });
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: none');
    await Bun.sleep(8_000);
    expect(existsSync(reached)).toBe(false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 120_000);

test('a refused consultant seat, a started one and a direct consultant launch each count on their own', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'm-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  writeFileSync(join(bin, 'agy'), '#!/bin/sh\nexec sleep 180\n', { mode: 0o755 });
  // The first seat request is refused, the second starts a consultant, and a third consultant is
  // launched past akrogon seat under the same label.
  writeFileSync(
    join(bin, 'pi'),
    `#!/bin/sh
akrogon seat --watch-consultant --slot x >/dev/null 2>&1
akrogon seat --watch-consultant > '${join(root, 'seated')}' 2>&1
hc run --bg --json --name direct --label akrogon.watch-consult=akre2e -- sleep 180 > '${join(root, 'direct')}'
exec sleep 180
`,
    { mode: 0o755 },
  );
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    const seated: string = readFileSync(join(root, 'seated'), 'utf8').trim();
    const direct: string = z
      .object({ address: z.string() })
      .parse(JSON.parse(readFileSync(join(root, 'direct'), 'utf8'))).address;
    const usage = z
      .object({ watcher: z.string().nullable(), consultants: z.array(z.string().nullable()), sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(usage.consultants).toEqual([null, seated, direct]);
    expect(usage.sessions).toBe(4);
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test("a run refused while another runs with the same output folder leaves that run's evidence and core alone", async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'w-'));
  const second: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'v-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  mkdirSync(join(second, 't'));
  idleWatcher(bin, '');
  try {
    const first: Promise<SpawnResult> = consults(bin, root);
    while (!existsSync(join(bin, 'beat'))) await Bun.sleep(500);
    const refused: SpawnResult = await consults(bin, second, { AKROGON_E2E_OUT: join(root, 'evidence') });
    expect(refused.stderr, `${refused.stdout}\n${refused.stderr}`).toContain('akr-e2e-watch leftovers before the run');
    const result: SpawnResult = await first;
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
    const usage = z
      .object({ sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(usage.sessions).toBe(1);
    expect(absent()).toEqual([]);
  } finally {
    for (const path of [root, second]) rmSync(path, { recursive: true, force: true });
  }
}, 240_000);

test('a body ended before it writes anything still leaves no core runtime', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'h-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  // The body's first git call outlasts the 1-minute budget.
  writeFileSync(join(bin, 'git'), '#!/bin/sh\nexec sleep 70\n', { mode: 0o755 });
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: none');
    expect(absent()).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);
