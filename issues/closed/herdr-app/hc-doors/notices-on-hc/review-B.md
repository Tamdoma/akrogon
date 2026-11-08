# Review B: notices-on-hc

2026-11-08, slot B, initial check.review. Verdict: **fix**.

Base: `e3202dff4cf2a660cb26004e1ef3d2e8af883193`.
Reviewed head: `e79eed95aa7e61b29622aed5f750394986a0a0fb`.
Reviewed the whole diff against brief C1-C6, design, plan D1-D15 and the implementation report. No peer review was read or requested. No product edit or commit was made.

## Fixes

### F1: Preserve pending-notice cleanup when recovery cannot resolve the session

Priority: P2. Location: `src/phase.ts:164-187,199-212` (`commitMove`). Hits brief C2 and plan D6.

Real source: an operator recovers a failed leaf while its hc core is stopped. A normal `akrogon phase recover failed --slot A --reason 'dependency unavailable'` writes the pending failed notice. A real `hc server stop` stops that session without deleting its herdr-app home or notice file. The operator then runs `akrogon phase recover implement` without `--slot`, the supported recovery action.

`commitMove` saves phase `implement` and drops `failure` before `repoNotices` resolves the session. Resolution refuses the stopped core. The command exits 1 after printing `moved implement`, but the committed leaf has `failure: undefined` and the failed notice still exists. Subsequent dispatch has no pending-failure record to retry its removal. Reopening the session lets the handler show an obsolete failed notice after recovery. The same ordering drops pending `batch.notified` and busy metadata before stale-file removal.

Evidence: `check b-stopped-recovery: 1 implementation/check-b-stopped-recovery-1794108434287-3699809.log`, read back with `akrogon log`. The proof used `fixture`, `hcCore`, `leaf` and `cli` from the existing test helpers, generated the notice through the actual phase CLI, stopped the real core, and invoked recovery through the actual CLI. It asserted that the committed phase was `implement`, then failed because `existsSync(notice)` was true. Output records recovery exit 1, `moved implement`, refusal `no running session holds it`, phase `implement`, failure null, pendingFileExists true. This red is caused by the reviewed cleanup ordering, so the unrelated-red retry rule does not apply.

Repair: keep the cleanup obligation until stale files have been removed. A session-resolution or removal failure must not commit a recovered state that permanently forgets its pending files. Check all three stale-notice kinds in this function. Add the smallest regression case through the existing phase CLI fixture, show it red before the repair and green after. This needs no attended window launch or grant renewal.

The reproduction's temporary test file was removed by its shell trap. The core was stopped, its fixture socket/state discarded, and its scratch repository removed in `finally`.

## Verification and criteria

- C1/C3: the writer publishes by same-directory rename, caller IDs include the repo, and the real-core tests cover routing, pending/shown folding, duplicate suppression, failed writes and dead-process coverage. Verify writes and records notices within the ledger lock. Existing checks are green on the exact reviewed head. C2's happy paths pass, but F1 exposes a missing failure path.
- C4: read back `check tier-notices-2: 0 implementation/check-tier-notices-2-1794108306763-3688012.log` (1 pass, 22 assertions). Inspected `implementation/notices-tier-2/open.png`: both closed-window and open-window notice texts are visible. Status captures contain toast overlays and no errors, window.log records shown IDs o1/o2/o3, pactl.txt contains one new sink-input, and absence.txt records absent. Read back `check tier-nohandler-2: 1 implementation/check-tier-nohandler-2-1794108295310-3687660.log`: it fails before a start and explicitly names herdr-setup and its install action.
- C5: the product diff deletes notice calls and their old lookup imports. The report's scoped grep remains applicable because later commits affect only the tier tests and trailer. The remaining shell helpers have the observe.ts importer named by D13.
- C6: final verify test log reports 1271 pass, 0 fail, 84.62 s against the 75 s median. The report explains the roughly 15 fixture-core cases and the 79.4/81.7/84.6 s spread, and names the replaced tests.

