import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fixture, cli, leaf, fakeHerdr, leafTempRoot, storeDir, type Fixture } from './helpers';
import { readState, saveState } from '../src/state';
import { command, run, type Result } from '../src/shell';
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
async function status(f: DispatchFixture): Promise<Result> {
  return cli(f, ['status'], f.home, f.env);
}
function branchExists(f: DispatchFixture, name: string): Promise<Result> {
  return run(['git', 'show-ref', '--verify', '--quiet', `refs/heads/${name}`], f.root);
}
function worktreeList(f: DispatchFixture): Promise<string> {
  return command(['git', 'worktree', 'list', '--porcelain'], f.root);
}
function scratchFor(f: DispatchFixture, slug: string): string {
  const create: string[] | undefined = calls(f).find(
    (args) => args[0] === 'tab' && args[1] === 'create' && args.includes(slug),
  );
  expect(create).toBeDefined();
  const found: string[] = [];
  for (let i = 0; i + 1 < create!.length; i++)
    if (create![i] === '--env' && create![i + 1].startsWith('TMPDIR='))
      found.push(create![i + 1].slice('TMPDIR='.length));
  expect(found).toHaveLength(1);
  return found[0];
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
function closeTab(f: DispatchFixture, tab: string): void {
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    tabs: db.tabs.filter((item) => item.tab_id !== tab),
    panes: db.panes.filter((pane) => pane.tab_id !== tab),
  });
}
async function dispatchLeaf(f: DispatchFixture, slug: string, extra: object = {}, container?: string): Promise<string> {
  const path: string =
    container === undefined
      ? leaf(f, slug, 'plan.synthesis', extra)
      : leaf(f, slug, 'plan.synthesis', extra, container);
  expect((await next(f, [slug])).code).toBe(0);
  return path;
}

// DC1: merged leaf, clean worktree, reachable head → worktree removed, branch -d.
// Covered by next.test.ts ("bare next …", "typed next …"). Failed variant here:
test('failed leaf worktree is removed and its branch is kept', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'gone-leaf');
    const worktree: string = readState(path).worktree!;
    closeTab(f, readState(path).tab!);
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'test' },
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(await worktreeList(f)).not.toContain(worktree);
    expect((await branchExists(f, 'gone-leaf')).code).toBe(0);
  } finally {
    f.clean();
  }
});

// DC2: kept worktrees reported in `akrogon status` with path and reason.
test('dirty merged worktree is kept and reported with path and reason', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'dirty-leaf');
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'untracked'), 'dirty');
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toContain('uncommitted');
    expect((await branchExists(f, 'dirty-leaf')).code).toBe(0);
  } finally {
    f.clean();
  }
});

test('mid-rebase worktree is kept and reported', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'rebase-leaf');
    const worktree: string = readState(path).worktree!;
    const marker: string = await command(['git', '-C', worktree, 'rev-parse', '--git-path', 'rebase-merge'], f.root);
    mkdirSync(resolve(worktree, marker), { recursive: true });
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toContain('rebase');
  } finally {
    f.clean();
  }
});

test('worktree with unreachable commits is kept and reported with a count', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'lost-leaf');
    const worktree: string = readState(path).worktree!;
    await command(['git', '-C', worktree, 'checkout', '--detach'], f.root);
    writeFileSync(resolve(worktree, 'unreach'), 'x');
    await command(['git', '-C', worktree, 'add', 'unreach'], f.root);
    await command(['git', '-C', worktree, 'commit', '-m', 'unreachable'], f.root);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toMatch(/1 unreachable commit/);
  } finally {
    f.clean();
  }
});

test('worktree with a live pane inside is kept and reported', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'pane-leaf');
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merged' });
    // The dispatch tab is closed but another pane sits inside the worktree.
    const db: Database = database(f);
    const tab: string = readState(path).tab!;
    saveDatabase(f, {
      ...db,
      tabs: db.tabs.filter((item) => item.tab_id !== tab),
      panes: db.panes.map((pane) => (pane.tab_id === tab ? { ...pane, cwd: resolve(worktree, 'subdir') } : pane)),
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toContain('live pane');
  } finally {
    f.clean();
  }
});

test('an unknown directory inside the store is reported, never removed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'seed-leaf');
    const stray: string = resolve(storeDir(f), 'not-a-leaf');
    mkdirSync(stray, { recursive: true });
    writeFileSync(resolve(stray, 'file'), 'x');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(stray)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(stray);
    expect(out.stdout).toContain('unknown');
  } finally {
    f.clean();
  }
});

// DC3: run root with a dead .owner is removed; a live one is kept.
test('run root with a dead owner pid is removed, live owner kept', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'scratch-leaf');
    const scratch: string = scratchFor(f, 'scratch-leaf');
    const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const dead: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(
      resolve(dead, '.owner'),
      JSON.stringify({ pid: 4194303, boot_id: boot, started: new Date().toISOString() }),
    );
    const foreignBoot: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(
      resolve(foreignBoot, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: 'not-this-boot', started: new Date().toISOString() }),
    );
    const live: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(
      resolve(live, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: boot, started: new Date().toISOString() }),
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(dead)).toBe(false);
    expect(existsSync(foreignBoot)).toBe(false);
    expect(existsSync(live)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(live);
  } finally {
    f.clean();
  }
});

