### Q1. Trigger and grouping

- **Pick.** Consult on every case Judge would otherwise only notify about. Include a known base failure that keeps returning leaves to `check.fix`. Start with one concrete failure and attach others when the peers can explain how the same defect caused each. Cost is reading the failing check, revision and leaf evidence before grouping.
- **Reject.** One consultation per slug pays repeatedly for a shared defect. Matching reason strings merges unrelated failures. Consulting on every ordinary red duplicates the merge seat's existing retry and repair work.
- **Evidence.** Operator, 2026-11-20/21, intake #146 and S1. Better-than-training, inspected 2026-11-21, `observe.ts` (`formatLeaf`) exposes a reason or unknown record. `merge-issue/SKILL.md` (Shared endings) records the command, base and tested head, then can move to `check.fix`.
- **Pitfall.** A new leaf can reveal a second cause. Record why each leaf belongs, re-observe after the repair, and split any remainder on fresh evidence. Prior notice delivery does not establish that anyone investigated.
- **Ask.** Does a busy-seat notify-only case enter the same consult path? S1 says yes. Keep the seat's existing prompt and interrupt restrictions during diagnosis.

### Q2. Exchange

- **Pick.** The watcher sends the first question, follow-ups and evidence pointers to the helper's verified address with `hc send`. Supply a case ID, literal return address, affected leaves and revisions, decision and grant limits, and what failed. The helper sends either a specific question or its diagnosis, actions already taken, result, proof and remaining blocker. Keep large or durable material beside the case record outside checkout. Cost is one case directory.
- **Reject.** An argv task containing the question bypasses the locked transport for some harnesses. A file appearing, a terminal becoming idle or a screen showing “done” cannot establish delivery of the answer. Writing under `issues/` would widen the Never rule.
- **Evidence.** Operator, 2026-11-21, S4. Better-than-training, inspected 2026-11-21, `src/seat.ts` (`startConsultant`, `firstTask`, `agyTask`) handles argv and agy startup differently. `questions.md` (Blind peer exchange) requires a report from the current address.
- **Pitfall.** Startup can succeed while delivery is uncertain. Check receipt before resending any request that permits a write. Match the returned address and case ID, then verify claimed side effects before acting.
- **Ask.** Can a short answer travel entirely in the message? Yes, if the watcher records the decision and evidence once under Q6.

### Q3. Wait and liveness

- **Pick.** The watcher stays in its turn and runs `hc wait --children any --timeout <seconds> --json`. Handle the actual tagged message when it arrives. Answer questions over `hc send`. A timeout checks liveness and starts another wait. A silent completed turn gets one nudge for the missing report. On a second silent stop, error or exit, reconcile work, close the verified helper if still live, and replace it on the same case. Cost is one occupied watcher turn.
- **Reject.** Ending the turn loses the waiting exchange. Polling the child with `hc get` can consume the event the next wait needs. A blocked status alone cannot establish a need for credentials, and a send with `--force` could answer a permission dialog.
- **Evidence.** Operator, 2026-11-21, S3–S5. Better-than-training, inspected 2026-11-21, `hc wait --help`, `hc --skill` (Talk, wait, and collect results), `questions.md` (Blind peer exchange). A message wake and delivery of the message body can be separate.
- **Pitfall.** A timer child can wake the wait. Inspect the event's address, account for a report already in transit before nudging, and never infer a failed push from a silent terminal. On blockage, inspect the cause, honor an actual S3 stop, and repair or replace a broken helper without answering its dialog.
- **Ask.** What if the operator stops the watch mid-exchange? Treat explicit stop as cancellation, reconcile in-flight effects, and do not start a successor. The cleanup mechanics belong to config-and-naming.

### Q4. Progress and disagreement

- **Pick.** Keep one open case per cause. When peers disagree, name the disputed fact and run the smallest permitted check that distinguishes their predictions. End on verified resolution, confirmed S3 need or explicit operator stop. If no permitted next action can add evidence, park the open case with its exact blocker and wake condition, then work other causes. Cost is that an unresolved leaf may remain parked.
- **Reject.** Repeatedly buying a new opinion on identical facts makes no progress. A fixed attempt limit contradicts S5. Declaring either peer the tie-breaker contradicts equal judgment. Calling every disagreement an operator stop broadens S3.
- **Evidence.** Operator, 2026-11-21, S3–S5. Better-than-training, inspected 2026-11-21, `watch-issues/SKILL.md` (Judge) already distinguishes observed unproductive cycles from elapsed time.
- **Pitfall.** The same test name can fail on a different revision for a different reason. Resume a parked case when its named external prerequisite, evidence or available remedy changes. Do not park a live consultation just because it is slow.
- **Ask.** If both peers agree all permitted investigations are exhausted and no S3 authority is needed, is a visible parked record sufficient? My pick is yes. A notice asking for a decision should identify the actual S3 decision.

### Q5. Queued ticks

- **Pick.** Coalesce elapsed, unsent fires into one pending fresh scan. Preserve any in-flight due and its receipt/retry semantics. A scan after a long wait examines current state once. Cost is a timer change and a regression check for receipt and retry behavior.
- **Reject.** Draining every past boundary runs paid turns against the same present inventory. Dropping every missed fire can leave the repo unchecked for another full interval.
- **Evidence.** Better-than-training, inspected 2026-11-21, `timer.ts` (`poll`) accumulates every boundary and holds sends while the watcher works. `tick.ts` (`main`) accepts a newer due and rejects a duplicate, independent of gaps in numbering.
- **Pitfall.** Replacing an already sent due can lose its receipt or redeliver its work. Keep the existing sent due and at most the latest unsent one. Verify many boundaries during a consult and a retry when acknowledgment is missing.
- **Ask.** Does coalescing also apply whenever the watcher is otherwise busy? My pick is yes. Identical scans have identical scheduling needs, and this avoids adding consultant state to the timer.

### Q6. Operator record

- **Pick.** The watcher owns one durable, human-readable record per case under the machine state directory, e.g. `~/.akrogon/watch/<repo>/consults/<case>/`. Record why leaves were grouped, the peer decision, actions and evidence, pushed revision, disposition and any next trigger. Update it after observing the effects, and include its path in the watch reply. Cost is retained local files.
- **Reject.** Conversation history alone makes cases hard to find after a reset. Separate watcher and helper verdict files can disagree about what actually happened. Lifecycle log entries have a different schema, and the watch cannot edit `issues/`.
- **Evidence.** Better-than-training, inspected 2026-11-21, `src/log.ts` (`readLog`) parses every row against the lifecycle schema. `src/config.ts` (`globalHome`) resolves the active state home. `watch-issues/SKILL.md` (Reply) limits each fire to five lines.
- **Pitfall.** A process can die after a successful push but before recording completion. Record the open case before authorizing work. On return or restart, reconcile against remote and leaf state before repeating it. Keep credentials and raw secret-bearing output out of the record.
- **Ask.** Does a restarted watch resume an open case or create a new one? My pick is to reuse the same record when the observed cause still matches, with a new helper address when needed.
