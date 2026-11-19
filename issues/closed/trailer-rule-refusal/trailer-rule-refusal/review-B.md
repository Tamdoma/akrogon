# Review B: trailer-rule-refusal

Date: 2026-11-18. Phase: check.review, initial blind review.
Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`.
Reviewed head: `ae0c6701f9ca57b2d953eea79fbf1fd106e6a589`.
Verdict: **fix**.

## Fixes

### F1 — Remove the new prose-keyword gate and record the model-choice reading

Location: `tests/phase.test.ts:1786`; plan D3 and criterion-1 proof mapping.

The new `expect(refused.stderr).toContain('one line')` makes the configured test suite judge the writer's explanation by an exact phrase. Its realistic source is the refusal text authored by A in this leaf, consumed by the new CLI test and the configured `test` check. It replaces the review seat's choice of whether that text explains the accepted writer form with a keyword match. The words are neither a command nor a parsed marker or fixed reference. The design explicitly identifies the phrase requirement as A's autopilot pick, not the operator's words, so it supplies no independent one-right-answer source.

Consequence today: the blocking suite contains the forbidden prose-output gate. It accepts or rejects the writer's explanation by its words, although the full explanation is a review judgment. This is the explicit Fix in check-issue's model-written-text rule and violates its instruction to reject akrogon prose/output-wording tests and standing-design's model-choice line. This is a function-check breach, not a different reading of A's chosen wording. The recorded natural-red log shows this gate is active: refusal and path assertions pass, then the phrase assertion alone fails.

Required correction: remove the newly added phrase assertion, retain refusal, missing-path, unchanged-state and one-line empty-commit-repair checks, and record plan-issue's model-choice reading beside criterion 1. Keep the full writer-form judgment in the review record. That reading is expressly allowed for a design line that tests wording without an independent source. This requires A's test-expectation/proof correction under the check.repair exceptions. No product-message change is requested.

## Product and criteria review

- Criterion 1: the shared refusal names every missing path and says to put each citation on one line in the last paragraph holding only trailers, with a later empty commit allowed. I judge this text sufficient for the writer to repair the reported failure. It preserves `final trailer block`, advertises no folding, and makes no diagnosis that a wrap occurred. The CLI proof refuses the wrapped citation without changing state, then accepts the same path and reason on a later empty commit. F1 concerns the extra keyword gate only.
- Criterion 2: both `requireTestChangeCitations` and `requireFrozenCitations` call the same `citationRefusal(missing)` builder. The diff changes no citation parsing, accepted paths, frozen-record logic or existing test assertion. All callers were traced, including merge's `batchGuards` path.
- Criterion 3: the report includes all three required statements, including framework ownership of lesson retirement and the untouched added-path behavior.

The realistic reported source was also checked directly: framework commit `106ac8ce3018f0d027a8528730d5d3360bf04e26` contains flush-left continuation lines, and git's `%(trailers:key=Test-Change,valueonly,unfold)` emits no citation for it. Its history file describes the same failure and the separate added-path behavior. The new fixture represents that input without changing git's role as the citation reader.

`docs/reference/checks.md` was read from the changed behavior, through `docs/reference-index.md`, along with the workflow trailer guidance. Its trailer syntax, empty-commit repair and refusal-prefix claims remain accurate. No documented behavior changed. No `AREA.md` or lesson file is in the diff. No peer review was read.

## Test-Change trailers

Range: configured target `39e203a79c5c4ebeef51d1e76a3d8ea43389debc..HEAD`.

Commit `53659165a701d6047f675f333d55715017019ddb` has this parsed final-block trailer:

```text
Test-Change: tests/phase.test.ts added wrapped-trailer refusal test for this leaf; no existing expectation changed
```

`tests/phase.test.ts` matches `src/test-files.ts`. The diff adds one case and changes no prior expectation, so the trailer accurately describes the change. New cases require no cited external source. Commit `ae0c6701f9ca57b2d953eea79fbf1fd106e6a589` changes only product code and needs no test trailer. Trailer validity does not clear F1.

## Verification evidence

Existing kept logs were read with `akrogon log`; no rerun was needed because product, test, helpers, fixtures and runner inputs have not changed since the final green runs.

- Planned criterion command: `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'`. Natural red: `check criterion-1: 1`, `implementation/check-criterion-1-1794955930801-1552458.log`, failing only on `one line`. Path-condition deliberate break: `check cond-path: 1`, `implementation/check-cond-path-1794955936759-1554178.log`, failing on the missing path. Committed-head green: `check criterion-1: 0`, `implementation/check-criterion-1-1794955989770-1602555.log`, 1 pass, 0 fail. This proves the mechanical CLI path; the prose assertion remains F1.
- Final configured verification receipt: `bc1fb4e6-2e4d-40f0-bb37-b70b47057d93`, exact reviewed head and tree `8eeb0b33c5c6f7eae3af2db469bba2823f22f4df`. Setup, format, typecheck and test all exit 0. Read-back: `implementation/check-setup-1794956525279-3424887.log`, `implementation/check-format-1794956527793-3424887.log`, `implementation/check-typecheck-1794956530244-3424887.log`, `implementation/check-test-1794956587041-3424887.log`. Test summary: 1225 pass, 0 fail across 83 files, including the new wrapped case and frozen-citation cases. The report mistakenly reuses the earlier run ID `7ab87938` when naming this final green pass; the cited logs and actual receipt unambiguously identify the proof.
- Planned runner commands, test filters and configured checks were preserved. No test/helper/config/lockfile change follows the proofs, and no planned test was skipped or disabled. No proof-command correction was recorded.
- Earlier configured test red: `implementation/check-test-1794956179205-1610104.log` ended with Bun's summary, 1223 pass and 2 fail in dispatch/reset tests. Same-command retry `implementation/check-test-1794956365622-2386822.log` ended with 1224 pass and 1 fail in `tests/pause-next.test.ts`. These files have no change or plausible causal connection to the message-only product diff. The later same-tree whole-green receipt resolves these as inconsistent. The report records known-red refusal because the base already had a whole-green receipt; no head/base cover is claimed or accepted here, and no base-red filing is warranted.

