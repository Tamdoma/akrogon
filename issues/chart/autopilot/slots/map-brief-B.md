# Opening map brief, slot B (chart: autopilot)

You are slot B, a charting peer for the chart-issues door (A runs the door in pane w8:pNP). This is the blind opening map: A is writing its own map at the same time and you will not see it until both finish. Do not edit any file except your return file.

## Task
Write an independent territory map for the work described in the intake: an opt-in "autopilot mode" for akrogon that the operator can switch on so agents chart work automatically (decide at the points where the operator would decide) and start the akrogon lifecycle, with the operator able to switch it off. Default stays attended.

The operator says they tried full autopilot several times over the past ~3 months while rebuilding this system from scratch, and every attempt failed. Research that history yourself (git history of /home/ivan/Work/infra/akrogon and earlier systems, issues/chart/*, learnings/, and session transcripts under ~/.claude/projects, ~/.codex/sessions, ~/.pi/agent/sessions; grep first, read only the relevant parts). Name what failed and why, with refs.

The map covers, proportional to the work:
1. Material forks: each question whose answer changes what gets built, with 2-3 options, what each could break or invite later (not only now), and your pick with reason and cost.
2. Practitioner questions: who has run unattended agent or automation loops at scale and what they found (named people or teams, primary sources with URL and date; say when you found nothing stronger than model knowledge).
3. Pitfalls over the work's lifetime and what removes each.
4. Existing locks the work collides with, with path:line.
5. Fog: material work whose question you cannot state precisely yet.
6. A proposed split into leaves or direct items by destination, and what is off route.

Use evidence tiers: operator (sources folder, intake), practitioner, better-than-training (code, docs, measured results; cite path:line), model-knowledge (only with the searches that found nothing better).

## Intake
/home/ivan/.claude/jobs/6a0d8d81/tmp/autopilot/intake.md

## Live surfaces (start here, not exhaustive)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md and assets/questions.md, assets/shapes.md
- /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md
- /home/ivan/Work/infra/akrogon/src/ (dispatch: src/next.ts; config), docs/guide/*.md, docs/reference-index.md
- /home/ivan/Work/infra/akrogon/learnings/LESSONS.md
- Charts: issues/chart/night-flow, issues/chart/overnight-recs, issues/chart/seat-stall-detection, issues/chart/direct-mode, issues/chart/state-cutover, issues/chart/temp-release, issues/chart/run-release

## Existing locks to check (verify each yourself)
- skills/chart-issues/assets/questions.md:31 "Recommendations and silence cannot supply an operator answer."
- skills/chart-issues/SKILL.md:3, skills/learn-issues/SKILL.md:3 "Operator-invoked only"; skills/watch-issues/SKILL.md:3 "started and stopped only by the operator".
- issues/chart/seat-stall-detection (forks/stall-detection.md): "no hidden watchdogs, clocks or polling", systemd user timer foreclosed.
- issues/chart/night-flow/forks/keep-running.md Taken: the watch is an informal habit nothing depends on.

## Return
Write your map to exactly: /home/ivan/.claude/jobs/6a0d8d81/tmp/autopilot/map-B.md
Keep it under ~2500 words. End the file with a line `END map-B`.
