# Slot B review

Date: 2026-10-15
Phase: check.review (initial, blind)
Base: ed0a05d95711c9fd7b96ca24558bde01672a3ba0
Reviewed head: 9103caa0ace2505d2b44f38c9cf0c9e1f295d357
Verdict: fix

## Findings

### F1 Fix: restrict the open backlog to the origin repository

Location: `src/timing-report.ts:494-497`, ages at `:522`.
Source: the actual operator command in the registered akrogon checkout, whose origin is `https://github.com/Tamdoma/akrogon.git`. Existing carried sources cause the command to read Tamdoma/tamdoma-framework as well. The implementation builds `uncarried` from every repository listing without filtering to the origin.

Proof: `bun /home/ivan/.akrogon/worktrees/akrogon/issue-flow-report/src/akrogon.ts timing --flow --since 2026-10-01`, cwd `/home/ivan/Work/infra/akrogon`, exit 0. Full stdout is `implementation/review-B-flow-output.log`. All 57 open uncarried rows belong to Tamdoma/tamdoma-framework, including `Tamdoma/tamdoma-framework#111 filed 2026-09-30T07:28:37Z uncarried 15.0d`. No origin open uncarried row appears, yet the report says `summary backlog: 57 median 5.0d oldest 15d` instead of an empty origin backlog.

Consequence today: another repository supplies the entire reported backlog and its age statistics, misidentifying the constraint this report is intended to measure. Violates brief What and done-criteria 2 and 3. Keep reads and the closed-uncarried count across all listed repositories, but filter open uncarried rows and their summary to the origin. Add a CLI regression with a foreign open uncarried issue. Existing tests use an empty foreign listing, so cannot catch this defect. The guide should name the origin scope.

### F2 Fix: the required even-count median proof is absent

Location: `tests/timing-report.test.ts`, new flow scenarios, and `implementation/report.md` Proofs.
Criterion: done-criterion 3 explicitly requires the mean of the middle two for even counts. Plan C3 promises two merged totals `[6.104,7.0]` producing `6.6d`, but the committed first fixture has only one timed merged issue in each handoff bucket. Its second since-group identity is missing from the listing and contributes no timing. Both asserted totals are `7.0d`. The only two-value backlog assertion uses broad ranges rather than the arithmetic result. Returning the lower middle value instead of averaging would satisfy these assertions.

Consequence today: no test catches failure of the explicitly required even-count median outcome, despite the report claiming that proof. Add the planned CLI case with two distinct timed values in the same bucket and assert their mean for wait and total, plus an exact fixture-derived backlog median. This is a missing criterion case using existing helpers, not missing machinery, and belongs with A under the repair split. Correct the report to the actual current proof. Product median arithmetic itself is correct on inspection.

### F3 Fix: remove the new prose-wording assertion

Location: `tests/command-reference.test.ts:91`.
Source: the configured test check runs the new guide test. It asserts the literal prose `leaf-carried`, although any equivalent description satisfies done-criterion 5. A normal guide edit using equivalent words would fail the required check without changing behavior or its documented meaning.

Consequence today: the check enforces prose wording as a contract. The check-issue test-proof rule explicitly rejects akrogon tests of prose/output wording except executable commands, numbers and fixed references. Keep the command-literal assertion at line 90 and remove the prose assertion at line 91. This changes a test expectation and belongs with A under the repair split. The prose assertion was planned, but that does not override the review rule.

## Verification evidence

- Read brief, design, plan, implementation report, skill and ponytail reference. Debate is off, so positions-B/rebuttal-B do not exist and are not required. No peer review was read.
- Inspected all eight changed files and the surrounding CLI dispatch, origin parser, state readers, move log, test helpers/contracts, and `src/test-files.ts`.
- Current-head verify receipt `f9de8a5e-7f4e-45e0-ba92-318ca4c71b3e` records format 0, test 0, typecheck 0 on the reviewed SHA. Read its three logs: 833 pass, 0 fail, 49 files, 8524 assertions. These runs follow the last test/helper change in 9103caa. No planned check is skipped, filtered or disabled. No full rerun was needed.
- Report records targeted proof commands, their red/green results and a deliberate PR-filter break. Full current-head checks cover the planned test files. The reported even-median claim is rejected in F2.
- Ran the configured flocked frozen install before the independent live read, exit 0, no dependency changes. The live command used the existing gh login, read only, created no remote fixtures, and exited 0. No mutation grant or cleanup was needed.
- Changed behavior documentation read: README timing command row, `docs/guide/files.md` timing section, `src/AREA.md`, reached through `docs/reference-index.md`. The guide currently omits the origin scope and follows the F1 defect. Other described flow behavior matches the implementation.
- One repository-root listing command checked every literal path named by `src/AREA.md`: src/akrogon.ts, tests/phase.test.ts, src/preflight.ts, src/config.ts, src/init.ts, src/readiness.ts, src/phase.ts, src/shell.ts, src/timing.ts, src/timing-report.ts, src/verify.ts, src/admission.ts, src/scope.ts, src/stop.ts, src/next.ts, src/stop-run.ts, src/reconcile.ts, docs/reference-index.md and tests/helpers.ts all exist. issues/timings.jsonl and issues/verify-runs.jsonl are absent in the sparse worktree but both exist in the registered checkout, where runtime records live. No dead pointer finding.
- No lesson removal in the diff. No reusable Nits retained. No operator action is required. No code or test file was edited, and no commit was made during review.

