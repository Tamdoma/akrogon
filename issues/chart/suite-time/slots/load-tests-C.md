# Slot C blind fork notes: load-sensitive-tests

Date: 2026-10-25. Host: this machine, 32 cores, bun 1.4.4. No full suites run here. Evidence base: slots/s1-runs.txt and slots/s1-logs/ (98 fail instances, 48 test names), the live test and source files, my targeted runs below, and issues/timings.jsonl.

## Measurements I ran

- M1 `bun test --timeout=30000 -t "the holder gets a batch record" tests/batch-dispatch.test.ts`, then `-t "a leaf re-entering merge queues" tests/next.test.ts`. Load 1.82 before, 1.92 after. Both pass. Single-test file walls 2.10 s and 5.69 s.
- M2 `taskset -c 0-1 bun test --timeout=30000 tests/batch-dispatch.test.ts`. Load 2.49 before, 10.13 after (the run itself). Result: 16 pass, 7 fail, all 7 timed out at 15000 ms. Same 7 names as the S1 triple runs.
- M3 Same as M2 plus `--max-concurrency=2`. Load 9.64 before, 7.72 after. Result: 23 pass, 0 fail, file wall 22.36 s against M2's 24.11 s with failures.
- M4 `bun test --timeout=30000 tests/batch-dispatch.test.ts` at default concurrency, then `--max-concurrency=4`, then `--max-concurrency=2`, no taskset. Load 7.18 before, 7.23 after. File walls: 5.74 s, 10.78 s, 20.41 s. All green.
- M5 `taskset -c 0-1 bun test --timeout=30000 -t "<five heavy next.test names>" tests/next.test.ts`. Load 22.39 before, 31.88 after. Another run was active on the host at start (91 runnable), so this run overlapped other work. Result: 4 pass at 11.6 s to 23.1 s each, 1 fail ("a leaf re-entering merge queues...") at the 15000 ms cap.
- M6 Two copies of `bun test --timeout=30000 -t "a finished leaf with a live tab keeps its slice" tests/leaf-slices.test.ts` started at the same time. Load 13.32 before and after. One passed, one failed, each in about 0.35 s. No load stress involved.
- M7 `taskset -c 0 bun test --timeout=30000 -t "budget keeps the last status" tests/peer-wait.test.ts`, three times, then three more times with six busy-loop processes pinned to the same core. Load about 11 to 12. All six passed. I did not reproduce this failure.
- M8 Overlap count over the `test` check_end rows in issues/timings.jsonl (403 runs, interval = end time minus duration_ms). Result in Q2 evidence.
- Grep and read-only analysis of s1-logs, tests/, src/. Scratch logs under /tmp deleted.

## Q1: what limit makes each test fail, and what change fixes it

### Pick

Fix by group. Four groups cover the 48 names. No timeout raises, no removed tests.

G1. Shared real systemd slices. Names: "a finished leaf with a live tab keeps its slice..." (6 of 10 runs), "a finished leaf slice named by a live run record is not stopped" (6), "a reconcile pass running inside a leaf slice..." (5), "akrogon phase merged inside the leaf slice stops no slice" (3), "merged and failed leaf slices with gone tabs..." (1).
Cause: not load. These tests use the real user systemd (tests/leaf-slices.test.ts:105-106 pins the real runtime dir and bus, sdrun at :247). Slice names are a hash of repo name plus slug (src/scope.ts:13-15), and every test fixture repo is named "repo" with fixed slugs such as "tabbed-merged" (:354) and "run-leaf" (:388). Two suites running the same test create the same slice. One suite's pass, stop, or cleanup kills the other suite's sleeper mid-test. Failures match: `isActive` false at :368 and :403, sleeper pid dead at :314 and :369, and the two marker tests poll 300 times 100 ms for a marker from a process inside the slice (:525, :563) that another suite stopped. M6 proves it: two copies of one such test started together on a quiet-ish host, one passes and one fails in 0.35 s.
Change: make the slug (or repo name) unique per test process in the real-systemd tests, for example a per-process suffix used in both the leaf state and every leafSlice() call in that test. tests/run-units.test.ts:45 already does this (`akrogon-test-${process.pid}-${serial++}.slice`) and its real-systemd tests never failed in S1. Same coverage, no speed cost. The product behavior is correct as-is: real repos on this host have distinct names, so real slices do not collide. Only the fixtures share a name.

