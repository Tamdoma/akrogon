import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, entry, fixture, leaf, fakeHerdr, holding, leafTempRoot, storeDir, type Fixture } from './helpers';
import { finishCaptured, spawnFiles, type Result, type SpawnResult } from '../src/shell';
import { leafSlice } from '../src/scope';
import { readState, saveState, type State } from '../src/state';
import type { Database } from './fake-herdr';

type SliceFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
type Cap = { proc: Bun.Subprocess; result: Promise<SpawnResult> };

const uid: number = process.getuid!();
const realRuntime: string = `/run/user/${uid}`;
const realBus: string = `unix:path=${realRuntime}/bus`;

async function slicesFixture(): Promise<SliceFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}

function database(f: SliceFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}

function saveDatabase(f: SliceFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}

function closeTab(f: SliceFixture, tab: string): void {
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    tabs: db.tabs.filter((item) => item.tab_id !== tab),
    panes: db.panes.filter((pane) => pane.tab_id !== tab),
  });
}

// Real systemd calls: the leaf slice code pins DBUS_SESSION_BUS_ADDRESS to the
// real user bus; herdr and systemd-run resolve through the fixture bin dir.
function realEnv(f: SliceFixture, env: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RUN: '',
    AKROGON_PROC_ROOT: f.env.AKROGON_PROC_ROOT,
    FAKE_HERDR: f.env.FAKE_HERDR,
    FAKE_BUSCTL_HOME: f.env.FAKE_BUSCTL_HOME,
    XDG_RUNTIME_DIR: realRuntime,
    DBUS_SESSION_BUS_ADDRESS: realBus,
    PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    ...env,
  };
}

function spawnReal(f: SliceFixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): Cap {
  const { child, captured } = spawnFiles([process.execPath, entry, ...args], {
    cwd,
    env: realEnv(f, env),
  });
  return { proc: child, result: finishCaptured(child, captured) };
}

function sysctl(...args: string[]): Promise<SpawnResult> {
  const { child, captured } = spawnFiles([
    'env',
    `XDG_RUNTIME_DIR=${realRuntime}`,
    `DBUS_SESSION_BUS_ADDRESS=${realBus}`,
    'systemctl',
    '--user',
    ...args,
  ]);
  return finishCaptured(child, captured);
}

function sdrun(...args: string[]): Promise<SpawnResult> {
  const { child, captured } = spawnFiles([
    'env',
    `XDG_RUNTIME_DIR=${realRuntime}`,
    `DBUS_SESSION_BUS_ADDRESS=${realBus}`,
    'systemd-run',
    '--user',
    ...args,
  ]);
  return finishCaptured(child, captured);
}

async function isActive(unit: string): Promise<boolean> {
  return (await sysctl('is-active', unit)).code === 0;
}

async function listed(pattern: string): Promise<string[]> {
  const result: SpawnResult = await sysctl('list-units', '--all', pattern, '--output=json');
  if (result.code !== 0) return [];
  return z
    .array(z.object({ unit: z.string() }))
    .parse(JSON.parse(result.stdout))
    .map((row) => row.unit);
}

async function waitFor(ok: () => Promise<boolean>, ms: number = 10000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    if (await ok()) return;
    if (Date.now() - begun > ms) throw new Error('Timed out waiting');
    await Bun.sleep(100);
  }
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function dispatchLeaf(f: SliceFixture, slug: string, extra: object = {}): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis', extra);
  const result: Result = await cli(f, ['next', slug], f.root, f.env);
  expect(result.code).toBe(0);
  return path;
}