## Test-Change trailers

All changed test paths match `src/test-files.ts` through the `tests` segment.

- c7c9b425a34512f4ebcbd0a3f517903e87f9cde5: `Test-Change: tests/timing-report.test.ts plan.synthesis adds the criterion cases for akrogon timing --flow from issues/open/issue-flow/issue-flow-report/plan.md; they fail red until the product lands`. Adds cases, does not alter existing expectations. Source supports new behavior, with F2 noting the missing case.
- c7c9b425a34512f4ebcbd0a3f517903e87f9cde5: `Test-Change: tests/command-reference.test.ts plan.synthesis updates the timing contract to the three-form usage and asserts the files guide describes the flow report per issues/open/issue-flow/issue-flow-report/plan.md`. Existing command expectation correction is supported by brief criterion 5 and design's literal interface. The added prose assertion is rejected in F3.
- c8d820e4108b58c0bef3269951fc5521979dcd1b: `Test-Change: tests/timing-report.test.ts timing() gains an env parameter and the three fake-gh flow cases pass gh.env; the planned tests reached the real gh login instead of the fake (worker evidence: issues/open/issue-flow/issue-flow-report/implementation/brief-1 mismatch); no expectation changed`. Diff confirms environment forwarding only, source matches the reported real-gh 404 and existing fakeGh caller pattern.
- 9103caa0ace2505d2b44f38c9cf0c9e1f295d357: `Test-Change: tests/timing-report.test.ts prettier reformat only after verify format failure; no expectation or case changed`. Diff confirms formatting only, supported by the preceding format failure log and current green format log.


## check.repair — 2026-10-15

Starting head: 9103caa0ace2505d2b44f38c9cf0c9e1f295d357.
Repaired head: e72ce50 (no rebase or base change).

### Repaired findings

- **B-F1**: c6b0826 adds the single CLI reproduction test, committed red before the product change. Its Test-Change trailer cites the actual akrogon run reporting 57 foreign issues. 43805b7 fixes the common `uncarried` collection by retaining the origin identity and filtering open rows to that repository. Both printed rows and backlog statistics consume that collection. The all-repository listings, carried rows and closed count remain intact. Search of `flowReport`, `uncarried`, and `originSource` found no other open-backlog construction.
- **A-F1**, including B-F1's guide scope correction: e72ce50 corrects the guide in a separate docs commit. Before: “one `state=all` issue listing per repository a leaf's `sources` names” and “Open issues no leaf carries”. After: “one `state=all` issue listing per distinct repository among the origin and those a leaf's `sources` names” and “Open issues in the origin repository that no leaf carries”. The paragraph also accurately identifies local leaf/move input and distinguishes the all-listed-repository closed count.

### Red and green evidence

