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
import { basename, join, resolve } from 'node:path';
import { base, ensureLeafTemp, readGlobal, requireRepo, type Repo } from './config';
import { allLeaves, readState, type Leaf, type State } from './state';
import { command, spawnCaptured, type Result } from './shell';
import { readBaseRuns, type BaseRun } from './base-run';
import { appendTiming } from './timing';
import { type Phase } from './routing';

const forbidden: readonly string[] = [
  'NODE_PATH',
  'BUN_OPTIONS',
  'BUN_INSTALL_CACHE_DIR',
  'FFMPEG_BIN',
  'CHROME_PATH',
  'CDP_BROWSER_BINARY',
];

const copied: readonly string[] = ['HOME', 'PATH', 'XDG_CACHE_HOME', 'NODE_DISABLE_COMPILE_CACHE'];

function bunfigs(): string[] {
  const files: string[] = [resolve(process.env.HOME ?? homedir(), '.bunfig.toml')];
  if (process.env.XDG_CONFIG_HOME !== undefined) files.push(resolve(process.env.XDG_CONFIG_HOME, '.bunfig.toml'));
  return files;
}

function refuse(): void {
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
  for (const key of [...repo.config.env, ...repo.config.pass_env]) {
    const value: string | undefined = process.env[key];
    if (value !== undefined) env[key] = value;
  }
  return env;
}

export async function spawnLogged(
  argv: string[],
  cwd: string,
  env: Record<string, string>,
  log: string,
): Promise<Result> {
  const { code, stdout, stderr }: Result = await spawnCaptured(argv, { cwd, env });
  appendFileSync(log, stdout);
  appendFileSync(log, stderr);
  return { code, stdout, stderr };
}

interface LeafTarget {
  slug: string;
  target: string;
  baseSha?: string;
  scope: 'leaf' | 'worker' | 'base';
  unit?: string;
  phase?: Phase;
  attempt?: string;
}

function leafFields(
  state: State,
  scope: LeafTarget['scope'],
  unit?: string,
): Omit<LeafTarget, 'target' | 'baseSha'> {
  return {
    slug: state.slug,
    scope,
    phase: state.phase,
    ...(unit === undefined ? {} : { unit }),
    ...(state.batch?.attempt === undefined ? {} : { attempt: state.batch.attempt }),
  };
}

async function leafTarget(
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
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) =>
      item.state.worktree !== undefined && existsSync(item.state.worktree) && realpathSync(item.state.worktree) === top,
  );
  if (leaf !== undefined) return { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') };
  const worker: RegExpMatchArray | null = basename(top).match(/-u(\d+)$/);
  if (worker !== null) {
    const owner: Leaf | undefined = allLeaves(repo).find(
      (item) => item.state.slug === basename(top).slice(0, -worker[0].length),
    );
    if (owner !== undefined)
      return {
        ...leafFields(owner.state, 'worker', `u${worker[1]}`),
        target: resolve(owner.path, 'implementation'),
      };
  }
  const run: BaseRun | undefined = readBaseRuns(repo).find(
    (item) => item.end === undefined && existsSync(item.path) && realpathSync(item.path) === top,
  );
  if (run !== undefined) {
    const caller: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === run.leaf);
    if (caller === undefined) throw new Error(`No caller leaf for base-run ${run.run}: ${run.leaf}`);
    return {
      slug: run.leaf,
      scope: 'base',
      phase: caller.state.phase,
      ...(run.attempt === undefined ? {} : { attempt: run.attempt }),
      target: resolve(caller.path, 'implementation'),
      baseSha: run.base,
    };
  }
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
  const { slug, target, baseSha, scope, unit, phase, attempt } = await leafTarget(
    repo,
    cwd,
    leafOverride,
    holder,
  );
  const runRoot: string = mkdtempSync(resolve(ensureLeafTemp(repo, slug), 'run-'));
  try {
    const boot: string = existsSync('/proc/sys/kernel/random/boot_id')
      ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
      : '';
    writeFileSync(
      join(runRoot, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: boot, started: new Date().toISOString() }),
    );
    const env: Record<string, string> = constructedEnv(repo, runRoot);
    env.AKROGON_BASE = baseSha ?? (await base(repo, cwd));
    const log: string = join(runRoot, 'out.log');
    const run: string = randomUUID();
    const check = {
      slug,
      run,
      name: name ?? 'run',
      scope,
      ...(phase === undefined ? {} : { phase }),
      ...(unit === undefined ? {} : { unit }),
      ...(attempt === undefined ? {} : { attempt }),
    };
    appendTiming(repo, { kind: 'check_start', ...check });
    const started: number = Date.now();
    const result: Result = await spawnLogged(argv, cwd, env, log);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    mkdirSync(target, { recursive: true });
    const kept: string = resolve(
      target,
      `check-${encodeURIComponent(name ?? 'run')}-${Date.now()}-${process.pid}.log`,
    );
    copyFileSync(log, kept);
    appendTiming(repo, {
      kind: 'check_end',
      ...check,
      exit: result.code,
      duration_ms: Date.now() - started,
      log: kept,
    });
    return result.code;
  } finally {
    rmSync(runRoot, { recursive: true, force: true });
  }
}
