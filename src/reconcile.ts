import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  type Dirent,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, leafTemp, within, worktreeStore, type Repo } from './config';
import { readVerifyRuns, type VerifyRun } from './verify';
import { allLeaves, leavesUnder, readState, saveState, type Leaf, type State } from './state';
import { cgroupRoot, leafSlice, ownSlices, procRoot, sessionBusAddress } from './scope';
import { liveRuns, withAdmissionLock } from './admission';
import { command, herdrError, run, spawnCaptured, type Pane, type Result } from './shell';

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

function writeKept(file: string, kept: { path: string; reason: string }[]): void {
  mkdirSync(dirname(file), { recursive: true });
  const temporary: string = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({ kept }, null, 2) + '\n');
  renameSync(temporary, file);
}

function writeKeptReport(repo: Repo, kept: { path: string; reason: string }[]): void {
  writeKept(keptReportPath(repo), kept);
}

const hostReportPath = (): string => resolve(globalHome(), 'reconcile-host.json');

export function readHostKept(): { path: string; reason: string }[] {
  try {
    return keptReportSchema.parse(JSON.parse(readFileSync(hostReportPath(), 'utf8'))).kept;
  } catch {
    return [];
  }
}

// The manager's bus address is pinned because callers inside a run-check cut
// DBUS_SESSION_BUS_ADDRESS; a spawn failure counts as a failed call, never a throw.
async function systemctl(...args: string[]): Promise<Result> {
  try {
    return await spawnCaptured(['systemctl', '--user', ...args], {
      env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
    });
  } catch (error) {
    return { code: 1, stdout: '', stderr: error instanceof Error ? error.message : String(error) };
  }
}

// Loaded units matching a pattern; null means the manager could not be asked,
// which callers treat as "stop nothing" rather than "nothing is loaded".
async function loadedUnits(pattern: string, ...extra: string[]): Promise<Set<string> | null> {
  const result: Result = await systemctl('list-units', ...extra, pattern, '--output=json');
  if (result.code !== 0) return null;
  try {
    return new Set(
      z
        .array(z.object({ unit: z.string() }))
        .parse(JSON.parse(result.stdout))
        .map((row) => row.unit),
    );
  } catch {
    return null;
  }
}

const loadedLeafSlices = (): Promise<Set<string> | null> => loadedUnits('akrogon-l*.slice', '--all');

async function sliceControlGroup(slice: string): Promise<string | null> {
  const result: Result = await systemctl('show', slice, '-p', 'ControlGroup', '--value');
  const group: string = result.stdout.trim();
  return result.code === 0 && group !== '' ? group : null;
}

// cgroup.procs files under the slice's cgroupfs subtree; an unreadable subtree
// is treated as occupied so an unprovable slice is never stopped.
function subtreeHasProcess(root: string): boolean {
  let entries: Dirent[];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return true;
  }
  for (const entry of entries) {
    const path: string = join(root, entry.name);
    if (entry.isDirectory() && subtreeHasProcess(path)) return true;
    if (entry.name === 'cgroup.procs')
      try {
        if (readFileSync(path, 'utf8').trim() !== '') return true;
      } catch {
        return true;
      }
  }
  return false;
}

async function sliceHasProcess(slice: string): Promise<boolean> {
  const group: string | null = await sliceControlGroup(slice);
  if (group === null) return true;
  return subtreeHasProcess(join(cgroupRoot(), group));
}

// Why a finished leaf's slice survives this pass, or null when it may stop.
function sliceKeepReason(
  slice: string,
  leaf: Leaf,
  live: Pane[] | null,
  own: Set<string>,
  runs: Set<string>,
): string | null {
  if (own.has(slice)) return 'own slice';
  if (runs.has(slice)) return 'live run record';
  if (leaf.state.tab !== undefined) {
    if (live === null) return 'pane list unavailable';
    if (tabLive(live, leaf.state.tab)) return 'live tab';
  }
  return null;
}

async function stopSlice(slice: string): Promise<string | null> {
  return withAdmissionLock(slice, async (): Promise<string | null> => {
    if (liveRuns().some((record) => record.slice === slice)) return 'live run record';
    const result: Result = await systemctl('stop', slice);
    return result.code === 0 ? null : result.stderr || `systemctl stop exited ${result.code}`;
  });
}

const finished = (leaf: Leaf): boolean => leaf.state.phase === 'merged' || leaf.state.phase === 'failed';

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

export type Owner = z.infer<typeof ownerSchema>;

export function readOwner(path: string): Owner | undefined {
  try {
    return ownerSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
  } catch {
    return undefined;
  }
}

export function writeOwner(path: string): void {
  const record: Owner = { pid: process.pid, boot_id: currentBoot(), started: new Date().toISOString() };
  const temporary: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(record) + '\n');
  renameSync(temporary, path);
}

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

