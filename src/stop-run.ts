import { callerScope, liveRuns, type RunRecord } from './admission';
import { runUnitBase } from './scope';
import { command } from './shell';

function matched(record: RunRecord): string[] {
  return [record.unit, `${runUnitBase(record.run)}-guard.service`];
}

export async function stopRunCommand(id: string | undefined): Promise<void> {
  const scope: string = callerScope();
  if (scope === '') throw new Error('Caller is not inside a run or pane scope');
  const candidates: RunRecord[] = liveRuns().filter((record) => record.scope === scope);
  let units: string[];
  if (id === undefined) {
    for (const record of candidates)
      process.stderr.write(`run ${record.run} ${record.repo}/${record.leaf} ${record.check}\n`);
    if (candidates.length === 0) throw new Error(`No runs owned by scope ${scope}`);
    if (candidates.length > 1) throw new Error(`${candidates.length} runs owned by scope ${scope}; name a run id`);
    units = matched(candidates[0]);
  } else {
    const found: RunRecord | undefined = candidates.find((record) => record.run === id);
    if (found === undefined) throw new Error(`No run ${id} owned by scope ${scope}`);
    units = matched(found);
  }
  await command(['systemctl', '--user', 'stop', ...units]);
}
