# Rebuttal brief: look (chart door A = terminal t15)

You are a consultant seat (letter in the one-line prompt). Work alone. Edit no file except your return file. Do not contact the operator.

## Task

Read the merged look notes and return one disagreement-only rebuttal: every point where you think the merged map is wrong, misattributes a seat, drops something material, or where your position in "Where seats differ" should win, with evidence (tier, source path:line or URL, date). Say nothing about points you agree with. If you have no disagreement, write exactly "No disagreement." Keep it short.

You may re-check facts in the source files, the intake and your own seat's original map.

## Inputs (absolute paths)

- Merged map: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-merged.md
- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md
- Your seat's original map: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-<YOUR LETTER>.md
- herdr-app manual and types: /home/ivan/.config/herdr-app/AGENTS.md, herdr.d.ts, gpui-kit.d.ts (search, do not read whole)

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-rebuttal-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-rebuttal-<YOUR LETTER>.md"
