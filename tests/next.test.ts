import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, entry, leaf, yaml, fakeGh, fakeHerdr, type GhFixture, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import type { GhStep } from './fake-gh';
import type { Database } from './fake-herdr';
import { z } from 'zod';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function saveDatabase(f: DispatchFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}
function calls(f: DispatchFixture): string[][] {
  const path: string = f.db + '.calls';
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    : [];
}
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}

for (const kind of ['relative file', 'absolute file', 'file symlink']) {
  test(`next rejects ${kind} before dispatch or leaf mutation`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'build', 'plan.synthesis');
      const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
      symlinkSync(resolve(f.root, 'file'), resolve(f.root, 'file-link'));
      const target: string =
        kind === 'absolute file' ? resolve(f.root, 'file') : kind === 'file symlink' ? 'file-link' : 'file';
      const result: Result = await next(f, [target]);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(target);
      expect(result.stderr).toContain('leaf folder');
      expect(result.stderr).toContain('slug');
      expect(result.stderr).toContain('worktree path');
      expect(result.stderr).not.toContain('ENOTDIR');
      expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
      expect(calls(f)).toEqual([]);
      expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
    } finally {
      f.clean();
    }
  });
}

for (const kind of ['leaf folder', 'worktree path']) {
  test(`next dispatches an explicit ${kind}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const worktree: string = resolve(f.root, 'issues/worktrees/build');
      if (kind === 'worktree path') await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
      const path: string = leaf(f, 'build', 'plan.synthesis', kind === 'worktree path' ? { worktree } : {});
      expect((await next(f, [kind === 'worktree path' ? worktree : path])).code).toBe(0);
      expect(database(f).prompts).toHaveLength(1);
      expect(readState(path).attempts.B).toBe(1);
    } finally {
      f.clean();
    }
  });
}

for (const stdout of ['not-json-response', '{"result":{"panes":"invalid-panes"}}']) {
  test(`next reports Herdr response context for ${stdout}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      leaf(f, 'build', 'plan.synthesis');
      saveDatabase(f, { ...database(f), paneListStdout: stdout });
      const result: Result = await next(f, ['build']);
      expect(result.code).not.toBe(0);
      const diagnostic: string = skips(result)[0].error;
      const response: { command: string[]; cwd: string; stdout: string; error: string } = z
        .object({ command: z.array(z.string()), cwd: z.string(), stdout: z.string(), error: z.string() })
        .parse(JSON.parse(diagnostic));
      expect(response.command).toEqual(['herdr', 'pane', 'list']);
      expect(response.cwd).toBe(f.root);
      expect(response.stdout).toBe(stdout);
      expect(response.error).toMatch(stdout.startsWith('{') ? /array/ : /JSON/);
      expect(database(f).prompts).toHaveLength(0);
    } finally {
      f.clean();
    }
  });
}

test('next creates one worktree/tab under concurrent hooks, prompts configured B, ignores working events and resolves hook cwd', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const results: Result[] = await Promise.all([next(f, ['build']), next(f, ['build'])]);
    expect(results.map((r) => r.code)).toEqual([0, 0]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^(priority|slot):/m);
    const db: Database = database(f);
    expect(db.tabs).toHaveLength(1);
    expect(db.panes).toHaveLength(2);
    expect(db.prompts).toHaveLength(1);
    expect(db.prompts[0].text).toBe(`plan-issue build slot=B phase=plan.synthesis leaf=${path}`);
    expect(db.prompts[0].text.endsWith(` leaf=${f.root}/issues/open/issue/build`)).toBe(true);
    expect(db.prompts[0].text.split(' leaf=')[1]).not.toContain('issues/worktrees');
    console.log(db.prompts[0].text);
    expect(db.starts[0]).toContain('strong-b');
    expect(calls(f).some((args) => args[0] === 'notification')).toBe(false);
    expect(readState(path).attempts.B).toBe(1);
    const b: string = readState(path).pane.B!;
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(readState(path).attempts.B).toBe(1);
    expect(await command(['git', 'branch', '--show-current'], readState(path).worktree)).toBe('build');
  } finally {
    f.clean();
  }
}, 15000);

test('next from an operator pane owning no leaf dispatches by cwd instead of returning silently', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'shell', 'plan.synthesis');
    expect((await next(f, [], { HERDR_PANE_ID: 'operator' })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(path).attempts.B).toBe(1);
  } finally {
    f.clean();
  }
}, 15000);

test('next re-prompts an idle seat whose prompt is older than the grace period and the phase never moved', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'stalled', 'plan.synthesis');
    expect((await next(f, ['stalled'])).code).toBe(0);
    const b: string = readState(path).pane.B!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === b ? { ...p, agent_status: 'idle' } : p)) });
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    const state: State = readState(path);
    saveState(path, { ...state, prompted_at: { B: new Date(Date.now() - 3 * 60 * 1000).toISOString() } });
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
    expect(readState(path).attempts.B).toBe(2);
  } finally {
    f.clean();
  }
}, 15000);

test('a stale prompt never re-prompts a busy or done seat, and three stale misses fail the leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'misses', 'plan.synthesis');
    expect((await next(f, ['misses'])).code).toBe(0);
    const b: string = readState(path).pane.B!;
    expect(database(f).prompts).toEqual([
      { pane: b, text: `plan-issue misses slot=B phase=plan.synthesis leaf=${path}` },
    ]);
    expect(readState(path).attempts).toEqual({ A: 0, B: 1 });
    const stale = (): void =>
      saveState(path, { ...readState(path), prompted_at: { B: new Date(Date.now() - 3 * 60 * 1000).toISOString() } });
    const status = (agent_status: 'idle' | 'working'): void => {
      const db: Database = database(f);
      saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status })) });
    };
    status('working');
    stale();
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(path).attempts).toEqual({ A: 0, B: 1 });
    status('idle');
    saveState(path, { ...readState(path), done: ['B'] });
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    saveState(path, { ...readState(path), done: [] });
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
    expect(readState(path).attempts).toEqual({ A: 0, B: 2 });
    status('idle');
    stale();
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(3);
    expect(readState(path).attempts).toEqual({ A: 0, B: 3 });
    expect(readState(path).phase).toBe('plan.synthesis');
    status('idle');
    stale();
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(readState(path).phase).toBe('failed');
    expect(readState(path).failure).toEqual({
      cause: 'attempts',
      phase: 'plan.synthesis',
      slot: 'B',
      reason: 'attempts exhausted',
      delivery: 'shown',
    });
    expect(database(f).prompts.every((p) => p.pane === b)).toBe(true);
  } finally {
    f.clean();
  }
}, 20000);

test('next does not re-prompt a slot whose prompted session is still alive, and re-prompts a new session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'flicker', 'plan.synthesis');
    expect((await next(f, ['flicker'])).code).toBe(0);
    const b: string = readState(path).pane.B!;
    expect(readState(path).prompted.B).toBeDefined();
    const flicker: Database = database(f);
    saveDatabase(f, {
      ...flicker,
      panes: flicker.panes.map((p) => (p.pane_id === b ? { ...p, agent_status: 'idle' } : p)),
    });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(path).busy_since.B).toBeUndefined();
    expect(readState(path).busy_notified.B).toBeUndefined();
    expect(readState(path).attempts.B).toBe(1);
    const replaced: Database = database(f);
    saveDatabase(f, {
      ...replaced,
      panes: replaced.panes.map((p) =>
        p.pane_id === b ? { ...p, agent_status: 'idle', agent_session: { value: 'other' } } : p,
      ),
    });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
    expect(readState(path).attempts.B).toBe(2);
  } finally {
    f.clean();
  }
}, 15000);

test('next waits on a blocked agent instead of counting attempts or flipping seats', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'dialog', 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, ['dialog'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(0);
    expect(readState(path).busy_since.B).toBeDefined();
    expect(database(f).starts).toHaveLength(1);
    expect(readState(path).attempts.B).toBe(1);
    const b: string = readState(path).pane.B!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === b ? { ...p, agent_status: 'idle' } : p)) });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(database(f).prompts[0].pane).toBe(b);
    expect(readState(path).attempts.B).toBe(2);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    f.clean();
  }
}, 15000);

