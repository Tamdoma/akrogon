# red-exit notes: slot A

## Q1 where the red leaf goes

- Pick: the land run moves it `merge -> check.repair` (seat B) and clears the batch after recording the red attempt. Reason: `check.repair` already exists with exits `merge`, `check.fix`, `failed` (`src/routing.ts` `routing`), so the queue, holder guards, dispatch and status need no new state; a leaf outside `merge` is outside `mergeQueue`. Cost: `routing.merge.next` gains `check.repair`; check-issue gets a merge-red entry; merge-issue loses its red endings.
- Rejected: a mark inside `merge` (every merge consumer must branch on it: `mergeQueue`, `mergePass`, `dispatchLeaf`, the `src/phase.ts` holder guard, `src/status.ts`); straight to `check.fix` (A wakes on 43 flakes a week, token cost grows, breaks a hard limit).
- Consumers: `src/land.ts` `land`/`handOff`; `src/phase.ts` `commitMove` (batch cleared on leaving merge; `fix_rounds` unchanged on merge -> check.repair); `src/next.ts` `reconcileBatch` (a red record is already handled by the "not landed" branch); `src/timing-report.ts` visit counting.
- Evidence: better-than-training, akrogon source read 2026-11-21 (`routing`, `verifyCaller`, `verifyCommands`).

## Q2 which hand-offs leave

- Pick: every seat hand-off leaves to `check.repair`: red verify, gate refusal, rebase conflict (today's solo turn) and a push error. The command lands or the leaf leaves; seat B never holds the line and never runs `merged` in `merge`. Reason: one rule instead of four; it removes the class of defect D1 (seat-run push racing a wake's new attempt, `src/phase.ts` `batchPush` writes `applied: false` for a seat-owned batch), since only command-owned batches remain and those are guarded by `landAlive`. Cost: the merge-issue seat role shrinks to broadcasts; check-issue's repair text covers conflict resolution and trailer fixes; a push error (network, auth) goes to B to report rather than a command retry.
- Rejected: red only (keeps solo conflict turns, 17 attempts and 5.9 lane-h, and two B protocols).

## Q3 off-line retest

- Pick: no full suite off the line. In `check.repair` a plain `akrogon verify` has scope `leaf` (`src/verify.ts` `verify`: scope is `merge` only for a merge-phase caller), so it runs `checks` and never `merge_checks`; `--attempt` refuses a leaf that holds no attempt (`verifyCaller`). Lock 2a is kept by routing with no new guard. B judges from the kept log, `akrogon flaky` and the main-red ledger, and may run the narrow failing command through `akrogon run-check`. Flake vs cause is B's judgment (standing design model-choice line), recorded in `review-B.md`.
- Rejected: full off-line suite (breaks 2a and its receipt is stale once main moves); seatless requeue for listed flakes (a list match standing in for "this red is not the leaf's fault", which the model-choice line refuses as a script check).

## Q4 return place

- Pick: a leaf returning from `check.repair` keeps its `merge_stamp`; a leaf returning from `check.fix` gets a new one. Bound: the second red in one merge entry (since the last new stamp) goes `check.fix`, which B's skill already does for a second red on the same unit, widened to any unit. Reason: lock 1a counts from first entry; the 2026-10-05 reason for a new stamp (never insert into a recorded batch) lapsed with 6e7a33ff. Cost: reverses the operator's 2026-10-05 Q3 foreclosure for `check.repair` returns; recorded as A's pick against an earlier operator answer.
- Rejected: back of the queue (a flake costs queue depth times 22 min); always first stamp (a load-only flaker alternates at the head).

## Q5 main-red

- Pick: the land run accepts a red whose every failing unit is a named test that is an unresolved red on main (the data `newRedUnits` already computes for base runs) and lands in the first turn with no rerun and no base run; nameless failures leave the line. The first leaf of a streak, with no base run yet, leaves to `check.repair`; when B judges main's fault it returns the leaf with a known-red request, and that leaf's next turn runs the base suite in the line (serial, one per streak; `verify --known-red` reuses the recorded red head run). Reason: one base run covers the streak; 11-15..17 cost about 10 h. Cost: a new break inside an already-red test can land (the accepted cost in base-red forks/red-base-policy.md).
- Rejected: today (every leaf pays its own base run; under 5a it cannot even run it off the line).

## Pitfalls

- A stale-text seat calls a refused command: the skill change ships in the same leaf as the command change.
- `failed-merge-resume` changes `reconcileBatch`: the red-exit leaf builds on it after it lands.

## Questions not asked

- Should the known-red request be a state field or a B call to a new verb? Open for the plan.
