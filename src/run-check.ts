import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { parse } from 'shell-quote';
import {
  base,
  ensureLeafTemp,
  ensureRunRoot,
  homePath,
  readGlobal,
  requireRepo,
  setupCommand,
  type Repo,
} from './config';
import { repoInventory, RepoMismatchError, readState, type Inventory, type Leaf, type State } from './state';
import { command, type Result } from './shell';
import { RUN_CHECK_USAGE } from './usage';
import { appendTiming } from './timing';
import { callerScope, runCancelled, withAdmission } from './admission';
import { locate, type LogTarget } from './evidence';
import { FlockError, flockHold } from './flock';
import { captureAncestry } from './pack';
import { leafSlice, runSlice, runUnitArgv, runUnitBase, runtimeDir, sessionBusAddress, startRunGuard } from './scope';
import { relocateFromToolCgroup } from './tool-cgroup';
import { type Phase } from './routing';

const forbidden: readonly string[] = [
  'NODE_PATH',
  'BUN_OPTIONS',
  'BUN_INSTALL_CACHE_DIR',
  'FFMPEG_BIN',
  'CHROME_PATH',
  'CDP_BROWSER_BINARY',
];

// The graphical-session names every checked command sees exactly as the
// caller holds them: a headed client probes its own display. XDG_SESSION_TYPE
// stays the client's probe and WAYLAND_SOCKET is an inherited fd number, so
// neither is ever copied.
export const displayEnv: readonly string[] = ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY', 'XDG_RUNTIME_DIR'];

// FAKE_SYSTEMD_RUN_LOG rides along so the run-unit seam can log the scope calls a held run makes.
const copied: readonly string[] = [
  'HOME',
  'PATH',
  'XDG_CACHE_HOME',
  'FAKE_SYSTEMD_RUN_LOG',
  // An akrogon invocation inside a checked command shares the caller's state
  // home; without it a nested call resolves HOME/.akrogon and can re-cutover.
  'AKROGON_HOME',
  // A nested akrogon call resolves the same leaf temp roots as its caller;
  // without them it falls back to the default root and leaves its leaf dir there.
  'AKROGON_LEAF_TEMP_ROOT',
  'AKROGON_RETIRED_TEMP_ROOT',
  ...displayEnv,
];

function bunfigs(): string[] {
  const files: string[] = [resolve(process.env.HOME ?? homedir(), '.bunfig.toml')];
  if (process.env.XDG_CONFIG_HOME !== undefined) files.push(resolve(process.env.XDG_CONFIG_HOME, '.bunfig.toml'));
  return files;
}

export function refuse(): void {
  for (const name of forbidden) if (process.env[name] !== undefined) throw new Error(`Refusing to run: ${name} is set`);
  for (const file of bunfigs()) if (existsSync(file)) throw new Error(`Refusing to run: global bunfig at ${file}`);
}

export function constructedEnv(repo: Repo, runRoot: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of copied) {
    const value: string | undefined = process.env[key];
    if (value !== undefined) env[key] = value;
  }
  env.LANG = 'C.UTF-8';
  for (const key of [...repo.config.env, ...repo.config.pass_env]) {
    const value: string | undefined = process.env[key];
    if (value !== undefined) env[key] = value;
  }
  env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent';
  // Node's compile cache writes hundreds of MB into each run's TMPDIR and is never reused.
  env.NODE_DISABLE_COMPILE_CACHE = '1';
  return { ...env, ...scratchEnv(runRoot) };
}

// The names bound to the run's scratch folder. Bun's transpiler cache is reused
// only inside one run and never evicted, so it ends with the run.
function scratchEnv(folder: string): { TMPDIR: string; BUN_RUNTIME_TRANSPILER_CACHE_PATH: string } {
  return { TMPDIR: folder, BUN_RUNTIME_TRANSPILER_CACHE_PATH: join(folder, 'bun-cache') };
}

// The command writes into run-unique capture files inside the holder from
// launch, so a killed wrapper leaves its output where the check would publish.
// Reads go through fds opened beside the writer sinks: the holder may be
// renamed under us while the command runs, which removes the paths but not
// the captured bytes.
export async function spawnLogged(
  argv: string[],
  cwd: string,
  env: Record<string, string>,
  capture: { out: string; outFd: number; err: string },
): Promise<Result> {
  const outRead: number = openSync(capture.out, 'r');
  const errRead: number = openSync(capture.err, 'r');
  try {
    const child: Bun.Subprocess = Bun.spawn(argv, {
      cwd,
      env,
      stdin: 'ignore',
      stdout: capture.outFd,
      stderr: Bun.file(capture.err),
    });
    const code: number = await child.exited;
    return { code, stdout: readFileSync(outRead, 'utf8'), stderr: readFileSync(errRead, 'utf8') };
  } finally {
    closeSync(outRead);
    closeSync(errRead);
  }
}

