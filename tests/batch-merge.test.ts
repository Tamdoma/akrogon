import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import {
  cli,
  printedChecks,
  fakeHerdr,
  fixture,
  leaf,
  leafTempRoot,
  yaml,
  editOnSecondStatus,
  type Fixture,
  type HerdrFixture,
} from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

test.serial('restack preserves a retirement when an unrelated member predates the lesson', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    process.env.HOME = f.home;
    const repo: Repo = readRepo('repo', f.root);
    const olderBase: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const older: Branch = await branchAt(f, 'older', olderBase, 'file-older');
    const alpha: string = '- alpha. 2026-10-09. history/alpha.md\n';
    const beta: string = '- beta. 2026-10-09. history/beta.md\n';
    const gamma: string = '- gamma. 2026-10-10. history/gamma.md\n';
    const delta: string = '- delta. 2026-10-10. history/delta.md\n';
    const recurrence: string = '- new recurrence. 2026-10-10. history/alpha.md\n';
    mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
    writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + beta);
    writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'lessons'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const guardBase: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const guard: Branch = await branchAt(f, 'guard', guardBase, 'file-guard', async (worktree) => {
      writeFileSync(resolve(worktree, 'learnings/LESSONS.md'), beta);
      writeFileSync(
        resolve(worktree, 'learnings/history/alpha.md'),
        '# alpha\nApplied 2026-10-10 by guard.ts:1: guard\n',
      );
    });
    const held: Branch = await branchAt(f, 'holder', guardBase, 'file-holder');
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + gamma + recurrence + beta);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'new lessons'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const builtOn: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const members: Leaf[] = [older, guard].map((branch, index) => {
      const path: string = leaf(f, branch.slug, 'merge', {
        worktree: branch.worktree,
        merge_stamp: '2026-10-10T00:00:0' + (index + 1) + '.000Z',
      });
      return { path, state: readState(path) };
    });
    const holderPath: string = leaf(f, 'holder', 'merge', {
      worktree: held.worktree,
      merge_stamp: '2026-10-10T00:00:00.000Z',
    });
    const original: { slug: string; base: string; head: string }[] = [
      { slug: older.slug, base: olderBase, head: older.head },
      { slug: guard.slug, base: guardBase, head: guard.head },
    ];
    const built: Awaited<ReturnType<typeof buildStack>> = await buildStack(repo, builtOn, original, held.head);
    if (!built.ok) throw new Error('fixture stack conflict: ' + built.conflict);
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: guardBase, head: held.head },
      applied: true,
      top: built.top,
      members: original.map((member) => ({ ...member, tip: built.tips.get(member.slug)! })),
    };
    saveState(holderPath, { ...readState(holderPath), batch: record });
    const holder: Leaf = { path: holderPath, state: readState(holderPath) };
    await applyStack(
      repo,
      built.top,
      record.members.map((member) => ({
        ...member,
        leaf: members.find((item) => item.state.slug === member.slug)!,
      })),
      holder,
    );
    const herdr: HerdrFixture = fakeHerdr(f);
    const args: string[] = ['phase', 'holder', 'merged', '--slot', 'B', '--attempt', 'a1'];
    expect((await cli(f, [...args, '--check'], f.root, herdr.env)).code).toBe(0);
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + gamma + delta + recurrence + beta);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'main adds delta'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    expect((await cli(f, args, f.root, herdr.env)).code).toBe(0);
    const restacked: Batch = readState(holderPath).batch!;
    const expected: string = gamma + delta + recurrence + beta;
    expect(readFileSync(resolve(held.worktree, 'learnings/LESSONS.md'), 'utf8')).toBe(expected);

    writeFileSync(resolve(held.worktree, 'learnings/LESSONS.md'), alpha + expected);
    await command(['git', 'add', 'learnings/LESSONS.md'], held.worktree);
    await command(['git', 'commit', '-m', 'resurrect retired line'], held.worktree);
    const resurrected: string = await command(['git', 'rev-parse', 'HEAD'], held.worktree);
    saveState(holderPath, { ...readState(holderPath), batch: { ...restacked, top: resurrected } });
    const refused: Result = await cli(f, [...args, '--check'], f.root, herdr.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('history/alpha');
    await command(['git', 'reset', '--hard', restacked.top!], held.worktree);
    saveState(holderPath, { ...readState(holderPath), batch: restacked });
    expect((await cli(f, [...args, '--check'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, args, f.root, herdr.env)).code).toBe(0);
    expect(await command(['git', 'show', 'origin/main:learnings/LESSONS.md'], f.root)).toBe(expected.trim());
  } finally {
    f.clean();
  }
});

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
const originalHome: string | undefined = process.env.HOME;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
});

