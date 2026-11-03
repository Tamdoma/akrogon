# Review B: merge-receipt-reuse

Date: 2026-11-01. Phase: check.review. Verdict: **ready**.

Base: `f7ddb69378c47af5feb978380fe1956e0fbfa1e1`.
Reviewed head: `1608709fead8b5bdbc5d3d1de4572a1281d674b5`.
Tree: `f93950feaa617e532cb7ccfa79aa7aa298ba9c6d`.

## Findings

No Fixes, Nits, unresolved questions or operator actions. Reviewed the entire five-file diff against the brief, design and plan, including the unchanged phase, direct-guard and land consumers. No code changes or commits made during review.

`greenRun` now supplies both verify's fast path and `requireGreenReceipt`. Both require one completed, setup-green row with the exact expected command list on the head tree. Known-red evaluates each eligible head row separately, requires an actual red entry and checks every unblocked red against a completed linked comparison at the merge-base. Scope remains on execution records, member staging, live-pass identity and slow sampling as planned. Per-command reuse still assembles a new complete row when no whole row qualifies.

## Criteria and evidence

| Criterion | Evidence checked |
| --- | --- |
| C1 | Inverted scope regression checks cross-scope reuse output, one retained row and merge-gate acceptance. The fast return precedes setup and check execution. |
| C2 | Merge-only member test checks gate rejection before merge verify, member execution, cross-scope unit reuse and acceptance of the resulting complete row. |
| C3 | Split-row test checks initial gate rejection and a subsequent verify producing a third whole-green row instead of taking the fast path. |
| C4 | Regression's red half checks no additional head row, a base comparison linked to the leaf red row, successful known-red verify and merge-gate acceptance. |
| C5 | Notice test checks a leaf-scope green on landed main resolves the earlier merge-scope incident and recurrence sends a second notice. |

Read back the saved logs using `akrogon log`. Paths below are relative to this leaf's `implementation/`.

- Red-before evidence: `check-criterion-tests-1793539086222-3346759.log` shows the split-row gate, cross-scope reuse and notice assertions failing on the original implementation. Its initial C2 fixture error was corrected, and `check-criterion-c2-1793539096295-3359139.log` then fails on the missing cross-scope `reused` field.
- Current focused proof: `check-criterion-final-1793539323102-4020470.log` has 5 pass / 0 fail, covering C1–C5 and blocked-member behavior.
- Current required verification: receipt `e302314b-0d4c-449b-bbbf-f783e0f8be30` has setup, format, test and typecheck at exit 0 on the reviewed tree. Logs: `check-setup-1793539325665-4022739.log`, `check-format-1793539327847-4022739.log`, `check-test-1793539396453-4022739.log`, `check-typecheck-1793539400902-4022739.log`. The full test log records **1264 pass / 0 fail**, including every criterion case.

The latest test edit is `9cffb8f4`, committed before both the focused proof and the full verification. The reviewed head adds only an empty citation commit and has the same tree. No changed test, helper, fixture, config or lockfile postdates that verification. The report uses the planned proof commands and `akrogon verify`; no planned checks or runner configuration were removed, filtered or disabled. The earlier format failure was corrected before the current green receipt. No rerun was needed.

Review audit evidence:

```text
check review-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-context-1793539433898-384229.log
check review-b-proof-index: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-proof-index-1793539463402-453662.log
check review-b-final-audit: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-final-audit-1793539489020-457009.log
```

## Test-Change trailers

Listed from `f7ddb693..HEAD`, and judged against the plan's binding outcomes and the actual diffs. The path rule in `src/test-files.ts` includes both `tests/verify.test.ts` and `tests/AREA.md`.

| Commit | Trailer | Judgment |
| --- | --- | --- |
| `3ffc1d44` | `Test-Change: tests/verify.test.ts plan.synthesis criterion tests for merge-receipt-reuse (inverted 5d0b505f reproducer, split-row refusal, merge-only member, cross-scope notice resolution)` | Matches C1–C5 and design Q2/Q3. The historical scope reproducer is retained and inverted. |
| `d20820ff` | `Test-Change: tests/verify.test.ts corrected two expectations under the one-row rule (blocked member needs no cover, stitch test selects the fresh row by exclusion)` | Blocked-member expectation follows plan D2's explicit exemption. Selecting the new row by ID exclusion preserves the assertion's purpose. |
| `9cffb8f4` | `Test-Change: tests/verify.test.ts formatting only, no expectation changed` | Diff is formatting only. |
| `1608709f` | `Test-Change: tests/AREA.md doc line updated for the one-row receipt rule, no test logic` | Empty citation commit covers the changed area description; no assertion is removed. |

