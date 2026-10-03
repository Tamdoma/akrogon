# Brief: test-rules unit 2

## 1. Goal

Add the cited-source rule, the test-worth rules and the wrong-test-on-base case to the implementer skill, its worker template and the merge skill. Plan decisions D2, D3, D4, D5, D6.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` test-set paragraph (currently :57, "Write the smallest test set...") gains: (a) this sentence verbatim - "An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source that the old expectation contradicts. A new test needs no cited source."; (b) 5a - default to the smallest test at the real boundary (CLI, HTTP, browser, DB), unit or property tests only for logic that matters where they catch bugs more cheaply, E2E only where smaller tests miss browser, runtime or wiring bugs; (c) 6a - delete a false or outdated expectation with its reason, a duplicate only after naming the test that still catches the same bug, batches judged as batches, keep tests guarding real past regressions; (d) 7a - bug fixes show fail-before/pass-after, new behavior shows one deliberate break turning its test red, no mutation score.
2. `skills/implement-issue/brief-template.md` section 2 (currently :13, "Observable outcomes written before code; write the smallest test set...") gains the same four additions (a)-(d); it is the worker copy of the same rule. `:47` (E2E artifact rule) stays unchanged.
3. `skills/implement-issue/SKILL.md` check.fix (currently :75 area) states that a repair changes or deletes an existing assertion, fixture or recorded output only under the same canonical sentence (a).
4. `skills/implement-issue/SKILL.md` base-run paragraph (currently :38, "During implement end and check.fix, a red test or check...") gains one case after "Red on base requires both runs completed ... failing test names need not match.": when the red-on-base test's expectation is itself wrong - it contradicts a brief outcome or real source under rule (a) - the seat fixes that one expectation in its own commit with the reason and continues; the fix may touch a test outside the plan's owned paths, and A commits it in the lane, never a worker, in delegated and inline mode alike. The existing `failed --reason "<command> red on base <sha>"` stop for a really-broken base stays unchanged, as do all base-run mechanics.
5. `skills/merge-issue/SKILL.md` (currently :43-45): the merger gets the same canonical sentence (a) for changing existing expectations, and the fix-forward rule gains the 8a case: a wrong test exposed by the rebase (expectation contradicts a brief outcome or real source) is fixed in its own commit with the reason and the merge continues; a broken default branch keeps the existing fix-forward-with-tests rule.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` (whole file; targets :38, :57, :75)
- `skills/implement-issue/brief-template.md` (whole file; targets :13 and section 6's "tests derived before code" line for voice; :47 unchanged)
- `skills/merge-issue/SKILL.md` (whole file; targets :43-45)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files you own (edit no others):
- `skills/implement-issue/SKILL.md`
- `skills/implement-issue/brief-template.md`
- `skills/merge-issue/SKILL.md`

Prose edits in each file's existing voice; single-paragraph files stay single-paragraph where the edit lands inside a paragraph (the canonical sentence can be appended mid-paragraph). No code, no tests, no new files.

"Real source" may be glossed in one clause the first time it appears per file as "a real build, user action or content, integration or attacker-reachable input".

## 5. Do-not, reasons and exceptions

- Do not edit any other file; parallel workers own the rest. Exception: none.
- Do not change the base-run mechanics: worktree allocation, log capture, exit-status handling, incomplete-run stop, or the `failed --reason "<command> red on base <sha>"` outcome. The leaf adds exactly one case. Exception: none.
- Do not add or describe a `Test-Change:` trailer, a `akrogon phase` git check, or trailer mechanics; sibling leaf `test-change-check` owns those. Exception: none.
- Do not weaken the existing "write the smallest test set proving every done-criterion" sentences; the additions sit alongside, they do not replace. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A.

Reasons restated: parallel workers own other files; base-run mechanics are locked scope; trailers belong to the sibling leaf; replacing rather than adding would silently weaken the contract.

## 6. Ordered steps

1. Read `implement-issue/SKILL.md`; edit :57 (criterion 1) then :75 (criterion 3) then :38 (criterion 4), keeping paragraph structure.
2. Edit `brief-template.md` :13 (criterion 2).
3. Edit `merge-issue/SKILL.md` :43-45 (criterion 5).
4. Run the changed-test command in section 7 and paste its result.

Advisory size: 3 files, under 14 turns.

## 7. Commands

Changed-test command (run in your worktree, a detached checkout of the leaf head):

`AKROGON_BASE=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 bun test --changed="$AKROGON_BASE" --timeout=30000`

An empty test selection for a prose-only diff is a pass, not a failure.

## 8. Done-when, evidence and report

Three files edited per criteria 1-5, changed-test command run with result pasted, one commit containing only your three files, commit message e.g. `docs(skills): cited-source, test-worth and wrong-base-test rules`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
