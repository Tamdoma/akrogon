# Review B

Date: 2026-10-16
Base: dd5c15c217d85c8fafbb02f5f2544efe9b591a89
Reviewed head: e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce
Verdict: fix

Initial blind review of the whole diff. Debate is disabled, so no positions-B.md or rebuttal-B.md is expected. No peer review read. No code changed or commits made.

## Fixes

### F1 — Deferred explicit-home migration makes the command fail

At src/config.ts:198, an explicit AKROGON_HOME is returned before checking whether cutover completed. migrateStateHome correctly defers for a live tool-root run, but readGlobal then opens the empty destination's config.yaml and exits with ENOENT. The criterion 4 scenario is a first command selecting an empty AKROGON_HOME while an existing tool-root run remains live. The command must continue using the tool-root home until cutover completes, as also required by the design's no-failure-between-deploy-and-migration decision.

A copied-source CLI invocation with a schema-complete live record tied to the probe's actual pid/start_time/boot_id reproduced exit 1, no destination config, and ENOENT on custom/config.yaml. The probe asserts the observed defect, so its harness exits 0. This is the named criterion outcome, not an additional acceptance requirement.

Evidence: `check review-b-valid-record: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-review-b-valid-record-1792108591769-2363502.log` (read back with akrogon log).

Repair the home resolution and cover deferred explicit-home migration at the CLI boundary.

### F2 — Missing .lock bypasses all cutover locks

At src/state-home.ts:143–146, a tool root without .lock calls move() directly. This bypasses both the required global lock and every admission lock, even if runs/locks already exists. A checkout with tracked config.yaml before its first lock-taking command is a normal source, and the new cutover fixtures use exactly that state. Criterion 4 explicitly requires cutover to hold the tool-root global and admission locks. The successful copy in this branch happens without that required exclusion. Process snapshots do not supply the lock contract.

The stated reason, avoiding a tracked checkout change, does not require this bypass: .lock is ignored by the real repository, and criterion 4 protects tracked files. Always perform the cutover under the required locks, including when their files need creating.

Evidence: `check review-b-lines: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-review-b-lines-1792108581303-2329600.log` (read back), showing the direct unlocked branch and the locked branch it skips. The diff and .gitignore were also inspected.

### F3 — C2 and C4 proof is missing or cannot catch failure

The implementation report declares every criterion verified, but tests/state-home.test.ts never invokes init. Its pause assertion cannot detect init writing registration into the checkout. C2 needs the planned actual `init --from` invocation, registration read-back in the state-home config, and tracked checkout comparison.

For C4, the tracked-files test at line 171 asserts that each changed path IS tracked. A modification or deletion of tracked config.yaml therefore passes. Correct the expectation to reject tracked changes. The live-record case removes its fabricated record before migration and cannot prove the separately required outcome that an already running command, including one admitting another checked run, leaves every record visible after cutover and makes no later tool-root writes. No such overlapping command scenario appears in the suite or kept report evidence. Add the planned criterion case using the existing CLI/fixture/admission support. These are missing cases, not a request for new proof machinery.

Evidence: `check review-b-contracts: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-review-b-contracts-1792108518706-2032469.log` and `check review-b-lines: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-review-b-lines-1792108581303-2329600.log` (both read back). Correct the report after current proof runs. The assertion correction belongs to A under the repair split.

## Verification and documentation

Reused the implementation's final akrogon verify evidence on the reviewed head. Read back test, typecheck and format logs: 907 tests pass, zero failures; tsc succeeds; formatting passes. The full suite includes the criterion and command-reference suites after the final test/helper changes. No planned check was filtered or disabled by this diff. Earlier red cutover evidence shows five cases fail before product code. No full-check rerun was needed for this read-only review.

Final logs under implementation/: check-test-1792108437701-1446508.log, check-typecheck-1792108439742-1446508.log, check-format-1792108326355-1446508.log. These green checks do not establish the missing C2/C4 outcomes in F3.

Opened README.md, docs/guide/install.md, docs/reference-index.md and src/AREA.md against the changed behavior. The documented machine config location is correct. A single shell-command path listing of src/AREA.md is retained in the valid-record log cited above. All named source/doc/helper paths exist. issues/closed, issues/timings.jsonl and issues/verify-runs.jsonl are absent in this sparse worktree and are generated repository records, not dead source pointers with a current consequence.

