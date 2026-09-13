# Proposed final shape after operator round 1 (for B's one focused check)

Operator answers verbatim: "1b, 2a, 3b, 4 - this must be as detailed as each individual question is now, the fork is just a batch of those questions. Everything stays the same as now, it's just a category of questions about the same topic, that's why it should be called a fork. And what was called fork before is just a fork decision now. ... The goal is to simplify the mental model and the naming conventions and concepts follow. | 5a"

Contract:
- Disk rename: `decisions/` -> `forks/`; CHART.md sections `## Decisions So Far` -> `## Forks taken`, `## Open Decisions` -> `## Forks open`, `## Not Yet Specified` -> `## Fog`, `## Out Of Scope` -> `## Off route`; fork file `## Resolution` -> `## Taken`. `Handed off <date>` line unchanged. Fog is bullets.
- src/status.ts chartRow: read `forks/`, regex `## Taken`, section `Fog`; column header UNSPECIFIED -> FOG. tests/status.test.ts fixture updated. Done-criterion 3 becomes "full suite passes".
- Migrate issues/chart/status-empty-open and all issues/closed/*/chart: folder rename, heading rewrite, relative links `decisions/` -> `forks/`. Bodies otherwise byte-identical.
- docs/guide/files.html:106 rewords "decision files" to "fork files".
- Vocabulary: fork = one topic holding one or more questions, one file, always shown together in a round. question = one Q block, same detail as today. A question is taken when the operator answers it; a fork is taken when every material question in it is taken; partial answers recorded under Findings, `## Taken` written only when the fork is taken. Corrections before handoff: new fork naming the superseded one, original verbatim.
- Skill prose in SKILL.md, questions.md, shapes.md, standing-design.md rewritten to the vocabulary; "binding decisions" in designs and plan D1..Dn unchanged.

Return only disagreements or missed consequences, e.g. things in src/tests/docs/charts that the rename breaks. Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/charting-vocabulary/slots/disk-names-final-check-B.md
