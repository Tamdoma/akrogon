// watch-timer free tier: the mechanical watch over a real throwaway hc core (criteria 1-10).
// The watcher program is tests/fixtures/watch-agent.sh (runs scripts/start.ts as its descendant,
// then execs tests/stand-in.sh keeping its pid); tests/fixtures/watch-hook.sh plays the model per
// delivered line. `akrogon` on the watcher's PATH is a recording wrapper written by the test.
// Run: akrogon run-check --name watch-timer -- bun test --timeout=30000 tests/watch-timer.test.ts
import { expect, test } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { command, spawnCaptured, type Result, type SpawnResult } from '../src/shell';
import { withLock } from '../src/state';
import { cli, leaf, leafTempRoot } from './helpers';
import { hcCore, hcFixture, type HcCore, type HcFixture } from './hc-fixture';

const skilldir: string = resolve(import.meta.dir, '../skills/watch-issues');
const agent: string = resolve(import.meta.dir, 'fixtures/watch-agent.sh');
const hook: string = resolve(import.meta.dir, 'fixtures/watch-hook.sh');
const entry: string = resolve(import.meta.dir, '../src/akrogon.ts');
const bun: string = process.execPath;
const systemPath: string = z.string().parse(process.env.PATH);

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

const notFound = async (core: HcCore, address: string): Promise<boolean> =>
  (await core.hc(['get', '--json', address])).code !== 0;

async function get(core: HcCore, address: string): Promise<Term> {
  const reply: SpawnResult = await core.hc(['get', '--json', address]);
  if (reply.code !== 0) throw new Error(`hc get ${address}: ${reply.stderr}`);
  return termSchema.parse(JSON.parse(reply.stdout));
}

async function labelled(core: HcCore, repo: string): Promise<Term[]> {
  const listed = z
    .object({ terminals: z.array(termSchema) })
    .parse(await core.rpc('terminal.list', { all: true, labels: { 'akrogon.watch-timer': repo } }));
  return listed.terminals.filter((t) => t.state === 'live');
}

type Rig = {
  f: HcFixture;
  core: HcCore;
  watcher: string;
  timer: string;
  calls: string;
  flags: string;
  standin: string;
  bin: string;
};

const calls = (rig: Rig): string[] =>
  existsSync(rig.calls) ? readFileSync(rig.calls, 'utf8').split('\n').filter(Boolean) : [];
// Timers a test launches without --rm stay as finished terminals, so their printed reasons
// (criterion 14) stay readable on the screen after exit.
const screenOf = async (core: HcCore, address: string): Promise<string> =>
  (await core.hc(['read', address, '--lines', '60'])).stdout;

// The address may be live, finished or already removed: settle into a readable finished screen.
async function waitFinished(core: HcCore, address: string, ms: number = 15_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const reply: SpawnResult = await core.hc(['get', '--json', address]);
    if (reply.code === 0) {
      const t: Term = termSchema.parse(JSON.parse(reply.stdout));
      if (t.state !== 'live') return;
    }
    await Bun.sleep(250);
  }
  throw new Error(`terminal ${address} still live`);
}
const statusCalls = (rig: Rig): number => calls(rig).filter((l) => l.startsWith('call status')).length;
const nextCalls = (rig: Rig): number => calls(rig).filter((l) => l.startsWith('call next')).length;
const tasks = (rig: Rig): string[] => rig.f.core.tasks(rig.watcher);
const hooks = (rig: Rig): string[] => {
  const file: string = resolve(rig.standin, `${rig.watcher}.hooks`);
  return existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
};
const tickLines = (rig: Rig, due: number | null = null): string[] =>
  tasks(rig).filter(
    (l) =>
      l.startsWith('watch-issues tick ') && (due === null || l.includes(`due=${due} `) || l.endsWith(`due=${due}`)),
  );

// A wrapper `akrogon` ahead of the real one: logs each call (argv, hc turn), holds a `status` call
// while <flags>/hold-status exists, then forwards to the checkout's akrogon with fixture env.
function logbin(f: HcFixture, flags: string): { bin: string; calls: string } {
  const bin: string = resolve(f.home, 'watch-logbin');
  const calls: string = resolve(f.home, 'watch-calls.log');
  mkdirSync(bin, { recursive: true });
  writeFileSync(calls, '');
  const forward: string = `${bin}:${dirname(bun)}:${f.env.PATH}`;
  const env: string = [
    `AKROGON_HOME='${f.home}'`,
    `HOME='${f.home}'`,
    `AKROGON_LEAF_TEMP_ROOT='${leafTempRoot(f)}'`,
    `AKROGON_RETIRED_TEMP_ROOT='${resolve(f.home, 'retired-temp')}'`,
    `AKROGON_RUN=''`,
    `XDG_RUNTIME_DIR='${f.env.XDG_RUNTIME_DIR}'`,
    `FAKE_SYSTEMCTL_DB='${f.systemctl.db}'`,
    `FAKE_SYSTEMCTL_LOG='${f.systemctl.log}'`,
  ].join(' ');
  writeFileSync(
    resolve(bin, 'akrogon'),
    `#!/bin/sh
if [ "$1" = "status" ] && [ -f '${flags}/hold-status' ]; then
  sleep "$(cat '${flags}/hold-status')"
  rm -f '${flags}/hold-status'
fi
turn=$(HC_SESSION='${f.core.session}' hc get --json "$HC_TERMINAL_ID" 2>/dev/null | grep -o '"turn":[0-9]*' | head -1 | cut -d: -f2)
echo "call $* t=\${turn:-?}" >> '${calls}'
exec env -u HC_SESSION -u HC_TERMINAL_ID -u HC_TERMINAL_SOCKET -u HC_SCOPE ${env} PATH='${forward}' '${bun}' '${entry}' "$@"
`,
  );
  Bun.spawnSync(['chmod', '+x', resolve(bin, 'akrogon')]);
  return { bin, calls };
}

