# Research: akrogon test infrastructure (tests/)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/direct-leaf
Test runner: bun test. Tests run the REAL CLI (`src/akrogon.ts` via `process.execPath`) against a temp repo, and hc-core tests run a REAL throwaway `hc` daemon per fixture.

---

## 1. tests/helpers.ts (324 lines)

### Entry point and WAIT_MS (lines 21-22)

```ts
export const entry: string = resolve(import.meta.dir, '../src/akrogon.ts');
export const WAIT_MS: number = SUITE_TIMEOUT_MS - 30_000;   // 120_000 - 30_000 = 90_000 ms
```

### readMarker — file-based event waiting (lines 24-32)

```ts
// Waits for a marker another process publishes by write-then-rename and returns its content.
export async function readMarker(path: string, ms: number = WAIT_MS): Promise<string> {
  const deadline: number = Date.now() + ms;
  for (;;) {
    const content: string = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (content !== '') return content;
    if (Date.now() > deadline) throw new Error(`Timed out waiting for marker ${path}`);
    await Bun.sleep(20);
  }
}
```

### The Fixture type (line 41)

```ts
export type Fixture = { home: string; root: string; repo: string; prefix: string; clean: () => void };
```

### fixture() (lines 78-110) — the repo layout it creates

```ts
export async function fixture(occupiedPrefix?: string): Promise<Fixture> {
  const home: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-')));
  const root: string = resolve(home, basename(home));
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  writeFileSync(resolve(root, 'file'), 'initial\n');
  writeFileSync(resolve(root, '.gitignore'), '.env\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'initial'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(home, 'remote.git')]);
  await command(['git', 'remote', 'add', 'origin', resolve(home, 'remote.git')], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  yaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
  const identity: { repo: string; prefix: string } = fixtureRepo(home, occupiedPrefix);
  yaml(resolve(home, 'config.yaml'), {
    slots: {
      a: { harness: 'fake', model: 'strong-a', effort: 'high' },
      b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
    },
    harnesses: { fake: 'fake --model {model} --effort {effort}' },
    repos: { [identity.repo]: root },
    prefixes: { [identity.repo]: identity.prefix },
  });
  const f: Fixture = { home, root, ...identity, clean: () => rmSync(home, { recursive: true, force: true }) };
  seedStat(f, 1024 * 1024 * 1024);
  const units: string = unitBin(f);
  mkdirSync(units);
  symlinkSync(resolve(import.meta.dir, 'fake-systemd-run.sh'), resolve(units, 'systemd-run'));
  return f;
}
```

Layout summary:
- `home` = mkdtemp dir; registered in a process-exit cleanup set (`registerTemp`, lines 34-40).
- `root` = git repo inside home, same basename as home (so `akrogon init` re-init is idempotent). Contains `issues/open/`, initial commit on `main`.
- A bare remote is ALWAYS created at `<home>/remote.git` and wired as `origin`, main pushed.
- Repo-local config at `<root>/issues/config.yaml`: `{ checks: { test: 'bun test' }, grounding: 'none' }`.
- GLOBAL config at `<home>/config.yaml`: slots a/b (harness fake, models strong-a/strong-b), harnesses template `fake --model {model} --effort {effort}`, repos registry, two-letter prefix per repo.
- Repo identity: `fixtureRepo(home)` (line 44) — repo name is `basename(home)`, prefix derived from sha256 of home (two letters), avoiding `occupiedPrefix` collision.
- A cgroup memory.stat is seeded (`seedStat`, line 70) under `<home>/cgroup/...` with 1 GiB anon.
- `systemd-run` on PATH is `fake-systemd-run.sh` symlinked into `<home>/unitbin`.

### Config knobs — how tests change them

- Repo-local checks: overwrite `<root>/issues/config.yaml` with `yaml()` (line 60: `export function yaml(path: string, data: object): void` using `Bun.YAML.stringify`), then commit+push if the merge machinery reads them from the committed tree. Example green-merge.test.ts lines 47-52:

```ts
yaml(resolve(f.root, 'issues/config.yaml'), { checks, grounding: 'none' });
await command(['git', 'add', 'issues/config.yaml'], f.root);
await command(['git', 'commit', '-m', 'checks'], f.root);
await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
```

- max_active and other global knobs: each file defines its own `configure` helper, e.g. next.test.ts lines 1107-1110:

```ts
function configure(f: Fixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}
```

used as `configure(f, { max_active: 1 })` (next.test.ts line 581). Default `max_active` is 3 (src/config.ts line 25).

- Slots/harness/stand-in mode: `setSeat(f, slot, harness, model)` from hc-fixture.ts (line 269) — writes global config.yaml slots and harnesses; the `model` value doubles as the stand-in mode.

### cli() — how tests invoke the CLI (lines 112-141)

```ts
export async function cli(
  f: Fixture,
  args: string[],
  cwd: string = f.root,
  env: NodeJS.ProcessEnv = {},
  timeout?: number,
): Promise<Result> {
  const withDefault: NodeJS.ProcessEnv =
    'AKROGON_LEAF_TEMP_ROOT' in env ? env : { ...env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) };
  const result: SpawnResult = await spawnCaptured([process.execPath, entry, ...args], {
    cwd,
    env: {
      ...process.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      HOME: f.home,
      AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
      ...withDefault,
      ...('AKROGON_RUN' in env ? {} : { AKROGON_RUN: '' }),
      PATH: `${unitBin(f)}:${env.PATH ?? process.env.PATH}`,
    },
    timeout,
    killSignal: 'SIGKILL',
  });
  const { stdout, stderr, code } = result;
  if (result.signalCode !== null)
    throw new Error(JSON.stringify({ args, timeout, signal: result.signalCode, code, stdout, stderr }));
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}
```

Key facts:
- Runs `bun src/akrogon.ts <args>` as a child process (the real CLI, no mocks inside the process).
- `AKROGON_HOME` and `HOME` point at the fixture home — the global config is the fixture's.
- `HC_SESSION`/`HC_TERMINAL_ID` are NOT set here; for hc-core tests the caller passes `core.env` or `f.env` (from hcFixture) as the `env` argument, e.g. `cli(f, ['next', slug], f.root, core.env)`.
- A non-zero exit is NOT an error in the test framework sense: callers assert `(await cli(...)).code` themselves. Only signal death throws.
- Test files wrap it per verb, e.g. next.test.ts lines 63-70:

```ts
async function next(
  f: Fixture & { env: NodeJS.ProcessEnv },
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
```

### leaf() — writing leaf folders/state (lines 154-166)

```ts
export function leaf(f: Fixture, slug: string, phase: string, extra: object = {}, container: string = 'issue'): string {
  const path: string = resolve(f.root, 'issues/open', container, slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    repo: f.repo,
    'blocked-by': [],
    ...extra,
  });
  return path;
}
```

