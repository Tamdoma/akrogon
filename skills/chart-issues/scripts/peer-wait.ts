#!/usr/bin/env bun
import { readFileSync, statSync } from 'node:fs';
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
        agent_session: z.object({ value: z.string() }).optional(),
      }),
    ),
  }),
});

const transcriptLineSchema = z.object({
  type: z.string(),
  subtype: z.string().optional(),
  message: z.object({ content: z.unknown() }).optional(),
});

type PeerAgent = { kind: string; session: string | null };

type RunResult = { code: number; stdout: string; stderr: string };
type Outcome = 'done' | 'blocked' | 'failure' | 'budget';

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
      ['herdr', 'agent', 'wait', pane, '--timeout', String(timeoutMs), ...until.flatMap((u: string): string[] => ['--until', u])],
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

async function readPeerAgent(pane: string): Promise<PeerAgent> {
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
  const agent = agentListSchema.parse(JSON.parse(stdout)).result.agents.find((a) => a.pane_id === pane);
  if (agent === undefined) throw new Error(`No herdr agent on pane ${pane}`);
  return { kind: agent.agent, session: agent.agent_session?.value ?? null };
}

// herdr shows a Claude pane idle during long silent thinking, so for Claude the session
// transcript decides: the turn is open until a turn_duration entry follows the last prompt.
function claudeTurnOpen(session: string): boolean {
  const matches: string[] = Array.from(
    new Bun.Glob(`*/${session}.jsonl`).scanSync({ cwd: `${homedir()}/.claude/projects`, absolute: true }),
  );
  if (matches.length !== 1) throw new Error(`Expected one Claude transcript for session ${session}, found ${matches.length}`);
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

function turnOpen(agent: PeerAgent): boolean {
  if (agent.kind !== 'claude') return false;
  if (agent.session === null) throw new Error('Claude peer has no herdr session id');
  return claudeTurnOpen(agent.session);
}

function finish(outcome: Outcome, pane: string, file: string, status: string | null): never {
  const line: string = JSON.stringify({ outcome, pane, file, status });
  process.stdout.write(`${line}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  if (process.argv.length !== 5) {
    process.stderr.write('Usage: peer-wait.ts <pane> <return-file> <budget-seconds>\n');
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
  const agent: PeerAgent = await readPeerAgent(pane);
  let lastStatus: string | null = null;
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
    if (status === 'blocked') return finish('blocked', pane, file, lastStatus);
    if (fileNonEmpty(file)) return finish('done', pane, file, lastStatus);
    if (status === 'idle' || status === 'done') {
      // herdr can report a peer idle or done inside one open turn, so a turn counts as ended
      // only when the pane stays out of working for the grace period and, for Claude, the transcript agrees.
      const graceMs: number = Math.floor(Math.min(IDLE_GRACE_MS, deadline - performance.now()));
      if (graceMs <= 0) return finish('budget', pane, file, lastStatus);
      const resumed: RunResult | null = await runWait(pane, graceMs, ['working']);
      if (resumed !== null && resumed.code !== 0 && !isTimeoutError(resumed.stderr)) {
        process.stderr.write(resumed.stderr);
        process.exit(resumed.code);
      }
      if (fileNonEmpty(file)) return finish('done', pane, file, lastStatus);
      const resumedWorking: boolean = resumed !== null && resumed.code === 0;
      if (!resumedWorking && !turnOpen(agent)) {
        return finish(graceMs < IDLE_GRACE_MS ? 'budget' : 'failure', pane, file, lastStatus);
      }
      if (resumedWorking) lastStatus = 'working';
    }
    remaining = deadline - performance.now();
    if (remaining <= 0) return finish('budget', pane, file, lastStatus);
  }
  return finish('budget', pane, file, lastStatus);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
