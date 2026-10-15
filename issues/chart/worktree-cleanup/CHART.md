# Chart: worktree-cleanup

## Destination
After a leaf merges, reconcile removes the worktrees it left behind (verify, merge-build, worker and the leaf's own), anything it keeps is visible with its reason, and akrogon's folders and outputs stay clean of junk and leftovers. Registered repo: akrogon.

Route: lifecycle (debate no)

## Forks taken
- [Scratch copy removal](forks/scratch-copy-removal.md): force-remove dead verify and build copies (2a); force-remove worker copies once the owner merged, failed keeps the guard (3a). Correction: build copies protected by an owner record written before the copy (Round 2, 1a).
- [After-merge remainder](forks/after-merge-remainder.md): stacked members closed at once (2a); dirty merged leaf worktree kept and shown (3a); plain status shows kept entries (4a); unregistered folders deleted, mechanism in store-hygiene (5).
- [Store hygiene](forks/store-hygiene.md): clean all akrogon places, stop a finished leaf's leftover processes from reconcile once its tab is gone, fix leaking tests (1a); ownership proves safety, live pane or process blocks (2a); runs in every reconcile pass, unprovable items kept and shown, never aged out (3a).

## Open forks
none

## Fog
none

## Off route
- The framework test "SIGKILL of the direct browser owner" killing its verify parent: framework-side cause of the verify leftovers, reported separately on operator request.
- Dead verify records without `end`: `greenRun` ignores them (src/verify.ts:63-77).

## Pending steps
- After store-sweep, finished-leaf-processes and test-isolation merge: run `akrogon next --all` from outside any registered repo, then check that each path in [store-hygiene F1](forks/store-hygiene.md) is gone or shown with a reason in plain `akrogon status`, and that no `akrogon-l*.slice` of a finished leaf is loaded. Owner: the door. Proof: the listing before and after, recorded in this chart.

Handed off 2026-10-15
