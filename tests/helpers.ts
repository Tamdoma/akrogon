import { appendFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, chmodSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { command, spawnCaptured, type Result, type SpawnResult } from '../src/shell';
import { readRepo } from '../src/config';
import { verifyCommands, verifyRunSchema, type VerifyRun, type VerifyScope } from '../src/verify';
import { findLeaf, readState, saveState, type Batch } from '../src/state';
import { descendantsOf } from './isolation';

export const entry: string = resolve(import.meta.dir, '../src/akrogon.ts');
const tempDirs: Set<string> = new Set();
export function registerTemp(path: string): string {
  tempDirs.add(path);
  return path;
}
process.on('exit', () => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});
export type Fixture = { home: string; root: string; clean: () => void };
export function leafTempRoot(f: Fixture): string {
  return resolve(f.home, 'leaf-temp');
}
export function storeDir(f: Fixture, repo: string = 'repo'): string {
  return resolve(f.home, '.akrogon/worktrees', repo);
}
export function yaml(path: string, data: object): void {
  writeFileSync(path, Bun.YAML.stringify(data));
}
export function cgroupRoot(f: Fixture): string {
  return resolve(f.home, 'cgroup');
}
export function statPath(f: Fixture): string {
  const uid: number = process.getuid!();
  return resolve(cgroupRoot(f), `user.slice/user-${uid}.slice/user@${uid}.service/akrogon.slice/memory.stat`);
}
export function seedStat(f: Fixture, anon: number, shmem: number = 0): void {
  const file: string = statPath(f);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `anon ${anon}\nfile 0\nshmem ${shmem}\n`);
}
export function unitBin(f: Fixture): string {
  return resolve(f.home, 'unitbin');
}
export async function fixture(): Promise<Fixture> {
  const home: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-')));
  const root: string = resolve(home, 'repo');
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  writeFileSync(resolve(root, 'file'), 'initial\n');
  writeFileSync(resolve(root, '.gitignore'), '.env\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'initial'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(home, 'remote.git')]);
  await command(['git', 'remote', 'add', 'origin', resolve(home, 'remote.git')], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  yaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
  yaml(resolve(home, 'config.yaml'), {
    slots: {
      a: { harness: 'fake', model: 'strong-a', effort: 'high' },
      b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
    },
    harnesses: { fake: 'fake --model {model} --effort {effort}' },
    repos: { repo: root },
  });
  const f: Fixture = { home, root, clean: () => rmSync(home, { recursive: true, force: true }) };
  seedStat(f, 1024 * 1024 * 1024);
  const units: string = unitBin(f);
  mkdirSync(units);
  symlinkSync(resolve(import.meta.dir, 'fake-systemd-run.sh'), resolve(units, 'systemd-run'));
  return f;
}
export async function cli(
  f: Fixture,
  args: string[],
  cwd: string = f.root,
  env: NodeJS.ProcessEnv = {},
  timeout?: number,
): Promise<Result> {
  const withDefault: NodeJS.ProcessEnv =
    'AKROGON_LEAF_TEMP_ROOT' in env ? env : { ...env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) };
  const result: SpawnResult = await spawnCaptured([process.execPath, entry, ...args], {
    cwd,
    env: {
      ...process.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      HOME: f.home,
      AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
      ...withDefault,
      ...('AKROGON_RUN' in env ? {} : { AKROGON_RUN: '' }),
      PATH: `${unitBin(f)}:${env.PATH ?? process.env.PATH}`,
    },
    timeout,
    killSignal: 'SIGKILL',
  });
  const { stdout, stderr, code } = result;
  if (result.signalCode !== null)
    throw new Error(JSON.stringify({ args, timeout, signal: result.signalCode, code, stdout, stderr }));
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}
export function killTree(proc: Bun.Subprocess): void {
  if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL');
  for (const pid of descendantsOf(proc.pid)) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // exited between listing and kill
    }
  }
}
export function leaf(f: Fixture, slug: string, phase: string, extra: object = {}, container: string = 'issue'): string {
  const path: string = resolve(f.root, 'issues/open', container, slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    repo: 'repo',
    'blocked-by': [],
    ...extra,
  });
  return path;
}

export function procRoot(f: Fixture): string {
  return resolve(f.home, 'proc');
}

export type HerdrFixture = { db: string; env: NodeJS.ProcessEnv };
export function fakeHerdr(f: Fixture): HerdrFixture {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  symlinkSync(resolve(import.meta.dir, 'fake-busctl.ts'), resolve(bin, 'busctl'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0, prompts: [], starts: [] }));
  mkdirSync(procRoot(f));
  mkdirSync(resolve(f.home, 'run'));
  return {
    db,
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      FAKE_HERDR: db,
      FAKE_BUSCTL_HOME: f.home,
      AKROGON_PROC_ROOT: procRoot(f),
      XDG_RUNTIME_DIR: resolve(f.home, 'run'),
      AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
    },
  };
}

