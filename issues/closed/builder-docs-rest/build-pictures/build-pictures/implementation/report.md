# Implementation report: build-pictures

Base: `f6fb18643f6dfc31f8e7e801660f80d1887947c8`. Committed head: `6c31f7e6e6eec98f8eb742e7f0b1f19fa075d2cd`. Refreshes at implement start and end found the branch up to date with `origin/main` (no move).

Mode: delegated, one wave of two units (plan Waves). Briefs: `implementation/brief-1.md` (page 09), `implementation/brief-2.md` (page 10). Worker worktrees `build-pictures-u1` and `-u2` were created at `b25fdcf9` and removed after cherry-pick.

## Commits

- `b25fdcf9` test: planned picture tests for pages 09 and 10 (plan.synthesis, `Test-Change` trailer).
- `9357c4ae` docs(guide): picture per section of page 09 (unit 1, worker commit `857434d8`).
- `6c31f7e6` docs(guide): picture per section for page 10 merging (unit 2, worker commit `d597d322`).

## Changed files and reasons

- `docs/guide/09-lifecycle.md`: 8 embed lines, one directly under each `##` heading. No other text changed.
- `docs/guide/10-merging.md`: 6 embed lines, one directly under each `##` heading. No other text changed.
- New pictures for page 09: `next-pass.svg`, `why-a-task-waits.svg`, `start-order.svg`, `leaf-start.svg`, `lifecycle-phases.svg`, `slot-a-and-b.svg`, `slot-b-review.svg` (same base drawing as `slot-a-and-b.svg`), `watching-progress.svg`.
- New pictures for page 10: `merge-turn.svg`, `merge-landing.svg` (page 10's own merge picture), `land-run.svg`, `merge-exit.svg`, `issue-complete.svg`, `announcement.svg`.

Each alt text matches its SVG `<desc>`. Shares: none (plan D1). 14 sections, 14 distinct pictures.

## Done-criteria proof

1. Picture under every section, alt text, approved words.
   - `akrogon run-check --name crit-1-2 -- bun test tests/docs-pictures.test.ts tests/docs-em-dash.test.ts` on `6c31f7e6`: `check crit-1-2: 0 .../implementation/check-crit-1-2-1795791353068-2639011.log`, 9 pass, 0 fail. Includes `every section of guide pages 09 and 10 has its own picture with alt text` and the retired-phrase check in `pictureProblems`.
   - Plain-words alt text and approved-word labels beyond the retired phrases: slot B's reading. Workers also grepped for "manual", "seat A", "seat B": none found.
2. Mark group, forbidden markup, "created by", Tamdoma title.
   - Same run: `pictures on guide pages 09 and 10 hold the same mark group as pages 04 to 08 and no outside or moving markup` and `README, docs markdown and docs pictures hold no em dashes` pass.
   - Report search over every new SVG on `6c31f7e6`: `check crit-2-search: 0 .../implementation/check-crit-2-search-1795791353253-2639141.log`. Every one of the 14 files: `href=0 <script=0 @import=0 @font-face=0 animation=0 —=0 created by=1 <title>Tamdoma</title>=1`.
3. Slot B's render reading: not run by A as proof. Workers rendered each picture on white and one each on `#0d1117` (`slot-a-and-b.svg`, `merge-landing.svg`) and fixed overlap and clipping. A spot-read `merge-exit.svg`, `slot-a-and-b.svg`, `lifecycle-phases.svg` (white) and `slot-b-review.svg` (`#0d1117`): readable, match their sections.
4. Destination checks: `akrogon verify` on `6c31f7e6`: `verify leaf 6c31f7e6e6eec98f8eb742e7f0b1f19fa075d2cd: green` (setup, format, typecheck, test all 0). Wall time 114 s.

Per-pick runs: `check pick-u1: 1` (only page-10 sections missing, as expected before unit 2), `check pick-u2: 0 .../implementation/check-pick-u2-1795791333127-2636416.log`.

## Worker returns

- Unit 1: `check u1-pictures: 1` (page-10 parts only), `check u1-search: 0`, mark hash count 9 with `mode-and-route.svg`.
- Unit 2: `check u2-pictures: 1` (page-09 parts only), `check u2-search: 0`, mark hash count 7.

## Known limitations

- `lifecycle-phases.svg` labels `check.review` "slot A and slot B" (the first check). That only slot B re-checks after a repair round is shown in `slot-b-review.svg`.
- Alt text for `merge-landing.svg` and `land-run.svg` leaves out `<id>`, so Markdown does not read it as HTML. The pictures still show `--attempt <id>`.
- The two workers shared a scratch file for a style block. The extra `.code` and `.frame` style rules may appear unused in some page-10 pictures. They are plain CSS classes with no effect on the forbidden-markup rules.

## Unverified criteria

- Criterion 3 waits for slot B's render reading.
