# Limits check B: lane-first

Data: 768 akrogon suite logs from 2026-10-10 to 11-22 (evidence archives plus plain logs). 283 are full runs with `4x PARALLEL` (since 10-26). All figures below are from those 283 unless said. (H) marks what I ran on this host on 2026-11-22.

## Short answer

- 30 s is arbitrary. It is 1.2 times the suite's slowest honest test (24.9 s). Most tests that hit a limit hit a 15 s one, not 30 s.
- The limit has two jobs: end a hang, and name the hung test. In 283 runs it never caught a real hang. All 289 firings were tests that pass in other runs.
- A limit that adapts to the PC is less predictable than a fixed one. The part that should fit the PC is how many tests run at once.
- Pick: one limit of 120 s for every test, written in one place, no per-test numbers.

## Measurements

- M1. Red runs: 102 of 283. 18 had at least one limit hit. In 13, every failure was a limit hit. 84 had none.
- M2. Failing tests: 434. 229 hit a 15 s per-test limit, 39 hit 30 s, 21 hit another limit (10, 20, 25, 40, 75 s), 145 failed with no limit (134 of those in under 14 s).
  - The intake says 58% hit the 30 s limit. The log line names the limit, and 15 s fires 6 times as often.
- M3. Limit hits come in bursts. 7 runs hold 269 of the 289 hits (93, 63, 50, 25, 13, 13, 12).
- M4. No real hang. 175 tests hit a limit. 161 did so in one run, 14 in two runs in a row, none in three. Every one passes in other logs. Tests that hit 30 s pass in 2.0 s at the median (p90 7.1 s).
- M5. The tree holds ten different limits: 121 tests at 15 s, 56 at 30 s, 45 at 60 s, 11 at 75 s, 11 at 90 s, and 28 more at 10, 20, 25, 40 or 45 s. After 25799c4d, 134 numbers remain (56 at 30 s, 78 above).
- M6. 16 tests take over 10 s at the median. The slowest is 24.9 s (max 25.8 s). They wait on real timers, so load barely moves them.
- M7. Under 80 in flight, a test ran 10 times its own median at p99, 29 times at p99.9, 52 times at p99.99.
- M8. Tail of tests whose median is under 5 s: 325 passes took 15-20 s, 96 took 20-25 s, 39 took 25-30 s. 221 failed at a 15 s limit and 27 at the 30 s limit.
- M9. Suite wall: green p50 69 s, p90 149 s. The worst burst run took 431 s.
- M10. Bun 1.4.5 (H):
  - When the limit fires, the test is marked failed and its body keeps running. The run then exits, and the body's `finally` never ran.
  - `--timeout=0` means no limit. The run waits for the body.
  - A run ended with SIGTERM logs only the version line. It names no test.
  - `[test] timeout` in bunfig.toml is ignored. `setDefaultTimeout()` overrides `--timeout`.
- M11. Akrogon has no deadline for a check, a verify pass or a land. The only timer is the 5 s stop grace (src/scope.ts:46, src/land.ts:38, src/verify.ts:904).
- M12. 8 cores (H): full suite of 25799c4d, 4 workers by 5 concurrent, limit 120 s, pinned to cores 0-7 which other host work also used, inside `akrogon.slice`.
  - Wall 433 s. 1,330 passed. No Bun limit fired.
  - Slowest pass 60.8 s ("blocked-report real errors still report on automatic paths", history median 2.5 s, max 13.1 s over 663 logs, cause not traced). Next slowest 24.9 s.
  - 21 failed because of my scratch setup. They fail the same way alone at low load. 13 of them stopped at `WAIT_MS` (28 s).
  - That broken file, run alone under the 120 s limit, was still running at 300 s.

## 1. What a per-test limit is for

- It ends a hung test so the run finishes, and it puts the test's name in the red.
- With no limit, nothing ends the run (M10, M11). A land holds its repo for the attempt (src/admission.ts:130-137), so that repo's lane stops until a person stops the unit. The log then names nothing.
- A deadline on the check would do the first job only. So the limit stays.
- It is not a speed budget. 16 tests take over 10 s by design (M6).
- Each firing leaks, because cleanup does not run (M10). 25799c4d's `WAIT_MS` fixes that for tests that wait through the helper.