Default container is `issue`; tests pass e.g. `'issue-aa'`, `'epic/first'`. State mutations after creation go through `readState(path)` / `saveState(path, {...})` imported from `../src/state` (the product's own state module).

### Other helpers

- `storeDir(f, repo?)` (line 57): `<home>/.akrogon/worktrees/<repo>` — where leaf worktrees live.
- `leafTempRoot(f)` (line 54): `<home>/leaf-temp` — set as AKROGON_LEAF_TEMP_ROOT.
- `killTree(proc)` (line 143): SIGKILL a subprocess and all descendants.
- `procFixture(f)` (line 173): env with fake proc root, XDG_RUNTIME_DIR.
- `herdrStub(bin)` (line 191) / `herdrCalls(bin)` (line 198): a recording `herdr` stub binary; "so a test sees any herdr call a command still makes."
- `fakeSystemctl(f)` (lines 204-212): symlinks tests/fake-systemctl.ts as `systemctl` into `<home>/bin`; returns `{ db, log, env }` where db is `<home>/systemctl.json` (seeded `{units:[]}`), env carries `FAKE_SYSTEMCTL_DB`/`FAKE_SYSTEMCTL_LOG`.
- `fakeAkrogon(f)` (line 214): symlinks src/akrogon.ts as `akrogon` on PATH (for tests of printed check commands).
- `fakeGh(f)` (lines 228-235): symlinks fake-gh.ts as `gh`, seeds empty db `<home>/gh.json`, env `{ PATH, FAKE_GH: db }`.
- `seedRun(f, run)` (line 270): appends a verify-run record to `issues/verify-runs.jsonl`.
- `greenReceipt(f, sha, scope, commands?)` (line 292): seeds a GREEN verify run for a sha.
- `verified(f, slug, scope)` (line 308): green receipt on the leaf's current worktree HEAD or branch.
- `holding(f)` (lines 317-324): "A merge-turn record and green receipt on the current remote tip, so an operator `merged` pushes nothing new and lands." Returns `{ batch: { attempt: 'a1', built_on, holder: { base, head }, applied: true, top } }` — spread into a leaf's state via `saveState`.

---

## 2. tests/hc-fixture.ts (670 lines)

File header (lines 1-9): "Real throwaway hc core per test file (forks/tests.md Q1): a unique HC_SESSION, scratch state, the stand-in agent on the core's PATH under the fixture harness names, the strict fake herdr-app and a recording hc shim on akrogon's PATH."

### The HcCore type (lines 225-247)

```ts
export type HcCore = {
  session: string;
  socket: string;
  standin: string;
  runtime: string;
  appPlan: string;
  appHome: string;
  shimLog: string;
  env: NodeJS.ProcessEnv;
  hc: (args: string[]) => Promise<SpawnResult>;
  rpc: (method: string, params: object) => Promise<unknown>;
  terminals: (labels?: Record<string, string>, all?: boolean) => Promise<Terminal[]>;
  get: (address: string) => Promise<Terminal>;
  tasks: (address: string) => string[];
  waitFor: (address: string, until: (t: Terminal) => boolean, ms?: number) => Promise<Terminal>;
  // Resolves once every waitFor reader of this core has ended...
  reading: () => Promise<void>;
  appCalls: () => { argv: string[]; home: string | null; planned: boolean }[];
  setWindow: (window: 'open' | 'closed', rename?: 'ok' | 'fail') => void;
  link: (other: HcCore) => void;
  discard: () => void;
  stop: (ms?: number) => Promise<void>;
};
```

### Terminal type (lines 186-200)

```ts
export type Terminal = {
  address: string;
  name: string | null;
  state: string;       // 'live' | 'finished' | ...
  turn: number;
  pid: number | null;
  parent: string | null;
  cwd: string;
  labels: Record<string, string>;
  status: { state: string; kind?: string | null; msg?: string } | null;
};
```

### stopCoresAfterFile (line 30)

```ts
export function stopCoresAfterFile(): void {
  afterAll(async () => {
    for (const core of [...started]) await core.stop();
  });
}
```

Every hc-core test file calls this at top level; cores detach from the test process, so per-file afterAll cleanup stops them.

### hcCore() (lines 306-309)

```ts
export async function hcCore(
  f: Fixture,
  opts: { coreEnv?: Record<string, string>; window?: 'open' | 'closed'; doc?: boolean; repo?: string } = {},
): Promise<HcCore> {
```

What it does:
- Requires the real `hc` binary on PATH (throws otherwise): `if (realHc === null) throw new Error('hc (herdr-core 0.1.18) is required on PATH for the real-core tests')` (line 308).
- Session name `akt<pid-base36>-<serial>`; first call sweeps abandoned daemons (`sweepAbandoned`, line 46).
- Runtime dir under the REAL `/run/user/<uid>/` (not TMPDIR — socket path length limit of 107 bytes).
- Symlinks `stand-in.sh` into a per-core bin dir under the harness names `fake`, `agy`, `claude` (lines ~340).
- Symlinks real `bus` and `systemd` into the runtime so the core reaches the real user manager / D-Bus.
- Starts the real daemon: `spawnCaptured([realHc, 'server', 'start'], { env: cleanEnv(session, coreRuntime, {...}), ...})` (line ~346).
- Creates `<home>/hc-bin-<serial>` containing the recording shim `hc` (tests/hc-shim.sh) and `herdr-app` (tests/fake-herdr-app.ts) — akrogon's PATH sees the shim, never the real hc.
- Writes the herdr-app plan file `<home>/herdr-app-<serial>.json` seeded as `{ window: opts.window ?? 'closed', rename: 'ok', calls: [] }` (line ~356).
- Creates the herdr-app home `<home>/.config/herdr-app-sessions/<session>` (`appHome`).
- Seeds the shim log `<home>/hc-calls-<serial>.log` empty (`shimLog`).

The `env` handed to akrogon CLI invocations (lines 359-374):

```ts
const env: NodeJS.ProcessEnv = {
  PATH: `${hcBin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
  XDG_RUNTIME_DIR: runtime,
  DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
  HC_SESSION: '',
  HC_TERMINAL_ID: '',
  HC_TERMINAL_SOCKET: '',
  HC_SCOPE: '',
  HERDR_APP_HOME: '',
  FAKE_HERDR_APP: appPlan,
  HC_SHIM_LOG: shimLog,
  HC_SHIM_REAL: realHc,
};
```

Note: `HC_SESSION` and `HC_TERMINAL_ID` default to EMPTY — akrogon discovers the session through the runtime dir socket scan, not inheritance. Tests override per-invocation to simulate being inside a terminal (see §11).

Core methods:
- `hc(args)` (line ~376): runs the REAL hc against the core (bypasses the shim) — the test's own control channel: `core.hc(['kill', addr])`, `core.hc(['run', ...])`, `core.hc(['rm', addr])`, `core.hc(['label', ...])`.
- `rpc(method, params)` (line ~385): JSON-RPC over `hc connect` stdin, throws on error. Used for `terminal.list`, `doc.get`, `doc.set`.
- `terminals(labels = {}, all = true)` (line ~398): `rpc('terminal.list', { all, labels })` — label-filtered queries like `{ 'akrogon.leaf': slug }` or `{ akrogon: '1' }`. NOTE the default `all = true` includes finished terminals; pass `false` for live-only.
- `get(address)`: `hc get --json <address>` parsed to Terminal.
- `waitFor(address, until, ms = WAIT_MS)` (line ~404): event-driven wait — spawns `hc events --json --terminal <address>`, reads the snapshot first, then applies event deltas; resolves when the predicate holds, rejects after `ms` with the last terminal state in the message. NOT polling — "Follows hc events for one terminal (snapshot first), never a timed re-read; the timer only bounds it."
- `tasks(address)` (line ~470): reads `<standin>/<address>.tasks` — the tasks the stand-in logged for that terminal, one per line. Finished terminals included since the log file outlives the terminal.
- `appCalls()`: parses the fake herdr-app plan file, returns every call record `{ argv, home, planned }`.
- `setWindow(window, rename = 'ok')`: rewrites the plan file preserving recorded calls.
- `link(other)`: symlinks another core's socket into this core's runtime so akrogon sees both sessions.
- `stop(ms)`: `stopDaemon` (real `hc server stop` + wait for daemons to exit, SIGKILL, deadline) then `stopLedgerSlices` (stops leaf slices recorded in the core's slices ledger), then `discard()` (removes socket/runtime/state files without contacting hc).
- Unless `opts.doc === false`, seeds the `herdr-app` doc via `doc.set` with `recordedDoc(sp-<session>, repo, f.root)` (line ~250) — the window-tier document shape with one space named after the repo.

### setSeat (lines 269-284)

```ts
// Points a slot at a harness and stand-in mode (the --model value), adding the stand-in template the
// start verb keys on (every harness name in standinBin maps to the stand-in).
export function setSeat(f: Fixture, slot: 'a' | 'b', harness: string, model: string): void {
```

### setPrefixes (line 260) — rewrite the global prefixes map.

### shortStartProof (line 304)

```ts
export const shortStartProof: NodeJS.ProcessEnv = { AKROGON_START_PROOF_MS: '3000' };
```

"The start-proof window of a test whose seat never proves its start; every other test waits the product's."

### hcFixture() (lines 541-568)

```ts
// Engine tests on one fixture core: both seats run the stand-in in `mode` under the fixture prefix; clean
// stops the core, which ends every seat and so empties its leaf slice, before removing the fixture.
// akrogon's systemctl is the fake: a leaf slice is named from repo and slug only, so a real stop
// from reconcile or `stop` would end the seats of a concurrent case with the same slug.
export async function hcFixture(
  opts: { mode?: string; window?: 'open' | 'closed'; occupiedPrefix?: string } = {},
): Promise<HcFixture> {
```

Combines `fixture()` + `setSeat(a,b)` (both slots to `opts.mode ?? 'work'`) + fake systemctl + `hcCore()`. Returns `HcFixture = Fixture & { core, systemctl, env, clean }` where `env` merges `core.env` + systemctl env + PATH with the fake-systemctl bin dir inserted after the fixture's own bin (so a test's own `<home>/bin/systemctl` override wins). `clean` is async: stops the core then removes the fixture. Typical test:

```ts
const f: HcFixture = await hcFixture();
try { ... } finally { await f.clean(); }
```

### delivered() (lines 571-580)

```ts
// The tasks each seat terminal of a leaf received, finished terminals included, in terminal order.
export async function delivered(
  f: HcFixture,
  slug: string,
): Promise<{ seat: string; address: string; text: string }[]> {
```

### adopt() (line 583) — `export function adopt(core: HcCore): () => void`

Emulates herdr-app's adoption: follows `hc events` for terminals labelled `akrogon=1` and writes each as a block into the herdr-app doc under its `herdr.space`/`herdr.tab` labels, with retry on version conflict. Returns a kill function. Used by window-open tests.

### Notices (lines 647-669)

- `noticeFolder(core)`: `<appHome>/akrogon-notices`.
- `noticeFiles(core): NoticeFile[]` — reads complete `*.json` files, throws on any other entry.
- `blockNotices(core)`: puts a plain file where the folder goes so every notice write fails; returns restore fn.

### tests/hc-shim.sh — the recording shim (12 lines, full)

```sh
#!/bin/sh
# Recording hc in front of the real one. Logs each call's argv (one JSON-ish line, args joined by
# a tab) to $HC_SHIM_LOG, then runs the real hc ($HC_SHIM_REAL). When the file $HC_SHIM_UNAVAILABLE
# exists, the next `send` removes it and answers hc's "still starting" refusal instead, the one
# reply a stand-in cannot produce on demand (forks/proofs.md P1); every other call reaches the core.
[ -n "$HC_SHIM_LOG" ] && (IFS='	'; printf '%s\n' "$*") >> "$HC_SHIM_LOG"
if [ "$1" = send ] && [ -n "$HC_SHIM_UNAVAILABLE" ] && [ -e "$HC_SHIM_UNAVAILABLE" ]; then
	rm -f "$HC_SHIM_UNAVAILABLE"
	printf '%s\n' '{"error":{"kind":"unavailable","message":"still starting: its output has not settled"}}' >&2
	exit 1
fi
exec "${HC_SHIM_REAL:?}" "$@"
```

Tests read the record by splitting lines on `\t` — canonical pattern (next.test.ts lines 135-141):

```ts
// The hc calls akrogon made, one argv per call, from the fixture's recording shim.
function hcCalls(f: HcFixture): string[][] {
  return readFileSync(f.core.shimLog, 'utf8')
    .split('\n')
    .filter((line: string) => line !== '')
    .map((line: string) => line.split('\t'));
}
```

IMPORTANT: `core.hc([...])` does NOT go through the shim — it invokes the real hc directly. Only akrogon child processes (which inherit `env.PATH` with hcBin first) hit the shim. Tests can also truncate the log mid-test: `writeFileSync(f.core.shimLog, '')` (batch-dispatch.test.ts line 243).

### tests/stand-in.sh — the fake agent (58 lines, full quoted)

```sh
#!/bin/sh
# Stand-in agent for real-core tests. Invoked as a harness: `<kind> --model <mode> --effort <e> [<task>]`.
# It reports OSC 7501 status like a coding agent and logs every task it receives to
# $STANDIN_DIR/<HC_TERMINAL_ID>.tasks (one line each), so tests read what was delivered.
# Modes (the --model value):
#   work   idle, then for each task: working, run $STANDIN_DIR/hook <terminal> <task> when present, idle
#   done   as work, but each turn ends in done, as Claude Code's turns do
#   idle   reports idle and never goes working (never confirms a start, send gives started:false);
#          a received line `WORK` makes one working-to-idle turn, so a test can move its turn
#   exit   exits 3 at once
#   trust  agy's trust dialog first (blocked, permission); one Enter answers it, then idle, done a
#          second later, and behaves as work
mode=work
while [ $# -gt 0 ]; do
	case "$1" in
	--model) mode="$2"; shift 2 ;;
	--effort | --session-id | --settings) shift 2 ;;
	--*) shift ;;
	*) break ;;
	esac
done
log="${STANDIN_DIR:?}/${HC_TERMINAL_ID:-unknown}.tasks"
# A `delay-<folder name>` file holds the seconds to sleep before the first status: a late start.
delay="$STANDIN_DIR/delay-$(basename "$PWD")"
if [ -r "$delay" ]; then sleep "$(cat "$delay")"; fi
status() { printf '\033]7501;state=%s\007' "$1"; }
turn() {
	printf '%s\n' "$1" >> "$log"
	status working
	if [ -x "$STANDIN_DIR/hook" ]; then "$STANDIN_DIR/hook" "${HC_TERMINAL_ID:-unknown}" "$1"; fi
	if [ "$mode" = done ]; then status done; else status idle; fi
}
case "$mode" in
exit) exit 3 ;;
idle)
	# The argv task is logged before the first status, so a seen idle status means it is recorded.
	[ $# -gt 0 ] && printf '%s\n' "$1" >> "$log"
	status idle
	while IFS= read -r line; do
		printf '%s\n' "$line" >> "$log"
		[ "$line" = WORK ] && status working && status idle
	done
	exit 0
	;;
trust)
	printf '\033]7501;state=blocked:kind=permission:msg=Trust this folder?\007'
	IFS= read -r line
	printf 'ENTER\n' >> "$log"
	status idle
	sleep 1
	status done
	;;
