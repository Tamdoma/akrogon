# Intake: failed-cause

## Scope
Structured failure class for watch-issues recovery; depends on base-red's failure policy.

## Provenance
- GitHub: Tamdoma/akrogon#96
- Operator: 2026-10-17 chart-issues invocation
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T08:36:16Z)

## Source: Tamdoma/akrogon#96
# watch-issues re-classifies a failed leaf from free-text failure.reason on every tick

Source: Tamdoma/akrogon#96
URL: https://github.com/Tamdoma/akrogon/issues/96

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

Chart `issues/chart/jev-classifier` (fork `adopt`, 2026-10-17) found that watch-issues decides a failed leaf's class (human prerequisite, defect in another leaf's work, or recoverable) by reading the free-text `failure.reason` in an agent turn on every 20-minute tick while the leaf stays failed. The stored record already has a typed `cause`, but it holds only `blocked` or `attempts`, so the class the watcher acts on is not in structured form. The operator asked for this to be seeded as an idea, not charted now.

## Location

akrogon watch-issues skill, failed-leaf judgment.

## Reproduction

Not provided. Volume from `issues/log.jsonl` 2026-09-11 to 2026-10-17: about 18 entries into `failed` (about 0.5 per day).

## Expected behavior

Reporter (chart finding): the class the watcher needs could be read from a structured field rather than inferred from prose. Pain not yet measured.

## Urgency

Low. No observed wrong recovery. Current behavior works through agent judgment.

## Suspected cause

The failure record carries only `cause: blocked | attempts`, so the finer class lives only in the reason text the seat writes.
Whose view: agent (charting peers A, B, C).
Files read: `skills/watch-issues/SKILL.md:40-41` (failed-leaf classes judged from `failure.reason`), `src/state.ts:12-18` (`failureSchema`, `cause: z.enum(['blocked','attempts'])`), `src/phase.ts:83-104` (failure announcement uses cause and reason).
Not inspected: every seat skill's failure-writing site; whether seats can know the class at write time.
Related reports: Tamdoma/akrogon#33 (watcher idling on a failed leaf whose blocker names a fixable owner; different defect, same judgment rule). Searched Tamdoma/akrogon, all states, "watch-issues failure reason", limit 8.

## Source: operator 2026-10-17
I've pulled the new issues in. Please let's chart them out. You can only use slot B which is active in the pane next to you.

## Source: operator 2026-10-17 autopilot switch-on
run autopilot on base-red (#98), loop-counts (#97) and failed-cause (#96), consultants B and C (active in this pane)

## Agent findings
Opening map shared with base-red: ../base-red/slots/map-merged.md (A,B, with B rebuttal corrections).
