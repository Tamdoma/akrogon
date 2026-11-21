// Criterion 11 (watch-any-harness, as replaced by the 2026-11-20 Corrections) plus criteria 12
// and 13, run as cells in the throwaway hc session akr-e2e-watch under readiness grants[1].
//
//   AKROGON_E2E=watch-preflight AKROGON_E2E_KIND=<claude|codex|pi|agy>
//     Free, no prompt sent: real tier, real launch flags, read the skill list and stop.
//   AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=<root|shell>
//     Free: the stand-in watcher (tests/stand-in.sh + tests/fixtures/watch-hook.sh playing the
//     model) through the same tier, proving every behavior of criteria 1-9 and 12 end to end.
//   AKROGON_E2E=watch-live AKROGON_E2E_KIND=<claude|codex|pi|agy> AKROGON_E2E_SHAPE=<root|shell>
//     Paid. root: start with its check and timer (1), one tick with its receipt and the Judge's
//     next (3), one tick held behind a busy check (4), stop with no stray tick (5), a second
//     start, then /clear (claude, agy ends it) or /new (codex, pi records the outcome) (7).
//     shell: bash in a root holding a space → start (1), one tick with receipt (3), the held
//     tick (4), agent exit leaving no new tick text (7).
//
// Writes stay under AKROGON_E2E_ROOT (must resolve inside the process TMPDIR) and
// AKROGON_E2E_OUT; no operator-home file beyond the grant-named trust entries is touched.
// Run: akrogon run-check --name watch-live-<kind>-<shape> -- env AKROGON_E2E=watch-live
//      AKROGON_E2E_KIND=<kind> AKROGON_E2E_SHAPE=<shape> AKROGON_E2E_ROOT=<tmp>
//      AKROGON_E2E_OUT=<leaf>/implementation/e2e-<kind>-<shape>
//      WATCH_TICK_SECONDS=<10 standin|30 paid>
//      bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts --test-name-pattern <pattern>
// A cell runs exactly its own test: preflight cells use the first, stand-in the second, paid
// the third (patterns 'preflight', 'standin', 'real harness').
import { test, expect } from 'bun:test';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { waitFor, type Seen } from '../../src/hc';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { answerTrust, realHome, required } from './tier';
import { observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const skill: string = resolve(import.meta.dir, '../../skills/watch-issues');
const timerScript: string = resolve(skill, 'scripts/timer.ts');
const hookSource: string = resolve(import.meta.dir, '../fixtures/watch-hook.sh');
// AKROGON_E2E_ROOT: the run's throwaway root. It must sit under a real /var/tmp-style tmp root
// (never a fixed path, never operator home): the tier's hc-socket symlink lives at
// <root>/<name>-rt/herdr-core/akr-e2e-watch.sock and the unix socket path limit is 107 bytes,
// so a deeply nested TMPDIR (like the suite preload's) would break the run. Unset: a fresh
// mktemp under /var/tmp or TMPDIR, whichever is shorter.
const leafTemp: string = realpathSync(
  process.env.AKROGON_E2E_ROOT ??
    mkdtempSync(join(['/var/tmp', process.env.TMPDIR ?? '/tmp'].sort((a, b) => a.length - b.length)[0], 'akr-e2e-')),
);
process.env.AKROGON_E2E_ROOT = leafTemp; // the tier helpers require it by name
const marker: string = 'hc timer'; // SKILL.md description marker identifying the leaf copy (13)
const intervalSec: number = Number(process.env.WATCH_TICK_SECONDS ?? '30');
const realRuntime: string = `/run/user/${process.getuid!()}`;

// Criterion 13: codex user watch-issues copies are disabled by path; entries for paths that do
// not exist are ignored (probe P3).
const codexSkillConfig: string =
  'skills.config=[' +
  ['.codex', '.agents']
    .map((dir) => `{path="${resolve(realHome, `${dir}/skills/watch-issues/SKILL.md`)}",enabled=false}`)
    .join(',') +
  ']';

const kinds: Record<string, { argv: (model: string) => string[]; trust: string | null }> = {
  claude: {
    argv: (m) => [
      'claude',
      '--model',
      m,
      '--effort',
      'low',
      '--setting-sources',
      'project,local',
      '--permission-mode',
      'dontAsk',
      '--allowedTools',
      'Bash,Read,Grep,Glob',
    ],
    trust: 'Yes, I trust this folder',
  },
  codex: {
    argv: (m) => [
      'codex',
      '--no-daemon',
      '-m',
      m,
      '-c',
      'model_reasoning_effort=low',
      '-c',
      codexSkillConfig,
      '-a',
      'never',
      '-s',
      'danger-full-access',
    ],
    trust: 'Trust and continue',
  },
  pi: {
    // --no-skills suppresses auto discovery: a same-named user skill still wins over --skill
    // when discovery is on (P1), and the operator's copy may be the old cron version (13).
    argv: (m) => [
      'pi',
      '--model',
      m,
      '--thinking',
      'low',
      '-a',
      '--exclude-tools',
      'request_user_input',
      '--no-skills',
      '--skill',
      skill,
    ],
    trust: null,
  },
  agy: {
    argv: (m) => ['agy', '--model', m, '--effort', 'low', '--mode', 'auto'],
    trust: 'Yes, I trust this folder',
  },
  standin: {
    argv: () => ['fake', '--model', 'work'],
    trust: null,
  },
};
const models: Record<string, string> = {
  claude: 'claude-haiku-5-5',
  codex: 'gpt-6.1-sol',
  pi: 'devin/swe-2-max',
  agy: 'gemini-3.8-flash-low',
  standin: 'work',
};

const termSchema = z.object({
  address: z.string(),
  name: z.string().nullable().default(null),
  state: z.string(),
  turn: z.number().int().default(0),
  pid: z.number().int().nullable().default(null),
  parent: z.string().nullable().default(null),
  labels: z.record(z.string(), z.string()),
  argv: z.array(z.string()).nullable().default(null),
  foreground: z
    .object({ pid: z.number().int(), argv: z.array(z.string()).default([]) })
    .passthrough()
    .nullable()
    .default(null),
  status: z.object({ state: z.string() }).passthrough().nullable().default(null),
});
type Term = z.infer<typeof termSchema>;

async function get(tier: WatchTier, address: string): Promise<Term> {
  const reply: SpawnResult = await tier.hc(['get', '--json', address]);
  if (reply.code !== 0) throw new Error(`hc get ${address}: ${reply.stderr}`);
  return termSchema.parse(JSON.parse(reply.stdout));
}

const gone = async (tier: WatchTier, address: string): Promise<boolean> =>
  (await tier.hc(['get', '--json', address])).code !== 0;

const idle = (t: Seen): boolean => t.status?.state === 'idle' || t.status?.state === 'done';
const screen = async (tier: WatchTier, address: string, n: number = 60): Promise<string> =>
  (await tier.hc(['read', address, '--lines', String(n)])).stdout;

async function send(tier: WatchTier, address: string, text: string): Promise<number> {
  const sent: SpawnResult = await tier.hc(['send', '--json', address, text]);
  if (sent.code !== 0) throw new Error(`hc send failed: ${JSON.stringify(sent)}`);
  return z.object({ turn: z.number() }).parse(JSON.parse(sent.stdout)).turn;
}

async function turnDone(tier: WatchTier, address: string, turn: number, ms: number): Promise<void> {
  const seen: Seen | null = await waitFor(session, address, (t: Seen) => t.turn > turn && idle(t), ms);
  if (seen === null) {
    const term: Term = await get(tier, address);
    throw new Error(`${address} never finished turn ${turn}: ${JSON.stringify(term)}\n${await screen(tier, address)}`);
  }
}

// A model's status flaps to idle mid-think, so a turn is only done once idle/done has held.
async function settleIdle(tier: WatchTier, address: string, ms: number): Promise<void> {
  const deadline: number = Date.now() + ms;
  let held: number = 0;
  while (Date.now() < deadline) {
    const term: Term = await get(tier, address);
    const quiet: boolean = term.status === null || term.status.state === 'idle' || term.status.state === 'done';
    held = quiet ? held + 1 : 0;
    if (held >= 3) return;
    await Bun.sleep(1000);
  }
  throw new Error(`${address} never stayed idle`);
}

// The wrapper logs `call <argv> t=<watcher turn>` per akrogon invocation, holds one `status`
// call while <flags>/hold-status exists, then forwards to the tier shim. The call line is
// written first and the flag removed before the sleep: a model that wraps the check in
// `timeout` (codex does: `timeout 30s akrogon status`) would otherwise kill the sleep and keep
// every later status call unlogged under a leftover flag.
function logbin(tier: WatchTier, name: string, flags: string): { bin: string; calls: string } {
  const bin: string = resolve(leafTemp, `${name}-logbin`);
  const calls: string = resolve(tier.out, `${name}-calls.log`);
  mkdirSync(bin, { recursive: true });
  writeFileSync(calls, '');
  mkdirSync(flags, { recursive: true });
  writeFileSync(
    resolve(bin, 'akrogon'),
    `#!/bin/sh
turn=$(hc get --json "$HC_TERMINAL_ID" 2>/dev/null | grep -o '"turn":[0-9]*' | head -1 | cut -d: -f2)
echo "call $* t=\${turn:-?}" >> '${calls}'
if [ "$1" = "status" ] && [ -f '${flags}/hold-status' ]; then
  held=$(cat '${flags}/hold-status')
  rm -f '${flags}/hold-status'
  sleep "$held"
fi
exec '${tier.shimBin}/akrogon' "$@"
`,
  );
  Bun.spawnSync(['chmod', '+x', resolve(bin, 'akrogon')]);
  return { bin, calls };
}

const calls = (file: string): string[] =>
  existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
const statusCalls = (file: string): number => calls(file).filter((l) => l.startsWith('call status')).length;
const nextCalls = (file: string): number => calls(file).filter((l) => l.startsWith('call next')).length;
const hookLines = (tier: WatchTier, watcher: string): string[] => {
  const file: string = resolve(tier.standin, `${watcher}.hooks`);
  return existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
};

async function labelled(tier: WatchTier): Promise<Term[]> {
  const listed = z
    .object({ terminals: z.array(termSchema) })
    .parse(await tier.rpc('terminal.list', { all: true, labels: { 'akrogon.watch-timer': 'akre2e' } }));
  return listed.terminals.filter((t) => t.state === 'live');
}

async function waitCalls(file: string, match: (l: string) => boolean, n: number, ms: number): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    if (calls(file).filter(match).length >= n) return;
    await Bun.sleep(500);
  }
  throw new Error(`calls never reached ${n}: ${JSON.stringify(calls(file))}`);
}

