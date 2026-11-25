# Fork direct-leaf, notes A (blind, written before reading B, C, D)

Read 2026-11-25 on akrogon main 085f2f88: src/status.ts (note, cells, rows, chartRow), src/state.ts (stateSchema, broadcastPending), src/routing.ts, src/next.ts (dispatchLeaf, dispatchSlot, promptFor, broadcastPass, mergeTurn, mergePass, phaseWake, seatCommand), src/reconcile.ts (leafSeats, endSeats, closeLeaf, closeMergedTab), src/phase.ts (commitMove, commandMerged, completeOwner, moveGuards, transition), src/land.ts (launchLand), skills/chart-issues/assets/direct-route.md, skills/chart-issues/scripts/direct-guards.ts.

## Q1 record

Pick: Q1a, a real leaf with one optional state field. Reason: the lock says tracked and shown "exactly like a lifecycle leaf"; only a real `state.yaml` gets the phase column, NOTE (busy, verdict, fix rounds, land, broadcast pending), TIME from log.jsonl, run attribution through `leafTarget` on `state.worktree`, timings and the JSON `leaves[]` entry with no second renderer. Signposts 3a (extend the leaf record by one field) and 6a (optional field, old states parse). Cost: guards on every command path that touches seats or tabs for a leaf, and a creating verb, since `state.yaml` is command-owned and 0444 (`saveState`).

The field: one optional `door` value naming the chart folder (relative to the repo root). It both marks the leaf door-run and links it to its chart for status and the chart's `Closed` marker.

Seat and tab paths, and what `door` must stop:
- `dispatchLeaf`: no `allocate`, `seats`, `checkBase`, `dispatchSlot` for a door leaf in a seat phase (implement, check.review, check.repair, check.fix); `merge`, `merged` and `failed` stay as for any leaf.
- `allocate` / `startSeat` (also through `seatCommand` and `broadcastPass`): never for a door leaf.
- `closeMergedTab`, `closeLeaf`, `endSeats`, `stop`: inert when the leaf records no `tab` and no seat the command started. Recording no `tab` for a door leaf makes `renameTabs`, `unnamedTabs`, `tabLive` and the failed-leaf tab check inert without a guard. Seats recorded for display must never reach `endSeats`: `leafSeats` matches `akrogon.leaf=<slug>` labels, which the door and consultants do not carry, so it already returns none; the leaf must not add those labels.
- `requiredSlots('check.review', 0)` is `['A','B']`; the direct route reviews with B only. A door leaf needs `['B']` at every review round, or the review never completes.
- Busy display: `observeBusy` runs only on seats `leafSeats` finds; a door leaf's busy comes from its recorded addresses, read the same way, never through teardown.

Rejected: Q1b, chart lines rendered by status: a second renderer that approximates a leaf row (no log-backed TIME, no JSON leaf, run attribution by path prefix only), and the landing engine stays duplicated in prose; it shows less than the lock asks. Q1c: a new record kind (signpost 3a) with its own reader, the same gaps as Q1b.

Evidence: better-than-training, the files above, 2026-11-25.

Pitfalls:
- Reconcile killing the door or closing its tab (catastrophic): removed by recording no `tab` and no labelled seat for a door leaf, plus a free test that merges a door leaf in a temp repo with a live fake door terminal and finds the terminal untouched.
- A hand-written `state.yaml` failing schema and breaking repo scans: removed by the creating verb writing through `saveState` after `stateSchema` parse.
- A held or abandoned attempt leaving a live-looking leaf: removed by the door moving it to `failed` with a reason (existing move) and the abandon step removing the worktree; status already shows failed leaves.
- Twin owner folder (`twinConflict`): the verb refuses when `issues/closed/<owner>` exists.

Question the fork does not ask: where the leaf sits. My pick: `issues/open/<chart-slug>/<slug>/` as a standalone issue, so `completeOwner` closes its `sources` and moves it to `issues/closed` like any issue.

## Q2 landing

Pick: Q2a, the command lands. Reason: the direct route today runs a second landing engine in prose (fetch, rebase, verify, known-red, guards, push, close, broadcast, worktree removal) beside `land`; once the attempt is a leaf, the merge queue serializes it with other landings and `commandMerged` records `state.broadcast`. Removing direct-route steps 5 to 9 and `direct-guards.ts` removes the duplicate rather than guarding it (operator value: removing over adding). Cost: the door no longer sees the landing in its own turn; it waits on the leaf's phase.

What land needs that direct does not provide today: a recorded `worktree` (the verb sets it, adopting the direct worktree through the existing worktree setup), a green leaf-scope receipt at the move into `check.review` (`requireGreenReceipt(..., 'leaf')` in `transition`), so direct verifies run through the leaf, not `--holder`; plan and report files where `requireTestChangeCitations` and check-issue read them (Open for the plan: today they live in `<chart>/direct/`); the review slots rule above.

Rejected: Q2b, two engines that drift; direct pushes race the land run outside the merge queue.

Pitfalls:
- A paused repo stalls the merge: the lifecycle's own pause applies to every leaf; status shows the pause, the same as a lifecycle leaf.
- A land red exit moves the leaf to `check.repair` with `merge_exit`: the door must see it; it is the door's next repair round, read from the leaf's phase.

## Q3 seats and broadcast

Pick: a variant of Q3a. The leaf records the door as A and the current reviewer as B (address and transcript, the existing `seat` refs). The command never starts or prompts a seat for the build, review and repair phases; the door drives them as today. The landing broadcast is command-recorded (`state.broadcast`, `broadcast pending` in status) and its prompt goes to the door's A terminal while idle or done, never a new seat or tab. Reason: the door's address survives handovers and chart switches, while door-created consultants restart on every chart entry, so a broadcast sent to B can be killed mid-send; `skills/broadcast-issue/SKILL.md` already names "the chart door after a direct landing" as a sender. Cost: a typed prompt reaches the door at its turn end, as consultant reports already do.

Rejected: Q3a as written (B sends): the reviewer is the seat most likely to be restarted. Q3b: the door sends and marks it; a door that stops between push and send leaves no pending signal, which is the #153 broadcast doubt itself.

Pitfalls:
- Reviewer changes mid-attempt (restart): the door rewrites `seat.B` through the verb when it sends a review, so status shows the current reviewer.
- `broadcastPending` keys on `prompted.B`: a door leaf's broadcast is acknowledged on the seat it went to (Open for the plan: the field).

Question the fork does not ask: whether the door's `phase` calls carry `--slot`. Pick: the door runs `akrogon phase` for A's moves and B runs its own `check.review --slot B --verdict` and `check.repair` calls, as lifecycle seats do, so the record shows who decided.
