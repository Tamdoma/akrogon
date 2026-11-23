# Review brief: paid-budget (slot D)

Chart: CHART.md, forks/seed-152-decision.md (locked, with operator correction), forks/signposts.md (locked; 2 and 3b), forks/design.md (picks 1-10 and final shape corrections, checked by B and C).
Worktree /home/ivan/.akrogon/worktrees/akrogon/paid-budget, one commit b1d7942e on origin/main 814a2387 (35 files, +87/-852).
- Deleted src/budget.ts, paid_budget key, --sessions, budget.jsonl/budget.lock; nested non-inheritance test moved into tests/run-check.test.ts.
- Budget now passed by the seat inside the command (env AKROGON_SESSIONS/AKROGON_SESSION_MINUTES for akrogon's e2e); repo config still may not set them.
- Skills: lifecycle-rules budget rule (first guess from <main checkout>/issues/timings.jsonl, generous, budget stop raises and reruns with no operator, only when the :11 floor is not met, no-progress stop is red), check-issue :31/:69, implement/plan wording, chart-issues needs row and standing grant entry, watch consultant brief, docs.
- Host config still has paid_budget; A deletes it before push (strict schema).
Check: the prose rules are unambiguous and match the design (a seat can tell a budget stop from a red, cannot loop forever, no operator ask remains for money/usage); no live reader of the deleted parts remains; old state or ledgers do not break any command; tests prove the kept guards; anything the deletion missed. Verdict ready or fix.
