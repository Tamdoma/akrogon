import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { cli, fakeHerdr, fixture, leaf, leafTempRoot, yaml, type Fixture, type HerdrFixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
});

type Branch = { slug: string; head: string; worktree: string };
type BatchFixture = {
  repo: Repo;
  herdr: HerdrFixture;
  builtOn: string;
  holder: Leaf;
  members: Leaf[];
  record: Batch;
};

async function branchAt(f: Fixture, slug: string, base: string, file: string): Promise<Branch> {
  const worktree: string = resolve(f.home, 'wt-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, base], f.root);
  mkdirSync(dirname(resolve(worktree, file)), { recursive: true });
  writeFileSync(resolve(worktree, file), slug + '\n');
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  return { slug, head: await command(['git', 'rev-parse', 'HEAD'], worktree), worktree };
}

async function batchFixture(
  f: Fixture,
  slugs: string[],
  containers: Record<string, string> = {},
  files: Record<string, string> = {},
): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const [holderSlug, ...memberSlugs] = slugs;
  const branches: Map<string, Branch> = new Map();
  for (const slug of slugs) branches.set(slug, await branchAt(f, slug, builtOn, files[slug] ?? 'file-' + slug));
  const holderPath: string = leaf(
    f,
    holderSlug,
    'merge',
    { worktree: branches.get(holderSlug)!.worktree, merge_stamp: '2026-10-05T00:00:00.000Z' },
    containers[holderSlug] ?? 'issue',
  );
  const members: Leaf[] = memberSlugs.map((slug, index) => {
    const path: string = leaf(
      f,
      slug,
      'merge',
      { worktree: branches.get(slug)!.worktree, merge_stamp: '2026-10-05T00:00:0' + (index + 1) + '.000Z' },
      containers[slug] ?? 'issue',
    );
    return { path, state: readState(path) };
  });
  const items: { slug: string; base: string; head: string }[] = memberSlugs.map((slug) => ({
    slug,
    base: builtOn,
    head: branches.get(slug)!.head,
  }));
  const built: Awaited<ReturnType<typeof buildStack>> = await buildStack(
    repo,
    builtOn,
    items,
    branches.get(holderSlug)!.head,
  );
  if (!built.ok) throw new Error('fixture stack conflict: ' + built.conflict);
  const record: Batch = {
    attempt: 'a1',
    built_on: builtOn,
    applied: true,
    top: built.top,
    members: memberSlugs.map((slug) => ({
      slug,
      base: builtOn,
      head: branches.get(slug)!.head,
      tip: built.tips.get(slug)!,
    })),
  };
  const holderState: State = { ...readState(holderPath), batch: record };
  saveState(holderPath, holderState);
  const holder: Leaf = { path: holderPath, state: holderState };
  await applyStack(
    repo,
    built.top,
    record.members.map((member) => ({ ...member, leaf: members.find((l) => l.state.slug === member.slug)! })),
    holder,
  );
  return { repo, herdr: fakeHerdr(f), builtOn, holder, members, record };
}

async function soloFixture(f: Fixture): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const branch: Branch = await branchAt(f, 'hold', builtOn, 'file-hold');
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: branch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const record: Batch = { attempt: 'a1', built_on: builtOn, applied: true, solo: true, members: [] };
  saveState(holderPath, { ...readState(holderPath), batch: record });
  return {
    repo,
    herdr: fakeHerdr(f),
    builtOn,
    holder: { path: holderPath, state: readState(holderPath) },
    members: [],
    record,
  };
}

function remoteDir(f: Fixture): string {
  return resolve(f.home, 'remote.git');
}
async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', 'rev-parse', 'refs/heads/main'], remoteDir(f));
}
async function remoteSubjects(f: Fixture, count: number): Promise<string[]> {
  return (await command(['git', 'log', '--format=%s', '-' + count], remoteDir(f))).split('\n');
}
function stateBytes(path: string): string {
  return readFileSync(resolve(path, 'state.yaml'), 'utf8');
}

