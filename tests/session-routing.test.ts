import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, entry, leaf, fakeHerdr, storeDir, yaml, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command, spawnCaptured, type Result } from '../src/shell';
import { z } from 'zod';
import type { Database, DatabaseInput, SessionInput } from './fake-herdr';

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
async function nextAt(f: DispatchFixture, slug: string, now: number, env: NodeJS.ProcessEnv = {}): Promise<Result> {
  const { stdout, stderr, code }: { stdout: string; stderr: string; code: number } = await spawnCaptured(
    [
      process.execPath,
      '--eval',
      `Date.now = () => ${now}; process.argv = ['bun', ${JSON.stringify(entry)}, 'next', ${JSON.stringify(slug)}]; await import(${JSON.stringify(entry)});`,
    ],
    {
      cwd: f.root,
      env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home, HERDR_PANE_ID: '', ...f.env, ...env },
    },
  );
  return { stdout, stderr, code };
}

test('routes seats into the session holding the repo workspace', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'routed');
    saveDatabase(f, {
      ...database(f),
      // Clear the flat default store's `repo` workspace so `main` holds the
      // label uniquely; seed a free idle pane there so allocation takes the
      // `pane split` path and the seated pane carries the worktree cwd.
      workspaces: [],
      panes: [],
      sessions: [
        session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] }),
        session('main', {
          workspaces: [{ workspace_id: 'w5', label: 'repo' }],
          tabs: [{ tab_id: 'w5:t1', label: 'host', workspace_id: 'w5' }],
          panes: [{ ...seatedPane('w5:p1', 'w5:t1', '/var/elsewhere'), agent_status: 'idle' }],
        }),
      ],
    });
    const path: string = leaf(f, 'routed', 'plan.synthesis');
    const result: Result = await next(f, ['routed'], { HERDR_SOCKET_PATH: socket(f, 'other') });
    expect(result.code).toBe(0);
    const state: State = readState(path);
    const main = toSession(f, 'main');
    expect(main.some((args) => args[2] === 'tab' && args[3] === 'create')).toBe(true);
    expect(main.some((args) => args[2] === 'agent' && args[3] === 'prompt')).toBe(true);
    const other = toSession(f, 'other');
    for (const verb of ['create', 'split', 'start', 'prompt', 'close', 'rename', 'show']) {
      expect(other.some((args) => args.includes(verb))).toBe(false);
    }
    expect(z.string().parse(state.worktree)).toBe(worktree);
    const store = database(f).sessions!.find((s) => s.name === 'main')!;
    const pane = store.panes.find((p) => p.pane_id === state.pane.A)!;
    expect(pane.cwd).toBe(worktree);
  } finally {
    f.clean();
  }
});

test('refuses missing and duplicate repo workspaces while naming searched and skipped sessions', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [
        session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] }),
        session('resting', { running: false, workspaces: [{ workspace_id: 'w4', label: 'repo' }] }),
      ],
    });
    const path: string = leaf(f, 'unmatched', 'plan.synthesis');
    const result: Result = await next(f, ['unmatched'], { HERDR_SOCKET_PATH: socket(f, 'other') });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('repo');
    expect(result.stderr).toContain('other');
    expect(result.stderr).toContain('resting');
    expect(database(f).tabs).toHaveLength(0);
    expect(readState(path).pane.A).toBeUndefined();
    expect(toSession(f, 'resting')).toHaveLength(0);

    saveDatabase(f, {
      ...database(f),
      sessions: [
        session('main', { workspaces: [{ workspace_id: 'w5', label: 'repo' }] }),
        session('extra', { workspaces: [{ workspace_id: 'w6', label: 'repo' }] }),
      ],
    });
    const dup: Result = await next(f, ['unmatched']);
    expect(dup.code).toBe(1);
    expect(dup.stderr).toContain('main');
    expect(dup.stderr).toContain('w5');
    expect(dup.stderr).toContain('extra');
    expect(dup.stderr).toContain('w6');
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
});

