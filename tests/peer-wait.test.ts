import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-wait.ts');
const pane: string = 'w8:pX';
const paneA: string = 'w8:pA';

type RunResult = { code: number; stdout: string; stderr: string };
type WaitEntry = {
  status?: string;
  stderr?: string;
  code?: string;
  append?: string;
  appendTo?: string;
  sleepMs?: number;
  session?: string | null;
  kind?: string;
  dropAgent?: boolean;
  screenSkipped?: boolean | null;
};
type FakeSession = { kind: 'id' | 'path'; value: string; source?: string; agent?: string };
type PaneSeed = {
  agent: string;
  agent_status: string;
  agent_session?: FakeSession | null;
  screen_detection_skipped?: boolean | null;
  shell_pid?: number;
};
type Exchange = { kind: string; session: string | null; boundary: number | null; turn: string | null };
type Setup = {
  dir: string;
  home: string;
  db: string;
  file: string;
  calls: () => string[][];
  run: (...args: string[]) => Promise<RunResult>;
  runWith: (env: Record<string, string>, ...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

const seed = (kind: string, session: string | null = null): Exchange => ({
  kind,
  session,
  boundary: null,
  turn: null,
});

function setup(
  panes: PaneSeed[],
  waitScript: (file: string, home: string) => WaitEntry[] = (): WaitEntry[] => [],
  dbExtra: Record<string, unknown> = {},
): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-wait-')));
  const home: string = resolve(dir, 'home');
  mkdirSync(home);
  mkdirSync(resolve(dir, 'proc'));
  const file: string = resolve(dir, 'return.md');
  const bin: string = resolve(dir, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: [
        ...panes.map((p: PaneSeed, i: number) => ({
          pane_id: i === 0 ? pane : `w8:p${i}`,
          tab_id: 'w8:t1',
          cwd: '/tmp',
          agent: p.agent,
          agent_status: p.agent_status,
          ...(p.agent_session === undefined || p.agent_session === null ? {} : { agent_session: p.agent_session }),
          ...(p.screen_detection_skipped === undefined
            ? {}
            : { screen_detection_skipped: p.screen_detection_skipped }),
          ...(p.shell_pid === undefined ? {} : { shell_pid: p.shell_pid }),
        })),
        // The caller pane the script anchors to: its shell is the test process.
        { pane_id: paneA, tab_id: 'w8:t1', cwd: '/tmp', agent: null, agent_status: 'unknown', shell_pid: process.pid },
      ],
      tabs: [],
      serial: 0,
      waitScript: waitScript(file, home),
      ...dbExtra,
    }),
  );
  return {
    dir,
    home,
    db,
    file,
    calls: (): string[][] =>
      existsSync(`${db}.calls`)
        ? readFileSync(`${db}.calls`, 'utf8')
            .trim()
            .split('\n')
            .map((line: string) => JSON.parse(line) as string[])
        : [],
    run: async (...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          FAKE_HERDR: db,
          HOME: home,
          AKROGON_PROC_ROOT: resolve(dir, 'proc'),
          HERDR_PANE_ID: paneA,
        },
      });
      return { code, stdout, stderr };
    },
    runWith: async (env: Record<string, string>, ...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          FAKE_HERDR: db,
          HOME: home,
          AKROGON_PROC_ROOT: resolve(dir, 'proc'),
          HERDR_PANE_ID: paneA,
          ...env,
        },
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function eventLine(type: string, turn: string): string {
  return `${JSON.stringify({ timestamp: '2026-10-16T00:00:00.000Z', type: 'event_msg', payload: { type, turn_id: turn } })}\n`;
}

function writeRollout(home: string, session: string, lines: string, variant = 0): string {
  const path: string = resolve(
    home,
    `.codex/sessions/2026/10/16/rollout-2026-10-16T00-00-0${variant}-${session}.jsonl`,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, lines);
  return path;
}

function writeTranscript(home: string, session: string, closed: boolean): void {
  const path: string = resolve(home, `.claude/projects/proj/${session}.jsonl`);
  mkdirSync(dirname(path), { recursive: true });
  const prompt: string = JSON.stringify({ type: 'user', message: { content: 'go' } });
  const done: string = JSON.stringify({ type: 'system', subtype: 'turn_duration' });
  writeFileSync(path, closed ? `${prompt}\n${done}\n` : `${prompt}\n`);
}

