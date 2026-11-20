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
  opts: { root?: string; mode?: string; name?: string; claudeDir?: string } = {},
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
    `WATCH_TICK_SECONDS=2`,
    `WATCHER_MODE=${opts.mode ?? 'work'}`,
    ...(opts.claudeDir === undefined ? [] : [`WATCH_AGENT_CLAUDE=${opts.claudeDir}`]),
  ];
  const run: SpawnResult = await f.core.hc([
    'run',
    '--bg',
    '--json',
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

async function waitLabel(rig: Rig, due: number, ms: number = 15_000): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const t: Term = await get(rig.core, rig.timer);
    if (t.labels['akrogon.watch-due'] === String(due)) return;
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
    const rig: Rig = await watchUp(f);
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
    expect(noId.stdout).toContain('refused');
    const otherCore: HcCore = await hcCore(f, { doc: false });
    f.core.link(otherCore);
    const outside: SpawnResult = await spawnCaptured([bun, resolve(skilldir, 'scripts/start.ts'), f.root], {
      cwd: f.root,
      env: { ...directEnv(f, rig.bin), HC_TERMINAL_ID: 'tOutside' },
    });
    expect(outside.code).toBe(1);
    expect(outside.stdout).toContain('refused');
    await otherCore.discard();
  } finally {
    await f.clean();
  }
});

// Criteria 3, 4, 8: per-due delivery with receipt before the check, busy dues, paused repo.
test.serial('each due runs one check with its receipt first; busy dues each run their own check', async () => {
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

    // Busy: hold the next status call ~2.5 intervals; the dues that accrue each run a check.
    writeFileSync(resolve(rig.flags, 'hold-status'), '5');
    await waitTick(rig, nextDue);
    await waitTick(rig, nextDue + 1, 25_000);
    await waitLabel(rig, nextDue + 1, 25_000);
    expect(tickLines(rig, nextDue)).toHaveLength(1);
    expect(tickLines(rig, nextDue + 1)).toHaveLength(1);
    const statuses: number = statusCalls(rig);
    for (let n: number = 0; n < 80 && statusCalls(rig) < statuses + 0; n += 1) await Bun.sleep(200);
    // one status call per delivered due: start + due1 + the two accrued dues
    expect(statusCalls(rig)).toBeGreaterThanOrEqual(4);

    // Paused: a due still counts delivered (receipt set) but acts on nothing.
    const paused: Result = await cli(f, ['pause']);
    expect(paused.code).toBe(0);
    const pauseDue: number = Math.max(...tickLines(rig).map((l) => Number(/due=(\d+)/.exec(l)?.[1]))) + 1;
    const beforeNext: number = nextCalls(rig);
    const beforeStatus: number = statusCalls(rig);
    await waitTick(rig, pauseDue, 25_000);
    await waitLabel(rig, pauseDue, 25_000);
    for (let n: number = 0; n < 60 && statusCalls(rig) <= beforeStatus; n += 1) await Bun.sleep(200);
    expect(nextCalls(rig)).toBe(beforeNext);
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
    expect(statusCalls(rig)).toBe(1); // start's own check only
    await waitTick(rig, 1);
    const deadline: number = Date.now() + 25_000;
    while (Date.now() < deadline && tickLines(rig, 1).length < 2) await Bun.sleep(200);
    expect(tickLines(rig, 1)).toHaveLength(2); // sent once, resent once
    await waitTick(rig, 2);
    while (Date.now() < deadline && tickLines(rig, 2).length < 2) await Bun.sleep(200);
    expect(tickLines(rig, 2)).toHaveLength(2); // due 1 never sends a third time; the rule repeats for due 2
    expect(statusCalls(rig)).toBe(1); // no check ran for any due
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
    const before: number = statusCalls(rig);
    await send(rig, `watch-issues tick ${f.root}`);
    await waitHooks(rig, /tick exit=\d+/);
    expect(statusCalls(rig)).toBe(before);

    // Stale due (≤ receipt) is refused without a check. Seed the receipt first.
    await waitTick(rig, 1);
    await waitLabel(rig, 1);
    const afterSeed: number = statusCalls(rig);
    await send(rig, `watch-issues tick timer=${rig.timer} pid=${pinPid} due=1 ${f.root}`);
    await waitHooks(rig, /tick exit=\d+ no-watch/, 15_000);
    expect(statusCalls(rig)).toBe(afterSeed);

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
test.serial('the timer exits on a finished watcher, wrong start time and pin death', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const rig: Rig = await watchUp(f);
    rig.timer = await started(rig);

    // Watcher terminal finished → the timer exits and the name frees.
    await f.core.hc(['kill', rig.watcher]);
    await waitGone(f.core, rig.timer);
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
    const timerArgv = (extra: string[]): string[] => [
      'run',
      '--bg',
      '--json',
      '--no-notify',
      '--rm',
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
    // Wrong pin-start → first poll exits.
    let run: SpawnResult = await f.core.hc(timerArgv(['--pin-pid', String(shellPid), '--pin-start', '1']));
    expect(run.code).toBe(0);
    await waitGone(f.core, z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address);

    // Correct pin, then the pinned process dies → exit.
    run = await f.core.hc(timerArgv(['--pin-pid', String(shellPid), '--pin-start', startOf(shellPid)]));
    const pinDeath: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    await Bun.sleep(2500);
    expect((await f.core.hc(['get', '--json', pinDeath])).code).toBe(0); // alive while the pin lives
    process.kill(shellPid, 'SIGKILL');
    await waitGone(f.core, pinDeath);
  } finally {
    await f.clean();
  }
});

test.serial('a foreground swap and a transcript flip each end the timer', async () => {
  const f: HcFixture = await hcFixture();
  try {
    // Shell watcher: run a stand-in in the shell so foreground=standin, pin it, then kill it:
    // the foreground returns to bash ≠ pin → the timer exits.
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
      '--rm',
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
    process.kill(pin, 'SIGKILL'); // stand-in dies; bash resumes the foreground
    await waitGone(f.core, timerAddr, 15_000);

    // Transcript flip: a watcher with a claude-shaped config dir latches a path, then exits on change.
    const claudeDir: string = resolve(f.home, 'claude-cfg');
    const rig: Rig = await watchUp(f, { name: 'watcher-tx', claudeDir });
    rig.timer = await started(rig);
    const wPid: number = z.number().parse((await get(f.core, rig.watcher)).foreground?.pid);
    const record: string = resolve(claudeDir, 'sessions', `${wPid}.json`);
    for (let n: number = 0; n < 80 && !existsSync(record); n += 1) await Bun.sleep(200);
    const seen = z
      .object({ sessionId: z.string(), procStart: z.string() })
      .parse(JSON.parse(readFileSync(record, 'utf8')));
    writeFileSync(
      record,
      JSON.stringify({ sessionId: 'bbbbbbbb-0000-0000-0000-000000000002', procStart: seen.procStart }),
    );
    writeFileSync(resolve(claudeDir, 'projects', 'p', 'bbbbbbbb-0000-0000-0000-000000000002.jsonl'), '');
    await waitGone(f.core, rig.timer, 15_000);
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
  const guide: string = readFileSync(files[1], 'utf8');
  for (const harness of ['claude', 'codex', 'pi', 'agy']) expect(guide).toContain(harness);
});
