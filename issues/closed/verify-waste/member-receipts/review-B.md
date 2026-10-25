# Slot B review

Date: 2026-10-25
Base: f89afbffbff1dcd7a87d781c812efd030a605cd0
Reviewed head: 15a82fd1007aa3197fddd3293f58b46d604f38a1
Verdict: fix

Initial blind review. No peer review was read or contacted. No positions-B.md or rebuttal-B.md exists on this debate:no leaf. Code was not changed or committed.

## Findings

### F1 — Fix, P1: blocked merge members receive false known-red cover

Location: src/verify.ts:144-160 and 400-406.

Source: a configured cheap check has the same named pre-existing failure on head and main. This is the framework cheap-first stage explicitly named in brief criterion 3. Running merge-scope verify --known-red blocks the member stage on both trees. runOnce copies the cheap check's exit and log into every unexecuted member. knownRedReceipt then treats those copied failing names as each member's own head/base evidence.

Consequence today: verify --known-red exits 0 and requireGreenReceipt accepts merge even though no merge member executed on either tree. A member containing a new failure can therefore escape verification entirely.

Reproduction used the real CLI in an isolated registered repository, with setup "mkdir -p node_modules", checks.cheap = 'echo "(fail) alpha"; exit 1', merge_checks.member = 'touch <fixture>/member.ran; exit 9', and an owned holder at issues/chart/demo/direct. A head commit adds code.ts. Invoke verify --holder <holder> --known-red, then requireGreenReceipt(repo, head, 'merge'). The marker never exists, both member entries share their cheap check's log, known-red prints pass, and the gate accepts.

Evidence, read back with akrogon log:
check review-B-blocked-known-red-owned: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-review-B-blocked-known-red-owned-1792881133973-2816381.log

Observed: "memberRan":false and "requireGreenReceipt: accepted despite member never executing".

Hits: design Q1 (not-started members never count green), plan D8 (criterion 3 remains a hard merge refusal), and the per-command known-red contract requiring the command's actual failing tests. Preserve the planned blocked-stage behavior while preventing blocked evidence from becoming cover on either side. Add a regression at the CLI/gate boundary.

### F2 — Fix, P2: packed but readable evidence disables command reuse

Location: src/verify.ts:125-129.

Source: the supported akrogon pack issues/chart/<chart> action packs direct-holder logs and removes their plain files. docs/reference/checks.md and files.md document archives as valid saved evidence. reuseSource adds existsSync(entry.log), which rejects archived evidence although akrogon log can still read it.

Consequence today: a same-tree rerun pays again for commands already green in a completed run after packing. This defeats the requested command-grain reuse and is an added restriction absent from the locked reuse key.

Reproduction used actual CLI actions: configure checks.good = 'echo x >> <fixture>/good.count' and checks.bad = 'exit 7'; verify --holder issues/chart/demo/direct; pack issues/chart/demo; log <first-good-log>; verify again with the same holder/tree/config. Both verify runs are red, packing succeeds, the original log remains readable, and good executes twice instead of being reused.

Evidence, read back with akrogon log:
check review-B-packed-reuse: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-review-B-packed-reuse-1792881158590-2847713.log

Observed: "originalLogReadable":true, "plainLogExists":false, "goodExecutions":2, and no reused field on the second good entry.

Hits: brief's unconditional reuse behavior, criterion 5, design reuse key, and plan D3. The implementation report's limitation does not amend those requirements. Remove the plain-file prerequisite or use existing evidence access if readability is required. Do not add a separate archive reader.

### F3 — Fix, P1: verify's whole-run fast path disagrees with the new scope-aware gate

Location: src/verify.ts:287-294, interacting with greenRun at 105-112 and verify at 485-488.

Source: the normal leaf-to-merge workflow in a repository with empty merge_checks, including this repository's effective config. The leaf and merge command lists are identical. greenRun still ignores run.scope and accepts the prior green leaf receipt during merge verify, but the changed requireGreenReceipt now requires a completed merge-scope run.

Consequence today: merge verify exits 0 without writing a merge receipt, then the merge gate refuses the exact commit and tells the user to rerun verify. Rerunning returns the same leaf receipt again. This blocks normal landing when no prior merge receipt exists on that tree.

