# Eight-section implementation brief

Read when B writes or revises the task brief; replace the guidance below with the concrete task, keeping the brief below 1,500 words and 20 rules by judgment, not machinery.

One verifiable unit uses `implementation/brief.md`; a delegated leaf with several units keeps that overall brief and writes `implementation/brief-1.md`, `brief-2.md`, etc., each with these same eight sections and only its own scope.

## 1. Goal

The outcome and plan decision IDs; standalone assigns its brief's own decision IDs.

## 2. Numbered acceptance criteria

Observable outcomes written before code; each nontrivial criterion has a meaningful verification, a bug has fail-first evidence, and trivial one-liners need no test.

## 3. Read-first list

Concrete paths from the plan, one existing pattern to copy, and this skill folder's `ponytail.md`; workers open the index only for a gap in this list.

## 4. Change list and needed interfaces

Files and changes, the signatures and data shapes this worker needs, and relevant output from a preceding worker, rather than every interface in the project.

## 5. Do-not, reasons and exceptions

Task-specific exclusions with why each matters and its actual exception, including: return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

End this section by restating the reasons and exceptions so they remain attached to the exclusions.

## 6. Ordered steps

Each step names its file and acceptance criterion, with tests derived before code and red/green evidence where relevant.

Advisory size: about N files and under M turns, with M at least four turns per file because each file costs a read, an edit and a test run; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

The resolved `test_changed` command only, including the supplied `AKROGON_BASE` value for a configured leaf; B runs the full suite separately.

If the checkout has no changed-test runner, name the actual targeted check derived from its tools rather than substituting the full suite or inventing a command.

## 8. Done-when, evidence and report

Acceptance outcomes and pasted command results, with a path to any required end-to-end artifact; limitations and unverified criteria remain explicit.

For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

For a user-visible flow, include a real invocation or request with evidence; browser flows use headless Playwright Chromium with trace on and video off, recorded as a consumer dev dependency when first needed.

End the concrete brief with these four fill-in lines, accepting equivalent wording by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