// Runs the watcher terminal; start's outcome line lands in the task log when the agent reports.
async function watchUp(
  f: HcFixture,
  opts: { root?: string; mode?: string; name?: string; claudeDir?: string; interval?: string; keep?: boolean } = {},
): Promise<Rig> {
  const flags: string = resolve(f.home, `watch-flags-${opts.name ?? 'watcher'}`);
  mkdirSync(flags, { recursive: true });
  const { bin, calls: callLog } = logbin(f, flags);
  const standin: string = f.core.standin;
  writeFileSync(resolve(standin, 'hook'), readFileSync(hook));
  Bun.spawnSync(['chmod', '+x', resolve(standin, 'hook')]);
  const root: string = opts.root ?? f.root;
  const watcherPath: string = `${bin}:${dirname(bun)}:${systemPath}`;
  const envs: string[] = [
    `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
    `HOME=${f.home}`,
    `PATH=${watcherPath}`,
    `STANDIN_DIR=${standin}`,
    `WATCH_SKILLDIR=${skilldir}`,
    `WATCH_ROOT=${root}`,
    `WATCH_TICK_SECONDS=${opts.interval ?? '2'}`,
    `WATCHER_MODE=${opts.mode ?? 'work'}`,
    ...(opts.claudeDir === undefined ? [] : [`WATCH_AGENT_CLAUDE=${opts.claudeDir}`]),
  ];
  const run: SpawnResult = await f.core.hc([
    'run',
    '--bg',
    '--json',
    ...(opts.keep === true ? ['--keep'] : []),
    '--name',
    opts.name ?? 'watcher',
    '--cwd',
    root,
    '--',
    '/usr/bin/env',
    ...envs,
    agent,
    skilldir,
    root,
  ]);
  expect(run.code).toBe(0);
  const watcher: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
  const rig: Rig = { f, core: f.core, watcher, timer: '', calls: callLog, flags, standin, bin };
  return rig;
}

async function started(rig: Rig, ms: number = 20_000): Promise<string> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const line: string | undefined = tasks(rig).findLast((l) => l.includes('start exit=0 started'));
    if (line !== undefined) {
      rig.timer = z.string().parse(line.split(' ').pop());
      return rig.timer;
    }
    const failure: string | undefined = tasks(rig).find(
      (l) => l.startsWith('start exit=') && !l.includes('started') && !l.includes('running'),
    );
    if (failure !== undefined) throw new Error(`watcher start failed: ${failure}`);
    await Bun.sleep(200);
  }
  throw new Error(`watcher did not start in ${ms}ms: tasks=${JSON.stringify(tasks(rig))}`);
}

async function waitTick(rig: Rig, due: number, ms: number = 15_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    if (tickLines(rig, due).length > 0) return;
    await Bun.sleep(200);
  }
  throw new Error(`due ${due} not delivered: tasks=${JSON.stringify(tasks(rig))}`);
}

// The receipt label is monotonic: a fast watcher stamps past dues before the first poll, so
// due n is proven delivered by label >= n, not == n.
async function waitLabel(rig: Rig, due: number, ms: number = 15_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const t: Term = await get(rig.core, rig.timer);
    if (Number(t.labels['akrogon.watch-due'] ?? '0') >= due) return;
    await Bun.sleep(200);
  }
  throw new Error(`receipt due=${due} missing: ${JSON.stringify(await get(rig.core, rig.timer))}`);
}

async function waitGone(core: HcCore, address: string, ms: number = 12_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await notFound(core, address)) return;
    await Bun.sleep(250);
  }
  throw new Error(`terminal ${address} still live`);
}

async function waitHooks(rig: Rig, match: RegExp | string, ms: number = 15_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  const ok = (l: string): boolean => (typeof match === 'string' ? l.includes(match) : match.test(l));
  while (Date.now() < deadline) {
    if (hooks(rig).some(ok)) return;
    await Bun.sleep(200);
  }
  throw new Error(`hook line ${String(match)} never appeared: ${JSON.stringify(hooks(rig))}`);
}

async function send(rig: Rig, text: string): Promise<void> {
  const sent: SpawnResult = await rig.core.hc(['send', '--json', rig.watcher, text]);
  expect(sent.code).toBe(0);
}

const directEnv = (f: HcFixture, bin: string): NodeJS.ProcessEnv => ({
  PATH: `${bin}:${dirname(bun)}:${systemPath}`,
  HOME: f.home,
  XDG_RUNTIME_DIR: f.env.XDG_RUNTIME_DIR,
  AKROGON_HOME: f.home,
  HC_SESSION: '',
  HC_TERMINAL_ID: '',
  HC_TERMINAL_SOCKET: '',
  HC_SCOPE: '',
});

// Criteria 1, 2, 9: start shape, verification, conflicts and refusals.
test.serial('start runs the check and claims the labelled timer; refusals and conflicts hold', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f, { interval: '3600' });
    rig.timer = await started(rig);
    const t: Term = await get(f.core, rig.timer);
    expect(t.name).toBe(`${f.prefix}-watch`);
    expect(t.labels['akrogon.watch-timer']).toBe(f.repo);
    expect(t.parent).toBe(rig.watcher);
    const argv: string = z.string().parse(t.argv?.join(' '));
    expect(argv).toContain('skills/watch-issues/scripts/timer.ts');
    const w: Term = await get(f.core, rig.watcher);
    expect(argv).toContain(`--pin-pid ${z.number().parse(w.foreground?.pid)}`);
    expect(statusCalls(rig)).toBe(1); // the immediate check on started

    // Second start: one more check, still one timer (criterion 2).
    await send(rig, `watch-issues ${f.root}`);
    await waitHooks(rig, 'start exit=0 running');
    expect(statusCalls(rig)).toBe(2);
    expect(await labelled(f.core, f.repo)).toHaveLength(1);

    // A second labelled terminal → conflict, no check, nothing touched.
    const other: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'xw-other',
      '--label',
      `akrogon.watch-timer=${f.repo}`,
      '--',
      'sleep',
      '60',
    ]);
    expect(other.code).toBe(0);
    const otherAddr: string = z.object({ address: z.string() }).parse(JSON.parse(other.stdout)).address;
    await send(rig, `watch-issues ${f.root}`);
    await waitHooks(rig, /start exit=\d+ conflict/);
    expect(statusCalls(rig)).toBe(2);
    expect((await get(f.core, rig.timer)).state).toBe('live');
    await f.core.hc(['kill', otherAddr]);
    await f.core.hc(['rm', otherAddr]);

    // A <prefix>-watch squatter without the label → conflict on the next start after ours is gone.
    await f.core.hc(['kill', rig.timer]);
    await waitGone(f.core, rig.timer);
    const squat: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      `${f.prefix}-watch`,
      '--',
      'sleep',
      '60',
    ]);
    expect(squat.code).toBe(0);
    const squatter: string = z.object({ address: z.string() }).parse(JSON.parse(squat.stdout)).address;
    await send(rig, `watch-issues ${f.root}`);
    await waitHooks(rig, /start exit=\d+ conflict/);
    expect(statusCalls(rig)).toBe(2);
    expect(await labelled(f.core, f.repo)).toHaveLength(0);
    await f.core.hc(['kill', squatter]);
    await f.core.hc(['rm', squatter]);

    // Criterion 9: no HC_TERMINAL_ID and a watcher outside the repo's session refuse, nothing changes.
    const noId: SpawnResult = await spawnCaptured([bun, resolve(skilldir, 'scripts/start.ts'), f.root], {
      cwd: f.root,
      env: directEnv(f, rig.bin),
    });
    expect(noId.code).toBe(1);
    expect(noId.stdout).toMatch(/refused \S+/); // criterion 14: the refusal names its reason
    const otherCore: HcCore = await hcCore(f, { doc: false });
    f.core.link(otherCore);
    const outside: SpawnResult = await spawnCaptured([bun, resolve(skilldir, 'scripts/start.ts'), f.root], {
      cwd: f.root,
      env: { ...directEnv(f, rig.bin), HC_TERMINAL_ID: 'tOutside' },
    });
    expect(outside.code).toBe(1);
    expect(outside.stdout).toMatch(/refused \S+/);
    await otherCore.discard();
  } finally {
    await f.clean();
  }
});

test.serial('a start reports the verified timer claimed after its first list', async () => {
  const f: HcFixture = await hcFixture();
  const bin: string = resolve(f.home, 'watch-logbin');
  const gate: string = resolve(f.home, 'hold-list');
  const captured: string = resolve(f.home, 'list-captured');
  const release: string = resolve(f.home, 'release-list');
  const hc: string = z.string().parse(Bun.which('hc'));
  mkdirSync(bin, { recursive: true });
  writeFileSync(gate, '');
  writeFileSync(
    resolve(bin, 'hc'),
    `#!/bin/sh
if [ "$1" = connect ]; then
  request=$(cat)
  case "$request" in
    *terminal.list*akrogon.watch-timer*)
      if mv '${gate}' '${gate}-taken' 2>/dev/null; then
        snapshot=$(printf '%s\\n' "$request" | '${hc}' "$@") || exit $?
        touch '${captured}'
        while [ ! -f '${release}' ]; do sleep 0.05; done
        printf '%s\\n' "$snapshot"
        exit
      fi ;;
  esac
  printf '%s\\n' "$request" | '${hc}' "$@"
else
  exec '${hc}' "$@"
fi
`,
    { mode: 0o755 },
  );
  try {
    const racing: Rig = await watchUp(f, { name: 'racing-start', interval: '3600' });
    for (let n: number = 0; n < 100 && !existsSync(captured); n += 1) await Bun.sleep(50);
    expect(existsSync(captured)).toBe(true);

    const winner: Rig = await watchUp(f, { name: 'winning-start', interval: '3600' });
    const timer: string = await started(winner);
    writeFileSync(release, '');

    let outcome: string | undefined;
    for (let n: number = 0; n < 100 && outcome === undefined; n += 1) {
      outcome = tasks(racing).find((line) => line.startsWith('start exit='));
      if (outcome === undefined) await Bun.sleep(50);
    }
    expect(outcome).toBe(`start exit=0 running ${timer}`);
    expect(await labelled(f.core, f.repo)).toHaveLength(1);
  } finally {
    writeFileSync(release, '');
    await f.clean();
  }
});

// Criteria 3, 4, 8: per-due delivery with receipt before the check, busy dues, paused repo.
test.serial('each due runs one check with its receipt first; busy dues coalesce to the latest', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'watch-leaf', 'plan.synthesis');
    const rig: Rig = await watchUp(f);
    rig.timer = await started(rig);
    for (let n: number = 0; n < 50 && nextCalls(rig) < 1; n += 1) await Bun.sleep(200);
    expect(nextCalls(rig)).toBeGreaterThanOrEqual(1); // start's check runs next on the waiting leaf
    await waitTick(rig, 1);
    await waitLabel(rig, 1);
    for (let n: number = 0; n < 50 && statusCalls(rig) < 2; n += 1) await Bun.sleep(200);
    expect(statusCalls(rig)).toBe(2);
    // Receipt precedes the check: the hook recorded the timer's label before calling status.
    expect(hooks(rig).some((l) => l === 'receipt=1')).toBe(true);
    const seen: number[] = tickLines(rig).map((l) => Number(/due=(\d+)/.exec(l)?.[1]));
    const nextDue: number = Math.max(...seen) + 1;

    // Busy: hold the next status call ~2.5 intervals. Brief C4: the dues that accrue while the
    // watcher works collapse into one unsent due at the latest boundary; it is sent once the
    // watcher is idle, tick.ts accepts it and its check runs.
    writeFileSync(resolve(rig.flags, 'hold-status'), '5');
    await waitTick(rig, nextDue);
    const later = (): number[] =>
      tickLines(rig)
        .map((l) => Number(/due=(\d+)/.exec(l)?.[1]))
        .filter((n: number) => n > nextDue);
    for (let n: number = 0; n < 125 && later().length === 0; n += 1) await Bun.sleep(200);
    const coalesced: number = Math.min(...later());
    expect(coalesced).toBeGreaterThanOrEqual(nextDue + 2);
    expect(tickLines(rig, nextDue)).toHaveLength(1);
    expect(tickLines(rig, nextDue + 1)).toHaveLength(0);
    expect(tickLines(rig, coalesced)).toHaveLength(1);
    await waitLabel(rig, coalesced, 25_000);
    // The hook writes the accept line, then the receipt it read: the coalesced due's accept
    // carries its turn, and that turn's `call status` is the check it ran.
    const receiptAt = (): number => hooks(rig).findIndex((l) => l === `receipt=${coalesced}`);
    for (let n: number = 0; n < 80 && receiptAt() < 0; n += 1) await Bun.sleep(200);
    const accepted: string = hooks(rig)[receiptAt() - 1] ?? '';
    expect(accepted).toMatch(/^tick exit=0 accept t=\d+$/);
    const heldTurn: string = z.string().parse(/ t=(\d+)$/.exec(accepted)?.[1]);
    for (
      let n: number = 0;
      n < 80 && !calls(rig).some((l) => l.startsWith('call status') && l.endsWith(`t=${heldTurn}`));
      n += 1
    )
      await Bun.sleep(200);
    expect(
      calls(rig).some((l) => l.startsWith('call status') && l.endsWith(`t=${heldTurn}`)),
      `status call at the coalesced due's turn ${heldTurn}`,
    ).toBe(true);
    // one status call per delivered due: start + due1 + the held due + the coalesced due
    expect(statusCalls(rig)).toBeGreaterThanOrEqual(4);

    // Paused: a due still counts delivered (receipt set) but acts on nothing. The no-next proof
    // is turn-attributed: an earlier check's `next` may still be landing when pause takes effect,
    // so a bare count flakes. The paused check's own task turn carries `t=<turn>` on both the
    // hook's tick line and the wrapper's call lines; its `next` would share that turn.
    const paused: Result = await cli(f, ['pause']);
    expect(paused.code).toBe(0);
    const pauseDue: number = Math.max(...tickLines(rig).map((l) => Number(/due=(\d+)/.exec(l)?.[1]))) + 1;
    const beforeStatus: number = statusCalls(rig);
    await waitTick(rig, pauseDue, 25_000);
    await waitLabel(rig, pauseDue, 25_000);
    for (let n: number = 0; n < 60 && statusCalls(rig) <= beforeStatus; n += 1) await Bun.sleep(200);
    const pTickIdx: number = hooks(rig).findLastIndex((l) => /tick exit=0 accept/.test(l));
    const pTurn: string | null = / t=(\d+)/.exec(hooks(rig)[pTickIdx] ?? '')?.[1] ?? null;
    expect(pTurn).not.toBeNull();
    // The wrapper logs `call status` when the call starts; the hook's `status <out>` line lands
    // only when it finishes — wait for this task's line so the check provably ran while paused
    // (the hook logs only the first output line, so paused may not be in it; the no-next proof
    // below is the criterion).
    for (
      let n: number = 0;
      n < 60 &&
      !hooks(rig)
        .slice(pTickIdx)
        .some((l) => l.startsWith('status '));
      n += 1
    )
      await Bun.sleep(200);
    expect(
      hooks(rig)
        .slice(pTickIdx)
        .some((l) => l.startsWith('status ')),
    ).toBe(true);
    // A would-be next call lands right after its status call inside the same task; give it a
    // beat, then require no `call next` at the paused check's turn after its status line.
    await Bun.sleep(2500);
    const pStatusIdx: number = calls(rig).findLastIndex((l) => l.startsWith('call status') && l.endsWith(`t=${pTurn}`));
    expect(pStatusIdx).toBeGreaterThanOrEqual(0);
    expect(
      calls(rig)
        .slice(pStatusIdx)
        .some((l) => l.startsWith('call next') && l.endsWith(`t=${pTurn}`)),
    ).toBe(false);
    const unpaused: Result = await cli(f, ['unpause']);
    expect(unpaused.code).toBe(0);
  } finally {
    await f.clean();
  }
});

