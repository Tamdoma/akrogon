import { existsSync, readdirSync, rmdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { worktreeStore, type Repo } from './config';
import { type Leaf } from './state';
import { command, run, CommandError, type Result } from './shell';
import { removeRetiredLessons } from './lessons';
import { createSparseWorktree } from './next';

export async function removeEmptyUntrackedDirs(worktree: string): Promise<void> {
  const present: string = await command(['git', 'ls-files', '-c', '-z'], worktree);
  const files: Set<string> = new Set(present.split('\0').filter((path) => path !== ''));
  const dirs: string[] = [];
  const keep: Set<string> = new Set();
  function keepDir(rel: string): void {
    let kept: string = rel;
    while (kept !== '.' && kept !== '') {
      keep.add(kept);
      kept = dirname(kept);
    }
  }
  async function walk(path: string, rel: string): Promise<void> {
    const children: string[] = [];
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const entryRel: string = rel === '' ? entry.name : rel + sep + entry.name;
      if (entry.isDirectory() && entry.name !== '.git' && !files.has(entryRel)) {
        children.push(entryRel);
      } else {
        keepDir(rel);
      }
    }
    if (children.length === 0) return;
    const ignored: Result = await run(
      ['git', 'check-ignore', '-z', '--stdin'],
      worktree,
      undefined,
      children.join('\0'),
    );
    if (ignored.code !== 0 && ignored.code !== 1)
      throw new CommandError(['git', 'check-ignore', '-z', '--stdin'], worktree, ignored);
    const ignoredDirs: Set<string> = new Set(ignored.stdout.split('\0'));
    for (const child of children) {
      if (ignoredDirs.has(child)) keepDir(child);
      else {
        dirs.push(child);
        await walk(resolve(worktree, child), child);
      }
    }
  }
  await walk(worktree, '');
  for (const rel of dirs.toReversed()) if (!keep.has(rel)) rmdirSync(resolve(worktree, rel));
}

export function attemptId(): string {
  return randomUUID();
}

export async function memberBase(repo: Repo, builtOn: string, head: string): Promise<string> {
  return command(['git', 'merge-base', builtOn, head], repo.root);
}

export async function isAncestor(cwd: string, a: string, b: string): Promise<boolean> {
  const result: Result = await run(['git', 'merge-base', '--is-ancestor', a, b], cwd);
  if (result.code === 0) return true;
  if (result.code === 1) return false;
  throw new CommandError(['git', 'merge-base', '--is-ancestor', a, b], cwd, result);
}

export async function buildStack(
  repo: Repo,
  builtOn: string,
  holderHead: string,
  retirementHead: string = holderHead,
): Promise<{ ok: true; top: string } | { ok: false }> {
  const dir: string = resolve(worktreeStore(repo), 'batch-' + attemptId());
  await createSparseWorktree(repo, dir, builtOn, { detach: true });
  try {
    let tip: string = builtOn;
    if (!(await isAncestor(dir, holderHead, tip))) {
      const held: Result = await run(['git', 'rebase', '--onto', tip, tip, holderHead], dir);
      if (held.code !== 0) {
        await command(['git', 'rebase', '--abort'], dir);
        return { ok: false };
      }
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
    }
    const removed: string[] = await removeRetiredLessons(dir, builtOn, 'HEAD', [
      { base: await memberBase(repo, builtOn, retirementHead), head: retirementHead },
    ]);
    if (removed.length > 0) {
      await command(['git', 'add', 'learnings/LESSONS.md'], dir);
      await command(['git', 'commit', '-m', 'lessons: retire applied lines'], dir);
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
    }
    return { ok: true, top: tip };
  } finally {
    await command(['git', 'worktree', 'remove', '--force', dir], repo.root);
  }
}

export type MoveResult = { moved: 'worktree' | 'ref' | 'dirty-ref' };

async function move(repo: Repo, slug: string, target: string, leaf: Leaf): Promise<MoveResult> {
  if (leaf.state.worktree !== undefined && existsSync(leaf.state.worktree)) {
    const status: string = await command(['git', '-C', leaf.state.worktree, 'status', '--porcelain'], repo.root);
    if (status !== '') {
      await command(['git', 'update-ref', 'refs/heads/' + slug, target], repo.root);
      return { moved: 'dirty-ref' };
    }
    await command(['git', '-C', leaf.state.worktree, 'reset', '--keep', target], repo.root);
    const remaining: string = await command(['git', '-C', leaf.state.worktree, 'status', '--porcelain'], repo.root);
    return { moved: remaining === '' ? 'worktree' : 'dirty-ref' };
  }
  await command(['git', 'update-ref', 'refs/heads/' + slug, target], repo.root);
  return { moved: 'ref' };
}

// Moves the holder branch to the built top; a dirty worktree puts the branch back at head.
export async function applyTop(repo: Repo, leaf: Leaf, top: string, head: string): Promise<boolean> {
  if ((await move(repo, leaf.state.slug, top, leaf)).moved !== 'dirty-ref') return true;
  await move(repo, leaf.state.slug, head, leaf);
  return false;
}
