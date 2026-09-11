# Uncommitted handoff

2026-09-11. Leaves init-issues and seed-issue reached merged with HEAD still at the main tip: B never committed, both reviewers said ready, and merge recovery saw an ancestor of main. The forced worktree removal then deleted the work.

Fixes: `akrogon phase` refuses the move to check.review on a dirty worktree, merge recovery refuses a dirty worktree, worktree removal is no longer forced. Reviewers should still confirm the reviewed commit is ahead of base and the tree is clean.
