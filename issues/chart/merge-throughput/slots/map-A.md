# Map A (written before reading B or C)

Code cited at origin/main 083264e.

## Stock and flow
- Inflow: dispatch up to `max_active` leaves (src/next.ts:331-362 counts leaves, not running checks).
- Stock S1: leaves in plan/implement/check (parallel, 20 seats).
- Stock S2: merge queue, leaves in `merge`, ordered by `merge_stamp` (src/turn.ts:55-73).
- Constraint: one merge turn per repo, serial (skills/merge-issue/SKILL.md:35). Framework rate 1.9 merged/h.
- Return flow: merge -> check.fix -> check.review -> merge. About 43% of merge exits (#66, #71). Repeat bounce 42% (#71).
- Stock S3: red-main state. Not tracked anywhere. Only the operator `pause` exists (src/pause.ts).
- Stock S4: LESSONS.md, grows, never drains into guards (#73).

Throughput of the constraint = runs/h x P(run green) x members per green run. Every red run on the constraint is lost system throughput (Goldratt, TOC: an hour lost at the bottleneck is an hour lost for the whole system).

## Loops
- R1 drift: queue longer -> wait longer -> base older -> conflicts and DRIFT bounces -> more re-entries -> queue longer (#62). Conflict path persists `solo: true` (src/next.ts:807, 1180-1181; src/phase.ts:577, 666, 692), solo leaves are excluded from batches (src/next.ts:1019) and wait.
- R2 late discovery: gate first runs at the serial turn (plan-issue:63, implement-issue:63/84, check-issue:85) -> bounce -> repair proved only with `checks` -> re-bounce at same rate (42%) (#71).
- R3 batch amplification: P(batch green) = p^n. p=0.62 -> 4-batch green 15% (#62, #68). Red batch halves followers, holder keeps turn (src/phase.ts:788-797), limit resets per holder (src/phase.ts:154, src/next.ts:1020).
- R4 red main: red main -> every holder bounces (merge-issue:65 has no base comparison) -> leaves fail at check.fix on old base (#64) -> operator (#67). Source: dirty worktree gate (#63, merge-issue:41,51).
- R5 load: more seats -> more heavy runs on one host -> flakes -> bounces -> more runs (#69).
- B1 (missing): repair cap counts only check.repair -> check.fix (src/phase.ts:151, 302). Merge bounces uncounted (#72).
- B2 (weak): batch halving. B3: operator pause and hand moves.

## Leverage, ranked
1. Gate before the constraint (#71). B runs `merge_checks` on a fresh rebase before moving a leaf to `merge`, and after any merge-bounce repair. Merge turn still runs the gate to confirm. Attacks DEFECT (12/34), the 42% repeat rate, and lifts p so batches turn green (breaks R2 and R3). Breaks later: more heavy runs on the host (R5), longer check phase. Invites: seats skipping the gate again unless the command checks for evidence.
2. Red base is not the leaf's fault (#67, #64, BASE 9/34). On red, the merge seat reruns the failing command on `built_on`. Red there too: leaf stays in `merge`, merge dispatch for the repo holds until main is green, no check.fix. Breaks later: a flaky base can hold the turn; needs a clear resume trigger and owner.
3. Gate on tracked content only (#63). Clean the worktree (`git clean -fd`, keep ignored deps) or run in the disposable stack worktree. Prevents R4's source. Breaks later: a test that needs an ignored file passes locally and fails in CI. Empty folders are invisible to `git status`, so a porcelain check is not enough.
4. Count merge bounces toward `fix_rounds` (#72). One expression at src/phase.ts:151. Restores B1. Breaks later: if red base is not separated first (item 2), red-main bounces would burn rounds and fail good leaves. Order: 2 before 4.
5. Merge attempt records (#66): attempt id, members, outcome, durations, bounce cause in log.jsonl. Needed to prove "faster at same quality". Low risk.
6. Order by dependents (#65, #70): sort key = count of leaves waiting on it via `blocked-by`. Small. Starvation bounded because queue drains.
7. Drift restack (#62 DRIFT): partly removed by 1 (fresh base at entry) and shorter queue. Remaining: conflict `solo` persistence.
8. Batch policy (#68): wait for 5's data after 1 lifts p. Off route for now.
9. Host load limit (#69): becomes needed if 1 adds runs. Fork: accept, or a host-wide heavy-run slot limit.
10. Lessons loop (#73): different destination (learning loop, not merge flow). Separate chart.

## Forks
- F1 where the gate runs before merge: end of check.review/repair (every leaf) vs only after a merge bounce vs leave as is.
- F2 red main handling: auto-hold the merge turn vs only re-queue the leaf to `merge` without check.fix.
- F3 clean gate: git clean in leaf worktree vs fresh worktree vs CI on pushed commit.
- F4 heavy-run load: none vs host slot limit vs lower max_active.
- F5 split: merge-flow chart vs separate lessons chart; ordering/metrics as own leaves.

## Pitfalls
- Load rise from F1 (R5). Remove: measure with item 5, host slot limit if needed.
- Counting merge bounces before separating base failures fails good leaves. Remove: order 2 before 4.
- Auto-hold with no owner stalls forever. Remove: name the resume trigger (green rerun of base on new main) and print the owner.
- Seat discipline: prose rules drift. Remove: command records gate evidence (head sha) and refuses `merge` without it.
