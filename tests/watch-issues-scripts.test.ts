import { expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { run, type Result } from '../src/shell';

test('watch-issues scripts test and typecheck pass', async (): Promise<void> => {
  const cwd: string = resolve(import.meta.dir, '..', 'skills/watch-issues');
  const commands: string[][] = [
    [process.execPath, 'test', 'scripts'],
    [process.execPath, 'run', 'typecheck'],
  ];
  const results: Result[] = [];
  for (const argv of commands) {
    results.push(await run(argv, cwd));
  }
  const detail: string = JSON.stringify(
    commands.map((argv: string[], i: number): object => ({ command: argv, cwd, ...results[i] })),
  );
  expect(results.map((r: Result): number => r.code), detail).toEqual([0, 0]);
});
