# Fork notes brief: load-sensitive-tests (slot C)

You are slot C, a consultant in the chart-issues door for the akrogon repo (/home/ivan/Work/infra/akrogon). Make no repository edits except your return file.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. Name sections, never line ranges, when citing process text.

## Task

Write blind fork notes for the questions in the fork file below, as defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md section "Blind peer exchange" (the five parts of a returned peer file). Your own position, not a review of anyone else. Group the failing tests by the limit that makes them fail, and for each group name the cause with file:line evidence and the change you would make. Look at the system as a whole: the operator allows replacing backend tools if the workflow stays the same.

## Permitted context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/suite-time/INTAKE.md
- Fork: /home/ivan/Work/infra/akrogon/issues/chart/suite-time/forks/load-sensitive-tests.md (Question and Carries)
- Lock: /home/ivan/Work/infra/akrogon/issues/chart/suite-time/forks/suite-shape.md (Taken and everything after it)
- Evidence: /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-runs.txt, slots/s1-logs/
- Recorded run history: /home/ivan/Work/infra/akrogon/issues/timings.jsonl, issues/verify-runs.jsonl
- Live surface: tests/, src/, bunfig.toml, issues/config.yaml, `bun test --help` (bun 1.4.4).
- Do not read other files under slots/ whose names start with load-tests, and do not read /tmp/claude-1000.

## Measurement

You may run single test files or single tests in /home/ivan/Work/infra/akrogon, under load you create yourself if useful. The host is shared with the other consultant: record the load average before and after each run and say when a run may have overlapped another. Do not run full suites. Name every command you ran with its result.

## Return

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-C.md. Plain words, short sentences.
