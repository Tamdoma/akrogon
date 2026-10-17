#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, type Dirent } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { z } from 'zod';

const seatSchema = z.strictObject({
  seat: z.string().min(1),
  pane: z.string(),
  harness: z.string().min(1),
  session: z.string().min(1),
});
const spanEntrySchema = z.strictObject({ from: z.iso.datetime(), to: z.iso.datetime().optional() });
const seatsSchema = z.object({
  opened: z.iso.datetime(),
  spans: z.array(spanEntrySchema).optional(),
  seats: z.array(seatSchema),
});
const codexOperatorMetadataSchema = z.object({
  user_input_order: z.int(),
  retained_source: z.object({ id: z.object({ turn_id: z.string() }) }),
});
type Seats = z.infer<typeof seatsSchema>;
type SeatEntry = z.infer<typeof seatSchema>;

type Rec = Record<string, unknown>;

type SeatError = { seat: string; session: string; detail: string };
type Span = { startMs: number; endMs: number; complete: boolean };
type Win = { startMs: number; endMs: number };
type Tokens = Record<string, number>;
type Counting = {
  calls: number | null;
  contextTokens: number;
  tokens: Tokens;
  spanOutput: (a: number, b: number) => number;
};
type SessionResult = {
  session: string;
  harness: string;
  models: Set<string>;
  efforts: Set<string>;
  turns: Span[];
  calls: number | null;
  contextTokens: number;
  tokens: Tokens;
  operatorTurns: { startMs: number; replyEndMs: number | null }[];
  spanOutput: (a: number, b: number) => number;
  splitOpen: boolean;
  totalCostUSD: number | null;
};
type SeatResult = { seat: string; sessions: SessionResult[] } | { seat: string; errors: SeatError[] };

function die(message: string): never {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function mins(a: number, b: number): string {
  return ((b - a) / 60000).toFixed(1);
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function inWins(wins: Win[], t: number): boolean {
  return wins.some((w) => t >= w.startMs && t < w.endMs);
}

function intersectMs(a: number, b: number, wins: Win[]): number {
  return wins.reduce((acc, w) => acc + Math.max(0, Math.min(b, w.endMs) - Math.max(a, w.startMs)), 0);
}

// a completed turn or operator wait ends where its reply ends inside a span; a reply landing in a
// gap or past the last overlapped span ends the wait at the last span edge the interval crosses
function turnEnd(startMs: number, replyEndMs: number | null, wins: Win[]): number | null {
  if (replyEndMs === null) return null;
  const overlapped: number[] = wins.filter((w) => startMs < w.endMs && w.startMs < replyEndMs).map((w) => w.endMs);
  if (overlapped.length === 0) return null;
  return Math.min(replyEndMs, Math.max(...overlapped));
}

function recordsOf(file: string): Rec[] | string {
  const out: Rec[] = [];
  const lines: string[] = readFileSync(file, 'utf8').split('\n');
  let n: number = 0;
  for (const line of lines) {
    n += 1;
    if (line.trim() === '') continue;
    try {
      out.push(JSON.parse(line) as Rec);
    } catch {
      return `line ${n} is not JSON`;
    }
  }
  return out;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function tsOf(r: Rec, field: string): number | string {
  if (typeof r.timestamp !== 'string') return `field timestamp missing`;
  const t: number = Date.parse(r.timestamp);
  return Number.isFinite(t) ? t : `field timestamp unparseable`;
}

function findTranscripts(root: string, match: (dir: string, name: string) => boolean, depth: number): string[] {
  const out: string[] = [];
  const walk = (dir: string, d: number): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p: string = join(dir, e.name);
      if (d === 0) {
        if (e.isFile() && match(dir, e.name)) out.push(p);
      } else if (e.isDirectory()) walk(p, d - 1);
    }
  };
  walk(root, depth);
  return out;
}

function locate(harness: string, session: string): { file: string } | { detail: string } {
  if (harness === 'claude') {
    const root: string = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects');
    const hits: string[] = findTranscripts(root, (_d, name) => name === `${session}.jsonl`, 1);
    if (hits.length === 1) return { file: hits[0] };
    return { detail: `${session}.jsonl: ${hits.length} matches under ${root}` };
  }
  if (harness === 'pi') {
    if (existsSync(session)) return { file: resolve(session) };
    return { detail: `${session}: session file missing` };
  }
  if (harness === 'codex') {
    const root: string = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), 'sessions');
    const suffix: string = `-${session}.jsonl`;
    const hits: string[] = findTranscripts(root, (_d, name) => name.startsWith('rollout-') && name.endsWith(suffix), 3);
    if (hits.length === 1) return { file: hits[0] };
    return { detail: `rollout-*-${session}.jsonl: ${hits.length} matches under ${root}` };
  }
  return { detail: `unknown harness ${harness}` };
}