test('a refused repo reports once in --all while a healthy repo still dispatches', async () => {
  const f: DispatchFixture = await dispatchFixture();
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
      debate: 'no',
      'blocked-by': [],
    });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as Record<string, unknown>;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: f.root, second } });
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [
        session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] }),
        session('main', { workspaces: [{ workspace_id: 'w5', label: 'second' }] }),
      ],
    });
    leaf(f, 'blocked-repo', 'plan.synthesis');
    // --all sweeps only the current checkout's repo when run inside one; run
    // from f.home so both registered repos are swept.
    const result: Result = await next(f, ['--all'], { HERDR_SOCKET_PATH: socket(f, 'other') }, f.home);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('repo');
    const refused: number = result.stderr.split('\n').filter((line) => line.includes('workspace')).length;
    expect(refused).toBeGreaterThan(0);
    expect(toSession(f, 'main').some((args) => args[2] === 'agent' && args[3] === 'prompt')).toBe(true);
  } finally {
    f.clean();
  }
}, 20000);

test('skips a listed-stopped session and a dead running session, and a read error refuses', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'skipped', 'plan.synthesis');
    // Listed stopped holding the only repo workspace: skipped, refused.
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [session('down', { running: false, workspaces: [{ workspace_id: 'w4', label: 'repo' }] })],
    });
    const down: Result = await next(f, ['skipped']);
    expect(down.code).toBe(1);
    expect(down.stderr).toContain('down');
    expect(toSession(f, 'down')).toHaveLength(0);

    // Listed running but answering server_not_running: skipped as stopped.
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [
        session('ghost', { deadRead: true, workspaces: [{ workspace_id: 'w4', label: 'repo' }] }),
        session('live', { workspaces: [{ workspace_id: 'w4', label: 'repo' }] }),
      ],
    });
    const ghost: Result = await next(f, ['skipped']);
    expect(ghost.code).toBe(0);
    expect(toSession(f, 'ghost').filter((args) => args[2] !== 'workspace')).toHaveLength(0);

    // Any other error refuses as unreadable.
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [session('broken', { readError: 'exploded', workspaces: [] })],
    });
    const broken: Result = await next(f, ['skipped']);
    expect(broken.code).toBe(1);
    expect(broken.stderr).toContain('broken');
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

test('a discovery read past the deadline refuses the repo', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      workspaces: [],
      sessions: [session('slow', { workspaces: [], delayMs: 30000 })],
    });
    leaf(f, 'deadline', 'plan.synthesis');
    const result: Result = await next(f, ['deadline']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('slow');
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 45000);

test('a failed session list is reported once per invocation', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, { ...database(f), sessionListError: 'fixture_session_list' });
    leaf(f, 'one', 'plan.synthesis');
    leaf(f, 'two', 'plan.synthesis');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    const lines: number = result.stderr.split('\n').filter((line) => line.includes('fixture_session_list')).length;
    expect(lines).toBe(1);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
});

