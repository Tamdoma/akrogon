# Brief 4: docs/use/learn-from-work.md

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-use-finish-u4

## 1. Goal

Write `docs/use/learn-from-work.md`, a plain how-to page for a beginner. Subject (D8): a reusable lesson becomes one active line in `learnings/LESSONS.md` plus a history file `learnings/history/<date>-<slug>.md` (write the pattern only, no real dates). The operator runs `/learn-issues`, which sorts active lines into stopped, checkable, transfer and stays. It is operator-invoked only. Confirm in `skills/learn-issues/SKILL.md`, `skills/lesson-rule.md` and `src/lessons.ts`.

## 2. Numbered acceptance criteria

1. The page covers its subject as stated in Goal, every statement matching current `src/` and `skills/`.
2. Embed `../pictures/lessons-flow.svg` as an image with alt text describing its meaning: finding → LESSONS.md line + history file → learn-issues sorts: stopped, checkable, transfer, stays.
3. The page ends with exactly one next-step line: `Next: [<title>](<link>)` pointing to `save-records.md` (same folder).
4. No dates, no retired names, no links outside the link rule in section 5.


## 3. Read-first list

- `docs/guide/learn.md` (authoring source only)
- `skills/learn-issues/SKILL.md`, `skills/lesson-rule.md`, `src/lessons.ts`
- `docs/reference/skills.md`, `docs/reference/files.md`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Pattern to copy for tone, link form and picture embed: `docs/reference/files.md` (image line `![<meaning>](../pictures/<name>.svg)`, relative links like `../../src/sync.ts`, `../../skills/merge-issue/SKILL.md`).
- Picture meanings: `/home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/PAGE-MAP.md` lines 93-102 (read only, never edit).
- `learnings/LESSONS.md` lines on stale-rule-in-docs, ambiguous-prose-after-rename, cleanup-timing-guide-claims: old guide claims go stale, check every claim against code.

## 4. Change list and needed interfaces

- Create `docs/use/learn-from-work.md` (only path you own). Prerequisites already landed: all pictures in `docs/pictures/`, all `docs/reference/*.md` pages. No shared test resource.
- Short sentences, plain words. Say what the reader sees, does and why. Write literal commands in code spans or blocks. Link the owning skill for agent procedure instead of restating it. Link reference pages for detail instead of copying it.

## 5. Do-not, reasons and exceptions

- Do not link `docs/guide/`, `docs/start/`, `docs/examples/`, or any `docs/use/` page outside these five: merge-and-announce, when-work-fails, roll-back-a-release, learn-from-work, save-records. Reason: link rule, those pages belong to other leaves. Exception: none.
- Do not edit any file except the one page you own. Not README, not docs/reference-index.md, not docs/guide, not tests, not anything under issues/. Reason: other leaves own them, issues/ lives only in the registered checkout. Exception: a revised brief from A.
- Write and edit no test. A planned test that is red or wrong returns a mismatch to A. Reason: tests are locked after planning.
- No dates (no YYYY-MM pattern), no home paths except `~/.akrogon`, no private repo names, no names of retired commands or settings, no "was removed" or migration notes. Reason: brief criterion 4 and design Q3/Q4.
- Do not carry a claim from `docs/guide/` unless current `src/` or `skills/` confirms it; the code wins. Reason: guide pages are stale authoring sources only.
- No exercises, "now you try" steps or practice project. It is a how-to for a job the reader already wants. Reason: operator decision, no tutorial.
- Scope change or interface conflict: return a mismatch with evidence instead. Exception: a revised brief from A.
Reasons and exceptions restated: link and file limits protect other leaves (exception: revised brief), tests are locked (no exception for workers), no dates or retired names (no exception), code beats guide (no exception).

## 6. Ordered steps

1. Read the sources in section 3 and confirm each fact you plan to write in the source code (criterion 1).
2. Write the page (criteria 1-4).
3. Run section 7 commands (criteria 2, 4).
4. Commit and report.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- Docs links: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` (run `bun install --frozen-lockfile` in your worktree first). Links to pages from other units may be red until all units land; report which failures are only those.
- Bans and dates: `akrogon run-check --name docs-bans -- bun test tests/hold-retired.test.ts tests/run-permit.test.ts` and `grep -nE "\b20[0-9]{2}-[0-9]{2}" <your page>` must print nothing.
- Format: `bunx prettier --check <your page>` (fix with `--write` if needed).


## 8. Done-when, evidence and report

Commit only your page on your detached HEAD with a message like `docs(use): add <page>`, no co-author trailer. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results, with the check lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
