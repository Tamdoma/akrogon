import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  base,
  readGlobal,
  readRepo,
  requireRepo,
  setupCommand,
  toolRoot,
  worktreeStore,
  type Repo,
  type RepoConfig,
} from './config';
import { failedTests } from './flaky';
import { checkLocation } from './guard';
import { createSparseWorktree, emitEnvFile } from './next';
import { trackingRef } from './preflight';
import { checkedRun, leafFields, leafTarget, refuse, type LeafTarget } from './run-check';
import { command, CommandError, run, spawnCaptured, type Result, type SpawnResult } from './shell';
import { repoSpace, type SpaceResolution } from './hc';
import { noticeFolder, noticeId, noticeState, writeNotice, type Notice } from './notice';
import { allLeaves, withLock, type Leaf } from './state';
import { isAncestor } from './batch';
import { callerScope } from './admission';
import { sessionBusAddress } from './scope';
import {
  bootId,
  listPassRecords,
  passCaller,
  passLive,
  passesRoot,
  passUnit,
  readPassRecord,
  writePassRecord,
  type PassRecord,
} from './verify-pass';

const verifyScopeSchema = z.enum(['leaf', 'merge']);

export type VerifyScope = z.infer<typeof verifyScopeSchema>;

export const verifyRunSchema = z.strictObject({
  run: z.string(),
  repo: z.string(),
  leaf: z.string(),
  sha: z.string(),
  tree: z.string(),
  scope: verifyScopeSchema,
  compares: z.string().optional(),
  patch_id: z.string().optional(),
  patch_base: z.string().optional(),
  notice: z.string().optional(),
  path: z.string(),
  pid: z.number().int(),
  boot_id: z.string(),
  setup: z.number().int().optional(),
  commands: z.array(
    z.strictObject({
      name: z.string(),
      command: z.string(),
      exit: z.number().int(),
      log: z.string(),
      reused: z.string().optional(),
      blocked: z.string().optional(),
      failures: z
        .array(z.string())
        .min(1)
        .refine((list) => new Set(list).size === list.length)
        .optional(),
    }),
  ),
  slow: z
    .strictObject({
      ms: z.number().int(),
      normal_ms: z.number().int(),
      first: z.strictObject({ run: z.string(), leaf: z.string() }).optional(),
      close: z.enum(['recovered', 'accepted']).optional(),
      notice: z.string().optional(),
      accepted_notice: z.string().optional(),
    })
    .optional(),
  start: z.string(),
  end: z.string().optional(),
});

export type VerifyRun = z.infer<typeof verifyRunSchema>;

type NamedCommand = { name: string; command: string };
type VerifyPass = { id: string; code: number };
type VerifyResult = VerifyPass & { sha: string; baseRun?: string };

function recordsPath(repo: Repo): string {
  return resolve(repo.root, 'issues/verify-runs.jsonl');
}

export function readVerifyRuns(repo: Repo): VerifyRun[] {
  const file: string = recordsPath(repo);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => verifyRunSchema.parse(JSON.parse(line)));
}

export function verifyCommands(config: RepoConfig, scope: VerifyScope): NamedCommand[] {
  const checks: [string, string][] = Object.entries(config.checks).filter(
    ([name]) => scope === 'leaf' || !config.merge_covers.includes(name),
  );
  const nonFull: [string, string][] = checks.filter(([name]) => !config.full.includes(name));
  const fullChecks: [string, string][] = checks.filter(([name]) => config.full.includes(name));
  return [...nonFull, ...fullChecks, ...(scope === 'merge' ? Object.entries(config.merge_checks) : [])].map(
    ([name, command]) => ({ name, command }),
  );
}

function treeOf(repo: Repo, sha: string): Promise<string> {
  return command(['git', 'rev-parse', `${sha}^{tree}`], repo.root);
}

async function patchBase(repo: Repo, sha: string, tree: string): Promise<string | undefined> {
  const argv: string[] = ['git', 'merge-base', sha, trackingRef(repo)];
  const base: Result = await run(argv, repo.root);
  if (base.code === 1) return undefined;
  if (base.code !== 0) throw new CommandError(argv, repo.root, base);
  return (await treeOf(repo, base.stdout)) === tree ? undefined : base.stdout;
}

async function replayTree(cwd: string, base: string, onto: string, head: string): Promise<string | undefined> {
  const argv: string[] = ['git', 'merge-tree', '--write-tree', '--no-messages', `--merge-base=${base}`, onto, head];
  const replay: Result = await run(argv, cwd);
  if (replay.code === 1) return undefined;
  if (replay.code !== 0) throw new CommandError(argv, cwd, replay);
  return replay.stdout;
}

// Replay the current change onto the previous merge base. The previous top may
// have been evicted. Confirm both tree IDs so neither replay can lose a change
// already present on the destination base.
async function inheritedPatchId(repo: Repo, current: VerifyRun, runs: VerifyRun[]): Promise<string | undefined> {
  const base: string | undefined = current.patch_base;
  if (base === undefined || current.scope !== 'merge' || current.compares !== undefined || !completed(current))
    return undefined;
  let previous: VerifyRun | undefined;
  for (const receipt of runs) {
    if (receipt.leaf !== current.leaf || receipt.scope !== 'merge' || receipt.compares !== undefined) continue;
    if (!completed(receipt) || receipt.end! > current.end!) continue;
    if (previous === undefined || receipt.end! >= previous.end!) previous = receipt;
  }
  if (previous?.patch_base === undefined || previous.patch_id === undefined) return undefined;
  if (base === previous.patch_base) return current.tree === previous.tree ? previous.patch_id : undefined;

  const priorBase: string[] = ['git', 'rev-parse', '--verify', '--quiet', `${previous.patch_base}^{commit}`];
  const anchor: Result = await run(priorBase, repo.root);
  if (anchor.code === 1) return undefined;
  if (anchor.code !== 0) throw new CommandError(priorBase, repo.root, anchor);
  const priorTree: string | undefined = await replayTree(repo.root, base, anchor.stdout, current.sha);
  if (priorTree !== previous.tree) return undefined;
  return (await replayTree(repo.root, anchor.stdout, base, priorTree)) === current.tree ? previous.patch_id : undefined;
}

