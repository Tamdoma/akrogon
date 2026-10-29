import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-create.ts');
const paneA: string = 'w8:pA';
const spec: { seat: string; kind: string; argv: string[] }[] = [
  { seat: 'B', kind: 'codex', argv: ['-c', 'model_reasoning_effort=high'] },
  { seat: 'C', kind: 'pi', argv: ['--append-system-prompt', 'probe words'] },
  { seat: 'D', kind: 'claude', argv: [] },
];

type ScriptEntry = { code?: string };
type RunResult = { code: number; stdout: string; stderr: string };
type SeatLine = { seat: string; pane: string | null; kind: string; state: string };
type Setup = {
  dir: string;
  root: string;
  db: string;
  calls: () => string[][];
  run: (json: string) => Promise<RunResult>;
  runWith: (env: Record<string, string>, aPane: string, json: string) => Promise<RunResult>;
  clean: () => void;
};

function setup(
  extra: {
    startScript?: ScriptEntry[];
    failSplitOnce?: boolean;
    callerShellPid?: number;
    dbExtra?: Record<string, unknown>;
  } = {},
): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-create-')));
  const root: string = resolve(dir, 'root');
  const bin: string = resolve(dir, 'bin');
  const proc: string = resolve(dir, 'proc');
  mkdirSync(root);
  mkdirSync(bin);
  mkdirSync(proc);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: [
        {
          pane_id: paneA,
          tab_id: 'w8:t1',
          cwd: root,
          agent: 'claude',
          agent_status: 'working',
          shell_pid: extra.callerShellPid ?? process.pid,
        },
      ],
      tabs: [],
      serial: 100,
      ...(extra.startScript === undefined ? {} : { startScript: extra.startScript }),
      ...(extra.failSplitOnce === undefined ? {} : { failSplitOnce: extra.failSplitOnce }),
      ...(extra.dbExtra === undefined ? {} : extra.dbExtra),
    }),
  );
  const env = (extraEnv: Record<string, string>): NodeJS.ProcessEnv => ({
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    FAKE_HERDR: db,
    AKROGON_PROC_ROOT: proc,
    HERDR_PANE_ID: paneA,
    ...extraEnv,
  });
  return {
    dir,
    root,
    db,
    calls: (): string[][] =>
      existsSync(`${db}.calls`)
        ? readFileSync(`${db}.calls`, 'utf8')
            .trim()
            .split('\n')
            .map((line: string) => JSON.parse(line) as string[])
        : [],
    run: async (json: string): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, root, paneA, json], {
        env: env({}),
      });
      return { code, stdout, stderr };
    },
    runWith: async (extraEnv: Record<string, string>, aPane: string, json: string): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, root, aPane, json], {
        env: env(extraEnv),
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function seatLines(stdout: string): SeatLine[] {
  return stdout
    .trim()
    .split('\n')
    .map((line: string) => JSON.parse(line) as SeatLine);
}

function command(calls: string[][], noun: string, verb: string): string[][] {
  return calls.filter((args: string[]): boolean => args[0] === noun && args[1] === verb);
}

// The column: B right of A keeping A 65% wide, each later seat split from the previous one keeping
// 1/k of its height so the stack comes out equal, each started with its kind and argv as an array.
test('creates the consultant column right of A with equal heights', async (): Promise<void> => {
  const s: Setup = setup();
  try {
    const result: RunResult = await s.run(JSON.stringify(spec));
    expect(result.code).toBe(0);
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', pane: 'w1:p101', kind: 'codex', state: 'started' },
      { seat: 'C', pane: 'w1:p103', kind: 'pi', state: 'started' },
      { seat: 'D', pane: 'w1:p105', kind: 'claude', state: 'started' },
    ]);
    const calls: string[][] = s.calls();
    const flags = (source: string, direction: string, ratio: string): string[] => [
      'pane',
      'split',
      source,
      '--direction',
      direction,
      '--ratio',
      ratio,
      '--cwd',
      s.root,
      '--no-focus',
    ];
    expect(command(calls, 'pane', 'split')).toEqual([
      flags(paneA, 'right', '0.65'),
      flags('w1:p101', 'down', '0.3333'),
      flags('w1:p103', 'down', '0.5000'),
    ]);
    expect(command(calls, 'agent', 'start')).toEqual([
      ['agent', 'start', 'peer-w8-pa-b', '--kind', 'codex', '--pane', 'w1:p101', '--', ...spec[0].argv],
      ['agent', 'start', 'peer-w8-pa-c', '--kind', 'pi', '--pane', 'w1:p103', '--', ...spec[1].argv],
      ['agent', 'start', 'peer-w8-pa-d', '--kind', 'claude', '--pane', 'w1:p105', '--'],
    ]);
  } finally {
    s.clean();
  }
});

