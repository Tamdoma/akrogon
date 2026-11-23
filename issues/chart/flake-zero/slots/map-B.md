# Map B: flake-zero

Code read on main at 814a2387. (H) marks what I measured or ran on this host on 2026-11-23. Nothing in the repo changed. Old logs I read came from `issues/chart/k1-compile-cache/direct/evidence.tar.zst` and `issues/closed/ai-budgets/evidence.tar.zst`, unpacked into scratch.

## Short answer

- The list has 172 rows, 133 titles, 271 flips. 144 rows are 9 bursts where one run lost many tests at once. Those are time caps hit on a slow host, and the caps are gone since f2318498 (11-22 21:24). 166 of the 172 rows last flipped before that commit.
- What still fails on main today is small: 8 tests, 4 causes, all in 5 files. Fixes for two of them sit on branches (71378d15, d7190d49).
- The cause that keeps coming back is that the suite uses the operator's real systemd user manager and leaves units in it.
- `akrogon flaky` can never print an empty list. It reads all history (`src/flaky.ts:201`, `src/verify.ts:108-118`), and 45 of its 133 titles no longer exist on main. The chart needs another proof of zero (Q1).

## 1. Groups

Reproduction on main (H), each set run 3 times at once with the configured command (`issues/config.yaml:9`):
- R1. session-reads, session-routing, hc-delivery: 90 of 90 passed.
- R2. watch-timer, run-units, door-reset, slow-merge, hc-identity, hc-start, run-permit, leaf-slices: 407 of 408 passed. The red was G4's run-units test.
- R3. next, batch-dispatch, leaf-stop, status, verify: 1,032 of 1,032 passed at load average 67.

Today's record since 08:35: 46 suite runs on six chart branches, 8 tests red, each on two or three branches.

### G1. Time caps under load. 144 rows, 203 flips. Fixed on main.
- Cause: per-test timeouts of 10 to 60 s and a 30 s suite limit. The logs I could read hold 666 "timed out after" lines: 500 at 15 s, 134 at 30 s, 32 at other values.
- Files: next.test.ts (49 titles), batch-dispatch (10), leaf-stop (6), plus the 45 titles that are gone.
- The logs of 10-24, 10-26 and 11-08 are gone. I grouped those by shape. The 11-08 burst matches the unit leak in `learnings/LESSONS.md:50`, so G2 fed G1.
- One burst is no flake: the 11-22 18:38 run failed 1,194 tests in 33 s with ENOENT on the suite temp root. That branch removed the run root under the suite.
- Fix: done by f2318498. One 120 s limit, inner waits share `WAIT_MS` 90 s (`tests/helpers.ts:22`). R3 confirms.
- Three shrunk budgets remain in tests: `AKROGON_START_PROOF_MS: '3000'` (`tests/hc-fixture.ts:185`, product 60 s), `AKROGON_PANE_WAIT_MS: '2000'` (`:248`, product 15 s), and a 10 s drain window (`tests/run-units.test.ts:711`). The first and third fail today (G2, G3).

### G2. The shared systemd user manager. 3 rows proven, 12 probable, 3 tests not in the list. Still on main.
- Cause a, leaked units. Every seat scope and run unit goes to the real manager (`tests/core-bin/systemd-run:4`, `tests/isolation.ts:67`). Each fixture has its own leaf slices (`src/scope.ts:8-11`) and nothing stops them.
  - 8eef2d0b (11-22 19:26) removed the only cleaner: until then any host pass stopped every empty leaf slice.
  - Counts (H): 9,937 leaf slices at 15:04, 1,450 at 15:06 after someone stopped them, 2,176 at 15:11 after my runs. 71378d15 reports 32,000 and 1.5 to 3.6 s per `systemd-run --scope`. I measured 0.11 to 0.51 s at 3,000 to 10,700 units.
  - Effect: the seat's scope move misses the 3 s proof window. `src/seat.ts:333-334` reads the cgroup once, finds the old one and exits 1.
  - Tests: session-reads :217, session-routing :259, hc-delivery :418, hc-start :172 (not in the list).
  - "A manual next ignores an inherited HC_TERMINAL_ID" fails at its first plain `next`. No environment leak is involved. I ran all three sets from an hc terminal with five `HC_` and `HERDR_` variables set.
  - It happened before: 32,575 `hc-shutdown` units on 11-08 (`learnings/LESSONS.md:50`).
- Cause b, parent slices. run-units stops `akrogon-test-<pid>-<n>.slice` (`tests/run-units.test.ts:60, :115-117, :247-250`). systemd keeps the parent `akrogon-test-<pid>.slice`. 465 are loaded (H).
- Cause c, a fixed unit name. `--unit=akrogon-run-stale0` (`tests/run-units.test.ts:974, :1007, :1015`). Two suites on one host collide. 2 reds today, 90 s each.
- Cause d, fixed before: any pass stopped other homes' empty slices (8eef2d0b). That covers hc-start "slot B starts under the live A" and release-any-phase "a wake after tab loss".
- Probable rows (logs gone or the log holds only an exit code, all start seats through the real manager): seven next.test.ts singles of 11-21 and 11-22, three of 11-08, "merged phase closes tab" of 11-09, the SIGKILL pass test of 11-08. hc-identity "dispatch never adopts" (`tests/hc-identity.test.ts:97`, 5 flips inside a G1 burst) belongs here too: its two reds were before 8eef2d0b.
- Smallest root fixes:
  - A1. Land 71378d15 (a stopped core stops its leaf slices).
  - A2. run-units stops the parent slice once, in its `afterAll`.
  - A3. The stale unit name takes `process.pid`.
  - A4. `src/seat.ts:333` waits until the cgroup matches, the seat ends or the proof deadline passes. Then a slow manager costs time, not a red. This is product code.
  - A5. One host cleanup now: stop the leftover `akrogon-test-*` and empty fixture leaf slices.

