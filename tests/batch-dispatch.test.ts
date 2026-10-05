import { test, expect } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, fakeHerdr, leaf, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import type { Database } from './fake-herdr';
import { z } from 'zod';
import { commitMove } from '../src/phase';
import { readRepo } from '../src/config';

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
    : [];
}
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
async function allocatedLeaf(f: DispatchFixture, slug: string): Promise<{ path: string; b: string }> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  expect((await next(f, [slug])).code).toBe(0);
  const allocated: State = readState(path);
  return { path, b: allocated.pane.B! };
}
function toMerge(path: string, mergeStamp: string, extra: object = {}): State {
  const moved: State = { ...readState(path), phase: 'merge', merge_stamp: mergeStamp, ...extra };
  saveState(path, moved);
  return moved;
}
function mergePrompts(f: DispatchFixture): Database['prompts'] {
  return database(f).prompts.filter((prompt) => prompt.text.startsWith('merge-issue'));
}
async function head(f: DispatchFixture, slug: string): Promise<string> {
  return command(['git', 'rev-parse', `refs/heads/${slug}`], f.root);
}
async function commitFile(f: DispatchFixture, path: string, name: string, content: string): Promise<void> {
  const worktree: string = z.string().parse(readState(path).worktree);
  writeFileSync(resolve(worktree, name), content);
  await command(['git', 'add', name], worktree);
  await command(['git', 'commit', '-m', name], worktree);
}
function expectedPrompt(path: string, pane: string): { pane: string; text: string } {
  const state: State = readState(path);
  const batch = state.batch;
  expect(batch).toBeDefined();
  const context: string =
    batch!.solo === true ? `attempt=${batch!.attempt} solo` : `attempt=${batch!.attempt} top=${batch!.top}`;
  return { pane, text: `merge-issue ${state.slug} slot=B phase=merge leaf=${path} ${context}` };
}
function idleAll(f: DispatchFixture): void {
  const db: Database = database(f);
  saveDatabase(f, { ...db, panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) });
}
function leafPath(path: string): string {
  return existsSync(path) ? path : path.replace('issues/open', 'issues/closed');
}
function leafState(path: string): State {
  return readState(leafPath(path));
}
async function pushMain(f: DispatchFixture, name: string): Promise<void> {
  writeFileSync(resolve(f.root, name), `${name}\n`);
  await command(['git', 'add', name], f.root);
  await command(['git', 'commit', '-m', name], f.root);
  await command(['git', 'push', 'origin', 'main'], f.root);
}

test('the holder gets a batch record, members are applied, and only the holder is prompted', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    const before: State = toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    // Remote movement between merge and the pass puts the member on a stale base.
    await pushMain(f, 'main-advance');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, [])).code).toBe(0);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.solo).toBeUndefined();
    expect(state.batch?.attempt).toBeTruthy();
    expect(state.batch?.top).toBeTruthy();
    const member = state.batch?.members[0];
    expect(member?.slug).toBe('bb');
    expect(member?.head).toBe(bbHead);
    expect(member?.tip).not.toBe(bbHead);
    expect(await head(f, 'bb')).toBe(z.string().parse(member?.tip));
    expect(await head(f, 'aa')).toBe(z.string().parse(state.batch?.top));
    expect(database(f).prompts).toEqual([expectedPrompt(aa.path, aa.b)]);
    expect(readState(bb.path)).toEqual(before);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['aa', 'bb']);
    for (const paneId of Object.values(before.pane))
      expect(database(f).panes.some((pane) => pane.pane_id === paneId)).toBe(true);
  } finally {
    f.clean();
  }
}, 15000);

