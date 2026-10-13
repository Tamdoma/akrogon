# Review B: memory-start-check

Base: `a7c911522773d29d7d2be5b30cce6788268aea50`
Reviewed head: `53ef70a6ec788f786a13688c45f129b4fcaed17e`
Phase: initial `check.review`, 2026-10-13. Debate is off, so no positions/rebuttal artifacts are expected. Peer review was not read.
Verdict: **fix**.

## Fixes

### F1: C2 has no proof that shared memory participates in admission

Source/criterion: brief C2 and design's `anon + shmem < 48 GiB` admission contract. Shared memory is present on this host: a read-only sample of the real uid-derived akrogon.slice memory.stat at review returned anon 13,393,801,216 bytes and shmem 27,817,775,104 bytes.

Trace: every `seedStat` call in tests/run-permit.test.ts supplies only anon; tests/helpers.ts:32 defaults shmem to zero. The nested script also writes shmem zero. No other test supplies nonzero shmem. Replacing src/admission.ts's sum with anon alone would leave every admission test's numeric input unchanged.

Consequence today: the acceptance proof cannot detect omission of the shared-memory component, which permits starts at or above the required threshold on a host using shared memory. Current product code does sum both fields correctly. This finding is missing proof for a specified behavior, not a claimed current product failure.

Required correction: exercise the existing CLI threshold test with anon below 48 GiB and nonzero shmem making the sum reach the threshold. Record a current green run and a deliberate break proving that omission of shmem turns the test red. Keep the proof at the existing CLI boundary.

### F2: C3's shipped default spacing is never exercised

Source/criterion: brief C3 and plan D4/D11 require a default 30 s gap, with the admission test's own launcher exercising the real default.

Trace: tests/run-permit.test.ts:42 supplies AKROGON_SPACING_MS='30000' on every run; cli/fakeAkrogon/fakeHerdr supply '0'. Thus none of these tests reaches src/admission.ts:62's default. Changing that default to zero would not change any tested spacing value. The report describes these tests as proving the 30 s spacing but does not distinguish override from default.

Consequence today: the proof cannot detect a broken default for ordinary run-check users who do not set this test seam. The implementation currently returns the correct default. This is the specific missing C3 outcome and a departure from the planned proof, not a request for general coverage expansion.

Required correction: run the existing spacing scenario with AKROGON_SPACING_MS absent, including from inherited process.env. Show a current green run and a deliberate break of the default that turns this scenario red.

## Verification

- Inspected the full base...HEAD diff, brief, plan, design, report, affected command flow, src/test-files.ts, docs/reference-index.md and the changed behavior's setup/files guide pages.
- The short flock covers the memory read, spacing check, timestamp and live-record update. Waiting runs release it before the 5 s sleep. Nested admission validates token hash, live state, boot ID and proc start time. run-check/base-run preserve token propagation; timing retains held wait_ms and omits it for nested starts.
- The actual uid-derived memory.stat exists and is readable. No live resources were created or mutated by this read.
- Reviewed latest format and typecheck logs and the reported 8/8 admission proof. The latest tests/helpers.ts and tests/run-permit.test.ts changes precede those reported runs. No runner skip/filter/config change appears in the diff.
- git diff --check base...HEAD passed. Worktree was clean before review. No lessons were removed. merge_checks is empty.
- The implementation report's full-suite runs are red. Isolated file reruns and --changed do not establish an inconsistent outcome for the same full-suite command. The fresh configured full-suite check below resolves C8, so the earlier report gap adds no blocking finding.

## Documentation and area paths

The setup guide now describes the implemented memory/spacing start check, files guide describes wait_ms, and README command rows point to admission. No stale permit references were found in the affected live surfaces.

One repository-root listing command checked the backtick paths in each changed AREA.md. All named code, test, skill and documentation paths exist. Missing paths were issues/timings.jsonl, issues/base-runs.jsonl, issues/red-records.jsonl, issues/merge-attempts.jsonl and issues/config.yaml. These are runtime records or authoritative registered-checkout configuration omitted from this worktree, not broken source/documentation pointers. No Fix arises from them.

## Test-Change trailers

- 25c2fd4: tests/run-permit.test.ts cites the brief and locked design replacing the serialized permit with admission. Retired serialization/holder assertions are legitimately replaced. Nested admission remains covered. Accepted source.
- 25c2fd4: tests/helpers.ts cites fake cgroup roots and the spacing seam required to keep the existing suite fast. Existing assertions are not changed. Accepted source.
- 53ef70a: tests/AREA.md cites the rewritten test file for its description. The path matches src/test-files.ts because it is under tests/. No executable expectation changed. Accepted source.

No operator actions. No Nits retained. No code changes or commits made during review.

## Current full-suite result

Executed the exact configured test check from the leaf worktree at reviewed head:

```sh
akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''
```

