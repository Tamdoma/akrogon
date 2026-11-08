# Plan: signposts-references

Docs-only leaf. The signposts leaf updated five pages; this leaf brings the remaining file references and mode claims level. Every edit is prose or one SVG text node; no code, no env, no grants, no produced keys (`env_names` is empty, `akrogon status` shows no `Missing:`).

## Read-first

Source of truth (read, never edited):

- `skills/chart-issues/SKILL.md` — "Open", "Drain", "Autopilot", "Handover"
- `skills/chart-issues/assets/shapes.md` — "Chart records", `forks/signposts.md` paragraph, Mode record entries
- `skills/chart-issues/assets/questions.md` — signposts paragraph (line 41): light round shape, unanswered/correction/conflict rules
- `src/status.ts` — `chartRow` (line 475): TAKEN counts every `forks/*.md` with a non-empty `## Taken`; header at line 371 is `CHART TAKEN FOG STAGE AGE`
- `docs/reference/where-things-go.md` — "One home per fact": operator-facing pages carry what the operator sees and link the skill for procedure

## Interfaces

- Heading anchors are slugs per `tests/docs-links.test.ts` (`slugify`: lowercase, strip non-letter/number/space/dash, spaces to dashes). `## Set the signposts` must keep the slug `set-the-signposts`; `## Handover` in `chart-issues/SKILL.md` yields `handover`.
- `src/status.ts` TAKEN regex: `/^## Taken\s*\n\s*\S/m` over every `forks/*.md`.
- SVG label: `<text class="muted" x="480" y="130" text-anchor="middle">` inside a 240 px-wide box at 14 px font; the other boxes carry 26–27 chars, so ~30 chars fits.
- `AKROGON_BASE = bfca777d2ae0921cc50e72a4e6f0c95c5c1388ef` (committed HEAD of this worktree).

## Decisions

- D1 — files.md chart row lists the full folder from shapes.md "Chart records": `CHART.md`, `INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/` (`signposts.md` plus one file per fork), `slots/` and, on the direct route, `direct/`; a second sentence adds the handover signposts-path fact linking the skill's "Handover" section. The brief's mention of "Mode record" and the "door session's signposts" phrasing is folded into the row description without new files.
- D2 — plan-work.md "Open a chart" gains one sentence each: first reply names the mode and who answers the signposts; `forks/signposts.md` is the session's record, not a chart question. "Set the signposts" rewrites its two paragraphs to carry, in operator terms: one consultant exchange adds missed angles first; the round is light — four to seven questions, two or three choices each, a recommendation and what it steers, no research line; one short account of what the session prioritizes and gives up; the door session lasts until a new door run (surviving waits, compaction and handovers) and a chart resumed later takes the new run's signposts; the original record sits in one chart with a verbatim copy in the others; corrections are recorded with their date, an unresolved conflict is asked in one line; chart order and any drop come from the signposts; under autopilot an unanswered question is recorded as unanswered and not asked again (under full autopilot A answers it); the skill holds the rest.
- D3 — autopilot.md gains: mid-chart switch-on with no signposts asks the signposts round first; under autopilot the round is presented and answered once, not a chart wait; under full autopilot A may order but never drop a handed chart — a drop it would make is recorded for the operator; the door moves to the next chart not waiting, in the signposts order; the `## Autopilot` record's `signposts:` line names who answered and the chart holding the original.
- D4 — words.md "Chart door" and "Fork", limits.md "What stays your job" and its product-questions bullet, why-it-works.md "A contract comes before code", what-it-is.md "The words" Chart entry drop the "operator answers every fork" claim and link `docs/use/autopilot.md` for who answers per mode; limits.md keeps locally that approvals stay the operator's in every mode.
- D5 — commands.md `akrogon status` row gains the TAKEN clause; skills.md chart-issues "Result" names the signposts round and the three modes (manual, autopilot, full autopilot); ways-to-run.svg autopilot label becomes `A answers the forks` (19 chars, same `<text>` node and box); skills/AREA.md "Key files" gains one chart-issues line naming `SKILL.md` and `assets/` (`shapes.md`, `questions.md`, `standing-design.md`).

Design corrections adopted: four pages link instead of restating (D4); SVG label ≤ ~30 chars in its box (D5); "next chart not waiting, in the signposts order" (D3); files.md handover signposts path with skill link (D1).

## Units and waves

Every wave holds one unit → **serial-solo**: A implements the plan itself, no workers. Grouping is by page cluster; splitting into parallel units buys nothing on a single-author docs pass.

- Wave 1, U1 — reference pages. Owns `docs/reference/files.md` (D1), `docs/reference/words.md` (D4), `docs/reference/limits.md` (D4), `docs/reference/commands.md` (D5), `docs/reference/skills.md` (D5). No dependency.
- Wave 2, U2 — start and use pages plus picture and index. Owns `docs/start/why-it-works.md`, `docs/start/what-it-is.md` (D4), `docs/use/plan-work.md` (D2), `docs/use/autopilot.md` (D3), `docs/pictures/ways-to-run.svg`, `skills/AREA.md` (D5). Prerequisite: U1 landed, so anchor and link targets exist before cross-page links are added (e.g. plan-work/autopilot links into `files.md` chart row need no new anchors, but keeping reference pages first avoids link churn).
- Wave 3, U3 — verification. Owns no product files; runs the criterion proofs below on the committed head.

