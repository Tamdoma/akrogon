import {
  closeSync,
  constants,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { isAbsolute, resolve } from 'node:path';
import { dlopen, read } from 'bun:ffi';
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
  | { kind: 'held'; token: string; wait_ms: number; release: () => void }
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

const GIB: number = 1024 * 1024 * 1024;
const LIMIT_GIB: number = 48;
const RUN_GIB: number = 16;
const POLL_MS: number = 5000;

const LOCK_EX: number = 2;
const O_CLOEXEC: number = 0o2000000;

const lib = dlopen('libc.so.6', {
  flock: { args: ['i32', 'i32'], returns: 'i32' },
  __errno_location: { args: [], returns: 'ptr' },
});

function cgroupRoot(): string {
  const override: string | undefined = process.env.AKROGON_CGROUP_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error('Invalid AKROGON_CGROUP_ROOT: must be a non-blank absolute path');
  return override ?? '/sys/fs/cgroup';
}

function spacingMs(): number {
  const override: string | undefined = process.env.AKROGON_SPACING_MS;
  if (override === undefined) return 30000;
  const ms: number = Number(override);
  if (override.trim() === '' || !Number.isInteger(ms) || ms < 0)
    throw new Error('Invalid AKROGON_SPACING_MS: must be a non-negative integer of milliseconds');
  return ms;
}

const slicePrefixDir = (): string =>
  resolve(
    cgroupRoot(),
    `user.slice/user-${process.getuid!()}.slice/user@${process.getuid!()}.service/akrogon.slice`,
  );
const statPath = (): string => resolve(slicePrefixDir(), 'memory.stat');
const runsDir = (): string => resolve(globalHome(), 'runs');
const lockPath = (): string => resolve(globalHome(), 'admission.lock');
const lastStartPath = (): string => resolve(runsDir(), 'last-start');
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

function statBytes(path: string): number {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const fields: Record<string, number> = {};
  for (const line of text.split('\n')) {
    const [key, value] = line.split(' ');
    if (key !== undefined && value !== undefined) fields[key] = Number(value);
  }
  if (!Number.isFinite(fields.anon) || !Number.isFinite(fields.shmem))
    throw new Error(`Missing anon or shmem in ${path}`);
  return fields.anon + fields.shmem;
}

function usage(): number {
  return statBytes(statPath());
}

const unitStatPath = (record: RunRecord): string =>
  resolve(
    slicePrefixDir(),
    ...(record.slice === 'akrogon.slice' ? [] : [record.slice]),
    record.unit,
    'memory.stat',
  );

// A unit without a readable stat counts 0 toward usage, so its run keeps the
// full 16 GiB reservation in denied().
function unitUsage(record: RunRecord): number {
  try {
    return statBytes(unitStatPath(record));
  } catch {
    return 0;
  }
}

function lastStart(): number | undefined {
  let raw: string;
  try {
    raw = readFileSync(lastStartPath(), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
  const ms: number = Number(raw.trim());
  return Number.isFinite(ms) ? ms : undefined;
}

// The 16 GiB a live run has not yet shown as unit usage stays reserved.
function peerReservations(boot: string): number {
  return liveRuns().reduce(
    (reserved, record) => reserved + Math.max(0, RUN_GIB * GIB - unitUsage(record)),
    0,
  );
}

// Called only while holding admission.lock; returns the wait reason or undefined to admit.
function denied(): string | undefined {
  const bytes: number = usage();
  const runs: number = peerReservations(bootId()) + RUN_GIB * GIB;
  if (bytes + runs >= LIMIT_GIB * GIB)
    return `anon+shmem ${bytes / GIB} GiB + runs ${runs / GIB} GiB >= ${LIMIT_GIB} GiB`;
  const last: number | undefined = lastStart();
  if (last !== undefined) {
    const spacing: number = spacingMs();
    const elapsed: number = Date.now() - last;
    if (elapsed < spacing) return `spacing ${Math.floor(elapsed / 1000)}s < ${spacing / 1000}s since last start`;
  }
  return undefined;
}

function lockFd(path: string): number {
  const fd: number = openSync(path, constants.O_RDWR | constants.O_CREAT | O_CLOEXEC, 0o600);
  if (lib.symbols.flock(fd, LOCK_EX) === 0) return fd;
  const errno: number = read.i32(lib.symbols.__errno_location()!, 0);
  closeSync(fd);
  throw new Error(`flock failed on ${path}: errno ${errno}`);
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
  const scopes: string[] = [...readFileSync(selfCgroup, 'utf8').matchAll(/\/([^/]+\.scope)/g)].map(
    (match) => match[1],
  );
  return scopes[scopes.length - 1] ?? '';
}

export async function withAdmission<T>(holder: AdmissionHolder, fn: (admission: Admission) => Promise<T>): Promise<T> {
  const inherited: string | undefined = process.env.AKROGON_RUN;
  if (inherited !== undefined && inherited !== '' && nested(inherited)) return fn({ kind: 'nested', token: inherited });
  mkdirSync(runsDir(), { recursive: true });
  const token: string = randomUUID();
  const ownHash: string = createHash('sha256').update(token).digest('hex');
  await sweepStale(
    new Set(
      [ownHash, ...(inherited === undefined || inherited === '' ? [] : [createHash('sha256').update(inherited).digest('hex')])],
    ),
  );
  const record: RunRecord = {
    token_hash: ownHash,
    pid: process.pid,
    start_time: startTime(process.pid),
    boot_id: bootId(),
    ...holder,
    state: 'waiting',
    since: new Date().toISOString(),
  };
  const begun: number = Date.now();
  try {
    writeRecord(record);
    for (;;) {
      const fd: number = lockFd(lockPath());
      let reason: string | undefined;
      try {
        reason = denied();
        if (reason === undefined) {
          writeFileSync(lastStartPath(), String(Date.now()));
          writeRecord({ ...record, state: 'live' });
        }
      } finally {
        closeSync(fd);
      }
      if (reason === undefined) {
        process.stdout.write(`run ${holder.run}\n`);
        let ended: boolean = false;
        return await fn({
          kind: 'held',
          token,
          wait_ms: Date.now() - begun,
          release: () => {
            if (!ended) writeRecord({ ...record, state: 'ended' });
            ended = true;
          },
        });
      }
      writeRecord({ ...record, wait_reason: reason });
      process.stderr.write(`akrogon: waiting to start ${holder.repo}/${holder.leaf} ${holder.check}: ${reason}\n`);
      await Bun.sleep(POLL_MS);
    }
  } finally {
    rmSync(recordPath(record.token_hash), { force: true });
  }
}
