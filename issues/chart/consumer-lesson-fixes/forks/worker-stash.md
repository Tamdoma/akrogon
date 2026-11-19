# worker-stash

## Question

See the round below and slots/worker-stash-merged.md.

### Carries

- Signposts: forks/signposts.md ## Taken (1a 2a 3a 4a 5a 6a).
- Opening maps: slots/map-A.md, map-B.md, map-C.md, map-D.md.

## Findings

Merged notes: slots/worker-stash-merged.md. Rebuttals: slots/worker-stash-rebuttal-B.md, -C.md, -D.md.

Charting observations (free, scratch repo, git 2.56.1, 2026-11-17, scratch deleted): (1) `git worktree add --detach` twice, stash in w1, stash plus two pops in w2: the second pop applied w1's edit; limits: proves the shared ref on this git, not how often workers stash. (2) `git clone --shared` worker plus `git fetch` and `git cherry-pick FETCH_HEAD` landed the unit with a private stash; then `akrogon run-check --name probe -- true` from a clone of the akrogon repo exited 1 "No initialized registered checkout" (src/config.ts requireRepo); limits: no other worker command probed. Final check: slots/final-shape.md, slots/final-check-B.md, -C.md, -D.md.

## Taken

A's pick under full autopilot, 2026-11-17, not operator words: 1a prose, scope 2a.

- Two homes. skills/implement-issue/brief-template.md section 5 carries, for every sub-brief: never run any `git stash` subcommand, because every worktree of the repo shares one stash and a pop can lift a sibling's edit; to check behaviour on the base use a second worktree of the base. For a delegated leaf worker only (final checks B, C): set work aside as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work; section 4 records the commit A created the worker worktree at, which a relaunched worker reads from the same brief (C, D, B). skills/implement-issue/SKILL.md Shared context refresh: A never runs `git stash` in a leaf or worker worktree, at a refresh or any other time, since leaf worktrees of different leaves share the stash.
- Reason: signposts 2a. No one change removes the shared ref: a per-worker clone breaks `akrogon run-check` (probe), worker-protocol's cleanup and sparse checkout (C, D). Prose reaches every harness (signposts 3a).
- Rejected: 1b clone (A, B before the probe), 1c stash-list compare at integration (acts after the swap, false refusals; signposts 2a rejected two mechanisms), 1d `refs/stash/blocked` (blocks the operator's stash in every consumer repo), 1e reference-transaction hook (misses `stash apply`, no install owner), harness hook (signposts 3a). No worker-protocol copy (D: same reader chain).
- Standing dissent: C keeps 1c as an add-on.
- Retire: prose is not a stop; the framework lesson `history/2026-10-16-stash-shared-across-worker-worktrees.md` stays active, and the done record says so.
- Correction after the focused check (C section 4 field, B/C scoping) was adopted without a second check: it narrows the line's scope and adds a value A already knows; the leaf review reads it.
- Correction after leaf review, 2026-11-17 (A's pick, D): A fills the creation commit in section 4 when it creates the worker worktree at its wave, never when it writes the sub-briefs, since later waves start after earlier cherry-picks.
