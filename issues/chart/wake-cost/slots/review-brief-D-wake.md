# Review brief: wake-cost (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/wake-cost, branch wake-cost, base 814a2387.
- Commit 1 706042c0 (release 1): schema accepts optional state.wait; repoInventory open-only by default, closed named where needed; closedLeaf lookup for blocked-by; closed-dependents sweep block replaced by a wake filter term; residue deletion.
- Commit 2 e118b7b3 (release 2): recordWait writes state.wait under the global lock; wake reads no timings.jsonl.

Contract: forks/design.md "Taken" picks 1-5 and every "Final shape corrections" line in this chart folder. Inputs behind it: slots/design-B.md, slots/design-C.md, slots/final-B.md, slots/final-C.md.

Helper's own departures from the design, to judge: closed named also in mergeTurn batch scan, reconcileBatch lookups and selectLeaves; dispatchLeaf and phaseWake fall back to closedLeaf; an unreadable issues/closed no longer reserves capacity. issues/red-records.jsonl removal moved out of the branch (A does it on main).

Check each commit on its own: release 1 must run against state written by release 2 (rollback), and release 2 against release 1 state. Look for a wake caller that still needs closed leaves and now misses them, and for a state.wait write that races another state save.

Verdict ready, nits or fix. Fixes only for concrete defects with a reproducing scenario, file:line.
