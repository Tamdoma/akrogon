# Brief 1: unique real-systemd identities in tests/leaf-slices.test.ts

## 1. Goal

D1. Three copies of tests/leaf-slices.test.ts running at the same time all pass. Today one copy fails because every copy creates and stops the same real systemd user slices.

## 2. Numbered acceptance criteria

1. Three `bun test --timeout=30000 tests/leaf-slices.test.ts` processes started in the same second all exit 0. Base: each copy fails one case (logs /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-base-x3-leaf-slices-*.log).
2. Every existing assertion in the file is kept; only names change, plus criterion 3.
3. Each `sdrun(...)` whose inner command writes a marker that the test then polls for has its result checked (exit code, with stdout/stderr in the message) before the poll, so a failed start shows as that failure, not as a missing marker after 30 s.

## 3. Read-first list

- tests/leaf-slices.test.ts (whole file; real user bus at about :105 and :209, sdrun about :247, sleeper about :298, fixed slugs such as 'tabbed-merged' :354, 'run-leaf' :388, 'self-leaf' :490, and :544; marker polls :524-:526 and :562-:563; cleanupUnit).
- src/scope.ts leafSlice (slice name = hash of repo name and slug).
- Precedent: tests/run-units.test.ts:45 `akrogon-test-${process.pid}-${serial++}.slice`.
- Evidence: /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-B.md (G2) and /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-C.md (G1).
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

- tests/leaf-slices.test.ts only. Derive every real-systemd identity in a test (leaf slug or fixture repo name, whichever leafSlice hashes) from one value that is unique per test process, for example a module-level suffix from process.pid, used consistently in the leaf state, the commands, every leafSlice() call, cleanup and expected slices. A half rename leaves a test watching a slice its own pass never touches and passing for the wrong reason.
- Tests that use only the fake systemctl need no change unless they share the same name space.

## 5. Do-not, reasons and exceptions

- Do not change src/ (production names are correct; real repos have distinct names). Exception: none.
- Do not raise any timeout or poll count, add retries, or delete or weaken an assertion (operator rule). Exception: none.
- Do not edit other test files. If a needed change lies outside this file, return a mismatch with evidence.
- Do not stop processes by pattern (pkill -f, killall).
Reasons restated: production is right, the collision is only in fixtures; timeouts and deletions were refused by the operator; scope stays one file.

## 6. Ordered steps

1. Read the file and src/scope.ts; list every real-systemd name and where it is used.
2. Introduce the per-process unique identity and apply it everywhere for those tests.
3. Add the sdrun result checks before marker polls.
4. Run the file once alone, then three copies at once; all green.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- `bun test --timeout=30000 tests/leaf-slices.test.ts`
- Three at once: start three run-check runs of that command in the background in one shell call and wait for all.

## 8. Done-when, evidence and report

Paste command results. Keep output only through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Commit your change on the current branch in /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files. Every commit changing an existing test file ends with a final trailer block line per changed file: `Test-Change: <exact path> <source and reason>` (source: the S1 overload logs /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs and the chart fork issues/chart/suite-time/forks/load-sensitive-tests.md). Do not push.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
