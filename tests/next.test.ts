import { test, expect } from 'bun:test';
import {
  existsSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  rmSync,
  renameSync,
  appendFileSync,
  statSync,
  chmodSync,
  lstatSync,
  mkdtempSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {
  fixture,
  cli,
  entry,
  leaf,
  yaml,
  fakeGh,
  fakeHerdr,
  fakeSystemctl,
  leafTempRoot,
  storeDir,
  registerTemp,
  type GhFixture,
  type Fixture,
  verified,
  holding,
  seatOwned,
} from './helpers';
import { readState, saveState, type Batch, type State } from '../src/state';
import { seatName } from '../src/hc';
import { parseEnv } from 'node:util';
import { command, run, type Result, spawnCaptured } from '../src/shell';
import type { GhStep } from './fake-gh';
import type { Database } from './fake-herdr';
import {
  adopt,
  delivered,
  hcCore,
  hcFixture,
  setPrefixes,
  setSeat,
  type HcCore,
  type HcFixture,
  type Terminal,
} from './hc-fixture';
import { z } from 'zod';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function saveDatabase(f: DispatchFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}
function calls(f: DispatchFixture): string[][] {
  const path: string = f.db + '.calls';
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
        // Session routing adds discovery calls; strip them so assertions see work calls.
        .filter((args) => args[0] !== 'session' && args[0] !== 'workspace')
    : [];
}
async function next(
  f: Fixture & { env: NodeJS.ProcessEnv },
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}

// Port helpers (plan D26): the fixture core's seat terminals stand in for fake herdr panes, tabs and prompts.
async function seatTerminals(f: HcFixture, slug: string, all: boolean = false): Promise<Terminal[]> {
  return f.core.terminals({ akrogon: '1', 'akrogon.leaf': slug }, all);
}
// The slugs whose leaf tab holds a live seat, sorted: the old fake herdr tab labels.
async function liveTabs(f: HcFixture): Promise<string[]> {
  const live: Terminal[] = await f.core.terminals({ akrogon: '1' }, false);
  return [...new Set(live.map((t: Terminal) => t.labels['akrogon.leaf']))].sort();
}
// Every task any seat terminal received, finished terminals included.
async function allTasks(f: HcFixture): Promise<{ slug: string; seat: string; address: string; text: string }[]> {
  const seats: Terminal[] = await f.core.terminals({ akrogon: '1' }, true);
  return seats.flatMap((t: Terminal) =>
    f.core.tasks(t.address).map((text: string) => ({
      slug: t.labels['akrogon.leaf'],
      seat: t.labels['akrogon.seat'],
      address: t.address,
      text,
    })),
  );
}
// Holds every stand-in turn `working` while the returned release has not run; a status (for example
// `blocked:kind=permission`) is reported at the start of each held turn.
function holdTurns(f: HcFixture, status?: string): () => void {
  const hold: string = resolve(f.core.standin, 'hold');
  writeFileSync(hold, '');
  const report: string = status === undefined ? '' : `printf '\\033]7501;state=${status}\\007'\n`;
  // A terminal with a `free-<address>` file runs its turns through even while the hold lasts.
  writeFileSync(
    resolve(f.core.standin, 'hook'),
    `#!/bin/sh\n${report}while [ -e '${hold}' ] && [ ! -e "${f.core.standin}/free-$1" ]; do sleep 0.05; done\n`,
  );
  chmodSync(resolve(f.core.standin, 'hook'), 0o755);
  return (): void => rmSync(hold, { force: true });
}
// Lets one seat terminal's turns run through a holdTurns hold, current turn included.
function freeTurns(f: HcFixture, address: string): void {
  writeFileSync(resolve(f.core.standin, `free-${address}`), '');
}
// Fake herdr still takes notice sends (they stay on herdr until notices-on-hc).
function notices(f: Fixture): string[][] {
  const path: string = resolve(f.home, 'herdr.json.calls');
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
        .filter((args) => args[0] === 'notification')
    : [];
}
async function seatIdle(f: HcFixture, address: string, turn: number): Promise<Terminal> {
  return f.core.waitFor(address, (t: Terminal) => t.turn >= turn && t.status?.state === 'idle');
}
// A second registered repo on its own fixture core, linked so akrogon sees both sessions.
async function otherRepo(f: HcFixture, name: string = 'other', prefix: string = 'ot'): Promise<HcFixture> {
  const g: Fixture = await fixture();
  const core: HcCore = await hcCore(g, { repo: name });
  f.core.link(core);
  // akrogon runs with HOME at f.home, so the other session's herdr-app home lives there too (plan D12).
  mkdirSync(resolve(f.home, '.config/herdr-app-sessions', core.session), { recursive: true });
  const global = z
    .object({ prefixes: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')));
  setPrefixes(f, { ...global.prefixes, [name]: prefix });
  return {
    ...g,
    core,
    systemctl: fakeSystemctl(g),
    env: core.env,
    clean: async (): Promise<void> => {
      await core.stop();
      g.clean();
    },
  };
}

// The hc calls akrogon made, one argv per call, from the fixture's recording shim.
function hcCalls(f: HcFixture): string[][] {
  return readFileSync(f.core.shimLog, 'utf8')
    .split('\n')
    .filter((line: string) => line !== '')
    .map((line: string) => line.split('\t'));
}
// The argv after `--` of every seat start of a leaf seat, in start order.
function seatStarts(f: HcFixture, slug: string, seat: 'a' | 'b'): string[][] {
  return hcCalls(f)
    .filter(
      (args: string[]) =>
        args[0] === 'run' && args.includes(`akrogon.leaf=${slug}`) && args.includes(`akrogon.seat=${seat}`),
    )
    .map((args: string[]) => args.slice(args.indexOf('--') + 1));
}
function lastStart(f: HcFixture, slug: string, seat: 'a' | 'b'): string[] {
  const starts: string[][] = seatStarts(f, slug, seat);
  if (starts.length === 0) throw new Error(`Missing start for ${slug} seat ${seat}`);
  return starts[starts.length - 1];
}
// The harness argv inside a seat start (`<harness> --model <m> --effort <e> [task]`), after the scope and env wrappers.
function harnessOf(start: string[]): string[] {
  return start.slice(start.indexOf('--model') - 1);
}
// The single TMPDIR a seat start sets through its `env` wrapper.
function startTmpdir(start: string[]): string {
  const found: string[] = start.filter((arg: string) => arg.startsWith('TMPDIR=')).map((arg) => arg.slice(7));
  expect(found).toHaveLength(1);
  return found[0];
}
// Every seat start any leaf made, in start order.
function allStarts(f: HcFixture): string[][] {
  return hcCalls(f)
    .filter((args: string[]) => args[0] === 'run' && args.includes('akrogon=1'))
    .map((args: string[]) => args.slice(args.indexOf('--') + 1));
}
// A leaf tab is gone once no terminal holds it: each seat terminal is killed and removed.
async function closeTab(f: HcFixture, slug: string): Promise<void> {
  for (const seat of await seatTerminals(f, slug, true)) {
    await f.core.hc(['kill', seat.address]);
    expect((await f.core.hc(['rm', seat.address])).code).toBe(0);
  }
}
// Sets one global seat with its own effort; the stand-in runs an unknown mode as `work`.
function globalSlot(f: Fixture, slot: 'a' | 'b', model: string, effort: string): void {
  const path: string = resolve(f.home, 'config.yaml');
  const global = z
    .object({ slots: z.record(z.string(), z.unknown()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  writeFileSync(
    path,
    Bun.YAML.stringify({ ...global, slots: { ...global.slots, [slot]: { harness: 'fake', model, effort } } }),
  );
}

for (const kind of ['relative file', 'absolute file', 'file symlink']) {
  test(`next rejects ${kind} before dispatch or leaf mutation`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'build', 'plan.synthesis');
      const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
      symlinkSync(resolve(f.root, 'file'), resolve(f.root, 'file-link'));
      const target: string =
        kind === 'absolute file' ? resolve(f.root, 'file') : kind === 'file symlink' ? 'file-link' : 'file';
      const result: Result = await next(f, [target]);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(target);
      expect(result.stderr).toContain('leaf folder');
      expect(result.stderr).toContain('slug');
      expect(result.stderr).toContain('worktree path');
      expect(result.stderr).not.toContain('ENOTDIR');
      expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
      expect(calls(f)).toEqual([]);
      expect(existsSync(storeDir(f))).toBe(false);
    } finally {
      f.clean();
    }
  });
}

for (const kind of ['leaf folder', 'worktree path']) {
  test(`next dispatches an explicit ${kind}`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const worktree: string = resolve(storeDir(f), 'build');
      if (kind === 'worktree path') await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
      const path: string = leaf(f, 'build', 'plan.synthesis', kind === 'worktree path' ? { worktree } : {});
      expect((await next(f, [kind === 'worktree path' ? worktree : path])).code).toBe(0);
      expect(await allTasks(f)).toHaveLength(1);
      expect(readState(path).attempts.A).toBe(1);
    } finally {
      await f.clean();
    }
  });
}

test('next creates one worktree/tab under concurrent passes and starts configured A with the leaf task', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    // The seat works on its task through both passes, as an agent would.
    holdTurns(f);
    const results: Result[] = await Promise.all([next(f, ['build']), next(f, ['build'])]);
    expect(results.map((r) => r.code)).toEqual([0, 0]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^(priority|slot):/m);
    const seats: Terminal[] = await seatTerminals(f, 'build', true);
    expect(seats.map((t: Terminal) => t.name)).toEqual(['rp-build-a']);
    expect(new Set(seats.map((t: Terminal) => t.labels['herdr.tab']))).toEqual(
      new Set([z.string().parse(readState(path).tab)]),
    );
    const tasks = await allTasks(f);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe(`plan-issue build slot=A phase=plan.synthesis leaf=${path}`);
    expect(tasks[0].text.endsWith(` leaf=${f.root}/issues/open/issue/build`)).toBe(true);
    expect(tasks[0].text.split(' leaf=')[1]).not.toContain('issues/worktrees');
    expect(tasks[0].address).toBe(z.string().parse(readState(path).seat.A?.address));
    expect(readState(path).attempts.A).toBe(1);
    expect(notices(f)).toEqual([]);
    expect(await command(['git', 'branch', '--show-current'], readState(path).worktree)).toBe('build');
  } finally {
    await f.clean();
  }
}, 15000);

test('bare next from the repo dispatches by cwd instead of returning silently', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'shell', 'plan.synthesis');
    expect((await next(f, [])).code).toBe(0);
    expect(await allTasks(f)).toHaveLength(1);
    expect(readState(path).attempts.A).toBe(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('next re-prompts an idle seat whose turn ended while the phase never moved, and never a working one', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'stalled', 'plan.synthesis');
    const release: () => void = holdTurns(f);
    expect((await next(f, ['stalled'])).code).toBe(0);
    const a: string = z.string().parse(readState(path).seat.A?.address);
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(1);
    release();
    await seatIdle(f, a, 1);
    expect((await next(f, ['stalled'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(2);
    expect(readState(path).attempts.A).toBe(2);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
}, 15000);

test('an ended turn never re-prompts a busy or done seat', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'misses', 'plan.synthesis');
    const release: () => void = holdTurns(f);
    expect((await next(f, ['misses'])).code).toBe(0);
    const a: string = z.string().parse(readState(path).seat.A?.address);
    expect(f.core.tasks(a)).toEqual([`plan-issue misses slot=A phase=plan.synthesis leaf=${path}`]);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(1);
    expect(readState(path).attempts).toEqual({ A: 1, B: 0 });
    saveState(path, { ...readState(path), done: ['A'] });
    release();
    await seatIdle(f, a, 1);
    expect((await next(f, ['misses'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(1);
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
}, 15000);

test('next waits on a blocked agent instead of counting attempts or flipping seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'dialog', 'plan.synthesis');
    holdTurns(f, 'blocked:kind=permission:msg=Allow?');
    expect((await next(f, ['dialog'])).code).toBe(0);
    const a: string = z.string().parse(readState(path).seat.A?.address);
    await f.core.waitFor(a, (t: Terminal) => t.status?.state === 'blocked');
    expect((await next(f, ['dialog'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(1);
    expect(readState(path).busy_since.A).toBeDefined();
    expect(readState(path).attempts.A).toBe(1);
    expect(readState(path).delivery_error.A).toBeUndefined();
    expect(readState(path).seat.B).toBeUndefined();
    expect(readState(path).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
}, 15000);

test('failed leaves never notify on dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'broken', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'x' },
    });
    expect(readState(path)).toMatchObject({ busy_since: {}, busy_notified: {} });
    saveDatabase(f, { ...database(f), failNotification: true });
    const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    for (let sweep: number = 0; sweep < 3; sweep++) expect((await next(f, ['broken'])).code).toBe(1);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    expect(database(f)).toMatchObject({ prompts: [], starts: [], tabs: [], panes: [] });
    expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    saveDatabase(f, { ...database(f), failNotification: false });
    expect((await next(f, ['broken'])).code).toBe(1);
    expect(calls(f).filter((args) => args[0] === 'notification')).toHaveLength(0);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
});

async function nextAt(f: Fixture & { env: NodeJS.ProcessEnv }, slug: string, now: number): Promise<Result> {
  const { stdout, stderr, code }: Result = await spawnCaptured(
    [
      process.execPath,
      '--eval',
      `Date.now = () => ${now}; process.argv = ['bun', ${JSON.stringify(entry)}, 'next', ${JSON.stringify(slug)}]; await import(${JSON.stringify(entry)});`,
    ],
    {
      cwd: f.root,
      env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home, HERDR_PANE_ID: '', ...f.env },
    },
  );
  return { stdout, stderr, code };
}

function failNotices(f: Fixture, failNotification: boolean): void {
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ ...(JSON.parse(readFileSync(db, 'utf8')) as Database), failNotification }));
}

test('busy seats persist, warn strictly after an hour, retry a failed notice and clear on an idle turn', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'busy', 'check.review');
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    const at = (minutes: number): string => new Date(now + minutes * 60000).toISOString();
    const release: () => void = holdTurns(f);
    expect((await nextAt(f, 'busy', now)).code).toBe(0);
    expect(await seatTerminals(f, 'busy')).toHaveLength(2);
    expect((await nextAt(f, 'busy', now)).code).toBe(0);
    const started: State = readState(path);
    expect(started.busy_since).toEqual({ A: at(0), B: at(0) });
    for (const minutes of [59, 60]) expect((await nextAt(f, 'busy', now + minutes * 60000)).code).toBe(0);
    expect(notices(f)).toHaveLength(0);
    failNotices(f, true);
    const failed: Result = await nextAt(f, 'busy', now + 61 * 60000);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('fixture_notification_failed');
    expect(readState(path).busy_since).toEqual(started.busy_since);
    expect(readState(path).busy_notified).toEqual({});
    failNotices(f, false);
    for (const minutes of [61, 62]) expect((await nextAt(f, 'busy', now + minutes * 60000)).code).toBe(0);
    expect(notices(f)).toHaveLength(3);
    expect(readState(path)).toMatchObject({
      phase: started.phase,
      seat: started.seat,
      attempts: started.attempts,
      busy_since: started.busy_since,
    });
    expect(Object.keys(readState(path).busy_notified)).toEqual(['A', 'B']);
    expect(await allTasks(f)).toHaveLength(2);
    // Both turns end: the idle observation clears each episode, and the re-prompted turn opens a new one.
    release();
    for (const seat of await seatTerminals(f, 'busy')) await seatIdle(f, seat.address, 1);
    holdTurns(f);
    expect((await nextAt(f, 'busy', now + 63 * 60000)).code).toBe(0);
    expect(readState(path).busy_since).toEqual({});
    expect(readState(path).busy_notified).toEqual({});
    for (const seat of await seatTerminals(f, 'busy'))
      await f.core.waitFor(seat.address, (t: Terminal) => t.status?.state === 'working');
    expect((await nextAt(f, 'busy', now + 64 * 60000)).code).toBe(0);
    expect(readState(path).busy_since).toEqual({ A: at(64), B: at(64) });
    expect((await nextAt(f, 'busy', now + 125 * 60000)).code).toBe(0);
    expect(notices(f)).toHaveLength(5);
  } finally {
    await f.clean();
  }
}, 30000);

test('next refuses unmerged dependencies, respects capacity, and waits on a busy seat', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['first'] });
    const missing: string = leaf(f, 'missing', 'plan.synthesis', { 'blocked-by': ['absent'] });
    const waiting: Result = await next(f, ['dependent']);
    expect(waiting.code).toBe(0);
    expect(waits(waiting)).toEqual(['waiting: dependent on first (plan.synthesis)']);
    expect((await next(f, ['missing'])).code).not.toBe(0);
    saveState(missing, { ...readState(missing), 'blocked-by': ['first'] });
    configure(f, { max_active: 1 });
    holdTurns(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['first']);
    expect(readState(dependent).worktree).toBeUndefined();
    const tasksBefore: number = (await allTasks(f)).length;
    const attemptsBefore: { A: number; B: number } = { ...readState(first).attempts };
    expect((await next(f, ['first'])).code).toBe(0);
    expect(await allTasks(f)).toHaveLength(tasksBefore);
    expect(readState(first).busy_since.A).toBeDefined();
    expect(readState(first).attempts).toEqual(attemptsBefore);
  } finally {
    await f.clean();
  }
}, 15000);

test('a merged leaf with its tab still open does not count toward max_active', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const dependent: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    configure(f, { max_active: 1 });
    holdTurns(f);
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, { ...readState(first), phase: 'merge', ...holding(f) });
    // The merged move's own pass starts the dependent while the merged tab is still open (plan D14).
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['first', 'second']);
    expect((await next(f, [])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['second']);
    expect(readState(dependent).attempts.A).toBe(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('merged phase closes tab on typed next and starts the dependent', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const dependent: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    holdTurns(f);
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, { ...readState(first), phase: 'merge', ...holding(f) });
    const merged: Result = await cli(f, ['phase', 'first', 'merged'], f.root, f.env);
    expect(merged.code).toBe(0);
    expect(await liveTabs(f)).toEqual(['first', 'second']);
    expect((await next(f, [])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['second']);
    expect(readState(dependent).attempts.A).toBe(1);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['second']);
  } finally {
    await f.clean();
  }
}, 15000);

test('completing a leaf via targeted next starts only same-repo dependents', async () => {
  const f: HcFixture = await hcFixture();
  const g: Fixture = await fixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const loose: string = leaf(f, 'loose', 'plan.synthesis', {}, 'loose-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first'] }, 'second-issue');
    const other: string = leaf(g, 'other', 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    holdTurns(f);
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, { ...readState(first), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['first'])).code).toBe(0);
    // The targeted pass closes the merged tab through reconciliation.
    expect(await liveTabs(f)).toEqual(['second']);
    expect(readState(second).attempts.A).toBe(1);
    for (const untouched of [loose, other]) {
      expect(readState(untouched).tab).toBeUndefined();
      expect(readState(untouched).worktree).toBeUndefined();
      expect(readState(untouched).seat).toEqual({});
    }
  } finally {
    await f.clean();
    g.clean();
  }
}, 15000);

test('a dependent still blocked by an unmerged leaf stays unallocated after its first blocker merges', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    leaf(f, 'other', 'plan.synthesis', {}, 'other-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first', 'other'] }, 'second-issue');
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, { ...readState(first), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'first', 'merged'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['first'])).code).toBe(0);
    // Targeted reconciliation closes the merged leaf's tab in the same pass.
    expect(await liveTabs(f)).toEqual([]);
    expect(readState(second).tab).toBeUndefined();
    expect(readState(second).worktree).toBeUndefined();
    expect(readState(second).seat).toEqual({});
  } finally {
    await f.clean();
  }
}, 15000);

test('next --all inside a checkout sweeps only that repo', async () => {
  const f: HcFixture = await hcFixture();
  const g: Fixture = await fixture();
  try {
    leaf(f, 'a-one', 'plan.synthesis');
    leaf(g, 'b-one', 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['a-one']);
  } finally {
    await f.clean();
    g.clean();
  }
}, 15000);

test('unreadable state reserves its capacity and reports its path', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(f, 'second', 'plan.synthesis');
    configure(f, { max_active: 2 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ path: malformed });
    expect(await liveTabs(f)).toHaveLength(1);
    configure(f, { max_active: 4 });
    const retried: Result = await next(f, ['--all']);
    expect(retried.code).toBe(1);
    expect(await liveTabs(f)).toHaveLength(2);
    expect([first, second].filter((path) => readState(path).worktree !== undefined)).toHaveLength(2);
  } finally {
    await f.clean();
  }
}, 15000);

