# Run-from-workspace problem: independent map

You are a consulting slot. Do not edit any repo file. Return paths used: /home/ivan/.claude/jobs/6a0d8d81/tmp/run-split/{B,C}.md (moved here as map-B.md, map-C.md). Read code as needed. Keep it short (under 50 lines).

## Problem (observed 2026-10-16)
`~/.local/bin/akrogon` is a symlink to `/home/ivan/Work/infra/akrogon/src/akrogon.ts`. That root checkout is also a workspace: agents edit there and `issues/` records are written and committed there (self-update pushes record commits).
1. An uncommitted code edit in the root goes live at once, unreviewed.
2. While it sits there, self-update (src/self-update.ts:208-262, gitStage) cannot move the checkout: "checkout pending: error: Entry 'README.md' not uptodate. Cannot merge.; commit or finish the overlapping edit" (line 246).
3. Undoing the edit pulls the feature back out, which the operator saw as a "revert".
A rule "never edit code in the root" already exists (chart-issues direct route requires a worktree). It was broken anyway.

## Proposal on the table (O1)
A separate run checkout (e.g. a git worktree at `~/.akrogon/app`, detached at origin/main) that only self-update moves; the symlink points there. Root stays the workspace and record holder.

## Operator question
Is there a more elegant fix that removes the problem class without a second checkout/copy?

## Your answer
1. Your recommended fix and why it removes the class (not guards it).
2. Each alternative you considered, one line each, with what it breaks or invites later.
3. Anything in the code that makes O1 or your fix harder than it looks (cite path:line), e.g. toolRoot / own detection, skill links (src/install.ts), records, tests.
