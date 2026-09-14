import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { phaseSchema, slotSchema, verdictSchema } from './routing';
import { type Repo } from './config';
import { writeYaml } from './shell';
import { issueFolders } from './park';

const counts = z.object({ A: z.number().int().nonnegative().default(0), B: z.number().int().nonnegative().default(0) });

export const sourcePattern = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/;

export const stateSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    phase: phaseSchema,
    created: z.string(),
    repo: z.string(),
    debate: z.enum(['yes', 'no']),
    'blocked-by': z.array(z.string()),
    sources: z.array(z.string().regex(sourcePattern)).optional(),
    hand_built: z.boolean().optional(),
    failed_notified: z.boolean().default(false),
    busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    busy_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    attempts: counts.prefault({}),
    done: z.array(slotSchema).default([]),
    fix_rounds: z.number().int().nonnegative().default(0),
    verdict: z.object({ A: verdictSchema.optional(), B: verdictSchema.optional() }).default({}),
    tab: z.string().min(1).optional(),
    worktree: z.string().min(1).optional(),
    pane: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted_at: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
  })
  .refine((state) => new Set(state.done).size === state.done.length, 'Duplicate done slot');

export type State = z.infer<typeof stateSchema>;

export type Leaf = { path: string; state: State };

export class RepoMismatchError extends Error {
  constructor(path: string, stored: string, registered: string) {
    super(`Leaf repo mismatch at ${path}: stored key "${stored}", registered key "${registered}"`);
  }
}

export function readState(path: string): State {
  const parsed: ReturnType<typeof Bun.YAML.parse> = Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8'));
  return stateSchema.parse(
    parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== 'priority' && key !== 'slot'))
      : parsed,
  );
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

export function leavesUnder(path: string, areaRoot: string): Leaf[] {
  if (!existsSync(path)) return [];
  if (existsSync(resolve(path, 'state.yaml'))) {
    validateLeafDepth(areaRoot, path);
    return [{ path, state: readState(path) }];
  }
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => leavesUnder(resolve(path, entry.name), areaRoot));
}

export function allLeaves(repo: Repo): Leaf[] {
  const leaves: Leaf[] = ['open', 'closed'].flatMap((area) => {
    const areaRoot: string = resolve(repo.root, 'issues', area);
    return leavesUnder(areaRoot, areaRoot);
  });
  const slugs: Set<string> = new Set();
  for (const leaf of leaves) {
    if (slugs.has(leaf.state.slug)) throw new Error(`Duplicate leaf slug: ${leaf.state.slug}`);
    if (leaf.state.repo !== repo.name) throw new RepoMismatchError(leaf.path, leaf.state.repo, repo.name);
    slugs.add(leaf.state.slug);
  }
  return leaves;
}

export function missingLeafMessage(repo: Repo, slug: string): string {
  const parkedRoot: string = resolve(repo.root, 'issues/parked');
  const parked: boolean = issueFolders(repo.root, 'issues/parked').some((owner) => {
    const ownerPath: string = resolve(parkedRoot, owner);
    return issueFolders(ownerPath, '.').some((child) => {
      const childPath: string = resolve(ownerPath, child);
      return (
        (child === slug && existsSync(resolve(childPath, 'state.yaml'))) ||
        issueFolders(childPath, '.').some((leaf) => leaf === slug && existsSync(resolve(childPath, leaf, 'state.yaml')))
      );
    });
  });
  return `Missing leaf: ${slug}${parked ? ' (parked)' : ''}`;
}

export function findLeaf(repo: Repo, slug: string): Leaf {
  const leaf: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === slug);
  if (leaf === undefined) throw new Error(missingLeafMessage(repo, slug));
  return leaf;
}

export async function withLock<T>(path: string, action: () => Promise<T>): Promise<T> {
  const child: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-x', path, 'sh', '-c', 'printf locked; cat >/dev/null'],
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

export async function withRepoLock<T>(repo: Repo, action: () => Promise<T>): Promise<T> {
  return withLock(resolve(repo.root, 'issues/.lock'), action);
}