// Receipts land before the check call, so a bare count can be satisfied by a call that was
// already in flight. Wait for a `call <name>` at a watcher turn after every call logged so
// far — each check runs in its own task turn, so a newer turn is the new check's call.
async function waitCallAfter(file: string, name: string, ms: number): Promise<void> {
  const last: number = calls(file).reduce(
    (m: number, l: string) => Math.max(m, Number(/ t=(\d+)/.exec(l)?.[1] ?? '0')),
    0,
  );
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    if (calls(file).some((l: string) => l.startsWith(`call ${name}`) && Number(/ t=(\d+)/.exec(l)?.[1] ?? '0') > last))
      return;
    await Bun.sleep(500);
  }
  throw new Error(`no call ${name} after t=${last}: ${JSON.stringify(calls(file))}`);
}

// Wait for a hook line at index `from` or later (default 0). Restarts and repeated sends emit
// the same line a second time, so callers pass the log length taken before the send — matching
// an older line would let the test assert on state that has not landed yet.
async function waitHook(
  tier: WatchTier,
  watcher: string,
  match: RegExp,
  ms: number,
  from: number = 0,
): Promise<number> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const lines: string[] = hookLines(tier, watcher);
    const hit: number = lines.slice(from).findIndex((l) => match.test(l));
    if (hit >= 0) return hit + from;
    await Bun.sleep(500);
  }
  throw new Error(`hook line ${match} never appeared: ${JSON.stringify(hookLines(tier, watcher))}`);
}

