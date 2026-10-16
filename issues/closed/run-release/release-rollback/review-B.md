# Review B: release-rollback

Verdict: fix

Base: `6121559ee158f559842715a552248645f05bd026`.
Reviewed head: `f0cb5677d7fdd55d1e29e152d3b4875f974e2820`.
Reviewed tree: `e41f1a32a8622b400066a42a82ec9d2195bd162f`.
Initial blind review. Debate is disabled, so no positions-B.md or rebuttal-B.md exists. No peer review was read. No code was changed or committed.

## Fixes

### F1: Rollback does not make the rolled-away release previous

Source: ordinary deployment of release A, deployment of B, then `akrogon rollback`. `src/rollback.ts:29-34` flips to A and writes the hold but never updates the previous-release record. The CLI probe produced current=A, deploy.commit=B, deploy.previous=A and `rolledAwayIsRecordedPrevious:false`.

Consequence today: current and recorded previous both name A. B is absent from the protected current/previous set that `pruneReleases()` computes, and the previous-release metadata does not describe the rollback transition.

This violates design.md's binding rule, “After rollback, the release it left becomes previous for pruning purposes.” Plan D5's decision to leave the record unchanged cannot override that rule. Preserve the rolled-away release as previous, account for failed-link retries, and make the documented manual path reach the same metadata state. Repair the plan's omission under the skill's implementation-notes rule rather than changing the design.

Evidence: `check review-B-rollback-record: 0 implementation/check-review-B-rollback-record-1792127524017-295898.log`, read back with `akrogon log`. The probe used the existing deploy fixture, real builder, two normal deploy passes and the real rollback CLI. Its temporary file was removed.

### F2: The manual-recovery proof runs this branch's installer instead of the predecessor

Source: criterion 3's broken-current recovery scenario in `tests/rollback.test.ts:85-114`. Its alleged previous release is the synthetic `stubAkrogon` in `tests/deploy-fixture.ts:20-30`. The stub delegates install through `AKROGON_FIXTURE_ENTRY`, set to `tests/helpers.ts`'s entry in this worktree. Consequently, invoking the previous release's install actually runs this leaf's code. The held `next` pass also uses the worktree CLI rather than the restored predecessor.

Consequence today: the green tests establish neither independence from this leaf's code nor compatibility with the real predecessor. A broken predecessor install or hold reader would escape this proof. The test mocks the release entry whose independence is under test.

This blocks criterion 3 and design.md's explicit requirement that rollback tests use a previous release built from release-deploy's code without this leaf's verb. Use the actual predecessor tree through the existing release builder and CLI tools, and run its install and held next pass. Show a deliberate functional break making the recovery proof red. The recorded initial red for the manual test stops at the README substring assertion, before any recovery step, so it does not establish that functional sensitivity. This is missing criterion proof for A, not missing runner machinery.

Evidence: inspected `tests/deploy-fixture.ts`, `tests/rollback.test.ts`, `tests/helpers.ts` and the recorded initial red and final green rollback logs. No outside service or operator action is required.

## Verification

- `check rollback-criteria: 0 implementation/check-rollback-criteria-1792127253719-3930047.log`: six tests pass. Read back with `akrogon log`; F2 limits what this proves.
- `check deploy-and-contract: 0 implementation/check-deploy-and-contract-1792127261871-3934796.log`: 44 tests pass. Read back with `akrogon log`.
- Existing verify receipt `2f8b239f-9ed4-489d-964a-702d1f408cba` records format, test and typecheck exit 0 on tree `e41f1a32a8622b400066a42a82ec9d2195bd162f`. Its three logs were read back: 986 tests pass, formatting passes, typecheck passes. The reviewed head, report head d6e7cb7 and verified ff7a8bb have identical trees. The report's stated run UUID differs from the actual receipt, but the receipt and logs establish the result. No redundant full run was needed.
- No planned test, runner configuration or check was skipped, filtered or disabled by this diff. The six-test run covers the planned criterion selections after the last test edits. The manual red's claim in the plan/report is inaccurate as described in F2.
- README's rollback section and docs/guide/install.md were reviewed against the changed behavior. The manual commands currently match the implemented flip/hold/install sequence, but must also reflect F1's required state transition.
- One listing command per changed AREA.md checked its named repository paths. `check review-B-src-paths: 0 implementation/check-review-B-src-paths-1792127489463-280802.log` and `check review-B-tests-paths: 0 implementation/check-review-B-tests-paths-1792127489591-280924.log`, both read back. New source/test pointers exist. Missing issues paths are runtime records/config in the authoritative checkout, absent from this sparse worktree, rather than newly introduced dead source pointers.
- The initial context inventory exited 2 because it tried a nonexistent optional slots directory. It was an inspection command, not a configured check or criterion proof. The leaf has no debate artifacts, as expected.

