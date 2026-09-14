# Where can a failed leaf go?

## Question
Q2 · Does `akrogon phase <slug> <phase>` from `failed` accept every phase except `check.fix`, resetting `fix_rounds`, or stay `implement`-only?

### Carries
- Lock: `state.yaml` is the only truth and the command owns counters. The hand edits being replaced are the defect.

## Findings
- routing.ts:35 `failed: { next: ['implement'] }`. Two of three real failures were in plan phases (`pull-close` at plan.positions, `unit-specs-lane` at plan.synthesis). A hand edit that leaves attempts at 3 re-fails on the next event.
- `transition` already waives the slot requirement for `failed` (src/phase.ts:114). `commitMove` resets attempts, done, verdict, prompted on every move (:26-34) and resets `fix_rounds` only for failed to implement (:35-40).
- failed to `check.fix` can never work: `transition` caps a `check.fix` destination at `fix_rounds >= cap` back to `failed` (:138) before `commitMove` runs, so a leaf that failed by the cap would bounce failed to failed. `check.fix` is entered only by a review verdict, so it stays off the list.
- Under A: `failed.next` lists plan.positions, plan.rebuttal, plan.synthesis, implement, check.review, merge; `fix_rounds` resets to 0 on any exit from failed (one ternary). A leaf failed at merge exits to merge, at review to check.review, in a plan phase to that phase. problems.html:61 names the general exit.

## Taken
Operator answer (2026-09-14): `2a`. `failed.next` lists every phase except `check.fix`, `merged` and `failed`; `fix_rounds` resets to 0 on any exit from `failed`. Reason: hand edits of state.yaml are replaced by a command that resets the counters. Foreclosed: the `implement`-only exit.
