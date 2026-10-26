# Suite shape

## Question

Q1 How should the full `test` check get at least 20% faster in wall time: trim the slow tests (O1a peer-wait budgets, O1b split the nine-case named-target test, O1c discovery-deadline waits), run test files in parallel with Bun's `--parallel`, or both?

Q2 If files run in parallel, where does the setting live so every caller gets it (issues/config.yaml `checks.test`, package.json script, bunfig, or the test files), and with how many workers?

### Carries

- Operator grouping 2026-10-25 "1a": O1a, O1b and O1c as one faster-suite job (INTAKE.md).
- Lock: issues/chart/akrogon-slow-phases/forks/suite-speed.md (2026-10-02): tests concurrent within a file via bunfig `concurrentTestGlob` at Bun's default limit 20, `setDefaultTimeout(30_000)` in a preload; `--parallel` foreclosed then at 63 s against 80 s when next.test.ts was 64 s of the suite.
- Lock: issues/chart/check-reruns (which checks run when) and the 2026-10-14 operator choice that `test` runs the whole suite (commit 7ad17efc).
- Done-criterion form: suite wall time at least 20% below a baseline measured on the same host, before and after recorded; no guessed seconds cap.
- Operator correction 2026-10-25, verbatim: "if we need to improve the background tools like bun etc, or replace it with something better, that's also an option. Look at it from a systemic point of view. I'm not locked into anything except for the overall workflow and how it works today. We can replace stack in the backend if it will improve something and if it doesn't change the actual workflow or make things worse. Communicate this to yourself and the agents."
- Related: slots/map-merged.md, slots/debate2-B.md, slots/debate2-C.md.

## Findings

Merged notes: [../slots/suite-shape-merged.md](../slots/suite-shape-merged.md). Rebuttals: ../slots/suite-shape-rebuttal-B.md, ../slots/suite-shape-rebuttal-C.md. Blind notes and addenda: ../slots/suite-shape-{B,C}.md, ../slots/suite-shape-addendum-{B,C}.md.

- better-than-training, measured 2026-10-25, bun 1.4.4, 32 cores: serial 187.6 s (A, load 0.7), 198.3 s (C), 201.0 s (B, load 19). `--parallel=4 --no-isolate` 86.3 s, 1167 pass, same expect count (C, load 0.9). Isolate runs at 2, 4, 8 and 32 workers all failed tests/isolation.test.ts "suite env is redirected" because the preload runs per file (A, B, C). 32 workers: 15 timeouts (A). 4 workers isolate under load 19-64: 3 timeouts (C).
- better-than-training, Bun docs https://bun.com/docs/test/parallel and `bun test --help`, read 2026-10-25: `--parallel[=N]` runs files in N workers, implies `--isolate`; `--no-isolate` keeps one global per worker; no bunfig key (A, B, C).
- better-than-training, shim and /proc sampling 2026-10-25: the runner uses little CPU; the cost is spawned processes. next.test.ts makes about 14,000 git calls, 82% from akrogon `next` itself (A). phase.test.ts 3,057 git spawns (C). peer-wait.test.ts burns about 200 CPU-s in 23 s wall in fake-herdr polling (B). Bytecode-prebuilt fake herdr: about 49% less CPU per call, named-target test 20% faster in one pair (B).
- Runner swap, runtime or language rewrite, `--compile` binaries, in-process CLI, daemon: rejected by A, B and C; they leave the spawned process tree or trade away process-boundary coverage.
- CPU of the `--no-isolate` shape is unmeasured (C R6).

## Taken

Operator 2026-10-25, verbatim: "1a | 2a | 3a | 4a" (after asking "elid" for a simpler restatement of the same round).