// The receipt label is monotonic (each check stamps its due): a fast watcher can push it past
// the asked due before the first poll, so due n is proven delivered by label >= n, not == n.
async function waitDue(tier: WatchTier, timer: string, due: number, ms: number): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const t: Term = await get(tier, timer);
    if (Number(t.labels['akrogon.watch-due'] ?? '0') >= due) return;
    await Bun.sleep(500);
  }
  const term: Term = await get(tier, timer);
  throw new Error(
    `receipt due=${due} missing: ${JSON.stringify(term)}\n-- timer screen --\n${await screen(tier, timer)}\n-- watcher screen --\n${await screen(tier, term.parent ?? '')}`,
  );
}

async function waitGone(tier: WatchTier, address: string, ms: number): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await gone(tier, address)) return;
    await Bun.sleep(500);
  }
  throw new Error(`${address} still live: ${await screen(tier, address)}`);
}

// A failed cell records the watcher screen and each timer's printed reason into the out folder.
async function failRecord(tier: WatchTier, watcher: string, timers: string[]): Promise<void> {
  if (watcher !== '') tier.record('watcher-screen.txt', await screen(tier, watcher, 80));
  for (const timer of timers) {
    if (!(await gone(tier, timer))) tier.record(`timer-screen-${timer}.txt`, await screen(tier, timer, 80));
  }
}

// Removes the trust entries a run may have written for the throwaway root (grant cleanup).
async function dropTrust(tier: WatchTier, root: string): Promise<void> {
  const notes: string[] = [];
  const codexCfg: string = resolve(realHome, '.codex/config.toml');
  if (existsSync(codexCfg)) {
    const text: string = readFileSync(codexCfg, 'utf8');
    const kept: string[] = [];
    let skipping: boolean = false;
    for (const line of text.split('\n')) {
      if (line.startsWith('[')) skipping = line.includes(`projects."${root}"`);
      if (!skipping) kept.push(line);
    }
    if (text !== kept.join('\n')) {
      writeFileSync(codexCfg, kept.join('\n'));
      notes.push('codex trust entry removed');
    }
  }
  const agyCfg: string = resolve(realHome, '.gemini/antigravity-cli/settings.json');
  if (existsSync(agyCfg)) {
    const parsed = z
      .object({ trustedWorkspaces: z.array(z.string()).default([]) })
      .passthrough()
      .parse(JSON.parse(readFileSync(agyCfg, 'utf8')));
    if (parsed.trustedWorkspaces.includes(root)) {
      parsed.trustedWorkspaces = parsed.trustedWorkspaces.filter((w) => w !== root);
      writeFileSync(agyCfg, JSON.stringify(parsed, null, 2));
      notes.push('agy trustedWorkspaces entry removed');
    }
  }
  const claudeCfg: string = resolve(realHome, '.claude.json');
  if (existsSync(claudeCfg)) {
    const parsed = z
      .object({ projects: z.record(z.string(), z.unknown()).default({}) })
      .passthrough()
      .parse(JSON.parse(readFileSync(claudeCfg, 'utf8')));
    if (Object.hasOwn(parsed.projects, root)) {
      delete parsed.projects[root];
      writeFileSync(claudeCfg, JSON.stringify(parsed, null, 2));
      notes.push('claude trust entry removed');
    }
  }
  tier.record('trust-cleanup.txt', notes.length === 0 ? 'no trust entries\n' : `${notes.join('\n')}\n`);
}

// Waits for the watcher to become ready, typing Enter when a shell shows the launch line
// unsubmitted. Returns once the agent actually runs: a trust dialog on screen, hc detecting the
// agent (status set), or a foreground other than the shell.
async function launchFromShell(tier: WatchTier, watcher: string, line: string, trust: string | null): Promise<void> {
  await send(tier, watcher, line);
  const shellPid: number | null = (await get(tier, watcher)).foreground?.pid ?? null;
  const deadline: number = Date.now() + 90_000;
  let entered: boolean = false;
  while (Date.now() < deadline) {
    const term: Term = await get(tier, watcher);
    if (term.status !== null) return;
    if (term.foreground !== null && term.foreground.pid !== shellPid) return;
    const shown: string = await screen(tier, watcher, 30);
    if (trust !== null && shown.includes(trust)) return;
    if (!entered && shown.trimEnd().endsWith(line)) {
      await tier.hc(['keys', watcher, 'enter']);
      entered = true;
    }
    if (!entered && /\$\s*$/.test(shown.trimEnd()) && !shown.includes(line)) {
      await tier.hc(['keys', watcher, 'enter']);
      entered = true;
    }
    await Bun.sleep(1000);
  }
  throw new Error(`shell launch never started: ${await screen(tier, watcher)}`);
}

type Cell = {
  tier: WatchTier;
  bin: string;
  watcher: string;
  callLog: string;
  flags: string;
  kind: string;
  shape: string;
  timers: string[];
};

async function setupCell(kind: string, shape: string): Promise<Cell> {
  const name: string = `akr-e2e-watch-${kind}-${shape}`;
  const rootName: string = shape === 'shell' ? `${name} sp` : name;
  const tier: WatchTier = await startWatchTier(
    name,
    {
      a: { harness: 'fake', model: 'idle', effort: 'low' },
      b: { harness: 'fake', model: 'idle', effort: 'low' },
    },
    { fake: 'fake --model {model} --effort {effort}' },
    { rootName },
  );
  const flags: string = resolve(leafTemp, `${name}-flags`);
  const { bin, calls: callLog } = logbin(tier, name, flags);
  tier.record('cwds.json', [tier.root, leafTemp]);
  process.env.XDG_RUNTIME_DIR = tier.runtime;
  return { tier, bin, watcher: '', callLog, flags, kind, shape, timers: [] };
}

