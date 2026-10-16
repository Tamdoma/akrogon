import { cpSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';
import { expandPath, toolRoot } from './config';
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

export async function migrateStateHome(): Promise<void> {
  const stateHome: string = resolve(process.env.AKROGON_HOME ?? resolve(homedir(), '.akrogon'));
  const needed = (): boolean => !existsSync(resolve(stateHome, 'config.yaml'));
  if (stateHome === toolRoot || !needed() || !existsSync(resolve(toolRoot, 'config.yaml'))) return;
  const settled = (): boolean => liveRecords(resolve(toolRoot, 'runs')) === 0;
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
  await withLock(resolve(toolRoot, '.lock'), () => withLock(resolve(toolRoot, 'admission.lock'), move));
}
