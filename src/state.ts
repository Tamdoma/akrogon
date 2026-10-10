import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
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

export const batchMemberSchema = z.strictObject({
  slug: z.string(),
  base: z.string(),
  head: z.string(),
  tip: z.string(),
});

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
  members: z.array(batchMemberSchema),
  tools: z.array(toolSchema).optional(),
  excluded: z.array(z.string()).optional(),
  top: z.string().optional(),
  tested_top: z.string().optional(),
  tested_main: z.string().optional(),
  decision: z.enum(['reuse', 'rerun']).optional(),
  candidate: z.string().optional(),
  notified: z.boolean().optional(),
  applied: z.boolean(),
  solo: z.boolean().optional(),
});

export type Batch = z.infer<typeof batchSchema>;
export type BatchMember = z.infer<typeof batchMemberSchema>;

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
    pane: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted: z.object({ A: z.string().min(1).optional(), B: z.string().min(1).optional() }).default({}),
    prompted_at: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    delivery_error: z.object({ A: deliveryErrorSchema.optional(), B: deliveryErrorSchema.optional() }).default({}),
    failure: failureSchema.optional(),
    merge_stamp: z.string().optional(),
    batch: batchSchema.optional(),
    batch_limit: z.number().int().nonnegative().optional(),
    frozen: z.record(z.string(), z.string().nullable()).optional(),
    frozen_cited: z.array(z.string()).optional(),
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
      ? Object.fromEntries(
          Object.entries(parsed).filter(
            ([key]) => key !== 'priority' && key !== 'slot' && key !== 'failed_notified' && key !== 'solo',
          ),
        )
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

function hasSlugFolder(path: string, slug: string): boolean {
  if (!existsSync(path)) return false;
  if (existsSync(resolve(path, 'state.yaml'))) return path.split(sep).pop() === slug;
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .some((entry) => hasSlugFolder(resolve(path, entry.name), slug));
}

export function hasLeafFolder(repo: Repo, slug: string): boolean {
  return ['open', 'closed'].some((area) => hasSlugFolder(resolve(repo.root, 'issues', area), slug));
}

export function missingLeafMessage(repo: Repo, slug: string): string {
  return `Missing leaf: ${slug}${isParked(repo, slug) ? ' (parked)' : ''}`;
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
