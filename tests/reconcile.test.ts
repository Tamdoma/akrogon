import { test, expect } from 'bun:test';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import {
  fixture,
  cli,
  leaf,
  fakeHerdr,
  fakeAkrogon,
  yaml,
  leafTempRoot,
  procRoot,
  registerTemp,
  storeDir,
  type Fixture,
} from './helpers';
import { readState, saveState } from '../src/state';
import { leafTemp, readRepo } from '../src/config';
import { command, run, spawnCaptured, type Result, type SpawnResult } from '../src/shell';
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

// store-sweep fixtures: the repo-hash dir under the leaf temp root and an
// owner record in the reconcile shape. The root is the child process's
// AKROGON_LEAF_TEMP_ROOT (leafTempRoot(f)), never the suite's own.
function repoTempDir(f: DispatchFixture): string {
  return resolve(leafTempRoot(f), createHash('sha256').update(f.root).digest('hex').slice(0, 4));
}
function ownerRecord(pid: number): string {
  const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
  return JSON.stringify({ pid, boot_id: boot, started: new Date().toISOString() });
}
function keptReport(f: DispatchFixture, repo: string = 'repo'): { path: string; reason: string }[] {
  const file: string = resolve(f.home, 'reconcile', `${repo}.json`);
  if (!existsSync(file)) return [];
  return z
    .object({ kept: z.array(z.object({ path: z.string(), reason: z.string() })) })
    .parse(JSON.parse(readFileSync(file, 'utf8'))).kept;
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

// DC2/DC4: kept worktrees reported by `akrogon leftovers` and
// `akrogon status <slug>` with path and reason; a gone path drops its line.
test('dirty merged worktree is kept and reported with path and reason', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'dirty-leaf');
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'untracked'), 'dirty');
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    const out: Result = await status(f, 'dirty-leaf');
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toContain('uncommitted');
    const board: Result = await cli(f, ['status'], f.root, f.env);
    expect(board.code).toBe(0);
    expect(board.stdout).not.toContain('Kept by last cleanup');
    const plain: Result = await cli(f, ['leftovers'], f.root, f.env);
    expect(plain.code).toBe(0);
    expect(plain.stdout).toContain(`  uncommitted changes\n    ${worktree.replace(f.home, '~')}`);
    expect((await branchExists(f, 'dirty-leaf')).code).toBe(0);
    rmSync(worktree, { recursive: true, force: true });
    const stale: Result = await cli(f, ['leftovers'], f.root, f.env);
    expect(stale.code).toBe(0);
    expect(stale.stdout).not.toContain(worktree.replace(f.home, '~'));
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
    const out: Result = await status(f, 'rebase-leaf');
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
    const out: Result = await status(f, 'lost-leaf');
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
    const out: Result = await status(f, 'pane-leaf');
    expect(out.stdout).toContain(worktree);
    expect(out.stdout).toContain('live pane');
  } finally {
    f.clean();
  }
});

// A stray entry in the store is unowned: kept while a leaf of the repo runs,
// removed once the repo is idle.
test('an unowned directory inside the store is kept while a leaf runs, removed once idle', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'seed-leaf');
    const stray: string = resolve(storeDir(f), 'not-a-leaf');
    mkdirSync(stray, { recursive: true });
    writeFileSync(resolve(stray, 'file'), 'x');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(stray)).toBe(true);
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(stray)).toBe(false);
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
    const out: Result = await status(f, 'scratch-leaf');
    expect(out.stdout).toContain(live);
  } finally {
    f.clean();
  }
});

test('an unfinished leaf temp is removed once its tab is gone and kept silently while its tab lives', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const idle: string = await dispatchLeaf(f, 'idle-leaf');
    const idleScratch: string = scratchFor(f, 'idle-leaf');
    writeFileSync(resolve(idleScratch, 'left'), 'x');
    closeTab(f, readState(idle).tab!);
    await dispatchLeaf(f, 'busy-leaf');
    const busyScratch: string = scratchFor(f, 'busy-leaf');
    expect(readState(idle).phase).toBe('plan.synthesis');
    expect(existsSync(idleScratch)).toBe(false);
    expect(existsSync(busyScratch)).toBe(true);
    expect((await status(f, 'busy-leaf')).stdout).not.toContain(busyScratch);
  } finally {
    f.clean();
  }
});

