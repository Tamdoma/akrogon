# Review B: tasks-sections-board

Date: 2026-11-04. Phase: check.review. Verdict: **fix**.

Base: `f96367e65953e5f34546f807eeb672a70c0be43a`.
Reviewed head: `dcf39ce45707378281c356aeff6e5b07642ce65b`.
Reviewed the whole initial diff independently, without reading the peer review. No code or test edits and no commits in this pass.

## Fixes

### F1: Make the chevron target span both summary lines

Location: `herdr-app/tasks/main.js:253-268`, especially the chevron at line 258.

Source: the operator clicking the rightmost 24 px of a normal two-line Tasks row to expand it. The existing recorded `akrogon/tasks-mod` fixture takes the real `board()` and `Tasks.row()` path in the approved host harness.

The chevron is a child of the first-line container and has `h(S(20))`, the same height as that first line. The second line is a sibling below it. Therefore the disclosure handler does not cover the second line or the inter-line gap. A click in that lower portion of the intended disclosure strip reaches the row-body handler and opens Files and changes the shared pin instead of expanding the row.

This breaks design `open-row` and plan D8, which require a full-row-height by 24 px disclosure target with stopped propagation. Keep that target separate from the body click across both summary lines. Add a reproduction at the existing host boundary that catches the target ending at the first line and verifies disclosure does not pin.

Evidence: `check review-B-chevron-hit-corrected: 0 implementation/check-review-B-chevron-hit-corrected-1793750257707-3567399.log`, read back with `akrogon log`. The trace reports first-line height 20, chevron width 24 and height 20, `chevronInFirstLine: true`, `chevronInSecondLine: false`, and a body click emits `panel.request.view: files` and the leaf-folder pin. This is an element-tree and handler trace, not a pixel hit-test.

### F2: Restore the existing kept-reason regression assertion

Location: `tests/tasks-mod-host.test.ts:226`.

The previous expansion test asserted both `kept.path` and `kept.reason` in rendered text. The replacement asserts only the path. Its original source is commit `ea54c5339bc9f01cd522f204c61d5ecae0d91a25`, whose trailer cites the earlier review's missing kept cleanup paths and reasons. The fixture still contains those recorded entries.

Consequence today: this rewrite removes a check for a real past regression. A renderer that omits cleanup reasons now passes the replacement assertion. The model's `detail.kept` equality test does not check whether the host renders the reasons. The current renderer does render them, so this finding concerns the unsupported removal of an existing assertion, not a current missing UI value.

Brief criterion 7 and design `open-row` retain the kept list. Standing design explicitly says kept-detail tests stay. Neither the plan nor the trailer cites a source contradicting the old reason expectation. Under check.review's existing-assertion rule, restore the rendered reason assertion alongside the path assertion. This is an expectation correction for A under the repair split.

Evidence: `check review-B-kept-regression: 0 implementation/check-review-B-kept-regression-1793750283336-3568834.log`, read back with `akrogon log`, includes the original regression commit, base assertion, and replacement assertion.

## Verification

- The implementation's completed verify pass `773c56cb-50b0-46e8-8224-22f81bc7fa05` has status 0. Setup, format, typecheck and test passed. The test log reports 1308 pass, 0 fail across 75 files. Read back `check-format-1793750059781-3249658.log`, `check-typecheck-1793750062331-3249658.log`, and `check-test-1793750130447-3249658.log` with `akrogon log`.
- That pass ran on `ff06e7dd8b6a6c8e6a5a05e7c0c346f7a99904b1`. Its tree and the reviewed head's tree are identical: `76c69d0759b973fb043d9068adfa79b907f1c8df`. The final head adds an empty citation commit. Evidence: `check review-B-final-evidence: 0 implementation/check-review-B-final-evidence-1793750266653-3567838.log`, read back with `akrogon log`. No full-suite rerun was needed.
- Read back the planned combined boundary proof: `check tasks-mod: 0 implementation/check-tasks-mod-1793750039553-3247818.log`, 25 pass across the two planned test files. The later format-only test edit is covered by the completed verify run. No skipped tests, filtered planned cases, or runner changes were found.
- Read back the planning red logs: `check tasks-mod: 1 implementation/check-tasks-mod-1793749754149-3226362.log` and `check tasks-mod-host: 1 implementation/check-tasks-mod-host-1793749755843-3227259.log`. They show the old model and renderer failing the new boundary tests. There is no recorded proof-command correction to judge.
- The first review probe failed because its shell quoting truncated the Python input: `check review-B-chevron-hit: 1 implementation/check-review-B-chevron-hit-1793750244621-3566846.log`. Read it back, corrected only the invocation quoting, then obtained the completed F1 trace above. This was a reviewer command error, not a product test failure or a configured-check failure. Both runs published their final check lines.
- Producer fields, section precedence, waiting reasons, busy/phase timing, dependent sorting, machine lines, folder pin consumers, colors, icon treatment and scaling were traced through the changed code and tests. The two findings above remain despite the green checks.
- The approved live surface is the existing element-tree harness over the real mod code. No live screenshot was taken, as allowed by standing design. No grants, credentials, external mutations or fixture cleanup were needed.

