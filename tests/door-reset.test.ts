import { expect, test } from 'bun:test';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  existsSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { quote, spawnCaptured, type SpawnResult } from '../src/shell';
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
  run: (extraEnv?: Record<string, string>, ...args: string[]) => Promise<RunResult>;
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

function writeSessionRecord(home: string, seed: PaneSeed, sess: string, closed: boolean = true): void {
  if (seed.agent === 'claude') writeTranscript(home, sess, closed);
  if (seed.agent === 'codex')
    writeRollout(
      home,
      sess,
      closed
        ? `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't1' } })}\n`
        : `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n`,
    );
  if (seed.agent === 'pi' && seed.agent_session !== undefined && seed.agent_session !== null)
    writeFileSync(
      seed.agent_session.value,
      `${JSON.stringify({ type: 'session', version: 3, id: 'fixture', timestamp: '2026-10-26T00:00:00.000Z' })}\n`,
    );
}

// Operator-input records copied from real sessions on this machine
// (/home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/0218f863-24eb-4467-9613-f9f6f4e21171.jsonl and
// /home/ivan/.claude/projects/-home-ivan-Work/d674fa89-28f3-44d7-acda-5339e3304d30.jsonl,
// /home/ivan/.codex/sessions/2026/10/11/rollout-2026-10-11T19-46-35-01a12c12-d6b0-7d82-aa14-7acddfe4a526.jsonl,
// /home/ivan/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-akrogon-cost-rules--/2026-10-26T10-26-12-959Z_01a177bf-115f-744f-b22d-e9c72f434b49.jsonl,
// all 2026-10-26), fields trimmed to what the parser reads.
const claudeUser: string = JSON.stringify({
  type: 'user',
  message: { role: 'user', content: 'operator text' },
  origin: { kind: 'human' },
  promptSource: 'typed',
});
const claudeQueued: string = JSON.stringify({
  type: 'attachment',
  attachment: { type: 'queued_command', prompt: 'absorbed text', origin: { kind: 'human' } },
});
const claudeToolResult: string = JSON.stringify({
  type: 'user',
  message: { role: 'user', content: [{ type: 'tool_result', content: 'ok' }] },
});
const claudeTaskNotify: string = JSON.stringify({
  type: 'user',
  message: { role: 'user', content: '<task-notification>done</task-notification>' },
  origin: { kind: 'task-notification' },
  promptSource: 'system',
});
const codexTaskStarted: string = JSON.stringify({
  type: 'event_msg',
  payload: { type: 'task_started', turn_id: 't2' },
});
const codexUserMsg: string = JSON.stringify({
  type: 'response_item',
  payload: { type: 'message', role: 'user', content: [{ type: 'text', text: 'mid-run text' }] },
});
const piUserMsg: string = JSON.stringify({
  type: 'message',
  id: 'u1',
  timestamp: '2026-10-26T00:00:01.000Z',
  message: { role: 'user', content: [{ type: 'text', text: 'mid-run text' }] },
});
const piToolResult: string = JSON.stringify({
  type: 'message',
  id: 'tr1',
  timestamp: '2026-10-26T00:00:01.000Z',
  message: { role: 'toolResult', toolCallId: 't:1', toolName: 'read', content: [{ type: 'text', text: 'ok' }] },
});

const claudePane = (sess = session, status = 'idle'): PaneSeed => ({
  agent: 'claude',
  agent_status: status,
  agent_session: idSession(sess, 'herdr:claude'),
});

const codexPane = (sess = session, status = 'idle'): PaneSeed => ({
  agent: 'codex',
  agent_status: status,
  agent_session: idSession(sess, 'herdr:codex'),
  screen_detection_skipped: null,
});

const piPane = (sess: string, status: string): PaneSeed => ({
  agent: 'pi',
  agent_status: status,
  agent_session: { kind: 'path', value: sess, source: 'herdr:pi', agent: 'pi' },
  screen_detection_skipped: true,
});

