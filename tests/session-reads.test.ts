import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, leaf, procRoot, storeDir, yaml } from './helpers';
import { readState, type State } from '../src/state';
import { command, type SpawnResult } from '../src/shell';
import type { Result } from '../src/shell';
import { z } from 'zod';
import { delivered, hcCore, hcFixture, type HcCore, type HcFixture, type Terminal } from './hc-fixture';

async function dispatchFixture(opts: { mode?: string; window?: 'open' | 'closed' } = {}): Promise<HcFixture> {
  const f: HcFixture = await hcFixture(opts);
  // A fake /proc root: reconcile sees only the terminals a case plants, not host processes.
  return { ...f, env: { ...f.env, AKROGON_PROC_ROOT: procRoot(f) } };
}
async function next(f: HcFixture, args: string[], env: NodeJS.ProcessEnv = {}, cwd: string = f.root): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
function maxActive(f: HcFixture, value: number): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, max_active: value });
}
// A live terminal outside every leaf seat in `core`, with its cwd at dir and the given labels.
async function paneAt(core: HcCore, dir: string, labels: Record<string, string> = {}): Promise<string> {
  mkdirSync(dir, { recursive: true });
  const started: SpawnResult = await core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--cwd',
    dir,
    ...Object.entries(labels).flatMap(([key, value]) => ['--label', `${key}=${value}`]),
    '--',
    'cat',
  ]);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}
// An hc in front of the fixture shim that holds `hc connect` past akrogon's 10 s discovery deadline
// when the call targets `session` and its request names `method`.
function stallingHc(f: HcFixture, method: string, session: string): string {
  const dir: string = resolve(f.home, 'stall-bin');
  mkdirSync(dir, { recursive: true });
  const shim: string = resolve(z.string().parse(f.core.env.PATH).split(':')[0], 'hc');
  writeFileSync(
    resolve(dir, 'hc'),
    `#!/bin/sh
if [ "$1" = connect ]; then
  input=$(cat)
  case "$input" in *'"${method}"'*) [ "$HC_SESSION" = '${session}' ] && exec sleep 12 ;; esac
  printf '%s\\n' "$input" | exec '${shim}' "$@"
fi
exec '${shim}' "$@"
`,
  );
  chmodSync(resolve(dir, 'hc'), 0o755);
  return `${dir}:${f.env.PATH}`;
}

