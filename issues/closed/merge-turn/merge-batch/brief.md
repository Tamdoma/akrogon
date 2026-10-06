# Brief: merge-batch

## What
When a holder's turn starts (from merge-turn-order), the command lands every eligible waiting leaf of that repo together with the holder after one check run:

1. The pass that is about to prompt a holder with no current batch record writes the record under the global lock: members in queue order, each member's saved base and head, the main commit the stack is built on, and a new attempt id. Later it adds the tested top, the publication candidate and each completed member move. (A,B,C)
2. Outside the lock, the command builds the stack in disposable git state, carried members first in queue order and the holder last, rebase-or-abort, without touching live member branches or worktrees. It applies the result to the live branches under the lock after checking the attempt id is current. It prompts the holder only after the build is applied. A pass that finds an unfinished build discards it and rebuilds under a new attempt id. (A,B,C)
3. A carried member that conflicts, or whose range fails `merged --check`, is restored to its saved head, marked solo and dropped, and the stack is rebuilt under a new attempt. If the holder conflicts, every carried member is restored and the holder merges solo now. The command never resolves or corrects a carried member. (A; B F10 narrowed)
4. The holder prompt carries the attempt id and the candidate top. Every batch call by B carries `--attempt <id>`, and the command refuses it unless the id matches the current record. (A,B,C)
5. The holder's B runs every `checks` and then every `merge_checks` command once, on the top commit in the holder's own worktree, with `TMPDIR` and `AKROGON_BASE` refreshed there. Then `akrogon phase <holder> merged --slot B --check --attempt <id>` checks each member's rebased range against its stored predecessor plus the top, and under the lock records the worktree HEAD as the tested top. (A,C)
6. Green: before its `merged` call, B gathers briefs for every completion owner the batch can close (A,C). `akrogon phase <holder> merged --slot B --attempt <id>` then, under the lock, confirms the attempt id is current, HEAD equals the tested top, and the holder and every member are still in `merge`. It records the publication candidate and pushes it fast-forward. It moves carried members to `merged` first and the holder last, and prints one completion line per completed standalone issue or whole epic. Seats never push a batch. Any member leaving `merge` during the run means no push, and the batch dissolves without solo marks.
7. Refused push: the command restacks onto the new main and prints `fresh checks required` with the new candidate, without moving any member. B reruns the checks, `--check` and `merged`. (A,B)
8. Red: `akrogon phase <holder> check.fix --slot B --attempt <id>`. With carried members, the command restores every member to its saved base and head, marks each solo, moves nobody, keeps the holder in `merge`, prints `batch dissolved, merge solo`, and the holder gets a fresh solo pass after the current B ends. With no carried members, the call moves the holder to `check.fix` as today. Solo leaves stay out of every later batch until they leave `merge`. (A,B,C)
9. Reconcile: a pass that finds a batch record whose holder left `merge` (for example failed by the operator) fetches, and if the publication candidate is on main, it finishes the members by ancestry. Otherwise it restores every member, clears the record and sets no solo marks. A failed fetch restores nothing and reports. A holder failed after the push gets a notice, and the operator moves it back to `merge`, where ancestry finishes it without a run. A resumed pass after the push finishes the remaining moves without rerunning or repushing. Members are found by slug across open and closed folders, completed moves are recovered from saved state and ancestry, and the record is kept until all completion work is reconciled. (A,B)
10. After the holder's `merged` call, the post-move pass in `src/akrogon.ts` (from merge-turn-order) wakes the dependents of every moved member and closes the carried members' tabs. Sweeps do not close tabs or remove worktrees of batch members until the holder finishes. (A,C)

`skills/merge-issue/SKILL.md` changes to match: the holder's B checks the top, carries the attempt id in every batch call, follows printed results, and never runs `git push` for a batch. Carried seats stay unprompted.

Consumes from check-setup: printed checks install the worktree's own packages first, so a batch whose carried member changed the lockfile installs before its one run. Consumes from nits-before-merge: carried leaves' B already recorded their Nits before entering `merge`. Consumes from merge-turn-order: the holder, the queue order, the holder-only prompt and guard, `src/turn.ts`, and the post-move wake in `src/akrogon.ts`.

## Why
The turn alone still costs one full run per leaf, one after another (about 30-40 minutes each on framework). Batching lands N waiting leaves after about one run when green, with the landed commit being the tested commit, and keeps merges correct: conflicts are resolved before checks, and red never lands.

## Done-criteria
1. Three eligible leaves in `merge` that rebase cleanly land in one push after one check run, main's history holds the carried members then the holder, and all three end in `merged`.
2. A carried member that conflicts ends at its saved head, marked solo and absent from the push, while the others land.
3. On a red batch, the holder's `check.fix` call pushes nothing and moves nobody, every member ends at its saved base and head marked solo, the next turns merge them one at a time, and a red solo run moves that leaf to `check.fix`. (A,B,C)
4. A member moved to `failed` during the run causes no push.
5. Failing the holder mid-run leaves every carried branch at its saved head and prompts the next leaf. Failing it after the push restores nothing and reruns nothing.
6. After that cleanup, `akrogon phase <old holder> merged --slot B --attempt <old id>` is refused and the remote default branch is unchanged. (A,B,C)
7. A pass resumed after the push finishes the remaining moves without rerunning checks or pushing again, including when a completion owner's folder already moved to `issues/closed`. (A,B)
8. After landing, the dependents of every member are prompted and the carried members' tabs close, and no member's tab or worktree is removed before the holder finishes.
9. A batch whose carried member adds a package passes its single check run, and a restored member's solo run uses its own lockfile.
10. A batch that completes a standalone issue and part of an unfinished epic makes the holder's `merged` call print `issue complete` once for that issue and no `epic complete` line. (A,C)
11. A pass interrupted during the stack build leaves no live member branch changed, and the holder is prompted only after a full build is applied. (A,B,C)
12. A leaf that enters `merge` after the batch record is written is not in that batch's push and is the next holder or member. (A,C)
13. When the reconcile fetch fails, no branch is restored, the record stays, and the pass reports the fetch error. (A,C)
14. A holder failed after its push gets a notice naming the next step, and moving it back to `merge` ends in `merged` with no check run and no push. (A,C)
15. A solo-marked leaf that leaves `merge` and returns is carried in the next batch. (A,C)
16. A push refused because main moved prints `fresh checks required` and moves nobody, and the next green `merged` call pushes the restacked top. (A,B)