function expectOutcome(
  result: RunResult,
  expected: {
    outcome: string;
    pane: string;
    file: string;
    status: string | null;
    signal: string;
    session: string | null;
    exchange: Exchange;
  },
): void {
  expect(result.code).toBe(0);
  expect(result.stdout.split('\n')).toHaveLength(2);
  expect(result.stdout.endsWith('\n')).toBe(true);
  expect(JSON.parse(result.stdout)).toEqual(expected);
}

test('passes a non-timeout herdr failure through unchanged', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }], (): WaitEntry[] => [
    { stderr: 'raw failure text' },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expect(result).toEqual({ code: 1, stdout: '', stderr: 'raw failure text\n' });
  } finally {
    s.clean();
  }
});

test('blocked wins over a non-empty return file', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'blocked' }]);
  try {
    writeFileSync(s.file, 'peer reply\n');
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, {
      outcome: 'blocked',
      pane,
      file: s.file,
      status: 'blocked',
      signal: 'proven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

test('done when the return file is written during a timed-out wait', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }], (file: string): WaitEntry[] => [
    { append: file },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, {
      outcome: 'done',
      pane,
      file: s.file,
      status: null,
      signal: 'proven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

test('done while herdr still reports working', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }], (file: string): WaitEntry[] => [
    { status: 'working', append: file },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '10');
    expectOutcome(result, {
      outcome: 'done',
      pane,
      file: s.file,
      status: 'working',
      signal: 'proven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

// Criterion 1: a kind with no proven end signal never gets failure on idle or done.
test('unproven kind waits out the budget on idle', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

test('unproven kind waits out the budget on done with a 0-byte return file', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'done' }]);
  try {
    writeFileSync(s.file, '');
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'done',
      signal: 'unproven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

test('unproven peer that answers during the grace ends done', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }], (file: string): WaitEntry[] => [
    { status: 'idle' },
    { append: file },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expectOutcome(result, {
      outcome: 'done',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

// Criterion 2: pi is proven only while agent pi + source herdr:pi + screen_detection_skipped true.
const piAuthority: PaneSeed = {
  agent: 'pi',
  agent_status: 'idle',
  agent_session: { kind: 'path', value: '/tmp/s-pi.jsonl', source: 'herdr:pi', agent: 'pi' },
  screen_detection_skipped: true,
};

test('pi peer fails on idle only while hook authority holds', async (): Promise<void> => {
  const s: Setup = setup([
    piAuthority,
    {
      agent: 'codex',
      agent_status: 'idle',
      agent_session: { kind: 'id', value: 'c-sib', source: 'herdr:codex', agent: 'codex' },
      screen_detection_skipped: null,
    },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: '/tmp/s-pi.jsonl',
      exchange: { kind: 'pi', session: '/tmp/s-pi.jsonl', boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

test.each<[string, PaneSeed]>([
  ['screen_detection_skipped null', { ...piAuthority, screen_detection_skipped: null }],
  [
    'screen_detection_skipped absent',
    {
      agent: 'pi',
      agent_status: 'idle',
      agent_session: { kind: 'path', value: '/tmp/s-pi.jsonl', source: 'herdr:pi', agent: 'pi' },
    },
  ],
  [
    'source not herdr:pi',
    { ...piAuthority, agent_session: { kind: 'path', value: '/tmp/s-pi.jsonl', source: 'herdr:screen' } },
  ],
])('pi peer without authority stays unproven: %s', async (_name: string, paneSeed: PaneSeed): Promise<void> => {
  const s: Setup = setup([paneSeed]);
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: '/tmp/s-pi.jsonl',
      exchange: { kind: 'pi', session: '/tmp/s-pi.jsonl', boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

// Criterion 3: codex ends only on the bound turn's task_complete or turn_aborted.
const codexPane = (session: string): PaneSeed => ({
  agent: 'codex',
  agent_status: 'idle',
  agent_session: { kind: 'id', value: session, source: 'herdr:codex', agent: 'codex' },
  screen_detection_skipped: null,
});
const codexSession: string = 'session-codex-1';

test('codex peer fails on its bound turn task_complete', async (): Promise<void> => {
  const s: Setup = setup([codexPane(codexSession)]);
  try {
    const rollout: string = writeRollout(
      s.home,
      codexSession,
      eventLine('task_started', 'old-turn') + eventLine('task_complete', 'old-turn'),
    );
    const boundary: number = readFileSync(rollout, 'utf8').length;
    const exchange: Exchange = { kind: 'codex', session: codexSession, boundary, turn: null };
    const { appendFileSync } = await import('node:fs');
    appendFileSync(rollout, eventLine('task_started', 'new-turn') + eventLine('task_complete', 'new-turn'));
    const result: RunResult = await s.run(pane, s.file, '12', JSON.stringify(exchange));
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary, turn: 'new-turn' },
    });
  } finally {
    s.clean();
  }
});

test('codex peer fails on its bound turn turn_aborted', async (): Promise<void> => {
  const s: Setup = setup([codexPane(codexSession)]);
  try {
    const rollout: string = writeRollout(s.home, codexSession, '');
    const exchange: Exchange = { kind: 'codex', session: codexSession, boundary: 0, turn: null };
    const { appendFileSync } = await import('node:fs');
    appendFileSync(rollout, eventLine('task_started', 'aborted-turn') + eventLine('turn_aborted', 'aborted-turn'));
    const result: RunResult = await s.run(pane, s.file, '12', JSON.stringify(exchange));
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary: 0, turn: 'aborted-turn' },
    });
  } finally {
    s.clean();
  }
});

test.each<[string, (s: Setup) => { exchange: Exchange } | { exchange: Exchange; extra: () => void }]>([
  [
    'task completed before the boundary never ends the wait',
    (s: Setup) => {
      const rollout: string = writeRollout(
        s.home,
        codexSession,
        eventLine('task_started', 'old') + eventLine('task_complete', 'old'),
      );
      return {
        exchange: { kind: 'codex', session: codexSession, boundary: readFileSync(rollout, 'utf8').length, turn: null },
      };
    },
  ],
  [
    'no rollout match',
    (): { exchange: Exchange } => ({ exchange: { kind: 'codex', session: codexSession, boundary: 10, turn: null } }),
  ],
  [
    'several rollout matches',
    (s: Setup) => {
      writeRollout(s.home, codexSession, eventLine('task_started', 'a') + eventLine('task_complete', 'a'), 0);
      writeRollout(s.home, codexSession, eventLine('task_started', 'a') + eventLine('task_complete', 'a'), 1);
      return { exchange: { kind: 'codex', session: codexSession, boundary: 0, turn: null } };
    },
  ],
  [
    'no task_started after the boundary',
    (s: Setup) => {
      const rollout: string = writeRollout(s.home, codexSession, eventLine('task_started', 'old'));
      return {
        exchange: { kind: 'codex', session: codexSession, boundary: readFileSync(rollout, 'utf8').length, turn: null },
      };
    },
  ],
  [
    'no carried exchange means no boundary',
    (s: Setup) => {
      writeRollout(s.home, codexSession, eventLine('task_started', 'x') + eventLine('task_complete', 'x'));
      return { exchange: { kind: 'codex', session: codexSession, boundary: null, turn: null } };
    },
  ],
])(
  'codex peer is unproven: %s',
  async (_name: string, fixture: (s: Setup) => { exchange: Exchange }): Promise<void> => {
    const s: Setup = setup([codexPane(codexSession)]);
    try {
      const { exchange } = fixture(s);
      const result: RunResult = await s.run(pane, s.file, '4', JSON.stringify(exchange));
      expectOutcome(result, {
        outcome: 'budget',
        pane,
        file: s.file,
        status: 'idle',
        signal: 'unproven',
        session: codexSession,
        exchange,
      });
    } finally {
      s.clean();
    }
  },
);

test('codex peer with no session is unproven', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'codex', agent_status: 'idle' }]);
  try {
    const result: RunResult = await s.run(
      pane,
      s.file,
      '4',
      JSON.stringify({ kind: 'codex', session: null, boundary: null, turn: null }),
    );
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: null,
      exchange: { kind: 'codex', session: null, boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

// Criterion 4: claude keeps the transcript check.
test('claude peer keeps the transcript check', async (): Promise<void> => {
  const open: Setup = setup([
    {
      agent: 'claude',
      agent_status: 'idle',
      agent_session: { kind: 'id', value: 'sess-open', source: 'herdr:claude' },
    },
  ]);
  try {
    writeTranscript(open.home, 'sess-open', false);
    const result: RunResult = await open.run(pane, open.file, '11');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: open.file,
      status: 'idle',
      signal: 'proven',
      session: 'sess-open',
      exchange: seed('claude', 'sess-open'),
    });
  } finally {
    open.clean();
  }
  const closed: Setup = setup([
    {
      agent: 'claude',
      agent_status: 'idle',
      agent_session: { kind: 'id', value: 'sess-closed', source: 'herdr:claude' },
    },
  ]);
  try {
    writeTranscript(closed.home, 'sess-closed', true);
    const result: RunResult = await closed.run(pane, closed.file, '12');
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: closed.file,
      status: 'idle',
      signal: 'proven',
      session: 'sess-closed',
      exchange: seed('claude', 'sess-closed'),
    });
  } finally {
    closed.clean();
  }
});

// Criterion 5: blocked read at a grace check ends the wait blocked.
test('blocked read at a grace check ends the wait blocked', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }], (): WaitEntry[] => [
    { status: 'idle' },
    { status: 'blocked' },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expectOutcome(result, {
      outcome: 'blocked',
      pane,
      file: s.file,
      status: 'blocked',
      signal: 'proven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

// Criterion 6: identity re-read at each grace check.
test('a kind change between grace checks is an error', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }], (): WaitEntry[] => [
    { status: 'idle' },
    { kind: 'pi' },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('fake');
    expect(result.stderr).toContain('pi');
  } finally {
    s.clean();
  }
});

test.each<[string, string]>([
  ['claude', 'sess-a'],
  ['codex', codexSession],
])('a session change between grace checks is an error for %s', async (kind: string, first: string): Promise<void> => {
  const session: FakeSession = { kind: 'id', value: first, source: `herdr:${kind}` };
  const s: Setup = setup([{ agent: kind, agent_status: 'idle', agent_session: session }], (): WaitEntry[] => [
    { status: 'idle' },
    { session: 'sess-b' },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(first);
    expect(result.stderr).toContain('sess-b');
  } finally {
    s.clean();
  }
});

test('an unproven harness session change keeps waiting with its original exchange', async (): Promise<void> => {
  const s: Setup = setup(
    [{ agent: 'antigravity', agent_status: 'idle', agent_session: { kind: 'id', value: 'session-A' } }],
    (): WaitEntry[] => [{ status: 'idle' }, { session: 'session-B' }],
  );
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    const exchange: Exchange = seed('antigravity', 'session-A');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: 'session-B',
      exchange,
    });
    const rerun: RunResult = await s.run(pane, s.file, '4', JSON.stringify(JSON.parse(result.stdout).exchange));
    expectOutcome(rerun, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: 'session-B',
      exchange,
    });
  } finally {
    s.clean();
  }
});

