Operator 2026-10-13 ~20:30 local: "Why is everything taking so long?" / "it wasn't like this 2 days ago. These new merges seemed to have slowed down the system by a lot, I think." / "check with slot a and b".
A measured (20:31 local):
- akrogon.slice CPUQuota 1600%, CPUWeight 20 (merged 63ad6ea 10-13 12:56). cpu.stat nr_throttled 141955, throttled_usec 229943217591.
- Host busy 56% of 32 threads over 5 s (/proc/stat), so ~14 threads idle while the slice is throttled. Load 61/75/89.
- Per-leaf CPU over 10 s: framework/flaky-test-fixes 583%, pass-two-review-notes 529%, favicon-render 158%, technical-page-inventory 147%, coverage-unavailable-guard 83%, akrogon/memory-start-check 69%. ~1020 chrom processes.
- akrogon `test` check: 206 s normal; under load 982 s and 1454 s exit 1, base run 3340 s exit 1. Failures are 15 s timeouts in batch/merge tests (worker-test-duty implementation logs). wait_ms 200-334 s per check (4-lane stopgap).
Options A put to the operator: O1 remove CPUQuota, keep CPUWeight=20 (apps weight 100 win under contention), memory limits stay; O2 quota 2800%; O3 keep 1600% until framework browser fixes land. A recommends O1. It reverses ceiling-values 1a ("half the PC stays free"), whose reopen trigger (4a) is verify:core only.
Your task: write slots/cap-<slot>.md, max 12 lines: your pick and why, what each option could break (desktop responsiveness, heat, memory, flakes), any measurement that would change the pick, with path:line or command evidence. Blind: do not read the other slot's file.
