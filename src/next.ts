import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
  type Dirent,
} from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import { z } from 'zod';
import { parse } from 'shell-quote';
import {
  readGlobal,
  readRepo,
  currentRepo,
  commonDirectory,
  globalHome,
  expandPath,
  base,
  within,
  seats,
  worktreeStore,
  ensureLeafTemp,
  type Repo,
  type GlobalConfig,
  type SlotConfig,
} from './config';
import {
  readState,
  saveState,
  allLeaves,
  validateLeafDepth,
  missingLeafMessage,
  findLeaf,
  withLock,
  type Batch,
  type Tool,
  type Leaf,
  type State,
} from './state';
import { requiredSlots, routing, type Phase, type Slot } from './routing';
import {
  herdr,
  panes,
  tabs,
  workspaces,
  paneSchema,
  tabSchema,
  command,
  run,
  CommandError,
  quote,
  retryable,
  herdrError,
  type Pane,
  type Tab,
  type Result,
  type Workspace,
} from './shell';
import { checkBase, localBase, trackingRef } from './preflight';
import { checkLocation } from './guard';
import { attemptId, applyTop, branchSha, buildStack, isAncestor, memberBase, removeEmptyUntrackedDirs } from './batch';
import { commitMove, completeOwner } from './phase';
import { appendAttempt, readPressure, resolveTools, type PressureSnapshot } from './attempts';
import { sessionFile, deliveredAfter } from './session-file';
import { readLog } from './log';
import { isPaused, readPaused } from './pause';
import { isStopped } from './stop';
import { selfUpdate } from './self-update';
import { blockDetail, dependentCounts, mergeQueue, type DepDetail, type QueueEntry } from './turn';
import { appendTiming, currentVisit, readTimings, recordWait, type WaitReason } from './timing';
import { closeMergedTab, reconcile, reconcileHost, reconcileNeedsPanes } from './reconcile';
import { adoptShell, inOwnScope, leafSlice, type ScopePlace } from './scope';

const hookEventSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('pane_agent_status_changed'),
    data: z.object({
      type: z.literal('pane_agent_status_changed'),
      pane_id: z.string(),
      agent_status: paneSchema.shape.agent_status,
    }),
  }),
  z.object({
    event: z.literal('pane_exited'),
    data: z.object({ type: z.literal('pane_exited'), pane_id: z.string() }),
  }),
  z.object({
    event: z.literal('pane_closed'),
    data: z.object({ type: z.literal('pane_closed'), pane_id: z.string() }),
  }),
  z.object({
    event: z.literal('tab_closed'),
    data: z.object({ type: z.literal('tab_closed'), tab_id: z.string() }),
  }),
]);

type HookEvent = z.infer<typeof hookEventSchema>;

type Invocation = { skipped: Set<string>; dispatched: Set<string> };
type Inventory = { leaves: Leaf[]; unreadable: number; unknown: boolean; foreign: { path: string; stored: string }[] };
type DispatchOutcome = 'completed' | 'waiting' | 'skipped';

function herdrDetail(error: unknown): string {
  if (error instanceof CommandError) {
    const { code, message } = herdrError(error.result);
    return message === '' ? code : `${code} ${message}`;
  }
  return error instanceof Error ? error.message : String(error);
}

function report(invocation: Invocation, repo: string, path: string, error: Error, slug?: string): void {
  const key: string = `${repo}/${path}`;
  const identity: string = `${repo}/slug:${slug}`;
  if (invocation.skipped.has(key) || (slug !== undefined && invocation.skipped.has(identity))) return;
  invocation.skipped.add(key);
  if (slug !== undefined) invocation.skipped.add(identity);
  console.error(JSON.stringify({ repo, path, ...(slug === undefined ? {} : { slug }), error: error.message }));
}

function discover(repo: Repo, invocation: Invocation): Inventory {
  const result: Inventory = { leaves: [], unreadable: 0, unknown: false, foreign: [] };
  function visit(path: string, areaRoot: string): void {
    let entries: Dirent[];
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, path, error);
      result.unknown = true;
      return;
    }
    if (entries.some((entry) => entry.name === 'state.yaml')) {
      try {
        validateLeafDepth(areaRoot, path);
        const state: State = readState(path);
        if (state.repo !== repo.name) result.foreign.push({ path, stored: state.repo });
        else result.leaves.push({ path, state });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        report(invocation, repo.name, path, error);
        result.unreadable += 1;
      }
      return;
    }
    for (const entry of entries.filter((entry) => entry.isDirectory())) visit(resolve(path, entry.name), areaRoot);
  }
  for (const area of ['open', 'closed']) {
    const path: string = resolve(repo.root, 'issues', area);
    try {
      if (statSync(path, { throwIfNoEntry: false }) !== undefined) visit(path, path);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, path, error);
      result.unknown = true;
    }
  }
  const slugs: Set<string> = new Set();
  const duplicates: Set<string> = new Set();
  for (const leaf of result.leaves) {
    if (slugs.has(leaf.state.slug)) duplicates.add(leaf.state.slug);
    slugs.add(leaf.state.slug);
  }
  for (const leaf of result.leaves.filter((leaf) => duplicates.has(leaf.state.slug))) {
    report(invocation, repo.name, leaf.path, new Error(`Duplicate leaf slug: ${leaf.state.slug}`));
    result.unreadable += 1;
  }
  if (result.foreign.length > 0 && !invocation.skipped.has(repo.name)) {
    invocation.skipped.add(repo.name);
    for (const entry of result.foreign) invocation.skipped.add(`${repo.name}/${entry.path}`);
    console.error(
      JSON.stringify({
        repo: repo.name,
        path: result.foreign[0].path,
        error: `Foreign leaves in repo "${repo.name}": ${result.foreign.length} leaves stored under other keys`,
        count: result.foreign.length,
        paths: result.foreign,
      }),
    );
  }
  return { ...result, leaves: result.leaves.filter((leaf) => !duplicates.has(leaf.state.slug)) };
}

function registeredRepos(global: GlobalConfig, invocation: Invocation): { repos: Repo[]; unknown: boolean } {
  const repos: Repo[] = [];
  let unknown: boolean = false;
  for (const [name, path] of Object.entries(global.repos)) {
    try {
      repos.push(readRepo(name, path));
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, name, expandPath(path, globalHome()), error);
      unknown = true;
    }
  }
  return { repos, unknown };
}

function inWorktree(cwd: string | null, leaf: Leaf): boolean {
  return cwd !== null && leaf.state.worktree !== undefined && within(cwd, leaf.state.worktree);
}

function ownsPane(leaf: Leaf, pane: Pane | undefined, paneId: string): boolean {
  return Object.values(leaf.state.pane).includes(paneId) || (pane !== undefined && inWorktree(pane.cwd, leaf));
}

function busy(pane: Pane): boolean {
  return pane.agent_status === 'working' || pane.agent_status === 'blocked' || pane.agent_status === 'unknown';
}
function idle(pane: Pane): boolean {
  return pane.agent_status === 'idle' || pane.agent_status === 'done';
}

const STALL_MS: number = 60 * 60 * 1000;
const PROMPT_GRACE_MS: number = 2 * 60 * 1000;

