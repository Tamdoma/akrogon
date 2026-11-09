// Criterion 3: the chart door's handover reset helper on a real hc core. A is the stand-in
// tests/door-agent.ts emulating claude, codex, pi or agy; the helper is started as A starts it, with
// `hc run --bg --no-notify --rm --no-parent`, while A's turn is still open.
import { test, expect } from 'bun:test';
import { appendFileSync, existsSync, mkdirSync, readFileSync, utimesSync, watch } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { fixture, type Fixture } from './helpers';
import { hcCore, type HcCore } from './hc-fixture';
import { spawnCaptured, type SpawnResult } from '../src/shell';

const agent: string = resolve(import.meta.dir, 'door-agent.ts');
const helper: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/door-reset.ts');
const STAGES: string[] = ['started', 'wait-turn-end', 'input-check', 'reset-keys', 'start-prompt'];

type Kind = 'claude' | 'codex' | 'pi' | 'agy';
type Step = { t: string; step: string; result: string; pre?: string; code?: string; path?: string };
type Received = { input: string; busy: boolean; label: string | null };
type Run = { f: Fixture; core: HcCore; a: string; out: string; log: string };

const stepSchema = z
  .object({
    t: z.string(),
    step: z.string(),
    result: z.string(),
    pre: z.string().optional(),
    code: z.string().optional(),
    path: z.string().optional(),
  })
  .passthrough();
const lineSchema = z.union([
  z.object({ input: z.string(), busy: z.boolean(), label: z.string().nullable() }),
  z.object({ turnEnd: z.string(), transcript: z.string() }),
]);

function lines(path: string): string[] {
  return existsSync(path) ? readFileSync(path, 'utf8').split('\n').filter(Boolean) : [];
}

function steps(log: string): Step[] {
  return lines(log).map((line: string) => stepSchema.parse(JSON.parse(line)));
}

function agentLines(run: Run): z.infer<typeof lineSchema>[] {
  return lines(resolve(run.out, 'inputs.jsonl')).map((line: string) => lineSchema.parse(JSON.parse(line)));
}

function inputs(run: Run): Received[] {
  return agentLines(run).flatMap((l) => ('input' in l ? [l] : []));
}

// The transcript the turn for `input` wrote, once that turn has ended (woken by the folder's change events).
function turnOf(run: Run, input: string, ms: number = 15_000): Promise<string> {
  return new Promise<string>((done, fail) => {
    const check = (): void => {
      const all = agentLines(run);
      const at: number = all.findIndex((l) => 'input' in l && l.input === input);
      const end = all.slice(at + 1).find((l) => 'turnEnd' in l);
      if (at === -1 || end === undefined || !('turnEnd' in end)) return;
      clearTimeout(timer);
      watcher.close();
      done(end.transcript);
    };
    const watcher = watch(run.out, () => check());
    const timer = setTimeout(() => {
      watcher.close();
      fail(new Error(`A never ended a turn for ${input}: ${JSON.stringify(agentLines(run))}`));
    }, ms);
    check();
  });
}

// What chart-issues scripts/transcript.ts prints for A: asked by A itself (the HC_SESSION and HC_TERMINAL_ID
// hc gives A's process, plus the PI_SESSION_FILE pi sets for its tool commands) or from outside.
async function lookup(run: Run, own: Record<string, string> | null): Promise<string> {
  const pid: number = z.number().parse((await run.core.get(run.a)).pid);
  const session: string = z
    .string()
    .parse(
      readFileSync(`/proc/${pid}/environ`, 'utf8')
        .split('\0')
        .find((entry: string) => entry.startsWith('HC_SESSION=')),
    )
    .slice('HC_SESSION='.length);
  const looked: SpawnResult = await spawnCaptured(
    [process.execPath, resolve(import.meta.dir, '../skills/chart-issues/scripts/transcript.ts'), run.a],
    {
      cwd: run.f.root,
      env: {
        ...run.core.env,
        HOME: run.f.home,
        AKROGON_HOME: run.f.home,
        ...(own === null ? {} : { HC_SESSION: session, HC_TERMINAL_ID: run.a, ...own }),
      },
    },
  );
  expect(looked.code).toBe(0);
  return looked.stdout.trim();
}