test('a pi session change is ignored while hook authority holds', async (): Promise<void> => {
  const s: Setup = setup([piAuthority], (): WaitEntry[] => [{ status: 'idle' }, { session: '/tmp/s-pi-other.jsonl' }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: '/tmp/s-pi-other.jsonl',
      exchange: { kind: 'pi', session: '/tmp/s-pi.jsonl', boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

test('a pi losing hook authority turns unproven', async (): Promise<void> => {
  const s: Setup = setup([piAuthority], (): WaitEntry[] => [{ status: 'idle' }, { screenSkipped: false }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: '/tmp/s-pi.jsonl',
      exchange: { kind: 'pi', session: '/tmp/s-pi.jsonl', boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

// lean-exchange criterion: the outcome line's `session` is the session `herdr agent list` shows
// after the exchange; `exchange` keeps the prompt-time (possibly adopted) identity.
test('outcome session is the post-exchange session when herdr adopted it during the wait', async (): Promise<void> => {
  const s: Setup = setup(
    [{ agent: 'fake', agent_status: 'idle', agent_session: { kind: 'id', value: 'sess-old' } }],
    (): WaitEntry[] => [{ status: 'idle' }, { session: 'sess-new' }],
  );
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: 'sess-new',
      exchange: seed('fake', 'sess-old'),
    });
  } finally {
    s.clean();
  }
});

test('a codex session appearing after the prompt is on the outcome line', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'codex', agent_status: 'idle' }], (): WaitEntry[] => [
    { status: 'idle' },
    { session: codexSession },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '4');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary: null, turn: null },
    });
  } finally {
    s.clean();
  }
});