test.serial('an unreceipted due is resent once then dropped while later dues continue', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f, { mode: 'idle' }); // hook never runs: no receipt, no check
    rig.timer = await started(rig);
    for (let n: number = 0; n < 50 && statusCalls(rig) < 1; n += 1) await Bun.sleep(200);
    expect(statusCalls(rig)).toBe(1); // start's own check only
    await waitTick(rig, 1);
    const deadline: number = Date.now() + 25_000;
    while (Date.now() < deadline && tickLines(rig, 1).length < 2) await Bun.sleep(200);
    expect(tickLines(rig, 1)).toHaveLength(2); // sent once, resent once
    await waitTick(rig, 2);
    while (Date.now() < deadline && tickLines(rig, 2).length < 2) await Bun.sleep(200);
    expect(tickLines(rig, 2)).toHaveLength(2); // due 1 never sends a third time; the rule repeats for due 2
    await waitTick(rig, 3);
    expect(statusCalls(rig)).toBe(1); // no check ran for any due
    // Criterion 14: the timer prints each skipped send and each drop to its own screen.
    // The run-created timer carries --rm, so it is removed only when it exits; it lives here.
    const screen: string = await screenOf(f.core, rig.timer);
    for (const due of [1, 2]) {
      expect(screen).toContain(`due=${due} dropped`);
    }
    expect(screen).toMatch(/due=1 (not started|failed|sent)/);
    expect(screen).not.toContain('due=1 sent (attempt 3');
  } finally {
    await f.clean();
  }
});

