# Direct review B: merge-green-rate

Base: `ff8f6e11b766a1422d2f9048f0f7a161728fef19`
Reviewed head: `fb236ec070366b16ccae5f45ac3857615a0574aa`
Verdict: **fix**

Reviewed the committed diff against direct/plan.md, including Revision after B plan review, and direct/report.md. Framework Outcome 1 and the earlier plan F1 belong to the framework chart and are excluded here. No peer review was read.

## Fixes

### F1 — The direct landing guard refuses the uncited test changes

Source: the planned direct publication runs `skills/chart-issues/scripts/direct-guards.ts:18`, which calls `requireTestChangeCitations`. `src/phase.ts:413–422` requires trailers for modified existing test files. Both `tests/command-reference.test.ts` and `tests/receipt-gates.test.ts` are modified existing files matched by `src/test-files.ts`. The reviewed range has one commit, fb236ec, whose message has no Test-Change trailers.

Consequence today: the direct route cannot land this head. Running the real read-only direct guard through run-check exits 1 before the receipt check and names both paths:

```text
Changed test files need a citation:
Test-Change: tests/command-reference.test.ts <source and reason>
Test-Change: tests/receipt-gates.test.ts <source and reason>
```

Fix: add a permitted follow-up trailer-only commit naming each exact path. The command-reference change extends the argument contract for the approved flaky command. The receipt-gates change adds the planned repair-to-merge receipt case without changing existing expectations. These are valid reasons for the changes; their required citations are missing. Keep the code/tests as reviewed, then rerun direct guards after the direct verifier supplies its required receipt.

## Nits

**N1 — The flaky documentation claims more causality than the sensor establishes.** `docs/guide/files.md:98` says a same-tree flip means “the test, not the change under review” decided the result. `src/flaky.ts:27–39` establishes only different outcomes for the same tree and command. A nondeterministic defect introduced by that tree, or different external inputs, can also produce those outcomes. The plan explicitly keeps causal judgment with B. Deferred because this command only proposes candidates, requires operator confirmation and changes no verdict/state; no current misrouted repair was established. Prefer describing observed inconsistency without exonerating the change. An actual wrong causal disposition based on this claim would promote it to a Fix. No additional test or issue is required for this Nit.

## Assessed behavior

- Earlier plan F2 is addressed: implement-issue:65,80,86, skills/AREA.md:24 and init-akrogon:20 now use the reproducing command. check-issue:69 requires recorded command, reproducer, rejected/repaired revisions and red/green evidence. Merge's full verification remains required.
- Earlier N1 is addressed in code and the planned test: unfinished/setup-failed records are excluded, pairing uses exact command plus tree, and ordering uses completed-run end time. Grouping by command/test and closed-folder log lookup are consistent with the revised plan.
- The check.repair → merge gate calls the existing current-tree/current-command-set leaf receipt guard. The real CLI regression passes. The repair skill now asks B to obtain that receipt while leaving merge_checks to merge.
- The duplicated-list rule asserts source-derived properties, including preservation against base. The independent-expected-results rule remains at standing-design.md:17. No test expectation was derived from its own result in this diff.
- Changed AREA files were read and their named repository file paths listed against the worktree. All listed paths exist. A missing additional index entry is not a concrete defect here.

## Verification and trailers

`akrogon run-check --holder <chart>/direct --name review-B-green-rate -- bun test tests/flaky.test.ts tests/receipt-gates.test.ts tests/command-reference.test.ts` exited 0: **10 pass, 0 fail**, 1290 assertions, 0.187 s. Run `e315e790-2d6e-4e45-ac46-19289ca593e6`; its log is in direct/.

`akrogon run-check --holder <chart>/direct --name review-B-direct-guards -- bun skills/chart-issues/scripts/direct-guards.ts <worktree> akrogon <chart>` exited 1 with F1's citation refusal. Run `3d1540b3-83a3-450a-817f-52e894fdf62e`; its log is in direct/. This failure is caused by the reviewed range and requires no unchanged-head retry.

The report records the full suite, typecheck and format checks green; these were not repeated. Test-Change trailers in base..head: **none**, assessed under F1. New tests/flaky.test.ts is an added file, not an existing test edit needing this gate's citation.

Worktree HEAD and cleanliness verified after review. No code edits, commits, pushes or phase moves. Only this review artifact and runner-generated evidence were written.