type Branch = { slug: string; head: string; worktree: string };
type BatchFixture = {
  repo: Repo;
  herdr: HerdrFixture;
  builtOn: string;
  holder: Leaf;
  members: Leaf[];
  record: Batch;
  branches: Map<string, Branch>;
};

async function branchAt(
  f: Fixture,
  slug: string,
  base: string,
  file: string,
  prepare?: (worktree: string) => Promise<void>,
): Promise<Branch> {
  const worktree: string = resolve(f.home, 'wt-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, base], f.root);
  mkdirSync(dirname(resolve(worktree, file)), { recursive: true });
  writeFileSync(resolve(worktree, file), slug + '\n');
  if (prepare !== undefined) await prepare(worktree);
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  return { slug, head: await command(['git', 'rev-parse', 'HEAD'], worktree), worktree };
}

async function batchFixture(
  f: Fixture,
  slugs: string[],
  containers: Record<string, string> = {},
  files: Record<string, string> = {},
  prepare: Record<string, (worktree: string) => Promise<void>> = {},
): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const [holderSlug, ...memberSlugs] = slugs;
  const branches: Map<string, Branch> = new Map();
  for (const slug of slugs)
    branches.set(slug, await branchAt(f, slug, builtOn, files[slug] ?? 'file-' + slug, prepare[slug]));
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
    holder: { base: builtOn, head: branches.get(holderSlug)!.head },
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
  return { repo, herdr: fakeHerdr(f), builtOn, holder, members, record, branches };
}

async function soloFixture(f: Fixture): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const branch: Branch = await branchAt(f, 'hold', builtOn, 'file-hold');
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: branch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const record: Batch = {
    attempt: 'a1',
    built_on: builtOn,
    holder: { base: builtOn, head: branch.head },
    applied: true,
    solo: true,
    members: [],
  };
  saveState(holderPath, { ...readState(holderPath), batch: record });
  return {
    repo,
    herdr: fakeHerdr(f),
    builtOn,
    holder: { path: holderPath, state: readState(holderPath) },
    members: [],
    record,
    branches: new Map([['hold', branch]]),
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

async function advanceRemote(f: Fixture, files: Record<string, string>): Promise<string> {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akrogon-adv-'));
  await command(['git', 'worktree', 'add', '--detach', dir, 'origin/main'], f.root);
  try {
    for (const [name, content] of Object.entries(files)) {
      const path: string = resolve(dir, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    await command(['git', 'add', '.'], dir);
    await command(['git', 'commit', '-m', 'adv'], dir);
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], dir);
    await command(['git', 'push', 'origin', 'HEAD:main'], dir);
    return sha;
  } finally {
    await command(['git', 'worktree', 'remove', '--force', dir], f.root);
  }
}

test.serial(
  'a green batch checks once, pushes once, moves members before the holder and closes the issue',
  async () => {
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
  },
);

test.serial('a member leaving merge before merged refuses the push and dissolves the batch', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, holder, members, herdr, branches } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
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
    expect(await command(['git', 'rev-parse', 'refs/heads/hold'], f.root)).toBe(branches.get('hold')!.head);
    expect(await command(['git', 'rev-parse', 'HEAD'], holder.state.worktree!)).toBe(branches.get('hold')!.head);
    const stayed: State = readState(members[1].path);
    expect(stayed.phase).toBe('merge');
    expect(await command(['git', 'rev-parse', 'refs/heads/mem-b'], f.root)).toBe(record.members[1].head);
    expect(readState(members[0].path).phase).toBe('failed');
  } finally {
    f.clean();
  }
});

