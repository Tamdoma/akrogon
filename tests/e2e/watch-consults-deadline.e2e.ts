import { afterAll, expect, test } from 'bun:test';
import {
  chmodSync,
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
import { flockHold } from '../../src/flock';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { realHome, realRuntime, required } from './tier';
import { absent, parseSessionName, SessionNameError, sessionPaths, type SessionPaths } from './watch-tier';

// A private session for this file's child judges: they hold its lock, not the grant's, so a paid run
// beside this proof keeps its session, slice and ledger. Everything seeded and checked here is its own.
// No longer than akr-e2e-watch, so the tier's socket links stay within the unix path limit.
const own: SessionPaths = sessionPaths(parseSessionName(`akr-d${process.pid}`));
afterAll((): void => rmSync(own.lock, { force: true }));

// One watch-consults run on the fake harnesses in `bin`, which go first on PATH.
const consults = (bin: string, root: string, extra: Record<string, string> = {}): Promise<SpawnResult> =>
  spawnCaptured([process.execPath, 'test', resolve(import.meta.dir, 'watch-consults.e2e.ts')], {
    env: {
      ...process.env,
      PATH: `${bin}:${required('PATH')}`,
      AKROGON_E2E: 'watch-consults',
      AKROGON_E2E_SESSION: own.session,
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
    expect(absent(own.session)).toEqual([]);
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

// Live hc daemons (`herdr-core serve`) serving this file's session.
const daemons = (): string[] =>
  readdirSync('/proc')
    .filter((pid: string) => /^\d+$/.test(pid))
    .filter((pid: string) => {
      const argv: string[] = (procFile(pid, 'cmdline') ?? '').split('\0');
      return (
        argv[0].endsWith('herdr-core') &&
        argv[1] === 'serve' &&
        (procFile(pid, 'environ') ?? '').split('\0').includes(`HC_SESSION=${own.session}`)
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
    expect(absent(own.session)).toEqual([]);
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
    expect(absent(own.session)).toEqual([]);
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
    for (const path of [root, own.coreRuntime]) rmSync(path, { recursive: true, force: true });
  }
}, 240_000);

test('a slice stop that fails at teardown still leaves the session count', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'c-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  const bus: NodeJS.ProcessEnv = {
    ...process.env,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    XDG_RUNTIME_DIR: realRuntime,
  };
  // Every unit stop fails once the watcher beats, so only the teardown's stop fails.
  writeFileSync(
    join(bin, 'systemctl'),
    `#!/bin/sh\nif [ "$2" = stop ] && [ -e '${join(bin, 'beat')}' ]; then echo 'stop refused' >&2; exit 5; fi\nexec '${z.string().parse(Bun.which('systemctl'))}' "$@"\n`,
    { mode: 0o755 },
  );
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
    expect(result.stderr).toContain('teardown also failed: slice stop failed');
    const usage = z
      .object({ sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(usage.sessions).toBe(1);
  } finally {
    const leafSlices: string[] = existsSync(join(own.coreRuntime, 'slices'))
      ? readFileSync(join(own.coreRuntime, 'slices'), 'utf8').split('\n').filter(Boolean)
      : [];
    await spawnCaptured(['systemctl', '--user', 'stop', own.slice, ...leafSlices], { env: bus });
    for (const path of [root, own.coreRuntime, own.coreState]) rmSync(path, { recursive: true, force: true });
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
    expect(absent(own.session)).toEqual([]);
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
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 300_000);

test("a run first ends a dead run's slice, leaf slices, core runtime and state", async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'a-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  const other: string = `akrogon-e2eother${process.pid}.slice`;
  const unit: string = `akr-e2e-other-${process.pid}`;
  const body: string = `akr-e2e-dead-${process.pid}`;
  const bus: NodeJS.ProcessEnv = {
    ...process.env,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    XDG_RUNTIME_DIR: realRuntime,
  };
  // A dead run's core runtime, state, a process in the session's slice and a seat in its leaf slice.
  mkdirSync(join(own.coreRuntime, 'herdr-core'), { recursive: true });
  writeFileSync(join(own.coreRuntime, 'slices'), `${other}\n`);
  mkdirSync(own.coreState, { recursive: true });
  for (const [name, slice] of [
    [unit, other],
    [body, own.slice],
  ]) {
    const started: SpawnResult = await spawnCaptured(
      ['systemd-run', '--user', '--quiet', '--collect', `--unit=${name}`, `--slice=${slice}`, 'sleep', '300'],
      { env: bus },
    );
    expect(started.code, started.stderr).toBe(0);
  }
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
    for (const name of [unit, body]) {
      const active: SpawnResult = await spawnCaptured(['systemctl', '--user', 'is-active', `${name}.service`], {
        env: bus,
      });
      expect(active.stdout.trim()).not.toBe('active');
    }
    expect(absent(own.session)).toEqual([]);
  } finally {
    await spawnCaptured(['systemctl', '--user', 'stop', other, `${body}.service`], { env: bus });
    for (const path of [root, own.coreRuntime, own.coreState]) rmSync(path, { recursive: true, force: true });
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
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test('a second run waits until the first has checked absence, then runs on its own', async () => {
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
    const next: SpawnResult = await consults(bin, second);
    const result: SpawnResult = await first;
    for (const run of [result, next]) {
      expect(run.code, `${run.stdout}\n${run.stderr}`).toBe(1);
      expect(run.stderr).toContain('session deadline; last completed stage: watcher idle');
    }
    const checked: number = statSync(join(root, 'evidence', 'absence.json')).mtimeMs;
    expect(deadlineOf(next) - 60_000).toBeGreaterThanOrEqual(checked);
    for (const dir of [root, second])
      expect(JSON.parse(readFileSync(join(dir, 'evidence', 'absence.json'), 'utf8'))).toEqual({ left: [] });
    expect(absent(own.session)).toEqual([]);
  } finally {
    for (const path of [root, second]) rmSync(path, { recursive: true, force: true });
  }
}, 360_000);

test('a run replaces the report an earlier run left in its output folder', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'r-'));
  const bin: string = join(root, 'bin');
  const evidence: string = join(root, 'evidence');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  // An earlier run's red and a file this run never writes.
  mkdirSync(evidence);
  writeFileSync(join(evidence, 'red.txt'), 'Received: 11\n');
  writeFileSync(join(evidence, 'stale.txt'), '');
  try {
    const result: SpawnResult = await consults(bin, root);
    expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
    expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
    const report: string[] = readdirSync(evidence);
    expect(report).toContain('paid-sessions.json');
    expect(report).not.toContain('red.txt');
    expect(report).not.toContain('stale.txt');
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test('a run that fails at startup leaves nothing that stops the next run', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 's-'));
  const bin: string = join(root, 'bin');
  const tierRoot: string = join(root, 't');
  mkdirSync(bin);
  mkdirSync(tierRoot);
  idleWatcher(bin, '');
  try {
    // The leaf temp folder can be searched but not written, so the run fails making its control folder.
    chmodSync(tierRoot, 0o555);
    const failed: SpawnResult = await consults(bin, root);
    expect(failed.code, `${failed.stdout}\n${failed.stderr}`).toBe(1);
    expect(failed.stderr).toContain('EACCES');
    chmodSync(tierRoot, 0o755);
    const retried: SpawnResult = await consults(bin, root);
    expect(retried.code, `${retried.stdout}\n${retried.stderr}`).toBe(1);
    expect(retried.stderr).toContain('session deadline; last completed stage: watcher idle');
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
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
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test("a judge of this fixture leaves another session's held lock and its ledger alone", async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'g-'));
  const bin: string = join(root, 'bin');
  mkdirSync(bin);
  mkdirSync(join(root, 't'));
  idleWatcher(bin, '');
  // Another session's owner holds its lock and has a slice in its ledger. It is a second private
  // session, so the test never touches the grant's.
  const held: SessionPaths = sessionPaths(parseSessionName(`akr-d${process.pid}h`));
  const owner: { release: () => Promise<void> } = await flockHold(held.lock, '-x');
  const ledger: string = join(held.coreRuntime, 'slices');
  const entry: string = `akrogon-e2eowner${process.pid}.slice\n`;
  try {
    expect(absent(held.session), 'another owner left this private session; the test leaves it alone').toEqual([]);
    mkdirSync(held.coreRuntime);
    // What the test created goes while it still holds the lock.
    try {
      writeFileSync(ledger, entry);
      const result: SpawnResult = await consults(bin, root);
      expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(1);
      expect(result.stderr).toContain('session deadline; last completed stage: watcher idle');
      expect((await spawnCaptured(['flock', '-n', held.lock, 'true'])).code).toBe(1);
      expect(readFileSync(ledger, 'utf8')).toBe(entry);
      expect(absent(own.session)).toEqual([]);
    } finally {
      for (const path of [held.coreRuntime, held.lock]) rmSync(path, { recursive: true, force: true });
    }
  } finally {
    await owner.release();
    rmSync(root, { recursive: true, force: true });
  }
}, 240_000);

test("the next owner's hold ends a killed owner's core and leaves the session absent", async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'e-'));
  const tier: string = resolve(import.meta.dir, 'watch-tier.ts');
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    AKROGON_E2E_SESSION: own.session,
    AKROGON_E2E_ROOT: join(root, 't'),
    AKROGON_E2E_OUT: join(root, 'evidence'),
  };
  mkdirSync(join(root, 't'));
  // A watch-live or watch-stop owner on stand-ins: it holds the session, starts the tier and waits.
  writeFileSync(
    join(root, 'owner.ts'),
    `import { holdSession, startWatchTier } from '${tier}';
await holdSession();
await startWatchTier('akr-e2e-watch-owner', { a: { harness: 'fake', model: 'idle', effort: 'low' } }, { fake: 'fake --model {model} --effort {effort}' });
console.log('started');
setInterval((): void => {}, 1 << 30);
`,
  );
  writeFileSync(
    join(root, 'next.ts'),
    `import { absent, holdSession, session } from '${tier}';
await holdSession();
console.log(JSON.stringify(absent(session)));
// The lock's holder process would keep this script alive.
process.exit(0);
`,
  );
  const owner: Bun.Subprocess<'ignore', 'pipe', 'inherit'> = Bun.spawn([process.execPath, join(root, 'owner.ts')], {
    env,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'inherit',
  });
  try {
    const reader: ReadableStreamDefaultReader<Uint8Array> = owner.stdout.getReader();
    const first: Awaited<ReturnType<typeof reader.read>> = await reader.read();
    reader.releaseLock();
    expect(new TextDecoder().decode(first.value)).toContain('started');
    owner.kill('SIGKILL');
    await owner.exited;
    expect(daemons()).toHaveLength(1);
    const next: SpawnResult = await spawnCaptured([process.execPath, join(root, 'next.ts')], { env });
    expect(next.code, next.stderr).toBe(0);
    expect(next.stderr).toContain(`holds ${own.session}`);
    expect(JSON.parse(next.stdout)).toEqual([]);
    expect(daemons()).toEqual([]);
    expect(absent(own.session)).toEqual([]);
  } finally {
    owner.kill('SIGKILL');
    rmSync(root, { recursive: true, force: true });
  }
}, 120_000);

