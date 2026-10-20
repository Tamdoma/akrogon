# Fork notes brief: merge-stacks / best merge design, no locks (slots B and C)

Work read-only. Do not edit any repo file except your return file.

## Reading rule

Read process text (skills, guides, AREA.md files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. The merge code (/home/ivan/Work/infra/akrogon/src/batch.ts, attempts.ts, next.ts merge turn, phase.ts merge paths, verify and receipt code, turn.ts, the merge-issue skill) is the subject of the work, so read what you need in full.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/INTAKE.md
- Your earlier notes and the merged notes: slots/stack-fate-B.md, stack-fate-C.md, stack-fate-merged.md (under /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/)

## Operator words, verbatim (2026-10-19)

"Is merging one at a time the only real option? be honest with me."

"Okay, say say I didn't rule anything out. What would be the best possible solution? Consult with the consultants and tell e this is very important to me. If I'm stuck with only one at a time merge, that's fine, but I need to find something faster that is just as precise and as good. So do some deep research on this without me imposing any rules or restrictions. Of course consult with both consultants."

## Locks

None for this question. The operator lifted every 2026-10-15 stacked-turn foreclosure (caps, bisection, culprit finding, speculative or parallel trains, batch sizes) for this research. Keep the outcomes that matter: main never gets a commit that failed the configured checks, and every landed leaf is checked against the base it lands on (state plainly if an option weakens this and by how much).

## Current question

What is the best way for akrogon to land leaves on main faster than one-at-a-time solo merges, while staying just as precise? Or is one-at-a-time already the best, and the speed must come from making each turn cheaper?

## Task

Deep research, five parts per /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the paragraph starting "After all finish" does not apply to you). Cover both:

1. Where the solo merge time and its 24% red rate go. Measure from the framework repo (/home/ivan/Work/infra/tamdoma/framework): issues/merge-attempts.jsonl, issues/timings.jsonl, its akrogon config (`checks`, `merge_checks`, `merge_covers`), verify logs or receipts kept in closed leaves, and a sample of solo red merges' review-B.md under issues/closed with their red cause (real interaction with new main, flaky test, load, trailer refusal, mechanical generator output, other). Split a solo turn's minutes into agent time, rebase, verify commands (which ones dominate) and push. Say what a leaf already proved at check that merge proves again.
2. Every design that could be faster at the same precision, with no rule excluded. At least consider: bisection or splitting a failed batch; small or adaptive batch sizes (sized from the measured red rate); speculative parallel prefixes (Zuul, GitHub merge groups); verifying the next holder in parallel on the predicted top; reusing check receipts when the rebase onto new main does not touch what the tests read (test impact or change-set disjointness, Bazel/Buck style caching, Nx affected); running only merge-only checks when the leaf's check receipt covers the same tree content; cutting the agent seat out of a green merge turn entirely (a command-only merge); cheaper verify by caching or splitting the slowest commands; flaky-test quarantine. For each: expected minutes per landed leaf on this repo's measured numbers, the precision cost, what code it adds or deletes, and what it could break later.

Practitioner sources first (engineers who run these queues: GitHub, Uber SubmitQueue paper, Google TAP/presubmit, Shopify, Rust bors/homu, Chromium CQ, OpenStack Zuul, Mergify, Aviator, Trunk, Graphite), with URL and date read. Name the best design you would build and its estimated drain time for an 11-leaf queue, against today's solo-only.

## Return

- Slot B: /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/slots/best-merge-B.md
- Slot C: /home/ivan/Work/infra/akrogon/issues/chart/merge-stacks/slots/best-merge-C.md