No shared test resource. No `implementation/brief-<n>.md`.

## Affected docs checklist

Every doc this leaf touches is listed per unit. No agent doc changes; `skills/AREA.md` "Key files" gains one line, its prose elsewhere unchanged. Docs read but not edited: `docs/README.md`, `docs/reference-index.md`, `docs/pictures/chart-door.svg`, `docs/examples/*` (design exclusions).

## Verification (per criterion)

| Criterion | Observation that proves it | Command | Size / rerun trigger |
|---|---|---|---|
| 1 files.md chart row | `chart/<chart>/` row lists every entry of shapes.md "Chart records" and the handover line carries the signposts path with a resolving `#handover` link | `git --no-pager diff "$AKROGON_BASE"...HEAD -- docs/reference/files.md` read against `skills/chart-issues/assets/shapes.md` lines 4–17 + `bun test tests/docs-links.test.ts` | seconds; any files.md edit |
| 2 plan-work.md | "Set the signposts" states each D2 fact the reader must learn; "Open a chart" names the mode reply and `forks/signposts.md` as session record | diff read against `questions.md` line 41 and SKILL.md "Open"/"Autopilot"; docs-links test | seconds; any plan-work.md edit |
| 3 autopilot.md | each D3 fact present and matching SKILL.md "Autopilot" | diff read against SKILL.md lines 135–159 | seconds; any autopilot.md edit |
| 4 mode-aware pages | the five named pages no longer claim the operator answers every fork; each links `docs/use/autopilot.md`; limits.md keeps the approvals clause | `grep -n "answers\|answer" docs/reference/words.md docs/reference/limits.md docs/start/why-it-works.md docs/start/what-it-is.md` + docs-links test | seconds; any edit to those pages |
| 5 commands/skills/svg/AREA | status row TAKEN clause matches `chartRow`; skills.md chart-issues entry names signposts and three modes; SVG label ≤ ~30 chars in its box; AREA.md "Key files" chart-issues line | diff reads of the four files; SVG label char count | seconds; any edit |
| 6 links + scope | docs-links test green; `git diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the 11 What files; `src/`, `tests/`, `issues/` absent | `bun test tests/docs-links.test.ts` and `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` | seconds; any commit |

### Condition checks on the decisions

- **Anchor freshness** (C6, `set-the-signposts` must stay): D2 rewrites the section but must keep heading text "## Set the signposts". Case: temporarily rename the heading → `tests/docs-links.test.ts` fails on `words.md: missing anchor #set-the-signposts`. Demonstrated red at planning (temporary edit, reverted); failing output recorded below.
- **Scope discipline** (C6, only the What files): every unit owns only What-listed paths; U3 runs the diff-name-only command. Case: a committed out-of-scope edit is listed by the diff command; demonstrated red at planning via a temporary commit, reverted.
- **SVG label bound** (C5, ≤ ~30 chars in its box): D5 picks `A answers the forks` (19 chars). Case is review: the rendered label must not overflow the 240 px box — a plain `<text>` node has no wrapping, so overflow would be visible; the box's neighbours carry 26–27 chars at the same font size, so ~30 chars is safe. Cannot break mechanically; a longer label stays readable SVG but visually overflows — caught by the page-open review.
- **TAKEN wording** (C5): the clause must match `chartRow` exactly — "counts every fork file with a non-empty Taken, the signposts record included". Case is the diff read against the regex `/^## Taken\s*\n\s*\S/m`: signposts.md always ends a non-empty `## Taken` (its shape writes the reply under it), so it is counted — wording that excludes it would misstate the counter.
- **Link-only restatement** (C4): D4's "link autopilot.md instead of restating modes" — case is the C4 grep above: a restated mode sentence (e.g. naming all three modes outside autopilot.md-owning pages) shows up as new mode text outside `docs/use/autopilot.md`; the grep plus diff read catches it.

### Red demonstrations (run at planning, edits reverted)

1. Anchor break — done, reverted. Temporarily renamed `## Set the signposts` to `## Set the signpost` and ran `bun test tests/docs-links.test.ts` via `akrogon run-check --name red-anchor-break` (exit 1): `(fail) README, docs and skill links resolve to files and anchors` with `docs/reference/words.md: missing anchor #set-the-signposts in ../use/plan-work.md#set-the-signposts`. Log: `implementation/check-red-anchor-break-1793796644978-916347.log`.
2. Scope break — done, reverted. Temporary commit appending a comment to `src/status.ts` produced `src/status.ts` in `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD`; `git reset --hard HEAD~1` restored `bfca777d` with a clean tree.

Baseline evidence: `bun test tests/docs-links.test.ts` green at `bfca777d` via `akrogon run-check --name docs-links-baseline` (exit 0, 8 pass). Log: `implementation/check-docs-links-baseline-1793796564951-912150.log`.

## Notes

- No "Open for the plan:" questions appear in design.md; all answers are carried as decisions above.
- The brief's "autopilot rule for an unanswered question" (criterion 2) refers to questions.md line 41: unanswered under autopilot is recorded and not re-asked.
- `docs/pictures/chart-door.svg` line 65 ("you answer" forks) stays per design exclusion; `chart-door.svg` unchanged.
- The earlier signposts leaf already added mode-aware lines in `plan-work.md` "Set the signposts" and `autopilot.md` "Switch it on"; this leaf extends rather than duplicates them.
