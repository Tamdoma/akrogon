import {
  accessSync,
  chmodSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  statSync,
  writeFileSync,
  constants,
  existsSync,
} from 'node:fs';
import { basename, resolve } from 'node:path';
import { homePath, toolRoot, type Repo } from './config';
import { cgroupRoot, leafSlice, procRoot, sliceCgroup } from './scope';
import { appendTiming } from './timing';

// The leaf's tool-cgroup machinery: the entry scripts shells are placed through,
// the relocation every akrogon process runs out of a t-, the commitMove kill
// sweep and the detached helper that ends a deferred t- once its shell exits.

// The group redirects before tracing its first command. Temporarily close a
// custom trace descriptor too, then disable xtrace before the group restores
// the descriptors. If BASH_XTRACEFD is unset, use the ordinary stderr group.
function placementShell(root: string): string {
  return [
    '__akrogon_tool_entry() {',
    '  __akrogon_tool_options=$SHELLOPTS',
    '  set +x',
    '  [ -n "${AKROGON_SEAT_CGROUP:-}" ] || return 0',
    // The seat's own process (a bash-script launcher execed by the launch hop) is never a tool shell.
    '  [ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0',
    '  local cur',
    "  cur=$(sed -n 's/^0:://p' /proc/self/cgroup 2>/dev/null) || return 0",
    `  [ "${root}$cur" = "$AKROGON_SEAT_CGROUP" ] || return 0`,
    '  mkdir -p "$AKROGON_SEAT_CGROUP/tools" || return 0',
    '  local st',
    '  st=$(cat /proc/$$/stat 2>/dev/null) || return 0',
    '  st=${st##*) }',
    '  set -- $st',
    '  local d="$AKROGON_SEAT_CGROUP/tools/t-$$-${20}"',
    '  mkdir -p "$d" && echo $$ > "$d/cgroup.procs" && export AKROGON_TOOL_CGROUP="$d"',
    '  return 0',
    '}',
    '{ __akrogon_tool_entry; } >/dev/null 2>&1 {BASH_XTRACEFD}>&- ||',
    '  { __akrogon_tool_entry; } >/dev/null 2>&1',
    'unset -f __akrogon_tool_entry',
    '',
  ].join('\n');
}

function entryTemplate(root: string, bash: string): { env: string; wrapper: string } {
  const placement: string = placementShell(root);
  return {
    // Rebind Bash's trace stream after the descriptor was closed and restored.
    env: [
      placement,
      'case :$__akrogon_tool_options: in',
      '  *:xtrace:*)',
      '    if [[ -n ${BASH_XTRACEFD:-} ]]; then BASH_XTRACEFD=$BASH_XTRACEFD; fi',
      '    unset __akrogon_tool_options',
      '    set -x ;;',
      '  *) unset __akrogon_tool_options ;;',
      'esac',
      '',
    ].join('\n'),
    // Restore inherited xtrace via the environment so long options keep their order.
    wrapper: [
      `#!${bash}`,
      placement,
      'case :$__akrogon_tool_options: in',
      `  *:xtrace:*) exec /usr/bin/env "SHELLOPTS=$__akrogon_tool_options" "${bash}" "$@" ;;`,
      'esac',
      `exec "${bash}" "$@"`,
      '',
    ].join('\n'),
  };
}

function writeAtomic(path: string, content: string, mode: number): void {
  const temp: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, content);
  chmodSync(temp, mode);
  renameSync(temp, path);
}

// A PATH entry naming the seat entry directory, by resolved path or realpath.
export function isToolEntryDir(dir: string, home: string): boolean {
  const entryDir: string = resolve(home, 'tool-entry');
  const realEntry: string | undefined = existsSync(entryDir) ? realpathSync(entryDir) : undefined;
  return resolve(dir) === entryDir || (realEntry !== undefined && existsSync(dir) && realpathSync(dir) === realEntry);
}

