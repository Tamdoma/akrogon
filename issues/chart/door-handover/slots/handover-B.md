# Slot B blind fork notes: handover

Read on 2026-10-17. Picks: Q1 next runnable chart only, Q2b, Q3b, Q4b, Q5a. These are B's recommendations, not operator answers. No live mutation or probe was performed.

## Q1. When does A hand itself over?

**Pick, reason and cost:** Only when switching to the next runnable chart in the handed list. Complete the outgoing chart's records, collect every consultant return and close its span first. This matches the requested chart boundary and gives the new A a clear first action. Cost: one large chart retains one session, and a single-chart pass does not restart.

**Rejected options:** Mid-chart adds transfers while decisions and exchanges may still be open. Every chart entry can immediately restart the replacement again. Every pass end restarts even when the door has no runnable work and needs operator input. None removes additional work required by this intake.

**Evidence:** `operator`, `issues/chart/door-handover/INTAKE.md:12`, read 2026-10-17: minimal change and unattended continuation are explicit. `better-than-training`, `skills/chart-issues/SKILL.md:39`, `:49`, `:143`, read 2026-10-17: spans close before switching, autopilot drains only its handed list, and a waiting pass stays on until the operator supplies what it needs. These establish the boundary and stop conditions.

**Pitfalls and removal:** The replacement enters the selected next chart directly, without another A restart on entry. It performs the normal consultant restart once, using the surviving seats. Keep waiting charts in the handed list, but do not restart solely to recheck their waits. Preserve `opened` and record the new session only when observed. Existing consultant-entry behavior is at `skills/chart-issues/SKILL.md:29`.

**Missing question:** How is “next runnable chart” recorded when a handed item has not yet received its chart folder? The transfer must carry that item too, without importing unrelated intake.

## Q2. What marks the moment old A gives up its process?

**Pick, reason and cost:** Q2b. Invoking the helper is old A's final action. Save all records and print the intended transition before invoking it. The helper validates the target and launch before stopping A, detaches from A's process group, rechecks the expected identity, then performs the replacement. This removes dependence on whether a terminal looks idle. Cost: no normal final assistant reply after invocation is guaranteed.

**Rejected option:** Q2a adds an idle wait without proving that the final reply finished. If all work is already saved, that wait adds no necessary boundary. If work remains, it is unsafe to use idle as proof that the work finished. A requirement for a normal final reply would need actual turn-end evidence and would be a different option.

**Evidence:** `operator`, `issues/chart/door-handover/INTAKE.md:31`, read 2026-10-17: self-detached same-pane Claude replacement worked in the probe. `better-than-training`, `skills/chart-issues/scripts/peer-wait.ts:157`, read 2026-10-17: Claude can appear idle during silent thinking. The current in-place stop/start path is `skills/chart-issues/scripts/peer-restart.ts:182`; it supports reuse of the mechanics, not proof that a self-detached handover already works.

**Pitfalls and removal:** Bound exit/readiness/start waits. Stop if target identity changed. Do not claim “handed over” before replacement is observed. If launch fails, record the failed operation and actual occupant. A timeout can leave a replacement running, so never infer an empty shell or retry blindly. Prove the final installed Bun invocation under the actual auto-mode permissions, since the earlier probe used a shell helper (`issues/chart/door-handover/INTAKE.md:35`).

**Missing question:** Where is failure visible if A is already dead and no replacement successfully starts? Require a durable, named log available from the surviving pane.

## Q3. How does fresh A know it may continue?

**Pick, reason and cost:** Q3b as written. One small transfer record identifies the original pane/session, operator authorization, exact handed list, next item, surviving consultant panes and pass-wide losses. It links existing chart decisions instead of copying them. The replacement claims the transfer once and records its observed session. Later operator mode changes override it. Cost: one artifact and a small validation/claim step.

**Rejected option:** Q3a's timestamp lines identify a transition but do not specify how the replacement reconstructs the full list, its order, uncreated chart items or consultant losses recorded on charts already handed off. Writing independent lines to every open chart also admits a partially written transfer. Q3a could work if those state and one-use guarantees are explicitly supplied. The filename or format is not the deciding issue.

