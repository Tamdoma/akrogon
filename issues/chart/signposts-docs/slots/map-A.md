# Map A: signposts-docs, written before reading B and C

## Inventory (inspected 2026-11-04)

- `docs/reference/files.md` table row `chart/<chart>/`: "One folder per chart, with `CHART.md` and its fork files." Missing what `skills/chart-issues/assets/shapes.md` "Chart records" lists: `INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/signposts.md` (original in one chart, verbatim copy in the session's other charts), `slots/`. The file-reference gap the operator named.
- `docs/reference/words.md`: has Signposts and Autopilot entries (signposts-step leaf). No "full autopilot" or "door session" entry; check against SKILL.md "Autopilot".
- `docs/use/plan-work.md` "Set the signposts", `docs/use/autopilot.md`, `docs/start/what-it-is.md`, `docs/use/a-working-day.md`: updated by signposts-step; check each against current SKILL.md (mode names, copies across charts, handover carrying the signposts path, "same" reuse).
- `docs/reference/commands.md` `status --charts`: does it say the signposts fork counts as taken? Low confidence it needs to.
- `docs/reference-index.md` "the ten agent workflows": count the skills; low confidence it is stale.
- `docs/pictures/chart-door.svg`: the plan-work caption already says the signposts round runs once before any map; the picture itself may not show it. Low confidence.
- `docs/use/autopilot.md` "## Autopilot section" description: does it list the `signposts:` line? Check against shapes.md "Chart records" `## Autopilot` list.

## Forks

F1. Scope (signpost 4a): every stale or missing signposts reference in `docs/` and the AREA/index files, not code or skills (skills are the source). No fork beyond that.

F2. Pictures: update an SVG only where its text is wrong; a missing step in a picture is a caption sentence, not a redraw. Recommended: caption only (removing over adding).

## Pitfalls

- Copying skill steps into docs (`docs/reference/where-things-go.md`: "A page links the skill ... and does not copy its steps"). Docs name the files and steps and link the skill.
- Overlap with open leaves run-count-rule (no docs) and option-drawings (`docs/use/plan-work.md` "Answer one fork per round"): stay out of that section.
- `tests/docs-links.test.ts` checks links: new links must resolve.

## Split

One akrogon docs leaf.
