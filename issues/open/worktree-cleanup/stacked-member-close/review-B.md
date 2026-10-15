# Review B

Verdict: ready

Base: f3557d8dc8a74459eefcc63dacb419332df1659e
Reviewed head: 24dd2b57d7731a1b206f8195dac8f4d83f5e8334
Date: 2026-10-15
Phase: check.review

Read brief, design, plan, implementation report, check-issue instructions and ponytail reference. The authoritative open store contains one matching leaf. Debate is disabled, so no positions-B or rebuttal-B artifacts are expected. Reviewed the complete four-file diff and affected CLI, phase, reconcile, state discovery and dispatch contracts. No peer review was read. Worktree is clean.

## Findings

No Fixes or Nits.

The merged-member collection runs under the existing lock, uses only batch members, excludes members already in moved, and reads both open and closed records through allLeaves. Both collections receive the existing close and dependent-dispatch operations after the lock. The holder cannot enter either collection. The recovery change preserves pending.candidate for the ancestry check after finishPush confirms publication. Existing dispatch guards prevent a later pass from starting the same dependent again.

## Acceptance evidence

- C1: The normal landing test invokes the CLI phase command with a holder and two members, checks both member tabs absent, keeps the holder tab, and observes one prompt for each member's dependent without a hook event.
- C2: The recovery test runs the real push through a shim that then returns failure. The CLI fetch/finishPush/mergeWake route confirms landing, closes the member tab and dispatches its dependent. Normal landing separately exercises two members through the same collection loop.
- C3: Both tests assert the holder tab remains after the merge wake.
- C4: The normal landing test runs next --all again and observes exactly the original two dependent prompts.

Saved red evidence: implementation/check-plan%20stacked-member-close%20member%20tabs-1792097453657-2471504.log shows both normal member tabs remain before the fix. implementation/check-plan%20stacked-member-close%20recovery-1792097461656-2513009.log shows the recovery member tab remains. implementation/check-test%20recovery%20wake-1792097600061-3268695.log shows recovery still red before the candidate fix; implementation/check-test%20recovery%20wake-1792097654112-3604657.log shows it green afterward.

Current proof: implementation/check-test%20batch-dispatch-1792097671172-3635812.log records the planned bun test tests/batch-dispatch.test.ts command through akrogon run-check, 30 pass and 0 fail. Its check label differs from the plan but its executable and scope are unchanged.

Verified the completed akrogon verify receipt directly in the registered checkout's issues/verify-runs.jsonl: run 11e5aa85-08a3-49a9-adb5-47df40845d3c, exact reviewed head, tree 156ac8ef4dde5ee8a014830993d205d6e0587542, setup 0, format/test/typecheck all exit 0, completed 2026-10-15T20:57:39.815Z. The saved logs show 847 tests passing, no failures, clean formatting and typecheck. This run began after the final test commit and includes both added cases. No planned tests, helpers, configuration or runner were skipped or disabled. No rerun needed because code is unchanged and current evidence is complete.

## Test-Change trailers

- c414386c99bf4b6c7a026511222815d8ef245f2c: `Test-Change: tests/batch-dispatch.test.ts adds two stacked-merge cases at the end of the file; no existing expectation changed`. The diff adds the planned regression cases and leaves existing assertions intact.
- 24dd2b57d7731a1b206f8195dac8f4d83f5e8334: `Test-Change: tests/batch-dispatch.test.ts real output showed dependent tabs w1:t14 and w1:t18 alongside the holder tab after the member close`. Confirmed against implementation/check-test%20stacked-member-close-1792097525841-2798424.log. Dependent allocation is required behavior, so whole-list equality was incorrect. The replacement still checks the holder remains, while the separate assertions require every member tab to be absent. This correction preserves all acceptance outcomes.

The changed test path matches src/test-files.ts. No existing regression test was removed.

## Documentation

Read docs/guide/merge.md and docs/reference-index.md. The added merge-guide statement matches the landed reconciliation behavior. No AREA.md file or index pointer changed. No lesson lines were removed.

## Operator actions

None.

## Merge pass — 2026-10-15

Attempt: d67cf345-369b-4dbe-8a30-3a2864c60d25. Applied memberless top: dace0f7ae802db734890e43e2860a46a80d1653d. Integration base: 79504506837bd8912b08088db9b44d9fb3c2cc47. Clean worktree. `git range-diff f3557d8..24dd2b5 7950450..dace0f7` shows all four reviewed commits unchanged after the command's rebase. No manual edits, commits, fetch or rebase performed by this seat.

`akrogon verify --attempt d67cf345-369b-4dbe-8a30-3a2864c60d25` exited 0 on the applied top. Run 3eb7052f-1bcf-4f50-9b25-616f17de0e9c: setup and formatting passed, 848 tests passed with 0 failures, typecheck passed; final output `verify merge dace0f7ae802db734890e43e2860a46a80d1653d: green`. Receipt and per-command logs are retained in the registered issues/verify-runs.jsonl and this leaf's implementation folder. No advisory failures.

Read all six leaf briefs under the worktree-cleanup completion owner before landing. Other leaves remain unfinished, so this landing is not expected to complete the epic. Broadcast only if the merge command prints an actual completion line.

`akrogon phase stacked-member-close merged --slot B --check --attempt d67cf345-369b-4dbe-8a30-3a2864c60d25` exited 0 with `ok`. The matching `merged` command exited 0, printing `moved merged` and `deployed 79504506837b..dace0f7ae802`. No issue/epic completion line was printed, so no broadcast was due. Leaf state is merged. Remote main read-back confirms the deployed SHA.
