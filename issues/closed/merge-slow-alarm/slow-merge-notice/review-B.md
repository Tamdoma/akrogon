# Review B: slow-merge-notice

Date: 2026-10-28. Phase: `check.review`. Verdict: **fix**.

Base: `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`.
Reviewed head: `769d246e39ecdd91aa2894bd7206432484cd61ac`.
Reviewed the whole diff against brief criteria 1–4, the binding design, plan D1–D9, implementation report, current verify/status contracts and the recorded herdr reply. No peer review was read. No code was edited or committed.

## Fixes

### F1: Acceptance excludes the completed current run

`src/verify.ts:407` builds the acceptance window from `earlier`, excluding the run whose completed receipt is being finalized. With 19 eligible episode rows already present, the next eligible slow run is the twentieth, but its receipt has no `close`. Acceptance waits for a twenty-first checked run. If there is no next run, status continues reporting an open episode even though the acceptance condition has been met.

This violates brief criterion 3 and binding decision Q2: close once the last 20 eligible runs all lie inside the episode. The design excludes the current run from the historical normal, not from the completed episode's acceptance count. Plan D4 incorrectly extends that exclusion to acceptance and needs to conform to the binding outcome.

Boundary reproduction: use the existing fixture, holder invocation and backdate helper from `tests/slow-merge.test.ts`. Seed five eligible 5-minute pre-episode rows, a delivered 10-minute opener, and 18 eligible 500000ms episode rows. Complete a fresh eligible merge run backdated by 600000ms. The resulting twentieth episode receipt records `ms:600112`, `normal_ms:300000`, and `first`, but no `close`. The expected `close:'accepted'` assertion fails. This is the scenario criterion 3 explicitly requires, rather than an unsupported hypothetical input.

The existing accepted-close test at `tests/slow-merge.test.ts:368` seeds an opener plus 19 following eligible episode rows before invoking verify. It therefore checks closure on the twenty-first run and cannot catch this defect. Count the current eligible receipt in acceptance while preserving recovery precedence, and prove closure on the twentieth eligible episode run.

### F2: An unflagged partial acceptance closes silently

`src/verify.ts:419` constructs the output only when `flagged` is true, although lines 407–410 can close `accepted` on an unflagged partial run. A merge retry that reuses a green command and runs another command can be short, ineligible for recovery, and still close an episode whose last 20 eligible rows are inside it. Its receipt closes but stdout contains no acceptance message.

This violates brief criterion 3 and binding decision Q4, which require a `verify slow:` line announcing an accepted close. It also contradicts plan D5's separate accepted-close output case. The consequence is a disappearing status warning without the required explanation that the slower duration was accepted as normal.

Boundary reproduction: seed five pre-episode rows and 20 eligible episode rows with a delivered notice. Give the last episode row the current tree's green `unit` command; configure `unit` plus an uncached `extra` command. Run the real holder verify and backdate it by 1000ms. The ledger records reused `unit`, executed `extra`, `ms:1108` and `close:'accepted'`; verify exits 0, but stdout has neither `verify slow:` nor the accepted-close message. Both fields and output were observed at the CLI boundary. Emit the accepted-close line independently of whether that closing run is flagged, with a regression at this partial-run boundary.

## Verification

The two criterion-3 reproductions used temporary copies of the existing test helpers and accepted-close case under the run's private `TMPDIR`. Only imports and scenario inputs/assertions changed. No product substitute or new runner was introduced. The temporary directory and fixture repositories were removed after the run, including on assertion failure. Dependency setup ran first under the prescribed install lock.

Final reproduction evidence, read back through `akrogon log`:

```text
check review-episode-boundaries-B: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-review-episode-boundaries-B-1793194294891-2170370.log
```

Both named cases fail, with 0 pass / 2 fail. Their cause is the reviewed `decideSlow` implementation, so the unrelated-red retry and known-red procedure do not apply.

Existing planned proof and configured-check logs were read back, rather than rerunning an already green suite:

```text
check slow-merge: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-slow-merge-1793193934508-1431949.log
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-format-1793194025148-1740543.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-test-1793194090966-1740543.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-typecheck-1793194093294-1740543.log
```

The focused planned command is exactly `bun test --timeout=30000 tests/slow-merge.test.ts` (6 pass). The full verify test log contains all six current cases and reports 1234 pass / 0 fail after the latest test formatting change. The final commit is trailer-only and changes no tree content from the reported verified head `488ace4e`. No configured check, filter, runner configuration, fixture or helper was disabled. There is no proof-command correction to judge. Planning's recorded red log was also read and shows all six cases failing before the feature.

