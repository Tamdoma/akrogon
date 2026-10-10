# Design: merge-clean-worktree

## Binding decisions, verbatim

### gate-tree
Operator 2026-10-10: "1a |"

- 1a: when the command hands the merge turn to B (mergeTurn, covering top and solo), it runs `git clean -fd` in the holder worktree after the empty-status check. No `-x`: ignored files stay. Foreclosed: 1b fresh checkout per gate.
- Binding avoidance steps: clean only after git reports a clean status; never `-x`; a fail-first test plants an empty folder and proves the gate tree equals the commit tree in both modes; the leaf states its limit (ignored-file leftovers not covered); file overlap with batch-limit-repo and merge-attempt-records is coordinated by rebase, not blocked-by.
- Correction, operator 2026-10-10 "1a" (leaf review, slots/leaf-review-B.md F1, -C.md F1): the command removes only empty untracked folders (no file at any depth), in every worktree state, found by walking the worktree; it never removes a file or enters ignored paths. This replaces both `git clean -fd` and the clean-status precondition, because a dirty holder is the solo case #63 can hit and `git clean -fd` would delete uncommitted untracked files. (A,B,C)

Interpretation (A): on a clean status `git clean -fd` can only remove empty untracked folders. A solo holder may carry uncommitted work at prompt time (solo B "commits scoped outstanding changes"), where a plain `git clean -fd` would delete untracked files. So the leaf removes exactly what `git clean -fd` removes on a clean status, empty untracked folders, in every state, found by walking the worktree, because `git clean -nd` lists an untracked parent holding a file as one entry and hides its empty child (B F2; C measured the listing). (A,B,C) Same effect as the taken rule where it applies, and never deletes work where it does not. The merge-throughput leaves the overlap note named have merged; no coordination left.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Bug fix shows fail-first: criterion 1 test plants the empty folders and fails before the change. The command never runs `checks`, so tests prove the folders are gone at prompt time, not a gate failure. (C)
- Smallest real boundary: tests drive a real git worktree through the merge dispatch with the existing fake herdr, not a mocked git.
- No vanity tests: no test asserts guide wording; the guide line is checked by review.

## Leaf architecture
- Owned: the merge dispatch path in src/next.ts (one call after the worktree is ensured and before each merge prompt), a small helper beside existing git helpers if needed, tests in the existing batch-dispatch/batch-merge test files, the gate clause in skills/merge-issue/SKILL.md:41,51. (C)
- Interface: no new config, flag, state field or prompt text.
- Exclusions: no fresh checkout, no `-x`, no change to src/batch.ts move() dirty handling, no other skill text change for B. (C)
- Limit, stated: ignored-file leftovers (for example stale `.temp/` output) are not covered (gate-tree 1b foreclosed).
