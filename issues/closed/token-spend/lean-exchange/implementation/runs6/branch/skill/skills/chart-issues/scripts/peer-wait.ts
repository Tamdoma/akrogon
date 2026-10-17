#!/usr/bin/env bun
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { z } from 'zod';

const waitSuccessSchema = z.object({
  result: z.object({
    agent: z.object({ agent_status: z.string() }),
  }),
});

const herdrErrorSchema = z.object({
  error: z.object({ code: z.string() }),
});

const agentListSchema = z.object({
  result: z.object({
    agents: z.array(
      z.object({
        pane_id: z.string(),
        agent: z.string(),
        agent_status: z.string(),
        agent_session: z
          .object({
            kind: z.string(),
            value: z.string(),
            source: z.string().optional(),
            agent: z.string().optional(),
          })
          .optional(),
        screen_detection_skipped: z.boolean().nullish(),
      }),
    ),
  }),
});

const transcriptLineSchema = z.object({
  type: z.string(),
  subtype: z.string().optional(),
  message: z.object({ content: z.unknown() }).optional(),
});

const rolloutLineSchema = z.object({
  payload: z.object({ type: z.string(), turn_id: z.string().optional() }).optional(),
});

const exchangeSchema = z.object({
  kind: z.string(),
  session: z.string().nullable(),
  boundary: z.number().nullable(),
  turn: z.string().nullable(),
});

type Exchange = z.infer<typeof exchangeSchema>;
type ListAgent = z.infer<typeof agentListSchema>['result']['agents'][number];

type RunResult = { code: number; stdout: string; stderr: string };
type Outcome = 'done' | 'blocked' | 'failure' | 'budget';
type Verdict = 'ended' | 'open' | 'unproven';

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isTimeoutError(stderr: string): boolean {
  const parsed: z.ZodSafeParseResult<z.infer<typeof herdrErrorSchema>> = herdrErrorSchema.safeParse(parseJson(stderr));
  return parsed.success && parsed.data.error.code === 'timeout';
}

function parseStatus(stdout: string): string | null {
  const parsed: z.ZodSafeParseResult<z.infer<typeof waitSuccessSchema>> = waitSuccessSchema.safeParse(
    parseJson(stdout),
  );
  return parsed.success ? parsed.data.result.agent.agent_status : null;
}

function fileNonEmpty(path: string): boolean {
  try {
    return statSync(path).size > 0;
  } catch {
    return false;
  }
}

const IDLE_GRACE_MS: number = 10000;

async function runWait(pane: string, timeoutMs: number, until: string[]): Promise<RunResult | null> {
  try {
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
      [
        'herdr',
        'agent',
        'wait',
        pane,
        '--timeout',
        String(timeoutMs),
        ...until.flatMap((u: string): string[] => ['--until', u]),
      ],
      { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
    );
    const [stdout, stderr, code]: [string, string, number] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return { code, stdout, stderr };
  } catch {
    return null;
  }
}