// A real sleeper service inside the leaf's real slice; writes its pid to a file.
async function sleeper(f: SliceFixture, sliceName: string): Promise<number> {
  const tag: string = `akr-flp-${process.pid}-${Math.floor(Math.random() * 1e6)}`;
  const pidFile: string = resolve(f.home, `${tag}.pid`);
  const finished: SpawnResult = await sdrun(
    '--quiet',
    '--collect',
    `--unit=${tag}`,
    `--slice=${sliceName}`,
    'sh',
    '-c',
    // systemd-run eats one $$ pair per specifier pass, so $$$$ reaches sh as $$.
    `echo $$$$ > ${pidFile}; exec sleep 300`,
  );
  expect(finished.code).toBe(0);
  for (let i: number = 0; i < 100 && !existsSync(pidFile); i++) await Bun.sleep(50);
  const pid: number = Number(readFileSync(pidFile, 'utf8').trim());
  expect(pidAlive(pid)).toBe(true);
  return pid;
}

async function cleanupUnit(unit: string): Promise<void> {
  await sysctl('stop', unit).catch(() => undefined);
  await sysctl('reset-failed', unit).catch(() => undefined);
}

test('merged and failed leaf slices with gone tabs are stopped and their processes end', async () => {
  const f: SliceFixture = await slicesFixture();
  const units: string[] = [];
  try {
    const mergedPath: string = await dispatchLeaf(f, 'merged-leaf');
    const failedPath: string = await dispatchLeaf(f, 'failed-leaf');
    const mergedSlice: string = leafSlice({ name: 'repo' }, 'merged-leaf');
    const failedSlice: string = leafSlice({ name: 'repo' }, 'failed-leaf');
    const mergedPid: number = await sleeper(f, mergedSlice);
    const failedPid: number = await sleeper(f, failedSlice);
    units.push(mergedSlice, failedSlice);
    closeTab(f, z.string().parse(readState(mergedPath).tab));
    closeTab(f, z.string().parse(readState(failedPath).tab));
    saveState(mergedPath, { ...readState(mergedPath), phase: 'merged' });
    saveState(failedPath, {
      ...readState(failedPath),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'test' },
    });
    const pass: SpawnResult = await spawnReal(f, ['next', '--all'], f.root).result;
    expect(pass.code, `${pass.stdout} | ${pass.stderr}`).toBe(0);
    await waitFor(async () => !(await isActive(mergedSlice)) && !(await isActive(failedSlice)));
    await waitFor(async () => !pidAlive(mergedPid) && !pidAlive(failedPid));
  } finally {
    for (const unit of units) await cleanupUnit(unit);
    f.clean();
  }
}, 25000);

test('a finished leaf with a live tab keeps its slice, and the pass fetched the pane list', async () => {
  const f: SliceFixture = await slicesFixture();
  const sliceName: string = leafSlice({ name: 'repo' }, 'tabbed-merged');
  const units: string[] = [sliceName];
  try {
    const path: string = leaf(f, 'tabbed-merged', 'merged', { tab: 'w1:t9' });
    expect(readState(path).worktree).toBeUndefined();
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: [...db.tabs, { tab_id: 'w1:t9', label: 'tabbed-merged', focused: false }],
      panes: [...db.panes, { pane_id: 'w1:p9', tab_id: 'w1:t9', cwd: null, agent: null, agent_status: 'idle' }],
    });
    const pid: number = await sleeper(f, sliceName);
    const pass: SpawnResult = await spawnReal(f, ['next', '--all'], f.root).result;
    expect(pass.code, `${pass.stdout} | ${pass.stderr}`).toBe(0);
    expect(await isActive(sliceName)).toBe(true);
    expect(pidAlive(pid)).toBe(true);
    const callLog: string = f.db + '.calls';
    const calls: string[] = existsSync(callLog) ? readFileSync(callLog, 'utf8').trim().split('\n') : [];
    // The leaf has no worktree and no temp, so only the slice rule can trigger the fetch.
    expect(calls.filter((line) => line.includes('pane')).length).toBeGreaterThan(0);
  } finally {
    for (const unit of units) await cleanupUnit(unit);
    f.clean();
  }
});

