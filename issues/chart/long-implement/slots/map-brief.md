# Blind territory map: Tamdoma/akrogon#51 (chart-issues door, slot A asking)

You are a charting peer. Work independently. Do not read any other map-*.md file in this directory. Do not edit any repo file. Write only your output file.

## Operator note, verbatim
"Look at the pulled isssue. I'm losing my mind over these long sessions that take more than 2 hours for a leaf to merge. This is not how it's supposed to work. Find a solution for this problem. Consult with both slot b and c, they're active panes in your tab. Please, come up with an elegant solution."

## Intake
- /home/ivan/Work/infra/akrogon/issues/seeds/51-leaf-phases-have-no-duration-ceiling-19.md (verbatim mirror of Tamdoma/akrogon#51)

## Live surfaces (inspect, measure, cite file:line)
- akrogon command: /home/ivan/Work/infra/akrogon/src (next.ts:193-222 STALL_MS/observeBusy, phase.ts, status.ts, state.ts)
- akrogon skills: /home/ivan/Work/infra/akrogon/skills (implement-issue, check-issue, plan-issue, merge-issue, watch-issues, chart-issues)
- framework phase log: /home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl (1243 records; fields ts, slug, from, to, slot, fix_rounds, verdict, diff, head)
- framework leaf emdash-launch, LIVE right now in check.fix: /home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-build/emdash-launch (seat pane wA:pGB, read only; do not prompt it)
- Other consumer logs: repos in `akrogon config` `repos`

## Existing locks (operator-taken, still binding unless the operator lifts them)
- issues/chart/leaf-run-stalls (handed off and merged 2026-10-01): Off route "Any clock, watchdog, elapsed trigger or numeric size gate". Took: criteria cite only blocking `checks` or leaf-owned tests; an unmeetable criterion ends the pass `failed`; pi provider retry capped ~10 min, dead worker reruns its brief, second death ends `failed`; chart audit proposes a split when a dependent consumes a separable part. Operator: "I want to be removed as much as possible from the entire process."
- issues/chart/stuck-seat-recovery (2026-09-28): Off route "A time limit or restart verb for hangs with no known cause."
- issues/chart/stall-notifier-removal (2026-09-18): notifier retained.
Read those CHART.md and forks/*.md for full answers.

## What to produce
A territory map, proportional to the problem, in markdown:
1. Root cause. Where do >2h implement/check.fix phases actually spend time? Measure from the log and leaf artifacts (implementation/, review findings, reports, commit times). Separate idle/parked/blocked wall time from active work. Name which causes the merged leaf-run-stalls leaves already address and which they do not.
2. Material forks: questions whose answer changes the outcome, each with your recommended answer and one reason. Include whether the "no clock" lock should be challenged, with evidence for and against.
3. The single most elegant mechanism you would propose (removes the problem class, fewest moving parts), and what it costs.
4. Practitioner questions and pitfalls grounded in inspected surfaces (file:line).
5. Research: cite tier (operator / practitioner / primary docs or code / model knowledge with searches run) for each claim outside this repo.

Output path: OUTPUT_PATH
Finish by writing that file. Keep it under ~150 lines.
