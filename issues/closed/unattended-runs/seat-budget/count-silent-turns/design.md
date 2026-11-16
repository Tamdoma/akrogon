# Design: count-silent-turns

## Binding decisions, verbatim

### Signposts (issues/chart/unattended-runs/forks/signposts.md), A's picks under full autopilot, 2026-11-16: `1a 2a 3a 4a 5a 6a 7a`

#### Question

1. Tie-breaker.
   - 1a (recommended, A,B,C) Remove the cause first (fewer parts), but only inside the authority that already exists. Removing a prompt by widening a seat's standing permissions beyond what it has today does not count as removal (C D2).
   - 1b Add the watcher or guard the report asks for.
   - Steers: every fork's recommended option.

2. Reach.
   - 2a (recommended, A,B,C) Agent edits stay in the akrogon repo. A change outside it (Claude settings, hc, herdr) is supplied as exact text for the operator to apply, as a needs row, and the outcome states plainly what akrogon alone cannot fix (C D3, L5).
   - 2b Agent edits outside akrogon too.
   - Steers: #135 scope, #137's unknown seat killer, needs rows.

3. Who may answer a prompt in another tab.
   - 3a (recommended, A,B,C) Grants, paid launches past a grant, needs-sheet rows and chart approval rows stay operator-only. A watch may at most release an action already decided inside the seat's brief and grant, never a new decision, never past a harness denial (B D1, C D1, B L1).
   - 3b Operator-only for every prompt.
   - 3c The watch answers any prompt it judges safe.
   - Steers: the watch skill's Never list, #135's done claim, needs rows.

4. What spends the no-report budget (attempts).
   - 4a (recommended, B,C) Only an observed turn that ends without a report. Starts and resumes cost none, while a separate bound still stops a start loop (B Q2, C Q2a, C L2, B L2).
   - 4b Every confirmed delivery or start, as today.
   - Steers: #136 and #137 together, the failure reason text, restart spending.

5. Wrong state.
   - 5a (recommended, B,C) Refuse the affected action loudly, where the actor will read it; independent leaves and the operator's recovery path continue (B D2, C Q6, C D4, C L6).
   - 5b Refuse or pause the whole repo.
   - 5c Log and continue.
   - Steers: run-check on a failed leaf, resume guards.

6. Proof spending.
   - 6a (recommended, A,B,C) Free local fixtures and fake slow commands first. Paid throwaway sessions only to observe real harness prompt screens for #135, under needs row N1. No reboot, no keys into real doors or seats, no real paid outside API (B L3, C L4).
   - 6b Local only.
   - Steers: proofs, grants, the needs sheet.

7. Order inside the chart.
   - 7a (recommended, C) Settle the attempts rule first, since #136 and #137 share the counter and dispatch path; #135 runs side by side once its fork is settled. If anything must give, live confirming in #135 gives first (recorded only: A may order, never drop).
   - 7b Three independent tracks from the start.
   - Steers: fork order, leaf split, blocked-by.

Reply key: `1a 2a 3a 4a 5a 6a 7a`, or numbered free text.

Challenge check: C wants an outside Claude permission rule inside #135's done claim (C Q5a); A keeps it a conditional needs row because 1a may remove the prompt class first. B wants routine chart-row answers delegable (B D1); A keeps chart approval rows operator-only because the N11b row in #135 gates a readiness input, which is an approval. Hard limits adopted: never bypass a harness denial or use forced delivery (B L1); never erase lost-seat evidence or remove every restart bound (B L2, C L2); no keys into real tabs, no reboot, no shared hc restart (B L3, C L4); every watch confirmation or run-check refusal leaves a durable record (C L3); confirming is claimed only on a harness where a probe showed the real screen and keys (C L7). C's placement owed: the listener boot PATH crash in #137 is placed by the map.

#### Taken

A's picks under full autopilot (2026-11-16T09:43:00Z, door t126), not operator words: `1a 2a 3a 4a 5a 6a 7a`. The operator's words that handed the round to A, verbatim: "Full autopilot mode, singposts autopilot, too."

