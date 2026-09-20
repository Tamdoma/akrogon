import { existsSync, realpathSync, readdirSync, statSync, type Dirent } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
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
  target,
  within,
  seats,
  type Repo,
  type GlobalConfig,
  type SlotConfig,
} from './config';
import { readState, saveState, validateLeafDepth, missingLeafMessage, withLock, type Leaf, type State } from './state';
import { requiredSlots, routing, type Slot } from './routing';
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
import { commitMove, completeOwner } from './phase';
import { sessionFile, deliveredAfter } from './session-file';

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

type Invocation = { skipped: Set<string> };
type Inventory = { leaves: Leaf[]; unreadable: number; unknown: boolean; foreign: { path: string; stored: string }[] };
type DispatchOutcome = 'completed' | 'waiting' | 'skipped';

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

function lookup(inventory: Inventory, slug: string): Leaf {
  const leaf: Leaf | undefined = inventory.leaves.find((leaf) => leaf.state.slug === slug);
  if (leaf === undefined) throw new Error(`Missing or unreadable leaf: ${slug}`);
  return leaf;
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

function launch(global: GlobalConfig, repo: Repo, slot: Slot): { kind: string; args: string[] } {
  const config: SlotConfig = seats(global, repo)[slot === 'A' ? 'a' : 'b'];
  const line: string = global.harnesses[config.harness]
    .replaceAll('{model}', quote(config.model))
    .replaceAll('{effort}', quote(config.effort));
  const argv: string[] = z.array(z.string()).min(1).parse(parse(line));
  if (argv[0] !== config.harness) throw new Error(`Harness launch must start with ${config.harness}`);
  return { kind: config.harness, args: argv.slice(1) };
}

async function ensureWorktree(repo: Repo, leaf: Leaf): Promise<State> {
  const path: string = resolve(repo.root, repo.config.worktree_root, leaf.state.slug);
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
    await command(
      branch.code === 0
        ? ['git', 'worktree', 'add', path, leaf.state.slug]
        : ['git', 'worktree', 'add', '-b', leaf.state.slug, path, target(repo)],
      repo.root,
    );
  }
  const state: State = { ...leaf.state, worktree: path };
  saveState(leaf.path, state);
  return state;
}

async function activeCount(global: GlobalConfig, invocation: Invocation): Promise<number> {
  const live: Pane[] = await panes();
  const registered: ReturnType<typeof registeredRepos> = registeredRepos(global, invocation);
  let total: number = registered.unknown ? global.max_active : 0;
  for (const repo of registered.repos) {
    const inventory: Inventory = discover(repo, invocation);
    const contribution: number = inventory.unknown
      ? global.max_active
      : inventory.unreadable > 0
        ? inventory.leaves.filter((leaf) => leaf.state.phase !== 'failed').length + inventory.unreadable
        : inventory.leaves.filter(
            (leaf) =>
              leaf.state.phase !== 'merged' &&
              leaf.state.phase !== 'failed' &&
              live.some((pane) => pane.tab_id === leaf.state.tab || inWorktree(pane.cwd, leaf)),
          ).length;
    total += contribution;
  }
  return total;
}