async function readPeerAgent(pane: string): Promise<ListAgent> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(['herdr', 'agent', 'list'], {
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if (code !== 0) throw new Error(`herdr agent list failed (exit ${code}): ${stderr}`);
  const agent: ListAgent | undefined = agentListSchema
    .parse(JSON.parse(stdout))
    .result.agents.find((a) => a.pane_id === pane);
  if (agent === undefined) throw new Error(`No herdr agent on pane ${pane}`);
  return agent;
}

function piAuthority(live: ListAgent): boolean {
  return live.agent === 'pi' && live.agent_session?.source === 'herdr:pi' && live.screen_detection_skipped === true;
}

// Pane identity is re-read at each grace check against the carried exchange: a kind change is an
// error for every kind, a session change between two non-null values is an error for claude and
// codex (pi ignores it and lets the hook-authority check decide), and a session appearing later
// is adopted.
function checkIdentity(pane: string, live: ListAgent, exchange: Exchange): void {
  if (live.agent !== exchange.kind) throw new Error(`Peer pane ${pane} changed kind: ${exchange.kind} → ${live.agent}`);
  const liveSession: string | null = live.agent_session?.value ?? null;
  if (
    exchange.session !== null &&
    liveSession !== null &&
    liveSession !== exchange.session &&
    (exchange.kind === 'claude' || exchange.kind === 'codex')
  ) {
    throw new Error(`Peer pane ${pane} changed session: ${exchange.session} → ${liveSession}`);
  }
  if (exchange.session === null && liveSession !== null) exchange.session = liveSession;
}

// herdr shows a Claude pane idle during long silent thinking, so for Claude the session
// transcript decides: the turn is open until a turn_duration entry follows the last prompt.
function claudeTurnOpen(session: string): boolean {
  const matches: string[] = Array.from(
    new Bun.Glob(`*/${session}.jsonl`).scanSync({ cwd: `${homedir()}/.claude/projects`, absolute: true }),
  );
  if (matches.length !== 1)
    throw new Error(`Expected one Claude transcript for session ${session}, found ${matches.length}`);
  const lines: string[] = readFileSync(matches[0], 'utf8').trimEnd().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const parsed = transcriptLineSchema.safeParse(parseJson(lines[i]));
    if (!parsed.success) continue;
    const entry = parsed.data;
    if (entry.type === 'system' && entry.subtype === 'turn_duration') return false;
    if (entry.type === 'user' && typeof entry.message?.content === 'string') return true;
  }
  return false;
}

// Codex proves its turn through the rollout: bind the first task_started written after the
// pre-prompt boundary, then end only on that turn's task_complete or turn_aborted.
function codexRollout(session: string): string | null {
  const root: string = `${homedir()}/.codex/sessions`;
  if (!existsSync(root)) return null;
  const matches: string[] = Array.from(
    new Bun.Glob(`**/rollout-*-${session}.jsonl`).scanSync({ cwd: root, absolute: true }),
  );
  return matches.length === 1 ? matches[0] : null;
}

function codexEnded(exchange: Exchange): Verdict {
  if (exchange.session === null || exchange.boundary === null) return 'unproven';
  const rollout: string | null = codexRollout(exchange.session);
  if (rollout === null) return 'unproven';
  // the boundary is a byte length recorded before the prompt, so slice the buffer not the string
  const lines: string[] = readFileSync(rollout).subarray(exchange.boundary).toString('utf8').trimEnd().split('\n');
  if (exchange.turn === null) {
    for (const line of lines) {
      const parsed = rolloutLineSchema.safeParse(parseJson(line));
      if (parsed.success && parsed.data.payload?.type === 'task_started' && parsed.data.payload.turn_id !== undefined) {
        exchange.turn = parsed.data.payload.turn_id;
        break;
      }
    }
    if (exchange.turn === null) return 'unproven';
  }
  for (const line of lines) {
    const parsed = rolloutLineSchema.safeParse(parseJson(line));
    if (!parsed.success) continue;
    const payload = parsed.data.payload;
    if (payload?.turn_id === exchange.turn && (payload.type === 'task_complete' || payload.type === 'turn_aborted'))
      return 'ended';
  }
  return 'open';
}

// A kind without a proven end signal (agy or any other) stays unproven and never fails on idle.
function turnVerdict(live: ListAgent, exchange: Exchange): { verdict: Verdict; proven: boolean } {
  switch (exchange.kind) {
    case 'claude': {
      if (exchange.session === null) return { verdict: 'unproven', proven: false };
      return { verdict: claudeTurnOpen(exchange.session) ? 'open' : 'ended', proven: true };
    }
    case 'pi':
      return piAuthority(live) ? { verdict: 'ended', proven: true } : { verdict: 'unproven', proven: false };
    case 'codex': {
      const verdict: Verdict = codexEnded(exchange);
      return { verdict, proven: verdict !== 'unproven' };
    }
    default:
      return { verdict: 'unproven', proven: false };
  }
}