test('one process that loads two owner files holds the session once', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'b-'));
  mkdirSync(join(root, 't'));
  try {
    // No test of either file runs: only their module loads, each of which holds the session.
    const result: SpawnResult = await spawnCaptured(
      [
        process.execPath,
        'test',
        resolve(import.meta.dir, 'watch-live.e2e.ts'),
        resolve(import.meta.dir, 'watch-stop.e2e.ts'),
        '--test-name-pattern',
        '^no such test$',
      ],
      { env: { ...process.env, AKROGON_E2E_SESSION: own.session, AKROGON_E2E_ROOT: join(root, 't') }, timeout: 60_000 },
    );
    expect(result.signalCode, `${result.stdout}\n${result.stderr}`).toBeNull();
    // Each file's module load got past its own hold.
    expect(result.stderr.split('\n').filter((line: string) => line === `holds ${own.session}`)).toHaveLength(2);
    expect(absent(own.session)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 120_000);

test('a session name other than the grant or a private one stops the module before any path', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'x-'));
  writeFileSync(
    join(root, 'load.ts'),
    `await import('${resolve(import.meta.dir, 'watch-tier.ts')}');\nconsole.log('loaded');\n`,
  );
  // What a blank or `..` name would have made cleanup targets: the user's runtime and state folders.
  const targets: string[] = [
    realRuntime,
    resolve(realHome, '.local/state/herdr-core'),
    resolve(realHome, '.local/state'),
  ];
  try {
    // An owner file imports the module before its hold runs, so a throw on load stops any removal.
    for (const value of ['', '..', 'x/y']) {
      const loaded: SpawnResult = await spawnCaptured([process.execPath, join(root, 'load.ts')], {
        env: { ...process.env, AKROGON_E2E_SESSION: value },
      });
      expect(loaded.code, `${loaded.stdout}\n${loaded.stderr}`).not.toBe(0);
      expect(loaded.stderr).toContain(new SessionNameError(value).message);
      expect(loaded.stdout).not.toContain('loaded');
    }
    expect(targets.filter((path: string) => !existsSync(path))).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 60_000);
