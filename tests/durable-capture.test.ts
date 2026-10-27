import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { command, spawnFiles, finishCaptured, type Result, type SpawnResult } from '../src/shell';
import { fixture, cli, leaf, yaml, fakeAkrogon, fakeHerdr, leafTempRoot, holding, type Fixture } from './helpers';
import type { Captured } from '../src/shell';

type Live = { proc: Bun.Subprocess; captured: Captured; result: Promise<SpawnResult> };

function spawnCheck(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): Live {
  const merged: NodeJS.ProcessEnv = {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
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

async function mergingLeaf(f: Fixture, slug: string, container: string = 'issue'): Promise<string> {
  const worktree: string = resolve(f.home, 'wt', slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  leaf(f, slug, 'merge', { ...holding(f), worktree }, container);
  return realpathSync(worktree);
}

// Blocking command: writes both markers, announces readiness on a real file,
// then waits until the test releases it. No sleeps.
function blocking(f: Fixture, name: string): string {
  return [
    `echo MARKER-${name}-OUT`,
    `echo MARKER-${name}-ERR >&2`,
    `touch '${f.home}/ready-${name}'`,
    `while [ ! -e '${f.home}/release-${name}' ]; do sleep 0.05; done`,
    `echo DONE-${name}-OUT`,
    `echo DONE-${name}-ERR >&2`,
  ].join('; ');
}

function readErr(captured: Captured): string {
  return existsSync(captured.errPath) ? readFileSync(captured.errPath, 'utf8') : '';
}

test('a SIGKILLed run-check leaves both streams in holder capture files after reconcile', async () => {
  const f: Fixture = await fixture();
  try {
    const leafPath: string = leaf(f, 'durable', 'implement');
    const impl: string = resolve(leafPath, 'implementation');
    mkdirSync(impl, { recursive: true });
    const cap: Live = spawnCheck(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'durable', '--', 'sh', '-c', blocking(f, 'durable')],
      f.root,
    );
    try {
      await waitFor(() => existsSync(`${f.home}/ready-durable`), 'ready file');
      const live: { out: string; err: string }[] = captures(impl);
      expect(live).toHaveLength(1);
      expect(readFileSync(live[0].out, 'utf8')).toContain('MARKER-durable-OUT');
      expect(readFileSync(live[0].err, 'utf8')).toContain('MARKER-durable-ERR');
      // Criterion 2: while the command runs, stderr already names the capture
      // paths and claims no exit; the check line has not appeared.
      const mid: string = readErr(cap.captured);
      expect(mid).toMatch(new RegExp(`capture durable: ${live[0].out} ${live[0].err}\\n`));
      expect(mid).not.toContain('check durable:');
      cap.proc.kill('SIGKILL');
      const result: SpawnResult = await cap.result;
      expect(result.signalCode).toBe('SIGKILL');
      expect((await cli(f, ['next'], f.root, fakeHerdr(f).env)).code).toBe(0);
      expect(readFileSync(live[0].out, 'utf8')).toContain('MARKER-durable-OUT');
      expect(readFileSync(live[0].err, 'utf8')).toContain('MARKER-durable-ERR');
      // Criterion 6: no completed artifacts, and akrogon log reads the capture.
      expect(readdirSync(impl).filter((name) => /^check-.*\.log$/.test(name))).toEqual([]);
      expect(readErr(cap.captured)).not.toContain('check durable:');
      const timings: string = readFileSync(resolve(f.root, 'issues/timings.jsonl'), 'utf8');
      expect(timings).toContain('"kind":"check_start"');
      expect(timings).not.toContain('"kind":"check_end"');
      const logged: Result = await cli(f, ['log', live[0].out]);
      expect(logged.code, logged.stderr).toBe(0);
      expect(logged.stdout).toContain('MARKER-durable-OUT');
      const loggedErr: Result = await cli(f, ['log', live[0].err]);
      expect(loggedErr.stdout).toContain('MARKER-durable-ERR');
    } finally {
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      writeFileSync(`${f.home}/release-durable`, '');
      void cap.result;
    }
  } finally {
    f.clean();
  }
}, 45000);

test('a SIGKILLed nested run-check leaves its captures in its own holder after reconcile', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    const shim: { env: NodeJS.ProcessEnv } = fakeAkrogon(f);
    const innerLeaf: string = leaf(f, 'inner', 'implement');
    const innerImpl: string = resolve(innerLeaf, 'implementation');
    mkdirSync(innerImpl, { recursive: true });
    const outerLeaf: string = leaf(f, 'outer', 'implement');
    const outerWork: string = resolve(f.home, 'wt', 'outer');
    await command(['git', 'worktree', 'add', '-b', 'outer', outerWork, 'origin/main'], f.root);
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
      realpathSync(outerWork),
      { ...shim.env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) },
    );
    try {
      await waitFor(() => existsSync(`${f.home}/ready-inner`), 'inner ready file');
      // The inner wrapper's pid is the .owner of the newest run root under the
      // leaf temp: the inner run root is the one whose capture sits in
      // innerImpl.
      await waitFor(() => captures(innerImpl).length === 1, 'inner capture files');
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
      expect((await cli(f, ['next'], f.root, fakeHerdr(f).env)).code).toBe(0);
      const kept: { out: string; err: string }[] = captures(innerImpl);
      expect(kept).toHaveLength(1);
      expect(readFileSync(kept[0].out, 'utf8')).toContain('MARKER-inner-OUT');
      expect(readFileSync(kept[0].err, 'utf8')).toContain('MARKER-inner-ERR');
    } finally {
      writeFileSync(`${f.home}/release-inner`, '');
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      void cap.result;
    }
  } finally {
    f.clean();
  }
}, 45000);

