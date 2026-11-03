# Merged opening map (A, B, C, D)

Sources: map-A.md, map-B.md, map-C.md, map-D.md in this folder. Window: issues/timings.jsonl 2026-10-12 to 2026-10-29, 71 merged leaves; "now" = after suite-time landed 2026-10-26.

## Corrections to A's first numbers

- "8 full suites per leaf" overcounted: 96 of 409 runs named `test` were targeted single-file proofs under that name (D); real median is 4 full verifies per leaf, mean 5.1 (C).
- "11.3 h dependency wait" is partly a reader bug: `reasonAt` (src/timing-report.ts:84-89) keeps a wait reason through later prompts, so work after a prerequisite wait shows as waiting (B, D; A spot-checked the code). Real pre-plan prerequisite wait: 33.6 h calendar over 71 leaves, 87% in 10 leaves (C).

## Agreed facts

- Seat turns, not checks, are most of active time: checks are 17-24% (C, D), 21% (A). (A,B,C,D)
- Lint, typecheck, install/setup, machine queue are seconds: format and typecheck ~2 s, setup 0.06 s, admission wait 0.2 min since 2026-10-20. Do not chart them. (A,B,C,D)
- Full test now median ~68-70 s. (C,D)

## Removal candidates

- X1 Same-tree merge re-verify. Merge runs the full verify again on the exact tree leaf verify already passed because reuse requires `run.scope === scope` (src/verify.ts:162, 206, 462); `merge_checks` is empty so commands are identical. 14 of 15 recent merges same tree (D); 13 test reruns since 10-26, 2 of them flaked and aborted land (B, D). Removal: drop the scope condition when commands match. Cost: loses a second flake sample (B). (B,D) C instead proposes deleting reuse (X2b).
- X2 Verify keeps going after a red check. Order is format, test, typecheck and a red format still runs test (src/verify.ts:543-563). 37-49 format/typecheck-only reds burned 93-120 min (C, D). Options: fail fast and run short checks first (D, C O3); or delete format as a gate and run `prettier --write` before commit (C O2).
- X2b Per-command reuse (`reuseSource`) almost never fires: 8 of 915 entries, never test, because any fix changes the tree (C, D). Delete it (C, D); whole-run `greenRun` still reuses an unchanged tree.
- X3 B runs `akrogon verify` at the end of check.repair even when handing to A (skills/check-issue/SKILL.md, check.repair section); the phase gate does not require it. 35 full suites, 72 min (D). One sentence. Larger form: merge check.repair and check.fix (D 3A, C D2 O3); B: defer routing change.
- X4 A's round-0 review. A-only fix verdicts 2 of 71-75, both prose (C, D). B disagrees: matching verdicts hide distinct findings (abandoned-capture-stop: A found a different defect). Needs a findings sample before removal.
- X5 Test suite internals (D only): `fixture()` runs 9 git commands, called 469 times per run; `cli()` cold-starts `bun src/akrogon.ts` 936 times; tests/next.test.ts is 6,167 lines and ~30% of suite time; session-routing sleeps 2 x 10 s; dead `seedStat` (no src reference, A checked). This is the post's "every test reloads the app".
- X6 Timing reader. Fix the reasonAt bug before using it to judge anything (B, D). C: also delete the cohort F gate (decision it served is done) and print plain per-phase and per-check splits.
- X7 Delete merge-slow-alarm: 3 flags in 305 runs, within normal spread (C only). Reopens a chart handed off 2026-10-28.
- X8 Delete the Test-Change trailer gate: 25 empty commits made only to satisfy it (D only). Reopens changed-test-proof lock.
- X9 Default implement to solo, no workers (D only). Low confidence: bigger leaves use workers, so the median gap is confounded.
- X10 `--name test` puts targeted proofs in the full-suite admission line (src/run-check.ts:154) (D only).

## Disagreements

- Reuse: make it fire across scope (B, D) vs delete it (C). Compatible: delete per-command reuse, keep whole-run reuse without scope.
- A's review: remove (C, D) vs sample findings first (B).
- Repair loop: collapse phases (D) vs defer (B).

## Open practitioner questions

- Goal: shorter leaf latency, lower seat cost, or lower host CPU? (B, C)
- Is a same-tree second run meant as flake detection? (B)
- Token cost per seat is not in timing data. (C)
