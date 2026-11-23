# Review brief D: one-test-cap (lane-first step A2)

You are slot D. Review origin/main..46b55bb2 in /home/ivan/.akrogon/worktrees/akrogon/one-test-cap. It is one commit: tests get one time limit (the suite's --timeout=30000). It removes inner wait caps and per-test timeout overrides below it. Why: issues/chart/lane-first/INTAKE.md "Agent findings (test-log census)" and "Load check results".

Implementer notes, with kept sites and risks, are in slots/impl-notes-caps.md.

Look for concrete defects only:
- a removed value that was product input or a negative-check window, so a test now passes vacuously or asserts nothing
- a test that can now hang past its timeout without ending (a leaked child, watcher or poll loop that keeps the bun process or later files busy under --no-isolate)
- a test whose own longer timeout was removed and now needs one
Run only the changed files: `bun test --timeout=30000 --max-concurrency=5 <files>`. Never run the full suite.

Write slots/review-D-caps-1.md: `Verdict ready|fix`, base and head, numbered findings with file:line and a scenario, then what you verified. Then run: hc send t126 "done D: <path>"
