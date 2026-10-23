# Brief 3: docs/use/when-work-fails.md

Worktree: /home/ivan/.akrogon/worktrees/akrogon/docs-use-finish-u3

## 1. Goal

Write `docs/use/when-work-fails.md`, a plain how-to page for a beginner. Subject (D6): a failure is a recorded stop, not lost work. `failed` keeps the plan, reviews, code and reason. Steps: read `akrogon status <slug>` and the reason, fix the cause, move the leaf back with `akrogon phase <slug> <active phase>` with no `--slot`, then `akrogon next <slug>`. Confirm in `docs/reference/state-and-phases.md` and `src/phase.ts`. Cover the other cases from `docs/guide/problems.md` only where they are a failure or refusal still true in `src/`.

## 2. Numbered acceptance criteria

1. The page covers its subject as stated in Goal, every statement matching current `src/` and `skills/`.
2. Embed `../pictures/failure-recovery.svg` as an image with alt text describing its meaning: attempt → failed with recorded reason → work kept → carried forward or retried.
3. The page ends with exactly one next-step line: `Next: [<title>](<link>)` pointing to `roll-back-a-release.md` (same folder).
4. No dates, no retired names, no links outside the link rule in section 5.


## 3. Read-first list

- `docs/guide/problems.md` (authoring source only)
- `src/phase.ts`, `src/state.ts`, `src/status.ts` if present, `src/next.ts`
- `docs/reference/state-and-phases.md`, `docs/reference/commands.md`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Pattern to copy for tone, link form and picture embed: `docs/reference/files.md` (image line `![<meaning>](../pictures/<name>.svg)`, relative links like `../../src/sync.ts`, `../../skills/merge-issue/SKILL.md`).
- Picture meanings: `/home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/PAGE-MAP.md` lines 93-102 (read only, never edit).
- `learnings/LESSONS.md` lines on stale-rule-in-docs, ambiguous-prose-after-rename, cleanup-timing-guide-claims: old guide claims go stale, check every claim against code.

## 4. Change list and needed interfaces

- Create `docs/use/when-work-fails.md` (only path you own). Prerequisites already landed: all pictures in `docs/pictures/`, all `docs/reference/*.md` pages. No shared test resource.
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