// A capture pair whose writer is gone: nothing has cleared it and its out file
// no longer carries the shared lock the run held on the write description. The
// probe opens read-only so scanning never creates the file, and takes the
// exclusive lock only to prove none is held.
export function abandonedCaptures(folder: string): { out: string; err: string; cleared: string }[] {
  const name: RegExp = /^capture-.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-out\.log$/;
  const found: { out: string; err: string; cleared: string }[] = [];
  for (const member of new Bun.Glob('**/capture-*-out.log').scanSync({ cwd: folder, dot: true, onlyFiles: false })) {
    const matched: RegExpMatchArray | null = basename(member).match(name);
    if (matched === null) continue;
    const out: string = resolve(folder, member);
    const cleared: string = join(dirname(out), `cleared-${matched[1]}.md`);
    if (existsSync(cleared) && readFileSync(cleared, 'utf8').trim().length > 0) continue;
    let fd: number;
    try {
      fd = openSync(out, 'r');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    try {
      const probe: Bun.SyncSubprocess<'pipe', 'ignore'> = Bun.spawnSync(['flock', '-n', '-x', '0'], {
        stdin: fd,
        stderr: 'ignore',
      });
      if (probe.exitCode === 0 && existsSync(out))
        found.push({ out, err: out.replace(/-out\.log$/, '-err.log'), cleared });
    } finally {
      closeSync(fd);
    }
  }
  return found;
}

export interface LeafTarget {
  slug: string;
  target: string;
  scope: 'leaf' | 'worker';
  unit?: string;
  phase?: Phase;
  attempt?: string;
}

export function leafFields(state: State, scope: LeafTarget['scope'], unit?: string): Omit<LeafTarget, 'target'> {
  return {
    slug: state.slug,
    scope,
    phase: state.phase,
    ...(unit === undefined ? {} : { unit }),
    ...(state.batch?.attempt === undefined ? {} : { attempt: state.batch.attempt }),
  };
}

export async function leafTarget(
  repo: Repo,
  cwd: string,
  leafOverride: string | undefined,
  holder: string | undefined,
): Promise<LeafTarget> {
  if (holder !== undefined && !isAbsolute(holder)) throw new Error(`--holder takes an absolute path, got ${holder}`);
  if (leafOverride !== undefined) {
    const state: State = readState(resolve(cwd, leafOverride));
    return { ...leafFields(state, 'leaf'), target: resolve(cwd, leafOverride, 'implementation') };
  }
  const top: string = realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], cwd));
  const inv: Inventory = repoInventory(repo);
  const leaf: Leaf | undefined = inv.leaves.find(
    (item) =>
      item.state.worktree !== undefined && existsSync(item.state.worktree) && realpathSync(item.state.worktree) === top,
  );
  if (leaf !== undefined) return { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') };
  const worker: RegExpMatchArray | null = basename(top).match(/-u(\d+)$/);
  if (worker !== null) {
    const owner: Leaf | undefined = inv.leaves.find(
      (item) => item.state.slug === basename(top).slice(0, -worker[0].length),
    );
    if (owner !== undefined)
      return {
        ...leafFields(owner.state, 'worker', `u${worker[1]}`),
        target: resolve(owner.path, 'implementation'),
      };
  }
  const failure = [
    ...inv.unreadable,
    ...inv.foreign.map((f) => ({ path: f.path, error: new RepoMismatchError(f.path, f.stored, repo.name).message })),
  ].find((f) => basename(f.path) === basename(top));
  if (failure !== undefined) throw new Error(`Invalid state ${resolve(failure.path, 'state.yaml')}: ${failure.error}`);
  if (holder === undefined) throw new Error('No leaf worktree matches cwd; pass --leaf or --holder');
  return { slug: 'checkout', target: resolve(holder), scope: 'leaf' };
}