test('a failed leaf temp stays while its tab lives, because its seats still use it as TMPDIR', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'failed-live');
    const scratch: string = scratchFor(f, 'failed-live');
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'criterion red' },
    });
    await next(f, ['--all']);
    expect(existsSync(scratch)).toBe(true);
    closeTab(f, readState(path).tab!);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(scratch)).toBe(false);
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
              batch: { attempt: 'a1', built_on: 'x', holder: { base: 'x', head: 'x' }, applied: false, members: [] },
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
      const out: Result = await status(f, slug);
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
    const out: Result = await status(f, 'seed-leaf');
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
    const out: Result = await status(f, 'seed-leaf');
    expect(out.stdout).toContain(fake);
  } finally {
    f.clean();
  }
});

// A verify scratch copy at an unreachable commit needs a dangling detached head.
async function unreachable(path: string, cwd: string): Promise<void> {
  await command(['git', '-C', path, 'checkout', '--detach'], cwd);
  writeFileSync(resolve(path, 'unreach'), 'x');
  await command(['git', '-C', path, 'add', 'unreach'], cwd);
  await command(['git', '-C', path, 'commit', '-m', 'unreachable'], cwd);
}

// Ended verify runs leave scratch copies: clean or dirty, both are removed.
test('unconfirmed verify worktrees are removed once the run ends', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'holder-leaf');
    const clean: string = resolve(storeDir(f), 'verify-clean-run');
    const dirty: string = resolve(storeDir(f), 'verify-dirty-run');
    await command(['git', 'worktree', 'add', '--detach', clean], f.root);
    await command(['git', 'worktree', 'add', '--detach', dirty], f.root);
    writeFileSync(resolve(dirty, 'untracked'), 'x');
    const record = (id: string, path: string): string =>
      JSON.stringify({
        run: id,
        repo: 'repo',
        leaf: 'holder-leaf',
        sha: 'x',
        tree: 'x',
        scope: 'leaf',
        path,
        pid: 1,
        boot_id: 'b',
        commands: [],
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      });
    writeFileSync(
      resolve(f.root, 'issues/verify-runs.jsonl'),
      record('clean-run', clean) + '\n' + record('dirty-run', dirty) + '\n',
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(clean)).toBe(false);
    // An ended verify run's copy is scratch: removed force, dirty or not.
    expect(existsSync(dirty)).toBe(false);
    const out: Result = await status(f, 'holder-leaf');
    expect(out.stdout).not.toContain(dirty);
  } finally {
    f.clean();
  }
});

// DC1: a registered store worktree that is no leaf slug and no scratch kind is
// unmanaged; it stays whether a pane sits inside, the pane list is down or no
// pane is anywhere near it. Rewritten under worktree-keep-rule: the old sweep
// removed it, which is the #94 deletion this leaf ends.
test('store variants are kept as unmanaged through live, unavailable and absent panes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'variant-holder');
    const variant: string = resolve(storeDir(f), 'variant-holder-v0');
    await command(['git', 'worktree', 'add', '--detach', variant], f.root);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: [...db.panes, { pane_id: 'w1:p999', tab_id: 'w1:t999', cwd: variant, agent: null, agent_status: 'idle' }],
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f, 'variant-holder')).stdout).toContain(variant);
    expect((await status(f, 'variant-holder')).stdout).toContain('unmanaged worktree');
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    await next(f, ['--all']);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f, 'variant-holder')).stdout).toContain('unmanaged worktree');
    saveDatabase(f, { ...db, panes: db.panes });
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f, 'variant-holder')).stdout).toContain('unmanaged worktree');
    expect(keptReport(f).some((entry) => entry.path === variant && entry.reason === 'unmanaged worktree')).toBe(true);
  } finally {
    f.clean();
  }
});