test.serial('a receipt without a watcher turn does not suppress the one resend', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f, { mode: 'idle' });
    const timer: string = await started(rig);
    const before: number = (await get(f.core, rig.watcher)).turn;
    await waitTick(rig, 1);
    const receipt: SpawnResult = await f.core.hc(['label', timer, 'akrogon.watch-due=1']);
    expect(receipt.code).toBe(0);
    await waitTick(rig, 2, 20_000);
    expect((await get(f.core, rig.watcher)).turn).toBe(before);
    expect(tickLines(rig, 1)).toHaveLength(2);
  } finally {
    await f.clean();
  }
});

// Criteria 5, 6: stop from any terminal, restart, refusal forms.
test.serial('stop kills the verified timer; stale and forged ticks run nothing', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f);
    rig.timer = await started(rig);
    const first: string = rig.timer;
    const w: Term = await get(f.core, rig.watcher);
    const pinPid: number = z.number().parse(w.foreground?.pid);

    // Old cron-style tick: no timer= → no check.
    const hookLines: number = hooks(rig).length;
    await send(rig, `watch-issues tick ${f.root}`);
    await waitHooks(rig, /tick exit=\d+/);
    // Dues keep delivering meanwhile, so count no-check inside this task's own hook block:
    // it starts at its `tick exit=` line and ends at the next task's boundary line; a check
    // would have written a `status` line inside it.
    const boundary = (l: string): boolean => /exit=|ignored |skipped /.test(l);
    const tail: string[] = hooks(rig).slice(hookLines);
    const own: string[] = tail.slice(0, Math.max(1, tail.slice(1).findIndex(boundary) + 1));
    // The reason must sit between `no-watch` and the hook's ` t=` suffix — `no-watch t=0` alone
    // is the bare line this criterion forbids (14).
    expect(own.some((l) => /tick exit=[^0]+ no-watch (?!t=)\S/.test(l))).toBe(true);
    expect(own.some((l) => l.startsWith('status '))).toBe(false);

    // Stale due (≤ receipt) is refused without a check. Seed the receipt first.
    await waitTick(rig, 1);
    await waitLabel(rig, 1);
    await send(rig, `watch-issues tick timer=${rig.timer} pid=${pinPid} due=1 ${f.root}`);
    await waitHooks(rig, /tick exit=\d+ no-watch stale/, 15_000);
    // Later dues keep delivering during this window, so the no-check proof is hook order:
    // a task's check writes a `status` line right after its `tick exit=0` line; a `status`
    // immediately after `no-watch` would mean the stale tick ran its check anyway.
    const staleIndex: number = hooks(rig).findLastIndex((l) => /tick exit=\d+ no-watch (?!t=)\S/.test(l));
    expect(staleIndex).toBeGreaterThanOrEqual(0);
    const staleTail: string[] = hooks(rig).slice(staleIndex);
    const staleOwn: string[] = staleTail.slice(0, Math.max(1, staleTail.slice(1).findIndex(boundary) + 1));
    expect(staleOwn.some((l) => l.startsWith('status '))).toBe(false);

    // Stop from a non-watcher terminal (the test process stands in for it).
    const env: NodeJS.ProcessEnv = directEnv(f, rig.bin);
    const stopped: SpawnResult = await spawnCaptured([bun, resolve(skilldir, 'scripts/stop.ts'), f.root], {
      cwd: f.root,
      env,
    });
    expect(stopped.code).toBe(0);
    expect(stopped.stdout).toContain('stopped');
    await waitGone(f.core, first);
    const again: SpawnResult = await spawnCaptured([bun, resolve(skilldir, 'scripts/stop.ts'), f.root], {
      cwd: f.root,
      env,
    });
    expect(again.stdout).toContain('stopped');

    // Restart, then an old-address tick runs nothing; stop from the watcher's stdin.
    await send(rig, `watch-issues ${f.root}`);
    await waitHooks(rig, /start exit=0 started/);
    const restarted: string = z.string().parse(
      hooks(rig)
        .findLast((l) => l.includes('start exit=0 started'))
        ?.split(' ')
        .pop(),
    );
    expect(restarted).not.toBe(first);
    rig.timer = restarted;
    const oldTick: number = statusCalls(rig);
    await send(rig, `watch-issues tick timer=${first} pid=${pinPid} due=9 ${f.root}`);
    await send(rig, `watch-issues stop ${f.root}`);
    await waitHooks(rig, /stop exit=0/);
    await waitGone(f.core, restarted);
    expect(statusCalls(rig)).toBeLessThanOrEqual(oldTick + 1); // a legit due may have landed; the forged one ran none

    // A tick on a root the session does not hold is refused with its reason (14).
    await send(rig, `watch-issues tick timer=${rig.timer} pid=${pinPid} due=5 /no/such/root`);
    await waitHooks(rig, /tick exit=\d+ no-watch (?!t=)\S/, 15_000);

    // pid mismatch: restart once more, forge a tick with a wrong pid → the timer is killed.
    await send(rig, `watch-issues ${f.root}`);
    let third: string = '';
    for (let n: number = 0; n < 80; n += 1) {
      const line: string | undefined = hooks(rig).findLast((l) => l.includes('start exit=0 started'));
      const addr: string | undefined = line?.split(' ').pop();
      if (addr !== undefined && addr !== restarted && addr !== first) {
        third = addr;
        break;
      }
      await Bun.sleep(200);
    }
    expect(third).not.toBe('');
    rig.timer = third;
    expect(await notFound(f.core, third)).toBe(false);
    const statusNow: number = statusCalls(rig);
    await send(rig, `watch-issues tick timer=${third} pid=${pinPid + 40000} due=1 ${f.root}`);
    await waitHooks(rig, /tick exit=\d+/, 15_000);
    await waitGone(f.core, third);
    expect(statusCalls(rig)).toBeLessThanOrEqual(statusNow + 1);
  } finally {
    await f.clean();
  }
});

