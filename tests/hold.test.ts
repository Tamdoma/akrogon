import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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
import type { Database } from './fake-herdr';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { attemptRecordSchema } from '../src/attempts';
import { holdSchema, type Hold } from '../src/hold';
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

function heldRecords(f: Fixture): Record<string, Hold> {
  const file: string = resolve(f.home, 'held.yaml');
  if (!existsSync(file)) return {};
  return z.record(z.string(), holdSchema).parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
}

function herdrCalls(herdr: HerdrFixture): string[][] {
  const file: string = herdr.db + '.calls';
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.array(z.string()).parse(JSON.parse(line)));
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
    started: new Date().toISOString(),
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

async function headOf(f: Fixture, slug: string): Promise<string> {
  return command(['git', 'rev-parse', 'refs/heads/' + slug], f.root);
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

function mutating(herdr: HerdrFixture): string[][] {
  return herdrCalls(herdr).filter(
    (argv) =>
      (argv[0] === 'tab' && (argv[1] === 'create' || argv[1] === 'close')) ||
      (argv[0] === 'pane' && argv[1] === 'split') ||
      (argv[0] === 'agent' && (argv[1] === 'start' || argv[1] === 'prompt')),
  );
}

function database(herdr: HerdrFixture): Database {
  return JSON.parse(readFileSync(herdr.db, 'utf8')) as Database;
}

async function heldMergeLeaf(f: Fixture): Promise<{ herdr: HerdrFixture; holderPath: string; sha: string }> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const sha: string = await remoteTip(f);
  const branch: Branch = await branchAt(f, 'hold', sha, 'file-hold', undefined, true);
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: branch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  return { herdr: fakeHerdr(f), holderPath, sha };
}

function holdAt(f: Fixture, holderPath: string, sha: string, fix?: string): void {
  yaml(resolve(f.home, 'held.yaml'), {
    repo: {
      sha,
      command: 'bun test',
      holder: 'hold',
      attempt: 'a1',
      at: new Date().toISOString(),
      evidence: resolve(holderPath, 'review-B.md'),
      ...(fix === undefined ? {} : { fix }),
    },
  });
}

async function heldMergePair(
  f: Fixture,
): Promise<{ herdr: HerdrFixture; holderPath: string; fixPath: string; sha: string }> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const sha: string = await remoteTip(f);
  const holdBranch: Branch = await branchAt(f, 'hold', sha, 'file-hold', undefined, true);
  const fixBranch: Branch = await branchAt(f, 'fix', sha, 'file-fix', undefined, true);
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: holdBranch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const fixPath: string = leaf(f, 'fix', 'merge', {
    worktree: fixBranch.worktree,
    merge_stamp: '2026-10-05T00:00:01.000Z',
  });
  return { herdr: fakeHerdr(f), holderPath, fixPath, sha };
}

test.serial(
  'a batch --red-on-base holds the repo: heads restored, record cleared, held line and one notification',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, branches, builtOn, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
      saveState(holder.path, { ...readState(holder.path), batch_limit: 2, fix_rounds: 1 });
      // Paused so mergeWake is a no-op; U2's mergeTurn guard owns the unpaused case.
      expect((await cli(f, ['pause'], f.root)).code).toBe(0);
      const res: Result = await cli(
        f,
        [
          'phase',
          'hold',
          'check.fix',
          '--slot',
          'B',
          '--attempt',
          'a1',
          '--red-on-base',
          builtOn,
          '--command',
          'bun test',
        ],
        f.root,
        herdr.env,
      );
      expect(res.code).toBe(0);
      expect(res.stdout).toBe(`held repo on ${builtOn}: bun test`);
      const holderState: State = readState(holder.path);
      expect(holderState.phase).toBe('merge');
      expect(holderState.batch).toBeUndefined();
      expect(holderState.batch_limit).toBe(2);
      expect(holderState.fix_rounds).toBe(1);
      expect(await headOf(f, 'mem-a')).toBe(record.members.find((m) => m.slug === 'mem-a')!.head);
      expect(await headOf(f, 'mem-b')).toBe(record.members.find((m) => m.slug === 'mem-b')!.head);
      expect(await command(['git', 'rev-parse', 'HEAD'], branches.get('mem-a')!.worktree)).toBe(
        record.members.find((m) => m.slug === 'mem-a')!.head,
      );
      expect(await headOf(f, 'hold')).toBe(record.holder.head);
      const held: Record<string, Hold> = heldRecords(f);
      expect(Object.keys(held)).toEqual(['repo']);
      expect(held.repo.sha).toBe(builtOn);
      expect(held.repo.command).toBe('bun test');
      expect(held.repo.holder).toBe('hold');
      expect(held.repo.attempt).toBe('a1');
      expect(Number.isNaN(new Date(held.repo.at).getTime())).toBe(false);
      expect(held.repo.evidence).toBe(resolve(holder.path, 'review-B.md'));
      const lines: Attempt[] = attemptLines(f);
      expect(lines).toHaveLength(1);
      expect(lines[0].outcome).toBe('held');
      expect(lines[0].repo).toBe('repo');
      expect(lines[0].holder).toBe('hold');
      expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
      expect(lines[0].attempt).toBe('a1');
      const calls: string[][] = herdrCalls(herdr);
      expect(calls).toEqual([
        [
          'notification',
          'show',
          `repo merge held on ${builtOn.slice(0, 12)}`,
          '--body',
          'bun test',
          '--sound',
          'request',
        ],
      ]);
    } finally {
      f.clean();
    }
  },
);

