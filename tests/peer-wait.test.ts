import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-wait.ts');
const pane: string = 'w8:pX';

type RunResult = { code: number; stdout: string; stderr: string };
type WaitEntry = { status?: string; stderr?: string; append?: string; sleepMs?: number };
type Setup = {
  file: string;
  calls: () => string[][];
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

function setup(agentStatus: string, waitScript: (file: string) => WaitEntry[] = () => []): Setup {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'peer-wait-'));
  const file: string = resolve(dir, 'return.md');
  const bin: string = resolve(dir, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: [{ pane_id: pane, tab_id: 'w8:t1', cwd: '/tmp', agent: 'fake', agent_status: agentStatus }],
      tabs: [],
      serial: 0,
      waitScript: waitScript(file),
    }),
  );
  return {
    file,
    calls: (): string[][] =>
      readFileSync(`${db}.calls`, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line) as string[]),
    run: async (...args: string[]): Promise<RunResult> => {
      const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, script, ...args], {
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db },
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const [stdout, stderr, code]: [string, string, number] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function expectOutcome(
  result: RunResult,
  expected: { outcome: string; pane: string; file: string; status: string | null },
): void {
  expect(result.code).toBe(0);
  expect(result.stdout.split('\n')).toHaveLength(2);
  expect(result.stdout.endsWith('\n')).toBe(true);
  expect(JSON.parse(result.stdout)).toEqual(expected);
}

test('passes a non-timeout herdr failure through unchanged', async (): Promise<void> => {
  const s: Setup = setup('working', () => [{ stderr: 'raw failure text' }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expect(result).toEqual({ code: 1, stdout: '', stderr: 'raw failure text\n' });
  } finally {
    s.clean();
  }
});

test('blocked wins over a non-empty return file', async (): Promise<void> => {
  const s: Setup = setup('blocked');
  try {
    writeFileSync(s.file, 'peer reply\n');
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, { outcome: 'blocked', pane, file: s.file, status: 'blocked' });
  } finally {
    s.clean();
  }
});

test('done when the return file is written during a timed-out wait', async (): Promise<void> => {
  const s: Setup = setup('working', (file: string): WaitEntry[] => [{ append: file }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, { outcome: 'done', pane, file: s.file, status: null });
  } finally {
    s.clean();
  }
});

test('done while herdr still reports working', async (): Promise<void> => {
  const s: Setup = setup('working', (file: string): WaitEntry[] => [{ status: 'working', append: file }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, { outcome: 'done', pane, file: s.file, status: 'working' });
  } finally {
    s.clean();
  }
});

test('failure on idle with the return file missing', async (): Promise<void> => {
  const s: Setup = setup('idle');
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, { outcome: 'failure', pane, file: s.file, status: 'idle' });
  } finally {
    s.clean();
  }
});

test('failure on done with a 0-byte return file', async (): Promise<void> => {
  const s: Setup = setup('done');
  try {
    writeFileSync(s.file, '');
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, { outcome: 'failure', pane, file: s.file, status: 'done' });
  } finally {
    s.clean();
  }
});

test('budget clamps each wait timeout to the remaining budget', async (): Promise<void> => {
  const s: Setup = setup('working');
  try {
    const budgetMs: number = 500;
    const start: number = performance.now();
    const result: RunResult = await s.run(pane, s.file, String(budgetMs / 1000));
    const elapsed: number = performance.now() - start;
    expectOutcome(result, { outcome: 'budget', pane, file: s.file, status: null });
    expect(elapsed).toBeGreaterThanOrEqual(budgetMs);
    const timeouts: number[] = s
      .calls()
      .filter((args: string[]): boolean => args[0] === 'agent' && args[1] === 'wait')
      .map((args: string[]): number => Number(args[args.indexOf('--timeout') + 1]));
    expect(timeouts.length).toBeGreaterThan(0);
    let spent: number = 0;
    for (const t of timeouts) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThanOrEqual(10000);
      expect(t).toBeLessThanOrEqual(Math.max(0, budgetMs - spent));
      spent += t;
    }
  } finally {
    s.clean();
  }
});

test('budget keeps the last status herdr returned', async (): Promise<void> => {
  const s: Setup = setup('working', (): WaitEntry[] => [{ status: 'working' }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '0.3');
    expectOutcome(result, { outcome: 'budget', pane, file: s.file, status: 'working' });
  } finally {
    s.clean();
  }
});

test('rejects missing args and a non-numeric budget', async (): Promise<void> => {
  const s: Setup = setup('working');
  try {
    for (const args of [
      [pane, s.file],
      [pane, s.file, 'abc'],
    ]) {
      const result: RunResult = await s.run(...args);
      expect(result.code).toBe(1);
      expect(result.stderr).not.toBe('');
      expect(result.stdout).toBe('');
    }
  } finally {
    s.clean();
  }
});