// Skill wiring per criterion 13; the model-playing hook is installed for stand-in cells only.
async function wireSkill(cell: Cell): Promise<void> {
  const root: string = cell.tier.root;
  if (cell.kind === 'claude') {
    mkdirSync(resolve(root, '.claude/skills'), { recursive: true });
    symlinkSync(skill, resolve(root, '.claude/skills/watch-issues'));
  } else if (cell.kind === 'agy') {
    // agy 1.5.13 does not follow a symlinked workspace skill (its /skills list omits it and
    // falls back to the global copy); a real directory is listed and shadows the global one
    // (P1, and the agy preflight). The copy must be shallow: SKILL.md is copied so the listing
    // carries the marker, while scripts/ etc. stay symlinks into the leaf — a real copy of
    // scripts would break their `../../../src/shell` imports from the tier root.
    const agyDir: string = resolve(root, '.agents/skills/watch-issues');
    mkdirSync(agyDir, { recursive: true });
    cpSync(resolve(skill, 'SKILL.md'), resolve(agyDir, 'SKILL.md'));
    for (const entry of ['scripts', 'package.json', 'tsconfig.json', 'bun.lock'])
      symlinkSync(resolve(skill, entry), resolve(agyDir, entry));
  } else if (cell.kind === 'codex') {
    mkdirSync(resolve(root, '.agents/skills'), { recursive: true });
    symlinkSync(skill, resolve(root, '.agents/skills/watch-issues'));
  }
  if (cell.kind === 'standin') {
    writeFileSync(resolve(cell.tier.standin, 'hook'), readFileSync(hookSource));
    Bun.spawnSync(['chmod', '+x', resolve(cell.tier.standin, 'hook')]);
  }
}

function launchEnvFor(cell: Cell): string[] {
  const envs: string[] = [
    `XDG_RUNTIME_DIR=${cell.tier.runtime}`,
    `HOME=${realHome}`,
    `PATH=${cell.bin}:${cell.tier.shimBin}:${cell.tier.corePath}`,
    `WATCH_TICK_SECONDS=${intervalSec}`,
    `WATCH_SKILLDIR=${skill}`,
    `WATCH_ROOT=${cell.tier.root}`,
  ];
  if (cell.kind === 'standin') envs.push(`STANDIN_DIR=${cell.tier.standin}`);
  return envs;
}

// Launches the watcher for the cell's shape (root: as the terminal's program; shell: typed into
// bash through a launch script, so argv quoting can't be mangled), answers trust, sends
// `watch-issues <root>` and waits out the model's start step. Returns the verified timer.
async function startCell(cell: Cell): Promise<Term> {
  const spec = kinds[cell.kind];
  const model: string = process.env.AKROGON_E2E_WATCHER_MODEL ?? models[cell.kind];
  const launchEnv: string[] = launchEnvFor(cell);
  const readyTimeout: number = cell.kind === 'standin' ? 60_000 : 120_000;
  let watcher: string;
  if (cell.shape === 'shell') {
    const run: SpawnResult = await cell.tier.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'akr-e2e-watcher',
      '--cwd',
      cell.tier.root,
      '--',
      '/usr/bin/env',
      ...launchEnv,
      'bash',
    ]);
    expect(run.code).toBe(0);
    watcher = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    cell.watcher = watcher;
    await Bun.sleep(1000);
    const ready: Promise<Seen | null> = waitFor(session, watcher, idle, readyTimeout);
    const launchSh: string = resolve(leafTemp, `launch-${cell.kind}-${cell.shape}.sh`);
    const q = (s: string): string => `'${s.replaceAll(`'`, `'\\''`)}'`;
    writeFileSync(launchSh, `#!/bin/sh\nexec env ${launchEnv.map(q).join(' ')} ${spec.argv(model).map(q).join(' ')}\n`);
    Bun.spawnSync(['chmod', '+x', launchSh]);
    await launchFromShell(cell.tier, watcher, `sh ${q(launchSh)}`, spec.trust);
    if (spec.trust !== null) await answerTrust(cell.tier, 'watcher', async () => watcher, spec.trust, ready);
    expect(await ready).not.toBeNull();
  } else {
    const run: SpawnResult = await cell.tier.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'akr-e2e-watcher',
      '--cwd',
      cell.tier.root,
      '--',
      '/usr/bin/env',
      ...launchEnv,
      ...spec.argv(model),
    ]);
    expect(run.code).toBe(0);
    watcher = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    cell.watcher = watcher;
    const ready: Promise<Seen | null> = waitFor(session, watcher, idle, readyTimeout);
    if (spec.trust !== null) await answerTrust(cell.tier, 'watcher', async () => watcher, spec.trust, ready);
    expect(await ready).not.toBeNull();
  }
  const startTurn: number = await send(cell.tier, watcher, `watch-issues ${cell.tier.root}`);
  if (cell.kind === 'standin') {
    // The hook logs the script outcome per task; wait for its start line, then its status call.
    await waitHook(cell.tier, watcher, /start exit=0 (started|running)/, 60_000);
  } else {
    await turnDone(cell.tier, watcher, startTurn, 300_000);
    await settleIdle(cell.tier, watcher, 60_000);
  }
  cell.tier.record('start-screen.txt', await screen(cell.tier, watcher));
  return verifiedTimer(cell);
}

// One live labelled terminal named aw-watch whose argv runs the leaf's timer.ts by absolute
// path, parented to the watcher (criteria 1, 13).
async function verifiedTimer(cell: Cell): Promise<Term> {
  const timers: Term[] = await labelled(cell.tier);
  expect(timers).toHaveLength(1);
  const timer: Term = timers[0];
  cell.timers.push(timer.address);
  expect(timer.name).toBe('aw-watch');
  expect(timer.parent).toBe(cell.watcher);
  const argv: string = z.string().parse(timer.argv?.join(' '));
  expect(argv).toContain(timerScript);
  return timer;
}