test('one unreadable leaf blocks all capacity at max_active 1', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    leaf(f, 'pending', 'plan.synthesis');
    configure(f, { max_active: 1 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ path: malformed });
    expect(await liveTabs(f)).toHaveLength(0);
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('machine-wide capacity includes another registered repo and folder selection respects it', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(g, 'second', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 1, repos: { repo: f.root, other: g.root } });
    const results: Result[] = await Promise.all([next(f, ['first']), next(f, [resolve(g.root, 'issues/open/issue')])]);
    expect(results.every((result) => result.code === 0)).toBe(true);
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toHaveLength(1);
    const states = [readState(resolve(f.root, 'issues/open/issue/first')), readState(second)];
    expect(states.filter((state) => state.worktree !== undefined)).toHaveLength(1);
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('merged leaves do not reserve capacity for other waiting leaves', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    leaf(f, 'merged-a', 'merged');
    leaf(f, 'merged-b', 'merged');
    leaf(f, 'merged-c', 'merged');
    const first: string = leaf(f, 'first', 'plan.synthesis');
    const second: string = leaf(f, 'second', 'plan.synthesis');
    const other: string = leaf(g, 'other', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 3, repos: { repo: f.root, other: g.root } });
    await next(f, [other]);
    await next(f, [first]);
    expect(readState(other).worktree).toBeDefined();
    expect(readState(first).worktree).toBeDefined();
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toHaveLength(2);
    const blocked: Result = await next(f, [second]);
    expect(blocked.code).not.toBe(0);
    expect(skips(blocked).some((skip) => skip.path === malformed)).toBe(true);
    expect(readState(second).worktree).toBeUndefined();
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toHaveLength(2);
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('next recovers only merge-phase work by ancestry against a non-default remote target', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await command(['git', 'remote', 'add', 'upstream', remote], f.root);
    await command(['git', 'push', 'upstream', 'HEAD:trunk'], f.root);
    yaml(resolve(f.root, 'issues/config.yaml'), { remote: 'upstream', default_branch: 'trunk', grounding: 'none' });
    const path: string = leaf(f, 'landed', 'plan.synthesis', {}, 'landing');
    holdTurns(f);
    expect((await next(f, ['landed'])).code).toBe(0);
    expect(readState(path).phase).toBe('plan.synthesis');
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'upstream', 'HEAD:trunk'], worktree);
    const gh: GhFixture = fakeGh(f);
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/landing'),
      closed: resolve(f.root, 'issues/closed/landing'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        {
          stdout: '',
          delayMs: 100,
          args: ['issue', 'close', '-R', 'team/project', '8', '--comment', 'delivered by landed'],
          probe,
        },
      ]),
    );
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    saveState(path, { ...readState(path), phase: 'merge', sources: ['team/project#8'] });
    const prompted: Result = await next(f, ['landed']);
    expect(prompted.code).toBe(0);
    seatOwned(path);
    expect((await next(f, ['landed'])).code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    const merges = (await delivered(f, 'landed')).filter((task) => task.seat === 'b');
    expect(merges.map((task) => task.text)).toEqual([mergeText(path)]);
    expect(merges[0].address).toBe(z.string().parse(readState(path).seat.B?.address));
    expect(merges[0].text.split(' leaf=')[1]?.split(' ')[0]).toBe(`${f.root}/issues/open/landing/landed`);
    const landedAttempt: string = z.string().parse(readState(path).batch?.attempt);
    await verified(f, 'landed', 'merge');
    expect(
      (
        await cli(
          f,
          ['phase', 'landed', 'merged', '--slot', 'B', '--check', '--attempt', landedAttempt],
          worktree,
          f.env,
        )
      ).code,
    ).toBe(0);
    const completed: Result = await cli(
      f,
      ['phase', 'landed', 'merged', '--slot', 'B', '--attempt', landedAttempt],
      worktree,
      f.env,
    );
    expect(completed.code).toBe(0);
    expect(completed.stdout).toContain('issue complete landing');
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(2);
    expect(readState(resolve(f.root, 'issues/closed/landing/landed')).phase).toBe('merged');
    expect(await liveTabs(f)).toEqual(['landed']);
    expect(existsSync(worktree)).toBe(true);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await liveTabs(f)).toEqual([]);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/landed'], f.root)).code).toBe(1);
  } finally {
    await f.clean();
  }
}, 20000);

test('a finished seat restarts with its task and the surviving slot keeps its terminal', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'exited', 'check.review');
    holdTurns(f);
    expect((await next(f, ['exited'])).code).toBe(0);
    const a: string = z.string().parse(readState(path).seat.A?.address);
    const b: string = z.string().parse(readState(path).seat.B?.address);
    expect((await f.core.hc(['kill', a])).code).toBe(0);
    const recovered: Result = await next(f, ['exited']);
    expect(recovered.code).toBe(0);
    expect(readState(path).seat.B?.address).toBe(b);
    const restarted: string = z.string().parse(readState(path).seat.A?.address);
    expect(restarted).not.toBe(a);
    expect(readState(path).attempts).toEqual({ A: 2, B: 1 });
    expect(f.core.tasks(restarted)).toEqual([`check-issue exited slot=A phase=check.review leaf=${path}`]);
    expect(f.core.tasks(b)).toHaveLength(1);
    expect(await liveTabs(f)).toEqual(['exited']);
  } finally {
    await f.clean();
  }
}, 15000);

test('uncommitted work in a merge worktree is left to the merge seat', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'dirty', 'plan.synthesis');
    holdTurns(f);
    expect((await next(f, ['dirty'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'forgotten'), 'never committed\n');
    saveState(path, { ...readState(path), phase: 'merge', prompted: {} });
    const result: Result = await next(f, ['dirty']);
    expect(result.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    const merges = (await delivered(f, 'dirty')).filter((task) => task.seat === 'b');
    expect(merges.map((task) => task.text)).toEqual([mergeText(path)]);
    expect(merges[0].address).toBe(z.string().parse(readState(path).seat.B?.address));
    expect(existsSync(resolve(worktree, 'forgotten'))).toBe(true);
  } finally {
    await f.clean();
  }
}, 15000);

test('a worktree parked mid-rebase is still dispatched', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'conflict', 'plan.synthesis');
    expect((await next(f, ['conflict'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'clash'), 'leaf side\n');
    await command(['git', 'add', 'clash'], worktree);
    await command(['git', 'commit', '-m', 'leaf side'], worktree);
    writeFileSync(resolve(f.root, 'clash'), 'main side\n');
    await command(['git', 'add', 'clash'], f.root);
    await command(['git', 'commit', '-m', 'main side'], f.root);
    expect((await run(['git', 'rebase', 'HEAD~1'], worktree)).code).toBe(0);
    expect((await run(['git', 'rebase', await command(['git', 'rev-parse', 'HEAD'], f.root)], worktree)).code).not.toBe(
      0,
    );
    expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('');
    const a: string = z.string().parse(readState(path).seat.A?.address);
    await seatIdle(f, a, 1);
    saveState(path, { ...readState(path), phase: 'check.fix', prompted: {} });
    expect((await next(f, ['conflict'])).code).toBe(0);
    expect(f.core.tasks(a)).toHaveLength(2);
  } finally {
    await f.clean();
  }
}, 15000);

test('a live merge retains its completion call after pushing, including a peer retry', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'active-merge', 'check.review');
    holdTurns(f);
    expect((await next(f, ['active-merge'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'origin', 'HEAD:main'], worktree);
    saveState(path, {
      ...readState(path),
      phase: 'merge',
      busy_since: { B: new Date(Date.now() - 61 * 60000).toISOString() },
      busy_notified: {},
    });
    const tasksBefore: number = (await allTasks(f)).length;
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    expect(await allTasks(f)).toHaveLength(tasksBefore);
    expect(readState(path).busy_since.B).toBeDefined();
    expect(readState(path).busy_notified.B).toBeDefined();
    expect(notices(f).at(-1)![2]).toContain('seat B');
    const mergeAttempt: string = z.string().parse(readState(path).batch?.attempt);
    await verified(f, 'active-merge', 'merge');
    expect(
      (
        await cli(
          f,
          ['phase', 'active-merge', 'merged', '--slot', 'B', '--check', '--attempt', mergeAttempt],
          worktree,
          f.env,
        )
      ).code,
    ).toBe(0);
    const completed: Result = await cli(
      f,
      ['phase', 'active-merge', 'merged', '--slot', 'B', '--attempt', mergeAttempt],
      worktree,
      f.env,
    );
    expect(completed.code).toBe(0);
    expect(completed.stdout).toContain('issue complete issue');
    expect(await liveTabs(f)).toEqual(['active-merge']);
  } finally {
    await f.clean();
  }
}, 15000);

test('seat names support identical repo-local slugs and long numeric-leading slugs', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    const slug: string = '123-this-is-a-valid-leaf-slug-longer-than-thirty-characters';
    leaf(f, slug, 'plan.synthesis');
    leaf(g, slug, 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['--all'], {}, f.home)).code).toBe(0);
    const seats: Terminal[] = [...(await seatTerminals(f, slug)), ...(await seatTerminals(g, slug))];
    const names: string[] = seats.map((t: Terminal) => z.string().parse(t.name));
    expect(names).toEqual([seatName('repo', 'rp', slug, 'a'), seatName('other', 'ot', slug, 'a')]);
    expect(new Set(names).size).toBe(2);
    expect(names.every((name: string) => /^[a-z0-9][a-z0-9_-]{0,31}$/.test(name))).toBe(true);
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toEqual([slug, slug]);
    expect(new Set([...(await allTasks(f)), ...(await allTasks(g))].map((task) => task.text))).toEqual(
      new Set([
        `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/${slug}`,
        `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${g.root}/issues/open/issue/${slug}`,
      ]),
    );
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('next awaits sourced completion after a failed rename before removing the worktree', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'rename', 'plan.synthesis');
    expect((await next(f, ['rename'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merged', sources: ['team/project#9'] });
    const closed: string = resolve(f.root, 'issues/closed/issue');
    mkdirSync(closed, { recursive: true });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    expect((await cli(f, ['phase', 'rename', 'merged'], f.root, f.env)).code).not.toBe(0);
    expect(readState(path).phase).toBe('merged');
    expect(existsSync(gh.db + '.calls')).toBe(false);
    rmSync(closed, { recursive: true });
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed,
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', delayMs: 100, probe },
        {
          stdout: '',
          delayMs: 100,
          args: ['issue', 'close', '-R', 'team/project', '9', '--comment', 'delivered by rename'],
          probe,
        },
      ]),
    );
    const recovered: Result = await next(f, ['rename']);
    expect(recovered).toMatchObject({ code: 0 });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(
      readFileSync(gh.db + '.probes', 'utf8')
        .trim()
        .split('\n'),
    ).toHaveLength(2);
    // Completion landed inside the targeted pass; reconciliation removes the
    // closed leaf's worktree in the same pass and a later pass leaves it gone.
    expect(existsSync(worktree)).toBe(false);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(await liveTabs(f)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 15000);

test('a merged sourced leaf with no recorded worktree completes on next', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'stuck', 'merged', { sources: ['team/project#1'] });
    const gh: GhFixture = fakeGh(f);
    const env: NodeJS.ProcessEnv = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed: resolve(f.root, 'issues/closed/issue'),
      lock: resolve(f.home, '.lock'),
      worktree: f.root,
    };
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        {
          stdout: '',
          args: ['issue', 'close', '-R', 'team/project', '1', '--comment', 'delivered by stuck'],
          probe,
        },
      ]),
    );
    const retried: Result = await cli(f, ['next', 'stuck'], f.root, env);
    expect(retried.stderr).not.toContain('worktree');
    expect(retried.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(resolve(f.root, 'issues/open/issue'))).toBe(false);
    expect(readState(resolve(f.root, 'issues/closed/issue/stuck')).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

const skipSchema = z.object({
  repo: z.string(),
  path: z.string(),
  slug: z.string().optional(),
  error: z.string(),
  count: z.number().int().optional(),
  paths: z.array(z.object({ path: z.string(), stored: z.string() })).optional(),
});
function skips(result: Result): z.infer<typeof skipSchema>[] {
  return result.stderr.split('\n').map((line) => skipSchema.parse(JSON.parse(line)));
}
function waits(result: Result): string[] {
  return result.stdout.split('\n').filter((line) => line.startsWith('waiting: '));
}
function configure(f: Fixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}

// Lets an allocated seat finish its turn and clears the delivery record, so the next pass prompts it again.
async function rePromptable(f: HcFixture, path: string): Promise<void> {
  await seatIdle(f, z.string().parse(readState(path).seat.A?.address), 1);
  saveState(path, { ...readState(path), prompted: {} });
}

for (const mode of ['startup', 'cwd'] as const) {
  test(`missing registration is isolated during ${mode}`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
      expect((await next(f, ['healthy'])).code).toBe(0);
      await rePromptable(f, healthy);
      const missing: string = resolve(f.home, 'deleted');
      configure(f, { repos: { missing, repo: f.root } });
      const result: Result = await next(
        f,
        mode === 'startup' ? ['--all'] : [],
        {},
        mode === 'startup' ? f.home : f.root,
      );
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(1);
      expect(skips(result)[0]).toMatchObject({ repo: 'missing', path: missing });
      expect(skips(result)[0].error).toContain('ENOENT');
      expect(await allTasks(f)).toHaveLength(2);
    } finally {
      await f.clean();
    }
  }, 15000);
}

test('missing dependencies skip their leaf while readable unmet dependencies wait and siblings dispatch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'broken', 'plan.synthesis', { 'blocked-by': ['nonexistent'] });
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['healthy'] });
    leaf(f, 'healthy', 'plan.synthesis');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result).map((s) => s.slug)).toEqual(['broken']);
    expect(skips(result)[0].error).toContain('nonexistent');
    expect(waits(result)).toEqual(['waiting: waiting on healthy (plan.synthesis)']);
    expect((await allTasks(f)).map((task) => task.text)).toEqual([
      `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
    ]);
  } finally {
    await f.clean();
  }
});

for (const capacity of [3, 4]) {
  test(`bad YAML and invalid states reserve occupancy at capacity ${capacity}`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
      expect((await next(f, ['healthy'])).code).toBe(0);
      await rePromptable(f, healthy);
      const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
      writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
      const invalid: string = leaf(f, 'invalid', 'not-a-phase');
      leaf(f, 'new', 'plan.synthesis');
      configure(f, { max_active: capacity });
      const result: Result = await next(f, ['--all']);
      expect(result.code).toBe(1);
      expect(
        skips(result)
          .map((skip) => skip.path)
          .sort(),
      ).toEqual([invalid, malformed].sort());
      expect(await liveTabs(f)).toHaveLength(capacity === 3 ? 1 : 2);
      expect(await allTasks(f)).toHaveLength(capacity === 3 ? 2 : 3);
      if (capacity === 3) {
        configure(f, { max_active: 5 });
        expect((await next(f, ['new'])).code).toBe(1);
        expect(await liveTabs(f)).toHaveLength(2);
      }
    } finally {
      await f.clean();
    }
  }, 15000);
}

test('dirty merged worktree is kept after its tab closes, then removed once clean', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const dirty: string = leaf(f, 'dirty', 'plan.synthesis', {}, 'dirty-issue');
    expect((await next(f, ['dirty'])).code).toBe(0);
    const worktree: string = readState(dirty).worktree!;
    writeFileSync(resolve(worktree, 'untracked'), 'dirty');
    saveState(dirty, { ...readState(dirty), phase: 'merged' });
    leaf(f, 'healthy', 'plan.synthesis', {}, 'healthy-issue');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    // The pass ended the merged leaf's seats; the dirty worktree is kept.
    expect(await seatTerminals(f, 'dirty', true)).toEqual([]);
    expect(existsSync(worktree)).toBe(true);
    expect((await allTasks(f)).at(-1)?.text).toContain('healthy');
    rmSync(resolve(worktree, 'untracked'));
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/dirty'], f.root)).code).toBe(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('bare next from inside the repo cleans up its merged leaves', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const done: string = leaf(f, 'done', 'plan.synthesis', {}, 'done-issue');
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(done).worktree!;
    saveState(done, { ...readState(done), phase: 'merged' });
    leaf(f, 'healthy', 'plan.synthesis', {}, 'healthy-issue');
    const result: Result = await next(f, []);
    expect(result.code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(await liveTabs(f)).toEqual(['healthy']);
  } finally {
    await f.clean();
  }
}, 15000);

for (const scope of ['global'] as const) {
  test(`${scope} lock acquisition failure is fatal`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = leaf(f, 'locked', 'plan.synthesis');
      leaf(f, 'zhealthy', 'plan.synthesis');
      symlinkSync(resolve(f.home, 'missing/lock'), resolve(f.home, '.lock'));
      const result: Result = await next(f, ['locked']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('lock');
      expect(result.stderr).not.toContain('"repo":"repo"');
      expect(database(f).prompts).toHaveLength(0);
    } finally {
      f.clean();
    }
  });
}

test('lock finalization failures remain fatal', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'healthy', 'plan.synthesis');
    const flock: string = resolve(f.home, 'bin/flock');
    writeFileSync(flock, '#!/bin/sh\nprintf locked\ncat >/dev/null\nprintf "finalization failure" >&2\nexit 7\n', {
      mode: 0o755,
    });
    const result: Result = await next(f, ['--all']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('finalization failure');
    expect(result.stderr).not.toContain('"repo":"repo"');
    expect(await allTasks(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
});

for (const invalid of ['duplicate', 'mismatch']) {
  test(`${invalid} leaf identity never dispatches an arbitrary leaf`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const path: string = leaf(f, 'ambiguous', 'plan.synthesis', invalid === 'mismatch' ? { repo: 'wrong' } : {});
      if (invalid === 'duplicate') leaf(f, 'ambiguous', 'plan.synthesis', {}, 'second');
      configure(f, { max_active: 4 });
      leaf(f, 'healthy', 'plan.synthesis');
      const result: Result = await next(f, ['--all']);
      expect(result.code).toBe(1);
      if (invalid === 'mismatch') {
        expect(skips(result)).toHaveLength(1);
        const summary: z.infer<typeof skipSchema> = skips(result)[0];
        expect(summary.repo).toBe('repo');
        expect(summary.count).toBe(1);
        expect(summary.paths).toContainEqual({ path, stored: 'wrong' });
        expect(skips(result).some((skip) => skip.error.includes('repo mismatch'))).toBe(false);
      } else {
        expect(skips(result).some((skip) => skip.path === path)).toBe(true);
      }
      const tasks = await allTasks(f);
      expect(tasks.every((task) => task.text.includes('healthy'))).toBe(true);
      expect(tasks).toHaveLength(1);
    } finally {
      await f.clean();
    }
  });
}

test('next selection and sweep report both repo keys without dispatching or changing the mismatched leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
    const selected: Result = await next(f, ['wrong-key']);
    expect(selected.code).not.toBe(0);
    expect(await allTasks(f)).toHaveLength(0);
    leaf(f, 'healthy', 'plan.synthesis');
    const sweep: Result = await next(f, ['--all']);
    expect(sweep.code).not.toBe(0);
    for (const result of [selected, sweep]) {
      expect(skips(result)).toHaveLength(1);
      const diagnostic: z.infer<typeof skipSchema> = skips(result)[0];
      expect(diagnostic.repo).toBe('repo');
      expect(diagnostic.count).toBe(1);
      expect(diagnostic.paths).toContainEqual({ path, stored: 'other' });
    }
    expect((await allTasks(f)).map((task) => task.text)).toEqual([
      `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
    ]);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
    expect(existsSync(resolve(storeDir(f), 'wrong-key'))).toBe(false);
  } finally {
    await f.clean();
  }
});

test('foreign leaves summarize once per repo with count and paths', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const a: string = leaf(f, 'foreign-a', 'plan.synthesis', { repo: 'other' });
    const b: string = leaf(f, 'foreign-b', 'plan.synthesis', { repo: 'other' });
    const c: string = leaf(f, 'foreign-c', 'plan.synthesis', { repo: 'third' });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    const summary: z.infer<typeof skipSchema> = skips(result)[0];
    expect(summary.repo).toBe('repo');
    expect(summary.count).toBe(3);
    expect(summary.paths).toHaveLength(3);
    expect(summary.paths).toContainEqual({ path: a, stored: 'other' });
    expect(summary.paths).toContainEqual({ path: b, stored: 'other' });
    expect(summary.paths).toContainEqual({ path: c, stored: 'third' });
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
}, 15000);

