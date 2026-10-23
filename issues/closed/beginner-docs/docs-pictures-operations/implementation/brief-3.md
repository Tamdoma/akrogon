# Brief 3: record pictures (releases, lessons-flow, verification, records-vs-code)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-pictures-operations-u3. Leaf plan: /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/plan.md (D1-D6). Wave 1, no prerequisite, no shared test resource. Owned paths: `docs/pictures/releases.svg`, `docs/pictures/lessons-flow.svg`, `docs/pictures/verification.svg`, `docs/pictures/records-vs-code.svg`.

## 1. Goal

Four still SVGs explaining releases, lessons, verification and where records live (plan D1-D4, D6).

## 2. Numbered acceptance criteria

1. All four files exist, are well-formed XML, follow the shared form below, and have no animation.
2. Each draws exactly the nodes and edges in section 4.

## 3. Read-first list

- `src/self-update.ts:229-298`, `src/release.ts:29-84,134-170`, `src/rollback.ts:25-38`.
- `skills/learn-issues/SKILL.md:20-33`, `skills/lesson-rule.md:5-8`.
- `src/verify.ts:54-62,97-141,296-366,403-410`, `src/phase.ts:350-355,472-489`, `src/config.ts:47-49`.
- `src/sync.ts:7-16,166-206`, `src/next.ts:242`, `src/phase.ts:409-418`.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

releases (still). "source: merged default branch, fetched" → "release folder" → "active (current)". Beside active: "previous release kept". "akrogon rollback" edge from active back to previous (previous becomes active). A hold box in hold color: "hold on the rolled-back commit (cleared by the next good deploy)", linked from rollback.

lessons-flow (still). "finding" → "LESSONS.md line + history file" → "/learn-issues sorts" → four outcome boxes: "stopped: line removed", "checkable: seed line printed", "transfer: moved into a review step after your approval", "stays: unchanged".

verification (still). Top: two side-by-side boxes "leaf checks: checks" and "merge checks: checks minus merge_covers, plus merge_checks" → "akrogon verify on a fresh checkout" → green: "receipt in issues/verify-runs.jsonl" (success color). Red branch (failure color): "known-red: compare failing tests with the base" → "passes only if the same tests fail there". Separate pair: "changed test file without a trailer: refused" → "remedy: add a Test-Change trailer".

records-vs-code (still). Two lanes. Lane 1: "leaf branch: code only (issues/ left out)" → "lands on main". Lane 2: "lifecycle records in issues/" → "akrogon sync" → "commit 'sync issues' pushed to main".
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
