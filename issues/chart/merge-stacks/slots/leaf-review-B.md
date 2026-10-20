# Leaf handoff review, seat B

Draft root: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fa8e51c-838c-4286-a49e-3944a99601c8/scratchpad/merge-solo/`. Paths below use that root unless prefixed `src/`, `tests/` or `plugin/`.

## 1. Criteria and ownership

No disagreement with the done-criteria as observable product outcomes. “One verify”, “one attempt line” and “one broadcast seat” are operational counts, not test counts. No criterion names a test file or claims unrelated repository health. The prerequisite is consumed explicitly. Both readiness files have the required sections.

The green-merge ownership list needs the consumers in LR4 below. The pre-install drain is a deployment step, not proof that this leaf can repair another repository's state.

## 2. Changed-state consumers

### LR1. Omitting a slot does not create a command-owned transition

Evidence: `green-merge/design.md:39,63` proposes `transition` with no slot and cites `commitMove(..., null)` as its precedent. They are different paths. `src/phase.ts:262` infers B when merge has one required slot. `transition` also performs clean-worktree and frozen-citation checks (`src/phase.ts:282,290`). `src/timing-report.ts:170` currently marks a completed merge visit without a B prompt as missing evidence. `src/log.ts:36` can attribute a no-slot move to the invoking hook's pane session.

Replace design line 63 with:

> A command-owned green merge records the phase move with `slot: null` and no agent session. Omitting `--slot` on `transition` is insufficient because it infers B. Share the existing clean-worktree, issue-file, test-citation, frozen-citation, retired-lesson, receipt and tested-head guards between command and seat paths, then commit the command-owned move without recording B as done. Timing reports recognize completed command-owned merge visits without requiring a B prompt. Clear inherited hook/pane attribution for the controller. Seat-owned merge behavior remains unchanged.

### LR2. Liveness alone does not retain the handoff to B

Evidence: `green-merge/design.md:40,41,45,56` records a red run and clears the live-run field when the controller ends. A later `next` can then treat the applied top as ready for another command run while B owns the red/refusal. Launch-before-record and record-before-launch also need a defined exclusive claim. The current applied-attempt branch is `src/next.ts:1029`.

Replace the concurrency paragraph at line 56 with:

> Persist whether the attempt belongs to the command or has been handed to B, separately from controller liveness. Claim command execution under the global lock before launching, using an identity whose launch and liveness can be reconciled without a duplicate verify. Do not hold the global lock while verification runs. Before dispatching B for red, conflict, refusal or an unrecoverable push outcome, persist seat ownership and its receipt/error context. Later `next` calls continue that handoff and never restart command verification for a seat-owned attempt. If a command-owned controller dies, reconcile any landed candidate first, then exclusively resume unfinished work. The plan chooses the field representation and launch handshake.

Append to green-merge criterion 7:

> After a red or refusal has been handed to B, later hooks and `next` calls preserve B's ownership and do not restart command verification while B handles the attempt.

### LR3. Broadcast work can disappear after owner closure

Evidence: `green-merge/design.md:39,46` schedules the seat after completion. `completeOwner` returns `void`, prints completion, packs and renames the owner (`src/phase.ts:191,223,225,227`), and immediately returns for a closed owner (`:192`). A crash after the rename cannot reconstruct an unrecorded completion notification from another call. `closeMergedTab` closes unconditionally (`src/reconcile.ts:360`), and the B-pane hook also closes merged tabs (`src/next.ts:1504`). An idle old B pane could therefore disappear before the broadcast-only handoff.

Replace step 5 with:

> Before owner closure can erase the trigger, persist a broadcast-only handoff containing the completion-owner identity, closed destination, pushed SHA and source context. Completion returns structured owner information rather than requiring the caller to parse stdout. Recovery preserves and dispatches an undispatched handoff even when the leaf is already merged and its owner is closed. Pending or active broadcast work prevents tab, slice, worktree and required-context cleanup. The broadcast seat uses the existing sender's retry/failure policy. Recovery must not blindly start another sender after a confirmed dispatch. When no owner completes, no broadcast handoff is created. The plan chooses storage and delivery acknowledgement using the existing delivery conventions.

Extend criterion 6 with:

> A crash after owner closure but before broadcast dispatch preserves the broadcast handoff for recovery, and repeated hooks do not start a duplicate sender.

### LR4. Name the actual consumers and owned entry points

Evidence: the new entry proposed in `green-merge/design.md:52` needs `src/akrogon.ts`, absent from line 32. LR1/LR3 require timing and cleanup consumers. If a controller has no tab, `stop --all` currently misses it because `src/stop.ts:61` selects only leaves with a tab. The solo design's `tests/fake-herdr.ts` member-prompt claim is inaccurate: its `members` at `:221` are panes. The prompt helper is `tests/next.test.ts:4854`; stack assertions are in `tests/batch-dispatch.test.ts`. `src/timing-report.ts:309` uses `Member` for a timing cohort, not a merge stack.

Add to green-merge's owned surfaces:

> `src/akrogon.ts` for the controller entry; `src/scope.ts` for its execution lifecycle; `src/stop.ts` for stopping command-owned merges without a tab; `src/reconcile.ts` for controller and broadcast cleanup protection; `src/timing.ts` and `src/timing-report.ts` for truthful command-owned merge timing. Status must expose the active controller and pending handoff rather than invent an active B seat. Include `src/status.ts` where that presentation changes.

Replace solo-turns design line 53 with:

> `verifyCaller` continues resolving the holder by `batch.attempt`. Remove stack prompt construction/assertions from `tests/next.test.ts` and `tests/batch-dispatch.test.ts`. `tests/fake-herdr.ts` pane-member arrays, `src/status.ts` pack-member terminology and timing-report cohort `Member` counts are unrelated to merge stacking and stay. Preserve legacy attempt/timing parsing. Do not remove a cohort count merely because its variable is called `members`.

## 3. Where the run executes

### LR5. Pick a transient user service for the controller

I prefer a transient service in the holder's existing leaf slice. Its lifetime and identity are independent of the hook, cron and agent pane. Current `allocate` provisions A/B panes (`src/next.ts:428`), while `dispatchSlot` starts/prompts agents (`:570`), so that path is not already a plain-process launcher. Existing transient-service and check-scope integration is available in `src/scope.ts:43,64`.

Replace the proposal at green-merge design line 52 with:

> Run the merge controller as a transient user service with a stable attempt-specific identity inside the holder's leaf slice. Do not use the blocking check-scope wrapper as though it were a detached launcher. Existing verification still uses its normal logged run scopes. Persist controller status and keep its logs reachable. The initiating hook/phase call returns after launch acknowledgement. The controller persists its outcome and invokes normal next-holder or seat-handoff continuation; later `next` calls recover a controller death. `stop` and `stop --all` stop it even without a tab. Do not allocate or start an agent for a healthy run. B/broadcast allocation occurs only when their handoff is needed. The plan fixes the launch command, environment and liveness protocol.

This also requires LR4's ownership updates. A plain pane remains a possible implementation, but its existing-agent replacement, hook ownership and launch acknowledgement are not established by citing `dispatchLeaf`.

## 4. Empty legacy member lists

### LR6. Choose empty-only normalization

Evidence: `src/state.ts:63` defaults `members` to `[]`, and `commitMove` spreads the recorded state (`src/phase.ts:138`). An old memberless attempt can therefore retain that key, including around the producer's own self-update (`src/next.ts:1213`). Rejecting an empty list does not protect against applied member commits. Silently removing a non-empty list would.

Replace solo-turns design line 49 with:

> At the read boundary, accept the legacy `batch.members` key only when its value is exactly an empty array, and omit it from the parsed state and future writes. This normalizes a memberless representation; it does not upgrade a stacked merge. Non-empty lists and malformed values remain loud parse failures naming the state file. Do not rebase, restore, push, move phases or discard member information as compatibility behavior. Keep `members` absent from the live batch type and writer.

Add to criterion 4:

> An old memberless batch containing `members: []` remains readable and resumes as the same holder attempt; a non-empty or malformed member value is refused with the state-file path.

## 5. Operator decisions 1a and 2a

No disagreement with deleting stacking, preserving B's red judgment and mechanical repairs, keeping the full merge suite once, or deferring speculation and framework suite reshaping to their named owners. Empty-only normalization in LR6 preserves 5a's refusal to upgrade an in-flight stacked merge.

LR1–LR3 are required to make 2a true across repeated hooks and crashes. They do not reopen the operator's decision or add another verification pass.
