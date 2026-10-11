# Review B: records-sync

Date: 2026-10-11
Phase: check.review (initial, blind)
Base: `c53f6196533289555518577f08907ec9c713721c`
Reviewed head: `d6ea570387054dc73d8de9ee570b70773ee304c3`
Verdict: **fix**

## Fixes

### F1: Other registered checkouts never finish a pending move without another push

Location: `src/self-update.ts:95-96`.

Real source: the existing `src/next.ts:1548` self-update trigger for a registered repo other than akrogon, with local issue-record commits and an incoming code update overlapping an operator edit. This is the brief's criterion 3 scenario, combined with criterion 1's explicitly required other-repo scope.

The first trigger pushes the records and reports checkout pending. After the edit is removed, scratch rebase drops those already-pushed patches and returns `tip: null`. The `own || pushed !== null` gate then skips the checkout move. Every later trigger leaves the checkout behind silently. The same gate skips ordinary behind-only updates for other registered repos.

Evidence: `implementation/review-B-scenarios.log`, scenarios `foreign-behind` and `foreign-pending-retry`. Real local bare remote, initial clone, remote code commit, local eligible record commit, dirty overlapping file, then `git restore file` and a second `selfUpdate` call. First call reports pushed and pending. Second call prints nothing and `retry checkout at remote: false`; the code file retains its old contents. In the clean behind-only scenario, HEAD stays at the initial commit and no line prints.

Consequence today: registered projects continue running old code after the requested retry, despite their record commits already being published. This violates criterion 3, plan D4/D6 and the brief's every-registered-checkout scope. Report L1 is an implementation deviation, not a binding design exclusion. The unchanged hold/batch fixture expectations do not supersede the leaf contract.

Required correction: move eligible checkouts on the no-push path too, including other repos after upstream patch deduplication. Add boundary regression coverage for the other-repo pending retry. Current pending tests exercise only the own repo and miss this failure. The install guide and README currently promise the behavior this gate prevents.

### F2: Mixed reset reports deployed while incoming code remains unapplied

Location: `src/self-update.ts:139-157`.

Real source: an own checkout receiving a normal remote commit changing two code files, while the operator has finished an overlapping edit to the incoming contents in one file. The plan and install guide explicitly allow the next trigger after finishing that edit. The other incoming file starts clean and must receive the remote change.

`reset --keep` refuses the dirty overlapping file. The fallback compares only colliding dirty paths against target blobs, then runs `reset --mixed` across the entire checkout. Mixed reset updates HEAD and the index but leaves every worktree file untouched. Therefore the clean second code file retains its old contents and becomes an unintended local modification relative to the new HEAD.

Evidence: `implementation/review-B-mixed.log`. A complete own-repo fixture has `file=old` and `second=old second`; the remote changes both to incoming values, and the operator changes only `file` to its incoming value. `selfUpdate` prints `deployed ...`, HEAD equals remote, but `second` is still `old second` and status is `M second`. A second trigger prints `current ...` and still leaves the old code. The earlier aggregate scenario log also reproduced this state, but its mixed fixture lacked skills and reported a later link error. The dedicated complete-fixture log removes that unrelated fixture error.

Consequence today: the deployed runtime may run stale code indefinitely, and a subsequent operator commit can accidentally publish the stale file as a revert. This breaks plan D4's checkout move semantics and criteria 1/3's incoming-change and retry outcomes. The existing pending test changes only one incoming file, so it cannot catch the partial deployment.

Required correction: use a move that applies clean incoming paths while preserving operator edits, or retain a truthful pending outcome until the safe keep move can succeed. Do not report deployed after an index-only move that leaves clean incoming files unapplied. Add a real Git boundary regression with both an overlapping file and another clean incoming file.

## Verification

