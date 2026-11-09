import { test, expect } from 'bun:test';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeSystemctl, leaf, editOnSecondStatus, verified, seatOwned } from './helpers';
import { adopt, hcFixture, noticeFiles, type HcFixture } from './hc-fixture';
import { readState, saveState, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { z } from 'zod';
import { commitMove } from '../src/phase';
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
function expectedPrompt(path: string): string {
  const state: State = readState(path);
  const batch = state.batch;
  expect(batch).toBeDefined();
  const context: string =
    batch!.top === undefined ? `attempt=${batch!.attempt} solo` : `attempt=${batch!.attempt} top=${batch!.top}`;
  return `merge-issue ${state.slug} slot=B phase=merge leaf=${path} ${context}`;
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

test('the holder gets a batch record rebased onto the remote and only the holder is prompted', async () => {
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
    seatOwned(aa.path);
    expect((await next(f, [])).code).toBe(0);
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
    expect(prompts(f)).toEqual([expectedPrompt(aa.path)]);
    expect(await seatOf(f, expectedPrompt(aa.path))).toEqual(['aa/b']);
    expect(readState(bb.path)).toEqual(before);
  } finally {
    await f.clean();
  }
}, 15000);

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
    seatOwned(aa.path);
    expect((await next(f, ['--all'])).code).toBe(0);
    const state: State = readState(aa.path);
    expect(state.batch?.applied).toBe(true);
    expect(state.batch?.attempt).not.toBe('interrupted-attempt');
    expect(state.batch?.attempt).toBeTruthy();
    expect(await head(f, 'aa')).toBe(z.string().parse(state.batch?.top));
    expect(prompts(f)).toEqual([expectedPrompt(aa.path)]);
    expect(await seatOf(f, expectedPrompt(aa.path))).toEqual(['aa/b']);
    expect(await command(['git', 'status', '--porcelain'], z.string().parse(state.worktree))).toBe('');
  } finally {
    await f.clean();
  }
}, 15000);

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
}, 20000);

test('a landed candidate moves the holder once, clears the record, and the next pass wakes dependents', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'h-file', 'h\n');
    const dependent: string = leaf(f, 'dep', 'plan.synthesis', { 'blocked-by': ['holder'] }, 'dep-issue');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const record = readState(holder.path).batch;
    const top: string = z.string().parse(record?.top);
    await command(['git', 'push', 'origin', 'refs/heads/holder:main'], f.root);
    saveState(holder.path, { ...readState(holder.path), batch: { ...record!, candidate: top } });
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(leafState(holder.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    expect(prompts(f).map((prompt) => prompt.split(' ')[0])).toEqual(['broadcast-issue']);
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(prompts(f)).toEqual([`plan-issue dep slot=A phase=plan.synthesis leaf=${dependent}`]);
    expect(await seatOf(f, `plan-issue dep slot=A phase=plan.synthesis leaf=${dependent}`)).toEqual(['dep/a']);
    expect((await run(['git', 'merge-base', '--is-ancestor', top, 'origin/main'], f.root)).code).toBe(0);
  } finally {
    await f.clean();
  }
}, 25000);

test('a green merge clears the record once the holder lands', async () => {
  const f: DispatchFixture = await dispatchFixture({ window: 'open' });
  // An open window adopts each seat into its tab, which the start waits for.
  const adopting: () => void = adopt(f.core);
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'h-file', 'h\n');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const attempt: string = z.string().parse(readState(holder.path).batch?.attempt);
    await idleAll(f);
    await verified(f, 'holder', 'merge');
    expect(
      (await cli(f, ['phase', 'holder', 'merged', '--slot', 'B', '--check', '--attempt', attempt], f.root, f.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'holder', 'merged', '--slot', 'B', '--attempt', attempt], f.root, f.env)).code).toBe(
      0,
    );
    expect(leafState(holder.path).phase).toBe('merged');
    expect(leafState(holder.path).batch).toBeUndefined();
    // The holder's own tab belongs to the pane-idle sweep path: the move requests no close.
    expect(f.core.appCalls().filter((call) => call.argv[1] === 'tab.close')).toEqual([]);
    // With the record gone no pass fetches for it again: rename the remote and the
    // next pass stays clean.
    await command(['git', 'remote', 'rename', 'origin', 'elsewhere'], f.root);
    const after: Result = await next(f, ['--all']);
    expect(after.code).toBe(0);
    expect(after.stderr).not.toContain('fetch');
  } finally {
    adopting();
    await f.clean();
  }
}, 25000);

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
}, 20000);

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

