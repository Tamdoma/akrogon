# Opening map brief, slot C

You are consultant slot C for a chart-issues door (slot A in pane w8:pNP) running under autopilot on the akrogon repo /home/ivan/Work/infra/akrogon. Work blind: do not read other slots' maps or anything under /tmp/claude-1000/-home-ivan-Work-infra-akrogon/71d2bdae-1e69-468c-a627-3d0b39e5f72e/scratchpad/chart other than this brief. Write nothing in the repo; only write your return file.

## Reading rule
Read process text by named section for the step you are answering: locate a section before reading it, batch independent reads in one call with bounded output, read content you already hold at most once per session. Unread sections, changed content and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text. The chart-issues skill text is the subject here, so read skills/chart-issues/SKILL.md and its assets freely.

## Intake (read verbatim)
/home/ivan/Work/infra/akrogon/issues/chart/autopilot-new-chart/INTAKE.md

## Locks (operator answers, not open)
- O1: under autopilot, a handed chart that turns out to need a separate new chart waits for the operator; A moves on within the handed list.
- Proposal step: before parking it, A writes a ready-made proposal for the new chart (goal, why needed, which chart waits) so the operator only says yes or no.

## Live surfaces
skills/chart-issues/SKILL.md (Drain, Handoff, Autopilot, Handover), skills/chart-issues/assets/shapes.md (Chart records, Autopilot lines), skills/chart-issues/assets/questions.md, docs/use/autopilot.md, issues/chart/autopilot/ (the chart that designed autopilot, 2026-10-16), issues/chart/config-walls/CHART.md (an autopilot run), src/next.ts blocked-by handling, tests/chart-shapes.test.ts, learnings/LESSONS.md.
Operator values: simplicity, function over form, removing over adding, systems thinking, speed and price.

## Task
Produce your own territory map:
1. The destination outcome in one sentence.
2. The material forks (real choices that change the outcome), each with options, your pick and reason, and what each option could break or invite later. Prefer options that remove a mechanism over ones that add one.
3. Pitfalls over the rule's lifetime, each with the step that removes it.
4. Evidence lines with tier (better-than-training = inspected file with path and section or path:line; model-knowledge only with failed searches), and anything surprising or contradicting the intake's door findings.
5. Proposed split into leaves, scope files, and what is off route; remaining fog.
Keep it compact: under 90 lines.

Return file (exact path, write it when done): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/71d2bdae-1e69-468c-a627-3d0b39e5f72e/scratchpad/chart/map-C.md
