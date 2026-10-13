import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { attemptRecordSchema } from './attempts';
import { readGlobal, requireRepo, type Repo } from './config';
import { readLog, type LogRecord } from './log';
import { requiredSlots, type Phase, type Slot } from './routing';
import { readTimings, type TimingEvent, type WaitReason } from './timing';

// Gate bounds fixed by issues/chart/leaf-speed/forks/measure-and-revisit.md (operator 2026-10-12).
const COHORT_SIZE: number = 20;
const IMPLEMENT_DIFF_LIMIT: number = 600;
const F_MEDIAN_MAX_MS: number = 35 * 60000;
const F_LIMIT_MS: number = 45 * 60000;
const F_LIMIT_COUNT: number = 15;
const EJECTION_LIMIT: number = 2;
const MERGED_MIN: number = 18;
const STALL_MS: number = 24 * 60 * 60000;

type AttemptRecord = z.infer<typeof attemptRecordSchema>;
type Move = LogRecord['record'];
type WaitKind = 'repo_pause' | Exclude<WaitReason, 'none'>;
const waitOrder: WaitKind[] = ['repo_pause', 'parked', 'prerequisite', 'merge_turn'];

type Visit = {
  phase: Phase;
  visit: number;
  start: number;
  end: number | null;
  failed: boolean;
  rounds: number;
};

function ms(ts: string): number {
  return Date.parse(ts);
}

function readAttempts(root: string): AttemptRecord[] {
  const issues: string = resolve(root, 'issues');
  if (!readdirSync(issues).includes('merge-attempts.jsonl')) return [];
  const content: string = readFileSync(resolve(issues, 'merge-attempts.jsonl'), 'utf8').replace(/(?:\r?\n)+$/, '');
  return content === '' ? [] : content.split('\n').map((text) => attemptRecordSchema.parse(JSON.parse(text)));
}

function movesOf(log: LogRecord[], slug: string): Move[] {
  return log.map((entry) => entry.record).filter((record) => record.slug === slug);
}

function visitsOf(slug: string, timings: TimingEvent[], log: LogRecord[]): Visit[] {
  const moves: Move[] = movesOf(log, slug);
  return timings
    .filter(
      (event): event is TimingEvent & { kind: 'visit_start' } => event.kind === 'visit_start' && event.slug === slug,
    )
    .map((event) => {
      const start: number = ms(event.ts);
      const entry: Move | undefined = moves
        .filter((record) => record.to === event.phase && ms(record.ts) <= start)
        .sort((a, b) => ms(b.ts) - ms(a.ts))[0];
      const close: Move | undefined = moves.find((record) => record.from === event.phase && ms(record.ts) >= start);
      return {
        phase: event.phase,
        visit: event.visit,
        start,
        end: close === undefined ? null : ms(close.ts),
        failed: close !== undefined && close.to === 'failed',
        rounds: entry?.fix_rounds ?? 0,
      };
    });
}

function pauseOpenAt(events: TimingEvent[], at: number): boolean {
  let open: boolean = false;
  for (const event of events) if (event.kind === 'repo_pause' && ms(event.ts) <= at) open = event.pause === 'on';
  return open;
}

function reasonAt(events: TimingEvent[], slug: string, at: number): WaitReason {
  let reason: WaitReason = 'none';
  for (const event of events)
    if (event.kind === 'wait' && event.slug === slug && ms(event.ts) <= at) reason = event.reason;
  return reason;
}

function waitTotals(events: TimingEvent[], slug: string, lo: number, hi: number): Map<WaitKind | 'none', number> {
  const edges: number[] = events
    .filter((event) =>
      event.kind === 'wait' || event.kind === 'prompt' ? event.slug === slug : event.kind === 'repo_pause',
    )
    .map((event) => ms(event.ts))
    .filter((ts) => ts > lo && ts < hi);
  const cuts: number[] = [...new Set([lo, hi, ...edges])].sort((a, b) => a - b);
  const totals = new Map<WaitKind | 'none', number>();
  for (let index = 0; index < cuts.length - 1; index++) {
    const [from, to]: [number, number] = [cuts[index], cuts[index + 1]];
    const mid: number = (from + to) / 2;
    const kind: WaitKind | 'none' = pauseOpenAt(events, mid) ? 'repo_pause' : reasonAt(events, slug, mid);
    totals.set(kind, (totals.get(kind) ?? 0) + (to - from));
  }
  return totals;
}