function readProc<T>(read: () => T): T | undefined {
  try {
    return read();
  } catch (error) {
    const code: string | undefined = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT' && code !== 'EACCES' && code !== 'EPERM') throw error;
    return undefined;
  }
}

// One scan of this uid's processes: pid to the targets of its cwd and open
// fds. Unreadable entries and dead pids are skipped; fd targets like
// "socket:[123]" that never resolve simply match no path.
function procTargets(): Map<number, string[]> {
  const targets: Map<number, string[]> = new Map();
  for (const entry of readdirSync(procRoot(), { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const pid: number = Number(entry.name);
    if (!pidAlive(pid)) continue;
    const dir: string = resolve(procRoot(), entry.name);
    if (readProc(() => statSync(dir).uid) !== process.getuid!()) continue;
    const fds: string[] = readProc(() => readdirSync(resolve(dir, 'fd'))) ?? [];
    const found: (string | undefined)[] = [
      readProc(() => readlinkSync(resolve(dir, 'cwd'))),
      ...fds.map((fd) => readProc(() => readlinkSync(resolve(dir, 'fd', fd)))),
    ];
    targets.set(
      pid,
      found.filter((target) => target !== undefined),
    );
  }
  return targets;
}

function pidsInside(targets: Map<number, string[]>, path: string): number[] {
  return [...targets.entries()].filter(([, found]) => found.some((target) => within(target, path))).map(([pid]) => pid);
}

export function processesInside(paths: string[]): Set<string> {
  const targets: Map<number, string[]> = procTargets();
  return new Set(paths.filter((path) => pidsInside(targets, path).length > 0));
}

export async function closeMergedTab(repo: Repo, leaf: Leaf, live: Pane[] | null): Promise<boolean> {
  if (leaf.state.tab === undefined || live === null) return false;
  const tab: string = leaf.state.tab;
  if (!live.some((pane) => pane.tab_id === tab)) return false;
  await command(['herdr', 'tab', 'close', tab]);
  return true;
}

// A pass only needs herdr when a pane-dependent candidate exists: a leaf
// worktree that is not plainly active under the store, a finished-leaf scratch
// dir, a finished leaf whose recorded tab or loaded slice must be checked
// against live panes, or anything else whose keep/remove choice needs live pane
// state.
export async function reconcileNeedsPanes(repo: Repo, leaves: Leaf[]): Promise<boolean> {
  const store: string = worktreeStore(repo);
  const oldRoot: string = resolve(repo.root, 'issues/worktrees');
  for (const leaf of leaves) {
    if (existsSync(leafTemp(repo, leaf.state.slug))) return true;
    const worktree: string | undefined = leaf.state.worktree;
    if (worktree === undefined || !existsSync(worktree)) continue;
    if (leaf.state.batch !== undefined) continue;
    if (leaf.state.phase === 'merged' || leaf.state.phase === 'failed') return true;
    if (!within(worktree, store) && within(worktree, oldRoot)) return true;
  }
  const recorded: Set<string> = new Set(
    leaves.flatMap((leaf) => (leaf.state.worktree === undefined ? [] : [leaf.state.worktree])),
  );
  if (
    [store, oldRoot].some(
      (root) =>
        existsSync(root) &&
        readdirSync(root, { withFileTypes: true }).some(
          (entry) => entry.isDirectory() && !recorded.has(resolve(root, entry.name)),
        ),
    )
  )
    return true;
  // A finished leaf with a recorded tab can only be judged with live panes; a
  // finished leaf with a loaded slice is a stop candidate either way, and an
  // unreadable unit inventory forces the conservative fetch.
  const finishedLeaves: Leaf[] = leaves.filter(finished);
  if (finishedLeaves.some((leaf) => leaf.state.tab !== undefined)) return true;
  if (finishedLeaves.length === 0) return false;
  const loaded: Set<string> | null = await loadedLeafSlices();
  if (loaded === null) return true;
  return finishedLeaves.some((leaf) => loaded.has(leafSlice(repo, leaf.state.slug)));
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

  const verifyRuns: VerifyRun[] = readVerifyRuns(repo);
  const leafBySlug: Map<string, Leaf> = new Map(leaves.map((leaf) => [leaf.state.slug, leaf]));

  // The slice step runs before leaf temp and unowned-item checks so a later
  // sweep in the same pass already sees stopped slices. A finished leaf's slice
  // is stopped outright — killing leftovers is the point — unless it is the
  // pass's own, a live run names it, or its tab cannot be proven gone.
  {
    const loaded: Set<string> | null = await loadedLeafSlices();
    const own: Set<string> = ownSlices();
    const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
    for (const leaf of leaves) {
      if (!finished(leaf)) continue;
      const slice: string = leafSlice(repo, leaf.state.slug);
      if (loaded === null || !loaded.has(slice)) continue;
      const reason: string | null = sliceKeepReason(slice, leaf, live, own, runs);
      if (reason !== null) {
        keep(slice, reason);
        continue;
      }
      const error: string | null = await stopSlice(slice);
      if (error === null) removed.push(slice);
      else keep(slice, error);
    }
  }

  async function removeWorktree(path: string, force: boolean): Promise<boolean> {
    if (!force) {
      const verdict: { ok: true } | { ok: false; reason: string } = await worktreeRemovable(repo, path);
      if (!verdict.ok) {
        keep(path, verdict.reason);
        return false;
      }
    }
    const result: Result = await run(['git', 'worktree', 'remove', ...(force ? ['--force'] : []), path], repo.root);
    if (result.code !== 0) {
      keep(path, result.stderr || `git worktree remove exited ${result.code}`);
      return false;
    }
    removed.push(path);
    return true;
  }

  async function removeMergedWorktree(leaf: Leaf, worktree: string): Promise<void> {
    if (!(await removeWorktree(worktree, false))) return;
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
  // One /proc scan per pass, run only when a candidate reaches removal.
  let scanned: Map<number, string[]> | undefined;
  const targets = (): Map<number, string[]> => scanned ?? (scanned = procTargets());

  async function mergedWorktree(leaf: Leaf, worktree: string, open: boolean): Promise<void> {
    if (leaf.state.batch !== undefined) {
      keep(worktree, 'state.batch');
      return;
    }
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
    if (state.batch !== undefined) {
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
      if (await removeWorktree(worktree, false)) saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
      continue;
    }
    if (within(worktree, store)) {
      keep(worktree, 'active leaf');
      continue;
    }
    // Migration applies only to leaf worktrees recorded under the old in-repo
    // default root; any other outside-store record is an operator's setup.
    if (!within(worktree, oldRoot)) {
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
    if (await removeWorktree(worktree, false)) saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
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
        else await removeWorktree(path, false);
        continue;
      }
      keep(path, 'active leaf');
      continue;
    }
    // A delegated worker runs at <slug>-u<N> from the seat's own pane, so no pane sits inside it.
    const owner: Leaf | undefined =
      leaf === undefined && /-u\d+$/.test(name) ? leafBySlug.get(name.replace(/-u\d+$/, '')) : undefined;
    if (owner !== undefined && owner.state.phase !== 'merged' && owner.state.phase !== 'failed') {
      keep(path, 'active leaf worker');
      continue;
    }
    let force: boolean = owner?.state.phase === 'merged';
    if (name.startsWith('verify-')) {
      const record: VerifyRun | undefined = verifyRuns.find((item) => item.run === name.slice('verify-'.length));
      if (record !== undefined && record.end === undefined && !ownerDead(record)) {
        keep(path, `verify ${record.run} in progress`);
        continue;
      }
      force = true;
    }
    if (name.startsWith('batch-')) {
      const record: Owner | undefined = readOwner(`${path}.owner`);
      if (record !== undefined && !ownerDead(record)) continue; // live builder owns this copy
      force = true;
    }
    if (live === null) {
      keep(path, 'pane list unavailable');
      continue;
    }
    if (livePaneInside(panes, path)) {
      keep(path, 'live pane inside');
      continue;
    }
    const inside: number[] = pidsInside(targets(), path);
    if (inside.length > 0) {
      keep(path, `process ${inside.join(', ')} inside`);
      continue;
    }
    await removeWorktree(path, force);
  }

  // A batch-<id>.owner record with no copy directory is swept with the copy's
  // own rule: a live owner may precede a copy still being created, a dead or
  // unreadable one is dropped.
  if (existsSync(store))
    for (const entry of readdirSync(store, { withFileTypes: true })) {
      if (!entry.isFile() || !/^batch-.*\.owner$/.test(entry.name)) continue;
      const file: string = resolve(store, entry.name);
      if (existsSync(resolve(store, entry.name.slice(0, -'.owner'.length)))) continue;
      const record: Owner | undefined = readOwner(file);
      if (record !== undefined && !ownerDead(record)) continue;
      rmSync(file, { force: true });
      removed.push(file);
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
      const runEntries: Dirent[] = readdirSync(dir, { withFileTypes: true }).filter(
        (child) => child.isDirectory() && child.name.startsWith('run-'),
      );
      const keptBefore: number = kept.length;
      for (const child of runEntries) {
        const runRoot: string = resolve(dir, child.name);
        const refusalFile: string = resolve(runRoot, 'refusal.json');
        if (existsSync(refusalFile)) {
          let reason: string = 'publish refused';
          try {
            reason = 'publish refused: ' + z.object({ reason: z.string() }).parse(JSON.parse(readFileSync(refusalFile, 'utf8'))).reason;
          } catch {
            // an unreadable refusal file still keeps the run root
          }
          keep(runRoot, reason);
          continue;
        }
        const ownerFile: string = resolve(runRoot, '.owner');
        if (!existsSync(ownerFile)) {
          keep(runRoot, 'no .owner record');
          continue;
        }
        const owner: Owner | undefined = readOwner(ownerFile);
        if (owner === undefined) {
          keep(runRoot, 'invalid .owner record');
          continue;
        }
        if (ownerDead(owner)) {
          rmSync(runRoot, { recursive: true, force: true });
          removed.push(runRoot);
        } else keep(runRoot, 'run in progress');
      }
      if (leaf === undefined && entry.name !== checkoutScratch) keep(dir, 'unknown scratch directory');
      else if (leaf !== undefined) {
        // A leaf's temp lives only while its seat or a check uses it. Only finished leaves report what stays.
        const finished: boolean = leaf.state.phase === 'merged' || leaf.state.phase === 'failed';
        if (live === null) {
          if (finished) keep(dir, 'pane list unavailable');
        } else if (tabLive(live, leaf.state.tab) || livePaneInside(live, dir)) {
          if (finished) keep(dir, 'live pane inside');
        } else if (kept.length === keptBefore) {
          rmSync(dir, { recursive: true, force: true });
          removed.push(dir);
          continue;
        }
      }
    }
  }

  if (removed.length > 0) await command(['git', 'worktree', 'prune'], repo.root);
  writeKeptReport(repo, kept);
  return { removed, kept };
}

// One host-wide step per pass: every loaded akrogon-l*.slice across all
// registered repos (open and closed leaf records) plus failed akrogon-run-*
// units. A slice matching a finished leaf follows the same rule as the per-repo
// step; a slice matching no leaf at all is stopped only when its cgroupfs
// subtree holds no process. panesOnce is asked only when a tab has to be judged.
export async function reconcileHost(
  repos: Repo[],
  live: Pane[] | null,
  panesOnce: () => Promise<Pane[] | null>,
): Promise<void> {
  const kept: { path: string; reason: string }[] = [];
  const keep = (unit: string, reason: string): void => {
    kept.push({ path: unit, reason });
  };
  const loaded: Set<string> | null = await loadedLeafSlices();
  const failedRuns: Set<string> | null = await loadedUnits('akrogon-run-*', '--failed');
  if (loaded !== null) {
    const leafOf: Map<string, { repo: Repo; leaf: Leaf }> = new Map();
    const inventoryErrors: string[] = [];
    for (const repo of repos)
      try {
        for (const leaf of allLeaves(repo)) leafOf.set(leafSlice(repo, leaf.state.slug), { repo, leaf });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        inventoryErrors.push(`${repo.name}: ${error.message}`);
      }
    const own: Set<string> = ownSlices();
    const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
    let panes: Pane[] | null = live;
    let fetched: boolean = live !== null;
    const livePanes = async (): Promise<Pane[] | null> => {
      if (!fetched) {
        panes = await panesOnce();
        fetched = true;
      }
      return panes;
    };
    for (const slice of [...loaded].sort()) {
      const match: { repo: Repo; leaf: Leaf } | undefined = leafOf.get(slice);
      if (match !== undefined && !finished(match.leaf)) continue;
      if (match !== undefined) {
        const view: Pane[] | null = match.leaf.state.tab === undefined ? panes : await livePanes();
        const reason: string | null = sliceKeepReason(slice, match.leaf, view, own, runs);
        if (reason !== null) {
          keep(slice, reason);
          continue;
        }
        const error: string | null = await stopSlice(slice);
        if (error !== null) keep(slice, error);
        continue;
      }
      if (own.has(slice)) {
        keep(slice, 'own slice');
        continue;
      }
      if (inventoryErrors.length > 0) {
        keep(slice, `leaf inventory unavailable: ${inventoryErrors.join('; ')}`);
        continue;
      }
      if (runs.has(slice)) {
        keep(slice, 'live run record');
        continue;
      }
      if (await sliceHasProcess(slice)) {
        keep(slice, 'process inside');
        continue;
      }
      const error: string | null = await stopSlice(slice);
      if (error !== null) keep(slice, error);
    }
  }
  if (failedRuns !== null)
    for (const unit of [...failedRuns].sort()) {
      const result: Result = await systemctl('reset-failed', unit);
      if (result.code !== 0) keep(unit, result.stderr || `systemctl reset-failed exited ${result.code}`);
    }
  writeKept(hostReportPath(), kept);
}
