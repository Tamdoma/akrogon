# Focused check: load-caused test failures and the host-wide line

Read issues/chart/lane-first/INTAKE.md (especially the operator source and F-load at the end), CHART.md, and the code in /home/ivan/.akrogon/worktrees/akrogon/land-own-reds (current main plus land-own-reds): src/admission.ts, src/scope.ts, src/verify.ts, src/run-check.ts, issues/config.yaml, bunfig.toml, tests/isolation.ts, tests/hc-fixture.ts.

Answer from a systems view, aiming for the fewest parts, any PC, and fast, predictable merges. Give file:line facts and measure on this host where you can (e.g. run one test file at different `--parallel` and concurrency settings while noting load).

1. Q-a. What removes the load-timeout failure class entirely, not just raises a number? Consider: suite parallelism and in-file concurrency (concurrentTestGlob), tests waiting on events with the clock only as a cap, host CPU weights (the current lane-first destination), and a host-wide cap on concurrent heavy runs. Which one change gives the most, and what does each break?
2. Q-b. The operator asks: if everything waits in one line across the whole PC, what happens, and is per-repo better? Today only per-repo `full` runs queue. Compare (i) per-repo only, as today, (ii) one host-wide line, (iii) per-repo lines plus a host-wide cap of N heavy runs sized from the host (cores/RAM). Use concrete scenarios: an 11-min framework suite queued ahead of a 4-min akrogon land, two seats' leaf verifies, a land waiting behind leaf work, a different PC with 8 cores.
3. Q-c. Does the current lane-first destination (CPU weights, host-relative memory, merge waiters hold back new starts) still fit after Q-a and Q-b, or should it change?

Write slots/load-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
