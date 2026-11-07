import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { resolve } from 'node:path';
import { fixture, cli, entry, leaf, fakeHerdr, storeDir, yaml, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command, spawnCaptured, type Result } from '../src/shell';
import { z } from 'zod';
import type { Database, DatabaseInput, SessionInput } from './fake-herdr';
import { hcCore, hcFixture, setPrefixes, setSeat, type HcCore, type HcFixture, type Terminal } from './hc-fixture';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
type PaneSeed = {
  pane_id: string;
  tab_id: string;
  cwd: string;
  agent: string | null;
  agent_status: 'idle' | 'done' | 'working' | 'blocked' | 'unknown';
};
function seatedPane(pane_id: string, tab_id: string, cwd: string): PaneSeed {
  return { pane_id, tab_id, cwd, agent: null, agent_status: 'unknown' };
}
type TabSeed = { tab_id: string; label: string; workspace_id: string };
type SessionSeed = {
  name: string;
  running?: boolean;
  deadRead?: boolean;
  readError?: string;
  delayMs?: number;
  panes?: PaneSeed[];
  tabs?: TabSeed[];
  workspaces?: { workspace_id: string; label: string }[];
  serial?: number;
};
function session(name: string, over: Omit<SessionSeed, 'name'> = {}): SessionInput {
  return {
    name,
    running: true,
    panes: [],
    tabs: [],
    workspaces: [],
    serial: 0,
    ...over,
  };
}
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function saveDatabase(f: DispatchFixture, db: DatabaseInput): void {
  writeFileSync(f.db, JSON.stringify(db));
}
// Raw argv per call, including --session; the stripped .calls log stays for
// pre-session assertions elsewhere.
function rawCalls(f: DispatchFixture): string[][] {
  const path: string = f.db + '.calls-raw';
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    : [];
}
function toSession(f: DispatchFixture, name: string): string[][] {
  return rawCalls(f).filter((args) => args[0] === '--session' && args[1] === name);
}
function socket(f: DispatchFixture, name: string): string {
  return `${f.db}-${name}.sock`;
}
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}