function sameCommands(actual: readonly NamedCommand[], expected: readonly NamedCommand[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every((item, index) => item.name === expected[index].name && item.command === expected[index].command)
  );
}

function completed(run: VerifyRun): boolean {
  return run.end !== undefined && run.setup === 0;
}

function newest(runs: VerifyRun[]): VerifyRun | undefined {
  return [...runs].sort((a, b) => b.end!.localeCompare(a.end!))[0];
}

// A run that finished with setup passing, under the expected command set, and holds at least one failing command.
function redRun(repo: Repo, tree: string, expected: readonly NamedCommand[]): VerifyRun | undefined {
  return newest(
    readVerifyRuns(repo).filter(
      (run) =>
        run.tree === tree &&
        completed(run) &&
        sameCommands(run.commands, expected) &&
        run.commands.some((item) => item.exit !== 0),
    ),
  );
}

function greenRun(repo: Repo, tree: string, expected: readonly NamedCommand[]): VerifyRun | undefined {
  return readVerifyRuns(repo).find(
    (run) =>
      run.tree === tree &&
      completed(run) &&
      sameCommands(run.commands, expected) &&
      run.commands.every((item) => item.exit === 0),
  );
}

// A completed merge head run is checked against the normal; base comparisons
// and unfinished passes never are.
function slowChecked(run: VerifyRun): boolean {
  return run.scope === 'merge' && run.compares === undefined && run.end !== undefined;
}

// Only a fully executed green-setup run enters the normal: reused and blocked
// entries say nothing about the machine's real wall time.
function slowEligible(run: VerifyRun): boolean {
  return (
    slowChecked(run) &&
    run.setup === 0 &&
    run.commands.every((item) => item.reused === undefined && item.blocked === undefined)
  );
}

