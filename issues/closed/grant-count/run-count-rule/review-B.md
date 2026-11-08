# Review B: run-count-rule

Date: 2026-11-04. Phase: check.review. Verdict: ready.

Base: `5499e3dab209ccc6fae14c8f4568e62e5c4c15c2`.
Reviewed head: `29f01f38bc0c7ad023844029dfd409705bb67acd`.

Read the brief, complete design including its adopted final-shape picks, plan, implementation report, readiness, affected skill clauses, reference index, skills area, human limits and autopilot pages, and `src/test-files.ts`. Reviewed the whole diff independently without reading A's review. No code was changed or committed.

## Findings

No Fixes or Nits. No Operator actions.

## Criteria review

- C1: All four Shared context paragraphs state the same rule, with only seat and artifact substitutions. Every covered launch uses run-check. Reaching the paid or live stage consumes the bound's unit regardless of outcome or successful-run wording. The count line records the grant entry, bound, prior count and unit before launch, then outcome, IDs, sessions and known cost. Earlier artifacts are read first and missing history stays unknown.
- C2: Paid repeat-count overruns warn in both the artifact and visible reply before continuing. Live-change repeat bounds, spend caps, scope, identity, effects, expiry and stop clauses retain their stop, which wins over the warning exception. Unknown history warns for repeat accounting and stops when compliance with a stop-type bound cannot be established.
- C3: The review audit paragraph is inside check.review and before its Finish instruction. It prohibits covered launches, routes a missing needed live proof to check.repair, preserves warned-overrun proof, and makes unwarned overruns, mismatched counts and unexplained paid activity Fixes. Blocked stop-type bounds become Operator actions. The adopted final-shape decision supersedes the earlier plan-named-reviewer exception in the design's historical answer.
- C4: The implement delegation paragraph assigns worker paid-command accounting and its report line to A.
- C5: Take and the readiness placeholders require plain-word units, consumption rules and separate nested bounds. Take also specifies renewal totals or dated/committed increments, the entry used by the next line, chart-probe consumption and operator approval for every paid door proof. stop_line excludes repeat counts.
- C6: Standing design recognizes a warned repeat overrun under the seat rule as covered and preserves the stop outside the grant. That reference carries the paid-only exception and stop precedence from C2.
- C7: The committed diff contains exactly the seven approved skill files. No src, tests, issues, AREA or lesson file changed. The worktree was clean.

Scenario read-through: after two paid-reaching attempts under a two-invocation grant, a third requires the prior count and a visible/artifact warning even if an earlier attempt failed. The same third attempt stops if it would violate a spend cap. Unknown prior spend also stops when the cap cannot be established. A second live destructive pass never gains the paid-repeat warning exception. These outcomes follow the four matching paragraphs without adding machinery.

The human docs delegate grant rules to the edited skills and retain correct approval and blocker behavior. No human-documented behavior changed and no additional doc edit is needed.

## Verification

E1. Scope, clean status, commit messages and Test-Change audit:

`check review-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/grant-count/run-count-rule/implementation/check-review-B-context-1793796028895-230812.log`

Read back with akrogon log. Test-Change trailers in base..HEAD: none. None of the seven changed paths matches the rule in src/test-files.ts, so no trailer is required. No test expectation, fixture, runner or configured check changed or was skipped.

E2. Whole diff, affected clauses, human-doc search and whitespace check:

`check review-B-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/grant-count/run-count-rule/implementation/check-review-B-diff-1793796045251-246583.log`

Read back the diff with akrogon log. The report's insertion repair changes placement only and satisfies the intended section scope.

E3. Current-head receipt and timing evidence:

`check review-B-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/grant-count/run-count-rule/implementation/check-review-B-receipt-1793796070641-279962.log`

Read back with akrogon log. Verify receipt `abcdbc3e-a8a7-430a-b5c2-c8001a0f06e2` covers the reviewed SHA and records setup, format, typecheck and test exit 0, using the configured commands without filtering. Read the saved format/typecheck logs and test summary: 1309 pass, 0 fail across 75 files. Logs:

- `implementation/check-format-1793795859727-3663351.log`
- `implementation/check-typecheck-1793795864554-3663351.log`
- `implementation/check-test-1793795975860-3663351.log`

The six planned criterion commands have saved exit-0 results in the implementation report and timing records after the final commit. Read each named green log with akrogon log. They are silent on success. Their commands match the plan, and no proof-command correction was made. These prose searches are navigation aids, not semantic tests. The criterion judgments above come from reading the actual clauses and their section context. No prose test was added to the repository. Existing current-head green evidence is sufficient, so the suite was not repeated.

The leaf has grants: [] and no model/outside proof stage. Its proof commands are local shell inspections. No leaf-grant-covered paid or live operation was launched during this review, and there is no covered count or overrun to reconcile for this leaf.