esac
status idle
[ $# -gt 0 ] && turn "$1"
while IFS= read -r line; do turn "$line"; done
```

Key mechanics:
- Reports agent status via OSC 7501 escape sequences — this is how hc knows working/idle/done/blocked.
- Every task received (argv or stdin line) is appended to `$STANDIN_DIR/<HC_TERMINAL_ID>.tasks`.
- Hook seam: `$STANDIN_DIR/hook` executable invoked per turn with `<terminal> <task>` — tests write this script to hold turns (fifo gates), report blocked, inject sends, etc.
- `delay-<cwd basename>` file delays the first status (late-start simulation).
- Mode is chosen per fixture via `setSeat(f, 'a', 'fake', '<mode>')` or `hcFixture({ mode })`.

### tests/fake-herdr-app.ts — the strict window fake (43 lines)

Answers ONLY: `ls`, `do tab.rename --id <t> --name <n>`, `do tab.close --id <t>`. Every call is appended to the plan file as `{ argv, home, planned }`; an unplanned call exits 99 ("so a test fails on an unexpected call"). Plan shape: `{ window: 'open'|'closed', rename: 'ok'|'fail', calls: [...] }` in `$FAKE_HERDR_APP`. Window closed → exits 1 with the no-socket message. Rename fail → exits 1. Records `HERDR_APP_HOME` per call. Tests read via `core.appCalls()` and flip state mid-test with `core.setWindow('open'|'closed', 'ok'|'fail')`.

### Creating a terminal NOT started by akrogon

Two patterns exist:

Pattern A — plain `core.hc(['run', ...])` (the door's own terminal / foreign terminal). hc-teardown.test.ts lines 107-109:

```ts
const run = await core.hc(['run', '--bg', '--json', '--no-parent', '--cwd', worktree, '--', 'cat']);
expect(run.code).toBe(0);
const foreign: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
```

Pattern B — reconcile.test.ts `paneAt` helper (lines 96-113), same mechanics plus labels:

```ts
// A live terminal outside every leaf seat, with its cwd at dir, or holding tab when given.
async function paneAt(f: DispatchFixture, dir: string, tab?: string): Promise<string> {
  mkdirSync(dir, { recursive: true });
  const labels: string[] = tab === undefined ? [] : ['--label', `herdr.tab=${tab}`];
  const started: SpawnResult = await f.core.hc([
    'run', '--bg', '--json', '--no-parent', '--cwd', dir, ...labels, '--', 'cat',
  ]);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}
```

Pattern C — door-exchange.test.ts `startDoor` (lines 47-70): runs a bash script terminal that itself emits OSC 7501 and runs `hc wait --children any`, simulating a door agent.

---

## 3. Representative hc-core test patterns

### hc-teardown.test.ts — complete representative tests

Setup pattern (lines 14-31):

```ts
stopCoresAfterFile();

async function setup(slug: string, window: 'open' | 'closed' = 'closed') {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'fake', 'work');
  const core: HcCore = await hcCore(f, { window });
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await cli(f, ['next', slug], f.root, core.env)).code).toBe(0);
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: f.repo }, slug, f.home)]);
  f.clean();
}
```

Complete test (lines 38-57):

```ts
for (const window of ['open', 'closed'] as const)
  test(`a merged leaf's seats are killed and removed; its tab close is ${window === 'open' ? 'requested' : 'skipped'} with the window ${window}`, async () => {
    const slug: string = `ht-merged-${window}`;
    const { f, core, path } = await setup(slug, 'closed');
    try {
      expect(await leafTerminals(core, slug)).toHaveLength(1);
      // Read before the pass: completing the merged leaf moves its folder to issues/closed.
      const tab: string = z.string().parse(readState(path).tab);
      merge(path);
      core.setWindow(window);
      expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
      expect(await leafTerminals(core, slug)).toEqual([]);
      const closes: string[][] = core
        .appCalls()
        .map((call) => call.argv)
        .filter((argv) => argv[1] === 'tab.close');
      expect(closes).toEqual(window === 'open' ? [['do', 'tab.close', '--id', tab]] : []);
    } finally {
      await teardown(f, core, slug);
    }
  });
