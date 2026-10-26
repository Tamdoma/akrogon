import { callerScope, cancelWaitingRun, liveRuns, type RunRecord } from './admission';
import { runUnitBase, sessionBusAddress } from './scope';
import { CommandError, spawnCaptured, type SpawnResult } from './shell';

function matched(record: RunRecord): string[] {
  return [record.unit, `${runUnitBase(record.run)}-guard.service`];
}

export async function stopRunCommand(id: string | undefined): Promise<void> {
  const scope: string = callerScope();
  if (scope === '') throw new Error('Caller is not inside a run or pane scope');
  const candidates: RunRecord[] = liveRuns().filter((record) => record.scope === scope);
  if (id === undefined) {
    for (const record of candidates)
      process.stderr.write(`run ${record.run} ${record.repo}/${record.leaf} ${record.check}\n`);
    if (candidates.length > 1) throw new Error(`${candidates.length} runs owned by scope ${scope}; name a run id`);
  }
  const found: RunRecord | undefined =
    id === undefined ? candidates[0] : candidates.find((record) => record.run === id);
  if (found === undefined)
    throw new Error(id === undefined ? `No runs owned by scope ${scope}` : `No run ${id} owned by scope ${scope}`);
  // A waiting run has no units yet: cancel its record under the queue locks
  // and let its poll exit the run. If promotion beat the cancel, or the
  // record vanished or was already cancelled, fall through or return.
  if (found.state === 'waiting') {
    const result: 'cancelled' | 'gone' | 'live' = await cancelWaitingRun(found);
    if (result !== 'live') return;
  }
  const argv: string[] = ['systemctl', '--user', 'stop', ...matched(found)];
  const result: SpawnResult = await spawnCaptured(argv, {
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress() },
  });
  if (result.code !== 0) throw new CommandError(argv, process.cwd(), result);
}
