import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, type Dirent } from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { phaseSchema, slotSchema, verdictSchema } from './routing';
import { type Repo } from './config';
import { writeYaml } from './shell';
import { issueFolders } from './park';

const counts = z.object({ A: z.number().int().nonnegative().default(0), B: z.number().int().nonnegative().default(0) });
const text = z.string().min(1);

export const failureSchema = z.strictObject({
  cause: z.enum(['blocked', 'attempts']),
  phase: phaseSchema,
  slot: slotSchema,
  reason: z.string().trim().min(1),
  delivery: z.string().optional(),
});

export type Failure = z.infer<typeof failureSchema>;

export const deliveryErrorSchema = z.strictObject({
  command: z.array(z.string()),
  code: z.string(),
  message: z.string(),
  pane: z.string(),
  session: z.string().nullable(),
  at: z.string(),
  offset: z.number().int().nonnegative().optional(),
});

export type DeliveryError = z.infer<typeof deliveryErrorSchema>;

export const sourcePattern = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/;

export const toolSchema = z.strictObject({ name: text, path: text, version: text });

export type Tool = z.infer<typeof toolSchema>;

export const batchSchema = z.strictObject({
  attempt: z.string().min(1),
  started: z.iso.datetime().optional(),
  pressure_start: z
    .strictObject({
      cpu: z.number().int().nonnegative(),
      memory: z.number().int().nonnegative(),
      io: z.number().int().nonnegative(),
      boot_id: z.string(),
    })
    .optional(),
  recorded: z.boolean().optional(),
  built_on: z.string(),
  holder: z.strictObject({ base: z.string(), head: z.string() }),
  tools: z.array(toolSchema).optional(),
  top: z.string().optional(),
  tested_top: z.string().optional(),
  tested_main: z.string().optional(),
  decision: z.enum(['reuse', 'rerun']).optional(),
  candidate: z.string().optional(),
  notified: z.boolean().optional(),
  applied: z.boolean(),
  // Absent means seat: records written before command-run merges are B's.
  owner: z.enum(['command', 'seat']).optional(),
  wake: z.enum(['red', 'gate', 'push']).optional(),
  red: z.string().optional(),
  refusal: z.string().optional(),
});

export type Batch = z.infer<typeof batchSchema>;

export const broadcastSchema = z.strictObject({
  kind: z.enum(['issue', 'epic']),
  name: text,
  destination: text,
  pushed: text,
  sources: z.array(z.string()),
});

export type Broadcast = z.infer<typeof broadcastSchema>;

export const stateSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    phase: phaseSchema,
    created: z.string(),
    repo: z.string(),
    debate: z.enum(['yes', 'no']),
    'blocked-by': z.array(z.string()),
    sources: z.array(z.string().regex(sourcePattern)).optional(),
    busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    busy_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    attempts: counts.prefault({}),
    done: z.array(slotSchema).default([]),
    fix_rounds: z.number().int().nonnegative().default(0),
    verdict: z.object({ A: verdictSchema.optional(), B: verdictSchema.optional() }).default({}),
    tab: z.string().min(1).optional(),
    worktree: z.string().min(1).optional(),
    env_names: z.array(z.string()).default([]),
    env_generation: z.number().int().nonnegative().default(0),
    pane: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted_at: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    delivery_error: z.object({ A: deliveryErrorSchema.optional(), B: deliveryErrorSchema.optional() }).default({}),
    failure: failureSchema.optional(),
    merge_stamp: z.string().optional(),
    batch: batchSchema.optional(),
    broadcast: broadcastSchema.optional(),
    frozen: z.record(z.string(), z.string().nullable()).optional(),
    frozen_cited: z.array(z.string()).optional(),
  })
  .refine((state) => new Set(state.done).size === state.done.length, 'Duplicate done slot');

export type State = z.infer<typeof stateSchema>;

