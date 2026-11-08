// Criterion 3 (watcher-on-hc), attended paid run under readiness grants[0] (at most 4 harness sessions
// in all, at most 4 prompts per stop-check session): one real seat of AKROGON_E2E_KIND (codex or agy)
// works on a long shell command; the watcher's busy-rule stop is applied and its outcome, screens,
// transcript label and corrective send are recorded under AKROGON_E2E_OUT for the skill's stop keys.
// Run: akrogon run-check --name watch-stop-<kind> -- env AKROGON_E2E=watch-stop AKROGON_E2E_KIND=<kind>
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/watch-e2e
//      bun test --timeout=30000 ./tests/e2e/watch-stop.e2e.ts
// Prompts per session: the first task (argv, or agy's first send) and one corrective send.
import { test, expect } from 'bun:test';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { type SpawnResult } from '../../src/shell';
import { answerTrust, required } from './tier';
import { observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const kinds = {
  codex: {
    line: 'codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access',
    model: 'gpt-6.1-sol',
    trust: 'Trust and continue',
  },
  agy: { line: 'agy --model {model} --effort {effort} --mode auto', model: 'gemini-3.8-flash-low', trust: null },
} as const;

const terminalSchema = z.object({
  address: z.string(),
  state: z.string(),
  turn: z.number(),
  reported: z.boolean().default(false),
  pid: z.number().nullable().default(null),
  labels: z.record(z.string(), z.string()),
  status: z.object({ state: z.string() }).passthrough().nullable(),
  foreground: z
    .object({ argv: z.array(z.string()) })
    .passthrough()
    .nullable()
    .default(null),
});
type Seen = z.infer<typeof terminalSchema>;

async function get(tier: WatchTier, address: string): Promise<Seen> {
  return terminalSchema.parse(JSON.parse((await tier.hc(['get', '--json', address])).stdout));
}

async function liveSeat(tier: WatchTier, slug: string): Promise<string | null> {
  const live = z
    .object({ terminals: z.array(terminalSchema) })
    .parse(await tier.rpc('terminal.list', { labels: { 'akrogon.leaf': slug } }))
    .terminals.filter((t) => t.state === 'live');
  return live.length === 1 ? live[0].address : null;
}

// The seat's process tree from /proc (one read): the argv of every descendant of `root`.
function descendants(root: number): string[] {
  const procs: { pid: number; ppid: number; argv: string }[] = readdirSync('/proc')
    .filter((name: string) => /^\d+$/.test(name))
    .flatMap((name: string) => {
      try {
        const stat: string = readFileSync(`/proc/${name}/stat`, 'utf8');
        const ppid: number = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
        const argv: string = readFileSync(`/proc/${name}/cmdline`, 'utf8').split('\0').join(' ').trim();
        return [{ pid: Number(name), ppid, argv }];
      } catch (error) {
        // A process that exits between the listing and the read is gone, not an error.
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' || (error as NodeJS.ErrnoException).code === 'ESRCH')
          return [];
        throw error;
      }
    });
  const found: Set<number> = new Set([root]);
  for (let grown: boolean = true; grown;) {
    grown = false;
    for (const p of procs)
      if (!found.has(p.pid) && found.has(p.ppid)) {
        found.add(p.pid);
        grown = true;
      }
  }
  return procs.filter((p) => p.pid !== root && found.has(p.pid)).map((p) => p.argv);
}

// Bounded by hc's own wait (event-driven), never a sleep.
async function turnEnded(tier: WatchTier, address: string, turn: number): Promise<Seen> {
  for (let attempt: number = 0; attempt < 10; attempt += 1) {
    const current: Seen = await get(tier, address);
    if (current.turn >= turn && current.status?.state !== 'working') return current;
    await tier.hc(['wait', address, '--timeout', '60']);
  }
  throw new Error(`${address} did not finish turn ${turn}`);
}

test('watch stop: a working seat stops on its stop key, ends idle and takes one corrective send, or is recorded notify-only', async () => {
  expect(required('AKROGON_E2E')).toBe('watch-stop');
  const kind = z.enum(['codex', 'agy']).parse(required('AKROGON_E2E_KIND'));
  const spec = kinds[kind];
  const slug: string = `akr-e2e-watch-${kind}`;
  const cwd: string = resolve(required('AKROGON_E2E_ROOT'), slug);
  const tier: WatchTier = await startWatchTier(
    `akr-e2e-watch-${kind}-root`,
    {
      a: { harness: kind, model: spec.model, effort: 'low' },
      b: { harness: kind, model: spec.model, effort: 'low' },
    },
    { [kind]: spec.line },
  );
  tier.record(`${kind}-cwd.json`, [cwd]);
  // transcriptFor runs in this process and must find akr-e2e-watch where akrogon finds it.
  process.env.XDG_RUNTIME_DIR = tier.runtime;
  try {
    await observeReady(tier);
    const path: string = resolve(tier.root, 'issues/open/e2e', slug);
    mkdirSync(path, { recursive: true });
    await Bun.write(
      resolve(path, 'state.yaml'),
      Bun.YAML.stringify({ slug, phase: 'plan.synthesis', created: '2026-11-08', repo: 'akre2e', 'blocked-by': [] }),
    );
    const task: string = 'Run exactly this shell command in the foreground and wait for it to finish: sleep 600';
    const starting: Promise<SpawnResult> = tier.akrogon(['seat', slug, 'A', '--task', task]);
    if (spec.trust !== null) await answerTrust(tier, kind, () => liveSeat(tier, slug), spec.trust, starting);
    const started: SpawnResult = await starting;
    tier.record(`${kind}-start.txt`, `${started.code}\n${started.stdout}\n${started.stderr}`);
    expect(started.code).toBe(0);
    const address: string = z.string().parse(await liveSeat(tier, slug));
    // The seat is on the long command: hc waits for the harness's tool-running line on the screen
    // (event-driven, bounded; the task text itself names `sleep 600`, so that text proves nothing), and
    // the seat's process tree must hold the command.
    const shown: SpawnResult = await tier.hc(['wait', address, '--output', 'Running', '--timeout', '180']);
    tier.record(`${kind}-on-command.txt`, `${shown.code}\n${shown.stdout}\n${shown.stderr}`);
    const before: Seen = await get(tier, address);
    const tree: string[] = descendants(z.number().parse(before.pid));
    tier.record(`${kind}-tree.json`, tree);
    expect(tree.some((argv: string) => /(^|\s|\/)sleep 600$/.test(argv))).toBe(true);
    tier.record(`${kind}-before.json`, before);
    tier.record(`${kind}-before-screen.txt`, (await tier.hc(['read', address])).stdout);
    expect(before.status?.state).toBe('working');
    const { transcriptFor } = await import('../../src/transcript');
    const log: string | null = await transcriptFor({ session, address });
    tier.record(`${kind}-transcript.txt`, String(log));

    // hc interrupt presses esc for a program that reports status, else ctrl+c; the watcher never
    // presses ctrl+c, so a seat that never reported gets `hc keys esc` instead.
    let stoppedBy: 'interrupt' | 'esc' | null = null;
    if (before.reported) {
      const interrupted: SpawnResult = await tier.hc(['interrupt', '--json', address]);
      tier.record(`${kind}-interrupt.json`, `${interrupted.code}\n${interrupted.stdout}\n${interrupted.stderr}`);
      const outcome = z.object({ key: z.string(), outcome: z.string() }).parse(JSON.parse(interrupted.stdout));
      if (outcome.outcome === 'stopped') stoppedBy = 'interrupt';
    }
    if (stoppedBy === null) {
      expect((await tier.hc(['keys', address, 'esc'])).code).toBe(0);
      await tier.hc(['wait', address, '--timeout', '10']);
      if ((await get(tier, address)).status?.state !== 'working') stoppedBy = 'esc';
    }
    const after: Seen = await get(tier, address);
    const screen: string = (await tier.hc(['read', address])).stdout;
    tier.record(`${kind}-after.json`, after);
    tier.record(`${kind}-after-screen.txt`, screen);
    tier.record(`${kind}-result.json`, { kind, stoppedBy, reported: before.reported, transcript: log });
    if (stoppedBy === null) {
      // Neither key stops this kind: the skill records it notify-only with this screen.
      expect(screen.trim()).not.toBe('');
      return;
    }
    expect(after.state).toBe('live');
    expect(after.address).toBe(address);
    expect(['idle', 'done']).toContain(z.string().parse(after.status?.state));
    expect(log).not.toBeNull();
    expect(after.labels['akrogon.transcript']).toBe(z.string().parse(log));
    const corrected: SpawnResult = await tier.hc([
      'send',
      '--json',
      address,
      'That command was stopped on purpose; do not run it again. Reply with the single word ok.',
    ]);
    tier.record(`${kind}-corrective.json`, `${corrected.code}\n${corrected.stdout}\n${corrected.stderr}`);
    const sent = z.object({ started: z.boolean().nullable(), turn: z.number() }).parse(JSON.parse(corrected.stdout));
    expect(sent.started).toBe(true);
    await turnEnded(tier, address, sent.turn + 1);
    tier.record(`${kind}-final-screen.txt`, (await tier.hc(['read', address])).stdout);
  } finally {
    const left: string[] = await stopWatchTier(tier, [cwd]);
    tier.record(`${kind}-absence.json`, { left });
    expect(left).toEqual([]);
  }
}, 1_800_000);
