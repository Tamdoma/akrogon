import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome } from './config';
import { procRoot, runUnitBase, stopRunUnits } from './scope';

export interface AdmissionHolder {
  repo: string;
  leaf: string;
  check: string;
  run: string;
  slice: string;
  scope: string;
  unit: string;
}

export type Admission =
  | { kind: 'held'; token: string; wait_ms: number; record_path: string; release: () => void }
  | { kind: 'nested'; token: string };

const recordSchema = z.object({
  token_hash: z.string(),
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  repo: z.string(),
  leaf: z.string(),
  check: z.string(),
  state: z.enum(['waiting', 'live', 'ended']),
  run: z.string(),
  slice: z.string(),
  scope: z.string(),
  unit: z.string(),
  wait_reason: z.string().optional(),
  since: z.iso.datetime(),
});
export type RunRecord = z.infer<typeof recordSchema>;

const runsDir = (): string => resolve(globalHome(), 'runs');
const bootId = (): string => readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();

// Field 22 of /proc/<pid>/stat. The command name in field 2 may hold spaces, so split after the last ')'.
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

const recordPath = (hash: string): string => resolve(runsDir(), `${hash}.yaml`);

function writeRecord(record: RunRecord): void {
  const path: string = recordPath(record.token_hash);
  const temp: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, Bun.YAML.stringify(record));
  renameSync(temp, path);
}

function readRecord(path: string): RunRecord | undefined {
  try {
    return recordSchema.parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  } catch {
    return undefined;
  }
}

const live = (record: RunRecord, boot: string): boolean =>
  record.boot_id === boot && liveStartTime(record.pid) === record.start_time;

function nested(token: string): boolean {
  const hash: string = createHash('sha256').update(token).digest('hex');
  const record: RunRecord | undefined = readRecord(recordPath(hash));
  return record !== undefined && record.token_hash === hash && record.state === 'live' && live(record, bootId());
}

export function liveRuns(): RunRecord[] {
  const dir: string = runsDir();
  if (!existsSync(dir)) return [];
  const boot: string = bootId();
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .flatMap((name) => {
      const record: RunRecord | undefined = readRecord(resolve(dir, name));
      return record !== undefined && record.state === 'live' && live(record, boot) ? [record] : [];
    });
}

// Records whose writer is gone (or whose file is unreadable) are stale: drop
// the file and best-effort stop the units it left behind. Hashes in skip name
// records the caller still owns.
async function sweepStale(skip: ReadonlySet<string>): Promise<void> {
  const dir: string = runsDir();
  if (!existsSync(dir)) return;
  const boot: string = bootId();
  const units: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.yaml') || skip.has(name.slice(0, -'.yaml'.length))) continue;
    const path: string = resolve(dir, name);
    const record: RunRecord | undefined = readRecord(path);
    if (record !== undefined && live(record, boot)) continue;
    rmSync(path, { force: true });
    if (record !== undefined) units.push(record.unit, `${runUnitBase(record.run)}-guard.service`);
  }
  await stopRunUnits(...units);
}

export function waitingRuns(): RunRecord[] {
  const dir: string = runsDir();
  if (!existsSync(dir)) return [];
  const boot: string = bootId();
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .flatMap((name) => {
      const record: RunRecord | undefined = readRecord(resolve(dir, name));
      return record !== undefined && record.state === 'waiting' && live(record, boot) ? [record] : [];
    });
}

export function callerScope(): string {
  const token: string | undefined = process.env.AKROGON_RUN;
  if (token !== undefined && token !== '') {
    const hash: string = createHash('sha256').update(token).digest('hex');
    const record: RunRecord | undefined = readRecord(recordPath(hash));
    if (record !== undefined && live(record, bootId())) return record.scope;
  }
  const selfCgroup: string = resolve(procRoot(), 'self', 'cgroup');
  if (!existsSync(selfCgroup)) return '';
  const scopes: string[] = [...readFileSync(selfCgroup, 'utf8').matchAll(/\/([^/]+\.scope)/g)].map((match) => match[1]);
  return scopes[scopes.length - 1] ?? '';
}

// Admission registers the run and starts it at once: the memory reading, the
// 48 GiB limit, per-run reservations and the 30 s start spacing were dropped
// by the operator on 2026-10-14 (run-units brief criterion 5).
export async function withAdmission<T>(holder: AdmissionHolder, fn: (admission: Admission) => Promise<T>): Promise<T> {
  const inherited: string | undefined = process.env.AKROGON_RUN;
  if (inherited !== undefined && inherited !== '' && nested(inherited)) return fn({ kind: 'nested', token: inherited });
  mkdirSync(runsDir(), { recursive: true });
  const token: string = randomUUID();
  const ownHash: string = createHash('sha256').update(token).digest('hex');
  await sweepStale(
    new Set([
      ownHash,
      ...(inherited === undefined || inherited === '' ? [] : [createHash('sha256').update(inherited).digest('hex')]),
    ]),
  );
  const record: RunRecord = {
    token_hash: ownHash,
    pid: process.pid,
    start_time: startTime(process.pid),
    boot_id: bootId(),
    ...holder,
    state: 'live',
    since: new Date().toISOString(),
  };
  const begun: number = Date.now();
  try {
    writeRecord(record);
    process.stderr.write(`run ${holder.run}\n`);
    let ended: boolean = false;
    return await fn({
      kind: 'held',
      token,
      wait_ms: Date.now() - begun,
      record_path: recordPath(record.token_hash),
      release: () => {
        if (!ended) writeRecord({ ...record, state: 'ended' });
        ended = true;
      },
    });
  } finally {
    rmSync(recordPath(record.token_hash), { force: true });
  }
}
