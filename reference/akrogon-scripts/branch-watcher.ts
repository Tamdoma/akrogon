// Exits with one alert line when a watched local branch moves, appears, or disappears. Read-only.
// Usage: bun --no-install mechanics/branch-watcher.ts <repo-path> [branch...]
// No branch names means every local branch. Relaunch after each alert.
import { execFileSync } from 'node:child_process';

const [repo, ...selected]: readonly string[] = process.argv.slice(2);
if (repo === undefined) throw new Error('usage: branch-watcher.ts <repo-path> [branch...]');

const git = (args: readonly string[]): string =>
  execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

const listBranches = (): readonly string[] => {
  const local: readonly string[] = git(['for-each-ref', '--format=%(refname:short)', 'refs/heads']).split('\n');
  return selected.length === 0 ? local : local.filter((branch): boolean => selected.includes(branch));
};

const tipOf = (branch: string): string => git(['rev-parse', '--short=8', branch]);

const known: Readonly<Record<string, string>> = Object.fromEntries(
  listBranches().map((branch): [string, string] => [branch, tipOf(branch)])
);

const alert = (line: string): never => {
  console.log(`ALERT ${line}`);
  process.exit(0);
};

while (true) {
  await new Promise((resolve): void => void setTimeout(resolve, 30_000));
  const current: readonly string[] = listBranches();
  const gone: string | undefined = Object.keys(known).find((branch): boolean => !current.includes(branch));
  if (gone !== undefined) alert(`branch-deleted ${gone} (was ${known[gone]})`);
  const added: string | undefined = current.find((branch): boolean => !(branch in known));
  if (added !== undefined) alert(`branch-created ${added}: ${tipOf(added)}`);
  const moved: string | undefined = Object.keys(known).find((branch): boolean => tipOf(branch) !== known[branch]);
  if (moved !== undefined)
    alert(`branch-moved ${moved}:\n${git(['log', '--oneline', `${known[moved]}..${moved}`]) || tipOf(moved)}`);
}