Reproduction used a real CLI leaf verify with checks.unit = 'echo unit', then verify --holder <owned chart direct holder> on the same tree. Both commands exit 0. The second prints reuse receipt; the ledger contains only scope leaf. Calling requireGreenReceipt(repo, head, 'merge') throws "No green merge verify receipt". This is a regression from changing the gate while retaining the scope-blind fast path. Audit redRun's matching scope for the same mismatch.

Evidence, read back with akrogon log:
check review-B-cross-scope-fast-path: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-review-B-cross-scope-fast-path-1792881182109-2868769.log

Hits: design's scope component in the reuse key and the existing verify-to-merge-gate contract. Align whole-run lookups with the gate and add a leaf-to-merge regression.

## Verification and proof review

All reproduction fixtures were removed in finally. No live external mutation, paid model call, or grant was needed. Scripts ran through akrogon run-check using existing CLI fixtures. Dependency setup ran under the printed flock/install command before dependency-using proof.

The first F1 probe placed its holder outside issues/, so failedTests could not resolve those logs and correctly refused known-red. Its nonzero result is diagnostic only, not a configured check failure or evidence for F1:
check review-B-blocked-known-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-review-B-blocked-known-red-1792881126082-2805768.log
The owned-holder reproduction above establishes the defect. F3's exit 1 is the reproduced product failure, not an unrelated red check.

Read the implementation's current planned proof logs:
- check member-receipts-criterion-tests: 0 implementation/check-member-receipts-criterion-tests-1792880435921-1187646.log — 50 pass, 0 fail, including criteria 1–13.
- check member-receipts-docs: 0 implementation/check-member-receipts-docs-1792880456469-1196925.log — 8 docs-link tests pass.
- Planning red evidence implementation/check-member-receipts-criterion-tests-1792878824313-423154.log — 12 fail, 2 pass, demonstrating absent behavior before implementation.
- Receipt bfba4a11-9538-43c0-91ff-79a845c143cf covers committed tree 8749458e328c090c20fd5ff2a84c42be536d223f at 411ae3528a33a2a2c412f3d01fbaf4aacb005a60. Reviewed head adds only an empty trailer commit, so the tree remains covered. Its logs were read with akrogon log: format check-format-1792880837422-2184753.log, test check-test-1792881026009-2184753.log (1159 pass, 0 fail), typecheck check-typecheck-1792881028352-2184753.log. These all reside in this leaf's implementation directory.

No required check result is missing or red. No full-suite rerun was justified on unchanged code. The planned tests run with the named bun test command and configured runner. No planned test or runner setting was skipped or disabled by the diff. Green evidence postdates the test assertion correction and implementation. The docs report's reus-to-reuse search correction preserves the reuse assertion and case set. The 6f36025 log-path assertion correction compares distinct logs rather than empty output bytes, consistent with criterion 2. The new findings expose untested real boundary combinations.

## Docs and area pointers

Reviewed docs/reference/checks.md as the behavior page, its reference-index links, all changed reference/use pages, and all four changed skill lines. They describe concurrent members after green checks, per-command reuse, and base-side reuse. Their claimed behavior is subject to F1–F3 above. No additional documentation defect was found.

For each changed AREA.md, one shell command listed its concrete repository paths and existence from the root. All listed paths exist:
check review-B-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-review-B-area-listing-1792881143056-2828348.log
Read back with akrogon log. No dead pointer finding. No lesson line is changed in the diff.

## Test-Change trailers

Listed from f89afbffbff1dcd7a87d781c812efd030a605cd0..HEAD and judged against src/test-files.ts:

- 814e6e2, tests/verify.test.ts: "added member-receipts cases for concurrent merge_checks, blocked members, thrown-member settlement, per-command reuse, schema, cross-run green gate and per-command known-red; no existing expectation changed". Accepted: new cases map to brief criteria.
- 814e6e2, tests/flaky.test.ts: "added a reused-entry flip case and an optional reused field on its step builder; no existing expectation changed". Accepted: criterion 13, existing helper behavior preserved.
- 6f36025, tests/verify.test.ts: "corrects one wrong expectation in the planned concurrency test: it compared two empty log contents where the sibling test correctly compares log paths; criterion evidence is the worktree-start markers, not log bytes; no existing expectation changed". Accepted for the newly introduced case: actual assertion changes content comparison to path comparison and retains concurrency markers.
- 15a82fd, tests/AREA.md: "updated the verify line for concurrent merge_checks members, per-command reuse and per-command known-red cover; docs-only, no existing expectation changed". Accepted: brief criterion 14. This path matches the test-file rule despite being prose.

