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

export interface AdmissionHolder {
  repo: string;
  leaf: string;
  check: string;
}

export type Admission = { kind: 'held'; token: string; wait_ms: number } | { kind: 'nested'; token: string };

const recordSchema = z.object({
  token_hash: z.string(),
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  repo: z.string(),
  leaf: z.string(),
  check: z.string(),
  state: z.enum(['waiting', 'live']),
  wait_reason: z.string().optional(),
  since: z.iso.datetime(),
});
export type RunRecord = z.infer<typeof recordSchema>;

const GIB: number = 1024 * 1024 * 1024;
const LIMIT_GIB: number = 48;
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
  if (!Number.isInteger(ms) || ms < 0)
    throw new Error('Invalid AKROGON_SPACING_MS: must be a non-negative integer of milliseconds');
  return ms;
}

const statPath = (): string =>
  resolve(
    cgroupRoot(),
    `user.slice/user-${process.getuid!()}.slice/user@${process.getuid!()}.service/akrogon.slice/memory.stat`,
  );
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

function usage(): number {
  const path: string = statPath();
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

// Called only while holding admission.lock; returns the wait reason or undefined to admit.
function denied(): string | undefined {
  const bytes: number = usage();
  if (bytes >= LIMIT_GIB * GIB) return `anon+shmem ${bytes / GIB} GiB >= ${LIMIT_GIB} GiB`;
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

export async function withAdmission<T>(holder: AdmissionHolder, fn: (admission: Admission) => Promise<T>): Promise<T> {
  const inherited: string | undefined = process.env.AKROGON_RUN;
  if (inherited !== undefined && inherited !== '' && nested(inherited)) return fn({ kind: 'nested', token: inherited });
  mkdirSync(runsDir(), { recursive: true });
  const token: string = randomUUID();
  const record: RunRecord = {
    token_hash: createHash('sha256').update(token).digest('hex'),
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
      if (reason === undefined) return await fn({ kind: 'held', token, wait_ms: Date.now() - begun });
      writeRecord({ ...record, wait_reason: reason });
      process.stderr.write(`akrogon: waiting to start ${holder.repo}/${holder.leaf} ${holder.check}: ${reason}\n`);
      await Bun.sleep(POLL_MS);
    }
  } finally {
    rmSync(recordPath(record.token_hash), { force: true });
  }
}
