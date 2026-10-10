import { test, expect } from 'bun:test';
import {
  existsSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  rmSync,
  renameSync,
  appendFileSync,
  statSync,
  chmodSync,
  lstatSync,
  readlinkSync,
  mkdtempSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {
  fixture,
  cli,
  entry,
  leaf,
  yaml,
  fakeGh,
  fakeHerdr,
  leafTempRoot,
  type GhFixture,
  type Fixture,
} from './helpers';
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
function tmpdirsOf(args: string[]): string[] {
  const found: string[] = [];
  for (let i: number = 0; i + 1 < args.length; i++)
    if (args[i] === '--env' && args[i + 1].startsWith('TMPDIR=')) found.push(args[i + 1].slice('TMPDIR='.length));
  return found;
}
function tmpdirOf(args: string[]): string {
  const found: string[] = tmpdirsOf(args);
  expect(found).toHaveLength(1);
  return found[0];
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
      expect(readState(path).attempts.A).toBe(0);
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

test('next creates one worktree/tab under concurrent hooks, prompts configured A, ignores working events and resolves hook cwd', async () => {
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
    expect(db.prompts[0].text).toBe(`plan-issue build slot=A phase=plan.synthesis leaf=${path}`);
    expect(db.prompts[0].text.endsWith(` leaf=${f.root}/issues/open/issue/build`)).toBe(true);
    expect(db.prompts[0].text.split(' leaf=')[1]).not.toContain('issues/worktrees');
    console.log(db.prompts[0].text);
    expect(db.prompts[0].pane).toBe(db.panes[0].pane_id);
    expect(readState(path).pane.A).toBe(db.panes[0].pane_id);
    expect(db.starts[0]).toContain('strong-a');
    expect(calls(f).some((args) => args[0] === 'notification')).toBe(false);
    expect(readState(path).attempts.A).toBe(0);
    const a: string = readState(path).pane.A!;
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(readState(path).attempts.A).toBe(0);
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
    expect(readState(path).attempts.A).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('next re-prompts an idle seat whose prompt is older than the grace period and the phase never moved', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'stalled', 'plan.synthesis');
    expect((await next(f, ['stalled'])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'idle' } : p)) });
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    const state: State = readState(path);
    saveState(path, { ...state, prompted_at: { A: new Date(Date.now() - 3 * 60 * 1000).toISOString() } });
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
    expect(readState(path).attempts.A).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('a stale prompt never re-prompts a busy or done seat, succeeds without failing, and three failing passes fail the leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'misses', 'plan.synthesis');
    expect((await next(f, ['misses'])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    expect(database(f).prompts).toEqual([
      { pane: a, text: `plan-issue misses slot=A phase=plan.synthesis leaf=${path}` },
    ]);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    const stale = (): void =>
      saveState(path, { ...readState(path), prompted_at: { A: new Date(Date.now() - 3 * 60 * 1000).toISOString() } });
    const status = (agent_status: 'idle' | 'working'): void => {
      const db: Database = database(f);
      saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status })) });
    };
    status('working');
    stale();
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    status('idle');
    saveState(path, { ...readState(path), done: ['A'] });
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    saveState(path, { ...readState(path), done: [] });
    for (let i: number = 0; i < 3; i++) {
      status('idle');
      stale();
      expect((await next(f, ['misses'])).code).toBe(0);
    }
    expect(database(f).prompts).toHaveLength(4);
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    expect(readState(path).phase).toBe('plan.synthesis');
    saveDatabase(f, { ...database(f), failPrompts: true });
    for (let i: number = 0; i < 2; i++) {
      status('idle');
      stale();
      expect((await next(f, ['misses'])).code).toBe(0);
      expect(readState(path).phase).toBe('plan.synthesis');
    }
    expect(readState(path).attempts.A).toBe(2);
    expect(database(f).prompts).toHaveLength(6);
    status('idle');
    stale();
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(readState(path).phase).toBe('failed');
    expect(readState(path).failure?.cause).toBe('attempts');
    expect(readState(path).failure?.slot).toBe('A');
    expect(readState(path).failure?.reason.startsWith('prompt undelivered to seat A after 3 passes:')).toBe(true);
    const history: string[] = readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n');
    const record = JSON.parse(history[history.length - 1]);
    expect(record).toMatchObject({ slug: 'misses', to: 'failed' });
    expect(record.failure).toEqual(readState(path).failure);
    expect(database(f).prompts.every((p) => p.pane === a)).toBe(true);
  } finally {
    f.clean();
  }
}, 20000);

test('next does not re-prompt a slot whose prompted session is still alive, and re-prompts a new session', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'flicker', 'plan.synthesis');
    expect((await next(f, ['flicker'])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    expect(readState(path).prompted.A).toBeDefined();
    const flicker: Database = database(f);
    saveDatabase(f, {
      ...flicker,
      panes: flicker.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'idle' } : p)),
    });
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(path).busy_since.A).toBeUndefined();
    expect(readState(path).busy_notified.A).toBeUndefined();
    expect(readState(path).attempts.A).toBe(0);
    const replaced: Database = database(f);
    saveDatabase(f, {
      ...replaced,
      panes: replaced.panes.map((p) =>
        p.pane_id === a ? { ...p, agent_status: 'idle', agent_session: { kind: 'id', value: 'other' } } : p,
      ),
    });
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(2);
    expect(readState(path).attempts.A).toBe(0);
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
    expect(readState(path).busy_since.A).toBeDefined();
    expect(database(f).starts).toHaveLength(1);
    expect(readState(path).attempts.A).toBe(0);
    expect(readState(path).delivery_error.A).toBeUndefined();
    const a: string = readState(path).pane.A!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'idle' } : p)) });
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect(database(f).prompts[0].pane).toBe(a);
    expect(readState(path).attempts.A).toBe(0);
    expect(readState(path).delivery_error.A).toBeUndefined();
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    f.clean();
  }
}, 15000);

test('next resumes interrupted tab creation, fails after three failing passes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'retry', 'plan.synthesis');
    saveDatabase(f, { ...database(f), failSplitOnce: true });
    expect((await next(f, ['retry'])).code).not.toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    saveDatabase(f, { ...database(f), failPrompts: true });
    expect((await next(f, ['retry'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    expect(readState(path).attempts.A).toBe(1);
    expect(database(f).prompts).toHaveLength(1);
    expect((await next(f, ['retry'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    expect(readState(path).attempts.A).toBe(2);
    expect(database(f).prompts).toHaveLength(2);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(2);
    const retried: Result = await next(f, ['retry']);
    expect(retried.code).toBe(0);
    expect(readState(path).phase).toBe('failed');
    expect(readState(path).failure?.cause).toBe('attempts');
    expect(readState(path).failure?.slot).toBe('A');
    expect(
      readState(path).failure?.reason.startsWith('prompt undelivered to seat A after 3 passes: agent_prompt_stalled'),
    ).toBe(true);
    const db: Database = database(f);
    expect(db.tabs).toHaveLength(1);
    expect(db.prompts).toHaveLength(3);
    expect(db.prompts[0].pane).toBe(db.prompts[1].pane);
    expect(db.prompts[2].pane).toBe(db.prompts[0].pane);
    expect(db.prompts.every((p) => p.text.includes('slot=A'))).toBe(true);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(3);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"failed"');
    const before: number = calls(f).length;
    const stateBefore: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    expect((await next(f, ['retry'])).code).toBe(1);
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
    for (let sweep: number = 0; sweep < 3; sweep++) expect((await next(f, ['broken'])).code).toBe(1);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    expect(database(f)).toMatchObject({ prompts: [], starts: [], tabs: [], panes: [] });
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    saveDatabase(f, { ...database(f), failNotification: false });
    expect((await next(f, ['broken'])).code).toBe(1);
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
    saveState(path, { ...initial, attempts: { A: 2, B: 0 }, busy_since: {}, prompted: {} });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) => (p.pane_id === initial.pane.A ? { ...p, agent_status: 'unknown' } : p)),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await nextAt(f, 'fallback', now)).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(path)).toMatchObject({ attempts: { A: 2, B: 0 }, busy_since: { A: new Date(now).toISOString() } });
    expect(readState(path).busy_since.B).toBeUndefined();
    expect((await nextAt(f, 'fallback', now + 61 * 60000)).code).toBe(0);
    const notifications: string[][] = calls(f).filter((args) => args[0] === 'notification');
    expect(notifications).toHaveLength(1);
    expect(notifications[0][2]).toContain('seat A');
    expect(readState(path).busy_notified.A).toBeDefined();
    expect(readState(path).busy_notified.B).toBeUndefined();
    saveState(path, { ...readState(path), done: ['A'] });
    saveDatabase(f, {
      ...database(f),
      panes: database(f).panes.map((p) => ({ ...p, agent: 'fake', agent_status: 'unknown' })),
    });
    expect((await nextAt(f, 'fallback', now + 62 * 60000)).code).toBe(0);
    expect(readState(path).busy_since.A).toBe(new Date(now).toISOString());
    expect(readState(path).busy_since.B).toBe(new Date(now + 62 * 60000).toISOString());
  } finally {
    f.clean();
  }
}, 15000);

test('next refuses unmerged dependencies, respects capacity, and waits on unknown panes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['first'] });
    const missing: string = leaf(f, 'missing', 'plan.synthesis', { 'blocked-by': ['absent'] });
    const waiting: Result = await next(f, ['dependent']);
    expect(waiting.code).toBe(0);
    expect(waits(waiting)).toEqual(['waiting: dependent on first (plan.synthesis)']);
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
      panes: db.panes.map((p) => (p.pane_id === readState(first).pane.A ? { ...p, agent_status: 'unknown' } : p)),
    });
    const promptsBefore: number = database(f).prompts.length;
    const attemptsBefore: { A: number; B: number } = { ...readState(first).attempts };
    expect((await next(f, ['first'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(first).busy_since.A).toBeDefined();
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
    const a: string = readState(first).pane.A!;
    saveState(first, { ...readState(first), phase: 'merge' });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
    expect(readState(dependent).attempts.A).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('a closed tab hook from a merged leaf starts the dependent', async () => {
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
    expect(readState(dependent).attempts.A).toBe(0);
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
    const a: string = readState(first).pane.A!;
    saveState(first, { ...readState(first), phase: 'merge' });
    const merged: Result = await cli(f, ['phase', 'first', 'merged'], f.root, f.env);
    expect(merged.code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, [], { HERDR_PANE_ID: a })).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
    expect(readState(dependent).attempts.A).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
  } finally {
    f.clean();
  }
}, 15000);

for (const path of ['targeted', 'tab_closed', 'pane_hook'] as const) {
  test(`completing a leaf via ${path} starts only same-repo dependents`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    const g: Fixture = await fixture();
    try {
      const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
      const loose: string = leaf(f, 'loose', 'plan.synthesis', {}, 'loose-issue');
      const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
      const other: string = leaf(g, 'other', 'plan.synthesis', { repo: 'other' });
      configure(f, { repos: { repo: f.root, other: g.root } });
      expect((await next(f, ['first'])).code).toBe(0);
      const tab: string = readState(first).tab!;
      const a: string = readState(first).pane.A!;
      saveState(first, { ...readState(first), phase: 'merge' });
      expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
      const db: Database = database(f);
      saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
      if (path === 'targeted') {
        expect((await next(f, ['first'])).code).toBe(0);
      } else if (path === 'tab_closed') {
        const closedDb: Database = database(f);
        saveDatabase(f, {
          ...closedDb,
          tabs: closedDb.tabs.filter((item) => item.tab_id !== tab),
          panes: closedDb.panes.filter((pane) => pane.tab_id !== tab),
        });
        const closed: Result = await next(f, [], {
          HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
            event: 'tab_closed',
            data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w2' },
          }),
        });
        expect(closed.code).toBe(0);
      } else {
        const exitedDb: Database = database(f);
        saveDatabase(f, { ...exitedDb, panes: exitedDb.panes.filter((pane) => pane.pane_id !== a) });
        const exited: Result = await next(f, [], {
          HERDR_PANE_ID: a,
          HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
            event: 'pane_exited',
            data: { type: 'pane_exited', pane_id: a, workspace_id: 'w1' },
          }),
        });
        expect(exited.code).toBe(0);
      }
      const expected: string[] = path === 'tab_closed' ? ['second'] : ['first', 'second'];
      expect(database(f).tabs.map((item) => item.label)).toEqual(expected);
      expect(readState(second).attempts.A).toBe(0);
      for (const untouched of [loose, other]) {
        expect(readState(untouched).tab).toBeUndefined();
        expect(readState(untouched).worktree).toBeUndefined();
        expect(readState(untouched).pane).toEqual({});
      }
    } finally {
      f.clean();
      g.clean();
    }
  }, 15000);
}

test('a dependent still blocked by an unmerged leaf stays unallocated after its first blocker merges', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    leaf(f, 'other', 'plan.synthesis', {}, 'other-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first', 'other'] }, 'second-issue');
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, { ...readState(first), phase: 'merge' });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, ['first'])).code).toBe(0);
    expect(database(f).tabs.map((item) => item.label)).toEqual(['first']);
    expect(readState(second).tab).toBeUndefined();
    expect(readState(second).worktree).toBeUndefined();
    expect(readState(second).pane).toEqual({});
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
    expect(database(f).tabs).toHaveLength(1);
    configure(f, { max_active: 4 });
    const retried: Result = await next(f, ['--all']);
    expect(retried.code).toBe(1);
    expect(database(f).tabs).toHaveLength(2);
    expect([first, second].filter((path) => readState(path).worktree !== undefined)).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 15000);

