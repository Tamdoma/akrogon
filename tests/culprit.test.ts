import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  cli,
  fakeHerdr,
  fixture,
  leaf,
  leafTempRoot,
  storeDir,
  yaml,
  type Fixture,
  type HerdrFixture,
} from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { attemptRecordSchema } from '../src/attempts';
import { command, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
const originalHome: string | undefined = process.env.HOME;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
});

type Attempt = z.infer<typeof attemptRecordSchema>;
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

function attemptLines(f: Fixture): Attempt[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map((line) => attemptRecordSchema.parse(JSON.parse(line)));
}

async function branchAt(
  f: Fixture,
  slug: string,
  base: string,
  file: string,
  prepare?: (worktree: string) => Promise<void>,
  inStore: boolean = false,
): Promise<Branch> {
  const worktree: string = inStore ? resolve(storeDir(f), slug) : resolve(f.home, 'wt-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, base], f.root);
  mkdirSync(dirname(resolve(worktree, file)), { recursive: true });
  writeFileSync(resolve(worktree, file), slug + '\n');
  if (prepare !== undefined) await prepare(worktree);
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  return { slug, head: await command(['git', 'rev-parse', 'HEAD'], worktree), worktree };
}

async function batchFixture(f: Fixture, slugs: string[], inStore: boolean = false): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const [holderSlug, ...memberSlugs] = slugs;
  const branches: Map<string, Branch> = new Map();
  for (const slug of slugs) branches.set(slug, await branchAt(f, slug, builtOn, 'file-' + slug, undefined, inStore));
  const holderPath: string = leaf(f, holderSlug, 'merge', {
    worktree: branches.get(holderSlug)!.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const members: Leaf[] = memberSlugs.map((slug, index) => {
    const path: string = leaf(f, slug, 'merge', {
      worktree: branches.get(slug)!.worktree,
      merge_stamp: '2026-10-05T00:00:0' + (index + 1) + '.000Z',
    });
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
    started: new Date().toISOString(),
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

async function headOf(f: Fixture, slug: string): Promise<string> {
  return command(['git', 'rev-parse', 'refs/heads/' + slug], f.root);
}

test.serial('a member culprit ejects to check.fix and the next batch carries only the survivors', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, members, record, branches, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b'], true);
    const stamp: string = readState(members[0].path).merge_stamp!;
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const res: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--culprit', 'mem-a'],
      f.root,
      herdr.env,
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ejected mem-a');
    expect(res.stdout).toContain('moved check.fix');
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    expect(holderState.batch).toBeUndefined();
    expect(await headOf(f, 'hold')).toBe(record.holder.head);
    for (const member of record.members) expect(await headOf(f, member.slug)).toBe(member.head);
    expect(await command(['git', 'rev-parse', 'HEAD'], branches.get('mem-b')!.worktree)).toBe(
      record.members.find((member) => member.slug === 'mem-b')!.head,
    );
    const culprit: State = readState(members[0].path);
    expect(culprit.phase).toBe('check.fix');
    expect(culprit.fix_rounds).toBe(1);
    expect(culprit.merge_stamp).toBe(stamp);
    expect(readState(members[1].path).phase).toBe('merge');
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('ejected');
    expect(lines[0].culprit).toBe('mem-a');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect((await cli(f, ['unpause'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    const rebuilt: State = readState(holder.path);
    expect(rebuilt.phase).toBe('merge');
    expect(rebuilt.batch?.members.map((member) => member.slug)).toEqual(['mem-b']);
  } finally {
    f.clean();
  }
});

test.serial('a culprit at the fix-rounds cap ends failed with the shared attempts outcome', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, members, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 1, checks: { test: 'bun test' }, grounding: 'none' });
    saveState(members[0].path, { ...readState(members[0].path), fix_rounds: 1 });
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const res: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--culprit', 'mem-a'],
      f.root,
      herdr.env,
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ejected mem-a');
    expect(res.stdout).toContain('moved failed');
    const culprit: State = readState(members[0].path);
    expect(culprit.phase).toBe('failed');
    expect(culprit.failure?.cause).toBe('attempts');
    expect(culprit.failure?.phase).toBe('merge');
    expect(culprit.failure?.reason).toBe('fix rounds exhausted');
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    expect(holderState.batch).toBeUndefined();
    for (const member of record.members) expect(await headOf(f, member.slug)).toBe(member.head);
    expect(readState(members[1].path).phase).toBe('merge');
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('ejected');
    expect(lines[0].culprit).toBe('mem-a');
  } finally {
    f.clean();
  }
});

test.serial('a holder culprit ejects itself and the members stay in merge at saved heads', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, members, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const stamp: string = readState(holder.path).merge_stamp!;
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const res: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--culprit', 'hold'],
      f.root,
      herdr.env,
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ejected hold');
    expect(res.stdout).toContain('moved check.fix');
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('check.fix');
    expect(holderState.batch).toBeUndefined();
    expect(holderState.fix_rounds).toBe(1);
    expect(holderState.merge_stamp).toBe(stamp);
    expect(await headOf(f, 'hold')).toBe(record.holder.head);
    for (const [index, member] of members.entries()) {
      expect(readState(member.path).phase).toBe('merge');
      expect(await headOf(f, member.state.slug)).toBe(record.members[index].head);
    }
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('ejected');
    expect(lines[0].culprit).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
  } finally {
    f.clean();
  }
});

test.serial('refused --culprit calls exit nonzero, name the reason and change nothing', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, members, record, builtOn, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const statusOf = async (): Promise<Map<string, string>> => {
      const statuses: Map<string, string> = new Map();
      for (const slug of ['hold', 'mem-a', 'mem-b'])
        statuses.set(slug, await command(['git', 'status', '--porcelain'], resolve(f.home, 'wt-' + slug)));
      return statuses;
    };
    const before: Map<string, string> = await statusOf();
    const intact = async (): Promise<void> => {
      expect(readState(holder.path).batch).toEqual(record);
      expect(await headOf(f, 'hold')).toBe(record.top!);
      for (const member of record.members) expect(await headOf(f, member.slug)).toBe(member.tip);
      expect(await statusOf()).toEqual(before);
      expect(attemptLines(f)).toEqual([]);
    };
    const run = async (args: string[]): Promise<Result> => cli(f, args, f.root, herdr.env);
    const stale: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'bogus',
      '--culprit',
      'mem-a',
    ]);
    expect(stale.code).not.toBe(0);
    expect(stale.stderr).toContain('Stale attempt');
    await intact();
    const missing: Result = await run(['phase', 'hold', 'check.fix', '--slot', 'B', '--culprit', 'mem-a']);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('Stale attempt');
    await intact();
    const outsider: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--culprit',
      'nobody',
    ]);
    expect(outsider.code).not.toBe(0);
    expect(outsider.stderr).toContain('--culprit nobody is not the holder or a carried member of hold');
    await intact();
    const departed: State = readState(members[0].path);
    saveState(members[0].path, { ...departed, phase: 'check.fix' });
    const gone: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--culprit',
      'mem-a',
    ]);
    expect(gone.code).not.toBe(0);
    expect(gone.stderr).toContain('--culprit mem-a is not the holder or a carried member of hold');
    saveState(members[0].path, departed);
    await intact();
    writeFileSync(resolve(f.home, 'wt-mem-a', 'uncommitted'), 'dirty\n');
    const dirty: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--culprit',
      'mem-a',
    ]);
    expect(dirty.code).not.toBe(0);
    expect(dirty.stderr).toContain('Uncommitted work');
    await command(['rm', 'uncommitted'], resolve(f.home, 'wt-mem-a'));
    expect(readState(holder.path).batch).toEqual(record);
    expect(await headOf(f, 'mem-a')).toBe(record.members[0].tip);
    expect(attemptLines(f)).toEqual([]);
    const noSlotB: Result = await run(['phase', 'hold', 'check.fix', '--attempt', 'a1', '--culprit', 'mem-a']);
    expect(noSlotB.code).not.toBe(0);
    expect(noSlotB.stderr).toContain('--culprit requires --slot B');
    await intact();
    const slotA: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'A',
      '--attempt',
      'a1',
      '--culprit',
      'mem-a',
    ]);
    expect(slotA.code).not.toBe(0);
    expect(slotA.stderr).toContain('--culprit requires --slot B');
    await intact();
    const wrongPhase: Result = await run([
      'phase',
      'hold',
      'merged',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--culprit',
      'mem-a',
    ]);
    expect(wrongPhase.code).not.toBe(0);
    expect(wrongPhase.stderr).toContain('--culprit is only valid for check.fix');
    await intact();
    const withCheck: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--check',
      '--culprit',
      'mem-a',
    ]);
    expect(withCheck.code).not.toBe(0);
    expect(withCheck.stderr).toContain('--check cannot combine with --culprit');
    await intact();
    const withBase: Result = await run([
      'phase',
      'hold',
      'check.fix',
      '--slot',
      'B',
      '--attempt',
      'a1',
      '--culprit',
      'mem-a',
      '--red-on-base',
      builtOn,
      '--command',
      'bun test',
    ]);
    expect(withBase.code).not.toBe(0);
    expect(withBase.stderr).toContain('--culprit cannot combine with --red-on-base');
    await intact();
    for (const [flag, value] of [
      ['--verdict', 'ready'],
      ['--reason', 'oops'],
    ]) {
      const invalid: Result = await run([
        'phase',
        'hold',
        'check.fix',
        '--slot',
        'B',
        '--attempt',
        'a1',
        '--culprit',
        'mem-a',
        flag,
        value,
      ]);
      expect(invalid.code).not.toBe(0);
      await intact();
    }
  } finally {
    f.clean();
  }
});

test.serial('--culprit on a merge leaf without a batch record is refused', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    leaf(f, 'lone', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const res: Result = await cli(
      f,
      ['phase', 'lone', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--culprit', 'lone'],
      f.root,
      herdr.env,
    );
    expect(res.code).not.toBe(0);
    expect(res.stderr).toContain('--culprit requires a batch record');
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});