// Kill the watcher's foreground (the agent) and wait until the shell shows it gone.
async function exitAgent(cell: Cell): Promise<number> {
  const wTerm: Term = await get(cell.tier, cell.watcher);
  const agentPid: number = z.number().parse(wTerm.foreground?.pid);
  process.kill(agentPid, 'SIGTERM');
  const deadline: number = Date.now() + 15_000;
  while ((await get(cell.tier, cell.watcher)).foreground?.pid === agentPid && Date.now() < deadline)
    await Bun.sleep(300);
  if ((await get(cell.tier, cell.watcher)).foreground?.pid === agentPid) process.kill(agentPid, 'SIGKILL');
  return agentPid;
}

// The baseline is taken by the caller's placement: a tick landing after the screen count but
// before the timer dies still shows in `ms`, because a count can only lose text (redraws
// shrink the screen) — a new line makes the count rise, a redraw never does. So the end
// count must not exceed the baseline, never equal it.
async function noNewTicks(cell: Cell, atStart: number, ms: number): Promise<void> {
  const count = async (): Promise<number> =>
    ((await screen(cell.tier, cell.watcher)).match(/watch-issues tick /g) ?? []).length;
  await Bun.sleep(ms);
  expect(await count()).toBeLessThanOrEqual(atStart);
}

// A probe tick that must run no check: wait for the hook's `tick exit=` boundary, then read the
// task's own hook block (up to the next boundary) — a check would have written `status` inside.
async function tickRunsNoCheck(cell: Cell, text: string, boundary: RegExp): Promise<string[]> {
  const watcher: string = cell.watcher;
  const base: number = hookLines(cell.tier, watcher).length;
  await send(cell.tier, watcher, text);
  const deadline: number = Date.now() + 60_000;
  let idx: number = -1;
  while (Date.now() < deadline && idx === -1) {
    idx = hookLines(cell.tier, watcher)
      .slice(base)
      .findIndex((l) => boundary.test(l));
    if (idx >= 0) idx += base;
    else await Bun.sleep(500);
  }
  if (idx === -1) throw new Error(`no ${boundary} in ${JSON.stringify(hookLines(cell.tier, watcher))}`);
  const tail: string[] = hookLines(cell.tier, watcher).slice(idx);
  const end: number = tail.slice(1).findIndex((l) => /exit=|ignored |skipped /.test(l));
  const own: string[] = end === -1 ? tail : tail.slice(0, end + 1);
  expect(own.some((l) => l.startsWith('status '))).toBe(false);
  return own;
}

async function teardownCell(cell: Cell): Promise<void> {
  await dropTrust(cell.tier, cell.tier.root);
  const left: string[] = await stopWatchTier(cell.tier, [leafTemp]);
  cell.tier.record('absence.json', { left });
  expect(left).toEqual([]);
}

// Writes stay under the run's AKROGON_E2E_ROOT and AKROGON_E2E_OUT: an operator-supplied root
// must live under a tmp root (/var/tmp, /tmp or the suite's TMPDIR) so logbins, flags and
// launch scripts never land outside temp space, and the socket-link path must fit the unix
// limit with the longest cell name.
function tmpdirGuard(): void {
  const allowed: string[] = [realpathSync(process.env.TMPDIR ?? '/tmp'), '/var/tmp', '/tmp'];
  expect(allowed.some((dir) => leafTemp === dir || leafTemp.startsWith(`${dir}/`))).toBe(true);
  const longest: string = resolve(leafTemp, 'akr-e2e-watch-standin-shell-rt/herdr-core/akr-e2e-watch.sock');
  expect(Buffer.byteLength(longest) < 107, `socket path too long: ${longest}`).toBe(true);
}

// ---------------------------------------------------------------------------
// Preflight cells (criterion 13): real tier + real launch flags, no prompt sent.

test.serial(
  'watch preflight: the leaf skill is the only watch-issues the harness sees',
  async () => {
    expect(required('AKROGON_E2E')).toBe('watch-preflight');
    const kind = z.enum(['claude', 'codex', 'pi', 'agy']).parse(required('AKROGON_E2E_KIND'));
    tmpdirGuard();
    const cell: Cell = await setupCell(kind, 'preflight');
    try {
      await observeReady(cell.tier);
      await wireSkill(cell);
      const spec = kinds[kind];
      const run: SpawnResult = await cell.tier.hc([
        'run',
        '--bg',
        '--json',
        '--name',
        'akr-e2e-preflight',
        '--cwd',
        cell.tier.root,
        '--',
        '/usr/bin/env',
        ...launchEnvFor(cell),
        ...spec.argv(models[kind]),
      ]);
      expect(run.code).toBe(0);
      cell.watcher = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
      const ready: Promise<Seen | null> = waitFor(session, cell.watcher, idle, 120_000);
      if (spec.trust !== null) await answerTrust(cell.tier, 'watcher', async () => cell.watcher, spec.trust, ready);
      expect(await ready).not.toBeNull();

      if (kind === 'pi') {
        const shown: string = await screen(cell.tier, cell.watcher);
        cell.tier.record('preflight.txt', shown);
        expect(shown).not.toContain('watch-issues collision');
      } else if (kind === 'codex') {
        // codex debug prompt-input renders the model-visible input with the same config and cwd;
        // its skills entry lists the enabled copies. The cell's own argv runs the identical -c.
        const probe: SpawnResult = await spawnCaptured(['codex', 'debug', 'prompt-input', '-c', codexSkillConfig], {
          cwd: cell.tier.root,
          env: { ...process.env, HOME: realHome, XDG_RUNTIME_DIR: realRuntime },
        });
        cell.tier.record('preflight.txt', `${probe.code}\n${probe.stdout}\n${probe.stderr}`);
        cell.tier.record('preflight-screen.txt', await screen(cell.tier, cell.watcher));
        expect(probe.code).toBe(0);
        expect(probe.stdout).toContain('watch-issues');
        expect(probe.stdout).toContain(marker);
        expect(probe.stdout).toContain(cell.tier.root);
      } else if (kind === 'agy') {
        // /skills is a client-side overlay (no prompt); the workspace copy must carry the
        // marker and shadow the same-named global one: exactly one watch-issues entry lists.
        await cell.tier.hc(['keys', cell.watcher, '/', 's', 'k', 'i', 'l', 'l', 's', 'enter']);
        await Bun.sleep(5000);
        const shown: string = await screen(cell.tier, cell.watcher);
        cell.tier.record('preflight.txt', shown);
        expect(shown).toContain(marker);
        expect(shown.match(/watch-issues/g) ?? []).toHaveLength(1);
      } else {
        // claude: the project skills link resolves into the leaf and carries the marker; the
        // screen shows no skill-load error. The paid cell's timer argv is the runtime proof.
        const shown: string = await screen(cell.tier, cell.watcher);
        cell.tier.record('preflight.txt', shown);
        expect(shown).not.toMatch(/skill.*(error|fail)/i);
        expect(realpathSync(resolve(cell.tier.root, '.claude/skills/watch-issues'))).toBe(skill);
        expect(readFileSync(resolve(cell.tier.root, '.claude/skills/watch-issues/SKILL.md'), 'utf8')).toContain(marker);
      }
      await teardownCell(cell);
    } catch (error) {
      await failRecord(cell.tier, cell.watcher, cell.timers).catch(() => {});
      await teardownCell(cell).catch(() => {});
      throw error;
    }
  },
  300_000,
);

