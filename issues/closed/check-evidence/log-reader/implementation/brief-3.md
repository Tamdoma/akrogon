# Brief U3: flaky reads through the resolver

Worktree: /home/ivan/.akrogon/worktrees/akrogon/log-reader-u3

## 1. Goal

`src/flaky.ts` `failedTests` reads red verify logs through `readLog` (plan D5) so done-criterion C4 passes: failed test names come from plain or packed logs, `(log gone)` only when neither exists, broken archives and missing members are errors.

## 2. Acceptance criteria

1. `failedTests(repo, recorded)` calls `readLog(repo, recorded, repo.root)`; `LogError` kind `nomatch` → `['(log gone)']`; every other `LogError` and any other error re-throws.
2. `flips(repo, runs)` and `flakyLines(repo, runs)` gain the `repo: Repo` parameter and become `async`; `flakyCommand` passes its resolved `Repo` and awaits.
3. `(no test name)` handling and all ordering/grouping logic unchanged.
4. `bun test tests/flaky.test.ts` is green; `bunx tsc --noEmit` clean.

## 3. Read-first list

- `src/flaky.ts`: whole file (64 lines) — `failedTests` currently does the `open→closed` `existsSync`/`readFileSync` lookup you are replacing.
- `src/evidence.ts` (U1, on HEAD): `readLog`, `LogError`
- `src/verify.ts`: `VerifyRun` type
- `tests/flaky.test.ts`: new expectations (`await flakyLines(repo, ...)`, rejects.toThrow on broken archive)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

`src/flaky.ts` only:

```ts
import { readFileSync } from 'node:fs'; // keep only if still used
import { LogError, readLog } from './evidence';
import { readGlobal, requireRepo, type Repo } from './config';
import { readVerifyRuns, type VerifyRun } from './verify';

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

export async function flips(repo: Repo, runs: VerifyRun[]): Promise<Flip[]> {
  // same body; the failedTests call inside flatMap must collect promises:
  // either a for..of loop or Promise.all over a flat-mapped async callback
}
export async function flakyLines(repo: Repo, runs: VerifyRun[]): Promise<Line[]> {
  ... await flips(repo, runs) ...
}
export async function flakyCommand(cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  for (const line of await flakyLines(repo, readVerifyRuns(repo))) console.log(...);
}
```

Careful: `run.commands.flatMap` with an async callback returns `Promise<Flip[]>[]`; await each or restructure with a `for..of`. The red-map bookkeeping order must stay identical (a red sets, a green consumes and deletes).

`existsSync`/`readFileSync` imports drop if unused.

## 5. Do-not, reasons and exceptions

- Write or edit no test file: tests are locked; `tests/flaky.test.ts` is already committed red and expects exactly these signatures. Exception: none — mismatch to A.
- Touch `src/akrogon.ts`, `src/evidence.ts`, `README.md`, skills: no. Exception: revised brief from A.
- Do not swallow `archive`/`member` `LogError`s into `(log gone)`: criterion 4 makes them hard errors naming the archive. Exception: none.
- No behavioral change to grouping, counting or `(no test name)`. Exception: none.
- Restated: exclusions stand; only a revised brief from A changes them.

## 6. Ordered steps

1. Rewrite `src/flaky.ts` per section 4 (criteria 1-3).
2. `bun install --frozen-lockfile`; `bunx tsc --noEmit` clean (including `tests/flaky.test.ts`).
3. `bun test tests/flaky.test.ts` green.
4. `bun test tests/log-reader.test.ts` — C1-C3 may still be red if the `log` verb (U2, parallel unit) has not landed on your base; that is expected, do not fix it.

Advisory size: 1 file, ~10 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bunx tsc --noEmit`
- `bun test tests/flaky.test.ts`

## 8. Done-when, evidence and report

flaky reads via resolver, tests green, typecheck clean; commit on the detached worktree HEAD (e.g. `feat: read flaky red logs through the log resolver`) and return its ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
