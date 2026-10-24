import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { parse } from 'shell-quote';
import { base, ensureLeafTemp, readGlobal, requireRepo, setupCommand, type Repo } from './config';
import { repoInventory, RepoMismatchError, readState, type Inventory, type Leaf, type State } from './state';
import { command, spawnCaptured, type Result } from './shell';
import { appendTiming } from './timing';
import { callerScope, withAdmission } from './admission';
import { locate } from './evidence';
import { leafSlice, runSlice, runUnitArgv, runUnitBase, sessionBusAddress, startRunGuard, stopRunUnits } from './scope';
import { type Phase } from './routing';

const forbidden: readonly string[] = [
  'NODE_PATH',
  'BUN_OPTIONS',
  'BUN_INSTALL_CACHE_DIR',
  'FFMPEG_BIN',
  'CHROME_PATH',
  'CDP_BROWSER_BINARY',
];

// FAKE_SYSTEMD_RUN_LOG rides along so the run-unit seam can log the scope calls a held run makes.
const copied: readonly string[] = [
  'HOME',
  'PATH',
  'XDG_CACHE_HOME',
  'NODE_DISABLE_COMPILE_CACHE',
  'FAKE_SYSTEMD_RUN_LOG',
  // An akrogon invocation inside a checked command shares the caller's state
  // home; without it a nested call resolves HOME/.akrogon and can re-cutover.
  'AKROGON_HOME',
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
  env.TMPDIR = runRoot;
  env.LANG = 'C.UTF-8';
  for (const key of [...repo.config.env, ...repo.config.pass_env]) {
    const value: string | undefined = process.env[key];
    if (value !== undefined) env[key] = value;
  }
  env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent';
  return env;
}

export async function spawnLogged(
  argv: string[],
  cwd: string,
  env: Record<string, string>,
  log: string,
): Promise<Result> {
  // env.TMPDIR is the run root (constructedEnv), so captures share its owner-checked cleanup instead of lying loose in leaf temp.
  const { code, stdout, stderr }: Result = await spawnCaptured(argv, { cwd, env, captureRoot: env.TMPDIR });
  appendFileSync(log, stdout);
  appendFileSync(log, stderr);
  return { code, stdout, stderr };
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
  return { slug: 'checkout', target: resolve(cwd, holder), scope: 'leaf' };
}

export async function runCheck(
  cwd: string,
  name: string | undefined,
  leafOverride: string | undefined,
  holder: string | undefined,
  argv: string[],
): Promise<number> {
  if (leafOverride !== undefined && holder !== undefined) throw new Error('Use --leaf or --holder, not both');
  if (argv.length === 0)
    throw new Error('Usage: akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...');
  refuse();
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  for (const t of Object.values(repo.config.merge_checks)) {
    const words: string[] = parse(t).map((tok) => (typeof tok === 'string' ? tok : 'op' in tok ? tok.op : ''));
    const forms: string[][] = [words, ['sh', '-c', t], ['sh', '-c', setupCommand(repo.config, t)]];
    if (
      argv.join(' ') === t ||
      forms.some((form) => form.length === argv.length && form.every((arg, i) => arg === argv[i]))
    ) {
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
  process.stderr.write(`${result.stderr_final_nl ? '' : '\n'}check ${name ?? 'run'}: ${result.code} ${result.log}\n`);
  return result.code;
}

export class PublishRefusedError extends Error {}

// A publish target under an owner that already sits in issues/closed, or that
// holds .closing while packing, is refused; chart-direct holders resolve to a
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

export async function checkedRun(
  repo: Repo,
  { slug, target, scope, unit, phase, attempt }: LeafTarget,
  akrogonBase: string,
  name: string,
  argv: string[],
  cwd: string,
): Promise<{ code: number; log: string; stderr_final_nl: boolean }> {
  const early: string | undefined = await ownerRefusal(target, repo, false);
  if (early !== undefined) throw new PublishRefusedError(early);
  const runRoot: string = mkdtempSync(resolve(ensureLeafTemp(repo, slug), 'run-'));
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
    const log: string = join(runRoot, 'out.log');
    const run: string = randomUUID();
    const check = {
      slug,
      run,
      name,
      scope,
      ...(phase === undefined ? {} : { phase }),
      ...(unit === undefined ? {} : { unit }),
      ...(attempt === undefined ? {} : { attempt }),
    };
    const slice: string = runSlice(slug === 'checkout' ? 'akrogon.slice' : leafSlice(repo, slug));
    const runUnit: string = `${runUnitBase(run)}.scope`;
    return await withAdmission(
      { repo: repo.name, leaf: slug, check: name, run, slice, scope: callerScope(), unit: runUnit },
      async (admission) => {
        env.AKROGON_RUN = admission.token;
        appendTiming(repo, {
          kind: 'check_start',
          ...check,
          ...(admission.kind === 'held' ? { wait_ms: admission.wait_ms } : {}),
        });
        const started: number = Date.now();
        const result: Result =
          admission.kind === 'nested'
            ? await spawnLogged(argv, cwd, env, log)
            : await (async () => {
                await startRunGuard(slice, run, process.pid, admission.record_path);
                try {
                  return await spawnLogged(
                    runUnitArgv(slice, run, argv, env.DBUS_SESSION_BUS_ADDRESS),
                    cwd,
                    { ...env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
                    log,
                  );
                } finally {
                  admission.release();
                  await stopRunUnits(runUnit, `${runUnitBase(run)}-guard.service`);
                }
              })();
        process.stdout.write(result.stdout);
        process.stderr.write(result.stderr);
        const refusedReason: string | undefined = await ownerRefusal(target, repo, true);
        if (refusedReason !== undefined) {
          writeFileSync(resolve(runRoot, 'refusal.json'), JSON.stringify({ reason: refusedReason }));
          rmSync(resolve(runRoot, '.owner'));
          refused = true;
          throw new PublishRefusedError(`${refusedReason}; captured output stays in ${log}`);
        }
        mkdirSync(target, { recursive: true });
        const kept: string = resolve(target, `check-${encodeURIComponent(name)}-${Date.now()}-${process.pid}.log`);
        copyFileSync(log, kept);
        appendTiming(repo, {
          kind: 'check_end',
          ...check,
          exit: result.code,
          duration_ms: Date.now() - started,
          log: kept,
        });
        return { code: result.code, log: kept, stderr_final_nl: result.stderr.endsWith('\n') };
      },
    );
  } finally {
    if (!refused) rmSync(runRoot, { recursive: true, force: true });
  }
}
