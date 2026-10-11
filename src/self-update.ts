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
  { kind: 'skipped'; skip: string } | { kind: 'done'; pushed: string | null; incoming: string; move: Move };

async function gitStage(repo: Repo, target: string, lag: () => Promise<string>): Promise<GitResult> {
  const root: string = repo.root;
  const symbolic: Result = await run(['git', 'symbolic-ref', '--short', 'HEAD'], root);
  if (symbolic.code !== 0 || symbolic.stdout !== repo.config.default_branch) {
    // The pass's single fetch (integrate's) is unreachable from here; refresh
    // the tracking ref so the skip line reports a current lag.
    await command(['git', 'fetch', repo.config.remote, repo.config.default_branch], root);
    return {
      kind: 'skipped',
      skip:
        symbolic.code !== 0
          ? `detached HEAD; ${await lag()}`
          : `on ${symbolic.stdout}, not ${repo.config.default_branch}; ${await lag()}`,
    };
  }
  const local: string = await command(['git', 'rev-parse', 'HEAD'], root);
  const tracking: Result = await run(
    ['git', 'rev-parse', '--verify', '--quiet', `refs/remotes/${target}^{commit}`],
    root,
  );
  // No tracking ref means no remote state to sync against; the preflight C3
  // refusal owns that repair path, so leave the ref absent instead of healing.
  if (tracking.code !== 0) return { kind: 'done', pushed: null, incoming: local, move: { state: 'none' } };
  const fetched: Result = await run(['git', 'fetch', repo.config.remote, repo.config.default_branch], root);
  if (fetched.code !== 0)
    throw new CommandError(['git', 'fetch', repo.config.remote, repo.config.default_branch], root, fetched);
  const counts: string[] = (
    await command(['git', 'rev-list', '--left-right', '--count', 'HEAD...FETCH_HEAD^{commit}'], root)
  ).split('\t');
  // An up-to-date checkout needs no integration and must not take the global
  // lock: serializing unrelated commands behind a held .lock is not its job.
  if (counts[0] === '0' && counts[1] === '0')
    return { kind: 'done', pushed: null, incoming: local, move: { state: 'none' } };
  const scratch: string = leafTemp(repo, 'self-update');
  const store: string = worktreeStore(repo);
  const skipAhead = async (incoming: string): Promise<string> => {
    const counts: string[] = (
      await command(['git', 'rev-list', '--left-right', '--count', `HEAD...${incoming}`], root)
    ).split('\t');
    return `${counts[1] === '0' ? 'ahead of' : 'diverged from'} ${target}; ${counts[1]} behind ${target}; run akrogon sync`;
  };
  let move: Move = { state: 'none' };
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
          if (changed.length === 0 || changed.some((path: string) => !eligibleRecord(root, store, path)))
            return await skipAhead(incoming);
        }
        return null;
      },
      after: async (pushed: string | null, incoming: string): Promise<void> => {
        move = await moveCheckout(repo, pushed ?? incoming);
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
  return { kind: 'done', pushed: integrated.pushed, incoming: integrated.incoming, move };
}

type Move = { state: 'none' } | { state: 'moved'; old: string } | { state: 'pending'; detail: string };

async function moveCheckout(repo: Repo, moveTo: string): Promise<Move> {
  const root: string = repo.root;
  const behind: string = await command(['git', 'rev-list', '--count', `HEAD..${moveTo}`], root);
  if (behind === '0') return { state: 'none' };
  const head: string = await command(['git', 'rev-parse', 'HEAD'], root);
  const refused: Result = await run(['git', 'reset', '--keep', moveTo], root);
  if (refused.code === 0) return { state: 'moved', old: head };
  // keep refuses when a colliding path is dirty even if it already carries the
  // target bytes; adopt the index tree when every collider is content-equal.
  const changed: Set<string> = new Set(paths(await command(['git', 'diff', '--name-only', '-z', head, moveTo], root)));
  const dirty: Set<string> = new Set([
    ...paths(await command(['git', 'diff', '--name-only', '-z'], root)),
    ...paths(await command(['git', 'ls-files', '--others', '--exclude-standard', '-z'], root)),
  ]);
  const colliding: string[] = [...changed].filter((path: string) => dirty.has(path));
  const staged: string = await command(['git', 'diff', '--cached', '--name-only'], root);
  let equal: boolean = staged === '';
  for (const path of colliding) {
    if (!equal) break;
    const have: Result = await run(['git', 'hash-object', '--', path], root);
    const want: Result = await run(['git', 'rev-parse', `${moveTo}:${path}`], root);
    if (have.code !== 0 || want.code !== 0 || have.stdout !== want.stdout) equal = false;
  }
  if (equal && colliding.length > 0) {
    await command(['git', 'reset', '--mixed', moveTo], root);
    return { state: 'moved', old: head };
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
      let git: GitResult;
      try {
        git = await gitStage(repo, target, lag);
      } catch (error) {
        if (error instanceof CommandError && (error.argv[1] === 'fetch' || error.argv[1] === 'push'))
          return `${error.argv[1]} failed: ${errorLine(error.result)}; ${await lag()}; retried at the next trigger`;
        if (error instanceof Error && error.message.startsWith('record conflict:')) return error.message;
        throw error;
      }
      const move: Move = git.kind === 'done' ? git.move : { state: 'none' };
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
