# Worktree location

## Question
Q1. Where do leaf worktrees and base checkouts live so parent-folder lookups cannot reach the registered checkout: a new default outside the repo (for example under the akrogon home), per-repo config only, or both? What happens to existing worktrees under `issues/worktrees/`?

### Carries
- Operator 2026-10-10: 2a, add this fork.
- C8 false red: leaf and nested base worktrees under `issues/worktrees/` resolve the main checkout's `node_modules` (framework cheap-checks report.md:44, spawn-deadlines report.md:17-20).
- `worktree_root` default `issues/worktrees` (src/config.ts:42), resolved with `resolve(repo.root, ...)` (src/config.ts:233) but with `expandPath` in src/sync.ts:17. Framework sets `worktree_root: issues/worktrees`.
- B final check: base checkouts need the same placement, and existing worktrees stay exposed if only future leaves move.

## Findings
Merged: slots/worktree-location-merged.md (A, B, rebuttal B). Agreed (A,B): default sibling `<checkout>-worktrees`, reject any root whose real path is inside the checkout, one resolver (src/config.ts:233, src/init.ts:60, src/sync.ts:17). Base checkouts already external via mktemp under leaf TMPDIR (src/config.ts:232-245, src/next.ts:413); only the same reject on the leaf temp root. globalHome rejected (defaults to the akrogon repo, src/config.ts:172-177). B withdrew manual migration. Rebuttal: F1 cleanup removes only completed trees (src/next.ts:747-753), so failed/abandoned leaves keep nested trees; F2 keeping recorded paths needs one selection rule in ensureWorktree, tab matching and mustCreate (src/next.ts:276-290,354-356,711-713), never recreating an absent tree at a nested path; F3 framework and akrogon issues/config.yaml:3 pin `issues/worktrees`, so someone named must change them.


Operator, 2026-10-10: "1 - Look at how akrogon will solve it with the new merges (~/.akrogon/ something), we should mirror this as well. | 2a | 3a"
Then: "why are you asking about the copies for the framework? what does the framework have to do with akrogon? They're not connected in any shape or form?"
Found: framework chart issues/chart/worktree-isolation boundary Taken 2a already sets the akrogon store `~/.akrogon/worktrees/<repo>/<slug>` with an ancestor guard, migration Taken 1a/2a removes clean old worktrees and recreates at the store. Also untracked akrogon issues/chart/sources/main-health-from-framework covers the same problem as this chart with opposite decisions (held.yaml kept as shared record, leaves held in place). Pending operator direction on both overlaps.
Operator, 2026-10-10: "ok, you tell chart-framework tab what to do." then "send, tell it also where to put these files and everything else that you need to tell it"

## Taken
Delegated. framework issues/chart/worktree-isolation owns the store `~/.akrogon/worktrees/<repo>/<slug>` (framework: ~/.akrogon/worktrees/framework/<slug>, akrogon: ~/.akrogon/worktrees/akrogon/<slug>), the ancestor guard, migration/reconciler (replaces 2a), both repos' worktree_root lines (replaces 3a) and the `akrogon base-run` verb. Its akrogon-code leaves hand off to the akrogon repo. red-base-wait builds none of these; its comparison calls `akrogon base-run` with caller-supplied baseline. Message: slots/to-chart-framework.md.