- Read brief, binding design, plan and implementation report before the diff. `debate: no`; no B positions/rebuttal artifacts exist. Reviewed all six changed files and followed the self-update call sites and unchanged sync documentation. No AREA.md is changed. `docs/guide/files.md` is unchanged and sync's documented staging behavior remains intact.
- Working tree was clean before and after review probes. No implementation edits or commits were made. All fixtures used temporary local Git repositories and bare remotes, with no live remote mutation. Fixture directories and temporary scripts were removed.
- Ran the configured dependency setup under `akrogon-install.lock`: `bun install --frozen-lockfile`, exit 0, no changes.
- Ran real `selfUpdate` boundary probes on this head. Logs: `implementation/review-B-scenarios.log` and `implementation/review-B-mixed.log`. Both probe processes completed with exit 0 and recorded the wrong product outcomes above.
- Existing recorded full-suite evidence: `implementation/check-test-1791717675838-1064065.log`, `800 pass`, `0 fail`, 42 files, 120.85 seconds. The implementation report records the configured guarded test command, changed-test check, typecheck and format as green, plus all planned targeted test files, without filtering or disabling planned tests. No whole-suite rerun was needed to establish these specific uncovered failures. These are product findings, not unexplained red checks requiring a base comparison.
- Criterion 2's per-commit classifier rejects an undone code change. Criterion 4's conflict path removes the scratch worktree without moving root or pushing. Criterion 5's behind-only hazards are exercised. Criterion 6's sync suite is unchanged. The documented every-repo move and retry promises are contradicted by F1, and the fallback's deployment promise by F2. Passing recorded tests do not prove those uncovered outcomes.

## Test-Change trailers

- `9e28d73262efb9ee44e375d09d6021db46ee95c4`: `Test-Change: tests/install.test.ts plan-authorized updates for the pending vocabulary and non-own-repo git stage (records-sync plan)`. Accepted: plan Red evidence explicitly names these existing expectation updates, and brief criteria 1/3 require the new scope and pending behavior. The test now checks a real non-own Git push and absence of install links/lock.
- `2bc2e09b07337a974f799ace17029f137fec3f93`: `Test-Change: tests/self-update.test.ts brief criterion 3 (pending keeps local history) and criterion 5 (hazard check reads the worktree's ignore rules); planner corrections to its own planned tests, no source needed per the test-proof rules`. Accepted against the actual cited criteria: keeping local history is explicit in brief/design; local `.gitignore` makes the ignored operator collision genuine at the boundary where sync reads ignore rules. The wording about needing no source is not the basis for acceptance. The correction still preserves the hazard refusal assertion.
- `src/test-files.ts` matches both test paths. No other Test-Change trailers occur in base..HEAD. The new planned test file needs no trailer on its creation commit.

## Nits and operator actions

None. No required credentials, grants or live mutations apply to these local-Git proofs.

Reusable review lesson recorded in the registered checkout's `learnings/`: a checkout move proof needs worktree contents, not only HEAD and the deployment line. Left uncommitted for the operator.

## 2026-10-11 check.repair

Repair start: `d6ea570387054dc73d8de9ee570b70773ee304c3`.
Handed-off head: `f0d00847a141abca295251dcd4b7db6b7a9948a5`.
Base remains `c53f6196533289555518577f08907ec9c713721c`.

Read both initial review files. A's F2 and B's F2 are the same defect and share one repair. A's F1 remains handed to A below. No operator-only action is open.

### Repairs completed

