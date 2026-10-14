# Comparison record: test (check run retry)

- Command: akrogon run-check --name test -- sh -c 'flock ... bun install --frozen-lockfile && akrogon guard own-modules && bun test --timeout=30000'
- Args: as above; cwd: /home/ivan/.akrogon/worktrees/akrogon/run-units; scope: repo
- Material conditions: host akrogon.slice under other-seat memory pressure; run admitted in a dip
- Leaf rev: run-units @ 6f82675 (first run) → @ 95010f3 (retry); counterpart: none needed
- First run log: /tmp/akr-1000/5d20/358c1156/checks5/test/log (exit 1, 898 pass / 4 fail)
- Retry log: /tmp/akr-1000/5d20/358c1156/checks6/test/log (exit 0, 902 pass / 0 fail)
- Per failing unit:
  - tests/next.test.ts "named target equivalence: owner name matches folder path from root, subfolder and worktree" — fail (60 s timeout) → pass on retry: **inconsistent**; `git diff $AKROGON_BASE...HEAD` touches no file next.test.ts exercises (diff touches src/admission, scope, stop-run, run-check, base-run, akrogon.ts + run-units/run-permit tests).
  - tests/run-units.test.ts "stop-run stops only the caller pane scope runs", "SIGTERM ...", "SIGKILL ..." — fail (waitActive timeout) → pass after 6f82675 (sysctl bus pinning): diff-caused, fixed, not inconsistent.
- Result: inconsistent (green retry, no base run)
