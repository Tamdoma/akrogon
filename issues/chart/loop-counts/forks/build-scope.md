# Build scope

## Question
Q1. Build exact loop evidence in log-tail.ts at all, given no observed missed or false loop call and unmeasured pain?
Q2. If built, who owns the mechanical bar: the script prints a verdict line with evidence (same command and same result three or more times, three or more consecutive errors, edit-undo on the same file) and the skill keeps only on-brief and hung-tool judgment; or the script prints counts only and the skill keeps the thresholds; and over which window (the last 20 printed calls, or the seat's whole log)?

### Carries
- Locks: no classifier model API (chart jev-classifier). Only the operator flips autopilot; no new timers or polling (chart autopilot).
- Related: ../base-red/slots/map-merged.md (#97 section); skills/watch-issues/SKILL.md:42; skills/watch-issues/scripts/log-tail.ts; its tests skills/watch-issues/scripts/log-tail.test.ts.
- Operator corrections: none. Autopilot on since 2026-10-17T08:36:16Z.

## Findings
- Notes: slots/build-scope-A.md (don't build), -B.md (defer), -C.md (build small, counts only); merged slots/build-scope-merged.md with B F1-F4 and C D1-D2 applied.
- better-than-training, read 2026-10-17: log-tail.ts prints the last 20 entries (:486) with command hash, edit old/new hashes, status and one excerpt line (:392, :412-420). Codex and pi join inner commands into one target (:208, :224, :276), pi joins multi-edits (:260, :323-327). No result equality exists, so "same command and same result" needs new full-result capture across three log formats. Changed: build cost is parser work, not a grouping function.
- practitioner, read 2026-10-17: Ewaschuk, Google SRE "Monitoring Distributed Systems" (simple low-noise signals that justify interruption); Anthropic "Building Effective Agents" 2024-12-19 (add complexity only when it improves outcomes). Supports deferral without observed benefit.
- Intake: no missed or false loop call on record; pain unmeasured. Nothing records one either (C D2), so reopening relies on operator notice or a watch report whose named evidence was wrong.

## Taken
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Matches the round recommendation.

Q1: do not build. #97 closes as not built. Q2 not reached.
Reason: honest exact counts need full-result capture and parser changes across claude, codex and pi logs to save the watcher from reading 20 lines it already reads, and the watch turn stays either way (on-brief and hung-tool judgment, skills/watch-issues/SKILL.md:42). No missed or false loop call is on record. Removing over adding.
Reopening condition: a concrete missed loop (a seat burning time the watch report called normal) or a false loop steer (a watch report whose named loop evidence was wrong), noticed by the operator. No recording point is added, so this trigger is operator notice only (C D2).
Rejected: build small, counts grouped by command hash and status (C): command/status groups are not result equality and flag the normal edit-test cycle (B F2, C); build with a verdict line (A, if built): bar in code for an unmeasured gain.
Standing dissent: C would build counts-only now, since counting hash lines by eye is mechanical work agents do worst and both error kinds cost seat time.