No paid/live grant applies or was consumed. All listed proof logs are local setup/check/test operations. No abandoned capture pair is present. No operator action or reusable Nit remains.

## 2026-11-18 check.repair

Read both initial reviews against unchanged head `ae0c6701f9ca57b2d953eea79fbf1fd106e6a589`. A reports no Fixes; B's F1 is the only open Fix. No Fix falls within B's repair scope, so no code, test, plan or design change was made and no commit was created. Existing proof inputs are unchanged; this handoff runs no proof or verify command. No operator action is open.

### Handed to A

- F1 — Remove the new `toContain('one line')` assertion while preserving the CLI behavior checks, record criterion 1's model-choice reading in `plan.md`, and update the report and current proof evidence. Exception: correction of a test expectation and its proof mapping belongs to A under check.repair; B cannot make it. The refusal text itself already satisfies the criterion on review.

Destination: `check.fix`, slot A.

## 2026-11-18 check.review after check.fix

Prior reviewed base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`.
Prior reviewed head: `ae0c6701f9ca57b2d953eea79fbf1fd106e6a589`.
Refreshed base: `868cac1b071ea34adf5e5e58e89dc2f8192714a3`.
Rebased pre-repair head: `ea29445e5a21270011d9f2c80749d4590c195413`.
Reviewed repair head: `64dbcf933703c0cc0863069048277f85131e4ca3`.
Verdict: **ready**. F1 resolved; no new Fix, Nit or operator action.

### Repair scope and F1 disposition

B computed `git range-diff 39e203a79c5c4ebeef51d1e76a3d8ea43389debc..ae0c6701f9ca57b2d953eea79fbf1fd106e6a589 868cac1b071ea34adf5e5e58e89dc2f8192714a3..64dbcf933703c0cc0863069048277f85131e4ca3` through run-check: `check repair-range: 0`, `implementation/check-repair-range-1794956934448-634903.log`, read back with `akrogon log`. Both original commits are unchanged patches after refresh; only repair commit `64dbcf93` is added. Main's worker-stash-rule change is outside this repair review.

The repair diff removes only `expect(refused.stderr).toContain('one line')` and renames the case to describe refusal and empty-commit repair. Refusal, missing path, unchanged state, successful later move and final phase assertions remain. The dated plan implementation note records the model-choice reading and corrected proof mapping. The report records the reason, removed assertion, repair commit, refresh and fresh proof results. This is the requested expectation correction, not a skipped planned behavioral case or runner change; the same `-t 'wrapped'` command still runs the same scenario. A new deliberate-break test for the removed prose judgment is neither required nor allowed. The existing missing-path break remains applicable to the unchanged mechanical assertion and product path.

I re-read the shared refusal at `src/phase.ts:578` and both callers. It still sufficiently explains the accepted writer form, final trailer paragraph and empty-commit repair. F1 required no product-message change. `docs/reference/checks.md` remains accurate; no documented behavior changed. No area, index or lesson change is in the repair diff.

### Repair trailers

In refreshed target `868cac1b..HEAD`, rebased test commit `6dbc434e` retains its original trailer naming the added case and no changed prior expectation. Rebased product commit `ea29445e` needs none. Repair commit `64dbcf93` has the parsed final-block trailer:

```text
Test-Change: tests/phase.test.ts removed the toContain('one line') assertion per review-B.md F1: an autopilot-picked phrase gates a writer-form judgment that belongs to the reviewing seat under the model-choice reading; refusal, path and empty-commit repair checks kept
```

The exact path matches `src/test-files.ts`; F1 supplies the reason and source for removing this expectation. The diff agrees with that trailer, and the removal is accepted.

### Current proof

Read back with `akrogon log`: `check criterion-1: 0`, `implementation/check-criterion-1-1794956831474-143769.log`, runs the renamed case after its final edit, 1 pass, 0 fail, 6 assertions. The pre-commit run is corroborated by the same case passing on the committed head in `implementation/check-test-1794956898063-144453.log`.

Receipt `5d046955-a1bb-4c6e-8ef6-53a1ce86f80a` is for reviewed head `64dbcf933703c0cc0863069048277f85131e4ca3`, tree `b4da833a44760c4a97a8a7c8f087045d8b027720`, and the unchanged configured commands. Setup, format, typecheck and test all exit 0. Format and typecheck logs were read back: `implementation/check-format-1794956838447-144453.log` and `implementation/check-typecheck-1794956840801-144453.log`. Test read-back shows 1225 pass, 0 fail across 83 files, including the repaired case and frozen-citation cases. No later input change or disabled planned check appears. No additional proof run was needed.

No paid/live launch was made; no abandoned capture pair is present. No reusable Nit remains to record. Worktree is clean.
