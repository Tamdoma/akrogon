# Slot B review: verify-pass-service

Date: 2026-10-27
Phase: check.review
Base: c93f42239d0c7d6e944e982e5f5b43f60d9ddf72
Reviewed head: e709aace8a65f1662f07c06ba34efb35f9be132e
Verdict: fix

## Fixes

### F1. Preserve AKROGON_RUN when launching the pass service

Location: src/verify.ts:496-516 (passForwarded / launchPass).

Real source: a user runs `akrogon run-check --name test -- bun <entry> verify` in a leaf whose configured `full` includes `test`. This is the existing supported nested-run CLI contract documented in src/AREA.md and implemented by admission.ts:nested/withAdmission.

Trace: checkedRun exports its admission token as AKROGON_RUN. launchPass forwards neither that token nor any equivalent; AKROGON_SCOPE only preserves ownership. Inside the new service, withAdmission cannot identify its live full parent, so the pass's full test check waits behind that parent. The parent waits for verify to finish. Neither can progress.

Observed with real systemd: the same fixture repo had one live test record and a second waiting test record, and its trivial inner touch command never ran. Stopping pass 43012718-23bd-438b-9059-5d040e961f00 released the outer call with code 1.

Consequence today: verify invoked through an admitted full run-check deadlocks. This violates design's unchanged admission semantics and plan D6's explicit AKROGON_RUN forwarding requirement. Preserve the existing token across the service boundary and add a reproduction at the real CLI/systemd boundary.

Evidence: `check review-B-cli-proofs: 0 implementation/check-review-B-cli-proofs-1793090498751-4132989.log` (the proof asserts the observed defect, not product success).

### F2. Join a live pass before applying completed-receipt reuse

Location: src/verify.ts:709-715; runOnce writes receipt end before checkout removal at lines 454-477.

Criterion scenario: C2 requires a matching repeat while the pass is live to join; C3 explicitly includes failures after the receipt is written, such as checkout-removal failure.

Trace: runOnce writes a complete green receipt before removing its checkout and before verifyPassCommand writes status. A repeat during removal returns from greenRun before consulting the live pass registry. It prints only `reuse receipt ...`, returns 0 immediately, and cannot observe a later cleanup failure.

Observed CLI result: starting call exited 1, concurrent repeat exited 0 and printed `reuse receipt 1cd185fb-1706-4191-b7e1-516a797183c1 ...`. The fixture used the existing synchronous systemd seam and a git wrapper that delayed worktree removal and returned failure. This represents C3's explicitly named post-receipt failure, with the delay exposing C2's live interval.

Consequence today: a matching repeat reports success while the same live pass ultimately fails, and omits its pass/command output. Check for the matching live pass before receipt reuse, retaining the existing completed-receipt gates. Cover this interval with a regression.

Evidence: `check review-B-cli-proofs: 0 implementation/check-review-B-cli-proofs-1793090498751-4132989.log`.

### F3. Prove that a different tree starts its own pass while the first is live

Location: tests/run-units.test.ts:818-835; implementation/report.md C2 proof claim.

Criterion: C2's differing-key outcome and plan's condition trace require a different-tree call while a pass is live. The test waits for joined.result, first.result and other.result before committing t2 and starting the different-tree call. At that point no original pass is live, so removing the tree comparison in samePass would still satisfy this test.

Consequence today: the report's changed-tree claim does not prove the locked outcome. Keep the original pass live for the changed-tree call and show that omitting the tree comparison turns that case red. This is a missing case using the existing runner and helpers, not missing proof machinery. Hand this proof correction to A under the skill's repair split.

Evidence: reviewed test diff and the kept configured test output, which shows the current case green but cannot establish concurrent tree separation.

## Verification and scope

Read brief, design, complete plan, report, ponytail and lesson rule. Reviewed the whole base-to-head diff blind, including receipt consumers, land's verify call, admission, stop-run, environment construction and reconcile. No code changes or commits were made.

The configured verify receipt 7550f03a-75ef-49ed-b2be-5b06a5a3e8b6 ran on de163ee86b80b31225bdf8376dff8296a08d8ac3 with tree 938770f686873e62b784f7c2ac2d8f2713d97be4, identical to reviewed HEAD. Therefore it includes the latest receipt-helper changes despite the later trailer-only amend. Its setup, format, test and typecheck exits are all 0. Read the saved logs with akrogon log:
- `implementation/check-format-1793090135344-3803992.log`: formatting passed.
- `implementation/check-test-1793090201636-3803992.log`: configured `bun test --timeout=30000 --parallel=4 --no-isolate`, 1217 pass, 0 fail, including all newly added real-unit cases.
- `implementation/check-typecheck-1793090204100-3803992.log`: tsc passed.