test('next resumes interrupted tab creation, retries same slot twice and fails', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'retry', 'plan.synthesis');
    saveDatabase(f, { ...database(f), failSplitOnce: true });
    expect((await next(f, ['retry'])).code).not.toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    saveDatabase(f, { ...database(f), failPrompts: true });
    const retried: Result = await next(f, ['retry']);
    expect(retried.code).toBe(0);
    expect(readState(path).phase).toBe('failed');
    const db: Database = database(f);
    expect(db.tabs).toHaveLength(1);
    expect(db.prompts).toHaveLength(3);
    expect(db.prompts[0].pane).toBe(db.prompts[1].pane);
    expect(db.prompts[2].pane).toBe(db.prompts[0].pane);
    expect(db.prompts.every((p) => p.text.includes('slot=B'))).toBe(true);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"failed"');
    const before: number = calls(f).length;
    const stateBefore: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    expect((await next(f, ['retry'])).code).toBe(0);
    const notified: string[][] = calls(f)
      .slice(before)
      .filter((args) => args[0] === 'notification');
    expect(notified).toHaveLength(0);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(stateBefore);
  } finally {
    f.clean();
  }
}, 15000);

test('failed leaves never notify on dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'broken', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'x' },
    });
    expect(readState(path)).toMatchObject({ busy_since: {}, busy_notified: {} });
    saveDatabase(f, { ...database(f), failNotification: true });
    const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    for (let sweep: number = 0; sweep < 3; sweep++) expect((await next(f, ['broken'])).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    expect(database(f)).toMatchObject({ prompts: [], starts: [], tabs: [], panes: [] });
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    saveDatabase(f, { ...database(f), failNotification: false });
    expect((await next(f, ['broken'])).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
});

async function nextAt(f: DispatchFixture, slug: string, now: number): Promise<Result> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
    [
      process.execPath,
      '--eval',
      `Date.now = () => ${now}; process.argv = ['bun', ${JSON.stringify(entry)}, 'next', ${JSON.stringify(slug)}]; await import(${JSON.stringify(entry)});`,
    ],
    {
      cwd: f.root,
      env: { ...process.env, AKROGON_HOME: f.home, HERDR_PANE_ID: '', ...f.env },
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    },
  );
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { stdout, stderr, code };
}

test('busy seats persist, warn strictly after an hour, retry delivery and clear independent episodes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'busy', 'plan.positions');
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    expect((await nextAt(f, 'busy', now)).code).toBe(0);
    const started: State = readState(path);
    expect(started.busy_since).toEqual({ A: new Date(now).toISOString(), B: new Date(now).toISOString() });
    saveDatabase(f, { ...database(f), panes: database(f).panes.map((p) => ({ ...p, agent_status: 'blocked' })) });
    for (const minutes of [59, 60]) expect((await nextAt(f, 'busy', now + minutes * 60000)).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    saveDatabase(f, { ...database(f), failNotification: true });
    const failed: Result = await nextAt(f, 'busy', now + 61 * 60000);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('fixture_notification_failed');
    expect(readState(path).busy_since).toEqual(started.busy_since);
    expect(readState(path).busy_notified).toEqual({});
    saveDatabase(f, { ...database(f), failNotification: false });
    for (const minutes of [61, 62]) expect((await nextAt(f, 'busy', now + minutes * 60000)).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(3);
    expect(readState(path)).toMatchObject({
      phase: started.phase,
      pane: started.pane,
      attempts: started.attempts,
      busy_since: started.busy_since,
    });
    expect(Object.keys(readState(path).busy_notified)).toEqual(['A', 'B']);
    saveState(path, { ...readState(path), phase: 'plan.synthesis' });
    for (const status of ['idle', 'done'] as const) {
      saveDatabase(f, {
        ...database(f),
        panes: database(f).panes.map((p) =>
          p.pane_id === started.pane.A ? { ...p, agent_status: status, agent: 'fake' } : p,
        ),
      });
      expect((await nextAt(f, 'busy', now + 63 * 60000)).code).toBe(0);
      expect(readState(path).busy_since.A).toBeUndefined();
      expect(readState(path).busy_notified.A).toBeUndefined();
      expect(readState(path).busy_notified.B).toBeDefined();
      saveDatabase(f, {
        ...database(f),
        panes: database(f).panes.map((p) =>
          p.pane_id === started.pane.A ? { ...p, agent: 'fake', agent_status: 'working' } : p,
        ),
      });
      expect((await nextAt(f, 'busy', now + 64 * 60000)).code).toBe(0);
      expect(readState(path).busy_since.A).toBe(new Date(now + 64 * 60000).toISOString());
    }
    saveState(path, {
      ...readState(path),
      busy_since: { B: readState(path).busy_since.B! },
      busy_notified: { B: readState(path).busy_notified.B! },
    });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) =>
        p.pane_id === started.pane.A ? { ...p, agent_status: 'unknown', agent: 'fake' } : p,
      ),
    });
    {
      const promptsBefore: number = database(f).prompts.length;
      const attemptsBefore: { A: number; B: number } = { ...readState(path).attempts };
      expect((await nextAt(f, 'busy', now + 63 * 60000)).code).toBe(0);
      expect(database(f).prompts).toHaveLength(promptsBefore);
      expect(readState(path).attempts).toEqual(attemptsBefore);
      expect(readState(path).busy_since.A).toBe(new Date(now + 63 * 60000).toISOString());
      saveDatabase(f, {
        ...database(f),
        panes: database(f).panes.map((p) =>
          p.pane_id === started.pane.A ? { ...p, agent: 'fake', agent_status: 'working' } : p,
        ),
      });
      expect((await nextAt(f, 'busy', now + 64 * 60000)).code).toBe(0);
      expect(readState(path).busy_since.A).toBe(new Date(now + 63 * 60000).toISOString());
    }
    expect((await nextAt(f, 'busy', now + 125 * 60000)).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(4);
  } finally {
    f.clean();
  }
}, 30000);

test('unknown panes wait, warn after an hour and keep busy observations', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'fallback', 'plan.synthesis');
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    expect((await nextAt(f, 'fallback', now)).code).toBe(0);
    const initial: State = readState(path);
    saveState(path, { ...initial, attempts: { A: 0, B: 2 }, busy_since: {}, prompted: {} });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) => (p.pane_id === initial.pane.B ? { ...p, agent_status: 'unknown' } : p)),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await nextAt(f, 'fallback', now)).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(path)).toMatchObject({ attempts: { A: 0, B: 2 }, busy_since: { B: new Date(now).toISOString() } });
    expect(readState(path).busy_since.A).toBeUndefined();
    expect((await nextAt(f, 'fallback', now + 61 * 60000)).code).toBe(0);
    const notifications: string[][] = calls(f).filter((args) => args[0] === 'notification');
    expect(notifications).toHaveLength(1);
    expect(notifications[0][2]).toContain('seat B');
    expect(readState(path).busy_notified.B).toBeDefined();
    expect(readState(path).busy_notified.A).toBeUndefined();
    saveState(path, { ...readState(path), done: ['B'] });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) => ({ ...p, agent: 'fake', agent_status: 'unknown' })),
    });
    expect((await nextAt(f, 'fallback', now + 62 * 60000)).code).toBe(0);
    expect(readState(path).busy_since.B).toBe(new Date(now).toISOString());
    expect(readState(path).busy_since.A).toBe(new Date(now + 62 * 60000).toISOString());
  } finally {
    f.clean();
  }
}, 15000);

test('next refuses hand-built and dependencies, respects capacity, and waits on unknown panes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['first'] });
    leaf(f, 'manual', 'implement', { hand_built: true });
    const missing: string = leaf(f, 'missing', 'plan.synthesis', { 'blocked-by': ['absent'] });
    expect((await next(f, ['manual'])).code).not.toBe(0);
    expect((await next(f, ['dependent'])).code).not.toBe(0);
    expect((await next(f, ['missing'])).code).not.toBe(0);
    saveState(missing, { ...readState(missing), 'blocked-by': ['first'] });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, max_active: 1 });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    expect(readState(dependent).worktree).toBeUndefined();
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => (p.pane_id === readState(first).pane.B ? { ...p, agent_status: 'unknown' } : p)),
    });
    const promptsBefore: number = database(f).prompts.length;
    const attemptsBefore: { A: number; B: number } = { ...readState(first).attempts };
    expect((await next(f, ['first'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(first).busy_since.B).toBeDefined();
    expect(readState(first).attempts).toEqual(attemptsBefore);
  } finally {
    f.clean();
  }
}, 15000);