// Resolves when the helper's log holds `step`, woken by the folder's change events; the timer only bounds it.
function logged(log: string, step: string, ms: number = 15_000): Promise<Step> {
  return new Promise<Step>((done, fail) => {
    const check = (): boolean => {
      const found: Step | undefined = steps(log).find((s: Step) => s.step === step);
      if (found === undefined) return false;
      clearTimeout(timer);
      watcher.close();
      done(found);
      return true;
    };
    const watcher = watch(dirname(log), () => check());
    const timer = setTimeout(() => {
      watcher.close();
      fail(new Error(`helper log ${log} never logged ${step}: ${JSON.stringify(steps(log))}`));
    }, ms);
    check();
  });
}

async function startA(kind: Kind, mode: 'switch' | 'noswitch'): Promise<Run> {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const out: string = resolve(f.home, `door-${kind}`);
  mkdirSync(resolve(out, 'tmp'), { recursive: true });
  expect((await spawnCaptured(['mkfifo', resolve(out, 'release')])).code).toBe(0);
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--name',
    `${f.prefix}-door-a`,
    '--cwd',
    f.root,
    '--',
    'env',
    `HOME=${f.home}`,
    `TMPDIR=${resolve(out, 'tmp')}`,
    process.execPath,
    agent,
    kind,
    mode,
    out,
    ...(kind === 'pi' ? ['--session-id', randomUUID()] : []),
    'hold first task',
  ]);
  expect(started.code).toBe(0);
  const a: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
  await core.waitFor(a, (t) => t.status?.state === 'working');
  return { f, core, a, out, log: resolve(out, 'handover.log') };
}

