# Review B: known-red-leaf

Date: 2026-10-11. Phase: check.review, initial blind review.
Base: `64f27d0e3c4ae254a6aafd49ea393033dc677606`.
Reviewed head: `27b1cc868c8845616f0b200f6fb75f57fb77de62`.
Verdict: **fix**.

Read the brief, locked design, plan including implementation notes, implementation report, reference index, affected documentation and full implementation diff. Debate is off, so positions/rebuttal artifacts are absent as expected. No peer review was read. No product files were edited or commits made.

## Fixes

### F1 — A red retry can bypass the required counterpart run

Location: `src/compare.ts:45-60`, `validateComparisons`.
Source/criterion: brief done-criterion 2 explicitly requires a without-change run after a red retry, and plan D2 defines `inconsistent` as a green retry with no counterpart. This is a named acceptance outcome, independent of a production incident.

The `inconsistent` schema shares `retry.outcome: pass|fail` with the compared schema. It admits `outcome: fail` with `units: []`; validation then skips counterpart validation and the unit loop. A completed red retry with no base run is accepted on a forward move.

CLI proof against the reviewed head: an isolated real git worktree and leaf in `implement`, existing first/retry logs, `state: inconsistent`, `retry.complete: true`, `retry.outcome: fail`, no counterpart fields, `units: []`. `phase probe check.review --slot A --compare <record>` exited 0, printed `moved check.review`, and persisted `check.review`. Evidence: `implementation/review-B-probe.log`. The script and fixture were removed.

Consequence today: the record validator can admit a still-red check without the comparison done-criterion 2 requires. Make the inconsistent variant require a completed passing retry, and cover the refused red-retry state at the CLI boundary. This is record-state validation, not log interpretation.

### F2 — Notice delivery retries despite the explicit single-attempt rule

Location: `src/phase.ts:242`, through `herdrCall` at `src/phase.ts:50-66`.
Source: the real Herdr integration's structured `timeout` error is recognized by `src/shell.ts:163-183`. The new notice path calls the existing helper, which makes a second call on that error.

Plan D4 requires recording the notice result or error, warning on failure, and no retry. The design limits delivery to one notice per opened entry and stores delivery separately. The existing hold-notice call shape can be reused without importing its retry policy.

Boundary proof used the existing `fakeHerdr` timeout behavior (`failNotificationOnce`) and a real `base-run` exiting 3. The accepted phase move opened one entry, invoked `notification show` **twice**, warned `herdr call failed, retrying`, and stored only the second call's success. Evidence: `implementation/review-B-notice.log`. The script and fixture were removed.

Consequence today: a timeout produces an unauthorized second delivery attempt, can duplicate a notice when the first timed out after delivery, and replaces the first attempt's error with a success event. Use one Herdr call for red notices, with its result/error appended and no retry. Hits plan D4 and done-criterion 4's one-notice contract.

### F3 — The new doc tests mechanically judge prose wording

Location: `tests/red-docs.test.ts:31,38,51-52`.
Source: the real configured `bun test --timeout=30000` suite executes this new file. The assertions require prose patterns such as `Failed ... always block`, `(never|not)...compar`, and ban `still ends the pass failed` anywhere in the scanned documentation. They do not validate a CLI command or state transition.

Consequence today: harmless rewrites of the same rule are rejected, while an unrelated sentence containing the expected tokens can satisfy the test. For example, expressing the rule as “A failed check blocks unless every failing unit has a validated known-red record” preserves the policy and fails line 31's wording requirement. This contradicts the user's Function over form rule and check-issue's explicit instruction to reject akrogon tests of prose/output wording except commands, numbers, or fixed references that run literally as written.

Remove the prose predicates and record criteria 8/9 as a semantic documentation review. Literal CLI flag/command contracts may remain. This is a correction of existing test expectations, so the repair seat must hand it to A under the skill rule.

## Verification

