import { test, expect } from 'bun:test';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeSystemctl, leaf, leafTempRoot, editOnSecondStatus, verified } from './helpers';
import { adopt, hcFixture, noticeFiles, type HcFixture } from './hc-fixture';
import { readState, saveState, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { commitMove } from '../src/phase';
import { appendAttempt } from '../src/attempts';
import { readRemoved } from '../src/reconcile';
import { readRepo } from '../src/config';

type DispatchFixture = HcFixture;
// akrogon's slice stops go to the fake systemctl: a leaf slice is named by repo and slug, so a real
// stop could end another test file's seat of the same name.
async function dispatchFixture(opts: { window?: 'open' | 'closed' } = {}): Promise<DispatchFixture> {
  const f: HcFixture = await hcFixture(opts);
  return { ...f, env: { ...f.env, ...fakeSystemctl(f).env } };
}
// Every task any seat received, removed terminals included (the stand-in task logs outlive them).
function prompts(f: DispatchFixture): string[] {
  return readdirSync(f.core.standin)
    .filter((name) => name.endsWith('.tasks'))
    .flatMap((name) => readFileSync(resolve(f.core.standin, name), 'utf8').split('\n'))
    .filter((text) => text !== '');
}
// Starts a new prompt record, as clearing fake herdr's prompt list did.
function resetPrompts(f: DispatchFixture): void {
  for (const name of readdirSync(f.core.standin).filter((entry) => entry.endsWith('.tasks')))
    writeFileSync(resolve(f.core.standin, name), '');
}
// The leaf and seat of the terminal that received a task, as `<leaf>/<seat>`.
async function seatOf(f: DispatchFixture, text: string): Promise<string[]> {
  return (await f.core.terminals({ akrogon: '1' }, true))
    .filter((t) => f.core.tasks(t.address).includes(text))
    .map((t) => `${t.labels['akrogon.leaf']}/${t.labels['akrogon.seat']}`);
}
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
async function allocatedLeaf(f: DispatchFixture, slug: string, container: string = 'issue'): Promise<{ path: string }> {
  const path: string = leaf(f, slug, 'plan.synthesis', {}, container);
  expect((await next(f, [slug])).code).toBe(0);
  return { path };
}
function toMerge(path: string, mergeStamp: string, extra: object = {}): State {
  const moved: State = { ...readState(path), phase: 'merge', merge_stamp: mergeStamp, ...extra };
  saveState(path, moved);
  return moved;
}
function mergePrompts(f: DispatchFixture): string[] {
  return prompts(f).filter((prompt) => prompt.startsWith('merge-issue'));
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

async function remoteTip(f: DispatchFixture): Promise<string> {
  return command(['git', 'rev-parse', 'origin/main'], f.root);
}

function attemptLines(f: DispatchFixture): {
  outcome: string;
  holder: string;
  built_on: string;
}[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
}

// Waits until every live seat has finished its turn (or was ended), so the next pass can deliver.
async function idleAll(f: DispatchFixture): Promise<void> {
  for (const seat of await f.core.terminals({ akrogon: '1' }, false))
    await f.core.waitFor(seat.address, (t) => t.state === 'finished' || t.status?.state === 'idle');
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

test('the holder gets a batch record rebased onto the remote and nothing is prompted', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    const aaHead: string = await head(f, 'aa');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    const before: State = toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    // Remote movement between merge and the pass puts the holder on a stale base.
    await pushMain(f, 'main-advance');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    expect(prompts(f)).toEqual([]);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.attempt).toBeTruthy();
    expect(state.batch?.holder.head).toBe(aaHead);
    expect(state.batch?.top).toBeTruthy();
    expect(state.batch?.top).not.toBe(aaHead);
    expect(await head(f, 'aa')).toBe(z.string().parse(state.batch?.top));
    expect(
      (await run(['git', 'merge-base', '--is-ancestor', 'origin/main', z.string().parse(state.batch?.top)], f.root))
        .code,
    ).toBe(0);
    expect(readState(bb.path)).toEqual(before);
  } finally {
    await f.clean();
  }
});

