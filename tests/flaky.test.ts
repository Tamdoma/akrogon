import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { readRepo, type Repo } from '../src/config';
import { flakyLines } from '../src/flaky';
import { type VerifyRun } from '../src/verify';
import { cli, fixture, leaf, seedRun, type Fixture } from './helpers';

type Step = { tree: string; command: string; exit: number; log: string; end?: string; setup?: number; reused?: string };

function run(f: Fixture, step: Step, index: number): VerifyRun {
  return {
    run: `r${index}`,
    repo: f.repo,
    leaf: 'leaf',
    sha: `s${index}`,
    tree: step.tree,
    scope: 'leaf',
    path: '/tmp/x',
    pid: 1,
    boot_id: 'b',
    setup: step.setup ?? 0,
    commands: [
      {
        name: 'test',
        command: step.command,
        exit: step.exit,
        log: step.log,
        ...(step.reused === undefined ? {} : { reused: step.reused }),
      },
    ],
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
    const repo: Repo = readRepo(f.repo, f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const log: string = resolve(dir, 'check-test.log');
    writeFileSync(log, '(fail) deleted log\n');
    rmSync(log);
    const steps: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 0, log, end: '2026-10-14T02:00:00.000Z' },
    ];
    expect(
      await flakyLines(
        repo,
        steps.map((step, index) => run(f, step, index)),
      ),
    ).toEqual([{ name: 'test', test: '(log gone)', count: 1, last: '2026-10-14T02:00:00.000Z' }]);
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
    const repo: Repo = readRepo(f.repo, f.root);
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
    expect(
      await flakyLines(
        repo,
        steps.map((step, index) => run(f, step, index)),
      ),
    ).toEqual([{ name: 'test', test: 'browser owner > dies with run', count: 1, last: '2026-10-14T02:00:00.000Z' }]);
  } finally {
    f.clean();
  }
});

test('flaky lists failed test names from plain and packed red logs and fails on broken archives', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
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
    expect(
      (
        await flakyLines(
          repo,
          flip.map((step, index) => run(f, step, index)),
        )
      ).sort((a, b) => a.test.localeCompare(b.test)),
    ).toEqual(names);

    rmSync(log);
    await packEvidence(dirname(dir), { 'leaf/check-test.log': content });
    expect(
      (
        await flakyLines(
          repo,
          flip.map((step, index) => run(f, step, index)),
        )
      ).sort((a, b) => a.test.localeCompare(b.test)),
    ).toEqual(names);

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
    expect(
      await flakyLines(
        repo,
        gone.map((step, index) => run(f, step, index)),
      ),
    ).toEqual([{ name: 'test', test: '(log gone)', count: 1, last: '2026-10-14T02:00:00.000Z' }]);

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
    await expect(
      flakyLines(
        repo,
        brokenRun.map((step, index) => run(f, step, index)),
      ),
    ).rejects.toThrow(broken);

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
    await expect(
      flakyLines(
        repo,
        absent.map((step, index) => run(f, step, index)),
      ),
    ).rejects.toThrow(resolve(present, 'evidence.tar.zst'));
  } finally {
    f.clean();
  }
});

