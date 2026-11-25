# Leaf review brief: slot D, chart direct-visible, leaf direct-leaf

You are slot D, a consultant to the chart door (slot A, terminal t126) in /home/ivan/Work/infra/akrogon.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (here: akrogon src/ and tests/ files and the skills the leaf names). Name sections, never line ranges.

## Task

Read the leaf draft as its implementer would: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/leaf-draft/ISSUE.md and /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/leaf-draft/direct-leaf/{brief.md,design.md,readiness.yaml,state.yaml}. The binding decisions are /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/forks/direct-leaf.md `## Taken` (A's pick under full autopilot; do not reopen them). Shape rules: ~/.claude/skills/chart-issues/assets/shapes.md `## Leaf files` and `## Preflight and validation`; standing design: ~/.claude/skills/chart-issues/assets/standing-design.md. The leaf is blocked by issues/open/seat-turn-idle/shell-sweep (read its brief for the sweep).

Report only defects: a done-criterion that cannot be met within the owned surfaces, a criterion naming a test file or count or claiming repo health, a binding decision with no home or a contradiction between brief, design and Taken, a pre-existing part a criterion rests on that no proof or code read reaches, a consumer of changed state the design misses (file and function), or a step that would touch `issues/`. Restatements need no line. Run no paid model launch and no command that writes to the repo or to any terminal.

## Return

Write your review to /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/leaf-review-D.md, then run:

hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/leaf-review-D.md"