test.serial('a stale or missing attempt is refused, changes nothing, and the current attempt still lands', async () => {
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

test.serial('a refused push restacks onto the new remote, prints rerun and the rerun pushes the new top', async () => {
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
    expect(merged.stdout).toMatch(/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    const newTop: string = merged.stdout.split('pushed=')[1];
    const after: State = readState(holder.path);
    expect(after.phase).toBe('merge');
    const batch: Batch = after.batch!;
    expect(batch.attempt).toBe('a1');
    expect(batch.applied).toBe(true);
    expect(batch.top).toBe(newTop);
    expect(newTop).not.toBe(record.top);
    expect(batch.built_on).toBe(advSha);
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
    expect(batch.decision).toBe('rerun');
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

test.serial('a red check.fix halves the batch until the holder alone moves to check.fix', async () => {
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
    expect(red.stdout).toBe('batch split, holder keeps 1 of 2 members');
    const halved: State = readState(holder.path);
    expect(halved.phase).toBe('merge');
    expect(halved.batch_limit).toBe(1);
    // The post-call mergeWake immediately rebuilds the holder's batch with the first half.
    expect(halved.batch?.members.map((member) => member.slug)).toEqual(['mem-a']);
    expect(halved.batch?.attempt).not.toBe(record.attempt);
    expect(await command(['git', 'rev-parse', 'refs/heads/mem-b'], f.root)).toBe(record.members[1].head);
    const halvedRed: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', z.string().parse(halved.batch?.attempt)],
      f.root,
      herdr.env,
    );
    expect(halvedRed.stdout).toBe('batch split, holder keeps 0 of 1 members');
    const alone: State = readState(holder.path);
    expect(alone.batch?.members).toEqual([]);
    for (const [index, member] of members.entries()) {
      const state: State = readState(member.path);
      expect(state.phase).toBe('merge');
      expect(await command(['git', 'rev-parse', 'refs/heads/' + member.state.slug], f.root)).toBe(
        record.members[index].head,
      );
    }
    expect(await remoteTip(f)).toBe(remoteBefore);
    const solo: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', z.string().parse(alone.batch?.attempt)],
      f.root,
      herdr.env,
    );
    expect(solo.code).toBe(0);
    expect(solo.stdout).toBe('moved check.fix');
    expect(readState(holder.path).phase).toBe('check.fix');
    expect(readState(holder.path).batch_limit).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial(
  'the batch prints issue complete once for a standalone issue and no epic complete for an unfinished epic',
  async () => {
    const f: Fixture = await fixture();
    try {
      leaf(f, 'other', 'check.review', {}, 'epic/otherpart');
      const { herdr } = await batchFixture(f, ['hold', 'mem'], { hold: 'epic/part', mem: 'memiss' });
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env))
          .code,
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
  },
);

test.serial('merged --check refuses a member test change without a citation, naming the file', async () => {
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

test.serial('a solo record checks and pushes the worktree HEAD', async () => {
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

test.serial(
  'an operator merged without --slot skips the attempt and tested_top gates but still pushes the batch',
  async () => {
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
  },
);

test.serial('check.fix on a memberless record moves the holder to check.fix', async () => {
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

test.serial('operator completion refuses a holder commit outside the applied stack', async () => {
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

test.serial('a member failing during restack is not reset by the locked apply', async () => {
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

test.serial(
  'a dissolved batch restores the holder to its own range and the solo push carries no member commits',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, branches, herdr } = await batchFixture(f, ['hold', 'mem-a']);
      expect(await command(['git', 'rev-parse', 'refs/heads/hold'], f.root)).toBe(record.top!);
      const red: Result = await cli(
        f,
        ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(red.code).toBe(0);
      expect(red.stdout).toBe('batch split, holder keeps 0 of 1 members');
      const holderHead: string = branches.get('hold')!.head;
      expect(await command(['git', 'rev-parse', 'refs/heads/hold'], f.root)).toBe(holderHead);
      expect(await command(['git', 'rev-parse', 'HEAD'], holder.state.worktree!)).toBe(holderHead);
      expect(
        (
          await command(
            ['git', 'rev-list', '--format=%s', '--no-commit-header', 'origin/main..refs/heads/hold'],
            f.root,
          )
        ).trim(),
      ).toBe('hold');
      const solo: State = readState(holder.path);
      const attempt: string = z.string().parse(solo.batch?.attempt);
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', attempt, '--check'], f.root, herdr.env))
          .code,
      ).toBe(0);
      const merged: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', attempt],
        f.root,
        herdr.env,
      );
      expect(merged.code).toBe(0);
      expect(await remoteSubjects(f, 1)).toEqual(['hold']);
      expect((await run(['git', 'show', 'refs/heads/main:file-mem-a'], remoteDir(f))).code).not.toBe(0);
    } finally {
      f.clean();
    }
  },
);

test.serial(
  'a member conflict during restack drops the member and keeps its commits out of the rebuilt stack',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, herdr } = await batchFixture(
        f,
        ['hold', 'mem-a', 'mem-b'],
        {},
        { 'mem-a': 'conflict-file', 'mem-b': 'file-mem-b' },
      );
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env))
          .code,
      ).toBe(0);
      const droppedTip: string = record.members[0].tip;
      const advance: string = resolve(f.home, 'advance');
      await command(['git', 'worktree', 'add', '--detach', advance, 'origin/main'], f.root);
      writeFileSync(resolve(advance, 'conflict-file'), 'from-main\n');
      await command(['git', 'add', '.'], advance);
      await command(['git', 'commit', '-m', 'adv'], advance);
      await command(['git', 'push', 'origin', 'HEAD:main'], advance);
      await command(['git', 'worktree', 'remove', '--force', advance], f.root);
      const merged: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(merged.code).toBe(0);
      expect(merged.stdout).toMatch(/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
      const newTop: string = merged.stdout.split('pushed=')[1];
      const batch: Batch = readState(holder.path).batch!;
      expect(batch.top).toBe(newTop);
      expect(batch.members.map((member) => member.slug)).toEqual(['mem-b']);
      expect(batch.excluded).toContain('mem-a');
      const dropped: State = readState(resolve(f.root, 'issues/open/issue/mem-a'));
      expect(dropped.phase).toBe('merge');
      expect(await command(['git', 'rev-parse', 'refs/heads/mem-a'], f.root)).toBe(record.members[0].head);
      expect((await run(['git', 'merge-base', '--is-ancestor', droppedTip, newTop], f.root)).code).toBe(1);
      expect((await run(['git', 'cat-file', '-e', newTop + ':file-mem-a'], f.root)).code).not.toBe(0);
      expect(await command(['git', 'show', newTop + ':conflict-file'], f.root)).toBe('from-main');
      expect(await command(['git', 'log', '--format=%s', '-1', newTop], f.root)).toBe('hold');
    } finally {
      f.clean();
    }
  },
);

test.serial('a dirty member worktree keeps its files and branch at head when the batch dissolves', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, members, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const dirty: string = resolve(members[0].state.worktree!, 'file');
    writeFileSync(dirty, 'uncommitted\n');
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    expect(red.stdout).toBe('batch split, holder keeps 0 of 1 members');
    expect(readFileSync(dirty, 'utf8')).toBe('uncommitted\n');
    expect(await command(['git', 'status', '--porcelain'], members[0].state.worktree!)).toContain('file');
    expect(await command(['git', 'rev-parse', 'refs/heads/mem-a'], f.root)).toBe(record.members[0].head);
    expect(readState(holder.path).batch?.members).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial(
  'a carried package installs on the batch top and the restored member resolves its own lockfile',
  async () => {
    const f: Fixture = await fixture();
    try {
      writeFileSync(resolve(f.root, '.gitignore'), '.env\nnode_modules/\n');
      mkdirSync(resolve(f.root, 'pkg-marker'));
      writeFileSync(resolve(f.root, 'pkg-marker/package.json'), '{"name":"marker","version":"1.0.0"}');
      writeFileSync(resolve(f.root, 'package.json'), '{"name":"app","dependencies":{"marker":"file:./pkg-marker"}}');
      await command(['git', 'add', '.'], f.root);
      await command(['git', 'commit', '-m', 'packages'], f.root);
      await command(['bun', 'install'], f.root);
      await command(['git', 'add', 'bun.lock'], f.root);
      await command(['git', 'commit', '-m', 'lockfile'], f.root);
      await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
      yaml(resolve(f.root, 'issues/config.yaml'), {
        grounding: 'none',
        setup: 'bun install --frozen-lockfile',
        checks: {
          versions:
            "bun -e \"console.log(require('marker/package.json').version);console.log(require('extra/package.json').version)\"",
        },
      });
      const addExtra = async (worktree: string): Promise<void> => {
        mkdirSync(resolve(worktree, 'pkg-extra'));
        writeFileSync(resolve(worktree, 'pkg-extra/package.json'), '{"name":"extra","version":"2.0.0"}');
        writeFileSync(
          resolve(worktree, 'package.json'),
          '{"name":"app","dependencies":{"marker":"file:./pkg-marker","extra":"file:./pkg-extra"}}',
        );
        await command(['bun', 'install'], worktree);
      };
      const { holder, members, herdr } = await batchFixture(f, ['hold', 'mem-a'], {}, {}, { 'mem-a': addExtra });
      const check: ReturnType<typeof printedChecks> = printedChecks(f);
      const config: Result = await cli(f, ['config'], holder.state.worktree!, herdr.env);
      expect(config.code).toBe(0);
      const composed: string = z
        .object({ checks: z.record(z.string(), z.string()) })
        .parse(Bun.YAML.parse(config.stdout)).checks.versions;
      const onTop: Result = await check(composed, holder.state.worktree!);
      expect(onTop.stdout.split('\n').slice(-2)).toEqual(['1.0.0', '2.0.0']);
      expect(onTop.code).toBe(0);
      const red: Result = await cli(
        f,
        ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(red.code).toBe(0);
      expect(red.stdout).toBe('batch split, holder keeps 0 of 1 members');
      const memberWorktree: string = z.string().parse(readState(members[0].path).worktree);
      rmSync(resolve(memberWorktree, 'node_modules'), { recursive: true, force: true });
      const onMember: Result = await check(composed, memberWorktree);
      expect(onMember.stdout.split('\n').slice(-2)).toEqual(['1.0.0', '2.0.0']);
      expect(onMember.code).toBe(0);
      // The restored holder carries the base lockfile only: extra is absent from it and
      // cannot be resolved once the stale install is gone.
      rmSync(resolve(holder.state.worktree!, 'node_modules'), { recursive: true, force: true });
      expect(readFileSync(resolve(holder.state.worktree!, 'bun.lock'), 'utf8')).not.toContain('extra');
      const onHolder: Result = await check(composed, holder.state.worktree!);
      expect(onHolder.code).not.toBe(0);
    } finally {
      f.clean();
    }
  },
  30000,
);

test.serial('a solo restack conflict preserves commits made during the solo pass', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    writeFileSync(resolve(holder.state.worktree!, 'solo-fix'), 'committed solo repair');
    await command(['git', 'add', '.'], holder.state.worktree!);
    await command(['git', 'commit', '-m', 'solo repair'], holder.state.worktree!);
    const repaired: string = await command(['git', 'rev-parse', 'hold'], f.root);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--check', '--attempt', 'a1'], f.root, herdr.env)).code,
    ).toBe(0);
    writeFileSync(resolve(f.root, 'file-hold'), 'main conflict');
    await command(['git', 'add', 'file-hold'], f.root);
    await command(['git', 'commit', '-m', 'advance'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const result: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(result.code).toBe(0);
    expect(readState(holder.path).batch!.solo).toBe(true);
    expect(await command(['git', 'rev-parse', 'hold'], f.root)).toBe(repaired);
    expect(readFileSync(resolve(holder.state.worktree!, 'solo-fix'), 'utf8')).toBe('committed solo repair');
  } finally {
    f.clean();
  }
});

for (const edited of ['holder', 'member'] as const) {
  test.serial(`late ${edited} dirt during restack is isolated`, async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, members, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--check', '--attempt', 'a1'], f.root, herdr.env))
          .code,
      ).toBe(0);
      writeFileSync(resolve(f.root, 'advance'), 'advance');
      await command(['git', 'add', 'advance'], f.root);
      await command(['git', 'commit', '-m', 'advance'], f.root);
      await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
      const selected: Leaf = edited === 'holder' ? holder : members[0];
      const created: string = await editOnSecondStatus(f, selected.state.worktree!);
      const result: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(result.code).toBe(0);
      expect(existsSync(created)).toBe(true);
      const batch: Batch = readState(holder.path).batch!;
      expect(batch.members).toEqual([]);
      expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(record.members[0].head);
      if (edited === 'holder') expect(batch.solo).toBe(true);
      else {
        expect((await run(['git', 'cat-file', '-e', batch.top! + ':file-mem-a'], f.root)).code).not.toBe(0);
      }
      expect(readFileSync(resolve(selected.state.worktree!, 'uncommitted'), 'utf8')).toBe('operator edit\n');
    } finally {
      f.clean();
    }
  });
}

test.serial(
  'a record-only advance reuses the green run: prints reuse, keeps the tested pair and pushes the restacked top',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
      const t1: string = record.top!;
      const m1: string = record.built_on;
      const countFile: string = resolve(f.home, 'check-count');
      yaml(resolve(f.root, 'issues/config.yaml'), {
        grounding: 'none',
        checks: { count: 'sh -c "echo x >> ' + countFile + '"' },
      });
      await command(['sh', '-c', 'echo x >> ' + countFile]);
      const checked: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
        f.root,
        herdr.env,
      );
      expect(checked.code).toBe(0);
      const m2: string = await advanceRemote(f, {
        'issues/open/x/state.yaml': 'x\n',
        'learnings/history/y.md': 'y\n',
      });
      const merged: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(merged.code).toBe(0);
      const t2: string = merged.stdout.split('pushed=')[1];
      expect(merged.stdout).toBe(`reuse tested=${t1} pushed=${t2}`);
      const reuseBatch: Batch = readState(holder.path).batch!;
      expect(reuseBatch.decision).toBe('reuse');
      expect(reuseBatch.tested_top).toBe(t1);
      expect(reuseBatch.tested_main).toBe(m1);
      expect(reuseBatch.built_on).toBe(m2);
      expect(reuseBatch.top).toBe(t2);
      expect(reuseBatch.candidate).toBeUndefined();
      expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(1);
      const recheck: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
        f.root,
        herdr.env,
      );
      expect(recheck.code).toBe(0);
      expect(recheck.stdout).toBe('ok');
      // The candidate lives on the record only between the push-attempt write and
      // reconcile's post-landing cleanup, so snapshot state.yaml at the push.
      const git: string = await command(['sh', '-c', 'command -v git']);
      const bin: string = resolve(f.home, 'push-bin');
      mkdirSync(bin);
      mkdirSync(resolve(f.home, 'snap'));
      writeFileSync(
        resolve(bin, 'git'),
        `#!/bin/sh
if [ "$1" = push ]; then cp '${holder.path}/state.yaml' '${resolve(f.home, 'snap')}/state.yaml'; fi
exec '${git}' "$@"
`,
      );
      chmodSync(resolve(bin, 'git'), 0o755);
      const pushed: Result = await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, {
        ...herdr.env,
        PATH: `${bin}:${process.env.PATH}`,
      });
      expect(pushed.code).toBe(0);
      expect(await remoteTip(f)).toBe(t2);
      const landed: Batch = readState(resolve(f.home, 'snap')).batch!;
      expect(landed.tested_top).toBe(t1);
      expect(landed.candidate).toBe(t2);
      expect(landed.decision).toBe('reuse');
      expect(landed.built_on).toBe(m2);
      expect(landed.top).toBe(t2);
      expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
      expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(1);
    } finally {
      f.clean();
    }
  },
);

