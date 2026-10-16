# Review B: agent-worktrees

Verdict: fix

Base: `c7c4ef896645773f2b7b661f3e89908f279d99ba`  
Reviewed head: `3c5cebc8fb5a65069af88fc328d10cac0a0d645e`

Initial blind review. Debate is disabled, so no positions/rebuttal artifacts apply. No peer review was read. No code or tests were changed.

## Fixes

### F1: Failed removal loses the registration and original lock

Location: `src/reconcile.ts:568-574`, `tests/reconcile.test.ts:1378`.

Realistic source: `akrogon next --all` encounters an otherwise eligible ended Claude worktree whose parent directory is not writable. Filesystem permissions are the failure source explicitly named by plan T6b. Git can delete its contents and unregister it before failing to remove the directory with `Permission denied`. The subsequent `git worktree lock` cannot lock an unregistered worktree, and its failure is ignored.

Observed consequence: reconcile returns success with a kept path, but the remaining directory is absent from `git worktree list --porcelain` and has no original lock. This violates the design's binding avoidance requirement to restore the original lock and leave a failed removal as found. The implementation report acknowledges this behavior as a limitation, but the locked design does not permit that exception. `src/AREA.md` also promises re-locking on failure.

Reproduction used existing `fixture`, `fakeHerdr`, `cli` and real git, without mocks: create `.claude/worktrees/agent-failed` on a new branch at main, lock with `claude agent agent-failed (pid 4194303 start 0)`, chmod its parent to `0555`, invoke `cli(f, ['next', '--all'], f.root, fakeHerdr(f).env)`, restore parent permissions, then inspect the directory, porcelain listing and reconcile report. The directory remains, only main is listed, and the report records `failed to delete ... Permission denied`. An assertion requiring the original registered lock fails. Fixture cleanup ran in `finally`; the temporary probe was deleted.

Evidence, read back with `akrogon log`:

`check review-b-relock-contract: 1 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-review-b-relock-contract-1792134466282-3864956.log`

Repair the post-unlock failure behavior and prove the planned removal-failure scenario. The current T6 test makes the Git administration directory unwritable, so **unlock itself fails**. It never reaches removal or the re-lock block and cannot catch this defect. Do not treat this as an unrelated baseline failure: the new unlock/remove/re-lock path introduces it.

### F2: The deliberate-break proof predates the final test-helper change

The report cites `check impl-deliberate-break: 1 .../check-impl-deliberate-break-1792133784150-2038648.log`. Its live-owner assertion failed as intended, but this run precedes commit `3c5cebc`, which changes `agentWorktree`, a helper that this test calls. The green final tests are current, but the plan/design's deliberate-break evidence is not current under the check-review test-proof rule. Rerun the planned deliberate-break proof against the final test/helper version and record the failing assertion and restored green result. This requires no new test machinery.

## Verification

The implementation ran the planned reconcile test file and the configured full check set after the final test changes. The verify receipt matches the reviewed SHA and tree, with setup, format, test and typecheck all exiting zero. No planned test or runner was skipped, filtered or disabled in the diff.

- `check impl-reconcile-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-impl-reconcile-tests-1792134174229-3147360.log`: 45 pass, 0 fail.
- Format: `/home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-format-1792134179542-3171679.log`: all matched files pass.
- Test: `/home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-test-1792134337149-3171679.log`: 993 pass, 0 fail.
- Typecheck: `/home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-typecheck-1792134341749-3171679.log`: exit zero.

All cited logs were read through `akrogon log`. Receipt inspection:

`check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-review-b-receipt-1792134466377-3865302.log`

The current tests exercise removal, branch deletion/report head, live/recycled owner, keep matrix, pane/process vetoes, ignored files and branch-ref deletion errors. F1 identifies the missing planned failure outcome. Bound branch deletion uses the expected-old SHA as designed.

## Documentation and area paths

Opened the changed behavior's README paragraph, `src/AREA.md`, `docs/reference-index.md` and the relevant next-command guide. The README describes the new rule. The area's unconditional re-lock claim is contradicted by F1. One repository-root command listed every source/test/doc path named by `src/AREA.md`; all exist:

