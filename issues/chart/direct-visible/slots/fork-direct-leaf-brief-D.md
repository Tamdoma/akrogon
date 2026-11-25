# Fork notes brief: slot D, chart direct-visible, fork direct-leaf

You are slot D, a consultant to the chart door (slot A) in /home/ivan/Work/infra/akrogon. Work blind: do not read any other slot's file for this fork under /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/, and do not read that chart's forks/direct-leaf.md `## Findings` beyond what this brief gives.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (here: akrogon's src/ files and the chart-issues direct-route text). Name sections, never line ranges.

## Task

Write blind notes per question for the three questions in /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/forks/direct-leaf.md `## Question`, using its `### Carries` as locks. The note definition is /home/ivan/.claude/skills/chart-issues/assets/questions.md section `## Blind peer exchange` (the paragraph beginning "For the opening map"): five parts per question, the pick with reason and cost, each rejected option with reason, evidence with tier, source and date, pitfalls with what removes each, and any question the fork does not ask.

Permitted context: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/INTAKE.md, the fork file named above, /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/map-merged.md sections `## Shared facts` and `## direct-visible (#153)`, akrogon's source and tests (src/status.ts, src/state.ts, src/routing.ts, src/next.ts, src/reconcile.ts, src/phase.ts, src/land.ts, src/stop.ts, src/run-check.ts, src/seat.ts and their readers), skills/chart-issues/assets/direct-route.md, skills/chart-issues/scripts/direct-guards.ts, skills/broadcast-issue/SKILL.md, skills/implement-issue/SKILL.md and skills/check-issue/SKILL.md (direct sections), docs/use/quick-fix.md. Run no paid model launch and no command that writes to the repo or to any terminal; scratch work goes under /tmp/claude-1000 only and is deleted after.

Ground each pick in the code path it relies on: for Q1a name every command path that would start, prompt, rename, close, kill or count a seat or tab for a leaf (dispatch, allocate, reconcile, stop, renameTabs, status unnamedTabs, activeCount, broadcastPass) and what one field must stop there; for Q2a name what the land run needs from a leaf that the direct route does not provide today (plan, receipts, check.review slots, worktree adoption); for Q1b name what status would render and what the operator would still not see compared with a leaf row.

## Return

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/fork-direct-leaf-D.md, then run:

hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/slots/fork-direct-leaf-D.md"
