# Review brief: O1 build (B, C, D, independent)

Operator took O1 from /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/temp-gc-merged.md (see "Taken"). Build:
1. Code diff /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/o1-diff.patch (worktree /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-temp, rebased on main 0cbab42):
   - leaf temp moves to /var/tmp/akr-<uid> (src/config.ts)
   - the new-tab scratch wipe is gone (src/next.ts)
   - run-check and base-run captures (akrogon-io-*) now go in the run root through env.TMPDIR (src/shell.ts captureRoot, src/run-check.ts spawnLogged)
   - tests in tests/config.test.ts, tests/next.test.ts and tests/run-check.test.ts
2. Operator script /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/tmp-sweep.new, to replace ~/.local/bin/tmp-sweep (original: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/tmp-sweep.orig). It adds one loop over /var/tmp/akr-<uid>/*/*/* and /tmp/akr-<uid>/*/*/*. It deletes any entry that isn't run-* once its newest file is 2 h old, with no socket skip. The timer goes from hourly to every 15 min.

run-units (in check.review) also edits src/run-check.ts and src/base-run.ts. Flag anything that would conflict with it or break it: /home/ivan/.akrogon/worktrees/akrogon/run-units.

Review as an implementer. Write /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/o1-review-<your slot letter>.md: defects only, each with file:line and a concrete failure, or "no defects". Max 6 bullets. Change nothing else.