test('an interrupted build is discarded and rebuilt under a new attempt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const aaHead: string = await head(f, 'aa');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    saveState(aa.path, {
      ...readState(aa.path),
      batch: {
        attempt: 'interrupted-attempt',
        built_on: builtOn,
        holder: { base: builtOn, head: aaHead },
        applied: false,
      },
    });
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.attempt).not.toBe('interrupted-attempt');
    expect(state.batch?.attempt).toBeTruthy();
    expect(await head(f, 'aa')).toBe(z.string().parse(state.batch?.top));
    expect(prompts(f)).toEqual([]);
    expect(await command(['git', 'status', '--porcelain'], z.string().parse(state.worktree))).toBe('');
  } finally {
    await f.clean();
  }
});

test('the pass that releases a merged holder batch cleans up the holder in the same invocation', async () => {
  const f: DispatchFixture = await dispatchFixture({ window: 'open' });
  const adopting: () => void = adopt(f.core);
  try {
    const holder = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const applied: State = readState(holder.path);
    const top: string = z.string().parse(applied.batch?.top);
    const worktree: string = z.string().parse(applied.worktree);
    const tab: string = z.string().parse(applied.tab);
    await command(['git', 'push', 'origin', `refs/heads/holder:main`], f.root);
    appendAttempt(readRepo(f.repo, f.root), 'holder', applied.batch!, 'merged');
    const landed: State = {
      ...applied,
      batch: { ...applied.batch!, candidate: top, recorded: true },
    };
    saveState(holder.path, landed);
    await commitMove(readRepo(f.repo, f.root), { path: holder.path, state: landed }, landed, 'merged', null);
    expect((await next(f, ['--all'])).code).toBe(0);
    const closed: State = leafState(holder.path);
    expect(closed.batch).toBeUndefined();
    expect(closed.worktree).toBeUndefined();
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'rev-parse', '--verify', 'refs/heads/holder'], f.root)).code).not.toBe(0);
    expect((await command(['git', 'worktree', 'list', '--porcelain'], f.root)).split('\n')).not.toContain(
      `worktree ${worktree}`,
    );
    expect(f.core.appCalls().map((call) => call.argv)).toContainEqual(['do', 'tab.close', '--id', tab]);
    expect(await f.core.terminals({ 'akrogon.leaf': 'holder' }, true)).toEqual([]);
  } finally {
    adopting();
    await f.clean();
  }
});

