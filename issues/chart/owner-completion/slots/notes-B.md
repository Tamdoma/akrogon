# Slot B blind notes

Inspected 2026-10-19 against akrogon HEAD `e522c1865538294dc1f65a90c7bcb5309a667513`. Recommendations only. The stuck-repair fork remains unanswered.

## owner-reuse

### 1. Pick, reason and cost

D1: Give each new handoff group a fresh completion-owner name. An owner closes once. Extend an existing open owner only while that handoff remains open. Refuse an open owner whose top-level name already exists under `issues/closed`, including an empty destination.

This preserves the existing whole-folder completion move and one owner archive. It removes the need for an append transaction, index reconciliation and archive merging across two folders. Enforce the rule before dispatch, surface it in status, and retain the completion collision refusal against later filesystem changes. Use one owner-collision rule across those entry points.

Cost: later waves need distinct names, the current permissive dispatch test changes, and existing twins require an explicit repair before retry. This choice does not satisfy #108's requested append behavior as written. The destination must explicitly allow repairing the existing twin and forbid future twins rather than promise completion of an arbitrary collision.

### 2. Rejected options

O1: Append new children into the closed owner. It matches #108's requested behavior, but makes an immutable completion owner into a mutable collection. Moving children, reconciling two EPIC.md files, combining two archives and recovering a partially completed append require additional rules. `packFolder` merges logs within one folder. It does not implement that owner transaction.

O2: Keep only the existing late completion refusal. It permits a whole handoff to run and merge before discovering that its owner cannot close. The checked-in dispatch test deliberately permits this today.

O3: Overwrite the destination or silently invent a new owner name at completion. Overwrite risks losing earlier evidence. Silent renaming makes recorded paths and handoff identity change after delivery.

### 3. Evidence with tier, source and date

F1: Primary repository code, inspected 2026-10-19. `src/phase.ts:191` (`completeOwner`) computes a top-level owner, refuses an occupied destination at `:201`, then packs and renames the entire folder at `:225`. Its natural unit is one owner lifetime.

F2: Primary repository code, same date. `src/evidence.ts:46` resolves an owner name across open/closed/parked. `readLog` at `:67` uses the first existing owner for archived evidence. An open twin can therefore hide a closed twin's archive. `src/pack.ts:12` operates on one folder and refuses differing bytes for a shared archive member at `:28`.

F3: Primary repository test and process contract, same date. `tests/next.test.ts:5700` expects a same-name open owner to dispatch despite a closed owner. `/home/ivan/.claude/skills/chart-issues/assets/shapes.md`, section “Preflight and validation”, already forbids that closed-owner collision before handoff. The process and executable behavior disagree.

F4: Operator-placed intake and permitted live tree, same date. #108 requests append. Framework currently has both `issues/open/satellite-plan-fit` and `issues/closed/satellite-plan-fit`, with six merged leaves in the open owner and two in the closed owner. This is a real legacy repair requirement, not evidence that append must become the permanent lifecycle.

### 4. Pitfalls and what removes them

R1: A fresh-name rule alone leaves today's six leaves stuck. Remove this trap by settling and verifying the separate stuck-repair operation before claiming the destination achieved. No repair route is selected here.

R2: Detecting collisions only through leaf states misses an empty closed directory. Remove this trap with the owner-directory occupancy check already required by preflight.

R3: Repairing the collision can reveal #103 next. Five of the six open satellite-plan-fit leaves lack a recorded worktree, including the unsourced replay-cases leaf. Four sourced leaves therefore need completion independent of a worktree. Verify both failure conditions together after the repair.

### 5. Question missing from the fork

Q1: Does “always completes on retry” permit an explicit one-time repair of invalid historical twins, with future twins refused? If it requires an unmodified existing twin to finish automatically, D1 cannot satisfy that contract. That is a substantive scope choice to record before implementation.

## close-witness

### 1. Pick, reason and cost

D2: Cite the leaf slug using the existing `delivered by <slug>` convention. Derive the comment from durable leaf state and remove the worktree/HEAD dependency from source closure.

The completion decision already rests on merged states. A comment identifies the recorded delivery without introducing another required merge artifact. This handles old states and every current landing path without backfilling commit metadata.

Cost: the GitHub comment loses a direct commit reference. This deliberately relaxes #103's requested “with the merge commit” behavior and the current `merged <sha>` convention. Record that tradeoff explicitly. A slug identifies a lifecycle record, not independent proof that a particular commit landed.

### 2. Rejected options

O4: Persist a landed SHA for every leaf at merge. Choose this only if direct commit attribution is a requirement. It adds a state field, writes on successful landing and recovery paths, a definition of which SHA belongs to stacked members, and a repair requirement for existing merged states without it. That is more machinery than source closure needs under D2.

O5: Read the worktree, surviving branch, current main or log on retry. Worktrees and branches are intentionally removed. Current main can advance beyond delivery. The move log is written after the phase state and can fail, so it cannot supply a mandatory witness. None is a sound replacement for a durable merge-time record if a SHA is required.

O6: Prefer SHA and fall back to slug. It adds two comment forms and recovery behavior without answering whether a commit reference is actually required. Pick one contract.

### 3. Evidence with tier, source and date

F5: Primary repository code, inspected 2026-10-19. `src/pull.ts:184` (`closeSources`) requires a worktree and reads its HEAD before closing any source. `closeCommand` at `:208` already uses `delivered by <text>` through the same `closeSource` implementation. Slug comments need no new GitHub operation.

F6: Primary repository code, same date. `src/reconcile.ts:584` clears `state.worktree` after removal. `mergedWorktree` at `:675` retains a worktree for a fully complete open owner but can remove it while siblings remain unfinished. This is why an earlier merged leaf can lose the context later completion expects.

F7: Primary repository code, same date. `src/state.ts:153` enforces slug uniqueness across open and closed leaves. Its state schema has no permanent landed-commit field. `src/phase.ts:155` saves the phase before completion and logs afterward in the `finally` block. `src/log.ts:32` derives HEAD from the worktree or repository root, so a logged HEAD is not necessarily a leaf's landed commit.

F8: Primary repository code and test, same date. Successful batch landing in `src/phase.ts:630`, recovery at `:730`, and `src/next.ts:957` transition members and holder through distinct paths. Batch data is later cleared. `tests/phase.test.ts:566` currently expects sourced completion without a worktree to fail. D2 must change that behavior, not preserve it as a guard.

### 4. Pitfalls and what removes them

R4: Slug attribution could be sold as commit proof. Remove this trap by stating exactly what the comment identifies and recording the departure from #103's expected commit reference.

R5: A source shared across leaves can close when a different leaf triggers final completion. `completeOwner` currently sends aggregated sources with the triggering leaf. Remove misleading attribution by defining the slug as the completion trigger, or settle a different attribution rule before implementation. A saved SHA from that trigger alone would not prove every contributor either.

R6: A failed close must remain retryable without moving the owner first. Preserve source closure before packing/rename and the existing retry/comment-deduplication behavior. Verify partial API success followed by a retry after worktree removal. No live GitHub write was made for these notes.

### 5. Question missing from the fork

Q2: For a source owned by multiple leaves, should the comment identify the leaf triggering completion or all contributing leaves? The existing implementation uses the trigger. If that remains the contract, say so. If every contributor must be cited, the single-witness choice in this fork is incomplete.
