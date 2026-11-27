# setup-before-seat review B

2026-11-25, initial check.review. Verdict **fix**.

Reviewed base 646819159203d8ba256d0990f85fd17b44c1bd78 and head cc92e145a5b1a715dacf712d9551acfbe4f03bc6. Target origin/main was 011d47575accb875bdf898f5b52f67d016a1120f, with the reviewed base as its merge base with HEAD.

## Fixes

- **F1 (C4)** Capacity masks the busy outcome when the leaf has a live run-check and no live seat. In a registered fixture repo at max_active 1, I started a leaf-scoped run-check, retired that leaf's idle seat, filled capacity with a sibling and changed setup so it was due. The next dispatch recorded one capacity wait. The manual seat command refused for capacity and omitted the live run ID. src/next.ts:683 returns before the live-run check at line 685. C4 requires no capacity wait and a refusal naming the run. The existing live-run test keeps a live idle seat and skips the capacity check. The repair needs proof with the seat absent and capacity full. [CLI evidence](implementation/check-review-b-setup-edge-cases-1795613403968-3560276.log)
- **F2 (C1)** A valid pass_env entry can forward CLAUDECODE into setup. src/config.ts:110 reserves AKROGON_RUN, while CLAUDECODE is accepted by the schema. src/run-check.ts:84 explicitly copies configured names and src/next.ts:486 passes that environment verbatim. A dispatch with CLAUDECODE present in the caller and named in pass_env recorded run=unset and cc=1 in the child. C1 requires both variables absent. The existing proof uses the default pass_env. Keep the locked check-side environment behavior and prove dispatch also excludes the flag with that valid config. [CLI evidence](implementation/check-review-b-setup-guard-and-env-1795613473792-3565469.log)
- **F3 (C5)** The per-leaf guard failure report omits the guard's exit code. A registered fixture ran a successful Bun install in a nested project while the root package still lacked node_modules. The own-modules command returned 1. The next command also returned 1, but its per-leaf JSON contained only the guard message because src/next.ts:490 throws a plain Error. The pass exit is aggregate, so it gives no exit code for the individual failed guard. C5 requires the report to name the leaf, exit code and output. The existing guard test asserts only the pass exit and the diagnostic. [CLI evidence](implementation/check-review-b-setup-guard-and-env-1795613473792-3565469.log)

## Verification

- Receipt 5fd551e7-88cc-4878-b697-00094ae0681e matches the reviewed tree 1ddd092de8a5029482622de11e67c2f874a16b8c. Setup, format, typecheck and test exited 0. The test log has 1,477 suite passes and 60 changed-file rerun passes. The test runner, command scope and configuration are unchanged. [Test log](implementation/check-test-1795613191394-3087145.log)
- The implementation report uses the planned Bun invocations, with different run-check labels only. I read back the current-head logs showing 7 dispatch tests and 5 busy tests green, and the planning logs showing the base and deliberate-break failures. The first exploratory run proved F1 and its separate guard probe did not reach the guard because Bun created node_modules. The follow-up used the nested install and verified F2 and F3. These free probes used isolated fixture repos and stand-in seats. [Dispatch proof](implementation/check-fix1-dispatch-1795612913251-2953643.log) [Busy proof](implementation/check-fix1-busy-1795612934257-2965698.log)
- C7. Checked the live setup documentation in docs/reference/config.md, docs/reference/checks.md and src/AREA.md. The three describe setup before seat work once per checkout state. The live path listing for src/AREA.md and tests/AREA.md resolved every new reference and the documented hc test glob. The missing tests/budget.test.ts reference is already present at the base and unrelated to this change. Docs link and command-reference tests passed. [Docs proof](implementation/check-u2-docslinks-1795611455083-2055718.log)
- C8. The active lesson line is removed and its history ends with the Applied entry. The cited line 478 bears the setup invocation in 0e6595b4 and is the start of its try block in the reviewed head. Dispatch and broadcast share allocate with the seat command, so delivery follows a successful setup when it is due. The move path invalidates the marker before reset.

## Test-Change trailers