test('a session null at start and set later is adopted', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'claude', agent_status: 'idle' }], (file: string, home: string): WaitEntry[] => {
    writeTranscript(home, 'sess-late', true);
    return [{ status: 'idle' }, { session: 'sess-late' }];
  });
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expectOutcome(result, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: 'sess-late',
      exchange: seed('claude', 'sess-late'),
    });
  } finally {
    s.clean();
  }
});

test('an agent gone from the list is the No herdr agent error', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }], (): WaitEntry[] => [
    { status: 'idle' },
    { dropAgent: true },
  ]);
  try {
    const result: RunResult = await s.run(pane, s.file, '12');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`No herdr agent on pane ${pane}`);
  } finally {
    s.clean();
  }
});

// Criterion 7: a carried exchange keeps the original turn across budget reruns.
test('carried exchange binds the original turn on rerun', async (): Promise<void> => {
  const s: Setup = setup([codexPane(codexSession)]);
  try {
    const rollout: string = writeRollout(s.home, codexSession, '');
    const { appendFileSync } = await import('node:fs');
    // First run binds turn-A which stays open: budget, proven.
    appendFileSync(rollout, eventLine('task_started', 'turn-A'));
    const first: RunResult = await s.run(
      pane,
      s.file,
      '11',
      JSON.stringify({ kind: 'codex', session: codexSession, boundary: 0, turn: null }),
    );
    expectOutcome(first, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' },
    });
    // A later turn starts and completes; the rerun must still watch turn-A, so no failure yet.
    appendFileSync(rollout, eventLine('task_started', 'turn-B') + eventLine('task_complete', 'turn-B'));
    const second: RunResult = await s.run(
      pane,
      s.file,
      '11',
      JSON.stringify({ kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' }),
    );
    expectOutcome(second, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' },
    });
    appendFileSync(rollout, eventLine('turn_aborted', 'turn-A'));
    const third: RunResult = await s.run(
      pane,
      s.file,
      '12',
      JSON.stringify({ kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' }),
    );
    expectOutcome(third, {
      outcome: 'failure',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange: { kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' },
    });
  } finally {
    s.clean();
  }
});

test('a carried codex turn becomes unproven when its rollout is missing or ambiguous', async (): Promise<void> => {
  const s: Setup = setup([codexPane(codexSession)]);
  try {
    const rollout: string = writeRollout(s.home, codexSession, eventLine('task_started', 'turn-A'));
    const first: RunResult = await s.run(
      pane,
      s.file,
      '1',
      JSON.stringify({ kind: 'codex', session: codexSession, boundary: 0, turn: null }),
    );
    const exchange: Exchange = { kind: 'codex', session: codexSession, boundary: 0, turn: 'turn-A' };
    expectOutcome(first, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'proven',
      session: codexSession,
      exchange,
    });
    const carried: string = JSON.stringify(JSON.parse(first.stdout).exchange);
    rmSync(rollout);
    const missing: RunResult = await s.run(pane, s.file, '1', carried);
    expectOutcome(missing, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: codexSession,
      exchange,
    });
    writeRollout(s.home, codexSession, eventLine('task_started', 'turn-A'), 0);
    writeRollout(s.home, codexSession, eventLine('task_started', 'turn-A'), 1);
    const ambiguous: RunResult = await s.run(pane, s.file, '1', carried);
    expectOutcome(ambiguous, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'idle',
      signal: 'unproven',
      session: codexSession,
      exchange,
    });
  } finally {
    s.clean();
  }
});

