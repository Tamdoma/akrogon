import { test, expect, afterEach } from 'bun:test';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fixture, leaf, leafTempRoot, type Fixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, stateSchema, type Leaf, type State } from '../src/state';
import { command, CommandError } from '../src/shell';
import {
  attemptId,
  memberBase,
  buildStack,
  applyStack,
  restoreMembers,
  isAncestor,
  batchMemberSlugs,
} from '../src/batch';

const baseState: object = {
  slug: 'holder',
  phase: 'merge',
  created: '2026-10-05',
  repo: 'repo',
  debate: 'no',
  'blocked-by': [],
};

const record: object = {
  attempt: 'attempt-1',
  built_on: 'sha0',
  holder: { base: 'sha0', head: 'shaH' },
  members: [{ slug: 'mem-a', base: 'sha0', head: 'sha1', tip: 'sha2' }],
  applied: false,
};

test.serial('stateSchema accepts a state with a batch record carrying solo and excluded', () => {
  const parsed: ReturnType<typeof stateSchema.parse> = stateSchema.parse({
    ...baseState,
    batch: { ...record, top: 'sha3', tested_top: 'sha3', candidate: 'sha3', solo: true, excluded: ['x'] },
  });
  expect(parsed.batch?.attempt).toBe('attempt-1');
  expect(parsed.batch?.members[0].slug).toBe('mem-a');
  expect(parsed.batch?.solo).toBe(true);
  expect(parsed.batch?.excluded).toEqual(['x']);
  const minimal: ReturnType<typeof stateSchema.parse> = stateSchema.parse({ ...baseState, batch: record });
  expect(minimal.batch?.applied).toBe(false);
});

test.serial('readState drops a legacy solo key left in state.yaml', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'legacy', 'merge', { solo: true });
    const state: State = readState(path);
    expect(state.slug).toBe('legacy');
    expect(state).not.toHaveProperty('solo');
  } finally {
    f.clean();
  }
});

test.serial('stateSchema rejects unknown or missing-required batch fields', () => {
  expect(() => stateSchema.parse({ ...baseState, batch: { ...record, extra: 1 } })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: { built_on: 'x', members: [], applied: true } })).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { attempt: 'attempt-1', built_on: 'x', members: [], applied: true },
    }),
  ).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { ...record, holder: { base: 'sha0' } },
    }),
  ).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: { ...record, attempt: '' } })).toThrow();
  expect(() =>
    stateSchema.parse({ ...baseState, batch: { ...record, members: [{ slug: 'm', base: 'b', head: 'h' }] } }),
  ).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { ...record, members: [{ slug: 'm', base: 'b', head: 'h', tip: 't', stray: 1 }] },
    }),
  ).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: record, bogus: 1 })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, solo: 'yes' })).toThrow();
});

test.serial('attemptId returns unique nonempty strings', () => {
  const ids: Set<string> = new Set(Array.from({ length: 100 }, () => attemptId()));
  expect(ids.size).toBe(100);
  for (const id of ids) expect(id.length).toBeGreaterThan(0);
});

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
});

