import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { command, quote, run, type Result } from './shell';
import { trackingRef } from './preflight';

const text = z.string().min(1);

const seat: z.ZodString = z
  .string()
  .trim()
  .min(1)
  .regex(/^[^'"]*$/);

const slotConfigSchema = z.strictObject({ harness: seat, model: seat, effort: seat });

const indexSchema = z.strictObject({
  slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }),
});

export const globalSchema = z
  .strictObject({
    max_active: z.number().int().positive().default(3),
    slots: z.strictObject({ a: slotConfigSchema, b: slotConfigSchema }),
    harnesses: z.record(text, text),
    toolkits: z.record(text, text).default({}),
    repos: z.record(text, text).default({}),
  })
  .superRefine((config, ctx) => {
    for (const slot of [config.slots.a, config.slots.b]) {
      if (!Object.hasOwn(config.harnesses, slot.harness))
        ctx.addIssue({ code: 'custom', message: `Missing harness template: ${slot.harness}` });
    }
  });

export const repoSchema = z
  .strictObject({
    remote: text.default('origin'),
    default_branch: text.default('main'),
    worktree_root: text.optional(),
    fix_rounds: z.number().int().positive().default(3),
    implement: z.enum(['subagents', 'inline']).default('subagents'),
    setup: text.optional(),
    checks: z.record(text, text).default({}),
    merge_checks: z.record(text, text).default({}),
    merge_covers: z.array(text).default([]),
    full: z.array(text).default([]),
    advisory: z.array(text).default([]),
    env: z.array(text).default([]),
    pass_env: z.array(text).default([]),
    tools: z.array(text).default([]),
    grounding: z.union([
      z.literal('none'),
      z.object({
        index: text.optional(),
        docs: z.array(text).optional(),
        surfaces: z.array(text).optional(),
        indexed_scopes: z.array(text).optional(),
      }),
    ]),
    broadcast: z.object({ discord: z.object({ webhook_env: z.array(text) }) }).optional(),
    slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }).optional(),
  })
  .superRefine((config, ctx) => {
    const constructed: Set<string> = new Set([
      'TMPDIR',
      'AKROGON_BASE',
      'AKROGON_RUN',
      'NODE_PATH',
      'BUN_OPTIONS',
      'BUN_INSTALL_CACHE_DIR',
      'FFMPEG_BIN',
      'CHROME_PATH',
      'CDP_BROWSER_BINARY',
      'DBUS_SESSION_BUS_ADDRESS',
    ]);
    const envName: RegExp = /^[A-Z_][A-Z0-9_]*$/;
    for (const [field, names] of [
      ['env', config.env],
      ['pass_env', config.pass_env],
    ] as const) {
      for (const name of names) {
        if (!envName.test(name))
          ctx.addIssue({ code: 'custom', path: [field], message: `Invalid ${field} entry: ${name}` });
        else if (constructed.has(name))
          ctx.addIssue({ code: 'custom', path: [field], message: `Reserved ${field} entry: ${name}` });
      }
    }
    for (const name of config.merge_covers) {
      if (!Object.hasOwn(config.checks, name))
        ctx.addIssue({
          code: 'custom',
          path: ['merge_covers'],
          message: `Unknown checks name in merge_covers: ${name}`,
        });
    }
    for (const name of config.full) {
      if (!Object.hasOwn(config.checks, name) && !Object.hasOwn(config.merge_checks, name))
        ctx.addIssue({ code: 'custom', path: ['full'], message: `Unknown check name in full: ${name}` });
    }
    if (config.merge_covers.length > 0 && Object.keys(config.merge_checks).length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['merge_covers'],
        message: `merge_covers [${config.merge_covers.join(', ')}] requires non-empty merge_checks`,
      });
  });

export type SlotConfig = z.infer<typeof slotConfigSchema>;

export type GlobalConfig = z.infer<typeof globalSchema>;

export type RepoConfig = z.infer<typeof repoSchema>;

export type Repo = { name: string; root: string; config: RepoConfig };

export class SeatIndexError extends Error {
  constructor(
    readonly file: string,
    reason: string,
  ) {
    super(`Invalid slots front matter in ${file}: ${reason}`);
  }
}

function indexSeats(file: string): { a?: SlotConfig; b?: SlotConfig } {
  const lines: string[] = readFileSync(file, 'utf8').split('\n');
  if (lines[0] !== '---') return {};
  const end: number = lines.indexOf('---', 1);
  if (end === -1) throw new SeatIndexError(file, 'missing closing ---');
  try {
    return indexSchema.parse(Bun.YAML.parse(lines.slice(1, end).join('\n'))).slots;
  } catch (error) {
    const reason: string =
      error instanceof z.ZodError
        ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        : error instanceof Error
          ? error.message
          : String(error);
    throw new SeatIndexError(file, reason);
  }
}