test('foreign leaves do not consume capacity while healthy leaves in both repos dispatch', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    const foreign: string[] = [];
    for (let i: number = 0; i < 5; i++) foreign.push(leaf(f, `foreign-${i}`, 'plan.synthesis', { repo: 'other' }));
    const before: string[] = foreign.map((p: string) => readFileSync(resolve(p, 'state.yaml'), 'utf8'));
    leaf(f, 'healthy', 'plan.synthesis');
    leaf(g, 'other-healthy', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2, repos: { repo: f.root, other: g.root } });
    const result: Result = await next(f, ['--all'], {}, f.home);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].count).toBe(5);
    const tasks = [...(await allTasks(f)), ...(await allTasks(g))];
    expect(tasks).toHaveLength(2);
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toHaveLength(2);
    expect(tasks.map((task) => task.text).sort()).toEqual(
      [
        `plan-issue healthy slot=A phase=plan.synthesis leaf=${f.root}/issues/open/issue/healthy`,
        `plan-issue other-healthy slot=A phase=plan.synthesis leaf=${g.root}/issues/open/issue/other-healthy`,
      ].sort(),
    );
    foreign.forEach((p: string, i: number) => expect(readFileSync(resolve(p, 'state.yaml'), 'utf8')).toBe(before[i]));
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('foreign slugs are missing for lookup and dispatch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const foreign: string = leaf(f, 'foreign-dep', 'plan.synthesis', { repo: 'other' });
    const before: string = readFileSync(resolve(foreign, 'state.yaml'), 'utf8');
    const blocked: string = leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['foreign-dep'] });
    const sweep: Result = await next(f, ['--all']);
    expect(sweep.code).toBe(1);
    expect(skips(sweep)).toHaveLength(2);
    const perLeaf: z.infer<typeof skipSchema> | undefined = skips(sweep).find((s) => s.slug === 'blocked');
    expect(perLeaf).toBeDefined();
    expect(perLeaf!.path).toBe(blocked);
    expect(perLeaf!.error).toContain('foreign-dep');
    expect(database(f).prompts).toHaveLength(0);
    const direct: Result = await next(f, ['foreign-dep']);
    expect(direct.code).not.toBe(0);
    expect(skips(direct)).toHaveLength(1);
    expect(skips(direct)[0].count).toBe(1);
    expect(skips(direct)[0].paths).toContainEqual({ path: foreign, stored: 'other' });
    expect(database(f).prompts).toHaveLength(0);
    expect(readFileSync(resolve(foreign, 'state.yaml'), 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
}, 15000);

test('unreadable leaves reserve capacity while foreign leaves summarize separately', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const fa: string = leaf(f, 'foreign-a', 'plan.synthesis', { repo: 'other' });
    const fb: string = leaf(f, 'foreign-b', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(2);
    const summary: z.infer<typeof skipSchema> | undefined = skips(result).find((s) => s.count !== undefined);
    expect(summary).toBeDefined();
    expect(summary!.repo).toBe('repo');
    expect(summary!.count).toBe(2);
    expect(summary!.paths).toContainEqual({ path: fa, stored: 'other' });
    expect(summary!.paths).toContainEqual({ path: fb, stored: 'other' });
    expect(skips(result).some((s) => s.path === malformed)).toBe(true);
    expect(readState(healthy).worktree).toBeDefined();
    expect(await allTasks(f)).toHaveLength(1);
    expect(await liveTabs(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('merged foreign leaves survive cleanup with worktree branch and tab intact', async () => {
  const f: HcFixture = await hcFixture({ window: 'open' });
  const stopAdopt: () => void = adopt(f.core);
  try {
    const open: string = leaf(f, 'survivor', 'plan.synthesis');
    expect((await next(f, ['survivor'])).code).toBe(0);
    const dispatched: State = readState(open);
    const worktree: string = z.string().parse(dispatched.worktree);
    saveState(open, { ...dispatched, repo: 'other', phase: 'merged' });
    mkdirSync(resolve(f.root, 'issues/closed/issue'), { recursive: true });
    const closed: string = resolve(f.root, 'issues/closed/issue/survivor');
    renameSync(open, closed);
    const before: string = readFileSync(resolve(closed, 'state.yaml'), 'utf8');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].count).toBe(1);
    expect(skips(result)[0].paths).toContainEqual({ path: closed, stored: 'other' });
    expect(readFileSync(resolve(closed, 'state.yaml'), 'utf8')).toBe(before);
    expect(existsSync(worktree)).toBe(true);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/survivor'], f.root)).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['survivor']);
    expect(f.core.appCalls().filter((call) => call.argv[1] === 'tab.close')).toEqual([]);
  } finally {
    stopAdopt();
    await f.clean();
  }
}, 15000);

test('a sweep leaves closed merged leaves untouched', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const open: string = leaf(f, 'archived', 'merged');
    mkdirSync(resolve(f.root, 'issues/closed/issue'), { recursive: true });
    renameSync(open, resolve(f.root, 'issues/closed/issue/archived'));
    expect((await next(f, ['--all'])).code).toBe(0);
    const timings: string = resolve(f.root, 'issues/timings.jsonl');
    const events: string = existsSync(timings) ? readFileSync(timings, 'utf8') : '';
    expect(events).not.toContain('"slug":"archived"');
  } finally {
    f.clean();
  }
}, 15000);

test('next --resume starts an open dependent of an already closed leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'done', 'merged', {}, 'done-owner');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/done-owner'), resolve(f.root, 'issues/closed/done-owner'));
    const child: string = leaf(f, 'child', 'plan.synthesis', { 'blocked-by': ['done'] }, 'child-owner');
    expect((await next(f, ['--resume'], {}, f.home)).code).toBe(0);
    expect(readState(child).tab).toBeDefined();
  } finally {
    await f.clean();
  }
}, 15000);

test('two repos summarize once per repo on every invocation', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const g: Fixture = await fixture();
  try {
    const fa: string = leaf(f, 'foreign-in-repo', 'plan.synthesis', { repo: 'other' });
    const fb: string = leaf(g, 'foreign-in-other', 'plan.synthesis', { repo: 'repo' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    for (let i: number = 0; i < 2; i++) {
      const result: Result = await next(f, ['--all'], {}, f.home);
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(2);
      const byRepo: Map<string, z.infer<typeof skipSchema>> = new Map(skips(result).map((s) => [s.repo, s]));
      expect(byRepo.get('repo')?.count).toBe(1);
      expect(byRepo.get('other')?.count).toBe(1);
      expect(byRepo.get('repo')?.paths).toContainEqual({ path: fa, stored: 'other' });
      expect(byRepo.get('other')?.paths).toContainEqual({ path: fb, stored: 'repo' });
    }
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
    g.clean();
  }
}, 15000);

for (const moved of ['worktree root', 'repo root'] as const) {
  test(`changed ${moved} reports recorded and expected worktrees without creating or prompting`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const recorded: string = resolve(f.root, 'issues/worktrees/relocated');
      await command(['git', 'worktree', 'add', '-b', 'relocated', recorded], f.root);
      leaf(f, 'relocated', 'plan.synthesis', { worktree: recorded });
      const root: string = moved === 'repo root' ? resolve(f.home, 'moved-repo') : f.root;
      const worktreeRoot: string = moved === 'worktree root' ? resolve(f.home, 'new-store') : storeDir(f);
      if (moved === 'repo root') renameSync(f.root, root);
      else yaml(resolve(root, 'issues/config.yaml'), { worktree_root: worktreeRoot, grounding: 'none' });
      configure(f, { repos: { repo: root } });
      const relocated: HcFixture = { ...f, root };
      const path: string = resolve(root, 'issues/open/issue/relocated');
      const before: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
      const expected: string = resolve(root, worktreeRoot, 'relocated');
      const existing: boolean = existsSync(expected);
      const worktrees: string = await command(['git', 'worktree', 'list', '--porcelain'], root);
      const result: Result = await next(relocated, ['relocated']);
      expect(result.code).not.toBe(0);
      expect(skips(result)).toHaveLength(1);
      const error: string = skips(result)[0].error;
      expect(error).toContain(recorded);
      expect(error).toContain(expected);
      expect(error).toMatch(/recorded/i);
      expect(error).toMatch(/expected/i);
      expect(error).toMatch(/move/i);
      expect(error).toMatch(/restore/i);
      if (moved === 'repo root') {
        expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(before);
        expect(existsSync(expected)).toBe(existing);
        expect(await command(['git', 'worktree', 'list', '--porcelain'], root)).toBe(worktrees);
      } else {
        // DC4: the pass migrates the clean old-root worktree even with a
        // configured destination store, then clears the recorded path.
        expect(existsSync(recorded)).toBe(false);
        expect(readState(path).worktree).toBeUndefined();
        expect(await command(['git', 'worktree', 'list', '--porcelain'], root)).not.toContain(recorded);
      }
      expect(await allTasks(f)).toHaveLength(0);
      expect(await liveTabs(f)).toEqual([]);
    } finally {
      await f.clean();
    }
  });
}

test('moving a repo with the same registered key supports status, phase and dispatch without a recorded worktree', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'movable', 'plan.synthesis');
    const root: string = resolve(f.home, 'moved-repo');
    renameSync(f.root, root);
    configure(f, { repos: { repo: root } });
    const moved: HcFixture = { ...f, root };
    const status: Result = await cli(moved, ['status', 'movable']);
    expect(status.code).toBe(0);
    expect(status.stdout).toContain('repo: repo');
    expect((await cli(moved, ['phase', 'movable', 'implement', '--slot', 'A'])).code).toBe(0);
    expect((await next(moved, ['movable'])).code).toBe(0);
    const state: State = readState(resolve(root, 'issues/open/issue/movable'));
    expect(state.repo).toBe('repo');
    expect(state.phase).toBe('implement');
    expect(state.worktree).toBe(resolve(storeDir(f), 'movable'));
    expect(await command(['git', 'branch', '--show-current'], state.worktree)).toBe('movable');
    expect((await allTasks(f)).map((task) => task.text)).toEqual([
      `implement-issue movable slot=A phase=implement leaf=${root}/issues/open/issue/movable`,
    ]);
  } finally {
    await f.clean();
  }
});

test('unknown directory population reserves all new capacity but allows existing tabs', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const healthy: string = leaf(f, 'healthy', 'plan.synthesis');
    expect((await next(f, ['healthy'])).code).toBe(0);
    await rePromptable(f, healthy);
    leaf(f, 'new', 'plan.synthesis');
    const closed: string = resolve(f.root, 'issues/closed');
    writeFileSync(closed, 'not a directory');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0].path).toBe(closed);
    expect(skips(result)[0].error).toContain('ENOTDIR');
    expect(await liveTabs(f)).toEqual(['healthy']);
    expect(await allTasks(f)).toHaveLength(2);
  } finally {
    await f.clean();
  }
});

test('non-Error throws cross the scoped discovery boundary unchanged', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const script: string = resolve(f.home, 'non-error.ts');
    writeFileSync(
      script,
      `import { mock } from 'bun:test';
import * as config from ${JSON.stringify(resolve(import.meta.dir, '../src/config.ts'))};
mock.module(${JSON.stringify(resolve(import.meta.dir, '../src/config.ts'))}, () => ({ ...config, readRepo: () => { throw 'non-error-sentinel'; } }));
const { nextCommand } = await import(${JSON.stringify(resolve(import.meta.dir, '../src/next.ts'))});
try { await nextCommand('--all'); process.exit(2); } catch (error) { if (error !== 'non-error-sentinel') throw error; console.error(error); process.exit(9); }
`,
    );
    const { stderr, code }: Result = await spawnCaptured([process.execPath, script], {
      env: { ...process.env, ...f.env, AKROGON_HOME: f.home },
    });
    expect(code).toBe(9);
    expect(stderr.trim()).toBe('non-error-sentinel');
  } finally {
    f.clean();
  }
});

test('explicit unreadable targets retain the original error without a missing-target stack', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    for (const input of ['malformed', malformed]) {
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(1);
      expect(skips(result)).toHaveLength(1);
      expect(skips(result)[0].path).toBe(malformed);
      expect(skips(result)[0].error).not.toContain('Missing');
    }
    rmSync(malformed, { recursive: true });
    const missing: Result = await next(f, ['nonexistent']);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('Missing leaf');
  } finally {
    f.clean();
  }
});

test('a selected leaf removed before its global lock is reported as skipped', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const gone: string = leaf(f, 'gone', 'plan.synthesis');
    writeFileSync(
      resolve(f.home, 'bin/flock'),
      '#!/bin/sh\nif [ "$2" = "$REMOVE_BEFORE_LOCK" ]; then rm -r "$REMOVE_LEAF"; fi\nexec /usr/bin/flock "$@"\n',
      { mode: 0o755 },
    );
    const result: Result = await next(f, ['gone'], {
      REMOVE_BEFORE_LOCK: resolve(f.home, '.lock'),
      REMOVE_LEAF: gone,
    });
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    expect(skips(result)[0]).toMatchObject({ slug: 'gone', path: gone });
    expect(database(f).prompts).toHaveLength(0);
  } finally {
    f.clean();
  }
});

// Waits until a seat has ended the turn of every task it received.
async function quiet(f: HcFixture, address: string): Promise<Terminal> {
  return seatIdle(f, address, f.core.tasks(address).length);
}

test('blocked merge seat B prevents fetch and clean checks in a dirty worktree', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'blocked-merge', 'plan.synthesis');
    expect((await next(f, ['blocked-merge'])).code).toBe(0);
    await quiet(f, z.string().parse(readState(path).seat.A?.address));
    holdTurns(f, 'blocked:kind=permission:msg=Allow?');
    expect((await cli(f, ['seat', 'blocked-merge', 'B'], f.root, f.env)).code).toBe(0);
    const b: string = z.string().parse(readState(path).seat.B?.address);
    await f.core.waitFor(b, (t: Terminal) => t.status?.state === 'blocked');
    const state: State = readState(path);
    writeFileSync(resolve(state.worktree!, 'unfinished'), 'dirty merge work\n');
    saveState(path, { ...state, phase: 'merge' });
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    const gitLog: string = resolve(f.home, 'git.calls');
    writeFileSync(
      resolve(f.home, 'bin/git'),
      '#!/bin/sh\nprintf "%s\\n" "$*" >> "$GIT_CALL_LOG"\nexec "$REAL_GIT" "$@"\n',
      { mode: 0o755 },
    );
    const before: State = readState(path);
    const tasksBefore = await allTasks(f);
    const observedAt: number = Date.now();
    const result: Result = await next(f, ['blocked-merge'], { REAL_GIT: realGit, GIT_CALL_LOG: gitLog });
    const gitCalls: string[] = readFileSync(gitLog, 'utf8').trim().split('\n');
    expect(gitCalls).not.toContain('status --porcelain');
    expect(result.code).toBe(0);
    const after: State = readState(path);
    const since: string = z.string().datetime().parse(after.busy_since.B);
    expect(before.busy_since.B).toBeUndefined();
    expect(Date.parse(since)).toBeGreaterThanOrEqual(observedAt);
    expect(Date.parse(since)).toBeLessThanOrEqual(Date.now());
    // The batch pass built and applied a member-less record without touching the seat.
    expect(after.batch?.applied).toBe(true);
    const { batch, ...rest }: State = after;
    expect(rest).toEqual({ ...before, busy_since: { B: since }, busy_notified: {} });
    expect(await allTasks(f)).toEqual(tasksBefore);
    expect(await seatTerminals(f, 'blocked-merge', true)).toHaveLength(2);
    expect(readFileSync(resolve(state.worktree!, 'unfinished'), 'utf8')).toBe('dirty merge work\n');
  } finally {
    await f.clean();
  }
});

test('one pass reads the registered root common dir and remote url once each', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const paths: string[] = ['aa', 'bb'].map((slug: string) => leaf(f, slug, 'plan.synthesis'));
    holdTurns(f);
    for (const slug of ['aa', 'bb']) expect((await next(f, [slug])).code).toBe(0);
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    const gitLog: string = resolve(f.home, 'git.calls');
    writeFileSync(
      resolve(f.home, 'bin/git'),
      '#!/bin/sh\nprintf "%s|%s\\n" "$(pwd)" "$*" >> "$GIT_CALL_LOG"\nexec "$REAL_GIT" "$@"\n',
      { mode: 0o755 },
    );
    expect((await next(f, ['--all'], { REAL_GIT: realGit, GIT_CALL_LOG: gitLog })).code).toBe(0);
    const lines: string[] = readFileSync(gitLog, 'utf8').trim().split('\n');
    const count = (cwd: string, args: string): number => lines.filter((line) => line === `${cwd}|${args}`).length;
    const worktrees: string[] = paths.map((path) => readState(path).worktree!);
    // One read per registered root per run; a worktree's own common dir keeps its one read.
    expect(count(f.root, 'rev-parse --git-common-dir')).toBe(1);
    for (const worktree of worktrees) expect(count(worktree, 'rev-parse --git-common-dir')).toBe(1);
    expect(count(f.root, 'remote get-url origin')).toBe(1);
    // The branch tip is re-read on every decision; the single remaining read is self-update's.
    expect(count(f.root, 'rev-parse HEAD')).toBe(1);
  } finally {
    await f.clean();
  }
}, 20000);

test('a blocked non-merge seat does not stall a merge leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'blocked-merge', 'plan.synthesis');
    holdTurns(f, 'blocked:kind=permission:msg=Allow?');
    expect((await next(f, ['blocked-merge'])).code).toBe(0);
    const state: State = readState(path);
    await f.core.waitFor(z.string().parse(state.seat.A?.address), (t: Terminal) => t.status?.state === 'blocked');
    writeFileSync(resolve(state.worktree!, 'unfinished'), 'dirty merge work\n');
    saveState(path, { ...state, phase: 'merge' });
    const result: Result = await next(f, ['blocked-merge']);
    expect(result.code).toBe(0);
    expect(readState(path).phase).toBe('merge');
    const merges = (await delivered(f, 'blocked-merge')).filter((task) => task.seat === 'b');
    expect(merges.map((task) => task.text)).toEqual([mergeText(path)]);
    expect(merges[0].address).toBe(z.string().parse(readState(path).seat.B?.address));
    expect(readState(path).busy_since.A).toBeDefined();
    expect(readFileSync(resolve(state.worktree!, 'unfinished'), 'utf8')).toBe('dirty merge work\n');
  } finally {
    await f.clean();
  }
}, 15000);

test('merge, check.fix, check.repair and post-repair review dispatch to their swapped seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'post-repair', 'plan.synthesis');
    expect((await next(f, ['post-repair'])).code).toBe(0);
    const state: State = readState(path);
    const a: string = z.string().parse(state.seat.A?.address);
    const worktree: string = z.string().parse(state.worktree);
    writeFileSync(resolve(worktree, 'change'), 'fix\n');
    await command(['git', 'add', 'change'], worktree);
    await command(['git', 'commit', '-m', 'change'], worktree);
    await quiet(f, a);
    saveState(path, { ...state, phase: 'merge', prompted: {} });
    expect((await next(f, ['post-repair'])).code).toBe(0);
    seatOwned(path);
    expect((await next(f, ['post-repair'])).code).toBe(0);
    const b: string = z.string().parse(readState(path).seat.B?.address);
    expect(f.core.tasks(b)).toEqual([mergeText(path)]);
    const move = async (phase: State['phase'], extra: object = {}): Promise<void> => {
      await quiet(f, a);
      await quiet(f, b);
      saveState(path, { ...readState(path), phase, ...extra, prompted: {} });
      expect((await next(f, ['post-repair'])).code).toBe(0);
    };
    await move('check.fix');
    expect(f.core.tasks(a).at(-1)).toBe(`implement-issue post-repair slot=A phase=check.fix leaf=${path}`);
    await move('check.review', { fix_rounds: 1 });
    expect(f.core.tasks(b).at(-1)).toBe(`check-issue post-repair slot=B phase=check.review leaf=${path}`);
    await move('check.repair');
    expect(f.core.tasks(b).at(-1)).toBe(`check-issue post-repair slot=B phase=check.repair leaf=${path}`);
    expect(f.core.tasks(a)).toHaveLength(2);
    expect(f.core.tasks(b)).toHaveLength(3);
    expect(readState(path).seat.A?.address).toBe(a);
    expect(readState(path).seat.B?.address).toBe(b);
  } finally {
    await f.clean();
  }
}, 15000);

function tabCloses(f: HcFixture): string[][] {
  return f.core
    .appCalls()
    .map((call) => call.argv)
    .filter((argv) => argv[1] === 'tab.close');
}