No configured check or runner setting was removed, filtered or disabled. No full-suite rerun was needed. F1/F2 are specific concerns not caught by that suite; F3 identifies a missing planned case. Report's standalone proof rows do not supply separate kept command receipts, so the configured verify logs are the current green evidence used here.

Additional kept evidence, all read back with akrogon log:
- `check review-B-receipt: 0 implementation/check-review-B-receipt-1793090520166-4135756.log`: exact receipt, tree and head comparison.
- `check review-B-context: 0 implementation/check-review-B-context-1793090321046-4113170.log`: clean worktree, commit/trailer inventory.
- `check review-B-area-paths: 0 implementation/check-review-B-area-paths-1793090422235-4124670.log`: one repository-root command lists every concrete repository path named by changed src/AREA.md; all 28 exist. Bare package.json and reconcile-host.json mentions describe runtime/config basenames, not src pointers.
- `check review-B-cleanup-readback: 0 implementation/check-review-B-cleanup-readback-1793090588001-4143440.log`: exact proof pass service and test slice both inactive after cleanup.

Replay the isolated scenarios using `akrogon run-check --name review-B-cli-proofs -- bun <leaf>/review-B-proof.ts`, after the configured locked setup. The retained proof asserts the defects and will need its expectations changed or cases separated when validating repairs. Fixture repos and temporary files were removed, the exact pass was stopped by stop-run, and systemctl authenticated read-back confirmed its service and slice inactive. No external account or paid action was used.

## Documentation

Opened docs/reference/commands.md through docs/reference-index.md and read changed verify, verify-pass and stop-run rows against the code. The service, pass id, scope-owned stop and normal join path are documented. F2 is also where the documented live-join/exit claim fails. src/AREA.md includes the pass service, carrier, status and reconcile sweep. No unrelated dead pointer or documentation finding.

## Test-Change trailers

Target range: c93f42239d0c7d6e944e982e5f5b43f60d9ddf72..e709aace8a65f1662f07c06ba34efb35f9be132e. Applied src/test-files.ts's path rule.

05532cdc14fdb8b819faec8e78cf56e3b1a225aa:
- `tests/verify.test.ts`: deleted caller-bound killed-setup expectation under design binding decision 7; added post-receipt-failure case. Source accepted.
- `tests/run-units.test.ts`: added survival/join/stop/scope cases and raised run-line count for the newly required pass line. Brief C1-C5 supplies the source. Accepted subject to F3.
- `tests/command-reference.test.ts`: added internal verify-pass dispatch contract. Plan D1 supplies the source. Accepted.
- `tests/fake-systemd-run.sh`: executes verify-pass payload in the existing seam. Plan D8 supplies the source. Accepted.

e709aace8a65f1662f07c06ba34efb35f9be132e:
- `tests/run-units.test.ts`: receipt lookup added in 05532cdc now filters the shared ledger by caller slug. Existing shared-fixture receipts are the real source of the helper error. It preserves the asserted outcomes. Accepted.

a45c3e006c67989c9af3e12e13abba552b16e207 changes no test-file-matched path and requires no trailer.

## Nits and operator actions

None. No lesson removal is in the diff. No reusable Nit or new lesson is recorded during this fix verdict.

## 2026-10-27 check.repair (B)

Repair base: e709aace8a65f1662f07c06ba34efb35f9be132e.
Committed repair head: d4494b3047d08d838103f59e26c13b135e55a860.
Disposition: F1 and F2 repaired; F3 handed to A.

### Repairs

