import { existsSync, readdirSync, readFileSync, statSync, type Dirent } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
  currentRepo,
  expandPath,
  globalHome,
  readGlobal,
  readRepo,
  requireRepo,
  type GlobalConfig,
  type Repo,
} from './config';
import { findLeaf, readState, stateSchema, RepoMismatchError, validateLeafDepth, type Leaf, type State } from './state';
import { phaseSchema, slotSchema, verdictSchema } from './routing';
import { issueFolders } from './park';

const logSchema = z.object({
  ts: z.iso.datetime(),
  repo: z.string(),
  slug: z.string(),
  from: phaseSchema,
  to: phaseSchema,
  slot: slotSchema.nullable(),
  attempts: z.object({ A: z.number().int().nonnegative(), B: z.number().int().nonnegative() }),
  fix_rounds: z.number().int().nonnegative(),
  verdict: z.object({ A: verdictSchema.optional(), B: verdictSchema.optional() }),
  head: z.string(),
  diff: z.string(),
  session: z.string().nullable(),
});
type LogRecord = { record: z.infer<typeof logSchema>; text: string };
type Scan =
  | { ok: true; repo: Repo; leaves: Leaf[]; parked: string[]; log: LogRecord[] }
  | { ok: false; repo: string; path: string; error: string };

function readLog(root: string): LogRecord[] {
  const issues: string = resolve(root, 'issues');
  if (!readdirSync(issues).includes('log.jsonl')) return [];
  const content: string = readFileSync(resolve(issues, 'log.jsonl'), 'utf8').replace(/(?:\r?\n)+$/, '');
  return content === '' ? [] : content.split('\n').map((text) => ({ record: logSchema.parse(JSON.parse(text)), text }));
}