- **B F1 product repair**: reproduction commit `58c689e2de2cea6663c99f3d627aad39feb846d9`, fix commit `25f411290f5bcbffae0295145f6ecdf96a86c007`. Removed the own-repo gate from the integration's checkout move. Install/links remain own-repo-only. The regression uses the real other-repo pending-push scenario, removes the edit, then verifies HEAD equals the already-pushed remote tip, incoming contents applied, no additional remote commit, clean unstaged status, no stash/scratch residue and no install lock. Before: `8 pass, 1 fail`, with expected remote tip different from actual checkout tip. After: `9 pass, 0 fail`. Logs: `implementation/repair-B-F1-red.log`, `implementation/repair-B-F1-green.log`. Existing expectation/fixture corrections exposed by this repair remain handed to A.
- **A F2 / B F2**: reproduction commit `91423783dec006ddd7ff512aeefbfb6b98aa633d`, fix commit `f0d00847a141abca295251dcd4b7db6b7a9948a5`. Mixed reset now requires every changed path to be a content-equal dirty collider. If another incoming file still needs applying, the checkout stays pending with HEAD and files preserved. Restoring the overlap permits the next keep reset to apply both files. Before: `9 pass, 1 fail` at the unchanged-HEAD assertion. After: `10 pass, 0 fail`, including the old pending retry test. Logs: `implementation/repair-B-F2-red.log`, `implementation/repair-B-F2-green.log`.

Only the two reproduction tests were added. No existing assertion or fixture was corrected. Each reproduction commit has a final `Test-Change` trailer for `tests/self-update.test.ts` citing its real source from the review findings. Each product fix is its own separate commit.

### Verification after repairs

All printed checks were run with the configured setup lock and `akrogon guard own-modules`. No merge_checks exist or were run. Terminal results were retained for each command.

| Proof/check | Command after setup and guard | Terminal result | Evidence |
|---|---|---|---|
| Criteria 1–7 and both regressions | `bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000` | exit 0, 73 pass, 0 fail | `implementation/repair-B-criteria.log` |
| format | `bun run format` | exit 0, every file unchanged | `implementation/check-format-1791718175020-1943486.log` |
| typecheck | `bun run typecheck` | exit 0 | `implementation/check-typecheck-1791718176217-1943896.log` |
| test | `bun test --timeout=30000` | exit 1, 800 pass, 2 fail, 42 files | `implementation/check-test-1791718265235-1948552.log` |
| test_changed | `bun test --changed=c53f6196533289555518577f08907ec9c713721c --timeout=30000` | exit 1, 156 pass, 2 fail, 8 files | `implementation/check-test_changed-1791718219016-1950074.log` |

Both red checks fail the same two units:

- `tests/batch-merge.test.ts`, `a green batch checks once, pushes once, moves members before the holder and closes the issue`: the expected exact stdout ends at `issue complete issue`; actual stdout additionally contains the required `deployed <old>..<new>` line. This follows B F1's other-repo behind-only move. Correct the expectation while preserving the commit count, push/closure and check-count assertions.
- `tests/hold.test.ts`, `a hold survives a main advance confined to record folders`: the fixture pushes `issues/open/x/state.yaml` containing scalar `x`, at an invalid leaf depth. B F1's move now imports that fake record into the root checkout; the next discovery rejects it and CLI exit is 1 rather than 0. Use a valid record advance to test the intended hold behavior, preserving the hold/no-dispatch assertions and accounting for the deploy line. `advanceRemote` supplies this content at test line 662; `readState` parses state via the schema at `src/state.ts:119-129`.

These failures have a direct cause in the repair diff, so the unrelated-red retry/base-run rule does not apply. They remain blocking, not known-red. B did not change their expectations or fixtures. Working tree is clean, and all repair commits are local to the leaf branch.

### Handed to A

- **A F1**: plan correction required for the missing concurrency step: the replay input is captured before `.lock`, and the final reset can overwrite a later root commit. The skill routes a Fix needing a step the plan lacks to A. Plan D3/D4 currently specify rebase of a captured local tip and reset without a contemporaneous root-history guard. Add a boundary reproduction and repair the snapshot/move contract. An unconditional `HEAD`-ancestor-of-replayed-tip guard from the suggested direction is insufficient: rebasing legitimate diverged record commits rewrites their IDs, so old HEAD normally is not an ancestor of the replayed tip. Preserve successful criterion 1 replay while refusing an actual concurrent commit change.
- **B F1 remaining verification**: correct the two existing test expectations/fixtures named above, which the skill reserves to A, and rerun both red configured checks. Update the implementation report's obsolete L1/own-repo-only behind-move descriptions and final verification results. Keep the repaired every-registered-checkout behavior and both new regressions. Both full and changed checks are still red until this handoff is finished.

