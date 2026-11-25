# Fork notes brief: display-env, slot B

You are slot B, a consultant for the chart door (slot A) charting Tamdoma/akrogon#155 in the akrogon repo (/home/ivan/Work/infra/akrogon). Write blind notes on one fork. You have not seen and must not read any other slot's notes.

## Task

Answer both questions in `## Question` of /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/forks/display-env.md, including its `### Carries`. Read that section only. Do not read that file's `## Findings` section or any file under /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/slots/ other than this brief.

Return one note per question with the five parts defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md § Blind peer exchange (the paragraph starting "For the opening map"): the pick with its reason and cost; each rejected option with its reason; the evidence with tier, source and date; the pitfalls with what removes each; and any question you would ask that the fork does not ask. Also name the leaf's done-criteria you would write (observable results, never a test file or count) and the cheapest test that proves each.

## Permitted context

- The fork's `## Question` section and every path its `### Carries` names.
- The akrogon source, docs and tests at /home/ivan/Work/infra/akrogon (main), and the framework config at /home/ivan/Work/infra/tamdoma/framework/issues/config.yaml.
- Tool documentation and outside sources (X(7), Chromium ozone, Playwright docs).
- Free probes: run them from /home/ivan/Work/infra/akrogon as `akrogon run-check --name <label> --holder /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/direct -- <argv>`. Playwright 1.63 lives in /home/ivan/Work/personal/Himne/node_modules (cd there inside the command). A headed probe briefly opens a window on the operator's screen: close it in the same script. Run no paid model launch and change no file outside your return file and the probe logs.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You still choose your own evidence and may locate other needed sections under this rule.

## Return

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/slots/display-env-B.md, then run:

hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/slots/display-env-B.md"