// A wrapper herdr that records each `agent list` and runs <actions> on the named counts
// (1-based, parent read included), then delegates to fake-herdr.
function wrapLists(s: Setup, actions: string): void {
  const herdr: string = resolve(s.dir, 'bin', 'herdr');
  rmSync(herdr);
  writeFileSync(
    herdr,
    [
      '#!/bin/sh',
      'if [ "$1 $2" = "agent list" ]; then',
      '  echo >> "$FAKE_HERDR.lists"',
      '  N=$(wc -l < "$FAKE_HERDR.lists")',
      actions,
      'fi',
      `exec ${quote(resolve(import.meta.dir, 'fake-herdr.ts'))} "$@"`,
      '',
    ].join('\n'),
    { mode: 0o755 },
  );
}

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
    writeSessionRecord(s.home, seed, sess);
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
    writeTranscript(s.home, 'sess-other', true);
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
  const piDir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-')));
  const piSess: string = resolve(piDir, 'session.jsonl');
  writeFileSync(
    piSess,
    `${JSON.stringify({ type: 'session', version: 3, id: 'fixture', timestamp: '2026-10-26T00:00:00.000Z' })}\n`,
  );
  const s: Setup = setup(piPane(piSess, 'working'));
  try {
    const result: RunResult = await s.run({}, pane, piSess, s.log, START);
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
    // The session changes on the third agent list read: the parent check and the child check see
    // the original identity, the turn wait's first read sees the new one.
    const herdr: string = resolve(s.dir, 'bin', 'herdr');
    rmSync(herdr);
    writeFileSync(
      herdr,
      [
        '#!/bin/sh',
        'if [ "$1 $2" = "agent list" ]; then',
        '  echo >> "$FAKE_HERDR.lists"',
        `  [ "$(wc -l < "$FAKE_HERDR.lists")" -eq 3 ] && sed -i 's/"value":"${session}"/"value":"sess-later"/' "$FAKE_HERDR"`,
        'fi',
        `exec ${quote(resolve(import.meta.dir, 'fake-herdr.ts'))} "$@"`,
        '',
      ].join('\n'),
      { mode: 0o755 },
    );
    const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, session, s.log, START);
    expect(result.code).toBe(1);
    expect(s.logLines().some((l) => l.step === 'wait-turn-end' && l.result === 'identity changed')).toBe(true);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Criterion 4: an unconfirmed reset is logged and no start prompt is sent.