function median(values: number[]): number {
  const sorted: number[] = [...values].sort((a, b) => a - b);
  const mid: number = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function minutes(ms: number): number {
  return Math.round(ms / 60000);
}

// One eligible head row passes when it holds at least one red entry and every red entry's failed
// names also fail the same command on a completed base run linked from that head at the merge-base;
// a blocked entry never ran on the head and needs no cover, and a base entry at exit 0 never covers.
// A head entry whose log is gone is never covered; a head entry naming no test is covered only by a
// base entry of the same command also naming none, so a named-vs-nameless pair never covers.
async function knownRedReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<boolean> {
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  const tree: string = await treeOf(repo, sha);
  const heads: VerifyRun[] = runs.filter(
    (run) => run.tree === tree && completed(run) && sameCommands(run.commands, expected),
  );
  const mergeBase: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  for (const head of heads) {
    const covered: boolean = await (async () => {
      let red: number = 0;
      for (const entry of head.commands) {
        if (entry.exit === 0 || entry.blocked !== undefined) continue;
        red += 1;
        const names: string[] = await failedTests(repo, entry.log);
        if (names.includes('(log gone)')) return false;
        const onCoveredBase = async (): Promise<boolean> => {
          for (const baseRun of runs.filter(
            (run) => run.compares === head.run && run.sha === mergeBase && completed(run),
          )) {
            const onBase: VerifyRun['commands'][number] | undefined = baseRun.commands.find(
              (item) => item.name === entry.name && item.command === entry.command,
            );
            if (onBase === undefined || onBase.exit === 0 || onBase.blocked !== undefined) continue;
            const baseNames: string[] = await failedTests(repo, onBase.log);
            if (names.every((name) => baseNames.includes(name))) return true;
          }
          return false;
        };
        if (!(await onCoveredBase())) return false;
      }
      return red > 0;
    })();
    if (covered) return true;
  }
  return false;
}

// Identity is command name and string + failing test name; sha is evidence, not identity.
export type Unit = { name: string; command: string; test: string };

// A unit name that is a real test title: none of Bun's nameless forms.
function named(name: string): boolean {
  return (
    !name.startsWith('(unnamed)') && !name.startsWith('(script)') && name !== '(no test name)' && name !== '(log gone)'
  );
}

// One git-ancestry cache per caller: `onMain` tests membership on the tracked
// default branch, `before` tests sha ordering. Both read `isAncestor`.
async function mainAncestors(repo: Repo): Promise<{
  onMain: (sha: string) => Promise<boolean>;
  before: (a: string, b: string) => Promise<boolean>;
}> {
  const tip: string = await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  const cache: Map<string, boolean> = new Map();
  const before = async (a: string, b: string): Promise<boolean> => {
    const key: string = `${a}\0${b}`;
    if (!cache.has(key)) cache.set(key, await isAncestor(repo.root, a, b));
    return cache.get(key)!;
  };
  return { onMain: (sha: string) => before(sha, tip), before };
}

function matching(run: VerifyRun, unit: Unit): VerifyRun['commands'][number] | undefined {
  return run.commands.find(
    (item) => item.name === unit.name && item.command === unit.command && item.blocked === undefined,
  );
}

// A red observation `red` of `unit` resolves when a later completed run whose sha
// sits on landed main at or after red's sha shows the same command green, or red
// while naming only other real test titles. A nameless landed failure resolves
// nothing, and a run that ended no later than the observation is not later.
async function resolvedOnMain(
  repo: Repo,
  runs: VerifyRun[],
  red: VerifyRun,
  unit: Unit,
  onMain: (sha: string) => Promise<boolean>,
  before: (a: string, b: string) => Promise<boolean>,
): Promise<boolean> {
  for (const landed of runs) {
    if (!completed(landed)) continue;
    if (landed.end! <= red.end!) continue;
    const hit = matching(landed, unit);
    if (hit === undefined || hit.reused !== undefined) continue;
    if (!(await onMain(landed.sha))) continue;
    if (!(await before(red.sha, landed.sha))) continue;
    if (hit.exit === 0) return true;
    const names: string[] = hit.failures ?? (await failedTests(repo, hit.log));
    if (names.every((name) => named(name) && name !== unit.test)) return true;
  }
  return false;
}

// A completed merge run on the head tree is covered when it holds at least one
// red unit and every red unit is a named title a completed base run at or
// before the head's merge-base already fails, still unresolved on landed main.
// Unit names read stored `failures` first and the log second, as newRedUnits does.
export async function uncoveredMainRedUnits(repo: Repo, sha: string, runId?: string): Promise<Unit[] | undefined> {
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const tree: string = await treeOf(repo, sha);
  const expected: NamedCommand[] = verifyCommands(repo.config, 'merge');
  const heads: VerifyRun[] = runs.filter(
    (run) =>
      run.tree === tree && run.compares === undefined && run.end !== undefined && sameCommands(run.commands, expected),
  );
  const head: VerifyRun | undefined = runId === undefined ? newest(heads) : heads.find((run) => run.run === runId);
  if (head === undefined || !completed(head)) return undefined;
  const mergeBase: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  const { onMain, before } = await mainAncestors(repo);
  const covered = async (unit: Unit): Promise<boolean> => {
    for (const red of runs) {
      if (red.compares === undefined || !completed(red)) continue;
      const item = matching(red, unit);
      if (item === undefined || item.exit === 0 || item.reused !== undefined) continue;
      if (!(item.failures ?? (await failedTests(repo, item.log))).includes(unit.test)) continue;
      if (!(await before(red.sha, mergeBase))) continue;
      if (await resolvedOnMain(repo, runs, red, unit, onMain, before)) continue;
      return true;
    }
    return false;
  };
  let hasRed: boolean = false;
  const uncovered: Unit[] = [];
  for (const item of head.commands) {
    if (item.exit === 0 || item.blocked !== undefined) continue;
    for (const test of item.failures ?? (await failedTests(repo, item.log))) {
      if (!named(test)) return undefined;
      hasRed = true;
      const unit: Unit = { name: item.name, command: item.command, test };
      if (!(await covered(unit))) uncovered.push(unit);
    }
  }
  return hasRed ? uncovered : undefined;
}

export async function mainRedCover(repo: Repo, sha: string, runId?: string): Promise<boolean> {
  return (await uncoveredMainRedUnits(repo, sha, runId))?.length === 0;
}

// A pending notice covers only while its file waits in the folder; `error` never covers, `shown` and
// older herdr reason strings always do.
function noticeCovers(value: string | undefined, folder: string | null, id: string): boolean {
  return (
    value !== undefined &&
    value !== 'error' &&
    (value !== 'pending' || (folder !== null && noticeState(folder, id) === 'pending'))
  );
}

type NoticeTarget = { folder: string } | { folder: null; error: string };

async function noticeTarget(repo: Repo): Promise<NoticeTarget> {
  const space: SpaceResolution = await repoSpace(repo);
  if (!space.ok) return { folder: null, error: space.reason };
  try {
    return { folder: noticeFolder(space.session) };
  } catch (error) {
    return { folder: null, error: error instanceof Error ? error.message : String(error) };
  }
}

// A pending row whose file the handler removed was shown.
function foldShown(runs: VerifyRun[], folder: string | null): VerifyRun[] {
  if (folder === null) return runs;
  return runs.map((run): VerifyRun => ({
    ...run,
    ...(run.notice === 'pending' && noticeState(folder, noticeId(run.repo, 'main-red', run.run)) === 'shown'
      ? { notice: 'shown' }
      : {}),
    ...(run.slow === undefined || (run.slow.notice !== 'pending' && run.slow.accepted_notice !== 'pending')
      ? {}
      : {
          slow: {
            ...run.slow,
            ...(run.slow.notice === 'pending' &&
            noticeState(folder, noticeId(run.repo, 'merge-slow', run.slow.first!.run)) === 'shown'
              ? { notice: 'shown' }
              : {}),
            ...(run.slow.accepted_notice === 'pending' &&
            noticeState(folder, noticeId(run.repo, 'merge-slow-accepted', run.slow.first!.run)) === 'shown'
              ? { accepted_notice: 'shown' }
              : {}),
          },
        }),
  }));
}

// The notice file is written inside the locked rewrite that records it, so concurrent runs write one.
function recordNotice(target: NoticeTarget, id: string, notice: Notice): 'pending' | 'error' {
  if (target.folder === null) {
    process.stderr.write(`notice: ${target.error}\n`);
    return 'error';
  }
  try {
    writeNotice(target.folder, id, notice);
    return 'pending';
  } catch (error) {
    process.stderr.write(`notice: ${error instanceof Error ? error.message : String(error)}\n`);
    return 'error';
  }
}

// A green observation is a completed record with the unit's command green whose sha sits on landed
// main; a red observation R resolves when a green observation lands at or after R's sha.
async function newRedUnits(repo: Repo, me: VerifyRun, runs: VerifyRun[], folder: string | null): Promise<string[]> {
  const { onMain, before } = await mainAncestors(repo);
  const units: Unit[] = [];
  for (const item of me.commands) {
    if (item.exit === 0 || item.reused !== undefined || item.blocked !== undefined) continue;
    for (const test of item.failures ?? (await failedTests(repo, item.log)))
      units.push({ name: item.name, command: item.command, test });
  }
  const fresh: string[] = [];
  for (const unit of units) {
    let covered: boolean = false;
    for (const run of runs) {
      if (run.run === me.run || !completed(run)) continue;
      const item = matching(run, unit);
      if (item === undefined) continue;
      if (item.reused !== undefined) continue;
      if (item.exit === 0) continue;
      if (run.compares === undefined) continue;
      if (!(item.failures ?? (await failedTests(repo, item.log))).includes(unit.test)) continue;
      const resolved: boolean = await resolvedOnMain(repo, runs, run, unit, onMain, before);
      if (!resolved && noticeCovers(run.notice, folder, noticeId(repo.name, 'main-red', run.run))) {
        covered = true;
        break;
      }
    }
    if (!covered) fresh.push(unit.test);
  }
  return [...new Set(fresh)];
}

type SlowDecision = { slow: NonNullable<VerifyRun['slow']>; print?: string; send?: string; sendAccepted?: string };

// The episode's last 20 eligible in-episode rows ending at index; the index row
// counts by identity so a decision can see the run it is still stamping.
function episodeWindow(runs: VerifyRun[], index: number, first: string): VerifyRun[] {
  return runs
    .filter(
      (run, i) => i <= index && slowEligible(run) && (run.run === runs[index].run || run.slow?.first?.run === first),
    )
    .slice(-20);
}

// The accepted notice names the old normal, the episode window's median as the
// new normal, and the episode's first sighting.
function acceptedBody(first: { run: string; leaf: string }, oldNormal: number, window: VerifyRun[]): string {
  const newNormal: number = median(window.map((run) => Date.parse(run.end!) - Date.parse(run.start)));
  return (
    'merge slow accepted: ' +
    minutes(newNormal) +
    'm is the new normal (was ' +
    minutes(oldNormal) +
    'm); first seen at ' +
    first.leaf +
    ' ' +
    first.run
  );
}

// Decided once inside the run's locked final rewrite over earlier ledger rows
// only. An open episode pins its pre-jump
// normal; outside one the stored normal carries forward, lowered to the
// rolling last-20-eligible median when that median exists and is lower, with an
// accepted close resetting the baseline to that median outright. The bare
// median rule still stands when no row carries a stored normal.
function decideSlow(runs: VerifyRun[], index: number, folder: string | null): SlowDecision | undefined {
  const me: VerifyRun = runs[index];
  if (!slowChecked(me)) return undefined;
  const ms: number = Date.parse(me.end!) - Date.parse(me.start);
  const earlier: VerifyRun[] = runs.slice(0, index);
  const latest: VerifyRun | undefined = earlier.findLast((run) => run.slow !== undefined);
  const open: NonNullable<VerifyRun['slow']> | undefined =
    latest !== undefined && latest.slow!.first !== undefined && latest.slow!.close === undefined
      ? latest.slow!
      : undefined;
  let normal: number;
  if (open !== undefined) {
    normal = open.normal_ms;
  } else {
    const eligible: VerifyRun[] = earlier.filter(slowEligible).slice(-20);
    const rolling: number | undefined =
      eligible.length < 5 ? undefined : median(eligible.map((run) => Date.parse(run.end!) - Date.parse(run.start)));
    if (latest !== undefined && latest.slow!.close === 'accepted') {
      if (rolling === undefined) return undefined;
      normal = rolling;
    } else if (latest !== undefined) {
      normal = rolling === undefined ? latest.slow!.normal_ms : Math.min(latest.slow!.normal_ms, rolling);
    } else {
      if (rolling === undefined) return undefined;
      normal = rolling;
    }
  }
  const flagged: boolean = ms > 1.5 * normal && ms - normal >= 120000;
  const first: { run: string; leaf: string } | undefined = flagged
    ? (open?.first ?? { run: me.run, leaf: me.leaf })
    : open?.first;
  let close: 'recovered' | 'accepted' | undefined;
  let sendAccepted: string | undefined;
  if (open !== undefined) {
    const window: VerifyRun[] = [...earlier, me].filter(slowEligible).slice(-20);
    const episode: VerifyRun[] = episodeWindow(runs, index, open.first!.run);
    const m: number = median(episode.map((run) => Date.parse(run.end!) - Date.parse(run.start)));
    const firstRow: VerifyRun | undefined = earlier.find((run) => run.run === open.first!.run);
    if (!flagged && slowEligible(me) && episode.length >= 5 && !(m > 1.5 * normal && m - normal >= 120000))
      close = 'recovered';
    else if (
      window.length === 20 &&
      window.every((run) => run.run === me.run || run.slow?.first?.run === open.first!.run) &&
      firstRow !== undefined &&
      Date.parse(me.end!) - Date.parse(firstRow.end!) >= 14 * 24 * 60 * 60 * 1000
    ) {
      close = 'accepted';
      sendAccepted = acceptedBody(open.first!, normal, episode);
    }
  }
  const send: boolean =
    first !== undefined &&
    !earlier.some(
      (row) =>
        row.slow?.first?.run === first.run &&
        noticeCovers(row.slow!.notice, folder, noticeId(me.repo, 'merge-slow', first.run)),
    );
  const print: string | undefined =
    flagged || close === 'accepted'
      ? 'verify slow: ' +
        minutes(ms) +
        'm measured vs ' +
        minutes(normal) +
        'm normal; first seen at ' +
        first!.leaf +
        ' ' +
        first!.run +
        (close === 'accepted' ? '; accepted as new normal' : '')
      : undefined;
  return {
    slow: {
      ms,
      normal_ms: normal,
      ...(first === undefined ? {} : { first }),
      ...(close === undefined ? {} : { close }),
    },
    ...(print === undefined ? {} : { print }),
    ...(sendAccepted === undefined ? {} : { sendAccepted }),
    ...(send
      ? {
          send:
            'merge verify ' +
            minutes(ms) +
            'm vs ' +
            minutes(normal) +
            'm normal; first seen at ' +
            first!.leaf +
            ' ' +
            first!.run,
        }
      : {}),
  };
}

export async function requireGreenReceipt(
  repo: Repo,
  sha: string,
  scope: VerifyScope,
  coverRun?: string,
): Promise<void> {
  if (coverRun === undefined) {
    const tree: string = await treeOf(repo, sha);
    if (greenRun(repo, tree, verifyCommands(repo.config, scope)) !== undefined) return;
    if (await knownRedReceipt(repo, sha, scope)) return;
  }
  if (scope === 'merge' && (await mainRedCover(repo, sha, coverRun))) return;
  throw new Error(
    `No green ${scope} verify receipt for ${sha} under the current config; run akrogon verify on this commit`,
  );
}

async function recordLock(repo: Repo): Promise<string> {
  return resolve(repo.root, await command(['git', 'rev-parse', '--git-path', 'akrogon-verify-runs.lock'], repo.root));
}

async function verifyCaller(
  repo: Repo,
  cwd: string,
  attempt: string | undefined,
  holder: string | undefined,
): Promise<{ caller: LeafTarget; cwd: string }> {
  if (attempt === undefined) return { caller: await leafTarget(repo, cwd, undefined, holder), cwd };
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) => item.state.batch?.attempt === attempt && item.state.phase === 'merge',
  );
  if (leaf === undefined) throw new Error(`No merge leaf for attempt: ${attempt}`);
  return {
    caller: { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') },
    cwd: leaf.state.worktree ?? cwd,
  };
}

