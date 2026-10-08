# Review B: direct-setting

Date: 2026-10-08. Phase: check.review. Verdict: ready.

Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad.
Reviewed head: 17f7a0edc3979902c52caceaf1ec9c8cba74db7d.

## Scope and findings

Reviewed brief.md, design.md, plan.md, implementation/report.md and both implementation unit briefs, then the entire three-file diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

No Fixes, Nits or operator actions.

The new repoSchema entry is a strict boolean with default false. readRepo parses registered repository configuration through that schema, and effectiveConfig spreads the parsed configuration into its output. Outside a registered repository, effectiveConfig parses its default configuration through the same schema. No command consumes direct, no machine setting was added, and the repository configuration and excluded skills are unchanged.

The new CLI test exercises a real registered-repository fixture: true is printed, status accepts the configuration, omission prints false inside and outside the repository, and raw YAML yes and 1 fail with the key in the validation error. It adds assertions without modifying existing expectations. The schema rejects other non-boolean types through the same boolean parser.

Opened docs/guide/setup.md and followed docs/reference-index.md to the source and test area contracts. The setup bullet states the default, offer-only behavior and operator choice, matching the binding design. No AREA.md changed, so no changed-area path listing is required. The excluded init skill omission is the plan's explicit limitation and does not prevent configuration parsing.

## Verification evidence

implementation/report.md records results for the reviewed head: format and typecheck exit 0, config and docs-link tests 21 pass / 0 fail, changed tests 427 pass / 0 fail, and the full suite 534 pass / 0 fail. It records the deliberate removal of the schema entry making the new test fail at the CLI exit-code assertion, followed by restoration and passing results. This establishes that the test detects the missing behavior, even though its first failing assertion stops the later default checks during the break.

Review inspection confirms all four done-criteria are covered by the code, CLI assertions and guide entry. No code changed, missing evidence or specific concern required repeating the reported checks. Live review commands: git diff --check BASE...HEAD exited 0, git status --short was empty, and akrogon status direct-setting showed check.review with no Missing entries. rg found the only source occurrence of direct at the new schema entry, confirming commands do not consume it.

## Test-Change trailers

Reviewed implementation range f57bb356c149ed6b9d87a5e122a79d1b54de15ad..17f7a0edc3979902c52caceaf1ec9c8cba74db7d:

- 8622ffe1f49916c9ccfb63d1422efb7d43c45687: `Test-Change: tests/config.test.ts added direct setting config test; no existing expectation changed`

tests/config.test.ts matches src/test-files.ts. The trailer accurately describes the additive diff and its source in brief criteria 1–3 and plan D4. No existing assertion, fixture or recorded output changed or was deleted. The docs commit has no test-file changes.

## Phase result

`akrogon phase direct-setting merge --slot B --verdict ready` returned `moved merge`. The command's merge wake rebased the lane onto origin/main 27adeef62d55ddc5b6a5b4d9ed960ce0431a6532, producing head 58b9ecda3e9898c33646b7a46c35e0f3322b5878. git range-diff shows both implementation patches unchanged. The resulting origin/main..HEAD trailer is the same text above, now on eea5a2d638eba573fb8e7aa803e2025bbd07b77f. This records the rebased head for any later repair re-check.

## Merge verification: 2026-10-08

Attempt: e0ab94c5-8fc5-4e47-90da-7e13b4c5b1ea. Applied stack has no carried members. Target/base: origin/main at 27adeef62d55ddc5b6a5b4d9ed960ce0431a6532. Tested head: 58b9ecda3e9898c33646b7a46c35e0f3322b5878, matching the recorded top.

Read review-A.md in addition to the previously read plan, report and own review. All configured checks completed on the applied head:

- `bun run format`: exit 0. It only rewrapped the pre-existing phaseColor declaration in src/status.ts. Inspected that diff and restored this check-created change before the remaining checks. No scoped or unrelated code changes were committed.
- `bun test --timeout=30000`: exit 0, 534 pass / 0 fail, 5733 assertions. Log: /tmp/akrogon-1000/direct-setting-23ca1c3f6908/tmp.yPZRghPSZs.
- `bun run typecheck`: exit 0.
- `AKROGON_BASE=27adeef62d55ddc5b6a5b4d9ed960ce0431a6532 bun test --changed=27adeef62d55ddc5b6a5b4d9ed960ce0431a6532 --timeout=30000`: exit 0, 427 pass / 0 fail, 3930 assertions. Log: /tmp/akrogon-1000/direct-setting-23ca1c3f6908/tmp.UmwT6adM1T. This uses the refreshed base required by the configured test_changed command.

No merge_checks or advisory commands are configured. Worktree is clean and status reports no missing requirements. The parent direct-mode issue still has direct-route and hand-built-removal open, so this batch cannot complete an issue or epic and has no completion-owner broadcast to prepare.

`akrogon phase direct-setting merged --slot B --check --attempt e0ab94c5-8fc5-4e47-90da-7e13b4c5b1ea` returned `ok`. The subsequent `merged` call under the same attempt exited 0 and returned `moved merged`. No issue/epic completion line was printed, so no broadcast was required.
