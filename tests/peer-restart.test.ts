import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-restart.ts');
const paneA: string = 'w8:pA';
const paneB: string = 'w8:pB';
const paneC: string = 'w8:pC';
const paneX: string = 'w9:pX';
const codexArgv: string[] = [
  'codex',
  '-m',
  'gpt-6.1-sol',
  '-c',
  'model_reasoning_effort=high',
  '-a',
  'never',
  '-s',
  'danger-full-access',
];
const piArgv: string[] = [
  'pi',
  '--model',
  'devin/swe-2-max',
  '--thinking',
  'high',
  '-a',
  '--exclude-tools',
  'request_user_input',
  '--append-system-prompt',
  'probe words',
];

type Fg = { pid: number; argv: string[]; name?: string };
type PaneSeed = {
  pane_id: string;
  agent: string | null;
  tab_id?: string;
  agent_name?: string;
  leader?: number;
  foreground?: Fg[];
};
type ScriptEntry = { code?: string; message?: string; stderr?: string };
type Extra = { closeScript?: ScriptEntry[]; startScript?: ScriptEntry[]; failSplitOnce?: boolean };
type RunResult = { code: number; stdout: string; stderr: string };
type SeatLine = { seat: string; old: string; new: string | null; kind: string | null; state: string };
type DbShape = { panes: { pane_id: string; agent: string | null }[] };
type Setup = {
  dir: string;
  root: string;
  calls: () => string[][];
  herdrCalled: () => boolean;
  dbJson: () => DbShape;
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

const consultants: PaneSeed[] = [
  { pane_id: paneA, agent: 'pi' },
  { pane_id: paneB, agent: 'codex', leader: 8001, foreground: [{ pid: 8001, argv: codexArgv }] },
  { pane_id: paneC, agent: 'pi', leader: 8002, foreground: [{ pid: 8002, argv: piArgv }] },
  { pane_id: paneX, agent: 'kimi', tab_id: 'w9:t9' },
];

function setup(seats: PaneSeed[], extra: Extra = {}): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-restart-')));
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
      panes: seats.map(
        (p: PaneSeed): object => ({
          pane_id: p.pane_id,
          tab_id: p.tab_id ?? 'w8:t1',
          cwd: root,
          agent: p.agent,
          agent_status: p.agent === null ? 'unknown' : 'idle',
          ...(p.agent_name === undefined ? {} : { agent_name: p.agent_name }),
          ...(p.leader === undefined ? {} : { foreground_process_group_id: p.leader }),
          ...(p.foreground === undefined ? {} : { foreground_processes: p.foreground }),
        }),
      ),
      tabs: [],
      serial: 100,
      ...(extra.closeScript === undefined ? {} : { closeScript: extra.closeScript }),
      ...(extra.startScript === undefined ? {} : { startScript: extra.startScript }),
      ...(extra.failSplitOnce === undefined ? {} : { failSplitOnce: extra.failSplitOnce }),
    }),
  );
  return {
    dir,
    root,
    calls: (): string[][] =>
      readFileSync(`${db}.calls`, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line) as string[]),
    herdrCalled: (): boolean => existsSync(`${db}.calls`),
    dbJson: (): DbShape => JSON.parse(readFileSync(db, 'utf8')) as DbShape,
    run: async (...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
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

// Criterion 1: close in reverse naming order, recreate B right of A then C below B, restart with
// the same kind and argv (an argv element containing a space stays one argument), leave the
// unrelated agent alone and print one `restarted` line per seat.
test('restarts supplied consultants with identical kind and argv', async (): Promise<void> => {
  const s: Setup = setup(consultants);
  try {
    const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(0);
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', old: paneB, new: 'w1:p101', kind: 'codex', state: 'restarted' },
      { seat: 'C', old: paneC, new: 'w1:p102', kind: 'pi', state: 'restarted' },
    ]);
    const calls: string[][] = s.calls();
    expect(calls[0].slice(0, 2)).toEqual(['agent', 'list']);
    const firstClose: number = calls.findIndex((args: string[]): boolean => args[1] === 'close');
    expect(calls.slice(0, firstClose).filter((args: string[]): boolean => args[1] === 'process-info').length).toBe(2);
    expect(command(calls, 'pane', 'close').map((args: string[]): string => args[2])).toEqual([paneC, paneB]);
    const splits: string[][] = command(calls, 'pane', 'split');
    expect(splits).toEqual([
      ['pane', 'split', paneA, '--direction', 'right', '--ratio', '0.65', '--cwd', s.root, '--no-focus'],
      ['pane', 'split', 'w1:p101', '--direction', 'down', '--ratio', '0.5', '--cwd', s.root, '--no-focus'],
    ]);
    expect(command(calls, 'agent', 'start')).toEqual([
      ['agent', 'start', 'peer-w8-pa-b', '--kind', 'codex', '--pane', 'w1:p101', '--', ...codexArgv.slice(1)],
      ['agent', 'start', 'peer-w8-pa-c', '--kind', 'pi', '--pane', 'w1:p102', '--', ...piArgv.slice(1)],
    ]);
    const panes: DbShape['panes'] = s.dbJson().panes;
    expect(panes.some((p) => p.pane_id === paneB)).toBe(false);
    expect(panes.find((p) => p.pane_id === 'w1:p101')?.agent).toBe('codex');
    expect(panes.find((p) => p.pane_id === 'w1:p102')?.agent).toBe('pi');
    expect(panes.find((p) => p.pane_id === paneX)?.agent).toBe('kimi');
    expect(calls.filter((args: string[]): boolean => args.includes(paneX))).toEqual([]);
  } finally {
    s.clean();
  }
});

