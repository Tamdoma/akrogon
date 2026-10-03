#!/usr/bin/env bun
import { statSync } from 'node:fs';
import { z } from 'zod';

const waitSuccessSchema = z.object({
  result: z.object({
    agent: z.object({ agent_status: z.string() }),
  }),
});

const herdrErrorSchema = z.object({
  error: z.object({ code: z.string() }),
});

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

async function runWait(pane: string, timeoutMs: number): Promise<RunResult | null> {
  try {
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
      ['herdr', 'agent', 'wait', pane, '--timeout', String(timeoutMs)],
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
  let lastStatus: string | null = null;
  let remaining: number = deadline - performance.now();
  while (remaining > 0) {
    const timeoutMs: number = Math.floor(Math.min(10000, remaining));
    const result: RunResult | null = await runWait(pane, timeoutMs);
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
    if (status === 'idle' || status === 'done') return finish('failure', pane, file, lastStatus);
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
