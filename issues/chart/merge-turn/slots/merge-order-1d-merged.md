# merge-order 1d, revised shape after final checks B and C

Operator 2026-10-05, verbatim: "1d". Sources: merge-order-1d-shape.md, merge-order-final-check-B.md, merge-order-final-check-C.md.

## Revised shape
1. Turn (A,B,C): one per registered repo, held by the earliest leaf in `merge`; stamp at the move into `merge`, ties by slug, leaves already in `merge` at ship time ordered by last `to: merge` in `issues/log.jsonl`. Only eligible leaves count (not hand-built, deps merged, inputs present; `src/next.ts:585-619`) (B).
2. Batch record (B,C): the command, not the seat, records the batch when the holder's turn starts: members in queue order, each member's pre-batch head, and the tested top once known. It lives in `state.yaml` (turn is derived from state). A leaf entering `merge` later is provably outside the batch (C D3).
3. Stack order (A, new; to check): carried members first in queue order onto `<remote>/<default_branch>`, the holder's own leaf last on top. Checks then run in the holder's own worktree with its own pane, `TMPDIR` and `AKROGON_BASE` refreshed there, so no seat works in another leaf's worktree (fixes C M3) and the holder's leaf moves last (fixes C D5).
4. Stack build is mechanical and command-owned (A,B,C): rebase-or-abort, outside the global lock with short locked state writes (B). A carried member that conflicts is restored to its pre-batch head and dropped from this batch. If the holder itself conflicts on top, every carried member is restored and the holder merges solo now, resolving the conflict as `SKILL.md:41` says, so the holder always lands in its own turn and FIFO publication order holds (answers B Q2).
5. Guard (B,C): the command refuses merge work unless the leaf is the holder or a member of the holder's recorded batch.
6. Check once (A,B,C): every `checks` then `merge_checks` once on the top commit in the holder's worktree. One `merged --check` on the top covers the stack: each member already passed the trailer and issues guards on its own range at its move into `merge` (`src/phase.ts:228`) and a clean rebase does not change its files (C D4). Evidence says the top was tested, not each prefix (B F8).
7. Green (B,C): before the first move, gather briefs for every completion owner the batch can close (C M5, B F7). Push the top fast-forward. Move carried members to `merged` first, holder last. Broadcast once per completed standalone issue or whole epic, never per child issue inside an unfinished epic (B F7). A resumed pass reconciles by `git merge-base --is-ancestor` and finishes remaining moves without rerunning or repushing (B F5, C D5).
8. Red (B,C): no leaf moves; the command restores every member to its pre-batch head and marks each "solo" in `state.yaml` so the next turn does not rebuild the same batch (C D2); solo marks clear when the leaf leaves `merge`. A red solo run sends that leaf to `check.fix` as today. Dependencies cannot sit inside one batch because `blocked-by` leaves are not dispatched until merged (C, `src/next.ts:607-611`), answering B Q1.
9. Wake and cleanup (C M1, M2, B F6): after a batch lands, the command wakes the dependents of every member and closes carried members' tabs, not only the holder's.
10. Bound (C): under Q2 2a every waiting leaf holds a tab and new tabs stop at `max_active`, so a batch never exceeds `max_active`. Under 2b it is unbounded.

## New operator questions
- Q3 red batch (C N1, B Q1): 3a solo one at a time (N+1 runs for a batch of N, simplest) vs 3b split in half and retry (fewer runs when one of many is red, more seat steps).
- Q4 carried leaves' held Nits (C N2, M4): 4a move the Nit-to-LESSONS step from merge into check.review, where the reviewer holds the Nit (removes the class) vs 4b holder reads each carried leaf's `review-B.md` for Nits vs 4c accept the loss.
- Q2 still open, now also sets the batch bound (C N3).

## After 1d rebuttals (B, C)
- Step 3 (C agrees, B notes): holder on top means carried members appear before the holder in history and move to `merged` first. All land in one push, so admission stays FIFO; commit and completion order inside one batch is not FIFO. Stated as a cost.
- Step 4 wording (C): after the carried members are restored, the holder rebases alone onto main and usually has nothing to resolve; the conflict returns for the carried member in its own solo turn, where its B resolves it.
- Step 4 solo mark (B F2): a dropped conflicting member is marked solo too, and solo-marked leaves are excluded from every later batch until they leave `merge`.
- Member leaves during run (C): batch record is written under the lock before any rebase; the pre-push check refuses unless every recorded member is still in `merge`; refusal dissolves the batch without solo marks. Done-criterion: a member moved to `failed` during the run causes no push.
- Step 5 (B F4): only the holder's seat does merge work, on its members' recorded ranges; members' own seats stay unprompted and are refused.
- Step 6 (B F3): the record keeps each member's original base and head; each member's own rebased range is checked against its stored predecessor, plus the cumulative check on the top. "A clean rebase does not change files" withdrawn.
- Step 6 deps (C): when the top commit's lockfile differs from the one installed in the holder's worktree, setup runs again before the check. Carried into forks/dependency-setup.md.
- Step 8 (B F6): restore uses saved base and head per member; N+1 counts first attempts, not total runs. (C) A red with no code cause in a batch of six costs seven runs, about four hours.
- Step 8/9 (B F8): the record keeps completed member moves; sweeps must not close tabs or remove worktrees of batch members until the holder finishes.
- Step 10 (B F5): no batch bound is claimed and no cap is added; batch size is the eligible waiting leaves.
- Q4 (B,C): check.review alone is wrong (A and B both review blind, Nits can vanish in repair, B can enter merge from check.repair). Revised 4a: B's last act before its own move into `merge`, from check.review or check.repair, records its held reusable Nits. Cost: a lesson can be written for a leaf that later fails.
