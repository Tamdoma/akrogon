# Focused check: look final shape

You are a consultant seat (letter in the one-line prompt). Work alone. Edit no file except your return file. Do not contact the operator. Read-only commands only; do not send text to any terminal except the final line.

Read /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final.md against INTAKE.md "Round 5" and "Round 5b" and the earlier settled points it may conflict with ("Round 3"/"Round 3b" Tasks, "Round 4" and slots/files-changes-final.md panel width and open/close routine, slots/tasks-panel-final.md). Return only defects: a line that contradicts an operator answer, a [CHANGED] line that breaks something, a conflict with an earlier settled point, a dropped requirement, or an API the shape relies on that does not exist (check /home/ivan/.config/herdr-app/herdr.d.ts and gpui-kit.d.ts), each with evidence (path:line). If none, write "No defect."

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final-check-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final-check-<YOUR LETTER>.md"
