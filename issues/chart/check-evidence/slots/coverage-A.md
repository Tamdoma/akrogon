# Slot A notes: log-coverage

## Q1 pick: pack the chart's direct folder with the same pack function when the direct route lands or is held
Reason: one storage rule for every check log; the direct folder is the chart's only check evidence and B's review cites it. Cost: the direct landing and abandon steps (chart-issues SKILL.md:85,102-111) call the pack, since no command moves a chart folder. Sizes are small: akrogon's five direct folders hold 8-18 files, 116 KB to 2.2 MB each.
Rejected: committed plain (breaks the one-rule shape from the taken fork and keeps growing per chart); ignored and host-only (the only evidence of a direct landing would vanish on clone).
Evidence: `ls issues/chart/*/direct` in akrogon, 2026-10-15; direct route text chart-issues SKILL.md:102-111.
Pitfall: a chart that ends Handed off with an aborted direct attempt keeps plain logs: pack on every chart end marker, not only Closed.

## Q2 pick: every check output goes through run-check
Reason: one writer and one name rule; `akrogon log`, flaky and the pack only need to know one shape. Cost: skill text in implement, check and merge says "run it with `akrogon run-check <name> -- <cmd>`" for any proof command.
Rejected: keep hand-saved logs (still packed at close, so size is fine, but names and contents vary and the open-time ignore covers only `*.log`).
Question: do hand-saved logs hold anything run-check cannot capture (worker output, interactive runs)?
