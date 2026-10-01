# Stall notice under watch

## Question
Q1. Should the stall notice (src/next.ts:193-222) also run when the watch reads an all-busy leaf (#51, tamdoma-framework #116), or stay as is?

### Carries
stall-notifier-removal (2026-09-18): notifier retained. Operator: "removed as much as possible".

## Findings
../slots/map-merged.md M8 and correction M8. B and C recommend no change for this problem: it notifies and shortens nothing.

## Taken
Operator 2026-10-01, verbatim: "1a". No change. The watch's 20-minute busy-seat read (watch-issues/SKILL.md:42) is the observer, and a ping adds an operator duty against "removed as much as possible". Foreclosed: 1b, firing the notice from the watch.