test.serial('a code advance forces a rerun: the seat rechecks and the restacked top lands', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const t1: string = record.top!;
    const countFile: string = resolve(f.home, 'check-count');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      checks: { count: 'sh -c "echo x >> ' + countFile + '"' },
    });
    await command(['sh', '-c', 'echo x >> ' + countFile]);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const m2: string = await advanceRemote(f, { file: 'advanced\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const rerunBatch: Batch = readState(holder.path).batch!;
    expect(rerunBatch.decision).toBe('rerun');
    expect(rerunBatch.tested_top).toBeUndefined();
    expect(rerunBatch.tested_main).toBeUndefined();
    expect(rerunBatch.built_on).toBe(m2);
    expect(rerunBatch.top).toBe(t2);
    expect(await remoteTip(f)).toBe(m2);
    await command(['sh', '-c', 'echo x >> ' + countFile]);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(t2);
    expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test.serial('a main commit matching part of a member change fails the main-side equality and reruns', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const t1: string = record.top!;
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'file-mem-a': 'mem-a\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.members.map((member) => member.slug)).toEqual(['mem-a']);
    expect(batch.top).toBe(t2);
  } finally {
    f.clean();
  }
});

test.serial('a change to issues/config.yaml on main forces a rerun', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const t1: string = record.top!;
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'issues/config.yaml': 'checks: {}\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial(
  'a restack conflict under learnings/history forces rerun and pushes nothing until a green rerun',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, herdr } = await batchFixture(
        f,
        ['hold', 'mem-a'],
        {},
        { 'mem-a': 'learnings/history/shared.md' },
      );
      const t1: string = record.top!;
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env))
          .code,
      ).toBe(0);
      const m2: string = await advanceRemote(f, { 'learnings/history/shared.md': 'from-main\n' });
      const merged: Result = await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
        f.root,
        herdr.env,
      );
      expect(merged.code).toBe(0);
      const t2: string = merged.stdout.split('pushed=')[1];
      expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
      const batch: Batch = readState(holder.path).batch!;
      expect(batch.decision).toBe('rerun');
      expect(batch.tested_top).toBeUndefined();
      expect(batch.tested_main).toBeUndefined();
      expect(batch.members).toEqual([]);
      expect(batch.top).toBe(t2);
      expect(batch.excluded).toContain('mem-a');
      const dropped: State = readState(resolve(f.root, 'issues/open/issue/mem-a'));
      expect(dropped.phase).toBe('merge');
      expect(await command(['git', 'rev-parse', 'refs/heads/mem-a'], f.root)).toBe(record.members[0].head);
      expect(await command(['git', 'show', t2 + ':learnings/history/shared.md'], f.root)).toBe('from-main');
      expect(await remoteTip(f)).toBe(m2);
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env))
          .code,
      ).toBe(0);
      expect(
        (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code,
      ).toBe(0);
      expect(await remoteTip(f)).toBe(t2);
    } finally {
      f.clean();
    }
  },
);