test('startup retries closure before cleanup and retains failed owners with their worktree and branch while the tab closes', async () => {
  const f: HcFixture = await hcFixture({ window: 'open' });
  const stopAdopt: () => void = adopt(f.core);
  try {
    const path: string = leaf(f, 'retry', 'plan.synthesis');
    expect((await next(f, ['retry'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge', ...holding(f), sources: ['team/project#1'] });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed: resolve(f.root, 'issues/closed/issue'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    const failure: GhStep[] = [
      { stdout: '', code: 1, stderr: 'offline', probe },
      { stdout: '', code: 1, stderr: 'offline', probe },
    ];
    writeFileSync(gh.db, JSON.stringify(failure));
    expect((await cli(f, ['phase', 'retry', 'merged'], f.root, f.env)).code).not.toBe(0);
    writeFileSync(gh.db, JSON.stringify(failure));
    const failed: Result = await next(f, ['--all']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('offline');
    expect(existsSync(worktree)).toBe(true);
    expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('retry');
    expect(await seatTerminals(f, 'retry', true)).toEqual([]);
    expect(tabCloses(f)).toHaveLength(1);
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        { stdout: '', probe },
      ]),
    );
    const retried: Result = await next(f, ['--all']);
    expect(retried.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    expect(existsSync(probe.closed)).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/retry'], f.root)).code).toBe(1);
    expect(await liveTabs(f)).toEqual([]);
  } finally {
    stopAdopt();
    await f.clean();
  }
}, 15000);

for (const mode of ['--resume', '--all'] as const) {
  test(`startup retains a merged leaf's worktree and branch while closing its tab as an epic sibling stays unfinished (${mode})`, async () => {
    const f: HcFixture = await hcFixture({ window: 'open' });
    const stopAdopt: () => void = adopt(f.core);
    try {
      const path: string = leaf(f, 'done', 'plan.synthesis', {}, 'epic/first');
      leaf(f, 'hold', 'failed', {}, 'other');
      leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
      expect((await next(f, ['done'])).code).toBe(0);
      const worktree: string = readState(path).worktree!;
      saveState(path, { ...readState(path), phase: 'merge', ...holding(f) });
      expect((await cli(f, ['phase', 'done', 'merged'], f.root, f.env)).code).toBe(0);
      expect((await next(f, [mode], {}, f.home)).code).toBe(mode === '--all' ? 1 : 0);
      expect(readState(path).phase).toBe('merged');
      expect(await liveTabs(f)).toEqual([]);
      expect(tabCloses(f)).toHaveLength(1);
      expect(existsSync(worktree)).toBe(true);
      expect(await command(['git', 'branch', '--show-current'], worktree)).toBe('done');
    } finally {
      stopAdopt();
      await f.clean();
    }
  }, 15000);
}

test('a merged leaf whose tab is already gone makes no tab close call', async () => {
  const f: HcFixture = await hcFixture({ window: 'open' });
  const stopAdopt: () => void = adopt(f.core);
  try {
    const path: string = leaf(f, 'gone', 'plan.synthesis', {});
    expect((await next(f, ['gone'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    saveState(path, { ...readState(path), phase: 'merge', ...holding(f), sources: ['team/project#1'] });
    const gh: GhFixture = fakeGh(f);
    f.env = { ...f.env, ...gh.env, PATH: `${resolve(f.home, 'gh-bin')}:${f.env.PATH}` };
    const probe: NonNullable<GhStep['probe']> = {
      open: resolve(f.root, 'issues/open/issue'),
      closed: resolve(f.root, 'issues/closed/issue'),
      lock: resolve(f.home, '.lock'),
      worktree,
    };
    const failure: GhStep[] = [
      { stdout: '', code: 1, stderr: 'offline', probe },
      { stdout: '', code: 1, stderr: 'offline', probe },
    ];
    writeFileSync(gh.db, JSON.stringify(failure));
    expect((await cli(f, ['phase', 'gone', 'merged'], f.root, f.env)).code).not.toBe(0);
    for (const seat of await seatTerminals(f, 'gone', true)) {
      await f.core.hc(['kill', seat.address]);
      expect((await f.core.hc(['rm', seat.address])).code).toBe(0);
    }
    writeFileSync(gh.db, JSON.stringify(failure));
    const failed: Result = await next(f, ['--all']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('offline');
    expect(existsSync(worktree)).toBe(true);
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '{"state":"OPEN"}', probe },
        { stdout: '', probe },
      ]),
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(probe.closed)).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    expect(tabCloses(f)).toEqual([]);
  } finally {
    stopAdopt();
    await f.clean();
  }
}, 15000);

test('next --resume re-prompts allocated idle leaves in every registered repo without allocating new work', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    const aOld: string = leaf(f, 'a-old', 'plan.synthesis');
    const bOld: string = leaf(g, 'b-old', 'plan.synthesis', { repo: 'other' });
    configure(f, { repos: { repo: f.root, other: g.root } });
    expect((await next(f, ['a-old'])).code).toBe(0);
    expect((await next(f, ['b-old'], {}, g.root)).code).toBe(0);
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toEqual(['a-old', 'b-old']);
    await rePromptable(f, aOld);
    await rePromptable(g, bOld);
    const aNew: string = leaf(f, 'a-new', 'plan.synthesis');
    const bNew: string = leaf(g, 'b-new', 'plan.synthesis', { repo: 'other' });
    const result: Result = await next(f, ['--resume'], {}, f.home);
    expect(result.code).toBe(0);
    const tasks = [...(await allTasks(f)), ...(await allTasks(g))];
    expect(tasks.map((task) => task.text).sort()).toEqual(
      [
        `plan-issue a-old slot=A phase=plan.synthesis leaf=${aOld}`,
        `plan-issue a-old slot=A phase=plan.synthesis leaf=${aOld}`,
        `plan-issue b-old slot=A phase=plan.synthesis leaf=${bOld}`,
        `plan-issue b-old slot=A phase=plan.synthesis leaf=${bOld}`,
      ].sort(),
    );
    expect([...(await liveTabs(f)), ...(await liveTabs(g))]).toEqual(['a-old', 'b-old']);
    for (const path of [aNew, bNew]) {
      expect(readState(path).tab).toBeUndefined();
      expect(readState(path).worktree).toBeUndefined();
      expect(readState(path).attempts).toEqual({ A: 0, B: 0 });
    }
    for (const args of [
      ['--resume', 'a-old'],
      ['--resume', '--all'],
    ])
      expect((await next(f, args, {}, f.home)).code).not.toBe(0);
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('next --resume completes and cleans a merged leaf and starts its dependent', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const done: string = leaf(f, 'done', 'plan.synthesis', {}, 'solo');
    const dependent: string = leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['done'] }, 'dep-issue');
    holdTurns(f);
    expect((await next(f, ['done'])).code).toBe(0);
    const worktree: string = readState(done).worktree!;
    saveState(done, { ...readState(done), phase: 'merged' });
    expect(existsSync(done)).toBe(true);
    expect(readState(done).phase).toBe('merged');
    const result: Result = await next(f, ['--resume'], {}, f.home);
    expect(result.code).toBe(0);
    expect(existsSync(resolve(f.root, 'issues/closed/solo'))).toBe(true);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/done'], f.root)).code).toBe(1);
    expect(await liveTabs(f)).toEqual(['dependent']);
    expect(await delivered(f, 'dependent')).toEqual([
      {
        seat: 'a',
        address: z.string().parse(readState(dependent).seat.A?.address),
        text: `plan-issue dependent slot=A phase=plan.synthesis leaf=${dependent}`,
      },
    ]);
    expect(readState(dependent).tab).toBeDefined();
    expect(readState(dependent).worktree).toBeDefined();
    expect(readState(dependent).attempts).toEqual({ A: 1, B: 0 });
  } finally {
    await f.clean();
  }
}, 15000);

for (const area of ['open', 'closed']) {
  for (const nesting of ['', 'invalid', 'epic/issue/extra/invalid']) {
    test(`explicit next rejects ${area}/${nesting} before any flock`, async () => {
      const f: DispatchFixture = await dispatchFixture();
      try {
        const source: string = leaf(f, 'invalid', area === 'closed' ? 'merged' : 'plan.synthesis');
        const path: string = resolve(f.root, 'issues', area, nesting);
        mkdirSync(path, { recursive: true });
        renameSync(resolve(source, 'state.yaml'), resolve(path, 'state.yaml'));
        rmSync(source, { recursive: true });
        const state: string = readFileSync(resolve(path, 'state.yaml'), 'utf8');
        const db: string = readFileSync(f.db, 'utf8');
        writeFileSync(resolve(f.home, 'bin/flock'), '#!/bin/sh\nprintf invoked > "$FLOCK_CALLS"\nexit 91\n', {
          mode: 0o755,
        });
        for (const input of ['invalid', path]) {
          const result: Result = await cli(
            f,
            ['next', input],
            f.root,
            { ...f.env, FLOCK_CALLS: resolve(f.home, 'flock-calls') },
            3000,
          );
          expect(result.code).toBe(1);
          expect(result.stderr).toContain(resolve(path, 'state.yaml'));
          expect(result.stderr).toContain('Invalid leaf depth');
          expect(existsSync(resolve(f.home, 'flock-calls'))).toBe(false);
          expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).toBe(state);
          expect(readFileSync(f.db, 'utf8')).toBe(db);
          expect(calls(f)).toEqual([]);
          expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
          expect(existsSync(storeDir(f))).toBe(false);
          expect(existsSync(resolve(f.home, '.lock'))).toBe(false);
          console.log(result.stderr);
        }
      } finally {
        f.clean();
      }
    }, 10000);
  }
}

for (const route of ['--all', '.']) {
  test(`invalid merged depth stays excluded during ${route} with healthy work`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      configure(f, { max_active: 4 });
      leaf(f, 'healthy', 'plan.synthesis');
      const bad: string = leaf(
        f,
        'invalid',
        'merged',
        { tab: 'invalid-tab', worktree: resolve(f.home, 'invalid-worktree') },
        'epic/issue/extra',
      );
      mkdirSync(resolve(f.home, 'invalid-worktree'));
      const before: string = readFileSync(resolve(bad, 'state.yaml'), 'utf8');
      const result: Result = await next(f, [route]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(resolve(bad, 'state.yaml'));
      const tasks = await allTasks(f);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].text).toContain('healthy');
      expect(readFileSync(resolve(bad, 'state.yaml'), 'utf8')).toBe(before);
      expect(existsSync(resolve(f.home, 'invalid-worktree'))).toBe(true);
      expect(readFileSync(f.core.shimLog, 'utf8')).not.toContain('invalid-tab');
      expect(f.core.appCalls().filter((call) => call.argv.includes('invalid-tab'))).toEqual([]);
    } finally {
      await f.clean();
    }
  });
}

for (const owner of ['issue', 'epic/issue']) {
  test(`next identifies dormant ${owner}/resting without parsing and prefers active leaves`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const parked: string = resolve(f.root, 'issues/parked', owner, 'resting');
      mkdirSync(parked, { recursive: true });
      writeFileSync(resolve(parked, 'state.yaml'), 'slug: [');
      const result: Result = await next(f, ['resting']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Missing leaf: resting (parked)');
      for (const slug of ['absent', 'issue', 'epic']) {
        const missing: Result = await next(f, [slug]);
        expect(missing.code).toBe(1);
        expect(missing.stderr).toContain(`Missing leaf: ${slug}`);
        expect(missing.stderr.split('\n').find((line) => line.startsWith('error: '))).toBe(
          `error: Missing leaf: ${slug}`,
        );
      }
      expect(readFileSync(f.core.shimLog, 'utf8')).toBe('');
      leaf(f, 'resting', 'plan.synthesis', {}, 'active-issue');
      expect((await next(f, ['resting'])).code).toBe(0);
      expect(await allTasks(f)).toHaveLength(1);
      renameSync(resolve(f.root, 'issues/open'), resolve(f.root, 'issues/closed'));
      expect((await next(f, ['resting'])).code).toBe(0);
    } finally {
      await f.clean();
    }
  });
}

test('merge leaf with landed branch re-prompts its idle seat instead of auto-recovering', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'landed-merge', 'check.review');
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    writeFileSync(resolve(worktree, 'landed'), 'real change\n');
    await command(['git', 'add', 'landed'], worktree);
    await command(['git', 'commit', '-m', 'landed change'], worktree);
    await command(['git', 'push', 'origin', 'HEAD:main'], worktree);
    const b: string = z.string().parse(readState(path).seat.B?.address);
    await quiet(f, z.string().parse(readState(path).seat.A?.address));
    await quiet(f, b);
    saveState(path, { ...readState(path), phase: 'merge', prompted: {} });
    const tasksBefore: number = f.core.tasks(b).length;
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    seatOwned(path);
    expect((await next(f, ['landed-merge'])).code).toBe(0);
    expect(f.core.tasks(b)).toHaveLength(tasksBefore + 1);
    expect(f.core.tasks(b).at(-1)).toBe(mergeText(path));
    expect(readState(path).seat.B?.address).toBe(b);
    expect(readState(path).phase).toBe('merge');
  } finally {
    await f.clean();
  }
}, 15000);

test('spaced repo root dispatches leaf= with the complete spaced authoritative folder', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const spaced: string = resolve(f.home, 'repo root');
    renameSync(f.root, spaced);
    configure(f, { repos: { repo: spaced } });
    const f2: HcFixture = { ...f, root: spaced };
    leaf(f2, 'spaced', 'plan.synthesis');
    expect((await next(f2, ['spaced'])).code).toBe(0);
    expect((await allTasks(f)).map((task) => task.text)).toEqual([
      `plan-issue spaced slot=A phase=plan.synthesis leaf=${spaced}/issues/open/issue/spaced`,
    ]);
  } finally {
    await f.clean();
  }
}, 15000);

test('a failed leaf with its tab still open does not count toward max_active', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const first: string = leaf(f, 'first', 'plan.synthesis', {}, 'first-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', {}, 'second-issue');
    configure(f, { max_active: 1 });
    holdTurns(f);
    expect((await next(f, ['first'])).code).toBe(0);
    saveState(first, {
      ...readState(first),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'B', reason: 'capacity test' },
      busy_since: {},
      busy_notified: {},
    });
    expect((await next(f, ['second'])).code).toBe(0);
    expect(await liveTabs(f)).toEqual(['first', 'second']);
    expect(readState(second).attempts.A).toBe(1);
    expect(readState(second).worktree).toBeDefined();
  } finally {
    await f.clean();
  }
}, 15000);

test('a failed leaf does not reserve capacity in the unreadable branch', async () => {
  const f: HcFixture = await hcFixture();
  const g: HcFixture = await otherRepo(f);
  try {
    const failedPath: string = leaf(f, 'failed-one', 'plan.synthesis', {}, 'failed-issue');
    holdTurns(f);
    expect((await next(f, ['failed-one'])).code).toBe(0);
    saveState(failedPath, {
      ...readState(failedPath),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'B', reason: 'capacity test' },
      busy_since: {},
      busy_notified: {},
    });
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis', {}, 'bad-issue');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const healthy: string = leaf(g, 'healthy', 'plan.synthesis', { repo: 'other' });
    configure(f, { max_active: 2, repos: { repo: f.root, other: g.root } });
    const result: Result = await next(f, [healthy]);
    expect(result.code).toBe(1);
    expect(skips(result).map((skip) => skip.path)).toContain(malformed);
    expect([...(await liveTabs(f)), ...(await liveTabs(g))].sort()).toEqual(['failed-one', 'healthy']);
    expect(readState(healthy).attempts.A).toBe(1);
    expect(readState(healthy).worktree).toBeDefined();
  } finally {
    await f.clean();
    await g.clean();
  }
}, 15000);

test('a failed leaf with a blocked seat is not seat-observed', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'stuck', 'plan.synthesis');
    holdTurns(f, 'blocked:kind=permission:msg=Allow?');
    expect((await next(f, ['stuck'])).code).toBe(0);
    const a: string = z.string().parse(readState(path).seat.A?.address);
    await f.core.waitFor(a, (t: Terminal) => t.status?.state === 'blocked');
    expect(f.core.tasks(a)).toHaveLength(1);
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'stuck test' },
      busy_since: {},
      busy_notified: {},
    });
    expect((await next(f, ['stuck'])).code).toBe(1);
    expect((await next(f, ['stuck'])).code).toBe(1);
    expect(readState(path).busy_since).toEqual({});
    expect(readState(path).busy_notified).toEqual({});
    expect(f.core.tasks(a)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('failed seat starts keep the leaf in phase, uncharged, until a start succeeds', async () => {
  const f: HcFixture = await hcFixture({ mode: 'exit' });
  try {
    const path: string = leaf(f, 'start-fails', 'plan.synthesis');
    for (let pass: number = 0; pass < 3; pass++) {
      const failed: Result = await next(f, ['start-fails']);
      // A seat that exits fails its start with its address (plan D8); the pass charges no prompt.
      expect(failed.code).not.toBe(0);
      const seats: Terminal[] = await seatTerminals(f, 'start-fails', true);
      expect(failed.stderr).toContain(`failed ${seats[seats.length - 1].address}`);
      const state: State = readState(path);
      expect(state.phase).toBe('plan.synthesis');
      expect(state.attempts.A).toBe(0);
      expect(state.prompted.A).toBeUndefined();
      expect(state.failure).toBeUndefined();
      expect(await allTasks(f)).toEqual([]);
    }
    setSeat(f, 'a', 'fake', 'work');
    expect((await next(f, ['start-fails'])).code).toBe(0);
    const fourth: State = readState(path);
    expect(fourth.phase).toBe('plan.synthesis');
    expect(fourth.delivery_error.A).toBeUndefined();
    expect(fourth.prompted.A).toBeDefined();
    expect(fourth.attempts.A).toBe(1);
    expect(await allTasks(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('next uses repo seat overrides for both seats with spaced model as one argv element', async () => {
  const f: HcFixture = await hcFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: {
        a: { harness: 'fake', model: 'repo model a', effort: 'low' },
        b: { harness: 'fake', model: 'repo-b', effort: 'low' },
      },
    });
    leaf(f, 'override', 'check.review');
    expect((await next(f, ['override'])).code).toBe(0);
    const startA: string[] = harnessOf(lastStart(f, 'override', 'a'));
    const startB: string[] = harnessOf(lastStart(f, 'override', 'b'));
    expect(startA).toContain('repo model a');
    expect(startA.filter((x) => x === 'repo model a')).toHaveLength(1);
    expect(startA[0]).toBe('fake');
    expect(startB).toContain('repo-b');
    expect(startB[0]).toBe('fake');
  } finally {
    await f.clean();
  }
}, 15000);

test('next inherits non-overridden seat from global slots', async () => {
  const f: HcFixture = await hcFixture();
  try {
    globalSlot(f, 'b', 'strong-b', 'medium');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'only-a', effort: 'low' } },
    });
    leaf(f, 'inherit', 'check.review');
    expect((await next(f, ['inherit'])).code).toBe(0);
    const startA: string[] = harnessOf(lastStart(f, 'inherit', 'a'));
    const startB: string[] = harnessOf(lastStart(f, 'inherit', 'b'));
    expect(startA).toContain('only-a');
    expect(startB).toContain('strong-b');
    expect(startB[0]).toBe('fake');
  } finally {
    await f.clean();
  }
}, 15000);

test('next refuses unknown harness override before allocation', async () => {
  const f: HcFixture = await hcFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'ghost', model: 'm', effort: 'e' } },
    });
    const path: string = leaf(f, 'ghost-leaf', 'plan.synthesis');
    const result: Result = await next(f, ['ghost-leaf']);
    expect(result.code).not.toBe(0);
    expect(skips(result)[0].error).toContain('ghost');
    expect(skips(result)[0].error).toContain('repo');
    expect(skips(result)[0].error).toContain('b');
    expect(allStarts(f)).toHaveLength(0);
    expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
    expect(readState(path).worktree).toBeUndefined();
    expect(existsSync(storeDir(f))).toBe(false);
  } finally {
    await f.clean();
  }
}, 15000);