// hc cases: the repo's session is the one whose herdr-app document holds a space named after the repo.
async function hcSetup(): Promise<Fixture> {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', 'fake', 'work');
  return f;
}
// A core killed without cleanup: its socket stays, so discovery lists it as stopped.
async function stoppedCore(f: Fixture, repo?: string): Promise<HcCore> {
  const core: HcCore = await hcCore(f, { repo });
  const status = await core.hc(['server', 'status', '--json']);
  process.kill(z.object({ pid: z.number() }).parse(JSON.parse(status.stdout)).pid, 'SIGKILL');
  for (let tries: number = 0; (await listening(core.socket)) && tries < 50; tries += 1) await Bun.sleep(20);
  return core;
}
// A running core whose herdr-app document cannot be parsed: its space list is unreadable.
async function unreadableCore(f: Fixture): Promise<HcCore> {
  const core: HcCore = await hcCore(f, { doc: false });
  await core.rpc('doc.set', { name: 'herdr-app', value: { spaces: 'junk' }, version: 0 });
  return core;
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
// An hc in front of the fixture shim that holds `hc connect` past akrogon's 10 s discovery deadline
// when the call targets `session` (or any session) and its request names `method`.
function stallingHc(f: Fixture, core: HcCore, method: string, session: string | null): string {
  const dir: string = resolve(f.home, 'stall-bin');
  mkdirSync(dir);
  const shim: string = resolve(z.string().parse(core.env.PATH).split(':')[0], 'hc');
  writeFileSync(
    resolve(dir, 'hc'),
    `#!/bin/sh
if [ "$1" = connect ]; then
  input=$(cat)
  case "$input" in *'"${method}"'*) ${session === null ? '' : `[ "$HC_SESSION" = '${session}' ] &&`} exec sleep 12 ;; esac
  printf '%s\\n' "$input" | exec '${shim}' "$@"
fi
exec '${shim}' "$@"
`,
  );
  chmodSync(resolve(dir, 'hc'), 0o755);
  return `${dir}:${core.env.PATH}`;
}
function appCloses(core: HcCore): { argv: string[]; home: string | null; planned: boolean }[] {
  return core.appCalls().filter((call) => call.argv[1] === 'tab.close');
}
function herdrCalls(f: Fixture, name: string): string[][] {
  const path: string = resolve(f.home, 'herdr.json.calls-raw');
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
        .filter((args) => args[0] === '--session' && args[1] === name)
    : [];
}
// The fixture core's fake herdr (notices only) gains a running session `other` with no repo workspace.
function herdrOther(f: Fixture): string {
  const db: string = resolve(f.home, 'herdr.json');
  saveDatabase(
    { ...f, db, env: {} },
    {
      ...(JSON.parse(readFileSync(db, 'utf8')) as Database),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    },
  );
  return `${db}-other.sock`;
}

test('refuses missing and duplicate repo spaces while naming searched and skipped sessions', async () => {
  const f: Fixture = await hcSetup();
  const other: HcCore = await hcCore(f, { repo: 'misc' });
  const resting: HcCore = await stoppedCore(f);
  const cores: HcCore[] = [other];
  try {
    other.link(resting);
    const path: string = leaf(f, 'unmatched', 'plan.synthesis');
    const result: Result = await cli(f, ['next', 'unmatched'], f.root, other.env);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('repo');
    expect(result.stderr).toContain(other.session);
    expect(result.stderr).toContain(resting.session);
    expect(await other.terminals({ akrogon: '1' })).toEqual([]);
    expect(readState(path).seat.A).toBeUndefined();
    // Discovery never contacts a stopped session, so it starts no core there.
    expect(await listening(resting.socket)).toBe(false);

    const main: HcCore = await hcCore(f);
    const extra: HcCore = await hcCore(f);
    cores.push(main, extra);
    main.link(extra);
    const dup: Result = await cli(f, ['next', 'unmatched'], f.root, main.env);
    expect(dup.code).toBe(1);
    expect(dup.stderr).toContain(main.session);
    expect(dup.stderr).toContain(`sp-${main.session}`);
    expect(dup.stderr).toContain(extra.session);
    expect(dup.stderr).toContain(`sp-${extra.session}`);
    expect(await main.terminals({ akrogon: '1' })).toEqual([]);
    expect(await extra.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    for (const core of cores) await core.stop();
    resting.discard();
    f.clean();
  }
}, 30000);

test('a refused repo reports once in --all while a healthy repo still dispatches', async () => {
  const f: Fixture = await hcSetup();
  setPrefixes(f, { repo: 'rp', second: 'sc' });
  // Only `second` has a space; `repo` has none anywhere.
  const core: HcCore = await hcCore(f, { repo: 'second' });
  try {
    const second: string = resolve(f.home, 'second');
    mkdirSync(resolve(second, 'issues/open'), { recursive: true });
    await command(['git', 'init', '-b', 'main', second]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], second);
    await command(['git', 'config', 'user.name', 'Test'], second);
    writeFileSync(resolve(second, '.gitignore'), '.env\n');
    writeFileSync(resolve(second, 'file'), 'x\n');
    await command(['git', 'add', '.'], second);
    await command(['git', 'commit', '-m', 'initial'], second);
    await command(['git', 'init', '--bare', '-b', 'main', resolve(f.home, 'remote2.git')]);
    await command(['git', 'remote', 'add', 'origin', resolve(f.home, 'remote2.git')], second);
    await command(['git', 'push', 'origin', 'HEAD:main'], second);
    yaml(resolve(second, 'issues/config.yaml'), { checks: { test: 'true' }, grounding: 'none' });
    mkdirSync(resolve(second, 'issues/open/chart2/leaf2'), { recursive: true });
    yaml(resolve(second, 'issues/open/chart2/leaf2/state.yaml'), {
      slug: 'leaf2',
      phase: 'plan.synthesis',
      created: '2026-09-10',
      repo: 'second',
      'blocked-by': [],
    });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as Record<string, unknown>;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: f.root, second } });
    leaf(f, 'blocked-repo', 'plan.synthesis');
    // --all sweeps only the current checkout's repo when run inside one; run
    // from f.home so both registered repos are swept.
    const result: Result = await cli(f, ['next', '--all'], f.home, core.env);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('repo');
    const refused: number = result.stderr.split('\n').filter((line) => line.includes('workspace')).length;
    expect(refused).toBe(1);
    const seats: Terminal[] = await core.terminals({ 'akrogon.leaf': 'leaf2' });
    expect(seats.map((t: Terminal) => t.name)).toEqual(['sc-leaf2-a']);
    expect(core.tasks(seats[0].address).some((task: string) => task.startsWith('plan-issue leaf2'))).toBe(true);
  } finally {
    await core.stop();
    f.clean();
  }
}, 30000);

