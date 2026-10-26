# Blind territory map B: door-cost

Read independently on 2026-10-26. No other seat's map or current merged file read. Scope is O1b, O8 and O4, lifecycle route, skill edits delivered by a leaf. No caps or removed exchanges.

## Evidence

- E1 · operator · `INTAKE.md`, Scope and operator messages, 2026-10-26. The three changes are approved. Its Agent findings report $387 across 55 charts, 120–150k A context against a fresh 61k, and a 10–25% expected saving. These are supplied study results, not measurements I reproduced.
- E2 · better-than-training · `skills/chart-issues/SKILL.md`, Open, Drain, Take, Handoff, Autopilot and Printed footer, inspected 2026-10-26. Drain already selects the next chart. Take requires fresh research when answers reshape questions. Only Autopilot describes A handover. Open already specifies consultant restarts and seat/span accounting.
- E3 · better-than-training · `skills/chart-issues/scripts/door-reset.ts`, `main`, `child`, `waitTurnEnd`, `waitNewSession`, inspected 2026-10-26. The helper accepts pane/session/log/start prompt without a mode parameter. It detaches, waits for proven turn completion, checks session identity, resets in place, confirms a different session, then sends the start prompt. Codex needs a check prompt. Supported kinds are claude, codex and pi.
- E4 · better-than-training · `tests/door-reset.test.ts`, inspected 2026-10-26, not executed. Existing cases cover wrong identity, open turns, unconfirmed resets, stalled prompts and all three supported kinds. The documentation case checks literal autopilot wording and does not establish attended continuation behavior.
- E5 · better-than-training · `skills/chart-issues/assets/shapes.md`, Chart records, Mode record and Autopilot, inspected 2026-10-26. Handover entries currently encode an autopilot handed list, and continuation says `continue autopilot`. Session identifiers must come from live `agent_session.value`.
- E6 · better-than-training · `skills/chart-issues/assets/questions.md`, Research and Blind peer exchange, inspected 2026-10-26. Created-peer questions duplicate Open. Blind notes, attributed merge, one rebuttal, changed-contract checks, immutable briefs and unique exchange returns already have separate rules.
- E7 · better-than-training · `skills/chart-issues/scripts/peer-create.ts` and test names in `tests/peer-create.test.ts`, inspected 2026-10-26. Creation consumes explicit seat/kind/argv; it does not choose defaults. Existing tests already launch C as pi with explicit arguments.
- E8 · operator · historical `issues/chart/door-handover/forks/handover.md`, Taken, 2026-10-17, inspected 2026-10-26. The operator replaced process relaunch with in-place reset and selected claude/codex/pi support. Historical `issues/chart/chart-cost/forks/cut-boundary.md`, Taken, 2026-10-06, kept model choice as operator practice. The current intake supplies the newer, narrow C harness default.

## Q1 · O1b: Exactly when does attended A hand over?

**Pick D1:** Use the existing Drain selection. Once another runnable chart is selected, finish outgoing records, collect every outstanding consultant return, close its span and queue the existing reset as old A's last action. Fresh A enters the selected chart directly. Apply on switches and re-entry after another chart, in both modes. Initial entry, compaction, a question within the same chart and session completion cause no reset. Cost: reset latency plus reloading the selected chart, exchanged for dropping earlier charts' context. Evidence: E1–E4, E8.

**Rejected:** Reset every round or at every entry, because it discards useful same-chart work and can reset immediately after handover. Reset at pass/session end, because it has no next chart to benefit. Relaunch or a new reset mechanism, because E3 already supplies the required isolation and proof.

**Pitfalls and removal:** A handover loop disappears when fresh entry itself is explicitly exempt. A reset during outstanding peer work is prevented by the existing collection requirement, not by idle status. A chart waiting for the operator resets only if Drain actually selects a different runnable chart. With no runnable next chart, print the ordinary ending footer.

**Practitioner question not asked:** What happens outside herdr or with an unsupported A kind? Keep the existing documented support limit and state that those sessions retain current behavior. Do not silently promise universal fresh-A support or expand harness support in this leaf.

## Q2 · O1b: What must survive without granting autopilot?

**Pick D2:** Generalize the existing handover record and start-prompt contract in the existing chart files. Name the outgoing mode explicitly, next chart, pane, time, log and surviving consultants. Preserve applicable operator choices and authorization by references to their durable records. Attended continuation stays attended and uses Drain's normal selection rules. Autopilot continuation retains its handed list and dropped-seat state. Fresh A verifies the matching handover before continuation. Cost: small coordinated edits to instructions and shapes, plus recovery reads. Evidence: E2, E3, E5.

