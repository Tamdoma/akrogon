import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
  currentRepo,
  expandPath,
  globalHome,
  readGlobal,
  readRepo,
  requireRepo,
  seats,
  SeatIndexError,
  worktreeStore,
  type GlobalConfig,
  type Repo,
  type SlotConfig,
} from './config';
import {
  broadcastPending,
  findLeaf,
  hasLeafFolder,
  isParked,
  readInventory,
  repoInventory,
  RepoMismatchError,
  type DeliveryError,
  type Inventory,
  type Leaf,
  type LeafFailure,
  type State,
} from './state';
import { readLog, type LogRecord } from './log';
import { readTimings, type TimingEvent } from './timing';
import { mergeQueue, type QueueEntry } from './turn';
import { issueFolders } from './park';
import { gaps, readReadiness, type Gap, type Readiness } from './readiness';
import { readPaused } from './pause';
import { readStopped } from './stop';
import { readHostKept, readKept, type KeptEntry } from './reconcile';
import { currentLink, currentReleaseCommit, deployRecordPath, readDeployRecord } from './release';
import { landAlive, landUnit } from './land';
import { requiredSlots } from './routing';
import { lineRuns, type RunRecord } from './admission';
import { readVerifyRuns, type VerifyRun } from './verify';

type ScannedLeaf = Leaf & {
  missing: Gap[];
  seatSources: { a: string; b: string };
  resolved: { a: SlotConfig; b: SlotConfig };
};
type Scan =
  | {
      ok: true;
      repo: Repo;
      leaves: ScannedLeaf[];
      closed: Leaf[];
      parked: string[];
      log: LogRecord[];
      timings: TimingEvent[];
      queue: QueueEntry[];
      failures: LeafFailure[];
      slow: VerifyRun | undefined;
    }
  | { ok: false; repo: string; path: string; root: string; error: string };

class ReadinessError extends Error {}

function leafGaps(global: GlobalConfig, leaf: Leaf): Gap[] {
  try {
    const readiness: Readiness | null = readReadiness(leaf.path);
    return readiness === null ? [] : gaps(global, readiness);
  } catch (error) {
    throw new ReadinessError(error instanceof Error ? error.message : String(error));
  }
}

function scanRepo(name: string, registeredPath: string, global: GlobalConfig): Scan {
  let path: string = expandPath(registeredPath, globalHome());
  try {
    readdirSync(path);
    path = resolve(path, 'issues/config.yaml');
    const repo: Repo = readRepo(name, registeredPath);
    const open: string = resolve(repo.root, 'issues/open');
    const inventory: Inventory = repoInventory(repo);
    const closed: Leaf[] = inventory.leaves.filter((leaf) => !leaf.path.startsWith(open + sep));
    const leaves: ScannedLeaf[] = inventory.leaves
      .filter((leaf) => leaf.path.startsWith(open + sep))
      .map((leaf) => {
        path = resolve(leaf.path, 'readiness.yaml');
        const seat = seats(global, repo, leaf.path);
        return {
          ...leaf,
          missing: leafGaps(global, leaf),
          seatSources: seat.source,
          resolved: { a: seat.a, b: seat.b },
        };
      });
    const failures: LeafFailure[] = [
      ...inventory.unreadable.map((failure) => ({
        path: resolve(failure.path, 'state.yaml'),
        error: failure.error,
      })),
      ...inventory.foreign.map((leaf) => ({
        path: resolve(leaf.path, 'state.yaml'),
        error: new RepoMismatchError(leaf.path, leaf.stored, repo.name).message,
      })),
      ...inventory.unknown,
    ];
    path = resolve(repo.root, 'issues/log.jsonl');
    const log: LogRecord[] = readLog(repo.root);
    const queue: QueueEntry[] = mergeQueue(global, repo, inventory.leaves, () => log);
    const timings: TimingEvent[] = readTimings(repo.root);
    path = resolve(repo.root, 'issues/verify-runs.jsonl');
    const slow: VerifyRun | undefined = readVerifyRuns(repo).findLast((run) => run.slow !== undefined);
    return {
      ok: true,
      repo,
      leaves,
      closed,
      parked: issueFolders(repo.root, 'issues/parked'),
      log,
      timings,
      queue,
      failures,
      slow,
    };
  } catch (error) {
    if (error instanceof SeatIndexError) path = error.file;
    if (
      error instanceof SeatIndexError ||
      error instanceof RepoMismatchError ||
      error instanceof ReadinessError ||
      error instanceof z.ZodError ||
      error instanceof SyntaxError ||
      (error instanceof Error && 'code' in error && typeof error.code === 'string' && /^E[A-Z]+$/.test(error.code))
    ) {
      return { ok: false, repo: name, path, root: expandPath(registeredPath, globalHome()), error: error.message };
    }
    throw error;
  }
}