`check review-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-review-b-area-paths-1792134438269-3846548.log`

## Test-Change trailers

`src/test-files.ts` matches `tests/reconcile.test.ts`. The reviewed range contains these trailers:

- `0ed7a05`: `Test-Change: tests/reconcile.test.ts plan.synthesis added the six agent-worktree criterion tests`. Source is the brief/design's six criteria. This adds tests and does not remove existing regression expectations.
- `3c5cebc`: `Test-Change: tests/reconcile.test.ts default helper lock to the claude form, bare lock needs an explicit lock call; land commits through git push so the pass's fetch keeps them on the tracking ref`. Real sources are Git's bare-lock representation and `src/next.ts` fetching origin before reconcile. Inspection confirms the fixture corrections preserve the intended keep/removal assertions and explicitly retain the bare-lock case.

## Operator actions

None. No reusable Nits recorded.

## 2026-10-16 check.repair

Reviewed both initial reviews against unchanged head `3c5cebc8fb5a65069af88fc328d10cac0a0d645e` and base `c7c4ef896645773f2b7b661f3e89908f279d99ba`. No code, tests, design, or plan were edited, and no repair commits were made. All open Fixes meet a check.repair handoff exception below. No operator action is open.

### Removal-contract assessment

F1 is a conflict in the locked removal contract, not missing proof machinery. The design mandates unlock followed by non-force `git worktree remove`, then restoring the original lock on failure so the worktree is left as found. The existing real-Git failure trace proves that this exact operation can unregister the worktree before reporting failure. Re-locking cannot operate on that registration after it is gone. Reconstructing a checkout is not restoration of its original state, especially when ignored files are explicitly allowed by criterion 5. A permission precheck would avoid one cause but would not make Git's destructive operation atomic or meet the all-failure guarantee.

Resolving this requires an explicit decision on the failure guarantee or a change to the prescribed removal protocol. B cannot silently weaken that guarantee, replace it with best effort, or invent a different transactional removal workflow. A should resolve the locked decision and implement/prove its resulting failure behavior. The original F1 remains open.

Read-back evidence:

`check review-b-relock-contract: 1 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-review-b-relock-contract-1792134466282-3864956.log`

Current implementation/design/plan inspection:

`check repair-b-inspect: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-repair-b-inspect-1792134695285-4006456.log`

Both logs were read with `akrogon log`. `akrogon verify` reused green receipt `e7586110-7398-45e3-bbc0-ec1b974a31f4`, tree `0d778d3c7f90c57baec9649f8901a972c6b9c7fa`. This is the existing current-head check evidence, not proof that the open findings are fixed. No done-criterion inputs changed, so no criterion reruns were required in this pass.

### Handed to A

- **F1:** locked-design-decision exception. Resolve the mandatory leave-as-found/re-lock guarantee against Git's demonstrated partial removal, then implement and prove the chosen behavior using the existing real-repo fixtures. The planned parent-permission failure must be addressed explicitly, not replaced with an unlock-only failure.
- **F2:** missing-recording exception. The existing `bun test tests/reconcile.test.ts -t 'live lock owner'` runner/helper can record the plan/design's deliberate break on the final test/helper version, followed by the restored green run. No machinery is absent.
- **A-F1 (review-A.md Fix 1):** missing-case exception, criteria 1/3. Add the lock-ID mismatch case with existing `agentWorktree`/`agentLockText` and `bun test tests/reconcile.test.ts -t 'failing one check'`, proving the mismatched lock stays unchanged. No machinery is absent.

The check-issue skill explicitly reserves locked brief/design changes for A and routes missing cases/captures/recordings in existing proof machinery to A. No independently repairable B Fix remains. Requested destination: `check.fix`.

## 2026-10-16 re-check after check.fix

Verdict: **fix**. F1 remains open. F2 and A-F1 are closed.

Prior reviewed base: `c7c4ef896645773f2b7b661f3e89908f279d99ba`  
Prior reviewed head: `3c5cebc8fb5a65069af88fc328d10cac0a0d645e`  
Handed-off base: unchanged, `c7c4ef896645773f2b7b661f3e89908f279d99ba`  
Reviewed repair head: `76e84b0fab8febc1912864af2e9e853b76ca98d0`

