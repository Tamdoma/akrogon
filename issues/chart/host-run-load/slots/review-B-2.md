# Direct review B, round 2

Verdict: **fix**

Base: `736067bf474d6f86b3fecb55227c8ef3ac03d940`  
Reviewed head: `f474544bc334f4510d03d1057a3c0b7900e1b161`

## Rebase and repair scope

Ran `git range-diff 0ed00de652e571bd54481244c1b6aed1f000c176..5fc3a6110f013b2f568b5dc49c65728556ba17c0 736067bf474d6f86b3fecb55227c8ef3ac03d940..f474544bc334f4510d03d1057a3c0b7900e1b161` through the direct holder. All seven earlier commits match unchanged. Only `f474544b` is added. Main's intervening changes were excluded from repair review.

Kept result: `check review-B-range-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/host-run-load/direct/check-review-B-range-diff-1792856719504-421110.log`. Read back with `akrogon log`.

## Prior findings

- **F1 closed.** The new CLI case creates and registers a second repository with its own remote and worktree, sharing the first fixture's admission home. It holds a full suite in repo one, observes repo two waiting, proves a light command proceeds, and releases the holder before the second suite starts (`tests/run-permit.test.ts:300-355`). This covers the missing cross-repo criterion. Read back `check-cross-repo2-1792856302516-3767103.log` and `check-deliberate-break-cross-repo-1792856332341-3786230.log`: the case passes normally and fails when admission is restricted per repo. It also passes in both current-head full verify logs. The `Test-Change:` trailer on `f474544b` correctly cites round-1 F1 and criterion 1. It adds a case without changing existing expectations. No new defect found in the repair.
- **F2 remains open: full verify is red.** Waited for the existing current-head merge-scope receipt `be4ad844-ddce-48ae-bcc5-8c0c04ce94a7`, which completed at `2026-10-24T15:50:19.538Z`. Setup, format and typecheck exit 0. The configured `bun test --timeout=30000` exits 1, with **1120 pass, 3 fail**. This still fails direct plan criterion 7. The report's running line was stale at the last read. Record the completed result and resolve verification through the established retry/known-red procedure before approval. No additional full suite was launched, as instructed.

The three failures in the completed rerun are:

1. `the prompt delivery fault holder exit wakes the next merge leaf without a manual next`: 15000 ms timeout.
2. `a leaf re-entering merge queues behind the two leaves stamped earlier`: 15000 ms timeout.
3. `named target equivalence: owner name matches folder path from root, subfolder and worktree`: 60000 ms timeout.

Read the actual rerun log with `akrogon log`: `/home/ivan/Work/infra/akrogon/issues/chart/host-run-load/direct/check-test-1792857015747-363259.log`. No attribution of these timeouts to the repair is established. F2 is the existing required-check blocker, not a new product finding.

Also read the first current-head verify log, `check-test-1792856606439-3826240.log`, and `check-retry-overview-1792856678097-354773.log`. The earlier status TIME mismatch is inconsistent: its isolated retry passes, and it does not recur in the full rerun. That isolated retry does not clear the three new full-run failures or provide a green receipt.

Last operation: wrote direct re-check, verdict fix. No code changes, commits or phase transition.
Next: door resolves F2 and supplies completed verification evidence for slot B re-check.
