import { expect, test } from 'bun:test';
import { spawn, type ChildProcess } from 'node:child_process';
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
  live?: boolean;
  staleSession?: boolean;
  agent_session?: { kind: 'id' | 'path'; value: string };
};
type ScriptEntry = { code?: string; message?: string; stderr?: string };
type Extra = { startScript?: ScriptEntry[] };
type RunResult = { code: number; stdout: string; stderr: string };
type SeatLine = { seat: string; pane: string; kind: string | null; state: string; session: string | 'none' };
type DbShape = { panes: { pane_id: string; agent: string | null }[] };
type Setup = {
  dir: string;
  root: string;
  sleepers: Map<string, ChildProcess>;
  calls: () => string[][];
  herdrCalled: () => boolean;
  dbJson: () => DbShape;
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

const consultants: PaneSeed[] = [
  { pane_id: paneA, agent: 'pi' },
  { pane_id: paneB, agent: 'codex', live: true, foreground: [{ pid: 0, argv: codexArgv }] },
  { pane_id: paneC, agent: 'pi', live: true, foreground: [{ pid: 0, argv: piArgv }] },
  { pane_id: paneX, agent: 'kimi', tab_id: 'w9:t9' },
];

// A live seat's agent is a real process leading its own group (pid 0 in a seed stands for it),
// so the script's SIGTERM to the group is observed and herdr drops the agent once it exits.
function setup(seeds: PaneSeed[], extra: Extra = {}): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-restart-')));
  const root: string = resolve(dir, 'root');
  const bin: string = resolve(dir, 'bin');
  const proc: string = resolve(dir, 'proc');
  mkdirSync(root);
  mkdirSync(bin);
  mkdirSync(proc);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const sleepers: Map<string, ChildProcess> = new Map(
    seeds
      .filter((p: PaneSeed): boolean => p.live === true)
      .map((p: PaneSeed): [string, ChildProcess] => [
        p.pane_id,
        spawn('sleep', ['60'], { detached: true, stdio: 'ignore' }),
      ]),
  );
  const seats: PaneSeed[] = seeds.map((p: PaneSeed): PaneSeed => {
    const pid: number | undefined = sleepers.get(p.pane_id)?.pid;
    return pid === undefined
      ? p
      : {
          ...p,
          leader: pid,
          foreground: p.foreground?.map((f: Fg): Fg => (f.pid === 0 ? { ...f, pid } : f)),
        };
  });
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: seats.map((p: PaneSeed): object => ({
        pane_id: p.pane_id,
        tab_id: p.tab_id ?? 'w8:t1',
        cwd: root,
        agent: p.agent,
        agent_status: p.agent === null ? 'unknown' : 'idle',
        ...(p.agent_name === undefined ? {} : { agent_name: p.agent_name }),
        ...(p.staleSession === undefined ? {} : { staleSession: p.staleSession }),
        ...(p.agent_session === undefined ? {} : { agent_session: p.agent_session }),
        ...(p.leader === undefined ? {} : { foreground_process_group_id: p.leader }),
        ...(p.live === true && p.leader !== undefined ? { agent_pid: p.leader } : {}),
        ...(p.foreground === undefined ? {} : { foreground_processes: p.foreground }),
      })),
      tabs: [],
      serial: 100,
      ...(extra.startScript === undefined ? {} : { startScript: extra.startScript }),
    }),
  );
  return {
    dir,
    root,
    sleepers,
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
    clean: (): void => {
      for (const sleeper of sleepers.values()) sleeper.kill('SIGKILL');
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

function alive(s: Setup, pane: string): boolean {
  const sleeper: ChildProcess = s.sleepers.get(pane)!;
  return sleeper.exitCode === null && sleeper.signalCode === null;
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

// Criterion 1: each seat is stopped and started again in its own pane, in naming order, with the
// same kind and argv (an argv element containing a space stays one argument); no pane is closed,
// split or moved, the unrelated agent is left alone and each seat prints one `restarted` line.
test('restarts supplied consultants in place with identical kind and argv', async (): Promise<void> => {
  const s: Setup = setup(consultants);
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(0);
    const lines: SeatLine[] = seatLines(result.stdout);
    expect(
      lines.map((line: SeatLine): Omit<SeatLine, 'session'> => ({
        seat: line.seat,
        pane: line.pane,
        kind: line.kind,
        state: line.state,
      })),
    ).toEqual([
      { seat: 'B', pane: paneB, kind: 'codex', state: 'restarted' },
      { seat: 'C', pane: paneC, kind: 'pi', state: 'restarted' },
    ]);
    expect(lines.every((line: SeatLine): boolean => /^session-\d+$/.test(line.session))).toBe(true);
    expect(s.sleepers.get(paneB)!.signalCode).toBe('SIGTERM');
    expect(s.sleepers.get(paneC)!.signalCode).toBe('SIGTERM');
    const calls: string[][] = s.calls();
    expect(calls.filter((args: string[]): boolean => ['close', 'split', 'move', 'swap'].includes(args[1]))).toEqual([]);
    expect(command(calls, 'agent', 'start')).toEqual([
      ['agent', 'start', 'peer-w8-pa-b', '--kind', 'codex', '--pane', paneB, '--', ...codexArgv.slice(1)],
      ['agent', 'start', 'peer-w8-pa-c', '--kind', 'pi', '--pane', paneC, '--', ...piArgv.slice(1)],
    ]);
    const panes: DbShape['panes'] = s.dbJson().panes;
    expect(panes.find((p) => p.pane_id === paneB)?.agent).toBe('codex');
    expect(panes.find((p) => p.pane_id === paneC)?.agent).toBe('pi');
    expect(panes.find((p) => p.pane_id === paneX)?.agent).toBe('kimi');
    expect(calls.filter((args: string[]): boolean => args.includes(paneX))).toEqual([]);
  } finally {
    s.clean();
  }
});

// Criterion 1, second case: a single surviving seat keeps its letter and its pane; B is untouched.
test('a single surviving consultant keeps its letter and pane', async (): Promise<void> => {
  const s: Setup = setup(consultants);
  try {
    const result: RunResult = await s.run(paneA, 'C', paneC);
    expect(result.code).toBe(0);
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'C', pane: paneC, kind: 'pi', state: 'restarted', session: expect.stringMatching(/^session-\d+$/) },
    ]);
    expect(command(s.calls(), 'agent', 'start')).toEqual([
      ['agent', 'start', 'peer-w8-pa-c', '--kind', 'pi', '--pane', paneC, '--', ...piArgv.slice(1)],
    ]);
    expect(alive(s, paneB)).toBe(true);
  } finally {
    s.clean();
  }
});

