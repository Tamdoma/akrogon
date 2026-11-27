# Report: away-pictures implement

Base `f6fb1864` (origin/main, unchanged by both refreshes). Committed head `59f72ff1`. No refresh moved the branch.

Mode: subagents, one wave of three units (plan U1, U2, U3), each in its own worktree at `e7af8fe5`, cherry-picked in order and removed. No paid runs, no grants, no credentials.

## Commits

- `e98df84a`, `e7af8fe5`: planned tests and `tests/AREA.md` line (plan.synthesis), with `Test-Change` trailers.
- `5eb72369` (U1, from `c8ac8571`): page 11 pictures.
- `24cef134` (U2, from `ee49cba5`): page 12 pictures.
- `59f72ff1` (U3, from `68280d28`): old-picture deletion and shelf text.

## Changed files and reasons

- `docs/pictures/watch-loop.svg`: redrawn as the overnight watcher (D1), page 11 opener.
- New `docs/pictures/watch-start.svg`, `watch-check.svg`, `watch-moves-or-waits.svg`, `watch-stop.svg`: one under each page 11 section (D1).
- New `docs/pictures/failed-work.svg`, `recover-failed.svg`, `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg`, `refusals.svg`, `journey.svg`: one under each page 12 section and the recovery subsection (D2, D6). `hold-stop.svg` highlights both `stop` and `stop-run` because that section covers both.
- `docs/guide/11-while-you-are-away.md`, `docs/guide/12-when-work-stops.md`: embed lines only (diff checked: no other line changed). Every alt text equals its SVG's `<desc>`.
- 18 old-style SVGs deleted (D5).
- `docs/reference/checks.md`, `config.md`, `state-and-phases.md`, `files.md`, `releases-and-updates.md`: embed replaced by one or two sentences (D7). Worker corrections against the page bodies: checks.md says verify writes a receipt on every run and the moves need a green one; releases says a deploy builds from the tip of the remote default branch; files.md says the store path is the default.

## Shares

None. Every `##` section on pages 11 and 12 has its own picture.

## Criteria and proof (all on head `59f72ff1` unless noted)

- C1 sections: `akrogon run-check --name pictures -- bun test tests/docs-pictures.test.ts`, 5 pass 0 fail, `check pictures: 0 implementation/check-pictures-1795791344848-2637160.log` (run on `59f72ff1` before the no-op refresh). Plain alt text and approved words: retired-phrase search found 0 files (svg-search log below). Slot B reads alt text and labels.
- C2 mark and markup: same pictures log (whole-folder test green over all 36 SVGs); `check dash: 0 implementation/check-dash-1795791345001-2637244.log` (4 pass); report search `check svg-search: 0 implementation/check-svg-search-1795791352290-2638177.log`: every one of the 12 new SVGs has forbidden=0, em dash=0, "created by"=1, `<title>Tamdoma</title>`=1.
- C3 renders: A rendered all 12 on white with `rsvg-convert -b white -w 960` and `watch-loop.svg` on `#0d1117`, and read each PNG. All 12 show their section's content with no overflow or overlap, and the dark render shows the opaque card. Slot B's own reading is the criterion.
- C4 only new-style, links: whole-folder test green (36 files, all with the mark); `check links: 0 implementation/check-links-1795791345180-2637341.log` (18 pass, run after the deletion commit); `git grep` for the 18 deleted names finds nothing (svg-search log).
- C5 watch: `check watch-docs: 0 implementation/check-watch-docs-1795791345354-2637458.log` (5 pass); `cron`/`expir` count 0 on page 11 and every `watch-*.svg` (svg-search log). `akrogon verify` on `59f72ff1`: setup, format, typecheck, test all 0, `verify leaf 59f72ff111884002d2c4f2d285c8a051e8945491: green`, wall time 3m34s.

## Worker returns

- U1: 5 pictures, every render read. It reported that U2 overwrote its temporary build script in the shared scratch folder once, so it rebuilt from a private folder. An earlier draft of `watch-moves-or-waits.svg` ended up untracked in U2's worktree. A compared it with U1's committed file (they differ), deleted the stray draft, and kept U1's committed version.
- U2: 7 pictures, every render read. Its scan found no forbidden markup or retired phrases.
- U3: deletions and shelf text, links green after its commit.

## Known limitations

- setup-pictures and build-pictures also edit `tests/docs-pictures.test.ts`, so a text conflict is possible when they land.

## Unverified criteria

- C1's share acceptance and C3's reading are slot B's judgment. No shares were made.
