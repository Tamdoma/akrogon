import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { phaseSchema, slotSchema, verdictSchema } from './routing';
import { type Repo } from './config';
import { writeYaml } from './shell';

const counts = z.object({ A: z.number().int().nonnegative().default(0), B: z.number().int().nonnegative().default(0) });

export const stateSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    phase: phaseSchema,
    created: z.string(),
    repo: z.string(),
    debate: z.enum(['yes', 'no']),
    'blocked-by': z.array(z.string()),
    sources: z.array(z.string()).optional(),
    hand_built: z.boolean().optional(),
    failed_notified: z.boolean().default(false),
    busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    busy_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    attempts: counts.prefault({}),
    done: z.array(slotSchema).default([]),
    fix_rounds: z.number().int().nonnegative().default(0),
    verdict: z.object({ A: verdictSchema.optional(), B: verdictSchema.optional() }).default({}),
    tab: z.string().optional(),
    worktree: z.string().optional(),
    pane: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    prompted: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
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

export function leavesUnder(path: string): Leaf[] {
  if (!existsSync(path)) return [];
  if (existsSync(resolve(path, 'state.yaml'))) return [{ path, state: readState(path) }];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => leavesUnder(resolve(path, entry.name)));
}

export function allLeaves(repo: Repo): Leaf[] {
  const leaves: Leaf[] = ['open', 'closed'].flatMap((area) => leavesUnder(resolve(repo.root, 'issues', area)));
  const slugs: Set<string> = new Set();
  for (const leaf of leaves) {
    if (slugs.has(leaf.state.slug)) throw new Error(`Duplicate leaf slug: ${leaf.state.slug}`);
    if (leaf.state.repo !== repo.name) throw new RepoMismatchError(leaf.path, leaf.state.repo, repo.name);
    slugs.add(leaf.state.slug);
  }
  return leaves;
}

export function findLeaf(repo: Repo, slug: string): Leaf {
  const leaf: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === slug);
  if (leaf === undefined) throw new Error(`Missing leaf: ${slug}`);
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

export async function withLeafLocks<T>(leaf: Leaf, action: () => Promise<T>): Promise<T> {
  const issue: string = dirname(leaf.path);
  const parent: string = dirname(issue);
  const enclosing: string[] = basename(parent) === 'open' || basename(parent) === 'closed' ? [issue] : [parent, issue];
  async function acquire(paths: string[]): Promise<T> {
    return paths.length === 0 ? action() : withLock(resolve(paths[0], '.lock'), () => acquire(paths.slice(1)));
  }
  return acquire([...enclosing, leaf.path]);
}

export function dependenciesReady(repo: Repo, state: State): boolean {
  return state['blocked-by'].map((slug) => findLeaf(repo, slug)).every((leaf) => leaf.state.phase === 'merged');
}