test('one unreadable leaf blocks all capacity at max_active 1', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    leaf(f, 'pending', 'plan.synthesis');
    configure(f, { max_active: 1 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ path: malformed });
    expect(database(f).tabs).toHaveLength(0);
    expect(database(f).prompts).toHaveLength(0);
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

test('merged leaves do not reserve capacity for other waiting leaves', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    leaf(f, 'merged-a', 'merged');
    leaf(f, 'merged-b', 'merged');
    leaf(f, 'merged-c', 'merged');
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(f, 'second', 'plan.synthesis');
    const other: string = leaf(g, 'other', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 3, repos: { repo: f.root, other: g.root } });
    await next(f, [other]);
    await next(f, [first]);
    expect(readState(other).worktree).toBeDefined();
    expect(readState(first).worktree).toBeDefined();
    expect(database(f).tabs).toHaveLength(2);
    const blocked: Result = await next(f, [second]);
    expect(blocked.code).not.toBe(0);
    expect(skips(blocked).some((skip) => skip.path === malformed)).toBe(true);
    expect(readState(second).worktree).toBeUndefined();
    expect(database(f).tabs).toHaveLength(2);
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
    yaml(resolve(f.root, 'issues/config.yaml'), { remote: 'upstream', default_branch: 'trunk', grounding: 'none' });
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
      pane: state.pane.B,
      text: mergeText(path),
    });
    expect(database(f).prompts.at(-1)?.text?.split(' leaf=')[1]?.split(' ')[0]).toBe(
      `${f.root}/issues/open/landing/landed`,
    );
    const landedAttempt: string = z.string().parse(readState(path).batch?.attempt);
    expect(
      (
        await cli(
          f,
          ['phase', 'landed', 'merged', '--slot', 'B', '--check', '--attempt', landedAttempt],
          worktree,
          f.env,
        )
      ).code,
    ).toBe(0);
    const completed: Result = await cli(
      f,
      ['phase', 'landed', 'merged', '--slot', 'B', '--attempt', landedAttempt],
      worktree,
      f.env,
    );
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
    expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
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
    const a: string = readState(path).pane.A!;
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'idle' } : p)) });
    const event = (status: string): string =>
      JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: a, workspace_id: 'w1', agent_status: status },
      });
    expect((await next(f, [], { HERDR_PANE_ID: a, HERDR_PLUGIN_EVENT_JSON: event('working') })).code).toBe(0);
    expect(readState(path).attempts.A).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
    expect((await next(f, [], { HERDR_PANE_ID: a, HERDR_PLUGIN_EVENT_JSON: event('idle') })).code).toBe(0);
    expect(readState(path).attempts.A).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('uncommitted work in a merge worktree is left to the merge seat', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
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
      pane: state.pane.B,
      text: mergeText(path),
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
      attempts: { A: 0, B: 1 },
      busy_since: { B: new Date(Date.now() - 61 * 60000).toISOString() },
      busy_notified: {},
    });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => ({
        ...p,
        agent: 'fake',
        agent_status: p.pane_id === readState(path).pane.B ? 'working' : 'idle',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(readState(path).busy_since.B).toBeDefined();
    expect(readState(path).busy_notified.B).toBeDefined();
    expect(
      calls(f)
        .filter((args) => args[0] === 'notification')
        .at(-1)![2],
    ).toContain('seat B');
    const mergeAttempt: string = z.string().parse(readState(path).batch?.attempt);
    expect(
      (
        await cli(
          f,
          ['phase', 'active-merge', 'merged', '--slot', 'B', '--check', '--attempt', mergeAttempt],
          worktree,
          f.env,
        )
      ).code,
    ).toBe(0);
    const completed: Result = await cli(
      f,
      ['phase', 'active-merge', 'merged', '--slot', 'B', '--attempt', mergeAttempt],
      worktree,
      f.env,
    );
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
        `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/${slug}`,
        `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${g.root}/issues/open/issue/${slug}`,
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
function waits(result: Result): string[] {
  return result.stdout.split('\n').filter((line) => line.startsWith('waiting: '));
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
        mode === 'hook' ? { HERDR_PANE_ID: readState(healthy).pane.A } : {},
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
    expect(skips(result).map((s) => s.slug)).toEqual(['broken']);
    expect(skips(result)[0].error).toContain('nonexistent');
    expect(waits(result)).toEqual(['waiting: waiting on healthy (plan.synthesis)']);
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
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
      expect(database(f).tabs).toHaveLength(capacity === 3 ? 1 : 2);
      expect(database(f).prompts).toHaveLength(capacity === 3 ? 1 : 2);
      if (capacity === 3) {
        configure(f, { max_active: 5 });
        expect((await next(f, ['new'])).code).toBe(1);
        expect(database(f).tabs).toHaveLength(2);
      }
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
      `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
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
        `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
        `plan-issue other-healthy slot=A phase=plan.synthesis leaf=${g.root}/issues/open/issue/other-healthy`,
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
    const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
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
    expect(readState(healthy).worktree).toBeDefined();
    expect(database(f).prompts).toHaveLength(1);
    expect(database(f).tabs).toHaveLength(1);
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
      else yaml(resolve(root, 'issues/config.yaml'), { worktree_root: worktreeRoot, grounding: 'none' });
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
    expect((await cli(moved, ['phase', 'movable', 'implement', '--slot', 'A'])).code).toBe(0);
    expect((await next(moved, ['movable'])).code).toBe(0);
    const state: State = readState(resolve(root, 'issues/open/issue/movable'));
    expect(state.repo).toBe('repo');
    expect(state.phase).toBe('implement');
    expect(state.worktree).toBe(resolve(root, 'issues/worktrees/movable'));
    expect(await command(['git', 'branch', '--show-current'], state.worktree)).toBe('movable');
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `implement-issue movable slot=A phase=implement leaf=${root}/issues/open/issue/movable`,
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
        { pane: readState(path).pane.A!, text: `plan-issue sessionless slot=A phase=plan.synthesis leaf=${path}` },
      ]);
      expect(database(f).starts).toHaveLength(1);
    } finally {
      f.clean();
    }
  });
}

for (const seat of ['B'] as const) {
  test(`blocked merge seat ${seat} prevents fetch and clean checks in a dirty worktree`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'blocked-merge', 'plan.synthesis');
      expect((await next(f, ['blocked-merge'])).code).toBe(0);
      const state: State = readState(path);
      writeFileSync(resolve(state.worktree!, 'unfinished'), 'dirty merge work\n');
      saveState(path, { ...state, phase: 'merge', attempts: { A: 0, B: seat === 'B' ? 1 : 2 } });
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
      expect(gitCalls).not.toContain('status --porcelain');
      expect(result.code).toBe(0);
      const after: State = readState(path);
      const since: string = z.string().datetime().parse(after.busy_since[seat]);
      expect(before.busy_since.B).toBeUndefined();
      expect(Date.parse(since)).toBeGreaterThanOrEqual(observedAt);
      expect(Date.parse(since)).toBeLessThanOrEqual(Date.now());
      // The batch pass built and applied a member-less record without touching the seat.
      expect(after.batch?.applied).toBe(true);
      const { batch, ...rest }: State = after;
      expect(rest).toEqual({ ...before, busy_since: { [seat]: since }, busy_notified: {} });
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
        agent_status: pane.pane_id === state.pane.A ? 'blocked' : 'idle',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    const result: Result = await next(f, ['blocked-merge']);
    expect(result.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.B,
      text: mergeText(path),
    });
    expect(readState(path).busy_since.A).toBeDefined();
    expect(readFileSync(resolve(state.worktree!, 'unfinished'), 'utf8')).toBe('dirty merge work\n');
  } finally {
    f.clean();
  }
}, 15000);

test('merge, check.fix, check.repair and post-repair review dispatch to their swapped seats', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'post-repair', 'plan.synthesis');
    expect((await next(f, ['post-repair'])).code).toBe(0);
    const state: State = readState(path);
    const worktree: string = z.string().parse(state.worktree);
    writeFileSync(resolve(worktree, 'change'), 'fix\n');
    await command(['git', 'add', 'change'], worktree);
    await command(['git', 'commit', '-m', 'change'], worktree);
    saveState(path, { ...state, phase: 'merge', prompted: {} });
    const db0: Database = database(f);
    saveDatabase(f, { ...db0, panes: db0.panes.map((p) => ({ ...p, agent: 'fake', agent_status: 'idle' })) });
    expect((await next(f, ['post-repair'])).code).toBe(0);
    expect(database(f).prompts.at(-1)).toEqual({
      pane: state.pane.B!,
      text: mergeText(path),
    });
    saveState(path, { ...readState(path), phase: 'check.fix', prompted: {} });
    saveDatabase(f, { ...database(f), panes: database(f).panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, ['post-repair'])).code).toBe(0);
    expect(database(f).prompts.at(-1)).toEqual({
      pane: state.pane.A!,
      text: `implement-issue post-repair slot=A phase=check.fix leaf=${path}`,
    });
    saveState(path, { ...readState(path), phase: 'check.review', fix_rounds: 1, prompted: {} });
    saveDatabase(f, { ...database(f), panes: database(f).panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, ['post-repair'])).code).toBe(0);
    expect(database(f).prompts.at(-1)).toEqual({
      pane: state.pane.B!,
      text: `check-issue post-repair slot=B phase=check.review leaf=${path}`,
    });
    saveState(path, { ...readState(path), phase: 'check.repair', prompted: {} });
    saveDatabase(f, { ...database(f), panes: database(f).panes.map((p) => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, ['post-repair'])).code).toBe(0);
    expect(database(f).prompts.at(-1)).toEqual({
      pane: state.pane.B!,
      text: `check-issue post-repair slot=B phase=check.repair leaf=${path}`,
    });
    expect(
      database(f)
        .prompts.slice(1)
        .map((prompt) => prompt.pane),
    ).toEqual([state.pane.B!, state.pane.A!, state.pane.B!, state.pane.B!]);
  } finally {
    f.clean();
  }
}, 15000);

for (const missing of ['neither', 'A', 'B', 'both'] as const) {
  test(`recorded seats stay authoritative with an extra pane first and ${missing} missing allocation carries TMPDIR`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'seats', 'plan.synthesis');
      expect((await next(f, ['seats'])).code).toBe(0);
      const freshTmp: string = tmpdirOf(calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!);
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
      expect(database(f).prompts.at(-1)?.pane).toBe(allocated.pane.A);
      expect(invoked.filter((args) => args[0] === 'agent').every((args) => !args.includes('operator'))).toBe(true);
      for (const split of splits) expect(tmpdirOf(split)).toBe(freshTmp);
      expect(freshTmp.startsWith(leafTempRoot(f) + '/')).toBe(true);
      expect(existsSync(freshTmp)).toBe(true);
      expect(statSync(freshTmp).mode & 0o777).toBe(0o700);
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
        expect(updated.prompts.at(-1)?.pane).toBe(allocated.pane.A);
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

const seatLayoutSchema = z.object({
  layout: z.object({
    tab_id: z.string(),
    focused_pane_id: z.string(),
    panes: z.array(
      z.object({
        pane_id: z.string(),
        rect: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }),
        focused: z.boolean(),
      }),
    ),
  }),
});

async function herdrOut(f: DispatchFixture, args: string[]): Promise<unknown> {
  const child = Bun.spawn(['herdr', ...args], {
    env: { ...process.env, ...f.env },
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, code]: [string, number] = await Promise.all([new Response(child.stdout).text(), child.exited]);
  expect(code).toBe(0);
  return JSON.parse(stdout).result;
}

async function seatLayout(f: DispatchFixture, paneId: string): Promise<z.infer<typeof seatLayoutSchema>['layout']> {
  return seatLayoutSchema.parse(await herdrOut(f, ['pane', 'layout', '--pane', paneId])).layout;
}

async function operatorTab(f: DispatchFixture): Promise<string> {
  const created = (await herdrOut(f, [
    'tab',
    'create',
    '--label',
    'operator',
    '--cwd',
    f.root,
    '--workspace',
    'w3',
  ])) as { tab: { tab_id: string } };
  return created.tab.tab_id;
}

function rectOf(f: DispatchFixture, paneId: string): { x: number; y: number; width: number; height: number } {
  const rect = database(f).panes.find((pane) => pane.pane_id === paneId)?.rect;
  expect(rect).toBeDefined();
  return rect!;
}

function dropSeatA(f: DispatchFixture, path: string): State {
  const state: State = readState(path);
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    panes: db.panes
      .map((pane) =>
        pane.pane_id === state.pane.B
          ? {
              ...pane,
              agent: 'fake',
              agent_status: 'idle' as const,
              agent_session: { kind: 'id', value: 'session-b' } as const,
            }
          : pane,
      )
      .filter((pane) => pane.pane_id !== state.pane.A),
  });
  return state;
}

test('missing A beside surviving B puts A left of B', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-left', 'plan.synthesis');
    expect((await next(f, ['seat-a-left'])).code).toBe(0);
    resetPrompts(f, path);
    const state: State = dropSeatA(f, path);
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-left'])).code).toBe(0);
    const allocated: State = readState(path);
    expect(allocated.pane.B).toBe(state.pane.B);
    expect(allocated.pane.A).not.toBe(state.pane.A);
    const invoked: string[][] = calls(f).slice(before);
    const splits: string[][] = invoked.filter((args) => args[0] === 'pane' && args[1] === 'split');
    expect(splits).toHaveLength(1);
    expect(splits[0][2]).toBe(state.pane.B!);
    expect(invoked.filter((args) => args[0] === 'pane' && args[1] === 'swap')).toEqual([
      ['pane', 'swap', '--source-pane', state.pane.B!, '--target-pane', allocated.pane.A!],
    ]);
    const layout = await seatLayout(f, allocated.pane.A!);
    const a = layout.panes.find((pane) => pane.pane_id === allocated.pane.A)!;
    const b = layout.panes.find((pane) => pane.pane_id === allocated.pane.B)!;
    expect(a.rect.x + a.rect.width).toBeLessThanOrEqual(b.rect.x);
    const kept = database(f).panes.find((pane) => pane.pane_id === state.pane.B)!;
    expect(kept.agent).toBe('fake');
    expect(kept.agent_session).toEqual({ kind: 'id', value: 'session-b' });
  } finally {
    f.clean();
  }
});

test('restores operator tab focus from another workspace', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-focus', 'plan.synthesis');
    expect((await next(f, ['seat-a-focus'])).code).toBe(0);
    resetPrompts(f, path);
    const operator: string = await operatorTab(f);
    expect(database(f).tabs.find((tab) => tab.tab_id === operator)?.focused).toBe(true);
    const state: State = dropSeatA(f, path);
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-focus'])).code).toBe(0);
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.filter((args) => args[0] === 'pane' && args[1] === 'swap')).toHaveLength(1);
    expect(invoked).toContainEqual(['tab', 'focus', operator]);
    expect(database(f).tabs.find((tab) => tab.tab_id === operator)?.focused).toBe(true);
    expect(database(f).tabs.find((tab) => tab.tab_id === state.tab)?.focused).toBe(false);
    expect(readState(path).pane.B).toBe(state.pane.B);
  } finally {
    f.clean();
  }
});

test('restores operator tab focus within the leaf tab', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-stay', 'plan.synthesis');
    expect((await next(f, ['seat-a-stay'])).code).toBe(0);
    resetPrompts(f, path);
    const state: State = readState(path);
    expect(database(f).tabs.find((tab) => tab.tab_id === state.tab)?.focused).toBe(true);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((pane) => ({ ...pane, focused: pane.pane_id === state.pane.B })),
    });
    dropSeatA(f, path);
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-stay'])).code).toBe(0);
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.filter((args) => args[0] === 'pane' && args[1] === 'swap')).toHaveLength(1);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
    const allocated: State = readState(path);
    expect(database(f).tabs.find((tab) => tab.tab_id === allocated.tab)?.focused).toBe(true);
    expect((await seatLayout(f, allocated.pane.A!)).focused_pane_id).toBe(allocated.pane.B!);
  } finally {
    f.clean();
  }
});

test('swap failure keeps A recorded and reports the leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-fail', 'plan.synthesis');
    expect((await next(f, ['seat-a-fail'])).code).toBe(0);
    resetPrompts(f, path);
    const operator: string = await operatorTab(f);
    const state: State = dropSeatA(f, path);
    saveDatabase(f, { ...database(f), failSwapOnce: true });
    const before: number = calls(f).length;
    const result: Result = await next(f, ['seat-a-fail']);
    expect(result.code).not.toBe(0);
    const skip = skips(result)[0];
    expect(skip.slug).toBe('seat-a-fail');
    expect(skip.error).toContain('seat-a-fail');
    expect(skip.error).toContain('fixture_swap_failed');
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.filter((args) => args[0] === 'pane' && args[1] === 'swap')).toHaveLength(1);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'close')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'close')).toBe(false);
    expect(invoked).toContainEqual(['tab', 'focus', operator]);
    const kept: State = readState(path);
    expect(kept.pane.B).toBe(state.pane.B);
    expect(kept.pane.A).not.toBe(state.pane.A);
    expect(database(f).panes.some((pane) => pane.pane_id === kept.pane.A)).toBe(true);
    expect(database(f).tabs.find((tab) => tab.tab_id === operator)?.focused).toBe(true);
    resetPrompts(f, path);
    const panesBefore: number = database(f).panes.length;
    expect((await next(f, ['seat-a-fail'])).code).toBe(0);
    expect(readState(path).pane.A).toBe(kept.pane.A);
    expect(database(f).panes).toHaveLength(panesBefore);
  } finally {
    f.clean();
  }
});

test('allocation paths unchanged: new tab keeps A left with no swap or focus', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-new', 'plan.synthesis');
    expect((await next(f, ['seat-a-new'])).code).toBe(0);
    const allocated: State = readState(path);
    const a = rectOf(f, allocated.pane.A!);
    const b = rectOf(f, allocated.pane.B!);
    expect(a.x + a.width).toBeLessThanOrEqual(b.x);
    expect(calls(f).some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(calls(f).some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
  } finally {
    f.clean();
  }
});