// DC4: old in-repo worktree of an active leaf is migrated; refusals keep it.
test('clean old-location worktree of an active leaf is removed and recreated sparse at the store', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const old: string = resolve(f.root, 'issues/worktrees/migrate-me');
    await command(['git', 'worktree', 'add', '-b', 'migrate-me', old], f.root);
    const path: string = leaf(f, 'migrate-me', 'plan.synthesis', { worktree: old });
    // First pass: dispatch hits the recorded-vs-store mismatch, then the reconciler
    // removes the old worktree and clears the recorded path.
    await next(f, ['migrate-me']);
    expect(existsSync(old)).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
    // The next dispatch recreates it at the store, sparse, from the branch.
    const second: Result = await next(f, ['migrate-me']);
    expect(second.code).toBe(0);
    const recreated: string | undefined = readState(path).worktree;
    expect(recreated).toBe(resolve(storeDir(f), 'migrate-me'));
    expect(existsSync(recreated!)).toBe(true);
    // DC5: a sparse worktree reads clean — it is not reported as dirty,
    // and a later merged pass removes it under the removal rule.
    saveState(path, { ...readState(path), phase: 'merged' });
    closeTab(f, readState(path).tab!);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(recreated!)).toBe(false);
    expect((await branchExists(f, 'migrate-me')).code).toBe(1);
  } finally {
    f.clean();
  }
});

for (const refusal of ['dirty', 'mid-rebase', 'live tab', 'live cwd', 'batch'] as const) {
  test(`old-location worktree migration is refused while ${refusal}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const old: string = resolve(f.root, `issues/worktrees/stay-${refusal.replace(' ', '-')}`);
      await command(['git', 'worktree', 'add', '-b', `stay-${refusal.replace(' ', '-')}`, old], f.root);
      const extra: object =
        refusal === 'batch'
          ? {
              worktree: old,
              batch: { attempt: 'a1', built_on: 'x', holder: { base: 'x', head: 'x' }, members: [], applied: false },
            }
          : { worktree: old };
      const slug: string = `stay-${refusal.replace(' ', '-')}`;
      const path: string = leaf(f, slug, 'plan.synthesis', extra);
      if (refusal === 'dirty') writeFileSync(resolve(old, 'untracked'), 'x');
      if (refusal === 'mid-rebase') {
        const marker: string = await command(['git', '-C', old, 'rev-parse', '--git-path', 'rebase-merge'], f.root);
        mkdirSync(resolve(old, marker), { recursive: true });
      }
      if (refusal === 'live tab' || refusal === 'live cwd') {
        const db: Database = database(f);
        saveDatabase(f, {
          ...db,
          panes: [
            {
              pane_id: 'w1:p1',
              tab_id: refusal === 'live tab' ? 'w1:t1' : 'w1:t9',
              cwd: refusal === 'live cwd' ? old : null,
              agent: null,
              agent_status: 'idle',
              focused: true,
            },
          ],
        });
        if (refusal === 'live tab') saveState(path, { ...readState(path), tab: 'w1:t1' });
      }
      await next(f, [slug]);
      expect(existsSync(old)).toBe(true);
      expect(readState(path).worktree).toBe(old);
      const out: Result = await status(f);
      expect(out.stdout).toContain(old);
    } finally {
      f.clean();
    }
  });
}

// A worktree outside the store and outside the old root is reported, never removed.
test('operator worktree outside managed roots is kept as unmanaged', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'seed-leaf');
    const outside: string = resolve(f.home, 'operator-wt');
    await command(['git', 'worktree', 'add', '--detach', outside], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(outside)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(outside);
    expect(out.stdout).toContain('unmanaged');
  } finally {
    f.clean();
  }
});

test('recorded worktree that is not a registered git worktree is kept, not removed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'seed-leaf');
    const fake: string = resolve(f.root, 'issues/worktrees/fake-wt');
    mkdirSync(fake, { recursive: true });
    writeFileSync(resolve(fake, 'file'), 'x');
    leaf(f, 'fake-wt', 'plan.synthesis', { worktree: fake });
    expect((await next(f, ['--all'])).code).not.toBe(0);
    expect(existsSync(fake)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(fake);
  } finally {
    f.clean();
  }
});

// DC6: an unconfirmed base-run checkout is removed only under the removal rules.
test('unconfirmed base-run worktree is removed when clean, kept when dirty', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'holder-leaf');
    const clean: string = resolve(storeDir(f), 'base-clean-run');
    const dirty: string = resolve(storeDir(f), 'base-dirty-run');
    await command(['git', 'worktree', 'add', '--detach', clean], f.root);
    await command(['git', 'worktree', 'add', '--detach', dirty], f.root);
    writeFileSync(resolve(dirty, 'untracked'), 'x');
    const record = (id: string, path: string): string =>
      JSON.stringify({
        run: id,
        repo: 'repo',
        leaf: 'holder-leaf',
        slot: 'A',
        base: 'x',
        command: ['true'],
        cwd: '',
        path,
        env_generation: 0,
        pid: 1,
        boot_id: 'b',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      });
    writeFileSync(
      resolve(f.root, 'issues/base-runs.jsonl'),
      record('clean-run', clean) + '\n' + record('dirty-run', dirty) + '\n',
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(clean)).toBe(false);
    expect(existsSync(dirty)).toBe(true);
    const out: Result = await status(f);
    expect(out.stdout).toContain(dirty);
    expect(out.stdout).toContain('uncommitted');
  } finally {
    f.clean();
  }
});

test('store variants survive live or unavailable pane inventories', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'variant-holder');
    const variant: string = resolve(storeDir(f), 'variant-holder-v0');
    await command(['git', 'worktree', 'add', '--detach', variant], f.root);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: [
        ...db.panes,
        { pane_id: 'w1:p999', tab_id: 'w1:t999', cwd: variant, agent: null, agent_status: 'idle' },
      ],
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f)).stdout).toContain(variant);
    expect((await status(f)).stdout).toContain('live pane inside');
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    await next(f, ['--all']);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f)).stdout).toContain('pane list unavailable');
    saveDatabase(f, { ...db, panes: db.panes });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(variant)).toBe(false);
  } finally {
    f.clean();
  }
});