type IndexedSeat = { seat: SlotConfig; file: string };

function indexSlots(leafPath: string | undefined, repo: Repo): { a?: IndexedSeat; b?: IndexedSeat } {
  const found: { a?: IndexedSeat; b?: IndexedSeat } = {};
  if (leafPath === undefined) return found;
  const files: string[] = ['open', 'closed'].flatMap((area) => {
    const areaRoot: string = resolve(repo.root, 'issues', area);
    if (!within(leafPath, areaRoot)) return [];
    const parts: string[] = relative(areaRoot, leafPath).split(sep).filter(Boolean);
    if (parts.length === 2) return [resolve(areaRoot, parts[0], 'ISSUE.md')];
    if (parts.length === 3)
      return [resolve(areaRoot, parts[0], parts[1], 'ISSUE.md'), resolve(areaRoot, parts[0], 'EPIC.md')];
    return [];
  });
  for (const file of files) {
    if (!existsSync(file)) continue;
    const slots: { a?: SlotConfig; b?: SlotConfig } = indexSeats(file);
    for (const key of ['a', 'b'] as const) {
      if (found[key] === undefined && slots[key] !== undefined) found[key] = { seat: slots[key], file };
    }
  }
  return found;
}

export function seats(
  global: GlobalConfig,
  repo: Repo,
  leafPath?: string,
): { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } } {
  const index: { a?: IndexedSeat; b?: IndexedSeat } = indexSlots(leafPath, repo);
  const fallback = (key: 'a' | 'b'): string =>
    repo.config.slots?.[key] === undefined
      ? resolve(globalHome(), 'config.yaml')
      : resolve(repo.root, 'issues/config.yaml');
  const source: { a: string; b: string } = {
    a: index.a?.file ?? fallback('a'),
    b: index.b?.file ?? fallback('b'),
  };
  const resolved: { a: SlotConfig; b: SlotConfig } = {
    a: index.a?.seat ?? repo.config.slots?.a ?? global.slots.a,
    b: index.b?.seat ?? repo.config.slots?.b ?? global.slots.b,
  };
  for (const seat of ['a', 'b'] as const) {
    const harness: string = resolved[seat].harness;
    if (!Object.hasOwn(global.harnesses, harness)) {
      if (index[seat] !== undefined)
        throw new SeatIndexError(source[seat], `Missing harness template "${harness}" for seat ${seat}`);
      throw new Error(`Missing harness template "${harness}" for seat ${seat} in repo ${repo.name}`);
    }
  }
  return { ...resolved, source };
}

export const toolRoot: string = resolve(import.meta.dir, '..');

export function globalHome(): string {
  const home: string = resolve(process.env.AKROGON_HOME ?? resolve(homedir(), '.akrogon'));
  if (existsSync(resolve(home, 'config.yaml'))) return home;
  if (existsSync(resolve(toolRoot, 'config.yaml'))) return toolRoot;
  return home;
}

export function expandPath(path: string, base: string = process.cwd()): string {
  return resolve(base, path === '~' ? homedir() : path.startsWith('~/') ? resolve(homedir(), path.slice(2)) : path);
}

export function readGlobal(): GlobalConfig {
  const file: string = resolve(globalHome(), 'config.yaml');
  try {
    return globalSchema.parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
  } catch (error) {
    if (!(error instanceof Error)) throw new Error(`Invalid ${file}: ${String(error)}`, { cause: error });
    error.message = `Invalid ${file}: ${error.message}`;
    throw error;
  }
}

type Yaml = ReturnType<typeof Bun.YAML.parse>;

// Retired keys stay in old files; dropping them here keeps the strict schema refusing every other unknown key.
export function withoutKey(raw: Yaml, key: string): Yaml {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;
  return Object.fromEntries(Object.entries<unknown>({ ...raw }).filter(([name]): boolean => name !== key));
}

export function parseRepoConfig(raw: Yaml): RepoConfig {
  return repoSchema.parse(withoutKey(raw, 'rebuttal'));
}