test('allocation paths unchanged: bootstrap and B-only keep A left with no swap or focus', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-boot', 'plan.synthesis');
    expect((await next(f, ['seat-a-boot'])).code).toBe(0);
    resetPrompts(f, path);
    saveState(path, { ...readState(path), pane: {} });
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-boot'])).code).toBe(0);
    const boot: State = readState(path);
    const a = rectOf(f, boot.pane.A!);
    const b = rectOf(f, boot.pane.B!);
    expect(a.x + a.width).toBeLessThanOrEqual(b.x);
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
  } finally {
    f.clean();
  }
  const g: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(g, 'seat-a-bonly', 'plan.synthesis');
    expect((await next(g, ['seat-a-bonly'])).code).toBe(0);
    resetPrompts(g, path);
    const state: State = readState(path);
    const db: Database = database(g);
    saveDatabase(g, { ...db, panes: db.panes.filter((pane) => pane.pane_id !== state.pane.B) });
    const before: number = calls(g).length;
    expect((await next(g, ['seat-a-bonly'])).code).toBe(0);
    const allocated: State = readState(path);
    expect(allocated.pane.A).toBe(state.pane.A);
    const a = rectOf(g, allocated.pane.A!);
    const b = rectOf(g, allocated.pane.B!);
    expect(a.x + a.width).toBeLessThanOrEqual(b.x);
    const invoked: string[][] = calls(g).slice(before);
    const splits: string[][] = invoked.filter((args) => args[0] === 'pane' && args[1] === 'split');
    expect(splits).toHaveLength(1);
    expect(splits[0][2]).toBe(state.pane.A!);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
  } finally {
    g.clean();
  }
});

test('allocation paths unchanged: present and reversed seats keep IDs and positions', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-present', 'plan.synthesis');
    expect((await next(f, ['seat-a-present'])).code).toBe(0);
    resetPrompts(f, path);
    const state: State = readState(path);
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-present'])).code).toBe(0);
    const kept: State = readState(path);
    expect(kept.pane.A).toBe(state.pane.A);
    expect(kept.pane.B).toBe(state.pane.B);
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'split')).toBe(false);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
  } finally {
    f.clean();
  }
  const g: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(g, 'seat-a-reversed', 'plan.synthesis');
    expect((await next(g, ['seat-a-reversed'])).code).toBe(0);
    resetPrompts(g, path);
    const state: State = readState(path);
    const db: Database = database(g);
    const rectA = db.panes.find((pane) => pane.pane_id === state.pane.A)?.rect;
    const rectB = db.panes.find((pane) => pane.pane_id === state.pane.B)?.rect;
    saveDatabase(g, {
      ...db,
      panes: db.panes.map((pane) =>
        pane.pane_id === state.pane.A
          ? { ...pane, rect: rectB }
          : pane.pane_id === state.pane.B
            ? { ...pane, rect: rectA }
            : pane,
      ),
    });
    const ra = rectOf(g, state.pane.A!);
    const rb = rectOf(g, state.pane.B!);
    expect(ra.x).toBeGreaterThan(rb.x);
    const reversed: string = JSON.stringify(database(g).panes.map((pane) => [pane.pane_id, pane.rect]));
    const before: number = calls(g).length;
    expect((await next(g, ['seat-a-reversed'])).code).toBe(0);
    expect(readState(path).pane.A).toBe(state.pane.A);
    expect(readState(path).pane.B).toBe(state.pane.B);
    expect(JSON.stringify(database(g).panes.map((pane) => [pane.pane_id, pane.rect]))).toBe(reversed);
    const invoked: string[][] = calls(g).slice(before);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'split')).toBe(false);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
  } finally {
    g.clean();
  }
});

test('allocation paths unchanged: extra panes keep position while missing A still repairs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'seat-a-extra', 'plan.synthesis');
    expect((await next(f, ['seat-a-extra'])).code).toBe(0);
    resetPrompts(f, path);
    const state: State = readState(path);
    const extra: Database['panes'][number] = {
      pane_id: 'operator',
      tab_id: state.tab!,
      cwd: f.root,
      agent: null,
      agent_status: 'unknown',
      rect: { x: 200, y: 0, width: 50, height: 40 },
      focused: false,
    };
    saveDatabase(f, { ...database(f), panes: [...database(f).panes, extra] });
    const before: number = calls(f).length;
    expect((await next(f, ['seat-a-extra'])).code).toBe(0);
    expect(database(f).panes.find((pane) => pane.pane_id === 'operator')).toEqual(extra);
    const invoked: string[][] = calls(f).slice(before);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'split')).toBe(false);
    expect(invoked.some((args) => args[0] === 'pane' && args[1] === 'swap')).toBe(false);
    expect(invoked.some((args) => args[0] === 'tab' && args[1] === 'focus')).toBe(false);
    resetPrompts(f, path);
    dropSeatA(f, path);
    const beforeRepair: number = calls(f).length;
    expect((await next(f, ['seat-a-extra'])).code).toBe(0);
    const allocated: State = readState(path);
    expect(allocated.pane.B).toBe(state.pane.B);
    const a = rectOf(f, allocated.pane.A!);
    const b = rectOf(f, allocated.pane.B!);
    expect(a.x + a.width).toBeLessThanOrEqual(b.x);
    expect(database(f).panes.find((pane) => pane.pane_id === 'operator')).toEqual({
      ...extra,
      agent_status: 'idle',
    });
    const repaired: string[][] = calls(f).slice(beforeRepair);
    expect(repaired.filter((args) => args[0] === 'pane' && args[1] === 'swap')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

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

test('startup retries closure before cleanup and retains failed owners with their worktree and branch while the tab closes', async () => {
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
    expect(database(f).tabs).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(1);
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

for (const mode of ['--resume', '--all'] as const) {
  test(`startup retains a merged leaf's worktree and branch while closing its tab as an epic sibling stays unfinished (${mode})`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'done', 'plan.synthesis', {}, 'epic/first');
      leaf(f, 'hold', 'failed', {}, 'other');
      leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
      expect((await next(f, ['done'])).code).toBe(0);
      const worktree: string = readState(path).worktree!;
      saveState(path, { ...readState(path), phase: 'merge' });
      expect((await cli(f, ['phase', 'done', 'merged'], f.root, f.env)).code).toBe(0);
      expect((await next(f, [mode], {}, f.home)).code).toBe(mode === '--all' ? 1 : 0);
      expect(readState(path).phase).toBe('merged');
      expect(database(f).tabs).toHaveLength(0);
      expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(1);
      expect(existsSync(worktree)).toBe(true);
      expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('done');
    } finally {
      f.clean();
    }
  }, 15000);
}

for (const kind of ['seat-B blocked', 'seat-B unknown', 'seat-A idle', 'seat-A exited', 'unmerged idle'] as const) {
  test(`a leaf tab survives the ${kind} hook`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'done', 'plan.synthesis', {}, 'epic/first');
      leaf(f, 'hold', 'failed', {}, 'other');
      leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
      expect((await next(f, ['done'])).code).toBe(0);
      const seat: 'A' | 'B' = kind.startsWith('seat-A') ? 'A' : 'B';
      const pane: string = readState(path).pane[seat]!;
      if (kind !== 'unmerged idle') {
        saveState(path, { ...readState(path), phase: 'merge' });
        expect((await cli(f, ['phase', 'done', 'merged'], f.root, f.env)).code).toBe(0);
      }
      if (kind === 'seat-A exited') {
        const db: Database = database(f);
        saveDatabase(f, { ...db, panes: db.panes.filter((item) => item.pane_id !== pane) });
      }
      const status: string = kind === 'seat-B blocked' ? 'blocked' : kind === 'seat-B unknown' ? 'unknown' : 'idle';
      const result: Result = await next(f, [], {
        HERDR_PANE_ID: pane,
        HERDR_PLUGIN_EVENT_JSON: JSON.stringify(
          kind === 'seat-A exited'
            ? { event: 'pane_exited', data: { type: 'pane_exited', pane_id: pane, workspace_id: 'w1' } }
            : {
                event: 'pane_agent_status_changed',
                data: { type: 'pane_agent_status_changed', pane_id: pane, workspace_id: 'w1', agent_status: status },
              },
        ),
      });
      expect(result.code).toBe(0);
      expect(database(f).tabs.map((tab) => tab.label)).toEqual(['done']);
      expect(calls(f).some((args) => args[0] === 'tab' && args[1] === 'close')).toBe(false);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('a merged leaf whose tab is already gone makes no tab close call and a driven tab_closed hook stays quiet', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'gone', 'plan.synthesis', {});
    expect((await next(f, ['gone'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    const tab: string = readState(path).tab!;
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
    expect((await cli(f, ['phase', 'gone', 'merged'], f.root, f.env)).code).not.toBe(0);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== tab),
      panes: db.panes.filter((pane) => pane.tab_id !== tab),
    });
    writeFileSync(gh.db, JSON.stringify(failure));
    const failed: Result = await next(f, ['--all']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('offline');
    expect(existsSync(worktree)).toBe(true);
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        { stdout: '', probe },
      ]),
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(probe.closed)).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    const closed: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w1' },
      }),
    });
    expect(closed.code).toBe(0);
    expect(closed.stderr).toBe('');
    expect(calls(f).some((args) => args[0] === 'tab' && args[1] === 'close')).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('a merged leaf whose closure failed during phase merged closes its tab on the seat-B idle hook after moving', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'late', 'plan.synthesis', {}, 'late-issue');
    expect((await next(f, ['late'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge', sources: ['team/project#1'] });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/late-issue'),
      closed: resolve(f.root, 'issues/closed/late-issue'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '', code: 1, stderr: 'offline', probe },
        { stdout: '', code: 1, stderr: 'offline', probe },
      ]),
    );
    expect((await cli(f, ['phase', 'late', 'merged'], f.root, f.env)).code).not.toBe(0);
    expect(existsSync(resolve(f.root, 'issues/open/late-issue/late/state.yaml'))).toBe(true);
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        { stdout: '', probe },
      ]),
    );
    const b: string = readState(path).pane.B!;
    const result: Result = await next(f, [], {
      HERDR_PANE_ID: b,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: b, workspace_id: 'w1', agent_status: 'idle' },
      }),
    });
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(existsSync(resolve(f.root, 'issues/closed/late-issue/late/state.yaml'))).toBe(true);
    expect(database(f).tabs).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(1);
    expect(existsSync(worktree)).toBe(true);
  } finally {
    f.clean();
  }
}, 15000);

test('a seat-B idle hook closes the merged leaf tab while the worktree and branch stay', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'hold', 'failed', {}, 'other');
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge' });
    expect((await cli(f, ['phase', 'done', 'merged'], f.root, f.env)).code).toBe(0);
    const b: string = readState(path).pane.B!;
    const result: Result = await next(f, [], {
      HERDR_PANE_ID: b,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: b, workspace_id: 'w1', agent_status: 'idle' },
      }),
    });
    expect(result.code).toBe(0);
    expect(database(f).tabs).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(1);
    expect(existsSync(worktree)).toBe(true);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/done'], f.root)).code).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('next --resume re-prompts allocated idle leaves in every registered repo without allocating new work', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const aOld: string = leaf(f, 'a-old', 'plan.synthesis');
    const bOld: string = leaf(g, 'b-old', 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['a-old'])).code).toBe(0);
    expect((await next(f, ['b-old'], {}, g.root)).code).toBe(0);
    expect(database(f).tabs).toHaveLength(2);
    resetPrompts(f, aOld);
    resetPrompts(f, bOld);
    const aNew: string = leaf(f, 'a-new', 'plan.synthesis');
    const bNew: string = leaf(g, 'b-new', 'plan.synthesis', { repo: 'other' });
    const result: Result = await next(f, ['--resume'], {}, f.home);
    expect(result.code).toBe(0);
    expect(
      database(f)
        .prompts.map((prompt) => prompt.text)
        .sort(),
    ).toEqual(
      [
        `plan-issue a-old slot=A phase=plan.synthesis leaf=${aOld}`,
        `plan-issue b-old slot=A phase=plan.synthesis leaf=${bOld}`,
      ].sort(),
    );
    expect(database(f).tabs).toHaveLength(2);
    for (const path of [aNew, bNew]) {
      expect(readState(path).tab).toBeUndefined();
      expect(readState(path).worktree).toBeUndefined();
      expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    }
    for (const args of [
      ['--resume', 'a-old'],
      ['--resume', '--all'],
    ])
      expect((await next(f, args, {}, f.home)).code).not.toBe(0);
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

test('next --resume completes and cleans a merged leaf and starts its dependent', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const done: string = leaf(f, 'done', 'plan.synthesis', {}, 'solo');
    const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['done'] }, 'dep-issue');
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(done).worktree!;
    saveState(done, { ...readState(done), phase: 'merged' });
    expect(existsSync(done)).toBe(true);
    expect(readState(done).phase).toBe('merged');
    saveDatabase(f, { ...database(f), prompts: [] });
    const result: Result = await next(f, ['--resume'], {}, f.home);
    expect(result.code).toBe(0);
    expect(existsSync(resolve(f.root, 'issues/closed/solo'))).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/done'], f.root)).code).toBe(1);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['dependent']);
    expect(database(f).prompts).toEqual([
      {
        pane: readState(dependent).pane.A!,
        text: `plan-issue dependent slot=A phase=plan.synthesis leaf=${dependent}`,
      },
    ]);
    expect(readState(dependent).tab).toBeDefined();
    expect(readState(dependent).worktree).toBeDefined();
    expect(readState(dependent).attempts).toEqual({ A: 0, B: 0 });
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
        route === 'hook' ? { HERDR_PANE_ID: readState(healthy).pane.A } : {},
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
        agent_status: p.pane_id === state.pane.B ? 'idle' : 'working',
      })),
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)).toMatchObject({
      pane: state.pane.B,
      text: mergeText(path),
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
    expect(database(f).prompts.at(-1)?.text).toBe(`plan-issue debate slot=A phase=plan.synthesis leaf=${path}`);
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
    const otherPane: string = readState(otherPath).pane.A!;
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
      `plan-issue spaced slot=A phase=plan.synthesis leaf=${spaced}/issues/open/issue/spaced`,
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
    expect(readState(second).attempts.A).toBe(0);
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
    expect(readState(healthy).attempts.A).toBe(0);
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
    const a: string = readState(path).pane.A!;
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'stuck test' },
      busy_since: {},
      busy_notified: {},
    });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map((p) => (p.pane_id === a ? { ...p, agent_status: 'blocked' } : p)) });
    expect((await next(f, ['stuck'])).code).toBe(1);
    expect((await next(f, ['stuck'])).code).toBe(1);
    expect(readState(path).busy_since).toEqual({});
    expect(readState(path).busy_notified).toEqual({});
    expect(database(f).prompts).toHaveLength(promptsBefore);
  } finally {
    f.clean();
  }
}, 15000);

test('retryable prompt failure charges one attempt, records delivery_error, and sends one prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'charge', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ code: 'agent_prompt_stalled', message: 'stalled for test' }] });
    expect((await next(f, ['charge'])).code).toBe(0);
    const state: State = readState(path);
    expect(state.attempts.A).toBe(1);
    expect(state.prompted.A).toBeUndefined();
    const err = state.delivery_error.A!;
    expect(err.code).toBe('agent_prompt_stalled');
    expect(err.message).toBe('stalled for test');
    expect(err.command[0]).toBe('herdr');
    expect(err.command[1]).toBe('agent');
    expect(err.command[2]).toBe('prompt');
    expect(err.pane).toBe(state.pane.A!);
    const db: Database = database(f);
    const pane = db.panes.find((item) => item.pane_id === state.pane.A)!;
    expect(err.session).toBe(pane.agent_session?.value ?? null);
    expect(Number.isNaN(Date.parse(err.at))).toBe(false);
    expect(err.offset).toBeUndefined();
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(1);
    expect(db.prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('three consecutive prompt failures fail the leaf during the third pass', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'three-fails', 'plan.synthesis');
    const fail = { code: 'agent_prompt_stalled', message: 'stalled' };
    saveDatabase(f, { ...database(f), promptScript: [{ ...fail }, { ...fail }, { ...fail }] });
    expect((await next(f, ['three-fails'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    expect(readState(path).attempts.A).toBe(1);
    expect((await next(f, ['three-fails'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    expect(readState(path).attempts.A).toBe(2);
    expect((await next(f, ['three-fails'])).code).toBe(0);
    const state: State = readState(path);
    expect(state.phase).toBe('failed');
    expect(state.failure?.cause).toBe('attempts');
    expect(state.failure?.slot).toBe('A');
    const paneId: string = state.pane.A!;
    const pane = database(f).panes.find((item) => item.pane_id === paneId)!;
    const session: string | null = pane.agent_session?.value ?? null;
    expect(state.failure?.reason).toBe(
      `prompt undelivered to seat A after 3 passes: agent_prompt_stalled stalled (pane ${paneId}, session ${session})`,
    );
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(3);
    const before: number = calls(f).length;
    expect((await next(f, ['three-fails'])).code).toBe(1);
    expect(calls(f).length).toBe(before);
  } finally {
    f.clean();
  }
}, 15000);

test('a successful prompt between failures resets attempts', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'reset', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ code: 'agent_prompt_stalled', message: 'first' }] });
    expect((await next(f, ['reset'])).code).toBe(0);
    expect(readState(path).attempts.A).toBe(1);
    expect(readState(path).delivery_error.A?.code).toBe('agent_prompt_stalled');
    expect((await next(f, ['reset'])).code).toBe(0);
    expect(readState(path).attempts.A).toBe(0);
    expect(readState(path).delivery_error.A).toBeUndefined();
    expect(readState(path).prompted.A).toBeDefined();
    const current: State = readState(path);
    saveState(path, { ...current, prompted_at: { A: new Date(Date.now() - 3 * 60 * 1000).toISOString() } });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((item) => ({ ...item, agent_status: 'idle' })),
      promptScript: [{ code: 'agent_prompt_stalled', message: 'second' }],
    });
    expect((await next(f, ['reset'])).code).toBe(0);
    expect(readState(path).attempts.A).toBe(1);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    f.clean();
  }
}, 15000);

