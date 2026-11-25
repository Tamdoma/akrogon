// Setup-before-seat criteria 1, 2, 3, 5 and 6 on a real core: the configured `setup` runs in the
// leaf worktree before the seat's first delivery, once per checkout state, keyed by the marker at
// the worktree's git path; a restack invalidates it; a failure is reported per leaf with the
// worktree removal split; with no `setup` configured nothing new runs. Every case drives the real
// `akrogon next`/`akrogon seat` dispatch against temp git repos, as tests/first-allocation.test.ts.
import { test, expect } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, leaf, storeDir, yaml } from './helpers';
import { hcFixture, stopCoresAfterFile, type HcFixture } from './hc-fixture';
import { readState } from '../src/state';
import { command, type Result } from '../src/shell';
import {
  adoptedWorktree,
  declareEnv,
  next,
  orderHook,
  pushMain,
  setupCalls,
  setupConditional,
  setupLines,
  setupLog,
  setupMarkerPath,
  setupScript,
  waitIdle,
  writeSetup,
} from './setup-fixture';

stopCoresAfterFile();

test('criterion 1: a fresh leaf runs setup once per checkout state before the first delivery', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build'], { AKROGON_RUN: 'token', CLAUDECODE: '1' });
    expect(result.code).toBe(0);
    const wt: string = resolve(storeDir(f), 'build');
    const lines: string[] = setupLines(f);
    expect(setupCalls(f)).toBe(1);
    expect(lines.slice(0, 6)).toEqual([`cwd=${wt}`, 'ver=v1', 'run=unset', 'cc=unset', 'lock=held', 'dotenv=yes']);
    expect(lines[6]).toBe('task-build');
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(setupScript(f, 1));
    const seat = await waitIdle(f, 'build', 'a');
    // A re-prompt of the live idle seat delivers again without rerunning setup.
    expect((await next(f, ['build'])).code).toBe(0);
    expect(f.core.tasks(seat.address).length).toBeGreaterThanOrEqual(2);
    expect(setupCalls(f)).toBe(1);
    expect(readState(path).worktree).toBe(wt);
    // `akrogon seat` passes the same due check: the marker still matches, so nothing runs. The
    // live seat is retired first, since hc refuses a second terminal under the seat's name.
    await waitIdle(f, 'build', 'a');
    expect((await f.core.hc(['kill', seat.address])).code).toBe(0);
    expect((await f.core.hc(['rm', seat.address])).code).toBe(0);
    expect((await cli(f, ['seat', 'build', 'A'], f.root, f.env)).code).toBe(0);
    expect(setupCalls(f)).toBe(1);
    // A changed setup string reruns once, and the marker tracks the new string.
    await waitIdle(f, 'build', 'a');
    writeSetup(f, setupScript(f, 2), { env: ['SETUP_PROBE'] });
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(2);
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(setupScript(f, 2));
    expect((await next(f, ['build'])).code).toBe(0);
    expect(setupCalls(f)).toBe(2);
  } finally {
    await f.clean();
  }
});

test('criterion 2: a first allocation adopting a worktree on a branch with own commits runs setup there', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    const wt: string = await adoptedWorktree(f, 'build');
    leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    expect(readFileSync(resolve(wt, 'own'), 'utf8')).toBe('own work\n');
    const lines: string[] = setupLines(f);
    expect(lines[0]).toBe(`cwd=${wt}`);
    expect(lines[1]).toBe('ver=v1');
    expect(lines[6]).toBe('task-build');
    expect(setupCalls(f)).toBe(1);
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(setupScript(f, 1));
  } finally {
    await f.clean();
  }
});

test('criterion 3: move deletes the marker and the next re-prompt runs setup before the send', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    const path: string = leaf(f, 'build', 'check.repair');
    expect((await next(f, ['build'])).code).toBe(0);
    const seat = await waitIdle(f, 'build', 'b');
    const wt: string = resolve(storeDir(f), 'build');
    expect(setupCalls(f)).toBe(1);
    expect(existsSync(setupMarkerPath(wt))).toBe(true);
    // The restack: the leaf's own commit becomes the worktree's base through a move onto it.
    writeFileSync(resolve(f.root, 'top-file'), 'top\n');
    await command(['git', 'add', 'top-file'], f.root);
    await command(['git', 'commit', '-m', 'top'], f.root);
    const top: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const { readRepo } = await import('../src/config');
    const { move } = await import('../src/batch');
    const { findLeaf } = await import('../src/state');
    const repo = readRepo(f.repo, f.root);
    expect((await move(repo, 'build', top, findLeaf(repo, 'build'))).moved).toBe('worktree');
    expect(existsSync(setupMarkerPath(wt))).toBe(false);
    // The re-prompt of the live idle seat in check.repair reruns setup before the send.
    expect((await next(f, ['build'])).code).toBe(0);
    const lines: string[] = setupLines(f);
    expect(setupCalls(f)).toBe(2);
    expect(lines.filter((line: string) => line === 'task-build')).toHaveLength(2);
    const secondTask: number = lines.lastIndexOf('task-build');
    const secondSetup: number = lines.lastIndexOf(`cwd=${wt}`);
    expect(secondSetup).toBeGreaterThan(lines.indexOf('task-build'));
    expect(secondTask).toBeGreaterThan(secondSetup);
    expect(lines[secondSetup + 1]).toBe('ver=v1');
    expect(existsSync(resolve(wt, 'top-file'))).toBe(true);
    expect(
      f.core.tasks(seat.address).filter((text: string) => text.startsWith('check-issue build slot=B')),
    ).toHaveLength(2);
    expect(readState(path).worktree).toBe(wt);
  } finally {
    await f.clean();
  }
});

