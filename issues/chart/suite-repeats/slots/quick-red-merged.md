# quick-red merged notes (A, B, C, D)

Sources: slots/quick-red-A.md, -B.md, -C.md, -D.md, all blind 2026-11-01.

## Q1 skip the slow check after a quick red

- Run every non-`full` check; when any of them (or setup) is red, record each check named in `full` as `blocked` by that check, using the existing `blocked` field and blocker shape of the member stage (`src/verify.ts:567-575`) (A,B,C,D). Framework declares no `full`, so nothing changes there (C).
- Order: reorder akrogon `issues/config.yaml` checks to format, typecheck, test and keep runner order (A,B); partition non-`full` before `full` in code (C,D). B R3: a partition can break an order dependency in another repo; D: config order is manual.
- Data: 51 head runs had a quick red while test ran, 124.6 min of test execution (C); 47 of 243 before 2026-10-26, 4 of 50 after, 6.7 min recent (A,B,C,D); 0 of those test results were ever reused, every repair landed on a new tree (B,C,D). 13 of the 51 also had a red test, now found one pass later (B,C,D).
- Rejected: stop at first red (hides the other quick check) (A,B,C,D); keep running everything, the 2026-10-24 reason measured false (A,B,C,D); name- or duration-based rule (B,C); drop format as a gate (A,C).
- Pitfalls: a blocked entry read as a real test result invites a rerun or base comparison; existing consumers already skip blocked (`src/verify.ts:228, 235`, `src/flaky.ts:33`, `slowEligible`) (B,C,D); seats need one line saying a blocked check did not run, fix its blocker first (B R1, C); reorder changes `sameCommands` order so old receipts stop matching once, no open leaves now (A,C); a future slow check missing from `full` always runs (C); the every-failure lock is narrowed across stages: every quick failure shows, the full stage is visibly unrun (B R4).

## Q2 per-command reuse

- Delete the producer `reuseSource` and its two `runOnce` branches; keep the `reused` schema field and every consumer guard so historical rows parse and stay excluded (B,C,D; A leaned).
- Data: akrogon 6 of 150 head entries reused since 2026-10-26, all format or typecheck, test never (B,C,D); framework 0 reused on 1,741 head rows, 18 reused entries all on known-red base passes whose base tree was already whole-green, median 269 s at merge scope (D).
- D: guard the known-red base pass: when the merge-base tree already holds a whole-green row (`greenRun`), skip the base pass; known-red then fails at once, as it would after the pass. Keeps framework's base-side saving after deletion.
- Reopens verify-waste Q1 (A's autopilot pick 2026-10-24) and changes the economics of verify-waste's pending framework member split: members still run in parallel with one setup, but a retry repays green siblings (B R5, C, D). Skill text promising base-side per-command reuse gets amended (B R7, D).
- Rejected: keep it (A,B,C,D on data); keep it only for full checks or base passes (B,C); delete the schema field too (B,C,D).

## Q3 proof

- One verify case: a quick check red, the other quick check still runs, the `full` command's marker is absent and its entry is `blocked`, the gate refuses; after the quick fix on a new tree the full check runs and the gate accepts (A,B,C,D).
- Reuse tests converted or deleted to the new contract; the schema-compat test (`tests/verify.test.ts:1243`) stays (B,C,D); a same-tree retry re-executes greens and writes no `reused` entry (B,C).
- The known-red refusal case where the base is already green skips the base pass (D).
- Keep the all-members-finish test (`tests/verify.test.ts:956`) so no general fail-fast slips in (B).
- Focused files plus the leaf's normal verify; no timing assertions, no benchmark (A,B,C,D).

## A's proposed pick (for the rebuttal to attack)

1. Q1: block `full` checks after any earlier red in the pass, in config order; non-`full` checks always run. Door step on main now: reorder akrogon `issues/config.yaml` checks to format, typecheck, test. No code partition. Each red-disposition copy in the seat skills says a blocked check did not run and its blocker is fixed first.
2. Q2: delete `reuseSource` and its branches; keep the `reused` field and guards; adopt D's known-red base guard; amend skill promises of per-command reuse; record the reopened verify-waste Q1 and the pending framework split's changed economics in the design.
3. Q3: as above.

## Where slots differ

- Config order (A,B) vs code partition (C,D).
- D's base guard: only D raised it.