test('skips a stopped session and a dead socket, and an unreadable session refuses', async () => {
  const f: Fixture = await hcSetup();
  // A stopped session holding the only repo space: skipped, refused.
  const down: HcCore = await stoppedCore(f);
  const host: HcCore = await hcCore(f, { repo: 'misc' });
  const cores: HcCore[] = [host];
  try {
    host.link(down);
    leaf(f, 'skipped', 'plan.synthesis');
    const refused: Result = await cli(f, ['next', 'skipped'], f.root, host.env);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain(down.session);

    // The dead socket stays listed beside a live session holding the space: skipped as stopped.
    const live: HcCore = await hcCore(f);
    cores.push(live);
    live.link(down);
    const dispatched: Result = await cli(f, ['next', 'skipped'], f.root, live.env);
    expect(dispatched.code).toBe(0);
    expect((await live.terminals({ 'akrogon.leaf': 'skipped' })).map((t: Terminal) => t.name)).toEqual([
      'rp-skipped-a',
    ]);
    expect(await listening(down.socket)).toBe(false);

    // A running session whose space list cannot be read refuses as unreadable.
    const broken: HcCore = await unreadableCore(f);
    cores.push(broken);
    live.link(broken);
    leaf(f, 'held-back', 'plan.synthesis');
    const unreadable: Result = await cli(f, ['next', 'held-back'], f.root, live.env);
    expect(unreadable.code).toBe(1);
    expect(unreadable.stderr).toContain(broken.session);
    expect(await live.terminals({ 'akrogon.leaf': 'held-back' })).toEqual([]);
  } finally {
    for (const core of cores) await core.stop();
    down.discard();
    f.clean();
  }
}, 30000);

test('a discovery read past the deadline refuses the repo', async () => {
  const f: HcFixture = await hcFixture();
  const slow: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    f.core.link(slow);
    leaf(f, 'deadline', 'plan.synthesis');
    const result: Result = await cli(f, ['next', 'deadline'], f.root, {
      ...f.env,
      PATH: stallingHc(f, f.core, 'doc.get', slow.session),
    });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(slow.session);
    expect(await f.core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await slow.stop();
    await f.clean();
  }
}, 45000);