test('criterion 5: a failing setup is reported per leaf, removes its fresh worktree and spares the sibling', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    writeSetup(f, setupConditional(f, 1), { env: ['SETUP_PROBE'] });
    writeFileSync(resolve(f.home, 'fail-build'), '');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    leaf(f, 'other', 'plan.synthesis');
    const first: Result = await next(f, []);
    expect(first.code).not.toBe(0);
    expect(first.stderr).toContain('build');
    expect(first.stderr).toContain('42');
    expect(first.stderr).toContain('probe-out');
    expect(first.stderr).toContain('probe-err');
    // No seat starts for the leaf, the pass-created worktree is removed and no `worktree:` is recorded.
    expect(await f.core.terminals({ 'akrogon.leaf': 'build' }, true)).toEqual([]);
    expect(existsSync(resolve(storeDir(f), 'build'))).toBe(false);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^worktree:/m);
    // The sibling leaf in the same pass is still dispatched.
    expect((await f.core.terminals({ 'akrogon.leaf': 'other' }, false)).length).toBe(1);
    // After the cause is fixed the next pass runs setup and delivers.
    await command(['rm', resolve(f.home, 'fail-build')]);
    expect((await next(f, [])).code).toBe(0);
    expect((await f.core.terminals({ 'akrogon.leaf': 'build' }, false)).length).toBe(1);
    // The failing run recorded its own record lines first, so the leaf has two setup records.
    expect(setupLines(f).filter((line: string) => line === `cwd=${resolve(storeDir(f), 'build')}`).length).toBe(2);
    expect(existsSync(resolve(storeDir(f), 'build'))).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 5: the own-modules guard failure is reported and the adopted worktree is kept unmarked', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    await pushMain(f, { 'package.json': '{"name":"probe","private":true}\n' });
    // The setup succeeds but installs nothing: the guard finds no own node_modules.
    writeSetup(f, setupScript(f, 1), { env: ['SETUP_PROBE'] });
    const wt: string = await adoptedWorktree(f, 'build');
    leaf(f, 'build', 'plan.synthesis');
    const first: Result = await next(f, ['build']);
    expect(first.code).not.toBe(0);
    expect(first.stderr).toContain('build');
    expect(first.stderr).toContain('node_modules');
    expect(await f.core.terminals({ 'akrogon.leaf': 'build' }, true)).toEqual([]);
    // An adopted worktree stays, without a marker: the next pass retries.
    expect(existsSync(resolve(wt, 'own'))).toBe(true);
    expect(existsSync(setupMarkerPath(wt))).toBe(false);
    // Once setup does install, the next pass delivers.
    writeSetup(f, `${setupScript(f, 2)} && mkdir node_modules`, { env: ['SETUP_PROBE'] });
    expect((await next(f, ['build'])).code).toBe(0);
    expect((await f.core.terminals({ 'akrogon.leaf': 'build' }, false)).length).toBe(1);
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(`${setupScript(f, 2)} && mkdir node_modules`);
  } finally {
    await f.clean();
  }
});

test('criterion 5: a failing setup in an existing worktree keeps it and retries the next pass', async () => {
  const f: HcFixture = await hcFixture();
  try {
    declareEnv(f);
    orderHook(f);
    writeSetup(f, setupConditional(f, 1), { env: ['SETUP_PROBE'] });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const wt: string = resolve(storeDir(f), 'build');
    await waitIdle(f, 'build', 'a');
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(setupConditional(f, 1));
    // The marker differs after the config change: setup is due in the existing worktree.
    writeFileSync(resolve(f.home, 'fail-build'), '');
    writeSetup(f, setupConditional(f, 2), { env: ['SETUP_PROBE'] });
    const failed: Result = await next(f, ['build']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('build');
    expect(failed.stderr).toContain('probe-err');
    expect(existsSync(wt)).toBe(true);
    // The differing marker was deleted before the failed run, so no marker survives: retry is due.
    expect(existsSync(setupMarkerPath(wt))).toBe(false);
    expect(readState(path).worktree).toBe(wt);
    // Once the cause is fixed the retry installs v2 and marks the worktree.
    await command(['rm', resolve(f.home, 'fail-build')]);
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readFileSync(setupMarkerPath(wt), 'utf8')).toBe(setupConditional(f, 2));
  } finally {
    await f.clean();
  }
});

test('criterion 6: with no setup configured dispatch is unchanged, no marker and no guard', async () => {
  const f: HcFixture = await hcFixture();
  try {
    orderHook(f);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
    await pushMain(f, { 'package.json': '{"name":"probe","private":true}\n' });
    leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    const wt: string = resolve(storeDir(f), 'build');
    // No marker is written and no own-modules guard runs: the checkout keeps no node_modules.
    expect(existsSync(setupMarkerPath(wt))).toBe(false);
    expect(existsSync(resolve(wt, 'node_modules'))).toBe(false);
    expect(setupLines(f).filter((line: string) => line.startsWith('cwd='))).toEqual([]);
    expect((await f.core.terminals({ 'akrogon.leaf': 'build' }, false)).length).toBe(1);
    expect(setupLines(f).some((line: string) => line === 'task-build')).toBe(true);
  } finally {
    await f.clean();
  }
});
