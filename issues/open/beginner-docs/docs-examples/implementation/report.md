# Report: docs-examples

Base `7fb2ad957a702b6834a2ba77e1db64e65ed3d482`. Committed head `2c073b38d13f91c975d7177547ac8061aa452f1c`. Both refreshes (start and end) found the branch current on `origin/main`, so the branch never moved.

Mode: delegated. Wave 1 had U1-U3 as parallel workers, and wave 2 had U4. Briefs are in `brief-1.md` to `brief-4.md`, with shared rules in `common.md`. All worker worktrees are removed.

## Changed files

| File | Commit | Reason |
|---|---|---|
| docs/examples/quick-fix-story.md | 7da9fb6a | U1: the direct-route story (P1, not named) |
| docs/examples/autopilot-story.md | 0d191b9a | U2: the autopilot story (P1, not named) |
| docs/examples/recovery-story.md | 07d17f04 | U3: the varhop recovery story (named, linked) |
| docs/examples/README.md | 2c073b38 | U4: what each story shows |

No test, source or other doc changed. The plan's "docs affected" line holds.

## Criteria and evidence

1. **Each story matches its landed record, and the varhop conflict is told accurately.**
   - Each worker re-checked landing before writing, with `git fetch` and `git merge-base --is-ancestor <commit> origin/main` on the source repo. Results:
     - Quick fix: landed.
     - Autopilot: `brand-raster-webp`, `pagespeed-rank-preflight` and `lighthouse-floor-gate` all show `phase: merged`, and each landed on P1 main. For `lighthouse-floor-gate`, U2 used the leaf's recorded push commit because the commit scope differs from the slug.
     - varhop: `0be8ca4` is on main.
   - varhop conflict (D4), confirmed in the records by U3:
     - The archived `overlay-plugin` folder says `phase: failed` with fix_rounds 4.
     - The disposal fork chose to retire the leaf and keep code `0df6f48`.
     - The successor `overlay-plugin` in `issues/closed/overlay-rework/` says `phase: merged`.
     - `overlay-rework` merged at `0be8ca4` and closed varhop#1.
     - recovery-story.md says both records are true.
   - Seat B compares the stories to the records.
2. **No private names, paths, ids or dates.**
   - Generic scrub on the final head: `check examples-scrub: 0 implementation/check-examples-scrub-1792769108344-3876070.log`.
   - Private-name scrub by A, with a word list built from provenance.md and the autopilot intake: `check examples-private: 0 implementation/check-examples-private-1792769108258-3876011.log`. No match. The list was deleted. Each worker also ran its own list (no match).
   - The only project named is varhop, which links to its repo, varhop#1 and public commits.
   - Seat B reviews each page's text, links, alt text and images.
3. **Plain telling with today's commands and links, not instructions.**
   - `check test: 0 implementation/check-test-1792769045269-3870798.log` ran `docs-links`, `hold-retired` and `run-permit` after wave 1, with 23 pass. The README landed after that, and `akrogon verify` below covers it.
   - A read all four pages. They are past tense, link the `use/` and `reference/` pages for each step, and end with a next link. None links `docs/guide/` or `docs/start/`.
   - Seat B reviews tone and step coverage.

## Checks

- `akrogon verify` on `2c073b38` is green:
  - test: 1114 pass, 0 fail, `check-test-1792769272478-3876348.log`
  - typecheck: green, `check-typecheck-1792769274750-3876348.log`
  - format: green (the verify receipt says `verify leaf 2c073b38…: green`)
  - Wall time about 3 minutes.
- An earlier run in plan.synthesis, before `bun install`, failed on a missing `zod`. The cause was the fresh worktree, not the leaf.

## Worker notes folded in

- **U1:**
  - The direct chart had no separate brief or design file. The settled fork's `Taken` section was the contract, and the page says so.
  - A tool-side worktree loss during the attempt was left out because it is not part of the route.
- **U2:**
  - P1 is described as "a project that builds client websites", which matches the records better than "a company website".
  - The page does not claim who ran `akrogon next`, or that the broadcast was sent.
- **U3:**
  - The records show no command for the archive move, so the page says the door moved the folder, as CHART.md records.
  - The successor went under the issue `overlay-rework` (per the split fork), not the issue the disposal fork first named. The page follows what landed.

## Known limitations

- The private-name scrub is only as good as the word list. B's review is the backstop.
- Tool behavior in the stories was checked against `src/` and the skills by the workers and by A's spot checks (`src/pull.ts:124` closes `sources` issues, and `next.ts` reuses a worktree for the same slug). A did not re-verify every sentence.

## Unverified criteria

None. Criteria 1-3 also carry B's review by design.
