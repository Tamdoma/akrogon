import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { readGlobal, requireRepo, target, globalHome, type GlobalConfig, type Repo, within } from './config';
import {
  allLeaves,
  readState,
  saveState,
  findLeaf,
  leavesUnder,
  withLock,
  failureSchema,
  type Batch,
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
import { command, run, herdr, herdrError, retryable, CommandError, type Result } from './shell';
import { logMove, readLog } from './log';
import { appendTiming, currentVisit } from './timing';
import { appendAttempt, readPressure, type PressureSnapshot } from './attempts';
import { mergeQueue } from './turn';
import { closeSources } from './pull';
import { testFile } from './test-files';
import { trackingRef } from './preflight';
import { retiredLessonsPresent } from './lessons';
import { applyTop, buildStack, isAncestor } from './batch';
import { requireGreenReceipt } from './verify';

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

async function renameTab(tab: string, label: string, slug: string): Promise<void> {
  const args: string[] = ['tab', 'rename', tab, label];
  try {
    await herdrCall(args, z.object({ tab: z.object({ label: z.string() }) }), slug);
  } catch (error) {
    if (!(error instanceof CommandError)) throw error;
    const parsed: { code: string; message: string } = herdrError(error.result);
    if (parsed.code !== 'tab_not_found') throw error;
    console.warn(
      JSON.stringify({
        warning: 'tab missing, skipping rename',
        slug,
        command: ['herdr', ...args],
        code: parsed.code,
        message: parsed.message,
        stderr: error.result.stderr,
      }),
    );
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
      await renameTab(state.tab, `${state.slug} failed`, state.slug);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError !== undefined) throw lastError;
  return announced;
}

export class MoveCommittedError extends Error {
  constructor(
    public readonly repo: Repo,
    public readonly to: Phase,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export async function commitMove(
  repo: Repo,
  leaf: Leaf,
  recorded: State,
  to: Phase,
  slot: Slot | null,
  failure?: Failure,
  onCommitted?: () => void,
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
      to === 'check.fix' && (recorded.phase === 'check.repair' || recorded.phase === 'merge')
        ? recorded.fix_rounds + 1
        : recorded.fix_rounds,
    merge_stamp: to === 'merge' ? new Date().toISOString() : recorded.merge_stamp,
  };
  saveState(leaf.path, after);
  console.log(`moved ${to}`);
  onCommitted?.();
  // The transition is committed even if diagnostic collection or append fails.
  let announced: State = after;
  try {
    if (to === 'failed') announced = await announceFailed(repo, leaf, after);
    else if (recorded.phase === 'failed' && after.tab !== undefined) await renameTab(after.tab, after.slug, after.slug);
    if (to === 'merged') await completeOwner(repo, leaf, true);
  } catch (error) {
    if (error instanceof MoveCommittedError) throw error;
    throw new MoveCommittedError(
      repo,
      to,
      `Move to ${to} is committed, but follow-up work failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  } finally {
    try {
      await logMove(repo, recorded, to === 'failed' ? readState(leaf.path) : announced, slot);
      appendTiming(repo, {
        kind: 'visit_start',
        slug: recorded.slug,
        phase: to,
        visit: currentVisit(readLog(repo.root), recorded.slug, to),
      });
    } catch (error) {
      const cause: Error = error instanceof Error ? error : new Error(String(error), { cause: error });
      throw new MoveCommittedError(repo, to, `Move to ${to} is committed, but log append failed: ${cause.message}`, {
        cause,
      });
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
  if (!complete) return;
  if (justMerged) console.log(`${owner === issue ? 'issue' : 'epic'} complete ${basename(owner)}`);
  mkdirSync(resolve(repo.root, 'issues/closed'), { recursive: true });
  renameSync(owner, destination);
}

export async function transition(
  repo: Repo,
  leaf: Leaf,
  requested: Phase,
  explicitSlot: Slot | undefined,
  verdict: Verdict | undefined,
  reason: string | undefined,
  checkOnly: boolean,
  onCommitted?: () => void,
  from?: string,
): Promise<void> {
  const state: State = readState(leaf.path);
  if (checkOnly && requested === 'failed') throw new Error('--check cannot move to failed');
  if (state.phase === 'merged') throw new Error(`Merged is terminal: ${state.slug}`);
  if (state.phase === 'failed' && explicitSlot !== undefined)
    throw new Error(
      `Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved.${state.failure?.reason === undefined ? '' : ` Reason: ${state.failure.reason}`}`,
    );
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
    await commitMove(
      repo,
      leaf,
      state,
      'failed',
      slot ?? null,
      {
        cause: 'blocked',
        phase: state.phase,
        slot: slot ?? required[0],
        reason: reason as string,
      },
      onCommitted,
    );
    return;
  }
  if (state.worktree !== undefined && !(state.phase === 'failed' && state.failure?.cause === 'blocked'))
    await requireClean(state.worktree);
  if (state.worktree !== undefined) await requireNoIssueFiles(repo, state.worktree, leaf.path, from);
  // Recovery back into work skips the citation gates: the seat's own move out of that work runs them on the same diff.
  const cites: boolean = state.phase !== 'failed' || requested === 'check.review' || requested === 'merge';
  if (state.worktree !== undefined && cites) await requireTestChangeCitations(repo, state.worktree, from);
  if (state.worktree !== undefined && state.frozen !== undefined && cites)
    await requireFrozenCitations(repo, state.worktree, state.frozen, state.frozen_cited, from);
  if (requested === 'check.review' && state.worktree !== undefined) {
    await requireNonEmpty(repo, state.worktree);
    await requireGreenReceipt(repo, await command(['git', 'rev-parse', 'HEAD'], state.worktree), 'leaf');
  }
  if (state.phase === 'check.repair' && requested === 'merge' && state.worktree !== undefined)
    await requireGreenReceipt(repo, await command(['git', 'rev-parse', 'HEAD'], state.worktree), 'leaf');
  if ((state.phase === 'check.review') !== (verdict !== undefined))
    throw new Error('Review requires --verdict; other phases forbid it');
  if (checkOnly) {
    console.log('ok');
    return;
  }
  const recorded: State = {
    ...state,
    done: slot === undefined ? state.done : [...state.done, slot],
    verdict: verdict === undefined || slot === undefined ? state.verdict : { ...state.verdict, [slot]: verdict },
  };
  if (!required.every((requiredSlot) => recorded.done.includes(requiredSlot))) {
    saveState(leaf.path, recorded);
    if (required.length > 1)
      appendTiming(repo, {
        kind: 'seat_done',
        slug: state.slug,
        slot: slot!,
        phase: state.phase,
        visit: currentVisit(readLog(repo.root), state.slug, state.phase),
      });
    console.log('recorded');
    return;
  }
  const destination: Phase =
    state.phase === 'check.review'
      ? Object.values(recorded.verdict).includes('fix')
        ? 'check.repair'
        : 'merge'
      : requested;
  await commitMove(
    repo,
    leaf,
    state.phase === 'plan.synthesis' && requested === 'implement'
      ? {
          ...recorded,
          frozen: state.worktree === undefined ? {} : await frozenRecord(repo, state.worktree),
          frozen_cited: state.worktree === undefined ? [] : await frozenCitedRecord(repo, state.worktree),
        }
      : recorded,
    destination,
    slot ?? null,
    undefined,
    onCommitted,
  );
}

export async function requireClean(worktree: string): Promise<void> {
  if (!existsSync(worktree)) throw new Error(`Missing worktree: ${worktree}`);
  const dirty: string = await command(['git', 'status', '--porcelain'], worktree);
  if (dirty !== '') throw new Error(`Uncommitted work in ${worktree}:\n${dirty}`);
}

export async function requireNoIssueFiles(
  repo: Repo,
  worktree: string,
  leafPath: string,
  from: string = target(repo),
  to: string = 'HEAD',
): Promise<void> {
  const files: string = await command(['git', 'diff', '--name-only', `${from}...${to}`, '--', 'issues'], worktree);
  if (files !== '') throw new Error(`Issue files on leaf branch belong in ${leafPath}:\n${files}`);
}

function trailerValues(values: string): string[] {
  return values
    .split('\n')
    .map((value) => value.trim())
    .filter((value) => /^\S+\s+\S/.test(value));
}

function trailerCitedPaths(values: string): Set<string> {
  return new Set(trailerValues(values).map((value) => value.split(/\s/, 1)[0]));
}

async function citedPaths(worktree: string, range: string): Promise<Set<string>> {
  const log: string = await command(
    ['git', 'log', '--format=%(trailers:key=Test-Change,valueonly,unfold)', range],
    worktree,
  );
  return trailerCitedPaths(log);
}

async function emptyCommitTrailerValues(worktree: string, range: string): Promise<string[]> {
  const log: string = await command(
    ['git', 'log', '--format=%x1e%H%x1f%(trailers:key=Test-Change,valueonly,unfold)', range],
    worktree,
  );
  const values: string[] = [];
  for (const entry of log.split('\x1e')) {
    const [sha, ...rest]: string[] = entry.split('\x1f');
    const block: string = rest.join('\x1f').trim();
    if (sha.trim() === '' || block === '') continue;
    const touched: string = await command(
      ['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', sha.trim()],
      worktree,
    );
    if (touched === '') values.push(...trailerValues(block));
  }
  return values;
}

function countValues(values: string[]): Map<string, number> {
  const counts: Map<string, number> = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

async function changedPaths(worktree: string, from: string, to: string): Promise<[string, string][]> {
  const status: string = await command(['git', 'diff', '--no-renames', '--name-status', `${from}...${to}`], worktree);
  return status
    .split('\n')
    .filter((line) => line !== '')
    .map((line): [string, string] => [line.slice(0, line.indexOf('\t')), line.slice(line.indexOf('\t') + 1)]);
}

export async function requireTestChangeCitations(
  repo: Repo,
  worktree: string,
  from: string = target(repo),
  to: string = 'HEAD',
): Promise<void> {
  const changed: string[] = (await changedPaths(worktree, from, to))
    .filter(([status]) => status === 'M' || status === 'D' || status === 'T')
    .map(([, path]) => path)
    .filter((path) => testFile(path));
  if (changed.length === 0) return;
  const cited: Set<string> = await citedPaths(worktree, `${from}..${to}`);
  const missing: string[] = changed.filter((path) => !cited.has(path));
  if (missing.length === 0) return;
  throw new Error(
    `Changed test files need a citation:\n${missing.map((path) => `Test-Change: ${path} <source and reason>`).join('\n')}\nAdd each line to the final trailer block of a commit on this branch; a later empty commit may carry it.`,
  );
}

async function treeBlobs(worktree: string, rev: string): Promise<Map<string, string>> {
  const tree: string = await command(['git', 'ls-tree', '-r', '--full-tree', rev], worktree);
  return new Map(
    tree
      .split('\n')
      .filter((line) => line !== '')
      .map((line): [string, string] => [
        line.slice(line.indexOf('\t') + 1),
        line.slice(0, line.indexOf('\t')).split(/\s+/)[2],
      ]),
  );
}

async function frozenRecord(repo: Repo, worktree: string): Promise<Record<string, string | null>> {
  const tree: Map<string, string> = await treeBlobs(worktree, 'HEAD');
  const changed: [string, string][] = await changedPaths(worktree, target(repo), 'HEAD');
  return Object.fromEntries(changed.map(([, path]): [string, string | null] => [path, tree.get(path) ?? null]));
}

async function frozenCitedRecord(repo: Repo, worktree: string): Promise<string[]> {
  return emptyCommitTrailerValues(worktree, `${target(repo)}..HEAD`);
}

export async function requireFrozenCitations(
  repo: Repo,
  worktree: string,
  frozen: Record<string, string | null>,
  frozenCited?: string[],
  from: string = target(repo),
  to: string = 'HEAD',
): Promise<void> {
  const tree: Map<string, string> = await treeBlobs(worktree, to);
  const violating: string[] = [
    ...Object.keys(frozen).filter((path) => (tree.get(path) ?? null) !== frozen[path]),
    ...(await changedPaths(worktree, from, to))
      .filter(([status, path]) => status === 'A' && testFile(path) && frozen[path] === undefined)
      .map(([, path]) => path),
  ];
  if (violating.length === 0) return;
  const missing: string[] = [];
  const frozenCounts: Map<string, number> = countValues(frozenCited ?? []);
  let emptyCited: Set<string> | undefined;
  for (const path of violating) {
    const lastTouch: string = await command(
      ['git', 'log', '--format=%H', '-1', `${from}..${to}`, '--', path],
      worktree,
    );
    const cited: Set<string> =
      lastTouch === ''
        ? (emptyCited ??= new Set(
            [...countValues(await emptyCommitTrailerValues(worktree, `${from}..${to}`))]
              .filter(([value, count]) => count > (frozenCounts.get(value) ?? 0))
              .map(([value]) => value.split(/\s/, 1)[0]),
          ))
        : await citedPaths(worktree, `${lastTouch}^..${to}`);
    if (!cited.has(path)) missing.push(path);
  }
  if (missing.length === 0) return;
  throw new Error(
    `Changed test files need a citation:\n${missing.map((path) => `Test-Change: ${path} <source and reason>`).join('\n')}\nAdd each line to the final trailer block of a commit on this branch; a later empty commit may carry it.`,
  );
}

export async function requireNonEmpty(
  repo: Repo,
  worktree: string,
  from: string = target(repo),
  to: string = 'HEAD',
): Promise<void> {
  const changes: string = await command(['git', 'diff', '--name-only', `${from}...${to}`], worktree);
  if (changes === '') throw new Error(`Empty leaf branch: no changes against ${from}`);
}

async function mergeHead(repo: Repo, state: State, record: Batch): Promise<string> {
  if (state.worktree !== undefined) return command(['git', 'rev-parse', 'HEAD'], state.worktree);
  const ref: Result = await run(['git', 'rev-parse', `refs/heads/${state.slug}`], repo.root);
  if (ref.code === 0) return ref.stdout;
  if (record.top === undefined)
    throw new CommandError(['git', 'rev-parse', `refs/heads/${state.slug}`], repo.root, ref);
  return record.top;
}

// B may carry repair commits past the recorded top.
async function requireBatchTop(worktree: string, top: string, head: string): Promise<void> {
  if (!(await isAncestor(worktree, top, head)))
    throw new Error(`HEAD must descend from the recorded batch top ${top}, found ${head}`);
}

async function batchCheck(
  repo: Repo,
  leaf: Leaf,
  requested: Phase,
  slot: Slot | undefined,
  verdict: Verdict | undefined,
  reason: string | undefined,
  record: Batch,
): Promise<void> {
  const state: State = readState(leaf.path);
  const worktree: string = state.worktree ?? repo.root;
  const head: string = await mergeHead(repo, state, record);
  if (!record.applied) throw new Error('Batch record is not applied; a restack or the next pass owns it');
  if (record.top === undefined) await requireNonEmpty(repo, worktree);
  else {
    await requireBatchTop(worktree, record.top, head);
    await requireNoIssueFiles(repo, repo.root, leaf.path, record.built_on, head);
    await requireTestChangeCitations(repo, repo.root, record.built_on, head);
  }
  const retired: string[] = await retiredLessonsPresent(worktree, record.built_on, head, [record.holder]);
  if (retired.length > 0)
    throw new Error(
      'Retired lesson lines present in push range: ' +
        retired.join(', ') +
        '. Remove the learnings/LESSONS.md line(s) and commit before pushing.',
    );
  await transition(repo, leaf, requested, slot, verdict, reason, true);
  await requireGreenReceipt(repo, head, 'merge');
  saveState(leaf.path, {
    ...readState(leaf.path),
    batch: {
      ...record,
      tested_top: head,
      tested_main: await command(['git', 'merge-base', head, trackingRef(repo)], repo.root),
    },
  });
}

type BatchPending =
  | { kind: 'none' }
  | { kind: 'refused'; record: Batch; candidate: string; end: PressureSnapshot | undefined }
  | { kind: 'error'; record: Batch; candidate: string; result: Result; end: PressureSnapshot | undefined };

async function batchPush(
  repo: Repo,
  leaf: Leaf,
  requested: Phase,
  slot: Slot | undefined,
  verdict: Verdict | undefined,
  reason: string | undefined,
  record: Batch,
  onCommitted: () => void,
  end: PressureSnapshot | undefined,
  pressureDir: string = '/proc/pressure',
): Promise<BatchPending> {
  const state: State = readState(leaf.path);
  const worktree: string = state.worktree ?? repo.root;
  const head: string = await mergeHead(repo, state, record);
  if (!record.applied) throw new Error('Batch record is not applied; a restack or the next pass owns it');
  if (record.top !== undefined) await requireBatchTop(worktree, record.top, head);
  if (slot !== undefined && head !== record.tested_top)
    throw new Error(`Untested top: ${head} does not match tested_top ${record.tested_top}`);
  await requireGreenReceipt(repo, head, 'merge');
  await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: head } });
  const pushed: Result = await run(
    ['git', 'push', repo.config.remote, `${head}:refs/heads/${repo.config.default_branch}`],
    repo.root,
  );
  if (pushed.code === 0) {
    appendAttempt(repo, leaf.state.slug, record, 'merged', end);
    saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: head, recorded: true } });
    await transition(repo, leaf, requested, slot, verdict, reason, false, onCommitted, record.built_on);
    return { kind: 'none' };
  }
  if (pushed.stderr.includes('non-fast-forward') || pushed.stderr.includes('[rejected]')) {
    saveState(leaf.path, {
      ...readState(leaf.path),
      batch: {
        ...record,
        candidate: head,
        applied: false,
        tested_top: undefined,
        tested_main: undefined,
        decision: undefined,
      },
    });
    return { kind: 'refused', record, candidate: head, end };
  }
  saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: undefined } });
  return { kind: 'error', record, candidate: head, result: pushed, end };
}

async function restack(repo: Repo, leaf: Leaf, record: Batch): Promise<void> {
  const builtOn: string = await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  const holderHead: string = await command(['git', 'rev-parse', `refs/heads/${leaf.state.slug}`], repo.root);
  const staged: Awaited<ReturnType<typeof buildStack>> = await buildStack(
    repo,
    builtOn,
    holderHead,
    record.holder.head,
  );
  const top: string | undefined = await withLock(resolve(globalHome(), '.lock'), async () => {
    const current: Leaf = findLeaf(repo, leaf.state.slug);
    const batch: Batch | undefined = current.state.batch;
    if (batch?.attempt !== record.attempt || current.state.phase !== 'merge')
      throw new Error('Batch attempt superseded during restack; record left for the next pass');
    const applied: string | undefined =
      staged.ok && (await applyTop(repo, current, staged.top, holderHead)) ? staged.top : undefined;
    saveState(current.path, {
      ...readState(current.path),
      batch: {
        ...batch,
        built_on: applied === undefined ? batch.built_on : builtOn,
        applied: true,
        top: applied,
        candidate: undefined,
        tested_top: undefined,
        tested_main: undefined,
        decision: 'rerun',
      },
    });
    return applied;
  });
  console.log(
    top === undefined
      ? `rerun rebase ${leaf.state.slug} onto ${builtOn}`
      : `rerun tested=${record.tested_top ?? 'none'} pushed=${top}`,
  );
}

async function finishPush(
  repo: Repo,
  slug: string,
  pending: Exclude<BatchPending, { kind: 'none' }>,
  requested: Phase,
  slot: Slot | undefined,
  verdict: Verdict | undefined,
  reason: string | undefined,
  onCommitted: () => void,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  const fetched: Result = await run(['git', 'fetch', repo.config.remote], repo.root);
  if (fetched.code !== 0) {
    if (pending.kind === 'error')
      throw new Error(`Push failed (${pending.result.stderr}) and verification fetch failed: ${fetched.stderr}`);
    throw new CommandError(['git', 'fetch', repo.config.remote], repo.root, fetched);
  }
  const builtOn: string = await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  if (await isAncestor(repo.root, pending.candidate, builtOn)) {
    await withLock(resolve(globalHome(), '.lock'), async () => {
      const leaf: Leaf = findLeaf(repo, slug);
      const batch: Batch | undefined = leaf.state.batch;
      if (batch?.attempt !== pending.record.attempt || leaf.state.phase !== 'merge')
        throw new Error('Batch record changed while verifying the push');
      if (batch.recorded !== true) appendAttempt(repo, slug, batch, 'merged', pending.end);
      saveState(leaf.path, {
        ...leaf.state,
        batch: { ...batch, applied: true, top: pending.candidate, recorded: true },
      });
      await transition(repo, leaf, requested, slot, verdict, reason, false, onCommitted, batch.built_on);
    });
    return;
  }
  if (pending.kind === 'error')
    throw new Error(`Push failed: git push exited ${pending.result.code}: ${pending.result.stderr}`);
  await restack(repo, findLeaf(repo, slug), pending.record);
}

export async function phaseCommand(
  slug: string,
  rawPhase: string,
  rawSlot: string | boolean | undefined,
  rawVerdict: string | boolean | undefined,
  rawReason: string | boolean | undefined,
  rawCheck: string | boolean | undefined,
  rawAttempt: string | boolean | undefined,
  pressureDir: string = '/proc/pressure',
): Promise<{ repo: Repo; committed: boolean; to?: Phase }> {
  const requested: Phase = phaseSchema.parse(rawPhase);
  const slot: Slot | undefined = slotSchema.optional().parse(rawSlot);
  const verdict: Verdict | undefined = verdictSchema.optional().parse(rawVerdict);
  const reason: string | undefined = z.string().trim().min(1).optional().parse(rawReason);
  const check: boolean = z.literal(true).optional().parse(rawCheck) === true;
  const attempt: string | undefined = z.string().trim().min(1).optional().parse(rawAttempt);
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, process.cwd());
  let committed: boolean = false;
  let committedTo: Phase | undefined;
  let pending: BatchPending = { kind: 'none' };
  const onCommitted: () => void = () => {
    committedTo = requested;
    committed = true;
  };
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const leaf: Leaf = findLeaf(repo, slug);
    if (leaf.state.phase === 'merged' && !check) await completeOwner(repo, leaf, false);
    if (leaf.state.phase === 'merge' && (requested === 'merged' || requested === 'check.fix')) {
      const holder: Leaf | undefined = mergeQueue(global, allLeaves(repo), () => readLog(repo.root))[0]?.leaf;
      if (holder === undefined || holder.state.slug !== leaf.state.slug)
        throw new Error(
          holder === undefined
            ? `Merge turn refused: ${slug} is not eligible and no merge leaf in ${repo.name} is`
            : `Merge turn refused for ${slug}: holder is ${holder.state.slug}`,
        );
    }
    const record: Batch | undefined = leaf.state.batch;
    if (leaf.state.phase === 'merge' && requested === 'merged' && record === undefined)
      throw new Error(`Merged refused: ${slug} holds no batch record, so nothing was pushed`);
    if (leaf.state.phase === 'merge' && record !== undefined && (requested === 'merged' || requested === 'check.fix')) {
      if (slot !== undefined && attempt !== record.attempt)
        throw new Error(
          `Stale attempt ${attempt === undefined ? 'missing' : JSON.stringify(attempt)}: current batch attempt is ${record.attempt}`,
        );
      if (check) await batchCheck(repo, leaf, requested, slot, verdict, reason, record);
      else {
        const end: PressureSnapshot | undefined =
          record.pressure_start === undefined ? undefined : readPressure(pressureDir);
        if (requested === 'merged')
          pending = await batchPush(
            repo,
            leaf,
            requested,
            slot,
            verdict,
            reason,
            record,
            onCommitted,
            end,
            pressureDir,
          );
        else
          await transition(repo, leaf, requested, slot, verdict, reason, check, () => {
            appendAttempt(repo, leaf.state.slug, record, 'red', end);
            onCommitted();
          });
      }
    } else {
      await transition(repo, leaf, requested, slot, verdict, reason, check, onCommitted);
    }
  });
  if (pending.kind !== 'none')
    await finishPush(repo, slug, pending, requested, slot, verdict, reason, onCommitted, pressureDir);
  return { repo, committed, to: committedTo };
}