export async function runCheck(
  cwd: string,
  name: string | undefined,
  leafOverride: string | undefined,
  holder: string | undefined,
  argv: string[],
): Promise<number> {
  if (leafOverride !== undefined && holder !== undefined) throw new Error('Use --leaf or --holder, not both');
  if (argv.length === 0) throw new Error(RUN_CHECK_USAGE);
  refuse();
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  for (const t of Object.values(repo.config.merge_checks)) {
    const words: string[] = parse(t).map((tok) => (typeof tok === 'string' ? tok : 'op' in tok ? tok.op : ''));
    const forms: string[][] = [words, ['sh', '-c', t], ['sh', '-c', setupCommand(repo.config, t)]];
    if (forms.some((form) => form.length === argv.length && form.every((arg, i) => arg === argv[i]))) {
      process.stderr.write(
        'Refusing to run a merge_checks command through run-check: run akrogon verify --attempt <id> instead; a red merge check is reproduced with a narrower command than the suite argv.\n',
      );
      return 1;
    }
  }
  const caller: LeafTarget = await leafTarget(repo, cwd, leafOverride, holder);
  const result: { code: number; log: string; stderr_final_nl: boolean } = await checkedRun(
    repo,
    caller,
    await base(repo, cwd),
    name ?? 'run',
    argv,
    cwd,
  );
  writeSwallowingEpipe(
    2,
    `${result.stderr_final_nl ? '' : '\n'}check ${name ?? 'run'}: ${result.code} ${result.log}\n`,
  );
  return result.code;
}

export class PublishRefusedError extends Error {
  constructor(reason: string, log?: string) {
    super(log === undefined ? reason : `${reason}; captured output stays in ${log}`);
  }
}

// A leaf- or worker-scoped run refuses to start while its leaf's live phase is
// `failed`; the recorded caller phase may be stale, so the decision re-reads
// state.yaml at each point. The checkout holder target carries no phase and is
// never refused here. Each refusal appends one check_refused timing row and no
// refusal.json; a failure committed after the late read does not cancel the run.
function failedRefusal(caller: LeafTarget, repo: Repo, name: string, run: string): void {
  if (caller.phase === undefined) return;
  const fresh: State = readState(dirname(caller.target));
  if (fresh.phase !== 'failed') return;
  appendTiming(repo, {
    kind: 'check_refused',
    slug: caller.slug,
    run,
    name,
    scope: caller.scope,
    phase: fresh.phase,
    ...(caller.unit === undefined ? {} : { unit: caller.unit }),
    ...(caller.attempt === undefined ? {} : { attempt: caller.attempt }),
  });
  const reason: string = fresh.failure === undefined ? 'failure record unavailable' : fresh.failure.reason;
  const recovery: string =
    fresh.failure === undefined
      ? `the operator recovers it with akrogon phase ${caller.slug}.`
      : `the operator recovers it with akrogon phase ${caller.slug} ${fresh.failure.phase}.`;
  throw new PublishRefusedError(
    `Refusing run-check ${name} for leaf ${repo.name}/${caller.slug}: the leaf is failed (${reason}). Stop work on this leaf; ${recovery}`,
  );
}

// A publish target under an owner that already sits in issues/closed, or that
// holds .closing while it packs or completes, is refused; chart-direct holders resolve to a
// single owner dir and stay allowed. The late rule adds the vanished-owner
// case: the owner moved to closed while the command ran.
async function ownerRefusal(target: string, repo: Repo, late: boolean): Promise<string | undefined> {
  const recorded: string = resolve(target, 'out.log');
  const found = await locate(recorded, repo.root, repo);
  if (found === null || found.ownerDirs.length === 1) return undefined;
  const [open]: string[] = found.ownerDirs;
  const owner: string = resolve(recorded, ...found.member.split('/').map(() => '..'));
  const state: string = basename(dirname(owner));
  if (state === 'closed') return `owner closed: ${target}`;
  if (existsSync(resolve(open, '.closing'))) return `owner closing: ${target}`;
  if (late && state === 'open' && !existsSync(open)) return `owner gone: ${target}`;
  return undefined;
}

// The directory whose .lock the capture writers hold: the holder itself for a
// target outside issues/, the chart's direct dir, or the open-state owner.
export async function captureOwner(target: string, repo: Repo): Promise<{ path: string; kind: 'holder' | 'issue' }> {
  const recorded: string = resolve(target, 'out.log');
  const found: LogTarget | null = await locate(recorded, repo.root, repo);
  if (found === null) return { path: target, kind: 'holder' };
  if (found.ownerDirs.length === 1) return { path: found.ownerDirs[0], kind: 'holder' };
  return { path: resolve(recorded, ...found.member.split('/').map(() => '..')), kind: 'issue' };
}

