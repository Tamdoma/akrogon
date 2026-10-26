# Map A (written before reading B and C)
Data: issues/timings.jsonl (2026-10-13..25), suite log remove-plan-debate merge run 2026-10-25.
- A1 full `test` check: 403 runs, 133 red, median 137s, recent green 190-235s, 16.2h total. Dominant cost of every phase.
- A2 suite shape: 1167 tests, 69 files, wall 196.5s, summed test time 1427s. bunfig concurrentTestGlob on all files.
  Slowest: worktree-store 7 tests 200s (one 28.5s), peer-wait 37 tests 199s with 16 tests at ~11.1s each (real 10s grace sleep), next.test 246 tests 512s, two 10.2s discovery-deadline tests.
- A3 plan.synthesis full-suite runs: 62 runs, 49 red (red-first proof). A targeted run would do; `test_changed` exists (28 runs).
- A4 red runs: 133 of 403; red-records show host-load timeouts (load 130-175) on markdown-only diffs.
Pick (tentative): make real-time waits in tests injectable (peer-wait grace, discovery deadline) to cut suite wall time; needs per-file wall measurement to prove >=20%.