## Test-Change trailers

The path rule in src/test-files.ts includes all files under tests/, including AREA.md. Trailers in base..HEAD:

- d692a3d, `tests/release-deploy.test.ts`: fixture extraction and stub assertion change, citing plan synthesis. D9 explicitly authorizes the stub change, making the old exact bytes obsolete. The remaining content assertion and release/node_modules checks retain the build checks. F2 concerns the new fixture's suitability as predecessor proof, rather than deletion of an existing regression.
- d692a3d, `tests/command-reference.test.ts`: added rollback argument contract, citing plan synthesis. Matches the new verb and README row.
- f0cb567, `tests/rollback.test.ts`: real first-run failures from BunShell mv lacking -T and flow-style YAML, with no expectation change. Current code uses the real ln/mv commands and injects the invalid key into parsed YAML. The final green run is after those corrections.
- f0cb567, `tests/AREA.md`: new fixture and rollback test index entries, citing the plan checklist. Both paths exist.

## Operator actions

None.

## Nits

None.

## 2026-10-16 check.repair

Starting head: `f0cb5677d7fdd55d1e29e152d3b4875f974e2820`. A's initial review has no Fixes. Both initial reviews were read for this pass.

### F1 repaired

Reproduction commit: `e7076a6` adds the sole B-authored reproduction test, tests/rollback-record.test.ts. It exercises ordinary deploy A, deploy B, rollback through the real CLI and requires active=A, previous=B and B's replacement timestamp. Its Test-Change trailer cites F1's realistic source. No existing test expectation was changed.

Fix commit: `90ee806` reuses writeDeploySuccess after install succeeds, recording the restored release active and the held release previous. The existing helper also stamps the replacement time. A failed install leaves the deploy record intact, preserving the planned failed-link retry behavior. README adds the equivalent predecessor-module record-writing command after successful manual installation. The dated implementation note in plan.md supplies this step from the existing binding design requirement. design.md was not changed.

E1: `check repair-B-F1-red: 1 implementation/check-repair-B-F1-red-1792127626846-341407.log` shows the new test failing on the starting product: commit and previous still describe B→A and B has no replacement timestamp. `check repair-B-F1-green: 0 implementation/check-repair-B-F1-green-1792127640925-348049.log` shows the same test passing after the fix. Both logs were read back with akrogon log.

E2: `check repair-B-criteria: 0 implementation/check-repair-B-criteria-1792127646740-348619.log` reruns all six planned rollback tests plus release-deploy and command-reference: 26 pass. This includes the original proof B did not write for the flip, held-next/new-main loop and failed-link retry. All rollback criteria were rerun because rollback.ts changed. F2 still limits the predecessor/manual proof. The log was read back with akrogon log.

E3: `check repair-B-F1-commit: 0 implementation/check-repair-B-F1-commit-1792127655042-360981.log` records git diff --check, the before/after product and README diff, the fix commit and a clean worktree. Read back with akrogon log. No temporary scripts were left behind.

### Handed to A

