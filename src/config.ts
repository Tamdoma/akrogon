import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { z } from 'zod';
import { command, run, type Result } from './shell';

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
  max_active: z.number().int().positive().optional(),
  implement: z.enum(['subagents', 'inline']).default('subagents'),
  checks: z.record(text, text).default({}),
  advisory: z.array(text).default([]),
  grounding: z
    .union([
      z.literal('none'),
      z.object({
        index: text.optional(),
        docs: z.array(text).optional(),
        surfaces: z.array(text).optional(),
        indexed_scopes: z.array(text).optional(),
      }),
    ])
    .default('none'),
  broadcast: z.object({ discord: z.object({ webhook_env: z.array(text) }) }).optional(),
});

export type GlobalConfig = z.infer<typeof globalSchema>;

export type RepoConfig = z.infer<typeof repoSchema>;

export type Repo = { name: string; root: string; config: RepoConfig };

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
  return diff === '' || (!diff.startsWith('../') && diff !== '..' && !isAbsolute(diff));
}

export async function commonDirectory(cwd: string): Promise<string | null> {
  const probe: Result = await run(['git', 'rev-parse', '--is-inside-work-tree'], cwd);
  if (probe.code !== 0) {
    if (probe.stderr.includes('not a git repository')) return null;
    throw new Error(JSON.stringify({ cwd, ...probe }));
  }
  return realpathSync(resolve(cwd, await command(['git', 'rev-parse', '--git-common-dir'], cwd)));
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

export function target(repo: Repo): string {
  return `${repo.config.remote}/${repo.config.default_branch}`;
}

export async function base(repo: Repo, cwd: string): Promise<string> {
  return command(['git', 'merge-base', 'HEAD', target(repo)], cwd);
}

export async function effectiveConfig(cwd: string): Promise<string> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo | null = await currentRepo(global, cwd);
  const top: string | null = repo === null ? null : await command(['git', 'rev-parse', '--show-toplevel'], cwd);
  const repoConfig: RepoConfig = repo === null ? repoSchema.parse({}) : repo.config;
  const { max_active: repoMaxActive, ...repoValues } = repoConfig;
  return Bun.YAML.stringify(
    {
      ...global,
      ...repoValues,
      ...(repoMaxActive === undefined ? {} : { repo_max_active: repoMaxActive }),
      repo: repo === null ? 'none' : repo.name,
      ...(repo !== null && top !== repo.root ? { AKROGON_BASE: await base(repo, cwd) } : {}),
    },
    null,
    2,
  );
}
