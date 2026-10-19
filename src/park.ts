import { existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { globalHome, readGlobal, requireRepo, within, type GlobalConfig, type Repo } from './config';
import { readInventory, repoInventory, withLock, type Inventory, type Leaf, type LeafFailure } from './state';
import { appendTiming } from './timing';

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

function failures(repo: Repo, owner: string, inv: Inventory): LeafFailure[] {
  return [
    ...inv.unreadable,
    ...inv.unknown,
    ...inv.foreign.map((foreign) => ({
      path: foreign.path,
      error: `stored key "${foreign.stored}", registered key "${repo.name}"`,
    })),
  ].filter((failure) => within(failure.path, owner));
}

function refusal(repo: Repo, owner: string, inv: Inventory): Error {
  const failure: LeafFailure = failures(repo, owner, inv)[0];
  return new Error(`Invalid state ${resolve(failure.path, 'state.yaml')}: ${failure.error}`);
}

function running(root: string, issue: string): boolean {
  return readInventory(resolve(root, 'issues/open', issue), resolve(root, 'issues/open')).leaves.some(
    (leaf: Leaf) => leaf.state.tab !== undefined || leaf.state.worktree !== undefined,
  );
}

/** Leaves that would sit under issues/open after the move, plus the closed ones next also resolves against. */
function stranded(root: string, verb: ParkVerb, moving: string[]): string[] {
  const { from }: { from: string } = areas[verb];
  const openRoot: string = resolve(root, 'issues/open');
  const closedRoot: string = resolve(root, 'issues/closed');
  const staying: Inventory[] = issueFolders(root, 'issues/open')
    .filter((issue) => verb === 'unpark' || !moving.includes(issue))
    .map((issue) => readInventory(resolve(openRoot, issue), openRoot));
  const arriving: Inventory[] =
    verb === 'unpark' ? moving.map((issue) => readInventory(resolve(root, from, issue), resolve(root, from))) : [];
  const closed: Inventory = readInventory(closedRoot, closedRoot);
  const open: Leaf[] = [...staying, ...arriving].flatMap((inv) => inv.leaves);
  const known: Set<string> = new Set([...open, ...closed.leaves].map((leaf) => leaf.state.slug));
  // A bad leaf's folder basename is the only name it still answers to: a
  // dependency on it stays unmet but is not reported dangling.
  for (const inv of [...staying, ...arriving, closed])
    for (const failure of inv.unreadable) known.add(basename(failure.path));
  return open.flatMap((leaf) => leaf.state['blocked-by'].filter((dependency) => !known.has(dependency)));
}

export async function parkCommand(verb: ParkVerb, names: string[], all: boolean, cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  const { from, to }: { from: string; to: string } = areas[verb];
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const inv: Inventory = repoInventory(repo, ['open', 'closed', 'parked']);
    const present: string[] = issueFolders(repo.root, from);
    for (const name of names) if (!present.includes(name)) throw new Error(`No issue ${name} under ${from}`);
    const bad: string[] = present.filter((name) => failures(repo, resolve(repo.root, from, name), inv).length > 0);
    if (!all)
      for (const name of names) if (bad.includes(name)) throw refusal(repo, resolve(repo.root, from, name), inv);
    const busy: string[] =
      verb === 'park' ? present.filter((name) => !bad.includes(name) && running(repo.root, name)) : [];
    const candidates: string[] = all
      ? present.filter((name) => !busy.includes(name) && !bad.includes(name))
      : [...new Set(names)];
    for (const name of candidates) if (busy.includes(name)) throw new Error(`Issue has a running leaf: ${name}`);
    const moving: string[] = all && verb === 'park' ? settle(repo.root, candidates) : candidates;
    const dangling: string[] = stranded(repo.root, verb, moving);
    if (dangling.length > 0) throw new Error(`Open leaves would depend on unavailable leaves: ${dangling.join(', ')}`);
    mkdirSync(resolve(repo.root, to), { recursive: true });
    for (const name of moving) {
      if (existsSync(resolve(repo.root, to, name))) throw new Error(`Issue ${name} already exists under ${to}`);
    }
    for (const name of busy) console.log(`running  ${name}`);
    for (const name of all ? bad : []) console.log(`unreadable ${name}`);
    for (const name of candidates.filter((name) => !moving.includes(name))) console.log(`needed   ${name}`);
    for (const name of moving) {
      renameSync(resolve(repo.root, from, name), resolve(repo.root, to, name));
      console.log(`${verb === 'park' ? 'parked  ' : 'unparked'} ${name}`);
    }
    for (const name of moving)
      for (const leaf of readInventory(resolve(repo.root, to, name), resolve(repo.root, to)).leaves)
        appendTiming(repo, { kind: 'wait', slug: leaf.state.slug, reason: verb === 'park' ? 'parked' : 'none' });
  });
}

/** Drops candidates that a staying open leaf still depends on, until nothing is stranded. */
function settle(root: string, candidates: string[]): string[] {
  let moving: string[] = candidates;
  for (;;) {
    const dangling: string[] = stranded(root, 'park', moving);
    if (dangling.length === 0) return moving;
    const owners: string[] = moving.filter((issue) =>
      readInventory(resolve(root, 'issues/open', issue), resolve(root, 'issues/open')).leaves.some((leaf) =>
        dangling.includes(leaf.state.slug),
      ),
    );
    if (owners.length === 0) return moving;
    moving = moving.filter((issue) => !owners.includes(issue));
  }
}
