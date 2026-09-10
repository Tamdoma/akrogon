import { test, expect } from 'bun:test';
import { mkdirSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, yaml, type Fixture } from './helpers';
import { readState, saveState } from '../src/state';
import { command, type Result } from '../src/shell';
import type { Database } from './fake-herdr';

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
function database(f: DispatchFixture): Database { return JSON.parse(readFileSync(f.db, 'utf8')) as Database; }
function saveDatabase(f: DispatchFixture, db: Database): void { writeFileSync(f.db, JSON.stringify(db)); }
async function next(f: DispatchFixture, args: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> { return cli(f, ['next', ...args], f.root, { ...f.env, ...env }); }

test('next creates one worktree/tab under concurrent hooks, prompts configured B, ignores working events and resolves hook cwd', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const results: Result[] = await Promise.all([next(f, ['build']), next(f, ['build'])]);
    expect(results.map(r => r.code)).toEqual([0, 0]);
    const db: Database = database(f);
    expect(db.tabs).toHaveLength(1); expect(db.panes).toHaveLength(2); expect(db.prompts).toHaveLength(1);
    expect(db.prompts[0].text).toBe('plan-issue build slot=B phase=plan.synthesis');
    console.log(db.prompts[0].text);
    expect(db.starts[0]).toContain('strong-b');
    expect(readState(path).attempts.B).toBe(1);
    const b: string = readState(path).pane.B!;
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(readState(path).attempts.B).toBe(1);
    expect(await command(['git', 'branch', '--show-current'], readState(path).worktree)).toBe('build');
  } finally { f.clean(); }
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
    expect(db.tabs).toHaveLength(1); expect(db.prompts).toHaveLength(3);
    expect(db.prompts[0].pane).toBe(db.prompts[1].pane);
    expect(db.prompts[2].pane).not.toBe(db.prompts[0].pane);
    expect(db.prompts.every(p => p.text.includes('slot=B'))).toBe(true);
    expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toContain('"to":"failed"');
  } finally { f.clean(); }
}, 15000);

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
    saveDatabase(f, { ...db, panes: db.panes.map(p => p.pane_id === readState(first).pane.B ? { ...p, agent_status: 'unknown' } : p) });
    expect((await next(f, ['first'])).code).toBe(0);
    expect(database(f).prompts.at(-1)?.pane).toBe(readState(first).pane.A);
    expect(database(f).prompts.at(-1)?.text).toContain('slot=B');
  } finally { f.clean(); }
}, 15000);

test('merged phase leaves tab intact, next closes it and starts dependent from a closed-folder hook', async () => {
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
    saveDatabase(f, { ...db, panes: db.panes.map(p => ({ ...p, agent_status: 'idle' })) });
    expect((await next(f, [], { HERDR_PANE_ID: b })).code).toBe(0);
    expect(database(f).tabs).toHaveLength(1);
    expect(database(f).tabs[0].label).toBe('second');
    expect(readState(dependent).attempts.B).toBe(1);
  } finally { f.clean(); }
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
    expect(results.every(result => result.code === 0)).toBe(true);
    expect(database(f).tabs).toHaveLength(1);
    const states = [readState(resolve(f.root, 'issues/open/issue/first')), readState(second)];
    expect(states.filter(state => state.worktree !== undefined)).toHaveLength(1);
  } finally { f.clean(); g.clean(); }
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
    saveState(path, { ...readState(path), phase: 'merge' });
    const db: Database = database(f);
    saveDatabase(f, { ...db, panes: db.panes.map(p => ({ ...p, agent_status: 'idle' })) });
    const recovered: Result = await next(f, ['landed']);
    expect(recovered.code).toBe(0);
    expect(recovered.stdout).toContain('issue complete landing');
    expect(readState(resolve(f.root, 'issues/closed/landing/landed')).phase).toBe('merged');
    expect(database(f).tabs).toHaveLength(0);
  } finally { f.clean(); }
}, 15000);