- F2: criterion 3 lacks the real predecessor recovery case. Existing tools are Bun's test runner, the release builder, temporary Git repository helpers and CLI spawning. Correct the criterion proof to build release-deploy's actual predecessor tree without this leaf's verb, run its install and held next pass, and show a functional deliberate break turning that proof red. Include README's added final record-writing command and compare its final deploy metadata with the rollback CLI. This is the skill's missing-case/proof handoff, not a request for new runner machinery or unmerged prerequisite work.

E4: `akrogon verify` is green on committed head `90ee80673105240e67808eda5f156e335a24bff9`, tree `67ca8b356d7146fada36e971ae9e35b7ee92b4c8`, receipt `0da29407-11e7-4fc3-baef-907439ce880d`. Format, all 987 tests and typecheck pass. Logs `implementation/check-format-1792127657000-361141.log`, `implementation/check-test-1792127800292-361141.log` and `implementation/check-typecheck-1792127802294-361141.log` were read back with akrogon log. No merge_checks ran.

Operator actions: none. Reusable Nits: none. Worktree is clean. F1 is repaired, F2 remains blocking and goes to A in check.fix.

## 2026-10-16 check.review after check.fix

Verdict: fix.

Prior reviewed head: `f0cb5677d7fdd55d1e29e152d3b4875f974e2820`; B's repair handoff head: `90ee80673105240e67808eda5f156e335a24bff9`. Reviewed A's repair range `90ee806..096aab122811740ffc76d55a09fe735814b10c5c`. Base remains `6121559ee158f559842715a552248645f05bd026`, with no branch refresh reported or present. No main commits or unrelated original implementation were re-reviewed. No code was changed or committed.

F1 remains repaired. F2's replacement proof now builds an actual predecessor tree and invokes its own install, record writer and held next pass. Delegation through AKROGON_FIXTURE_ENTRY is gone, and the real predecessor-module deletion makes the install proof red. However, the replacement introduces F3 below.

### F3: The predecessor proof breaks once this leaf lands on main

Source: the normal main checkout after this leaf is merged and fetched, or any later leaf based on that main. The new manual recovery test selects its predecessor with `git merge-base origin/main HEAD`. Once main contains this leaf, that command selects a commit containing rollback. The test then fails its assertion that the selected release has no rollback verb, before recovery begins.

Consequence today: this repair leaves a test that is green only while the leaf is unmerged. The next configured full test run after landing fails, and subsequent leaves cannot pass verification. Criterion 3's proof also stops exercising a real pre-rollback predecessor.

Evidence: `check recheck-B-main-build: 1 implementation/check-recheck-B-main-build-1792128819608-2614723.log`, read back with akrogon log. In a temporary shared clone of the exact reviewed head, the probe set that clone's origin/main to HEAD, matching the tracking state of a main checkout after landing, installed frozen dependencies under the install lock and ran `bun test tests/rollback.test.ts -t "README manual"`. It failed at tests/rollback.test.ts:117 because the built release contains `case 'rollback'`. No source file was modified. The clone was removed by the exit trap. No retry is required because the cause is the new revision-selection expression in the repair diff.

Use a stable real predecessor revision independent of current main, retaining the real build/install/record/held-next proof. Verify the corrected test both before landing and with origin/main containing the leaf. This finding is introduced by A's F2 repair, not an additional original acceptance criterion.

### Other repair review and verification

E5: A's `096aab1` lock-parent fix adds recursive parent creation before flock in withLock. Read the helper and affected self-update/sync/migration callers. The existing self-update boundary test demonstrates red-before/green-after without changing its expectations: `check self-update-retry: 1 implementation/check-self-update-retry-1792128220044-1480466.log` reports flock ENOENT, while `check self-update-fixed: 0 implementation/check-self-update-fixed-1792128601435-2080177.log` passes all 14 tests. Both logs were read back. No new defect found in that change.

E6: Read back `check fix-F2-red: 1 implementation/check-fix-F2-red-1792127994343-939741.log` and `check fix-F2-green: 0 implementation/check-fix-F2-green-1792127998102-940876.log`. The deliberate break fails at the real predecessor install, and the normal run passes all six rollback tests. The later `check fix-criteria-2: 0 implementation/check-fix-criteria-2-1792128607253-2088508.log` passes all seven rollback/record tests on the final head, after the lock-helper edit. F3 describes the missing repository-state case in that evidence.

