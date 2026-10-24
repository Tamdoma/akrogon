import { test, expect } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, fakeHerdr, storeDir, yaml, holding, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command } from '../src/shell';
import type { Result } from '../src/shell';
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
  paneListStdout?: string;
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
function maxActive(f: DispatchFixture, value: number): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, max_active: value });
}
function tabClosed(tab: string, workspace_id: string): NodeJS.ProcessEnv {
  return {
    HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
      event: 'tab_closed',
      data: { type: 'tab_closed', tab_id: tab, workspace_id },
    }),
  };
}

// Criterion 1: a seat whose pane lives in another session still counts, and an
// unreadable running session blocks every launch.
test('capacity counts a seat living in another session and an unreadable session blocks launches', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    maxActive(f, 1);
    const worktree: string = resolve(storeDir(f), 'held');
    await command(['git', 'worktree', 'add', '-b', 'held', worktree], f.root);
    leaf(f, 'held', 'implement', { tab: 'w9:tA', pane: { A: 'w9:pA' }, worktree });
    leaf(f, 'waiting', 'plan.synthesis');
    saveDatabase(f, {
      ...database(f),
      sessions: [
        session('held', {
          workspaces: [{ workspace_id: 'w9', label: 'misc' }],
          tabs: [{ tab_id: 'w9:tA', label: 'held', workspace_id: 'w9' }],
          panes: [{ ...seatedPane('w9:pA', 'w9:tA', worktree), agent: 'fake', agent_status: 'working' }],
        }),
      ],
    });
    const result: Result = await next(f, ['waiting']);
    expect(result.code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/waiting')).tab).toBeUndefined();
    expect(database(f).tabs).toHaveLength(0);

    // A running session whose pane list cannot be read leaves capacity unknown.
    saveDatabase(f, {
      ...database(f),
      sessions: [
        session('held', {
          workspaces: [{ workspace_id: 'w9', label: 'misc' }],
          paneListStdout: 'this is not json',
        }),
      ],
    });
    const blocked: Result = await next(f, ['waiting']);
    expect(blocked.code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/waiting')).tab).toBeUndefined();
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

test('capacity counts an unreadable session before any leaf has a seat', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'waiting', 'plan.synthesis');
    saveDatabase(f, {
      ...database(f),
      sessions: [session('opaque', { paneListStdout: 'not json' })],
    });
    const result: Result = await next(f, ['waiting']);
    expect(result.code).toBe(0);
    expect(readState(path).tab).toBeUndefined();
    expect(readState(path).worktree).toBeUndefined();
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 20000);

// Criterion 2: the cross-session pane union vetoes worktree removal; a same-id
// tab in a foreign session is no veto; an unreadable session keeps everything
// its liveness could decide.
test('foreign-session panes and unreadable sessions veto reconcile removal', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    // `sibling` is failed with a dead recorded tab: it never dispatches, so
    // the merged leaves' owner never completes and their worktrees reach the
    // removal path.
    leaf(f, 'sibling', 'failed', { tab: 'w1:tS' });
    const keptByPane: string = resolve(storeDir(f), 'kept-by-pane');
    const keptByUnreadable: string = resolve(storeDir(f), 'kept-by-unreadable');
    const droppedSameId: string = resolve(storeDir(f), 'dropped-same-id');
    for (const [slug, path] of [
      ['kept-by-pane', keptByPane],
      ['kept-by-unreadable', keptByUnreadable],
      ['dropped-same-id', droppedSameId],
    ] as const) {
      await command(['git', 'worktree', 'add', '-b', slug, path], f.root);
    }
    leaf(f, 'kept-by-pane', 'merged', { tab: 'w1:tK', worktree: keptByPane });
    leaf(f, 'kept-by-unreadable', 'merged', { tab: 'w1:tU', worktree: keptByUnreadable });
    leaf(f, 'dropped-same-id', 'merged', { tab: 'w9:tD', worktree: droppedSameId });
    saveDatabase(f, {
      ...database(f),
      sessions: [
        // `other` is readable: its panes inside the kept-* worktrees veto
        // removal, and its same-id tab for dropped-same-id is no keep.
        session('other', {
          workspaces: [{ workspace_id: 'w9', label: 'misc' }],
          tabs: [
            { tab_id: 'w9:tF', label: 'foreign', workspace_id: 'w9' },
            { tab_id: 'w9:tU', label: 'foreign2', workspace_id: 'w9' },
            { tab_id: 'w9:tD', label: 'same-id', workspace_id: 'w9' },
          ],
          panes: [
            seatedPane('w9:pF', 'w9:tF', keptByPane),
            seatedPane('w9:pU', 'w9:tU', keptByUnreadable),
            { ...seatedPane('w9:pD', 'w9:tD', '/var/elsewhere'), agent_status: 'idle' },
          ],
        }),
      ],
    });
    const openLeaf = (slug: string): string => resolve(f.root, 'issues/open/issue', slug);
    const first: Result = await next(f, ['--all'], { HERDR_SOCKET_PATH: socket(f, 'default') });
    expect(first.code).toBe(0);
    expect(existsSync(keptByPane)).toBe(true);
    expect(existsSync(keptByUnreadable)).toBe(true);
    // The same-id tab in `other` is not a live-tab veto: the worktree drops.
    expect(existsSync(droppedSameId)).toBe(false);
    expect(readState(openLeaf('dropped-same-id')).worktree).toBeUndefined();
    expect(readState(openLeaf('kept-by-pane')).worktree).toBe(keptByPane);

    // Now `opaque` answers every pane read with garbage while kept-by-
    // unreadable holds a live tab in the resolved session: the pass may close
    // and drop nothing.
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: [...db.tabs, { tab_id: 'w1:tU', label: 'kept', workspace_id: 'w1' }],
      panes: [...db.panes, { ...seatedPane('w1:pU', 'w1:tU', keptByUnreadable), agent_status: 'idle' }],
      sessions: [
        ...(db.sessions ?? []),
        session('opaque', { workspaces: [{ workspace_id: 'w8', label: 'alt' }], paneListStdout: 'junk' }),
      ],
    });
    const second: Result = await next(f, ['--all'], { HERDR_SOCKET_PATH: socket(f, 'default') });
    expect(second.code).toBe(0);
    expect(existsSync(keptByUnreadable)).toBe(true);
    // Its recorded tab was live in the resolved session but could not be
    // closed while `opaque` stayed unreadable.
    expect(database(f).tabs.some((tab) => tab.tab_id === 'w1:tU')).toBe(true);
    expect(existsSync(keptByPane)).toBe(true);
  } finally {
    f.clean();
  }
}, 40000);

