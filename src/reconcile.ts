import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
  type Dirent,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, leafTemp, within, worktreeStore, type Repo } from './config';
import { readBaseRuns, type BaseRun } from './base-run';
import { batchMemberSlugs } from './batch';
import { leavesUnder, readState, saveState, type Leaf, type State } from './state';
import { command, herdrError, run, type Pane, type Result } from './shell';

export type Reconciled = { removed: string[]; kept: { path: string; reason: string }[] };

const keptReportSchema = z.strictObject({ kept: z.array(z.strictObject({ path: z.string(), reason: z.string() })) });

export function keptReportPath(repo: Repo): string {
  return resolve(globalHome(), 'reconcile', `${repo.name}.json`);
}

export function readKept(repo: Repo): { path: string; reason: string }[] {
  const file: string = keptReportPath(repo);
  try {
    return keptReportSchema.parse(JSON.parse(readFileSync(file, 'utf8'))).kept;
  } catch {
    return [];
  }
}

function writeKeptReport(repo: Repo, kept: { path: string; reason: string }[]): void {
  const file: string = keptReportPath(repo);
  mkdirSync(dirname(file), { recursive: true });
  const temporary: string = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({ kept }, null, 2) + '\n');
  renameSync(temporary, file);
}

async function worktreeRemovable(repo: Repo, path: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const status: Result = await run(['git', '-C', path, 'status', '--porcelain'], repo.root);
  if (status.code !== 0) return { ok: false, reason: status.stderr || `git status exited ${status.code}` };
  if (status.stdout !== '') return { ok: false, reason: 'uncommitted changes' };
  const gitPath = async (name: string): Promise<string> =>
    resolve(path, await command(['git', '-C', path, 'rev-parse', '--git-path', name], repo.root));
  if (existsSync(await gitPath('rebase-merge')) || existsSync(await gitPath('rebase-apply')))
    return { ok: false, reason: 'rebase in progress' };
  for (const marker of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD'])
    if (existsSync(await gitPath(marker))) return { ok: false, reason: 'merge in progress' };
  const unreachable: Result = await run(
    ['git', '-C', path, 'rev-list', '--count', 'HEAD', '--not', '--branches', '--remotes'],
    repo.root,
  );
  const count: number = unreachable.code === 0 ? Number.parseInt(unreachable.stdout, 10) : Number.NaN;
  if (!Number.isSafeInteger(count) || count < 0)
    return { ok: false, reason: unreachable.stderr || `git rev-list exited ${unreachable.code}` };
  if (count > 0) return { ok: false, reason: `${count} unreachable commits` };
  return { ok: true };
}

function livePaneInside(live: Pane[], path: string): boolean {
  return live.some((pane) => pane.cwd !== null && within(pane.cwd, path));
}

// A pane parked at the worktree root in the leaf's own tab is the leaf's
// session being torn down, not a squatter; anything else inside blocks removal.
function foreignPaneInside(live: Pane[], path: string, tab: string | undefined): boolean {
  return live.some((pane) => pane.cwd !== null && within(pane.cwd, path) && (pane.cwd !== path || pane.tab_id !== tab));
}

function tabLive(live: Pane[], tab: string | undefined): boolean {
  return tab !== undefined && live.some((pane) => pane.tab_id === tab);
}

// Mirrors completeOwner: would the leaf's owner move to issues/closed this pass?
function ownerCompletes(repo: Repo, leaf: Leaf): boolean {
  const open: string = resolve(repo.root, 'issues/open');
  const issue: string = dirname(leaf.path);
  const issueLeaves: Leaf[] = leavesUnder(issue, open);
  if (!issueLeaves.every((item) => item.state.phase === 'merged')) return false;
  const parent: string = dirname(issue);
  const owner: string = basename(parent) === 'open' ? issue : parent;
  return (owner === issue ? issueLeaves : leavesUnder(owner, open)).every((item) => item.state.phase === 'merged');
}

const ownerSchema = z.object({
  pid: z.number().int(),
  boot_id: z.string(),
  started: z.string(),
});

function currentBoot(): string {
  const file: string = '/proc/sys/kernel/random/boot_id';
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !(error instanceof Error && 'code' in error && error.code === 'ESRCH');
  }
}

function ownerDead(owner: { pid: number; boot_id: string }): boolean {
  return !pidAlive(owner.pid) || (owner.boot_id !== '' && owner.boot_id !== currentBoot());
}

