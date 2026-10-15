import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/peer-ask.ts');
const paneB: string = 'w8:pB';
const paneC: string = 'w8:pC';

type RunResult = { code: number; stdout: string; stderr: string };
type ScriptEntry = { code?: string; append?: string; appendTo?: string; status?: string; sleepMs?: number };
type PaneSeed = {
  pane_id: string;
  agent: string;
  agent_status: string;
  agent_session?: { kind: 'id' | 'path'; value: string; source?: string; agent?: string };
  screen_detection_skipped?: boolean | null;
};
type Setup = {
  dir: string;
  home: string;
  fileB: string;
  fileC: string;
  calls: () => string[][];
  herdrCalled: () => boolean;
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

const defaultPanes: PaneSeed[] = [
  { pane_id: paneB, agent: 'fake', agent_status: 'idle' },
  { pane_id: paneC, agent: 'fake', agent_status: 'idle' },
];

function setup(
  promptScript: (fileB: string, home: string) => ScriptEntry[],
  waitScript: (fileB: string) => ScriptEntry[],
  panes: PaneSeed[] = defaultPanes,
): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'peer-ask-')));
  const home: string = resolve(dir, 'home');
  mkdirSync(home);
  const fileB: string = resolve(dir, 'return-B.md');
  const fileC: string = resolve(dir, 'return-C.md');
  const bin: string = resolve(dir, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: panes.map((p: PaneSeed) => ({
        pane_id: p.pane_id,
        tab_id: 'w8:t1',
        cwd: '/tmp',
        agent: p.agent,
        agent_status: p.agent_status,
        ...(p.agent_session === undefined ? {} : { agent_session: p.agent_session }),
        ...(p.screen_detection_skipped === undefined
          ? {}
          : { screen_detection_skipped: p.screen_detection_skipped }),
      })),
      tabs: [],
      serial: 0,
      promptScript: promptScript(fileB, home),
      waitScript: waitScript(fileB),
    }),
  );
  return {
    dir,
    home,
    fileB,
    fileC,
    calls: (): string[][] =>
      readFileSync(`${db}.calls`, 'utf8')
        .trim()
        .split('\n')
        .map((line: string) => JSON.parse(line) as string[]),
    herdrCalled: (): boolean => existsSync(`${db}.calls`),
    run: async (...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db, HOME: home },
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function verbs(calls: string[][]): string[] {
  return calls.map((args: string[]): string => `${args[0]} ${args[1]} ${args[2] ?? ''}`.trim());
}

function eventLine(type: string, turn: string): string {
  return `${JSON.stringify({ timestamp: '2026-10-16T00:00:00.000Z', type: 'event_msg', payload: { type, turn_id: turn } })}\n`;
}

test('prompts, then waits for the answer in the same call', async (): Promise<void> => {
  const s: Setup = setup((): ScriptEntry[] => [{}], (fileB: string): ScriptEntry[] => [{ append: fileB }]);
  try {
    const result: RunResult = await s.run('10', paneB, s.fileB, 'read the brief');
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      outcome: 'done',
      pane: paneB,
      file: s.fileB,
      status: null,
      signal: 'proven',
      exchange: { kind: 'fake', session: null, boundary: null, turn: null },
    });
    const order: string[] = verbs(s.calls());
    expect(order[0]).toBe('agent list');
    expect(order[1]).toBe(`agent prompt ${paneB}`);
    expect(order).toContain(`agent wait ${paneB}`);
  } finally {
    s.clean();
  }
});

// Criterion 7: peer-ask records the codex rollout boundary before the prompt is sent.
test('seeds the codex boundary before prompting', async (): Promise<void> => {
  const session: string = 'session-codex-ask';
  const s: Setup = setup(
    (fileB: string, home: string): ScriptEntry[] => {
      const rollout: string = resolve(home, `.codex/sessions/2026/10/16/rollout-2026-10-16T00-00-00-${session}.jsonl`);
      mkdirSync(dirname(rollout), { recursive: true });
      writeFileSync(rollout, '');
      return [{ appendTo: rollout, append: eventLine('task_started', 'turn-A') + eventLine('task_complete', 'turn-A') }];
    },
    (): ScriptEntry[] => [{ status: 'idle' }, {}],
    [
      {
        pane_id: paneB,
        agent: 'codex',
        agent_status: 'idle',
        agent_session: { kind: 'id', value: session, source: 'herdr:codex', agent: 'codex' },
        screen_detection_skipped: null,
      },
    ],
  );
  try {
    const result: RunResult = await s.run('12', paneB, s.fileB, 'read the brief');
    expect(result.code).toBe(0);
    const line = JSON.parse(result.stdout);
    expect(line.outcome).toBe('failure');
    expect(line.signal).toBe('proven');
    expect(line.exchange).toEqual({ kind: 'codex', session, boundary: 0, turn: 'turn-A' });
    const order: string[] = verbs(s.calls());
    expect(order[0]).toBe('agent list');
    expect(order[1]).toBe(`agent prompt ${paneB}`);
  } finally {
    s.clean();
  }
});

test('a failed prompt skips that wait, still waits on the others and exits non-zero', async (): Promise<void> => {
  const s: Setup = setup(
    (): ScriptEntry[] => [{}, { code: 'agent_blocked' }],
    (fileB: string): ScriptEntry[] => [{ append: fileB }],
  );
  try {
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, s.fileC, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`herdr agent prompt ${paneC} failed`);
    expect(result.stderr).toContain('agent_blocked');
    expect(JSON.parse(result.stdout)).toEqual({
      outcome: 'done',
      pane: paneB,
      file: s.fileB,
      status: null,
      signal: 'proven',
      exchange: { kind: 'fake', session: null, boundary: null, turn: null },
    });
    expect(verbs(s.calls())).not.toContain(`agent wait ${paneC}`);
  } finally {
    s.clean();
  }
});

test('a pane missing from agent list is reported like a failed prompt', async (): Promise<void> => {
  const s: Setup = setup(
    (): ScriptEntry[] => [{}],
    (fileB: string): ScriptEntry[] => [{ append: fileB }],
    [defaultPanes[0]],
  );
  try {
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, s.fileC, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(paneC);
    expect(verbs(s.calls())).not.toContain(`agent prompt ${paneC}`);
  } finally {
    s.clean();
  }
});

test('refuses a reused return file before prompting anyone', async (): Promise<void> => {
  const s: Setup = setup((): ScriptEntry[] => [], (): ScriptEntry[] => []);
  try {
    writeFileSync(s.fileC, 'old answer\n');
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, s.fileC, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(s.fileC);
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});

test('rejects missing args and a bad budget before prompting', async (): Promise<void> => {
  const s: Setup = setup((): ScriptEntry[] => [], (): ScriptEntry[] => []);
  try {
    for (const args of [
      ['10', paneB, s.fileB],
      ['abc', paneB, s.fileB, 'brief'],
      ['0', paneB, s.fileB, 'brief'],
    ]) {
      const result: RunResult = await s.run(...args);
      expect(result.code).toBe(1);
      expect(result.stderr).not.toBe('');
      expect(result.stdout).toBe('');
    }
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});

test('refuses two peers sharing one return file before prompting anyone', async (): Promise<void> => {
  const s: Setup = setup((): ScriptEntry[] => [], (): ScriptEntry[] => []);
  try {
    const same: string = s.fileB.replace(/return-B\.md$/, './return-B.md');
    const result: RunResult = await s.run('10', paneB, s.fileB, 'brief B', paneC, same, 'brief C');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('own return file');
    expect(s.herdrCalled()).toBe(false);
  } finally {
    s.clean();
  }
});