async function observeBusy(path: string, state: State, seat: Slot, pane: Pane, now: number): Promise<State> {
  if (pane.agent === null || idle(pane)) {
    if (state.busy_since[seat] === undefined && state.busy_notified[seat] === undefined) return state;
    const cleared: State = {
      ...state,
      busy_since: { ...state.busy_since, [seat]: undefined },
      busy_notified: { ...state.busy_notified, [seat]: undefined },
    };
    saveState(path, cleared);
    return cleared;
  }
  if (!busy(pane)) return state;
  const since: string = state.busy_since[seat] ?? new Date(now).toISOString();
  const observed: State = { ...state, busy_since: { ...state.busy_since, [seat]: since } };
  if (state.busy_since[seat] === undefined) saveState(path, observed);
  const elapsed: number = now - Date.parse(since);
  if (elapsed <= STALL_MS || observed.busy_notified[seat] !== undefined) return observed;
  const minutes: number = Math.floor(elapsed / 60000);
  await command([
    'herdr',
    'notification',
    'show',
    `Busy leaf: ${state.repo}/${state.slug} seat ${seat} ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`,
  ]);
  const notified: State = {
    ...observed,
    busy_notified: { ...observed.busy_notified, [seat]: new Date(now).toISOString() },
  };
  saveState(path, notified);
  return notified;
}

async function currentPane(id: string): Promise<Pane> {
  return (await herdr(['pane', 'get', id], z.object({ pane: paneSchema }))).pane;
}

function launch(global: GlobalConfig, repo: Repo, slot: Slot, leafPath?: string): { kind: string; args: string[] } {
  const config: SlotConfig = seats(global, repo, leafPath)[slot === 'A' ? 'a' : 'b'];
  const line: string = global.harnesses[config.harness]
    .replaceAll('{model}', quote(config.model))
    .replaceAll('{effort}', quote(config.effort));
  const argv: string[] = z.array(z.string()).min(1).parse(parse(line));
  if (argv[0] !== config.harness) throw new Error(`Harness launch must start with ${config.harness}`);
  return { kind: config.harness, args: argv.slice(1) };
}

export async function createSparseWorktree(
  repo: Repo,
  path: string,
  ref: string,
  opts: { detach?: boolean; branch?: string },
): Promise<void> {
  checkLocation(path);
  let added: boolean = false;
  try {
    await command(
      [
        'git',
        'worktree',
        'add',
        '--no-checkout',
        ...(opts.detach === true ? ['--detach'] : []),
        ...(opts.branch === undefined ? [] : ['-b', opts.branch]),
        path,
        ref,
      ],
      repo.root,
    );
    added = true;
    await command(['git', '-C', path, 'sparse-checkout', 'set', '--no-cone', '/*', '!/issues/'], repo.root);
    await command(['git', '-C', path, 'checkout'], repo.root);
  } catch (error) {
    if (added) await command(['git', 'worktree', 'remove', '--force', path], repo.root);
    throw error;
  }
}

async function ensureWorktree(repo: Repo, leaf: Leaf, live: boolean): Promise<State> {
  const path: string = resolve(worktreeStore(repo), leaf.state.slug);
  if (leaf.state.worktree !== undefined && leaf.state.worktree !== path)
    throw new Error(
      `Worktree path mismatch: recorded "${leaf.state.worktree}", expected "${path}". Move the worktree to the expected path and reconcile Git metadata and state.worktree, or restore the previous repository/worktree root.`,
    );
  if (existsSync(path)) {
    if (realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], path)) !== realpathSync(path))
      throw new Error(`Not a worktree root: ${path}`);
    const expectedCommon: string = resolve(
      repo.root,
      await command(['git', 'rev-parse', '--git-common-dir'], repo.root),
    );
    const actualCommon: string = resolve(path, await command(['git', 'rev-parse', '--git-common-dir'], path));
    if (realpathSync(expectedCommon) !== realpathSync(actualCommon)) throw new Error(`Unrelated worktree: ${path}`);
  } else {
    const branch: Result = await run(
      ['git', 'show-ref', '--verify', '--quiet', `refs/heads/${leaf.state.slug}`],
      repo.root,
    );
    if (branch.code !== 0 && branch.code !== 1)
      throw new CommandError(['git', 'show-ref', leaf.state.slug], repo.root, branch);
    await createSparseWorktree(repo, path, branch.code === 0 ? leaf.state.slug : trackingRef(repo), {
      branch: branch.code === 0 ? undefined : leaf.state.slug,
    });
  }
  const wrote: boolean = await writeLeafEnv(repo, path, live);
  const state: State = {
    ...leaf.state,
    worktree: path,
    env_names: wrote ? repo.config.env : leaf.state.env_names,
    env_generation:
      wrote && leaf.state.worktree !== undefined ? leaf.state.env_generation + 1 : leaf.state.env_generation,
  };
  saveState(leaf.path, state);
  return state;
}

async function writeLeafEnv(repo: Repo, worktree: string, live: boolean): Promise<boolean> {
  const link: string = resolve(worktree, '.env');
  const tracked: Result = await run(['git', 'ls-files', '--error-unmatch', '.env'], worktree);
  if (tracked.code === 0) throw new Error(`Refusing .env write at ${link}: path is tracked by git`);
  if (tracked.code !== 1) throw new CommandError(['git', 'ls-files', '--error-unmatch', '.env'], worktree, tracked);
  const ignored: Result = await run(['git', 'check-ignore', '-q', '.env'], worktree);
  if (ignored.code === 1) throw new Error(`Refusing .env write at ${link}: path is not ignored by git`);
  if (ignored.code !== 0) throw new CommandError(['git', 'check-ignore', '-q', '.env'], worktree, ignored);
  const ignoredAtRoot: Result = await run(['git', 'check-ignore', '-q', '.env'], repo.root);
  if (ignoredAtRoot.code === 1)
    throw new Error(`Refusing .env write at ${link}: path is not ignored in the registered checkout ${repo.root}`);
  if (ignoredAtRoot.code !== 0) throw new CommandError(['git', 'check-ignore', '-q', '.env'], repo.root, ignoredAtRoot);
  if (live) return false;
  await emitEnvFile(repo, worktree, repo.config.env);
  return true;
}