test.serial('a solo --red-on-base holds the repo with members []', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, branches, builtOn, herdr } = await soloFixture(f);
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const res: Result = await cli(
      f,
      [
        'phase',
        'hold',
        'check.fix',
        '--slot',
        'B',
        '--attempt',
        'a1',
        '--red-on-base',
        builtOn,
        '--command',
        'bun test -t base',
      ],
      f.root,
      herdr.env,
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toBe(`held repo on ${builtOn}: bun test -t base`);
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    expect(holderState.batch).toBeUndefined();
    expect(await headOf(f, 'hold')).toBe(record.holder.head);
    const held: Record<string, Hold> = heldRecords(f);
    expect(Object.keys(held)).toEqual(['repo']);
    expect(held.repo.sha).toBe(builtOn);
    expect(held.repo.command).toBe('bun test -t base');
    expect(held.repo.holder).toBe('hold');
    expect(held.repo.attempt).toBe('a1');
    expect(held.repo.evidence).toBe(resolve(holder.path, 'review-B.md'));
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('held');
    expect(lines[0].members).toEqual([]);
    const calls: string[][] = herdrCalls(herdr);
    expect(calls).toEqual([
      [
        'notification',
        'show',
        `repo merge held on ${builtOn.slice(0, 12)}`,
        '--body',
        'bun test -t base',
        '--sound',
        'request',
      ],
    ]);
  } finally {
    f.clean();
  }
});