function scanRepo(name: string, registeredPath: string): Scan {
  let path: string = expandPath(registeredPath, globalHome());
  try {
    readdirSync(path);
    path = resolve(path, 'issues/config.yaml');
    const repo: Repo = readRepo(name, registeredPath);
    const slugs: Set<string> = new Set();
    function walk(folder: string): Leaf[] {
      path = folder;
      const entries: Dirent[] = readdirSync(folder, { withFileTypes: true });
      if (entries.some((entry) => entry.name === 'state.yaml')) {
        path = resolve(folder, 'state.yaml');
        validateLeafDepth(open, folder);
        const state: State = readState(folder);
        if (state.repo !== repo.name) throw new RepoMismatchError(folder, state.repo, repo.name);
        stateSchema.shape.slug.refine((slug) => !slugs.has(slug), 'Duplicate leaf slug').parse(state.slug);
        slugs.add(state.slug);
        return [{ path: folder, state }];
      }
      return entries
        .filter((entry) => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap((entry) => walk(resolve(folder, entry.name)));
    }
    const open: string = resolve(repo.root, 'issues/open');
    const leaves: Leaf[] = existsSync(open) ? walk(open) : [];
    path = resolve(repo.root, 'issues/log.jsonl');
    return { ok: true, repo, leaves, parked: issueFolders(repo.root, 'issues/parked'), log: readLog(repo.root) };
  } catch (error) {
    if (
      error instanceof RepoMismatchError ||
      error instanceof z.ZodError ||
      error instanceof SyntaxError ||
      (error instanceof Error && 'code' in error && typeof error.code === 'string' && /^E[A-Z]+$/.test(error.code))
    ) {
      return { ok: false, repo: name, path, error: error.message };
    }
    throw error;
  }
}

const header: string[] = ['LEAF', 'PHASE', 'AGE', 'BLOCKED BY', 'NOTE'];

function note(state: State, now: number): string {
  const busy: string[] = (['A', 'B'] as const).flatMap((seat) => {
    const since: string | undefined = state.busy_since[seat];
    if (since === undefined) return [];
    const minutes: number = Math.max(0, Math.floor((now - Date.parse(since)) / 60000));
    return [`busy ${seat} ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`];
  });
  const attempts: string[] =
    state.attempts.A + state.attempts.B > 0 ? [`attempts A:${state.attempts.A} B:${state.attempts.B}`] : [];
  const fixes: string[] = state.fix_rounds > 0 ? [`fix rounds ${state.fix_rounds}`] : [];
  const verdicts: string[] = Object.entries(state.verdict).map(([slot, value]) => `${slot}:${value}`);
  const verdict: string[] = verdicts.length > 0 ? [`verdict ${verdicts.join(' ')}`] : [];
  const done: string[] = state.done.length > 0 ? [`done ${state.done.join(' ')}`] : [];
  const tab: string[] = state.tab === undefined ? [] : [`tab ${state.tab}`];
  return [...done, ...attempts, ...fixes, ...verdict, ...tab, ...busy].join(' · ');
}

function cells(leaf: Leaf, log: LogRecord[], now: number, indent: string): string[] {
  const state: State = leaf.state;
  const last: LogRecord | undefined = log.findLast(
    ({ record }) => record.slug === state.slug && record.to === state.phase,
  );
  const elapsed: number | undefined = last === undefined ? undefined : now - Date.parse(last.record.ts);
  const age: string = elapsed === undefined || elapsed < 0 ? '-' : `${Math.floor(elapsed / 60000)}m`;
  return [`${indent}${state.slug}`, state.phase, age, state['blocked-by'].join(' '), note(state, now)];
}

function rows(scan: Scan & { ok: true }, now: number): string[][] {
  let previous: string[] = [];
  return scan.leaves.flatMap((leaf) => {
    const groups: string[] = relative(resolve(scan.repo.root, 'issues/open'), leaf.path).split(sep).slice(0, -1);
    let shared: number = 0;
    while (shared < groups.length && shared < previous.length && groups[shared] === previous[shared]) shared++;
    previous = groups;
    return [
      ...groups.slice(shared).map((group, offset) => [`${indent(shared + offset)}${group}`, '', '', '', '']),
      cells(leaf, scan.log, now, indent(groups.length)),
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

const phaseColor: Record<string, string> = { plan: '34', implement: '33', check: '35', merge: '32', failed: '31' };

const stageColor: Record<string, string> = { 'handed off': '32', charting: '33', empty: '2' };

function style(title: string, text: string, kind: 'header' | 'group' | 'leaf'): string {
  if (kind === 'header') return paint('2', text);
  if (title === 'LEAF' || title === 'CHART') return kind === 'group' ? paint('1', text) : text;
  if (title === 'PHASE') return paint(phaseColor[text.split('.')[0]] ?? '', text);
  if (title === 'STAGE') return paint(stageColor[text] ?? '', text);
  if (title === 'BLOCKED BY') return paint('2', text);
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
  const budget: number = columns - natural[0] - natural[1] - natural[2] - 8;
  const half: number = Math.floor(budget / 2);
  if (natural[3] + natural[4] <= budget || half < 16) return natural;
  const blocked: number = natural[3] <= half ? natural[3] : Math.max(half, budget - natural[4]);
  return [natural[0], natural[1], natural[2], blocked, budget - blocked];
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
  const stage: string = /^Handed off\b/m.test(markdown) ? 'handed off' : files.length + fog > 0 ? 'charting' : 'empty';
  return [`  ${name}`, `${taken}/${files.length}`, String(fog), stage, since(now - statSync(chart).mtimeMs)];
}

function chartRows(root: string, now: number): string[][] {
  const store: string = resolve(root, 'issues/chart');
  if (!existsSync(store)) return [];
  const single: boolean = existsSync(resolve(store, 'CHART.md'));
  return single
    ? [chartRow(store, 'chart', now)]
    : readdirSync(store, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(resolve(store, entry.name, 'CHART.md')))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => chartRow(resolve(store, name), name, now));
}

export async function statusCommand(slug: string | undefined, charts: boolean = false): Promise<void> {
  const global: GlobalConfig = readGlobal();
  if (slug !== undefined) {
    const repo: Repo = await requireRepo(global, process.cwd());
    const leaf: Leaf = findLeaf(repo, slug);
    const log: LogRecord[] = readLog(repo.root)
      .filter(({ record }) => record.slug === slug)
      .slice(-10);
    console.log(Bun.YAML.stringify(leaf.state, null, 2).trimEnd());
    console.log('History:');
    console.log(log.length === 0 ? 'unavailable' : log.map((entry) => entry.text).join('\n'));
    console.log(resolve(leaf.path, 'plan.md'));
    return;
  }
  const now: number = Date.now();
  const current: Repo | null = await currentRepo(global, process.cwd());
  const scans: Scan[] = Object.entries(global.repos)
    .filter(([name]) => current === null || name === current.name)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, path]) => scanRepo(name, path));
  for (const scan of scans) {
    if (!scan.ok) console.log(JSON.stringify({ unreadable: scan.repo, path: scan.path, error: scan.error }));
  }
  for (const scan of scans) {
    if (scan.ok) {
      for (const leaf of scan.leaves.filter((leaf) => leaf.state.phase === 'failed'))
        console.log(`Failed: ${scan.repo.name}/${leaf.state.slug}`);
    }
  }
  for (const scan of scans) {
    if (!scan.ok) continue;
    console.log(paint('1;4', scan.repo.name));
    if (charts) {
      const lines: string[][] = chartRows(scan.repo.root, now);
      if (lines.length > 0)
        console.log(render(chartHeader, [['  CHART', ...chartHeader.slice(1)], ...lines]).join('\n'));
      else console.log('  no charts');
      continue;
    }
    if (scan.leaves.length > 0)
      console.log(render(header, [['  LEAF', ...header.slice(1)], ...rows(scan, now)]).join('\n'));
    else console.log('  no open leaves');
    if (scan.parked.length > 0) console.log(`  parked  ${scan.parked.join(', ')}`);
  }
  if (scans.some((scan) => !scan.ok)) process.exitCode = 1;
}