test('unconfirmed reset is logged and no start prompt is sent', async (): Promise<void> => {
  const piDir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-')));
  const piSess: string = resolve(piDir, 'session.jsonl');
  writeFileSync(
    piSess,
    `${JSON.stringify({ type: 'session', version: 3, id: 'fixture', timestamp: '2026-10-26T00:00:00.000Z' })}\n`,
  );
  const s: Setup = setup(piPane(piSess, 'idle'));
  try {
    const result: RunResult = await s.run({}, pane, piSess, s.log, START);
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
  const s: Setup = setup(codexPane(), {
    promptScript: [{ status: 'idle' }],
    waitScript: [{ status: 'done', session: 'sess-new' }],
  });
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
    const s: Setup = setup(codexPane());
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
  const s: Setup = setup(codexPane(), {
    promptScript: [{ status: 'idle' }, { code: 'agent_prompt_stalled' }],
    waitScript: [],
  });
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
  const s: Setup = setup(codexPane(), {
    promptScript: [{ status: 'idle' }],
    waitScript: [{}],
  });
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
  const piDir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-')));
  const piSess: string = resolve(piDir, 'session.jsonl');
  writeFileSync(
    piSess,
    `${JSON.stringify({ type: 'session', version: 3, id: 'fixture', timestamp: '2026-10-26T00:00:00.000Z' })}\n`,
  );
  const s: Setup = setup(piPane(piSess, 'idle'), {
    promptScript: [{ session: '/tmp/pi-new.jsonl', status: 'idle' }],
  });
  try {
    const result: RunResult = await s.run({}, pane, piSess, s.log, START);
    expect(result.code).toBe(0);
    const prompts: string[][] = s.promptCalls();
    expect(prompts).toHaveLength(2);
    expect(prompts[0][3]).toBe('/new');
    expect(prompts[1][3]).toBe(START);
  } finally {
    s.clean();
  }
});

// Criterion 6: the chart-issues skill describes the handover step and the new mode entries.
test('docs describe the handover entries and footer wording', (): void => {
  const skill: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/SKILL.md'), 'utf8');
  const shapes: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/assets/shapes.md'), 'utf8');
  for (const [name, text] of [
    ['SKILL.md', skill],
    ['shapes.md', shapes],
  ] as [string, string][]) {
    expect(text, `${name} names the handover entry`).toContain('handover');
  }
  expect(skill).toContain('continue autopilot (handover');
  expect(shapes).toContain('continue autopilot (handover');
  expect(shapes).toContain('agent_session.value');
  expect(skill).toContain('handover queued');
  expect(skill).toContain('/clear');
  expect(skill).toContain('/new');
  expect(skill).toContain('attended next');
  expect(shapes).toContain('attended next');
  expect(skill).toContain('continue attended (handover');
  expect(shapes).toContain('continue attended (handover');
});

// Criterion 1: operator input recorded after the handover was queued cancels the reset.
// The boundary is the session record's byte length at queue time, so records appended after
// `run()` spawns the child stand for input typed while the handover was queued.
test.each<[string, PaneSeed, string, string]>([
  ['claude user entry', claudePane(), 'claude', claudeUser],
  ['claude queued_command attachment', claudePane(), 'claude', claudeQueued],
  ['codex task_started', codexPane(), 'codex', codexTaskStarted],
  ['codex user message', codexPane(), 'codex', codexUserMsg],
  ['pi user message', piPane('placeholder', 'working'), 'pi', piUserMsg],
])(
  'a %s recorded while the turn wait runs cancels with superseded',
  async (_name: string, seed: PaneSeed, kind: string, record: string): Promise<void> => {
    const piDir: string | null = kind === 'pi' ? registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-'))) : null;
    const sess: string = piDir === null ? session : resolve(piDir, 'session.jsonl');
    const liveSeed: PaneSeed = kind === 'pi' ? piPane(sess, 'working') : seed;
    const s: Setup = setup(liveSeed);
    try {
      writeSessionRecord(s.home, liveSeed, sess, false);
      const recordPath: string =
        kind === 'claude'
          ? resolve(s.home, `.claude/projects/proj/${sess}.jsonl`)
          : kind === 'codex'
            ? resolve(s.home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`)
            : sess;
      wrapLists(s, `[ "$N" -eq 4 ] && echo '${record.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}`);
      const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, sess, s.log, START);
      expect(result.code).toBe(1);
      expect(s.logLines().some((l) => l.step === 'wait-turn-end' && l.result === 'superseded')).toBe(true);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);

// Criterion 1, second timing: input first appearing after the turn end was seen cancels at the
// recheck, the last read before the reset is sent.
test.each<[string, string]>([
  ['claude', claudeUser],
  ['codex', codexUserMsg],
  ['pi', piUserMsg],
])(
  'a %s user input first appearing after the turn end cancels with superseded at the recheck',
  async (kind: string, record: string): Promise<void> => {
    const piDir: string | null = kind === 'pi' ? registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-'))) : null;
    const sess: string = piDir === null ? session : resolve(piDir, 'session.jsonl');
    const seed: PaneSeed = kind === 'pi' ? piPane(sess, 'idle') : kind === 'claude' ? claudePane() : codexPane();
    const s: Setup = setup(seed);
    try {
      writeSessionRecord(s.home, seed, sess);
      const recordPath: string =
        kind === 'claude'
          ? resolve(s.home, `.claude/projects/proj/${sess}.jsonl`)
          : kind === 'codex'
            ? resolve(s.home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`)
            : sess;
      wrapLists(s, `[ "$N" -eq 3 ] && echo '${record.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}`);
      const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, sess, s.log, START);
      expect(result.code).toBe(1);
      expect(s.logLines().some((l) => l.step === 'recheck' && l.result === 'superseded')).toBe(true);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);

// Criterion 1: claude input absorbed into the running turn (a queued_command attachment) cancels.
// Covered by the wait variant above; this is the turn-open form staying a cancel.
test('a claude queued_command absorbed mid-turn cancels with superseded', async (): Promise<void> => {
  const s: Setup = setup(claudePane());
  try {
    writeTranscript(s.home, session, false);
    const recordPath: string = resolve(s.home, `.claude/projects/proj/${session}.jsonl`);
    wrapLists(s, `[ "$N" -eq 4 ] && echo '${claudeQueued.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}`);
    const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, session, s.log, START);
    expect(result.code).toBe(1);
    expect(s.logLines().some((l) => l.result === 'superseded')).toBe(true);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

// Criterion 2: the queuing turn's own records do not cancel. claude tool results and a
// task-notification, then the turn's own end; the reset and start prompt go out as before.
test.each<[string, string, string]>([
  ['claude tool result', 'claude', claudeToolResult],
  ['claude task notification', 'claude', claudeTaskNotify],
  ['codex turn context', 'codex', JSON.stringify({ type: 'turn_context', payload: { model: 'm' } })],
  ['pi tool result', 'pi', piToolResult],
])(
  'a %s record after the queue boundary still sends the reset and start prompt',
  async (name: string, kind: string, record: string): Promise<void> => {
    const piDir: string | null = kind === 'pi' ? registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-'))) : null;
    const sess: string = piDir === null ? session : resolve(piDir, 'session.jsonl');
    const seed: PaneSeed = kind === 'pi' ? piPane(sess, 'idle') : kind === 'claude' ? claudePane() : codexPane();
    const s: Setup = setup(seed, {
      promptScript:
        kind === 'codex'
          ? [{ status: 'idle' }, { session: 'sess-new', status: 'idle' }]
          : kind === 'pi'
            ? [{ session: '/tmp/pi-new.jsonl', status: 'idle' }]
            : [{ session: 'sess-new', status: 'idle' }],
      ...(kind === 'codex' ? { waitScript: [{ status: 'done' }] } : {}),
    });
    try {
      writeSessionRecord(s.home, seed, sess, false);
      const recordPath: string =
        kind === 'claude'
          ? resolve(s.home, `.claude/projects/proj/${sess}.jsonl`)
          : kind === 'codex'
            ? resolve(s.home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`)
            : sess;
      wrapLists(
        s,
        kind === 'claude'
          ? `[ "$N" -eq 3 ] && echo '${record.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}\n  [ "$N" -eq 5 ] && echo '${JSON.stringify({ type: 'system', subtype: 'turn_duration' })}' >> ${quote(recordPath)}`
          : kind === 'codex'
            ? `[ "$N" -eq 3 ] && echo '${record.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}\n  [ "$N" -eq 5 ] && echo '${JSON.stringify({ type: 'event_msg', payload: { type: 'task_complete', turn_id: 't1' } })}' >> ${quote(recordPath)}`
            : `[ "$N" -eq 3 ] && echo '${record.replace(/'/g, `'"'"'`)}' >> ${quote(recordPath)}`,
      );
      const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, sess, s.log, START);
      expect(result.code, name).toBe(0);
      expect(s.logLines().some((l) => l.result === 'superseded')).toBe(false);
      const prompts: string[][] = s.promptCalls();
      expect(prompts[prompts.length - 1][3]).toBe(START);
    } finally {
      s.clean();
    }
  },
);

// Criterion 2, boundary guard: input recorded before the handover was queued does not cancel.
test('claude operator input recorded before the queue boundary still sends the reset', async (): Promise<void> => {
  const s: Setup = setup(claudePane(), {
    promptScript: [{ session: 'sess-new', status: 'idle' }],
  });
  try {
    writeTranscript(s.home, session, false);
    const recordPath: string = resolve(s.home, `.claude/projects/proj/${session}.jsonl`);
    // The earlier operator turn's input then its turn's end, both before the queue point.
    writeFileSync(recordPath, `${claudeUser}\n${JSON.stringify({ type: 'system', subtype: 'turn_duration' })}\n`);
    const result: RunResult = await s.run({}, pane, session, s.log, START);
    expect(result.code).toBe(0);
    expect(s.promptCalls()).toHaveLength(2);
  } finally {
    s.clean();
  }
});

// Criterion 3: an unreadable session record at queue time refuses like an identity mismatch:
// reason on stderr, non-zero exit, nothing sent, no log.
test.each<[string, PaneSeed]>([
  ['claude', claudePane()],
  ['codex', codexPane()],
])(
  'an unreadable %s record at queue time is refused with no log and nothing sent',
  async (_n: string, seed: PaneSeed): Promise<void> => {
    const s: Setup = setup(seed);
    try {
      const result: RunResult = await s.run({}, pane, session, s.log, START);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('refused');
      expect(existsSync(s.log)).toBe(false);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);

test('a missing pi record at queue time is refused with no log and nothing sent', async (): Promise<void> => {
  const s: Setup = setup(piPane(resolve(tmpdir(), 'pi-sess-missing.jsonl'), 'idle'));
  try {
    const result: RunResult = await s.run({}, pane, resolve(tmpdir(), 'pi-sess-missing.jsonl'), s.log, START);
    expect(result.code).toBe(1);
    expect(result.stderr).not.toBe('');
    expect(existsSync(s.log)).toBe(false);
    expect(s.promptCalls()).toHaveLength(0);
  } finally {
    s.clean();
  }
});

test.each(['claude', 'codex', 'pi'])(
  'an existing unreadable %s record at queue time is refused with no log and nothing sent',
  async (kind: string): Promise<void> => {
    const piDir: string | null = kind === 'pi' ? registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-'))) : null;
    const sess: string = piDir === null ? session : resolve(piDir, 'session.jsonl');
    const seed: PaneSeed = kind === 'pi' ? piPane(sess, 'idle') : kind === 'claude' ? claudePane() : codexPane();
    const s: Setup = setup(seed);
    try {
      writeSessionRecord(s.home, seed, sess);
      const recordPath: string =
        kind === 'claude'
          ? resolve(s.home, `.claude/projects/proj/${sess}.jsonl`)
          : kind === 'codex'
            ? resolve(s.home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`)
            : sess;
      chmodSync(recordPath, 0);
      const result: RunResult = await s.run({}, pane, sess, s.log, START);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('EACCES');
      expect(result.stdout).toBe('');
      expect(existsSync(s.log)).toBe(false);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);

// Criterion 3: a record that goes unreadable while waiting logs the reason and sends nothing.
test.each<[string, string]>([
  ['claude', 'claude'],
  ['codex', 'codex'],
  ['pi', 'pi'],
])(
  'a %s record deleted while waiting is logged and nothing is sent',
  async (_n: string, kind: string): Promise<void> => {
    const piDir: string | null = kind === 'pi' ? registerTemp(mkdtempSync(resolve(tmpdir(), 'pi-sess-'))) : null;
    const sess: string = piDir === null ? session : resolve(piDir, 'session.jsonl');
    const seed: PaneSeed = kind === 'pi' ? piPane(sess, 'working') : kind === 'claude' ? claudePane() : codexPane();
    const s: Setup = setup(seed);
    try {
      writeSessionRecord(s.home, seed, sess, false);
      const recordPath: string =
        kind === 'claude'
          ? resolve(s.home, `.claude/projects/proj/${sess}.jsonl`)
          : kind === 'codex'
            ? resolve(s.home, `.codex/sessions/2026/10/17/rollout-2026-10-17T00-00-00-${sess}.jsonl`)
            : sess;
      wrapLists(s, `[ "$N" -eq 4 ] && rm ${quote(recordPath)}`);
      const result: RunResult = await s.run({ DOOR_RESET_TURN_BOUND_MS: '3000' }, pane, sess, s.log, START);
      expect(result.code).toBe(1);
      expect(s.logLines().length).toBeGreaterThan(0);
      expect(s.logLines().some((l) => l.result === 'record unreadable')).toBe(true);
      expect(s.promptCalls()).toHaveLength(0);
    } finally {
      s.clean();
    }
  },
);