Scope was the repair diff `3c5cebc..76e84b0`, the appended plan note, and the report's repair evidence. The report records no moved refresh base/head, and the repair range contains one test-only commit. No main commits or initial implementation were re-reviewed. Worktree is clean.

### F1 remains: the repair accepts the contract violation

The source and consequence are unchanged: a real eligible Claude agent worktree with an unwritable parent reaches non-force removal, loses its registration, and remains without the original lock after failure. The repair changes no product code. Its new `agent-partial` case in `tests/reconcile.test.ts:1399` now explicitly expects the worktree to disappear from Git's listing, confirming the same defect rather than proving restoration.

The new `plan.md:85` note declares lock restoration best-effort. This weakens the locked design's binding avoidance decision, which still says "on removal failure re-lock with the original reason so the worktree is left as found". Plan T6b also still requires the original registered lock after the parent-permission failure. A plan note cannot override that binding decision. The new test accurately describes Git's observed behavior, but that behavior still fails the agreed outcome. `src/AREA.md:26` continues to promise re-locking on failure.

Required resolution: meet the existing binding outcome, or obtain an explicit operator decision revising that outcome before accepting the alternative behavior. This is the existing F1, not a newly expanded requirement. The implement-issue Shared context explicitly says "A fix that needs a locked decision changed ends the pass the same way", using its `failed` stop with the decision named. Its check.fix plan-correction rule also says "the brief and the locked design are never weakened". Thus A's implementation note is not authority to close F1. No operator grant or decision accepting this weaker failure behavior is recorded.

### Closed findings

- **F2 closed:** the current live-owner deliberate break fails at the expected keep assertion, followed by the restored full reconcile run passing. `check fix-break-owner: 1 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-fix-break-owner-1792134823395-4186338.log`.
- **A-F1 closed:** the matrix now includes a mismatched agent ID. Disabling the ID guard makes its existence assertion fail, and the restored run passes. `check fix-break-id: 1 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-fix-break-id-1792134823705-4186765.log`.

### Current verification and trailer

`check fix-reconcile-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-fix-reconcile-tests-1792134840971-3592.log`: 45 pass, 0 fail after the final test changes and restored product guards.

Verify receipt `7262b861-0276-4703-84eb-42a586383bf1` matches the reviewed repair head and tree `4cbbd000f5fb601d5f9771c14aebc9e0506dbf29`. Setup, format, test and typecheck exited zero. Read the recorded format/typecheck logs and the full-test summary: 993 pass, 0 fail. No check runner or configuration changed. Existing evidence suffices, so no redundant rerun was performed. All cited logs were read through `akrogon log`.

Repair commit `76e84b0` carries `Test-Change: tests/reconcile.test.ts check.fix added the mismatched-id lock case and the parent-permission removal-failure case; no existing expectation changed`. It adds cases and retains prior assertions. The mismatch case satisfies the handed-off criterion. The partial-removal case does not close F1 for the reasons above.

Inspection evidence, also read back through `akrogon log`:

`check recheck-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-recheck-b-diff-1792135029696-548366.log`

`check recheck-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-recheck-b-receipt-1792135038707-552768.log`

No AREA file changed in the repair. No new Nits or operator-only credential/live-action findings were added. Requested destination: `check.repair` for the remaining F1.

## 2026-10-16 check.repair, remaining F1

Head remains `76e84b0fab8febc1912864af2e9e853b76ca98d0`, base `c7c4ef896645773f2b7b661f3e89908f279d99ba`. Worktree is clean. Read the latest re-check entry as this pass's input. F2 and A-F1 remain closed and must not be repeated.

No repair commits or code/test/design/plan edits. F1 still meets the locked-design-decision exception, and correcting the new partial-removal test's accepted outcome also meets the test-expectation exception. Neither is B's repair scope. The earlier attempt missed because it redefined the required result in a plan note and asserted Git's existing failed behavior, without resolving the binding decision. The same shared post-unlock failure block is unchanged; no additional implementation of this agent-removal path was introduced. Existing real-Git failure evidence and current green checks remain applicable, so no repeated proof or full check run was needed.

