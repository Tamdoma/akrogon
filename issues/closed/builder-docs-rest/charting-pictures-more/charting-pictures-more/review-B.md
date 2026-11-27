# Review B: charting-pictures-more

Phase: check.review (initial, blind). Base 9a7402bf4464d812163e3dd4e1b4dcfd312c867a. Reviewed head d44a586681f87b163a6613222de8be0b9a6679f6 (worktree clean).

Verdict: **ready**

## Criteria

1. **Mark group identical, logo on the line.** Test case 2 green on the head (`check pictures: 0 implementation/check-pictures-1795788335777-1080540.log`, and the verify `test` log runs it 5 more times). Diff of charting-session.svg and mode-and-route.svg changes only the mark: the title moves to one outer `<g transform="translate(838 Y)">`, text with inline style, inner logo `translate(8 -14) scale(0.05)`, paths unchanged. Screenshot: 4x crops `renders/mark-charting-session.png` and `renders/mark-mode-and-route.png` look the same. The logo's middle sits on the "created by" text line in both. The old 4 px offset in charting-session is gone.
2. **Every section has a picture.** Test case 1 green. Each of the 25 `##` sections on 04 to 08 (apart from 04's c- tab section) has its own picture. No shares, so no share reasons to judge. Alt text is plain and equals each SVG's `<desc>` (24 of 24 checked by script). Labels: no "manual", "quick fix", "seat", "door", "leaf" or "attended" in any picture this leaf adds (word grep). The old hits are only in config-layers.svg and control-states.svg, which this leaf does not touch.
3. **Forbidden-markup search.** Test case 2 covers `href`, `<script`, `@import`, `@font-face`, `animation` and `<animate`, plus one group holding `<title>Tamdoma</title>` and `created by`, over all 24 embedded pictures. The dash guard is green (`check dash: 0 implementation/check-dash-1795788335859-1080638.log`). An extra grep of the 22 new SVGs for non-ASCII bytes found nothing. `xmllint --noout` passes on every SVG in docs/pictures.
4. **Renders read.** Command: `rsvg-convert -b white` for all 24 and `-b '#0d1117'` for direct-route.svg. Renders are in `/var/tmp/akr-1000/5d20/dc9a0813/claude-1000/-home-ivan--akrogon-worktrees-akrogon-charting-pictures-more/3a7da163-04ff-404c-b1a0-f8ba2e0650db/scratchpad/renders/`. Nothing clips or overlaps. The opaque card reads on dark. I checked each label against its page text: POSTMARK_API_KEY, staging-reports@agency.example, SPF/DKIM, the drop after two misses, the seven Direct checks, `direct-drop` to Held, commit ID recorded, `akrogon status` checking the handed-off files and the next runnable chart all match pages 05 to 08. What each picture shows:
   - charting-session: the six steps of one session in the c- tab, ending in the Lifecycle and Direct hand-offs.
   - mode-and-route: Charting mode and Build route as two separate choices, with only No autopilot linked to Direct.
   - opening-a-session: the request with full consultant line, start checks pull/flaky/status, and the first reply confirming consultants, mode and signposts.
   - consultants: blind notes, merge with agreement tags, rebuttal, question to you, plus the note that consultants are not slot A and slot B.
   - chart-records: the chart folder files with their purpose, and `akrogon status --charts` in t-client-portal.
   - signposts-session: signposts asked once between the first message and the territory map, waits and handovers inside one session.
   - signposts-round: consultant exchange, round card (4 to 7 questions, 2 or 3 options, no research block, "same"), short account, saved record and copies.
   - signposts-by-mode: the 3 by 3 table of who answers signposts, forks and unanswered signposts in each mode.
   - needs-sheet: the four row kinds and three statuses, plus the two rules (only you answer, pending does not pause charting).
   - signposts-example: three client-portal items, the round, reply `1a 2a 3a 4a`, chart order, three needs rows with status, then the territory map.
   - modes-at-a-glance and the No, Semi and Full series: the same table, each with one column highlighted and the others faded, plus a two-line summary.
   - autopilot-hands-off: autopilot chart to contracts for fresh slot A and slot B, Direct crossed out.
   - autopilot-waits: the six human-only boundaries, chart 2 parked, the agent moves to chart 3, an alert goes out, and your message resumes chart 2.
   - autopilot-records: CHART.md Mode record and Autopilot, fixed list, lost consultant, end conditions.
   - routes-at-a-glance: the Direct and Lifecycle lanes into the merge queue and the default branch.
   - direct-route: the seven checks, `akrogon direct`, build, review with a repair loop, merge, Closed, and the failed branch to direct-drop/Held or Lifecycle.
   - lifecycle-route: the contract files, `akrogon next`, slot A and slot B in their own tab, the work lands.
   - before-hand-off: four safeguards into the gate of no open fork and no Fog, then ready.
   - hand-off-review: the review card rows, the csv-export/scheduled-email tree with blocked-by, and approve, consultants, contracts, state.yaml last.
   - after-hand-off: Lifecycle waits for `akrogon next` or the watcher, while Direct is built, merged and closed.
   - next-chart: chart 1 ends, then a handover that logs the remaining list, consultants and signposts path, a fresh conversation, and chart 2 with the same signposts.
5. **Checks.** `akrogon verify` receipt for leaf d44a5866 is green, with format 0, typecheck 0 and test 0 (`issues/verify-runs.jsonl` line 867, run f11b5c90). I reran nothing because no code changed after it.

## Tests and proof

- `tests/docs-pictures.test.ts` was added in planning commit 9fbf4bf2 and has not changed since. Its hash 99d96c3a matches `state.yaml` `frozen`. Planning shows it red on the base, and each fixture case was shown red by a temporary break (K1, K3 to K6 logs). The report ran the planned commands. No test is skipped or filtered, and no runner config changed.
- `Test-Change:` trailers in 9a7402bf..HEAD: one, on 96941cd9, for `tests/AREA.md` ("plan.md docs checklist names this area line for the new tests/docs-pictures.test.ts; prose only"). I accept it: it is a prose line added for the new test, and no expectation changed. `tests/docs-pictures.test.ts` is an added file, so the gate needs no trailer for it (`src/phase.ts` checks M/D/T only).
- No proof-command corrections were recorded.

## Docs and area files

- `docs/reference/where-things-go.md` Mark line now matches the markup that ships. The group really is copied whole from mode-and-route.svg and placed by one translate.
- `tests/AREA.md`: every path its changed line names exists (`tests/docs-pictures.test.ts`, `tests/docs-links.test.ts`, `tests/command-reference.test.ts`, `docs/reference/commands.md`). The other missing names in the file (`tests/budget.test.ts` and others) were already missing and this diff does not touch them.
- Guide pages 04 to 08: only embed lines were added. No documented behavior changed.

## Nits

None.

## Notes (information, not findings)

- guide-chapters criterion 5 says where-things-go.md keeps its picture-style lines unchanged, but this leaf's brief changes the Mark line. That conflict belongs to guide-chapters' review. Whichever leaf lands second rebases.

## Operator actions

None.