// Criterion 7: every exit key ends the timer and frees the name, without sending.
test.serial('the timer reports a failed hc receipt read', async () => {
  const f: HcFixture = await hcFixture();
  const bin: string = resolve(f.home, 'watch-logbin');
  const failedRead: string = resolve(f.home, 'failed-receipt-read');
  const hc: string = z.string().parse(Bun.which('hc'));
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    resolve(bin, 'hc'),
    `#!/bin/sh
if [ "$1" = get ] && [ -f '${failedRead}' ] && [ "$3" = "$(cat '${failedRead}')" ]; then
  printf '%s\\n' '{"error":{"kind":"unavailable","message":"receipt lookup unavailable"}}' >&2
  exit 1
fi
exec '${hc}' "$@"
`,
    { mode: 0o755 },
  );
  try {
    const rig: Rig = await watchUp(f);
    const timer: string = await started(rig);
    writeFileSync(failedRead, timer);
    const reason: string = 'receipt read failed: unavailable';
    let screen: string = await screenOf(f.core, timer);
    for (let n: number = 0; n < 30 && !screen.includes(reason); n += 1) {
      await Bun.sleep(100);
      screen = await screenOf(f.core, timer);
    }
    expect(screen).toContain(reason);
  } finally {
    await f.clean();
  }
});

