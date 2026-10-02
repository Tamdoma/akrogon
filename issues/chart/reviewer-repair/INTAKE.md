# Intake: reviewer-repair

## Scope
akrogon lifecycle: slot B repairs review findings itself instead of returning them to A, cutting check.review to check.fix round trips. One chart, destination akrogon.

## Provenance
- Operator: chart-issues door 2026-10-02, opening note
- Operator: same session, follow-up with screenshot of framework emdash-launch tab
- Operator: same session, reply to round 1

## Source: operator 2026-10-02 opening note
I've added a really strong tester model in slot B in the lifecylce. But now it's constantly returning things back to slot, because it always finds issues. Is there a way to also make slot B fix those and test out without having to return them back? What's the best practice? It just takes so long to back and forth so we need to do something about it. Use slot B consultant and slot C consultant. They're both active panes in your tab.

## Source: operator 2026-10-02 follow-up
[Image #1] <- this is just an example in the framework herdr workspace in the emdash-launch tab. You can look it up. We get another turn for a couple of these mistakes, that doesn't make sense.

(Screenshot: emdash-launch A pane showing review-A.md verdict fix, F1 acceptance runner gap, F2 stray repo ivanjuras/emdash-launch-c8 needing `delete_repo` scope, caveat "This session also implemented R12 to R15, so the review is not independent of that work"; B pane codex running checks.)

## Source: operator 2026-10-02 reply to round 1
1 - Not sure | 2a | 3a | Can we make the cuts even bigger percentage? What does the research say about this? GPT 6.1 SOL is a really strong self fixing model, it's not biased towards itself, but I do need a confirmation on that. I just want to avoid constant back and forthing for failed tests, it just doesn't make sense. In fact, this testing and fixes take up so much time, look at the recent fixes for akrogon.

## Agent findings
See `slots/map-A.md`, `slots/map-B.md`, `slots/map-C.md`, merged in `slots/map-merged.md` with rebuttals `slots/map-rebuttal-B.md` and `slots/map-rebuttal-C.md`. Summary: akrogon loop about 8% of leaf time; framework loop about 31% since 2026-09-29 with 23 of 35 recent repairs starting at the first review; failed recovery resets `fix_rounds` (`src/phase.ts:107-112`) so A re-reviews its own repair.
