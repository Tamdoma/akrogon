import { cpSync, existsSync, readdirSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';
import { expandPath, toolRoot, within } from './config';
import { withLock } from './state';
import { writeYaml } from './shell';

const copiedEntries: string[] = [
  'held.yaml',
  'admission.lock',
  'paused.yaml',
  'stopped.yaml',
  '.lock',
  'reconcile-host.json',
  'reconcile',
  'runs',
];

// The liveness subset of admission.ts's record check, applied to the tool
// root's runs/ instead of globalHome()'s.
const liveness = z.looseObject({
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  state: z.enum(['live', 'ended']),
});

const bootId = (): string => readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();

function startTime(pid: number): string {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

function liveStartTime(pid: number): string | undefined {
  try {
    return startTime(pid);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

function liveRecords(runsDir: string): number {
  if (!existsSync(runsDir)) return 0;
  const boot: string = bootId();
  return readdirSync(runsDir)
    .filter((name) => name.endsWith('.yaml'))
    .flatMap((name): object[] => {
      try {
        const record = liveness.parse(Bun.YAML.parse(readFileSync(resolve(runsDir, name), 'utf8')));
        return record.state === 'live' && record.boot_id === boot && liveStartTime(record.pid) === record.start_time
          ? [record]
          : [];
      } catch {
        return [];
      }
    }).length;
}

// A process is foreign unless it is this process, an ancestor, or its own
// descendant — our held flock children share our cwd.
function parentPid(pid: number): number {
  try {
    const match: RegExpMatchArray | null = readFileSync(`/proc/${pid}/status`, 'utf8').match(/^PPid:\s*(\d+)$/m);
    return match === null ? 0 : Number(match[1]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0;
    throw error;
  }
}

function ownPids(): Set<number> {
  const pids: Set<number> = new Set([process.pid]);
  for (let pid: number = parentPid(process.pid); pid > 0; pid = parentPid(pid)) pids.add(pid);
  return pids;
}

function spawnedBySelf(pid: number): boolean {
  for (let cursor: number = pid; cursor > 0; cursor = parentPid(cursor))
    if (parentPid(cursor) === process.pid || cursor === process.pid) return true;
  return false;
}

function foreignProcess(root: string): boolean {
  const realRoot: string = realpathSync(root);
  const own: Set<number> = ownPids();
  for (const name of readdirSync('/proc')) {
    if (!/^\d+$/.test(name)) continue;
    const pid: number = Number(name);
    if (own.has(pid)) continue;
    let cmdline: string = '';
    let cwd: string | undefined;
    try {
      cmdline = readFileSync(`/proc/${name}/cmdline`, 'utf8');
    } catch {
      continue; // gone between scan and read
    }
    try {
      cwd = readlinkSync(`/proc/${name}/cwd`);
    } catch {
      cwd = undefined;
    }
    if (
      (cmdline.includes(root) || cmdline.includes(realRoot) || (cwd !== undefined && within(cwd, realRoot))) &&
      !spawnedBySelf(pid)
    )
      return true;
  }
  return false;
}

async function underLocks<T>(paths: string[], index: number, action: () => Promise<T>): Promise<T> {
  return index === paths.length
    ? action()
    : withLock(paths[index], () => underLocks(paths, index + 1, action));
}

export async function migrateStateHome(): Promise<void> {
  const stateHome: string = resolve(process.env.AKROGON_HOME ?? resolve(homedir(), '.akrogon'));
  const needed = (): boolean => !existsSync(resolve(stateHome, 'config.yaml'));
  if (stateHome === toolRoot || !needed() || !existsSync(resolve(toolRoot, 'config.yaml'))) return;
  const settled = (): boolean => liveRecords(resolve(toolRoot, 'runs')) === 0 && !foreignProcess(toolRoot);
  const move = async (): Promise<void> => {
    if (!needed() || !settled()) return;
    for (const entry of copiedEntries) {
      const source: string = resolve(toolRoot, entry);
      if (existsSync(source)) cpSync(source, resolve(stateHome, entry), { recursive: true });
    }
    if (!settled()) return;
    const config = z
      .looseObject({ repos: z.record(z.string(), z.string()).default({}) })
      .parse(Bun.YAML.parse(readFileSync(resolve(toolRoot, 'config.yaml'), 'utf8')));
    writeYaml(resolve(stateHome, 'config.yaml'), {
      ...config,
      repos: Object.fromEntries(Object.entries(config.repos).map(([name, path]) => [name, expandPath(path, toolRoot)])),
    });
    // stderr: the line must not pollute consumers of stdout (`config` YAML,
    // run-check output). Criterion 3 names a printed line, not a stream.
    console.error(`moved state home: ${toolRoot} -> ${stateHome}`);
  };
  // flock creates its file, so a missing .lock is left missing: the copied
  // checkout must stay clean for git status.
  const mainLock: string = resolve(toolRoot, '.lock');
  if (!existsSync(mainLock)) {
    await move();
    return;
  }
  await withLock(mainLock, async (): Promise<void> => {
    const locksDir: string = resolve(toolRoot, 'runs/locks');
    const sliceLocks: string[] = existsSync(locksDir)
      ? readdirSync(locksDir)
          .sort()
          .map((name) => resolve(locksDir, name))
      : [];
    await underLocks(sliceLocks, 0, move);
  });
}
