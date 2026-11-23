import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, homePath, readGlobal, requireRepo, type Repo } from './config';
import { HcError, repoSpace, type SpaceResolution } from './hc';
import { cancelLeafRuns, recordUnits, type RunRecord } from './admission';
import { endSeats } from './reconcile';
import { leafSlice, stopRunUnits, type RunUnit } from './scope';
import { CommandError, writeYaml } from './shell';
import { findLeaf, repoInventory, withLock, type Inventory, type Leaf, type LeafFailure } from './state';
import { listPassRecords, passLive } from './verify-pass';

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
// (L2); the slice stop still ends the seat processes, which run inside it. The slice stop goes first
// and a refused one throws before any record is touched, so a live land never reads a cancelled run as
// a red verify. A land's verify pass and its check runs sit outside the leaf slice, so they are
// stopped after it; the land hold keeps the repo line while they run (admission live()). Every run
// record of the leaf is cancelled before that, so a waiting run or a live one yet to launch never
// launches, and a run of the leaf that arrives later is refused. The run scopes stop before the
// passes: a pass's checks carry its PID, so the live pass keeps the hold while their scopes drain,
// and a failed scope stop throws with the pass, and so the hold, left for the retry.
async function stopLeaf(repo: Repo, leaf: Leaf): Promise<void> {
  const space: SpaceResolution = await repoSpace(repo);
  if (space.ok) await endSeats(space.session, repo, leaf.state);
  // A refused leaf-slice stop is never excused.
  await stopRunUnits({ unit: leafSlice(repo, leaf.state.slug, homePath()), gone: (): boolean => false });
  const live: RunRecord[] = await cancelLeafRuns(repo.name, leaf.state.slug);
  // A pass holds the line through its own process, so that is what its stop must end.
  const passes: RunUnit[] = listPassRecords()
    .filter(
      (entry) =>
        entry.record.repo === repo.name && entry.record.caller.slug === leaf.state.slug && passLive(entry.record),
    )
    .map((entry) => ({ unit: entry.record.unit_name, gone: (): boolean => !passLive(entry.record) }));
  await stopRunUnits(...live.filter((record: RunRecord) => record.land !== true).flatMap(recordUnits));
  await stopRunUnits(...passes);
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
            (leaf.state.tab !== undefined || leaf.state.batch !== undefined) && leaf.state.phase !== 'merged',
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