Destination requested: `check.fix`, with the concurrency repair and existing-test corrections remaining. This pass does not claim merge readiness.

## 2026-10-11 check.review after check.fix round 1

Verdict: **fix**.
Base: `c53f6196533289555518577f08907ec9c713721c`.
Prior reviewed head: `d6ea570387054dc73d8de9ee570b70773ee304c3`.
B repair handoff: `f0d00847a141abca295251dcd4b7db6b7a9948a5`.
Reviewed head: `6e3ef1da30009b76a739c5d978c8033e57afc2f8`.

Reviewed the repair range from the prior reviewed head, using the already-recorded B repair proofs and inspecting every subsequent A change in `f0d0084..6e3ef1d`. No branch refresh/rebase is reported or present, so no range-diff is required. This is a re-check of the earlier findings, with no unrelated baseline finding added.

### Earlier findings

- **B F1**: repaired. Other-repo pending retries now move without a duplicate push. The existing hold/batch tests have been corrected while retaining their intended hold, dispatch, closure and push assertions.
- **A F2 / B F2**: repaired. The mixed-reset rescue requires all changed paths to be content-equal dirty colliders. The two-file regression and the prior pending retry remain green.
- **A F1**: **still open**. Capturing the replay base inside `.lock` fixes the originally tested lock-wait window. The new `head === base` check does not protect the later reset from a commit made after that check. This is the same previously reported committed-history loss, with an incomplete repair.

### A F1 remaining failure: HEAD check and reset are separate operations

Location: `src/self-update.ts:136-145` (`moveCheckout`).

Realistic source: an operator runs `git add issues/late.md` and `git commit` in the registered root checkout while self-update is finishing its checkout move. Ordinary Git commits do not take akrogon's global `.lock`. The repair reads and validates HEAD, runs another Git subprocess for the behind count, then invokes `git reset --keep` without tying that write to the validated HEAD value.

Concrete boundary proof: `implementation/recheck-B-concurrency.log`. A real clone has eligible local records and a remote code advance. The probe runs the actual `selfUpdate` and uses a temporary Git launcher to pause only the `reset --keep` subprocess, after the repair's HEAD validation has returned. While paused, a separate process uses the real Git binary to add and commit an eligible record in the root checkout. Resuming the real reset produces:

```text
pushed 1 record commit(s) to origin/main; deployed ...
late commit ancestor of resulting HEAD: False
late worktree file exists: False
remote late file git-show exit: 128
checkout status:
```

The launcher controls process scheduling only. The source of the lost history is a genuine operator Git commit, and the destructive operation is the product's actual reset, with no handcrafted call to an internal helper. The late commit remains only in the reflog, disappears from the branch and worktree, and was not pushed. The probe exits 0, records these outcomes, removes the scratch fixture, and leaves the leaf code unchanged.

Consequence today: the command silently discards newly committed local work and reports deployment. This is A F1's original concurrency/data-loss consequence and still violates the brief's preservation of local work and design's kept-history requirement. Narrowing the timing window does not resolve a reachable history-loss defect.

Required correction: protect the branch move against changes after validation, rather than adding another separate HEAD read. Prove that a real root commit between the validated snapshot and the write is preserved or causes a pending/refused move. Retain ordinary diverged record replay, whose original HEAD is not an ancestor of its rebased tip. This repeated finding requires A's plan correction under the repair routing rule.

### Verification and citations

