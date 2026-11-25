# Final-shape check: slot D, fork direct-leaf

Defects and conflicts only, on items marked [new] and item 4.

## Item 2, creation and seat verb

- No session rule for seat validation. `hc.ts` `terminal(session, address)` needs a session before it can read an address, and `SeatRef` stores that session. The shape does not say the verb finds each address by scanning `sessions()`. If it assumes `repoSpace`'s session, a supplied reviewer in another live hc session is refused or recorded under the wrong session, and item 5's busy reads and item 16's broadcast lookup then miss permanently. The lock allows whichever slot is reviewer.
- Rerun after landing can resurrect the worktree. Item 17 reruns this verb on a merged leaf, but `reconcile.ts` `removeMergedWorktree` clears `state.worktree` and deletes the branch. Presence of a worktree therefore cannot tell a first run from a rerun. Without an explicit merged or already-created guard, the verb's create path follows `next.ts` `ensureWorktree`'s rule and recreates a worktree and a fresh branch from the tracking ref for a leaf already in `issues/closed`.
- Refusing outside hc changes eligibility, which the shape and the fork both say is out and unchanged. `skills/chart-issues/SKILL.md` `## Direct route` lists the refusals, and a door outside hc is not one of them; only B not being named is. As written a previously eligible outside-hc direct attempt becomes impossible because `seat.A` cannot be recorded. Either name this as an eligibility change in item 18 or allow an unrecorded A seat.

## Item 4, command never acts on seats

- The item names `dispatchLeaf` only as a seat path, but the same function carries non-seat duties a literal skip breaks: a merged leaf calls `completeOwner` there (`next.ts` `dispatchLeaf`), which is the recovery path when a merged move committed but its follow-up failed, the case status reports as an unpacked `.closing` owner with `akrogon next <slug>`. A blanket direct skip at the top of `dispatchLeaf` or in `sweep` removes that retry. The shape must state that the merged completion branch, and merge-phase handling, still run.

## Item 5, busy from recorded addresses

- Stale `busy_since` is never cleared for a slot that stops being required. `commitMove` carries `busy_since` across ordinary moves (`phase.ts`), and `status.ts` `note` prints busy for either seat regardless of phase. A `busy A` written during `implement` survives into `check.review`, where item 5 writes only B, and then grows forever. The writer must also clear the non-required slot, or `commitMove` must clear `busy_since` for a direct leaf on every move.

## Item 6, TIME

- The contract is not checkable as written: "source left to the plan" leaves the one new status input unnamed in a shape that is otherwise a list of mechanisms. The obvious existing source conflicts with the item's own wording: `state.created` is written by the door before the verb runs (item 2 runs after the door writes the leaf files), so it is not the verb's run. The item also does not say whether JSON `first_prompt` and the merges table `total_ms` (`status.ts` `starts`, `leafJson`, merges build) get the same fallback, so text TIME and JSON can disagree on the same leaf.

## Item 7, seats display

- No surface is named, and the two plausible ones conflict. Text rows show no seat recipe at all. JSON `seats.a` and `seats.b` are fixed by the `JsonLeaf` type in `status.ts` to `{harness, command, source}` under schema 1 (`seatJson`), so replacing them with recorded `{session, address}` terminals changes the JSON contract for any reader. Adding fields keeps the contract but is a different item than written.
- Bypassing the recipe in display does not bypass it in the scan. `scanRepo` calls `config.ts` `seats` for every open leaf and a `SeatIndexError` from the leaf owner's ISSUE.md makes the whole repo unreadable in status. Item 1 has the door write ISSUE.md for the direct owner, so any seat index lines copied from the chart can break repo status for all leaves unless the scan also skips `seats` resolution for a direct leaf.

## Item 9, direct slots in the routing function

- "The routing slot function takes the leaf's state so no caller can omit the route" is false for the historical caller. `timing-report.ts` `visitGaps` has only a log-built visit (phase, rounds, seatless) and calls `routing.ts` `historicalSlots`; log records carry no direct marker. Every closed direct leaf then reports a missing prompt for `check.review` at rounds 0 (expects A and B) and for `check.repair` (expects B), and the rounds-0 review check in the same function expects a `seat_done` row that `transition` never writes for a single-slot phase. Direct leaves enter timing cohorts with permanent false gaps unless history learns the marker or direct leaves are excluded there.

