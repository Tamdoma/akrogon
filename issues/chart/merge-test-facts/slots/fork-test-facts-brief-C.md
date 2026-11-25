# Fork notes brief: slot C, chart merge-test-facts, fork test-facts

You are slot C, a consultant to the chart door (slot A) in /home/ivan/Work/infra/akrogon. Work blind: do not read any other slot's file for this fork under /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/slots/, and do not read that chart's forks/test-facts.md `## Findings` beyond what this brief gives.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (here: akrogon's src/ files and real framework logs). Name sections, never line ranges.

## Task

Write blind notes per question for the four questions in /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/forks/test-facts.md `## Question`, using its `### Carries` as locks. The note definition is /home/ivan/.claude/skills/chart-issues/assets/questions.md section `## Blind peer exchange` (the paragraph beginning "For the opening map"): five parts per question, the pick with reason and cost, each rejected option with reason, evidence with tier, source and date, pitfalls with what removes each, and any question the fork does not ask.

Permitted context: /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/INTAKE.md, the fork file named above, /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/map-merged.md sections `## Shared facts` and `## merge-test-facts (#154)`, akrogon's source (src/verify.ts, src/flaky.ts, src/run-check.ts, src/attempts.ts, src/land.ts, src/verify-pass.ts and their readers), framework's issues/verify-runs.jsonl and issues/merge-attempts.jsonl at /home/ivan/Work/infra/tamdoma/framework, and any framework verify log still on disk. Run no paid model launch and no command that writes to either repo; scratch work goes under /tmp/claude-1000 only and is deleted after.

Ground the duration questions in measured sizes (row bytes, rows per day by scope, how readers load issues/verify-runs.jsonl) and in Bun's real output lines for pass, fail and timeout (version-specific, observed, not guessed).

## Return

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/slots/fork-test-facts-C.md, then run:

hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/slots/fork-test-facts-C.md"
