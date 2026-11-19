# Review B: claude-seats-deny-prompts

Date: 2026-11-16
Phase: check.review, initial blind review
Base: f10a5647fd8223a3355cf01979d9e20256f2d3d9
Reviewed head: 994e2f997c3728e5b2381b81566a618f80140c01
Verdict: ready

## Findings

No Fixes, Nits or operator actions. Reviewed the whole four-file diff against brief criteria 1–5, the locked design, plan, implementation report and current callers. No peer review was read. The worktree was clean and the authoritative open leaf is unique.

The Claude-only transformation merges the parsed JSON at its existing argv position, preserves pair/equals spelling and sibling settings, overrides false, and inserts the pair before the existing disallowed-tools suffix when absent. The schema rejects non-object settings and permissions. Duplicate settings flags, missing values and bare `--` refuse before launch. Other harnesses follow their unchanged paths.

Both `startSeat` and `startConsultant` call `harnessArgv` before terminal creation and append the task after its result. The existing `dispatchLeaf` error reporting and direct CLI propagation expose refusals. No new retry or error-handling path is needed.

Opened the behavior documentation, `docs/reference/config.md`, through `docs/reference-index.md`. Its changed harnesses row accurately describes the merge and refusals. The unchanged source/test area descriptions remain accurate. No AREA.md or lesson retirement is in this diff, and no documented pointer was added or removed.

## Verification evidence

Evidence paths below are relative to this leaf's `implementation/`. Logs were read through `akrogon log`; no check or covered operation was launched in review. Existing current-head proof is sufficient, so no rerun was needed.

- Required-check receipt `55e160d5-19ff-4416-9430-04f464490a35` in the registered checkout's `issues/verify-runs.jsonl` records the exact reviewed head and tree `3da8633af6c45707e7a84a5adb01f72ef94b27f7`, setup 0, format 0, typecheck 0 and test 0. Its commands match the configured checks, with no filtering or disabled runner configuration.
- `check-format-1794861833468-2033248.log`: Prettier green. `check-typecheck-1794861835828-2033248.log`: `tsc --noEmit` green.
- `check-test-1794861892773-2033248.log`: 1,224 pass, 0 fail, 83 files, on the reviewed head. This run postdates every test, fixture and product change, including the final stand-in parser change.
- Planned command `akrogon run-check --name seat-tests -- bun test tests/seat.test.ts`: `check seat-tests: 0 implementation/check-seat-tests-1794861601934-1239121.log`, 19 pass. Pair merge/env retention/false override prove C1, equals merge proves C2, append placement proves C3, ten refusal cases prove C4, and argv comparisons plus existing non-Claude cases prove C5. The final required suite reruns these cases after the last change.
- `check-seat-tests-1794861299711-1226162.log`: baseline 4 pass, 15 fail. `check-break-alpha-1794861308619-1226736.log` demonstrates the deliberate duplicate-flag break, including expected length 1 versus received length 2. Tests therefore distinguish the new behavior from both the old implementation and an incorrect second-settings implementation.
- `check hc-start: 0 implementation/check-hc-start-1794861769932-1768911.log`, 7 pass, after the final fixture fix. The real hc launch test retains its existing assertions for one disallowed-tools suffix, task-last placement and unchanged task delivery.
- `check docs-links: 0 implementation/check-docs-links-1794861603883-1239717.log`, 12 pass.

No proof-command correction occurred. Planned cases and existing assertions remain active. Assertions check parsed settings and actual argv properties. Error assertions check the harness and offending operand, not prose wording.

## Prior red-run judgment

Read the failure evidence in `check-test-1794861671480-1240094.log`. The Claude launch failure has a direct cause in the new appended pair: the old stand-in treated its JSON value as the positional task. Commit `994e2f99` consumes this option's value without weakening the task assertion. Its focused and final-suite green runs prove the repair.

The other failure, `next.test.ts`'s existing-scratch scenario, has no plausible cause in these four changed files: it exercises the fake harness and unchanged scratch handling. `check-stale-tmp-1794861696549-1506391.log` passes the focused retry. More decisively, the unchanged-head full-scope retry `check-test-full-1794861758692-1507433.log` passes that same case and fails only the independently explained Claude fixture case. Accept the report's inconsistent classification. The final required suite is wholly green. No known-red exemption or base-red filing is used.

## Test-Change trailers

Listed from `f10a5647fd8223a3355cf01979d9e20256f2d3d9..HEAD`. Both changed test paths match `src/test-files.ts` through their `tests` segment.

1. T1, `a7e928f597c7f645861bc4055a533c7a8f887f41`:
   `Test-Change: tests/seat.test.ts brief criteria 1-5; claude lines gain --settings merge (pair and equals spellings, explicit false overridden, keys kept), no-settings append placement, nine refusal shapes naming harness and operand, and unchanged non-settings elements; globalConfig takes per-harness template overrides`
   Accepted. The cited brief outcomes require these additions and the override helper. Existing assertions remain. The trailer says nine refusal shapes; the committed table actually contains ten, with no verification consequence.
2. T2, `035a28483f6a6db91f13f23c318c0a4328deec1c`:
   `Test-Change: tests/seat.test.ts formatting only by prettier --write; no test expectation changed`
   Accepted. The diff wraps the newly added cases without changing expectations. Later focused and full-suite runs cover the formatted file.
3. T3, `994e2f997c3728e5b2381b81566a618f80140c01`:
   `Test-Change: tests/stand-in.sh the appended claude --settings pair left its JSON as the first positional, so the stand-in logged it as the task and the hc-start disallowed flag's task assertion failed; consume it like --effort`
   Accepted. The cited real launch failure and its logged JSON-as-task output establish the fixture mismatch. Only option consumption changes. The original integration assertions remain and pass afterward.

## Bounds and limits

Readiness has no grants, inputs, producers or retained resources. Implementation logs and leaf timing entries show local checks, not a paid model or outside proof. No covered launch or count bound applies to this review. The existing charting proof, explicitly reused by the design, supplies Claude Code 2.1.325's interpretation of the flag. This review claims argv construction and the stated launch wiring, within the design's exclusions for startup dialogs, later harness versions and other excluded surfaces. No reusable Nit remains to record.