test('a dirty holder worktree drops the batch to solo and keeps its branch', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    const aaHead: string = await head(f, 'aa');
    const aaWorktree: string = z.string().parse(readState(aa.path).worktree);
    writeFileSync(resolve(aaWorktree, 'file'), 'holder dirty\n');
    mkdirSync(resolve(aaWorktree, 'empty-dirty'));
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    await pushMain(f, 'main-advance');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(readFileSync(resolve(aaWorktree, 'file'), 'utf8')).toBe('holder dirty\n');
    expect(existsSync(resolve(aaWorktree, 'empty-dirty'))).toBe(false);
    expect(await head(f, 'aa')).toBe(aaHead);
    const batch = readState(aa.path).batch;
    expect(batch?.applied).toBe(true);
    expect(batch?.top).toBeUndefined();
    expect(mergePrompts(f).at(-1)).toContain('solo');
    expect(await seatOf(f, z.string().parse(mergePrompts(f).at(-1)))).toEqual(['aa/b']);
  } finally {
    await f.clean();
  }
}, 15000);

for (const ending of ['check.fix', 'failed'] as const) {
  test(`holder-seat commits survive the ${ending} handoff`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const holder: { path: string } = await allocatedLeaf(f, 'holder');
      await commitFile(f, holder.path, 'original', 'original');
      toMerge(holder.path, '2026-09-11T00:00:00Z');
      await idleAll(f);
      expect((await next(f, ['--all'])).code).toBe(0);
      const attempt: string = readState(holder.path).batch!.attempt;
      await commitFile(f, holder.path, 'seat-fix', 'committed holder repair');
      const repaired: string = await head(f, 'holder');
      const args: string[] =
        ending === 'check.fix'
          ? ['phase', 'holder', ending, '--slot', 'B', '--attempt', attempt]
          : ['phase', 'holder', ending, '--slot', 'B', '--reason', 'stop'];
      expect((await cli(f, args, f.root, f.env)).code).toBe(0);
      expect(readState(holder.path).phase).toBe(ending);
      expect(await head(f, 'holder')).toBe(repaired);
      expect(readFileSync(resolve(readState(holder.path).worktree!, 'seat-fix'), 'utf8')).toBe(
        'committed holder repair',
      );
    } finally {
      await f.clean();
    }
  });
}

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
    expect(readState(holder.path).batch!.top).toBeUndefined();
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
    expect(readState(holder.path).batch!.top).toBeUndefined();
  } finally {
    await f.clean();
  }
});

test('an applied holder retains its checked integration head on red', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    await commitFile(f, holder.path, 'holder-file', 'h');
    await pushMain(f, 'advance');
    toMerge(holder.path, '2026-09-11T00:00:00Z');
    await idleAll(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    const batch = readState(holder.path).batch!;
    const checked: string = await head(f, 'holder');
    expect(checked).not.toBe(batch.holder.head);
    expect(
      (await cli(f, ['phase', 'holder', 'check.fix', '--slot', 'B', '--attempt', batch.attempt], f.root, f.env)).code,
    ).toBe(0);
    expect(await head(f, 'holder')).toBe(checked);
  } finally {
    await f.clean();
  }
});

