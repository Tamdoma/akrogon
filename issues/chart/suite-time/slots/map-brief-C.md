# Opening map brief, slot C

You are consultant slot C for a chart door (an operator-attended charting session) in /home/ivan/Work/infra/akrogon. Work independently. Do not read any other file under /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door except this brief. Do not edit any repository file. Do not prompt other panes.

## Operator intake (verbatim)

"I need you to find me an inefficiency in akrogon that we can improve by at least 20%. One small thing that will either improve the cost, the speed or the quality or all three, or just the two."

## Task

Map the territory independently, then pick one candidate. Akrogon is an issue lifecycle command: leaves move through phases (plan.synthesis, implement, check.review, check.repair, merge, merged) driven by agent seats in herdr panes, with checks run through run-check and verify.

1. Find measured inefficiencies. Ground every claim in recorded data or inspected code, never impressions. Useful live surfaces:
   - `akrogon timing`, `akrogon timing --cohort` (read-only readouts)
   - /home/ivan/Work/infra/akrogon/issues/timings.jsonl, log.jsonl, verify-runs.jsonl, merge-attempts.jsonl, red-records.jsonl
   - /home/ivan/Work/infra/akrogon/issues/closed/ (closed leaves with state, briefs, reports, logs; logs may sit in evidence.tar.zst, read via `akrogon log <path>`)
   - /home/ivan/Work/infra/akrogon/src/ (start at src/AREA.md), skills/ (start at skills/AREA.md), tests/AREA.md
   - `akrogon config`, `akrogon flaky`
2. List 3 to 6 candidates. For each: what is wasted (time, tokens or model cost, rework, failed runs), the measurement with file path and how you computed it, the expected gain as a percentage with its basis, the size of the change (files touched, rough lines), and what the change could break or invite later.
3. Pick one. It must be small (one leaf, one outcome) and plausibly yield at least 20% on cost, speed or quality, measured against a baseline you name. Say how the 20% would be proven after the change.

Locks: none yet. Known context: 19 tests show in `akrogon flaky`; whether flakiness is the best target is your call from the data.

## Reading rule

Read process text (skills, docs, AREA files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when it is the subject of the work. Name sections, never line ranges. Code and data files are evidence and can be read as needed.

## Return

Write your map to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-C.md
Parts: candidates (as in step 2), your pick with reason and cost, rejected candidates with reasons, evidence lines (tier, source, date), pitfalls with what removes each, and questions you would ask the operator. Keep it under 120 lines. Write the file last, in one write, when finished.