test('a failed script names its innermost token, its wrapper adds nothing and a named stream beside it still lists the title', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const fanout: string = resolve(dir, 'check-red.log');
    writeFileSync(
      fanout,
      [
        'grp-a | t:custom | Exited with code 3',
        'grp-a | t:named  | (fail) named > breaks [0.18ms]',
        'grp-a | t:named  | Exited with code 1',
        'grp-a | t:sig    | Signaled: SIGTERM',
        'grp-a | Exited with code 3',
        'framework:verify:rest-c | test:variant-parity | Exited with code 1',
        'framework:verify:rest-c | Exited with code 1',
        // Whole-token prefixes only: test:a is not a token prefix of test:ab.
        'test:a | Exited with code 2',
        'test:ab | Exited with code 3',
        // A bare (fail) on no stream suppresses nothing.
        '(fail) bare title [1.00ms]',
      ].join('\n') + '\n',
    );
    const green: string = resolve(dir, 'check-green.log');
    const wrapped: string = resolve(dir, 'check-wrapped.log');
    writeFileSync(wrapped, readFileSync(fanout, 'utf8').replace(/grp-a/g, 'wrap-b'));
    const step = (log: string, exit: number, end: string): Step => ({
      tree: 'A',
      command: 'bun run all',
      exit,
      log,
      end,
    });
    const steps: Step[] = [
      step(fanout, 1, '2026-10-14T01:00:00.000Z'),
      step(green, 0, '2026-10-14T02:00:00.000Z'),
      // The same failed script under another wrapper is the same name.
      step(wrapped, 1, '2026-10-14T03:00:00.000Z'),
      step(green, 0, '2026-10-14T04:00:00.000Z'),
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((item, index) => run(f, item, index)),
        )
      ).sort((a, b) => a.test.localeCompare(b.test)),
    ).toEqual([
      { name: 'test', test: '(script) t:custom', count: 2, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: '(script) test:a', count: 2, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: '(script) test:ab', count: 2, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: '(script) test:variant-parity', count: 2, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: 'bare title', count: 2, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: 'named > breaks', count: 2, last: '2026-10-14T04:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('an unnamed failure takes its stream script, an unnamed without one stays bare, and a title holding a pipe survives', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const log: string = resolve(dir, 'check-red.log');
    writeFileSync(
      log,
      [
        'framework:verify:rest-a      | test:emdash-kit     | (fail) (unnamed) [7668.89ms]',
        'framework:verify:rest-a      | test:emdash-kit     | (fail) (unnamed) [7201.11ms]',
        'framework:verify:rest-a      | test:emdash-kit     | Exited with code 1',
        'framework:verify:rest-a      | Exited with code 1',
        '(fail) (unnamed) [4.00ms]',
        '(fail) outer | (fail) inner [2.00ms]',
      ].join('\n') + '\n',
    );
    const green: string = resolve(dir, 'check-green.log');
    const steps: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((item, index) => run(f, item, index)),
        )
      ).sort((a, b) => a.test.localeCompare(b.test)),
    ).toEqual([
      { name: 'test', test: '(unnamed)', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: '(unnamed) test:emdash-kit', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'outer | (fail) inner', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('a recorded log outside the issues grammar reads as a plain file while a missing one is still gone', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const held: string = resolve(f.home, 'chart/direct/check-test-1.log');
    mkdirSync(resolve(f.home, 'chart/direct'), { recursive: true });
    writeFileSync(held, '(fail) alpha\n');
    const missing: string = resolve(f.home, 'chart/direct/check-test-2.log');
    const green: string = resolve(f.home, 'chart/direct/check-green.log');
    const steps: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log: held, end: '2026-10-14T01:00:00.000Z' },
      { tree: 'A', command: 'bun test', exit: 0, log: green, end: '2026-10-14T02:00:00.000Z' },
      { tree: 'B', command: 'bun test', exit: 1, log: missing, end: '2026-10-14T03:00:00.000Z' },
      { tree: 'B', command: 'bun test', exit: 0, log: green, end: '2026-10-14T04:00:00.000Z' },
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((item, index) => run(f, item, index)),
        )
      ).sort((a, b) => a.test.localeCompare(b.test)),
    ).toEqual([
      { name: 'test', test: '(log gone)', count: 1, last: '2026-10-14T04:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
    seedRun(f, run(f, steps[0], 10));
    seedRun(f, run(f, steps[1], 11));
    seedRun(f, run(f, steps[2], 12));
    seedRun(f, run(f, steps[3], 13));
    const result: Awaited<ReturnType<typeof cli>> = await cli(f, ['flaky']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('alpha');
    expect(result.stdout).toContain('(log gone)');
  } finally {
    f.clean();
  }
});

test('a reused green entry adds no flip, while a real later green still records one', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const dir: string = leaf(f, 'leaf', 'merge');
    const redLog: string = resolve(dir, 'check-red.log');
    writeFileSync(redLog, '(fail) alpha\n');
    const greenLog: string = resolve(dir, 'check-green.log');
    const steps: Step[] = [
      { tree: 'A', command: 'bun test', exit: 1, log: redLog, end: '2026-10-14T01:00:00.000Z' },
      // Reused receipt copies of the same green add no observation.
      {
        tree: 'A',
        command: 'bun test',
        exit: 0,
        log: greenLog,
        end: '2026-10-14T02:00:00.000Z',
        reused: 'earlier-green',
      },
      // A real green run of the command records the flip.
      { tree: 'A', command: 'bun test', exit: 0, log: greenLog, end: '2026-10-14T03:00:00.000Z' },
    ];
    expect(
      await flakyLines(
        repo,
        steps.map((step, index) => run(f, step, index)),
      ),
    ).toEqual([{ name: 'test', test: 'alpha', count: 1, last: '2026-10-14T03:00:00.000Z' }]);
  } finally {
    f.clean();
  }
});
