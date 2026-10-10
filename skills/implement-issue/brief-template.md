# Eight-section implementation brief

Read when A writes or revises a worker sub-brief or a standalone task brief; replace the guidance below with the concrete task, keeping the brief below 1,500 words and 20 rules by judgment, not machinery.

A delegated leaf writes `implementation/brief-1.md`, `brief-2.md`, etc., one per unit and one unit included, each with these eight sections and only its own scope, with the binding facts for that scope copied in rather than pointed at; the leaf has no whole-leaf brief because `plan.md` is its contract. Standalone writes one task brief with these sections.

## 1. Goal

The outcome and plan decision IDs; standalone assigns its brief's own decision IDs.

## 2. Numbered acceptance criteria

Observable outcomes written before code. A test exists only as the proof of a done-criterion or as the red-first reproduction of a proven bug; after planning no seat adds an edge or negative case on a named consequence alone. For a delegated leaf the planned tests and their run command come from `plan.md`, copied in for the tests this unit touches; those tests live in the leaf diff and run under section 7's changed-test command. A worker writes and edits no test: a planned test that is wrong or red returns a mismatch, never a test fix. Standalone has no planned tests and no guard; its only rule is order: tests from the brief first, committed, then code.

## 3. Read-first list

Concrete paths from the plan, one existing pattern to copy, and this skill folder's `ponytail.md`; workers open the index only for a gap in this list.

## 4. Change list and needed interfaces

Files and changes, the signatures and data shapes this worker needs, and relevant output from a preceding worker, rather than every interface in the project. For a delegated leaf each brief also records the chunks that must land first, the paths this unit owns, and any shared test resource or consumed output; the records carry the plan's wave values into the sub-brief, and A groups from them only when the plan has no wave grouping.

## 5. Do-not, reasons and exceptions

Task-specific exclusions with why each matters and its actual exception, including: return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

End this section by restating the reasons and exceptions so they remain attached to the exclusions.

## 6. Ordered steps

Each step names its file and acceptance criterion, with red/green evidence where relevant.

Advisory size: about N files and under M turns, with M at least four turns per file because each file costs a read, an edit and a test run; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

The resolved `test_changed` command only, including the supplied `AKROGON_BASE` value for a configured leaf; A runs criterion proof and every `checks` command separately.

If the checkout has no changed-test runner, name the actual targeted check derived from its tools rather than substituting the full suite or inventing a command.

## 8. Done-when, evidence and report

Acceptance outcomes and pasted command results; the report links each done-criterion and each real bug fix to its test or evidence, with a path to any required end-to-end artifact; limitations and unverified criteria remain explicit.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and a commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source; a recorded path changed or gone since the `plan.synthesis` to `implement` move, or an added `src/test-files.ts`-matched path outside that record, needs the same trailer in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count; delegated commits survive cherry-pick, so the trailer lands on the lane.

For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

End to end evidence with an artifact is required only when browser or runtime behavior or cross-component wiring cannot be shown by a smaller check or when a criterion asks for it; then a user-visible flow uses a real invocation or request with evidence, and browser flows use headless Playwright Chromium with trace on and video off, recorded as a consumer dev dependency when first needed.

End the concrete brief with these four fill-in lines, accepting equivalent wording by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