test('a green batch checks once, pushes once, moves members before the holder and closes the issue', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, holder, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const countFile: string = resolve(f.home, 'count');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      checks: { count: 'sh -c "echo x >> ' + countFile + '"' },
    });
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(checked.stdout).toBe('ok');
    expect(readState(holder.path).batch?.tested_top).toBe(record.top);
    const checkRun: Result = await run(['sh', '-c', 'echo x >> ' + countFile]);
    expect(checkRun.code).toBe(0);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toBe('moved merged\nmoved merged\nmoved merged\nissue complete issue');
    expect(await remoteTip(f)).toBe(record.top!);
    expect(await remoteSubjects(f, 3)).toEqual(['hold', 'mem-b', 'mem-a']);
    for (const slug of ['hold', 'mem-a', 'mem-b'])
      expect(readState(resolve(f.root, 'issues/closed/issue', slug)).phase).toBe('merged');
    expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('a member leaving merge before merged refuses the push and dissolves the batch without solo marks', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, holder, members, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const remoteBefore: string = await remoteTip(f);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'mem-a', 'failed', '--reason', 'operator'], f.root, herdr.env)).code).toBe(0);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain('mem-a');
    expect(await remoteTip(f)).toBe(remoteBefore);
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    expect(holderState.batch).toBeUndefined();
    const stayed: State = readState(members[1].path);
    expect(stayed.phase).toBe('merge');
    expect(stayed.solo).toBeUndefined();
    expect(await command(['git', 'rev-parse', 'refs/heads/mem-b'], f.root)).toBe(record.members[1].head);
    expect(readState(members[0].path).phase).toBe('failed');
  } finally {
    f.clean();
  }
});

test('a stale or missing attempt is refused, changes nothing, and the current attempt still lands', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const remoteBefore: string = await remoteTip(f);
    const before: string = stateBytes(holder.path);
    const refusals: Result[] = [
      await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'old-attempt'], f.root, herdr.env),
      await cli(f, ['phase', 'hold', 'merged', '--slot', 'B'], f.root, herdr.env),
      await cli(f, ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'old-attempt'], f.root, herdr.env),
      await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'old-attempt', '--check'],
        f.root,
        herdr.env,
      ),
    ];
    for (const result of refusals) {
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Stale attempt');
    }
    expect(refusals[0].stderr).toContain('old-attempt');
    expect(stateBytes(holder.path)).toBe(before);
    expect(await remoteTip(f)).toBe(remoteBefore);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(record.top!);
    const late: Result = await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env);
    expect(late.code).not.toBe(0);
    expect(await remoteTip(f)).toBe(record.top!);
  } finally {
    f.clean();
  }
});

test('a refused push restacks onto the new remote, prints fresh checks required and the rerun pushes the new top', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const advance: string = resolve(f.home, 'advance');
    await command(['git', 'worktree', 'add', '--detach', advance, 'origin/main'], f.root);
    writeFileSync(resolve(advance, 'adv-file'), 'adv\n');
    await command(['git', 'add', '.'], advance);
    await command(['git', 'commit', '-m', 'adv'], advance);
    const advSha: string = await command(['git', 'rev-parse', 'HEAD'], advance);
    await command(['git', 'push', 'origin', 'HEAD:main'], advance);
    await command(['git', 'worktree', 'remove', '--force', advance], f.root);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toMatch(/^fresh checks required [0-9a-f]{40}$/);
    const newTop: string = merged.stdout.split(' ').pop()!;
    const after: State = readState(holder.path);
    expect(after.phase).toBe('merge');
    const batch: Batch = after.batch!;
    expect(batch.attempt).toBe('a1');
    expect(batch.applied).toBe(true);
    expect(batch.top).toBe(newTop);
    expect(newTop).not.toBe(record.top);
    expect(batch.built_on).toBe(advSha);
    expect(batch.tested_top).toBeUndefined();
    expect(batch.candidate).toBeUndefined();
    expect(await remoteTip(f)).toBe(advSha);
    for (const member of batch.members)
      expect(await command(['git', 'rev-parse', 'refs/heads/' + member.slug], f.root)).toBe(member.tip);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(newTop);
    expect(await remoteSubjects(f, 4)).toEqual(['hold', 'mem-b', 'mem-a', 'adv']);
  } finally {
    f.clean();
  }
});

test('a red check.fix restores members, marks them solo, keeps the holder in merge and the solo red moves it', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, members, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const remoteBefore: string = await remoteTip(f);
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    expect(red.stdout).toBe('batch dissolved, merge solo');
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    // The post-call mergeWake immediately writes a fresh memberless record for the
    // still-in-merge holder: the dissolved batch is gone, the fresh solo pass owns it.
    expect(holderState.batch?.members).toEqual([]);
    expect(holderState.batch?.attempt).not.toBe(record.attempt);
    expect(holderState.batch?.attempt).toBeTruthy();
    expect(holderState.batch?.applied).toBe(true);
    for (const [index, member] of members.entries()) {
      const state: State = readState(member.path);
      expect(state.phase).toBe('merge');
      expect(state.solo).toBe(true);
      expect(await command(['git', 'rev-parse', 'refs/heads/' + member.state.slug], f.root)).toBe(
        record.members[index].head,
      );
    }
    expect(await remoteTip(f)).toBe(remoteBefore);
    const soloAttempt: string = z.string().parse(holderState.batch?.attempt);
    const solo: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', soloAttempt],
      f.root,
      herdr.env,
    );
    expect(solo.code).toBe(0);
    expect(solo.stdout).toBe('moved check.fix');
    expect(readState(holder.path).phase).toBe('check.fix');
  } finally {
    f.clean();
  }
});

