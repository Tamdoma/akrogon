// watch-consults criteria 1-2, the paid attended run under readiness grants[0] (at most 6
// harness sessions for the leaf, watchers and consultants each counted, each ending within 15
// minutes): a real watcher in the akr-e2e-watch tier meets a staged notify-only failure
// (failed=blocked@check.review after two unproductive cycles, a base-red repo check), starts
// its consultant with `akrogon seat --watch-consultant` from the machine slots.consultant
// recipe, exchanges a turn file over hc send inside its own turn, lets the consultant fix the
// base and push fast-forward, resumes the leaf with `akrogon phase` + `akrogon next`, writes
// the case record and its signature, notices the push and the move non-attention, and closes
// the consultant.
// Sessions per run: watcher (pi), consultant (agy neon high, the N2 default recipe), the
// resumed leaf's seat A (codex) — 3, leaving 3.
// Run: akrogon run-check --name watch-consults -- env AKROGON_E2E=watch-consults
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/watch-consults-e2e
//      WATCH_TICK_SECONDS=15
//      bun test --timeout=720000 ./tests/e2e/watch-consults.e2e.ts
import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import { waitFor, type Seen } from '../../src/hc';
import { command, spawnCaptured, type SpawnResult } from '../../src/shell';
import { transcriptFor } from '../../src/transcript';
import { answerTrust, realHome, required } from './tier';
import { observeReady, session, startWatchTier, stopWatchTier, type WatchTier } from './watch-tier';

const skill: string = resolve(import.meta.dir, '../../skills/watch-issues');
const intervalSec: number = Number(process.env.WATCH_TICK_SECONDS ?? '15');
const leafTemp: string = realpathSync(required('AKROGON_E2E_ROOT'));
process.env.AKROGON_E2E_ROOT = leafTemp;

const termSchema = z.object({
  address: z.string(),
  name: z.string().nullable().default(null),
  state: z.string(),
  turn: z.number().int().default(0),
  pid: z.number().int().nullable().default(null),
  parent: z.string().nullable().default(null),
  labels: z.record(z.string(), z.string()),
  argv: z.array(z.string()).nullable().default(null),
  foreground: z
    .object({ pid: z.number(), argv: z.array(z.string()).default([]) })
    .passthrough()
    .nullable()
    .default(null),
  status: z.object({ state: z.string() }).passthrough().nullable().default(null),
});
type Term = z.infer<typeof termSchema>;

async function get(tier: WatchTier, address: string): Promise<Term> {
  const reply: SpawnResult = await tier.hc(['get', '--json', address]);
  if (reply.code !== 0) throw new Error(`hc get ${address}: ${reply.stderr}`);
  return termSchema.parse(JSON.parse(reply.stdout));
}

const gone = async (tier: WatchTier, address: string): Promise<boolean> =>
  (await tier.hc(['get', '--json', address])).code !== 0;

const screen = async (tier: WatchTier, address: string, n: number = 80): Promise<string> =>
  (await tier.hc(['read', address, '--lines', String(n)])).stdout;

async function send(tier: WatchTier, address: string, text: string): Promise<void> {
  const sent: SpawnResult = await tier.hc(['send', '--json', address, text]);
  expect(sent.code).toBe(0);
}

async function waitLabelled(tier: WatchTier, labels: Record<string, string>, ms: number): Promise<Term | null> {
  const deadline: number = Date.now() + ms;
  while (Date.now() < deadline) {
    const listed = z
      .object({ terminals: z.array(termSchema) })
      .parse(await tier.rpc('terminal.list', { all: true, labels }));
    const live: Term[] = listed.terminals.filter((t) => t.state === 'live');
    if (live.length > 0) return live[0];
    await Bun.sleep(1000);
  }
  return null;
}

function statePhase(root: string, slug: string): string {
  const file: string = resolve(root, 'issues/open/e2e', slug, 'state.yaml');
  return z.object({ phase: z.string() }).parse(Bun.YAML.parse(readFileSync(file, 'utf8'))).phase;
}

