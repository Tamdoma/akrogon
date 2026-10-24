import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  type Dirent,
  type Stats,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import {
  globalHome,
  leafTemp,
  leafTempRoot,
  retiredLeafTempRoot,
  target,
  within,
  worktreeStore,
  type Repo,
} from './config';
import { readVerifyRuns, type VerifyRun } from './verify';
import {
  broadcastPending,
  inventoryUnder,
  readState,
  repoInventory,
  saveState,
  type Inventory,
  type Leaf,
  type State,
} from './state';
import { cgroupRoot, leafSlice, ownSlices, procRoot, sessionBusAddress } from './scope';
import { liveRuns, liveStartTime, withAdmissionLock } from './admission';
import {
  CommandError,
  command,
  herdrArgv,
  herdrError,
  panes,
  repoSession,
  run,
  spawnCaptured,
  tabs,
  type Pane,
  type Result,
  type SessionPane,
  type SessionResolution,
  type Tab,
} from './shell';

export type Reconciled = { removed: string[]; kept: { path: string; reason: string; clears?: string }[] };

export type KeptEntry = { path: string; reason: string; clears?: string };

export type RemovedRecord = { path: string; head: string; rule: string; branch?: string };

type WorktreeRow = { head: string; branch?: string; locked: string | false };

const removedRecordSchema = z.strictObject({
  path: z.string(),
  head: z.string(),
  rule: z.string(),
  branch: z.string().optional(),
});

const keptReportSchema = z.strictObject({
  kept: z.array(z.strictObject({ path: z.string(), reason: z.string(), clears: z.string().optional() })),
  removed: z.array(removedRecordSchema).optional(),
});

export function keptReportPath(repo: Repo): string {
  return resolve(globalHome(), 'reconcile', `${repo.name}.json`);
}

