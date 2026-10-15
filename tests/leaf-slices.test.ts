import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  cli,
  entry,
  fixture,
  leaf,
  fakeHerdr,
  holding,
  leafTempRoot,
  procRoot,
  storeDir,
  yaml,
  type Fixture,
} from './helpers';
import { finishCaptured, spawnFiles, type Result, type SpawnResult } from '../src/shell';
import { leafSlice } from '../src/scope';
import { globalSchema, readRepo, leafTemp, type GlobalConfig } from '../src/config';
import { readState, saveState, type State } from '../src/state';
import type { Database } from './fake-herdr';

type SliceFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
type Cap = { proc: Bun.Subprocess; result: Promise<SpawnResult> };

test('a repo-local pass preserves another registered repo slice with a live tab', async () => {
  const f: SliceFixture = await slicesFixture();
  const other: Fixture = await fixture();
  try {
    const config: GlobalConfig = globalSchema.parse(
      Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')),
    );
    yaml(resolve(f.home, 'config.yaml'), { ...config, repos: { repo: f.root, other: other.root } });
    leaf(other, 'other-finished', 'merged', { repo: 'other', tab: 'w1:t8' });
    saveDatabase(f, {
      ...database(f),
      tabs: [{ tab_id: 'w1:t8', label: 'other-finished', focused: false }],
      panes: [{ pane_id: 'w1:p8', tab_id: 'w1:t8', cwd: null, agent: null, agent_status: 'idle' }],
    });
    const slice: string = leafSlice({ name: 'other' }, 'other-finished');
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, 'other'), { recursive: true });
    writeFileSync(resolve(cgRoot, 'other/cgroup.procs'), '');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin/systemctl'));
    const db: string = resolve(f.home, 'systemctl.json');
    const log: string = resolve(f.home, 'systemctl.log');
    writeFileSync(db, JSON.stringify({ units: [{ unit: slice, sub: 'active', cgroup: '/other' }] }));
    const result: Result = await cli(f, ['next', '--all'], f.root, {
      ...f.env,
      FAKE_SYSTEMCTL_DB: db,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_CGROUP_ROOT: cgRoot,
    });
    expect(result.code, result.stderr).toBe(0);
    expect(readFileSync(log, 'utf8')).not.toContain(`stop ${slice}`);
  } finally {
    f.clean();
    other.clean();
  }
});

const uid: number = process.getuid!();

test('bad leaf ownership keeps uncertain slices without aborting failed-unit cleanup', async () => {
  const f: SliceFixture = await slicesFixture();
  try {
    leaf(f, 'bad-state', 'merged', { repo: 'old-repo-name', tab: 'w1:t9' });
    const slice: string = leafSlice({ name: 'repo' }, 'bad-state');
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, 'bad-state'), { recursive: true });
    writeFileSync(resolve(cgRoot, 'bad-state/cgroup.procs'), '');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin/systemctl'));
    const db: string = resolve(f.home, 'systemctl.json');
    const log: string = resolve(f.home, 'systemctl.log');
    writeFileSync(
      db,
      JSON.stringify({
        units: [
          { unit: slice, sub: 'active', cgroup: '/bad-state' },
          { unit: 'akrogon-run-bad-state.service', sub: 'failed' },
        ],
      }),
    );
    const result: Result = await cli(f, ['next', '--all'], f.root, {
      ...f.env,
      FAKE_SYSTEMCTL_DB: db,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_CGROUP_ROOT: cgRoot,
    });
    expect(result.code).toBe(1);
    const calls: string = readFileSync(log, 'utf8');
    expect(calls).toContain('reset-failed akrogon-run-bad-state.service');
    expect(calls).not.toContain(`stop ${slice}`);
    const report = z
      .object({ kept: z.array(z.object({ path: z.string(), reason: z.string() })) })
      .parse(JSON.parse(readFileSync(resolve(f.home, 'reconcile-host.json'), 'utf8')));
    expect(report.kept.some((entry) => entry.path === slice && entry.reason.includes('old-repo-name'))).toBe(true);
  } finally {
    f.clean();
  }
});

const realRuntime: string = `/run/user/${uid}`;
const realBus: string = `unix:path=${realRuntime}/bus`;

