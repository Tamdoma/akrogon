# Review B: timing-readout

Date: 2026-10-13. Initial blind check.review, slot B.
Base: e00f5dd16389292e7557bc347b4c0b2a8d1c6a8a.
Reviewed head: 418c094d00bce145feca514c72f1d11bb5d33bba.
Verdict: fix.

## Fixes

### F1: The gate passes a cohort whose median exceeds 35 minutes

Location: src/timing-report.ts:311–325, verdict.
Source and criterion: the fixture-record cohort CLI explicitly required by brief done-criterion 3 and plan D6–D7/D9. A full cohort with ten merged members at F=30m, five at F=42m, and five at F=60m has 20 merged members, 15 at or below 45m, no ejections, and median (30+42)/2=36m. It must fail the fixed median bound.

Observed: the real CLI exits 0 and prints pass. The implementation tests only whether more than ten members exceed 35m. Exactly ten exceed it here, so it never evaluates the two central values. Consequence: the operator receives a passing merit result despite the fixed median threshold failing. This is a named done-criterion failure, not a speculative input case.

Evidence: implementation/review-B-probes.log, scenario median. Probe used tests/helpers.ts fixture and cli, generated schema-valid records for 20 slugs, plan prompts at 2026-10-02T00:00Z plus the member index in minutes, implement prompts ten minutes later, implement exits another ten minutes later, and merged moves at joined+F+10 minutes. Ran the real timing --cohort --since 2026-10-01T00:00:00.000Z. The returned member lines confirm the F distribution. No attempts file means zero ejections.

Repair: evaluate the median bound using the central values, including an optimistic completion when deciding whether a partial cohort can still meet it. Add a reproduction at the cohort CLI boundary. The existing all-30m cohort cannot catch this failure.

### F2: The gate passes with fewer than 18 merged members

Location: src/timing-report.ts:306–325, verdict.
Source and criterion: the fixture-record cohort CLI explicitly required by brief done-criterion 3 and plan D7/D9. A full cohort with 17 merged members at F=20m and three stalled members has fewer than the required 18 merges.

Observed: the real CLI exits 0 and prints pass, followed by 17 F 20m lines and three over 45 (stalled) lines. Stalled members are excluded from unresolved, but pass never checks the merged count. Consequence: the operator receives a passing merit result before the minimum merged count is met. This is a named done-criterion failure.

Evidence: implementation/review-B-probes.log, scenario merged-minimum. Same CLI/fixture procedure as F1, with F=20m for members 0–16 and no merged moves for members 17–19. All joined on 2026-10-02, more than 24 hours before this review. No failed moves or ejections. The three stalled leaves may still merge, so the result must remain insufficient while these bounds can still be met, rather than pass.

Repair: require the actual merged count to reach MERGED_MIN before pass. Add a reproduction at the cohort CLI boundary. The existing fewer-than-18 test covers three failed leaves, which takes another branch and misses stalled leaves.

## Verification

Read brief.md, plan.md, design.md, implementation/report.md and the skill's ponytail guidance before reviewing the whole diff. Debate is no, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No code or tests were modified and no commits were made.

Ran the configured setup under the git install lock, then the plan's focused proof commands together: bun test tests/timing-report.test.ts tests/command-reference.test.ts. Result: 9 pass, 0 fail, including all five timing scenarios and four command-reference checks. Implementation report records full checks at 8f332fc (855 tests green, changed tests green, typecheck/format/own-modules green). The only later commit is the tests/AREA.md trailer citation, so those code checks remain applicable. No red configured check required comparison or a base run. The extra CLI probes demonstrate the uncovered criterion failures above. Temporary probe script and fixture repos were removed.

Reviewed routing, timing and attempt schemas/writers, dispatch arguments, README command row and docs/guide/files.md. Documented behavior changed to add both timing modes, matching the intended interface. AREA path listings from the repository root found all referenced code/test/guide paths present. Runtime issue-record files and issues/config.yaml are absent in this code worktree because records live in the registered checkout. These are runtime descriptions, not broken documentation pointers. No AREA deletion, merge-check script change, or lesson removal occurs in this diff.

## Test-Change trailers

- ead2803: tests/command-reference.test.ts adds the timing verb argument contract before the verb exists. Supported by brief's new command and plan D10.
- 4a4a7cb: tests/timing-report.test.ts exclusive waits claim before prompted per plan D3 correction; adds a check_start with no end inside a closed visit. Supported by brief criterion 1's exclusive sum and criterion 2's missing-end requirement.
- b967f58: tests/timing-report.test.ts repo_pause rows matched real slug-less lines, and wait/check times used minute offsets so F stays 30m. Supported by src/timing.ts's strict slug-less repo_pause schema and criterion 3's intended passing cohort. Inspecting these corrections found no removed regression protection.
- 418c094: tests/AREA.md adds index line for the new timing-report test file. Supported by the added test and live existence listing, and matched by src/test-files.ts's tests-directory rule. This commit supplies the citation for the index change in 8f332fc.