test('failed leaf scratch preserves an actual running verify command', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const akrogon: { env: NodeJS.ProcessEnv } = fakeAkrogon(f);
    const env: NodeJS.ProcessEnv = { ...f.env, ...akrogon.env };
    const marker: string = resolve(f.home, 'running');
    const release: string = resolve(f.home, 'release');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: {
        test: `printf "%s" "$TMPDIR" > ${marker}; while [ ! -f ${release} ]; do sleep 0.01; done; test -d "$TMPDIR"`,
      },
      grounding: 'none',
      setup: 'mkdir -p node_modules',
    });
    const path: string = await dispatchLeaf(f, 'running-base');
    const running: Promise<Result> = cli(f, ['verify'], readState(path).worktree!, env);
    try {
      for (let i: number = 0; i < 500 && !existsSync(marker); i++) await Bun.sleep(10);
      expect(existsSync(marker)).toBe(true);
      const runRoot: string = readFileSync(marker, 'utf8');
      closeTab(f, readState(path).tab!);
      saveState(path, {
        ...readState(path),
        phase: 'failed',
        failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'operator stop' },
      });
      expect((await next(f, ['--all'])).code).toBe(0);
      expect(existsSync(runRoot)).toBe(true);
      expect((await status(f, 'running-base')).stdout).toContain(runRoot);
    } finally {
      writeFileSync(release, 'release');
      expect((await running).code).toBe(0);
    }
  } finally {
    f.clean();
  }
});

// DC1: a targeted next pass reconciles too; a registered variant is kept as
// unmanaged. Rewritten under worktree-keep-rule — the sweep this pinned is the
// deletion rule the brief ends.
test('targeted next keeps unused registered variants', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'typed-holder');
    const variant: string = resolve(storeDir(f), 'typed-holder-v1');
    await command(['git', 'worktree', 'add', '--detach', variant], f.root);
    expect((await next(f, ['typed-holder'])).code).toBe(0);
    expect(existsSync(variant)).toBe(true);
    expect((await status(f, 'typed-holder')).stdout).toContain('unmanaged worktree');
    expect(keptReport(f).some((entry) => entry.path === variant && entry.reason === 'unmanaged worktree')).toBe(true);
  } finally {
    f.clean();
  }
});

test('a worker worktree of an active leaf is kept until the leaf fails', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'worker-holder');
    const worker: string = resolve(storeDir(f), 'worker-holder-u1');
    await command(['git', 'worktree', 'add', '--detach', worker], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worker)).toBe(true);
    expect((await status(f, 'worker-holder')).stdout).toContain('active leaf worker');
    closeTab(f, readState(path).tab!);
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'test' },
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worker)).toBe(false);
  } finally {
    f.clean();
  }
});

// Scratch copies are removed by owner state: a killed verify run's copy goes even
// at an unreachable commit; a live run's copy stays, even dirty.
test('verify scratch copies are removed by owner state and kept while the run is live', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'scratch-holder');
    const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const dead: string = resolve(storeDir(f), 'verify-dead-run');
    const live: string = resolve(storeDir(f), 'verify-live-run');
    await command(['git', 'worktree', 'add', '--detach', dead], f.root);
    await command(['git', 'worktree', 'add', '--detach', live], f.root);
    await unreachable(dead, f.root);
    writeFileSync(resolve(live, 'untracked'), 'dirty');
    const record = (id: string, path: string, pid: number, end?: string): string =>
      JSON.stringify({
        run: id,
        repo: 'repo',
        leaf: 'scratch-holder',
        sha: 'x',
        tree: 'x',
        scope: 'leaf',
        path,
        pid,
        boot_id: boot,
        commands: [],
        start: new Date().toISOString(),
        ...(end === undefined ? {} : { end }),
      });
    writeFileSync(
      resolve(f.root, 'issues/verify-runs.jsonl'),
      record('dead-run', dead, 4194303) + '\n' + record('live-run', live, process.pid) + '\n',
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(dead)).toBe(false);
    expect(existsSync(live)).toBe(true);
    const out: Result = await status(f, 'scratch-holder');
    expect(out.stdout).toContain(live);
    expect(out.stdout).toContain('verify live-run in progress');
  } finally {
    f.clean();
  }
});

test('a verify scratch copy with no record is removed like a dead-owner copy', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'stray-holder');
    const stray: string = resolve(storeDir(f), 'verify-no-record');
    await command(['git', 'worktree', 'add', '--detach', stray], f.root);
    await unreachable(stray, f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(stray)).toBe(false);
  } finally {
    f.clean();
  }
});