- **F1:** Forward AKROGON_RUN to the pass service, preserving existing nested admission. Reproduction commit afeedf1 precedes product fix 5e2b010. Commit 7f7b6cf adjusts only that reproduction's fixture inputs to pass its temp-root override through the outer checked command, avoiding environment entries left by earlier shared-fixture tests. The original assertions remain unchanged.
- **F2:** Use the same live-pass matching function both before receipt reuse and when claiming a pass. A repeat waits for the selected pass's status instead of treating its already-written receipt as its final outcome. Reproduction f30ee74 precedes fix f32770e. Commit faa2cba gives that same reproduction a distinct command so F1's prior green receipt cannot bypass the scenario.
- **F2, known-red path:** The same post-receipt error also escaped through known-red coverage after joining. Commit 304e6ec changes the existing reproduction's joiner to --known-red and demonstrates the same wrong 0-versus-2 outcome. Fix d4494b3 preserves pass error status 2 for head and base passes; ordinary red-check status 1 still takes the existing known-red comparison path. This keeps the pass's cleanup outcome separate from its completed command receipts.

Only two reproduction cases were added. No initial test expectation, receipt gate definition, design decision, admission policy, doc or index was changed. Each changed test commit has its own Test-Change trailer citing F1 or F2 and the real CLI source or C2/C3 outcome. Product changes are confined to src/verify.ts; tests to tests/run-units.test.ts. The plan gained one dated Implementation notes line recording live-pass precedence required by C2/C3 and design decision 4.

### Red/green evidence

All cited logs were read back with akrogon log. These are the latest versions of the reproductions, not greens predating their input changes:

- `check repair-B-F1-current-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F1-current-red-1793091144969-20576.log`: current F1 fixture inputs with the carrier forwarding temporarily removed, nested full check waits behind its parent.
- `check repair-B-F1-current-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F1-current-green-1793091145555-20921.log`: same command after restoring forwarding.
- `check repair-B-F2-current-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F2-current-red-1793091260590-30515.log`: distinct-command ordinary joiner with F2's product fix temporarily reversed, repeat exits 0 versus original 2.
- `check repair-B-F2-current-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F2-current-green-1793091261834-30948.log`: same command after restoring F2.
- `check repair-B-F2-known-red-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F2-known-red-red-1793091602806-617307.log`: final reproduction with --known-red before d4494b3, repeat exits 0 versus original 2.
- `check repair-B-F2-known-red-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-F2-known-red-green-1793091612799-635403.log`: same command after d4494b3.

The initial F1 red on the reviewed code and initial F2 red after F1 are also retained as repair-B-F1-red and repair-B-F2-red. Temporary product reversals were restored before committing or running the final proofs.

Two intermediate combined runs exposed faults in B's new reproduction inputs: the shared fixture's environment override, then legitimate reuse of F1's identical command set. Both were corrected in their respective reproduction-only commits, without altering assertions. Their failed logs are check-repair-B-planned-proofs-1793091088586-10179.log and check-repair-B-current-planned-proofs-1793091186766-21504.log. They were caused by this repair's tests, so the unrelated-red retry/known-red procedure does not apply to them.

### Planned proof and full-check disposition

After the last source and test changes, ran the plan's commands with locked setup:
`bun test --timeout=120000 tests/run-units.test.ts` (20 pass) and `bun test tests/verify.test.ts` (49 pass). All A-authored survival, normal join, stop, admission-wait, ownership, receipt-reuse and known-red cases passed on d4494b3. This supplies planned proof B did not write for both product fixes. F3 remains the previously identified missing concurrent tree case.

`check repair-B-current-proofs: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-current-proofs-1793091640259-635854.log`.