- Worktree was clean before and after review. Head stayed `27b1cc868c8845616f0b200f6fb75f57fb77de62`.
- Reran `bun test tests/compare.test.ts tests/red-docs.test.ts --timeout=30000` for the specific validation/notice/prose concerns: 30 pass, 0 fail, 255 assertions. The passing suite does not cover F1 or the retryable notice failure in F2.
- Accepted unchanged report evidence for `bun run typecheck`, `bun run format`, `bun test --timeout=30000` (788 pass, 0 fail), and `bun test --changed=$AKROGON_BASE --timeout=30000` (169 pass, 0 fail). No changes skip, filter or disable that suite or its runner configuration. The report head differs only by a trailer-only commit.
- Plan criteria 1-7 have CLI tests and real boundary wiring. F1 exposes a missing record-state refusal in criterion 2. Criteria 8/9 were also reviewed by meaning. The guide and skills now describe retries and comparison records. Completed base-red failed stops were removed from pre-merge paths. Incomplete-run stops and own-criterion repair remain.
- Inspected add/resolve calls inside phaseCommand's existing global lock, fresh record reads, provenance matching, ancestry refusal, partial resolution, recurrence, status, check-only behavior and merge/failed flag exclusions. No nested global lock was introduced.
- AREA listing was performed from the worktree root for every changed AREA file. All named source/test/doc files exist. Missing `issues/`, `issues/config.yaml`, `issues/base-runs.jsonl`, `issues/red-records.jsonl` and bare `base-runs.jsonl` are runtime/registered-checkout records excluded from this code worktree, not dead source pointers. `scripts/observe.ts` and `scripts/log-tail.ts` are contextual paths beneath `skills/watch-issues`, where both exist. No dead-pointer consequence requiring a Fix was found.
- Merge-owned base-red/hold references remain excluded, including merge-issue, guide/merge, guide/next, guide/cheat, README hold commands and implement-issue's merge-bounce replay. No pre-merge instruction was found to reuse an earlier base result.
- The two unrelated formatting changes are generated by the configured write-mode format command, as recorded in the report, and change no behavior.

## Test-Change trailers

Reviewed the trailers in `64f27d0..HEAD` against `src/test-files.ts` and their cited sources:

- `8ee95de`: `tests/base-run.test.ts` adds the log-path expectation required by done-criterion 2, with no old expectation removed. `tests/command-reference.test.ts` adds the brief's literal `[--compare <file>]` synopsis. Accepted.
- `95b3c6e`: `tests/compare.test.ts` separates the actual base-run command from the mutated comparison command, permitting the required command-mismatch refusal. Accepted against the base-run record contract.
- `91b7160`: `tests/compare.test.ts` corrects the fixture's setup requirement, required batch `applied` field, and recurrence counting against live guard/schema/event behavior. Accepted. The setup hunk was completed by `6edee21`.
- `6edee21`: `tests/compare.test.ts` supplies setup for the real base-run own-modules guard. Accepted against that integration's observed exit and guard contract.
- `f53a0d8`: `tests/compare.test.ts` distinguishes generated UUID events from fabricated sibling IDs after the file-path filter proved wrong. Accepted against actual opened-event output.
- `27b1cc8`: `tests/AREA.md` cites the added file-index entries from `04babfc`. This path matches the test-file rule even though it is documentation. Accepted as index changes with no test expectation change.

No lesson lines were removed. No additional Nits or operator actions remain.

## Requested disposition

Request `check.repair` with verdict `fix`. F1/F2 are product fixes. F3 belongs to A because it corrects test expectations. The command's actual result is recorded below after the phase call.

Actual phase result: `akrogon phase known-red-leaf check.repair --slot B --verdict fix` exited 0 and printed `moved check.repair`.

## 2026-10-11 check.repair

Started from reviewed head `27b1cc868c8845616f0b200f6fb75f57fb77de62`. Read both initial reviews. A had no Fixes. B repaired F1 and F2, leaving F3 for A as required for test-expectation corrections.

### Repairs