test('the releasing pass leaves a merged holder fully cleaned for the next pass', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'waiting', 'failed', { tab: 'akwaitingtab' });
    const holder = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const applied: State = readState(holder.path);
    const top: string = z.string().parse(applied.batch?.top);
    const worktree: string = z.string().parse(applied.worktree);
    await command(['git', 'push', 'origin', `refs/heads/holder:main`], f.root);
    saveState(holder.path, {
      ...applied,
      batch: { ...applied.batch!, candidate: top },
    });
    // The land unit is gone and no live tab holds the leaf: every seat terminal is removed.
    for (const seat of await f.core.terminals({ 'akrogon.leaf': 'holder' }, true)) {
      await f.core.hc(['kill', seat.address]);
      expect((await f.core.hc(['rm', seat.address])).code).toBe(0);
    }
    const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
    const temp: string = resolve(leafTempRoot(f), hex(f.root).slice(0, 4), hex(`${f.root}\nholder`).slice(0, 8));
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(holder.path);
    expect(state.phase).toBe('merged');
    expect(state.batch).toBeUndefined();
    expect(state.worktree).toBeUndefined();
    expect(state.broadcast).toBeUndefined();
    expect(existsSync(worktree)).toBe(false);
    expect((await run(['git', 'rev-parse', '--verify', 'refs/heads/holder'], f.root)).code).not.toBe(0);
    expect(existsSync(temp)).toBe(false);
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged']);
    // A second pass over the same state removes nothing more.
    writeFileSync(f.core.shimLog, '');
    const before: State = readState(holder.path);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readRemoved(readRepo(f.repo, f.root))).toEqual([]);
    expect(readState(holder.path)).toEqual(before);
    expect(
      readFileSync(f.core.shimLog, 'utf8')
        .split('\n')
        .filter((line) => ['run', 'send', 'keys', 'kill', 'rm', 'label'].includes(line.split('\t')[0])),
    ).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a failed holder with a landed candidate is told to move back, then reconciles without run or push', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const applied: State = readState(aa.path);
    const top: string = z.string().parse(applied.batch?.top);
    await command(['git', 'push', 'origin', 'refs/heads/aa:main'], f.root);
    saveState(aa.path, { ...applied, phase: 'failed', batch: { ...applied.batch!, candidate: top } });
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(noticeFiles(f.core).map(({ title, body, attention }) => ({ title, body, attention }))).toEqual([
      { title: `${f.repo}/aa merged, move it back`, body: 'next: akrogon phase aa merge', attention: true },
    ]);
    expect(readState(aa.path).phase).toBe('failed');
    expect(readState(aa.path).batch?.candidate).toBe(top);
    expect(readState(aa.path).batch?.notified).toBe('pending');
    await idleAll(f);
    const promptsBefore: number = mergePrompts(f).length;
    expect((await cli(f, ['phase', 'aa', 'merge'], f.root, f.env)).code).toBe(0);
    // Leaving failed clears the move-back notice that was still waiting for the window.
    expect(noticeFiles(f.core)).toEqual([]);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(mergePrompts(f)).toHaveLength(promptsBefore);
    expect(prompts(f).filter((prompt) => prompt.startsWith('broadcast-issue aa'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
});

test('a failed holder with no candidate is rebuilt on the new base, never rerun on its stale attempt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    expect((await next(f, ['--all'])).code).toBe(0);
    const staleAttempt: string = z.string().parse(readState(aa.path).batch?.attempt);
    const staleTop: string = z.string().parse(readState(aa.path).batch?.top);
    // The leaf fails in merge before any push: the applied batch holds no candidate.
    saveState(aa.path, {
      ...readState(aa.path),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'merge', reason: 'merge blocked' },
    });
    await pushMain(f, 'main-advance');
    const newTip: string = await remoteTip(f);
    resetPrompts(f);
    // The consultant's base fix landed; the watch resumes the leaf as the criterion states.
    expect((await cli(f, ['phase', 'aa', 'merge'], f.root, f.env)).code).toBe(0);
    expect((await next(f, ['aa'])).code).toBe(0);
    const state: State = readState(aa.path);
    expect(state.phase).toBe('merge');
    expect(state.batch?.attempt).not.toBe(staleAttempt);
    expect(state.batch?.built_on).toBe(newTip);
    expect(await head(f, 'aa')).toBe(z.string().parse(state.batch?.top));
    expect(
      (await run(['git', 'merge-base', '--is-ancestor', newTip, z.string().parse(state.batch?.top)], f.root)).code,
    ).toBe(0);
    expect(prompts(f).filter((prompt) => prompt.includes(staleAttempt) || prompt.includes(staleTop))).toEqual([]);
    const ledgerPath: string = resolve(f.root, 'issues/merge-attempts.jsonl');
    const ledger: string = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
    expect(ledger).not.toContain(staleAttempt);
    expect(ledger).not.toContain(staleTop);
    expect(prompts(f)).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a fetch failure keeps the record, moves nothing and reports the error', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const record = readState(aa.path).batch;
    const top: string = z.string().parse(record?.top);
    const published = { ...record!, candidate: top };
    saveState(aa.path, { ...readState(aa.path), batch: published });
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('fetch');
    expect(result.stderr).toContain("'origin' does not appear to be a git repository");
    expect(readState(aa.path).batch).toEqual(published);
    expect(await head(f, 'aa')).toBe(top);
    expect(readState(aa.path).phase).toBe('merge');
  } finally {
    await f.clean();
  }
});