export async function emitEnvFile(repo: Repo, worktree: string, names: string[]): Promise<void> {
  const link: string = resolve(worktree, '.env');
  const root: string = resolve(repo.root, '.env');
  const text: string = existsSync(root) ? readFileSync(root, 'utf8') : '';
  const parsed: Record<string, string | undefined> = parseEnv(text);
  const missing: string[] = names.filter((name) => parsed[name] === undefined);
  if (missing.length > 0)
    throw new Error(`Refusing .env write at ${link}: missing declared names in ${root}: ${missing.join(', ')}`);
  // parseEnv grammar (probe-verified): unquoted values end at # or a line edge
  // and a leading quote char opens quoting; single quotes and backticks are
  // verbatim except a literal \r (normalized to \n); double quotes unescape
  // \n and \r only (\\ stays literal). Emission reproduces the parsed value.
  // Emit the first encoding the same parseEnv reparses to the parsed value.
  // The candidate is sandwiched between context lines so an unclosed quote
  // that would swallow a neighbour also fails the check. Refusal can only
  // fire for a value no encoding round-trips.
  const context: string[] = ["Z1='x'", 'Z2="x"', 'Z3=`x`', 'Z4=x', "Y1='x'", 'Y2="x"', 'Y3=`x`', 'Y4=x'];
  const emit = (name: string, v: string): string | null => {
    const candidates: string[] = [
      v,
      `'${v}'`,
      `\`${v}\``,
      `"${v.replace(/\r/g, '\\r')}"`,
      `"${v.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}"`,
    ];
    for (const c of candidates) {
      const lines: string[] = [...context.slice(0, 4), `KEY=${c}`, ...context.slice(4)];
      const check: Record<string, string | undefined> = parseEnv(lines.join('\n') + '\n');
      const keys: string[] = Object.keys(check);
      if (keys.length === 9 && keys.every((k) => check[k] === (k === 'KEY' ? v : 'x'))) return `${name}=${c}`;
    }
    return null;
  };
  const emitted: (string | null)[] = names.map((name) => emit(name, parsed[name]!));
  const unwritable: string[] = names.filter((_, i) => emitted[i] === null);
  if (unwritable.length > 0)
    throw new Error(`Refusing .env write at ${link}: unwritable declared values in ${root}: ${unwritable.join(', ')}`);
  const content: string = emitted.length > 0 ? emitted.join('\n') + '\n' : '';
  const rewritten: Record<string, string | undefined> = parseEnv(content);
  const differing: string[] = names.filter((name) => rewritten[name] !== parsed[name]);
  if (differing.length > 0)
    throw new Error(`Refusing .env write at ${link}: unwritable declared values in ${root}: ${differing.join(', ')}`);
  const gitDir: string = resolve(worktree, await command(['git', 'rev-parse', '--git-dir'], worktree));
  const temp: string = resolve(gitDir, `akrogon-env-${process.pid}`);
  writeFileSync(temp, content, { mode: 0o600 });
  renameSync(temp, link);
}

async function activeCount(global: GlobalConfig, invocation: Invocation): Promise<number> {
  const live: Pane[] = await panes();
  const registered: ReturnType<typeof registeredRepos> = registeredRepos(global, invocation);
  let total: number = registered.unknown ? global.max_active : 0;
  const active = (leaf: Leaf): boolean =>
    leaf.state.phase !== 'merged' &&
    leaf.state.phase !== 'failed' &&
    live.some((pane) => pane.tab_id === leaf.state.tab || inWorktree(pane.cwd, leaf));
  for (const repo of registered.repos) {
    const inventory: Inventory = discover(repo, invocation);
    total += inventory.unknown ? global.max_active : inventory.leaves.filter(active).length + inventory.unreadable;
  }
  return total;
}

async function allocate(global: GlobalConfig, repo: Repo, leaf: Leaf, invocation: Invocation): Promise<State | null> {
  const slice: string = leafSlice(repo, leaf.state.slug);
  const listed: Pane[] = await panes();
  const recorded: string[] = [leaf.state.pane.A, leaf.state.pane.B].filter(
    (id): id is string => id !== undefined && listed.some((pane) => pane.pane_id === id),
  );
  let closed: boolean = false;
  for (const id of recorded) {
    const place: ScopePlace = await inOwnScope(slice, id);
    if (place.place === 'unreadable')
      throw new Error(`Cannot read the scope of pane ${id} for leaf ${leaf.state.slug}: ${place.error}`);
    if (place.place === 'outside') {
      await herdr(['pane', 'close', id], z.object({}));
      closed = true;
    }
  }
  const live: Pane[] = closed ? await panes() : listed;
  const liveTabs: Tab[] = await tabs();
  const expected: Leaf = {
    ...leaf,
    state: { ...leaf.state, worktree: resolve(worktreeStore(repo), leaf.state.slug) },
  };
  const matches: Tab[] = liveTabs.filter(
    (tab) =>
      tab.tab_id === leaf.state.tab ||
      (tab.label === leaf.state.slug &&
        live.some((pane) => pane.tab_id === tab.tab_id && inWorktree(pane.cwd, expected))),
  );
  if (matches.length > 1) throw new Error(`Multiple tabs for leaf: ${leaf.state.slug}`);
  if (matches.length === 0) {
    const total: number = await activeCount(global, invocation);
    if (total >= global.max_active) return null;
  }
  const state: State = await ensureWorktree(repo, leaf, matches.length === 1);
  const scratch: string = ensureLeafTemp(repo, state.slug);
  const worktree: string = z.string().parse(state.worktree);
  const workspace: Workspace | undefined = (await workspaces()).find((item) => item.label === repo.name);
  if (workspace === undefined) throw new Error(`No herdr workspace labeled ${repo.name}`);
  const placement: string[] = [
    '--cwd',
    worktree,
    '--env',
    `AKROGON_BASE=${await base(repo, worktree)}`,
    '--env',
    'GIT_EDITOR=true',
    '--env',
    `TMPDIR=${scratch}`,
    '--env',
    'NODE_DISABLE_COMPILE_CACHE=1',
    '--no-focus',
  ];
  const target: string[] = ['--workspace', workspace.workspace_id];
  const tab: Tab =
    matches.length === 1
      ? matches[0]
      : (await herdr(['tab', 'create', '--label', state.slug, ...placement, ...target], z.object({ tab: tabSchema })))
          .tab;
  const tabState: State = { ...state, tab: tab.tab_id };
  saveState(leaf.path, tabState);
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === tab.tab_id);
  if (members.length === 0) throw new Error(`Expected at least one pane in ${tab.tab_id}`);
  const recordedA: Pane | undefined = members.find((pane) => pane.pane_id === state.pane.A);
  const recordedB: Pane | undefined = members.find((pane) => pane.pane_id === state.pane.B);
  const bootstrap: boolean = matches.length === 0 || (state.pane.A === undefined && state.pane.B === undefined);
  const repairB: Pane | undefined = !bootstrap && recordedA === undefined ? recordedB : undefined;
  const first: Pane =
    recordedA ??
    (bootstrap
      ? members[0]
      : (
          await herdr(
            ['pane', 'split', (recordedB ?? members[0]).pane_id, '--direction', 'right', ...placement],
            z.object({ pane: paneSchema }),
          )
        ).pane);
  // Boxed before any save records it, so a later throw never leaves an unboxed recorded pane.
  async function box(pane: Pane): Promise<void> {
    const place: ScopePlace = await inOwnScope(slice, pane.pane_id);
    if (place.place === 'unreadable')
      throw new Error(`Cannot read the scope of pane ${pane.pane_id} for leaf ${state.slug}: ${place.error}`);
    if (place.place === 'inside') return;
    await adoptShell(slice, pane.pane_id);
    // StartTransientUnit returns once systemd queues the job, so the shell lands in its scope a moment later.
    const deadline: number = Date.now() + 5000;
    let adopted: ScopePlace = await inOwnScope(slice, pane.pane_id);
    while (adopted.place === 'outside' && Date.now() < deadline) {
      await Bun.sleep(50);
      adopted = await inOwnScope(slice, pane.pane_id);
    }
    if (adopted.place !== 'inside')
      throw new Error(
        `Pane ${pane.pane_id} for leaf ${state.slug} is not in its own scope after adoption: ${adopted.place === 'outside' ? adopted.cgroup : adopted.error}`,
      );
  }
  await box(first);
  if (repairB !== undefined) {
    saveState(leaf.path, { ...tabState, pane: { A: first.pane_id, B: repairB.pane_id } });
    const prev: string | undefined = (await tabs()).find((tab) => tab.focused === true)?.tab_id;
    async function restoreFocus(): Promise<void> {
      if (prev !== undefined && prev !== tab.tab_id) await herdr(['tab', 'focus', prev], z.object({}));
    }
    try {
      const swapped = await herdr(
        ['pane', 'swap', '--source-pane', repairB.pane_id, '--target-pane', first.pane_id],
        z.object({ changed: z.boolean() }),
      );
      if (swapped.changed !== true) throw new Error('herdr pane swap returned changed:false');
    } catch (error) {
      try {
        await restoreFocus();
      } catch (restoreError) {
        console.warn(
          JSON.stringify({
            warning: 'tab focus restore failed',
            slug: state.slug,
            prev,
            error: herdrDetail(restoreError),
          }),
        );
      }
      throw new Error(`seat A swap failed for leaf ${state.slug}: ${herdrDetail(error)}`, { cause: error });
    }
    try {
      await restoreFocus();
    } catch (error) {
      throw new Error(`tab focus restore failed for leaf ${state.slug}: ${herdrDetail(error)}`, { cause: error });
    }
  }
  const second: Pane =
    recordedB ??
    (
      await herdr(
        ['pane', 'split', first.pane_id, '--direction', 'right', ...placement],
        z.object({ pane: paneSchema }),
      )
    ).pane;
  await box(second);
  const allocated: State = { ...tabState, pane: { A: first.pane_id, B: second.pane_id } };
  saveState(leaf.path, allocated);
  return allocated;
}