function claudeSession(session: string, file: string, wins: Win[], untilMs: number): SessionResult | string {
  const parsed: Rec[] | string = recordsOf(file);
  if (typeof parsed === 'string') return `${file}: ${parsed}`;
  const recs: Rec[] = parsed;
  for (const r of recs) {
    if (r.type === 'assistant' || r.type === 'user') {
      const t: number | string = tsOf(r, 'timestamp');
      if (typeof t === 'string') return `${file}: ${t}`;
    }
  }
  const timed = (r: Rec): number => Date.parse(r.timestamp as string);
  const isOp = (r: Rec): boolean => {
    if (r.type !== 'user' || r.isSidechain === true || r.isMeta === true || r.isCompactSummary === true) return false;
    const content = (r.message as Rec | undefined)?.content;
    if (Array.isArray(content)) return !content.every((c) => (c as Rec).type === 'tool_result');
    if (typeof content === 'string') return !content.startsWith('<local-command-stdout>');
    return false;
  };
  const ops: Rec[] = recs.filter(isOp);
  const allAssistants: Rec[] = recs.filter((r) => r.type === 'assistant' && r.isSidechain !== true);
  for (const r of allAssistants) {
    const m = r.message as Rec | undefined;
    if (typeof m?.id !== 'string') return `${file}: field message.id missing`;
    if (typeof m?.model !== 'string') return `${file}: field message.model missing`;
    const u = m.usage as Rec | undefined;
    for (const k of ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens'])
      if (num(u?.[k]) === null) return `${file}: field message.usage.${k} missing`;
    if (typeof r.effort !== 'string') return `${file}: field effort missing`;
  }
  const assistants: Rec[] = allAssistants;
  // groups form over the whole session; a group counts only when its final record lands inside a span
  const groups = new Map<string, Rec[]>();
  for (const r of assistants) {
    const id: string = (r.message as Rec).id as string;
    const g: Rec[] | undefined = groups.get(id);
    if (g) g.push(r);
    else groups.set(id, [r]);
  }
  const counted: Rec[][] = [...groups.values()].filter((g) => inWins(wins, timed(g[g.length - 1])));
  const tokens: Tokens = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  let contextTokens: number = 0;
  for (const g of counted) {
    tokens.output_tokens += Math.max(...g.map((r) => ((r.message as Rec).usage as Rec).output_tokens as number));
    const u: Rec = (g[g.length - 1].message as Rec).usage as Rec;
    tokens.input_tokens += u.input_tokens as number;
    tokens.cache_read_input_tokens += u.cache_read_input_tokens as number;
    tokens.cache_creation_input_tokens += u.cache_creation_input_tokens as number;
    contextTokens +=
      (u.input_tokens as number) + (u.cache_read_input_tokens as number) + (u.cache_creation_input_tokens as number);
  }
  const spanOutput = (a: number, b: number): number => {
    const prev = new Map<string, number>();
    let out: number = 0;
    for (const r of assistants) {
      const t: number = timed(r);
      if (!inWins(wins, t)) continue;
      const id: string = (r.message as Rec).id as string;
      const v: number = ((r.message as Rec).usage as Rec).output_tokens as number;
      const delta: number = prev.has(id) ? v - (prev.get(id) as number) : v;
      prev.set(id, v);
      if (t > a && t <= b) out += delta;
    }
    return out;
  };
  const turns: Span[] = [];
  const operatorTurns: { startMs: number; replyEndMs: number | null }[] = [];
  let splitOpen: boolean = false;
  let splitFirst: boolean = false;
  for (let i: number = 0; i < ops.length; i += 1) {
    const t0: number = timed(ops[i]);
    const t1: number = i + 1 < ops.length ? timed(ops[i + 1]) : untilMs;
    let replyEnd: number | null = null;
    for (const r of assistants) {
      const t: number = timed(r);
      if (t > t0 && t <= t1) replyEnd = t;
    }
    const clippedEnd: number | null = turnEnd(t0, replyEnd, wins);
    operatorTurns.push({ startMs: t0, replyEndMs: clippedEnd });
    if (clippedEnd === null || replyEnd === null) continue;
    turns.push({ startMs: t0, endMs: clippedEnd, complete: true });
    if (!splitFirst && intersectMs(t0, clippedEnd, wins) > 0) {
      splitFirst = true;
      splitOpen = recs.some((r) => r.isCompactSummary === true && timed(r) > t0 && timed(r) <= t1);
    }
  }
  const lastTimed: number | undefined = recs.reduce<number | undefined>(
    (acc, r) =>
      typeof r.timestamp === 'string' && Number.isFinite(Date.parse(r.timestamp)) ? Date.parse(r.timestamp) : acc,
    undefined,
  );
  const cost: Rec | undefined = recs.find(
    (r) =>
      r.type === 'cost-state' &&
      (typeof r.timestamp === 'string'
        ? inWins(wins, Date.parse(r.timestamp))
        : lastTimed !== undefined && inWins(wins, lastTimed)),
  );
  return {
    session,
    harness: 'claude',
    models: new Set(assistants.filter((r) => inWins(wins, timed(r))).map((r) => (r.message as Rec).model as string)),
    efforts: new Set(assistants.filter((r) => inWins(wins, timed(r))).map((r) => r.effort as string)),
    turns,
    calls: counted.length,
    contextTokens,
    tokens,
    operatorTurns,
    spanOutput,
    splitOpen,
    totalCostUSD: typeof cost?.totalCostUSD === 'number' ? cost.totalCostUSD : null,
  };
}

const CODEX_KEYS: string[] = [
  'input_tokens',
  'cached_input_tokens',
  'output_tokens',
  'reasoning_output_tokens',
  'total_tokens',
];

const RESPONSE_KEYS: string[] = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens'];

function codexCounting(file: string, recs: Rec[], wins: Win[]): Counting | string {
  const timed = (r: Rec): number => {
    if (typeof r.timestamp !== 'string') return NaN;
    return Date.parse(r.timestamp);
  };
  const perResponse: Rec[] = recs.filter((r) => r.type === 'token_usage_record');
  if (perResponse.length > 0) {
    const ids = new Set<string>();
    const tokens: Tokens = { input_tokens: 0, cached_input_tokens: 0, output_tokens: 0, reasoning_output_tokens: 0 };
    const placed: { ts: number; u: Rec }[] = [];
    for (const r of perResponse) {
      const p = r.payload as Rec | undefined;
      if (typeof p?.response_id !== 'string') return `${file}: field payload.response_id missing`;
      const u = p.usage as Rec | undefined;
      if (u === undefined || typeof u !== 'object') return `${file}: field payload.usage missing`;
      for (const k of RESPONSE_KEYS) if (num(u[k]) === null) return `${file}: field payload.usage.${k} missing`;
      const ts: number = timed(r);
      if (!inWins(wins, ts)) continue;
      ids.add(p.response_id);
      tokens.input_tokens += u.input_tokens as number;
      tokens.cached_input_tokens += u.cached_input_tokens as number;
      tokens.output_tokens += u.output_tokens as number;
      tokens.reasoning_output_tokens += u.reasoning_output_tokens as number;
      placed.push({ ts, u });
    }
    placed.sort((a, b) => a.ts - b.ts);
    const spanOutput = (a: number, b: number): number =>
      placed.reduce((acc, c) => (c.ts > a && c.ts <= b ? acc + (c.u.output_tokens as number) : acc), 0);
    return {
      calls: ids.size,
      contextTokens: tokens.input_tokens,
      tokens,
      spanOutput,
    };
  }
  const counts: { ts: number; u: Rec }[] = [];
  for (const r of recs) {
    if (r.type !== 'event_msg' || (r.payload as Rec | undefined)?.type !== 'token_count') continue;
    const u = ((r.payload as Rec).info as Rec | undefined)?.total_token_usage;
    if (u === undefined || typeof u !== 'object') return `${file}: field payload.info.total_token_usage missing`;
    for (const k of CODEX_KEYS)
      if (num((u as Rec)[k]) === null) return `${file}: field payload.info.total_token_usage.${k} missing`;
    counts.push({ ts: timed(r), u: u as Rec });
  }
  counts.sort((a, b) => a.ts - b.ts);
  const zero: Rec = Object.fromEntries(CODEX_KEYS.map((k) => [k, 0]));
  const deltas: { ts: number; u: Tokens }[] = counts
    .map((c, i) => ({
      ts: c.ts,
      u: Object.fromEntries(
        CODEX_KEYS.map((k) => [k, (c.u[k] as number) - ((i === 0 ? zero : counts[i - 1].u)[k] as number)]),
      ),
    }))
    .filter((c) => inWins(wins, c.ts));
  if (deltas.some((c) => CODEX_KEYS.some((k) => c.u[k] < 0)))
    return `${basename(file)}: token_count cumulative counters decreased (counter reset)`;
  const tokens: Tokens = Object.fromEntries(CODEX_KEYS.map((k) => [k, deltas.reduce((acc, c) => acc + c.u[k], 0)]));
  const spanOutput = (a: number, b: number): number =>
    deltas.reduce((acc, c) => (c.ts > a && c.ts <= b ? acc + c.u.output_tokens : acc), 0);
  return { calls: null, contextTokens: 0, tokens, spanOutput };
}

function codexSession(session: string, file: string, wins: Win[], untilMs: number): SessionResult | string {
  const parsed: Rec[] | string = recordsOf(file);
  if (typeof parsed === 'string') return `${file}: ${parsed}`;
  const recs: Rec[] = parsed;
  const timed = (r: Rec): number => {
    if (typeof r.timestamp !== 'string') return NaN;
    return Date.parse(r.timestamp);
  };
  const models = new Set<string>();
  const efforts = new Set<string>();
  const started = new Map<string, Rec>();
  const completed = new Map<string, Rec>();
  for (const r of recs) {
    const p = r.payload as Rec | undefined;
    if (r.type === 'turn_context') {
      if (!inWins(wins, timed(r))) continue;
      if (typeof p?.model !== 'string') return `${file}: field payload.model missing`;
      if (typeof p.effort !== 'string') return `${file}: field payload.effort missing`;
      models.add(p.model);
      efforts.add(p.effort);
    } else if (r.type === 'event_msg' && p?.type === 'task_started') {
      if (typeof p.turn_id !== 'string') return `${file}: field payload.turn_id missing`;
      started.set(p.turn_id, r);
    } else if (r.type === 'event_msg' && p?.type === 'task_complete') {
      if (typeof p.turn_id !== 'string') return `${file}: field payload.turn_id missing`;
      completed.set(p.turn_id, r);
    }
  }
  const counting: Counting | string = codexCounting(file, recs, wins);
  if (typeof counting === 'string') return counting;
  const turns: Span[] = [];
  for (const [id, s] of started) {
    const t0: number = timed(s);
    const c: Rec | undefined = completed.get(id);
    turns.push(
      c !== undefined && timed(c) <= untilMs
        ? { startMs: t0, endMs: timed(c), complete: true }
        : { startMs: t0, endMs: untilMs, complete: false },
    );
  }
  const userMsgs: Rec[] = recs.filter(
    (r) =>
      r.type === 'response_item' &&
      (r.payload as Rec | undefined)?.type === 'message' &&
      (r.payload as Rec).role === 'user' &&
      (r.metadata as Rec | undefined)?.user_input_order !== undefined &&
      inWins(wins, timed(r)),
  );
  const operatorTurns: { startMs: number; replyEndMs: number | null }[] = [];
  for (const [i, r] of userMsgs.entries()) {
    const metadata = codexOperatorMetadataSchema.safeParse(r.metadata);
    if (!metadata.success) return `${file}: field metadata.${metadata.error.issues[0].path.join('.')} missing`;
    const completion: Rec | undefined = completed.get(metadata.data.retained_source.id.turn_id);
    const nextMs: number = i + 1 < userMsgs.length ? timed(userMsgs[i + 1]) : untilMs;
    const replyEndMs: number | null =
      completion !== undefined && timed(completion) <= nextMs ? timed(completion) : null;
    operatorTurns.push({ startMs: timed(r), replyEndMs: turnEnd(timed(r), replyEndMs, wins) });
  }
  operatorTurns.sort((x, y) => x.startMs - y.startMs);
  return {
    session,
    harness: 'codex',
    models,
    efforts,
    turns,
    calls: counting.calls,
    contextTokens: counting.contextTokens,
    tokens: counting.tokens,
    operatorTurns,
    spanOutput: counting.spanOutput,
    splitOpen: false,
    totalCostUSD: null,
  };
}

const PI_TOKEN_FIELDS: [string, string][] = [
  ['input_tokens', 'input'],
  ['output_tokens', 'output'],
  ['cache_read_input_tokens', 'cacheRead'],
  ['cache_creation_input_tokens', 'cacheWrite'],
  ['reasoning_output_tokens', 'reasoning'],
];

function piSession(session: string, file: string, wins: Win[], untilMs: number): SessionResult | string {
  const parsed: Rec[] | string = recordsOf(file);
  if (typeof parsed === 'string') return `${file}: ${parsed}`;
  const recs: Rec[] = parsed;
  const timed = (r: Rec): number => Date.parse(r.timestamp as string);
  for (const r of recs) {
    if (r.type !== 'message' && r.type !== 'compaction') continue;
    const t: number | string = tsOf(r, 'timestamp');
    if (typeof t === 'string') return `${file}: ${t}`;
  }
  const messages: Rec[] = recs.filter((r) => r.type === 'message');
  const assistants: Rec[] = messages.filter((r) => (r.message as Rec).role === 'assistant');
  const tokens: Tokens = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    reasoning_output_tokens: 0,
  };
  const calls: { ts: number; output: number }[] = [];
  let contextTokens: number = 0;
  const usageOf = (raw: unknown, name: string): Rec | string => {
    if (raw === null || typeof raw !== 'object') return `${file}: field ${name} missing`;
    for (const [, field] of PI_TOKEN_FIELDS)
      if (num((raw as Rec)[field]) === null) return `${file}: field ${name}.${field} missing`;
    return raw as Rec;
  };
  const addCall = (ts: number, u: Rec): void => {
    for (const [key, field] of PI_TOKEN_FIELDS) tokens[key] += u[field] as number;
    contextTokens += (u.input as number) + (u.cacheRead as number) + (u.cacheWrite as number);
    calls.push({ ts, output: u.output as number });
  };
  const models = new Set<string>();
  const efforts = new Set<string>();
  for (const r of assistants) {
    const present: unknown = (r.message as Rec).usage;
    if (present === null || typeof present !== 'object') return `${file}: field message.usage missing`;
  }
  for (const r of assistants) {
    const ts: number = timed(r);
    if (!inWins(wins, ts)) continue;
    const m = r.message as Rec;
    if (typeof m.model === 'string') models.add(m.model);
    if (typeof m.thinkingLevel === 'string') efforts.add(m.thinkingLevel);
    if (m.stopReason === 'error' && num((m.usage as Rec).totalTokens) === 0) continue;
    const u: Rec | string = usageOf(m.usage, 'message.usage');
    if (typeof u === 'string') return u;
    addCall(ts, u);
  }
  for (const r of recs) {
    if (r.type !== 'compaction') continue;
    const ts: number = timed(r);
    if (!inWins(wins, ts)) continue;
    const u: Rec | string = usageOf(r.usage, 'usage');
    if (typeof u === 'string') return u;
    addCall(ts, u);
  }
  const turns: Span[] = [];
  const operatorTurns: { startMs: number; replyEndMs: number | null }[] = [];
  let splitOpen: boolean = false;
  let splitFirst: boolean = false;
  for (let i: number = 0; i < messages.length; i += 1) {
    if ((messages[i].message as Rec).role !== 'user') continue;
    const t0: number = timed(messages[i]);
    const next: Rec | undefined = messages.slice(i + 1).find((r) => (r.message as Rec).role === 'user');
    const t1: number = next === undefined ? untilMs : timed(next);
    let replyEnd: number | null = null;
    for (const r of assistants) {
      const t: number = timed(r);
      if (t > t0 && t <= t1) replyEnd = t;
    }
    const clippedEnd: number | null = turnEnd(t0, replyEnd, wins);
    operatorTurns.push({ startMs: t0, replyEndMs: clippedEnd });
    if (clippedEnd === null || replyEnd === null) continue;
    turns.push({ startMs: t0, endMs: clippedEnd, complete: true });
    if (!splitFirst && intersectMs(t0, clippedEnd, wins) > 0) {
      splitFirst = true;
      splitOpen = recs.some((r) => r.type === 'compaction' && timed(r) > t0 && timed(r) <= t1);
    }
  }
  const spanOutput = (a: number, b: number): number =>
    calls.reduce((acc, c) => (c.ts > a && c.ts <= b ? acc + c.output : acc), 0);
  return {
    session,
    harness: 'pi',
    models,
    efforts,
    turns,
    calls: calls.length,
    contextTokens,
    tokens,
    operatorTurns,
    spanOutput,
    splitOpen,
    totalCostUSD: null,
  };
}

