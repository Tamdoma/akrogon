# Brief: territory map, slot B

You are slot B. Map the territory for Tamdoma/akrogon#132 independently of A; A's map is excluded until both finish.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/INTAKE.md
- Session signposts (binding, A's picks): /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/forks/signposts.md (sections Taken and Needs)
- Live surfaces: /home/ivan/Work/infra/akrogon/src/next.ts (`nextCommand`, `reconcileRepos`, `mergePass`, `mergeTurn`, `reconcileBatch`, `landedWake`), src/reconcile.ts (`reconcile`, `mergedWorktree`, `reconcileNeedsPanes`), src/phase.ts (`commandMerged`, `commitMove`, `landPush`), src/land.ts, src/listen.ts, the tests under /home/ivan/Work/infra/akrogon/tests that cover batch release and merged cleanup, and src/AREA.md / tests/AREA.md for contracts.

## Task

Write a proportional territory map: the material forks (each a precise question with its options), what each option could break or invite later, practitioner questions, pitfalls with what removes each, and the cheapest test that proves the fix red on the base and green after. Name inspected file and function for each claim. Include the safety question: what the batch record protects while it is set (land process alive, scratch copy, attempt record), and whether clearing it at the merged move or cleaning after release could remove something still in use.

Do not edit any file except your return file. No product change, no live mutation, no paid call. Read-only commands and running existing tests in a scratch copy are allowed.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/map-B.md, then run: hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/map-B.md"