test('a shell run admitted while another slice stops protects its own slice', async () => {
  const f: SliceFixture = await slicesFixture();
  const gate: string = resolve(f.home, 'continue-stop');
  const release: string = resolve(f.home, 'release-run');
  try {
    leaf(f, 'a-control', 'merged');
    leaf(f, 'z-protected', 'merge');
    const control: string = leafSlice({ name: 'repo' }, 'a-control');
    const protectedSlice: string = leafSlice({ name: 'repo' }, 'z-protected');
    const stopping: string = resolve(f.home, 'stopping');
    const held: string = resolve(f.home, 'run-held');
    const db: string = resolve(f.home, 'systemctl.json');
    const log: string = resolve(f.home, 'systemctl.log');
    writeFileSync(
      db,
      JSON.stringify({
        units: [
          { unit: control, sub: 'active' },
          { unit: protectedSlice, sub: 'active' },
        ],
      }),
    );
    writeFileSync(
      resolve(f.home, 'bin/systemctl'),
      [
        '#!/usr/bin/env bun',
        'import { existsSync, writeFileSync } from "node:fs";',
        'const args = process.argv.slice(2);',
        `if (args.includes('stop') && args.includes(${JSON.stringify(control)})) {`,
        `  writeFileSync(${JSON.stringify(stopping)}, '');`,
        `  while (!existsSync(${JSON.stringify(gate)})) await Bun.sleep(10);`,
        '}',
        `const child = Bun.spawn([${JSON.stringify(process.execPath)}, ${JSON.stringify(resolve(import.meta.dir, 'fake-systemctl.ts'))}, ...args], { stdout: 'inherit', stderr: 'inherit' });`,
        'process.exit(await child.exited);',
      ].join('\n'),
      { mode: 0o755 },
    );
    const env: NodeJS.ProcessEnv = { ...f.env, FAKE_SYSTEMCTL_DB: db, FAKE_SYSTEMCTL_LOG: log };
    const pass: Promise<Result> = cli(f, ['next', '--all'], f.root, env, 15000);
    try {
      await waitFor(async () => existsSync(stopping));
      const run: Promise<Result> = cli(
        f,
        [
          'run-check',
          '--leaf',
          resolve(f.root, 'issues/open/issue/z-protected'),
          '--',
          'sh',
          '-c',
          `touch ${held}; while [ ! -e ${release} ]; do sleep 0.02; done`,
        ],
        f.root,
        env,
        15000,
      );
      try {
        await waitFor(async () => existsSync(held));
        writeFileSync(gate, '');
        const result: Result = await pass;
        expect(result.code, result.stderr).toBe(0);
        expect(readFileSync(log, 'utf8')).not.toContain(`stop ${protectedSlice}`);
      } finally {
        writeFileSync(gate, '');
        writeFileSync(release, '');
        const result: Result = await run;
        expect(result.code, result.stderr).toBe(0);
      }
    } finally {
      writeFileSync(gate, '');
      await pass;
    }
  } finally {
    f.clean();
  }
}, 25000);

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

function hostKept(f: Fixture): { path: string; reason: string }[] {
  const file: string = resolve(f.home, 'reconcile-host.json');
  if (!existsSync(file)) return [];
  return z
    .object({ kept: z.array(z.object({ path: z.string(), reason: z.string() })) })
    .parse(JSON.parse(readFileSync(file, 'utf8'))).kept;
}