// Criterion 3: within one pass the inventory reflects launches already made;
// a leaf whose recorded tab is gone counts nothing and reallocates.
test('a fresh pane read sees the seat created earlier in the pass and ignores a closed tab', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    maxActive(f, 1);
    leaf(f, 'a-first', 'plan.synthesis');
    leaf(f, 'b-second', 'plan.synthesis');
    const result: Result = await next(f, ['--all'], { HERDR_SOCKET_PATH: socket(f, 'default') });
    expect(result.code).toBe(0);
    // Sweep order is unspecified: exactly one of the two leaves gets the seat.
    const tabs: (string | undefined)[] = ['a-first', 'b-second'].map(
      (slug) => readState(resolve(f.root, 'issues/open/issue', slug)).tab,
    );
    expect(tabs.filter((tab) => tab !== undefined)).toHaveLength(1);
    expect(database(f).tabs).toHaveLength(1);

    // A leaf whose recorded tab was closed counts nothing and reallocates.
    maxActive(f, 2);
    leaf(f, 'gone', 'plan.synthesis', { tab: 'w1:tGone' });
    saveDatabase(f, { ...database(f), tabs: [], panes: database(f).panes.filter((p) => p.tab_id !== 'w1:tGone') });
    const redo: Result = await next(f, ['gone'], { HERDR_SOCKET_PATH: socket(f, 'default') });
    expect(redo.code).toBe(0);
    const state: State = readState(resolve(f.root, 'issues/open/issue/gone'));
    expect(state.tab).toBeDefined();
    expect(state.tab).not.toBe('w1:tGone');
  } finally {
    f.clean();
  }
}, 30000);

