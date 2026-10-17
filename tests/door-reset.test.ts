import { expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, existsSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/door-reset.ts');
const pane: string = 'w8:pX';
const session: string = 'sess-a';

type RunResult = { code: number; stdout: string; stderr: string };
type FakeSession = { kind: 'id' | 'path'; value: string; source?: string; agent?: string };
type PaneSeed = {
  agent: string;
  agent_status: string;
  agent_session?: FakeSession | null;
  screen_detection_skipped?: boolean | null;
};
type Setup = {
  dir: string;
  home: string;
  db: string;
  log: string;
  calls: () => string[][];
  promptCalls: () => string[][];
  logLines: () => Record<string, unknown>[];
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

const idSession = (value: string, source: string): FakeSession => ({ kind: 'id', value, source });

function setup(seed: PaneSeed, dbExtra: Record<string, unknown> = {}): Setup {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'door-reset-')));
  const home: string = resolve(dir, 'home');
  mkdirSync(home);
  const bin: string = resolve(dir, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(dir, 'db.json');
  writeFileSync(
    db,
    JSON.stringify({
      panes: [
        {
          pane_id: pane,
          tab_id: 'w8:t1',
          cwd: '/tmp',
          agent: seed.agent,
          agent_status: seed.agent_status,
          ...(seed.agent_session === undefined || seed.agent_session === null
            ? {}
            : { agent_session: seed.agent_session }),
          ...(seed.screen_detection_skipped === undefined
            ? {}
            : { screen_detection_skipped: seed.screen_detection_skipped }),
        },
      ],
      tabs: [],
      serial: 0,
      waitScript: [],
      promptScript: [],
      ...dbExtra,
    }),
  );
  const log: string = resolve(dir, 'handover.log');
  const calls = (): string[][] =>
    existsSync(`${db}.calls`)
      ? readFileSync(`${db}.calls`, 'utf8')
          .trim()
          .split('\n')
          .map((line: string) => JSON.parse(line) as string[])
      : [];
  return {
    dir,
    home,
    db,
    log,
    calls,
    promptCalls: (): string[][] =>
      calls().filter((args: string[]): boolean => args[0] === 'agent' && args[1] === 'prompt'),
    logLines: (): Record<string, unknown>[] =>
      existsSync(log)
        ? readFileSync(log, 'utf8')
            .trim()
            .split('\n')
            .filter(Boolean)
            .map((line: string) => JSON.parse(line) as Record<string, unknown>)
        : [],
    run: async (extraEnv: Record<string, string> = {}, ...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          FAKE_HERDR: db,
          HOME: home,
          DOOR_RESET_INLINE: '1',
          DOOR_RESET_TURN_BOUND_MS: '500',
          DOOR_RESET_CONFIRM_MS: '400',
          ...extraEnv,
        },
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

function writeTranscript(home: string, sess: string, closed: boolean): void {
  const path: string = resolve(home, `.claude/projects/proj/${sess}.jsonl`);
  mkdirSync(dirname(path), { recursive: true });
  const prompt: string = JSON.stringify({ type: 'user', message: { content: 'go' } });
  const done: string = JSON.stringify({ type: 'system', subtype: 'turn_duration' });
  writeFileSync(path, closed ? `${prompt}\n${done}\n` : `${prompt}\n`);
}

function writeRollout(home: string, sess: string, lines: string): string {
  const path: string = resolve(home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, lines);
  return path;
}

const claudePane = (sess = session, status = 'idle'): PaneSeed => ({
  agent: 'claude',
  agent_status: status,
  agent_session: idSession(sess, 'herdr:claude'),
});

const piAuthority: PaneSeed = {
  agent: 'pi',
  agent_status: 'idle',
  agent_session: { kind: 'path', value: '/tmp/pi-session.jsonl', source: 'herdr:pi', agent: 'pi' },
  screen_detection_skipped: true,
};

const piSession: string = '/tmp/pi-session.jsonl';
const START: string = 'start prompt text';

// Criterion 2: unknown kind or mismatched session refuses without sending or logging.
test.each<[string, PaneSeed, string]>([
  [
    'unsupported kind',
    { agent: 'antigravity', agent_status: 'idle', agent_session: idSession(session, 'herdr:agy') },
    session,
  ],
  ['session mismatch', claudePane('sess-other'), session],
  ['pane without agent', { agent: 'pi', agent_status: 'idle' }, session],
])('refuses when %s', async (_name: string, seed: PaneSeed, sess: string): Promise<void> => {
  const s: Setup = setup(seed);
  try {
    const result: RunResult = await s.run({}, pane, sess, s.log, START);
    expect(result.code).toBe(1);
    expect(result.stderr).not.toBe('');
    expect(existsSync(s.log)).toBe(false);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

test('refuses a session mismatch even when the passed session has a transcript', async (): Promise<void> => {
  const s: Setup = setup(claudePane('sess-other'));
  try {
    writeTranscript(s.home, session, true);
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(1);
    expect(result.stderr).not.toBe('');
    expect(existsSync(s.log)).toBe(false);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Criterion 3: an open turn at the bound logs it and sends nothing.
test('pi turn still open at the bound is logged and nothing is sent', async (): Promise<void> => {
  const s: Setup = setup({ ...piAuthority, agent_status: 'working' });
  try {
    const result: RunResult = await s.run({}, pane, piSession, s.log, START);
    expect(result.code).toBe(1);
    const lines: Record<string, unknown>[] = s.logLines();
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((l) => l.step === 'wait-turn-end' && l.result === 'turn open')).toBe(true);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

test('claude turn still open at the bound is logged and nothing is sent', async (): Promise<void> => {
  const s: Setup = setup(claudePane());
  try {
    writeTranscript(s.home, session, false);
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(1);
    expect(s.logLines().some((l) => l.step === 'wait-turn-end' && l.result === 'turn open')).toBe(true);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Criterion 3: a session change observed during the turn wait is logged and nothing is sent.
test('a session change during the turn wait is logged and nothing is sent', async (): Promise<void> => {
  const s: Setup = setup(claudePane());
  try {
    writeTranscript(s.home, session, false);
    const pending: Promise<RunResult> = s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, session, s.log, START);
    await Bun.sleep(700);
    writeFileSync(
      s.db,
      readFileSync(s.db, 'utf8').replaceAll(
        JSON.stringify(idSession(session, 'herdr:claude')),
        JSON.stringify(idSession('sess-later', 'herdr:claude')),
      ),
    );
    const result: RunResult = await pending;
    expect(result.code).toBe(1);
    expect(s.logLines().some((l) => l.step === 'wait-turn-end' && l.result === 'identity changed')).toBe(true);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Criterion 4: an unconfirmed reset is logged and no start prompt is sent.
test('unconfirmed reset is logged and no start prompt is sent', async (): Promise<void> => {
  const s: Setup = setup(piAuthority);
  try {
    const result: RunResult = await s.run({}, pane, piSession, s.log, START);
    expect(result.code).toBe(1);
    const lines: Record<string, unknown>[] = s.logLines();
    expect(lines.some((l) => l.step === 'wait-new-session' && l.result === 'reset unconfirmed')).toBe(true);
    const prompts: string[][] = s.promptCalls();
    expect(prompts).toHaveLength(1);
    expect(prompts[0][3]).toBe('/new');
  } finally {
    s.clean();
  }
});

// Criterion 5: a stalled start prompt is logged as failure, with no retry.
test('a stalled start prompt is logged as failure and not retried', async (): Promise<void> => {
  const s: Setup = setup(claudePane(), {
    promptScript: [{ session: 'sess-new', status: 'idle' }, { code: 'agent_prompt_stalled' }],
  });
  try {
    writeTranscript(s.home, session, true);
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(1);
    const lines: Record<string, unknown>[] = s.logLines();
    expect(lines.some((l) => l.step === 'send-start-prompt' && l.result === 'prompt_stalled')).toBe(true);
    expect(s.promptCalls().filter((args) => args[3] === START)).toHaveLength(1);
  } finally {
    s.clean();
  }
});

// Criterion 3+4+5 happy path: claude — turn end, reset, new session, start prompt, all logged.
test('claude handover sends reset then start prompt after the new session appears', async (): Promise<void> => {
  const s: Setup = setup(claudePane(), {
    promptScript: [{ session: 'sess-new', status: 'idle' }],
  });
  try {
    writeTranscript(s.home, session, true);
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(0);
    const lines: Record<string, unknown>[] = s.logLines();
    for (const step of ['wait-turn-end', 'send-reset', 'wait-new-session', 'send-start-prompt']) {
      expect(lines.some((l) => l.step === step)).toBe(true);
    }
    const prompts: string[][] = s.promptCalls();
    expect(prompts).toHaveLength(2);
    expect(prompts[0][3]).toBe('/clear');
    expect(prompts[1][3]).toBe(START);
    expect(prompts[1]).toContain('--wait');
    expect(prompts[1]).toContain('working');
    expect(prompts[1]).toContain('5000');
  } finally {
    s.clean();
  }
});

// Codex gets the harmless check prompt before the start prompt.
test('codex handover sends reset, one check prompt, then start prompt', async (): Promise<void> => {
  const s: Setup = setup(
    {
      agent: 'codex',
      agent_status: 'idle',
      agent_session: idSession(session, 'herdr:codex'),
      screen_detection_skipped: null,
    },
    {
      promptScript: [{ status: 'idle' }],
      waitScript: [{ status: 'done', session: 'sess-new' }],
    },
  );
  try {
    writeRollout(
      s.home,
      session,
      `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't1' } })}\n`,
    );
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(0);
    const prompts: string[][] = s.promptCalls();
    expect(prompts).toHaveLength(3);
    expect(prompts[0][3]).toBe('/new');
    expect(prompts[1][3]).not.toBe(START);
    expect(prompts[1]).toContain('--wait');
    expect(prompts[2][3]).toBe(START);
    expect(s.calls().some((args) => args[0] === 'agent' && args[1] === 'wait')).toBe(true);
  } finally {
    s.clean();
  }
});

// Criterion 3: codex logs and stops when its last task is still open at the bound.
test.each<[string, string]>([
  [
    'a single open task',
    `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n`,
  ],
  [
    'an older completed task before the open one',
    `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't0' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't0' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n`,
  ],
])(
  'codex turn still open at the bound with %s is logged and nothing is sent',
  async (_name: string, rollout: string): Promise<void> => {
    const s: Setup = setup({
      agent: 'codex',
      agent_status: 'idle',
      agent_session: idSession(session, 'herdr:codex'),
      screen_detection_skipped: null,
    });
    try {
      writeRollout(s.home, session, rollout);
      const result: RunResult = await s.run({}, pane, session, s.log, START);
      expect(result.code).toBe(1);
      expect(s.logLines().some((l) => l.step === 'wait-turn-end' && l.result === 'turn open')).toBe(true);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);

// Criterion 5: a stalled codex check prompt is logged as failure, with no retry.
test('a stalled codex check prompt is logged as failure and not retried', async (): Promise<void> => {
  const s: Setup = setup(
    {
      agent: 'codex',
      agent_status: 'idle',
      agent_session: idSession(session, 'herdr:codex'),
      screen_detection_skipped: null,
    },
    {
      promptScript: [{ status: 'idle' }, { code: 'agent_prompt_stalled' }],
      waitScript: [],
    },
  );
  try {
    writeRollout(
      s.home,
      session,
      `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't1' } })}\n`,
    );
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(1);
    const lines: Record<string, unknown>[] = s.logLines();
    expect(lines.some((l) => l.step === 'send-check-prompt' && l.result === 'prompt_stalled')).toBe(true);
    expect(s.promptCalls()).toHaveLength(2);
  } finally {
    s.clean();
  }
});

// The check turn still working at the bound is logged, and no start prompt is sent.
test('a codex check turn still working at the bound sends no start prompt', async (): Promise<void> => {
  const s: Setup = setup(
    {
      agent: 'codex',
      agent_status: 'idle',
      agent_session: idSession(session, 'herdr:codex'),
      screen_detection_skipped: null,
    },
    {
      promptScript: [{ status: 'idle' }],
      waitScript: [{}],
    },
  );
  try {
    writeRollout(
      s.home,
      session,
      `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't1' } })}\n`,
    );
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(1);
    const lines: Record<string, unknown>[] = s.logLines();
    expect(lines.some((l) => l.step === 'wait-check-end' && l.result === 'turn open')).toBe(true);
    expect(s.promptCalls().filter((args) => args[3] === START)).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Pi happy path through hook authority.
test('pi handover sends reset then start prompt', async (): Promise<void> => {
  const s: Setup = setup(piAuthority, {
    promptScript: [{ session: '/tmp/pi-new.jsonl', status: 'idle' }],
  });
  try {
    const result: RunResult = await s.run({}, pane, piSession, s.log, START);
    expect(result.code).toBe(0);
    const prompts: string[][] = s.promptCalls();
    expect(prompts).toHaveLength(2);
    expect(prompts[0][3]).toBe('/new');
    expect(prompts[1][3]).toBe(START);
  } finally {
    s.clean();
  }
});

// Criterion 6: docs describe the handover step and the new mode entries.
test('docs describe the handover entries and footer wording', (): void => {
  const skill: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/SKILL.md'), 'utf8');
  const shapes: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/assets/shapes.md'), 'utf8');
  const guide: string = readFileSync(resolve(import.meta.dir, '../docs/guide/chart.md'), 'utf8');
  for (const [name, text] of [
    ['SKILL.md', skill],
    ['shapes.md', shapes],
    ['chart.md', guide],
  ] as [string, string][]) {
    expect(text, `${name} names the handover entry`).toContain('handover');
  }
  expect(skill).toContain('continue autopilot (handover');
  expect(shapes).toContain('continue autopilot (handover');
  expect(skill).toContain('handover queued');
  expect(skill).toContain('/clear');
  expect(skill).toContain('/new');
});