test('a normal exit leaves exactly the combined check log in the holder', async () => {
  const f: Fixture = await fixture();
  try {
    const leafPath: string = leaf(f, 'clean', 'implement');
    const impl: string = resolve(leafPath, 'implementation');
    const cap: Live = spawnCheck(
      f,
      [
        'run-check',
        '--leaf',
        leafPath,
        '--name',
        'clean',
        '--',
        'sh',
        '-c',
        "echo OUT; echo ERR >&2; touch 'done-mark'",
      ],
      f.root,
    );
    // The capture line precedes the replayed command stderr on the wrapper's
    // own stderr, and the check line closes it.
    await waitFor(() => existsSync(`${f.home}/wt/done-mark`) || existsSync(`${f.root}/done-mark`), 'done mark');
    const result: SpawnResult = await cap.result;
    expect(result.code).toBe(0);
    expect(result.stderr).toMatch(/^run [0-9a-f-]{36}\ncapture clean: \S+ \S+\n/);
    expect(result.stderr.indexOf('capture clean:')).toBeLessThan(result.stderr.indexOf('ERR'));
    expect(result.stderr.indexOf('ERR')).toBeLessThan(result.stderr.indexOf('check clean: 0 '));
    const logs: string[] = readdirSync(impl);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(/^check-clean-.+-\d+\.log$/);
    expect(captures(impl)).toEqual([]);
    expect(readFileSync(resolve(impl, logs[0]), 'utf8')).toBe('OUT\nERR\n');
    expect(result.stdout).toContain('OUT');
    expect(result.stderr).toContain('ERR');
  } finally {
    f.clean();
  }
}, 45000);

