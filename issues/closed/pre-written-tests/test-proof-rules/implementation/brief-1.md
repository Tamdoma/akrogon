# Worker brief 1: plan.synthesis test-authoring rule + charting machinery rules

You are worker 1 of leaf `test-proof-rules`. You edit rule text (markdown) only, in your detached worktree:

`/home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u1`

## 1. Goal

Rewrite akrogon's planning and charting rules so seat A writes a leaf's criterion tests during `plan.synthesis`, and no product leaf builds or is permitted to need new proof machinery. Implements plan decisions D1, D2, D3, D8 (charting half), D9 in `plan.md` (leaf folder, readable in the registered checkout; brief/design there are the contract).

## 2. Numbered acceptance criteria

1. `skills/plan-issue/SKILL.md` `plan.synthesis` section, after `plan.md` is written and before the `Finish with ... implement` line: A writes a test for each done-criterion no existing test or `checks` command already proves, from the brief and plan only, at the smallest real boundary; one test may prove several criteria; a case may extend an existing test file; A runs the leaf's `checks` commands so every remaining failure is a planned test's intended red; each new test is shown red for the missing or intentionally broken behavior with that output recorded in `plan.md` beside its criterion; the tests are committed on the leaf branch with no product code; a commit adding a case to an existing test file carries the existing `Test-Change` trailer. `plan.md` names the test and the command for each criterion.
2. Same file: each criterion's proof command must use a runner or script that exists at `AKROGON_BASE`, or be one direct invocation of the product; the test files and inputs it runs may be new in the planner's commit. A criterion needing new proof machinery ends `plan.synthesis` with `akrogon phase <slug> failed --reason` naming the criterion and the missing machinery, instead of finishing with `implement`.
3. `skills/chart-issues/assets/standing-design.md`: line :8 is rewritten into the count rule — a test exists only as the proof of a done-criterion or as the red-first reproduction of a proven bug; a consequential edge case is a done-criterion written at charting. A machinery definition by function is stated once here: machinery is code whose job is to run proof rather than be the product (a runner, dispatcher, session or port pool, or a fixture factory that orchestrates cases); the repo's existing test runner, fixture and cleanup helpers, and temporary repo or directory setup inside a test are not machinery. The prohibition covers machinery built to prove the leaf's own product; a prerequisite leaf whose delivered product is that machinery is allowed, proven by one known-good case passing and one deliberate break failing. Keep :9 Playwright dev-dependency, :14 authentic-recording replay, :12-13 delete/red-before rules; in :15 keep in-branch fixes, rerun-affected-stages and the shared-resource stop, and remove any reading letting a leaf build or grow a runner to reach evidence.
4. `skills/chart-issues/assets/shapes.md` audit (:286): refuses a product leaf whose done-criterion depends on machinery that does not exist on the destination's default branch, unless a prerequisite leaf in the same handoff delivers it and the product leaf lists that leaf in `blocked-by` (the rig must exist at the product leaf's `AKROGON_BASE`); missing machinery that can be proven alone is proposed as that prerequisite leaf with the known-good/deliberate-break done-criterion; otherwise the door narrows the criterion with the operator at handoff review. Keep :276 untouched — it belongs to sibling leaf frozen-test-guard.
5. `skills/chart-issues/SKILL.md` handoff review paragraph (:69): the door's live-run line also names the existing machinery each live criterion uses.
6. No restatement of freeze-guard mechanics (tests_head, frozen sets, trailer checking internals); text may say tests are locked after planning and point to the trailer rule.

## 3. Read-first list

- `plan.md`, `design.md`, `brief.md` in the leaf folder `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/test-proof-rules/` (read-only; never edit `issues/`)
- Your worktree copies of the four owned files
- `src/next.ts` around :1319 (blocked-by release on completion) — context for criterion 4's `blocked-by` requirement
- `tests/phase.test.ts:13-23` — the allowed existing-fixture pattern
- Copy existing paragraph style: long flowing rule sentences, precise cited paths, no bullet spam where prose exists

## 4. Change list

- `skills/plan-issue/SKILL.md`: insert the tests step in `## plan.synthesis` between the proof-table paragraph (:61 area) and the "Finish with" line; adjust the stale clause "before implementation derives tests" (:65) since implementation no longer derives tests; state the runner-at-`AKROGON_BASE`/direct-invocation rule and the failed stop.
- `skills/chart-issues/assets/standing-design.md`: rewrite :8 (count rule); add the machinery definition once; touch :9/:10 only as needed to carry the definition and prerequisite rule; keep :12-15 with the narrow edits above.
- `skills/chart-issues/assets/shapes.md`: extend the audit paragraph :286 with the machinery refusal, blocked-by requirement, prerequisite-leaf proposal and narrow-at-review alternative.
- `skills/chart-issues/SKILL.md`: in the handoff-review paragraph (:69) add that the live-run line names the existing machinery each live criterion uses.

## 5. Do-not, reasons and exceptions

- Do not edit `plan.positions`/`plan.rebuttal` sections to add test writing — tests belong to synthesis only (design).
- Do not restate guard mechanics or the trailer schema internals — frozen-test-guard owns those (exclusion).
- Do not edit `src/`, `tests/`, `docs/` or files outside your owned list — other workers own them.
- Do not add `merge_checks` or whole-suite requirements.
- Exception to every exclusion: a revised brief from A authorizing it. Anything conflicting returns a mismatch, not an improvised fix.

## 6. Ordered steps

1. Read the leaf plan/design/brief and your four files fully.
2. Edit `skills/plan-issue/SKILL.md` (criteria 1, 2).
3. Edit `standing-design.md` (criterion 3), then `shapes.md` (criterion 4), then `chart-issues/SKILL.md` (criterion 5).
4. Run the commands in section 7.
5. Commit your owned files only, message describing the rule change.

## 7. Commands

- `cd /home/ivan/Work/infra/akrogon/issues/worktrees/test-proof-rules-u1 && bun install --frozen-lockfile` (install first)
- `AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e bun test --changed="$AKROGON_BASE" --timeout=30000`

This is a prose-only diff; the changed-test run is expected to run no or few tests. Do not write or edit any test file.

## 8. Done-when, evidence and report

All six criteria hold in the diff; commands run and results pasted; commit ID returned. Report: changed files and reasons, commands run with results, commit ID, known limitations, unverified items. If any requirement conflicts with the live text, return a mismatch naming the conflict and the smallest brief correction.
