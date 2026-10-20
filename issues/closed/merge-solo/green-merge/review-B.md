# Review B

Date: 2026-10-19. Initial blind check.review. Verdict: **fix**.

Base: `abfee125b4ab68bec34bd73325c077c12c74fc47`.
Reviewed head: `4ab37054e11095a2fca576094d629022fa3d65d8`.
Reviewed tree: `728a6d99bbc93a8d342bd932879663cbf09c6f3f`.

Read brief, design, plan, implementation report, installed check-issue references, standing design, changed behavior documentation and reference index. Debate is disabled, so no positions/rebuttal artifacts are expected. No peer review was read. No code was changed or committed.

## Fixes

### F1 Protect the active broadcast seat from reconciliation

Locations: `src/state.ts:116`, `src/reconcile.ts:741` and `src/reconcile.ts:686`.

Real source: a command-landed issue or epic starts its broadcast-only B seat. `dispatchSlot.recordDelivery` immediately saves `prompted.B`, so `broadcastPending` becomes false while B is working. A subsequent operator `akrogon next` or cron `next --resume` reaches reconciliation. Once reconciliation has cleared the landed batch, `mergedWorktree` closes the holder's tab without checking whether its broadcast seat is working. The closed owner's worktree can then be removed too.

Consequence today: a normal queue pass can terminate a broadcast before the sender finishes. The acknowledged handoff will never dispatch again, so the message can be lost. This violates design Flow 5's explicit protection of pending **or active** broadcast work, and the criterion-6 completion handoff contract. Protect the active seat through its terminal outcome across tab/worktree/slice/temp cleanup while preserving the one-dispatch rule.

Proof used the existing criterion-6 command test unchanged through its real `next` → `land` → broadcast dispatch. Replaced its immediate `idleAll(f)` with two `next(f)` calls while B remained working, then asserted the original B pane still existed. The original test makes B idle before those passes and misses this defect. Output:

```text
BROADCAST_BEFORE ... id: "w1:p3", status: "working"
BROADCAST_AFTER []
Expected: true
Received: false
```

`check review-B-active-broadcast: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-review-B-active-broadcast-1792425402877-12173.log`.

### F2 Keep live command ownership during push-refusal restacking

Locations: `src/next.ts:992`, `src/phase.ts:664` and `src/phase.ts:725`.

Real source: the criterion-5 non-fast-forward push when another writer advances the remote. `batchPush` saves `owner: command`, `candidate: head`, `applied: false` and clears the tested fields, then releases the global lock. `finishPush` fetches and builds the restack outside that lock. A hook or cron `next` during that interval is an ordinary concurrent entry point.

`reconcileBatch` leaves that unapplied merge record alone. `mergeTurn` checks `landAlive` only inside its `applied === true` branch, so this live command-owned record falls through to a new attempt and land-unit launch. It overwrites the original attempt while its service is still running. The original restack then fails the attempt check, and a second service can verify the same holder.

Consequence today: remote contention can supersede a healthy land run and start duplicate command work. This violates criterion 7 and the design's exclusive execution contract. Reconcile command ownership/liveness independently of the transient applied flag, including the refusal/restack interval.

Boundary proof used the existing criterion-7 fixture, with its original unit reported running by fake systemctl. Immediately before its second `next`, saved exactly the refusal state that `batchPush` writes (`candidate: top`, `applied: false`, tested fields and decision cleared). Expected the original single launch and attempt to remain. `next` instead replaced the attempt and logged a second land unit:

```text
original: d4bce0ca-751d-4c24-a167-750cbac29edd
current: 6e3bce6b-8d96-4491-b161-feae6cb92f6f
Expected length: 1
Received length: 2
```

`check review-B-live-refusal: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-review-B-live-refusal-1792425441000-74931.log`.

Both diagnostic copies ran from temporary directories and were deleted. They reused existing fixtures and CLI boundaries. F1 runs the actual completing flow. F2's state is traced to the real git-refusal writer above, rather than relying on an arbitrary malformed input. Both failures have causes in this diff, so no unrelated-red retry or known-red disposition applies. Repair needs permanent regression tests for these reachable defects.

## Verification

Read each cited log with `akrogon log`.