async function dispatchSlot(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  slot: Slot,
  mergeContext?: string,
  attempt?: string,
): Promise<void> {
  async function recordDelivery(): Promise<void> {
    const current: Pane = await currentPane(z.string().parse(readState(leaf.path).pane[slot]));
    const observed: State = await observeBusy(leaf.path, readState(leaf.path), slot, current, Date.now());
    saveState(leaf.path, {
      ...observed,
      prompted: { ...observed.prompted, [slot]: current.agent_session?.value },
      prompted_at: { ...observed.prompted_at, [slot]: new Date().toISOString() },
      delivery_error: { ...observed.delivery_error, [slot]: undefined },
      attempts: { ...observed.attempts, [slot]: 0 },
    });
    appendTiming(repo, {
      kind: 'prompt',
      slug: observed.slug,
      slot,
      phase: observed.phase,
      visit: currentVisit(readLog(repo.root), observed.slug, observed.phase),
      session: current.agent_session?.value ?? null,
      outcome: 'delivered',
      ...(attempt === undefined ? {} : { attempt }),
    });
  }

  async function recordFailure(
    argv: string[],
    error: { code: string; message: string },
    pane: Pane,
    offset: number | undefined,
  ): Promise<void> {
    const base: State = readState(leaf.path);
    const next: State = {
      ...base,
      delivery_error: {
        ...base.delivery_error,
        [slot]: {
          command: argv,
          code: error.code,
          message: error.message,
          pane: pane.pane_id,
          session: pane.agent_session?.value ?? null,
          at: new Date().toISOString(),
          ...(offset === undefined ? {} : { offset }),
        },
      },
      attempts: { ...base.attempts, [slot]: base.attempts[slot] + 1 },
    };
    saveState(leaf.path, next);
    appendTiming(repo, {
      kind: 'prompt',
      slug: base.slug,
      slot,
      phase: base.phase,
      visit: currentVisit(readLog(repo.root), base.slug, base.phase),
      session: pane.agent_session?.value ?? null,
      outcome: 'failed',
      ...(attempt === undefined ? {} : { attempt }),
    });
  }

  const recorded: State = readState(leaf.path);
  if (recorded.phase !== leaf.state.phase || recorded.done.includes(slot)) return;
  const pane: Pane = await currentPane(z.string().parse(recorded.pane[slot]));
  const state: State = await observeBusy(leaf.path, recorded, slot, pane, Date.now());
  if (pane.agent !== null && busy(pane)) return;
  if (
    pane.agent !== null &&
    state.prompted[slot] !== undefined &&
    pane.agent_session?.value === state.prompted[slot] &&
    Date.now() - Date.parse(state.prompted_at[slot] ?? '') < PROMPT_GRACE_MS
  )
    return;
  const prompt: string =
    `${routing[state.phase].skill} ${state.slug} slot=${slot} phase=${state.phase} leaf=${leaf.path}` +
    (mergeContext === undefined ? '' : ` ${mergeContext}`);
  const pendingOffset: number | undefined = state.delivery_error[slot]?.offset;
  if (
    pendingOffset !== undefined &&
    pane.agent_session !== null &&
    pane.agent_session !== undefined &&
    pane.agent_session.value === state.delivery_error[slot]!.session
  ) {
    const resettleFile: string | undefined = sessionFile(pane.agent_session, process.env.HOME ?? '');
    if (resettleFile !== undefined && deliveredAfter(resettleFile, pendingOffset, prompt)) {
      await recordDelivery();
      return;
    }
  }
  if (pane.agent === null) {
    const harness: { kind: string; args: string[] } = launch(global, repo, slot, leaf.path);
    const name: string = `akrogon-${createHash('sha256').update(pane.pane_id).digest('hex').slice(0, 24)}`;
    const startArgv: string[] = [
      'herdr',
      'agent',
      'start',
      name,
      '--kind',
      harness.kind,
      '--pane',
      pane.pane_id,
      '--timeout',
      '30000',
      '--',
      ...harness.args,
    ];
    const started: Result = await run(startArgv);
    if (started.code !== 0) {
      const error: { code: string; message: string } = herdrError(started);
      await recordFailure(startArgv, error, pane, undefined);
      return;
    }
  }
  const ready: Pane = await currentPane(pane.pane_id);
  await observeBusy(leaf.path, readState(leaf.path), slot, ready, Date.now());
  if (!idle(ready)) return;
  if (mergeContext !== undefined && state.worktree !== undefined && existsSync(state.worktree))
    await removeEmptyUntrackedDirs(state.worktree);
  let file: string | undefined;
  let offset: number | undefined;
  if (ready.agent_session !== null && ready.agent_session !== undefined) {
    file = sessionFile(ready.agent_session, process.env.HOME ?? '');
    if (file !== undefined) {
      const found: ReturnType<typeof statSync> | undefined = statSync(file, { throwIfNoEntry: false });
      if (found !== undefined && found.isFile()) offset = found.size;
    }
  }
  const args: string[] = [
    'herdr',
    'agent',
    'prompt',
    ready.pane_id,
    prompt,
    '--wait',
    '--until',
    'working',
    '--timeout',
    '5000',
  ];
  const result: Result = await run(args);
  if (result.code === 0) {
    await recordDelivery();
    return;
  }
  const error: { code: string; message: string } = herdrError(result);
  if (error.code === 'timeout' && file !== undefined && offset !== undefined && deliveredAfter(file, offset, prompt)) {
    await recordDelivery();
    return;
  }
  await recordFailure(args, error, ready, error.code === 'timeout' ? offset : undefined);
  return;
}