// commitMove clears `prompted`, so on a merged leaf only the broadcast dispatch sets prompted.B.
export function broadcastPending(state: State): boolean {
  return state.phase === 'merged' && state.broadcast !== undefined && state.prompted.B === undefined;
}

export type Leaf = { path: string; state: State };

export class RepoMismatchError extends Error {
  constructor(path: string, stored: string, registered: string) {
    super(`Leaf repo mismatch at ${path}: stored key "${stored}", registered key "${registered}"`);
  }
}

export function readState(path: string): State {
  const file: string = resolve(path, 'state.yaml');
  let input: string;
  try {
    input = readFileSync(file, 'utf8');
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    throw new Error(`Cannot read state at ${file}: ${error.message}`, { cause: error });
  }
  let parsed: ReturnType<typeof Bun.YAML.parse>;
  try {
    parsed = Bun.YAML.parse(input);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    throw new Error(`Invalid state ${file}: ${error.message}`, { cause: error });
  }
  try {
    return stateSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new z.ZodRealError([{ code: 'custom', path: [], message: `Invalid state ${file}` }, ...error.issues]);
    throw error;
  }
}

export function saveState(path: string, state: State): void {
  writeYaml(resolve(path, 'state.yaml'), state);
}

export function validateLeafDepth(areaRoot: string, leafPath: string): void {
  const depth: number = relative(areaRoot, leafPath).split(sep).filter(Boolean).length;
  z.number()
    .refine((value) => value === 2 || value === 3, `Invalid leaf depth: ${resolve(leafPath, 'state.yaml')}`)
    .parse(depth);
}

export type LeafFailure = { path: string; error: string };
export type ForeignLeaf = { path: string; stored: string };
export type Inventory = {
  leaves: Leaf[];
  unreadable: LeafFailure[];
  unknown: LeafFailure[];
  foreign: ForeignLeaf[];
};

export function readInventory(path: string, areaRoot: string): Inventory {
  const inv: Inventory = { leaves: [], unreadable: [], unknown: [], foreign: [] };
  function visit(dir: string): void {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      inv.unknown.push({ path: dir, error: error.message });
      return;
    }
    if (entries.some((entry) => entry.name === 'state.yaml')) {
      try {
        validateLeafDepth(areaRoot, dir);
        inv.leaves.push({ path: dir, state: readState(dir) });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        inv.unreadable.push({ path: dir, error: error.message });
      }
      return;
    }
    for (const entry of entries.filter((entry) => entry.isDirectory())) visit(resolve(dir, entry.name));
  }
  try {
    if (statSync(path, { throwIfNoEntry: false }) !== undefined) visit(path);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    inv.unknown.push({ path, error: error.message });
  }
  return inv;
}

export function repoInventory(
  repo: Pick<Repo, 'name' | 'root'>,
  areas: readonly string[] = ['open', 'closed'],
): Inventory {
  const inv: Inventory = { leaves: [], unreadable: [], unknown: [], foreign: [] };
  for (const area of areas) {
    const areaRoot: string = resolve(repo.root, 'issues', area);
    const part: Inventory = readInventory(areaRoot, areaRoot);
    inv.unreadable.push(...part.unreadable);
    inv.unknown.push(...part.unknown);
    for (const leaf of part.leaves)
      if (leaf.state.repo === repo.name) inv.leaves.push(leaf);
      else inv.foreign.push({ path: leaf.path, stored: leaf.state.repo });
  }
  const slugs: Set<string> = new Set();
  const duplicates: Set<string> = new Set();
  for (const leaf of inv.leaves) {
    if (slugs.has(leaf.state.slug)) duplicates.add(leaf.state.slug);
    slugs.add(leaf.state.slug);
  }
  for (const leaf of inv.leaves.filter((leaf) => duplicates.has(leaf.state.slug)))
    inv.unreadable.push({ path: leaf.path, error: `Duplicate leaf slug: ${leaf.state.slug}` });
  return { ...inv, leaves: inv.leaves.filter((leaf) => !duplicates.has(leaf.state.slug)) };
}