test('an owner moved aside at publication keeps output in the run root and never recreates the owner', async () => {
  const f: Fixture = await fixture();
  try {
    const leafPath: string = leaf(f, 'gone-leaf', 'implement');
    const owner: string = resolve(f.root, 'issues/open/issue');
    const aside: string = resolve(f.root, 'issues/parked/issue');
    const cap: Live = spawnCheck(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'gone', '--', 'sh', '-c', blocking(f, 'gone')],
      f.root,
    );
    try {
      await waitFor(() => existsSync(`${f.home}/ready-gone`), 'ready file');
      await waitFor(() => captures(resolve(leafPath, 'implementation')).length === 1, 'capture files');
      mkdirSync(resolve(f.root, 'issues/parked'), { recursive: true });
      renameSync(owner, aside);
      writeFileSync(`${f.home}/release-gone`, '');
      const result: SpawnResult = await cap.result;
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('gone');
      const logPath: string | undefined = result.stderr.match(/captured output stays in (\S+)/)?.[1];
      expect(logPath).toBeDefined();
      expect(logPath!).toMatch(/run-[^/]+\/out\.log$/);
      expect(readFileSync(logPath!, 'utf8')).toContain('MARKER-gone-OUT');
      expect(readFileSync(logPath!, 'utf8')).toContain('MARKER-gone-ERR');
      expect(readFileSync(resolve(logPath!, '..', 'refusal.json'), 'utf8')).toContain('gone');
      expect(existsSync(owner)).toBe(false);
      expect(captures(resolve(aside, 'gone-leaf/implementation'))).toEqual([]);
    } finally {
      writeFileSync(`${f.home}/release-gone`, '');
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      void cap.result;
    }
  } finally {
    f.clean();
  }
}, 45000);

test('a pack started during a live capture waits for writers and publication, then akrogon log reads both streams', async () => {
  const f: Fixture = await fixture();
  try {
    await mergingLeaf(f, 'packw');
    const leafPath: string = resolve(f.root, 'issues/open/issue/packw');
    const impl: string = resolve(leafPath, 'implementation');
    mkdirSync(impl, { recursive: true });
    const cap: Live = spawnCheck(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'pk', '--', 'sh', '-c', blocking(f, 'pk')],
      f.root,
    );
    let phaseDone: boolean = false;
    const phase = cli(f, ['phase', 'packw', 'merged']).then((result) => {
      phaseDone = true;
      return result;
    });
    try {
      await waitFor(() => existsSync(`${f.home}/ready-pk`), 'ready file');
      await waitFor(() => captures(impl).length === 1, 'capture files');
      // The command cannot exit until released: a finished phase here proves
      // pack did not wait for the capture writers.
      for (let i = 0; i < 30; i++) {
        if (phaseDone) throw new Error('phase finished while the capture was live');
        await Bun.sleep(100);
      }
      expect(existsSync(resolve(f.root, 'issues/open/issue'))).toBe(true);
      writeFileSync(`${f.home}/release-pk`, '');
      const runResult: SpawnResult = await cap.result;
      expect(runResult.code).toBe(0);
      const phaseResult: Result = await phase;
      expect(phaseResult.code, phaseResult.stderr).toBe(0);
      const closed: string = resolve(f.root, 'issues/closed/issue');
      expect(existsSync(closed)).toBe(true);
      const checkLog: string | undefined = runResult.stderr.match(/check pk: 0 (\S+)/)?.[1];
      expect(checkLog).toBeDefined();
      expect(checkLog!).toMatch(/check-pk-.+-\d+\.log$/);
      // Publication removed the partial captures; the archive holds the
      // combined log and akrogon log reads both streams back.
      expect(captures(impl)).toEqual([]);
      expect(readFileSync(resolve(closed, 'evidence.tar.zst')).length).toBeGreaterThan(0);
      const logged: Result = await cli(f, ['log', checkLog!]);
      expect(logged.code, logged.stderr).toBe(0);
      expect(logged.stdout).toContain('MARKER-pk-OUT');
      expect(logged.stdout).toContain('MARKER-pk-ERR');
    } finally {
      writeFileSync(`${f.home}/release-pk`, '');
      if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
      void cap.result;
      void phase;
    }
  } finally {
    f.clean();
  }
}, 60000);