test('a pass that starts the agent then observes it not idle charges nothing', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'start-blocked', 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, ['start-blocked'])).code).toBe(0);
    expect(readState(path).attempts.A).toBe(0);
    expect(readState(path).delivery_error.A).toBeUndefined();
    expect(readState(path).prompted.A).toBeUndefined();
    expect(database(f).prompts).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'start')).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout settlement records delivery when exact user text lands after the offset', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-found';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-found');
    mkdirSync(fakeHome, { recursive: true });
    const sessFile: string = resolve(f.home, 'sess-found.jsonl');
    writeFileSync(sessFile, '');
    const prompt: string = `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${path}`;
    const line: string =
      JSON.stringify({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: prompt }] } }) + '\n';
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [{ code: 'timeout', message: 'wait timed out', append: line }],
    });
    expect(existsSync(resolve(fakeHome, '.pi'))).toBe(false);
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.prompted.A).toBe(sessFile);
    expect(state.delivery_error.A).toBeUndefined();
    expect(state.attempts.A).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout settlement ignores the same text before the offset', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-before';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-before');
    mkdirSync(fakeHome, { recursive: true });
    const prompt: string = `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${path}`;
    const line: string =
      JSON.stringify({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: prompt }] } }) + '\n';
    const sessFile: string = resolve(f.home, 'sess-before.jsonl');
    writeFileSync(sessFile, line);
    const beforeSize: number = statSync(sessFile).size;
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [{ code: 'timeout', message: 'wait timed out' }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.prompted.A).toBeUndefined();
    expect(state.attempts.A).toBe(1);
    expect(state.delivery_error.A?.code).toBe('timeout');
    expect(state.delivery_error.A?.offset).toBe(beforeSize);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout settlement ignores prompt text inside assistant and tool records', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-role';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-role');
    mkdirSync(fakeHome, { recursive: true });
    const prompt: string = `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${path}`;
    const assistant: string =
      JSON.stringify({ type: 'message', message: { role: 'assistant', content: [{ type: 'text', text: prompt }] } }) +
      '\n';
    const tool: string =
      JSON.stringify({ type: 'message', message: { role: 'tool', content: [{ type: 'text', text: prompt }] } }) + '\n';
    const sessFile: string = resolve(f.home, 'sess-role.jsonl');
    writeFileSync(sessFile, '');
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [{ code: 'timeout', message: 'wait timed out', append: assistant + tool }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.prompted.A).toBeUndefined();
    expect(state.attempts.A).toBe(1);
    expect(state.delivery_error.A?.code).toBe('timeout');
    expect(state.delivery_error.A?.offset).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout settlement ignores a trailing partial line but keeps earlier records', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-partial';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-partial');
    mkdirSync(fakeHome, { recursive: true });
    const prompt: string = `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${path}`;
    const line: string =
      JSON.stringify({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: prompt }] } }) + '\n';
    const sessFile: string = resolve(f.home, 'sess-partial.jsonl');
    writeFileSync(sessFile, '');
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [
        { code: 'timeout', message: 'wait timed out', append: line + '{"type":"message","message":{"role":"user"' },
      ],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.prompted.A).toBe(sessFile);
    expect(state.delivery_error.A).toBeUndefined();
    expect(state.attempts.A).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('a record appended after a timeout is recognized by the next pass without resending', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-late';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-late');
    mkdirSync(fakeHome, { recursive: true });
    const sessFile: string = resolve(f.home, 'sess-late.jsonl');
    writeFileSync(sessFile, '');
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [{ code: 'timeout', message: 'wait timed out' }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    expect(readState(path).attempts.A).toBe(1);
    expect(readState(path).delivery_error.A?.offset).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(1);
    const prompt: string = `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${path}`;
    const line: string =
      JSON.stringify({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: prompt }] } }) + '\n';
    appendFileSync(sessFile, line);
    const db1: Database = database(f);
    saveDatabase(f, { ...db1, panes: db1.panes.map((item) => ({ ...item, agent_status: 'idle' })) });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.prompted.A).toBe(sessFile);
    expect(state.delivery_error.A).toBeUndefined();
    expect(state.attempts.A).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout with a missing session file records a plain error without offset', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-missing';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-missing');
    mkdirSync(fakeHome, { recursive: true });
    const sessFile: string = resolve(f.home, 'sess-does-not-exist.jsonl');
    expect(existsSync(sessFile)).toBe(false);
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) =>
        item.pane_id === a ? { ...item, agent_status: 'idle', agent_session: { kind: 'path', value: sessFile } } : item,
      ),
      promptScript: [{ code: 'timeout', message: 'wait timed out' }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.attempts.A).toBe(1);
    expect(state.delivery_error.A?.code).toBe('timeout');
    expect(state.delivery_error.A?.offset).toBeUndefined();
  } finally {
    f.clean();
  }
}, 15000);

test('timeout settlement resolves id-kind references under HOME', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-id';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const sessionId: string = database(f).panes.find((item) => item.pane_id === a)!.agent_session!.value;
    const fakeHome: string = resolve(f.home, 'fake-home-id');
    const sessDir: string = resolve(fakeHome, '.pi/agent/sessions/abc');
    mkdirSync(sessDir, { recursive: true });
    writeFileSync(resolve(sessDir, `2026-01-01_${sessionId}.jsonl`), '');
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) => (item.pane_id === a ? { ...item, agent_status: 'idle' } : item)),
      promptScript: [{ code: 'timeout', message: 'wait timed out' }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.attempts.A).toBe(1);
    expect(state.delivery_error.A?.code).toBe('timeout');
    expect(state.delivery_error.A?.offset).toBe(0);
  } finally {
    f.clean();
  }
}, 15000);

test('timeout with an unresolvable id records a plain error without offset', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const slug: string = 'timeout-id-missing';
    const path: string = leaf(f, slug, 'plan.synthesis');
    saveDatabase(f, { ...database(f), blockOnStart: true });
    expect((await next(f, [slug])).code).toBe(0);
    const a: string = readState(path).pane.A!;
    const fakeHome: string = resolve(f.home, 'fake-home-id-missing');
    mkdirSync(fakeHome, { recursive: true });
    const db0: Database = database(f);
    saveDatabase(f, {
      ...db0,
      blockOnStart: false,
      panes: db0.panes.map((item) => (item.pane_id === a ? { ...item, agent_status: 'idle' } : item)),
      promptScript: [{ code: 'timeout', message: 'wait timed out' }],
    });
    expect((await next(f, [slug], { HOME: fakeHome })).code).toBe(0);
    const state: State = readState(path);
    expect(state.attempts.A).toBe(1);
    expect(state.delivery_error.A?.code).toBe('timeout');
    expect(state.delivery_error.A?.offset).toBeUndefined();
  } finally {
    f.clean();
  }
}, 15000);

test('a retryable agent start failure charges once without prompting, then recovers', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'start-fail', 'plan.synthesis');
    saveDatabase(f, { ...database(f), startScript: [{ code: 'agent_not_ready', message: 'not ready yet' }] });
    expect((await next(f, ['start-fail'])).code).toBe(0);
    const first: State = readState(path);
    expect(first.attempts.A).toBe(1);
    expect(first.delivery_error.A?.code).toBe('agent_not_ready');
    expect(first.delivery_error.A?.offset).toBeUndefined();
    expect(first.prompted.A).toBeUndefined();
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'start')).toHaveLength(1);
    expect((await next(f, ['start-fail'])).code).toBe(0);
    const second: State = readState(path);
    expect(second.attempts.A).toBe(0);
    expect(second.delivery_error.A).toBeUndefined();
    expect(second.prompted.A).toBeDefined();
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('a non-retryable prompt code fails unreachable without throwing and siblings still dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aPath: string = leaf(f, 'unreach-a', 'plan.synthesis');
    const bPath: string = leaf(f, 'unreach-b', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ code: 'boom', message: 'bad thing' }] });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    const states: State[] = [readState(aPath), readState(bPath)];
    const failed: State[] = states.filter((item) => item.phase === 'failed');
    const ok: State[] = states.filter((item) => item.phase === 'plan.synthesis');
    expect(failed).toHaveLength(1);
    expect(ok).toHaveLength(1);
    expect(failed[0].failure?.cause).toBe('attempts');
    expect(failed[0].failure?.reason.startsWith('seat A unreachable: boom bad thing')).toBe(true);
    expect(database(f).prompts).toHaveLength(1);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 15000);

test('non-JSON prompt stderr fails unreachable with exit code and trimmed message', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aPath: string = leaf(f, 'raw-a', 'plan.synthesis');
    const bPath: string = leaf(f, 'raw-b', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ stderr: '  oops not json  \n' }] });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    const states: State[] = [readState(aPath), readState(bPath)];
    const failed: State[] = states.filter((item) => item.phase === 'failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].failure?.reason.startsWith('seat A unreachable: exit 1 oops not json')).toBe(true);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('malformed prompt error JSON fails unreachable with exit code', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aPath: string = leaf(f, 'mal-a', 'plan.synthesis');
    const bPath: string = leaf(f, 'mal-b', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ stderr: '{"error":{"code":123}}' }] });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    const states: State[] = [readState(aPath), readState(bPath)];
    const failed: State[] = states.filter((item) => item.phase === 'failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].failure?.reason.startsWith('seat A unreachable: exit 1 {"error":{"code":123}}')).toBe(true);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('a successful prompt clears delivery_error and resets attempts', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'clear', 'plan.synthesis');
    saveDatabase(f, { ...database(f), promptScript: [{ code: 'agent_prompt_stalled', message: 'first' }] });
    expect((await next(f, ['clear'])).code).toBe(0);
    expect(readState(path).attempts.A).toBe(1);
    expect(readState(path).delivery_error.A?.code).toBe('agent_prompt_stalled');
    expect((await next(f, ['clear'])).code).toBe(0);
    const state: State = readState(path);
    expect(state.attempts.A).toBe(0);
    expect(state.delivery_error.A).toBeUndefined();
    expect(state.prompted.A).toBeDefined();
  } finally {
    f.clean();
  }
}, 15000);

test('next uses repo seat overrides for both seats with spaced model as one argv element', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: {
        a: { harness: 'fake', model: 'repo model a', effort: 'low' },
        b: { harness: 'fake', model: 'repo-b', effort: 'low' },
      },
    });
    const path: string = leaf(f, 'override', 'plan.positions');
    expect((await next(f, ['override'])).code).toBe(0);
    const state: State = readState(path);
    const db: Database = database(f);
    const byPane = (pane: string): string[] => {
      const found: string[] | undefined = db.starts.find((args) => args[args.indexOf('--pane') + 1] === pane);
      if (found === undefined) throw new Error(`Missing start for pane ${pane}`);
      return found;
    };
    const startA: string[] = byPane(z.string().parse(state.pane.A));
    const startB: string[] = byPane(z.string().parse(state.pane.B));
    expect(startA).toContain('repo model a');
    expect(startA.filter((x) => x === 'repo model a')).toHaveLength(1);
    expect(startA[startA.indexOf('--kind') + 1]).toBe('fake');
    expect(startB).toContain('repo-b');
    expect(startB[startB.indexOf('--kind') + 1]).toBe('fake');
  } finally {
    f.clean();
  }
}, 15000);

test('next inherits non-overridden seat from global slots', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'only-a', effort: 'low' } },
    });
    const path: string = leaf(f, 'inherit', 'plan.positions');
    expect((await next(f, ['inherit'])).code).toBe(0);
    const state: State = readState(path);
    const db: Database = database(f);
    const byPane = (pane: string): string[] => {
      const found: string[] | undefined = db.starts.find((args) => args[args.indexOf('--pane') + 1] === pane);
      if (found === undefined) throw new Error(`Missing start for pane ${pane}`);
      return found;
    };
    const startA: string[] = byPane(z.string().parse(state.pane.A));
    const startB: string[] = byPane(z.string().parse(state.pane.B));
    expect(startA).toContain('only-a');
    expect(startB).toContain('strong-b');
    expect(startB[startB.indexOf('--kind') + 1]).toBe('fake');
  } finally {
    f.clean();
  }
}, 15000);

test('next refuses unknown harness override before allocation', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'ghost', model: 'm', effort: 'e' } },
    });
    const path: string = leaf(f, 'ghost-leaf', 'plan.synthesis');
    const result: Result = await next(f, ['ghost-leaf']);
    expect(result.code).not.toBe(0);
    expect(skips(result)[0].error).toContain('ghost');
    expect(skips(result)[0].error).toContain('repo');
    expect(skips(result)[0].error).toContain('b');
    expect(database(f).tabs).toHaveLength(0);
    expect(database(f).panes).toHaveLength(0);
    expect(readState(path).worktree).toBeUndefined();
    expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

const seatByPane = (db: Database, state: State, slot: 'A' | 'B'): string[] => {
  const found: string[] | undefined = db.starts.find((args) => args[args.indexOf('--pane') + 1] === state.pane[slot]);
  if (found === undefined) throw new Error(`Missing start for seat ${slot}`);
  return found;
};

test('next resolves seats from EPIC.md front matter and falls back per seat', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'epic-seats', 'plan.positions', {}, 'epic/issue');
    writeFileSync(
      resolve(f.root, 'issues/open/epic/EPIC.md'),
      '---\nslots:\n  a:\n    harness: fake\n    model: epic-a\n    effort: low\n---\n# Epic\n',
    );
    expect((await next(f, ['epic-seats'])).code).toBe(0);
    const state: State = readState(path);
    const db: Database = database(f);
    expect(db.starts).toHaveLength(2);
    const startA: string[] = seatByPane(db, state, 'A');
    const startB: string[] = seatByPane(db, state, 'B');
    expect(startA).toContain('epic-a');
    expect(startA).toContain('low');
    expect(startA).not.toContain('strong-a');
    expect(startB).toContain('strong-b');
    expect(startB).toContain('medium');
  } finally {
    f.clean();
  }
}, 15000);