// The body of one pass, run inside the akrogon-verify-<id> service. Every
// resolved input arrives through the record the caller wrote, so a service
// checkout repeats the caller's exact decision surface.
async function runOnce(repo: Repo, record: PassRecord): Promise<VerifyRun> {
  const { run: id, sha, tree, scope, compares, akrogon_base: akrogonBase } = record;
  const caller: LeafTarget = passCaller(record);
  const target: string = resolve(worktreeStore(repo), `verify-${id}`);
  checkLocation(target);
  const lock: string = await recordLock(repo);
  mkdirSync(caller.target, { recursive: true });
  const ownBase: string | undefined = await patchBase(repo, sha, tree);
  const receipt: VerifyRun = {
    run: id,
    repo: repo.name,
    leaf: caller.slug,
    sha,
    tree,
    scope,
    ...(compares === undefined ? {} : { compares }),
    ...(ownBase === undefined ? {} : { patch_base: ownBase, patch_id: id }),
    path: target,
    pid: process.pid,
    boot_id: bootId(),
    commands: [],
    start: new Date().toISOString(),
  };
  await withLock(lock, async () => {
    appendFileSync(recordsPath(repo), JSON.stringify(receipt) + '\n');
  });
  const ran: VerifyRun['commands'] = [];
  let setupExit: number | undefined;
  let end: string | undefined;
  let slowPrint: string | undefined;
  try {
    await createSparseWorktree(repo, target, sha, { detach: true });
    await emitEnvFile(repo, target, repo.config.env);
    const setup: { code: number; log: string } = await checkedRun(
      repo,
      caller,
      akrogonBase,
      'setup',
      ['sh', '-c', setupCommand(repo.config, 'true')],
      target,
    );
    setupExit = setup.code;
    process.stdout.write(`verify setup: ${setup.code} ${setup.log}\n`);
    const expected: NamedCommand[] = record.commands;
    const members: NamedCommand[] = expected.slice(expected.length - record.member_count);
    const sequential: NamedCommand[] = expected.slice(0, expected.length - members.length);
    // Full checks run only behind a green setup and a green non-full stage;
    // a red full entry never blocks a later full entry.
    let blockedBy: { name: string; exit: number; log: string } | undefined;
    for (const item of sequential) {
      if (setup.code !== 0) {
        const blocked: boolean = repo.config.full.includes(item.name);
        ran.push({ ...item, exit: setup.code, log: setup.log, ...(blocked ? { blocked: 'setup' } : {}) });
        process.stdout.write(`verify ${item.name}: ${setup.code} ${setup.log}\n`);
        continue;
      }
      const isFull: boolean = repo.config.full.includes(item.name);
      if (isFull && blockedBy !== undefined) {
        ran.push({ ...item, exit: blockedBy.exit, log: blockedBy.log, blocked: blockedBy.name });
        process.stdout.write(
          `verify ${item.name}: blocked by ${blockedBy.name} (${blockedBy.exit}) ${blockedBy.log}\n`,
        );
        continue;
      }
      const { code, log }: { code: number; log: string } = await checkedRun(
        repo,
        caller,
        akrogonBase,
        item.name,
        ['sh', '-c', item.command],
        target,
      );
      const names: string[] | undefined = code === 0 ? undefined : await failedTests(repo, log);
      ran.push({
        ...item,
        exit: code,
        log,
        ...(names === undefined || names.includes('(log gone)') ? {} : { failures: names }),
      });
      process.stdout.write(`verify ${item.name}: ${code} ${log}\n`);
      if (code !== 0 && !isFull) blockedBy ??= { name: item.name, exit: code, log };
    }
    // A red sequential stage blocks the members: each is recorded with the blocker's exit and log.
    const blocker: { name: string; exit: number; log: string } | undefined =
      setup.code !== 0 ? { name: 'setup', exit: setup.code, log: setup.log } : ran.find((item) => item.exit !== 0);
    if (blocker !== undefined) {
      for (const item of members) {
        ran.push({ ...item, exit: blocker.exit, log: blocker.log, blocked: blocker.name });
        process.stdout.write(`verify ${item.name}: blocked by ${blocker.name} (${blocker.exit}) ${blocker.log}\n`);
      }
    } else {
      const settled: PromiseSettledResult<{ code: number; log: string }>[] = await Promise.allSettled(
        members.map((item) => checkedRun(repo, caller, akrogonBase, item.name, ['sh', '-c', item.command], target)),
      );
      let first: unknown;
      for (const [index, result] of settled.entries()) {
        if (result.status === 'rejected') {
          first ??= result.reason;
          continue;
        }
        const { code, log } = result.value;
        const names: string[] | undefined = code === 0 ? undefined : await failedTests(repo, log);
        ran.push({
          ...members[index],
          exit: code,
          log,
          ...(names === undefined || names.includes('(log gone)') ? {} : { failures: names }),
        });
        process.stdout.write(`verify ${members[index].name}: ${code} ${log}\n`);
      }
      if (first !== undefined) throw first;
    }
    end = new Date().toISOString();
  } finally {
    // Only base runs and merge runs reach the main-red or merge-slow logic.
    const notices: NoticeTarget =
      compares !== undefined || scope === 'merge'
        ? await noticeTarget(repo)
        : { folder: null, error: 'no notice folder resolved for this run' };
    await withLock(lock, async () => {
      const file: string = recordsPath(repo);
      const runs: VerifyRun[] = foldShown(readVerifyRuns(repo), notices.folder);
      let index: number = runs.findIndex((run) => run.run === id);
      if (index === -1) return;
      const finished: VerifyRun = {
        ...runs[index],
        ...(setupExit === undefined ? {} : { setup: setupExit }),
        commands: ran,
        ...(end === undefined ? {} : { end }),
      };
      const inherited: string | undefined = await inheritedPatchId(repo, finished, runs);
      runs[index] = inherited === undefined ? finished : { ...finished, patch_id: inherited };
      const checked: boolean = slowChecked(runs[index]);
      if (checked) {
        // A late completion belongs after prior decisions so their windows stay fixed.
        const latest: number = runs.findLastIndex(slowChecked);
        if (latest > index) {
          const [row]: VerifyRun[] = runs.splice(index, 1);
          runs.splice(latest, 0, row);
          index = latest;
        }
      }
      if (compares !== undefined && completed(runs[index])) {
        const names: string[] = await newRedUnits(repo, runs[index], runs, notices.folder);
        if (names.length > 0)
          runs[index] = {
            ...runs[index],
            notice: recordNotice(notices, noticeId(repo.name, 'main-red', id), {
              title: `${repo.name} main red`,
              body: `${names.length} new red on main: ${names.slice(0, 3).join(', ')}; receipt ${id}; chart a repair`,
              attention: false,
            }),
          };
      }
      const decision: SlowDecision | undefined = decideSlow(runs, index, notices.folder);
      if (decision !== undefined) {
        runs[index] = {
          ...runs[index],
          slow:
            decision.send === undefined
              ? decision.slow
              : {
                  ...decision.slow,
                  notice: recordNotice(notices, noticeId(repo.name, 'merge-slow', decision.slow.first!.run), {
                    title: `${repo.name} merge slow`,
                    body: decision.send,
                    attention: false,
                  }),
                },
        };
        slowPrint = decision.print;
      }
      const accepted: number = checked ? runs.findLastIndex((run) => run.slow?.close === 'accepted') : -1;
      if (accepted !== -1) {
        const slow: NonNullable<VerifyRun['slow']> = runs[accepted].slow!;
        // foldShown handles consumption. A pending send already succeeded.
        if (slow.accepted_notice === undefined || slow.accepted_notice === 'error') {
          const acceptedId: string = noticeId(repo.name, 'merge-slow-accepted', slow.first!.run);
          const body: string =
            accepted === index && decision !== undefined && decision.sendAccepted !== undefined
              ? decision.sendAccepted
              : acceptedBody(slow.first!, slow.normal_ms, episodeWindow(runs, accepted, slow.first!.run));
          runs[accepted] = {
            ...runs[accepted],
            slow: {
              ...slow,
              accepted_notice: recordNotice(notices, acceptedId, {
                title: `${repo.name} merge slow accepted`,
                body,
                attention: false,
              }),
            },
          };
        }
      }
      const temporary: string = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
      renameSync(temporary, file);
    });
    if (slowPrint !== undefined) process.stdout.write(slowPrint + '\n');
    if (existsSync(target)) await command(['git', 'worktree', 'remove', '--force', target], repo.root);
  }
  return {
    ...receipt,
    ...(setupExit === undefined ? {} : { setup: setupExit }),
    commands: ran,
    ...(end === undefined ? {} : { end }),
  };
}

