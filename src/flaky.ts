import { existsSync, readFileSync } from 'node:fs';
import { readGlobal, requireRepo, type Repo } from './config';
import { readVerifyRuns, type VerifyRun } from './verify';

type Flip = { name: string; command: string; test: string; end: string };
type Line = { name: string; test: string; count: number; last: string };
type Red = { name: string; command: string; log: string };

// A closed leaf's logs move with its records from issues/open to issues/closed.
function failedTests(recorded: string): string[] {
  const log: string | undefined = [recorded, recorded.replace('/issues/open/', '/issues/closed/')].find(existsSync);
  if (log === undefined) return ['(log gone)'];
  const names: string[] = [...readFileSync(log, 'utf8').matchAll(/(?:^|\| )\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/gm)].map(
    (match: RegExpMatchArray) => match[1],
  );
  return names.length === 0 ? ['(no test name)'] : [...new Set(names)];
}

// A command red then green on the same tree, in completed runs whose setup passed, is one flip per failed test.
export function flips(runs: VerifyRun[]): Flip[] {
  const completed: VerifyRun[] = runs
    .filter((run: VerifyRun) => run.end !== undefined && run.setup === 0)
    .sort((a: VerifyRun, b: VerifyRun) => a.end!.localeCompare(b.end!));
  const red: Map<string, Red> = new Map();
  return completed.flatMap((run: VerifyRun) =>
    run.commands.flatMap((item): Flip[] => {
      const key: string = `${run.tree}\0${item.command}`;
      if (item.exit !== 0) {
        red.set(key, item);
        return [];
      }
      const prior: Red | undefined = red.get(key);
      if (prior === undefined) return [];
      red.delete(key);
      return failedTests(prior.log).map((test: string) => ({
        name: prior.name,
        command: prior.command,
        test,
        end: run.end!,
      }));
    }),
  );
}

export function flakyLines(runs: VerifyRun[]): Line[] {
  const grouped: Map<string, Line> = new Map();
  for (const flip of flips(runs)) {
    const key: string = `${flip.command}\0${flip.test}`;
    const line: Line | undefined = grouped.get(key);
    grouped.set(
      key,
      line === undefined
        ? { name: flip.name, test: flip.test, count: 1, last: flip.end }
        : { ...line, count: line.count + 1, last: flip.end },
    );
  }
  return [...grouped.values()].sort((a: Line, b: Line) => b.last.localeCompare(a.last));
}

export async function flakyCommand(cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  for (const line of flakyLines(readVerifyRuns(repo)))
    console.log(`${line.count} ${line.last} ${line.name} ${line.test}`);
}