// Criterion 2: a pane whose launch is not one unique foreground process-group leader is refused
// before anything is stopped, naming the seat and reason.
test('refuses a seat without one unique foreground leader', async (): Promise<void> => {
  for (const foreground of [
    [],
    [
      { pid: 0, argv: codexArgv },
      { pid: 0, argv: codexArgv },
    ],
  ]) {
    const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
      p.pane_id === paneB ? { ...p, foreground } : p,
    );
    const s: Setup = setup(seats);
    try {
      const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('B');
      expect(result.stderr).toContain('unique foreground leader');
      expect(seatLines(result.stdout)).toEqual([
        { seat: 'B', pane: paneB, kind: 'codex', state: 'untouched', session: 'none' },
        { seat: 'C', pane: paneC, kind: 'pi', state: 'untouched', session: 'none' },
      ]);
      expect(s.calls().some((args: string[]): boolean => args[1] === 'process-info')).toBe(true);
      expect(alive(s, paneB) && alive(s, paneC)).toBe(true);
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
    const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
      p.pane_id === paneB ? { ...p, agent, foreground: [{ pid: 0, argv }] } : p,
    );
    const s: Setup = setup(seats);
    try {
      const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('B');
      expect(result.stderr).toContain(token);
      expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.state === 'untouched')).toBe(true);
      expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.session === 'none')).toBe(true);
      expect(alive(s, paneB) && alive(s, paneC)).toBe(true);
    } finally {
      s.clean();
    }
  }
});