function reportRun(scope: VerifyScope, run: VerifyRun): number {
  const green: boolean = run.setup === 0 && run.commands.every((item) => item.exit === 0);
  process.stdout.write(`verify ${scope} ${run.sha}: ${green ? 'green' : 'red'}\n`);
  return green ? 0 : 1;
}

// Names the service inherits from the caller: the check environment policy is
// unchanged, these only carry what the caller's own constructedEnv and
// overrides already select, plus the unit-level paths.
const passForwarded: readonly string[] = [
  'HOME',
  'PATH',
  'AKROGON_HOME',
  'AKROGON_LEAF_TEMP_ROOT',
  'AKROGON_RETIRED_TEMP_ROOT',
  'AKROGON_PROC_ROOT',
  'AKROGON_CGROUP_ROOT',
  'AKROGON_RUN_SLICE',
  'AKROGON_RUN',
  'AKROGON_CAPTURES',
  'XDG_RUNTIME_DIR',
  'XDG_CACHE_HOME',
  'NODE_DISABLE_COMPILE_CACHE',
  'FAKE_SYSTEMD_RUN_LOG',
  'FAKE_SYSTEMCTL_DB',
  'FAKE_SYSTEMCTL_LOG',
];

async function launchPass(repo: Repo, record: PassRecord, dir: string): Promise<void> {
  const names: string[] = [...new Set([...passForwarded, ...repo.config.env, ...repo.config.pass_env])];
  const argv: string[] = [
    'systemd-run',
    '--user',
    '--quiet',
    `--unit=${record.unit_name}`,
    '--slice=akrogon.slice',
    '-p',
    'CollectMode=inactive-or-failed',
    '-p',
    'TimeoutStopSec=5',
    `--working-directory=${record.root}`,
    `--setenv=DBUS_SESSION_BUS_ADDRESS=${sessionBusAddress()}`,
    ...names.filter((name) => process.env[name] !== undefined).map((name) => `--setenv=${name}=${process.env[name]}`),
    '--',
    'env',
    `AKROGON_SCOPE=${record.caller_scope}`,
    process.execPath,
    resolve(toolRoot, 'src/akrogon.ts'),
    'verify-pass',
    dir,
  ];
  const result: SpawnResult = await spawnCaptured(argv, {
    cwd: record.root,
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
  });
  if (result.code !== 0) throw new CommandError(argv, record.root, result);
}