**Rejected:** Use `continue autopilot` for attended handovers, because that grants A the operator's answers. Infer permission from an old mode-on entry, because the current matching-handover exception is narrower. Add a separate session-state file, because chart records already own this information. Copy the whole transcript into the new prompt, because that restores the cost being removed.

**Pitfalls and removal:** Losing supplied panes or reviving dropped consultants is removed by recording the actual active set and existing loss provenance. Old A does not fabricate fresh A's session. Existing charts retain opened time and append the live A session. Newly created destination charts keep the existing deferred seats/span rule. Failed reset confirmation sends no start prompt under E3. Extend the queued-handover footer to attended mode without claiming the reset already succeeded.

**Practitioner questions not asked:** Can fresh A recover an earlier approval's exact scope from durable files? Does a resumed chart still point at the current fork rather than require historical replay? Put missing continuation facts in existing records before reset. Do not reconstruct approvals from a summary that merely says approved.

## Q3 · O8: Where does C's pi default belong?

**Pick D3:** At the door's creation decision, default an unspecified, door-created C to kind `pi`, with no extra arguments unless supplied. Explicit operator kind/arguments win. Continue asking for unspecified B and other created seats as today. Supplied panes retain their actual harness. Keep `peer-create.ts` receiving a fully resolved explicit spec. Update both Open and Blind peer exchange. Cost: a smaller opening question, with pi's configured model and startup cost still external to this rule. Evidence: E1, E6–E8.

**Rejected:** Add a second default inside the launcher, because callers already resolve the launch spec. Change existing C panes or restart C into pi, because O8 is a default rather than an override. Default every consultant to pi or pin a particular model, because neither is authorized.

**Pitfalls and removal:** Divergent opening instructions are removed by editing both current copies together. A custom C kind is preserved by passing the explicit choice through unchanged. A later consultant restart preserves its live launch kind and arguments rather than applying the creation default again.

**Practitioner question not asked:** If pi cannot start, should the door substitute another harness? No. Report the existing creation failure and states. O8 supplies no fallback permission. No claim that pi itself is cheaper is supported by this map.

## Q4 · O4: What can one final-shape check batch?

**Pick D4:** Collect compatible corrections from one round into one immutable proposed final shape and correction set, then send that same complete proposal to every active named consultant for one focused check before recording it. Update Take and Blind peer exchange consistently. Cost: one complete check per consultant instead of separate checks per correction, with the actual saving dependent on how many corrections occur. Evidence: E1, E2, E6.

**Rejected:** Merge corrections from unrelated rounds or charts, because that crosses decision boundaries. Treat agreement in blind notes or rebuttal as final-shape approval, because those inspect different material. Skip checking a late mechanism change because one check already happened, because the previous return cannot cover unseen changes.

**Pitfalls and removal:** An answer that reshapes the question still triggers independent research, merge and rebuttal. O4 batches compatible final corrections, not that research. A later substantive correction reopens the changed-contract trigger. Restatements remain exempt. A final-check disagreement is resolved before recording the affected contract. Leaf implementer review stays a separate handoff exchange. Unique return paths and immutable briefs already prevent mixing results from different proposals.

**Practitioner questions not asked:** Are corrections compatible, or do they alter an earlier choice's premise? Can every reviewer see their combined effects? A names those dependencies in the proposal. Conflicting corrections require resolution, not mechanical concatenation. Do not wait for hypothetical future corrections before sending a complete round's proposal.

## Delivery and evidence limits

- A1 · One lifecycle leaf is sufficient: the outcome is one coherent skill behavior across shared instructions and shapes. The launcher/reset sources need changes only if implementation exposes a missing mechanism. The inspected helpers already accept the required inputs.
- A2 · Verify attended A→B switching and re-entry, autopilot continuity, no reset within a chart or at session end, explicit C overrides and supplied panes, and batched corrections with every existing review trigger preserved. Reuse existing reset failure tests. A helper happy path alone does not prove mode preservation.
- A3 · Use existing seats, spans and usage records to assess results. Fresh startup and reset costs count. The supplied 10–25% estimate is not an acceptance threshold or measured outcome. Neither 50% savings nor a specific dollar saving follows from the inspected sources. No new benchmark subsystem, prose quota or removed step is needed.
