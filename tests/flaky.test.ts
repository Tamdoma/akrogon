import { test, expect } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { flakyLines } from '../src/flaky';
import { type VerifyRun } from '../src/verify';

type Step = { tree: string; command: string; exit: number; log: string; end?: string; setup?: number };

function run(step: Step, index: number): VerifyRun {
  return {
    run: `r${index}`,
    repo: 'demo',
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

test('flaky lists a command red then green on the same tree by failed test, and nothing else', () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'flaky-'));
  try {
    const redLog: string = resolve(dir, 'red.log');
    writeFileSync(
      redLog,
      'test:owner | (pass) fine [1.00ms]\ntest:owner | (fail) browser owner > dies with run [5012.00ms]\n',
    );
    const green: string = resolve(dir, 'green.log');
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
    expect(flakyLines(steps.map(run))).toEqual([
      { name: 'test', test: 'browser owner > dies with run', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
