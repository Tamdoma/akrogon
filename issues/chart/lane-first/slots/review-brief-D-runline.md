# Review brief D: run-line-ux

You are slot D. Review origin/main..HEAD in /home/ivan/.akrogon/worktrees/akrogon/run-line-ux (one commit). Operator asked in chat for the status run line to read clearly as one line per repo ("Make the display actually have better UX so I know what's happening there"). The old table repeated the repo per row and stacked into 5-line entries in narrow panes.

Look for concrete defects only (wrong order, wrong numbering, a state shown wrongly, a JSON consumer that parsed the old table). Run only: `bun test --timeout=30000 --max-concurrency=5 tests/status.test.ts tests/status-json.test.ts`.

Write slots/review-D-runline-1.md: `Verdict ready|fix`, base and head, numbered findings with file:line and a scenario. Then run: hc send t126 "done D: <path>"
