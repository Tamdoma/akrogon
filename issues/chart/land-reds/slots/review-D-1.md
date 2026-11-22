# Slot D direct review

Verdict `fix`.

Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Reviewed head `6690a8a3b1de74d559454a26d75728b15f1ac3aa`.

## Fixes

**F1. A check with an attempt ID can hold the repo after land dies.** `leafFields` copies the batch attempt into ordinary `run-check` calls, and merge verify passes carry it too (`src/run-check.ts:150`, `src/run-check.ts:342`, `src/verify.ts:630`, `src/verify.ts:988`). `holds` treats any live record carrying that ID as a repo hold (`src/admission.ts:124`). Verify passes run in a separate systemd service under `akrogon.slice` (`src/verify.ts:885`), so a check can remain live after land dies and keep later runs waiting until the check ends. A manual `run-check` in an applied merge worktree can also start holding the repo on its own. The new test at `tests/run-permit.test.ts:784` demonstrates that path by asserting that an ordinary `format` run holds the repo. Give the land record distinct hold identity and use the attempt ID to admit its checks. Keep nesting for checks under their live land. Prove that a surviving check releases its effect on later runs when the actual land hold dies. This hits Taken 1 and done criteria 1 and 2.

**F2. Land can start a second `full` check while a leaf's `full` check is still live.** The land record gets its `since` before it takes the slice and repo locks (`src/admission.ts:272`). If it waits for its slice lock, a later leaf check can take a different slice lock and start first. Once land goes live, `awaitTurn` filters the active full check out of the line because its `since` is later than the hold's (`src/admission.ts:177-185`). This applies to Akrogon's configured `full: [test]`: both suites can run together. I reproduced it by holding the land slice lock, starting an already-admitted leaf full check before releasing that lock, and observing the land's full check start while the leaf check was still running. Keep live and ended full checks in front of queued runs. Apply the hold filter only to waiters. This hits Taken 2 and correction 2'.

**F3. The direct landing guard rejects both changed test files.** The reviewed range has zero `Test-Change:` trailers. The direct guard exits 1 and names `tests/merge-red-exit.test.ts` and `tests/run-permit.test.ts`. Add the two citations for the added cases. The existing assertions in those files are unchanged.

**F4. The recorded proof misses cross-repo isolation and exit ordering.** For criterion 1, `tests/run-permit.test.ts:771` starts only one registered repo, despite naming the other-repo case. The older two-repo test at line 379 runs against a normal full line and has no land hold. For criterion 6, `tests/merge-red-exit.test.ts:234-240` releases the gate, awaits both commands, and checks the final phase. It cannot detect moving the repair exit and wakes back inside the hold. Add observations at those boundaries and record the exact proof commands and current logs in `direct/report.md`. The report currently repeats the plan's fail-before claims without commands or kept evidence, including the deliberate nesting break.

## Evidence

- `akrogon run-check --holder <chart>/direct --name review-d-admission -- bun test tests/run-permit.test.ts tests/merge-red-exit.test.ts` passed all 47 tests. Log `direct/check-review-d-admission-1795362821414-1952476.log`.
- `review-d-line-overlap` returned 1 with `landFullCheckStartedWhileLeafFullCheckWasLive: true` from the admission reproduction. Log `direct/check-review-d-line-overlap-1795362920522-2028715.log`.
- `review-d-direct-guards` returned 1 at the citation gate. Log `direct/check-review-d-direct-guards-1795362892072-2002293.log`.
- Read the kept logs with `akrogon log`. `git diff --check` passed. Reviewed the red-exit rules and the changed reference pages. No `AREA.md` changed. Slot A owns full verification.
