import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { type Batch } from './state';

export const attemptOutcomeSchema = z.enum(['merged', 'red', 'split', 'held', 'reuse', 'ejected']);
export type Outcome = z.infer<typeof attemptOutcomeSchema>;

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
});

export function appendAttempt(repo: Repo, holder: string, batch: Batch, outcome: Outcome, culprit?: string): void {
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
  });
  appendFileSync(resolve(repo.root, 'issues/merge-attempts.jsonl'), JSON.stringify(record) + '\n');
}
