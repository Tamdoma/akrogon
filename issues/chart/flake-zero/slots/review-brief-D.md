# Review brief: flake-zero (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/flake-zero, branch flake-zero, commit 583909da on 814a2387 (not yet rebased onto session-flake, which owns the hc fixture slice ledger, Taken 1a).

Design: forks/design.md, Taken plus Final shape corrections (corrections win). This commit covers 1b, 1c, 1d, 1e, 1f, 2a, 2b. Goal: no flaky test, fixed at root causes; prevention for new and changed tests.

Helper's notes to judge:
- 1c: src/seat.ts scopeEntry() polls /proc/<pid>/cgroup before firstTask, bounded by PANE_WAIT_MS, returns early when the pid is gone; on timeout ends the seat and throws. Old one-time check removed.
- 1e: recordLock exported from src/verify.ts so slow-merge's backdate takes the product's lock.
- 2a: issues/config.yaml gains a `repeat` check in `full: [test, repeat]`, files from `git diff --name-only --diff-filter=ACMR ${AKROGON_BASE:-origin/main}...HEAD -- 'tests/*.test.ts'` with --rerun-each=5. The branch changes issues/config.yaml, which the direct guard refuses; A will make that edit on main after landing, so judge the command, not its location. A red `test` does not stop `repeat` (full checks do not block each other).
- 1f has no reproduction (kept for alignment with cli()). :1198/:1384 waitActive and :711 have no fail-first proof.
- Proof logs: issues/chart/flake-zero/direct/ (proof-1c-*, proof-wt-*, proof-sm-*, proof-ru-*, proof-stale-*, proof-2a-*). Verify green 1375.

Judge: does each fix remove its cause without masking; can scopeEntry wrongly kill a healthy production seat or hide a real out-of-scope seat; can any changed test still flake under load; does the repeat check run what it claims and cost what it should.

Verdict ready, nits or fix, Fixes only with a reproducing scenario and file:line.