function windowsOf(seats: Seats, seatsFile: string, untilMs: number): Win[] {
  if (seats.spans === undefined) return [{ startMs: Date.parse(seats.opened), endMs: untilMs + 1 }];
  const spans = seats.spans;
  const wins: Win[] = [];
  for (const [i, s] of spans.entries()) {
    const from: number = Date.parse(s.from);
    if (s.to !== undefined && Date.parse(s.to) <= from) die(`${seatsFile}: field spans.${i}.to: to must be after from`);
    if (s.to === undefined && i + 1 < spans.length)
      die(`${seatsFile}: field spans.${i}.to: required on every span except the last (only the last span may be open)`);
    const prevTo: string | undefined = spans[i - 1]?.to;
    if (prevTo !== undefined && from < Date.parse(prevTo))
      die(`${seatsFile}: field spans.${i}.from: must be at or after spans.${i - 1}.to`);
    const endMs: number = Math.min(s.to === undefined ? Infinity : Date.parse(s.to), untilMs);
    if (from < endMs) wins.push({ startMs: from, endMs });
  }
  return wins;
}

function windowLine(seats: Seats, untilMs: number): string {
  if (seats.spans === undefined) return `legacy window ${iso(Date.parse(seats.opened))} to ${iso(untilMs)}`;
  const parts: string[] = seats.spans.map((s) => {
    const from: string = iso(Date.parse(s.from));
    return s.to === undefined ? `${from} to ${iso(untilMs)} (open)` : `${from} to ${iso(Date.parse(s.to))}`;
  });
  return `window ${parts.join(', ')}`;
}

