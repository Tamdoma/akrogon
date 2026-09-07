import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FixerSeedItem, OpenWorkItem } from './model.ts';
import { fixerSeedKey, issueKey, seedKey } from './model.ts';

// Lifecycle bookkeeping paths are not implementation surface: two seeds that both mention another
// issue's run-status overlap in conversation, not in code.
const EXCLUDED_PATH_PREFIXES = ['issues/open/', 'issues/run/', 'issues/continuity/', 'issues/worktrees/'];

const PATH_TOKEN_PATTERN = /(?:[A-Za-z0-9_.-]+[/\\])+[A-Za-z0-9_.-]+/g;
const FIXER_SEED_PATTERN = /^(urgent|normal)--(\d{8}T\d{9}Z)--.+--([a-z0-9]+(?:-[a-z0-9]+){0,2})\.md$/u;

export function extractPathTokens(text: string): readonly string[] {
  const withoutUrls = text.replace(/\bhttps?:\/\/\S+/g, ' ');
  const tokens = new Set<string>();
  for (const match of withoutUrls.matchAll(PATH_TOKEN_PATTERN)) {
    const normalized = match[0].replaceAll('\\', '/').replace(/[.,;:]+$/, '');
    if (isSurfacePath(normalized)) tokens.add(normalized);
  }
  return [...tokens].sort((left, right) => left.localeCompare(right));
}