Receipt audited: `d7e99dc2-4b4b-4e4c-ab1c-5c0b7818b9ab`, exact reviewed head/tree, setup 0, format 0, typecheck 0, test 0. Read back the format, typecheck and test logs named by that receipt with `akrogon log`. `check b-evidence: 0 implementation/check-b-evidence-1794108450388-3700796.log` captures those read-backs. No check runner/config change skips or filters the planned criterion cases. No current test proof predates its latest test/helper change. Reused this current receipt instead of rerunning the full suite without a new reason.

The earlier stale-socket inconsistency on `6722c4ae` is superseded by the passing current-head receipt. No known-red result is needed for this review.

The `e79eed95` tier expectation correction preserves all three shown-line checks and moves their observation after session stop. The report cites the earlier real empty window log and later passing run on the corrected head. It changes observation timing without dropping a criterion case or widening the live operation. Other expectation changes match the file interface required by the brief/design. No proof-command replacement was made.

## Documentation and paths

Opened docs/reference-index.md, the changed notice behavior in docs/reference/commands.md, docs/reference/state-and-phases.md, docs/reference/checks.md, docs/use/watch-while-away.md, the watch skill's needs-you line, and the two AREA files. Notice documentation reflects pending files and herdr-setup delivery. F1 also contradicts the documented removal on recovery.

Each changed AREA file had one command list its named paths from the worktree root:

- `check b-area-src: 0 implementation/check-b-area-src-1794108464256-3702281.log`.
- `check b-area-tests: 0 implementation/check-b-area-tests-1794108464259-3702282.log`.

Both logs were read back. Source/test/doc paths exist. Missing entries are pre-existing templates, installed mod paths, or untracked issue records held in the registered checkout. None is a new dead source pointer with a consequence caused by this leaf. No lesson file was reviewed as input or changed.

## Grant audit and operator actions

Read readiness grants[0] and the earlier count lines. T1 made 2 starts and T2 made 2, matching the two tier launch logs and check_start/check_end events in issues/timings.jsonl. The operator renewal permits 4 total. Count is 4 of 4, no unexplained launch or overrun. `check b-receipts-counts: 0 implementation/check-b-receipts-counts-1794108477144-3704086.log`, read back with `akrogon log`, records that audit and the current receipt.

This review launched no covered window or paid operation. Its throwaway core was the ordinary test fixture, outside the attended grant's named session. No operator action is required to repair F1. Existing C4 proof stands unless a repair changes one of its recorded inputs.

## Nits

None.

## Test-Change trailers

The following is the complete `git log e3202dff..HEAD` Test-Change trailer listing, paired with each commit. Judgments above accept the interface-driven replacements, fixture-only changes, D15 parameterization and cited correction. The docs-only tests/AREA.md change is cited by the later trailer-only commit. Added tests need no prior expectation source.