export async function closeMergedTab(repo: Repo, leaf: Leaf, live: Pane[] | null): Promise<boolean> {
  if ((await batchMemberSlugs(repo)).has(leaf.state.slug)) return false;
  if (leaf.state.tab === undefined || live === null) return false;
  const tab: string = leaf.state.tab;
  if (!live.some((pane) => pane.tab_id === tab)) return false;
  await command(['herdr', 'tab', 'close', tab]);
  return true;
}

// A pass only needs herdr when a pane-dependent candidate exists: a leaf
// worktree that is not plainly active under the store, a finished-leaf scratch
// dir, or anything else whose keep/remove choice needs live pane state.
export function reconcileNeedsPanes(repo: Repo, leaves: Leaf[]): boolean {
  const store: string = worktreeStore(repo);
  const oldRoot: string = resolve(repo.root, 'issues/worktrees');
  const memberSlugs: Set<string> = new Set(
    leaves.flatMap((leaf) => (leaf.state.batch?.members ?? []).map((member) => member.slug)),
  );
  for (const leaf of leaves) {
    if (leaf.state.phase === 'merged' || leaf.state.phase === 'failed') {
      if (existsSync(leafTemp(repo, leaf.state.slug))) return true;
    }
    const worktree: string | undefined = leaf.state.worktree;
    if (worktree === undefined || !existsSync(worktree)) continue;
    if (leaf.state.batch !== undefined || memberSlugs.has(leaf.state.slug)) continue;
    if (leaf.state.phase === 'merged' || leaf.state.phase === 'failed') return true;
    if (repo.config.worktree_root === undefined && !within(worktree, store) && within(worktree, oldRoot)) return true;
  }
  const recorded: Set<string> = new Set(
    leaves.flatMap((leaf) => (leaf.state.worktree === undefined ? [] : [leaf.state.worktree])),
  );
  return [store, oldRoot].some(
    (root) =>
      existsSync(root) &&
      readdirSync(root, { withFileTypes: true }).some(
        (entry) => entry.isDirectory() && !recorded.has(resolve(root, entry.name)),
      ),
  );
}

