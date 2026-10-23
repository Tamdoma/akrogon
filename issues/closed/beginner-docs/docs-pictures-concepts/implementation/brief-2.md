# Brief 2: machine-parts, project-folders, grounding (still)

Leaf docs-pictures-concepts, unit U2 of plan.md (wave 1, alongside two sibling workers with disjoint files). Plan: /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-concepts/plan.md (read only).

## 1. Goal

Hand-write three SVG pictures in `docs/pictures/` that explain akrogon concepts to a beginner, following plan D2–D4. Later leaves embed them in docs pages.

## 2. Numbered acceptance criteria

1. Each file below exists and draws exactly the nodes and edges its spec lists, each supported by the named source (leaf C1).
2. Each file is well-formed XML and follows the shared style in section 4, so A's later picture check (reduced-motion still state, motion, labels readable at 800px and 360px) can pass (leaf C2).

There are no planned tests. The only command is the well-formedness check in section 7.

## 4. Change list (owned paths; nothing must land first; no shared test resource)

- `docs/pictures/machine-parts.svg`, still. Parts: akrogon command, systemd user slice (one per leaf, `akrogon-l<hash>.slice`), Herdr panes, agent CLIs started from harness templates, machine config.yaml (repos, slots, harnesses), registered repos. Edges: the command reads machine config and registered repos, and starts seats in Herdr panes inside the slice. Each pane runs an agent CLI. Sources: src/install.ts (systemd slice install around lines 30–35, herdr integration around line 136), src/scope.ts (slice naming at line 14, runSlice), src/config.ts (global config: harnesses, slots, repos).
- `docs/pictures/project-folders.svg`, still. Two separate root boxes. Box 1 is the registered checkout's `issues/` with seeds, chart, open, parked, closed and the `.jsonl` records. Box 2 is the worktree store outside the checkout (default `~/.akrogon/worktrees/<repo>`, which must sit outside the checkout), with one worktree per leaf. Confirm each folder name and the records file names against src/state-home.ts, src/sync.ts, src/config.ts `worktreeStore` (line 275) and the live tree at /home/ivan/Work/infra/akrogon/issues (list it with ls only, read nothing private). Leave out any name the code does not have, and report it. Source to cross-check: docs/guide/files.md (old page; code wins).
- `docs/pictures/grounding.svg`, still. Chain: `grounding.index` (for example docs/reference-index.md) → linked AREA.md file → source file. The plan and implement agents read along it. Sources: docs/guide/setup.md "Grounding" (line 78), docs/reference-index.md, src/AREA.md.
## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- The source paths named per picture in section 4 (in the worktree). Read them before you draw, and draw only what they support.
- There is no SVG in the repo yet, so this brief's style rules are the pattern to follow.

## 4. Shared style (plan D2, D3; binding for every file)

- Root `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" role="img">` with no width or height attributes. The first child is `<title>` naming the picture. Next is a full-size card `<rect x="0" y="0" width="W" height="H" rx="12" fill="#ffffff" stroke="#d0d7de"/>`.
- Colors: text `#1f2328`, muted text `#57606a`, node fill `#f6f8fa`, node stroke `#8c959f`, accent `#0969da`, failed or stop `#cf222e`, optional or side route dashed `#8250df`. The card is solid white so the picture reads on GitHub light and dark.
- `font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`, set once in an inline `<style>`. Label font-size is at least 14, and W is at most 960. Prefer a W of about 640 with a taller layout over shrinking text, because these are embedded on pages that may be 360px wide. Keep every label inside its node box with padding. Arrows use one `<marker>` arrowhead.
- No `<script>`, no `<foreignObject>`, no external href, font or image.
- Still pictures: no `@keyframes`, no animation.
- Moving pictures: CSS `@keyframes` inside the inline `<style>`. Every element is complete and fully visible at rest (default opacity 1, final positions). Animation only adds an accent highlight that travels along the path, for example an accent stroke/fill pulse on each node in sequence via `animation-delay`, or a dashed accent overlay on edges with `stroke-dashoffset`. Never animate a node from opacity 0. A sequence uses `animation-iteration-count: 1; animation-fill-mode: forwards` and ends in the complete picture. A loop uses `infinite` with a period of 6s or more and a gentle change. The file ends its style with `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`.
- Hand-written, readable source: indentation, and one short XML comment per section is fine.

## 5. Do-not, reasons and exceptions

- Edit no file outside the three paths you own. Other pictures belong to sibling workers or another leaf, and no doc page embeds these yet.
- Add no node, edge, role or combination the named source does not support, and drop none the spec lists. Seat B checks each against the source. If the spec and the live source disagree, draw the source's truth and return a mismatch note naming both, with path:line.
- Write no test and add no dependency or tooling. The design excludes both.
- Do not run browsers, blepsis, http servers or `akrogon verify`. A runs the picture check afterwards on all nine.
- Stop no process by pattern (`pkill -f`, `killall`).
- Write nothing under `issues/`.

Reasons and exceptions restated: scope and meaning are locked by the plan and checked by B. The only exception is a revised brief from A. A spec-versus-source conflict comes back as a mismatch, not a scope change.

## 6. Ordered steps

1. Read the sources for picture 1, then write the file and run the section 7 command.
2. Repeat for pictures 2 and 3.
3. Commit the three files in one commit: `git add docs/pictures/<files> && git commit -m "docs(pictures): add <names>"`. Add no co-author trailer.

Advisory size: 3 files and under 15 turns.

## 7. Commands

From the worktree root, after each file: `akrogon run-check --name svg-<name> -- xmllint --noout docs/pictures/<name>.svg`. Cite the printed `check ...` line.

## 8. Done-when, evidence and report

You are done when the three files exist, are well-formed (the xmllint lines above exit 0), are committed, and follow sections 4 and 5. Return:

- the commit id
- for each picture, a list of every node and edge drawn with its source path:line
- any spec-versus-source mismatch

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