## Operator actions

None.

## Disposition

Three doable product Fixes, no Nits. Request check.repair for slot B. No repair was performed during this blind review.

## 2026-10-25 check.repair

Starting reviewed head: 15a82fd1007aa3197fddd3293f58b46d604f38a1.
Repair head: 666b1c0fbf50628df6e7cc1b5763faf9973e84b2.
Base remains f89afbffbff1dcd7a87d781c812efd030a605cd0. No refresh or rebase occurred.

Read both initial reviews and the leaf brief, design, plan and implementation report. A F1 and B F1 describe the same root cause. All three product Fixes are implemented. The two test-expectation corrections exposed by the repair are handed to A below. No existing assertion or fixture was changed. Three reproduction tests were added, one per product Fix, each carrying a Test-Change citation.

### F1 / A F1 repaired

Test commit d2ff6795, product fix 55ff8868. Blocked member receipts retain the planned nonzero exit and blocker log and additionally record optional blocked naming the blocker. The optional field preserves parsing of existing ledger lines. knownRedReceipt excludes blocked head and base entries. flaky excludes them from observations, and main-red notices exclude blocked candidates and matching historical observations. Green lookup still relies on the writer's invariant that blocked entries always have nonzero exits.

Reproduction test: blocked merge members cannot provide known-red cover or flaky observations. It drives merge verify --known-red through a cheap check failing on both trees, confirms members never run and merge refuses, then makes the cheap stage green and checks that actual member success creates no false flaky observation.

Fail before / pass after, both read with akrogon log:
- check repair-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F1-red-1792881438591-3008219.log
- check repair-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F1-green-1792881446951-3009764.log

Commands: bun test tests/verify.test.ts -t 'blocked merge members cannot' --timeout=30000. The red run first ran the configured dependency setup under flock.

### F2 repaired

Test commit 48947383, product fix 6a054950. Removed the plain-file existsSync prerequisite from reuseSource. The locked reuse key remains tree, scope, name and command text from a completed green entry. Existing akrogon log supplies archived/moved evidence access; no archive reader or fallback was added.

Reproduction test: packing holder logs preserves same-tree command reuse. It uses the supported pack action between actual same-tree verify runs, confirms the old log remains readable from the archive, and checks that only the red command reruns.

Fail before / pass after, both read with akrogon log:
- check repair-F2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F2-red-1792881458191-3012053.log
- check repair-F2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F2-green-1792881466075-3013336.log

Command: bun test tests/verify.test.ts -t 'packing holder logs preserves' --timeout=30000.

### F3 repaired

Initial test commit 5d0b505f, product fix 9aaed138, reproduction-fixture correction 666b1c0f. Both whole-run lookups, greenRun and redRun, now require matching scope, consistent with command reuse and requireGreenReceipt.

Reproduction test: merge verification selects green and red receipts from its own scope. It verifies the leaf and an independent holder checkout at the same head, first green and then known-red. It proves that merge writes its own receipt and that the linked base compares a merge head run rather than a leaf run. Both green and known-red merge gates pass.

Correction to the original review evidence: passing --holder from an owned leaf worktree still selects that leaf and its phase. The original F3 review probe and the first version of the reproduction fixture therefore did not actually exercise merge scope. The corrected reproduction uses a separate, non-leaf worktree at the same commit. Assertions were preserved. The corrected test was then run against src/verify.ts restored from pre-fix commit 5d0b505f, failed, and passed after restoring repaired HEAD. No rejected source remains in the worktree. The original repair-F3-red and repair-F3-green logs are superseded diagnostic runs, not acceptance evidence.

Valid fail before / pass after, both read with akrogon log:
- check repair-F3-scope-red: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F3-scope-red-1792881527337-3021695.log
- check repair-F3-scope-green: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-F3-scope-green-1792881528172-3022024.log

Command: bun test tests/verify.test.ts -t 'merge verification selects green and red' --timeout=30000. Source swaps are kept in check-repair-F3-rejected-source-1792881527020-3021609.log and check-repair-F3-restored-source-1792881527436-3021957.log.

### Current verification

