import { realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { globalHome, toolRoot, type Repo } from './config';
import { applySkillLinks, planSkillLinks, type Link } from './install';
import { command, run, CommandError, type Result } from './shell';
import { withLock } from './state';

function firstLine(result: Result): string {
  return (result.stderr !== '' ? result.stderr : result.stdout).split('\n')[0];
}

function describeError(error: unknown): string {
  return firstLine(error instanceof CommandError ? error.result : { code: 1, stdout: '', stderr: String(error) });
}

export async function selfUpdate(repo: Repo, ownRoot: string = toolRoot, home: string = homedir()): Promise<void> {
  try {
    if (realpathSync(repo.root) !== realpathSync(ownRoot)) return;
    const root: string = repo.root;
    const target: string = `${repo.config.remote}/${repo.config.default_branch}`;
    const lag = async (): Promise<string> => {
      const result: Result = await run(['git', 'rev-list', '--left-right', '--count', `HEAD...${target}`], root);
      if (result.code !== 0) return `unknown behind ${target}`;
      const behind: string = result.stdout.split('\t')[1];
      return `${behind} behind ${target}`;
    };
    const line: string = await withLock(
      resolve(root, await command(['git', 'rev-parse', '--git-path', 'akrogon-install.lock'], root)),
      async (): Promise<string> => {
        const fetched: Result = await run(['git', 'fetch', repo.config.remote, repo.config.default_branch], root);
        if (fetched.code !== 0)
          return `fetch failed: ${firstLine(fetched)}; ${await lag()}; retried at the next trigger`;
        const symbolic: Result = await run(['git', 'symbolic-ref', '--short', 'HEAD'], root);
        let skip: string | null;
        let old: string | null = null;
        if (symbolic.code !== 0) skip = `detached HEAD; ${await lag()}`;
        else if (symbolic.stdout !== repo.config.default_branch)
          skip = `on ${symbolic.stdout}, not ${repo.config.default_branch}; ${await lag()}`;
        else {
          const counts: string[] = (
            await command(['git', 'rev-list', '--left-right', '--count', `HEAD...${target}`], root)
          ).split('\t');
          const ahead: number = Number(counts[0]);
          const behind: number = Number(counts[1]);
          if (ahead > 0)
            skip = `${behind === 0 ? 'ahead of' : 'diverged from'} ${target}; ${behind} behind ${target}; run akrogon sync`;
          else if (behind === 0) skip = null;
          else {
            const before: string = await command(['git', 'rev-parse', 'HEAD'], root);
            const merged: Result = await withLock(resolve(globalHome(), '.lock'), () =>
              run(['git', 'merge', '--ff-only', target], root),
            );
            if (merged.code === 0) {
              old = before;
              skip = null;
            } else
              skip = `fast-forward refused: ${firstLine(merged)}; ${behind} behind ${target}; commit or finish the overlapping edit`;
          }
        }
        let failure: string | null = null;
        const installed: Result = await run([process.execPath, 'install', '--frozen-lockfile'], root);
        if (installed.code !== 0) failure = `install failed: ${firstLine(installed)}`;
        else {
          try {
            const planned: { links: Link[]; conflicts: Link[] } = planSkillLinks(home, ownRoot);
            const blocked: Set<string> = new Set(planned.conflicts.map((link: Link) => link.destination));
            applySkillLinks(planned.links.filter((link: Link) => !blocked.has(link.destination)));
            if (planned.conflicts.length > 0)
              failure = `links failed: ${planned.conflicts.map((link: Link) => link.destination).join(', ')}; remove the conflicting paths`;
          } catch (error) {
            failure = `links failed: ${describeError(error)}`;
          }
        }
        if (skip !== null) return `self-update skipped: ${skip}`;
        if (failure !== null) return `${failure}; ${await lag()}; retried at the next trigger`;
        const head: string = (await command(['git', 'rev-parse', 'HEAD'], root)).slice(0, 12);
        return old === null ? `current ${head}` : `deployed ${old.slice(0, 12)}..${head}`;
      },
    );
    console.log(line);
  } catch (error) {
    console.log(`self-update failed: ${describeError(error)}`);
  }
}