test('a finished leaf slice named by a live run record is not stopped', async () => {
  const f: SliceFixture = await slicesFixture();
  let sliceName: string | undefined;
  const control: string = leafSlice({ name: 'repo' }, 'control-leaf');
  try {
    const path: string = await dispatchLeaf(f, 'run-leaf');
    const controlPath: string = await dispatchLeaf(f, 'control-leaf');
    const worktree: string = z.string().parse(readState(path).worktree);
    sliceName = leafSlice({ name: 'repo' }, 'run-leaf');
    const controlPid: number = await sleeper(f, control);
    const cap: Cap = spawnReal(f, ['run-check', '--name', 'hold', '--', 'sleep', '60'], worktree);
    try {
      await waitFor(async () => existsSync(resolve(f.home, 'runs')) && readdirSync(resolve(f.home, 'runs')).length > 0);
      await waitFor(async () => await isActive(z.string().parse(sliceName)));
      closeTab(f, z.string().parse(readState(path).tab));
      closeTab(f, z.string().parse(readState(controlPath).tab));
      saveState(path, { ...readState(path), phase: 'merged' });
      saveState(controlPath, { ...readState(controlPath), phase: 'merged' });
      const pass: SpawnResult = await spawnReal(f, ['next', '--all'], f.root).result;
      expect(pass.code, `${pass.stdout} | ${pass.stderr}`).toBe(0);
      // The control proves the pass stopped finished slices this run; only the
      // live run record protects run-leaf's slice.
      await waitFor(async () => !(await isActive(control)) && !pidAlive(controlPid));
      expect(await isActive(z.string().parse(sliceName))).toBe(true);
    } finally {
      cap.proc.kill('SIGKILL');
      await cap.result.catch(() => undefined);
      await cleanupUnit(z.string().parse(sliceName));
      await cleanupUnit(control);
    }
  } finally {
    f.clean();
  }
}, 40000);

