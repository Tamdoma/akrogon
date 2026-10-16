import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { expandPath, globalHome, readGlobal } from './config';
import { install } from './install';
import {
  currentReleaseCommit,
  flip,
  readDeployRecord,
  readReleaseHold,
  releasesDir,
  writeDeploySuccess,
  writeReleaseHold,
} from './release';
import { command } from './shell';
import { withLock } from './state';

// Moves current back to the recorded previous release: flip, hold the
// rolled-away commit, then install() restores that release's links the same
// way the manual path's previous-release `install` does. Runs under the same
// install lock deployStage takes so a concurrent deploy cannot interleave.
export async function rollback(): Promise<void> {
  const global = readGlobal();
  const body = async (): Promise<void> => {
    const record = readDeployRecord();
    if (record === null || record.previous === null || !existsSync(resolve(releasesDir(), record.previous)))
      throw new Error('Cannot roll back: no previous release to roll back to');
    const previous: string = record.previous;
    const old: string | null = currentReleaseCommit();
    if (old === null) throw new Error('Cannot roll back: current is not a release');
    flip(previous);
    // The held commit is the release rolled away from; on a retry after a
    // failed link step (current already on previous) keep or refresh the
    // hold on the deploy record's commit instead of holding the good one.
    const held: string = old !== previous ? old : (readReleaseHold() ?? record.commit ?? previous);
    writeReleaseHold(held);
    await install();
    writeDeploySuccess(previous, held);
    console.log(`rolled back ${old.slice(0, 12)} -> ${previous.slice(0, 12)}`);
  };
  const akrogonRoot: string | undefined = global.repos['akrogon'];
  if (akrogonRoot === undefined || !existsSync(expandPath(akrogonRoot, globalHome()))) {
    await body();
    return;
  }
  const root: string = expandPath(akrogonRoot, globalHome());
  const lock: string = resolve(root, await command(['git', 'rev-parse', '--git-path', 'akrogon-install.lock'], root));
  await withLock(lock, body);
}