test.serial('refused --red-on-base calls exit nonzero, name the reason and change nothing', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, builtOn, herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const heldFilePath: string = resolve(f.home, 'held.yaml');
    const intact = async (): Promise<void> => {
      expect(readState(holder.path).batch).toEqual(record);
      expect(existsSync(heldFilePath)).toBe(false);
      expect(attemptLines(f)).toEqual([]);
    };
    const base: string[] = ['phase', 'hold', 'check.fix', '--slot', 'B'];
    const stale: Result = await cli(
      f,
      [...base, '--attempt', 'bogus', '--red-on-base', builtOn, '--command', 'bun test'],
      f.root,
      herdr.env,
    );
    expect(stale.code).not.toBe(0);
    expect(stale.stderr).toContain('Stale attempt');
    await intact();
    const missing: Result = await cli(
      f,
      [...base, '--red-on-base', builtOn, '--command', 'bun test'],
      f.root,
      herdr.env,
    );
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('Stale attempt');
    await intact();
    const wrongSha: Result = await cli(
      f,
      [...base, '--attempt', 'a1', '--red-on-base', record.top!, '--command', 'bun test'],
      f.root,
      herdr.env,
    );
    expect(wrongSha.code).not.toBe(0);
    expect(wrongSha.stderr).toContain('is not fetched');
    await intact();
    const wrongPhase: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--red-on-base', builtOn, '--command', 'bun test'],
      f.root,
      herdr.env,
    );
    expect(wrongPhase.code).not.toBe(0);
    expect(wrongPhase.stderr).toContain('--red-on-base is only valid for check.fix');
    await intact();
    const noRed: Result = await cli(f, [...base, '--attempt', 'a1', '--command', 'bun test'], f.root, herdr.env);
    expect(noRed.code).not.toBe(0);
    expect(noRed.stderr).toContain('--command requires --red-on-base');
    await intact();
    const noCommand: Result = await cli(f, [...base, '--attempt', 'a1', '--red-on-base', builtOn], f.root, herdr.env);
    expect(noCommand.code).not.toBe(0);
    expect(noCommand.stderr).toContain('--red-on-base requires --command');
    await intact();
    const withCheck: Result = await cli(
      f,
      [...base, '--attempt', 'a1', '--check', '--red-on-base', builtOn, '--command', 'bun test'],
      f.root,
      herdr.env,
    );
    expect(withCheck.code).not.toBe(0);
    expect(withCheck.stderr).toContain('--check cannot combine with --red-on-base');
    await intact();
    expect(herdrCalls(herdr)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('--red-on-base on a merge leaf without a batch record is refused', async () => {
  const f: Fixture = await fixture();
  try {
    const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const herdr: HerdrFixture = fakeHerdr(f);
    leaf(f, 'lone', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const res: Result = await cli(
      f,
      [
        'phase',
        'lone',
        'check.fix',
        '--slot',
        'B',
        '--attempt',
        'a1',
        '--red-on-base',
        builtOn,
        '--command',
        'bun test',
      ],
      f.root,
      herdr.env,
    );
    expect(res.code).not.toBe(0);
    expect(res.stderr).toContain('--red-on-base requires a batch record');
    expect(existsSync(resolve(f.home, 'held.yaml'))).toBe(false);
    expect(attemptLines(f)).toEqual([]);
    expect(herdrCalls(herdr)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('--red-on-base requires slot B even with a missing or stale attempt', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, builtOn, herdr } = await soloFixture(f);
    expect((await cli(f, ['pause'])).code).toBe(0);
    const variants: string[][] = [[], ['--attempt', 'stale-a0'], ['--slot', 'A', '--attempt', record.attempt]];
    for (const args of variants) {
      const result: Result = await cli(
        f,
        ['phase', 'hold', 'check.fix', ...args, '--red-on-base', builtOn, '--command', 'bun test'],
        f.root,
        herdr.env,
      );
      expect(result.code).not.toBe(0);
      expect(readState(holder.path).batch).toEqual(record);
      expect(await headOf(f, 'hold')).toBe(record.holder.head);
      expect(heldRecords(f)).toEqual({});
      expect(attemptLines(f)).toEqual([]);
      expect(herdrCalls(herdr)).toEqual([]);
    }
  } finally {
    f.clean();
  }
});

test.serial(
  'unhold clears the hold from root, a subfolder and a leaf worktree; absent hold fails naming the repo',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { holder, record, branches, builtOn, herdr } = await batchFixture(f, ['hold', 'mem-a']);
      expect((await cli(f, ['pause'], f.root)).code).toBe(0);
      const hold = async (): Promise<void> => {
        const res: Result = await cli(
          f,
          [
            'phase',
            'hold',
            'check.fix',
            '--slot',
            'B',
            '--attempt',
            'a1',
            '--red-on-base',
            builtOn,
            '--command',
            'bun test',
          ],
          f.root,
          herdr.env,
        );
        expect(res.code).toBe(0);
        expect(Object.keys(heldRecords(f))).toEqual(['repo']);
      };
      const restore = (): void => {
        saveState(holder.path, { ...readState(holder.path), batch: record });
      };
      await hold();
      const root: Result = await cli(f, ['unhold'], f.root, herdr.env);
      expect(root.code).toBe(0);
      expect(root.stdout).toBe('unheld repo');
      expect(heldRecords(f)).toEqual({});
      const absent: Result = await cli(f, ['unhold'], f.root, herdr.env);
      expect(absent.code).not.toBe(0);
      expect(absent.stderr).toContain('repo');
      restore();
      await hold();
      const sub: string = resolve(f.root, 'sub');
      mkdirSync(sub);
      const fromSub: Result = await cli(f, ['unhold'], sub, herdr.env);
      expect(fromSub.code).toBe(0);
      expect(fromSub.stdout).toBe('unheld repo');
      expect(heldRecords(f)).toEqual({});
      restore();
      await hold();
      const fromWorktree: Result = await cli(f, ['unhold'], branches.get('mem-a')!.worktree, herdr.env);
      expect(fromWorktree.code).toBe(0);
      expect(fromWorktree.stdout).toBe('unheld repo');
      expect(heldRecords(f)).toEqual({});
    } finally {
      f.clean();
    }
  },
);

test.serial('a notification failure still leaves the hold, attempt line and state committed', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, builtOn, herdr } = await soloFixture(f);
    writeFileSync(
      herdr.db,
      JSON.stringify({
        ...z
          .looseObject({ failNotification: z.boolean() })
          .partial()
          .parse(JSON.parse(readFileSync(herdr.db, 'utf8'))),
        failNotification: true,
      }),
    );
    expect((await cli(f, ['pause'], f.root)).code).toBe(0);
    const res: Result = await cli(
      f,
      [
        'phase',
        'hold',
        'check.fix',
        '--slot',
        'B',
        '--attempt',
        'a1',
        '--red-on-base',
        builtOn,
        '--command',
        'bun test',
      ],
      f.root,
      herdr.env,
    );
    expect(res.code).toBe(0);
    expect(res.stdout).toBe(`held repo on ${builtOn}: bun test`);
    expect(res.stderr).toContain('hold notice failed');
    const holderState: State = readState(holder.path);
    expect(holderState.phase).toBe('merge');
    expect(holderState.batch).toBeUndefined();
    expect(heldRecords(f).repo.sha).toBe(builtOn);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('held');
    const calls: string[][] = herdrCalls(herdr);
    expect(calls).toEqual([
      [
        'notification',
        'show',
        `repo merge held on ${builtOn.slice(0, 12)}`,
        '--body',
        'bun test',
        '--sound',
        'request',
      ],
    ]);
  } finally {
    f.clean();
  }
});

