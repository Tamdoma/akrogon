import { existsSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { parseEnv } from 'node:util';
import { z } from 'zod';
import {
  readGlobal,
  readRepo,
  currentRepo,
  requireRepo,
  commonDirectory,
  globalHome,
  expandPath,
  within,
  seats,
  worktreeStore,
  ensureLeafTemp,
  repoPrefix,
  type Repo,
  type GlobalConfig,
} from './config';
import {
  readState,
  saveState,
  allLeaves,
  repoInventory,
  inventoryFailures,
  missingLeafMessage,
  findLeaf,
  withLock,
  broadcastPending,
  refusePredatesHc,
  type DeliveryError,
  type SeatDeliveryError,
  type Prompted,
  type Batch,
  type Broadcast,
  type Tool,
  type Leaf,
  type State,
  type Inventory,
} from './state';
import { requiredSlots, routing, type Phase, type Slot } from './routing';
import { command, run, CommandError, type Result } from './shell';
import {
  docGet,
  end,
  HcError,
  leafTab,
  renameTab,
  repoSpace,
  screen,
  send,
  sessions,
  terminal,
  terminals,
  windowOpen,
  type Seen,
  type SpaceResolution,
} from './hc';
import { expectedTabName, startSeat, type Place, type Started } from './seat';
import { transcriptFor } from './transcript';
import { checkBase, localBase, trackingRef } from './preflight';
import { checkLocation } from './guard';
import { attemptId, applyTop, branchSha, buildStack, isAncestor, memberBase, removeEmptyUntrackedDirs } from './batch';
import { clearBusyNotices, commandMerged, commitMove, completeOwner, repoNotices } from './phase';
import { noticeId, noticeState, removeNotice, writeNotice } from './notice';
import { landAlive, launchLand } from './land';
import { appendAttempt, readPressure, resolveTools, type PressureSnapshot } from './attempts';
import { readLog } from './log';
import { isPaused, readPaused } from './pause';
import { isStopped } from './stop';
import { selfUpdate } from './self-update';
import { blockDetail, dependentCounts, mergeQueue, twinConflict, type DepDetail, type QueueEntry } from './turn';
import { appendTiming, currentVisit, readTimings, recordWait, type WaitReason } from './timing';
import { closeMergedTab, leafSeats, reconcile, reconcileHost, reconcileNeedsPanes, type Seats } from './reconcile';

type Invocation = { skipped: Set<string>; dispatched: Set<string>; sessionRefusals: Set<string> };
type DispatchOutcome = 'completed' | 'waiting' | 'skipped';

function report(invocation: Invocation, repo: string, path: string, error: Error, slug?: string): void {
  const key: string = `${repo}/${path}`;
  const identity: string = `${repo}/slug:${slug}`;
  if (invocation.skipped.has(key) || (slug !== undefined && invocation.skipped.has(identity))) return;
  invocation.skipped.add(key);
  if (slug !== undefined) invocation.skipped.add(identity);
  console.error(JSON.stringify({ repo, path, ...(slug === undefined ? {} : { slug }), error: error.message }));
}

// The repo's hc session and space. A refused session is reported once per repo per invocation;
// an invocation-scope failure (the session list itself) once across repos.
async function placeFor(invocation: Invocation, repo: Repo, path: string, slug?: string): Promise<Place | null> {
  const resolution: SpaceResolution = await repoSpace(repo);
  if (resolution.ok) return { session: resolution.session, space: resolution.space.id };
  const key: string = resolution.scope === 'invocation' ? '*' : repo.name;
  if (!invocation.sessionRefusals.has(key)) {
    invocation.sessionRefusals.add(key);
    report(invocation, repo.name, path, new Error(resolution.reason), slug);
  }
  return null;
}

function liveSeat(t: Seen | undefined): t is Seen {
  return t !== undefined && t.state === 'live';
}

function discover(repo: Repo, invocation: Invocation): Inventory {
  const result: Inventory = repoInventory(repo);
  for (const entry of result.unreadable) report(invocation, repo.name, entry.path, new Error(entry.error));
  for (const entry of result.unknown) report(invocation, repo.name, entry.path, new Error(entry.error));
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
  return result;
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

const STALL_MS: number = 60 * 60 * 1000;

async function observeBusy(
  repo: Repo,
  path: string,
  state: State,
  seat: Slot,
  t: Seen,
  now: number,
): Promise<{ state: State; notified: boolean }> {
  const id: string = noticeId(repo.name, 'busy', state.slug, seat);
  if (t.status?.state !== 'working' && t.status?.state !== 'blocked') {
    if (state.busy_since[seat] === undefined && state.busy_notified[seat] === undefined)
      return { state, notified: false };
    if (state.busy_notified[seat] === 'pending') removeNotice(await repoNotices(repo), id);
    const cleared: State = {
      ...state,
      busy_since: { ...state.busy_since, [seat]: undefined },
      busy_notified: { ...state.busy_notified, [seat]: undefined },
    };
    saveState(path, cleared);
    return { state: cleared, notified: false };
  }
  const since: string = state.busy_since[seat] ?? new Date(now).toISOString();
  const observed: State = { ...state, busy_since: { ...state.busy_since, [seat]: since } };
  if (state.busy_since[seat] === undefined) saveState(path, observed);
  if (observed.busy_notified[seat] === 'pending') {
    if (noticeState(await repoNotices(repo), id) === 'pending') return { state: observed, notified: false };
    const shown: State = { ...observed, busy_notified: { ...observed.busy_notified, [seat]: 'shown' } };
    saveState(path, shown);
    return { state: shown, notified: false };
  }
  const elapsed: number = now - Date.parse(since);
  if (elapsed <= STALL_MS || observed.busy_notified[seat] !== undefined) return { state: observed, notified: false };
  const minutes: number = Math.floor(elapsed / 60000);
  writeNotice(await repoNotices(repo), id, {
    title: `Busy leaf: ${state.repo}/${state.slug} seat ${seat} ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`,
    body: '',
    attention: false,
  });
  const recorded: State = { ...observed, busy_notified: { ...observed.busy_notified, [seat]: 'pending' } };
  saveState(path, recorded);
  return { state: recorded, notified: true };
}

// Reconcile's view of the repo's session: every live terminal in it, labelled or not (plan D20). A
// refused session or a failed listing is unknown (null), which keeps every terminal-dependent item.
async function repoTerminals(repo: Repo): Promise<Seen[] | null> {
  const resolution: SpaceResolution = await repoSpace(repo);
  if (!resolution.ok) return null;
  return terminals(resolution.session, {}).catch((error: unknown): null => {
    if (error instanceof HcError) return null;
    throw error;
  });
}

// Every live session's terminals for the cross-session filesystem veto; no session folder or one
// failed listing makes the union unknown.
async function hostTerminals(): Promise<Seen[] | null> {
  try {
    const found: { live: string[] } = await sessions();
    return (await Promise.all(found.live.map((session: string) => terminals(session, {})))).flat();
  } catch (error) {
    if (error instanceof HcError || (error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
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
    const expectedCommon: string | null = await commonDirectory(repo.root);
    const actualCommon: string | null = await commonDirectory(path);
    if (expectedCommon === null || expectedCommon !== actualCommon) throw new Error(`Unrelated worktree: ${path}`);
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
  const registered: ReturnType<typeof registeredRepos> = registeredRepos(global, invocation);
  let total: number = registered.unknown ? global.max_active : 0;
  const unfinished = (leaf: Leaf): boolean => leaf.state.phase !== 'merged' && leaf.state.phase !== 'failed';
  const seated = (leaf: Leaf): boolean =>
    unfinished(leaf) && (leaf.state.tab !== undefined || leaf.state.worktree !== undefined);
  for (const repo of registered.repos) {
    const inventory: Inventory = discover(repo, invocation);
    const resolution: SpaceResolution = await repoSpace(repo);
    if (resolution.ok) {
      const live: Set<string | undefined> = new Set(
        (await terminals(resolution.session, { akrogon: '1', 'akrogon.repo': repo.name })).map(
          (t: Seen) => t.labels['akrogon.leaf'],
        ),
      );
      total +=
        (inventory.unknown.length > 0
          ? global.max_active
          : inventory.leaves.filter((leaf) => unfinished(leaf) && live.has(leaf.state.slug)).length) +
        inventory.unreadable.length;
    } else {
      // A refused or unreadable session counts unreadable plus unfinished, never max_active.
      total +=
        inventory.unreadable.length + (inventory.leaves.some(seated) ? inventory.leaves.filter(unfinished).length : 0);
    }
  }
  return total;
}

type Allocation = { state: State; place: Place; seats: Seats };

// One allocation for dispatch and the start verb (plan I2): the repo's space, a capacity check when
// the leaf holds no live seat, the worktree with its .env, the leaf temp folder and the leaf's tab id.
async function allocate(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  invocation: Invocation,
): Promise<Allocation | null> {
  refusePredatesHc(leaf.state);
  const place: Place | null = await placeFor(invocation, repo, leaf.path, leaf.state.slug);
  if (place === null) throw new Error(`Session refused for repo ${repo.name}`);
  repoPrefix(global, repo.name);
  const found: Seats = await leafSeats(place.session, repo, leaf.state);
  const live: boolean = liveSeat(found.A) || liveSeat(found.B);
  if (!live && (await activeCount(global, invocation)) >= global.max_active) return null;
  const worktree: State = await ensureWorktree(repo, leaf, live);
  ensureLeafTemp(repo, worktree.slug);
  const state: State = worktree.tab === undefined ? { ...worktree, tab: leafTab(repo.name, worktree.slug) } : worktree;
  saveState(leaf.path, state);
  return { state, place, seats: found };
}

function promptFor(state: State, slot: Slot, path: string, mergeContext?: string): string {
  const skill: string | null = routing[state.phase].skill;
  if (skill === null) throw new Error(`Leaf ${state.slug} is ${state.phase}: no phase task`);
  return (
    `${skill} ${state.slug} slot=${slot} phase=${state.phase} leaf=${path}` +
    (mergeContext === undefined ? '' : ` ${mergeContext}`)
  );
}

// Delivery to one seat (plan D13): start a missing or finished seat with the task; prompt a live idle
// seat once per turn; resettle a late start; fail the leaf on the third silent stop.
async function dispatchSlot(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  slot: Slot,
  prompt: string,
  attempt: string | undefined,
  allocation: { place: Place; seats: Seats },
): Promise<void> {
  const place: Place = allocation.place;
  const recorded: State = readState(leaf.path);
  if (recorded.phase !== leaf.state.phase || recorded.done.includes(slot)) return;
  const timing = async (outcome: 'delivered' | 'failed', address: string): Promise<void> => {
    const now: State = readState(leaf.path);
    appendTiming(repo, {
      kind: 'prompt',
      slug: now.slug,
      slot,
      phase: now.phase,
      visit: currentVisit(readLog(repo.root), now.slug, now.phase),
      session: await transcriptFor({ session: place.session, address }),
      outcome,
      ...(attempt === undefined ? {} : { attempt }),
    });
  };
  const prepare = async (): Promise<void> => {
    if (recorded.phase === 'merge' && recorded.worktree !== undefined && existsSync(recorded.worktree))
      await removeEmptyUntrackedDirs(recorded.worktree);
  };
  const known: Seen | undefined = allocation.seats[slot];
  const seat: Seen | undefined = known === undefined ? undefined : await terminal(place.session, known.address);
  if (seat === undefined || seat.state === 'finished') {
    if (seat !== undefined) await end(place.session, seat.address);
    await prepare();
    const started: Started = await startSeat(global, repo, { path: leaf.path, state: recorded }, slot, prompt, place);
    if (started.outcome === 'failed')
      throw new Error(`Seat ${slot} of ${recorded.slug} failed to start at ${started.seat.address}`);
    await timing(started.outcome === 'confirmed' ? 'delivered' : 'failed', started.seat.address);
    return;
  }
  const { state } = await observeBusy(repo, leaf.path, recorded, slot, seat, Date.now());
  const status: string | null = seat.status?.state ?? null;
  if (status !== 'idle' && status !== 'done') return;
  const deliver = async (): Promise<void> => {
    await prepare();
    const reply: { started: boolean | null; status: string | null; turn: number } = await send(
      place.session,
      seat.address,
      prompt,
    );
    const base: State = readState(leaf.path);
    saveState(
      leaf.path,
      reply.started === true
        ? {
            ...base,
            prompted: { ...base.prompted, [slot]: { turn: reply.turn, address: seat.address } },
            delivery_error: { ...base.delivery_error, [slot]: undefined },
            attempts: { ...base.attempts, [slot]: base.attempts[slot] + 1 },
          }
        : {
            ...base,
            delivery_error: {
              ...base.delivery_error,
              [slot]: {
                code: 'not_started',
                address: seat.address,
                turn: reply.turn,
                status: reply.status,
                screen: await screen(place.session, seat.address),
                at: new Date().toISOString(),
              },
            },
          },
    );
    await timing(reply.started === true ? 'delivered' : 'failed', seat.address);
  };
  const recordedError: DeliveryError | undefined = state.delivery_error[slot];
  const error: SeatDeliveryError | undefined =
    recordedError !== undefined && 'address' in recordedError && recordedError.address === seat.address
      ? recordedError
      : undefined;
  const recordedPrompt: Prompted | string | undefined = state.prompted[slot];
  // A recorded failed delivery waits while the seat's turn stands still; once it moved, the send is
  // resettled as delivered at the turn it went in at.
  if (error !== undefined && error.turn >= seat.turn) return;
  const prompted: Prompted | undefined =
    error !== undefined
      ? { turn: error.turn, address: seat.address }
      : typeof recordedPrompt === 'object' && recordedPrompt.address === seat.address
        ? recordedPrompt
        : undefined;
  if (error !== undefined)
    saveState(leaf.path, {
      ...state,
      prompted: { ...state.prompted, [slot]: prompted },
      delivery_error: { ...state.delivery_error, [slot]: undefined },
    });
  if (prompted === undefined) return deliver();
  if (prompted.turn >= seat.turn) return;
  const current: State = readState(leaf.path);
  if (current.attempts[slot] < 3) return deliver();
  await commitMove(repo, { path: leaf.path, state: current }, current, 'failed', slot, {
    cause: 'attempts',
    phase: current.phase,
    slot,
    reason: `seat ${slot} ended ${current.attempts[slot]} turns without reporting`,
  });
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
  const twin: { open: string; conflict: string } | null = twinConflict(repo, leaf.path);
  if (twin !== null) {
    report(
      invocation,
      repo.name,
      twin.open,
      new Error(`Twin owner folder: ${twin.open} conflicts with ${twin.conflict}`),
      slug,
    );
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
    // Resolution is lazy: it happens only when a seat read is coming, so
    // paused, stopped, merged and wait-listed leaves never cost a session list.
    const ownPlace = (): Promise<Place | null> => placeFor(invocation, repo, leaf.path, slug);
    if (
      state.phase !== 'merged' &&
      state.phase !== 'failed' &&
      (state.seat.A !== undefined || state.seat.B !== undefined)
    ) {
      const place: Place | null = await ownPlace();
      if (place === null) return 'skipped';
      const found: Seats = await leafSeats(place.session, repo, state);
      for (const seat of ['A', 'B'] as const) {
        const t: Seen | undefined = found[seat];
        if (liveSeat(t)) state = (await observeBusy(repo, leaf.path, state, seat, t, Date.now())).state;
      }
    }
    if (state.phase === 'merged') {
      await completeOwner(repo, { path: leaf.path, state }, false);
      recordWait(repo, slug, 'none');
      return 'completed';
    }
    if (state.phase === 'failed') {
      refusePredatesHc(state);
      state = await clearBusyNotices(repo, leaf.path, state);
      if (
        state.failure?.delivery === 'pending' &&
        noticeState(await repoNotices(repo), noticeId(repo.name, 'failed', slug)) === 'shown'
      ) {
        state = { ...state, failure: { ...state.failure, delivery: 'shown' } };
        saveState(leaf.path, state);
      }
      const tabbed: boolean = state.tab !== undefined && state.failure?.cause !== 'attempts';
      const place: Place | null = tabbed ? await ownPlace() : null;
      if (tabbed && place === null) return 'skipped';
      const live: boolean =
        place !== null &&
        (await terminals(place.session, { akrogon: '1', 'herdr.tab': z.string().parse(state.tab) })).length > 0;
      if (
        picked &&
        ((state.tab === undefined && state.worktree === undefined) || live || state.failure?.cause === 'attempts')
      )
        throw new Error(`Leaf is failed and needs phase recovery: ${slug}`);
      return end('none');
    }
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
      state.phase === 'merge' ? mergeQueue(global, repo, inventory.leaves, () => readLog(repo.root))[0] : undefined;
    if (state.phase === 'merge' && (turn?.leaf.state.slug !== slug || mergeContext === undefined))
      return end('merge_turn', turn === undefined || turn.leaf.state.slug === slug ? undefined : turn.leaf.state.slug);
    seats(global, repo, leaf.path);
    // Mirrors ensureWorktree's path: a missing worktree needs remote proof, an existing one only local.
    const mustCreate: boolean = !existsSync(resolve(worktreeStore(repo), slug));
    await checkBase(repo, mustCreate);
    if ((await ownPlace()) === null) return 'skipped';
    const allocated: Allocation | null = await allocate(global, repo, { path: leaf.path, state }, invocation);
    if (allocated === null) return end('none');
    for (const slot of requiredSlots(allocated.state.phase, allocated.state.fix_rounds)) {
      const delivery: string = `${repo.name}/${slug}/${allocated.state.phase}/${slot}`;
      if (invocation.dispatched.has(delivery)) continue;
      invocation.dispatched.add(delivery);
      await dispatchSlot(
        global,
        repo,
        { path: leaf.path, state: allocated.state },
        slot,
        promptFor(allocated.state, slot, leaf.path, mergeContext),
        attempt,
        allocated,
      );
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
  const closedRoot: string = resolve(repo.root, 'issues/closed');
  const closedSlugs: Set<string> = new Set(
    leaves.filter((leaf) => within(leaf.path, closedRoot)).map((leaf) => leaf.state.slug),
  );
  if (closedSlugs.size > 0)
    await sweep(
      global,
      repo,
      discover(repo, invocation).leaves.filter(
        (leaf) =>
          !within(leaf.path, closedRoot) && leaf.state['blocked-by'].some((slug: string) => closedSlugs.has(slug)),
      ),
      invocation,
      false,
      isAutomatic,
    );
  const ordered: Leaf[] = leaves
    .filter((leaf) => !within(leaf.path, closedRoot))
    .sort(
      (a, b) =>
        Number(b.state.phase === 'merged') - Number(a.state.phase === 'merged') ||
        (counts.get(b.state.slug) ?? 0) - (counts.get(a.state.slug) ?? 0),
    );
  for (const leaf of ordered) {
    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, picked, invocation, undefined, isAutomatic);
    if (outcome === 'completed') await dispatchDependents(global, repo, leaf.state.slug, invocation, isAutomatic);
  }
}

// A refused session or a failed write keeps the record as it was, so the next pass tries again.
async function mergeNotice(repo: Repo, slug: string, notified: Batch['notified']): Promise<Batch['notified']> {
  if (notified === 'shown') return notified;
  const id: string = noticeId(repo.name, 'merged', slug);
  try {
    const folder: string = await repoNotices(repo);
    if (notified === 'pending') return noticeState(folder, id);
    writeNotice(folder, id, {
      title: `${repo.name}/${slug} merged, move it back`,
      body: `next: akrogon phase ${slug} merge`,
      attention: true,
    });
    return 'pending';
  } catch (error) {
    console.warn(
      JSON.stringify({
        warning: 'merge notice failed',
        slug,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return notified;
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
    if (batch.owner === 'command' && (await landAlive(batch.attempt))) return;
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
      await commandMerged(repo, holderNow, z.string().parse(batch.candidate));
      const remaining: Leaf | undefined = allLeaves(repo).find((item) => item.state.slug === holder.state.slug);
      if (remaining !== undefined) saveState(remaining.path, { ...remaining.state, batch: undefined });
    } else if (holderNow.state.phase === 'failed') {
      const notified: Batch['notified'] = await mergeNotice(repo, holderNow.state.slug, batch.notified);
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
  await broadcastPass(global, repo, invocation);
  const inventory: Inventory = discover(repo, invocation);
  for (const leaf of inventory.leaves.filter((item) => item.state.batch !== undefined)) {
    try {
      await reconcileBatch(repo, leaf, invocation, isAutomatic, pressureDir);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, leaf.path, error, leaf.state.slug);
    }
  }
  const holder: Leaf | undefined = mergeQueue(global, repo, discover(repo, invocation).leaves, () =>
    readLog(repo.root),
  )[0]?.leaf;
  if (holder === undefined) return;
  if (isStopped(repo.name, holder.state.slug)) return;
  const recorded: Batch | undefined = holder.state.batch;
  if (recorded?.owner === 'command' && (await landAlive(recorded.attempt))) {
    recordWait(repo, holder.state.slug, 'merge_turn');
    return;
  }
  if (recorded !== undefined && recorded.applied === true) {
    if (recorded.top === undefined || recorded.owner !== 'command')
      await dispatchMergeLeaf(global, repo, holder, invocation, mergeContext(recorded), isAutomatic, recorded.attempt);
    else
      await withLock(resolve(globalHome(), '.lock'), async () => {
        const batch: Batch | undefined = readState(holder.path).batch;
        if (batch?.attempt !== recorded.attempt || batch.owner !== 'command' || (await landAlive(batch.attempt)))
          return;
        await launchLand(repo, holder.state.slug, batch.attempt);
      });
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
    if (fresh.state.batch?.owner === 'command' && (await landAlive(fresh.state.batch.attempt))) return;
    if (mergeQueue(global, repo, leaves, () => readLog(repo.root))[0]?.leaf.state.slug !== holder.state.slug) return;
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
          ? { ...fresh.state.batch, applied: true, top: staged.top, owner: 'command' }
          : { ...fresh.state.batch, applied: true };
      saveState(fresh.path, { ...readState(fresh.path), batch: applied });
      if (applied.owner === 'command') await launchLand(repo, holder.state.slug, applied.attempt);
      return applied;
    },
  );
  if (outcome !== undefined && outcome.owner !== 'command')
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
  return record.top === undefined
    ? `attempt=${record.attempt} solo`
    : `attempt=${record.attempt} top=${record.top}` +
        (record.wake === undefined ? '' : ` wake=${record.wake}`) +
        (record.red === undefined ? '' : ` red=${record.red}`);
}

// A command-run merge leaves the completing owner's broadcast to a broadcast-only B seat; prompted.B is its ack.
async function broadcastPass(global: GlobalConfig, repo: Repo, invocation: Invocation): Promise<void> {
  for (const pending of discover(repo, invocation).leaves.filter((leaf) => broadcastPending(leaf.state))) {
    try {
      await withLock(resolve(globalHome(), '.lock'), async () => {
        const fresh: Leaf | undefined = discover(repo, invocation).leaves.find(
          (leaf) => leaf.state.slug === pending.state.slug,
        );
        if (fresh === undefined || fresh.state.broadcast === undefined || !broadcastPending(fresh.state)) return;
        const handoff: Broadcast = fresh.state.broadcast;
        const allocated: Allocation | null = await allocate(global, repo, fresh, invocation);
        if (allocated === null) return;
        const sources: string = handoff.sources.length === 0 ? 'none' : handoff.sources.join(',');
        await dispatchSlot(
          global,
          repo,
          { path: fresh.path, state: allocated.state },
          'B',
          `broadcast-issue ${fresh.state.slug} slot=B owner=${handoff.kind}:${handoff.name} closed=${handoff.destination} sha=${handoff.pushed} sources=${sources} leaf=${fresh.path}`,
          undefined,
          allocated,
        );
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, pending.path, error, pending.state.slug);
    }
  }
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
    const holder: Leaf | undefined = mergeQueue(global, repo, discover(repo, invocation).leaves, () =>
      readLog(repo.root),
    )[0]?.leaf;
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
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
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

// A committed phase move dispatches its own leaf once (plan D14); the reporting seat is still working,
// so only a seat that is idle gets the new phase's task now and the rest wait for their turn end.
export async function phaseWake(global: GlobalConfig, repo: Repo, slug: string): Promise<void> {
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
  try {
    await withLock(resolve(globalHome(), '.lock'), async () => {
      const leaf: Leaf | undefined = discover(repo, invocation).leaves.find((item) => item.state.slug === slug);
      if (leaf === undefined) return;
      const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, false, invocation, undefined, true);
      if (outcome === 'completed') await dispatchDependents(global, repo, slug, invocation, true);
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    report(invocation, repo.name, repo.root, error, slug);
  }
}

// The start verb's leaf form: the dispatch allocation, then one seat started with the phase task
// or the given one.
export async function seatCommand(slug: string, slot: Slot, task: string | undefined): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, process.cwd());
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const leaf: Leaf = findLeaf(repo, slug);
    const allocated: Allocation | null = await allocate(global, repo, leaf, invocation);
    if (allocated === null) throw new Error(`No free seat capacity: max_active ${global.max_active} reached`);
    const started: Started = await startSeat(
      global,
      repo,
      { path: leaf.path, state: allocated.state },
      slot,
      task ?? promptFor(allocated.state, slot, leaf.path),
      allocated.place,
    );
    if (started.outcome === 'failed') process.exitCode = 1;
  });
}

// With a window open, every leaf tab that holds a live seat and shows another name is renamed to
// the leaf's expected name (plan D11).
async function renameTabs(repo: Repo, leaves: Leaf[]): Promise<void> {
  const resolution: SpaceResolution = await repoSpace(repo);
  if (!resolution.ok || !(await windowOpen(resolution.session))) return;
  const names: Map<string, string> = new Map(
    (await docGet(resolution.session)).spaces.flatMap((space) =>
      space.tabs.map((tab): [string, string] => [tab.id, tab.name]),
    ),
  );
  const seated: Set<string | undefined> = new Set(
    (await terminals(resolution.session, { akrogon: '1', 'akrogon.repo': repo.name })).map(
      (t: Seen) => t.labels['herdr.tab'],
    ),
  );
  for (const leaf of leaves) {
    const tab: string | undefined = leaf.state.tab;
    const name: string = expectedTabName(leaf.state);
    if (tab === undefined || !seated.has(tab) || names.get(tab) === name) continue;
    try {
      await renameTab(resolution.session, tab, name);
    } catch (error) {
      if (!(error instanceof CommandError)) throw error;
      console.warn(
        JSON.stringify({ warning: 'tab rename failed', slug: leaf.state.slug, tab, name, error: error.message }),
      );
    }
  }
}

// The land run's wake after its push: the next merge turn, the merged leaf's dependents, and its tab when no broadcast waits.
export async function landedWake(global: GlobalConfig, repo: Repo, slug: string): Promise<void> {
  await mergeWake(global, repo, 'merged');
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
  try {
    await dispatchDependents(global, repo, slug, invocation, true);
    const merged: Leaf | undefined = discover(repo, invocation).leaves.find((leaf) => leaf.state.slug === slug);
    if (merged !== undefined && merged.state.broadcast === undefined)
      await closeMergedTab(repo, merged, await repoTerminals(repo));
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    report(invocation, repo.name, repo.root, error, slug);
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
  const key = (match: { leaves: Leaf[] }): string =>
    match.leaves
      .map((leaf) => leaf.path)
      .sort()
      .join('\n');
  // Readings that start the same leaves are one target, unless an unreadable leaf under an owner leaves that unproven.
  const hidden: boolean = [...inventory.unreadable, ...inventory.unknown].some((entry) =>
    owners.some((owner) => within(entry.path, owner.path)),
  );
  if (matches.length > 0 && !hidden && matches.every((match) => key(match) === key(matches[0])))
    return matches[0].leaves;
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
    if (inventory.unreadable.length > 0 || inventory.unknown.length > 0 || inventory.foreign.length > 0)
      return { repo, leaves: selected };
    if (input !== undefined && !existsSync(folder)) throw new Error(missingLeafMessage(repo, input));
    throw new Error(`No leaves match: ${input ?? cwd}`);
  }
  return { repo, leaves: selected };
}

async function reconcileRepos(repos: Repo[], invocation: Invocation, isAutomatic: boolean): Promise<void> {
  let host: Promise<Seen[] | null> | undefined;
  const hostOnce = (): Promise<Seen[] | null> => host ?? (host = hostTerminals());
  const acting: Set<string> = new Set();
  for (const repo of repos) {
    if (isAutomatic && isPaused(repo.name)) continue;
    const inventory: Inventory = discover(repo, invocation);
    try {
      acting.add(repo.name);
      const needsPanes: boolean = await reconcileNeedsPanes(repo, inventory.leaves);
      const live: Seen[] | null = needsPanes ? await repoTerminals(repo) : [];
      const union: Seen[] | null = needsPanes ? await hostOnce() : [];
      await reconcile(repo, inventory.leaves, live, union, inventoryFailures(inventory));
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      report(invocation, repo.name, repo.root, error);
    }
  }
  await reconcileHost(registeredRepos(readGlobal(), invocation).repos, acting, null, hostOnce, repoTerminals);
}

export async function nextCommand(input: string | undefined, pressureDir: string = '/proc/pressure'): Promise<void> {
  readPaused();
  const global: GlobalConfig = readGlobal();
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
  const selection: Selection | undefined =
    input !== '--all' && input !== '--resume' && input !== '--wake'
      ? await selectLeaves(global, invocation, input)
      : undefined;
  const updating: Repo[] =
    input === '--wake'
      ? []
      : input === '--all' || input === '--resume'
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
        await reconcileRepos([selection.repo], invocation, false);
      } else if (input === '--all') {
        const current: Repo | null = await currentRepo(global, process.cwd());
        if (current === null) {
          await sweepAll(global, invocation, false);
          const registered: { repos: Repo[]; unknown: boolean } = registeredRepos(global, invocation);
          for (const repo of registered.repos) touched.set(repo.name, { repo, isAutomatic: false });
          await reconcileRepos(registered.repos, invocation, false);
        } else {
          await sweep(global, current, discover(current, invocation).leaves, invocation, true, false);
          touched.set(current.name, { repo: current, isAutomatic: false });
          await reconcileRepos([current], invocation, false);
        }
      } else if (input === '--resume' || input === '--wake') {
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
        await reconcileRepos(active, invocation, true);
      }
    });
    for (const { repo, isAutomatic } of touched.values()) {
      try {
        await mergePass(global, repo, invocation, isAutomatic, pressureDir);
        await renameTabs(repo, discover(repo, invocation).leaves);
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
  const invocation: Invocation = { skipped: new Set(), dispatched: new Set(), sessionRefusals: new Set() };
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
    await reconcileRepos([repo], invocation, false);
  });
  await mergePass(global, repo, invocation, false, pressureDir);
  if (invocation.skipped.size > 0)
    throw new Error(`Unpause pass incomplete for ${repo.name}: ${invocation.skipped.size} skipped`);
}