test('cleanup retains a merged holder worktree while publication recovery is blocked', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(holder.path);
    await command(['git', 'push', 'origin', state.batch!.top! + ':main'], f.root);
    const published: State = { ...state, batch: { ...state.batch!, candidate: state.batch!.top } };
    saveState(holder.path, published);
    await commitMove(readRepo(f.repo, f.root), { path: holder.path, state: published }, published, 'merged', null);
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(leafState(holder.path).batch?.attempt).toBe(state.batch!.attempt);
    expect(existsSync(state.worktree!)).toBe(true);
    expect((await run(['git', 'rev-parse', '--verify', 'refs/heads/holder'], f.root)).code).toBe(0);
  } finally {
    await f.clean();
  }
});

test('a failed published holder receives one recovery notice across repeated passes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(holder.path);
    await command(['git', 'push', 'origin', state.batch!.top! + ':main'], f.root);
    saveState(holder.path, { ...state, phase: 'failed', batch: { ...state.batch!, candidate: state.batch!.top } });
    expect((await next(f, ['--all'])).code).toBe(1);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(noticeFiles(f.core)).toHaveLength(1);
    expect(readState(holder.path).batch?.notified).toBe('pending');
    // The handler shows it: the next pass records shown and writes no other.
    rmSync(noticeFiles(f.core)[0].path);
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(readState(holder.path).batch?.notified).toBe('shown');
    expect((await next(f, ['--all'])).code).toBe(1);
    expect(noticeFiles(f.core)).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a dirty holder worktree exits to check.repair and keeps its branch and edit', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    const aaHead: string = await head(f, 'aa');
    const aaWorktree: string = z.string().parse(readState(aa.path).worktree);
    writeFileSync(resolve(aaWorktree, 'file'), 'holder dirty\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    await pushMain(f, 'main-advance');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readFileSync(resolve(aaWorktree, 'file'), 'utf8')).toBe('holder dirty\n');
    expect(await head(f, 'aa')).toBe(aaHead);
    const state: State = readState(aa.path);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit?.reason).toBe('dirty');
  } finally {
    await f.clean();
  }
});

test('a refused check.fix keeps the holder-seat commit on the branch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'original', 'original');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    await commitFile(f, holder.path, 'seat-fix', 'committed holder repair');
    const repaired: string = await head(f, 'holder');
    const args: string[] = ['phase', 'holder', 'check.fix'];
    expect((await cli(f, args, f.root, f.env)).code).not.toBe(0);
    expect(readState(holder.path).phase).toBe('merge');
    expect(await head(f, 'holder')).toBe(repaired);
    expect(readFileSync(resolve(readState(holder.path).worktree!, 'seat-fix'), 'utf8')).toBe('committed holder repair');
  } finally {
    await f.clean();
  }
});

test('a failed move keeps the holder-seat commit on the branch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'original', 'original');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    await commitFile(f, holder.path, 'seat-fix', 'committed holder repair');
    const repaired: string = await head(f, 'holder');
    const args: string[] = ['phase', 'holder', 'failed', '--reason', 'stop'];
    expect((await cli(f, args, f.root, f.env)).code).toBe(0);
    expect(readState(holder.path).phase).toBe('failed');
    expect(await head(f, 'holder')).toBe(repaired);
    expect(readFileSync(resolve(readState(holder.path).worktree!, 'seat-fix'), 'utf8')).toBe('committed holder repair');
  } finally {
    await f.clean();
  }
});

test('late holder dirt during initial apply is isolated and survives cleanup', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    const worktree: string = readState(holder.path).worktree!;
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    const created: string = await editOnSecondStatus(f, worktree);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(created)).toBe(true);
    const exited: State = readState(holder.path);
    expect(exited.phase).toBe('check.repair');
    expect(exited.batch).toBeUndefined();
    expect(exited.merge_exit?.reason).toBe('dirty');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readFileSync(resolve(worktree, 'uncommitted'), 'utf8')).toBe('operator edit\n');
  } finally {
    await f.clean();
  }
});

