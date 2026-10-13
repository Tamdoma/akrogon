import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isAbsolute, resolve } from 'node:path';
import { z } from 'zod';
import type { Repo } from './config';
import { CommandError, herdr, spawnCaptured, type SpawnResult } from './shell';

export type ScopePlace = { place: 'inside' } | { place: 'outside'; cgroup: string } | { place: 'unreadable'; error: string };

type Shell = { pid: number; start: string };

export function leafSlice(repo: Pick<Repo, 'name'>, slug: string): string {
  return `akrogon-l${createHash('sha256').update(`${repo.name}/${slug}`).digest('hex').slice(0, 12)}.slice`;
}

export function paneScope(slice: string, paneId: string, pid: number, start: string): string {
  return `${slice.replace(/\.slice$/, '')}-p${paneId.replace(/[^A-Za-z0-9]/g, '')}-${pid}-${start}.scope`;
}

export function procRoot(): string {
  const override: string | undefined = process.env.AKROGON_PROC_ROOT;
  if (override !== undefined && (override.trim() === '' || !isAbsolute(override)))
    throw new Error(`Invalid AKROGON_PROC_ROOT: must be a non-blank absolute path`);
  return override ?? '/proc';
}

async function shellPid(paneId: string): Promise<number> {
  return (
    await herdr(
      ['pane', 'process-info', '--pane', paneId],
      z.object({ process_info: z.object({ shell_pid: z.number().int().positive() }) }),
    )
  ).process_info.shell_pid;
}

// Field 22 of /proc/<pid>/stat. The command name in field 2 may hold spaces, so split after the last ')'.
function startTime(pid: number): string {
  const stat: string = readFileSync(resolve(procRoot(), String(pid), 'stat'), 'utf8');
  return z.string().parse(stat.slice(stat.lastIndexOf(')') + 1).trim().split(' ')[19]);
}

async function shell(paneId: string): Promise<Shell> {
  const pid: number = await shellPid(paneId);
  return { pid, start: startTime(pid) };
}

export async function adoptShell(slice: string, paneId: string): Promise<void> {
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  if (runtime === undefined || runtime.trim() === '')
    throw new Error('XDG_RUNTIME_DIR is required to reach the user systemd bus');
  const { pid, start }: Shell = await shell(paneId);
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

export async function inOwnScope(slice: string, paneId: string): Promise<ScopePlace> {
  const pid: number = await shellPid(paneId);
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
  return cgroup.endsWith(`/${slice}/${paneScope(slice, paneId, pid, start)}`)
    ? { place: 'inside' }
    : { place: 'outside', cgroup };
}
