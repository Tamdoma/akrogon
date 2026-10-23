# Brief 9: docs/use/quick-fix.md

## 1. Goal

Write one new beginner how-to page `docs/use/quick-fix.md` for the docs-use-plan leaf. Subject: Direct route: when the door builds a small settled change itself with seat B review, and when it refuses. Plan decisions D1-D8 apply (copied below).

## 2. Numbered acceptance criteria

1. `docs/use/quick-fix.md` exists and covers its subject above, in plain short sentences a beginner (can use a terminal and one agent CLI) can follow.
2. Shape (D1): one `#` title, one or two sentences on what the job is and when you want it, then the steps or explanation saying what the reader runs, sees and why. Agent procedure is not restated; link the owning skill (`../../skills/<name>/SKILL.md`) instead. Not a tutorial: no exercises, "now you try", practice project or finish line.
3. Last line of the file is exactly `Next: [Autopilot](autopilot.md)`.
4. Picture (D6): none embedded. Link in text to [Plan work](plan-work.md), which shows the ways-to-run picture
5. Optional steps (D2): any mention of watch-issues, broadcast or GitHub intake (`akrogon pull`, seed-issue) starts its step or sentence with the word "Optional".
6. Direct route / autopilot (D3): if the page mentions the direct route it says it skips the leaf handoff and `akrogon next` and keeps the charted decisions and seat B review. If it mentions autopilot it says autopilot charts and hands off and starts no execution.
7. Facts (D7): every command, flag, file, phase and behavior is checked against current `src/` and `skills/` before writing. Where the old guide page disagrees, the code wins and the old claim is dropped. Commands are written exactly as `src/akrogon.ts` parses them; link `../reference/commands.md` for the full list. No dates anywhere (no years, no month-day). No names of retired commands or settings. No "was removed", "used to", "now" migration notes: current state only.
8. Names (D8): "chart consultants" (charting helpers) and "seats" (slot A and B on a leaf) are named apart. Placeholders only (`<slug>`, `<issue>`), never real keys, private project names or home paths.
9. `bun test tests/docs-links.test.ts tests/hold-retired.test.ts tests/run-permit.test.ts` passes.

## 3. Read-first list

- Authoring sources (old claims never win over code): `docs/guide/chart.md` section "Direct route"; `skills/chart-issues/SKILL.md` section "## Direct route".
- `docs/reference/commands.md` (current command table, link target), `docs/reference/skills.md`, `docs/reference/config.md`, other `docs/reference/*.md` as needed.
- Picture files in `docs/pictures/` named above.
- An existing page style to copy: `docs/reference/limits.md` (short, plain).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Create `docs/use/quick-fix.md` only. This unit owns that one path. No prerequisite chunk, no shared test resource, consumes no other unit's output.
- Allowed link targets (D5): the nine use/ part 1 pages `docs/use/{a-working-day,plan-work,quick-fix,autopilot,write-issues-by-hand,report-an-observation,run-work,park-pause-stop,watch-while-away}.md` (link files only, never `#anchor` on a sibling page, since siblings may not exist yet in your worktree; docs-links will be checked by A after all land), `docs/reference/*.md` (anchors allowed only to headings that exist), `docs/pictures/*.svg`, `skills/**`, `src/**`.

## 5. Do-not, reasons and exceptions

- Do not link `docs/guide/`, `docs/README.md`, `README.md`, `docs/start/`, `docs/examples/` or use/ pages outside the nine: those belong to other leaves and may not exist at merge.
- Do not edit any other file, including `docs/reference/*`, `docs/pictures/*`, README, `docs/reference-index.md`, tests or anything under `issues/`: other leaves own them, and issue records live only in the registered checkout.
- Do not write or edit any test. A red planned test returns a mismatch to A.
- Do not invent behavior. If a source and code disagree in a way you cannot settle, write only what code shows and list it under Known limitations.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.
Reasons restated: other leaves own the excluded paths, tests are locked after planning, and pages must match code. Exception: a revised brief from A.

## 6. Ordered steps

1. Read the sources and verify each fact you plan to write in `src/` or `skills/` (criterion 7).
2. Write `docs/use/quick-fix.md` (criteria 1-6, 8).
3. Run the commands in section 7 (criterion 9). Docs-links may fail only for sibling use/ pages missing in your worktree; report that, and nothing else may fail.
4. Run the date grep in section 7; it must print nothing.
5. Commit only `docs/use/quick-fix.md` with message `docs(use): add quick-fix page`. No co-author line.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- `akrogon run-check --name u9-docs -- bun test tests/docs-links.test.ts tests/hold-retired.test.ts tests/run-permit.test.ts`
- `grep -nE "\b(19|20)[0-9]{2}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* [0-9]{1,2}\b" docs/use/quick-fix.md`
- Install deps first if `node_modules` is missing: `bun install --frozen-lockfile`.

## 8. Done-when, evidence and report

Return the commit id and paste the `check u9-docs: <exit> <path>` line. List each command or flag you wrote and the `src/`/`skills/` line that confirms it.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
