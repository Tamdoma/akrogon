// Criterion 11: watcher wakes by plain hc send to a live `akrogon.watch=<repo>` terminal, one in
// flight per repo, nothing without one, and two live matches reported. The watcher is a stand-in;
// its task log is the record of wakes.
import { test, expect } from 'bun:test';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, entry, fixture, killTree, leaf, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { readState, saveState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';

const tick = (f: Fixture): string => `/watch-issues tick ${f.root}`;

async function watcherOn(core: HcCore): Promise<string> {
  const run = await core.hc(['run', '--bg', '--json', '--no-parent', '--label', 'akrogon.watch=repo', '--', 'fake']);
  if (run.code !== 0) throw new Error(`hc run failed: ${run.stderr}`);
  const address: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
  await core.waitFor(address, (t: Terminal) => t.status?.state === 'idle');
  return address;
}

async function setup(slug: string, mode: string = 'work') {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', 'fake', mode);
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, slug, 'plan.synthesis');
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
  f.clean();
}

// The listener's passes run `akrogon` from PATH; this one is the checkout under test, never an installed release.
function listen(f: Fixture, core: HcCore): Bun.Subprocess {
  const bin: string = resolve(f.home, 'listener-bin');
  mkdirSync(bin, { recursive: true });
  writeFileSync(resolve(bin, 'akrogon'), `#!/bin/sh\nexec '${process.execPath}' '${entry}' "$@"\n`);
  chmodSync(resolve(bin, 'akrogon'), 0o755);
  return Bun.spawn([process.execPath, entry, 'listen'], {
    cwd: f.home,
    env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home, ...core.env, PATH: `${bin}:${core.env.PATH}` },
    stdout: 'ignore',
    stderr: 'ignore',
  });
}

test('a seat exit and a blocked seat seen by the listener each wake the watcher once', async () => {
  const { f, core } = await setup('hw-exit', 'exit');
  const watcher: string = await watcherOn(core);
  const listener: Bun.Subprocess = listen(f, core);
  try {
    await cli(f, ['seat', 'hw-exit', 'A'], f.root, core.env);
    await core.waitFor(watcher, (t: Terminal) => t.turn >= 1 && t.status?.state === 'idle', 20_000);
    expect(core.tasks(watcher)).toEqual([tick(f)]);
    const blocked = await core.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--label',
      'akrogon=1',
      '--label',
      'akrogon.repo=repo',
      '--label',
      'akrogon.leaf=hw-exit',
      '--label',
      'akrogon.seat=b',
      '--',
      'fake',
      '--model',
      'trust',
    ]);
    expect(blocked.code).toBe(0);
    await core.waitFor(watcher, (t: Terminal) => t.turn >= 2 && t.status?.state === 'idle', 20_000);
    expect(core.tasks(watcher)).toEqual([tick(f), tick(f)]);
  } finally {
    killTree(listener);
    await teardown(f, core, 'hw-exit');
  }
});

test('a seat replaced by a keep shell wakes the watcher', async () => {
  const { f, core } = await setup('hw-keep');
  const watcher: string = await watcherOn(core);
  const listener: Bun.Subprocess = listen(f, core);
  try {
    const kept = await core.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--keep',
      '--label',
      'akrogon=1',
      '--label',
      'akrogon.repo=repo',
      '--label',
      'akrogon.leaf=hw-keep',
      '--label',
      'akrogon.seat=a',
      '--',
      'sh',
      '-c',
      'printf "\\033]7501;state=idle\\007"; exit 4',
    ]);
    expect(kept.code).toBe(0);
    await core.waitFor(watcher, (t: Terminal) => t.turn >= 1 && t.status?.state === 'idle', 20_000);
    expect(core.tasks(watcher)).toContain(tick(f));
  } finally {
    killTree(listener);
    await teardown(f, core, 'hw-keep');
  }
});

test('a committed move to failed wakes the watcher once', async () => {
  const { f, core } = await setup('hw-fail');
  const watcher: string = await watcherOn(core);
  try {
    expect(
      (await cli(f, ['phase', 'hw-fail', 'failed', '--slot', 'A', '--reason', 'stuck'], f.root, core.env)).code,
    ).toBe(0);
    await core.waitFor(watcher, (t: Terminal) => t.turn >= 1 && t.status?.state === 'idle');
    expect(core.tasks(watcher)).toEqual([tick(f)]);
  } finally {
    await teardown(f, core, 'hw-fail');
  }
});

test('the busy deadline wakes the watcher, and a watcher still working on it gets no second wake', async () => {
  // A blocked seat counts as busy; its busy_since is seeded past the 60-minute deadline.
  const { f, core, path } = await setup('hw-busy', 'trust');
  const watcher: string = await watcherOn(core);
  try {
    expect((await cli(f, ['next', 'hw-busy'], f.root, core.env)).code).toBe(0);
    saveState(path, { ...readState(path), busy_since: { A: new Date(Date.now() - 61 * 60 * 1000).toISOString() } });
    // The watcher's turn waits on a FIFO, so it stays working while the second wake is attempted.
    const gate: string = resolve(core.standin, 'gate');
    writeFileSync(
      resolve(core.standin, 'hook'),
      `#!/bin/sh\n[ -p '${gate}' ] && cat '${gate}' >/dev/null && rm -f '${gate}'\n`,
    );
    chmodSync(resolve(core.standin, 'hook'), 0o755);
    Bun.spawnSync(['mkfifo', gate]);
    expect((await cli(f, ['next', 'hw-busy'], f.root, core.env)).code).toBe(0);
    await core.waitFor(watcher, (t: Terminal) => t.status?.state === 'working');
    // C11.1: one wake in flight per repo.
    expect(
      (await cli(f, ['phase', 'hw-busy', 'failed', '--slot', 'A', '--reason', 'second'], f.root, core.env)).code,
    ).toBe(0);
    writeFileSync(gate, 'go\n');
    await core.waitFor(watcher, (t: Terminal) => t.turn >= 1 && t.status?.state === 'idle');
    expect(core.tasks(watcher)).toEqual([tick(f)]);
  } finally {
    await teardown(f, core, 'hw-busy');
  }
});

test('without a watch terminal nothing is sent and dispatch runs; two live watch terminals are reported and get nothing', async () => {
  const { f, core } = await setup('hw-none');
  try {
    expect(
      (await cli(f, ['phase', 'hw-none', 'failed', '--slot', 'A', '--reason', 'stuck'], f.root, core.env)).code,
    ).toBe(0);
    const sends: string[] = (await Bun.file(core.shimLog).text())
      .split('\n')
      .filter((line: string) => line.startsWith('send\t'));
    expect(sends).toEqual([]);
    leaf(f, 'hw-runs', 'plan.synthesis');
    expect((await cli(f, ['next', 'hw-runs'], f.root, core.env)).code).toBe(0);
    expect(await core.terminals({ 'akrogon.leaf': 'hw-runs' }, false)).toHaveLength(1);
    const one: string = await watcherOn(core);
    const two: string = await watcherOn(core);
    const failed = await cli(f, ['phase', 'hw-runs', 'failed', '--slot', 'A', '--reason', 'again'], f.root, core.env);
    expect(failed.stderr).toContain(one);
    expect(failed.stderr).toContain(two);
    expect(core.tasks(one)).toEqual([]);
    expect(core.tasks(two)).toEqual([]);
  } finally {
    await core.stop();
    for (const slug of ['hw-none', 'hw-runs'])
      await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
    f.clean();
  }
});
