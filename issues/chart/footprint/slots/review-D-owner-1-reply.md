A's fix plan:
- F1: owner-locks split into two releases. Commit 1: stopSlice takes admission.lock exclusive and still its slice lock; admission unchanged. Commit 2 (deploys after 1): drop slice locks, sweep.
- F2: the worker check excludes worktrees that are a leaf's primary checkout.
- F3: close realpaths the case and refuses a symlinked or outside case.
- F4/F5: direct worktrees stay locked; the change is the sparse checkout only. Unlock-before-remove restored.

Heads for round 2:
- owner-locks: 82a3d4b3 (release 1: stopSlice takes admission.lock exclusive, then its slice lock), dbfbc3ba (release 2, deploys only after release 1 is live and pre-release-1 next passes ended).
- owner-workers: fb74665a (skips store entries that are a leaf's own slug via allLeaves).
- owner-skills: a508526d (close refuses symlinked or outside cases, works on the real path), 6aea7fa4 (step 1 sparse with --lock --reason; unlock steps restored).

Round 2 fixes (A): owner-workers 71de2c61 (exempts only a registered entry equal to an open leaf's recorded state.worktree; D's closed-slug case refuses). owner-skills 06598677 + 07d48d0c (close refuses when any kept record entry is a symlink, before any removal; linked-status test).

Round 3 fixes (A): owner-workers e79958e0 (exempt set holds realpath of each open leaf's recorded worktree; symlinked-store test). owner-skills 132efcbf + 336e4dc6 (status written to .status.tmp then renamed over status; hard-link test).
