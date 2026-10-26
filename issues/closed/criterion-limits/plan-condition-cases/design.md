# Design: plan-condition-cases

## Binding decisions, verbatim

### Planning rule (fork rule, A's pick under autopilot `1a 2a 3a`, 2026-10-26)

- 1a: before writing tests, A checks each plan decision against every condition its done-criterion states (what must stay fresh, be retried, be refused, or not happen between), tracing each value from where it is made to its last use through later calls, helpers and earlier iterations of a containing loop or batch. Each condition a decision can reachably break gets a case in the same run that fails on that violation, or the traced reason it cannot break. A count over cases where the condition holds proves nothing about it. The cases prove the existing criterion and are not new scope. Reason: covers every kind of decision with one trace, and the case selection is the missing step (B). Rejected 1b: misses reorder, batch and parallel decisions. Standing dissent: C prefers a trigger limited to decisions that reuse, cache, snapshot or omit repeated work.
- 2a: no guard label; the rule states each such case is shown red by breaking its condition, which the existing new-test rule allows. Reason: adds no concept, and requiring the case removes the ambiguity C names. Rejected 2b: a second label for the same test. Standing dissent: C wants the base-green case recorded as a boundary guard beside the red proof.
- 3a: the leaf's criteria are judged by review against `skills/plan-issue/SKILL.md`, including a walk-through of `## Case`. Rejected: a text-contains test (couples to wording), a replayed planning pass (paid, non-deterministic, needs a grant).

### Leaf review corrections (A,C), 2026-10-26

- The condition check is recorded in `plan.md` beside the criterion's observation, so review can judge a skipped condition (C F1).
- A case runs where the decision's kept state lives, the same process, invocation or step; two separate processes do not exercise a per-process memo (C F2).
- The walk-through cases name the same path for the retried lookup and the expected fresh result for the second repo (C F3).
- "Shown red by breaking its condition" (2a) means a temporary edit at planning that makes the decision's violation on the base, discarded before the test commit, with its red output recorded beside the condition; the base alone is green for such a case (C F4).

### Agreed at the opening map (A,B,C), not contested

- Only `skills/plan-issue/SKILL.md` `## plan.synthesis` changes. `skills/check-issue/SKILL.md` stays: review already blocks a criterion with no test that would catch its failure. `skills/implement-issue/SKILL.md` stays: tests lock after planning by design.

/home/ivan/.akrogon/releases/a4fc68d3f4ebd5f43f1d99063bd8268e368fb6aa/skills/chart-issues/assets/standing-design.md applies as follows: this leaf changes skill prose only and adds no test and no machinery. Both done-criteria are judged by review against the file, as the drop-debate leaf judged its skill-text criterion. The configured `test` check keeps the existing skill-text tests green (the run-check rule phrases in `tests/run-units.test.ts`, the lesson-rule link and relative links in `tests/docs-links.test.ts`), and `format` and `typecheck` stay green.

## Leaf architecture

Owned surface: `skills/plan-issue/SKILL.md` `## plan.synthesis`. The new rule sits after the paragraph that maps each done-criterion to its observation and before the paragraph that begins "With `plan.md` written", because the second paragraph derives the tests the rule selects. Wording is the plan's, kept to what criterion 1 lists.

Changed precondition and its consumers:
- The test paragraph's "a test for each done-criterion no existing test or `checks` command already proves" now applies per stated condition: an existing test that proves a criterion's main result does not stand in for a condition case. The wording that makes this hold is the plan's.
- `skills/implement-issue/SKILL.md` `## implement` lets no seat add a case after planning on a named consequence alone; condition cases are written at planning, so the rule is consistent with it and that file stays unchanged.
- `skills/check-issue/SKILL.md` `## check.review` judges tests against criteria and gains a planned case to judge; it stays unchanged.
- Docs: `docs/reference/skills.md` (plan-issue entry) and `docs/start/one-change.md` describe `plan.synthesis` only in general terms. Open for the plan: any doc that lists what a plan must contain and so goes stale.

Exclusions: every other skill file and section; the chart-issues skill and its assets; `learnings/`.

Dependencies: none.

## Case

Recorded 2026-10-26 from a leaf plan, facts only:

- Criterion 2: "Each removed `pane list`, `tab list` or `workspace list` read takes its answer from a read earlier in the same step, with no herdr write, prompt or wait between them."
- Criterion 3: "In one akrogon run, `git rev-parse --git-common-dir` and `git remote get-url` run at most once per registered root, and a failed lookup is retried on the next call."
- First plan D2: `reconcileRepos` took each repo's pane list from one host-wide `pane list` read. `reconcile()` on an earlier repo can run `herdr tab close` before a later repo uses that list.
- First plan D3: `commonDirectory` memoized every result per process, including the `null` it returns for a path that is not a git repository.
- Planned proofs: a `pane list` and `tab list` count in a single-repo slice with no herdr write, and `git` call counts over two allocated leaves plus an unchanged test calling `commonDirectory` on four distinct paths. None ran a failed lookup twice in one process or two repos with a write between.