async function dispatchLeaf(
  global: GlobalConfig,
  repo: Repo,
  identity: Leaf,
  picked: boolean,
  invocation: Invocation,
  mergeContext: string | undefined,
  isAutomatic: boolean,
  attempt?: string,
): Promise<DispatchOutcome> {
  const slug: string = identity.state.slug;
  const end = (reason: WaitReason, blocking?: string): DispatchOutcome => {
    recordWait(repo, slug, reason, blocking);
    return 'waiting';
  };
  const inventory: Inventory = discover(repo, invocation);
  const leaf: Leaf | undefined = inventory.leaves.find((leaf) => leaf.state.slug === slug);
  if (leaf === undefined) {
    report(invocation, repo.name, identity.path, new Error(`Missing or unreadable leaf: ${slug}`), slug);
    return 'skipped';
  }
  if (isAutomatic && isPaused(repo.name)) return end('none');
  if (isStopped(repo.name, slug)) {
    if (!picked || isAutomatic) return end('none');
    report(invocation, repo.name, leaf.path, new Error(`Leaf is stopped: ${slug}; run akrogon start ${slug}`), slug);
    return 'skipped';
  }
  try {
    let state: State = readState(leaf.path);
    if (state.slug !== slug || state.repo !== repo.name) throw new Error(`Leaf identity changed: ${leaf.path}`);
    if (!readTimings(repo.root).some((event) => event.kind === 'visit_start' && event.slug === slug))
      appendTiming(repo, {
        kind: 'visit_start',
        slug,
        phase: state.phase,
        visit: currentVisit(readLog(repo.root), slug, state.phase),
      });
    if (state.phase !== 'merged' && state.phase !== 'failed' && Object.values(state.pane).length > 0) {
      const live: Pane[] = await panes();
      for (const seat of ['A', 'B'] as const) {
        const pane: Pane | undefined = live.find((pane) => pane.pane_id === state.pane[seat]);
        if (pane !== undefined) state = await observeBusy(leaf.path, state, seat, pane, Date.now());
      }
    }
    if (state.phase === 'merged') {
      await completeOwner(repo, { path: leaf.path, state }, false);
      recordWait(repo, slug, 'none');
      return 'completed';
    }
    if (state.phase === 'failed') {
      const live: boolean =
        state.tab !== undefined &&
        state.failure?.cause !== 'attempts' &&
        (await panes()).some((pane) => pane.tab_id === state.tab);
      if (
        picked &&
        ((state.tab === undefined && state.worktree === undefined) || live || state.failure?.cause === 'attempts')
      )
        throw new Error(`Leaf is failed and needs phase recovery: ${slug}`);
      return end('none');
    }
    if (
      state.debate === 'yes' &&
      state.phase === 'plan.synthesis' &&
      !['positions-A.md', 'positions-B.md'].every((n) => existsSync(resolve(leaf.path, n)))
    )
      throw new Error(`Debate leaf skipped its debate: ${slug}; set phase: plan.positions`);
    const detail: ReturnType<typeof blockDetail> = blockDetail(
      global,
      repo,
      { path: leaf.path, state },
      inventory.leaves,
    );
    if (detail?.kind === 'deps') {
      const deps: string = detail.deps.map((d) => `${d.slug} (${d.label})`).join(', ');
      const parked: DepDetail | undefined = detail.deps.find((d) => d.label === 'parked');
      const reason: WaitReason = parked === undefined ? 'prerequisite' : 'parked';
      if (picked && detail.deps.some((d) => ['failed', 'parked', 'unreadable', 'missing'].includes(d.label))) {
        recordWait(repo, slug, reason, parked?.slug ?? detail.deps[0].slug);
        throw new Error(`Leaf dependencies are not merged: ${slug}: ${deps}`);
      }
      if (picked) console.log(`waiting: ${slug} on ${deps}`);
      return end(reason, parked?.slug ?? detail.deps[0].slug);
    }
    if (detail?.kind === 'inputs') {
      recordWait(repo, slug, 'none');
      if (picked)
        throw new Error(
          `Leaf inputs are missing: ${slug}: ${detail.missing.map((g) => `${g.kind} ${g.name} in ${g.holder}`).join(', ')}`,
        );
      return 'waiting';
    }
    const turn: QueueEntry | undefined =
      state.phase === 'merge' ? mergeQueue(global, inventory.leaves, () => readLog(repo.root))[0] : undefined;
    if (state.phase === 'merge' && (turn?.leaf.state.slug !== slug || mergeContext === undefined))
      return end('merge_turn', turn === undefined || turn.leaf.state.slug === slug ? undefined : turn.leaf.state.slug);
    seats(global, repo, leaf.path);
    // Mirrors ensureWorktree's path: a missing worktree needs remote proof, an existing one only local.
    const mustCreate: boolean = !existsSync(resolve(worktreeStore(repo), slug));
    await checkBase(repo, mustCreate);
    const allocated: State | null = await allocate(global, repo, { path: leaf.path, state }, invocation);
    if (allocated === null) return end('none');
    for (const slot of requiredSlots(allocated.phase, allocated.fix_rounds)) {
      const delivery: string = `${repo.name}/${slug}/${allocated.phase}/${slot}`;
      if (invocation.dispatched.has(delivery)) continue;
      invocation.dispatched.add(delivery);
      await dispatchSlot(global, repo, { path: leaf.path, state: allocated }, slot, mergeContext, attempt);
    }
    return end('none');
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    report(invocation, repo.name, leaf.path, error, slug);
    return 'skipped';
  }
}

async function sweepAll(global: GlobalConfig, invocation: Invocation, isAutomatic: boolean): Promise<void> {
  const { repos } = registeredRepos(global, invocation);
  for (const merged of [true, false])
    for (const repo of repos)
      await sweep(
        global,
        repo,
        discover(repo, invocation).leaves.filter((leaf) => (leaf.state.phase === 'merged') === merged),
        invocation,
        true,
        isAutomatic,
      );
}

async function sweep(
  global: GlobalConfig,
  repo: Repo,
  leaves: Leaf[],
  invocation: Invocation,
  picked: boolean,
  isAutomatic: boolean,
): Promise<void> {
  if (isAutomatic && isPaused(repo.name)) return;
  const counts: Map<string, number> = dependentCounts(discover(repo, invocation).leaves);
  const ordered: Leaf[] = [...leaves].sort(
    (a, b) =>
      Number(b.state.phase === 'merged') - Number(a.state.phase === 'merged') ||
      (counts.get(b.state.slug) ?? 0) - (counts.get(a.state.slug) ?? 0),
  );
  for (const leaf of ordered) {
    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, picked, invocation, undefined, isAutomatic);
    if (outcome === 'completed') await dispatchDependents(global, repo, leaf.state.slug, invocation, isAutomatic);
  }
}