test('a failed session list is reported once per invocation', async () => {
  const f: HcFixture = await hcFixture();
  const sessions: string = resolve(z.string().parse(f.env.XDG_RUNTIME_DIR), 'herdr-core');
  try {
    leaf(f, 'one', 'plan.synthesis');
    leaf(f, 'two', 'plan.synthesis');
    renameSync(sessions, `${sessions}.off`);
    const result: Result = await cli(f, ['next', '--all'], f.root, f.env);
    renameSync(`${sessions}.off`, sessions);
    expect(result.code).toBe(1);
    const lines: number = result.stderr.split('\n').filter((line) => line.includes('session list failed')).length;
    expect(lines).toBe(1);
    expect(await f.core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('the busy notice goes to the herdr session holding the repo workspace', async () => {
  // `trust` reports blocked and waits: a busy seat.
  const f: HcFixture = await hcFixture({ mode: 'trust' });
  try {
    const stale: string = herdrOther(f);
    const path: string = leaf(f, 'routed2', 'plan.synthesis');
    expect((await cli(f, ['next', 'routed2'], f.root, { ...f.env, HERDR_SOCKET_PATH: stale })).code).toBe(0);
    saveState(path, { ...readState(path), busy_since: { A: new Date(Date.now() - 61 * 60000).toISOString() } });
    expect((await cli(f, ['next', 'routed2'], f.root, { ...f.env, HERDR_SOCKET_PATH: stale })).code).toBe(0);
    const notices = herdrCalls(f, 'default').filter((args) => args[2] === 'notification' && args[3] === 'show');
    expect(notices).toHaveLength(1);
    expect(herdrCalls(f, 'other').filter((args) => args[2] === 'notification')).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 30000);

test('the reconcile tab close goes to the session holding the repo space', async () => {
  const f: HcFixture = await hcFixture();
  const decoy: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    f.core.link(decoy);
    const path: string = leaf(f, 'closing', 'plan.synthesis', {}, 'closed-owner');
    expect((await cli(f, ['next', 'closing'], f.root, f.env)).code).toBe(0);
    // Opened after the start, which would otherwise wait for herdr-app to show the seat.
    f.core.setWindow('open');
    const state: State = readState(path);
    mkdirSync(resolve(f.root, 'issues/closed/closed-owner'), { recursive: true });
    const moved: string = resolve(f.root, 'issues/closed/closed-owner/closing');
    await command(['mv', path, moved], f.root);
    saveState(moved, { ...readState(moved), phase: 'merged', tab: state.tab });
    expect((await cli(f, ['next', moved], f.root, f.env)).code).toBe(0);
    expect(appCloses(f.core)).toEqual([
      { argv: ['do', 'tab.close', '--id', z.string().parse(state.tab)], home: f.core.appHome, planned: true },
    ]);
    expect(await decoy.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await decoy.stop();
    await f.clean();
  }
}, 20000);

test('the land unit carries no HERDR_SOCKET_PATH and its calls route to the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const launches: string = resolve(f.home, 'systemd-run.log');
    const env: NodeJS.ProcessEnv = { ...f.env, FAKE_SYSTEMD_RUN_LOG: launches, HERDR_SOCKET_PATH: socket(f, 'other') };
    // A merge leaf at the head of the queue claims its batch and launches land.
    const path: string = leaf(f, 'landing', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const worktree: string = resolve(storeDir(f), 'landing');
    await command(['git', 'worktree', 'add', '-b', 'landing', worktree], f.root);
    writeFileSync(resolve(worktree, 'landed-file'), 'x\n');
    await command(['git', 'add', 'landed-file'], worktree);
    await command(['git', 'commit', '-m', 'work'], worktree);
    saveState(path, { ...readState(path), worktree });
    expect((await next(f, ['landing'], env)).code).toBe(0);
    const logged: string = existsSync(launches) ? readFileSync(launches, 'utf8') : '';
    const landLines = logged.split('\n').filter((line) => line.includes('akrogon-land-'));
    expect(landLines.length).toBeGreaterThan(0);
    expect(landLines.every((line) => !line.includes('HERDR_SOCKET_PATH'))).toBe(true);
  } finally {
    f.clean();
  }
}, 30000);

test('land wake calls reach the resolved session under a stale parent session', async () => {
  const f: HcFixture = await hcFixture();
  const decoy: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    f.core.link(decoy);
    // A green check lets land push; the repo space lives in the fixture core while every call
    // inherits the decoy's session and terminal socket, like a seat's own environment.
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { ok: 'true' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const env: NodeJS.ProcessEnv = {
      ...f.env,
      HC_SESSION: decoy.session,
      HC_TERMINAL_SOCKET: decoy.socket,
      HC_TERMINAL_ID: 't1',
      HERDR_SOCKET_PATH: herdrOther(f),
      FAKE_SYSTEMD_RUN_LOG: resolve(f.home, 'systemd-run.log'),
    };
    // A sibling leaf keeps the issue owner incomplete so the merged leaf's
    // broadcast is unset and the wake may close its tab.
    const path: string = leaf(f, 'landing', 'plan.synthesis', {}, 'issue-x');
    leaf(f, 'zz', 'plan.synthesis', {}, 'issue-x');
    expect((await cli(f, ['next', 'landing'], f.root, env)).code).toBe(0);
    f.core.setWindow('open');
    const worktree: string = z.string().parse(readState(path).worktree);
    const tab: string = z.string().parse(readState(path).tab);
    writeFileSync(resolve(worktree, 'landed-file'), 'x\n');
    await command(['git', 'add', 'landed-file'], worktree);
    await command(['git', 'commit', '-m', 'work'], worktree);
    saveState(path, { ...readState(path), phase: 'merge', merge_stamp: '2026-10-19T00:00:00.000Z' });
    expect((await cli(f, ['next', 'landing'], f.root, env)).code).toBe(0);
    const attempt: string = z.string().parse(readState(path).batch?.attempt);
    const landed: Result = await cli(f, ['land', 'landing', '--attempt', attempt], f.root, env);
    expect(landed.code, landed.stderr).toBe(0);
    // The wake's merged-tab close goes to the fixture core's app home; the decoy sees nothing.
    expect(appCloses(f.core)).toEqual([
      { argv: ['do', 'tab.close', '--id', tab], home: f.core.appHome, planned: true },
    ]);
    expect(await decoy.terminals({ akrogon: '1' })).toEqual([]);
    expect(
      herdrCalls(f, 'other').filter(
        (args) =>
          (args[2] === 'tab' && ['create', 'rename', 'close'].includes(args[3] ?? '')) || args[2] === 'notification',
      ),
    ).toHaveLength(0);
  } finally {
    await decoy.stop();
    await f.clean();
  }
}, 60000);

test('phase renames and the failed notice carry the resolved session', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const stale: string = herdrOther(f);
    const path: string = leaf(f, 'renamed', 'plan.synthesis');
    expect((await cli(f, ['next', 'renamed'], f.root, { ...f.env, HERDR_SOCKET_PATH: stale })).code).toBe(0);
    f.core.setWindow('open');
    const worktree: string = z.string().parse(readState(path).worktree);
    const tab: string = z.string().parse(readState(path).tab);
    const renames = (name: string) =>
      f.core
        .appCalls()
        .filter((call) => call.argv[1] === 'tab.rename' && call.argv[3] === tab && call.argv[5] === name)
        .map((call) => call.home);
    const moved: Result = await cli(
      f,
      ['phase', 'renamed', 'failed', '--slot', 'A', '--reason', 'blocked for test'],
      worktree,
      { ...f.env, HERDR_SOCKET_PATH: stale },
    );
    expect(moved.code).toBe(0);
    expect(herdrCalls(f, 'default').some((args) => args[2] === 'notification' && args[3] === 'show')).toBe(true);
    expect(renames('renamed failed')).toEqual([f.core.appHome]);
    expect(
      herdrCalls(f, 'other').filter(
        (args) =>
          (args[2] === 'tab' && ['create', 'rename', 'close'].includes(args[3] ?? '')) || args[2] === 'notification',
      ),
    ).toHaveLength(0);
    // Recovery renames back in the same session.
    const back: Result = await cli(f, ['phase', 'renamed', 'plan.synthesis'], worktree, {
      ...f.env,
      HERDR_SOCKET_PATH: stale,
    });
    expect(back.code).toBe(0);
    expect(renames('renamed').length).toBeGreaterThan(0);
    expect(new Set(renames('renamed'))).toEqual(new Set([f.core.appHome]));
  } finally {
    await f.clean();
  }
}, 20000);

test('the merge notice and main-red notice go to the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const env: NodeJS.ProcessEnv = { ...f.env, HERDR_SOCKET_PATH: socket(f, 'other') };
    // A failed merge leaf whose recorded batch candidate already landed gets
    // the "move it back" notice through reconcileBatch.
    const path: string = leaf(f, 'failed-merge', 'merge');
    const worktree: string = resolve(storeDir(f), 'failed-merge');
    await command(['git', 'worktree', 'add', '-b', 'failed-merge', worktree], f.root);
    writeFileSync(resolve(worktree, 'fm'), 'x\n');
    await command(['git', 'add', 'fm'], worktree);
    await command(['git', 'commit', '-m', 'fm'], worktree);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'push', 'origin', 'failed-merge:main'], f.root);
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      worktree,
      batch: {
        attempt: 'a1',
        built_on: builtOn,
        holder: { base: builtOn, head },
        applied: true,
        top: head,
        candidate: head,
      },
    });
    const result: Result = await next(f, ['--all'], env);
    expect(result.code).toBe(0);
    const notices = toSession(f, 'default').filter((args) => args[2] === 'notification' && args[3] === 'show');
    expect(notices.some((args) => args.join(' ').includes('merged, move it back'))).toBe(true);
    expect(toSession(f, 'other').filter((args) => args[2] === 'notification')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 30000);