Criterion 1's flagged receipt, CLI output, single notice and green receipt gate are covered by the existing focused proof. Criterion 2's eligibility and partial/base boundaries and criterion 4's per-repo status visibility are covered by that proof and the inspected wiring. Criterion 3 remains red for F1 and F2 despite the planned happy-path suite being green. Notification success uses the unchanged fake herdr and the 2026-10-28 herdr 0.9.1 recording in readiness. No live notification, paid call, credentials, or grant-covered external mutation was used.

## Documentation and area pointers

Read `docs/reference-index.md`, the verify behavior in `docs/reference/checks.md`, status in `docs/reference/commands.md`, the receipt record in `docs/reference/files.md`, and both changed AREA files. The documented accepted-close outcome agrees with the brief and exposes F1/F2. Other changed contract descriptions match the implementation.

Listed every literal repository path named by each changed AREA file, checking both this sparse worktree and the registered checkout. All source/doc/test targets exist in the reviewed worktree. Runtime `issues/` paths omitted by the sparse worktree exist in the registered checkout. The new test file exists in this branch and is naturally absent from the unmerged registered checkout. No dead pointer was found. The listing and exact code/test locations were read back from:

```text
check review-final-trace-B: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-review-final-trace-B-1793194322052-2205697.log
```

## Test-Change trailers

Listed from `3e49c3d5ddc7a178a9c5ff448015e525b85fb345..HEAD`, using the live path rule in `src/test-files.ts`:

1. `af39d6b2`: `Test-Change: tests/slow-merge.test.ts corrects a wrong planned expectation (brief criterion 2: a run is compared only at >=5 eligible earlier runs; run A sees 4 so its receipt has no slow field); also drops needless backdates on unflagged runs, no other expectation changed`.
2. `140ae761`: `Test-Change: tests/slow-merge.test.ts fixes two harness bugs in committed cases (second fakeHerdr call on the same fixture threw EEXIST; the known-red head sha lacked check.sh so no test name could cover it) — uses mergeEnv and checks out the pushed main tip as the head; no existing expectation changed`.
3. `626faeff`: `Test-Change: tests/slow-merge.test.ts fixes a fixture bug in the committed known-red leg (holder at f.home/chart/direct made log reads resolve to '(log gone)' so coverage could never pass) — moves the holder under issues/chart/slow/direct; no existing expectation changed`.
4. `488ace4e`: `Test-Change: tests/slow-merge.test.ts formatting only, no expectation changed`.
5. `769d246e`: `Test-Change: tests/AREA.md gained one line naming the new tests/slow-merge.test.ts file; it is an area index, not a test expectation`.

All five are justified by their cited criterion, real fixture failures, formatting-only diff, or area-index role. They preserve the intended cases. The original test-addition commit adds a new path and needs no existing-expectation source. No lesson removal is in the diff.

## Nits and operator actions

None. The two Fixes are product/criterion defects, not operator-access blockers. No reusable Nit is held.

## 2026-10-28 check.repair

Repair starts from reviewed head `769d246e39ecdd91aa2894bd7206432484cd61ac` and ends at `76a1da503af9d9108334603f06e053cdf5d93fa8`. Both initial reviews were read. Their F1/F2 findings describe the same two defects, and both are repaired.

### F1 repaired

Reproduction commit `7bb3027635b0cb2f06010e0bcc37cc2e1d172c0e` adds one CLI test with 19 earlier eligible episode rows and a fresh twentieth eligible slow run. It fails before the product fix because the completed run has no accepted close. Fix commit `edd8940f0bcd561686a978da51383ce088257040` includes the current eligible row in the acceptance window and recognizes its existing episode membership before its `slow` field is written. Recovery still takes precedence. A dated implementation note in `plan.md` records this brief-criterion-3/design-Q2 requirement without changing the locked design or other plan text.

```text
check repair-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-repair-F1-red-1793194530506-2262716.log
check repair-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-repair-F1-green-1793194544014-2266019.log
```

The red command was `bun test --timeout=30000 tests/slow-merge.test.ts -t "the twentieth eligible episode run closes accepted"`; the green command was the full planned test-file invocation, with 7 pass. Both ran after the configured dependency setup under its install lock. The final proof below also covers the formatted, committed fix.

### F2 repaired

Reproduction commit `b5305a2180684698d3099fa932a7d28c3c477065` adds one CLI test whose current run reuses `unit`, executes `extra`, and closes accepted without being flagged. The test verifies the reused entry and accepted receipt, then checks for an acceptance line. Before the fix its line lookup is undefined. Fix commit `76a1da503af9d9108334603f06e053cdf5d93fa8` emits the existing line for either a flagged run or any accepted close.

