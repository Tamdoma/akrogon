import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, yaml, fakeGh, type GhFixture, type Fixture } from './helpers';
import { readState, saveState } from '../src/state';
import { command, run, type Result } from '../src/shell';
import type { GhStep } from './fake-gh';
import type { Database } from './fake-herdr';
import { z } from 'zod';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0, prompts: [], starts: [] }));
  return { ...f, db, env: { PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db } };
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
async function next(f: DispatchFixture, args: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['next', ...args], f.root, { ...f.env, ...env });
}

test('next creates one worktree/tab under concurrent hooks, prompts configured B, ignores working events and resolves hook cwd', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const results: Result[] = await Promise.all([next(f, ['build']), next(f, ['build'])]);
    expect(results.map((r) => r.code)).toEqual([0, 0]);
    const db: Database = database(f);
    expect(db.tabs).toHaveLength(1);
    expect(db.panes).toHaveLength(2);
    expect(db.prompts).toHaveLength(1);
    expect(db.prompts[0].text).toBe('plan-issue build slot=B phase=plan.synthesis');
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

test('next resumes interrupted tab creation, retries same slot twice then peer once and fails', async () => {
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
    expect(db.prompts[2].pane).not.toBe(db.prompts[0].pane);
    expect(db.prompts.every((p) => p.text.includes('slot=B'))).toBe(true);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"failed"');
    const state: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    const before: number = calls(f).length;
    expect((await next(f, ['retry'])).code).toBe(0);
    const notified: string[][] = calls(f).slice(before);
    expect(notified).toHaveLength(1);
    expect(notified[0].slice(0, 2)).toEqual(['notification', 'show']);
    expect(notified[0][2]).toContain('repo');
    expect(notified[0][2]).toContain('retry');
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(state);
  } finally {
    f.clean();
  }
}, 15000);

test('next notifies failed leaves without dispatch or state changes and exposes notification failures', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'broken', 'failed');
    const state: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    const notified: Result = await next(f, ['broken']);
    expect(notified.code).toBe(0);
    expect(calls(f)).toHaveLength(1);
    expect(calls(f)[0].slice(0, 2)).toEqual(['notification', 'show']);
    expect(calls(f)[0][2]).toContain('repo');
    expect(calls(f)[0][2]).toContain('broken');
    expect(database(f).prompts).toHaveLength(0);
    expect(database(f).starts).toHaveLength(0);
    expect(database(f).tabs).toHaveLength(0);
    expect(database(f).panes).toHaveLength(0);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(state);
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    saveDatabase(f, { ...database(f), failNotification: true });
    const failed: Result = await next(f, ['broken']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('fixture_notification_failed');
    expect(failed.stderr).toContain('notification');
    expect(failed.stderr).toContain('broken');
    expect(calls(f)).toEqual([calls(f)[0], calls(f)[0]]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(state);
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('next refuses hand-built and dependencies, respects capacity, and sends unknown panes to idle peers', async () => {
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
    expect((await next(f, ['first'])).code).toBe(0);
    expect(database(f).prompts.at(-1)?.pane).toBe(readState(first).pane.A);
    expect(database(f).prompts.at(-1)?.text).toContain('slot=B');
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
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['first', 'second']);
    expect(readState(dependent).attempts.B).toBe(1);
  } finally {
    f.clean();
  }
}, 15000);

test('merged phase leaves tab intact, a hook starts the dependent and only the startup sweep closes it', async () => {
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
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['first', 'second']);
    expect(readState(dependent).attempts.B).toBe(1);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['second']);
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
      closed: resolve(f.root, 'issues/closed/landing'),
      lock: resolve(f.root, 'issues/closed/landing/.lock'),
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
    const recovered: Result = await next(f, ['landed']);
    expect(recovered.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(2);
    expect(recovered.stdout).toContain('issue complete landing');
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
    expect(database(f).prompts.at(-1)?.text).toBe('plan-issue exited slot=A phase=plan.positions');
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

test('uncommitted work in a merge worktree is never recovered as merged', async () => {
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
    const result: Result = await next(f, ['dirty']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Uncommitted work');
    expect(readState(path).phase).toBe('merge');
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
    for (const seat of ['A', 'B'] as const) {
      saveState(path, { ...readState(path), phase: 'merge', attempts: { A: seat === 'A' ? 1 : 3, B: 0 } });
      const db: Database = database(f);
      saveDatabase(f, {
        ...db,
        panes: db.panes.map((p) => ({
          ...p,
          agent: 'fake',
          agent_status: p.pane_id === readState(path).pane[seat] ? 'working' : 'idle',
        })),
      });
      expect((await next(f, ['--all'])).code).toBe(0);
      expect(readState(path).phase).toBe('merge');
    }
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
    expect((await next(f, ['--all'])).code).toBe(0);
    const db: Database = database(f);
    expect(db.starts).toHaveLength(2);
    expect(new Set(db.starts.map((args) => args[2])).size).toBe(2);
    expect(db.starts.every((args) => /^[a-z][a-z0-9_-]{0,31}$/.test(args[2]))).toBe(true);
    expect(db.tabs.map((tab) => tab.label)).toEqual([slug, slug]);
    expect(db.prompts.every((prompt) => prompt.text === `plan-issue ${slug} slot=B phase=plan.synthesis`)).toBe(true);
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
    const probe: NonNullable<GhStep['probe']> = { closed, lock: resolve(closed, '.lock'), worktree };
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
