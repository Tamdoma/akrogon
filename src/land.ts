import { resolve } from 'node:path';
import { readGlobal, requireRepo, globalHome, toolRoot, type GlobalConfig, type Repo } from './config';
import { allLeaves, readState, saveState, withLock, type Batch, type Leaf, type MergeExit } from './state';
import { command, CommandError, spawnCaptured, type SpawnResult } from './shell';
import { commitMove, landClaim, landGates, landPush, StaleLandError, type LandPush } from './phase';
import { appendAttempt, readPressure, type PressureSnapshot } from './attempts';
import { readVerifyRuns, uncoveredMainRedUnits, verify, type Unit, type VerifyRun } from './verify';
import { leafSlice, sessionBusAddress } from './scope';
import { landedWake, mergeWake, phaseWake } from './next';

export function landUnit(attempt: string): string {
  return `akrogon-land-${attempt}`;
}

// A transient service, not a scope: systemd-run returns once the unit starts. Only the env set below
// reaches it, so it carries no seat identity.
export async function launchLand(repo: Repo, slug: string, attempt: string): Promise<void> {
  const argv: string[] = [
    'systemd-run',
    '--user',
    '--quiet',
    `--unit=${landUnit(attempt)}`,
    `--slice=${leafSlice(repo, slug)}`,
    '-p',
    'CollectMode=inactive-or-failed',
    '-p',
    'TimeoutStopSec=5',
    `--working-directory=${repo.root}`,
    `--setenv=PATH=${process.env.PATH ?? ''}`,
    `--setenv=HOME=${process.env.HOME ?? ''}`,
    `--setenv=XDG_RUNTIME_DIR=${process.env.XDG_RUNTIME_DIR ?? ''}`,
    `--setenv=DBUS_SESSION_BUS_ADDRESS=${sessionBusAddress()}`,
    ...(process.env.AKROGON_HOME === undefined ? [] : [`--setenv=AKROGON_HOME=${process.env.AKROGON_HOME}`]),
    '--',
    process.execPath,
    resolve(toolRoot, 'src/akrogon.ts'),
    'land',
    slug,
    '--attempt',
    attempt,
  ];
  const result: SpawnResult = await spawnCaptured(argv, {
    cwd: repo.root,
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
  });
  if (result.code !== 0) throw new CommandError(argv, repo.root, result);
}

export async function landAlive(attempt: string): Promise<boolean> {
  const result: SpawnResult = await spawnCaptured(['systemctl', '--user', 'is-active', landUnit(attempt)], {
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
  });
  return result.code === 0;
}

// The newest completed merge run on the worktree's tree, for the exit record's run field when the
// red verify surfaced no id (code 2).
async function redRunId(repo: Repo, worktree: string): Promise<string> {
  const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
  const runs: VerifyRun[] = readVerifyRuns(repo).filter(
    (run) => run.tree === tree && run.scope === 'merge' && run.end !== undefined,
  );
  const newest: VerifyRun | undefined = runs.sort((a, b) => b.end!.localeCompare(a.end!))[0];
  if (newest === undefined) throw new Error(`Red verify left no completed merge run for tree ${tree}`);
  return newest.run;
}

// The commit and the wakes of one repair exit: claim again under the lock so a state that moved on
// while the run worked is left alone, then free the merge line and prompt the repair seat.
export async function repairExit(
  global: GlobalConfig,
  repo: Repo,
  slug: string,
  attempt: string,
  exit: MergeExit,
  end?: PressureSnapshot,
): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const { leaf, record } = landClaim(repo, slug, attempt);
    appendAttempt(repo, slug, record, 'red', end);
    await commitMove(repo, leaf, leaf.state, 'check.repair', null, undefined, undefined, exit);
  });
  console.log(`repair ${slug} attempt=${attempt} reason=${exit.reason}`);
  await mergeWake(global, repo);
  await phaseWake(global, repo, slug);
}

// A second non-fast-forward refusal: the attempt is spent but the leaf keeps its queue place and
// the next pass rebuilds the batch on the fetched base.
async function keepPlace(
  global: GlobalConfig,
  repo: Repo,
  slug: string,
  attempt: string,
  end?: PressureSnapshot,
): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const { leaf, record } = landClaim(repo, slug, attempt);
    appendAttempt(repo, slug, record, 'red', end);
    saveState(leaf.path, { ...readState(leaf.path), batch: undefined });
  });
  console.log(`held ${slug} attempt=${attempt}`);
  await mergeWake(global, repo);
}

// A push error that is not a refusal: the leaf fails with git's stderr and frees the line.
async function commandFailed(
  global: GlobalConfig,
  repo: Repo,
  slug: string,
  attempt: string,
  stderr: string,
  end?: PressureSnapshot,
): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const { leaf, record } = landClaim(repo, slug, attempt);
    appendAttempt(repo, slug, record, 'red', end);
    await commitMove(repo, leaf, leaf.state, 'failed', null, {
      cause: 'blocked',
      phase: 'merge',
      reason: stderr,
    });
    // The attempt row is written: no candidate survives for reconcile to row a second time.
    saveState(leaf.path, { ...readState(leaf.path), batch: undefined });
  });
  await mergeWake(global, repo);
}

