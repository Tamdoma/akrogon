# Implementation report: docs-pictures-concepts

Base `7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8`. Committed head `51b8207614761e0926d1969468a2e52124cf406f`. The refresh before the first unit and the one before verify both found the branch already on `origin/main`, so neither moved it.

## Changed files

The nine pictures are new files in `docs/pictures/`:

- Moving: factory-overview, two-seats, chart-door.
- Still: machine-parts, project-folders, grounding, config-layers, phases, ways-to-run.

No other file changed and no doc is affected (plan D1).

Commits:

| Commit | Contents | Picked from |
|---|---|---|
| a4a2313a | U1: factory-overview, two-seats, chart-door | 6d70ad22 |
| d089320e | U2: machine-parts, project-folders, grounding | 2b6cdcb8 |
| a85b9814 | U3: config-layers, phases, ways-to-run | deaea05b |
| 51b82076 | A's repair | none |

A's repair made two fixes the picture check found:

- grounding.svg: text overflowed the bottom border of three boxes. Box heights are now 120 and the view is 532 tall.
- chart-door.svg: one stray edge ran from C's note to the merge with no matching edge from B. The notes return to A through the ⇄ edges, so the stray edge was removed.

## Wave 1 delegation

Wave 1 ran three workers in parallel (briefs `implementation/brief-1.md`, `brief-2.md`, `brief-3.md`), each in its own `<store>/docs-pictures-concepts-u<N>` worktree. The worktrees were removed after cherry-pick.

## Spec versus source

Each picture follows the live source where the map spec disagreed. These are listed for B's C1 review.

1. factory-overview: the direct route joins "merged", labelled "door lands it itself", not "command lands". The door verifies and pushes direct work itself (skills/chart-issues/SKILL.md:91, :113-115). `akrogon` lands only leaf work (src/land.ts:83-104).
2. two-seats: check.repair goes to merge or check.fix, never back to review (src/routing.ts:33). Only check.fix returns to review, and the re-review is B's (src/routing.ts:34, :53-54). The loop is drawn that way.
3. grounding: the implement agent works from the plan's read-first list and opens the index only on a gap (skills/implement-issue/SKILL.md:31). It is drawn as plan → implement plus a dashed "only on a gap" line, not as a second reader of the chain.
4. machine-parts: the drawn slice is the per-leaf `akrogon-l<hash>.slice` (src/scope.ts:14), labelled as under `akrogon.slice`, the parent that src/install.ts links.
5. project-folders: entries come from code, not the live tree.
   - Records: log.jsonl (src/log.ts:48), timings.jsonl (src/timing.ts:74), merge-attempts.jsonl (src/attempts.ts:51), verify-runs.jsonl (src/verify.ts:42).
   - Left out: `issues/red-records.jsonl` (no src reference), `issues/worktrees/` (legacy migration only, src/reconcile.ts:398) and `issues/config.yaml` (not in the spec).
   - `parked/` is drawn because src/park.ts:10 creates it.
6. phases: drawn from src/routing.ts:28-36, with failed as one red stop zone. The recovery edges from failed back to working phases (src/routing.ts:37-49) are not drawn, because the spec calls failed a stop.

Every node and edge has a path:line source in the worker returns, which are copied below.

<details><summary>Per-picture sources</summary>

- factory-overview: request → chart door, skills/chart-issues/SKILL.md:23-35. door → contract, :71-73, :87. contract → build, src/routing.ts:31 and src/next.ts:671. build → review, src/routing.ts:31-32. review ⇄ repair, src/routing.ts:32-34. repair → command lands → merged, src/land.ts:83-104. direct branch, skills/chart-issues/SKILL.md:87-91, :108, :115.
- two-seats: src/routing.ts:31-36, :53-54. skills/check-issue/SKILL.md:39, 51, 73, 81, 97. skills/implement-issue/SKILL.md:89.
- chart-door: skills/chart-issues/SKILL.md:21, 43, 45, 49, 55, 57, 71, 73.
- machine-parts: src/config.ts:197-209 (`~/.akrogon/config.yaml`), src/next.ts:143-146, 209-217, 372, 442, 452-456, 506, 608-623, src/scope.ts:13-14, 146, src/install.ts:34-37.
- project-folders: src/pull.ts:74, src/init.ts:55, 62, src/pack-command.ts:34, 36, src/park.ts:10, src/config.ts:275-284, src/next.ts:251, plus the record sources above.
- grounding: src/config.ts:54-57, src/init.ts:12-13, docs/guide/setup.md:78-106, docs/reference-index.md:3, skills/plan-issue/SKILL.md:25, skills/implement-issue/SKILL.md:31.
- config-layers: src/config.ts:17, 144-182, 225.
- phases: src/routing.ts:2-13, 28-36, src/phase.ts:321-326, 378-383.
- ways-to-run: skills/chart-issues/SKILL.md:89-100, 133, skills/watch-issues/SKILL.md:8, 16.
</details>