function isSurfacePath(candidate: string): boolean {
  if (!candidate.includes('/')) return false;
  if (!/\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\.[A-Za-z0-9]+$/.test(candidate)) return false;
  return !EXCLUDED_PATH_PREFIXES.some((prefix) => candidate.startsWith(prefix));
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

// Parked means the lane is not moving on its own: an unresolved blocked opening, or a next step
// that waits on resolution or an operator park.
export function parkedReasonFromRunStatus(runStatusText: string): string | undefined {
  const status = asRecord(Bun.YAML.parse(runStatusText));
  if (status === undefined) return undefined;
  const nextStep = typeof status.next_step === 'string' ? status.next_step : '';
  if (nextStep === 'block.resolve' || nextStep.startsWith('park.')) return `next_step ${nextStep}`;
  const events = blockedEvents(status);
  const opened = events.filter((event) => event.event === 'opened').length;
  const resolved = events.filter((event) => event.event === 'resolved').length;
  return opened > resolved ? `${opened - resolved} unresolved blocked opening(s)` : undefined;
}

function blockedEvents(status: Record<string, unknown>): readonly Record<string, unknown>[] {
  const records = asRecord(status.records);
  const blocked = asRecord(records?.blocked);
  const events = blocked?.events;
  if (!Array.isArray(events)) return [];
  return events.flatMap((event) => {
    const record = asRecord(event);
    return record === undefined ? [] : [record];
  });
}

export function footprintPaths(repoRoot: string, slug: string): readonly string[] | undefined {
  const footprintFile = path.join(
    repoRoot,
    'issues',
    'run',
    'implementation-footprint',
    encodeURIComponent(issueKey(slug)),
    'footprint.json'
  );
  if (!fs.existsSync(footprintFile)) return undefined;
  const parsed = asRecord(JSON.parse(fs.readFileSync(footprintFile, 'utf8')));
  const paths = parsed?.paths;
  if (!Array.isArray(paths)) return undefined;
  const surfaces = paths.filter((entry): entry is string => typeof entry === 'string');
  return surfaces.length === 0 ? undefined : [...surfaces].sort((left, right) => left.localeCompare(right));
}

function readIfPresent(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

// A seed consumed by an import that renamed it (state.yaml seed_path) is spoken-for intake, not
// open work, even though no sibling folder shares its basename.
function consumedSeedBasenames(openRoot: string): ReadonlySet<string> {
  const consumed = new Set<string>();
  for (const entry of fs.readdirSync(openRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const stateFile = path.join(openRoot, entry.name, 'state.yaml');
    if (!fs.existsSync(stateFile)) continue;
    const state = asRecord(Bun.YAML.parse(fs.readFileSync(stateFile, 'utf8')));
    const seedPath = state?.seed_path;
    if (typeof seedPath === 'string' && seedPath.endsWith('.md')) {
      consumed.add(path.posix.basename(seedPath.replaceAll('\\', '/'), '.md'));
    }
  }
  return consumed;
}

function seedItems(openRoot: string): readonly OpenWorkItem[] {
  const consumed = consumedSeedBasenames(openRoot);
  return fs
    .readdirSync(openRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.slice(0, -3))
    .filter((slug) => !fs.existsSync(path.join(openRoot, slug)) && !consumed.has(slug))
    .sort((left, right) => left.localeCompare(right))
    .map((slug) => ({
      key: seedKey(slug),
      kind: 'seed' as const,
      slug,
      paths: extractPathTokens(fs.readFileSync(path.join(openRoot, `${slug}.md`), 'utf8')),
      pathSource: 'text' as const
    }));
}

function parkedIssueItem(repoRoot: string, openRoot: string, slug: string): OpenWorkItem | undefined {
  const runStatusFile = path.join(openRoot, slug, 'run-status.yaml');
  if (!fs.existsSync(runStatusFile)) return undefined;
  const parkedReason = parkedReasonFromRunStatus(fs.readFileSync(runStatusFile, 'utf8'));
  if (parkedReason === undefined) return undefined;
  const recorded = footprintPaths(repoRoot, slug);
  const planText = [
    readIfPresent(path.join(openRoot, slug, 'planning', 'plan.md')),
    readIfPresent(path.join(openRoot, slug, 'implementation', 'plan.md')),
    readIfPresent(path.join(openRoot, `${slug}.md`))
  ].join('\n');
  return {
    key: issueKey(slug),
    kind: 'parked-issue',
    slug,
    paths: recorded ?? extractPathTokens(planText),
    pathSource: recorded === undefined ? 'text' : 'footprint',
    parkedReason
  };
}

export function gatherOpenWork(repoRoot: string): readonly OpenWorkItem[] {
  const openRoot = path.join(repoRoot, 'issues', 'open');
  if (!fs.existsSync(openRoot)) return [];
  const parked = fs
    .readdirSync(openRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const item = parkedIssueItem(repoRoot, openRoot, entry.name);
      return item === undefined ? [] : [item];
    });
  return [...seedItems(openRoot), ...parked];
}

function compareFixerSeeds(left: FixerSeedItem, right: FixerSeedItem): number {
  if (left.priority !== right.priority) return left.priority === 'urgent' ? -1 : 1;
  const arrivalOrder: number = left.arrival.localeCompare(right.arrival);
  return arrivalOrder === 0 ? left.sourceFile.localeCompare(right.sourceFile) : arrivalOrder;
}

export function gatherFixerSeeds(repoRoot: string, excludedFiles: ReadonlySet<string>): readonly FixerSeedItem[] {
  const fixerRoot: string = path.join(repoRoot, 'issues', 'open', 'fixer');
  if (!fs.existsSync(fixerRoot)) return [];
  return fs
    .readdirSync(fixerRoot, { withFileTypes: true })
    .filter((entry: fs.Dirent): boolean => entry.isFile() && !excludedFiles.has(entry.name))
    .flatMap((entry: fs.Dirent): readonly FixerSeedItem[] => {
      const match: RegExpExecArray | null = FIXER_SEED_PATTERN.exec(entry.name);
      if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) return [];
      const priority: 'normal' | 'urgent' = match[1] === 'urgent' ? 'urgent' : 'normal';
      return [
        {
          key: fixerSeedKey(entry.name),
          kind: 'fixer-seed',
          slug: match[3],
          paths: extractPathTokens(fs.readFileSync(path.join(fixerRoot, entry.name), 'utf8')),
          pathSource: 'text',
          priority,
          arrival: match[2],
          sourceFile: entry.name
        }
      ];
    })
    .sort(compareFixerSeeds);
}