test('an edit arriving after the move status read survives the Git reset', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    const worktree: string = readState(holder.path).worktree!;
    const git: string = await command(['sh', '-c', 'command -v git']);
    const created: string = resolve(f.home, 'edit-before-reset');
    const wrapper: string = resolve(f.home, 'bin/git');
    writeFileSync(
      wrapper,
      `#!/bin/sh
if [ "$1" = -C ] && [ "$2" = '${worktree}' ] && [ "$3" = reset ] && [ ! -e '${created}' ]; then
  printf 'operator tracked edit\n' > '${worktree}/file'
  touch '${created}'
fi
exec '${git}' "$@"
`,
    );
    chmodSync(wrapper, 0o755);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(created)).toBe(true);
    expect(readFileSync(resolve(worktree, 'file'), 'utf8')).toBe('operator tracked edit\n');
    expect(readState(holder.path).phase).toBe('check.repair');
  } finally {
    await f.clean();
  }
});

test('an applied holder retains its integration head when a check.fix is refused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    await pushMain(f, 'advance');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const checked: string = await head(f, 'holder');
    expect(checked).not.toBe(readState(holder.path).batch!.holder.head);
    expect((await cli(f, ['phase', 'holder', 'check.fix'], f.root, f.env)).code).not.toBe(0);
    expect(await head(f, 'holder')).toBe(checked);
    expect(readState(holder.path).phase).toBe('merge');
  } finally {
    await f.clean();
  }
});

test('a waiting leaf stays out of the holder turn and lands in its own turn', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    // The land verify runs the repo's test check against the candidate tree.
    await commitFile(f, aa.path, 'aa.test.ts', "import { test } from 'bun:test';\ntest('x', () => {});\n");
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    const bbWorktree: string = z.string().parse(readState(bb.path).worktree);
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    expect(record).not.toHaveProperty('members');
    expect(prompts(f)).toEqual([]);
    expect(await command(['git', 'ls-tree', '--name-only', record.top!], f.root)).not.toContain('bb-file');
    expect(await head(f, 'bb')).toBe(bbHead);
    expect(await command(['git', 'rev-parse', 'HEAD'], bbWorktree)).toBe(bbHead);
    expect(readState(bb.path).phase).toBe('merge');
    expect(readState(bb.path).batch).toBeUndefined();
    const landed: Result = await cli(f, ['land', 'aa', '--attempt', record.attempt], f.root, f.env);
    expect(landed.code).toBe(0);
    expect(await remoteTip(f)).toBe(record.top!);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(leafState(bb.path).phase).toBe('merge');
    const attempts = attemptLines(f);
    expect(attempts.map((line) => line.outcome)).toEqual(['merged']);
    expect(attempts[0]).not.toHaveProperty('members');
    // The land run's wake claimed bb's turn on the base aa landed.
    await idleAll(f);
    expect((await next(f, [])).code).toBe(0);
    const own = readState(bb.path).batch!;
    expect(own.attempt).not.toBe(record.attempt);
    expect(own.built_on).toBe(record.top!);
    expect((await cli(f, ['land', 'bb', '--attempt', own.attempt], f.root, f.env)).code).toBe(0);
    expect(leafState(bb.path).phase).toBe('merged');
    expect(await command(['git', 'ls-tree', '--name-only', await remoteTip(f)], f.root)).toContain('bb-file');
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged', 'merged']);
  } finally {
    await f.clean();
  }
});