function promptStart(events: TimingEvent[], slug: string, visit: Visit): number | null {
  const first: number | undefined = events
    .filter(
      (event) =>
        event.kind === 'prompt' &&
        event.slug === slug &&
        event.outcome === 'delivered' &&
        event.phase === visit.phase &&
        event.visit === visit.visit &&
        ms(event.ts) >= visit.start &&
        (visit.end === null || ms(event.ts) <= visit.end),
    )
    .map((event) => ms(event.ts))
    .sort((a, b) => a - b)[0];
  return first === undefined ? null : first;
}

function promptedTotal(events: TimingEvent[], slug: string, visit: Visit): number {
  const first: number | null = promptStart(events, slug, visit);
  if (first === null) return 0;
  const hi: number = visit.end ?? Date.now();
  let total: number = 0;
  for (const [kind, span] of waitTotals(events, slug, Math.max(first, visit.start), hi))
    if (kind === 'none') total += span;
  return total;
}

function delivered(events: TimingEvent[], slug: string, visit: Visit, slot: Slot): boolean {
  return events.some(
    (event) =>
      event.kind === 'prompt' &&
      event.slug === slug &&
      event.outcome === 'delivered' &&
      event.slot === slot &&
      event.phase === visit.phase &&
      event.visit === visit.visit &&
      ms(event.ts) >= visit.start &&
      (visit.end === null || ms(event.ts) <= visit.end),
  );
}

function checkPairs(
  events: TimingEvent[],
  slug: string,
  visit: Visit,
): { start: TimingEvent & { kind: 'check_start' }; end: TimingEvent & { kind: 'check_end' } }[] {
  if (visit.end === null) return [];
  const ends = new Map<string, TimingEvent & { kind: 'check_end' }>();
  for (const event of events)
    if (event.kind === 'check_end' && event.slug === slug && event.phase === visit.phase) ends.set(event.run, event);
  return events.flatMap((event) => {
    if (
      event.kind !== 'check_start' ||
      event.slug !== slug ||
      event.phase !== visit.phase ||
      ms(event.ts) < visit.start ||
      ms(event.ts) >= (visit.end as number)
    )
      return [];
    const end: (TimingEvent & { kind: 'check_end' }) | undefined = ends.get(event.run);
    return end !== undefined && ms(end.ts) <= (visit.end as number) ? [{ start: event, end }] : [];
  });
}

function visitGaps(events: TimingEvent[], slug: string, visit: Visit): string[] {
  if (visit.end === null || visit.failed) return [];
  const missing: string[] = [];
  const slots: readonly Slot[] = requiredSlots(visit.phase, visit.rounds);
  const present: Slot[] = slots.filter((slot) => delivered(events, slug, visit, slot));
  if (slots.length > 0 && present.length === 0) missing.push('prompt');
  else for (const slot of slots.filter((slot) => !present.includes(slot))) missing.push(`prompt:${slot}`);
  if (
    visit.phase === 'check.review' &&
    visit.rounds === 0 &&
    !events.some(
      (event) =>
        event.kind === 'seat_done' &&
        event.slug === slug &&
        event.phase === visit.phase &&
        event.visit === visit.visit &&
        ms(event.ts) >= visit.start &&
        (visit.end === null || ms(event.ts) <= visit.end),
    )
  )
    missing.push('seat_done');
  const paired: Set<TimingEvent> = new Set(checkPairs(events, slug, visit).map((pair) => pair.start));
  for (const event of events)
    if (
      event.kind === 'check_start' &&
      event.slug === slug &&
      event.phase === visit.phase &&
      ms(event.ts) >= visit.start &&
      ms(event.ts) < visit.end &&
      !paired.has(event)
    )
      missing.push(`check_end ${event.name}`);
  return missing;
}