// The waiter replays the pass's streams and returns its recorded outcome; a
// dead pass with no status is a failure, never a join or a green.
async function waitPass(dir: string): Promise<number> {
  let outOffset: number = 0;
  let errOffset: number = 0;
  const drain = (file: string, offset: number): { chunk: string; offset: number } => {
    if (!existsSync(file)) return { chunk: '', offset };
    const buffer: Buffer = readFileSync(file);
    return { chunk: buffer.subarray(offset).toString('utf8'), offset: buffer.length };
  };
  for (;;) {
    const out = drain(resolve(dir, 'out'), outOffset);
    outOffset = out.offset;
    process.stdout.write(out.chunk);
    const err = drain(resolve(dir, 'err'), errOffset);
    errOffset = err.offset;
    process.stderr.write(err.chunk);
    const record: PassRecord | undefined = readPassRecord(dir);
    if (record === undefined || !passLive(record)) {
      const lastOut = drain(resolve(dir, 'out'), outOffset);
      process.stdout.write(lastOut.chunk);
      const lastErr = drain(resolve(dir, 'err'), errOffset);
      process.stderr.write(lastErr.chunk);
      const status: string = resolve(dir, 'status');
      return existsSync(status) ? Number.parseInt(readFileSync(status, 'utf8'), 10) : 1;
    }
    await Bun.sleep(200);
  }
}

