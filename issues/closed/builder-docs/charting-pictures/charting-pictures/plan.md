# Plan: charting-pictures

Slot A, plan.synthesis, 2026-11-27. Base `4aff0f6881e486a15fd98db8d595644469cd4901`. Worktree `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures`.

## Read first

- Leaf `brief.md` and `design.md` (this folder).
- `docs/guide/04-a-charting-session.md`, `05-signposts.md`, `06-charting-mode.md`, `07-build-route.md`, `08-hand-off.md`: the content each picture draws and the approved words it uses.
- `docs/reference/where-things-go.md`: the only home of the picture rule (line 11 today). A grep of `docs/`, `README.md`, `skills/` and the AREA files finds no other copy.
- `tests/docs-links.test.ts`: resolves Markdown image links (`![..](..)` and `<img src>`) to files.
- `docs/reference-index.md` (grounding index) and `docs/README.md`.
- Style sources, outside the repo, read only:
  - `/home/ivan/Work/infra/tamdoma/website/website/src/layouts/Layout.astro` lines 109 to 115 (tokens).
  - `/home/ivan/Work/infra/tamdoma/website/website/src/components/Station.astro`, `SystemIcon.astro`, `OnePager.astro` (line art, dashed sage connectors, mono numbered labels).
  - `/home/ivan/Work/infra/tamdoma/website/website/src/components/logotype.svg` (viewBox 1114x390, one `<g>` holding 8 `<path>`, fills `#90A985`; the first path is the hexagon mark, the rest are the wordmark).
- `learnings/LESSONS.md` line 16 (stale rule left in docs). Applied here: the old picture rule has one home, which U3 rewrites.

No other lesson applies. No resource named by the skill is missing.

## Notes for review

- N1 (design internal conflict). Design Q3 (verbatim A pick) says the mark comes from `website/public/logos/` with the text "created by Tamdoma". The design's Leaf architecture and brief criterion 2 say the logotype paths come from `src/components/logotype.svg` and forbid `public/logos/*.svg` (raster data URIs, about 134 KB). The plan follows Leaf architecture and the brief: the text is "created by" and the logotype carries the name.
- N2. The `taxonomy-rename` leaf is still open and may add a guard test over `docs/` for retired phrases, and may touch lines of 04, 06 and 07. This leaf's labels and alt text already avoid those phrases (P2 checks the SVGs). A text conflict near the embed lines is resolved at merge by keeping both edits.
- N3. Out of scope and untouched: the old pictures and their embeds (guide-pictures), and the `docs/start/`, `docs/use/`, `docs/examples/` folder lines of where-things-go.md (guide-chapters).

## Decisions

- D1. Embeds. `charting-session.svg` goes in `04-a-charting-session.md` directly after the line "Using `client-portal`'s weekly client report export, a complete charting session moves through six steps:". `mode-and-route.svg` goes in `06-charting-mode.md` after the paragraph ending "every chart uses the Lifecycle build route." (before `## The three Charting modes at a glance`), and in `07-build-route.md` after the bold definition paragraph (before "Once a chart has no open questions left"). Each embed is one Markdown image line `![<alt>](../pictures/<file>.svg)` with a blank line before and after. No other guide text changes.
- D2. Alt text, plain words, one sentence or two:
  - 04: `One charting session in the c- tab: intake, signposts, a territory map drawn with consultants, one decision per round, Charting mode and Build route, then the hand-off.`
  - 06 and 07: `Charting mode (No autopilot, Semi-autopilot, Full autopilot) and Build route (Direct, Lifecycle) are two separate choices. Direct is available only with No autopilot. Every mode can use Lifecycle.`
  If a drawn picture ends up showing less or more than this, the alt text changes to say what the picture shows.
