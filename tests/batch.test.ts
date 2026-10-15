import { test, expect, afterEach } from 'bun:test';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { fixture, leaf, leafTempRoot, storeDir, yaml, type Fixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, stateSchema, type Leaf, type State } from '../src/state';
import { command, CommandError } from '../src/shell';
import { attemptId, memberBase, buildStack, applyTop, isAncestor } from '../src/batch';

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
  applied: false,
};

test.serial('stateSchema accepts a state with a batch record', () => {
  const parsed: ReturnType<typeof stateSchema.parse> = stateSchema.parse({
    ...baseState,
    batch: { ...record, top: 'sha3', tested_top: 'sha3', candidate: 'sha3' },
  });
  expect(parsed.batch?.attempt).toBe('attempt-1');
  expect(parsed.batch?.top).toBe('sha3');
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
  expect(() => stateSchema.parse({ ...baseState, batch: { built_on: 'x', applied: true } })).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { attempt: 'attempt-1', built_on: 'x', applied: true },
    }),
  ).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { ...record, holder: { base: 'sha0' } },
    }),
  ).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: { ...record, attempt: '' } })).toThrow();
  const withMembers = stateSchema.parse({
    ...baseState,
    batch: {
      ...record,
      members: [{ slug: 'bb', base: 'sha0', head: 'shaB', tip: 'shaB' }],
    },
  });
  expect(withMembers.batch?.members).toHaveLength(1);
  expect(stateSchema.parse({ ...baseState, batch: { ...record, members: [] } }).batch?.members).toEqual([]);
  expect(stateSchema.parse({ ...baseState, batch: record }).batch?.members).toEqual([]);
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { ...record, members: [{ slug: 'bb', base: 'sha0', head: 'shaB' }] },
    }),
  ).toThrow();
  expect(() =>
    stateSchema.parse({
      ...baseState,
      batch: { ...record, members: [{ slug: 'bb', base: 'sha0', head: 'shaB', tip: 'shaB', extra: 1 }] },
    }),
  ).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: { ...record, solo: true } })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: { ...record, excluded: ['bb'] } })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch_limit: 2 })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, batch: record, bogus: 1 })).toThrow();
  expect(() => stateSchema.parse({ ...baseState, solo: 'yes' })).toThrow();
});

test.serial('attemptId returns unique nonempty strings', () => {
  const ids: Set<string> = new Set(Array.from({ length: 100 }, () => attemptId()));
  expect(ids.size).toBe(100);
  for (const id of ids) expect(id.length).toBeGreaterThan(0);
});

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
const originalHome: string | undefined = process.env.HOME;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
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
  const leftovers: string[] = existsSync(storeDir(f))
    ? readdirSync(storeDir(f)).filter((dir) => dir.startsWith('batch-'))
    : [];
  expect(leftovers).toEqual([]);
}