- Q1 1a: `--parallel=4 --no-isolate` on the full `test` check, plus O1b (split "named target equivalence" into nine tests in tests/next.test.ts) and O1a (shorter test-supplied budgets in tests/peer-wait.test.ts, the carried-exchange double wait included, outcome and signal assertions kept). O1c (discovery-deadline waits) is fallback only. Reason: measured 56% faster on a quiet host, green; removes the serial-file cost class instead of shaving files. Foreclosed: trim only (1b, estimate straddles 20%), prebuilt fake herdr in this job (1c, priced on one test), runner or runtime replacement (all slots), default 32 workers, isolate mode (breaks the suite scratch preload).
- Q2 2a: the setting lives only in issues/config.yaml `checks.test`. Reason: one place, the check is about 94% of green check time. Foreclosed: package.json script copy (2b). Accepted limit: plain hand `bun test` stays serial; proof runs use the exact check command.
- Q3 3a: done needs paired quiet-host runs at least 20% faster than serial with the same test and expect counts, and three suites at once all green with no new failures, with load and CPU recorded per run. If three-at-once fails at 4 workers, drop to 2 workers and re-prove. If 2 also fails, the discovery-deadline fallback returns. Accepted limit: a worker cap lowers load risk, it does not remove it (B).
- Q4 4a: akrogon's repeated git calls become their own chart after this one, starting with a census of every process one suite run starts. Chart: issues/chart/git-calls.

### Refined at final shape check (slots/suite-shape-final-check-B.md, suite-shape-final-check-C.md)

- Counts: splitting "named target equivalence" adds 8 tests, so the after run has the before test count plus 8 and the same expect count (B F22, C F1).
- Baseline: the exact old command `bun test --timeout=30000` runs on the unedited tree first, before any edit, and is recorded; the 20% is judged against it (C F2).
- Peer-wait budgets: each shortened budget sits above that case's scripted sleep sequence and subprocess startup, chosen per site, never one shared small value (C F3).
- Fallback end: if three-at-once also fails at 2 workers, the leaf stops failed with every run recorded and the chart reopens O1c as a new fork (A, checked by B and C).

### Handoff review 2026-10-25

`issues/config.yaml` is outside every leaf and direct worktree (src/next.ts sparse-checkout `!/issues/`), so `checks.test` is a step on main the door makes now (S1), and O1a plus O1b are leaf `faster-suite-files` (L1), done when the `test` check is green and faster than S1's recorded after-run on the same host, with coverage kept.

Operator 2026-10-25, verbatim: "1a | 2a" (after "elid"). 1a: S1 now, then L1. 2a: L1 takes the direct route.

### S1 proof runs 2026-10-25 (logs: A scratchpad s1/, summary copied to slots/s1-runs.txt)

- Paired alone: serial 215.7 s and 192.4 s; 4 workers 89.4 s (1 fail, 0.3 s peer-wait budget at load 30) and 84.4 s green; 2 workers 105.7 s green.
- Three at once: 4 workers 19/22/27 fails, 2 workers 9/5/5, old serial 1/5/4, at load 57 to 86 on 32 cores. Same test family fails in all three setups.
- So "three at once all green" fails with the old command too. S1 not committed, config unchanged.

Operator 2026-10-25, verbatim: "3a" to: fix the tests' load sensitivity first, then re-prove three at once; speed stays the goal and removing tests is not on the table. New fork: [load-sensitive tests](load-sensitive-tests.md).

### S1 landing 2026-10-26 (runs: slots/s1-runs.txt, l1-, nb- and q2- lines)

- Alone on main 51ee341c: serial 163.1 / 163.9 s, 4 workers cap 20 61.6 / 60.2 s, cap 4 103.3 / 101.0 s, all green with the same counts. Cap 20 kept (faster, both green).
- Beside one other serial suite: S1 63.2 / 61.8 s green both times, neighbour green. Two serial copies at once: each red on one 15 s cap test, 4/4.
- Two S1 copies at once on a quiet host: 5-6 fails each, all seven `tests/next.test.ts` names at their 15 s caps. Three at once: 39-42 fails each. The three-at-once bar fails, and two-at-once also fails, with the old serial command as well.
- Why the one-at-a-time `full:` line was removed on 2026-10-24: suites queued behind framework's ~20 min verify (operator "o5", then "remove full from everyone"). Replaying 14 days of real starts: a host-wide line costs akrogon about 16 h/week of waiting at serial speed, 4.2 h/week at S1 speed; an akrogon-only line at S1 speed about 4 min/week.
- Real history: akrogon runs overlapping another akrogon run were red 14-20%, alone 27%; reds rise with load from other repos (39% at 1.5+ concurrent heavy runs, 16% alone).

Operator 2026-10-26, verbatim: "o1, do it on autopilot, I'm going to sleep. If there are any decisions to be made for this particular issue, always prioritize speed and least amount of failures." O1: S1 at cap 20 with no waiting line. Foreclosed: O2 akrogon-only line (re-adds removed code to guard seven tests), O3 host-wide line (cost above).
