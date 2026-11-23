# Slot D review, stop-archives, round 2

Verdict fix

- Base `f323d9fcc63ab43e802c96c82a23ff13876d1e4a`
- Head `0719390fd66baf0bbb86b1ab72a190d2ef5ed80f`

1. **F1 fixed.** A missing archive member now becomes `(log gone)` for failure-name lookups (`src/flaky.ts:54–67`). The closure fixture reported it through `akrogon flaky`, and the unreadable-archive test still rejected. A legacy head with a missing log fails the known-red check directly. A legacy base with a missing log cannot cover a real head name (`src/verify.ts:257–275`).
2. **F2 fixed in production.** I repeated the pause after publication and used `akrogon next` to close the owner. Both probes confirmed closure removed the log before verify resumed. The first-run probe stored both failing names. The rerun probe stored both original names under `rerun.failures` and only the repeated name under `failures` (`src/verify.ts:665–690`).
3. **F3 fixed.** The references and source notes now describe stored-name lookup, log deletion at closure, and the `.closing` check (`docs/reference/checks.md:95,145`, `docs/reference/files.md:30,71`, `src/AREA.md:18`, `src/run-check.ts:270–273`).
4. **F4. The new F2 regression test can pass with the old log reader.** The filesystem watcher can delete the file after verify has read it, and the final assertions establish only that deletion happened and that the row contains the name (`tests/verify.test.ts:273–299`). In a disposable checkout I restored only the first-run log read from before the fix. The test failed at normal timing because `failures` was missing. Pausing the test runner for 800 ms immediately after launching the verify subprocess let the same broken reader pass. Make deletion precede name extraction so the test reliably catches a renewed dependency on the log.

All 134 tests in the eight review files passed unmodified with `--timeout=120000 --max-concurrency=5`. `git diff --check f323d9fc..0719390f` passed.