test.serial('a hold at the fetched sha blocks next: held line, no batch record, no mutating herdr calls', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, sha } = await heldMergeLeaf(f);
    holdAt(f, holderPath, sha);
    const res: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe(`held repo on ${sha}: bun test`);
    expect(readState(holderPath).batch).toBeUndefined();
    expect(mutating(herdr)).toEqual([]);
    expect(Object.keys(heldRecords(f))).toEqual(['repo']);
  } finally {
    f.clean();
  }
});

test.serial('a hold survives a main advance confined to record folders', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, sha } = await heldMergeLeaf(f);
    holdAt(f, holderPath, sha);
    await advanceRemote(f, { 'issues/open/x/state.yaml': 'x\n' });
    const res: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe(`held repo on ${sha}: bun test`);
    expect(readState(holderPath).batch).toBeUndefined();
    expect(mutating(herdr)).toEqual([]);
    expect(Object.keys(heldRecords(f))).toEqual(['repo']);
  } finally {
    f.clean();
  }
});

test.serial('a main advance outside record folders clears the hold and starts a normal attempt', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, sha } = await heldMergeLeaf(f);
    holdAt(f, holderPath, sha);
    await advanceRemote(f, { 'real-file': 'x\n' });
    const res: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(res.code).toBe(0);
    expect(res.stdout).not.toContain('held repo');
    expect(heldRecords(f).repo).toBeUndefined();
    const state: State = readState(holderPath);
    expect(state.batch).toBeDefined();
    const prompts: Database['prompts'] = database(herdr).prompts;
    expect(prompts).toHaveLength(1);
    expect(prompts[0].text).toBe(
      `merge-issue hold slot=B phase=merge leaf=${holderPath} attempt=${state.batch!.attempt} top=${state.batch!.top}`,
    );
  } finally {
    f.clean();
  }
});

test.serial('unhold then next starts a normal attempt', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, sha } = await heldMergeLeaf(f);
    holdAt(f, holderPath, sha);
    const unhold: Result = await cli(f, ['unhold'], f.root, herdr.env);
    expect(unhold.code).toBe(0);
    expect(unhold.stdout).toBe('unheld repo');
    const res: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(res.code).toBe(0);
    expect(res.stdout).not.toContain('held repo');
    expect(heldRecords(f).repo).toBeUndefined();
    const state: State = readState(holderPath);
    expect(state.batch).toBeDefined();
    const prompts: Database['prompts'] = database(herdr).prompts;
    expect(prompts).toHaveLength(1);
    expect(prompts[0].text).toContain('merge-issue hold slot=B');
  } finally {
    f.clean();
  }
});