Terminal exit: 0. 890 pass, 0 fail, 9,214 assertions across 49 files, 220.61 s. This includes all eight admission tests. Setup and own-modules guard passed. No retry or base run was needed for this green review run. C8 now has a passing full-suite check plus the current-head typecheck evidence.

Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test-1791920840368-2484916.log`. Timing record run: `af216787-c5d0-461e-a9d4-a95754db2f3b`; recorded exit: 0.

Phase result: `akrogon phase memory-start-check check.repair --slot B --verdict fix` returned `moved check.repair`.

## 2026-10-13 check.repair

Started from reviewed head 53ef70a6ec788f786a13688c45f129b4fcaed17e. Read both initial reviews.

### Repaired

- review-A F1: committed CLI reproduction in 31920f2, then rejection of blank/whitespace spacing in a02f2b3. The fix adds one condition to the existing parser and leaves explicit zero valid. The fix commit also includes the repository formatter's layout change to the new regression, with its Test-Change trailer.
- Before: `bun test tests/run-permit.test.ts -t 'blank spacing'` exited 1: `Expected: not 0`, one failure, because the blank-env command ran successfully. Kept output: implementation/repair-B-blank-red.log.
- After: the same command exited 0: one pass, zero failures, six assertions covering empty and whitespace overrides and absence of command side effects. Kept output: implementation/repair-B-blank-green.log.

### Handed to A

- review-B F1: missing planned C2 acceptance proof for nonzero shared memory. Existing proof machinery is present, so this is a missing planned test unit, not missing evidence machinery. check.repair assigns missing planned units to A and permits B to write only the regression for the product bug it repairs.
- review-B F2: the spacing launcher overrides the default contrary to plan D11. Restoring the planned default-spacing scenario and producing its deliberate-break proof is a missing planned unit reserved for A. No plan or design file was edited.

No operator actions. No Nits retained by B. Required verification results follow.

### Verification after repair

Final head: `a02f2b3a1dc8eab9ab72308c4978ff5f06c886c4`. Worktree clean; git diff --check passed.

- Planned criterion proof: `bun test tests/run-permit.test.ts`, 9 pass / 0 fail, 222 assertions, 35.18 s. Current formatted test output: implementation/repair-B-admission-current.log. Covers the existing C1–C7 scenarios and new regression. The specific incomplete C2/C3 acceptance proofs remain handed to A above.
- Configured `format`: `bun run format` through akrogon run-check with the printed flocked frozen-lockfile setup and own-modules guard. Exit 0. Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-format-1791920924234-3334011.log`.
- Configured `typecheck`: `bun run typecheck` through akrogon run-check with the printed flocked frozen-lockfile setup and own-modules guard. Exit 0. Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-typecheck-1791920925557-3335318.log`.
- Configured `test`: `bun test --timeout=30000` through akrogon run-check with the printed flocked frozen-lockfile setup and own-modules guard. Exit 0. Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test-1791921100397-3346873.log`.
- Configured `test_changed`: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` through akrogon run-check with the printed flocked frozen-lockfile setup and own-modules guard. Exit 0. Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test_changed-1791921129330-3441457.log`.

Full suite: 891 pass / 0 fail, 9,220 assertions, 167.87 s. Changed tests: 872 pass / 0 fail, 7,832 assertions, 168.00 s. No check retry or base comparison required. merge_checks is empty and was not run.

## 2026-10-13 re-check after check.fix

Prior reviewed base/head: a7c911522773d29d7d2be5b30cce6788268aea50 / 53ef70a6ec788f786a13688c45f129b4fcaed17e. B repair handoff head: a02f2b3a1dc8eab9ab72308c4978ff5f06c886c4. Handed-off refreshed base/head: d9ab2361dfc033f8b90b778686548832615a7dad / 3429266319d9dcd59624e8f8e95cd8c338b7ae55.

Computed `git range-diff a7c9115..a02f2b3 d9ab236..3429266`: all five earlier leaf commits map with `=` to 0f69e28, dd82c25, 1faa283, a0d040d, b69cbbf. Only 3429266 is added. No altered earlier commits or conflict resolutions. Reviewed its tests/run-permit.test.ts diff against the previous rebased head b69cbbf. Main's worker-test-duty commits are outside this repair review.

### Earlier findings

- review-A F1 remains repaired: spacing parser rejects trimmed-empty input, explicit zero remains permitted, and the real CLI regression remains in the branch.
- review-B F1 is resolved: competing waiters receive anon 40 GiB + shmem 9 GiB, so their admission depends on the required sum. Report records the omission-of-shmem deliberate break failing at the memory-wait assertion after 12 s, then the final nine-test proof passing.
- review-B F2 is resolved: launcher removes ambient AKROGON_SPACING_MS when its caller supplies none, exercising the shipped default. Explicit caller seams remain available to nested fixtures. Report records default 30000→0 causing the 1.5 s no-second-start assertion to fail, then the current proof passing.

### Evidence reviewed

Report records nine admission tests green and the full suite 891/891 green on 3429266, after the latest test edits. Current format and typecheck logs are green; git diff --check passes and worktree is clean. No planned scenario was disabled, filtered or skipped by the repair. No documented product behavior changed. No AREA.md, lesson or runner-configuration changes occur in the repair.

