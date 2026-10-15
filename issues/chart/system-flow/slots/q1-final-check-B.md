Reviewed 23abf2f..d06306777ebd73145090778d9b3d8216c448dc05 in `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a`, 2026-10-15. Paths below are relative to that worktree.

F2 — The handoff exit still conflicts with automatic continuation. `skills/chart-issues/assets/shapes.md:293` says a successful handoff “ends at the printed footer without dispatch”; `skills/chart-issues/SKILL.md:127–134` describes that footer as ending the turn with no automatic pass. A door following this after handing off chart one can stop awaiting dispatch instead of starting chart two, contrary to the new `SKILL.md:47` and the operator's approved shape.
Repair: make successful handoff return to :47's next-chart selection, preserving the ban on lifecycle dispatch. Print the terminal footer only when the door actually needs to yield or has exhausted authorized work, not merely because one chart handed off.

Prior F1 resolved: `docs/guide/phases.md:104` now limits the live-run handoff to new or widened runs, matching `skills/check-issue/SKILL.md:79`.
Verification: repair diff inspected, `git diff --check` passed; no test-path changes or Test-Change trailers. No suites or lifecycle commands run.

Verdict: fix