test('a member conflict marks it solo, rewrites the record without it and leaves its branch untouched', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    const cc: { path: string; b: string } = await allocatedLeaf(f, 'cc');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'clash', 'bb\n');
    await commitFile(f, cc.path, 'clash', 'cc\n');
    const bbHead: string = await head(f, 'bb');
    const ccHead: string = await head(f, 'cc');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    toMerge(cc.path, '2026-09-13T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(cc.path).solo).toBe(true);
    expect(await head(f, 'cc')).toBe(ccHead);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.members.map((member) => member.slug)).toEqual(['bb']);
    expect(await head(f, 'bb')).toBe(z.string().parse(state.batch?.members[0]?.tip));
    expect(database(f).prompts).toEqual([expectedPrompt(aa.path, aa.b)]);
    // The solo leaf becomes a holder under a fresh record once the batch finishes.
    idleAll(f);
    const aaAttempt: string = z.string().parse(readState(aa.path).batch?.attempt);
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', aaAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', aaAttempt], f.root, f.env)).code).toBe(
      0,
    );
    // bb stayed carried and landed with aa's push; the solo-conflicted cc holds the
    // next turn under a fresh memberless solo record and is prompted (criterion 3).
    expect(await head(f, 'bb')).toBe(bbHead);
    expect(readState(bb.path).phase).toBe('merged');
    expect(readState(cc.path).batch?.applied).toBe(true);
    expect(readState(cc.path).batch?.members).toEqual([]);
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, cc.b]);
    idleAll(f);
    const ccAttempt: string = z.string().parse(readState(cc.path).batch?.attempt);
    expect(
      (await cli(f, ['phase', 'cc', 'merged', '--slot', 'B', '--check', '--attempt', ccAttempt], f.root, f.env)).code,
    ).toBe(0);
    // cc's range still conflicts on the new main: the push is refused and the restack
    // drops it back to a solo record for its own B to resolve (design step 4).
    const restack: Result = await cli(
      f,
      ['phase', 'cc', 'merged', '--slot', 'B', '--attempt', ccAttempt],
      f.root,
      f.env,
    );
    expect(restack.code).toBe(0);
    expect(restack.stdout).toContain('fresh checks required');
    expect((await next(f, ['--all'])).code).toBe(0);
    const ccState: State = leafState(cc.path);
    expect(ccState.batch?.applied).toBe(true);
    expect(ccState.batch?.solo).toBe(true);
    expect(ccState.batch?.members).toEqual([]);
    expect(mergePrompts(f).map((prompt) => prompt.pane)).toEqual([aa.b, cc.b]);
    expect(mergePrompts(f).at(-1)?.text).toContain('solo');
  } finally {
    f.clean();
  }
}, 20000);

test('an interrupted build restores drifted members and rebuilds under a new attempt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const savedHead: string = await head(f, 'bb');
    const aaHead: string = await head(f, 'aa');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveState(aa.path, {
      ...readState(aa.path),
      batch: {
        attempt: 'interrupted-attempt',
        built_on: builtOn,
        holder: { base: builtOn, head: aaHead },
        members: [{ slug: 'bb', base: builtOn, head: savedHead, tip: savedHead }],
        applied: false,
      },
    });
    await commitFile(f, bb.path, 'bb-drift', 'drifted\n');
    const drifted: string = await head(f, 'bb');
    expect(drifted).not.toBe(savedHead);
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.attempt).not.toBe('interrupted-attempt');
    expect(state.batch?.attempt).toBeTruthy();
    const member = state.batch?.members[0];
    expect(member?.slug).toBe('bb');
    expect(member?.head).toBe(savedHead);
    expect(await head(f, 'bb')).toBe(z.string().parse(member?.tip));
    expect(await head(f, 'bb')).not.toBe(drifted);
    expect(database(f).prompts).toEqual([expectedPrompt(aa.path, aa.b)]);
    expect(await command(['git', 'status', '--porcelain'], z.string().parse(readState(bb.path).worktree))).toBe('');
  } finally {
    f.clean();
  }
}, 15000);

test('a failed holder with a landed candidate is told to move back, then reconciles without run or push', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const applied: State = readState(aa.path);
    const top: string = z.string().parse(applied.batch?.top);
    await command(['git', 'push', 'origin', 'refs/heads/aa:main'], f.root);
    saveState(aa.path, { ...applied, phase: 'failed', batch: { ...applied.batch!, candidate: top } });
    saveDatabase(f, { ...database(f), prompts: [] });
    const callsBefore: number = calls(f).length;
    expect((await next(f, ['--all'])).code).toBe(0);
    const notice: string[][] = calls(f)
      .slice(callsBefore)
      .filter((args) => args[0] === 'notification' && args[1] === 'show');
    expect(notice).toHaveLength(1);
    expect(notice[0][2]).toBe('repo/aa merged, move it back');
    expect(notice[0].join(' ')).toContain('akrogon phase aa merge');
    expect(readState(aa.path).phase).toBe('failed');
    expect(readState(aa.path).batch?.candidate).toBe(top);
    idleAll(f);
    const promptsBefore: number = database(f).prompts.length;
    const promptCallsBefore: number = calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt').length;
    expect((await cli(f, ['phase', 'aa', 'merge'], f.root, f.env)).code).toBe(0);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(database(f).prompts).toHaveLength(promptsBefore);
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(promptCallsBefore);
  } finally {
    f.clean();
  }
}, 20000);

