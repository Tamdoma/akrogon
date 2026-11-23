# Final B: lane-first

Checked 'Taken' at main 814a2387. Two breaks, both in the wiring. Picks 2, 4, 5 and 6 are ok. (H) marks what I measured on 2026-11-23.

## Breaks

- B1. Pick 1: `akrogon stop <leaf>` no longer stops a land's checks.
  - `src/stop.ts:58` stops only the leaf slice. It stops no run and no pass.
  - Today a land's check scopes sit in the leaf slice (`src/run-check.ts:358`), so the stop kills the running suite. The pass unit is outside the leaf slice already (`src/verify.ts:932`) and ends when its command dies.
  - With pick 1 the scopes sit in `akrogon-land.slice`. The stop kills the land service only. The pass and its suite run to the end with nobody waiting: 640 s at p50, 1,407 s max in the framework (H). The lane sees the land unit gone and starts the next land, so two suites share the land slice.
  - Fix: `stopLeaf` also stops the leaf's live runs and pass, the way `src/stop-run.ts:27` does for one run. The records already name repo and leaf (`src/land.ts:185-186`).
- B2. Pick 3: `src/next.ts:1261` prints "(leaves waiting in merge are not counted)" on every cap refusal. For a repo cap that is now false. Change the text in the same change.

Checked and fine:

- The land's admission record names `akrogon-land.slice` after pick 1 (`src/land.ts:189`), so reconcile's "live run record" keep (`src/reconcile.ts:211`) no longer covers the leaf slice. The "merge batch" keep (`:214`) does, until the leaf moves to merged at the end of the push (`src/phase.ts:906-910`).
- The variable does not reach check commands. Their environment is built from a fixed list (`src/run-check.ts:50-58`). Akrogon's own tests inside a land do not see it.
- No deadlock through dependencies: a leaf cannot start, so cannot reach merge, before its dependencies are merged (`src/next.ts:754-769`).

## The names for pick 6

One correction to my F3 first. The high counts are from 11-22 before land-own-reds landed (19:40Z). After it: 20 red of 37 merge runs, 82 distinct failing names, and no name in more than 5 runs (H). So seed the three that still recur, N1, N4 and N6.

Counts are red framework merge runs since 11-22, then the part after 19:40Z. All 57 red runs failed in the one command `verify` (`bun run framework:verify`). None of these names failed in a leaf-scope run, where 17 runs were red (H).

| | Test name | Since 11-22 | After 19:40Z | Leaves | Last seen |
|---|---|---|---|---|---|
| N1 | a consumer repo with no framework objects > test:satellite-content exits 0 | 21 | 5 | 12 | 11-23 00:50 |
| N2 | chain recorded audit > the chain builds replay recorded evidence with tool stubs on PATH | 13 | 1 | 8 | 11-22 19:48 |
| N3 | chain recorded audit > the fixture-network script replays with tools unable to start and reports the recorded set | 13 | 1 | 9 | 11-22 20:24 |
| N4 | capture plan > capture starts live collection when a matching state has a missing recording | 12 | 5 | 9 | 11-23 00:27 |
| N5 | run-effort-guard-live: nonzero stub exits still record receipts, export .spec, and remove the owned root | 12 | 0 | 9 | 11-22 18:49 |
| N6 | the recorded-pass chain test enforces its measured deadline | 5 | 5 | 5 | 11-22 21:37 |

- N6 failed in five merge runs in a row, 20:56 to 21:37, on five leaves, and not since. That looks like one cause on main, not a flake.
- N2, N3 and N5 fail together in runs with up to 27 failures. They stopped on 11-22.

Kept logs (H, each file contains the name):

- N1 to N5, one run of 2026-11-22 18:49Z: `/home/ivan/Work/infra/tamdoma/framework/issues/open/review-by-template/repair-round-bound/implementation/check-verify-1795374212318-176357.log`
- N6, run of 2026-11-22 20:56Z: `/home/ivan/Work/infra/tamdoma/framework/issues/open/review-by-template/repair-round-bound/implementation/check-verify-1795381564732-1142063.log`
- Both sit in an open leaf's folder and move when that leaf closes. About two thirds of the other logs for these names are already gone (N1: 6 of 21 kept).