type PassKey = Pick<PassRecord, 'caller' | 'caller_scope' | 'tree' | 'scope' | 'setup' | 'compares' | 'commands'>;

function samePass(record: PassRecord, key: PassKey): boolean {
  return (
    record.caller_scope === key.caller_scope &&
    record.caller.target === key.caller.target &&
    record.caller.slug === key.caller.slug &&
    record.caller.unit === key.caller.unit &&
    record.caller.scope === key.caller.scope &&
    record.tree === key.tree &&
    record.scope === key.scope &&
    record.setup === key.setup &&
    record.compares === key.compares &&
    sameCommands(record.commands, key.commands)
  );
}

function livePass(repo: Repo, key: PassKey): { dir: string; record: PassRecord } | undefined {
  return listPassRecords().find(
    (entry) => entry.record.repo === repo.name && passLive(entry.record) && samePass(entry.record, key),
  );
}

// One live pass per join key: under the receipt lock either an existing live
// pass is joined or a new pending record claims the key before the launch.
async function passOnce(
  repo: Repo,
  caller: LeafTarget,
  sha: string,
  scope: VerifyScope,
  akrogonBase: string,
  compares?: string,
): Promise<VerifyPass> {
  const tree: string = await treeOf(repo, sha);
  const lock: string = await recordLock(repo);
  const memberCount: number = scope === 'merge' ? Object.keys(repo.config.merge_checks).length : 0;
  const fields = {
    caller: {
      slug: caller.slug,
      target: caller.target,
      scope: caller.scope,
      ...(caller.unit === undefined ? {} : { unit: caller.unit }),
      ...(caller.phase === undefined ? {} : { phase: caller.phase }),
      ...(caller.attempt === undefined ? {} : { attempt: caller.attempt }),
    },
    caller_scope: callerScope(),
    sha,
    tree,
    scope,
    commands: verifyCommands(repo.config, scope),
    member_count: memberCount,
    setup: setupCommand(repo.config, 'true'),
    akrogon_base: akrogonBase,
    ...(compares === undefined ? {} : { compares }),
  };
  let launched: { dir: string; record: PassRecord } | undefined;
  const dir: string = await withLock(lock, async (): Promise<string> => {
    const live: { dir: string; record: PassRecord } | undefined = livePass(repo, fields);
    if (live !== undefined) return live.dir;
    const id: string = randomUUID();
    const fresh: string = resolve(passesRoot(), id);
    mkdirSync(fresh, { recursive: true });
    const record: PassRecord = {
      run: id,
      repo: repo.name,
      root: repo.root,
      unit_name: passUnit(id),
      ...fields,
      pid: 0,
      boot_id: bootId(),
      pending: true,
      created: new Date().toISOString(),
    };
    writePassRecord(fresh, record);
    launched = { dir: fresh, record };
    return fresh;
  });
  const record: PassRecord = launched === undefined ? readPassRecord(dir)! : launched.record;
  process.stderr.write(`run ${record.run}\n`);
  if (launched !== undefined) {
    try {
      await launchPass(repo, launched.record, dir);
    } catch (error) {
      rmSync(dir, { recursive: true, force: true });
      throw error;
    }
  }
  return { id: record.run, code: await waitPass(dir) };
}