test('a red verify with another leaf waiting exits the holder to check.repair', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    // A failing test on the holder's branch turns its land run red.
    writeFileSync(
      resolve(z.string().parse(readState(aa.path).worktree), 'fail.test.ts'),
      "import { test, expect } from 'bun:test';\ntest('red', () => expect(false).toBe(true));\n",
    );
    await command(['git', 'add', 'fail.test.ts'], z.string().parse(readState(aa.path).worktree));
    await command(['git', 'commit', '-m', 'failing test'], z.string().parse(readState(aa.path).worktree));
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    expect((await cli(f, ['land', 'aa', '--attempt', record.attempt], f.root, f.env)).code).toBe(0);
    const exited: State = readState(aa.path);
    expect(exited.phase).toBe('check.repair');
    expect(exited.merge_exit?.reason).toBe('red');
    expect(exited.merge_exit?.run).toBeTruthy();
    const attempts = attemptLines(f);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].outcome).toBe('red');
    expect(attempts[0].holder).toBe('aa');
    expect(attempts[0].built_on).toBe(record.built_on);
    expect(attempts[0]).not.toHaveProperty('members');
    // The wake claimed bb's turn in the same pass.
    expect(readState(bb.path).batch?.attempt).toBeTruthy();
    expect(readState(bb.path).batch!.attempt).not.toBe(record.attempt);
    expect(prompts(f).filter((prompt) => prompt.startsWith('merge-issue'))).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('a refused push restacks only the holder while another leaf waits', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    // The land verify runs the repo's test check against the candidate tree.
    await commitFile(f, aa.path, 'aa.test.ts', "import { test } from 'bun:test';\ntest('x', () => {});\n");
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    await idleAll(f);
    await verified(f, 'aa', 'merge');
    await pushMain(f, 'adv-file');
    const advanced: string = await remoteTip(f);
    const refused: Result = await cli(f, ['phase', 'aa', 'merged'], f.root, f.env);
    expect(refused.code).toBe(0);
    expect(refused.stdout).toMatch(/^rerun tested=none pushed=[0-9a-f]{40}$/);
    expect(await remoteTip(f)).toBe(advanced);
    const restacked = readState(aa.path).batch!;
    expect(restacked).not.toHaveProperty('members');
    expect(restacked.built_on).toBe(advanced);
    expect(restacked.top).toBe(refused.stdout.split('pushed=')[1]);
    expect(await command(['git', 'ls-tree', '--name-only', restacked.top!], f.root)).not.toContain('bb-file');
    expect(await head(f, 'bb')).toBe(bbHead);
    expect(readState(bb.path).phase).toBe('merge');
    expect(readState(bb.path).batch).toBeUndefined();
    await verified(f, 'aa', 'merge');
    const landed: Result = await cli(f, ['phase', 'aa', 'merged'], f.root, f.env);
    expect(landed.code).toBe(0);
    expect(landed.stdout).not.toContain('issue complete issue-bb');
    expect(await remoteTip(f)).toBe(restacked.top!);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(leafState(bb.path).phase).toBe('merge');
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged']);
  } finally {
    await f.clean();
  }
});

test('a push reported lost but landed moves only the holder to merged once', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    // The land verify runs the repo's test check against the candidate tree.
    await commitFile(f, aa.path, 'aa.test.ts', "import { test } from 'bun:test';\ntest('x', () => {});\n");
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    await idleAll(f);
    await verified(f, 'aa', 'merge');
    // The push lands but its reply is lost: the real git ran, the CLI saw exit 1.
    const git: string = await command(['sh', '-c', 'command -v git']);
    writeFileSync(
      resolve(f.home, 'bin/git'),
      `#!/bin/sh
if [ "$1" = push ]; then
  "${git}" "$@"
  exit 1
fi
exec "${git}" "$@"
`,
    );
    chmodSync(resolve(f.home, 'bin/git'), 0o755);
    const merged: Result = await cli(f, ['phase', 'aa', 'merged'], f.root, f.env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).not.toContain('issue complete issue-bb');
    expect(leafState(aa.path).phase).toBe('merged');
    expect(leafState(bb.path).phase).toBe('merge');
    expect(await command(['git', 'ls-tree', '--name-only', await remoteTip(f)], f.root)).not.toContain('bb-file');
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged']);
    expect(attemptLines(f)[0]).not.toHaveProperty('members');
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(
      attemptLines(f)
        .filter((line) => line.holder === 'aa')
        .map((line) => line.outcome),
    ).toEqual(['merged']);
  } finally {
    await f.clean();
  }
});
