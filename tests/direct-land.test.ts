import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, chmodSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fakeGh, greenReceipt, leaf, leafTempRoot, storeDir, yaml, type Fixture, type GhFixture } from './helpers';
import { hcCore, hcFixture, stopCoresAfterFile, type HcCore, type HcFixture, type Terminal } from './hc-fixture';
import { readState, type Batch, type State } from '../src/state';
import { command, type Result, type SpawnResult } from '../src/shell';
import { leafSlice } from '../src/scope';

stopCoresAfterFile();

// The direct-leaf fixture states in this file are written directly: leaf() then a state.yaml rewrite
// adding direct: true, a full-ISO created and the seat refs of the test's own terminals (plan D16a).
// At planning the state schema is a strictObject without `direct`, so every engine read of these
// states refuses; that schema rejection is the correct red. The land drive itself replicates
// tests/green-merge.test.ts: the merge turn runs through real `next` passes, and the land run is
// the direct `akrogon land <slug> --attempt <id>` invocation its systemd-run launch would have run.
type LandFixture = HcFixture & { launches: string };

async function landFixture(broadcast: boolean): Promise<LandFixture> {
  const f: HcFixture = await hcFixture();
  const config: Record<string, unknown> = { checks: { ok: 'true' }, grounding: 'none' };
  if (broadcast) config.broadcast = { discord: { webhook_env: ['AKROGON_TEST_WEBHOOK'] } };
  yaml(resolve(f.root, 'issues/config.yaml'), config);
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const launches: string = resolve(f.home, 'systemd-run.log');
  return { ...f, env: { ...f.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches };
}

// The webhook env var a broadcast-configured land needs in the CLI process environment: the gate is
// configuration plus a non-empty process env value, read where the move runs.
const webhookEnv: NodeJS.ProcessEnv = { AKROGON_TEST_WEBHOOK: 'https://discord.com/api/webhooks/1/test' };

function landLaunches(f: LandFixture): string[] {
  return existsSync(f.launches)
    ? readFileSync(f.launches, 'utf8')
        .split('\n')
        .filter((line) => line.includes('--unit=akrogon-land-'))
    : [];
}

// Every task any terminal of the fixture core received for one skill, finished terminals included:
// the direct leaf's seats are shared terminals, so no akrogon.leaf label exists for delivered() to
// match on and the stand-in task logs are read directly.
function prompts(f: LandFixture, skill: string): string[] {
  return readdirSync(f.core.standin)
    .filter((name) => name.endsWith('.tasks'))
    .flatMap((name) => readFileSync(resolve(f.core.standin, name), 'utf8').split('\n'))
    .filter((text) => text.startsWith(skill));
}

function moved(path: string): string {
  return existsSync(resolve(path, 'state.yaml')) ? path : path.replace('issues/open', 'issues/closed');
}

async function next(f: LandFixture, env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['next'], f.root, { ...f.env, ...env });
}

async function land(f: LandFixture, slug: string, attempt: string, env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['land', slug, '--attempt', attempt], f.root, { ...f.env, ...env });
}

async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', '--git-dir', resolve(f.home, 'remote.git'), 'rev-parse', 'main']);
}

function attempts(f: Fixture): string[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  return existsSync(file)
    ? readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.object({ outcome: z.string() }).parse(JSON.parse(line)).outcome)
    : [];
}

// The direct leaf's state, written wholesale: plan D3's create shape (direct, frozen, ISO created,
// seat refs) plus the merge-phase extras the test seeds (worktree, batch, sources, merge_stamp).
function directLeaf(
  f: Fixture,
  slug: string,
  seats: { A: { session: string; address: string }; B: { session: string; address: string } },
  extra: object = {},
): string {
  const path: string = leaf(f, slug, 'merge', {}, 'chart-x');
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase: 'merge',
    created: new Date().toISOString(),
    repo: f.repo,
    'blocked-by': [],
    direct: true,
    frozen: {},
    seat: seats,
    env_names: [],
    ...extra,
  });
  return path;
}