test('a failed holder keeps carried members, and the move-back clears the record and member tabs', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string; b: string } = await allocatedLeaf(f, 'holder');
    const m1: { path: string; b: string } = await allocatedLeaf(f, 'm1');
    const m2: { path: string; b: string } = await allocatedLeaf(f, 'm2');
    await commitFile(f, holder.path, 'h-file', 'h\n');
    await commitFile(f, m1.path, 'm1-file', 'm1\n');
    await commitFile(f, m2.path, 'm2-file', 'm2\n');
    const m1Tab: string = z.string().parse(readState(m1.path).tab);
    const m2Tab: string = z.string().parse(readState(m2.path).tab);
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    toMerge(m1.path, '2026-09-12T00:00:00.000Z');
    toMerge(m2.path, '2026-09-13T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const record = readState(holder.path).batch;
    const top: string = z.string().parse(record?.top);
    await command(['git', 'push', 'origin', 'refs/heads/holder:main'], f.root);
    // The holder failed after its push; both carried members are still in merge.
    saveState(holder.path, { ...readState(holder.path), phase: 'failed', batch: { ...record!, candidate: top } });
    const callsBefore: number = calls(f).length;
    expect((await next(f, ['--all'])).code).toBe(0);
    const notice: string[][] = calls(f)
      .slice(callsBefore)
      .filter((args) => args[0] === 'notification' && args[1] === 'show');
    expect(notice).toHaveLength(1);
    expect(notice[0][2]).toBe('repo/holder merged, move it back');
    // The pass still lands carried members by ancestry and closes their tabs; the
    // record stays with no surviving members so the operator can move it back.
    expect(leafState(m1.path).phase).toBe('merged');
    expect(leafState(m2.path).phase).toBe('merged');
    expect(readState(holder.path).phase).toBe('failed');
    expect(readState(holder.path).batch?.members).toEqual([]);
    expect(
      calls(f)
        .filter((args) => args[0] === 'tab' && args[1] === 'close')
        .map((args) => args[2])
        .sort(),
    ).toEqual([m1Tab, m2Tab].sort());
    const promptCallsBefore: number = calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt').length;
    expect((await cli(f, ['phase', 'holder', 'merge'], f.root, f.env)).code).toBe(0);
    expect(leafState(holder.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    expect(calls(f).filter((args) => args[0] === 'agent' && args[1] === 'prompt')).toHaveLength(promptCallsBefore);
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close')).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 25000);

test('a landed batch moves member and holder once, closes member tabs with the record, and wakes dependents', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string; b: string } = await allocatedLeaf(f, 'holder');
    const m1: { path: string; b: string } = await allocatedLeaf(f, 'm1');
    const m2: { path: string; b: string } = await allocatedLeaf(f, 'm2');
    await commitFile(f, holder.path, 'h-file', 'h\n');
    const dependent: string = leaf(f, 'dep', 'plan.synthesis', { 'blocked-by': ['m2'] }, 'dep-issue');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    toMerge(m1.path, '2026-09-12T00:00:00.000Z');
    toMerge(m2.path, '2026-09-13T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const record = readState(holder.path).batch;
    const m1Tip: string = z.string().parse(record?.members.find((member) => member.slug === 'm1')?.tip);
    const m2Tip: string = z.string().parse(record?.members.find((member) => member.slug === 'm2')?.tip);
    const top: string = z.string().parse(record?.top);
    await command(['git', 'push', 'origin', 'refs/heads/holder:main'], f.root);
    // A move that died after m1's commit leaves m1 merged with its tab and the record alive.
    saveState(m1.path, { ...readState(m1.path), phase: 'merged' });
    saveState(holder.path, { ...readState(holder.path), batch: { ...record!, candidate: top } });
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(leafState(m2.path).phase).toBe('merged');
    expect(leafState(holder.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    expect(leafState(m1.path).phase).toBe('merged');
    // The record clears with the holder's move, so carried member tabs close in the same
    // pass even though m1 merged earlier; the holder's own tab still waits for the
    // pane-idle path.
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['holder', 'dep']);
    expect(database(f).prompts).toEqual([
      { pane: readState(dependent).pane.A!, text: `plan-issue dep slot=A phase=plan.synthesis leaf=${dependent}` },
    ]);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(database(f).tabs.map((tab) => tab.label)).toEqual(['dep']);
    expect(existsSync(readState(resolve(f.root, 'issues/closed/issue/m1')).worktree!)).toBe(false);
    // Member branches are deleted by merged cleanup; their tips stay merged on the remote.
    expect((await run(['git', 'rev-parse', '--verify', '--quiet', 'refs/heads/m1'], f.root)).code).not.toBe(0);
    expect((await run(['git', 'merge-base', '--is-ancestor', m1Tip, 'origin/main'], f.root)).code).toBe(0);
    expect((await run(['git', 'merge-base', '--is-ancestor', m2Tip, 'origin/main'], f.root)).code).toBe(0);
  } finally {
    f.clean();
  }
}, 25000);

test('a green batch clears the record and closes member tabs once the holder lands', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string; b: string } = await allocatedLeaf(f, 'holder');
    const m1: { path: string; b: string } = await allocatedLeaf(f, 'm1');
    const m2: { path: string; b: string } = await allocatedLeaf(f, 'm2');
    await commitFile(f, holder.path, 'h-file', 'h\n');
    await commitFile(f, m1.path, 'm1-file', 'm1\n');
    await commitFile(f, m2.path, 'm2-file', 'm2\n');
    const holderTab: string = z.string().parse(readState(holder.path).tab);
    const memberTabs: string[] = [m1, m2].map((leafRef) => z.string().parse(readState(leafRef.path).tab));
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    toMerge(m1.path, '2026-09-12T00:00:00.000Z');
    toMerge(m2.path, '2026-09-13T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const attempt: string = z.string().parse(readState(holder.path).batch?.attempt);
    const closes = (): string[] =>
      calls(f)
        .filter((args) => args[0] === 'tab' && args[1] === 'close')
        .map((args) => args[2]);
    expect(closes()).toEqual([]);
    idleAll(f);
    expect(
      (await cli(f, ['phase', 'holder', 'merged', '--slot', 'B', '--check', '--attempt', attempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'holder', 'merged', '--slot', 'B', '--attempt', attempt], f.root, f.env)).code).toBe(
      0,
    );
    expect(leafState(holder.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    expect(leafState(m1.path).phase).toBe('merged');
    expect(leafState(m2.path).phase).toBe('merged');
    // The reconcile inside the merged call closes every carried member's tab; the
    // holder's own tab still belongs to the pane-idle sweep path.
    expect(closes().sort()).toEqual([...memberTabs].sort());
    expect(database(f).tabs.map((tab) => tab.tab_id)).toEqual([holderTab]);
    // With the record gone no pass fetches for it again: rename the remote and the
    // next pass stays clean.
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    const after: Result = await next(f, ['--all']);
    expect(after.code).toBe(0);
    expect(after.stderr).not.toContain('fetch');
  } finally {
    f.clean();
  }
}, 25000);

test('a merged holder keeps the record while a member is still in merge, then finishes it', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string; b: string } = await allocatedLeaf(f, 'holder');
    const m1: { path: string; b: string } = await allocatedLeaf(f, 'm1');
    await commitFile(f, m1.path, 'm1-file', 'm1\n');
    const m1Head: string = await head(f, 'm1');
    const m1Tab: string = z.string().parse(readState(m1.path).tab);
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    toMerge(m1.path, '2026-09-12T00:00:00.000Z', { 'blocked-by': ['zz'] });
    leaf(f, 'zz', 'merge', { hand_built: true }, 'other');
    saveDatabase(f, { ...database(f), prompts: [] });
    // A move that died before the member commits: the holder is merged, the record
    // still names m1, and m1's applied tip is not yet on the remote.
    const landed: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    saveState(holder.path, {
      ...readState(holder.path),
      phase: 'merged',
      batch: {
        attempt: 'interrupted-attempt',
        built_on: landed,
        holder: { base: landed, head: landed },
        members: [{ slug: 'm1', base: landed, head: m1Head, tip: m1Head }],
        top: landed,
        candidate: landed,
        applied: true,
      },
    });
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(m1.path).phase).toBe('merge');
    expect(readState(holder.path).batch?.attempt).toBe('interrupted-attempt');
    expect(database(f).tabs.some((tab) => tab.tab_id === m1Tab)).toBe(true);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    await command(['git', 'push', 'origin', 'refs/heads/m1:main'], f.root);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(leafState(m1.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    expect(calls(f).filter((args) => args[0] === 'tab' && args[1] === 'close' && args[2] === m1Tab)).toHaveLength(1);
    expect(database(f).tabs.some((tab) => tab.tab_id === m1Tab)).toBe(false);
  } finally {
    f.clean();
  }
}, 25000);

