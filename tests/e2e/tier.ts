// Shared setup for the attended tiers (criteria 7 and 9) in the grant's throwaway session
// akr-e2e-engine. Not part of the `test` check: run by name with AKROGON_E2E set. Every
// prerequisite that is missing fails the run; nothing is skipped.
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { command, spawnCaptured, type SpawnResult } from '../../src/shell';

// The suite preload points HOME at a scratch folder (and Bun's userInfo follows HOME); the tiers need
// the operator's real home (harness logins, herdr-app sessions, hc state), read from the account.
export const realHome: string = z
  .string()
  .min(1)
  .parse(
    Bun.spawnSync(['getent', 'passwd', String(process.getuid!())])
      .stdout.toString()
      .trim()
      .split(':')[5],
  );
const homedir = (): string => realHome;
export const session: string = 'akr-e2e-engine';
const uid: number = process.getuid!();
export const realRuntime: string = `/run/user/${uid}`;
export const socket: string = resolve(realRuntime, 'herdr-core', `${session}.sock`);
export const appHome: string = resolve(homedir(), '.config/herdr-app-sessions', session);
export const coreState: string = resolve(homedir(), '.local/state/herdr-core', session);
const entry: string = resolve(import.meta.dir, '../../src/akrogon.ts');

export function required(name: string): string {
  return z.string().min(1, `${name} must be set for the attended tier`).parse(process.env[name]);
}

export type Tier = {
  root: string;
  runtime: string;
  home: string;
  repo: string;
  out: string;
  env: Record<string, string>;
  hc: (args: string[]) => Promise<SpawnResult>;
  rpc: (method: string, params: object) => Promise<unknown>;
  akrogon: (args: string[], extra?: Record<string, string>) => Promise<SpawnResult>;
  record: (name: string, value: unknown) => void;
};

function coreEnv(path: string): Record<string, string> {
  return {
    HOME: homedir(),
    PATH: path,
    LANG: 'C.UTF-8',
    TERM: 'xterm-256color',
    XDG_RUNTIME_DIR: realRuntime,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    HC_SESSION: session,
  };
}

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

export function realEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  return { ...process.env, HOME: realHome, XDG_RUNTIME_DIR: realRuntime, ...extra };
}

export function absent(): string[] {
  return [socket, appHome, coreState].filter((path: string) => existsSync(path));
}

// A herdr-app session home exists only once its window has opened ("a new name starts blank"), and
// akrogon refuses a session without one (plan D12), as herdr-setup gives every repo session one. The
// window opens once to make the home and closes again; the session stop also stops the core herdr-app
// started, whose state goes too, so the tier then starts its own core with the window closed.
async function openOnce(): Promise<void> {
  const window: Bun.Subprocess = Bun.spawn(['herdrapp', '--session', session], {
    env: realEnv(),
    stdout: 'ignore',
    stderr: 'ignore',
  });
  const ready: string = resolve(appHome, '.herdrapp-ready');
  for (let attempt: number = 0; attempt < 100 && !existsSync(ready); attempt += 1) await Bun.sleep(200);
  if (!existsSync(ready)) throw new Error(`herdr-app did not create the session home: ${ready}`);
  const stopped: SpawnResult = await spawnCaptured(['herdrapp', 'session', 'stop', session], { env: realEnv() });
  if (stopped.code !== 0) throw new Error(`herdrapp session stop failed: ${JSON.stringify(stopped)}`);
  // The launcher may outlive the stopped window; it holds nothing once the session is stopped.
  window.kill();
  await window.exited;
  if (await listening(socket)) throw new Error(`herdrapp session stop left the core listening: ${socket}`);
  rmSync(coreState, { recursive: true, force: true });
}

