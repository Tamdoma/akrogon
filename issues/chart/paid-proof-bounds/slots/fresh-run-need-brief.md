# Fork notes brief: paid-proof-bounds / fresh-run-need (slots B and C)

Work read-only. Do not edit any repo file except your return file.

## Reading rule

Read process text (skills, guides, AREA.md files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. The skills this fork changes (chart-issues with its assets/standing-design.md, implement-issue, check-issue, plan-issue under /home/ivan/Work/infra/akrogon/skills/) are the subject of the work, so read the relevant sections in full.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/INTAKE.md (report #107 verbatim and the operator's words)
- Chart: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/CHART.md

## Current question

When must a proof pay for a fresh live run instead of reusing the last real run's saved output?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/map-merged.md, section "#107". Its line "Removal side: apply standing-design's cheapest-sufficient and recorded-replay rules so fewer fresh paid runs are needed at all (B,C)" is the starting point.
- Taken fork: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/forks/limit-mechanism.md, section Taken (operator 2026-10-19, 1a 2a). Treat it as settled.

## Related forks in this chart (question only, not yet asked)

- /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/forks/bound-unit.md

## Locks

- limit-mechanism Taken (above): written grant rule, one lifetime total, no counter, no --max-budget-usd guard, no provider-side hard stop now.
- issues/chart/proof-cost/forks/proof-run.md, Taken (operator 2026-10-10): live-run cost in the handoff review is information only; foreclosed "any enforced budget, timer or numeric gate (locked)".
- issues/chart/leaf-run-stalls Off route: no clock, watchdog, elapsed trigger or numeric size gate.
- Operator split answer 2026-10-18: 4a, framework replay stage resume is not charted now; 3a, the two flaky tests are out.

## Operator corrections, verbatim

- 2026-10-18: "We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- 2026-10-19: "1a | 2a |" (limit-mechanism).

## Task

Write blind notes for this one question: your own position, not a review of anyone else. Use the five parts defined in /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the paragraph starting "After all finish" does not apply to you). Look at the 2026-10-18 framework leaves named in INTAKE.md (hub-child-links, replay-cases) and say which of their paid reruns a saved real run would have answered, and which needed a fresh run. Check whether standing-design's existing cheapest-sufficient and recorded-replay rules already cover this and only fail to reach implement/check reruns, before proposing new text. Research outside the repo: how practitioners test LLM-calling pipelines with recorded responses (record/replay, cassettes, golden outputs), practitioner tier first, with URL and date read. Say concretely which sentences in which skill sections change under your pick, and what text gets deleted.

## Return

- Slot B: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/fresh-run-need-B.md
- Slot C: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/fresh-run-need-C.md