function readReport(file: string): z.infer<typeof keptReportSchema> {
  let raw: string;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { kept: [] };
    throw error;
  }
  try {
    return keptReportSchema.parse(JSON.parse(raw));
  } catch (error) {
    throw new Error(`invalid kept report ${file}: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}

export function readKept(repo: Repo): KeptEntry[] {
  return readReport(keptReportPath(repo)).kept;
}

export function readRemoved(repo: Repo): RemovedRecord[] {
  return readReport(keptReportPath(repo)).removed ?? [];
}

// Entries naming paths that no longer exist carry no signal for anyone reading
// the report; unit names are not paths, so only absolute paths are pruned.
function writeKept(file: string, kept: KeptEntry[], removed?: RemovedRecord[]): void {
  mkdirSync(dirname(file), { recursive: true });
  const pruned: KeptEntry[] = kept.filter(
    (entry) => !entry.path.startsWith('/') || lstatSync(entry.path, { throwIfNoEntry: false }) !== undefined,
  );
  const temporary: string = `${file}.${process.pid}.tmp`;
  writeFileSync(
    temporary,
    JSON.stringify(removed === undefined ? { kept: pruned } : { kept: pruned, removed }, null, 2) + '\n',
  );
  renameSync(temporary, file);
}

function writeKeptReport(repo: Repo, kept: KeptEntry[], removed: RemovedRecord[]): void {
  writeKept(keptReportPath(repo), kept, removed);
}

const hostReportPath = (): string => resolve(globalHome(), 'reconcile-host.json');

export function readHostKept(): KeptEntry[] {
  return readReport(hostReportPath()).kept;
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

function broadcastInProgress(state: State, live: Pane[] | null): boolean {
  return (
    broadcastPending(state) ||
    (state.phase === 'merged' &&
      state.broadcast !== undefined &&
      (live === null ||
        live.some(
          (pane) => pane.pane_id === state.pane.B && pane.agent_status !== 'idle' && pane.agent_status !== 'done',
        )))
  );
}

// Why a leaf-matched slice survives this pass, or null when it may stop.
function sliceKeepReason(
  slice: string,
  leaf: Leaf,
  live: Pane[] | null,
  own: Set<string>,
  runs: Set<string>,
): string | null {
  if (own.has(slice)) return 'own slice';
  if (runs.has(slice)) return 'live run record';
  if (broadcastInProgress(leaf.state, live)) return 'broadcast in progress';
  if (leaf.state.tab === undefined && !finished(leaf)) return 'unfinished leaf';
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
function foreignPaneInside(live: Pane[], foreign: Pane[], path: string, tab: string | undefined): boolean {
  return (
    livePaneInside(foreign, path) ||
    live.some((pane) => pane.cwd !== null && within(pane.cwd, path) && (pane.cwd !== path || pane.tab_id !== tab))
  );
}

function tabLive(live: Pane[], tab: string | undefined): boolean {
  return tab !== undefined && live.some((pane) => pane.tab_id === tab);
}

// Mirrors completeOwner: would the leaf's owner move to issues/closed this
// pass? Any inventory failure inside the owner's subtree blocks it — an
// unproven owner never completes.
function ownerCompletes(repo: Repo, leaf: Leaf): boolean {
  const issue: string = dirname(leaf.path);
  const parent: string = dirname(issue);
  const owner: string = basename(parent) === 'open' ? issue : parent;
  const ownerInv: Inventory = inventoryUnder(repoInventory(repo), owner);
  if (ownerInv.unreadable.length + ownerInv.unknown.length + ownerInv.foreign.length > 0) return false;
  return ownerInv.leaves.every((item) => item.state.phase === 'merged');
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

function ownerKeeps(path: string): KeptEntry[] {
  const stat: Stats | undefined = lstatSync(path, { throwIfNoEntry: false });
  if (stat === undefined || stat.isSymbolicLink()) return [];
  const name: string = basename(path);
  const ownerFile: string | undefined = /^batch-.*\.owner$/.test(name)
    ? path
    : stat.isDirectory() && name.startsWith('batch-')
      ? `${path}.owner`
      : stat.isDirectory() && name.startsWith('run-')
        ? resolve(path, '.owner')
        : undefined;
  if (ownerFile !== undefined) {
    const owner: Owner | undefined = readOwner(ownerFile);
    if (owner !== undefined && !ownerDead(owner))
      return [{ path, reason: 'live owner', clears: 'removed once the owner exits' }];
    if (stat.isDirectory() && name.startsWith('run-') && owner === undefined) {
      if (existsSync(ownerFile))
        return [
          { path, reason: 'invalid .owner record', clears: 'repair the owner record so ownership can be checked' },
        ];
      const created: number = stat.birthtimeMs > 0 ? stat.birthtimeMs : stat.mtimeMs;
      if (Date.now() - created < 60_000)
        return [{ path, reason: 'run younger than 60s', clears: 'removed once it outlives the owner-record gap' }];
    }
  }
  return stat.isDirectory() ? readdirSync(path).flatMap((entry) => ownerKeeps(resolve(path, entry))) : [];
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

// The tab list and close run only in the session holding the repo workspace;
// a refused, missing or stopped-at-call session means nothing is touched.
export async function closeMergedTab(repo: Repo, leaf: Leaf, live: Pane[] | null): Promise<boolean> {
  if (leaf.state.tab === undefined || live === null || broadcastPending(leaf.state)) return false;
  const resolved: SessionResolution = await repoSession(repo);
  if (!resolved.ok) return false;
  const session: string = resolved.session.name;
  let seated: { panes: Pane[]; tabs: Tab[] };
  try {
    seated = {
      panes: await panes(session),
      tabs: await tabs(session),
    };
  } catch (error) {
    if (error instanceof CommandError && herdrError(error.result).code === 'server_not_running') return false;
    throw error;
  }
  const workspaceTabs: Set<string> = new Set(
    seated.tabs.filter((item) => item.workspace_id === resolved.workspace.workspace_id).map((item) => item.tab_id),
  );
  const seatedPanes: Pane[] = seated.panes.filter((pane) => workspaceTabs.has(pane.tab_id));
  const tab: string = leaf.state.tab;
  if (!workspaceTabs.has(tab) || broadcastInProgress(leaf.state, seatedPanes)) return false;
  // The recorded pane closes only inside the leaf's own seat tab: a member
  // pane whose cwd is inside the leaf worktree.
  const expected: string = leaf.state.worktree ?? resolve(worktreeStore(repo), leaf.state.slug);
  if (!seatedPanes.some((pane) => pane.tab_id === tab && pane.cwd !== null && within(pane.cwd, expected))) return false;
  await command(herdrArgv(['tab', 'close', tab], { session }));
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
  // A registered Claude agent worktree is a pane-dependent candidate. The
  // directory check stands in for listing registered worktree paths.
  const agentRoot: string = resolve(repo.root, '.claude/worktrees');
  if (
    existsSync(agentRoot) &&
    readdirSync(agentRoot).some((name) => name.startsWith('agent-') && existsSync(resolve(agentRoot, name)))
  )
    return true;
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
  // Any unrecorded entry — file, dir or link — can end up a pane-dependent
  // candidate (unowned veto, leaf-owned tab check, orphan .owner record).
  if (
    [store, oldRoot].some(
      (root) => existsSync(root) && readdirSync(root).some((name) => !recorded.has(resolve(root, name))),
    )
  )
    return true;
  // Anything inside a leaf's repo-hash dir is a candidate: leaf temps need tab
  // and slice judgement, strays and ownerless run dirs need the unowned veto.
  const tempDir: string = dirname(leafTemp(repo, 'x'));
  if (existsSync(tempDir) && readdirSync(tempDir).length > 0) return true;
  // A retired lock file is deletable only once panes are available.
  if (
    existsSync(resolve(repo.root, 'issues/.lock')) ||
    existsSync(
      resolve(repo.root, await command(['git', 'rev-parse', '--git-path', 'akrogon-base-runs.lock'], repo.root)),
    )
  )
    return true;
  // A leaf with a recorded tab can only be judged with live panes; a leaf
  // that is finished or has a recorded tab is a slice-stop candidate either
  // way, and an unreadable unit inventory forces the conservative fetch.
  if (
    leaves.some(
      (leaf) => (leaf.state.phase === 'merged' || leaf.state.phase === 'failed') && leaf.state.tab !== undefined,
    )
  )
    return true;
  const candidates: Leaf[] = leaves.filter((leaf) => finished(leaf) || leaf.state.tab !== undefined);
  if (candidates.length === 0) return false;
  const loaded: Set<string> | null = await loadedLeafSlices();
  if (loaded === null) return true;
  return candidates.some((leaf) => loaded.has(leafSlice(repo, leaf.state.slug)));
}

export async function reconcile(
  repo: Repo,
  leaves: Leaf[],
  live: Pane[] | null,
  union?: SessionPane[] | null,
  failures?: { ownedNames: ReadonlySet<string>; incomplete: boolean },
): Promise<Reconciled> {
  const removed: string[] = [];
  const removedWorktrees: RemovedRecord[] = [];
  const kept: KeptEntry[] = [];
  const keep = (path: string, reason: string, clears: string): void => {
    kept.push({ path, reason, clears });
  };

  const listed: string = await command(['git', 'worktree', 'list', '--porcelain'], repo.root);
  const registered: Map<string, WorktreeRow> = new Map(
    listed
      .split('\n\n')
      .filter((stanza) => stanza.startsWith('worktree '))
      .map((stanza): [string, WorktreeRow] => {
        const lines: string[] = stanza.split('\n');
        const branchLine: string | undefined = lines.find((line) => line.startsWith('branch refs/heads/'));
        const lockLine: string | undefined = lines.find((line) => line === 'locked' || line.startsWith('locked '));
        return [
          lines[0].slice('worktree '.length),
          {
            head: lines.find((line) => line.startsWith('HEAD '))!.slice('HEAD '.length),
            ...(branchLine === undefined ? {} : { branch: branchLine.slice('branch refs/heads/'.length) }),
            locked: lockLine === undefined ? false : lockLine.slice('locked '.length),
          },
        ];
      }),
  );

  const keepLocked = (path: string, locked: string): void =>
    keep(
      path,
      locked === '' ? 'locked worktree' : `locked worktree (${locked})`,
      'removed once the worktree is unlocked and the pass retries',
    );

  const store: string = worktreeStore(repo);
  const oldRoot: string = resolve(repo.root, 'issues/worktrees');
  const roots: string[] = [store, oldRoot];
  const underRoot = (path: string): boolean => roots.some((root) => path !== root && within(path, root));
  const openRoot: string = resolve(repo.root, 'issues/open');

  // A leaf folder that will not parse still owns its names: the folder
  // basename joins the slugs its worktree, tab and slice answer to.
  const leafSlugs: Set<string> = new Set(leaves.map((leaf) => leaf.state.slug));
  const knownSlugs: Set<string> = new Set([...leafSlugs, ...(failures?.ownedNames ?? [])]);

  const verifyRuns: VerifyRun[] = readVerifyRuns(repo);
  const leafBySlug: Map<string, Leaf> = new Map(leaves.map((leaf) => [leaf.state.slug, leaf]));

  // The slice step runs before leaf temp and unowned-item checks so a later
  // sweep in the same pass already sees stopped slices. A loaded leaf slice is
  // stopped outright — killing leftovers is the point — unless it is the
  // pass's own, a live run names it, or its tab cannot be proven gone.
  const loadedSlices: Set<string> | null = await loadedLeafSlices();
  const stoppedSlices: Set<string> = new Set();
  {
    const own: Set<string> = ownSlices();
    const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
    for (const leaf of leaves) {
      const slice: string = leafSlice(repo, leaf.state.slug);
      if (loadedSlices === null || !loadedSlices.has(slice)) continue;
      const reason: string | null = sliceKeepReason(slice, leaf, live, own, runs);
      if (reason !== null) {
        keep(slice, reason, 'removed once the pass, recorded run or live tab ends and pane inventory is available');
        continue;
      }
      const error: string | null = await stopSlice(slice);
      if (error === null) {
        removed.push(slice);
        stoppedSlices.add(slice);
      } else keep(slice, error, 'resolve the systemd stop error and retry cleanup');
    }
  }

  // `unlock` carries a git lock reason: present means the worktree is git
  // locked, unlocks after the veto and cleanliness checks, and re-locks with
  // that reason when the unlocked removal fails.
  async function removeWorktree(path: string, force: boolean, rule: string, unlock?: string): Promise<boolean> {
    const inside: number[] = pidsInside(targets(), path);
    if (inside.length > 0) {
      keep(
        path,
        `process ${inside.join(', ')} inside`,
        'removed once these processes close their files or leave this path',
      );
      return false;
    }
    const owners: KeptEntry[] = ownerKeeps(path);
    if (owners.length > 0) {
      kept.push(...owners);
      if (!owners.some((entry) => entry.path === path))
        keep(path, 'live owner inside', 'removed once contained owners clear');
      return false;
    }
    if (!force) {
      const verdict: { ok: true } | { ok: false; reason: string } = await worktreeRemovable(repo, path);
      if (!verdict.ok) {
        keep(
          path,
          verdict.reason,
          'resolve the Git status error, save changes and finish pending Git operations before retrying cleanup',
        );
        return false;
      }
    }
    if (unlock !== undefined) {
      const unlocked: Result = await run(['git', 'worktree', 'unlock', path], repo.root);
      if (unlocked.code !== 0) {
        keep(
          path,
          unlocked.stderr || `git worktree unlock exited ${unlocked.code}`,
          'resolve the Git unlock error and retry cleanup',
        );
        return false;
      }
    }
    const result: Result = await run(['git', 'worktree', 'remove', ...(force ? ['--force'] : []), path], repo.root);
    if (result.code !== 0) {
      // Best-effort re-lock: a remove that unregistered first has nothing to
      // lock, and the removal error is already the recorded keep reason.
      if (unlock !== undefined) await run(['git', 'worktree', 'lock', '--reason', unlock, path], repo.root);
      keep(
        path,
        result.stderr || `git worktree remove exited ${result.code}`,
        'resolve the Git removal error or worktree lock and retry cleanup',
      );
      return false;
    }
    removed.push(path);
    const row: WorktreeRow = registered.get(path)!;
    removedWorktrees.push({ path, head: row.head, rule, ...(row.branch === undefined ? {} : { branch: row.branch }) });
    return true;
  }

  async function removeMergedWorktree(leaf: Leaf, worktree: string): Promise<void> {
    if (!(await removeWorktree(worktree, false, 'merged leaf'))) return;
    saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
    const slug: string = leaf.state.slug;
    const branch: Result = await run(['git', 'show-ref', '--verify', '--quiet', `refs/heads/${slug}`], repo.root);
    if (branch.code === 0) {
      const dropped: Result = await run(['git', 'branch', '-d', slug], repo.root);
      if (dropped.code !== 0)
        keep(
          worktree,
          dropped.stderr || `git branch -d exited ${dropped.code}`,
          'resolve the branch deletion error and retry cleanup',
        );
    }
  }

  // A registered Claude Code agent worktree at <repo>/.claude/worktrees/agent-<id>
  // whose `claude agent` lock owner is provably dead — pid gone or start time
  // changed — and whose commits all landed on the target is removed and its
  // branch deleted bound to the proven head. Returns true when the path is an
  // agent candidate this rule handled (removed or vetoed); false falls the
  // caller through to today's `unmanaged worktree` keep. A /proc read error
  // counts as a live owner: an unprovable lock is honored, never bypassed.
  async function endedAgentWorktree(path: string): Promise<boolean> {
    const agentRoot: string = resolve(repo.root, '.claude/worktrees');
    if (dirname(path) !== agentRoot) return false;
    const id: string | undefined = basename(path).match(/^agent-([0-9a-z]+)$/)?.[1];
    if (id === undefined) return false;
    const row: WorktreeRow | undefined = registered.get(path);
    if (row === undefined || row.locked === false) return false;
    const lock: RegExpMatchArray | null = row.locked.match(
      /^claude agent agent-([0-9a-z]+) \(pid (\d+) start (\d+)\)$/,
    );
    if (lock === null || lock[1] !== id) return false;
    const released: boolean = ((): boolean => {
      try {
        return liveStartTime(Number(lock[2])) !== lock[3];
      } catch {
        return false;
      }
    })();
    if (!released) return false;
    if (row.branch === undefined || row.branch === repo.config.default_branch) return false;
    const targetRef: string = `refs/remotes/${target(repo)}`;
    const merges: Result = await run(
      ['git', '-C', path, 'rev-list', '--merges', '--count', `${targetRef}..HEAD`],
      repo.root,
    );
    if (merges.code !== 0 || Number.parseInt(merges.stdout.trim(), 10) !== 0) return false;
    const landed: Result = await run(['git', '-C', path, 'cherry', targetRef, 'HEAD'], repo.root);
    if (landed.code !== 0 || landed.stdout.split('\n').some((line) => line.startsWith('+'))) return false;
    if (live === null) {
      keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return true;
    }
    if (union === null) {
      keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return true;
    }
    if (livePaneInside(panesUnion, path)) {
      keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
      return true;
    }
    if (!(await removeWorktree(path, false, 'ended agent worktree', row.locked))) return true;
    const dropped: Result = await run(['git', 'update-ref', '-d', `refs/heads/${row.branch}`, row.head], repo.root);
    if (dropped.code !== 0) {
      const ref: Result = await run(['git', 'rev-parse', '--verify', `refs/heads/${row.branch}`], repo.root);
      if (ref.code === 0 && ref.stdout.trim() === row.head)
        keep(
          repo.root,
          `delete ${row.branch}: ${dropped.stderr || `git update-ref exited ${dropped.code}`}`,
          'resolve the ref error and delete the branch explicitly',
        );
    }
    return true;
  }

  // The repo's seat context for this pass: resolved session plus the tab ids
  // of the resolved workspace. Fetched once, lazily, and only when a close is
  // actually decided — a refused or dead session yields null, so nothing is
  // closed in a session that cannot be proven the repo's.
  let seat: { session: string; tabs: Set<string> } | null | undefined;
  const seatTabs = async (): Promise<{ session: string; tabs: Set<string> } | null> => {
    if (seat === undefined) {
      const resolved: SessionResolution = await repoSession(repo);
      if (!resolved.ok) {
        seat = null;
      } else {
        try {
          const listed: Tab[] = await tabs(resolved.session.name);
          seat = {
            session: resolved.session.name,
            tabs: new Set(
              listed.filter((item) => item.workspace_id === resolved.workspace.workspace_id).map((item) => item.tab_id),
            ),
          };
        } catch (error) {
          if (!(error instanceof CommandError) || herdrError(error.result).code !== 'server_not_running') throw error;
          seat = null;
        }
      }
    }
    return seat;
  };

  async function closeTab(worktree: string, tab: string, leaf: Leaf): Promise<boolean> {
    const seated: { session: string; tabs: Set<string> } | null = await seatTabs();
    if (seated === null) {
      keep(worktree, 'repo session unavailable', 'resolve the repo session refusal and retry cleanup');
      return false;
    }
    // A recorded tab closes only in the repo's workspace with a member pane
    // sitting in the leaf worktree; anything else is not this leaf's seat.
    if (!seated.tabs.has(tab)) return true;
    const expected: string = resolve(store, leaf.state.slug);
    if (!panes.some((pane) => pane.tab_id === tab && pane.cwd !== null && within(pane.cwd, expected))) return true;
    const closed: Result = await run(herdrArgv(['tab', 'close', tab], { session: seated.session }));
    if (closed.code === 0) return true;
    const detail: { code: string; message: string } = herdrError(closed);
    keep(
      worktree,
      detail.message === '' ? detail.code : detail.message,
      'resolve the Herdr tab-close error and retry cleanup',
    );
    return false;
  }

  const handled: Set<string> = new Set();
  const panes: Pane[] = live ?? [];
  const panesUnion: Pane[] = union === undefined ? panes : (union ?? []).map((entry) => entry.pane);
  const resolution: SessionResolution | null = union === undefined || union === null ? null : await repoSession(repo);
  const ownPanes: Pane[] =
    union === undefined
      ? panes
      : (union ?? [])
          .filter((entry) => resolution !== null && resolution.ok && entry.session === resolution.session.name)
          .map((entry) => entry.pane);
  const foreignPanes: Pane[] = (union ?? [])
    .filter((entry) => resolution === null || !resolution.ok || entry.session !== resolution.session.name)
    .map((entry) => entry.pane);
  // One /proc scan per pass, run only when a candidate reaches removal.
  let scanned: Map<number, string[]> | undefined;
  const targets = (): Map<number, string[]> => scanned ?? (scanned = procTargets());

  async function mergedWorktree(leaf: Leaf, worktree: string, open: boolean): Promise<void> {
    if (leaf.state.batch !== undefined) {
      keep(worktree, 'state.batch', 'removed once the leaf releases its merge batch');
      return;
    }
    const tab: string | undefined = leaf.state.tab;
    if (live === null) {
      keep(worktree, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return;
    }
    if (union === null) {
      keep(worktree, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return;
    }
    if (tabLive(panes, tab)) {
      const closed: boolean = await closeTab(worktree, z.string().parse(tab), leaf);
      if (open || !closed) {
        if (closed) keep(worktree, 'live pane inside', 'removed once the pane closes or leaves this path');
        return;
      }
    } else if (open && ownerCompletes(repo, leaf)) {
      keep(worktree, 'active leaf', 'removed once the owning leaf finishes');
      return;
    }
    if (foreignPaneInside(ownPanes, foreignPanes, worktree, tab)) {
      keep(worktree, 'live pane inside', 'removed once the pane closes or leaves this path');
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
        !broadcastInProgress(state, live) &&
        live !== null &&
        tabLive(panes, state.tab) &&
        !(within(leaf.path, openRoot) && ownerCompletes(repo, leaf))
      )
        await closeTab(leaf.path, z.string().parse(state.tab), leaf);
      continue;
    }
    handled.add(worktree);
    if (!existsSync(worktree)) {
      // A recorded path outside the repo's own area is kept: the checkout may
      // have moved, in which case the record is the only pointer left.
      if (within(worktree, repo.root) || within(worktree, store))
        saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
      else keep(worktree, 'unmanaged worktree', 'remove this worktree explicitly with git worktree remove');
      continue;
    }
    const row: WorktreeRow | undefined = registered.get(worktree);
    if (row === undefined) {
      keep(
        worktree,
        'unregistered worktree directory',
        'restore its worktree registration or remove the directory explicitly',
      );
      continue;
    }
    if (row.locked !== false) {
      keepLocked(worktree, row.locked);
      continue;
    }
    if (state.batch !== undefined) {
      keep(worktree, 'state.batch', 'removed once the leaf releases its merge batch');
      continue;
    }
    if (broadcastInProgress(state, live)) {
      keep(worktree, 'broadcast in progress', 'removed once the broadcast seat finishes');
      continue;
    }
    if (state.phase === 'merged') {
      await mergedWorktree(leaf, worktree, within(leaf.path, openRoot));
      continue;
    }
    if (state.phase === 'failed') {
      if (live === null) {
        keep(worktree, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (union === null) {
        keep(worktree, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (tabLive(panes, state.tab) || foreignPaneInside(ownPanes, foreignPanes, worktree, state.tab)) {
        keep(worktree, 'live pane inside', 'removed once the pane closes or leaves this path');
        continue;
      }
      if (await removeWorktree(worktree, false, 'failed leaf'))
        saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
      continue;
    }
    if (within(worktree, store)) {
      keep(worktree, 'active leaf', 'removed once the owning leaf finishes');
      continue;
    }
    // Migration applies only to leaf worktrees recorded under the old in-repo
    // default root; any other outside-store record is an operator's setup.
    if (!within(worktree, oldRoot)) {
      keep(worktree, 'unmanaged worktree', 'remove this worktree explicitly with git worktree remove');
      continue;
    }
    if (live === null) {
      keep(worktree, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      continue;
    }
    if (union === null) {
      keep(worktree, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
      continue;
    }
    if (livePaneInside(panesUnion, worktree) || tabLive(panes, state.tab)) {
      keep(worktree, 'live pane inside', 'removed once the pane closes or leaves this path');
      continue;
    }
    if (await removeWorktree(worktree, false, 'old-root migration'))
      saveState(leaf.path, { ...readState(leaf.path), worktree: undefined });
  }

  // Every new filesystem deletion goes through drop(): a failed rmSync is
  // recorded and a survivor is never claimed removed (D5, criterion 9).
  const drop = (path: string): void => {
    try {
      rmSync(path, { recursive: true, force: true });
    } catch (error) {
      keep(
        path,
        `delete failed: ${error instanceof Error ? error.message : String(error)}`,
        'resolve the filesystem error and retry cleanup',
      );
      return;
    }
    if (lstatSync(path, { throwIfNoEntry: false }) !== undefined)
      keep(path, 'delete failed: path still present', 'resolve the deletion failure and retry cleanup');
    else removed.push(path);
  };
  const dropChecked = (path: string): void => {
    if (live === null) {
      keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return;
    }
    if (union === null) {
      keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return;
    }
    if (livePaneInside(panesUnion, path)) {
      keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
      return;
    }
    const inside: number[] = pidsInside(targets(), path);
    if (inside.length > 0) {
      keep(
        path,
        `process ${inside.join(', ')} inside`,
        'removed once these processes close their files or leave this path',
      );
      return;
    }
    const owners: KeptEntry[] = ownerKeeps(path);
    if (owners.length > 0) {
      kept.push(...owners);
      if (!owners.some((entry) => entry.path === path))
        keep(path, 'live owner inside', 'removed once contained owners clear');
      return;
    }
    drop(path);
  };
  const repoRunning: boolean =
    leaves.some((leaf) => tabLive(panes, leaf.state.tab)) ||
    (
      await Promise.all(
        leaves.map(async (leaf): Promise<boolean> => {
          const slice: string = leafSlice(repo, leaf.state.slug);
          return (
            loadedSlices !== null &&
            loadedSlices.has(slice) &&
            !stoppedSlices.has(slice) &&
            (await sliceHasProcess(slice))
          );
        }),
      )
    ).some((running) => running);
  const dropUnowned = async (path: string): Promise<void> => {
    if (repoRunning) {
      keep(path, 'unowned entry', 'removed once no leaf of the repo is running');
      return;
    }
    dropChecked(path);
  };

  const candidates: Set<string> = new Set();
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) candidates.add(resolve(root, entry));
  }
  for (const path of registered.keys()) {
    if (path === repo.root || handled.has(path)) continue;
    if (!existsSync(path)) continue; // stale registration, pruned below when anything was removed
    if (underRoot(path)) candidates.add(path);
    else if (!(await endedAgentWorktree(path)))
      keep(path, 'unmanaged worktree', 'remove this worktree explicitly with git worktree remove');
  }
  // Longest known slug the entry name matches exactly or as <slug>-<rest>
  // (D1.2); undefined when no leaf record claims the name.
  const matchSlug = (name: string): string | undefined =>
    [...knownSlugs]
      .filter((slug) => name === slug || name.startsWith(`${slug}-`))
      .sort((a, b) => b.length - a.length)[0];

  for (const path of [...candidates].sort()) {
    if (lstatSync(path, { throwIfNoEntry: false }) === undefined || handled.has(path)) continue;
    const name: string = basename(path);
    const leaf: Leaf | undefined = leafBySlug.get(name);
    const row: WorktreeRow | undefined = registered.get(path);
    if (row !== undefined) {
      if (row.locked !== false) {
        keepLocked(path, row.locked);
        continue;
      }
      if (!leafSlugs.has(name) && knownSlugs.has(name)) {
        keep(path, 'unknown directory', 'removed once nothing inside references it');
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
          if (live === null) keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
          else if (union === null)
            keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
          else if (tabLive(panes, leaf.state.tab) || foreignPaneInside(ownPanes, foreignPanes, path, leaf.state.tab))
            keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
          else await removeWorktree(path, false, 'failed leaf');
          continue;
        }
        keep(path, 'active leaf', 'removed once the owning leaf finishes');
        continue;
      }
      // A delegated worker runs at <slug>-u<N> from the seat's own pane, so no pane sits inside it.
      const owner: Leaf | undefined =
        leaf === undefined && /-u\d+$/.test(name) ? leafBySlug.get(name.replace(/-u\d+$/, '')) : undefined;
      if (owner !== undefined && owner.state.phase !== 'merged' && owner.state.phase !== 'failed') {
        keep(path, 'active leaf worker', 'removed once the owning leaf finishes');
        continue;
      }
      if (owner === undefined && !name.startsWith('verify-') && !name.startsWith('batch-')) {
        keep(path, 'unmanaged worktree', 'remove this worktree explicitly with git worktree remove');
        continue;
      }
      let force: boolean = owner?.state.phase === 'merged';
      let rule: string = 'worker of finished leaf';
      if (name.startsWith('verify-')) {
        const record: VerifyRun | undefined = verifyRuns.find((item) => item.run === name.slice('verify-'.length));
        if (record !== undefined && record.end === undefined && !ownerDead(record)) {
          keep(path, `verify ${record.run} in progress`, 'removed once the verify owner exits');
          continue;
        }
        force = true;
        rule = 'ended verify';
      }
      if (name.startsWith('batch-')) {
        const record: Owner | undefined = readOwner(`${path}.owner`);
        if (record !== undefined && !ownerDead(record)) continue; // live builder owns this copy
        force = true;
        rule = existsSync(`${path}.owner`) ? 'dead batch owner' : 'unrecorded batch';
      }
      const scratchKind: boolean = owner !== undefined || name.startsWith('verify-') || name.startsWith('batch-');
      if (!scratchKind) {
        // Registered but no leaf or scratch kind claims it: an operator's
        // worktree parked in the store, never removed by the sweep (D1.1).
        keep(path, 'unmanaged worktree', 'remove this worktree explicitly with git worktree remove');
        continue;
      }
      if (live === null) {
        keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (union === null) {
        keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (livePaneInside(panesUnion, path)) {
        keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
        continue;
      }
      const inside: number[] = pidsInside(targets(), path);
      if (inside.length > 0) {
        keep(
          path,
          `process ${inside.join(', ')} inside`,
          'removed once these processes close their files or leave this path',
        );
        continue;
      }
      await removeWorktree(path, force, rule);
      continue;
    }

    // Unregistered entries (D1.2+): leaf-owned junk, orphan owner records,
    // dead-writer tmp files, then the unowned rule.
    const ownerSlug: string | undefined = matchSlug(name);
    const ownerLeaf: Leaf | undefined = ownerSlug === undefined ? undefined : leafBySlug.get(ownerSlug);
    if (ownerLeaf !== undefined) {
      // Leaf-owned junk (<slug>/<slug>-*) follows the leaf's tab, not git:
      // kept while the leaf runs, dropped once a finished owner's tab is gone.
      if (!finished(ownerLeaf)) {
        keep(path, 'active leaf', 'removed once the owning leaf finishes');
        continue;
      }
      if (live === null) {
        keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (union === null) {
        keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
        continue;
      }
      if (tabLive(panes, ownerLeaf.state.tab) || foreignPaneInside(ownPanes, foreignPanes, path, ownerLeaf.state.tab)) {
        keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
        continue;
      }
      dropChecked(path);
      continue;
    }
    if (ownerSlug !== undefined) {
      keep(path, 'unknown directory', 'restore readable leaf ownership or remove the unregistered entry explicitly');
      continue;
    }
    if (/^batch-.*\.owner$/.test(name) && !existsSync(path.slice(0, -'.owner'.length))) {
      // A batch-<id>.owner record with no copy directory is swept with the
      // copy's own rule: a live owner may precede a copy still being created,
      // a dead or unreadable one is dropped once panes are available (D1.3).
      const record: Owner | undefined = readOwner(path);
      if (record !== undefined && !ownerDead(record)) keep(path, 'live owner', 'removed once the owner exits');
      else if (live === null) keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      else if (union === null)
        keep(path, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
      else dropChecked(path);
      continue;
    }
    // Write-then-rename leftovers: only a dead writer's file is droppable.
    const tempMatch: RegExpMatchArray | null = name.match(/\.(\d+)\.tmp$/);
    if (tempMatch !== null && statSync(path, { throwIfNoEntry: false })?.isDirectory() !== true) {
      if (!pidAlive(Number(tempMatch[1]))) dropChecked(path);
      continue;
    }
    // The repo inventory is unprovable: an unclaimed entry may belong to a
    // leaf record the walk could not reach, so it is kept, never dropped.
    if (failures?.incomplete === true)
      keep(
        path,
        `leaf inventory unavailable: ${repo.name}`,
        'restore readable repository leaf records and retry cleanup',
      );
    else await dropUnowned(path);
  }

  const scratchRoot: string = dirname(leafTemp(repo, 'x'));
  if (existsSync(scratchRoot)) {
    const scratchByDir: Map<string, Leaf> = new Map(
      leaves.map((leaf) => [basename(leafTemp(repo, leaf.state.slug)), leaf]),
    );
    const ownTemps: Set<string> = new Set(['checkout', 'self-update'].map((slug) => basename(leafTemp(repo, slug))));
    for (const entry of readdirSync(scratchRoot, { withFileTypes: true })) {
      const dir: string = resolve(scratchRoot, entry.name);
      const leaf: Leaf | undefined = scratchByDir.get(entry.name);
      const keptBefore: number = kept.length;
      if (entry.isDirectory()) {
        const runEntries: Dirent[] = readdirSync(dir, { withFileTypes: true }).filter(
          (child) => child.isDirectory() && child.name.startsWith('run-'),
        );
        for (const child of runEntries) {
          const runRoot: string = resolve(dir, child.name);
          const refusalFile: string = resolve(runRoot, 'refusal.json');
          if (existsSync(refusalFile)) {
            let reason: string = 'publish refused';
            try {
              reason =
                'publish refused: ' +
                z.object({ reason: z.string() }).parse(JSON.parse(readFileSync(refusalFile, 'utf8'))).reason;
            } catch {
              // an unreadable refusal file still keeps the run root
            }
            keep(runRoot, reason, 'resolve the recorded publish refusal before removing the run');
            continue;
          }
          const ownerFile: string = resolve(runRoot, '.owner');
          if (!existsSync(ownerFile)) {
            // mkdtemp precedes the .owner write; birthtime measures that
            // window, mtime is the fallback where the filesystem reports none.
            const stat: Stats = statSync(runRoot);
            const created: number = stat.birthtimeMs > 0 ? stat.birthtimeMs : stat.mtimeMs;
            if (Date.now() - created < 60_000) {
              keep(runRoot, 'run younger than 60s', 'removed once it outlives the owner-record gap');
            } else await dropUnowned(runRoot);
            continue;
          }
          const owner: Owner | undefined = readOwner(ownerFile);
          if (owner === undefined) {
            keep(runRoot, 'invalid .owner record', 'repair the owner record so ownership can be checked');
            continue;
          }
          if (ownerDead(owner)) drop(runRoot);
          else keep(runRoot, 'run in progress', 'removed once the run owner exits');
        }
        if (leaf !== undefined) {
          // A leaf's temp lives only while its seat or a check uses it. Only
          // finished leaves report what stays; a finished leaf's temp also
          // stays while its slice still holds a running unit (D2).
          const done: boolean = finished(leaf);
          if (broadcastInProgress(leaf.state, live))
            keep(dir, 'broadcast in progress', 'removed once the broadcast seat finishes');
          else if (live === null) {
            if (done) keep(dir, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
          } else if (union === null) {
            if (done) keep(dir, 'pane union unavailable', 'restore the Herdr pane inventory and retry cleanup');
          } else if (tabLive(live, leaf.state.tab) || livePaneInside(panesUnion, dir)) {
            if (done) keep(dir, 'live pane inside', 'removed once the pane closes or leaves this path');
          } else if (kept.length === keptBefore) {
            // An unreadable unit inventory is no proof of a busy slice, so the
            // temp is kept for every phase instead of falling to dropChecked.
            if (loadedSlices === null) {
              keep(dir, 'unit list unavailable', 'restore the systemd unit inventory and retry cleanup');
              continue;
            }
            const slice: string = leafSlice(repo, leaf.state.slug);
            if (
              loadedSlices !== null &&
              loadedSlices.has(slice) &&
              !stoppedSlices.has(slice) &&
              (await sliceHasProcess(slice))
            )
              keep(dir, 'slice holds a running unit', 'removed once the unit exits');
            else {
              dropChecked(dir);
              continue;
            }
          }
          continue;
        }
      }
      if (ownTemps.has(entry.name)) {
        // checkout/self-update dirs are akrogon's own: they stay while a kept
        // run or a registered worktree inside proves use, else idle-swept (D2).
        if (kept.length === keptBefore && ![...registered.keys()].some((path) => within(path, dir)))
          await dropUnowned(dir);
        continue;
      }
      if (kept.length === keptBefore) await dropUnowned(dir);
    }
    // An emptied repo-hash dir is itself junk.
    if (existsSync(scratchRoot) && readdirSync(scratchRoot).length === 0) dropChecked(scratchRoot);
  }

  // Prune on any removal: rmSync'd scratch dirs can hold inner worktrees whose
  // stale registrations only this pass clears.

  // Retired repo-side locks, exact names only: deleted when no process holds
  // them open and the pane list is available (D4).
  if (live !== null && union !== null)
    for (const lock of [
      resolve(repo.root, await command(['git', 'rev-parse', '--git-path', 'akrogon-base-runs.lock'], repo.root)),
      resolve(repo.root, 'issues/.lock'),
    ]) {
      if (!existsSync(lock)) continue;
      const inside: number[] = pidsInside(targets(), lock);
      if (inside.length > 0)
        keep(lock, `process ${inside.join(', ')} inside`, 'removed once these processes close the lock');
      else dropChecked(lock);
    }

  if (removed.length > 0) await command(['git', 'worktree', 'prune'], repo.root);
  writeKeptReport(repo, kept, removedWorktrees);
  return { removed, kept };
}

// One host-wide step per pass: every loaded akrogon-l*.slice across all
// registered repos (open and closed leaf records) plus failed akrogon-run-*
// units. A slice matching a finished leaf follows the same rule as the per-repo
// step; a slice matching no leaf at all is stopped only when its cgroupfs
// subtree holds no process. A leaf-matched slice is stopped only for a repo in
// `acting`, the repos this pass reconciled; leaf-tab judgements read that
// repo's resolved session through panesForRepo while the filesystem veto keeps
// the cross-session panesOnce union.
export async function reconcileHost(
  repos: Repo[],
  acting: ReadonlySet<string>,
  live: Pane[] | null,
  panesOnce: () => Promise<Pane[] | null>,
  panesForRepo: (repo: Repo) => Promise<Pane[] | null>,
): Promise<void> {
  const kept: KeptEntry[] = [];
  const keep = (unit: string, reason: string, clears: string): void => {
    kept.push({ path: unit, reason, clears });
  };
  let panes: Pane[] | null = live;
  let fetched: boolean = live !== null;
  const livePanes = async (): Promise<Pane[] | null> => {
    if (!fetched) {
      panes = await panesOnce();
      fetched = true;
    }
    return panes;
  };
  // Per-repo pane views, fetched lazily and memoized so one session is read once.
  const repoPanes: Map<string, Promise<Pane[] | null>> = new Map();
  const repoView = (repo: Repo): Promise<Pane[] | null> => {
    const cached: Promise<Pane[] | null> | undefined = repoPanes.get(repo.name);
    if (cached !== undefined) return cached;
    const fetchedRepo: Promise<Pane[] | null> = panesForRepo(repo);
    repoPanes.set(repo.name, fetchedRepo);
    return fetchedRepo;
  };
  // One /proc scan per pass, run only when a candidate reaches removal.
  let scanned: Map<number, string[]> | undefined;
  const targets = (): Map<number, string[]> => scanned ?? (scanned = procTargets());
  const loaded: Set<string> | null = await loadedLeafSlices();
  const failedRuns: Set<string> | null = await loadedUnits('akrogon-run-*', '--failed');
  if (loaded !== null) {
    const leafOf: Map<string, { repo: Repo; leaf: Leaf }> = new Map();
    // An unreadable leaf's folder basename is the only name its slice still
    // answers to; matching slices are kept, not stopped.
    const badSlices: Set<string> = new Set();
    const inventoryErrors: string[] = [];
    for (const repo of repos) {
      const inventory: Inventory = repoInventory(repo);
      for (const leaf of inventory.leaves) leafOf.set(leafSlice(repo, leaf.state.slug), { repo, leaf });
      for (const failure of inventory.unreadable) {
        badSlices.add(leafSlice(repo, basename(failure.path)));
        inventoryErrors.push(`${failure.path}: ${failure.error}`);
      }
      for (const failure of inventory.unknown) inventoryErrors.push(`${failure.path}: ${failure.error}`);
      for (const leaf of inventory.foreign) {
        badSlices.add(leafSlice(repo, basename(leaf.path)));
        inventoryErrors.push(
          `${leaf.path}: leaf repo mismatch, stored key "${leaf.stored}", registered key "${repo.name}"`,
        );
      }
    }
    const own: Set<string> = ownSlices();
    const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
    for (const slice of [...loaded].sort()) {
      const match: { repo: Repo; leaf: Leaf } | undefined = leafOf.get(slice);
      if (match !== undefined) {
        const view: Pane[] | null = match.leaf.state.tab === undefined ? panes : await repoView(match.repo);
        const reason: string | null = sliceKeepReason(slice, match.leaf, view, own, runs);
        if (reason !== null) {
          keep(slice, reason, 'removed once the pass, recorded run or live tab ends and pane inventory is available');
          continue;
        }
        if (!acting.has(match.repo.name)) {
          keep(slice, 'repo not reconciled by this pass', 'removed by a pass for that repo from its own herdr session');
          continue;
        }
        const error: string | null = await stopSlice(slice);
        if (error !== null) keep(slice, error, 'resolve the systemd stop error and retry cleanup');
        continue;
      }
      if (badSlices.has(slice)) {
        keep(
          slice,
          `unreadable leaf state: ${inventoryErrors.join('; ')}`,
          'restore the leaf state file and retry cleanup',
        );
        continue;
      }
      if (own.has(slice)) {
        keep(slice, 'own slice', 'removed by a later pass outside this slice');
        continue;
      }
      if (inventoryErrors.length > 0) {
        keep(
          slice,
          `leaf inventory unavailable: ${inventoryErrors.join('; ')}`,
          'restore readable repository leaf records and retry cleanup',
        );
        continue;
      }
      if (runs.has(slice)) {
        keep(slice, 'live run record', 'removed once the recorded run exits');
        continue;
      }
      if (await sliceHasProcess(slice)) {
        keep(slice, 'process inside', 'removed once the processes in this slice exit');
        continue;
      }
      const error: string | null = await stopSlice(slice);
      if (error !== null) keep(slice, error, 'resolve the systemd stop error and retry cleanup');
    }
  }
  if (failedRuns !== null)
    for (const unit of [...failedRuns].sort()) {
      const result: Result = await systemctl('reset-failed', unit);
      if (result.code !== 0)
        keep(
          unit,
          result.stderr || `systemctl reset-failed exited ${result.code}`,
          'resolve the systemd reset-failed error and retry cleanup',
        );
    }

  // Host filesystem sweep (D6): retired temp root, unregistered worktree-store
  // and leaf-temp repo dirs, temp-root strays, runs/last-start, dead-pid tmp
  // files and retired global locks. Every deletion needs panes available and
  // no pane cwd or process inside; dead-pid tmp files need neither.
  const dropPath = async (path: string, isDir: boolean): Promise<void> => {
    const view: Pane[] | null = await livePanes();
    if (view === null) {
      keep(path, 'pane list unavailable', 'restore the Herdr pane inventory and retry cleanup');
      return;
    }
    if (isDir && livePaneInside(view, path)) {
      keep(path, 'live pane inside', 'removed once the pane closes or leaves this path');
      return;
    }
    const inside: number[] = pidsInside(targets(), path);
    if (inside.length > 0) {
      keep(
        path,
        `process ${inside.join(', ')} inside`,
        'removed once these processes close their files or leave this path',
      );
      return;
    }
    const owners: KeptEntry[] = ownerKeeps(path);
    if (owners.length > 0) {
      kept.push(...owners);
      if (!owners.some((entry) => entry.path === path))
        keep(path, 'live owner inside', 'removed once contained owners clear');
      return;
    }
    try {
      rmSync(path, { recursive: true, force: true });
    } catch (error) {
      keep(
        path,
        `delete failed: ${error instanceof Error ? error.message : String(error)}`,
        'resolve the filesystem error and retry cleanup',
      );
      return;
    }
    if (lstatSync(path, { throwIfNoEntry: false }) !== undefined)
      keep(path, 'delete failed: path still present', 'resolve the deletion failure and retry cleanup');
  };

  const retired: string = retiredLeafTempRoot();
  if (lstatSync(retired, { throwIfNoEntry: false }) !== undefined) await dropPath(retired, true);

  // ~/.akrogon/worktrees/<name> for an unregistered name is a store dir with
  // no repo behind it: dropped unless a child still holds a .git worktree.
  const home: string = globalHome();
  const repoNames: Set<string> = new Set(repos.map((repo) => repo.name));
  const storeRoot: string = resolve(homedir(), '.akrogon/worktrees');
  if (existsSync(storeRoot))
    for (const entry of readdirSync(storeRoot)) {
      if (repoNames.has(entry)) continue;
      const dir: string = resolve(storeRoot, entry);
      const stat: Stats | undefined = lstatSync(dir, { throwIfNoEntry: false });
      if (stat === undefined || !stat.isDirectory()) {
        await dropPath(dir, false);
        continue;
      }
      const hasWorktree: boolean = readdirSync(dir, { withFileTypes: true }).some(
        (child) => child.isDirectory() && existsSync(resolve(dir, child.name, '.git')),
      );
      if (hasWorktree) keep(dir, 'unregistered repo', 'removed once its last worktree goes');
      else await dropPath(dir, true);
    }

  // Strays directly under the leaf temp root; repo-hash dirs of registered
  // repos are skipped because the repo pass owns them.
  const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
  const repoHashes: Set<string> = new Set(repos.map((repo) => hex(repo.root).slice(0, 4)));
  const root: string = leafTempRoot();
  if (existsSync(root))
    for (const entry of readdirSync(root)) {
      const dir: string = resolve(root, entry);
      const tempMatch: RegExpMatchArray | null = entry.match(/\.(\d+)\.tmp$/);
      if (tempMatch !== null) {
        if (!pidAlive(Number(tempMatch[1]))) await dropPath(dir, false);
        continue;
      }
      const stat: Stats | undefined = lstatSync(dir, { throwIfNoEntry: false });
      if (stat === undefined) continue;
      if (stat.isDirectory() && repoHashes.has(entry)) continue;
      await dropPath(dir, stat.isDirectory());
    }

  // <file>.<pid>.tmp under globalHome, runs/ and reconcile/ with a dead pid.
  for (const parent of [home, resolve(home, 'runs'), resolve(home, 'reconcile')]) {
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent)) {
      const tempMatch: RegExpMatchArray | null = entry.match(/\.(\d+)\.tmp$/);
      if (tempMatch === null || pidAlive(Number(tempMatch[1]))) continue;
      await dropPath(resolve(parent, entry), false);
    }
  }
  const lastStart: string = resolve(home, 'runs/last-start');
  if (existsSync(lastStart)) await dropPath(lastStart, false);

  // Retired locks by exact name: held open by no live process means free.
  const retiredLockDir: string = resolve(homedir(), '.akrogon');
  for (const lock of [resolve(retiredLockDir, 'run.lock'), resolve(retiredLockDir, 'framework-tests.lock')]) {
    if (!existsSync(lock)) continue;
    const inside: number[] = pidsInside(targets(), lock);
    if (inside.length > 0)
      keep(lock, `process ${inside.join(', ')} inside`, 'removed once these processes close the lock');
    else await dropPath(lock, false);
  }

  writeKept(hostReportPath(), kept);
}
