import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, greenReceipt, leaf, storeDir, yaml, type Fixture } from './helpers';
import {
  adopt,
  hcCore,
  hcFixture,
  noticeFiles,
  stopCoresAfterFile,
  type HcCore,
  type HcFixture,
  type Terminal,
} from './hc-fixture';
import { command, type Result, type SpawnResult } from '../src/shell';
import { leafSlice } from '../src/scope';

stopCoresAfterFile();

// The direct-leaf fixture states in this file are written directly: leaf() then a state.yaml rewrite
// adding direct: true, a full-ISO created and the seat refs of the test's own terminals (plan D16a).
// At planning the state schema is a strictObject without `direct`, so every engine read of these
// states refuses; that schema rejection is the correct red.
function directLeaf(
  f: Fixture,
  slug: string,
  phase: string,
  seats: { A: { session: string; address: string }; B: { session: string; address: string } },
  extra: object = {},
): string {
  const path: string = leaf(f, slug, phase, {}, 'chart-x');
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: new Date().toISOString(),
    repo: f.repo,
    'blocked-by': [],
    direct: true,
    frozen: {},
    seat: seats,
    ...extra,
  });
  return path;
}

// A leaf-branch worktree with one commit against the pushed base and a green leaf receipt for it:
// the proof shape an implement-end move to check.review demands.
async function directWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  mkdirSync(storeDir(f), { recursive: true });
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  writeFileSync(resolve(worktree, 'direct-file'), 'direct work\n');
  await command(['git', 'add', 'direct-file'], worktree);
  await command(['git', 'commit', '-m', 'direct work'], worktree);
  greenReceipt(f, await command(['git', 'rev-parse', 'HEAD'], worktree), 'leaf');
  return worktree;
}

// state.yaml parsed loosely: readState would throw on the schema rejection that is this branch's
// red, so assertions read the written shape directly.
function looseState(path: string): z.infer<ReturnType<typeof looseSchema>> {
  return looseSchema().parse(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8')));
}
function looseSchema() {
  return z
    .object({
      phase: z.string(),
      busy_since: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),
    })
    .passthrough();
}

// Rewrites state.yaml wholesale, preserving busy_since across the move so a phase change in fixture
// state never fakes an engine write or clear. saveState chmods 444 after real moves, so rewrite is explicit.
function writeState(path: string, state: object): void {
  const file: string = resolve(path, 'state.yaml');
  chmodSync(file, 0o644);
  yaml(file, state);
}

function yamlState(path: string): Record<string, unknown> {
  return z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8')));
}

// The hc calls akrogon made, one argv per call, from the fixture core's recording shim.
function hcCalls(f: HcFixture): string[][] {
  return readFileSync(f.core.shimLog, 'utf8')
    .split('\n')
    .filter((line: string) => line !== '')
    .map((line: string) => line.split('\t'));
}

// Every herdr-app tab rename akrogon asked for, as [tab, name].
function renames(f: HcFixture): string[][] {
  return f.core
    .appCalls()
    .filter((call) => call.argv[1] === 'tab.rename')
    .map((call) => [call.argv[3], call.argv[5]]);
}

// A terminal mutating verb (send/end/kill/rm/keys/label) naming one of the given addresses.
function targetingCalls(f: HcFixture, addresses: string[]): string[][] {
  const verbs: Set<string> = new Set(['send', 'end', 'kill', 'rm', 'keys', 'label']);
  return hcCalls(f).filter(
    (args: string[]) => verbs.has(args[0]) && addresses.some((address) => args.includes(address)),
  );
}

// The stand-in hook: a turn on the task HOLD spins working until the terminal's free-<address> file
// exists; every other task runs through, so lifecycle seats and other tasks are unaffected.
function holdHook(core: HcCore): void {
  const hook: string = resolve(core.standin, 'hook');
  writeFileSync(
    hook,
    '#!/bin/sh\nif [ "$2" = HOLD ]; then while [ ! -e "' + core.standin + '/free-$1" ]; do sleep 0.05; done; fi\n',
  );
  chmodSync(hook, 0o755);
}