test('a fetch failure keeps the record, restores nothing and reports the error', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const record = readState(aa.path).batch;
    const appliedTip: string = z.string().parse(record?.members[0]?.tip);
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    saveState(aa.path, { ...readState(aa.path), phase: 'failed' });
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('git');
    expect(readState(aa.path).batch).toEqual(record);
    expect(await head(f, 'bb')).toBe(appliedTip);
    expect(readState(aa.path).phase).toBe('failed');
  } finally {
    f.clean();
  }
}, 20000);

test('a leaf entering merge after the record was written is excluded and becomes the next holder', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(aa.path).batch?.members).toEqual([]);
    // bb's stamp postdates the record: it is excluded from this batch and waits.
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(aa.path).batch?.members).toEqual([]);
    expect(mergePrompts(f)).toHaveLength(1);
    expect(mergePrompts(f)[0].text).toContain('aa');
    idleAll(f);
    const aaAttempt: string = z.string().parse(readState(aa.path).batch?.attempt);
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', aaAttempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', aaAttempt], f.root, f.env)).code).toBe(
      0,
    );
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readState(bb.path).batch?.applied).toBe(true);
    expect(mergePrompts(f).at(-1)).toEqual(expectedPrompt(bb.path, bb.b));
  } finally {
    f.clean();
  }
}, 20000);