- Command: `akrogon run-check --name test -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts -t "foreign open issues"'`.
- Before product fix, on 9103caa plus the new reproduction: exit 1, 0 pass / 1 fail. Expected `summary backlog: 0 median - oldest -`; actual `summary backlog: 1 median 14.3d oldest 14d`, with `other/repo#2 ... uncarried 14.3d`. Full log: `implementation/repair-B-F1-red.log`, run 454f48b3-950f-4aec-81eb-0c7d527545ca. The same test was then committed in c6b0826 without modification.
- After product fix: same command exit 0, 1 pass / 0 fail. Full log: `implementation/repair-B-F1-green.log`, run ee8f9a58-cedf-4af6-b2aa-ecb1963c3643. The test checks foreign carried output, absence of foreign open uncarried output, empty origin backlog, foreign closed counting, and one read per repository.
- Planned proof not authored by B: `akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/command-reference.test.ts'` on e72ce50, exit 0, 19 pass / 0 fail. All original 18 tests pass unchanged alongside the reproduction. Log: `implementation/repair-B-planned-tests.log`, run 0b1dccce-3b78-4e55-a3fa-33d6185c9a1d. Covers affected C1–C5 paths, while the missing even-median case remains handed to A below.
- Replayed the planned real read through the repaired CLI: `bun /home/ivan/.akrogon/worktrees/akrogon/issue-flow-report/src/akrogon.ts timing --flow --since 2026-10-01`, cwd `/home/ivan/Work/infra/akrogon`, exit 0. Full output: `implementation/repair-B-flow-output.log`. 75 carried rows, zero open uncarried rows. Summaries: `summary before: 35 merged 35 wait 0.0d total 0.1d`, `summary since: 40 merged 40 wait 0.0d total 0.3d`, `summary backlog: 0 median - oldest -`, `summary uncarried closed: 214`. This independently confirms the product fix against the original realistic source.
- Used the existing operator gh login and planned read-only targets Tamdoma/akrogon and Tamdoma/tamdoma-framework. No live mutation, new authorization, fixture or cleanup needed. Configured flocked frozen install completed before proofs without dependency changes. No additional tests, machinery, dependencies or scope changes.

### Handed to A

- **B-F2**: done-criterion 3 lacks the explicit even-count median case. Existing `tests/timing-report.test.ts`, `fixture`, `fakeGh`, `carrier` and CLI helpers can run it. Add distinct timed merged values in the same handoff bucket, assert the arithmetic mean, add exact fixture-derived backlog median evidence, and correct `implementation/report.md`'s unsupported proof claim. Exception: missing criterion case with existing machinery; B writes only the proven-bug reproduction test in repair.
- **B-F3**: remove only the literal-prose `leaf-carried` assertion from `tests/command-reference.test.ts`, preserving the command-literal assertion. Exception: correction of a test expectation.

No operator actions are open. No reusable Nit is retained by B. No locked decision or design file was changed.

### Final verification and handoff

`akrogon verify` on `e72ce504a945d0f45bd833fe39e3ba3e3ead9a98` exited 0, receipt `e3b383a7-2480-4726-9349-01e83e75a5c3`: format 0, test 834 pass / 0 fail across 49 files, typecheck 0. No merge checks ran.

- format: `/home/ivan/Work/infra/akrogon/issues/open/issue-flow/issue-flow-report/implementation/check-format-1792051674873-565014.log`
- test: `/home/ivan/Work/infra/akrogon/issues/open/issue-flow/issue-flow-report/implementation/check-test-1792051767190-565014.log`
- typecheck: `/home/ivan/Work/infra/akrogon/issues/open/issue-flow/issue-flow-report/implementation/check-typecheck-1792051768856-565014.log`

`git diff --check 9103caa..HEAD` passes and the worktree is clean. B-F1 and A-F1 are repaired. B-F2 and B-F3 remain assigned to A as listed above. Requested destination: check.fix.


## check.review re-check — 2026-10-15

Verdict: ready.
Prior reviewed base: ed0a05d95711c9fd7b96ca24558bde01672a3ba0.
Prior reviewed head: 9103caa0ace2505d2b44f38c9cf0c9e1f295d357.
B repair handoff: e72ce504a945d0f45bd833fe39e3ba3e3ead9a98.
Current base: ed0a05d95711c9fd7b96ca24558bde01672a3ba0.
Reviewed head: d29fe5b7c81f07370c66f2a33a5653b82303522a.

Read the current skill, references, brief, design, plan, implementation report and earlier B findings before reviewing only the repair range. The report records an opening refresh without base change. Independently ran `git range-diff ed0a05d95711c9fd7b96ca24558bde01672a3ba0..9103caa0ace2505d2b44f38c9cf0c9e1f295d357 ed0a05d95711c9fd7b96ca24558bde01672a3ba0..d29fe5b7c81f07370c66f2a33a5653b82303522a`: the original five commits are identical, with exactly five repair commits added. No conflict resolutions or main commits are included as repair.

### Findings resolved

