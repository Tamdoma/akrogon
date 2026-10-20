# Fork notes brief: merge-stacks / stack-fate (slots B and C)

Work read-only. Do not edit any repo file except your return file.

## Reading rule

Read process text (skills, guides, AREA.md files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. The code this fork changes (/home/ivan/Work/infra/akrogon/src/batch.ts, src/attempts.ts, the merge turn in src/next.ts, src/turn.ts, src/state.ts batch fields, and the merge-issue skill) is the subject of the work, so read it in full.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/INTAKE.md (report #104 verbatim and the operator's words)
- Chart: /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/CHART.md

## Current question

Delete member stacking (holder-only merge turns), or keep it and stop re-stacking an unchanged red head after main moves?

### Carries

- Operator 2026-10-18: "We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/map-merged.md, section "#104 merge stacks".
- Framework data: /home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl (267 attempts at 2026-10-18 12:40Z; 51 with members: 4 merged, 46 red, 1 ejected).

## Locks

- /home/ivan/Work/infra/akrogon/issues/closed/merge-batch/stacked-turn/design.md, Binding decisions (operator 2026-10-15): all-or-holder batching; red-skip per (head, base); "No caps at all", "I dont want any slowdowns", "Simplest systemic solution, always work towards simplicity, even removing code if necessary". Foreclosed there: bisection, a culprit command, any stack-size cap, speculative trains, waiting for a stack to fill. Either option here reopens part of that decision; say which part.

## Task

Write blind notes for this one question: your own position. Use the five parts in /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the paragraph starting "After all finish" does not apply to you). From merge-attempts.jsonl, measure: how much wall time stacks cost in total and per landed leaf, how many leaves stacks actually landed versus solo turns that would have landed them, and how often the same head was re-stacked red after main moved. Say what code and state are deleted under removal (files, functions, state fields, skill text) and what each option could break later. Research outside the repo: how merge queues (GitHub merge queue, bors, Zuul, Mergify) batch and handle a failed batch, practitioner tier first, with URL and date read.

## Return

- Slot B: /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/slots/stack-fate-B.md
- Slot C: /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/slots/stack-fate-C.md
