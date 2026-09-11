import { basename, relative, resolve } from 'node:path';
import { expandPath, globalHome, readGlobal, requireRepo, within, type GlobalConfig, type Repo } from './config';
import { CommandError, command, run, type Result } from './shell';
import { withLock, withRepoLock } from './state';

export async function syncCommand(cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  await withLock(resolve(globalHome(), '.lock'), () =>
    withRepoLock(repo, async () => {
      const branchArgs: string[] = ['git', 'symbolic-ref', '--quiet', '--short', 'HEAD'];
      const branch: Result = await run(branchArgs, repo.root);
      if (branch.code !== 0 && branch.code !== 1) throw new CommandError(branchArgs, repo.root, branch);
      const actual: string = branch.code === 1 ? 'detached HEAD' : branch.stdout;
      if (branch.code === 1 || actual !== repo.config.default_branch)
        throw new Error(`Cannot sync from ${actual}; required branch: ${repo.config.default_branch}`);

      const worktree: string = expandPath(repo.config.worktree_root, repo.root);
      const stagedPaths: string = await command(
        ['git', 'diff', '--cached', '--name-only', '--no-renames', '-z'],
        repo.root,
      );
      const excluded: string[] = stagedPaths
        .split('\0')
        .filter(
          (path: string) =>
            path !== '' &&
            (!path.startsWith('issues/') ||
              within(resolve(repo.root, path), resolve(repo.root, 'issues/seeds')) ||
              basename(path) === '.lock' ||
              (within(worktree, repo.root) && within(resolve(repo.root, path), worktree))),
        );
      if (excluded.length > 0)
        throw new Error(`Cannot sync with staged paths outside eligible issue records:\n${excluded.join('\n')}`);

      const lockPaths: string[] = [resolve(globalHome(), '.lock'), resolve(repo.root, 'issues/.lock')]
        .filter((path: string) => within(path, repo.root))
        .map((path: string) => relative(repo.root, path));
      const trackedLocks: string = await command(
        ['git', '--literal-pathspecs', 'ls-files', '-z', '--', ...lockPaths],
        repo.root,
      );
      if (trackedLocks !== '')
        throw new Error(`Cannot sync tracked active coordination lock paths:\n${trackedLocks.split('\0').join('\n')}`);
      await command(['git', 'fetch', repo.config.remote, repo.config.default_branch], repo.root);
      const incoming: string = await command(['git', 'rev-parse', '--verify', 'FETCH_HEAD^{commit}'], repo.root);
      const incomingLocks: string = await command(
        ['git', '--literal-pathspecs', 'ls-tree', '-r', '--name-only', '-z', incoming, '--', ...lockPaths],
        repo.root,
      );
      if (incomingLocks !== '')
        throw new Error(
          `Cannot sync incoming active coordination lock paths:\n${incomingLocks.split('\0').join('\n')}`,
        );
      const replayedLocks: string = await command(
        [
          'git',
          '--literal-pathspecs',
          'log',
          '--format=',
          '--name-only',
          '--no-renames',
          '-z',
          `${incoming}..HEAD`,
          '--',
          ...lockPaths,
        ],
        repo.root,
      );
      if (replayedLocks !== '')
        throw new Error(
          `Cannot replay commits touching active coordination lock paths:\n${replayedLocks.split('\0').join('\n')}`,
        );

      if (worktree !== repo.root) {
        const paths: string[] = [
          ':(top,literal)issues',
          ':(top,exclude,literal)issues/seeds',
          ':(top,exclude,glob)**/.lock',
          ...(within(worktree, repo.root) ? [`:(top,exclude,literal)${relative(repo.root, worktree)}`] : []),
        ];
        await command(['git', 'add', '-A', '--', ...paths], repo.root);
      }
      const diffArgs: string[] = ['git', 'diff', '--cached', '--quiet'];
      const staged: Result = await run(diffArgs, repo.root);
      if (staged.code === 1) await command(['git', 'commit', '-m', 'sync issues'], repo.root);
      else if (staged.code !== 0) throw new CommandError(diffArgs, repo.root, staged);
      const rebaseArgs: string[] = ['git', 'rebase', '--autostash', incoming];
      const rebase: Result = await run(rebaseArgs, repo.root);
      if (rebase.code !== 0) throw new CommandError(rebaseArgs, repo.root, rebase);
      const unmerged: string = await command(['git', 'diff', '--name-only', '--diff-filter=U', '-z'], repo.root);
      if (unmerged !== '')
        throw new Error(
          JSON.stringify({
            error: 'Git autostash restoration conflicts; resolve before pushing',
            paths: unmerged.split('\0').slice(0, -1),
            command: rebaseArgs,
            cwd: repo.root,
            ...rebase,
          }),
        );
      await command(['git', 'push', repo.config.remote, `HEAD:${repo.config.default_branch}`], repo.root);
    }),
  );
}
