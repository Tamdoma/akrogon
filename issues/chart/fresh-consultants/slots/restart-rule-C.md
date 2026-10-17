# Restart rule notes, slot C

## Q1. Restart boundary

**Pick.** Restart consultants at each chart activation: before its opening map, and again before work resumes after the door left that chart. Keep the same sessions for all exchanges while the door stays on that chart. This removes prior-chart context without throwing away useful same-chart context; the cost is pane startup time on every chart switch.

**Rejected.** Once per door open leaves later charts carrying earlier charts, which is the reported defect. Before every exchange adds maximum churn and repeatedly discards context that the next fork, rebuttal or contract review still needs.

**Evidence.** Operator tier, `fresh-consultants/INTAKE.md`, 2026-10-17: the waste came from three charts sharing consultant sessions, and the requested new case is fresh consultants for the #99/#100 charts. Repository tier, `skills/chart-issues/SKILL.md:43-47`, read 2026-10-17: Drain can leave one chart and work another, then resume it, so “chart start” must include re-entry after other-chart work.

**Pitfalls.** Restart only after every open exchange has finished, so closing a pane cannot kill an answer. Preserve a chart's state in its files and next brief, rather than relying on consultant memory. A consultant already dropped for the autopilot session stays dropped and is not recreated (`SKILL.md:139`).

**Question not asked.** Define “left the chart” mechanically: a restart is needed only if another chart used the consultants, not when A briefly performs local work while the same chart remains current.

## Q2. Restart mechanism and pane authority

**Pick.** Use the tested `pane close` → existing split sequence → `agent start` with the saved kind and native args. Apply it to door-created panes and to a supplied pane only when the operator explicitly authorizes replacing that exact named consultant pane; the current “restart both panes” words provide that authority for B and C. Never infer authority for another supplied or unrelated pane. The cost is tracking pane ownership or explicit replacement authority and replacing pane IDs after every restart.

**Rejected.** Ending an agent in place has no dedicated command in the inspected Herdr CLI, depends on harness-specific terminal input, and was not the operator's chosen mechanism. Restricting restarts unconditionally to door-created panes preserves the old lock but cannot make explicitly supplied B/C fresh in this pass. Closing every named pane without scoped authority can destroy a terminal the door does not own.

**Evidence.** Operator tier, `fresh-consultants/forks/restart-rule.md` Carries, 2026-10-17: close, split and start was chosen over `/clear` plus warm-up messages. Repository tier, `chart-peer-panes/forks/peer-panes.md` Taken Q3-A: the door never arranges supplied or unrelated panes. Installed-tool tier, `herdr pane close --help`, `herdr pane split --help`, and `herdr agent start --help`, run 2026-10-17: close targets a pane ID, split returns a replacement pane, and start requires an available shell pane plus name, kind and optional native args.

**Pitfalls.** Save kind, lowercase unique name and native args before close; recreate B from A and later peers from the preceding new peer; replace every stored pane ID and seat entry from command results rather than predicting IDs. Close peers in reverse order so a later peer is not stranded when its split parent disappears. The explicit-authority rule preserves the existing non-interference lock for all other panes.

**Question not asked.** Decide whether explicit supplied-pane replacement authority lasts for the whole door session or one restart. Prefer the whole named door session, because per-chart confirmation would defeat autopilot and reintroduce repeated operator messages.

## Q3. Failure and first Codex exchange

**Pick.** In attended mode, any close/split/start failure ends the door turn with the exact failed command and surviving pane state for the operator. In autopilot, treat a failed restart as loss of that affected consultant for the rest of the session and continue with remaining seats; never use its stale pre-restart process and never revive it at the next chart. Do not require a proven turn-end signal for the first Codex exchange: a non-empty return file still ends it as `done`; without one, the existing null-session/null-boundary case waits to `budget` as unproven.

**Rejected.** Automatic repeated restart attempts can destroy more layout and exceed the existing autopilot drop rule. Silently continuing with a stale consultant defeats the feature. Requiring a proven first Codex end would need a warm-up or new late-binding protocol, reopening the settled peer-wait contract solely to optimize a missing-return failure.

**Evidence.** Repository tier, `scripts/peer-ask.ts:46-75`, read 2026-10-17: identity and Codex boundary are captured before prompt, and a fresh Codex start can supply neither. `scripts/peer-wait.ts:143-155,187-225,291-325` adopts a session that appears later, treats missing boundary as unproven, accepts a non-empty return immediately, and otherwise reaches budget. Settled repository decision, `peer-wait-harness/forks/turn-end-signal.md` Taken items 1-5: no Codex session/boundary remains unproven, and the exchange identity carries across reruns. Operator test in `INTAKE.md`: fresh Codex with `session: null` completed successfully when it wrote the return.

**Pitfalls.** Run restarts serially and record each returned pane before the next step, so partial failure has an inspectable state. Do not roll back by restarting a closed old pane ID because Herdr IDs are not reused. Report which consultants remain. Tests should cover close, split and start failure separately, the no-revival autopilot rule, changed pane/seat IDs, and first-Codex success plus missing-return budget.

**Question not asked.** If B recreation fails, may C still be recreated from A? Prefer yes when a valid layout can be made without touching unrelated panes; consultant loss is per seat, not automatically all peers.
