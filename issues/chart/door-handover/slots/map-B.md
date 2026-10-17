# Slot B independent territory map

Read on 2026-10-17. This is an independent map, not an implementation or an operator decision. No other seat's map was read.

Recommendation: a small self-detaching helper replaces A inside its existing pane after A has saved a complete chart boundary. A one-use handover record carries the existing autopilot authorization and remaining work into the replacement. Ordinary new sessions still start attended. Leave consultant restart behavior unchanged.

## Evidence and limits

- **F1. The missing authorization transition is explicit.** A new session currently starts attended until the operator says “continue autopilot.” The same rule preserves lost consultants across continuation. Merely restarting A therefore cannot satisfy the intake. `skills/chart-issues/SKILL.md:143`, `issues/chart/door-handover/INTAKE.md:4`.
- **F2. Same-pane replacement has a useful but narrow proof.** The self-run log shows the old process group terminated, Bash returned, and a different Claude session started successfully. The intake reports that its prompt ran and layout stayed unchanged. This establishes feasibility for the probed Claude launch, not every harness or the eventual installed helper. `issues/chart/door-handover/slots/probe-log-self.txt:1`, `issues/chart/door-handover/INTAKE.md:31`. The failed first run records `agent_name_taken`, so the replacement needs a fresh name. `issues/chart/door-handover/slots/probe-log-external.txt:6`.
- **F3. The consultant helper is the wrong lifecycle for A.** It closes panes, recreates their layout and restarts agents. Its tests expressly expect new pane IDs. Reusing that path for A would violate same-pane replacement. `skills/chart-issues/scripts/peer-restart.ts:176`, `tests/peer-restart.test.ts:132`.
- **F4. “Idle” is not a reliable end-of-turn boundary.** The probe uses a default `herdr agent wait` before killing. Existing code documents Claude appearing idle during silent thinking and uses transcript evidence instead. `issues/chart/door-handover/slots/probe-handover.sh:7`, `skills/chart-issues/scripts/peer-wait.ts:157`. Installed Herdr 0.9.1 help additionally says default wait accepts `blocked`, while start success proves interactive readiness, not completion of a startup task. Commands inspected: `herdr --version`, `herdr agent --help`, `herdr pane --help`, `herdr agent start --help`, `herdr agent wait --help`, `herdr pane process-info --help`.

## Material forks

### D1. How does A relinquish its process?

**Options:** Use a self-detaching helper as A's final action after saving the handover. Alternatively, launch a helper that waits for a proven final turn before killing A. Closing/recreating A's pane is ruled out by the intake.

**Pick:** Make the handover invocation the explicit point where old A gives up ownership. All records, consultant returns, usage work and user-visible transition text must be finished before it. The helper detaches, validates the expected A identity and process group, terminates that process group, verifies the shell is available, then starts the replacement in that same pane. Old A performs no further work after invoking it.

This removes the need to guess whether old A finished thinking. Its cost is that a final assistant reply after the invocation cannot be required. If a normal final reply is required, choose the second option and use actual harness turn-end evidence, not a delay or idle status. That alternative adds harness-specific waiting and another failure point. The probe is evidence for detachment and replacement only, not proof of either production boundary contract. `issues/chart/door-handover/slots/probe-handover.sh:3`, `skills/chart-issues/scripts/peer-wait.ts:157`.

### D2. What allows the replacement to continue autopilot?

**Options:** Let any new session inherit the latest “on” entry. Or permit only the replacement named by an explicit handover to inherit it.

**Pick:** The narrow handover exception. Persist one structured transfer record, with the originating pane/session, operator switch-on reference, exact handed list, next chart, active consultant panes, consultant losses, and a unique transfer identity. Point to existing chart decisions and waits rather than copying their prose. The replacement verifies the transfer, the current mode and its pane, claims it once, records its actual new session when available, then continues. A later “off” or changed-list instruction supersedes the saved transfer. An unrelated new session still follows today's attended rule.

