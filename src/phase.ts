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
  type BatchMember,
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
import { appendAttempt } from './attempts';
import { mergeQueue, type QueueEntry } from './turn';
import { closeSources } from './pull';
import { testFile } from './test-files';
import { localBase, trackingRef } from './preflight';
import { writeHeld } from './hold';
import {
  applyStack,
  buildStack,
  equalOutsideRecordFolders,
  isAncestor,
  recordConfigEqual,
  restoreHolder,
  restoreMembers,
} from './batch';

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
    solo: to === 'merge' ? recorded.solo : undefined,
    batch_limit: to === 'merge' ? recorded.batch_limit : undefined,
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
  if (state.worktree !== undefined) await requireNoIssueFiles(repo, state.worktree, leaf.path);
  if (state.worktree !== undefined) await requireTestChangeCitations(repo, state.worktree);
  if (requested === 'check.review' && state.worktree !== undefined) await requireNonEmpty(repo, state.worktree);
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
    console.log('recorded');
    return;
  }
  const destination: Phase =
    state.phase === 'check.review'
      ? Object.values(recorded.verdict).includes('fix')
        ? 'check.repair'
        : 'merge'
      : requested;
  const capped: Phase =
    destination === 'check.fix' &&
    (state.phase === 'check.repair' || state.phase === 'merge') &&
    state.fix_rounds >= repo.config.fix_rounds
      ? 'failed'
      : destination;
  await commitMove(
    repo,
    leaf,
    recorded,
    capped,
    slot ?? null,
    capped === 'failed'
      ? { cause: 'attempts', phase: state.phase, slot: slot ?? required[0], reason: 'fix rounds exhausted' }
      : undefined,
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

export async function requireTestChangeCitations(
  repo: Repo,
  worktree: string,
  from: string = target(repo),
  to: string = 'HEAD',
): Promise<void> {
  const status: string = await command(['git', 'diff', '--no-renames', '--name-status', `${from}...${to}`], worktree);
  const changed: string[] = status
    .split('\n')
    .filter((line) => line.startsWith('M\t') || line.startsWith('D\t') || line.startsWith('T\t'))
    .map((line) => line.slice(line.indexOf('\t') + 1))
    .filter((path) => testFile(path));
  if (changed.length === 0) return;
  const log: string = await command(
    ['git', 'log', '--format=%(trailers:key=Test-Change,valueonly,unfold)', `${from}..${to}`],
    worktree,
  );
  const cited: Set<string> = new Set(
    log
      .split('\n')
      .map((value) => value.trim())
      .filter((value) => /^\S+\s+\S/.test(value))
      .map((value) => value.split(/\s/, 1)[0]),
  );
  const missing: string[] = changed.filter((path) => !cited.has(path));
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

function memberEntries(repo: Repo, record: Batch): { member: BatchMember; leaf: Leaf }[] {
  const leaves: Leaf[] = allLeaves(repo);
  return record.members.flatMap((member) => {
    const leaf: Leaf | undefined = leaves.find((item) => item.state.slug === member.slug);
    return leaf !== undefined && leaf.state.phase === 'merge' ? [{ member, leaf }] : [];
  });
}

async function mergeHead(repo: Repo, state: State, record: Batch): Promise<string> {
  if (state.worktree !== undefined) return command(['git', 'rev-parse', 'HEAD'], state.worktree);
  const ref: Result = await run(['git', 'rev-parse', `refs/heads/${state.slug}`], repo.root);
  if (ref.code === 0) return ref.stdout;
  if (record.top === undefined)
    throw new CommandError(['git', 'rev-parse', `refs/heads/${state.slug}`], repo.root, ref);
  return record.top;
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
  if (record.solo === true) {
    await requireNonEmpty(repo, worktree);
  } else {
    if (!record.applied || record.top === undefined || head !== record.top)
      throw new Error(`HEAD must equal the recorded batch top ${record.top}, found ${head}`);
    let predecessor: string = record.built_on;
    for (const member of record.members) {
      if (predecessor !== member.tip) {
        await requireNoIssueFiles(repo, repo.root, findLeaf(repo, member.slug).path, predecessor, member.tip);
        await requireTestChangeCitations(repo, repo.root, predecessor, member.tip);
        await requireNonEmpty(repo, repo.root, predecessor, member.tip);
      }
      predecessor = member.tip;
    }
    await requireNoIssueFiles(repo, repo.root, leaf.path, record.built_on, head);
    await requireTestChangeCitations(repo, repo.root, record.built_on, head);
  }
  await transition(repo, leaf, requested, slot, verdict, reason, true);
  if (record.decision !== 'reuse') {
    const testedMain: string = await command(['git', 'merge-base', head, trackingRef(repo)], repo.root);
    saveState(leaf.path, {
      ...readState(leaf.path),
      batch: { ...record, tested_top: head, tested_main: testedMain },
    });
  }
}

type BatchPending =
  | { kind: 'none' }
  | { kind: 'refused'; record: Batch; candidate: string }
  | { kind: 'error'; record: Batch; candidate: string; result: Result };

async function batchPush(
  repo: Repo,
  leaf: Leaf,
  requested: Phase,
  slot: Slot | undefined,
  verdict: Verdict | undefined,
  reason: string | undefined,
  record: Batch,
  onCommitted: () => void,
): Promise<BatchPending> {
  const members: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, record);
  if (members.length !== record.members.length) {
    await restoreMembers(
      repo,
      members.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
    );
    await restoreHolder(repo, leaf, record);
    saveState(leaf.path, { ...readState(leaf.path), batch: undefined });
    const departed: string[] = record.members
      .filter((member) => !members.some((entry) => entry.member.slug === member.slug))
      .map((member) => member.slug);
    throw new Error(`Member left merge, batch dissolved: ${departed.join(', ')}`);
  }
  const state: State = readState(leaf.path);
  const worktree: string = state.worktree ?? repo.root;
  const head: string = await mergeHead(repo, state, record);
  if (!record.applied) throw new Error('Batch record is not applied; a restack or the next pass owns it');
  if (record.solo !== true && head !== record.top)
    throw new Error(`HEAD must equal the recorded batch top ${record.top}, found ${head}`);
  if (slot !== undefined && head !== record.tested_top && !(record.decision === 'reuse' && head === record.top))
    throw new Error(`Untested top: ${head} does not match tested_top ${record.tested_top}`);
  await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: head } });
  const pushed: Result = await run(
    ['git', 'push', repo.config.remote, `${head}:refs/heads/${repo.config.default_branch}`],
    repo.root,
  );
  if (pushed.code === 0) {
    appendAttempt(repo, leaf.state.slug, record, record.decision === 'reuse' ? 'reuse' : 'merged');
    saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: head, recorded: true } });
    for (const entry of members)
      await commitMove(repo, entry.leaf, entry.leaf.state, 'merged', 'B', undefined, onCommitted);
    await transition(repo, leaf, requested, slot, verdict, reason, false, onCommitted);
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
    return { kind: 'refused', record, candidate: head };
  }
  saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, candidate: undefined } });
  return { kind: 'error', record, candidate: head, result: pushed };
}