- 44c72f78 — "Test-Change: tests/setup-dispatch.test.ts tests/setup-busy.test.ts tests/setup-fixture.ts new proofs for the setup-before-seat done-criteria 1-6 at the CLI boundary". The three files are additions. The cited criteria match their proof scope and the existing gaps above.
- 44c72f78 — "Test-Change: tests/AREA.md one line for the new setup test files". The index names the three added files and they resolve.
- d091d8ee — "Test-Change: tests/setup-dispatch.test.ts prettier line-collapsing only, no expectation changed". Its diff only reflows assertions.
- d091d8ee — "Test-Change: tests/setup-fixture.ts prettier line-breaking only, no helper behavior changed". Its diff only reflows the call chain in setupMarkerPath.

## 2026-11-25 check.repair

Reviewed both initial reviews for cc92e145. Slot A recorded three Nits. The three Fixes below each require a product change and a regression proof. The existing proofs pass on the defective head, so the check-issue skill assigns each pair to slot A. No branch edits or proof inputs changed in this pass. The evidence above applies to the handoff head.

### Handed to A

- **F1 (C4)** Pair the allocation fix with a CLI regression where setup is due, the leaf has a live run-check and no live seat, and a sibling fills capacity. Assert no capacity wait and a manual refusal naming the run. The existing live-run case retains a live idle seat and bypasses the capacity check.
- **F2 (C1)** Pair the setup environment fix with a dispatch regression that sets CLAUDECODE in both the caller and the repo's valid pass_env configuration. Assert the setup process receives neither excluded variable. The current proof sends CLAUDECODE in the caller with default pass_env, which never exercises the leak. Keep check-side environment behavior intact.
- **F3 (C5)** Pair the guard reporting fix with a CLI regression that checks the guard's exit code in the per-leaf failure report. The current case only checks the overall command exit and the guard diagnostic.

## 2026-11-25 check.review after check.fix

Verdict **fix**. Prior reviewed base 64681915 and head cc92e145. Rebased handoff base 011d47575accb875bdf898f5b52f67d016a1120f and reviewed head 18840a88cb86054e52adc754d13f58565de7b7fa. I ran git range-diff 64681915..cc92e145 011d4757..18840a88. All five earlier patches matched. The repair consists of 6d8f1ee0 and 18840a88.

- **F1** The original no-live-seat repro now skips a due setup while the run is live at capacity, records no capacity wait and names the run in the manual refusal. See F4 for the regression introduced by the ordering change. [Red before repair](implementation/check-repro-f1-1795614065157-3657415.log)
- **F2** Resolved. The setup spawn removes both flags from the constructed environment. The valid env/pass_env reproduction showed cc=1 before and now sees both flags absent. The check-side constructor and schema are unchanged. [Red before repair](implementation/check-repro-f2-1795614065667-3658384.log)
- **F3** Resolved. The in-process guard refusal carries exit code 1 and the guard diagnostic in the per-leaf report. The strengthened test failed on the old report and passed with the repair. [Red before repair](implementation/check-repro-f3-1795614066114-3658931.log)

### Fix introduced by the repair

- **F4 (C4 and capacity dispatch)** The capacity exception now calls ensureWorktree before deciding whether to wait. In src/next.ts:700–711, a due setup bypasses the earlier capacity gate when there is a live run or a recorded worktree. I reproduced two consequences with the real CLI in a repo at max_active 1. With a sibling occupying the only slot and a recorded leaf's seat retired, an ordinary wake ran that leaf's newly configured install. The install exited 42, the pass exited 1 and the leaf had zero capacity wait records. The leaf therefore missed the capacity refill queue and will retry the failed install on later wakes while the repo stays full. A second CLI case ran a check from a manually prepared, unallocated worktree with an ordinary uncommitted edit. With setup due and capacity full, dispatch entered first-allocation validation, reported the dirty worktree and exited 1 while the check was still live. C4 requires a quiet busy result; docs/use/run-work.md documents a capacity wait when there is no room. Before this repair, the capacity gate ran before ensureWorktree. Return the due-and-busy outcome without allocating and retain the capacity gate before normal allocation. Prove both the busy result and the capacity wait after the run ends. The F1 test's final assertion currently demands an install while the sibling still holds the only slot. C4 requires setup before an eligible delivery and supplies no basis for that assertion. [CLI evidence](implementation/check-review-b-repair-capacity-1795617930257-1072445.log)