```text
check repair-F2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-repair-F2-red-1793194558876-2272739.log
check repair-slow-merge: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-repair-slow-merge-1793194569443-2273638.log
```

The red command was `bun test --timeout=30000 tests/slow-merge.test.ts -t "an unflagged partial accepted close prints the acceptance"`. The final green proof was the unchanged planned command `bun test --timeout=30000 tests/slow-merge.test.ts`, after locked dependency setup: 8 pass, 0 fail, including A's original six planned cases. Those original cases were not edited and provide the planned proof B did not write. C1–C4 were all rerun because their shared test file and verify input changed. All cited red and final green logs were read back with `akrogon log`; the red causes are these leaf defects and require no known-red disposition.

Each Fix has a separate reproduction commit and product-fix commit. Both test commits end with `Test-Change: tests/slow-merge.test.ts` trailers citing the corresponding review finding and brief criterion 3. Only the two proven-bug reproductions were added. Existing assertions, fixtures, recordings and proof commands were not corrected or removed. No source or contract beyond these fixes changed, and no external notification contract changed, so the recorded herdr reply remains applicable. No live action or grant was needed.

### Handed to A

None. No operator action or reusable Nit remains held by B. A's targeted-status concern is explicitly excluded by plan D8; its backdate concern names a future writer rather than a current failure. Neither requires a repair or new test here.

### Final verification

`akrogon verify` completed with exit 0 and `verify leaf 76a1da503af9d9108334603f06e053cdf5d93fa8: green`, pass `f34666a3-e53e-49d6-b322-eccff292c32f`. All configured checks passed: format, 1236 tests, and typecheck. No merge checks were run. Logs were read back with `akrogon log`:

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-format-1793194576812-2276335.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-test-1793194643152-2276335.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-typecheck-1793194645386-2276335.log
```

Repair verdict: **ready**. Both reviews' Fixes are resolved, the planned proof and committed-head verification pass, and no handoff or operator action remains.

## 2026-10-28 merge: red wake

Attempt: `be764656-2f2f-4430-9a77-6396e2d530f5`. Recorded rebase target: `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`. Applied top and tested head: `76a1da503af9d9108334603f06e053cdf5d93fa8`. The worktree is clean, HEAD matches the recorded top, and the target is its ancestor. No fetch, rebase or product edit was performed.

The command's merge-scope verify run `b56b98db-faed-4d07-98de-54b8e42b8485` failed only `test`. Configured command: `bun test --timeout=30000 --parallel=4 --no-isolate`, invoked as `sh -c 'bun test --timeout=30000 --parallel=4 --no-isolate'`. Format and typecheck passed. The failing log was read through `akrogon log`:

```text
check test: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-test-1793194742631-2583075.log
```

The named failure was `a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run`, `tests/run-units.test.ts:904`: `expect(existsSync(receipt.path)).toBe(false)` received `true`. The suite completed with 1235 pass / 1 fail. The test polls only until the receipt gains `end`, then assumes the verification worktree has already been removed. Both base and head publish `end` before awaiting `git worktree remove`. The test uses leaf scope, so the added slowdown decision returns immediately and neither prints nor sends a notice. The test, cleanup command and completion ordering are unchanged by this leaf. This is an existing observation race with no causal change in the leaf's diff.

Under merge-issue's unrelated-red rule, the unchanged head was retried with `akrogon verify --attempt be764656-2f2f-4430-9a77-6396e2d530f5`, run `51168b23-ac6d-4ab7-9a42-8e264acda4dd`. It exited 0 with `verify merge 76a1da503af9d9108334603f06e053cdf5d93fa8: green`: 1236 pass / 0 fail, including the previously failing survivor test. Format and typecheck reused their green results from the original merge run. The retry log and both reused logs were read through `akrogon log`:

```text
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-test-1793194890528-2908386.log
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-format-1793194677423-2583075.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/implementation/check-typecheck-1793194745083-2583075.log
```

Disposition: **inconsistent** original test result, with both red and green logs retained above. No known-red run or base-red filing is warranted for a green retry. No code or test expectation was changed. The owner has one leaf brief, gathered from `issues/open/merge-slow-alarm/slow-merge-notice/brief.md`, whose completed behavior is the comparison, episode notice and board status described above.

`akrogon phase slow-merge-notice merged --slot B --check --attempt be764656-2f2f-4430-9a77-6396e2d530f5` returned `ok` on the unchanged verified head. The receipt, ancestry, frozen-test trailers and retired-lesson gates passed. No advisory commands are configured. Proceeding to command-owned push and completion.