function notices(scratch: string): { title: string; body: string; attention: boolean }[] {
  const folder: string = resolve(scratch, '.config/herdr-app-sessions', session, 'akrogon-notices');
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) =>
      z
        .object({ title: z.string(), body: z.string(), attention: z.boolean() })
        .parse(JSON.parse(readFileSync(resolve(folder, f), 'utf8'))),
    );
}

// The staged notify-only failure: `check.review -> failed` happened, two unproductive
// `failed -> check.review -> failed` cycles followed, so today's Judge only notifies.
const SLUG: string = 'watch-consult-leaf';
async function stageLeaf(tier: WatchTier, worktrees: string): Promise<void> {
  const leafPath: string = resolve(tier.root, 'issues/open/e2e', SLUG);
  mkdirSync(leafPath, { recursive: true });
  await command(['git', 'worktree', 'add', '--detach', resolve(worktrees, SLUG), 'main'], tier.root);
  const state: Record<string, unknown> = {
    slug: SLUG,
    phase: 'failed',
    created: '2026-11-21',
    repo: 'akre2e',
    'blocked-by': [],
    worktree: resolve(worktrees, SLUG),
    fix_rounds: 1,
    failure: {
      cause: 'blocked',
      phase: 'check.review',
      slot: 'A',
      reason: 'merge verify red on main: test fails (BROKEN marker on main)',
    },
  };
  writeFileSync(resolve(leafPath, 'state.yaml'), Bun.YAML.stringify(state));
  const head: string = (
    await spawnCaptured(['git', 'rev-parse', 'HEAD'], { cwd: resolve(worktrees, SLUG) })
  ).stdout.trim();
  const line = (from: string, to: string): string =>
    JSON.stringify({
      ts: '2026-11-21T18:00:00.000Z',
      repo: 'akre2e',
      slug: SLUG,
      from,
      to,
      slot: 'A',
      attempts: { A: 0, B: 0 },
      fix_rounds: 1,
      verdict: {},
      head,
      diff: '',
      session: null,
    });
  writeFileSync(
    resolve(tier.root, 'issues/log.jsonl'),
    [
      line('failed', 'check.review'),
      line('check.review', 'failed'),
      line('failed', 'check.review'),
      line('check.review', 'failed'),
    ].join('\n') + '\n',
  );
}

