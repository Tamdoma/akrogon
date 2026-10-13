import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, readGlobal, requireRepo, type Repo } from './config';
import { leafSlice } from './scope';
import { command, CommandError, writeYaml } from './shell';
import { findLeaf, leavesUnder, withLock, type Leaf } from './state';

const stopSchema = z.record(z.string().min(1), z.literal(true));

export class StopStateError extends Error {
  constructor(file: string, reason: string) {
    super(`Invalid stop state in ${file}: ${reason}`);
  }
}

export function stopFile(): string {
  return resolve(globalHome(), 'stopped.yaml');
}

export function readStopped(): Set<string> {
  const file: string = stopFile();
  let raw: string;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Set<string>();
    throw error;
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(raw);
  } catch (error) {
    throw new StopStateError(file, error instanceof Error ? error.message : String(error));
  }
  try {
    return new Set<string>(Object.keys(stopSchema.parse(parsed)));
  } catch (error) {
    throw new StopStateError(file, error instanceof Error ? error.message : String(error));
  }
}

export function isStopped(repoName: string, slug: string): boolean {
  return readStopped().has(`${repoName}/${slug}`);
}

function writeStopped(keys: Set<string>): void {
  writeYaml(stopFile(), Object.fromEntries([...keys].map((key: string): [string, true] => [key, true])));
}

async function stopSlice(repo: Repo, slug: string): Promise<void> {
  await command(['systemctl', '--user', 'stop', leafSlice(repo, slug)]);
  console.log(`stopped: ${repo.name}/${slug}`);
}

export async function stopCommand(target: string | undefined, all: boolean, cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const open: string = resolve(repo.root, 'issues/open');
  const slugs: string[] = all
    ? leavesUnder(open, open)
        .filter((leaf: Leaf) => leaf.state.tab !== undefined && leaf.state.phase !== 'merged')
        .map((leaf: Leaf) => leaf.state.slug)
    : [findLeaf(repo, z.string().parse(target)).state.slug];
  await withLock(resolve(globalHome(), '.lock'), async () => {
    writeStopped(new Set<string>([...readStopped(), ...slugs.map((slug: string) => `${repo.name}/${slug}`)]));
  });
  if (!all) return stopSlice(repo, slugs[0]);
  for (const slug of slugs) {
    try {
      await stopSlice(repo, slug);
    } catch (error) {
      if (!(error instanceof CommandError)) throw error;
      console.error(`failed: ${repo.name}/${slug} ${error.message}`);
      process.exitCode = 1;
    }
  }
}

export async function startCommand(slug: string, cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const leaf: Leaf = findLeaf(repo, slug);
  const key: string = `${repo.name}/${slug}`;
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const current: Set<string> = readStopped();
    if (!current.delete(key)) throw new Error(`Leaf is not stopped: ${key}`);
    writeStopped(current);
  });
  await (await import('./next')).nextCommand(leaf.path);
}