The initial context command exited 1 because optional debate artifacts were absent, and an exploratory caller command exited 2 because it guessed a nonexistent deploy.ts. Neither was a configured check or product failure. Two initial heredoc probes produced no output because run-check does not forward stdin and are not proof; the file-based valid-record probe supersedes them. Temporary probe files and fixtures were removed.

## Test-Change trailers

All trailers in origin/main..HEAD (the target equals the recorded base) were inspected against src/test-files.ts and the cited diff/source:

- e1917e6: `tests/state-home.test.ts formatting only` — formatting only, accepted.
- 9596071: `tests/run-check.test.ts allowlist gains AKROGON_HOME, the name the leaf now copies through; no expectation weakened` — matches constructedEnv propagation required for shared state, accepted.
- 02f8518: `tests/state-home.test.ts same assertions moved from stdout to stderr after the product change; no expectation weakened` — config YAML and run-check stdout consumers are the real source; criterion 3 does not bind the stream, accepted.
- a04139c: `tests/state-home.test.ts typecheck fix only; no expectation changed` — parse typing only, accepted.
- 3c87194: `tests/hold-retired.test.ts state-home brief criterion 1 requires copying held and admission files; the retired-file ban now exempts the cutover copy list only` — copy-list reference is required by the brief, accepted.

No lesson removals. No deferred Nits or operator actions.

## 2026-10-16 check.repair

Start: e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce. Repaired head: 79d2df3. Read both initial reviews. No live/external mutations, operator actions, or new machinery were needed.

### Repairs

- **B-F1:** reproduction commit 2cc8143, product fix f4f0a77. Explicit destinations now follow the same config-exists cutover resolution as the default destination. With a live tool-root run, config keeps reading the old home; the next invocation migrates after that run ends. Added the required dated plan implementation note, without changing brief or design.
- **B-F2:** reproduction commit 2f2f75b, product fix 79d2df3. Deleted the unlocked branch. Migration always acquires the tool-root global lock and existing admission locks, creating the global lock file when necessary. The reproduction holds an admission lock, observes the CLI waiting, and proves a competing nonblocking global lock fails. All prior test expectations remain untouched.

Each reproduction was red before its product change and green after. Both test commits have Test-Change trailers citing the corresponding finding and criterion 4. Existing planned migration/config/defer/pause cases also pass after the product repairs. Overall acceptance remains blocked by the handed-off criterion proof below.

Evidence, all read back with akrogon log:

- `check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-f1-red-1792109044452-3556828.log`
- `check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-f1-green-1792109051869-3559838.log` — seven cases pass before F2 changes.
- `check repair-b-f2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-f2-red-1792109061002-3564810.log`
- `check repair-b-f2-repro-green: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-f2-repro-green-1792109088225-3579331.log` — same focused reproduction now passes. Filtering was only for red/green bug reproduction, never the planned proof or configured check set.
- `check repair-b-f2-green: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-f2-green-1792109078361-3573346.log` — the full planned criterion file has seven passes and one failure at the already-reported false tracked-files assertion. It expects the newly created untracked .lock to be tracked. This is B-F3's expectation correction, reserved to A. It must instead reject tracked changes, allowing ignored/untracked lock files under criterion 4. This is a diff-related red, so no unrelated-failure retry applies.

### A-F2 disposition

No product change is required for A-F2. On the originally reviewed e1917e6 and on the repaired head, copiedEntries contains held.yaml, admission.lock, paused.yaml, stopped.yaml, .lock, reconcile-host.json, reconcile and runs. It does not contain config.yaml. The sole config write already uses the rewritten object through writeYaml's temp+rename. A-F2's claimed raw-config copy is absent in the reviewed code.

Evidence: `check repair-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-context-1792109025359-3548029.log` captures the reviewed SHA and original source; `check repair-b-final-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-final-diff-1792109099835-3626627.log` (read back) captures the repaired diff and copy list. This finding is disproven rather than an unresolved Fix.

### Handed to A

