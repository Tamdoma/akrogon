# Slot B: leaf draft disagreements

Reviewed ISSUE.md and all six leaves' brief, design, readiness and state files against the Taken sections and main `f3557d8`. Draft-relative paths below are under `/home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/worktree-cleanup/`.

## F1. No leaf owns the process veto for registered scratch copies

Evidence: `store-hygiene.md:48` makes the cwd/open-fd veto apply to every deletion. `scratch-copy-removal/brief.md:16` requires only the pane veto, and its design does not carry the later process veto. `store-sweep/design.md:44` owns the process scan but `:55` explicitly excludes registered verify, batch and worker copies. The present registered-copy removal path has only pane checks (`src/reconcile.ts:372-393`). A dead verify parent with a surviving child holding a file in its copy can therefore be removed while both leaves meet their stated criteria.

Exact correction: assign the process veto for registered scratch copies to scratch-copy-removal, carry the later Taken rule into that contract, and add the surviving-process keep outcome to its done-criteria. Name the shared process-inspection interface and its owner if store-sweep will reuse it. If one leaf must consume code delivered by the other, record that actual dependency instead of leaving both `blocked-by: []`. Keep store-sweep from independently removing registered copies.

## F2. Finished-leaf-processes must own pane acquisition for process-only candidates

Evidence: `finished-leaf-processes/brief.md:11` promises never to stop a live-tab leaf's slice. Its owned surfaces at `design.md:42` do not explicitly include `reconcileNeedsPanes`, while `store-sweep/design.md:42,52` owns that detector for new file candidates. With no remaining worktree or leaf temp, the current detector returns false even when a finished leaf still has a live tab/slice (`src/reconcile.ts:127-144`). `src/next.ts:1327` then passes `[]`, not unavailable, to reconcile. A slice-only candidate can be mistaken for a leaf whose tab is gone. The two leaves have no dependency that would resolve this.

Exact correction: make finished-leaf-processes update `reconcileNeedsPanes` for its own slice candidates and explicitly retain them when pane inventory is unavailable. Add outcomes covering a finished leaf with no remaining files but a live tab, and unavailable pane inventory. File candidates remain store-sweep's responsibility. Do not rely on a later leaf to make process teardown safe.

## F3. Store-sweep's live-owner criterion is conditional where the binding rule is unconditional

Evidence: `store-sweep/brief.md:12` frames all listed keep cases as “An item tied to a running leaf stays.” The Taken rule at `store-hygiene.md:44` instead keeps a live-owner run, batch copy or batch owner record **in every case**, and removes a dead-owner run even while its leaf is active. Those exceptions matter because the parent cleanup can recursively remove a directory despite an otherwise-correct child check. The draft's deletion criterion at `brief.md:10` only exercises a repo with no running leaf. The standing design included by `design.md:36-38` requires consequential edge cases to be done-criteria before planning.

Exact correction: add explicit criteria that a live-owner run or batch owner record survives with no live leaf tab and no running leaf slice, including when its enclosing directory would otherwise qualify for removal, and that a dead-owner run is collected while its leaf remains active, subject to the pane/process vetoes. These are already-taken rules, not new policy.

## F4. Scratch-copy-removal names nonexistent helpers and an unsafe worker cleanup choice

Evidence: `scratch-copy-removal/design.md:37` names an existing `readOwner` helper, but there is none at main. Ownership parsing is inline at `src/reconcile.ts:410-423`; only `ownerSchema` and `ownerDead` exist (`:89-111`). The worker protocol path at draft `design.md:44` also does not exist: the actual file is `skills/implement-issue/worker-protocol.md`, whose line 11 specifies detached worker copies.

More materially, draft `design.md:49` leaves it open whether `removeMergedWorktree` applies to workers. That helper is for the leaf's own worktree: it clears the leaf's recorded `worktree` and deletes the leaf's branch (`src/reconcile.ts:213-220`). Passing a worker's owner leaf to it would mutate the parent's bookkeeping and branch, not worker-specific state.

Exact correction: cite the actual inline owner parsing and actual protocol path. State that worker removal removes the detached copy without clearing the owner leaf's worktree field or deleting its branch. Remove that choice from “Open for the plan.” Factor owner parsing only as implementation requires, without claiming a nonexistent API already exists.

## F5. Stacked-member-close points to a nonexistent stacked branch of commitMove

Evidence: `stacked-member-close/design.md:23` locates ownership at “mergeTurn, the stacked branch of commitMove.” `commitMove` is a single-leaf state transition (`src/phase.ts:127-187`), not the stacked completion consumer. Successful push completion iterates members in `batchPush` (`src/phase.ts:626-634`), and push-result recovery has a separate member loop in `finishPush` (`:726-744`). `src/next.ts:968-993` also has candidate recovery. Editing only a presumed stacked branch or only the normal successful push path misses an existing completion route.

Exact correction: name `batchPush`, `finishPush` and the existing next-pass candidate recovery as the completion paths that must preserve member close/dispatch, with the holder excluded. Require the same result when a reported push failure is later confirmed landed by fetch. Keep the common placement as a planning choice, but make the consumers and recovery outcome explicit.