// A leaf-branch worktree with one commit ahead of the pushed base: the land fast-forwards the
// remote onto it.
async function directWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  mkdirSync(storeDir(f), { recursive: true });
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  // Unique per slug: a second leaf branching off the first land's tip (the lifecycle control in
  // the no-target test) rewrites the same file, and identical bytes leave nothing to commit.
  writeFileSync(resolve(worktree, 'direct-file'), 'direct work ' + slug + '\n');
  await command(['git', 'add', 'direct-file'], worktree);
  await command(['git', 'commit', '-m', 'direct work'], worktree);
  return worktree;
}

// helpers.holding() for a real head: the applied batch record of a merge turn whose rebase was a
// no-op (top is the leaf head itself), with the green merge receipt the land run's gates demand.
function holdingAt(f: Fixture, head: string): { batch: Batch } {
  const main: string = Bun.spawnSync(['git', 'rev-parse', 'origin/main'], { cwd: f.root }).stdout.toString().trim();
  greenReceipt(f, head, 'merge');
  return {
    batch: { attempt: 'a1', built_on: main, holder: { base: main, head }, applied: true, top: head },
  };
}

// state.yaml parsed loosely where assertions must read the seed before any engine pass: readState
// is the strict schema whose rejection of `direct` is this branch's red.
function yamlState(path: string): Record<string, unknown> {
  return z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8')));
}

// The leaf temp folder path the engine sweeps, named exactly as config.leafTemp names it.
function leafTempDir(f: Fixture, slug: string): string {
  const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
  return resolve(leafTempRoot(f), hex(f.root).slice(0, 4), hex(f.root + '\n' + slug).slice(0, 8));
}

function sliceOf(f: Fixture, slug: string): string {
  return leafSlice({ name: f.repo }, slug, f.home);
}

function sliceSeeded(f: HcFixture, slug: string): void {
  const db = z.object({ units: z.array(z.unknown()) }).parse(JSON.parse(readFileSync(f.systemctl.db, 'utf8')));
  db.units.push({ unit: sliceOf(f, slug), sub: 'active' });
  writeFileSync(f.systemctl.db, JSON.stringify(db));
}

function sliceLoaded(f: HcFixture, slug: string): boolean {
  const db = z
    .object({ units: z.array(z.object({ unit: z.string() })) })
    .parse(JSON.parse(readFileSync(f.systemctl.db, 'utf8')));
  return db.units.some((unit) => unit.unit === sliceOf(f, slug));
}

function sliceStops(f: HcFixture): string[] {
  return existsSync(f.systemctl.log)
    ? readFileSync(f.systemctl.log, 'utf8')
        .split('\n')
        .filter((line) => line.includes(' stop '))
    : [];
}

// Hold the first turn on demand and optionally hold the actual broadcast turn too.
function holdHook(core: HcCore, holdBroadcast: boolean = false): void {
  const hook: string = resolve(core.standin, 'hook');
  const tasks: string = holdBroadcast ? 'HOLD|broadcast-issue*' : 'HOLD';
  writeFileSync(
    hook,
    '#!/bin/sh\ncase "$2" in ' +
      tasks +
      ') while [ ! -e "' +
      core.standin +
      '/free-$1" ]; do sleep 0.05; done;; esac\n',
  );
  chmodSync(hook, 0o755);
}

// A stand-in terminal (fake harness, work mode) idling with no task, outside the leaf worktree so
// no pane-inside veto ever applies to it.
async function idleTerminal(f: HcFixture): Promise<string> {
  holdHook(f.core);
  const started: SpawnResult = await f.core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--cwd',
    f.home,
    '--',
    'fake',
    '--model',
    'work',
    '--effort',
    'low',
  ]);
  expect(started.code, started.stderr).toBe(0);
  const address: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
  await f.core.waitFor(address, (t: Terminal) => t.status?.state === 'idle');
  return address;
}

