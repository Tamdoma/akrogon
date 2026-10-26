import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, resolve } from 'node:path';
import { z } from 'zod';
import type { Repo } from './config';
import { CommandError, herdr, quote, run, spawnCaptured, type SpawnResult } from './shell';

export type ScopePlace =
  { place: 'inside' } | { place: 'outside'; cgroup: string } | { place: 'unreadable'; error: string };

export type Shell = { pid: number; start: string };

export function leafSlice(repo: Pick<Repo, 'name'>, slug: string): string {
  return `akrogon-l${createHash('sha256').update(`${repo.name}/${slug}`).digest('hex').slice(0, 12)}.slice`;
}

export function paneScope(slice: string, paneId: string, pid: number, start: string): string {
  return `${slice.replace(/\.slice$/, '')}-p${paneId.replace(/[^A-Za-z0-9]/g, '')}-${pid}-${start}.scope`;
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

async function shellPid(paneId: string, session: string): Promise<number> {
  return (
    await herdr(
      ['pane', 'process-info', '--pane', paneId],
      z.object({ process_info: z.object({ shell_pid: z.number().int().positive() }) }),
      { session },
    )
  ).process_info.shell_pid;
}

// Field 22 of /proc/<pid>/stat. The command name in field 2 may hold spaces, so split after the last ')'.
function startTime(pid: number): string {
  const stat: string = readFileSync(resolve(procRoot(), String(pid), 'stat'), 'utf8');
  return z.string().parse(
    stat
      .slice(stat.lastIndexOf(')') + 1)
      .trim()
      .split(' ')[19],
  );
}

export async function paneShell(paneId: string, session: string): Promise<Shell> {
  const pid: number = await shellPid(paneId, session);
  return { pid, start: startTime(pid) };
}

export async function adoptShell(slice: string, paneId: string, session: string, shell?: Shell): Promise<void> {
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  if (runtime === undefined || runtime.trim() === '')
    throw new Error('XDG_RUNTIME_DIR is required to reach the user systemd bus');
  const { pid, start }: Shell = shell ?? (await paneShell(paneId, session));
  const argv: string[] = [
    'busctl',
    '--user',
    'call',
    'org.freedesktop.systemd1',
    '/org/freedesktop/systemd1',
    'org.freedesktop.systemd1.Manager',
    'StartTransientUnit',
    'ssa(sv)a(sa(sv))',
    paneScope(slice, paneId, pid, start),
    'fail',
    '4',
    'PIDs',
    'au',
    '1',
    String(pid),
    'Slice',
    's',
    slice,
    'TimeoutStopUSec',
    't',
    '5000000',
    'SendSIGHUP',
    'b',
    'true',
    '0',
  ];
  const cwd: string = process.cwd();
  const result: SpawnResult = await spawnCaptured(argv, {
    cwd,
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: `unix:path=${runtime}/bus` },
  });
  if (result.code !== 0) throw new CommandError(argv, cwd, result);
}

function errnoMessage(error: unknown): string | undefined {
  return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.message : undefined;
}

export async function inOwnScope(
  slice: string,
  paneId: string,
  session: string,
  prior?: Shell,
): Promise<ScopePlace> {
  const pid: number = prior?.pid ?? (await shellPid(paneId, session));
  let start: string;
  let cgroup: string;
  try {
    start = startTime(pid);
    cgroup = readFileSync(resolve(procRoot(), String(pid), 'cgroup'), 'utf8').trim();
  } catch (error) {
    const message: string | undefined = errnoMessage(error);
    if (message === undefined) throw error;
    return { place: 'unreadable', error: message };
  }
  if (prior !== undefined && start !== prior.start)
    throw new Error(`Pane ${paneId} shell start changed: expected ${prior.start}, reads ${start}`);
  return cgroup.endsWith(`/${slice}/${paneScope(slice, paneId, pid, start)}`)
    ? { place: 'inside' }
    : { place: 'outside', cgroup };
}