- Recorded A full-suite proofs both finish green: `implementation/check-test-1791718811791-2548620.log` and `implementation/check-test-1791718926299-2747316.log`, each 803 pass, 0 fail, 42 files. The added test verifies a record commit during the lock wait, but does not cover the remaining post-validation write window.
- Re-ran the previously red configured `test_changed` command on this head, after its setup lock and ownership guard: 159 pass, 0 fail, 8 files, 28.52 seconds. Both handed-off expectation failures are resolved. The runner's saved log is the latest `check-test_changed` log under `implementation/`.
- Ran the printed setup `bun install --frozen-lockfile` under `akrogon-install.lock`, exit 0. Working tree clean before and after all probes. No live remote mutation, implementation edits or commits in this re-check. The behavioral probe is a product finding, not a failed check requiring an unrelated-red comparison.
- New `Test-Change` trailers: `f39f422` cites review-A F1 for the added lock-wait reproduction; `24ca71d` cites B's handoff separately for `tests/hold.test.ts` and `tests/batch-merge.test.ts`. Accepted against the earlier findings and their recorded failures. The hold fixture now advances a log record instead of an invalid-depth scalar state, and both tests include the new deploy output. `6e3ef1d` only formats the already-cited hold assertion without changing its content. Earlier B trailers were judged in the repair entry above.
- No AREA.md, public docs, runner configuration or planned-test selection changed during A's repair. The unchanged install guide still describes keep moves, pending outcomes and preservation of edits. No new documented behavior changed beyond the concurrency refusal implementing the existing local-history promise.

No new Nits or operator actions. Request `check.repair` for the still-open A F1; the repair seat must hand this repeated concurrency/plan correction to A.

## 2026-10-11 check.repair round 2

Head: `6e3ef1da30009b76a739c5d978c8033e57afc2f8`, unchanged from the latest re-check. Working tree clean. No product changes or commits made in this pass. All other findings are resolved in the latest review entry, leaving only A F1. No operator actions are open.

### Handed to A

- **A F1**: repeated concurrency/history-loss finding. The repair still separates HEAD validation from the destructive reset, so an ordinary root Git commit in that interval is discarded. Correct the plan's missing concurrency-safe branch-move step and the implementation, then add the reproduction at that final write boundary. Evidence: `implementation/recheck-B-concurrency.log` and the latest review entry. A separate additional HEAD read does not close this window. Preserve diverged record replay and all existing repaired outcomes.

Routing authority: [check-issue skill](/home/ivan/Work/infra/akrogon/skills/check-issue/SKILL.md), check.repair: "A Fix that repeats an earlier round's problem, contradicts a plan decision, or needs a step the plan lacks is handed to A as a plan correction". This finding repeats the prior round's dropped-commit problem and needs the concurrency step the plan lacks. B therefore does not change code or plan in this pass.

Verification is reused from the unchanged reviewed head: both recorded full-suite runs have 803 pass / 0 fail, and `implementation/check-test_changed-1791719036950-2948585.log` has 159 pass / 0 fail. These tests do not cover the separately reproduced remaining write window. With no code changes and no missing check evidence, no checks were rerun. Destination requested: `check.fix`.

## 2026-10-11 check.review after check.fix round 2

Verdict: **fix**.
Base: `c53f6196533289555518577f08907ec9c713721c`.
Prior reviewed head: `6e3ef1da30009b76a739c5d978c8033e57afc2f8`.
Reviewed head: `a803e56374a5e68b84254b26ea2b803e3ad2da34`.

Reviewed only `6e3ef1d..a803e56`, the two repair commits, the report and A's new plan implementation note. No branch refresh/rebase is reported, so no range-diff applies.

### Earlier findings

- **A F1**: the branch write now uses `git update-ref <ref> <moveTo> <validated-head>`. Its expected-old-value comparison addresses the reproduced unconditional branch overwrite. The new branch-write regression reports pending and retains the late commit when the comparison fails.
- **B F1 and A F2 / B F2**: their existing regressions remain green. The other-repo retry and the two-file content-equal-overlap cases are unchanged in this repair.

### F3: The new read-tree move discards staged uncommitted edits

