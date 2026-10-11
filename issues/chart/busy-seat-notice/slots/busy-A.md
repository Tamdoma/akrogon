# Busy seat notice, slot A notes (trigger and bar)

## Trigger
- Pick: no new trigger code. The notice already exists in `next` (observeBusy, src/next.ts:230-260) and runs for every seat with a pane before the blocked/failed checks in dispatchLeaf (:660-668), so a blocked leaf notifies too once `next` reaches it. #78 was silent only because the watch runs no `next` for busy or blocked leaves (watch-issues SKILL.md:36,40). Change: one watch rule: when any observe line shows a busy seat with `notified=` empty, run `akrogon next --all` once this fire (it never re-prompts a busy seat, and leaves blocked leaves waiting without throwing). Narrow the 2026-09-18 lock explicitly: akrogon still has no clock; the operator-started watch may cause the existing elapsed check to run. Cost: notice latency up to one watch interval (20 min); no notice without a watch (accepted, same as today's lock).
- Rejected: akrogon timer or plugin timer (lock, no herdr periodic trigger); watch sends notifications itself (watch may not write state, so no once-only record); `next <slug>` per leaf (throws on failed/parked prerequisites, src/next.ts ~684).
- Evidence: src/next.ts:227-260,660-668; skills/watch-issues/SKILL.md:34-40; seat-stall-detection/CHART.md Off route, read 2026-10-10.

## Bar
- Pick: keep what exists: busy episode (busy_since until the seat goes idle), fixed 60 min (STALL_MS), once per episode, reset when the seat goes idle (observeBusy clears both fields). Add the phase to the notice text (#78 Expected: leaf, phase, elapsed). Reason: smallest change; #78 asked for a notice, not a new measure. Cost: a seat that goes idle for a moment resets the episode; a 4-hour phase made of short busy episodes never notifies.
- Rejected: per-phase duration or per-leaf estimate (new state and charting data); session age (meaningless across phases).
