import { closeSync, constants, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { dlopen, read } from 'bun:ffi';
import { z } from 'zod';
import { globalHome } from './config';

export interface PermitHolder {
  repo: string;
  leaf: string;
  check: string;
}

export type Admission = { kind: 'held'; token: string; wait_ms: number } | { kind: 'nested'; token: string };

const holderSchema = z.object({
  token: z.string(),
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  repo: z.string(),
  leaf: z.string(),
  check: z.string(),
  started: z.iso.datetime(),
});
export type HolderRecord = z.infer<typeof holderSchema>;

const LOCK_EX: number = 2;
const LOCK_NB: number = 4;
const EWOULDBLOCK: number = 11;
const O_CLOEXEC: number = 0o2000000;

const lib = dlopen('libc.so.6', {
  flock: { args: ['i32', 'i32'], returns: 'i32' },
  __errno_location: { args: [], returns: 'ptr' },
});

const lockPath = (): string => resolve(globalHome(), 'run.lock');
const sidecarPath = (): string => resolve(globalHome(), 'run-holder.yaml');
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

function readHolder(): HolderRecord | undefined {
  try {
    return holderSchema.parse(Bun.YAML.parse(readFileSync(sidecarPath(), 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export function liveHolder(): HolderRecord | undefined {
  const holder: HolderRecord | undefined = readHolder();
  if (holder === undefined) return undefined;
  return liveStartTime(holder.pid) === holder.start_time && bootId() === holder.boot_id ? holder : undefined;
}

function waitLine(): string {
  const holder: HolderRecord | undefined = liveHolder();
  return holder === undefined
    ? 'akrogon: waiting for run permit held by holder unknown\n'
    : `akrogon: waiting for run permit held by ${holder.repo}/${holder.leaf} ${holder.check} pid ${holder.pid}\n`;
}

async function acquire(path: string): Promise<{ fd: number; wait_ms: number }> {
  const fd: number = openSync(path, constants.O_RDWR | constants.O_CREAT | O_CLOEXEC, 0o600);
  const begun: number = Date.now();
  for (let polls: number = 0; ; polls++) {
    if (lib.symbols.flock(fd, LOCK_EX | LOCK_NB) === 0) return { fd, wait_ms: Date.now() - begun };
    const errno: number = read.i32(lib.symbols.__errno_location()!, 0);
    if (errno !== EWOULDBLOCK) {
      closeSync(fd);
      throw new Error(`flock failed on ${path}: errno ${errno}`);
    }
    if (polls === 0) process.stderr.write(waitLine());
    await Bun.sleep(250);
  }
}

export async function withPermit<T>(holder: PermitHolder, fn: (admission: Admission) => Promise<T>): Promise<T> {
  const inherited: string | undefined = process.env.AKROGON_RUN;
  if (inherited !== undefined && inherited !== '' && inherited === liveHolder()?.token)
    return fn({ kind: 'nested', token: inherited });
  const { fd, wait_ms } = await acquire(lockPath());
  const sidecar: string = sidecarPath();
  try {
    const record: HolderRecord = {
      token: randomUUID(),
      pid: process.pid,
      start_time: startTime(process.pid),
      boot_id: bootId(),
      ...holder,
      started: new Date().toISOString(),
    };
    const temp: string = `${sidecar}.${process.pid}.tmp`;
    writeFileSync(temp, Bun.YAML.stringify(record));
    renameSync(temp, sidecar);
    return await fn({ kind: 'held', token: record.token, wait_ms });
  } finally {
    rmSync(sidecar, { force: true });
    closeSync(fd);
  }
}