### G3. A fixed sleep or short window used as a signal. 6 rows, 24 flips, 1 test not in the list. Two still on main.
- watch-timer "a foreground swap and a transcript flip": `Bun.sleep(2600)` stands for "the timer has latched" (`tests/watch-timer.test.ts:998-999`). When the timer is slower it latches the new transcript, never sees a move (`skills/watch-issues/scripts/timer.ts:137-144`) and the wait ends at 90 s. 4 reds today.
  - Fix: wait for the timer's own line that follows its first lookup.
- run-units "a killed run-check pair refuses": a 10 s window (`tests/run-units.test.ts:711`) with one child process per loop. 3 reds today. Fix: `WAIT_MS`.
- Already fixed: door-reset "agy" (16 flips, by 16c85dae, b8883869, 816819ea, no red since 02:29), hc-identity "no session" (79d4bfd5), door-exchange (ced658fc, 3a6ab3b5), hc-listener (no red since 11-20).

### G4. A record is read before the thing it names exists. 2 rows. One still on main.
- run-units "a pass keeps the starting caller scope": the run record is live before its scope registers, and `stop-run` exits 1 (`tests/run-units.test.ts:1382-1386`). 4 reds today, 1 of 3 in R2.
  - Fix: d7190d49 on lane-first waits for the unit. The product gap stays (S2).
- slow-merge "an open episode": the helper looks for an open ledger row (`tests/slow-merge.test.ts:125-148`) and rewrites the file without the product's lock (`:142`, `src/verify.ts:631`). Last red 11-22 19:24. Fix: take the lock.

### G5. No cause found. 6 rows, 14 flips. Not on main today.
- verify "two simultaneous base runs" (two rows), run-permit "stop-run cancels a waiting run", status "overview", "the prompt delivery fault holder exit", "(log gone)". Logs are gone and R2 and R3 passed. No action.

## 2. Prevention

What exists:
- E1. `akrogon flaky` prints only. Nothing reads it for a decision. It misses a test that is red and never green on the same tree: three of today's eight.
- E2. `rerun` (`src/verify.ts:667-669`) reruns up to 3 names once at the land. This repo does not set it.
- E3. Known-red compares with the base, so a flake on a green base fails it.
- E4. The test freeze knows every changed test file and B judges each `Test-Change` line (`src/phase.ts:627-707`, `skills/check-issue/SKILL.md:45`).
- E5. Nothing runs a test twice on purpose. No skill line covers sleeps, shrunk budgets or host names. `tests/AREA.md:35` still says 30 s.

Options:
- P1. Repeat the changed test files. One more check in `issues/config.yaml` runs the test files the branch added or changed with Bun's `--rerun-each=5` and the same parallel flags. No akrogon code.
  - Checked (H): Bun 1.4.5 takes `--rerun-each` with `--parallel` (27 tests became 81).
  - Cost: time and load per run. 98 of 134 test commits since 11-16 touch one test file. The worst file, next.test.ts, adds about 5 minutes.
  - Limits: 5 runs catch a 1 in 3 flake 87% of the time and a 1 in 12 flake (watch-timer today) 35%. It cannot see G2: a leak builds over days and a name clash needs two suites.
  - Later cost: a leaf that touches a large file owns that file's old flakes.
- P2. Three rules in `tests/AREA.md`, judged by B where it already judges `Test-Change`. Wait on an event with `WAIT_MS`, never a sleep or a shorter window. A host-wide name carries the pid. What a test starts on the host, its fixture stops.
  - Cost: none in machine time. It depends on reading, and a missing cleanup is hard to see in a diff.
- P3. A text check for sleeps, literal unit names and numeric timeouts. It flags payloads such as `sleep 300` and blocks real work. No.
- P4. Set `rerun` and treat each recovered rerun as intake. It keeps merges moving and it tolerates flakes, which the operator ruled out. It needs a new rerun script. No.

Pick: P1. It is one config line on a native flag and it cannot be skipped. Add P2's three lines with it. They cost nothing and cover what P1 cannot see.

## 3. Separate

- S1. The suite shares the operator's user manager and host `hc` binary (`tests/hc-fixture.ts:22`). A1 to A3 clean up after it. Making a leak impossible (one owner slice per suite, leaf slices included) needs a product key for the slice parent. That is a chart of its own.
- S2. `stop-run` fails between the run record and its unit. Small product fix, A's call whether it rides here.
- S3. For lane-first: verify passes started by tests sit in the real `akrogon.slice` (`src/verify.ts:932`), the slice it changes.
- S4. For test-hygiene: stale lines (`tests/AREA.md:35`, `tests/run-units.test.ts:97-98`, `tests/hc-fixture.ts:191` names hc 0.1.18, installed is 0.1.22), and tests that assert only an exit code, so the log holds no reason (the four lines in G2).

## Forks

- Q1. Proof of zero. O1: the listed timestamps, no row newer than the last fix, plus a count of full-suite runs on main in a row, three at a time, all green (pick, no code). O2: a `--since` argument on `akrogon flaky`.
- Q2. A4 and S2 are product code. O1: A4 here, S2 separate (pick). O2: both here. O3: tests only.
- Q3. P1's count. O1: 5 (pick). O2: 10, which doubles the added time.