const header: string[] = ['LEAF', 'PHASE', 'TIME', 'BLOCKED BY', 'NOTE', 'TURN'];

function clock(ms: number): string {
  const minutes: number = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

// Each slug's first delivered seat prompt, when work on the leaf began.
function starts(timings: TimingEvent[]): Map<string, number> {
  return timings.reduce(
    (map, event) =>
      event.kind === 'prompt' && event.outcome === 'delivered'
        ? map.set(event.slug, Math.min(map.get(event.slug) ?? Infinity, Date.parse(event.ts)))
        : map,
    new Map<string, number>(),
  );
}

function note(state: State, now: number, seatSources: { a: string; b: string }): string {
  const busy: string[] =
    state.phase === 'failed' || state.phase === 'merged'
      ? []
      : (['A', 'B'] as const).flatMap((seat) => {
          const since: string | undefined = state.busy_since[seat];
          return since === undefined ? [] : [`busy ${seat} ${clock(now - Date.parse(since))}`];
        });
  const attempts: string[] =
    state.attempts.A + state.attempts.B > 0 ? [`A:${state.attempts.A} B:${state.attempts.B}`] : [];
  const fixes: string[] = state.fix_rounds > 0 ? [`fix rounds ${state.fix_rounds}`] : [];
  const verdicts: string[] = Object.entries(state.verdict).map(([slot, value]) => `${slot}:${value}`);
  const verdict: string[] = verdicts.length > 0 ? [`verdict ${verdicts.join(' ')}`] : [];
  const done: string[] = state.done.length > 0 ? [`done ${state.done.join(' ')}`] : [];
  const prompt: string[] = (['A', 'B'] as const).flatMap((seat) => {
    const err: DeliveryError | undefined = state.delivery_error[seat];
    return err !== undefined && state.busy_since[seat] === undefined ? [`${seat} prompt ${err.code}`] : [];
  });
  const failed: string[] =
    state.phase === 'failed'
      ? [state.failure === undefined ? 'failed' : `failed ${state.failure.cause} ${state.failure.reason}`]
      : [];
  const indexNames: string[] = [seatSources.a, seatSources.b]
    .map((file) => basename(file))
    .filter((name) => name === 'ISSUE.md' || name === 'EPIC.md')
    .filter((name, index, all) => all.indexOf(name) === index);
  const land: string[] = state.phase === 'merge' && state.batch?.owner === 'command' ? ['land'] : [];
  const broadcast: string[] = broadcastPending(state) ? ['broadcast pending'] : [];
  return [
    ...failed,
    ...land,
    ...broadcast,
    ...done,
    ...prompt,
    ...attempts,
    ...fixes,
    ...verdict,
    ...busy,
    ...indexNames.map((name) => 'seats ' + name),
  ].join(' · ');
}

// The moment the leaf entered its current phase, from the last record into it.
function phaseEntry(log: LogRecord[], state: State): LogRecord | undefined {
  return log.findLast(({ record }) => record.slug === state.slug && record.to === state.phase);
}

// The command-owned land attempt when the leaf is in one.
function landAttempt(state: State): string | undefined {
  return state.phase === 'merge' && state.batch?.owner === 'command' ? state.batch.attempt : undefined;
}

function cells(
  leaf: ScannedLeaf,
  log: LogRecord[],
  start: number | undefined,
  now: number,
  indent: string,
  queue: Map<string, QueueEntry>,
  stopped: boolean,
): string[] {
  const state: State = leaf.state;
  const last: LogRecord | undefined = phaseEntry(log, state);
  const end: number | undefined =
    state.phase !== 'merged' && state.phase !== 'failed'
      ? now
      : last === undefined
        ? undefined
        : Date.parse(last.record.ts);
  const time: string = start === undefined || end === undefined || end < start ? '-' : clock(end - start);
  const entry: QueueEntry | undefined = queue.get(state.slug);
  const detail: string = note(state, now, leaf.seatSources);
  const turn: string =
    entry === undefined
      ? ''
      : `${entry.place === 1 ? 'holder' : entry.place}${entry.noRecord ? ' no merge record' : ''}`;
  return [
    `${indent}${state.slug}`,
    state.phase,
    time,
    state['blocked-by'].join(' '),
    stopped ? (detail === '' ? 'stopped' : `stopped; ${detail}`) : detail,
    turn,
  ];
}

function rows(scan: Scan & { ok: true }, now: number, stopped: Set<string>): string[][] {
  const queue: Map<string, QueueEntry> = new Map(scan.queue.map((entry) => [entry.leaf.state.slug, entry]));
  const started: Map<string, number> = starts(scan.timings);
  let previous: string[] = [];
  return scan.leaves.flatMap((leaf) => {
    const groups: string[] = relative(resolve(scan.repo.root, 'issues/open'), leaf.path).split(sep).slice(0, -1);
    let shared: number = 0;
    while (shared < groups.length && shared < previous.length && groups[shared] === previous[shared]) shared++;
    const separator: string[][] = previous.length > 0 && shared < groups.length ? [['', '', '', '', '', '']] : [];
    previous = groups;
    return [
      ...separator,
      ...groups.slice(shared).map((group, offset) => [`${indent(shared + offset)}${group}`, '', '', '', '', '']),
      cells(
        leaf,
        scan.log,
        started.get(leaf.state.slug),
        now,
        indent(groups.length),
        queue,
        stopped.has(`${scan.repo.name}/${leaf.state.slug}`),
      ),
    ];
  });
}

function indent(depth: number): string {
  return `  ${'   '.repeat(depth)}`;
}

const colorEnabled: boolean =
  process.stdout.isTTY === true && (process.env.NO_COLOR ?? '') === '' && process.env.TERM !== 'dumb';

function paint(code: string, text: string): string {
  return colorEnabled && code !== '' && text !== '' ? `\x1b[${code}m${text}\x1b[0m` : text;
}

const phaseColor: Record<string, string> = {
  plan: '34',
  implement: '33',
  check: '35',
  merge: '32',
  failed: '31',
  parked: '2',
};

const stageColor: Record<string, string> = { 'handed off': '32', charting: '33', empty: '2' };

const lineColor: Record<string, string> = { running: '32', waiting: '33', ended: '2' };

function style(title: string, text: string, kind: 'header' | 'group' | 'leaf'): string {
  if (kind === 'header') return paint('2', text);
  if (title === 'LEAF' || title === 'CHART') return kind === 'group' ? paint('1', text) : text;
  if (title === 'PHASE') return paint(phaseColor[text.split('.')[0]] ?? '', text);
  if (title === 'STAGE') return paint(stageColor[text] ?? '', text);
  if (title === 'BLOCKED BY') return paint('2', text);
  if (title === 'STATE') return paint(lineColor[text.split(' ')[0]] ?? '', text);
  return text;
}

function wrap(text: string, width: number, separator: string): string[] {
  const lines: string[] = [];
  for (const token of text.split(separator)) {
    const last: string | undefined = lines.at(-1);
    if (last !== undefined && `${last}${separator}${token}`.length <= width)
      lines[lines.length - 1] = `${last}${separator}${token}`;
    else lines.push(token);
  }
  return lines;
}

function widths(titles: string[], lines: string[][]): number[] {
  const natural: number[] = titles.map((title, column) =>
    Math.max(title.length, ...lines.map((line) => line[column].length)),
  );
  const columns: number | undefined = process.stdout.isTTY === true ? process.stdout.columns : undefined;
  if (columns === undefined || titles !== header) return natural;
  const budget: number = columns - natural[0] - natural[1] - natural[2] - natural[5] - 10;
  const half: number = Math.floor(budget / 2);
  if (natural[3] + natural[4] <= budget || half < 16) return natural;
  const blocked: number = natural[3] <= half ? natural[3] : Math.max(half, budget - natural[4]);
  return [natural[0], natural[1], natural[2], blocked, budget - blocked, natural[5]];
}

function stacked(titles: string[], lines: string[][]): string[] {
  return lines.slice(1).flatMap((line) => {
    const kind: 'group' | 'leaf' = line[1] === '' ? 'group' : 'leaf';
    const pad: string = ' '.repeat(line[0].length - line[0].trimStart().length + 2);
    return [
      style(titles[0], line[0], kind),
      ...titles.slice(1).flatMap((title, offset) => {
        const text: string = line[offset + 1];
        return text === '' ? [] : [`${pad}${paint('2', title.toLowerCase())}  ${style(title, text, kind)}`];
      }),
    ];
  });
}

function render(titles: string[], lines: string[][]): string[] {
  const width: number[] = widths(titles, lines);
  const columns: number | undefined = process.stdout.isTTY === true ? process.stdout.columns : undefined;
  if (columns !== undefined && width.reduce((sum, w) => sum + w + 2, -2) > columns) return stacked(titles, lines);
  return lines.flatMap((line) => {
    const kind: 'header' | 'group' | 'leaf' = line[1] === titles[1] ? 'header' : line[1] === '' ? 'group' : 'leaf';
    const cell: string[][] = line.map((text, column) =>
      titles[column] === 'BLOCKED BY'
        ? wrap(text, width[column], ' ')
        : titles[column] === 'NOTE'
          ? wrap(text, width[column], ' · ')
          : [text],
    );
    const height: number = Math.max(...cell.map((part) => part.length));
    return Array.from({ length: height }, (_, row) =>
      titles
        .map((title, column) => {
          const text: string = cell[column][row] ?? '';
          return `${style(title, text, kind)}${' '.repeat(Math.max(0, width[column] - text.length))}`;
        })
        .join('  ')
        .trimEnd(),
    );
  });
}

const chartHeader: string[] = ['CHART', 'TAKEN', 'FOG', 'STAGE', 'AGE'];

const lineHeader: string[] = ['REPO', 'LEAF', 'CHECK', 'STATE', 'AGE', 'RUN'];

// Shown only while a listed run waits: each repo's holder first, then its
// waiters in queue order.
function lineRows(runs: RunRecord[], now: number): string[][] {
  let perRepo: number = 0;
  let lastRepo: string = '';
  return runs.map((run) => {
    perRepo = run.repo === lastRepo ? perRepo : 0;
    lastRepo = run.repo;
    if (run.state === 'waiting') perRepo += 1;
    return [
      `  ${run.repo}`,
      run.leaf,
      run.check,
      run.state === 'waiting' ? `waiting ${perRepo}` : run.state === 'ended' ? 'ended' : 'running',
      clock(now - Date.parse(run.since)),
      run.run,
    ];
  });
}

export type ChartStage = 'handed off' | 'closed' | 'held';

export function lastStage(markdown: string): ChartStage | undefined {
  return markdown
    .match(/^(Handed off|Closed|Held)\b/gm)
    ?.at(-1)
    ?.toLowerCase() as ChartStage | undefined;
}

function chartFolders(root: string): string[] {
  const store: string = resolve(root, 'issues/chart');
  if (!existsSync(store)) return [];
  if (existsSync(resolve(store, 'CHART.md'))) return [store];
  return readdirSync(store, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(store, entry.name, 'CHART.md')))
    .map((entry) => resolve(store, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

export type Unpacked = { path: string; command: string };

// Folders a person must finish packing: closed owners and ended charts still
// holding plain logs, any .closing a failed pack or close left, and open-owner
// .closing markers naming the completion retry.
function unpackedEntries(root: string): Unpacked[] {
  const entries: Unpacked[] = [];
  const packLine = (folder: string): Unpacked => {
    const rel: string = relative(root, folder);
    return { path: rel, command: `akrogon pack ${rel}` };
  };
  const hasLog = (dir: string): boolean =>
    existsSync(dir) &&
    [...new Bun.Glob('**/*.log').scanSync({ cwd: dir, dot: true, onlyFiles: false })].some(
      (name) => !lstatSync(resolve(dir, name)).isDirectory(),
    );
  const closing = (folder: string): boolean => existsSync(resolve(folder, '.closing'));
  for (const owner of issueFolders(root, 'issues/closed')) {
    const folder: string = resolve(root, 'issues/closed', owner);
    if (hasLog(folder) || closing(folder)) entries.push(packLine(folder));
  }
  for (const folder of chartFolders(root)) {
    // The single-chart layout's direct/ logs are unpackable: locate resolves
    // only issues/chart/<chart>/direct/*, so pack cannot verify its members.
    if (folder === resolve(root, 'issues/chart')) continue;
    const ended: boolean = lastStage(readFileSync(resolve(folder, 'CHART.md'), 'utf8')) !== undefined;
    if ((ended && hasLog(resolve(folder, 'direct'))) || closing(folder)) entries.push(packLine(folder));
  }
  const open: string = resolve(root, 'issues/open');
  const owners: string[] =
    statSync(open, { throwIfNoEntry: false })?.isDirectory() === true ? issueFolders(root, 'issues/open') : [];
  for (const owner of owners) {
    const folder: string = resolve(open, owner);
    if (!closing(folder)) continue;
    const leaves: Leaf[] = readInventory(folder, open).leaves;
    const slug: string | undefined =
      leaves.find((leaf) => leaf.state.phase === 'merged')?.state.slug ?? leaves[0]?.state.slug;
    if (slug !== undefined) entries.push({ path: relative(root, folder), command: `akrogon next ${slug}` });
  }
  return entries;
}

function since(ms: number): string {
  const minutes: number = Math.max(0, Math.floor(ms / 60000));
  return minutes < 60
    ? `${minutes}m`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h`
      : `${Math.floor(minutes / 1440)}d`;
}

function section(markdown: string, title: string): string[] {
  const body: string | undefined = markdown.split(/^## /m).find((part) => part.startsWith(title));
  return body === undefined
    ? []
    : body
        .split('\n')
        .slice(1)
        .filter((line) => /^\s*[-*]\s*\S/.test(line) && !/^\s*[-*]\s*(none|nothing)\b/i.test(line));
}

function chartRow(folder: string, name: string, now: number): string[] {
  const chart: string = resolve(folder, 'CHART.md');
  const markdown: string = readFileSync(chart, 'utf8');
  const forks: string = resolve(folder, 'forks');
  const files: string[] = existsSync(forks) ? readdirSync(forks).filter((entry) => entry.endsWith('.md')) : [];
  const taken: number = files.filter((entry) =>
    /^## Taken\s*\n\s*\S/m.test(readFileSync(resolve(forks, entry), 'utf8')),
  ).length;
  const fog: number = section(markdown, 'Fog').length;
  const stage: string = lastStage(markdown) ?? (files.length + fog > 0 ? 'charting' : 'empty');
  return [`  ${name}`, `${taken}/${files.length}`, String(fog), stage, since(now - statSync(chart).mtimeMs)];
}

function chartRows(root: string, now: number): string[][] {
  const store: string = resolve(root, 'issues/chart');
  return chartFolders(root).map((folder) => chartRow(folder, folder === store ? 'chart' : basename(folder), now));
}

type JsonLeaf = {
  slug: string;
  group: string[];
  phase: string;
  phase_since: number | null;
  first_prompt: number | null;
  stopped: boolean;
  blocked_by: { slug: string; label: string }[];
  broadcast_pending: boolean;
  land: { alive: boolean; unit: string } | null;
  busy_since: { a: number | null; b: number | null };
  done: State['done'];
  attempts: State['attempts'];
  fix_rounds: number;
  verdict: State['verdict'];
  delivery_errors: { a: DeliveryError | null; b: DeliveryError | null };
  failure: State['failure'] | null;
  missing: Gap[];
  attention: string[];
  waits_on: ('A' | 'B')[];
  worktree: string;
  plan: string;
  red: boolean;
  seats: {
    a: { harness: string; command: string; source: string };
    b: { harness: string; command: string; source: string };
  };
  history: string[];
};

type JsonRepo = {
  name: string;
  root: string;
  paused: boolean;
  error: string | null;
  unreadable: LeafFailure[];
  slow: { leaf: string; run: string; ms: number; normal_ms: number } | null;
  unpacked: Unpacked[];
  queue: { slug: string; place: number; no_record: boolean }[];
  kept: { path: string; reason: string }[];
  charts: string[][];
  parked: string[];
  leaves: JsonLeaf[];
};

type JsonEnvelope = {
  schema: 1;
  generated: number;
  red: number;
  watch: { folders: string[]; files: string[] };
  deploy: {
    failed: boolean;
    attempted: string | null;
    active: string | null;
    step: string | null;
    error: string | null;
  } | null;
  run: string | null;
  kept: { path: string; reason: string }[];
  merges: { repo: string; slug: string; merged: number | null; total_ms: number | null }[];
  repos: JsonRepo[];
};

function seatJson(global: GlobalConfig, seat: SlotConfig, source: string): JsonLeaf['seats']['a'] {
  return { harness: seat.harness, command: global.harnesses[seat.harness].split(' ')[0], source };
}

// Every raw blocked-by slug labelled the way unmergedDeps labels its blockers,
// plus 'merged' for an already satisfied dependency.
function blockedBy(repo: Repo, state: State, leaves: Leaf[]): JsonLeaf['blocked_by'] {
  return state['blocked-by'].map((slug) => {
    const dependency: Leaf | undefined = leaves.find((leaf) => leaf.state.slug === slug);
    if (dependency !== undefined) return { slug, label: dependency.state.phase };
    if (isParked(repo, slug)) return { slug, label: 'parked' };
    if (hasLeafFolder(repo, slug)) return { slug, label: 'unreadable' };
    return { slug, label: 'missing' };
  });
}

// The recorded facts that make this leaf need the operator; leaf.red is
// attention.length > 0 so the envelope, the panel dot and the board share one
// predicate. The prompt entries keep the note() condition: a recorded delivery
// error whose seat is not busy.
function leafAttention(
  leaf: ScannedLeaf,
  deps: JsonLeaf['blocked_by'],
  attempt: string | undefined,
  alive: boolean,
): string[] {
  const state: State = leaf.state;
  const facts: string[] = [];
  if (state.phase === 'failed')
    facts.push(state.failure === undefined ? 'failed' : `failed: ${state.failure.cause}: ${state.failure.reason}`);
  for (const gap of leaf.missing) facts.push(`missing ${gap.kind} ${gap.name}`);
  for (const seat of ['A', 'B'] as const) {
    const err: DeliveryError | undefined = state.delivery_error[seat];
    if (err !== undefined && state.busy_since[seat] === undefined) facts.push(`${seat} prompt ${err.code}`);
  }
  for (const dep of deps)
    if (dep.label === 'parked' || dep.label === 'missing' || dep.label === 'unreadable')
      facts.push(`waiting on ${dep.slug} (${dep.label})`);
  if (attempt !== undefined && !alive && state.batch?.recorded !== true) facts.push('merge job stopped');
  return facts;
}

async function leafJson(
  global: GlobalConfig,
  scan: Scan & { ok: true },
  leaf: ScannedLeaf,
  started: Map<string, number>,
  stopped: Set<string>,
  worktree: string,
): Promise<JsonLeaf> {
  const state: State = leaf.state;
  const entry: LogRecord | undefined = phaseEntry(scan.log, state);
  const attempt: string | undefined = landAttempt(state);
  const alive: boolean = attempt !== undefined && (await landAlive(attempt));
  const deps: JsonLeaf['blocked_by'] = blockedBy(scan.repo, state, [...scan.leaves, ...scan.closed]);
  const attention: string[] = leafAttention(leaf, deps, attempt, alive);
  return {
    slug: state.slug,
    group: relative(resolve(scan.repo.root, 'issues/open'), leaf.path).split(sep).slice(0, -1),
    phase: state.phase,
    phase_since: entry === undefined ? null : Date.parse(entry.record.ts),
    first_prompt: started.get(state.slug) ?? null,
    stopped: stopped.has(`${scan.repo.name}/${state.slug}`),
    blocked_by: deps,
    attention,
    waits_on: requiredSlots(state.phase, state.fix_rounds).filter(
      (seat) => !state.done.includes(seat) && state.busy_since[seat] === undefined,
    ),
    broadcast_pending: broadcastPending(state),
    land: attempt === undefined ? null : { alive, unit: landUnit(attempt) },
    busy_since: {
      a: state.busy_since.A === undefined ? null : Date.parse(state.busy_since.A),
      b: state.busy_since.B === undefined ? null : Date.parse(state.busy_since.B),
    },
    done: state.done,
    attempts: state.attempts,
    fix_rounds: state.fix_rounds,
    verdict: state.verdict,
    delivery_errors: { a: state.delivery_error.A ?? null, b: state.delivery_error.B ?? null },
    failure: state.failure ?? null,
    missing: leaf.missing,
    worktree,
    plan: resolve(leaf.path, 'plan.md'),
    red: attention.length > 0,
    seats: {
      a: seatJson(global, leaf.resolved.a, leaf.seatSources.a),
      b: seatJson(global, leaf.resolved.b, leaf.seatSources.b),
    },
    history: scan.log
      .filter(({ record }) => record.slug === state.slug)
      .slice(-10)
      .map((record) => record.text),
  };
}

async function jsonRepo(
  global: GlobalConfig,
  scan: Scan,
  paused: Set<string>,
  stopped: Set<string>,
  now: number,
): Promise<JsonRepo> {
  if (!scan.ok) {
    return {
      name: scan.repo,
      root: scan.root,
      paused: paused.has(scan.repo),
      error: scan.error,
      unreadable: [{ path: scan.path, error: scan.error }],
      slow: null,
      unpacked: [],
      queue: [],
      kept: [],
      charts: [],
      parked: [],
      leaves: [],
    };
  }
  const store: string = worktreeStore(scan.repo);
  const started: Map<string, number> = starts(scan.timings);
  const slow: JsonRepo['slow'] =
    scan.slow?.slow?.first !== undefined && scan.slow.slow.close === undefined
      ? {
          leaf: scan.slow.slow.first.leaf,
          run: scan.slow.slow.first.run,
          ms: scan.slow.slow.ms,
          normal_ms: scan.slow.slow.normal_ms,
        }
      : null;
  return {
    name: scan.repo.name,
    root: scan.repo.root,
    paused: paused.has(scan.repo.name),
    error: null,
    unreadable: scan.failures,
    slow,
    unpacked: unpackedEntries(scan.repo.root),
    queue: scan.queue.map((entry) => ({
      slug: entry.leaf.state.slug,
      place: entry.place,
      no_record: entry.noRecord,
    })),
    kept: readKept(scan.repo).map((entry: KeptEntry) => ({ path: entry.path, reason: entry.reason })),
    charts: chartRows(scan.repo.root, now),
    parked: scan.parked,
    leaves: await Promise.all(
      scan.leaves.map((leaf) => leafJson(global, scan, leaf, started, stopped, resolve(store, leaf.state.slug))),
    ),
  };
}

export async function statusCommand(
  slug: string | undefined,
  charts: boolean = false,
  json: boolean = false,
): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const paused: Set<string> = readPaused();
  const stopped: Set<string> = readStopped();
  if (slug !== undefined) {
    const repo: Repo = await requireRepo(global, process.cwd());
    const inventory: Inventory = repoInventory(repo);
    const invalidRoot: LeafFailure | undefined = inventory.unreadable.find((failure) =>
      ['open', 'closed'].some((area) => failure.path === resolve(repo.root, 'issues', area)),
    );
    if (invalidRoot !== undefined) throw new Error(invalidRoot.error);
    const leaf: Leaf = findLeaf(repo, slug);
    const flagged: LeafFailure | undefined = inventory.unreadable.find((failure) => failure.path === leaf.path);
    if (flagged !== undefined) throw new Error(flagged.error);
    const log: LogRecord[] = readLog(repo.root)
      .filter(({ record }) => record.slug === slug)
      .slice(-10);
    const missing: Gap[] = leafGaps(global, leaf);
    console.log(Bun.YAML.stringify(leaf.state, null, 2).trimEnd());
    if (paused.has(repo.name)) console.log(`paused: ${repo.name}`);
    if (stopped.has(`${repo.name}/${slug}`)) console.log(`stopped: ${repo.name}/${slug}`);
    const attempt: string | undefined = landAttempt(leaf.state);
    if (attempt !== undefined)
      console.log(`land ${(await landAlive(attempt)) ? 'alive' : 'dead'}: ${landUnit(attempt)}`);
    if (broadcastPending(leaf.state)) console.log(`broadcast pending: ${repo.name}/${slug}`);
    for (const entry of readKept(repo)) console.log(`Kept: ${entry.path} — ${entry.reason}`);
    for (const entry of readHostKept()) console.log(`Kept: ${entry.path} — ${entry.reason}`);
    for (const gap of missing)
      console.log(`Missing: ${repo.name}/${slug} ${gap.kind} ${gap.name} in ${gap.holder}: ${gap.steps}`);
    console.log('History:');
    console.log(log.length === 0 ? 'unavailable' : log.map((entry) => entry.text).join('\n'));
    console.log(resolve(leaf.path, 'plan.md'));
    const resolved: { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } } = seats(global, repo, leaf.path);
    console.log('Seats for the next agent start:');
    console.log(
      Bun.YAML.stringify(
        { a: { ...resolved.a, source: resolved.source.a }, b: { ...resolved.b, source: resolved.source.b } },
        null,
        2,
      ).trimEnd(),
    );
    return;
  }
  const now: number = Date.now();
  const current: Repo | null = json ? null : await currentRepo(global, process.cwd());
  const scans: Scan[] = Object.entries(global.repos)
    .filter(([name]) => current === null || name === current.name)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, path]) => scanRepo(name, path, global));
  if (json) {
    const home: string = globalHome();
    const deploy: ReturnType<typeof readDeployRecord> = readDeployRecord();
    const repos: JsonRepo[] = await Promise.all(scans.map((scan) => jsonRepo(global, scan, paused, stopped, now)));
    const merges: JsonEnvelope['merges'] = scans
      .filter((scan): scan is Scan & { ok: true } => scan.ok)
      .flatMap((scan) => {
        const started: Map<string, number> = starts(scan.timings);
        return [...scan.leaves, ...scan.closed]
          .filter((leaf) => leaf.state.phase === 'merged')
          .map((leaf) => {
            const record: LogRecord | undefined = scan.log.findLast(
              ({ record }) => record.slug === leaf.state.slug && record.to === 'merged',
            );
            const merged: number | null = record === undefined ? null : Date.parse(record.record.ts);
            const first: number | undefined = started.get(leaf.state.slug);
            return {
              repo: scan.repo.name,
              slug: leaf.state.slug,
              merged,
              total_ms: merged === null || first === undefined ? null : merged - first,
            };
          });
      })
      .sort((a, b) => (b.merged ?? 0) - (a.merged ?? 0))
      .slice(0, 5);
    const runs: RunRecord[] = lineRuns();
    const run: string | null = runs.some((record) => record.state === 'waiting')
      ? [
          'run line (one per repo)',
          ...render(lineHeader, [['  REPO', ...lineHeader.slice(1)], ...lineRows(runs, now)]),
        ].join('\n')
      : null;
    const leafReds: number = repos.reduce((sum, repo) => sum + repo.leaves.filter((leaf) => leaf.red).length, 0);
    const unreadables: number = repos.reduce((sum, repo) => sum + repo.unreadable.length, 0);
    const envelope: JsonEnvelope = {
      schema: 1,
      generated: now,
      red: leafReds + unreadables + (deploy !== null && !deploy.ok ? 1 : 0),
      watch: {
        folders: [
          ...Object.keys(global.repos)
            .sort((a, b) => a.localeCompare(b))
            .map((name) => resolve(expandPath(global.repos[name], home), 'issues')),
          resolve(home, 'runs'),
        ],
        files: [
          resolve(home, 'config.yaml'),
          resolve(home, 'paused.yaml'),
          resolve(home, 'stopped.yaml'),
          resolve(home, 'reconcile-host.json'),
          deployRecordPath(),
          currentLink(),
        ],
      },
      deploy:
        deploy === null
          ? null
          : {
              failed: !deploy.ok,
              attempted: deploy.attempted ?? null,
              active: currentReleaseCommit(),
              step: deploy.step ?? null,
              error: deploy.error ?? null,
            },
      run,
      kept: readHostKept().map((entry: KeptEntry) => ({ path: entry.path, reason: entry.reason })),
      merges,
      repos,
    };
    console.log(JSON.stringify(envelope));
    if (scans.some((scan) => !scan.ok || scan.failures.length > 0)) process.exitCode = 1;
    return;
  }
  for (const scan of scans) {
    if (!scan.ok) console.log(JSON.stringify({ unreadable: scan.repo, path: scan.path, error: scan.error }));
    else
      for (const failure of scan.failures)
        console.log(JSON.stringify({ unreadable: scan.repo.name, path: failure.path, error: failure.error }));
  }
  const deploy: ReturnType<typeof readDeployRecord> = readDeployRecord();
  const active: string | null = currentReleaseCommit();
  if (deploy !== null && !deploy.ok && deploy.attempted !== undefined)
    console.log(
      `deploy failed: attempted ${deploy.attempted.slice(0, 12)}, active ${active?.slice(0, 12) ?? 'none'}, step ${deploy.step ?? 'unknown'}: ${(deploy.error ?? '').replaceAll('\n', ' ').slice(0, 120)}`,
    );
  for (const scan of scans) {
    if (scan.ok) {
      for (const leaf of scan.leaves.filter((leaf) => leaf.state.phase === 'failed'))
        console.log(`Failed: ${scan.repo.name}/${leaf.state.slug}`);
    }
  }
  for (const scan of scans) {
    if (scan.ok) {
      for (const leaf of scan.leaves.filter((leaf) => leaf.state.phase !== 'merged')) {
        for (const gap of leaf.missing)
          console.log(
            `Missing: ${scan.repo.name}/${leaf.state.slug} ${gap.kind} ${gap.name} in ${gap.holder}: ${gap.steps}`,
          );
      }
    }
  }
  for (const scan of scans) {
    if (scan.ok)
      for (const entry of unpackedEntries(scan.repo.root)) console.log(`Unpacked: ${entry.path}: run ${entry.command}`);
    if (scan.ok && scan.slow?.slow?.first !== undefined && scan.slow.slow.close === undefined)
      console.log(
        'Slow merge: ' +
          scan.repo.name +
          ' first seen at ' +
          scan.slow.slow.first.leaf +
          ' ' +
          scan.slow.slow.first.run +
          ', last ' +
          Math.round(scan.slow.slow.ms / 60000) +
          'm vs normal ' +
          Math.round(scan.slow.slow.normal_ms / 60000) +
          'm',
      );
  }
  for (const scan of scans) {
    if (!scan.ok) continue;
    const marks: string[] = [paused.has(scan.repo.name) ? 'paused' : ''].filter((mark) => mark !== '');
    console.log(paint('1;4', `${scan.repo.name}${marks.length > 0 ? ` (${marks.join(') (')})` : ''}`));
    if (charts) {
      const lines: string[][] = chartRows(scan.repo.root, now);
      if (lines.length > 0)
        console.log(render(chartHeader, [['  CHART', ...chartHeader.slice(1)], ...lines]).join('\n'));
      else console.log('  no charts');
      continue;
    }
    const parked: string[][] = scan.parked.map((name) => [`${indent(0)}${name}`, 'parked', '', '', '', '']);
    const separator: string[][] = scan.leaves.length > 0 && parked.length > 0 ? [['', '', '', '', '', '']] : [];
    const lines: string[][] = [...rows(scan, now, stopped), ...separator, ...parked];
    if (lines.length > 0) console.log(render(header, [['  LEAF', ...header.slice(1)], ...lines]).join('\n'));
    else if (scan.failures.length === 0) console.log('  no open leaves');
  }
  const runs: RunRecord[] = lineRuns();
  if (runs.some((run) => run.state === 'waiting')) {
    console.log(paint('1;4', 'run line (one per repo)'));
    console.log(render(lineHeader, [['  REPO', ...lineHeader.slice(1)], ...lineRows(runs, now)]).join('\n'));
  }
  if (scans.some((scan) => !scan.ok || scan.failures.length > 0)) process.exitCode = 1;
}