// Criterion 4: a hook acts only when the injected socket identifies the repo's
// resolved session and the event's workspace_id equals the resolved workspace.
test('a tab_closed hook acts only for a matching socket and workspace', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    expect((await next(f, ['first'], { HERDR_SOCKET_PATH: socket(f, 'default') })).code).toBe(0);
    const tab: string = z.string().parse(readState(first).tab);
    saveState(first, { ...readState(first), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    const closedDb: Database = database(f);
    saveDatabase(f, {
      ...closedDb,
      tabs: closedDb.tabs.filter((item) => item.tab_id !== tab),
      panes: closedDb.panes.filter((pane) => pane.tab_id !== tab),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    const second: string = resolve(f.root, 'issues/open/second-issue/second');

    // Unknown origin: no socket, nothing happens and the log says why.
    const noSocket: Result = await next(f, [], tabClosed(tab, 'w1'));
    expect(noSocket.code).toBe(0);
    expect(noSocket.stderr).toContain('origin');
    expect(readState(second).tab).toBeUndefined();

    // A different emitting session, even with a matching-looking workspace id.
    const wrongSession: Result = await next(f, [], {
      ...tabClosed(tab, 'w9'),
      HERDR_SOCKET_PATH: socket(f, 'other'),
    });
    expect(wrongSession.code).toBe(0);
    expect(wrongSession.stderr).toContain('other');
    expect(readState(second).tab).toBeUndefined();

    // Right session, wrong workspace_id.
    const wrongWorkspace: Result = await next(f, [], {
      ...tabClosed(tab, 'w7'),
      HERDR_SOCKET_PATH: socket(f, 'default'),
    });
    expect(wrongWorkspace.code).toBe(0);
    expect(wrongWorkspace.stderr).toContain('w7');
    expect(readState(second).tab).toBeUndefined();

    // Both matching: the dependent starts.
    const matching: Result = await next(f, [], {
      ...tabClosed(tab, 'w1'),
      HERDR_SOCKET_PATH: socket(f, 'default'),
    });
    expect(matching.code).toBe(0);
    expect(readState(second).tab).toBeDefined();
  } finally {
    f.clean();
  }
}, 30000);

// Criterion 5: ids come from the event JSON; an inherited HERDR_PANE_ID is no
// attribution, and a session/workspace mismatch takes no action.
test('a pane event acts on the event pane only inside the matching session and workspace', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'ev', 'plan.synthesis');
    expect((await next(f, ['ev'], { HERDR_SOCKET_PATH: socket(f, 'default') })).code).toBe(0);
    const a: string = z.string().parse(readState(path).pane.A);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'idle' as const } : p)),
      sessions: [session('other', { workspaces: [{ workspace_id: 'w9', label: 'misc' }] })],
    });
    saveState(path, {
      ...readState(path),
      prompted_at: { ...readState(path).prompted_at, A: '2020-01-01T00:00:00.000Z' },
    });
    const prompts = (): number => database(f).prompts.length;
    expect(prompts()).toBe(1);

    // Emitting session is `other`, workspace matches `other` — not this repo.
    const wrongSession: Result = await next(f, [], {
      HERDR_PANE_ID: a,
      HERDR_SOCKET_PATH: socket(f, 'other'),
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_exited',
        data: { type: 'pane_exited', pane_id: a, workspace_id: 'w9' },
      }),
    });
    expect(wrongSession.code).toBe(0);
    expect(prompts()).toBe(1);

    // Right session, wrong workspace.
    const wrongWorkspace: Result = await next(f, [], {
      HERDR_PANE_ID: a,
      HERDR_SOCKET_PATH: socket(f, 'default'),
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_exited',
        data: { type: 'pane_exited', pane_id: a, workspace_id: 'w7' },
      }),
    });
    expect(wrongWorkspace.code).toBe(0);
    expect(prompts()).toBe(1);

    // Matching origin and workspace: the event's pane_id drives the pass even
    // though the inherited env names a pane that owns nothing.
    const matching: Result = await next(f, [], {
      HERDR_PANE_ID: 'w1:pZZZ',
      HERDR_SOCKET_PATH: socket(f, 'default'),
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_exited',
        data: { type: 'pane_exited', pane_id: a, workspace_id: 'w1' },
      }),
    });
    expect(matching.code).toBe(0);
    expect(prompts()).toBe(2);
  } finally {
    f.clean();
  }
}, 30000);