test('a merged leaf with its tab still open does not count toward max_active', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const dependent: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, max_active: 1 });
    expect((await next(f, ['first'])).code).toBe(0);
    const b: string = readState(first).pane.B!;
    saveState(first, { ...readState(first), phase: 'merge' });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
    expect(readState(dependent).attempts.B).toBe(1);
  } finally {
    f.clean();
  }
}, 15000);

test('a closed tab hook from a merged leaf sweeps and starts the next leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const dependent: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    expect((await next(f, ['first'])).code).toBe(0);
    const tab: string = readState(first).tab!;
    saveState(first, { ...readState(first), phase: 'merge' });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== tab),
      panes: db.panes.filter((pane) => pane.tab_id !== tab),
      workspaces: [{ workspace_id: 'w2', label: 'repo' }],
    });
    const closed: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w2' },
      }),
    });
    expect(closed.code).toBe(0);
    expect(database(f).tabs.map((item) => item.label)).toEqual(['second']);
    expect(database(f).tabs[0].tab_id.startsWith('w2:')).toBe(true);
    expect(readState(dependent).attempts.B).toBe(1);
  } finally {
    f.clean();
  }
}, 15000);

test('merged phase closes tab on typed next and starts the dependent', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const dependent: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    expect((await next(f, ['first'])).code).toBe(0);
    const b: string = readState(first).pane.B!;
    saveState(first, { ...readState(first), phase: 'merge' });
    const merged: Result = await cli(f, ['phase', 'first', 'merged'], f.root, f.env);
    expect(merged.code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
    expect(readState(dependent).attempts.B).toBe(1);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
  } finally {
    f.clean();
  }
}, 15000);

test('next --all inside a checkout sweeps only that repo', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    leaf(f, 'a-one', 'plan.synthesis');
    leaf(g, 'b-one', 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['a-one']);
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('unreadable state reserves its capacity and reports its path', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(f, 'second', 'plan.synthesis');
    configure(f, { max_active: 2 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ path: malformed });
    expect(database(f).tabs).toHaveLength(0);
    configure(f, { max_active: 4 });
    const retried: Result = await next(f, ['--all']);
    expect(retried.code).toBe(1);
    expect(database(f).tabs).toHaveLength(2);
    expect([first, second].filter((path) => readState(path).worktree !== undefined)).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 15000);

test('machine-wide capacity includes another registered repo and folder selection respects it', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(g, 'second', 'plan.synthesis', { repo: 'other' });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, max_active: 1, repos: { repo: f.root, other: g.root } });
    const results: Result[] = await Promise.all([next(f, ['first']), next(f, [resolve(g.root, 'issues/open/issue')])]);
    expect(results.every((result) => result.code === 0)).toBe(true);
    expect(database(f).tabs).toHaveLength(1);
    const states = [readState(resolve(f.root, 'issues/open/issue/first')), readState(second)];
    expect(states.filter((state) => state.worktree !== undefined)).toHaveLength(1);
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('next recovers only merge-phase work by ancestry against a non-default remote target', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'upstream', remote], f.root);
    await command(['git', 'push', 'upstream', 'HEAD:trunk'], f.root);
    yaml(resolve(f.root, 'issues/config.yaml'), { remote: 'upstream', default_branch: 'trunk' });
    const path: string = leaf(f, 'landed', 'plan.synthesis', {}, 'landing');
    expect((await next(f, ['landed'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'upstream', 'HEAD:trunk'], worktree);
    const gh: GhFixture = fakeGh(f);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/landing'),
      closed: resolve(f.root, 'issues/closed/landing'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        {
          stdout: '',
          delayMs: 100,
          args: ['issue', 'close', '-R', 'team/project', '8', '--comment', `merged ${head}`],
          probe,
        },
      ]),
    );
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    saveState(path, { ...readState(path), phase: 'merge', sources: ['team/project#8'] });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    const state: State = readState(path);
    const promptsBefore: number = database(f).prompts.length;
    const prompted: Result = await next(f, ['landed']);
    expect(prompted.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.A,
      text: `merge-issue landed slot=A phase=merge leaf=${path}`,
    });
    expect(database(f).prompts.at(-1)?.text?.endsWith(` leaf=${f.root}/issues/open/landing/landed`)).toBe(true);
    expect(database(f).prompts.at(-1)?.text?.split(' leaf=')[1]).not.toContain('issues/worktrees');
    const completed: Result = await cli(f, ['phase', 'landed', 'merged', '--slot', 'A'], worktree, f.env);
    expect(completed.code).toBe(0);
    expect(completed.stdout).toContain('issue complete landing');
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(2);
    expect(readState(resolve(f.root, 'issues/closed/landing/landed')).phase).toBe('merged');
    expect(database(f).tabs).toHaveLength(1);
    expect(existsSync(worktree)).toBe(true);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs).toHaveLength(0);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/landed'], f.root)).code).toBe(1);
  } finally {
    f.clean();
  }
}, 15000);

test('exited hooks resolve persisted pane hints and preserve the surviving slot', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'exited', 'plan.positions');
    expect((await next(f, ['exited'])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const b: string = readState(path).pane.B!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.filter((pane) => pane.pane_id !== a) });
    const recovered: Result = await next(f, [], {
      HERDR_PANE_ID: a,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_exited',
        data: { type: 'pane_exited', pane_id: a, workspace_id: 'w1' },
      }),
    });
    expect(recovered.code).toBe(0);
    expect(readState(path).pane.B).toBe(b);
    expect(readState(path).pane.A).not.toBe(a);
    expect(readState(path).attempts).toEqual({ A: 2, B: 1 });
    expect(database(f).prompts.at(-1)?.text).toBe(`plan-issue exited slot=A phase=plan.positions leaf=${path}`);
    expect(database(f).starts.at(-1)).toContain('strong-a');
    expect(database(f).tabs).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('delayed working and idle notifications from the prompted session never consume retries', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'delayed', 'plan.synthesis');
    expect((await next(f, ['delayed'])).code).toBe(0);
    const b: string = readState(path).pane.B!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === b ? { ...p, agent_status: 'idle' } : p)) });
    const event = (status: string): string =>
      JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: b, workspace_id: 'w1', agent_status: status },
      });
    expect((await next(f, [], { HERDR_PANE_ID: b, HERDR_PLUGIN_EVENT_JSON: event('working') })).code).toBe(0);
    expect(readState(path).attempts.B).toBe(1);
    expect(database(f).prompts).toHaveLength(1);
    expect((await next(f, [], { HERDR_PANE_ID: b, HERDR_PLUGIN_EVENT_JSON: event('idle') })).code).toBe(0);
    expect(readState(path).attempts.B).toBe(1);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('uncommitted work in a merge worktree is left to the merge seat', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = leaf(f, 'dirty', 'plan.synthesis');
    expect((await next(f, ['dirty'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'forgotten'), 'never committed\n');
    saveState(path, { ...readState(path), phase: 'merge', prompted: {} });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    const state: State = readState(path);
    const promptsBefore: number = database(f).prompts.length;
    const result: Result = await next(f, ['dirty']);
    expect(result.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.A,
      text: `merge-issue dirty slot=A phase=merge leaf=${path}`,
    });
    expect(existsSync(resolve(worktree, 'forgotten'))).toBe(true);
  } finally {
    f.clean();
  }
}, 15000);

