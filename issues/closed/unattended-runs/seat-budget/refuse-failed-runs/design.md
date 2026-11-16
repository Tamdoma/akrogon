# Design: refuse-failed-runs

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

### Failed refusal, A's picks under full autopilot, 2026-11-16, rebutted by B and C, final-shape check by B and C (issues/chart/unattended-runs/forks/failed-refusal.md)

A's picks under full autopilot (2026-11-16T10:20Z, door t126), not operator words.

1. Q1: refuse every new leaf- and worker-scoped run (the caller carries a phase) while the leaf phase is `failed`. Holder and checkout runs are untouched. No other phase. Reason: the observed state, no cost signal in code (signpost 5a).
2. Q2: read the phase before admission and again with a fresh `readState` right before spawn, beside the fenced `ownerRefusal`. That last read is the acceptance point, and a failure committed after it does not cancel the run (B R3, stated in the contract). Each refusal appends one timing row `check_refused` (slug, run, name, scope, phase, optional unit and attempt) and throws `PublishRefusedError` with: "Refusing run-check <name> for leaf <repo>/<slug>: the leaf is failed (<failure reason>). Stop work on this leaf; the operator recovers it with akrogon phase <slug> <failure.phase>." Reason: the seat reads stderr at the point of use, and the timing row is the record reports read (C R1). The "run the plain command" clause is dropped per B R1, since recovery is operator-only. B's dissent on the record form stands.
3. Q3: runs accepted before the move finish and publish. A nested run-check after the move is refused as a fresh launch (A,B,C).
4. Q4: no carve-out. Every verify stage is a fresh launch and is refused the same way, and a refusal never writes a complete receipt (A,B,C).

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it is a restatement for a valid state and adds no mechanism:

- Q2 corrected (B F1): `failure` is optional when phase is `failed` (src/state.ts). Then the refusal still fires, the text says "(failure record unavailable)" in place of the reason, and the recovery clause names no phase: "the operator recovers it with akrogon phase <slug> <phase>" only when `failure.phase` exists, else "the operator recovers it with akrogon phase".

- Excluded here: turn-count (owned by count-silent-turns), blocked-prompts (owned by claude-seat-no-questions and blocked-seat-notice), door-address (owned by door-reads-live-address).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: each criterion is CLI behavior, proven by the smallest test at the real boundary. That is the existing run-check and verify tests, driving the real command with a fake child (for example a command that touches a marker file, so "no child started" is observable). The admission wait in criterion 2 uses the existing admission queue with a holding run, which is fixture work, not machinery. No model call, no paid call, no grant.

## Leaf architecture

- Owned surfaces: src/run-check.ts (`checkedRun`), src/timing.ts (`check_refused` kind), and their tests (tests/run-check.test.ts, tests/verify.test.ts). src/verify.ts only if the plan finds a verify path that bypasses `checkedRun`.
- Literal interfaces:
  - Timing: `z.strictObject({ ...slugged, kind: z.literal('check_refused'), ...checkCore })` (run, optional phase, name, scope, optional unit and attempt).
  - Error: the existing `PublishRefusedError` with the text in the brief.
- Early read: at the start of `checkedRun`, beside the early `ownerRefusal`, for every target that carries a phase (`leafFields` sets it for leaf and worker scope, the checkout target has none), a fresh `readState(dirname(target))` decides. `target` is `<leaf>/implementation`, and the caller's phase may be a stale snapshot (`leafTarget`, `passCaller` in src/verify-pass.ts), so the decision never uses the captured phase. The exemption follows the resolved caller: `--holder` from inside a leaf worktree or worker still resolves to a leaf-backed target and is refused.
- Late read: inside the `withAdmission` callback, beside the fenced late `ownerRefusal(target, repo, true)`, a fresh `readState(dirname(target))` for leaf-backed targets. When its phase is `failed`, the run is refused before spawn. This last read is the acceptance point. A failure committed after it does not cancel the run (stated limit). Consumers: `refusePublish`, `refusal.json` and reconcile's scratch hold, which keep their current behavior for owner refusals. A phase refusal writes no `refusal.json`.
- Timing seam: `readTimings` in src/timing.ts parses every line strictly inside one try and returns an empty list on any failure, so an older akrogon release reading a timings file with a `check_refused` row drops all timings for that repo. The leaf report states this seam.
- Verify reuse and join: `verify` in src/verify.ts returns through `greenRun` reuse or joins a live pass through `livePass`/`waitPass` without `checkedRun`. Neither starts a child, so neither is refused (stated limit). src/verify.ts is not owned.
- Lesson: learnings/history/2026-11-15-background-wait-fails-leaf.md. This leaf stops the paid relaunch half only. It keeps the line and writes no `Applied` entry, since the background wait itself is count-silent-turns' and is not stopped on every path.