test('a pass with the pane list unavailable stops no slice of a leaf that has a recorded tab', async () => {
  const f: SliceFixture = await slicesFixture();
  try {
    const path: string = leaf(f, 'no-panes', 'merged', { tab: 'w1:t7' });
    const sliceName: string = leafSlice({ name: 'repo' }, 'no-panes');
    const cgroup: string = `/user.slice/user-${uid}.slice/user@${uid}.service/akrogon.slice/${sliceName}`;
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, cgroup.slice(1)), { recursive: true });
    const bin: string = resolve(f.home, 'bin');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(bin, 'systemctl'));
    const sysDb: string = resolve(f.home, 'systemctl.json');
    writeFileSync(sysDb, JSON.stringify({ units: [{ unit: sliceName, sub: 'active', cgroup }] }));
    const log: string = resolve(f.home, 'systemctl.log');
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    const result: Result = await cli(f, ['next', '--all'], f.root, {
      ...f.env,
      FAKE_SYSTEMCTL_DB: sysDb,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_CGROUP_ROOT: cgRoot,
    });
    expect(result.code).toBe(0);
    const calls: string[] = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
    // The pass must reach the slice step (inventory listed) yet stop nothing:
    // the recorded tab cannot be proven gone while the pane list is unavailable.
    expect(calls.some((line) => line.includes('list-units'))).toBe(true);
    expect(calls.some((line) => line.includes('stop') && line.includes(sliceName))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a loaded slice matching no leaf record is stopped only when it holds no process', async () => {
  const f: SliceFixture = await slicesFixture();
  try {
    const empty: string = 'akrogon-ldeadbeef00.slice';
    const busy: string = 'akrogon-lalivebee00.slice';
    const rootCg: string = `/user.slice/user-${uid}.slice/user@${uid}.service/akrogon.slice`;
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, rootCg.slice(1), empty), { recursive: true });
    mkdirSync(resolve(cgRoot, rootCg.slice(1), busy), { recursive: true });
    writeFileSync(resolve(cgRoot, rootCg.slice(1), busy, 'cgroup.procs'), `${process.pid}\n`);
    const bin: string = resolve(f.home, 'bin');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(bin, 'systemctl'));
    const sysDb: string = resolve(f.home, 'systemctl.json');
    writeFileSync(
      sysDb,
      JSON.stringify({
        units: [
          { unit: empty, sub: 'active', cgroup: `${rootCg}/${empty}` },
          { unit: busy, sub: 'active', cgroup: `${rootCg}/${busy}` },
        ],
      }),
    );
    const log: string = resolve(f.home, 'systemctl.log');
    leaf(f, 'seed', 'plan.synthesis');
    const result: Result = await cli(f, ['next', '--all'], f.root, {
      ...f.env,
      FAKE_SYSTEMCTL_DB: sysDb,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_CGROUP_ROOT: cgRoot,
    });
    expect(result.code).toBe(0);
    const calls: string[] = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
    expect(calls.some((line) => line.includes(`stop ${empty}`))).toBe(true);
    expect(calls.some((line) => line.includes(`stop ${busy}`))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a reconcile pass running inside a leaf slice does not stop that slice', async () => {
  const f: SliceFixture = await slicesFixture();
  let sliceName: string | undefined;
  try {
    const path: string = await dispatchLeaf(f, 'self-leaf');
    sliceName = leafSlice({ name: 'repo' }, 'self-leaf');
    closeTab(f, z.string().parse(readState(path).tab));
    saveState(path, { ...readState(path), phase: 'merged' });
    // Fake systemctl marks the leaf slice a stop candidate (loaded, no live tab)
    // while the pass runs inside the real slice: only the own-slice guard saves it.
    const bin: string = resolve(f.home, 'bin');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(bin, 'systemctl'));
    const sysDb: string = resolve(f.home, 'systemctl.json');
    const cgroup: string = `/user.slice/user-${uid}.slice/user@${uid}.service/akrogon.slice/${sliceName}`;
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, cgroup.slice(1)), { recursive: true });
    writeFileSync(sysDb, JSON.stringify({ units: [{ unit: sliceName, sub: 'active', cgroup }] }));
    const marker: string = resolve(f.home, 'self.exit');
    const log: string = resolve(f.home, 'systemctl.log');
    // Assignments prefix the bun invocation so they are exported to it alone.
    const inner: string = [
      `cd ${f.root};`,
      `AKROGON_HOME=${f.home}`,
      `HOME=${f.home}`,
      `AKROGON_LEAF_TEMP_ROOT=${leafTempRoot(f)}`,
      `HERDR_PANE_ID=`,
      `AKROGON_RUN=`,
      `AKROGON_PROC_ROOT=/proc`,
      `AKROGON_CGROUP_ROOT=${cgRoot}`,
      `FAKE_SYSTEMCTL_DB=${sysDb}`,
      `FAKE_SYSTEMCTL_LOG=${log}`,
      `FAKE_HERDR=${f.db}`,
      `FAKE_BUSCTL_HOME=${f.home}`,
      `XDG_RUNTIME_DIR=${realRuntime}`,
      `DBUS_SESSION_BUS_ADDRESS=${realBus}`,
      `PATH=${resolve(f.home, 'bin')}:${process.env.PATH}`,
      `${process.execPath} ${entry} next --all;`,
      `echo $? > ${marker}`,
    ].join(' ');
    await sdrun('--scope', '--quiet', `--slice=${sliceName}`, '--', 'sh', '-c', inner);
    for (let i: number = 0; i < 300 && !existsSync(marker); i++) await Bun.sleep(100);
    expect(existsSync(marker)).toBe(true);
    expect(readFileSync(marker, 'utf8').trim()).toBe('0');
    const calls: string[] = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
    const guarded: string = z.string().parse(sliceName);
    expect(calls.some((line) => line.includes('list-units'))).toBe(true);
    expect(calls.some((line) => line.includes('stop') && line.includes(guarded))).toBe(false);
    expect(await isActive(guarded)).toBe(true);
  } finally {
    if (sliceName !== undefined) await cleanupUnit(sliceName);
    f.clean();
  }
}, 40000);