// Criterion 1: a running session whose herdr-app document cannot be read refuses the repo before
// any leaf has a seat, so nothing launches.
test('capacity counts an unreadable session before any leaf has a seat', async () => {
  const f: HcFixture = await dispatchFixture();
  const opaque: HcCore = await hcCore(f, { doc: false });
  try {
    await opaque.rpc('doc.set', { name: 'herdr-app', value: { spaces: 'junk' }, version: 0 });
    f.core.link(opaque);
    const path: string = leaf(f, 'waiting', 'plan.synthesis');
    const result: Result = await next(f, ['waiting']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(opaque.session);
    expect(readState(path).tab).toBeUndefined();
    expect(readState(path).worktree).toBeUndefined();
    expect(await f.core.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await opaque.stop();
    await f.clean();
  }
}, 30000);

// Criterion 2: the cross-session terminal union vetoes worktree removal; a same-id tab in a foreign
// session is no veto; a session whose terminal list cannot be read keeps everything its liveness
// could decide.
test('foreign-session panes and unreadable sessions veto reconcile removal', async () => {
  const f: HcFixture = await dispatchFixture({ window: 'open' });
  const other: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    f.core.link(other);
    // `sibling` is failed with a dead recorded tab: it never dispatches, so
    // the merged leaves' owner never completes and their worktrees reach the
    // removal path.
    leaf(f, 'sibling', 'failed', { tab: 'akdeadsibling' });
    const keptByPane: string = resolve(storeDir(f), 'kept-by-pane');
    const keptByUnreadable: string = resolve(storeDir(f), 'kept-by-unreadable');
    const droppedSameId: string = resolve(storeDir(f), 'dropped-same-id');
    for (const [slug, path] of [
      ['kept-by-pane', keptByPane],
      ['kept-by-unreadable', keptByUnreadable],
      ['dropped-same-id', droppedSameId],
    ] as const) {
      await command(['git', 'worktree', 'add', '-b', slug, path], f.root);
    }
    leaf(f, 'kept-by-pane', 'merged', { tab: 'akkeptbypane', worktree: keptByPane });
    leaf(f, 'kept-by-unreadable', 'merged', { tab: 'akkeptbyunreadable', worktree: keptByUnreadable });
    leaf(f, 'dropped-same-id', 'merged', { tab: 'akdroppedsameid', worktree: droppedSameId });
    // `other` is readable: its terminals inside the kept-* worktrees veto
    // removal, and its terminal holding dropped-same-id's tab id is no keep.
    await paneAt(other, keptByPane, { 'herdr.tab': 'akforeign' });
    await paneAt(other, keptByUnreadable, { 'herdr.tab': 'akforeign2' });
    await paneAt(other, resolve(f.home, 'elsewhere'), { 'herdr.tab': 'akdroppedsameid' });
    const openLeaf = (slug: string): string => resolve(f.root, 'issues/open/issue', slug);
    const first: Result = await next(f, ['--all']);
    expect(first.code).toBe(0);
    expect(existsSync(keptByPane)).toBe(true);
    expect(existsSync(keptByUnreadable)).toBe(true);
    // The same-id tab in `other` is not a live-tab veto: the worktree drops.
    expect(existsSync(droppedSameId)).toBe(false);
    expect(readState(openLeaf('dropped-same-id')).worktree).toBeUndefined();
    expect(readState(openLeaf('kept-by-pane')).worktree).toBe(keptByPane);

    // Now `other` answers no terminal list in time while kept-by-unreadable
    // holds a live tab in the resolved session: the pass may close and drop nothing.
    await paneAt(f.core, keptByUnreadable, { 'herdr.tab': 'akkeptbyunreadable' });
    const second: Result = await next(f, ['--all'], { PATH: stallingHc(f, 'terminal.list', other.session) });
    expect(second.code).toBe(0);
    expect(existsSync(keptByUnreadable)).toBe(true);
    // Its recorded tab was live in the resolved session but was not closed
    // while `other` stayed unreadable.
    expect(f.core.appCalls().filter((call) => call.argv[1] === 'tab.close')).toEqual([]);
    expect(existsSync(keptByPane)).toBe(true);
  } finally {
    await other.stop();
    await f.clean();
  }
}, 45000);

test('foreign-session panes with colliding tab ids keep merged and failed worktrees', async () => {
  const f: HcFixture = await dispatchFixture({ window: 'open' });
  const other: HcCore = await hcCore(f, { repo: 'misc' });
  try {
    f.core.link(other);
    leaf(f, 'sibling', 'failed', { tab: 'akdeadsibling' });
    const merged: string = resolve(storeDir(f), 'merged');
    const failed: string = resolve(storeDir(f), 'failed');
    await command(['git', 'worktree', 'add', '-b', 'merged', merged], f.root);
    await command(['git', 'worktree', 'add', '-b', 'failed', failed], f.root);
    const mergedLeaf: string = leaf(f, 'merged', 'merged', { tab: 'akmergedtab', worktree: merged });
    const failedLeaf: string = leaf(f, 'failed', 'failed', { tab: 'akfailedtab', worktree: failed });
    await paneAt(other, merged, { 'herdr.tab': 'akmergedtab' });
    await paneAt(other, failed, { 'herdr.tab': 'akfailedtab' });
    const result: Result = await next(f, ['--all']);
    expect(result.code, result.stderr).toBe(0);
    expect(existsSync(merged)).toBe(true);
    expect(existsSync(failed)).toBe(true);
    expect(readState(mergedLeaf).worktree).toBe(merged);
    expect(readState(failedLeaf).worktree).toBe(failed);
    expect(f.core.appCalls().filter((call) => call.argv[1] === 'tab.close')).toEqual([]);
    expect((await other.terminals({}, false)).map((t: Terminal) => t.state)).toEqual(['live', 'live']);
  } finally {
    await other.stop();
    await f.clean();
  }
}, 30000);

// Criterion 3: within one pass the inventory reflects launches already made;
// a leaf whose recorded tab no terminal holds counts nothing and gets a seat.
test('a fresh pane read sees the seat created earlier in the pass and ignores a closed tab', async () => {
  const f: HcFixture = await dispatchFixture();
  try {
    maxActive(f, 1);
    leaf(f, 'a-first', 'plan.synthesis');
    leaf(f, 'b-second', 'plan.synthesis');
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(0);
    // Sweep order is unspecified: exactly one of the two leaves gets the seat.
    const tabs: (string | undefined)[] = ['a-first', 'b-second'].map(
      (slug) => readState(resolve(f.root, 'issues/open/issue', slug)).tab,
    );
    expect(tabs.filter((tab) => tab !== undefined)).toHaveLength(1);
    expect(await f.core.terminals({ akrogon: '1' }, false)).toHaveLength(1);

    // A leaf whose recorded tab no terminal holds counts nothing and gets a seat in that tab.
    maxActive(f, 2);
    leaf(f, 'gone', 'plan.synthesis', { tab: 'akgonetab' });
    const redo: Result = await next(f, ['gone']);
    expect(redo.code).toBe(0);
    const state: State = readState(resolve(f.root, 'issues/open/issue/gone'));
    expect(state.tab).toBeDefined();
    expect((await f.core.terminals({ 'akrogon.leaf': 'gone' })).map((t: Terminal) => t.labels['herdr.tab'])).toEqual([
      z.string().parse(state.tab),
    ]);
  } finally {
    await f.clean();
  }
}, 30000);

// Criterion 6: a manual run takes scope from the target or cwd; an inherited
// HC_TERMINAL_ID never selects, attributes or acts on a leaf.
test('a manual next ignores an inherited HC_TERMINAL_ID', async () => {
  // `idle` seats never finish a turn, so a later pass has nothing to re-prompt.
  const f: HcFixture = await dispatchFixture({ mode: 'idle' });
  try {
    const target: string = leaf(f, 'target', 'plan.synthesis');
    const other: string = leaf(f, 'other-seat', 'plan.synthesis');
    expect((await next(f, ['other-seat'])).code).toBe(0);
    const otherSeat: string = z.string().parse(readState(other).seat.A?.address);
    const inherited: NodeJS.ProcessEnv = { HC_TERMINAL_ID: otherSeat, HC_SESSION: f.core.session };
    const before: number = (await delivered(f, 'other-seat')).length;

    const named: Result = await next(f, ['target'], inherited);
    expect(named.code).toBe(0);
    expect(readState(target).tab).toBeDefined();

    // Untyped from the repo root: the sweep, not the env terminal, picks leaves.
    const untyped: Result = await next(f, [], inherited);
    expect(untyped.code).toBe(0);
    expect((await delivered(f, 'other-seat')).length).toBe(before);
    expect((await delivered(f, 'target')).map((d) => d.text)).toEqual([expect.stringContaining('plan-issue target')]);
  } finally {
    await f.clean();
  }
}, 30000);

// Criterion 7: a move without a slot records session:null even when
// HC_TERMINAL_ID names a live seat; a slotted move attributes through the
// slot's recorded seat, never the environment terminal.
test('log session is null without a slot and comes from the slot seat otherwise', async () => {
  const f: HcFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'loggy', 'plan.synthesis');
    expect((await next(f, ['loggy'])).code).toBe(0);
    const state: State = readState(path);
    const a: string = z.string().parse(state.seat.A?.address);
    const worktree: string = z.string().parse(state.worktree);
    // Each terminal carries a recorded transcript, which the log reads as the session.
    const b: string = await paneAt(f.core, resolve(f.home, 'elsewhere'));
    expect((await f.core.hc(['label', a, 'akrogon.transcript=sess-a'])).code).toBe(0);
    expect((await f.core.hc(['label', b, 'akrogon.transcript=sess-b'])).code).toBe(0);
    const logPath: string = resolve(f.root, 'issues/log.jsonl');
    const lastSession = (): string | null =>
      z
        .object({ session: z.string().nullable() })
        .parse(JSON.parse(readFileSync(logPath, 'utf8').trim().split('\n').at(-1)!)).session;

    // Slotted move with the env pointing at terminal b: attribution is seat A's.
    const failed: Result = await cli(f, ['phase', 'loggy', 'failed', '--slot', 'A', '--reason', 'blocked'], worktree, {
      ...f.env,
      HC_TERMINAL_ID: b,
      HC_SESSION: f.core.session,
    });
    expect(failed.code).toBe(0);
    expect(lastSession()).toBe('sess-a');

    // Operator recovery with no slot: session is null even though the env
    // names a live seat with a recorded transcript in the resolved session.
    const recovered: Result = await cli(f, ['phase', 'loggy', 'plan.synthesis'], worktree, {
      ...f.env,
      HC_TERMINAL_ID: a,
      HC_SESSION: f.core.session,
    });
    expect(recovered.code).toBe(0);
    expect(lastSession()).toBeNull();
  } finally {
    await f.clean();
  }
}, 30000);