// The build owner record keeps a paused build's copy across passes; a dead
// builder loses copy and record together, and a copy with no record is a stray.
test('batch copies follow their owner record: live kept, dead and absent removed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    await dispatchLeaf(f, 'batch-holder');
    const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const owned: string = resolve(storeDir(f), 'batch-owned');
    await command(['git', 'worktree', 'add', '--detach', owned], f.root);
    writeFileSync(resolve(owned, 'untracked'), 'dirty');
    const ownerFile: string = `${owned}.owner`;
    const writeOwner = (pid: number): void => {
      writeFileSync(ownerFile, JSON.stringify({ pid, boot_id: boot, started: new Date().toISOString() }));
    };
    writeOwner(child.pid);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(owned)).toBe(true);
    expect(existsSync(ownerFile)).toBe(true);
    child.kill('SIGKILL');
    await child.exited;
    const stray: string = resolve(storeDir(f), 'batch-stray');
    await command(['git', 'worktree', 'add', '--detach', stray], f.root);
    writeFileSync(resolve(stray, 'untracked'), 'dirty');
    const orphaned: string = resolve(storeDir(f), 'batch-gone.owner');
    writeFileSync(orphaned, JSON.stringify({ pid: 4194303, boot_id: boot, started: new Date().toISOString() }));
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(owned)).toBe(false);
    expect(existsSync(ownerFile)).toBe(false);
    expect(existsSync(stray)).toBe(false);
    expect(existsSync(orphaned)).toBe(false);
    expect((await status(f, 'batch-holder')).stdout).not.toContain('batch-owned');
  } finally {
    child.kill('SIGKILL');
    f.clean();
  }
});

// A worker copy is scratch once its leaf merged: removed with --force even with
// unreachable commits and untracked files. A failed owner keeps today's guard.
test('worker copies follow the owner leaf: merged removes, failed keeps the guard', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'done-holder');
    const worker: string = resolve(storeDir(f), 'done-holder-u1');
    await command(['git', 'worktree', 'add', '--detach', worker], f.root);
    await unreachable(worker, f.root);
    mkdirSync(resolve(worker, '__pycache__'));
    writeFileSync(resolve(worker, '__pycache__/x.pyc'), 'x');
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worker)).toBe(false);
    // The merge pass completed the issue: the leaf record now lives in closed.
    const closed: string = resolve(f.root, 'issues/closed/issue/done-holder');
    expect(existsSync(resolve(closed, 'state.yaml'))).toBe(true);
    saveState(closed, {
      ...readState(closed),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'test' },
    });
    const kept: string = resolve(storeDir(f), 'done-holder-u2');
    await command(['git', 'worktree', 'add', '--detach', kept], f.root);
    await unreachable(kept, f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(kept)).toBe(true);
    const out: Result = await status(f, 'done-holder');
    expect(out.stdout).toContain(kept);
    expect(out.stdout).toMatch(/unreachable commit/);
  } finally {
    f.clean();
  }
});

// A leaf whose own slug ends in -u<N> keeps its leaf rules: a store directory
// named after it is adopted as that leaf's worktree, not read as a worker copy
// of the same-named owner.
test('a leaf slug ending in -u<N> is handled as that leaf, not as a worker copy', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const strayPath: string = await dispatchLeaf(f, 'mine-u1');
    const stray: string = readState(strayPath).worktree!;
    await command(['git', 'worktree', 'remove', '--force', stray], f.root);
    closeTab(f, readState(strayPath).tab!);
    saveState(strayPath, { ...readState(strayPath), phase: 'merged', worktree: undefined });
    const path: string = await dispatchLeaf(f, 'mine');
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    await command(['git', 'worktree', 'add', '--detach', stray], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(stray)).toBe(false);
    const closed: string = resolve(f.root, 'issues/closed/issue/mine-u1');
    expect(existsSync(resolve(closed, 'state.yaml'))).toBe(true);
    expect(readState(closed).worktree).toBeUndefined();
    // Handled as the leaf itself: a second pass drops the merged branch; a
    // worker-copy reading would keep it forever.
    expect((await next(f, ['--all'])).code).toBe(0);
    expect((await branchExists(f, 'mine-u1')).code).toBe(1);
  } finally {
    f.clean();
  }
});

