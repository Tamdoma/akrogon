# Fork notes brief, slot B: killed-run-stop

You are slot B, a consultant to the chart door (slot A), repo /home/ivan/Work/infra/akrogon. Your context was restarted; read what you need. Work independently: A's draft and findings are withheld.

Reading rule: read process text by named section for the step you answer; locate a section before reading it, batch independent reads in one call with output bounded to those sections, read content you already hold at most once per session. A section not read yet, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. Choose your own evidence otherwise.

## Permitted context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/killed-run-fixture/INTAKE.md (read `## Source: Tamdoma/akrogon#124` and `## Agent findings`)
- Your own opening map: /home/ivan/Work/infra/akrogon/issues/chart/killed-run-fixture/slots/map-B.md (`## #124 material forks` onward)
- Question and carries: /home/ivan/Work/infra/akrogon/issues/chart/killed-run-fixture/forks/killed-run-stop.md, sections `## Question` and `### Carries` only (do not read `## Findings`)
- Live surface: src/run-check.ts (checkedRun), src/scope.ts (startRunGuard), src/admission.ts (liveRuns, withAdmission nested kind), src/phase.ts (moveGuards, transition), src/pack.ts and src/flock.ts (owner .lock), src/log.ts, skills/check-issue and skills/implement-issue SKILL.md stop-run lines.
- Locks are in the Carries section. No operator corrections yet.

## Task

Write blind notes for Q1, Q2 and Q3 using the five-part note definition in /home/ivan/.akrogon/current/skills/chart-issues/assets/questions.md section `## Blind peer exchange` (the paragraph beginning "For the opening map"). Name the inspected file and function for every claim about this repo.

Return: write your notes to /home/ivan/Work/infra/akrogon/issues/chart/killed-run-fixture/slots/killed-run-stop-B.md and end your turn. Edit no other file.
