// Repo resolution shared by the watch scripts: `run` and `resolveRepoKey` are factored out of
// observe.ts (which imports them here) and extended so `akrogon config` answers the repo's prefix
// alongside its name; watchTarget then turns a root into repo + prefix + hc session.
import { resolve } from 'node:path';
import { globalHome, readRepo, type Repo } from '../../../src/config';
import { repoSpace, type SpaceResolution } from '../../../src/hc';
import { withLock } from '../../../src/state';

export type RunResult = { code: number; stdout: string; stderr: string };

export async function run(argv: string[], cwd: string): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export type RepoKey = { repo: string; prefix: string | null };

export async function resolveRepoKey(root: string, bin: string): Promise<RepoKey> {
  let result: RunResult;
  try {
    result = await run([bin, 'config'], root);
  } catch (error) {
    throw new Error(`akrogon config failed to spawn ${bin}: ${messageOf(error)}`);
  }
  if (result.code !== 0) {
    throw new Error(`akrogon config failed: exit ${result.code} ${result.stderr} ${result.stdout}`.trim());
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(result.stdout);
  } catch (error) {
    throw new Error(`akrogon config returned invalid YAML: ${messageOf(error)}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('akrogon config has no usable repo: expected object with repo field');
  }
  const repo: unknown = (parsed as Record<string, unknown>).repo;
  if (repo === 'none') {
    throw new Error(`akrogon config reports repo "none": no registered repo for ${root}`);
  }
  if (typeof repo !== 'string' || repo.trim() === '') {
    throw new Error('akrogon config has no usable repo: missing or invalid repo field');
  }
  const prefixes: unknown = (parsed as Record<string, unknown>).prefixes;
  const prefix: unknown =
    prefixes === null || typeof prefixes !== 'object' || Array.isArray(prefixes)
      ? null
      : (prefixes as Record<string, unknown>)[repo];
  return { repo, prefix: typeof prefix === 'string' && prefix !== '' ? prefix : null };
}

export type WatchTarget = { repo: string; prefix: string; session: string };

export function withConsultantLock<T>(target: Pick<WatchTarget, 'repo'>, action: () => Promise<T>): Promise<T> {
  return withLock(resolve(globalHome(), 'watch', target.repo, '.consultant.lock'), action);
}

// Everything a watch step needs from a root: the repo name (label value), its prefix (timer name)
// and the live hc session the repo's space sits in.
export async function watchTarget(root: string): Promise<WatchTarget> {
  const key: RepoKey = await resolveRepoKey(root, process.env.WATCH_AKROGON ?? 'akrogon');
  if (key.prefix === null) {
    throw new Error(`akrogon config has no usable prefix: missing prefixes[${key.repo}]`);
  }
  const repo: Repo = readRepo(key.repo, root);
  const resolved: SpaceResolution = await repoSpace(repo);
  if (!resolved.ok) throw new Error(resolved.reason);
  return { repo: key.repo, prefix: key.prefix, session: resolved.session };
}
