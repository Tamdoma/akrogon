import { test, expect } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { readRepo, type Repo } from '../src/config';
import { flakyLines } from '../src/flaky';
import { type VerifyRun } from '../src/verify';
import { cli, fixture, leaf, type Fixture } from './helpers';

type Step = { tree: string; command: string; exit: number; log: string; end?: string; setup?: number };

function run(step: Step, index: number): VerifyRun {
  return {
    run: `r${index}`,
    repo: 'repo',
    leaf: 'leaf',
    sha: `s${index}`,
    tree: step.tree,
    scope: 'leaf',
    path: '/tmp/x',
    pid: 1,
    boot_id: 'b',
    setup: step.setup ?? 0,
    commands: [{ name: 'test', command: step.command, exit: step.exit, log: step.log }],
    start: '2026-10-14T00:00:00.000Z',
    end: step.end,
  };
}

async function packEvidence(ownerDir: string, members: Record<string, string>): Promise<void> {
  mkdirSync(ownerDir, { recursive: true });
  const bytes: Uint8Array = await new Bun.Archive(members).bytes();
  writeFileSync(resolve(ownerDir, 'evidence.tar.zst'), Bun.zstdCompressSync(bytes, { level: 19 }));
}

test('flaky reports a deleted log when its owner remains without an archive', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo('repo', f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const log: string = resolve(dir, 'check-test.log');
    writeFileSync(log, '(fail) deleted log\n');
    rmSync(log);
    const steps: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 0, log, end: '2026-10-14T02:00:00.000Z' },
    ];
    expect(await flakyLines(repo, steps.map(run))).toEqual([
      { name: 'test', test: '(log gone)', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
    const result: Awaited<ReturnType<typeof cli>> = await cli(f, ['log', log]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(log);
  } finally {
    f.clean();
  }
});

test('flaky lists a command red then green on the same tree by failed test, and nothing else', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo('repo', f.root);
    const redLog: string = resolve(f.root, 'issues/open/issue/leaf/red.log');
    mkdirSync(resolve(f.root, 'issues/open/issue/leaf'), { recursive: true });
    writeFileSync(
      redLog,
      'test:owner | (pass) fine [1.00ms]\ntest:owner | (fail) browser owner > dies with run [5012.00ms]\n',
    );
    const green: string = resolve(f.root, 'issues/open/issue/leaf/green.log');
    const steps: Step[] = [
      // Listed: red then green on tree A, recorded out of order so only end time orders them.
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T01:00:00.000Z' },
      // Not listed: red then red, green only, a different command, setup failed, never finished.
      { tree: 'B', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'B', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T02:00:00.000Z' },
      { tree: 'C', command: 'bun test', exit: 0, log: green, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'D', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'D', command: 'bun test --other', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
      { tree: 'E', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T01:00:00.000Z', setup: 1 },
      { tree: 'E', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
      { tree: 'F', command: 'bun test', exit: 1, log: redLog },
      { tree: 'F', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    expect(await flakyLines(repo, steps.map(run))).toEqual([
      { name: 'test', test: 'browser owner > dies with run', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('flaky lists failed test names from plain and packed red logs and fails on broken archives', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo('repo', f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const content: string =
      'test:owner | (pass) fine [1.00ms]\ntest:owner | (fail) browser owner > dies with run [5012.00ms]\ntest:owner | (fail) browser owner > flakes on retry [3.00ms]\n';
    const log: string = resolve(dir, 'check-test.log');
    writeFileSync(log, content);
    const green: string = resolve(dir, 'check-green.log');
    const flip: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    const names: { name: string; test: string; count: number; last: string }[] = [
      { name: 'test', test: 'browser owner > dies with run', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'browser owner > flakes on retry', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ];
    expect((await flakyLines(repo, flip.map(run))).sort((a, b) => a.test.localeCompare(b.test))).toEqual(names);

    rmSync(log);
    await packEvidence(dirname(dir), { 'leaf/check-test.log': content });
    expect((await flakyLines(repo, flip.map(run))).sort((a, b) => a.test.localeCompare(b.test))).toEqual(names);

    const gone: Step[] = [
      {
        tree: 'A',
        command: 'bun test',
        exit: 1,
        log: resolve(f.root, 'issues/open/none/leaf/x.log'),
        end: '2026-10-14T01:00:00.000Z',
      },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    expect(await flakyLines(repo, gone.map(run))).toEqual([
      { name: 'test', test: '(log gone)', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);

    const broken: string = resolve(f.root, 'issues/open/bad/evidence.tar.zst');
    mkdirSync(resolve(f.root, 'issues/open/bad'), { recursive: true });
    writeFileSync(broken, Buffer.from('not a zstd archive'));
    const brokenRun: Step[] = [
      {
        tree: 'A',
        command: 'bun test',
        exit: 1,
        log: resolve(f.root, 'issues/open/bad/leaf/check.log'),
        end: '2026-10-14T01:00:00.000Z',
      },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    await expect(flakyLines(repo, brokenRun.map(run))).rejects.toThrow(broken);

    const present: string = resolve(f.root, 'issues/open/present');
    await packEvidence(present, { 'other.log': 'x' });
    const absent: Step[] = [
      {
        tree: 'A',
        command: 'bun test',
        exit: 1,
        log: resolve(f.root, 'issues/open/present/leaf/check.log'),
        end: '2026-10-14T01:00:00.000Z',
      },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    await expect(flakyLines(repo, absent.map(run))).rejects.toThrow(resolve(present, 'evidence.tar.zst'));
  } finally {
    f.clean();
  }
});