```

(The hc-teardown file builds its own fixture rather than using hcFixture because it needs per-test control; most files use hcFixture instead.)

### next.test.ts — the canonical "next dispatches a leaf" test (lines 234-260)

```ts
test('next creates one worktree/tab under concurrent passes and starts configured A with the leaf task', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    // The seat works on its task through both passes, as an agent would.
    holdTurns(f);
    const results: Result[] = await Promise.all([next(f, ['build']), next(f, ['build'])]);
    expect(results.map((r) => r.code)).toEqual([0, 0]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^(priority|slot):/m);
    const seats: Terminal[] = await seatTerminals(f, 'build', true);
    expect(seats.map((t: Terminal) => t.name)).toEqual([seatName(f.repo, f.prefix, 'build', 'a')]);
    expect(new Set(seats.map((t: Terminal) => t.labels['herdr.tab']))).toEqual(
      new Set([z.string().parse(readState(path).tab)]),
    );
    const tasks = await allTasks(f);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe(`plan-issue build slot=A phase=plan.synthesis leaf=${path}`);
    expect(tasks[0].address).toBe(z.string().parse(readState(path).seat.A?.address));
    expect(readState(path).attempts.A).toBe(0);
    expect(noticeFiles(f.core)).toEqual([]);
    expect(await command(['git', 'branch', '--show-current'], readState(path).worktree)).toBe('build');
  } finally {
    await f.clean();
  }
});
```

Supporting next.test.ts local helpers (lines 76-190):
- `seatTerminals(f, slug, all)`: `f.core.terminals({ akrogon: '1', 'akrogon.leaf': slug }, all)`.
- `liveTabs(f)`: distinct `akrogon.leaf` labels of LIVE terminals — the "open tabs" assertion.
- `allTasks(f)`: every task any akrogon terminal received.
- `holdTurns(f, status?)` (lines 104-117): writes standin `hold` file + hook script that blocks each turn until released; optional status reported at turn start. `freeTurns(f, address)` releases one terminal.
- `seatIdle(f, address, turn)`: `f.core.waitFor(address, (t) => t.turn >= turn && t.status?.state === 'idle')`.
- `otherRepo(f)`: second fixture + core, linked sessions, registered in global config.

### phase.test.ts — representative phase driving (mostly without seats)

phase.test.ts line 75-92 — a pure temp-repo test (no core needed):

```ts
test('valid phase transition rejects a mismatched repo key without changing state or history', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    const before: string = bytes(path);
    const history: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(history, '');
    const result: Result = await cli(f, ['phase', 'wrong-key', 'implement', '--slot', 'A']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(path);
    expect(result.stderr).toMatch(/stored[^\n]*other/i);
    expect(result.stderr).toContain(`registered key "${f.repo}"`);
    expect(bytes(path)).toBe(before);
    expect(readFileSync(history, 'utf8')).toBe('');
  } finally {
    f.clean();
  }
});
```

phase.test.ts with hcFixture for rename/notice assertions (lines 1557-1569):

```ts
const f: HcFixture = await hcFixture({ window: 'open' });
try {
  const waiting: string = resolve(noticeFolder(f.core), `${noticeId(f.repo, 'failed', 'back')}.json`);
  mkdirSync(noticeFolder(f.core), { recursive: true });
  writeFileSync(waiting, JSON.stringify(failedNotice(f, 'back')));
  const path: string = parked(f, 'back', 'failed', {
    tab: 'aktab1',
    failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x', delivery: 'pending' },
  });
  const result: Result = await cli(f, ['phase', 'back', 'implement'], f.root, f.env);
  expect(result.code).toBe(0);
  expect(renames(f)).toEqual([['aktab1', 'back']]);
  expect(readState(path).phase).toBe('implement');
  expect(existsSync(waiting)).toBe(false);
} finally {
  await f.clean();
}
```

where `renames(f)` (lines 51-55) filters `f.core.appCalls()` for `tab.rename` and maps to `[tab, name]`, and `parked(f, slug, phase, extra)` creates a leaf blocked by a blocker leaf.

---

## 4. tests/fake-gh.ts (66 lines, full behavior)

A scripted-queue fake GitHub CLI. The db file (`$FAKE_GH`, seeded `[]` by `fakeGh(f)`) holds a JSON array of steps consumed IN ORDER — each `gh` invocation pops the first step:

```ts
const stepSchema = z.object({
  stdout: z.string(),
  stateful: z.boolean().default(false),
  stderr: z.string().default(''),
  code: z.number().int().default(0),
  delayMs: z.number().nonnegative().default(0),
  args: z.array(z.string()).optional(),
  probe: z.object({ open: z.string(), closed: z.string(), lock: z.string(), worktree: z.string() }).optional(),
});
export type GhStep = z.input<typeof stepSchema>;
```

Behavior per call:
- If `step.args` is set, the actual argv must match exactly or the fake throws.
- Every call appends `{args, cwd}` to `<db>.calls` and `start`/`end` to `<db>.events` (tests use events to prove concurrent/overlapping gh calls never happened, or that a call is mid-flight).
- `probe`: at call time verifies the leaf folder is still open, not closed, the worktree still has .git, and `flock -n` on the lock FAILS (lock held) — proving the close happens inside the lock with the leaf still open; appends result incl. `GH_HOST` to `<db>.probes`.
- `stateful` steps implement a mini state machine in `<db>.state`: `gh api` returns comments paginated by 100, `issue view` returns state, `issue close` records the comment and flips state to CLOSED (only on exit 0).
- Otherwise prints `step.stdout`/`stderr` and exits `step.code`, after `delayMs`.

How tests use it (phase.test.ts lines 524-599): write the step queue into `gh.db` with `writeFileSync(gh.db, JSON.stringify([...]))`, run the CLI with `gh.env` merged into the env (`{ ...gh.env, GH_HOST, GH_REPO }` — note line 573-577 passes GH_HOST elsewhere.invalid yet the probes record github.com, asserting the product overrides the host), then assert:

```ts
expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);   // every queued step consumed
const calls: { args: string[]; cwd: string }[] = readFileSync(gh.db + '.calls', 'utf8')
  .trim().split('\n').map((line) => z.object({ args: z.array(z.string()), cwd: z.string() }).parse(JSON.parse(line)));
