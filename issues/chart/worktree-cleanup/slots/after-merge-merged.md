# Merged notes: after-merge remainder (A, B, C, D)

Sources: after-merge-A.md, -B.md, -C.md, -D.md. A checked D's history claim: `closableMembers` exists at `6640ab5~1:src/next.ts:909` and is gone after 6640ab5 (2026-10-14 17:46 "Merge one leaf per turn: drop batch members"); 9e4c093 (2026-10-15 09:40) brought stacking back without it.

## Final-shape check of scratch-copy-removal (build-copy naming)
- Naming the copy after the recorded attempt does not protect a running build (B,C,D). A second pass can replace the unapplied record with a new attempt while build A runs (src/next.ts:1039-1063), and a superseded builder clears the newer record (:1089-1093) (B,C). restack runs buildStack outside the lock with the old attempt (src/phase.ts:663, :750) (D). One attempt can call buildStack more than once (rebuild loop, src/next.ts:1076-1127), so a fixed name collides (D). A builder killed after the record is saved leaves a named copy kept for good when the holder fails (src/next.ts:985-987) (C).
- Fix options: an `.owner` file (pid, boot_id) written in the copy by buildStack, removal only when the owner is dead, reusing `readOwner`/`ownerDead` (src/reconcile.ts:89-111) (C,D; B asks for "a durable live-build identity", which this is). Alternative: keep the dirty and rebase-marker checks for `batch-*` and drop only the reachability check (C). Cost: a build killed mid-rebase stays (D map rebuttal).
- Proof shape: pause a real fixture build, drive a second pass plus reconcile, confirm no live copy is removed (B).

## Q1 stacked members
Facts
- batchPush/finishPush move members to merged first (src/phase.ts:629-632, :737-742); reconcileBatch skips them (src/next.ts:975); mergeWake runs mergePass, not reconcile (src/akrogon.ts:66-90) (A,B,C,D).
- Normal chain: holder B idle hook closes holder tab (src/next.ts:1478-1489), holder `tab_closed` runs reconcile for the whole repo (:1429-1445), `mergedWorktree` closes the member tab and removes its worktree (src/reconcile.ts:235-260, :264-274), member `tab_closed` then dispatches its dependents (:1455-1459) (B,C,D).
- Real stacked merges (framework, 2026-10-14 06:09 and 17:01): member tabs gone within about 4 s, worktrees gone (B,C,D). Both ran before 6640ab5, with `closableMembers` still closing members directly (D). No stacked merge has run since 9e4c093 (D).
- Gaps under today's code (D): (a) holder tab already closed or `akrogon phase` run outside holder B: no hook, member tab and worktree stay until a later pass; (b) member tab already closed before the merge: worktree removed by reconcile, but no member `tab_closed`, so the member's dependents never dispatch. Also: holder hook arrives `blocked`/`unknown`: no holder tab close (C). Paused repo: waits for unpause sweep (A,C).
Options
- Restore direct close in the merge path: reconcileBatch closes merged members' tabs and dispatches their dependents, as before 6640ab5 (D pick). Cost: about 20 lines; dispatch runs twice (idempotent per D).
- Keep the hook chain (A,B,C pick). Cost: gaps (a) and (b).
Dirty member worktree (`dirty-ref`, src/batch.ts:164-166)
- Keep and report as `uncommitted changes` (A,B,D). Reason: a leaf's own worktree is where seats work; dirt may be real edits.
- Force-remove a merged leaf's own worktree once its tab is closed, keep only rebase/merge markers, log what was discarded (C). Reason: anything uncommitted in a merged leaf was never reviewed.
- Stop calling `move()` on merged members and delete the branch with `git branch -D` after removal, removing the `dirty-ref` noise (D). B: moved branch leaves files old, dirt mixes real edits and rebase noise (C).
- `git branch -d` runs only after removal, so a kept worktree keeps its branch (C,D).

## Q2 plain status
- Yes, per repo, including with no open leaves (A,B,C,D). Filter to paths that still exist (C,D): framework's kept report lists nine dead paths today (C). Print the report time, since it is last-reconcile state (B,C). Do not make status run reconcile (B). Ordinary status only, not `--charts` (B).

## Q3 unregistered folders
- Keep and report through Q2 (A,B,C). Store also holds tool caches (`.temp`, `.dcf*.node-gyp`) and a hand-made folder (C).
- Delete `<slug>-*` folders of merged leaves, keep the rest (D).

## Differences
- Final shape: owner file (C,D) vs keep markers (C alternative).
- Q1 close path: restore direct close (D) vs hook chain (A,B,C).
- Q1 dirty worktree: keep (A,B,D) vs force (C); D adds dropping move() on merge.
- Q3: keep (A,B,C) vs prefix delete (D).
