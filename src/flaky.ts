import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { isAncestor } from './batch';
import { readGlobal, requireRepo, type Repo } from './config';
import { LogError, readLog } from './evidence';
import { trackingRef } from './preflight';
import { command, run, type Result } from './shell';
import { readVerifyRuns, type VerifyRun } from './verify';

type Flip = { name: string; command: string; test: string; end: string };
type Line = { name: string; test: string; count: number; last: string };
type Red = VerifyRun['commands'][number];

// A `<chain>` before Bun's `|` is a token tuple; wrapper chains are strict tuple prefixes, never
// string prefixes (`test:a` is not a prefix of `test:ab`).
function chain(line: string): string[] {
  return line.split('|').map((token: string) => token.trim());
}

function prefixOf(short: string[], long: string[]): boolean {
  return short.length < long.length && short.every((token: string, index: number) => token === long[index]);
}

export type BunScan = {
  names: string[];
  timeouts: string[];
  durations: { name: string; ms: number }[];
};

function streamKey(tokens: string[]): string {
  return tokens.join('\0');
}

// One scan of captured Bun output. `names` is byte-identical to the historical failureNames
// output: the multiline regexes run over the whole text exactly as before, so every JavaScript
// line terminator (CR, CRLF, U+2028, U+2029) reads the same — `(fail)` titles, `(unnamed)`
// qualified by its stream's innermost token, and `(script) <script>` for a failed script whose
// own stream printed no `(fail)` line. `timeouts` and `durations` come from a per-line pass
// over the same terminator set (CRLF pairing reads as one empty segment, which neither attaches
// nor expires). `timeouts` holds the names whose own chain prints `  ^ this test timed out
// after <n>ms.` as the immediately preceding line of that same chain after its `(fail)` line:
// any other line of the chain expires the candidate, a caret is consumed, and lines of other
// chains or other streams do not break attachment. `durations` holds every `(pass)` or `(fail)`
// line with a strict `[<n>ms]` bracket (digits with at most one dot after a leading digit, so
// `[...ms]` never parses as NaN) as one deduped entry per name keeping its largest rounded ms.
// An anchored line's duration title is its whole remainder even when it holds `| (fail) `;
// chained lines keep the legacy chain extraction with `(unnamed)` normalization.
export function scanBunOutput(text: string): BunScan {
  // Names: the legacy extraction verbatim. The multiline anchors already treat \r, U+2028 and
  // U+2029 as line boundaries, so no segmenter can diverge from them.
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

  // Timeouts and durations: one ordered pass. `candidate` is each chain's open timeout window:
  // set by its `(fail)` line, expired by anything else of the same chain, consumed by its caret.
  const candidate: Map<string, string> = new Map();
  const known: string[][] = [];
  const timeouts: string[] = [];
  const ms: Map<string, number> = new Map();
  const remember = (tokens: string[]): void => {
    if (tokens.length > 0 && !known.some((entry) => sameStream(entry, tokens))) known.push(tokens);
  };
  const timed = (line: string): { chain: string[]; title: string; bracket: string | undefined } | null => {
    const anchored: RegExpExecArray | null = /^(?:\(pass\) |\(fail\) )(.+?)(?: \[(\d+(?:\.\d+)?)ms\])?$/.exec(line);
    if (anchored !== null) return { chain: [], title: anchored[1], bracket: anchored[2] };
    const chained: RegExpExecArray | null =
      /^(.+?)\| \(fail\) (.+?)(?: \[(\d+(?:\.\d+)?)ms\])?$/.exec(line) ??
      /^(.+?)\| \(pass\) (.+?)(?: \[(\d+(?:\.\d+)?)ms\])?$/.exec(line);
    if (chained === null) return null;
    const tokens: string[] = chain(chained[1]);
    const title: string =
      chained[2] === '(unnamed)' && tokens.length > 0 ? `(unnamed) ${tokens[tokens.length - 1]}` : chained[2];
    return { chain: tokens, title, bracket: chained[3] };
  };
  for (const line of text.split(/[\n\r\u2028\u2029]/)) {
    if (line.length === 0) continue;
    const fail: RegExpExecArray | null = /^(?:\(fail\) |(.+?)\| \(fail\) )(.+?)(?: \[([\d.]+m?s)\])?$/.exec(line);
    const pass: RegExpExecArray | null =
      fail === null ? /^(?:\(pass\) |(.+?)\| \(pass\) )(.+?)(?: \[([\d.]+m?s)\])?$/.exec(line) : null;
    const result: RegExpExecArray | null = fail ?? pass;
    if (result !== null) {
      const stream: string[] = result[1] === undefined ? [] : chain(result[1]);
      const title: string =
        result[2] === '(unnamed)' && stream.length > 0 ? `(unnamed) ${stream[stream.length - 1]}` : result[2];
      remember(stream);
      const key: string = streamKey(stream);
      if (fail !== null) candidate.set(key, title);
      else candidate.delete(key);
    } else {
      const timeout: RegExpExecArray | null = /^(?:(.+?)\| )?  \^ this test timed out after [\d.]+ms\.$/.exec(line);
      if (timeout !== null) {
        const tokens: string[] = timeout[1] === undefined ? [] : chain(timeout[1]);
        remember(tokens);
        const key: string = streamKey(tokens);
        const attached: string | undefined = candidate.get(key);
        if (attached !== undefined && !timeouts.includes(attached)) timeouts.push(attached);
        candidate.delete(key);
      } else if (/^.+\| Exited with code \d+\s*$/.test(line)) {
        const tokens: string[] = chain(line.slice(0, line.lastIndexOf('|')));
        remember(tokens);
        candidate.delete(streamKey(tokens));
      } else {
        // Ordinary output expires its own chain. Its prefix carries no terminator, so the owning
        // chain is the longest chain already seen whose tokens strictly open the line's tokens;
        // anything else is bare output of the empty chain.
        const tokens: string[] = chain(line);
        let owner: string[] = [];
        for (const entry of known) if (prefixOf(entry, tokens) && entry.length > owner.length) owner = entry;
        candidate.delete(streamKey(owner));
      }
    }
    const timing: { chain: string[]; title: string; bracket: string | undefined } | null = timed(line);
    if (timing !== null && timing.bracket !== undefined) {
      const value: number = Math.round(Number.parseFloat(timing.bracket));
      if (!ms.has(timing.title) || ms.get(timing.title)! < value) ms.set(timing.title, value);
    }
  }
  return {
    names: all.length === 0 ? ['(no test name)'] : all,
    timeouts,
    durations: [...ms.entries()].map(([name, value]) => ({ name, ms: value })),
  };
}