Unconditional inheritance is fewer words but could revive an old pass after an unrelated restart. The one-use exception costs a small record and validation, while preserving the operator-only switch and scope limits. It must not represent an automatic continuation as new operator words. Update the mode shape and guide alongside the skill. `skills/chart-issues/SKILL.md:135`, `skills/chart-issues/SKILL.md:137`, `skills/chart-issues/SKILL.md:143`, `skills/chart-issues/assets/shapes.md:41`, `skills/chart-issues/assets/shapes.md:72`, `docs/guide/chart.md:263`.

### D3. When should A restart?

**Options:** Restart whenever a session opens a chart. Or restart only when the current A has finished a chart's work for now and is about to enter another runnable chart in the same handed list.

**Pick:** The transition between charts. Finish the outgoing chart's handoff, close, hold or wait bookkeeping, collect every outstanding consultant exchange, close its usage span, and determine the next runnable handed chart before handing over. The new A starts that next chart directly and performs its normal consultant-entry restart once. Do not restart again merely because the replacement has started, after compaction, or when every remaining chart is waiting. End the pass normally when no work can proceed.

Restarting unconditionally on entry risks a restart loop and duplicate opening work. Transition-only restart leaves the first chart in the initial session and does not reduce context within one unusually large chart. That is the appropriate cost for this chart-boundary request. Preserve lost consultants across the whole authorized pass, not merely one process lifetime. `skills/chart-issues/SKILL.md:29`, `skills/chart-issues/SKILL.md:39`, `skills/chart-issues/SKILL.md:49`, `skills/chart-issues/SKILL.md:141`, `skills/chart-issues/SKILL.md:143`.

### D4. Which launch settings and harnesses are supported?

**Options:** Hard-code the demonstrated bare Claude launch. Or preserve A's harness and relevant launch settings, replace the original task prompt with an explicit continuation instruction, and require evidence for each supported launch form.

**Pick:** Preserve the current harness and settings. Fresh context must not silently change the model, effort, permissions or working directory. Reject history-restoring launch forms before stopping A. Do not blindly replay an original positional task prompt or resume command. The existing peer helper offers inspected examples of preserving argument boundaries and rejecting history arguments, but its lifecycle cannot be reused wholesale. `skills/chart-issues/scripts/peer-restart.ts:45`, `skills/chart-issues/scripts/peer-restart.ts:145`, `skills/chart-issues/scripts/peer-restart.ts:215`, `tests/peer-restart.test.ts:223`.

Hard-coding Claude is smaller but changes behavior for other door harnesses. The cost of preservation is proving how each supported harness receives its new prompt. The intake explicitly leaves Codex, pi and slash-command invocation uninspected. Do not claim those work from the Claude probe. Use an absolute skill/transfer-file instruction so startup does not depend on an unproven slash-command interpretation. Settle the supported set before handoff. `issues/chart/door-handover/INTAKE.md:59`.

### D5. What happens when replacement fails?

**Options:** Keep retrying or revert to old-context work. Or make one bounded transition with durable, visible failure state.

**Pick:** Validate the transfer, launch and target before termination. Refuse with old A untouched when preparation fails. After termination, bound shell readiness and launch waits, preserve the exact failed operation and outcome, and leave the pane recoverable if startup fails. A launch timeout does not prove no replacement exists, so inspect that identity before any later recovery. Never automatically spawn a second A or resume old-context work as if handover succeeded.

Use a new legal agent name for each transfer. Recheck the expected old session/process identity immediately before termination so a delayed helper cannot kill a replacement or unrelated occupant. A stale/repeated transfer must not launch again. This costs explicit failure reporting and can require operator recovery after an actual launch failure. Unlimited retries invite duplicate owners and unattended loops. `issues/chart/door-handover/slots/probe-log-external.txt:6`, `skills/chart-issues/scripts/peer-restart.ts:124`, `skills/chart-issues/scripts/peer-restart.ts:176`. The existing tests demonstrate the value of stopping on a failed phase, but do not test A's process replacement. `tests/peer-restart.test.ts:270`.