test('a worktree parked mid-rebase is still dispatched', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'conflict', 'plan.synthesis');
    expect((await next(f, ['conflict'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'clash'), 'leaf side\n');
    await command(['git', 'add', 'clash'], worktree);
    await command(['git', 'commit', '-m', 'leaf side'], worktree);
    writeFileSync(resolve(f.root, 'clash'), 'main side\n');
    await command(['git', 'add', 'clash'], f.root);
    await command(['git', 'commit', '-m', 'main side'], f.root);
    expect((await run(['git', 'rebase', 'HEAD~1'], worktree)).code).toBe(0);
    expect((await run(['git', 'rebase', await command(['git', 'rev-parse', 'HEAD'], f.root)], worktree)).code).not.toBe(
      0,
    );
    expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('');
    saveState(path, { ...readState(path), phase: 'check.fix', prompted: {} });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, ['conflict'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 15000);

test('a live merge retains its completion call after pushing, including a peer retry', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], f.root);
    const path: string = leaf(f, 'active-merge', 'plan.synthesis');
    expect((await next(f, ['active-merge'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'origin', 'HEAD:main'], worktree);
    saveState(path, {
      ...readState(path),
      phase: 'merge',
      attempts: { A: 1, B: 0 },
      busy_since: { A: new Date(Date.now() - 61 * 60000).toISOString() },
      busy_notified: {},
    });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => ({
        ...p,
        agent: 'fake',
        agent_status: p.pane_id === readState(path).pane.A ? 'working' : 'idle',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(path).busy_since.A).toBeDefined();
    expect(readState(path).busy_notified.A).toBeDefined();
    expect(
      calls(f)
        .filter((args) => args[0] === 'notification')
        .at(-1)![2],
    ).toContain('seat A');
    const completed: Result = await cli(f, ['phase', 'active-merge', 'merged', '--slot', 'A'], worktree, f.env);
    expect(completed.code).toBe(0);
    expect(completed.stdout).toContain('issue complete issue');
    expect(database(f).tabs).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('agent names support identical repo-local slugs and long numeric-leading slugs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const slug: string = '123-this-is-a-valid-leaf-slug-longer-than-thirty-characters';
    leaf(f, slug, 'plan.synthesis');
    leaf(g, slug, 'plan.synthesis', { repo: 'other' });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['--all'], {}, f.home)).code).toBe(0);
    const db: Database = database(f);
    expect(db.starts).toHaveLength(2);
    expect(new Set(db.starts.map((args) => args[2])).size).toBe(2);
    expect(db.starts.every((args) => /^[a-z][a-z0-9_-]{0,31}$/.test(args[2]))).toBe(true);
    expect(db.tabs.map((tab) => tab.label)).toEqual([slug, slug]);
    expect(new Set(db.prompts.map((prompt) => prompt.text))).toEqual(
      new Set([
        `plan-issue ${slug} slot=B phase=plan.synthesis leaf=${f.root}/issues/open/issue/${slug}`,
        `plan-issue ${slug} slot=B phase=plan.synthesis leaf=${g.root}/issues/open/issue/${slug}`,
      ]),
    );
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('next awaits sourced completion after a failed rename before removing the worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'rename', 'plan.synthesis');
    expect((await next(f, ['rename'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge', sources: ['team/project#9'] });
    const closed: string = resolve(f.root, 'issues/closed/issue');
    mkdirSync(closed, { recursive: true });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    expect((await cli(f, ['phase', 'rename', 'merged'], f.root, f.env)).code).not.toBe(0);
    expect(readState(path).phase).toBe('merged');
    expect(existsSync(gh.db + '.calls')).toBe(false);
    rmSync(closed, { recursive: true });
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed,
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', delayMs: 100, probe },
        {
          stdout: '',
          delayMs: 100,
          args: ['issue', 'close', '-R', 'team/project', '9', '--comment', `merged ${head}`],
          probe,
        },
      ]),
    );
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) });
    const recovered: Result = await next(f, ['rename']);
    expect(recovered).toMatchObject({ code: 0 });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(2);
    expect(existsSync(worktree)).toBe(true);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

const skipSchema = z.object({
  repo: z.string(),
  path: z.string(),
  slug: z.string().optional(),
  error: z.string(),
  count: z.number().int().optional(),
  paths: z.array(z.object({ path: z.string(), stored: z.string() })).optional(),
});
function skips(result: Result): z.infer<typeof skipSchema>[] {
  return result.stderr.split('\n').map((line) => skipSchema.parse(JSON.parse(line)));
}
function configure(f: DispatchFixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}
function resetPrompts(f: DispatchFixture, path: string): void {
  saveState(path, { ...readState(path), prompted: {} });
  const db: Database = database(f);
  saveDatabase(f, { ...db, prompts: [], panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) });
}

for (const mode of ['startup', 'hook', 'cwd'] as const) {
  test(`missing registration is isolated during ${mode}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
      expect((await next(f, ['healthy'])).code).toBe(0);
      resetPrompts(f, healthy);
      const missing: string = resolve(f.home, 'deleted');
      configure(f, { repos: { missing, repo: f.root } });
      const result: Result = await next(
        f,
        mode === 'startup' ? ['--all'] : [],
        mode === 'hook' ? { HERDR_PANE_ID: readState(healthy).pane.B } : {},
        mode === 'startup' ? f.home : f.root,
      );
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(1);
      expect(skips(result)[0]).toMatchObject({ repo: 'missing', path: missing });
      expect(skips(result)[0].error).toContain('ENOENT');
      expect(database(f).prompts).toHaveLength(1);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('missing dependencies skip their leaf while readable unmet dependencies wait and siblings dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'broken', 'plan.synthesis', { 'blocked-by': ['nonexistent'] });
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['healthy'] });
    leaf(f, 'healthy', 'plan.synthesis');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].slug).toBe('broken');
    expect(skips(result)[0].error).toContain('nonexistent');
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue healthy slot=B phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
    ]);
  } finally {
    f.clean();
  }
});

for (const capacity of [3, 4]) {
  test(`bad YAML and invalid states reserve occupancy at capacity ${capacity}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
      expect((await next(f, ['healthy'])).code).toBe(0);
      resetPrompts(f, healthy);
      const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
      writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
      const invalid: string = leaf(f, 'invalid', 'not-a-phase');
      leaf(f, 'new', 'plan.synthesis');
      configure(f, { max_active: capacity });
      const result: Result = await next(f, ['--all']);
      expect(result.code).toBe(1);
      expect(
        skips(result)
          .map((skip) => skip.path)
          .sort(),
      ).toEqual([invalid, malformed].sort());
      expect(database(f).tabs).toHaveLength(1);
      expect(database(f).prompts).toHaveLength(1);
      configure(f, { max_active: 5 });
      expect((await next(f, ['new'])).code).toBe(1);
      expect(database(f).tabs).toHaveLength(2);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('dirty merged worktree cleanup drops the leftover and removes the worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const dirty: string = leaf(f, 'dirty', 'plan.synthesis', {}, 'dirty-issue');
    expect((await next(f, ['dirty'])).code).toBe(0);
    const worktree: string = readState(dirty).worktree!;
    writeFileSync(resolve(worktree, 'untracked'), 'dirty');
    saveState(dirty, { ...readState(dirty), phase: 'merged' });
    leaf(f, 'healthy', 'plan.synthesis', {}, 'healthy-issue');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(existsSync(worktree)).toBe(false);
    expect(database(f).prompts.at(-1)?.text).toContain('healthy');
  } finally {
    f.clean();
  }
}, 15000);

test('bare next from inside the repo cleans up its merged leaves', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const done: string = leaf(f, 'done', 'plan.synthesis', {}, 'done-issue');
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(done).worktree!;
    saveState(done, { ...readState(done), phase: 'merged' });
    leaf(f, 'healthy', 'plan.synthesis', {}, 'healthy-issue');
    const result: Result = await next(f, []);
    expect(result.code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(database(f).prompts.at(-1)?.text).toContain('healthy');
  } finally {
    f.clean();
  }
}, 15000);

for (const scope of ['global'] as const) {
  test(`${scope} lock acquisition failure is fatal`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'locked', 'plan.synthesis');
      leaf(f, 'zhealthy', 'plan.synthesis');
      symlinkSync(resolve(f.home, 'missing/lock'), resolve(f.home, '.lock'));
      const result: Result = await next(f, ['locked']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('lock');
      expect(result.stderr).not.toContain('"repo":"repo"');
      expect(database(f).prompts).toHaveLength(0);
    } finally {
      f.clean();
    }
  });
}

test('lock finalization failures and invalid hook events remain fatal', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'healthy', 'plan.synthesis');
    const invalid: Result = await next(f, [], { HERDR_PLUGIN_EVENT_JSON: '{"event":"invalid"}' });
    expect(invalid.code).not.toBe(0);
    expect(database(f).prompts).toHaveLength(0);
    const flock: string = resolve(f.home, 'bin/flock');
    writeFileSync(flock, '#!/bin/sh\nprintf locked\ncat >/dev/null\nprintf "finalization failure" >&2\nexit 7\n', {
      mode: 0o755,
    });
    const result: Result = await next(f, ['--all']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('finalization failure');
    expect(result.stderr).not.toContain('"repo":"repo"');
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
});

