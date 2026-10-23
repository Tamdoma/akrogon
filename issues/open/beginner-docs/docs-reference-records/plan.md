# Plan: docs-reference-records

Direct synthesis (`debate: no`). Docs-only leaf: four new pages under `docs/reference/`, no product code, no test changes.

## Read first

- `docs/reference-index.md` (grounding index), `learnings/LESSONS.md` (relevant: 2026-09-11 stale-rule-in-docs, 2026-10-11 cleanup-timing-guide-claims, 2026-09-14 ambiguous-prose-after-rename: docs claims go stale against code, so check every claim against `src/` and `skills/`, not against the old guide).
- Design: `design.md` in this leaf. Page map: `issues/chart/beginner-docs/PAGE-MAP.md` (registered root), rows "reference/ part 2".
- Authoring sources (old pages, never linked): `docs/guide/files.md`, `docs/guide/parts.md` ("Folders…"), `docs/guide/state.md`, `docs/guide/phases.md`, `docs/guide/install.md`, `docs/guide/limits.md`, `README.md` ("Install", "Initialize a repository").
- Truth sources: `src/state.ts` (`stateSchema`, `batchSchema`, `failureSchema`, `deliveryErrorSchema`, `broadcastSchema`), `src/routing.ts` (`phaseSchema`, `routing`, `requiredSlots`), `src/phase.ts` (`transition`), `src/next.ts`, `src/timing.ts`, `src/timing-report.ts`, `src/flaky.ts`, `src/run-check.ts`, `src/self-update.ts`, `src/release.ts`, `src/sync.ts`, `src/park.ts`, `src/AREA.md`, `skills/*/SKILL.md` (plan-issue, implement-issue, check-issue, merge-issue for who moves each phase).
- Pictures (already on main, from merged docs-pictures-concepts and docs-pictures-operations): `docs/pictures/project-folders.svg`, `docs/pictures/phases.svg`, `docs/pictures/releases.svg`.

## Decisions