test('empty untracked folders are removed before an applied merge prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    writeFileSync(resolve(f.root, '.env'), 'secret\n');
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    const worktree: string = z.string().parse(readState(holder.path).worktree);
    mkdirSync(resolve(worktree, 'td'));
    await commitFile(f, holder.path, 'td/keep', 'keep\n');
    await commitFile(f, holder.path, '.gitignore', '.env\n.temp/\nnode_modules/\nign.txt\ntd/ige/\n');
    // Only ignored or empty entries may be planted: any untracked file would dirty
    // the holder and turn the prompt solo before the prompt is sent.
    mkdirSync(resolve(worktree, 'e1'));
    mkdirSync(resolve(worktree, 'td/e2'));
    mkdirSync(resolve(worktree, 'td/ige'));
    mkdirSync(resolve(worktree, 'up/empty-child'), { recursive: true });
    writeFileSync(resolve(worktree, 'up/ign.txt'), 'ignored\n');
    mkdirSync(resolve(worktree, '.temp'));
    writeFileSync(resolve(worktree, '.temp/out'), 'temp out\n');
    mkdirSync(resolve(worktree, 'node_modules'));
    writeFileSync(resolve(worktree, 'node_modules/pkg.js'), 'module\n');
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    seatOwned(holder.path);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(prompts(f)).toEqual([expectedPrompt(holder.path)]);
    expect(await seatOf(f, expectedPrompt(holder.path))).toEqual(['holder/b']);
    expect(existsSync(resolve(worktree, 'e1'))).toBe(false);
    expect(existsSync(resolve(worktree, 'td/e2'))).toBe(false);
    expect(existsSync(resolve(worktree, 'up/empty-child'))).toBe(false);
    expect(readFileSync(resolve(worktree, 'up/ign.txt'), 'utf8')).toBe('ignored\n');
    expect(readFileSync(resolve(worktree, '.temp/out'), 'utf8')).toBe('temp out\n');
    expect(readFileSync(resolve(worktree, 'node_modules/pkg.js'), 'utf8')).toBe('module\n');
    expect(existsSync(resolve(worktree, 'td/ige'))).toBe(true);
    expect(readFileSync(resolve(worktree, 'td/keep'), 'utf8')).toBe('keep\n');
    const envFile: string = resolve(worktree, '.env');
    expect(lstatSync(envFile).isFile()).toBe(true);
    expect(readFileSync(envFile, 'utf8')).toBe('');
  } finally {
    await f.clean();
  }
}, 15000);

test('empty untracked folders are removed before a solo merge prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    const worktree: string = z.string().parse(readState(holder.path).worktree);
    await commitFile(f, holder.path, '.gitignore', '.env\n.temp/\n');
    mkdirSync(resolve(worktree, 'solempty'));
    mkdirSync(resolve(worktree, 'up/empty-child'), { recursive: true });
    writeFileSync(resolve(worktree, 'up/keep.txt'), 'keep\n');
    mkdirSync(resolve(worktree, '.temp'));
    writeFileSync(resolve(worktree, '.temp/x'), 'temp\n');
    // up/keep.txt makes the holder dirty, so the prompt takes the solo form.
    toMerge(holder.path, '2026-09-11T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, ['--all'])).code).toBe(0);
    expect(existsSync(resolve(worktree, 'solempty'))).toBe(false);
    expect(existsSync(resolve(worktree, 'up/empty-child'))).toBe(false);
    expect(readFileSync(resolve(worktree, 'up/keep.txt'), 'utf8')).toBe('keep\n');
    expect(readFileSync(resolve(worktree, '.temp/x'), 'utf8')).toBe('temp\n');
    expect(mergePrompts(f)).toHaveLength(1);
    expect(await seatOf(f, mergePrompts(f)[0])).toEqual(['holder/b']);
    expect(mergePrompts(f)[0]).toContain('solo');
  } finally {
    await f.clean();
  }
}, 15000);

test('unreadable ignored folders do not stop empty-folder cleanup before merge', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    const worktree: string = z.string().parse(readState(holder.path).worktree);
    await commitFile(f, holder.path, '.gitignore', '.env\n.cache/\nnode_modules/\n');
    const ignored: string[] = [resolve(worktree, '.cache'), resolve(worktree, 'up/node_modules')];
    for (const path of ignored) {
      mkdirSync(path, { recursive: true });
      writeFileSync(resolve(path, 'keep'), 'ignored content\n');
    }
    mkdirSync(resolve(worktree, 'empty'));
    mkdirSync(resolve(worktree, 'up/empty-child'));
    for (const path of ignored) chmodSync(path, 0);
    try {
      toMerge(holder.path, '2026-09-11T00:00:00.000Z');
      resetPrompts(f);
      expect((await command(['git', 'status', '--porcelain'], worktree)).trim()).toBe('');
      expect((await next(f, ['--all'])).code).toBe(0);
      seatOwned(holder.path);
      expect((await next(f, ['--all'])).code).toBe(0);
      expect(mergePrompts(f)).toEqual([expectedPrompt(holder.path)]);
      expect(await seatOf(f, expectedPrompt(holder.path))).toEqual(['holder/b']);
      expect(existsSync(resolve(worktree, 'empty'))).toBe(false);
      expect(existsSync(resolve(worktree, 'up/empty-child'))).toBe(false);
      expect(existsSync(resolve(worktree, 'up'))).toBe(true);
    } finally {
      for (const path of ignored) chmodSync(path, 0o755);
    }
    for (const path of ignored) expect(readFileSync(resolve(path, 'keep'), 'utf8')).toBe('ignored content\n');
  } finally {
    await f.clean();
  }
}, 15000);

