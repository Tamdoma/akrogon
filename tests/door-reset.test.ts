// Criterion 3: the chart door's handover reset helper on a real hc core. A is the stand-in
// tests/door-agent.ts emulating claude, codex or pi; the helper is started as A starts it, with
// `hc run --bg --no-notify --rm --no-parent`, while A's turn is still open.
import { test, expect } from 'bun:test';
import { appendFileSync, existsSync, mkdirSync, readFileSync, watch } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { fixture, type Fixture } from './helpers';
import { hcCore, setPrefixes, type HcCore } from './hc-fixture';
import { spawnCaptured, type SpawnResult } from '../src/shell';

const agent: string = resolve(import.meta.dir, 'door-agent.ts');
const helper: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/door-reset.ts');
const STAGES: string[] = [
  'started',
  'wait-turn-end',
  'input-check',
  'reset-keys',
  'warm-up',
  'warm-up-turn-end',
  'code-lookup',
  'differing-path',
  'label',
  'start-prompt',
];

type Kind = 'claude' | 'codex' | 'pi';
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
  z.object({ turnEnd: z.string() }),
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
  setPrefixes(f, { repo: 'rp' });
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
    'rp-door-a',
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

// Starts the helper the way A's last action does and returns its terminal.
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
  expect(waited.code).toBe(0);
  const left = (await run.core.terminals({}, true)).find((t) => t.address === address);
  expect(left === undefined || left.state === 'finished').toBe(true);
}

async function release(run: Run): Promise<void> {
  expect((await spawnCaptured(['sh', '-c', `printf 'go\\n' > ${resolve(run.out, 'release')}`])).code).toBe(0);
}

test.each([
  ['claude', '/clear'],
  ['codex', '/new'],
  ['pi', '/new'],
])(
  '%s: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript',
  async (kind: string, key: string) => {
    const run: Run = await startA(z.enum(['claude', 'codex', 'pi']).parse(kind), 'switch');
    try {
      const start: string = `/chart-issues continue handover 2026-11-08T03:00:00Z door ${run.a} next /charts/next`;
      const address: string = await reset(run, start);
      const began: Step = await logged(run.log, 'started');
      await release(run);
      await exited(run, address);
      const log: Step[] = steps(run.log);
      expect(log.map((s: Step) => s.step)).toEqual(STAGES);
      const code: string = z
        .string()
        .min(1)
        .parse(log.find((s) => s.step === 'warm-up')?.code);
      const found: string = z.string().parse(log.find((s) => s.step === 'code-lookup')?.path);
      const pre: string = z.string().parse(began.pre);
      // The first task was written before the helper started, so it is no operator input past the boundary.
      expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task', key, `reply OK ${code}`, start]);
      // Nothing reached A while a turn was open.
      expect(
        inputs(run)
          .slice(1)
          .filter((r: Received) => r.busy),
      ).toEqual([]);
      expect(found).not.toBe(pre);
      expect(readFileSync(found, 'utf8')).toContain(code);
      // The label held the new path before the start prompt arrived, and still holds it.
      expect(inputs(run).at(-1)?.label).toBe(found);
      expect((await run.core.get(run.a)).labels['akrogon.transcript']).toBe(found);
      // The code lookup ran only after the warm-up turn had ended.
      const turnEnds: string[] = agentLines(run).flatMap((l) => ('turnEnd' in l ? [l.turnEnd] : []));
      const warmEnd: string = z.string().parse(turnEnds[1]);
      const lookup: string = z.string().parse(log.find((s) => s.step === 'code-lookup')?.t);
      expect(Date.parse(lookup)).toBeGreaterThanOrEqual(Date.parse(warmEnd));
    } finally {
      await run.core.stop();
      run.f.clean();
    }
  },
);

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

test('a reset that leaves A on the same transcript stops before the label and the start prompt', async () => {
  const run: Run = await startA('claude', 'noswitch');
  try {
    const address: string = await reset(run, '/chart-issues continue handover t door x next /charts/next');
    await logged(run.log, 'started');
    await release(run);
    await exited(run, address);
    const log: Step[] = steps(run.log);
    expect(log.map((s: Step) => s.step)).toEqual(STAGES.slice(0, STAGES.indexOf('differing-path') + 1));
    expect(log.at(-1)?.result).toBe('same transcript');
    const code: string = z.string().parse(log.find((s) => s.step === 'warm-up')?.code);
    expect(inputs(run).map((r: Received) => r.input)).toEqual(['hold first task', '/clear', `reply OK ${code}`]);
  } finally {
    await run.core.stop();
    run.f.clean();
  }
});
