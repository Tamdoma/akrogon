import {
  appendFileSync,
  closeSync,
  fstatSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  type Stats,
} from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { type LogRecord } from './log';
import { historicalPhaseSchema, slotSchema, type Phase } from './routing';

const stamp = { ts: z.iso.datetime(), repo: z.string() };
const slugged = { ...stamp, slug: z.string() };
const visit = z.number().int().nonnegative();
const attempt = z.string();
const seat = { slot: slotSchema, phase: historicalPhaseSchema, visit };
const checkCore = {
  run: z.string(),
  phase: historicalPhaseSchema.optional(),
  name: z.string(),
  scope: z.enum(['leaf', 'worker', 'base']),
  unit: z.string().optional(),
  attempt: attempt.optional(),
};

const waitReasonSchema = z.enum(['prerequisite', 'parked', 'merge_turn', 'capacity', 'none']);
export type WaitReason = z.infer<typeof waitReasonSchema>;

const visitStartSchema = z.strictObject({
  ...slugged,
  kind: z.literal('visit_start'),
  phase: historicalPhaseSchema,
  visit,
});
const promptSchema = z.strictObject({
  ...slugged,
  kind: z.literal('prompt'),
  ...seat,
  session: z.string().nullable(),
  outcome: z.enum(['delivered', 'failed']),
  attempt: attempt.optional(),
});
const waitSchema = z.strictObject({
  ...slugged,
  kind: z.literal('wait'),
  reason: waitReasonSchema,
  blocking: z.string().optional(),
});

