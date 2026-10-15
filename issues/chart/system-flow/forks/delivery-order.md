# Door delivery order across charts

## Question
Q1: How should the door move between charts so settled work reaches the lifecycle while other charts are still being charted?

### Carries
- overnight-recs D4: settled charts hand off without waiting.
- Operator 2026-10-15: "I don't want them mixed up, but are you thinking about going jumping to the next chart as soon as the first one is handed off? Because I want the charts to be handed off one by one so we can start working while we are work charting the other chart."

## Findings
- M1 in slots/map-merged.md (A,B,D): the seed stock waits on the door; 12 framework charts untouched since 10-10; shared-contracts and test-scratch settled with 0 open forks (B).
- The selection stop at skills/chart-issues/SKILL.md:47 held the door when every chart had an open fork (A).
- Practitioner: Anderson, Upstream Kanban; Goldratt, feed the constraint (slots/map-A.md).

## Taken
Operator 2026-10-15: "1 ok" to the shape: one chart at a time, never mixed; a settled chart hands off at once; the door then goes to the next chart itself, oldest first unless the operator names one. Mixed batching across charts dropped. Landed 23abf2f..ed0a05d (SKILL.md:47, :85; shapes.md:293).
