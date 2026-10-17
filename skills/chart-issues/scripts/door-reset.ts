#!/usr/bin/env bun
import { appendFileSync, openSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { z } from 'zod';
import { claudeTurnOpen, codexRollout, isTimeoutError, piAuthority, readPeerAgent, type ListAgent } from './peer-wait';

type Args = { pane: string; session: string; log: string; start: string };
type Config = { turnBoundMs: number; confirmMs: number };
type StepResult = { step: string; result: string };

const configSchema = z.object({
  DOOR_RESET_TURN_BOUND_MS: z.coerce.number().int().positive().default(600_000),
  DOOR_RESET_CONFIRM_MS: z.coerce.number().int().positive().default(60_000),
});

const kinds: string[] = ['claude', 'codex', 'pi'];
const resetCommand: Record<string, string> = { claude: '/clear', codex: '/new', pi: '/new' };
const CHECK_PROMPT = 'Reply OK';
const WAIT_ARGS: string[] = ['--wait', '--until', 'working', '--timeout', '5000'];
const POLL_MS = 500;

const rolloutLineSchema = z.object({
  payload: z.object({ type: z.string(), turn_id: z.string().optional() }).optional(),
});

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function logLine(log: string, step: string, result: string, extra: Record<string, unknown> = {}): void {
  appendFileSync(log, `${JSON.stringify({ t: new Date().toISOString(), step, result, ...extra })}\n`);
}

function stop(log: string, step: string, result: string, extra: Record<string, unknown> = {}): number {
  logLine(log, step, result, extra);
  return 1;
}

// herdr reports a codex pane idle during long silent work, so the rollout decides: the turn is
// open while the last task_started has no task_complete or turn_aborted of its own, and it stays
// open when the rollout is missing or holds no bound turn.
function codexTurnOpen(session: string): boolean {
  const rollout: string | null = codexRollout(session);
  if (rollout === null) return true;
  const payloads: { type: string; turn_id?: string }[] = readFileSync(rollout, 'utf8')
    .trimEnd()
    .split('\n')
    .flatMap((line: string): { type: string; turn_id?: string }[] => {
      const parsed = rolloutLineSchema.safeParse(parseJson(line));
      return parsed.success && parsed.data.payload !== undefined ? [parsed.data.payload] : [];
    });
  const started = payloads.findLast((payload) => payload.type === 'task_started' && payload.turn_id !== undefined);
  if (started === undefined) return true;
  return !payloads.some(
    (payload) =>
      payload.turn_id === started.turn_id && (payload.type === 'task_complete' || payload.type === 'turn_aborted'),
  );
}

function turnEnded(kind: string, live: ListAgent, session: string): boolean {
  if (kind === 'claude') return !claudeTurnOpen(session);
  if (kind === 'codex') return !codexTurnOpen(session);
  return piAuthority(live) && live.agent_status !== 'working';
}

function binding(live: ListAgent, session: string): string | null {
  return kinds.includes(live.agent) && live.agent_session?.value === session ? live.agent : null;
}

function herdr(args: string[]): { code: number; stderr: string } {
  const result: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['herdr', ...args], {
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return { code: result.exitCode ?? -1, stderr: result.stderr.toString() };
}

async function waitTurnEnd(args: Args, kind: string, boundMs: number): Promise<StepResult> {
  const deadline: number = Date.now() + boundMs;
  while (true) {
    const live: ListAgent = await readPeerAgent(args.pane);
    if (binding(live, args.session) !== kind) return { step: 'wait-turn-end', result: 'identity changed' };
    if (turnEnded(kind, live, args.session)) return { step: 'wait-turn-end', result: 'turn ended' };
    const remaining: number = deadline - Date.now();
    if (remaining <= 0) return { step: 'wait-turn-end', result: 'turn open' };
    await Bun.sleep(Math.min(POLL_MS, remaining));
  }
}

async function waitNewSession(args: Args, boundMs: number): Promise<string | null> {
  const deadline: number = Date.now() + boundMs;
  while (true) {
    const live: ListAgent = await readPeerAgent(args.pane);
    const session: string | null = live.agent_session?.value ?? null;
    if (session !== null && session !== args.session) return session;
    const remaining: number = deadline - Date.now();
    if (remaining <= 0) return null;
    await Bun.sleep(Math.min(POLL_MS, remaining));
  }
}

// The reset is only sent once the bound turn has provably ended, and the start prompt only once a
// different session proves the reset took: herdr accepts a prompt at any status, so the log is the
// only record of which step the handover reached.
async function child(args: Args, config: Config): Promise<number> {
  const live: ListAgent = await readPeerAgent(args.pane);
  const kind: string | null = binding(live, args.session);
  if (kind === null) return stop(args.log, 'wait-turn-end', 'identity changed');
  const turn: StepResult = await waitTurnEnd(args, kind, config.turnBoundMs);
  logLine(args.log, turn.step, turn.result);
  if (turn.result !== 'turn ended') return 1;
  if (binding(await readPeerAgent(args.pane), args.session) !== kind)
    return stop(args.log, 'recheck', 'identity changed');
  logLine(args.log, 'recheck', 'identity held');
  const reset: string = resetCommand[kind];
  const sent: { code: number; stderr: string } = herdr(['agent', 'prompt', args.pane, reset]);
  if (sent.code !== 0)
    return stop(args.log, 'send-reset', 'reset refused', { reset, code: sent.code, stderr: sent.stderr });
  logLine(args.log, 'send-reset', 'sent', { reset });
  if (kind === 'codex') {
    const check: { code: number; stderr: string } = herdr(['agent', 'prompt', args.pane, CHECK_PROMPT, ...WAIT_ARGS]);
    if (check.code !== 0)
      return stop(args.log, 'send-check-prompt', 'prompt_stalled', { code: check.code, stderr: check.stderr });
    logLine(args.log, 'send-check-prompt', 'sent');
    const ended: { code: number; stderr: string } = herdr([
      'agent',
      'wait',
      args.pane,
      '--timeout',
      String(config.turnBoundMs),
      '--until',
      'idle',
      '--until',
      'done',
    ]);
    if (ended.code !== 0 && isTimeoutError(ended.stderr)) return stop(args.log, 'wait-check-end', 'turn open');
    if (ended.code !== 0)
      return stop(args.log, 'wait-check-end', 'wait failed', { code: ended.code, stderr: ended.stderr });
    logLine(args.log, 'wait-check-end', (await readPeerAgent(args.pane)).agent_status);
  }
  const confirmed: string | null = await waitNewSession(args, config.confirmMs);
  if (confirmed === null) return stop(args.log, 'wait-new-session', 'reset unconfirmed');
  logLine(args.log, 'wait-new-session', 'confirmed', { session: confirmed });
  const started: { code: number; stderr: string } = herdr(['agent', 'prompt', args.pane, args.start, ...WAIT_ARGS]);
  if (started.code !== 0)
    return stop(args.log, 'send-start-prompt', 'prompt_stalled', { code: started.code, stderr: started.stderr });
  logLine(args.log, 'send-start-prompt', 'sent');
  return 0;
}

async function main(): Promise<void> {
  const argv: string[] = process.argv.slice(2);
  if (argv.length !== 4) {
    process.stderr.write('Usage: door-reset.ts <pane> <session> <log> <start prompt>\n');
    process.exit(1);
  }
  const [pane, session, log, start] = argv;
  const args: Args = { pane, session, log, start };
  const env = configSchema.parse(process.env);
  const config: Config = { turnBoundMs: env.DOOR_RESET_TURN_BOUND_MS, confirmMs: env.DOOR_RESET_CONFIRM_MS };
  if (process.env.DOOR_RESET_CHILD === '1') process.exit(await child(args, config));
  const live: ListAgent = await readPeerAgent(pane);
  const held: string = live.agent_session?.value ?? 'no session';
  if (!kinds.includes(live.agent) || live.agent_session?.value !== session) {
    process.stderr.write(`refused: pane ${pane} holds ${live.agent} ${held}, expected ${kinds.join('|')} ${session}\n`);
    process.exit(1);
  }
  if (process.env.DOOR_RESET_INLINE === '1') process.exit(await child(args, config));
  const stdio: number = openSync(log, 'a');
  spawn(process.execPath, [import.meta.path, ...argv], {
    detached: true,
    stdio: ['ignore', stdio, stdio],
    env: { ...process.env, DOOR_RESET_CHILD: '1' },
  }).unref();
  process.stdout.write('queued\n');
  process.exit(0);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
