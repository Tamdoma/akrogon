import { mkdtempSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
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

// bun test never runs process 'exit' handlers, so each worker removes the roots of workers that have exited.
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false;
    if ((error as NodeJS.ErrnoException).code === 'EPERM') return true;
    throw error;
  }
}
for (const name of readdirSync(tmpdir())) {
  const owner: RegExpExecArray | null = /^akrogon-suite-(\d+)-/.exec(name);
  if (owner === null || alive(Number(owner[1]))) continue;
  // The rename claims the root under this pid, so a worker starting at the same time skips it.
  const claimed: string = join(tmpdir(), `akrogon-suite-${process.pid}-removing-${name}`);
  try {
    renameSync(join(tmpdir(), name), claimed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
    throw error;
  }
  // A test cut off at its cap can leave a folder at mode 0 (batch-dispatch unreadable-folder case).
  const opened: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['chmod', '-R', 'u+rwx', claimed], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (opened.exitCode !== 0)
    throw new Error(`chmod ${claimed} failed (${opened.exitCode}): ${opened.stderr.toString()}`);
  rmSync(claimed, { recursive: true, force: true });
}

export const suiteRoot: string = mkdtempSync(join(tmpdir(), `akrogon-suite-${process.pid}-`));

// process.env writes alone do not reach libc getenv (os.homedir, tmpdir), so both are set.
function setEnv(name: string, value: string): void {
  process.env[name] = value;
  if (libc.symbols.setenv(name, value, 1) !== 0) throw new Error(`setenv(${name}) failed`);
}
setEnv('HOME', join(suiteRoot, 'home'));
setEnv('AKROGON_LEAF_TEMP_ROOT', join(suiteRoot, 'leaf-temp'));
setEnv('AKROGON_RETIRED_TEMP_ROOT', join(suiteRoot, 'retired-temp'));
setEnv('TMPDIR', suiteRoot);
mkdirSync(process.env.HOME!, { recursive: true });
mkdirSync(process.env.AKROGON_LEAF_TEMP_ROOT!, { recursive: true });

// akrogon calls herdr about 25 times per `next`; a bytecode bundle halves the CPU of `bun fake-herdr.ts`.
export const fakeHerdrBin: string = join(suiteRoot, 'fake-herdr', 'fake-herdr.js');
const built: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(
  [
    process.execPath,
    'build',
    join(import.meta.dir, 'fake-herdr.ts'),
    '--target=bun',
    '--bytecode',
    '--outdir',
    join(suiteRoot, 'fake-herdr'),
  ],
  { cwd: suiteRoot, stdout: 'pipe', stderr: 'pipe' },
);
if (built.exitCode !== 0) throw new Error(`fake herdr build failed (${built.exitCode}): ${built.stderr.toString()}`);

export const fakeBusctlBin: string = join(suiteRoot, 'fake-busctl', 'fake-busctl.js');
const builtBusctl: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(
  [
    process.execPath,
    'build',
    join(import.meta.dir, 'fake-busctl.ts'),
    '--target=bun',
    '--bytecode',
    '--outdir',
    join(suiteRoot, 'fake-busctl'),
  ],
  { cwd: suiteRoot, stdout: 'pipe', stderr: 'pipe' },
);
if (builtBusctl.exitCode !== 0)
  throw new Error(`fake busctl build failed (${builtBusctl.exitCode}): ${builtBusctl.stderr.toString()}`);

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