// The real bash resolved once per refresh: PATH entries inside the entry
// directory itself are filtered out so the wrapper can never resolve to
// itself; anything unreadable falls back to /usr/bin/bash.
function realBash(home: string): string {
  const candidates: string[] = [];
  for (const dir of (process.env.PATH ?? '').split(':')) {
    if (dir === '' || isToolEntryDir(dir, home)) continue;
    candidates.push(resolve(dir, 'bash'));
  }
  candidates.push('/usr/bin/bash');
  for (const candidate of candidates) {
    try {
      return realpathSync(candidate);
    } catch {
      // absent or unreadable entry: try the next
    }
  }
  return '/usr/bin/bash';
}

// Both entry files beside each other, replaced atomically so a live seat never
// reads a torn file. The wrapper is executable; the sourced form need not be.
export function refreshToolEntry(home: string): void {
  const dir: string = resolve(home, 'tool-entry');
  mkdirSync(dir, { recursive: true });
  const rendered: { env: string; wrapper: string } = entryTemplate(cgroupRoot(), realBash(home));
  writeAtomic(resolve(dir, 'bash'), rendered.wrapper, 0o755);
  writeAtomic(resolve(dir, 'bash-env'), rendered.env, 0o644);
}

const toolNamePattern: RegExp = /^t-(\d+)-(\d+)$/;

type Relocation = { scopeDir: string; t: string };

// The seat scope and the t- name of the caller's own cgroup, read through the
// proc boundary: inside tools/t-<pid>-<start> the t- is that directory; inside
// the scope's akrogon/ the inherited marker names it. Anywhere else nothing.
export function ownToolCgroup(): Relocation | null {
  const self: string = resolve(procRoot(), 'self', 'cgroup');
  if (!existsSync(self)) return null;
  let content: string;
  try {
    content = readFileSync(self, 'utf8');
  } catch {
    return null;
  }
  const kernelPath: string | undefined = content
    .split('\n')
    .find((line) => line.startsWith('0::'))
    ?.slice(3)
    .trim();
  if (kernelPath === undefined) return null;
  const inTool: RegExpMatchArray | null = kernelPath.match(/^(.*)\/tools\/(t-[^/]+)(\/|$)/);
  if (inTool !== null) return { scopeDir: resolve(cgroupRoot(), `.${inTool[1]}`), t: inTool[2] };
  const inAkrogon: RegExpMatchArray | null = kernelPath.match(/^(.*)\/akrogon(\/|$)/);
  const marker: string | undefined = process.env.AKROGON_TOOL_CGROUP;
  if (inAkrogon !== null && marker !== undefined) {
    const name: string = basename(marker);
    if (toolNamePattern.test(name)) return { scopeDir: resolve(cgroupRoot(), `.${inAkrogon[1]}`), t: name };
  }
  return null;
}

// Every akrogon process leaves the t- it started in before it touches any lock
// or record: a kill that lands after this move never ends a committed move
// mid-record. The target is created recursively; a failed move throws loudly
// because the process is still inside the killable t-.
export function relocateFromToolCgroup(): void {
  const own: Relocation | null = ownToolCgroup();
  if (own === null) return;
  const target: string = resolve(own.scopeDir, 'akrogon', own.t);
  mkdirSync(target, { recursive: true });
  writeFileSync(resolve(target, 'cgroup.procs'), `${process.pid}\n`);
}

// The kernel's own count on a directory: unreadable or absent counts unpopulated.
function populated(dir: string): boolean {
  try {
    return readFileSync(resolve(dir, 'cgroup.events'), 'utf8').split('\n').includes('populated 1');
  } catch {
    return false;
  }
}