test('next prefers ISSUE.md seats over EPIC.md and applies a standalone issue block', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'nested', 'plan.positions', {}, 'epic/issue');
    writeFileSync(
      resolve(f.root, 'issues/open/epic/EPIC.md'),
      '---\nslots:\n  b:\n    harness: fake\n    model: epic-b\n    effort: low\n---\n# Epic\n',
    );
    writeFileSync(
      resolve(f.root, 'issues/open/epic/issue/ISSUE.md'),
      '---\nslots:\n  b:\n    harness: fake\n    model: issue-b\n    effort: medium\n---\n# Issue\n',
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'fake', model: 'repo-b', effort: 'low' } },
    });
    expect((await next(f, ['nested'])).code).toBe(0);
    const state: State = readState(path);
    const db: Database = database(f);
    const startA: string[] = seatByPane(db, state, 'A');
    const startB: string[] = seatByPane(db, state, 'B');
    expect(startA).toContain('strong-a');
    expect(startB).toContain('issue-b');
    expect(startB).toContain('medium');
    expect(startB).not.toContain('epic-b');
    expect(startB).not.toContain('repo-b');

    const alone: string = leaf(f, 'standalone', 'plan.positions');
    writeFileSync(
      resolve(f.root, 'issues/open/issue/ISSUE.md'),
      '---\nslots:\n  a:\n    harness: fake\n    model: issue-a\n    effort: low\n---\n# Issue\n',
    );
    expect((await next(f, ['standalone'])).code).toBe(0);
    const standalone: State = readState(alone);
    const startAlone: string[] = seatByPane(database(f), standalone, 'A');
    expect(startAlone).toContain('issue-a');
    expect(startAlone).toContain('low');
  } finally {
    f.clean();
  }
}, 15000);

const malformedIndex: [string, string][] = [
  ['unparseable front matter', '---\nslots: [\n---\n# Issue\n'],
  ['a key other than slots', '---\nseats: {}\n---\n# Issue\n'],
  ['a seat other than a or b', '---\nslots:\n  c:\n    harness: fake\n    model: m\n    effort: e\n---\n# Issue\n'],
  ['a missing seat field', '---\nslots:\n  a:\n    harness: fake\n    model: m\n---\n# Issue\n'],
  ['a blank seat value', "---\nslots:\n  a:\n    harness: fake\n    model: ' '\n    effort: e\n---\n# Issue\n"],
  ['a quoted seat value', "---\nslots:\n  a:\n    harness: fake\n    model: m'x\n    effort: e\n---\n# Issue\n"],
];

for (const [name, content] of malformedIndex) {
  test(`next refuses an ISSUE.md index with ${name} before any allocation`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      leaf(f, 'malformed', 'plan.synthesis');
      const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
      writeFileSync(index, content);
      const result: Result = await next(f, ['malformed']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(index);
      expect(result.stderr).toContain('Invalid slots front matter');
      expect(database(f).tabs).toHaveLength(0);
      expect(database(f).panes).toHaveLength(0);
      expect(database(f).starts).toHaveLength(0);
      expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('next refuses an ISSUE.md index whose harness has no template before any allocation', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'ghost', 'plan.synthesis');
    const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
    writeFileSync(index, '---\nslots:\n  a:\n    harness: ghost\n    model: m\n    effort: e\n---\n# Issue\n');
    const result: Result = await next(f, ['ghost']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(index);
    expect(result.stderr).toContain('ghost');
    expect(result.stderr).toContain('a');
    expect(database(f).tabs).toHaveLength(0);
    expect(database(f).panes).toHaveLength(0);
    expect(database(f).starts).toHaveLength(0);
    expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

type Refusal = z.infer<typeof skipSchema>;
async function refusal(f: DispatchFixture, slug: string, path: string): Promise<Refusal> {
  const result: Result = await next(f, [slug]);
  expect(result.code).toBe(1);
  const lines: Refusal[] = skips(result);
  expect(lines).toHaveLength(1);
  expect(lines[0]).toMatchObject({ repo: 'repo', slug, path });
  expect(calls(f)).toEqual([]);
  expect(database(f).tabs).toHaveLength(0);
  expect(database(f).panes).toHaveLength(0);
  return lines[0];
}

for (const { code, remedy, sabotage } of [
  {
    code: 'C1',
    remedy: 'git remote add origin',
    sabotage: (f: DispatchFixture) => command(['git', 'remote', 'remove', 'origin'], f.root),
  },
  {
    code: 'C2',
    remedy: 'push',
    sabotage: async (f: DispatchFixture) => {
      await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
      await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    },
  },
  {
    code: 'C3',
    remedy: 'git fetch origin main',
    sabotage: (f: DispatchFixture) => command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root),
  },
]) {
  test(`next refuses a new leaf with a missing base (${code}) before worktree creation`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'fresh', 'plan.synthesis');
      await sabotage(f);
      const skip: Refusal = await refusal(f, 'fresh', path);
      expect(skip.error).toContain(code);
      expect(skip.error).toContain(remedy);
      expect(existsSync(resolve(f.root, 'issues/worktrees/fresh'))).toBe(false);
      expect(readState(path).worktree).toBeUndefined();
    } finally {
      f.clean();
    }
  });
}

test('next refuses a leaf branch without a worktree when the remote branch is gone', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await command(['git', 'branch', 'stale'], f.root);
    const path: string = leaf(f, 'stale', 'plan.synthesis');
    await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    const skip: Refusal = await refusal(f, 'stale', path);
    expect(skip.error).toContain('C2');
    expect(existsSync(resolve(f.root, 'issues/worktrees/stale'))).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('next refuses an existing worktree whose tracking ref is deleted while the remote branch lives', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(f.root, 'issues/worktrees/resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    const path: string = leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    const skip: Refusal = await refusal(f, 'resident', path);
    expect(skip.error).toContain('C3');
    expect(skip.error).toContain('git fetch origin main');
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).worktree).toBe(worktree);
  } finally {
    f.clean();
  }
});

test('next refuses an existing worktree whose tracking ref is deleted when the remote branch is gone', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(f.root, 'issues/worktrees/resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    const path: string = leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    const skip: Refusal = await refusal(f, 'resident', path);
    expect(skip.error).toContain('C2');
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).worktree).toBe(worktree);
  } finally {
    f.clean();
  }
});

test('next dispatches an existing worktree without querying an unreachable remote', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(f.root, 'issues/worktrees/resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'gone.git')], f.root);
    expect((await next(f, ['resident'])).code).toBe(0);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('next refuses to create a worktree while the remote is unreachable', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'fresh', 'plan.synthesis');
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'gone.git')], f.root);
    const skip: Refusal = await refusal(f, 'fresh', path);
    expect(skip.error).toContain('Unproven');
    expect(skip.error).toContain('ls-remote');
    expect(existsSync(resolve(f.root, 'issues/worktrees/fresh'))).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('next branches a new worktree from the tracking commit, never a same-named local ref', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const tracked: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'commit', '--allow-empty', '-m', 'impostor'], f.root);
    const impostor: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    await command(['git', 'branch', 'origin/main', impostor], f.root);
    await command(['git', 'tag', 'origin/main', impostor], f.root);
    leaf(f, 'fresh', 'plan.synthesis');
    expect((await next(f, ['fresh'])).code).toBe(0);
    expect(await command(['git', 'rev-parse', 'refs/heads/fresh'], f.root)).toBe(tracked);
    const create: string[] | undefined = calls(f).find((args) => args[0] === 'tab' && args[1] === 'create');
    expect(create).toBeDefined();
    expect(create!.filter((arg) => arg.startsWith('AKROGON_BASE='))).toEqual([`AKROGON_BASE=${tracked}`]);
  } finally {
    f.clean();
  }
});
test('fresh allocation carries TMPDIR on create and B split with 0700 scratch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'fresh-tmp', 'plan.synthesis');
    expect((await next(f, ['fresh-tmp'])).code).toBe(0);
    const create: string[] = calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!;
    const splits: string[][] = calls(f).filter((args) => args[0] === 'pane' && args[1] === 'split');
    expect(splits).toHaveLength(1);
    const createTmp: string = tmpdirOf(create);
    expect(tmpdirOf(splits[0])).toBe(createTmp);
    expect(createTmp.startsWith(leafTempRoot(f) + '/')).toBe(true);
    expect(existsSync(createTmp)).toBe(true);
    expect(statSync(createTmp).mode & 0o777).toBe(0o700);
    expect(statSync(resolve(createTmp, '..')).mode & 0o777).toBe(0o700);
  } finally {
    f.clean();
  }
}, 15000);

test('new tab empties stale scratch, live tab keeps it, and seats disable the node compile cache', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'stale-tmp', 'plan.synthesis');
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    const create: string[] = calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!;
    expect(create).toContain('NODE_DISABLE_COMPILE_CACHE=1');
    const scratch: string = tmpdirOf(create);
    writeFileSync(resolve(scratch, 'stale'), 'x\n');
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    expect(existsSync(resolve(scratch, 'stale'))).toBe(true);
    saveDatabase(f, { ...database(f), tabs: [], panes: [] });
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'create')).toHaveLength(2);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    expect(existsSync(resolve(scratch, 'stale'))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('allocation carries TMPDIR refuses symlink override with no tab or split', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const target: string = resolve(f.home, 'real-target');
    mkdirSync(target);
    const link: string = resolve(f.home, 'evil-link');
    symlinkSync(target, link);
    leaf(f, 'refuse-link', 'plan.synthesis');
    const result: Result = await next(f, ['refuse-link'], { AKROGON_LEAF_TEMP_ROOT: link });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(link);
    expect(result.stderr).toContain('Refusing');
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'create')).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'pane' && args[1] === 'split')).toHaveLength(0);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('allocation carries TMPDIR refuses file override with no tab or split', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const file: string = resolve(f.home, 'not-a-dir');
    writeFileSync(file, 'x\n');
    leaf(f, 'refuse-file', 'plan.synthesis');
    const result: Result = await next(f, ['refuse-file'], { AKROGON_LEAF_TEMP_ROOT: file });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(file);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'create')).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'pane' && args[1] === 'split')).toHaveLength(0);
    expect(database(f).tabs).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('allocation carries TMPDIR corrects permissive owned dirs to 0700', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const root: string = resolve(f.home, 'permissive-root');
    mkdirSync(root, { mode: 0o777 });
    chmodSync(root, 0o777);
    expect(statSync(root).mode & 0o777).toBe(0o777);
    const path: string = leaf(f, 'permissive', 'plan.synthesis');
    expect((await next(f, ['permissive'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    expect(statSync(root).mode & 0o777).toBe(0o700);
    const create: string[] = calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!;
    const scratch: string = tmpdirOf(create);
    expect(scratch.startsWith(root + '/')).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    for (const split of calls(f).filter((args) => args[0] === 'pane' && args[1] === 'split'))
      expect(tmpdirOf(split)).toBe(scratch);
    const before: State = readState(path);
    chmodSync(scratch, 0o777);
    expect(statSync(scratch).mode & 0o777).toBe(0o777);
    expect((await next(f, ['permissive'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    const after: State = readState(path);
    expect(after.tab).toBe(before.tab);
    expect(after.pane).toEqual(before.pane);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
  } finally {
    f.clean();
  }
}, 15000);
test('leaf temp path bounds stay short with mocked uid', async () => {
  const f: Fixture = await fixture();
  try {
    const slug: string = 'a'.repeat(200);
    const rootOne: string = '/very/long/' + 'r'.repeat(200);
    const rootTwo: string = '/very/long/' + 's'.repeat(200);
    const configPath: string = resolve(import.meta.dir, '../src/config.ts');
    const code: string =
      'delete process.env.AKROGON_LEAF_TEMP_ROOT; ' +
      'process.getuid = () => 1234567890; ' +
      'const { leafTemp } = await import(' +
      JSON.stringify(configPath) +
      '); ' +
      'const slug = ' +
      JSON.stringify(slug) +
      '; ' +
      'const p1 = leafTemp({ name: ' +
      JSON.stringify('repo') +
      ', root: ' +
      JSON.stringify(rootOne) +
      ', config: {} }, slug); ' +
      'const p2 = leafTemp({ name: ' +
      JSON.stringify('repo') +
      ', root: ' +
      JSON.stringify(rootTwo) +
      ', config: {} }, slug); ' +
      'const { basename } = await import(' +
      JSON.stringify('node:path') +
      '); ' +
      'console.log(JSON.stringify({ p1: p1, p2: p2, len: Buffer.byteLength(p1), base: basename(p1), prefix: slug.slice(0, 20) }));';
    const env: NodeJS.ProcessEnv = { ...process.env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) };
    delete env.AKROGON_LEAF_TEMP_ROOT;
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, '--eval', code], {
      cwd: f.root,
      env: env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const stdout: string = await new Response(child.stdout).text();
    const stderr: string = await new Response(child.stderr).text();
    const exited: number = await child.exited;
    expect(stderr.trim()).toBe('');
    expect(exited).toBe(0);
    const out: { p1: string; p2: string; len: number; base: string; prefix: string } = JSON.parse(stdout.trim());
    expect(out.len).toBeLessThanOrEqual(62);
    expect(out.base.startsWith(out.prefix)).toBe(true);
    expect(out.p1).not.toBe(out.p2);
    expect(out.p1.startsWith('/tmp/akrogon-1234567890/')).toBe(true);
    expect(existsSync(out.p1)).toBe(false);
    expect(existsSync(out.p2)).toBe(false);
    expect(existsSync(leafTempRoot(f))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('closed tab scratch deletes merged folder and prunes inner worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'scrub', 'plan.synthesis');
    expect((await next(f, ['scrub'])).code).toBe(0);
    const tab: string = readState(path).tab!;
    const scratch: string = tmpdirOf(calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!);
    expect(existsSync(scratch)).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'gone\n');
    const inner: string = resolve(scratch, 'inner-wt');
    await command(['git', 'worktree', 'add', '--detach', inner], f.root);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).toContain(inner);
    saveState(path, { ...readState(path), phase: 'merged' });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== tab),
      panes: db.panes.filter((pane) => pane.tab_id !== tab),
    });
    const closed: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w1' },
      }),
    });
    expect(closed.code).toBe(0);
    expect(existsSync(scratch)).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain(inner);
  } finally {
    f.clean();
  }
}, 15000);

