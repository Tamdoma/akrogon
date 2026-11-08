// Setup for the attended watcher-on-hc runs (criteria 2-4) in readiness grants[0]'s throwaway session
// akr-e2e-watch. Not part of the `test` check: run by name with AKROGON_E2E set; a missing prerequisite
// fails the run. No herdr-app window opens: akrogon runs with a scratch HOME holding the session's
// herdr-app home and the strict fake herdr-app (window closed) on its PATH, while the core and every
// harness keep the operator's real HOME and logins.
import { chmodSync, existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { command, spawnCaptured, type SpawnResult } from '../../src/shell';
import { realHome, realRuntime, required } from './tier';

export const session: string = 'akr-e2e-watch';
export const socket: string = resolve(realRuntime, 'herdr-core', `${session}.sock`);
const coreState: string = resolve(realHome, '.local/state/herdr-core', session);
const entry: string = resolve(import.meta.dir, '../../src/akrogon.ts');
const tests: string = resolve(import.meta.dir, '..');

export type WatchTier = {
  root: string;
  runtime: string;
  shimBin: string;
  corePath: string;
  standin: string;
  out: string;
  paths: string[];
  akrogonEnv: Record<string, string>;
  hc: (args: string[]) => Promise<SpawnResult>;
  rpc: (method: string, params: object) => Promise<unknown>;
  akrogon: (args: string[]) => Promise<SpawnResult>;
  observe: () => Promise<SpawnResult>;
  record: (name: string, value: unknown) => void;
};

function listening(path: string): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const probe = connect(path);
    probe.once('connect', () => {
      probe.destroy();
      done(true);
    });
    probe.once('error', () => done(false));
  });
}

export function absent(): string[] {
  return [socket, coreState].filter((path: string) => existsSync(path));
}

// `name` names the registered repo root `<leaf temp>/<name>`; every folder the run creates is
// recorded in <out>/paths.json before use.
export async function startWatchTier(
  name: string,
  slots: object,
  harnesses: Record<string, string>,
): Promise<WatchTier> {
  const leafTemp: string = required('AKROGON_E2E_ROOT');
  const out: string = required('AKROGON_E2E_OUT');
  const left: string[] = absent();
  if (left.length > 0) throw new Error(`akr-e2e-watch leftovers before the run: ${left.join(', ')}`);
  const root: string = resolve(leafTemp, name);
  const home: string = resolve(leafTemp, `${name}-home`);
  const scratch: string = resolve(leafTemp, `${name}-scratch`);
  const runtime: string = resolve(leafTemp, `${name}-rt`);
  const appBin: string = resolve(leafTemp, `${name}-appbin`);
  const shimBin: string = resolve(leafTemp, `${name}-shimbin`);
  const standin: string = resolve(leafTemp, `${name}-standin`);
  const standinBin: string = resolve(leafTemp, `${name}-standinbin`);
  const paths: string[] = [root, home, scratch, runtime, appBin, shimBin, standin, standinBin];
  mkdirSync(out, { recursive: true });
  const record = (file: string, value: unknown): void =>
    writeFileSync(resolve(out, file), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  record(`${name}-paths.json`, paths);
  const linked: string = resolve(runtime, 'herdr-core', `${session}.sock`);
  if (Buffer.byteLength(linked) >= 107) throw new Error(`socket link path too long: ${linked}`);
  for (const dir of [
    resolve(root, 'issues/open'),
    resolve(runtime, 'herdr-core'),
    appBin,
    shimBin,
    standin,
    standinBin,
  ])
    mkdirSync(dir, { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'e2e@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'e2e'], root);
  writeFileSync(resolve(root, '.gitignore'), '.env\n.claude/\n');
  writeFileSync(
    resolve(root, 'issues/config.yaml'),
    Bun.YAML.stringify({ checks: { test: 'true' }, grounding: 'none', worktree_root: leafTemp }),
  );
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'e2e'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(home, 'remote.git')]);
  await command(['git', 'remote', 'add', 'origin', resolve(home, 'remote.git')], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  writeFileSync(
    resolve(home, 'config.yaml'),
    Bun.YAML.stringify({ slots, harnesses, repos: { akre2e: root }, prefixes: { akre2e: 'aw' }, max_active: 2 }),
  );
  mkdirSync(resolve(scratch, '.config/herdr-app-sessions', session), { recursive: true });
  const appPlan: string = resolve(scratch, 'herdr-app-plan.json');
  writeFileSync(appPlan, JSON.stringify({ window: 'closed', rename: 'ok', calls: [] }));
  symlinkSync(resolve(tests, 'fake-herdr-app.ts'), resolve(appBin, 'herdr-app'));
  symlinkSync(resolve(tests, 'stand-in.sh'), resolve(standinBin, 'fake'));
  const corePath: string = `${standinBin}:${dirname(process.execPath)}:${z.string().parse(process.env.PATH)}`;
  const coreEnv: Record<string, string> = {
    HOME: realHome,
    PATH: corePath,
    LANG: 'C.UTF-8',
    TERM: 'xterm-256color',
    XDG_RUNTIME_DIR: realRuntime,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    HC_SESSION: session,
    STANDIN_DIR: standin,
  };
  const started: SpawnResult = await spawnCaptured(['hc', 'server', 'start'], { cwd: root, env: coreEnv });
  if (started.code !== 0) throw new Error(`hc server start failed: ${JSON.stringify(started)}`);
  symlinkSync(socket, linked);
  symlinkSync(resolve(realRuntime, 'bus'), resolve(runtime, 'bus'));
  symlinkSync(resolve(realRuntime, 'systemd'), resolve(runtime, 'systemd'));
  const akrogonEnv: Record<string, string> = {
    ...coreEnv,
    HOME: scratch,
    PATH: `${shimBin}:${appBin}:${corePath}`,
    AKROGON_HOME: home,
    XDG_RUNTIME_DIR: runtime,
    FAKE_HERDR_APP: appPlan,
    AKROGON_START_PROOF_MS: '3000',
    HC_SESSION: '',
    HC_TERMINAL_ID: '',
    HC_TERMINAL_SOCKET: '',
    HC_SCOPE: '',
  };
  // The checkout under test as `akrogon` for the listener's passes and the watcher's commands.
  const shim: string = resolve(shimBin, 'akrogon');
  writeFileSync(
    shim,
    `#!/bin/sh\nexec env ${Object.entries(akrogonEnv)
      .filter(([key]) => !key.startsWith('HC_') && key !== 'PATH')
      .map(([key, value]) => `${key}='${value}'`)
      .join(' ')} PATH='${shimBin}:${appBin}':"$PATH" '${process.execPath}' '${entry}' "$@"\n`,
  );
  chmodSync(shim, 0o755);
  const hc = (args: string[]): Promise<SpawnResult> => spawnCaptured(['hc', ...args], { cwd: root, env: coreEnv });
  const rpc = async (method: string, params: object): Promise<unknown> => {
    const reply: SpawnResult = await spawnCaptured(['hc', 'connect'], {
      cwd: root,
      env: coreEnv,
      stdin: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n',
    });
    const parsed = z
      .object({ result: z.unknown().optional(), error: z.unknown().optional() })
      .parse(JSON.parse(reply.stdout));
    if (parsed.error !== undefined) throw new Error(`${method}: ${JSON.stringify(parsed.error)}`);
    return parsed.result;
  };
  await rpc('doc.set', {
    name: 'herdr-app',
    value: { spaces: [{ folder: root, id: 'spakre2e', name: 'akre2e', tabs: [] }] },
    version: 0,
  });
  const akrogon = (args: string[]): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, entry, ...args], { cwd: root, env: akrogonEnv });
  const observe = (): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, resolve(tests, '../skills/watch-issues/scripts/observe.ts'), root], {
      cwd: root,
      env: akrogonEnv,
    });
  return { root, runtime, shimBin, corePath, standin, out, paths, akrogonEnv, hc, rpc, akrogon, observe, record };
}