test('agent start, prompt and the busy notice carry the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const path: string = leaf(f, 'routed2', 'plan.synthesis');
    expect((await next(f, ['routed2'], { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const routed = toSession(f, 'default');
    expect(routed.some((args) => args[2] === 'agent' && args[3] === 'start')).toBe(true);
    expect(routed.some((args) => args[2] === 'agent' && args[3] === 'prompt')).toBe(true);
    expect(toSession(f, 'other').filter((args) => args[2] === 'agent')).toHaveLength(0);

    // A failed prompt records the routed argv in delivery_error.command.
    const second: string = leaf(f, 'failprompt', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ code: 'agent_prompt_stalled' }] });
    expect((await next(f, ['failprompt'], { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const err = readState(second).delivery_error.A!;
    expect(err.command.slice(0, 4)).toEqual(['herdr', '--session', 'default', 'agent']);
    expect(err.command).toContain('prompt');

    // The busy notice is routed too.
    const started: State = readState(path);
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    saveState(path, {
      ...readState(path),
      busy_since: { A: new Date(now - 61 * 60000).toISOString() },
    });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) =>
        p.pane_id === started.pane.A ? { ...p, agent_status: 'blocked' as const } : p,
      ),
    });
    expect((await nextAt(f, 'routed2', now, { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const notices = toSession(f, 'default').filter((args) => args[2] === 'notification' && args[3] === 'show');
    expect(notices).toHaveLength(1);
    expect(toSession(f, 'other').filter((args) => args[2] === 'notification')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

test('the reconcile tab close carries the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const path: string = leaf(f, 'closing', 'plan.synthesis', {}, 'closed-owner');
    expect((await next(f, ['closing'], { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const state: State = readState(path);
    mkdirSync(resolve(f.root, 'issues/closed/closed-owner'), { recursive: true });
    const moved: string = resolve(f.root, 'issues/closed/closed-owner/closing');
    await command(['mv', path, moved], f.root);
    saveState(moved, { ...readState(moved), phase: 'merged', tab: state.tab });
    const before: number = toSession(f, 'default').length;
    expect((await next(f, [moved], { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const closes = toSession(f, 'default')
      .slice(before)
      .filter((args) => args[2] === 'tab' && args[3] === 'close');
    expect(closes).toHaveLength(1);
    expect(closes[0]).toContain(z.string().parse(state.tab));
    expect(toSession(f, 'other').filter((args) => args[2] === 'tab' && args[3] === 'close')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

test('second-seat guard refuses a foreign-session or foreign-workspace pane in the worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'guarded');
    leaf(f, 'guarded', 'plan.synthesis');
    // Same session, another workspace.
    saveDatabase(f, {
      ...database(f),
      workspaces: [
        { workspace_id: 'w1', label: 'repo' },
        { workspace_id: 'w9', label: 'misc' },
      ],
      tabs: [{ tab_id: 'w9:t1', label: 'x', workspace_id: 'w9' }],
      panes: [seatedPane('w9:p1', 'w9:t1', worktree)],
    });
    const sameSession: Result = await next(f, ['guarded']);
    expect(sameSession.code).toBe(1);
    expect(sameSession.stderr).toContain('w9:p1');
    expect(database(f).tabs.filter((t) => t.label === 'guarded')).toHaveLength(0);

    // Another session.
    saveDatabase(f, {
      ...database(f),
      workspaces: [{ workspace_id: 'w1', label: 'repo' }],
      tabs: [],
      panes: [],
      sessions: [
        session('other', {
          workspaces: [{ workspace_id: 'w9', label: 'misc' }],
          tabs: [{ tab_id: 'w9:t1', label: 'x', workspace_id: 'w9' }],
          panes: [seatedPane('w9:p1', 'w9:t1', worktree)],
        }),
      ],
    });
    const foreign: Result = await next(f, ['guarded'], { HERDR_SOCKET_PATH: socket(f, 'other') });
    expect(foreign.code).toBe(1);
    expect(foreign.stderr).toContain('other');
    expect(foreign.stderr).toContain('w9:p1');
    expect(database(f).tabs.filter((t) => t.label === 'guarded')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

test('tab reuse, pane close and liveness stay inside the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'reuse');
    await command(['git', 'worktree', 'add', '-b', 'reuse', worktree], f.root);
    // A same-id tab lives only in `other`; it must not be reused or closed.
    saveDatabase(f, {
      ...database(f),
      sessions: [
        session('other', {
          workspaces: [{ workspace_id: 'w9', label: 'misc' }],
          tabs: [{ tab_id: 'w1:tDup', label: 'reuse', workspace_id: 'w9' }],
          // The foreign pane's cwd stays outside the leaf worktree: a pane in
          // the worktree would trip the second-seat guard, which is not the
          // behavior under test here.
          panes: [{ ...seatedPane('w9:p9', 'w1:tDup', '/var/elsewhere'), agent_status: 'idle' as const }],
        }),
      ],
    });
    const path: string = leaf(f, 'reuse', 'plan.synthesis', { tab: 'w1:tDup', worktree });
    const result: Result = await next(f, ['reuse'], { HERDR_SOCKET_PATH: socket(f, 'other') });
    expect(result.code).toBe(0);
    expect(toSession(f, 'default').some((args) => args[2] === 'tab' && args[3] === 'create')).toBe(true);
    expect(toSession(f, 'other').some((args) => args.includes('close'))).toBe(false);
    expect(database(f).sessions![0].tabs[0].tab_id).toBe('w1:tDup');
    // The leaf's recorded tab is the one created in default.
    const state: State = readState(path);
    expect(state.tab).not.toBe('w1:tDup');
  } finally {
    f.clean();
  }
});

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

test('phase renames and the failed notice carry the resolved session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    saveDatabase(f, {
      ...database(f),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const path: string = leaf(f, 'renamed', 'plan.synthesis');
    expect((await next(f, ['renamed'], { HERDR_SOCKET_PATH: socket(f, 'other') })).code).toBe(0);
    const worktree: string = z.string().parse(readState(path).worktree);
    const moved: Result = await cli(
      f,
      ['phase', 'renamed', 'failed', '--slot', 'A', '--reason', 'blocked for test'],
      worktree,
      { ...f.env, HERDR_SOCKET_PATH: socket(f, 'other') },
    );
    expect(moved.code).toBe(0);
    const routed = toSession(f, 'default');
    expect(routed.some((args) => args[2] === 'notification' && args[3] === 'show')).toBe(true);
    expect(routed.some((args) => args[2] === 'tab' && args[3] === 'rename' && args[5] === 'renamed failed')).toBe(true);
    // Only mutations count: the second-seat guard legitimately reads pane/tab
    // lists in every running session, including `other`.
    expect(
      toSession(f, 'other').filter(
        (args) =>
          (args[2] === 'tab' && ['create', 'rename', 'close'].includes(args[3] ?? '')) || args[2] === 'notification',
      ),
    ).toHaveLength(0);
    // Recovery renames back in the same session.
    const back: Result = await cli(f, ['phase', 'renamed', 'plan.synthesis'], worktree, {
      ...f.env,
      HERDR_SOCKET_PATH: socket(f, 'other'),
    });
    expect(back.code).toBe(0);
    expect(
      toSession(f, 'default').some((args) => args[2] === 'tab' && args[3] === 'rename' && args[5] === 'renamed'),
    ).toBe(true);
  } finally {
    f.clean();
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

test('second-seat guard rejects equal workspace IDs in different sessions', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'collision');
    leaf(f, 'collision', 'plan.synthesis');
    saveDatabase(f, {
      ...database(f),
      sessions: [
        session('other', {
          workspaces: [{ workspace_id: 'w1', label: 'misc' }],
          tabs: [{ tab_id: 'w1:t90', label: 'collision', workspace_id: 'w1' }],
          panes: [seatedPane('w1:p90', 'w1:t90', worktree)],
        }),
      ],
    });
    const result: Result = await next(f, ['collision']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('other');
    expect(result.stderr).toContain('w1:p90');
    expect(toSession(f, 'default').some((args) => args[2] === 'tab' && args[3] === 'create')).toBe(false);
  } finally {
    f.clean();
  }
});

test('recorded tab without a worktree member is neither closed nor reused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'foreign-cwd');
    await command(['git', 'worktree', 'add', '-b', 'foreign-cwd', worktree], f.root);
    leaf(f, 'foreign-cwd', 'plan.synthesis', { tab: 'w1:t90', pane: { A: 'w1:p90' }, worktree });
    saveDatabase(f, {
      ...database(f),
      serial: 100,
      tabs: [{ tab_id: 'w1:t90', label: 'unrelated', workspace_id: 'w1' }],
      panes: [seatedPane('w1:p90', 'w1:t90', '/var/elsewhere')],
    });
    const result: Result = await next(f, ['foreign-cwd']);
    expect(result.code).toBe(0);
    const calls: string[][] = toSession(f, 'default');
    expect(calls.some((args) => args[2] === 'pane' && args[3] === 'close' && args[4] === 'w1:p90')).toBe(false);
    expect(calls.some((args) => args[2] === 'agent' && args.includes('w1:p90'))).toBe(false);
    expect(database(f).panes.some((pane) => pane.pane_id === 'w1:p90')).toBe(true);
    expect(readState(resolve(f.root, 'issues/open/issue/foreign-cwd')).tab).not.toBe('w1:t90');
  } finally {
    f.clean();
  }
});
