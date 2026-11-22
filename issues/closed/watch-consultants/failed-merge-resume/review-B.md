# Slot B review

Base `1502fbdf362e2b6dc3c721722532d6fce8a9b622`. Reviewed head `e9836c91790f9c1e70c915d99b0b1f1502878eae`. Verdict `ready`. No fixes or nits.

## Behavior and proof

1. `src/phase.ts` clears the candidate-less batch in the recovery move, before `phase` calls `mergeWake`. The merge path fetches the remote and builds a fresh attempt. The command test runs `phase aa merge` and `next aa` after advancing `origin/main`. It checks the new attempt, new base, actual branch ancestry, and the absence of the old attempt and top from prompts and the attempt ledger. It also checks that B receives the fresh attempt and top after handoff. The pre-fix log `implementation/check-plan-test-c1-red-1795285429058-250788.log` fails on the stale attempt assertion. The planned Bun command with `--timeout=30000 --parallel=4 --no-isolate` passed all 26 cases in `implementation/check-impl-c1-1795285467697-279802.log` on the reviewed head. The proof file has the same blob as the red-first commit, and the diff leaves runner configuration and fixture helpers intact.
2. A batch with a pushed candidate retains the information `reconcileBatch` uses to settle the push. The existing landed-candidate test is unchanged and passed in the focused run and full verification. The changed batch description in `docs/reference/state-and-phases.md` matches the move, and the recovery and merge guides still describe the command flow accurately.

## Verification

- The six related test files finished 340/0 on the same-command retry, up from 339/1 after a `selfUpdateCli` dispatch failure. Read back `implementation/check-impl-batch-files-1795285491490-298852.log` and `implementation/check-impl-batch-files-retry-1795285523803-415455.log`.
- The full-suite known-red comparison linked head run `69f24048-8718-4fe4-bafd-1326152890f3` to base run `bab3cd2d-e4dd-444c-9e63-bb6cfad3c93e`. Both logs end with Bun's own summary. The head failed the named `next --all, --resume and manual next record the registered or selected repos before dispatch` test and the base passed it, so the known-red judgment is `fail`. The initial five dispatch timeouts and later two fixture failures were distinct. All eight previously failing cases and both issue criteria passed in the final full run on the identical head. Verification rests on that green receipt, `e1c220b9-04c7-40bf-9a57-23941cd9f416`, with setup, format, typecheck and test all at exit 0. Test log `implementation/check-test-1795286777608-2631781.log` records 1,245 pass, 0 fail.
- Matched 24 check starts and ends to the 24 kept logs in `issues/timings.jsonl`. `readiness.yaml` records zero grants, and the logs show local test and setup commands. Review reused the kept evidence. `git diff --check` passed.

## Test-Change trailers

- `f0cd0f5051e3cf037a9fd56261835f2532e590a1` has `Test-Change: tests/batch-dispatch.test.ts brief.md done-criterion 1 (new red-first case; no existing expectation changed)`. The exact path matches `src/test-files.ts`, the case exercises the recovery sequence named in the brief, and the commit adds one case. This is the only trailer in the reviewed range.

## Merge attempt `d8d2cbd7-88dd-4250-8ab0-fbdd772094d7`

Rebase target `eb4d64e9b3fd27307cce1f9ac794a5211b72433b`. Prior reviewed head `e9836c91790f9c1e70c915d99b0b1f1502878eae`. Rebased and tested head `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`. The range-diff matched both reviewed commits without patch changes and `git diff --check` passed.

The land verification `54e47ca5-24ab-459f-9254-e859ee364316` passed setup, format and typecheck. `bun test --timeout=30000 --parallel=4 --no-isolate` exited 1 with 1,262 pass and 1 fail. The agy case at `tests/door-reset.test.ts:270` saw only the `started` log stage and expected all six. See `implementation/check-test-1795287110530-3430450.log`. Both merge-resume criteria passed. The failing test starts a stand-in and exercises the chart door's reset script. This leaf changes only batch state on recovery from `failed`, and the same assertion failed in the initial review's earlier verification. Retried the full merge verification on the identical head.

The retry `akrogon verify --attempt d8d2cbd7-88dd-4250-8ab0-fbdd772094d7` exited 1 in run `ffaf727a-cc95-4f3f-84b4-94edd8d0e7a8`. The same `bun test --timeout=30000 --parallel=4 --no-isolate` command again finished at 1,262 pass and 1 fail, with the same `tests/door-reset.test.ts:270` assertion and only `started` recorded. Both merge-resume cases passed again. See `implementation/check-test-1795287307162-3775166.log`.

`akrogon verify --attempt d8d2cbd7-88dd-4250-8ab0-fbdd772094d7 --known-red` exited 1 with `verify known-red 4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444: fail`. The kept head and base test logs both reached Bun's final summary. Base `eb4d64e9b3fd27307cce1f9ac794a5211b72433b` already has a full green receipt `a0751610-a61b-498e-8ed1-0d229596812f` under the same commands. Its test log `../consultant-seat/implementation/check-test-1795286634777-2512118.log` confirms this specific agy case passed on the base. The repeated head failure remains uncovered and blocks the merge. Route to `check.fix`, starting with the reset test file on the rejected head to narrow the failure.

## 2026-11-21 check.review after check.fix

Verdict `ready`. Rebase target `eb4d64e9b3fd27307cce1f9ac794a5211b72433b`. Rejected and handed-off head `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`. The worktree is clean, the repair diff is empty, and the range-diff on the recorded base matches both commits. No documented behavior changed during `check.fix`. Rebased commit `934dd664` still carries the previously reviewed `Test-Change:` for `tests/batch-dispatch.test.ts` and brief criterion 1.

The implementation report identifies the rejected Bun suite and the six-stage assertion that saw only `started`. The linked merge receipts record the exact rejected command `bun test --timeout=30000 --parallel=4 --no-isolate` on the stated base and head. The focused `bun test --timeout=30000 --parallel=4 --no-isolate tests/door-reset.test.ts` passed all 16 cases twice on that same checkout, including the agy case. Read back `implementation/check-fix-repro-1795287364694-4130243.log` and `implementation/check-fix-repro-rerun-1795287542612-289987.log`. The test failure reproduced intermittently on the unchanged tree. The focused passes followed the earlier merge failures without a product repair or proof-command change.

Full verification receipt `83b19acd-6643-40b3-9619-22068ec2be6d` is green on the handed-off head. Setup, format, typecheck and the original unfiltered suite all exited 0. The full run includes both brief criteria and the agy case, with 1,263 pass and 0 fail in `implementation/check-test-1795287533223-4134218.log`. The fresh green receipt supplies verification for this review. The historical known-red judgment for the rejected merge remains `fail`.

Matched 38 check starts and ends to 38 kept logs. No outstanding captures or paid or live checks for this leaf. No fixes or nits.
