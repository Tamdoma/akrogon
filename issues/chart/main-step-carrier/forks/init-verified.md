# Init verified

## Question
Q1. Should init-akrogon state that a verified `test_changed` runs the affected tests or the full existing suite, with the base forwarded to a script that may read it internally?

### Carries
- forks/check-entry-points.md Taken 1d (init text changes there too).

## Findings
- (B) yes: a functional check against the repo's suites would have rejected framework's stub (slots/map-rebuttal-B.md D2).
- (A) init-akrogon SKILL.md:47, :82 already require this in substance; more words add no enforcement.

## Taken
Operator 2026-10-12, after asking whether it costs time or adds complexity system-wide: "1a"

Decision: init-akrogon says a verified `test_changed` is a real run against a base with changes in which a changed test was actually selected and ran, or the full existing test suite ran; a clean exit alone does not count. The base may be read inside the entry-point script. Reason: it would have rejected framework's stub at setup; same single setup run (init-akrogon SKILL.md:82), one sentence, no code.
Foreclosed: 1b skip; any check of command text (form, not function).