test('a carried kind or session that no longer matches is an error', async (): Promise<void> => {
  const s: Setup = setup([codexPane(codexSession)]);
  try {
    const kindMismatch: RunResult = await s.run(
      pane,
      s.file,
      '11',
      JSON.stringify({ kind: 'pi', session: codexSession, boundary: 0, turn: null }),
    );
    expect(kindMismatch.code).toBe(1);
    expect(kindMismatch.stderr).toContain('pi');
    expect(kindMismatch.stderr).toContain('codex');
    const sessionMismatch: RunResult = await s.run(
      pane,
      s.file,
      '11',
      JSON.stringify({ kind: 'codex', session: 'other-session', boundary: 0, turn: null }),
    );
    expect(sessionMismatch.code).toBe(1);
    expect(sessionMismatch.stderr).toContain('other-session');
    expect(sessionMismatch.stderr).toContain(codexSession);
  } finally {
    s.clean();
  }
});

test('budget clamps each wait timeout to the remaining budget', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }]);
  try {
    const budgetMs: number = 500;
    const start: number = performance.now();
    const result: RunResult = await s.run(pane, s.file, String(budgetMs / 1000));
    const elapsed: number = performance.now() - start;
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: null,
      signal: 'unproven',
      session: null,
      exchange: seed('fake'),
    });
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
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }], (): WaitEntry[] => [{ status: 'working' }]);
  try {
    const result: RunResult = await s.run(pane, s.file, '2');
    expectOutcome(result, {
      outcome: 'budget',
      pane,
      file: s.file,
      status: 'working',
      signal: 'unproven',
      session: null,
      exchange: seed('fake'),
    });
  } finally {
    s.clean();
  }
});

