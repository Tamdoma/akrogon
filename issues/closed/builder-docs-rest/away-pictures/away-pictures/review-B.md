# Review B: away-pictures check.review

Base `f6fb18643f6dfc31f8e7e801660f80d1887947c8`, reviewed head `59f72ff111884002d2c4f2d285c8a051e8945491` (worktree clean). Reviewed blind, peer review not read.

Verdict: **nits**

## Test-Change trailers in f6fb1864..HEAD

- `e98df84a` `tests/docs-pictures.test.ts away-pictures plan D8: done-criteria 1, 2 and 4 add pages 11 and 12 and a whole-folder mark check`. Holds: the diff only adds `AWAY_PAGES`, `folderPictures`, two tests, and extracts `markProblems` from `pictureProblems` with the same loop body. No existing assertion changed or deleted.
- `e7af8fe5` `tests/AREA.md away-pictures plan D8: describes the wider picture test scope`. Holds: one line widened to pages 11, 12 and every SVG in `docs/pictures/`, which the new tests do.

## Criteria

- C1 sections: all 5 `##` sections of page 11 plus the opener, and all 6 `##` sections of page 12 plus `### Recover a failed leaf in four steps`, embed a picture. No shares. Each alt text equals its SVG's `<desc>` (B's own shell compare, 12 of 12 `eq`). Alt text is plain and labels use the page's own words. Retired phrases (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`) and `cron`/`expir`: 0 SVGs match (B's grep).
- C2 mark and markup: whole-folder test green over 36 SVGs (`check pictures: 0 implementation/check-pictures-1795791344848-2637160.log`, 5 pass). Report search `check svg-search: 0 implementation/check-svg-search-1795791352290-2638177.log` lists all 12 new SVGs with forbidden=0, em=0, "created by"=1, `<title>Tamdoma</title>`=1. `check dash: 0 ...check-dash-1795791345001-2637244.log`, 4 pass.
- C3 renders: B rendered all 12 with `rsvg-convert -b white -w 960` and `watch-loop.svg` with `-b '#0d1117'`, and read every PNG. Answers to "what does this picture show?":
  - `watch-loop.svg`: one night in `w-client-portal` on a time line. You start the watch in the evening, `cp-watch` ticks every 20 minutes, ticks fan into one check over both leaves, `scheduled-email` starting after `csv-export` merges, and a stop-list item that sends a notice you read in the morning. Dark render: the opaque card holds, every label reads.
  - `watch-start.svg`: you send `watch-issues ~/code/client-portal`, it launches one `cp-watch` timer and runs one check now, then each tick runs one check. Side notes: one per repo, busy watcher keeps the latest tick.
  - `watch-check.svg`: the six steps left to right (observe, start, retry, loop check, consult, notice), a paused read stopping after step 1, and two unproductive retries opening a consult case.
  - `watch-moves-or-waits.svg`: three columns, keeps moving, waits for you (stop list), never does. Every item matches the page lists.
  - `watch-stop.svg`: `watch-issues stop` ends `cp-watch` and `cp-watch-consult`. Three boxes: stops on its own, may keep running (`/new` on codex and pi), stays alive (compaction, no open leaves).
  - `failed-work.svg`: the four-step stop (test send, Postmark rejects, seat runs `akrogon phase ... failed`, failed), what Akrogon records (reason, notice, tab rename), what stays on disk, and the dashed side box that a missing key only waits.
  - `recover-failed.svg`: the four recovery commands with a note under each, and the tab name going from `scheduled-email failed` back to `scheduled-email` at step 3.
  - `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg`: one row of four controls with the section's control highlighted and its detail panel below. Each detail matches its section (park folder move and refusals, `paused.yaml` and `unpause`, `stopped.yaml`, `start`, `stop-run`, `leftovers`).
  - `refusals.svg`: command, refusal, leaf stays in phase, fix and rerun, with the four page examples below.
  - `journey.svg`: pages 04 to 12 as a path for the two features, ending at the docs shelf (Other tools, Reference).
  - No overflow, overlap or clipped text in any render. Every picture shows its section's content.
