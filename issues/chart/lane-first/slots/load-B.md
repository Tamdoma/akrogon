# Load check B: lane-first

Code read in `/home/ivan/.akrogon/worktrees/akrogon/land-own-reds` (dc15047c). (H) marks what I ran or read on this host on 2026-11-22.

## Short answer

- The operator is right that load fails tests. I reproduced it: 9 failures in 800 tests, 3 at the 30 s cap and 6 at an inner 15 s cap.
- The largest cause is inside the suite. It keeps 80 tests in flight on any PC. Cutting that to 20 took the same wall time and had 0 failures.
- Per repo is better on this PC. A whole-PC line was shipped three times and removed within a day each time.
- CPU weights have no measured support. Hold them. Lead the chart with the suite's own fan-out and one cap per test.

## Measurement (H)

One file, `tests/next.test.ts` (200 tests), run in a scope inside `akrogon.slice`, `--timeout=30000`, `TMPDIR` on tmpfs. Four copies at once stand in for `--parallel=4`. Raw logs: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/5c1461d7-f0d8-4859-b80c-a319e2685b9c/scratchpad/`.

| Run | Tests in flight | Wall | Sum of test time | Median test | Slowest | Over 15 s | Failed | Load before, after |
|---|---|---|---|---|---|---|---|---|
| 1 copy, concurrency 1 | 1 | 146 s | 146 s | 0.50 s | 4.6 s | 0 | 0 | 58, 27 |
| 1 copy, concurrency 5 | 5 | 34 s | 163 s | 0.55 s | 4.7 s | 0 | 0 | 64, 58 |
| 1 copy, concurrency 20 | 20 | 13 s and 17 s | 215 s and 295 s | 0.73 s and 1.11 s | 8.8 s | 0 | 0 | 27, 32 and 51, 64 |
| 4 copies, concurrency 20 | 80 | 57 s | 3588 s | 3.16 s | 30.0 s | 17 | 9 | 50, 126 |
| 4 copies, concurrency 5 | 20 | 57 s | 1113 s | 0.79 s | 17.7 s | 4 | 0 | 109, 97 |
| 4 copies, concurrency 8 | 32 | 101 s | 3161 s | 2.92 s | 20.1 s | 9 | 4 | 23, 112 |

- M1. Past the point where tests in flight exceed the cores they can get, more concurrency buys no wall time. 80 and 20 in flight both took 57 s. It only stretches each test's clock, from a 0.79 s median to 3.16 s, until the 30 s cap is hit.
- M2. With fan-out cut, the inner 15 s cap fails next. At 20 in flight, 4 tests ran past 15 s. At 32 in flight, 4 tests died on the 15 s cap and none on the 30 s cap.
- M3. Limits. Each row is one run. Host load swung from 23 to 126 during the session from other work. The 32-in-flight row ran while load rose from 23 to 112 for reasons I could not separate, so it does not rank against the other two. One file is not the whole suite. The idle-host cost of lower concurrency on the full suite is not measured.

## Facts

- F1. The suite's fan-out is fixed, not sized to the host. `issues/config.yaml:9` sets `--parallel=4`. `bunfig.toml:4` makes every test concurrent. Bun's default `--max-concurrency` is 20 (`bun test --help`, 1.4.5) (H). That is 80 in flight on 32 cores and on 8 cores.
- F2. `waitFor` already follows events and uses the clock as a cap (tests/hc-fixture.ts:269-270). The cap is 15 s, half the test's own 30 s.
- F3. Only a repo's `full` runs queue, and only inside that repo. `awaitTurn` reads every repo's records and filters to its own (src/admission.ts:140-162, :176). A land holds its repo for the attempt (src/admission.ts:130-137).
- F4. Weights today: `akrogon.slice` 20, `app.slice` 100. Children of `akrogon.slice` have no cpu controller (H).
- F5. Heavy work runs outside the slice and the line. While I measured, the door's session ran the full akrogon suite as `timeout 600 bun test --timeout=30000 --parallel=4 --no-isolate` in `app.slice/hc-hold-41bd2769.service`, at weight 100 (H). A watch consult ran a framework test there too. A 20 s sample showed `app.slice` at 12.5 cores and `akrogon.slice` at 12.3 (H).
- F6. Host pressure does not predict framework land reds. Over 1,126 framework attempts with a pressure record, red share by CPU stall third is 43%, 22%, 37%. By disk stall third it is 39%, 35%, 28% (H, framework `issues/merge-attempts.jsonl`). My map's F3 used a two-week window and showed 38, 19, 63 of 138. Neither rises steadily.
- F7. A whole-PC line has been reversed three times: a host permit on 10-13 (same day), one full verify per host on 10-14 (56 minutes), a host-wide full line on 10-24 (same day). The per-repo line of 10-26 stayed (history-reversals.md C3, lines 48-60).

## Q-a. What removes the class

The class is a wall-clock cap on a test whose time is mostly waiting for a core. The wait has three sources: the run's own tests (F1), other akrogon runs, and work outside akrogon (F5). No one change covers all three. In order of effect:

- A1. Size the suite's fan-out from the host. One line in `issues/config.yaml:9`: `--max-concurrency` computed from `nproc` so that tests in flight stay near the cores a run can get. On this host that is 5 per worker. On 8 cores it is 1 or 2.
  - Gives: removes the self-inflicted source on any PC with no line and no waiting. Measured: same wall, failures 9 to 0.
  - Breaks: one file run alone on an idle host is 2.6 times slower (34 s against 13 s). The full-suite cost on an idle host needs two controlled runs before the divisor is fixed.
- A2. One cap per test. Delete the 15 s default in `waitFor` and in the 23 files that copy it, so a wait ends at the test's own timeout. Then set that timeout high enough that it only catches hangs.
  - Gives: removes the second failure point (M2). With fan-out bounded, the stretch is bounded (1.6 times at 20 in flight against 6.3 times at 80), so the value stops deciding results.
  - Breaks: a real hang reports later. A hang costs seconds. A false red costs a land and a repair round.
- A3. Heavy runs go through `akrogon check`. A suite started by hand skips the line, the slice and its weight (F5). This is skill text for the door and consultants, no code.
- A4. Host-wide cap: covers other akrogon runs. See Q-b.
- A5. CPU weights: they reorder the queue and do not shorten it. Leaf checks slow down and take the timeouts instead. They cannot see F5.

A1 gives the most. A1 and A2 together are the fix inside akrogon's repo. Framework's suite needs the same two by seed.

## Q-b. One line for the whole PC, or per repo

- (i) Per repo, as today. Nothing waits across repos. Each repo's heavy run is sized for the whole PC, so 4 repos overlap at 4 times the load. An 11-minute framework suite and a 4-minute akrogon land run together and both stretch. After A1 and A2 akrogon's side of that stretch is bounded.
- (ii) One host-wide line.
  - The 4-minute akrogon land that arrives behind an 11-minute framework suite takes 15 minutes.
  - Framework's lane is already about 83% busy in active hours (map-B F1). Akrogon, game and blepsis lands and every leaf's full verify would join it. Demand goes past one run at a time, so the queue grows until work stops arriving.
  - Two seats' leaf verifies in different repos now wait on each other.
  - A land waits behind other repos' leaf verifies unless a land-first rule is added. That is one more lifecycle rule.
  - The waiting shows up as idle seats and as merge waiters, which then hold back new starts.
  - 32 cores serve one run. On an 8-core PC this is the right behaviour.
- (iii) Per-repo lines plus a cap of N heavy runs from the host.
  - With N = max(1, cores / 8), this PC gets 4. That equals (i) here, because there are 4 repos. An 8-core PC gets 1, which equals (ii).
  - Code is small: one more count in `awaitTurn` under one host lock in place of the per-repo lock (src/admission.ts:165). A land and its own checks count once. No config key, so no rollback step.
  - It only works if each run is sized for cores / N, which is A1 again.
  - On this PC it would never bind. History P2: shapes that ship untested here get reversed.

Pick: stay per repo now. The operator's instinct matches the record (F7). Add (iii) only when a figure asks for it: after A1 and A2 land, count tests over 15 s in suite logs taken while two or more repos' full runs overlap. A small PC needs (iii). Without it, 4 repos overlap at 4 times its cores even after A1.

## Q-c. Does the destination still fit

- C1. CPU weights: hold. No measured support (F6). The land hold already keeps a repo's leaf checks off its land (F3). The larger weight gap is `akrogon.slice` 20 against `app.slice` 100, where F5 runs. Weights also turn on per-slice sharing for every leaf (my rebuttal R7). Take them up again only if land reds follow pressure after A1 to A3.
- C2. Host-relative slice memory: keep. It is independent and one line.
- C3. Merge waiters hold back new starts: keep. It is the only part of the destination that lowers total load.
- C4. Add A1, A2 and A3. They are the cause the operator asked about.

Proposed destination: a heavy run keeps no more tests in flight than the cores it can get, a test has one cap that only catches hangs, heavy runs go through `akrogon check`, a repo's merge waiters hold back its new starts, and slice memory limits are host-relative.

Seen, not traced: tests cut off at a cap left 2 to 4 processes alive in each of my scopes until I stopped them, and one live suite worker held 2,422 zombie children (H).