function warn(slug: string, unit: string, t: string, error: unknown): void {
  console.warn(
    JSON.stringify({
      warning: 'tool_kill',
      leaf: slug,
      unit,
      t,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}

// cgroup.kill reaps asynchronously, so a rmdir that fails while the cgroup
// still reads populated 1 is the routine reaping race: silent, removal
// converges over later commits. A failure while the cgroup reads populated 0
// (or its events are unreadable) has nothing left to reap, so the failure is
// real and reports through the caller. ENOENT is a concurrent pass having
// already removed the directory — success in effect, never a warning.
function rmdirOrReport(path: string, report: (error: unknown) => void): void {
  try {
    rmdirSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    if (populated(path)) return;
    report(error);
  }
}

// The first match in PATH, executable or not: a non-executable first entry is
// the failure the caller must see, since posix_spawnp would hit it too. Bun's
// child-shim hides exec failures behind an async exit, so executability is
// checked here where it can throw.
function resolveExecutable(name: string): string {
  for (const dir of (process.env.PATH ?? '').split(':')) {
    if (dir === '') continue;
    const candidate: string = resolve(dir, name);
    if (!existsSync(candidate)) continue;
    accessSync(candidate, constants.X_OK);
    return candidate;
  }
  throw new Error(`Executable not found in $PATH: "${name}"`);
}

// One detached helper per deferred t-: setsid, the running akrogon entry, stdio
// ignored, the t- marker scrubbed, no handle kept. The spawned pid is the final
// helper pid (setsid without --fork: a Bun child is never a process-group
// leader), which is what lands in helpers/<t>/cgroup.procs. ESRCH there means
// the helper already exited, which its own row records.
function spawnHelper(
  repoName: string,
  repoRoot: string,
  slug: string,
  unit: string,
  scopeDir: string,
  t: string,
): void {
  const setsid: string = resolveExecutable('setsid');
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      key === 'AKROGON_TOOL_CGROUP' ||
      key === 'AKROGON_SEAT_CGROUP' ||
      key === 'AKROGON_SEAT_PID' ||
      value === undefined
    )
      continue;
    env[key] = value;
  }
  const child: Bun.Subprocess = Bun.spawn(
    [
      setsid,
      process.execPath,
      resolve(toolRoot, 'src/akrogon.ts'),
      'tool-kill-helper',
      repoName,
      repoRoot,
      slug,
      unit,
      resolve(scopeDir, 'tools', t),
    ],
    { stdin: 'ignore', stdout: 'ignore', stderr: 'ignore', env },
  );
  child.unref();
  const helperDir: string = resolve(scopeDir, 'helpers', t);
  mkdirSync(helperDir, { recursive: true });
  try {
    writeFileSync(resolve(helperDir, 'cgroup.procs'), `${child.pid}\n`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return;
    throw error;
  }
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

// One scope's sweep: every t- whose akrogon/ child is unpopulated is killed
// now, every populated one defers to a single helper. Killed-empty t- dirs and
// the akrogon/ and helpers/ dirs of gone t-s are removed after; removal
// failures warn only when they cannot be the kernel's reaping race. Kill
// write, spawn, pid-write and real removal failures count into the row's
// errors and warn.
function sweepScope(repo: Repo, slug: string, scopeDir: string, unit: string): void {
  const toolsDir: string = resolve(scopeDir, 'tools');
  let seen: number = 0;
  const populatedDirs: string[] = [];
  const deferred: string[] = [];
  let errors: number = 0;
  const fail = (t: string, error: unknown): void => {
    errors += 1;
    warn(slug, unit, t, error);
  };
  try {
    const names: string[] = readdirSync(toolsDir).filter(
      (name) => name.startsWith('t-') && isDirectory(resolve(toolsDir, name)),
    );
    seen = names.length;
    for (const t of names) {
      if (populated(resolve(toolsDir, t))) populatedDirs.push(t);
      if (!populated(resolve(scopeDir, 'akrogon', t))) {
        try {
          writeFileSync(resolve(toolsDir, t, 'cgroup.kill'), '1');
        } catch (error) {
          fail(t, error);
        }
        rmdirOrReport(resolve(toolsDir, t), (error) => fail(t, error));
        continue;
      }
      deferred.push(t);
      if (populated(resolve(scopeDir, 'helpers', t))) continue;
      try {
        spawnHelper(repo.name, repo.root, slug, unit, scopeDir, t);
      } catch (error) {
        fail(t, error);
      }
    }
    for (const parent of ['akrogon', 'helpers']) {
      const dir: string = resolve(scopeDir, parent);
      if (!isDirectory(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.startsWith('t-')) continue;
        if (names.includes(name) || populated(resolve(dir, name))) continue;
        rmdirOrReport(resolve(dir, name), (error) => fail(name, error));
      }
    }
  } catch (error) {
    fail('', error);
  }
  appendTiming(repo, { kind: 'tool_kill', slug, unit, seen, populated: populatedDirs, deferred, errors });
}

// After the move is committed: every seat scope of the leaf's slice that holds
// a tools/ directory is swept, each yielding one tool_kill row. A missing
// slice or a scope without tools/ yields nothing and no warning. The sweep
// never throws: it warns and leaves the committed move untouched.
export function sweepToolCgroups(repo: Repo, slug: string): void {
  try {
    const slice: string = sliceCgroup(leafSlice(repo, slug, homePath()));
    if (!isDirectory(slice)) return;
    for (const unit of readdirSync(slice)) {
      if (!unit.endsWith('.scope')) continue;
      const scopeDir: string = resolve(slice, unit);
      if (!isDirectory(scopeDir) || !isDirectory(resolve(scopeDir, 'tools'))) continue;
      sweepScope(repo, slug, scopeDir, unit);
    }
  } catch (error) {
    warn(slug, '', '', error);
  }
}

// The helper half: parse the shell identity out of the t- basename. An
// unparsable name can never be waited on, so its shell reads as ended and the
// kill fires at once.
export function toolShellAlive(t: string): boolean {
  const parsed: RegExpMatchArray | null = basename(t).match(toolNamePattern);
  if (parsed === null) return false;
  const statPath: string = resolve(procRoot(), parsed[1], 'stat');
  let stat: string;
  try {
    stat = readFileSync(statPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
  const rest: string[] = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
  if (rest[0] === 'Z' || rest[0] === 'X') return false;
  return rest[19] === parsed[2];
}

// The deferred kill: wait with no timeout for the tool shell to end, write the
// kill, retry the rmdir briefly since the kernel reaps asynchronously, and
// append one row recording the write's outcome. The helper always exits 0.
export async function toolKillHelper(
  repoName: string,
  repoRoot: string,
  slug: string,
  unit: string,
  toolPath: string,
): Promise<void> {
  const t: string = basename(toolPath);
  while (toolShellAlive(t)) await Bun.sleep(200);
  let outcome: 'written' | 'killed-already' | 'error';
  let errorText: string | undefined;
  try {
    writeFileSync(resolve(toolPath, 'cgroup.kill'), '1');
    outcome = 'written';
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') outcome = 'killed-already';
    else {
      outcome = 'error';
      errorText = error instanceof Error ? error.message : String(error);
    }
  }
  // The rmdir retries briefly since the kernel reaps asynchronously. A failure
  // left when the deadline passes is real only when nothing is reaping: the
  // row then carries it in its error field while the outcome keeps recording
  // the kill write itself.
  const deadline: number = Date.now() + 2000;
  for (;;) {
    try {
      rmdirSync(toolPath);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') break;
      if (Date.now() > deadline) {
        if (outcome === 'written' && !populated(toolPath))
          errorText = error instanceof Error ? error.message : String(error);
        break;
      }
      await Bun.sleep(100);
    }
  }
  appendTiming({ name: repoName, root: repoRoot } as Repo, {
    kind: 'tool_kill_deferred',
    slug,
    unit,
    t,
    outcome,
    ...(errorText === undefined ? {} : { error: errorText }),
  });
}