- C4 only new-style, links: `docs/pictures/` holds 36 SVGs, all with the mark (whole-folder test). `check links: 0 ...check-links-1795791345180-2637341.log`, 18 pass, run after the deletion commit. B's `git grep` for the 18 deleted file names finds no picture reference outside `issues/` (the `chart-door` hits are the term, not the SVG).
- C5 watch: `check watch-docs: 0 ...check-watch-docs-1795791345354-2637458.log`, 5 pass. Leaf verify receipt for `59f72ff1` (run `5f94b92a`) green: setup, format, typecheck, test.

Proof order: every cited log ran on `59f72ff1`, after the last change to the test file (`e98df84a`). Commands match the ones `plan.md` names. No test is skipped or filtered.

## Shelf text (D7)

Each of the five replacement sentences was checked against its page body: `checks.md` (receipt and gate, lines 64 to 83), `config.md` (same order as the old alt), `files.md` (default store, line 103), `releases-and-updates.md` (deploy from the fetched tip, `current` link, lines 12 and 26 to 28), `state-and-phases.md` (phase table, lines 13 to 20). No wrong claim.

## AREA.md listing

`tests/AREA.md` paths checked from the repo root with one shell loop. One missing: `tests/budget.test.ts` (see N1). No documented behavior changed beyond the picture test line, which is accurate.

## Fixes

None.

## Nits

- N1 `tests/AREA.md` names `tests/budget.test.ts`, deleted by `387d6d6f` and already missing on base `f6fb1864`. The line is outside this leaf's diff and exclusions, so it opens no repair here. It would become a Fix in a leaf that edits that line or owns `tests/AREA.md` upkeep. Recorded as a new case in `learnings/history/2026-09-14-ambiguous-prose-after-rename.md` (matching lesson "sweep prose for the old term"), left for the operator to commit.

## Operator actions

None.

## check.repair 2026-11-27 (merge exit)

Merge exit fields: `merge-exit=conflict`, `base=154534374fe4f8ac0e905af0f95bdf4cff483513`. No `run`, `refusal`, `base_verdict` or `top` was given. Both initial reviews were `nits`, so no Fix and nothing to hand to A.

Cause: setup-pictures landed on main (`f629638f`..`15453437`) and edited the same lines of `tests/docs-pictures.test.ts` and `tests/AREA.md`. The plan's open limitations named this risk.

- Target: `154534374fe4f8ac0e905af0f95bdf4cff483513`. Prior head: `59f72ff111884002d2c4f2d285c8a051e8945491`. Resolved head: `8db9e27b0305121a2cf64acac3acf3752440d056`.
- Resolution (keeps both sides): in `tests/docs-pictures.test.ts`, main's `SETUP_PAGES`, `HERO`, `heroAlt` and the three setup tests stay. The leaf's `AWAY_PAGES` and its two tests are added after them. No existing assertion was changed or deleted. In `tests/AREA.md`, the one line now names pages 01 to 08 (except the c- tab section) and 11 and 12, the README hero, and every SVG in `docs/pictures/`. Both commits keep their `Test-Change:` trailers.
- `git range-diff f6fb1864..59f72ff1 1545343..8db9e27b`: `1: e98df84a ! 1: 96f2e0e2` changed only by the conflict resolution above. `e7af8fe5 = bff19d29`, `5eb72369 = cc05cd17`, `24cef134 = 6c114686` and `59f72ff1 = 8db9e27b` are unchanged.
- Retired-lesson re-removal helper output: `none`. No commit.
- Proof on the resolved head: `check rebase-docs: 0 implementation/check-rebase-docs-1795791812487-3654628.log` (pictures, links and em-dash tests, 30 pass, including the whole-folder mark test over the 12 setup-pictures SVGs too), and `check rebase-watch-docs: 0 implementation/check-rebase-watch-docs-1795791812673-3654758.log` (5 pass).
- `akrogon verify` on `8db9e27b`: setup, format, typecheck and test all 0. `verify leaf 8db9e27b0305121a2cf64acac3acf3752440d056: green`.
- No leftover capture pairs in the leaf folder.

Handed to A: none. Operator actions: none. Nits N1 (B) and N1 to N3 (A) stay. B's N1 is already recorded as a lesson case, and A's N2 and N3 are each one reader's interpretation, so they are not lessons.
