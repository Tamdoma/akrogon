# Where is the dead-path check enforced?

## Question
Every path an area file names must exist. Is that a review rule in check-issue that works in every repo, or a test in this repo's suite, or both?

### Carries
Operator lock: no new machinery. Core principle: mechanical checks validate existence, not wording.

## Findings
check-issue already "follows affected docs and index pointers" during review. A test in `tests/` would catch drift on every `bun test` in akrogon but does nothing for other repos, and init-issues does not install tests in consumer repos.

## Taken
Operator: `3a`, 2026-09-11. A review rule in check-issue scoped to area files present in the reviewed diff: list the paths the file names and report missing ones with one shell command, no extra file reads. Reason: works in every repo, zero machinery, zero reads for leaves that touch no area file. Foreclosed: a test in this repo's suite.
