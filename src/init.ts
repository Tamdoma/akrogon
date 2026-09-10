import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { type RepoConfig, type GlobalConfig, globalHome, readGlobal, repoSchema } from './config';
import { command } from './shell';

export function writeYaml(path: string, content: object): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, Bun.YAML.stringify(content));
  renameSync(temporary, path);
}
export function writeRepoConfig(root: string, config: RepoConfig): void {
  writeYaml(resolve(root, 'issues/config.yaml'), config);
}
export async function initialize(cwd: string, proposal: string | undefined, toolkit: string | undefined): Promise<void> {
  const root: string = await command(['git', 'rev-parse', '--show-toplevel'], cwd);
  const repoPath: string = resolve(root, 'issues/config.yaml');
  const config: RepoConfig = repoSchema.parse(proposal !== undefined ? Bun.YAML.parse(readFileSync(resolve(cwd, proposal), 'utf8')) : existsSync(repoPath) ? Bun.YAML.parse(readFileSync(repoPath, 'utf8')) : {});
  const global: GlobalConfig = readGlobal();
  const toolkitPair: RegExpMatchArray | null = toolkit === undefined ? null : toolkit.match(/^([^=\s]+)=(.+)$/);
  if (toolkit !== undefined && toolkitPair === null) throw new Error('Expected --toolkit <lang>=<runner>');
  const repoName: string = basename(root);
  if (Object.hasOwn(global.repos, repoName) && resolve(globalHome(), global.repos[repoName]) !== root) throw new Error(`Repo name already registered: ${repoName}`);
  writeRepoConfig(root, config);
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  mkdirSync(resolve(root, 'learnings'), { recursive: true });
  const lessons: string = resolve(root, 'learnings/LESSONS.md');
  if (!existsSync(lessons)) writeFileSync(lessons, '# Lessons\n');
  const ignore: string = resolve(root, '.gitignore');
  const prior: string = existsSync(ignore) ? readFileSync(ignore, 'utf8') : '';
  const additions: string[] = ['issues/worktrees/', 'issues/seeds/', '.lock'].filter(line => !prior.split('\n').includes(line));
  if (additions.length > 0) writeFileSync(ignore, prior + (prior !== '' && !prior.endsWith('\n') ? '\n' : '') + additions.join('\n') + '\n');
  writeYaml(resolve(globalHome(), 'config.yaml'), { ...global, repos: { ...global.repos, [repoName]: root }, toolkits: { ...global.toolkits, ...(toolkitPair === null ? {} : { [toolkitPair[1]]: toolkitPair[2] }) } });
  const envPath: string = resolve(homedir(), '.config/akrogon/env');
  if (!existsSync(envPath)) console.log(envPath);
}
