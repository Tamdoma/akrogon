# Turn release

## Question
Q1. When the holder leaves `merge` by any path (to `merged`, to `check.fix` after a red solo run, to `failed` by its seat, by the dispatch attempt cap or unreachable seat, or by an operator move), and when a batch dissolves, what prompts the next holder? The turn is derived from state (merge-order Q1), but a hook pass dispatches only the hooked pane's own leaf plus that leaf's dependents on completion (`src/next.ts:836-842`), so nothing today prompts a waiting leaf.

Q2. How is a stuck holder recovered without a clock, and what happens to the carried members when the holder leaves `merge` in the middle of a batch? A dead holder seat already ends `failed` through the attempt cap or unreachable path (`src/next.ts:459-482`, `commitMove`). A seat that stays busy forever is invisible by the operator's 2026-09-18 decision (issues/chart/seat-stall-detection/CHART.md, Off route).

Q3. Where does a leaf returning to `merge` from `check.fix` or `check.repair` rejoin the order: a new stamp at the back, or its original place?

### Carries
- Lock: issues/chart/leaf-run-stalls/forks/red-criterion.md and issues/chart/seat-stall-detection/CHART.md (no clocks, watchdogs, polling or timers).
- `skills/merge-issue/SKILL.md:49` lost-reply rule (`git merge-base --is-ancestor`).
- Every move goes through `commitMove` (`src/phase.ts:105-144`), from seats (`transition`) and from dispatch failures (`src/next.ts:459-482`).
- Taken: forks/merge-order.md (1d binding shape in ../slots/merge-order-1d-merged.md: batch record with members' saved base and head, pre-push refusal dissolves the batch, red restores and marks solo, solo marks clear when a leaf leaves `merge`, wake dependents of every member, sweeps keep batch members' resources until the holder finishes; Q2 2a waiting leaves stay unprompted and keep tab and slot).
- Taken: forks/issues-only.md (1a 2a command-proven reuse after a refused push).

## Findings
See ../slots/map-merged.md M7, R1, R2.

Rounds: ../slots/turn-release-A.md, -B.md, -C.md, -merged.md (with "After rebuttals"), -rebuttal-B.md, -rebuttal-C.md.

## Taken
Operator 2026-10-05, verbatim: "1a 2a 3a", after asking "how would that be done exactly?" and "you are certain this is absolutely the most elegant solution without adding any new mechanisms". A answered that it is not zero-new: 1a reuses `dispatchLeaf` (skips busy or already-prompted seats, `src/next.ts:483-492`) and `sweep` (`src/next.ts:674-679`) plus the taken holder-only guard, and adds two call sites.

- Q1 1a: every `akrogon next` pass ends by running the existing `sweep` over that repo's leaves in `merge`; the holder-only guard means only the holder is prompted. `akrogon phase` makes the same call after its move is saved and outside the lock, covering operator moves from a plain shell; since `next.ts` imports `phase.ts` (`src/next.ts:55`), the call sits in the command entry (`src/akrogon.ts`), not in `phase.ts`. Existing per-pass prompt retry counting stays (`src/next.ts:436-468`); when a pass commits a capped failure, the same pass reconsiders the next holder. Reason: level-based, any exit path is followed by a pass or a move. Foreclosed: per-path wakes, manual `next`.
- Q2 2a: no clock. The operator judges a hang from `akrogon status` (names the holder), stops the agent and moves the holder to `failed`. The Q1 pass reconciles a batch record whose holder left `merge`: fetch; tested top on main means restore nothing and finish members by ancestry; otherwise restore every member to its saved base and head, no solo marks, clear the record; a failed fetch restores nothing and reports. The command owns the batch push: under the lock it confirms the record's attempt id is current and the holder and every member are in `merge`, then pushes the recorded top; seats never run `git push` for a batch. Every command-owned branch write of a batch (stack result, restore) is applied under the lock with the attempt id check. A holder failed after its push gets a notice; the operator moves it back to `merge`, where ancestry finishes it without a run. Accepted cost: a silent hang blocks that repo's merges until the operator acts. Foreclosed: time limit (no-clock lock), manual branch repair.
- Q3 3a: a new stamp on every move into `merge` (review, repair, operator recovery); never inserted into an already-recorded batch. Foreclosed: keeping the first stamp.
- Done-criteria: moving the holder out by each of the five paths prompts the next leaf's B with no manual `next`, and a second pass prompts nobody; failing the holder mid-run leaves every carried branch at its saved head and prompts the next leaf; failing it after the push restores and reruns nothing; after cleanup, a push attempt from the old seat does not change main; a returning leaf with two waiting is listed third by `akrogon status`.
- Probes 2026-10-05, operator's local identity (herdr 0.9.3, git with operator's GitHub credentials):
  - `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000` (the call in `src/next.ts:539-548`): run about ten times on peer panes w8:pGY and w8:pGZ during this chart; each turned the peer to working. No cleanup needed. Limit: does not prove prompting a pane whose agent was started by akrogon.
  - `herdr tab create --label akrogon-probe-tab` then `herdr tab close w8:t91` (the calls in `src/next.ts:391`, `src/next.ts:648`): create returned tab w8:t91 with root pane w8:pH3, close returned `{"type":"ok"}`, `herdr tab list` then showed 0 tabs with that label. Limit: does not prove closing a tab with a running agent.
  - `git fetch origin` at the akrogon root: exit 0, origin/main 923c6c98. Read only, no cleanup.
  - `git push` to `origin`, run by the operator 2026-10-05 (git 2.56.0, operator GitHub credentials; A's own run was refused by the session's safety classifier): pushed origin/main 923c6c98 to throwaway branch `akrogon-probe-merge-turn` (exit 0, new branch); pushed unrelated root commit 4bf7af8b there (exit 1, `! [rejected] ... (non-fast-forward)`, branch still at 923c6c98); `git push origin --delete akrogon-probe-merge-turn` (exit 0); `git ls-remote origin refs/heads/akrogon-probe-merge-turn` returned 0 lines. Limits: a non-default branch with no protection rules; does not prove a push to `main` under branch protection or a lost reply.
