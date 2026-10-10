# Sub-brief U1: shared lesson rule + skill write sites

## 1. Goal

Create `skills/lesson-rule.md` with the three lesson-writing rules, point five SKILL.md write sites at it, add it to `skills/AREA.md` Key files, and add a link-presence test to `tests/docs-links.test.ts`. Plan decisions D1–D4, D9.

## 2. Numbered acceptance criteria

1. `skills/lesson-rule.md` exists and contains exactly the three rules below (Match, Seed, Home), stated once.
2. Each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md` replaces its lesson-writing clause with a sentence containing a markdown link `lesson-rule.md`, and states no match/seed/home mechanics itself.
3. `skills/AREA.md` lists `skills/lesson-rule.md` under `## Key files`; the file stays under 40 lines with only the four existing second-level sections.
4. `tests/docs-links.test.ts` gains a test asserting each of the four SKILL.md paths in criterion 2 contains `lesson-rule.md`.
5. `bun test tests/docs-links.test.ts` passes; `bun test --changed` run passes.

## 3. Read-first list

- `skills/implement-issue/ponytail.md`
- `skills/lesson-rule.md` target directory: `skills/`
- `skills/seed-issue/SKILL.md` — the owner rule (Destination section) and covering-report outcome (Submit section); the rule references it, do not copy it.
- `skills/learn-issues/SKILL.md` — the Checkable definition under `## Sort`; referenced, never copied.
- `learnings/LESSONS.md` — the line format being preserved.
- `tests/docs-links.test.ts` — the test file to extend.

## 4. Change list and needed interfaces

- New `skills/lesson-rule.md`, sibling of `skills/AREA.md`. Three clauses:
  - **Match**: before adding a line, check the active list for a lesson with the same failure cause and scope; shared keywords are not a match, and an unsure match gets a new line. On a match, append the new case to that lesson's history file and add no line.
  - **Seed**: a lesson whose mechanism a command could detect as a fixed pattern gets `/seed-issue` run for it unless its history already links a report; the created or returned report URL is appended to the history file. A judgment lesson files nothing. Reference the Checkable definition at `learn-issues/SKILL.md` by link; state that whether a running guard already covers the mechanism is left to charting.
  - **Home**: a lesson about akrogon's own skills or command is written into akrogon's `learnings/` (root located by seed-issue's owner rule, link `seed-issue/SKILL.md`); left for the operator to commit. When the root cannot be found, the seat says so and writes locally.
- `skills/plan-issue/SKILL.md` line 39 (`A reusable lesson found here is one line in learnings/LESSONS.md naming mechanism, date and history path, plus ...`): keep the format statement, add/replace so the writing follows the linked rule. E.g. append: `, and the write follows the [lesson rule](lesson-rule.md).`
- `skills/implement-issue/SKILL.md` line 31: the writing half (`A reusable lesson found during leaf work gets an active line ... and a history file with case, evidence and learning`) gains the link; the applying half (`applying a lesson removes its active line ...`) stays untouched.
- `skills/check-issue/SKILL.md` lines 59 and 89: in each, the phrase describing how a lesson/Nit is recorded (`as one active mechanism/date/history line plus a history file with case, evidence and learning` / equivalents) gains the link `([lesson rule](lesson-rule.md))`. Site-specific wording (registered checkout, left for the operator to commit, skipping Nits already written) stays.
- `skills/chart-issues/SKILL.md` line 31: the `Reusable findings get one mechanism/date/history-path line ...` sentence gains the link; the "historical lessons as observations" clause stays.
- `skills/AREA.md`: one Key files bullet naming `skills/lesson-rule.md` and its role.
- `tests/docs-links.test.ts`: append one test iterating the four SKILL.md paths asserting the file content includes `lesson-rule.md`.
- Commit the work on top of the worktree HEAD in one commit. The test-file edit needs the trailer `Test-Change: tests/docs-links.test.ts added write-site link assertion; no existing expectation changed`.

## 5. Do-not, reasons and exceptions

- Do not restate any rule clause inside a SKILL.md: criterion 1 fails on a restated copy. Only pointers.
- Do not edit `skills/learn-issues/SKILL.md`, `src/`, config, `docs/`: excluded by the plan; exceptions need a revised brief.
- Do not touch the "applying a lesson" half of implement-issue:31: belongs to guard-retires-lesson.
- Do not change LESSONS.md line format: locked.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: only pointer sentences in SKILL.md files; no mechanics copied; exclusions above stand unless A revises this brief.

## 6. Ordered steps

1. Write the test addition in `tests/docs-links.test.ts` first (fails before lesson-rule.md exists? No — links are textual; the test passes only once write sites carry the link; run it red before step 3 if cheap).
2. Create `skills/lesson-rule.md` with the three clauses.
3. Edit the five write sites and `skills/AREA.md`.
4. Run `bun test tests/docs-links.test.ts` green; run the changed-tests command from section 7.
5. Commit with the Test-Change trailer.

Advisory size: 7 files, under 30 turns.

## 7. Commands

`AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5 bun test --changed="$AKROGON_BASE" --timeout=30000` and `bun test tests/docs-links.test.ts`.

## 8. Done-when, evidence and report

All five criteria green with pasted test output; commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