// The grant's cleanup and absence check (readiness grants[0].fixtures[0]): every terminal of the
// session is killed and removed, the core stops, its state and every recorded folder go. Transcripts,
// agy's trustedWorkspaces entry and the agy conversation ids are A's after the report quotes them.
export async function stopWatchTier(tier: WatchTier, cwds: string[]): Promise<string[]> {
  const listed = z
    .object({ terminals: z.array(z.object({ address: z.string(), state: z.string() }).passthrough()) })
    .parse(await tier.rpc('terminal.list', { all: true, labels: {} }));
  for (const t of listed.terminals) {
    await tier.hc(['kill', t.address]);
    await tier.hc(['rm', t.address]);
  }
  const status = z
    .object({ pid: z.number() })
    .safeParse(JSON.parse((await tier.hc(['server', 'status', '--json'])).stdout || '{}'));
  // Any hc call on a stopped session starts a new core, so stop only a core still listening.
  if (await listening(socket)) await tier.hc(['server', 'stop']);
  if (status.success) await spawnCaptured(['timeout', '10', 'tail', `--pid=${status.data.pid}`, '-f', '/dev/null']);
  rmSync(coreState, { recursive: true, force: true });
  for (const path of [...cwds, ...tier.paths]) rmSync(path, { recursive: true, force: true });
  return absent();
}

export function lines(stdout: string): string[] {
  return stdout.trim() === '' ? [] : stdout.trim().split('\n');
}

// Pre-launch gate of every run: observe reads this session before any harness starts, so a broken
// observe costs no paid session.
export async function observeReady(tier: WatchTier): Promise<void> {
  const seen: SpawnResult = await tier.observe();
  tier.record('observe-before-launch.txt', `${seen.code}\n${seen.stdout}\n${seen.stderr}`);
  if (seen.code !== 0 || lines(seen.stdout)[0] !== `session=${session}`)
    throw new Error(`observe does not read ${session}: ${JSON.stringify(seen)}`);
}
