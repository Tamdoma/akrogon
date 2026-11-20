// /proc reads for the watch scripts: a process's start time (stat field 22, the same parse
// src/transcript.ts uses for procStart), an ancestor check by ppid walk, and a descendant check by
// ppid closure over every live process.
import { readdirSync, readFileSync } from 'node:fs';

function gone(error: unknown): boolean {
  const code: unknown = (error as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ESRCH';
}

// stat fields after the comm: index 0 = field 3 (state), 1 = field 4 (ppid), 19 = field 22 (starttime).
function statFields(pid: number): string[] | null {
  try {
    const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
    return stat.slice(stat.lastIndexOf(')') + 2).split(' ');
  } catch (error) {
    if (gone(error)) return null;
    throw error;
  }
}

// Null once the process is gone or a zombie: a killed foreground that its parent has not yet
// reaped keeps a readable /proc entry, and the pin rule treats that process as dead.
export function procStart(pid: number): string | null {
  const fields: string[] | null = statFields(pid);
  return fields === null || fields[0] === 'Z' ? null : fields[19];
}

export function procPpid(pid: number): number | null {
  const fields: string[] | null = statFields(pid);
  return fields === null ? null : Number(fields[1]);
}

// Walk pid's parent chain; true when ancestor appears on it (pid itself included).
export function isAncestor(ancestor: number, pid: number): boolean {
  let current: number | null = pid;
  for (let depth: number = 0; depth < 128 && current !== null; depth += 1) {
    if (current === ancestor) return true;
    if (current <= 1) return false;
    const ppid: number | null = procPpid(current);
    current = ppid === current ? null : ppid;
  }
  return false;
}

// True when pid sits in root's /proc descendant closure (root itself excluded).
export function isDescendant(pid: number, root: number): boolean {
  const children: Map<number, number[]> = new Map();
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    const ppid: number | null = procPpid(Number(entry));
    if (ppid === null) continue;
    const list: number[] = children.get(ppid) ?? [];
    list.push(Number(entry));
    children.set(ppid, list);
  }
  const queue: number[] = [root];
  const seen: Set<number> = new Set();
  while (queue.length > 0) {
    const next: number = queue.pop() ?? 0;
    for (const child of children.get(next) ?? []) {
      if (seen.has(child)) continue;
      if (child === pid) return true;
      seen.add(child);
      queue.push(child);
    }
  }
  return false;
}
