# Adopt rebuttal C

No misstated evidence and no misattribution. I still recommend O2. One dropped pitfall, then my judgment of O3 and O4.

## D1. Dropped pitfall: a triage pass through the door inherits chart machinery

adopt-merged.md:23 says O2 "is already a separate process". The door's rules do not yet allow that.

- Every door pass shows a territory map before grilling (skills/chart-issues/SKILL.md:37).
- Every destination writes a chart folder, and even a direct single item with no open fork "writes the same chart structure" (skills/chart-issues/SKILL.md:43).
- Every open runs `akrogon pull` (skills/chart-issues/SKILL.md:27).

Lesson triage has no forks, no destination and no leaf handoff. Read literally, `/chart-issues triage lessons` would produce a map, a chart folder and a handoff question for a list cleanup. The O2 edit at :29 must state that a triage pass writes no chart and ends after the removals and seed offers. Without that sentence, O2 is heavier than the open-time offer it replaces.

## O3, own skill: reject, with one condition

It adds no behavior over O2 and costs a tenth workflow: `docs/reference-index.md:5` says "the nine agent workflows", and install links every skill into four harness roots (src/install.ts:11).

Condition: if the D1 exemption needs more than one sentence in chart-issues, O3 becomes the better choice. chart-issues is already 2,337 words, and an exception path inside it is harder to keep correct than a short skill with one job. Decide this when the sentence is drafted, not now.

## O4, scheduled report-only run: reject

- The only scheduler Akrogon has is Claude Code cron, and the watch refuses to run without it (skills/watch-issues/SKILL.md:12). O4 would add a second harness-bound job.
- That watch is "started and stopped only by the operator" (skills/watch-issues/SKILL.md:3). A triage schedule still needs the operator to start it, so it does not remove reliance on memory. It moves it.
- The report cites guard file:line evidence. Those lines move with every merge, so the operator's pass must redo the guard search before removing a line. The report saves no work.
- The list changes slowly: 15 active lines, one new line in the last four commits to the file. A recurring run would mostly report "no change".

The merge is right that O4 is O2 plus a scheduler.
