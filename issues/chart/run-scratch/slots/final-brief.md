# Final-shape check: run-scratch design

Read /home/ivan/Work/infra/akrogon/issues/chart/run-scratch/forks/design.md, plus INTAKE.md and forks/seed-148-decision.md (locked: stop pile-up first, then RAM). Code: /home/ivan/.akrogon/worktrees/akrogon/k1-compile-cache (current main plus K1): src/run-check.ts (runRoot, keepRunRoot, constructedEnv), src/scope.ts startRunGuard, src/reconcile.ts run-root loop (~1150-1190), src/pack.ts, src/config.ts leafTempRoot and the machine config schema, src/verify.ts receipt rows.

One focused check, from a systems view aimed at fewest parts, any PC, and fast and predictable merges. Answer P-a to P-d with file:line facts. Name any concrete scenario where D1-D4 break a run, lose evidence, or leave residue. Say what you would cut or merge to make it smaller. Do not repeat points already settled in map-merged "After rebuttals".

Write to slots/final-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
