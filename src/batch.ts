import { existsSync, mkdirSync, readdirSync, rmdirSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { worktreeStore, type GlobalConfig, type Repo } from './config';
import { type BatchMember, type Leaf } from './state';
import { command, run, CommandError, type Result } from './shell';
import { removeRetiredLessons } from './lessons';
import { createSparseWorktree } from './next';
import { mergeQueue } from './turn';
import { readLog } from './log';
import { redMemberHeads } from './attempts';
import { writeOwner } from './reconcile';

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

export async function branchSha(repo: Repo, slug: string): Promise<string | undefined> {
  const result: Result = await run(
    ['git', 'rev-parse', '--verify', '--quiet', `refs/heads/${slug}^{commit}`],
    repo.root,
  );
  if (result.code === 0) return result.stdout;
  if (result.code === 1) return undefined;
  throw new CommandError(['git', 'rev-parse', `refs/heads/${slug}^{commit}`], repo.root, result);
}

// The waiting leaves behind the holder, minus heads already red on this base.
export async function pickMembers(
  repo: Repo,
  global: GlobalConfig,
  leaves: Leaf[],
  builtOn: string,
): Promise<BatchMember[]> {
  const red: Set<string> = redMemberHeads(repo, builtOn);
  const members: BatchMember[] = [];
  for (const candidate of mergeQueue(global, leaves, () => readLog(repo.root)).slice(1)) {
    const slug: string = candidate.leaf.state.slug;
    const sha: string | undefined = await branchSha(repo, slug);
    const head: string = sha ?? builtOn;
    if (red.has(head)) continue;
    members.push({
      slug,
      base: sha === undefined || head === builtOn ? head : await memberBase(repo, builtOn, head),
      head,
      tip: head,
    });
  }
  return members;
}

export type StackResult = { ok: true; top: string; tips: Map<string, string> } | { ok: false };

export async function buildStack(
  repo: Repo,
  builtOn: string,
  holderHead: string,
  members: { slug: string; base: string; head: string }[] = [],
  retirementHead: string = holderHead,
): Promise<StackResult> {
  const dir: string = resolve(worktreeStore(repo), 'batch-' + attemptId());
  const owner: string = `${dir}.owner`;
  mkdirSync(dirname(dir), { recursive: true });
  writeOwner(owner);
  try {
    await createSparseWorktree(repo, dir, builtOn, { detach: true });
    let tip: string = builtOn;
    if (!(await isAncestor(dir, holderHead, tip))) {
      const held: Result = await run(['git', 'rebase', '--onto', tip, tip, holderHead], dir);
      if (held.code !== 0) {
        await command(['git', 'rebase', '--abort'], dir);
        return { ok: false };
      }
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
    }
    const tips: Map<string, string> = new Map();
    const stacked: { slug: string; base: string; head: string }[] = [];
    for (const member of members) {
      if (await isAncestor(dir, member.head, tip)) {
        tips.set(member.slug, tip);
        stacked.push(member);
        continue;
      }
      const rebased: Result = await run(['git', 'rebase', '--onto', tip, member.base, member.head], dir);
      if (rebased.code !== 0) {
        await run(['git', 'rebase', '--abort'], dir);
        continue;
      }
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
      tips.set(member.slug, tip);
      stacked.push(member);
    }
    const removed: string[] = await removeRetiredLessons(dir, builtOn, 'HEAD', [
      ...stacked.map((member) => ({ base: member.base, head: member.head })),
      { base: await memberBase(repo, builtOn, retirementHead), head: retirementHead },
    ]);
    if (removed.length > 0) {
      await command(['git', 'add', 'learnings/LESSONS.md'], dir);
      await command(['git', 'commit', '-m', 'lessons: retire applied lines'], dir);
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
    }
    return { ok: true, top: tip, tips };
  } finally {
    await command(['git', 'worktree', 'remove', '--force', dir], repo.root);
    rmSync(owner, { force: true });
  }
}

export type MoveResult = { moved: 'worktree' | 'ref' | 'dirty-ref' };

export async function move(repo: Repo, slug: string, target: string, leaf: Leaf): Promise<MoveResult> {
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
