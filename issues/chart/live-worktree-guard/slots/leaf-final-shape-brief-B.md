# Brief for slot B: final shape check, worktree-keep-rule

You are slot B. Read-only; write only your return file.

After B's review (/home/ivan/Work/infra/akrogon/issues/chart/live-worktree-guard/slots/leaf-review-B.md) and C's review (/home/ivan/Work/infra/akrogon/issues/chart/live-worktree-guard/slots/leaf-review-C.md), A recorded two corrections (no operator answer changed) at the end of Taken in /home/ivan/Work/infra/akrogon/issues/chart/live-worktree-guard/forks/removal-rule.md: (1) "plain" removal was a recording error; the rule is through `git worktree remove`, never past a lock; (2) akrogon's scratch kinds keep the sweep's scratch rules (today's or scratch-copy-removal's), and the keep rule covers every other registered worktree.

Check once, final shape only:
- /home/ivan/.claude/jobs/6a0d8d81/tmp/draft/live-worktree-guard/worktree-keep-rule/brief.md
- /home/ivan/.claude/jobs/6a0d8d81/tmp/draft/live-worktree-guard/worktree-keep-rule/design.md (Corrections paragraph, Rules, Coordination)
- /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/brief.md criteria 2 and 7, and design.md "Corrections, 2026-10-15"

Does any line still contradict Taken plus the corrections, contradict scratch-copy-removal's contract (/home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/brief.md), or leave the implementer to guess? Return disagreements only with file:line and the exact replacement line, or "no disagreement". Restatements need no comment.

Return: /home/ivan/Work/infra/akrogon/issues/chart/live-worktree-guard/slots/leaf-final-shape-B.md. Write to a temp file in that folder first, then rename to the exact path.