test.serial(
  'watch consults: a notify-only failure consults, fixes the base and resumes the leaf',
  async () => {
    expect(required('AKROGON_E2E')).toBe('watch-consults');
    // The session budget (grant bound): each paid session is ended by teardown; the run
    // itself must finish inside 15 minutes per session.
    const deadline: number = Date.now() + 14 * 60_000;
    const name: string = 'akr-e2e-watch-consults';
    const tier: WatchTier = await startWatchTier(
      name,
      {
        a: { harness: 'codex', model: 'gpt-6.1-sol', effort: 'low' },
        b: { harness: 'codex', model: 'gpt-6.1-sol', effort: 'low' },
        consultant: { harness: 'agy', model: 'neon', effort: 'high' },
      },
      {
        codex: 'codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access',
        agy: 'agy --model {model} --effort {effort} --mode auto',
        pi: 'pi --model {model} --thinking {effort} -a --exclude-tools request_user_input',
      },
      {
        startProofMs: 60_000,
        // The staged base red: the repo's checks and one merge_check share the BROKEN gate.
        repoConfig: {
          checks: { test: "sh -c 'test ! -f BROKEN'" },
          merge_checks: { merge: "sh -c 'test ! -f BROKEN'" },
        },
      },
    );
    const scratch: string = resolve(leafTemp, `${name}-scratch`);
    const worktrees: string = resolve(leafTemp, `${name}-wtr`);
    try {
      await observeReady(tier);
      // The leaf's skill copy must be the only watch-issues pi sees.
      mkdirSync(resolve(tier.root, '.pi/skills'), { recursive: true });
      symlinkSync(skill, resolve(tier.root, '.pi/skills/watch-issues'));
      // Stage the base red and the failed leaf.
      writeFileSync(resolve(tier.root, 'BROKEN'), 'staged base red\n');
      await command(['git', 'add', 'BROKEN'], tier.root);
      await command(['git', 'commit', '-m', 'stage base red'], tier.root);
      await command(['git', 'push', 'origin', 'HEAD:main'], tier.root);
      await stageLeaf(tier, worktrees);
      tier.record(
        'staged.txt',
        `base=${(await spawnCaptured(['git', 'rev-parse', 'origin/main'], { cwd: tier.root })).stdout.trim()}\n`,
      );

      // The watcher session (pi, low): the leaf's skill copy plus its scripts on PATH, then
      // `watch-issues <root>` starts the timer.
      const watcherEnv: string[] = [
        `XDG_RUNTIME_DIR=${tier.runtime}`,
        `HOME=${realHome}`,
        `PATH=${tier.shimBin}:${dirname(process.execPath)}:${z.string().parse(process.env.PATH)}`,
        `DBUS_SESSION_BUS_ADDRESS=unix:path=${tier.runtime}/bus`,
        // The watcher's own consults.ts calls globalHome() directly — the akrogon shim's
        // AKROGON_HOME only covers akrogon processes; without it case folders land in the
        // real ~/.akrogon.
        `AKROGON_HOME=${z.string().parse(tier.akrogonEnv.AKROGON_HOME)}`,
        `WATCH_TICK_SECONDS=${intervalSec}`,
        `AKROGON_E2E_ROOT=${leafTemp}`,
      ];
      const run: SpawnResult = await tier.hc([
        'run',
        '--bg',
        '--json',
        '--name',
        'akr-e2e-watcher',
        '--cwd',
        tier.root,
        '--',
        '/usr/bin/env',
        ...watcherEnv,
        'pi',
        '--model',
        'devin/swe-2-max',
        '--thinking',
        'low',
        '-a',
        '--exclude-tools',
        'request_user_input',
        '--no-skills',
        '--skill',
        skill,
      ]);
      expect(run.code).toBe(0);
      const watcher: string = z.object({ address: z.string() }).parse(JSON.parse(run.stdout)).address;
      tier.record('cwds.json', [tier.root, leafTemp]);
      // src/hc calls from this process (waitFor, transcriptFor) resolve the session socket
      // under our own XDG_RUNTIME_DIR — point it at the tier's, as watch-live's startCell does.
      process.env.XDG_RUNTIME_DIR = tier.runtime;
      // pi must be listening before the task lands: a send before its idle state sits
      // unsubmitted in the input line (plan-red run and the first lane run both lost it).
      const ready: Seen | null = await waitFor(
        session,
        watcher,
        (t: Seen) => t.status?.state === 'idle' || t.status?.state === 'done',
        120_000,
      );
      expect(ready, `watcher never idle; screen:\n${await screen(tier, watcher)}`).not.toBeNull();
      await send(tier, watcher, `watch-issues ${tier.root}`);

      // The consult: the consultant terminal appears under the verified name and labels.
      const consultant: Term | null = await waitLabelled(
        tier,
        { 'akrogon.watch-consult': 'akre2e' },
        Math.min(
          Number(process.env.AKROGON_E2E_CONSULT_WAIT_MS ?? '420000'),
          Math.max(60_000, deadline - Date.now() - 8 * 60_000),
        ),
      );
      expect(consultant, `no consultant started; watcher screen:\n${await screen(tier, watcher)}`).not.toBeNull();
      expect(consultant!.name).toBe('aw-watch-consult');
      expect(consultant!.parent).toBe(watcher);
      expect(consultant!.labels['akrogon.repo']).toBe('akre2e');
      tier.record('consultant.json', consultant);

      // The fix lands: the leaf resumes out of failed and the consultant is closed.
      const resumed: string[] = ['check.fix', 'check.review', 'check.repair'];
      while (!resumed.includes(statePhase(tier.root, SLUG)) && Date.now() < deadline) await Bun.sleep(5000);
      const phase: string = statePhase(tier.root, SLUG);
      tier.record('watcher-screen.txt', await screen(tier, watcher, 200));
      tier.record('watcher-transcript.txt', (await transcriptFor({ session, address: watcher })) ?? 'none');
      expect(resumed).toContain(phase);

      // The leaf's seat A starts on the resumed phase (akrogon next dispatched it); answer its
      // folder-trust dialog so the start proof — which the watcher's turn is inside — returns
      // quickly instead of holding the proof window.
      const seat: Term | null = await waitLabelled(
        tier,
        { 'akrogon.leaf': SLUG, 'akrogon.seat': 'a' },
        Math.min(180_000, Math.max(30_000, deadline - Date.now() - 150_000)),
      );
      tier.record('seat.json', seat);
      expect(seat, `no leaf seat after resume to ${phase}`).not.toBeNull();
      await answerTrust(tier, 'codex-seat', async () => seat!.address, 'Trust and continue', Bun.sleep(90_000));

      // The case close trails the resume: the watcher's turn finishes `next`, then closes the
      // consultant (hc kill + rm) on the same beat.
      const closed: Term | null = await waitLabelled(
        tier,
        { 'akrogon.watch-consult': 'akre2e' },
        Math.min(180_000, Math.max(15_000, deadline - Date.now() - 90_000)),
      );
      expect(closed, `consultant still live after resume\n${await screen(tier, watcher, 60)}`).toBeNull();

      // The case record: folder under <AKROGON_HOME>/watch/<repo>/consults/<case-id>/,
      // signature parses, the recorded turn files exist, the pushed base is fast-forward.
      const consults: string = resolve(leafTemp, `${name}-home`, 'watch/akre2e/consults');
      const cases: string[] = readdirSync(consults);
      expect(cases.length).toBe(1);
      const caseDir: string = resolve(consults, cases[0]);
      tier.record('case-listing.txt', readdirSync(caseDir).join('\n'));
      for (const file of ['brief.md', 'signature.json', 'case.md'])
        expect(existsSync(resolve(caseDir, file)), `missing ${file}`).toBe(true);
      const signature = z
        .object({
          anchor: z.string().min(1),
          cause: z.string(),
          phase: z.string(),
          command: z.string(),
          base: z.string().regex(/^[0-9a-f]{40}$/),
          heads: z.record(z.string(), z.string()),
        })
        .parse(JSON.parse(readFileSync(resolve(caseDir, 'signature.json'), 'utf8')));
      tier.record('case-signature.json', signature);
      for (const turn of readdirSync(caseDir).filter((f) => f.startsWith('turn-')))
        tier.record(`case-${turn}`, readFileSync(resolve(caseDir, turn), 'utf8'));
      tier.record('case-brief.md', readFileSync(resolve(caseDir, 'brief.md'), 'utf8'));
      tier.record('case-case.md', readFileSync(resolve(caseDir, 'case.md'), 'utf8'));
      expect(signature.anchor).toBe(SLUG);
      const turns: string[] = readdirSync(caseDir).filter((f) => /^turn-\d+-(watch|consultant)\.md$/.test(f));
      expect(turns.some((f) => f.includes('watch'))).toBe(true);
      expect(turns.some((f) => f.includes('consultant'))).toBe(true);
      const baseLog: SpawnResult = await spawnCaptured(['git', 'log', '--oneline', '-5', 'origin/main'], {
        cwd: tier.root,
      });
      tier.record('base-log.txt', baseLog.stdout);
      expect(baseLog.stdout).toContain('stage base red'); // the fix pushed fast-forward on top

      // Notices: at least one non-attention notice (push/move), none attention.
      const seen = notices(scratch);
      tier.record('notices.json', seen);
      expect(seen.length).toBeGreaterThanOrEqual(1);
      expect(seen.every((n) => n.attention === false)).toBe(true);

      const left: string[] = await stopWatchTier(tier, [leafTemp]);
      tier.record('absence.json', { left });
      expect(left).toEqual([]);
    } catch (error) {
      try {
        const listed = z
          .object({ terminals: z.array(termSchema) })
          .parse(await tier.rpc('terminal.list', { all: true, labels: {} }));
        for (const t of listed.terminals) tier.record(`screen-${t.address}.txt`, await screen(tier, t.address, 120));
      } catch {}
      await stopWatchTier(tier, [leafTemp]).catch(() => {});
      throw error;
    }
  },
  780_000,
);
