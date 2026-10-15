import { test, expect } from 'bun:test';
import { lstatSync, mkdirSync, symlinkSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { leafTemp, readRepo, type Repo } from '../src/config';
import { retiredLeafTempRoot } from '../src/config';
import { fixture, fakeHerdr, fakeAkrogon, cli, storeDir, leafTempRoot, leaf, procRoot, type Fixture } from './helpers';
import { suiteRoot } from './isolation';
import { z } from 'zod';
import { spawnCaptured, type Pane, type SpawnResult } from '../src/shell';
import type { Reconciled } from '../src/reconcile';
import { leafSlice } from '../src/scope';

test('F7 test environments isolate the retired temp root', async () => {
  expect(retiredLeafTempRoot().startsWith(suiteRoot + '/')).toBe(true);
  const f: Fixture = await fixture();
  try {
    expect(fakeHerdr(f).env.AKROGON_RETIRED_TEMP_ROOT).toBe(resolve(f.home, 'retired-temp'));
    expect(fakeAkrogon(f).env.AKROGON_RETIRED_TEMP_ROOT).toBe(resolve(f.home, 'retired-temp'));
  } finally {
    f.clean();
  }
});

test('F1 dangling entries are removed from stores and the host temp root', async () => {
  const f: Fixture = await fixture();
  try {
    const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
    const roots: string[] = [storeDir(f), resolve(f.root, 'issues/worktrees'), leafTempRoot(f)];
    for (const root of roots) {
      mkdirSync(root, { recursive: true });
      symlinkSync(resolve(f.home, 'missing'), resolve(root, 'dangling'));
    }
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    for (const root of roots) expect(lstatSync(resolve(root, 'dangling'), { throwIfNoEntry: false })).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('F2 surviving processes protect leaf entries and leaf temps', async () => {
  const f: Fixture = await fixture();
  const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
  const repo: Repo = readRepo('repo', f.root);
  const owned: string = resolve(storeDir(f), 'done-old');
  const temp: string = resolve(leafTempRoot(f), relative(process.env.AKROGON_LEAF_TEMP_ROOT!, leafTemp(repo, 'done')));
  mkdirSync(owned, { recursive: true });
  mkdirSync(temp, { recursive: true });
  writeFileSync(resolve(temp, 'open'), 'x');
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300'], { cwd: owned });
  try {
    leaf(f, 'done', 'merged');
    const proc: string = resolve(procRoot(f), String(child.pid));
    mkdirSync(resolve(proc, 'fd'), { recursive: true });
    symlinkSync(owned, resolve(proc, 'cwd'));
    symlinkSync(resolve(temp, 'open'), resolve(proc, 'fd/3'));
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    expect(existsSync(owned)).toBe(true);
    expect(existsSync(temp)).toBe(true);
    child.kill('SIGKILL');
    await child.exited;
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    expect(existsSync(owned)).toBe(false);
    expect(existsSync(temp)).toBe(false);
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

test('F3 live owner records protect recursively deleted parents and batch records', async () => {
  const f: Fixture = await fixture();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
    const retired: string = resolve(f.home, 'retired-temp');
    const oldRepo: string = resolve(leafTempRoot(f), 'unregistered');
    const batch: string = resolve(storeDir(f), 'batch-live');
    const record: string = JSON.stringify({ pid: child.pid, boot_id: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(), started: new Date().toISOString() });
    for (const parent of [retired, oldRepo]) {
      const run: string = resolve(parent, 'leaf', 'run-live');
      mkdirSync(run, { recursive: true });
      writeFileSync(resolve(run, '.owner'), record);
    }
    mkdirSync(batch, { recursive: true });
    writeFileSync(batch + '.owner', record);
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    for (const path of [retired, oldRepo, batch, batch + '.owner']) expect(existsSync(path)).toBe(true);
    child.kill('SIGKILL');
    await child.exited;
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    for (const path of [retired, oldRepo, batch, batch + '.owner']) expect(existsSync(path)).toBe(false);
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

async function reconcileFixture(f: Fixture, panes: Pane[] | null, env: NodeJS.ProcessEnv): Promise<Reconciled> {
  const source: (name: string) => string = (name: string): string => JSON.stringify(resolve(import.meta.dir, '../src', name + '.ts'));
  const result: SpawnResult = await spawnCaptured([process.execPath, '-e', `const {reconcile}=await import(${source('reconcile')});const {readRepo}=await import(${source('config')});const {allLeaves}=await import(${source('state')});const r=readRepo('repo',process.cwd());console.log(JSON.stringify(await reconcile(r,allLeaves(r),${JSON.stringify(panes)})));`], {
    cwd: f.root,
    env: { ...process.env, ...env, HOME: f.home, AKROGON_HOME: f.home, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f), AKROGON_RUN: '' },
  });
  if (result.code !== 0) throw new Error(JSON.stringify(result));
  return z.object({ removed: z.array(z.string()), kept: z.array(z.object({ path: z.string(), reason: z.string(), clears: z.string().optional() })) }).parse(JSON.parse(result.stdout));
}

test('F4 repo activity follows live tabs and occupied slices instead of phase', async () => {
  for (const scenario of ['queued', 'finished-tab', 'busy-slice']) {
    const f: Fixture = await fixture();
    try {
      const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
      leaf(f, 'seat', scenario === 'finished-tab' ? 'merged' : 'implement', { tab: 'w1:t1' });
      const junk: string = resolve(storeDir(f), 'junk');
      mkdirSync(junk, { recursive: true });
      const panes: Pane[] = scenario === 'finished-tab' ? [{ pane_id: 'w1:p1', tab_id: 'w1:t1', cwd: f.root, agent: null, agent_status: 'working' }] : [];
      const db: string = resolve(f.home, 'systemctl.json');
      const cgroups: string = resolve(f.home, 'cgroups');
      mkdirSync(resolve(cgroups, 'busy'), { recursive: true });
      writeFileSync(resolve(cgroups, 'busy/cgroup.procs'), String(process.pid));
      writeFileSync(db, JSON.stringify({ units: scenario === 'busy-slice' ? [{ unit: leafSlice({ name: 'repo' }, 'seat'), sub: 'active', cgroup: '/busy' }] : [] }));
      symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin/systemctl'));
      await reconcileFixture(f, panes, { ...h.env, FAKE_SYSTEMCTL_DB: db, FAKE_SYSTEMCTL_LOG: resolve(f.home, 'systemctl.log'), AKROGON_CGROUP_ROOT: cgroups });
      expect({ scenario, present: existsSync(junk) }).toEqual({ scenario, present: scenario !== 'queued' });
    } finally {
      f.clean();
    }
  }
});

test('F5 dead-writer temp files wait for an available pane inventory', async () => {
  const f: Fixture = await fixture();
  try {
    const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
    const files: string[] = [storeDir(f), resolve(f.root, 'issues/worktrees')].map((root) => resolve(root, 'writer.4194303.tmp'));
    for (const file of files) {
      mkdirSync(resolve(file, '..'), { recursive: true });
      writeFileSync(file, 'x');
    }
    const unavailable: Reconciled = await reconcileFixture(f, null, h.env);
    for (const file of files) {
      expect(existsSync(file)).toBe(true);
      expect(unavailable.removed).not.toContain(file);
    }
    await reconcileFixture(f, [], h.env);
    for (const file of files) expect(existsSync(file)).toBe(false);
  } finally {
    f.clean();
  }
});

test('F6 kept filesystem reports include actionable clearing conditions', async () => {
  const f: Fixture = await fixture();
  try {
    const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
    const junk: string = resolve(storeDir(f), 'junk');
    mkdirSync(junk, { recursive: true });
    const repoResult: Reconciled = await reconcileFixture(f, null, h.env);
    expect(repoResult.kept.length).toBeGreaterThan(0);
    const report = z.object({ kept: z.array(z.object({ path: z.string(), reason: z.string().min(1), clears: z.string().min(1) })) });
    report.parse(JSON.parse(readFileSync(resolve(f.home, 'reconcile/repo.json'), 'utf8')));
    const worktree: string = resolve(f.home, '.akrogon/worktrees/retired/checkout');
    mkdirSync(worktree, { recursive: true });
    writeFileSync(resolve(worktree, '.git'), 'gitdir: retained');
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    const host: z.infer<typeof report> = report.parse(JSON.parse(readFileSync(resolve(f.home, 'reconcile-host.json'), 'utf8')));
    expect(host.kept.length).toBeGreaterThan(0);
  } finally {
    f.clean();
  }
});