// A failed split stops every later step and names herdr's failed command.
test('a failed split stops before any start', async (): Promise<void> => {
  const s: Setup = setup({ failSplitOnce: true });
  try {
    const result: RunResult = await s.run(JSON.stringify(spec.slice(0, 2)));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`herdr pane split ${paneA}`);
    expect(seatLines(result.stdout).map((line: SeatLine): string => line.state)).toEqual(['untouched', 'untouched']);
    expect(command(s.calls(), 'agent', 'start')).toEqual([]);
  } finally {
    s.clean();
  }
});

// A failed start leaves that seat `split` with its pane printed and never creates a later seat.
test('a failed start reports the split seat and stops', async (): Promise<void> => {
  const s: Setup = setup({ startScript: [{ code: 'agent_blocked' }] });
  try {
    const result: RunResult = await s.run(JSON.stringify(spec.slice(0, 2)));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('agent_blocked');
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', pane: 'w1:p101', kind: 'codex', state: 'split' },
      { seat: 'C', pane: null, kind: 'pi', state: 'untouched' },
    ]);
    expect(command(s.calls(), 'pane', 'split').length).toBe(1);
  } finally {
    s.clean();
  }
});

// peer-pane-anchor criterion 1: a HERDR_PANE_ID herdr does not have, or whose shell is not an
// ancestor, refuses before any split or start, naming the envs and herdr's answer.
test('refuses when HERDR_PANE_ID names a pane herdr does not have', async (): Promise<void> => {
  const s: Setup = setup();
  try {
    const result: RunResult = await s.runWith({ HERDR_PANE_ID: 'w8:pZ' }, 'w8:pZ', JSON.stringify(spec));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('w8:pZ');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(result.stderr).toContain('Missing pane');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', 'w8:pZ']]);
  } finally {
    s.clean();
  }
});

test('refuses when the pane shell is not an ancestor of the script', async (): Promise<void> => {
  const s: Setup = setup({ callerShellPid: 999999999 });
  try {
    const result: RunResult = await s.run(JSON.stringify(spec));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(paneA);
    expect(result.stderr).toContain('999999999');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', paneA]]);
  } finally {
    s.clean();
  }
});

// peer-pane-anchor criterion 2: the A-pane argument must equal the verified pane or nothing runs.
test('refuses when the A-pane argument differs from the verified pane', async (): Promise<void> => {
  const s: Setup = setup();
  try {
    const result: RunResult = await s.runWith({}, 'w8:pZ', JSON.stringify(spec));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(paneA);
    expect(result.stderr).toContain('w8:pZ');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', paneA]]);
    expect(command(s.calls(), 'pane', 'split')).toEqual([]);
  } finally {
    s.clean();
  }
});

test('refuses when HERDR_PANE_ID is unset or empty, before any herdr call', async (): Promise<void> => {
  const s: Setup = setup();
  try {
    const result: RunResult = await s.runWith({ HERDR_PANE_ID: '' }, paneA, JSON.stringify(spec));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('HERDR_PANE_ID');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(s.calls()).toEqual([]);
  } finally {
    s.clean();
  }
});