async function worktreeDirty(repo: Repo, worktree: string | undefined): Promise<boolean> {
  if (worktree === undefined || !existsSync(worktree)) return false;
  return (await command(['git', '-C', worktree, 'status', '--porcelain'], repo.root)) !== '';
}

function memberHead(record: Batch, slug: string): string {
  return record.members.find((member) => member.slug === slug)!.head;
}

async function restack(repo: Repo, leaf: Leaf, record: Batch): Promise<void> {
  const builtOn: string = await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  const holderHead: string =
    record.solo === true
      ? await command(['git', 'rev-parse', `refs/heads/${leaf.state.slug}`], repo.root)
      : record.holder.head;
  let members: BatchMember[] = record.members;
  let conflicted: boolean = false;
  for (;;) {
    const items: { slug: string; base: string; head: string }[] = members.map((member) => ({
      slug: member.slug,
      base: record.members[record.members.findIndex((entry) => entry.slug === member.slug) - 1]?.tip ?? record.built_on,
      head: member.tip,
    }));
    const staged: Awaited<ReturnType<typeof buildStack>> = await buildStack(repo, builtOn, items, holderHead);
    if (staged.ok) {
      const tested: { main: string; top: string } | undefined =
        record.tested_main !== undefined && record.tested_top !== undefined
          ? { main: record.tested_main, top: record.tested_top }
          : undefined;
      const reuse: boolean =
        !conflicted &&
        tested !== undefined &&
        (await equalOutsideRecordFolders(repo, tested.main, builtOn)) &&
        (await equalOutsideRecordFolders(repo, tested.top, staged.top)) &&
        (await recordConfigEqual(repo, tested.main, builtOn));
      const applied: boolean | 'rebuild' | 'dirty-holder' = await withLock(resolve(globalHome(), '.lock'), async () => {
        const current: Leaf = findLeaf(repo, leaf.state.slug);
        const batch: Batch | undefined = current.state.batch;
        if (batch?.attempt !== record.attempt || current.state.phase !== 'merge') return false;
        if (
          batch.members.length !== members.length ||
          !members.every((m) => batch.members.some((b) => b.slug === m.slug))
        )
          return false;
        const staying: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, batch);
        if (staying.length !== batch.members.length) {
          await restoreMembers(
            repo,
            staying.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
          );
          await restoreHolder(repo, current, batch);
          saveState(current.path, { ...current.state, batch: undefined });
          throw new Error('Member left merge during restack, batch dissolved');
        }
        const dirty: string[] = [];
        for (const entry of staying)
          if (await worktreeDirty(repo, entry.leaf.state.worktree)) dirty.push(entry.member.slug);
        for (const slug of dirty)
          await command(['git', 'update-ref', 'refs/heads/' + slug, memberHead(batch, slug)], repo.root);
        if (dirty.length > 0) {
          members = batch.members.filter((member) => !dirty.includes(member.slug));
          saveState(current.path, {
            ...current.state,
            batch: { ...batch, holder: { base: builtOn, head: holderHead }, members },
          });
          return 'rebuild';
        }
        if (await worktreeDirty(repo, current.state.worktree)) {
          await restoreMembers(
            repo,
            staying.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
          );
          await command(['git', 'update-ref', 'refs/heads/' + current.state.slug, holderHead], repo.root);
          saveState(current.path, {
            ...current.state,
            batch: {
              ...batch,
              holder: { base: builtOn, head: holderHead },
              applied: true,
              solo: true,
              members: [],
              tested_top: undefined,
              tested_main: undefined,
              decision: 'rerun',
            },
          });
          return 'dirty-holder';
        }
        const appliedMembers: { member: BatchMember; leaf: Leaf }[] = members.map((member) => {
          const tip: string = staged.tips.get(member.slug)!;
          return { member: { ...member, tip }, leaf: findLeaf(repo, member.slug) };
        });
        const moved: { dirty: string[] } = await applyStack(
          repo,
          staged.top,
          appliedMembers.map((entry) => ({ slug: entry.member.slug, tip: entry.member.tip, leaf: entry.leaf })),
          current,
        );
        if (moved.dirty.length > 0) {
          const restored: { dirty: string[] } = await restoreMembers(repo, [
            ...staying.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
            { slug: current.state.slug, head: holderHead, leaf: current },
          ]);
          const lateDirty: Set<string> = new Set([...moved.dirty, ...restored.dirty]);
          members = batch.members.filter((member) => !lateDirty.has(member.slug));
          const solo: boolean = lateDirty.has(current.state.slug);
          saveState(current.path, {
            ...readState(current.path),
            batch: {
              ...batch,
              holder: { base: builtOn, head: holderHead },
              members: solo ? [] : members,
              applied: solo,
              solo: solo ? true : batch.solo,
              top: undefined,
              tested_top: undefined,
              tested_main: undefined,
              decision: 'rerun',
              candidate: undefined,
            },
          });
          return solo ? 'dirty-holder' : 'rebuild';
        }
        saveState(current.path, {
          ...current.state,
          batch: {
            ...batch,
            built_on: builtOn,
            holder: { base: builtOn, head: holderHead },
            applied: true,
            top: staged.top,
            members: appliedMembers.map((entry) => entry.member),
            candidate: undefined,
            tested_top: reuse ? tested!.top : undefined,
            tested_main: reuse ? tested!.main : undefined,
            decision: reuse ? 'reuse' : 'rerun',
          },
        });
        return true;
      });
      if (applied === 'rebuild') continue;
      if (applied === 'dirty-holder') {
        console.log(`rerun rebase ${leaf.state.slug} onto ${builtOn}`);
        return;
      }
      if (!applied) throw new Error('Batch attempt superseded during restack; record left for the next pass');
      console.log(`${reuse ? 'reuse' : 'rerun'} tested=${record.tested_top ?? 'none'} pushed=${staged.top}`);
      return;
    }
    conflicted = true;
    if (staged.conflict === holderHead) {
      await withLock(resolve(globalHome(), '.lock'), async () => {
        const current: Leaf = findLeaf(repo, leaf.state.slug);
        const batch: Batch | undefined = current.state.batch;
        if (batch?.attempt !== record.attempt || current.state.phase !== 'merge')
          throw new Error('Batch attempt superseded during restack');
        const staying: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, batch);
        await restoreMembers(
          repo,
          staying.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
        );
        await restoreHolder(repo, current, batch);
        saveState(current.path, {
          ...current.state,
          batch: {
            ...batch,
            holder: { base: builtOn, head: holderHead },
            applied: true,
            solo: true,
            members: [],
            tested_top: undefined,
            tested_main: undefined,
            decision: 'rerun',
          },
        });
      });
      console.log(`rerun rebase ${leaf.state.slug} onto ${builtOn}`);
      return;
    }
    const conflictedSlug: string = staged.conflict;
    await withLock(resolve(globalHome(), '.lock'), async () => {
      const current: Leaf = findLeaf(repo, leaf.state.slug);
      const batch: Batch | undefined = current.state.batch;
      if (batch?.attempt !== record.attempt || current.state.phase !== 'merge')
        throw new Error('Batch attempt superseded during restack');
      const entries: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, batch);
      const entry: { member: BatchMember; leaf: Leaf } | undefined = entries.find(
        (item) => item.member.slug === conflictedSlug,
      );
      await restoreMembers(
        repo,
        entries.map((item) => ({ ...item.member, leaf: item.leaf })),
      );
      await restoreHolder(repo, current, batch);
      if (entry !== undefined) saveState(entry.leaf.path, { ...entry.leaf.state, solo: true });
      members = batch.members.filter((member) => member.slug !== conflictedSlug);
      saveState(current.path, {
        ...current.state,
        batch: {
          ...batch,
          holder: { base: builtOn, head: holderHead },
          members,
          tested_top: undefined,
          tested_main: undefined,
          decision: 'rerun',
        },
      });
    });
  }
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
      if (batch.recorded !== true) appendAttempt(repo, slug, batch, batch.decision === 'reuse' ? 'reuse' : 'merged');
      saveState(leaf.path, {
        ...leaf.state,
        batch: { ...batch, applied: true, top: pending.candidate, recorded: true },
      });
      const members: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, batch);
      for (const entry of members)
        await commitMove(repo, entry.leaf, entry.leaf.state, 'merged', 'B', undefined, onCommitted);
      await transition(repo, leaf, requested, slot, verdict, reason, false, onCommitted);
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
  rawRedOnBase: string | boolean | undefined,
  rawCommand: string | boolean | undefined,
): Promise<{ repo: Repo; committed: boolean }> {
  const requested: Phase = phaseSchema.parse(rawPhase);
  const slot: Slot | undefined = slotSchema.optional().parse(rawSlot);
  const verdict: Verdict | undefined = verdictSchema.optional().parse(rawVerdict);
  const reason: string | undefined = z.string().trim().min(1).optional().parse(rawReason);
  const check: boolean = z.literal(true).optional().parse(rawCheck) === true;
  const attempt: string | undefined = z.string().trim().min(1).optional().parse(rawAttempt);
  const redOnBase: string | undefined = z.string().trim().min(1).optional().parse(rawRedOnBase);
  const cmd: string | undefined = z.string().trim().min(1).optional().parse(rawCommand);
  if (cmd !== undefined && redOnBase === undefined) throw new Error('--command requires --red-on-base');
  if (redOnBase !== undefined) {
    if (check) throw new Error('--check cannot combine with --red-on-base');
    if (requested !== 'check.fix') throw new Error('--red-on-base is only valid for check.fix');
    if (cmd === undefined) throw new Error('--red-on-base requires --command');
    if (slot !== 'B') throw new Error('--red-on-base requires --slot B');
  }
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, process.cwd());
  let committed: boolean = false;
  let pending: BatchPending = { kind: 'none' };
  const onCommitted: () => void = () => {
    committed = true;
  };
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const leaf: Leaf = findLeaf(repo, slug);
    if (leaf.state.phase === 'merged' && !check) await completeOwner(repo, leaf, false);
    if (leaf.state.phase === 'merge' && (requested === 'merged' || requested === 'check.fix')) {
      const holder: QueueEntry | undefined = mergeQueue(global, allLeaves(repo), () => readLog(repo.root))[0];
      if (holder === undefined || holder.leaf.state.slug !== leaf.state.slug)
        throw new Error(
          holder === undefined
            ? `Merge turn refused: ${slug} is not eligible and no merge leaf in ${repo.name} is`
            : `Merge turn refused for ${slug}: holder is ${holder.leaf.state.slug}`,
        );
    }
    const record: Batch | undefined = leaf.state.batch;
    if (redOnBase !== undefined && record === undefined)
      throw new Error(`--red-on-base requires a batch record: ${slug} holds none`);
    if (leaf.state.phase === 'merge' && record !== undefined && (requested === 'merged' || requested === 'check.fix')) {
      if (slot !== undefined && attempt !== record.attempt)
        throw new Error(
          `Stale attempt ${attempt === undefined ? 'missing' : JSON.stringify(attempt)}: current batch attempt is ${record.attempt}`,
        );
      if (check) await batchCheck(repo, leaf, requested, slot, verdict, reason, record);
      else if (redOnBase !== undefined) {
        await command(['git', 'fetch', repo.config.remote], repo.root);
        const baseSha: string = await localBase(repo);
        if (redOnBase !== baseSha)
          throw new Error(`--red-on-base ${redOnBase} is not fetched ${trackingRef(repo)} ${baseSha}`);
        const members: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, record);
        await restoreMembers(
          repo,
          members.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
        );
        await restoreHolder(repo, leaf, record);
        appendAttempt(repo, leaf.state.slug, record, 'held');
        saveState(leaf.path, { ...readState(leaf.path), batch: undefined });
        writeHeld(repo.name, {
          sha: redOnBase,
          command: cmd!,
          holder: leaf.state.slug,
          attempt: record.attempt,
          at: new Date().toISOString(),
          evidence: resolve(leaf.path, 'review-B.md'),
        });
        console.log(`held ${repo.name} on ${redOnBase}: ${cmd}`);
        committed = true;
        try {
          await herdrCall(
            [
              'notification',
              'show',
              `${repo.name} merge held on ${redOnBase.slice(0, 12)}`,
              '--body',
              cmd!,
              '--sound',
              'request',
            ],
            z.object({ shown: z.boolean(), reason: z.string() }),
            slug,
          );
        } catch (error) {
          console.warn(
            JSON.stringify({
              warning: 'hold notice failed',
              slug,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      } else if (requested === 'merged')
        pending = await batchPush(repo, leaf, requested, slot, verdict, reason, record, onCommitted);
      else if (record.members.length > 0) {
        const members: { member: BatchMember; leaf: Leaf }[] = memberEntries(repo, record);
        await restoreMembers(
          repo,
          members.map((entry) => ({ ...entry.member, leaf: entry.leaf })),
        );
        await restoreHolder(repo, leaf, record);
        const limit: number = Math.floor(record.members.length / 2);
        saveState(leaf.path, { ...readState(leaf.path), batch: undefined, batch_limit: limit });
        console.log(`batch split, holder keeps ${limit} of ${record.members.length} members`);
        appendAttempt(repo, leaf.state.slug, record, 'split');
        committed = true;
      } else
        await transition(repo, leaf, requested, slot, verdict, reason, check, () => {
          appendAttempt(repo, leaf.state.slug, record, 'red');
          onCommitted();
        });
    } else {
      await transition(repo, leaf, requested, slot, verdict, reason, check, onCommitted);
    }
  });
  if (pending.kind !== 'none') await finishPush(repo, slug, pending, requested, slot, verdict, reason, onCommitted);
  return { repo, committed };
}