## Test-Change trailers

All trailers in `f96367e65953e5f34546f807eeb672a70c0be43a..HEAD`, inspected against `src/test-files.ts`:

| Commit | Trailer | Judgment |
| --- | --- | --- |
| `7c460d74` | `Test-Change: tests/tasks-mod.test.ts plan.md criteria 1-5: rewrite to sections/machine/RowModel shape per design` | The removed grouping, current-repo order, pills, quiet-board shape and old second-line expectations have explicit design replacements. Kept model behavior remains covered. |
| `7c460d74` | `Test-Change: tests/tasks-mod-host.test.ts plan.md criteria 1,5-9: rewrite to section render, machine lines, folder pin, chevron, expansion, colors and scale` | Covers the intended renderer changes, but does not justify removing the kept-reason assertion. F2. |
| `7c460d74` | `Test-Change: tests/fixtures/status-envelope.json producer status-attention-facts added per-leaf attention and waits_on fields` | Matches the producer contract. Adds the two fields to every existing leaf without deleting fixture content. |
| `ff06e7dd` | `Test-Change: tests/tasks-mod.test.ts prettier formatting only, no expectation changed` | Diff is formatting only. |
| `ff06e7dd` | `Test-Change: tests/tasks-mod-host.test.ts prettier formatting only, no expectation changed` | No host-test change in this commit. The extra citation does not weaken a test. |
| `dcf39ce4` | `Test-Change: herdr-app/tasks/model.d.ts declaration updated during implement: clock removed with the renderer; boundary changed with the planned tests` | Empty commit. The declaration changed in the planning commit. This path is not matched by `testFile()`; the extra trailer makes no code change. |

## Documentation and scope

Opened `docs/reference-index.md`, `src/AREA.md`, and the Tasks installation description in `docs/start/install.md`. Their existing generic install and host/pure-module claims remain accurate. No existing documented behavior claim needs correction. No `AREA.md` changed in this diff. No lesson removal or new dependency appears in the diff. The implementation stays within the owned surfaces and consumes the producer's attention and waiting facts.

## Operator actions

None. No Nits held.

Requested next phase: `check.repair`, verdict `fix`. The command owns aggregate movement after both initial reviews.

## 2026-11-04 check.repair

Read both initial reviews against their reviewed head `dcf39ce45707378281c356aeff6e5b07642ce65b`. Review A F1 and review B F1 are the same defect. Starting worktree was clean.

### Repaired

F1: committed reproduction `03bed4b` (`test: reproduce the Tasks chevron missing the second line`), then product fix `08781e62ff9410fbf42ce2590f9fc86ac47d0844` (`fix: extend the Tasks chevron target across the row`). The test commit's `Test-Change` trailer cites both F1 findings and the real operator action: clicking the right edge of line 2.

The disclosure is now positioned against the full row with top and bottom at zero and width 24, rather than constrained by the first-line container. The icon remains aligned with line 1. Both summary lines reserve the control's space for actionable rows. Parked rows retain their previous spacing and have no disclosure or click handler. Propagation still stops before the body pin handler.

The one added reproduction uses the existing host harness and recorded `akrogon/tasks-mod` fixture at font sizes 13 and 26. It checks the full-height target's positioning and that disclosure stops propagation, expands, and emits neither a shared pin nor a panel request. No existing expectation was edited for F1. No documentation claim changed.

### Evidence

- Before the product fix, the existing host suite plus the new reproduction failed only the new case: `check repair-B-F1-red: 1 implementation/check-repair-B-F1-red-1793750436589-3577741.log` (13 pass, 1 fail). Product code was still the reviewed head's code. The failure was the disclosure still living inside line 1.
- After the fix: `check repair-B-F1-green: 0 implementation/check-repair-B-F1-green-1793750453970-3578706.log` (14 pass).
- After the final product edit, replayed the exact planned command `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`: `check repair-B-planned: 0 implementation/check-repair-B-planned-1793750465613-3579203.log` (26 pass, 0 fail). This reruns every criterion's boundary proof, including all 25 original tests written by A. Thus acceptance does not rely only on B's reproduction.
- Test-file formatting: `check repair-B-format: 0 implementation/check-repair-B-format-1793750465622-3579202.log`. All four cited logs were read back with `akrogon log`.
- Ran the configured locked setup before dependency-using proofs. No fixture resources, credentials or external actions were needed. All captures completed with final check lines. No temporary files were created.
- `git diff --check` passed and the worktree was clean after the two commits. No full verification or merge checks were run in this handoff. The skill reserves fresh configured verification for the merge move, while `check.fix` runs none.

