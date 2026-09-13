# After a Discord chunk fails twice, are later chunks still sent?

## Question
Stop that target or continue?

### Carries
`skills/broadcast-issue/scripts/discord-send.ts:106-116`; the skill excludes a delivery ledger.

## Findings
(both) second failure stops that target, other targets continue, error raised: visible not silent.

## Taken
Operator 2026-09-11: `9a`. Keep stopping that target; the raised error reports delivered, failed and unattempted chunk counts per target. Foreclosed: sending remaining chunks.
