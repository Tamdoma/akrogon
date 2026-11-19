# Brief 1: seed-issue operator decision rules (U1)

## 1. Goal

Rule text in `skills/seed-issue/SKILL.md` so seed-issue writes an operator decision section from the person's own words, may write requested background sections, and can add or replace the decision on an open report. Plan decisions D1, D3, D4, D5 (leaf `plan.md`). Only rule text: no code, no new file.

## 2. Numbered acceptance criteria

1. The heading start `## Operator decision (` appears in `skills/seed-issue/SKILL.md` (body template line `## Operator decision (<name>, <date>)` and the Report exception). Every mention of a heading "operator decision (" in this file is exactly `## Operator decision (` (same case, two hashes, one space). The planned test `tests/chart-shapes.test.ts` "seed-issue and chart-issues share the operator decision heading start" checks this file and chart-issues; it goes green only after U2 also lands, so you are not expected to see it green.
2. A reviewer reading the file against three cases gets:
   - (a) Request "seed this; record the fix we agreed as my decision" after a fix settled in the session, `git config user.name` = `Dana Lee`, today 2026-11-20: body `Origin repo:` line, blank, `Unverified intake.`, blank, `## Operator decision (Dana Lee, 2026-11-20)` with the decided points, then the six sections; no confirmation step, no display of the section; the final `Last operation:` line names the URL and says in one clause that an operator decision section was written, without its text.
   - (b) "I think we should do X": no decision section, six sections only, no fix text.
   - (c) "add my decision to Example/widgets#12: …" on an open report: read the body with `gh issue view 12 -R Example/widgets --json body`, insert after `Unverified intake.` (top of body when that line is absent), change nothing else, write with `gh issue edit 12 -R Example/widgets --body-file -`, read back and confirm the text outside the section unchanged and the section equal to what was written, ignoring trailing whitespace; mismatch = failure printed with the URL.
3. The ban "adding no recommended fixes or planning metadata" still holds for every other report; `## Lifecycle filing` callers, lesson-triggered reports and passes with no person's request write neither section.
4. `bun test tests/docs-links.test.ts` stays green (seed-issue links never leave `skills/seed-issue/`).

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/design.md` § "Seed writer" (binding decisions 1–4, verbatim) and § "Marker" decision 1.
- `/home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/plan.md` D1, D3, D4, D5 and C2.
- `skills/seed-issue/SKILL.md` whole (103 lines): `## Report` paragraph with "adding no recommended fixes or planning metadata", the body template, the lookups paragraph ("Before authoring, also run two read-only lookups"), `## Submit and finish`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- Pattern: the file's existing style is long single-paragraph rules with exact commands in backticks; match it.

## 4. Change list and needed interfaces

Owned path: `skills/seed-issue/SKILL.md` only. Prerequisites: the test commit `c07722ff` (landed). Shared test resource: none. Worktree created at commit `c07722ff`: `/home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u1`.

Binding facts to write (seed-writer decisions, verbatim intent):