export function failureNames(text: string): string[] {
  return scanBunOutput(text).names;
}

// A closed leaf's logs move with its records between issues/<state> owner dirs and packed archives;
// a recorded path outside the issues grammar (a verify holder) that still exists on disk reads as a
// plain file.
export async function failedTests(repo: Repo, recorded: string): Promise<string[]> {
  let bytes: Uint8Array;
  try {
    bytes = await readLog(repo, recorded, repo.root);
  } catch (error) {
    // A member an older archive lacks is a plain log completion deleted beside it.
    if (error instanceof LogError && error.kind === 'member') return ['(log gone)'];
    if (error instanceof LogError && error.kind === 'nomatch') {
      const plain: string = resolve(repo.root, recorded);
      if (existsSync(plain) && statSync(plain).isFile()) bytes = readFileSync(plain);
      else return ['(log gone)'];
    } else throw error;
  }
  return failureNames(new TextDecoder().decode(bytes));
}

// A command red then green on the same tree, in completed runs whose setup passed, is one flip
// per failed test. On a merge head the same pairing also counts across trees inside one leaf's
// consecutive sequence when the run's recorded patch id proves the leaf's own commits unchanged and
// no completed run failed the test between: neither a base run (compares) nor a run on landed main.
// A row whose rerun passed a first-run failure is one flip for that test.
type Pending = { item: Red; run: VerifyRun };

// Nameless names say nothing about which unit failed, so only real titles flip across trees.
function nameless(test: string): boolean {
  return (
    test === '(no test name)' || test === '(log gone)' || test.startsWith('(script) ') || test.startsWith('(unnamed)')
  );
}

