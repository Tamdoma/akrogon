# Busy seat notice: blind notes B

## Trigger Q1

### 1. Pick, reason and cost

D1. Reuse the operator-started watch and the existing notifier. When a watch fire observes busy seats on nonterminal leaves, run one `akrogon next --all` from that registered repository root, even if those busy leaves have unmet dependencies. Re-observe afterward and retain the existing command-error rule. Replace the Busy rule's blanket "working normally: no action" with "no steering for duration alone; run the normal pass to evaluate its notice". Do not add a separate watch-side notifier, timer, persisted field or notification deduper.

For #78 this reaches the existing code: `dispatchLeaf` observes recorded panes before checking dependencies. A dependency-blocked busy leaf can therefore notify without becoming eligible to dispatch. Only adding phase to the notice text is insufficient. The watch instructions must actually call the existing pass for the busy case.

Cost: one ordinary repository dispatch pass per watch fire with busy work, not a read-only observation. It can advance other eligible leaves, allocate their missing seats, reconcile merge work and clean completed work. Busy seats are protected against duplicate prompts. Do not describe the entire command as harmless or notification-only. A manual pass also bypasses the automatic repo-pause gate. The operator must choose that existing behavior if this option is accepted.

This narrows the old no-poll decision only for the already explicit, operator-started watch. There is no new background clock. No watch means no notice during total event silence. With regular 20-minute fires, detection occurs on the first completed pass after the threshold, subject to watch delays or command errors. Change the destination's "even when no next runs" to "the active watch runs the existing pass for busy leaves too". Literally guaranteeing delivery when neither next nor another evaluator runs would require a different mechanism.

### 2. Rejected options

- O1. Notice text only: leaves the #78 watch path skipping next.
- O2. A second notifier in observe.ts or the watch: duplicates elapsed-time and dedup logic already in `observeBusy`.
- O3. A hidden timer, daemon or Herdr periodic trigger: contradicts the recorded operator decision and adds infrastructure.
- O4. Run `next <slug>` blindly for each busy leaf: it can notify first, but a failed, parked, missing or unreadable dependency then produces a command error. The watch must stop further mutation that fire, potentially leaving other busy leaves unobserved. One repository pass is simpler and covers the inventory.
- O5. Unconditional notices without an active watch: no existing evaluator runs during total event silence. The current architecture cannot promise this.

### 3. Evidence

All read 2026-10-10.

- operator: brief's complexity correction. `INTAKE.md` #78 reports a working seat skipped by the watch, not proof that next itself ignores dependency-blocked panes.
- better-than-training: `src/next.ts:660-695` calls `observeBusy` before dependency blocking. `:552-556` guards busy agents from repeat prompts. `:771-789` sweeps every selected leaf. `:1491-1501` scopes `next --all` to the current registered repo and performs cleanup.
- better-than-training: `src/next.ts:659,1442-1460,1473-1501` shows manual versus automatic pause behavior, self-update and coordination locking. `:995-1029` shows merge reconciliation. The command is a normal mutation path.
- better-than-training: `skills/watch-issues/SKILL.md:8,16,36,40-45` defines root cwd, 20-minute cadence, blocked-leaf exclusion, busy no-action rule, command-error handling and the rule that busy work prevents watch shutdown. `:12` limits the watch to Claude Code cron availability.
- operator: `seat-stall-detection/CHART.md` accepts pure-silence stalls and forbids hidden clocks. `stall-notifier-removal/CHART.md` records the later decision to retain the existing notifier because other events can reach it.

### 4. Pitfalls and their removal

- R1. Busy-leaf notice still skipped because it is dependency-blocked. Run the repository pass before using dependency labels to skip dispatch actions in the watch.
- R2. An extra pass is mistaken for a pure observation. Declare its normal dispatch and pause effects in the operator choice. Keep command errors visible, re-observe, and perform no further mutation that fire.
- R3. Duplicate notices or repeat prompts. Reuse `busy_notified` and the existing busy-agent guard, rather than sending notifications directly from the watch.
- R4. Claiming a new code path is proven by source reading. Before handoff, use a disposable fixture with a dependency-blocked busy seat and an old `busy_since`: the pass must notify without prompting that seat, and a repeated pass must not notify again. No live `next` or notification was run for these notes.

### 5. Additional questions

Q2. Does the operator accept a normal repository pass, including its manual pause behavior, on each watch fire with busy work? If not, an observation-only command is a distinct implementation choice, not an existing capability.

## Bar Q1

### 1. Pick, reason and cost

D2. Keep the existing recorded busy episode and fixed threshold: strictly more than 60 minutes, once per seat until the observer sees idle, done or no agent. Progress, phase changes and session replacement alone do not reset it. Failed and merged phase transitions clear it. This requires no new clock fields or estimate ingestion.

Add the current phase to the existing notice, for example `Busy leaf: framework/formspark-build-wiring seat A phase check.fix busy episode 3h12m`. The phase is where the leaf is when notified. The elapsed value is the recorded busy episode, which may cross phases. It is neither session age nor time spent in that phase. Cost: this deliberately narrows #78's per-phase duration request. A phase entered recently can appear beside an older elapsed value, so the label must be explicit.

### 2. Rejected options

- O6. Phase duration: needs a phase-start measurement and a different reset contract. The current fields do not provide that meaning.
- O7. Session age: counts time outside busy work and does not match the retained notifier's episode.
- O8. Per-leaf estimate: #75's estimate is handoff prose, not a machine threshold. Parsing it adds a new contract and failure modes.
- O9. Reset on every phase, progress update or replacement session: changes dedup behavior and can indefinitely postpone a notice during continuing work. Keep current semantics unless explicitly requested.

### 3. Evidence

Read 2026-10-10, tier better-than-training: `src/next.ts:220-260` treats working, blocked and unknown as busy, starts the timestamp at first observation, clears it on idle/done/no agent, checks `elapsed <= STALL_MS`, and records notification afterward. `src/phase.ts:142-153` preserves both fields across ordinary phase moves and clears them on failed/merged. `src/state.ts:80-81` stores them per seat letter, with no episode-session binding. `tests/next.test.ts:412-438,462-488` covers the boundary, notification-command failure, dedup and busy status handling. Tests were inspected, not run.

### 4. Pitfalls and their removal

- R5. Calling busy time "time in check.fix". Include phase as context and label the number busy episode. Operator acceptance must settle this difference from intake.
- R6. Treating long or unknown status as proof of a hung tool. Duration produces notice only. Keep steering governed by the watch's concrete loop or tool evidence.
- R7. Claiming exact continuous activity or exactly-once delivery. The timestamp starts at first next observation and an idle interval between observations may be missed. Notification and state persistence are separate operations. Describe dedup under successful observed execution, not a transactional delivery guarantee.

### 5. Additional questions

Q3. Is the current phase plus labelled busy-episode duration sufficient, or is actual per-phase duration required? This is the material choice between the minimal change and a new timing contract.
