# Merged notes: worker-stash (#141)

Sources: map-A.md, map-B.md, map-C.md, map-D.md. Tags name the slots whose own map wrote the line.

Reproduces (A,B,C,D): two `git worktree add --detach` worktrees share `refs/stash`; a pop in one applied the other's edit. No akrogon code creates worker worktrees; A does it by worker-protocol `## Launch and return` text (A,B,C,D). A git alias cannot shadow `stash` (C,D); per-worktree config has no stash-ref key (B,C).

Q1 What stops the swap?
- 1a Prose (C,D): a do-not line in brief-template.md section 5 so every sub-brief carries it, with its reason and the replacement (WIP commit on the detached HEAD, made before the unit's returned commit; to test the base, a second worktree of the base) (C,D); the same rule beside the `pkill` ban in worker-protocol `## Launch and return` (C); implement-issue SKILL.md Shared context refresh widened from "before every refresh" to never stashing in a leaf or worker worktree, since leaf worktrees of different leaves share the ref too (D). Holds in every harness. Cost: prose, so the framework lesson stays active under today's Retire; the done record says so (C,D).
- 1b Per-worker clone `git clone --shared` plus fetch and cherry-pick (A,B). Removes the shared ref for workers. Cost found after the map: `akrogon run-check` from a clone fails "No initialized registered checkout" (door probe 2026-11-17, src/config.ts requireRepo; B Q1 predicted it), and workers must keep output through run-check (worker-protocol `## Failure ownership`). Also `src/reconcile.ts`/`src/evidence.ts` read `git worktree list` (D), the sparse `issues/` exclusion and dirty-tree refusal of `git worktree remove` are lost (C,D), and leaf worktrees still share the ref (D). Not one change.
- 1c A compares the full stash list at wave start and each return and refuses to integrate on a change (C). After the harm, false refusals when anyone stashes repo-wide (C).
- 1d `refs/stash/blocked` so git cannot create `refs/stash` (D). Refuses on every path but blocks the operator's stash in every consumer repo, cannot be made when a stash exists, names no cause (D).
- 1e `reference-transaction` hook refusing stash-ref writes from worker git dirs (C). Misses `stash apply`, no install owner, bypassable (C).
- Harness hook: out under signposts 3a (A,C,D).

Q2 Who is bound?
- 2a Workers and A in every leaf and worker worktree (D); standalone workers get it through the same brief template (A).
- 2b Workers only (C), matching the case.

Pitfalls: a line only A reads never reaches workers (C,D) — removed by the brief-template placement; the completion claiming the lesson is stopped (C,D) — removed by a done record stating it stays; a leftover WIP commit returned as the unit (C) — removed by the line saying the returned commit is made after the WIP is folded in.

Proof (A,C,D): rule text, read by the review seat (signposts 6a); no test. The charting probe is the mechanism evidence.

Differences: A and B favoured the clone before the run-check probe; C and D favour prose. C adds the integration compare (1c); D widens to A's own leaf worktree (2a).
