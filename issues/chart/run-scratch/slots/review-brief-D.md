# Review brief D: run-scratch

You are slot D, the reviewer. Review range 1fe13c88..6396e3a6 in /home/ivan/.akrogon/worktrees/akrogon/run-scratch (base 1fe13c88 is land-own-reds' head, already reviewed). Two commits: 703f784d (every run root removed at run end, AKROGON_EVIDENCE export, run_root schema accept-only) and 6396e3a6 (run_root used, flat layout, host-step scan).

Spec: issues/chart/run-scratch/forks/design.md "## Taken". Implementer notes F1-F8: slots/impl-notes.md.

Look for concrete defects only: a red run that loses its log, a live run whose root is removed, residue that is never swept, commit 1 not safe as a rollback target for commit 2, env leaks, tests that do not fail on the old code. Do not run the full suite (the host is overloaded). Run targeted tests with `bun test --timeout=45000 --max-concurrency=4 <files>`.

Write slots/review-D-1.md: `Verdict ready|fix`, base and head, numbered findings with file:line and a scenario, then what you verified. Then run: hc send t126 "done D: <path>"