async function batchFixture(): Promise<{ f: Fixture; repo: Repo; builtOn: string }> {
  const f: Fixture = await fixture();
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  yaml(resolve(f.root, 'issues/config.yaml'), {
    checks: { test: 'bun test' },
    grounding: 'none',
    worktree_root: storeDir(f),
  });
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
  process.env.HOME = f.home;
  yaml(resolve(f.root, 'issues/config.yaml'), {
    checks: { test: 'bun test' },
    grounding: 'none',
    worktree_root: storeDir(f),
  });
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
    const holder = await branch(
      f,
      'holder',
      {
        'learnings/LESSONS.md': '- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
        'learnings/history/alpha.md': '# alpha\n\nApplied 2026-10-05 by tests/batch.test.ts: buildStack re-removes\n',
        'file-holder': 'h\n',
      },
      false,
    );
    const result = await buildStack(repo, builtOn, holder.sha);
    if (!result.ok) throw new Error(JSON.stringify(result));
    const rebased: string = await command(['git', 'rev-parse', result.top + '~1'], f.root);
    const tipLessons: string = await command(['git', 'show', rebased + ':learnings/LESSONS.md'], f.root);
    expect(tipLessons).toContain('history/alpha.md');
    expect(tipLessons).toContain('lesson beta');
    expect(tipLessons).toContain('lesson gamma');
    const topLessons: string = await command(['git', 'show', result.top + ':learnings/LESSONS.md'], f.root);
    expect(topLessons.split('\n')).toEqual([
      '- lesson gamma. 2026-09-12. history/gamma.md',
      '- lesson beta. 2026-09-11. [beta](history/beta.md)',
    ]);
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe(
      'lessons: retire applied lines',
    );
    expect(rebased).not.toBe(holder.sha);
    expect(await command(['git', 'rev-list', '--count', result.top], f.root)).toBe('5');
    const shown: string = await command(['git', 'show', '--format=', '--name-only', result.top], f.root);
    expect(shown).toBe('learnings/LESSONS.md');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack keeps a same-stem lesson main added while the retiring holder was in flight', async () => {
  const { f, repo } = await lessonsFixture();
  try {
    const holder = await branch(
      f,
      'holder',
      {
        'learnings/LESSONS.md': '- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
        'learnings/history/alpha.md': '# alpha\n\nApplied 2026-10-05 by tests/batch.test.ts: buildStack same-stem\n',
        'file-holder': 'h\n',
      },
      false,
    );
    const recurrence: string = '- new recurrence. 2026-10-10. history/alpha.md\n';
    writeFileSync(
      resolve(f.root, 'learnings/LESSONS.md'),
      '- lesson alpha. 2026-09-10. history/alpha.md\n- lesson gamma. 2026-09-12. history/gamma.md\n' +
        recurrence +
        '- lesson beta. 2026-09-11. [beta](history/beta.md)\n',
    );
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'recurrence'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const result = await buildStack(repo, builtOn, holder.sha);
    if (!result.ok) throw new Error(JSON.stringify(result));
    const topLessons: string = await command(['git', 'show', result.top + ':learnings/LESSONS.md'], f.root);
    expect(topLessons).toContain('new recurrence. 2026-10-10. history/alpha.md');
    expect(topLessons).toContain('lesson gamma');
    expect(topLessons).toContain('lesson beta');
    expect(topLessons).not.toContain('lesson alpha. 2026-09-10');
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe(
      'lessons: retire applied lines',
    );
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack adds no fixup commit when no retired lesson is resurrected', async () => {
  const { f, repo, builtOn } = await lessonsFixture();
  try {
    const holder = await branch(f, 'holder', { 'file-holder': 'h\n' }, false);
    const result = await buildStack(repo, builtOn, holder.sha);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe('holder');
    expect(await command(['git', 'rev-list', '--count', result.top], f.root)).toBe('4');
    const topLessons: string = await command(['git', 'show', result.top + ':learnings/LESSONS.md'], f.root);
    expect(topLessons).toContain('lesson alpha');
    expect(topLessons).toContain('lesson beta');
    expect(topLessons).toContain('lesson gamma');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack rebases the holder range onto the base and leaves the branch unchanged', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const holder = await branch(f, 'holder', { 'file-h': 'h\n' }, false);
    const result = await buildStack(repo, builtOn, holder.sha);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.top).not.toBe(holder.sha);
    expect(await command(['git', 'show', result.top + ':file-h'], f.root)).toBe('h');
    expect(await command(['git', 'log', '--format=%s', '-1', result.top], f.root)).toBe('holder');
    expect(await command(['git', 'rev-parse', result.top + '~1'], f.root)).toBe(builtOn);
    expect(await command(['git', 'rev-parse', 'holder'], f.root)).toBe(holder.sha);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain('batch-');
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('buildStack refuses a store path under an ancestor holding node_modules', async () => {
  const { f, builtOn } = await batchFixture();
  try {
    const bad: string = resolve(f.home, 'bad');
    mkdirSync(resolve(bad, 'node_modules'), { recursive: true });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      worktree_root: resolve(f.home, 'bad/trees'),
      grounding: 'none',
    });
    const dirty: Repo = readRepo('repo', f.root);
    await expect(buildStack(dirty, builtOn, builtOn)).rejects.toThrow(realpathSync(bad));
    expect(existsSync(resolve(bad, 'trees'))).toBe(false);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain('batch-');
  } finally {
    f.clean();
  }
});