export const timingEventSchema = z.discriminatedUnion('kind', [
  visitStartSchema,
  promptSchema,
  z.strictObject({ ...slugged, kind: z.literal('seat_done'), ...seat }),
  z.strictObject({
    ...slugged,
    kind: z.literal('seat_lost'),
    slot: slotSchema,
    phase: historicalPhaseSchema,
    address: z.string(),
    turn: z.number().int().nonnegative().optional(),
    status: z.string().nullable().optional(),
    exit_code: z.number().int().nullable().optional(),
    signal: z.number().int().nullable().optional(),
    screen: z.string().optional(),
    gone: z.literal(true).optional(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('check_start'),
    ...checkCore,
    wait_ms: z.number().int().nonnegative().optional(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('check_end'),
    ...checkCore,
    exit: z.number().int(),
    duration_ms: z.number().int().nonnegative(),
    log: z.string(),
  }),
  z.strictObject({ ...slugged, kind: z.literal('check_refused'), ...checkCore }),
  z.strictObject({
    ...slugged,
    kind: z.literal('tool_kill'),
    unit: z.string(),
    seen: z.number().int().nonnegative(),
    populated: z.array(z.string()),
    deferred: z.array(z.string()),
    errors: z.number().int().nonnegative(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('tool_kill_deferred'),
    unit: z.string(),
    t: z.string(),
    outcome: z.enum(['written', 'killed-already', 'error']),
    error: z.string().optional(),
  }),
  z.strictObject({
    ...slugged,
    kind: z.literal('batch'),
    attempt,
    holder: z.string(),
    members: z.array(z.string()).optional(),
    built_on: z.string(),
  }),
  waitSchema,
  z.strictObject({ ...stamp, kind: z.literal('repo_pause'), pause: z.enum(['on', 'off']) }),
]);

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type TimingEvent = z.infer<typeof timingEventSchema>;
export type TimingInput = DistOmit<TimingEvent, 'ts' | 'repo'>;

// The kill kinds hold their own ledger: timings.jsonl stays parseable by every older reader
// of the shared file, whose strict union fails the whole ledger on one unknown kind.
const killLedgerKinds: ReadonlySet<string> = new Set(['tool_kill', 'tool_kill_deferred']);

export function appendTiming(repo: Repo, event: TimingInput): void {
  try {
    appendFileSync(
      resolve(repo.root, killLedgerKinds.has(event.kind) ? 'issues/timings-kill.jsonl' : 'issues/timings.jsonl'),
      JSON.stringify({ ...event, ts: new Date().toISOString(), repo: repo.name }) + '\n',
    );
  } catch (error) {
    console.warn(`timing append failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Each line parses on its own: a bad or newer-than-the-reader line is skipped with one warning,
// so a ledger holding kinds this build predates still yields its valid rows. Only an absent or
// unreadable file reads as empty.
export function readTimings(root: string): TimingEvent[] {
  const path: string = resolve(root, 'issues/timings.jsonl');
  let content: string;
  try {
    if (!readdirSync(resolve(root, 'issues')).includes('timings.jsonl')) return [];
    content = readFileSync(path, 'utf8').replace(/(?:\r?\n)+$/, '');
  } catch (error) {
    console.warn(`timing read failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
  if (content === '') return [];
  return content.split('\n').flatMap((line) => {
    const skip = (error: string): TimingEvent[] => {
      console.warn(JSON.stringify({ warning: 'timing line skipped', path, line, error }));
      return [];
    };
    const json: { value: unknown } | SyntaxError = jsonOf(line);
    if (json instanceof SyntaxError) return skip(json.message);
    const row: z.ZodSafeParseResult<TimingEvent> = timingEventSchema.safeParse(json.value);
    return row.success ? [row.data] : skip(row.error.message);
  });
}

// The rows a wake reads: waits, prompts and visit starts. Other kinds pass unchecked.
const wakeRowSchema = z.discriminatedUnion('kind', [visitStartSchema, promptSchema, waitSchema]);
type WakeRow = z.infer<typeof wakeRowSchema>;
const wakeKinds: ReadonlySet<string> = new Set(wakeRowSchema.options.map((option) => option.shape.kind.value));
type WakeFile = { dev: number; ino: number; offset: number; rows: WakeRow[] };
const wakeFiles: Map<string, WakeFile> = new Map();

function jsonOf(line: string): { value: unknown } | SyntaxError {
  try {
    return { value: JSON.parse(line) };
  } catch (error) {
    if (error instanceof SyntaxError) return error;
    throw error;
  }
}

// Each line is parsed once; a bad line is skipped with a warning, so only the leaf it names loses that row.
function wakeRow(path: string, line: string): WakeRow[] {
  const skip = (error: string): WakeRow[] => {
    console.warn(JSON.stringify({ warning: 'timing line skipped', path, line, error }));
    return [];
  };
  const json: { value: unknown } | SyntaxError = jsonOf(line);
  if (json instanceof SyntaxError) return skip(json.message);
  const value: unknown = json.value;
  if (typeof value !== 'object' || value === null || !('kind' in value) || typeof value.kind !== 'string')
    return skip('row has no kind');
  if (!wakeKinds.has(value.kind)) return [];
  const row: z.ZodSafeParseResult<WakeRow> = wakeRowSchema.safeParse(value);
  return row.success ? [row.data] : skip(row.error.message);
}

// The whole lines past the kept offset of the opened file. A different file at the path, or one shorter
// than the kept offset, is read from the start.
function unreadLines(path: string, kept: WakeFile | undefined): { from: WakeFile; lines: string[] } {
  const fd: number = openSync(path, 'r');
  try {
    const { dev, ino, size }: Stats = fstatSync(fd);
    const from: WakeFile =
      kept !== undefined && kept.dev === dev && kept.ino === ino && size >= kept.offset
        ? kept
        : { dev, ino, offset: 0, rows: [] };
    const added: Buffer = Buffer.alloc(size - from.offset);
    const read: Buffer = added.subarray(0, readSync(fd, added, 0, added.length, from.offset));
    const end: number = read.lastIndexOf(0x0a) + 1;
    return {
      from: { ...from, offset: from.offset + end },
      lines: read.subarray(0, end).toString('utf8').split('\n').slice(0, -1),
    };
  } finally {
    closeSync(fd);
  }
}

// One read per file per process: later calls parse only the whole lines added since. Only an absent
// file has no rows; another read failure keeps the rows already held.
export function wakeRows(root: string): WakeRow[] {
  const path: string = resolve(root, 'issues/timings.jsonl');
  const kept: WakeFile | undefined = wakeFiles.get(path);
  let unread: { from: WakeFile; lines: string[] };
  try {
    unread = unreadLines(path, kept);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error)) throw error;
    if (error.code === 'ENOENT') {
      wakeFiles.delete(path);
      return [];
    }
    console.warn(JSON.stringify({ warning: 'timing read failed', path, code: error.code, error: error.message }));
    return kept?.rows ?? [];
  }
  const read: WakeFile = {
    ...unread.from,
    rows: unread.from.rows.concat(unread.lines.flatMap((line) => wakeRow(path, line))),
  };
  wakeFiles.set(path, read);
  return read.rows;
}

export function visitOf(log: LogRecord[], slug: string, phase: Phase): number {
  return log.filter((entry) => entry.record.slug === slug && entry.record.to === phase).length;
}

export function currentVisit(log: LogRecord[], slug: string, phase: Phase): number {
  return Math.max(0, visitOf(log, slug, phase) - 1);
}

export function waitReasonAt(
  events: readonly TimingEvent[],
  slug: string,
  at: number = Number.POSITIVE_INFINITY,
): WaitReason {
  const last: TimingEvent | undefined = events.findLast(
    (event) => (event.kind === 'wait' || event.kind === 'prompt') && event.slug === slug && Date.parse(event.ts) <= at,
  );
  return last?.kind === 'wait' ? last.reason : 'none';
}

// Each leaf whose latest wait or prompt is a capacity wait, with the time that wait began.
export function capacityWaits(events: readonly TimingEvent[]): Map<string, string> {
  const latest: Map<string, TimingEvent> = new Map(
    events.flatMap((event): [string, TimingEvent][] =>
      event.kind === 'wait' || event.kind === 'prompt' ? [[event.slug, event]] : [],
    ),
  );
  return new Map(
    [...latest].flatMap(([slug, event]): [string, string][] =>
      event.kind === 'wait' && event.reason === 'capacity' ? [[slug, event.ts]] : [],
    ),
  );
}

export function recordWait(repo: Repo, slug: string, reason: WaitReason, blocking?: string): void {
  if (reason === waitReasonAt(wakeRows(repo.root), slug)) return;
  appendTiming(repo, { kind: 'wait', slug, reason, ...(blocking === undefined ? {} : { blocking }) });
}
