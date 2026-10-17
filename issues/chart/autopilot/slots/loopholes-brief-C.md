# Brief for slot C: leaf review and intent loopholes

Revision: akrogon main f7baddc. Read only; write nothing except your return file.

## Context
The chart is /home/ivan/Work/infra/akrogon/issues/chart/autopilot. All forks are taken (CHART.md, forks/*.md, INTAKE.md). The operator approved the handoff with this reply, verbatim:
"1a | Think deeper and consult with slot B and C. Is there anything else we need to discuss? Try to find the loopholes in the plan where the intent is not completely discussed. I need you to come to the same conclusion as I do. It's okay if there are no unknowns left."

Draft leaves (one issue, two parallel leaves): /home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/autopilot/ (ISSUE.md, autopilot-mode/, any-consultants/, each with brief.md, design.md, readiness.yaml, state.yaml).
Skill under change: /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md and assets/ (questions.md, shapes.md, standing-design.md). Operator values: your harness's global instructions file.

## Task
Two parts, in one return file. Work independently; do not read slots/loopholes-A.md or the other peer's file.

1. Leaf review as the implementer of each draft: disagreements only, each with evidence (file:line) and the fix you propose. A criterion you could not prove, a binding decision missing or misquoted, an ownership gap, or a claim about existing code that is wrong.
2. Intent loopholes: walk today's chart-issues process (SKILL.md Open, Drain, Take, Handoff, Direct route; questions.md peer exchange) as an autopilot door with no human present. List each point where the operator's recorded answers (forks Taken, INTAKE.md) do not yet decide what the door does, or where the door would stall, end its turn waiting for the operator, or take an outward or main-branch action the operator did not clearly authorize. For each: the point (file:line), what the drafts say now, your proposed resolution, and whether it follows from a recorded answer (cite it) or needs the operator to decide. Prefer resolutions that remove the gap rather than add rules. "No gap" is a valid answer.

## Return
Write to /home/ivan/Work/infra/akrogon/issues/chart/autopilot/slots/loopholes-C.md and end the file with the line `END loopholes-C`.