## Documentation and paths

Read `docs/reference/checks.md`, `docs/reference/state-and-phases.md` and the reference index. The changed receipt and known-red prose describes the implemented rule. State-and-phases keeps its valid requirement for a green receipt; no additional edit is needed.

Each changed AREA file received its own repository-root path listing, read back from:

```text
check review-b-area-src: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-area-src-1793539455571-451072.log
check review-b-area-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-area-tests-1793539455571-451073.log
check review-b-runtime-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-review-b-runtime-paths-1793539507533-457652.log
```

All named source, test, skill and documentation paths exist. The `issues/` paths absent from this worktree are runtime state in the registered checkout; the final listing confirms each exists there. No dead-pointer consequence was found. No lesson was removed and no reusable Nit remains to record.

## Merge B: 2026-11-01

Attempt: `79659e23-0c43-4bf4-ac13-6db8b0248ef3`, solo.
Fetched and rebased onto `origin/main` at `de57a744b69b2a780ef7625cd5d38f3a9784a877`.
Prior reviewed base/head: `f7ddb69378c47af5feb978380fe1956e0fbfa1e1` / `1608709fead8b5bdbc5d3d1de4572a1281d674b5`.
Resolved head: `318cfda32d8ee6a569326ba7785df740cfd22039`.

The sole conflict was the shared `tests/AREA.md` line. Resolution retains this leaf's cross-scope receipt/per-head-row description and main's `check.repair` gate reference. Both named test paths exist. No test expectation or product logic changed during conflict resolution.

Ran `git range-diff f7ddb69378c47af5feb978380fe1956e0fbfa1e1..1608709fead8b5bdbc5d3d1de4572a1281d674b5 de57a744b69b2a780ef7625cd5d38f3a9784a877..318cfda32d8ee6a569326ba7785df740cfd22039` before verification. It shows three equivalent commits and only the combined AREA line in the remaining commit. The retired-lesson removal helper returned `none`. Worktree clean.

Read-back evidence:

```text
check merge-b-rebase-continue: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-merge-b-rebase-continue-1793539649387-463933.log
check merge-b-range: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-merge-b-range-1793539663698-464303.log
check merge-b-retired: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-merge-b-retired-1793539663556-464223.log
```

`akrogon verify --attempt 79659e23-0c43-4bf4-ac13-6db8b0248ef3` exited 0 on resolved head `318cfda32d8ee6a569326ba7785df740cfd22039`, run `50de9126-d62d-432c-a282-678f8edf8b55`:

```text
verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-setup-1793539679847-464673.log
verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-format-1793539681779-464673.log
verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-test-1793539750254-464673.log
verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-typecheck-1793539752683-464673.log
verify merge 318cfda32d8ee6a569326ba7785df740cfd22039: green
```

Read all four logs back with `akrogon log`: 1264 tests passed, 0 failed, including all receipt criteria. No advisory checks are configured.

`akrogon phase merge-receipt-reuse merged --slot B --check --attempt 79659e23-0c43-4bf4-ac13-6db8b0248ef3` returned `ok`, recording the tested head. Read-back evidence:

```text
check merge-b-gates: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/merge-receipt-reuse/implementation/check-merge-b-gates-1793539766717-774483.log
```

Gathered the completion owner's `ISSUE.md` and all three `suite-repeats` leaf briefs before the final merge call. No merge-time Fixes or Nits remain.

Final `akrogon phase merge-receipt-reuse merged --slot B --attempt 79659e23-0c43-4bf4-ac13-6db8b0248ef3` exited 0 and printed `moved merged` and `deployed de57a744b69b..318cfda32d8e; deployed 318cfda32d8e`. No owner-completion line was printed, so no broadcast was due in this pass.
