# Case watch-consult-leaf-1

- Status: open
- Anchor leaf: watch-consult-leaf (akre2e)
- Observe line: slug=watch-consult-leaf phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=blocked@check.review delivery=- reason="merge verify red on main: test fails (BROKEN marker on main)"
- Class: failed, blocked on a base defect — merge verify fails on main itself because the committed file `BROKEN` ("staged base red") makes the test fail. This never recovers on its own; the leaf resumes only after a verified base fix.
- Grouping: no other failed leaves; nothing attached.
- Failing command: merge verify (akrogon verify with the repo's declared checks).
- Signature: signature.json (base ebf8d7d14ae993f993c9beb428f084e63eb97adf, leaf head same).
- Watch: hc t1, session akr-e2e-watch. Consultant: to be started by `akrogon seat --watch-consultant`.

## Log

- Opened by watch start check. Awaiting consultant start.
- Consultant (agy, t3) fixed base: `git rm BROKEN` as d51ce97, verify green (test+merge), fast-forward pushed to origin/main, worktree removed. Consultant closed after save.
- Resume attempt: `akrogon phase watch-consult-leaf check.review` failed — "Empty leaf branch: no changes against origin/main" (leaf head equals new main; it has no commits of its own). Per command-error rule, no further mutation this fire; leaf remains `failed` pending next fire's judgment.
