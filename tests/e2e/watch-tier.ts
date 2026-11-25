// Setup for the attended watcher-on-hc runs (criteria 2-4) in readiness grants[0]'s throwaway session
// akr-e2e-watch. Not part of the `test` check: run by name with AKROGON_E2E set; a missing prerequisite
// fails the run. No herdr-app window opens: akrogon runs with a scratch HOME holding the session's
// herdr-app home and the strict fake herdr-app (window closed) on its PATH, while the core and every
// harness keep the operator's real HOME and logins.
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { flockHold } from '../../src/flock';
import { command, spawnCaptured, type SpawnResult } from '../../src/shell';
import { realHome, realRuntime, required } from './tier';

// The paths one session owns. The core's own runtime folder holds a `bus` link and no `systemd` link, as
// tests/hc-fixture.ts does: hc then starts no systemd units, so the core, its terminals and any
// replacement core stay in the session's slice, and one cgroup kill ends all of them.
export type SessionPaths = {
  session: SessionName;
  coreRuntime: string;
  socket: string;
  coreState: string;
  lock: string;
  slice: string;
};

// The only names a session may have: the grant's, or a private one the deadline proof generates
// (akr-d<pid>, and akr-d<pid>h for the owner it holds beside its judges). Anything else would derive
// cleanup paths outside the session's own folders, so it stops the module before any path exists.
const sessionName = z
  .string()
  .regex(/^(akr-e2e-watch|akr-d\d+h?)$/)
  .brand<'SessionName'>();
export type SessionName = z.infer<typeof sessionName>;

export class SessionNameError extends Error {
  constructor(readonly value: string) {
    super(`AKROGON_E2E_SESSION must be akr-e2e-watch or akr-d<digits>[h], got ${JSON.stringify(value)}`);
  }
}

export function parseSessionName(value: string): SessionName {
  const parsed = sessionName.safeParse(value);
  if (!parsed.success) throw new SessionNameError(value);
  return parsed.data;
}

export function sessionPaths(name: SessionName): SessionPaths {
  const coreRuntime: string = resolve(realRuntime, name);
  return {
    session: name,
    coreRuntime,
    socket: resolve(coreRuntime, 'herdr-core', `${name}.sock`),
    coreState: resolve(realHome, '.local/state/herdr-core', name),
    lock: resolve(realRuntime, `${name}.lock`),
    // One level under akrogon.slice: systemd reads each `-` in a slice name as a parent.
    slice: `akrogon-${name.replace(/[^a-zA-Z0-9]/g, '')}.slice`,
  };
}