New Test-Change trailer in 3429266 cites review-B F1/F2 for the numeric input and launcher changes. These are the specified acceptance outcomes, so the source justifies modifying the prior test inputs. Rebased earlier trailers are unchanged and retain the previously accepted sources.

The reported test_changed run is red (four batch-dispatch timeouts). A single-file green rerun cannot mark the whole changed-tests command inconsistent. The fresh configured whole changed-set run below resolves this gap. No additional product defect or Nit found in the repair. No operator actions.

Also computed the required initial-review range comparison: `git range-diff a7c911522773d29d7d2be5b30cce6788268aea50..53ef70a6ec788f786a13688c45f129b4fcaed17e d9ab2361dfc033f8b90b778686548832615a7dad..3429266319d9dcd59624e8f8e95cd8c338b7ae55`. The three initial commits are unchanged (`=`); the added commits are B's already-proven regression/fix and A's acceptance-test correction.

### Terminal verification and verdict

Executed the configured test_changed command at base d9ab236 / head 3429266 from the leaf worktree:

```sh
akrogon run-check --name test_changed -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\'''
```

Terminal exit 0: 872 pass / 0 fail, 7,832 assertions across 43 files, 228.01 s. Includes all nine admission tests, with the repaired shared-memory input and default spacing. Setup and own-modules passed. Kept log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test_changed-1791922275978-2485686.log`; timing run `26528512-0a13-4bbc-9f99-c1baf17fcdef`. No review-run retry or base comparison needed.

Verdict: **ready**. All initial Fixes resolved. No new blocking findings or retained Nits. No code edits or commits during this re-check.

## 2026-10-13 merge

Attempt: ebb22465-78ee-4702-b743-98dd35ae796f. Applied stack top: 3429266319d9dcd59624e8f8e95cd8c338b7ae55. Batch base / refreshed AKROGON_BASE: d9ab2361dfc033f8b90b778686548832615a7dad. No carried members. State attempt, batch top and HEAD agree; worktree clean. No fetch, rebase or commit performed.

Read merge-issue skill, refreshed config, existing plan/report/reviews and parent concurrent-checks/ISSUE.md. No merge_covers, merge_checks or advisory commands are configured, so all four checks run. No external proof mutation or fixture grants are needed. Format and typecheck completed green on the recorded top; both test checks are pending.

Merge test_changed first run: terminal exit 1, 871 pass / 1 fail, 207.92 s. Only failure is tests/next.test.ts: `named target equivalence: owner name matches folder path from root, subfolder and worktree`, timeout at 60,000.83 ms. Log: implementation/check-test_changed-1791922667206-3555966.log. The test loops through owner-name/path dispatch from root/sub/worktree; src/next.ts, owner-selection implementation and this test are unchanged by the stack. Fixture env additions affect admission, which this dispatch scenario does not run. The full-suite run on the same top passed this test. No plausible leaf cause found. First-run record saved in merge-test_changed-comparison.json before retry. One retry uses identical command, args, cwd and whole changed-set scope.

### Merge terminal check results

- Configured format: exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-format-1791922330403-3537770.log`.
- Configured typecheck: exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-typecheck-1791922328273-3537771.log`.
- Configured test: exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test-1791922514562-3555965.log`.
- Configured test_changed: exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/memory-start-check/implementation/check-test_changed-1791922874805-686816.log`.

Full suite: 891 pass / 0 fail, 9,220 assertions, 175.50 s. Exact whole changed-set retry: 872 pass / 0 fail, 7,832 assertions, 184.86 s, including the previously timed-out owner equivalence test. The first run and retry used unchanged base d9ab236 and top 3429266, same args/cwd/scope. Comparison outcome is inconsistent, so no base run is needed. Detailed command and per-unit logs are in merge-test_changed-comparison.json; unverified denotes no base verdict, not incomplete leaf/retry runs. This inconsistent record is retained as evidence, not submitted as a known-red comparison.

All checks completed, no code/HEAD changes. No advisory findings. concurrent-checks still has the open run-units leaf, so this batch closes no completion owner.

### Merge push blocker: GitHub authentication

Test stamp: `akrogon phase memory-start-check merged --slot B --check --attempt ebb22465-78ee-4702-b743-98dd35ae796f` returned `ok`.

Attempted push through the authorized lifecycle command: `akrogon phase memory-start-check merged --slot B --attempt ebb22465-78ee-4702-b743-98dd35ae796f`. Terminal exit 1. The command reported `Push failed: git push exited 128: fatal: could not read Username for 'https://github.com': No such device or address`. Target: https://github.com/Tamdoma/akrogon.git, origin/main. Tested head remains 3429266319d9dcd59624e8f8e95cd8c338b7ae55; leaf remained merge after the rejected push. No completion owner line was emitted. No broadcast is due.

Identity check: `gh auth status` reports active GitHub account ivanjuras (default), with invalid token. No credential value was read or recorded. Owner: operator. Exact required operator action: `gh auth login -h github.com`, then `gh auth setup-git` to provide Git HTTPS credentials. Restore valid authentication before restarting this leaf. The skill requires reporting other push errors rather than retrying, so no push retry occurred.
