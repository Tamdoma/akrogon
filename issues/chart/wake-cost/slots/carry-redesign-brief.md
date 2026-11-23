# Focused check: wake-cost wait carry across releases

Worktree /home/ivan/.akrogon/worktrees/akrogon/wake-cost: release 1 dfef3d2e, release 2 d5a2b917. D round 2: slots/review-D-wake-2.md (F5 rollback strands waiters past the per-repo marker, F6 typed next writes a fresh wait before the carry, F7 failed timings read still writes the marker).

A's proposal, replacing carryWaits and its marker:
1. In release 2, state.wait absent means "unknown", not "never visited". Wherever release 2 needs a leaf's wait (recordWait, refill, first-visit check), an absent wait is imported for that leaf alone from timings.jsonl: its last wait/prompt row (prompt = none); no rows = never visited, so visit_start is written and wait set to none. A failed timings read writes nothing and the wake skips that leaf (retry next wake).
2. Release 1 deletes state.wait on a leaf whenever it appends a wait row, so after a rollback the timings rows are the truth and release 2 re-imports them. Deleting the key keeps release 1's state readable by 814a2387.
3. Cost: one timings read per leaf with absent wait (each open leaf once after upgrade, each new leaf once at first visit); none in steady state.

Reply only a concrete break with file:line, or "ok".
