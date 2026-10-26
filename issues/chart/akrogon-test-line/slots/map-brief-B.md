# Opening map brief, slot B, chart akrogon-test-line, 2026-10-26

You are slot B, a consultant for the chart door (slot A). Work alone. Do not read /home/ivan/Work/infra/akrogon/issues/chart/akrogon-test-line/slots/map-A.md or any other seat's map or merged file. Do not edit any file except your return file.

## Task

Write your own territory map for this chart: the material forks (each with options, the one you would pick and why), questions an experienced practitioner would ask, and pitfalls over the work's lifetime, including what each option could break or invite later and not only now. Ground every claim in inspected surfaces (file and function, commit, or command output) and tag each with its evidence tier (operator, practitioner, better-than-training, model-knowledge) and the date read. Keep it proportional: this is one small change in one repo.

## Intake

Read /home/ivan/Work/infra/akrogon/issues/chart/akrogon-test-line/INTAKE.md whole. It holds the operator's words and the door's findings.

## Live surface to inspect

- Commit 20455420 (the revert that removed the earlier host-wide line) and the commits it reverts, 736067bf..f474544b. `git show 20455420` shows every removed line.
- src/admission.ts (`withAdmission`, `nested`, `liveRuns`), src/run-check.ts (`checkedRun`), src/config.ts (`repoSchema`), src/status.ts, src/verify.ts, tests/run-permit.test.ts as they are on main now.
- issues/config.yaml (akrogon's `checks.test`).
- issues/chart/host-run-load/forks/full-suite-line.md (the earlier decisions, rebuttals and accepted residuals).
- Anything else you judge needed, under the reading rule below.

## Locks

- Operator: akrogon only. Other repos and other checks start at once. `akrogon status` shows the line. Lifecycle route.
- Standing (chart suite-time): no per-test timeout raises, no `--retry` or `test.serial`, no removing tests.
- Runs are stopped only with `akrogon stop-run <id>`, never by command-line pattern.
- Never open, print or write `.env` or `.env.*`.

## Reading rule

Read process text (skills, docs) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. Code under inspection is the subject of the work and may be read whole.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/akrogon-test-line/slots/map-B.md and end your turn.
