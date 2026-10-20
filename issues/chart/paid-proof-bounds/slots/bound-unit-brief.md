# Fork notes brief: paid-proof-bounds / bound-unit (slots B and C)

Work read-only. Do not edit any repo file except your return file.

## Reading rule

Read process text (skills, guides, AREA.md files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. The skills this fork changes (chart-issues with assets/shapes.md, implement-issue, check-issue, plan-issue, merge-issue under /home/ivan/Work/infra/akrogon/skills/) are the subject of the work, so read the relevant sections in full.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/INTAKE.md
- Chart: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/CHART.md

## Current question

What does the bound count (attempts, sessions) and who sets it per leaf?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Operator 2026-10-19, verbatim: "One thing is, during my initial prompting and charting, I told it to use clawed P because that's where the framework is being run inside of clawed code. aybe I shouldn't have done it in the first place. I just want to make sure that we don't spend so many tokens on these tests."
- Taken forks, settled, read their Taken sections:
  - /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/forks/limit-mechanism.md (1a 2a)
  - /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/forks/fresh-run-need.md (1a 2a)
- Merged notes with open points for this fork: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/limit-mechanism-merged.md (Pitfalls: parallel seats; Open questions: who raises an exhausted bound) and /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/fresh-run-need-merged.md.

## Locks

- The two Taken sections above.
- issues/chart/proof-cost/forks/proof-run.md, Taken (operator 2026-10-10): the handoff live-run estimate is information only; no enforced budget, timer or numeric gate.
- issues/chart/leaf-run-stalls Off route: no clock, watchdog or elapsed trigger.

## Task

Write blind notes for this one question: your own position. Use the five parts in /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the paragraph starting "After all finish" does not apply to you). Settle: the unit the grant's bounds counts (launch, session, attempt of a named proof, or something else) so that splitting one proof into many small launches cannot dodge it and a runner that fans out many sessions is covered; who writes the number and when (door at charting, operator at handoff review); how parallel seats (A, workers, B in check.repair, merge) share one total without new state; how an exhausted bound is raised (one named action); and whether readiness.yaml grantSchema needs any change or the free-text bounds is enough. Prefer removing text over adding. Research outside the repo for how practitioners express per-task model-call budgets for agents, with URL and date read. Say which sentences change where.

## Return

- Slot B: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/bound-unit-B.md
- Slot C: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/bound-unit-C.md
