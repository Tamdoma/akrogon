// Shared helpers for the setup-before-seat tests (setup-before-seat leaf): a `setup` string that
// records its cwd, env, lock state, `.env` and call into one log the stand-in's hook also writes,
// so a log line order proves setup ran before the task delivery of the same pass.
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, storeDir, yaml, type Fixture } from './helpers';
import type { HcFixture, Terminal } from './hc-fixture';
import { command, type Result } from '../src/shell';

export async function next(f: HcFixture, args: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['next', ...args], f.root, { ...f.env, ...env });
}

export function setupLog(f: Fixture): string {
  return resolve(f.home, 'setup.log');
}

// One setup call is the record lines `cwd` through `dotenv` plus the `ver` marker; the stand-in
// hook adds one `task-<leaf>` line per delivery to the same file.
export function setupLines(f: Fixture): string[] {
  if (!existsSync(setupLog(f))) return [];
  return readFileSync(setupLog(f), 'utf8').split('\n').filter(Boolean);
}

export function setupCalls(f: Fixture): number {
  return setupLines(f).filter((line) => line.startsWith('cwd=')).length;
}

// The setup calls inside one leaf's worktree: a shared log counts a sibling's install too.
export function setupCallsFor(f: Fixture, slug: string): number {
  return setupLines(f).filter((line) => line === `cwd=${resolve(storeDir(f), slug)}`).length;
}

// The `setup` string issues/config.yaml holds: it records how it ran into the log. `ver` changes
// the string without changing its behavior, so a differing marker reruns the same script once.
export function setupScript(f: Fixture, ver: number): string {
  const log: string = setupLog(f);
  return (
    `{ printf 'cwd=%s\\n' "$PWD"; ` +
    `printf 'ver=v${ver}\\n'; ` +
    `printf 'run=%s\\n' "\${AKROGON_RUN-unset}"; ` +
    `printf 'cc=%s\\n' "\${CLAUDECODE-unset}"; ` +
    `if flock -n "$(git rev-parse --git-path akrogon-install.lock)" true 2>/dev/null; then printf 'lock=free\\n'; else printf 'lock=held\\n'; fi; ` +
    `if [ -f .env ]; then printf 'dotenv=yes\\n'; else printf 'dotenv=no\\n'; fi; ` +
    `} >> '${log}'`
  );
}

// The setup string of the failure tests: a per-leaf file decides what the run does, so one leaf
// fails while its sibling installs in the same pass.
export function setupConditional(f: Fixture, ver: number): string {
  const log: string = setupLog(f);
  return (
    `{ printf 'cwd=%s\\n' "$PWD"; ` +
    `printf 'ver=v${ver}\\n'; ` +
    `if [ -f .env ]; then printf 'dotenv=yes\\n'; else printf 'dotenv=no\\n'; fi; ` +
    `} >> '${log}'; ` +
    `if [ -f '${f.home}/fail-'$(basename "$PWD") ]; then echo probe-out; echo probe-err >&2; exit 42; fi`
  );
}

export function writeSetup(f: Fixture, script: string, extra: object = {}): void {
  yaml(resolve(f.root, 'issues/config.yaml'), {
    setup: script,
    checks: { test: 'bun test' },
    grounding: 'none',
    ...extra,
  });
}

// The stand-in hook tagging each delivery into the shared log by the worktree's basename, which is
// the leaf slug for leaf worktrees.
export function orderHook(f: HcFixture): void {
  writeFileSync(resolve(f.core.standin, 'hook'), `#!/bin/sh\necho "task-$(basename "$PWD")" >> '${setupLog(f)}'\n`);
  chmodSync(resolve(f.core.standin, 'hook'), 0o755);
}

export function setupMarkerPath(wt: string): string {
  const probe: string = Bun.spawnSync(['git', 'rev-parse', '--git-path', 'akrogon-setup'], { cwd: wt }).stdout
    .toString()
    .trim();
  return resolve(wt, probe);
}

// Waits for the leaf's seat terminals to all report status `idle` at or after a turn: a replaced
// seat leaves its predecessor live beside it, and only the recorded one gates a pass.
export async function waitIdle(f: HcFixture, slug: string, seat: 'a' | 'b', turn: number = 0): Promise<Terminal> {
  const found: Terminal[] = await f.core.terminals({ 'akrogon.leaf': slug, 'akrogon.seat': seat }, false);
  if (found.length === 0) throw new Error(`No live seat ${seat} of ${slug}`);
  for (const terminal of found)
    await f.core.waitFor(terminal.address, (t: Terminal) => t.turn >= turn && t.status?.state === 'idle');
  return found[found.length - 1];
}

// A fixture root `.env` declaring the one name the repo config declares: the written leaf `.env`.
export function declareEnv(f: Fixture): void {
  writeFileSync(resolve(f.root, '.env'), 'SETUP_PROBE=present\n');
}

export async function pushMain(f: Fixture, files: Record<string, string>): Promise<void> {
  for (const [name, content] of Object.entries(files)) writeFileSync(resolve(f.root, name), content);
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', `add ${Object.keys(files).join(',')}`], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
}

// The store worktree for slug on a branch with one commit of its own, as tests/first-allocation
// criterion 4 builds it: the adoption case.
export async function adoptedWorktree(f: Fixture, slug: string): Promise<string> {
  const base: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  await command(['git', 'branch', slug, base], f.root);
  const wt: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', wt, slug], f.root);
  writeFileSync(resolve(wt, 'own'), 'own work\n');
  await command(['git', 'add', 'own'], wt);
  await command(['git', 'commit', '-m', 'own work'], wt);
  return wt;
}
