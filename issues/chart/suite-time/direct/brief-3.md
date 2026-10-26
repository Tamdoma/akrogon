# Brief 3: one clock in tests/status.test.ts and the named-target split in tests/next.test.ts

## 1. Goal

D4. The status overview fixture reads the clock once, so the exact 23-minute TIME assertion never lands at 22. D5. "named target equivalence: owner name matches folder path from root, subfolder and worktree" in tests/next.test.ts (about :5594, a serial loop of 9 owner x directory cases with a 60000 ms timeout) becomes nine separate tests so they run concurrently.

## 2. Numbered acceptance criteria

1. tests/status.test.ts: the fixture helpers that stamp terminal-duration records (separate Date.now() samples about :38/:40, :56, :73, :82) derive both endpoints from one captured epoch per test; the assertion `expect(cell(result.stdout, row, 'TIME')).toBe('0h 23m')` (about :149) stays exactly as is. Do not freeze a global clock shared across concurrent tests. src/status.ts floors minutes (about :114); do not change it.
2. Three copies at once of tests/status.test.ts all pass. Base: one of three failed with 0h 22m (/home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-base-x3-status-2-*.log).
3. tests/next.test.ts: the nine cases become nine test() calls with names that say which owner and directory each covers, each with exactly the same fixture, comparisons and cleanup as one loop iteration today. Total expect calls in the file do not drop. Each new test keeps a per-test timeout no larger than the old one; choose the smallest the case needs alone times about 3, never above 60000.
4. tests/next.test.ts alone finishes in less wall time than base (measure base first on the unedited file).

## 3. Read-first list

- tests/status.test.ts top helpers and the overview test (about :38-:150).
- tests/next.test.ts around :5594 (the loop and its helpers).
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

- tests/status.test.ts and tests/next.test.ts only. Use test.each or a plain for loop that calls test() nine times, whichever matches file style.

## 5. Do-not, reasons and exceptions

- No src/ change, no assertion removed or loosened, no per-test timeout raised (operator rule).
- Do not touch other tests in next.test.ts.
Reasons restated: product unchanged; operator refused timeout raises; scope is two cases.

## 6. Ordered steps

1. Measure base: `bun test --timeout=30000 tests/next.test.ts` once, record wall.
2. status epoch change; run the file; three copies at once.
3. next split; run `bun test --timeout=30000 tests/next.test.ts -t "named target"` then the whole file; record wall.

Advisory size: 2 files, under 15 turns.

## 7. Commands

- `bun test --timeout=30000 tests/status.test.ts` (and three at once)
- `bun test --timeout=30000 tests/next.test.ts`

## 8. Done-when, evidence and report

Paste command results. Keep output only through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Commit your change on the current branch in /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files. Every commit changing an existing test file ends with a final trailer block line per changed file: `Test-Change: <exact path> <source and reason>` (source: the S1 overload logs /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs and the chart fork issues/chart/suite-time/forks/load-sensitive-tests.md). Do not push.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
