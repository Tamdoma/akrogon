# Plan: learn-issues

## Decisions

- **D1.** New skill `skills/learn-issues/SKILL.md`, prose-only. Its target file resolves from `akrogon config`: take the `repo` key into `repos` for the registered root, and stop telling the operator the location is unregistered when it reports `repo: none` (proof in `issues/chart/retro-concepts/forks/adopt.md`; runs from root, subdirectory or worktree). Lesson edits go to `<registered root>/learnings/LESSONS.md`, never a worktree copy (design X1).
- **D2.** Three outcomes verbatim per brief: already guarded removes the active line and dates the line's history file with the guard's file:line, without rewriting the historical case (design X2); checkable prints one ready-to-run `/seed-issue` line naming the lesson and the reachable case, never the check to build (X4); stays is the default. A check counts as covering only when reached from blocking `checks` or the command path; a fix in one place with the pattern reachable elsewhere is checkable.
- **D3.** Before sorting, the skill reads each line's linked history file for the observed failure and checks the mechanism against current code plus the repo's `checks` and `merge_checks` (the design adds "read each lesson's history and current mechanism before sorting" per operator's retro-ideas note). It shows the sorted list grouped with file:line evidence, then removes already-guarded lines without a further question; the uncommitted diff is the operator's review. No chart, map, pull, handoff, or scheduled run.
- **D4.** `skills/chart-issues/SKILL.md` open paragraph: drop `and offer a lesson prune at open` only; the rest of the sentence including the `learnings/LESSONS.md` resource read stays verbatim.
- **D5.** `learnings/LESSONS.md` header line 5 (`A line leaves when applied or pruned at chart open.`) reworded to name `/learn-issues` as the place lines are pruned. No lesson line changes.
- **D6.** Doc updates: `docs/reference-index.md` "the nine agent workflows" becomes ten (9 skill folders + this one = 10); `README.md` skill table gains a linked `[learn-issues](skills/learn-issues/SKILL.md)` row (table is unordered, placed with the issue skills); `docs/guide/cheat.md` gains a `learn-issues` row in Need/Skill/What-you-get form and the operator-invoked sentence gains lesson triage; `docs/guide/learn.md` replaces "Charting can propose removing stale entries" with `/learn-issues` removing a lesson once a running guard covers it and offering a seed when a check could; `skills/AREA.md` Key files gains a `learn-issues` bullet.
- **D7.** No test asserts skill wording or counts. Proof for criteria 1-4 is direct inspection commands on the files; the only test-dependent proof is `tests/docs-links.test.ts` for the new README link, already inside `checks` (`bun test`).
- **D8.** The implementation report (written by A at implement end, `implementation/report.md` in the leaf folder) records a dry walk of the new skill's rules against the current `learnings/LESSONS.md`: every active line classified with file:line evidence and guard-invocation tracing before any already-guarded verdict, including LESSONS.md:10 (uncommitted handoff) and :17 (whitespace-only input). Read-only; no lesson or history edits.

## Read-first

- `brief.md`, `design.md` in the leaf folder
- `skills/chart-issues/SKILL.md` (the open paragraph to edit; also the reference style for a skill file)
- `skills/seed-issue/SKILL.md` (referenced by the seed-offer output format)
- `skills/implement-issue/SKILL.md` (`:31` applied-lesson dating rule the new skill mirrors; worker protocol and report expectations)
- `skills/AREA.md`, `docs/reference-index.md`, `README.md` skill table near :180, `docs/guide/cheat.md` near :115-129, `docs/guide/learn.md` near :18
- `learnings/LESSONS.md` (all 15 active lines) and `learnings/history/2026-09-11-uncommitted-handoff.md`, `learnings/history/2026-09-19-min1-not-nonblank.md` for the dry-walk targets
- `src/phase.ts` (`requireClean` :265-269, `requireNonEmpty` :311, dirty-tree guard :225) — the guard call path the dry walk traces for LESSONS.md:10
- `src/config.ts` (`text = z.string().min(1)` :9, still reachable) — dry-walk evidence for LESSONS.md:17
- `src/install.ts` :12-21 — skills discovered from the folder; confirms no installer change
- `tests/docs-links.test.ts` — the existing link resolver covering the new README link
- `skills/implement-issue/ponytail.md` — worker read-first requirement (learn-issues gets no assets; ponytail lives in implement-issue only)

## Needed interfaces

- `akrogon config` output: `repo` key and `repos.<name>` path for registered-root resolution; `repo: none` for the stop case. Also the source of `checks`/`merge_checks` the skill audits against.
- LESSONS.md active-line grammar: one bullet, mechanism + date + `history/<file>` link; two format styles exist (bare `history/x.md` and `History: [name](path)`); removal covers both.
- Skill frontmatter: `name:` and `description:` keys, `Operator-invoked only` wording.
- `/seed-issue` invocation form: `/seed-issue <observation naming lesson and reachable case>`.

## Waves

### Wave 1 (three independent units, disjoint paths, no shared resources)

- **U1: `skills/learn-issues/SKILL.md`** (new file). Frontmatter `name: learn-issues`, description stating operator-invoked only. Sections covering: registered-root resolution via `akrogon config` with `repo: none` stop; evidence step (history file read, mechanism trace against code and `checks`/`merge_checks`) before sorting; the three outcomes with their tests and actions (D2); sorted list shown grouped before removal; applied-removal form (X2); seed-line form (X4); scope limits (D3). Style: short plain sections like chart-issues/seed-issue.
- **U2: `skills/chart-issues/SKILL.md`**. One phrase removal per D4.
- **U3: docs.** `learnings/LESSONS.md` header line 5 (D5), `docs/reference-index.md` count (D6), `README.md` row, `docs/guide/cheat.md` row + sentence, `docs/guide/learn.md` sentence, `skills/AREA.md` Key files bullet.

Wave 1 is the whole plan: no unit depends on another's output; docs name the skill by its locked path before the file exists, and links resolve once the wave lands.

### A-side after waves (not a worker unit)

Dry walk per D8 recorded in `implementation/report.md`, then criterion proofs and `checks`.

## Affected docs

`docs/reference-index.md` (count), `README.md` (skill table row), `docs/guide/cheat.md` (row + sentence), `docs/guide/learn.md` (prune sentence), `skills/AREA.md` (Key files). Agent-facing skill files: `skills/learn-issues/SKILL.md` new, `skills/chart-issues/SKILL.md` one phrase. No other agent or human doc is affected.

## Verification per done-criterion

| # | Proof | Catches | Size | Rerun trigger |
|---|-------|---------|------|---------------|
| 1 | `grep -n 'name: learn-issues' skills/learn-issues/SKILL.md` plus `grep -n 'repo: none\|akrogon config\|seed-issue\|already guarded\|checkable\|stays' skills/learn-issues/SKILL.md` and a read confirming the three outcome tests, evidence step, scope limits and no-pull/no-chart statements | missing skill file, missing required statement | seconds | file edited |
| 2 | `grep -n 'lesson prune' skills/chart-issues/SKILL.md` returns nothing; `grep -n 'learnings/LESSONS.md' skills/chart-issues/SKILL.md` still matches the open paragraph | prune offer kept, or resource read dropped | seconds | file edited |
| 3 | `git diff learnings/LESSONS.md` shows header line 5 only; `grep -n 'learn-issues' learnings/LESSONS.md` matches the header | lesson lines touched or header not updated | seconds | file edited |
| 4 | `grep -n 'ten agent workflows' docs/reference-index.md`; `grep -n 'learn-issues' README.md docs/guide/cheat.md docs/guide/learn.md skills/AREA.md` each matching its required form; `ls -d skills/*/` count = 10 | stale count, missing row/row form, missing AREA entry | seconds | any doc edited |
| 5 | Read `implementation/report.md`: every active line classified; :10 cites `src/phase.ts` guard lines with invocation traced to the `phase` command path; :17 classified checkable with `src/config.ts:9` or reachable-case evidence; guard coverage traced before any already-guarded verdict | unrecorded or skipped dry walk, already-guarded verdict without coverage trace | minutes (the walk itself) | report written |
| 6 | `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, and `test_changed` via `AKROGON_BASE=76ec78494a77dca27a7b25a2128cf1d3bcda1045 bun test --changed="$AKROGON_BASE" --timeout=30000`; README link proven inside `tests/docs-links.test.ts` | broken link, formatting/type regressions | minutes | any file edited |

No restart boundaries: no slow or live runs. No `merge_checks` configured and the brief names none.

## Open limitations

The dry walk's checkable classifications produce printed `/seed-issue` lines only in the report trace; nothing is filed, per the skill's no-filing rule. LESSONS.md:10's "ahead of base" half is guarded by `requireNonEmpty` (src/phase.ts:311) only on the check.review transition; coverage for the remaining reachable paths is exactly what the dry walk's invocation trace must record before classifying.