async function allocate(global: GlobalConfig, repo: Repo, leaf: Leaf, invocation: Invocation): Promise<State | null> {
  const live: Pane[] = await panes();
  const liveTabs: Tab[] = await tabs();
  const expected: Leaf = {
    ...leaf,
    state: { ...leaf.state, worktree: resolve(repo.root, repo.config.worktree_root, leaf.state.slug) },
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
  const state: State = await ensureWorktree(repo, leaf);
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
  const second: Pane =
    recordedB ??
    (
      await herdr(
        ['pane', 'split', first.pane_id, '--direction', 'right', ...placement],
        z.object({ pane: paneSchema }),
      )
    ).pane;
  const allocated: State = { ...tabState, pane: { A: first.pane_id, B: second.pane_id } };
  saveState(leaf.path, allocated);
  return allocated;
}

async function dispatchSlot(global: GlobalConfig, repo: Repo, leaf: Leaf, slot: Slot): Promise<void> {
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
    if (next.attempts[slot] >= 3) {
      await commitMove(repo, leaf, next, 'failed', slot, {
        cause: 'attempts',
        phase: next.phase,
        slot,
        reason: `prompt undelivered to seat ${slot} after 3 passes: ${error.code} ${error.message} (pane ${pane.pane_id}, session ${pane.agent_session?.value ?? null})`,
      });
    } else {
      saveState(leaf.path, next);
    }
  }

  async function unreachable(error: { code: string; message: string }, pane: Pane): Promise<void> {
    const current: State = readState(leaf.path);
    await commitMove(repo, leaf, current, 'failed', slot, {
      cause: 'attempts',
      phase: current.phase,
      slot,
      reason: `seat ${slot} unreachable: ${error.code} ${error.message} (pane ${pane.pane_id})`,
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
  const prompt: string = `${routing[state.phase].skill} ${state.slug} slot=${slot} phase=${state.phase} leaf=${leaf.path}`;
  const pendingOffset: number | undefined = state.delivery_error[slot]?.offset;
  if (pendingOffset !== undefined && pane.agent_session !== null && pane.agent_session !== undefined) {
    const resettleFile: string | undefined = sessionFile(pane.agent_session, process.env.HOME ?? '');
    if (resettleFile !== undefined && deliveredAfter(resettleFile, pendingOffset, prompt)) {
      await recordDelivery();
      return;
    }
  }
  if (pane.agent === null) {
    const harness: { kind: string; args: string[] } = launch(global, repo, slot);
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
      if (retryable(started)) await recordFailure(startArgv, error, pane, undefined);
      else await unreachable(error, pane);
      return;
    }
  }
  const ready: Pane = await currentPane(pane.pane_id);
  await observeBusy(leaf.path, readState(leaf.path), slot, ready, Date.now());
  if (!idle(ready)) return;
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
  if (retryable(result)) {
    await recordFailure(args, error, ready, error.code === 'timeout' ? offset : undefined);
    return;
  }
  await unreachable(error, ready);
}

async function dispatchLeaf(
  global: GlobalConfig,
  repo: Repo,
  identity: Leaf,
  explicit: boolean,
  invocation: Invocation,
): Promise<DispatchOutcome> {
  const slug: string = identity.state.slug;
  const inventory: Inventory = discover(repo, invocation);
  const leaf: Leaf | undefined = inventory.leaves.find((leaf) => leaf.state.slug === slug);
  if (leaf === undefined) {
    report(invocation, repo.name, identity.path, new Error(`Missing or unreadable leaf: ${slug}`), slug);
    return 'skipped';
  }
  try {
    let state: State = readState(leaf.path);
    if (state.slug !== slug || state.repo !== repo.name) throw new Error(`Leaf identity changed: ${leaf.path}`);
    if (state.hand_built) {
      if (explicit) throw new Error(`Hand-built leaf cannot be dispatched: ${slug}`);
      return 'waiting';
    }
    if (state.phase !== 'merged' && state.phase !== 'failed' && Object.values(state.pane).length > 0) {
      const live: Pane[] = await panes();
      for (const seat of ['A', 'B'] as const) {
        const pane: Pane | undefined = live.find((pane) => pane.pane_id === state.pane[seat]);
        if (pane !== undefined) state = await observeBusy(leaf.path, state, seat, pane, Date.now());
      }
    }
    if (state.phase === 'merged') {
      await completeOwner(repo, { path: leaf.path, state }, false);
      return 'completed';
    }
    if (state.phase === 'failed') return 'waiting';
    if (
      state.debate === 'yes' &&
      state.phase === 'plan.synthesis' &&
      !['positions-A.md', 'positions-B.md'].every((n) => existsSync(resolve(leaf.path, n)))
    )
      throw new Error(`Debate leaf skipped its debate: ${slug}; set phase: plan.positions`);
    const dependencies: Leaf[] = state['blocked-by'].map((dependency) => lookup(inventory, dependency));
    if (!dependencies.every((dependency) => dependency.state.phase === 'merged')) {
      if (explicit) throw new Error(`Leaf dependencies are not merged: ${slug}`);
      return 'waiting';
    }
    seats(global, repo);
    const allocated: State | null = await allocate(global, repo, { path: leaf.path, state }, invocation);
    if (allocated === null) return 'waiting';
    for (const slot of requiredSlots(allocated.phase, allocated.fix_rounds))
      await dispatchSlot(global, repo, { path: leaf.path, state: allocated }, slot);
    return 'waiting';
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    report(invocation, repo.name, leaf.path, error, slug);
    return 'skipped';
  }
}

async function cleanupMerged(repo: Repo, leaf: Leaf): Promise<void> {
  if (within(leaf.path, resolve(repo.root, 'issues/open'))) return;
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === leaf.state.tab);
  if (members.length > 0) await command(['herdr', 'tab', 'close', z.string().parse(leaf.state.tab)]);
  if (leaf.state.worktree !== undefined && existsSync(leaf.state.worktree)) {
    await command(['git', 'worktree', 'remove', '--force', leaf.state.worktree], repo.root);
    await command(['git', 'branch', '-d', leaf.state.slug], repo.root);
  }
}

async function sweepAll(global: GlobalConfig, invocation: Invocation): Promise<void> {
  const { repos } = registeredRepos(global, invocation);
  for (const merged of [true, false])
    for (const repo of repos)
      await sweep(
        global,
        repo,
        discover(repo, invocation).leaves.filter((leaf) => (leaf.state.phase === 'merged') === merged),
        invocation,
      );
}

async function sweep(global: GlobalConfig, repo: Repo, leaves: Leaf[], invocation: Invocation): Promise<void> {
  const ordered: Leaf[] = [...leaves].sort(
    (a, b) => Number(b.state.phase === 'merged') - Number(a.state.phase === 'merged'),
  );
  for (const leaf of ordered) await dispatchLeaf(global, repo, leaf, false, invocation);
}

type Selection = { repo: Repo; leaves: Leaf[] };

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
      ? inventory.leaves.filter((leaf) => leaf.state.slug === input)
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

async function cleanupRepos(repos: Repo[], invocation: Invocation): Promise<void> {
  for (const repo of repos)
    for (const leaf of discover(repo, invocation).leaves.filter((leaf) => leaf.state.phase === 'merged')) {
      try {
        await cleanupMerged(repo, leaf);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        report(invocation, repo.name, leaf.path, error, leaf.state.slug);
      }
    }
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

export async function nextCommand(input: string | undefined): Promise<void> {
  const rawEvent: string | undefined = input === undefined ? process.env.HERDR_PLUGIN_EVENT_JSON : undefined;
  const event: HookEvent | undefined = rawEvent === undefined ? undefined : hookEventSchema.parse(JSON.parse(rawEvent));
  if (event?.event === 'pane_agent_status_changed' && event.data.agent_status === 'working') return;
  const global: GlobalConfig = readGlobal();
  const invocation: Invocation = { skipped: new Set() };
  const hookPane: string | undefined = process.env.HERDR_PANE_ID || undefined;
  const hooked: boolean = event !== undefined;
  const selection: Selection | undefined =
    input !== '--all' && event?.event !== 'tab_closed' && (input !== undefined || !hooked)
      ? await selectLeaves(global, invocation, input)
      : undefined;
  if (selection === undefined || selection.leaves.length > 0)
    await withLock(resolve(globalHome(), '.lock'), async () => {
      if (selection !== undefined) {
        if (selection.leaves.length === 1) {
          const outcome: DispatchOutcome = await dispatchLeaf(
            global,
            selection.repo,
            selection.leaves[0],
            true,
            invocation,
          );
          if (outcome === 'completed') await sweepAll(global, invocation);
        } else await sweep(global, selection.repo, selection.leaves, invocation);
        if (input === undefined) await cleanupRepos([selection.repo], invocation);
        return;
      }
      if (input === '--all') {
        const current: Repo | null = await currentRepo(global, process.cwd());
        if (current === null) {
          await sweepAll(global, invocation);
          await cleanupRepos(registeredRepos(global, invocation).repos, invocation);
        } else {
          await sweep(global, current, discover(current, invocation).leaves, invocation);
          await cleanupRepos([current], invocation);
        }
        return;
      }
      if (event?.event === 'tab_closed') {
        const owners: { repo: Repo; leaf: Leaf }[] = registeredRepos(global, invocation).repos.flatMap((repo) =>
          discover(repo, invocation)
            .leaves.filter((leaf) => leaf.state.tab === event.data.tab_id)
            .map((leaf) => ({ repo, leaf })),
        );
        if (owners.length > 1) throw new Error(`Multiple leaves own closed tab: ${event.data.tab_id}`);
        if (owners.length === 0) return;
        const outcome: DispatchOutcome = await dispatchLeaf(global, owners[0].repo, owners[0].leaf, false, invocation);
        if (outcome === 'completed') await sweepAll(global, invocation);
        return;
      }
      if (input === undefined && hookPane !== undefined) {
        const owners: { repo: Repo; leaf: Leaf }[] = await paneOwners(global, invocation, hookPane);
        if (owners.length > 1) throw new Error(`Multiple leaves own hook pane: ${hookPane}`);
        if (owners.length === 0) return;
        const owner: { repo: Repo; leaf: Leaf } = owners[0];
        const outcome: DispatchOutcome = await dispatchLeaf(global, owner.repo, owner.leaf, false, invocation);
        if (outcome === 'completed') await sweepAll(global, invocation);
        return;
      }
    });
  if (invocation.skipped.size > 0) process.exitCode = 1;
}