test('closed tab scratch keeps failed folder and sentinel', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'failed-keep', 'plan.synthesis');
    expect((await next(f, ['failed-keep'])).code).toBe(0);
    const tab: string = readState(path).tab!;
    const scratch: string = tmpdirOf(calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!);
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'stay\n');
    saveState(path, { ...readState(path), phase: 'failed' });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== tab),
      panes: db.panes.filter((pane) => pane.tab_id !== tab),
    });
    const closed: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w1' },
      }),
    });
    expect(closed.code).toBe(0);
    expect(existsSync(scratch)).toBe(true);
    expect(readFileSync(sentinel, 'utf8')).toBe('stay\n');
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
  } finally {
    f.clean();
  }
}, 15000);
test('sweep scratch catch-up deletes open and closed folders with no live panes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const openPath: string = leaf(f, 'open-done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'hold', 'failed', {}, 'other');
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
    const soloPath: string = leaf(f, 'solo-done', 'plan.synthesis', {}, 'solo-issue');
    expect((await next(f, ['open-done'])).code).toBe(0);
    expect((await next(f, ['solo-done'])).code).toBe(0);
    const openTab: string = readState(openPath).tab!;
    const soloTab: string = readState(soloPath).tab!;
    function scratchFor(slug: string): string {
      const create: string[] = calls(f).find(
        (args) => args[0] === 'tab' && args[1] === 'create' && args.includes(slug),
      )!;
      return tmpdirOf(create);
    }
    const openScratch: string = scratchFor('open-done');
    const soloScratch: string = scratchFor('solo-done');
    const openSentinel: string = resolve(openScratch, 'sentinel');
    const soloSentinel: string = resolve(soloScratch, 'sentinel');
    writeFileSync(openSentinel, 'open\n');
    writeFileSync(soloSentinel, 'solo\n');
    saveState(openPath, { ...readState(openPath), phase: 'merge' });
    expect((await cli(f, ['phase', 'open-done', 'merged'], f.root, f.env)).code).toBe(0);
    saveState(soloPath, { ...readState(soloPath), phase: 'merge' });
    expect((await cli(f, ['phase', 'solo-done', 'merged'], f.root, f.env)).code).toBe(0);
    expect(existsSync(openPath)).toBe(true);
    const soloClosed: string = resolve(f.root, 'issues/closed/solo-issue/solo-done');
    expect(existsSync(soloClosed)).toBe(true);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== openTab && item.tab_id !== soloTab),
      panes: db.panes.filter((pane) => pane.tab_id !== openTab && pane.tab_id !== soloTab),
    });
    const closesBefore: number = calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close').length;
    expect((await next(f, [])).code).toBe(1);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(closesBefore);
    expect(existsSync(openScratch)).toBe(false);
    expect(existsSync(soloScratch)).toBe(false);
    expect(existsSync(openSentinel)).toBe(false);
    expect(existsSync(soloSentinel)).toBe(false);
    expect(existsSync(openPath)).toBe(true);
    expect(existsSync(soloClosed)).toBe(true);
    expect(existsSync(readState(openPath).worktree!)).toBe(true);
    expect(existsSync(readState(soloClosed).worktree!)).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('sweep scratch catch-up keeps sentinel with live panes then deletes on later sweep', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const donePath: string = leaf(f, 'live-done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'hold', 'failed', {}, 'other');
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
    expect((await next(f, ['live-done'])).code).toBe(0);
    const tab: string = readState(donePath).tab!;
    const scratch: string = tmpdirOf(calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!);
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'live\n');
    saveState(donePath, { ...readState(donePath), phase: 'merge' });
    expect((await cli(f, ['phase', 'live-done', 'merged'], f.root, f.env)).code).toBe(0);
    expect(existsSync(donePath)).toBe(true);
    expect(database(f).tabs.some((item) => item.tab_id === tab)).toBe(true);
    expect((await next(f, [])).code).toBe(1);
    expect(database(f).tabs).toHaveLength(0);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(1);
    expect(existsSync(scratch)).toBe(true);
    expect(readFileSync(sentinel, 'utf8')).toBe('live\n');
    expect(existsSync(donePath)).toBe(true);
    expect((await next(f, [])).code).toBe(1);
    expect(existsSync(scratch)).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('dispatch recreates missing scratch with same tab and seats', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'recreate', 'plan.synthesis');
    expect((await next(f, ['recreate'])).code).toBe(0);
    const before: State = readState(path);
    const scratch: string = tmpdirOf(calls(f).find((args) => args[0] === 'tab' && args[1] === 'create')!);
    expect(existsSync(scratch)).toBe(true);
    rmSync(scratch, { recursive: true, force: true });
    expect(existsSync(scratch)).toBe(false);
    const beforeCalls: number = calls(f).length;
    expect((await next(f, ['recreate'])).code).toBe(0);
    const after: State = readState(path);
    expect(after.tab).toBe(before.tab);
    expect(after.pane).toEqual(before.pane);
    expect(existsSync(scratch)).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    const later: string[][] = calls(f).slice(beforeCalls);
    expect(later.filter((args) => args[0] === 'tab' && args[1] === 'create')).toHaveLength(0);
    expect(later.filter((args) => args[0] === 'pane' && args[1] === 'split')).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('fixture temp root isolates every TMPDIR and envs carry override', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const root: string = leafTempRoot(f);
    expect(root).toBe(resolve(f.home, 'leaf-temp'));
    expect(f.env['AKROGON_LEAF_TEMP_ROOT']).toBe(root);
    leaf(f, 'first-tmp', 'plan.synthesis');
    expect((await next(f, ['first-tmp'])).code).toBe(0);
    const creates: string[][] = calls(f).filter((args) => args[0] === 'tab' && args[1] === 'create');
    const splits: string[][] = calls(f).filter((args) => args[0] === 'pane' && args[1] === 'split');
    expect(creates).toHaveLength(1);
    for (const args of [...creates, ...splits]) {
      const tmp: string = tmpdirOf(args);
      expect(tmp.startsWith(root + '/')).toBe(true);
      expect(existsSync(tmp)).toBe(true);
      expect(statSync(tmp).mode & 0o777).toBe(0o700);
    }
    leaf(f, 'second-tmp', 'plan.synthesis');
    const stripped: NodeJS.ProcessEnv = { ...f.env };
    delete stripped['AKROGON_LEAF_TEMP_ROOT'];
    expect('AKROGON_LEAF_TEMP_ROOT' in stripped).toBe(false);
    const before: number = calls(f).length;
    expect((await cli(f, ['next', 'second-tmp'], f.root, stripped)).code).toBe(0);
    const fresh: string[][] = calls(f)
      .slice(before)
      .filter((args) => args[0] === 'tab' && args[1] === 'create');
    expect(fresh).toHaveLength(1);
    const secondTmp: string = tmpdirOf(fresh[0]);
    expect(secondTmp.startsWith(root + '/')).toBe(true);
    expect(existsSync(secondTmp)).toBe(true);
    leaf(f, 'third-tmp', 'plan.synthesis');
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    expect((await nextAt(f, 'third-tmp', now)).code).toBe(0);
    const allCreates: string[][] = calls(f).filter((args) => args[0] === 'tab' && args[1] === 'create');
    expect(allCreates).toHaveLength(3);
    for (const args of allCreates) expect(tmpdirOf(args).startsWith(root + '/')).toBe(true);
    const prodRoot: string = '/tmp/akrogon-' + String(process.getuid!());
    expect(root).not.toBe(prodRoot);
  } finally {
    f.clean();
  }
}, 15000);

function readinessInput(leafPath: string, input: object): void {
  yaml(resolve(leafPath, 'readiness.yaml'), { inputs: [input], produces: [], grants: [], retained: [], proofs: [] });
}
const envFoo: object = {
  kind: 'env',
  name: 'FOO',
  holder: 'repo',
  purpose: 'p',
  consumers: ['x'],
  steps: 's',
  source: 't',
  done: 'd',
};
async function undispatched(f: DispatchFixture, slug: string): Promise<void> {
  expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
  expect((await run(['git', 'branch', '--list', slug], f.root)).stdout).toBe('');
  expect(database(f).tabs).toHaveLength(0);
  expect(database(f).panes).toHaveLength(0);
  expect(database(f).prompts).toHaveLength(0);
}

test('next refuses an env-gapped leaf in every missing .env state and dispatches when set', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'gapped', 'plan.synthesis');
    const path: string = resolve(f.root, 'issues/open/issue/gapped');
    readinessInput(path, envFoo);
    for (const env of [undefined, 'BAR=1\n', 'FOO=\n', 'FOO="  "\n']) {
      if (env === undefined) rmSync(resolve(f.root, '.env'), { force: true });
      else writeFileSync(resolve(f.root, '.env'), env);
      const result: Result = await next(f, ['gapped']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('FOO');
      await undispatched(f, 'gapped');
    }
    writeFileSync(resolve(f.root, '.env'), 'FOO=x\n');
    expect((await next(f, ['gapped'])).code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('next refuses a leaf whose declared file input is absent or empty', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'needsfile', 'plan.synthesis');
    readinessInput(path, { ...envFoo, kind: 'file', name: 'need.txt' });
    const result: Result = await next(f, ['needsfile']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('need.txt');
    writeFileSync(resolve(f.root, 'need.txt'), '');
    const empty: Result = await next(f, ['needsfile']);
    expect(empty.code).not.toBe(0);
    expect(empty.stderr).toContain('need.txt');
    await undispatched(f, 'needsfile');
    writeFileSync(resolve(f.root, 'need.txt'), 'content\n');
    expect((await next(f, ['needsfile'])).code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('next --all leaves a gapped leaf undispatched while its ungapped sibling dispatches', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const gapped: string = leaf(f, 'gapped', 'plan.synthesis');
    readinessInput(gapped, envFoo);
    leaf(f, 'ready', 'plan.synthesis');
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(readState(gapped).worktree).toBeUndefined();
    expect((await run(['git', 'branch', '--list', 'gapped'], f.root)).stdout).toBe('');
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['ready']);
    expect(database(f).prompts.every((p) => p.text.includes('ready'))).toBe(true);
  } finally {
    f.clean();
  }
}, 15000);

test('an input held by an unregistered absolute directory checks that directory .env', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const holder: string = mkdtempSync(resolve(tmpdir(), 'akrogon-holder-'));
  try {
    const path: string = leaf(f, 'foreign', 'plan.synthesis');
    readinessInput(path, { ...envFoo, holder });
    const refused: Result = await next(f, ['foreign']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('FOO');
    await undispatched(f, 'foreign');
    writeFileSync(resolve(holder, '.env'), 'FOO=x\n');
    expect((await next(f, ['foreign'])).code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    rmSync(holder, { recursive: true, force: true });
    f.clean();
  }
}, 15000);

test('an invalid readiness.yaml skips the leaf and names the file path', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'readiness.yaml'), 'inputs: [');
    const result: Result = await next(f, ['malformed']);
    expect(result.code).not.toBe(0);
    expect(skips(result)[0].error).toContain(resolve(malformed, 'readiness.yaml'));
    await undispatched(f, 'malformed');
    const invalid: string = leaf(f, 'invalid', 'plan.synthesis');
    yaml(resolve(invalid, 'readiness.yaml'), {
      inputs: [{ kind: 'env' }],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    const second: Result = await next(f, ['invalid']);
    expect(second.code).not.toBe(0);
    expect(skips(second)[0].error).toContain(resolve(invalid, 'readiness.yaml'));
    await undispatched(f, 'invalid');
  } finally {
    f.clean();
  }
}, 15000);

test('a dispatched worktree links .env to the registered checkout and reads appended lines', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const target: string = resolve(f.root, '.env');
    writeFileSync(target, 'SYNTHETIC_ONE=1\n');
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const link: string = resolve(f.root, 'issues/worktrees/build/.env');
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readlinkSync(link)).toBe(target);
    appendFileSync(target, 'SYNTHETIC_TWO=2\n');
    expect(readFileSync(link, 'utf8')).toBe('SYNTHETIC_ONE=1\nSYNTHETIC_TWO=2\n');
  } finally {
    f.clean();
  }
}, 15000);

test('dispatch recreates a deleted .env link in a reused worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const link: string = resolve(f.root, 'issues/worktrees/build/.env');
    rmSync(link);
    expect((await next(f, ['build'])).code).toBe(0);
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readlinkSync(link)).toBe(resolve(f.root, '.env'));
  } finally {
    f.clean();
  }
}, 15000);

test('a pre-linked worktree keeps its .env link unchanged across dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const worktree: string = resolve(f.root, 'issues/worktrees/build');
    await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
    const link: string = resolve(worktree, '.env');
    symlinkSync(resolve(f.root, '.env'), link);
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readlinkSync(link)).toBe(resolve(f.root, '.env'));
  } finally {
    f.clean();
  }
}, 15000);