- D3. No `href` attribute at all, internal or outside. No `<use>`, `<image>`, `<a>`, `<script>`, `<foreignObject>`, `@import`, `@font-face`, `animation`, `<animate>` or `prefers-color-scheme`. Arrowheads, if any, are drawn paths or `<marker>` referenced by `url(#id)`. This makes the brief's search return no hit at all, so no hit needs to be judged "outside".
- D4. Shared skeleton. Both SVGs start from this frame, with H the picture height (about 400 to 500) and all colors from the Tamdoma tokens:

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 H" width="960" height="H" role="img" aria-labelledby="t d">
    <title id="t">...</title>
    <desc id="d">...</desc>
    <style>
      text { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size: 15px; fill: #0f0f0f; }
      .h { font-size: 20px; font-weight: 600; }
      .soft { font-size: 13px; fill: #6e6a5c; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: .04em; fill: #5e7355; }
      .box { fill: #f0ede0; stroke: #0f0f0f; stroke-width: 1.5; stroke-linejoin: round; }
      .key { fill: #e7ede2; stroke: #5e7355; stroke-width: 1.5; stroke-linejoin: round; }
      .link { fill: none; stroke: #90a985; stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 4 6; }
      .line { fill: none; stroke: #0f0f0f; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    </style>
    <rect x="0.75" y="0.75" width="958.5" height="H-1.5" rx="14" fill="#f4f1e6" stroke="#c4c0b3" stroke-width="1.5"/>
    <!-- content -->
    <!-- attribution, D5 -->
  </svg>
  ```

  Flat fills only (no gradients, filters or shadows). Boxes use `rx` 8 to 10. Labels are `<text>`, never outlined paths. Labels stay short and leave about 20 percent width slack, because the system font varies by reader. Classes may be added; the token values may not change.
- D5. Attribution, identical in both files, bottom-right corner: `<text class="mono" x="838" y="H-18" text-anchor="end">created by</text>` followed by `<g transform="translate(846 H-36) scale(0.05)" fill="#0f0f0f"><title>Tamdoma</title>` + the 8 `<path d="...">` elements of `logotype.svg` with their `fill` attributes removed + `</g>`. Scale 0.05 draws the logotype about 56x20 px. The logotype already holds the hexagon mark, so `favicon.svg` is not used. Exact x and y may shift a few px so the baseline of "created by" meets the logotype's middle; the group, title, color and corner stay.
- D6. `mode-and-route.svg` layout, left to right. Left column: heading "Charting mode" with mono line "who answers the questions", three stacked boxes "No autopilot" (small soft "default"), "Semi-autopilot", "Full autopilot". Right column: heading "Build route" with mono line "who builds the work", two boxes "Direct" and "Lifecycle". Connectors: No autopilot to Direct, and each of the three modes to Lifecycle. The No autopilot to Direct connector is the only `.line` (solid ink); the others are `.link` (dashed sage). A soft note under Direct reads "only with No autopilot". Optional one-line soft notes: under Direct "the charting agent builds, consultant B reviews"; under Lifecycle "slot A (the builder) and slot B (the reviewer)". A top title line such as "Two separate choices" is allowed.
- D7. `charting-session.svg` layout. An inner `.box`-style frame stands for the `c-` tab, with a mono tab label `c-client-portal` at its top-left (the guide's example repo). Inside, six stations left to right, numbered in mono `1` to `6` to match the guide's "One session, step by step" headings: 1 Intake, 2 Signposts (soft "and the needs sheet"), 3 Territory map, 4 Decisions (soft "one fork per round"), 5 Charting mode and Build route, 6 Hand-off review. Stations 2, 3, 4 and 6 use `.key` (the brief's four elements); 1 and 5 use `.box`. Station 3 has two small nodes "B" and "C" captioned "consultants", joined to the map by `.link` connectors, with mono caption "blind notes, merge, rebuttal". Station 4 shows two or three small stacked fork cards. Station 6 splits into two short outcomes: "Lifecycle: contracts in issues/open/" and "Direct: one small change". Stations join by `.link` connectors with arrowheads.
- D8. Words. Labels use only words the guide pages use: Charting mode, Build route, No autopilot, Semi-autopilot, Full autopilot, Direct, Lifecycle, slot A (the builder), slot B (the reviewer), charting agent, consultant, signposts, needs sheet, territory map, fork, decisions, hand-off review, `c-` tab. Never "manual", "quick fix", "attended" or "autopilot signposts".
- D9. where-things-go.md. Line 11 becomes "`docs/pictures/`: SVG pictures, drawn in the [picture style](#pictures)." A new `## Pictures` section goes before `## When code changes` and states, one short line each: card (opaque `#f4f1e6` with a 1.5 px `#c4c0b3` border, rounded corners, so one file reads on GitHub light and dark pages); palette (ink `#0f0f0f`, ink-soft `#6e6a5c`, beige `#f0ede0` `#e0dccf`, sage scale `#e7ede2` `#b7c8ae` `#90a985` `#7a9b76` `#5e7355`); strokes (1.5 px, round caps and joins, flat fills, dashed sage connectors); fonts (system sans stack and `ui-monospace` stack, labels kept as text); mark ("created by" plus the Tamdoma logotype as inline paths in a group titled `<title>Tamdoma</title>`, bottom-right; copy the group from `docs/pictures/mode-and-route.svg`, written as a code span, not a link); still (no animation, no script, no `href`, no web font, no `@import`); layout (about 960 px wide, read left to right, short labels in the guide's words, no screenshots of command output).
- D10. Proof. The design says "No new test", so no test file is added. Criteria are proven by the existing `tests/docs-links.test.ts`, three shell searches (P1 to P3) over the changed files with `grep` and `rsvg-convert`, which exist at base, the configured `checks`, and renders read by A and B. No test commit precedes product code because no test is added.
- D11. Waves (below). Wave 1 holds three disjoint units. Wave 2 holds the embeds, which need both SVGs to exist and to be known for the alt text. The run is not serial-solo.

## Interfaces

- Image embed form read by `tests/docs-links.test.ts`: `![alt](../pictures/<file>.svg)` from `docs/guide/`.
- Render: `rsvg-convert -b '<color>' -o <png> <svg>` (`/usr/bin/rsvg-convert`; `-o /dev/null` is refused, so a render-only check writes to stdout redirected to `/dev/null`). Headless `/usr/bin/chromium` is allowed as an alternative renderer.
- `akrogon run-check --name <label> -- <cmd>` for every kept proof run.

## Checklist

### Wave 1

- U1. `docs/pictures/mode-and-route.svg` (new). Owns only this file. Follows D3 to D6 and D8. Shared test resource: none. Prerequisites: none.
- U2. `docs/pictures/charting-session.svg` (new). Owns only this file. Follows D3 to D5, D7 and D8. Shared test resource: none. Prerequisites: none.
- U3. `docs/reference/where-things-go.md`: line 11 and the new `## Pictures` section (D9). Owns only those lines. Shared test resource: none. Prerequisites: none.

### Wave 2

- U4. Embed lines and alt text in `docs/guide/04-a-charting-session.md`, `06-charting-mode.md` and `07-build-route.md` (D1, D2). Owns only those three new lines. Prerequisites: U1, U2. After U4, A renders both SVGs on `#ffffff` and `#0d1117` into `implementation/` and reads them, and records the PNG paths in `implementation/report.md`.

### Docs

- Human docs: `docs/reference/where-things-go.md` (U3) and the three guide pages (U4). These are the leaf's own surfaces.
- Agent docs: none affected. `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` and `skills/` state nothing about picture style.

## Proof commands

Run from the worktree root. The three scripts are kept verbatim here and run as `akrogon run-check --name <label> -- sh -c '<script>'`.

P1 (embeds present):

```sh
for f in docs/guide/06-charting-mode.md docs/guide/07-build-route.md; do grep -nF "](../pictures/mode-and-route.svg)" "$f" || { echo "no mode-and-route embed in $f"; exit 1; }; done; grep -nF "](../pictures/charting-session.svg)" docs/guide/04-a-charting-session.md || { echo "no charting-session embed in 04"; exit 1; }; echo ok
```

P2 (SVG files: forbidden tokens, attribution, style tokens, retired words, parse, required names):

```sh
for f in docs/pictures/mode-and-route.svg docs/pictures/charting-session.svg; do test -f "$f" || { echo "missing $f"; exit 2; }; if grep -nE "href=|<script|@import|@font-face|animation" "$f"; then echo "forbidden token in $f"; exit 1; fi; for s in "created by" "<title>Tamdoma</title>" "#f4f1e6" "#c4c0b3" "#0f0f0f" "ui-sans-serif" "ui-monospace" "1.5" "round" "<text"; do grep -qiF "$s" "$f" || { echo "missing \"$s\" in $f"; exit 1; }; done; if grep -niE "manual|quick fix|attended|autopilot signposts" "$f"; then echo "retired word in $f"; exit 1; fi; rsvg-convert "$f" > /dev/null || exit 1; done; for s in "Charting mode" "Build route" "No autopilot" "Semi-autopilot" "Full autopilot" "Direct" "Lifecycle"; do grep -qF "$s" docs/pictures/mode-and-route.svg || { echo "missing \"$s\" in mode-and-route.svg"; exit 1; }; done; for s in "c-" "signposts" "map" "consultant" "decision" "hand-off"; do grep -qiF "$s" docs/pictures/charting-session.svg || { echo "missing \"$s\" in charting-session.svg"; exit 1; }; done; echo ok
```

P3 (style rules stated):

```sh
f=docs/reference/where-things-go.md; for s in "#f4f1e6" "#c4c0b3" "#0f0f0f" "sage" "1.5" "ui-sans-serif" "ui-monospace" "created by" "<title>Tamdoma</title>" "animation"; do grep -qiF "$s" "$f" || { echo "missing \"$s\" in $f"; exit 1; }; done; echo ok
```

DL (links): `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`

R (renders, A after U4 and B at review), for each `<name>` in `mode-and-route`, `charting-session`:

```sh
akrogon run-check --name render-<name> -- sh -c 'rsvg-convert -b "#ffffff" -o <leaf>/implementation/<name>-light.png docs/pictures/<name>.svg && rsvg-convert -b "#0d1117" -o <leaf>/implementation/<name>-dark.png docs/pictures/<name>.svg'
```

`<leaf>` is `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures`. B may write its own copies under the same folder with a `-b` suffix.

## Criteria and observations

### C1. SVGs exist, are embedded, alt text is plain, pictures show the What, labels use approved words

- Boundary: the three guide pages and the two SVG files as GitHub renders them.
- Before: no embed and no file (P1 red, P2 red, below). After: both embeds present and resolving, P2 green.
- Product failure caught: a missing or misnamed picture, a broken image link, a picture with retired words or missing mode and route names.
- Commands: P1, DL, P2. Size: seconds. Rerun trigger: any change to the SVGs or to 04, 06, 07.
- Model-choice reading: whether the picture shows the What content and whether the alt text is plain and true is a judgment, not a count. Recorded in A's report and read by B from the renders (C4). No case holds an expected drawing. Function checks kept: files exist and parse, required approved names present (their source is the approved names in design), retired words absent (source: design "manual dropped" and Q4's banned phrases).
- Conditions checked:
  - Embeds resolve to existing files (decision D1). Case: DL. Red at planning by a temporary embed of `../pictures/mode-and-route.svg` in 06 with no file: `check plan-docs-links-break: 1 .../implementation/check-plan-docs-links-break-1795777175050-3421744.log`, output `06-charting-mode.md: missing file ../pictures/mode-and-route.svg`, `1 fail`. Discarded with `git checkout`.
  - Embed lines present in all three pages (D1). Case: P1. Red at base: `check plan-embeds-base: 1 .../implementation/check-plan-embeds-base-1795777163266-3420887.log`, output `no mode-and-route embed in docs/guide/06-charting-mode.md`.
  - No retired word in labels (D8). Case: P2. Red by a temporary SVG pair with "manual route" as a label: `check plan-svg-style-break-retired: 1 .../implementation/check-plan-svg-style-break-retired-1795777185962-3422282.log`, output `retired word in docs/pictures/charting-session.svg`. Discarded.
  - Files parse and render (D4). Case: P2 render step. Red by a temporary SVG with an unclosed `<g>`: `check plan-svg-style-break-xml: 1 .../implementation/check-plan-svg-style-break-xml-1795777186102-3422387.log`, output `XML parse error ... Premature end of data in tag g`. Discarded.
- DL green at base before any change: `check plan-docs-links-base: 0 .../implementation/check-plan-docs-links-base-1795777163600-3421114.log` (13 pass).

### C2. Style and the no-outside-resource rule

- Boundary: the two SVG files' text.
- Before: files absent: `check plan-svg-style-base: 2 .../implementation/check-plan-svg-style-base-1795777163369-3420972.log`, output `missing docs/pictures/mode-and-route.svg`. After: P2 prints `ok`, exit 0.
- Product failure caught: an outside link, script, web font or animation; a missing attribution or mark title; a missing card, ink, font stack or stroke token.
- Command: P2. Size: seconds. Rerun trigger: any change to either SVG.
- The brief's required report: the P2 log, plus in `implementation/report.md` the output of `grep -nE "href=|<script|@import|@font-face|animation" docs/pictures/mode-and-route.svg docs/pictures/charting-session.svg` (expected empty, exit 1) and `grep -cF "created by"` and `grep -cF "<title>Tamdoma</title>"` per file (each at least 1).
- Visual parts (opaque card, sage accents, rounded strokes, flat fills, mark legible) are read from the renders by A and B.
- Conditions checked:
  - No outside resource, script, web font or animation (D3). Case: P2 forbidden search. Red by a temporary SVG pair holding `animation:none`: `check plan-svg-style-break-animation: 1 .../implementation/check-plan-svg-style-break-animation-1795777174649-3421427.log`, output `forbidden token in docs/pictures/mode-and-route.svg`. Discarded.
  - Attribution group titled Tamdoma present in each file (D5). Case: P2. Red by a temporary pair where the second file lacks the title: `check plan-svg-style-break-mark: 1 .../implementation/check-plan-svg-style-break-mark-1795777185842-3422195.log`, output `missing "<title>Tamdoma</title>" in docs/pictures/charting-session.svg`. Discarded.
  - The check passes on a clean file, so it is not always red: `check plan-svg-style-clean: 0 .../implementation/check-plan-svg-style-clean-1795777186249-3422495.log`, output `ok`. Temporary files removed; `git status --short` empty afterwards.
  - Three earlier break runs (`plan-svg-style-break-mark`, `-retired`, `-clean` with suffix `1795777174...`) were red only because `rsvg-convert -o /dev/null` is refused (`Target file is not a regular file`). P2 was corrected to stdout redirection and those cases rerun as cited above.

### C3. where-things-go.md states the new style

- Boundary: `docs/reference/where-things-go.md` text.
- Before: `check plan-style-rules-base: 1 .../implementation/check-plan-style-rules-base-1795777163491-3421036.log`, output `missing "#f4f1e6" in docs/reference/where-things-go.md`. After: P3 prints `ok`.
- Product failure caught: a later picture leaf finds no stated card color, border, ink, sage, stroke, fonts, mark or still rule.
- Command: P3. Size: seconds. Rerun trigger: any change to where-things-go.md.
- The literal values come from brief criterion 2. Whether the section reads clearly and covers "card" and "still" in words is B's reading.

### C4. Slot B renders each picture on white and #0d1117 and answers "what does this picture show?"

- This is slot B's review step, a model reading. No test or case holds the answer.
- Inputs B reads: the two SVGs, B's own renders (command R), and A's renders and report paths. Record: B's answers in `review-B.md`.
- A runs R after U4 and writes in `implementation/report.md` one line per picture: what it shows, and the four PNG paths. Size: seconds. Rerun trigger: any SVG change.
- Unproven by command: whether a reader understands the picture. That stays with B's reading.

### C5. The destination's checks pass, including tests/docs-links.test.ts

- Command: `akrogon verify` at leaf scope (runs `format`, `test`, `typecheck`); DL for the focused run.
- Size: minutes (recent `test` check_end rows in `issues/timings.jsonl`: about 103 s). Rerun trigger: any commit on the leaf branch.
- No new test file is added, so the `test` check's `--rerun-each=5` step over changed tests runs nothing.

## Execution notes

- No credential, grant, paid launch or live resource. `akrogon status charting-pictures` prints no `Missing:` line. No restart boundaries are needed; every step takes seconds except `akrogon verify`.
- Workers in wave 1 must not read each other's files. U1 and U2 follow D4 and D5 literally so the two pictures match.
- Remove any scratch PNG or HTML made outside `implementation/` before finishing.

## Implementation notes

### 2026-11-27 (A, implement)

- Model-choice reading: brief criterion 1 ("the pictures show what the What section says", "alt text says in plain words") and criterion 4 are a model's drawing and wording, read by B from renders; no case holds an expected drawing. P2's required names and retired-word ban keep their named sources (approved names in design; design Q4 banned phrases). Refines C1 and C4, changes no decision.
- Logotype extraction for D5: `awk '/<path/' <logotype.svg> | sed 's/ fill="#90A985"//'` gives the 8 path lines with the fill removed. Refines D5.
- Workers' targeted check is P2 limited to their own file (the full P2 needs both files, which land only after wave 1). A runs the full P2 after the cherry-picks. Refines D10.