export async function reconcile(repo: Repo, leaves: Leaf[], live: Pane[] | null): Promise<Reconciled> {
  const removed: string[] = [];
  const kept: { path: string; reason: string }[] = [];
  const keep = (path: string, reason: string): void => {
    kept.push({ path, reason });
  };

  const listed: string = await command(['git', 'worktree', 'list', '--porcelain'], repo.root);
  const registered: Set<string> = new Set(
    listed
      .split('\n')
      .filter((line) => line.startsWith('worktree '))
      .map((line) => line.slice('worktree '.length)),
  );

  const store: string = worktreeStore(repo);
  const oldRoot: string = resolve(repo.root, 'issues/worktrees');
  const roots: string[] = [store, oldRoot];
  const underRoot = (path: string): boolean => roots.some((root) => path !== root && within(path, root));
  const openRoot: string = resolve(repo.root, 'issues/open');

  const knownSlugs: Set<string> = new Set();
  const collectSlugs = (path: string): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((entry) => entry.name === 'state.yaml')) {
      try {
        knownSlugs.add(readState(path).slug);
      } catch {
        // unreadable state.yaml protects nothing
      }
      return;
    }
    for (const entry of entries.filter((entry) => entry.isDirectory())) collectSlugs(resolve(path, entry.name));
  };
  for (const area of ['open', 'closed']) {
    const areaRoot: string = resolve(repo.root, 'issues', area);
    if (existsSync(areaRoot)) collectSlugs(areaRoot);
  }
  const leafSlugs: Set<string> = new Set(leaves.map((leaf) => leaf.state.slug));

  const batchAttempts: Set<string> = new Set(
    leaves.flatMap((leaf) => (leaf.state.batch === undefined ? [] : [leaf.state.batch.attempt])),
  );
  const memberSlugs: Set<string> = new Set(
    leaves.flatMap((leaf) => (leaf.state.batch?.members ?? []).map((member) => member.slug)),
  );
  const baseRuns: BaseRun[] = readBaseRuns(repo);
  const leafBySlug: Map<string, Leaf> = new Map(leaves.map((leaf) => [leaf.state.slug, leaf]));

  async function removeWorktree(path: string): Promise<boolean> {
    const verdict: { ok: true } | { ok: false; reason: string } = await worktreeRemovable(repo, path);
    if (!verdict.ok) {
      keep(path, verdict.reason);
      return false;
    }
    const result: Result = await run(['git', 'worktree', 'remove', path], repo.root);
    if (result.code !== 0) {
      keep(path, result.stderr || `git worktree remove exited ${result.code}`);
      return false;
    }
    removed.push(path);
    return true;
  }

  async function removeMergedWorktree(leaf: Leaf, worktree: string): Promise<void> {
    if (!(await removeWorktree(worktree))) return;
    saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
    const slug: string = leaf.state.slug;
    const branch: Result = await run(['git', 'show-ref', '--verify', '--quiet', `refs/heads/${slug}`], repo.root);
    if (branch.code === 0) {
      const dropped: Result = await run(['git', 'branch', '-d', slug], repo.root);
      if (dropped.code !== 0) keep(worktree, dropped.stderr || `git branch -d exited ${dropped.code}`);
    }
  }

  async function closeTab(worktree: string, tab: string): Promise<boolean> {
    const closed: Result = await run(['herdr', 'tab', 'close', tab]);
    if (closed.code === 0) return true;
    const detail: { code: string; message: string } = herdrError(closed);
    keep(worktree, detail.message === '' ? detail.code : detail.message);
    return false;
  }

  const handled: Set<string> = new Set();
  const panes: Pane[] = live ?? [];

  async function mergedWorktree(leaf: Leaf, worktree: string, open: boolean): Promise<void> {
    const tab: string | undefined = leaf.state.tab;
    if (live === null) {
      keep(worktree, 'pane list unavailable');
      return;
    }
    if (tabLive(panes, tab)) {
      const closed: boolean = await closeTab(worktree, z.string().parse(tab));
      if (open || !closed) {
        if (closed) keep(worktree, 'live pane inside');
        return;
      }
    } else if (open && ownerCompletes(repo, leaf)) {
      keep(worktree, 'active leaf');
      return;
    }
    if (foreignPaneInside(panes, worktree, tab)) {
      keep(worktree, 'live pane inside');
      return;
    }
    await removeMergedWorktree(leaf, worktree);
  }

  for (const leaf of leaves) {
    const state: State = leaf.state;
    const worktree: string | undefined = state.worktree;
    if (worktree === undefined) {
      if (
        state.phase === 'merged' &&
        state.batch === undefined &&
        !memberSlugs.has(state.slug) &&
        live !== null &&
        tabLive(panes, state.tab) &&
        !(within(leaf.path, openRoot) && ownerCompletes(repo, leaf))
      )
        await closeTab(leaf.path, z.string().parse(state.tab));
      continue;
    }
    handled.add(worktree);
    if (!existsSync(worktree)) {
      // A recorded path outside the repo's own area is kept: the checkout may
      // have moved, in which case the record is the only pointer left.
      if (within(worktree, repo.root) || within(worktree, store))
        saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
      else keep(worktree, 'unmanaged worktree');
      continue;
    }
    if (!registered.has(worktree)) {
      keep(worktree, 'unregistered worktree directory');
      continue;
    }
    if (state.batch !== undefined || memberSlugs.has(state.slug)) {
      keep(worktree, 'state.batch');
      continue;
    }
    if (state.phase === 'merged') {
      await mergedWorktree(leaf, worktree, within(leaf.path, openRoot));
      continue;
    }
    if (state.phase === 'failed') {
      if (live === null) {
        keep(worktree, 'pane list unavailable');
        continue;
      }
      if (tabLive(panes, state.tab) || foreignPaneInside(panes, worktree, state.tab)) {
        keep(worktree, 'live pane inside');
        continue;
      }
      if (await removeWorktree(worktree)) saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
      continue;
    }
    if (within(worktree, store)) {
      keep(worktree, 'active leaf');
      continue;
    }
    // Migration applies only to leaf worktrees recorded under the old in-repo
    // default root; any other outside-store record is an operator's setup.
    if (repo.config.worktree_root !== undefined || !within(worktree, oldRoot)) {
      keep(worktree, 'unmanaged worktree');
      continue;
    }
    if (live === null) {
      keep(worktree, 'pane list unavailable');
      continue;
    }
    if (livePaneInside(panes, worktree) || tabLive(panes, state.tab)) {
      keep(worktree, 'live pane inside');
      continue;
    }
    if (await removeWorktree(worktree)) saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
  }

  const candidates: Set<string> = new Set();
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true }))
      if (entry.isDirectory()) candidates.add(resolve(root, entry.name));
  }
  for (const path of registered) {
    if (path === repo.root || handled.has(path)) continue;
    if (!existsSync(path)) continue; // stale registration, pruned below when anything was removed
    if (underRoot(path)) candidates.add(path);
    else keep(path, 'unmanaged worktree');
  }
  for (const path of [...candidates].sort()) {
    if (!existsSync(path) || handled.has(path)) continue;
    const name: string = basename(path);
    const leaf: Leaf | undefined = leafBySlug.get(name);
    if (!leafSlugs.has(name) && knownSlugs.has(name)) {
      keep(path, 'unknown directory');
      continue;
    }
    if (!registered.has(path)) {
      keep(path, 'unknown directory');
      continue;
    }
    if (leaf !== undefined && leaf.state.worktree === undefined) {
      // A worktree the leaf will adopt on dispatch gets the leaf's own rules.
      if (leaf.state.phase === 'merged') {
        handled.add(path);
        await mergedWorktree(leaf, path, within(leaf.path, openRoot));
        continue;
      }
      if (leaf.state.phase === 'failed') {
        handled.add(path);
        if (live === null) keep(path, 'pane list unavailable');
        else if (tabLive(panes, leaf.state.tab) || foreignPaneInside(panes, path, leaf.state.tab))
          keep(path, 'live pane inside');
        else await removeWorktree(path);
        continue;
      }
      keep(path, 'active leaf');
      continue;
    }
    if (name.startsWith('base-')) {
      const record: BaseRun | undefined = baseRuns.find(
        (item) => item.run === name.slice('base-'.length) && item.removed === undefined,
      );
      if (record !== undefined) {
        if (record.end === undefined && !ownerDead({ pid: record.pid, boot_id: record.boot_id })) {
          keep(path, `base-run ${record.run} in progress`);
          continue;
        }
      }
    }
    if (name.startsWith('batch-') && batchAttempts.has(name.slice('batch-'.length))) {
      keep(path, 'state.batch');
      continue;
    }
    if (live === null) keep(path, 'pane list unavailable');
    else if (livePaneInside(panes, path)) keep(path, 'live pane inside');
    else await removeWorktree(path);
  }

  const scratchRoot: string = resolve(leafTemp(repo, 'x'), '..');
  if (existsSync(scratchRoot)) {
    const scratchByDir: Map<string, Leaf> = new Map(
      leaves.map((leaf) => [basename(leafTemp(repo, leaf.state.slug)), leaf]),
    );
    const checkoutScratch: string = basename(leafTemp(repo, 'checkout'));
    for (const entry of readdirSync(scratchRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir: string = resolve(scratchRoot, entry.name);
      const leaf: Leaf | undefined = scratchByDir.get(entry.name);
      if (leaf === undefined && entry.name !== checkoutScratch) keep(dir, 'unknown scratch directory');
      else if (leaf !== undefined && (leaf.state.phase === 'merged' || leaf.state.phase === 'failed')) {
        if (live === null) keep(dir, 'pane list unavailable');
        else if ((leaf.state.phase === 'merged' && tabLive(live, leaf.state.tab)) || livePaneInside(live, dir))
          keep(dir, 'live pane inside');
        else {
          rmSync(dir, { recursive: true, force: true });
          removed.push(dir);
          continue;
        }
      }
      for (const child of readdirSync(dir, { withFileTypes: true })) {
        if (!child.isDirectory() || !child.name.startsWith('run-')) continue;
        const runRoot: string = resolve(dir, child.name);
        const ownerFile: string = resolve(runRoot, '.owner');
        if (!existsSync(ownerFile)) {
          keep(runRoot, 'no .owner record');
          continue;
        }
        let owner: { pid: number; boot_id: string; started: string };
        try {
          owner = ownerSchema.parse(JSON.parse(readFileSync(ownerFile, 'utf8')));
        } catch {
          keep(runRoot, 'invalid .owner record');
          continue;
        }
        if (ownerDead(owner)) {
          rmSync(runRoot, { recursive: true, force: true });
          removed.push(runRoot);
        } else keep(runRoot, 'run in progress');
      }
    }
  }

  if (removed.length > 0) await command(['git', 'worktree', 'prune'], repo.root);
  writeKeptReport(repo, kept);
  return { removed, kept };
}