test('without a registered .env the worktree gets a dangling link and no target is created', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const link: string = resolve(f.root, 'issues/worktrees/build/.env');
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(existsSync(resolve(f.root, '.env'))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

for (const kind of ['real file', 'tracked file', 'stale link', 'unignored'] as const) {
  test(`next refuses an .env link over ${kind}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const worktree: string = resolve(f.root, 'issues/worktrees/build');
      await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
      const link: string = resolve(worktree, '.env');
      if (kind === 'real file') writeFileSync(link, 'SYNTHETIC_SECRET=1\n');
      if (kind === 'tracked file') {
        writeFileSync(link, 'SYNTHETIC_SECRET=1\n');
        await command(['git', 'add', '-f', '.env'], worktree);
        await command(['git', 'commit', '-m', 'track env'], worktree);
      }
      if (kind === 'stale link') symlinkSync(resolve(f.home, 'other-env'), link);
      if (kind === 'unignored') writeFileSync(resolve(worktree, '.gitignore'), 'node_modules\n');
      leaf(f, 'build', 'plan.synthesis');
      const result: Result = await next(f, ['build']);
      expect(result.code).not.toBe(0);
      const error: string = skips(result)[0].error;
      expect(error).toContain(`Refusing .env link at ${link}`);
      if (kind === 'real file' || kind === 'stale link')
        expect(error).toContain(`path exists and does not already link to ${resolve(f.root, '.env')}`);
      if (kind === 'tracked file') expect(error).toContain('path is tracked by git');
      if (kind === 'unignored') expect(error).toContain('path is not ignored by git');
      if (kind === 'real file' || kind === 'tracked file')
        expect(readFileSync(link, 'utf8')).toBe('SYNTHETIC_SECRET=1\n');
      if (kind === 'stale link') expect(readlinkSync(link)).toBe(resolve(f.home, 'other-env'));
      if (kind === 'unignored') expect(() => lstatSync(link)).toThrow(/ENOENT/);
      expect(database(f).prompts).toHaveLength(0);
      expect(database(f).starts).toHaveLength(0);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('next refuses to link .env not ignored in the registered checkout, keeps the worktree, and reuses it after the ignore rule returns', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    writeFileSync(resolve(f.root, '.gitignore'), 'node_modules\n');
    leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).not.toBe(0);
    const target: string = resolve(f.root, '.env');
    const error: string = skips(result)[0].error;
    expect(error).toContain(resolve(f.root, 'issues/worktrees/build/.env'));
    expect(error).toContain(`path is not ignored in the registered checkout ${f.root}`);
    expect(existsSync(target)).toBe(false);
    const worktree: string = resolve(f.root, 'issues/worktrees/build');
    expect(existsSync(worktree)).toBe(true);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/build'], f.root)).code).toBe(0);
    expect(database(f).prompts).toHaveLength(0);
    expect(database(f).starts).toHaveLength(0);
    writeFileSync(resolve(f.root, '.gitignore'), '.env\n');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/build')).worktree).toBe(worktree);
    expect(lstatSync(resolve(worktree, '.env')).isSymbolicLink()).toBe(true);
    expect(readlinkSync(resolve(worktree, '.env'))).toBe(target);
    expect(database(f).prompts).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('merged leaf cleanup removes the worktree and leaves the registered .env untouched', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const target: string = resolve(f.root, '.env');
    writeFileSync(target, 'SYNTHETIC_ONE=1\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    expect(lstatSync(resolve(worktree, '.env')).isSymbolicLink()).toBe(true);
    saveState(path, { ...readState(path), phase: 'merge' });
    expect((await cli(f, ['phase', 'build', 'merged'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(readFileSync(target, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
  } finally {
    f.clean();
  }
}, 15000);

async function allocatedLeaf(f: DispatchFixture, slug: string): Promise<{ path: string; b: string }> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await next(f, [slug])).code).toBe(0);
  const allocated: State = readState(path);
  return { path, b: allocated.pane.B! };
}

function toMerge(path: string, mergeStamp: string, extra: object = {}): State {
  const moved: State = { ...readState(path), phase: 'merge', merge_stamp: mergeStamp, ...extra };
  saveState(path, moved);
  return moved;
}

function mergePrompts(f: DispatchFixture): Database['prompts'] {
  return database(f).prompts.filter((prompt) => prompt.text.startsWith('merge-issue'));
}

function mergeText(path: string): string {
  const state: State = readState(path);
  const batch = state.batch;
  expect(batch).toBeDefined();
  const context: string =
    batch!.solo === true ? `attempt=${batch!.attempt} solo` : `attempt=${batch!.attempt} top=${batch!.top}`;
  return `merge-issue ${state.slug} slot=B phase=merge leaf=${path} ${context}`;
}

test('only the earlier-stamped merge leaf is prompted while the waiting leaf keeps its tab and panes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    const before: State = toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, [])).code).toBe(0);
    expect(database(f).prompts).toEqual([{ pane: aa.b, text: mergeText(aa.path) }]);
    expect(readState(bb.path)).toEqual(before);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['aa', 'bb']);
    for (const paneId of Object.values(before.pane))
      expect(database(f).panes.some((pane) => pane.pane_id === paneId)).toBe(true);
  } finally {
    f.clean();
  }
}, 15000);

test('an ineligible merge leaf never holds the turn (blocked-by)', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z', {});
    toMerge(bb.path, '2026-09-12T00:00:00.000Z', { 'blocked-by': ['cc'] });
    leaf(f, 'cc', 'failed');
    saveDatabase(f, {
      ...database(f),
      prompts: [],
      panes: database(f).panes.map((pane) => ({ ...pane, agent_status: 'idle' })),
    });
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(mergePrompts(f)).toEqual([{ pane: aa.b, text: mergeText(aa.path) }]);
    expect(database(f).prompts).toHaveLength(1);
    expect(readState(bb.path).prompted.B).toBeUndefined();
  } finally {
    f.clean();
  }
}, 15000);

for (const exit of [
  'seat merged',
  'seat check.fix',
  'seat failed',
  'capped prompt failure',
  'operator merged',
] as const) {
  test(`the ${exit} holder exit wakes the next merge leaf without a manual next`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
      const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
      toMerge(aa.path, '2026-09-11T00:00:00.000Z');
      toMerge(bb.path, '2026-09-12T00:00:00.000Z');
      const stalled: { code: string; message: string } = { code: 'agent_prompt_stalled', message: 'stalled' };
      saveDatabase(f, {
        ...database(f),
        prompts: [],
        promptScript: exit === 'capped prompt failure' ? [stalled, stalled, stalled] : [],
      });
      if (exit === 'capped prompt failure') {
        for (let pass = 0; pass < 3; pass++) expect((await next(f, ['--all'])).code).toBe(0);
        expect(readState(aa.path).failure?.cause).toBe('attempts');
        expect(readState(aa.path).failure?.reason).toContain('after 3 passes');
      } else {
        const args: string[] =
          exit === 'seat merged'
            ? ['phase', 'aa', 'merged', '--slot', 'B']
            : exit === 'seat check.fix'
              ? ['phase', 'aa', 'check.fix', '--slot', 'B']
              : exit === 'seat failed'
                ? ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B']
                : ['phase', 'aa', 'merged'];
        expect((await cli(f, args, f.root, f.env)).code).toBe(0);
      }
      expect(readState(aa.path).phase).toBe(
        exit === 'seat check.fix'
          ? 'check.fix'
          : exit === 'seat merged' || exit === 'operator merged'
            ? 'merged'
            : 'failed',
      );
      expect(mergePrompts(f)).toEqual([{ pane: bb.b, text: mergeText(bb.path) }]);
      expect((await next(f, ['--all'])).code).toBe(exit === 'seat failed' || exit === 'capped prompt failure' ? 1 : 0);
      expect(mergePrompts(f).filter((prompt) => prompt.pane === bb.b)).toHaveLength(1);
    } finally {
      f.clean();
    }
  }, 15000);
}

test('a committed merge whose log append fails still wakes the next leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    const log: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(log, '');
    chmodSync(log, 0o444);
    const result: Result = await cli(f, ['phase', 'aa', 'merged', '--slot', 'B'], f.root, f.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('committed');
    expect(result.stderr).toContain('log append failed');
    chmodSync(log, 0o644);
    expect(readState(aa.path).phase).toBe('merged');
    expect(mergePrompts(f)).toEqual([{ pane: bb.b, text: mergeText(bb.path) }]);
  } finally {
    f.clean();
  }
}, 15000);

test('a leaf re-entering merge queues behind the two leaves stamped earlier', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    const cc: { path: string; b: string } = await allocatedLeaf(f, 'cc');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    toMerge(cc.path, '2026-09-13T00:00:00.000Z');
    saveDatabase(f, {
      ...database(f),
      prompts: [],
      panes: database(f).panes.map((pane) => ({ ...pane, agent_status: 'idle' })),
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b]);
    expect((await cli(f, ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B'], f.root, f.env)).code).toBe(0);
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, bb.b]);
    expect((await cli(f, ['phase', 'aa', 'merge'], f.root, f.env)).code).toBe(0);
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, bb.b]);
    const idle: Database = database(f);
    saveDatabase(f, {
      ...idle,
      panes: idle.panes.map((pane) => (pane.pane_id === aa.b ? { ...pane, agent_status: 'idle' } : pane)),
    });
    const bbAttempt: string = z.string().parse(readState(bb.path).batch?.attempt);
    expect(
      (await cli(f, ['phase', 'bb', 'merged', '--slot', 'B', '--check', '--attempt', bbAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'bb', 'merged', '--slot', 'B', '--attempt', bbAttempt], f.root, f.env)).code).toBe(
      0,
    );
    // cc was already carried as a member of bb's batch (recorded while aa sat failed):
    // carried members are not re-prompted (merge-order Q2, brief criterion 12), so the
    // third merge prompt goes to the re-entered aa, which queued behind bb and cc.
    expect(readState(cc.path).phase).toBe('merged');
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, bb.b, aa.b]);
    const aaAttempt: string = z.string().parse(readState(aa.path).batch?.attempt);
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', aaAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', aaAttempt], f.root, f.env)).code).toBe(
      0,
    );
    expect(readState(resolve(f.root, 'issues/closed/issue/aa')).phase).toBe('merged');
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, bb.b, aa.b]);
  } finally {
    f.clean();
  }
}, 15000);

test('a merge seat consumes only one failed delivery attempt per next pass', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string; b: string } = await allocatedLeaf(f, 'holder');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    const stalled: { code: string; message: string } = { code: 'agent_prompt_stalled', message: 'stalled' };
    saveDatabase(f, { ...database(f), prompts: [], promptScript: [stalled, stalled, stalled] });
    for (const attempts of [1, 2]) {
      expect((await next(f, ['--all'])).code).toBe(0);
      expect(readState(holder.path).attempts.B).toBe(attempts);
      expect(readState(holder.path).phase).toBe('merge');
    }
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(holder.path).phase).toBe('failed');
  } finally {
    f.clean();
  }
}, 15000);

test('an idle hook advances past a capped holder after visiting its waiter', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    const cc: { path: string; b: string } = await allocatedLeaf(f, 'cc');
    const order: string[] = readdirSync(resolve(aa.path, '..')).filter((slug) => slug !== 'cc');
    const waiter: { path: string; b: string } = order[0] === 'aa' ? aa : bb;
    const holder: { path: string; b: string } = order[1] === 'aa' ? aa : bb;
    toMerge(waiter.path, '2026-09-12T00:00:00.000Z');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z', { attempts: { A: 0, B: 2 } });
    saveDatabase(f, {
      ...database(f),
      prompts: [],
      promptScript: [{ code: 'agent_prompt_stalled', message: 'stalled' }],
    });
    const pane: string = readState(cc.path).pane.A!;
    const env: NodeJS.ProcessEnv = {
      HERDR_PANE_ID: pane,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: pane, agent_status: 'idle' },
      }),
    };
    expect((await next(f, [], env)).code).toBe(0);
    expect(readState(holder.path).phase).toBe('failed');
    expect(mergePrompts(f)).toEqual([{ pane: waiter.b, text: mergeText(waiter.path) }]);
    expect((await next(f, [], env)).code).toBe(0);
    expect(mergePrompts(f)).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('a saved holder failure wakes the stamped queue when the log is a directory', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    mkdirSync(resolve(f.root, 'issues/log.jsonl'));
    const result: Result = await cli(f, ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B'], f.root, f.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('log append failed');
    expect(readState(aa.path).phase).toBe('failed');
    expect(mergePrompts(f)).toEqual([{ pane: bb.b, text: mergeText(bb.path) }]);
  } finally {
    f.clean();
  }
}, 15000);

test('unstamped merge dispatch uses log order and refuses unreadable history', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    for (const queued of [aa, bb]) saveState(queued.path, { ...readState(queued.path), phase: 'merge' });
    const log: string = resolve(f.root, 'issues/log.jsonl');
    mkdirSync(log);
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).not.toBe(0);
    expect(mergePrompts(f)).toHaveLength(0);
    rmSync(log, { recursive: true });
    const records: string[] = ['bb', 'aa'].map((slug, index) =>
      JSON.stringify({
        ts: `2026-09-1${index + 1}T00:00:00.000Z`,
        repo: 'repo',
        slug,
        from: 'check.review',
        to: 'merge',
        slot: 'B',
        attempts: { A: 0, B: 0 },
        fix_rounds: 0,
        verdict: {},
        head: '',
        diff: '',
        session: null,
      }),
    );
    writeFileSync(log, records.join('\n') + '\n');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(mergePrompts(f)).toEqual([{ pane: bb.b, text: mergeText(bb.path) }]);
  } finally {
    f.clean();
  }
}, 15000);

// blocked-report
test('blocked-report epic folder starts ready and reports dep, input, failed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    leaf(f, 'depblocked', 'plan.synthesis', { 'blocked-by': ['outside'] }, 'epic');
    const inputPath: string = leaf(f, 'inputblocked', 'plan.synthesis', {}, 'epic');
    readinessInput(inputPath, envFoo);
    leaf(f, 'failedleaf', 'failed', {}, 'epic');
    leaf(f, 'outside', 'plan.synthesis', {}, 'other');
    const result: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    expect(result.code).toBe(1);
    expect(
      skips(result)
        .map((s) => s.slug)
        .sort(),
    ).toEqual(['failedleaf', 'inputblocked']);
    expect(waits(result)).toEqual(['waiting: depblocked on outside (plan.synthesis)']);
    expect(skips(result).find((s) => s.slug === 'inputblocked')!.error).toContain('FOO');
    expect(skips(result).find((s) => s.slug === 'failedleaf')!.error).toContain('phase recovery');
    expect(database(f).prompts.map((p) => p.text)).toEqual([
      `plan-issue ready slot=A phase=plan.synthesis leaf=${f.root}/issues/open/epic/ready`,
    ]);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report dep detail labels parked, missing, unreadable and skips merged', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'phased', 'implement', {}, 'deps');
    leaf(f, 'merged-open', 'merged', {}, 'deps');
    const closedSrc: string = leaf(f, 'merged-closed', 'merged', {}, 'tmpmove');
    mkdirSync(resolve(f.root, 'issues/closed/issue'), { recursive: true });
    renameSync(closedSrc, resolve(f.root, 'issues/closed/issue/merged-closed'));
    const parkedDir: string = resolve(f.root, 'issues/parked/myepic/parked-dep');
    mkdirSync(parkedDir, { recursive: true });
    yaml(resolve(parkedDir, 'state.yaml'), {
      slug: 'parked-dep',
      phase: 'plan.synthesis',
      created: '2026-10-08',
      repo: 'repo',
      debate: 'no',
      'blocked-by': [],
    });
    const brokenPath: string = leaf(f, 'unreadable-dep', 'plan.synthesis', {}, 'deps');
    writeFileSync(resolve(brokenPath, 'state.yaml'), 'slug: [');
    leaf(f, 'main', 'plan.synthesis', {
      'blocked-by': ['phased', 'merged-open', 'merged-closed', 'parked-dep', 'missing-dep', 'unreadable-dep'],
    });
    const result: Result = await next(f, ['main']);
    expect(result.code).toBe(1);
    const mainSkip: z.infer<typeof skipSchema> = skips(result).find((s) => s.slug === 'main')!;
    expect(mainSkip.error).toContain('phased');
    expect(mainSkip.error).toContain('(implement)');
    expect(mainSkip.error).toContain('parked-dep');
    expect(mainSkip.error).toContain('(parked)');
    expect(mainSkip.error).toContain('missing-dep');
    expect(mainSkip.error).toContain('(missing)');
    expect(mainSkip.error).toContain('unreadable-dep');
    expect(mainSkip.error).toContain('(unreadable)');
    expect(mainSkip.error).not.toContain('merged-open');
    expect(mainSkip.error).not.toContain('merged-closed');
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report input detail names gaps without values and defers to deps', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'PRESENT=s3cr3t-value-xyz\n');
    const inputPath: string = leaf(f, 'inputblocked', 'plan.synthesis');
    yaml(resolve(inputPath, 'readiness.yaml'), {
      inputs: [
        {
          kind: 'env',
          name: 'FOO',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
        {
          kind: 'file',
          name: 'need.txt',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
        {
          kind: 'env',
          name: 'PRESENT',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
      ],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    leaf(f, 'unmerged2', 'plan.synthesis');
    const bothPath: string = leaf(f, 'bothblocked', 'plan.synthesis', { 'blocked-by': ['unmerged2'] });
    readinessInput(bothPath, {
      kind: 'env',
      name: 'BAR',
      holder: 'repo',
      purpose: 'p',
      consumers: ['x'],
      steps: 's',
      source: 't',
      done: 'd',
    });
    const inputResult: Result = await next(f, ['inputblocked']);
    expect(inputResult.code).toBe(1);
    const inputSkip: z.infer<typeof skipSchema> = skips(inputResult).find((s) => s.slug === 'inputblocked')!;
    expect(inputSkip.error).toContain('env');
    expect(inputSkip.error).toContain('FOO');
    expect(inputSkip.error).toContain('file');
    expect(inputSkip.error).toContain('need.txt');
    expect(inputSkip.error).toContain('repo');
    expect(inputSkip.error).not.toContain('PRESENT');
    expect(inputSkip.error).not.toContain('s3cr3t-value-xyz');
    const bothResult: Result = await next(f, ['bothblocked']);
    expect(bothResult.code).toBe(0);
    expect(waits(bothResult)).toEqual(['waiting: bothblocked on unmerged2 (plan.synthesis)']);
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report a failed dependency stays an error', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'stuck', 'failed');
    leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['stuck'] });
    const result: Result = await next(f, ['dependent']);
    expect(result.code).toBe(1);
    expect(skips(result).find((s) => s.slug === 'dependent')!.error).toContain('stuck (failed)');
    expect(waits(result)).toEqual([]);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report failed and merged share a folder without a merged line', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'failedleaf', 'failed', {}, 'mixed');
    leaf(f, 'mergedleaf', 'merged', {}, 'mixed');
    const result: Result = await next(f, [resolve(f.root, 'issues/open/mixed')]);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    const failedSkip: z.infer<typeof skipSchema> = skips(result)[0];
    expect(failedSkip.slug).toBe('failedleaf');
    expect(failedSkip.error).toContain('failed');
    expect(failedSkip.error).toContain('phase recovery');
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report same line by slug, leaf path, and epic path', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    const blockedPath: string = leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['outside'] }, 'epic');
    leaf(f, 'outside', 'plan.synthesis', {}, 'other');
    const bySlug: Result = await next(f, ['blocked']);
    const byLeafPath: Result = await next(f, [blockedPath]);
    const byEpicPath: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    for (const r of [bySlug, byLeafPath, byEpicPath]) {
      expect(r.code).toBe(0);
      expect(waits(r)).toEqual(['waiting: blocked on outside (plan.synthesis)']);
    }
    expect(database(f).prompts.map((p) => p.text)).toEqual([
      `plan-issue ready slot=A phase=plan.synthesis leaf=${f.root}/issues/open/epic/ready`,
    ]);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report manual forms bare, all inside, all outside match', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis');
    leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['ready'] });
    const bare: Result = await next(f, []);
    const inside: Result = await next(f, ['--all']);
    const outside: Result = await next(f, ['--all'], {}, f.home);
    for (const r of [bare, inside, outside]) {
      expect(r.code).toBe(0);
      expect(waits(r)).toEqual(['waiting: blocked on ready (plan.synthesis)']);
    }
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report manual forms stay manual with pane and event set', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis');
    leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['ready'] });
    const event: string = JSON.stringify({
      event: 'pane_agent_status_changed',
      data: { type: 'pane_agent_status_changed', pane_id: 'p1', agent_status: 'idle' },
    });
    const tPane: Result = await next(f, ['blocked'], { HERDR_PANE_ID: 'operator' });
    const tEvent: Result = await next(f, ['blocked'], { HERDR_PLUGIN_EVENT_JSON: event });
    const aPane: Result = await next(f, ['--all'], { HERDR_PANE_ID: 'operator' });
    const aEvent: Result = await next(f, ['--all'], { HERDR_PLUGIN_EVENT_JSON: event });
    for (const r of [tPane, tEvent, aPane, aEvent]) {
      expect(r.code).toBe(0);
      expect(waits(r)).toEqual(['waiting: blocked on ready (plan.synthesis)']);
    }
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report automatic silence on hook, resume, and merge wake', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const readyPath: string = leaf(f, 'ready', 'plan.synthesis');
    leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['ready'] });
    leaf(f, 'failedleaf', 'failed');
    expect((await next(f, ['ready'])).code).toBe(0);
    const paneA: string = readState(readyPath).pane.A!;
    const hook: Result = await next(f, [], {
      HERDR_PANE_ID: paneA,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: paneA, agent_status: 'idle' },
      }),
    });
    expect(hook.code).toBe(0);
    expect(hook.stderr).toBe('');
    saveState(readyPath, { ...readState(readyPath), 'blocked-by': ['ghost'] });
    const resumed: Result = await next(f, ['--resume'], {}, f.home);
    expect(resumed.code).toBe(0);
    expect(resumed.stderr).toBe('');
    leaf(f, 'mover', 'plan.synthesis');
    const phased: Result = await cli(f, ['phase', 'mover', 'implement'], f.root, f.env);
    expect(phased.code).toBe(0);
    expect(phased.stderr).not.toContain('blocked');
    expect(phased.stderr).not.toContain('failedleaf');
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report dependent not picked when started by completion', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'first', 'merged', {}, 'first-issue');
    leaf(f, 'other', 'plan.synthesis', {}, 'other-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first', 'other'] }, 'second-issue');
    const result: Result = await next(f, ['first']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(readState(second).tab).toBeUndefined();
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report real errors still report on automatic paths', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const healthyPath: string = leaf(f, 'healthy', 'plan.synthesis');
    expect((await next(f, ['healthy'])).code).toBe(1);
    const paneA: string = readState(healthyPath).pane.A!;
    const hook: Result = await next(f, [], {
      HERDR_PANE_ID: paneA,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'pane_agent_status_changed',
        data: { type: 'pane_agent_status_changed', pane_id: paneA, agent_status: 'idle' },
      }),
    });
    expect(hook.code).toBe(1);
    expect(hook.stderr).toContain(malformed);
    const resumed: Result = await next(f, ['--resume'], {}, f.home);
    expect(resumed.code).toBe(1);
    expect(resumed.stderr).toContain(malformed);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report no line for capacity waits', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'first', 'plan.synthesis');
    leaf(f, 'second', 'plan.synthesis');
    configure(f, { max_active: 1 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(database(f).tabs).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report no line for merge turn waits', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, {
      ...database(f),
      prompts: [],
      panes: database(f).panes.map((p) => ({ ...p, agent_status: 'idle' })),
    });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(mergePrompts(f)).toEqual([{ pane: aa.b, text: mergeText(aa.path) }]);
  } finally {
    f.clean();
  }
}, 15000);

test('blocked-report no line for busy seats', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const busyPath: string = leaf(f, 'busy', 'plan.synthesis', {}, 'epic');
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    expect((await next(f, ['busy'])).code).toBe(0);
    const paneA: string = readState(busyPath).pane.A!;
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: db.panes.map((p) => (p.pane_id === paneA ? { ...p, agent_status: 'blocked' } : p)),
    });
    const promptsBefore: number = database(f).prompts.length;
    const result: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(database(f).prompts).toHaveLength(promptsBefore + 1);
    expect(database(f).prompts.at(-1)!.text).toContain('ready');
  } finally {
    f.clean();
  }
}, 15000);
function dispatchedSlugs(f: DispatchFixture): string[] {
  return database(f)
    .prompts.map((prompt) => prompt.text.split(' ')[1])
    .sort();
}

async function namedTargetRepo(): Promise<DispatchFixture> {
  const f: DispatchFixture = await dispatchFixture();
  configure(f, { max_active: 8 });
  leaf(f, 'e1-l1', 'plan.synthesis', {}, 'epic-e/n1');
  leaf(f, 'e1-l2', 'plan.synthesis', {}, 'epic-e/n1');
  leaf(f, 'e2-l1', 'plan.synthesis', {}, 'epic-e/n2');
  leaf(f, 't-l1', 'plan.synthesis', {}, 'top-t');
  leaf(f, 't-l2', 'plan.synthesis', {}, 'top-t');
  leaf(f, 'side', 'plan.synthesis', {}, 'side-issue');
  mkdirSync(resolve(f.root, 'sub'));
  return f;
}

function stateSnapshot(paths: string[]): string[] {
  return paths.map((path) => readFileSync(resolve(path, 'state.yaml'), 'utf8'));
}

function expectNoLaunch(f: DispatchFixture, paths: string[], before: string[]): void {
  expect(paths.map((path) => readFileSync(resolve(path, 'state.yaml'), 'utf8'))).toEqual(before);
  expect(calls(f)).toEqual([]);
  expect(existsSync(resolve(f.root, 'issues/worktrees'))).toBe(false);
  expect(existsSync(resolve(f.home, '.lock'))).toBe(false);
  expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
}

test('named target equivalence: owner name matches folder path from root, subfolder and worktree', async () => {
  const owners: { name: string; path: string; slugs: string[] }[] = [
    { name: 'epic-e', path: 'issues/open/epic-e', slugs: ['e1-l1', 'e1-l2', 'e2-l1'] },
    { name: 'n1', path: 'issues/open/epic-e/n1', slugs: ['e1-l1', 'e1-l2'] },
    { name: 'top-t', path: 'issues/open/top-t', slugs: ['t-l1', 't-l2'] },
  ];
  for (const owner of owners) {
    for (const cwd of ['root', 'sub', 'worktree'] as const) {
      const named: DispatchFixture = await namedTargetRepo();
      const pathed: DispatchFixture = await namedTargetRepo();
      try {
        let from: string = named.root;
        if (cwd === 'sub') from = resolve(named.root, 'sub');
        if (cwd === 'worktree') {
          const side: string = resolve(named.root, 'issues/open/side-issue/side');
          expect((await next(named, ['side'])).code).toBe(0);
          from = readState(side).worktree!;
          saveDatabase(named, { ...database(named), prompts: [] });
        }
        const byName: Result = await next(named, [owner.name], {}, from);
        const byPath: Result = await next(pathed, [owner.path]);
        expect(byName.code).toBe(0);
        expect(byPath.code).toBe(0);
        expect(dispatchedSlugs(named)).toEqual(owner.slugs);
        expect(dispatchedSlugs(pathed)).toEqual(owner.slugs);
        expect(dispatchedSlugs(named)).toEqual(dispatchedSlugs(pathed));
      } finally {
        named.clean();
        pathed.clean();
      }
    }
  }
}, 60000);

test('leaf slug selection keeps open and closed behavior', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'staying', 'plan.synthesis');
    expect((await next(f, ['staying'])).code).toBe(0);
    expect(dispatchedSlugs(f)).toEqual(['staying']);
  } finally {
    f.clean();
  }
  const g: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(g, 'moved', 'plan.synthesis');
    const closed: string = resolve(g.root, 'issues/closed/issue');
    mkdirSync(closed, { recursive: true });
    renameSync(path, resolve(closed, 'moved'));
    expect((await next(g, ['moved'])).code).toBe(0);
    expect(dispatchedSlugs(g)).toEqual(['moved']);
  } finally {
    g.clean();
  }
});

test('existing folder shadows a same-named owner or leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    configure(f, { max_active: 8 });
    leaf(f, 'a1', 'plan.synthesis', {}, 'epic-a/dup');
    leaf(f, 'b1', 'plan.synthesis', {}, 'epic-b/dup');
    const result: Result = await next(f, ['dup'], {}, resolve(f.root, 'issues/open/epic-a'));
    expect(result.code).toBe(0);
    expect(dispatchedSlugs(f)).toEqual(['a1']);
  } finally {
    f.clean();
  }
  const g: DispatchFixture = await dispatchFixture();
  try {
    leaf(g, 'ghost', 'plan.synthesis');
    mkdirSync(resolve(g.root, 'sub/ghost'), { recursive: true });
    const result: Result = await next(g, ['ghost'], {}, resolve(g.root, 'sub'));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('No leaves match');
    expect(database(g).prompts).toHaveLength(0);
    expect(calls(g)).toEqual([]);
  } finally {
    g.clean();
  }
});

test('ambiguous name refuses two same-name issues under different epics', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'a1', 'plan.synthesis', {}, 'ep-a/dup');
    const b: string = leaf(f, 'b1', 'plan.synthesis', {}, 'ep-b/dup');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['dup']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/ep-a/dup');
    expect(result.stderr).toContain('issue issues/open/ep-b/dup');
    expectNoLaunch(f, [a, b], before);
  } finally {
    f.clean();
  }
});

test('ambiguous name refuses an epic and its same-name issue', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'l1', 'plan.synthesis', {}, 'same/same');
    const b: string = leaf(f, 'l2', 'plan.synthesis', {}, 'same/other');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['same']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('epic issues/open/same');
    expect(result.stderr).toContain('issue issues/open/same/same');
    expectNoLaunch(f, [a, b], before);
  } finally {
    f.clean();
  }
});

test('ambiguous name refuses an issue and its same-name leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'exp', 'plan.synthesis', {}, 'exp');
    const before: string[] = stateSnapshot([a]);
    const result: Result = await next(f, ['exp']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/exp');
    expect(result.stderr).toContain('leaf issues/open/exp/exp');
    expectNoLaunch(f, [a], before);
  } finally {
    f.clean();
  }
});

test('ambiguous name refuses an owner and an unrelated leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'l1', 'plan.synthesis', {}, 'own');
    const b: string = leaf(f, 'own', 'plan.synthesis', {}, 'misc');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['own']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/own');
    expect(result.stderr).toContain('leaf issues/open/misc/own');
    expectNoLaunch(f, [a, b], before);
  } finally {
    f.clean();
  }
});

test('closed owner name does not block an open same-name owner', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    configure(f, { max_active: 8 });
    leaf(f, 'c1', 'plan.synthesis', {}, 'old');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/old'), resolve(f.root, 'issues/closed/old'));
    leaf(f, 'o1', 'plan.synthesis', {}, 'old');
    const byName: Result = await next(f, ['old']);
    expect(byName.code).toBe(0);
    expect(dispatchedSlugs(f)).toEqual(['o1']);
    const promptsBefore: number = database(f).prompts.length;
    const byPath: Result = await next(f, ['issues/closed/old']);
    expect(byPath.code).toBe(0);
    expect(database(f).prompts.length).toBe(promptsBefore + 1);
    expect(database(f).prompts.at(-1)!.text.split(' ')[1]).toBe('c1');
  } finally {
    f.clean();
  }
});

test('empty folder and unknown names give the missing-leaf message', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    mkdirSync(resolve(f.root, 'issues/open/emptybox'), { recursive: true });
    const parked: string = resolve(f.root, 'issues/parked/issue/rest');
    mkdirSync(parked, { recursive: true });
    writeFileSync(resolve(parked, 'state.yaml'), 'slug: [');
    const cases: [string, string][] = [
      ['emptybox', 'Missing leaf: emptybox'],
      ['nope', 'Missing leaf: nope'],
      ['rest', 'Missing leaf: rest (parked)'],
    ];
    for (const [input, message] of cases) {
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(message);
    }
    expect(calls(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('unreadable leaf under a named issue reports its read error', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'b1', 'plan.synthesis', {}, 'brok');
    writeFileSync(resolve(path, 'state.yaml'), 'slug: [');
    const result: Result = await next(f, ['brok']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(path);
    expect(result.stderr).not.toContain('Missing leaf: brok');
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
});

test('owners resolve without ISSUE.md or EPIC.md', async () => {
  const cases: [string, string[]][] = [
    ['ei', ['x1', 'y1']],
    ['ni', ['x1']],
  ];
  for (const [input, slugs] of cases) {
    const f: DispatchFixture = await dispatchFixture();
    try {
      configure(f, { max_active: 8 });
      leaf(f, 'x1', 'plan.synthesis', {}, 'ei/ni');
      leaf(f, 'y1', 'plan.synthesis', {}, 'ei/mi');
      expect(existsSync(resolve(f.root, 'issues/open/ei/ISSUE.md'))).toBe(false);
      expect(existsSync(resolve(f.root, 'issues/open/ei/EPIC.md'))).toBe(false);
      expect(existsSync(resolve(f.root, 'issues/open/ei/ni/ISSUE.md'))).toBe(false);
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(0);
      expect(dispatchedSlugs(f)).toEqual(slugs);
    } finally {
      f.clean();
    }
  }
});

const selfUpdateMock: string = `import { mock } from 'bun:test';
import { appendFileSync } from 'node:fs';
mock.module(SELF_UPDATE_MODULE, () => ({
  selfUpdate: async (repo: { root: string }) => {
    if (process.env.SELF_UPDATE_THROW === '1') throw new Error('self-update sentinel');
    appendFileSync(process.env.FAKE_HERDR + '.calls', JSON.stringify(['self-update', repo.root]) + '\\n');
    appendFileSync(process.env.SELF_UPDATE_LOG, repo.root + '\\n');
  },
}));
await import(ENTRY);
`;

async function selfUpdateCli(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  const script: string = resolve(f.home, 'wired-self-update.ts');
  writeFileSync(
    script,
    selfUpdateMock
      .replace('SELF_UPDATE_MODULE', JSON.stringify(resolve(import.meta.dir, '../src/self-update.ts')))
      .replace('ENTRY', JSON.stringify(entry)),
  );
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, script, ...args], {
    cwd,
    env: {
      ...process.env,
      ...f.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      SELF_UPDATE_LOG: f.db + '.self-update',
      ...env,
    },
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}

function selfUpdateCalls(f: DispatchFixture): string[] {
  const path: string = f.db + '.self-update';
  return existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n') : [];
}

test('phase merged records one self-update call for the repo', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'landed', 'merge');
    const result: Result = await selfUpdateCli(f, ['phase', 'landed', 'merged']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('moved merged');
    expect(selfUpdateCalls(f)).toEqual([f.root]);
  } finally {
    f.clean();
  }
});

test('phase failed commits without a self-update call', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'landed', 'merge');
    const result: Result = await selfUpdateCli(f, ['phase', 'landed', 'failed', '--reason', 'merge broke']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('moved failed');
    expect(selfUpdateCalls(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a throwing self-update still lets phase merged commit and next dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'landed', 'merge');
    leaf(f, 'queued', 'plan.synthesis', {}, 'other-issue');
    const env: NodeJS.ProcessEnv = { SELF_UPDATE_THROW: '1' };
    const merged: Result = await selfUpdateCli(f, ['phase', 'landed', 'merged'], env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).toContain('moved merged');
    const dispatched: Result = await selfUpdateCli(f, ['next', 'queued'], env);
    expect(dispatched.code).toBe(0);
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue queued slot=A phase=plan.synthesis leaf=${resolve(f.root, 'issues/open/other-issue/queued')}`,
    ]);
  } finally {
    f.clean();
  }
});