// Criterion 1, second case: a single surviving seat keeps its letter and is created right of A.
test('a single surviving consultant keeps its letter and splits right of A', async (): Promise<void> => {
  const s: Setup = setup(consultants);
  try {
    const result: RunResult = await s.run(s.root, paneA, 'C', paneC);
    expect(result.code).toBe(0);
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'C', old: paneC, new: 'w1:p101', kind: 'pi', state: 'restarted' },
    ]);
    const calls: string[][] = s.calls();
    expect(command(calls, 'pane', 'close').map((args: string[]): string => args[2])).toEqual([paneC]);
    expect(command(calls, 'pane', 'split')).toEqual([
      ['pane', 'split', paneA, '--direction', 'right', '--ratio', '0.65', '--cwd', s.root, '--no-focus'],
    ]);
    expect(command(calls, 'agent', 'start')).toEqual([
      ['agent', 'start', 'peer-w8-pa-c', '--kind', 'pi', '--pane', 'w1:p101', '--', ...piArgv.slice(1)],
    ]);
    expect(s.dbJson().panes.find((p) => p.pane_id === paneB)?.agent).toBe('codex');
  } finally {
    s.clean();
  }
});

// Criterion 2: a pane whose launch is not one unique foreground process-group leader is refused
// before anything is closed, naming the seat and reason.
test('refuses a seat without one unique foreground leader', async (): Promise<void> => {
  for (const foreground of [
    [],
    [
      { pid: 8001, argv: codexArgv },
      { pid: 8001, argv: codexArgv },
    ],
  ]) {
    const seats: PaneSeed[] = consultants.map(
      (p: PaneSeed): PaneSeed => (p.pane_id === paneB ? { ...p, foreground } : p),
    );
    const s: Setup = setup(seats);
    try {
      const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('B');
      expect(result.stderr).toContain('unique foreground leader');
      expect(seatLines(result.stdout)).toEqual([
        { seat: 'B', old: paneB, new: null, kind: 'codex', state: 'untouched' },
        { seat: 'C', old: paneC, new: null, kind: 'pi', state: 'untouched' },
      ]);
      const calls: string[][] = s.calls();
      expect(calls.some((args: string[]): boolean => args[1] === 'process-info')).toBe(true);
      expect(command(calls, 'pane', 'close')).toEqual([]);
    } finally {
      s.clean();
    }
  }
});

