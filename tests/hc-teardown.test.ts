// Criterion 13: kill then rm on a merged leaf, stop and restart; the merged tab close by window state;
// reconcile keeping or removing worktrees from hc terminal state.
import { test, expect } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, storeDir, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { readState, saveState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';

async function setup(slug: string, window: 'open' | 'closed' = 'closed') {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', 'fake', 'work');
  const core: HcCore = await hcCore(f, { window });
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await cli(f, ['next', slug], f.root, core.env)).code).toBe(0);
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
  f.clean();
}

async function leafTerminals(core: HcCore, slug: string): Promise<Terminal[]> {
  return core.terminals({ 'akrogon.leaf': slug }, true);
}

function merge(path: string): void {
  saveState(path, { ...readState(path), phase: 'merged', done: [] });
}

for (const window of ['open', 'closed'] as const)
  test(`a merged leaf's seats are killed and removed; its tab close is ${window === 'open' ? 'requested' : 'skipped'} with the window ${window}`, async () => {
    const slug: string = `ht-merged-${window}`;
    const { f, core, path } = await setup(slug, 'closed');
    try {
      expect(await leafTerminals(core, slug)).toHaveLength(1);
      // Read before the pass: completing the merged leaf moves its folder to issues/closed.
      const tab: string = z.string().parse(readState(path).tab);
      merge(path);
      core.setWindow(window);
      expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
      expect(await leafTerminals(core, slug)).toEqual([]);
      const closes: string[][] = core
        .appCalls()
        .map((call) => call.argv)
        .filter((argv) => argv[1] === 'tab.close');
      expect(closes).toEqual(window === 'open' ? [['do', 'tab.close', '--id', tab]] : []);
    } finally {
      await teardown(f, core, slug);
    }
  });

// Reproduction: a merged leaf whose seat already finished kept its finished terminal, because the
// close ran only for a tab a live terminal held.
test("a merged leaf's finished seat terminal is removed too", async () => {
  const { f, core, path } = await setup('ht-finished');
  try {
    const seat: Terminal = (await leafTerminals(core, 'ht-finished'))[0];
    expect((await core.hc(['kill', seat.address])).code).toBe(0);
    expect((await core.get(seat.address)).state).toBe('finished');
    merge(path);
    expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
    expect(await leafTerminals(core, 'ht-finished')).toEqual([]);
  } finally {
    await teardown(f, core, 'ht-finished');
  }
});

test('akrogon stop ends and removes the leaf seat terminals', async () => {
  const { f, core } = await setup('ht-stop');
  try {
    expect(await leafTerminals(core, 'ht-stop')).toHaveLength(1);
    expect((await cli(f, ['stop', 'ht-stop'], f.root, core.env)).code).toBe(0);
    expect(await leafTerminals(core, 'ht-stop')).toEqual([]);
  } finally {
    await teardown(f, core, 'ht-stop');
  }
});

test('a killed seat starts again under its old name without name_taken', async () => {
  const { f, core, path } = await setup('ht-restart');
  try {
    const first: Terminal = (await leafTerminals(core, 'ht-restart'))[0];
    expect((await core.hc(['kill', first.address])).code).toBe(0);
    saveState(path, { ...readState(path), prompted: {} });
    const pass = await cli(f, ['next', 'ht-restart'], f.root, core.env);
    expect(pass.code).toBe(0);
    expect(pass.stderr).not.toContain('name_taken');
    const live: Terminal[] = (await leafTerminals(core, 'ht-restart')).filter((t: Terminal) => t.state === 'live');
    expect(live.map((t: Terminal) => t.name)).toEqual(['rp-ht-restart-a']);
    expect(live[0].address).not.toBe(first.address);
    expect((await leafTerminals(core, 'ht-restart')).map((t: Terminal) => t.address)).not.toContain(first.address);
  } finally {
    await teardown(f, core, 'ht-restart');
  }
});

test('reconcile keeps a merged leaf worktree while any live terminal sits inside it, and removes it once none does', async () => {
  const { f, core, path } = await setup('ht-keep');
  try {
    const worktree: string = resolve(storeDir(f), 'ht-keep');
    expect(existsSync(worktree)).toBe(true);
    const run = await core.hc(['run', '--bg', '--json', '--no-parent', '--cwd', worktree, '--', 'cat']);
    expect(run.code).toBe(0);
    const foreign: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    merge(path);
    expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
    expect(await leafTerminals(core, 'ht-keep')).toEqual([]);
    expect(existsSync(worktree)).toBe(true);
    expect((await core.hc(['kill', foreign])).code).toBe(0);
    expect((await core.hc(['rm', foreign])).code).toBe(0);
    expect((await cli(f, ['next', '--resume'], f.root, core.env)).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
  } finally {
    await teardown(f, core, 'ht-keep');
  }
});
