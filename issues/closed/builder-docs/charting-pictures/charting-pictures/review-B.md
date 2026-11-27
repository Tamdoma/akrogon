# Review B: charting-pictures

Slot B, check.review, 2026-11-27. Base `4aff0f6881e486a15fd98db8d595644469cd4901` (= origin/main). Reviewed head `74c5659eb2e649a9177e6eddaf58b687df2b3a87`. Commits af83265f, 8aae5ad1, 5f4c9a59, d73b6db2, 74c5659e.

## Scope read

brief, design, plan (with implementation notes), implementation/report.md, the full diff (2 new SVGs, 3 embed lines, where-things-go.md), guide pages 04, 06, 07, 08 for the facts the pictures draw, and the Tamdoma logotype source.

## Verification

- C1 embeds and links: A's `check final-embeds: 0 .../implementation/check-final-embeds-1795777660158-3448512.log` lists the three embed lines; `check final-docs-links: 0 .../check-final-docs-links-1795777660533-3448791.log` (13 pass). Diff shows each embed at the D1 place with the D2 alt text.
- C1 words: labels use only approved words (Charting mode, Build route, No autopilot, Semi-autopilot, Full autopilot, Direct, Lifecycle, slot A (the builder), slot B (the reviewer), consultant, signposts, needs sheet, territory map, fork, decisions, hand-off review, c- tab). P2 retired-word search green.
- C1 facts checked against the guide: "default" on No autopilot (06:15, 06:23); Direct "charting agent builds, consultant B reviews" (07:20, 08:67); Lifecycle "contracts in issues/open/" (08:51); six stations match the 04 headings 1 to 6; "blind notes, merge, rebuttal" matches 04:43-45.
- C2: `check final-svg-style: 0 .../check-final-svg-style-1795777660314-3448584.log` (ok). Brief search `check final-forbidden-search: 0 .../check-final-forbidden-search-1795777660623-3448887.log`: `grep exit 1` (no hit for `href=`, `<script`, `@import`, `@font-face`, `animation`), "created by" 1 and `<title>Tamdoma</title>` 1 per file. Only internal reference is `marker-end: url(#arrow)`. Every hex in both files is a listed token.
- C2 logotype: the 8 paths in mode-and-route.svg equal `awk '/<path/' logotype.svg` with `fill="#90A985"` removed (diff empty). The two attribution groups differ only in the translate y (404 vs 424, picture height).
- C3: `check final-style-rules: 0 .../check-final-style-rules-1795777660422-3448696.log`. The new `## Pictures` section states card, palette, strokes, fonts, mark, still and layout.
- C5: `akrogon verify` on 74c5659e green (report), test log `.../check-test-1795777773794-3449185.log` ends `1550 pass, 0 fail`. No change since, so no rerun.
- Planned tests: report runs P1, P2, P3, DL and verify as plan.md names them. No planned test skipped or filtered. The P2 `-o /dev/null` correction happened at planning and is recorded in C2 with reruns.
- `Test-Change:` trailers in `4aff0f68..HEAD`: none. No test file changed (`git diff --stat` touches only docs/), so none is required.
- No `AREA.md` and no `learnings/LESSONS.md` line in the diff.
- Documented behavior: no code changed. The doc page for the change is where-things-go.md, reviewed below.

## C4: renders and what each picture shows

Renders on head 74c5659e:
- `check render-mode-and-route-b: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-render-mode-and-route-b-1795777832942-4049360.log` → `implementation/mode-and-route-light-b.png`, `implementation/mode-and-route-dark-b.png`
- `check render-charting-session-b: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-render-charting-session-b-1795777833125-4049868.log` → `implementation/charting-session-light-b.png`, `implementation/charting-session-dark-b.png`

mode-and-route: titled "Two separate choices". Left column "Charting mode / who answers the questions" with No autopilot (default), Semi-autopilot, Full autopilot. Right column "Build route / who builds the work" with Direct and Lifecycle. One solid ink line joins No autopilot to Direct, and dashed sage lines join all three modes to Lifecycle. Under Direct: "only with No autopilot" and "charting agent builds, consultant B reviews". Under Lifecycle: "slot A (the builder) and slot B (the reviewer)". It shows the What: three modes, two routes, two separate choices, Direct only with No autopilot.

charting-session: titled "One charting session", inside a tab frame labelled `c-client-portal`. Six numbered stations left to right with arrows: 1 Intake (your request), 2 Signposts and the needs sheet, 3 Territory map with consultants B and C below it ("blind notes, merge, rebuttal"), 4 Decisions (one fork per round) with a stack of fork cards, 5 Charting mode and Build route, 6 Hand-off review splitting into "Lifecycle: contracts in issues/open/" and "Direct: one small change". It shows the What: signposts, the map with consultants, the decisions and the hand-off, in the c- tab.

Both pages: the opaque parchment card fills the canvas, so the white and #0d1117 renders look the same and all text reads. Ink text, sage key boxes and dashed sage connectors, rounded 1.5 px strokes, flat fills. "created by" plus the Tamdoma logotype sits bottom right, small and readable.

## Findings

No Fix.

### Nits

- N1. where-things-go.md:28 says "Every SVG in `docs/pictures/` follows these rules", but 19 of the 21 SVGs there today are the old style (`grep -c f4f1e6 docs/pictures/*.svg` is 0 for each). Deferred because the design leaves the old pictures to guide-pictures, which deletes them, and criterion 3 (state the style for later pictures) is met. Promote to Fix if guide-pictures is dropped or a later picture leaf copies an old SVG because the sentence led it to.
- N2. In charting-session, the "Lifecycle: contracts in issues/open/" box sits under station 5 (Charting mode and Build route). Its connector starts at station 6, so the right reading is there, and the alt text and A's report read it the same way. Promote to Fix if a cold reader of the render attaches the Lifecycle outcome to station 5.

Neither Nit is a reusable mechanism (N1 ends when guide-pictures deletes the old files; N2 is one layout), so no lesson line is written.

## Verdict

`nits`
