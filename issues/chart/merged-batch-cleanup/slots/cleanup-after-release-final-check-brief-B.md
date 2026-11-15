# Brief: final-shape check, slot B (round 1)

You are slot B. Read /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/cleanup-after-release-final-shape.md and run one focused check: does the shape hold against the code (src/next.ts `nextCommand`, `unpausePass`, `mergePass`, `reconcileRepos`; src/reconcile.ts), are R1–R3 carried correctly, can moving the pre-merge `reconcileRepos` after the merge step break a same-pass dependency you can name, and are L1 and L2 stated accurately. Return only disagreements with evidence, or "no disagreement".

Do not edit any file except your return file. No product change, no live mutation, no paid call.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/cleanup-after-release-final-check-B.md, then run: hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/cleanup-after-release-final-check-B.md"