// ---------------------------------------------------------------------------
// Stand-in cells (free): the full mechanical sequence on real hc through the tier.

test.serial(
  'watch standin cell: criteria 1-9 and 12 end to end',
  async () => {
    expect(required('AKROGON_E2E')).toBe('watch-live');
    expect(required('AKROGON_E2E_KIND')).toBe('standin');
    const shape = z.enum(['root', 'shell']).parse(required('AKROGON_E2E_SHAPE'));
    tmpdirGuard();
    const cell: Cell = await setupCell('standin', shape);
    const { tier, callLog } = cell;
    try {
      // Criterion 12: the worktree store is its own folder, apart from root, runtime and helpers.
      const configured = z
        .object({ worktree_root: z.string() })
        .parse(Bun.YAML.parse(readFileSync(resolve(tier.root, 'issues/config.yaml'), 'utf8')));
      expect(tier.paths).toContain(configured.worktree_root);
      expect(tier.root).not.toBe(configured.worktree_root);
      expect(tier.runtime).not.toBe(configured.worktree_root);
      expect(tier.standin).not.toBe(configured.worktree_root);
      await observeReady(tier);
      await wireSkill(cell);
      const leafPath: string = resolve(tier.root, 'issues/open/e2e', 'watch-live-leaf');
      mkdirSync(leafPath, { recursive: true });
      await Bun.write(
        resolve(leafPath, 'state.yaml'),
        Bun.YAML.stringify({
          slug: 'watch-live-leaf',
          phase: 'plan.synthesis',
          created: '2026-11-20',
          repo: 'akre2e',
          'blocked-by': [],
        }),
      );

      if (shape === 'shell') {
        // Paused start: the timer still starts (criterion 8: starting is not an act on a leaf).
        const paused0: SpawnResult = await tier.akrogon(['pause']);
        expect(paused0.code).toBe(0);
        const timer: Term = await startCell(cell);
        await waitCalls(callLog, (l) => l.startsWith('call status'), 1, 30_000);
        expect(nextCalls(callLog)).toBe(0); // the paused check acts on nothing

        // Criterion 12: the tier socket keeps answering after a real akrogon unpause.
        const unpaused: SpawnResult = await tier.akrogon(['unpause']);
        expect(unpaused.code).toBe(0);
        const listed: SpawnResult = await tier.hc(['ls', '--json']);
        expect(listed.code).toBe(0);
        tier.record('after-unpause.txt', listed.stdout);

        // One tick with its receipt and the acting check (3). Due 1's calls are attributed
        // by a newer turn: the receipt lands before the check call.
        await waitDue(tier, timer.address, 1, 90_000);
        await waitCallAfter(callLog, 'next', 90_000);

        // A due that falls due while the previous check runs is held, then runs once (4):
        // hold due 2's status call across an interval boundary; due 3 accrues and is sent once.
        writeFileSync(resolve(cell.flags, 'hold-status'), String(intervalSec * 2 + 5));
        await waitDue(tier, timer.address, 2, 90_000);
        await waitDue(tier, timer.address, 3, 90_000 + intervalSec * 2000);
        await waitCallAfter(callLog, 'status', 90_000); // due 3's check, not the held call
        const timerScreen: string = await screen(tier, timer.address);
        expect(timerScreen.match(/due=3 sent/g) ?? []).toHaveLength(1);
        expect(timerScreen).not.toContain('due=3 dropped');

        // Pause again: the next due receipts and checks but acts on nothing (8).
        const paused1: SpawnResult = await tier.akrogon(['pause']);
        expect(paused1.code).toBe(0);
        const beforeNext: number = nextCalls(callLog);
        await waitDue(tier, timer.address, 4, 90_000);
        await waitCallAfter(callLog, 'status', 90_000);
        await Bun.sleep(2500); // a would-be next call lands right after its status call
        expect(nextCalls(callLog)).toBe(beforeNext);

        // Agent exit leaves no new tick text in the shell (7). Baseline right after the
        // exit completes: a tick sent in the exit window lands inside the wait below, and
        // dead-agent screens only lose text, so `<=` is the invariant.
        await exitAgent(cell);
        await waitGone(tier, timer.address, 60_000);
        const ticksAtExit: number = ((await screen(tier, cell.watcher)).match(/watch-issues tick /g) ?? []).length;
        await noNewTicks(cell, ticksAtExit, intervalSec * 1000 + 15_000);
        await teardownCell(cell);
        return;
      }

      // shape=root: start with its check and verified timer (1).
      const timer: Term = await startCell(cell);
      await waitCalls(callLog, (l) => l.startsWith('call status'), 1, 30_000);
      const wTerm: Term = await get(tier, cell.watcher);
      const pinPid: number = z.number().parse(wTerm.foreground?.pid);
      expect(z.string().parse(timer.argv?.join(' '))).toContain(`--pin-pid ${pinPid}`);

      // Second start: one more check, still one timer (2).
      await send(tier, cell.watcher, `watch-issues ${tier.root}`);
      await waitHook(tier, cell.watcher, /start exit=0 running/, 60_000);
      await waitCalls(callLog, (l) => l.startsWith('call status'), 2, 30_000);
      expect(await labelled(tier)).toHaveLength(1);

      // One tick per due with its receipt and the Judge's next on the waiting leaf (3, 11).
      // Due 1's calls are attributed by a newer turn: the receipt lands before the check call.
      await waitDue(tier, timer.address, 1, 90_000);
      await waitCallAfter(callLog, 'status', 90_000);
      await waitCallAfter(callLog, 'next', 90_000);
      expect(hookLines(tier, cell.watcher).some((l) => l === 'receipt=1')).toBe(true);

      // One tick held behind a busy check (4): due 2's status call is held while due 3 accrues.
      writeFileSync(resolve(cell.flags, 'hold-status'), String(intervalSec * 2 + 5));
      await waitDue(tier, timer.address, 2, 90_000);
      await waitDue(tier, timer.address, 3, 90_000 + intervalSec * 2000);
      await waitCallAfter(callLog, 'status', 90_000); // due 3's check, not the held call
      const heldScreen: string = await screen(tier, timer.address);
      expect(heldScreen.match(/due=3 sent/g) ?? []).toHaveLength(1);
      expect(heldScreen).not.toContain('due=3 dropped');

      // Pause: the next due receipts and checks but acts on nothing; unpause resumes (8, 12).
      const paused: SpawnResult = await tier.akrogon(['pause']);
      expect(paused.code).toBe(0);
      const beforeNext: number = nextCalls(callLog);
      await waitDue(tier, timer.address, 4, 90_000);
      await waitCallAfter(callLog, 'status', 90_000);
      await Bun.sleep(2500); // a would-be next call lands right after its status call
      expect(nextCalls(callLog)).toBe(beforeNext);
      const unpaused: SpawnResult = await tier.akrogon(['unpause']);
      expect(unpaused.code).toBe(0);
      const listed: SpawnResult = await tier.hc(['ls', '--json']);
      expect(listed.code).toBe(0); // criterion 12: the socket still answers
      await waitDue(tier, timer.address, 5, 90_000);
      await waitCallAfter(callLog, 'next', 90_000);

      // Old cron tick (no timer=): refused with a reason, no check (6, 14).
      await tickRunsNoCheck(cell, `watch-issues tick ${tier.root}`, /tick exit=\d+ no-watch (?!t=)\S/);
      // Stale due refused (6).
      await tickRunsNoCheck(
        cell,
        `watch-issues tick timer=${timer.address} pid=${pinPid} due=1 ${tier.root}`,
        /tick exit=\d+ no-watch stale/,
      );

      // Forged pid: the tick's pid mismatches the watcher → the timer is stopped, no check (6).
      const forged: string[] = await tickRunsNoCheck(
        cell,
        `watch-issues tick timer=${timer.address} pid=${pinPid + 40000} due=99 ${tier.root}`,
        /tick exit=0 stopped/,
      );
      expect(forged.some((l) => /stopped/.test(l))).toBe(true);
      await waitGone(tier, timer.address, 60_000);

      // Restart: a new verified timer at a new address; a tick naming the old one runs nothing (5).
      const restartFrom: number = hookLines(tier, cell.watcher).length;
      await send(tier, cell.watcher, `watch-issues ${tier.root}`);
      await waitHook(tier, cell.watcher, /start exit=0 started/, 60_000, restartFrom);
      const timer2: Term = await verifiedTimer(cell);
      expect(timer2.address).not.toBe(timer.address);
      await tickRunsNoCheck(
        cell,
        `watch-issues tick timer=${timer.address} pid=${pinPid} due=99 ${tier.root}`,
        /tick exit=\d+ no-watch (?!t=)\S/,
      );

      // Stop, repeated stop (5); the terminal-program exit then ends the timer (7).
      await send(tier, cell.watcher, `watch-issues stop ${tier.root}`);
      await waitHook(tier, cell.watcher, /stop exit=0/, 60_000);
      await waitGone(tier, timer2.address, 60_000);
      await send(tier, cell.watcher, `watch-issues stop ${tier.root}`);
      for (
        let n: number = 0;
        n < 60 && hookLines(tier, cell.watcher).filter((l) => /stop exit=0/.test(l)).length < 2;
        n += 1
      )
        await Bun.sleep(500);
      expect(hookLines(tier, cell.watcher).filter((l) => /stop exit=0/.test(l)).length).toBeGreaterThanOrEqual(2);

      // Agent exit: the pinned program dies; a fresh timer exits on its own (no send).
      const lastFrom: number = hookLines(tier, cell.watcher).length;
      await send(tier, cell.watcher, `watch-issues ${tier.root}`);
      await waitHook(tier, cell.watcher, /start exit=0 started/, 60_000, lastFrom);
      const timer3: Term = await verifiedTimer(cell);
      const agentPid: number = z.number().parse((await get(tier, cell.watcher)).foreground?.pid);
      process.kill(agentPid, 'SIGTERM');
      await waitGone(tier, timer3.address, 60_000);
      await teardownCell(cell);
    } catch (error) {
      await failRecord(tier, cell.watcher, cell.timers).catch(() => {});
      await teardownCell(cell).catch(() => {});
      throw error;
    }
  },
  420_000,
);

