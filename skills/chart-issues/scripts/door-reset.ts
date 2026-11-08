#!/usr/bin/env bun
// The chart door's handover reset (chart-door Q2 2a): A's last action starts it detached with
// `hc run --bg --no-notify --rm --no-parent -- sh -c 'log=$1; shift; exec bun "$@" >>"$log" 2>&1' sh <log>
// door-reset.ts <A address> <log> "<start prompt>"`, so its output and any uncaught error land in <log> too.
// It follows A's turn end on hc events, cancels on operator input, types the reset as keys, confirms the
// new transcript by a warm-up code, labels it on A and sends the start prompt. One JSON line per stage
// goes to <log>; a stage that fails logs its result and the helper exits non-zero.
import { appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { readGlobal, requireRepo } from '../../../src/config';
import { hc, label, repoSpace, send, terminal, waitFor, type Seen, type SpaceResolution } from '../../../src/hc';
import {
  transcriptByCode,
  transcriptEnd,
  transcriptFor,
  transcriptKind,
  transcriptRecords,
  type Kind,
  type TranscriptRecord,
} from '../../../src/transcript';

const env = z
  .object({ DOOR_RESET_TURN_BOUND_MS: z.coerce.number().int().positive().default(600_000) })
  .parse(process.env);
const resetWord: Record<Kind, string> = { claude: 'clear', codex: 'new', pi: 'new', agy: 'clear' };

// Operator input is a record the harness writes when the operator submits or queues a prompt:
// claude user/queued_command entries with a human origin, codex task_started and user messages,
// pi user messages, agy user-input steps (type 14). Tool results, notifications and other record types
// never parse as input.
const inputSchema: Record<Kind, z.ZodType> = {
  claude: z
    .object({
      type: z.string(),
      origin: z.object({ kind: z.string() }).optional(),
      attachment: z.object({ type: z.string(), origin: z.object({ kind: z.string() }).optional() }).optional(),
    })
    .refine(
      (e) =>
        (e.type === 'user' && e.origin?.kind === 'human') ||
        (e.type === 'attachment' && e.attachment?.type === 'queued_command' && e.attachment.origin?.kind === 'human'),
    ),
  codex: z
    .object({ type: z.string(), payload: z.object({ type: z.string(), role: z.string().optional() }).optional() })
    .refine(
      (e) =>
        (e.type === 'event_msg' && e.payload?.type === 'task_started') ||
        (e.type === 'response_item' && e.payload?.type === 'message' && e.payload.role === 'user'),
    ),
  pi: z
    .object({ type: z.string(), message: z.object({ role: z.string() }).optional() })
    .refine((e) => e.type === 'message' && e.message?.role === 'user'),
  agy: z.object({ step_type: z.literal(14) }),
};

// The harness's reply record, the only proof a prompt was answered: claude, codex and pi also copy the
// prompt into other records (claude's last-prompt and request blobs), so a match there proves receipt only.
const replySchema: Record<Kind, z.ZodType> = {
  claude: z.object({ type: z.literal('assistant') }),
  codex: z.object({
    type: z.literal('response_item'),
    payload: z.object({ type: z.literal('message'), role: z.literal('assistant') }),
  }),
  pi: z.object({ type: z.literal('message'), message: z.object({ role: z.literal('assistant') }) }),
  agy: z.object({ step_type: z.literal(15) }),
};

const [a, log, start]: [string, string, string] = z
  .tuple([z.string().min(1), z.string().min(1), z.string().min(1)])
  .parse(process.argv.slice(2));

function step(name: string, result: string, extra: Record<string, unknown> = {}): void {
  appendFileSync(log, `${JSON.stringify({ t: new Date().toISOString(), step: name, result, ...extra })}\n`);
}

function stop(name: string, result: string, extra: Record<string, unknown> = {}): never {
  step(name, result, extra);
  process.exit(1);
}

const idle = (t: Seen): boolean => t.status?.state === 'idle' || t.status?.state === 'done';

const space: SpaceResolution = await repoSpace(await requireRepo(readGlobal(), process.cwd()));
if (!space.ok) stop('started', 'no session', { reason: space.reason });
const session: string = space.session;
const seat = { session, address: a };
const pre: string | null = await transcriptFor(seat);
if (pre === null) stop('started', 'transcript unknown');
const kind: Kind | null = transcriptKind(pre);
if (kind === null) stop('started', 'unsupported harness', { pre });
// Anything at or after the boundary was written after the handover was queued.
const boundary: number = transcriptEnd(pre);
step('started', 'queued', { pre, boundary, kind });

const gone = (t: Seen): boolean => t.state === 'finished';
const ended: Seen | null = await waitFor(session, a, (t) => idle(t) || gone(t), env.DOOR_RESET_TURN_BOUND_MS);
if (ended === null) stop('wait-turn-end', 'turn open');
if (gone(ended)) stop('wait-turn-end', 'identity changed');
step('wait-turn-end', 'turn ended', { turn: ended.turn });

// A submitted operator input is a transcript record that stays, so one read after the turn sees it.
const input: boolean = transcriptRecords(pre, boundary).some(
  (record: TranscriptRecord) => inputSchema[kind].safeParse(record.value).success,
);
if (input) stop('input-check', 'superseded');
step('input-check', 'none');

// Keys, not a send: a sent `/clear` would arrive as chat text, not as the harness command.
const resetStart: number = Date.now();
await hc(session, ['keys', a, '/', ...resetWord[kind].split(''), 'enter']);
step('reset-keys', 'sent', { reset: `/${resetWord[kind]}` });

const code: string = randomBytes(6).toString('hex');
const warm = await send(session, a, `reply OK ${code}`);
if (warm.started === false) stop('warm-up', 'warm-up not started', { code, turn: warm.turn });
step('warm-up', 'sent', { code, turn: warm.turn });

// A turn end only wakes the check: a reset can end turns of its own (claude's /clear does), so the warm-up
// is over when a reply record follows the code in a transcript changed since the reset and A is idle on a
// fresh read, never by a turn count. The event's idle can predate the warm-up's turn, which may write its
// reply while the lookup runs and only then go idle.
const answered = (path: string | null): boolean => {
  if (path === null) return false;
  const records: TranscriptRecord[] = transcriptRecords(path, 0);
  return records
    .slice(records.findIndex((record: TranscriptRecord) => record.text.includes(code)))
    .some((record: TranscriptRecord) => replySchema[kind].safeParse(record.value).success);
};
const warmed: Seen | null = await waitFor(
  session,
  a,
  async (t) =>
    gone(t) ||
    (idle(t) && answered(await transcriptByCode(seat, code, resetStart)) && idle(await terminal(session, a))),
  env.DOOR_RESET_TURN_BOUND_MS,
);
if (warmed === null) stop('code-lookup', 'reset unconfirmed', { code });
if (gone(warmed)) stop('warm-up-turn-end', 'identity changed');
step('warm-up-turn-end', 'turn ended', { turn: warmed.turn });

const found: string | null = await transcriptByCode(seat, code, resetStart);
if (found === null) stop('code-lookup', 'reset unconfirmed', { code });
step('code-lookup', 'found', { path: found });
if (found === pre) stop('differing-path', 'same transcript', { path: found });
step('differing-path', 'differs');

await label(session, a, { 'akrogon.transcript': found });
step('label', 'set', { path: found });

const sent = await send(session, a, start);
if (sent.started === false) {
  await hc(session, ['keys', a, 'enter']);
  step('start-prompt', 'enter pressed', { turn: sent.turn });
} else step('start-prompt', 'sent', { turn: sent.turn });