test('next --all, --resume and manual next record the registered or selected repos before dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    configure(f, { repos: { repo: f.root, other: g.root } });
    const picked: string = leaf(f, 'picked', 'plan.synthesis');
    leaf(f, 'sweep', 'implement', {}, 'other-issue');
    const before: number = calls(f).length;
    expect((await selfUpdateCli(f, ['next', '--all'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root]);
    expect(calls(f).slice(before)[0]).toEqual(['self-update', f.root]);
    expect(calls(f).slice(before)[1]).toEqual(['self-update', g.root]);
    expect(calls(f).slice(before).some((args) => args[0] === 'tab' || args[0] === 'agent')).toBe(true);
    resetPrompts(f, picked);
    const resumed: number = calls(f).length;
    expect((await selfUpdateCli(f, ['next', '--resume'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root, f.root, g.root]);
    expect(calls(f).slice(resumed)[0]).toEqual(['self-update', f.root]);
    expect(calls(f).slice(resumed).some((args) => args[0] === 'agent' && args[1] === 'prompt')).toBe(true);
    resetPrompts(f, picked);
    const manual: number = calls(f).length;
    expect((await selfUpdateCli(f, ['next', 'picked'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root, f.root, g.root, f.root]);
    expect(calls(f).slice(manual)[0]).toEqual(['self-update', f.root]);
    expect(calls(f).slice(manual).some((args) => args[0] === 'agent' && args[1] === 'prompt')).toBe(true);
    const tabbed: number = calls(f).length;
    const closed: Result = await selfUpdateCli(f, ['next'], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: 'w1:t999', workspace_id: 'w1' },
      }),
    });
    expect(closed.code).toBe(0);
    expect(selfUpdateCalls(f)).toHaveLength(5);
    expect(calls(f)).toHaveLength(tabbed);
  } finally {
    f.clean();
    g.clean();
  }
});