async function mergeNotice(repo: Repo, slug: string): Promise<boolean> {
  const args: string[] = [
    'notification',
    'show',
    `${repo.name}/${slug} merged, move it back`,
    '--body',
    `next: akrogon phase ${slug} merge`,
    '--sound',
    'request',
  ];
  const schema = z.object({ shown: z.boolean(), reason: z.string() });
  try {
    return (await herdr(args, schema)).shown;
  } catch (error) {
    if (!(error instanceof CommandError) || !retryable(error.result)) {
      console.warn(
        JSON.stringify({
          warning: 'merge notice failed',
          slug,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return false;
    }
  }
  try {
    return (await herdr(args, schema)).shown;
  } catch (error) {
    console.warn(
      JSON.stringify({
        warning: 'merge notice failed',
        slug,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return false;
  }
}

async function reconcileBatch(
  repo: Repo,
  holder: Leaf,
  invocation: Invocation,
  isAutomatic: boolean,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  const record: Batch | undefined = holder.state.batch;
  if (record === undefined) return;
  if (isAutomatic && isPaused(repo.name)) return;
  const inMerge: boolean = holder.state.phase === 'merge';
  if (inMerge && !(record.applied === true && record.candidate !== undefined)) return;
  const fetched: Result = await run(['git', 'fetch', repo.config.remote], repo.root);
  if (fetched.code !== 0) {
    report(
      invocation,
      repo.name,
      holder.path,
      new CommandError(['git', 'fetch', repo.config.remote], repo.root, fetched),
      holder.state.slug,
    );
    return;
  }
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (isAutomatic && isPaused(repo.name)) return;
    const fresh: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === holder.state.slug);
    const batch: Batch | undefined = fresh?.state.batch;
    if (
      fresh === undefined ||
      batch === undefined ||
      batch.attempt !== record.attempt ||
      (fresh.state.phase === 'merge' && !(batch.applied === true && batch.candidate !== undefined))
    )
      return;
    const end: PressureSnapshot | undefined =
      batch.pressure_start === undefined ? undefined : readPressure(pressureDir);
    const landed: boolean =
      batch.candidate !== undefined && (await isAncestor(repo.root, batch.candidate, trackingRef(repo)));
    if (!landed) {
      if ((fresh.state.phase === 'merge' || fresh.state.phase === 'failed') && batch.recorded !== true)
        appendAttempt(repo, holder.state.slug, batch, 'red', end);
      saveState(fresh.path, { ...fresh.state, batch: undefined });
      return;
    }
    if ((fresh.state.phase === 'merge' || fresh.state.phase === 'failed') && batch.recorded !== true)
      appendAttempt(repo, holder.state.slug, batch, 'merged', end);
    const holderNow: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === holder.state.slug);
    if (holderNow === undefined) return;
    if (holderNow.state.phase === 'merge') {
      await commitMove(repo, holderNow, holderNow.state, 'merged', null);
      const remaining: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === holder.state.slug);
      if (remaining !== undefined) saveState(remaining.path, { ...remaining.state, batch: undefined });
    } else if (holderNow.state.phase === 'failed') {
      const notified: boolean = batch.notified === true || (await mergeNotice(repo, holderNow.state.slug));
      saveState(holderNow.path, { ...holderNow.state, batch: { ...batch, notified, recorded: true } });
    } else saveState(holderNow.path, { ...holderNow.state, batch: undefined });
  });
}

async function mergeTurn(
  global: GlobalConfig,
  repo: Repo,
  invocation: Invocation,
  isAutomatic: boolean,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  if (isAutomatic && isPaused(repo.name)) return;
  const inventory: Inventory = discover(repo, invocation);
  for (const leaf of inventory.leaves.filter((item) => item.state.batch !== undefined)) {
    try {
      await reconcileBatch(repo, leaf, invocation, isAutomatic, pressureDir);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, leaf.path, error, leaf.state.slug);
    }
  }
  const holder: Leaf | undefined = mergeQueue(global, discover(repo, invocation).leaves, () => readLog(repo.root))[0]
    ?.leaf;
  if (holder === undefined) return;
  if (isStopped(repo.name, holder.state.slug)) return;
  const recorded: Batch | undefined = holder.state.batch;
  if (recorded !== undefined && recorded.applied === true) {
    await dispatchMergeLeaf(global, repo, holder, invocation, mergeContext(recorded), isAutomatic, recorded.attempt);
    return;
  }
  const fetched: Result = await run(['git', 'fetch', repo.config.remote], repo.root);
  if (isAutomatic && isPaused(repo.name)) return;
  if (fetched.code !== 0)
    console.warn(
      JSON.stringify({
        warning: 'git fetch failed, using existing tracking ref',
        repo: repo.name,
        remote: repo.config.remote,
        code: fetched.code,
        stderr: fetched.stderr,
      }),
    );
  let batch: Batch | undefined;
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (isAutomatic && isPaused(repo.name)) return;
    const leaves: Leaf[] = allLeaves(repo);
    const fresh: Leaf | undefined = leaves.find((item) => item.state.slug === holder.state.slug);
    if (
      fresh?.state.phase !== 'merge' ||
      fresh.state.batch?.attempt !== recorded?.attempt ||
      fresh.state.batch?.applied === true
    )
      return;
    if (mergeQueue(global, leaves, () => readLog(repo.root))[0]?.leaf.state.slug !== holder.state.slug) return;
    const start: PressureSnapshot | undefined = readPressure(pressureDir);
    const builtOn: string = await localBase(repo);
    const holderHead: string = (await branchSha(repo, holder.state.slug)) ?? builtOn;
    const tools: Tool[] | undefined = repo.config.tools.length > 0 ? await resolveTools(repo) : undefined;
    const next: Batch = {
      attempt: attemptId(),
      started: new Date().toISOString(),
      pressure_start: start,
      built_on: builtOn,
      holder: { base: await memberBase(repo, builtOn, holderHead), head: holderHead },
      tools,
      applied: false,
    };
    saveState(fresh.path, { ...fresh.state, batch: next });
    appendTiming(repo, {
      kind: 'batch',
      slug: holder.state.slug,
      attempt: next.attempt,
      holder: holder.state.slug,
      built_on: next.built_on,
    });
    batch = next;
  });
  if (batch === undefined) return;
  const current: Batch = batch;
  if (isAutomatic && isPaused(repo.name)) return;
  const staged: Awaited<ReturnType<typeof buildStack>> = await buildStack(repo, current.built_on, current.holder.head);
  const outcome: Batch | undefined = await withLock(
    resolve(globalHome(), '.lock'),
    async (): Promise<Batch | undefined> => {
      if (isAutomatic && isPaused(repo.name)) return undefined;
      const fresh: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === holder.state.slug);
      if (fresh === undefined || fresh.state.phase !== 'merge' || fresh.state.batch === undefined) return undefined;
      if (fresh.state.batch.applied === true || fresh.state.batch.attempt !== current.attempt) {
        saveState(fresh.path, { ...fresh.state, batch: undefined });
        return undefined;
      }
      const applied: Batch =
        staged.ok && (await applyTop(repo, fresh, staged.top, current.holder.head))
          ? { ...fresh.state.batch, applied: true, top: staged.top }
          : { ...fresh.state.batch, applied: true };
      saveState(fresh.path, { ...readState(fresh.path), batch: applied });
      return applied;
    },
  );
  if (outcome !== undefined)
    await dispatchMergeLeaf(
      global,
      repo,
      { path: holder.path, state: readState(holder.path) },
      invocation,
      mergeContext(outcome),
      isAutomatic,
      outcome.attempt,
    );
}

function mergeContext(record: Batch): string {
  return record.top === undefined ? `attempt=${record.attempt} solo` : `attempt=${record.attempt} top=${record.top}`;
}

async function dispatchMergeLeaf(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  invocation: Invocation,
  mergeContext: string,
  isAutomatic: boolean,
  attempt: string,
): Promise<void> {
  if (!isAutomatic) {
    await withLock(resolve(globalHome(), '.lock'), async () => {
      await dispatchLeaf(global, repo, leaf, false, invocation, mergeContext, false, attempt);
    });
    return;
  }
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (isPaused(repo.name)) return;
    await dispatchLeaf(global, repo, leaf, false, invocation, mergeContext, true, attempt);
  });
}

