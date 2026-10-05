import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { command, quote, run, type Result } from './shell';
import { trackingRef } from './preflight';

const text = z.string().min(1);

const slotConfigSchema = z.strictObject({ harness: text, model: text, effort: text });

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

export const repoSchema = z.strictObject({
  remote: text.default('origin'),
  default_branch: text.default('main'),
  worktree_root: text.default('issues/worktrees'),
  rebuttal: z.boolean().default(true),
  fix_rounds: z.number().int().positive().default(3),
  implement: z.enum(['subagents', 'inline']).default('subagents'),
  setup: text.optional(),
  checks: z.record(text, text).default({}),
  merge_checks: z.record(text, text).default({}),
  advisory: z.array(text).default([]),
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
});

export type SlotConfig = z.infer<typeof slotConfigSchema>;

export type GlobalConfig = z.infer<typeof globalSchema>;

export type RepoConfig = z.infer<typeof repoSchema>;

export type Repo = { name: string; root: string; config: RepoConfig };

export function seats(global: GlobalConfig, repo: Repo): { a: SlotConfig; b: SlotConfig } {
  const resolved: { a: SlotConfig; b: SlotConfig } = {
    a: repo.config.slots?.a ?? global.slots.a,
    b: repo.config.slots?.b ?? global.slots.b,
  };
  for (const seat of ['a', 'b'] as const) {
    const harness: string = resolved[seat].harness;
    if (!Object.hasOwn(global.harnesses, harness))
      throw new Error(`Missing harness template "${harness}" for seat ${seat} in repo ${repo.name}`);
  }
  return resolved;
}

export const toolRoot: string = resolve(import.meta.dir, '..');

export function globalHome(): string {
  return resolve(process.env.AKROGON_HOME ?? toolRoot);
}

export function expandPath(path: string, base: string = process.cwd()): string {
  return resolve(base, path === '~' ? homedir() : path.startsWith('~/') ? resolve(homedir(), path.slice(2)) : path);
}

export function readGlobal(): GlobalConfig {
  return globalSchema.parse(Bun.YAML.parse(readFileSync(resolve(globalHome(), 'config.yaml'), 'utf8')));
}

export function readRepo(name: string, path: string): Repo {
  const root: string = realpathSync(expandPath(path, globalHome()));
  return {
    name,
    root,
    config: repoSchema.parse(Bun.YAML.parse(readFileSync(resolve(root, 'issues/config.yaml'), 'utf8'))),
  };
}

export function within(path: string, parent: string): boolean {
  const diff: string = relative(parent, path);
  return diff === '' || (!diff.startsWith('../') && diff !== '..');
}

export async function commonDirectory(cwd: string): Promise<string | null> {
  const result: Result = await run(['git', 'rev-parse', '--git-common-dir'], cwd);
  if (result.code !== 0) {
    if (result.stderr.includes('not a git repository')) return null;
    throw new Error(JSON.stringify({ cwd, ...result }));
  }
  return realpathSync(resolve(cwd, result.stdout));
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

export function worktreeStore(repo: Repo): string {
  return resolve(repo.root, repo.config.worktree_root);
}

export function leafTemp(repo: Repo, slug: string): string {
  const override: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_LEAF_TEMP_ROOT: must be a non-blank absolute path`);
  const root: string = override ?? `/tmp/akrogon-${process.getuid!()}`;
  const hex: string = createHash('sha256')
    .update(repo.root + '\n' + slug)
    .digest('hex')
    .slice(0, 12);
  return resolve(root, `${slug.slice(0, 20)}-${hex}`);
}

export function target(repo: Repo): string {
  return `${repo.config.remote}/${repo.config.default_branch}`;
}

export async function base(repo: Repo, cwd: string): Promise<string> {
  return command(['git', 'merge-base', 'HEAD', trackingRef(repo)], cwd);
}

export function withSetup(config: RepoConfig): RepoConfig {
  if (config.setup === undefined) return config;
  const setup: string = config.setup;
  const wrap = (cmd: string): string =>
    `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c ${quote(setup)} && sh -c ${quote(cmd)}`;
  const map = (record: Record<string, string>): Record<string, string> =>
    Object.fromEntries(Object.entries(record).map(([k, v]): [string, string] => [k, wrap(v)]));
  return {
    ...config,
    checks: map(config.checks),
    merge_checks: map(config.merge_checks),
    advisory: config.advisory.map(wrap),
  };
}

export async function effectiveConfig(cwd: string): Promise<string> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo | null = await currentRepo(global, cwd);
  const top: string | null = repo === null ? null : await command(['git', 'rev-parse', '--show-toplevel'], cwd);
  const repoConfig: RepoConfig = repo === null ? repoSchema.parse({ grounding: 'none' }) : repo.config;
  return Bun.YAML.stringify(
    {
      ...global,
      ...withSetup(repoConfig),
      slots: repo === null ? global.slots : seats(global, repo),
      repo: repo === null ? 'none' : repo.name,
      ...(repo !== null ? { worktree_store: worktreeStore(repo) } : {}),
      ...(repo !== null && top !== repo.root ? { AKROGON_BASE: await base(repo, cwd) } : {}),
    },
    null,
    2,
  );
}