// Taken-8: the returning leaf's last red merge run sits on exactly the recorded holder head (no
// edit between exits), every failing unit names a real title, and at least one failing unit the
// main-red cover misses repeats in that previous run.
async function taken8Trigger(repo: Repo, record: Batch, runId: string, uncovered: Unit[]): Promise<boolean> {
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const current: VerifyRun | undefined = runs.find((run) => run.run === runId);
  if (current === undefined) return false;
  const previous: VerifyRun | undefined = runs
    .filter(
      (run) =>
        run.scope === 'merge' &&
        run.compares === undefined &&
        run.end !== undefined &&
        run.setup === 0 &&
        run.leaf === current.leaf &&
        run.run !== runId &&
        run.end <= current.start &&
        run.commands.some((item) => item.exit !== 0),
    )
    .sort((a, b) => b.end!.localeCompare(a.end!))[0];
  if (previous?.sha !== record.holder.head) return false;
  const { failedTests } = await import('./flaky');
  for (const unit of uncovered) {
    const prev = previous.commands.find((entry) => entry.name === unit.name && entry.command === unit.command);
    if (prev === undefined || prev.exit === 0 || prev.blocked !== undefined) continue;
    if ((prev.failures ?? (await failedTests(repo, prev.log))).includes(unit.test)) return true;
  }
  return false;
}

export async function land(
  global: GlobalConfig,
  repo: Repo,
  slug: string,
  attempt: string,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  const lock: string = resolve(globalHome(), '.lock');
  for (let refusals: number = 0; ;) {
    const { leaf, record } = await withLock(lock, async () => landClaim(repo, slug, attempt));
    const top: string | undefined = record.top ?? record.candidate;
    const result = await verify(repo.root, undefined, attempt, undefined, false);
    let coverRun: string | undefined;
    if (result.code !== 0) {
      if (result.code === 1) {
        const uncovered: Unit[] | undefined = await uncoveredMainRedUnits(repo, result.sha, result.id);
        if (uncovered?.length === 0) {
          coverRun = result.id;
        } else if (uncovered !== undefined && (await taken8Trigger(repo, record, result.id, uncovered))) {
          const verdict = await verify(repo.root, undefined, attempt, undefined, true);
          if (verdict.code === 0) {
            coverRun = result.id;
          } else {
            return repairExit(
              global,
              repo,
              slug,
              attempt,
              {
                reason: 'red',
                run: result.id,
                top,
                base_verdict: verdict.baseRun,
              },
              endOf(record, pressureDir),
            );
          }
        } else {
          return repairExit(
            global,
            repo,
            slug,
            attempt,
            { reason: 'red', run: result.id, top },
            endOf(record, pressureDir),
          );
        }
      } else {
        return repairExit(
          global,
          repo,
          slug,
          attempt,
          {
            reason: 'red',
            run: await redRunId(repo, leaf.state.worktree ?? repo.root),
            top,
          },
          endOf(record, pressureDir),
        );
      }
    }
    const refusal: string | undefined = await withLock(lock, async () => {
      const claimed = landClaim(repo, slug, attempt);
      try {
        await landGates(repo, claimed.leaf, claimed.record, coverRun);
        return undefined;
      } catch (error) {
        if (!(error instanceof Error) || error instanceof StaleLandError) throw error;
        return error.message;
      }
    });
    if (refusal !== undefined)
      return repairExit(global, repo, slug, attempt, { reason: 'gate', refusal, top }, endOf(record, pressureDir));
    const pushed: LandPush = await landPush(repo, slug, attempt, coverRun, pressureDir);
    if (pushed.kind === 'landed') return landedWake(global, repo, slug);
    if (pushed.kind === 'rebase')
      return repairExit(
        global,
        repo,
        slug,
        attempt,
        {
          reason: await dirtyOrConflict(repo, leaf.state.worktree),
          base: pushed.base,
          top,
        },
        endOf(record, pressureDir),
      );
    if (pushed.kind === 'error')
      return commandFailed(global, repo, slug, attempt, pushed.stderr, endOf(record, pressureDir));
    refusals += 1;
    if (refusals > 1) return keepPlace(global, repo, slug, attempt, endOf(record, pressureDir));
  }
}

// 'rebase' covers two exits: uncommitted work survives (dirty) and an apply failure is a conflict.
async function dirtyOrConflict(repo: Repo, worktree: string | undefined): Promise<'conflict' | 'dirty'> {
  if (worktree === undefined) return 'conflict';
  const status: string = await command(['git', 'status', '--porcelain'], worktree);
  return status === '' ? 'conflict' : 'dirty';
}

// The attempt row's end counter: absent without a stored start snapshot.
function endOf(record: Batch, pressureDir: string): PressureSnapshot | undefined {
  return record.pressure_start === undefined ? undefined : readPressure(pressureDir);
}

export async function landCommand(
  slug: string,
  attempt: string,
  pressureDir: string = '/proc/pressure',
): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, process.cwd());
  try {
    await land(global, repo, slug, attempt, pressureDir);
  } catch (error) {
    if (!(error instanceof StaleLandError)) throw error;
    console.log(error.message);
  }
}