- **A-F1 / B-F3, C2:** existing CLI/tool-copy fixtures lack the actual init registration case and checkout comparison. This is a missing criterion case on existing machinery, assigned to A by the repair split.
- **B-F3, C4:** correct the existing tracked-files assertion that currently permits tracked changes and rejects an untracked lock. Any test-expectation correction belongs to A. Current proof fails at that assertion after the required B-F2 fix.
- **B-F3, C4:** add the planned overlapping old-command/nested-admission case using existing CLI/admission fixtures, proving records survive the cutover and later tool-root writes do not occur. This is another missing criterion case, assigned to A.
- **B-F3, report:** replace the claimed C2/C4 verification with current evidence after those cases pass, and remove the obsolete missing-lock limitation now repaired by B-F2.

### Final verification and additional handoff evidence

`akrogon verify` on 79d2df3480f0efb6e0a7c19e7368eb3b6396d314 finished red. Format and typecheck pass. Test: 906 pass, 3 fail. No check was skipped, disabled, or retried as an unrelated failure. The three reds have a direct cause in these repairs:

- The known B-F3 tracked-file assertion fails on the required .lock creation.
- tests/install.test.ts:397 expects the global lock under an explicit but config-less fixture home. B-F1 now correctly treats that home as not cut over and locks the tool root instead.
- tests/self-update.test.ts:221–247 holds `<f.home>/.lock` while using a config-less explicit home. B-F1 correctly resolves the tool root until a destination config exists, so the test's blocker holds the wrong lock and its concurrent record is not replayed. Its fixture's withHome sets AKROGON_HOME without establishing a completed cutover.

**Additional Handed to A:** the install/self-update fixture expectations above need alignment with brief criterion 4: a configured destination home is required before it becomes active. Keep the existing self-update concurrency assertions, but establish the intended active state home in those fixtures. These are corrections of existing tests' assumed state, so B leaves them to A under the test-expectation exception and the reproduction-only test-writing rule. They are not new product defects or base failures.