test('a failed removal stops the merge prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const holder: { path: string } = await allocatedLeaf(f, 'holder');
    const worktree: string = z.string().parse(readState(holder.path).worktree);
    const locked: string = resolve(worktree, 'lp');
    mkdirSync(resolve(locked, 'child'), { recursive: true });
    // lp is still listable so git status reads clean, but rmSync(lp/child) fails EACCES.
    chmodSync(locked, 0o555);
    try {
      toMerge(holder.path, '2026-09-11T00:00:00.000Z');
      expect((await next(f, ['--all'])).code).toBe(0);
      seatOwned(holder.path);
      const result: Result = await next(f, ['--all']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(resolve(locked, 'child'));
      expect(mergePrompts(f)).toEqual([]);
      expect(existsSync(resolve(locked, 'child'))).toBe(true);
    } finally {
      chmodSync(locked, 0o755);
    }
  } finally {
    await f.clean();
  }
}, 15000);

test('a waiting leaf stays out of the holder turn and lands in its own turn', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    const bbWorktree: string = z.string().parse(readState(bb.path).worktree);
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    seatOwned(aa.path);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    expect(record).not.toHaveProperty('members');
    expect(mergePrompts(f)).toEqual([expectedPrompt(aa.path)]);
    expect(await seatOf(f, expectedPrompt(aa.path))).toEqual(['aa/b']);
    expect(mergePrompts(f)[0]).not.toContain('members=');
    expect(await command(['git', 'ls-tree', '--name-only', record.top!], f.root)).not.toContain('bb-file');
    expect(await head(f, 'bb')).toBe(bbHead);
    expect(await command(['git', 'rev-parse', 'HEAD'], bbWorktree)).toBe(bbHead);
    expect(readState(bb.path).phase).toBe('merge');
    expect(readState(bb.path).batch).toBeUndefined();
    await idleAll(f);
    await verified(f, 'aa', 'merge');
    const attempt: string = record.attempt;
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', attempt], f.root, f.env)).code,
    ).toBe(0);
    expect(await head(f, 'bb')).toBe(bbHead);
    const merged: Result = await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', attempt], f.root, f.env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).toContain('issue complete issue-aa');
    expect(merged.stdout).not.toContain('issue complete issue-bb');
    expect(await remoteTip(f)).toBe(record.top!);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(leafState(bb.path).phase).toBe('merge');
    const attempts = attemptLines(f);
    expect(attempts.map((line) => line.outcome)).toEqual(['merged']);
    expect(attempts[0]).not.toHaveProperty('members');
    // bb takes its own turn on the base aa landed.
    await idleAll(f);
    expect((await next(f, [])).code).toBe(0);
    seatOwned(bb.path);
    expect((await next(f, [])).code).toBe(0);
    const own = readState(bb.path).batch!;
    expect(own.attempt).not.toBe(attempt);
    expect(own.built_on).toBe(record.top!);
    expect(mergePrompts(f)).toContainEqual(expectedPrompt(bb.path));
    expect(await seatOf(f, expectedPrompt(bb.path))).toEqual(['bb/b']);
    await verified(f, 'bb', 'merge');
    expect(
      (await cli(f, ['phase', 'bb', 'merged', '--slot', 'B', '--check', '--attempt', own.attempt], f.root, f.env)).code,
    ).toBe(0);
    const landed: Result = await cli(
      f,
      ['phase', 'bb', 'merged', '--slot', 'B', '--attempt', own.attempt],
      f.root,
      f.env,
    );
    expect(landed.code).toBe(0);
    expect(landed.stdout).toContain('issue complete issue-bb');
    expect(leafState(bb.path).phase).toBe('merged');
    expect(await command(['git', 'ls-tree', '--name-only', await remoteTip(f)], f.root)).toContain('bb-file');
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged', 'merged']);
  } finally {
    await f.clean();
  }
}, 30000);