Location: `src/self-update.ts:146`, introduced by `a803e56`.

Realistic source: the operator edits a tracked file in a registered root checkout and runs `git add <file>` before committing it. A self-update trigger receives an unrelated remote code update. The edited file is unchanged between old HEAD and the incoming commit. This is ordinary operator work, and the brief explicitly forbids rewriting a file with uncommitted edits.

The repair uses single-tree `git read-tree -m -u <moveTo>` before the CAS. That operation reconciles the target tree against the current index without the old HEAD tree needed to distinguish the staged edit from committed content. If the worktree matches the staged blob, it can replace both that blob and the worktree file with the target's old committed contents. It succeeds, so the later staged-path check in the refusal rescue does not run, and the CAS reports deployed.

Boundary evidence: `implementation/recheck-B-staged.log`. Real bare remote and clone, a tracked `record` file, operator writes `uncommitted staged operator edit` and runs `git add record`, while the remote changes only `file`. The actual `selfUpdate` produces:

```text
BEFORE
record: 'uncommitted staged operator edit\n'
index record: uncommitted staged operator edit
status: M  record
SELF UPDATE
deployed ...
AFTER
record: 'initial operator file\n'
index record: initial operator file
status:
```

Consequence today: an unrelated incoming change causes silent loss of a real uncommitted operator edit from both worktree and index. This violates the brief's no-rewrite rule and the local-edit preservation contract that D4 and its implementation note claim to retain. It is a new defect introduced by the repair, not a reopened unrelated baseline concern. Staged edits are still uncommitted edits.

Required correction: reconcile the incoming tree while preserving operator index/worktree changes, or refuse the move before altering them. Preserve the atomic branch comparison that fixes A F1. Add a real-Git regression for an unrelated staged edit and verify both its worktree bytes and index state survive. The current tests exercise unstaged edits and the late committed record, so none catches this loss.

### Verification and citations

- Ran dependency setup under `akrogon-install.lock`, exit 0.
- Ran `bun test tests/self-update.test.ts --timeout=30000` for the changed move logic: 12 pass, 0 fail, exit 0. Evidence: `implementation/recheck-B-round2-tests.log`. This includes the branch-write concurrency proof and all earlier checkout regression cases.
- Recorded full-suite evidence at the repaired head: `implementation/check-test-1791719793827-3114144.log`, 804 pass, 0 fail, 42 files, 78.21 seconds. The report records typecheck and format as green. No whole-suite rerun was needed to establish the specific new uncovered failure.
- The staged-edit probe completed with exit 0 and recorded the actual wrong product outcome. Fixture and temporary script were removed. Working tree remained clean. No live remote writes, implementation changes or commits were made during review. This is a product defect, not an unrelated failed check needing retry/base comparison.
- `d8c5bda` has a `Test-Change: tests/self-update.test.ts` trailer citing the preceding concurrency finding for the branch-write reproduction. `a803e56` has a trailer for that path citing the ReadableStream cast in the same reproduction. The cited finding is mislabeled B F1 in the commit text, but its described branch-write source unambiguously matches A F1 as reopened by B. Accepted on substance: no existing outcome assertion is weakened or deleted. The added test covers the CAS's late-commit refusal, while F3 requires a separate staged-edit regression.
- No AREA.md, runner configuration, test selection or public docs changed in this repair. The plan note and unchanged install guide promise preservation of uncommitted edits; the new read-tree behavior contradicts that promise as demonstrated in F3.

No new Nits or operator-only actions. Request `check.repair` for F3.

## 2026-10-11 check.repair round 3

Head: `a803e56374a5e68b84254b26ea2b803e3ad2da34`, unchanged from the latest review. Working tree clean. The latest review has only F3 open. No operator-only action applies.

### Handed to A