export function readRepo(name: string, path: string): Repo {
  const root: string = realpathSync(expandPath(path, globalHome()));
  try {
    return {
      name,
      root,
      config: parseRepoConfig(Bun.YAML.parse(readFileSync(resolve(root, 'issues/config.yaml'), 'utf8'))),
    };
  } catch (error) {
    if (!(error instanceof Error)) throw new Error(`repo ${name}: ${String(error)}`, { cause: error });
    error.message = `repo ${name}: ${error.message}`;
    throw error;
  }
}

export function within(path: string, parent: string): boolean {
  const diff: string = relative(parent, path);
  return diff === '' || (!diff.startsWith('../') && diff !== '..');
}

// Root identity is stable within a run: only non-null answers stay cached.
// A null (non-repo) or a failure is evicted so the next call respawns git.
const commonDirectories: Map<string, Promise<string | null>> = new Map();

async function queryCommonDirectory(cwd: string): Promise<string | null> {
  const result: Result = await run(['git', 'rev-parse', '--git-common-dir'], cwd);
  if (result.code !== 0) {
    if (result.stderr.includes('not a git repository')) return null;
    throw new Error(JSON.stringify({ cwd, ...result }));
  }
  return realpathSync(resolve(cwd, result.stdout));
}

export async function commonDirectory(cwd: string): Promise<string | null> {
  let key: string;
  try {
    key = realpathSync(cwd);
  } catch {
    key = cwd;
  }
  const cached: Promise<string | null> | undefined = commonDirectories.get(key);
  if (cached !== undefined) return cached;
  const queried: Promise<string | null> = queryCommonDirectory(cwd);
  commonDirectories.set(key, queried);
  queried.then(
    (dir: string | null) => dir === null && commonDirectories.delete(key),
    () => commonDirectories.delete(key),
  );
  return queried;
}

const remoteUrls: Map<string, Promise<string>> = new Map();

export async function remoteUrl(root: string, remote: string): Promise<string> {
  const key: string = `${root}\n${remote}`;
  const cached: Promise<string> | undefined = remoteUrls.get(key);
  if (cached !== undefined) return cached;
  const queried: Promise<string> = command(['git', 'remote', 'get-url', remote], root);
  remoteUrls.set(key, queried);
  queried.catch(() => remoteUrls.delete(key));
  return queried;
}

export async function currentRepo(global: GlobalConfig, cwd: string): Promise<Repo | null> {
  const common: string | null = await commonDirectory(cwd);
  if (common === null) return null;
  const matches: Repo[] = [];
  for (const [name, path] of Object.entries(global.repos)) {
    const root: string = expandPath(path, globalHome());
    if ((await commonDirectory(root)) === common && existsSync(resolve(root, 'issues/config.yaml')))
      matches.push(readRepo(name, root));
  }
  if (matches.length > 1) throw new Error(`Multiple registered checkouts for ${cwd}`);
  return matches.length === 1 ? matches[0] : null;
}

export async function requireRepo(global: GlobalConfig, cwd: string): Promise<Repo> {
  const repo: Repo | null = await currentRepo(global, cwd);
  if (repo === null) throw new Error(`No initialized registered checkout for ${cwd}`);
  return repo;
}

// Realpath of the deepest existing ancestor joined with the remaining suffix,
// so paths that do not exist yet still resolve symlinked ancestors.
function canonicalPath(path: string): string {
  if (existsSync(path)) return realpathSync(path);
  const parent: string = dirname(path);
  return parent === path ? path : resolve(canonicalPath(parent), basename(path));
}

export function worktreeStore(repo: Repo): string {
  if (repo.config.worktree_root === undefined) return resolve(homedir(), '.akrogon/worktrees', repo.name);
  const store: string = canonicalPath(expandPath(repo.config.worktree_root, repo.root));
  const root: string = canonicalPath(repo.root);
  if (within(store, root))
    throw new Error(
      `worktree_root in issues/config.yaml resolves inside the registered checkout: store ${store} is inside ${root}; remove the key (default ~/.akrogon/worktrees/${repo.name}) or point it outside the checkout`,
    );
  return store;
}

// Short on purpose: Chrome puts its SingletonSocket under TMPDIR and aborts past the 107-byte socket path limit.
// Fixed /var/tmp, not tmpdir(), because a seat's TMPDIR is itself a leaf temp folder.
// Disk-backed on purpose: /tmp is tmpfs, so test files left there count as memory.
export function leafTempRoot(): string {
  const override: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_LEAF_TEMP_ROOT: must be a non-blank absolute path`);
  return override ?? `/var/tmp/akr-${process.getuid!()}`;
}

// The pre-/var/tmp leaf temp root, kept as a name so the host sweep can retire it.
export function retiredLeafTempRoot(): string {
  const override: string | undefined = process.env.AKROGON_RETIRED_TEMP_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_RETIRED_TEMP_ROOT: must be a non-blank absolute path`);
  return override ?? `/tmp/akr-${process.getuid!()}`;
}

