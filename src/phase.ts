import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { readGlobal, requireRepo, target, globalHome, type Repo, within } from './config';
import { readState, saveState, findLeaf, leavesUnder, withRepoLock, withLock, type State, type Leaf } from './state';
import {
  phaseSchema,
  slotSchema,
  verdictSchema,
  routing,
  requiredSlots,
  type Phase,
  type Slot,
  type Verdict,
} from './routing';
import { command, run, retryCommand, type Result } from './shell';
import { logMove } from './log';
import { closeSources } from './pull';

export async function commitMove(
  repo: Repo,
  leaf: Leaf,
  recorded: State,
  to: Phase,
  slot: Slot | null,
): Promise<State> {
  const after: State = {
    ...recorded,
    phase: to,
    failed_notified: false,
    done: [],
    verdict: {},
    prompted: {},
    prompted_at: {},
    attempts: { A: 0, B: 0 },
    fix_rounds:
      to === 'check.fix' && recorded.phase === 'check.review'
        ? recorded.fix_rounds + 1
        : recorded.phase === 'failed' && to === 'implement'
          ? 0
          : recorded.fix_rounds,
  };
  saveState(leaf.path, after);
  console.log(`moved ${to}`);
  // The transition is committed even if diagnostic collection or append fails.
  try {
    if (to === 'merged') await completeOwner(repo, leaf, true);
  } finally {
    try {
      await logMove(repo, recorded, after, slot);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(`Move to ${to} is committed, but log append failed: ${error.message}`, { cause: error });
    }
  }
  return after;
}

export async function completeOwner(repo: Repo, leaf: Leaf, justMerged: boolean): Promise<void> {
  if (within(leaf.path, resolve(repo.root, 'issues/closed'))) return;
  const issue: string = dirname(leaf.path);
  const issueLeaves: Leaf[] = leavesUnder(issue, resolve(repo.root, 'issues/open'));
  if (!issueLeaves.every((item) => item.state.phase === 'merged')) return;
  const parent: string = dirname(issue);
  const owner: string = basename(parent) === 'open' ? issue : parent;
  const ownerLeaves: Leaf[] = owner === issue ? issueLeaves : leavesUnder(owner, resolve(repo.root, 'issues/open'));
  const complete: boolean = ownerLeaves.every((item) => item.state.phase === 'merged');
  const destination: string = resolve(repo.root, 'issues/closed', basename(owner));
  if (complete && existsSync(destination)) throw new Error(`Completion destination exists: ${destination}`);
  const issueSources: Set<string> = new Set(issueLeaves.flatMap((item) => item.state.sources ?? []));
  const siblingSources: Set<string> = new Set(
    ownerLeaves.filter((item) => dirname(item.path) !== issue).flatMap((item) => item.state.sources ?? []),
  );
  const privateSources: Set<string> =
    owner === issue
      ? issueSources
      : new Set(
          [...issueSources].filter(
            (source) =>
              issueLeaves.every((item) => (item.state.sources ?? []).includes(source)) && !siblingSources.has(source),
          ),
        );
  await closeSources(repo, privateSources, leaf);
  if (complete && owner !== issue) {
    const remaining: Set<string> = new Set(
      ownerLeaves.flatMap((item) => item.state.sources ?? []).filter((source) => !privateSources.has(source)),
    );
    await closeSources(repo, remaining, leaf);
  }
  if (justMerged) console.log(`issue complete ${basename(issue)}`);
  if (!complete) return;
  mkdirSync(resolve(repo.root, 'issues/closed'), { recursive: true });
  renameSync(owner, destination);
  const chart: string = resolve(repo.root, 'issues/chart', basename(owner));
  if (existsSync(chart)) renameSync(chart, resolve(destination, 'chart'));
}

