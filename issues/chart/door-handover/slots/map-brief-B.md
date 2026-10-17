# Opening map brief, slot B

You are slot B, a consultant for the chart-issues door. Write your own independent territory map for this chart. Do not read any other file under /home/ivan/Work/infra/akrogon/issues/chart/door-handover/slots/ except the probe files named below, and do not edit anything except your return file.

Intake: /home/ivan/Work/infra/akrogon/issues/chart/door-handover/INTAKE.md

Live surfaces (source; installed copy at /home/ivan/.claude/skills/chart-issues is identical):
- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (sections Open, Handoff, Autopilot, Printed footer)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md (Mode record, Autopilot shapes)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md (blind peer exchange)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/peer-restart.ts (consultant restart at chart entry) and its tests under /home/ivan/Work/infra/akrogon/tests/
- /home/ivan/Work/infra/akrogon/docs/guide/chart.md (Autopilot section)
- Probe evidence from 2026-10-17 (claude, herdr 0.9.1, throwaway pane): /home/ivan/Work/infra/akrogon/issues/chart/door-handover/slots/probe-handover.sh, probe-log-self.txt (self-run: the claude ran the helper against its own pane), probe-log-external.txt (first run, failed with agent_name_taken)
- Operator permission state: /home/ivan/.claude/settings.json permissions (allow rule `Bash(bun /home/ivan/.claude/skills/*/scripts/*)` was added for this; defaultMode auto)
- herdr CLI: `herdr agent --help`, `herdr pane --help`

Locks: none. No open leaf touches these files. Constraints from the operator: every change minimal, the whole system kept working, attended (manual) mode works exactly as today, same pane structure after the handover.

Write a proportional territory map: the material forks (each with options, what each could break or invite later, and your pick with reason), questions a practitioner would ask, pitfalls over the work's lifetime and what removes each, and anything you would rule off route. Cite file:line for claims about this repository.

Return file (write exactly here): /home/ivan/Work/infra/akrogon/issues/chart/door-handover/slots/map-B.md