- **Exception sentence (D3), beside "adding no recommended fixes or planning metadata" in `## Report`:** one sentence covering both sections. Decision section: written when the person's own words in the request to seed, or to add to a filed report, state a settled decision; the agent infers the decided points from those words, including words pointing at a fix settled earlier in the same session ("record the fix we agreed"), and writes them with no confirmation step and no display of the section; unclear words ("I think we should do X") write no section; it holds only what the person's words decided, never the agent's own advice; the heading names that person (`git config user.name`) and the day (`YYYY-MM-DD`), never an agent or model; it never holds a grant, live or paid approval, secret or handoff authorization; colleagues write under their own name. Background: sections the person's words ask for, before or after a decision, each headed with wording to the effect "proposed, not decided" plus author and date (not a fixed literal), lock nothing, hold no research tier of their own (each claim takes the tier of the source that confirms it), and lose to the decision where they differ. `## Lifecycle filing` callers, lesson-triggered reports and sessions with no person's request write neither. Fitting the exception may take two or three sentences if one becomes unreadable; keep it in that paragraph.
- **Template (D4):** inside the fenced template, after `Unverified intake.` and before `## Observation`, an optional block `## Operator decision (<name>, <date>)` with a placeholder line saying it is present only under the Report exception, the lock is the text up to the next `## ` heading, sub-headings use `### `, and `Not in scope:` / `Done when:` lines are optional. After the `## Suspected cause` block, an optional background section placeholder (heading wording to the effect "proposed, not decided", author and date; present only when the person's words ask). Keep the six required sections unchanged.
- **Edit route (D5):** in the lookups paragraph, where a covering report means "the pass posts nothing and the final outcome prints that report's URL", add: when the request states a decision (or background) and the covering report is open, the pass adds it to that report by the edit route instead; a closed report is never edited. In `## Submit and finish`, add the edit route: target = the open report the person names, else the covering report the lookups found; read the body (`gh issue view <n> -R <repo> --json body`), put the section after `Unverified intake.` (top of body when absent), replace an existing decision section with the new one and new date (one section per report), change nothing else, write with `gh issue edit <n> -R <repo> --body-file -` using a quoted heredoc as the create command does, read back with `gh issue view` and confirm outside text unchanged and the section equal, ignoring trailing whitespace; a mismatch is a failure printed with the URL. Comments, labels, state and closed reports are untouched. Stated limit: a body edit by someone else between read and write is not detected (GraphQL `lastEditedAt` is the body-edit time). The `Create one report without … labels …` line stays true for creation.
- **Final lines:** `Last operation:` gains one clause, e.g. "…; operator decision section written" (and "background section written"), never the section text; the edit route's outcome is the edited report's URL.

## 5. Do-not, reasons and exceptions

- Do not edit any file but `skills/seed-issue/SKILL.md`: other units own chart-issues and docs. Exception: none.
- Do not add a link outside `skills/seed-issue/` (docs-links test confines skill links to their own folder); refer to chart-issues by name only.
- Do not write the heading start in any variant spelling, even in prose: the agreement test fails on any case-insensitive `## operator decision (` that is not exactly `## Operator decision (`.
- Do not write or edit any test; a planned test that looks wrong returns a mismatch to A.
- Do not run `gh` or any GitHub call: the leaf has no grant.
- Never run any `git stash` subcommand: every worktree shares one stash. To set work aside, commit a WIP commit and, before returning, `git reset --soft c07722ff` and make the unit's single returned commit.
- Return a mismatch with evidence instead of changing scope; exception: a revised brief from A.

Reasons and exceptions restated: one owned file keeps units disjoint; the folder link rule is a running test; the exact literal is the agreement test; tests are A's; no grant covers GitHub; the shared stash can lift a sibling's edit; scope changes go through A.

## 6. Ordered steps

1. Read the design § Seed writer and the whole skill file (criteria 1–3).
2. Edit `## Report` exception sentence (criteria 2, 3).
3. Edit the template (criterion 1).
4. Edit the lookups paragraph and `## Submit and finish` for the edit route and final-lines clause (criterion 2c, 2a).
5. Re-read the whole file against cases (a), (b), (c) and fix any sentence that reads false or contradicts another.
6. Run the commands below; commit once.

Advisory size: 1 file, under 12 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u1 && bun install --frozen-lockfile --backend=copyfile`
- `akrogon run-check --name u1-docs-links -- bun test tests/docs-links.test.ts`
- `akrogon run-check --name u1-marker -- bun test tests/chart-shapes.test.ts -t "operator decision heading"` (expected red only on the chart-issues file: report which file it names)

## 8. Done-when, evidence and report

Done when criteria 1–4 hold, one commit `skills: seed-issue writes operator decision sections from the person's words` exists in the worktree (no co-author line, no trailer needed), and the report below is filled with the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