- **F1:** Reproduction commit `f73de41`, fix commit `0d37285`. The inconsistent record variant now requires `retry.complete: true` and `retry.outcome: pass`, so a red retry cannot bypass counterpart validation. One new CLI refusal case was added to the existing refusal table. `bun test tests/compare.test.ts -t 'marks a red retry inconsistent' --timeout=30000` failed before the fix (exit 1, expected nonzero CLI exit but received 0) and passed after (exit 0, 1 pass / 0 fail). Logs: `implementation/repair-B-F1-red.log`, `implementation/repair-B-F1-green.log`. The test commit's Test-Change trailer cites B F1, criterion 2 and the observed CLI admission.
- **F2:** Reproduction commit `db202e9`, fix commit `d6672cb`. Red notices now call `herdr` once instead of the retrying `herdrCall`; the existing error/notice event path records that attempt's failure. One new CLI timeout reproduction uses the existing Herdr fixture's real structured timeout error shape. `bun test tests/compare.test.ts -t 'a notice timeout' --timeout=30000` failed before (exit 1, expected 1 delivery attempt but received 2) and passed after (exit 0, 1 pass / 0 fail). Logs: `implementation/repair-B-F2-red.log`, `implementation/repair-B-F2-green.log`. The test commit's Test-Change trailer cites B F2, the timeout integration and plan D4.

No existing test expectation was changed. No plan/design edits, operator actions, external live mutations or merge checks were performed.

### Handed to A

- **F3:** Correct the existing prose-based expectations in `tests/red-docs.test.ts`, preserving applicable literal command/flag contracts and recording semantic review for criteria 8/9. Only A corrects existing test expectations.
- **F4:** Correct plan.md's criterion 2/3 proof commands. Executing the planned `bun test tests/compare.test.ts -t refusal` and `bun test tests/compare.test.ts -t verdict` exits 1 with `regex ... matched 0 tests`, skipping all 28 tests. Source: the actual commands in the criterion proof map against the existing test names. Consequence: those prescribed proofs execute no acceptance case. Logs: `implementation/repair-B-proof-2.log`, `implementation/repair-B-proof-3.log`. This is a plan command error, which B cannot edit. Proof machinery is present and the unfiltered comparison suite proves those outcomes (28 pass / 0 fail), so this is not a missing-machinery stop. Update the commands and report evidence through A's check.fix.

### Criterion proof

Executed every planned runnable proof command on repaired head `d6672cb`:

| Command | Exit/result | Log under implementation/ |
|---|---|---|
| `bun test tests/compare.test.ts` | 0, 28 pass / 0 fail | repair-B-proof-1.log |
| `bun test tests/compare.test.ts -t refusal` | 1, no matching tests, F4 handed to A | repair-B-proof-2.log |
| `bun test tests/compare.test.ts -t verdict` | 1, no matching tests, F4 handed to A | repair-B-proof-3.log |
| `bun test tests/compare.test.ts -t record` | 0, 17 pass / 0 fail | repair-B-proof-4.log |
| `bun test tests/compare.test.ts -t resolve` | 0, 1 pass / 0 fail | repair-B-proof-5.log |
| `bun test tests/compare.test.ts -t status` | 0, 1 pass / 0 fail | repair-B-proof-6.log |
| `bun test tests/red-docs.test.ts` | 0, 4 pass / 0 fail, F3 still applies | repair-B-proof-7.log |

Criterion 6: inspected the unchanged lock-then-revalidate wiring and fresh event reads inside the global phase lock. No nested lock was added. Criteria 8/9: the semantic doc sweep recorded above remains applicable because repair changes only comparison validation, notice delivery and their reproduction tests. Runtime proof covers criteria 1-7, including both repaired cases.

Required checks and actual final phase result follow below.

### Required checks

All four configured checks ran through their printed `akrogon run-check --name <name> -- sh -c <body>` wrapper, each body retaining `akrogon guard ancestors && akrogon guard own-modules && sh -c <configured command>`:

| Name | Configured command | Result | Log under implementation/ |
|---|---|---|---|
| format | `bun run format` | exit 0, no file changes | repair-B-format.log |
| typecheck | `bun run typecheck` | exit 0 | repair-B-typecheck.log |
| test | `bun test --timeout=30000` | exit 0, 790 pass / 0 fail, 8138 assertions | repair-B-test.log |
| test_changed | `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` | exit 0, 171 pass / 0 fail, 3061 assertions | repair-B-test_changed.log |

