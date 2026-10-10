# First package

## Question
Q1. How early does the full gate (`merge_checks`) run before the merge turn?
Q2. How big is a merge batch?
Q3. Which seeds stay out of this chart?

### Carries
- Lock: check-reruns "merge_checks run only at merge" (issues/chart/check-reruns/CHART.md:4). Q1 options 1a and 1b reopen part of it.
- Lock: merge-turn "1d merge turn plus batching" and one turn per repo (issues/chart/merge-turn/CHART.md:7).
- Lock: test-runs "heavy-run slot ruled out, reopen only on a traced load failure" (issues/chart/test-runs/CHART.md:17).

## Findings
- Q1: bounce repair reruns the rejected command before re-review (B,C); every leaf runs merge_checks once before merge (A). B rebuttal F6/F7: needs the rejected command, args, base/head kept as evidence; plan-issue:63 and implement-issue:84 must be reconciled, more than one line. Repeat bounce 42%, DEFECT 12/34 with 10/12 in merge_checks-only suites (#71). Sources: Google SWE ch. 23 (abseil.io/resources/swe-book/html/ch23.html, read 2026-10-09 by B), Fowler Continuous Integration (martinfowler.com, read 2026-10-09 by B).
- Q2: first batch is the whole queue (src/next.ts:1020); limit dies with holder (src/phase.ts:154). Window start 2, +1 green, halve red (C; Zuul gating docs, GitHub merge queue docs, read 2026-10-09 by C); fixed max (B); wait for data (A). C rebuttal: floor and persistence need no data, only growth does. Solo marks stay until the leaf leaves merge (src/phase.ts:153) (A,C).
- Q3: #69 off route by test-runs lock (A,B,C); #73 separate destination (A,B,C); #63 off route seen once (C), fresh checkout rank 1 (B), git clean (A). C rebuttal: git clean without -x misses ignored files, with -x pays setup on the turn.

## Taken
Operator 2026-10-09, verbatim: "1a | 2a - Is this gonna increase the speed of merging? | 3a"

- Q1 1a: only a repair after a merge bounce reruns the exact rejected command, in its own seat, before re-review, keeping command, arguments, base and head as evidence. Reopens check-reruns "merge_checks only at merge" for this case only. Reason: smallest change that removes the 42% repeat bounce. Foreclosed: 1b every leaf runs merge_checks before merge (revisit with attempt records), 1c no change.
- Q2 2a: one batch limit per repo, kept across holders, starts at 2, halves on red, floor 1, no growth step; a conflict `solo` mark clears after that leaf's clean run. Reason: ends whole-queue first batches with no data needed. Foreclosed: 2b growth step (needs attempt data), 2c no change. Sizing revised 2026-10-10 by [batch-size](batch-size.md) Q2 2a; the solo-clear rule is replaced by batch-size correction 2026-10-10 (per-attempt exclusion).
- Q3 3a: #69 off route until a traced load failure (test-runs lock); #73 own chart later; #63 off route, reopen on recurrence. Foreclosed: 3b fresh-checkout gate.
