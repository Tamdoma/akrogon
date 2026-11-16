Disagreements only, B. Sources inspected 2026-11-16.

R1. Q2 needs a completion wake, not an assumption that the harness eventually takes another turn. listenCommand subscribes to hc terminal events only. If dispatch defers an idle seat for a background run and no terminal event follows that run, work remains idle indefinitely. Contract the wake after outer admission-record removal and prove it with a fake command and an otherwise quiet listener.

R2. Do not expire a live run after STALL_MS. implement-issue explicitly permits hours/unknown slow proofs, and liveRuns is already PID/boot aware. Age is grounds for attention, not proof the execution stopped. Also, “let it feed the busy notice” needs an implementation: observeBusy clears busy state for idle seats today. A live-run deferral branch must explicitly handle notification rather than return before it.

R3. Q3 must charge each lost address once even when replacement fails before startSeat records a new seat. A bare increment before replacement can charge the same old loss on every wake. Use lost_seat identity, or clear the old seat reference atomically with the increment while preserving its evidence. Working on a fresh start must not reset the bound.

R4. The failure cause alone does not make watch notify-only. watch-issues Judge classifies failed recovery by reason/history, not failure.cause. cause=attempts would allow automatic reopen cycles, and cause=blocked alone also does not forbid them. A loss-bound failure needs an explicit notify-only classification so its replacement bound survives the watcher.

R5. Q5's argument for no migration has the safety direction reversed. An old count of 4 can contain one delivered task and three deaths without any completed turn. Failing after its next silent completion directly contradicts signpost 4a. “Never lower” proves that false failures remain possible. Reset ambiguous legacy counts once, with a semantic marker, or use a distinct new counter. A release-note seam does not make the new failure reason true.

R6. Latest-only evidence in state/delivery_error is overwritten by replacements, cleared by phase moves, or saved after teardown. It cannot explain both lost starts in #137. Preserve each loss before removal. A's observed exit_code/signal fields can be added to the parsed hc surface, but the record must distinguish unavailable fields from real exit values. Existing appendTiming is best-effort and is not a durable-before-teardown guarantee.