// A stand-in terminal whose first turn is the HOLD task: working until the release write.
async function heldTerminal(core: HcCore, cwd: string): Promise<{ address: string; release: () => void }> {
  holdHook(core, true);
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--cwd',
    cwd,
    '--',
    'fake',
    '--model',
    'work',
    '--effort',
    'low',
    'HOLD',
  ]);
  expect(started.code, started.stderr).toBe(0);
  const address: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
  await core.waitFor(address, (t: Terminal) => t.status?.state === 'working');
  return {
    address,
    release: (): void => writeFileSync(resolve(core.standin, 'free-' + address), ''),
  };
}

// An inert plain terminal for the door seat; the land never consults it.
async function catTerminal(f: HcFixture): Promise<string> {
  const started: SpawnResult = await f.core.hc(['run', '--bg', '--json', '--no-parent', '--cwd', f.home, '--', 'cat']);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

async function seatRefs(
  f: HcFixture,
  b: string,
): Promise<{ A: { session: string; address: string }; B: { session: string; address: string } }> {
  const door: string = await catTerminal(f);
  return {
    A: { session: f.core.session, address: door },
    B: { session: f.core.session, address: b },
  };
}

// The gh fake's bin merged onto the fixture env: cli() prepends the unit bin to whatever PATH the
// env carries, so the merge order is the unit bin, then the gh shim, then the fixture's hc shim.
function ghEnv(f: LandFixture, gh: GhFixture, extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    ...f.env,
    FAKE_GH: z.string().parse(gh.env.FAKE_GH),
    PATH: resolve(f.home, 'gh-bin') + ':' + z.string().parse(f.env.PATH),
    ...extra,
  };
}

function ghCalls(gh: GhFixture): string[][] {
  return readFileSync(gh.db + '.calls', 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.object({ args: z.array(z.string()) }).parse(JSON.parse(line)).args);
}

// Seeds a direct leaf ready to land: real worktree one commit ahead, applied batch on that head,
// merge stamp, plus any extras (sources). Returns the leaf path, worktree, attempt and head.
async function mergeable(
  f: LandFixture,
  slug: string,
  b: string,
  extra: object = {},
): Promise<{ path: string; worktree: string; attempt: string; head: string }> {
  const worktree: string = await directWorktree(f, slug);
  const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
  const seats = await seatRefs(f, b);
  const batch: Batch = holdingAt(f, head).batch;
  const path: string = directLeaf(f, slug, seats, {
    worktree,
    merge_stamp: '2026-10-19T00:00:00.000Z',
    batch,
    ...extra,
  });
  return { path, worktree, attempt: z.string().parse(batch.attempt), head };
}

