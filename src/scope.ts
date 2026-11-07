import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, resolve } from 'node:path';
import type { Repo } from './config';
import { CommandError, quote, spawnCaptured, type SpawnResult } from './shell';

export function leafSlice(repo: Pick<Repo, 'name'>, slug: string): string {
  return `akrogon-l${createHash('sha256').update(`${repo.name}/${slug}`).digest('hex').slice(0, 12)}.slice`;
}

export function runUnitBase(run: string): string {
  return `akrogon-run-${run}`;
}

export function runSlice(slice: string): string {
  const override: string | undefined = process.env.AKROGON_RUN_SLICE;
  if (override === undefined || override.trim() === '') return slice;
  if (!override.endsWith('.slice'))
    throw new Error(`Invalid AKROGON_RUN_SLICE: must be a *.slice name, got ${override}`);
  return override;
}

export function sessionBusAddress(): string {
  const address: string | undefined = process.env.DBUS_SESSION_BUS_ADDRESS;
  if (address !== undefined && address.trim() !== '') {
    const path: string | undefined = address.startsWith('unix:path=') ? address.slice('unix:path='.length) : undefined;
    if (path === undefined || existsSync(path)) return address;
  }
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  return `unix:path=${runtime !== undefined && runtime.trim() !== '' ? runtime : `/run/user/${process.getuid!()}`}/bus`;
}

export function runUnitArgv(slice: string, run: string, argv: string[], cutBus: string): string[] {
  return [
    'systemd-run',
    '--user',
    '--scope',
    '--quiet',
    '--expand-environment=no',
    `--unit=${runUnitBase(run)}`,
    `--slice=${slice}`,
    '-p',
    'TimeoutStopSec=5',
    '-p',
    'CollectMode=inactive-or-failed',
    '--',
    'env',
    `DBUS_SESSION_BUS_ADDRESS=${cutBus}`,
    ...argv,
  ];
}

// The guard tracks the wrapper pid: when the wrapper dies its finally can no
// longer run, so the guard drops the run record and stops the scope itself.
export async function startRunGuard(slice: string, run: string, wpid: number, recordPath: string): Promise<void> {
  const base: string = runUnitBase(run);
  const argv: string[] = [
    'systemd-run',
    '--user',
    '--quiet',
    `--unit=${base}-guard`,
    `--slice=${slice}`,
    '-p',
    'TimeoutStopSec=5',
    '-p',
    'CollectMode=inactive-or-failed',
    '--',
    'sh',
    '-c',
    `tail --pid=${wpid} -f /dev/null; rm -f ${quote(recordPath)}; exec systemctl --user stop ${base}.scope`,
  ];
  const cwd: string = process.cwd();
  const result: SpawnResult = await spawnCaptured(argv, {
    cwd,
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
  });
  if (result.code !== 0) throw new CommandError(argv, cwd, result);
}

// One call per unit: a single stop job fails whole when a unit name is not loaded.
// Callers may run under a check whose bus is cut, so the address is pinned.
export async function stopRunUnits(...units: string[]): Promise<void> {
  for (const unit of units)
    await spawnCaptured(['systemctl', '--user', 'stop', unit], {
      env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
    }).catch(() => undefined);
}

export function procRoot(): string {
  const override: string | undefined = process.env.AKROGON_PROC_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_PROC_ROOT: must be a non-blank absolute path`);
  return override ?? '/proc';
}

export function cgroupRoot(): string {
  const override: string | undefined = process.env.AKROGON_CGROUP_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_CGROUP_ROOT: must be a non-blank absolute path`);
  return override ?? '/sys/fs/cgroup';
}

// Slice names on the caller's own cgroup path: a pass inside a leaf slice sees
// that slice among its segments and must never stop it (finished-leaf-processes 6).
export function ownSlices(): Set<string> {
  const self: string = resolve(procRoot(), 'self', 'cgroup');
  if (!existsSync(self)) return new Set();
  return new Set([...readFileSync(self, 'utf8').matchAll(/\b([a-zA-Z0-9_.\-]+\.slice)\b/g)].map((match) => match[1]));
}