// Criterion 2: argv that restores or forks history is refused per kind; codex -c is a normal
// config flag (the happy path proves it passes through).
test('refuses argv that restores or forks history', async (): Promise<void> => {
  const variants: { agent: string; argv: string[]; token: string }[] = [
    { agent: 'codex', argv: ['codex', 'resume', 'abc'], token: 'resume' },
    { agent: 'codex', argv: ['codex', 'fork'], token: 'fork' },
    { agent: 'pi', argv: ['pi', '--session', 'x'], token: '--session' },
    { agent: 'pi', argv: ['pi', '-c', 'y'], token: '-c' },
    { agent: 'claude', argv: ['claude', '--session-id', 'z'], token: '--session-id' },
  ];
  for (const { agent, argv, token } of variants) {
    const seats: PaneSeed[] = consultants.map(
      (p: PaneSeed): PaneSeed => (p.pane_id === paneB ? { ...p, agent, foreground: [{ pid: 8001, argv }] } : p),
    );
    const s: Setup = setup(seats);
    try {
      const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('B');
      expect(result.stderr).toContain(token);
      expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.state === 'untouched')).toBe(true);
      expect(command(s.calls(), 'pane', 'close')).toEqual([]);
    } finally {
      s.clean();
    }
  }
});

// Criterion 2: a seat whose derived agent name is held by a pane outside the restart is refused.
test('refuses when the derived agent name is held outside the restart', async (): Promise<void> => {
  const seats: PaneSeed[] = consultants.map(
    (p: PaneSeed): PaneSeed => (p.pane_id === paneX ? { ...p, agent_name: 'peer-w8-pa-b' } : p),
  );
  const s: Setup = setup(seats);
  try {
    const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('B');
    expect(result.stderr).toContain('peer-w8-pa-b');
    expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.state === 'untouched')).toBe(true);
    expect(command(s.calls(), 'pane', 'close')).toEqual([]);
  } finally {
    s.clean();
  }
});

// Criterion 3: a failed close stops all later steps; the seat that was already closed reports
// `closed`, the seat whose close failed reports `untouched`, and stderr carries the failed
// command with herdr's error.
test('a failed close stops the restart mid-phase', async (): Promise<void> => {
  const s: Setup = setup(consultants, { closeScript: [{}, { stderr: 'close exploded\n' }] });
  try {
    const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`herdr pane close ${paneB}`);
    expect(result.stderr).toContain('close exploded');
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', old: paneB, new: null, kind: 'codex', state: 'untouched' },
      { seat: 'C', old: paneC, new: null, kind: 'pi', state: 'closed' },
    ]);
    const calls: string[][] = s.calls();
    expect(command(calls, 'pane', 'split')).toEqual([]);
    expect(command(calls, 'agent', 'start')).toEqual([]);
  } finally {
    s.clean();
  }
});

// Criterion 3: a failed split leaves both seats `closed` and never reaches start.
test('a failed split leaves closed seats and stops', async (): Promise<void> => {
  const s: Setup = setup(consultants, { failSplitOnce: true });
  try {
    const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`herdr pane split ${paneA}`);
    expect(result.stderr).toContain('fixture_split_failed');
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', old: paneB, new: null, kind: 'codex', state: 'closed' },
      { seat: 'C', old: paneC, new: null, kind: 'pi', state: 'closed' },
    ]);
    const calls: string[][] = s.calls();
    expect(command(calls, 'pane', 'split').length).toBe(1);
    expect(command(calls, 'agent', 'start')).toEqual([]);
  } finally {
    s.clean();
  }
});

// Criterion 3: a failed start after both splits leaves closed seats, prints the failed command
// and herdr's error, and no agent is running on the new pane.
test('a failed agent start reports closed seats and herdr error', async (): Promise<void> => {
  const s: Setup = setup(consultants, { startScript: [{ code: 'agent_blocked' }] });
  try {
    const result: RunResult = await s.run(s.root, paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('herdr agent start peer-w8-pa-b');
    expect(result.stderr).toContain('agent_blocked');
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', old: paneB, new: null, kind: 'codex', state: 'closed' },
      { seat: 'C', old: paneC, new: null, kind: 'pi', state: 'closed' },
    ]);
    const calls: string[][] = s.calls();
    expect(command(calls, 'pane', 'split').length).toBe(2);
    expect(command(calls, 'agent', 'start').length).toBe(1);
    expect(s.dbJson().panes.find((p) => p.pane_id === 'w1:p101')?.agent).toBe(null);
  } finally {
    s.clean();
  }
});