Disposition evidence, read back through `akrogon log`:

`check repair-b-f1-disposition: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-repair-b-f1-disposition-1792135109193-585115.log`

### Handed to A

- **F1 only:** locked-design-decision and test-expectation exceptions. The required original registered lock after removal failure remains unmet. Do not close it through the existing plan caveat or the test expecting lost registration. If resolution requires changing the binding avoidance decision, follow implement-issue Shared context's explicit locked-decision `failed` stop, naming the decision and exact operator action needed. Do not return another green-only test/report handoff with the same unresolved guarantee. If a repair satisfies the unchanged contract, correct the expectation with its real source, prove fail-before/pass-after, and rerun the affected criteria/checks.

No independently repairable B Fix remains. Requested destination: `check.fix`.

## 2026-10-16 final re-check after operator decision

Verdict: **ready**. This entry supersedes the earlier open F1 verdicts.

Prior reviewed head: `76e84b0fab8febc1912864af2e9e853b76ca98d0`  
Reviewed repair head: `4088a91ad3015c346dc56a9fd485827033e1c507`  
Prior and handed-off base: `c7c4ef896645773f2b7b661f3e89908f279d99ba`, unchanged.

Reviewed only `76e84b0..4088a91` plus the revised authoritative design, plan note and repair report. The branch contains one documentation repair commit, no changed product/test code and no refresh moving the base. Worktree is clean.

**F1 closed:** design.md now expressly accepts partial removal: a proven worktree is disposable, a still-registered worktree is re-locked on failure, and an already-unregistered leftover carries the removal error as a kept entry. The implementation report records the operator's revision after the locked-decision blocker. This resolves the prior contract conflict. `src/AREA.md` now describes that same conditional restoration behavior. The existing real-Git `agent-partial` case covers the accepted unregistered-directory outcome. F2 and A-F1 remain closed, with no test/helper changes since their accepted evidence.

No new defects, Nits or operator actions remain. No new `Test-Change` trailer is required or present in the documentation-only repair range. Prior trailers remain assessed in the earlier entries.

### Verification

Read the updated behavior documentation and listed all source/test/doc paths named by the changed `src/AREA.md` in one repository-root command. Every path exists.

`check recheck2-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-recheck2-b-area-paths-1792137808702-2451431.log`

Diff, design and receipt inspection:

`check recheck2-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-recheck2-b-diff-1792137799642-2447049.log`

Current planned reconcile proof:

`check fix2-reconcile: 0 /home/ivan/Work/infra/akrogon/issues/open/leftover-worktrees/agent-worktrees/implementation/check-fix2-reconcile-1792137612967-1903122.log`: 45 pass, 0 fail.

Verify receipt `24f3086b-3b38-451e-97b7-3a19939d593f` matches reviewed head `4088a91` and tree `b2bf1b7eef12e537b6f36641c4cc215002fdcda4`. Setup and all required checks pass:

- Format: `implementation/check-format-1792137619152-1928857.log`, exit 0.
- Tests: `implementation/check-test-1792137772477-1928857.log`, 993 pass, 0 fail.
- Typecheck: `implementation/check-typecheck-1792137774653-1928857.log`, exit 0.

All cited logs were read through `akrogon log`. No runner, test, helper, fixture, config or lockfile changed in this repair. Existing current-head evidence is sufficient, so no redundant reruns were made. Requested destination: `merge`.

## 2026-10-16 merge attempt e1d52ad8-185a-4b3e-9c50-d2e3f448ce68

Applied memberless top and clean HEAD: `4088a91ad3015c346dc56a9fd485827033e1c507`. No fetch, rebase or repair was performed by B.

`akrogon verify --attempt e1d52ad8-185a-4b3e-9c50-d2e3f448ce68` reused green receipt `24f3086b-3b38-451e-97b7-3a19939d593f`, tree `b2bf1b7eef12e537b6f36641c4cc215002fdcda4`. Format and typecheck exit 0; full suite 993 pass, 0 fail. Read each listed check log through `akrogon log` again. No merge checks or advisories are configured. Completion context gathered from the agent-worktrees leaf brief; this is the sole leaf brief under leftover-worktrees.
