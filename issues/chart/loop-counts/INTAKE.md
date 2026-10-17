# Intake: loop-counts

## Scope
Exact loop evidence from skills/watch-issues/scripts/log-tail.ts; the agent keeps on-brief and hung-tool judgment.

## Provenance
- GitHub: Tamdoma/akrogon#97
- Operator: 2026-10-17 chart-issues invocation
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T08:36:16Z)

## Source: Tamdoma/akrogon#97
# watch-issues busy-loop bar is counted by the agent from log-tail hash lines on every tick

Source: Tamdoma/akrogon#97
URL: https://github.com/Tamdoma/akrogon/issues/97

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

Chart `issues/chart/jev-classifier` (fork `adopt`, 2026-10-17) found that the watch-issues loop bar (same command or edit three or more times with the same result, three or more consecutive errors, an edit-undo cycle) is counted by the agent reading `log-tail.ts` output lines on each busy seat every tick. `log-tail.ts` already prints `#<hash>` per command and `old#`/`new#` per edit, but it prints no counts. The operator asked for this to be seeded as an idea, not charted now.

## Location

akrogon watch-issues skill, busy-seat judgment; `skills/watch-issues/scripts/log-tail.ts`.

## Reproduction

Not provided. Busy-loop frequency and cost are unmeasured.

## Expected behavior

Reporter (chart finding): exact repeat, error and undo counts could come from the script, with the agent still judging whether work serves the brief and whether a tool is hung. Charting peer B noted that this replaces only the counting, not the watch turn.

## Urgency

Low. No observed missed or false loop call.

## Suspected cause

Counting is defined as prose in the skill and left to the agent, while the script stops at hashing.
Whose view: agent (charting peers A, B, C).
Files read: `skills/watch-issues/SKILL.md:42` (loop bar and hash markers), `skills/watch-issues/scripts/log-tail.ts:87` (`hash8`), `:415-417` (`#<hash>`, `#-`, `old#`/`new#` output).
Not inspected: watch transcripts showing how often the bar is evaluated wrongly.
Related reports: none found. Searched Tamdoma/akrogon, all states, "log-tail loop", limit 8; author @me since 2026-10-15, limit 30.

## Source: operator 2026-10-17
I've pulled the new issues in. Please let's chart them out. You can only use slot B which is active in the pane next to you.

## Source: operator 2026-10-17 autopilot switch-on
run autopilot on base-red (#98), loop-counts (#97) and failed-cause (#96), consultants B and C (active in this pane)

## Agent findings
Opening map shared with base-red: ../base-red/slots/map-merged.md (A,B, with B rebuttal corrections).