export async function mergePass(
  global: GlobalConfig,
  repo: Repo,
  invocation: Invocation,
  isAutomatic: boolean,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  for (;;) {
    if (isAutomatic && isPaused(repo.name)) return;
    const holder: Leaf | undefined = mergeQueue(global, discover(repo, invocation).leaves, () => readLog(repo.root))[0]
      ?.leaf;
    await mergeTurn(global, repo, invocation, isAutomatic, pressureDir);
    if (
      holder === undefined ||
      discover(repo, invocation).leaves.some(
        (leaf) => leaf.state.slug === holder.state.slug && leaf.state.phase === 'merge',
      )
    )
      return;
  }
}

export async function mergeWake(
  global: GlobalConfig,
  repo: Repo,
  committedTo?: Phase,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set() };
  try {
    if (committedTo === 'merged') await selfUpdate(repo);
    const paused: boolean = await withLock(resolve(globalHome(), '.lock'), async () => isPaused(repo.name));
    if (paused) return;
    await mergePass(global, repo, invocation, true, pressureDir);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    report(invocation, repo.name, repo.root, error);
  }
}

async function dispatchDependents(
  global: GlobalConfig,
  repo: Repo,
  completedSlug: string,
  invocation: Invocation,
  isAutomatic: boolean,
): Promise<void> {
  await sweep(
    global,
    repo,
    discover(repo, invocation).leaves.filter((leaf) => leaf.state['blocked-by'].includes(completedSlug)),
    invocation,
    false,
    isAutomatic,
  );
}

type Selection = { repo: Repo; leaves: Leaf[] };

type OwnerCandidate = { name: string; kind: 'epic' | 'issue'; path: string };

function ownerCandidates(openLeaves: Leaf[], repoRoot: string): OwnerCandidate[] {
  const openRoot: string = resolve(repoRoot, 'issues/open');
  const found: Map<string, OwnerCandidate> = new Map();
  for (const leaf of openLeaves) {
    const parts: string[] = relative(openRoot, leaf.path).split(sep).filter(Boolean);
    if (parts.length === 2) {
      const path: string = resolve(openRoot, parts[0]);
      if (!found.has(path)) found.set(path, { name: parts[0], kind: 'issue', path });
    } else if (parts.length === 3) {
      const epic: string = resolve(openRoot, parts[0]);
      const issue: string = resolve(epic, parts[1]);
      if (!found.has(epic)) found.set(epic, { name: parts[0], kind: 'epic', path: epic });
      if (!found.has(issue)) found.set(issue, { name: parts[1], kind: 'issue', path: issue });
    }
  }
  return [...found.values()];
}

function resolveName(repo: Repo, inventory: Inventory, input: string): Leaf[] | undefined {
  if (input.includes('/') || input.includes('\\')) return undefined;
  const openRoot: string = resolve(repo.root, 'issues/open');
  const openLeaves: Leaf[] = inventory.leaves.filter((leaf) => within(leaf.path, openRoot));
  const owners: OwnerCandidate[] = ownerCandidates(openLeaves, repo.root).filter((owner) => owner.name === input);
  const leaves: Leaf[] = inventory.leaves.filter((leaf) => leaf.state.slug === input);
  const matches: { kind: string; path: string; leaves: Leaf[] }[] = [
    ...owners.map((owner) => ({
      kind: owner.kind,
      path: owner.path,
      leaves: openLeaves.filter((leaf) => within(leaf.path, owner.path)),
    })),
    ...leaves.map((leaf) => ({ kind: 'leaf', path: leaf.path, leaves: [leaf] })),
  ];
  if (matches.length === 1) return matches[0].leaves;
  if (matches.length > 1) {
    const lines: string[] = matches
      .map((match) => ({ kind: match.kind, rel: relative(repo.root, match.path) }))
      .sort((a, b) => a.rel.localeCompare(b.rel))
      .map((match) => `${match.kind} ${match.rel}`);
    throw new Error(`Ambiguous target "${input}":\n${lines.join('\n')}`);
  }
  return undefined;
}

async function selectLeaves(
  global: GlobalConfig,
  invocation: Invocation,
  input: string | undefined,
): Promise<Selection> {
  const cwd: string = process.cwd();
  const folder: string = input === undefined ? cwd : expandPath(input, cwd);
  if (existsSync(folder) && !statSync(folder).isDirectory())
    throw new Error(`Invalid target "${input}": expected a leaf folder, slug or worktree path`);
  const selection: string = existsSync(folder) ? folder : cwd;
  const common: string | null = await commonDirectory(selection);
  const matches: Repo[] = [];
  for (const repo of registeredRepos(global, invocation).repos) {
    try {
      if (common !== null && (await commonDirectory(repo.root)) === common) matches.push(repo);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, repo.root, error);
    }
  }
  if (matches.length > 1) throw new Error(`Multiple registered checkouts for ${selection}`);
  if (matches.length === 0) throw new Error(`No initialized registered checkout for ${selection}`);
  const repo: Repo = matches[0];
  const inventory: Inventory = discover(repo, invocation);
  const selected: Leaf[] =
    input !== undefined && !existsSync(folder)
      ? (resolveName(repo, inventory, input) ?? inventory.leaves.filter((leaf) => leaf.state.slug === input))
      : inventory.leaves.filter(
          (leaf) => within(leaf.path, folder) || within(folder, leaf.path) || inWorktree(folder, leaf),
        );
  if (selected.length === 0) {
    if (inventory.unreadable > 0 || inventory.unknown || inventory.foreign.length > 0)
      return { repo, leaves: selected };
    if (input !== undefined && !existsSync(folder)) throw new Error(missingLeafMessage(repo, input));
    throw new Error(`No leaves match: ${input ?? cwd}`);
  }
  return { repo, leaves: selected };
}

async function reconcileRepos(
  repos: Repo[],
  invocation: Invocation,
  isAutomatic: boolean,
  panesOnce: () => Promise<Pane[] | null>,
): Promise<void> {
  for (const repo of repos) {
    if (isAutomatic && isPaused(repo.name)) continue;
    const leaves: Leaf[] = discover(repo, invocation).leaves;
    try {
      await reconcile(repo, leaves, (await reconcileNeedsPanes(repo, leaves)) ? await panesOnce() : []);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, repo.root, error);
    }
  }
  await reconcileHost(registeredRepos(readGlobal(), invocation).repos, null, panesOnce);
}

async function paneOwners(
  global: GlobalConfig,
  invocation: Invocation,
  hookPane: string,
): Promise<{ repo: Repo; leaf: Leaf }[]> {
  const live: Pane | undefined = (await panes()).find((pane) => pane.pane_id === hookPane);
  return registeredRepos(global, invocation).repos.flatMap((repo) =>
    discover(repo, invocation)
      .leaves.filter((leaf) => ownsPane(leaf, live, hookPane))
      .map((leaf) => ({ repo, leaf })),
  );
}

