# Review brief: lane-first (slot D)

Chart: CHART.md, forks/design.md (picks 1-4 plus final shape corrections; checked by B and C), forks/signposts.md.
Worktree /home/ivan/.akrogon/worktrees/akrogon/lane-first, one commit 2dce5d47 on origin/main 814a2387.
- systemd/akrogon-land.slice CPUWeight=1000, linked only when the release ships it; land passes AKROGON_RUN_SLICE=runSlice('akrogon-land.slice'); verify pass uses runSlice('akrogon.slice').
- stop <leaf> also stops the leaf's live pass and run units (stopRunUnits, matched exported from stop-run.ts).
- akrogon.slice MemoryHigh=50%, MemoryMax=75%.
- next.ts: repo's merge waiters minus one count toward the repo cap only for unstarted leaves; both capRefusal callers pass the flag; message changed.
- reconcile.ts:1266 comment corrected.
Tests: four new, each shown failing without its change; verify 1379 pass.
Check: the CPU controller turning on inside akrogon.slice has no side effect on leaf work or the desktop; upgrade and rollback of the unit links on a live host; stop cannot hit another leaf's or another home's units; backpressure cannot block a resume, check.repair, a dependency chain or the landing leaf; memory percentages resolve as intended. Verdict ready or fix.