### Verification and Test-Change trailers

- The kept lane run at the repair content passed both planned proof files, with 14 tests. Verified receipt 61b2d4c4-0ccf-4d69-8387-0b4dce5dea02 on tree 5daa691af24e38f98b923aea234f084ad6940ce4. Format, typecheck and tests all exited 0, with 1,480 suite tests and 70 changed-file reruns green. The three red logs above hit their intended assertions. No planned cases or runner configuration were disabled. [Lane proof](implementation/check-lane-u3-1795616413658-585311.log) [Verify test log](implementation/check-test-1795616638914-596910.log)
- 6d8f1ee0 carries Test-Change trailers for tests/setup-busy.test.ts (F1, review-B capacity reproduction) and tests/setup-dispatch.test.ts (F2/F3, review-B environment and guard reproduction). Both cite the actual failures. The capacity test's final assertion exceeds the cited F1 scope as recorded in F4. The earlier trailers retain their initial review judgments because range-diff matched those patches. The repair touches no AREA.md files.

## 2026-11-25 check.repair at 18840a88

F4 is a new regression from 18840a88. F1's original busy-with-capacity assertions now pass. The same test's final assertion requires an install before capacity frees, so it would fail on the correct allocation order. Neither of F4's two CLI scenarios is covered by an unchanged proof. The check-issue skill assigns the coupled product and proof changes to A. This pass changed only the handoff record and reused the review evidence.

### Handed to A

- **F4 (C4 and capacity dispatch)** Pair the allocation repair with the corrected capacity proof and a regression for the dirty, unallocated worktree. Return the due-and-busy outcome before worktree allocation and preserve the ordinary capacity gate before setup. Keep the F1 assertions while the run is live. After it ends with capacity still full, require no setup and a capacity wait. Free the sibling slot, then prove setup precedes delivery. In the dirty-worktree case, keep the live check and require a quiet busy result. Cite C4, the capacity contract in docs/use/run-work.md and the two observed failures in the Test-Change trailer. [CLI evidence](implementation/check-review-b-repair-capacity-1795617930257-1072445.log)

## 2026-11-25 check.review after check.fix 2

Verdict **ready**. Base 011d47575accb875bdf898f5b52f67d016a1120f. Reviewed 18840a88..4a1f34078029c43be2309fcb96e570202366ea02, covering test commit 11d0fc85 and product commit 4a1f3407. The base did not move.

- **F4 resolved.** Allocation returns a due-and-busy result before capacity or worktree validation, including with a dirty unallocated worktree. After the run ends, a full repo records a capacity wait and leaves setup pending. Once a slot frees, setup runs before delivery. The corrected capacity test failed on the extra setup call before the repair, and the new dirty-worktree test failed on exit 1. Both pass on the repaired head. The corrected proof retains F1's quiet wait and its run ID assertion. F2 and F3 also pass in the dispatch file. [Capacity red](implementation/check-repro-f4a-1795618151256-1461749.log) [Dirty worktree red](implementation/check-repro-f4b-1795618151659-1462658.log) [Repaired proofs](implementation/check-lane-u4-1795618551467-1531025.log)
- The 11d0fc85 Test-Change trailer names tests/setup-busy.test.ts and cites F4, C4, docs/use/run-work.md and the recorded CLI reproductions. Those sources support replacing the full-capacity install expectation and adding the dirty-worktree case. The existing cases still run. The repair restores the documented capacity behavior and touches no AREA.md files.
- Verified receipt a4192191-374b-4c1e-81b6-c0655c088f17 for tree 7af4059189af26b3738714b8334f3f597f6b6e1a. Setup, format, typecheck and test exited 0. The kept proof logs contain all 15 dispatch and busy cases after the final input change. The full verification passed 1,481 tests and 75 changed-file reruns. [Verify test log](implementation/check-test-1795618778400-1539694.log)