export type SystemctlFixture = { db: string; log: string; env: NodeJS.ProcessEnv };
export function fakeSystemctl(f: Fixture): SystemctlFixture {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin, { recursive: true });
  symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(bin, 'systemctl'));
  const db: string = resolve(f.home, 'systemctl.json');
  writeFileSync(db, JSON.stringify({ units: [] }));
  const log: string = resolve(f.home, 'systemctl.log');
  return { db, log, env: { FAKE_SYSTEMCTL_DB: db, FAKE_SYSTEMCTL_LOG: log } };
}

export function fakeAkrogon(f: Fixture): { env: NodeJS.ProcessEnv } {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin, { recursive: true });
  symlinkSync(entry, resolve(bin, 'akrogon'));
  return {
    env: {
      PATH: `${bin}:${unitBin(f)}:${process.env.PATH}`,
      AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
    },
  };
}

export type GhFixture = { db: string; env: NodeJS.ProcessEnv };
export function fakeGh(f: Fixture): GhFixture {
  const bin: string = resolve(f.home, 'gh-bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-gh.ts'), resolve(bin, 'gh'));
  const db: string = resolve(f.home, 'gh.json');
  writeFileSync(db, '[]');
  return { db, env: { PATH: `${bin}:${process.env.PATH}`, FAKE_GH: db } };
}

export async function editOnSecondStatus(f: Fixture, worktree: string): Promise<string> {
  const seen: string = resolve(f.home, 'status-seen');
  const created: string = resolve(f.home, 'edit-created');
  const git: string = await command(['sh', '-c', 'command -v git']);
  const wrapper: string = resolve(f.home, 'bin/git');
  writeFileSync(
    wrapper,
    `#!/bin/sh
if [ "$1" = -C ] && [ "$2" = '${worktree}' ] && [ "$3" = status ]; then
  if [ -e '${seen}' ] && [ ! -e '${created}' ]; then
    printf 'operator edit\n' > '${worktree}/uncommitted'
    touch '${created}'
  fi
  touch '${seen}'
fi
exec '${git}' "$@"
`,
  );
  chmodSync(wrapper, 0o755);
  return created;
}

export function printedChecks(f: Fixture): (printed: string, cwd: string, env?: NodeJS.ProcessEnv) => Promise<Result> {
  const shim: { env: NodeJS.ProcessEnv } = fakeAkrogon(f);
  return async (printed: string, cwd: string, env: NodeJS.ProcessEnv = {}): Promise<Result> => {
    const { code, stdout, stderr }: Result = await spawnCaptured(['sh', '-c', printed], {
      cwd,
      env: { ...process.env, ...shim.env, HOME: f.home, AKROGON_HOME: f.home, ...env },
    });
    return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
  };
}

export function seedRun(f: Fixture, run: Partial<VerifyRun>): VerifyRun {
  const at: string = new Date().toISOString();
  const record: VerifyRun = verifyRunSchema.parse({
    run: randomUUID(),
    repo: 'repo',
    leaf: 'seeded',
    sha: 'x',
    tree: 'x',
    scope: 'leaf',
    path: resolve(f.home, 'verified'),
    pid: process.pid,
    boot_id: '',
    setup: 0,
    commands: [],
    start: at,
    end: at,
    ...run,
  });
  appendFileSync(resolve(f.root, 'issues/verify-runs.jsonl'), JSON.stringify(record) + '\n');
  return record;
}

export function greenReceipt(
  f: Fixture,
  sha: string,
  scope: VerifyScope,
  commands: { name: string; command: string }[] = verifyCommands(readRepo('repo', f.root).config, scope),
): void {
  seedRun(f, {
    sha,
    tree: Bun.spawnSync(['git', 'rev-parse', `${sha}^{tree}`], { cwd: f.root })
      .stdout.toString()
      .trim(),
    scope,
    commands: commands.map((item) => ({ ...item, exit: 0, log: resolve(f.home, 'verified.log') })),
  });
}

export async function verified(f: Fixture, slug: string, scope: VerifyScope): Promise<void> {
  const worktree: string | undefined = readState(findLeaf(readRepo('repo', f.root), slug).path).worktree;
  greenReceipt(
    f,
    await command(['git', 'rev-parse', worktree === undefined ? `refs/heads/${slug}` : 'HEAD'], worktree ?? f.root),
    scope,
  );
}

// A merge-turn record and green receipt on the current remote tip, so an operator `merged` pushes nothing new and lands.
export function holding(f: Fixture): { batch: Batch } {
  const main: string = Bun.spawnSync(['git', 'rev-parse', 'origin/main'], { cwd: f.root }).stdout.toString().trim();
  greenReceipt(f, main, 'merge');
  return {
    batch: { attempt: 'a1', built_on: main, holder: { base: main, head: main }, applied: true, top: main },
  };
}

// The command claims every applied top. Cases about B's merge prompt hand the attempt to the seat, as a land run's handoff does.
export function seatOwned(path: string): void {
  const state = readState(path);
  saveState(path, { ...state, batch: { ...state.batch!, owner: 'seat' } });
}