expect(
  calls.filter((call) => call.args[1] === 'close').map((call) => call.args).sort(),
).toEqual(
  [1, 2, 3].map((n) => ['issue', 'close', '-R', 'team/project', String(n), '--comment', 'delivered by two']),
);
```

Also `expect(existsSync(gh.db + '.calls')).toBe(false)` proves gh was NEVER called (phase.test.ts line 546).

---

## 5. tests/green-merge.test.ts — the land-run test pattern

### Setup (lines 44-62)

```ts
stopCoresAfterFile();
type GreenFixture = HcFixture & { launches: string; systemctl: SystemctlFixture };

async function greenFrom(f: HcFixture, checks: Record<string, string>): Promise<GreenFixture> {
  yaml(resolve(f.root, 'issues/config.yaml'), { checks, grounding: 'none' });
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const launches: string = resolve(f.home, 'systemd-run.log');
  // akrogon's slice stops go to the fake: a leaf slice is named by repo and slug, so a real stop
  // could end another test file's seat of the same name.
  const systemctl: SystemctlFixture = fakeSystemctl(f);
  return { ...f, env: { ...f.env, ...systemctl.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches, systemctl };
}
async function greenFixture(checks: Record<string, string>): Promise<GreenFixture> {
  return greenFrom(await hcFixture(), checks);
}
```

The bare remote was already created by `fixture()` (`<home>/remote.git`); green tests push config and advancer commits to it. Checks are committed AND pushed because the merge machinery reads them from the tree. `FAKE_SYSTEMD_RUN_LOG` captures every systemd-run launch (fake-systemd-run.sh runs scope/verify-pass payloads in-place, fakes service submissions) — `landLaunches(f)` (lines 71-77) filters lines containing `--unit=akrogon-land-`.

Driver helpers (lines 96-155):
- `prompts(f, skill)`: all stand-in tasks across ALL .tasks files filtered by skill prefix (e.g. 'merge-issue', 'broadcast-issue').
- `idleAll(f)`: waitFor every live seat to be finished or idle.
- `holdTurns(f, skill)`: fifo gate in the standin hook for tasks starting with `skill`.
- `next(f)` = `cli(f, ['next'], f.root, f.env)`; `land(f, slug, attempt)` = `cli(f, ['land', slug, '--attempt', attempt], f.root, f.env)`.
- `allocated(f, slug, container)`: `leaf(f, slug, 'plan.synthesis', {}, container)` then one `next`.
- `commitIn(path, name, content)`: commit into the leaf's worktree.
- `toMerge(path)`: `saveState(path, { ...readState(path), phase: 'merge', merge_stamp: '2026-10-19T00:00:00.000Z' })`.
- `claimed(f, path)` (lines 148-154): idles seats, runs one `next` (the merge pass that builds the batch, claims the holder and launches the land run), returns `{ attempt, top }` from `state.batch`:

```ts
// Claims the holder's turn through a real `next` and returns the applied attempt.
async function claimed(f: GreenFixture, path: string): Promise<{ attempt: string; top: string }> {
  await idleAll(f);
  expect((await next(f)).code).toBe(0);
  const state: State = readState(path);
  return { attempt: z.string().parse(state.batch?.attempt), top: z.string().parse(state.batch?.top) };
}
```

### The canonical test (lines 158-207, complete)

```ts
test('a green top lands with no seat', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    leaf(f, 'zz', 'plan.synthesis', {}, 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    expect(landLaunches(f)[0]).toContain(`--unit=akrogon-land-${attempt}`);
    expect(landLaunches(f)[0]).toContain(`land aa --attempt ${attempt}`);
    expect(landLaunches(f)[0]).toContain('--setenv=AKROGON_LEAF_TEMP_ROOT=');
    expect(landLaunches(f)[0]).not.toContain('HERDR_PANE_ID');
    expect(landLaunches(f)[0]).toContain('--setenv=NODE_DISABLE_COMPILE_CACHE=1');
    expect(prompts(f, 'merge-issue')).toEqual([]);
    appendFileSync(
      resolve(f.root, 'issues/timings.jsonl'),
      JSON.stringify({
        kind: 'visit_start',
        ts: new Date().toISOString(),
        repo: f.repo,
        slug: 'aa',
        phase: 'merge',
        visit: 1,
      }) + '\n',
    );
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(top);
    expect(readState(moved(path)).phase).toBe('merged');
    expect(readState(moved(path)).broadcast).toBeUndefined();
    expect(attempts(f)).toEqual(['merged']);
    const log: string[] = readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n');
    expect(JSON.parse(log.at(-1)!)).toMatchObject({
      slug: 'aa',
      from: 'merge',
      to: 'merged',
      slot: null,
      session: null,
    });
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(prompts(f, 'broadcast-issue')).toEqual([]);
    const timing: Result = await cli(f, ['timing', 'aa'], f.root, f.env);
    expect(timing.code).toBe(0);
    expect(timing.stdout).not.toContain('incomplete prompt');
  } finally {
    await f.clean();
  }
});
```

The land flow: the merge `next` pass itself launches the land run detached through systemd-run (asserted via `landLaunches`); the test then invokes `akrogon land <slug> --attempt <id>` directly as the run body would, driving the merge to `merged`. `remoteTip(f)` reads the bare remote: `git --git-dir <home>/remote.git rev-parse main`.

### Broadcast assertion (green-merge.test.ts lines 375-403)

```ts
test('a completing push hands off exactly one broadcast seat, also after a crash', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const closed: string = moved(path);
    expect(closed).toContain('issues/closed/issue-aa');
    const state: State = readState(closed);
    expect(state.phase).toBe('merged');
    expect(state.broadcast).toMatchObject({ kind: 'issue', name: 'issue-aa', pushed: top });
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    expect(prompts(f, 'broadcast-issue')[0]).toContain('owner=issue:issue-aa');
    expect(prompts(f, 'merge-issue')).toEqual([]);
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    // A crash after the owner closed and before the seat started leaves an undispatched handoff.
    saveState(closed, { ...readState(closed), prompted: {}, prompted_at: {} });
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(2);
  } finally {
    await f.clean();
  }
});
```

Broadcast is asserted two ways: (a) state field `state.broadcast` shape, (b) the stand-in task log — a `broadcast-issue <slug> slot=B owner=... closed=... sha=... sources=... leaf=...` prompt delivered exactly once (or twice after a crash+redispatch). In batch-dispatch.test.ts line 285: `expect(prompts(f).filter((prompt) => prompt.startsWith('broadcast-issue aa'))).toHaveLength(1)`.

---

## 6. Broadcast config (webhook targets) in fixture repos

No test writes broadcast webhook config. Evidence: zero matches for `webhook`, `webhook_env`, or `discord`-in-config across all of tests/. The config schema supports it (src/config.ts line 106):

```ts
broadcast: z.object({ discord: z.object({ webhook_env: z.array(text) }) }).optional(),
```

per docs/reference/config.md line 77: "`broadcast` | Optional. `discord.webhook_env` lists the environment variable names that hold Discord webhook URLs for completion updates" (repo-local issues/config.yaml, example lines 102-104).

Tests only exercise the broadcast MECHANICS: the `broadcast` leaf-state handoff (kind/name/destination/pushed/sources) and the `broadcast-issue` seat prompt. The destination string 'discord' appears only as state fixture data in status-json.test.ts line 206:

```ts
leaf(f, 'broad', 'merged', {
  broadcast: { kind: 'issue', name: 'broad', destination: 'discord', pushed: 'now', sources: [] },
});
```

If a test needs broadcast config set, the obvious pattern would be the same `yaml()` overwrite of `issues/config.yaml` used for checks (§1), e.g. `yaml(resolve(f.root, 'issues/config.yaml'), { checks: {...}, grounding: 'none', broadcast: { discord: { webhook_env: ['X'] } } })` — but no existing test does this; treat it as untested surface.

---

## 7. tests/status.test.ts and tests/status-json.test.ts

### status.test.ts — board output assertions via column slicing

Helpers (lines 19-41):

```ts
// The Listener and Watcher lines read the host's systemd user manager and hc sessions; tests/hc-status.test.ts
// covers them on a fake systemctl, so exact board comparisons here leave them out.
function withoutLiveness(stdout: string): string {
  return stdout
    .split('\n')
    .filter((line: string) => !/^(Listener|Watcher): /.test(line))
    .join('\n');
}