test('a red-batch member holds its next turn solo despite an unmarked waiter', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa = await allocatedLeaf(f, 'aa');
    const bb = await allocatedLeaf(f, 'bb');
    const cc = await allocatedLeaf(f, 'cc');
    await commitFile(f, aa.path, 'aa-file', 'a');
    await commitFile(f, bb.path, 'bb-file', 'b');
    toMerge(aa.path, '2026-09-11T00:00:00Z');
    toMerge(bb.path, '2026-09-12T00:00:00Z');
    idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const attempt: string = readState(aa.path).batch!.attempt;
    expect((await cli(f, ['phase', 'aa', 'check.fix', '--slot', 'B', '--attempt', attempt], f.root, f.env)).code).toBe(
      0,
    );
    expect(readState(bb.path).solo).toBe(true);
    toMerge(cc.path, '2026-09-13T00:00:00Z');
    expect((await cli(f, ['phase', 'aa', 'failed', '--reason', 'stop'], f.root, f.env)).code).toBe(0);
    expect(readState(bb.path).batch!.members).toEqual([]);
    expect(readState(bb.path).batch!.solo).toBe(true);
  } finally {
    f.clean();
  }
});

test('cleanup retains a closed carried worktree while publication recovery is blocked', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder = await allocatedLeaf(f, 'holder');
    const member: string = leaf(f, 'member', 'plan.synthesis', {}, 'member-issue');
    expect((await next(f, ['member'])).code).toBe(0);
    await commitFile(f, holder.path, 'holder-file', 'h');
    await commitFile(f, member, 'member-file', 'm');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    toMerge(member, '2026-09-12T00:00:00Z');
    idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(holder.path);
    await command(['git', 'push', 'origin', state.batch!.top! + ':main'], f.root);
    saveState(holder.path, { ...state, batch: { ...state.batch!, candidate: state.batch!.top } });
    const memberState: State = readState(member);
    await commitMove(readRepo('repo', f.root), { path: member, state: memberState }, memberState, 'merged', null);
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(readState(holder.path).phase).toBe('merge');
    expect(existsSync(memberState.worktree!)).toBe(true);
    expect((await run(['git', 'rev-parse', '--verify', 'refs/heads/member'], f.root)).code).toBe(0);
  } finally {
    f.clean();
  }
});

