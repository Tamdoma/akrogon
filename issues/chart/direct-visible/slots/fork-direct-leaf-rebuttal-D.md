# Rebuttal: slot D, fork direct-leaf

Disagreement only. Evidence tiers: code-read or skill-read on akrogon main, all 2026-11-25.

## Where slots differ

### R1. Differ 1: reject a blind A review (B) and B-only `requiredSlots` (A,C)

- B: a blind A review of the door's own work is impossible in the door's own terminal and context. A genuinely fresh A needs another seat, worker or session, which breaks the lock that the attempt runs in the door's current tab with no new seat. Calling the door's second look blind also writes a false claim into the review record.
- A,C: making `requiredSlots` return `['B']` for a direct leaf changes a pure phase function used by `transition`, `leafJson` `waits_on`, dispatch and `refuseEnclosingCompletion`. Every future caller that omits the field gives a silent stall at `check.review`: status waits on A, nobody prompts A, and the door waits on B alone. It also makes a first direct review indistinguishable in state from a lifecycle re-review, which is the only place B-only exists today.
- Keep D: A records its own verdict after its verify receipt and proof runs. That is an implementer attestation, not a blind review. It can record `fix` against itself before B runs.
- Evidence: code-read, src/routing.ts `requiredSlots` B-only only when `fix_rounds > 0` at `check.review`; src/phase.ts `transition` requiring every required slot and computing the destination from recorded verdicts; src/status.ts `leafJson` deriving `waits_on` from the same function.

### R2. Differ 2: reject routing a direct `fix` straight to `check.fix` (C)

This breaks four separate mechanisms, where the D hop through `check.repair` breaks none:

1. `routing` does not list `check.fix` as a next phase of `check.review` or of `merge`, so the move is illegal everywhere routing is read, not only in `transition`'s computed destination.
2. `commitMove` clears `batch` and sets `merge_exit` only when the destination is `check.repair`. A land exit rerouted to `check.fix` keeps its batch record and drops its exit record, so reconcile and the next merge pass see an in-flight batch on a leaf that is back in building.
3. `commitMove` increments `fix_rounds` only entering `check.fix` from `check.repair` or `merge`. From `check.review` the count stays 0, so status and the repair bound lose the round count, and the next review is again a rounds-0 review.
4. Land and merge-turn exits write `check.repair` directly at three sites (land `repairExit`, next `mergeTurnExit`, next legacy applied-record exit), and `mergeExitContext` reads the exit only in `check.repair`. Each needs its own special case, where the hop reuses them untouched.

The hop is not a fabricated B action. B's review file is B's triage, and the door transcribes B's phase records from that file at every step, verdicts included. Evidence: code-read, src/routing.ts route table; src/phase.ts `commitMove` and `transition`; src/land.ts `repairExit`; src/next.ts `mergeTurnExit` and `mergeExitContext`.

### R3. Differ 3: the TIME point is a defect, not a side note, and no remedy is chosen

Status `starts` reads only `prompt` timing rows with outcome `delivered`, and the only writers are `dispatchSlot`'s timing closure and `seatCommand`. Both are stopped for a direct leaf, so TIME is `-`, JSON `first_prompt` is null and the merges table gets `total_ms` null for the leaf's whole life. That contradicts the lock's exactly-like-a-leaf on a column the operator reads. Writing a fake `prompt` row at creation is not free either: prompt rows are wake rows and carry the seat session used for timing attribution, so the door's whole charting session would be attributed to the leaf's implement visit. The merged notes must pick a remedy, for example a status-side start fallback to `state.created` for a direct leaf, or record the accepted `-` against the lock. Evidence: code-read, src/status.ts `starts` and `cells`; src/next.ts prompt timing writers; src/timing.ts `promptSchema` and wake-row comment.

### R4. Differ 4: reject a command wake to the door (C)

A wake is a prompt. Q1a as written says the command never prompts these seats, and an idle-gated `hc send` still starts a turn in a terminal that by then may be charting the next chart or sitting with the operator. `landedWake` today sends nothing to any seat. What it breaks: an unattended door turn with a closed chart's context gone, spending on a tail the door already handles by staying in its turn and watching the land unit, as it already stays synchronous through today's hand push. Evidence: code-read, src/next.ts `landedWake`; fork Q1a lock text in forks/direct-leaf.md `## Question`.

### R5. Differ 5: reject the door A as broadcast recipient (A)

