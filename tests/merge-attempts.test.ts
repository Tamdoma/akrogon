import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { cli, fakeHerdr, fixture, leaf, leafTempRoot, type Fixture, type HerdrFixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { attemptRecordSchema } from '../src/attempts';
import { logSchema } from '../src/log';
import { command, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
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

function logBytes(f: Fixture): string | undefined {
  const file: string = resolve(f.root, 'issues/log.jsonl');
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

async function branchAt(
  f: Fixture,
  slug: string,
  base: string,
  file: string,
  prepare?: (worktree: string) => Promise<void>,
  inStore: boolean = false,
): Promise<Branch> {
  const worktree: string = inStore ? resolve(f.root, 'issues/worktrees', slug) : resolve(f.home, 'wt-' + slug);
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

test.serial('a green batch appends one merged attempt line and log.jsonl keeps its move-line shape', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const logBefore: string | undefined = logBytes(f);
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
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    const line: Attempt = lines[0];
    expect(line.outcome).toBe('merged');
    expect(line.repo).toBe('repo');
    expect(line.holder).toBe('hold');
    expect(line.members).toEqual(['mem-a', 'mem-b']);
    expect(line.attempt).toBe(record.attempt);
    expect(line.built_on).toMatch(/^[0-9a-f]{40}$/);
    expect(line.tested_top).toMatch(/^[0-9a-f]{40}$/);
    expect(line.start).toBeDefined();
    expect(Number.isNaN(new Date(line.start!).getTime())).toBe(false);
    expect(Number.isNaN(new Date(line.end).getTime())).toBe(false);
    expect(new Date(line.start!).getTime()).toBeLessThan(new Date(line.end).getTime());
    // Moves during a green run always append move records to log.jsonl; the attempt
    // writer must leave the file append-only: earlier bytes identical, new lines
    // parse as move records and carry no attempt fields.
    const logAfter: string | undefined = logBytes(f);
    expect(logAfter).toBeDefined();
    if (logBefore !== undefined) expect(logAfter!.startsWith(logBefore)).toBe(true);
    const freshLines: string[] = logAfter!
      .slice(logBefore?.length ?? 0)
      .trim()
      .split('\n');
    for (const text of freshLines) {
      const move: z.infer<typeof logSchema> = logSchema.parse(JSON.parse(text));
      expect(move.to).toBe('merged');
      expect(JSON.parse(text)).not.toHaveProperty('attempt');
    }
  } finally {
    f.clean();
  }
});

test.serial('a landed candidate reconciles to exactly one merged attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    await command(['git', 'push', 'origin', 'refs/heads/hold:main'], f.root);
    saveState(holder.path, {
      ...readState(holder.path),
      batch: { ...readState(holder.path).batch!, candidate: record.top },
    });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].attempt).toBe(record.attempt);
  } finally {
    f.clean();
  }
});

test.serial('a solo check.fix appends exactly one red attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await soloFixture(f);
    const moved: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a batch check.fix appends exactly one split attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('split');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
  } finally {
    f.clean();
  }
});

test.serial('a refused push restacked to reuse appends exactly one reuse line at the landing push', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const advanced: string = await advanceRemote(f, {
      'issues/open/x/state.yaml': 'x\n',
      'learnings/history/y.md': 'y\n',
    });
    const refused: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(refused.code).toBe(0);
    expect(refused.stdout).toMatch(/^reuse tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    expect(attemptLines(f)).toEqual([]);
    const landed: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(landed.code).toBe(0);
    expect(await remoteTip(f)).not.toBe(advanced);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('reuse');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].built_on).toBe(advanced);
  } finally {
    f.clean();
  }
});

test.serial('an unlanded candidate discards to exactly one red attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b'], true);
    saveState(holder.path, {
      ...readState(holder.path),
      batch: { ...readState(holder.path).batch!, candidate: record.top },
    });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].attempt).toBe(record.attempt);
  } finally {
    f.clean();
  }
});

test.serial('stale-attempt and non-holder phase calls write no attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const stale: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'bogus'],
      f.root,
      herdr.env,
    );
    expect(stale.code).not.toBe(0);
    expect(stale.stderr).toContain('Stale attempt');
    const outsider: Result = await cli(f, ['phase', 'mem-a', 'merged', '--slot', 'B'], f.root, herdr.env);
    expect(outsider.code).not.toBe(0);
    expect(outsider.stderr).toContain('Merge turn refused');
    expect(existsSync(resolve(f.root, 'issues/merge-attempts.jsonl'))).toBe(false);
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});