for (const invalid of ['duplicate', 'mismatch']) {
  test(`${invalid} leaf identity never dispatches an arbitrary leaf`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'ambiguous', 'plan.synthesis', invalid === 'mismatch' ? { repo: 'wrong' } : {});
      if (invalid === 'duplicate') leaf(f, 'ambiguous', 'plan.synthesis', {}, 'second');
      configure(f, { max_active: 4 });
      leaf(f, 'healthy', 'plan.synthesis');
      const result: Result = await next(f, ['--all']);
      expect(result.code).toBe(1);
      if (invalid === 'mismatch') {
        expect(skips(result)).toHaveLength(1);
        const summary: z.infer<typeof skipSchema> = skips(result)[0];
        expect(summary.repo).toBe('repo');
        expect(summary.count).toBe(1);
        expect(summary.paths).toContainEqual({ path, stored: 'wrong' });
        expect(skips(result).some((skip) => skip.error.includes('repo mismatch'))).toBe(false);
      } else {
        expect(skips(result).some((skip) => skip.path === path)).toBe(true);
      }
      expect(database(f).prompts.every((prompt) => prompt.text.includes('healthy'))).toBe(true);
      expect(database(f).prompts).toHaveLength(1);
    } finally {
      f.clean();
    }
  });
}

test('next selection and sweep report both repo keys without dispatching or changing the mismatched leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    const selected: Result = await next(f, ['wrong-key']);
    expect(selected.code).not.toBe(0);
    expect(database(f).prompts).toHaveLength(0);
    leaf(f, 'healthy', 'plan.synthesis');
    const sweep: Result = await next(f, ['--all']);
    expect(sweep.code).not.toBe(0);
    for (const result of [selected, sweep]) {
      expect(skips(result)).toHaveLength(1);
      const diagnostic: z.infer<typeof skipSchema> = skips(result)[0];
      expect(diagnostic.repo).toBe('repo');
      expect(diagnostic.count).toBe(1);
      expect(diagnostic.paths).toContainEqual({ path, stored: 'other' });
    }
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue healthy slot=B phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
    ]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    expect(existsSync(resolve(f.root, 'issues/worktrees/wrong-key'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('foreign leaves summarize once per repo with count and paths', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'foreign-a', 'plan.synthesis', { repo: 'other' });
    const b: string = leaf(f, 'foreign-b', 'plan.synthesis', { repo: 'other' });
    const c: string = leaf(f, 'foreign-c', 'plan.synthesis', { repo: 'third' });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    const summary: z.infer<typeof skipSchema> = skips(result)[0];
    expect(summary.repo).toBe('repo');
    expect(summary.count).toBe(3);
    expect(summary.paths).toHaveLength(3);
    expect(summary.paths).toContainEqual({ path: a, stored: 'other' });
    expect(summary.paths).toContainEqual({ path: b, stored: 'other' });
    expect(summary.paths).toContainEqual({ path: c, stored: 'third' });
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('foreign leaves do not consume capacity while healthy leaves in both repos dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const foreign: string[] = [];
    for (let i: number = 0; i < 5; i++) foreign.push(leaf(f, `foreign-${i}`, 'plan.synthesis', { repo: 'other' }));
    const before: string[] = foreign.map((p: string) => readFileSync(resolve(p, 'state.yaml'), 'utf8'));
    leaf(f, 'healthy', 'plan.synthesis');
    leaf(g, 'other-healthy', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2, repos: { repo: f.root, other: g.root } });
    const result: Result = await next(f, ['--all'], {}, f.home);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].count).toBe(5);
    expect(database(f).prompts).toHaveLength(2);
    expect(database(f).tabs).toHaveLength(2);
    expect(
      database(f)
        .prompts.map((p) => p.text)
        .sort(),
    ).toEqual(
      [
        `plan-issue healthy slot=B phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
        `plan-issue other-healthy slot=B phase=plan.synthesis leaf=${g.root}/issues/open/issue/other-healthy`,
      ].sort(),
    );
    foreign.forEach((p: string, i: number) => expect(readFileSync(resolve(p, 'state.yaml'), 'utf8')).toBe(before[i]));
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('foreign slugs are missing for lookup and dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const foreign: string = leaf(f, 'foreign-dep', 'plan.synthesis', { repo: 'other' });
    const before: string = readFileSync(resolve(foreign, 'state.yaml'), 'utf8');
    const blocked: string = leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['foreign-dep'] });
    const sweep: Result = await next(f, ['--all']);
    expect(sweep.code).toBe(1);
    expect(skips(sweep)).toHaveLength(2);
    const perLeaf: z.infer<typeof skipSchema> | undefined = skips(sweep).find((s) => s.slug === 'blocked');
    expect(perLeaf).toBeDefined();
    expect(perLeaf!.path).toBe(blocked);
    expect(perLeaf!.error).toContain('foreign-dep');
    expect(database(f).prompts).toHaveLength(0);
    const direct: Result = await next(f, ['foreign-dep']);
    expect(direct.code).not.toBe(0);
    expect(skips(direct)).toHaveLength(1);
    expect(skips(direct)[0].count).toBe(1);
    expect(skips(direct)[0].paths).toContainEqual({ path: foreign, stored: 'other' });
    expect(database(f).prompts).toHaveLength(0);
    expect(readFileSync(resolve(foreign, 'state.yaml'), 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
}, 15000);

test('unreadable leaves reserve capacity while foreign leaves summarize separately', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'healthy', 'plan.synthesis');
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const fa: string = leaf(f, 'foreign-a', 'plan.synthesis', { repo: 'other' });
    const fb: string = leaf(f, 'foreign-b', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(2);
    const summary: z.infer<typeof skipSchema> | undefined = skips(result).find((s) => s.count !== undefined);
    expect(summary).toBeDefined();
    expect(summary!.repo).toBe('repo');
    expect(summary!.count).toBe(2);
    expect(summary!.paths).toContainEqual({ path: fa, stored: 'other' });
    expect(summary!.paths).toContainEqual({ path: fb, stored: 'other' });
    expect(skips(result).some((s) => s.path === malformed)).toBe(true);
    expect(database(f).prompts).toHaveLength(0);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('merged foreign leaves survive cleanup with worktree branch and tab intact', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const open: string = leaf(f, 'survivor', 'plan.synthesis');
    expect((await next(f, ['survivor'])).code).toBe(0);
    const dispatched: State = readState(open);
    const worktree: string = z.string().parse(dispatched.worktree);
    const tab: string = z.string().parse(dispatched.tab);
    saveState(open, { ...dispatched, repo: 'other', phase: 'merged' });
    mkdirSync(resolve(f.root, 'issues/closed/issue'), { recursive: true });
    const closed: string = resolve(f.root, 'issues/closed/issue/survivor');
    renameSync(open, closed);
    const before: string = readFileSync(resolve(closed, 'state.yaml'), 'utf8');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].count).toBe(1);
    expect(skips(result)[0].paths).toContainEqual({ path: closed, stored: 'other' });
    expect(readFileSync(resolve(closed, 'state.yaml'), 'utf8')).toBe(before);
    expect(existsSync(worktree)).toBe(true);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/survivor'], f.root)).code).toBe(0);
    expect(database(f).tabs.some((t) => t.tab_id === tab)).toBe(true);
    expect(calls(f).filter((args: string[]) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('two repos summarize once per repo on every invocation', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const fa: string = leaf(f, 'foreign-in-repo', 'plan.synthesis', { repo: 'other' });
    const fb: string = leaf(g, 'foreign-in-other', 'plan.synthesis', { repo: 'repo' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    for (let i: number = 0; i < 2; i++) {
      const result: Result = await next(f, ['--all'], {}, f.home);
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(2);
      const byRepo: Map<string, z.infer<typeof skipSchema>> = new Map(skips(result).map((s) => [s.repo, s]));
      expect(byRepo.get('repo')?.count).toBe(1);
      expect(byRepo.get('other')?.count).toBe(1);
      expect(byRepo.get('repo')?.paths).toContainEqual({ path: fa, stored: 'other' });
      expect(byRepo.get('other')?.paths).toContainEqual({ path: fb, stored: 'repo' });
    }
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

for (const moved of ['worktree root', 'repo root'] as const) {
  test(`changed ${moved} reports recorded and expected worktrees without creating or prompting`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const recorded: string = resolve(f.root, 'issues/worktrees/relocated');
      await command(['git', 'worktree', 'add', '-b', 'relocated', recorded], f.root);
      leaf(f, 'relocated', 'plan.synthesis', { worktree: recorded });
      const root: string = moved === 'repo root' ? resolve(f.home, 'moved-repo') : f.root;
      const worktreeRoot: string = moved === 'worktree root' ? 'issues/new-worktrees' : 'issues/worktrees';
      if (moved === 'repo root') renameSync(f.root, root);
      else yaml(resolve(root, 'issues/config.yaml'), { worktree_root: worktreeRoot });
      configure(f, { repos: { repo: root } });
      const relocated: DispatchFixture = { ...f, root };
      const path: string = resolve(root, 'issues/open/issue/relocated');
      const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
      const expected: string = resolve(root, worktreeRoot, 'relocated');
      const existing: boolean = existsSync(expected);
      const worktrees: string = await command(['git', 'worktree', 'list', '--porcelain'], root);
      const result: Result = await next(relocated, ['relocated']);
      expect(result.code).not.toBe(0);
      expect(skips(result)).toHaveLength(1);
      const error: string = skips(result)[0].error;
      expect(error).toContain(recorded);
      expect(error).toContain(expected);
      expect(error).toMatch(/recorded/i);
      expect(error).toMatch(/expected/i);
      expect(error).toMatch(/move/i);
      expect(error).toMatch(/restore/i);
      expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
      expect(existsSync(expected)).toBe(existing);
      expect(await command(['git', 'worktree', 'list', '--porcelain'], root)).toBe(worktrees);
      expect(database(f).prompts).toHaveLength(0);
      expect(database(f).tabs).toHaveLength(0);
    } finally {
      f.clean();
    }
  });
}

test('moving a repo with the same registered key supports status, phase and dispatch without a recorded worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'movable', 'plan.synthesis');
    const root: string = resolve(f.home, 'moved-repo');
    renameSync(f.root, root);
    configure(f, { repos: { repo: root } });
    const moved: DispatchFixture = { ...f, root };
    const status: Result = await cli(moved, ['status', 'movable']);
    expect(status.code).toBe(0);
    expect(status.stdout).toContain('repo: repo');
    expect((await cli(moved, ['phase', 'movable', 'implement', '--slot', 'B'])).code).toBe(0);
    expect((await next(moved, ['movable'])).code).toBe(0);
    const state: State = readState(resolve(root, 'issues/open/issue/movable'));
    expect(state.repo).toBe('repo');
    expect(state.phase).toBe('implement');
    expect(state.worktree).toBe(resolve(root, 'issues/worktrees/movable'));
    expect(await command(['git', 'branch', '--show-current'], state.worktree)).toBe('movable');
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `implement-issue movable slot=B phase=implement leaf=${root}/issues/open/issue/movable`,
    ]);
  } finally {
    f.clean();
  }
});

test('unknown directory population reserves all new capacity but allows existing tabs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
    expect((await next(f, ['healthy'])).code).toBe(0);
    resetPrompts(f, healthy);
    leaf(f, 'new', 'plan.synthesis');
    const closed: string = resolve(f.root, 'issues/closed');
    writeFileSync(closed, 'not a directory');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].path).toBe(closed);
    expect(skips(result)[0].error).toContain('ENOTDIR');
    expect(database(f).tabs).toHaveLength(1);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('non-Error throws cross the scoped discovery boundary unchanged', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const script: string = resolve(f.home, 'non-error.ts');
    writeFileSync(
      script,
      `import { mock } from 'bun:test';
import * as config from ${JSON.stringify(resolve(import.meta.dir, '../src/config.ts'))};
mock.module(${JSON.stringify(resolve(import.meta.dir, '../src/config.ts'))}, () => ({ ...config, readRepo: () => { throw 'non-error-sentinel'; } }));
const { nextCommand } = await import(${JSON.stringify(resolve(import.meta.dir, '../src/next.ts'))});
try { await nextCommand('--all'); process.exit(2); } catch (error) { if (error !== 'non-error-sentinel') throw error; console.error(error); process.exit(9); }
`,
    );
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, script], {
      env: { ...process.env, ...f.env, AKROGON_HOME: f.home },
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const stderr: string = await new Response(child.stderr).text();
    expect(await child.exited).toBe(9);
    expect(stderr.trim()).toBe('non-error-sentinel');
  } finally {
    f.clean();
  }
});

test('explicit unreadable targets retain the original error without a missing-target stack', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    for (const input of ['malformed', malformed]) {
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(1);
      expect(skips(result)[0].path).toBe(malformed);
      expect(skips(result)[0].error).not.toContain('Missing');
    }
    rmSync(malformed, { recursive: true });
    const missing: Result = await next(f, ['nonexistent']);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('Missing leaf');
  } finally {
    f.clean();
  }
});

test('a selected leaf removed before its global lock is reported as skipped', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const gone: string = leaf(f, 'gone', 'plan.synthesis');
    writeFileSync(
      resolve(f.home, 'bin/flock'),
      '#!/bin/sh\nif [ "$2" = "$REMOVE_BEFORE_LOCK" ]; then rm -r "$REMOVE_LEAF"; fi\nexec /usr/bin/flock "$@"\n',
      { mode: 0o755 },
    );
    const result: Result = await next(f, ['gone'], {
      REMOVE_BEFORE_LOCK: resolve(f.home, '.lock'),
      REMOVE_LEAF: gone,
    });
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ slug: 'gone', path: gone });
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
});

for (const session of [null, undefined]) {
  test(`next prompts an idle agent with ${session === null ? 'null' : 'omitted'} session data`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'sessionless', 'plan.synthesis');
      expect((await next(f, ['sessionless'])).code).toBe(0);
      resetPrompts(f, path);
      const db: Database = database(f);
      saveDatabase(f, {
        ...db,
        panes: db.panes.map((pane) => ({ ...pane, agent_session: session })),
      });
      expect((await next(f, ['sessionless'])).code).toBe(0);
      expect(database(f).prompts).toEqual([
        { pane: readState(path).pane.B!, text: `plan-issue sessionless slot=B phase=plan.synthesis leaf=${path}` },
      ]);
      expect(database(f).starts).toHaveLength(1);
    } finally {
      f.clean();
    }
  });
}

for (const seat of ['A'] as const) {
  test(`blocked merge seat ${seat} prevents fetch and clean checks in a dirty worktree`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const remote: string = resolve(f.home, 'remote.git');
      await command(['git', 'init', '--bare', remote]);
      await command(['git', 'remote', 'add', 'origin', remote], f.root);
      await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
      const path: string = leaf(f, 'blocked-merge', 'plan.synthesis');
      expect((await next(f, ['blocked-merge'])).code).toBe(0);
      const state: State = readState(path);
      writeFileSync(resolve(state.worktree!, 'unfinished'), 'dirty merge work\n');
      saveState(path, { ...state, phase: 'merge', attempts: { A: seat === 'A' ? 1 : 2, B: 0 } });
      const db: Database = database(f);
      saveDatabase(f, {
        ...db,
        panes: db.panes.map((pane) => ({
          ...pane,
          agent: 'fake',
          agent_status: pane.pane_id === state.pane[seat] ? 'blocked' : 'idle',
        })),
      });
      const realGit: string = await command(['sh', '-c', 'command -v git']);
      const gitLog: string = resolve(f.home, 'git.calls');
      writeFileSync(
        resolve(f.home, 'bin/git'),
        '#!/bin/sh\nprintf "%s\\n" "$*" >> "$GIT_CALL_LOG"\nexec "$REAL_GIT" "$@"\n',
        { mode: 0o755 },
      );
      const before: State = readState(path);
      const observedAt: number = Date.now();
      const result: Result = await next(f, ['blocked-merge'], { REAL_GIT: realGit, GIT_CALL_LOG: gitLog });
      const gitCalls: string[] = readFileSync(gitLog, 'utf8').trim().split('\n');
      expect(gitCalls.some((args) => args.startsWith('fetch '))).toBe(false);
      expect(gitCalls).not.toContain('status --porcelain');
      expect(result.code).toBe(0);
      const after: State = readState(path);
      const since: string = z.string().datetime().parse(after.busy_since[seat]);
      if (seat === 'A') {
        expect(before.busy_since.A).toBeUndefined();
        expect(Date.parse(since)).toBeGreaterThanOrEqual(observedAt);
        expect(Date.parse(since)).toBeLessThanOrEqual(Date.now());
      } else {
        expect(before.busy_since.B).toBe(since);
      }
      expect(after).toEqual({ ...before, busy_since: { [seat]: since }, busy_notified: {} });
      expect(database(f).prompts).toEqual(db.prompts);
      expect(database(f).starts).toEqual(db.starts);
      expect(readFileSync(resolve(state.worktree!, 'unfinished'), 'utf8')).toBe('dirty merge work\n');
    } finally {
      f.clean();
    }
  });
}

test('a blocked non-merge seat does not stall a merge leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = leaf(f, 'blocked-merge', 'plan.synthesis');
    expect((await next(f, ['blocked-merge'])).code).toBe(0);
    const state: State = readState(path);
    writeFileSync(resolve(state.worktree!, 'unfinished'), 'dirty merge work\n');
    saveState(path, { ...state, phase: 'merge' });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((pane) => ({
        ...pane,
        agent: 'fake',
        agent_status: pane.pane_id === state.pane.B ? 'blocked' : 'idle',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    const result: Result = await next(f, ['blocked-merge']);
    expect(result.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.A,
      text: `merge-issue blocked-merge slot=A phase=merge leaf=${path}`,
    });
    expect(readState(path).busy_since.B).toBeDefined();
    expect(readFileSync(resolve(state.worktree!, 'unfinished'), 'utf8')).toBe('dirty merge work\n');
  } finally {
    f.clean();
  }
}, 15000);

for (const missing of ['neither', 'A', 'B', 'both'] as const) {
  test(`recorded seats stay authoritative with an extra pane first and ${missing} missing`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'seats', 'plan.synthesis');
      expect((await next(f, ['seats'])).code).toBe(0);
      resetPrompts(f, path);
      const state: State = readState(path);
      const db: Database = database(f);
      saveDatabase(f, {
        ...db,
        panes: [
          { ...db.panes[0], pane_id: 'operator' },
          ...db.panes.filter(
            (pane) => missing === 'neither' || (missing !== 'both' && pane.pane_id !== state.pane[missing]),
          ),
        ],
      });
      const before: number = calls(f).length;
      expect((await next(f, ['seats'])).code).toBe(0);
      const allocated: State = readState(path);
      const invoked: string[][] = calls(f).slice(before);
      const splits: string[][] = invoked.filter((args) => args[0] === 'pane' && args[1] === 'split');
      expect(splits).toHaveLength(missing === 'neither' ? 0 : missing === 'both' ? 2 : 1);
      for (const slot of ['A', 'B'] as const) {
        expect(allocated.pane[slot]).not.toBe('operator');
        if (missing !== slot && missing !== 'both') expect(allocated.pane[slot]).toBe(state.pane[slot]);
        else expect(allocated.pane[slot]).not.toBe(state.pane[slot]);
      }
      if (missing === 'A' || missing === 'B') expect(splits[0][2]).toBe(state.pane[missing === 'A' ? 'B' : 'A']!);
      if (missing === 'both') expect(splits.map((args) => args[2])).toEqual(['operator', allocated.pane.A!]);
      expect(database(f).prompts.at(-1)?.pane).toBe(allocated.pane.B);
      expect(invoked.filter((args) => args[0] === 'agent').every((args) => !args.includes('operator'))).toBe(true);
    } finally {
      f.clean();
    }
  });
}

for (const edge of ['interrupted', 'empty', 'recreated'] as const) {
  test(`allocation handles an ${edge} tab`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'allocation', 'plan.synthesis');
      saveDatabase(f, { ...database(f), failSplitOnce: edge === 'interrupted' });
      expect((await next(f, ['allocation'])).code).toBe(edge === 'interrupted' ? 1 : 0);
      const state: State = readState(path);
      const db: Database = database(f);
      saveDatabase(f, {
        ...db,
        tabs: edge === 'recreated' ? [] : db.tabs,
        panes: edge === 'interrupted' ? [...db.panes, { ...db.panes[0], pane_id: 'operator' }] : [],
      });
      const before: number = calls(f).length;
      const result: Result = await next(f, ['allocation']);
      if (edge === 'empty') {
        expect(result.code).toBe(1);
        expect(result.stderr).toContain(state.tab!);
        expect(database(f).panes).toHaveLength(0);
      } else {
        expect(result.code).toBe(0);
        const allocated: State = readState(path);
        const updated: Database = database(f);
        expect(allocated.pane.A).toBe(updated.panes[0].pane_id);
        expect(allocated.pane.B).not.toBe('operator');
        expect(
          calls(f)
            .slice(before)
            .filter((args) => args[0] === 'pane' && args[1] === 'split'),
        ).toHaveLength(1);
        expect(updated.prompts.at(-1)?.pane).toBe(allocated.pane.B);
        if (edge === 'recreated') {
          expect(allocated.tab).not.toBe(state.tab);
          expect(allocated.pane.A).not.toBe(state.pane.A);
          expect(allocated.pane.B).not.toBe(state.pane.B);
        }
      }
    } finally {
      f.clean();
    }
  });
}

test('agent start allows 30 seconds while prompt wait remains 5 seconds', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'timeouts', 'plan.synthesis');
    expect((await next(f, ['timeouts'])).code).toBe(0);
    const start: string[] = database(f).starts[0];
    expect(start[start.indexOf('--timeout') + 1]).toBe('30000');
    const prompt: string[] = calls(f).find((args) => args[0] === 'agent' && args[1] === 'prompt')!;
    expect(prompt.slice(4)).toEqual(['--wait', '--until', 'working', '--timeout', '5000']);
  } finally {
    f.clean();
  }
});

test('startup retries closure before cleanup and retains failed owners with their worktree branch and tab', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'retry', 'plan.synthesis');
    expect((await next(f, ['retry'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge', sources: ['team/project#1'] });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed: resolve(f.root, 'issues/closed/issue'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    const failure: GhStep[] = [
      { stdout: '', code: 1, stderr: 'offline', probe },
      { stdout: '', code: 1, stderr: 'offline', probe },
    ];
    writeFileSync(gh.db, JSON.stringify(failure));
    expect((await cli(f, ['phase', 'retry', 'merged'], f.root, f.env)).code).not.toBe(0);
    writeFileSync(gh.db, JSON.stringify(failure));
    const failed: Result = await next(f, ['--all']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('offline');
    expect(existsSync(worktree)).toBe(true);
    expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('retry');
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['retry']);
    expect(calls(f).some((args) => args[0] === 'tab' && args[1] === 'close')).toBe(false);
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        { stdout: '', probe },
      ]),
    );
    const retried: Result = await next(f, ['--all']);
    expect(retried.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(probe.closed)).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/retry'], f.root)).code).toBe(1);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('startup retains completed issue resources while an epic sibling remains unfinished', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'waiting', 'plan.synthesis', { hand_built: true }, 'epic/second');
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge' });
    expect((await cli(f, ['phase', 'done', 'merged'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(path).phase).toBe('merged');
    expect(existsSync(worktree)).toBe(true);
    expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('done');
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['done']);
    expect(calls(f).some((args) => args[0] === 'tab' && args[1] === 'close')).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

for (const area of ['open', 'closed']) {
  for (const nesting of ['', 'invalid', 'epic/issue/extra/invalid']) {
    test(`explicit next rejects ${area}/${nesting} before any flock`, async () => {
      const f: DispatchFixture = await dispatchFixture();
      try {
        const source: string = leaf(f, 'invalid', area === 'closed' ? 'merged' : 'plan.synthesis');
        const path: string = resolve(f.root, 'issues', area, nesting);
        mkdirSync(path, { recursive: true });
        renameSync(resolve(source, 'state.yaml'), resolve(path, 'state.yaml'));
        rmSync(source, { recursive: true });
        const state: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
        const db: string = readFileSync(f.db, 'utf8');
        writeFileSync(resolve(f.home, 'bin/flock'), '#!/bin/sh\nprintf invoked > "$FLOCK_CALLS"\nexit 91\n', {
          mode: 0o755,
        });
        for (const input of ['invalid', path]) {
          const result: Result = await cli(
            f,
            ['next', input],
            f.root,
            { ...f.env, FLOCK_CALLS: resolve(f.home, 'flock-calls') },
            3000,
          );
          expect(result.code).toBe(1);
          expect(result.stderr).toContain(resolve(path, 'state.yaml'));
          expect(result.stderr).toContain('Invalid leaf depth');
          expect(existsSync(resolve(f.home, 'flock-calls'))).toBe(false);
          expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(state);
          expect(readFileSync(f.db, 'utf8')).toBe(db);
          expect(calls(f)).toEqual([]);
          expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
          expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
          expect(existsSync(resolve(f.home, '.lock'))).toBe(false);
          console.log(result.stderr);
        }
      } finally {
        f.clean();
      }
    }, 10000);
  }
}

for (const route of ['--all', '.', 'hook']) {
  test(`invalid merged depth stays excluded during ${route} with healthy work`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      configure(f, { max_active: 4 });
      const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
      if (route === 'hook') {
        expect((await next(f, ['healthy'])).code).toBe(0);
        resetPrompts(f, healthy);
      }
      const bad: string = leaf(
        f,
        'invalid',
        'merged',
        { tab: 'invalid-tab', worktree: resolve(f.home, 'invalid-worktree') },
        'epic/issue/extra',
      );
      mkdirSync(resolve(f.home, 'invalid-worktree'));
      const before: string = readFileSync(resolve(bad, 'state.yaml'), 'utf8');
      const result: Result = await next(
        f,
        route === 'hook' ? [] : [route],
        route === 'hook' ? { HERDR_PANE_ID: readState(healthy).pane.B } : {},
      );
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(resolve(bad, 'state.yaml'));
      expect(database(f).prompts).toHaveLength(1);
      expect(database(f).prompts[0].text).toContain('healthy');
      expect(readFileSync(resolve(bad, 'state.yaml'), 'utf8')).toBe(before);
      expect(existsSync(resolve(f.home, 'invalid-worktree'))).toBe(true);
      expect(calls(f).some((args) => args.includes('invalid-tab'))).toBe(false);
    } finally {
      f.clean();
    }
  });
}

for (const owner of ['issue', 'epic/issue']) {
  test(`next identifies dormant ${owner}/resting without parsing and prefers active leaves`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const parked: string = resolve(f.root, 'issues/parked', owner, 'resting');
      mkdirSync(parked, { recursive: true });
      writeFileSync(resolve(parked, 'state.yaml'), 'slug: [');
      const result: Result = await next(f, ['resting']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Missing leaf: resting (parked)');
      console.log(result.stderr.split('\n').find((line) => line.includes('error: Missing leaf:')));
      for (const slug of ['absent', 'issue', 'epic']) {
        const missing: Result = await next(f, [slug]);
        expect(missing.code).toBe(1);
        expect(missing.stderr).toContain(`Missing leaf: ${slug}`);
        expect(missing.stderr.split('\n').find((line) => line.startsWith('error: '))).toBe(
          `error: Missing leaf: ${slug}`,
        );
      }
      expect(calls(f)).toEqual([]);
      leaf(f, 'resting', 'plan.synthesis');
      expect((await next(f, ['resting'])).code).toBe(0);
      expect(database(f).prompts).toHaveLength(1);
      renameSync(resolve(f.root, 'issues/open'), resolve(f.root, 'issues/closed'));
      expect((await next(f, ['resting'])).code).toBe(0);
    } finally {
      f.clean();
    }
  });
}

test('merge leaf with landed branch re-prompts its idle seat instead of auto-recovering', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = leaf(f, 'landed-merge', 'plan.synthesis');
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'origin', 'HEAD:main'], worktree);
    saveState(path, { ...readState(path), phase: 'merge', prompted: {} });
    const state: State = readState(path);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => ({
        ...p,
        agent: 'fake',
        agent_status: p.pane_id === state.pane.A ? 'idle' : 'working',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.A,
      text: `merge-issue landed-merge slot=A phase=merge leaf=${path}`,
    });
    expect(readState(path).phase).toBe('merge');
  } finally {
    f.clean();
  }
}, 15000);

test('debate leaf without positions files refuses dispatch until positions exist', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'debate', 'plan.synthesis', { debate: 'yes' });
    const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    const result: Result = await next(f, ['debate']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('debate');
    expect(result.stderr).toContain('plan.positions');
    expect(database(f).tabs).toHaveLength(0);
    expect(database(f).panes).toHaveLength(0);
    expect(database(f).prompts).toHaveLength(0);
    expect(readState(path).worktree).toBeUndefined();
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    writeFileSync(resolve(path, 'positions-A.md'), 'A\n');
    writeFileSync(resolve(path, 'positions-B.md'), 'B\n');
    expect((await next(f, ['debate'])).code).toBe(0);
    expect(database(f).prompts.at(-1)?.text).toBe(`plan-issue debate slot=B phase=plan.synthesis leaf=${path}`);
  } finally {
    f.clean();
  }
}, 15000);

test('typed next from a leaf pane sweeps and removes merged worktrees', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const donePath: string = leaf(f, 'done', 'plan.synthesis', {}, 'done-issue');
    expect((await next(f, ['done'])).code).toBe(0);
    const otherPath: string = leaf(f, 'other', 'plan.synthesis', {}, 'other-issue');
    expect((await next(f, ['other'])).code).toBe(0);
    const worktree: string = readState(donePath).worktree!;
    saveState(donePath, { ...readState(donePath), phase: 'merged' });
    const otherPane: string = readState(otherPath).pane.B!;
    expect(existsSync(worktree)).toBe(true);
    const result: Result = await next(f, [], { HERDR_PANE_ID: otherPane });
    expect(result.code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('spaced repo root dispatches leaf= with the complete spaced authoritative folder', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const spaced: string = resolve(f.home, 'repo root');
    renameSync(f.root, spaced);
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: spaced } });
    const f2: DispatchFixture = { ...f, root: spaced };
    leaf(f2, 'spaced', 'plan.synthesis');
    expect((await next(f2, ['spaced'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(database(f).prompts[0].text).toBe(
      `plan-issue spaced slot=B phase=plan.synthesis leaf=${spaced}/issues/open/issue/spaced`,
    );
  } finally {
    f.clean();
  }
}, 15000);

test('a failed leaf with its tab still open does not count toward max_active', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', {}, 'second-issue');
    configure(f, { max_active: 1 });
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, {
      ...readState(first),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'B', reason: 'capacity test' },
      busy_since: {},
      busy_notified: {},
    });
    expect((await next(f, ['second'])).code).toBe(0);
    expect(
      database(f)
        .tabs.map((tab) => tab.label)
        .sort(),
    ).toEqual(['first', 'second']);
    expect(readState(second).attempts.B).toBe(1);
    expect(readState(second).worktree).toBeDefined();
  } finally {
    f.clean();
  }
}, 15000);

test('a failed leaf does not reserve capacity in the unreadable branch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const failedPath: string = leaf(f, 'failed-one', 'plan.synthesis', {}, 'failed-issue');
    expect((await next(f, ['failed-one'])).code).toBe(0);
    saveState(failedPath, {
      ...readState(failedPath),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'B', reason: 'capacity test' },
      busy_since: {},
      busy_notified: {},
    });
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis', {}, 'bad-issue');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const healthy: string = leaf(g, 'healthy', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2, repos: { repo: f.root, other: g.root } });
    const result: Result = await next(f, [healthy]);
    expect(result.code).toBe(1);
    expect(skips(result).map((skip) => skip.path)).toContain(malformed);
    expect(
      database(f)
        .tabs.map((tab) => tab.label)
        .sort(),
    ).toEqual(['failed-one', 'healthy']);
    expect(readState(healthy).attempts.B).toBe(1);
    expect(readState(healthy).worktree).toBeDefined();
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('a failed leaf with a blocked pane is not seat-observed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'stuck', 'plan.synthesis');
    expect((await next(f, ['stuck'])).code).toBe(0);
    const promptsBefore: number = database(f).prompts.length;
    expect(promptsBefore).toBe(1);
    const b: string = readState(path).pane.B!;
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'B', reason: 'stuck test' },
      busy_since: {},
      busy_notified: {},
    });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === b ? { ...p, agent_status: 'blocked' } : p)) });
    expect((await next(f, ['stuck'])).code).toBe(0);
    expect((await next(f, ['stuck'])).code).toBe(0);
    expect(readState(path).busy_since).toEqual({});
    expect(readState(path).busy_notified).toEqual({});
    expect(database(f).prompts).toHaveLength(promptsBefore);
  } finally {
    f.clean();
  }
}, 15000);
