import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { command, CommandError, run } from './shell';
import { toolSchema, type Batch, type Tool } from './state';

export const attemptOutcomeSchema = z.enum(['merged', 'red', 'split', 'held', 'reuse', 'ejected']);
export type Outcome = z.infer<typeof attemptOutcomeSchema>;

export type PressureSnapshot = { cpu: number; memory: number; io: number; boot_id: string };

export function readPressure(dir: string = '/proc/pressure'): PressureSnapshot | undefined {
  if (!existsSync(dir)) return undefined;
  const total = (resource: 'cpu' | 'memory' | 'io'): number => {
    const file: string = join(dir, resource);
    const line: string | undefined = readFileSync(file, 'utf8')
      .split('\n')
      .find((entry) => entry.startsWith('some '));
    const match: RegExpMatchArray | null = line === undefined ? null : /(?:^|\s)total=(\d+)(?=\s|$)/.exec(line);
    if (match === null) throw new Error(`Pressure file ${file} has no integer total= on its some line`);
    return Number.parseInt(match[1], 10);
  };
  const bootId: string = readFileSync(join(dir, '..', 'sys', 'kernel', 'random', 'boot_id'), 'utf8').trim();
  return { cpu: total('cpu'), memory: total('memory'), io: total('io'), boot_id: bootId };
}

export const attemptRecordSchema = z.object({
  attempt: z.string(),
  repo: z.string(),
  holder: z.string(),
  built_on: z.string(),
  tested_top: z.string().optional(),
  outcome: attemptOutcomeSchema,
  members: z.array(z.union([z.string(), z.strictObject({ slug: z.string(), head: z.string() })])).optional(),
  start: z.string().optional(),
  end: z.string(),
  pressure: z
    .object({
      cpu: z.number().int().nonnegative(),
      memory: z.number().int().nonnegative(),
      io: z.number().int().nonnegative(),
    })
    .optional(),
  tools: z.array(toolSchema).optional(),
});

export type AttemptRecord = z.infer<typeof attemptRecordSchema>;

export function readAttempts(repo: Repo): AttemptRecord[] {
  const file: string = resolve(repo.root, 'issues/merge-attempts.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => attemptRecordSchema.parse(JSON.parse(line)));
}

// Member heads already proven red on this base; stacking them again would repeat the same failure.
export function redMemberHeads(repo: Repo, builtOn: string): Set<string> {
  return new Set(
    readAttempts(repo).flatMap((record) =>
      record.outcome === 'red' && record.built_on === builtOn
        ? (record.members ?? []).flatMap((member) => (typeof member === 'string' ? [] : [member.head]))
        : [],
    ),
  );
}

export async function resolveTools(repo: Repo): Promise<Tool[]> {
  return Promise.all(
    repo.config.tools.map(async (name): Promise<Tool> => {
      const path: string = await command(['which', name]);
      const argv: string[] = [path, name === 'ffmpeg' ? '-version' : '--version'];
      const probe: Awaited<ReturnType<typeof run>> = await run(argv);
      const first: string = (probe.stdout !== '' ? probe.stdout : probe.stderr).split('\n', 1)[0];
      if (probe.code !== 0 || first === '') throw new CommandError(argv, process.cwd(), probe);
      return { name, path, version: first };
    }),
  );
}

export function appendAttempt(
  repo: Repo,
  holder: string,
  batch: Batch,
  outcome: Outcome,
  end?: PressureSnapshot,
): void {
  const record: z.infer<typeof attemptRecordSchema> = attemptRecordSchema.parse({
    attempt: batch.attempt,
    repo: repo.name,
    holder,
    built_on: batch.built_on,
    tested_top: batch.tested_top,
    outcome,
    members:
      batch.members.length === 0
        ? undefined
        : batch.members.map((member) => ({ slug: member.slug, head: member.head })),
    start: batch.started,
    end: new Date().toISOString(),
    tools: batch.tools,
    pressure:
      batch.pressure_start !== undefined && end !== undefined && end.boot_id === batch.pressure_start.boot_id
        ? {
            cpu: end.cpu - batch.pressure_start.cpu,
            memory: end.memory - batch.pressure_start.memory,
            io: end.io - batch.pressure_start.io,
          }
        : undefined,
  });
  appendFileSync(resolve(repo.root, 'issues/merge-attempts.jsonl'), JSON.stringify(record) + '\n');
}
