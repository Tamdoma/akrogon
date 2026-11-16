# Design: blocked-seat-notice

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

### Blocked prompts, A's picks under full autopilot, 2026-11-16, rebutted by B and C, final-shape check by B and C (issues/chart/unattended-runs/forks/blocked-prompts.md)

A's picks under full autopilot (2026-11-16T10:20Z, door t126), not operator words.

1. Q1: `harnessArgv` (src/seat.ts) appends `--disallowedTools=AskUserQuestion` for kind `claude`, as it appends `--session-id` for pi. The equals form is required so the appended task is not taken as a tool. It reaches leaf seats and door-created consultants, not operator-started sessions. Reason: removal that a repo test covers, the same on every machine, and no outside edit (signposts 1a, 2a; C R1). This changes A's own blind pick. B's dissent (one recipe owner) stands. Needs row N2 is cut as unneeded. The interactive effect needs one paid probe under N1 before handoff.
2. Q2: the controller sends an attention notice at once when a leaf seat's hc status is `blocked`. The title is "Blocked leaf: <repo>/<slug> seat <S> (<kind>)" and the body is the screen tail from `screen()`, since msg is not delivered. A new per-slot field `blocked_notified` (same shape as `busy_notified`) gates one notice per blocked episode, and is cleared with its pending notice removed when the seat leaves blocked. The 60-min busy notice is skipped while blocked. No keys are pressed. Reason: kind names no action or authority, and no real runtime permission screen was observed (signpost 3a, C L7; B R1, R2). C's agy-release dissent stands. The startup `agyTask` handshake is unchanged.
3. Q3: chart doors are out of reach. An operator-started door's harness prompts are the operator's own. Approval rows stay operator-only and are already carried by readiness `inputs` and `akrogon status`. #135's asked-for routine confirmation is not delivered by design (signposts 1a, 3a). So #135 stays open as a partial match with that uncovered part, and is not put in any leaf's `sources`. B's view that this drops handed work is recorded as standing dissent.

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it adds clearing points to the picked field and no new mechanism:

- Q2 corrected (B F2, C D1): `blocked_notified[slot]` is cleared, and its pending notice removed, at three points: a pass that sees the live seat not blocked, the replacement start of that slot's seat in `dispatchSlot`, and every phase move beside `clearBusyNotices` (src/phase.ts). Stated limit (C D1): a seat unblocked by hand and blocked again inside the same turn gets no second notice, because a blocked-to-working change wakes no pass; the field clears at the next turn end.

Free proof of Q1 (A, 2026-11-16T10:55Z, Claude Code 2.1.325, hc 0.1.21, cost 0): two throwaway hc terminals ran interactive `env ANTHROPIC_BASE_URL=http://127.0.0.1:<port> ANTHROPIC_AUTH_TOKEN=probe-token claude --model haiku --effort low --dangerously-skip-permissions [--disallowedTools=AskUserQuestion] "say hi"` from the akrogon root against a local stub (scratchpad probe/fake_api.py) that recorded each POST /v1/messages tool list and answered 401. Result: without the flag every request carried 14 tools including AskUserQuestion; with the flag every request carried 13 and no AskUserQuestion; both sent requests, so the trailing "say hi" was taken as the task, not swallowed as a tool name. Cleanup: both terminals killed and removed, absence confirmed with `hc ls --all`; both stub servers stopped, `pgrep` empty. Limits: proves the interactive tool list the model receives; does not prove the operator's claude.ai login path or a later Claude Code version; the `--model`/`--effort` values are the probe's, not a seat's. This replaces the paid probe planned under N1.

- This leaf owns blocked-prompts Q2 only. Q1 is owned by claude-seat-no-questions. Q3 is a stated limit with no owner.
- Excluded here: turn-count (count-silent-turns), failed-refusal (refuse-failed-runs), door-address (door-reads-live-address).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: controller behavior, proven by the smallest test at the existing boundary. A stand-in seat that prints `state=blocked:kind=<kind>` through OSC 7501, as tests/door-exchange.test.ts already does, is fixture work. hc's blocked status shape (`{kind, state: blocked}`, no msg) was observed free at charting (readiness.yaml). No model call, no paid call, no grant.

## Leaf architecture

- Owned surfaces: src/next.ts (`observeBusy`, the replacement branch of `dispatchSlot`), src/state.ts (`blocked_notified` field), src/phase.ts (`commitMove` clearing), and their tests (tests/next.test.ts, tests/notices.test.ts if needed).
- Literal interfaces:
  - State: `blocked_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({})`, the same shape and values (`pending`, `shown`) as `busy_notified`.
  - Notice id: `noticeId(repo.name, 'blocked', slug, slot)`, `attention: true`.
  - Body: the last 40 lines of `screen(session, address)`.
- `observeBusy`: a `blocked` status takes its own branch before the busy clock. When `blocked_notified[seat]` is undefined it writes the notice and records `pending`. When it is `pending` and `noticeState` reports it consumed, it records `shown`, as the busy branch does. It sets no busy clock. A non-blocked status clears `blocked_notified[seat]` and removes a pending blocked notice, beside the existing busy clearing.
- Replacement: `dispatchSlot`'s finished-or-missing branch clears `blocked_notified[slot]` and removes its pending notice before `startSeat`. `startSeat` does not pass through `observeBusy`.
- Phase moves: `commitMove` clears `blocked_notified` and removes pending blocked notices on every move. Today `clearBusyNotices` runs only on merged, failed and leaving failed, so the blocked clearing is its own step in `commitMove`, not a change to when busy notices clear.
- Consumers: `akrogon status` and the watch skill read notices by id and title only. The listener already wakes `next --wake` on blocked events (src/listen.ts), so no new wake is needed.
- Stated limits, binding: a seat unblocked by hand and blocked again inside the same turn gets no second notice, because a blocked-to-working change wakes no pass. The field clears at the next turn end. Chart doors are not leaf seats and are not covered.
- Open for the plan: whether `count-silent-turns`' `seat_lost` row and this leaf's replacement clearing land in the same branch order. The two leaves are parallel, and the second to merge rebases onto the first.
