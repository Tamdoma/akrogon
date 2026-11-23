# Design: flake-zero

## Findings (slots/map-B.md, slots/map-C.md)

- 172 rows, 133 titles. About 165 rows are history: timeout storms fixed by f2318498 (one 120 s limit), cross-home slice stops fixed by 8eef2d0b/dc426cd7, door races fixed by 16c85dae and others, and 37-45 titles that no longer exist. `akrogon flaky` reads all history, so it never prints empty. (B,C)
- Live on main today: about 8 tests, 4 causes (B,C):
  - Leaked user-systemd units: hc fixture leaf slices never stopped (tests/hc-fixture.ts core.stop/discard/sweepAbandoned), run-units parent `akrogon-test-<pid>.slice`, fixed unit name `akrogon-run-stale0` (tests/run-units.test.ts:974-1022). A slow manager makes `systemd-run --scope` miss the 3 s shortStartProof (tests/hc-fixture.ts:185) and src/seat.ts:333 reads the old cgroup once and exits 1.
  - Fixed sleeps or short windows as signals: tests/watch-timer.test.ts:999 (and :830), tests/run-units.test.ts:392 and :711 (`Date.now() + 10000`), tests/hc-fixture.ts:248 (2 s pane wait).
  - Acting before async state exists: tests/run-units.test.ts:1384 and :1198 (no waitActive), tests/slow-merge.test.ts backdate helper (races the pass end, rewrites the ledger unlocked).
  - Env leak: selfUpdateCli in tests/next.test.ts:4433-4443 does not clear AKROGON_RUN or put unitBin on PATH (C).

## Taken (A, full autopilot, 2026-11-23)

1. Fix every live cause at its root (B,C):
   - 1a. session-flake 71378d15 lands first (core.stop stops its leaf slices). This chart extends it to core.discard and sweepAbandoned.
   - 1b. run-units stops its parent test slice once in afterAll; the stale unit name carries the pid or a random id and the test waits for it to be active before run-check.
   - 1c. src/seat.ts:333 waits until the seat's cgroup is its leaf scope, the seat ends, or the start-proof deadline passes, so a slow manager costs time, not a red. (B A4; C listed it as separate; taken here because it is the product half of the same red)
   - 1d. watch-timer waits for the timer's own line after its first lookup instead of sleeping (the timer prints one line on first latch if none exists); run-units :392 and :711 use WAIT_MS; the 2 s pane wait override at tests/hc-fixture.ts:248 goes.
   - 1e. run-units :1384 and :1198 wait for the unit to be active (lane-first already carries :1384; whichever lands second drops its copy); slow-merge gates its check on a ready/release file and rewrites the ledger under the product's lock.
   - 1f. selfUpdateCli clears AKROGON_RUN and puts unitBin on PATH, as cli() does.
   - 1g. One host cleanup after landing: stop empty fixture leaf slices and `akrogon-test-*` slices.
2. Prevention (B P1+P2, C O2):
   - 2a. One more configured check in issues/config.yaml runs the test files the branch added or changed against its base with Bun's native `--rerun-each=5`, same timeout and parallel flags. No akrogon code. Skips when no test file changed.
   - 2b. Three rules in tests/AREA.md, which B already judges with Test-Change: wait on an event with WAIT_MS, never a fixed sleep or shorter window; a host-wide name carries the pid or a random id; what a test starts on the host, its fixture stops. tests/AREA.md's stale 30 s line is corrected.
   - Not taken: a text-pattern lint of test files (C O1). It judges wording, flags legitimate payloads like `sleep 300`, and blocks real work (B P3). Not taken: `rerun` (masks flakes).
3. Proof of zero: no new `akrogon flaky` row after the landing, and three full-suite runs on main at once, twice in a row, all green, with the leaf-slice count flat. (B Q1 O1)
4. Separate, recorded only: `akrogon flaky --since` so the list ages out history (C S1); one owner slice per suite so leaks are impossible (B S1).

## Final shape corrections (slots/final-B.md, slots/final-C.md; A picks)

- 1c corrected: the seat waits for its cgroup to be its leaf scope before firstTask (src/seat.ts:310), bounded by its own window (PANE_WAIT_MS, 15 s, src/seat.ts:43), ending early if the seat ends. firstTask's start-proof window then starts after scope entry. The once-only check at :333 goes. (C order, B bound; B and C both showed the start-proof deadline is spent by :333)
- 1a corrected: ownership is recorded where the slice is made. tests/core-bin/systemd-run appends each `--slice=` name to a file in the core's runtime folder; stop, discard and sweepAbandoned read it before removing the folder and stop exactly those slices. The label lookup from 71378d15 goes. (B; the session-flake helper is building this as its D round 1 fix)
- 1g and proof 3 corrected: the one-time cleanup and the slice counts run while no akrogon-verify-* service is active, counted before and after the runs. (B)
- 2a corrected: the repeat check is listed in `full:` after `test` so it queues on the repo line and runs only after a green suite; the file list is `git diff --name-only --diff-filter=ACMR ${AKROGON_BASE:-origin/main}...HEAD -- 'tests/**/*.test.ts'`; an empty list exits 0. (C)

## Added (A, 2026-11-23)

- 1h. stop-run stops each unit with its own call, as stopRunUnits does (src/stop-run.ts:44 vs src/scope.ts:107), so a run whose scope is not loaded yet or already gone does not fail the whole stop. Found by the session-flake helper on run-units :1386 (B map S2). The test half (waitActive at :1384) rides session-flake.
- 1h moved (A, after D round 2 F6/F7): stop-run's per-unit stop is redone on top of lane-first, whose stopRunUnits keeps a failure unless the unit's cgroup is empty and whose launch order covers the early-stop window. flake-zero lands without it.

## Waits read once when the snapshot arrives (delivery-flakes, D round 1 F1-F2)
B and C both picked O3, in two forms: B a fresh read when the snapshot arrives (slots/reread-B.md), C a timer read at min(ms/2, 5 s) (slots/reread-C.md). Decision by A: B's. B measured it under load on hc 0.1.22. 1.2% of changes made during subscription start were lost, and a read started when the snapshot arrived saw 48 of 48. Changes made after the snapshot arrived got their event 8,000 of 8,000. So the drop window closes before the client has the snapshot, and one read on the snapshot covers it. That removes the heartbeat path (F2) and late results (F1). waitFor and the fixture waitFor take `current` from `hc get` on each snapshot line (this includes `missed`), and check `settled` after that await. waitForDoc and listen.ts already read after the snapshot. Accepted: B's L1 (an event queued during the read is merged onto newer state, and both start predicates accept either order). Not covered: drops outside subscription start (none seen).

## State waits read, the agy retry follows events (D round 2 F3-F4)
B and C both agree that the snapshot read belongs only to state-only waits and the agy retry keeps the base behaviour (slots/agy-B.md, agy-C.md). Decision by A: B's split. It supersedes the previous block's waitFor change. waitFor in src/hc.ts goes back to its body on main, and agyTask keeps it. A new `waitForState(session, address, until, ms)` of about 8 lines calls waitFor with a predicate that reads `hc get` and tests the fresh terminal, so nothing merged or replayed reaches the predicate. Its product caller is the first-task proof. The equality skip is deleted. The fixture keeps its read on the snapshot and gets the settled check after it (F4). Accepted: B L1, an agy report lost in the few ms of subscription start (estimated under 1 in 10,000 starts under heavy load, none observed). The exact fix is upstream: a seq in `hc get`. status_ms marks a state change, not a report (B point 7).
