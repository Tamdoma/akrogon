# Signposts angles brief (slots B and C)

You are a consultant to the chart door (slot A) for chart `merge-lanes` in the akrogon repo (/home/ivan/Work/infra/akrogon). The same brief goes to slot B and slot C. Work independently; you will not see the other slot's answer.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You choose your own evidence and may read any source code, records or history in the repo.

## Task

The operator wants to revisit akrogon's merge design. Today each repo merges one leaf at a time; framework (/home/ivan/Work/infra/tamdoma/framework) has 10 leaves queued in `merge`, the oldest waiting 9h46m. The operator wants a better architecture that makes merges faster without overloading the PC (32 cores, 123 GB RAM). The operator's words are in /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/INTAKE.md (`## Source: operator 2026-11-21 door message`), with the door's measured facts under `## Agent findings`.

Before any design map, the operator answers a short signposts round: the ranked priorities and hard limits that steer every later design pick. A has drafted the questions below. Your job is to find the signposts A missed or got wrong, not to design the answer.

History A found (verify it yourself): on 2026-10-19 the operator deleted member stacking and made every merge turn the holder alone (issues/chart/merge-stacks/forks/stack-fate.md `## Taken`, commit 6e7a33ff), and deferred parallel next-leaf testing (speculative prefix, depth 2) with a revisit trigger: a measured probe shows two full suites run at once on this host without slowing each other or adding flakes (same file, 4a; merge-stacks CHART.md `## Off route`). host-run-load made full suites run one at a time host-wide (commit 861d0e4e). Framework's merge verify is still a median 11.5 min.

Draft signposts questions (A's):

1. What comes first when they conflict: shorter merge wait, a calm PC, or main never red? (recommended: shorter wait, with main never red as a hard limit and the PC bound as the second limit)
2. How many heavy merge verify runs may run at the same time on this PC? 1 (today), 2, or "as many as host pressure allows". (recommended: 2, measured before the design leans on it)
3. May one green verify run prove several leaves at once (they land together; a red run then costs extra runs to find the culprit), or must each leaf be proved alone on its own final tree? (recommended: batches allowed)
4. Scope: change only akrogon's merge machinery, or also the consumer repos' test suites (framework's `framework:verify`)? (recommended: akrogon only)
5. Proof bar before the new design counts: tests only, or a measured before/after on framework's real queue? (recommended: tests plus a before/after reading of framework's merge records)
6. How big a change is acceptable: a rework of the merge path, or only additions on top of today's queue? (recommended: rework allowed when it removes parts)

## What to return

For each draft question: keep, change (say how) or drop, with one reason. Then any missed signpost: a priority or hard limit that would change several design picks and that evidence cannot settle, with 2-3 options and your recommendation. Cite the evidence you read (path, record or commit) for each claim. Include the history you find of past merge-speed designs (charts under issues/chart/merge-*, git log) where it changes a signpost: the operator "went back and forth" and settled on the current one-at-a-time design, so say which earlier choices a signpost must respect or reopen. Keep it under 600 words.

## Report step

Write your return to the exact path below, then run the report command.

- Slot B return path: /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/signposts-B.md
- Slot C return path: /home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/signposts-C.md

Then run `hc send t2z2 "done <X>: <return path>"` with your slot letter and your return path.
