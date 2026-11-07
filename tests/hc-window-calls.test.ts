// Criterion 7 (call sequence): the strict fake herdr-app sees exactly the window check and rename
// calls, with the session's app home; the live window behavior is the attended window tier.
import { test, expect } from 'bun:test';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { adopt, hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { readState, saveState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';
import { z } from 'zod';

async function setup(slug: string, window: 'open' | 'closed') {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', 'fake', 'work');
  const core: HcCore = await hcCore(f, { window });
  const path: string = leaf(f, slug, 'plan.synthesis');
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
  f.clean();
}

test('window open: the start checks the window, waits for the pane, then renames the tab to the slug', async () => {
  const { f, core, path } = await setup('hw-open', 'open');
  const stopAdopt: () => void = adopt(core);
  try {
    expect((await cli(f, ['seat', 'hw-open', 'A'], f.root, core.env)).code).toBe(0);
    const tab: string = z.string().parse(readState(path).tab);
    expect(core.appCalls()).toEqual([
      { argv: ['ls'], home: core.appHome, planned: true },
      { argv: ['do', 'tab.rename', '--id', tab, '--name', 'hw-open'], home: core.appHome, planned: true },
    ]);
  } finally {
    stopAdopt();
    await teardown(f, core, 'hw-open');
  }
});

test('window closed: the start returns with labels set and no rename; a later pass with the window open names a failed leaf', async () => {
  const { f, core, path } = await setup('hw-closed', 'closed');
  try {
    expect((await cli(f, ['seat', 'hw-closed', 'A'], f.root, core.env)).code).toBe(0);
    expect(core.appCalls().map((call) => call.argv)).toEqual([['ls']]);
    const seats: Terminal[] = await core.terminals({ 'akrogon.leaf': 'hw-closed' }, false);
    expect(seats.map((t: Terminal) => t.labels['herdr.tab'])).toEqual([readState(path).tab]);
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'meanwhile' },
    });
    core.setWindow('open');
    expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
    const tab: string = z.string().parse(readState(path).tab);
    expect(core.appCalls().map((call) => call.argv)).toContainEqual([
      'do',
      'tab.rename',
      '--id',
      tab,
      '--name',
      'hw-closed failed',
    ]);
    expect(core.appCalls().every((call) => call.planned && call.home === core.appHome)).toBe(true);
  } finally {
    await teardown(f, core, 'hw-closed');
  }
});

test('a failed rename leaves the seat running and status shows the tab unnamed', async () => {
  const { f, core } = await setup('hw-fail', 'open');
  core.setWindow('open', 'fail');
  const stopAdopt: () => void = adopt(core);
  try {
    expect((await cli(f, ['seat', 'hw-fail', 'A'], f.root, core.env)).code).toBe(0);
    const seats: Terminal[] = await core.terminals({ 'akrogon.leaf': 'hw-fail' }, false);
    expect(seats.map((t: Terminal) => t.state)).toEqual(['live']);
    const status = await cli(f, ['status', 'hw-fail'], f.root, core.env);
    expect(status.stdout).toContain('tab unnamed');
  } finally {
    stopAdopt();
    await teardown(f, core, 'hw-fail');
  }
});

test('window open but the pane never shows: the start kills what it started and exits non-zero with the address', async () => {
  const { f, core } = await setup('hw-nopane', 'open');
  try {
    const started = await cli(f, ['seat', 'hw-nopane', 'A'], f.root, core.env);
    expect(started.code).not.toBe(0);
    const seats: Terminal[] = await core.terminals({ 'akrogon.leaf': 'hw-nopane' });
    expect(seats).toEqual([]);
    expect(core.appCalls().map((call) => call.argv)).toEqual([['ls']]);
    expect(`${started.stdout}\n${started.stderr}`).toMatch(/\bt\d+\b/);
  } finally {
    await teardown(f, core, 'hw-nopane');
  }
});
