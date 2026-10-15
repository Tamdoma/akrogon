# Brief U4: skill reader lines and area docs

Worktree: /home/ivan/.akrogon/worktrees/akrogon/log-reader-u4

## 1. Goal

The two skill lines this leaf owns tell seats to read recorded check/verify logs with `akrogon log <path>` (plan D6), and the AREA docs name the new module (plan docs list). This makes the "docs and skills" case of `tests/log-reader.test.ts` green.

## 2. Acceptance criteria

1. `skills/learn-issues/SKILL.md` Sort section: where the seat reads a lesson's history evidence, recorded check/verify log paths are read through `akrogon log <path>` (one added clause, existing wording intact).
2. `skills/merge-issue/SKILL.md` Shared-endings line "whose receipt lists each command with its exit and log" gains that the seat reads a listed log with `akrogon log <path>`.
3. `src/AREA.md`: `src/evidence.ts` gets one Key-files line naming `locate`/`readMember`/`readLog` and that `akrogon log` and flaky consume it; Commands gets `akrogon log <path>` on the existing command line style or a new bullet — keep the file at most 40 lines with exactly Commands, Key files, Non-obvious patterns, See also as `##` sections.
4. `tests/AREA.md`: one Key-files line for `tests/log-reader.test.ts`.
5. `bun test tests/log-reader.test.ts -t "docs and skills name akrogon log"` green; `bun test tests/docs-links.test.ts` green.

## 3. Read-first list

- `skills/learn-issues/SKILL.md` lines 16-22 (## Sort): the "read its history file" sentence
- `skills/merge-issue/SKILL.md` line 73 area (### Shared endings): the receipt sentence
- `src/AREA.md`, `tests/AREA.md`: whole files (each ~40 lines); style is dense one-line entries
- `README.md` Command table: the `akrogon log` row already landed (U2)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Edits only, four files:

- `skills/learn-issues/SKILL.md`: in `## Sort`, extend the first paragraph's "read its history file" clause — e.g. `Per active line: read its history file for the failure and its mechanism (recorded check or verify logs through ` + '`akrogon log <path>`' + `), trace that mechanism ...` — minimal, keeps meaning.
- `skills/merge-issue/SKILL.md`: extend `Every run and rerun is ` + '`akrogon verify --attempt <id>`' + `, whose receipt lists each command with its exit and log` + ` — read a listed log with ` + '`akrogon log <path>`' + `.`
- `src/AREA.md`: add to Key files: `- \`src/evidence.ts\` maps a recorded log path to its bytes (\`locate\`, \`readMember\`, \`readLog\`, \`readLogAcross\`): plain file first, then the owner's \`evidence.tar.zst\`; \`akrogon log\` and \`src/flaky.ts\` read through it.` and a Commands bullet `- \`bun src/akrogon.ts log <path>\` prints a recorded log's bytes from a plain file or the owner's evidence.tar.zst, resolving the path against the current or every registered repo.` Keep ≤40 lines and the exact `##` section set.
- `tests/AREA.md`: add Key-files line `- \`tests/log-reader.test.ts\` checks \`akrogon log\` byte output, archive members, outside-repo resolution and the skill/doc mentions.`

Exact wording is yours; the contract is the `akrogon log` mention and the section constraints.

## 5. Do-not, reasons and exceptions

- Write or edit no test file, no `src/*.ts` source, no README, no other skill file: lines check-path-print owns (implement-issue, worker-protocol, brief-template, check-issue, plan-issue, merge-issue's writer lines, chart-issues) are that leaf's lane. Exception: revised brief from A.
- Keep `src/AREA.md` ≤40 lines with exactly the four `##` sections; drop or fold lines rather than exceeding it. Exception: none.
- Do not restructure sentences beyond inserting the `akrogon log` clause: minimal diff. Exception: none.
- Restated: exclusions stand; only a revised brief from A changes them.

## 6. Ordered steps

1. Two skill-line edits (criteria 1-2).
2. Two AREA.md edits (criteria 3-4).
3. `bun test tests/log-reader.test.ts -t "docs and skills name akrogon log"` green; `bun test tests/docs-links.test.ts` green.
4. `bunx prettier --check skills src` clean (prettier covers `skills/` md? No — run `bunx prettier --check src tests` per repo check command; skills md is not in the check glob).

Advisory size: 4 small edits, ~10 turns.

## 7. Commands

- `bun test tests/log-reader.test.ts -t "docs and skills name akrogon log"`
- `bun test tests/docs-links.test.ts`

## 8. Done-when, evidence and report

Four files edited minimally, named test green, commit on the detached worktree HEAD (e.g. `docs: seats read recorded logs through akrogon log`) and return its ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
