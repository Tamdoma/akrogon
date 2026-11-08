// Criteria 2 and 4 (watcher-on-hc), attended paid run under readiness grants[0] (one harness session,
// the watcher runs at most 4 checks): a Claude watcher terminal in akr-e2e-watch runs this checkout's
// watch-issues skill (project skill under the repo root, user skills not loaded), with the listener
// program run against the session. Observed: the skill labels its terminal at start (check 1), a
// stand-in seat that exits wakes it once and it runs one check and replies (check 2), two ticks queued
// while it works each run their own check (checks 3 and 4, plan Operator decision C2), and stop removes
// the label. Logs under AKROGON_E2E_OUT.
// Run: akrogon run-check --name watch-check -- env AKROGON_E2E=watch-check AKROGON_E2E_WATCHER_MODEL=<model>
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/watch-e2e
//      bun test --timeout=30000 ./tests/e2e/watch-check.e2e.ts
import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { waitFor, type Seen } from '../../src/hc';
import { type SpawnResult } from '../../src/shell';
import { killTree } from '../helpers';
import { answerTrust, required } from './tier';
import { lines, observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const entry: string = resolve(import.meta.dir, '../../src/akrogon.ts');
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
  order: { kind: 'user' | 'bash'; text: string }[];
} {
  const order: { kind: 'user' | 'bash'; text: string }[] = [];
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
        const tool = z
          .object({ type: z.literal('tool_use'), name: z.literal('Bash'), input: z.object({ command: z.string() }) })
          .safeParse(part);
        if (tool.success) order.push({ kind: 'bash', text: tool.data.input.command });
      }
  }
  return {
    user: order.filter((e) => e.kind === 'user').map((e) => e.text),
    bash: order.filter((e) => e.kind === 'bash').map((e) => e.text),
    order,
  };
}

test('watch check: label at start, one check per wake, one check per queued tick, label gone at stop', async () => {
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
  let listener: Bun.Subprocess | null = null;
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
    const seatAddress: string = z
      .object({ terminals: z.array(z.object({ address: z.string(), state: z.string() }).passthrough()) })
      .parse(await tier.rpc('terminal.list', { labels: { 'akrogon.leaf': slug } }))
      .terminals.filter((t) => t.state === 'live')
      .map((t) => t.address)[0];

    listener = Bun.spawn([process.execPath, entry, 'listen'], {
      cwd: tier.root,
      env: tier.akrogonEnv,
      stdout: Bun.file(resolve(tier.out, 'listener.out.log')),
      stderr: Bun.file(resolve(tier.out, 'listener.err.log')),
    });

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
      // the listener's wake.
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

    // Check 1: start labels the terminal for the listener.
    const start = await send(tier, watcher, '/watch-issues');
    expect(await waitFor(session, watcher, (t: Seen) => t.turn > start.turn && idle(t), 600_000)).not.toBeNull();
    tier.record('check-1-screen.txt', (await tier.hc(['read', watcher, '--lines', '80'])).stdout);
    expect((await get(tier, watcher)).labels['akrogon.watch']).toBe('akre2e');

    // Check 2: the seat exits; the listener's wake reaches the watcher once.
    const turnBefore: number = (await get(tier, watcher)).turn;
    expect((await tier.hc(['kill', seatAddress])).code).toBe(0);
    expect(await waitFor(session, watcher, (t: Seen) => t.status?.state === 'working', 120_000)).not.toBeNull();
    // No further automatic wakes: the tick step below is driven by ticks this test sends.
    killTree(listener);
    listener = null;
    // Checks 3 and 4: two ticks queued while the watcher works; Claude Code submits each as its own turn,
    // so the wake and the two ticks end three turns after check 1.
    await send(tier, watcher, `/watch-issues tick ${tier.root}`);
    await send(tier, watcher, `/watch-issues tick ${tier.root}`);
    const { transcriptFor } = await import('../../src/transcript');
    const log: string = z.string().parse(await transcriptFor({ session, address: watcher }));
    expect(await waitFor(session, watcher, (t: Seen) => t.turn >= turnBefore + 3 && idle(t), 900_000)).not.toBeNull();
    tier.record('check-2-3-screen.txt', (await tier.hc(['read', watcher, '--lines', '120'])).stdout);
    const seen = transcript(log);
    tier.record('transcript-summary.json', seen);
    // A slash command is recorded twice (its <command-args> record and the skill expansion), so ticks are
    // counted by their <command-args> record only.
    const tick: string = `<command-args>tick ${tier.root}`;
    const ticks: number = seen.user.filter((text: string) => text.includes(tick)).length;
    expect(ticks).toBe(3);
    const firstTick: number = seen.order.findIndex((e) => e.kind === 'user' && e.text.includes(tick));
    // Every check begins with one `akrogon status`; observe may rerun inside a check after a command error.
    const checks = (from: number): number =>
      seen.order.slice(from).filter((e) => e.kind === 'bash' && /\bakrogon status\b/.test(e.text)).length;
    expect(checks(0)).toBe(4);
    expect(checks(firstTick)).toBe(3);

    // Stop removes the label.
    const stop = await send(tier, watcher, '/watch-issues stop');
    expect(await waitFor(session, watcher, (t: Seen) => t.turn > stop.turn && idle(t), 600_000)).not.toBeNull();
    tier.record('stop-screen.txt', (await tier.hc(['read', watcher, '--lines', '40'])).stdout);
    expect((await get(tier, watcher)).labels['akrogon.watch']).toBeUndefined();
    tier.record('watcher-transcript-path.txt', log);
  } finally {
    if (listener !== null) killTree(listener);
    const left: string[] = await stopWatchTier(tier, [seatCwd]);
    tier.record('watch-check-absence.json', { left });
    expect(left).toEqual([]);
  }
}, 1_800_000);
