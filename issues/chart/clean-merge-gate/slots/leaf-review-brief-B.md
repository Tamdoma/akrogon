# Leaf review brief, slot B (covers both charts)

Review each draft as the implementer who must build it. Read the fork files for the binding decisions:
- /home/ivan/Work/infra/akrogon/issues/chart/clean-merge-gate/forks/gate-tree.md, drafts /tmp/claude-1000/-home-ivan-Work-infra-akrogon/a7a6765b-b14d-4e24-bc1e-b2fa7fcdbc97/scratchpad/drafts/clean-merge-gate/ (ISSUE.md, merge-clean-worktree/{brief,design,readiness,state})
- /home/ivan/Work/infra/akrogon/issues/chart/merge-load-flakes/forks/flake-cause.md, drafts /tmp/claude-1000/-home-ivan-Work-infra-akrogon/a7a6765b-b14d-4e24-bc1e-b2fa7fcdbc97/scratchpad/drafts/merge-load-flakes/ (ISSUE.md, merge-attempt-pressure/{brief,design,readiness,state})
Code: read origin/main (git show origin/main:<path>), not the working tree: src/next.ts (dispatchMergeLeaf ~1227, batch creation ~1070), src/attempts.ts, src/state.ts, src/phase.ts appendAttempt calls, src/batch.ts move(). Shape rules: /home/ivan/.claude/skills/chart-issues/assets/shapes.md and standing-design.md.

Note: A restated gate-tree 1a as "remove untracked folders that contain no files, in every state" because a solo holder may hold uncommitted untracked work when prompted. Judge whether that is a faithful restatement or a mechanism change.

Return only disagreements with evidence (path:line or source), each with a concrete fix. Short, plain language. Read only.
Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/clean-merge-gate/slots/leaf-review-B.md
