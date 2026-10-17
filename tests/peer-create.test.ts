import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
type Setup = { root: string; calls: () => string[][]; run: (json: string) => Promise<RunResult>; clean: () => void };

function setup(extra: { startScript?: ScriptEntry[]; failSplitOnce?: boolean } = {}): Setup {
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
      panes: [{ pane_id: paneA, tab_id: 'w8:t1', cwd: root, agent: 'claude', agent_status: 'working' }],
      tabs: [],
      serial: 100,
      ...extra,
    }),
  );
  return {
    root,
    calls: (): string[][] =>
      readFileSync(`${db}.calls`, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line) as string[]),
    run: async (json: string): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, root, paneA, json], {
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db, AKROGON_PROC_ROOT: proc },
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