// Criterion 6: a manual run takes scope from the target or cwd; an inherited
// HERDR_PANE_ID never selects, attributes or acts on a leaf.
test('a manual next ignores an inherited HERDR_PANE_ID', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const target: string = leaf(f, 'target', 'plan.synthesis');
    const other: string = leaf(f, 'other-seat', 'plan.synthesis');
    expect((await next(f, ['other-seat'], { HERDR_SOCKET_PATH: socket(f, 'default') })).code).toBe(0);
    const otherPane: string = z.string().parse(readState(other).pane.A);
    const promptsBefore: number = database(f).prompts.length;

    const named: Result = await next(f, ['target'], { HERDR_PANE_ID: otherPane });
    expect(named.code).toBe(0);
    expect(readState(target).tab).toBeDefined();

    // Untyped from the repo root: the sweep, not the env pane, picks leaves.
    const untyped: Result = await next(f, [], { HERDR_PANE_ID: otherPane });
    expect(untyped.code).toBe(0);
    expect(database(f).prompts.length).toBe(promptsBefore + 1);
    expect(database(f).prompts.some((prompt) => prompt.text.includes('target'))).toBe(true);
  } finally {
    f.clean();
  }
}, 30000);

// Criterion 7: a move without a slot records session:null even when
// HERDR_PANE_ID names a live pane; a slotted move attributes through the
// slot's recorded pane, never the environment pane.
test('log session is null without a slot and comes from the slot pane otherwise', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'loggy', 'plan.synthesis');
    expect((await next(f, ['loggy'], { HERDR_SOCKET_PATH: socket(f, 'default') })).code).toBe(0);
    const state: State = readState(path);
    const a: string = z.string().parse(state.pane.A);
    const b: string = z.string().parse(state.pane.B);
    const worktree: string = z.string().parse(state.worktree);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) =>
        p.pane_id === a
          ? { ...p, agent_status: 'idle' as const, agent_session: { kind: 'id' as const, value: 'sess-a' } }
          : p.pane_id === b
            ? { ...p, agent_status: 'idle' as const, agent_session: { kind: 'id' as const, value: 'sess-b' } }
            : p,
      ),
    });
    const logPath: string = resolve(f.root, 'issues/log.jsonl');
    const lastSession = (): string | null =>
      z
        .object({ session: z.string().nullable() })
        .parse(JSON.parse(readFileSync(logPath, 'utf8').trim().split('\n').at(-1)!)).session;

    // Slotted move with the env pointing at pane B: attribution is pane A's.
    const failed: Result = await cli(f, ['phase', 'loggy', 'failed', '--slot', 'A', '--reason', 'blocked'], worktree, {
      ...f.env,
      HERDR_PANE_ID: b,
    });
    expect(failed.code).toBe(0);
    expect(lastSession()).toBe('sess-a');

    // Operator recovery with no slot: session is null even though the env
    // pane names a live, sessioned pane in the resolved session.
    const recovered: Result = await cli(f, ['phase', 'loggy', 'plan.synthesis'], worktree, {
      ...f.env,
      HERDR_PANE_ID: a,
    });
    expect(recovered.code).toBe(0);
    expect(lastSession()).toBeNull();
  } finally {
    f.clean();
  }
}, 30000);
