#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

type Ask = { pane: string; file: string; message: string };

const peerWait: string = resolve(import.meta.dir, 'peer-wait.ts');

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

async function wait(ask: Ask, budget: string): Promise<boolean> {
  const child: Bun.Subprocess<'ignore', 'inherit', 'inherit'> = Bun.spawn(
    [process.execPath, peerWait, ask.pane, ask.file, budget],
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
  const started: Ask[] = asks.filter(prompt);
  const waited: boolean[] = await Promise.all(started.map((ask: Ask): Promise<boolean> => wait(ask, budget)));
  process.exit(started.length === asks.length && waited.every(Boolean) ? 0 : 1);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
