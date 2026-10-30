# Review B: known-red-filing

Date: 2026-10-27. Phase: check.review. Verdict: ready.

Base: `63c20f9859578c179a30dac9c6ab0ac648a6f62b`.
Reviewed head: `f85cc67067752ca0e3d3557cee594ec75093d6ed`.

## Findings

No Fixes, Nits, unresolved questions or operator actions. Reviewed independently without reading A's review. No code changes or commits made.

## Criteria and contract review

| Criterion | Result |
| --- | --- |
| C1 | implement-issue's Shared context paragraph includes both filing triggers, all three exclusions, the report path, unchanged verification status and the explicit exclusion of filing `gh` failures from operator blockers. Its existing implement-end/check.fix scope is preserved. |
| C2 | check.review includes the same triggers and exclusions for either reviewing seat, recording the result in that slot's review. check.repair's existing reference still resolves to the unchanged paragraph opening. |
| C3 | merge's red-verify paragraph includes configured and already-evidenced outside-checks failures, records the result in review-B.md, adds no proof run and preserves blocking criteria. |
| C4 | Direct landing step 3 includes both triggers, exclusions and direct/report.md recording. It adds no proof run and leaves the existing verification and landing gates intact. |
| C5 | The single Lifecycle filing section defines defect grouping, all required evidence fields, compared-SHA limits, failure-location routing, evidence reuse and return to the caller's phase action and footer. All four seat skills reference it. |
| C6 | Closed reports cover only through a named open covering report. Recurrence or absence of open coverage posts fresh with the closed report related, without reopening or commenting. Open coverage remains judged by mechanism. |
| C7 | The diff contains exactly the five planned skill files. The worktree is clean and the head is unchanged. |

Traced the motivating outside-checks scenario: a completed base run of the same command failing the same tests now triggers filing on each route using existing evidence. A configured known-red pass also triggers filing. Green retries, disagreeing judgments and incomplete base runs do not. The caller retains its verification result and continues after recording either the URL or filing error. A consumer test remains the failure location for routing, rather than a cited akrogon skill path.

Read docs/reference-index.md, docs/reference/checks.md, skills/AREA.md and the affected skill sections. The checks page already delegates seat retry/known-red policy to these skills and makes no conflicting filing claim. No AREA.md changed and no lesson removal is present.

## Verification evidence

Read the retained logs with `akrogon log`. Review command receipts:

```text
check review-proof-index: 0 /home/ivan/Work/infra/akrogon/issues/open/known-red-intake/known-red-filing/implementation/check-review-proof-index-1793117783931-180908.log
check review-seat-context: 0 /home/ivan/Work/infra/akrogon/issues/open/known-red-intake/known-red-filing/implementation/check-review-seat-context-1793117792826-182888.log
check review-verification-records: 0 /home/ivan/Work/infra/akrogon/issues/open/known-red-intake/known-red-filing/implementation/check-review-verification-records-1793117799301-184449.log
check review-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/known-red-intake/known-red-filing/implementation/check-review-final-state-1793117830601-192314.log
```

The completed leaf verify receipt `b5ae9cc1-2bf2-4fce-a313-95b041d07e44` is for the reviewed head and records setup, format, test and typecheck exit 0. Its commands match the current configured commands, with no filtering or runner changes in this diff. Read-back logs:

- V1 format: `implementation/check-format-1793117654757-4039997.log`, all matched files formatted.
- V2 test: `implementation/check-test-1793117723085-4039997.log`, 1219 pass, 0 fail across 69 files.
- V3 typecheck: `implementation/check-typecheck-1793117725497-4039997.log`, `tsc --noEmit`.

The plan's criterion proofs are section reads and the diff listing, as required by the locked text-only design. Independently read the final sections and reviewed the planning absence logs and A's post-commit diff listing. No added or changed test, helper, fixture, proof-command correction or stale test result requires another run. Existing green configured checks are retained without rerunning them. No outside call or live filing was needed for this review.

## Test-Change trailers

`63c20f9859578c179a30dac9c6ab0ac648a6f62b..HEAD` contains one commit, `f85cc67067752ca0e3d3557cee594ec75093d6ed`, with no Test-Change trailers. None of the changed paths matches src/test-files.ts, and no tests or expectations changed.

No reusable Nit or lesson was identified.
