You are a consultant to chart door A (hc t126). Blind note: do not read another slot's file in /home/ivan/Work/infra/akrogon/issues/chart/repo-caps/slots.

Read /home/ivan/Work/infra/akrogon/issues/chart/repo-caps/INTAKE.md. Inspect src/next.ts (activeCount, allocate, and how dispatch picks which waiting leaf to start next), src/config.ts and docs/reference for the repo config (issues/config.yaml) in ~/.akrogon/worktrees/akrogon/land-hold.

Answer in at most 40 lines:
1. Per-repo cap: where the key lives, how it combines with the global cap, and what it breaks or invites later.
2. The operator's priority idea (repo config number, lower = first, like WordPress hook priority). Is it feasible, is it needed, and what does it do to the operator's mental load? Challenge it. If a simpler, warmer option removes the need (for example oldest-waiting-first plus caps alone, or something else), propose it with the reason.
3. Today's dispatch order across repos when a slot frees, with file:line.
4. Your recommended shape in one paragraph.

Write /home/ivan/Work/infra/akrogon/issues/chart/repo-caps/slots/caps-<your letter>.md, then: hc send t126 "done <letter>: <path>"
