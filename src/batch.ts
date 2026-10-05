import { randomUUID } from 'node:crypto';
import { leafTemp, type Repo } from './config';
import { allLeaves, type Leaf } from './state';
import { command, run, CommandError, type Result } from './shell';

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

export async function batchMemberSlugs(repo: Repo): Promise<Set<string>> {
  return new Set(allLeaves(repo).flatMap((leaf) => (leaf.state.batch?.members ?? []).map((member) => member.slug)));
}

export async function buildStack(
  repo: Repo,
  builtOn: string,
  items: { slug: string; base: string; head: string }[],
  holderHead: string,
): Promise<{ ok: true; tips: Map<string, string>; top: string } | { ok: false; conflict: string }> {
  const dir: string = leafTemp(repo, 'batch-' + attemptId());
  await command(['git', 'worktree', 'add', '--detach', dir, builtOn], repo.root);
  try {
    let tip: string = builtOn;
    const tips: Map<string, string> = new Map();
    for (const item of items) {
      if (item.base === item.head) {
        tip = item.head;
        tips.set(item.slug, tip);
        continue;
      }
      const result: Result = await run(['git', 'rebase', '--onto', tip, item.base, item.head], dir);
      if (result.code !== 0) {
        await command(['git', 'rebase', '--abort'], dir);
        return { ok: false, conflict: item.slug };
      }
      tip = await command(['git', 'rev-parse', 'HEAD'], dir);
      tips.set(item.slug, tip);
    }
    if (await isAncestor(dir, holderHead, tip)) return { ok: true, tips, top: holderHead };
    const held: Result = await run(['git', 'rebase', '--onto', tip, tip, holderHead], dir);
    if (held.code !== 0) {
      await command(['git', 'rebase', '--abort'], dir);
      return { ok: false, conflict: holderHead };
    }
    return { ok: true, tips, top: await command(['git', 'rev-parse', 'HEAD'], dir) };
  } finally {
    await command(['git', 'worktree', 'remove', '--force', dir], repo.root);
  }
}

async function move(repo: Repo, slug: string, target: string, leaf?: Leaf): Promise<void> {
  if (leaf?.state.worktree !== undefined) await command(['git', '-C', leaf.state.worktree, 'reset', '--hard', target]);
  else await command(['git', 'update-ref', 'refs/heads/' + slug, target], repo.root);
}

export async function applyStack(
  repo: Repo,
  top: string,
  members: { slug: string; tip: string; leaf?: Leaf }[],
  holder: Leaf,
): Promise<void> {
  for (const member of members) await move(repo, member.slug, member.tip, member.leaf);
  await move(repo, holder.state.slug, top, holder);
}

export async function restoreMembers(
  repo: Repo,
  members: { slug: string; head: string; leaf?: Leaf }[],
): Promise<void> {
  for (const member of members) await move(repo, member.slug, member.head, member.leaf);
}