test('rejects missing args and a non-numeric budget', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'working' }]);
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

// peer-pane-anchor criterion 1: a HERDR_PANE_ID whose pane shell is not an ancestor refuses
// before the first wait, naming the env values and herdr's answer.
test('refuses when the pane shell is not an ancestor of the script', async (): Promise<void> => {
  const s: Setup = setup([
    { agent: 'fake', agent_status: 'idle' },
    { agent: 'fake', agent_status: 'idle', shell_pid: 999999999 },
  ]);
  try {
    const result: RunResult = await s.runWith({ HERDR_PANE_ID: 'w8:p1' }, pane, s.file, '4');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('w8:p1');
    expect(result.stderr).toContain('999999999');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', 'w8:p1']]);
  } finally {
    s.clean();
  }
});

test('refuses when HERDR_PANE_ID names a pane herdr does not have', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }]);
  try {
    const result: RunResult = await s.runWith({ HERDR_PANE_ID: 'w8:pZ' }, pane, s.file, '4');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('w8:pZ');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(result.stderr).toContain('Missing pane');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', 'w8:pZ']]);
  } finally {
    s.clean();
  }
});

test('refuses when HERDR_PANE_ID is unset or empty, before any herdr call', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }]);
  try {
    const result: RunResult = await s.runWith({ HERDR_PANE_ID: '' }, pane, s.file, '4');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('HERDR_PANE_ID');
    expect(result.stderr).toContain('HERDR_SOCKET_PATH');
    expect(s.calls()).toEqual([]);
  } finally {
    s.clean();
  }
});

test('refuses when HERDR_SOCKET_PATH names another session without the pane', async (): Promise<void> => {
  const s: Setup = setup([{ agent: 'fake', agent_status: 'idle' }], (): WaitEntry[] => [], {
    sessions: [{ name: 'other', running: true, panes: [], tabs: [], serial: 0 }],
  });
  try {
    const result: RunResult = await s.runWith({ HERDR_SOCKET_PATH: `${s.db}-other.sock` }, pane, s.file, '4');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(paneA);
    expect(result.stderr).toContain(`${s.db}-other.sock`);
    expect(result.stderr).toContain('Missing pane');
    expect(s.calls()).toEqual([['pane', 'process-info', '--pane', paneA]]);
  } finally {
    s.clean();
  }
});