Checks used base `64f27d0e3c4ae254a6aafd49ea393033dc677606` and repaired head `d6672cbb7828b9abf0fdf7e05c2526b30cf57687`. Each wrapper's terminal exit status was retained before reading its log. Both reproduction reds are directly caused by the reviewed product defects, not unexplained base failures. The two bad proof selectors are directly caused by the leaf's plan/test-name mismatch and handed to A, not compared against base.

Final inspection: `git diff --check 27b1cc8..HEAD` passed, worktree clean, only `src/compare.ts`, `src/phase.ts` and the two added reproduction cases in `tests/compare.test.ts` changed. Head unchanged during verification. Fixture cleanup runs in the existing finally paths. No temporary scripts or helpers remain. No additional Nits are held by B.

Requesting `check.fix` because F3/F4 remain under Handed to A.

Actual repair phase result: `akrogon phase known-red-leaf check.fix --slot B` exited 0 and printed `moved check.fix`.

## 2026-10-11 check.review after check.fix

Base: `64f27d0e3c4ae254a6aafd49ea393033dc677606`.
Prior reviewed head: `27b1cc868c8845616f0b200f6fb75f57fb77de62`.
B repair head: `d6672cbb7828b9abf0fdf7e05c2526b30cf57687`.
Reviewed head: `93f4b5fd01819ae1f741a1fdc0994550c0967ba3`.
Verdict: **ready**.

Inspected the repair range from the prior reviewed head, confirmed B's previously verified product fixes are unchanged, and reviewed A's one additional test commit plus the updated leaf plan/report. No new blocking defect was introduced.

- **F1 resolved:** inconsistent records require a completed passing retry. The CLI refusal reproduction remains in the repaired range and was included in the passing `refused` proof below.
- **F2 resolved:** red notices use a single Herdr call and retain its error. The timeout reproduction remains and was included in the passing `notice` proof below.
- **F3 resolved:** `93f4b5f` removes the prose predicates. Remaining assertions cover literal flags, executable command templates and the `known-red` schema token, which are permitted fixed contracts. The retired stop sweep now checks its literal command only. The commit's `Test-Change: tests/red-docs.test.ts` trailer cites F3 and the user's Function over form rule, which the removed expectations contradicted. Criteria 8/9 retain semantic seat review in the plan/report. No documented behavior changed in A's repair.
- **F4 resolved:** plan.md now names matching proof selectors. Ran each corrected command exactly and retained terminal exit 0, rather than relying on the combined selector shorthand in the report.

Recheck verification:

| Command | Result | Log under implementation/ |
|---|---|---|
| `bun test tests/red-docs.test.ts` | 3 pass / 0 fail | recheck-B-proof-1.log |
| `bun test tests/compare.test.ts -t 'refused'` | 16 pass / 0 fail | recheck-B-proof-2.log |
| `bun test tests/compare.test.ts -t 'refuses|admitted'` | 5 pass / 0 fail | recheck-B-proof-3.log |
| `bun test tests/compare.test.ts -t 'notice'` | 5 pass / 0 fail | recheck-B-proof-4.log |
| `bun test tests/compare.test.ts -t 'resolves|newer revision'` | 2 pass / 0 fail | recheck-B-proof-5.log |
| `bun test tests/compare.test.ts -t 'status'` | 1 pass / 0 fail | recheck-B-proof-6.log |

Accepted A's post-repair report evidence for all required checks: full suite 789 pass / 0 fail, changed suite 170 pass / 0 fail, typecheck clean, format clean. The one-test count reduction matches folding four doc tests into three. No runner or product code changed in A's repair. `git diff --check d6672cb..HEAD` passed and the worktree was clean. No merge-bounce replay is applicable to this check.fix pass. No new Nits, reusable lessons or operator actions are held by B.

Requested disposition: merge with verdict ready. Actual result follows below.

Actual recheck phase result: `akrogon phase known-red-leaf merge --slot B --verdict ready` exited 0 and printed `moved merge`.

