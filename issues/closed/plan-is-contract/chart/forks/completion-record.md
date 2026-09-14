# What is the one completion record?

## Question
Q7 · What is the one completion record, and where does it live?

### Carries
- Astra F2: "retain one completed implementation evidence record"; H8: judge material content, not template presence.
- worker-protocol.md: workers return the brief's report; B judges the four contents.
- merge-issue:14 already reads "the implementation report".
- Lesson 2026-09-10 core-skills: the report must name out-of-scope hits under known limitations.

## Findings
- Today the record is the four fill-in lines closing brief section 8, and 56 leaves also hold a `report.md` (14 akrogon, 39 framework) or `report` (3 pi-extensions) that no skill names. Framework adds `report-1..3.md` per worker in 22 leaves.
- Research, operator: `astra-6-akrogon-audit.md` F2 and H8, read 2026-09-14. Keep one evidence record; replace template presence with material content. Fixed the option shape.
- Research, better-than-training: Claude Code best practices, code.claude.com/docs/en/best-practices, read 2026-09-14. "Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result." Set the record's contents.
- Research, better-than-training: Google eng-practices, google.github.io/eng-practices/review/developer/cl-descriptions.html, read 2026-09-14. A change description states what and why, with limitations and results in the body, and links may not be visible to future readers. Added the base and committed head to the record.
- Slot B review F-B4: a leaf merged with the placeholder lines unfilled; check-issue:39 blocks a gap only when material.

## Taken
Operator answer (2026-09-14): chosen as the recommended set with "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies." `7a`. `implementation/report.md`, written by B after the last check: changed files and reasons, commands with pasted results and artifact paths, base and committed head, known limitations, unverified criteria. Worker returns fold into it. check-issue and merge-issue read `plan.md` and `report.md`. Foreclosed: a `## Completed` section in plan.md; per-worker `report-N.md` files as the record.