test.serial('overlapping next calls preserve a newer red-on-base hold', async () => {
  const f: Fixture = await fixture();
  const release: string = resolve(f.home, 'release-diff');
  let pending: Promise<Result> | undefined;
  try {
    const { herdr, holderPath, sha } = await heldMergeLeaf(f);
    holdAt(f, holderPath, sha);
    const advanced: string = await advanceRemote(f, { 'real-file': 'changed\n' });
    const git: string = await command(['sh', '-c', 'command -v git']);
    const ready: string = resolve(f.home, 'diff-ready');
    const wrapper: string = resolve(f.home, 'bin/git');
    writeFileSync(
      wrapper,
      `#!/bin/sh
if [ "$1" = diff ] && [ "$2" = --quiet ] && [ "$3" = '${sha}' ] && mkdir '${f.home}/diff-claimed' 2>/dev/null; then
  touch '${ready}'
  while [ ! -e '${release}' ]; do sleep 0.01; done
fi
exec '${git}' "$@"
`,
    );
    chmodSync(wrapper, 0o755);
    pending = cli(f, ['next'], f.root, herdr.env, 20000);
    const deadline: number = Date.now() + 10000;
    while (!existsSync(ready) && Date.now() < deadline) await Bun.sleep(10);
    expect(existsSync(ready)).toBe(true);
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    const record: Batch = readState(holderPath).batch!;
    expect(record).toBeDefined();
    const red: Result = await cli(
      f,
      [
        'phase',
        'hold',
        'check.fix',
        '--slot',
        'B',
        '--attempt',
        record.attempt,
        '--red-on-base',
        advanced,
        '--command',
        'bun test',
      ],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    const held: Hold = heldRecords(f).repo;
    expect(held.sha).toBe(advanced);
    expect(readState(holderPath).batch).toBeUndefined();
    writeFileSync(release, 'go');
    const first: Result = await pending;
    expect(first.code).toBe(0);
    expect(heldRecords(f).repo).toEqual(held);
    expect(readState(holderPath).batch).toBeUndefined();
    expect(attemptLines(f)).toHaveLength(1);
    expect(attemptLines(f)[0].outcome).toBe('held');
  } finally {
    writeFileSync(release, 'go');
    try {
      if (pending !== undefined) await pending;
    } finally {
      f.clean();
    }
  }
});

test.serial(
  'hold-fix names a queued merge leaf: next builds its stack attempt while the queue head stays idle',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
      holdAt(f, holderPath, sha);
      const named: Result = await cli(f, ['hold-fix', 'fix'], f.root, herdr.env);
      expect(named.code).toBe(0);
      expect(named.stdout).toBe('held repo fix fix');
      expect(heldRecords(f).repo.fix).toBe('fix');
      expect(readState(fixPath).merge_stamp).toBe('2026-10-05T00:00:01.000Z');
      const res: Result = await cli(f, ['next'], f.root, herdr.env);
      expect(res.code).toBe(0);
      const fixBatch: Batch | undefined = readState(fixPath).batch;
      expect(fixBatch).toBeDefined();
      expect(fixBatch!.members).toEqual([]);
      expect(fixBatch!.applied).toBe(true);
      expect(fixBatch!.solo).toBeUndefined();
      expect(fixBatch!.top).toBeDefined();
      expect(readState(holderPath).batch).toBeUndefined();
      const prompts: Database['prompts'] = database(herdr).prompts;
      expect(prompts).toHaveLength(1);
      expect(prompts[0].text).toBe(
        'merge-issue fix slot=B phase=merge leaf=' +
          fixPath +
          ' attempt=' +
          fixBatch!.attempt +
          ' top=' +
          fixBatch!.top,
      );
    } finally {
      f.clean();
    }
  },
);

