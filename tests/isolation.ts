import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dlopen, FFIType } from 'bun:ffi';

const PR_SET_CHILD_SUBREAPER: number = 36;
const libc = dlopen('libc.so.6', {
  prctl: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.i32,
  },
  setenv: { args: [FFIType.cstring, FFIType.cstring, FFIType.i32], returns: FFIType.i32 },
  waitpid: { args: [FFIType.i32, FFIType.ptr, FFIType.i32], returns: FFIType.i32 },
});
if (libc.symbols.prctl(PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0) !== 0)
  throw new Error('prctl(PR_SET_CHILD_SUBREAPER) failed');

export const suiteRoot: string = mkdtempSync(join(tmpdir(), 'akrogon-suite-'));

// process.env writes alone do not reach libc getenv (os.homedir, tmpdir), so both are set.
function setEnv(name: string, value: string): void {
  process.env[name] = value;
  if (libc.symbols.setenv(name, value, 1) !== 0) throw new Error(`setenv(${name}) failed`);
}
setEnv('HOME', join(suiteRoot, 'home'));
setEnv('AKROGON_LEAF_TEMP_ROOT', join(suiteRoot, 'leaf-temp'));
setEnv('TMPDIR', suiteRoot);
mkdirSync(process.env.HOME!, { recursive: true });
mkdirSync(process.env.AKROGON_LEAF_TEMP_ROOT!, { recursive: true });

// The kernel exposes children only per thread at /proc/<pid>/task/<tid>/children.
export function descendantsOf(root: number = process.pid): number[] {
  const found: { pid: number; depth: number }[] = [];
  const queue: { pid: number; depth: number }[] = [{ pid: root, depth: 0 }];
  for (let i: number = 0; i < queue.length; i += 1) {
    const { pid, depth }: { pid: number; depth: number } = queue[i];
    let tids: string[];
    try {
      tids = readdirSync(`/proc/${pid}/task`);
    } catch {
      continue;
    }
    for (const tid of tids) {
      let listing: string;
      try {
        listing = readFileSync(`/proc/${pid}/task/${tid}/children`, 'utf8');
      } catch {
        continue;
      }
      for (const part of listing.trim().split(' ').filter(Boolean)) {
        const child: number = Number(part);
        found.push({ pid: child, depth: depth + 1 });
        queue.push({ pid: child, depth: depth + 1 });
      }
    }
  }
  return found.sort((a, b) => b.depth - a.depth).map((entry) => entry.pid);
}

export function sweepSuite(): void {
  for (let pass: number = 0; pass < 2; pass += 1) {
    for (const pid of descendantsOf()) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
      }
      // Reap if it is our child: adopted orphans and killed children become zombies under
      // this subreaper and otherwise survive in /proc. ECHILD for non-children is ignored.
      libc.symbols.waitpid(pid, null, 0);
    }
  }
  const survivors: number[] = descendantsOf();
  if (survivors.length > 0) throw new Error(`sweepSuite: descendants survived SIGKILL: ${survivors.join(', ')}`);
}

process.on('exit', () => {
  try {
    sweepSuite();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  }
  rmSync(suiteRoot, { recursive: true, force: true });
});
