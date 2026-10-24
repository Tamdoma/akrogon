# Direct report: host-run-load

Head f474544bc334f4510d03d1057a3c0b7900e1b161, base 736067bf474d6f86b3fecb55227c8ef3ac03d940.

Refresh: rebased from base 0ed00de6 / head 5fc3a611 onto origin/main 736067bf (host-reconcile-session landing), no conflicts. Review B round 1 was on 0ed00de6..5fc3a611.

Commits: 292d97a8 tests, bad2c0f7 test expectation fix, 1f1efac0 feature, 940fa238 nested test (red on 1f1efac0), then the observation fix, 3444d9b7 nested fix, docs.

Changed files:
- src/config.ts: `full` list, refined against checks and merge_checks.
- src/run-check.ts: passes `full: repo.config.full.includes(name)` to admission.
- src/admission.ts: `waiting` state and `full` field on records (default false, old records read as not full); fullSuites() host-wide, holders (live or ended) before waiters by since; awaitFullTurn polls each 1 s under admission.lock shared, the slice lock and an exclusive runs/locks/full-suite lock, rewrites its record if it vanished, prints the holder once per change; nested exemption for a full run only under a full parent.
- src/status.ts: full suites table (REPO, LEAF, CHECK, STATE, AGE) with the shared renderer, only while one waits.
- docs/reference/config.md, docs/reference/checks.md, src/AREA.md.

Proof runs (akrogon run-check, holder direct/):
- red-first: 5 fail before code (check-red-first-1792855736492-2492126.log).
- targeted2: run-permit 14 pass (check-targeted2-1792855803962-2831516.log).
- red-first-nested2: nested case red on 1f1efac0 (check-red-first-nested2-1792855857081-*.log).
- targeted4: 6 full cases pass (check-targeted4-1792855943230-3034085.log).
- deliberate-break-nested: removing the nested fix turns its case red (check-deliberate-break-nested-1792855974586-3036485.log).
- typecheck clean.
- cross-repo (B F1): f474544b adds a second repo with its own remote sharing one admission home; its full suite waits for the first repo's, a light run starts at once. A deliberate per-repo lock turned it red.
- full verify on f474544b (run 468f70d9): format, setup, typecheck 0; test 1122 pass, 1 fail: "overview reads multiple repos outside git..." TIME cell 0h 22m vs 0h 23m (clock minute boundary under load 27-44; status TIME is not touched by this diff). Log check-test-1792856606439-3826240.log.
- retry-overview: same test green (check-retry-overview-1792856678097-354773.log). Marked inconsistent.
- full verify rerun on f474544b (run 5c595e8f): format, setup, typecheck 0; test 1120 pass, 3 fail, all timeouts at load 29-45 (next.test.ts: prompt delivery fault holder exit 15 s, re-entering merge queue 15 s, named target equivalence 60 s). Different tests from the first run. Log check-test-1792857015747-363259.log.
- retry-load3: those 3 green, 7 pass (check-retry-load3-1792857071071-1426192.log). Marked inconsistent: host load from other repos' suites, the incident this change bounds, not yet deployed.
- full verify third run on f474544b (receipt 5e086cce): green. format, setup, typecheck 0; test 1123 pass, 0 fail (check-test-1792857278791-1475716.log). This is the landing receipt.

Known limits: ad-hoc run names unbounded; a killed holder's processes may run up to ~5 s (TimeoutStopSec) after the next starts; a stopped head waiter blocks the line and shows in status.
