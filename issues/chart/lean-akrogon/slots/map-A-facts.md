# A map facts (Explore lookup, spot-checked)

- Land red path, main: src/land.ts:213-241. First red exits to repair. A rerun happens only under taken8Trigger (land.ts:143-168): the leaf's previous merge run sat on the same head and the same unit failed there too. So P1's "no rerun" is partly stale: a second visit with the same head and same failing unit reruns; a first red never does. Spot-checked.
- Nameless failures: verify.ts:370 uncoveredMainRedUnits returns undefined when any name is nameless; flaky.ts:27-49 names().
- max_active: next.ts:376-418 activeCount excludes merged, failed, merge. Leaves in merge never count (next.ts:1261 message). Default machine max_active 3 (config.ts:25). So the merge queue has no backpressure on new work.
- Temp: config.ts:375-391 leafTempRoot /var/tmp/akr-<uid>, retired /tmp/akr-<uid> swept (reconcile.ts:1432). `.akrogon-kept` written run-check.ts:466 on red; reconcile.ts:331,1171 skip kept roots. Remover on leaf release not located (low confidence).
- NODE_DISABLE_COMPILE_CACHE=1 only at seat.ts:299; run-check.ts:45 and verify.ts:882 only forward it.
- readTimings: timing.ts:96, called timing.ts:142 (recordWait), next.ts:703, timing-report.ts. repoInventory: 12 call sites, no per-pass cache.
- systemd/akrogon.slice: CPUWeight=20, MemoryHigh=64G, MemoryMax=96G, MemorySwapMax=0; no IOWeight. Installed by install.ts:40-41. Fixed numbers, not host-sized.
- fix_rounds: config default 3, increment phase.ts:238-241; no cap found.
- Verify worktree per run verify-<id> (verify.ts:650,678), removed in finally (847). akrogon itself runs no bun install there; setup is the repo's configured command.
- akrogon-test-*.slice created only by akrogon's own tests (tests/run-units.test.ts:48, readiness.test.ts:51); no src stopper.
- Base comparison: verify.ts:1104-1124 runs full verifyCommands on base (reuses a green base run if present).
