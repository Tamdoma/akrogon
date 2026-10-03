# Brief: test-rules unit 1

## 1. Goal

Rewrite the done-criteria rule in the door template/audit to outcomes-only, and land test-worth rules 5a/6a/7a in the standing design. Plan decisions D1, D3, D4, D5.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/assets/shapes.md` Done-criteria template (currently ~:134) states that a criterion is an observable result, never a test file, an assertion or a test count, and no longer presents "a test this leaf adds" as the recipe; a blocking `checks` command remains an allowed proof form, and the `merge_checks` and repo-health-outside-ownership exclusions remain.
2. `skills/chart-issues/assets/shapes.md` implementer audit (currently ~:252, the "Read the briefs as an implementer" paragraph) states the same outcome-only rule and refuses a criterion that names a test file, assertion or count; its existing `merge_checks` refusal and the repo-wide `checks` allowance sentence remain.
3. `skills/chart-issues/assets/standing-design.md` lines 7-10 area: the test bullets gain, without restating line 9's artifact rule and without changing lines 8 or 13:
   - 5a: default to the smallest test at the real boundary (CLI, HTTP, browser, DB); unit or property tests only for logic that matters, where they catch bugs more cheaply; E2E only where smaller tests miss browser, runtime or wiring bugs.
   - 6a: delete a false or outdated expectation with its reason; delete a duplicate only after naming the test that still catches the same bug; judge a batch of deletions as a batch; keep every test that guards a real past regression.
   - 7a: a bug fix shows its test failing before and passing after; new behavior shows one deliberate break turning its test red; no mutation score.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` (whole file for voice; the two targets are the brief-template Done-criteria fenced block at ~:134 and the audit paragraph at ~:252)
- `skills/chart-issues/assets/standing-design.md` (whole file; targets are lines 7-10, next to "No vanity tests" and the "cheapest sufficient test" line)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files you own (edit no others):
- `skills/chart-issues/assets/shapes.md`
- `skills/chart-issues/assets/standing-design.md`

Prose edits only, matching each file's existing voice: shapes.md keeps its fenced-template style; standing-design.md keeps its `- ` bullet list under `### Standing design lines`. No code, no tests, no new files.

Suggested wording (adapt to voice, keep meaning): a done-criterion states "an observable result in the leaf's ownership, never a test file, assertion or test count"; the audit "refuses a criterion that names a test file, an assertion or a test count, and keeps refusing a `merge_checks` command or a repo-health claim outside leaf ownership". In standing-design.md the new bullet(s) sit adjacent to the "No vanity tests" / "cheapest sufficient test" lines; the boundary order, deletion rule and break proof can be one bullet or three short ones.

## 5. Do-not, reasons and exceptions

- Do not edit any other file; the leaf splits files across parallel workers and edits outside your list collide with them. Exception: none.
- Do not change standing-design.md line 8 (criterion/consequence-driven negatives), line 9 (E2E artifact rule) or line 13 (writer/checker shared rule). The leaf states those rules elsewhere or they already match. Exception: none.
- Do not add or describe a `Test-Change:` trailer, a `akrogon phase` git check, or trailer mechanics; sibling leaf `test-change-check` owns those and appends its own sentence elsewhere. Exception: none.
- Do not restate line 9's Playwright/artifact rule; duplication across docs is the failure this leaf avoids. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

The reasons restated: other workers own the other files; unchanged standing-design lines are already correct or covered elsewhere; trailer mechanics are the sibling leaf's; restated rules drift.

## 6. Ordered steps

1. Read `shapes.md` fully; rewrite the Done-criteria template placeholder (~:134) to outcomes-only per criterion 1.
2. Rewrite the audit sentence (~:252) per criterion 2, keeping every refusal it already has.
3. Read `standing-design.md`; add the 5a/6a/7a wording next to lines 7-10 per criterion 3.
4. Run the changed-test command in section 7 and paste its result.

Advisory size: 2 files, under 10 turns.

## 7. Commands

Changed-test command (run in your worktree, which is a detached checkout of the leaf head):

`AKROGON_BASE=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 bun test --changed="$AKROGON_BASE" --timeout=30000`

Bun may find no affected test files for a prose-only diff; an empty selection is a pass, not a failure.

## 8. Done-when, evidence and report

Both files edited per criteria 1-3, changed-test command run with result pasted, one commit containing only your two files, commit message summarizing the rule rewrite (e.g. `docs(chart-issues): outcome-only done-criteria and test-worth rules`).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