- **F3**: correct D4's new implementation note and its checkout reconciliation step. The note explicitly selects single-tree `git read-tree -m -u <moveTo>` and claims it preserves the dirty-file refusal of `reset --keep`; the latest real-Git proof shows this prescribed operation silently deletes an unrelated staged edit. The repair must revise that planned operation to preserve existing index/worktree edits or refuse before changing them, retaining the expected-old-value branch comparison. Add a reproduction test checking both staged content and worktree bytes against the current head before the fix, then prove the corrected behavior and all prior checkout/concurrency cases. Review evidence: `implementation/recheck-B-staged.log`. Check the index-restoration path too, which also uses a single-tree read and must preserve operator work when the CAS refuses.

Routing authority: [check-issue skill](/home/ivan/Work/infra/akrogon/skills/check-issue/SKILL.md), check.repair: "A Fix that repeats an earlier round's problem, contradicts a plan decision, or needs a step the plan lacks is handed to A as a plan correction". F3 contradicts the revised D4 operation's preservation claim and requires correcting that newly prescribed command. B does not edit `plan.md` or `design.md`.

No product edits, tests or commits made in this pass. Reused unchanged-head evidence: `implementation/recheck-B-round2-tests.log` has 12 pass / 0 fail; `implementation/check-test-1791719793827-3114144.log` has 804 pass / 0 fail. Neither suite covers F3; its concrete failing product outcome remains recorded in the staged-edit probe. With no code changes or missing check evidence, no tests were rerun. Destination requested: `check.fix`.

## 2026-10-11 check.review after check.fix round 3

Verdict: **ready**.
Base: `c53f6196533289555518577f08907ec9c713721c`.
Prior reviewed head: `a803e56374a5e68b84254b26ea2b803e3ad2da34`.
Reviewed head: `778ef940b611746aacff7bf0359fc2a2618cd2b1`.

Reviewed only `a803e56..778ef94`, the two repair commits, the updated D4 implementation note and report. No branch refresh/rebase is reported or present; no range-diff applies.

### Findings confirmed

- **F3 resolved**: the forward move supplies both old HEAD and target to `read-tree -m -u`, so a staged edit on an unchanged path carries forward instead of being mistaken for replaceable committed contents. The new real-Git regression checks its worktree bytes, staged status and cached changed path after deployment. The failed-CAS path now leaves worktree bytes untouched when restoring the index. The revised plan note matches this implementation.
- **A F1 remains resolved**: the expected-old-value `update-ref` comparison is retained. Both the lock-wait commit and branch-write late-commit regressions pass.
- **B F1 and A F2 / B F2 remain resolved**: other-repo retries and the multi-file content-equal-overlap regression pass. No blocking defect introduced by this repair was found.

### Verification

- Printed dependency setup under `akrogon-install.lock`: `bun install --frozen-lockfile`, exit 0.
- Fresh criterion proof: `bun test tests/self-update.test.ts tests/install.test.ts tests/sync.test.ts tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000`, exit 0, 76 pass / 0 fail across five files. Evidence: `implementation/recheck-B-round3-criteria.log`. Covers all seven planned criteria and the added repair regressions.
- Fresh configured `test_changed` check, with setup lock, ownership guard and `AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c`: `bun test --changed="$AKROGON_BASE" --timeout=30000`, exit 0, 161 pass / 0 fail across eight files. Evidence: `implementation/check-test_changed-1791720390346-3613837.log`.
- Recorded full-suite proof on the repaired head: `implementation/check-test-1791720232970-3361599.log`, 805 pass / 0 fail across 42 files, 79.31 seconds. Report records format and typecheck green. No skipped, filtered or disabled planned test or runner change appears in the repair diff.
- Working tree clean before and after review; head unchanged. No implementation edits, commits or live remote mutations during this pass.

### Test citations and docs