// Starts the helper the way A's last action does (its output appended to the log) and returns its terminal.
async function reset(run: Run, start: string, env: Record<string, string> = {}): Promise<string> {
  const settings: string[] = Object.entries({
    ...Object.fromEntries(Object.entries(run.core.env).filter(([, v]) => v !== undefined && v !== '')),
    PATH: `${dirname(process.execPath)}:${z.string().parse(run.core.env.PATH)}`,
    AKROGON_HOME: run.f.home,
    HOME: run.f.home,
    ...env,
  }).map(([k, v]) => `${k}=${v}`);
  const started: SpawnResult = await run.core.hc([
    'run',
    '--bg',
    '--json',
    '--no-notify',
    '--rm',
    '--no-parent',
    '--cwd',
    run.f.root,
    '--',
    'sh',
    '-c',
    'log=$1; shift; exec "$@" >>"$log" 2>&1',
    'sh',
    run.log,
    'env',
    ...settings,
    process.execPath,
    helper,
    run.a,
    run.log,
    start,
  ]);
  expect(started.code).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

// Waits on hc until the helper has exited (its --rm terminal is then gone or finished), so its log is
// complete and nothing more can reach A.
async function exited(run: Run, address: string): Promise<void> {
  const waited: SpawnResult = await run.core.hc(['wait', '--json', '--timeout', '15', address]);
  const left = (await run.core.terminals({}, true)).find((t) => t.address === address);
  // --rm removes the terminal at exit; a helper done before wait attaches answers 3 for a gone address.
  expect(waited.code === 0 || waited.code === 3).toBe(true);
  expect(left === undefined || left.state === 'finished').toBe(true);
}

async function release(run: Run): Promise<void> {
  expect((await spawnCaptured(['sh', '-c', `printf 'go\\n' > ${resolve(run.out, 'release')}`])).code).toBe(0);
}

test.each([
  ['claude', '/clear'],
  ['codex', '/new'],
  ['pi', '/new'],
  ['agy', '/clear'],
])(
  '%s: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript',
  async (kind: string, key: string) => {
    const run: Run = await startA(z.enum(['claude', 'codex', 'pi', 'agy']).parse(kind), 'switch');
    try {
      const start: string = `/chart-issues continue handover 2026-11-08T03:00:00Z door ${run.a} next /charts/next`;
      const address: string = await reset(run, start);
      const began: Step = await logged(run.log, 'started');
      await release(run);
      await exited(run, address);
      const log: Step[] = steps(run.log);
      expect(log.map((s: Step) => s.step)).toEqual(STAGES);
      const pre: string = z.string().parse(began.pre);
      // The first task was written before the helper started, so it is no operator input past the boundary.
      expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task', key, start]);
      // Nothing reached A while a turn was open.
      expect(
        inputs(run)
          .slice(1)
          .filter((r: Received) => r.busy),
      ).toEqual([]);
      // The start prompt opened a new conversation, and fresh A's own lookup names it; afterwards an outside
      // lookup agrees (pi's argv still names the first conversation, its published label answers).
      const fresh: string = await turnOf(run, start);
      expect(fresh).not.toBe(pre);
      expect(await lookup(run, kind === 'pi' ? { PI_SESSION_FILE: fresh } : {})).toBe(fresh);
      expect(await lookup(run, null)).toBe(fresh);
    } finally {
      await run.core.stop();
      run.f.clean();
    }
  },
);

test('claude: a label naming a transcript that is gone gives way to the conversation the session record names', async () => {
  const run: Run = await startA('claude', 'switch');
  try {
    const left: string = resolve(run.f.home, '.claude/projects/left-conversation.jsonl');
    expect((await run.core.hc(['label', run.a, `akrogon.transcript=${left}`])).code).toBe(0);
    const address: string = await reset(run, '/chart-issues continue handover t door x next /charts/next');
    const began: Step = await logged(run.log, 'started');
    await release(run);
    await exited(run, address);
    expect(steps(run.log).map((s: Step) => s.step)).toEqual(STAGES);
    const pre: string = z.string().parse(began.pre);
    expect(pre).not.toBe(left);
    expect(readFileSync(pre, 'utf8')).toContain('hold first task');
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

test('claude: a session the record names wins over an older label even before its file is written', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const projects: string = resolve(f.home, '.claude/projects/-repo');
    mkdirSync(projects, { recursive: true });
    mkdirSync(resolve(f.home, '.claude/sessions'), { recursive: true });
    const old: string = resolve(projects, 'old-conversation.jsonl');
    appendFileSync(old, '{}\n');
    // A claude stand-in: its record names conversation "new", whose file does not exist yet.
    const record: string =
      'printf \'{"sessionId":"new","procStart":"%s"}\' "$(awk \'{print $22}\' /proc/$$/stat)" > "$HOME/.claude/sessions/$$.json"; exec sleep 300';
    const started: SpawnResult = await core.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--cwd',
      f.root,
      '--',
      'env',
      `HOME=${f.home}`,
      'sh',
      '-c',
      record,
    ]);
    expect(started.code).toBe(0);
    const a: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
    const pid: number = z.number().parse((await core.get(a)).pid);
    const recordPath: string = resolve(f.home, '.claude/sessions', `${pid}.json`);
    await new Promise<void>((done) => {
      const poll = (): unknown =>
        existsSync(recordPath) && readFileSync(recordPath, 'utf8').includes('procStart')
          ? done()
          : setTimeout(poll, 20);
      poll();
    });
    expect((await core.hc(['label', a, `akrogon.transcript=${old}`])).code).toBe(0);
    const lookup = async (): Promise<string> =>
      (
        await spawnCaptured(
          [process.execPath, resolve(import.meta.dir, '../skills/chart-issues/scripts/transcript.ts'), a],
          { cwd: f.root, env: { ...core.env, HOME: f.home, AKROGON_HOME: f.home } },
        )
      ).stdout.trim();
    expect(await lookup()).toBe('-');
    expect((await core.get(a)).labels['akrogon.transcript']).toBe(old);
    const current: string = resolve(projects, 'new.jsonl');
    appendFileSync(current, '{}\n');
    expect(await lookup()).toBe(current);
    expect((await core.get(a)).labels['akrogon.transcript']).toBe(current);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('pi: a label older than the conversation pi started with, or a pi file from another session, does not answer for it', async () => {
  const run: Run = await startA('pi', 'switch');
  try {
    const folder: string = resolve(run.f.home, '.pi/agent/sessions', `--${run.f.root.replace(/[/.]/g, '-')}--`);
    // 'working' is reported before the agent opens its first transcript, so the folder may not exist yet.
    mkdirSync(folder, { recursive: true });
    const left: string = resolve(folder, `1_${randomUUID()}.jsonl`);
    appendFileSync(left, '{}\n');
    utimesSync(left, new Date(0), new Date(0));
    expect((await run.core.hc(['label', run.a, `akrogon.transcript=${left}`])).code).toBe(0);
    const started: string = await lookup(run, null);
    expect(started).not.toBe(left);
    expect(readFileSync(started, 'utf8')).toContain('hold first task');
    // The same address in another hc session is another terminal: its pi file is not this seat's.
    expect(await lookup(run, { HC_SESSION: 'elsewhere', PI_SESSION_FILE: left })).toBe(started);
    expect((await run.core.get(run.a)).labels['akrogon.transcript']).toBe(started);
    utimesSync(left, new Date(), new Date(Date.now() + 60_000));
    expect((await run.core.hc(['label', run.a, `akrogon.transcript=${left}`])).code).toBe(0);
    expect(await lookup(run, null)).toBe(left);
  } finally {
    await release(run);
    await run.core.stop();
    run.f.clean();
  }
});

test('a helper that fails before its first stage leaves its error in the log', async () => {
  const run: Run = await startA('claude', 'switch');
  try {
    await exited(run, await reset(run, ''));
    expect(readFileSync(run.log, 'utf8')).toMatch(/too_small|ZodError/);
    expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task']);
  } finally {
    await release(run);
    await run.core.stop();
    run.f.clean();
  }
});

test('an operator input record in A transcript after the helper started cancels the reset with nothing sent', async () => {
  const run: Run = await startA('claude', 'switch');
  try {
    const address: string = await reset(run, '/chart-issues continue handover t door x next /charts/next');
    const began: Step = await logged(run.log, 'started');
    appendFileSync(
      z.string().parse(began.pre),
      `${JSON.stringify({ type: 'user', origin: { kind: 'human' }, message: { role: 'user', content: 'wait' } })}\n`,
    );
    await release(run);
    await exited(run, address);
    expect(steps(run.log).map((s: Step) => [s.step, s.result])).toEqual([
      ['started', expect.any(String)],
      ['wait-turn-end', expect.any(String)],
      ['input-check', 'superseded'],
    ]);
    expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task']);
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

test('the helper sends nothing while A turn stays open past the bound', async () => {
  const run: Run = await startA('claude', 'switch');
  try {
    const address: string = await reset(run, '/chart-issues continue handover t door x next /charts/next', {
      DOOR_RESET_TURN_BOUND_MS: '1500',
    });
    await exited(run, address);
    expect(steps(run.log).map((s: Step) => [s.step, s.result])).toEqual([
      ['started', expect.any(String)],
      ['wait-turn-end', 'turn open'],
    ]);
    expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task']);
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});

test('a reset that leaves A on the same transcript lands the start prompt there, where A own lookup names the entry path', async () => {
  const run: Run = await startA('claude', 'noswitch');
  try {
    const start: string = '/chart-issues continue handover t door x next /charts/next';
    const address: string = await reset(run, start);
    const began: Step = await logged(run.log, 'started');
    await release(run);
    await exited(run, address);
    expect(steps(run.log).map((s: Step) => s.step)).toEqual(STAGES);
    expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task', '/clear', start]);
    const pre: string = z.string().parse(began.pre);
    // The receiving session's check (chart-issues SKILL.md) compares this answer with the entry and stops.
    expect(await turnOf(run, start)).toBe(pre);
    expect(await lookup(run, {})).toBe(pre);
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});
