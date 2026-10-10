import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { command, run } from './shell';
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
  members: z.array(z.string()),
  built_on: z.string(),
  tested_top: z.string().optional(),
  outcome: attemptOutcomeSchema,
  culprit: z.string().optional(),
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

export async function resolveTools(repo: Repo): Promise<Tool[]> {
  return Promise.all(
    repo.config.tools.map(async (name): Promise<Tool> => {
      const path: string = await command(['which', name]);
      const probe: Awaited<ReturnType<typeof run>> = await run([name, '--version']);
      const first: string = (probe.stdout !== '' ? probe.stdout : probe.stderr).split('\n', 1)[0];
      return { name, path, version: probe.code === 0 && first !== '' ? first : 'unknown' };
    }),
  );
}

export function appendAttempt(
  repo: Repo,
  holder: string,
  batch: Batch,
  outcome: Outcome,
  culprit?: string,
  end?: PressureSnapshot,
): void {
  const record: z.infer<typeof attemptRecordSchema> = attemptRecordSchema.parse({
    attempt: batch.attempt,
    repo: repo.name,
    holder,
    members: batch.members.map((member) => member.slug),
    built_on: batch.built_on,
    tested_top: batch.tested_top,
    outcome,
    culprit,
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