test('the batch prints issue complete once for a standalone issue and no epic complete for an unfinished epic', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'other', 'check.review', {}, 'epic/otherpart');
    const { herdr } = await batchFixture(f, ['hold', 'mem'], { hold: 'epic/part', mem: 'memiss' });
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout.split('\n').filter((line) => line === 'issue complete memiss')).toHaveLength(1);
    expect(merged.stdout).not.toContain('epic complete');
    expect(readState(resolve(f.root, 'issues/open/epic/part/hold')).phase).toBe('merged');
    expect(existsSync(resolve(f.root, 'issues/closed/memiss/mem/state.yaml'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('merged --check refuses a member test change without a citation, naming the file', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'tests'));
    writeFileSync(resolve(f.root, 'tests/existing.test.ts'), 'old\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'seed tests'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const { holder, herdr } = await batchFixture(
      f,
      ['hold', 'mem-a', 'mem-b'],
      {},
      { 'mem-a': 'tests/existing.test.ts' },
    );
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).not.toBe(0);
    expect(checked.stderr).toContain('tests/existing.test.ts');
    expect(readState(holder.path).batch?.tested_top).toBeUndefined();
    const tip: string = await command(['git', 'rev-parse', 'refs/heads/hold'], f.root);
    expect(await remoteTip(f)).not.toBe(tip);
  } finally {
    f.clean();
  }
});

test('a solo record checks and pushes the worktree HEAD', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    const head: string = await command(['git', 'rev-parse', 'refs/heads/hold'], f.root);
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(checked.stdout).toBe('ok');
    expect(readState(holder.path).batch?.tested_top).toBe(head);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(await remoteTip(f)).toBe(head);
    expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

test('an operator merged without --slot skips the attempt and tested_top gates but still pushes the batch', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const merged: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).toContain('moved merged');
    expect(await remoteTip(f)).toBe(record.top!);
    expect(readState(resolve(f.root, 'issues/closed/issue/mem-a')).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

test('check.fix on a memberless record moves the holder to check.fix', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    const moved: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    expect(moved.stdout).toBe('moved check.fix');
    expect(readState(holder.path).phase).toBe('check.fix');
  } finally {
    f.clean();
  }
});

test('operator completion refuses a holder commit outside the applied stack', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    writeFileSync(resolve(holder.state.worktree!, 'unchecked'), 'unchecked');
    await command(['git', 'add', '.'], holder.state.worktree!);
    await command(['git', 'commit', '-m', 'unchecked'], holder.state.worktree!);
    const before: string = await remoteTip(f);
    const result: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
    expect(result.code).not.toBe(0);
    expect(await remoteTip(f)).toBe(before);
    expect(readState(holder.path).batch!.top).toBe(record.top!);
  } finally {
    f.clean();
  }
});

test('a member failing during restack is not reset by the locked apply', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, members, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--check', '--attempt', 'a1'], f.root, herdr.env)).code,
    ).toBe(0);
    writeFileSync(resolve(f.root, 'advance'), 'advance');
    await command(['git', 'add', 'advance'], f.root);
    await command(['git', 'commit', '-m', 'advance'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const before: string = await remoteTip(f);
    const script: string = resolve(f.home, 'fail-member.ts');
    writeFileSync(
      script,
      `import { readState } from '${resolve(import.meta.dir, '../src/state')}';
import { readRepo } from '${resolve(import.meta.dir, '../src/config')}';
import { commitMove } from '${resolve(import.meta.dir, '../src/phase')}';
const path = '${members[0].path}';
const state = readState(path);
await commitMove(readRepo('repo', '${f.root}'), { path, state }, state, 'failed', null, { cause: 'blocked', phase: 'merge', slot: 'B', reason: 'operator stop' });
`,
    );
    const marker: string = resolve(f.home, 'failed-once');
    const git: string = await command(['sh', '-c', 'command -v git']);
    const wrapper: string = resolve(f.home, 'bin/git');
    writeFileSync(
      wrapper,
      `#!/bin/sh
if [ "$1" = rebase ] && [ ! -e '${marker}' ]; then
  touch '${marker}'
  '${process.execPath}' '${script}' || exit "$?"
fi
exec '${git}' "$@"
`,
    );
    chmodSync(wrapper, 0o755);
    const result: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(result.code).not.toBe(0);
    expect(readState(members[0].path).phase).toBe('failed');
    expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(record.members[0].tip);
    expect(await remoteTip(f)).toBe(before);
    expect(readState(holder.path).batch).toBeUndefined();
  } finally {
    f.clean();
  }
});