test('a failed published holder receives one recovery notice across repeated passes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(holder.path);
    await command(['git', 'push', 'origin', state.batch!.top! + ':main'], f.root);
    saveState(holder.path, { ...state, phase: 'failed', batch: { ...state.batch!, candidate: state.batch!.top } });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(calls(f).filter((args) => args[0] === 'notification' && args[1] === 'show')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('a solo leaf leaving merge and returning joins the next holder batch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder = await allocatedLeaf(f, 'holder');
    const member = await allocatedLeaf(f, 'member');
    await commitFile(f, holder.path, 'holder-file', 'h');
    await commitFile(f, member.path, 'member-file', 'm');
    toMerge(member.path, '2026-09-11T00:00:00Z', { solo: true });
    expect((await cli(f, ['phase', 'member', 'failed', '--reason', 'stop'], f.root, f.env)).code).toBe(0);
    expect(readState(member.path).solo).toBeUndefined();
    toMerge(holder.path, '2026-09-12T00:00:00Z');
    idleAll(f);
    expect((await cli(f, ['phase', 'member', 'merge'], f.root, f.env)).code).toBe(0);
    expect(readState(holder.path).batch!.members.map((entry) => entry.slug)).toEqual(['member']);
  } finally {
    f.clean();
  }
});

test('a dirty member worktree is soloed out of the apply and keeps its uncommitted files', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    writeFileSync(resolve(z.string().parse(readState(bb.path).worktree), 'file'), 'uncommitted\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    const bbState: State = readState(bb.path);
    expect(bbState.solo).toBe(true);
    expect(await head(f, 'bb')).toBe(bbHead);
    const bbWorktree: string = z.string().parse(bbState.worktree);
    expect(readFileSync(resolve(bbWorktree, 'file'), 'utf8')).toBe('uncommitted\n');
    expect(await command(['git', 'status', '--porcelain'], bbWorktree)).toContain('file');
    const batch = readState(aa.path).batch;
    expect(batch?.applied).toBe(true);
    expect(batch?.members).toEqual([]);
    expect(await head(f, 'aa')).toBe(z.string().parse(batch?.top));
    expect((await run(['git', 'cat-file', '-e', z.string().parse(batch?.top) + ':bb-file'], f.root)).code).not.toBe(0);
    expect(database(f).prompts).toEqual([expectedPrompt(aa.path, aa.b)]);
  } finally {
    f.clean();
  }
}, 15000);

test('a dirty holder worktree drops the batch to solo and restores carried members', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string; b: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string; b: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const aaHead: string = await head(f, 'aa');
    const bbHead: string = await head(f, 'bb');
    const aaWorktree: string = z.string().parse(readState(aa.path).worktree);
    writeFileSync(resolve(aaWorktree, 'file'), 'holder dirty\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    saveDatabase(f, { ...database(f), prompts: [] });
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readFileSync(resolve(aaWorktree, 'file'), 'utf8')).toBe('holder dirty\n');
    expect(await head(f, 'aa')).toBe(aaHead);
    expect(await head(f, 'bb')).toBe(bbHead);
    const batch = readState(aa.path).batch;
    expect(batch?.applied).toBe(true);
    expect(batch?.solo).toBe(true);
    expect(batch?.members).toEqual([]);
    expect(readState(bb.path).solo).toBeUndefined();
    expect(mergePrompts(f).at(-1)?.text).toContain('solo');
    expect(mergePrompts(f).at(-1)?.pane).toBe(aa.b);
  } finally {
    f.clean();
  }
}, 15000);
