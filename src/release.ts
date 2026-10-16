import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { basename, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, toolRoot, within, type Repo } from './config';
import { command, writeYaml } from './shell';

export function releasesDir(): string {
  return resolve(globalHome(), 'releases');
}

export function currentLink(): string {
  return resolve(globalHome(), 'current');
}

export function deployRecordPath(): string {
  return resolve(globalHome(), 'deploy.yaml');
}

export function releaseHoldPath(): string {
  return resolve(globalHome(), 'release-hold.yaml');
}

// lstatSync, not existsSync: a dangling current link counts as existing and is
// left alone for the caller to repair through flip.
export function ensureCurrent(): void {
  try {
    lstatSync(currentLink());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    symlinkSync(toolRoot, currentLink());
  }
}

export function currentReleaseCommit(): string | null {
  let target: string;
  let releases: string;
  try {
    target = realpathSync(currentLink());
    releases = realpathSync(releasesDir());
  } catch {
    return null;
  }
  return within(target, releases) ? basename(target) : null;
}

export async function buildRelease(repo: Repo, sha: string): Promise<string> {
  const releases: string = releasesDir();
  const target: string = resolve(releases, sha);
  if (existsSync(target)) return target;
  mkdirSync(releases, { recursive: true });
  for (const name of readdirSync(releases))
    if (name.startsWith('.build-')) rmSync(resolve(releases, name), { recursive: true, force: true });
  const tar: string = resolve(releases, `.build-${sha}.tar`);
  const staging: string = resolve(releases, `.build-${sha}`);
  await command(['git', 'archive', '--format=tar', '-o', tar, sha], repo.root);
  mkdirSync(staging, { recursive: true });
  try {
    await command(['tar', '-xf', tar], staging);
    await command([process.execPath, 'install', '--frozen-lockfile'], staging);
  } finally {
    rmSync(tar, { force: true });
  }
  renameSync(staging, target);
  return target;
}

// Atomic replace: the temporary link lives under releases/ so the rename onto
// current stays on one filesystem.
export function flip(sha: string): void {
  const next: string = resolve(releasesDir(), `.next-${sha}`);
  rmSync(next, { force: true });
  symlinkSync(resolve(releasesDir(), sha), next);
  renameSync(next, currentLink());
}

const deployRecordSchema = z.strictObject({
  commit: z.string().optional(),
  previous: z.string().nullable(),
  ok: z.boolean(),
  step: z.string().optional(),
  error: z.string().optional(),
  attempted: z.string().optional(),
  at: z.string().optional(),
  replaced: z.record(z.string(), z.string()).default({}),
});

type DeployRecord = z.infer<typeof deployRecordSchema>;

export function readDeployRecord(): DeployRecord | null {
  const path: string = deployRecordPath();
  if (!existsSync(path)) return null;
  return deployRecordSchema.parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
}

export function writeDeploySuccess(sha: string, previous: string | null): void {
  const existing: DeployRecord | null = readDeployRecord();
  writeYaml(deployRecordPath(), {
    commit: sha,
    previous,
    ok: true,
    at: new Date().toISOString(),
    replaced: existing?.replaced ?? {},
  });
}

export function writeDeployFailure(attempted: string, step: string, error: string): void {
  const existing: DeployRecord | null = readDeployRecord();
  writeYaml(deployRecordPath(), {
    attempted,
    previous: existing?.previous ?? null,
    ok: false,
    step,
    error,
    at: new Date().toISOString(),
    replaced: existing?.replaced ?? {},
  });
}

const releaseHoldSchema = z.strictObject({ commit: z.string() });

export function readReleaseHold(): string | null {
  const path: string = releaseHoldPath();
  if (!existsSync(path)) return null;
  return releaseHoldSchema.parse(Bun.YAML.parse(readFileSync(path, 'utf8'))).commit;
}

export function clearReleaseHold(): void {
  rmSync(releaseHoldPath(), { force: true });
}

const replacedLifetimeMs: number = 24 * 60 * 60 * 1000;

export function pruneReleases(now: number = Date.now()): void {
  const releases: string = releasesDir();
  if (!existsSync(releases)) return;
  const record: DeployRecord | null = readDeployRecord();
  const keep: Set<string> = new Set(
    [currentReleaseCommit(), record?.previous].filter((name): name is string => name !== null && name !== undefined),
  );
  const replaced: Record<string, string> = { ...(record?.replaced ?? {}) };
  let stamped: boolean = false;
  for (const entry of readdirSync(releases, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.build-') || entry.name.startsWith('.next-')) continue;
    if (keep.has(entry.name)) continue;
    const stamp: string | undefined = replaced[entry.name];
    if (stamp === undefined) {
      replaced[entry.name] = new Date(now).toISOString();
      stamped = true;
    } else if (now - Date.parse(stamp) > replacedLifetimeMs) {
      rmSync(resolve(releases, entry.name), { recursive: true, force: true });
    }
  }
  if (stamped)
    writeYaml(deployRecordPath(), {
      ...(record ?? { previous: null, ok: false }),
      at: new Date(now).toISOString(),
      replaced,
    });
}