// No scratch copy is removed while a live pane sits inside it, or while the
// pane list is unavailable.
test('scratch copies stay while a pane is inside or the pane list is unavailable', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    await dispatchLeaf(f, 'pane-holder');
    const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const dead: string = resolve(storeDir(f), 'verify-pane');
    await command(['git', 'worktree', 'add', '--detach', dead], f.root);
    writeFileSync(
      resolve(f.root, 'issues/verify-runs.jsonl'),
      JSON.stringify({
        run: 'pane',
        repo: 'repo',
        leaf: 'pane-holder',
        sha: 'x',
        tree: 'x',
        scope: 'leaf',
        path: dead,
        pid: 4194303,
        boot_id: boot,
        commands: [],
        start: new Date().toISOString(),
      }) + '\n',
    );
    const stray: string = resolve(storeDir(f), 'batch-pane');
    await command(['git', 'worktree', 'add', '--detach', stray], f.root);
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    // The pass reports the failed pane listing; nothing is removed without it.
    await next(f, ['--all']);
    expect(existsSync(dead)).toBe(true);
    expect(existsSync(stray)).toBe(true);
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      paneListStdout: undefined,
      panes: [...db.panes, { pane_id: 'w1:p500', tab_id: 'w1:t500', cwd: dead, agent: null, agent_status: 'idle' }],
    });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(dead)).toBe(true);
    expect(existsSync(stray)).toBe(false);
    const out: Result = await status(f, 'pane-holder');
    expect(out.stdout).toContain(dead);
    expect(out.stdout).toContain('live pane');
  } finally {
    f.clean();
  }
});

// A surviving process with cwd or an open file inside a dead copy keeps it,
// recorded with that pid as the reason.
test('a scratch copy with a process inside stays, recorded with the pid', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    await dispatchLeaf(f, 'proc-holder');
    const boot: string = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const dead: string = resolve(storeDir(f), 'verify-proc');
    await command(['git', 'worktree', 'add', '--detach', dead], f.root);
    writeFileSync(
      resolve(f.root, 'issues/verify-runs.jsonl'),
      JSON.stringify({
        run: 'proc',
        repo: 'repo',
        leaf: 'proc-holder',
        sha: 'x',
        tree: 'x',
        scope: 'leaf',
        path: dead,
        pid: 4194303,
        boot_id: boot,
        commands: [],
        start: new Date().toISOString(),
      }) + '\n',
    );
    const procDir: string = resolve(procRoot(f), String(child.pid));
    mkdirSync(resolve(procDir, 'fd'), { recursive: true });
    symlinkSync(dead, resolve(procDir, 'cwd'));
    writeFileSync(resolve(dead, 'open-file'), 'x');
    symlinkSync(resolve(dead, 'open-file'), resolve(procDir, 'fd/3'));
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(dead)).toBe(true);
    const out: Result = await status(f, 'proc-holder');
    expect(out.stdout).toContain(dead);
    expect(out.stdout).toContain(String(child.pid));
    child.kill('SIGKILL');
    await child.exited;
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(dead)).toBe(false);
  } finally {
    child.kill('SIGKILL');
    f.clean();
  }
});