test('a holder that cannot be rebased takes a solo turn with nothing stacked', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    writeFileSync(resolve(f.root, 'file'), 'main version\n');
    await command(['git', 'add', 'file'], f.root);
    await command(['git', 'commit', '-m', 'main file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const aaWorktree: string = z.string().parse(readState(aa.path).worktree);
    writeFileSync(resolve(aaWorktree, 'file'), 'holder version\n');
    await command(['git', 'add', 'file'], aaWorktree);
    await command(['git', 'commit', '-m', 'holder file'], aaWorktree);
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    expect(readState(aa.path).batch?.top).toBeUndefined();
    expect(mergePrompts(f)).toEqual([expectedPrompt(aa.path)]);
    expect(await seatOf(f, expectedPrompt(aa.path))).toEqual(['aa/b']);
    expect(mergePrompts(f)[0]).toContain('solo');
    expect(readState(bb.path).phase).toBe('merge');
    expect(mergePrompts(f).some((prompt) => prompt.startsWith('merge-issue bb '))).toBe(false);
  } finally {
    await f.clean();
  }
}, 20000);

test('a red verify with another leaf waiting moves the holder to check.fix', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    await idleAll(f);
    const red: Result = await cli(
      f,
      ['phase', 'aa', 'check.fix', '--slot', 'B', '--attempt', record.attempt],
      f.root,
      f.env,
    );
    expect(red.code).toBe(0);
    expect(red.stdout).not.toContain('stack red');
    expect(leafState(aa.path).phase).toBe('check.fix');
    const attempts = attemptLines(f);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].outcome).toBe('red');
    expect(attempts[0].holder).toBe('aa');
    expect(attempts[0].built_on).toBe(record.built_on);
    expect(attempts[0]).not.toHaveProperty('members');
    expect(readState(bb.path).phase).toBe('merge');
    await idleAll(f);
    expect((await next(f, [])).code).toBe(0);
    seatOwned(bb.path);
    expect((await next(f, [])).code).toBe(0);
    expect(readState(bb.path).batch!.attempt).not.toBe(record.attempt);
    expect(mergePrompts(f)).toContainEqual(expectedPrompt(bb.path));
    expect(await seatOf(f, expectedPrompt(bb.path))).toEqual(['bb/b']);
  } finally {
    await f.clean();
  }
}, 30000);

test('a refused push restacks only the holder while another leaf waits', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    const args: string[] = ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', record.attempt];
    await idleAll(f);
    await verified(f, 'aa', 'merge');
    expect((await cli(f, [...args, '--check'], f.root, f.env)).code).toBe(0);
    await pushMain(f, 'adv-file');
    const advanced: string = await remoteTip(f);
    const refused: Result = await cli(f, args, f.root, f.env);
    expect(refused.code).toBe(0);
    expect(refused.stdout).toMatch(/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
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
    expect((await cli(f, [...args, '--check'], f.root, f.env)).code).toBe(0);
    const landed: Result = await cli(f, args, f.root, f.env);
    expect(landed.code).toBe(0);
    expect(landed.stdout).not.toContain('issue complete issue-bb');
    expect(await remoteTip(f)).toBe(restacked.top!);
    expect(leafState(aa.path).phase).toBe('merged');
    expect(leafState(bb.path).phase).toBe('merge');
    expect(attemptLines(f).map((line) => line.outcome)).toEqual(['merged']);
  } finally {
    await f.clean();
  }
}, 30000);

test('a push reported lost but landed moves only the holder to merged once', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const aa: { path: string } = await allocatedLeaf(f, 'aa', 'issue-aa');
    const bb: { path: string } = await allocatedLeaf(f, 'bb', 'issue-bb');
    await commitFile(f, aa.path, 'aa-file', 'aa\n');
    await commitFile(f, bb.path, 'bb-file', 'bb\n');
    const bbHead: string = await head(f, 'bb');
    toMerge(aa.path, '2026-09-11T00:00:00.000Z');
    toMerge(bb.path, '2026-09-12T00:00:00.000Z');
    resetPrompts(f);
    expect((await next(f, [])).code).toBe(0);
    const record = readState(aa.path).batch!;
    await idleAll(f);
    await verified(f, 'aa', 'merge');
    expect(
      (await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', record.attempt], f.root, f.env))
        .code,
    ).toBe(0);
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
    const merged: Result = await cli(
      f,
      ['phase', 'aa', 'merged', '--slot', 'B', '--attempt', record.attempt],
      f.root,
      f.env,
    );
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
}, 30000);
