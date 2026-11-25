import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dlopen, FFIType } from 'bun:ffi';

const libc = dlopen('libc.so.6', {
  setenv: { args: [FFIType.cstring, FFIType.cstring, FFIType.i32], returns: FFIType.i32 },
  unsetenv: { args: [FFIType.cstring], returns: FFIType.i32 },
});

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

export const SUITE_TIMEOUT_MS: number = 120_000;

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
// akrogon discovers hc sessions under XDG_RUNTIME_DIR: a test sees only the sessions it links in
// (tests/hc-fixture.ts), never the operator's. bus and systemd stay reachable for systemctl --user.
const suiteRuntime: string = join(suiteRoot, 'run');
mkdirSync(join(suiteRuntime, 'herdr-core'), { recursive: true });
for (const name of ['bus', 'systemd']) symlinkSync(`/run/user/${process.getuid!()}/${name}`, join(suiteRuntime, name));
setEnv('XDG_RUNTIME_DIR', suiteRuntime);
// run-check copies the caller's DISPLAY/XAUTHORITY/WAYLAND_DISPLAY. The suite must see the
// same display state whoever launched it (a desktop seat carries them, an SSH shell does not),
// so the preload unsets all three; tests that need one pass it explicitly in the CLI env.
// process.env writes alone do not reach libc getenv, so both are cleared.
for (const name of ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY']) {
  delete process.env[name];
  if (libc.symbols.unsetenv(name) !== 0) throw new Error(`unsetenv(${name}) failed`);
}
// git starts a detached `maintenance run --auto` after commit, fetch and a push's receive-pack,
// which adds and removes objects/maintenance.lock after the command returns. Every repo the suite
// inits or clones copies this template's config, bare remotes included, and linked worktrees share
// it, so no git starts maintenance even under an env that run-check, a seat or a service filters.
const gitTemplate: string = join(suiteRoot, 'git-template');
for (const name of ['hooks', 'info']) mkdirSync(join(gitTemplate, name), { recursive: true });
writeFileSync(join(gitTemplate, 'config'), '[maintenance]\n\tauto = false\n');
setEnv('GIT_TEMPLATE_DIR', gitTemplate);
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