E7: Verify receipt `da7ebd74-4d7e-4920-891a-3da8295ccbbb` is green for the exact reviewed head, tree `7320c4b0d1efda2fdebfa6ea4ff376461ea591e8`. Read back its logs: `implementation/check-format-1792128610573-2092781.log`, `implementation/check-test-1792128753565-2092781.log` and `implementation/check-typecheck-1792128755646-2092781.log`. Formatting, 987 tests and typecheck pass in the unmerged tracking state. The report names a different run UUID, but the matching receipt and logs establish the result. No redundant full verification was run.

E8: `check recheck-B-diff: 0 implementation/check-recheck-B-diff-1792128791452-2602223.log` records the repair diff and trailers. `check recheck-B-lock-contract: 0 implementation/check-recheck-B-lock-contract-1792128835567-2622019.log` records the lock callers, documentation and clean diff/worktree check. README's manual commands still match the proof's operations. No documented behavior changed in A's repair. No AREA.md file changed in this repair range, and no planned check or runner configuration was skipped or disabled.

### Repair Test-Change trailers

- `333d2f3`: tests/rollback.test.ts cites F2 and criterion 3 for the real predecessor proof. This justifies replacing the former delegated proof. The revision-selection defect is F3.
- `333d2f3`: tests/deploy-fixture.ts cites F2 for removing delegation and its environment variable. Consistent with the now-independent predecessor proof.
- `333d2f3`: tests/release-deploy.test.ts cites F2 and restoration of the original marker for reinstating the exact byte assertion. It strengthens the assertion rather than deleting a regression check.
- `17e9d9d`: tests/deploy-fixture.ts cites F2 and the restored exact-byte assertion for removing the obsolete RELEASE_BROKEN branch. The rewritten manual test now creates its own explicit non-starting release, so that fixture hook is no longer needed.

Operator actions: none. Nits: none. F3 is the only open Fix for this reviewed head.

## 2026-10-16 check.repair F3 disposition

Head remains `096aab122811740ffc76d55a09fe735814b10c5c`, tree `7320c4b0d1efda2fdebfa6ea4ff376461ea591e8`. Read the latest re-check entry: F3 is the only open Fix. No product defect remains for B to repair in this pass. No code, test or design was edited, and no commit was created.

### Handed to A

- F3: criterion 3's proof needs a stable real pre-rollback revision and the missing repository-state case where origin/main includes the leaf. This falls under check.repair's criterion-proof case handoff to A. Existing tools are the Bun test runner, buildRelease, Git clone/ref commands and CLI helpers. The prior `check recheck-B-main-build: 1 implementation/check-recheck-B-main-build-1792128819608-2614723.log` already demonstrates the failure on this exact head. Preserve the no-rollback predecessor requirement and its real install/record/held-next path, replace the moving merge-base selection, and record that same post-merge scenario red before and green after. Also retain the existing predecessor-module deliberate-break proof. The earlier F2 repair missed the case because its predecessor selection was checked only while origin/main still preceded the leaf. No new proof machinery, unmerged prerequisite or operator action is needed.

Verification: `check repair-B-F3-scope: 0 implementation/check-repair-B-F3-scope-1792128905657-2652947.log` confirms the unchanged head, moving revision selection and clean worktree; read back with akrogon log. `akrogon verify` reused receipt `da7ebd74-4d7e-4920-891a-3da8295ccbbb` for the unchanged tree. Its green unmerged-state result does not resolve F3's demonstrated post-merge failure. No tests were rerun because no inputs changed and the red proof is already retained.

Operator actions: none. Nits: none. Destination: check.fix for A's proof correction.

## 2026-10-16 final check.review after F3 repair

Verdict: ready.