Earlier full verify on faa2cba had a 15-second timeout in untouched tests/next.test.ts's “a leaf re-entering merge queues behind the two leaves stamped earlier.” The diff changes neither that test nor its queue/phase implementation; it uses seeded receipts rather than executing the new pass path. One retry of the same configured test command, with the same 30-second runner timeout, parallelism and isolation settings, passed all 1219 tests. Mark that result **inconsistent**, not a product Fix. No timeout or test filtering was changed:
- Red verify test: implementation/check-test-1793091419677-46982.log (1218 pass, 1 timeout).
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-test-1793091568459-328675.log` (1219 pass, 0 fail).

The reproductions use the existing real-systemd runner and fixture cleanup. Their finally blocks release the removal barrier or stop the exact pass id, await the callers, and authenticate pass inactivity through systemctl read-back. The suite's existing afterAll cleans its fixture and test slices. No manual external fixture, paid action, credential or operator action is involved.

### Handed to A

- **F3:** Brief C2, using the existing tests/run-units.test.ts runner and helpers: start the different-tree verify while the original pass remains live, and show that removing samePass's tree comparison turns the case red. The check-issue repair rule assigns a missing proof case in existing machinery to A. No new runner or live authorization is needed.

No operator actions remain. No additional Nits are held by B.

### Final verification

`akrogon verify` on committed head d4494b3047d08d838103f59e26c13b135e55a860 exited 0. Receipt 7e91ab03-8031-45f2-8972-3a9c20538f7c is complete: setup 0, format 0, test 0 (1219 pass, 0 fail), typecheck 0, end present, and its checkout removed. The final run required no retry. Read all three command logs back through akrogon log:

- implementation/check-format-1793091677807-652499.log
- implementation/check-test-1793091761486-652499.log
- implementation/check-typecheck-1793091764717-652499.log

`check repair-B-final-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-repair-B-final-receipt-1793091830329-941646.log` confirms the exact head, receipt, exits, end and checkout absence. The final worktree is clean. Request check.fix for A's F3 proof case.

## 2026-10-27 re-check after check.fix (B)

Verdict: **ready**.

Base: c93f42239d0c7d6e944e982e5f5b43f60d9ddf72.
Prior reviewed head: e709aace8a65f1662f07c06ba34efb35f9be132e.
B's repair handoff: d4494b3047d08d838103f59e26c13b135e55a860.
Reviewed head: 63c20f9859578c179a30dac9c6ab0ac648a6f62b.

Reviewed the repair range from the prior reviewed head and A's single subsequent test commit. A reports no refresh; ancestry and diff agree, so no range-diff is required. No runtime code changed after B's repair handoff.

- **F1 resolved:** AKROGON_RUN forwarding remains in the service launch; the nested full-run reproduction passes in the current configured suite.
- **F2 resolved:** Matching live-pass lookup still precedes receipt reuse, and pass errors remain failures through known-red handling. The cleanup-failure join reproduction passes in the current configured suite.
- **F3 resolved:** The different-tree call now starts before awaiting the original callers. It must create a third receipt and print a pass id distinct from the original. I independently removed only samePass's tree comparison temporarily: the revised case failed with “different tree started no third pass.” After automatic restoration, the identical test command passed with 10 assertions. The worktree is clean and HEAD unchanged.

### Verification

Read the saved current-head format, test and typecheck logs with akrogon log. Receipt 9d890c3b-b6ed-4b84-915b-048df95d0fdf names reviewed HEAD and tree db9fd1fc6ed1f15c7e21dfa66d3b49e42117a00f, with setup 0, format 0, test 0, typecheck 0 and end set. Its checkout is absent. The configured test command is unchanged: bun test --timeout=30000 --parallel=4 --no-isolate, 1219 pass and 0 fail. This run occurred after A's latest test change.

- implementation/check-format-1793092232669-965504.log
- implementation/check-test-1793092293750-965504.log
- implementation/check-typecheck-1793092296040-965504.log

The only additional execution addressed F3's sensitivity evidence. Locked setup ran first; the temporary one-line deliberate break was restored by an EXIT trap. This expected red is not a failure of the committed head and needs no unrelated-red retry.

`check recheck-B-F3-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-recheck-B-F3-red-1793092413639-1261033.log`

`check recheck-B-F3-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-recheck-B-F3-green-1793092436977-1261894.log`

Both use bun test --timeout=120000 tests/run-units.test.ts -t 'a repeat verify joins the live pass'. Logs were read back with akrogon log. Existing fixtures and systemd cleanup completed; no temporary source change, helper or script remains.

`check recheck-B-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-lifetime/verify-pass-service/implementation/check-recheck-B-final-state-1793092466775-1262921.log` confirms clean tracked/staged state, reviewed HEAD, clean diff and removed verification checkout.

### Trailer and documentation audit

New Test-Change trailer in 63c20f9859578c179a30dac9c6ab0ac648a6f62b names tests/run-units.test.ts and cites review B F3 and brief C2. Accepted: moving the different-tree scenario into the live interval and adding the distinct-id assertion directly address that outcome. Changing its fixture sleep from 4 to 6 seconds preserves the overlap; no case, runner setting or planned test was skipped or disabled. Earlier repair trailers remain accepted as recorded above.

Opened docs/reference/commands.md's verify and stop-run rows. No documented behavior changed in A's test-only repair. No AREA.md or lesson file changed in the repair range.

No new Fixes, Nits or operator actions. No reusable Nit is held by B. Request merge.



