import { existsSync, realpathSync, readdirSync, statSync, type Dirent } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { parse } from 'shell-quote';
import {
  readGlobal,
  readRepo,
  commonDirectory,
  globalHome,
  expandPath,
  base,
  target,
  within,
  type Repo,
  type GlobalConfig,
} from './config';
import { readState, saveState, withLock, withRepoLock, withLeafLocks, type Leaf, type State } from './state';
import { requiredSlots, routing, type Slot } from './routing';
import {
  herdr,
  panes,
  tabs,
  paneSchema,
  tabSchema,
  command,
  run,
  CommandError,
  quote,
  type Pane,
  type Tab,
  type Result,
} from './shell';
import { commitMove, completeOwner, recoverMerge } from './phase';

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
]);

type HookEvent = z.infer<typeof hookEventSchema>;

type Invocation = { skipped: Set<string> };
type Inventory = { leaves: Leaf[]; unreadable: number; unknown: boolean };
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
  const result: Inventory = { leaves: [], unreadable: 0, unknown: false };
  function visit(path: string): void {
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
        const state: State = readState(path);
        if (state.repo !== repo.name) throw new Error(`Leaf repo mismatch: ${path}`);
        result.leaves.push({ path, state });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        report(invocation, repo.name, path, error);
        result.unreadable += 1;
      }
      return;
    }
    for (const entry of entries.filter((entry) => entry.isDirectory())) visit(resolve(path, entry.name));
  }
  for (const area of ['open', 'closed']) {
    const path: string = resolve(repo.root, 'issues', area);
    try {
      if (statSync(path, { throwIfNoEntry: false }) !== undefined) visit(path);
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
  return pane.agent_status === 'working' || pane.agent_status === 'blocked';
}
function idle(pane: Pane): boolean {
  return pane.agent_status === 'idle' || pane.agent_status === 'done';
}

function peerOf(slot: Slot): Slot {
  return slot === 'A' ? 'B' : 'A';
}

function seatFor(state: State, slot: Slot): Slot {
  return state.attempts[slot] >= 2 ? peerOf(slot) : slot;
}

async function currentPane(id: string): Promise<Pane> {
  return (await herdr(['pane', 'get', id], z.object({ pane: paneSchema }))).pane;
}

function launch(global: GlobalConfig, slot: Slot): { kind: string; args: string[] } {
  const config: GlobalConfig['slots']['a'] = global.slots[slot === 'A' ? 'a' : 'b'];
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
    throw new Error(`Worktree path mismatch: ${leaf.state.worktree}`);
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
  let active: number = registered.unknown ? global.max_active : 0;
  for (const repo of registered.repos) {
    const inventory: Inventory = discover(repo, invocation);
    if (inventory.unknown) active += global.max_active;
    else if (inventory.unreadable > 0) active += inventory.leaves.length + inventory.unreadable;
    else
      active += inventory.leaves.filter(
        (leaf) =>
          leaf.state.phase !== 'merged' &&
          live.some((pane) => pane.tab_id === leaf.state.tab || inWorktree(pane.cwd, leaf)),
      ).length;
  }
  return active;
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
  if (matches.length === 0 && (await activeCount(global, invocation)) >= global.max_active) return null;
  const state: State = await ensureWorktree(repo, leaf);
  const worktree: string = z.string().parse(state.worktree);
  const placement: string[] = ['--cwd', worktree, '--env', `AKROGON_BASE=${await base(repo, worktree)}`, '--no-focus'];
  const tab: Tab =
    matches.length === 1
      ? matches[0]
      : (await herdr(['tab', 'create', '--label', state.slug, ...placement], z.object({ tab: tabSchema }))).tab;
  const tabState: State = { ...state, tab: tab.tab_id };
  saveState(leaf.path, tabState);
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === tab.tab_id);
  if (members.length === 0 || members.length > 2) throw new Error(`Expected one or two panes in ${tab.tab_id}`);
  const first: Pane = members.find((pane) => pane.pane_id === state.pane.A) ?? members[0];
  const second: Pane =
    members.length === 2
      ? members.find((pane) => pane.pane_id !== first.pane_id)!
      : (
          await herdr(
            ['pane', 'split', first.pane_id, '--direction', 'right', ...placement],
            z.object({ pane: paneSchema }),
          )
        ).pane;
  const survivingB: boolean = members.length === 1 && first.pane_id === state.pane.B;
  const allocated: State = {
    ...tabState,
    pane: survivingB ? { A: second.pane_id, B: first.pane_id } : { A: first.pane_id, B: second.pane_id },
  };
  saveState(leaf.path, allocated);
  return allocated;
}

const herdrErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

const retryableCodes: readonly string[] = [
  'agent_prompt_stalled',
  'agent_blocked',
  'agent_not_ready',
  'timeout',
  'wait_timeout',
  'agent_wait_timeout',
];

function retryable(result: Result): boolean {
  const parsed: unknown = (() => {
    try {
      return JSON.parse(result.stderr);
    } catch {
      return null;
    }
  })();
  const response = herdrErrorSchema.safeParse(parsed);
  return response.success && retryableCodes.includes(response.data.error.code);
}

async function dispatchSlot(global: GlobalConfig, repo: Repo, leaf: Leaf, slot: Slot): Promise<void> {
  while (true) {
    const state: State = readState(leaf.path);
    if (state.phase !== leaf.state.phase || state.done.includes(slot)) return;
    const peer: Slot = peerOf(slot);
    const seat: Slot = seatFor(state, slot);
    const pane: Pane = await currentPane(z.string().parse(state.pane[seat]));
    if (pane.agent !== null && busy(pane)) return;
    if (pane.agent !== null && !idle(pane)) {
      if (seat === peer) {
        await commitMove(repo, leaf, state, 'failed', slot);
        return;
      }
      saveState(leaf.path, { ...state, attempts: { ...state.attempts, [slot]: 2 } });
      continue;
    }
    if (pane.agent !== null && pane.agent_session?.value === state.prompted[slot]) return;
    if (state.attempts[slot] >= 3) {
      await commitMove(repo, leaf, state, 'failed', slot);
      return;
    }
    const attempt: State = { ...state, attempts: { ...state.attempts, [slot]: state.attempts[slot] + 1 }, slot };
    saveState(leaf.path, attempt);
    if (pane.agent === null) {
      const harness: { kind: string; args: string[] } = launch(global, seat);
      const name: string = `akrogon-${createHash('sha256').update(pane.pane_id).digest('hex').slice(0, 24)}`;
      const started: Result = await run([
        'herdr',
        'agent',
        'start',
        name,
        '--kind',
        harness.kind,
        '--pane',
        pane.pane_id,
        '--timeout',
        '5000',
        '--',
        ...harness.args,
      ]);
      if (started.code !== 0) {
        if (!retryable(started)) throw new CommandError(['herdr', 'agent', 'start'], repo.root, started);
        console.warn(JSON.stringify({ warning: 'agent start failed', slug: state.slug, slot, ...started }));
        continue;
      }
    }
    const ready: Pane = await currentPane(pane.pane_id);
    if (!idle(ready)) {
      if (busy(ready)) return;
      continue;
    }
    const prompt: string = `${routing[state.phase].skill} ${state.slug} slot=${slot} phase=${state.phase}`;
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
      const session: string | undefined = (await currentPane(ready.pane_id)).agent_session?.value;
      saveState(leaf.path, { ...readState(leaf.path), prompted: { ...attempt.prompted, [slot]: session } });
      return;
    }
    if (!retryable(result)) throw new CommandError(args, repo.root, result);
    console.warn(
      JSON.stringify({ warning: 'prompt failed', slug: state.slug, slot, attempt: attempt.attempts[slot], ...result }),
    );
  }
}

