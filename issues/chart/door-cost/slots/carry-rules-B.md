# Blind fork notes B: carry-rules

2026-10-26. No other seat's carry-rules notes or merged file read. Evidence below distinguishes inspected mechanisms from proposed behavior. No tests or live resets were run for these notes.

## Q1 · Require a matching handover record

**Pick, reason and cost:** Require the start prompt to match old A's handover entry in the next chart's Mode record, including outgoing mode, pane, time and next chart. With no match, fresh A starts attended without entering a chart from that prompt. Attended continuity preserves operator decision ownership. Autopilot retains its existing matching continuation exception. Cost: one existing-record write and a bounded recovery read.

**Rejected options:** Prompt alone cannot establish that its chart selection and permissions remain current. Inferring continuation from an old mode-on entry bypasses the existing matching-handover condition. A second state file duplicates the chart's existing ownership of continuation facts.

**Evidence:** better-than-training, `skills/chart-issues/SKILL.md`, Autopilot, and `assets/shapes.md`, Mode record, inspected 2026-10-26. They already require prompt/record matching for autopilot and live session identifiers. `door-reset.ts`, `child`, inspected 2026-10-26, confirms a fresh session but does not validate chart selection or mode.

**Pitfalls and removal:** A matching record is a continuation condition, not proof that every later operation is authorized. Recover scoped grants from their records. Preserve existing destination and collision checks. Record fresh A's actual session and entry span before chart work, while preserving an existing chart's original opened time.

**Question not asked:** Can the latest handover be reused after continuation? Record the continuation with its fresh session so a superseded handover is not treated as the latest pending instruction.

## Q2 · Persist missing instructions, reference existing records

**Pick, reason and cost:** Before queueing reset, write conversation-only instructions verbatim into the next chart's existing records with their provenance and scope. Keep references to already durable choices and approvals rather than copying them. The prompt points to these records. Include the session's work restriction, actual surviving consultant identities and relevant approval scope. Cost: writing only facts that would otherwise disappear, then reading them on continuation.

**Rejected options:** Verbatim prompt only leaves recovery dependent on a single delivery and makes the prompt carry more history. Existing references only cannot recover instructions that were never saved. Paraphrased approval summaries can broaden or lose an approval's limits. Copying every earlier discussion restores avoidable context and creates competing records.

**Evidence:** operator, fork Q2 explicitly identifies instructions that exist only in old A's conversation, 2026-10-26. Better-than-training, SKILL.md Take (scoped grants and approval provenance), Open (consultants and sessions), and shapes.md Mode record, inspected 2026-10-26. These provide existing records to extend or reference without inventing a parallel store.

**Pitfalls and removal:** Preserve whether an instruction applies to this chart, a handed list or the door session. A later instruction replaces only what it actually changes. Consultant choices do not revive an autopilot-dropped consultant. Fresh A reads the referenced current choices and grants before acting. Store credential references, not credential values.

**Question not asked:** If the operator changes instructions after persistence but before reset, what invalidates that saved continuation? Q3 must prevent an observed superseding input from launching the stale prompt.

## Q3 · Change the script to bind and cancel superseded handovers

**Pick, reason and cost:** Change the helper. Capture the queuing turn's identity or input boundary in the parent before detaching. Wait for that bound turn, and cancel with a logged reason if a later operator input or turn appears before reset. Inspect the appended history, so a later turn that starts and finishes between polls still cancels the handover. Retain the existing session recheck and reset-confirmation requirements. Cost: harness-specific boundary parsing and focused regression cases, rather than treating any later idle moment as permission to reset.

**Rejected options:** Accept-and-document retains a stale action that can discard newly supplied instructions. Shortening 600 seconds changes the likelihood, not the failure. Rechecking only the session or status misses a completed later turn in the same session. Waiting for the latest turn to finish repeats the bug.

**Evidence:** better-than-training, `door-reset.ts`, `main`, `waitTurnEnd`, `codexTurnOpen` and `child`, inspected 2026-10-26. No queuing-turn boundary is passed to the child; Codex checks the latest started turn. `peer-wait.ts`, `codexEnded`, inspected 2026-10-26, already demonstrates a byte boundary plus bound turn ID for a different exchange. `claudeTurnOpen` reads user/turn-duration records. `tests/fixtures/chart-usage/pi/pi-A.jsonl`, inspected 2026-10-26, contains identified user-message records. That fixture is evidence of record shape, not proof of a live Pi cancellation mechanism.

**Pitfalls and removal:** Bind in the parent, not after the child starts. Prove cancellation when another same-session turn completes between polls, plus normal queuing-turn completion, for each supported harness. Do not claim that polling makes input detection and reset atomic: input can still race the final check and send. A guarantee covering that last interval requires a conditional operation or serialization in the harness; none is established by the inspected helper. The chart must state this remaining limit rather than call the whole race eliminated.

**Question not asked:** Does each harness expose new input promptly enough for the proposed boundary check, including steering within a turn? Establish this before making the leaf promise more than the sources prove.

## Q4 · Reset at every actual chart switch

**Pick, reason and cost:** Every switch to a named next chart, including re-entry. No short-chart or revisited-chart floor. Cost: fresh startup and recovery on each switch, which may outweigh savings on short charts.

**Rejected options:** A duration floor adds an unapproved threshold. Skipping revisited charts retains history from the intervening chart. Resetting at first entry, within a chart or without a next chart violates the trigger's boundary.

**Evidence:** operator, carry-rules Carries and opening brief's O1b lock, 2026-10-26, specify chart switches only and fresh A at each switch. Better-than-training, SKILL.md Drain and Autopilot, inspected 2026-10-26, provide selection and existing handover mechanics.

**Pitfalls and removal:** Fresh entry must not trigger another handover. Collect consultant returns and close the outgoing span before switching. Use existing accounting to observe startup costs without quietly weakening the approved trigger.

**Question not asked:** Would the operator reconsider the rule after measured regression? That would be a later scope decision, not a floor invented in this leaf.

## Q5 · Resolve substantive conflicts through the decision owner

**Pick, reason and cost:** Return a substantive conflict to the operator before the final-shape check. Under autopilot, A makes and records the explicit pick under its existing authority. A may reconcile wording directly when it preserves both corrections' meaning. Cost: an extra decision when the corrections cannot both hold, followed by one check of the resolved proposal.

**Rejected options:** A silently choosing between conflicting attended instructions changes the operator's decision. Passing an unresolved conflict to consultants asks reviewers to supply an answer they do not own. Separate checks of contradictory alternatives do not establish one final contract.

**Evidence:** better-than-training, SKILL.md Take and Autopilot, and questions.md Research and Blind peer exchange, inspected 2026-10-26. Research/checks do not supply an operator answer; autopilot is the explicit exception. Operator, fork Carries, 2026-10-26, preserves research triggers and every final check.

**Pitfalls and removal:** Show the incompatible requirements and the choice needed, rather than reopening settled compatible corrections. A reshaped question triggers blind research, merge and rebuttal before the decision. Once resolved, send the combined marked shape to every active named consultant. Later changes adding a mechanism or changing the contract trigger another focused check.

**Question not asked:** Can an explicit operator priority already resolve the apparent conflict? Apply a recorded priority when it clearly decides the case. Ask only when the substantive choice remains open.