G2. Per-test timeout caps on heavy end-to-end flows. Names: the bulk of the list, in tests/next.test.ts and tests/batch-dispatch.test.ts (the holder, interrupted-build, dirty-worktree and folder-cleanup tests at 6/3/3/3/3/3 runs; merge-queue, holder-wake, capacity, busy-seats, stale-prompt, blocked-report and swapped-seat tests; and most of the 1-count names). 71 of 98 fail instances are "timed out after Nms": 63 at 15000, 3 at 20000, 2 at 30000, 3 at 60000 (the named-target test, group G5). These files carry explicit timeouts on many tests (140 in next.test.ts, 14 in batch-dispatch.test.ts).
Cause: wall-clock caps against CPU-heavy test bodies. Each such test drives a whole flow through real CLI subprocesses. Alone they are not tiny (M1: holder test 2.10 s, re-entering-merge 5.69 s as single tests). Inside a file, 20 run at once (bunfig concurrentTestGlob, default limit 20), and S1 added 2 or 3 suites on top. Each test's share of CPU drops, its wall stretches past 15 s, and the assertion work never runs. M2 proves the class with no other suite present: pinning one batch-dispatch run to 2 cores reproduced the exact 7 failures. M5 shows pass times of 11.6 s to 23.1 s for the same kind of test under pressure, close to or past their caps.
Change: cut CPU per test, in this order. (a) Seed the precondition instead of replaying earlier flow through the CLI where the earlier flow is not what the test proves. The helpers already hold the seeding tools (seedRun, greenReceipt, verified, holding in tests/helpers.ts). (b) Split the longest multi-stage tests at stage boundaries, the O1b pattern, keeping a small number of full-flow tests so stage interaction stays covered. Start with names failing in 3 or more S1 runs, then re-count. Proof per file with the M2 method (`taskset -c 0-1` on one file), which is cheap and does not need triple suites. Target: no test in these files takes more than about a third of its cap when run alone (M1 style), so a 3x stretch still passes.
Cost note: this is the big group and the real work. It pays on every run, loaded or not, because the suite's total CPU is about 1450 s per run (S1 runs file: user plus sys) and these two files hold much of it.