```text
e79eed95 test: read the notices tier's window log after the window stops
Test-Change: tests/e2e/notices.e2e.ts real output: implementation/check-tier-notices-1794107396693-3070533.log fails at the shown-line read while implementation/notices-tier/window.log is 0 bytes; the shown-line expectations move after the window stops, no other expectation changed

6722c4ae docs: cite the tests/AREA.md notice wording
Test-Change: tests/AREA.md plan U7 docs; the hc-fixture notice helpers and the session-routing notice line describe notice files, doc text only, no expectation

df926770 test: notices window tier for criterion 4
Test-Change: tests/e2e/notices.e2e.ts brief criterion 4 and plan D15; new attended tier, red without the handler (implementation/check-red-tier-nohandler-1794107117071-2413364.log)
Test-Change: tests/e2e/tier.ts plan D15; session paths become TierSession values (tierSession, engine), startTier takes the session and Tier carries it, absent takes it; no existing expectation changed
Test-Change: tests/e2e/window.e2e.ts plan D15; passes engine to startTier and reads engine.name/engine.appHome, no expectation changed
Test-Change: tests/e2e/kinds.e2e.ts plan D15; passes engine to startTier, no expectation changed

6c42e1c0 docs: notice files in area and reference docs

be56144b test: the failed notab pass exits as a failed leaf does
Test-Change: tests/phase.test.ts real output "Leaf is failed and needs phase recovery: notab" (exit 1) from next --all; the two notab next --all exit expectations become 1

9a44ec90 test: failed moves in capture and attempt cases run on an hc core
Test-Change: tests/abandoned-capture.test.ts real output "session list failed" from repoSpace without an hc core; the abandoned-pair case runs an hc core instead of fakeHerdr env, no expectation changed
Test-Change: tests/merge-attempts.test.ts real output "session list failed" from repoSpace without an hc core; the failed unlanded holder case runs on hcFixture with hcHerdr, no expectation changed

0daddb7a test: session routing cases observe notice files
Test-Change: tests/session-routing.test.ts design Standing design "Tests of herdr notification show calls are deleted with their reason" and D3 (the repo space's session); five notice cases and the notice clause of the land wake case assert noticeFiles on the repo core and a decoy core instead of fake herdr session calls, dead rawCalls/toSession helpers removed

b0218335 test: phase cases write notices through a fixture core
Test-Change: tests/phase.test.ts design Standing design "Tests of herdr notification show calls are deleted with their reason" and Q2 2a (pending until deleted); fakeHerdr env replaced by an hc core in three failed-move cases, 'shown' delivery becomes 'pending', rename-loop notices read from noticeFiles, failed-delivery case keeps the blocked-write variant only

87374d67 test: next cases observe notice files
Test-Change: tests/next.test.ts design Standing design "Tests of herdr notification show calls are deleted with their reason"; notices(f) fake herdr reads become noticeFiles(f.core), the failNotification toggle and dead herdr database helpers removed

7075fc66 fix: record the failed delivery before removing stale notices

bd522749 feat: engine notices write notice files

7b59d23c test: merge-slow cases observe notice files
Test-Change: tests/slow-merge.test.ts design Standing design "Tests of herdr notification show calls are deleted with their reason"; three merge-slow cases run an hc core with coreEnv and assert noticeFiles instead of fake herdr calls, dead noticeCalls helper removed

fc32d86a test: verify main-red cases observe notice files
Test-Change: tests/verify.test.ts design Standing design "Tests of herdr notification show calls are deleted with their reason" and Q2 2a (pending until deleted); five main-red cases count noticeFiles on an hc core instead of fake herdr calls, 'shown' replies become 'pending', the absent-herdr case is renamed for the unreachable hc session, dead noticeCalls helper removed

ed5a2547 feat: verify notices write notice files

aef58c14 docs: watcher needs-you notice through akrogon notice

20b0a02f test: contract for the notice verb
Test-Change: tests/command-reference.test.ts design Literal interfaces 'Notice verb: akrogon notice --title <text> --body <text> [--attention] ... row in docs/reference/commands.md and contracts in tests/command-reference.test.ts (E)'; added the notice contract, no existing expectation changed

4c64b7b4 feat: notice module and akrogon notice verb

b7c98591 test: notices-on-hc criterion cases for notice files
Test-Change: tests/hc-fixture.ts plan.md interfaces; adds noticeFolder, noticeFiles and blockNotices for brief criteria 1-3
Test-Change: tests/next.test.ts brief criteria 1-2; the busy test now observes notice files instead of fake herdr calls (plan old tests replaced)
Test-Change: tests/phase.test.ts brief criteria 1-2; failed notice cases observe files, herdr retry sub-case deleted (plan old tests replaced)
Test-Change: tests/batch-dispatch.test.ts brief criteria 1-2; merged notice cases observe files, fold and removal on leaving failed
Test-Change: tests/verify.test.ts brief criteria 1 and 3; main-red cases observe files, the dead-process pending case inverted per criterion 3
Test-Change: tests/slow-merge.test.ts brief criteria 1 and 3; merge-slow cases observe files, the stale-pending case inverted per criterion 3

```