## 2. A bigger fixed limit

- Fixes: 15 s to 30 s (25799c4d) removes about 9 of 10 hits (221 of 248 in M8). Past 30 s the tail shrinks about 2.5 times per 5 s, so 60 s and above remove most of the rest. The burst runs (M3) turn from red into slow green.
- Hides:
  - A test that got 20 times slower stays green. Nothing catches that today either, since 30 s is 60 times the median test. The slow notice watches the suite's wall time (src/verify.ts:484-495).
  - Overload shows as wall time instead of red. Wall time is in the receipt, so it stays visible.
- A real hang costs one of 20 slots for the length of the limit. At 120 s a 69 s suite ends by 189 s, and it is red either way. Seen: 0 in 283 runs. A false red costs a land attempt and a repair round.
- The real cost is a mass breakage: hung tests times the limit, divided by 20 slots. 93 hits at 120 s is about 560 s. Every test hung is 2.3 hours, against 34 minutes at 30 s (M12 shows it on one file). Today's cut from 80 to 20 in flight already made this 4 times worse.
  - `--bail=N` bounds it by ending the run after N failures. It also cuts the failure list, which land-own-reds compares with base rows (its D4).

## 3. A limit that adapts to the PC

- From each test's own history (k times its median): needs a store and a first-run rule. To miss fewer than 1 in 10,000, k is 52 (M7). That gives the 25 s test 22 minutes. Worse than a fixed number, and red or green then depends on the PC's history.
- From cores or load at the start: the hits came in bursts (M3). Load at the start does not predict load during the run.
- The predictable form is a fixed limit plus a bound on tests in flight. The limit only has to exceed the slowest honest test times the worst stretch. Bounding in-flight bounds the stretch. So the PC-dependent number is concurrency.
- Today's `--max-concurrency=5` is fixed too: 20 in flight is 0.6 per core here and 2.5 per core on 8 cores. M12 says that still fits under 120 s on 8 cores, in one run. Under 30 s it would have been red. This weakens my earlier A1 (size from `nproc`): with a 120 s limit the fixed 5 may be enough.

## 4. Pick

- K1. One limit for every test: 120 s. It is the smallest round number above every limit already in the tree (90 s) and twice the slowest pass seen (60.8 s in M12, 54.3 s in the logs).
- K2. One place. Call `setDefaultTimeout(SUITE_TIMEOUT_MS)` in the preload that already exists (`tests/isolation.ts`, bunfig.toml:3), derive `WAIT_MS` from it, and drop `--timeout` from the config line.
  - 25799c4d writes the number twice (issues/config.yaml:9 and tests/helpers.ts:22). Change one and the inner waits fire first again.
  - A hand run of one file without the flag gets Bun's 5 s default today.
- K3. Delete the 134 per-test numbers that remain. All are at or below 120 s.
- K4. Keep the bound on tests in flight.
- Q1 for A: add `--bail=20` to cap a mass breakage, or accept up to 2.3 hours? It depends on whether land-own-reds can read a bailed run as "no names".

What would prove it:

- V1. Limit hits in the next 100 full runs: 0, against 289 in 283. A hit counts as a real hang only if the same test hits again in the next run.
- V2. Red runs where every failure is a limit hit: 0, against 13 of 102.
- V3. Slowest pass per run, read from the logs. A 30 s limit cut the tail off. A 120 s limit records it. If nothing passes over 60 s in 100 runs, 120 has twice the room it needs.
- V4. Small PC: two runs pinned to 8 cores through `akrogon check`. Mine was one run from a scratch checkout with 21 setup failures.
- V5. Green wall p50 stays near 69 s.

Limits of this data: the logs include leaf checks that were red while code was still wrong, so the 84 red runs with no limit hit are not false reds. I count runs where the intake counts distinct tests. Both hold: most failing tests are limit hits, and most red runs are not.