function duration(msValue: number): string {
  const seconds: number = Math.max(0, Math.round(msValue / 1000));
  const parts: string[] = [];
  const h: number = Math.floor(seconds / 3600);
  const m: number = Math.floor((seconds % 3600) / 60);
  const s: number = seconds % 60;
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join('');
}

function visitLines(events: TimingEvent[], slug: string, visit: Visit): string[] {
  if (visit.end === null) return [`${visit.phase} #${visit.visit} open`];
  const waits: Map<WaitKind | 'none', number> = waitTotals(events, slug, visit.start, visit.end);
  const prompted: number = promptedTotal(events, slug, visit);
  const lines: string[] = [`${visit.phase} #${visit.visit} ${duration(visit.end - visit.start)}`];
  for (const kind of waitOrder) {
    const total: number = waits.get(kind) ?? 0;
    if (total > 0) lines.push(`  wait ${kind} ${duration(total)}`);
  }
  if (prompted > 0) lines.push(`  prompted ${duration(prompted)}`);
  for (const pair of checkPairs(events, slug, visit))
    lines.push(
      `    check ${pair.start.scope}:${pair.start.name}${pair.start.unit === undefined ? '' : `/${pair.start.unit}`} ${duration(ms(pair.end.ts) - ms(pair.start.ts))}`,
    );
  const none: number = Math.max(0, (waits.get('none') ?? 0) - prompted);
  if (none > 0) lines.push(`  wait none ${duration(none)}`);
  for (const name of visitGaps(events, slug, visit)) lines.push(`  incomplete ${name}`);
  return lines;
}

function slugReport(repo: Repo, slug: string): void {
  const timings: TimingEvent[] = readTimings(repo.root);
  const log: LogRecord[] = readLog(repo.root);
  console.log(
    visitsOf(slug, timings, log)
      .flatMap((visit) => visitLines(timings, slug, visit))
      .join('\n'),
  );
}

function diffLines(diff: string): number {
  const insertions: RegExpMatchArray | null = /(\d+) insertion/.exec(diff);
  const deletions: RegExpMatchArray | null = /(\d+) deletion/.exec(diff);
  return (
    (insertions === null ? 0 : Number.parseInt(insertions[1], 10)) +
    (deletions === null ? 0 : Number.parseInt(deletions[1], 10))
  );
}

type Member = {
  slug: string;
  joined: number;
  merged: number | null;
  failed: boolean;
  stalled: boolean;
  f: number | null;
  waits: Map<WaitKind | 'none', number>;
  gaps: string[];
};

function memberOf(slug: string, joined: number, timings: TimingEvent[], log: LogRecord[], now: number): Member {
  const moves: Move[] = movesOf(log, slug);
  const merge: Move | undefined = moves.find((record) => record.to === 'merged');
  const merged: number | null = merge === undefined ? null : ms(merge.ts);
  const last: Move | undefined = moves.at(-1);
  const failed: boolean = last !== undefined && last.to === 'failed';
  const stalled: boolean = merged === null && !failed && now - joined >= STALL_MS;
  const visits: Visit[] = visitsOf(slug, timings, log);
  const implPrompted: number = visits
    .filter((visit) => visit.phase === 'implement')
    .map((visit) => promptedTotal(timings, slug, visit))
    .reduce((sum, span) => sum + span, 0);
  const outcome: number = merged ?? (failed ? ms((last as Move).ts) : now);
  return {
    slug,
    joined,
    merged,
    failed,
    stalled,
    f: merged === null ? null : merged - joined - implPrompted,
    waits: waitTotals(timings, slug, joined, Math.max(outcome, joined)),
    gaps: visits.flatMap((visit) =>
      visitGaps(timings, slug, visit).map((name) => `${visit.phase}#${visit.visit} ${name}`),
    ),
  };
}