test('a scratch copy stays while its surviving process closes unrelated file descriptors', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      worktree_root: storeDir(f),
    });
    const copy: string = resolve(storeDir(f), 'verify-fd-churn');
    await command(['git', 'worktree', 'add', '--detach', copy], f.root);
    const child: Bun.Subprocess<'ignore', 'pipe', 'inherit'> = Bun.spawn(
      [
        process.execPath,
        '-e',
        `import { openSync, closeSync } from 'node:fs';
console.log('ready');
while (true) {
  const fds = Array.from({ length: 512 }, () => openSync('/dev/null', 'r'));
  for (const fd of fds) closeSync(fd);
}`,
      ],
      { cwd: copy, stdin: 'ignore', stdout: 'pipe', stderr: 'inherit' },
    );
    try {
      const output: ReadableStreamDefaultReader<Uint8Array> = child.stdout.getReader();
      expect(new TextDecoder().decode((await output.read()).value)).toContain('ready');
      output.releaseLock();
      for (let pass: number = 0; pass < 10; pass++) {
        expect((await next(f, ['--all'], { AKROGON_PROC_ROOT: '/proc' })).code).toBe(0);
        expect(existsSync(copy)).toBe(true);
        const out: Result = await cli(f, ['leftovers'], f.root, f.env);
        expect(out.stdout).toContain(`process ${child.pid} inside`);
      }
    } finally {
      child.kill('SIGKILL');
      await child.exited;
    }
    expect((await next(f, ['--all'], { AKROGON_PROC_ROOT: '/proc' })).code).toBe(0);
    expect(existsSync(copy)).toBe(false);
  } finally {
    f.clean();
  }
});

test('configured destination store migrates a clean old managed worktree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      worktree_root: storeDir(f),
    });
    const old: string = resolve(f.root, 'issues/worktrees/configured-migration');
    await command(['git', 'worktree', 'add', '-b', 'configured-migration', old], f.root);
    const path: string = leaf(f, 'configured-migration', 'plan.synthesis', { worktree: old });
    await next(f, ['configured-migration']);
    expect(existsSync(old)).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
    expect((await next(f, ['configured-migration'])).code).toBe(0);
    expect(readState(path).worktree).toBe(resolve(storeDir(f), 'configured-migration'));
  } finally {
    f.clean();
  }
});

// store-sweep criterion 1: with no running leaf a pass deletes unregistered
// and stray junk in the store, the legacy root and the leaf temp tree.
test('unregistered and stray entries are deleted when no leaf of the repo runs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'gone-leaf', 'merged');
    leaf(f, 'lost-leaf', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'test' },
      tab: 'w1:t8',
    });
    const legacy: string = resolve(f.root, 'issues/worktrees');
    const temp: string = repoTempDir(f);
    for (const root of [storeDir(f), legacy]) {
      mkdirSync(resolve(root, 'junk'), { recursive: true });
      writeFileSync(resolve(root, 'junk', 'file'), 'x');
      symlinkSync(resolve(f.home, 'gone-target'), resolve(root, 'old-link'));
      writeFileSync(resolve(root, 'stray.txt'), 'x');
    }
    mkdirSync(resolve(temp, 'gone-leaf-tmp'), { recursive: true });
    const runDead: string = mkdtempSync(resolve(temp, 'run-'));
    writeFileSync(resolve(runDead, '.owner'), ownerRecord(4194303));
    writeFileSync(resolve(temp, 'stray.file'), 'x');
    mkdirSync(resolve(temp, 'wrench.42.tmp'));
    mkdirSync(resolve(temp, 'other.abc'));
    expect((await next(f, ['--all'])).code).toBe(0);
    for (const root of [storeDir(f), legacy]) {
      expect(existsSync(resolve(root, 'junk'))).toBe(false);
      // lstatSync reads the entry itself: existsSync follows the dangling
      // target and can never tell link-present from link-removed (F1).
      expect(lstatSync(resolve(root, 'old-link'), { throwIfNoEntry: false })).toBeUndefined();
      expect(existsSync(resolve(root, 'stray.txt'))).toBe(false);
    }
    expect(existsSync(runDead)).toBe(false);
    // The repo-hash dir emptied after sweeping its children.
    expect(existsSync(temp)).toBe(false);
  } finally {
    f.clean();
  }
});

// store-sweep criterion 3: entries tied to a running leaf stay; a finished
// owner loses its unregistered leaf-named entries.
test('a running leaf keeps its temp, its slug entries and unowned entries', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'guard-leaf');
    const store: string = storeDir(f);
    mkdirSync(resolve(store, 'guard-leaf-old'), { recursive: true });
    writeFileSync(resolve(store, 'stray.txt'), 'x');
    const temp: string = repoTempDir(f);
    mkdirSync(resolve(temp, 'guard-tmp'), { recursive: true });
    writeFileSync(resolve(temp, 'guard-tmp', 'x'), 'x');
    expect((await next(f, ['--all'])).code).toBe(0);
    for (const item of ['guard-leaf-old', 'stray.txt']) expect(existsSync(resolve(store, item))).toBe(true);
    expect(existsSync(resolve(temp, 'guard-tmp'))).toBe(true);
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(resolve(store, 'guard-leaf-old'))).toBe(false);
    expect(existsSync(resolve(store, 'stray.txt'))).toBe(false);
    expect(existsSync(temp)).toBe(false);
  } finally {
    f.clean();
  }
});