// ---------------------------------------------------------------------------
// Paid cells (criterion 11 as corrected): the smallest sequence a real harness must show.

test.serial(
  'watch live cell: a real harness in the tier',
  async () => {
    expect(required('AKROGON_E2E')).toBe('watch-live');
    const kindRaw: string = required('AKROGON_E2E_KIND');
    expect(kindRaw).not.toBe('standin');
    const kind = z.enum(['claude', 'codex', 'pi', 'agy']).parse(kindRaw);
    const shape = z.enum(['root', 'shell']).parse(required('AKROGON_E2E_SHAPE'));
    tmpdirGuard();
    const cell: Cell = await setupCell(kind, shape);
    const { tier, callLog } = cell;
    try {
      await observeReady(tier);
      await wireSkill(cell);
      const leafPath: string = resolve(tier.root, 'issues/open/e2e', 'watch-live-leaf');
      mkdirSync(leafPath, { recursive: true });
      await Bun.write(
        resolve(leafPath, 'state.yaml'),
        Bun.YAML.stringify({
          slug: 'watch-live-leaf',
          phase: 'plan.synthesis',
          created: '2026-11-20',
          repo: 'akre2e',
          'blocked-by': [],
        }),
      );
      const timer: Term = await startCell(cell);

      if (shape === 'shell') {
        // start (1), one tick with its receipt (3). Due 1's status call is attributed by a
        // newer turn: the receipt lands before the check call.
        expect(statusCalls(callLog)).toBeGreaterThanOrEqual(1);
        await waitDue(tier, timer.address, 1, 120_000);
        await waitCallAfter(callLog, 'status', 120_000);
        // One tick held behind a busy check, running once after it (4): due 2's check is held
        // while due 3 accrues; it is sent once after the check and runs its own check.
        writeFileSync(resolve(cell.flags, 'hold-status'), String(intervalSec * 2 + 15));
        await waitDue(tier, timer.address, 2, 120_000);
        await waitDue(tier, timer.address, 3, 120_000 + intervalSec * 2000);
        await waitCallAfter(callLog, 'status', 120_000); // due 3's check, not the held call
        const timerScreen: string = await screen(tier, timer.address);
        expect(timerScreen.match(/due=3 sent/g) ?? []).toHaveLength(1);
        expect(timerScreen).not.toContain('due=3 dropped');
        // Agent exit leaves no tick text in the shell (7). The baseline is the count right
        // after the exit completes: a tick sent in the exit window lands inside the wait
        // below, and dead-agent screens only lose text, so `<=` is the invariant.
        await exitAgent(cell);
        await waitGone(tier, timer.address, 90_000);
        const ticksAtExit: number = ((await screen(tier, cell.watcher)).match(/watch-issues tick /g) ?? []).length;
        await noNewTicks(cell, ticksAtExit, intervalSec * 1000 + 15_000);
        await teardownCell(cell);
        return;
      }

      // shape=root: start with its check and timer (1).
      expect(statusCalls(callLog)).toBeGreaterThanOrEqual(1);
      // One tick running one check with its receipt and the Judge's next (3, 11). Due 1's
      // calls are attributed by a newer turn: the receipt lands before the check call.
      await waitDue(tier, timer.address, 1, 120_000);
      await waitCallAfter(callLog, 'status', 120_000);
      await waitCallAfter(callLog, 'next', 120_000);
      // One tick held behind a busy check, running once after it (4).
      writeFileSync(resolve(cell.flags, 'hold-status'), String(intervalSec * 2 + 15));
      await waitDue(tier, timer.address, 2, 120_000);
      await waitDue(tier, timer.address, 3, 120_000 + intervalSec * 2000);
      await waitCallAfter(callLog, 'status', 120_000); // due 3's check, not the held call
      const timerScreen: string = await screen(tier, timer.address);
      expect(timerScreen.match(/due=3 sent/g) ?? []).toHaveLength(1);
      expect(timerScreen).not.toContain('due=3 dropped');
      // Stop with no stray tick (5).
      const turnStop: number = await send(tier, cell.watcher, `watch-issues stop ${tier.root}`);
      await turnDone(tier, cell.watcher, turnStop, 120_000);
      await settleIdle(tier, cell.watcher, 60_000);
      expect(await labelled(tier)).toHaveLength(0);
      const ticksAtStop: number = ((await screen(tier, cell.watcher)).match(/watch-issues tick /g) ?? []).length;
      await noNewTicks(cell, ticksAtStop, intervalSec * 1000 + 10_000);
      // A second start, then the reset: /clear ends claude's and agy's watch; codex and pi record
      // their /new outcome as the stated limit (7).
      const turnRe: number = await send(tier, cell.watcher, `watch-issues ${tier.root}`);
      await turnDone(tier, cell.watcher, turnRe, 300_000);
      await settleIdle(tier, cell.watcher, 60_000);
      const timer2: Term = await verifiedTimer(cell);
      expect(timer2.address).not.toBe(timer.address);
      const reset: string[] =
        kind === 'claude' || kind === 'agy' ? ['/', 'c', 'l', 'e', 'a', 'r', 'enter'] : ['/', 'n', 'e', 'w', 'enter'];
      await tier.hc(['keys', cell.watcher, ...reset]);
      await Bun.sleep(90_000);
      const timers3: Term[] = await labelled(tier);
      tier.record('reset.json', {
        timers: timers3.map((t) => t.address),
        screen: await screen(tier, cell.watcher),
      });
      if (kind === 'claude' || kind === 'agy') expect(timers3).toHaveLength(0);
      await teardownCell(cell);
    } catch (error) {
      await failRecord(tier, cell.watcher, cell.timers).catch(() => {});
      await teardownCell(cell).catch(() => {});
      throw error;
    }
  },
  600_000,
);
