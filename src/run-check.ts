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
import { base, leafTemp, readGlobal, requireRepo, type Repo } from './config';
import { allLeaves, readState, type Leaf } from './state';
import { command } from './shell';

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

async function leafTarget(
  repo: Repo,
  cwd: string,
  leafOverride: string | undefined,
  holder: string | undefined,
): Promise<{ slug: string; target: string }> {
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
  const { slug, target } = await leafTarget(repo, cwd, leafOverride, holder);
  const scratch: string = leafTemp(repo, slug);
  mkdirSync(scratch, { recursive: true, mode: 0o700 });
  const runRoot: string = mkdtempSync(resolve(scratch, 'run-'));
  try {
    const boot: string = existsSync('/proc/sys/kernel/random/boot_id')
      ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
      : '';
    writeFileSync(
      join(runRoot, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: boot, started: new Date().toISOString() }),
    );
    const env: Record<string, string> = {};
    for (const key of copied) {
      const value: string | undefined = process.env[key];
      if (value !== undefined) env[key] = value;
    }
    env.TMPDIR = runRoot;
    env.AKROGON_BASE = await base(repo, cwd);
    for (const key of repo.config.env) {
      const value: string | undefined = process.env[key];
      if (value !== undefined) env[key] = value;
    }
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
    const log: string = join(runRoot, 'out.log');
    appendFileSync(log, stdout);
    appendFileSync(log, stderr);
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    mkdirSync(target, { recursive: true });
    copyFileSync(log, resolve(target, `check-${name ?? 'run'}-${Date.now()}-${process.pid}.log`));
    return code;
  } finally {
    rmSync(runRoot, { recursive: true, force: true });
  }
}
