// Criterion 11 (watch-any-harness): one attended paid run per harness and launch shape in
// akr-e2e-watch, under readiness grants[0] (at most 8 harness sessions, each under 10 minutes).
// shape=root: the harness is the terminal's program (start, second start, ticks with receipts,
// busy dues, old cron tick, stop, repeated stop, restart, old-address tick refused, reset).
// shape=shell: the harness runs from a bash in a root path with a space (paused start, unpause
// tick, paused check, agent exit leaves no tick text).
// A logging `akrogon` wrapper on the watcher's PATH counts checks and `next` calls per hc turn.
// Run: akrogon run-check --name watch-live-<kind>-<shape> -- env AKROGON_E2E=watch-live
//      AKROGON_E2E_KIND=<claude|codex|pi|agy> AKROGON_E2E_SHAPE=<root|shell>
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/e2e-<kind>-<shape>
//      WATCH_TICK_SECONDS=30 bun test --timeout=30000 ./tests/e2e/watch-live.e2e.ts
import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { waitFor, type Seen } from '../../src/hc';
import { type SpawnResult } from '../../src/shell';
import { answerTrust, realHome, required } from './tier';
import { lines, observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const skill: string = resolve(import.meta.dir, '../../skills/watch-issues');
const leafTemp: string = required('AKROGON_E2E_ROOT');

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
      '-a',
      'never',
      '-s',
      'danger-full-access',
    ],
    trust: 'Trust and continue',
  },
  pi: {
    argv: (m) => [
      'pi',
      '--model',
      m,
      '--thinking',
      'low',
      '-a',
      '--exclude-tools',
      'request_user_input',
      '--skill',
      skill,
    ],
    trust: null,
  },
  agy: {
    argv: (m) => ['agy', '--model', m, '--effort', 'low', '--mode', 'auto'],
    trust: 'Yes, I trust this folder',
  },
};
const models: Record<string, string> = {
  claude: 'claude-haiku-5-5',
  codex: 'gpt-6.1-sol',
  pi: 'devin/swe-2-max',
  agy: 'gemini-3.8-flash-low',
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

async function send(tier: WatchTier, address: string, text: string): Promise<number> {
  const sent: SpawnResult = await tier.hc(['send', '--json', address, text]);
  if (sent.code !== 0) throw new Error(`hc send failed: ${JSON.stringify(sent)}`);
  return z.object({ turn: z.number() }).parse(JSON.parse(sent.stdout)).turn;
}

async function turnDone(tier: WatchTier, address: string, turn: number, ms: number): Promise<void> {
  const seen: Seen | null = await waitFor(session, address, (t: Seen) => t.turn > turn && idle(t), ms);
  if (seen === null) throw new Error(`${address} never finished turn ${turn}`);
}

// The wrapper logs `call <argv> t=<watcher turn>` per akrogon invocation, holds one `status` call
// while <flags>/hold-status exists, then forwards to the tier shim.
function logbin(tier: WatchTier, name: string, flags: string): { bin: string; calls: string } {
  const bin: string = resolve(leafTemp, `${name}-logbin`);
  const calls: string = resolve(tier.out, `${name}-calls.log`);
  mkdirSync(bin, { recursive: true });
  writeFileSync(calls, '');
  mkdirSync(flags, { recursive: true });
  writeFileSync(
    resolve(bin, 'akrogon'),
    `#!/bin/sh
if [ "$1" = "status" ] && [ -f '${flags}/hold-status' ]; then
  sleep "$(cat '${flags}/hold-status')"
  rm -f '${flags}/hold-status'
fi
turn=$(hc get --json "$HC_TERMINAL_ID" 2>/dev/null | grep -o '"turn":[0-9]*' | head -1 | cut -d: -f2)
echo "call $* t=\${turn:-?}" >> '${calls}'
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

async function waitDue(tier: WatchTier, timer: string, due: number, ms: number): Promise<void> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const t: Term = await get(tier, timer);
    if (t.labels['akrogon.watch-due'] === String(due)) return;
    await Bun.sleep(500);
  }
  throw new Error(`receipt due=${due} missing: ${JSON.stringify(await get(tier, timer))}`);
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

// Waits for the watcher to become idle, typing Enter when a shell shows the launch line unsubmitted.
async function launchFromShell(tier: WatchTier, watcher: string, line: string, trust: string | null): Promise<void> {
  await send(tier, watcher, line);
  const deadline: number = Date.now() + 90_000;
  let entered: boolean = false;
  while (Date.now() < deadline) {
    const screen: string = (await tier.hc(['read', watcher, '--lines', '30'])).stdout;
    if (trust !== null && screen.includes(trust)) return; // trust dialog is up: the agent started
    if (!entered && screen.trimEnd().endsWith(line)) {
      await tier.hc(['keys', watcher, 'enter']);
      entered = true;
    }
    if (!entered && /\$\s*$/.test(screen.trimEnd()) && !screen.includes(line)) {
      await tier.hc(['keys', watcher, 'enter']);
      entered = true;
    }
    await Bun.sleep(1000);
  }
  throw new Error(`shell launch never started: ${await screenTail(tier, watcher)}`);
}

async function screenTail(tier: WatchTier, watcher: string): Promise<string> {
  return (await tier.hc(['read', watcher, '--lines', '15'])).stdout;
}

test('watch live: one watcher session per harness and shape', async () => {
  expect(required('AKROGON_E2E')).toBe('watch-live');
  const kind = z.enum(['claude', 'codex', 'pi', 'agy']).parse(required('AKROGON_E2E_KIND'));
  const shape = z.enum(['root', 'shell']).parse(required('AKROGON_E2E_SHAPE'));
  const model: string = process.env.AKROGON_E2E_WATCHER_MODEL ?? models[kind];
  const spec = kinds[kind];
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
  const slug: string = 'watch-live-leaf';
  try {
    await observeReady(tier);
    // The skill reaches the watcher: project link per harness, --skill for pi.
    if (kind === 'claude') {
      mkdirSync(resolve(tier.root, '.claude/skills'), { recursive: true });
      symlinkSync(skill, resolve(tier.root, '.claude/skills/watch-issues'));
    } else if (kind !== 'pi') {
      mkdirSync(resolve(tier.root, '.agents/skills'), { recursive: true });
      symlinkSync(skill, resolve(tier.root, '.agents/skills/watch-issues'));
    }
    const leafPath: string = resolve(tier.root, 'issues/open/e2e', slug);
    mkdirSync(leafPath, { recursive: true });
    await Bun.write(
      resolve(leafPath, 'state.yaml'),
      Bun.YAML.stringify({ slug, phase: 'plan.synthesis', created: '2026-11-20', repo: 'akre2e', 'blocked-by': [] }),
    );

    const watcherPath: string = `${bin}:${tier.shimBin}:${tier.corePath}`;
    const launchEnv: string[] = [
      `XDG_RUNTIME_DIR=${tier.runtime}`,
      `HOME=${realHome}`,
      `PATH=${watcherPath}`,
      `WATCH_TICK_SECONDS=${process.env.WATCH_TICK_SECONDS ?? '30'}`,
    ];
    let watcher: string;
    if (shape === 'shell') {
      const paused0: SpawnResult = await tier.akrogon(['pause']);
      tier.record('pause.txt', `${paused0.code}\n${paused0.stdout}\n${paused0.stderr}`);
      expect(paused0.code).toBe(0);
      const run: SpawnResult = await tier.hc([
        'run',
        '--bg',
        '--json',
        '--name',
        'akr-e2e-watcher',
        '--cwd',
        tier.root,
        '--',
        '/usr/bin/env',
        ...launchEnv,
        'bash',
      ]);
      expect(run.code).toBe(0);
      watcher = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
      await Bun.sleep(1000);
      const ready: Promise<Seen | null> = waitFor(session, watcher, idle, 120_000);
      await launchFromShell(tier, watcher, `env ${launchEnv.join(' ')} ${spec.argv(model).join(' ')}`, spec.trust);
      if (spec.trust !== null) await answerTrust(tier, 'watcher', async () => watcher, spec.trust, ready);
      expect(await ready).not.toBeNull();
      const st0: number = statusCalls(callLog);
      const turn0: number = await send(tier, watcher, `watch-issues ${tier.root}`);
      await turnDone(tier, watcher, turn0, 300_000);
      tier.record('start-screen.txt', await screenTail(tier, watcher));
      // Paused start: timer claims the name and the check ran, acting on nothing.
      const timers0: Term[] = await labelled(tier);
      expect(timers0).toHaveLength(1);
      expect(timers0[0].name).toBe('aw-watch');
      expect(statusCalls(callLog)).toBeGreaterThanOrEqual(st0 + 1);
      expect(nextCalls(callLog)).toBe(0);
      const timer0: string = timers0[0].address;
      expect(timers0[0].parent).toBe(watcher);
      expect(z.string().parse(timers0[0].argv?.join(' '))).toContain('skills/watch-issues/scripts/timer.ts');
      // Unpause → next due acts on the waiting leaf.
      const unpaused: SpawnResult = await tier.akrogon(['unpause']);
      expect(unpaused.code).toBe(0);
      await waitDue(tier, timer0, 1, 120_000);
      await waitCalls(callLog, (l) => l.startsWith('call next'), 1, 120_000);
      // Pause again → the next due counts delivered but acts on nothing.
      const paused1: SpawnResult = await tier.akrogon(['pause']);
      expect(paused1.code).toBe(0);
      const beforeNext: number = nextCalls(callLog);
      await waitDue(tier, timer0, 2, 120_000);
      await waitCalls(callLog, (l) => l.startsWith('call status'), statusCalls(callLog) + 1, 120_000);
      expect(nextCalls(callLog)).toBe(beforeNext);
      // Agent exit: kill the harness; the timer exits and no tick text lands in the shell.
      const wTerm: Term = await get(tier, watcher);
      const agentPid: number = z.number().parse(wTerm.foreground?.pid);
      process.kill(agentPid, 'SIGTERM');
      const deadline: number = Date.now() + 15_000;
      while ((await get(tier, watcher)).foreground?.pid === agentPid && Date.now() < deadline) await Bun.sleep(300);
      if ((await get(tier, watcher)).foreground?.pid === agentPid) process.kill(agentPid, 'SIGKILL');
      const goneDeadline: number = Date.now() + 90_000;
      while (Date.now() < goneDeadline && !(await gone(tier, timer0))) await Bun.sleep(500);
      expect(await gone(tier, timer0)).toBe(true);
      await Bun.sleep(Number(process.env.WATCH_TICK_SECONDS ?? '30') * 1000 + 15_000);
      const screen: string = (await tier.hc(['read', watcher, '--lines', '40'])).stdout;
      tier.record('after-exit-screen.txt', screen);
      expect(screen).not.toContain('watch-issues tick');
      await dropTrust(tier, tier.root);
      return;
    }

    // shape=root
    const run: SpawnResult = await tier.hc([
      'run',
      '--bg',
      '--json',
      '--name',
      'akr-e2e-watcher',
      '--cwd',
      tier.root,
      '--',
      '/usr/bin/env',
      ...launchEnv,
      ...spec.argv(model),
    ]);
    expect(run.code).toBe(0);
    watcher = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    const ready: Promise<Seen | null> = waitFor(session, watcher, idle, 120_000);
    if (spec.trust !== null) await answerTrust(tier, 'watcher', async () => watcher, spec.trust, ready);
    expect(await ready).not.toBeNull();

    // Start: one check, one verified labelled timer, no cron tool.
    const turn0: number = await send(tier, watcher, `watch-issues ${tier.root}`);
    await turnDone(tier, watcher, turn0, 300_000);
    tier.record('start-screen.txt', await screenTail(tier, watcher));
    const timers1: Term[] = await labelled(tier);
    expect(timers1).toHaveLength(1);
    const timer: string = timers1[0].address;
    expect(timers1[0].name).toBe('aw-watch');
    expect(timers1[0].parent).toBe(watcher);
    const argv: string = z.string().parse(timers1[0].argv?.join(' '));
    expect(argv).toContain('skills/watch-issues/scripts/timer.ts');
    const wTerm: Term = await get(tier, watcher);
    expect(argv).toContain(`--pin-pid ${z.number().parse(wTerm.foreground?.pid)}`);
    expect(statusCalls(callLog)).toBe(1);

    // Second start: one more check, still one timer.
    const turn1: number = await send(tier, watcher, `watch-issues ${tier.root}`);
    await turnDone(tier, watcher, turn1, 300_000);
    expect(statusCalls(callLog)).toBe(2);
    expect(await labelled(tier)).toHaveLength(1);

    // Two dues: each delivers its tick, sets its receipt and runs its own check + next.
    await waitDue(tier, timer, 1, 120_000);
    await waitDue(tier, timer, 2, 120_000);
    await waitCalls(callLog, (l) => l.startsWith('call status'), 4, 60_000);
    expect(nextCalls(callLog)).toBeGreaterThanOrEqual(2);

    // Busy: the next status call is held ~2.5 intervals; accrued dues each run their own check.
    writeFileSync(resolve(flags, 'hold-status'), '75');
    const heldAt: number = statusCalls(callLog);
    await waitDue(tier, timer, 3, 180_000);
    await waitDue(tier, timer, 4, 180_000);
    await waitCalls(callLog, (l) => l.startsWith('call status'), heldAt + 2, 120_000);

    // Old cron tick: no timer= → no check.
    const beforeOld: number = statusCalls(callLog);
    const turnOld: number = await send(tier, watcher, `watch-issues tick ${tier.root}`);
    await turnDone(tier, watcher, turnOld, 180_000);
    expect(statusCalls(callLog)).toBe(beforeOld);

    // Stop, repeated stop, restart, old-address tick refused.
    const turnStop: number = await send(tier, watcher, `watch-issues stop ${tier.root}`);
    await turnDone(tier, watcher, turnStop, 120_000);
    expect(await labelled(tier)).toHaveLength(0);
    const turnStop2: number = await send(tier, watcher, `watch-issues stop ${tier.root}`);
    await turnDone(tier, watcher, turnStop2, 120_000);
    tier.record('stop-screen.txt', await screenTail(tier, watcher));
    const turnRe: number = await send(tier, watcher, `watch-issues ${tier.root}`);
    await turnDone(tier, watcher, turnRe, 300_000);
    const timers2: Term[] = await labelled(tier);
    expect(timers2).toHaveLength(1);
    const timer2: string = timers2[0].address;
    expect(timer2).not.toBe(timer);
    const wTerm2: Term = await get(tier, watcher);
    const pinPid: number = z.number().parse(wTerm2.foreground?.pid);
    const beforeForged: number = statusCalls(callLog);
    const turnForged: number = await send(
      tier,
      watcher,
      `watch-issues tick timer=${timer} pid=${pinPid} due=9 ${tier.root}`,
    );
    await turnDone(tier, watcher, turnForged, 180_000);
    expect(statusCalls(callLog)).toBe(beforeForged);

    // Reset: /clear on claude and agy ends the watch; codex and pi /new is a recorded limit.
    const reset: string[] =
      kind === 'claude' || kind === 'agy' ? ['/', 'c', 'l', 'e', 'a', 'r', 'enter'] : ['/', 'n', 'e', 'w', 'enter'];
    await tier.hc(['keys', watcher, ...reset]);
    await Bun.sleep(90_000);
    const timers3: Term[] = await labelled(tier);
    const resetScreen: string = (await tier.hc(['read', watcher, '--lines', '60'])).stdout;
    tier.record('reset.json', { timers: timers3.map((t) => t.address), screen: resetScreen });
    if (kind === 'claude' || kind === 'agy') {
      expect(timers3).toHaveLength(0);
      expect(resetScreen).not.toContain('watch-issues tick');
    }
    await dropTrust(tier, tier.root);
  } finally {
    const left: string[] = await stopWatchTier(tier, [leafTemp]);
    tier.record('absence.json', { left });
    expect(left).toEqual([]);
  }
}, 600_000);