// A stand-in terminal (fake harness, work mode) started with the task HOLD: working until released.
async function heldTerminal(core: HcCore, cwd: string): Promise<{ address: string; release: () => void }> {
  holdHook(core);
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--cwd',
    cwd,
    '--',
    'fake',
    '--model',
    'work',
    '--effort',
    'low',
    'HOLD',
  ]);
  expect(started.code, started.stderr).toBe(0);
  const address: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
  await core.waitFor(address, (t: Terminal) => t.status?.state === 'working');
  return {
    address,
    release: (): void => writeFileSync(resolve(core.standin, 'free-' + address), ''),
  };
}

// A stand-in terminal idling with no task; send HOLD to turn it working until released.
async function idleTerminal(core: HcCore, cwd: string): Promise<{ address: string; release: () => void }> {
  holdHook(core);
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--cwd',
    cwd,
    '--',
    'fake',
    '--model',
    'work',
    '--effort',
    'low',
  ]);
  expect(started.code, started.stderr).toBe(0);
  const address: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
  await core.waitFor(address, (t: Terminal) => t.status?.state === 'idle');
  return {
    address,
    release: (): void => writeFileSync(resolve(core.standin, 'free-' + address), ''),
  };
}

// An inert plain terminal.
async function catTerminal(core: HcCore, cwd: string): Promise<string> {
  const started: SpawnResult = await core.hc(['run', '--bg', '--json', '--no-parent', '--cwd', cwd, '--', 'cat']);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

function stoppedKeys(f: Fixture): string[] {
  const file: string = resolve(f.home, 'stopped.yaml');
  if (!existsSync(file)) return [];
  const parsed = Bun.YAML.parse(readFileSync(file, 'utf8')) as Record<string, unknown> | null;
  return Object.keys(parsed ?? {}).sort();
}

test('phase moves, stop and passes never touch the direct seats of a cross-session direct leaf', async () => {
  const f: HcFixture = await hcFixture({ window: 'open' });
  const core2: HcCore = await hcCore(f, { doc: false });
  f.core.link(core2);
  try {
    const worktree: string = await directWorktree(f, 'fix-alpha');
    // The door terminal sits in the repo session's core; the reviewer is a cross-session seat in core 2.
    const door: string = await catTerminal(f.core, worktree);
    const reviewer: string = await catTerminal(core2, f.home);
    const seats = {
      A: { session: f.core.session, address: door },
      B: { session: core2.session, address: reviewer },
    };
    const path: string = directLeaf(f, 'fix-alpha', 'implement', seats, { worktree });
    // The lifecycle control: real labeled seats of the same repo, dispatched normally.
    leaf(f, 'lc', 'plan.synthesis');
    // Adoption runs for the whole test: the endgame passes re-dispatch lc's seat after stop --all
    // ended it, and a seat restarts only when herdr-app adopts it into the tab.
    const stopAdopt: () => void = adopt(f.core);
    expect((await cli(f, ['next', 'lc'], f.root, f.env)).code).toBe(0);
    expect(await f.core.terminals({ 'akrogon.leaf': 'lc' }, false)).not.toEqual([]);
    const pids: { door: number | null; reviewer: number | null } = {
      door: (await f.core.get(door)).pid,
      reviewer: (await core2.get(reviewer)).pid,
    };
    expect(pids.door).not.toBeNull();
    expect(pids.reviewer).not.toBeNull();

    async function seatsUntouched(): Promise<void> {
      const doorNow: Terminal = await f.core.get(door);
      const reviewerNow: Terminal = await core2.get(reviewer);
      expect(doorNow.state).toBe('live');
      expect(reviewerNow.state).toBe('live');
      expect(doorNow.pid).toBe(pids.door);
      expect(reviewerNow.pid).toBe(pids.reviewer);
      // No terminal of either core ever carries the direct leaf's seat labels.
      expect(await f.core.terminals({ 'akrogon.leaf': 'fix-alpha' }, true)).toEqual([]);
      expect(await core2.terminals({ 'akrogon.leaf': 'fix-alpha' }, true)).toEqual([]);
      // No tab rename ever names the direct leaf (it has no tab), and no hc call targets its terminals.
      expect(renames(f).filter(([, name]) => name.includes('fix-alpha'))).toEqual([]);
      expect(targetingCalls(f, [door, reviewer])).toEqual([]);
    }

    async function phase(args: string[]): Promise<void> {
      const result: Result = await cli(f, ['phase', 'fix-alpha', ...args], f.root, f.env);
      expect(result.code, result.stderr).toBe(0);
      await seatsUntouched();
    }

    // The legal direct move sequence: implement -> check.review -> check.repair -> check.fix ->
    // check.review -> check.repair, B alone moving the review at every round (plan, criterion 3).
    await phase(['check.review', '--slot', 'A']);
    expect(looseState(path).phase).toBe('check.review');
    await phase(['check.repair', '--slot', 'B', '--verdict', 'fix']);
    expect(looseState(path).phase).toBe('check.repair');
    await phase(['check.fix', '--slot', 'A']);
    expect(looseState(path).phase).toBe('check.fix');
    await phase(['check.review', '--slot', 'A']);
    expect(looseState(path).phase).toBe('check.review');
    await phase(['check.repair', '--slot', 'B', '--verdict', 'fix']);
    expect(looseState(path).phase).toBe('check.repair');

    // Stopping still works: the stopped record carries the direct leaf and its seats stay live.
    // Real systemd exits 0 stopping a slice that was never loaded; the fake exits 5 for one, so the
    // leaf slices are seeded as loaded — the state they are in once any scope of the leaf ran.
    const db0 = z.object({ units: z.array(z.unknown()) }).parse(JSON.parse(readFileSync(f.systemctl.db, 'utf8')));
    db0.units.push(
      { unit: leafSlice({ name: f.repo }, 'fix-alpha', f.home), sub: 'active' },
      { unit: leafSlice({ name: f.repo }, 'lc', f.home), sub: 'active' },
    );
    writeFileSync(f.systemctl.db, JSON.stringify(db0));
    const stopped: Result = await cli(f, ['stop', 'fix-alpha'], f.root, f.env);
    expect(stopped.code, stopped.stderr).toBe(0);
    expect(stoppedKeys(f)).toContain(f.repo + '/fix-alpha');
    await seatsUntouched();

    // Operator unstop: the record is deleted by hand (the plan's unstop equivalent).
    const file: string = resolve(f.home, 'stopped.yaml');
    const parsed = z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
    delete parsed[f.repo + '/fix-alpha'];
    yaml(file, parsed);
    expect(stoppedKeys(f)).not.toContain(f.repo + '/fix-alpha');

    // stop --all sweeps the lifecycle control and passes over the direct leaf without harm.
    // D18 selects the direct leaf again: the earlier stop consumed its slice in the fake db, and
    // real systemd exits 0 stopping an already-stopped unit, so the slice is re-seeded into the
    // state a real host is in.
    const db1 = z.object({ units: z.array(z.unknown()) }).parse(JSON.parse(readFileSync(f.systemctl.db, 'utf8')));
    db1.units.push({ unit: leafSlice({ name: f.repo }, 'fix-alpha', f.home), sub: 'active' });
    writeFileSync(f.systemctl.db, JSON.stringify(db1));
    const stopAll: Result = await cli(f, ['stop', '--all'], f.root, f.env);
    expect(stopAll.code, stopAll.stderr).toBe(0);
    expect(stoppedKeys(f)).toContain(f.repo + '/lc');
    await seatsUntouched();

    // Operator unstop of both leaves: leaf-stop pins a non-zero bare next while any leaf is
    // stopped, so the passes below run with both records deleted.
    const parsed2 = z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
    delete parsed2[f.repo + '/fix-alpha'];
    delete parsed2[f.repo + '/lc'];
    yaml(file, parsed2);

    // A plain pass and a reconcile pass both complete without touching the direct seats.
    const nextResult: Result = await cli(f, ['next'], f.root, f.env);
    expect(nextResult.code, nextResult.stderr).toBe(0);
    await seatsUntouched();
    const resume: Result = await cli(f, ['next', '--resume'], f.root, f.env);
    expect(resume.code, resume.stderr).toBe(0);
    await seatsUntouched();
    expect(existsSync(worktree)).toBe(true);
    stopAdopt();
  } finally {
    await core2.stop();
    await f.clean();
  }
});

test('busy_since records required direct slots across sessions and clears non-required slots', async () => {
  const f: HcFixture = await hcFixture();
  const core2: HcCore = await hcCore(f, { doc: false });
  f.core.link(core2);
  try {
    const worktree: string = await directWorktree(f, 'fix-alpha');
    const door = await heldTerminal(f.core, worktree);
    const reviewer = await idleTerminal(core2, f.home);
    const seats = {
      A: { session: f.core.session, address: door.address },
      B: { session: core2.session, address: reviewer.address },
    };
    const path: string = directLeaf(f, 'fix-alpha', 'implement', seats, { worktree });

    async function pass(): Promise<void> {
      const result: Result = await cli(f, ['next'], f.root, f.env);
      expect(result.code, result.stderr).toBe(0);
    }
    function busy(): { A?: string; B?: string } {
      return looseState(path).busy_since;
    }

    // (a) implement requires A: the door works, so busy_since.A is written; B is never written,
    // required or not, in implement.
    await pass();
    expect(busy().A).toBeDefined();
    expect(busy().B).toBeUndefined();

    // (b) check.review round 0 requires B: the reviewer turns working in its own core and the
    // cross-session seat's busy_since.B is written; the door idles and its record clears.
    door.release();
    expect((await core2.hc(['send', reviewer.address, 'HOLD'])).code).toBe(0);
    await core2.waitFor(reviewer.address, (t: Terminal) => t.status?.state === 'working');
    writeState(path, { ...yamlState(path), phase: 'check.review' });
    await pass();
    expect(busy().B).toBeDefined();
    expect(busy().A).toBeUndefined();

    // (c) back in implement with A idle and B working: both slots clear, since a non-required
    // slot's busy_since is never kept even while its terminal is working.
    await f.core.waitFor(door.address, (t: Terminal) => t.status?.state === 'idle');
    writeState(path, {
      ...yamlState(path),
      phase: 'implement',
      busy_since: { A: new Date().toISOString(), B: new Date().toISOString() },
    });
    await pass();
    expect(busy().A).toBeUndefined();
    expect(busy().B).toBeUndefined();

    // Busy observation of shared direct terminals never writes blocked/stall notices.
    expect(noticeFiles(f.core)).toEqual([]);
    expect(noticeFiles(core2)).toEqual([]);
    expect(existsSync(resolve(f.root, 'issues/blocked'))).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/stalls'))).toBe(false);
  } finally {
    await core2.stop();
    await f.clean();
  }
});

test('a mislabeled direct seat is ended by stop, proving the teardown detection wiring', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const door: string = await catTerminal(f.core, f.home);
    const reviewer: string = await catTerminal(f.core, f.home);
    directLeaf(f, 'fix-alpha', 'implement', {
      A: { session: f.core.session, address: door },
      B: { session: f.core.session, address: reviewer },
    });
    // The deliberate break: something mislabels the door terminal as the leaf's seat A.
    const labeled: SpawnResult = await f.core.hc([
      'label',
      door,
      'akrogon=1',
      'akrogon.repo=' + f.repo,
      'akrogon.leaf=fix-alpha',
      'akrogon.seat=a',
    ]);
    expect(labeled.code, labeled.stderr).toBe(0);
    await cli(f, ['stop', 'fix-alpha'], f.root, f.env);
    // The end lands on the labeled terminal whether or not the stop itself completes: detection wiring.
    const addresses: string[] = (await f.core.terminals({}, true)).map((t: Terminal) => t.address);
    expect(addresses).not.toContain(door);
    expect(addresses).toContain(reviewer);
  } finally {
    await f.clean();
  }
});
