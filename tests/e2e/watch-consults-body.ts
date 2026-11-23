// The watch-consults body: tests/e2e/watch-consults.e2e.ts runs this file as one process inside the
// run's own slice and judges it from outside. Everything it starts (the core, the watcher, each
// consultant, any launch or replacement core) stays in that slice, so the judge ends them all with one
// cgroup kill. Since the kill can come at any moment, the body writes what the judge needs to <out> as
// it goes: stage.txt after each stage, red.txt the moment a check fails (before any screen is read),
// and in paid-starts.jsonl one line per paid launch request, written before the request goes out, one
// with the address it got, and one per consultant terminal the core reports.
import { expect } from 'bun:test';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import { follow, waitForTerminal, type Seen } from '../../src/hc';
import { command, spawnCaptured, type SpawnResult } from '../../src/shell';
import { transcriptFor } from '../../src/transcript';
import { realHome, required } from './tier';
import { observeReady, session, startWatchTier, type WatchTier } from './watch-tier';

const skill: string = resolve(import.meta.dir, '../../skills/watch-issues');
const intervalSec: number = Number(process.env.WATCH_TICK_SECONDS ?? '15');
const leafTemp: string = required('AKROGON_E2E_ROOT');
const out: string = required('AKROGON_E2E_OUT');
// The judge's deadline sizes the waits so the later stages keep their share of the run. No wait is
// cut to end at the deadline: the judge ends the body there, and a wait that ended first would race it.
const deadline: number = z.coerce.number().parse(process.env.AKROGON_E2E_DEADLINE);
const reach = (stage: string): void => writeFileSync(resolve(out, 'stage.txt'), stage);
const starts: string = resolve(out, 'paid-starts.jsonl');
const note = (line: { id: string; role: 'watcher' } | { id: string; address: string } | { event: string }): void =>
  appendFileSync(starts, `${JSON.stringify(line)}\n`);
// Rejects when the consultant launch stream ends, which only a lost core does.
let lost: Promise<never> = new Promise((): void => {});

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