test('next resolves seats from EPIC.md front matter and falls back per seat', async () => {
  const f: HcFixture = await hcFixture();
  try {
    globalSlot(f, 'a', 'strong-a', 'high');
    globalSlot(f, 'b', 'strong-b', 'medium');
    leaf(f, 'epic-seats', 'check.review', {}, 'epic/issue');
    writeFileSync(
      resolve(f.root, 'issues/open/epic/EPIC.md'),
      '---\nslots:\n  a:\n    harness: fake\n    model: epic-a\n    effort: low\n---\n# Epic\n',
    );
    expect((await next(f, ['epic-seats'])).code).toBe(0);
    expect([...seatStarts(f, 'epic-seats', 'a'), ...seatStarts(f, 'epic-seats', 'b')]).toHaveLength(2);
    const startA: string[] = harnessOf(lastStart(f, 'epic-seats', 'a'));
    const startB: string[] = harnessOf(lastStart(f, 'epic-seats', 'b'));
    expect(startA).toContain('epic-a');
    expect(startA).toContain('low');
    expect(startA).not.toContain('strong-a');
    expect(startB).toContain('strong-b');
    expect(startB).toContain('medium');
  } finally {
    await f.clean();
  }
}, 15000);

test('next prefers ISSUE.md seats over EPIC.md and applies a standalone issue block', async () => {
  const f: HcFixture = await hcFixture();
  try {
    globalSlot(f, 'a', 'strong-a', 'high');
    leaf(f, 'nested', 'check.review', {}, 'epic/issue');
    writeFileSync(
      resolve(f.root, 'issues/open/epic/EPIC.md'),
      '---\nslots:\n  b:\n    harness: fake\n    model: epic-b\n    effort: low\n---\n# Epic\n',
    );
    writeFileSync(
      resolve(f.root, 'issues/open/epic/issue/ISSUE.md'),
      '---\nslots:\n  b:\n    harness: fake\n    model: issue-b\n    effort: medium\n---\n# Issue\n',
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'fake', model: 'repo-b', effort: 'low' } },
    });
    expect((await next(f, ['nested'])).code).toBe(0);
    const startA: string[] = harnessOf(lastStart(f, 'nested', 'a'));
    const startB: string[] = harnessOf(lastStart(f, 'nested', 'b'));
    expect(startA).toContain('strong-a');
    expect(startB).toContain('issue-b');
    expect(startB).toContain('medium');
    expect(startB).not.toContain('epic-b');
    expect(startB).not.toContain('repo-b');

    leaf(f, 'standalone', 'check.review');
    writeFileSync(
      resolve(f.root, 'issues/open/issue/ISSUE.md'),
      '---\nslots:\n  a:\n    harness: fake\n    model: issue-a\n    effort: low\n---\n# Issue\n',
    );
    expect((await next(f, ['standalone'])).code).toBe(0);
    const startAlone: string[] = harnessOf(lastStart(f, 'standalone', 'a'));
    expect(startAlone).toContain('issue-a');
    expect(startAlone).toContain('low');
  } finally {
    await f.clean();
  }
}, 15000);

const malformedIndex: [string, string][] = [
  ['unparseable front matter', '---\nslots: [\n---\n# Issue\n'],
  ['a key other than slots', '---\nseats: {}\n---\n# Issue\n'],
  ['a seat other than a or b', '---\nslots:\n  c:\n    harness: fake\n    model: m\n    effort: e\n---\n# Issue\n'],
  ['a missing seat field', '---\nslots:\n  a:\n    harness: fake\n    model: m\n---\n# Issue\n'],
  ['a blank seat value', "---\nslots:\n  a:\n    harness: fake\n    model: ' '\n    effort: e\n---\n# Issue\n"],
  ['a quoted seat value', "---\nslots:\n  a:\n    harness: fake\n    model: m'x\n    effort: e\n---\n# Issue\n"],
];

for (const [name, content] of malformedIndex) {
  test(`next refuses an ISSUE.md index with ${name} before any allocation`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      leaf(f, 'malformed', 'plan.synthesis');
      const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
      writeFileSync(index, content);
      const result: Result = await next(f, ['malformed']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(index);
      expect(result.stderr).toContain('Invalid slots front matter');
      expect(allStarts(f)).toHaveLength(0);
      expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
      expect(existsSync(storeDir(f))).toBe(false);
    } finally {
      await f.clean();
    }
  }, 15000);
}

test('next refuses an ISSUE.md index whose harness has no template before any allocation', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'ghost', 'plan.synthesis');
    const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
    writeFileSync(index, '---\nslots:\n  a:\n    harness: ghost\n    model: m\n    effort: e\n---\n# Issue\n');
    const result: Result = await next(f, ['ghost']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(index);
    expect(result.stderr).toContain('ghost');
    expect(result.stderr).toContain('a');
    expect(allStarts(f)).toHaveLength(0);
    expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
    expect(existsSync(storeDir(f))).toBe(false);
  } finally {
    await f.clean();
  }
}, 15000);

type Refusal = z.infer<typeof skipSchema>;
async function refusal(f: HcFixture, slug: string, path: string): Promise<Refusal> {
  const result: Result = await next(f, [slug]);
  expect(result.code).toBe(1);
  const lines: Refusal[] = skips(result);
  expect(lines).toHaveLength(1);
  expect(lines[0]).toMatchObject({ repo: 'repo', slug, path });
  expect(allStarts(f)).toHaveLength(0);
  expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
  return lines[0];
}

for (const { code, remedy, sabotage } of [
  {
    code: 'C1',
    remedy: 'git remote add origin',
    sabotage: (f: HcFixture) => command(['git', 'remote', 'remove', 'origin'], f.root),
  },
  {
    code: 'C2',
    remedy: 'push',
    sabotage: async (f: HcFixture) => {
      await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
      await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    },
  },
  {
    code: 'C3',
    remedy: 'git fetch origin main',
    sabotage: (f: HcFixture) => command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root),
  },
]) {
  test(`next refuses a new leaf with a missing base (${code}) before worktree creation`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const path: string = leaf(f, 'fresh', 'plan.synthesis');
      await sabotage(f);
      const skip: Refusal = await refusal(f, 'fresh', path);
      expect(skip.error).toContain(code);
      expect(skip.error).toContain(remedy);
      expect(existsSync(resolve(storeDir(f), 'fresh'))).toBe(false);
      expect(readState(path).worktree).toBeUndefined();
    } finally {
      await f.clean();
    }
  });
}

test('next refuses a leaf branch without a worktree when the remote branch is gone', async () => {
  const f: HcFixture = await hcFixture();
  try {
    await command(['git', 'branch', 'stale'], f.root);
    const path: string = leaf(f, 'stale', 'plan.synthesis');
    await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    const skip: Refusal = await refusal(f, 'stale', path);
    expect(skip.error).toContain('C2');
    expect(existsSync(resolve(storeDir(f), 'stale'))).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
  } finally {
    await f.clean();
  }
});

test('next refuses an existing worktree whose tracking ref is deleted while the remote branch lives', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    const path: string = leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    const skip: Refusal = await refusal(f, 'resident', path);
    expect(skip.error).toContain('C3');
    expect(skip.error).toContain('git fetch origin main');
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).worktree).toBe(worktree);
  } finally {
    await f.clean();
  }
});

test('next refuses an existing worktree whose tracking ref is deleted when the remote branch is gone', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    const path: string = leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'init', '--bare', resolve(f.home, 'empty.git')]);
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'empty.git')], f.root);
    const skip: Refusal = await refusal(f, 'resident', path);
    expect(skip.error).toContain('C2');
    expect(existsSync(worktree)).toBe(true);
    expect(readState(path).worktree).toBe(worktree);
  } finally {
    await f.clean();
  }
});

test('next dispatches an existing worktree without querying an unreachable remote', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const worktree: string = resolve(storeDir(f), 'resident');
    await command(['git', 'worktree', 'add', '-b', 'resident', worktree], f.root);
    leaf(f, 'resident', 'plan.synthesis', { worktree });
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'gone.git')], f.root);
    expect((await next(f, ['resident'])).code).toBe(0);
    expect(await delivered(f, 'resident')).toHaveLength(1);
  } finally {
    await f.clean();
  }
});

test('next refuses to create a worktree while the remote is unreachable', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'fresh', 'plan.synthesis');
    await command(['git', 'remote', 'set-url', 'origin', resolve(f.home, 'gone.git')], f.root);
    const skip: Refusal = await refusal(f, 'fresh', path);
    expect(skip.error).toContain('Unproven');
    expect(skip.error).toContain('ls-remote');
    expect(existsSync(resolve(storeDir(f), 'fresh'))).toBe(false);
    expect(readState(path).worktree).toBeUndefined();
  } finally {
    await f.clean();
  }
});

test('next branches a new worktree from the tracking commit, never a same-named local ref', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const tracked: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'commit', '--allow-empty', '-m', 'impostor'], f.root);
    const impostor: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    await command(['git', 'branch', 'origin/main', impostor], f.root);
    await command(['git', 'tag', 'origin/main', impostor], f.root);
    leaf(f, 'fresh', 'plan.synthesis');
    expect((await next(f, ['fresh'])).code).toBe(0);
    expect(await command(['git', 'rev-parse', 'refs/heads/fresh'], f.root)).toBe(tracked);
    const start: string[] = lastStart(f, 'fresh', 'a');
    expect(start.filter((arg) => arg.startsWith('AKROGON_BASE='))).toEqual([`AKROGON_BASE=${tracked}`]);
  } finally {
    await f.clean();
  }
});
test('fresh allocation carries TMPDIR on both seat starts with 0700 scratch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'fresh-tmp', 'check.review');
    expect((await next(f, ['fresh-tmp'])).code).toBe(0);
    const createTmp: string = startTmpdir(lastStart(f, 'fresh-tmp', 'a'));
    expect(seatStarts(f, 'fresh-tmp', 'b')).toHaveLength(1);
    expect(startTmpdir(lastStart(f, 'fresh-tmp', 'b'))).toBe(createTmp);
    expect(createTmp.startsWith(leafTempRoot(f) + '/')).toBe(true);
    expect(existsSync(createTmp)).toBe(true);
    expect(statSync(createTmp).mode & 0o777).toBe(0o700);
    expect(statSync(resolve(createTmp, '..')).mode & 0o777).toBe(0o700);
  } finally {
    await f.clean();
  }
}, 15000);

test('allocation creates missing leaf temp ancestors and recreates deleted intermediate parents', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = resolve(f.home, 'scratch/missing/parent');
    leaf(f, 'deep-tmp', 'plan.synthesis');
    expect((await next(f, ['deep-tmp'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    const scratch: string = startTmpdir(lastStart(f, 'deep-tmp', 'a'));
    expect(scratch.startsWith(root + '/')).toBe(true);
    expect(existsSync(scratch)).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    rmSync(resolve(f.home, 'scratch'), { recursive: true, force: true });
    leaf(f, 'again', 'plan.synthesis');
    expect((await next(f, ['again'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    const second: string = startTmpdir(lastStart(f, 'again', 'a'));
    expect(second.startsWith(root + '/')).toBe(true);
    expect(second).not.toBe(scratch);
    expect(existsSync(second)).toBe(true);
    expect(statSync(second).mode & 0o777).toBe(0o700);
  } finally {
    await f.clean();
  }
}, 15000);

test('new tab keeps existing scratch for checks that outlive their tab, and seats disable the node compile cache', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'stale-tmp', 'plan.synthesis');
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    const start: string[] = lastStart(f, 'stale-tmp', 'a');
    expect(start).toContain('NODE_DISABLE_COMPILE_CACHE=1');
    const scratch: string = startTmpdir(start);
    writeFileSync(resolve(scratch, 'stale'), 'x\n');
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    expect(existsSync(resolve(scratch, 'stale'))).toBe(true);
    const captured: string = resolve(scratch, 'akrogon-io-detached');
    mkdirSync(captured);
    writeFileSync(resolve(captured, 'out'), 'x\n');
    await closeTab(f, 'stale-tmp');
    saveState(path, { ...readState(path), prompted: {} });
    expect((await next(f, ['stale-tmp'])).code).toBe(0);
    expect(seatStarts(f, 'stale-tmp', 'a')).toHaveLength(2);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    expect(existsSync(resolve(captured, 'out'))).toBe(true);
  } finally {
    await f.clean();
  }
}, 15000);

test('allocation carries TMPDIR refuses symlink override with no seat start', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const target: string = resolve(f.home, 'real-target');
    mkdirSync(target);
    const link: string = resolve(f.home, 'evil-link');
    symlinkSync(target, link);
    leaf(f, 'refuse-link', 'plan.synthesis');
    const result: Result = await next(f, ['refuse-link'], { AKROGON_LEAF_TEMP_ROOT: link });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(link);
    expect(result.stderr).toContain('Refusing');
    expect(allStarts(f)).toHaveLength(0);
    expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('allocation carries TMPDIR refuses file override with no seat start', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const file: string = resolve(f.home, 'not-a-dir');
    writeFileSync(file, 'x\n');
    leaf(f, 'refuse-file', 'plan.synthesis');
    const result: Result = await next(f, ['refuse-file'], { AKROGON_LEAF_TEMP_ROOT: file });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(file);
    expect(allStarts(f)).toHaveLength(0);
    expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('allocation carries TMPDIR corrects permissive owned dirs to 0700', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = resolve(f.home, 'permissive-root');
    mkdirSync(root, { mode: 0o777 });
    chmodSync(root, 0o777);
    expect(statSync(root).mode & 0o777).toBe(0o777);
    const path: string = leaf(f, 'permissive', 'plan.synthesis');
    expect((await next(f, ['permissive'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    expect(statSync(root).mode & 0o777).toBe(0o700);
    const scratch: string = startTmpdir(lastStart(f, 'permissive', 'a'));
    expect(scratch.startsWith(root + '/')).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    for (const start of allStarts(f)) expect(startTmpdir(start)).toBe(scratch);
    const before: State = readState(path);
    chmodSync(scratch, 0o777);
    expect(statSync(scratch).mode & 0o777).toBe(0o777);
    expect((await next(f, ['permissive'], { AKROGON_LEAF_TEMP_ROOT: root })).code).toBe(0);
    const after: State = readState(path);
    expect(after.tab).toBe(before.tab);
    expect(after.seat).toEqual(before.seat);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
  } finally {
    await f.clean();
  }
}, 15000);
test('leaf temp path stays inside the socket budget under /tmp for any slug and repo root', async () => {
  const f: Fixture = await fixture();
  try {
    const slug: string = 'a'.repeat(200);
    const rootOne: string = '/very/long/' + 'r'.repeat(200);
    const rootTwo: string = '/very/long/' + 's'.repeat(200);
    const configPath: string = resolve(import.meta.dir, '../src/config.ts');
    const code: string =
      'delete process.env.AKROGON_LEAF_TEMP_ROOT; ' +
      'const { leafTemp } = await import(' +
      JSON.stringify(configPath) +
      '); ' +
      'const slug = ' +
      JSON.stringify(slug) +
      '; ' +
      'const p1 = leafTemp({ name: ' +
      JSON.stringify('repo') +
      ', root: ' +
      JSON.stringify(rootOne) +
      ', config: {} }, slug); ' +
      'const p2 = leafTemp({ name: ' +
      JSON.stringify('repo') +
      ', root: ' +
      JSON.stringify(rootTwo) +
      ', config: {} }, slug); ' +
      'console.log(JSON.stringify({ p1: p1, p2: p2, len: Buffer.byteLength(p1) }));';
    const env: NodeJS.ProcessEnv = { ...process.env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) };
    delete env.AKROGON_LEAF_TEMP_ROOT;
    const {
      stdout,
      stderr,
      code: exited,
    }: Result = await spawnCaptured([process.execPath, '--eval', code], {
      cwd: f.root,
      env: env,
    });
    expect(stderr.trim()).toBe('');
    expect(exited).toBe(0);
    const out: { p1: string; p2: string; len: number } = JSON.parse(stdout.trim());
    expect(out.len).toBeLessThanOrEqual(33);
    expect(out.p1).not.toBe(out.p2);
    expect(out.p1.startsWith(`/var/tmp/akr-${process.getuid!()}/`)).toBe(true);
    expect(existsSync(out.p1)).toBe(false);
    expect(existsSync(out.p2)).toBe(false);
    expect(existsSync(leafTempRoot(f))).toBe(false);
  } finally {
    f.clean();
  }
}, 15000);

test('closed tab scratch deletes merged folder and prunes inner worktree', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'scrub', 'plan.synthesis');
    expect((await next(f, ['scrub'])).code).toBe(0);
    const scratch: string = startTmpdir(lastStart(f, 'scrub', 'a'));
    expect(existsSync(scratch)).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'gone\n');
    const inner: string = resolve(scratch, 'inner-wt');
    await command(['git', 'worktree', 'add', '--detach', inner], f.root);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).toContain(inner);
    saveState(path, { ...readState(path), phase: 'merged' });
    await closeTab(f, 'scrub');
    const closed: Result = await next(f, ['--wake']);
    expect(closed.code).toBe(0);
    expect(existsSync(scratch)).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain(inner);
  } finally {
    await f.clean();
  }
}, 15000);

test('closed tab scratch sweeps a failed leaf, keeps its branch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'failed-keep', 'plan.synthesis');
    expect((await next(f, ['failed-keep'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    const scratch: string = startTmpdir(lastStart(f, 'failed-keep', 'a'));
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'stay\n');
    saveState(path, {
      ...readState(path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'test' },
    });
    await closeTab(f, 'failed-keep');
    const closed: Result = await next(f, ['--wake']);
    expect(closed.code).toBe(0);
    expect(existsSync(scratch)).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/failed-keep'], f.root)).code).toBe(0);
  } finally {
    await f.clean();
  }
}, 15000);
test('sweep scratch catch-up deletes open and closed folders with no live seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const openPath: string = leaf(f, 'open-done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'hold', 'failed', {}, 'other');
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
    const soloPath: string = leaf(f, 'solo-done', 'plan.synthesis', {}, 'solo-issue');
    expect((await next(f, ['open-done'])).code).toBe(0);
    expect((await next(f, ['solo-done'])).code).toBe(0);
    const openScratch: string = startTmpdir(lastStart(f, 'open-done', 'a'));
    const soloScratch: string = startTmpdir(lastStart(f, 'solo-done', 'a'));
    const openSentinel: string = resolve(openScratch, 'sentinel');
    const soloSentinel: string = resolve(soloScratch, 'sentinel');
    writeFileSync(openSentinel, 'open\n');
    writeFileSync(soloSentinel, 'solo\n');
    saveState(openPath, { ...readState(openPath), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'open-done', 'merged'], f.root, f.env)).code).toBe(0);
    saveState(soloPath, { ...readState(soloPath), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'solo-done', 'merged'], f.root, f.env)).code).toBe(0);
    expect(existsSync(openPath)).toBe(true);
    const soloClosed: string = resolve(f.root, 'issues/closed/solo-issue/solo-done');
    expect(existsSync(soloClosed)).toBe(true);
    await closeTab(f, 'open-done');
    await closeTab(f, 'solo-done');
    const closesBefore: number = tabCloses(f).length;
    expect((await next(f, [])).code).toBe(1);
    expect(tabCloses(f)).toHaveLength(closesBefore);
    expect(existsSync(openScratch)).toBe(false);
    expect(existsSync(soloScratch)).toBe(false);
    expect(existsSync(openSentinel)).toBe(false);
    expect(existsSync(soloSentinel)).toBe(false);
    expect(existsSync(openPath)).toBe(true);
    expect(existsSync(soloClosed)).toBe(true);
    expect(existsSync(readState(openPath).worktree!)).toBe(false);
    expect(existsSync(readState(soloClosed).worktree!)).toBe(false);
  } finally {
    await f.clean();
  }
}, 15000);

test('sweep scratch catch-up keeps sentinel with live seats then deletes on later sweep', async () => {
  const f: HcFixture = await hcFixture({ window: 'open' });
  const stopAdopt: () => void = adopt(f.core);
  try {
    const donePath: string = leaf(f, 'live-done', 'plan.synthesis', {}, 'epic/first');
    leaf(f, 'hold', 'failed', {}, 'other');
    leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');
    expect((await next(f, ['live-done'])).code).toBe(0);
    const scratch: string = startTmpdir(lastStart(f, 'live-done', 'a'));
    const sentinel: string = resolve(scratch, 'sentinel');
    writeFileSync(sentinel, 'live\n');
    saveState(donePath, { ...readState(donePath), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'live-done', 'merged'], f.root, f.env)).code).toBe(0);
    expect(existsSync(donePath)).toBe(true);
    expect(await liveTabs(f)).toContain('live-done');
    expect((await next(f, [])).code).toBe(1);
    expect(await liveTabs(f)).toEqual([]);
    expect(tabCloses(f)).toHaveLength(1);
    expect(existsSync(scratch)).toBe(true);
    expect(readFileSync(sentinel, 'utf8')).toBe('live\n');
    expect(existsSync(donePath)).toBe(true);
    expect((await next(f, [])).code).toBe(1);
    expect(existsSync(scratch)).toBe(false);
    expect(existsSync(sentinel)).toBe(false);
  } finally {
    stopAdopt();
    await f.clean();
  }
}, 15000);

