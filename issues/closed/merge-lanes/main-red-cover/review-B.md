# Slot B review for main-red-cover

**Verdict** `fix`

Reviewed base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` and head `a420e39c44a524e64ac7a8d0183f35fda1af7b77`.

## Fixes

- **F1** An older covered run can hide an uncovered failure from the current land run. The land entry point at `src/land.ts:89–90` passes only the head SHA to `mainRedCover`. At `src/verify.ts:295–332` the predicate accepts any completed run with the same tree and commands. Both merge receipt gates then consult the same predicate at `src/verify.ts:501–507`. Real merge retries can record different failures on the same tree, as the registered repo's `verify-runs.jsonl` shows for `watch-timer` runs `906f42dc` and `7152a3e7`. In an isolated CLI fixture, real Bun checks produced a base comparison with `alpha` and an older head run with `alpha`. The current land verify on the same tree added `beta`. Land pushed and recorded `merged`, with no base evidence for `beta`. This violates C2 and C4 and exposes the conflict between D4/D5 and the brief's every-failing-unit requirement. Bind the automatic cover decision to the completed verify result for this land run and ensure the gates enforce the same evidence. Add a command-boundary regression that preserves both head runs and asserts no push and `wake: red` for the current uncovered run. Keep the direct route's linked-base judgment as specified. Evidence is in [the red CLI run](implementation/check-review-b-current-head-1795293748103-1758694.log).
- **F2** The indexed command reference still gives an incomplete receipt contract. An agent following the Command link from `docs/reference-index.md:3` reaches `src/AREA.md:17`, which lists green and linked-base receipts as the accepted forms. An agent diagnosing the C1/C4 landing can therefore conclude an ordinary red run with no linked comparison cannot pass the merge gates. The command docs also phrase the cover as an exception to all handoffs, though the gate, push and rebase handoffs still apply after a covered verify at `src/land.ts:96–112`. Align those entries and the opening sentence in `docs/reference/checks.md:79` with the actual merge-scope receipt alternatives and the cover's effect on the red verify handoff. The indexed page, command row and both source files exist from the reviewed root. `docs/reference/files.md` correctly distinguishes stored names from the linked-base log read, and the direct-route proof continues to use the linked-base path.

## Verification

The implementation report cites a pre-correction receipt matrix for C2/C3 and grouped output for some exact plan filters. Slot B reran all five planned invocations at the reviewed head. Each selected one test and exited 0.

| Criterion | Planned command | Kept output |
| --- | --- | --- |
| C1 | `bun test tests/green-merge.test.ts -t 'covered by an unresolved'` | [review-b-c1](implementation/check-review-b-c1-1795293709738-1632076.log) |
| C2 | `bun test tests/green-merge.test.ts -t 'hands off to the seat'` | [review-b-c2-land](implementation/check-review-b-c2-land-1795293711592-1636877.log) |
| C2/C3 | `bun test tests/verify.test.ts -t 'covered merge head and refuses'` | [review-b-c2-c3](implementation/check-review-b-c2-c3-1795293712656-1642934.log) |
| C3 | `bun test tests/verify.test.ts -t 'resolves the main-red incident'` | [review-b-c3-notice](implementation/check-review-b-c3-notice-1795293714269-1648012.log) |
| C4 | `bun test tests/receipt-gates.test.ts -t 'covered main-red head'` | [review-b-c4](implementation/check-review-b-c4-1795293715001-1632053.log) |

The configured `akrogon verify` receipt `d56915b4` is green at the reviewed SHA. Its test log has 1,268 passes and zero failures, including all five planned cases. The configured [format](implementation/check-format-1795292024503-3385399.log), [typecheck](implementation/check-typecheck-1795292027729-3385399.log) and [test](implementation/check-test-1795292166722-3385399.log) logs are current. The earlier `abf95ef1` test failure in the untouched Herdr seat start test was inconsistent with the [green retry](implementation/check-test-retry2-1795293546440-736796.log) and green receipt. The interrupted retry has its [clearance record](implementation/cleared-f6b59338-9e02-4489-800b-6692fb7df147.md). No grants or covered operations were used.

The deliberate breaks for merge scope, the land cover consult, nameless resolution, and on-main ancestry exited red. The initial on-main break exited green, then the changed test made the same break exit red in [break-onmain2](implementation/check-break-onmain2-1795291845304-3057478.log). The tests assert the mechanical rule at receipt and command boundaries. F1 is outside the planned fixtures' single-head histories.

## Test-Change trailers

All seven trailers cite paths matched by `src/test-files.ts`. The three files gained new cases. No pre-leaf assertion was removed or altered.

| Commit | Trailer path and cited source | Judgment |
| --- | --- | --- |
| `0be68958` | `tests/green-merge.test.ts` and brief C1–C2 | The added land and handoff cases implement the cited outcomes. |
| `0be68958` | `tests/verify.test.ts` and brief C2–C3 | The added receipt matrix and recurrence case implement the cited outcomes. |
| `0be68958` | `tests/receipt-gates.test.ts` and brief C4 | The added gates and push case exercises the cited acceptance and refusal. |
| `bd3af1d6` | `tests/receipt-gates.test.ts` and `cover-gates-1795291665902` | The log shows the move line before the JSON result. Reading the final line preserves the land result assertion. |
| `fe4b32c7` | `tests/receipt-gates.test.ts` and `cover-gates4-1795291718760`, `cover-gates5-1795291727619` | The logs show the earlier tested-top guard and the nonempty schema for failure names. `cover-gates3-1795291700540` also shows the fixture's earlier merge refusal when the fixtures shared a container. The corrections reach the intended receipt boundary. |
| `fe4b32c7` | `tests/verify.test.ts` and `cover-notice-1795291735137` | The log shows the lookup attempted to find a base run for a base row. Selecting the second head and checking its pending notice preserves the recurrence assertion. |
| `a420e39c` | `tests/verify.test.ts` and `break-onmain-1795291832217` | The cited break passed before the fixture matched the command. The corrected fixture keeps the green row out of the receipt shortcut, and the same break then fails. |

## 2026-11-21 check.repair

Repaired head `4963f4da`.

- **B F1** The regression commit `3946d298` drives actual verify and land commands through two red runs on the same tree. Before the fix, the [regression exited 1](implementation/check-repair-b-stale-cover-red-1795293945735-2092254.log) because the remote advanced. In `2cb7ffd9`, `land` and both of its gates use the exact verify receipt for automatic cover. Other merge receipt callers consult the newest finished matching head run for ledger cover. Comparison rows provide base evidence. A verify service error takes the existing error path. The linked-base judgment keeps its existing behavior. After the fix, the [regression exited 0](implementation/check-repair-b-stale-cover-green-1795294037889-2310724.log). It observed the two distinct failure sets, no push, the red handoff for the second run, and a refused merge receipt gate. The dated plan note cites the brief's C2/C4 requirement.
- **A F1 and B F2** Commit `4963f4da` corrects the command and receipt documentation. Before, `src/AREA.md` said “a red verify, gate refusal, failed push or rebase hands the attempt to B,” and the checks page began “The gate accepts a receipt only when” all commands were green. After, `src/AREA.md` says “Main-red cover uses the current verify run and lets it continue to the gates without a rerun or base run,” the checks page names the three receipt paths, and the commands page scopes the exception to a red verify. The index, source and docs paths resolve from the worktree.

All five existing planned invocations passed on the repaired head. C1 [land](implementation/check-repair-b-c1-1795294104444-2460417.log), C2 [red handoff](implementation/check-repair-b-c2-land-1795294107997-2464449.log), C2/C3 [receipt matrix](implementation/check-repair-b-c2-c3-1795294109048-2469867.log), C3 [notice recurrence](implementation/check-repair-b-c3-notice-1795294113520-2471374.log), and C4 [gate and push](implementation/check-repair-b-c4-1795294116139-2460403.log). No grants or covered operations.

First configured verify pass `76537a0e` on `4963f4da` passed [format](implementation/check-format-1795294124660-2481097.log) and [typecheck](implementation/check-typecheck-1795294129492-2481097.log). The [test log](implementation/check-test-1795294416272-2481097.log) ended with 1,268 passes and one failure in `tests/hc-identity.test.ts`. The failing path is a `next` dispatch to a leaf in `plan.synthesis` after switching Herdr cores. It reaches neither the changed verify command branch nor any land or merge receipt gate. The same test passed in the prior green receipt and appeared during the implementation seat's interrupted retry. Retrying `bun test --timeout=30000 --parallel=4 --no-isolate` on the same head through `akrogon run-check --name test`.

The [same-command retry](implementation/check-test-1795294608483-3033282.log) exited 1. Session dispatch passed on retry. The only retry failure was the Agy reset in `tests/door-reset.test.ts`, which stopped after writing the `started` stage. That test runs the reset helper and does not call verify or a merge gate. The diff touches neither test, the session dispatch under test, nor the reset helper.

`akrogon verify --known-red` exited 1 on `4963f4da` as slot B. The selected head receipt was `76537a0e`. Its merge-base `4f5e3fd2` already has whole-green receipt `83b19acd` for the same command set, so Akrogon skipped the base run and printed `verify known-red 4963f4da1b709d51f52cc2ce74b57fded8befa25: fail`. The check remains blocking under the lifecycle retry rule. The code and documentation fixes are committed, and the current head needs a green configured receipt before the leaf can move to merge.

## 2026-11-21 check.repair resume

The operator resumed slot B on repaired head `4963f4da`. The five planned proofs and the regression still apply to this head. A fresh `akrogon verify` exited 0 and wrote green leaf receipt `d20749f8`. [Format](implementation/check-format-1795295833700-1862717.log), [typecheck](implementation/check-typecheck-1795295836641-1862717.log), and the [full suite](implementation/check-test-1795296143901-1862717.log) passed. The suite reported 1,269 passes and zero failures. This clears the earlier verification blocker and completes the repair pass.

## 2026-11-21 solo merge

Attempt `5671529d-0f29-4f9f-941e-dc21cd6a5d5b` rebased the prior reviewed head `4963f4da1b709d51f52cc2ce74b57fded8befa25` from base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` onto `eb9f22ab821e2b9a76fa058f4e914557530d6f2d`. The resolved head is `852ddb916496b4211561ab15076c85bb02a61672`.