Ran the plan's unchanged proof command after all test and source changes: bun test tests/verify.test.ts tests/flaky.test.ts --timeout=30000, with configured flock/setup first. Result: 51 pass, 2 fail. All newly added reproduction tests and the planned member-receipt criterion cases pass. The two failures are the existing expectations listed under Handed to A.

check repair-criterion-tests: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-criterion-tests-1792881547670-3023609.log

This is not a passing criterion-suite receipt. No tests were filtered, skipped or disabled in that planned proof. No retry/known-red disposition applies: the failures are directly caused by the requested reuse behavior after F2 removes the unplanned log-file restriction.

Targeted format check passes:
check repair-format-check: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-format-check-1792881560474-3035352.log

Checked all receipt consumers for the affected paths. Both whole-run lookups now match scope; the one shared reuseSource covers sequential and concurrent commands; blocked observations are excluded from both known-red sides, flaky and notice matching. land.ts and reconcile.ts use the shared schema and need no separate schema edits. git diff --check passes and the worktree is clean:
check repair-consumers: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-repair-consumers-1792881605997-3144348.log

Criterion 14's docs evidence remains valid: no docs, skills or docs inputs changed in repair. No model or live external operation was used. Every fixture was cleaned in finally. No Nits are retained by B and no operator action is open.

Full akrogon verify completed on committed repair head 666b1c0fbf50628df6e7cc1b5763faf9973e84b2 with exit 1: format 0, test 1 (1160 pass, 2 fail), typecheck 0. The only failing tests are A1 and A2 below. All three reproduction regressions pass in this full run. This is a red receipt, not merge authorization. Logs were read back with akrogon log:

- verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-format-1792881562869-3035453.log
- verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-test-1792881821593-3035453.log
- verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-typecheck-1792881823970-3035453.log

No merge_checks command was run. The worktree remains clean. Requested next phase: check.fix, with A1 and A2 handed to A under the skill's test-expectation exception.

### Handed to A

- A1 — Correct the existing tests/verify.test.ts case "verify --known-red reruns the failing command on a fresh checkout of the exact base and records the linked pair" (around line 447). It seeds greenReceipt on the base, then expects the same command to rerun red and known-red to pass. With design Q3 and the locked base-side reuse, the base green must be reused and the comparison must refuse. The old existsSync requirement accidentally hid the contradiction because greenReceipt names an absent plain log. Preserve the meaningful linked-pair regression while making its fixture/expectations agree with the actual intended scenario. Exception: correction of an existing test expectation belongs to A.
- A2 — Correct the existing tests/verify.test.ts case "a green on the same revision clears only the earlier main-red incident" (around line 849). After seeding a green base receipt it expects subsequent known-red calls to rerun that same base command red, pass and send a second notice. Base reuse must instead read the green entry, refuse red-head cover and add no observation or notice. Keep coverage of actual notice resolution using real observations consistent with the locked reuse behavior. Exception: correction of an existing test expectation belongs to A.

Both use the existing bun test runner and fixture helpers. No proof machinery is absent, and no locked brief/design change is requested. A must rerun the unchanged planned criterion command and akrogon verify after correcting these cases. B makes no move to merge on red verification.

## 2026-10-25 check.review re-check after check.fix

Verdict: ready.
Prior reviewed base: f89afbffbff1dcd7a87d781c812efd030a605cd0.
Prior reviewed head: 15a82fd1007aa3197fddd3293f58b46d604f38a1.
B repair handoff head: 666b1c0fbf50628df6e7cc1b5763faf9973e84b2.
Current base: f89afbffbff1dcd7a87d781c812efd030a605cd0.
Reviewed handoff head: 5b7b2a577861da1d0faed0e279fcd8382f8a10b8.

Reviewed only repairs since the prior reviewed head, including B's product fixes and A's two fixture corrections. Independently computed git range-diff f89afbff..15a82fd f89afbff..5b7b2a5: all six originally reviewed commits are unchanged and nine repair/citation commits are added. No main commits, rebase or conflict resolutions were introduced. The only change after B's handoff is tests/verify.test.ts plus an empty citation commit.

Evidence, both read back with akrogon log:
- check recheck-B-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-recheck-B-diff-1792882501380-357687.log
- check recheck-B-range: 0 /home/ivan/Work/infra/akrogon/issues/open/verify-waste/member-receipts/implementation/check-recheck-B-range-1792882515599-358928.log

### Findings closed

