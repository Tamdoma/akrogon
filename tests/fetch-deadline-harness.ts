import assert from 'node:assert/strict';
import { mock } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import * as shell from '../src/shell';
import { fixture, leaf, type Fixture } from './helpers';

if (process.argv.length === 2) {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'recover', 'merge', { worktree: f.root });
    const bin: string = resolve(f.home, 'bin');
    mkdirSync(bin);
    symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
    const git: string = await shell.command(['which', 'git']);
    writeFileSync(
      resolve(bin, 'git'),
      `#!/bin/sh\nif [ "$1" = fetch ]; then echo $$ >> '${f.home}/fetch-pids'; exec sleep 3; fi\nexec '${git}' "$@"\n`,
      { mode: 0o755 },
    );
    const db: string = resolve(f.home, 'herdr.json');
    writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0, prompts: [], starts: [] }));
    process.env.AKROGON_HOME = f.home;
    process.env.HERDR_PANE_ID = '';
    process.env.FAKE_HERDR = db;
    process.env.PATH = `${bin}:${process.env.PATH}`;
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
      [process.execPath, import.meta.path, f.home, f.root],
      {
        cwd: f.root,
        env: { ...process.env },
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      },
    );
    const stdout: string = await new Response(child.stdout).text();
    const stderr: string = await new Response(child.stderr).text();
    assert.equal(await child.exited, 1, stderr);
    const diagnostic: { repo: string; path: string; slug: string; error: string } = z
      .object({ repo: z.string(), path: z.string(), slug: z.string(), error: z.string() })
      .parse(JSON.parse(stderr));
    assert.equal(diagnostic.repo, 'repo');
    assert.equal(diagnostic.path, resolve(f.root, 'issues/open/issue/recover'));
    assert.equal(diagnostic.slug, 'recover');
    assert.match(diagnostic.error, /deadline 100ms exceeded/);
    console.log(JSON.stringify({ dispatchExitCode: 1, diagnostic }));
    console.log(stdout.trimEnd());
  } finally {
    f.clean();
  }
} else {
  const f: { home: string; root: string } = { home: process.argv[2], root: process.argv[3] };
  const path: string = resolve(f.root, 'issues/open/issue/recover');
  const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
  const realRetryCommand: typeof shell.retryCommand = shell.retryCommand;
  mock.module('../src/shell', () => ({
    ...shell,
    retryCommand: async (argv: string[], cwd: string, deadlineMs?: number): Promise<string> => {
      assert.equal(deadlineMs, 60000);
      try {
        return await realRetryCommand(argv, cwd, 100);
      } catch (error) {
        assert(error instanceof shell.CommandError, String(error));
        assert.deepEqual(error.argv, ['git', 'fetch', 'origin', 'main']);
        assert.equal(error.cwd, f.root);
        assert.notEqual(error.result.code, 0);
        assert.match(error.result.stderr, /deadline 100ms exceeded/);
        console.log(JSON.stringify({ timeout: error.message }));
        throw error;
      }
    },
  }));
  const { nextCommand } = await import('../src/next');
  const start: number = performance.now();
  await nextCommand('recover');
  assert.equal(process.exitCode, 1);
  const elapsedMs: number = performance.now() - start;
  assert(elapsedMs < 1500, `elapsed ${elapsedMs}ms`);
  const pids: string[] = readFileSync(resolve(f.home, 'fetch-pids'), 'utf8').trim().split('\n');
  assert.equal(pids.length, 1);
  const pid: number = Number(pids[0]);
  for (let i: number = 0; i < 100 && existsSync(`/proc/${pid}`); i++) await Bun.sleep(10);
  assert(!existsSync(`/proc/${pid}`));
  console.log(JSON.stringify({ elapsedMs, deadPid: pid, attempts: pids.length }));
  for (const lock of [
    resolve(f.home, '.lock'),
    resolve(f.root, 'issues/.lock'),
    resolve(dirname(path), '.lock'),
    resolve(path, '.lock'),
  ]) {
    await shell.command(['flock', '-n', lock, 'true']);
    console.log(JSON.stringify({ reacquiredLock: lock }));
  }
  assert.equal(readFileSync(resolve(path, 'state.yaml'), 'utf8'), before);
  assert(!existsSync(resolve(f.root, 'issues/log.jsonl')));
  console.log(JSON.stringify({ phase: 'merge', stateUnchanged: true, transitionRecorded: false }));
}