test('the main-red notice reaches the running session holding the repo workspace', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    // The repo's workspace sits only in running session `held`; the caller's
    // ambient session is `default`.
    saveDatabase(f, {
      ...database(f),
      workspaces: [{ workspace_id: 'w3', label: 'other' }],
      sessions: [session('held', { workspaces: [{ workspace_id: 'w4', label: 'repo' }] })],
    });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      // Red on head and base alike: the main-red notice fires on the red base
      // run; a green base would make the head a new red with no notice.
      checks: { unit: 'test -f never-exists' },
      grounding: 'none',
    });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = leaf(f, 'caller', 'implement');
    const worktree: string = resolve(storeDir(f), 'caller');
    await command(['git', 'worktree', 'add', '-b', 'caller', worktree], f.root);
    writeFileSync(resolve(worktree, 'marker'), 'x\n');
    await command(['git', 'add', 'marker'], worktree);
    await command(['git', 'commit', '-m', 'marker'], worktree);
    saveState(path, { ...readState(path), worktree });
    await cli(f, ['verify', '--known-red'], worktree, {
      ...f.env,
      HERDR_SOCKET_PATH: socket(f, 'default'),
    });
    const receipt: string = readFileSync(resolve(f.root, 'issues/verify-runs.jsonl'), 'utf8');
    expect(receipt).toContain('"notice":"shown"');
    const notices: string[][] = toSession(f, 'held').filter((args) => args[2] === 'notification' && args[3] === 'show');
    expect(notices.some((args) => args.join(' ').includes('main red'))).toBe(true);
  } finally {
    f.clean();
  }
}, 60000);

