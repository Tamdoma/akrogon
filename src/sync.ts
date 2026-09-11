import { readGlobal, requireRepo, type GlobalConfig, type Repo } from './config';
import { command, run, type Result } from './shell';

export async function syncCommand(cwd: string): Promise<void> {
  const global: GlobalConfig = readGlobal();
  const repo: Repo = await requireRepo(global, cwd);
  await command(['git', 'add', '-A'], repo.root);
  const staged: Result = await run(['git', 'diff', '--cached', '--quiet'], repo.root);
  if (staged.code === 1) await command(['git', 'commit', '-m', 'sync issues'], repo.root);
  else if (staged.code !== 0) throw new Error(`git diff --cached failed in ${repo.root}:\n${staged.stderr}`);
  await command(['git', 'pull', '--rebase', repo.config.remote, repo.config.default_branch], repo.root);
  await command(['git', 'push', repo.config.remote, `HEAD:${repo.config.default_branch}`], repo.root);
}