## C1: nine files exist and are well-formed

- Command: `akrogon run-check --name pictures-present -- sh -c 'cd docs/pictures && ls <nine files> && for f in *.svg; do xmllint --noout "$f" || exit 1; done'`
- Result: `check pictures-present: 0 .../implementation/check-pictures-present-1792764908575-2873060.log` on a85b9814. The later fix changed two files, and `xmllint --noout` passed on both before the r2 runs below.
- Meaning against source is B's review (plan D6).

## C2: picture check

Rig (plan D5):

- `python3 -m http.server 8781 --bind 127.0.0.1` serving `$S/site`, where `$S` = `/var/tmp/akr-1000/5d20/13c1e372/claude-1000/-home-ivan--akrogon-worktrees-akrogon-docs-pictures-concepts/78402441-732e-4cac-8f28-e21f9ba90366/scratchpad/pictures-check`. The site holds a symlink to the leaf's `docs/pictures` and one `embed-<name>.html` per picture.
- Each embed page shows the `<img>` on a white panel and a `#0d1117` panel. This is a small change from the plan's single `embed.html`: one page per picture keeps each screenshot to one picture, with the same observation.
- One blepsis tab, CD75835F.

Every run below exited 0. Logs are `implementation/check-pic-*.log`.

1. Reduced motion (`pic-<name>-reduced`, on a85b9814; grounding and chart-door rerun as `-r2` on the repaired files): screenshots at load and 4s later are pixel-identical (ImageMagick `compare -metric AE` = 0) for all nine. Every one shows the complete picture.
   - Files: `$S/<name>-reduced-0.png`, `$S/<name>-reduced-4.png`.
2. Motion on (`pic-<name>-motion`):
   - The moving pictures differ between about 0.5s and 3s: factory-overview AE 2873, two-seats 1622, chart-door 2769 (r2). The accent highlight is visible in `$S/factory-overview-motion-a.png`.
   - All six still pictures have AE 0.
   - Files: `$S/<name>-motion-a.png`, `$S/<name>-motion-b.png`.
3. Embedded at 800px (`pic-embed-<name>-800`): all labels read on both panels. The card stays solid white on #0d1117.
   - Files: `$S/embed-<name>-800.png`.
4. Embedded at 360px:
   - At 1x density (`pic-embed-<name>-360`): labels render about 7 CSS px tall. They are legible but small.
   - At 3x mobile density (`pic-embed-<name>-360-dpr3`, `set_viewport 360 1600 3 true`): labels are sharp and read clearly. Example: `$S/crop-phases-dpr3.png`.
   - Files: `$S/embed-<name>-360.png`, `$S/embed-<name>-360-dpr3.png`.
5. Montages used for review: `$S/m360-*.png`.

Cleanup:

- The server was stopped by its own PID, and port 8781 is free.
- Tab daemon CD75835F was stopped.
- blepsis has no close-tab command and refuses `about:blank`, so tab CD75835F stays open on a dead loopback URL. No `pkill` or `blepsis quit` was used, because sibling leaves share the browser.

## Checks

`akrogon verify` on 51b82076: `verify leaf 51b8207614761e0926d1969468a2e52124cf406f: green`. Wall time 3m09s.

- format: `.../implementation/check-format-1792765242269-2955282.log`
- test: 1115 pass, 0 fail, `.../implementation/check-test-1792765426475-2955282.log`
- typecheck: `.../implementation/check-typecheck-1792765428853-2955282.log`

## Known limitations

- The reduced-motion proof covers each SVG opened directly in Chromium. It does not prove that the preference reaches GitHub's embedded image (svg-set Q4).
- At 360px and 1x density the labels are about 7px. They are readable but small, which follows from plan D2's 640-wide layout with 14-unit text.
- In phases.svg, the "a fix verdict" label sits between the review → repair edge and the repair → fix edge. It is near its own edge, but a reader could misread it.
- One blepsis tab is left open, as described under Cleanup.

## Unverified criteria

None by A. C1's meaning check is B's review by design.
