# Brief: test-rules unit 3

## 1. Goal

Update the reviewer skill: judge against brief done-criteria, block on outcomes not named tests, judge each changed expectation against its cited source, add the test-worth rules, and add the wrong-base-test route. Plan decisions D1, D2, D3, D4, D5, D6.

## 2. Numbered acceptance criteria

1. `skills/check-issue/SKILL.md` :39 area ("As B, ... judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, ..."): the judging inputs explicitly include the brief's done-criteria. Applies to both review seats' judgment, not only B.
2. Test blocking (~:51, "Compare tests with acceptance criteria: ...") gains: 5a - default to the smallest test at the real boundary (CLI, HTTP, browser, DB), unit or property tests only for logic that matters where they catch bugs more cheaply, E2E only where smaller tests miss browser, runtime or wiring bugs; 6a - delete a false or outdated expectation with its reason, a duplicate only after naming the test that still catches the same bug, batches judged as batches, keep tests guarding real past regressions; 7a - bug fixes show fail-before/pass-after, new behavior shows one deliberate break turning its test red, no mutation score. Also state that the seat judges each changed existing assertion, fixture or recorded output against the brief outcome or real source it cites ("An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source that the old expectation contradicts. A new test needs no cited source."), and a change or deletion without a real cited source is a defect.
3. Always-block (~:55, "Failed `checks` commands always block and scenarios a done-criterion names always block ..."): a scenario a criterion names blocks as an outcome the criterion names, never as a named test; a criterion names a result, not a test file.
4. Base-run paragraph (~:59, "During check.review, a red test or check ..."): after the "Red on base requires both runs completed ... failing test names need not match." sentence add the 8a case for review: a test red on base whose expectation is itself wrong - it contradicts a brief outcome or real source under rule 2 - is recorded as a Fix whose realistic source is the brief outcome or real source the test contradicts, and B fixes it first in check.repair; no seat commits during check.review because both seats review the same head blind. A test red on base because code is really broken keeps the existing `failed --reason "<command> red on base <sha>"` stop; all base-run mechanics stay unchanged.
5. check.repair (~:75, "Each behavior Fix gets its own commits ..."): B changes or deletes an existing assertion, fixture or recorded output only with a cited brief outcome or real source that the old expectation contradicts (same canonical sentence); a new test needs no cited source.

## 3. Read-first list

- `skills/check-issue/SKILL.md` (whole file; targets :37 blind review, :39, :49 Fix bar, :51, :55, :59, :75)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

File you own (edit no other):
- `skills/check-issue/SKILL.md`

Prose edits in the file's existing dense-paragraph voice. "Real source" is already defined at :49 (a real build, a real user action or content, a real integration, or untrusted input an attacker can send); reference that bar rather than redefining it. No code, no tests, no new files.

## 5. Do-not, reasons and exceptions

- Do not edit any other file; parallel workers own the rest. Exception: none.
- Do not change the blind-review rule (:37), the base-run mechanics, or the `failed` stop for a really-broken base; the leaf adds one case and one Fix route. Exception: none.
- Do not add or describe a `Test-Change:` trailer, `akrogon phase` git check, or a rule that B lists trailers; sibling leaf `test-change-check` owns those and adds its own sentence. Exception: none.
- Do not soften the missing-test block triggers or the handcrafted-reproduction Nit rule; additions sit alongside. Exception: none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Reasons restated: parallel workers own other files; blind review and the really-broken stop are locked design; trailers are the sibling leaf's; softening triggers would reopen locked scope.

## 6. Ordered steps

1. Read the file; edit :39 area (criterion 1).
2. Edit :51 test blocking (criterion 2).
3. Edit :55 (criterion 3).
4. Edit :59 base-run paragraph (criterion 4).
5. Edit :75 check.repair (criterion 5).
6. Run the changed-test command in section 7 and paste its result.

Advisory size: 1 file, under 10 turns.

## 7. Commands

Changed-test command (run in your worktree, a detached checkout of the leaf head):

`AKROGON_BASE=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 bun test --changed="$AKROGON_BASE" --timeout=30000`

An empty test selection for a prose-only diff is a pass, not a failure.

## 8. Done-when, evidence and report

File edited per criteria 1-5, changed-test command run with result pasted, one commit containing only your file, commit message e.g. `docs(check-issue): outcome blocking, cited-source judging and wrong-base-test route`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
