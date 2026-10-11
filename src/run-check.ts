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
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { base, readGlobal, requireRepo, type Repo } from './config';
import { allLeaves, readState, type Leaf } from './state';
import { command, type Result } from './shell';
import { readBaseRuns, type BaseRun } from './base-run';

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
  for (const key of repo.config.env) {
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
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd,
    env,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  appendFileSync(log, stdout);
  appendFileSync(log, stderr);
  return { code, stdout, stderr };
}

async function leafTarget(
  repo: Repo,
  cwd: string,
  leafOverride: string | undefined,
  holder: string | undefined,
): Promise<{ slug: string; target: string; baseSha?: string }> {
  if (leafOverride !== undefined)
    return {
      slug: readState(resolve(cwd, leafOverride)).slug,
      target: resolve(cwd, leafOverride, 'implementation'),
    };
  const top: string = realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], cwd));
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) =>
      item.state.worktree !== undefined && existsSync(item.state.worktree) && realpathSync(item.state.worktree) === top,
  );
  if (leaf !== undefined) return { slug: leaf.state.slug, target: resolve(leaf.path, 'implementation') };
  const run: BaseRun | undefined = readBaseRuns(repo).find(
    (item) => item.end === undefined && existsSync(item.path) && realpathSync(item.path) === top,
  );
  if (run !== undefined) {
    const caller: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === run.leaf);
    if (caller === undefined) throw new Error(`No caller leaf for base-run ${run.run}: ${run.leaf}`);
    return { slug: run.leaf, target: resolve(caller.path, 'implementation'), baseSha: run.base };
  }
  if (holder === undefined) throw new Error('No leaf worktree matches cwd; pass --leaf or --holder');
  return { slug: 'checkout', target: resolve(cwd, holder) };
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
  const { target, baseSha } = await leafTarget(repo, cwd, leafOverride, holder);
  // Short on purpose: Chrome puts its SingletonSocket under TMPDIR and aborts past the 107-byte socket path limit.
  const runRoot: string = mkdtempSync('/tmp/akr-');
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
    const result: Result = await spawnLogged(argv, cwd, env, log);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    mkdirSync(target, { recursive: true });
    copyFileSync(log, resolve(target, `check-${encodeURIComponent(name ?? 'run')}-${Date.now()}-${process.pid}.log`));
    return result.code;
  } finally {
    rmSync(runRoot, { recursive: true, force: true });
  }
}