// store-sweep criterion 4: live owner records protect their items even with
// the leaf done, the enclosing dir a candidate and a missing tab.
test('live owners keep run dirs and build records; a young ownerless run dir stays', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    const path: string = await dispatchLeaf(f, 'owner-leaf');
    const scratch: string = scratchFor(f, 'owner-leaf');
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    const runLive: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(resolve(runLive, '.owner'), ownerRecord(child.pid));
    const runYoung: string = mkdtempSync(resolve(scratch, 'run-'));
    const runDead: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(resolve(runDead, '.owner'), ownerRecord(4194303));
    const orphan: string = resolve(storeDir(f), 'batch-gone.owner');
    writeFileSync(orphan, ownerRecord(child.pid));
    expect((await next(f, ['--all'])).code).toBe(0);
    // The live-owner run keeps the leaf temp alive too.
    expect(existsSync(scratch)).toBe(true);
    expect(existsSync(runLive)).toBe(true);
    expect(existsSync(runYoung)).toBe(true);
    expect(existsSync(runDead)).toBe(false);
    expect(existsSync(orphan)).toBe(true);
    const kept: { path: string; reason: string }[] = keptReport(f);
    expect(kept.some((entry) => entry.path === orphan)).toBe(true);
  } finally {
    child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

// store-sweep criteria 5 and 6: a dead-owner run dir goes on every pass, even
// while the leaf is active and the pane list is unavailable; everything else
// stays under an unavailable pane list. The leaf is called in its temp dir so
// the sweep sees an active leaf without dispatching it.
test('a dead-owner run dir is removed under an unavailable pane list, strays stay', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = await dispatchLeaf(f, 'active-leaf');
    const scratch: string = scratchFor(f, 'active-leaf');
    const runDead: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(resolve(runDead, '.owner'), ownerRecord(4194303));
    const strayFile: string = resolve(scratch, 'old.log');
    writeFileSync(strayFile, 'x');
    const orphan: string = resolve(storeDir(f), 'batch-held.owner');
    writeFileSync(orphan, ownerRecord(4194303));
    writeFileSync(resolve(storeDir(f), 'stray.txt'), 'x');
    expect(readState(path).phase).toBe('plan.synthesis');
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    // Reconcile in a subprocess with the fixture env: live === null is the
    // unavailable pane list.
    const src = (name: string): string => JSON.stringify(resolve(import.meta.dir, `../src/${name}.ts`));
    const pass: SpawnResult = await spawnCaptured(
      [
        process.execPath,
        '-e',
        `const {reconcile}=await import(${src('reconcile')});const {allLeaves}=await import(${src('state')});const {readRepo}=await import(${src('config')});const r=readRepo('repo',process.cwd());const out=await reconcile(r,allLeaves(r),null);console.log(JSON.stringify(out));`,
      ],
      {
        cwd: f.root,
        env: {
          ...process.env,
          ...f.env,
          AKROGON_HOME: f.home,
          HOME: f.home,
          HERDR_PANE_ID: '',
          AKROGON_RUN: '',
          AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
        },
      },
    );
    expect(pass.code).toBe(0);
    const { removed, kept } = z
      .object({
        removed: z.array(z.string()),
        kept: z.array(z.object({ path: z.string(), reason: z.string() })),
      })
      .parse(JSON.parse(pass.stdout.trim().split('\n').at(-1)!));
    expect(removed).toContain(runDead);
    expect(removed).not.toContain(orphan);
    expect(removed).not.toContain(resolve(storeDir(f), 'stray.txt'));
    expect(existsSync(runDead)).toBe(false);
    expect(existsSync(strayFile)).toBe(true);
    expect(existsSync(orphan)).toBe(true);
    expect(existsSync(resolve(storeDir(f), 'stray.txt'))).toBe(true);
    expect(kept.some((entry) => entry.path === orphan)).toBe(true);
    expect(kept.some((entry) => entry.path === resolve(storeDir(f), 'stray.txt'))).toBe(true);
  } finally {
    f.clean();
  }
});