G3. Short wall budgets and fixed sleeps inside tests. Names: "budget keeps the last status herdr returned" (2), "an unproven harness session change keeps waiting..." (2), "a session change during the turn wait is logged and nothing is sent" (1).
Cause: the test gives the code under test a wall budget that startup and poll latency must fit inside. tests/peer-wait.test.ts:903 passes budget "0.3" seconds; peer-wait sets its deadline at process start (skills/chart-issues/scripts/peer-wait.ts:261) and keeps the last status from its herdr calls (lastStatus starts null at :272). In the S1 logs the received status is null against expected "working" or "idle": the budget expired before the first status read landed. The budget "1" case at peer-wait.test.ts:590 shows "session-A" against expected "session-B": the scripted wait sequence did not advance far enough inside 1 second. tests/door-reset.test.ts:211 is the same class in sleep form: it sleeps a fixed 700 ms, then mutates the session in the fake db, assuming the subprocess has already read the first session; under load it may not have, so no "identity changed" is logged (:221). I could not reproduce the peer-wait case with core pinning and busy loops (M7), so this rests on the S1 log output plus the code paths above.
Change: two different fixes. For the peer-wait cases, raise those specific test-supplied budgets to a floor priced per site (subprocess startup plus the scripted sequence under load), the rule already recorded for L1 budgets. These budgets are inputs to the code under test, not per-test timeout caps, so this is not the O5 raise the operator refused; I show the difference plainly in the rejected list. Cost is at most a few seconds inside one file that runs its tests concurrently. For door-reset, remove the fixed sleep: wait until the subprocess has observably read the first session (poll the log or the fake's recorded calls for the first read), then mutate. Ordering by observed state, not by elapsed time.

G4. Status clock skew. Name: "overview reads multiple repos outside git..." (1). Cause: expected "0h 23m", got "0h 22m" at tests/status.test.ts:149. The fixture helpers stamp records with separate `Date.now()` samples (:40, :56, :82) and the status code samples its own now and floors minutes. Load widens the gap across a minute boundary. This is the known O4 defect class. Change: one captured epoch in the fixture helpers, expected values computed from it. This name should be named as owned by the O4 sibling chart or pulled into this fork's leaf explicitly, so it is not fixed twice or counted against the wrong done list.

G5. Named-target test at its 60000 ms cap (3 runs). Already owned by L1 (O1b split into nine tests) in the suite-shape lock. Nothing new here; the split also removes this name from the load list.

Cost of the whole pick: G1 is small and mechanical in one file. G3 is small. G4 is small. G2 is open-ended unless bounded. Bound it by the S1 fail counts: fix names failing in 3 or more runs first (11 names outside G1/G5), re-run the per-file taskset proof, then decide with fresh counts whether the tail needs work or a Q2 decision.

### Rejected options

- Raise per-test timeouts (15 s to 30 s and similar). Rejected. This is O5, which the operator answered "2 no". Shown plainly: proposing it contradicts that answer. It also buys nothing but slower red feedback, and at some load it fails again.
- Lower global `--max-concurrency` in the check command. Rejected as the fix, with both measurements on the table. It works under pressure (M3: 2-core batch-dispatch goes from 7 fails to green), because fewer test bodies stretch less. But on a normal host it slows the same file from 5.74 s to 20.41 s at limit 2 and 10.78 s at limit 4 (M4). The fork requires the suite to get faster, not slower. There is also no per-file concurrency knob in bun 1.4.4 (`bun test --help` shows one global `--max-concurrency`), so this cannot be scoped to the two heavy files.
- Mark the heavy tests `test.serial`. Rejected. Serial tests in tests/next.test.ts would run one after another on a quiet host and give back much of the within-file overlap the suite relies on. Same speed problem as the concurrency cut, file-local.
- Drop to fewer parallel workers, or back to serial, as the answer to these failures. Rejected. The serial triple in S1 failed too (1/5/4 fails). Worker count changes how much load one suite adds; it does not remove any of G1 to G4.
- Bun `--retry` on the check. Rejected. It reruns red tests and can turn them green by luck. That hides every group above, including the G1 collision, and adds a full extra test-body cost on red runs.
- Give the real-systemd tests a private user manager (a private dbus session and systemd user instance per suite), or move them off systemd. Rejected. The real user bus is part of what those tests prove (tests/leaf-slices.test.ts:207 comment). Unique names per process remove the collision at no coverage cost. A private instance is a large, flaky harness for the same proof.
- Replace bun, or call the CLI in process, to cut G2 body cost. Rejected here for the reasons recorded in the suite-shape systemic round: the spawned process tree is the coverage, and akrogon's own repeated git calls are off route in chart git-calls (census first). G2's seeding and splitting cuts test-side replay without touching that chart's ground.

### Evidence

- E1 (recorded by A, 2026-10-25, slots/s1-runs.txt) Three at once: 4 workers 19/22/27 fails, 2 workers 9/5/5, old serial 1/5/4, load 57 to 86. Alone: serial 192 to 216 s green, 4 workers 84 s green and 89 s with one 0.3 s-budget failure.
- E2 (recorded by A, 2026-10-25, slots/s1-logs) 98 fail instances across 10 overloaded runs. 71 are timeouts (63 at 15000 ms). The rest are expect failures: leaf-slices isActive and marker checks, peer-wait status null and session mismatch, door-reset missing log line, status minute mismatch. I grouped them from the log text.
- E3 (measured here, 2026-10-25) M6: the G1 collision reproduced with two concurrent copies of one test at load 13.32, one pass and one fail in about 0.35 s each.
- E4 (measured here, 2026-10-25) M2 and M5: G2 timeouts reproduced by CPU pressure alone (2-core taskset), including the exact 7 batch-dispatch names. M1 gives the same tests' unloaded durations.
- E5 (measured here, 2026-10-25) M3 and M4: `--max-concurrency=2` cures the 2-core case (22.36 s green against 24.11 s with 7 fails) and slows the quiet file about 3.5x (5.74 s to 20.41 s). Both numbers matter; the second rejects it.
- E6 (measured here, 2026-10-25) M7: the peer-wait 0.3 s budget failure did not reproduce under 1-core pinning with busy loops, 6 of 6 pass. G3's peer-wait cause rests on E2 log output (status null) plus the deadline code path, not on a local repro. Tier: read from logs and code, not locally proven.
- E7 (code read here, 2026-10-25) src/scope.ts:13-15 (slice name hash), tests/leaf-slices.test.ts:105-106, :247, :354, :388, :525, :563 (real bus, fixed slugs, marker polls), tests/run-units.test.ts:45 (unique name precedent), tests/peer-wait.test.ts:590 and :903 (budgets "1" and "0.3"), peer-wait.ts:261 and :272 (deadline and lastStatus), tests/door-reset.test.ts:211 and :221 (fixed sleep, expected log line), tests/status.test.ts:40, :56, :82, :149 (separate time samples, minute expectation).

### Pitfalls

- P1 G1's fix must cover every path that derives the slice in a test: leaf state slug, test-side leafSlice() calls, cleanup, and control slices. A half rename leaves a test watching a slice its own pass never touches, which passes for the wrong reason. Removed by deriving every name in a test from one per-test slug value.
- P2 Seeding in G2 can quietly drop coverage: a seeded receipt proves less than the flow that used to produce it. Removed by keeping the producing flow covered somewhere in the file, and by seeding only steps the named test does not assert on.
- P3 Splitting in G2 changes test counts. The S1 and L1 done criteria count tests and expect calls. Removed by recording count deltas per split, the same way the named-target split records plus 8.
- P4 The taskset proof is not the fleet. Two pinned cores give steady pressure; real overlap gives bursts. A file green under taskset can still fail in a burst. Removed by keeping the final proof at suite level (Q2) and using taskset only as the cheap per-file gate while fixing.
- P5 Raising peer-wait budgets in G3 fights O1a, which shortens budgets in the same file. Both are per-site floors against measured latency. Removed by pricing each site once, in whichever leaf lands second, with the loaded floor winning where they conflict.
- P6 G4 sits in a sibling chart. Fixing it here without marking ownership invites a duplicate leaf. Removed by naming its owner in the handoff.

### Questions the fork does not ask

- X1 Are there other deterministic host-wide names like G1's slices outside leaf-slices: fixed unit names, fixed /run paths, the real HOME? run-units is clean (E7). A grep-level audit for other real-bus or fixed-name tests is cheap and would catch the next G1 before a chart does.
- X2 Should the suite record per-test durations every run (bun JUnit output already carries them) so the next load failure arrives with each test's unloaded duration attached? G2 triage needed alone-runs (M1) that a duration report would have supplied.

## Q2: what overload is the bar

### Pick

Two levels. The hard bar: two full suites at once at the chosen worker count (`--parallel=4 --no-isolate`), all green. Above it, three at once is run and recorded, and its result is reported, but a failure there that is only G2 wall-clock stretch goes back to the operator instead of failing the leaf.

Reason: two is what the recorded history actually does, with margin. Three sustained is beyond recorded use, and no wall-clock timeout survives arbitrary overload: a test needing about 6 s of CPU (M1) with a 15 s cap fails whenever its CPU share stays under about 0.4 of a core, which a load of 86 on 32 cores can do to any test. A bar has to be a number the fleet really hits, or the leaf can only pass it by the rejected moves above (timeout raises, concurrency cuts that slow the quiet suite, retries).

Plainly: this revises the suite-shape Taken Q3 bar of "three suites at once all green" (reaffirmed in the operator's "3a"). Adopting my pick is an operator call, not something the leaf decides alone. If the operator keeps three as the hard bar, then G2's split and seed work must be sized until three passes, and my estimate is that costs materially more test rework than the 3-or-more-runs first pass in Q1.

Cost: the proof is two suite runs at once instead of three, about 3 minutes each at the new shape. The recorded three-at-once run still costs one round of three.

### Rejected options

- Three at once as the hard bar, unchanged. Rejected as my pick, for the reason above: it prices the leaf against an overload the history shows for a total of 205 seconds (E8), and for G2 it has no fix that keeps both the outcomes and the speed goal except deep test rework of unknown size. It stays the reported level.
- Quiet host only (one suite). Rejected. Two-suite overlap is common in the record (E8) and the failures in G1 happen at any overlap at all, even two copies of one test (M6). A one-suite bar would declare this fork done while the fleet keeps hitting G1 and G3.
- A load-average number as the bar (for example "green at load 60"). Rejected. Load average mixes every process on the host, including other work nobody controls during the proof. Suite count at a named command is reproducible; a load number is not.
- Four or more at once because history touched 4 once. Rejected. One start reached level 4 and level 4 lasted about 1 second in total (E8). That is two runs crossing, not a working state.

### Evidence

- E8 (computed here from issues/timings.jsonl, 2026-10-25) 403 recorded `test` check runs, interval from end minus duration_ms. Starts by level: 313 started alone, 68 started as the second, 21 as the third, 1 as the fourth. Wall seconds by level: 49703 s at level 1, 3952 s at level 2, 205 s at level 3, about 1 s at level 4. So 92% of test-check wall time ran alone, 7% at two, 0.4% at three. Max overlap ever recorded: 4, briefly, on 2026-10-15.
- E9 (recorded by A, slots/s1-runs.txt) One suite alone already uses about 1450 CPU-seconds (user plus sys) per run; at 4 workers that is about 85 s wall, roughly 17 cores busy while it runs. Two such suites ask for about 34 cores on a 32-core host, three for about 51. Three at once is a sustained 1.6x oversubscription before any other host work, which matches the observed load of 57 to 86 once the 20-per-file test concurrency bursts are added.
- Caveat on E8: timings.jsonl records this repo's checks. Other repos' suites and agent work on the same host add load it does not show. That is a reason the hard bar is two full suites and not one, and a reason to keep recording load on every proof run.

### Pitfalls

- P7 A two-suite bar can be gamed by timing: start the second suite as the first finishes and call it overlap. Removed by starting both in the same second, as S1 did, and recording start times.
- P8 History moves. If leaf parallelism on the host grows, two stops being the real level. Removed by re-reading E8's count from timings.jsonl at proof time instead of treating 2 as permanent.
- P9 The reported three-at-once run will sometimes pass by luck. One green triple does not prove the class is gone (S1's serial triple ranged 1 to 5 fails across three runs of the same command). Removed by reporting all runs run, not the best.

### Questions the fork does not ask

- X3 Should akrogon limit how many full `test` checks it starts at once across leaves (a check-level concurrency cap in verify), instead of asking tests to survive any overlap the scheduler creates? That is a workflow-adjacent product change outside this fork's test-only scope, but E8 shows the overlap is created by akrogon's own scheduling, and capping it at 2 would make my hard bar true by construction. It trades leaf throughput for predictability and belongs in its own fork if wanted.
