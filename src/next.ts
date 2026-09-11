import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { parse } from 'shell-quote';
import {
  readGlobal,
  readRepo,
  requireRepo,
  globalHome,
  expandPath,
  base,
  target,
  within,
  type Repo,
  type GlobalConfig,
} from './config';
import {
  allLeaves,
  findLeaf,
  readState,
  saveState,
  withLock,
  withRepoLock,
  withLeafLocks,
  dependenciesReady,
  type Leaf,
  type State,
} from './state';
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
]);

type HookEvent = z.infer<typeof hookEventSchema>;

function inWorktree(cwd: string | null, leaf: Leaf): boolean {
  return cwd !== null && leaf.state.worktree !== undefined && within(cwd, leaf.state.worktree);
}

function ownsPane(leaf: Leaf, pane: Pane | undefined, paneId: string): boolean {
  return Object.values(leaf.state.pane).includes(paneId) || (pane !== undefined && inWorktree(pane.cwd, leaf));
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
    if (
      realpathSync(expectedCommon) !== realpathSync(actualCommon) ||
      (await command(['git', 'branch', '--show-current'], path)) !== leaf.state.slug
    )
      throw new Error(`Unrelated worktree: ${path}`);
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

async function activeCount(global: GlobalConfig): Promise<number> {
  const live: Pane[] = await panes();
  const active: Set<string> = new Set();
  for (const [name, path] of Object.entries(global.repos)) {
    const repo: Repo = readRepo(name, path);
    for (const leaf of allLeaves(repo)) {
      if (live.some((pane) => pane.tab_id === leaf.state.tab || inWorktree(pane.cwd, leaf)))
        active.add(`${name}/${leaf.state.slug}`);
    }
  }
  return active.size;
}

async function allocate(global: GlobalConfig, repo: Repo, leaf: Leaf): Promise<State | null> {
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
  if (matches.length === 0 && (await activeCount(global)) >= global.max_active) return null;
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
    if (pane.agent !== null && pane.agent_status === 'working') return;
    if (pane.agent !== null && !idle(pane)) {
      if (seat === peer) {
        await commitMove(repo, leaf, state, 'failed', slot);
        return;
      }
      saveState(leaf.path, { ...state, attempts: { ...state.attempts, [slot]: 2 } });
      continue;
    }
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
      if (ready.agent_status === 'working') return;
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
    if (result.code === 0) return;
    if (!retryable(result)) throw new CommandError(args, repo.root, result);
    console.warn(
      JSON.stringify({ warning: 'prompt failed', slug: state.slug, slot, attempt: attempt.attempts[slot], ...result }),
    );
  }
}

async function dispatchLeaf(global: GlobalConfig, repo: Repo, slug: string, explicit: boolean): Promise<boolean> {
  return withRepoLock(repo, async () => {
    const leaf: Leaf = findLeaf(repo, slug);
    return withLeafLocks(leaf, async () => {
      if (leaf.state.hand_built) {
        if (explicit) throw new Error(`Hand-built leaf cannot be dispatched: ${slug}`);
        return false;
      }
      if (leaf.state.phase === 'merge') {
        const mergeSeat: Slot = seatFor(leaf.state, 'A');
        const active: boolean = (await panes()).some(
          (pane) =>
            pane.pane_id === leaf.state.pane[mergeSeat] && pane.agent !== null && pane.agent_status === 'working',
        );
        if (active) return false;
      }
      const recovered: boolean = await recoverMerge(repo, leaf);
      const current: Leaf = recovered ? findLeaf(repo, slug) : leaf;
      if (current.state.phase === 'merged') {
        completeOwner(repo, current, false);
        const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === current.state.tab);
        if (members.some((pane) => pane.agent !== null && !idle(pane))) return false;
        if (members.length > 0) await command(['herdr', 'tab', 'close', z.string().parse(current.state.tab)]);
        if (current.state.worktree !== undefined && existsSync(current.state.worktree)) {
          await command(['git', 'worktree', 'remove', '--force', current.state.worktree], repo.root);
          await command(['git', 'branch', '-d', current.state.slug], repo.root);
        }
        return true;
      }
      if (current.state.phase === 'failed') return false;
      if (!dependenciesReady(repo, current.state)) {
        if (explicit) throw new Error(`Leaf dependencies are not merged: ${slug}`);
        return false;
      }
      const state: State | null = await allocate(global, repo, current);
      if (state === null) return false;
      for (const slot of requiredSlots(state.phase, state.fix_rounds))
        await dispatchSlot(global, repo, { path: current.path, state }, slot);
      return false;
    });
  });
}

