# Slot C blind fork notes: suite-shape

Date: 2026-10-25. Host: this machine, 32 cores, bun 1.4.4. I ran whole-suite commands in /home/ivan/Work/infra/akrogon. The other consultant ran test commands on the same host during part of this work. Each run below names its load average before and after.

## Commands I ran

- C1 `bun test --timeout=30000 --parallel=4` (full suite, default isolate). Load 19.21 before, 63.60 after. This run overlapped other work on the host: load was already 19 at start, and the other consultant's `bun test --parallel=2` process was present during the window. Result: exit 1, 140.7 s, 1163 pass, 4 fail, 11708 expect() calls. Fails: the suite-env test in tests/isolation.test.ts, plus 3 tests that hit their own 15 s, 20 s and 30 s timeouts.
- C2 `bun test --timeout=30000 --parallel=2 tests/isolation.test.ts tests/store-sweep-safety.test.ts`. Load 0.76 before, 0.78 after. Result: 9 pass, 0 fail, 0.54 s.
- C3 Same as C2 plus `--no-isolate`. Result: 9 pass, 0 fail, 0.54 s.
- C4 `bun test --timeout=30000 --isolate tests/flaky.test.ts tests/isolation.test.ts`, then the same with tests/check-names.test.ts in place of flaky. Load 0.87 before and after. Results: 6 pass and 3 pass, 0 fail. The C1 suite-env failure did not repeat in these small runs.
- C5 `bun test --timeout=30000 --parallel=4 --no-isolate` (full suite). Load 0.91 before, 26.34 after (the after value includes this run itself). No other test run was visible at start. Result: exit 0, 86.3 s, 1167 pass, 0 fail, 11714 expect() calls.
- C6 `bun test --timeout=30000` (full suite, current shape). Load printed 18.22 before and 14.80 after, but the 1-minute average was still falling from my own C5 run and only 3 tasks were runnable at start. Result: exit 0, 198.3 s, 1167 pass, 0 fail, 11714 expect() calls.
- C7 `bun test --help` and a read of https://bun.com/docs/test/parallel (2026-10-25). Used for flag facts only.
- One earlier attempt wrapped C1 in `/usr/bin/time`, which does not exist here. That attempt ran no tests.

## Q1: trim, parallel, or both

### Pick

Both. Trim first (O1a, O1b, O1c as already grouped), then add `--parallel=4 --no-isolate` to the `test` check. Record wall time at three points: baseline, after trim, after parallel. Judge the 20% against the original baseline.

Reason. Trim removes real waiting and work, so it helps on a busy host too. Parallel only spreads the same work over more cores, so it helps most when cores are idle. My quiet-host pair (C5, C6) shows parallel alone can cut wall time a lot (198.3 s to 86.3 s, 56% less, same 1167 tests and same expect() count). The trim estimate from the opening map is 19 to 23%, which straddles the target and is not yet measured. Together they clear 20% with margin, and each part still has value if the other underdelivers.

Cost. Two kinds of change in one job: test edits in three files plus a config string change. Proof takes several full-suite runs at each stage, about 3 minutes each at current speed. The gains overlap: once files run in parallel, the peer-wait sleeps hide behind other files, so the trim part will look smaller in wall time than it would alone. Do not add the two percentages.

### Rejected options

- Trim only. Rejected as the whole answer. The estimate is 19 to 23%, so it can miss the 20% target after all the work is done. O1c also needs a test-only seam for DISCOVERY_DEADLINE_MS that production cannot pick up, and that seam may not be small. Trim stays in the pick, but it should not carry the target alone.
- Parallel only, as `bun test --parallel` with defaults. Rejected. Default `--parallel` means one worker per core (32 here) and implies `--isolate`. My C1 run with only 4 workers and isolate on failed the suite-env test in tests/isolation.test.ts: `process.env.HOME` pointed under one suite scratch dir while `homedir()` pointed under another. It also leaves the known waste in place: the 11-second peer-wait budgets still burn wall time inside their file, and the nine-case named-target test still runs about 31 s as one test (31.3 s in C6, 30.7 s in C5) and still sets the floor for the whole run.
- Parallel only, as `--parallel=4 --no-isolate` with no trim. Rejected, but it is the strongest single change. It measured 56% faster on a quiet host (C5 against C6). It still spends the same total CPU, still sleeps through the peer-wait budgets, and its gain shrinks when other suites share the host. Shipping it alone also makes the trim work hard to justify later, because the sleeps no longer show in wall time.