The rebase conflicts in `docs/reference/files.md` and `src/AREA.md` combined the upstream `patch_base` and `patch_id` contract with the leaf's main-red cover. The source and documentation paths resolve. [`git range-diff 4f5e3fd2..4963f4da eb9f22ab..852ddb91`](implementation/check-merge-b-range-diff-1795296252496-2790674.log) pairs all eight commits and shows only those two documentation resolutions. The [retired lesson check](implementation/check-merge-b-retired-lessons-1795296262340-2792030.log) found no lines to remove.

The first `akrogon verify --attempt 5671529d-0f29-4f9f-941e-dc21cd6a5d5b` on `852ddb91` wrote receipt `63909851`. Formatting and type checking passed. The [test command](implementation/check-test-1795296438544-2796861.log), `bun test --timeout=30000 --parallel=4 --no-isolate`, exited 1 with 1,286 passes. `tests/next.test.ts` reported “a replaced blocked seat gets a fresh notice” failing at the second dispatch. The failure is on `next` for a leaf in `plan.synthesis`. That path reaches none of the changed verify and merge gates. Retried the same verify command on the same head and attempt.

The retry wrote green merge receipt `0b15dc9a`. The same [test command passed all 1,287 tests](implementation/check-test-1795296816103-3226018.log), including the replacement-seat case. [Format](implementation/check-format-1795296450911-3226018.log) and [typecheck](implementation/check-typecheck-1795296456665-3226018.log) passed. The first run's failure is inconsistent. The merge receipt recorded a slow notice and a green verdict.

`akrogon phase main-red-cover merged --slot B --check --attempt 5671529d-0f29-4f9f-941e-dc21cd6a5d5b` printed `ok` for `852ddb91`.

`akrogon phase main-red-cover merged --slot B --attempt 5671529d-0f29-4f9f-941e-dc21cd6a5d5b` exited 0 and printed `moved merged` and `deployed 852ddb916496`. The remote `refs/heads/main` and deployed release both point to `852ddb916496b4211561ab15076c85bb02a61672`. The attempt ledger records `merged` for that tested top.
