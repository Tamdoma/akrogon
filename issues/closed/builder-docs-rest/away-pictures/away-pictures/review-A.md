# Review A: away-pictures (check.review)

Base `f6fb1864`. Reviewed head `59f72ff1` (5 commits ahead, `git status --porcelain` empty). Verdict: **nits**.

## Verification evidence

- Green leaf receipt on `59f72ff1`: `verify leaf 59f72ff111884002d2c4f2d285c8a051e8945491: green` (setup, format, typecheck, test all 0; logs under `implementation/check-*-1795791364371..1795791577830-*.log`). No code changed since, so no rerun.
- Criterion runs on `59f72ff1` (report): `check pictures: 0` (5 pass), `check dash: 0`, `check links: 0` (18 pass, after the deletion commit), `check watch-docs: 0` (5 pass), `check svg-search: 0` (12 new SVGs: forbidden 0, em dash 0, "created by" 1, `<title>Tamdoma</title>` 1; retired phrases 0; `cron`/`expir` 0 on page 11 and every `watch-*.svg`; no deleted name still referenced).
- Planned red at planning: `check-pictures-red`, `check-cond-watch-red`, `check-cond-links-red` (committed-deletion run), `check-cond-mark-dash-red`. Each test is shown red for the behavior it guards.
- Renders: all 12 new pictures on white and `watch-loop.svg` on `#0d1117`, read one by one. Each shows its section's content. Nothing overflows or overlaps, the mark sits bottom right, and the dark render shows the opaque card.

## Against the done-criteria

1. Every `##` section of 11 (4) and 12 (6) has its own picture. There are no shares. Alt text equals each SVG's `<desc>` (scripted compare: 12 of 12) and is plain. Labels use the pages' own words (leaf, slot, watcher). No retired phrase. Met.
2. The whole-folder test compares every SVG's mark group to the first file's (a charting-pictures-more picture) and is green over 36 files. The search found no forbidden markup or em dash. Met.
3. Slot B's reading. A's own read found every picture readable and on topic.
4. `docs/pictures/` holds 36 files, all new-style (whole-folder test). The 5 shelf embeds are replaced by text and the links test is green on the committed deletion. Met.
5. The watch-timer doc tests are green and checks are green. Met.

## Plan and design conformance

- D1, D2, D6: file names and content match the plan. `hold-stop.svg` highlights both `stop` and `stop-run`, which the report records. That follows from the section covering both.
- D5: the 18 deletions match the list exactly. `watch-loop.svg` is redrawn in place.
- D7: each shelf sentence was checked against its page body or source:
  - `checks.md`: verify on a fresh checkout writes a receipt (line 64), and the moves need a green one (line 71).
  - `config.md`: the order matches `## Which seat wins` and `src/config.ts:231-233`.
  - `state-and-phases.md`: matches the allowed-next column of the phase table.
  - `files.md`: the store path matches `## Worktree store`.
  - `releases-and-updates.md`: `current` and rollback match the body's release list.
- Design exclusions: the guide diff on pages 11 and 12 is embed lines and blank lines only (checked by script). No other page or picture changed.
- Docs: `tests/AREA.md` line updated for the wider test. `docs/reference/where-things-go.md` picture rules unchanged and now true for every file. No other documented behavior changed.

## AREA.md check

`tests/AREA.md` paths listed from the repo root: only `tests/budget.test.ts` is missing. That line is unchanged by this leaf (present at `f6fb1864`), so the dead pointer predates it. See Nit N1.

## Fixes

None.

## Nits

- N1: `tests/AREA.md` names `tests/budget.test.ts`, which does not exist. It was already there at base, and this leaf only rewrote the docs-pictures sentence on another line. Deferred because it is outside this leaf's scope. It would become a Fix if a leaf that touches that line left it unchanged.
- N2: `docs/reference/config.md` says its intro reads settings "from three places", and the new sentence right after it lists four files (ISSUE.md, EPIC.md, repo config, machine config). The intro counts the issue and epic files as one place, so nothing is wrong, but a reader may count four. Deferred because the intro text is outside the design's owned lines. A cold reader misreading it would promote this.
- N3: in `recover-failed.svg` the two tab labels at the bottom are drawn with an open bottom edge (tab shape). At a glance they can look clipped. Deferred because the label "the tab" and the shape match the tab drawings elsewhere. Slot B's screenshot reading calling it unclear would promote it.