async function branch(
  f: Fixture,
  slug: string,
  edits: Record<string, string>,
  keepWorktree: boolean,
): Promise<{ sha: string; worktree?: string }> {
  const worktree: string = resolve(f.home, 'br-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main~1'], f.root);
  for (const [name, content] of Object.entries(edits)) writeFileSync(resolve(worktree, name), content);
  await command(['git', 'add', '-A'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  const sha: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
  if (!keepWorktree) {
    await command(['git', 'worktree', 'remove', '--force', worktree], f.root);
    return { sha };
  }
  return { sha, worktree };
}

function noLeftoverWorktrees(f: Fixture): void {
  const root: string = leafTempRoot(f);
  const leftovers: string[] = existsSync(root) ? readdirSync(root).filter((dir) => dir.startsWith('batch-')) : [];
  expect(leftovers).toEqual([]);
}

async function batchFixture(): Promise<{ f: Fixture; repo: Repo; builtOn: string }> {
  const f: Fixture = await fixture();
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  writeFileSync(resolve(f.root, 'file-m'), 'm\n');
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'main-advance'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
  return { f, repo, builtOn };
}

async function lessonsFixture(): Promise<{ f: Fixture; repo: Repo; builtOn: string; base: string }> {
  const f: Fixture = await fixture();
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
  mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
  writeFileSync(
    resolve(f.root, 'learnings/LESSONS.md'),
    '- lesson alpha. 2026-09-10. history/alpha.md\n- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
  );
  writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
  writeFileSync(resolve(f.root, 'learnings/history/beta.md'), '# beta\n');
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'lessons'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const base: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
  writeFileSync(
    resolve(f.root, 'learnings/LESSONS.md'),
    '- lesson alpha. 2026-09-10. history/alpha.md\n- lesson gamma. 2026-09-12. history/gamma.md\n- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
  );
  writeFileSync(resolve(f.root, 'learnings/history/gamma.md'), '# gamma\n');
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'gamma'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
  return { f, repo: readRepo('repo', f.root), builtOn, base };
}

test.serial('buildStack re-removes a retired lesson line the union merge resurrects', async () => {
  const { f, repo, builtOn } = await lessonsFixture();
  try {
    const a = await branch(
      f,
      'mem-a',
      {
        'learnings/LESSONS.md': '- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
        'learnings/history/alpha.md': '# alpha\n\nApplied 2026-10-05 by tests/batch.test.ts: buildStack re-removes\n',
        'file-mem-a': 'a\n',
      },
      false,
    );
    const holder = await branch(f, 'holder', { 'file-holder': 'h\n' }, false);
    const result = await buildStack(
      repo,
      builtOn,
      [{ slug: 'mem-a', base: await memberBase(repo, builtOn, a.sha), head: a.sha }],
      holder.sha,
    );
    if (!result.ok) throw new Error(JSON.stringify(result));
    const tipA: string = result.tips.get('mem-a')!;
    const tipLessons: string = await command(['git', 'show', tipA + ':learnings/LESSONS.md'], f.root);
    expect(tipLessons).toContain('history/alpha.md');
    expect(tipLessons).toContain('lesson beta');
    expect(tipLessons).toContain('lesson gamma');
    const topLessons: string = await command(['git', 'show', result.top + ':learnings/LESSONS.md'], f.root);
    expect(topLessons.split('\n')).toEqual([
      '- lesson gamma. 2026-09-12. history/gamma.md',
      '- lesson beta. 2026-09-11. [beta](history/beta.md)',
    ]);
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe('lessons: retire applied lines');
    expect(await command(['git', 'rev-parse', result.top + '~1'], f.root)).not.toBe(tipA);
    expect(await command(['git', 'rev-list', '--count', result.top], f.root)).toBe('6');
    const shown: string = await command(['git', 'show', '--format=', '--name-only', result.top], f.root);
    expect(shown).toBe('learnings/LESSONS.md');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack adds no fixup commit when no retired lesson is resurrected', async () => {
  const { f, repo, builtOn } = await lessonsFixture();
  try {
    const a = await branch(f, 'mem-a', { 'file-mem-a': 'a\n' }, false);
    const holder = await branch(f, 'holder', { 'file-holder': 'h\n' }, false);
    const result = await buildStack(
      repo,
      builtOn,
      [{ slug: 'mem-a', base: await memberBase(repo, builtOn, a.sha), head: a.sha }],
      holder.sha,
    );
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe('holder');
    expect(await command(['git', 'rev-list', '--count', result.top], f.root)).toBe('5');
    const topLessons: string = await command(['git', 'show', result.top + ':learnings/LESSONS.md'], f.root);
    expect(topLessons).toContain('lesson alpha');
    expect(topLessons).toContain('lesson beta');
    expect(topLessons).toContain('lesson gamma');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack rebases member ranges in order then the holder range', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'mem-a', { 'file-a': 'a\n' }, false);
    const c = await branch(f, 'mem-c', { 'file-c': 'c\n' }, false);
    const holder = await branch(f, 'holder', { 'file-h': 'h\n' }, false);
    const items: { slug: string; base: string; head: string }[] = [
      { slug: 'mem-a', base: await memberBase(repo, builtOn, a.sha), head: a.sha },
      { slug: 'mem-c', base: await memberBase(repo, builtOn, c.sha), head: c.sha },
    ];
    const result = await buildStack(repo, builtOn, items, holder.sha);
    if (!result.ok) throw new Error(JSON.stringify(result));
    const tipA: string = result.tips.get('mem-a') ?? '';
    const tipC: string = result.tips.get('mem-c') ?? '';
    expect(tipA).not.toBe('');
    expect(tipA).not.toBe(a.sha);
    expect(await command(['git', 'show', tipA + ':file-a'], f.root)).toBe('a');
    expect(await command(['git', 'show', tipC + ':file-c'], f.root)).toBe('c');
    expect(await command(['git', 'rev-list', '--count', result.top], f.root)).toBe('5');
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe('holder');
    expect(await command(['git', 'rev-parse', result.top + '~1'], f.root)).toBe(tipC);
    expect(await command(['git', 'rev-parse', result.top + '~2'], f.root)).toBe(tipA);
    expect(await command(['git', 'rev-parse', result.top + '~3'], f.root)).toBe(builtOn);
    expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(a.sha);
    expect(await command(['git', 'rev-parse', 'holder'], f.root)).toBe(holder.sha);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain('leaf-temp');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('empty member and holder ranges produce their heads without a rebase', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const c = await branch(f, 'mem-c', { 'file-c': 'c\n' }, false);
    const result = await buildStack(
      repo,
      builtOn,
      [
        { slug: 'mem-empty', base: builtOn, head: builtOn },
        { slug: 'mem-c', base: builtOn, head: c.sha },
      ],
      builtOn,
    );
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.tips.get('mem-empty')).toBe(builtOn);
    expect(result.top).toBe(result.tips.get('mem-c')!);
    expect(await isAncestor(f.root, result.tips.get('mem-c')!, result.top)).toBe(true);
    const holder = await branch(f, 'holder', { 'file-h': 'h\n' }, false);
    const emptyLast = await buildStack(
      repo,
      builtOn,
      [
        { slug: 'mem-c', base: builtOn, head: c.sha },
        { slug: 'mem-empty', base: builtOn, head: builtOn },
      ],
      holder.sha,
    );
    if (!emptyLast.ok) throw new Error(JSON.stringify(emptyLast));
    expect(await isAncestor(f.root, emptyLast.tips.get('mem-c')!, emptyLast.top)).toBe(true);
    expect(emptyLast.tips.get('mem-empty')).toBe(emptyLast.tips.get('mem-c'));
    const withHolder = await buildStack(
      repo,
      builtOn,
      [
        { slug: 'mem-empty', base: builtOn, head: builtOn },
        { slug: 'mem-c', base: builtOn, head: c.sha },
      ],
      holder.sha,
    );
    if (!withHolder.ok) throw new Error(JSON.stringify(withHolder));
    expect(withHolder.tips.get('mem-c')).not.toBe(builtOn);
    expect(await command(['git', 'rev-parse', withHolder.top + '~2'], f.root)).toBe(builtOn);
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('a member conflict reports the slug and leaves no live branch changed', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'mem-a', { file: 'from-a\n' }, false);
    const b = await branch(f, 'mem-b', { file: 'from-b\n' }, false);
    const result = await buildStack(
      repo,
      builtOn,
      [
        { slug: 'mem-a', base: builtOn, head: a.sha },
        { slug: 'mem-b', base: builtOn, head: b.sha },
      ],
      builtOn,
    );
    expect(result).toEqual({ ok: false, conflict: 'mem-b' });
    expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(a.sha);
    expect(await command(['git', 'rev-parse', 'mem-b'], f.root)).toBe(b.sha);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain('leaf-temp');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('a holder conflict reports the holder and leaves member branches unchanged', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'mem-a', { file: 'from-a\n' }, false);
    const holder = await branch(f, 'holder', { file: 'from-holder\n' }, false);
    const result = await buildStack(repo, builtOn, [{ slug: 'mem-a', base: builtOn, head: a.sha }], holder.sha);
    expect(result).toEqual({ ok: false, conflict: holder.sha });
    expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(a.sha);
    expect(await command(['git', 'rev-parse', 'holder'], f.root)).toBe(holder.sha);
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('applyStack resets worktrees and bare branches, restoreMembers reverts both', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'mem-a', { 'file-a': 'a\n' }, true);
    const b = await branch(f, 'mem-b', { 'file-b': 'b\n' }, false);
    const holder = await branch(f, 'holder', { 'file-h': 'h\n' }, true);
    const leafA: Leaf = { path: leaf(f, 'mem-a', 'merge', { worktree: a.worktree }), state: null as never };
    const leafB: Leaf = { path: leaf(f, 'mem-b', 'merge'), state: null as never };
    const leafHolder: Leaf = { path: leaf(f, 'holder', 'merge', { worktree: holder.worktree }), state: null as never };
    leafA.state = readState(leafA.path);
    leafB.state = readState(leafB.path);
    leafHolder.state = readState(leafHolder.path);
    const built = await buildStack(
      repo,
      builtOn,
      [
        { slug: 'mem-a', base: builtOn, head: a.sha },
        { slug: 'mem-b', base: builtOn, head: b.sha },
      ],
      holder.sha,
    );
    if (!built.ok) throw new Error(JSON.stringify(built));
    const tipA: string = built.tips.get('mem-a') ?? '';
    const tipB: string = built.tips.get('mem-b') ?? '';
    await applyStack(
      repo,
      built.top,
      [
        { slug: 'mem-a', tip: tipA, leaf: leafA },
        { slug: 'mem-b', tip: tipB, leaf: leafB },
      ],
      leafHolder,
    );
    expect(await command(['git', 'rev-parse', 'HEAD'], a.worktree)).toBe(tipA);
    expect(await command(['git', 'rev-parse', 'mem-a'], f.root)).toBe(tipA);
    expect(await command(['git', 'rev-parse', 'mem-b'], f.root)).toBe(tipB);
    expect(await command(['git', 'rev-parse', 'HEAD'], holder.worktree)).toBe(built.top);
    await restoreMembers(repo, [
      { slug: 'mem-a', head: a.sha, leaf: leafA },
      { slug: 'mem-b', head: b.sha, leaf: leafB },
    ]);
    expect(await command(['git', 'rev-parse', 'HEAD'], a.worktree)).toBe(a.sha);
    expect(await command(['git', 'rev-parse', 'mem-b'], f.root)).toBe(b.sha);
    await applyStack(repo, built.top, [{ slug: 'mem-b', tip: tipB }], leafHolder);
    expect(await command(['git', 'rev-parse', 'mem-b'], f.root)).toBe(tipB);
    await restoreMembers(repo, [{ slug: 'mem-b', head: b.sha }]);
    expect(await command(['git', 'rev-parse', 'mem-b'], f.root)).toBe(b.sha);
  } finally {
    f.clean();
  }
});

test.serial('isAncestor returns the merge-base verdict and throws on other codes', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'mem-a', { 'file-a': 'a\n' }, false);
    const base: string = await memberBase(repo, builtOn, a.sha);
    expect(await isAncestor(f.root, base, a.sha)).toBe(true);
    expect(await isAncestor(f.root, a.sha, base)).toBe(false);
    expect(await isAncestor(f.root, builtOn, a.sha)).toBe(false);
    await expect(isAncestor(f.root, '0000000000000000000000000000000000000000', builtOn)).rejects.toThrow(CommandError);
  } finally {
    f.clean();
  }
});

test.serial('batchMemberSlugs returns member slugs across every leaf carrying a batch record', async () => {
  const { f, repo } = await batchFixture();
  try {
    leaf(f, 'holder-one', 'merge', {
      batch: {
        attempt: 'a1',
        built_on: 'b',
        holder: { base: 'b', head: 'h' },
        members: [
          { slug: 'm1', base: 'b', head: 'h', tip: 't' },
          { slug: 'm2', base: 'b', head: 'h', tip: 't' },
        ],
        applied: false,
      },
    });
    leaf(
      f,
      'holder-two',
      'merge',
      {
        batch: {
          attempt: 'a2',
          built_on: 'b',
          holder: { base: 'b', head: 'h' },
          members: [{ slug: 'm1', base: 'b', head: 'h', tip: 't' }],
          applied: true,
        },
      },
      'epic/part',
    );
    leaf(f, 'plain', 'merge');
    expect(await batchMemberSlugs(repo)).toEqual(new Set(['m1', 'm2']));
  } finally {
    f.clean();
  }
});