test('a direct leaf merge lands through the command merge: remote advanced, merged, owner closed, sources closed', async () => {
  const f: LandFixture = await landFixture(false);
  try {
    const b: string = await idleTerminal(f);
    const gh: GhFixture = fakeGh(f);
    const { path, attempt, head } = await mergeable(f, 'fix-alpha', b, { sources: ['team/project#1'] });
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'] },
        { stdout: '', args: ['issue', 'close', '-R', 'team/project', '1', '--comment', 'delivered by fix-alpha'] },
      ]),
    );
    expect(await remoteTip(f)).not.toBe(head);
    // cli next drives the merge turn: the applied batch launches the land run once.
    expect((await next(f)).code).toBe(0);
    expect(landLaunches(f)).toHaveLength(1);
    expect(landLaunches(f)[0]).toContain('--unit=akrogon-land-' + attempt);
    expect(landLaunches(f)[0]).toContain('land fix-alpha --attempt ' + attempt);
    const landed: Result = await land(f, 'fix-alpha', attempt, ghEnv(f, gh));
    expect(landed.code, landed.stderr).toBe(0);
    expect(landed.stdout).toContain('moved merged');
    expect(landed.stdout).toContain('issue complete chart-x');
    expect(await remoteTip(f)).toBe(head);
    const closed: string = moved(path);
    expect(closed).toContain('issues/closed/chart-x');
    const state: State = readState(closed);
    expect(state.phase).toBe('merged');
    expect(yamlState(closed).direct).toBe(true);
    // No broadcast target is configured: the leaf records no broadcast handoff.
    expect(state.broadcast).toBeUndefined();
    expect(attempts(f)).toEqual(['merged']);
    const log: string[] = readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n');
    expect(JSON.parse(log.at(-1)!)).toMatchObject({ slug: 'fix-alpha', from: 'merge', to: 'merged', slot: null });
    // The seeded source is closed with the leaf's delivered-by comment, as lifecycle lands close it.
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(ghCalls(gh)).toEqual([
      ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'],
      ['issue', 'close', '-R', 'team/project', '1', '--comment', 'delivered by fix-alpha'],
    ]);
    expect(prompts(f, 'broadcast-issue')).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('with webhook_env configured and set the direct land records the broadcast handoff', async () => {
  const f: LandFixture = await landFixture(true);
  try {
    const b: string = await idleTerminal(f);
    const gh: GhFixture = fakeGh(f);
    const { path, attempt, head } = await mergeable(f, 'fix-alpha', b, { sources: ['team/project#1'] });
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'] },
        { stdout: '', args: ['issue', 'close', '-R', 'team/project', '1', '--comment', 'delivered by fix-alpha'] },
      ]),
    );
    expect((await next(f, webhookEnv)).code).toBe(0);
    const landed: Result = await land(f, 'fix-alpha', attempt, ghEnv(f, gh, webhookEnv));
    expect(landed.code, landed.stderr).toBe(0);
    const state: State = readState(moved(path));
    expect(state.phase).toBe('merged');
    expect(state.broadcast).toMatchObject({
      kind: 'issue',
      name: 'chart-x',
      destination: resolve(f.root, 'issues/closed/chart-x'),
      pushed: head,
      sources: ['team/project#1'],
    });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a lifecycle control leaf in the no-target fixture records no broadcast key after its land', async () => {
  const f: LandFixture = await landFixture(false);
  try {
    const b: string = await idleTerminal(f);
    const gh: GhFixture = fakeGh(f);
    const { path, attempt } = await mergeable(f, 'fix-alpha', b, { sources: ['team/project#1'] });
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '1', '--json', 'state'] },
        { stdout: '', args: ['issue', 'close', '-R', 'team/project', '1', '--comment', 'delivered by fix-alpha'] },
        { stdout: '{"state":"OPEN"}', args: ['issue', 'view', '-R', 'team/project', '2', '--json', 'state'] },
        { stdout: '', args: ['issue', 'close', '-R', 'team/project', '2', '--comment', 'delivered by lc'] },
      ]),
    );
    expect((await next(f)).code).toBe(0);
    expect((await land(f, 'fix-alpha', attempt, ghEnv(f, gh))).code).toBe(0);
    expect(readState(moved(path)).phase).toBe('merged');
    // The lifecycle control, created only now so its branch descends from the landed tip: the same
    // merge construction in its own owner, no direct key and no seat refs.
    const controlWorktree: string = await directWorktree(f, 'lc');
    const controlHead: string = await command(['git', 'rev-parse', 'HEAD'], controlWorktree);
    const controlPath: string = leaf(
      f,
      'lc',
      'merge',
      {
        ...holdingAt(f, controlHead),
        worktree: controlWorktree,
        merge_stamp: '2026-10-19T00:00:01.000Z',
        sources: ['team/project#2'],
      },
      'plain-issue',
    );
    expect((await next(f)).code).toBe(0);
    expect(landLaunches(f).filter((line) => line.includes('land lc '))).toHaveLength(1);
    expect((await land(f, 'lc', 'a1', ghEnv(f, gh))).code).toBe(0);
    expect(readState(moved(controlPath)).phase).toBe('merged');
    expect(readState(moved(controlPath)).broadcast).toBeUndefined();
    expect(moved(controlPath)).toContain('issues/closed/plain-issue');
    // The direct leaf in the same fixture recorded nothing either: the gate is configuration.
    expect(readState(moved(path)).broadcast).toBeUndefined();
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('an idle reviewer receives the broadcast prompt after the direct land, with no allocation', async () => {
  const f: LandFixture = await landFixture(true);
  try {
    const b: string = await idleTerminal(f);
    const { path, attempt, head } = await mergeable(f, 'fix-alpha', b);
    const terminalsBefore: string[] = (await f.core.terminals({}, true)).map((t: Terminal) => t.address).sort();
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect((await land(f, 'fix-alpha', attempt, webhookEnv)).code).toBe(0);
    const closed: string = moved(path);
    expect(readState(closed).broadcast?.pushed).toBe(head);
    expect((await next(f, webhookEnv)).code).toBe(0);
    // The prompt is the lifecycle broadcast text, delivered to the recorded seat.B terminal.
    const delivered: string[] = f.core.tasks(b).filter((text) => text.startsWith('broadcast-issue'));
    expect(delivered).toHaveLength(1);
    expect(delivered[0]).toContain('broadcast-issue fix-alpha slot=B owner=issue:chart-x');
    expect(delivered[0]).toContain('closed=' + resolve(f.root, 'issues/closed/chart-x'));
    expect(delivered[0]).toContain('sha=' + head);
    expect(delivered[0]).toContain('sources=none');
    const state: State = readState(closed);
    expect(state.prompted.B).toMatchObject({ address: b });
    expect(state.delivery_error.B).toBeUndefined();
    // No seat was allocated: exactly the test's own terminals exist and none carries leaf labels.
    expect((await f.core.terminals({}, true)).map((t: Terminal) => t.address).sort()).toEqual(terminalsBefore);
    expect(await f.core.terminals({ 'akrogon.leaf': 'fix-alpha' }, true)).toEqual([]);
    // The send lands once: further passes over the same turn deliver nothing more.
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(f.core.tasks(b).filter((text) => text.startsWith('broadcast-issue'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
});

test.each(['turn ended', 'reviewer gone'] as const)('a cross-session broadcast holds cleanup until %s', async (end) => {
  const f: LandFixture = await landFixture(true);
  const reviewer: HcCore = await hcCore(f, { doc: false });
  f.core.link(reviewer);
  try {
    const held = await heldTerminal(reviewer, f.home);
    const { path, worktree, attempt } = await mergeable(f, 'fix-alpha', held.address, {
      seat: { ...(await seatRefs(f, held.address)), B: { session: reviewer.session, address: held.address } },
    });
    mkdirSync(leafTempDir(f, 'fix-alpha'), { recursive: true });
    sliceSeeded(f, 'fix-alpha');
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect((await land(f, 'fix-alpha', attempt, webhookEnv)).code).toBe(0);
    const closed: string = moved(path);
    expect(readState(closed).phase).toBe('merged');
    // B works: the pass sends nothing, and the reconcile pass leaves every piece of the leaf in place.
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(reviewer.tasks(held.address).filter((text) => text.startsWith('broadcast-issue'))).toEqual([]);
    const pending: Result = await cli(f, ['status', '--json'], f.root, f.env);
    expect(pending.code, pending.stderr).toBe(0);
    const rows = z
      .object({
        repos: z.array(
          z.object({
            leaves: z.array(
              z.object({ slug: z.string(), broadcast_pending: z.boolean(), group: z.array(z.string()) }).passthrough(),
            ),
          }),
        ),
      })
      .parse(JSON.parse(pending.stdout))
      .repos.flatMap((repo) => repo.leaves);
    expect(rows.find((row) => row.slug === 'fix-alpha')).toMatchObject({
      broadcast_pending: true,
      group: ['chart-x'],
    });
    const table: Result = await cli(f, ['status'], f.root, f.env);
    expect(table.code, table.stderr).toBe(0);
    expect(table.stdout.split('\n').find((line) => line.includes('fix-alpha'))).toContain('broadcast pending');
    expect(readState(closed).prompted.B).toBeUndefined();
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(leafTempDir(f, 'fix-alpha'))).toBe(true);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(true);
    expect(sliceStops(f).filter((line) => line.includes(sliceOf(f, 'fix-alpha')))).toEqual([]);
    // The turn ends: the pass sends the prompt now, prompted.B is its ack.
    held.release();
    await reviewer.waitFor(held.address, (t: Terminal) => t.status?.state === 'idle');
    // The next turn (broadcast) will wait for the same release file again.
    unlinkSync(resolve(reviewer.standin, 'free-' + held.address));
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(reviewer.tasks(held.address).filter((text) => text.startsWith('broadcast-issue'))).toHaveLength(1);
    const prompted: State = readState(closed);
    expect(prompted.prompted.B).toMatchObject({ address: held.address });
    const promptedTurn: number = z.object({ turn: z.number() }).parse(prompted.prompted.B).turn;
    // Once B's broadcast turn ends the leaf releases: worktree, temp and slice are swept while the
    // owner folder stays in issues/closed.
    await reviewer.waitFor(held.address, (t: Terminal) => t.turn === promptedTurn && t.status?.state === 'working');
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(leafTempDir(f, 'fix-alpha'))).toBe(true);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(true);
    if (end === 'reviewer gone') await reviewer.stop();
    else {
      held.release();
      await reviewer.waitFor(held.address, (t: Terminal) => t.turn > promptedTurn);
    }
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(existsSync(leafTempDir(f, 'fix-alpha'))).toBe(false);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(false);
    expect(sliceStops(f).some((line) => line.includes(sliceOf(f, 'fix-alpha')))).toBe(true);
    expect(readState(closed).phase).toBe('merged');
    expect(existsSync(resolve(f.root, 'issues/closed/chart-x/fix-alpha/state.yaml'))).toBe(true);
    const settledTable: Result = await cli(f, ['status'], f.root, f.env);
    expect(settledTable.code, settledTable.stderr).toBe(0);
    expect(settledTable.stdout).not.toContain('fix-alpha');
    expect((await command(['git', 'branch', '--list', 'fix-alpha'], f.root)).trim()).toBe('');
    // B is a shared terminal: the sweep never ends it.
    if (end === 'turn ended') expect((await reviewer.get(held.address)).state).toBe('live');
  } finally {
    await reviewer.stop();
    await f.clean();
  }
});

test('a pending broadcast keeps cleanup held for a replacement reviewer', async () => {
  const f: LandFixture = await landFixture(true);
  const original: HcCore = await hcCore(f, { doc: false });
  f.core.link(original);
  try {
    const { address } = await heldTerminal(original, f.home);
    const seats = await seatRefs(f, address);
    const { path, worktree, attempt } = await mergeable(f, 'fix-alpha', address, {
      seat: { A: seats.A, B: { session: original.session, address } },
    });
    const temp: string = leafTempDir(f, 'fix-alpha');
    mkdirSync(temp, { recursive: true });
    sliceSeeded(f, 'fix-alpha');
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect((await land(f, 'fix-alpha', attempt, webhookEnv)).code).toBe(0);
    const closed: string = moved(path);
    expect(readState(closed)).toMatchObject({ phase: 'merged', broadcast: expect.any(Object) });
    expect(readState(closed).prompted.B).toBeUndefined();

    await original.stop();
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(readState(closed).prompted.B).toBeUndefined();
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(temp)).toBe(true);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(true);

    const replacement: string = await idleTerminal(f);
    holdHook(f.core, true);
    const repointed: Result = await cli(f, ['direct', 'fix-alpha', '--reviewer', replacement], f.root, {
      ...f.env,
      HC_SESSION: seats.A.session,
      HC_TERMINAL_ID: seats.A.address,
    });
    expect(repointed.code, repointed.stderr).toBe(0);
    expect((await next(f, webhookEnv)).code).toBe(0);
    const prompted = z.object({ address: z.string(), turn: z.number() }).parse(readState(closed).prompted.B);
    expect(prompted.address).toBe(replacement);
    await f.core.waitFor(replacement, (t: Terminal) => t.turn === prompted.turn && t.status?.state === 'working');
    expect(f.core.tasks(replacement).filter((text) => text.startsWith('broadcast-issue'))).toHaveLength(1);
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(temp)).toBe(true);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(true);

    writeFileSync(resolve(f.core.standin, 'free-' + replacement), '');
    await f.core.waitFor(replacement, (t: Terminal) => t.turn > prompted.turn);
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(existsSync(temp)).toBe(false);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(false);
  } finally {
    await original.stop();
    await f.clean();
  }
});

