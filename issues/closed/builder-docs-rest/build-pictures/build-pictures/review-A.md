# Review A: build-pictures (check.review, initial, blind)

Base: `f6fb18643f6dfc31f8e7e801660f80d1887947c8`. Reviewed head: `6c31f7e6e6eec98f8eb742e7f0b1f19fa075d2cd`.

Diff: 17 files, 14 new SVGs, 14 embed lines in `docs/guide/09-lifecycle.md` and `docs/guide/10-merging.md`, `tests/docs-pictures.test.ts` (planning commit `b25fdcf9`).

## Verification evidence

- `akrogon verify` on `6c31f7e6`: green (setup, format, typecheck, test all exit 0), per `implementation/report.md`. Head unchanged since, so no rerun.
- Criteria 1 and 2: `check crit-1-2: 0 .../implementation/check-crit-1-2-1795791353068-2639011.log` (9 pass, 0 fail) on `6c31f7e6`, which ran after the last change to the test file (`b25fdcf9`).
- Report search: `check crit-2-search: 0 .../implementation/check-crit-2-search-1795791353253-2639141.log`. Each of the 14 new SVGs: 0 `href`, `<script`, `@import`, `@font-face`, `animation`, em dash; 1 `created by`, 1 `<title>Tamdoma</title>`.
- Guide diff: only `![...](../pictures/...)` lines and blank lines added. No other text changed (checked with `git diff f6fb1864...HEAD -- docs/guide`).
- Placement: each of the 14 `##` headings is followed by a blank line and its embed. The Slot A and Slot B embeds sit above their `###` subsections.
- Labels: no "manual", "seat A/B" or "quick fix" in any new SVG.
- Renders: I rendered all 14 on white with `rsvg-convert -b white` and `slot-b-review.svg` on `#0d1117`, then read each PNG. Every one reads, has no overlap or clipping, and shows its section's content:
  - next-pass: the four `akrogon next` forms in the `t-client-portal` tab and the five steps of one pass.
  - why-a-task-waits: the six wait reasons with their printed line or command.
  - start-order: the two sweep rules with csv-export ahead, and capacity refill longest-waiting first.
  - leaf-start: the four start steps, the listener and progress kept in files.
  - lifecycle-phases: the phase chain, the repair loop and `failed`.
  - slot-a-and-b: slot A's four steps passing the work to slot B, then merge.
  - slot-b-review: blind review, verdicts, repair, Handed to A and re-check by slot B only.
  - watching-progress: what the three commands show.
  - merge-turn: the queue, the three order rules and the TURN column.
  - merge-landing: no seat, reconcile, rebase, apply, the land unit, and conflict or dirty going to check.repair.
  - land-run: verify, gates, push and the four outcomes.
  - merge-exit: the four causes, the two covers and slot B's four outcomes.
  - issue-complete: the two landings and the completion steps.
  - announcement: broadcast pending, broadcast-issue and the Discord update.
- Claims in the pictures match the page text for each section. I found no contradiction.
- Alt text: 14 plain sentences that describe the picture. No HTML or angle brackets.
- Test-Change trailers: `b25fdcf9` carries one for `tests/docs-pictures.test.ts`. It adds cases and changes no existing expectation.
- Docs: no documented behavior changed. The diff adds pictures only, and `docs/reference/where-things-go.md` § Pictures already states the rules they follow.

## Fixes

None.

## Nits

- N1. `lifecycle-phases.svg` labels `check.review` "slot A and slot B". Page 09's table says "Slot A and Slot B (Slot B only when `fix_rounds > 0`)". `slot-b-review.svg` shows the re-check by slot B only, so a reader still gets it. Deferred because the label is right for the first check. It becomes a Fix if a reader of page 09's phase section alone takes it to mean slot A re-checks repairs.
- N2. The two workers shared a scratchpad style file, so some new SVGs may hold style classes they don't use (report, Known limitations). There is no visible effect and they break no picture rule. Deferred as harmless. It becomes a Fix if a stray rule changes how a picture renders.
- The shared-scratchpad cause is recorded as a lesson: `learnings/LESSONS.md` last line and `learnings/history/2026-11-27-parallel-workers-share-scratchpad.md` in the registered checkout, uncommitted.

## Verdict

nits
