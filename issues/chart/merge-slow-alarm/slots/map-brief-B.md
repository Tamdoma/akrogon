# Opening map brief, slot B

You are slot B, a consultant to the chart door (slot A) in repo /home/ivan/Work/infra/akrogon. Map independently; A's map and any other seat's map are withheld until both finish.

Reading rule: read process text by named section for the step you answer; locate a section before reading it, batch independent reads in one call with output bounded to those sections, read content you already hold at most once per session. A section not read yet, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. Choose your own evidence otherwise.

## Intake (verbatim seeds, read them in full)

- /home/ivan/Work/infra/akrogon/issues/seeds/123-merge-verify-wall-time-is-recorded-per.md (Tamdoma/akrogon#123)
- /home/ivan/Work/infra/akrogon/issues/seeds/124-a-killed-live-run-under-run-check-left-a.md (Tamdoma/akrogon#124)

Operator words: "Look at the two new pulled issues. Consult with slot b (codex, active in this tab) and chart it on autopilot mode."

## Live surface

- src/verify.ts (runOnce receipt and locked rewrite, sendMainRedNotice, newRedUnits), src/land.ts (merge lane), src/AREA.md verify and run-check sections
- src/run-check.ts (runCheck, checkedRun capture pair, check_end), src/scope.ts (startRunGuard, runUnitArgv), src/phase.ts (move guards)
- skills/check-issue, skills/implement-issue, skills/merge-issue SKILL.md where they run live fixture tests through run-check
- framework repo records: /home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl and its chart issues/chart/verify-time-tradeoffs/forks/tradeoffs.md (D3)

## Existing locks

- Operator lock 2026-09-18 (issues/chart/seat-stall-detection/forks/no-akrogon-detector.md, Taken): no hidden watchdogs, clocks or polling; forecloses timers, long-lived watchers, elapsed-time stall triggers.
- issues/chart/killed-check-log/CHART.md Off route: "Making a check survive its caller" was out of scope for #120 (changes admission and guard ownership).
- Framework D3 (quoted in #123 Expected behavior): compare each merge verify's wall time with the recent normal per repo and scope, flag a large jump, name the leaf whose merge first showed it, where operator and merge slots see it; never fail merges on a wall-clock cap.

## Task

Write a proportional territory map: for each issue, the material forks (each with options), what each option could break or invite later and not only now, practitioner questions, pitfalls with what removes each, proposed chart split (one chart per destination or grouped), and any external operation a leaf would need proven. Ground each claim in an inspected path or a named outside source with tier (operator, practitioner, better-than-training, model-knowledge with the searches run). Include the questions you would ask that the intake does not.

Return: write your map to /tmp/claude-1000/-home-ivan-Work-infra-akrogon/e9eb89a0-d477-43b1-921b-6eaeb9fba7d8/scratchpad/map/map-B.md and end your turn. Do not edit any repo file.