test.serial('changing the named fix preserves the active batch holder and its authorization', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
    holdAt(f, holderPath, sha);
    expect((await cli(f, ['hold-fix', 'fix'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    const attempt: string = readState(fixPath).batch!.attempt;
    expect((await cli(f, ['hold-fix', 'hold'], f.root, herdr.env)).code).toBe(0);
    expect(heldRecords(f).repo.fix).toBe('hold');
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    expect(readState(holderPath).batch).toBeUndefined();
    expect(readState(fixPath).batch!.attempt).toBe(attempt);
    const checked: Result = await cli(
      f,
      ['phase', 'fix', 'merged', '--check', '--slot', 'B', '--attempt', attempt],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    const merged: Result = await cli(
      f,
      ['phase', 'fix', 'merged', '--slot', 'B', '--attempt', attempt],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(readState(fixPath).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

test.serial('the fix leaf is authorized to merge while the queue head is refused, then order returns', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
    holdAt(f, holderPath, sha);
    expect((await cli(f, ['hold-fix', 'fix'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    const attempt: string = readState(fixPath).batch!.attempt;
    const probe: Result = await cli(
      f,
      ['phase', 'fix', 'check.fix', '--check', '--attempt', attempt],
      f.root,
      herdr.env,
    );
    expect(probe.code).toBe(0);
    expect(probe.stderr).not.toContain('Merge turn refused');
    const refused: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('holder is fix');
    const merged: Result = await cli(
      f,
      ['phase', 'fix', 'merged', '--slot', 'B', '--attempt', attempt],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const res: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(res.code).toBe(0);
    expect(heldRecords(f).repo).toBeUndefined();
    const holdBatch: Batch | undefined = readState(holderPath).batch;
    expect(holdBatch).toBeDefined();
    const prompts: Database['prompts'] = database(herdr).prompts;
    expect(prompts).toHaveLength(2);
    expect(prompts[1].text).toContain('merge-issue hold slot=B');
    expect(prompts[1].text).toContain('attempt=' + holdBatch!.attempt);
  } finally {
    f.clean();
  }
});

test.serial('hold-fix refusals change nothing: no hold, missing leaf, leaf outside the merge queue', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
    const holderBefore: string = readFileSync(resolve(holderPath, 'state.yaml'), 'utf8');
    const fixBefore: string = readFileSync(resolve(fixPath, 'state.yaml'), 'utf8');
    const noHold: Result = await cli(f, ['hold-fix', 'fix'], f.root, herdr.env);
    expect(noHold.code).not.toBe(0);
    expect(noHold.stderr).toContain('repo');
    expect(existsSync(resolve(f.home, 'held.yaml'))).toBe(false);
    holdAt(f, holderPath, sha);
    const heldFilePath: string = resolve(f.home, 'held.yaml');
    const heldBefore: string = readFileSync(heldFilePath, 'utf8');
    const bogus: Result = await cli(f, ['hold-fix', 'bogus'], f.root, herdr.env);
    expect(bogus.code).not.toBe(0);
    expect(readFileSync(heldFilePath, 'utf8')).toBe(heldBefore);
    const parked: string = leaf(f, 'idle', 'implement');
    const parkedBefore: string = readFileSync(resolve(parked, 'state.yaml'), 'utf8');
    const notQueued: Result = await cli(f, ['hold-fix', 'idle'], f.root, herdr.env);
    expect(notQueued.code).not.toBe(0);
    expect(notQueued.stderr).toContain('merge queue');
    expect(readFileSync(heldFilePath, 'utf8')).toBe(heldBefore);
    expect(readFileSync(resolve(holderPath, 'state.yaml'), 'utf8')).toBe(holderBefore);
    expect(readFileSync(resolve(fixPath, 'state.yaml'), 'utf8')).toBe(fixBefore);
    expect(readFileSync(resolve(parked, 'state.yaml'), 'utf8')).toBe(parkedBefore);
  } finally {
    f.clean();
  }
});

test.serial('unhold mid-attempt still lets the batch record authorize the fix merge', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
    holdAt(f, holderPath, sha);
    expect((await cli(f, ['hold-fix', 'fix'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, ['next'], f.root, herdr.env)).code).toBe(0);
    const attempt: string = readState(fixPath).batch!.attempt;
    const unhold: Result = await cli(f, ['unhold'], f.root, herdr.env);
    expect(unhold.code).toBe(0);
    expect(heldRecords(f).repo).toBeUndefined();
    const merged: Result = await cli(f, ['phase', 'fix', 'merged', '--attempt', attempt], f.root, herdr.env);
    expect(merged.code).toBe(0);
  } finally {
    f.clean();
  }
});

test.serial('status surfaces the fix name on the board and the targeted held line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr, holderPath, fixPath, sha } = await heldMergePair(f);
    holdAt(f, holderPath, sha, 'fix');
    const board: Result = await cli(f, ['status'], f.root, herdr.env);
    expect(board.code).toBe(0);
    expect(board.stdout).toContain('held fix fix');
    const targeted: Result = await cli(f, ['status', 'fix'], f.root, herdr.env);
    expect(targeted.code).toBe(0);
    expect(targeted.stdout).toContain('held: ' + sha + ' bun test fix fix');
    holdAt(f, holderPath, sha);
    const unfixedBoard: Result = await cli(f, ['status'], f.root, herdr.env);
    expect(unfixedBoard.code).toBe(0);
    expect(unfixedBoard.stdout).toContain('(held)');
    const unfixedTargeted: Result = await cli(f, ['status', 'fix'], f.root, herdr.env);
    expect(unfixedTargeted.code).toBe(0);
    expect(unfixedTargeted.stdout).toContain('held: ' + sha + ' bun test');
  } finally {
    f.clean();
  }
});
