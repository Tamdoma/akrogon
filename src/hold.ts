import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, readGlobal, requireRepo, type GlobalConfig, type Repo } from './config';
import { writeYaml } from './shell';
import { allLeaves, findLeaf, withLock, type Leaf } from './state';
import { mergeQueue, type QueueEntry } from './turn';
import { readLog, type LogRecord } from './log';

export const holdSchema = z.object({
  sha: z.string().min(1),
  command: z.string().min(1),
  holder: z.string().min(1),
  attempt: z.string().min(1),
  at: z.string(),
  evidence: z.string().min(1),
  fix: z.string().min(1).optional(),
});
export type Hold = z.infer<typeof holdSchema>;

const heldSchema = z.record(z.string().min(1), holdSchema);

export class HoldStateError extends Error {
  constructor(file: string, reason: string) {
    super(`Invalid hold state in ${file}: ${reason}`);
  }
}

export function heldFile(): string {
  return resolve(globalHome(), 'held.yaml');
}

export function readHeld(): Record<string, Hold> {
  const file: string = heldFile();
  let raw: string;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(raw);
  } catch (error) {
    throw new HoldStateError(file, error instanceof Error ? error.message : String(error));
  }
  try {
    return heldSchema.parse(parsed);
  } catch (error) {
    throw new HoldStateError(file, error instanceof Error ? error.message : String(error));
  }
}

export function heldFor(repoName: string): Hold | undefined {
  return readHeld()[repoName];
}

export function writeHeld(repoName: string, hold: Hold): void {
  writeYaml(heldFile(), { ...readHeld(), [repoName]: hold });
}

export function dropHeld(repoName: string): void {
  const current: Record<string, Hold> = readHeld();
  delete current[repoName];
  writeYaml(heldFile(), current);
}

export async function setHeld(repoName: string, hold: Hold): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => writeHeld(repoName, hold));
}

export async function clearHeld(repoName: string): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => dropHeld(repoName));
}

export function mergeHolder(
  repoName: string,
  global: GlobalConfig,
  leaves: Leaf[],
  log: () => LogRecord[],
): QueueEntry | undefined {
  const queue: QueueEntry[] = mergeQueue(global, leaves, log);
  const fix: string | undefined = heldFor(repoName)?.fix;
  if (fix === undefined) return queue[0];
  return queue.find((entry) => entry.leaf.state.slug === fix) ?? queue[0];
}

export async function holdFixCommand(cwd: string, slug: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const hold: Hold | undefined = heldFor(repo.name);
    if (hold === undefined) throw new Error(`No hold on ${repo.name}`);
    findLeaf(repo, slug);
    if (mergeQueue(global, allLeaves(repo), () => readLog(repo.root)).every((entry) => entry.leaf.state.slug !== slug))
      throw new Error(`${slug} is not in the merge queue of ${repo.name}`);
    writeHeld(repo.name, { ...hold, fix: slug });
  });
  console.log(`held ${repo.name} fix ${slug}`);
}

export async function unholdCommand(cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (heldFor(repo.name) === undefined) throw new Error(`No hold on ${repo.name}`);
    dropHeld(repo.name);
  });
  console.log(`unheld ${repo.name}`);
}
