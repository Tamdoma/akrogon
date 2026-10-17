#!/usr/bin/env bun
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';

type Ask = { pane: string; file: string; message: string };
type Exchange = { kind: string; session: string | null; boundary: number | null; turn: string | null };

const peerWait: string = resolve(import.meta.dir, 'peer-wait.ts');

const agentListSchema = z.object({
  result: z.object({
    agents: z.array(
      z.object({
        pane_id: z.string(),
        agent: z.string(),
        agent_session: z.object({ kind: z.string(), value: z.string() }).optional(),
      }),
    ),
  }),
});

function parseAsks(rest: string[]): Ask[] {
  return Array.from({ length: rest.length / 3 }, (_: unknown, i: number): Ask => ({
    pane: rest[i * 3],
    file: rest[i * 3 + 1],
    message: rest[i * 3 + 2],
  }));
}

// Prompting and waiting are one call, so no peer is prompted without A collecting its answer.
// A failed prompt is reported and skips that peer's wait; the others are still waited on.
function prompt(ask: Ask): boolean {
  const result: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(
    ['herdr', 'agent', 'prompt', ask.pane, ask.message, '--wait', '--until', 'working', '--timeout', '5000'],
    { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
  );
  if (result.exitCode === 0) return true;
  process.stderr.write(
    `herdr agent prompt ${ask.pane} failed (exit ${result.exitCode ?? `signal ${result.signalCode}`}): ${result.stderr.toString()}`,
  );
  return false;
}

// The exchange identity is seeded before the prompt so peer-wait binds the same turn on every
// budget rerun; for codex the boundary is the rollout's byte length at prompt time.
function seedExchange(pane: string): Exchange | null {
  const result: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['herdr', 'agent', 'list'], {
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode !== 0) {
    process.stderr.write(
      `herdr agent list failed (exit ${result.exitCode ?? `signal ${result.signalCode}`}): ${result.stderr.toString()}`,
    );
    return null;
  }
  const parsed = agentListSchema.safeParse(JSON.parse(result.stdout.toString()));
  const agent = parsed.success ? parsed.data.result.agents.find((a) => a.pane_id === pane) : undefined;
  if (agent === undefined) {
    process.stderr.write(`No herdr agent on pane ${pane}; skipping its wait\n`);
    return null;
  }
  const session: string | null = agent.agent_session?.value ?? null;
  let boundary: number | null = null;
  if (agent.agent === 'codex' && session !== null) {
    const root: string = `${homedir()}/.codex/sessions`;
    const matches: string[] = existsSync(root)
      ? Array.from(new Bun.Glob(`**/rollout-*-${session}.jsonl`).scanSync({ cwd: root, absolute: true }))
      : [];
    if (matches.length === 1) boundary = statSync(matches[0]).size;
  }
  return { kind: agent.agent, session, boundary, turn: null };
}

async function wait(ask: Ask, exchange: Exchange, budget: string): Promise<boolean> {
  const child: Bun.Subprocess<'ignore', 'inherit', 'inherit'> = Bun.spawn(
    [process.execPath, peerWait, ask.pane, ask.file, budget, JSON.stringify(exchange)],
    { stdin: 'ignore', stdout: 'inherit', stderr: 'inherit' },
  );
  return (await child.exited) === 0;
}

async function main(): Promise<void> {
  const rest: string[] = process.argv.slice(3);
  if (process.argv.length < 6 || rest.length % 3 !== 0) {
    process.stderr.write(
      'Usage: peer-ask.ts <budget-seconds> <pane> <return-file> <message> [<pane> <return-file> <message>]...\n',
    );
    process.exit(1);
  }
  const budget: string = process.argv[2];
  if (!(Number(budget) > 0) || !Number.isFinite(Number(budget))) {
    process.stderr.write(`Invalid budget-seconds: ${budget}\n`);
    process.exit(1);
  }
  const asks: Ask[] = parseAsks(rest);
  const files: string[] = asks.map((ask: Ask): string => resolve(ask.file));
  if (new Set(files).size !== files.length) {
    process.stderr.write(`Each peer needs its own return file: ${files.join(' ')}\n`);
    process.exit(1);
  }
  const reused: Ask[] = asks.filter((ask: Ask): boolean => existsSync(ask.file));
  if (reused.length > 0) {
    process.stderr.write(
      `Return file already exists, use a fresh path per exchange: ${reused.map((a: Ask) => a.file).join(' ')}\n`,
    );
    process.exit(1);
  }
  const seeded: { ask: Ask; exchange: Exchange }[] = [];
  let seedingFailed: boolean = false;
  for (const ask of asks) {
    const exchange: Exchange | null = seedExchange(ask.pane);
    if (exchange === null) {
      seedingFailed = true;
      continue;
    }
    if (!prompt(ask)) {
      seedingFailed = true;
      continue;
    }
    seeded.push({ ask, exchange });
  }
  const waited: boolean[] = await Promise.all(
    seeded.map(({ ask, exchange }): Promise<boolean> => wait(ask, exchange, budget)),
  );
  process.exit(!seedingFailed && seeded.length === asks.length && waited.every(Boolean) ? 0 : 1);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