Reasons: 1a is the operator's "Elegance and least complexity solutions first", bounded by C's point that wider standing permissions are risk, not removal. 2a is removing over adding and keeps agent edits reviewable in one repo. 3a follows the operator's "confirm it if it's not that dangerous" while approvals stay operator-only by the skill's rule. 4a makes the failure reason "ended N turns without reporting" true by construction. 5a keeps everything moving, per the operator. 6a is speed and price. 7a because two leaves editing one counter rule in parallel can disagree.

Account: the session removes prompt and budget causes before adding watchers, keeps edits in akrogon, keeps every approval with the operator and refuses wrong-state actions narrowly. It gives up an agent-run reboot test, edits to outside tools, and any watch answer to a new decision.

### Turn count, A's picks under full autopilot, 2026-11-16, rebutted by B and C, final-shape check by B and C (issues/chart/unattended-runs/forks/turn-count.md)

A's picks under full autopilot (2026-11-16T10:20Z, door t126), not operator words.

1. Q1: count once at the silent-stop point in `dispatchSlot`: in one state write add 1 to `attempts[slot]` and clear `prompted[slot]`, then fail at 3 with the existing reason or redeliver. Remove the +1 in `deliver` and in `startSeat`. Reason: the reason text becomes true by construction (signpost 4a), and clearing `prompted` in the same write removes the double charge with no new field. Rejected: B's `counted_prompt` cursor (an extra field for the same guard).
2. Q2: skip both counting and redelivery while `liveRuns()` holds a live or waiting record whose `repo` and `leaf` match the leaf. The wake after the run is the seat's own completion turn. No completion wake and no age expiry. Reason: long runs must background on claude, and the seat's own turn already wakes dispatch (signpost 1a, fewer parts). Stated limits: a harness that takes no turn when its background run ends waits for the next hc event in the repo, and a hung live run holds the leaf until it ends or is stopped. B's completion-wake dissent stands.
3. Q3: one new per-slot count `lost` (the `counts` schema, prefaulted like `attempts`). Add 1 before each replacement start of a seat whose prompted turn never ended (terminal finished or gone). At 3 the leaf fails with cause `attempts` and reason "seat <S> was lost 3 times before ending a turn". Reset to 0 when a prompted turn is seen ended, and on every phase move beside `attempts`. Reason: it bounds paid restarts the way attempts always did and keeps every downstream rule (C R3 agrees). B's dissent on cause and per-identity charging stands, answered by C R3: passes serialise and a failed start counts as the same class.
4. Q4: before `end` removes a lost seat, append one timing row `seat_lost` through `appendTiming` with slug, slot, phase, address, turn, status, `exit_code` and `signal` (absent when hc gives none) and the last 40 screen lines, or `gone: true` when the terminal is already missing. Parse `exit_code` and `signal` in src/hc.ts terminalSchema. Reason: one row per loss in the log that reports already read, with no new artifact class. B's dissent on best-effort append stands.
5. Q5: no migration. Old counts reset at the next phase move. The leaf report names open leaves whose stored attempts are 2 or more at merge, including framework competition-read-skill (A=4). Reason: a permanent marker field for a one-time reset is the larger part (C R5). B's dissent (B R5) stands.

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it narrows the charge condition and adds no mechanism:

- Q3 corrected (C D1): the `lost` charge keys on a recorded seat in `state.seat[slot]` being replaced because its terminal is finished or gone, not on `prompted[slot]` existing, so a seat that dies during the start proof or times out its delivery is charged too. `lost` resets to 0 whenever `dispatchSlot` observes a turn end (the silent-stop point) and on every phase move.

- Excluded here: failed-refusal (owned by refuse-failed-runs), blocked-prompts (owned by claude-seat-no-questions and blocked-seat-notice), door-address (owned by door-reads-live-address).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: every criterion is controller behavior, proven by the smallest test at the existing boundary, `dispatchSlot` driven through the existing next tests on the real hc test core with the stand-in seat (tests/hc-fixture.ts, tests/hc-shim.sh). A stand-in seat that exits, is killed, or ends a turn without a phase move is fixture work, not machinery. The live run in criterion 3 is a real admission record from the existing `withAdmission` path (a fake slow command run through run-check), never a hand-written YAML file. No model call, no paid call, no grant. Existing tests that pin the old count (a start setting attempts to 1, a delivery adding 1) are false expectations under the new rule and are updated with that reason, not deleted. The two observed hc fields (`exit_code`, `signal`) were proven at charting (readiness.yaml proofs) and are not re-proven live.

