import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, readGlobal, requireRepo, type GlobalConfig, type Repo } from './config';
import { writeYaml } from './shell';
import { withLock } from './state';

export type PauseVerb = 'pause' | 'unpause';

const pauseSchema = z.record(z.string().min(1), z.literal(true));

export class PauseStateError extends Error {
  constructor(file: string, reason: string) {
    super(`Invalid pause state in ${file}: ${reason}`);
  }
}

export function pauseFile(): string {
  return resolve(globalHome(), 'paused.yaml');
}

export function readPaused(): Set<string> {
  const file: string = pauseFile();
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
    throw new PauseStateError(file, error instanceof Error ? error.message : String(error));
  }
  try {
    return new Set<string>(Object.keys(pauseSchema.parse(parsed)));
  } catch (error) {
    throw new PauseStateError(file, error instanceof Error ? error.message : String(error));
  }
}

export function isPaused(repoName: string): boolean {
  return readPaused().has(repoName);
}

export async function setPaused(repoName: string, paused: boolean): Promise<Set<string>> {
  return withLock(resolve(globalHome(), '.lock'), async () => {
    const current: Set<string> = readPaused();
    if (paused) current.add(repoName);
    else current.delete(repoName);
    writeYaml(pauseFile(), Object.fromEntries([...current].map((name: string): [string, true] => [name, true])));
    return current;
  });
}

export async function pauseCommand(verb: PauseVerb, cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  const paused: boolean = verb === 'pause';
  await setPaused(repo.name, paused);
  console.log(`${repo.name} ${paused ? 'paused' : 'unpaused'}`);
}