test.serial('the timer exits on a finished watcher, wrong start time and pin death', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f, { interval: '3600' });
    rig.timer = await started(rig);

    // Watcher terminal finished → the timer exits and the name frees.
    await f.core.hc(['kill', rig.watcher]);
    await waitGone(f.core, rig.timer);
    // The finished screen is gone with --rm; the not_found/watcher-finished reasons are read
    // on the direct-launched timers below, which run without --rm.
    const reclaim: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      `${f.prefix}-watch`,
      '--',
      'sleep',
      '30',
    ]);
    expect(reclaim.code).toBe(0);
    const reclaimed: string = z.object({ address: z.string() }).parse(JSON.parse(reclaim.stdout)).address;
    await f.core.hc(['kill', reclaimed]);
    await f.core.hc(['rm', reclaimed]);
    await f.core.hc(['rm', rig.watcher]);

    // Direct-launched timers for the remaining keys; a plain shell terminal is the "watcher".
    const shellRun: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'xw-shell',
      '--',
      '/usr/bin/env',
      `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
      `HOME=${f.home}`,
      'bash',
    ]);
    expect(shellRun.code).toBe(0);
    const shell: string = z.object({ address: z.string() }).parse(JSON.parse(shellRun.stdout)).address;
    const shellT: Term = await get(f.core, shell);
    const shellPid: number = z.number().parse(shellT.foreground?.pid ?? shellT.pid);
    const startOf = (pid: number): string => {
      const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
      return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
    };
    // No --rm on these direct launches: the printed exit reasons stay readable on the screen
    // (criterion 14); the test removes each terminal itself.
    const timerArgv = (extra: string[]): string[] => [
      'run',
      '--bg',
      '--json',
      '--no-notify',
      '--label',
      `akrogon.watch-timer=${f.repo}`,
      '--',
      '/usr/bin/env',
      `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
      `HOME=${f.home}`,
      `PATH=${dirname(bun)}:${systemPath}`,
      'WATCH_TICK_SECONDS=2',
      bun,
      resolve(skilldir, 'scripts/timer.ts'),
      '--session',
      f.core.session,
      '--watcher',
      shell,
      '--root',
      f.root,
      '--repo',
      f.repo,
      ...extra,
    ];
    // A watcher address that never resolves → not_found reason on the first poll.
    let run: SpawnResult = await f.core.hc(
      timerArgv(['--pin-pid', String(shellPid), '--pin-start', startOf(shellPid)]).map((arg) =>
        arg === shell ? 'tGone' : arg,
      ),
    );
    const nf: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    await waitFinished(f.core, nf);
    expect(await screenOf(f.core, nf)).toContain('exit: watcher tGone not_found');
    await f.core.hc(['rm', nf]);

    // Wrong pin-start → first poll exits with the replaced reason.
    run = await f.core.hc(timerArgv(['--pin-pid', String(shellPid), '--pin-start', '1']));
    expect(run.code).toBe(0);
    const wrong: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    await waitFinished(f.core, wrong);
    expect(await screenOf(f.core, wrong)).toContain('replaced (start');
    await f.core.hc(['rm', wrong]);

    // Correct pin, then the pinned process dies → exit with the gone reason.
    run = await f.core.hc(timerArgv(['--pin-pid', String(shellPid), '--pin-start', startOf(shellPid)]));
    const pinDeath: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    await Bun.sleep(2500);
    expect((await f.core.hc(['get', '--json', pinDeath])).code).toBe(0); // alive while the pin lives
    process.kill(shellPid, 'SIGKILL');
    await waitFinished(f.core, pinDeath);
    expect(await screenOf(f.core, pinDeath)).toContain(`pinned process ${shellPid} gone`);
    await f.core.hc(['rm', pinDeath]);

    // A watcher terminal finishing → `watcher <w> finished`: the pin must outlive the watcher
    // (the pin check runs first), so pin a separate sleeper; the shell is killed before the
    // timer launches so its first poll sees a finished watcher, not a live one whose
    // foreground fails the pin check.
    const sleeper: { pid: number; kill: () => void } = Bun.spawn(['sleep', '30']);
    try {
      const shell2Run: SpawnResult = await f.core.hc([
        'run',
        '--bg',
        '--json',
        '--name',
        'xw-shell3',
        '--',
        '/usr/bin/env',
        `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
        `HOME=${f.home}`,
        'bash',
      ]);
      expect(shell2Run.code).toBe(0);
      const shell2: string = z.object({ address: z.string() }).parse(JSON.parse(shell2Run.stdout)).address;
      await f.core.hc(['kill', shell2]);
      run = await f.core.hc(
        timerArgv(['--pin-pid', String(sleeper.pid), '--pin-start', startOf(sleeper.pid)]).map((arg) =>
          arg === shell ? shell2 : arg,
        ),
      );
      const fin: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
      await waitFinished(f.core, fin);
      expect(await screenOf(f.core, fin)).toContain(`exit: watcher ${shell2} finished`);
      await f.core.hc(['rm', fin]);
      await f.core.hc(['rm', shell2]);
    } finally {
      sleeper.kill();
    }
  } finally {
    await f.clean();
  }
});

test.serial('a foreground swap and a transcript flip each end the timer', async () => {
  const f: HcFixture = await hcFixture();
  try {
    // Shell watcher: run a stand-in in the shell so foreground=standin, pin it, then suspend
    // it: bash takes back the foreground while the pin lives → `not the pinned` exit (7, 14).
    // (Killing it instead prints `gone`: the pin-dead check runs before the foreground check.)
    const standinBin: string = resolve(f.home, 'watch-standin-bin');
    mkdirSync(standinBin, { recursive: true });
    symlinkSync(resolve(import.meta.dir, 'stand-in.sh'), resolve(standinBin, 'fake'));
    const run: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'xw-sh2',
      '--',
      '/usr/bin/env',
      `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
      `HOME=${f.home}`,
      `STANDIN_DIR=${f.core.standin}`,
      `PATH=${standinBin}:${dirname(bun)}:${systemPath}`,
      'bash',
    ]);
    const shell: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    const sentA: SpawnResult = await f.core.hc(['send', '--json', shell, 'fake --model work']);
    expect(sentA.code).toBe(0);
    await f.core.hc(['keys', shell, 'enter']);
    let fg: number | null = null;
    for (let n: number = 0; n < 80 && fg === null; n += 1) {
      const t: Term = await get(f.core, shell);
      if (t.foreground !== null && t.foreground.argv.join(' ').includes('fake')) fg = t.foreground.pid;
      await Bun.sleep(200);
    }
    const pin: number = z.number().parse(fg);
    const stat: string = readFileSync(`/proc/${pin}/stat`, 'utf8');
    const pinStart: string = stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
    const timerRun: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--no-notify',
      '--name',
      'xw-fg',
      '--',
      '/usr/bin/env',
      `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
      `HOME=${f.home}`,
      `PATH=${dirname(bun)}:${systemPath}`,
      'WATCH_TICK_SECONDS=2',
      bun,
      resolve(skilldir, 'scripts/timer.ts'),
      '--session',
      f.core.session,
      '--watcher',
      shell,
      '--root',
      f.root,
      '--repo',
      f.repo,
      '--pin-pid',
      String(pin),
      '--pin-start',
      pinStart,
    ]);
    expect(timerRun.code).toBe(0);
    const timerAddr: string = z.object({ address: z.string() }).parse(JSON.parse(timerRun.stdout)).address;
    process.kill(pin, 'SIGTSTP'); // the stand-in suspends; bash resumes the foreground
    await waitFinished(f.core, timerAddr, 15_000);
    expect(await screenOf(f.core, timerAddr)).toContain('is not the pinned');
    process.kill(pin, 'SIGKILL');
    await f.core.hc(['rm', timerAddr]);

    // Transcript flip: a watcher with a claude-shaped config dir latches a path, then exits on
    // change. The timer is direct-launched (no --rm) so the `transcript moved` reason stays
    // readable on its screen (criterion 14).
    const claudeDir: string = resolve(f.home, 'claude-cfg');
    const rig: Rig = await watchUp(f, { name: 'watcher-tx', claudeDir, interval: '3600' });
    // The watcher's foreground is bash until the agent execs: wait for a foreground whose
    // claude session record exists (the record proves the agent pid and config dir).
    let wPid: number | null = null;
    for (let n: number = 0; n < 80 && wPid === null; n += 1) {
      const fg: number | undefined = (await get(f.core, rig.watcher)).foreground?.pid;
      if (fg !== undefined && existsSync(resolve(claudeDir, 'sessions', `${fg}.json`))) wPid = fg;
      else await Bun.sleep(200);
    }
    const pid: number = z.number().parse(wPid);
    const stat2: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const txRun: SpawnResult = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--no-notify',
      '--label',
      `akrogon.watch-timer=${f.repo}`,
      '--',
      '/usr/bin/env',
      `XDG_RUNTIME_DIR=${f.env.XDG_RUNTIME_DIR}`,
      `HOME=${f.home}`,
      `PATH=${dirname(bun)}:${systemPath}`,
      'WATCH_TICK_SECONDS=2',
      bun,
      resolve(skilldir, 'scripts/timer.ts'),
      '--session',
      f.core.session,
      '--watcher',
      rig.watcher,
      '--root',
      f.root,
      '--repo',
      f.repo,
      '--pin-pid',
      String(pid),
      '--pin-start',
      stat2.slice(stat2.lastIndexOf(')') + 2).split(' ')[19],
    ]);
    expect(txRun.code).toBe(0);
    rig.timer = z.object({ address: z.string() }).parse(JSON.parse(txRun.stdout)).address;
    const record: string = resolve(claudeDir, 'sessions', `${pid}.json`);
    for (let n: number = 0; n < 80 && !existsSync(record); n += 1) await Bun.sleep(200);
    const seen = z
      .object({ sessionId: z.string(), procStart: z.string() })
      .parse(JSON.parse(readFileSync(record, 'utf8')));
    // Latch first (one full poll), then flip the session record to a different transcript.
    await Bun.sleep(2600);
    writeFileSync(
      record,
      JSON.stringify({ sessionId: 'bbbbbbbb-0000-0000-0000-000000000002', procStart: seen.procStart }),
    );
    writeFileSync(resolve(claudeDir, 'projects', 'p', 'bbbbbbbb-0000-0000-0000-000000000002.jsonl'), '');
    await waitFinished(f.core, rig.timer, 15_000);
    expect(await screenOf(f.core, rig.timer)).toContain('exit: transcript moved');
    await f.core.hc(['rm', rig.timer]);
  } finally {
    await f.clean();
  }
});

// Criteria 3 and 5: a root containing a space works through start, tick and stop.
test.serial('a root containing a space works through start, tick and stop', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const sroot: string = `${f.root} sp`;
    mkdirSync(resolve(sroot, 'issues/open'), { recursive: true });
    await command(['git', 'init', '-b', 'main', sroot]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], sroot);
    await command(['git', 'config', 'user.name', 'Test'], sroot);
    writeFileSync(resolve(sroot, '.gitignore'), '.env\n');
    writeFileSync(
      resolve(sroot, 'issues/config.yaml'),
      Bun.YAML.stringify({ checks: { test: 'true' }, grounding: 'none' }),
    );
    await command(['git', 'add', '.'], sroot);
    await command(['git', 'commit', '-m', 'sp'], sroot);
    const configPath: string = resolve(f.home, 'config.yaml');
    const global = z
      .object({ repos: z.record(z.string(), z.string()), prefixes: z.record(z.string(), z.string()).optional() })
      .passthrough()
      .parse(Bun.YAML.parse(readFileSync(configPath, 'utf8')));
    writeFileSync(
      configPath,
      Bun.YAML.stringify({
        ...global,
        repos: { ...global.repos, sproot: sroot },
        prefixes: { ...global.prefixes, sproot: 'sp' },
      }),
    );
    const doc = z
      .object({
        version: z.number(),
        value: z.object({ spaces: z.array(z.object({ id: z.string() }).passthrough()) }).passthrough(),
      })
      .parse(await f.core.rpc('doc.get', { name: 'herdr-app' }));
    await f.core.rpc('doc.set', {
      name: 'herdr-app',
      version: doc.version,
      value: {
        ...doc.value,
        spaces: [...doc.value.spaces, { id: 'sp-sp', name: 'sproot', folder: sroot, tabs: [] }],
      },
    });

    const rig: Rig = await watchUp(f, { root: sroot, name: 'watcher-sp' });
    rig.timer = await started(rig);
    const t: Term = await get(f.core, rig.timer);
    expect(t.labels['akrogon.watch-timer']).toBe('sproot');
    expect(t.name).toBe('sp-watch');
    await waitTick(rig, 1);
    await waitLabel(rig, 1);
    expect(tickLines(rig, 1)[0]).toContain(sroot); // the whole space root survives in the tick text
    for (let n: number = 0; n < 60 && statusCalls(rig) < 2; n += 1) await Bun.sleep(200);
    expect(statusCalls(rig)).toBe(2);
    await send(rig, `watch-issues stop ${sroot}`);
    await waitHooks(rig, /stop exit=0/);
    await waitGone(f.core, rig.timer);
  } finally {
    await f.clean();
  }
});

// watch-consults criterion 4: while the watcher works through tick boundaries the timer
// keeps any sent due plus at most one unsent due updated to the latest boundary; the idle
// watcher receives that one latest due and tick.ts accepts it (a due above the receipt).
test.serial('dues queued behind a busy watcher coalesce to the latest boundary', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f);
    rig.timer = await started(rig);
    // The hold must grab due 1's check call: it is written once the start check's status call
    // has run, so the next status call — due 1's — is the one that sleeps.
    for (let n: number = 0; n < 50 && statusCalls(rig) < 1; n += 1) await Bun.sleep(200);
    expect(statusCalls(rig)).toBe(1); // the start check's status call
    writeFileSync(resolve(rig.flags, 'hold-status'), '6');
    await waitTick(rig, 1);
    // dues 2, 3 and 4 accrue while the watcher is busy. The timer must not queue them all.
    await waitLabel(rig, 1);
    await Bun.sleep(7500);
    // The check ends; the held dues collapse into one send carrying the newest due number.
    const deadline: number = Date.now() + 30_000;
    while (Date.now() < deadline && tickLines(rig, 4).length === 0) await Bun.sleep(200);
    expect(tickLines(rig, 4)).toHaveLength(1);
    expect(tickLines(rig, 2)).toHaveLength(0);
    expect(tickLines(rig, 3)).toHaveLength(0);
    // The coalesced due receipts and runs its own check, like any accepted due.
    await waitLabel(rig, 4);
    const screen: string = await screenOf(f.core, rig.timer);
    expect(screen).toContain('due=4 sent');
    expect(screen).not.toContain('due=2 sent');
    expect(screen).not.toContain('due=3 sent');
  } finally {
    await f.clean();
  }
});

// A consultant terminal for the consult tests: named <prefix>-watch-consult, labelled like
// a startWatchConsult launch and parented to the watcher. `repo` labels a foreign repo's
// consultant (a same-named terminal whose label does not name this repo).
async function consultTerm(
  rig: Rig,
  opts: { repo?: string; parent?: string | null; name?: string; outlive?: boolean } = {},
): Promise<string> {
  const run: SpawnResult = await rig.core.hc([
    'run',
    '--bg',
    '--json',
    '--name',
    opts.name ?? `${rig.f.prefix}-watch-consult`,
    '--label',
    'akrogon=1',
    '--label',
    `akrogon.repo=${rig.f.repo}`,
    '--label',
    `akrogon.watch-consult=${opts.repo ?? rig.f.repo}`,
    ...(opts.parent === null
      ? ['--no-parent']
      : ['--parent', opts.parent ?? rig.watcher, ...(opts.outlive === true ? ['--outlive-parent'] : [])]),
    '--',
    'cat',
  ]);
  expect(run.code, `hc run consultant: ${run.stderr}`).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
}

// watch-consults criterion 5: `watch-issues stop` kills and removes the verified timer and
// then this watch's verified consultant, printing `stopped <timer>` first and
// `stopped consultant <address>` only when one was closed; an absent consultant counts as
// closed and a foreign one is not the watch's.
test.serial('stop closes the watch consultant after the timer, tolerating none', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f);
    rig.timer = await started(rig);
    // No consultant live: stop prints the single line `stopped <timer>` (the hook appends
    // ` t=<turn>` to stop's last output line).
    await send(rig, `watch-issues stop ${f.root}`);
    await waitHooks(rig, /stop exit=0 stopped/);
    const plainAt: number = hooks(rig).findLastIndex((l) => l.startsWith('stop exit=0'));
    expect(hooks(rig)[plainAt]).toMatch(new RegExp(`^stop exit=0 stopped ${rig.timer} t=\\S+$`));
    expect(hooks(rig).slice(plainAt + 1).some((l) => l.startsWith('stopped consultant'))).toBe(false);
    await waitGone(f.core, rig.timer);

    // Restart, then a verified consultant and a same-named foreign one share the session.
    await send(rig, `watch-issues ${f.root}`);
    await waitHooks(rig, /start exit=0 started/);
    const timer: Term | undefined = (await labelled(f.core, f.repo))[0];
    expect(timer).toBeDefined();
    rig.timer = timer.address;
    const mine: string = await consultTerm(rig);
    const foreign: string = await consultTerm(rig, {
      repo: 'other-repo',
      name: `${rig.f.prefix}-watch-consult-x`,
    });
    await send(rig, `watch-issues stop ${f.root}`);
    await waitHooks(rig, `stopped consultant ${mine}`, 20_000);
    // Brief C5: `stopped <timer>` is the first line, `stopped consultant <address>` the second.
    const at: number = hooks(rig).findLastIndex((l) => l.startsWith('stop exit=0'));
    expect(hooks(rig)[at]).toBe(`stop exit=0 stopped ${rig.timer}`);
    expect(hooks(rig)[at + 1]).toMatch(new RegExp(`^stopped consultant ${mine} t=\\S+$`));
    await waitGone(f.core, rig.timer);
    await waitGone(f.core, mine);
    expect((await get(f.core, foreign)).state).toBe('live');
    await f.core.hc(['kill', foreign]);
    await f.core.hc(['rm', foreign]);
  } finally {
    await f.clean();
  }
});

test.serial('stop waits for an admitted consultant launch and removes the consultant', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f, { interval: '3600' });
    rig.timer = await started(rig);
    const lock: string = resolve(f.home, 'watch', f.repo, '.consultant.lock');
    const attempted: string = resolve(rig.flags, 'stop-acquiring-lock');
    writeFileSync(resolve(rig.bin, 'flock'), '#!/bin/sh\n: > "$STOP_LOCK_ATTEMPT"\nexec "$REAL_FLOCK" "$@"\n', {
      mode: 0o755,
    });
    const { consultant, stopping } = await withLock(lock, async () => {
      let returned: boolean = false;
      const stopping: Promise<SpawnResult> = spawnCaptured([bun, resolve(skilldir, 'scripts/stop.ts'), f.root], {
        env: {
          ...directEnv(f, rig.bin),
          STOP_LOCK_ATTEMPT: attempted,
          REAL_FLOCK: z.string().parse(Bun.which('flock')),
        },
        timeout: 10_000,
      }).then((result: SpawnResult): SpawnResult => {
        returned = true;
        return result;
      });
      const deadline: number = Date.now() + 8_000;
      while (!returned && !existsSync(attempted) && Date.now() < deadline) await Bun.sleep(25);
      expect(returned || existsSync(attempted)).toBe(true);
      return { consultant: await consultTerm(rig), stopping };
    });
    const stopped: SpawnResult = await stopping;
    expect(stopped.code, stopped.stderr).toBe(0);
    expect(await notFound(f.core, rig.timer)).toBe(true);
    expect(await notFound(f.core, consultant)).toBe(true);
  } finally {
    await f.clean();
  }
});

// watch-consults criterion 6: when the pinned watcher process dies and leaves the terminal,
// the timer's own exit also kills and removes that watch's verified consultant; a
// foreign-repo consultant is not the watch's and survives. The verified consultant is
// outlive-parent so hc's parent-end handling cannot do the sweep for the timer.
test.serial('a dying watcher makes the timer exit sweep its consultant', async () => {
  const f: HcFixture = await hcFixture();
  try {
    // --keep: the watcher terminal survives its pinned program, the shape criterion 6
    // names — the timer's pin check fires and its exit path sweeps.
    const rig: Rig = await watchUp(f, { keep: true });
    rig.timer = await started(rig);
    const mine: string = await consultTerm(rig, { outlive: true });
    const foreign: string = await consultTerm(rig, {
      repo: 'other-repo',
      name: `${rig.f.prefix}-watch-consult-x`,
    });
    const w: Term = await get(f.core, rig.watcher);
    const pinPid: number = z.number().parse(w.foreground?.pid);
    process.kill(pinPid, 'SIGKILL');
    await waitGone(f.core, rig.timer);
    await waitGone(f.core, mine);
    expect((await get(f.core, foreign)).state).toBe('live');
    await f.core.hc(['kill', foreign]);
    await f.core.hc(['rm', foreign]);
  } finally {
    await f.clean();
  }
});

// Criterion 10: the skill and the human docs describe the timer watch for all four harnesses,
// name the stated limits, keep the compaction rule, and carry no cron wording.
test.serial('docs describe the timer watch for all harnesses with no cron wording', () => {
  const files: string[] = [
    resolve(import.meta.dir, '../skills/watch-issues/SKILL.md'),
    resolve(import.meta.dir, '../docs/use/watch-while-away.md'),
    resolve(import.meta.dir, '../docs/reference/skills.md'),
    resolve(import.meta.dir, '../docs/pictures/watch-loop.svg'),
    resolve(import.meta.dir, '../skills/AREA.md'),
    resolve(import.meta.dir, '../tests/AREA.md'),
  ];
  for (const file of files) {
    const text: string = readFileSync(file, 'utf8');
    expect(text, file).not.toMatch(/cron/i);
    expect(text, file).not.toMatch(/CronCreate|CronList|CronDelete/);
    expect(text, file).not.toMatch(/expir/i);
  }
  const skill: string = readFileSync(files[0], 'utf8');
  for (const harness of ['claude', 'codex', 'pi', 'agy']) expect(skill).toContain(harness);
  expect(skill).toContain('/new'); // the codex/pi reset limit
  expect(skill).toMatch(/compaction/i);
  expect(skill).toMatch(/draft/i); // the held-draft limit
  // Criterion 15: the check runs `akrogon status` at <root>; `akrogon status <root>` errors
  // "Missing leaf" and must not appear in the skill text.
  expect(skill).toContain('akrogon status');
  expect(skill).not.toContain('akrogon status <root>');
  const guide: string = readFileSync(files[1], 'utf8');
  for (const harness of ['claude', 'codex', 'pi', 'agy']) expect(guide).toContain(harness);
});
