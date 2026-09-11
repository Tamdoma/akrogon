# Implementation report

## Repair round 2

Before: 3902efb441a278a84e6b9ea997bf0f920a9c17d7 on eed65fb70e72215d300d40c5187b77ec01d01bdc. Integration baseline: 352fe91da011147a51561ddbfc295d7d29e00c54. After: 2a759dd9daf3c8f917b5723eabfd50bbca5f670e. Paused rebase completed successfully, with a clean worktree.

Changed files and reasons: resolved only the src/next.ts tab_closed dispatch conflict to upstream's equivalent inline owners[0] form. Upstream now contains the previous compatibility fix, so the redundant leaf hunk drops out. Original closure and test changes remain unchanged. The before/after patch comparison is evidence/round-2-range-diff.log. No docs/index changes are needed for this equivalent-code conflict resolution.

Tests run: changed tests with AKROGON_BASE=352fe91da011147a51561ddbfc295d7d29e00c54 passed, exit 0, 66 pass / 0 fail / 567 assertions (evidence/repair-3-changed.log). bun run format and bun run typecheck passed, exit 0 (evidence/round-2-format.log, evidence/round-2-typecheck.log). Full suite after completing rebase passed, exit 0, 146 pass / 0 fail / 1439 assertions across 10 files (evidence/round-2-full-test.log). git diff --check against the integration baseline passed.

Known limitations: original R1–R3 and nonblocking review nits unchanged. No new behavior or assertions added or weakened. Issue artifacts remain in the authoritative checkout only.

Unverified criteria: none. A10–A11 and the original closure behavior pass the combined regression checks.

## Repair round 1

Before: 611d52b4caaa23a30c1276462e811e6f16ed6cfe, originally based on 35a20886b65463c0c7c6b0a30047f56a680d5e63. Integration baseline: eed65fb70e72215d300d40c5187b77ec01d01bdc. After: 3902efb441a278a84e6b9ea997bf0f920a9c17d7. The paused rebase was completed successfully.

Changed files and reasons: tests/next.test.ts retains the entire upstream appended session/seat test block followed by both leaf startup closure/cleanup tests. No assertions were weakened. Resolving this conflict exposed a pre-existing integration failure in the new base: src/next.ts's tab_closed handler used missing allLeaves and old dispatchLeaf/sweepAll signatures. The handler now uses registeredRepos/discover and the current Leaf, Invocation and DispatchOutcome interfaces, matching the adjacent hook path. The original closure patch is otherwise unchanged. evidence/repair-range-diff.log records the before/after patch comparison.

Tests run: conflict resolution alone produced 63 pass / 1 fail in changed tests (exit 1, evidence/repair-1-changed.log). The existing closed-tab test failed and typecheck exited 2 on the outdated interfaces (evidence/repair-1-typecheck-red.log). After the compatibility repair, changed tests with AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc passed: 64 pass / 0 fail / 509 assertions, exit 0 (evidence/repair-2-changed.log). bun run format and bun run typecheck passed, exit 0 (evidence/repair-format.log and evidence/repair-typecheck.log). After rebase completion, bun test passed: 143 pass / 0 fail / 1373 assertions across 10 files, exit 0 (evidence/repair-full-test.log). git diff --check against the integration baseline passed and the worktree is clean.

Known limitations: plan R1–R3 and the recorded review nits remain unchanged. No documentation or index change is needed for this conflict/interface repair. All issue artifacts remain in the authoritative checkout.

Unverified criteria: none. A5–A9 pass along with the original A1–A4 regression coverage. Real CLI/Git fixtures and process-boundary gh/herdr replacements supplied verification without production service mutations.

## Original implementation

Commit: 611d52b (base 35a20886b65463c0c7c6b0a30047f56a680d5e63).

Changed files and reasons: src/phase.ts derives issue-private sources and closes required sources before reporting or moving containers. src/pull.ts receives explicit source sets and retains existing GitHub retry behavior. src/next.ts sweeps before cleanup and retains resources beneath open owners. tests/fake-gh.ts verifies pre-rename closure under open locks with the worktree present. tests/phase.test.ts and tests/next.test.ts exercise ownership, partial failure recovery, standalone source union, CLOSED skips and cleanup protection through real CLI invocations in isolated repositories.

Tests run:

- Resolved changed-tests command with AKROGON_BASE=35a20886b65463c0c7c6b0a30047f56a680d5e63: red exit 1, 40 pass and 11 fail before production changes. Evidence: ../evidence/cli-red.log.
- Same changed-tests command after implementation: exit 0, 52 pass, 0 fail and 423 assertions. Evidence: ../evidence/cli-verification.log. This covers phase.test.ts and next.test.ts and the real phase, next <slug> and next --all invocations.
- bun run format: exit 0. Evidence: ../evidence/format.log. Only planned files changed.
- bun run typecheck: exit 0. Evidence: ../evidence/typecheck.log.
- bun test after formatting: exit 0, 131 pass, 0 fail and 1287 assertions across 10 files. Evidence: ../evidence/full-test.log.
- git diff --check: exit 0. No issue artifacts are included on the implementation branch.

Known limitations: R1–R3 from the plan remain. Sweep retries do not replay missed broadcasts. GitHub closure and filesystem moves are not atomic, and chart-move recovery remains unchanged. docs/merge.html and docs/next.html retain their old ordering descriptions because documentation changes are explicitly excluded. Existing cross-invocation comment deduplication behavior is unchanged.

Unverified criteria: none. A1–A4 are covered. External services were replaced only at the existing gh/herdr process boundaries, with real Git and CLI execution. No production GitHub mutations or real pane operations were used for verification.
