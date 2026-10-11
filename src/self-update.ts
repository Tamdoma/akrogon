import { existsSync, mkdirSync, realpathSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { leafTemp, toolRoot, worktreeStore, type Repo } from './config';
import { applySkillLinks, planSkillLinks, type Link } from './install';
import { eligibleRecord, integrate } from './sync';
import { command, run, CommandError, type Result } from './shell';
import { withLock } from './state';

function errorLine(result: Result): string {
  return (result.stderr !== '' ? result.stderr : result.stdout).replaceAll('\n', ' ');
}

function describeError(error: unknown): string {
  return errorLine(
    error instanceof CommandError
      ? error.result
      : { code: 1, stdout: '', stderr: error instanceof Error ? error.message : String(error) },
  );
}

function paths(output: string): string[] {
  return output.split('\0').filter((path: string) => path !== '');
}

type GitResult =
  | { kind: 'failed'; line: string }
  | { kind: 'skipped'; skip: string }
  | { kind: 'done'; pushed: string | null; incoming: string };

async function gitStage(repo: Repo, target: string, lag: () => Promise<string>): Promise<GitResult> {
  const root: string = repo.root;
  const fetched: Result = await run(['git', 'fetch', repo.config.remote, repo.config.default_branch], root);
  if (fetched.code !== 0)
    return { kind: 'failed', line: `fetch failed: ${errorLine(fetched)}; ${await lag()}; retried at the next trigger` };
  const symbolic: Result = await run(['git', 'symbolic-ref', '--short', 'HEAD'], root);
  if (symbolic.code !== 0) return { kind: 'skipped', skip: `detached HEAD; ${await lag()}` };
  if (symbolic.stdout !== repo.config.default_branch)
    return { kind: 'skipped', skip: `on ${symbolic.stdout}, not ${repo.config.default_branch}; ${await lag()}` };
  const local: string = await command(['git', 'rev-parse', 'HEAD'], root);
  const scratch: string = leafTemp(repo, 'self-update');
  const store: string = worktreeStore(repo);
  const skipAhead = async (incoming: string): Promise<string> => {
    const counts: string[] = (
      await command(['git', 'rev-list', '--left-right', '--count', `HEAD...${incoming}`], root)
    ).split('\t');
    return `${counts[1] === '0' ? 'ahead of' : 'diverged from'} ${target}; ${counts[1]} behind ${target}; run akrogon sync`;
  };
  const integrated: { pushed: string | null; incoming: string; skip: string | null } = await integrate(
    repo,
    {
      pre: async (incoming: string): Promise<string | null> => {
        const commits: string[] = (await command(['git', 'rev-list', '--parents', `${incoming}..HEAD`], root))
          .split('\n')
          .filter((line: string) => line !== '');
        for (const commit of commits) {
          const shas: string[] = commit.split(' ');
          if (shas.length !== 2) return await skipAhead(incoming);
          const changed: string[] = paths(
            await command(
              ['git', 'diff-tree', '--no-commit-id', '--name-only', '--no-renames', '-r', '-z', shas[0]],
              root,
            ),
          );
          if (changed.some((path: string) => !eligibleRecord(root, store, path))) return await skipAhead(incoming);
        }
        return null;
      },
    },
    async (incoming: string) => {
      const ahead: number = Number(await command(['git', 'rev-list', '--count', `${incoming}..HEAD`], root));
      if (ahead === 0) return { tip: null };
      rmSync(scratch, { recursive: true, force: true });
      await command(['git', 'worktree', 'prune'], root);
      try {
        mkdirSync(dirname(scratch), { recursive: true });
        await command(['git', 'worktree', 'add', '--detach', scratch, incoming], root);
        const rebaseArgs: string[] = ['git', 'rebase', incoming, local];
        const rebased: Result = await run(rebaseArgs, scratch);
        if (rebased.code !== 0) {
          const unmerged: string[] = paths(
            (await run(['git', 'diff', '--name-only', '--diff-filter=U', '-z'], scratch)).stdout,
          );
          if (unmerged.length === 0) throw new CommandError(rebaseArgs, scratch, rebased);
          await run(['git', 'rebase', '--abort'], scratch);
          return { conflict: { paths: unmerged } };
        }
        const tip: string = await command(['git', 'rev-parse', 'HEAD'], scratch);
        return tip === incoming ? { tip: null } : { tip };
      } finally {
        await run(['git', 'worktree', 'remove', '--force', scratch], root);
        rmSync(scratch, { recursive: true, force: true });
        await command(['git', 'worktree', 'prune'], root);
      }
    },
  );
  if (integrated.skip !== null) return { kind: 'skipped', skip: integrated.skip };
  return { kind: 'done', pushed: integrated.pushed, incoming: integrated.incoming };
}

type Move = { state: 'none' } | { state: 'moved'; old: string } | { state: 'pending'; detail: string };

async function ignoredAt(repo: Repo, ref: string, candidates: string[]): Promise<string[]> {
  if (candidates.length === 0) return [];
  const root: string = repo.root;
  const probe: string = leafTemp(repo, 'self-update');
  rmSync(probe, { recursive: true, force: true });
  await command(['git', 'worktree', 'prune'], root);
  try {
    mkdirSync(dirname(probe), { recursive: true });
    await command(['git', 'worktree', 'add', '--detach', probe, ref], root);
    const ignored: string[] = [];
    for (const path of candidates)
      if ((await run(['git', 'check-ignore', '--no-index', '-q', '--', path], probe)).code === 0) ignored.push(path);
    return ignored;
  } finally {
    await run(['git', 'worktree', 'remove', '--force', probe], root);
    rmSync(probe, { recursive: true, force: true });
    await command(['git', 'worktree', 'prune'], root);
  }
}

async function moveCheckout(repo: Repo, moveTo: string, dropLocal: boolean): Promise<Move> {
  const root: string = repo.root;
  const behind: string = await command(['git', 'rev-list', '--count', `HEAD..${moveTo}`], root);
  if (behind === '0') return { state: 'none' };
  const head: string = await command(['git', 'rev-parse', 'HEAD'], root);
  const refused: Result = await run(['git', 'reset', '--keep', moveTo], root);
  if (refused.code === 0) return { state: 'moved', old: head };
  const changed: Set<string> = new Set(paths(await command(['git', 'diff', '--name-only', '-z', head, moveTo], root)));
  const staged: Set<string> = new Set(paths(await command(['git', 'diff', '--cached', '--name-only', '-z'], root)));
  const untracked: Set<string> = new Set(
    paths(await command(['git', 'ls-files', '--others', '--exclude-standard', '-z'], root)),
  );
  const blocked: Set<string> = new Set([
    ...paths(await command(['git', 'diff', '--name-only', '-z'], root)),
    ...untracked,
  ]);
  const colliding: string[] = [...changed].filter((path: string) => blocked.has(path) || staged.has(path));
  const ignoredColliders: string[] = await ignoredAt(
    repo,
    moveTo,
    colliding.filter((path: string) => untracked.has(path)),
  );
  if (ignoredColliders.length > 0)
    throw new Error(`Cannot sync over ignored operator paths:\n${ignoredColliders.join('\n')}`);
  const mismatched: string[] = [];
  for (const path of colliding) {
    const have: Result = await run(['git', 'hash-object', '--', path], root);
    const want: Result = await run(['git', 'rev-parse', `${moveTo}:${path}`], root);
    if (staged.has(path) || have.code !== 0 || want.code !== 0 || have.stdout !== want.stdout) mismatched.push(path);
  }
  if (mismatched.length === 0) {
    // reset --keep refuses on stat alone even when the worktree already carries the
    // target bytes: adopt the tree without rewriting the worktree, then restore
    // only the paths the move itself deletes (absent at the old head).
    await command(['git', 'reset', '--quiet', moveTo], root);
    const missing: string[] = paths(await command(['git', 'ls-files', '--deleted', '-z'], root));
    const dropped: string[] = [];
    for (const path of missing)
      if ((await run(['git', 'cat-file', '-e', `${head}:${path}`], root)).code !== 0) dropped.push(path);
    if (dropped.length > 0) await command(['git', '--literal-pathspecs', 'checkout', '--', ...dropped], root);
    return { state: 'moved', old: head };
  }
  if (dropLocal) {
    const base: string = await command(['git', 'merge-base', head, moveTo], root);
    if (base !== head) await run(['git', 'reset', '--keep', base], root);
  }
  return { state: 'pending', detail: errorLine(refused) };
}

async function installStage(root: string, ownRoot: string, home: string): Promise<string | null> {
  const installed: Result = await run([process.execPath, 'install', '--frozen-lockfile'], root);
  if (installed.code !== 0) return `install failed: ${errorLine(installed)}`;
  try {
    const planned: { links: Link[]; conflicts: Link[] } = planSkillLinks(home, ownRoot);
    const blocked: Set<string> = new Set(planned.conflicts.map((link: Link) => link.destination));
    applySkillLinks(planned.links.filter((link: Link) => !blocked.has(link.destination)));
    if (planned.conflicts.length > 0)
      return `links failed: ${planned.conflicts.map((link: Link) => link.destination).join(', ')}; remove the conflicting paths`;
  } catch (error) {
    return `links failed: ${describeError(error)}`;
  }
  return null;
}

export async function selfUpdate(repo: Repo, ownRoot: string = toolRoot, home: string = homedir()): Promise<void> {
  try {
    const root: string = repo.root;
    const own: boolean = realpathSync(root) === (existsSync(ownRoot) ? realpathSync(ownRoot) : resolve(ownRoot));
    const target: string = `${repo.config.remote}/${repo.config.default_branch}`;
    const lag = async (): Promise<string> => {
      const result: Result = await run(['git', 'rev-list', '--left-right', '--count', `HEAD...${target}`], root);
      if (result.code !== 0) return `unknown behind ${target}`;
      const behind: string = result.stdout.split('\t')[1];
      return `${behind} behind ${target}`;
    };
    const body = async (): Promise<string | null> => {
      const git: GitResult = await gitStage(repo, target, lag);
      if (git.kind === 'failed') return git.line;
      // Other checkouts only move after a push of their own record commits:
      // pulling remote changes into a repo akrogon does not own is not this
      // path's job (and remote record shapes must not reach discover here).
      const move: Move =
        git.kind === 'done' && (own || git.pushed !== null)
          ? await moveCheckout(repo, git.pushed ?? git.incoming, git.pushed !== null)
          : { state: 'none' };
      const failure: string | null = own ? await installStage(root, ownRoot, home) : null;
      if (git.kind === 'skipped') return `self-update skipped: ${git.skip}`;
      if (failure !== null) return `${failure}; ${await lag()}; retried at the next trigger`;
      const outcome: string[] =
        git.kind !== 'done' || git.pushed === null
          ? []
          : [
              `pushed ${await command(['git', 'rev-list', '--count', `${git.incoming}..${git.pushed}`], root)} record commit(s) to ${target}`,
            ];
      if (move.state === 'moved') {
        const head: string = (await command(['git', 'rev-parse', 'HEAD'], root)).slice(0, 12);
        return [...outcome, `deployed ${move.old.slice(0, 12)}..${head}`].join('; ');
      }
      if (move.state === 'pending')
        return [
          ...outcome,
          `checkout pending: ${move.detail}; ${await lag()}; commit or finish the overlapping edit`,
        ].join('; ');
      if (!own && outcome.length === 0) return null;
      const head: string = (await command(['git', 'rev-parse', 'HEAD'], root)).slice(0, 12);
      return [...outcome, `current ${head}`].join('; ');
    };
    const line: string | null = own
      ? await withLock(
          resolve(root, await command(['git', 'rev-parse', '--git-path', 'akrogon-install.lock'], root)),
          body,
        )
      : await body();
    if (line !== null) console.log(line);
  } catch (error) {
    console.log(`self-update failed: ${describeError(error)}`);
  }
}