## Practitioner questions to settle

- **Q1. Is a persisted, final handover invocation sufficient, or must old A emit a normal final assistant turn first?** This selects D1 and determines whether harness turn-end detection is necessary.
- **Q2. Which A launch forms must work in this delivery?** Preserve existing behavior for every supported form and prove them. Any narrower support claim requires an explicit scope decision, not an undocumented Claude-only assumption.
- **Q3. Where is the complete pass state authoritative after replacement?** The transfer must retain the exact handed list and consultant losses even when they are recorded across several charts. Current mode records live per chart. `skills/chart-issues/assets/shapes.md:72`.
- **Q4. How is successful continuation observed?** A new session ID proves replacement, not that the new A read its instructions, retained the authorized list and actually began the next chart without operator input. The live proof must observe those actions.

## Lifetime pitfalls and their removal

- **R1. The probe becomes production code unchanged.** Its wait pipeline does not stop on failure, and it still attempts start when its shell polling loop expires. Replace those probe shortcuts with checked steps and bounded failure outcomes. `issues/chart/door-handover/slots/probe-handover.sh:7`, `issues/chart/door-handover/slots/probe-handover.sh:12`.
- **R2. Replacement revives dropped consultants or repeats an exchange.** Persist pass-level losses and the next chart, collect all returns before transfer, and let only the new A perform the next chart's consultant restart. Existing rules already forbid treating idle as collection. `skills/chart-issues/assets/questions.md:46`.
- **R3. Usage reporting loses or double-counts the boundary.** Preserve `opened`, close the outgoing span, open the next chart's span on actual entry, and append actual A session entries without null placeholders. Do not attribute startup success before observing it. `skills/chart-issues/SKILL.md:39`, `skills/chart-issues/assets/shapes.md:178`, `skills/chart-issues/assets/shapes.md:180`.
- **R4. The installed invocation blocks despite a successful scratch probe.** The named permission rule is present at `/home/ivan/.claude/settings.json:48` and auto mode at line 79. The probe used a shell helper, whereas the proposed allowed command is a Bun script. Prove the final installed invocation under the actual permissions and identity before claiming unattended operation. Do not add permission bypasses. `issues/chart/door-handover/INTAKE.md:35`.
- **R5. The footer falsely says nothing follows.** Add only the handover-specific transition wording. Keep today's `Next: none` footer for actual pass stops and attended mode. “Queued” must not claim the replacement already started. `skills/chart-issues/SKILL.md:149`.

## Scope and proof

- **A1. Keep the change together.** This is one outcome spanning the helper, its meaningful failure tests, the chart skill, mode shape and matching guide text. Do not split prose authorization from the mechanism into independently usable deliveries that contradict each other.
- **A2. Prove the whole transition on disposable panes.** Observe old A gone, a different session in the same pane, unchanged layout, preserved launch settings, one continuation consuming the same handed list, and no operator response. Exercise a repeated transfer, a changed target identity and a launch failure without harming live panes. Also check that attended entry still takes the existing path. Existing peer-restart tests alone cannot prove this outcome.
- **A3. Rule off route.** No new supervisor service, scheduler, cross-door coordinator, consultant-restart rewrite, global permission edits, context-size threshold, automatic lifecycle dispatch, or generic all-harness restart framework. No changes to approval ownership or the handed work list. The existing autopilot route remains lifecycle, and handoff still does not dispatch. `skills/chart-issues/SKILL.md:87`, `skills/chart-issues/SKILL.md:137`, `skills/chart-issues/SKILL.md:139`.

No live mutation or new probe was performed for this map. Existing probe evidence was inspected, not rerun. The decisive remaining proof is that the final installed helper transfers actual autopilot work, not merely that it starts another process.