`e3b8595` supplies `Test-Change: tests/self-update.test.ts review-B F3, the single-tree read-tree reconciled a staged edit back to the old committed bytes; verify staged content and index state survive an unrelated incoming change`. Accepted against the previously demonstrated operator edit + Git staging source and its recorded loss. It adds the reproduction without changing earlier assertions. `778ef94` changes only product code. Earlier trailers were judged in the previous entries.

No AREA.md or public docs changed in this repair. Checked the revised plan move note against the unchanged install-guide promise to preserve local edits and report pending outcomes. The repair restores that existing behavior contract rather than adding a new public outcome.

No open Fixes, held Nits or operator actions. Existing reusable review lesson remains uncommitted in the registered checkout. Request `merge`.

## 2026-10-11 merge attempt d02cf382-53f5-46f7-9518-d35d7c42f3e9 (solo)

Prior reviewed base: `c53f6196533289555518577f08907ec9c713721c`.
Prior reviewed head: `778ef940b611746aacff7bf0359fc2a2618cd2b1`.
Rebase target/refreshed AKROGON_BASE: `30eda51c9c437b1e0e9daee2209c13724d32885b` (`origin/main`).
Resolved head: `12823561f1fa52f6823c278ea2604d254a61631e`.

Fetched origin and rebased the solo branch. Two modify/delete conflicts occurred when replaying the hold expectation correction and its formatting commit. Kept main's deletion of `tests/hold.test.ts`: main commit `50d268a` explicitly retires the hold surface and moves its retirement/inertness tests to `tests/hold-retired.test.ts`; main also deletes the obsolete `src/hold.ts` implementation. Retained the branch's batch expectation correction and self-update formatting. No test expectation was newly corrected at merge, and no retired hold behavior was resurrected.

Before checks, recorded `git range-diff c53f6196533289555518577f08907ec9c713721c..778ef940b611746aacff7bf0359fc2a2618cd2b1 30eda51c9c437b1e0e9daee2209c13724d32885b..12823561f1fa52f6823c278ea2604d254a61631e` in `implementation/merge-range-diff.log`. Re-removal helper output: `none`. Working tree clean after rebase. No manual push performed.

### Merge checks on resolved head

Refreshed `AKROGON_BASE` from `akrogon config` after rebase. `merge_covers` and `merge_checks` are empty; ran every configured check with the printed install-lock setup and ownership guard. No check was skipped or filtered beyond the configured changed-test scope.

| Check | Command after setup and guard | Terminal result | Evidence |
|---|---|---|---|
| format | `bun run format` | exit 0, no file drift | `implementation/check-format-1791720512463-3710490.log` |
| typecheck | `bun run typecheck` | exit 0 | `implementation/check-typecheck-1791720527344-3713376.log` |
| test | `bun test --timeout=30000` | exit 0, 841 pass, 0 fail, 44 files | `implementation/check-test-1791720605184-3713627.log` |
| test_changed | `bun test --changed=30eda51c9c437b1e0e9daee2209c13724d32885b --timeout=30000` | exit 0, 169 pass, 0 fail, 8 files | `implementation/check-test_changed-1791720558834-3715331.log` |

`akrogon phase records-sync merged --slot B --check --attempt d02cf382-53f5-46f7-9518-d35d7c42f3e9` returned `ok`. Working tree clean and tested head unchanged at `12823561f1fa52f6823c278ea2604d254a61631e`. Gathered every night-flow leaf brief before landing.

### Landing result

`akrogon phase records-sync merged --slot B --attempt d02cf382-53f5-46f7-9518-d35d7c42f3e9` completed with exit 0 and printed:

```text
moved merged
issue complete night-flow
deployed 30eda51c9c43..12823561f1fa
```

Authenticated remote read-back (`git ls-remote origin refs/heads/main`) confirms `12823561f1fa52f6823c278ea2604d254a61631e` on main. The command archived the completion owner under `issues/closed/night-flow/`, including this leaf. No direct Git push was used. The original open folders also held already-merged sibling leaves; their presence alone did not indicate outstanding work. This landing completes the whole night-flow issue.
