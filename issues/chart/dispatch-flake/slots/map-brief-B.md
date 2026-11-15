# Brief: territory map and root cause, slot B

You are slot B, a consultant to the chart door (slot A, hc address t126) charting one flaky test in akrogon. The mode is manual: the operator answers every fork. A draws its own map at the same time, and you do not see it. Your map is your own position, not a review of A. You start with an empty context.

## Task

Establish why the test `merged phase closes tab on typed next and starts the dependent` (/home/ivan/Work/infra/akrogon/tests/next.test.ts) flips between red and green on the same tree, then draw a proportional territory map of the fix.

What you receive:

- The intake: /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/INTAKE.md
- The chart: /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/CHART.md
- The session's signposts, answered by the operator: /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/forks/signposts.md (sections Question, Taken and Needs)
- The red run: receipt `fe4b306c-f96a-416b-913e-843e24ded7dd` (red) and `28832fb4-7254-47dd-a2b0-dba962a2359c` (green), both on tree `f0c2ba02f72f12c3adba65ec83887bbfb6e94fdc`, in /home/ivan/Work/infra/akrogon/issues/verify-runs.jsonl. The red log reads with `akrogon log issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-test-1794236439927-3239663.log`, run from /home/ivan/Work/infra/akrogon. It fails at the assertion `expect(readState(dependent).attempts.A).toBe(1)` with 0 received, after 4.36 s, with the two `liveTabs` assertions before it passing.
- The flip list: `akrogon flaky` (2 flips for this test, latest 2026-11-09), and /home/ivan/Work/infra/akrogon/issues/red-records.jsonl
- Live surface: /home/ivan/Work/infra/akrogon/src (area notes in src/AREA.md), /home/ivan/Work/infra/akrogon/tests (area notes in tests/AREA.md, fixtures in tests/hc-fixture.ts and tests/helpers.ts), /home/ivan/Work/infra/akrogon/learnings/LESSONS.md
- Earlier charts the map named as binding here: /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup and /home/ivan/Work/infra/akrogon/issues/chart/suite-time/forks/load-sensitive-tests.md

Locks that bind the map:

- 1a: rank options by fewer parts first, then the operator's time, then clock time, then tokens.
- 2c: nothing may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record or any chart-door step.
- 3a: a claim needs a number or observation from the factory's own records or from a run you made, with the command and date.
- 5b: no paid call. The paid-run cap is not stated and this chart has no consumer for it.
- 6a: changes land in akrogon only.
- 7a: earlier operator decisions stay binding. Name an earlier decision only when its facts have changed, and do not build an option on reopening it.
- From the split (factory-wins forks/split.md, Taken): this chart establishes the root cause before any fix shape is locked.

Return:

1. Root cause: the mechanism that leaves `attempts.A` at 0, traced through the code by file and function, with each step marked observed (you saw it in a log or a run) or inferred. Say plainly whether it is a test that checks too early, a real product race in dispatch after `merged`, or both, and what the command's actual contract is for when a dependent's first attempt is counted. If you cannot establish it, say what observation is missing and the smallest run that would supply it.
2. Reproduction: whether you reproduced the red, with the exact command, the number of runs and reds, and the date. A reproduction that needs host load says how the load was made.
3. The sibling tests that share the mechanism (same assertion after the same steps) and whether each is exposed.
4. The fix options, each with: the change in one or two sentences, its parts added or removed, what it could break or invite later, and the done-criterion that would prove it (an observable result, never a test count or file).
5. Your pick, with its reason and cost, and each rejected option with its reason.
6. The questions a practitioner would ask that the options do not cover, the pitfalls over the fix's lifetime with the step that removes each, and whether this is one leaf or more.
7. Evidence lines with tier (operator, practitioner, better-than-training, model-knowledge), source and date read.

Rules for runs: the repository checkout at /home/ivan/Work/infra/akrogon is read-only for you. You may run tests locally, and you may make experimental edits only in a scratch copy or worktree you create under your own temporary directory and remove before you report; record its cleanup in the return. Keep host load modest: A may be running the same tests at the same time. Make no product change in the checkout, no live mutation, no paid call, no push. Start no agents. Edit no file except your return file. Do not read any other file under /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/slots/.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule. In this chart the source under /home/ivan/Work/infra/akrogon/src and /home/ivan/Work/infra/akrogon/tests is the subject of the work, so its full source is allowed.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/slots/map-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/dispatch-flake/slots/map-B.md"