export async function flips(repo: Repo, runs: VerifyRun[]): Promise<Flip[]> {
  const completed: VerifyRun[] = runs
    .filter((run: VerifyRun) => run.end !== undefined && run.setup === 0)
    .sort((a: VerifyRun, b: VerifyRun) => a.end!.localeCompare(b.end!));
  const red: Map<string, Pending> = new Map();
  const mergeRed: Map<string, Pending> = new Map();
  // The tracked tip resolves once and only when a between-run needs it, so ledgers whose pairs
  // never span a breaking candidate — or carry no real shas at all — never touch git.
  let tip: string | undefined;
  const landed: Map<string, boolean> = new Map();
  const onMain = async (sha: string): Promise<boolean> => {
    if (!landed.has(sha)) {
      const object: Result = await run(['git', 'cat-file', '-e', `${sha}^{commit}`], repo.root);
      landed.set(
        sha,
        object.code === 0 &&
          (await isAncestor(
            repo.root,
            sha,
            (tip ??= await command(['git', 'rev-parse', trackingRef(repo)], repo.root)),
          )),
      );
    }
    return landed.get(sha)!;
  };
  // The named tests a completed run ending strictly between the pair fails under the same name and
  // command, when that run is a base run or ran on landed main.
  const broken = async (from: Pending, to: Pending, name: string, cmd: string): Promise<Set<string>> => {
    const out: Set<string> = new Set();
    for (const between of completed) {
      if (between.end! <= from.run.end! || between.end! >= to.run.end!) continue;
      const entry: Red | undefined = between.commands.find(
        (item) =>
          item.name === name &&
          item.command === cmd &&
          item.exit !== 0 &&
          item.reused === undefined &&
          item.blocked === undefined,
      );
      if (entry === undefined) continue;
      if (between.compares === undefined && !(await onMain(between.sha))) continue;
      for (const test of entry.failures ?? (await failedTests(repo, entry.log))) out.add(test);
    }
    return out;
  };
  // `counted` names recoveries the green row's own rerun already counted.
  const pair = async (prior: Pending, green: Pending, counted: string[]): Promise<void> => {
    const item: Red = prior.item;
    const tests: string[] = (item.failures ?? (await failedTests(repo, item.log))).filter(
      (test) => !counted.includes(test),
    );
    if (prior.run.tree === green.run.tree) {
      for (const test of tests) out.push({ name: item.name, command: item.command, test, end: green.run.end! });
      return;
    }
    if (
      prior.run.scope !== 'merge' ||
      prior.run.compares !== undefined ||
      green.run.scope !== 'merge' ||
      green.run.compares !== undefined ||
      prior.run.leaf !== green.run.leaf ||
      prior.run.patch_id === undefined ||
      green.run.patch_id !== prior.run.patch_id
    )
      return;
    const wanted: string[] = tests.filter((test) => !nameless(test));
    if (wanted.length === 0) return;
    const brokenTests: Set<string> = await broken(prior, green, item.name, item.command);
    for (const test of wanted)
      if (!brokenTests.has(test)) out.push({ name: item.name, command: item.command, test, end: green.run.end! });
  };
  const out: Flip[] = [];
  for (const run of completed)
    for (const item of run.commands) {
      if (item.reused !== undefined || item.blocked !== undefined) continue;
      const still: string[] = item.exit === 0 ? [] : (item.failures ?? []);
      const counted: string[] = (item.rerun?.failures ?? []).filter((test) => !still.includes(test));
      for (const test of counted) out.push({ name: item.name, command: item.command, test, end: run.end! });
      const entry: Pending = { item, run };
      const key: string = `${run.tree}\0${item.command}`;
      const mergeKey: string = `${run.leaf}\0${item.name}\0${item.command}`;
      if (item.exit !== 0) {
        red.set(key, entry);
        if (run.scope === 'merge' && run.compares === undefined) mergeRed.set(mergeKey, entry);
        continue;
      }
      const prior: Pending | undefined = red.get(key);
      if (prior !== undefined) {
        red.delete(key);
        await pair(prior, entry, counted);
      }
      if (run.scope === 'merge' && run.compares === undefined) {
        const pending: Pending | undefined = mergeRed.get(mergeKey);
        mergeRed.delete(mergeKey);
        if (pending !== undefined && pending.run.tree !== run.tree) await pair(pending, entry, counted);
      }
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
