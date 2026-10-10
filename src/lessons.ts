import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command, run, CommandError, type Result } from './shell';

const lessonsPath: string = 'learnings/LESSONS.md';

export async function mergeBase(cwd: string, onto: string, head: string): Promise<string> {
  return command(['git', 'merge-base', onto, head], cwd);
}

export async function retiredHistoryStems(cwd: string, base: string, head: string): Promise<string[]> {
  const diff: string = await command(
    ['git', 'diff', '--unified=0', base + '..' + head, '--', 'learnings/history'],
    cwd,
  );
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

export async function lessonDiffLines(cwd: string, from: string, to: string, sign: '+' | '-'): Promise<Set<string>> {
  const diff: string = await command(['git', 'diff', '--unified=0', from + '..' + to, '--', lessonsPath], cwd);
  const lines: Set<string> = new Set();
  for (const line of diff.split('\n')) {
    if (!line.startsWith(sign)) continue;
    if (
      line.startsWith('+++ b/') ||
      line.startsWith('+++ /dev/') ||
      line.startsWith('--- a/') ||
      line.startsWith('--- /dev/')
    )
      continue;
    lines.add(line.slice(1));
  }
  return lines;
}

export async function retiredLessonsPresent(
  cwd: string,
  base: string,
  head: string,
  leafRanges: { base: string; head: string }[],
): Promise<string[]> {
  const stems: string[] = await retiredHistoryStems(cwd, base, head);
  if (stems.length === 0) return [];
  const shown: Result = await run(['git', 'show', head + ':' + lessonsPath], cwd);
  if (shown.code !== 0) {
    if (shown.stderr.includes('does not exist') || shown.stderr.includes('exists on disk, but not in')) return [];
    throw new CommandError(['git', 'show', head + ':' + lessonsPath], cwd, shown);
  }
  const addedOnMain: Set<string> = new Set();
  for (const range of leafRanges) {
    const fork: string = await mergeBase(cwd, range.base, base);
    for (const line of await lessonDiffLines(cwd, fork, base, '+')) addedOnMain.add(line);
    if (range.base !== fork)
      for (const line of await lessonDiffLines(cwd, fork, range.base, '+')) addedOnMain.add(line);
  }
  const flagged: Set<string> = new Set();
  for (const line of shown.stdout.split('\n')) {
    if (addedOnMain.has(line)) continue;
    const stem: string | undefined = stems.find((s) => line.includes(s));
    if (stem !== undefined) flagged.add(stem);
  }
  return [...flagged].sort();
}

export async function removeRetiredLessons(
  cwd: string,
  base: string,
  head: string,
  leafRanges: { base: string; head: string }[],
): Promise<string[]> {
  const path: string = resolve(cwd, lessonsPath);
  if (!existsSync(path)) return [];
  const stems: string[] = await retiredHistoryStems(cwd, base, head);
  if (stems.length === 0) return [];
  const deleted: Set<string> = new Set();
  for (const range of leafRanges)
    for (const line of await lessonDiffLines(cwd, range.base, range.head, '-')) deleted.add(line);
  const lines: string[] = readFileSync(path, 'utf8').split('\n');
  const removed: string[] = lines.filter((line) => deleted.has(line) && stems.some((stem) => line.includes(stem)));
  if (removed.length === 0) return [];
  writeFileSync(path, lines.filter((line) => !removed.includes(line)).join('\n'));
  return removed.map((line) => stems.find((stem) => line.includes(stem))!);
}
