# Plan: docs-pictures-operations

Debate: off (`state.yaml` `debate: "no"`). Written directly from brief.md and design.md by slot A at plan.synthesis.

## Read first

- `brief.md`, `design.md` in this leaf folder. The picture specs and picture rules there are binding.
- `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root, section "Pictures" (read only, never edited).
- `issues/chart/beginner-docs/forks/svg-set.md` "Taken" (form and reduced-motion proof).
- `src/routing.ts:2-36` (phases and moves), `src/next.ts:703-777,843-847` (dispatch), `src/turn.ts:26-101` (blocked-by and dependents count).
- `src/pause.ts`, `src/park.ts:39-84`, `src/stop.ts`, `src/stop-run.ts`, `src/leftovers.ts:53-67`, `src/akrogon.ts:133-171`.
- `src/phase.ts:311-346` (failed and recovery), `src/reconcile.ts:593-600,760-771` (branch kept, worktree removed), `docs/guide/problems.md:20-27,68`.
- `src/self-update.ts:229-298`, `src/release.ts:29-84,134-170`, `src/rollback.ts:25-38`.
- `src/verify.ts:54-62,97-141,296-366,393-410`, `src/phase.ts:350-355,472-489`, `src/config.ts:47-49`.
- `src/sync.ts:7-16,34-51,166-206`, `src/next.ts:242`, `src/phase.ts:409-418`, `docs/guide/gacp.md:120`.
- `skills/plan-issue`, `implement-issue`, `check-issue`, `merge-issue`, `chart-issues`, `watch-issues`, `learn-issues`, `broadcast-issue`, `seed-issue` SKILL.md files, `skills/lesson-rule.md`, `src/pull.ts:53-81`, `src/land.ts:85-111`.
- Grounding gaps: `docs/reference-index.md` has no pictures area yet. `learnings/LESSONS.md` has no SVG lesson. No existing file in `docs/pictures/`.

## Decisions

- D1 Scope. Ten new files under `docs/pictures/` only: `change-flow.svg`, `working-day.svg`, `dispatch-order.svg`, `control-states.svg`, `failure-recovery.svg`, `watch-loop.svg`, `releases.svg`, `lessons-flow.svg`, `verification.svg`, `records-vs-code.svg`. No docs page, test, source or `issues/` path changes.
- D2 Moving vs still. Moving: `change-flow` (finite sequence) and `working-day` (gentle loop). The other eight are still, with no `@keyframes` and no animation.
- D3 Shared form for every file. Hand-written SVG with `xmlns`, `viewBox="0 0 560 H"` plus matching `width="560" height="H"`, a `<title>` naming the picture, a first child `<rect>` covering the whole viewBox as the solid card (fill `#ffffff`, stroke `#d0d7de`, rx 12). Labels are real `<text>` elements, never paths. Font `system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`. Every text is at least 17 user units, so at 360px it renders at least 10.9px. Flows run top to bottom to fit the 560 width. No `<script>`, no `<image>`, no external href, no web fonts.
- D4 Palette, same in every file, fixed on both GitHub themes because the card is the background: text `#1f2328`, muted text `#59636e`, node fill `#f6f8fa`, node stroke `#8c959f`, accent `#0969da`, success `#1a7f37`, failure `#cf222e`, hold/warn `#9a6700`. No `prefers-color-scheme` rule (the card makes it unneeded).
- D5 Motion form. The still picture is always complete: every node, edge and label is drawn at full opacity with no animation on it. Motion only adds one marker (a small accent circle or highlight outline) that moves or pulses with CSS `@keyframes` inside a `<style>` in the file. `change-flow`: one pass, about 8s, `animation-fill-mode: forwards`, ending on "merged". `working-day`: infinite, about 14s per cycle, ease-in-out. Both files carry `@media (prefers-reduced-motion: reduce) { .marker { animation: none; } }` with the marker's static attributes placing it on the final node, so the reduced state is the full final picture.
- D6 Content follows the source, not the map wording, where they differ. The map tells the implementer to check each node and edge against the named source before drawing, and the design says the code wins. Each correction below keeps the map's nodes and is listed for B's review. None changes a page subject or owner, so the map is not wrong enough to stop the leaf.
- D7 No new tests. The design excludes "new tests beyond the test rows named here" and names none for this leaf. That overrides plan-issue's step to write a test per criterion. Note for review: the design wins here. Criterion 1 is proven by B's source review, criterion 2 by the picture check below with existing tools (blepsis, python http.server, xmllint).
- D8 The picture check is run by A only, after all units land, because it uses one shared blepsis browser and one loopback port. Workers only run `xmllint`.
- D9 Docs affected: none. No agent or human doc changes in this leaf. Consumer pages (docs-reference-commands, docs-reference-records, docs-use-plan, docs-use-finish, docs-start) embed the pictures and write alt text.

## Picture content (nodes and edges, with source)

