import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, readGlobal, requireRepo, type Repo } from './config';
import { HcError, repoSpace, type SpaceResolution } from './hc';
import { endSeats } from './reconcile';
import { leafSlice } from './scope';
import { command, CommandError, writeYaml } from './shell';
import { findLeaf, repoInventory, withLock, type Inventory, type Leaf, type LeafFailure } from './state';

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

// The leaf's seat terminals end before its slice stops (plan D19). A refused session is never called
// (L2); the slice stop still ends the seat processes, which run inside it.
async function stopLeaf(repo: Repo, leaf: Leaf): Promise<void> {
  const space: SpaceResolution = await repoSpace(repo);
  if (space.ok) await endSeats(space.session, repo, leaf.state);
  await command(['systemctl', '--user', 'stop', leafSlice(repo, leaf.state.slug)]);
  console.log(`stopped: ${repo.name}/${leaf.state.slug}`);
}

export async function stopCommand(target: string | undefined, all: boolean, cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const inv: Inventory | null = all ? repoInventory(repo, ['open']) : null;
  if (inv !== null) {
    const failures: LeafFailure[] = [
      ...inv.unreadable,
      ...inv.unknown,
      ...inv.foreign.map((foreign) => ({
        path: foreign.path,
        error: `Leaf repo mismatch at ${foreign.path}: stored key "${foreign.stored}", registered key "${repo.name}"`,
      })),
    ];
    for (const failure of failures) {
      console.error(`failed: ${repo.name}/${basename(failure.path)} ${failure.error}`);
      process.exitCode = 1;
    }
  }
  const leaves: Leaf[] =
    inv !== null
      ? inv.leaves.filter(
          (leaf: Leaf) =>
            (leaf.state.tab !== undefined || leaf.state.batch?.owner === 'command') && leaf.state.phase !== 'merged',
        )
      : [findLeaf(repo, z.string().parse(target))];
  await withLock(resolve(globalHome(), '.lock'), async () => {
    writeStopped(new Set<string>([...readStopped(), ...leaves.map((leaf: Leaf) => `${repo.name}/${leaf.state.slug}`)]));
  });
  if (!all) return stopLeaf(repo, leaves[0]);
  for (const leaf of leaves) {
    try {
      await stopLeaf(repo, leaf);
    } catch (error) {
      if (!(error instanceof CommandError || error instanceof HcError)) throw error;
      console.error(`failed: ${repo.name}/${leaf.state.slug} ${error.message}`);
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
