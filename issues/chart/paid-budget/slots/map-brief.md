# Map brief: paid-budget (Tamdoma/akrogon#152)

You are a consultant. Read only, change nothing in the repo. Write your own map before seeing anyone else's.

Read: INTAKE.md (the #152 report), forks/seed-152-decision.md (locked, with the operator's correction), forks/signposts.md (locked answers: 2 and 3b matter most).
Code on main /home/ivan/Work/infra/akrogon: src/config.ts paid_budget, src/run-check.ts --sessions and reserve, docs/reference/limits.md, docs/reference/config.md, skills/lifecycle-rules.md "Grant reuse and paid sessions", skills/check-issue/SKILL.md:31,69, any other reader of paid_budget or budget.jsonl (grep). Also the closed ai-budgets chart: issues/chart/ai-budgets/forks/.

Locks: no stored session or minute cap; the seat picks each paid test's budget; a budget failure makes the seat raise it and rerun with no operator; no live subscription-usage check; be generous; per 3b the same holds for paid launches and nested runs (no operator approval for money/usage limits). Safety caps against host overload stay.

Answer, with file:line for each claim:
1. Every place that reads, enforces or documents a paid/nested/session budget or an approval for one, and what each becomes under the locks (delete, keep, change).
2. What "a budget failure" is concretely (which error, exit, or timeout tells the seat its budget was too small vs the test being red), and the simplest way a seat raises and reruns.
3. How the seat makes its first guess precise: what record of past paid runs exists (budget.jsonl fields) and the smallest change that lets a seat read it.
4. What could break or invite later (runaway reruns, review's budget comparison at check-issue :69, old ledgers parsing).
5. Your recommended shape in the fewest parts, and the open forks you see (each with options and your pick).
Keep it under 80 lines. Write slots/map-<your slot letter>.md in this chart folder.