const watcherBinary: string = z.string().parse(Bun.which('pi'));
const name: string = 'akr-e2e-watch-consults';
const tier: WatchTier = await startWatchTier(
  name,
  {
    a: { harness: 'fake', model: 'work', effort: 'low' },
    b: { harness: 'fake', model: 'work', effort: 'low' },
    consultant: { harness: 'agy', model: 'neon', effort: 'high' },
  },
  {
    fake: 'fake --model {model} --effort {effort}',
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
// Each consultant seat is requested through the tier's akrogon shim: it writes the request line
// before akrogon runs, then the address the seat printed (`<address>`, `started, not confirmed
// <address>` or, on stderr, `start failed <address>`), or `failed` when it printed none.
const tierShim: string = resolve(tier.shimBin, 'akrogon-tier');
renameSync(resolve(tier.shimBin, 'akrogon'), tierShim);
writeFileSync(
  resolve(tier.shimBin, 'akrogon'),
  `#!/bin/sh
case " $* " in *' --watch-consultant '*) ;; *) exec '${tierShim}' "$@";; esac
id="seat-$$"
printf '{"id":"%s","role":"consultant"}\\n' "$id" >> '${starts}'
'${tierShim}' "$@" > '${starts}'."$id".out 2> '${starts}'."$id".err
code=$?
cat '${starts}'."$id".out
cat '${starts}'."$id".err >&2
address=$(sed -snE '1s/^(started, not confirmed |start failed )?([^ ]+)$/\\2/p' '${starts}'."$id".out '${starts}'."$id".err | head -n 1)
if [ -n "$address" ]; then
  printf '{"id":"%s","address":"%s"}\\n' "$id" "$address" >> '${starts}'
else
  printf '{"id":"%s","failed":true}\\n' "$id" >> '${starts}'
fi
rm -f '${starts}'."$id".out '${starts}'."$id".err
exit $code
`,
  { mode: 0o755 },
);

async function body(): Promise<void> {
  await observeReady(tier);
  reach('tier ready');
  // The leaf's skill copy must be the only watch-issues pi sees.
  mkdirSync(resolve(tier.root, '.pi/skills'), { recursive: true });
  symlinkSync(skill, resolve(tier.root, '.pi/skills/watch-issues'));
  // Stage the base red and the failed leaf.
  writeFileSync(resolve(tier.root, 'BROKEN'), 'staged base red\n');
  await command(['git', 'add', 'BROKEN'], tier.root);
  await command(['git', 'commit', '-m', 'stage base red'], tier.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], tier.root);
  await stageLeaf(tier, worktrees);
  reach('leaf staged');
  const staged: string = (await spawnCaptured(['git', 'rev-parse', 'origin/main'], { cwd: tier.root })).stdout.trim();
  tier.record('staged.txt', `base=${staged}\n`);

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
  // Subscribe before the first launch so even a consultant removed before polling is counted.
  process.env.XDG_RUNTIME_DIR = tier.runtime;
  const subscribed = Promise.withResolvers<void>();
  const events = follow(session, ['--label', 'akrogon.watch-consult=akre2e'], (line): void => {
    if ('terminals' in line) {
      subscribed.resolve();
    } else if ('terminal' in line.params && line.params.type === 'created') {
      note({ event: line.params.terminal });
    }
  });
  lost = events.ended.then((): never => {
    throw new Error('watch-consults lost its consultant launch stream');
  });
  await Promise.race([subscribed.promise, lost]);
  note({ id: 'watcher', role: 'watcher' });
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
    watcherBinary,
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
  note({ id: 'watcher', address: watcher });
  reach('watcher started');
  tier.record('cwds.json', [tier.root, leafTemp]);
  // pi must be listening before the task lands: a send before its idle state sits
  // unsubmitted in the input line (plan-red run and the first lane run both lost it).
  const ready: Seen | null = await waitForTerminal(
    session,
    watcher,
    (t: Seen) => t.status?.state === 'idle' || t.status?.state === 'done',
    120_000,
  );
  // Failure messages read no screen: screens are saved after the red marker is written.
  if (ready === null) throw new Error('watcher never idle');
  reach('watcher idle');
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
  if (consultant === null) throw new Error('no consultant started');
  expect(consultant!.name).toBe('aw-watch-consult');
  expect(consultant!.parent).toBe(watcher);
  expect(consultant!.labels['akrogon.repo']).toBe('akre2e');
  tier.record('consultant.json', consultant);
  reach('consultant started');

  // The fix lands: the leaf resumes out of failed, and the case end already closed the
  // consultant (hc kill + rm) before the resume commands ran: no consultant terminal is left,
  // a replacement started under liveness included.
  const resumed: string[] = ['check.fix', 'check.review', 'check.repair'];
  // The sends are read off the screens while the case runs: `hc read` returns only pi's last
  // screenful, so a send seen once is kept. A consultant's sends land on the watcher's screen
  // inside `<hc from="<address> aw-watch-consult">` and its own screen shows its `hc send`;
  // the watcher's go out as `hc send` commands on its screen. Each send's absolute path is
  // kept as sent.
  const named = (l: string): string[] =>
    [...l.matchAll(/(?:^|[\s"'])(\/[^\s"'<>]*turn-\d+-(?:watch|consultant)\.md)/g)].map((m) => m[1]);
  const inbound: Set<string> = new Set();
  const outbound: Set<string> = new Set();
  const consultants = async (): Promise<Term[]> =>
    z
      .object({ terminals: z.array(termSchema) })
      .parse(await tier.rpc('terminal.list', { all: true, labels: { 'akrogon.watch-consult': 'akre2e' } })).terminals;
  const sample = async (): Promise<void> => {
    for (const l of (await screen(tier, watcher, 200)).split('\n')) {
      if (/<hc from="\S+ aw-watch-consult">/.test(l)) for (const f of named(l)) inbound.add(f);
      else if (/\bhc send\b/.test(l)) for (const f of named(l)) outbound.add(f);
    }
    for (const c of await consultants())
      for (const l of (await screen(tier, c.address, 200)).split('\n'))
        if (/\bhc send\b/.test(l)) for (const f of named(l)) inbound.add(f);
  };
  while (!resumed.includes(statePhase(tier.root, SLUG))) {
    await sample();
    await Bun.sleep(2000);
  }
  await sample();
  const phase: string = statePhase(tier.root, SLUG);
  const lingering: Term[] = await consultants();
  tier.record('watcher-screen.txt', await screen(tier, watcher, 200));
  tier.record('watcher-transcript.txt', (await transcriptFor({ session, address: watcher })) ?? 'none');
  expect(resumed).toContain(phase);
  if (lingering.length > 0) throw new Error(`consultant not removed: ${lingering.map((t) => t.address).join(', ')}`);
  reach('leaf resumed');

  // The leaf's seat A (the tier stand-in) starts on the resumed phase: akrogon next dispatched it.
  const seat: Term | null = await waitLabelled(
    tier,
    { 'akrogon.leaf': SLUG, 'akrogon.seat': 'a' },
    Math.min(180_000, Math.max(30_000, deadline - Date.now() - 150_000)),
  );
  tier.record('seat.json', seat);
  expect(seat, `no leaf seat after resume to ${phase}`).not.toBeNull();
  reach('seat started');

  // The case record: folder under <AKROGON_HOME>/watch/<repo>/consults/<case-id>/. The case
  // ends after the resume (status written, then the push and move notices), so the record
  // is read once its status has ended and both notices landed.
  const consults: string = resolve(leafTemp, `${name}-home`, 'watch/akre2e/consults');
  const cases: string[] = readdirSync(consults);
  expect(cases.length).toBe(1);
  const caseDir: string = resolve(consults, cases[0]);
  const status = (): string =>
    existsSync(resolve(caseDir, 'status')) ? readFileSync(resolve(caseDir, 'status'), 'utf8').trim() : 'missing';
  const ended: string[] = ['closed', 'resumed'];
  const settleBy: number = Date.now() + Math.min(90_000, Math.max(10_000, deadline - Date.now() - 30_000));
  while ((notices(scratch).length < 2 || !ended.includes(status())) && Date.now() < settleBy)
    await Bun.sleep(Math.max(0, Math.min(2000, settleBy - Date.now())));
  const seen = notices(scratch);
  tier.record('notices.json', seen);
  tier.record('case-status.txt', status());
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
  expect(ended).toContain(status());
  // Notices: one for the push and one for the move, none attention.
  expect(seen.length).toBeGreaterThanOrEqual(2);
  expect(seen.every((n) => n.attention === false)).toBe(true);

  // Every turn file named in a send is a file of this case, with a send each way.
  tier.record('sent-turn-files.json', { inbound: [...inbound], outbound: [...outbound] });
  expect([...inbound].some((f) => f.endsWith('-consultant.md'))).toBe(true);
  expect([...outbound].some((f) => f.endsWith('-watch.md'))).toBe(true);
  for (const file of [...inbound, ...outbound]) {
    expect(dirname(file), `sent ${file} is outside the case ${caseDir}`).toBe(caseDir);
    expect(existsSync(file), `sent ${file} missing`).toBe(true);
  }

  // The base fix advanced the remote default branch fast-forward from the staged base.
  await command(['git', 'fetch', '-q', 'origin'], tier.root);
  const tip: string = (await spawnCaptured(['git', 'rev-parse', 'origin/main'], { cwd: tier.root })).stdout.trim();
  const forward: SpawnResult = await spawnCaptured(['git', 'merge-base', '--is-ancestor', staged, tip], {
    cwd: tier.root,
  });
  tier.record(
    'base-log.txt',
    (await spawnCaptured(['git', 'log', '--oneline', '-5', 'origin/main'], { cwd: tier.root })).stdout,
  );
  expect(tip).not.toBe(staged);
  expect(forward.code).toBe(0);
}

try {
  await Promise.race([body(), lost]);
} catch (error) {
  writeFileSync(resolve(out, 'red.txt'), (error as Error).stack ?? String(error));
  const listed = z
    .object({ terminals: z.array(termSchema) })
    .parse(await tier.rpc('terminal.list', { all: true, labels: {} }));
  for (const t of listed.terminals) tier.record(`screen-${t.address}.txt`, await screen(tier, t.address, 120));
  throw error;
}
process.exit(0);
