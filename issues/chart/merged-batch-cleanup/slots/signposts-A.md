# Signposts angles, slot A

1. Reach: what does the fix cover?
   - 1a (rec) The class the report implies: a pass's cleanup sees the state that same pass leaves behind, so any merged leaf whose batch the pass released (both release branches in `reconcileBatch`, including the `merge` holder that `commandMerged` moves inside the pass) is cleaned up in that pass.
   - 1b Only the observed branch (holder already merged, batch released).
   - 1c Any missed wake anywhere (a periodic safety pass).
   - Steers: mechanism fork, done-criteria breadth.

2. Self-contained pass or restored wakes?
   - 2a (rec) The pass that changes the state finishes its own cleanup; no new timer, event or listener rule. Removes the dependence the report names ("should not depend on a later, unrelated pass").
   - 2b Restore the old herdr wake density in the listener (more events, or a timer).
   - Steers: whether src/listen.ts is touched; the "worked on old herdr" question becomes background, not a requirement.

3. Removing over adding: when the fix can remove a transient state or add a second cleanup call, which wins?
   - 3a (rec) Remove the window (no merged leaf left holding a batch the cleanup must wait on) where it is safe; a second cleanup call only if removal is unsafe.
   - 3b Smallest diff wins.
   - Steers: mechanism fork options.

4. Visibility: also make a kept-for-batch merged leaf show as a leftover in `akrogon status`?
   - 4a (rec) No. Once cleanup cannot miss it, the window lasts seconds; recorded only.
   - 4b Yes, add it.
   - Steers: leaf count.

5. Proof spending.
   - 5a (rec) No paid calls, no live mutations: tests in fixtures prove red on base and green after. The stale framework leftovers are the operator's (workaround `akrogon next` in framework).
   - 5b Approve a live run on the framework leftovers as proof.
   - Steers: needs sheet, proofs.

Needs: none foreseen.
