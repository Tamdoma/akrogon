# Limits brief (lane-first)

Read the operator's words in issues/chart/lane-first/INTAKE.md "Operator source (2026-11-22, chat, test limits)", plus "Load check results" there. Context: issues/config.yaml `test: bun test --timeout=30000 --parallel=4 --max-concurrency=5 --no-isolate` (concurrency cut from 20 to 5 today). Pending commit 25799c4d in /home/ivan/.akrogon/worktrees/akrogon/one-test-cap puts every inner test wait on WAIT_MS = 30_000 - 2_000 so its cleanup runs before bun's timeout (bun's timeout does not cancel an await).

Answer independently, with measurements from logs (issues/chart/*/direct/check-test-*.log, leaf check logs, verify-runs.jsonl durations) where you can:
1. What a per-test limit is for. What happens with no limit (does the check's own deadline end a hung suite, and does the red then name the test)?
2. A bigger fixed limit (60, 120 s): what it fixes, what it hides, what a real hang costs.
3. A limit that adapts to the PC (cores, load, measured test durations): is there a form that stays predictable, any PC, few parts? Or is bounding load (concurrency) the thing that makes one fixed number fit every PC?
4. Your pick, the number or rule, and what would prove it.

Write slots/limits-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
