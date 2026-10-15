import { lstatSync } from 'node:fs';
import { homedir } from 'node:os';
import { sep } from 'node:path';
import { currentRepo, readGlobal, readRepo, type GlobalConfig, type Repo } from './config';
import { readHostKept, readKept } from './reconcile';

type Kept = { path: string; reason: string };

// Kept only while work or a live pane is still there: the next cleanup after it ends removes the path.
// A failed batch holder keeps its batch until `akrogon phase <slug> merge`; the board and a notification already name that leaf.
const inUse: Set<string> = new Set([
  'active leaf',
  'active leaf worker',
  'live pane inside',
  'run in progress',
  'state.batch',
]);

// Host keeps mix units and retired filesystem paths; these clear once the run, tab or pass ends.
const unitInUse: Set<string> = new Set(['own slice', 'live run record', 'live tab']);

function leftover(entry: Kept): boolean {
  return (
    lstatSync(entry.path, { throwIfNoEntry: false }) !== undefined &&
    !inUse.has(entry.reason) &&
    !/^verify \S+ in progress$/.test(entry.reason)
  );
}

// Units carry no '/', so only retired-path entries hit the same existence check as leftover().
function hostLeftover(entry: Kept): boolean {
  return (
    !unitInUse.has(entry.reason) &&
    (!entry.path.includes('/') || lstatSync(entry.path, { throwIfNoEntry: false }) !== undefined)
  );
}

function tilde(path: string): string {
  return path.startsWith(`${homedir()}${sep}`) ? `~${path.slice(homedir().length)}` : path;
}

function lines(name: string, kept: Kept[]): string[] {
  const reasons: string[] = [...new Set(kept.map((entry) => entry.reason))].sort((a, b) => a.localeCompare(b));
  return [
    name,
    ...reasons.flatMap((reason) => [
      `  ${reason}`,
      ...kept.filter((entry) => entry.reason === reason).map((entry) => `    ${tilde(entry.path)}`),
    ]),
  ];
}

export async function leftoversCommand(cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const current: Repo | null = await currentRepo(global, cwd);
  const repos: Repo[] =
    current !== null
      ? [current]
      : Object.entries(global.repos)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, path]) => readRepo(name, path));
  const blocks: [string, Kept[]][] = [
    ...repos.map((repo): [string, Kept[]] => [repo.name, readKept(repo).filter(leftover)]),
    ['host', readHostKept().filter(hostLeftover)],
  ];
  const found: string[][] = blocks.filter(([, kept]) => kept.length > 0).map(([name, kept]) => lines(name, kept));
  console.log(found.length === 0 ? 'no leftovers' : found.map((block) => block.join('\n')).join('\n\n'));
}
