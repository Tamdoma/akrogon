# Cleanup timing claims in lifecycle guides

## Case

worktree-reconciler review B deferred N1: README documents per-pass reconciliation, but the existing merge and limits guides still describe cleanup as waiting for manual/startup sweeps and issue-folder closure.

## Evidence

At reviewed head a3aed5e2d45402e9a41484489337499331e12365, docs/guide/merge.md:55 says completed worktrees and branches are removed only by sweeps after the issue folder moves. docs/guide/limits.md:10 says only manual repository sweeps and startup cleanup delete them. The actual targeted and tab_closed paths now reconcile the repository. The repaired tests/next.test.ts verifies removal in the completing targeted pass, and the full suite passes 779 tests. No concrete unsafe operator action was established from the outdated guide claims, so the concern remains a Nit.

## Learning

When cleanup timing changes, follow the reference index into existing lifecycle guides even when the implementation plan excludes guide edits. Judge outdated claims against the real operator workflow. Report stale descriptions as Nits until evidence establishes a current contract violation or harmful action. This is a judgment lesson because deciding whether prose matches runtime behavior and has a concrete consequence needs semantic review.