export function inventoryFailures(inv: Inventory): { ownedNames: Set<string>; incomplete: boolean } {
  return {
    ownedNames: new Set(inv.unreadable.map((failure) => basename(failure.path))),
    incomplete: inv.unknown.length > 0,
  };
}

export function leavesUnder(path: string, areaRoot: string): Leaf[] {
  return readInventory(path, areaRoot).leaves;
}

export function allLeaves(repo: Repo): Leaf[] {
  return repoInventory(repo).leaves;
}

export function isParked(repo: Repo, slug: string): boolean {
  const parkedRoot: string = resolve(repo.root, 'issues/parked');
  return issueFolders(repo.root, 'issues/parked').some((owner) => {
    const ownerPath: string = resolve(parkedRoot, owner);
    return issueFolders(ownerPath, '.').some((child) => {
      const childPath: string = resolve(ownerPath, child);
      return (
        (child === slug && existsSync(resolve(childPath, 'state.yaml'))) ||
        issueFolders(childPath, '.').some((leaf) => leaf === slug && existsSync(resolve(childPath, leaf, 'state.yaml')))
      );
    });
  });
}

function slugFolders(repo: Pick<Repo, 'root'>, slug: string): string[] {
  const found: string[] = [];
  function visit(path: string): void {
    let entries: Dirent[];
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      return;
    }
    if (entries.some((entry) => entry.name === 'state.yaml')) {
      if (basename(path) === slug) found.push(path);
      return;
    }
    for (const entry of entries.filter((entry) => entry.isDirectory())) visit(resolve(path, entry.name));
  }
  for (const area of ['open', 'closed']) visit(resolve(repo.root, 'issues', area));
  return found;
}

export function hasLeafFolder(repo: Repo, slug: string): boolean {
  return slugFolders(repo, slug).length > 0;
}

export function missingLeafMessage(repo: Repo, slug: string): string {
  return `Missing leaf: ${slug}${isParked(repo, slug) ? ' (parked)' : ''}`;
}

export function findLeaf(repo: Repo, slug: string): Leaf {
  const folders: string[] = slugFolders(repo, slug);
  if (folders.length === 0) throw new Error(missingLeafMessage(repo, slug));
  if (folders.length > 1) throw new Error(`Duplicate leaf slug: ${slug}`);
  const path: string = folders[0];
  const state: State = readState(path);
  if (state.repo !== repo.name) throw new RepoMismatchError(path, state.repo, repo.name);
  if (state.slug !== slug)
    throw new Error(`Leaf slug mismatch at ${path}: folder "${basename(path)}", state slug "${state.slug}"`);
  return { path, state };
}

export async function withLock<T>(
  path: string,
  action: () => Promise<T>,
  mode: 'exclusive' | 'shared' = 'exclusive',
): Promise<T> {
  // flock creates the lock file but not its parent: a first call against a
  // state home that nothing has created yet must not ENOENT.
  mkdirSync(dirname(path), { recursive: true });
  const child: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', mode === 'shared' ? '-s' : '-x', path, 'sh', '-c', 'printf locked; cat >/dev/null'],
    { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
  );
  const reader: ReadableStreamDefaultReader<Uint8Array> = child.stdout.getReader();
  const acquired: Awaited<ReturnType<typeof reader.read>> = await reader.read();
  if (acquired.done) {
    const stderr: string = await new Response(child.stderr).text();
    throw new Error(JSON.stringify({ lock: path, code: await child.exited, stderr }));
  }
  try {
    return await action();
  } finally {
    child.stdin.end();
    reader.releaseLock();
    const code: number = await child.exited;
    if (code !== 0)
      throw new Error(JSON.stringify({ lock: path, code, stderr: await new Response(child.stderr).text() }));
  }
}