test('dispatch recreates missing scratch with same tab and seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'recreate', 'plan.synthesis');
    expect((await next(f, ['recreate'])).code).toBe(0);
    const before: State = readState(path);
    const scratch: string = startTmpdir(lastStart(f, 'recreate', 'a'));
    expect(existsSync(scratch)).toBe(true);
    rmSync(scratch, { recursive: true, force: true });
    expect(existsSync(scratch)).toBe(false);
    expect((await next(f, ['recreate'])).code).toBe(0);
    const after: State = readState(path);
    expect(after.tab).toBe(before.tab);
    expect(after.seat).toEqual(before.seat);
    expect(existsSync(scratch)).toBe(true);
    expect(statSync(scratch).mode & 0o777).toBe(0o700);
    expect(allStarts(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('fixture temp root isolates every TMPDIR and envs carry override', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = leafTempRoot(f);
    expect(root).toBe(resolve(f.home, 'leaf-temp'));
    // The old fake herdr env carried the leaf temp override; this case's env carries it the same way.
    f.env = { ...f.env, AKROGON_LEAF_TEMP_ROOT: root };
    expect(f.env['AKROGON_LEAF_TEMP_ROOT']).toBe(root);
    leaf(f, 'first-tmp', 'plan.synthesis');
    expect((await next(f, ['first-tmp'])).code).toBe(0);
    expect(allStarts(f)).toHaveLength(1);
    for (const start of allStarts(f)) {
      const tmp: string = startTmpdir(start);
      expect(tmp.startsWith(root + '/')).toBe(true);
      expect(existsSync(tmp)).toBe(true);
      expect(statSync(tmp).mode & 0o777).toBe(0o700);
    }
    leaf(f, 'second-tmp', 'plan.synthesis');
    const stripped: NodeJS.ProcessEnv = { ...f.env };
    delete stripped['AKROGON_LEAF_TEMP_ROOT'];
    expect('AKROGON_LEAF_TEMP_ROOT' in stripped).toBe(false);
    expect((await cli(f, ['next', 'second-tmp'], f.root, stripped)).code).toBe(0);
    expect(seatStarts(f, 'second-tmp', 'a')).toHaveLength(1);
    const secondTmp: string = startTmpdir(lastStart(f, 'second-tmp', 'a'));
    expect(secondTmp.startsWith(root + '/')).toBe(true);
    expect(existsSync(secondTmp)).toBe(true);
    leaf(f, 'third-tmp', 'plan.synthesis');
    const now: number = Date.parse('2026-09-11T12:00:00Z');
    expect((await nextAt(f, 'third-tmp', now)).code).toBe(0);
    expect(allStarts(f)).toHaveLength(3);
    for (const start of allStarts(f)) expect(startTmpdir(start).startsWith(root + '/')).toBe(true);
    const prodRoot: string = '/tmp/akrogon-' + String(process.getuid!());
    expect(root).not.toBe(prodRoot);
  } finally {
    await f.clean();
  }
}, 15000);

function readinessInput(leafPath: string, input: object): void {
  yaml(resolve(leafPath, 'readiness.yaml'), { inputs: [input], produces: [], grants: [], retained: [], proofs: [] });
}
const envFoo: object = {
  kind: 'env',
  name: 'FOO',
  holder: 'repo',
  purpose: 'p',
  consumers: ['x'],
  steps: 's',
  source: 't',
  done: 'd',
};
async function undispatched(f: HcFixture, slug: string): Promise<void> {
  expect(existsSync(storeDir(f))).toBe(false);
  expect((await run(['git', 'branch', '--list', slug], f.root)).stdout).toBe('');
  expect(allStarts(f)).toHaveLength(0);
  expect(await f.core.terminals({ akrogon: '1' }, true)).toHaveLength(0);
  expect(await allTasks(f)).toHaveLength(0);
}

test('next refuses an env-gapped leaf in every missing .env state and dispatches when set', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'gapped', 'plan.synthesis');
    const path: string = resolve(f.root, 'issues/open/issue/gapped');
    readinessInput(path, envFoo);
    for (const env of [undefined, 'BAR=1\n', 'FOO=\n', 'FOO="  "\n']) {
      if (env === undefined) rmSync(resolve(f.root, '.env'), { force: true });
      else writeFileSync(resolve(f.root, '.env'), env);
      const result: Result = await next(f, ['gapped']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('FOO');
      await undispatched(f, 'gapped');
    }
    writeFileSync(resolve(f.root, '.env'), 'FOO=x\n');
    expect((await next(f, ['gapped'])).code).toBe(0);
    expect(await liveTabs(f)).toHaveLength(1);
    expect(await allTasks(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('next refuses a leaf whose declared file input is absent or empty', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'needsfile', 'plan.synthesis');
    readinessInput(path, { ...envFoo, kind: 'file', name: 'need.txt' });
    const result: Result = await next(f, ['needsfile']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('need.txt');
    writeFileSync(resolve(f.root, 'need.txt'), '');
    const empty: Result = await next(f, ['needsfile']);
    expect(empty.code).not.toBe(0);
    expect(empty.stderr).toContain('need.txt');
    await undispatched(f, 'needsfile');
    writeFileSync(resolve(f.root, 'need.txt'), 'content\n');
    expect((await next(f, ['needsfile'])).code).toBe(0);
    expect(await liveTabs(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('next --all leaves a gapped leaf undispatched while its ungapped sibling dispatches', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const gapped: string = leaf(f, 'gapped', 'plan.synthesis');
    readinessInput(gapped, envFoo);
    leaf(f, 'ready', 'plan.synthesis');
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(readState(gapped).worktree).toBeUndefined();
    expect((await run(['git', 'branch', '--list', 'gapped'], f.root)).stdout).toBe('');
    expect(await liveTabs(f)).toEqual(['ready']);
    expect((await allTasks(f)).every((p) => p.text.includes('ready'))).toBe(true);
  } finally {
    await f.clean();
  }
}, 15000);

test('an input held by an unregistered absolute directory checks that directory .env', async () => {
  const f: HcFixture = await hcFixture();
  const holder: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-holder-')));
  try {
    const path: string = leaf(f, 'foreign', 'plan.synthesis');
    readinessInput(path, { ...envFoo, holder });
    const refused: Result = await next(f, ['foreign']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('FOO');
    await undispatched(f, 'foreign');
    writeFileSync(resolve(holder, '.env'), 'FOO=x\n');
    expect((await next(f, ['foreign'])).code).toBe(0);
    expect(await liveTabs(f)).toHaveLength(1);
    expect(await allTasks(f)).toHaveLength(1);
  } finally {
    rmSync(holder, { recursive: true, force: true });
    await f.clean();
  }
}, 15000);

test('an invalid readiness.yaml skips the leaf and names the file path', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'readiness.yaml'), 'inputs: [');
    const result: Result = await next(f, ['malformed']);
    expect(result.code).not.toBe(0);
    expect(skips(result)[0].error).toContain(resolve(malformed, 'readiness.yaml'));
    await undispatched(f, 'malformed');
    const invalid: string = leaf(f, 'invalid', 'plan.synthesis');
    yaml(resolve(invalid, 'readiness.yaml'), {
      inputs: [{ kind: 'env' }],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    const second: Result = await next(f, ['invalid']);
    expect(second.code).not.toBe(0);
    expect(skips(second)[0].error).toContain(resolve(invalid, 'readiness.yaml'));
    await undispatched(f, 'invalid');
  } finally {
    await f.clean();
  }
}, 15000);

test('a dispatched worktree gets a real .env file with the declared subset', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=1\nSYNTHETIC_TWO=two words\nSYNTHETIC_THREE=3\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE', 'SYNTHETIC_TWO'],
    });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    expect(lstatSync(envFile).isFile()).toBe(true);
    expect(statSync(envFile).mode & 0o777).toBe(0o600);
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\nSYNTHETIC_TWO=two words\n');
    const state: State = readState(path);
    expect(state.env_names).toEqual(['SYNTHETIC_ONE', 'SYNTHETIC_TWO']);
    expect(state.env_generation).toBe(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('a dispatched .env file round-trips quotes and backslashes through dotenv parsing', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(
      resolve(f.root, '.env'),
      'SYNTHETIC_QUOTE=' + "'has\"quote'" + '\nSYNTHETIC_PATH=' + "'path\\\\segment'" + '\n',
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_QUOTE', 'SYNTHETIC_PATH'],
    });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    const copied: Record<string, string | undefined> = parseEnv(readFileSync(envFile, 'utf8'));
    expect(copied.SYNTHETIC_QUOTE).toBe('has"quote');
    expect(copied.SYNTHETIC_PATH).toBe('path\\\\segment');
  } finally {
    await f.clean();
  }
}, 15000);

test('a dispatched .env file preserves spaced assignments, multiline values and nested assignment text', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = resolve(f.root, '.env');
    writeFileSync(
      root,
      'SYNTHETIC_SPACED = v \n' +
        'SYNTHETIC_MULTI="line one\n' +
        'line two"\n' +
        'SYNTHETIC_OUTER=outside\n' +
        'OTHER="a\n' +
        'SYNTHETIC_OUTER=inside\n' +
        'b"\n',
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_SPACED', 'SYNTHETIC_MULTI', 'SYNTHETIC_OUTER'],
    });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    const copied: Record<string, string | undefined> = parseEnv(readFileSync(envFile, 'utf8'));
    const original: Record<string, string | undefined> = parseEnv(readFileSync(root, 'utf8'));
    expect(copied.SYNTHETIC_SPACED).toBe(original.SYNTHETIC_SPACED);
    expect(copied.SYNTHETIC_MULTI).toBe(original.SYNTHETIC_MULTI);
    expect(copied.SYNTHETIC_MULTI).toBe('line one\nline two');
    expect(copied.SYNTHETIC_OUTER).toBe('outside');
    expect(copied.OTHER).toBeUndefined();
  } finally {
    await f.clean();
  }
}, 15000);

test('a dispatched .env file round-trips mixed quotes, backticks and escape-looking text', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = resolve(f.root, '.env');
    writeFileSync(
      root,
      'SYNTHETIC_MIXED=a\'b"c\n' +
        "SYNTHETIC_TICK='`literal`'\n" +
        "SYNTHETIC_BS='a\\\\nb'\n" +
        'SYNTHETIC_ESC="x\\ry"\n' +
        'SYNTHETIC_DQESC="a\\r\\"b"\n' +
        'SYNTHETIC_TRAIL=path\\\n' +
        'SYNTHETIC_UNI="\u{1F600}a\\r\\"b"\n',
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: [
        'SYNTHETIC_MIXED',
        'SYNTHETIC_TICK',
        'SYNTHETIC_BS',
        'SYNTHETIC_ESC',
        'SYNTHETIC_DQESC',
        'SYNTHETIC_TRAIL',
        'SYNTHETIC_UNI',
      ],
    });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    const copied: Record<string, string | undefined> = parseEnv(readFileSync(envFile, 'utf8'));
    const original: Record<string, string | undefined> = parseEnv(readFileSync(root, 'utf8'));
    for (const name of [
      'SYNTHETIC_MIXED',
      'SYNTHETIC_TICK',
      'SYNTHETIC_BS',
      'SYNTHETIC_ESC',
      'SYNTHETIC_DQESC',
      'SYNTHETIC_TRAIL',
      'SYNTHETIC_UNI',
    ])
      expect(copied[name]).toBe(original[name]);
    expect(copied.SYNTHETIC_MIXED).toBe('a\'b"c');
    expect(copied.SYNTHETIC_TICK).toBe('`literal`');
    expect(copied.SYNTHETIC_ESC).toBe('x\ry');
    expect(copied.SYNTHETIC_DQESC).toBe('a\r\\"b');
    expect(copied.SYNTHETIC_TRAIL).toBe('path\\');
    expect(copied.SYNTHETIC_UNI).toBe('\u{1F600}a\r\\"b');
  } finally {
    await f.clean();
  }
}, 15000);

test('next preserves a declared value that escapes every quoting form', async () => {
  const f: HcFixture = await hcFixture();
  try {
    // parseEnv reads this as a'b`c\<CR>: quoters plus a backslash-carriage
    // sequence. The accepted root assignment is itself a valid encoding, so
    // the dispatch must emit a line that preserves the value.
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_HARD="a\'b`c\\\\\\r"\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_HARD'],
    });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    const emitted: string = readFileSync(envFile, 'utf8');
    expect(emitted).toContain('SYNTHETIC_HARD=');
    expect(parseEnv(emitted).SYNTHETIC_HARD).toBe("a'b`c\\\\\r");
  } finally {
    await f.clean();
  }
}, 15000);

test('a dispatched .env file preserves declared names matching encoding context names', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'Z1=x\nY4=y\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['Z1', 'Y4'],
    });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const copied: Record<string, string | undefined> = parseEnv(
      readFileSync(resolve(storeDir(f), 'build/.env'), 'utf8'),
    );
    expect(copied).toEqual({ Z1: 'x', Y4: 'y' });
  } finally {
    await f.clean();
  }
}, 15000);

test('a live tab freezes .env while a dead tab lets the next dispatch rewrite it', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const root: string = resolve(f.root, '.env');
    writeFileSync(root, 'SYNTHETIC_ONE=1\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE'],
    });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
    appendFileSync(root, 'SYNTHETIC_ONE=2\n');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
    expect(readState(path).env_generation).toBe(0);
    await closeTab(f, 'build');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=2\n');
    const state: State = readState(path);
    expect(state.env_names).toEqual(['SYNTHETIC_ONE']);
    expect(state.env_generation).toBe(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('next refuses a declared name missing from the registered .env without leaking its values', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=S3NTINEL-VALUE-9f8e\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE', 'MISSING_NAME'],
    });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).not.toBe(0);
    const error: string = skips(result)[0].error;
    expect(error).toContain('missing declared names');
    expect(error).toContain('MISSING_NAME');
    expect(result.stdout).not.toContain('S3NTINEL-VALUE-9f8e');
    expect(result.stderr).not.toContain('S3NTINEL-VALUE-9f8e');
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toContain('S3NTINEL-VALUE-9f8e');
    const envFile: string = resolve(storeDir(f), 'build/.env');
    expect(() => lstatSync(envFile)).toThrow(/ENOENT/);
    expect(await liveTabs(f)).toHaveLength(0);
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('pass_env names are not copied from the registered .env', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=1\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE'],
      pass_env: ['SESSION_ONLY'],
    });
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readFileSync(resolve(storeDir(f), 'build/.env'), 'utf8')).toBe('SYNTHETIC_ONE=1\n');
  } finally {
    await f.clean();
  }
}, 15000);

test('dispatch recreates a deleted .env file in a reused worktree once its tab is gone', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=1\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE'],
    });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const envFile: string = resolve(storeDir(f), 'build/.env');
    rmSync(envFile);
    await closeTab(f, 'build');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(lstatSync(envFile).isFile()).toBe(true);
    expect(statSync(envFile).mode & 0o777).toBe(0o600);
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
    expect(readState(path).env_generation).toBe(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('a pre-linked worktree has its .env symlink replaced by a real file on dispatch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=1\n');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      env: ['SYNTHETIC_ONE'],
    });
    const worktree: string = resolve(storeDir(f), 'build');
    await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
    const envFile: string = resolve(worktree, '.env');
    symlinkSync(resolve(f.root, '.env'), envFile);
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(lstatSync(envFile).isFile()).toBe(true);
    expect(statSync(envFile).mode & 0o777).toBe(0o600);
    expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
  } finally {
    await f.clean();
  }
}, 15000);

for (const registered of [false, true]) {
  test(`an empty env list writes an empty .env file ${registered ? 'with' : 'without'} a registered .env`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const root: string = resolve(f.root, '.env');
      if (registered) writeFileSync(root, 'SYNTHETIC_ONE=1\n');
      leaf(f, 'build', 'plan.synthesis');
      expect((await next(f, ['build'])).code).toBe(0);
      const envFile: string = resolve(storeDir(f), 'build/.env');
      expect(lstatSync(envFile).isFile()).toBe(true);
      expect(statSync(envFile).mode & 0o777).toBe(0o600);
      expect(readFileSync(envFile, 'utf8')).toBe('');
      if (!registered) expect(existsSync(root)).toBe(false);
    } finally {
      await f.clean();
    }
  }, 15000);
}

for (const kind of ['tracked file', 'unignored'] as const) {
  test(`next refuses an .env write over ${kind}`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const worktree: string = resolve(storeDir(f), 'build');
      await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
      const link: string = resolve(worktree, '.env');
      if (kind === 'tracked file') {
        writeFileSync(link, 'SYNTHETIC_SECRET=1\n');
        await command(['git', 'add', '-f', '.env'], worktree);
        await command(['git', 'commit', '-m', 'track env'], worktree);
      }
      if (kind === 'unignored') writeFileSync(resolve(worktree, '.gitignore'), 'node_modules\n');
      leaf(f, 'build', 'plan.synthesis');
      const result: Result = await next(f, ['build']);
      expect(result.code).not.toBe(0);
      const error: string = skips(result)[0].error;
      expect(error).toContain('Refusing .env');
      expect(error).toContain(link);
      if (kind === 'tracked file') expect(error).toContain('path is tracked by git');
      if (kind === 'unignored') expect(error).toContain('path is not ignored by git');
      if (kind === 'tracked file') expect(readFileSync(link, 'utf8')).toBe('SYNTHETIC_SECRET=1\n');
      if (kind === 'unignored') expect(() => lstatSync(link)).toThrow(/ENOENT/);
      expect(await allTasks(f)).toHaveLength(0);
      expect(allStarts(f)).toHaveLength(0);
    } finally {
      await f.clean();
    }
  }, 15000);
}

for (const kind of ['real file', 'stale link'] as const) {
  test(`dispatch replaces an .env ${kind} with a real file`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      writeFileSync(resolve(f.root, '.env'), 'SYNTHETIC_ONE=1\n');
      yaml(resolve(f.root, 'issues/config.yaml'), {
        checks: { test: 'bun test' },
        grounding: 'none',
        env: ['SYNTHETIC_ONE'],
      });
      const worktree: string = resolve(storeDir(f), 'build');
      await command(['git', 'worktree', 'add', '-b', 'build', worktree], f.root);
      const envFile: string = resolve(worktree, '.env');
      if (kind === 'real file') writeFileSync(envFile, 'SYNTHETIC_SECRET=1\n');
      if (kind === 'stale link') symlinkSync(resolve(f.home, 'other-env'), envFile);
      leaf(f, 'build', 'plan.synthesis');
      expect((await next(f, ['build'])).code).toBe(0);
      expect(lstatSync(envFile).isFile()).toBe(true);
      expect(statSync(envFile).mode & 0o777).toBe(0o600);
      expect(readFileSync(envFile, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
    } finally {
      await f.clean();
    }
  }, 15000);
}