// Criterion 2: a seat whose derived agent name is held by a pane outside the restart is refused.
test('refuses when the derived agent name is held outside the restart', async (): Promise<void> => {
  const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
    p.pane_id === paneX ? { ...p, agent_name: 'peer-w8-pa-b' } : p,
  );
  const s: Setup = setup(seats);
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('B');
    expect(result.stderr).toContain('peer-w8-pa-b');
    expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.state === 'untouched')).toBe(true);
    expect(seatLines(result.stdout).every((line: SeatLine): boolean => line.session === 'none')).toBe(true);
    expect(alive(s, paneB) && alive(s, paneC)).toBe(true);
  } finally {
    s.clean();
  }
});

// Criterion 3: a failed stop (herdr still lists the agent but its leader is already gone) stops
// all later steps; stderr carries the failed kill and every seat reports `untouched`.
test('a failed stop ends the restart before any start', async (): Promise<void> => {
  const gone: number = Number(Bun.spawnSync(['sh', '-c', 'echo $$']).stdout.toString().trim());
  const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
    p.pane_id === paneB ? { ...p, live: false, leader: gone, foreground: [{ pid: gone, argv: codexArgv }] } : p,
  );
  const s: Setup = setup(seats);
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`kill -TERM -- -${gone}`);
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', pane: paneB, kind: 'codex', state: 'untouched', session: 'none' },
      { seat: 'C', pane: paneC, kind: 'pi', state: 'untouched', session: 'none' },
    ]);
    expect(command(s.calls(), 'agent', 'start')).toEqual([]);
    expect(alive(s, paneC)).toBe(true);
  } finally {
    s.clean();
  }
});

// Criterion 3: a failed start leaves that seat `stopped`, prints the failed command and herdr's
// error, and never stops a later seat.
test('a failed agent start reports the stopped seat and herdr error', async (): Promise<void> => {
  const s: Setup = setup(consultants, { startScript: [{ code: 'agent_blocked' }] });
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('herdr agent start peer-w8-pa-b');
    expect(result.stderr).toContain('agent_blocked');
    expect(seatLines(result.stdout)).toEqual([
      { seat: 'B', pane: paneB, kind: 'codex', state: 'stopped', session: 'none' },
      { seat: 'C', pane: paneC, kind: 'pi', state: 'untouched', session: 'none' },
    ]);
    expect(command(s.calls(), 'agent', 'start').length).toBe(1);
    expect(s.dbJson().panes.find((p) => p.pane_id === paneB)?.agent).toBe(null);
    expect(alive(s, paneC)).toBe(true);
  } finally {
    s.clean();
  }
});

// lean-exchange criterion: a restarted seat's line carries the session `herdr agent list` shows
// after the start, or `none` when it shows none or the pre-restart session.
test('a restart leaving the pre-restart session prints none', async (): Promise<void> => {
  const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
    p.pane_id === paneB ? { ...p, staleSession: true, agent_session: { kind: 'id', value: 'sess-before' } } : p,
  );
  const s: Setup = setup(seats);
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(0);
    const lines: SeatLine[] = seatLines(result.stdout);
    expect(lines[0]).toEqual({ seat: 'B', pane: paneB, kind: 'codex', state: 'restarted', session: 'none' });
    expect(lines[1].session).not.toBe('none');
  } finally {
    s.clean();
  }
});

test('a restart with no session shown prints none', async (): Promise<void> => {
  const seats: PaneSeed[] = consultants.map((p: PaneSeed): PaneSeed =>
    p.pane_id === paneB ? { ...p, staleSession: true } : p,
  );
  const s: Setup = setup(seats);
  try {
    const result: RunResult = await s.run(paneA, 'B', paneB, 'C', paneC);
    expect(result.code).toBe(0);
    expect(seatLines(result.stdout)[0]).toEqual({
      seat: 'B',
      pane: paneB,
      kind: 'codex',
      state: 'restarted',
      session: 'none',
    });
  } finally {
    s.clean();
  }
});
