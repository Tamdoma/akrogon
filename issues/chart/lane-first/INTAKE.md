# Intake: lane-first

## Scope

The land run and its verify pass get a higher CPU share than leaf work inside akrogon.slice, slice memory limits are host-relative, and a repo's merge waiters hold back its new starts.

Covers: #149 P5, Q3.2, backpressure. Opening map and picks: issues/chart/lean-akrogon/slots/map-merged.md (with map-B.md, map-C.md, rebuttal-B.md, rebuttal-C.md, history-reversals.md).

## Provenance

- Split from issues/chart/lean-akrogon (Tamdoma/akrogon#149 stays there)
- Operator: /chart-issues 2026-11-22T17:54Z, verbatim in issues/chart/lean-akrogon/INTAKE.md


## Operator source (2026-11-22, chat)

"Can we fix this systemically? Can you look at both consultants and see if this can be fixed? I feel that a lot of tests are failing because of this. Look into the logs and see if I'm correct. We need to make sure this is fixed as well. Also, what happens when everything starts standing in a line on the entire PC? Are we going to do it on a per repo basis? Isn't that better?"

## Agent findings (A, 2026-11-22, test-log census)

- F-load. 203 akrogon test-suite logs from the last 14 days (packed evidence archives plus plain logs). 88 were red. Excluding 3 mass breakages (cross-home temp deletion, fixed in land-own-reds Q4), 85 normal red runs held 290 distinct failing tests: 58% hit Bun's 30 s per-test timeout, 9% hit an inner 15 s wait or ran over 14 s, 30% were assertions or other, 1% ENOENT. Simple tests that pass at low load take 15 s under load (e.g. reconcile "ended claude agent worktree is removed…" passed at 15098 ms).
- `akrogon flaky`: 166 tests with 262 flips. The top one is agy door-reset (15, a helper crash, not a timeout, see test-hygiene INTAKE). Next are the "named target equivalence" group (3-4 each, 30 s timeouts).
- Limits: `bun test --timeout=30000 --parallel=4 --no-isolate` (issues/config.yaml:9, 30 s from 03f1aa5a 2026-10-02). bunfig.toml sets `concurrentTestGlob = "**/*.test.ts"`, so tests inside every file also run concurrently. 23 test files use 15 s inner waits (e.g. tests/hc-fixture.ts:270, from 9f9045d1 2026-11-07).
- Admission today: only a repo's `full` runs queue, and only within that repo (src/admission.ts, AREA line 20). Different repos' suites (framework, game, blepsis, akrogon) and non-akrogon load (Chrome) run at once. The host has 32 cores and 123 GB. Load swings from 15 to 80 within minutes.

## Load check results (B, C; A merge 2026-11-22)

- Agreed (B,C): the suite's own fan-out is the largest cause. `--parallel=4` × Bun's default `--max-concurrency=20` (concurrentTestGlob) = 80 tests in flight on any PC. B measured 4×20: 9 failures, median test 3.16 s. 4×5: 0 failures, median 0.79 s, same 57 s wall. C measured mc=4 with a lower peak per test at higher load.
- Agreed (B,C): one cap per test. The 15 s inner waits (tests/hc-fixture.ts:270 and copies, tests/next.test.ts:4082) are the next failure point once fan-out is bounded.
- Host line: (B) stay per repo, because a whole-PC line was reverted 3 times (history-reversals C3). (C) per-repo plus a host cap N = max(1, floor(cores/12)), counting `full || land`. Both agree that a single host-wide line is wrong on this PC and right on a small PC.
- CPU weights: (B) hold, no measured support. (C) keep. Disputed.
- (B) Heavy suites started by hand (door/consultant `bun test`) skip the slice and the line (app.slice weight 100). A3: route them through akrogon.
- (B, seen) tests cut off at a cap left processes alive, and one suite worker held 2,422 zombie children.

## Operator source (2026-11-22, chat, test limits)

"Why don't we just give it a bigger limit overall? Why 28 or 30 seconds? Is this an arbitrary number? Feel free to challenge me and also consult with the consultants. Maybe we don't even need these arbitrary numbers and limits. Or maybe they should be dynamic based on whoever is running this on their own PC. I don't know."