test.serial('a second refusal after reuse still compares against the original tested pair', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const t1: string = record.top!;
    const m1: string = record.built_on;
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'issues/open/x/state.yaml': 'x\n' });
    const first: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(first.code).toBe(0);
    const t2: string = first.stdout.split('pushed=')[1];
    expect(first.stdout).toBe(`reuse tested=${t1} pushed=${t2}`);
    const m3: string = await advanceRemote(f, { 'learnings/history/z.md': 'z\n' });
    const second: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(second.code).toBe(0);
    const t3: string = second.stdout.split('pushed=')[1];
    expect(second.stdout).toBe(`reuse tested=${t1} pushed=${t3}`);
    const again: Batch = readState(holder.path).batch!;
    expect(again.tested_top).toBe(t1);
    expect(again.tested_main).toBe(m1);
    expect(again.decision).toBe('reuse');
    expect(again.built_on).toBe(m3);
    expect(again.top).toBe(t3);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(t3);
  } finally {
    f.clean();
  }
});

test.serial('a dirty holder during restack records rerun and preserves the operator edit', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const main: string = await advanceRemote(f, { 'issues/open/x/state.yaml': 'x\n' });
    const edit: string = resolve(holder.state.worktree!, 'operator-edit');
    writeFileSync(edit, 'edit\n');
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toBe(`rerun rebase hold onto ${main}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
    expect(batch.solo).toBe(true);
    expect(readFileSync(edit, 'utf8')).toBe('edit\n');
    expect(await remoteTip(f)).toBe(main);
  } finally {
    f.clean();
  }
});

test.serial('the reuse decision is identical when the command runs from a subdirectory', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const t1: string = record.top!;
    const subdir: string = resolve(holder.state.worktree!, 'subdir');
    mkdirSync(subdir);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], subdir, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'learnings/history/y.md': 'y\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      subdir,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`reuse tested=${t1} pushed=${t2}`);
    expect(readState(holder.path).batch?.decision).toBe('reuse');
    expect(readState(holder.path).batch?.tested_top).toBe(t1);
  } finally {
    f.clean();
  }
});