async function dispatchLeaf(
  global: GlobalConfig,
  repo: Repo,
  identity: Leaf,
  explicit: boolean,
  invocation: Invocation,
): Promise<DispatchOutcome> {
  const slug: string = identity.state.slug;
  return withRepoLock(repo, async () => {
    const inventory: Inventory = discover(repo, invocation);
    const leaf: Leaf | undefined = inventory.leaves.find((leaf) => leaf.state.slug === slug);
    if (leaf === undefined) {
      report(invocation, repo.name, identity.path, new Error(`Missing or unreadable leaf: ${slug}`), slug);
      return 'skipped';
    }
    return withLeafLocks(leaf, async () => {
      try {
        const state: State = readState(leaf.path);
        if (state.slug !== slug || state.repo !== repo.name) throw new Error(`Leaf identity changed: ${leaf.path}`);
        const refreshed: Leaf = { path: leaf.path, state };
        if (state.hand_built) {
          if (explicit) throw new Error(`Hand-built leaf cannot be dispatched: ${slug}`);
          return 'waiting';
        }
        if (state.phase === 'merge') {
          const mergeSeat: Slot = seatFor(state, 'A');
          const active: boolean = (await panes()).some(
            (pane) => pane.pane_id === state.pane[mergeSeat] && pane.agent !== null && pane.agent_status === 'working',
          );
          if (active) return 'waiting';
        }
        const recovered: boolean = await recoverMerge(repo, refreshed);
        const current: Leaf = recovered ? lookup(discover(repo, invocation), slug) : refreshed;
        if (current.state.phase === 'merged') {
          await completeOwner(repo, current, false);
          return 'completed';
        }
        if (current.state.phase === 'failed') {
          await command(['herdr', 'notification', 'show', `Failed leaf: ${repo.name}/${slug}`]);
          return 'waiting';
        }
        const dependencies: Leaf[] = current.state['blocked-by'].map((dependency) => lookup(inventory, dependency));
        if (!dependencies.every((dependency) => dependency.state.phase === 'merged')) {
          if (explicit) throw new Error(`Leaf dependencies are not merged: ${slug}`);
          return 'waiting';
        }
        const allocated: State | null = await allocate(global, repo, current, invocation);
        if (allocated === null) return 'waiting';
        for (const slot of requiredSlots(allocated.phase, allocated.fix_rounds))
          await dispatchSlot(global, repo, { path: current.path, state: allocated }, slot);
        return 'waiting';
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        report(invocation, repo.name, leaf.path, error, slug);
        return 'skipped';
      }
    });
  });
}

async function cleanupMerged(repo: Repo, leaf: Leaf): Promise<void> {
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === leaf.state.tab);
  if (members.length > 0) await command(['herdr', 'tab', 'close', z.string().parse(leaf.state.tab)]);
  if (leaf.state.worktree !== undefined && existsSync(leaf.state.worktree)) {
    await command(['git', 'worktree', 'remove', leaf.state.worktree], repo.root);
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

export async function nextCommand(input: string | undefined): Promise<void> {
  const rawEvent: string | undefined = input === undefined ? process.env.HERDR_PLUGIN_EVENT_JSON : undefined;
  const event: HookEvent | undefined = rawEvent === undefined ? undefined : hookEventSchema.parse(JSON.parse(rawEvent));
  if (event?.event === 'pane_agent_status_changed' && event.data.agent_status === 'working') return;
  const global: GlobalConfig = readGlobal();
  const invocation: Invocation = { skipped: new Set() };
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (input === '--all') {
      for (const repo of registeredRepos(global, invocation).repos)
        for (const leaf of discover(repo, invocation).leaves.filter((leaf) => leaf.state.phase === 'merged')) {
          try {
            await cleanupMerged(repo, leaf);
          } catch (error) {
            if (!(error instanceof Error)) throw error;
            report(invocation, repo.name, leaf.path, error, leaf.state.slug);
          }
        }
      await sweepAll(global, invocation);
      return;
    }
    const hookPane: string | undefined = process.env.HERDR_PANE_ID || undefined;
    if (input === undefined && hookPane !== undefined) {
      const live: Pane | undefined = (await panes()).find((pane) => pane.pane_id === hookPane);
      const owners: { repo: Repo; leaf: Leaf }[] = registeredRepos(global, invocation).repos.flatMap((repo) =>
        discover(repo, invocation)
          .leaves.filter((leaf) => ownsPane(leaf, live, hookPane))
          .map((leaf) => ({ repo, leaf })),
      );
      if (owners.length > 1) throw new Error(`Multiple leaves own hook pane: ${hookPane}`);
      if (owners.length === 0) return;
      const owner: { repo: Repo; leaf: Leaf } = owners[0];
      const outcome: DispatchOutcome = await dispatchLeaf(global, owner.repo, owner.leaf, false, invocation);
      if (outcome === 'completed') await sweepAll(global, invocation);
      return;
    }
    const cwd: string = process.cwd();
    const folder: string = input === undefined ? cwd : expandPath(input, cwd);
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
      if (inventory.unreadable > 0 || inventory.unknown) return;
      if (input !== undefined && !existsSync(folder)) throw new Error(`Missing leaf: ${input}`);
      throw new Error(`No leaves match: ${input ?? cwd}`);
    }
    if (selected.length === 1) {
      const outcome: DispatchOutcome = await dispatchLeaf(global, repo, selected[0], true, invocation);
      if (outcome === 'completed') await sweepAll(global, invocation);
    } else await sweep(global, repo, selected, invocation);
  });
  if (invocation.skipped.size > 0) process.exitCode = 1;
}