test('a stopped repo session suppresses the main-red notice but keeps the receipt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    // The repo's only workspace sits in a stopped session.
    saveDatabase(f, {
      ...database(f),
      workspaces: [{ workspace_id: 'w3', label: 'other' }],
      sessions: [session('held', { running: false, workspaces: [{ workspace_id: 'w4', label: 'repo' }] })],
    });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      // Red on head and base alike: the main-red notice fires on the red base
      // run; a green base would make the head a new red with no notice.
      checks: { unit: 'test -f never-exists' },
      grounding: 'none',
    });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = leaf(f, 'caller', 'implement');
    const worktree: string = resolve(storeDir(f), 'caller');
    await command(['git', 'worktree', 'add', '-b', 'caller', worktree], f.root);
    writeFileSync(resolve(worktree, 'marker'), 'x\n');
    await command(['git', 'add', 'marker'], worktree);
    await command(['git', 'commit', '-m', 'marker'], worktree);
    saveState(path, { ...readState(path), worktree });
    await cli(f, ['verify', '--known-red'], worktree, {
      ...f.env,
      HERDR_SOCKET_PATH: socket(f, 'default'),
    });
    // Receipt persists regardless of notice delivery.
    const runs: string = resolve(f.root, 'issues/verify-runs.jsonl');
    expect(existsSync(runs)).toBe(true);
    const receipt = readFileSync(runs, 'utf8');
    expect(receipt).toContain('"notice":"error"');
    expect(toSession(f, 'held')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 60000);

test('terminal discovery in the resolved session refuses at the ten-second deadline', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'pane-deadline', 'plan.synthesis');
    const result: Result = await cli(f, ['next', 'pane-deadline'], f.root, {
      ...f.env,
      PATH: stallingHc(f, f.core, 'terminal.list', null),
    });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('terminal.list');
    expect(await f.core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await f.clean();
  }
}, 30000);