- D1. Four pages, one subject each, exactly the page-map rows: `docs/reference/files.md`, `docs/reference/state-and-phases.md`, `docs/reference/releases-and-updates.md`, `docs/reference/limits.md`. Nothing else in the repo changes.
- D2. Code wins. Every claim is checked against the truth sources above. An old guide claim that the code does not support is dropped, not carried. No dates, no "was removed"/migration notes, no names of retired commands or settings.
- D3. Links: only to pages and pictures owned by this leaf or its `blocked-by` leaves (the three pictures above), plus skills and source files. No link to `docs/guide/` and no link to pages other leaves have not delivered (commands.md, checks.md, config.md, use/ pages, docs home). Cross-topic pointers name the skill or source file instead.
- D4. Pictures embed as `![<alt text that states what the picture shows>](../pictures/<name>.svg)` near the top of the section they explain: project-folders in files.md, phases in state-and-phases.md, releases in releases-and-updates.md. limits.md has no picture.
- D5 (answers the design's "Open for the plan"). The phase list and who moves each phase come from `src/routing.ts` `routing` and `requiredSlots`, plus `src/phase.ts` `transition` and `skills/merge-issue/SKILL.md`. As of `AKROGON_BASE`:

  | Phase | Seats that work | Who moves it on | Allowed next |
  |---|---|---|---|
  | plan.positions | A and B | each seat with `--slot`, moves after both are done | plan.rebuttal, plan.synthesis, failed |
  | plan.rebuttal | A and B | each seat, after both | plan.synthesis, failed |
  | plan.synthesis | A | A | implement, failed |
  | implement | A | A | check.review, failed |
  | check.review | A and B; only B once `fix_rounds` > 0 | the required seats, each with a verdict | merge, check.repair, failed |
  | check.repair | B | B | merge, check.fix, failed |
  | check.fix | A | A | check.review, failed |
  | merge | B (only when the command's land run hands the attempt over, or a solo rebase) | normally the command's land run moves it to merged with no seat; otherwise B's `merged` call (the command pushes) or B to check.fix | merged, check.fix, failed |
  | merged | none | terminal | none |
  | failed | none | the operator, with no `--slot`, to any active phase except merged | any active phase |

  Into `failed`: any seat with `--reason` (writes `failure` with cause `blocked`). The implementer traces in `src/next.ts` and `src/phase.ts` whether any other current path writes `failed` (the `attempts` cause is read in `src/next.ts` but no current writer was found at `AKROGON_BASE`); the page documents only writers that exist.
- D6. state-and-phases.md lists every top-level `stateSchema` field in one table (field, meaning in one plain line, who writes it: you, chart door, or the command). It names the fields a person sets (`slug`, `created`, `repo`, `phase` only through `akrogon phase`, `debate`, `blocked-by`, `sources`) apart from command-owned ones. Nested records (`batch`, `failure`, `delivery_error`, `broadcast`) get one line each for the record plus its sub-fields in plain words, with a pointer to `src/state.ts` for exact shape.
- D7. files.md covers: the checkout's `issues/` layout (open, closed, parked, chart, config), the leaf folder records (brief, design, positions/rebuttals, plan, implementation report, reviews, state.yaml, readiness.yaml), the worktree store outside the checkout (path from `akrogon config` `worktree_store`), and the timing and flaky reports (what writes them, where they live, which command reads them), each verified in `src/timing*.ts`, `src/flaky.ts`, `src/run-check.ts`, `src/akrogon.ts`.
- D8. releases-and-updates.md covers: installed release versus source checkout, how registered checkouts follow main, what triggers a deploy, and how a failed update is reported while the active release stays in place, verified in `src/self-update.ts`, `src/release.ts`. Rollback steps are not written here (owned by docs-use-finish).
- D9. limits.md states what Akrogon does not do and what stays the operator's job, from `docs/guide/limits.md` with each line re-checked against current code and skills. Lines the code no longer supports are dropped.
- D10. Style: plain, short sentences for a beginner. Describe what the reader sees, does and why. Agent procedure is linked to its skill, not restated. Literal commands are written out only where the lookup needs them.
- D11. No new tests. The design excludes test changes for this leaf, and docs-links/hold-retired/run-permit retargeting is owned by docs-reference-commands. Criteria are proven by direct observation commands below, the existing `bun test` (whose `tests/hold-retired.test.ts` already scans every file under `docs/` recursively) and B's per-page source review, which brief criterion 3 names.

## Interfaces

None. Pages are plain Markdown rendered by GitHub. Picture paths are relative from `docs/reference/` to `docs/pictures/`.

## Checklist by wave

Wave 1 (three units, disjoint paths, no shared test resource, no dependency):

- U1 files.md. Owns `docs/reference/files.md`. Prerequisites: none. Sources: D7.
- U2 state-and-phases.md. Owns `docs/reference/state-and-phases.md`. Prerequisites: none. Sources: D5, D6.
- U3 releases-and-updates.md. Owns `docs/reference/releases-and-updates.md`. Prerequisites: none. Sources: D8.

Wave 2:

- U4 limits.md. Owns `docs/reference/limits.md`. Prerequisites: none (placed in wave 2 only by the 3-per-wave cap). Sources: D9.

Docs affected: the four new pages above are the whole change. Inbound links (README, docs home, reference-index) are owned by docs-start. No agent doc changes.

## Criteria and proof

Run from the leaf worktree. Labels go through `akrogon run-check --name <label> -- <cmd>`.

- C1 (brief 1: each page exists and covers its subject).
  - Boundary: the four Markdown files as GitHub renders them. Before: none exist. After: all four exist with the subjects in D5–D9.
  - Command: `akrogon run-check --name c1-pages -- sh -c 'cd docs/reference && test -s files.md && test -s state-and-phases.md && test -s releases-and-updates.md && test -s limits.md'`.
  - Content coverage: B reads each page against D5–D9 and the brief's list (issues/ layout, worktree store, each record file, timing and flaky reports; every state field and every phase with who moves it; release vs checkout, follow main, deploy trigger, failed update report; does-not-do and operator's job).
  - Catches: a missing page or a missing subject a reader would look up. Size: seconds. Rerun: any change to these pages.
- C2 (brief 2: pictures embedded with alt text).
  - Boundary: image reference in the page and the SVG file it points at. Before: no pages. After: each of the three pages has a non-empty alt text image link to its existing picture.
  - Command: `akrogon run-check --name c2-pictures -- sh -c 'cd docs/reference && grep -qE "!\[[^]]+\]\(\.\./pictures/project-folders\.svg\)" files.md && grep -qE "!\[[^]]+\]\(\.\./pictures/phases\.svg\)" state-and-phases.md && grep -qE "!\[[^]]+\]\(\.\./pictures/releases\.svg\)" releases-and-updates.md && test -f ../pictures/project-folders.svg && test -f ../pictures/phases.svg && test -f ../pictures/releases.svg'`.
  - Catches: a broken or alt-less picture. Size: seconds. Rerun: page or picture path change.
- C3 (brief 3: matches current src/skills, nothing retired, no dates).
  - Boundary: page text versus `src/` and `skills/` at the leaf head.
  - No dates: `akrogon run-check --name c3-no-dates -- sh -c 'cd docs/reference && test -s files.md && test -s state-and-phases.md && test -s releases-and-updates.md && test -s limits.md && ! grep -nE "\b(19|20)[0-9]{2}\b" files.md state-and-phases.md releases-and-updates.md limits.md'`.
  - Retired surfaces: `akrogon run-check --name c3-retired -- bun test --timeout=30000 tests/hold-retired.test.ts` (scans `docs/` recursively for retired hold/red-on-base surface).
  - Every statement: B checks each page against its listed sources (brief names this review). The implementation report lists, per page, the source file and symbol behind each table row or claim so B can check it line by line.
  - Links: every relative link in the four pages resolves (B checks; the repo link test does not yet scan nested docs, its retarget belongs to docs-reference-commands).
  - Catches: stale claims, retired names, dates. Size: seconds for commands, minutes for review. Rerun: any page edit or a change to a cited source.
- Repo checks: `akrogon verify` (format, test, typecheck) before `check.review`.

### Red evidence at synthesis

No new test files (D11). The observation commands were run at `AKROGON_BASE` before any page exists:

- `check c1-pages: 1 implementation/check-c1-pages-1792766098430-537552.log` (`cd: docs/reference: No such file or directory`).
- `check c2-pictures: 1 implementation/check-c2-pictures-1792766098521-537609.log` (same cause).
- `check c3-no-dates: 1 implementation/check-c3-no-dates-1792766098608-537663.log` (same cause; the `test -s` guard keeps it from passing on missing pages).
- Grep logic probed on scratch files: alt text present matches (0), empty alt `![]` does not match (1), a year `2026` is caught by the date pattern (0).

## Limitations

- Link resolution in nested docs is not machine-checked until docs-reference-commands retargets `tests/docs-links.test.ts`. Covered by B review here.
- `failure.cause: attempts` is accepted by the schema but no current writer was found (D5). The implementer confirms and documents only what exists.
- No slow runs, no live or paid actions, no credentials.
