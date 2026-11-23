# Final-shape check: land-own-reds design Q4

Read /home/ivan/Work/infra/akrogon/issues/chart/land-own-reds/INTAKE.md section "Agent findings (A, 2026-11-22)" and forks/design.md section "Addition Q4". Code: akrogon repo at /home/ivan/Work/infra/akrogon (src/config.ts leafTempRoot, src/land.ts launchLand, src/run-check.ts constructedEnv, src/reconcile.ts reconcileHost stray sweep). The #151 implementation is in worktree /home/ivan/.akrogon/worktrees/akrogon/land-own-reds commit 8b97c7d8 (leafSlice with home).

One focused check, systems view: is the mechanism right, and does the Q4 pick remove the whole class (any home touching another home's temps or slices) with the fewest moving parts? Name a concrete scenario where it fails, or say it holds. Also say if any other shared host name (units, locks, runs/) has the same gap.

Write to slots/q4-check-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
