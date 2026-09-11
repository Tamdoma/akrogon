import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, type Fixture } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/tests/helpers';
import { readState, saveState, type State } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/src/state';
import type { Result } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/src/shell';

const f: Fixture = await fixture();
const artifact: string = resolve(import.meta.dir, 'cli-artifact.log');
const db: string = resolve(f.home, 'herdr.json');
const bin: string = resolve(f.home, 'bin');
mkdirSync(bin);
symlinkSync('/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/tests/fake-herdr.ts', resolve(bin, 'herdr'));
const env: NodeJS.ProcessEnv = { PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db };
writeFileSync(artifact, 'failure-signals real CLI verification\n');
function record(label: string, value: object): void {
  appendFileSync(artifact, JSON.stringify({ label, ...value }) + '\n');
}
async function invoke(args: string[], succeeds: boolean = true): Promise<Result> {
  const result: Result = await cli(f, args, f.root, env);
  record('cli', { args, ...result });
  if (succeeds) assert.equal(result.code, 0, result.stderr);
  else assert.notEqual(result.code, 0);
  return result;
}
function notificationCalls(): string[] {
  return readFileSync(db + '.calls', 'utf8').trim().split('\n').filter((line: string): boolean => line.startsWith('["notification","show",'));
}
try {
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0, failNotification: true }));
  const failed: string = leaf(f, 'failure-demo', 'failed');
  await invoke(['next', 'failure-demo'], false);
  assert.equal(readState(failed).failed_notified, false);
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0 }));
  for (let sweep: number = 0; sweep < 3; sweep++) await invoke(['next', 'failure-demo']);
  assert.equal(notificationCalls().length, 2);
  assert.equal(readState(failed).failed_notified, true);
  record('failed-delivered', { state: readState(failed) });
  await invoke(['phase', 'failure-demo', 'implement', '--slot', 'B']);
  assert.equal(readState(failed).failed_notified, false);
  record('failed-reset', { state: readState(failed) });

  writeFileSync(db, JSON.stringify({
    panes: [{ pane_id: 'w1:p1', tab_id: 'w1:t1', cwd: f.root, agent: 'fake', agent_status: 'working' }],
    tabs: [{ tab_id: 'w1:t1', label: 'busy-demo' }], serial: 1,
  }));
  const busy: string = leaf(f, 'busy-demo', 'merge', { pane: { A: 'w1:p1' }, tab: 'w1:t1', attempts: { A: 1, B: 0 } });
  await invoke(['next', 'busy-demo']);
  assert.ok(readState(busy).busy_since.A);
  const start: string = new Date(Date.now() - 62 * 60000).toISOString();
  saveState(busy, { ...readState(busy), busy_since: { A: start } });
  const before: State = readState(busy);
  await invoke(['next', 'busy-demo']);
  await invoke(['next', 'busy-demo']);
  const after: State = readState(busy);
  assert.equal(after.busy_since.A, start);
  assert.ok(after.busy_notified.A);
  assert.deepEqual(after.attempts, before.attempts);
  assert.equal(after.phase, before.phase);
  assert.deepEqual(after.pane, before.pane);
  assert.equal(notificationCalls().length, 3);
  const status: Result = await invoke(['status']);
  assert.ok(status.stdout.includes('busy A 1h02m'));
  record('busy-delivered', { state: after });
  for (const call of notificationCalls()) appendFileSync(artifact, call + '\n');
  appendFileSync(artifact, 'PASS: failed retry/deduplication/reset, busy merge warning/deduplication, status duration.\n');
  console.log(artifact);
} finally {
  f.clean();
}