- Planned criterion command is present and current: `akrogon run-check --name green-merge-2 -- bun test --timeout=30000 tests/green-merge.test.ts` on `d697d6dd`: 10 pass. `check green-merge-2: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-green-merge-2-1792425109478-2969788.log`.
- Full configured checks on that same tree passed: format, 1062 tests, typecheck. Receipt in `issues/verify-runs.jsonl` is `73dee219-cde2-4945-b761-d1274a210afc` (the report names the outer run ID). No test/helper/config changes followed that green tree. The final trailer-only head has the same tree, so those results remain current.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-format-1792425115732-2983992.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-test-1792425279540-2983992.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-typecheck-1792425282095-2983992.log`.
- No full-check rerun was needed during review. The first temporary diagnostic failed module resolution because its copy was outside the project. The corrected diagnostic resolves the project's installed dependency explicitly and produces F1 above. That harness failure is not a product finding.

## Documentation and test-change review

Criterion 10 passes: merge-issue describes command green landing and B's red/conflict/gate/push work, broadcast-issue names the broadcast-only sender and no phase command, and src/AREA documents land plus the handoff. README lists the verb. The active-broadcast cleanup claim remains unfulfilled in code as F1 records.

Listed literal repository paths separately for each changed AREA file, from the repository root. Every listed path exists. `check review-B-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-review-B-area-listing-1792425402318-13701.log`.

Test-Change trailers in `origin/main..HEAD` (base equals origin/main at handoff), judged against the brief and cited sources:

| Commit | Exact path | Source and judgment |
| --- | --- | --- |
| a4124cce | tests/fake-systemctl.ts | Plan D3 / criterion 7 adds observable is-active. Valid fixture extension. |
| c8743945 | tests/green-merge.test.ts | Recorded advancer failure produced wake=red because its second commit was empty. Unique content restores the intended real remote advance. Valid. |
| 812c4ed2 | tests/helpers.ts | D14 seatOwned represents the existing seat-owned handoff. Valid. |
| 812c4ed2 | tests/batch-dispatch.test.ts | D14 applied-top ownership and criterion-6 broadcast prompt replace obsolete immediate-merge-seat expectations. Valid. |
| 812c4ed2 | tests/next.test.ts | D14 handoff fixtures preserve seat prompt cases, wake cases assert command ownership. Valid. |
| 812c4ed2 | tests/hold-retired.test.ts | D14 command claim replaces immediate B prompt. Valid. |
| 812c4ed2 | tests/leaf-stop.test.ts | D14 unstopped holder now claims command ownership. Valid. |
| 812c4ed2 | tests/pause-next.test.ts | D14 control and paused race assert presence/absence of command ownership. Valid. |
| 812c4ed2 | tests/timing.test.ts | D4 command-run merge wait ends through the later seat prompt. Valid. |
| 812c4ed2 | tests/merge-attempts.test.ts | D3 fake service launch PATH and criterion-6 store worktree for broadcast allocation. Valid. |
| 812c4ed2 | tests/command-reference.test.ts | D3 new land argument contract. Valid addition. |
| 4ab37054 | tests/AREA.md | Plan docs checklist adds new proof file and groups existing entries. Valid trailer-only citation for the prior docs commit. |

The path rule in src/test-files.ts includes tests/AREA.md. No changed lesson removals, skipped planned commands or disabled runner configuration. No additional Nits or operator actions.

## 2026-10-19 check.repair

Repaired all three blocking findings from the initial reviews. Started at `4ab37054e11095a2fca576094d629022fa3d65d8`, repaired head `3da32aad`. No branch refresh or rebase. No change to locked brief/design, existing test expectations, live operations or proof machinery. No items handed to A and no operator actions.

### B-F1 (review-B F1): active broadcast cleanup

- Reproduction commit `14938c7e`, fix commit `79a1ef10`.
- Added one regression that performs the completing CLI flow, leaves B working through two `next` calls, asserts its pane and worktree survive without a duplicate prompt, then makes it idle and checks cleanup completes.
- Fixed all cleanup consumers through `broadcastInProgress`: tab closure (including hook calls), worktree removal, slice stopping and leaf temp cleanup. Pending delivery stays protected. Delivered broadcasts stay protected while the pane is working, blocked or unknown, or the pane inventory is unavailable. Dispatch acknowledgement remains independent, so a protected active seat is never prompted again.
- Before: the working B pane vanished. After: the pane and worktree survive until B finishes, then cleanup resumes.
- `check repair-B-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-F1-red-1792425546567-210000.log`.
- `check repair-B-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-F1-green-1792425566555-224242.log`.

### B-F2 (review-B F2): live restack ownership

- Reproduction commit `0909d057`, fix commit `5c220beb`.
- Added one CLI regression that saves the actual push-refusal state while the original service is running, then verifies `next` preserves the attempt and launches nothing else.
- Moved the live-owner wait ahead of the applied-state branch. The locked new-attempt path rechecks live ownership, and candidate reconciliation leaves a live command owner alone. This covers the same ownership problem in both candidate recovery and new-attempt creation, including the interval while fetch/restack runs outside the global lock.
- Before: the original attempt was replaced. After: it remains the only land launch, with no B prompt or verify started by `next`.
- `check repair-B-F2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-F2-red-1792425579299-235018.log`.
- `check repair-B-F2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-F2-green-1792425593514-242360.log`.

### A-F1 (review-A F1): named Herdr connection

- Reproduction commit `9e3d3660`, fix commit `3da32aad`.
- Added one CLI regression that supplies a named-session HERDR_SOCKET_PATH and inspects the recorded service launch, including the absence of HERDR_PANE_ID.
- The land launch passes HERDR_SOCKET_PATH when set, preserving its connection without assigning an agent seat. Appended the dated implementation note to plan.md under the existing requirement for immediate broadcast dispatch and post-merge wake. No design text changed.
- Before: service argv omitted the connection. After: argv includes the exact named socket and still omits HERDR_PANE_ID.
- `check repair-B-AF1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-AF1-red-1792425601722-247728.log`.
- `check repair-B-AF1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-AF1-green-1792425611745-254772.log`.

### Current proof and scope

Every cited reproduction log was read back through `akrogon log`. Each reproduction was red before its corresponding production change and committed separately, with a Test-Change trailer citing the finding's real source. Existing expectations were not changed.

All criteria 1–9 were rerun using the planned `bun test --timeout=30000 tests/green-merge.test.ts` boundary, after the required locked setup, on the committed repaired head. All 13 cases passed, including all 10 original planned cases written by A and the three reproduction tests written by B. No filtering, skips or runner changes in the final proof.

`check green-merge-repair: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-green-merge-repair-1792425625692-260478.log`.

Criterion 10's skill and AREA docs remain unchanged from the reviewed implementation. These repairs make the already documented contracts hold. No merge_checks were run. No temporary scripts or diagnostic files were created in this repair. No reusable Nits remain held by B.

### Full-check first run and retry

First full `akrogon verify` on `3da32aad0511c982c6a193598d8a52501853e114` completed as receipt `4e6e04c7-be2c-4170-8aef-d8c637fe0206`: format and typecheck passed, test had 1064 pass and one failure in the unchanged status overview case. It expected `0h 23m` and received `0h 22m` at tests/status.test.ts:151.

The source trace shows that fixture's terminal timestamp and delivered-prompt timestamp each use a separate Date.now(). The existing clock floors their difference to whole minutes. A later prompt timestamp can therefore make the nominal 23-minute difference slightly shorter. The leaf diff does not touch that fixture, starts(), terminal-time selection or clock(), and the failing fixture is a failed leaf with no land/broadcast state, so the changed status notes are not a plausible cause. No test expectation was edited.

- `check test: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-test-1792425801820-278221.log`.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-format-1792425630925-278221.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-typecheck-1792425804159-278221.log`.