### Handed to A

- F2: restore the rendered `kept.reason` assertion alongside `kept.path` in `tests/tasks-mod-host.test.ts`. This corrects an existing test expectation, which check-issue's `check.repair` rule explicitly assigns to A. Criterion 7 already uses this host harness and fixture. The missing check is each kept entry's reason appearing in the rendered expansion. No product change or new proof machinery is needed.

No operator action is open. No additional Fix or reusable Nit was introduced. Requested next phase: `check.fix`, for A to finish F2.

## 2026-11-04 check.review after check.fix

Verdict: **ready**.

Prior reviewed base: `f96367e65953e5f34546f807eeb672a70c0be43a`.
Prior reviewed head: `dcf39ce45707378281c356aeff6e5b07642ce65b`.
Handed-off base: `f96367e65953e5f34546f807eeb672a70c0be43a`.
Reviewed repair head: `19998b35d786dd01181a730e47cb1ca56d17b06e`.

Inspected only the repair diff from the prior reviewed head. Computed `git range-diff f96367e65953e5f34546f807eeb672a70c0be43a..dcf39ce45707378281c356aeff6e5b07642ce65b f96367e65953e5f34546f807eeb672a70c0be43a..19998b35d786dd01181a730e47cb1ca56d17b06e` after the report's refresh record. The five previously reviewed commits are unchanged. Only `03bed4bf`, `08781e62`, and `19998b35` are added. No main commits or conflict resolutions enter the repair scope.

- F1 is resolved by the full-height disclosure target and its previously recorded red/green reproduction. The original pin, expansion, parked-row and scale tests remain intact and pass on the current head.
- F2 is resolved in `19998b35`: each fixture kept entry's rendered reason is asserted alongside its path. Compared A's diff against B's repair head `08781e62`; this assertion restoration is the only change. It matches criterion 7 and restores the original regression check without weakening another expectation.
- No defect introduced by the repair was found. No unresolved Fix, operator action or Nit is held by B. No reusable Nit needs a lesson entry. No documented behavior claim changed and no `AREA.md` is in the repair diff.

### Current verification

Read back A's `check check-fix-F2: 0 implementation/check-check-fix-F2-1793750524790-3582333.log` using `akrogon log`: 26 pass, 0 fail across both planned boundary test files. Its command runs both planned files with the configured Bun runner and an added timeout, with no test filtering. The restored assertion ran after its latest edit.

Read back the current format, typecheck and full test logs using `akrogon log`: `check-format-1793750530236-3582865.log`, `check-typecheck-1793750532624-3582865.log`, and `check-test-1793750605347-3582865.log`. All passed. The full suite reports 1309 pass, 0 fail across 75 files.

Confirmed completed verification receipt `8c05fe2a-f0a1-4e72-a5df-9c22bccf2d29`, status 0, `pending: false`, at this exact reviewed head and tree `ea778edb5cfee4ddf42776fe07fdf8c16f1d402b`. Its commands match the configured checks. No known-red disposition, skipped check or proof-command correction is involved. Existing current evidence suffices, so no test rerun was needed.

Kept inspection evidence, both read back with `akrogon log`:

- `check recheck-B-diff: 0 implementation/check-recheck-B-diff-1793750636460-3898001.log` records the repair diff, range-diff, new trailers and clean worktree.
- `check recheck-B-receipt: 0 implementation/check-recheck-B-receipt-1793750658623-3898976.log` records the exact-head receipt, successful verify output and A's assertion-only change.

### Additional Test-Change trailers

The original trailer judgments above still apply. Judged both trailers added since the initial review against `src/test-files.ts` and their cited findings:

| Commit | Trailer | Judgment |
| --- | --- | --- |
| `03bed4bf` | `Test-Change: tests/tasks-mod-host.test.ts review-A F1 and review-B F1: an operator clicking the right edge of line 2 opens Files instead of expanding; add the full-height disclosure reproduction` | Valid real operator source. Adds only the F1 reproduction, with recorded red before the product repair and green after. |
| `19998b35` | `Test-Change: tests/tasks-mod-host.test.ts review-B F2: restore the kept.reason render assertion removed without source, per brief criterion 7 (kept list in the expansion)` | Valid restoration of the cited existing expectation. Current boundary and full-suite runs include it. |

No code or tests changed and no commits were made during this re-check. Requested next phase: `merge`, verdict `ready`.
