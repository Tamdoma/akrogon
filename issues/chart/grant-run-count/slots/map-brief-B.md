# Brief: opening map, chart grant-run-count, slot B

You are consultant slot B for the akrogon chart door (A is terminal t15). Map this chart's territory on your own. You will not see A's or the other consultant's map until all are done.

## Reading rule

Read process text by named section for this step: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work. Name sections, never line ranges.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/grant-run-count/INTAKE.md: Tamdoma/akrogon#126. A grant bounded a paid recorder to 1 run plus 1 rerun; seat A launched it at least 3 times into paid sessions and its report said "1 run + 1 rerun". Nothing refused or warned. Seat B under a separate grant counted its runs and stopped. Recurrence of Tamdoma/akrogon#107 (fix e522c186 made grant coverage a skill rule).

The leaf has since closed: /home/ivan/Work/infra/tamdoma/framework/issues/closed/about-titles/fixture-weave-recorder/ (readiness.yaml grants, implementation/report.md, implementation/check-record-*.log, review-B.md).

## Live surface

- /home/ivan/Work/infra/akrogon/src/readiness.ts (`grantSchema`, `bounds: text`).
- /home/ivan/Work/infra/akrogon/src/run-check.ts (what a run-check records per run: receipts, logs, labels).
- /home/ivan/Work/infra/akrogon/skills/implement-issue/SKILL.md, the paragraph beginning "A reuses `grants[]`"; /home/ivan/Work/infra/akrogon/skills/check-issue/SKILL.md, the paragraph beginning "Each review seat reuses `grants[]`"; /home/ivan/Work/infra/akrogon/skills/merge-issue/SKILL.md if it runs covered operations.
- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md section "Take", the grant paragraph beginning "Each leaf's `grants` records one scoped grant"; /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (recorded-output rule).
- Just handed off and related: /home/ivan/Work/infra/akrogon/issues/open/proof-coverage/coverage-audit/brief.md (chart-time proofs; do not overlap it).

## Locks (the session's signposts, operator 2026-11-04)

/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/forks/signposts.md, section "Taken". In short: 1c written skill rules only, the agent keeps its own count, no new command refusals; 2b a paid run past an approved bound is allowed with a warning; 3a charting checks key promises before handoff; 4a fix the whole bug family when it adds no parts; 5a new grants only, no migration; 6a work only in parts the herdr-app move keeps.

Note: the reporter's expected fix (akrogon counts runs and refuses past the bound) is ruled out by 1c and 2b. Map what remains: how a seat keeps a correct count without a command gate, where the warning goes and who reads it, and what "the whole family" covers.

## Task

Write a proportional territory map: the material forks (each a question with two or three options, what each could break or invite later and not only now), the questions a practitioner would ask, and the pitfalls over the work's lifetime, each grounded in a surface you inspected (path and section). Note any conflict between a lock and existing skill text. Propose the split. Mark low-confidence items.

Do not edit any file except the return file. Do not plan or implement.

## Return

Write the map to /home/ivan/Work/infra/akrogon/issues/chart/grant-run-count/slots/map-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/grant-run-count/slots/map-B.md"