// The echoes write synchronously so an EPIPE surfaces at the write, where it
// is catchable; Bun's buffered pipe writes raise it only at exit-flush, which
// would exit 1 over a completed publish. Only EPIPE is swallowed: the publish
// never depends on the pipe. Bun's child pipes are non-blocking, so an open
// but undrained reader answers a full pipe with EAGAIN instead of blocking;
// the echo is the process's final act, so retrying after a short sleep is the
// blocking write an ordinary pipe would have performed. Any other errno still
// throws: a writer that cannot report is worse than a dead one.
export function writeSwallowingEpipe(fd: number, text: string): void {
  const buffer: Buffer = Buffer.from(text, 'utf8');
  let offset: number = 0;
  while (offset < buffer.length) {
    try {
      offset += writeSync(fd, buffer, offset, buffer.length - offset);
    } catch (error) {
      const code: string | undefined = (error as NodeJS.ErrnoException).code;
      if (code === 'EPIPE') return;
      if (code === 'EAGAIN') {
        Bun.sleepSync(1);
        continue;
      }
      throw error;
    }
  }
}

export async function checkedRun(
  repo: Repo,
  { slug, target, scope, unit, phase, attempt }: LeafTarget,
  akrogonBase: string,
  name: string,
  argv: string[],
  cwd: string,
  rerunNames?: string,
): Promise<{ code: number; log: string; output: string; stderr_final_nl: boolean }> {
  // A direct library call gets the same relocation the CLI entry runs: the
  // writer leaves its t- before any record or capture.
  relocateFromToolCgroup();
  const early: string | undefined = await ownerRefusal(target, repo, false);
  if (early !== undefined) throw new PublishRefusedError(early);
  const run: string = randomUUID();
  const caller: LeafTarget = { slug, target, scope, unit, phase, attempt };
  const check = {
    slug,
    run,
    name,
    scope,
    ...(phase === undefined ? {} : { phase }),
    ...(unit === undefined ? {} : { unit }),
    ...(attempt === undefined ? {} : { attempt }),
  };
  failedRefusal(caller, repo, name, run);
  const leafTempDir: string = ensureLeafTemp(repo, slug);
  const runRoot: string = mkdtempSync(resolve(leafTempDir, 'run-'));
  let refused: boolean = false;
  try {
    const boot: string = existsSync('/proc/sys/kernel/random/boot_id')
      ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
      : '';
    writeFileSync(
      join(runRoot, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: boot, started: new Date().toISOString() }),
    );
    const env: Record<string, string> = constructedEnv(repo, runRoot);
    env.AKROGON_BASE = akrogonBase;
    if (rerunNames !== undefined) env.AKROGON_RERUN_NAMES = rerunNames;
    env.AKROGON_EVIDENCE = join(leafTempDir, 'evidence', `${encodeURIComponent(name)}-${run}`);
    const log: string = join(runRoot, 'out.log');
    const { path: owner, kind }: { path: string; kind: 'holder' | 'issue' } = await captureOwner(target, repo);
    const slice: string = runSlice(slug === 'checkout' ? 'akrogon.slice' : leafSlice(repo, slug, homePath()));
    const runUnit: string = `${runUnitBase(run)}.scope`;
    return await withAdmission(
      {
        repo: repo.name,
        leaf: slug,
        check: name,
        run,
        slice,
        scope: callerScope(),
        unit: runUnit,
        full: repo.config.full.includes(name),
        ...(attempt === undefined ? {} : { attempt }),
      },
      async (admission) => {
        env.AKROGON_RUN = admission.token;
        env.AKROGON_CAPTURES = JSON.stringify([...captureAncestry, { owner, run }]);
        const lockPath: string = resolve(owner, '.lock');
        const refusePublish = (reason: string, result?: Result): never => {
          const bytes: string = result === undefined ? '' : result.stdout + result.stderr;
          writeFileSync(log, bytes);
          writeFileSync(resolve(runRoot, 'refusal.json'), JSON.stringify({ reason }));
          rmSync(resolve(runRoot, '.owner'));
          refused = true;
          throw new PublishRefusedError(reason, log);
        };
        if (kind === 'holder') mkdirSync(owner, { recursive: true });
        else if (!existsSync(owner)) refusePublish(`owner gone: ${target}`);
        const holder: { release: () => Promise<void> } = await flockHold(lockPath, '-s').catch((error: Error) => {
          if (error instanceof FlockError && !existsSync(owner)) refusePublish(`owner gone: ${target}`);
          throw error;
        });
        try {
          const fenced: string | undefined = await ownerRefusal(target, repo, true);
          if (fenced !== undefined) refusePublish(fenced);
          failedRefusal(caller, repo, name, run);
          const ownerFd: number = openSync(owner, 'r');
          try {
            mkdirSync(resolve(`/proc/self/fd/${ownerFd}`, relative(owner, target)), { recursive: true });
          } finally {
            closeSync(ownerFd);
          }
          const captureOut: string = resolve(target, `capture-${encodeURIComponent(name)}-${run}-out.log`);
          const captureErr: string = resolve(target, `capture-${encodeURIComponent(name)}-${run}-err.log`);
          const pending: string = join(target, `.${basename(captureOut)}`);
          const capFd: number = openSync(pending, 'w');
          try {
            // The lock lives on capFd's open description for the run's life:
            // the command inherits the fd, so the pair reads as live until the
            // last writer exits. Bun maps no extra fds into children, so the
            // helper locks the same description through its stdin slot.
            const locked: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['flock', '-s', '0'], {
              stdin: capFd,
              stderr: 'pipe',
            });
            if (locked.exitCode !== 0) throw new FlockError(captureOut, locked.exitCode, locked.stderr.toString());
            renameSync(pending, captureOut);
            writeFileSync(captureErr, '');
            process.stderr.write(`capture ${name}: ${captureOut} ${captureErr}\n`);
            appendTiming(repo, {
              kind: 'check_start',
              ...check,
              ...(admission.kind === 'held' ? { wait_ms: admission.wait_ms } : {}),
            });
            const started: number = Date.now();
            const result: Result =
              admission.kind === 'nested'
                ? await spawnLogged(['flock', '-s', lockPath, ...argv], cwd, env, {
                    out: captureOut,
                    outFd: capFd,
                    err: captureErr,
                  })
                : await (async () => {
                    // With run_root set, a held run's TMPDIR is a RAM folder its guard
                    // removes; the run root and its record stay on disk.
                    const runParent: string | undefined = ensureRunRoot();
                    const tmp: string | undefined =
                      runParent === undefined ? undefined : mkdtempSync(resolve(runParent, 'run-'));
                    await startRunGuard(slice, run, process.pid, tmp);
                    try {
                      if (await runCancelled(admission.record_path, repo.name))
                        throw new Error(`run ${run} cancelled by akrogon stop`);
                      return await spawnLogged(
                        [
                          'flock',
                          '-s',
                          lockPath,
                          ...runUnitArgv(slice, run, argv, env.DBUS_SESSION_BUS_ADDRESS, env.XDG_RUNTIME_DIR),
                        ],
                        cwd,
                        {
                          ...env,
                          ...(tmp === undefined ? {} : scratchEnv(tmp)),
                          DBUS_SESSION_BUS_ADDRESS: sessionBusAddress(),
                          XDG_RUNTIME_DIR: runtimeDir(),
                        },
                        { out: captureOut, outFd: capFd, err: captureErr },
                      );
                    } finally {
                      // The record stays until the scope is gone, so work left draining in it
                      // keeps holding what the run held.
                      await admission.end();
                    }
                  })();
            const refusedReason: string | undefined = await ownerRefusal(target, repo, true);
            if (refusedReason !== undefined) {
              writeSwallowingEpipe(1, result.stdout);
              writeSwallowingEpipe(2, result.stderr);
              // The holder may have moved mid-run: drop the stale captures under
              // every owner dir their member resolves to, or at the written path.
              for (const captured of [captureOut, captureErr]) {
                const hit: LogTarget | null = await locate(captured, repo.root, repo);
                const targets: string[] =
                  hit === null ? [captured] : hit.ownerDirs.map((dir) => resolve(dir, hit.member));
                for (const path of targets) rmSync(path, { force: true });
              }
              refusePublish(refusedReason, result);
            }
            const kept: string = resolve(target, `check-${encodeURIComponent(name)}-${Date.now()}-${process.pid}.log`);
            // The publish precedes the echoes: kept file, check_end row and
            // capture unlinks all stand even when the echo pipe's reader is
            // gone (the seat's t- kill closes it mid-run).
            writeFileSync(kept, result.stdout + result.stderr);
            appendTiming(repo, {
              kind: 'check_end',
              ...check,
              exit: result.code,
              duration_ms: Date.now() - started,
              log: kept,
            });
            unlinkSync(captureOut);
            unlinkSync(captureErr);
            writeSwallowingEpipe(1, result.stdout);
            writeSwallowingEpipe(2, result.stderr);
            return {
              code: result.code,
              log: kept,
              output: result.stdout + result.stderr,
              stderr_final_nl: result.stderr.endsWith('\n'),
            };
          } finally {
            closeSync(capFd);
            rmSync(pending, { force: true });
          }
        } finally {
          await holder.release();
        }
      },
    );
  } finally {
    if (!refused) rmSync(runRoot, { recursive: true, force: true });
  }
}