## 2026-10-11 merge attempt aecd6384-4244-4d81-a22b-920b9fa1cbb3

Applied top: `2756bd07d31730f90ee539e1261299e2c481b66a`.
Refreshed AKROGON_BASE: `ec08dec31e4630e2ac56132889f2f8206af99f01`.
Prior reviewed head: `93f4b5fd01819ae1f741a1fdc0994550c0967ba3`.
Batch members: none. The worktree matches the prompted applied top and is clean. No fetch, rebase or commits were performed by B on this applied attempt. `git range-diff 64f27d0..93f4b5f ec08dec..2756bd0 --stat` reports every carried holder commit equal to its reviewed counterpart.

Read the plan, report, both reviews and docs/guide/merge.md. All four configured checks are required: merge_covers is empty. No merge_checks or advisory commands are configured. Each check runs through its printed run-check/guard wrapper and retains its terminal status and complete output under implementation/merge-<name>.log.

Completion-owner inventory: this attempt contains only known-red-leaf. Its issue owner red-base-wait also contains known-red-merge, currently plan.synthesis, so this batch cannot complete that owner. No completion broadcast is expected unless the command reports an actual completion line. Holder brief was read.

Check results and phase results follow below.

### Applied-top checks

All ran on `2756bd07d31730f90ee539e1261299e2c481b66a` with base `ec08dec31e4630e2ac56132889f2f8206af99f01` through `akrogon run-check --name <name> -- sh -c <body>`, with body `akrogon guard ancestors && akrogon guard own-modules && sh -c <configured command>`:

| Name | Configured command | Result | Log under implementation/ |
|---|---|---|---|
| format | `bun run format` | exit 0, worktree unchanged | merge-format.log |
| typecheck | `bun run typecheck` | exit 0 | merge-typecheck.log |
| test | `bun test --timeout=30000` | exit 0, 790 pass / 0 fail, 8066 assertions | merge-test.log |
| test_changed | `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` | exit 0, 170 pass / 0 fail, 2986 assertions | merge-test_changed.log |

Full suite completed normally in 92.90s. No red checks or advisory failures. Worktree stayed clean and HEAD stayed at the recorded top before merge authorization.

`akrogon phase known-red-leaf merged --slot B --check --attempt aecd6384-4244-4d81-a22b-920b9fa1cbb3` exited 0 and printed `ok`, authorizing and recording the tested top. Completion-owner inventory remains unchanged: known-red-merge is still open, so red-base-wait is not complete. Proceeding with the command-owned push.

### Post-push lifecycle error and recovery

`akrogon phase known-red-leaf merged --slot B --attempt aecd6384-4244-4d81-a22b-920b9fa1cbb3` exited 1 after a successful push, at `requireFrozenCitations` in `transition` called by `batchPush`. Error: missing Test-Change citations for `tests/compare.test.ts` and `tests/red-docs.test.ts`. The preceding check-only call passed the stack trailer guard. The push updated the tracking base to the just-pushed head; the subsequent generic transition evaluated frozen citations over that now-empty range.

Confirmed with `git ls-remote origin refs/heads/main`: remote main equals tested top `2756bd07d31730f90ee539e1261299e2c481b66a`. State remained merge, with batch.candidate equal to that top and recorded true. The code is landed, so routing to repair or adding a commit on the applied top would be wrong.

Inspected the existing next.ts reconcileBatch path: an applied batch with candidate on fetched remote main completes the holder via commitMove and clears the batch without rerunning frozen citations or pushing again. Running the scoped lifecycle recovery `akrogon next known-red-leaf` to finish that already-landed move. No manual state edit or product change.

Recovery result: `akrogon next known-red-leaf` exited 0. It reported self-update skipped because the registered checkout diverged from origin/main; no sync was attempted. The lifecycle reconciler completed the landed batch. Read-back confirms `phase: merged`, no batch record, and remote main still `2756bd07d31730f90ee539e1261299e2c481b66a`. No issue/epic completion line was printed, and known-red-merge remains open, so no broadcast was run. Final outcome: tested top pushed successfully and leaf merged through command-owned recovery.
