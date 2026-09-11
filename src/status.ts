import { existsSync, readdirSync, readFileSync, type Dirent } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { expandPath, globalHome, readGlobal, readRepo, requireRepo, type GlobalConfig, type Repo } from './config';
import { findLeaf, readState, stateSchema, type Leaf, type State } from './state';
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
        const state: State = readState(folder);
        z.literal(repo.name).parse(state.repo);
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

function note(state: State): string {
  const attempts: string[] =
    state.attempts.A + state.attempts.B > 0 ? [`attempts A:${state.attempts.A} B:${state.attempts.B}`] : [];
  const fixes: string[] = state.fix_rounds > 0 ? [`fix rounds ${state.fix_rounds}`] : [];
  const verdicts: string[] = Object.entries(state.verdict).map(([slot, value]) => `${slot}:${value}`);
  const verdict: string[] = verdicts.length > 0 ? [`verdict ${verdicts.join(' ')}`] : [];
  const done: string[] = state.done.length > 0 ? [`done ${state.done.join(' ')}`] : [];
  const tab: string[] = state.tab === undefined ? [] : [`tab ${state.tab}`];
  return [...done, ...attempts, ...fixes, ...verdict, ...tab].join(' · ');
}

function cells(leaf: Leaf, log: LogRecord[], now: number, indent: string): string[] {
  const state: State = leaf.state;
  const last: LogRecord | undefined = log.findLast(
    ({ record }) => record.slug === state.slug && record.to === state.phase,
  );
  const elapsed: number | undefined = last === undefined ? undefined : now - Date.parse(last.record.ts);
  const age: string = elapsed === undefined || elapsed < 0 ? '-' : `${Math.floor(elapsed / 60000)}m`;
  return [`${indent}${state.slug}`, state.phase, age, state['blocked-by'].join(' '), note(state)];
}

function rows(scan: Scan & { ok: true }, now: number): string[][] {
  let previous: string[] = [];
  return scan.leaves.flatMap((leaf) => {
    const groups: string[] = relative(resolve(scan.repo.root, 'issues/open'), leaf.path).split(sep).slice(0, -1);
    let shared: number = 0;
    while (shared < groups.length && shared < previous.length && groups[shared] === previous[shared]) shared++;
    previous = groups;
    return [
      ...groups.slice(shared).map((group, offset) => [`${'  '.repeat(shared + offset + 1)}${group}`, '', '', '', '']),
      cells(leaf, scan.log, now, '  '.repeat(groups.length + 1)),
    ];
  });
}

function render(lines: string[][]): string[] {
  const widths: number[] = header.map((title, column) =>
    Math.max(title.length, ...lines.map((line) => line[column].length)),
  );
  return lines.map((line) =>
    header
      .map((_, column) => line[column].padEnd(widths[column]))
      .join('  ')
      .trimEnd(),
  );
}

export async function statusCommand(slug: string | undefined): Promise<void> {
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
  const scans: Scan[] = Object.entries(global.repos)
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
    console.log(scan.repo.name);
    if (scan.leaves.length > 0) console.log(render([['  LEAF', ...header.slice(1)], ...rows(scan, now)]).join('\n'));
    if (scan.parked.length > 0) console.log(`  parked  ${scan.parked.join(', ')}`);
  }
  if (scans.some((scan) => !scan.ok)) process.exitCode = 1;
}
