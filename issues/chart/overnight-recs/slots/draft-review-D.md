# Draft review D: stacked-turn

F1 Fallback command unnamed (brief crit 3). Today B's red ending is `akrogon phase <slug> check.fix --slot B --attempt <id>` (merge-issue SKILL.md:45). The brief says a red stack moves nobody and "the command records the stacked heads as seen red, clears the batch", but not which call B makes. Say: the same `check.fix --attempt` call on a stack of more than the holder performs the fallback and makes no phase move. Then dispatch: akrogon.ts:86 runs `mergeWake` only when a move committed, so a no-move fallback leaves the holder idle until `next` or the watcher. Add to crit 3: the fallback call itself starts the holder-alone turn (call `mergeWake` on fallback, or return committed from phaseCommand :683).

F2 Red cost understated (design :8 "one extra verify wall"). Members' branches are never touched: buildStack rebases in a disposable worktree (batch.ts:75-76, :97) and applyTop moves only the holder (:119). So an innocent member's head never changes until it is holder itself, and after one red stack every innocent lands serially as holder. At p 0.80 that is the common path. Decide in the brief: accept serial drain after a red (state it), or key the skip on `(head, built_on)` so members re-stack once main moved. Not a seat's guess.

F3 B cannot find the members (crit 6). The prompt carries only `attempt=<id> top=<sha>` or `solo` (next.ts:1079-1081 mergeContext, merge-issue SKILL.md:10). B must gather every stacked leaf's completion briefs, so add `members=<slug,...>` to mergeContext and :10, else B reads `akrogon status` and guesses.

F4 Solo turn (holder conflicts: built.ok false → `solo`, next.ts:1080; B rebases by hand, SKILL.md:51-69). The brief covers member conflicts (crit 2) but not a holder that cannot be rebased. Say: a solo turn stacks nobody.

F5 Stopped members. mergeQueue excludes stopped leaves without a batch record (turn.ts:82-87), but the snapshot in mergeTurn must do the same, and crit 4 "left `merge`" does not cover `stopped.yaml` (src/stop.ts), which is not a phase. Add: a stopped leaf is never stacked and a member stopped during the verify refuses the push like a head change.

F6 Member phase move. Design :13 says `transition`/`completeOwner` for members. `transition` (phase.ts:225) runs requireClean, requireNoIssueFiles and the citation gates on the member's worktree (:276-284) and appends `slot` to `done`; a dirty member worktree would then block completing a stack already pushed. Use `commitMove` (phase.ts:125, which calls completeOwner at :160), as reconcileBatch already does for the holder (next.ts:964).

F7 Crash (crit 5): "landed" for a member cannot be its branch head's ancestry, since the pushed commits are rebased copies. State that the stack's `candidate` ancestor check (next.ts:949-951) proves every member at once, and the loop skips members no longer in `merge`. Otherwise a seat may add per-member range checks.

F8 Retired lessons at check time. batchCheck passes `[record.holder]` to retiredLessonsPresent (phase.ts:533); design :13 names only buildStack's removal. Add batchCheck's member ranges to the owned change, or crit 1's push can carry a member's resurrected line.

F9 Line refs: mergeTurn starts at next.ts:974 (design says :975); reconcileBatch :917-972; batchCheck..finishPush phase.ts:514-681. attempts.ts:60, state.ts:40, turn.ts:82 correct.

No gap: Test-Change trailers over member commits are already checked, batchCheck :531 runs requireTestChangeCitations over `built_on..head`, the whole stack; crit 1 can name it so no per-member check is added. timing.ts:55 already has an optional `members` on the batch event; reuse it. Member worktrees are removed by reconcile's mergedWorktree (reconcile.ts:235,293). Existing helpers (tests/helpers.ts `fixture`, `leaf`, `holding`, `greenReceipt`, `verified`) cover the planned tests; no new machinery.