// The service entry point: run one pass from its record, tee output into the
// pass dir, and leave the exit status for every waiter.
export async function verifyPassCommand(dir: string): Promise<void> {
  const record: PassRecord | undefined = readPassRecord(dir);
  if (record === undefined) throw new Error(`No pass record in ${dir}`);
  writePassRecord(dir, { ...record, pid: process.pid, boot_id: bootId(), pending: false });
  process.env.AKROGON_SCOPE = record.caller_scope;
  const patch = (stream: NodeJS.WriteStream, file: string): void => {
    const original: typeof stream.write = stream.write.bind(stream);
    stream.write = ((chunk: string | Uint8Array, ...rest: unknown[]): boolean => {
      try {
        appendFileSync(file, chunk);
      } catch {
        // A pass dir that vanished keeps the stream alive; the outcome is the
        // status file, not the tee.
      }
      return (original as (...args: unknown[]) => boolean)(chunk, ...rest);
    }) as typeof stream.write;
  };
  patch(process.stdout, resolve(dir, 'out'));
  patch(process.stderr, resolve(dir, 'err'));
  const repo: Repo = readRepo(record.repo, record.root);
  let status: number;
  try {
    status = reportRun(record.scope, await runOnce(repo, record));
  } catch (error) {
    status = 2;
    writeFileSync(resolve(dir, 'status'), `${status}\n`);
    throw error;
  }
  writeFileSync(resolve(dir, 'status'), `${status}\n`);
}

export async function verify(
  cwd: string,
  rev: string | undefined,
  attempt: string | undefined,
  holder: string | undefined,
  knownRed: boolean,
): Promise<VerifyResult> {
  if (attempt !== undefined && holder !== undefined) throw new Error('Use --attempt or --holder, not both');
  refuse();
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const { caller, cwd: at }: { caller: LeafTarget; cwd: string } = await verifyCaller(repo, cwd, attempt, holder);
  const scope: VerifyScope = caller.phase === undefined || caller.phase === 'merge' ? 'merge' : 'leaf';
  const sha: string = await command(['git', 'rev-parse', '--verify', `${rev ?? 'HEAD'}^{commit}`], at);
  const tree: string = await treeOf(repo, sha);
  const live: { dir: string; record: PassRecord } | undefined = await withLock(await recordLock(repo), async () =>
    livePass(repo, {
      caller,
      caller_scope: callerScope(),
      tree,
      scope,
      setup: setupCommand(repo.config, 'true'),
      commands: verifyCommands(repo.config, scope),
    }),
  );
  if (live !== undefined) process.stderr.write(`run ${live.record.run}\n`);
  const joined: VerifyPass | undefined =
    live === undefined ? undefined : { id: live.record.run, code: await waitPass(live.dir) };
  const reused: VerifyRun | undefined =
    joined === undefined ? greenRun(repo, tree, verifyCommands(repo.config, scope)) : undefined;
  if (reused !== undefined) {
    process.stdout.write(`reuse receipt ${reused.run} tree=${tree}\n`);
    return { id: reused.run, code: 0, sha };
  }
  const akrogonBase: string = await base(repo, at);
  if (!knownRed) return { ...(joined ?? (await passOnce(repo, caller, sha, scope, akrogonBase))), sha };
  const recorded: VerifyRun | undefined =
    joined === undefined ? redRun(repo, tree, verifyCommands(repo.config, scope)) : undefined;
  let headId: string;
  if (recorded === undefined) {
    const head: VerifyPass = joined ?? (await passOnce(repo, caller, sha, scope, akrogonBase));
    headId = head.id;
    if (head.code !== 1) return { ...head, sha };
  } else headId = recorded.run;
  const baseSha: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  const baseTree: string = await treeOf(repo, baseSha);
  const greenBase: VerifyRun | undefined = greenRun(repo, baseTree, verifyCommands(repo.config, scope));
  const comparison: VerifyPass =
    greenBase === undefined
      ? await passOnce(repo, caller, baseSha, scope, baseSha, headId)
      : { id: greenBase.run, code: 0 };
  if (comparison.code === 2) return { id: headId, code: comparison.code, sha, baseRun: comparison.id };
  const pass: boolean = greenBase === undefined && (await knownRedReceipt(repo, sha, scope));
  process.stdout.write(`verify known-red ${sha}: ${pass ? 'pass' : 'fail'}\n`);
  return { id: headId, code: pass ? 0 : 1, sha, baseRun: comparison.id };
}
