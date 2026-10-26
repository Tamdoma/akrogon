# Addendum brief: suite-shape (slot C)

You are slot C. Same reading rule and permitted context as /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-brief-C.md. You keep your own notes at /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-C.md. Do not read the other consultant's notes.

## Operator correction, verbatim, 2026-10-25

"if we need to improve the background tools like bun etc, or replace it with something better, that's also an option. Look at it from a systemic point of view. I'm not locked into anything except for the overall workflow and how it works today. We can replace stack in the backend if it will improve something and if it doesn't change the actual workflow or make things worse. Communicate this to yourself and the agents."

## Task

Re-answer Q1 and Q2 from a systemic view under this correction. The workflow (leaf phases, seats, checks, verify, merge) stays as it is. Anything under it is open: the test runner, the runtime, how tests build fixtures, how akrogon itself calls git or other processes, the check command shape. Name where the suite's wall time and CPU actually go (not only which files are slow), and whether a stack change or a change under the tests removes a whole class of cost that your current pick leaves. Say plainly if your pick does not change. Use the five parts of a returned peer file from questions.md section "Blind peer exchange".

## Measurement

Whole-suite runs load the shared host and distort other measurements. Prefer single-file or targeted runs. If you run a whole suite, record load before and after.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-addendum-C.md. Plain words, short sentences.
