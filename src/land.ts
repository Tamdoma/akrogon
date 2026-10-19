import { resolve } from 'node:path';
import { readGlobal, requireRepo, globalHome, toolRoot, type GlobalConfig, type Repo } from './config';
import { readState, saveState, withLock, type Batch } from './state';
import { command, CommandError, spawnCaptured, type SpawnResult } from './shell';
import { landClaim, landGates, landPush, StaleLandError, type LandPush } from './phase';
import { readVerifyRuns, verify, type VerifyRun } from './verify';
import { leafSlice, sessionBusAddress } from './scope';
import { landedWake, mergeWake } from './next';

type Handoff = Pick<Batch, 'wake' | 'red' | 'refusal'>;

export function landUnit(attempt: string): string {
  return `akrogon-land-${attempt}`;
}

// A transient service, not a scope: systemd-run returns once the unit starts. No HERDR_PANE_ID, so moves name no seat.
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
    `--setenv=DBUS_SESSION_BUS_ADDRESS=${sessionBusAddress()}`,
    ...(process.env.AKROGON_HOME === undefined ? [] : [`--setenv=AKROGON_HOME=${process.env.AKROGON_HOME}`]),
    ...(process.env.HERDR_SOCKET_PATH === undefined
      ? []
      : [`--setenv=HERDR_SOCKET_PATH=${process.env.HERDR_SOCKET_PATH}`]),
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

async function redRun(repo: Repo, worktree: string): Promise<string> {
  const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
  const runs: VerifyRun[] = readVerifyRuns(repo).filter(
    (run) => run.tree === tree && run.scope === 'merge' && run.end !== undefined,
  );
  const newest: VerifyRun | undefined = runs.sort((a, b) => b.end!.localeCompare(a.end!))[0];
  if (newest === undefined) throw new Error(`Red verify left no completed merge run for tree ${tree}`);
  return newest.run;
}

async function handOff(
  global: GlobalConfig,
  repo: Repo,
  slug: string,
  attempt: string,
  fields: Handoff,
): Promise<void> {
  await withLock(resolve(globalHome(), '.lock'), async () => {
    const { leaf, record } = landClaim(repo, slug, attempt);
    saveState(leaf.path, { ...readState(leaf.path), batch: { ...record, owner: 'seat', ...fields } });
  });
  console.log(`handoff ${slug} attempt=${attempt}${fields.wake === undefined ? '' : ` wake=${fields.wake}`}`);
  await mergeWake(global, repo);
}

async function land(global: GlobalConfig, repo: Repo, slug: string, attempt: string): Promise<void> {
  const lock: string = resolve(globalHome(), '.lock');
  for (let refusals: number = 0; ;) {
    const { leaf } = await withLock(lock, async () => landClaim(repo, slug, attempt));
    if ((await verify(repo.root, undefined, attempt, undefined, false)) !== 0)
      return handOff(global, repo, slug, attempt, {
        wake: 'red',
        red: await redRun(repo, leaf.state.worktree ?? repo.root),
      });
    const refusal: string | undefined = await withLock(lock, async () => {
      const claimed = landClaim(repo, slug, attempt);
      try {
        await landGates(repo, claimed.leaf, claimed.record);
        return undefined;
      } catch (error) {
        if (!(error instanceof Error) || error instanceof StaleLandError) throw error;
        return error.message;
      }
    });
    if (refusal !== undefined) return handOff(global, repo, slug, attempt, { wake: 'gate', refusal });
    const pushed: LandPush = await landPush(repo, slug, attempt);
    if (pushed.kind === 'landed') return landedWake(global, repo, slug);
    if (pushed.kind === 'rebase') return handOff(global, repo, slug, attempt, {});
    if (pushed.kind === 'error') return handOff(global, repo, slug, attempt, { wake: 'push', refusal: pushed.stderr });
    refusals += 1;
    if (refusals > 1) return handOff(global, repo, slug, attempt, { wake: 'push', refusal: pushed.stderr });
  }
}

export async function landCommand(slug: string, attempt: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, process.cwd());
  try {
    await land(global, repo, slug, attempt);
  } catch (error) {
    if (!(error instanceof StaleLandError)) throw error;
    console.log(error.message);
  }
}