// store-sweep criterion 6: an unowned item with a live pane or a surviving
// process inside stays, recorded with the pane or pid.
test('unowned entries stay while a pane or process sits inside', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    const path: string = await dispatchLeaf(f, 'idle-leaf');
    closeTab(f, readState(path).tab!);
    saveState(path, { ...readState(path), phase: 'merged' });
    const junkFree: string = resolve(storeDir(f), 'junk-free');
    const junkPane: string = resolve(storeDir(f), 'junk-pane');
    const junkProc: string = resolve(storeDir(f), 'junk-proc');
    for (const dir of [junkFree, junkPane, junkProc]) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, 'x'), 'x');
    }
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      panes: [...db.panes, { pane_id: 'w1:p700', tab_id: 'w1:t700', cwd: junkPane, agent: null, agent_status: 'idle' }],
    });
    const procDir: string = resolve(procRoot(f), String(child.pid));
    mkdirSync(resolve(procDir, 'fd'), { recursive: true });
    symlinkSync(junkProc, resolve(procDir, 'cwd'));
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(junkFree)).toBe(false);
    expect(existsSync(junkPane)).toBe(true);
    expect(existsSync(junkProc)).toBe(true);
    const kept: { path: string; reason: string }[] = keptReport(f);
    expect(kept.some((entry) => entry.path === junkPane && entry.reason === 'live pane inside')).toBe(true);
    expect(kept.some((entry) => entry.path === junkProc && entry.reason.includes(String(child.pid)))).toBe(true);
  } finally {
    child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

// store-sweep criterion 7: a registered worktree matching no leaf or scratch
// kind is kept and listed, never removed — a locked one doubly so.
test('unknown registered worktrees are kept unmanaged; locked ones are never removed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const mystery: string = resolve(storeDir(f), 'mystery');
    await command(['git', 'worktree', 'add', '--detach', mystery], f.root);
    const locked: string = resolve(storeDir(f), 'locked');
    await command(['git', 'worktree', 'add', '--detach', '--lock', locked], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(mystery)).toBe(true);
    expect(existsSync(locked)).toBe(true);
    const kept: { path: string; reason: string }[] = keptReport(f);
    expect(kept.some((entry) => entry.path === mystery)).toBe(true);
    await command(['git', 'worktree', 'unlock', locked], f.root);
  } finally {
    f.clean();
  }
});

// store-sweep criterion 9: a deletion that fails is reported with path and
// error, and nothing absent from disk is claimed removed.
test('a failed delete is reported with path and error and the item remains', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'gone-leaf', 'merged');
    mkdirSync(storeDir(f), { recursive: true });
    const junk: string = resolve(storeDir(f), 'junk');
    mkdirSync(junk, { recursive: true });
    writeFileSync(resolve(junk, 'x'), 'x');
    chmodSync(storeDir(f), 0o555);
    try {
      expect((await next(f, ['--all'])).code).toBe(0);
    } finally {
      chmodSync(storeDir(f), 0o755);
    }
    expect(existsSync(junk)).toBe(true);
    const kept: { path: string; reason: string }[] = keptReport(f);
    expect(kept.some((entry) => entry.path === junk && entry.reason.includes('delete failed'))).toBe(true);
  } finally {
    f.clean();
  }
});

// store-sweep criterion 10: a pass whose only candidate is a new kind fetches
// the pane list rather than judging it with an empty one.
test('a stray-file-only pass fetches the pane list before deleting', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    mkdirSync(storeDir(f), { recursive: true });
    writeFileSync(resolve(storeDir(f), 'stray.txt'), 'x');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(calls(f).some((args) => args[0] === 'pane' && args[1] === 'list')).toBe(true);
    expect(existsSync(resolve(storeDir(f), 'stray.txt'))).toBe(false);
  } finally {
    f.clean();
  }
});
