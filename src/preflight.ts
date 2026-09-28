import { readGlobal, requireRepo, type Repo } from './config';
import { run, CommandError, type Result } from './shell';

export function trackingRef(repo: Repo): string {
  return `refs/remotes/${repo.config.remote}/${repo.config.default_branch}`;
}

export class PreflightError extends Error {
  readonly exit: number;
  readonly stderr: string;
  constructor(
    readonly code: 'C1' | 'C2' | 'C3' | 'unproven',
    readonly argv: string[],
    readonly cwd: string,
    result: Result,
    repo: Repo,
  ) {
    const { remote, default_branch: branch }: { remote: string; default_branch: string } = repo.config;
    super(
      code === 'C1'
        ? `C1: no configured remote "${remote}"; add it (git remote add ${remote} <url>) or fix remote in issues/config.yaml.`
        : code === 'C2'
          ? `C2: remote branch ${remote}/${branch} absent; make and push a first commit on ${branch}.`
          : code === 'C3'
            ? `C3: tracking ref ${trackingRef(repo)} absent locally; run: git fetch ${remote} ${branch}.`
            : `Unproven: cannot verify remote branch ${remote}/${branch}: ${argv.join(' ')} exited ${result.code}: ${result.stderr}.`,
    );
    this.exit = result.code;
    this.stderr = result.stderr;
  }
}

async function ensureRemote(repo: Repo): Promise<void> {
  const argv: string[] = ['git', 'remote', 'get-url', repo.config.remote];
  const result: Result = await run(argv, repo.root);
  if (result.code !== 0) throw new PreflightError('C1', argv, repo.root, result, repo);
}

export async function localBase(repo: Repo): Promise<string> {
  const argv: string[] = ['git', 'rev-parse', '--verify', '--quiet', `${trackingRef(repo)}^{commit}`];
  const result: Result = await run(argv, repo.root);
  if (result.code === 0) return result.stdout;
  if (result.code === 1) throw new PreflightError('C3', argv, repo.root, result, repo);
  throw new CommandError(argv, repo.root, result);
}

export async function remoteBase(repo: Repo): Promise<void> {
  await ensureRemote(repo);
  const argv: string[] = [
    'git',
    'ls-remote',
    '--exit-code',
    repo.config.remote,
    `refs/heads/${repo.config.default_branch}`,
  ];
  const result: Result = await run(argv, repo.root);
  if (result.code === 0) return;
  if (result.code === 2) throw new PreflightError('C2', argv, repo.root, result, repo);
  throw new PreflightError('unproven', argv, repo.root, result, repo);
}

export async function checkBase(repo: Repo, remoteRequired: boolean): Promise<string> {
  await ensureRemote(repo);
  try {
    const sha: string = await localBase(repo);
    if (remoteRequired) await remoteBase(repo);
    return sha;
  } catch (error) {
    if (!(error instanceof PreflightError) || error.code !== 'C3') throw error;
    await remoteBase(repo);
    throw error;
  }
}

export async function preflightCommand(cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const sha: string = await checkBase(repo, true);
  console.log(`${repo.config.remote}/${repo.config.default_branch} ${sha}`);
}