// store-sweep criterion 2: the host step removes retired akrogon leftovers —
// the retired temp root, unregistered worktree-store dirs, leaf-temp dirs of
// unregistered repos, runs/last-start, dead-pid tmp files and retired locks —
// and keeps what it cannot prove safe.
test('the host step removes retired leftovers and keeps unprovable items', async () => {
  const f: SliceFixture = await slicesFixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  const retired: string = resolve(f.home, 'retired');
  try {
    leaf(f, 'gone-leaf', 'merged');
    mkdirSync(retired, { recursive: true });
    writeFileSync(resolve(retired, 'x'), 'x');
    const worktrees: string = resolve(f.home, '.akrogon/worktrees');
    mkdirSync(resolve(worktrees, 'oldname'), { recursive: true });
    mkdirSync(resolve(worktrees, 'gone-repo', 'wt'), { recursive: true });
    writeFileSync(resolve(worktrees, 'gone-repo', 'wt', '.git'), 'gitdir: x');
    mkdirSync(resolve(worktrees, 'keeper', 'inner'), { recursive: true });
    writeFileSync(resolve(worktrees, 'keeper', 'inner', '.git'), 'gitdir: x');
    const tempRoot: string = leafTempRoot(f);
    mkdirSync(resolve(tempRoot, 'aaaa', 'bbbb'), { recursive: true });
    const runs: string = resolve(f.home, 'runs');
    mkdirSync(runs, { recursive: true });
    writeFileSync(resolve(runs, 'last-start'), '1');
    writeFileSync(resolve(f.home, 'x.4194303.tmp'), 'x');
    writeFileSync(resolve(runs, `y.${child.pid}.tmp`), 'x');
    writeFileSync(resolve(f.home, 'z.4194303.tmp'), 'x');
    const locks: string = resolve(f.home, '.akrogon');
    writeFileSync(resolve(locks, 'run.lock'), '');
    writeFileSync(resolve(locks, 'framework-tests.lock'), '');
    const heldLock: string = resolve(f.root, '.git/akrogon-base-runs.lock');
    writeFileSync(heldLock, '');
    writeFileSync(resolve(f.root, 'issues/.lock'), '');
    writeFileSync(resolve(f.root, '.git/akrogon-install.lock'), '');
    mkdirSync(resolve(f.home, 'reconcile'), { recursive: true });
    writeFileSync(
      resolve(f.home, 'reconcile', 'repo.json'),
      JSON.stringify({ kept: [{ path: resolve(f.home, 'gone'), reason: 'unknown directory' }] }) + '\n',
    );
    writeFileSync(
      resolve(f.home, 'reconcile-host.json'),
      JSON.stringify({ kept: [{ path: resolve(f.home, 'gone'), reason: 'stale' }] }) + '\n',
    );
    const procDir: string = resolve(procRoot(f), String(child.pid));
    mkdirSync(resolve(procDir, 'fd'), { recursive: true });
    symlinkSync(heldLock, resolve(procDir, 'fd', '9'));
    symlinkSync('/tmp', resolve(procDir, 'cwd'));
    const sysDb: string = resolve(f.home, 'systemctl.json');
    writeFileSync(sysDb, JSON.stringify({ units: [] }));
    const log: string = resolve(f.home, 'systemctl.log');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin', 'systemctl'));
    const result: Result = await cli(f, ['next', '--all'], f.root, {
      ...f.env,
      FAKE_SYSTEMCTL_DB: sysDb,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_RETIRED_TEMP_ROOT: retired,
      AKROGON_CGROUP_ROOT: resolve(f.home, 'cgroups'),
    });
    expect(result.code).toBe(0);
    expect(existsSync(retired)).toBe(false);
    expect(existsSync(resolve(worktrees, 'oldname'))).toBe(false);
    expect(existsSync(resolve(worktrees, 'gone-repo'))).toBe(true);
    expect(existsSync(resolve(worktrees, 'keeper'))).toBe(true);
    expect(existsSync(resolve(tempRoot, 'aaaa'))).toBe(false);
    expect(existsSync(resolve(runs, 'last-start'))).toBe(false);
    expect(existsSync(resolve(f.home, 'x.4194303.tmp'))).toBe(false);
    expect(existsSync(resolve(f.home, 'z.4194303.tmp'))).toBe(false);
    expect(existsSync(resolve(runs, `y.${child.pid}.tmp`))).toBe(true);
    expect(existsSync(resolve(locks, 'run.lock'))).toBe(false);
    expect(existsSync(resolve(locks, 'framework-tests.lock'))).toBe(false);
    expect(existsSync(heldLock)).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/.lock'))).toBe(false);
    expect(existsSync(resolve(f.root, '.git/akrogon-install.lock'))).toBe(true);
    const host: { path: string; reason: string }[] = hostKept(f);
    expect(host.some((entry) => entry.path === resolve(f.home, 'gone'))).toBe(false);
    const repoKept = z
      .object({ kept: z.array(z.object({ path: z.string(), reason: z.string() })) })
      .parse(JSON.parse(readFileSync(resolve(f.home, 'reconcile', 'repo.json'), 'utf8'))).kept;
    expect(repoKept.some((entry) => entry.path === resolve(f.home, 'gone'))).toBe(false);
  } finally {
    child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

// store-sweep criteria 1 and 6: a finished leaf's temp stays while its slice
// holds a running unit, and goes once the unit is gone.
test('a finished leaf temp stays while its slice holds a running unit', async () => {
  const f: SliceFixture = await slicesFixture();
  try {
    leaf(f, 'busy-temp', 'merged', { tab: 'w1:t9' });
    const db: Database = database(f);
    saveDatabase(f, {
      ...db,
      tabs: [...db.tabs, { tab_id: 'w1:t9', label: 'busy-temp', focused: false }],
      panes: [...db.panes, { pane_id: 'w1:p9', tab_id: 'w1:t9', cwd: null, agent: null, agent_status: 'idle' }],
    });
    // Resolve under the child process's AKROGON_LEAF_TEMP_ROOT (leafTempRoot(f)),
    // not the suite's own env root.
    const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
    const temp: string = resolve(leafTempRoot(f), hex(f.root).slice(0, 4), hex(`${f.root}\nbusy-temp`).slice(0, 8));
    mkdirSync(temp, { recursive: true });
    const slice: string = leafSlice({ name: 'repo' }, 'busy-temp');
    const cgRoot: string = resolve(f.home, 'cgroups');
    mkdirSync(resolve(cgRoot, 'busy'), { recursive: true });
    writeFileSync(resolve(cgRoot, 'busy', 'cgroup.procs'), `${process.pid}\n`);
    const sysDb: string = resolve(f.home, 'systemctl.json');
    writeFileSync(sysDb, JSON.stringify({ units: [{ unit: slice, sub: 'active', cgroup: '/busy' }] }));
    const log: string = resolve(f.home, 'systemctl.log');
    symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin', 'systemctl'));
    const env: NodeJS.ProcessEnv = {
      ...f.env,
      FAKE_SYSTEMCTL_DB: sysDb,
      FAKE_SYSTEMCTL_LOG: log,
      AKROGON_CGROUP_ROOT: cgRoot,
    };
    expect((await cli(f, ['next', '--all'], f.root, env)).code).toBe(0);
    // The slice stays because the tab is live; the temp stays because the slice
    // still holds a running unit.
    expect(existsSync(temp)).toBe(true);
    closeTab(f, 'w1:t9');
    writeFileSync(resolve(cgRoot, 'busy', 'cgroup.procs'), '');
    expect((await cli(f, ['next', '--all'], f.root, env)).code).toBe(0);
    expect(existsSync(temp)).toBe(false);
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