All three logs were read back. Retrying the unchanged full verify through `akrogon run-check --name repair-B-checks-retry -- akrogon verify` preserves the same test command, arguments, head and fresh-checkout scope, while also obtaining the current full-check receipt. No code changes between runs.

Retry completed green on the unchanged head. Mark the status overview timing check **inconsistent**, retaining both logs above and below. No known-red run was needed. The retry was not stuck: verify writes setup/command fields into the receipt only at finalization, and the checked process tree showed the test suite running normally.

- `check repair-B-checks-retry: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-repair-B-checks-retry-1792425978804-1114316.log`.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-format-1792425823439-1114368.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-test-1792425976569-1114368.log` (1065 pass, 0 fail).
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-typecheck-1792425978775-1114368.log`.

Read every retry log back with akrogon log. Completed green leaf receipt: `7fb71606-ceff-4138-b066-8de5b798b0ff`, head `3da32aad0511c982c6a193598d8a52501853e114`, tree `b9dd7f60f8774c568a9e1e182442f93345ae2048`. Worktree clean and diff whitespace check passed. All Fixes repaired. Ready for merge.

## 2026-10-19 merge attempt 5e0b70b5-6fb7-4d29-96e2-0169f57de6cc

The command applied top `fe02e2df28bc1836247049cb00d4e045ff21f63f` onto `c57794661a683bb5ee849f797cca10ee931a3ad5`. Previous reviewed/repaired head `3da32aad0511c982c6a193598d8a52501853e114`, old base `abfee125b4ab68bec34bd73325c077c12c74fc47`. Worktree clean and HEAD equals the prompted top. No B fetch, rebase or new commits.

Computed `git range-diff abfee125..3da32aad c5779466..HEAD`: all 15 commits are equivalent, with no changed patch or conflict resolution. `check merge-B-applied: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-merge-B-applied-1792426018793-1598827.log`, read back with akrogon log.

Read the plan, design, implementation report and both reviews again. All initial Fixes remain repaired. Read both completion-owner briefs, solo-turns and green-merge, for the merge-solo completion broadcast. Started `akrogon verify --attempt 5e0b70b5-6fb7-4d29-96e2-0169f57de6cc` on this applied top, with the configured merge scope and no exclusions.

Merge verify on the applied top passed first run: 1066 tests, 0 failures, plus format and typecheck. No advisory failures or mechanical repairs. Read all three logs back through akrogon log:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-format-1792426020153-1596704.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-test-1792426190256-1596704.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-typecheck-1792426192439-1596704.log`.

`akrogon phase green-merge merged --slot B --check --attempt 5e0b70b5-6fb7-4d29-96e2-0169f57de6cc` printed `ok`. The tested top remains `fe02e2df28bc1836247049cb00d4e045ff21f63f`. Completion owner briefs have been gathered. Proceeding to the command-owned fast-forward push and phase move.
