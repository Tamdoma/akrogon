# Brief: leaf contract review, slot B

You are slot B. Review each draft as the implementer who must deliver it: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8/scratchpad/drafts/merged-batch-cleanup/ISSUE.md, /tmp/claude-1000/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8/scratchpad/drafts/merged-batch-cleanup/cleanup-last-in-pass/brief.md, design.md, readiness.yaml, state.yaml. Check against the fork record /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/forks/cleanup-after-release.md (sections Taken) and the signposts /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/forks/signposts.md (Taken): can each done-criterion be met within the owned surfaces and fail on the base, are binding decisions carried, are the consumers of the changed state named correctly against the code (src/next.ts `nextCommand`, `unpausePass`, `mergePass`, `mergeTurn`, `reconcileRepos`; src/reconcile.ts), and is anything the implementer would have to guess. Return disagreements with evidence only, or "no disagreement".

Do not edit any file except your return file. No product change, no live mutation, no paid call.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/leaf-review-B.md, then run: hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/merged-batch-cleanup/slots/leaf-review-B.md"