// Builds a scratch akrogon home and repo named `akre2e` under the leaf temp, starts the grant's core
// with a clean environment (forks/proofs.md P0) and seeds its document with the repo's space.
export async function startTier(
  kind: string,
  harnesses: Record<string, string>,
  slots: object,
  standin: { bin: string; dir: string } | null = null,
): Promise<Tier> {
  const leafTemp: string = required('AKROGON_E2E_ROOT');
  const out: string = required('AKROGON_E2E_OUT');
  const left: string[] = absent();
  if (left.length > 0) throw new Error(`akr-e2e-engine leftovers before the run: ${left.join(', ')}`);
  const root: string = resolve(leafTemp, `akr-e2e-engine-${kind}-root`);
  const home: string = resolve(leafTemp, `akr-e2e-engine-${kind}-home`);
  const runtime: string = resolve(leafTemp, `akre2e-rt-${kind}`);
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  mkdirSync(resolve(runtime, 'herdr-core'), { recursive: true });
  mkdirSync(out, { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'e2e@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'e2e'], root);
  writeFileSync(resolve(root, '.gitignore'), '.env\n');
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
    Bun.YAML.stringify({ slots, harnesses, repos: { akre2e: root }, prefixes: { akre2e: 'ae' } }),
  );
  await openOnce();
  const path: string = `${standin === null ? '' : `${standin.bin}:`}${dirname(process.execPath)}:${z.string().parse(process.env.PATH)}`;
  const started: SpawnResult = await spawnCaptured(['hc', 'server', 'start'], {
    cwd: root,
    env: { ...coreEnv(path), ...(standin === null ? {} : { STANDIN_DIR: standin.dir }) },
  });
  if (started.code !== 0) throw new Error(`hc server start failed: ${JSON.stringify(started)}`);
  symlinkSync(socket, resolve(runtime, 'herdr-core', `${session}.sock`));
  symlinkSync(resolve(realRuntime, 'bus'), resolve(runtime, 'bus'));
  symlinkSync(resolve(realRuntime, 'systemd'), resolve(runtime, 'systemd'));
  const hc = (args: string[]): Promise<SpawnResult> =>
    spawnCaptured(['hc', ...args], { cwd: root, env: coreEnv(path) });
  const rpc = async (method: string, params: object): Promise<unknown> => {
    const reply: SpawnResult = await spawnCaptured(['hc', 'connect'], {
      cwd: root,
      env: coreEnv(path),
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
  const env: Record<string, string> = {
    ...coreEnv(path),
    AKROGON_HOME: home,
    XDG_RUNTIME_DIR: runtime,
    HC_SESSION: '',
    HC_TERMINAL_ID: '',
    HC_TERMINAL_SOCKET: '',
    HC_SCOPE: '',
  };
  const akrogon = (args: string[], extra: Record<string, string> = {}): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, entry, ...args], { cwd: root, env: { ...env, ...extra } });
  const record = (name: string, value: unknown): void =>
    writeFileSync(resolve(out, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  return { root, runtime, home, repo: 'akre2e', out, env, hc, rpc, akrogon, record };
}

// The grant's cleanup and absence check (readiness grants[0].fixtures[0]).
export async function stopTier(tier: Tier, cwds: string[]): Promise<string[]> {
  const listed = z
    .object({ terminals: z.array(z.object({ address: z.string(), state: z.string() }).passthrough()) })
    .parse(await tier.rpc('terminal.list', { all: true, labels: {} }));
  for (const t of listed.terminals.filter((t) => t.state === 'live')) await tier.hc(['kill', t.address]);
  // The core writes its state while exiting, so the state folder goes only after the process is gone.
  const status = z
    .object({ pid: z.number() })
    .safeParse(JSON.parse((await tier.hc(['server', 'status', '--json'])).stdout || '{}'));
  await spawnCaptured(['herdrapp', 'session', 'stop', session], { env: realEnv() });
  // Any hc call on a stopped session starts a new core, so stop only a core still listening.
  if (await listening(socket)) await tier.hc(['server', 'stop']);
  if (status.success) await spawnCaptured(['timeout', '10', 'tail', `--pid=${status.data.pid}`, '-f', '/dev/null']);
  await spawnCaptured(['herdrapp', 'session', 'delete', session], { env: realEnv() });
  rmSync(coreState, { recursive: true, force: true });
  for (const cwd of cwds) rmSync(cwd, { recursive: true, force: true });
  rmSync(tier.root, { recursive: true, force: true });
  rmSync(tier.home, { recursive: true, force: true });
  rmSync(tier.runtime, { recursive: true, force: true });
  return absent();
}

export function trustedWorkspaces(): string[] {
  const file: string = resolve(homedir(), '.gemini/antigravity-cli/settings.json');
  return z
    .object({ trustedWorkspaces: z.array(z.string()).default([]) })
    .passthrough()
    .parse(JSON.parse(readFileSync(file, 'utf8'))).trustedWorkspaces;
}
