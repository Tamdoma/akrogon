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
const seatsSchema = z.strictObject({
  opened: z.iso.datetime(),
  restatements: z.int().nonnegative(),
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
type Tokens = Record<string, number>;
type SessionResult = {
  session: string;
  harness: string;
  models: Set<string>;
  efforts: Set<string>;
  turns: Span[];
  assistantMessages: number | null;
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
  if (harness === 'codex') {
    const root: string = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), 'sessions');
    const suffix: string = `-${session}.jsonl`;
    const hits: string[] = findTranscripts(root, (_d, name) => name.startsWith('rollout-') && name.endsWith(suffix), 3);
    if (hits.length === 1) return { file: hits[0] };
    return { detail: `rollout-*-${session}.jsonl: ${hits.length} matches under ${root}` };
  }
  return { detail: `unknown harness ${harness}` };
}

function claudeSession(session: string, file: string, openMs: number, untilMs: number): SessionResult | string {
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
  const inWin = (r: Rec): boolean => {
    const t: number = timed(r);
    return t >= openMs && t <= untilMs;
  };
  const isOp = (r: Rec): boolean => {
    if (r.type !== 'user' || r.isSidechain === true || r.isMeta === true || r.isCompactSummary === true) return false;
    const content = (r.message as Rec | undefined)?.content;
    if (Array.isArray(content)) return !content.every((c) => (c as Rec).type === 'tool_result');
    if (typeof content === 'string') return !content.startsWith('<local-command-stdout>');
    return false;
  };
  const ops: Rec[] = recs.filter((r) => isOp(r) && inWin(r));
  const assistants: Rec[] = recs.filter((r) => r.type === 'assistant' && r.isSidechain !== true && inWin(r));
  for (const r of assistants) {
    const m = r.message as Rec | undefined;
    if (typeof m?.id !== 'string') return `${file}: field message.id missing`;
    if (typeof m?.model !== 'string') return `${file}: field message.model missing`;
    const u = m.usage as Rec | undefined;
    for (const k of ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens'])
      if (num(u?.[k]) === null) return `${file}: field message.usage.${k} missing`;
    if (typeof r.effort !== 'string') return `${file}: field effort missing`;
  }
  const groups = new Map<string, Rec[]>();
  for (const r of assistants) {
    const id: string = (r.message as Rec).id as string;
    const g: Rec[] | undefined = groups.get(id);
    if (g) g.push(r);
    else groups.set(id, [r]);
  }
  const tokens: Tokens = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  for (const g of groups.values()) {
    tokens.output_tokens += Math.max(...g.map((r) => ((r.message as Rec).usage as Rec).output_tokens as number));
    const u: Rec = (g[g.length - 1].message as Rec).usage as Rec;
    tokens.input_tokens += u.input_tokens as number;
    tokens.cache_read_input_tokens += u.cache_read_input_tokens as number;
    tokens.cache_creation_input_tokens += u.cache_creation_input_tokens as number;
  }
  const spanOutput = (a: number, b: number): number => {
    const prev = new Map<string, number>();
    let out: number = 0;
    for (const r of assistants) {
      const t: number = timed(r);
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
  for (let i: number = 0; i < ops.length; i += 1) {
    const t0: number = timed(ops[i]);
    const t1: number = i + 1 < ops.length ? timed(ops[i + 1]) : untilMs;
    let replyEnd: number | null = null;
    for (const r of assistants) {
      const t: number = timed(r);
      if (t > t0 && t <= t1) replyEnd = t;
    }
    operatorTurns.push({ startMs: t0, replyEndMs: replyEnd });
    if (replyEnd !== null) {
      turns.push({ startMs: t0, endMs: replyEnd, complete: true });
      if (i === 0) splitOpen = recs.some((r) => r.isCompactSummary === true && timed(r) > t0 && timed(r) <= t1);
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
        ? Date.parse(r.timestamp) >= openMs && Date.parse(r.timestamp) <= untilMs
        : lastTimed !== undefined && lastTimed >= openMs && lastTimed <= untilMs),
  );
  return {
    session,
    harness: 'claude',
    models: new Set(assistants.map((r) => (r.message as Rec).model as string)),
    efforts: new Set(assistants.map((r) => r.effort as string)),
    turns,
    assistantMessages: groups.size,
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

function codexSession(session: string, file: string, openMs: number, untilMs: number): SessionResult | string {
  const parsed: Rec[] | string = recordsOf(file);
  if (typeof parsed === 'string') return `${file}: ${parsed}`;
  const recs: Rec[] = parsed;
  const timed = (r: Rec): number => {
    if (typeof r.timestamp !== 'string') return NaN;
    return Date.parse(r.timestamp);
  };
  const counts: { ts: number; u: Rec }[] = [];
  const started = new Map<string, Rec>();
  const completed = new Map<string, Rec>();
  const models = new Set<string>();
  const efforts = new Set<string>();
  for (const r of recs) {
    const t: number = timed(r);
    if (r.type === 'event_msg' && (r.payload as Rec | undefined)?.type === 'token_count') {
      const u = ((r.payload as Rec).info as Rec | undefined)?.total_token_usage;
      if (u === undefined || typeof u !== 'object') return `${file}: field payload.info.total_token_usage missing`;
      for (const k of CODEX_KEYS)
        if (num((u as Rec)[k]) === null) return `${file}: field payload.info.total_token_usage.${k} missing`;
      counts.push({ ts: t, u: u as Rec });
    } else if (r.type === 'event_msg' && (r.payload as Rec | undefined)?.type === 'task_started') {
      const id: unknown = (r.payload as Rec).turn_id;
      if (typeof id !== 'string') return `${file}: field payload.turn_id missing`;
      started.set(id, r);
    } else if (r.type === 'event_msg' && (r.payload as Rec | undefined)?.type === 'task_complete') {
      const id: unknown = (r.payload as Rec).turn_id;
      if (typeof id !== 'string') return `${file}: field payload.turn_id missing`;
      completed.set(id, r);
    } else if (r.type === 'turn_context') {
      const p = r.payload as Rec;
      if (t >= openMs && t <= untilMs) {
        if (typeof p.model !== 'string') return `${file}: field payload.model missing`;
        if (typeof p.effort !== 'string') return `${file}: field payload.effort missing`;
        models.add(p.model);
        efforts.add(p.effort);
      }
    }
  }
  counts.sort((a, b) => a.ts - b.ts);
  const inWindow: { ts: number; u: Rec }[] = counts.filter((c) => c.ts >= openMs && c.ts <= untilMs);
  const before: { ts: number; u: Rec }[] = counts.filter((c) => c.ts < openMs);
  const zero: Rec = Object.fromEntries(CODEX_KEYS.map((k) => [k, 0]));
  const base: Rec = before.length > 0 ? before[before.length - 1].u : zero;
  if (
    inWindow.some((c, i) =>
      CODEX_KEYS.some((k) => (c.u[k] as number) < ((i === 0 ? base : inWindow[i - 1].u)[k] as number)),
    )
  )
    return `${basename(file)}: token_count cumulative counters decreased (counter reset)`;
  const last: Rec = inWindow.length > 0 ? inWindow[inWindow.length - 1].u : base;
  const tokens: Tokens = {};
  for (const k of CODEX_KEYS) tokens[k] = (last[k] as number) - (base[k] as number);
  const turns: Span[] = [];
  let splitOpen: boolean = false;
  for (const [id, s] of started) {
    const t0: number = timed(s);
    if (t0 < openMs || t0 > untilMs) continue;
    const c: Rec | undefined = completed.get(id);
    if (c !== undefined && timed(c) <= untilMs) turns.push({ startMs: t0, endMs: timed(c), complete: true });
    else turns.push({ startMs: t0, endMs: untilMs, complete: false });
  }
  const spanOutput = (a: number, b: number): number => {
    const inSpan: { ts: number; u: Rec }[] = counts.filter((c) => c.ts > a && c.ts <= b);
    if (inSpan.length === 0) return 0;
    const beforeSpan: { ts: number; u: Rec }[] = counts.filter((c) => c.ts <= a);
    const baseU: Rec = beforeSpan.length > 0 ? beforeSpan[beforeSpan.length - 1].u : zero;
    return (inSpan[inSpan.length - 1].u.output_tokens as number) - (baseU.output_tokens as number);
  };
  const userMsgs: Rec[] = recs.filter(
    (r) =>
      r.type === 'response_item' &&
      (r.payload as Rec | undefined)?.type === 'message' &&
      (r.payload as Rec).role === 'user' &&
      (r.metadata as Rec | undefined)?.user_input_order !== undefined &&
      timed(r) >= openMs &&
      timed(r) <= untilMs,
  );
  const operatorTurns: { startMs: number; replyEndMs: number | null }[] = [];
  for (const [i, r] of userMsgs.entries()) {
    const metadata = codexOperatorMetadataSchema.safeParse(r.metadata);
    if (!metadata.success) return `${file}: field metadata.${metadata.error.issues[0].path.join('.')} missing`;
    const completion: Rec | undefined = completed.get(metadata.data.retained_source.id.turn_id);
    const nextMs: number = i + 1 < userMsgs.length ? timed(userMsgs[i + 1]) : untilMs;
    const replyEndMs: number | null =
      completion !== undefined && timed(completion) <= nextMs ? timed(completion) : null;
    operatorTurns.push({ startMs: timed(r), replyEndMs });
  }
  operatorTurns.sort((x, y) => x.startMs - y.startMs);
  return {
    session,
    harness: 'codex',
    models,
    efforts,
    turns,
    assistantMessages: null,
    tokens,
    operatorTurns,
    spanOutput,
    splitOpen,
    totalCostUSD: null,
  };
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
  const openMs: number = Date.parse(seats.opened);

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
          ? claudeSession(entry.session, found.file, openMs, untilMs)
          : codexSession(entry.session, found.file, openMs, untilMs);
      if (typeof result === 'string') errors.push({ seat: letter, session: entry.session, detail: result });
      else sessions.push(result);
    }
    if (sessions.length > 0) measured.push({ seat: letter, sessions });
  }

  const firstSeatSessions: SessionResult[] =
    seatLetters.length > 0 ? (measured.find((m) => m.seat === seatLetters[0])?.sessions ?? []) : [];
  const ops: { startMs: number; replyEndMs: number | null }[] = firstSeatSessions
    .flatMap((s) => s.operatorTurns)
    .sort((a, b) => a.startMs - b.startMs);
  const opRows: { startMs: number; replyEndMs: number | null; endMs: number; outputs: [string, number][] }[] = ops.map(
    (o, i) => {
      const endMs: number = i + 1 < ops.length ? ops[i + 1].startMs : untilMs;
      const outputs: [string, number][] = measured.map((m) => [
        m.seat,
        m.sessions.reduce((acc, s) => acc + s.spanOutput(o.startMs, endMs), 0),
      ]);
      return { ...o, endMs, outputs };
    },
  );
  const waitMs: number = opRows.reduce((acc, o) => (o.replyEndMs === null ? acc : acc + (o.replyEndMs - o.startMs)), 0);

  const seatOut = (m: { seat: string; sessions: SessionResult[] }): number =>
    m.sessions.reduce((acc, s) => acc + s.tokens.output_tokens, 0);
  const parts: string[] = measured.map((m) => `${m.seat}=${seatOut(m)}`);
  const unmeasuredParts: string[] = seatLetters
    .filter((l) => !measured.some((m) => m.seat === l))
    .map((l) => `${l}=unmeasured`);
  const summary: string =
    `chart ${basename(chart)} - operator wait ${mins(0, waitMs)} min, operator turns ${opRows.length}, restatements ${seats.restatements}` +
    (parts.length + unmeasuredParts.length > 0 ? `; ${[...parts, ...unmeasuredParts].join(', ')} output` : '');

  const lines: string[] = [summary, '', `window ${iso(openMs)} to ${iso(untilMs)}`, ''];
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
  lines.push('- restatement requests on rounds that record no fork answer are not counted.');
  lines.push('');
  for (const m of measured) {
    const sessions: string = m.sessions.map((s) => s.session).join(' + ');
    lines.push(`seat ${m.seat} (harness ${m.sessions[0].harness}, sessions ${sessions}):`);
    const models = new Set(m.sessions.flatMap((s) => [...s.models]));
    const efforts = new Set(m.sessions.flatMap((s) => [...s.efforts]));
    if (models.size > 0) lines.push(`  models ${[...models].join(', ')}`);
    if (efforts.size > 0) lines.push(`  effort ${[...efforts].join(', ')}`);
    const complete: Span[] = m.sessions.flatMap((s) => s.turns.filter((t) => t.complete));
    const incomplete: number = m.sessions.reduce((acc, s) => acc + s.turns.filter((t) => !t.complete).length, 0);
    lines.push(`  turns ${complete.length}${incomplete > 0 ? `, ${incomplete} incomplete` : ''}`);
    const am: number = m.sessions.reduce((acc, s) => acc + (s.assistantMessages ?? 0), 0);
    if (m.sessions.some((s) => s.assistantMessages !== null)) lines.push(`  assistant messages ${am}`);
    const workMs: number = complete.reduce((acc, t) => acc + (t.endMs - t.startMs), 0);
    lines.push(`  working minutes ${mins(0, workMs)}`);
    const first: SessionResult | undefined = m.sessions[0];
    const firstTurn: Span | undefined = first?.turns.filter((t) => t.complete).sort((a, b) => a.startMs - b.startMs)[0];
    if (firstTurn !== undefined) {
      const note: string = first.splitOpen ? ' (opening reply was split across turns; not the whole map cost)' : '';
      lines.push(
        `  first turn in window ${iso(firstTurn.startMs)} ${mins(firstTurn.startMs, firstTurn.endMs)} min${note}`,
      );
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
    else lines.push(`  ${iso(o.startMs)} ${mins(o.startMs, o.replyEndMs)} min${outputs ? `, output ${outputs}` : ''}`);
  }
  lines.push(`  total operator wait ${mins(0, waitMs)} min`);
  lines.push(`restatements ${seats.restatements}`);
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