Base: `6121559ee158f559842715a552248645f05bd026`. Prior reviewed head: `096aab122811740ffc76d55a09fe735814b10c5c`. Reviewed head: `afc7f32ea013dc41db8efd04543b547b62702897`, tree `0bfc90afa6d58f618c67d7815f7c44b7c2d7981e`. Reviewed only `096aab1..afc7f32`: the predecessor constant and its explanatory comment in tests/rollback.test.ts. No branch refresh occurred, so no range-diff was needed. No code was changed or committed during review.

F3 is resolved: the proof pins the actual pre-rollback base `6121559ee158f559842715a552248645f05bd026`, independent of origin/main. It retains the actual predecessor build, install, record writer and held-next execution. F1 and F2 remain resolved. No new Fixes or Nits.

E9: `check recheck-B-F3-main-green: 0 implementation/check-recheck-B-F3-main-green-1792129167179-3204253.log` independently repeats B's former failing post-merge scenario on the exact repaired head. A temporary clone sets its own origin/main to HEAD, installs frozen dependencies under the install lock and runs the manual recovery test. One test passes with 17 assertions. The clone is removed by the exit trap. This is green-after for the retained `check recheck-B-main-build: 1` red-before proof. Read the new log back with akrogon log.

E10: Read back A's `check fix-F3-green: 0 implementation/check-fix-F3-green-1792128968375-2680089.log` and `check fix-F3-red: 1 implementation/check-fix-F3-red-1792128973290-2682846.log`. Normal recovery passes, while removing the real predecessor install module still fails at install. `check fix-criteria-3: 0 implementation/check-fix-criteria-3-1792128979563-2683333.log` passes all 27 rollback, record, release-deploy and command-reference tests after the repair; read back with akrogon log.

E11: Exact-head verify receipt `bfe9621a-1fae-4f98-ba4a-c4c8158b68e0` records formatting, all 987 tests and typecheck green. Read back `implementation/check-format-1792128985565-2694430.log`, `implementation/check-test-1792129128698-2694430.log` and `implementation/check-typecheck-1792129130726-2694430.log`. The report's run UUID differs, but the matching receipt and logs establish the result. No repeated full verification was necessary.

E12: `check recheck-B-F3-diff: 0 implementation/check-recheck-B-F3-diff-1792129155749-3199452.log` records the clean worktree, exact repair diff, receipt and Test-Change trailer; read back with akrogon log. afc7f32's trailer for tests/rollback.test.ts cites F3's demonstrated post-merge failure and the pinned predecessor correction. It preserves all existing behavioral assertions. No test filtering, disabling or runner-configuration change was added. No AREA.md changed. README's manual-recovery page was checked, and no documented behavior changed in this repair.

All findings are closed. Operator actions: none. Reusable Nits: none. Destination: merge.

## 2026-10-16 merge attempt 10fb1faf-017d-462b-9310-54e6a480721b

Applied top: `afc7f32ea013dc41db8efd04543b547b62702897`, built on `6121559ee158f559842715a552248645f05bd026`, members: none. Worktree is clean and HEAD equals the recorded top. No fetch, rebase or commit was performed by the merge seat.

`akrogon verify --attempt 10fb1faf-017d-462b-9310-54e6a480721b` reused green receipt `bfe9621a-1fae-4f98-ba4a-c4c8158b68e0` for identical tree `0bfc90afa6d58f618c67d7815f7c44b7c2d7981e`. Format, 987 tests and typecheck pass. Their logs were read back with akrogon log: `implementation/check-format-1792128985565-2694430.log`, `implementation/check-test-1792129128698-2694430.log`, `implementation/check-typecheck-1792129130726-2694430.log`. Config has no merge_checks, merge_covers or advisory commands. All three run-release leaf briefs were gathered for the potential epic completion broadcast.

`akrogon phase release-rollback merged --slot B --check --attempt 10fb1faf-017d-462b-9310-54e6a480721b` returned `ok`, accepting the receipt, top and Test-Change trailers. Proceeding to the command-owned push and completion.