test('next refuses to write .env not ignored in the registered checkout, keeps the worktree, and reuses it after the ignore rule returns', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.gitignore'), 'node_modules\n');
    leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).not.toBe(0);
    const target: string = resolve(f.root, '.env');
    const error: string = skips(result)[0].error;
    expect(error).toContain('Refusing .env');
    expect(error).toContain(resolve(storeDir(f), 'build/.env'));
    expect(error).toContain(`path is not ignored in the registered checkout ${f.root}`);
    expect(existsSync(target)).toBe(false);
    const worktree: string = resolve(storeDir(f), 'build');
    expect(existsSync(worktree)).toBe(true);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/build'], f.root)).code).toBe(0);
    expect(await allTasks(f)).toHaveLength(0);
    expect(allStarts(f)).toHaveLength(0);
    writeFileSync(resolve(f.root, '.gitignore'), '.env\n');
    expect((await next(f, ['build'])).code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/build')).worktree).toBe(worktree);
    expect(lstatSync(resolve(worktree, '.env')).isFile()).toBe(true);
    expect(statSync(resolve(worktree, '.env')).mode & 0o777).toBe(0o600);
    expect(readFileSync(resolve(worktree, '.env'), 'utf8')).toBe('');
    expect(await allTasks(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('merged leaf cleanup removes the worktree and leaves the registered .env untouched', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const target: string = resolve(f.root, '.env');
    writeFileSync(target, 'SYNTHETIC_ONE=1\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = readState(path).worktree!;
    expect(lstatSync(resolve(worktree, '.env')).isFile()).toBe(true);
    saveState(path, { ...readState(path), phase: 'merge', ...holding(f) });
    expect((await cli(f, ['phase', 'build', 'merged'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(worktree)).toBe(false);
    expect(readFileSync(target, 'utf8')).toBe('SYNTHETIC_ONE=1\n');
  } finally {
    await f.clean();
  }
}, 15000);

async function allocatedLeaf(f: HcFixture, slug: string): Promise<{ path: string }> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await next(f, [slug])).code).toBe(0);
  return { path };
}

// One dispatch pass allocates every leaf, instead of one targeted pass per leaf.
async function allocatedLeaves(f: HcFixture, slugs: string[]): Promise<{ path: string }[]> {
  const paths: string[] = slugs.map((slug) => leaf(f, slug, 'plan.synthesis'));
  expect((await next(f, [])).code).toBe(0);
  return paths.map((path) => ({ path }));
}

function toMerge(path: string, mergeStamp: string, extra: object = {}): State {
  const moved: State = { ...readState(path), phase: 'merge', merge_stamp: mergeStamp, ...extra };
  saveState(path, moved);
  return moved;
}

// The merge tasks the seats received, as `{ seat: '<leaf>/<a|b>', text }`, sorted by seat. A merged
// leaf's seats are removed, so a task file whose terminal is gone is named from its task text.
async function mergePrompts(f: HcFixture): Promise<{ seat: string; text: string }[]> {
  const known: Map<string, string> = new Map(
    (await f.core.terminals({ akrogon: '1' }, true)).map((t: Terminal) => [
      t.address,
      `${t.labels['akrogon.leaf']}/${t.labels['akrogon.seat']}`,
    ]),
  );
  return readdirSync(f.core.standin)
    .filter((name: string) => name.endsWith('.tasks'))
    .flatMap((name: string) => {
      const address: string = name.slice(0, -'.tasks'.length);
      return f.core
        .tasks(address)
        .filter((text: string) => text.startsWith('merge-issue'))
        .map((text: string) => ({ seat: known.get(address) ?? `${text.split(' ')[1]}/b`, text }));
    })
    .sort((x, y) => x.seat.localeCompare(y.seat));
}

function testedTurn(f: HcFixture): { batch: Batch } {
  const { batch }: { batch: Batch } = holding(f);
  return { batch: { ...batch, tested_top: batch.top } };
}

function mergeText(path: string): string {
  const state: State = readState(path);
  const batch = state.batch;
  expect(batch).toBeDefined();
  const context: string =
    batch!.top === undefined ? `attempt=${batch!.attempt} solo` : `attempt=${batch!.attempt} top=${batch!.top}`;
  return `merge-issue ${state.slug} slot=B phase=merge leaf=${path} ${context}`;
}

test('only the earlier-stamped merge leaf is prompted while the waiting leaf keeps its tab and seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    const before: State = toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    expect((await next(f, [])).code).toBe(0);
    seatOwned(aa.path);
    expect((await next(f, [])).code).toBe(0);
    expect(await mergePrompts(f)).toEqual([{ seat: 'aa/b', text: mergeText(aa.path) }]);
    expect(readState(bb.path)).toEqual(before);
    expect(await liveTabs(f)).toEqual(['aa', 'bb']);
    for (const seat of Object.values(before.seat))
      expect((await f.core.get(z.string().parse(seat?.address))).state).toBe('live');
  } finally {
    await f.clean();
  }
}, 15000);

test('an ineligible merge leaf never holds the turn (blocked-by)', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z', {});
    toMerge(bb.path, '2026-09-12T00:00:00.000Z', { 'blocked-by': ['cc'] });
    leaf(f, 'cc', 'failed');
    const baseline: number = (await allTasks(f)).length;
    expect((await next(f, ['--all'])).code).toBe(1);
    seatOwned(aa.path);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(await mergePrompts(f)).toEqual([{ seat: 'aa/b', text: mergeText(aa.path) }]);
    expect(await allTasks(f)).toHaveLength(baseline + 1);
    expect(readState(bb.path).prompted.B).toBeUndefined();
  } finally {
    await f.clean();
  }
}, 15000);

for (const exit of ['seat merged', 'seat check.fix', 'seat failed', 'operator merged'] as const) {
  test(`the ${exit} holder exit wakes the next merge leaf without a manual next`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      const [aa, bb]: { path: string }[] = await allocatedLeaves(f, ['aa', 'bb']);
      toMerge(aa.path, '2026-09-11T00:00:00.000Z', exit.endsWith('merged') ? testedTurn(f) : {});
      toMerge(bb.path, '2026-09-12T00:00:00.000Z');
      const args: string[] =
        exit === 'seat merged'
          ? ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', 'a1']
          : exit === 'seat check.fix'
            ? ['phase', 'aa', 'check.fix', '--slot', 'B']
            : exit === 'seat failed'
              ? ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B']
              : ['phase', 'aa', 'merged'];
      expect((await cli(f, args, f.root, f.env)).code).toBe(0);
      expect(readState(aa.path).phase).toBe(
        exit === 'seat check.fix' ? 'check.fix' : exit === 'seat failed' ? 'failed' : 'merged',
      );
      expect(await mergePrompts(f)).toEqual([]);
      expect(readState(bb.path).batch?.owner).toBe('command');
      seatOwned(bb.path);
      // B works on its merge task through the later pass, as a merge seat would.
      holdTurns(f);
      expect((await next(f, ['--all'])).code).toBe(exit === 'seat failed' ? 1 : 0);
      expect(await mergePrompts(f)).toEqual([{ seat: 'bb/b', text: mergeText(bb.path) }]);
      expect((await next(f, ['--all'])).code).toBe(exit === 'seat failed' ? 1 : 0);
      expect((await mergePrompts(f)).filter((prompt) => prompt.seat === 'bb/b')).toHaveLength(1);
    } finally {
      await f.clean();
    }
  }, 15000);
}

test('a committed merge whose log append fails still wakes the next leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z', testedTurn(f));
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    const log: string = resolve(f.root, 'issues/log.jsonl');
    writeFileSync(log, '');
    chmodSync(log, 0o444);
    const result: Result = await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, f.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('committed');
    expect(result.stderr).toContain('log append failed');
    chmodSync(log, 0o644);
    expect(readState(aa.path).phase).toBe('merged');
    expect(readState(bb.path).batch?.owner).toBe('command');
    expect(await mergePrompts(f)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 15000);

test('a leaf re-entering merge queues behind the two leaves stamped earlier', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const [aa, bb, cc]: { path: string }[] = await allocatedLeaves(f, ['aa', 'bb', 'cc']);
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    toMerge(cc.path, '2026-09-13T00:00:00.000Z');
    // Every merge seat works on its task until this case lets it finish.
    holdTurns(f);
    const seats = async (): Promise<string[]> => (await mergePrompts(f)).map((prompt) => prompt.seat);
    expect((await next(f, ['--all'])).code).toBe(0);
    seatOwned(aa.path);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await seats()).toEqual(['aa/b']);
    expect((await cli(f, ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B'], f.root, f.env)).code).toBe(0);
    seatOwned(bb.path);
    expect((await next(f, ['bb'])).code).toBe(0);
    expect(await seats()).toEqual(['aa/b', 'bb/b']);
    expect((await cli(f, ['phase', 'aa', 'merge'], f.root, f.env)).code).toBe(0);
    expect(await seats()).toEqual(['aa/b', 'bb/b']);
    // aa's merge seat finishes its turn, so it is idle for its next merge prompt.
    const aaB: string = z.string().parse(readState(aa.path).seat.B?.address);
    freeTurns(f, aaB);
    await seatIdle(f, aaB, 1);
    const bbAttempt: string = z.string().parse(readState(bb.path).batch?.attempt);
    await verified(f, 'bb', 'merge');
    expect(
      (await cli(f, ['phase', 'bb', 'merged', '--slot', 'B', '--check', '--attempt', bbAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'bb', 'merged', '--slot', 'B', '--attempt', bbAttempt], f.root, f.env)).code).toBe(
      0,
    );
    seatOwned(cc.path);
    expect((await next(f, ['cc'])).code).toBe(0);
    expect(await seats()).toEqual(['aa/b', 'bb/b', 'cc/b']);
    const ccAttempt: string = z.string().parse(readState(cc.path).batch?.attempt);
    await verified(f, 'cc', 'merge');
    expect(
      (await cli(f, ['phase', 'cc', 'merged', '--slot', 'B', '--check', '--attempt', ccAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'cc', 'merged', '--slot', 'B', '--attempt', ccAttempt], f.root, f.env)).code).toBe(
      0,
    );
    seatOwned(aa.path);
    expect((await next(f, ['aa'])).code).toBe(0);
    expect(await seats()).toEqual(['aa/b', 'aa/b', 'bb/b', 'cc/b']);
    const aaAttempt: string = z.string().parse(readState(aa.path).batch?.attempt);
    await verified(f, 'aa', 'merge');
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', aaAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', aaAttempt], f.root, f.env)).code).toBe(
      0,
    );
    expect(readState(resolve(f.root, 'issues/closed/issue/aa')).phase).toBe('merged');
    expect(await seats()).toEqual(['aa/b', 'aa/b', 'bb/b', 'cc/b']);
  } finally {
    await f.clean();
  }
}, 30000);

test('a saved holder failure wakes the stamped queue when the log is a directory', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    mkdirSync(resolve(f.root, 'issues/log.jsonl'));
    const result: Result = await cli(f, ['phase', 'aa', 'failed', '--reason', 'stop', '--slot', 'B'], f.root, f.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('log append failed');
    expect(readState(aa.path).phase).toBe('failed');
    expect(readState(bb.path).batch?.owner).toBe('command');
    expect(await mergePrompts(f)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 15000);

test('unstamped merge dispatch uses log order and refuses unreadable history', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    for (const queued of [aa, bb]) saveState(queued.path, { ...readState(queued.path), phase: 'merge' });
    const log: string = resolve(f.root, 'issues/log.jsonl');
    mkdirSync(log);
    expect((await next(f, ['--all'])).code).not.toBe(0);
    expect(await mergePrompts(f)).toHaveLength(0);
    rmSync(log, { recursive: true });
    const records: string[] = ['bb', 'aa'].map((slug, index) =>
      JSON.stringify({
        ts: `2026-09-1${index + 1}T00:00:00.000Z`,
        repo: 'repo',
        slug,
        from: 'check.review',
        to: 'merge',
        slot: 'B',
        attempts: { A: 0, B: 0 },
        fix_rounds: 0,
        verdict: {},
        head: '',
        diff: '',
        session: null,
      }),
    );
    writeFileSync(log, records.join('\n') + '\n');
    expect((await next(f, ['--all'])).code).toBe(0);
    seatOwned(bb.path);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(await mergePrompts(f)).toEqual([{ seat: 'bb/b', text: mergeText(bb.path) }]);
  } finally {
    await f.clean();
  }
}, 15000);

// blocked-report
test('blocked-report epic folder starts ready and reports dep, input, failed', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    leaf(f, 'depblocked', 'plan.synthesis', { 'blocked-by': ['outside'] }, 'epic');
    const inputPath: string = leaf(f, 'inputblocked', 'plan.synthesis', {}, 'epic');
    readinessInput(inputPath, envFoo);
    leaf(f, 'failedleaf', 'failed', {}, 'epic');
    leaf(f, 'outside', 'plan.synthesis', {}, 'other');
    const result: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    expect(result.code).toBe(1);
    expect(
      skips(result)
        .map((s) => s.slug)
        .sort(),
    ).toEqual(['failedleaf', 'inputblocked']);
    expect(waits(result)).toEqual(['waiting: depblocked on outside (plan.synthesis)']);
    expect(skips(result).find((s) => s.slug === 'inputblocked')!.error).toContain('FOO');
    expect(skips(result).find((s) => s.slug === 'failedleaf')!.error).toContain('phase recovery');
    expect((await allTasks(f)).map((p) => p.text)).toEqual([
      `plan-issue ready slot=A phase=plan.synthesis leaf=${f.root}/issues/open/epic/ready`,
    ]);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report dep detail labels parked, missing, unreadable and skips merged', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'phased', 'implement', {}, 'deps');
    leaf(f, 'merged-open', 'merged', {}, 'deps');
    const closedSrc: string = leaf(f, 'merged-closed', 'merged', {}, 'tmpmove');
    mkdirSync(resolve(f.root, 'issues/closed/tmpmove'), { recursive: true });
    renameSync(closedSrc, resolve(f.root, 'issues/closed/tmpmove/merged-closed'));
    const parkedDir: string = resolve(f.root, 'issues/parked/myepic/parked-dep');
    mkdirSync(parkedDir, { recursive: true });
    yaml(resolve(parkedDir, 'state.yaml'), {
      slug: 'parked-dep',
      phase: 'plan.synthesis',
      created: '2026-10-08',
      repo: 'repo',
      'blocked-by': [],
    });
    const brokenPath: string = leaf(f, 'unreadable-dep', 'plan.synthesis', {}, 'deps');
    writeFileSync(resolve(brokenPath, 'state.yaml'), 'slug: [');
    leaf(f, 'main', 'plan.synthesis', {
      'blocked-by': ['phased', 'merged-open', 'merged-closed', 'parked-dep', 'missing-dep', 'unreadable-dep'],
    });
    const result: Result = await next(f, ['main']);
    expect(result.code).toBe(1);
    const mainSkip: z.infer<typeof skipSchema> = skips(result).find((s) => s.slug === 'main')!;
    expect(mainSkip.error).toContain('phased');
    expect(mainSkip.error).toContain('(implement)');
    expect(mainSkip.error).toContain('parked-dep');
    expect(mainSkip.error).toContain('(parked)');
    expect(mainSkip.error).toContain('missing-dep');
    expect(mainSkip.error).toContain('(missing)');
    expect(mainSkip.error).toContain('unreadable-dep');
    expect(mainSkip.error).toContain('(unreadable)');
    expect(mainSkip.error).not.toContain('merged-open');
    expect(mainSkip.error).not.toContain('merged-closed');
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report input detail names gaps without values and defers to deps', async () => {
  const f: HcFixture = await hcFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'PRESENT=s3cr3t-value-xyz\n');
    const inputPath: string = leaf(f, 'inputblocked', 'plan.synthesis');
    yaml(resolve(inputPath, 'readiness.yaml'), {
      inputs: [
        {
          kind: 'env',
          name: 'FOO',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
        {
          kind: 'file',
          name: 'need.txt',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
        {
          kind: 'env',
          name: 'PRESENT',
          holder: 'repo',
          purpose: 'p',
          consumers: ['x'],
          steps: 's',
          source: 't',
          done: 'd',
        },
      ],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    leaf(f, 'unmerged2', 'plan.synthesis');
    const bothPath: string = leaf(f, 'bothblocked', 'plan.synthesis', { 'blocked-by': ['unmerged2'] });
    readinessInput(bothPath, {
      kind: 'env',
      name: 'BAR',
      holder: 'repo',
      purpose: 'p',
      consumers: ['x'],
      steps: 's',
      source: 't',
      done: 'd',
    });
    const inputResult: Result = await next(f, ['inputblocked']);
    expect(inputResult.code).toBe(1);
    const inputSkip: z.infer<typeof skipSchema> = skips(inputResult).find((s) => s.slug === 'inputblocked')!;
    expect(inputSkip.error).toContain('env');
    expect(inputSkip.error).toContain('FOO');
    expect(inputSkip.error).toContain('file');
    expect(inputSkip.error).toContain('need.txt');
    expect(inputSkip.error).toContain('repo');
    expect(inputSkip.error).not.toContain('PRESENT');
    expect(inputSkip.error).not.toContain('s3cr3t-value-xyz');
    const bothResult: Result = await next(f, ['bothblocked']);
    expect(bothResult.code).toBe(0);
    expect(waits(bothResult)).toEqual(['waiting: bothblocked on unmerged2 (plan.synthesis)']);
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report a failed dependency stays an error', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'stuck', 'failed');
    leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['stuck'] });
    const result: Result = await next(f, ['dependent']);
    expect(result.code).toBe(1);
    expect(skips(result).find((s) => s.slug === 'dependent')!.error).toContain('stuck (failed)');
    expect(waits(result)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report failed and merged share a folder without a merged line', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'failedleaf', 'failed', {}, 'mixed');
    leaf(f, 'mergedleaf', 'merged', {}, 'mixed');
    const result: Result = await next(f, [resolve(f.root, 'issues/open/mixed')]);
    expect(result.code).toBe(1);
    expect(skips(result)).toHaveLength(1);
    const failedSkip: z.infer<typeof skipSchema> = skips(result)[0];
    expect(failedSkip.slug).toBe('failedleaf');
    expect(failedSkip.error).toContain('failed');
    expect(failedSkip.error).toContain('phase recovery');
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report same line by slug, leaf path, and epic path', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    const blockedPath: string = leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['outside'] }, 'epic');
    leaf(f, 'outside', 'plan.synthesis', {}, 'other');
    const bySlug: Result = await next(f, ['blocked']);
    const byLeafPath: Result = await next(f, [blockedPath]);
    const byEpicPath: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    for (const r of [bySlug, byLeafPath, byEpicPath]) {
      expect(r.code).toBe(0);
      expect(waits(r)).toEqual(['waiting: blocked on outside (plan.synthesis)']);
    }
    expect((await allTasks(f)).map((p) => p.text)).toEqual([
      `plan-issue ready slot=A phase=plan.synthesis leaf=${f.root}/issues/open/epic/ready`,
    ]);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report manual forms bare, all inside, all outside match', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis');
    leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['ready'] });
    const bare: Result = await next(f, []);
    const inside: Result = await next(f, ['--all']);
    const outside: Result = await next(f, ['--all'], {}, f.home);
    for (const r of [bare, inside, outside]) {
      expect(r.code).toBe(0);
      expect(waits(r)).toEqual(['waiting: blocked on ready (plan.synthesis)']);
    }
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report automatic silence on wake, resume, and merge wake', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const readyPath: string = leaf(f, 'ready', 'plan.synthesis');
    leaf(f, 'blocked', 'plan.synthesis', { 'blocked-by': ['ready'] });
    leaf(f, 'failedleaf', 'failed');
    expect((await next(f, ['ready'])).code).toBe(0);
    const wake: Result = await next(f, ['--wake']);
    expect(wake.code).toBe(0);
    expect(wake.stderr).toBe('');
    saveState(readyPath, { ...readState(readyPath), 'blocked-by': ['ghost'] });
    const resumed: Result = await next(f, ['--resume'], {}, f.home);
    expect(resumed.code).toBe(0);
    expect(resumed.stderr).toBe('');
    leaf(f, 'mover', 'plan.synthesis');
    const phased: Result = await cli(f, ['phase', 'mover', 'implement'], f.root, f.env);
    expect(phased.code).toBe(0);
    expect(phased.stderr).not.toContain('blocked');
    expect(phased.stderr).not.toContain('failedleaf');
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report dependent not picked when started by completion', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'first', 'merged', {}, 'first-issue');
    leaf(f, 'other', 'plan.synthesis', {}, 'other-issue');
    const second: string = leaf(f, 'second', 'plan.synthesis', { 'blocked-by': ['first', 'other'] }, 'second-issue');
    const result: Result = await next(f, ['first']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(readState(second).tab).toBeUndefined();
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report real errors still report on automatic paths', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const malformed: string = leaf(f, 'malformed', 'plan.synthesis');
    writeFileSync(resolve(malformed, 'state.yaml'), 'slug: [');
    const healthyPath: string = leaf(f, 'healthy', 'plan.synthesis');
    expect((await next(f, ['healthy'])).code).toBe(1);
    expect(readState(healthyPath).seat.A).toBeDefined();
    const wake: Result = await next(f, ['--wake']);
    expect(wake.code).toBe(1);
    expect(wake.stderr).toContain(malformed);
    const resumed: Result = await next(f, ['--resume'], {}, f.home);
    expect(resumed.code).toBe(1);
    expect(resumed.stderr).toContain(malformed);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report no line for capacity waits', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'first', 'plan.synthesis');
    leaf(f, 'second', 'plan.synthesis');
    configure(f, { max_active: 1 });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(await liveTabs(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report no line for merge turn waits', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(readState(aa.path).batch?.owner).toBe('command');
    expect(await mergePrompts(f)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 15000);

test('blocked-report no line for busy seats', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const busyPath: string = leaf(f, 'busy', 'plan.synthesis', {}, 'epic');
    leaf(f, 'ready', 'plan.synthesis', {}, 'epic');
    holdTurns(f, 'blocked:kind=permission:msg=Allow?');
    expect((await next(f, ['busy'])).code).toBe(0);
    const a: string = z.string().parse(readState(busyPath).seat.A?.address);
    await f.core.waitFor(a, (t: Terminal) => t.status?.state === 'blocked');
    const promptsBefore: number = (await allTasks(f)).length;
    const result: Result = await next(f, [resolve(f.root, 'issues/open/epic')]);
    expect(result.code).toBe(0);
    expect(result.stderr).toBe('');
    expect(await allTasks(f)).toHaveLength(promptsBefore + 1);
    expect((await allTasks(f)).filter((p) => p.slug === 'ready').map((p) => p.text)).toEqual([
      `plan-issue ready slot=A phase=plan.synthesis leaf=${f.root}/issues/open/epic/ready`,
    ]);
  } finally {
    await f.clean();
  }
}, 15000);
// The slug each seat task names, sorted: the leaves a pass dispatched.
async function dispatchedSlugs(f: HcFixture): Promise<string[]> {
  return (await allTasks(f)).map((prompt) => prompt.text.split(' ')[1]).sort();
}

async function namedTargetRepo(): Promise<HcFixture> {
  const f: HcFixture = await hcFixture();
  configure(f, { max_active: 8 });
  leaf(f, 'e1-l1', 'plan.synthesis', {}, 'epic-e/n1');
  leaf(f, 'e1-l2', 'plan.synthesis', {}, 'epic-e/n1');
  leaf(f, 'e2-l1', 'plan.synthesis', {}, 'epic-e/n2');
  leaf(f, 't-l1', 'plan.synthesis', {}, 'top-t');
  leaf(f, 't-l2', 'plan.synthesis', {}, 'top-t');
  leaf(f, 'side', 'plan.synthesis', {}, 'side-issue');
  mkdirSync(resolve(f.root, 'sub'));
  return f;
}

function stateSnapshot(paths: string[]): string[] {
  return paths.map((path) => readFileSync(resolve(path, 'state.yaml'), 'utf8'));
}

async function expectNoLaunch(f: HcFixture, paths: string[], before: string[]): Promise<void> {
  expect(paths.map((path) => readFileSync(resolve(path, 'state.yaml'), 'utf8'))).toEqual(before);
  expect(allStarts(f)).toEqual([]);
  expect(await f.core.terminals({ akrogon: '1' }, true)).toEqual([]);
  expect(existsSync(storeDir(f))).toBe(false);
  expect(existsSync(resolve(f.home, '.lock'))).toBe(false);
  expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
}

// A refusal inside the dispatch lock creates `.lock` itself, so unlike
// expectNoLaunch it cannot assert that file's absence.
async function expectRefused(f: HcFixture, paths: string[], before: string[]): Promise<void> {
  expect(paths.map((path) => readFileSync(resolve(path, 'state.yaml'), 'utf8'))).toEqual(before);
  expect(allStarts(f)).toEqual([]);
  expect(await f.core.terminals({ akrogon: '1' }, true)).toEqual([]);
  expect(existsSync(storeDir(f))).toBe(false);
  expect(existsSync(resolve(f.root, 'issues/log.jsonl'))).toBe(false);
}

const namedTargetOwners: { name: string; path: string; slugs: string[] }[] = [
  { name: 'epic-e', path: 'issues/open/epic-e', slugs: ['e1-l1', 'e1-l2', 'e2-l1'] },
  { name: 'n1', path: 'issues/open/epic-e/n1', slugs: ['e1-l1', 'e1-l2'] },
  { name: 'top-t', path: 'issues/open/top-t', slugs: ['t-l1', 't-l2'] },
];
for (const owner of namedTargetOwners) {
  for (const cwd of ['root', 'sub', 'worktree'] as const) {
    test(`named target equivalence: owner ${owner.name} matches folder path ${owner.path} from ${cwd}`, async () => {
      const named: HcFixture = await namedTargetRepo();
      const pathed: HcFixture = await namedTargetRepo();
      try {
        let from: string = named.root;
        if (cwd === 'sub') from = resolve(named.root, 'sub');
        if (cwd === 'worktree') {
          const side: string = resolve(named.root, 'issues/open/side-issue/side');
          expect((await next(named, ['side'])).code).toBe(0);
          from = readState(side).worktree!;
        }
        // The side leaf's own task, from the worktree variant's setup pass, is not part of the comparison.
        const slugsOf = async (g: HcFixture): Promise<string[]> =>
          (await dispatchedSlugs(g)).filter((slug) => slug !== 'side');
        const byName: Result = await next(named, [owner.name], {}, from);
        const byPath: Result = await next(pathed, [owner.path]);
        expect(byName.code).toBe(0);
        expect(byPath.code).toBe(0);
        expect(await slugsOf(named)).toEqual(owner.slugs);
        expect(await slugsOf(pathed)).toEqual(owner.slugs);
        expect(await slugsOf(named)).toEqual(await slugsOf(pathed));
      } finally {
        await named.clean();
        await pathed.clean();
      }
    }, 15000);
  }
}

test('leaf slug selection keeps open and closed behavior', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'staying', 'plan.synthesis');
    expect((await next(f, ['staying'])).code).toBe(0);
    expect(await dispatchedSlugs(f)).toEqual(['staying']);
  } finally {
    await f.clean();
  }
  const g: HcFixture = await hcFixture();
  try {
    const path: string = leaf(g, 'moved', 'plan.synthesis');
    const closed: string = resolve(g.root, 'issues/closed/issue');
    mkdirSync(closed, { recursive: true });
    renameSync(path, resolve(closed, 'moved'));
    expect((await next(g, ['moved'])).code).toBe(0);
    expect(await dispatchedSlugs(g)).toEqual(['moved']);
  } finally {
    await g.clean();
  }
});

