# Brief 2: control pictures (dispatch-order, control-states, failure-recovery, watch-loop)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-pictures-operations-u2. Leaf plan: /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/plan.md (D1-D6). Wave 1, no prerequisite, no shared test resource. Owned paths: `docs/pictures/dispatch-order.svg`, `docs/pictures/control-states.svg`, `docs/pictures/failure-recovery.svg`, `docs/pictures/watch-loop.svg`.

## 1. Goal

Four still SVGs explaining how work is ordered, paused or stopped, recovered after failure, and watched (plan D1-D4, D6).

## 2. Numbered acceptance criteria

1. All four files exist, are well-formed XML, follow the shared form below, and have no animation.
2. Each draws exactly the nodes and edges in section 4.

## 3. Read-first list

- `src/next.ts:399-403,703-777,843-847`, `src/turn.ts:26-101`.
- `src/akrogon.ts:133-171`, `src/pause.ts`, `src/park.ts:39-84`, `src/stop.ts`, `src/stop-run.ts`, `src/leftovers.ts:53-67`.
- `src/phase.ts:311-346`, `src/reconcile.ts:593-600,760-771`, `src/next.ts:266-273`, `docs/guide/problems.md:20-27,68`.
- `skills/watch-issues/SKILL.md:12-59`.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

dispatch-order (still). "open leaves (in issues/open, not stopped or failed)" → diamond/box "blocked-by all merged?" → no: "waiting" ; yes: box "order rule: merged leaves first, then most waiting dependents" → "started", with a muted note "up to max_active at once".

control-states (still). Three separate labeled groups, no edges between groups:
- "Repo": running ⇄ paused, edge labels "akrogon pause" / "akrogon unpause", note "pause holds automatic starts".
- "Whole issue": open ⇄ parked, edge labels "akrogon park" / "akrogon unpark", note "park is refused while a leaf has a tab or worktree".
- "Leaf and runs": stopped ⇄ started, edge labels "akrogon stop" / "akrogon start"; separate items "akrogon stop-run: stops one run" and "akrogon leftovers: lists what cleanup kept" (leftovers only reports, deletes nothing: `src/leftovers.ts:53-67`).

failure-recovery (still). attempt → "failed, with a recorded reason" (failure color) → "work kept on the leaf branch (plan, reviews, code)" → "akrogon phase <slug> <phase>, then akrogon next" → two outcomes: "carried forward from the step that still needs work" and "that step retried".

watch-loop (still, a cycle drawn with a return arrow). "cron every 20 min" → "read status (stop if the repo is paused)" → "act within allowed steps: start waiting leaves, retry a failed leaf at its phase, nudge a looping seat" or "report" → "you (notification)"; return arrow back to cron.
## Shared picture form (plan D3-D5, binding for every file)

- Hand-written SVG, one file per picture, in `docs/pictures/`. Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 H" width="560" height="H" role="img">` with H chosen to fit the content. First child `<title>` naming the picture in plain words.
- Solid card: the first drawn element is `<rect x="1" y="1" width="558" height="H-2" rx="12" fill="#ffffff" stroke="#d0d7de" stroke-width="2"/>` covering the whole picture. GitHub light and dark both show this card, so there is no `prefers-color-scheme` rule.
- Palette (exact): text `#1f2328`, muted text `#59636e`, node fill `#f6f8fa`, node stroke `#8c959f`, accent `#0969da`, success `#1a7f37`, failure `#cf222e`, hold/warn `#9a6700`.
- Text: real `<text>` elements only (never converted paths). `font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif` set once in a `<style>` block. Every text at least 17 user units (`font-size` ≥ 17), main labels 18-20. Use `<tspan x=".." dy="..">` for a second line. No text may overflow its box or the card; at 560 wide a box holds roughly 26 characters per line at 18px, so wrap.
- Layout: flows run top to bottom (the width is fixed at 560). Arrows: `<line>`/`<path>` with a `<marker>` arrowhead defined in `<defs>`; dashed (`stroke-dasharray="6 5"`) for optional branches. Inline commands in labels use the same font (no monospace requirement).
- Forbidden: `<script>`, `<image>`, `<foreignObject>`, any external `href`/URL except the `xmlns`, web fonts, `@import`.
- Still pictures: no `@keyframes`, no `animation`.
- Moving pictures: the still picture is always complete. Every node, edge and label is drawn at full opacity and never animated. Motion only adds one marker element with class `marker` (a small accent circle r≈8 or a highlight outline) moved or pulsed with CSS `@keyframes` inside the file's `<style>`. The marker's own static attributes (cx/cy or transform) place it on the final node, so the file must also contain exactly `@media (prefers-reduced-motion: reduce) { .marker { animation: none; } }`, which makes the reduced state the full final picture.
- Wording: plain short words for a beginner. No dates. No names of retired commands or settings. Do not invent facts beyond the content list below.
## 5. Do-not, reasons and exceptions

- Do not touch any path outside the files this unit owns, because the other units own the other pictures and no docs page, test or source changes in this leaf. Exception: none.
- Do not write or edit any test, because this leaf has no new tests (plan D7). Exception: none.
- Do not change node or edge content from the list in section 4, because B reviews it against the sources cited there. If a source line you open contradicts the list, return a mismatch with the path:line instead of changing it. Exception: a revised brief from A.
- Do not open browsers or run blepsis; A runs the picture check (plan D8).
- Do not touch `issues/` or `.env*`.

Reasons restated: owned paths keep the wave conflict-free, tests are excluded by the design, content is locked to cited sources, the browser is A's shared resource.

## 6. Ordered steps

1. Read section 3 sources only as needed to place labels correctly.
2. Write each owned SVG by the shared form and section 4 content.
3. Run the section 7 command and fix until it exits 0.
4. Open each SVG as text once more and confirm: card rect first, every font-size ≥ 17, no forbidden element, content matches section 4.
5. Commit only your owned files on the detached HEAD with a message like `docs(pictures): add <names>` (no co-author line). Return the commit ID.

Advisory size: 4 files, under 20 turns.

## 7. Commands

`akrogon run-check --name u-xml -- xmllint --noout <your owned files>` run from your worktree. Cite the `check u-xml: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when every owned file exists, is well-formed, follows the shared form and draws exactly the section 4 content, committed in one commit. Return:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