## Phase result

Requested check.repair with slot B verdict fix. The phase command printed moved check.repair and the saved state confirms phase: check.repair. Its later log append failed because run-check removes XDG_RUNTIME_DIR: Move to check.repair is committed, but log append failed: XDG_RUNTIME_DIR is not set: cannot find hc sessions. Kept output: check b-verdict: 1 implementation/check-b-verdict-1794108571270-3713329.log. The mutation was not retried. This is a command-environment follow-up failure in the installed base release, separate from F1.

## check.repair: 2026-11-08

Entry head: `e79eed95aa7e61b29622aed5f750394986a0a0fb`. Read both initial reviews, brief, design, plan (including implementation notes), report and readiness. Review A has no Fixes. F1 is repaired in this pass. No item is handed to A and no operator action is open.

### F1 repair and evidence

Reproduction commit: `bee5f22606bd5b49c33e06a0325c7812d93d0546`.
Product repair: `47c6c3f658ad5816ed9e45dfc27fe361c8fec630`.

The one new reproduction test is in tests/phase.test.ts and its Test-Change trailer cites the actual F1 operator recovery after hc server stop. It checks refusal without losing failed/merged pending records, immediate failed-stop commitment with busy cleanup retained, cleanup during a later failed dispatch, and successful recovery after the real core restarts. Existing expectations are unchanged.

- Red on the old product with the final reproduction input: `check repair-f1-red-final: 1 implementation/check-repair-f1-red-final-1794108799292-3725658.log`. Recovery incorrectly committed implement and lost the failed/merged pending records. The temporary product copies were restored by a trap and removed.
- Green with the repair: `check repair-f1-green-candidate: 0 implementation/check-repair-f1-green-candidate-1794108790198-3724295.log`, 1 pass and 18 assertions.
- Planned C1/C2/C3 boundary proof on committed repair head: `check repair-c1: 0 implementation/check-repair-c1-1794108852858-3727319.log`, 356 pass, 0 fail, 33.04 s across the exact seven test files in the planned C1 command. The original busy-clear, failed recovery and merged recovery cases pass independently of B's added reproduction. No planned case was removed or filtered. The targeted -t runs above were only the added reproduction's red/green proof.

The first expanded reproduction fixture accidentally held a merged notice without a landed candidate. The unrelated batch reconciler correctly dropped that invalid batch. The fixture was corrected to record its landed candidate, preserving every assertion. The final reproduction was re-shown red on the old product, and the test commit was amended before the product fix commit.

Root repair: recovery deletes pending failed/merged files before committing the state that drops their records. Merging removes pending busy files before clearing them. A stop into failed still commits immediately and records failed delivery, retaining busy cleanup until removal succeeds. Failed dispatch retries that cleanup through the same clearBusyNotices helper.

The earlier implementation repair `7075fc66` preserved failed-delivery recording by putting announcement first, but left the state reset before stale-file cleanup. This repair preserves both obligations rather than moving that failure between them. Searched every removeNotice call and every busy_notified clearing path in src/phase.ts and src/next.ts. observeBusy already removes before clearing its record. commitMove's failed, merged and busy paths now keep a cleanup trigger until successful removal. No new schema, fallback or retry loop was added.

### Proof reuse and scope

C5 rerun because src/ changed:

- `check repair-c5-calls: 0 implementation/check-repair-c5-calls-1794108837241-3782663.log`.
- `check repair-c5-callers: 0 implementation/check-repair-c5-callers-1794108837241-3782658.log`.
- `check repair-c5-importers: 0 implementation/check-repair-c5-importers-1794108837241-3782669.log`. Only shell definitions and observe.ts remain, as D13 requires.

