# Brief: verify got slow (suite wall 61 s on Nov 17, 172 s now)

Operator rules: less code is better code, the simplest native solution, and no flaky tests (zero, now and later).

Measured on an idle machine, same flags (`bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate`), JUnit per-file times:
- a8c64d1d (Nov 17): 1225 tests, 83 files, sum of file times 236 s, wall 61 s.
- 768ae7e5 (now): 1417 tests, 89 files, sum 427 s, wall 172 s.

Top files now: watch-timer.test.ts 118 s (17 tests; one file runs in one worker, so it is the critical path; sum/4 is 107 s), hc-listener.test.ts 45 s (was 7 s), run-units 27, next 26, hc-delivery 17, hc-window-calls 15.

F1. tests/watch-timer.test.ts (added Nov 17-21): its rig sets WATCH_TICK_SECONDS=2 (:172), and the tests wait for real boundaries. They also hold the watcher for about 2.5 intervals. Slowest tests: 25 s, 16 s, 14 s, 13 s, 10.5 s, 10.3 s, 7 s. skills/watch-issues/scripts/timer.ts:55 reads `Number(process.env.WATCH_TICK_SECONDS) || 1200`.
F2. tests/hc-listener.test.ts "a hung pass is killed at its deadline...": the test waits the full AKROGON_PASS_DEADLINE_MS. It was '500' on Nov 17. The flake work (f2318498, 23e2ddc6) made it WAIT_MS / 2 = 45 s (WAIT_MS = suite timeout 120 s minus 30 s), so ordinary passes can finish under load (comment at :262-264).
F3. issues/config.yaml test check (0349c523, Nov 23) reruns changed test files with --rerun-each=5, so a commit touching watch-timer.test.ts adds about 10 minutes.
F4. The verify slow alarm flags a run above 1.5x the 74 s normal and also at least 2 min over it (above 194 s). Idle verify today is about 190-230 s. A test wall near 110 s should bring verify under 194 s, so the alarm stops with no alarm change.

Options:
- O1: split watch-timer.test.ts into 3-4 files so parallel workers spread it. Code moves, no logic changes. Expected wall about 110 s.
- O2: shorter tick in tests (0.5 s). Cuts the most time, but real-time boundaries under load are a flake risk.
- O3: hc-listener hung pass gets a fixed deadline (about 10 s) instead of WAIT_MS / 2. Saves about 35 s of worker time. Risk: an ordinary pass under heavy load takes longer than the deadline.
- O4: something else, for example a fake clock for the timer, or a different deadline design for the hung pass.

My lean: O1 + O3.

Questions:
1. Is O1 + O3 the best, given less code and zero flakes? Is there a better O4?
2. For O3, what deadline is safe? Does the test need the deadline to cover ordinary passes at all?
3. Anything about F3 worth changing?

Read the cited files. Answer briefly with a recommendation and its main risk in slots/slow-B.md or slow-C.md.