**Evidence:** `better-than-training`, `skills/chart-issues/SKILL.md:139`, `:141`, `:143`, and `skills/chart-issues/assets/shapes.md:41`, `:44`, `:72`, read 2026-10-17: the handed list cannot grow, losses persist, unrelated new sessions start attended, and current records are per chart. These requirements favor a complete transfer over reconstruction from matching timestamps alone.

**Pitfalls and removal:** Bind the transfer to the intended pane and originating session. Claim it before continuing work. A repeated or stale transfer must not authorize another launch or continuation. A later “off” or changed-list record supersedes it. Keep the normal attended rule for an unrelated fresh session. Persist the complete record before arming the helper so a partial write cannot stop A.

**Missing question:** What proves the replacement is the intended recipient rather than another session reading the same file? Define the recipient check and one-use claim explicitly. Also distinguish the helper's one launch from the new A's one continuation, since guarding only continuation does not prevent duplicate launches.

## Q4. What command line starts fresh A?

**Pick, reason and cost:** Q4b, limited to the supported harness from Q5. Preserve its launch settings while removing parsed history-restoration arguments and their values, replacing the original task prompt with the absolute skill and transfer instruction. Fresh context should not silently change the requested model or permission behavior. Cost: correct argument handling for the supported launch forms, plus proof that the resulting launch is fresh.

**Rejected option:** Q4a silently discards explicit flags. Settings files applying afterward does not establish that they reproduce the old launch. A plain launch is acceptable only when it is the intended launch, not as a fallback for parsing difficulty. Also reject copying argv verbatim or removing flag names without their associated values.

**Evidence:** `better-than-training`, `skills/chart-issues/scripts/peer-restart.ts:48`, `:163`, `:217`, and `tests/peer-restart.test.ts:160`, `:237`, read 2026-10-17: the current mechanism preserves argument boundaries and rejects history forms rather than transforming them. Therefore it supplies useful mechanics but no ready-made history-removal parser. `operator`, `issues/chart/door-handover/INTAKE.md:59`, read 2026-10-17: slash-command startup remains unproven, so use explicit absolute instructions.

**Pitfalls and removal:** Inspect the supported harness's actual argument syntax before implementing removal. Prove both a resumed launch becoming fresh and a flagged launch retaining its settings. Do not replay the original task. Reject an unsupported or ambiguous launch before killing A rather than silently dropping settings. A current resumed A needs a deliberate transformation, not the consultant helper's blanket history refusal.

**Missing question:** Does preserving command-line flags preserve every setting required for this actual door, including any changed inside its session? Name the settings the proof must observe rather than claiming full equivalence from argv alone.

## Q5. Which harnesses get handover?

**Pick, reason and cost:** Q5a for this delivery, as an explicit scope choice. Add same-pane self-handover for Claude and leave other kinds on their existing same-session path. This targets the demonstrated problem with the smallest proof and implementation surface. Cost: other A harnesses retain their current context growth. State that limitation in the skill and guide rather than claiming universal support.

**Rejected option:** Q5b expands this into support and live proofs for every kind. Consultant restart evidence does not establish each kind's self-detachment, startup prompt, permissions or unattended continuation. The requested minimal change does not justify assuming those properties or building a general harness framework now.

**Evidence:** `operator`, `issues/chart/door-handover/INTAKE.md:12`, `:31`, `:59`, read 2026-10-17: minimal change is explicit, the self-run proof is Claude, and other A harnesses were not inspected. `better-than-training`, `skills/chart-issues/SKILL.md:29`, and `tests/peer-restart.test.ts:163`, read 2026-10-17: existing multi-kind consultant replacement is a different operation. This is my recommendation on the now-explicit scope fork, not a claim that Claude-only scope was previously agreed.

**Pitfalls and removal:** Choose the path from the actual harness kind before any mutation. Non-Claude A continues exactly as today, with no attempted handover and no newly inherited authorization. For Claude, the live proof must observe old A gone, a different session in the same pane, unchanged layout, preserved launch settings and the next handed chart starting without operator input. A startup success alone does not prove continuation.

**Missing question:** Does the scope decision explicitly accept that non-Claude A keeps its present behavior? Record the answer and limitation together so later users do not infer the new guarantee applies to every harness.