C4 retains launch T2's green window proof. The changed files are src/phase.ts, src/next.ts and tests/phase.test.ts. The tier exercises the notice verb, whose case dynamically loads hc/notice and does not load phase or next; its writer, verb, tier/helper inputs and installed handler are unchanged. No new attended launch is needed. The grant count remains 4 of 4 and no covered operation was launched in repair.

The reproduction and planned tests use ordinary isolated real-core fixtures and their existing cleanup. No temporary helper remains in the worktree. The worktree is clean after the two repair commits. No documented contract changed beyond enforcing C2, and no documentation or AREA file was edited. No new reusable Nit is held by B.

### Final checks

The committed head is `47c6c3f658ad5816ed9e45dfc27fe361c8fec630`. The merge move's required `akrogon verify` is running as pass `3cd49b80-9749-4873-a312-882e5081295a`; completion and C6 duration are recorded below before the move.

### Inconsistent full-check result

The first final-head verify (pass `3cd49b80-9749-4873-a312-882e5081295a`) had format/typecheck green and test red: `implementation/check-test-1794108962385-3847441.log`, 1271 pass, 1 fail, 85.74 s. The failure was tests/run-units.test.ts, "a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run", at its assertion that the receipt checkout path is already absent.

Cause judgment: that test is unchanged in `e3202dff..HEAD`. The base already publishes the receipt's end before removing the checkout. This test runs a leaf-scope verify with no compares link, so the changed main-red/merge-slow notice paths are not executed. No changed phase/next cleanup path participates. `check repair-red-cause: 0 implementation/check-repair-red-cause-1794108986233-4175099.log` records the test, diff and base cleanup ordering.

One retry used the printed configured test command unchanged (`bun test --timeout=30000 --parallel=4 --no-isolate`, same setup/guard, leaf scope, on the same committed tree in the leaf worktree after verify removed its checkout): `check test: 0 implementation/check-test-1794109071199-4171970.log`, 1272 pass, 0 fail, 86.59 s. Both logs were read back with akrogon log. Disposition: **inconsistent**. No known-red run or base-red issue filing applies to a green retry.

A new verify pass `38195c68-7302-4997-9b2c-01ba50adc1fc` is collecting the whole-green current-head receipt required by the merge gate.

### Blocking final check result

The second current-head verify, pass `38195c68-7302-4997-9b2c-01ba50adc1fc`, finished red: setup/format/typecheck 0, test 1, 1259 pass and 13 fail, 87.82 s. Test log: `implementation/check-test-1794109172831-305373.log`. All 13 failures were in tests/batch-dispatch.test.ts at allocatedLeaf's initial plan.synthesis next call, before any repaired failed/recovery cleanup path. Those cases were green in the planned proof and first same-head full-check retry.

The required same-command retry was `check test: 1 implementation/check-test-1794109357391-752330.log`, 1271 pass and 1 fail, 91.85 s. It waited for chart-door-on-hc's configured full test slot, then ran to completion. All 13 batch-dispatch failures cleared, but tests/hc-teardown.test.ts "a killed seat starts again under its old name without name_taken" failed at line 93 because next returned 1. That test, src/hc.ts and src/seat.ts are unchanged from the base; the repaired failed-phase cleanup is not reached by its normal active-seat restart. No failing CLI stderr is printed by that existing assertion, so its underlying refusal is unestablished. No claim is made that this is a confirmed base bug.

`akrogon verify --known-red` then exited 1 with `verify known-red 47c6c3f658ad5816ed9e45dfc27fe361c8fec630: fail`. The merge-base is e3202dff, whose tree already has whole-green receipt `3ed67bb9-ff0b-40dd-b088-7e0f90e57484`. No base replay ran and there is no linked matching red base proof. That known-red failure correctly blocks. No base-red issue was filed. `check repair-gate-evidence: 0 implementation/check-repair-gate-evidence-1794109410002-1372926.log` records both red head receipts and the green base receipt. Red test logs, cause trace and receipt audit were read back with akrogon log.