- **B-F1**: confirmed the origin is read once and used to filter the shared open-uncarried collection. Its rows and backlog summary exclude other repositories, while carried identities and the closed count still cover all listed repositories. The red-first CLI regression remains intact. The independent repaired real output in `implementation/repair-B-flow-output.log` remains valid because A changed only tests: 75 carried rows, empty origin backlog, 214 uncarried closed issues.
- **A-F1**: `docs/guide/files.md` now names the origin plus carried-source repositories, describes local leaf/move inputs, limits open backlog to origin, and explicitly counts closed uncarried issues across all listed repositories. Re-read the timing documentation and matched it to the repaired path. No further documented behavior changed. No AREA.md changed in the repair range.
- **B-F2**: d8190a7 adds two timed merged issues in the same handoff bucket. Fixture waits 3d/2d yield 2.5d and totals 4d/3.5d yield 3.8d. The separate two-issue origin backlog checks its fixture-derived arithmetic mean and oldest age. The report now identifies this case as the even-count proof. Read `implementation/check-test-1792051862782-917552.log`: deliberate lower-middle implementation fails with 2.0d/3.5d instead of 2.5d/3.8d. Read the subsequent restored green run in `check-test-1792051865250-918683.log`. The committed product contains no deliberate break.
- **B-F3**: d29fe5b removes only the literal `leaf-carried` prose assertion. The runnable command reference check remains. No other existing expectation is changed or deleted by A.

### Verification

Current-head receipt `53f1009d-f7b8-432d-b037-6844c8f0806a` for d29fe5b7c81f07370c66f2a33a5653b82303522a records setup 0, format 0, test 0, typecheck 0 and a completed end timestamp. Inspected each recorded log: 835 pass, 0 fail, 49 files, 8541 assertions. Logs: `implementation/check-format-1792051876311-926445.log`, `implementation/check-test-1792051969100-926445.log`, `implementation/check-typecheck-1792051970890-926445.log`.

The planned command `akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/command-reference.test.ts'` ran after both test repairs, with 20 pass / 0 fail in `implementation/check-test-1792051871621-924110.log`. The later full verify proves the exact committed test/helper state. No planned tests, runner configuration or checks were skipped or disabled. No missing evidence or specific unresolved concern warrants another check run. `git diff --check 9103caa..HEAD` passes and the worktree is clean.

### Repair Test-Change trailers

The two changed test files match the `tests` segment rule in `src/test-files.ts`. Earlier trailers remain assessed above. New repair trailers:

- c6b08262e735de6d43554c9347e5658e11fae48e: `Test-Change: tests/timing-report.test.ts review-B F1 real timing --flow run in Tamdoma/akrogon reported 57 Tamdoma/tamdoma-framework open issues as the origin backlog; add a CLI reproduction preserving foreign carried and closed coverage`. Supported by the recorded real source and red/green proof. Adds a case only.
- d8190a7f81f7e6e3e2273a4110a26707fcdf5a05: `Test-Change: tests/timing-report.test.ts check.fix adds the B-F2 criterion case: two merged issues in the since bucket assert the 2.5d/3.8d means and the two-issue backlog asserts the fixture-derived median, shown red against a deliberate lower-middle median break; no existing expectation changed`. Supported by brief criterion 3, fixture arithmetic, and the red/green logs.
- d29fe5b7c81f07370c66f2a33a5653b82303522a: `Test-Change: tests/command-reference.test.ts check.fix B-F3 removes the literal 'leaf-carried' prose assertion; the check-issue rule rejects prose-wording contracts beyond commands, numbers and fixed references, keeping the command-literal assertion`. Supported by B-F3 and the explicit skill rule. The removed assertion guarded prose wording rather than a regression.

No new defects introduced by repair, unresolved Fixes, retained reusable Nits, operator actions, or lesson removals. No code edits or commits during re-check. Requested destination: merge.


## merge — 2026-10-15

Attempt: e03fae9d-e4b4-4d0d-9a5e-07db83e39a71.
Recorded top and worktree HEAD: d29fe5b7c81f07370c66f2a33a5653b82303522a.
Worktree clean. Used the already-rebased top without fetching, rebasing or committing.

`akrogon verify --attempt e03fae9d-e4b4-4d0d-9a5e-07db83e39a71` exited 0 and printed `reuse receipt 53f1009d-f7b8-432d-b037-6844c8f0806a tree=e4070bd0971e09d202c11f03afe20c01aeec025b`. The unchanged tree and current command set reuse the reviewed 835-pass, format/typecheck-green receipt. No merge checks, advisory failures, new live actions or fixtures.

`akrogon phase issue-flow-report merged --slot B --check --attempt e03fae9d-e4b4-4d0d-9a5e-07db83e39a71` exited 0 (`ok`), stamping the tested top and accepting the Test-Change trailers. Gathered the standalone issue owner `issue-flow/ISSUE.md` and its sole leaf brief for completion reporting.