No deferred Nits or operator actions.

## 2026-10-13 check.repair

Repaired all three Fixes from the initial reviews. Prior reviewed head: 418c094d00bce145feca514c72f1d11bb5d33bba. Repair head: 99a5ada582267e92d227c005eb1705ce7dc80576. No plan/design changes, test expectation corrections, required live runs, or operator-only actions were needed. No items handed to A. No reusable Nits held by B remain.

- F1: reproduction commit 116fbaf; fix commit 2853bde. The CLI reproduction with ten F=30m, five F=42m and five F=60m members failed before the fix (expected fail, received pass), then passed. The gate now sorts F values and averages the two middle entries. Missing/unresolved members contribute an optimistic zero to the possible cohort, preserving the partial-cohort rule. Logs: implementation/repair-F1-red.log and implementation/repair-F1-green.log.
- F2: reproduction commit b71cdef; fix commit 23a4bb4. The CLI reproduction with 17 merged and three stalled members failed before the fix (expected insufficient, received pass), then passed. Pass now requires the actual merged count to be at least 18. Logs: implementation/repair-F2-red.log and implementation/repair-F2-green.log.
- F-A1: reproduction commit 97d6c6b; fix commit 99a5ada. A schema-valid parked wait after the last phase move, tracing the actual src/park.ts writer, failed before the fix (no parked waiting printed), then passed with at least 47 hours of parked waiting for a member started 48 hours ago. Unresolved members' wait totals now end at command runtime; merged/failed members retain their terminal time. Logs: implementation/repair-FA1-red.log and implementation/repair-FA1-green.log.

Each finding has its own red reproduction commit followed by its own product fix commit. All three test commits carry Test-Change trailers citing the finding and its source. No pre-existing assertion was changed. Temporary probe fixtures were cleaned by the existing fixture helper.

All done-criteria rerun after the final changes through the planned commands, together as bun test tests/timing-report.test.ts tests/command-reference.test.ts: 12 pass, 0 fail. This includes original decomposition/incomplete-event/cohort scenarios, command contracts, and the three reproductions. Evidence: implementation/repair-criteria.log.

Configured checks run through akrogon run-check --name <name> -- sh -c <setup, guard, command>, using the printed install-lock/setup and own-modules guard:

- format: bun run format, exit 0; no formatting diff. implementation/repair-format.log.
- typecheck: bun run typecheck, exit 0. implementation/repair-typecheck.log.
- test_changed: : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000, exit 0; 12 pass, 0 fail. implementation/repair-test_changed.log.
- test: bun test --timeout=30000, exit 0; 858 pass, 0 fail across 46 files (78.06s). implementation/repair-test.log.

Final worktree is clean and git diff --check 418c094..HEAD passes. All configured checks succeeded, so no comparison/base run was needed. No merge_checks ran. All Fixes are repaired with current proof, and the pass requests merge.

## 2026-10-13 merge verification

Applied attempt: 6a1bcff4-3653-4fe2-856f-308d14d904f0. Batch base: e00f5dd16389292e7557bc347b4c0b2a8d1c6a8a. Tested top: 99a5ada582267e92d227c005eb1705ce7dc80576. No carried members. HEAD matches the supplied top; the worktree remains clean. No fetch, rebase, code edits or commits were performed during this applied-stack pass.

Refreshed config for the merge base. merge_covers is empty and merge_checks is empty. Ran every configured checks command with its install-lock setup and own-modules guard, through akrogon run-check --name <name> -- sh -c <composed command>:

- format: bun run format, exit 0 and no diff; implementation/merge-format.log.
- test: bun test --timeout=30000, exit 0; 858 pass, 0 fail across 46 files, 78.06s; implementation/merge-test.log.
- typecheck: bun run typecheck, exit 0; implementation/merge-typecheck.log.
- test_changed: : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000, exit 0; 12 pass, 0 fail; implementation/merge-test_changed.log.

All checks are green; no advisory failures, comparison records, base runs or operator blockers. Read the completion owner's ISSUE.md and all three leaf briefs (serial-plan-solo, timing-events, timing-readout); the other two leaves are already merged. This merge can complete leaf-speed. Completion broadcast targets from config are DISCORD_WEBHOOK_URL and DISCORD_WEBHOOK_URL_2.
