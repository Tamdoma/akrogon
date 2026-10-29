#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { failureText, run, type Herdr } from './peer-restart';

const processInfoSchema = z.object({
  result: z.object({
    process_info: z.object({ shell_pid: z.number() }),
  }),
});

function envValue(name: string): string {
  const value: string | undefined = process.env[name];
  return value === undefined || value.trim() === '' ? 'unset' : value;
}

// Field 4 of /proc/<pid>/stat; the command name in field 2 may hold spaces, so split after the
// last ')' and take index 1. The real /proc is read always, never AKROGON_PROC_ROOT.
function parentPid(pid: number): number | null {
  let stat: string;
  try {
    stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
  } catch {
    return null;
  }
  const ppid: number = Number(
    stat
      .slice(stat.lastIndexOf(')') + 1)
      .trim()
      .split(' ')[1],
  );
  return Number.isInteger(ppid) && ppid > 0 ? ppid : null;
}

// The anchor check every peer script runs first: the inherited HERDR_PANE_ID must name a pane
// whose shell_pid is an ancestor of this process, so a stray env can never act on a pane the
// caller is not running inside.
export function verifyAnchor(): string {
  const pane: string | undefined = process.env.HERDR_PANE_ID;
  if (pane === undefined || pane.trim() === '') {
    throw new Error(
      `HERDR_PANE_ID=${envValue('HERDR_PANE_ID')} HERDR_SOCKET_PATH=${envValue('HERDR_SOCKET_PATH')}: HERDR_PANE_ID must name the pane this process runs in`,
    );
  }
  const info: Herdr = run(['pane', 'process-info', '--pane', pane]);
  if (!info.ok) {
    throw new Error(`HERDR_PANE_ID=${pane} HERDR_SOCKET_PATH=${envValue('HERDR_SOCKET_PATH')}: ${failureText(info)}`);
  }
  let answer: unknown;
  try {
    answer = JSON.parse(info.stdout);
  } catch {
    answer = undefined;
  }
  const parsed: z.ZodSafeParseResult<z.infer<typeof processInfoSchema>> = processInfoSchema.safeParse(answer);
  if (!parsed.success) {
    throw new Error(
      `HERDR_PANE_ID=${pane} HERDR_SOCKET_PATH=${envValue('HERDR_SOCKET_PATH')}: unparseable pane process-info answer: ${info.stdout}`,
    );
  }
  const shellPid: number = parsed.data.result.process_info.shell_pid;
  let pid: number = process.pid;
  const seen: Set<number> = new Set([pid]);
  while (pid !== shellPid) {
    const ppid: number | null = parentPid(pid);
    if (ppid === null || ppid <= 1 || seen.has(ppid)) {
      throw new Error(
        `HERDR_PANE_ID=${pane} HERDR_SOCKET_PATH=${envValue('HERDR_SOCKET_PATH')}: pane shell_pid ${shellPid} is not an ancestor of pid ${process.pid}`,
      );
    }
    seen.add(ppid);
    pid = ppid;
  }
  return pane;
}

if (import.meta.main) {
  try {
    process.stdout.write(`${verifyAnchor()}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