## Item 10, phase flow

- B gets a lifecycle task without a lifecycle seat's environment. `seat.ts` `startSeat` starts check seats with cwd at the worktree and `AKROGON_BASE` and leaf `TMPDIR` in env. `seat.ts` `launch` starts chart consultants in the caller's folder with none of that. Item 10 sends the lifecycle `check.review` task, which names no worktree and no base, to that consultant terminal, so everything in check-issue that keys on `AKROGON_BASE` or on running in the worktree reads an unset base or the repo root. The old direct task carried `worktree=` and `base=` for exactly this reason (check-issue direct section maps those rules onto them). The shape either keeps those fields in the door's prompt to B or states that B changes directory and derives the base before reviewing.
- A handling a merge exit in `check.repair` has no artifact owner and no independent re-check on one path. check-issue's check.repair red-merge rule is written for B throughout: B records the judgment and the range-diff in `review-B.md`, B owns the head and base causal judgment, B returns the leaf to `merge`. Item 10 gives that work to A, the implementer. For an unedited return, A alone judges its own diff not the cause of a red merge and moves `check.repair -> merge`, where `transition` also skips the leaf receipt when head equals the recorded red top; nobody independent sees that judgment before land reruns. For a conflict or dirty exit, A resolves in `check.repair`, then the flow sends it through `check.fix` to a B re-check, but that re-check's evidence rule reads the refreshed-branch SHAs and range-diff basis from `implementation/report.md` (check-issue re-check section), and the shape never says A writes them there rather than in `review-B.md`. As written B can only record a missing-evidence Fix, adding a round, or re-check without the recorded basis.

## Item 11, door stays in its turn

- Staying in the turn supplies no trigger. If a land unit dies without an exit, relaunch happens only inside a later `mergeTurn` (the applied-record branch in `next.ts`), and a door polling status runs no merge pass. The item needs the door's active step while it waits, for example running `akrogon next <slug>` on a dead land unit, as item 17 now does for broadcast. Without it the door can wait correctly and indefinitely on a `merge` leaf whose batch nothing is driving.

## Item 12, abandon deletes the owner folder

- Deleting the whole owner folder is unsafe against item 1's naming. The owner is named after the chart, and chart slugs are ordinary slugs; item 2 refuses only a twin owner, not an `issues/open/<chart-slug>` that already exists holding other work. If the door writes the direct leaf under such an owner, abandon deletes sibling leaves, their briefs and their state with it. Deletion needs a sole-leaf check at creation and again at abandon.
- It also deletes evidence the shape elsewhere relies on. Under item 10 the review file, plan, report and run logs live in the leaf (`review-B.md`, `plan.md`, `implementation/`), and the parenthesis in item 12 keeps only brief, design and reason in the chart. An abandon after three repair rounds, and a growth-stop handoff whose lifecycle planner is meant to decide what to keep, both lose the review findings and the attempt report that say what was done and why it stopped. No command path deletes an open owner today, so this is also a hand deletion with no inventory, lock or timing record (`park.ts` is the existing owner-move shape and refuses a running leaf).

## Item 15, broadcast handoff only when configured

- "Configures broadcast" is not defined against the schema. `config.ts` makes `broadcast.discord.webhook_env` an array with no minimum, so a repo with the object present and an empty target list still records the handoff, still prompts B under item 16, and the sender then errors on the empty list per broadcast-issue, with `prompted.B` already set. The gate has to mean at least one configured target, or the defect in the previous round survives in miniature.

## Item 17, waiting for the broadcast before consultant restart

- The recovery step cannot work in the state it is most needed. Once item 16's send starts, `prompted.B` is recorded and `broadcastPending` in `state.ts` is false whatever address the entry holds. If that B then dies or never sends, item 17's rerun repoints `seat.B` and runs `akrogon next <slug>`, but `broadcastPass` filters on `broadcastPending` and sends nothing to the new B, and item 2 forbids the rerun from clearing `prompted`. The shape conflates B busy before the prompt (pending true, repointing works) with B gone after it (pending false, broadcast silently lost). One of item 2's never-clears rule or item 17's resend claim has to give.
