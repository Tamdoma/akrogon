import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, type Fixture } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/tests/helpers';
import { readState, type State } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/src/state';
import type { Result } from '/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/src/shell';

const f: Fixture = await fixture();
try {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync('/home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals/tests/fake-herdr.ts', resolve(bin, 'herdr'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0 }));
  leaf(f, 'completed', 'merged', { tab: 'w2:t9' }, 'completed-issue');
  const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['completed'] }, 'dependent-issue');
  const result: Result = await cli(f, ['next'], f.root, {
    PATH: `${bin}:${process.env.PATH}`,
    FAKE_HERDR: db,
    HERDR_WORKSPACE_ID: 'w2',
    HERDR_PLUGIN_EVENT_JSON: JSON.stringify({ event: 'tab_closed', data: { type: 'tab_closed', tab_id: 'w2:t9', workspace_id: 'w2' } }),
  });
  const state: State = readState(dependent);
  const artifact: string = resolve(import.meta.dir, 'tab-closed-cli.log');
  writeFileSync(artifact, JSON.stringify({ result, state }) + '\n' + readFileSync(db + '.calls', 'utf8'));
  assert.equal(result.code, 0, result.stderr);
  assert.equal(state.attempts.B, 1);
  assert.match(state.tab!, /^w2:/);
  assert.ok(state.busy_since.B);
  console.log(artifact);
} finally {
  f.clean();
}
