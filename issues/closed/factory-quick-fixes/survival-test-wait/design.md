# Design: survival-test-wait

## Binding decisions, verbatim

### Signposts (issues/chart/factory-wins/forks/signposts.md), operator, 2026-11-10T09:55Z: `1a | 2c | 3a | 4a | 5b | 6a | 7a |`

- 1a: fewer parts first, then the operator's time, then clock time, then tokens.
- 2c: no win may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record or any current chart-door step.
- 3a: a win is charted only with a number from the factory's own records showing today's cost.
- 6a: changes land in akrogon only.
- 7a: earlier decisions stay binding and reopen only when the operator names one.
- 4a (small wins first) and 5b (one bounded paid run) order the session and bind nothing inside this leaf. No paid call and no live change belongs to this leaf.

### Contracts of the quick fixes (issues/chart/factory-wins/forks/contracts.md), operator, 2026-11-10: "1a, 2a, 3a,"

- W2 (the verify-survival test waits for the pass service before asserting) carries no question and follows verify-lifetime Taken point 4.
- Excluded from this leaf: question 1 (help and argument errors, owned by the sibling leaf `cli-help`), question 2 (the transcript-read change is dropped) and question 3 (the implement-issue reference change belongs to the `shared-rules` chart).

### Earlier decision kept (issues/chart/verify-lifetime/forks/run-lifetime.md, Taken point 4)

"The waiter waits for the pass service to exit, then prints the same per-command lines and returns the same exit code an attached run would, including a failure after the receipt is written (main-red notice, checkout removal), and non-zero for a receipt with no `end`. A dead pass is never joined. (B C2, C5)"

This leaf repairs the proof's observation so it follows that contract. It does not move receipt publication, does not change cleanup order and raises no time cap.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: the product of this leaf is a proof that tells the truth, so the leaf changes one existing test and no product code. The proof stays where it is, at the real boundary: a real `akrogon verify` on the test file's own isolated fixture, a real SIGKILL of the caller and a real systemd user service. Criterion 1 is the fail-before and pass-after of a bug fix, made repeatable by a scratch delay because the race is timing dependent; criteria 2 and 3 are the deliberate breaks that show the repaired proof still turns red. The scratch changes are run and recorded, never committed. No existing expectation is deleted or weakened. No machinery is built: `waitInactive` already exists and is used by five other passes in the same file. No model or outside call is made and no secret is involved.

## Leaf architecture

- Owned surfaces: the one test in tests/run-units.test.ts named in the brief. Nothing under `src`.
- Today, read 2026-11-10 at 63526537: after killing the caller, the test polls `leafReceipts(f, 'pass-survivor')[0]` every 200 ms for up to 30 s until `end` is set, then asserts the receipt's setup, command count, command exit, log name, log file, that `receipt.path` no longer exists and that `check-done` exists. In src/verify.ts `runOnce` the receipt file is replaced by rename inside the lock, and `git worktree remove --force` of the pass checkout runs after it. The kept red log issues/chart/tasks-panel/direct/check-test-1793744593130-1258102.log (read through `akrogon log`) fails at the `receipt.path` expectation, expected false, received true.
- Existing helper, reusable as checked: `waitInactive(unit, ms = 12000)` in the same file polls `systemctl --user is-active` every 150 ms and throws `Timed out waiting for <unit> to become inactive`. Other tests in the file call it as `waitInactive(`akrogon-verify-${receipt.run}.service`)` after reading a receipt. Its precondition, a receipt whose `run` names the pass, holds here once the receipt is read. The service name follows `passUnit` in src/verify-pass.ts.
- Rule changed: when this proof judges cleanup. Consumer: the suite run by the `test` check (`checks.test`, in `full`), and through it every verify and merge of every leaf; decision: the proof judges after service exit, which is the product contract, so a pass that is still cleaning up is no longer reported red and a pass that never cleans up still is.
- Who makes the test edit: the change is this leaf's proof and is made at plan.synthesis under plan-issue's test-writing step, committed on the leaf branch with the `Test-Change: tests/run-units.test.ts <source and reason>` trailer citing brief criterion 1. It changes when the test looks, not what it expects, so no existing expectation changes. Implement has no product code to write; it runs the planned proof and the scratch runs of criteria 1 to 3 and records them.
- Scratch runs: the delay of criterion 1 and the kept checkout of criterion 2 are uncommitted edits to src/verify.ts in the leaf worktree, run through `akrogon run-check`, then reverted; the final head holds no trace of them. Criterion 1's base run uses the base test with the same scratch delay.
- Open for the plan: whether the receipt poll stays as the way to learn the run id before the wait or the wait replaces part of it; how criterion 3's never-exiting service is produced with the file's existing fixtures without a long sleep; the smallest scratch delay that makes the base red every time on this host.
