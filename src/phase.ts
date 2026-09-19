import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { readGlobal, requireRepo, target, globalHome, type Repo, within } from './config';
import {
  readState,
  saveState,
  findLeaf,
  leavesUnder,
  withLock,
  failureSchema,
  type Failure,
  type State,
  type Leaf,
} from './state';
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
import { command, herdr, retryable, CommandError } from './shell';
import { logMove } from './log';
import { closeSources } from './pull';

async function herdrCall<T>(args: string[], schema: z.ZodType<T>, slug: string): Promise<T> {
  try {
    return await herdr(args, schema);
  } catch (error) {
    if (!(error instanceof CommandError) || !retryable(error.result)) throw error;
    console.warn(
      JSON.stringify({
        warning: 'herdr call failed, retrying',
        slug,
        command: ['herdr', ...args],
        code: error.result.code,
        stderr: error.result.stderr,
      }),
    );
    return await herdr(args, schema);
  }
}

async function announceFailed(repo: Repo, leaf: Leaf, state: State): Promise<State> {
  const failure: Failure = failureSchema.parse(state.failure);
  let lastError: unknown;
  let delivery: string = 'error';
  try {
    const shown = await herdrCall(
      [
        'notification',
        'show',
        `${repo.name}/${state.slug} failed`,
        '--body',
        `${failure.cause}: ${failure.reason}`,
        '--sound',
        'request',
      ],
      z.object({ shown: z.boolean(), reason: z.string() }),
      state.slug,
    );
    delivery = shown.reason;
  } catch (error) {
    lastError = error;
  }
  const announced: State = { ...state, failure: { ...failure, delivery } };
  saveState(leaf.path, announced);
  if (state.tab !== undefined) {
    try {
      await herdrCall(
        ['tab', 'rename', state.tab, `${state.slug} failed`],
        z.object({ tab: z.object({ label: z.string() }) }),
        state.slug,
      );
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError !== undefined) throw lastError;
  return announced;
}

export async function commitMove(
  repo: Repo,
  leaf: Leaf,
  recorded: State,
  to: Phase,
  slot: Slot | null,
  failure?: Failure,
): Promise<State> {
  const after: State = {
    ...recorded,
    phase: to,
    done: [],
    verdict: {},
    prompted: {},
    prompted_at: {},
    delivery_error: {},
    attempts: { A: 0, B: 0 },
    failure: to === 'failed' ? failure : undefined,
    busy_since: to === 'failed' || to === 'merged' ? {} : recorded.busy_since,
    busy_notified: to === 'failed' || to === 'merged' ? {} : recorded.busy_notified,
    fix_rounds:
      to === 'check.fix' && recorded.phase === 'check.review'
        ? recorded.fix_rounds + 1
        : recorded.phase === 'failed'
          ? 0
          : recorded.fix_rounds,
  };
  saveState(leaf.path, after);
  console.log(`moved ${to}`);
  // The transition is committed even if diagnostic collection or append fails.
  let announced: State = after;
  try {
    if (to === 'failed') announced = await announceFailed(repo, leaf, after);
    else if (recorded.phase === 'failed' && after.tab !== undefined)
      await herdrCall(
        ['tab', 'rename', after.tab, after.slug],
        z.object({ tab: z.object({ label: z.string() }) }),
        after.slug,
      );
    if (to === 'merged') await completeOwner(repo, leaf, true);
  } finally {
    try {
      await logMove(repo, recorded, announced, slot);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(`Move to ${to} is committed, but log append failed: ${error.message}`, { cause: error });
    }
  }
  return announced;
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
  reason: string | undefined,
): Promise<void> {
  const state: State = readState(leaf.path);
  if (state.phase === 'merged') throw new Error(`Merged is terminal: ${state.slug}`);
  if (!routing[state.phase].next.includes(requested))
    throw new Error(
      `Illegal move ${state.phase} -> ${requested}; from ${state.phase} the legal moves are ${routing[state.phase].next.join(', ')}`,
    );
  if (requested === 'failed' && reason === undefined) throw new Error('Failed requires --reason');
  if (requested !== 'failed' && reason !== undefined) throw new Error('--reason is only valid for failed');
  if (
    state.phase === 'plan.positions' &&
    requested !== 'failed' &&
    requested !== (repo.config.rebuttal ? 'plan.rebuttal' : 'plan.synthesis')
  )
    throw new Error('Destination contradicts rebuttal config');
  const required: readonly Slot[] = requiredSlots(state.phase, state.fix_rounds);
  const slot: Slot | undefined = explicitSlot ?? (required.length === 1 ? required[0] : undefined);
  if (state.phase !== 'failed' && (slot === undefined || !required.includes(slot)))
    throw new Error('A required --slot is missing or invalid');
  if (slot !== undefined && state.done.includes(slot)) throw new Error(`Slot already recorded: ${slot}`);
  if (requested === 'failed') {
    await commitMove(repo, leaf, state, 'failed', slot ?? null, {
      cause: 'blocked',
      phase: state.phase,
      slot: slot ?? required[0],
      reason: reason as string,
    });
    return;
  }
  if (state.worktree !== undefined && !(state.phase === 'failed' && state.failure?.cause === 'blocked'))
    await requireClean(state.worktree);
  if (state.worktree !== undefined) await requireNoIssueFiles(repo, state.worktree, leaf.path);
  if (requested === 'check.review' && state.worktree !== undefined) await requireNonEmpty(repo, state.worktree);
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
  await commitMove(
    repo,
    leaf,
    recorded,
    capped,
    slot ?? null,
    capped === 'failed'
      ? { cause: 'attempts', phase: 'check.review', slot: slot ?? required[0], reason: 'fix rounds exhausted' }
      : undefined,
  );
}

export async function requireClean(worktree: string): Promise<void> {
  if (!existsSync(worktree)) throw new Error(`Missing worktree: ${worktree}`);
  const dirty: string = await command(['git', 'status', '--porcelain'], worktree);
  if (dirty !== '') throw new Error(`Uncommitted work in ${worktree}:\n${dirty}`);
}

export async function requireNoIssueFiles(repo: Repo, worktree: string, leafPath: string): Promise<void> {
  const files: string = await command(
    ['git', 'diff', '--name-only', `${target(repo)}...HEAD`, '--', 'issues'],
    worktree,
  );
  if (files !== '') throw new Error(`Issue files on leaf branch belong in ${leafPath}:\n${files}`);
}

export async function requireNonEmpty(repo: Repo, worktree: string): Promise<void> {
  const changes: string = await command(['git', 'diff', '--name-only', `${target(repo)}...HEAD`], worktree);
  if (changes === '') throw new Error(`Empty leaf branch: no changes against ${target(repo)}`);
}

export async function phaseCommand(
  slug: string,
  rawPhase: string,
  rawSlot: string | boolean | undefined,
  rawVerdict: string | boolean | undefined,
  rawReason: string | boolean | undefined,
): Promise<void> {
  const requested: Phase = phaseSchema.parse(rawPhase);
  const slot: Slot | undefined = slotSchema.optional().parse(rawSlot);
  const verdict: Verdict | undefined = verdictSchema.optional().parse(rawVerdict);
  const reason: string | undefined = z.string().trim().min(1).optional().parse(rawReason);
  const repo: Repo = await requireRepo(readGlobal(), process.cwd());
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const leaf: Leaf = findLeaf(repo, slug);
    if (leaf.state.phase === 'merged') await completeOwner(repo, leaf, false);
    await transition(repo, leaf, requested, slot, verdict, reason);
  });
}
