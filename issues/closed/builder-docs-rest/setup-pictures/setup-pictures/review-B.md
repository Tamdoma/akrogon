# Review B: setup-pictures (check.review, initial, blind)

Base f6fb18643f6dfc31f8e7e801660f80d1887947c8 (origin/main, unchanged at review). Reviewed head 154534374fe4f8ac0e905af0f95bdf4cff483513.

Verdict: **nits**

## Diff judged

5 commits: f629638f (tests), 687acdf7, 868adf87, e0cb9022 (12 SVGs and embed lines), 15453437 (docs-links expectation correction). Guide text diff holds only the 12 embed lines plus the README hero line, so the design exclusion "guide text other than embed lines" holds. Embed placement follows D6 on every page (after the first paragraph or the block it introduces, or directly under `##` when a `###` step follows).

## Test-Change trailers in f6fb1864..HEAD

- f629638f `tests/docs-pictures.test.ts`: three cases added, no existing expectation changed. Confirmed in the diff (additions only). Accepted.
- f629638f `tests/AREA.md`: docs-pictures line prose only. Accepted.
- 15453437 `tests/docs-links.test.ts`: cites brief criterion 1 against the old "README carries no picture" expectation, which design R10 wrote as "until the hero exists". The source holds: the hero now exists, so the old expectation is outdated by its own condition. The new expectation is narrower (README images equal exactly `docs/pictures/three-tabs.svg`, `<img` still banned). Red before on the head content with only that case failing (`check-lane-docs-1795791162231-2304112.log`), green after (`check-lane-docs-2-1795791168741-2304687.log`). Accepted.

## Criteria

1. Hero and a picture per section: `check pictures: 0 implementation/check-pictures-1795791320020-2635482.log`, run 15:55:20 after the last commit (15:52:52), 6 pass including both new cases. Share list empty (D4). `three-tabs.svg` used twice is the brief's own placement. Plain alt: every alt line read; each says in plain words what its picture shows and equals the picture content. Approved words: `grep -i -w` for manual, quick fix, seat(s), door, leaf/leaves, attended, autopilot over all 12 SVGs and the added embed lines found nothing (exit 1 both). Labels checked against page text: table values on page 01, `consultant` "the helper agent" (page 01 line 72), `~/.akrogon/current` "symlink" (line 88), `akrogon rollback` (docs/reference/roll-back-a-release.md:10, `src/akrogon.ts:386`), page 03 step commands and the tab table, page 02 AREA.md wording (line 155). All match.
2. Mark group and forbidden markup: same pictures log, mark case compares pages 01 to 08 together; translate is 838 and height minus 22 in all 12 (listed from the SVGs). Em dash: `check dash: 0 implementation/check-dash-1795791320149-2635555.log`. Report search: `check svg-search: 0 implementation/check-svg-search-1795791320285-2635648.log`, every file `forbidden=0 created_by=1 title=1`. Planning reds K1 to K3 are recorded with logs.
3. B's renders: `rsvg-convert -b white` for all 12 and `-b '#0d1117'` for `three-tabs.svg`, in `/var/tmp/akr-1000/5d20/e99d7cea/claude-1000/-home-ivan--akrogon-worktrees-akrogon-setup-pictures/218fe963-a8a0-447e-83a5-fe0490003433/scratchpad/renders/`. Each PNG opened and read. "What does this picture show?":
   - `machine-check`: a checklist of eight prerequisites with check command and ready output, GitHub CLI dashed as optional. Matches `## Check your machine`.
   - `install-steps`: five numbered boxes clone, write config, install, PATH, verify, with a box under step 3 listing what install creates. Matches.
   - `agent-clis`: `~/.akrogon/config.yaml` folder with slots a, b, consultant arrowed to claude, codex, pi under `harnesses:`, agy unused; footnote that every named harness needs a line. Matches.
   - `updates-and-rollback`: checkout registered as `akrogon` builds into `~/.akrogon/releases/` (previous and new `<commit>`), `~/.akrogon/current` switches to new, `akrogon rollback` points it back. Matches.
   - `one-akrogon-many-repos`: one install card fanning to acme-core (ac), client-portal (cp), partner-hub (ph), cp mapped to `cp-csv-export-a` slot A and `cp-watch`. Matches.
   - `repo-setup-steps`: four steps `/init-akrogon`, accept (`akrogon init` and its files), add prefix, `akrogon status`, then commit. Matches.
   - `repo-settings`: `issues/config.yaml` keys with one-line meanings, side notes for `merge_checks`/`advisory` and `slots`/`consultant`. Matches.
   - `grounding-map`: index lines pointing at `AREA.md` (40 lines, four sections) pointing at real paths, and the plan, build, review row. Matches.
   - `space-and-tabs`: `client-portal` space with t-, c-, w- tabs marked "your convention" and a required-space-name box. Matches.
   - `create-space-steps`: five rows with the exact page commands. Matches.
   - `three-tabs`: one space, three tabs with `akrogon status`/`next`, `/chart-issues`, `watch-issues` and the 20-minute `cp-watch` timer. Matches page 03 `## What runs in each tab` and works as README hero.
   - `task-tabs`: the three permanent tabs plus the temporary `csv-export` tab with slot A and slot B, and a row for next opens, merge closes, stop shows `csv-export failed`, window closed keeps terminals. Matches.
   - Dark page: the opaque card reads the same; only the corners show #0d1117. The "created by" text and logo sit on one line in every render.
4. Checks: report records `akrogon verify` green on 154534374fe4 (setup, format, typecheck, test 0). The test check runs all three docs tests. No code change since, so no rerun.

Planned tests ran through the plan's commands. Nothing since planning skips, filters or disables a test or runner config. `tests/docs-pictures.test.ts` and `tests/AREA.md` are unchanged since f629638f (frozen SHAs match).

## Docs

`docs/reference/where-things-go.md` `## Pictures` describes the mark and style rules these pictures follow. No documented behavior changed.

## AREA.md listing

`tests/AREA.md` paths checked from the repo root (one loop over its backticked `tests|src|docs|skills` paths): all exist except `tests/budget.test.ts` and the glob `tests/hc-*.test.ts` (which matches `tests/hc-delivery.test.ts` and others, so not dead).

## Nits

- N1 `tests/AREA.md` names `tests/budget.test.ts`, which main deleted in 387d6d6f ("feat: the seat sizes each paid test's budget in its command"). The pointer is on an unchanged line outside this leaf's hunk and owned surfaces. It touches none of this leaf's criteria. Deferred as out of scope. It would become a Fix only in a leaf that edits that line or owns tests/AREA.md upkeep. Not written as a lesson: it is a single stale pointer from another leaf, not a failure mechanism this review hit.

## Operator actions

None.
