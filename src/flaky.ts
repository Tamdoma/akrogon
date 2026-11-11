import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { readGlobal, requireRepo, type Repo } from './config';
import { LogError, readLog } from './evidence';
import { readVerifyRuns, type VerifyRun } from './verify';

type Flip = { name: string; command: string; test: string; end: string };
type Line = { name: string; test: string; count: number; last: string };
type Red = { name: string; command: string; log: string };

// A `<chain>` before Bun's `|` is a token tuple; wrapper chains are strict tuple prefixes, never
// string prefixes (`test:a` is not a prefix of `test:ab`).
function chain(line: string): string[] {
  return line.split('|').map((token: string) => token.trim());
}

function prefixOf(short: string[], long: string[]): boolean {
  return short.length < long.length && short.every((token: string, index: number) => token === long[index]);
}

// A red log's names come only from lines Bun prints: `(fail)` titles, `(unnamed)` qualified by its
// stream's innermost token, and `(script) <script>` for a failed script whose own stream printed no
// `(fail)` line — the stream's wrappers dropped first, `Signaled:` and free text never naming.
function names(text: string): string[] {
  const titles: string[] = [];
  const failedStreams: string[][] = [];
  for (const match of text.matchAll(/^(?:\(fail\) |(.+?)\| \(fail\) )(.+?)(?: \[[\d.]+m?s\])?$/gm)) {
    const title: string = match[2];
    const stream: string[] = match[1] === undefined ? [] : chain(match[1]);
    failedStreams.push(stream);
    titles.push(title === '(unnamed)' && stream.length > 0 ? `(unnamed) ${stream[stream.length - 1]}` : title);
  }
  const exited: string[][] = [...text.matchAll(/^.+\| Exited with code (?!0\b)\d+\s*$/gm)].map(
    (match: RegExpMatchArray) => chain(match[0].slice(0, match[0].lastIndexOf('|'))),
  );
  const leaf: string[][] = exited.filter(
    (candidate: string[]) => !exited.some((other: string[]) => prefixOf(candidate, other)),
  );
  const sameStream = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((token: string, index: number) => token === b[index]);
  const scripts: string[] = leaf
    .filter((tokens: string[]) => !failedStreams.some((stream: string[]) => sameStream(stream, tokens)))
    .map((tokens: string[]) => `(script) ${tokens[tokens.length - 1]}`);
  const all: string[] = [...new Set([...titles, ...scripts])];
  return all.length === 0 ? ['(no test name)'] : all;
}

// A closed leaf's logs move with its records between issues/<state> owner dirs and packed archives;
// a recorded path outside the issues grammar (a verify holder) that still exists on disk reads as a
// plain file.
export async function failedTests(repo: Repo, recorded: string): Promise<string[]> {
  let bytes: Uint8Array;
  try {
    bytes = await readLog(repo, recorded, repo.root);
  } catch (error) {
    if (error instanceof LogError && error.kind === 'nomatch') {
      const plain: string = resolve(repo.root, recorded);
      if (existsSync(plain) && statSync(plain).isFile()) bytes = readFileSync(plain);
      else return ['(log gone)'];
    } else throw error;
  }
  return names(new TextDecoder().decode(bytes));
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
      if (item.reused !== undefined || item.blocked !== undefined) continue;
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