test('existing folder shadows a same-named owner or leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    configure(f, { max_active: 8 });
    leaf(f, 'a1', 'plan.synthesis', {}, 'epic-a/dup');
    leaf(f, 'b1', 'plan.synthesis', {}, 'epic-b/dup');
    const result: Result = await next(f, ['dup'], {}, resolve(f.root, 'issues/open/epic-a'));
    expect(result.code).toBe(0);
    expect(await dispatchedSlugs(f)).toEqual(['a1']);
  } finally {
    await f.clean();
  }
  const g: HcFixture = await hcFixture();
  try {
    leaf(g, 'ghost', 'plan.synthesis');
    mkdirSync(resolve(g.root, 'sub/ghost'), { recursive: true });
    const result: Result = await next(g, ['ghost'], {}, resolve(g.root, 'sub'));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('No leaves match');
    expect(await allTasks(g)).toHaveLength(0);
    expect(allStarts(g)).toEqual([]);
  } finally {
    await g.clean();
  }
});

test('ambiguous name refuses two same-name issues under different epics', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const a: string = leaf(f, 'a1', 'plan.synthesis', {}, 'ep-a/dup');
    const b: string = leaf(f, 'b1', 'plan.synthesis', {}, 'ep-b/dup');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['dup']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/ep-a/dup');
    expect(result.stderr).toContain('issue issues/open/ep-b/dup');
    await expectNoLaunch(f, [a, b], before);
  } finally {
    await f.clean();
  }
});

test('ambiguous name refuses an epic and its same-name issue', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const a: string = leaf(f, 'l1', 'plan.synthesis', {}, 'same/same');
    const b: string = leaf(f, 'l2', 'plan.synthesis', {}, 'same/other');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['same']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('epic issues/open/same');
    expect(result.stderr).toContain('issue issues/open/same/same');
    await expectNoLaunch(f, [a, b], before);
  } finally {
    await f.clean();
  }
});

test('same-work name starts an issue and its only same-name leaf once', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'exp', 'plan.synthesis', {}, 'exp');
    const result: Result = await next(f, ['exp']);
    expect(result.code).toBe(0);
    expect(await dispatchedSlugs(f)).toEqual(['exp']);
  } finally {
    await f.clean();
  }
});

test('same-work name starts an epic and its only same-name issue once', async () => {
  const f: HcFixture = await hcFixture();
  try {
    configure(f, { max_active: 8 });
    leaf(f, 'l1', 'plan.synthesis', {}, 'same/same');
    leaf(f, 'l2', 'plan.synthesis', {}, 'same/same');
    const result: Result = await next(f, ['same']);
    expect(result.code).toBe(0);
    expect(await dispatchedSlugs(f)).toEqual(['l1', 'l2']);
  } finally {
    await f.clean();
  }
});

test('ambiguous name refuses an issue whose same-name leaf has a sibling', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const a: string = leaf(f, 'exp', 'plan.synthesis', {}, 'exp');
    const b: string = leaf(f, 'sib', 'plan.synthesis', {}, 'exp');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['exp']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/exp');
    expect(result.stderr).toContain('leaf issues/open/exp/exp');
    await expectNoLaunch(f, [a, b], before);
  } finally {
    await f.clean();
  }
});

test('ambiguous name refuses a same-name pair when the issue holds an unreadable leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const a: string = leaf(f, 'exp', 'plan.synthesis', {}, 'exp');
    const broken: string = leaf(f, 'broken', 'plan.synthesis', {}, 'exp');
    writeFileSync(resolve(broken, 'state.yaml'), 'slug: [');
    const before: string[] = stateSnapshot([a]);
    const result: Result = await next(f, ['exp']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/exp');
    expect(result.stderr).toContain('leaf issues/open/exp/exp');
    await expectNoLaunch(f, [a], before);
  } finally {
    await f.clean();
  }
});

test('ambiguous name refuses an owner and an unrelated leaf', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const a: string = leaf(f, 'l1', 'plan.synthesis', {}, 'own');
    const b: string = leaf(f, 'own', 'plan.synthesis', {}, 'misc');
    const before: string[] = stateSnapshot([a, b]);
    const result: Result = await next(f, ['own']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issue issues/open/own');
    expect(result.stderr).toContain('leaf issues/open/misc/own');
    await expectNoLaunch(f, [a, b], before);
  } finally {
    await f.clean();
  }
});

test('closed owner twin refuses next <slug> without dispatch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'c1', 'plan.synthesis', {}, 'old');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/old'), resolve(f.root, 'issues/closed/old'));
    const o1: string = leaf(f, 'o1', 'plan.synthesis', {}, 'old');
    const before: string[] = stateSnapshot([o1]);
    const result: Result = await next(f, ['o1']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issues/open/old');
    expect(result.stderr).toContain('issues/closed/old');
    expect(result.stderr).not.toContain('Missing leaf');
    await expectRefused(f, [o1], before);
  } finally {
    await f.clean();
  }
});

test('the twin refusal prints once per owner and other owners dispatch under --all', async () => {
  const f: HcFixture = await hcFixture();
  try {
    configure(f, { max_active: 16 });
    mkdirSync(resolve(f.root, 'issues/closed/old'), { recursive: true });
    leaf(f, 'o1', 'plan.synthesis', {}, 'old');
    leaf(f, 'o2', 'plan.synthesis', {}, 'old/inner');
    leaf(f, 'm1', 'merged', {}, 'old');
    leaf(f, 'dep1', 'plan.synthesis', { 'blocked-by': ['m1'] }, 'other');
    leaf(f, 'ok1', 'plan.synthesis', {}, 'other');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    const lines: string[] = result.stderr.split('\n').filter((line) => line !== '');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('issues/open/old');
    expect(lines[0]).toContain('issues/closed/old');
    expect(await dispatchedSlugs(f)).toEqual(['dep1', 'ok1']);
  } finally {
    await f.clean();
  }
});

test('a twin merge leaf never heads the merge queue', async () => {
  const f: HcFixture = await hcFixture();
  try {
    mkdirSync(resolve(f.root, 'issues/closed/old'), { recursive: true });
    leaf(f, 'm1', 'merge', holding(f), 'old');
    const { batch }: { batch: Batch } = holding(f);
    leaf(f, 'm2', 'merge', { batch }, 'other');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('issues/open/old');
    expect(await dispatchedSlugs(f)).toEqual(['m2']);
    const merges: { seat: string; text: string }[] = await mergePrompts(f);
    expect(merges.map((prompt) => prompt.seat)).toEqual(['m2/b']);
    expect(merges[0].text).toContain(`merge-issue m2 slot=B phase=merge leaf=`);
    expect(merges[0].text).toContain(`attempt=${batch.attempt} top=${batch.top}`);
  } finally {
    await f.clean();
  }
});

for (const conflict of ['parked leaf', 'empty parked', 'empty closed'] as const) {
  test(`a ${conflict} owner folder twin refuses next <slug>`, async () => {
    const f: HcFixture = await hcFixture();
    try {
      if (conflict === 'parked leaf') mkdirSync(resolve(f.root, 'issues/parked/old/p1'), { recursive: true });
      else
        mkdirSync(resolve(f.root, `issues/${conflict === 'empty parked' ? 'parked' : 'closed'}/old`), {
          recursive: true,
        });
      const o1: string = leaf(f, 'o1', 'plan.synthesis', {}, 'old');
      const before: string[] = stateSnapshot([o1]);
      const result: Result = await next(f, ['o1']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('issues/open/old');
      expect(result.stderr).toContain(`issues/${conflict === 'empty closed' ? 'closed' : 'parked'}/old`);
      expect(result.stderr).not.toContain('Missing leaf');
      await expectRefused(f, [o1], before);
    } finally {
      await f.clean();
    }
  });
}

test('a closed leaf dispatches by path while its open twin exists', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'c1', 'plan.synthesis', {}, 'old');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/old'), resolve(f.root, 'issues/closed/old'));
    leaf(f, 'o1', 'plan.synthesis', {}, 'old');
    const promptsBefore: number = (await allTasks(f)).length;
    const result: Result = await next(f, ['issues/closed/old']);
    expect(result.code).toBe(0);
    expect(await allTasks(f)).toHaveLength(promptsBefore + 1);
    expect(await dispatchedSlugs(f)).toEqual(['c1']);
  } finally {
    await f.clean();
  }
});

test('empty folder and unknown names give the missing-leaf message', async () => {
  const f: HcFixture = await hcFixture();
  try {
    mkdirSync(resolve(f.root, 'issues/open/emptybox'), { recursive: true });
    const parked: string = resolve(f.root, 'issues/parked/issue/rest');
    mkdirSync(parked, { recursive: true });
    writeFileSync(resolve(parked, 'state.yaml'), 'slug: [');
    const cases: [string, string][] = [
      ['emptybox', 'Missing leaf: emptybox'],
      ['nope', 'Missing leaf: nope'],
      ['rest', 'Missing leaf: rest (parked)'],
    ];
    for (const [input, message] of cases) {
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(message);
    }
    expect(allStarts(f)).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('unreadable leaf under a named issue reports its read error', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'b1', 'plan.synthesis', {}, 'brok');
    writeFileSync(resolve(path, 'state.yaml'), 'slug: [');
    const result: Result = await next(f, ['brok']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(path);
    expect(result.stderr).not.toContain('Missing leaf: brok');
    expect(await allTasks(f)).toHaveLength(0);
  } finally {
    await f.clean();
  }
});

test('owners resolve without ISSUE.md or EPIC.md', async () => {
  const cases: [string, string[]][] = [
    ['ei', ['x1', 'y1']],
    ['ni', ['x1']],
  ];
  for (const [input, slugs] of cases) {
    const f: HcFixture = await hcFixture();
    try {
      configure(f, { max_active: 8 });
      leaf(f, 'x1', 'plan.synthesis', {}, 'ei/ni');
      leaf(f, 'y1', 'plan.synthesis', {}, 'ei/mi');
      expect(existsSync(resolve(f.root, 'issues/open/ei/ISSUE.md'))).toBe(false);
      expect(existsSync(resolve(f.root, 'issues/open/ei/EPIC.md'))).toBe(false);
      expect(existsSync(resolve(f.root, 'issues/open/ei/ni/ISSUE.md'))).toBe(false);
      const result: Result = await next(f, [input]);
      expect(result.code).toBe(0);
      expect(await dispatchedSlugs(f)).toEqual(slugs);
    } finally {
      await f.clean();
    }
  }
});

const selfUpdateMock: string = `import { mock } from 'bun:test';
import { appendFileSync } from 'node:fs';
mock.module(SELF_UPDATE_MODULE, () => ({
  selfUpdate: async (repo: { root: string }) => {
    if (process.env.SELF_UPDATE_THROW === '1') throw new Error('self-update sentinel');
    appendFileSync(process.env.HC_SHIM_LOG, ['self-update', repo.root].join('\\t') + '\\n');
    appendFileSync(process.env.SELF_UPDATE_LOG, repo.root + '\\n');
  },
}));
await import(ENTRY);
`;

// The self-update mock also writes into the hc shim log, so its order against the hc calls shows.
async function selfUpdateCli(
  f: HcFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  const script: string = resolve(f.home, 'wired-self-update.ts');
  writeFileSync(
    script,
    selfUpdateMock
      .replace('SELF_UPDATE_MODULE', JSON.stringify(resolve(import.meta.dir, '../src/self-update.ts')))
      .replace('ENTRY', JSON.stringify(entry)),
  );
  const { stdout, stderr, code }: Result = await spawnCaptured([process.execPath, script, ...args], {
    cwd,
    env: {
      ...process.env,
      ...f.env,
      AKROGON_HOME: f.home,
      HOME: f.home,
      HERDR_PANE_ID: '',
      SELF_UPDATE_LOG: resolve(f.home, 'self-update.log'),
      ...env,
    },
  });
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}

function selfUpdateCalls(f: HcFixture): string[] {
  const path: string = resolve(f.home, 'self-update.log');
  return existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n') : [];
}

test('phase merged records one self-update call for the repo', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'landed', 'merge', holding(f));
    const result: Result = await selfUpdateCli(f, ['phase', 'landed', 'merged']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('moved merged');
    expect(selfUpdateCalls(f)).toEqual([f.root]);
  } finally {
    await f.clean();
  }
});

test('phase failed commits without a self-update call', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'landed', 'merge', holding(f));
    const result: Result = await selfUpdateCli(f, ['phase', 'landed', 'failed', '--reason', 'merge broke']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('moved failed');
    expect(selfUpdateCalls(f)).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a throwing self-update still lets phase merged commit and next dispatch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    leaf(f, 'landed', 'merge', holding(f));
    leaf(f, 'queued', 'plan.synthesis', {}, 'other-issue');
    const env: NodeJS.ProcessEnv = { SELF_UPDATE_THROW: '1' };
    const merged: Result = await selfUpdateCli(f, ['phase', 'landed', 'merged'], env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).toContain('moved merged');
    const dispatched: Result = await selfUpdateCli(f, ['next', 'queued'], env);
    expect(dispatched.code).toBe(0);
    expect((await allTasks(f)).map((prompt) => prompt.text)).toEqual([
      `plan-issue queued slot=A phase=plan.synthesis leaf=${resolve(f.root, 'issues/open/other-issue/queued')}`,
    ]);
  } finally {
    await f.clean();
  }
});

test('next --all, --resume and manual next record the registered or selected repos before dispatch', async () => {
  const f: HcFixture = await hcFixture();
  const g: Fixture = await fixture();
  try {
    configure(f, { repos: { repo: f.root, other: g.root } });
    const picked: string = leaf(f, 'picked', 'plan.synthesis');
    leaf(f, 'sweep', 'implement', {}, 'other-issue');
    const before: number = hcCalls(f).length;
    expect((await selfUpdateCli(f, ['next', '--all'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root]);
    expect(hcCalls(f).slice(before)[0]).toEqual(['self-update', f.root]);
    expect(hcCalls(f).slice(before)[1]).toEqual(['self-update', g.root]);
    expect(
      hcCalls(f)
        .slice(before)
        .some((args) => args[0] === 'run'),
    ).toBe(true);
    await rePromptable(f, picked);
    const resumed: number = hcCalls(f).length;
    expect((await selfUpdateCli(f, ['next', '--resume'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root, f.root, g.root]);
    expect(hcCalls(f).slice(resumed)[0]).toEqual(['self-update', f.root]);
    expect(
      hcCalls(f)
        .slice(resumed)
        .some((args) => args[0] === 'send'),
    ).toBe(true);
    await rePromptable(f, picked);
    const manual: number = hcCalls(f).length;
    expect((await selfUpdateCli(f, ['next', 'picked'])).code).toBe(0);
    expect(selfUpdateCalls(f)).toEqual([f.root, g.root, f.root, g.root, f.root]);
    expect(hcCalls(f).slice(manual)[0]).toEqual(['self-update', f.root]);
    expect(
      hcCalls(f)
        .slice(manual)
        .some((args) => args[0] === 'send'),
    ).toBe(true);
  } finally {
    await f.clean();
    g.clean();
  }
});