async function sweepAll(global: GlobalConfig): Promise<void> {
  const repos: Repo[] = Object.entries(global.repos).map(([name, path]) => readRepo(name, path));
  for (const repo of repos)
    await sweep(
      global,
      repo,
      allLeaves(repo).filter((leaf) => leaf.state.phase === 'merged'),
    );
  for (const repo of repos)
    await sweep(
      global,
      repo,
      allLeaves(repo).filter((leaf) => leaf.state.phase !== 'merged'),
    );
}

async function sweep(global: GlobalConfig, repo: Repo, leaves: Leaf[]): Promise<void> {
  const ordered: Leaf[] = [...leaves].sort(
    (a, b) => Number(b.state.phase === 'merged') - Number(a.state.phase === 'merged'),
  );
  for (const leaf of ordered) await dispatchLeaf(global, repo, leaf.state.slug, false);
}

export async function nextCommand(input: string | undefined): Promise<void> {
  const rawEvent: string | undefined = input === undefined ? process.env.HERDR_PLUGIN_EVENT_JSON : undefined;
  const event: HookEvent | undefined = rawEvent === undefined ? undefined : hookEventSchema.parse(JSON.parse(rawEvent));
  if (event?.event === 'pane_agent_status_changed' && event.data.agent_status === 'working') return;
  const global: GlobalConfig = readGlobal();
  await withLock(resolve(globalHome(), '.lock'), async () => {
    if (input === '--all') {
      await sweepAll(global);
      return;
    }
    const hookPane: string | undefined = process.env.HERDR_PANE_ID || undefined;
    if (input === undefined && hookPane !== undefined) {
      const live: Pane | undefined = (await panes()).find((pane) => pane.pane_id === hookPane);
      const repos: Repo[] = Object.entries(global.repos).map(([name, path]) => readRepo(name, path));
      const owners: { repo: Repo; leaf: Leaf }[] = repos.flatMap((repo) =>
        allLeaves(repo)
          .filter((leaf) => ownsPane(leaf, live, hookPane))
          .map((leaf) => ({ repo, leaf })),
      );
      if (owners.length > 1) throw new Error(`Multiple leaves own hook pane: ${hookPane}`);
      if (owners.length === 0) return;
      const owner: { repo: Repo; leaf: Leaf } = owners[0];
      const completed: boolean = await dispatchLeaf(global, owner.repo, owner.leaf.state.slug, false);
      if (completed) await sweepAll(global);
      return;
    }
    const cwd: string = process.cwd();
    const folder: string = input === undefined ? cwd : expandPath(input, cwd);
    const repo: Repo = await requireRepo(global, existsSync(folder) ? folder : cwd);
    const leaves: Leaf[] = allLeaves(repo);
    const selected: Leaf[] =
      input !== undefined && !existsSync(folder)
        ? [findLeaf(repo, input)]
        : leaves.filter((leaf) => within(leaf.path, folder) || within(folder, leaf.path) || inWorktree(folder, leaf));
    if (selected.length === 0) throw new Error(`No leaves match: ${input ?? cwd}`);
    if (selected.length === 1) {
      const completed: boolean = await dispatchLeaf(global, repo, selected[0].state.slug, true);
      if (completed) await sweepAll(global);
    } else await sweep(global, repo, selected);
  });
}
