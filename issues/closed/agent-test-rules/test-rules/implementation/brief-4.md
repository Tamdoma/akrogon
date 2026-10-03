# Brief: test-rules unit 4

## 1. Goal

Update `docs/guide/phases.md` so the operator guide describes rules 1-4 the same way the landed skill text does. Plan decision D7. This is the only file you edit; the skill files below are read-only mirrors for wording.

## 2. Numbered acceptance criteria

1. The implement section paragraph (currently :92, "Tests come from the acceptance criteria...") states that criteria are observable outcomes, never a test file, assertion or count, and that the plan picks each criterion's proof - proof is replaceable work, not contract. The existing smallest-set and missing/bad-test blocking content stays.
2. The same paragraph gains: an existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source that the old expectation contradicts; a new test needs no cited source; and the test-worth rules - smallest test at the real boundary (CLI, HTTP, browser, DB) first, unit/property tests only for logic that matters where they catch bugs more cheaply, E2E only where smaller tests miss browser/runtime/wiring bugs; a false or outdated expectation deletes with its reason, a duplicate only after naming the test that still catches the same bug, batches judged as batches, keep tests guarding real past regressions; bug fixes show fail-before/pass-after, new behavior shows one deliberate break turning its test red.
3. The implement section's evidence paragraph (currently :94, "A runs changed tests as work lands...") gains the 8a case in its base-red sentence: when the red test's expectation is itself wrong (contradicts a brief outcome or real source), A fixes that one expectation in its own commit with the reason and continues; a really-broken base still ends the pass `failed`.
4. The check section's Fix-bar paragraph (currently :102, "A blocking fix names its realistic source...") gains the same two points: a scenario a criterion names blocks as an outcome the criterion names, not as a named test; and a base-red test whose expectation is wrong becomes a Fix routed to repair rather than an automatic `failed`, while a really-broken base still stops `failed`. Add one clause that review judges each changed existing expectation against its cited source.

## 3. Read-first list

- `docs/guide/phases.md` (whole file; targets :92, :94, :102; the guide uses short operator-facing paragraphs)
- `skills/implement-issue/SKILL.md` (:38, :57 for the landed wording to mirror)
- `skills/check-issue/SKILL.md` (:55, :59 for landed wording to mirror)
- `skills/merge-issue/SKILL.md` (:45 fix-forward line, for context)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

File you own (edit no other):
- `docs/guide/phases.md`

Prose edits in the guide's existing voice: one or two added sentences per paragraph, no new headings, no lists of rule IDs (the guide does not name 5a/6a/7a/8a). "Real source" should be glossed once as a real build, user action or content, integration or attacker-reachable input. No code, no tests, no new files.

## 5. Do-not, reasons and exceptions

- Do not edit any other file; every other surface is already landed. Exception: none.
- Do not restate line-9-style Playwright/artifact detail or the full base-run mechanics (worktree allocation, log capture); the guide compresses by design and the skill text carries mechanics. Exception: none.
- Do not mention a `Test-Change:` trailer or `akrogon phase` check; sibling leaf `test-change-check` owns those in `docs/guide/merge.md` and `README.md`. Exception: none.
- Do not change sections outside the three target paragraphs; the rest of the guide is unaffected. Exception: none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Reasons restated: the other surfaces are done; the guide deliberately compresses mechanics; trailer docs belong to the sibling leaf; unrelated sections are out of scope.

## 6. Ordered steps

1. Read `phases.md` and the landed skill sections; edit :92 (criteria 1-2).
2. Edit :94 (criterion 3).
3. Edit :102 (criterion 4).
4. Run the changed-test command in section 7 and paste its result.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Changed-test command (run in your worktree, a detached checkout of the leaf head):

`AKROGON_BASE=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 bun test --changed="$AKROGON_BASE" --timeout=30000`

An empty test selection for a prose-only diff is a pass, not a failure.

## 8. Done-when, evidence and report

`phases.md` edited per criteria 1-4, changed-test command run with result pasted, one commit containing only your file, commit message e.g. `docs(guide): outcome criteria, cited-source and wrong-base-test rules`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
