# Opening map brief, slot B

You are consultant slot B for a chart-issues door (A runs the door). Map the territory for two handed issues, independently. Do not read any other slot's map. Do not edit any file except your return file.

## Intake (read both in full)
- /home/ivan/Work/infra/akrogon/issues/seeds/99-chart-issues-consultants-keep-one.md (Tamdoma/akrogon#99) and its comment: `gh issue view 99 -R Tamdoma/akrogon --comments`
- /home/ivan/Work/infra/akrogon/issues/seeds/100-chart-usage-ts-counts-the-same-window.md (Tamdoma/akrogon#100)

## Operator words for this pass (verbatim, 2026-10-17)
- "#99: operator chose restarting consultant panes (herdr pane close + split + agent start) over /clear plus warm-up messages. The restart test result is in the #99 comment."
- Earlier: "I would rather you restarted both panes so close them and then restart them in herder simply because I don't want to send these short messages because they are prone to getting buggy over time."
- "#100: per-chart usage windows plus pi support."
- "Savings check (approximate is fine): add a done-criterion to the #100 leaf. Run the fixed chart-usage.ts on the base-red chart as the baseline (old: long-lived consultants) and on the #99/#100 charts as the new case (fresh consultants). Print, per seat, calls, average context per call, input/cache-read tokens, output and minutes side by side, plus the rough % change in average consultant context per call. ... The charts differ in size, so compare per call, not totals. Report the numbers. The check informs and never blocks a merge."

## Live surfaces
- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (Open: seat record; Autopilot), /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md (Blind peer exchange), /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md (seats.yaml)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/peer-ask.ts, peer-wait.ts, chart-usage.ts; tests: /home/ivan/Work/infra/akrogon/tests/chart-usage.test.ts, peer-ask.test.ts, peer-wait.test.ts, /home/ivan/Work/infra/akrogon/tests/fixtures/chart-usage/
- /home/ivan/Work/infra/akrogon/docs/guide/chart.md
- Real data: /home/ivan/Work/infra/akrogon/issues/chart/{base-red,loop-counts,failed-cause}/seats.yaml and base-red/USAGE.md; pi sessions under ~/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/; `herdr --help`, `herdr pane --help`, `herdr agent --help`

## Existing locks
- /home/ivan/Work/infra/akrogon/issues/chart/chart-peer-panes/forks/peer-panes.md Taken: "the door arranges only panes it creates and never moves supplied or unrelated panes."
- /home/ivan/Work/infra/akrogon/issues/chart/chart-cost/forks/proof-of-saving.md Taken (seat record, usage script, its done-criteria).
- /home/ivan/Work/infra/akrogon/issues/chart/peer-wait-harness/forks/turn-end-signal.md Taken.

## Task
Write a proportional territory map: the material forks for each issue (questions whose answer changes what gets built), questions a practitioner would ask, and pitfalls over the work's lifetime, including what each option could break or invite later. Ground each point in a file:line or command you ran. Say whether the two issues are independent or one depends on the other. Keep it compact: short bullets, no restating the intake.

Return file (write exactly here): /home/ivan/.claude/jobs/6a0d8d81/tmp/map/map-B.md