const columns: string[] = ['LEAF', 'PHASE', 'TIME', 'BLOCKED BY', 'NOTE', 'TURN'];
function cell(output: string, row: string, name: string): string {
  const lines: string[] = output.split('\n');
  const header: string = lines
    .slice(0, lines.indexOf(row))
    .findLast((line) => columns.every((title) => line.includes(title)))!;
  const index: number = columns.indexOf(name);
  const start: number = header.indexOf(name);
  const end: number = index + 1 < columns.length ? header.indexOf(columns[index + 1]) : row.length;
  return row.slice(start, end).trim();
}
function leafRow(output: string, slug: string): string {
  return output.split('\n').find((line) => new RegExp(`^\\s*${slug}\\s`).test(line))!;
}
```

The pattern: find the leaf's row by regex, slice columns by header positions. Representative assertions (lines 79-100):

```ts
const result: Result = await cli(f, ['status'], f.home, env);
expect(result.code).toBe(0);
const rows: string[] = result.stdout.split('\n');
const row: string = leafRow(result.stdout, 'broken');
expect(rows[0]).toContain(f.repo);
expect(rows[0]).toContain('broken');
expect(cell(result.stdout, row, 'PHASE')).toBe('failed');
const noteText: string = cell(result.stdout, row, 'NOTE');
expect(noteText).toContain('done A');
expect(noteText).toContain('A:2 B:3');
expect(noteText).toContain('fix rounds 2');
expect(cell(result.stdout, row, 'BLOCKED BY')).toBe('missing');
expect(cell(result.stdout, row, 'TIME')).toBe('0h 23m');
```

Indentation is asserted for hierarchy: `expect(rows[job].search(/\S/)).toBeGreaterThan(rows[epic].search(/\S/))`. Read-only check: `snapshot()` (status-fixture.ts) captures the whole issues dir as base64 map before and after: `expect(snapshot(resolve(f.root, 'issues'))).toEqual(before)`.

Fixture data comes from tests/status-fixture.ts: `register(f, repos)`, `event(f, slug, to, minutes)` / `mergeRecord` (log.jsonl lines), `prompt(f, slug, minutes, outcome)` (timings.jsonl lines), `log(f, lines)` / `timings(f, lines)` writers, `needs(f, slug)` (env-input record), `seedRunRecord(f, fields)` (run record yaml under `<home>/runs`).

### status-json.test.ts — full zod schema validation

The output is validated against strict schemas (lines 8-79): `leafSchema` (strict object with slug/group/phase/phase_since/first_prompt/stopped/blocked_by/broadcast_pending/land/busy_since/done/attempts/fix_rounds/verdict/delivery_errors/failure/missing/attention/waits_on/worktree/plan/red/seats/history), `repoSchema`, `envelopeSchema` (`schema: z.literal(1)`). Accessors:

```ts
function envelope(result: Result): Envelope {
  return envelopeSchema.parse(JSON.parse(result.stdout));
}
function repoOf(env: Envelope, name: string): Envelope['repos'][number] { ... }
function leafOf(env: Envelope, repo: string, slug: string): z.infer<typeof leafSchema> { ... }
```

Representative assertions (lines 224-237):

```ts
const env: Envelope = envelope(await cli(f, ['status', '--json']));
const repo = repoOf(env, f.repo);
expect(leafOf(env, f.repo, 'stopped-leaf').stopped).toBe(true);
expect(leafOf(env, f.repo, 'waiter').stopped).toBe(false);
expect(leafOf(env, f.repo, 'waiter').blocked_by).toEqual([
  { slug: 'dep-open', label: 'implement' },
  { slug: 'dep-done', label: 'merged' },
  { slug: 'resting', label: 'parked' },
  { slug: 'ghost', label: 'missing' },
]);
expect(leafOf(env, f.repo, 'broad').broadcast_pending).toBe(true);
expect(leafOf(env, f.repo, 'holder').broadcast_pending).toBe(false);
const land = leafOf(env, f.repo, 'landing').land;
expect(land).not.toBeNull();
expect(land!.unit).toBe('akrogon-land-xyz123');
```

A stopped leaf is seeded by writing `<home>/stopped.yaml` (line 199): `yaml(resolve(f.home, 'stopped.yaml'), { [`${f.repo}/stopped-leaf`]: true })`.

---

## 8. tests/timing-report.test.ts

Fixtures written: `issues/log.jsonl` (phase-move records) and `issues/timings.jsonl` (visit_start/prompt/wait/repo_pause/check_start/check_end/seat_done events), via row builders and the `records` writer (lines 18-54):

```ts
function move(f: Fixture, over: Row): Row {
  return {
    ts: ZERO, repo: f.repo, slug: 'x', from: 'plan.synthesis', to: 'implement', slot: 'A',
    attempts: { A: 0, B: 0 }, fix_rounds: 0, verdict: {}, head: 'h', diff: '', session: null,
    ...over,
  };
}
function event(f: Fixture, over: Row): Row {
  return { ts: ZERO, repo: f.repo, slug: 'x', ...over };
}
function visitStart(f: Fixture, slug: string, phase: string, visit: number, ts: string): Row {
  return event(f, { slug, kind: 'visit_start', phase, visit, ts });
}
function prompt(f: Fixture, slug: string, slot: string, phase: string, visit: number, ts: string): Row {
  return event(f, { slug, kind: 'prompt', slot, phase, visit, session: null, outcome: 'delivered', ts });
}
function records(f: Fixture, file: 'log' | 'timings' | 'merge-attempts', rows: Row[]): void {
  writeFileSync(resolve(f.root, 'issues', `${file}.jsonl`), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}
async function timing(f, args, env = {}): Promise<{...}> {
  return cli(f, ['timing', ...args], f.root, env);
}
```

Time is deterministic: `ZERO = '2026-10-11T00:00:00.000Z'`, rows use `at(minutes, seconds)` offsets. The headline test (lines 58-126) writes a full journey (failed→plan.synthesis→implement→check.review→merge→merged with waits, repo_pause on/off, check runs) and asserts EXACT stdout:

```ts
const result = await timing(f, ['t1']);
expect(result.code).toBe(0);
expect(result.stdout).toBe(
  [
    'plan.synthesis #0 40m',
    '  wait repo_pause 3m',
    '  wait parked 2m',
    '  prompted 25m',
    '  wait none 10m',
    'implement #0 10m',
    '  prompted 9m',
    '    check leaf:unit 5m',
    '  wait none 1m',
    'check.review #0 2m',
    '  prompted 1m30s',
    '  wait none 30s',
    'merge #0 8m',
    '  prompted 7m',
    '  wait none 1m',
    'merged #0 open',
  ].join('\n'),
);
```

No hc core needed — pure temp repo + file fixtures. Also uses `fakeGh` in some tests (imports it). Cohort/flow modes use `timing(f, ['--cohort', '--since', ...])` args.

---

## 9. Negative assertions: terminal NOT killed/ended/renamed

Patterns found:

A. Terminal state still live after an operation — hc-window-calls.test.ts lines 74-82 ("a failed rename leaves the seat running"):

```ts
const { f, core } = await setup('hw-fail', 'open');
core.setWindow('open', 'fail');
const stopAdopt: () => void = adopt(core);
try {
  expect((await cli(f, ['seat', 'hw-fail', 'A'], f.root, core.env)).code).toBe(0);
  const seats: Terminal[] = await core.terminals({ 'akrogon.leaf': 'hw-fail' }, false);
  expect(seats.map((t: Terminal) => t.state)).toEqual(['live']);
  const status = await cli(f, ['status', 'hw-fail'], f.root, core.env);
  expect(status.stdout).toContain('tab unnamed');
```

B. Terminal address still present / state live across passes — green-merge.test.ts lines 669-680 ("next keeps a working broadcast seat until it finishes"):

```ts
expect((await f.core.get(seatB)).status?.state).toBe('working');
expect((await next(f)).code).toBe(0);
expect((await next(f)).code).toBe(0);
expect((await f.core.get(seatB)).state).toBe('live');
...
expect((await f.core.terminals({ 'akrogon.leaf': 'aa' }, true)).map((t) => t.address)).not.toContain(seatB);
```

C. Shim log negative assertions — the hc shim record is grepped for absence:
- next.test.ts line 209 (and 2068): `expect(hcCalls(f)).toEqual([]);` — akrogon made NO hc calls at all.
- next.test.ts line 2105: `expect(readFileSync(f.core.shimLog, 'utf8')).not.toContain('invalid-tab');` — no hc call mentioned the tab.
- next.test.ts line 2131: `expect(readFileSync(f.core.shimLog, 'utf8')).toBe('');`
- hc-identity.test.ts line 775: `expect(readFileSync(core.shimLog, 'utf8')).not.toContain('w8:');`

D. App-call (rename/close) negative assertions:
- phase.test.ts line 1599: `expect(renames(f)).toEqual([]);` — no tab rename requested.
- next.test.ts line 2106: `expect(f.core.appCalls().filter((call) => call.argv.includes('invalid-tab'))).toEqual([]);`
- hc-teardown (§3): `expect(closes).toEqual(window === 'open' ? [['do', 'tab.close', '--id', tab]] : []);` — close skipped when window closed.

E. Task-count negative: `expect(f.core.tasks(a)).toHaveLength(1)` after repeated passes proves no re-prompt, and `expect(prompts(f, 'merge-issue')).toEqual([])` proves no seat ever started for that skill.

F. Surviving-terminal-by-address — next.test.ts lines 874-896 ("the surviving slot keeps its terminal"):

```ts
expect((await f.core.hc(['kill', a])).code).toBe(0);
expect((await f.core.hc(['rm', a])).code).toBe(0);
const recovered: Result = await next(f, ['exited']);
expect(recovered.code).toBe(0);
expect(readState(path).seat.B?.address).toBe(b);   // B's terminal was NOT killed/restarted
const restarted: string = z.string().parse(readState(path).seat.A?.address);
expect(restarted).not.toBe(a);
```

There is no dedicated "kill not in shim log" grep helper; tests either count/shape the full shim log or assert terminal state/address continuity.

---

## 10. tests/leaf-stop.test.ts — stop + fake systemctl

The file builds its own `stopFixture` on top of `hcFixture()`, REPLACING the fake systemctl with a shell script (lines 18-39) — because it needs argv logging plus failure injection, not unit-state simulation:

```ts
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
      'printf "%s\n" "$*" >> "$FAKE_SYSTEMCTL_LOG"',
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
```

Key detail: the fixture's own `<home>/bin` precedes the hcFixture fake-systemctl dir in PATH, so this file wins. Note the env does NOT set FAKE_SYSTEMCTL_DB, so fake-systemctl.ts would fail — hence the replacement script.

Slice assertions (lines 46-70):

```ts
function systemctlCalls(f: StopFixture): string[] {
  // Reconcile also calls the fake (list-units, reset-failed); only stop calls
  // prove the leaf's slice was stopped.
  return existsSync(f.systemctlLog)
    ? readFileSync(f.systemctlLog, 'utf8').trim().split('\n')
        .filter((line) => line.includes(' stop '))
    : [];
}

function stoppedKeys(f: StopFixture): string[] {
  const file: string = resolve(f.home, 'stopped.yaml');
  if (!existsSync(file)) return [];
  const parsed = Bun.YAML.parse(readFileSync(file, 'utf8')) as Record<string, unknown> | null;
  return Object.keys(parsed ?? {}).sort();
}
```

`slice(f, path)` uses the product's own `leafSlice({ name: state.repo }, state.slug, f.home)` from src/scope.

Representative test (lines 99-115, complete):

```ts
test('stop records the leaf, then stops its leaf slice and keeps the worktree', async () => {
  const f: StopFixture = await stopFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const worktree: string = z.string().parse(readState(path).worktree);
    const stopped: Result = await run(f, ['stop', 'build']);
    expect(stopped.code).toBe(0);
    expect(stoppedKeys(f)).toEqual([`${f.repo}/build`]);
    expect(systemctlCalls(f)).toEqual([`--user stop ${slice(f, path)}`]);
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
});
```

Failure injection (lines 174-190): `run(f, ['stop', 'build'], { FAKE_SYSTEMCTL_FAIL: slice(f, path) })` — the env var makes the script fail only for that slice; asserts non-zero exit, stderr contains slice and 'fake failure', the stopped record is STILL written, and retry succeeds with the stop logged twice.

`allocatedIdle(f, slug)` (lines 82-88): allocates via `next`, confirms delivery via `delivered(f, slug)`, then `idle(f, path)` — waits per seat with `f.core.waitFor(seat.address, (t) => t.status?.state === 'idle' && t.turn > prompted.turn)` so the seat is re-promptable.

The two fake systemctls in the repo:
- tests/fake-systemctl.ts (81 lines, bun): unit-database simulation. db = `$FAKE_SYSTEMCTL_DB` JSON `{units: [{unit, sub, cgroup?}]}`; logs every argv to `$FAKE_SYSTEMCTL_LOG`. Implements `list-units` (JSON rows, glob filter), `show` (ControlGroup), `is-active` (exit 3 when unknown), `stop`/`reset-failed` (remove units, exit 5 when stopping a unit not in db). Tests manipulate the db directly to simulate units appearing/dying, e.g. green-merge.test.ts lines 415-419: `writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: `akrogon-land-${attempt}.service`, sub: 'running' }] }))`.
- tests/fake-systemctl.sh (11 lines): logging-only variant recording whether `$FAKE_SLICE_LINK` existed at call time (deploy tests).

---

## 11. HC_TERMINAL_ID — simulating "inside a terminal"

Yes, there is a clean mechanism. `hcCore`'s env sets `HC_TERMINAL_ID: ''` (hc-fixture.ts line 360), and `cli()` passes env through — so a test overrides per-invocation by spreading the fixture env and setting `HC_TERMINAL_ID` to a real terminal address, typically a terminal the test itself started with `core.hc(['run', ...])` or a seat's recorded address.

Canonical example — door-exchange.test.ts lines 77-89 (`consult`): the door terminal is started by the test itself, then `akrogon seat` is invoked as if run from inside it:

```ts
const started = await cli(
  f,
  ['seat', '--slot', letter, '--harness', 'fake', '--model', 'work', '--effort', 'low', '--task', task],
  f.root,
  { ...core.env, HC_TERMINAL_ID: door.address },
);
expect(started.code).toBe(0);
const child: Terminal = (await core.terminals({ akrogon: '1' })).filter(
  (t: Terminal) => t.name === `${f.prefix}-slot-${letter}`,
)[0];
expect(child.parent).toBe(door.address);
```

session-reads.test.ts lines 211-226 — a negative test (inheritance must NOT drive selection):

```ts
const inherited: NodeJS.ProcessEnv = {
  ...shortStartProof,
  HC_TERMINAL_ID: otherSeat,
  HC_SESSION: f.core.session,
};
...
const named: Result = await next(f, ['target'], inherited);
```

and lines 271-284 for phase attribution:

```ts
const failed: Result = await cli(f, ['phase', 'loggy', 'failed', '--slot', 'A', '--reason', 'blocked'], worktree, {
  ...f.env,
  HC_TERMINAL_ID: b,
  HC_SESSION: f.core.session,
});
```

door-reset.test.ts lines 105-110 shows reading the seat's real environment from `/proc/<pid>/environ` when the test needs the exact HC_SESSION the terminal runs with. watch-consult.test.ts lines 81+ uses the same override pattern.

For a create verb reading HC_TERMINAL_ID for seat.A: the test can allocate the leaf so seat A exists, read `readState(path).seat.A?.address`, then invoke the create command with `{ ...f.env, HC_TERMINAL_ID: <seat A address> }` — exact same pattern as above. No extra machinery needed.

---

## 12. WAIT_MS and the event-waiting pattern

- `SUITE_TIMEOUT_MS = 120_000` (isolation.ts line 52); `WAIT_MS = SUITE_TIMEOUT_MS - 30_000` = **90_000 ms** (helpers.ts line 22). Per-test timeout budget minus 30 s slack for teardown.
- File-waiting: `readMarker(path, ms = WAIT_MS)` — 20 ms poll loop until a write-then-rename marker file has content (helpers.ts lines 24-32).
- Terminal-state waiting: `core.waitFor(address, predicate, ms = WAIT_MS)` — event-driven on `hc events --json --terminal` with snapshot-first semantics, never polling (hc-fixture.ts, see §2). Idiomatic wrappers: `seatIdle(f, address, turn)` in next.test.ts line 118; `idleAfter(turn)` in hc-delivery.test.ts lines 53-56; `idleAll(f)` in green-merge/batch-dispatch.
- Existence waiting with fs watch: `appears(path, ms = WAIT_MS)` (door-exchange.test.ts line 140) — resolves on folder change events, timer only bounds.
- Ad-hoc poll loop: `waitUntil(done, failure)` (hc-delivery.test.ts line 228) for non-file non-terminal conditions.
- Test timeouts: tests rely on the suite default; slow starts are shortened with `shortStartProof` = `{ AKROGON_START_PROOF_MS: '3000' }` passed as env (hc-fixture.ts line 304).

---

## 13. tests/command-reference.test.ts — docs validation mechanism

Yes: it validates docs/reference/commands.md against the CLI dispatcher in src/akrogon.ts. Exact mechanism (lines 8-10, 74-95):

```ts
const page: string = readFileSync(resolve(import.meta.dir, '../docs/reference/commands.md'), 'utf8');
const source: string = readFileSync(resolve(import.meta.dir, '../src/akrogon.ts'), 'utf8');
```

```ts
function checkReference(markdown: string, dispatcher: string): void {
  const dispatch: RegExpExecArray | null = /switch\s*\(verb\)\s*\{([\s\S]*)/.exec(dispatcher);
  if (dispatch === null) throw new Error('Missing CLI dispatcher');
  const verbs: string[] = [...dispatch[1].matchAll(/^\s*case\s+['"]([^'"]+)['"]\s*:/gm)].map(
    (match: RegExpMatchArray) => match[1],
  );
  const rows: CommandRow[] = commandRows(markdown);
  expect(verbs.length).toBeGreaterThan(0);
  expect(rows.map((row: CommandRow) => row.verb).sort()).toEqual([...new Set(verbs)].sort());
  for (const row of rows) {
    expect(row.effect.length).toBeGreaterThan(0);
    expect(Object.hasOwn(contracts, row.verb)).toBe(true);
    expect(argumentGroups(row.arguments)).toEqual(argumentGroups(contracts[row.verb]));
  }
}

test('the commands reference covers every dispatched command and its argument contract', () => {
  checkReference(page, source);
});
```

Three layers:
1. Verbs: every `case 'verb':` in the `switch (verb)` dispatcher of src/akrogon.ts must match the set of `| `akrogon <verb> ...` |` table rows in the markdown — exact set equality, duplicates rejected.
2. Arguments: a hardcoded `contracts` map in the TEST (lines 11-43) is the source of truth for each verb's argument shape, e.g. `next: '[<slug>|<path>|--all|--resume|--wake]'`, `stop: '<slug> | --all'`, `start: '<slug>'`, `seat: '<slug> <A|B> [--task <text>] | --slot <letter> --harness <name> --model <model> --effort <effort> [--task <text>] | --watch-consultant [--task <text>]'`. `argumentGroups` parses into optional/required groups with sorted alternatives, so reordering alternatives and reordering rows is tolerated, but changing requiredness, dropping an alternative, or splitting/merging groups fails.
3. Effect column must be non-empty.

So: the markdown is checked against BOTH the dispatcher (verb coverage) and the test-local contracts (argument shape). Adding a verb requires updating src/akrogon.ts, docs/reference/commands.md AND the contracts map in the test. Meta-tests verify the checker rejects missing/extra/duplicate rows and contract mutations.

---

## Quick reference: adding a new test on a real core

```ts
import { test, expect } from 'bun:test';
import { z } from 'zod';
import { cli, leaf, type Result } from './helpers';
import { hcFixture, stopCoresAfterFile, type HcFixture } from './hc-fixture';
import { readState, saveState } from '../src/state';

stopCoresAfterFile();

test('example', async () => {
  const f: HcFixture = await hcFixture();           // or hcFixture({ mode: 'work', window: 'open' })
  try {
    const path: string = leaf(f, 'slug', 'plan.synthesis');
    expect((await cli(f, ['next', 'slug'], f.root, f.env)).code).toBe(0);
    // drive, then assert via:
    //   f.core.terminals({ 'akrogon.leaf': 'slug' }, all?)      — terminal state
    //   f.core.waitFor(addr, (t) => ...)                        — event waiting
    //   f.core.tasks(addr)                                      — delivered tasks
    //   readFileSync(f.core.shimLog, 'utf8')                    — hc calls akrogon made
    //   f.core.appCalls()                                       — herdr-app calls
    //   readState(path) / saveState(path, {...})                — leaf state
    //   noticeFiles(f.core)                                     — attention notices
    // env override inside-a-terminal: cli(f, [...], f.root, { ...f.env, HC_TERMINAL_ID: addr })
  } finally {
    await f.clean();
  }
});
```