// Paid commands never set AKROGON_E2E_SESSION and use the grant's akr-e2e-watch; the deadline proof
// sets a private name for its child judges.
export const { session, coreRuntime, socket, coreState, lock, slice }: SessionPaths = sessionPaths(
  parseSessionName(process.env.AKROGON_E2E_SESSION ?? 'akr-e2e-watch'),
);
const manager: string = z
  .string()
  .parse(/^0::(\/.*\/user@\d+\.service)\//m.exec(readFileSync('/proc/self/cgroup', 'utf8'))?.[1]);
const cgroup: string = `/sys/fs/cgroup${manager}/akrogon.slice/${slice}`;
const killMs: number = 10_000;
const realBus: Record<string, string> = {
  DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
  XDG_RUNTIME_DIR: realRuntime,
};
const entry: string = resolve(import.meta.dir, '../../src/akrogon.ts');
const tests: string = resolve(import.meta.dir, '..');

// paid-starts.jsonl: a line per launch request, written before the request goes out; a line with the
// address it got (or `failed` when it got none) under the same id; and a line per consultant terminal
// the core reported. Every request counts, and so does a reported terminal no request got.
export const startLine = z.union([
  z.object({ id: z.string(), role: z.enum(['watcher', 'consultant']) }),
  z.object({ id: z.string(), address: z.string() }),
  z.object({ id: z.string(), failed: z.literal(true) }),
  z.object({ event: z.string() }),
]);

export type WatchTier = {
  root: string;
  runtime: string;
  shimBin: string;
  corePath: string;
  standin: string;
  out: string;
  paths: string[];
  akrogonEnv: Record<string, string>;
  hc: (args: string[]) => Promise<SpawnResult>;
  rpc: (method: string, params: object) => Promise<unknown>;
  akrogon: (args: string[]) => Promise<SpawnResult>;
  observe: () => Promise<SpawnResult>;
  record: (name: string, value: unknown) => void;
};

export function absent(name: SessionName): string[] {
  const paths: SessionPaths = sessionPaths(name);
  return [paths.coreRuntime, paths.coreState].filter((path: string) => existsSync(path));
}

// Ends every process in the session's slice with one cgroup kill, which no process can refuse.
export async function killSlice(): Promise<void> {
  if (existsSync(cgroup)) {
    writeFileSync(resolve(cgroup, 'cgroup.kill'), '1');
    const by: number = Date.now() + killMs;
    while (readFileSync(resolve(cgroup, 'cgroup.events'), 'utf8').includes('populated 1')) {
      if (Date.now() > by) throw new Error(`${slice} still populated ${killMs} ms after cgroup.kill`);
      await Bun.sleep(20);
    }
  }
}

// Stops the session's slice and the seats' leaf slices, then removes the core state and runtime.
export async function stopAndRemove(): Promise<void> {
  // Seats join their leaf slice through tests/core-bin/systemd-run, which lists each slice it used.
  const leafSlices: string[] = existsSync(resolve(coreRuntime, 'slices'))
    ? lines(readFileSync(resolve(coreRuntime, 'slices'), 'utf8'))
    : [];
  const units: string[] = [...new Set([...(existsSync(cgroup) ? [slice] : []), ...leafSlices])];
  if (units.length > 0) {
    const stopped: SpawnResult = await spawnCaptured(['systemctl', '--user', 'stop', ...units], {
      env: { ...process.env, ...realBus },
    });
    if (stopped.code !== 0) throw new Error(`slice stop failed: ${JSON.stringify({ units, ...stopped })}`);
  }
  for (const path of [coreState, coreRuntime]) rmSync(path, { recursive: true, force: true });
}

// One run at a time owns the session: each test file that uses it takes this lock at module level,
// before any test timer starts, and holds it until its process exits, so a second run waits and a dead
// run's lock goes with its process. Under the lock nothing else runs in the session, so whatever a dead
// owner left is ended and removed. One promise per process, so a process loading two owner files takes
// the lock once; each caller notes on stderr that it holds the session. The body script imports this module too and
// never takes it.
let held: Promise<void> | undefined;
export async function holdSession(): Promise<void> {
  held ??= (async (): Promise<void> => {
    await flockHold(lock, '-x');
    await killSlice();
    await stopAndRemove();
  })();
  await held;
  console.error(`holds ${session}`);
}

// `name` names the registered repo root `<leaf temp>/<name>`; every folder the run creates is
// recorded in <out>/paths.json before use. `rootName` overrides the root's folder name so a run
// can hold a space in the repo path while keeping the akr-e2e-watch-<kind>-* marker.
export async function startWatchTier(
  name: string,
  slots: object,
  harnesses: Record<string, string>,
  opts: { rootName?: string; startProofMs?: number; repoConfig?: Record<string, unknown> } = {},
): Promise<WatchTier> {
  const leafTemp: string = required('AKROGON_E2E_ROOT');
  const out: string = required('AKROGON_E2E_OUT');
  const root: string = resolve(leafTemp, opts.rootName ?? name);
  const home: string = resolve(leafTemp, `${name}-home`);
  const scratch: string = resolve(leafTemp, `${name}-scratch`);
  const runtime: string = resolve(leafTemp, `${name}-rt`);
  const appBin: string = resolve(leafTemp, `${name}-appbin`);
  const shimBin: string = resolve(leafTemp, `${name}-shimbin`);
  const standin: string = resolve(leafTemp, `${name}-standin`);
  const standinBin: string = resolve(leafTemp, `${name}-standinbin`);
  // Criterion 12: the repo's worktree store is its own folder, a sibling of the runtime and
  // helper folders — `akrogon unpause` worktree cleanup must not be able to reach the core's
  // socket symlink (leafTemp as the store let it delete <rt> and every hc call after unpause
  // answered `unavailable`, which starved the timer's dues in shell-shape runs).
  const worktrees: string = resolve(leafTemp, `${name}-wtr`);
  const paths: string[] = [root, home, scratch, runtime, appBin, shimBin, standin, standinBin, worktrees, coreRuntime];
  mkdirSync(out, { recursive: true });
  const record = (file: string, value: unknown): void =>
    writeFileSync(resolve(out, file), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  record(`${name}-paths.json`, paths);
  const linked: string = resolve(runtime, 'herdr-core', `${session}.sock`);
  if (Buffer.byteLength(linked) >= 107) throw new Error(`socket link path too long: ${linked}`);
  for (const dir of [
    resolve(root, 'issues/open'),
    resolve(runtime, 'herdr-core'),
    appBin,
    shimBin,
    standin,
    standinBin,
  ])
    mkdirSync(dir, { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'e2e@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'e2e'], root);
  writeFileSync(resolve(root, '.gitignore'), '.env\n.claude/\n');
  writeFileSync(
    resolve(root, 'issues/config.yaml'),
    Bun.YAML.stringify({
      checks: { test: 'true' },
      grounding: 'none',
      worktree_root: worktrees,
      ...(opts.repoConfig ?? {}),
    }),
  );
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'e2e'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(home, 'remote.git')]);
  await command(['git', 'remote', 'add', 'origin', resolve(home, 'remote.git')], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  writeFileSync(
    resolve(home, 'config.yaml'),
    Bun.YAML.stringify({ slots, harnesses, repos: { akre2e: root }, prefixes: { akre2e: 'aw' }, max_active: 2 }),
  );
  mkdirSync(resolve(scratch, '.config/herdr-app-sessions', session), { recursive: true });
  const appPlan: string = resolve(scratch, 'herdr-app-plan.json');
  writeFileSync(appPlan, JSON.stringify({ window: 'closed', rename: 'ok', calls: [] }));
  symlinkSync(resolve(tests, 'fake-herdr-app.ts'), resolve(appBin, 'herdr-app'));
  symlinkSync(resolve(tests, 'stand-in.sh'), resolve(standinBin, 'fake'));
  // tests/core-bin's systemd-run lets seat scopes reach the user manager from a core with no systemd link.
  const corePath: string = `${standinBin}:${resolve(tests, 'core-bin')}:${dirname(process.execPath)}:${z.string().parse(process.env.PATH)}`;
  mkdirSync(resolve(coreRuntime, 'herdr-core'), { recursive: true });
  symlinkSync(resolve(realRuntime, 'bus'), resolve(coreRuntime, 'bus'));
  const coreEnv: Record<string, string> = {
    HOME: realHome,
    PATH: corePath,
    LANG: 'C.UTF-8',
    TERM: 'xterm-256color',
    XDG_RUNTIME_DIR: coreRuntime,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    HC_SESSION: session,
    STANDIN_DIR: standin,
    // A run's check and verify scopes join the session's slice (src/scope.ts runSlice).
    AKROGON_RUN_SLICE: slice,
  };
  // The core starts in the session's slice, so everything it starts stays there. The consults body
  // already runs in it and starts the core directly.
  const inSlice: boolean = readFileSync('/proc/self/cgroup', 'utf8').includes(`/${slice}/`);
  const serverStart: string[] = ['hc', 'server', 'start'];
  const started: SpawnResult = await spawnCaptured(
    inSlice
      ? serverStart
      : [
          resolve(tests, 'core-bin/systemd-run'),
          '--user',
          '--scope',
          '--quiet',
          `--slice=${slice}`,
          '--',
          ...serverStart,
        ],
    { cwd: root, env: coreEnv },
  );
  if (started.code !== 0) throw new Error(`hc server start failed: ${JSON.stringify(started)}`);
  symlinkSync(socket, linked);
  symlinkSync(resolve(realRuntime, 'bus'), resolve(runtime, 'bus'));
  symlinkSync(resolve(realRuntime, 'systemd'), resolve(runtime, 'systemd'));
  const akrogonEnv: Record<string, string> = {
    ...coreEnv,
    HOME: scratch,
    PATH: `${shimBin}:${appBin}:${corePath}`,
    AKROGON_HOME: home,
    XDG_RUNTIME_DIR: runtime,
    FAKE_HERDR_APP: appPlan,
    AKROGON_START_PROOF_MS: String(opts.startProofMs ?? 3000),
    HC_SESSION: '',
    HC_TERMINAL_ID: '',
    HC_TERMINAL_SOCKET: '',
    HC_SCOPE: '',
  };
  // The checkout under test as `akrogon` for the listener's passes and the watcher's commands.
  const shim: string = resolve(shimBin, 'akrogon');
  writeFileSync(
    shim,
    `#!/bin/sh\nexec env ${Object.entries(akrogonEnv)
      .filter(([key]) => !key.startsWith('HC_') && key !== 'PATH')
      .map(([key, value]) => `${key}='${value}'`)
      .join(' ')} PATH='${shimBin}:${appBin}':"$PATH" '${process.execPath}' '${entry}' "$@"\n`,
  );
  chmodSync(shim, 0o755);
  const hc = (args: string[]): Promise<SpawnResult> => spawnCaptured(['hc', ...args], { cwd: root, env: coreEnv });
  const rpc = async (method: string, params: object): Promise<unknown> => {
    const reply: SpawnResult = await spawnCaptured(['hc', 'connect'], {
      cwd: root,
      env: coreEnv,
      stdin: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n',
    });
    const parsed = z
      .object({ result: z.unknown().optional(), error: z.unknown().optional() })
      .parse(JSON.parse(reply.stdout));
    if (parsed.error !== undefined) throw new Error(`${method}: ${JSON.stringify(parsed.error)}`);
    return parsed.result;
  };
  await rpc('doc.set', {
    name: 'herdr-app',
    value: { spaces: [{ folder: root, id: 'spakre2e', name: 'akre2e', tabs: [] }] },
    version: 0,
  });
  const akrogon = (args: string[]): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, entry, ...args], { cwd: root, env: akrogonEnv });
  const observe = (): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, resolve(tests, '../skills/watch-issues/scripts/observe.ts'), root], {
      cwd: root,
      env: akrogonEnv,
    });
  return { root, runtime, shimBin, corePath, standin, out, paths, akrogonEnv, hc, rpc, akrogon, observe, record };
}

// The grant's cleanup and absence check (readiness grants[0].fixtures[0]): the session ends the way a
// dead owner's is recovered, its state and every recorded folder go. Transcripts, agy's trustedWorkspaces
// entry and the agy conversation ids are A's after the report quotes them.
export async function stopWatchTier(tier: WatchTier, cwds: string[]): Promise<string[]> {
  await killSlice();
  await stopAndRemove();
  for (const path of [...cwds, ...tier.paths]) rmSync(path, { recursive: true, force: true });
  return absent(session);
}

export function lines(stdout: string): string[] {
  return stdout.trim() === '' ? [] : stdout.trim().split('\n');
}

// Pre-launch gate of every run: observe reads this session before any harness starts, so a broken
// observe costs no paid session.
export async function observeReady(tier: WatchTier): Promise<void> {
  const seen: SpawnResult = await tier.observe();
  tier.record('observe-before-launch.txt', `${seen.code}\n${seen.stdout}\n${seen.stderr}`);
  const [header, paused]: string[] = lines(seen.stdout);
  if (seen.code !== 0 || header !== `session=${session}` || paused !== 'paused=false')
    throw new Error(`observe did not read ${session} as unpaused: ${JSON.stringify(seen)}`);
}