export function leafTemp(repo: Repo, slug: string): string {
  const root: string = leafTempRoot();
  const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
  return resolve(root, hex(repo.root).slice(0, 4), hex(repo.root + '\n' + slug).slice(0, 8));
}

export function ensureLeafTemp(repo: Repo, slug: string): string {
  const leaf: string = leafTemp(repo, slug);
  const repoTemp: string = dirname(leaf);
  for (const path of [dirname(repoTemp), repoTemp, leaf]) ensurePrivateDir(path);
  return leaf;
}

function ensurePrivateDir(path: string): void {
  function validate(): void {
    const existing = lstatSync(path);
    if (existing.isSymbolicLink() || !existing.isDirectory())
      throw new Error(`Refusing leaf temp path (not a directory): ${path}`);
    if (statSync(path).uid !== process.getuid!()) throw new Error(`Refusing foreign-owned leaf temp path: ${path}`);
  }
  try {
    validate();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    try {
      mkdirSync(path, { recursive: true, mode: 0o700 });
    } catch (mkdirError) {
      if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') throw mkdirError;
      validate();
    }
  }
  chmodSync(path, 0o700);
}

export function target(repo: Repo): string {
  return `${repo.config.remote}/${repo.config.default_branch}`;
}

export async function base(repo: Repo, cwd: string): Promise<string> {
  return command(['git', 'merge-base', 'HEAD', trackingRef(repo)], cwd);
}

export function setupCommand(config: RepoConfig, cmd: string): string {
  return config.setup === undefined
    ? `akrogon guard own-modules && sh -c ${quote(cmd)}`
    : `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c ${quote(config.setup)} && akrogon guard own-modules && sh -c ${quote(cmd)}`;
}

export function withSetup(config: RepoConfig): RepoConfig {
  const runCheck = (name: string, cmd: string): string =>
    `akrogon run-check --name ${quote(name)} -- sh -c ${quote(setupCommand(config, cmd))}`;
  const map = (record: Record<string, string>): Record<string, string> =>
    Object.fromEntries(Object.entries(record).map(([k, v]): [string, string] => [k, runCheck(k, v)]));
  return {
    ...config,
    checks: map(config.checks),
    merge_checks: Object.fromEntries(
      Object.keys(config.merge_checks).map((k): [string, string] => [k, 'akrogon verify --attempt <id>']),
    ),
    advisory: config.advisory.map((cmd, i): string => runCheck(`advisory-${i}`, cmd)),
  };
}

export async function effectiveConfig(cwd: string): Promise<string> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo | null = await currentRepo(global, cwd);
  const top: string | null = repo === null ? null : await command(['git', 'rev-parse', '--show-toplevel'], cwd);
  const repoConfig: RepoConfig = repo === null ? repoSchema.parse({ grounding: 'none' }) : repo.config;
  let leafPath: string | undefined;
  if (repo !== null && top !== null) {
    const { repoInventory, RepoMismatchError } = await import('./state');
    const realTop: string = realpathSync(top);
    const inv: import('./state').Inventory = repoInventory(repo);
    const leaf = inv.leaves.find(
      (item) =>
        item.state.worktree !== undefined &&
        existsSync(item.state.worktree) &&
        realpathSync(item.state.worktree) === realTop,
    );
    if (leaf === undefined && top !== repo.root) {
      const failure = [
        ...inv.unreadable,
        ...inv.foreign.map((f) => ({
          path: f.path,
          error: new RepoMismatchError(f.path, f.stored, repo.name).message,
        })),
      ].find((f) => basename(f.path) === basename(realTop));
      if (failure !== undefined)
        throw new Error(`Invalid state ${resolve(failure.path, 'state.yaml')}: ${failure.error}`);
    }
    leafPath = leaf?.path;
  }
  const resolved: { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } } | null =
    repo === null ? null : seats(global, repo, leafPath);
  return Bun.YAML.stringify(
    {
      ...global,
      ...withSetup(repoConfig),
      slots: resolved === null ? global.slots : { a: resolved.a, b: resolved.b },
      repo: repo === null ? 'none' : repo.name,
      ...(repo !== null ? { worktree_store: worktreeStore(repo) } : {}),
      ...(repo !== null && top !== repo.root ? { AKROGON_BASE: await base(repo, cwd) } : {}),
    },
    null,
    2,
  );
}
