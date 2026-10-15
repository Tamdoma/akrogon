import { readGlobal, requireRepo, type Repo } from './config';
import { LogError, readLog } from './evidence';
import { readVerifyRuns, type VerifyRun } from './verify';

type Flip = { name: string; command: string; test: string; end: string };
type Line = { name: string; test: string; count: number; last: string };
type Red = { name: string; command: string; log: string };

// A closed leaf's logs move with its records between issues/<state> owner dirs and packed archives.
async function failedTests(repo: Repo, recorded: string): Promise<string[]> {
  let bytes: Uint8Array;
  try {
    bytes = await readLog(repo, recorded, repo.root);
  } catch (error) {
    if (error instanceof LogError && error.kind === 'nomatch') return ['(log gone)'];
    throw error;
  }
  const names: string[] = [...new TextDecoder().decode(bytes).matchAll(/(?:^|\| )\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/gm)].map(
    (match: RegExpMatchArray) => match[1],
  );
  return names.length === 0 ? ['(no test name)'] : [...new Set(names)];
}

// A command red then green on the same tree, in completed runs whose setup passed, is one flip per failed test.
export async function flips(repo: Repo, runs: VerifyRun[]): Promise<Flip[]> {
  const completed: VerifyRun[] = runs
    .filter((run: VerifyRun) => run.end !== undefined && run.setup === 0)
    .sort((a: VerifyRun, b: VerifyRun) => a.end!.localeCompare(b.end!));
  const red: Map<string, Red> = new Map();
  const out: Flip[] = [];
  for (const run of completed)
    for (const item of run.commands) {
      const key: string = `${run.tree}\0${item.command}`;
      if (item.exit !== 0) {
        red.set(key, item);
        continue;
      }
      const prior: Red | undefined = red.get(key);
      if (prior === undefined) continue;
      red.delete(key);
      for (const test of await failedTests(repo, prior.log))
        out.push({ name: prior.name, command: prior.command, test, end: run.end! });
    }
  return out;
}

export async function flakyLines(repo: Repo, runs: VerifyRun[]): Promise<Line[]> {
  const grouped: Map<string, Line> = new Map();
  for (const flip of await flips(repo, runs)) {
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
  for (const line of await flakyLines(repo, readVerifyRuns(repo)))
    console.log(`${line.count} ${line.last} ${line.name} ${line.test}`);
}