## Leaf architecture

- Owned surfaces: src/next.ts (`dispatchSlot`, its `deliver`), src/seat.ts (`startSeat` count removal), src/state.ts (`lost` field), src/phase.ts (`commitMove` reset of `lost`), src/timing.ts (`seat_lost` kind), src/hc.ts (`terminalSchema` and `Seen` gain optional `exit_code` and `signal`), and their tests.
- Literal interfaces:
  - State: `lost: counts.prefault({})` beside `attempts`, same `{A, B}` non-negative integer shape.
  - Timing: `z.strictObject({ ...slugged, kind: z.literal('seat_lost'), slot: slotSchema, phase: historicalPhaseSchema, address: z.string(), turn: z.number().int().nonnegative().optional(), status: z.string().nullable().optional(), exit_code: z.number().int().nullable().optional(), signal: z.number().int().nullable().optional(), screen: z.string().optional(), gone: z.literal(true).optional() })`.
  - Failure reasons: "seat <S> ended <N> turns without reporting" (unchanged) and "seat <S> was lost 3 times before ending a turn", both cause `attempts`.
- Counting point: in `dispatchSlot`, where `prompted.turn < seat.turn` today, the pass first checks `liveRuns()` for a record with `repo === repo.name` and `leaf === slug`. When one exists it returns. Otherwise one `saveState` writes `attempts[slot] + 1`, `prompted[slot]` cleared and `lost[slot] = 0`. Then it fails at 3 or more, else calls `deliver`. `deliver` no longer adds 1. Consumer: the delivery-error resettle branch in `dispatchSlot`, which writes `prompted` from a recorded `delivery_error` without a count. It stays as it is, because its turn end is counted later at the counting point.
- Replacement point: in `dispatchSlot`'s finished-or-missing branch, the prior seat is `recorded.seat[slot]` from state (`allocation.seats[slot]` is undefined for a gone terminal, because `leafSeats` in src/reconcile.ts finds seats only in the hc listing). When that seat is finished and its turn is past `prompted[slot].turn` for the same address, the pass handles it as a silent turn end at the counting point (count, reset `lost`, fail at 3) and replaces it without a loss charge. Otherwise, when a recorded seat exists, the pass appends the `seat_lost` row (from `terminal()` and `screen()` when the terminal exists, else the address from state and `gone: true`), then writes `lost[slot] + 1`. At 3 it calls `commitMove(..., 'failed', slot, {cause: 'attempts', ...})` and starts nothing. Otherwise it calls `end` and `startSeat` as today. Consumer: `startSeat`'s launch record, which clears `prompted[slot]` and `delivery_error[slot]`. It must not touch `lost`.
- `commitMove` resets `lost` to `{A: 0, B: 0}` beside `attempts`. Consumers that read `attempts`: the failure reason, `akrogon status` output, and the watch skill's Judge, which classifies by reason text. None reads `lost`.
- Timing seam: `readTimings` in src/timing.ts parses every line strictly inside one try and returns an empty list on any failure, so an older akrogon release reading a timings file with a `seat_lost` row drops all timings for that repo. The leaf report states this seam.
- Stated limits, binding: a harness that takes no turn when its background run ends waits for the next hc event in the repo. A hung live run holds the leaf until it ends or is stopped. Plain background shell jobs outside run-check are not seen. Old counts are not migrated, and they reset at the next phase move.
- The leaf's implementation report names each open leaf in registered repos whose stored attempts are 2 or more at merge, by repo and slug (framework competition-read-skill held A=4 on 2026-11-16).
- Lesson: learnings/history/2026-11-15-background-wait-fails-leaf.md (uncommitted on main at charting). This leaf does not stop that lesson on every path, because plain background shell jobs stay unseen. It keeps the line and writes no `Applied` entry.
- Open for the plan: whether the `seat_lost` row and the `lost` write share one `record()` call order so a crash between them can at most write the row without the count (acceptable), never the count without the row.
