// Criteria 2 and 4 (watcher-on-hc), attended paid run under readiness grants[0] (one harness session,
// the watcher runs at most 4 checks): a Claude watcher terminal in akr-e2e-watch runs this checkout's
// watch-issues skill (project skill under the repo root, user skills not loaded). Observed: start runs
// one check and creates the cron job (check 1), two ticks queued while it works each run their own check
// (checks 2 and 3, plan Operator decision C2), and a tick that is the first prompt after /clear deletes
// the job and runs no check. Logs under AKROGON_E2E_OUT.
// Run: akrogon run-check --name watch-check -- env AKROGON_E2E=watch-check AKROGON_E2E_WATCHER_MODEL=<model>
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/watch-e2e
//      bun test --timeout=30000 ./tests/e2e/watch-check.e2e.ts
import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { waitFor, type Seen } from '../../src/hc';
import { type SpawnResult } from '../../src/shell';
import { answerTrust, required } from './tier';
import { lines, observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const skill: string = resolve(import.meta.dir, '../../skills/watch-issues');

async function get(tier: WatchTier, address: string) {
  return z
    .object({ address: z.string(), turn: z.number(), labels: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(JSON.parse((await tier.hc(['get', '--json', address])).stdout));
}

async function send(
  tier: WatchTier,
  address: string,
  text: string,
): Promise<{ started: boolean | null; turn: number }> {
  const sent: SpawnResult = await tier.hc(['send', '--json', address, text]);
  if (sent.code !== 0) throw new Error(`hc send failed: ${JSON.stringify(sent)}`);
  return z.object({ started: z.boolean().nullable(), turn: z.number() }).parse(JSON.parse(sent.stdout));
}

const idle = (t: Seen): boolean => t.status?.state === 'idle' || t.status?.state === 'done';

// The watcher's transcript entries: user texts (slash commands carry their args) and Bash commands.
function transcript(path: string): {
  user: string[];
  bash: string[];
  tools: string[];
  order: { kind: 'user' | 'bash'; text: string }[];
} {
  const order: { kind: 'user' | 'bash'; text: string }[] = [];
  const tools: string[] = [];
  for (const line of lines(readFileSync(path, 'utf8'))) {
    const parsed = z
      .object({ type: z.string(), message: z.object({ content: z.unknown() }).passthrough().optional() })
      .passthrough()
      .safeParse(JSON.parse(line));
    if (!parsed.success || parsed.data.message === undefined) continue;
    const content: unknown = parsed.data.message.content;
    if (parsed.data.type === 'user') order.push({ kind: 'user', text: JSON.stringify(content) });
    if (parsed.data.type === 'assistant' && Array.isArray(content))
      for (const part of content) {
        const used = z.object({ type: z.literal('tool_use'), name: z.string() }).safeParse(part);
        if (used.success) tools.push(used.data.name);
        const tool = z
          .object({ type: z.literal('tool_use'), name: z.literal('Bash'), input: z.object({ command: z.string() }) })
          .safeParse(part);
        if (tool.success) order.push({ kind: 'bash', text: tool.data.input.command });
      }
  }
  return {
    user: order.filter((e) => e.kind === 'user').map((e) => e.text),
    bash: order.filter((e) => e.kind === 'bash').map((e) => e.text),
    tools,
    order,
  };
}

test('watch check: one check at start, one check per queued tick, a tick after /clear stops the watch', async () => {
  expect(required('AKROGON_E2E')).toBe('watch-check');
  const model: string = required('AKROGON_E2E_WATCHER_MODEL');
  const slug: string = 'akr-e2e-watch-leaf';
  const seatCwd: string = resolve(required('AKROGON_E2E_ROOT'), slug);
  const tier: WatchTier = await startWatchTier(
    'akr-e2e-watch-claude',
    {
      a: { harness: 'fake', model: 'idle', effort: 'low' },
      b: { harness: 'fake', model: 'idle', effort: 'low' },
    },
    { fake: 'fake --model {model} --effort {effort}' },
  );
  tier.record('watch-check-cwds.json', [tier.root, seatCwd]);
  process.env.XDG_RUNTIME_DIR = tier.runtime;
  try {
    await observeReady(tier);
    mkdirSync(resolve(tier.root, '.claude/skills'), { recursive: true });
    symlinkSync(skill, resolve(tier.root, '.claude/skills/watch-issues'));
    const path: string = resolve(tier.root, 'issues/open/e2e', slug);
    mkdirSync(path, { recursive: true });
    await Bun.write(
      resolve(path, 'state.yaml'),
      Bun.YAML.stringify({ slug, phase: 'plan.synthesis', created: '2026-11-08', repo: 'akre2e', 'blocked-by': [] }),
    );
    // The stand-in seat stays idle (never confirms), so nothing re-prompts it.
    const seated: SpawnResult = await tier.akrogon(['seat', slug, 'A']);
    tier.record('seat-start.txt', `${seated.code}\n${seated.stdout}\n${seated.stderr}`);
    expect(seated.code).toBe(0);
    const run: SpawnResult = await tier.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--name',
      'akr-e2e-watcher',
      '--cwd',
      tier.root,
      '--',
      'env',
      `XDG_RUNTIME_DIR=${tier.runtime}`,
      `PATH=${tier.shimBin}:${tier.corePath}`,
      'claude',
      '--model',
      model,
      '--setting-sources',
      'project,local',
      // Named tools instead of bypass mode: bypass asks for its own acceptance once user settings are not loaded.
      // dontAsk keeps auto mode off: auto mode opens its onboarding dialog after the first turn, which swallows
      // the next prompt.
      '--permission-mode',
      'dontAsk',
      '--allowedTools',
      'Bash,Read,Grep,Glob,CronCreate,CronList,CronDelete',
    ]);
    expect(run.code).toBe(0);
    const watcher: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
    const ready: Promise<Seen | null> = waitFor(session, watcher, idle, 90_000);
    await answerTrust(tier, 'watcher', async () => watcher, 'Yes, I trust this folder', ready);
    expect(await ready).not.toBeNull();

    // Check 1: start runs one check and creates the cron job; the terminal gets no watch label.
    const start = await send(tier, watcher, '/watch-issues');
    expect(await waitFor(session, watcher, (t: Seen) => t.turn > start.turn && idle(t), 600_000)).not.toBeNull();
    tier.record('check-1-screen.txt', (await tier.hc(['read', watcher, '--lines', '80'])).stdout);
    expect((await get(tier, watcher)).labels['akrogon.watch']).toBeUndefined();

    // Checks 2 and 3: two ticks queued while the watcher works; Claude Code submits each as its own turn
    // and runs queued turns back to back, which hc may count as one working span, so the run settles on
    // an idle watcher whose transcript holds both ticks.
    const turnBefore: number = (await get(tier, watcher)).turn;
    await send(tier, watcher, `/watch-issues tick ${tier.root}`);
    await send(tier, watcher, `/watch-issues tick ${tier.root}`);
    const { transcriptFor } = await import('../../src/transcript');
    const log: string = z.string().parse(await transcriptFor({ session, address: watcher }));
    // A slash command is recorded twice (its <command-args> record and the skill expansion), so ticks are
    // counted by their <command-args> record only.
    const tick: string = `<command-args>tick ${tier.root}`;
    const tickCount = (): number => transcript(log).user.filter((text: string) => text.includes(tick)).length;
    expect(
      await waitFor(session, watcher, (t: Seen) => t.turn > turnBefore && idle(t) && tickCount() === 2, 900_000),
    ).not.toBeNull();
    tier.record('check-2-3-screen.txt', (await tier.hc(['read', watcher, '--lines', '120'])).stdout);
    const seen = transcript(log);
    tier.record('transcript-summary.json', seen);
    const firstTick: number = seen.order.findIndex((e) => e.kind === 'user' && e.text.includes(tick));
    // A check is one /watch-issues turn that runs `akrogon status`; a check may read status again later in
    // the same turn (A-F4), so checks are counted per command turn, not per status call.
    const turns: number[] = seen.order.flatMap((e, i: number) =>
      e.kind === 'user' && e.text.includes('<command-name>/watch-issues</command-name>') ? [i] : [],
    );
    const checked: number[] = turns.filter((start: number, n: number) =>
      seen.order
        .slice(start, turns[n + 1] ?? seen.order.length)
        .some((e) => e.kind === 'bash' && /\bakrogon status\b/.test(e.text)),
    );
    expect(checked.length).toBe(3);
    expect(checked.filter((start: number) => start >= firstTick).length).toBe(2);
    expect(seen.tools.filter((name: string) => name === 'CronCreate').length).toBe(1);

    // A tick that is the first prompt after /clear deletes the job and runs no check.
    const cleared = await send(tier, watcher, '/clear');
    expect(await waitFor(session, watcher, (t: Seen) => t.turn > cleared.turn && idle(t), 120_000)).not.toBeNull();
    const after = await send(tier, watcher, `/watch-issues tick ${tier.root}`);
    expect(await waitFor(session, watcher, (t: Seen) => t.turn > after.turn && idle(t), 600_000)).not.toBeNull();
    tier.record('clear-stop-screen.txt', (await tier.hc(['read', watcher, '--lines', '40'])).stdout);
    const fresh: string = z.string().parse(await transcriptFor({ session, address: watcher }));
    expect(fresh).not.toBe(log);
    const stopped = transcript(fresh);
    tier.record('clear-stop-summary.json', stopped);
    expect(stopped.tools.filter((name: string) => name === 'CronDelete').length).toBe(1);
    expect(stopped.bash.some((command: string) => /\bakrogon status\b/.test(command))).toBe(false);
    tier.record('watcher-transcript-path.txt', `${log}\n${fresh}`);
  } finally {
    const left: string[] = await stopWatchTier(tier, [seatCwd]);
    tier.record('watch-check-absence.json', { left });
    expect(left).toEqual([]);
  }
}, 1_800_000);