- The ack, the cleanup hold and the skill prompt are all B-shaped. `broadcastPending` clears only on `prompted.B`, `broadcastInProgress` keys on `seat.B`'s address, and broadcast-issue's command form is `slot=B`. Sending to A needs all three changed, or a `prompted.B` record for a prompt B never got.
- The given reason is not a code property. A recorded address is history, never routing, under chart-issues `## Open` (the door's address is read live at each use), so a recorded `seat.A` goes stale on a new door terminal in exactly the way a recorded `seat.B` goes stale on a consultant restart. Both need the verb rewrite. The restart asymmetry buys nothing.
- Recipient A is also Q3b in effect, the door as its own broadcast sender, which the merged notes tag A itself as rejecting. The merged file cannot hold both lines.
- Evidence: code-read, src/state.ts `broadcastPending`; src/reconcile.ts `broadcastInProgress`; src/next.ts `broadcastPass` prompt text. Skill-read, skills/chart-issues/SKILL.md `## Open` door-address rule; skills/broadcast-issue/SKILL.md command-run merge form.

### R6. Differ 6: reject leaving the plan location open (A)

Keeping plan and report under `<chart>/direct` is not a stable option once the leaf records its worktree. `leafTarget` matches the worktree to the leaf before it ever reads `--holder`, so every run-check and verify from the worktree already targets the leaf's `implementation/` folder and slug, and the holder argument in skill text would say something the code silently disregards. Status prints `<leaf>/plan.md` and JSON points `plan` there. An open choice here splits one attempt's artifacts across two holders and breaks the Q1 run-attribution result the merged notes claim. Evidence: code-read, src/run-check.ts `leafTarget` match order; src/status.ts `statusCommand` and `leafJson` plan path.

## Other wrong, mis-tagged or missing points

### R7. A plain `direct: true` field (C,D merged line) loses the leaf-to-chart link

After land, `completeOwner` moves only the leaf's owner. Nothing in state, log or status names the chart, so a replacement door that finds a merged direct leaf has only CHART.md prose, searched by branch slug, to find the chart whose `Closed` marker and pack tail it owes. Once the chart is packed that prose link is all that remains. A's `door: <chart path>` carries the boolean and the link in the same one field the signpost allows. The boolean as merged is under-specified, and my own D name for it was wrong on this point. Evidence: code-read, src/state.ts `stateSchema` holds no chart reference; src/phase.ts `completeOwner` moves the owner folder only.

### R8. `hc send --if idle` does not cover the Q3a condition

Q3a says send while B is `idle` or `done`. Those are distinct hc status words, and `dispatchSlot` gates on both. The send helper's only condition is `--if idle`, so a reviewer whose status reads `done` can be refused by the very flag meant to protect it, leaving `broadcast pending` up with nobody at fault. The branch must read B's status itself and send on either word, as the consultant asking rule does, using `--if idle` at most as a second guard whose `started: false` answer is treated as not sent. Evidence: code-read, src/hc.ts `send` options; src/next.ts `dispatchSlot` idle-or-done gate.

### R9. "The door waits for the broadcast send before restarting consultants" does not remove the stranded broadcast

`broadcastPass` runs only at the head of `mergeTurn`. If B is busy at the `landedWake` pass, the leaf stays pending, and a door polling read-only `akrogon status` triggers no further pass. Waiting is therefore unbounded and passive: the door can wait correctly forever and still strand the broadcast at the restart it is delaying. The removal has to name an active step, a door-run next or merge pass until `prompted.B` is recorded, or a bounded rewrite of `seat.B` before restart. Evidence: code-read, src/next.ts `mergeTurn` calling `broadcastPass` once per turn, `mergePass` loop ending when the holder leaves `merge`, src/status.ts `statusCommand` read-only.

### R10. The abandon disposition "remove the open folder, or park" is not available as written

Park refuses an owner whose leaf records a tab or worktree as a running leaf, and a direct leaf always records a worktree, so parking an abandoned attempt fails until the worktree is removed and reconcile clears the record. Removing the open folder by hand has no command path, writes no park timing row, and deletes the brief, design and state that are the attempt's only provenance. Either name the full sequence (failed, worktree removal, cleared record, park) or accept the visible `failed` row. Evidence: code-read, src/park.ts `running` and `parkCommand` busy refusal; src/reconcile.ts missing-worktree record clearing.

### R11. The frozen-record line overstates equivalence with land gates

Merged Q2 says direct-guards' five checks are the land gates, then names the absent frozen record as a gap. Two corrections. Nothing is lost against the direct route today, since direct-guards never checked frozen citations either. But a direct leaf is weaker than a lifecycle leaf in one named way the merged equivalence claim hides: lifecycle freezes the planner's test-first tree at `plan.synthesis -> implement`, and later edits to those tests or new test files need frozen citations, while a direct leaf's tests, written first inside `implement`, can be edited during repair rounds under test-change citations alone. Naming the gap removes nothing. Either the creation verb freezes at the test-first commit equivalent, which no current phase boundary marks, or the taken answer records the weaker gate as accepted for direct leaves. Evidence: code-read, src/phase.ts `frozenRecord`, `requireFrozenCitations`, `transition` freeze point, `moveGuards` skipping frozen when absent; skills/chart-issues/scripts/direct-guards.ts check list.

### R12. "No broadcast config, no change in this leaf" is a change for the direct route

Today's direct landing broadcasts only when the repo configures broadcast (direct-route.md step 7). `commandMerged` writes the handoff and `broadcastPass` prompts with no config gate anywhere in src, so under Q2a a direct leaf in an unconfigured repo gets its reviewer prompted, the sender errors on an empty target list, and `prompted.B` is already recorded so nothing shows pending. That may be a pre-existing lifecycle behaviour, but merged notes cannot claim no change while adopting it for a route that is gated today. Evidence: code-read, src/phase.ts `commandMerged`; src/next.ts `broadcastPass`; src/config.ts broadcast config optional. Skill-read, skills/chart-issues/assets/direct-route.md step 7; skills/broadcast-issue/SKILL.md empty target list is an error.

### R13. Feeding the existing `observeBusy` does more than set `busy_since`

The merged busy line treats `observeBusy` as a display feed. It also writes blocked notices containing the seat's screen, stall notices after one hour, and clears notice state, all keyed to this leaf and seat. With A a shared charting terminal, the door blocked on an operator question in another chart writes a blocked notice naming this leaf, with screen text from that other work. C's scoping to the phase's required slots is merged as a parenthetical, not a rule. It must be a rule, and the notice branches need a stated answer for a shared door seat, or busy-by-address should write `busy_since` alone. Evidence: code-read, src/next.ts `observeBusy` blocked, busy and stall branches.
