import { existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { globalHome, readGlobal, requireRepo, type GlobalConfig, type Repo } from './config';
import { leavesUnder, withLock, type Leaf } from './state';

export type ParkVerb = 'park' | 'unpark';

const areas: Record<ParkVerb, { from: string; to: string }> = {
  park: { from: 'issues/open', to: 'issues/parked' },
  unpark: { from: 'issues/parked', to: 'issues/open' },
};

export function issueFolders(root: string, area: string): string[] {
  const path: string = resolve(root, area);
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function running(root: string, issue: string): boolean {
  return leavesUnder(resolve(root, 'issues/open', issue), resolve(root, 'issues/open')).some(
    (leaf: Leaf) => leaf.state.tab !== undefined || leaf.state.worktree !== undefined,
  );
}

/** Leaves that would sit under issues/open after the move, plus the closed ones next also resolves against. */
function stranded(root: string, verb: ParkVerb, moving: string[]): string[] {
  const { from }: { from: string } = areas[verb];
  const open: Leaf[] = [
    ...issueFolders(root, 'issues/open')
      .filter((issue) => verb === 'unpark' || !moving.includes(issue))
      .flatMap((issue) => leavesUnder(resolve(root, 'issues/open', issue), resolve(root, 'issues/open'))),
    ...(verb === 'unpark'
      ? moving.flatMap((issue) => leavesUnder(resolve(root, from, issue), resolve(root, from)))
      : []),
  ];
  const known: Set<string> = new Set(
    [...open, ...leavesUnder(resolve(root, 'issues/closed'), resolve(root, 'issues/closed'))].map(
      (leaf) => leaf.state.slug,
    ),
  );
  return open.flatMap((leaf) => leaf.state['blocked-by'].filter((dependency) => !known.has(dependency)));
}

export async function parkCommand(verb: ParkVerb, names: string[], all: boolean, cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  const { from, to }: { from: string; to: string } = areas[verb];
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const present: string[] = issueFolders(repo.root, from);
    for (const name of names) if (!present.includes(name)) throw new Error(`No issue ${name} under ${from}`);
    const busy: string[] = verb === 'park' ? present.filter((name) => running(repo.root, name)) : [];
    const candidates: string[] = all ? present.filter((name) => !busy.includes(name)) : [...new Set(names)];
    for (const name of candidates) if (busy.includes(name)) throw new Error(`Issue has a running leaf: ${name}`);
    const moving: string[] = all && verb === 'park' ? settle(repo.root, candidates) : candidates;
    const dangling: string[] = stranded(repo.root, verb, moving);
    if (dangling.length > 0) throw new Error(`Open leaves would depend on unavailable leaves: ${dangling.join(', ')}`);
    mkdirSync(resolve(repo.root, to), { recursive: true });
    for (const name of moving) {
      if (existsSync(resolve(repo.root, to, name))) throw new Error(`Issue ${name} already exists under ${to}`);
    }
    for (const name of busy) console.log(`running  ${name}`);
    for (const name of candidates.filter((name) => !moving.includes(name))) console.log(`needed   ${name}`);
    for (const name of moving) {
      renameSync(resolve(repo.root, from, name), resolve(repo.root, to, name));
      console.log(`${verb === 'park' ? 'parked  ' : 'unparked'} ${name}`);
    }
  });
}

/** Drops candidates that a staying open leaf still depends on, until nothing is stranded. */
function settle(root: string, candidates: string[]): string[] {
  let moving: string[] = candidates;
  for (;;) {
    const dangling: string[] = stranded(root, 'park', moving);
    if (dangling.length === 0) return moving;
    const owners: string[] = moving.filter((issue) =>
      leavesUnder(resolve(root, 'issues/open', issue), resolve(root, 'issues/open')).some((leaf) =>
        dangling.includes(leaf.state.slug),
      ),
    );
    if (owners.length === 0) return moving;
    moving = moving.filter((issue) => !owners.includes(issue));
  }
}
