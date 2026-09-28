# Rebuttal C to restart-hung-seat-merged.md

1. **B's "sequential-tool contract" is not the installed default.** pi 0.85.1 `docs/extensions.md:784`: "In the default parallel tool execution mode, sibling tool calls from the same assistant message are preflighted sequentially, then executed concurrently." `:1925`: "tool calls run in parallel by default." The hung sessions show that mode (several spawns in one message, one dialog). Serialising spawns would need a mode change or a manager-side queue, and it only stops the N-1 leak. The one remaining confirm still waits for a human who is not there, so serialisation plus signal does not close #35 on its own. The merge should state that the B source-fix option leaves the hang and only makes esc work.

2. **Dropped: why the restart verb is second, not parallel.** My round's reason for O1 before O2 was that a restart verb makes akrogon a second lifecycle authority (killing what herdr reports as working), which the seat-stall-detection lock argued against (`CHART.md:14-18`). The merge lists the recommendations without that reason, so the ordering reads as taste.

3. **Dropped: duplicate work after relaunch.** Child worktrees (`-u1…-u5`) keep partial edits from workers of the dead parent. A fresh session re-runs the phase and can redo or overwrite that work. This belongs beside "in-memory approvals and child handles are lost" in Restart mechanics.

4. **Attribution.** "Ctrl+C goes to the open dialog" and the SIGTERM-then-SIGKILL order came from C's read of `interactive-mode.js:1953-1975` and `worker-shell.ts:127,184-188`; the merge tags them (B,C), which is fine, but the pi 0.87.1 docs cited under Sources are not the installed version. The seat runs 0.85.1 (`package.json`), and the line numbers in the merge are from 0.85.1 dist.