// The outcome line carries the session herdr shows once the wait is over, so the caller needs no
// separate agent list read; a session that appeared during the wait is the post-exchange value.
async function finish(
  outcome: Outcome,
  pane: string,
  file: string,
  status: string | null,
  signal: 'proven' | 'unproven',
  exchange: Exchange,
): Promise<never> {
  const agent: ListAgent = await readPeerAgent(pane);
  const session: string | null = agent.agent_session?.value ?? null;
  const line: string = JSON.stringify({ outcome, pane, file, status, signal, exchange, session });
  process.stdout.write(`${line}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  if (process.argv.length !== 5 && process.argv.length !== 6) {
    process.stderr.write('Usage: peer-wait.ts <pane> <return-file> <budget-seconds> [exchange-json]\n');
    process.exit(1);
  }
  const pane: string = process.argv[2];
  const file: string = process.argv[3];
  const budgetArg: string = process.argv[4];
  const budgetSeconds: number = Number(budgetArg);
  if (!Number.isFinite(budgetSeconds) || budgetSeconds <= 0) {
    process.stderr.write(`Invalid budget-seconds: ${budgetArg}\n`);
    process.exit(1);
  }
  const deadline: number = performance.now() + budgetSeconds * 1000;
  const agent: ListAgent = await readPeerAgent(pane);
  const exchange: Exchange =
    process.argv.length === 6
      ? exchangeSchema.parse(parseJson(process.argv[5] ?? ''))
      : {
          kind: agent.agent,
          session: agent.agent_session?.value ?? null,
          boundary: null,
          turn: null,
        };
  let lastStatus: string | null = null;
  let lastProven: boolean = false;
  let remaining: number = deadline - performance.now();
  while (remaining > 0) {
    const timeoutMs: number = Math.floor(Math.min(10000, remaining));
    const result: RunResult | null = await runWait(pane, timeoutMs, []);
    let status: string | null = null;
    if (result !== null) {
      if (result.code !== 0) {
        if (!isTimeoutError(result.stderr)) {
          process.stderr.write(result.stderr);
          process.exit(result.code);
        }
      } else {
        status = parseStatus(result.stdout);
        if (status === null) {
          process.stderr.write(result.stderr);
          process.exit(1);
        }
        lastStatus = status;
      }
    }
    if (status === 'blocked') return finish('blocked', pane, file, lastStatus, 'proven', exchange);
    if (fileNonEmpty(file)) return finish('done', pane, file, lastStatus, 'proven', exchange);
    if (status === 'idle' || status === 'done') {
      // herdr can report a peer idle or done inside one open turn, so a turn counts as ended only
      // when the pane stays out of working for the grace period and the kind's proven signal agrees.
      const graceMs: number = Math.floor(Math.min(IDLE_GRACE_MS, deadline - performance.now()));
      if (graceMs <= 0) return finish('budget', pane, file, lastStatus, lastProven ? 'proven' : 'unproven', exchange);
      const resumed: RunResult | null = await runWait(pane, graceMs, ['working']);
      if (resumed !== null && resumed.code !== 0 && !isTimeoutError(resumed.stderr)) {
        process.stderr.write(resumed.stderr);
        process.exit(resumed.code);
      }
      if (fileNonEmpty(file)) return finish('done', pane, file, lastStatus, 'proven', exchange);
      const live: ListAgent = await readPeerAgent(pane);
      checkIdentity(pane, live, exchange);
      if (live.agent_status === 'blocked') return finish('blocked', pane, file, 'blocked', 'proven', exchange);
      const liveWorking: boolean = live.agent_status === 'working' || (resumed !== null && resumed.code === 0);
      if (liveWorking) {
        lastStatus = 'working';
      } else {
        const { verdict, proven } = turnVerdict(live, exchange);
        if (verdict === 'ended')
          return finish(
            graceMs < IDLE_GRACE_MS ? 'budget' : 'failure',
            pane,
            file,
            live.agent_status,
            'proven',
            exchange,
          );
        lastProven = proven;
        if (proven) lastStatus = live.agent_status;
      }
    }
    remaining = deadline - performance.now();
    if (remaining <= 0) return finish('budget', pane, file, lastStatus, lastProven ? 'proven' : 'unproven', exchange);
  }
  return finish('budget', pane, file, lastStatus, lastProven ? 'proven' : 'unproven', exchange);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
