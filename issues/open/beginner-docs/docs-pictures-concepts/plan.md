# Plan: docs-pictures-concepts

Debate: no (state.yaml), so this synthesis works directly from brief.md and design.md. The design has no `Open for the plan:` questions. `akrogon status docs-pictures-concepts` prints no `Missing:` lines and the design names no credential, so there is no blocker.

## Read first

- `issues/chart/beginner-docs/PAGE-MAP.md` "Pictures" under the registered root (`/home/ivan/Work/infra/akrogon`). Read only. This leaf never edits anything under `issues/`.
- `docs/reference-index.md`, `src/AREA.md`, `skills/AREA.md` (grounding).
- Picture sources: `skills/chart-issues/SKILL.md` (including `## Direct route` and `## Autopilot`), `skills/watch-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `src/routing.ts`, `src/phase.ts`, `src/state.ts`, `src/next.ts`, `src/land.ts`, `src/config.ts` (`seats`, `indexSlots`, `slotConfigSchema`, `indexSchema`, `worktreeStore`), `src/install.ts`, `src/scope.ts`, `src/state-home.ts`, `src/sync.ts`, `docs/guide/files.md`, `docs/guide/setup.md` "Grounding".
- Proof of the check form: `issues/chart/beginner-docs/forks/svg-set.md` Taken and `issues/chart/beginner-docs/slots/svg-probe/*.png`.
- `learnings/LESSONS.md`: 2026-10-13 "Pattern kill crosses leaves" applies. Stop the http server by its own PID and close only this leaf's blepsis tab. Never run `pkill -f` or `blepsis quit`.

## Decisions

- D1 Scope: nine new files `docs/pictures/<name>.svg` and nothing else in the repo. No page embeds them, no doc is edited, and no test is added (the design excludes new tests). Docs affected: none. Consumer leaves embed the pictures and write alt text.
- D2 Shared style. All nine use the same style so the set reads as one:
  - Root `<svg>` with `viewBox` and no fixed pixel width. First child is a full-size `<rect>` card with `rx="12"`, fill `#ffffff`, stroke `#d0d7de`. The card is solid, so it reads the same on GitHub light and dark (svg-set Q2).
  - Text `#1f2328`, muted text `#57606a`, node fill `#f6f8fa`, node stroke `#8c959f`, accent (active and moving parts) `#0969da`, stop or failed `#cf222e`, optional or side route dashed `#8250df`.
  - `font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`. Label size is at least 14 user units in a viewBox at most 960 wide. That keeps labels at least about 5px at 360px width. Pictures meant for narrow pages use a taller layout of about 640 wide instead of shrinking text.
  - A `<title>` element naming the picture. No `<script>`, no external fonts or hrefs, and no `<foreignObject>`.
- D3 Motion form (svg-set Q3). Only factory-overview, chart-door and two-seats move. The motion is CSS `@keyframes` in an inline `<style>`. Every element is drawn complete at rest: the default state has full opacity and final positions, and animation only adds an accent highlight that travels along the path. Sequences (factory-overview, chart-door) run a finite number of times (`animation-iteration-count: 1` with `forwards`, ending fully drawn). The loop (two-seats) uses `infinite` with a gentle period of 6s or more. Each moving file ends with `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`, which leaves the complete still picture. Still pictures contain no `@keyframes`.
- D4 Content per picture. Each node and edge comes from the map spec, checked against live source on 2026-10-23 (AKROGON_BASE 7efe3d67):
  1. factory-overview: request → chart door (you + A) → contract in issues/open → build → independent review → repair if needed (loops back to review) → command lands → merged. A dashed side branch leaves the chart door labelled "direct route: same charted decisions and B review, no leaf handoff, no lifecycle dispatch". It rejoins at "command lands" because the door lands it itself (chart-issues `## Direct route` steps 1–3 and landing).
  2. two-seats: A implements → A review and B review side by side, each blind → findings → B repairs most (check.repair) or A repairs named exceptions (check.fix) → back to review. Pass → merge. No consultants. Checked against `src/routing.ts`: check.review slots A+B, check.repair B, check.fix A, check.fix → check.review.
  3. machine-parts: akrogon command, systemd user slice (`akrogon-l<hash>.slice`, `src/scope.ts`), Herdr panes, agent CLIs started from harness templates, machine config.yaml (repos, slots, harnesses), registered repos. Edges: the command reads config and repos, starts seats in Herdr panes under the slice, and each pane runs an agent CLI.
  4. project-folders: two separate boxes. Box 1 is the registered checkout's `issues/`: seeds, chart, open, parked, closed and the `.jsonl` records. Box 2 is the worktree store outside the checkout (default `~/.akrogon/worktrees/<repo>`, refused inside the checkout, `src/config.ts` `worktreeStore`). One worktree per leaf. Before drawing, the implementer confirms each folder name and the records file names against `src/state-home.ts`, `src/sync.ts` and the live `issues/` tree. A name that is missing from the code is left out and reported.
  5. grounding: `grounding.index` (for example docs/reference-index.md) → linked AREA file → source file. The plan and implement agents read along the chain.
  6. config-layers: seats only, one column per seat (a and b): ISSUE.md slots → EPIC.md slots (only when the leaf is under an epic) → repo issues/config.yaml slots → machine config.yaml slots. The first file holding the seat wins, and a seat comes as a whole harness/model/effort set (`indexSlots` plus `seats`, `src/config.ts` 144–182). A separate note says all other repo settings come from issues/config.yaml alone.
  7. phases: the real edges from `src/routing.ts`. plan.positions → plan.rebuttal (rebuttal on) or → plan.synthesis. plan.rebuttal → plan.synthesis. "debate off starts here" marks plan.synthesis. plan.synthesis → implement → check.review. check.review → merge or → check.repair. check.repair → merge or → check.fix. check.fix → check.review. merge → merged or → check.fix. failed is a red stop reachable from every working phase, shown as one bar rather than nine arrows. The design note "check.fix / check.repair → merge" is drawn as these exact edges, so check.fix returns to review and does not go straight to merge.
  8. ways-to-run: attended chart → lifecycle handoff, or → direct route. Autopilot chart → lifecycle handoff only, with no direct edge (`## Autopilot`: "the direct route is not offered"). Watch is attached beside lifecycle execution only. No other combination is drawn.
  9. chart-door: you ⇄ A. A ⇄ consultants as blind notes → merge → rebuttal. Then rounds → forks taken → handoff review → contract.
- D5 Check rig. Port 8781 avoids the sibling leaf's probe port. One blepsis tab is opened by this leaf. A scratch embed page `embed.html` in the scratchpad (outside the repo, not committed) shows each SVG through `<img>` on a white panel and a `#0d1117` panel. It is served from a scratch directory that symlinks `docs/pictures`.
- D6 The design's B review owns criterion 1 (meaning against source). A's report lists, for each picture, every node and edge with its source path:line so B can check it.

## Units and waves

| Unit | Owns | Shared test resource | Needs first |
|---|---|---|---|
| U1 | docs/pictures/factory-overview.svg, two-seats.svg, chart-door.svg | none (drawing only) | none |
| U2 | docs/pictures/machine-parts.svg, project-folders.svg, grounding.svg | none | none |
| U3 | docs/pictures/config-layers.svg, phases.svg, ways-to-run.svg | none | none |
| U4 | picture check of all nine, screenshots outside the repo, report entries | blepsis browser, loopback port 8781 | U1, U2, U3 |

- Wave 1: U1, U2, U3 (disjoint paths, no shared resource). Every worker gets D2–D4 verbatim.
- Wave 2: U4.

## Done-criteria → proof

### C1: nine files draw exactly their spec

- Boundary: the files in docs/pictures/ on the leaf head against the D4 sources.
- Before: docs/pictures/ does not exist. After: nine files exist, each with only the nodes and edges listed in D4.
- Failure it catches: a missing file, a role or edge the source does not support (for example autopilot → direct, or consultants in two-seats), or a missing required node.
- Observation: `akrogon run-check --name pictures-present -- sh -c 'cd docs/pictures && ls factory-overview.svg two-seats.svg machine-parts.svg project-folders.svg grounding.svg config-layers.svg phases.svg ways-to-run.svg chart-door.svg && for f in *.svg; do xmllint --noout "$f" || exit 1; done'`. Seat B then reviews meaning against the per-picture source list in the report.
- Size: seconds, plus B review time. Rerun trigger: any change to a docs/pictures/*.svg file or to a D4 source file before merge.

### C2: picture check

- Boundary: Chromium (blepsis) opening each SVG served over loopback, and the `<img>` embed page.
- Before: no file. After, for each picture:
  - With reduced motion, a screenshot at load and one 4s later both show the complete still picture.
  - Without the setting, two screenshots of the moving pictures at about 0.5s and 3s differ visibly. Still pictures show the same full picture.
  - The embed page at viewport 800 and 360 shows every label readable on the white and the #0d1117 panels.
- Failure it catches: content hidden at rest, a reduced-motion rule that leaves a mid-animation frame, no motion, unreadable labels at narrow width, or a card that disappears on dark.
- Commands, run from the worktree with `S=<scratchpad>/pictures-check`:
  1. Server: `python3 -m http.server 8781 --bind 127.0.0.1 --directory $S/site`, run in the background with its PID recorded. `$S/site` holds a `pictures` symlink to `docs/pictures` plus `embed.html`.
  2. `blepsis open_tab about:blank` → `<tab>`.
  3. For each `<name>`: `akrogon run-check --name pic-<name>-reduced -- sh -c 'blepsis emulate_media <tab> reduced-motion && blepsis navigate <tab> http://127.0.0.1:8781/pictures/<name>.svg && blepsis screenshot <tab> $S/<name>-reduced-0.png && sleep 4 && blepsis screenshot <tab> $S/<name>-reduced-4.png'`.
  4. Same with `emulate_media <tab> none` as `pic-<name>-motion`, screenshots at about 0.5s and 3s (`<name>-motion-a.png`, `<name>-motion-b.png`).
  5. `akrogon run-check --name pic-embed-<w> -- sh -c 'blepsis emulate_media <tab> none && blepsis set_viewport <tab> <w> 1400 && blepsis navigate <tab> http://127.0.0.1:8781/embed.html && blepsis screenshot <tab> $S/embed-<w>.png'` for w = 800 and 360. If the page is taller than the viewport, use `scroll` and take more shots.
  6. Cleanup: `kill <server PID>` and `blepsis stop <tab>`.
  - A reads every screenshot and judges it. Screenshot paths and the run-check log lines go in `implementation/report.md`.
- Size: minutes. Rerun trigger: any change to a docs/pictures/*.svg file.
- Proof machinery: blepsis v0.1.0, python3 and xmllint exist on this machine. `embed.html` is a new input file, not new machinery.

## Tests written at synthesis

None. C1 is a file listing plus B's review against sources, and C2 is a direct run of existing tools on the product files. The design excludes new tests beyond its named test rows, and this leaf has no test rows. There is no new test to show red, so nothing is committed before the product files. The repo `checks` (format, test, typecheck) run as usual. prettier checks only `src tests skills/chart-issues/scripts`, so the SVGs fall outside it.

## Limitations

- The check proves each SVG's own reduced-motion rule in Chromium opened directly. It does not prove that the preference reaches GitHub's embedded image (svg-set Q4 limit).
- Label readability at 360px is A's visual judgment from the screenshots, followed by B's review.