test('akrogon phase merged inside the leaf slice stops no slice', async () => {
  const f: SliceFixture = await slicesFixture();
  let sliceName: string | undefined;
  try {
    leaf(f, 'phase-leaf', 'merge', { ...holding(f), merge_stamp: '2026-10-15T20:00:00Z' }, 'standalone');
    sliceName = leafSlice({ name: 'repo' }, 'phase-leaf');
    const pid: number = await sleeper(f, sliceName);
    const marker: string = resolve(f.home, 'phase.exit');
    const inner: string = [
      `cd ${f.root};`,
      `AKROGON_HOME=${f.home}`,
      `HOME=${f.home}`,
      `AKROGON_LEAF_TEMP_ROOT=${leafTempRoot(f)}`,
      `HERDR_PANE_ID=`,
      `AKROGON_RUN=`,
      `FAKE_HERDR=${f.db}`,
      `FAKE_BUSCTL_HOME=${f.home}`,
      `XDG_RUNTIME_DIR=${realRuntime}`,
      `DBUS_SESSION_BUS_ADDRESS=${realBus}`,
      `PATH=${resolve(f.home, 'bin')}:${process.env.PATH}`,
      `${process.execPath} ${entry} phase phase-leaf merged 2> ${marker}.err;`,
      `echo $? > ${marker}`,
    ].join(' ');
    await sdrun('--scope', '--quiet', `--slice=${sliceName}`, '--', 'sh', '-c', inner);
    for (let i: number = 0; i < 300 && !existsSync(marker); i++) await Bun.sleep(100);
    expect(existsSync(marker)).toBe(true);
    const code: string = readFileSync(marker, 'utf8').trim();
    const err: string = existsSync(`${marker}.err`) ? readFileSync(`${marker}.err`, 'utf8') : '';
    expect(code, err).toBe('0');
    expect(pidAlive(pid)).toBe(true);
    expect(await isActive(sliceName)).toBe(true);
    const moved: State = readState(resolve(f.root, 'issues/closed/standalone/phase-leaf'));
    expect(moved.phase).toBe('merged');
  } finally {
    if (sliceName !== undefined) await cleanupUnit(sliceName);
    f.clean();
  }
}, 40000);

test('the run guard unit is submitted with CollectMode=inactive-or-failed', async () => {
  const f: SliceFixture = await slicesFixture();
  try {
    const path: string = await dispatchLeaf(f, 'guard-leaf');
    const worktree: string = z.string().parse(readState(path).worktree);
    const log: string = resolve(f.home, 'systemd-run.calls');
    const result: Result = await cli(f, ['run-check', '--name', 'x', '--', 'true'], worktree, {
      ...f.env,
      FAKE_SYSTEMD_RUN_LOG: log,
    });
    expect(result.code).toBe(0);
    const lines: string[] = readFileSync(log, 'utf8').trim().split('\n');
    const guard: string | undefined = lines.find((line) => line.includes('-guard'));
    expect(guard).toBeDefined();
    expect(guard).toContain('CollectMode=inactive-or-failed');
  } finally {
    f.clean();
  }
});

test('a loaded failed akrogon-run unit is cleared by a reconcile pass', async () => {
  const f: SliceFixture = await slicesFixture();
  const unit: string = `akrogon-run-flp-${process.pid}-dead`;
  try {
    leaf(f, 'seed', 'plan.synthesis');
    // No CollectMode here: the unit must stay listed as failed until the pass clears it.
    const seeded: SpawnResult = await sdrun('--quiet', `--unit=${unit}`, '--slice=akrogon.slice', 'false');
    expect(seeded.code).toBe(0);
    await waitFor(async () => (await listed('akrogon-run-flp-*')).includes(`${unit}.service`));
    const pass: SpawnResult = await spawnReal(f, ['next', '--all'], f.root).result;
    expect(pass.code, `${pass.stdout} | ${pass.stderr}`).toBe(0);
    expect(await listed('akrogon-run-flp-*')).not.toContain(`${unit}.service`);
  } finally {
    await cleanupUnit(unit);
    f.clean();
  }
});