Kept verify evidence (read back with akrogon log):

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-format-1792109090427-3579830.log`
- `verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-test-1792109196689-3579830.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-typecheck-1792109198638-3579830.log`

No green receipt is claimed. A must rerun the criterion file and full verify after completing the handoff. No merge_checks were run. Worktree code is committed and clean. No temporary helper files were created in this repair pass. The existing tests clean their temporary copies and lock-holder children.

## 2026-10-16 check.review after check.fix

Prior reviewed base/head: dd5c15c217d85c8fafbb02f5f2544efe9b591a89 / e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce.
Handed-off base/head: 4302113941815b45cceaec5a90480945949ba36f / 2eabe02fcd07656164daca7d2c77c5011d536d9a.
Verdict: fix. One earlier finding remains partially unresolved. No new product finding.

Computed `git range-diff dd5c15c217d85c8fafbb02f5f2544efe9b591a89..e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce 4302113941815b45cceaec5a90480945949ba36f..2eabe02fcd07656164daca7d2c77c5011d536d9a`. All eight originally reviewed commits are unchanged. Reviewed the six added commits, including B's rebased repairs and A's two test commits. Main's intervening commits were excluded from repair review. No conflict-resolution changes appeared in the matched commits.

Evidence: `check recheck-b-range: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-recheck-b-range-1792110348780-2484085.log` (read back).

### Confirmed resolved

- **B-F1/B-F2:** the explicit-home fallback and unconditional locking fixes remain intact with their reproduction cases.
- **A-F1 / B-F3 C2:** the new CLI init case checks destination registration and unchanged source config plus tracked checkout status. The deliberate tool-root-write break turns it red. Accepted.
- **B-F3 tracked-file assertion:** now rejects tracked modifications/deletions and permits untracked additions, as criterion 4 requires. Accepted.
- **B-F1 fixture follow-ups:** install/self-update fixtures establish an active destination config while retaining existing concurrency assertions. Accepted. A-F2 remains disproven, as recorded in the repair entry.

### Retained Fix B-F3 — C4's admitted-run scenario is still unproven

The new test at tests/state-home.test.ts:202 does not implement the previously handed-off criterion 4 scenario. At line 207 it starts a timer-only Bun process. The test itself writes a synthetic live record, then removes the record and kills the process at lines 233–235 before cutover. It verifies only that a live record defers migration and an empty slice-lock file is copied. This duplicates the existing defer mechanism. No already-running akrogon command admits another checked run or writes a record during this test. After cutover it runs only the read-only config command.

Consequently a defect stranding a record written by an already-running command that admits another checked run would leave every assertion green. Criterion 4 explicitly requires that outcome. This is the remaining portion of the original B-F3, not a newly added acceptance criterion or a claim of a newly discovered product bug. The deliberate `settled()` break demonstrates live-record deferral only; it does not establish the missing admitted-run outcome.

Finish the previously requested scenario using existing CLI/admission fixtures: exercise an already-running old-code command admitting another checked run while a new-code command attempts cutover, then establish that every resulting state record remains visible after cutover and no old command writes to the tool root afterward. Assert the actual record/write outcome. Correct the report's complete C4 verification claim after that proof passes. This is a missing case on existing machinery and belongs to A under the repair split.

Evidence: `check recheck-b-proof-lines: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-recheck-b-proof-lines-1792110366330-2492013.log` (read back) captures the exact new test and reviewed SHA.

### Verification and trailers

Read back the final verify logs on 2eabe02: 957 pass, zero failures, typecheck and format green. The final test run postdates all changed cases and fixtures. No planned tests or runner configuration were skipped, filtered or disabled in the repair diff. Reused that evidence without redundant reruns. Green configured checks do not cover the missing C4 scenario above.

Final logs under implementation/: check-test-1792110293526-1987113.log, check-typecheck-1792110295527-1987113.log, check-format-1792110166732-1987113.log. Also read back check-c2-red-1792109713216-547820.log, check-c4-red2-1792109741166-561177.log and check-criterion-final-1792109788125-578538.log. The C2 red is valid; the C4 red supports only the narrower deferred-live-record outcome.

Additional Test-Change trailers examined:

- 182271c tests/state-home.test.ts: B-F1/criterion 4 explicit-home reproduction. Accepted.
- e264d23 tests/state-home.test.ts: B-F2/criterion 4 lock reproduction. Accepted.
- fa207e1 tests/state-home.test.ts: B-F3/criteria 2 and 4 new cases and assertion correction. Source justifies the correction, but the admitted-run portion remains missing as described above.
- 2eabe02 tests/self-update.test.ts and tests/install.test.ts: criterion 4 active-home fixture correction. Accepted. Existing assertions remain intact.

The prior five trailer judgments remain valid for their unchanged rebased commits. No AREA.md changed in the repair diff. Opened the install guide's machine-home section; no documented behavior changed in this repair. No new Nits, lesson removals or operator actions. No code changes or commits in this review.

## 2026-10-16 check.repair — remaining C4 proof

Head remains 2eabe02fcd07656164daca7d2c77c5011d536d9a, with a clean worktree and no changes since the latest review. That review contains one open item, B-F3's missing C4 admitted-run case. No remaining proven product bug is assigned to B. No code edits, commits, temporary helpers, live actions or additional test runs were needed. Reuse the existing green verify receipt on this unchanged head; it still does not prove the missing scenario.

### Handed to A

- **B-F3 / C4:** add the missing case with the existing tests/state-home.test.ts copied-CLI helpers and CLI/admission fixtures. An actual already-running old-code command must admit another checked run while a new-code command attempts cutover. Assert the resulting record/write visibility across cutover and the absence of later tool-root writes. The timer plus manually created/deleted record currently at lines 202–250 does not exercise admission. This is a missing criterion case on existing machinery, which the check.repair rule explicitly assigns to A.
- **B-F3 / report:** replace the complete C4 verification claim with evidence from that scenario after it passes, and rerun affected proofs and verify on the resulting committed head.

The earlier attempt missed because it substituted a static live-record gate test for an old command actually admitting work. Inspection of the current case and the latest re-check confirms that precise gap remains; resolved C2, tracked-file and fixture items stay closed. No new test or changed product behavior is requested beyond criterion 4.

Evidence: `check repair-b-c4-handoff: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-c4-handoff-1792110412427-2512824.log` (read back with akrogon log) records the unchanged SHA, clean status and current case. No operator action or missing proof machinery blocks the handoff. Proceed to check.fix.

## 2026-10-16 check.review — C4 admission repair, round 2

Base: 4302113941815b45cceaec5a90480945949ba36f (unchanged).
Prior reviewed head: 2eabe02fcd07656164daca7d2c77c5011d536d9a.
Reviewed head: da7b658627c9b76536a17609fedc7be0758200a8.
Verdict: fix. B-F3 remains open for one concrete gap in the replacement proof.

Reviewed only the two added commits: 6498fcd replaces the fabricated-record test with real CLI run-check invocations, and da7b658 formats that test. No branch refresh occurred this round. Product code and previously accepted repairs are unchanged. No AREA.md changed. Opened the install guide's configuration section; no documented behavior changed.

### Retained Fix B-F3 — nested admission failure is hidden

The replacement case now exercises real outer admission, which resolves the earlier fabricated-record problem. However, its shell payload is `${nested}; sleep 6`. The shell reports the final sleep's success even when the nested CLI fails before admission. The case asserts only the outer exit and outer record existence; it never checks the nested exit, output, log or payload completion. Thus the specifically required nested checked-run outcome can fail without this criterion proof failing.

Confirmed with a deliberate break in a temporary copy of the current source/tests: changed only the nested invocation to pass `--invalid-nested-option`, which parseArgs rejects before admission. Instrumented the copied case to print its otherwise unread outer stderr. The trace shows `ERR_PARSE_ARGS_UNKNOWN_OPTION`, then `check run: 0`, and the criterion case still passes with 10 assertions. No worktree code was edited. This is a demonstrated proof defect in the repair, not an assertion-style preference or an extra coverage request.

Evidence: `check recheck-b-nested-error-trace: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-recheck-b-nested-error-trace-1792111543191-46438.log` (read back). Harness exit 0 means it confirmed the false green. The exact repair diff is retained in `check recheck-b-c4-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-recheck-b-c4-diff-1792111465643-12399.log` (also read back).

Required correction: propagate the nested command's failure and assert its successful checked work was actually reached. Retain the actual outer-record and cutover assertions. Demonstrate that a nested invocation failing before admission makes this case red, then record its passing current run and update the report. This is B-F3's still-missing criterion outcome and correction of the new proof's expectation, assigned to A under the repair split. All other findings remain closed.

### Verification and trailers

Read back final verify logs on da7b658: 957 pass / 0 fail, typecheck and format green. Full run postdates the last test edit. No configured test filtering, runner changes, or product edits occurred. Reused current full-check evidence rather than rerunning it. These green results do not cure the demonstrated false green above.

Logs under implementation/: check-test-1792111422716-3712431.log, check-typecheck-1792111424744-3712431.log, check-format-1792111288704-3712431.log. Also read back check-c4-overlap-v2-1792110975084-2761745.log and check-c4-overlap-red2-1792110994743-2769662.log. The recorded gate break prevents the outer admission setup; it does not test that nested failure is detected.

Test-Change trailers: 6498fcd tests/state-home.test.ts cites B-F3/criterion 4 for replacing the synthetic case, a valid reason; the replacement still needs the correction above. da7b658 tests/state-home.test.ts is formatting only, accepted. Earlier trailer judgments stand. No new Nits, lessons or operator actions. Temporary probe copies and helper removed. Worktree stays clean, with no review commits.

## 2026-10-16 check.repair — nested outcome handoff

Head unchanged: da7b658627c9b76536a17609fedc7be0758200a8; worktree clean. Latest review has only the retained B-F3 proof defect. No product repair, new machinery, operator action, or change to the locked design is needed.

### Handed to A

- **B-F3 / C4:** correct the existing criterion test in tests/state-home.test.ts so a failing nested invocation fails the test and successful nested checked work is observed. The current `${nested}; sleep 6` masks the nested exit. Preserve the real outer-admission and cutover checks. Show the previously demonstrated invalid-nested-option break turning the corrected case red, then record its current green proof and full verify and update the implementation report. This is correction of an existing test's assumed successful outcome, explicitly reserved to A by check.repair.

The previous correction missed this because it checked outer-run success without propagating or observing nested-run success. The exact current shell payload and assertion are recorded in `check repair-b-nested-handoff: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-repair-b-nested-handoff-1792111587010-69073.log` (read back with akrogon log). The latest review already records the deliberate-break evidence. No code edits, commits or temporary files this pass. No proofs or dependencies changed, so reuse current green verify evidence and do not rerun unchanged checks. All other findings stay closed. Move to check.fix.

## 2026-10-16 check.review — nested outcome correction

Base: 4302113941815b45cceaec5a90480945949ba36f, unchanged.
Prior reviewed head: da7b658627c9b76536a17609fedc7be0758200a8.
Reviewed head: 83b92799495c40595a09ca13e08c588f89ae66ca.
Verdict: ready.

Reviewed only e29bbf9 and 83b9279, the two added commits. They change tests/state-home.test.ts to preserve and return the nested command's exit status and assert the nested successful check result in the outer log, followed by formatting. No branch refresh, product changes, runner changes or disabled tests. The existing outer admission, deferred cutover, copied state and no-later-tool-root-write assertions remain intact.

**B-F3 resolved:** the recorded invalid-nested-option break now fails the criterion case at the outer-exit assertion (expected 0, received 1), and the intact criterion file passes all ten cases. The captured nested `check run: 0` assertion additionally confirms successful nested checked work. The previously demonstrated false green is corrected. B-F1, B-F2, C2, tracked-file and self-update fixture repairs remain accepted. A-F2 remains disproven as previously recorded. No open Fixes or reviewer-held Nits remain.

Evidence read back with akrogon log:

- `check recheck-b-nested-fix: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-recheck-b-nested-fix-1792112064342-1112002.log` — exact repair diff, trailers and reviewed SHA; clean worktree.
- `check c4-nested-red: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-c4-nested-red-1792111723915-126916.log` — the deliberately broken nested invocation is detected.
- `check c4-nested-green: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-c4-nested-green-1792111736976-133123.log` — ten criterion cases pass.
- Final verify on 83b9279: `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-test-1792112029698-623420.log` — 957 pass, zero failures; `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-typecheck-1792112031703-623420.log`; `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-format-1792111896332-623420.log`.

The final verify run postdates the latest test formatting edit and covers all current helpers and fixtures. Reused its evidence without another unchanged full run. The implementation report records the corrected behavior and red/green/current verify evidence. No merge-failure rerun obligation applies.

Test-Change trailers: e29bbf9 tests/state-home.test.ts cites the exact B-F3 re-check defect and is justified by the demonstrated masked nested failure; accepted. 83b9279 tests/state-home.test.ts is formatting only; accepted. Prior trailer judgments stand. No AREA.md changed. Opened the install guide's machine-home section; no documented behavior changed. No new lessons, Nits, operator actions, code edits, commits or temporary files in this review. Request merge.

## 2026-10-16 merge

Attempt: 844d96a1-0f74-4cdc-8339-e98e5b09c654.
Applied top: 83b92799495c40595a09ca13e08c588f89ae66ca.
Built on: 4302113941815b45cceaec5a90480945949ba36f.
Members: none. Worktree clean and HEAD matches the supplied top. No fetch, rebase, code changes or commits performed.

`akrogon verify --attempt 844d96a1-0f74-4cdc-8339-e98e5b09c654` exited 0 and reused receipt fc0c3847-50b2-42c4-9af7-a2508b9912ec for tree 61bd19e1f27cbc01a914ff97b32930c8b89db930. Current merge_checks, merge_covers and advisory sets are empty, so the previously read current-tree green logs cover this command set: 957 tests pass, typecheck and formatting green. No advisory failures. Proceed to merged --check with the same attempt.

Context evidence: `check merge-state-home-context: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-merge-state-home-context-1792112099855-1131861.log` (read back).

`akrogon phase state-home merged --slot B --check --attempt 844d96a1-0f74-4cdc-8339-e98e5b09c654` returned `ok`, stamping the tested top. Gathered run-release/ISSUE.md and all three owner leaf briefs (state-home, release-deploy, release-rollback). The latter two remain separate work; broadcast only if the merge command prints an owner completion line. Proceed to the command-owned push and move with the same attempt.

Merge command exited 0: `moved merged` and `deployed 430211394181..83b92799495c`. The tested head landed and state-home is merged. No issue complete or epic complete line was emitted, so no broadcast applies. No direct git push, manual deployment or cleanup performed.
