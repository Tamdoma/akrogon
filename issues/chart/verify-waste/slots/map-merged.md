# Merged opening map (A, B, D)

## Numbers (B, D recomputed; journal 2026-10-14..24)
- 493 CPU-h in run scopes; framework full `verify` 600 runs, 275 CPU-h (56%), median 1,736 CPU-s / 369 s wall (B,D).
- 457 merge head runs, 223 red; first attempt red for 131 of 232 leaves; ~2 head runs per leaf reaching merge, not per landed leaf (B,D).
- Same-tree head reruns 70 (31 CPU-h): 26 flipped green (D), 29 (B).
- Base runs 20, 12.6 CPU-h; 14 had a green receipt on the base tree, and 9 of those 14 came out red fresh; 0 of 10 observable known-red comparisons passed; all 10 main-red notices were these flakes (B,D).
- Surviving red logs 37: hooks:selftest red in 33, render-satellite 13, rest lanes 6-9; about 2 red members per red run, 22 of 37 with several (B,D). Not hooks only (B).
- Hand runs over 600 CPU-s: 105, 50 CPU-h; argv not recorded, so the full-suite share is unknown (B,D).
- Wall tail after first red is not a CPU saving estimate (B); median 42% of core wall after the first red (D).

## Locks
- Operator: a failing run shows every failure; core keeps --no-exit-on-error (FW verify-gate reporting-main-run 1a 2026-10-03, merge-gate fail-fast 1a 2026-10-10) (B,D). Cancelling siblings needs operator words.
- Base-red "fresh base, never reuse a receipt" was an autopilot pick, not operator words; reason: stale green receipt hides a current base red (D; B cites F6 counterexample).
- Full suite at every merge, no selection, no nightly; operator 2026-10-24 rejections (A,B,D).

## Forks
- Q1 Grain: member receipts on the identical tree, gate needs every member green (A,B,D). Cheap stays a prior stage (A,B). One membership source, not package.json duplicated in YAML (B). Keep the root-state guard over the composed run, one worktree and setup per verify (B). Same-tree input assumption extended to members, named (B,D).
- Q2 Cancellation at first red: pick only with Q1 (A); only if the operator reopens the lock (B,D). Largest remaining saving (D ~35 CPU-h).
- Q3 Base side: run the base fresh but only the head's red members (A); keep fresh full (B); reuse the green receipt and reopen the autopilot lock (D).
- Q4 Hand runs: run-check refuses the configured suite text (A,D); first give check.fix a receipt-producing merge-scope verify route, then redirect (B).
- Front-loading affected suites before merge: rejected (B; A dropped it).

## Pitfalls
- Cancelled, not-started or setup-failed members never count green (B). Killing a scope kills nested runs sharing it (B).
- Member scopes multiply admission permits; one permit per group (D).
- flaky history keys by command and restarts per member (D).
