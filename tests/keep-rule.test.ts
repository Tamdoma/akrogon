import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, fakeHerdr, storeDir, type Fixture } from './helpers';
import { readState, saveState } from '../src/state';
import { command, type Result } from '../src/shell';
import { z } from 'zod';
import type { Database } from './fake-herdr';

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
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
async function status(f: DispatchFixture, slug: string): Promise<Result> {
  return cli(f, ['status', slug], f.root, f.env);
}
function closeTab(f: DispatchFixture, tab: string): void {
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    tabs: db.tabs.filter((item) => item.tab_id !== tab),
    panes: db.panes.filter((pane) => pane.tab_id !== tab),
  });
}
async function dispatchLeaf(f: DispatchFixture, slug: string, extra: object = {}): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis', extra);
  expect((await next(f, [slug])).code).toBe(0);
  return path;
}
function report(f: DispatchFixture): { kept: { path: string; reason: string }[]; removed: unknown[] } {
  return z
    .object({
      kept: z.array(z.object({ path: z.string(), reason: z.string() })),
      removed: z.array(z.unknown()),
    })
    .parse(JSON.parse(readFileSync(resolve(f.home, 'reconcile/repo.json'), 'utf8')));
}

// DC1: a registered worktree named neither a leaf slug nor a scratch kind stays
// through a sweep pass and through a tab_closed pass, listed as unmanaged.
test('registered worktrees that are no leaf or scratch kind stay through both pass kinds', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'keeper');
    const manual: string = resolve(storeDir(f), 'manual-copy');
    const legacy: string = resolve(f.root, 'issues/worktrees/legacy-copy');
    mkdirSync(resolve(f.root, 'issues/worktrees'), { recursive: true });
    await command(['git', 'worktree', 'add', '--detach', manual], f.root);
    await command(['git', 'worktree', 'add', '--detach', legacy], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(manual)).toBe(true);
    expect(existsSync(legacy)).toBe(true);
    const out: Result = await status(f, 'keeper');
    expect(out.stdout).toContain(`Kept: ${manual} — unmanaged worktree`);
    expect(out.stdout).toContain(`Kept: ${legacy} — unmanaged worktree`);
    const leftovers: Result = await cli(f, ['leftovers'], f.root, f.env);
    expect(leftovers.stdout).toContain('unmanaged worktree');
    expect(leftovers.stdout).toContain('manual-copy');
    expect(leftovers.stdout).toContain('legacy-copy');
    // The tab_closed hook runs reconcile on the owner's repo; unmanaged names stay.
    const tab: string = readState(path).tab!;
    closeTab(f, tab);
    const closed: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: tab, workspace_id: 'w1' },
      }),
      HERDR_SOCKET_PATH: `${f.db}-default.sock`,
    });
    expect(closed.code).toBe(0);
    expect(existsSync(manual)).toBe(true);
    expect(existsSync(legacy)).toBe(true);
    expect((await status(f, 'keeper')).stdout).toContain(`Kept: ${manual} — unmanaged worktree`);
  } finally {
    f.clean();
  }
});

// DC2: a git lock wins over every name — a non-kind name, the scratch kinds,
// a merged leaf's worker copy and the merged leaf's own worktree all stay,
// each reported with its lock reason; unlocked scratch kinds are swept again.
test('locked worktrees stay whatever their name and report the lock reason', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'keep-holder');
    const path: string = await dispatchLeaf(f, 'merged-keeper');
    const lockedOwn: string = readState(path).worktree!;
    const worker: string = resolve(storeDir(f), 'merged-keeper-u1');
    const verify: string = resolve(storeDir(f), 'verify-unrecorded');
    const batch: string = resolve(storeDir(f), 'batch-unrecorded');
    const nonKind: string = resolve(storeDir(f), 'keep-holder-x');
    for (const wt of [worker, verify, batch, nonKind])
      await command(['git', 'worktree', 'add', '--detach', wt], f.root);
    await command(['git', 'worktree', 'lock', '--reason', 'held worker', worker], f.root);
    await command(['git', 'worktree', 'lock', '--reason', 'held run', verify], f.root);
    await command(['git', 'worktree', 'lock', '--reason', 'held batch', batch], f.root);
    await command(['git', 'worktree', 'lock', '--reason', 'held copy', nonKind], f.root);
    await command(['git', 'worktree', 'lock', '--reason', 'held leaf', lockedOwn], f.root);
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    for (const wt of [worker, verify, batch, nonKind, lockedOwn]) expect(existsSync(wt)).toBe(true);
    const out: Result = await status(f, 'merged-keeper');
    expect(out.stdout).toContain(`${worker} — locked worktree (held worker)`);
    expect(out.stdout).toContain(`${verify} — locked worktree (held run)`);
    expect(out.stdout).toContain(`${batch} — locked worktree (held batch)`);
    expect(out.stdout).toContain(`${nonKind} — locked worktree (held copy)`);
    expect(out.stdout).toContain(`${lockedOwn} — locked worktree (held leaf)`);
    const leftovers: Result = await cli(f, ['leftovers'], f.root, f.env);
    for (const reason of ['held worker', 'held run', 'held batch', 'held copy', 'held leaf'])
      expect(leftovers.stdout).toContain(reason);
    for (const wt of [worker, verify, batch]) await command(['git', 'worktree', 'unlock', wt], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    for (const wt of [worker, verify, batch]) expect(existsSync(wt)).toBe(false);
    expect(existsSync(lockedOwn)).toBe(true);
    expect(existsSync(nonKind)).toBe(true);
  } finally {
    f.clean();
  }
});

// DC4: each pass records every registered worktree it removed with path,
// branch, head and rule; a pass that removed none writes an empty list, and a
// report written before `removed` existed still reads.
test('the reconcile report records removed worktrees and still reads pre-change reports', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'report-leaf');
    const worktree: string = readState(path).worktree!;
    const head: string = await command(['git', '-C', worktree, 'rev-parse', 'HEAD'], f.root);
    const ended: string = resolve(storeDir(f), 'verify-ended');
    await command(['git', 'worktree', 'add', '--detach', ended], f.root);
    const endedHead: string = await command(['git', '-C', ended, 'rev-parse', 'HEAD'], f.root);
    writeFileSync(
      resolve(f.root, 'issues/verify-runs.jsonl'),
      JSON.stringify({
        run: 'ended',
        repo: 'repo',
        leaf: 'report-leaf',
        sha: 'x',
        tree: 'x',
        scope: 'leaf',
        path: ended,
        pid: 1,
        boot_id: 'b',
        commands: [],
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      }) + '\n',
    );
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(existsSync(ended)).toBe(false);
    const rows: unknown[] = report(f).removed;
    expect(rows).toContainEqual({ path: worktree, branch: 'report-leaf', head, rule: 'merged leaf' });
    expect(rows).toContainEqual({ path: ended, head: endedHead, rule: 'ended verify' });
    // A pass that removes no registered worktree writes an empty list.
    leaf(f, 'calm-leaf', 'plan.synthesis', {}, 'calm-issue');
    expect((await next(f, ['calm-leaf'])).code).toBe(0);
    const calmRows: unknown[] = report(f).removed;
    expect(calmRows).toEqual([]);
    // A report written before `removed` existed still reads its kept entries.
    const file: string = resolve(f.home, 'reconcile/repo.json');
    writeFileSync(file, JSON.stringify({ kept: [{ path: '/pre-change', reason: 'old report' }] }) + '\n');
    const out: Result = await status(f, 'calm-leaf');
    expect(out.stdout).toContain('Kept: /pre-change — old report');
  } finally {
    f.clean();
  }
});
