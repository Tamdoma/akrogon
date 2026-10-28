import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { finishCaptured, spawnFiles, type Result, type SpawnResult } from '../src/shell';
import type { Captured } from '../src/shell';
import { cli, entry, fakeHerdr, fixture, leaf, leafTempRoot, yaml, type Fixture } from './helpers';

type Live = { proc: Bun.Subprocess; captured: Captured; result: Promise<SpawnResult> };

function spawnCheck(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): Live {
  const merged: NodeJS.ProcessEnv = {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RUN: '',
    PATH: `${resolve(f.home, 'bin')}:${resolve(f.home, 'unitbin')}:${process.env.PATH}`,
    ...env,
  };
  const { child, captured } = spawnFiles([process.execPath, resolve(import.meta.dir, '../src/akrogon.ts'), ...args], {
    cwd,
    env: merged,
  });
  return { proc: child, captured, result: finishCaptured(child, captured) };
}

function captures(dir: string): { out: string; err: string }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /^capture-.+-out\.log$/.test(name))
    .map((name) => ({ out: join(dir, name), err: join(dir, name.replace(/-out\.log$/, '-err.log')) }));
}

async function waitFor(check: () => boolean, label: string, ms: number = 15000): Promise<void> {
  const begun: number = Date.now();
  while (!check()) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${label}`);
    await Bun.sleep(50);
  }
}

function stateBytes(leafPath: string): string {
  return readFileSync(resolve(leafPath, 'state.yaml'), 'utf8');
}

function logLines(f: Fixture): string[] {
  const log: string = resolve(f.root, 'issues/log.jsonl');
  if (!existsSync(log)) return [];
  return readFileSync(log, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '');
}

// A refusal must name the pair's out and err paths and the cleared-<run>.md to write.
function expectPairRefusal(result: Result, pair: { out: string; err: string }, cleared: string): void {
  expect(result.code).not.toBe(0);
  expect(result.stderr).toContain(pair.out);
  expect(result.stderr).toContain(pair.err);
  expect(result.stderr).toContain(cleared);
}

function blocking(f: Fixture, name: string): string {
  return [
    `echo $$ > '${f.home}/pid-${name}'`,
    `echo MARKER-${name}-OUT`,
    `echo MARKER-${name}-ERR >&2`,
    `touch '${f.home}/ready-${name}'`,
    `while [ ! -e '${f.home}/release-${name}' ]; do sleep 0.05; done`,
  ].join('; ');
}

async function gone(pid: number): Promise<void> {
  await waitFor(() => {
    try {
      process.kill(pid, 0);
      return false;
    } catch {
      return true;
    }
  }, `pid ${pid} gone`);
}

test('an abandoned capture pair refuses non-failed moves, and a non-blank cleared-<run>.md clears it', async () => {
  const f: Fixture = await fixture();
  const herdr = fakeHerdr(f);
  try {
    const leafPath: string = leaf(f, 'abandoned', 'implement');
    const impl: string = resolve(leafPath, 'implementation');
    const cap: Live = spawnCheck(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'gone', '--', 'sh', '-c', blocking(f, 'gone')],
      f.root,
    );
    let pair: { out: string; err: string };
    try {
      await waitFor(() => existsSync(`${f.home}/ready-gone`), 'ready file');
      await waitFor(() => captures(impl).length === 1, 'capture files');
      pair = captures(impl)[0];
      // A live pair refuses nothing yet: the command is still running.
      const live: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
      expect(live.code, live.stderr).toBe(0);
      const orphanPid: number = Number(readFileSync(`${f.home}/pid-gone`, 'utf8').trim());
      cap.proc.kill('SIGKILL');
      await cap.result;
      writeFileSync(`${f.home}/release-gone`, '');
      await gone(orphanPid);
    } finally {
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      writeFileSync(`${f.home}/release-gone`, '');
      void cap.result;
    }
    const out: string = pair!.out;
    const err: string = pair!.err;
    const run: string = out.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-out\.log$/)![1];
    const cleared: string = join(impl, `cleared-${run}.md`);
    expect(readFileSync(out, 'utf8')).toContain('MARKER-gone-OUT');
    expect(readFileSync(err, 'utf8')).toContain('MARKER-gone-ERR');

    // A second abandoned pair in the same leaf folder: the refusal names each.
    const run2: string = randomUUID();
    const out2: string = join(impl, `capture-second-${run2}-out.log`);
    const err2: string = join(impl, `capture-second-${run2}-err.log`);
    writeFileSync(out2, 'SECOND-OUT');
    writeFileSync(err2, 'SECOND-ERR');
    const cleared2: string = join(impl, `cleared-${run2}.md`);

    const before: string = stateBytes(leafPath);
    const beforeLog: string[] = logLines(f);
    const refused: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
    expectPairRefusal(refused, { out, err }, cleared);
    expectPairRefusal(refused, { out: out2, err: err2 }, cleared2);
    const singleSlot: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--slot', 'A'], f.root, herdr.env);
    expectPairRefusal(singleSlot, { out, err }, cleared);
    expect(stateBytes(leafPath)).toBe(before);
    expect(logLines(f)).toEqual(beforeLog);

    // Moves to failed and operator recovery from failed stay open.
    const failed: Result = await cli(
      f,
      ['phase', 'abandoned', 'failed', '--reason', 'blocked by test'],
      f.root,
      herdr.env,
    );
    expect(failed.code, failed.stderr).toBe(0);
    const recovered: Result = await cli(f, ['phase', 'abandoned', 'implement'], f.root, herdr.env);
    expect(recovered.code, recovered.stderr).toBe(0);

    // A cleared second pair drops out of the refusal; the first still names it.
    writeFileSync(cleared2, 'cleared the second run\n');
    const stillRefused: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
    expectPairRefusal(stillRefused, { out, err }, cleared);
    expect(stillRefused.stderr).not.toContain(out2);

    // A whitespace-only cleared file still refuses.
    writeFileSync(cleared, '   \n');
    const blank: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
    expectPairRefusal(blank, { out, err }, cleared);

    // Non-blank clears: the pair gate passes, names and bytes keep.
    const outBytes: string = readFileSync(out, 'utf8');
    const errBytes: string = readFileSync(err, 'utf8');
    writeFileSync(cleared, 'found the test user, cleaned it, absence read returned none\n');
    const passed: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
    expect(passed.code, passed.stderr).toBe(0);
    expect(readFileSync(out, 'utf8')).toBe(outBytes);
    expect(readFileSync(err, 'utf8')).toBe(errBytes);
    const logged: Result = await cli(f, ['log', out], f.root);
    expect(logged.code, logged.stderr).toBe(0);
    expect(logged.stdout).toContain('MARKER-gone-OUT');

    // A normal run-check exit, green or red, leaves no capture pair and no refusal.
    const ok: Result = await cli(f, ['run-check', '--leaf', leafPath, '--name', 'norm', '--', 'true'], f.root);
    expect(ok.code, ok.stderr).toBe(0);
    const red: Result = await cli(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'normred', '--', 'sh', '-c', 'exit 3'],
      f.root,
    );
    expect(red.code).toBe(3);
    expect(captures(impl)).toHaveLength(1);
    const after: Result = await cli(f, ['phase', 'abandoned', 'check.review', '--check'], f.root, herdr.env);
    expect(after.code, after.stderr).toBe(0);
  } finally {
    f.clean();
  }
}, 60000);

test('a live capture pair never refuses a move, nested run-check included', async () => {
  const f: Fixture = await fixture();
  const herdr = fakeHerdr(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    symlinkSync(entry, resolve(f.home, 'bin', 'akrogon'));
    const innerLeaf: string = leaf(f, 'inner', 'implement');
    const innerImpl: string = resolve(innerLeaf, 'implementation');
    const outerLeaf: string = leaf(f, 'outer', 'implement');
    writeFileSync(resolve(f.root, '.env'), 'AKROGON_HOME=declared\nAKROGON_LEAF_TEMP_ROOT=declared\n');
    const cap: Live = spawnCheck(
      f,
      [
        'run-check',
        '--leaf',
        outerLeaf,
        '--name',
        'outer',
        '--',
        'akrogon',
        'run-check',
        '--leaf',
        innerLeaf,
        '--name',
        'inner',
        '--',
        'sh',
        '-c',
        blocking(f, 'inner'),
      ],
      f.root,
      {
        ...herdr.env,
        PATH: `${resolve(f.home, 'bin')}:${resolve(f.home, 'unitbin')}:${process.env.PATH}`,
        AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      },
    );
    try {
      await waitFor(() => existsSync(`${f.home}/ready-inner`), 'inner ready file');
      await waitFor(() => captures(innerImpl).length === 1, 'inner capture files');
      // While the nested command runs under its live wrapper, the inner leaf's
      // moves pass the pair gate.
      const live: Result = await cli(f, ['phase', 'inner', 'check.review', '--check'], f.root, herdr.env);
      expect(live.code, live.stderr).toBe(0);
      // SIGKILL only the inner wrapper: its command survives under the fake
      // seam and keeps the capture fd, so the pair stays live and refuses nothing.
      const owners: string[] = [
        ...new Bun.Glob('**/run-*/.owner').scanSync({ cwd: leafTempRoot(f), onlyFiles: true }),
      ].map((name) => resolve(leafTempRoot(f), name));
      expect(owners.length).toBeGreaterThanOrEqual(2);
      const innerPid: number = owners
        .map((path) => JSON.parse(readFileSync(path, 'utf8')).pid as number)
        .find((pid) => pid !== cap.proc.pid)!;
      process.kill(innerPid, 'SIGKILL');
      await waitFor(() => {
        try {
          process.kill(innerPid, 0);
          return false;
        } catch {
          return true;
        }
      }, 'inner wrapper exit');
      const stillLive: Result = await cli(f, ['phase', 'inner', 'check.review', '--check'], f.root, herdr.env);
      expect(stillLive.code, stillLive.stderr).toBe(0);
    } finally {
      writeFileSync(`${f.home}/release-inner`, '');
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      void cap.result;
    }
  } finally {
    f.clean();
  }
}, 60000);

test('the liveness probe creates no file and a pair gone at probe time is finished', async () => {
  const f: Fixture = await fixture();
  const herdr = fakeHerdr(f);
  try {
    const leafPath: string = leaf(f, 'probe', 'implement');
    const impl: string = resolve(leafPath, 'implementation');
    mkdirSync(impl, { recursive: true });
    // Publication unlinks the out file first: an err-only remnant is finished,
    // not abandoned, and probing it must not recreate the out file.
    const run1: string = randomUUID();
    const orphanErr: string = join(impl, `capture-orphan-${run1}-err.log`);
    writeFileSync(orphanErr, 'remnant');
    // A pair vanished between discovery and probe: the probe's create-free open
    // sees ENOENT, skips it and leaves no file. The dangling symlink stands in
    // for the vanished file: open without create fails the same way.
    const run2: string = randomUUID();
    const target: string = join(impl, `.gone-${run2}`);
    symlinkSync(target, join(impl, `capture-gone-${run2}-out.log`));
    const first: Result = await cli(f, ['phase', 'probe', 'check.review', '--check'], f.root, herdr.env);
    expect(first.code, first.stderr).toBe(0);
    expect(existsSync(join(impl, `capture-orphan-${run1}-out.log`))).toBe(false);
    expect(existsSync(target)).toBe(false);
    const second: Result = await cli(f, ['phase', 'probe', 'check.review', '--check'], f.root, herdr.env);
    expect(second.code, second.stderr).toBe(0);
    expect(existsSync(join(impl, `capture-orphan-${run1}-out.log`))).toBe(false);
    expect(existsSync(target)).toBe(false);
  } finally {
    f.clean();
  }
}, 45000);
