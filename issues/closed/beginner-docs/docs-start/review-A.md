# Review A: docs-start

Base `b72f24d58fa86ce909d3a5a52d750a440e47da37`. Reviewed head `942e2020e78ca0fc8eb9305cf8f0d5b4f86ef190`. The diff has 28 files, with 448 insertions and 2220 deletions.

## Verification evidence

- `akrogon verify` on `942e2020` came back green for format, test (1113 pass, 0 fail) and typecheck (implementation/report.md).
- Criterion proofs on `942e2020` are in report.md: docs-links 8 pass, c3-scrub no match, c5-guide-refs exit 0 (red before), log-reader 4 pass, c7-no-dates no match. Nothing has changed since, so I did not rerun them.
- No `AREA.md` is in the diff. `docs/reference-index.md` changed one line, and its new targets `README.md` and `reference/where-things-go.md` exist (docs-links passes).

## Criteria

1. README is one screen: what it is, who it is for, the what-you-need box, factory-overview.svg with alt text, the docs-home link and five daily-job links. It has no command table, install, rollback or counts. Holds.
2. The five start pages read in order, and each ends with a Next link. `one-change.md` ends at `../use/a-working-day.md`. install.md has the readiness block with expected results and the skip-ahead line. Each page embeds the pictures in its map row with descriptive alt text. No page asks for an exercise. Install and setup commands are for the reader's own machine, which the design allows. Holds.
3. one-change.md: the scrub found no identifiers. B's review against provenance is still to come.
4. The reference-index link, words.md (29 terms, each linked) and where-things-go.md (folders, one home, link rule, code-change rule) are present. Holds.
5. `docs/guide/` is gone and `git grep docs/guide` outside issues/ and learnings/ is empty. The cleared references are listed in report.md. Holds.
6. The only test change is the 6-line wording test removed from `tests/log-reader.test.ts`, with its `Test-Change:` trailer citing design fact-ownership Q2. The four runtime tests are unchanged and pass. Holds.
7. Claims checked against the code:
   - Install conflict output prints `rm -r -- <path>` and stops (`src/install.ts:130-133`).
   - Install creates the `akrogon.slice` link at `~/.config/systemd/user/` (`src/install.ts:32-33`), then runs `daemon-reload`, `herdr integration install` per harness and `herdr plugin link` (`src/install.ts:135-137`).
   - init registers under the folder basename (`src/init.ts:31`) and writes `learnings/LESSONS.md merge=union` (`src/init.ts:72`).
   - The Herdr plugin runs `next.sh` on pane status changes (`plugin/herdr-plugin.toml`).
   - Pause is per repo (`src/pause.ts:49-65`).
   - Chart rounds take one fork (`skills/chart-issues/SKILL.md:45`).
   - The Test-Change and record rules match `docs/reference/checks.md:86-100`.
   - "Three places" in docs/README.md matches `docs/reference/config.md:3`.

   I found no date, retired name or "was removed" note. Holds as far as I checked. B checks each page against its sources.

## Documented behavior

No runtime behavior changed. Docs moved from `docs/guide/` to the new pages, and the old pages were deleted only after their references were cleared.

## Findings

### Nits

- N1. Criterion 5 is proven by a one-off grep, not a standing check. A later plain-text "docs/guide" mention (not a link) would pass every configured check, because docs-links catches only links. I deferred it because the design rules out new tests and the criterion is met today. It would become a Fix if a stale plain-text `docs/guide` mention lands on main.

## Verdict

nits
