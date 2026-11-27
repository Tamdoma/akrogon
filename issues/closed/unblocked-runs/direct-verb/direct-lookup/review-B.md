# Slot B review

Verdict `fix`. Base `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`, reviewed head `364d4e696223e8c7b16ae6299f6db093d32e1518`.

## Fix

- F1. `docs/reference-index.md:3` still says every hc call outside the initial `akrogon direct` lookup uses the repo session. A chart door running outside that session can now create or rebind a direct leaf there, as the two-core rerun in `tests/direct-create.test.ts:373` shows. Later `akrogon next` observes and broadcasts to those same terminals through the stored sessions (`src/next.ts:274`, `src/next.ts:1515`, `src/next.ts:1551`). The current index sends a reader diagnosing that broadcast to the repo session, where the same address can name a different terminal. Brief criterion 4 requires the index to drop the blanket repo-session claim. Describe the scope of repo-session calls and the stored-session routing for direct leaves, keeping the caller's `HC_SESSION` for initial lookup and reruns.

## Verification

- C1–C3 pass on the reviewed head. The committed CLI tests cover both seats with duplicate addresses, rebinding from the other session, four pre-write refusals and plain files beside owners during create and closed-leaf rerun. Both seat lookups precede the first state, branch or worktree write. `issues/open` and `issues/closed` both use `issueFolders`, retaining open drafts and closed leaves with state. The implementation reuses the existing hc and directory helpers and preserves the stored seat shape.
- `akrogon verify` receipt `99ac7c9d-6a2c-47a7-82fa-65708074216a` in `issues/verify-runs.jsonl` names this exact base and head. Setup, format, typecheck and test all exited 0. `implementation/check-test-1795648584989-2541872.log` shows 1,549 full-suite passes and 135 passes across five repeats of both changed files. No planned test or runner input was skipped or changed by implementation. The focused logs `implementation/check-c1-c2-c3-1795648452559-2538377.log` and `implementation/check-land-1795648454700-2540427.log` cover the same cases and the replacement-reviewer regression.
- The red logs named under C1–C3 in `plan.md` show the old two-session refusal, ENOTDIR on a plain owner sibling, and failures after substituting the repo session, bypassing reviewer liveness or checking it after worktree creation. The configured test receipt and focused runs postdate the last source and test changes.
- C4 passes in `src/AREA.md` and `docs/reference/commands.md`. Both describe the caller's `HC_SESSION`. The old exact-one-session claim is gone from all three files. The AREA path listing resolved all concrete paths in the worktree or the registered issue tree, including the generated timing and verify logs. The index's Command link resolves to the AREA page. The index routing claim remains F1.

## Test-Change trailers

Both trailers are in `b862819a5a7ace4579ba61ae9907e21b8f5ad808`. Both paths match `src/test-files.ts` and their versions match the frozen planning record.

- `Test-Change: tests/direct-create.test.ts direct-lookup brief criteria 1-3 add two-session resolution, HC_SESSION and cross-session refusals and plain-file owner walk cases; the two-session reviewer refusal is deleted because an address live in two sessions now resolves to the caller's.` Supported by brief criteria 1–3. Criterion 1 reverses the old refusal and the replacement checks both seat refs on create and rerun.
- `Test-Change: tests/direct-land.test.ts direct-lookup brief criterion 1 passes HC_SESSION on its akrogon direct call, which now resolves seats in that session.` Supported by criterion 1 and design Q2. The fixture now supplies the requested session and retains the broadcast cleanup assertions.

## Check repair, 2026-11-26

F1 repaired in `fc71ce1782ce3fac6fff326dd3cc210ff4a3a726` for brief criterion 4. A's review had no Fixes on `364d4e69`.

- Before, the index said “every hc call pins `HC_SESSION` to the resolved repo session, except direct's seat lookup”.
- After, it says “Lifecycle seats use the resolved repo session. `akrogon direct` checks both seats in the caller's `HC_SESSION`. Later checks and broadcasts for direct seats use the sessions stored in their seat refs.” The call sites in `src/direct.ts` and `src/next.ts` confirm each route. The index link resolves to `src/AREA.md`, and all three criterion 4 pages describe the caller's session.
- The commit touches only `docs/reference-index.md`. The C1–C3 proof inputs are identical to the reviewed head.
- `akrogon verify` passed on `fc71ce17` with receipt `612eac1e-0551-40b5-a116-f8883e7b5bfa`. Setup, format and typecheck exited 0. `implementation/check-test-1795648952155-3318217.log` records 1,549 full-suite passes and 135 passes across five repeats of the changed test files.
