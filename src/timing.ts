import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { type LogRecord } from './log';
import { phaseSchema, slotSchema, type Phase } from './routing';

const stamp = { ts: z.iso.datetime(), repo: z.string() };
const slugged = { ...stamp, slug: z.string() };
const visit = z.number().int().nonnegative();
const attempt = z.string();
const seat = { slot: slotSchema, phase: phaseSchema, visit };
const checkCore = {
  run: z.string(),
  phase: phaseSchema.optional(),
  name: z.string(),
  scope: z.enum(['leaf', 'worker', 'base']),
  unit: z.string().optional(),
  attempt: attempt.optional(),
};

const waitReasonSchema = z.enum(['prerequisite', 'parked', 'merge_turn', 'none']);
export type WaitReason = z.infer<typeof waitReasonSchema>;

export const timingEventSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...slugged, kind: z.literal('visit_start'), phase: phaseSchema, visit }),
  z.strictObject({
    ...slugged,
    kind: z.literal('prompt'),
    ...seat,
    session: z.string().nullable(),
    outcome: z.enum(['delivered', 'failed']),
    attempt: attempt.optional(),
  }),
  z.strictObject({ ...slugged, kind: z.literal('seat_done'), ...seat }),
  z.strictObject({ ...slugged, kind: z.literal('check_start'), ...checkCore }),
  z.strictObject({
    ...slugged,
    kind: z.literal('check_end'),
    ...checkCore,
    exit: z.number().int(),
    duration_ms: z.number().int().nonnegative(),
    log: z.string(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('batch'),
    attempt,
    holder: z.string(),
    members: z.array(z.string()),
    built_on: z.string(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('wait'),
    reason: waitReasonSchema,
    blocking: z.string().optional(),
  }),
  z.strictObject({ ...stamp, kind: z.literal('repo_pause'), pause: z.enum(['on', 'off']) }),
]);

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type TimingEvent = z.infer<typeof timingEventSchema>;
export type TimingInput = DistOmit<TimingEvent, 'ts' | 'repo'>;

export function appendTiming(repo: Repo, event: TimingInput): void {
  try {
    appendFileSync(
      resolve(repo.root, 'issues/timings.jsonl'),
      JSON.stringify({ ...event, ts: new Date().toISOString(), repo: repo.name }) + '\n',
    );
  } catch (error) {
    console.warn(`timing append failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function readTimings(root: string): TimingEvent[] {
  try {
    const issues: string = resolve(root, 'issues');
    if (!readdirSync(issues).includes('timings.jsonl')) return [];
    const content: string = readFileSync(resolve(issues, 'timings.jsonl'), 'utf8').replace(/(?:\r?\n)+$/, '');
    return content === '' ? [] : content.split('\n').map((text) => timingEventSchema.parse(JSON.parse(text)));
  } catch (error) {
    console.warn(`timing read failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

export function visitOf(log: LogRecord[], slug: string, phase: Phase): number {
  return log.filter((entry) => entry.record.slug === slug && entry.record.to === phase).length;
}

export function currentVisit(log: LogRecord[], slug: string, phase: Phase): number {
  return Math.max(0, visitOf(log, slug, phase) - 1);
}

export function recordWait(repo: Repo, slug: string, reason: WaitReason, blocking?: string): void {
  const last: TimingEvent | undefined = readTimings(repo.root).findLast(
    (event) => event.kind !== 'repo_pause' && event.slug === slug && (event.kind === 'wait' || event.kind === 'prompt'),
  );
  const open: WaitReason = last !== undefined && last.kind === 'wait' ? last.reason : 'none';
  if (reason === open) return;
  appendTiming(repo, { kind: 'wait', slug, reason, ...(blocking === undefined ? {} : { blocking }) });
}