export async function nextCommand(input: string | undefined, pressureDir: string = '/proc/pressure'): Promise<void> {
  const rawEvent: string | undefined = input === undefined ? process.env.HERDR_PLUGIN_EVENT_JSON : undefined;
  const event: HookEvent | undefined = rawEvent === undefined ? undefined : hookEventSchema.parse(JSON.parse(rawEvent));
  readPaused();
  if (event?.event === 'pane_agent_status_changed' && event.data.agent_status === 'working') return;
  const global: GlobalConfig = readGlobal();
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set() };
  const hookPane: string | undefined = process.env.HERDR_PANE_ID || undefined;
  // One shared lazy pane list per pass; reconcile and the host step share it.
  let panesRequested: boolean = false;
  let live: Pane[] | null = null;
  const panesOnce = async (): Promise<Pane[] | null> => {
    if (!panesRequested) {
      panesRequested = true;
      live = await panes().catch(() => null);
    }
    return live;
  };
  const hooked: boolean = event !== undefined;
  const selection: Selection | undefined =
    input !== '--all' && input !== '--resume' && event?.event !== 'tab_closed' && (input !== undefined || !hooked)
      ? await selectLeaves(global, invocation, input)
      : undefined;
  const updating: Repo[] =
    input === '--all' || input === '--resume'
      ? registeredRepos(global, invocation).repos
      : selection === undefined
        ? []
        : [selection.repo];
  for (const repo of updating) {
    try {
      await selfUpdate(repo);
    } catch (error) {
      console.warn(
        JSON.stringify({
          warning: 'self-update threw',
          repo: repo.name,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
  if (selection === undefined || selection.leaves.length > 0) {
    const touched: Map<string, { repo: Repo; isAutomatic: boolean }> = new Map();
    await withLock(resolve(globalHome(), '.lock'), async () => {
      if (selection !== undefined) {
        if (selection.leaves.length === 1) {
          const completedSlug: string = selection.leaves[0].state.slug;
          const outcome: DispatchOutcome = await dispatchLeaf(
            global,
            selection.repo,
            selection.leaves[0],
            true,
            invocation,
            undefined,
            false,
          );
          if (outcome === 'completed')
            await dispatchDependents(global, selection.repo, completedSlug, invocation, false);
        } else await sweep(global, selection.repo, selection.leaves, invocation, true, false);
        touched.set(selection.repo.name, { repo: selection.repo, isAutomatic: false });
        await reconcileRepos([selection.repo], invocation, false, panesOnce);
      } else if (input === '--all') {
        const current: Repo | null = await currentRepo(global, process.cwd());
        if (current === null) {
          await sweepAll(global, invocation, false);
          const registered: { repos: Repo[]; unknown: boolean } = registeredRepos(global, invocation);
          for (const repo of registered.repos) touched.set(repo.name, { repo, isAutomatic: false });
          await reconcileRepos(registered.repos, invocation, false, panesOnce);
        } else {
          await sweep(global, current, discover(current, invocation).leaves, invocation, true, false);
          touched.set(current.name, { repo: current, isAutomatic: false });
          await reconcileRepos([current], invocation, false, panesOnce);
        }
      } else if (input === '--resume') {
        const registered: { repos: Repo[]; unknown: boolean } = registeredRepos(global, invocation);
        const active: Repo[] = registered.repos.filter((repo) => !isPaused(repo.name));
        for (const repo of active)
          await sweep(
            global,
            repo,
            discover(repo, invocation).leaves.filter(
              (leaf) =>
                leaf.state.phase === 'merged' || leaf.state.tab !== undefined || leaf.state.worktree !== undefined,
            ),
            invocation,
            false,
            true,
          );
        for (const repo of active) touched.set(repo.name, { repo, isAutomatic: true });
        await reconcileRepos(active, invocation, true, panesOnce);
      } else if (event?.event === 'tab_closed') {
        const owners: { repo: Repo; leaf: Leaf }[] = registeredRepos(global, invocation).repos.flatMap((repo) =>
          discover(repo, invocation)
            .leaves.filter((leaf) => leaf.state.tab === event.data.tab_id)
            .map((leaf) => ({ repo, leaf })),
        );
        if (owners.length > 1) throw new Error(`Multiple leaves own closed tab: ${event.data.tab_id}`);
        if (owners.length === 0) return;
        if (isPaused(owners[0].repo.name)) return;
        const completedSlug: string = owners[0].leaf.state.slug;
        try {
          const leaves: Leaf[] = discover(owners[0].repo, invocation).leaves;
          await reconcile(
            owners[0].repo,
            leaves,
            (await reconcileNeedsPanes(owners[0].repo, leaves)) ? await panesOnce() : [],
          );
          await reconcileHost(registeredRepos(global, invocation).repos, live, panesOnce);
        } catch (error) {
          if (!(error instanceof Error)) throw error;
          report(invocation, owners[0].repo.name, owners[0].leaf.path, error, completedSlug);
        }
        const outcome: DispatchOutcome = await dispatchLeaf(
          global,
          owners[0].repo,
          owners[0].leaf,
          false,
          invocation,
          undefined,
          true,
        );
        if (outcome === 'completed') await dispatchDependents(global, owners[0].repo, completedSlug, invocation, true);
        touched.set(owners[0].repo.name, { repo: owners[0].repo, isAutomatic: true });
      } else if (input === undefined && hookPane !== undefined) {
        const owners: { repo: Repo; leaf: Leaf }[] = await paneOwners(global, invocation, hookPane);
        if (owners.length > 1) throw new Error(`Multiple leaves own hook pane: ${hookPane}`);
        if (owners.length === 0) return;
        const owner: { repo: Repo; leaf: Leaf } = owners[0];
        if (isPaused(owner.repo.name)) return;
        const completedSlug: string = owner.leaf.state.slug;
        const outcome: DispatchOutcome = await dispatchLeaf(
          global,
          owner.repo,
          owner.leaf,
          false,
          invocation,
          undefined,
          true,
        );
        if (outcome === 'completed') await dispatchDependents(global, owner.repo, completedSlug, invocation, true);
        let rediscovered: Leaf | undefined;
        try {
          rediscovered = discover(owner.repo, invocation).leaves.find((leaf) => leaf.state.slug === completedSlug);
          if (
            rediscovered !== undefined &&
            rediscovered.state.phase === 'merged' &&
            hookPane === rediscovered.state.pane.B &&
            (event === undefined ||
              event.event !== 'pane_agent_status_changed' ||
              (event.data.agent_status !== 'blocked' && event.data.agent_status !== 'unknown'))
          )
            await closeMergedTab(owner.repo, rediscovered, await panes());
        } catch (error) {
          if (!(error instanceof Error)) throw error;
          report(invocation, owner.repo.name, rediscovered?.path ?? owner.leaf.path, error, completedSlug);
        }
        touched.set(owner.repo.name, { repo: owner.repo, isAutomatic: true });
      }
    });
    for (const { repo, isAutomatic } of touched.values()) {
      try {
        await mergePass(global, repo, invocation, isAutomatic, pressureDir);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        report(invocation, repo.name, repo.root, error);
      }
    }
  }
  if (invocation.skipped.size > 0) process.exitCode = 1;
}

export async function unpausePass(repo: Repo, pressureDir: string = '/proc/pressure'): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set() };
  await withLock(resolve(globalHome(), '.lock'), async () => {
    await sweep(
      global,
      repo,
      discover(repo, invocation).leaves.filter(
        (leaf) => leaf.state.phase === 'merged' || leaf.state.tab !== undefined || leaf.state.worktree !== undefined,
      ),
      invocation,
      false,
      false,
    );
    await reconcileRepos([repo], invocation, false, async () => await panes().catch(() => null));
  });
  await mergePass(global, repo, invocation, false, pressureDir);
  if (invocation.skipped.size > 0)
    throw new Error(`Unpause pass incomplete for ${repo.name}: ${invocation.skipped.size} skipped`);
}