function main(): void {
  if (process.argv.length < 3 || process.argv.length > 4) die('Usage: chart-usage.ts <chart-folder> [<until>]');
  const chart: string = resolve(process.argv[2]);
  const st = statSync(chart, { throwIfNoEntry: false });
  if (st === undefined || !st.isDirectory()) die(`chart folder missing: ${chart}`);
  const untilMs: number = process.argv[3] === undefined ? Date.now() : Date.parse(process.argv[3]);
  if (!Number.isFinite(untilMs)) die(`invalid <until>: ${process.argv[3]}`);
  const seatsFile: string = join(chart, 'seats.yaml');
  if (!existsSync(seatsFile)) die(`seats.yaml missing: ${seatsFile}`);
  let seats: Seats;
  try {
    seats = seatsSchema.parse(Bun.YAML.parse(readFileSync(seatsFile, 'utf8')));
  } catch (cause) {
    if (cause instanceof z.ZodError) {
      const issue = cause.issues[0];
      die(`${seatsFile}: field ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
    die(`${seatsFile}: ${cause instanceof Error ? cause.message : cause}`);
  }
  const windows: Win[] = windowsOf(seats, seatsFile, untilMs);
  const windowText: string = windowLine(seats, untilMs);

  const errors: SeatError[] =
    seats.seats.length === 0
      ? [{ seat: 'A', session: '', detail: `${seatsFile}: field seats has no recorded sessions` }]
      : [];
  const measured: { seat: string; sessions: SessionResult[] }[] = [];
  const seatLetters: string[] = [...new Set(seats.seats.map((s) => s.seat))];
  for (const letter of seatLetters) {
    const sessions: SessionResult[] = [];
    for (const entry of seats.seats.filter((s) => s.seat === letter)) {
      const found: { file: string } | { detail: string } = locate(entry.harness, entry.session);
      if ('detail' in found) {
        errors.push({ seat: letter, session: entry.session, detail: found.detail });
        continue;
      }
      const result: SessionResult | string =
        entry.harness === 'claude'
          ? claudeSession(entry.session, found.file, windows, untilMs)
          : entry.harness === 'codex'
            ? codexSession(entry.session, found.file, windows, untilMs)
            : piSession(entry.session, found.file, windows, untilMs);
      if (typeof result === 'string') errors.push({ seat: letter, session: entry.session, detail: result });
      else sessions.push(result);
    }
    if (sessions.length > 0) measured.push({ seat: letter, sessions });
  }

  const doorSessions: SessionResult[] = measured.find((m) => m.seat === 'A')?.sessions ?? [];
  const ops: { startMs: number; replyEndMs: number | null }[] = doorSessions
    .flatMap((s) => s.operatorTurns)
    .sort((a, b) => a.startMs - b.startMs);
  const opRows: {
    startMs: number;
    replyEndMs: number | null;
    endMs: number;
    minutesMs: number;
    outputs: [string, number][];
  }[] = ops
    .map((o, i) => {
      const endMs: number = i + 1 < ops.length ? ops[i + 1].startMs : untilMs;
      const outputs: [string, number][] = measured.map((m) => [
        m.seat,
        m.sessions.reduce((acc, s) => acc + s.spanOutput(o.startMs, endMs), 0),
      ]);
      const stopMs: number = o.replyEndMs ?? endMs;
      return { ...o, endMs, minutesMs: intersectMs(o.startMs, stopMs, windows), outputs };
    })
    .filter((o) => o.minutesMs > 0);
  const waitMs: number = opRows.reduce((acc, o) => (o.replyEndMs === null ? acc : acc + o.minutesMs), 0);

  const seatOut = (m: { seat: string; sessions: SessionResult[] }): number =>
    m.sessions.reduce((acc, s) => acc + s.tokens.output_tokens, 0);
  const parts: string[] = measured.map((m) => `${m.seat}=${seatOut(m)}`);
  const unmeasuredParts: string[] = seatLetters
    .filter((l) => !measured.some((m) => m.seat === l))
    .map((l) => `${l}=unmeasured`);
  const summary: string =
    `chart ${basename(chart)} - operator wait ${mins(0, waitMs)} min, operator turns ${opRows.length}` +
    (parts.length + unmeasuredParts.length > 0 ? `; ${[...parts, ...unmeasuredParts].join(', ')} output` : '');

  const lines: string[] = [summary, '', windowText, ''];
  lines.push(
    '- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.',
  );
  lines.push(
    "- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.",
  );
  lines.push('- subagent usage is not counted.');
  lines.push(
    '- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.',
  );
  lines.push('');
  for (const m of measured) {
    const sessions: string = m.sessions.map((s) => s.session).join(' + ');
    lines.push(`seat ${m.seat} (harness ${m.sessions[0].harness}, sessions ${sessions}):`);
    const models = new Set(m.sessions.flatMap((s) => [...s.models]));
    const efforts = new Set(m.sessions.flatMap((s) => [...s.efforts]));
    if (models.size > 0) lines.push(`  models ${[...models].join(', ')}`);
    if (efforts.size > 0) lines.push(`  effort ${[...efforts].join(', ')}`);
    const windowTurns: Span[] = m.sessions
      .flatMap((s) => s.turns)
      .filter((t) => intersectMs(t.startMs, t.endMs, windows) > 0);
    const complete: Span[] = windowTurns.filter((t) => t.complete);
    const incomplete: number = windowTurns.length - complete.length;
    lines.push(`  turns ${complete.length}${incomplete > 0 ? `, ${incomplete} incomplete` : ''}`);
    const errored: boolean = errors.some((e) => e.seat === m.seat);
    const uncounted: SessionResult[] = m.sessions.filter((s) => s.calls === null);
    if (errored || uncounted.length > 0) {
      const cumulativeOnly: boolean = !errored && uncounted.length === m.sessions.length;
      lines.push(`  calls unavailable${cumulativeOnly ? ' (cumulative-only rollout)' : ''}`);
    } else {
      const calls: number = m.sessions.reduce((acc, s) => acc + (s.calls ?? 0), 0);
      const context: number = m.sessions.reduce((acc, s) => acc + s.contextTokens, 0);
      lines.push(`  calls ${calls}`);
      lines.push(`  average context per call ${calls === 0 ? 'n/a' : Math.round(context / calls)}`);
    }
    const workMs: number = complete.reduce((acc, t) => acc + intersectMs(t.startMs, t.endMs, windows), 0);
    lines.push(`  working minutes ${mins(0, workMs)}`);
    const first: SessionResult | undefined = m.sessions[0];
    const firstTurn: Span | undefined = first?.turns
      .filter((t) => t.complete && intersectMs(t.startMs, t.endMs, windows) > 0)
      .sort((a, b) => a.startMs - b.startMs)[0];
    if (firstTurn !== undefined) {
      const note: string = first.splitOpen ? ' (opening reply was split across turns; not the whole map cost)' : '';
      const firstMs: number = intersectMs(firstTurn.startMs, firstTurn.endMs, windows);
      lines.push(`  first turn in window ${iso(firstTurn.startMs)} ${mins(0, firstMs)} min${note}`);
    }
    const keys: string[] = [...new Set(m.sessions.flatMap((s) => Object.keys(s.tokens)))];
    for (const k of keys) lines.push(`  ${k} ${m.sessions.reduce((acc, s) => acc + (s.tokens[k] ?? 0), 0)}`);
    for (const s of m.sessions)
      if (s.totalCostUSD !== null)
        lines.push(
          `  session ${s.session} totalCostUSD ${s.totalCostUSD} (whole-session figure; can include other charts)`,
        );
    lines.push('');
  }
  for (const e of errors) lines.push(`seat ${e.seat}: usage unmeasured (${e.detail})`);
  if (errors.length > 0) lines.push('');
  lines.push('operator turns');
  for (const o of opRows) {
    const outputs: string = o.outputs.map(([seat, v]) => `${seat}=${v}`).join(' ');
    if (o.replyEndMs === null)
      lines.push(
        `  ${iso(o.startMs)} incomplete (reply not finished before the next operator message or the window end)${outputs ? `, output ${outputs}` : ''}`,
      );
    else lines.push(`  ${iso(o.startMs)} ${mins(0, o.minutesMs)} min${outputs ? `, output ${outputs}` : ''}`);
  }
  lines.push(`  total operator wait ${mins(0, waitMs)} min`);
  lines.push('');
  writeFileSync(join(chart, 'USAGE.md'), lines.join('\n'));

  process.stdout.write(summary + '\n');
  let siblings: string[] = [];
  try {
    siblings = readdirSync(resolve(chart, '..'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && resolve(chart, '..', e.name) !== chart)
      .map((e) => e.name)
      .sort();
  } catch {
    siblings = [];
  }
  for (const sib of siblings) {
    const file: string = join(resolve(chart, '..'), sib, 'USAGE.md');
    if (existsSync(file)) {
      const first: string = readFileSync(file, 'utf8').split('\n')[0];
      if (first !== '') process.stdout.write(first + '\n');
    }
  }
  process.stdout.write(`outcome ${errors.length > 0 ? 'partial' : 'done'}\n`);
}

main();