Each line gives the drawn content. "Correction" marks where the drawing departs from the map wording because the source says otherwise.

1. change-flow (moving). Nodes: plan → build → review → land → merged, with a side loop: review → finding → repair → re-check → review. Edge review → land when there is no finding. Repair node label: "repair: B fixes most, A fixes the rest". Correction: B's own repair goes straight on to land, and only A's fixes go back through re-check (`src/routing.ts:33-34`, `skills/check-issue/SKILL.md:81,97`), so the drawing adds edge repair → land beside repair → re-check. "land" label: "the command lands" (`src/land.ts:85-111`, `skills/merge-issue/SKILL.md:37`). Marker path: plan, build, review, land, merged.
2. working-day (moving loop). Nodes: intake (a local note, or a GitHub issue or seed brought in by `akrogon pull`) → `/chart-issues` → fork: direct route (door builds, B reviews, door lands) → merged, or handoff to `issues/open` → `akrogon next` → seats plan, build, review, repair → command lands → merged. Optional dashed side boxes: `watch-issues` beside the execution steps, broadcast after merged labeled "once per finished issue". Autopilot drawn as a dashed note on `/chart-issues` → handoff only: "autopilot charts and hands off, starts nothing". Sources: `skills/chart-issues/SKILL.md:31-35,73,87,91-145`, `src/pull.ts:53-81`, `skills/broadcast-issue/SKILL.md:10`, `skills/watch-issues/SKILL.md`. Marker loops along the lifecycle path.
3. dispatch-order (still). open leaves (in `issues/open`, not stopped or failed) → "blocked-by all merged?" no → waiting, yes → order rule box "merged leaves first, then most waiting dependents" → started, with the note "up to max_active". Sources: `src/next.ts:703-777,843-847`, `src/turn.ts:26-101`, `src/next.ts:399-403`.
4. control-states (still). Three separate groups. Repo: running ↔ paused (`akrogon pause` / `akrogon unpause`, note "pause holds automatic starts"). Issue: open ↔ parked (`akrogon park` / `akrogon unpark`, note "park refused while a leaf has a tab or worktree"). Leaf and runs: stopped ↔ started (`akrogon stop` / `akrogon start`), `akrogon stop-run` stops one run, `akrogon leftovers` lists what cleanup kept. Correction: leftovers only reports, it deletes nothing (`src/leftovers.ts:53-67`). Sources: `src/akrogon.ts:133-171`, `src/pause.ts`, `src/park.ts:39-84`, `src/stop.ts`, `src/stop-run.ts`, `src/next.ts:703`.
5. failure-recovery (still). attempt → failed with recorded reason → work kept on the leaf branch → `akrogon phase <slug> <phase>` then `akrogon next` → carried forward from the step that still needs work, or that step retried. Correction: "work kept" is the branch, plan and records. The worktree is removed and rebuilt from the branch (`src/reconcile.ts:593-600,760-771`, `src/next.ts:266-273`). Sources: `src/phase.ts:311-346`, `docs/guide/problems.md:20-27,68`.
6. watch-loop (still). cron every 20 min → read status (stop if repo paused) → act within allowed steps (start waiting leaves, retry a failed leaf at its phase, nudge a looping seat) or report → you (notification). Sources: `skills/watch-issues/SKILL.md:12-59`.
7. releases (still). source (merged default branch, fetched) → release folder → active (`current`), with previous release kept, a hold on the rolled-back commit, and `akrogon rollback` → previous. Correction: the release is built from the fetched default branch, not the working checkout (`src/self-update.ts:236-243`, `src/release.ts:56-84`). Hold set by rollback and cleared by the next good deploy (`src/rollback.ts:34-38`, `src/self-update.ts:254-296`).
8. lessons-flow (still). finding → `LESSONS.md` line + history file → `/learn-issues` sorts into four: stopped (line removed), checkable (seed line printed), transfer (moved into a review step after your approval), stays (unchanged). Sources: `skills/learn-issues/SKILL.md:20-33`, `skills/lesson-rule.md:5-8`.
9. verification (still). leaf checks (`checks`) versus merge checks (`checks` minus `merge_covers`, plus `merge_checks`) → `akrogon verify` on a fresh checkout → receipt in `issues/verify-runs.jsonl`. Red side: known-red compares failing tests with the base → passes only if the same tests fail there. Test-change refusal → remedy "add a Test-Change trailer". Sources: `src/verify.ts:54-62,97-141,296-366,403-410`, `src/phase.ts:350-355,472-489`. Correction: the test-change refusal lives in `src/phase.ts`, not `src/guard.ts`.
10. records-vs-code (still). leaf branch: code only (`issues/` left out) → lands on main. Lifecycle records in `issues/` → `akrogon sync` → commit "sync issues" pushed to main. Sources: `src/next.ts:242`, `src/phase.ts:409-418`, `src/sync.ts:7-16,166-206`.

## Units and waves

Wave 1 (three workers, disjoint paths, no shared test resource, no prerequisite):

