# How does an unreadable repo inventory count against its own cap?

## Question
Today an unreadable inventory charges leaves plus unreadable count to the machine total and an unknown registration charges the whole global cap. For the repo's own cap, does an unreadable inventory count the same way (leaves plus unreadable), or mark the repo full?

### Carries
Existing global rule in `activeCount`, `src/next.ts` line 267 to 268.

## Findings
The repo-level count is a filter of the same loop, so mirroring the global rule is one expression with no new branch. Marking full is a second rule to explain.

## Resolution
Operator: `2a`, 2026-09-11. Same rule as the machine count: readable leaves plus unreadable count charge the repo's own cap. Reason: one expression filtered by repo, no new branch. Foreclosed: marking an unreadable repo full.