test.serial('a holder already on the base produces the base without a rebase', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    expect(await buildStack(repo, builtOn, builtOn)).toMatchObject({ ok: true, top: builtOn });
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

// The build owner record exists before the copy does, so a build paused
// mid-creation is never taken as a stray by a reconcile pass.
test.serial('buildStack writes its owner record before the copy and removes both in finally', async () => {
  const { f, repo, builtOn } = await batchFixture();
  const originalPath: string | undefined = process.env.PATH;
  try {
    const shimBin: string = resolve(f.home, 'shimbin');
    mkdirSync(shimBin, { recursive: true });
    const gate: string = resolve(f.home, 'release-git');
    const record: string = resolve(f.home, 'record-seen');
    const git: string = await command(['sh', '-c', 'command -v git']);
    writeFileSync(
      resolve(shimBin, 'git'),
      `#!/bin/sh
if [ "$1" = worktree ] && [ "$2" = add ]; then
  copy=""
  for arg do prev="$copy"; copy="$arg"; done
  copy="$prev"
  case "$copy" in */batch-*) :;; *) echo "worktree add target is not a batch copy: $copy" >&2; exit 42;; esac
  if [ ! -f "$copy.owner" ]; then echo 'batch owner record missing at worktree add' >&2; exit 42; fi
  touch '${record}'
  while [ ! -f '${gate}' ]; do sleep 0.01; done
fi
exec '${git}' "$@"
`,
    );
    await command(['chmod', '+x', resolve(shimBin, 'git')]);
    process.env.PATH = `${shimBin}:${originalPath}`;
    const built: Promise<Awaited<ReturnType<typeof buildStack>>> = buildStack(repo, builtOn, builtOn);
    const settled: Promise<Awaited<ReturnType<typeof buildStack>>> = built;
    settled.catch(() => undefined);
    for (let i: number = 0; i < 300 && !existsSync(record); i++) await Bun.sleep(10);
    if (!existsSync(record)) writeFileSync(gate, 'go');
    expect(existsSync(record)).toBe(true);
    const owners: string[] = existsSync(storeDir(f))
      ? readdirSync(storeDir(f)).filter((name) => name.endsWith('.owner'))
      : [];
    expect(owners).toHaveLength(1);
    const owner = JSON.parse(readFileSync(resolve(storeDir(f), owners[0]), 'utf8'));
    expect(owner.pid).toBe(process.pid);
    expect(existsSync(resolve(storeDir(f), owners[0].replace(/\.owner$/, '')))).toBe(false);
    writeFileSync(gate, 'go');
    const result: Awaited<ReturnType<typeof buildStack>> = await settled;
    expect(result.ok).toBe(true);
    expect(readdirSync(storeDir(f)).filter((name) => name.startsWith('batch-'))).toEqual([]);
    noLeftoverWorktrees(f);
  } finally {
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
    f.clean();
  }
});

test.serial('a holder conflict reports failure and leaves the branch unchanged', async () => {
  const { f, repo } = await batchFixture();
  try {
    const holder = await branch(f, 'holder', { file: 'from-holder\n' }, false);
    writeFileSync(resolve(f.root, 'file'), 'from-main\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'main-file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    expect(await buildStack(repo, builtOn, holder.sha)).toEqual({ ok: false });
    expect(await command(['git', 'rev-parse', 'holder'], f.root)).toBe(holder.sha);
    noLeftoverWorktrees(f);
  } finally {
    f.clean();
  }
});

test.serial('applyTop resets a clean worktree to the top and puts a dirty one back at head', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const holder = await branch(f, 'holder', { 'file-h': 'h\n' }, true);
    const leafHolder: Leaf = { path: leaf(f, 'holder', 'merge', { worktree: holder.worktree }), state: null as never };
    leafHolder.state = readState(leafHolder.path);
    const built = await buildStack(repo, builtOn, holder.sha);
    if (!built.ok) throw new Error(JSON.stringify(built));
    expect(await applyTop(repo, leafHolder, built.top, holder.sha)).toBe(true);
    expect(await command(['git', 'rev-parse', 'HEAD'], holder.worktree)).toBe(built.top);
    await command(['git', 'reset', '--keep', holder.sha], holder.worktree);
    writeFileSync(resolve(holder.worktree!, 'file-h'), 'edit\n');
    expect(await applyTop(repo, leafHolder, built.top, holder.sha)).toBe(false);
    expect(await command(['git', 'rev-parse', 'holder'], f.root)).toBe(holder.sha);
    expect(await command(['git', 'show', ':file-h'], holder.worktree)).toBe('h');
    expect(await command(['cat', 'file-h'], holder.worktree)).toBe('edit');
  } finally {
    f.clean();
  }
});

test.serial('isAncestor returns the merge-base verdict and throws on other codes', async () => {
  const { f, repo, builtOn } = await batchFixture();
  try {
    const a = await branch(f, 'holder', { 'file-a': 'a\n' }, false);
    const base: string = await memberBase(repo, builtOn, a.sha);
    expect(await isAncestor(f.root, base, a.sha)).toBe(true);
    expect(await isAncestor(f.root, a.sha, base)).toBe(false);
    expect(await isAncestor(f.root, builtOn, a.sha)).toBe(false);
    await expect(isAncestor(f.root, '0000000000000000000000000000000000000000', builtOn)).rejects.toThrow(CommandError);
  } finally {
    f.clean();
  }
});