- U1 moving pictures. Owns `docs/pictures/change-flow.svg`, `docs/pictures/working-day.svg`. Uses D3-D6 and content items 1-2. Unit check: `xmllint --noout` on its files.
- U2 control pictures. Owns `docs/pictures/dispatch-order.svg`, `docs/pictures/control-states.svg`, `docs/pictures/failure-recovery.svg`, `docs/pictures/watch-loop.svg`. Items 3-6. Unit check: `xmllint --noout` on its files.
- U3 record pictures. Owns `docs/pictures/releases.svg`, `docs/pictures/lessons-flow.svg`, `docs/pictures/verification.svg`, `docs/pictures/records-vs-code.svg`. Items 7-10. Unit check: `xmllint --noout` on its files.

After wave 1, A alone runs the picture check (D8) and fixes any picture that fails it. Not serial-solo: wave 1 holds three units.

## Done-criteria and proof

### C1. Each file exists and draws the nodes, edges and roles its spec names

- Boundary: the ten SVG files on the leaf branch versus the specs above and their named sources.
- Before: `docs/pictures/` does not exist. After: ten files, each well-formed, each drawing the listed content.
- Failure caught: a missing or broken file, a missing or wrong node or edge, a claim the source contradicts.
- Command: `akrogon run-check --name svg-wellformed -- sh -c 'test $(ls docs/pictures/*.svg | wc -l) -eq 10 && xmllint --noout docs/pictures/*.svg'` in the leaf worktree, then B reads each file against the content list and sources. Red before work, observed at plan.synthesis on base 7efe3d67: `ls: cannot access 'docs/pictures/*.svg': No such file or directory`, `check svg-wellformed: 1 implementation/check-svg-wellformed-1792764742883-2852854.log`.
- Size: seconds. Rerun trigger: any change under `docs/pictures/`.

### C2. Picture check per file

- Boundary: Chromium (blepsis) loading each SVG over loopback, directly and through `<img>`.
- Before: no pictures. After: screenshots show the complete still picture under reduced motion at load and later, visible motion for the two moving files without it, and readable labels at 800px and 360px on white and `#0d1117`.
- Failure caught: a reduced-motion rule that leaves a half-drawn state, missing motion, labels too small or clipped at 360px, a picture unreadable on dark GitHub.
- Setup (A, outside the repo). `S=<scratchpad>/picture-check`. Make `$S/serve` with a symlink `pictures -> <worktree>/docs/pictures`, plus `embed-light.html` and `embed-dark.html`: body background `#ffffff` or `#0d1117`, margin 16px, all ten `<img src="pictures/<name>.svg" style="max-width:100%">` stacked. Start `python3 -m http.server 8765 --bind 127.0.0.1 --directory $S/serve` in the background. `blepsis launch`, `blepsis open_tab` to get tab `T`.
- Reduced motion, each of the ten: `blepsis emulate_media T reduced-motion`, then `akrogon run-check --name rm-<name> -- sh -c 'blepsis navigate T http://127.0.0.1:8765/pictures/<name>.svg && blepsis screenshot T $S/shots/<name>-reduced-0s.png && sleep 4 && blepsis screenshot T $S/shots/<name>-reduced-4s.png'`. Both screenshots show the full still picture.
- Motion, the two moving files: `blepsis emulate_media T none`, then `akrogon run-check --name motion-<name> -- sh -c 'blepsis navigate T http://127.0.0.1:8765/pictures/<name>.svg && sleep 1 && blepsis screenshot T $S/shots/<name>-motion-1s.png && sleep 2 && blepsis screenshot T $S/shots/<name>-motion-3s.png'`. The marker sits in different places in the two shots.
- Widths and backgrounds: `akrogon run-check --name embed-<bg>-<w> -- blepsis render_html http://127.0.0.1:8765/embed-<bg>.html --output $S/shots/embed-<bg>-<w>.png --width <w> --full-page` for `bg` in light, dark and `w` in 800, 360. Every label reads in all four.
- Cleanup: close the tab, stop the server by its own PID (never by pattern).
- Record: every screenshot path and each run-check log line in `implementation/report.md`.
- Size: minutes. Rerun trigger: any change under `docs/pictures/`. No model or outside stage.

## Tests written at plan.synthesis

None, per D7. No product code exists in this leaf, so there is no test commit before it.

## Notes for review

- N1 (D7): plan-issue asks for a test per criterion. The design excludes new tests for this leaf, so none is added.
- N2 (D6): change-flow adds edge repair → land, control-states labels leftovers as a report, failure-recovery says the work is kept on the branch, releases names the fetched default branch as the source, verification cites `src/phase.ts` for the test-change refusal. Each follows the source over the map wording.
- N3: the map's `releases` source list and `verification` source list name files whose code does not hold every drawn fact (`src/guard.ts` holds only the ancestor and own-modules guards). The extra sources are cited above.