function memberLine(member: Member): string {
  const f: string =
    member.f === null
      ? member.failed || member.stalled
        ? `over 45 (${member.failed ? 'failed' : 'stalled'})`
        : 'pending'
      : `F ${duration(member.f)}`;
  const waits: string = waitOrder
    .map((kind): [string, number] => [kind === 'repo_pause' ? 'paused' : kind, member.waits.get(kind) ?? 0])
    .filter(([, total]) => total > 0)
    .map(([kind, total]) => `${kind} ${duration(total)}`)
    .join(' ');
  return `${member.slug} ${f}${waits === '' ? '' : ` wait ${waits}`}${member.gaps.length === 0 ? '' : ` gaps: ${member.gaps.join(', ')}`}`;
}

function verdict(members: Member[], ejections: number): 'pass' | 'fail' | 'insufficient' {
  const merged: number = members.filter((member) => member.merged !== null).length;
  const failed: number = members.filter((member) => member.failed).length;
  const over45: number = members.filter(
    (member) => member.failed || member.stalled || (member.f !== null && member.f > F_LIMIT_MS),
  ).length;
  const bestF: number[] = [
    ...members.map((member): number => (member.failed || member.stalled ? Infinity : (member.f ?? 0))),
    ...Array<number>(COHORT_SIZE - members.length).fill(0),
  ].sort((a, b) => a - b);
  const bestMedian: number = (bestF[COHORT_SIZE / 2 - 1] + bestF[COHORT_SIZE / 2]) / 2;
  const unresolved: number = members.filter(
    (member) => member.merged === null && !member.failed && !member.stalled,
  ).length;
  if (
    failed > COHORT_SIZE - MERGED_MIN ||
    over45 > COHORT_SIZE - F_LIMIT_COUNT ||
    bestMedian > F_MEDIAN_MAX_MS ||
    ejections > EJECTION_LIMIT
  )
    return 'fail';
  if (members.length < COHORT_SIZE || unresolved > 0 || merged < MERGED_MIN) return 'insufficient';
  return 'pass';
}

function cohortReport(repo: Repo, since: string): void {
  const timings: TimingEvent[] = readTimings(repo.root);
  const log: LogRecord[] = readLog(repo.root);
  const firstPlan = new Map<string, number>();
  for (const event of timings)
    if (
      event.kind === 'prompt' &&
      event.outcome === 'delivered' &&
      event.phase.startsWith('plan.') &&
      ms(event.ts) > ms(since)
    ) {
      const seen: number | undefined = firstPlan.get(event.slug);
      if (seen === undefined || ms(event.ts) < seen) firstPlan.set(event.slug, ms(event.ts));
    }
  const joiners: string[] = [...firstPlan.entries()]
    .filter(([slug]) => {
      const exit: Move | undefined = movesOf(log, slug).find((record) => record.from === 'implement');
      return exit === undefined || diffLines(exit.diff) <= IMPLEMENT_DIFF_LIMIT;
    })
    .sort((a, b) => a[1] - b[1])
    .slice(0, COHORT_SIZE)
    .map(([slug]) => slug);
  const memberSet: Set<string> = new Set(joiners);
  const ejections: number = readAttempts(repo.root)
    .filter((attempt) => attempt.outcome === 'ejected' || attempt.outcome === 'red')
    .reduce(
      (count, attempt) =>
        count + (memberSet.has(attempt.holder) ? 1 : 0) + attempt.members.filter((slug) => memberSet.has(slug)).length,
      0,
    );
  const now: number = Date.now();
  const members: Member[] = joiners.map((slug) => memberOf(slug, firstPlan.get(slug)!, timings, log, now));
  console.log(verdict(members, ejections));
  for (const member of members) console.log(memberLine(member));
}

export async function timingCommand(cwd: string, arg: { slug: string } | { since: string }): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  if ('slug' in arg) slugReport(repo, arg.slug);
  else cohortReport(repo, arg.since);
}
