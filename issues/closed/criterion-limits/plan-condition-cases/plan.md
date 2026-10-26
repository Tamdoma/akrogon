# Plan: plan-condition-cases

Direct synthesis by slot A from `brief.md` and `design.md`. The brief and the design agree; no conflict note.

## Read first

- `brief.md`, `design.md` in this folder, including design `## Case`.
- `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`.
- `skills/plan-issue/SKILL.md` `## plan.synthesis` (lines 41-55): the paragraph ending "…names a dependency only when execution actually requires ordering." is the insertion point; the paragraph beginning "With `plan.md` written" derives the tests.
- `skills/implement-issue/SKILL.md` `## implement` (no seat adds a case after planning on a named consequence alone) and `skills/check-issue/SKILL.md` `## check.review` (judges tests against criteria), as the unchanged consumers the design names.
- `tests/docs-links.test.ts` and `tests/run-units.test.ts` (the existing skill-text assertions this leaf must keep green).
- `learnings/LESSONS.md` line "blind-initial-review changed a peer-question rule in the skill while `docs/limits.html` kept the old rule" (grep `docs/` for a changed rule and own or report the hit; applied below under Docs checklist).
- `docs/reference/files.md`, `docs/reference/skills.md`, `docs/start/one-change.md`, `docs/use/write-issues-by-hand.md` (the design's `Open for the plan:` question — docs describing what a plan must contain).

## Decisions

- **D1 Condition-check rule.** `skills/plan-issue/SKILL.md` `## plan.synthesis` gains one paragraph between "…names a dependency only when execution actually requires ordering." and "With `plan.md` written":

  > Before writing the criterion tests, A checks each plan decision against every condition its done-criterion states — what must stay fresh, be retried, be refused, or not happen between — tracing each value from where it is made to its last use through later calls, helpers and earlier iterations of a containing loop or batch. Each condition a decision can reachably break gets a case that fails on that violation, run where the decision's kept state lives — the same process, invocation or step — or the traced reason it cannot break. Each checked condition, its decision and its case or traced reason are recorded in `plan.md` beside that criterion's observation. Each such case is shown red at planning by a temporary edit that makes the decision's violation, discarded before the test commit, with its red output recorded beside the condition. A count over cases where the condition holds does not prove the condition. These cases prove the existing criterion, so an existing test that proves only the criterion's main result does not stand in for them.

  Clause map to criterion 1, for review: check-then-trace covers "check each plan decision against every condition its done-criterion states … tracing each value … through later calls, helpers and earlier iterations of a containing loop or batch"; "Each condition a decision can reachably break gets a case that fails on that violation, run where the decision's kept state lives … or the traced reason it cannot break" covers the case-or-reason requirement and the same-process boundary (C F2); "recorded in `plan.md` beside that criterion's observation" covers the recording (C F1); "shown red at planning by a temporary edit that makes the decision's violation, discarded before the test commit" covers the red mechanism (C F4, decision 2a verbatim); "a count over cases where the condition holds does not prove the condition" is verbatim; the last sentence covers the main-result substitution bar.

  The paragraph names no new label (decision 2a). A case is a normal planned criterion test under the existing test paragraph; the added sentences state where it runs, that the red comes from a discarded temporary edit rather than the base, and what proves nothing.

- **D2 Docs: nothing else changes.** Design `Open for the plan:` — any doc that lists what a plan must contain and so goes stale. `docs/reference/files.md` describes `plan.md` as "decisions, units, waves and the proof for each done-criterion": condition checks are part of that proof, so the line stays true. `docs/reference/skills.md` plan-issue entry names only result, use and starter. `docs/start/one-change.md`, `docs/use/write-issues-by-hand.md`, `docs/use/run-work.md` and `docs/reference/checks.md` describe `plan.synthesis` at "writes `plan.md` with plan-issue" level. Grep over `docs/` for `plan.md` and `plan.synthesis` found no file enumerating plan contents; one line states that.

## Interfaces

None; the leaf changes prose. Record contract the text creates (for reviewers, not code): beside a criterion's observation in `plan.md`, a condition-check record carries the checked condition, the decision that reaches it, and the case or the traced reason it cannot break.

## Units and waves

### Wave 1

- **U1 Skill text.** Owns `skills/plan-issue/SKILL.md`. Decisions D1, D2. Test resource: none. Prerequisites: none.

One wave of one unit: serial-solo. A implements it inline, no workers.

### Docs checklist

- Agent docs: `skills/plan-issue/SKILL.md` — one new paragraph in `## plan.synthesis`. `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md` and all other skill files: unchanged per the design's opening-map agreement.
- Human docs: no doc affected — the D2 grep over `docs/` found no file listing required plan contents below the level the change alters.

## Condition checks on this plan's own decisions

The D1 rule does not bind this pass (it is the text being added), but applying it to this plan is the concrete scenario that verifies the wording. Each criterion's stated condition, traced against D1/D2:

- **Criterion 1, condition "each checked condition, its decision and its case or traced reason recorded in `plan.md`":** D1's text states the recording. Reachable break: omit the recording clause. The check runs at plan writing, not on the product, so no executable case can fail on it; traced reason: the clause is the only mechanism and a prose review reads it. Case: none.
- **Criterion 1, condition "each such case shown red by a discarded temporary edit":** same trace; the mechanism is prose demanded of future seats. Traced reason: no decision in this leaf keeps state between calls, invocations or iterations — the leaf's only state is the file text, checked by review. Case: none.
- **Criterion 2, condition "a reviewer walking the rule reaches both cases and the proofs' failure":** reachable break is ambiguous wording, not kept state. The verification below walks the text over the recorded case. Case: none.

Walk-through of D1's text over design `## Case` (the rule applied as written):

- **Recorded criterion 3, "a failed lookup is retried on the next call", against decision "memoize every result per process":** the value is the memoized result, made at the first `commonDirectory(<path>)` call and used by every later call for that path in the process. A call whose lookup failed and a later call for the same path in the same process are a reachable break — the memo serves `null` where the criterion demands a retry. The rule requires a case: the same process calls `commonDirectory(<same path>)` twice, the first lookup failing, and the second call must run the lookup again, run where the memo lives (one process). The recorded proof — call counts over four distinct paths — never calls one path twice after a failure and so satisfies neither the condition nor the case.
- **Recorded criterion 2, "no herdr write, prompt or wait between the earlier read and the removed read's answer", against decision "one host-wide `pane list` read reused across `reconcileRepos`":** the value is the single read's result, made before the repo loop and used at each repo's step. Tracing through earlier iterations of the containing loop, a `herdr tab close` from repo one's `reconcile()` is a write between the read and repo two's use — a reachable break. The rule requires a case with two repos where a herdr write from the first repo's step sits between the shared read and the second repo's use, and the second repo's list reflects that write. The recorded proof — a `pane list`/`tab list` count in a single-repo slice with no write — has no second repo and no write, so it satisfies neither.

A reviewer following the paragraph's trace words ("each value from where it is made to its last use through later calls … and earlier iterations of a containing loop") lands on both cases; the count-sentence names why the recorded proofs prove nothing.

## Criteria and proofs

All commands run from the leaf worktree. No model or outside stage, no live or paid action, no credential (`akrogon status` prints no `Missing:` line). Restart boundary: none. Rerun triggers fire when the named files change.

| Criterion | Boundary and observation | Product failure it catches | Command | Size / rerun trigger |
| --- | --- | --- | --- | --- |
| 1 | `skills/plan-issue/SKILL.md` `## plan.synthesis`. Before: no condition-check requirement. After: the D1 paragraph sits before the test paragraph and carries every clause the criterion lists (trace; case at the decision's kept state or traced reason; `plan.md` record; discarded temporary-edit red; no count-as-proof; no main-result substitution), with `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` untouched. The text is judged by reading; the existing skill-text assertions keep it consistent. | Future plans silently skipping a stated condition: a seat reuses, caches or omits work while proving only the criterion's main result, and review has no record to judge. | `akrogon run-check --name skill-text -- bun test tests/docs-links.test.ts tests/run-units.test.ts --timeout=30000`; plus the repo's `test` check via `akrogon verify` at implement | Seconds; `skills/plan-issue/SKILL.md` or the two test files change |
| 2 | The D1 paragraph walked over design `## Case`. Before: the recorded plan required neither case. After: the trace reaches (a) one process calling `commonDirectory` on the same path twice, the first lookup failing, with the second call re-running the lookup, and (b) two repos with a `herdr tab close` from the first repo's step between the shared `pane list` read and the second repo's use, the second repo's list reflecting that write; and the recorded planned proofs (four distinct paths; a single-repo slice with no write) satisfy neither. Reviewer judgment, not a command: no executable stage can observe that a reader reaches the cases; the model-facing inputs are this paragraph, the brief's criteria and `## Case`, replayed by A and B at `check.review`, which is its recording and consumer under the recorded-output rule. | A rule whose trace words do not actually surface the two recorded breaks, letting the same class of miss pass planning again. | none (review-judged; see observation) | `skills/plan-issue/SKILL.md` `## plan.synthesis` changes |

`format` and `typecheck` stay green (no machine-readable file changes; the `format` check's prettier run covers the edited Markdown) and run via `akrogon verify` at implement.

## Red evidence (plan.synthesis)

No new test: each criterion is proved by review against the file per the standing-design line the design cites, and criterion 1's existing-proof line is `tests/docs-links.test.ts` + `tests/run-units.test.ts` staying green. Base health of those files and of `typecheck` (no `format`, which would rewrite nothing here and is rerun at verify):

- `check plan-skill-text: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-plan-skill-text-1793004576458-2668049.log` — 21 pass, 0 fail (first attempt red on a missing `bun install` in the worktree, setup run, then green; `check plan-skill-text: 1 .../check-plan-skill-text-1793004564096-2666917.log`)
- `check plan-typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-plan-typecheck-1793004580081-2670437.log`

## Known limits

- The rule demands judgment (what a decision "can reachably break"), and criterion 2's walk-through is the only check that wording is unambiguous; a seat could still write a shallow trace and review catches it (C F1 record exists for that judgment).
- A base-green condition case rides on the temporary-edit red alone; if a seat discards the edit before committing and the case itself is weak, review is again the backstop — inherent to decision 2a.