### Evidence

- E1 (measured here, 2026-10-25) C6 against C5: 198.3 s serial against 86.3 s with `--parallel=4 --no-isolate`, both 1167 pass and 11714 expect() calls. One run each, same host, same day.
- E2 (measured here, 2026-10-25) C1: `--parallel=4` with isolate on gave 140.7 s and 4 fails under shared load. Three fails were test timeouts. One fail was the suite-env mismatch above.
- E3 (measured by A, 2026-10-25, INTAKE.md and slots/map-merged.md) Serial suite 191.9 s over 69 files, files one after another. tests/next.test.ts 49.2 s, tests/peer-wait.test.ts 22.8 s, tests/session-routing.test.ts 10.2 s. Recent green verify runs 190 to 235 s. My C6 at 198.3 s sits in that range.
- E4 (docs, https://bun.com/docs/test/parallel, read 2026-10-25) `--parallel[=N]` runs files across N worker processes, defaults to CPU core count, implies `--isolate`, and `--no-isolate` opts out. Under isolate each file re-runs preload scripts in a fresh global. Within-file concurrency is a separate knob and stays as configured.
- E5 (code read here, 2026-10-25) bunfig.toml preloads tests/isolation.ts. That file creates one suite scratch dir per process, points HOME, TMPDIR and the temp roots into it, sets the process as a child subreaper, and sweeps leftover processes on exit. It was written for one process per suite run.
- E6 (lock, issues/chart/akrogon-slow-phases/forks/suite-speed.md, 2026-10-02) `--parallel` was set aside when tests/next.test.ts was 64 s of an 80 s suite: one big file capped the gain. The suite is now about 192 to 198 s over 69 files, so the cap argument is weaker. That lock also measured timeout failures when several suites ran at once, which still applies.

### Pitfalls

- P1 Isolate breaks the suite scratch setup. Under isolate the preload runs again for each file, so tests/isolation.ts can create more than one scratch dir in one process and the env values can split (E2). Small runs did not repeat it (C2, C4), so a green small run proves nothing. Removed by: use `--no-isolate` and prove with full-suite runs, or first make tests/isolation.ts safe to run twice in one process and prove that on the full suite.
- P2 Timeouts under load. Some tests carry their own 15 s, 20 s and 30 s timeouts. Under shared load three of them timed out (C1). On this host several leaves can run suites at the same time, so quiet-host green is not enough. Removed by: cap workers at 4, then prove with repeated full runs including a load case with several suites at once, the same proof shape the 2026-10-02 lock used. If that case flakes, drop to 2 workers and prove again. Raising timeouts does not remove this; it hides it.
- P3 Files that only pass alone. Today files run one after another in one process, under one scratch dir. In parallel, files in different worker processes run at the same time, each under its own scratch dir. A test that uses a fixed path, a fixed port, or state outside its scratch dir can fail only sometimes. I found no fixed port use in a quick grep, and C5 was fully green, but one run is weak proof. Removed by: several full green runs and checking any new failure by name against the serial baseline.
- P4 Trimmed waits can pass for the wrong reason. A peer-wait budget set too low can expire before the code reaches the path under test. Removed by: keep the existing outcome and signal assertions, and keep budgets above measured startup time, as already noted in the debates.
- P5 Dirty comparisons. Load on this host swung from under 1 to over 60 during my runs. A single before and after pair can show a gain that is really a load change. Removed by: record load before and after each run, run each stage more than once, and compare matching test and expect() counts.

### Questions the fork does not ask

- X1 Is the 20% judged on a quiet host or under normal fleet load, with other suites running at the same time? Parallel wins big when quiet (E1) and can lose time to timeout reruns when busy (E2). The done criterion needs to name the load condition.
- X2 Wall time or total CPU: which one matters if they conflict? Trim cuts both. Parallel cuts wall time only when cores are free and uses more of the host at once, which can slow other leaves. If leaves per day is the real measure, the answer may differ.

## Q2: where the parallel setting lives, and how many workers

### Pick

Put it in issues/config.yaml, in `checks.test`: `bun test --timeout=30000 --parallel=4 --no-isolate`. Four workers.

Reason. That string is the full `test` check this fork measures. It is what verify runs at leaf and merge scope. Plain `bun test` runs by seats are usually single files, where parallel adds nothing. Four workers is the number I measured green at 86.3 s (C5). It is well under the 32-core default, which matters because each file already runs up to 20 tests at once and those tests spawn many subprocesses.

Cost. Seats who run several files by hand with plain `bun test` still get the serial shape, so hand runs and check runs differ. The fixed number 4 is tuned to this host. On a much smaller machine it may oversubscribe; on a bigger one it leaves speed unused.

### Rejected options

- bunfig.toml. Rejected. There is no documented bunfig key for parallel (C7, and INTAKE.md). The 2026-10-02 lock measured that an unknown bunfig key is ignored with no error, so a key placed there would look set and do nothing. bunfig stays the home for what it can hold: root, preload, concurrentTestGlob.
- package.json script. Rejected as the home. `scripts.test` is plain `bun test` today and does not even carry `--timeout=30000`, which shows the check does not flow through it. Changing it alone would reach human `bun run test` calls and miss verify. Mirroring the flags there as well creates two strings that can drift.
- The test files. Rejected. A test file cannot turn on file-level parallelism for the run it sits in. The preload also cannot: by the time it runs, the process layout is already fixed.
- Default worker count (one per core). Rejected. On this host that is 32 worker processes, each able to run 20 tests at once, on a host that also runs other leaves. C1 already showed timeout fails at 4 workers under load; 32 workers makes that worse, not better.
- Two workers. Not picked, not ruled out. I did not measure a full suite at 2 workers. It is the fallback if the load proof in P2 fails at 4.

### Evidence

- E7 (code read here, 2026-10-25) issues/config.yaml holds `test: bun test --timeout=30000`. package.json holds `"test": "bun test"` with no timeout. bunfig.toml holds root, preload and concurrentTestGlob only.
- E8 (docs and `bun test --help`, 2026-10-25) `--parallel=<val>` runs files in N worker processes, implies `--isolate`, defaults to CPU core count. `--no-isolate` keeps one global per worker. With one effective worker, files run in the main process. No bunfig key for parallel is documented.
- E9 (measured here, 2026-10-25) C5: the exact picked flags at 4 workers ran the full suite green in 86.3 s. C1: the same worker count without `--no-isolate` failed.
- E10 (lock, suite-speed.md, 2026-10-02) Command flags in issues/config.yaml were set aside then because bunfig could hold that era's setting for every caller. That reason does not apply here: no single place reaches every caller for parallel, and the caller that matters for this fork is the `test` check.
- E11 (lock, issues/chart/check-reruns, taken 2026-10-01, plus the 2026-10-14 choice in Carries) `test` stays in `checks` and runs the whole suite. This pick changes only how that command runs the suite, not when it runs.

### Pitfalls

- P6 Check runs and hand runs drift apart. A seat running plain `bun test tests/next.test.ts tests/verify.test.ts` gets serial files and may not see a parallel-only failure. Removed by: name the exact `checks.test` command in the done criterion, and judge proof runs by that command, not by plain `bun test`.
- P7 Receipts key on the command string. Changing `checks.test` changes the command text, so old green receipts will not match the new command. That is correct here, since the run shape changed, but the first runs after the change will all be fresh full runs. Removed by: nothing needed; just do not count that first-run cost as a regression.
- P8 The longest file sets the floor. In C5 the named-target test alone took 30.7 s inside tests/next.test.ts, and that file finished last. More workers cannot beat the slowest file. Removed by: O1b splits that test so its nine cases overlap inside the file. Without O1b, expect the parallel gain to cap well above the ideal divide-by-workers number.
- P9 Worker count written for one host. The config travels with the repo. A future smaller host inherits 4 workers times 20 concurrent tests. Removed by: nothing in this fork; note it in the config change so a future host move re-checks the number.

### Questions the fork does not ask

- X3 Should the run also use `--timings`? Bun can record per-file times and then start the slowest files first and balance workers by time instead of file count (docs, C7). That targets the P8 tail directly. It adds a generated file that someone must own and refresh. Worth a measured trial only if the tail is still large after O1b.
- X4 Should tests/isolation.ts be made safe under isolate anyway, so the stricter mode stays open later? `--no-isolate` keeps today's shared-global behavior per worker, which matches the current serial run. Isolate would catch cross-file state leaks, but it costs a preload rework and per-file import re-evaluation. This fork can ship without it; the choice should be recorded as deliberate, not accidental.
