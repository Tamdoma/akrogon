# Fork round (blind peer): repair-authority Q1

Work blind: do not read any other file in this slots folder except this prompt. Ask no questions. Edit no repo file except your output.

Read: `issues/chart/reviewer-repair/INTAKE.md` and `issues/chart/reviewer-repair/forks/repair-authority.md` (Question, Carries, operator correction). Related forks: `forks/operator-only-exit.md`, `forks/round-budget.md`. Locks: `issues/chart/realistic-fix-bar/`, `issues/chart/seat-role-swap/`.

Already answered by the operator: B may repair first-review findings after both blind verdicts are recorded (2a), and no second reader checks B's repair; tests, checks and merge checks gate it (3a).

Research and answer, as one full independent round:
1. Recent akrogon repairs: from `issues/log.jsonl` and `issues/closed/**/review-B.md`, list the repairs since 2026-09-25, what each Fix was (failing test, wrong command, docs, missing unit...), its size, and how long the trip to A and back took. Which would a wider rule let B fix, and what percentage of repair trips would each candidate rule remove?
2. Candidate rules for Q1 from narrowest to widest, for example: bounded (local, reproduced, no plan change, no live run, no operator permission); every Fix except plan/design changes, missing units and operator-only items; all Fixes. Give the measured share each removes in akrogon and in framework (`/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl`).
3. Self-preference / self-repair bias: what research says about a strong model repairing and judging its own fixes, and anything specific to GPT-6.1 Sol or recent OpenAI models (system cards, evals, practitioner write-ups). Separate "self-preference when judging" from "self-repair quality given external test feedback". Name sources with URLs and dates read; model knowledge only with the searches that found nothing stronger. Say plainly what can and cannot be confirmed.
4. Your recommended option for Q1 with its pitfalls, grounded in file:line.

Write the result to: OUTPUT_PATH
