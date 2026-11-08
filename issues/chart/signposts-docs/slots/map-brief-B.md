# Brief: opening map, chart signposts-docs, slot B

You are consultant slot B for the akrogon chart door (A is terminal t15). Map this chart's territory on your own. You will not see A's or the other consultant's map until all are done.

## Reading rule

Read process text by named section for this step: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work. Name sections, never line ranges.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/signposts-docs/INTAKE.md: operator words, 2026-11-04: "Also, make sure that one of the issues is the akrogon documentation and file references update. We haven't done it since introducing signposts." Signposts landed in d6bb6429 (skill) and 9ee76bf6 (docs: territory map before fork rounds); the skill changes are in leaf issues/closed/signposts/signposts-step.

## Live surface

- /home/ivan/Work/infra/akrogon/docs/ (all pages; the subject), especially docs/reference/files.md, docs/reference/where-things-go.md, docs/reference/words.md, docs/use/plan-work.md, docs/use/autopilot.md, docs/start/what-it-is.md, docs/use/a-working-day.md, docs/README.md, docs/reference-index.md, docs/pictures/ (svg text).
- /home/ivan/Work/infra/akrogon/README.md, /home/ivan/Work/infra/akrogon/skills/AREA.md, /home/ivan/Work/infra/akrogon/src/AREA.md.
- The rule text docs must match: /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md sections "Shared context", "Drain", "Autopilot", "Handover"; /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md section "Chart records"; /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md (signposts paragraph).
- /home/ivan/Work/infra/akrogon/src/status.ts or wherever `akrogon status --charts` counts taken forks (it counts forks/signposts.md).
- Open leaves that also touch docs (stay out of their files' paragraphs): /home/ivan/Work/infra/akrogon/issues/open/grant-count/run-count-rule/brief.md, /home/ivan/Work/infra/akrogon/issues/open/round-drawings/option-drawings/brief.md; merged today: proof-coverage/coverage-audit (5499e3da).

## Locks (the session's signposts, operator 2026-11-04)

/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/forks/signposts.md, section "Taken": 1c written rules only; 4a fix the whole family (every stale or missing reference since signposts, not only one page) when it adds no parts; 5a; 6a.

## Task

Inventory every doc and reference that is missing, stale or wrong about signposts and the files and steps it added (forks/signposts.md, the three modes, the signposts round, copies across charts, handover entries, `status --charts`), each with path, section and what is wrong. Then a short map: forks (if any), pitfalls, and the split. Mark low-confidence items.

Do not edit any file except the return file. Do not plan or implement.

## Return

Write the map to /home/ivan/Work/infra/akrogon/issues/chart/signposts-docs/slots/map-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/signposts-docs/slots/map-B.md"
