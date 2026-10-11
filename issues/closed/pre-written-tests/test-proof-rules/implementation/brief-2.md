# Worker brief 2: implement-issue test-authorship rules

You are worker 2 of leaf `test-proof-rules`. You edit rule text (markdown) only, in your detached worktree:

`/home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u2`

## 1. Goal

Rewrite implement-issue so workers, implement A and check.fix A write and edit no test outside two cited exceptions, inline mode stays under the same phase guard, and direct/standalone modes get the order-only rule. Implements plan decisions D4, D5 (two files), D7 (check.fix half), D8 (implement half), D10.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md`, `brief-template.md`, `worker-protocol.md` all say workers write and edit no test; implement A and check.fix A write and edit no test outside the two exceptions.
2. Sub-briefs give workers the planned tests and the command to run them instead of tests to write: `brief-template.md` section 2 tells a delegated leaf the planned tests and their command come from `plan.md` (they live in the leaf diff and run under section 7's changed-test command); section 6 (:31) drops "tests derived before code". Standalone keeps a tests-first order rule (criterion 6).
3. A worker who finds a planned test wrong returns a mismatch and waits — `worker-protocol.md` (:15 mismatch rule and/or :25-27 failure-ownership paragraph) says a red or wrong planned test is never edited by a worker.
4. Only A corrects one wrong expectation: in `implement-issue/SKILL.md`, A may correct one wrong expectation in a planned test in its own commit with a `Test-Change` trailer citing the brief line or real output; a wrong criterion ends the pass `failed --reason` naming the decision (the existing locked-decision stop already present — point at it, do not restate a new mechanism).
5. Test count rule stated in `implement-issue/SKILL.md` and `brief-template.md`: a test exists only as the proof of a done-criterion or as the red-first reproduction of a proven bug; extra edge/negative cases are not added after planning on a named consequence alone.
6. Modes: delegated and inline (leaf) modes follow criteria 1-5 with A the only seat in inline under the same phase guard; standalone and direct modes state only the order — tests from the brief first, committed, then code — since they have no state or guard.
7. `implement-issue/SKILL.md` :57 ("Write the smallest test set proving every done-criterion before code...") is replaced: implementation runs the planned tests instead of writing them; the smallest-boundary / delete-false-expectation / fail-before-pass-after / deliberate-break guidance stays but applies to the planner and to bug reproduction, not to workers.
8. check.fix reproduction rule: the paragraph at :76 is rewritten — for a proven bug, the fixing seat writes one reproduction test shown red on the head before the fix, with a `Test-Change` trailer citing the review finding's realistic source; this is the only test a repair seat writes; the "a new test needs no cited source" sentence there is replaced.
9. Machinery stop: the red-criterion exit (:36) gains that a proof that cannot run because its machinery or environment is unsuitable ends the pass `failed --reason "<criterion> red: <cause>"`, required not optional, and the seat never writes or extends proof machinery to reach evidence.
10. `brief-template.md` :45 worker-trailer sentence removed or narrowed to A's commits — workers write no tests so they produce no `Test-Change` trailer; the trailer paragraph `implement-issue/SKILL.md` :64 stays (may say tests are locked after planning and point at the trailer rule without restating guard mechanics).

## 3. Read-first list

- `plan.md`, `design.md`, `brief.md` in `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/test-proof-rules/` (read-only)
- Your worktree copies of the three owned files (full reads)
- `src/test-files.ts` — the trailer path rule the text references
- `skills/plan-issue/SKILL.md` plan.synthesis — for consistent terminology, but do not edit it (worker 1 owns it)

## 4. Change list

- `skills/implement-issue/SKILL.md`: :36 machinery clause; :55-57 rewrite (delegated/inline run planned tests; count rule; Q2 correction; wrong-criterion stop); :64 kept; :76 check.fix reproduction rule; :84 area "Do required work for Fixes only" paragraph — keep trailer requirement, reproduction is its own prior commit; :88 Standalone + :94-96 Direct gain the order rule.
- `skills/implement-issue/brief-template.md`: :13 rewrite per criterion 2 and 5; :31 per criterion 2; :45 per criterion 10.
- `skills/implement-issue/worker-protocol.md`: :15/:25-27 per criterion 3; wherever it describes the worker's changed-test duty, note the planned tests are A's, run not written.

## 5. Do-not, reasons and exceptions

- Do not edit `plan-issue`, `check-issue`, `merge-issue`, `chart-issues` files or `docs/` — other workers own them.
- Do not restate freeze-guard mechanics (tests_head, frozen-path records) — frozen-test-guard owns them; say "locked after planning" and point to the trailer rule instead.
- Do not change the reuse/rerun rules (:63, :84's proof/replay sentences) or the base-run rule (:38).
- Do not write or edit any test file.
- Exception to every exclusion: a revised brief from A. Conflicts return a mismatch.

## 6. Ordered steps

1. Read leaf plan/design/brief and your three files fully.
2. Edit `implement-issue/SKILL.md` sections in file order.
3. Edit `brief-template.md`, then `worker-protocol.md`.
4. Run the commands in section 7.
5. Commit your owned files only.

## 7. Commands

- `cd /home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u2 && bun install --frozen-lockfile`
- `AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e bun test --changed="$AKROGON_BASE" --timeout=30000`

Prose-only diff; expect no test files changed. Do not write or edit any test.

## 8. Done-when, evidence and report

All ten criteria hold in the diff; commands run with results pasted; commit ID returned. Report changed files and reasons, commands with results, commit ID, limitations, unverified items. Conflicts return a mismatch naming the conflicting requirement and the smallest brief correction.