- F1 / review A F1: blocked members carry a nonzero result and explicit blocked source. Neither head nor base blocked entries provide known-red cover. Blocked entries also supply no flaky or main-red-notice observations. The CLI regression and full suite pass.
- F2: command reuse uses the locked receipt key without requiring a plain log file. The actual verify/pack/log/rerun regression passes and proves the archived green entry is reused.
- F3: both whole-run green and red lookups match scope, consistent with the gate. The corrected independent merge-caller regression passes for green and known-red receipts.
- A1: removed only the vestigial green base seed from the linked-pair test. All original assertions remain, including exact base SHA, linked head/base exits and successful phase gate. This preserves the fresh-red linked-pair case without contradicting base-side reuse.
- A2: retained the seeded green that resolves the earlier incident, then advanced main and used a second leaf based on that new main tree. This permits a real fresh-red base observation while preserving the assertions that the next incident sends one notice and its subsequent repeated red sends none. The production notice logic is still exercised.

The cited source for both existing-fixture corrections is the brief's base-side reuse and design Q3. They are valid corrections to setup, not assertion removal or weakened coverage. The existing separate base-green-refusal criterion still guards reused green evidence refusing a red head. No proof-command correction was made: the planned runner and case set remain unchanged. No new Fix or Nit was found. No operator action or handoff item remains.

### Verification

Read all following logs through akrogon log under this leaf's implementation directory:

- check fix-a1-a2-b: 0 implementation/check-fix-a1-a2-b-1792882200036-3863470.log — both corrected cases pass.
- check fix-criterion-tests: 0 implementation/check-fix-criterion-tests-1792882209319-3868091.log — planned bun test tests/verify.test.ts tests/flaky.test.ts --timeout=30000, 53 pass, 0 fail.
- check format: 0 implementation/check-format-1792882217524-3891983.log.
- check test: 0 implementation/check-test-1792882451585-3891983.log — configured bun test --timeout=30000, 1162 pass, 0 fail. Includes both corrected cases and all three repair regressions.
- check typecheck: 0 implementation/check-typecheck-1792882454020-3891983.log.

Receipt e1d3c24c-05b0-4fee-80c6-c1a09cbef8fb is completed with setup 0 and every configured check 0 on commit 3bdc243ea5fef963600ebfac9dff2a31436fd6f3. Its tree 4d129919272ccdc6f54732769a80e958a843b60e exactly matches reviewed HEAD. The later 5b7b2a5 commit is empty. All current test evidence postdates the last test/helper changes. No checks, planned cases or runner settings were skipped or disabled. The previous red receipt on 666b1c0 is superseded by these corrected current-tree results, not waived through known-red.

The unchanged docs/skill proof remains valid. Reopened docs/reference/checks.md to check the live contract: repairs bring implementation into agreement with documented reuse, blocked stages and known-red behavior. No documented behavior changed in A's test-only correction. No AREA.md or lesson file changed in the repair range. No retained reusable Nits require lesson entries.

No rerun was warranted because current committed-tree proofs and required checks are complete and green. No code was edited, no commit was made and no external/live proof operation was run during this re-check. Worktree clean; git diff --check passes.

### Repair Test-Change trailers

Earlier trailers and their judgments remain recorded above. Additional trailers in the repair range all name tests/verify.test.ts:

- d2ff6795: review A F1 / review B F1 cheap-check failures on head and base producing skipped-member evidence. Accepted: added the F1 CLI reproduction.
- 48947383: review B F2 supported chart pack between same-tree verify runs. Accepted: added the packed-evidence reproduction.
- 5d0b505f: review B F3 leaf-to-merge scope mismatch. Accepted with the following fixture correction and superseded-evidence record above.
- 666b1c0f: review B F3 requires a real merge-scope caller because leaf ownership overrides --holder. Accepted: independent merge checkout, assertions preserved.
- 3bdc243e: seeded-green expectations contradict per-command base reuse; remove the linked-pair seed and advance the notice case to an unseeded merge-base. Accepted against brief base reuse/design Q3 and the exact diff. Its wrapped message is supplemented by the complete final trailer below.
- 5b7b2a57: corrected two seeded-green expectations handed by B as A1/A2, describing the seed removal and pushed-main/second-worktree setup. Accepted: complete single-line citation in an empty commit after the last test change.

Request merge with verdict ready.



