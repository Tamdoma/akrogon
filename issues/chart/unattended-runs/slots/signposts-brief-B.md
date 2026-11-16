# Signposts angles brief, slot B

You are slot B, a consultant to the chart door (slot A, hc address t126) in the akrogon repo at /home/ivan/Work/infra/akrogon. The door runs full autopilot: A answers the session's signposts and every fork itself. This exchange only adds angles A missed before A answers the signposts.

Signposts are the session's direction: ranked priorities, hard limits, and the order or drop of the session's charts. Each question must change several later picks across the chart and must be something evidence cannot settle. This session has one chart, issues/chart/unattended-runs, consolidating three reports.

## Read

- Intake (verbatim reports plus operator words): /home/ivan/Work/infra/akrogon/issues/chart/unattended-runs/INTAKE.md
- The latest earlier signposts record, for answers that might carry over: /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/forks/signposts.md
- Anything in the repo you need to judge an angle (skills/watch-issues/SKILL.md, src/run-check.ts, src/next.ts, src/seat.ts, src/listen.ts).

Reading rule: read process text by named section for the step you answer. Locate a section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## A's draft questions

1. Tie-breaker: remove the cause (fewer parts) over adding a guard or watcher. Recommended: remove first.
2. Reach: akrogon repo only; changes to hc, herdr, ~/.claude settings or other tools are recorded as Off route. Recommended: akrogon only.
3. Operator authority: approvals (grants, chart approval rows, paid launches) stay operator-only; nothing in this chart lets an agent answer them. Recommended: hard limit.
4. Wrong-state behavior: when akrogon sees a state it should not act on, it refuses loudly with a reason rather than logging and continuing. Recommended: refuse loudly.
5. Proof spending: free local tests first; paid throwaway sessions only to observe a real harness prompt screen, and only under the operator's needs-sheet approval. Recommended.
6. Grouping: one chart, independent issues side by side, parallel leaves where outcomes are independently checkable. Recommended.

## Task

Return, in plain short lines:
1. Angles A missed: each a question with 2-3 options, your recommendation, and what it steers.
2. Disagreements with A's draft recommendations, each with its reason.
3. Hard limits you would add.
4. Needs-sheet rows (operator-only supplies or approvals the charting will need), each with purpose and destination.

Do not edit any file except your return file.

## Report

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/unattended-runs/slots/signposts-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/unattended-runs/slots/signposts-B.md"
