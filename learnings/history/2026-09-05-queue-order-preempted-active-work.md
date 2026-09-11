# Queue ordering replaced work that already owned the worker slot

What failed: a worker with a fresh receipt and heartbeat was replaced by a different queued item
using the same seat name. Dispatch records `b0b0e037` and `15f67248` record the two launches. The
first item's receipt and timestamped progress preceded the second launch without a completion proof.

Root cause: the tick sorted items before writing missing first-ready timestamps. That write changed
the next tick's ordering. Selection always took the new queue head, and opening its shared seat
closed the previous worker. Queue priority implicitly overrode ownership of work already in progress.

Fix: `850a245a` makes the newest committed repo dispatch identify the owner until its step finishes,
parks, or its cycle is retired by a resume. The board and scheduler share that selection. A regression
covers consecutive ticks, a competing stale dispatch, board agreement, and release after a resume.

Lesson: separate admission priority from ownership after admission. A queue reorder must not revoke
active work unless preemption is an explicit protocol. Test scheduling across state-changing ticks,
including newly ready and newly higher-priority items, and assert that an active worker survives.

Second instance, role cutover: a routing change moved plan-synthesis from the implementer seat to
the synthesizer seat while a reconciler running the old code was live. Between one item finishing and
the restart, the old lane dispatched the next item's planning to the implementer; after the restart
the new code dispatched the same step to the synthesizer, leaving two seats writing the same item.
The superseded seat was stopped by hand and verified idle with a clean worktree.

Extension of the lesson: ownership is defined by the routing active at dispatch, so a routing or role
change is itself a preemption event. Stop the lanes before committing an activation-sensitive change,
then restart — never restart around a live lane and rely on timing. After any cutover, list the
agents and check for two seats owning one item; shared progress files from an overlap carry
interleaved seat lines and cannot back per-attempt measurements.

Third instance, backward step change: a hand repair of an accepted plan packet pushed a chunk file
over the committed byte budget. The budget proof re-runs every tick, so the item's computed step
regressed from implement-chunk to plan-synthesis while the implementer was live; holdsPlace read the
step mismatch as the normal advance release and handed the repo's shared seats to the next queued
item, repointing the only implementer mid-chunk.

Extension of the lesson: any edit to a machine-consumed artifact is a step-change release candidate —
run the same acceptance proofs the reconciler runs (byte budgets, parse checks) locally before
committing a repair. And a computed step that moves backward past the newest dispatch record is not
that record's end: the fix (98155ab6) holds the place and retires the live seat with an attempt
record naming the regression cause before the earlier step may dispatch.

Fourth instance, successful cycle transition read as regression: the judge cycle loops forward
through hunt, verdict and repair with a rising round number, but the regression check compared only
the static phase order, where judge-hunt precedes repair. A repair round that succeeded and advanced
to the next hunt round therefore looked like a backward step, and the mid-flight retirement path
charged the verifier a failed attempt for work that completed (record 1b749172,
`006-repair-round-1-framework-verifier-0.yaml`). Cleanup was right; the recorded cause was false,
and spend and timing records misstated a success as a failure.

Extension of the lesson: a stage order used to detect regression must understand every legal forward
cycle, or each successful loop iteration is booked as a failure. The fix (1bbbf32c) compares round
numbers first when both keys are judge-cycle steps, using the cycle membership the engine already
exports rather than a second ranking table, and retires a completed step's seats from the advance
proof itself (any seat-dispatch row, not only chunk gates), keeping the latest-record cross-item
guard. Historical false-failure records stay untouched: the record is the evidence of the defect,
and rewriting history would hide what the timing data needs to explain.

Fifth instance, boundary stealing: active-attempt protection ended correctly at a phase handoff,
but the fallback immediately selected the first queued item. An earlier-ready peer of equal
priority therefore took the slot between successful steps, spreading unfinished work across leaves.

A single-flight scheduler must distinguish ownership of a live attempt from continuity of an
unfinished leaf. Preserve the active dispatch first, including retries. After it completes, prefer
that leaf's freshly computed advance or dispatch step over an earlier-ready peer of equal priority.
A strictly higher-priority item may take a completed-step boundary. Blocked, parked, finished or
explicitly resumed leaves yield through the existing queue policy. No additional scheduling state
is needed. The board and executor must use the same selector after transition and cleanup writes.

Being merged into main does not prove lifecycle completion. Finalization can still be owed, so
ancestry must not release ownership. Tests must distinguish actual merge outcomes from unfinished
lifecycle work, which can legitimately appear in both board sections. Boundary, priority, blocker,
resume and real two-tick handoff regressions pass. Implementation 9f208400 is active on both pinned lanes, confirmed by claims 12b85954 and
817438e2. Active worker panes were untouched during the reconciler-only restart. A pending
deploy can otherwise wait indefinitely behind continuous work. Actual speed improvement remains
separate evidence.