test('a late broadcast delivery settles at the original turn without sending again', async () => {
  const f: LandFixture = await landFixture(true);
  try {
    const b: string = await idleTerminal(f);
    const { path, worktree, attempt } = await mergeable(f, 'fix-alpha', b);
    mkdirSync(leafTempDir(f, 'fix-alpha'), { recursive: true });
    sliceSeeded(f, 'fix-alpha');
    expect((await next(f, webhookEnv)).code).toBe(0);
    // The broadcast send is refused unavailable exactly once (the hc-shim's one-shot seam), armed
    // before the land because a finished land's own wake may be the pass that sends: the send never
    // reaches the terminal, so the failure is recorded and the broadcast pends.
    const unavailable: string = resolve(f.home, 'unavailable-once');
    writeFileSync(unavailable, '');
    // Both invocations carry the seam: whichever pass makes the first send consumes the refusal.
    const armed: NodeJS.ProcessEnv = { ...webhookEnv, HC_SHIM_UNAVAILABLE: unavailable };
    expect((await land(f, 'fix-alpha', attempt, armed)).code).toBe(0);
    const closed: string = moved(path);
    expect((await next(f, armed)).code).toBe(0);
    const failed: Record<string, unknown> = yamlState(closed);
    expect(failed.delivery_error).toHaveProperty('B');
    expect((failed.prompted as Record<string, unknown> | undefined)?.B).toBeUndefined();
    expect(f.core.tasks(b).filter((text) => text.startsWith('broadcast-issue'))).toEqual([]);
    expect(existsSync(unavailable)).toBe(false);
    // The hold survives: worktree, temp and slice are all still in place after the reconcile pass.
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(leafTempDir(f, 'fix-alpha'))).toBe(true);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(true);
    // One send per turn: while B's turn stands still the retry does not go out.
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(f.core.tasks(b).filter((text) => text.startsWith('broadcast-issue'))).toEqual([]);
    expect(yamlState(closed).delivery_error).toHaveProperty('B');
    // Represent a send that arrived after the caller saw the error: deliver that same prompt
    // into the real reviewer terminal and let its original turn finish.
    const state: State = readState(closed);
    const handoff = state.broadcast!;
    const originalTurn: number = z.object({ turn: z.number() }).parse(state.delivery_error.B).turn;
    const late: string = `broadcast-issue fix-alpha slot=B owner=issue:chart-x closed=${handoff.destination} sha=${handoff.pushed} sources=none leaf=${closed}`;
    expect((await f.core.hc(['send', b, late])).code).toBe(0);
    await f.core.waitFor(b, (t: Terminal) => t.turn > originalTurn && t.status?.state === 'idle');
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(f.core.tasks(b).filter((text) => text.startsWith('broadcast-issue'))).toEqual([late]);
    const settled: State = readState(closed);
    expect(settled.delivery_error.B).toBeUndefined();
    expect(settled.prompted.B).toMatchObject({ address: b, turn: originalTurn });
    expect((await next(f, webhookEnv)).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(existsSync(leafTempDir(f, 'fix-alpha'))).toBe(false);
    expect(sliceLoaded(f, 'fix-alpha')).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/closed/chart-x/fix-alpha/state.yaml'))).toBe(true);
  } finally {
    await f.clean();
  }
});
