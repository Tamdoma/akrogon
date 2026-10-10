import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command, run, CommandError, type Result } from './shell';

const lessonsPath: string = 'learnings/LESSONS.md';

export async function mergeBase(cwd: string, onto: string, head: string): Promise<string> {
  return command(['git', 'merge-base', onto, head], cwd);
}

export async function retiredHistoryStems(cwd: string, base: string, head: string): Promise<string[]> {
  const diff: string = await command(['git', 'diff', '--unified=0', base + '..' + head, '--', 'learnings/history'], cwd);
  const stems: Set<string> = new Set();
  let file: string | undefined;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line.startsWith('+++ b/') ? line.slice(6) : undefined;
    } else if (file !== undefined && line.startsWith('+Applied')) {
      stems.add(file.slice('learnings/'.length, -'.md'.length));
    }
  }
  return [...stems].sort();
}

export async function retiredLessonsPresent(cwd: string, base: string, head: string): Promise<string[]> {
  const stems: string[] = await retiredHistoryStems(cwd, base, head);
  if (stems.length === 0) return [];
  const shown: Result = await run(['git', 'show', head + ':' + lessonsPath], cwd);
  if (shown.code !== 0) {
    if (shown.stderr.includes('does not exist') || shown.stderr.includes('exists on disk, but not in')) return [];
    throw new CommandError(['git', 'show', head + ':' + lessonsPath], cwd, shown);
  }
  return stems.filter((stem) => shown.stdout.includes(stem));
}

export async function removeRetiredLessons(cwd: string, base: string, head: string): Promise<string[]> {
  const path: string = resolve(cwd, lessonsPath);
  if (!existsSync(path)) return [];
  const stems: string[] = await retiredHistoryStems(cwd, base, head);
  if (stems.length === 0) return [];
  const lines: string[] = readFileSync(path, 'utf8').split('\n');
  const kept: string[] = lines.filter((line) => !stems.some((stem) => line.includes(stem)));
  if (kept.length === lines.length) return [];
  writeFileSync(path, kept.join('\n'));
  return stems.filter((stem) => lines.some((line) => line.includes(stem)));
}