export async function transition(
  repo: Repo,
  leaf: Leaf,
  requested: Phase,
  explicitSlot: Slot | undefined,
  verdict: Verdict | undefined,
): Promise<void> {
  const state: State = readState(leaf.path);
  if (state.phase === 'merged') throw new Error(`Merged is terminal: ${state.slug}`);
  if (!routing[state.phase].next.includes(requested))
    throw new Error(
      `Illegal move ${state.phase} -> ${requested}; from ${state.phase} the legal moves are ${routing[state.phase].next.join(', ')}`,
    );
  if (state.phase === 'plan.positions' && requested !== (repo.config.rebuttal ? 'plan.rebuttal' : 'plan.synthesis'))
    throw new Error('Destination contradicts rebuttal config');
  const required: readonly Slot[] = requiredSlots(state.phase, state.fix_rounds);
  const slot: Slot | undefined = explicitSlot ?? (required.length === 1 ? required[0] : undefined);
  if (state.phase !== 'failed' && (slot === undefined || !required.includes(slot)))
    throw new Error('A required --slot is missing or invalid');
  if (slot !== undefined && state.done.includes(slot)) throw new Error(`Slot already recorded: ${slot}`);
  if (state.worktree !== undefined) await requireClean(state.worktree);
  if (requested === 'check.review' && state.worktree !== undefined) await requireCodeOnly(repo, state.worktree);
  if ((state.phase === 'check.review') !== (verdict !== undefined))
    throw new Error('Review requires --verdict; other phases forbid it');
  const recorded: State = {
    ...state,
    done: slot === undefined ? state.done : [...state.done, slot],
    verdict: verdict === undefined || slot === undefined ? state.verdict : { ...state.verdict, [slot]: verdict },
  };
  if (!required.every((requiredSlot) => recorded.done.includes(requiredSlot))) {
    saveState(leaf.path, recorded);
    console.log('recorded');
    return;
  }
  const destination: Phase =
    state.phase === 'check.review'
      ? Object.values(recorded.verdict).includes('fix')
        ? 'check.fix'
        : 'merge'
      : requested;
  const capped: Phase =
    destination === 'check.fix' && state.phase === 'check.review' && state.fix_rounds >= repo.config.fix_rounds
      ? 'failed'
      : destination;
  await commitMove(repo, leaf, recorded, capped, slot ?? null);
}

export async function requireClean(worktree: string): Promise<void> {
  if (!existsSync(worktree)) throw new Error(`Missing worktree: ${worktree}`);
  const dirty: string = await command(['git', 'status', '--porcelain'], worktree);
  if (dirty !== '') throw new Error(`Uncommitted work in ${worktree}:\n${dirty}`);
}

export async function requireCodeOnly(repo: Repo, worktree: string): Promise<void> {
  const files: string = await command(
    ['git', 'diff', '--name-only', `${target(repo)}...HEAD`, '--', 'issues'],
    worktree,
  );
  if (files !== '') throw new Error(`Issue files on leaf branch belong to ${resolve(repo.root, 'issues')}:\n${files}`);
}

export async function recoverMerge(repo: Repo, leaf: Leaf): Promise<boolean> {
  if (leaf.state.phase !== 'merge') return false;
  if (leaf.state.worktree === undefined) throw new Error(`Merge leaf has no worktree: ${leaf.state.slug}`);
  await retryCommand(['git', 'fetch', repo.config.remote, repo.config.default_branch], repo.root, 60000);
  await requireClean(leaf.state.worktree);
  const head: string = await command(['git', 'rev-parse', 'HEAD'], leaf.state.worktree);
  const result: Result = await run(['git', 'merge-base', '--is-ancestor', head, target(repo)], repo.root);
  if (result.code === 1) return false;
  if (result.code !== 0) throw new Error(JSON.stringify({ ancestry: head, target: target(repo), ...result }));
  await transition(repo, leaf, 'merged', 'A', undefined);
  return true;
}

export async function phaseCommand(
  slug: string,
  rawPhase: string,
  rawSlot: string | boolean | undefined,
  rawVerdict: string | boolean | undefined,
): Promise<void> {
  const requested: Phase = phaseSchema.parse(rawPhase);
  const slot: Slot | undefined = slotSchema.optional().parse(rawSlot);
  const verdict: Verdict | undefined = verdictSchema.optional().parse(rawVerdict);
  const repo: Repo = await requireRepo(readGlobal(), process.cwd());
  await withLock(resolve(globalHome(), '.lock'), () =>
    withRepoLock(repo, async () => {
      const leaf: Leaf = findLeaf(repo, slug);
      if (leaf.state.phase === 'merged') await completeOwner(repo, leaf, false);
      await transition(repo, leaf, requested, slot, verdict);
    }),
  );
}
