import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import type { Repo } from './config';
import { CommandError, spawnCaptured, type SpawnResult } from './shell';

export function leafSlice(repo: Pick<Repo, 'name'>, slug: string, home: string): string {
  const key: string =
    resolve(home) === resolve(homedir(), '.akrogon') ? `${repo.name}/${slug}` : `${resolve(home)}:${repo.name}/${slug}`;
  return `akrogon-l${createHash('sha256').update(key).digest('hex').slice(0, 12)}.slice`;
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
  return `unix:path=${runtimeDir()}/bus`;
}

export function runtimeDir(): string {
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  return runtime !== undefined && runtime.trim() !== '' ? runtime : `/run/user/${process.getuid!()}`;
}

// The env for a systemctl child: the pinned bus and the runtime directory it was found in,
// so a blank XDG_RUNTIME_DIR never reaches systemctl.
export function sessionBusEnv(): NodeJS.ProcessEnv {
  return { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress(), XDG_RUNTIME_DIR: runtimeDir() };
}

// The launcher runs with the pinned bus and runtime directory; inside the scope the payload gets
// back its cut bus and its own XDG_RUNTIME_DIR value, or none when it had none.
export function runUnitArgv(
  slice: string,
  run: string,
  argv: string[],
  cutBus: string,
  runtime: string | undefined,
): string[] {
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
    // Stopped in one call (stop-run, a slice stop), the scope goes before its
    // guard, so the guard's TMPDIR cleanup never races the dying command.
    '-p',
    `After=${runUnitBase(run)}-guard.service`,
    // A guard stopped before the scope starts (akrogon stop racing the launch)
    // fails the scope's start instead of letting the command run unguarded.
    '-p',
    `Requisite=${runUnitBase(run)}-guard.service`,
    '--',
    'env',
    ...(runtime === undefined ? ['-u', 'XDG_RUNTIME_DIR'] : [`XDG_RUNTIME_DIR=${runtime}`]),
    `DBUS_SESSION_BUS_ADDRESS=${cutBus}`,
    ...argv,
  ];
}

// The guard tracks the wrapper pid: when the wrapper dies its finally can no
// longer run, so the guard stops the scope itself. The run record stays: it
// is live while the scope's cgroup holds a process, whatever the stop did.
// A RAM TMPDIR goes when the guard stops, however the run ends. Directories
// lacking u+rwx regain it first (top down, so a dir without search permission
// is opened before find descends; one chmod per such dir only, so a large tree
// fits the stop timeout) so rm can empty them; files are never touched, since a
// hard link inside may share its mode with a file outside. A gone folder fails
// find, which is ignored.
export async function startRunGuard(slice: string, run: string, wpid: number, tmp: string | undefined): Promise<void> {
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
    ...(tmp === undefined
      ? []
      : [
          '-p',
          `ExecStopPost=-find ${tmp} -type d ! -perm -u=rwx -exec chmod u+rwx {} ;`,
          '-p',
          `ExecStopPost=rm -rf ${tmp}`,
        ]),
    '--',
    'sh',
    '-c',
    `tail --pid=${wpid} -f /dev/null; exec systemctl --user stop ${base}.scope`,
  ];
  const cwd: string = process.cwd();
  const result: SpawnResult = await spawnCaptured(argv, {
    cwd,
    env: sessionBusEnv(),
  });
  if (result.code !== 0) throw new CommandError(argv, cwd, result);
}

// A unit to stop, with the read that tells a refused stop from a unit already gone.
export type RunUnit = { unit: string; gone: () => boolean };

// One call per unit: a single stop job fails whole when a unit name is not loaded.
// Callers may run under a check whose bus is cut, so the address is pinned. Every
// unit is tried; a failed stop is excused only when the unit's gone read says so.
// Otherwise the first stop error throws once all units were tried.
export async function stopRunUnits(...units: RunUnit[]): Promise<void> {
  const env: NodeJS.ProcessEnv = sessionBusEnv();
  const failed: CommandError[] = [];
  for (const { unit, gone } of units) {
    const argv: string[] = ['systemctl', '--user', 'stop', unit];
    const result: SpawnResult = await spawnCaptured(argv, { env });
    if (result.code !== 0 && !gone()) failed.push(new CommandError(argv, process.cwd(), result));
  }
  if (failed.length > 0) throw failed[0];
}

// A slice's cgroup under the user manager. The root slice -.slice is the
// manager's own cgroup; others nest by name: a-b-c.slice lives at
// a.slice/a-b.slice/a-b-c.slice.
export function sliceCgroup(slice: string): string {
  const uid: number = process.getuid!();
  const parts: string[] = slice === '-.slice' ? [] : slice.replace(/\.slice$/, '').split('-');
  return resolve(
    cgroupRoot(),
    `user.slice/user-${uid}.slice/user@${uid}.service`,
    ...parts.map((_: string, index: number): string => `${parts.slice(0, index + 1).join('-')}.slice`),
  );
}

// The kernel's own count: populated while any process of the unit, children
// included, is left in its cgroup. A cgroup that is gone holds none.
export function unitPopulated(slice: string, unit: string): boolean {
  try {
    return readFileSync(resolve(sliceCgroup(slice), unit, 'cgroup.events'), 'utf8')
      .split('\n')
      .includes('populated 1');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

// A unit inside a slice, gone once its cgroup holds no process.
export const sliceUnit = (slice: string, unit: string): RunUnit => ({
  unit,
  gone: (): boolean => !unitPopulated(slice, unit),
});

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