F1 stays repaired with planned boundary proof green. The configured test check has no whole-green receipt on the repaired tree, so this pass cannot move to merge. No unrelated test or engine repair is attempted without a demonstrated source. No test expectation correction has been established to hand to A.

Stop reason: test check remains red after the required retry and known-red fails. Next action: establish and clear the allocation/restart failures, then recover this leaf with `akrogon phase notices-on-hc check.repair` (no --slot) and resume B. A current-head green verify receipt is still required before merge. Existing repair commits and the clean worktree are kept.

C6: final verify test duration 87.82 s versus baseline median 75 s (+12.82 s). The unchanged repaired tree ran 85.74, 86.59, 87.82 and 91.85 s across verify/retry runs. The new single-core regression measured 0.5-2.6 s depending on load, on top of the roughly 15 core-starting cases already documented by A. These timings show variable real-core overhead, including the concurrent test-slot contention, rather than additional test cases between runs. No old test was replaced by repair.

## Resumed check.repair: 2026-11-08

Entry and final head: `47c6c3f658ad5816ed9e45dfc27fe361c8fec630`. The operator recovered the leaf to check.repair. Re-read the skill, references, brief, design, plan, both reviews and implementation report. The worktree is clean and the F1 reproduction/product commits remain unchanged. No new code, test or documentation edit was needed.

The missing whole-green current-head receipt is now present: `e9ae394c-a53b-4200-a444-626b883ce6ff`, setup 0, format 0, typecheck 0, test 0. All three logs were read back with `akrogon log`. Test: 1272 pass, 0 fail, 93.70 s. The earlier allocation, killed-seat and receipt-cleanup failures all pass on the same repaired tree, so the prior red observations remain recorded as inconsistent. No known-red exemption or base-red filing is used to pass this gate.

- `verify format: 0 implementation/check-format-1794109713568-2342429.log`.
- `verify typecheck: 0 implementation/check-typecheck-1794109716425-2342429.log`.
- `verify test: 0 implementation/check-test-1794109848446-2342429.log`.

C6: test 93.70 s against the historical 75 s median, a rise of 18.70 s. This identical repaired tree previously ran 85.74-91.85 s, including a whole-suite green at 86.59 s. The repair adds one real-core regression to the roughly 15 core-starting notice cases already listed in the implementation report. The unchanged-tree spread is runtime variability. The added core cases and that variability explain the observed rise without changing runner scope or adding fixed waits. The full-test slot wait behind watcher-on-hc is separate from Bun's measured test duration.

F1's existing planned 356-test boundary proof, C5 grep proof and C4 window proof remain applicable because no inputs changed since the last pass. No covered operation was launched and the attended grant remains at 4 of 4. No Fix, handed-to-A item or operator action remains. No new reusable Nit is held. Next move: merge with slot B.

### Repair citation completion

The final merge preflight refused the frozen-plan citations for src/next.ts and src/phase.ts: `check resume-merge-gates: 1 implementation/check-resume-merge-gates-1794109900679-2775667.log`. Added empty commit `d40c155648a5133f0223a64827dd64950c48f59e` with one Test-Change trailer for each source file, citing F1 and brief C2. No source, test, expectation or proof command changed. Both source-file trailers accurately describe the repairs.

Final head: `d40c155648a5133f0223a64827dd64950c48f59e`, tree `f57c9bc8f55fd4c0ce737ae33b6b3068886b0d21`, identical to tested repair head 47c6c3f. The current-head receipt remains e9ae394c-a53b-4200-a444-626b883ce6ff by tree identity. The repeated merge preflight is green: `check resume-merge-gates-cited: 0 implementation/check-resume-merge-gates-cited-1794109912022-2776312.log` (ok). Both guard logs were read back. Worktree clean. All findings repaired, no handed-to-A items or operator actions remain. B moves to merge.
