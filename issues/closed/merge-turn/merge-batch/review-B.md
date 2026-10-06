# Slot B review

Date: 2026-10-06
Phase: check.review (initial, blind)
Base: 1edd0c0b02fa8094f62eb04225b2a624cfa94c01
Reviewed head: a06e0f82873e6d404c3c13e10f487d2af7788506
Verdict: fix

Read plan.md, design.md, implementation/report.md, the check-issue skill and ponytail reference before reviewing the diff. Debate is no, so positions-B.md and rebuttal-B.md are absent as expected. No peer review read. No code edits or commits.

## Verification

- `bun test tests/batch.test.ts tests/batch-dispatch.test.ts tests/batch-merge.test.ts --timeout=30000`: 30 pass, 0 fail, 404 assertions. Rerun justified by specific stack, dissolution and recovery concerns.
- `git diff --check 1edd0c0...HEAD`: exit 0. Working tree clean.
- Supplementary probes used the repository's fixture, actual CLI, fake Herdr and real Git worktrees/local bare remotes. Allocated worktrees used the configured worktree root. Fixture repositories and temporary probe scripts were deleted on completion. No real remote or Herdr mutation.
- CLI probe log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.VmvuKyMVHu` (exit 0). Covers F1-F4. The first diagnostic log `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.H9jkpjFIYF` also verifies both empty-range engine cases, but its red CLI fixture had a worktree-path mismatch. F2 relies on the corrected CLI probe with no errors instead.
- Partial-publication cleanup log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.3gnwXC1K4v` (exit 0). Covers F5.
- Existing report records full checks green. No unrelated full-suite rerun required. Passing tests do not establish the outcomes contradicted below.

## Fixes

### F1. Empty ranges discard previously stacked commits

Location: src/batch.ts:37-40 and :50; tests/batch.test.ts, test `empty member and holder ranges produce their heads without a rebase`.

Realistic source: `akrogon next` collects an eligible branchless leaf at `built_on` (src/next.ts:920-924, explicitly supported by the implementation), or a branch whose commits have already landed on main. Either creates an empty member or holder range. This can also follow operator recovery of an already-landed leaf.

An empty member sets `tip = item.head` instead of retaining the accumulated tip. An ancestor holder returns `top: holderHead` instead of the accumulated tip. Both discard earlier carried commits. CLI proof: allocated holder at main with one committed waiting member, then `next --all`, `merged --check --attempt`, and `merged --attempt`. Both merge calls exit 0, both leaves become merged and the issue closes, but `git cat-file -e main:member-file` on the bare remote exits 128: `fatal: path 'member-file' does not exist in 'main'`. Engine proof also shows a committed member followed by an empty member is not an ancestor of the resulting top.

Consequence today: leaves are marked delivered and closed while their code never lands. Violates criterion 1 and D3 stack preservation. The new test currently asserts that an empty holder produces `builtOn` despite a nonempty carried member, so it explicitly accepts the wrong outcome. Correct it against the binding requirement to land every carried member, and add a regression for an empty member after a nonempty member.

### F2. Red dissolution retains and republishes carried code through the holder

Location: src/phase.ts:635-644, src/next.ts:929-938; also review other member-dropping paths for this same holder-range problem.

Realistic source: the merge skill's actual red-check path, `akrogon phase <holder> check.fix --slot B --attempt <id>`, after an applied stack containing a member. The command resets member branches, but does not remove those member commits from the holder, whose HEAD is the entire stack. Its record stores no original holder range.

CLI proof: holder and member each commit a distinct file, `next --all` applies the batch, and `check.fix --attempt` prints `batch dissolved, merge solo` with exit 0 and no stderr. Holder history still contains both `holder-file` and `member-file`. The fresh record has no members. Its `merged --check` and `merged` calls both succeed. The bare remote contains `member-file`, while that member remains in merge.

Consequence today: dissolution does not isolate the failed batch. A later holder-only run can publish code from a member that was explicitly deferred to its own solo turn. If the same failure persists, the holder is sent to repair carrying another leaf's code. Violates criterion 3, design step 8 and the command's no-carried-member-correction contract. Preserve enough holder provenance to rebuild only its own range whenever members are removed. Verify the red path and member-departure/conflict/restack/recovery paths that reuse an already-stacked holder.

### F3. A capped holder failure does not wake the next holder in the same pass

Location: src/next.ts mergePass applied-record return and final dispatch; tests/next.test.ts around lines 4017 and 4165.

Realistic source: Herdr returns the existing retryable `agent_prompt_stalled` response on three passes. `dispatchSlot` commits the holder to failed on the third pass. mergePass returns without reconciling that holder's record or selecting the next holder.

CLI proof: allocate two merge leaves, script three stalled prompt responses, run `next --all` three times. Result: holder phase `failed`, waiting leaf merge prompt count `0`. It needs a fourth manual pass. Carried branches also remain applied until that later reconciliation.

Consequence today: a freed merge turn stalls until another event/manual next instead of progressing immediately. Violates binding turn-release Q1 and its done-criterion, and plan D2 explicitly requires the same-pass holder-fail revisit. Two old tests were changed to run an extra next call, weakening their existing automatic-wake outcome. The cited trailer only describes the new placement of failure, which does not justify contradicting the binding outcome. Restore their same-pass assertions and make mergePass reconsider after a committed dispatch failure.

### F4. A solo-marked holder still forms a batch

Location: src/next.ts:916-929.

Realistic source: a conflicting or red-batch member is marked `solo: true`, then becomes the next holder while another eligible unmarked leaf waits behind it. Member selection filters solo candidates but never checks whether the holder itself is solo.

CLI proof: two allocated committed merge leaves, first leaf solo-marked, then `next --all`. Its record carries the second leaf (`members: [bb]`) and `record.solo` is undefined. It receives an applied batch instead of a solo record.

Consequence today: a leaf explicitly excluded for isolation is tested and published together with other waiting work, potentially repeating the batch failure. Violates D1, design Q3/step 8, and docs/guide/state.md's exclusion-until-leaving-merge contract. Honor solo on the holder as well as on candidate members. Add the real sequence from red/conflict through that member's holder turn to the proof.

### F5. Cleanup removes a carried member's worktree before the holder finishes

Location: src/next.ts:681-689 (`cleanupMerged`), and nextCommand cleanup before mergePass.

Realistic source: a successful batch push followed by process interruption after a member's commitMove closes its standalone issue but before the holder moves. This is the planned interrupted-publication recovery case, with the member in the closed store and still named by the holder's in-flight record.

`closeMergedTab` correctly returns false for a recorded member. `cleanupMerged` interprets false as permission to remove its temp folder and continues to remove the closed member's worktree and branch. It does not skip recorded members.

Proof: apply a real two-leaf batch whose leaves have separate standalone owners, push its top to the bare remote, record candidate, then execute the member's real commitMove and resume with `next --all`. A fixture-local Git wrapper records the holder's state at `git worktree remove`: `phase: merge`. The holder is still in flight when the member worktree is deleted. Resume subsequently completes the holder.

Consequence today: recovery cleanup destroys a carried member's live worktree/temp state before the promised retention boundary. Violates D9 and criterion 8. Skip the entire cleanup operation for recorded batch members, and test a closed standalone member during partial publication, not only a member still under issues/open.

## Test-Change trailers

Path classification reviewed in src/test-files.ts. All trailers in origin/main..HEAD / base..HEAD were inspected:

- `7f6c051`, tests/next.test.ts: attempt/top prompt context is supported by D11. Fetch change and dependent wake reflect the command-owned pass and D9. The extra-pass change for capped failure contradicts turn-release Q1, recorded as F3.
- `f1bd1cd`, tests/batch-dispatch.test.ts: attempt arguments and carried-member prompt behavior follow D10/D11 and design steps 3-4.
- `f1bd1cd`, tests/batch-merge.test.ts: fresh memberless record and attempt after red follow D7 and post-call wake. Assertions miss holder contamination, recorded as F2.
- `f1bd1cd`, tests/next.test.ts: attempt calls and carried cc not receiving its own prompt follow batching and late-join criterion 12.
- `f1bd1cd`, tests/phase.test.ts: solo fixtures preserve the existing sequential-completion scenario, but F4 means their flags currently do not reliably isolate a holder from unmarked waiters.
- `a06e0f8`, tests/batch-dispatch.test.ts, tests/next.test.ts, tests/phase.test.ts: formatting-only trailers match the formatting commit.

No trailer omissions found. New test files do not require citations when first added. The incorrect new F1 expectation is judged against the functional contract rather than trailer presence.

## Documentation and coverage

Reviewed README command table, docs/reference-index.md, src/AREA.md, tests/AREA.md, docs/guide/{merge,next,phases,state}.md and skills/merge-issue/SKILL.md against the changed behavior. No AREA.md is changed or deleted in this diff. The documented red isolation, solo exclusion, automatic wake and worktree retention contracts are violated by F2-F5. docs/guide/next.md also says build and apply happen outside the lock, while D4 and the implementation apply under the lock. Correct that sentence alongside the repair. No unrelated dead-pointer finding.

The report's claim that all 16 criteria are proven is too strong: green fixtures miss or accept the contrary outcomes above. Criteria 1, 3 and 8 require corrected boundary assertions, and the binding same-pass wake needs its original test expectation retained. Other reported proofs were reviewed without an additional blocking finding. No deferred Nit or reusable lesson recorded.

## Operator actions

None.

## 2026-10-06 check.repair

Input: both initial reviews at a06e0f82873e6d404c3c13e10f487d2af7788506. Repair head: 4d16f8cbe44fa196c3526a7284cd8de4e83a8aa0. Plan and design unchanged. No operator-only actions.

### Repairs and evidence

References below qualify the seat because review-A and review-B use separate F numbers.

| Finding | Test commit | Fix commit | Fail-before / pass-after |
| --- | --- | --- | --- |
| B F1 empty ranges | 0a66515 | 06ea62d | `bun test tests/batch.test.ts --test-name-pattern 'empty member' --timeout=30000`: 1 fail, top was main instead of carried tip. After fix: entire batch engine file 10 pass. Both empty holder and trailing empty member retain the accumulated stack. Old assertion changed against design step 3/criterion 1, cited in trailer. |
| B F3 / A F1 same-pass wake | 397400b | aa417b0, 83a1c5d | `bun test tests/next.test.ts --test-name-pattern 'capped prompt failure\|idle hook advances' --timeout=30000`: 2 fail with waiter batch undefined, then 2 pass. Restore original same-pass outcome. Retry uses validated discover inventory, not raw allLeaves. |
| B F4 solo holder | 472eadb | 70785c3 | `bun test tests/batch-dispatch.test.ts --test-name-pattern 'red-batch member' --timeout=30000`: 1 fail, unexpected cc member, then 1 pass with no members and record.solo true. Source is actual red dissolution followed by holder failure and the solo member's next turn. |
| B F5 cleanup retention | 576e584 | e2213a9 | `bun test tests/batch-dispatch.test.ts --test-name-pattern 'cleanup retains' --timeout=30000`: 1 fail, closed member worktree absent while holder still merge; then 1 pass, worktree and branch retained. Real push and commitMove simulate interrupted publication; failed fetch keeps holder in flight. |
| A F4 unrecorded operator HEAD | 2be5101 | 24ad75e | `bun test tests/batch-merge.test.ts --test-name-pattern 'operator completion refuses' --timeout=30000`: 1 fail, operator call accepted unrecorded commit; then the divergence test plus existing no-slot operator test both pass. Applied non-solo HEAD must match recorded top, including operator calls. Solo HEAD remains the permitted dynamic case. |
| A F5 repeated notice | 2ebb8c9 | 975a7e4 | `bun test tests/batch-dispatch.test.ts --test-name-pattern 'one recovery notice' --timeout=30000`: 1 fail, 2 notifications over 2 passes; then 1 pass, 1 notification. Optional batch.notified records successful delivery; unsuccessful delivery remains retryable on a later pass. |
| A F3 departed member restack | 7406d7c | a911d67 | `bun test tests/batch-merge.test.ts --test-name-pattern 'member failing during restack' --timeout=30000`: 1 fail, restack wrongly succeeded after real commitMove to failed; then 1 pass. Locked apply checks member phases, restores staying members, clears record and refuses. Failed member keeps its pre-restack tip and remote does not advance. A fixture-local Git wrapper triggers the real member move at rebase, without mocking the batch implementation. |
| A F6 criterion 15 proof | c25b52e | test-only | `bun test tests/batch-dispatch.test.ts --test-name-pattern 'solo leaf leaving' --timeout=30000`: original mechanism passes. Deliberately retaining solo in commitMove makes this test fail with `Received: true` at the post-failure solo-cleared assertion. Restore original mechanism: 1 pass. Test also verifies the returning member appears in the next holder's batch. No production change required. |

The first full-suite run caught 13 unreadable/foreign-leaf failures introduced by the initial queue-retry implementation. Root cause was calling raw allLeaves where dispatch uses discover's validated inventory. 83a1c5d restores that boundary. Targeted existing tests for unreadable/foreign/invalid/mismatched/unknown leaves and capped exits: 17 pass, 0 fail. No base comparison needed because the repair caused these failures.

Doc correction dcc31fe: docs/guide/next.md changed `builds and applies the stacked branches outside the global lock` to `builds the stacked branches outside the global lock, applies them under the lock`, matching D4 and the locked apply. Formatting-only commit 4d16f8c carries a separate trailer for every changed old test file.

### Checks and criterion proof limits

- `bun run format`: exit 0. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/check-repair-format.log`. Formatter changes committed.
- `bun run typecheck`: exit 0 on final code.
- `bun test --timeout=30000`: final run 478 pass, 0 fail, 5199 assertions. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/check-repair-full-final.log`. Initial repair-caused failures retained in `check-repair-full.log`.
- Planned batch proof command with timeout: 36 pass, 0 fail, 443 assertions. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/check-repair-batch-final.log`.
- Changed-tests check: first run 329 pass, 1 timeout in the expanded empty-range test at 30000 ms. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/check-repair-changed.log`. Same command rerun alone to investigate the known timing concern. Final result appended below.
- `git diff --check`: exit 0. Worktree clean at final repair head. Fixture repositories, Git wrappers and event scripts live inside fixture homes and are removed in finally. No merge_checks run.

All planned criterion scenarios were checked against the batch proof and full-suite results. Existing proof covers green/order/completion (1, 10), conflict (2), member departure/stale attempts (4, 6), reconciliation/post-push recovery (5, 7, 14), wake/retention (8), interrupted build/late join/fetch failure (11-13), and refused push (16). New proof explicitly covers solo re-entry (15), same-pass capped wake and the closed-store cleanup boundary. These green fixtures do not establish dirty-worktree safety or removal of member commits from an already-applied holder: A F2 and B F2 remain open and gate the corresponding isolation/recovery outcomes, including criterion 3.

V1: criterion 9's claimed package/setup test is absent. `rg -n 'package|file:|setup|serial' tests/batch-merge.test.ts tests/batch-dispatch.test.ts` finds only the branch helper's file parameter, no package fixture or setup check. The initial report's criterion 9 claim was incorrect. Config tests cover worktree lockfile/version behavior, but no test carries a package through a batch and proves the restored member's solo install uses its own lockfile. This is a missing planned proof unit, handed to A below, not marked verified.

A's Nits remain deferred: branchless restack input has no realistic current source proven, check.fix --check tested_top mutation remains as reviewed, the prior timeout is tracked with the new changed-run evidence, and the duplicate queue computation is cosmetic. None establishes a reusable lesson with a verified mechanism, so no learning files were written.

## Handed to A

- B F2: removing member code from the applied holder needs saved holder provenance and a revised record/plan contract used consistently across dissolution, conflict, restack and interrupted recovery. Plan/design changes belong to A; no partial schema or restoration fix made here.
- A F2: dirty-worktree preservation requires coordinated apply/drop/solo policy and restore behavior across initial apply, restack, dissolution, interrupted builds and recovery, including dirty indexes and mid-rebase state. This is too large to repair safely within this pass; an isolated dirty check would leave sibling data-loss paths or restore failures unresolved.
- V1 / criterion 9: implement the missing planned carried-package/setup and restored-member-solo lockfile proof. Missing planned units belong to A. Do not retain the report's unsupported verified claim.

Final changed-tests result: `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 --timeout=30000` rerun alone: 330 pass, 0 fail, 2992 assertions, 13.14 seconds. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/check-repair-changed-final.log`. The preceding timeout remains recorded without an unproven cause. Final format/typecheck/full/changed/batch checks are green. The three Handed to A items keep this leaf out of merge.

## 2026-10-06 check.review after check.fix round 1

Prior reviewed/repair head: 4d16f8cbe44fa196c3526a7284cd8de4e83a8aa0.
Reviewed head: a213ccd0006faf7f48c530d945d8cb2b2433821a.
Review scope: only c8d6b6a and a213ccd, the updated implementation notes/report, and the three handed findings. No code changes or commits.
Verdict: fix.

### Earlier finding disposition

- B F2 holder contamination: saved holder provenance and restores fix the tested clean dissolve, member-departure and restack-conflict cases. The new unconditional restore introduces F6 below for legitimate solo-seat commits.
- A F2 dirty-worktree safety: static dirty-before-apply and dirty-before-dissolve cases now preserve files. The finding remains open because both production apply callers ignore the new last-moment dirty result. F7 below proves actual edit deletion through the supported merge/cleanup flow.
- V1 criterion 9: resolved. The new carried-package test runs the real composed setup/check on the batch top and after restoring the member, then verifies the restored holder's base lockfile excludes the extra dependency. It passes in the 42-test run. A temporary copy of that test with setup replaced by true fails at the on-top version assertion (expected 1.0.0 / 2.0.0, received 0.1.2 / 0.2.1), proving the check catches omitted setup. The temporary copy was deleted. No production files were modified for this deliberate break.

### Verification

- `bun test tests/batch.test.ts tests/batch-dispatch.test.ts tests/batch-merge.test.ts --timeout=30000`: 42 pass, 0 fail, 509 assertions. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/recheck-batch.log`.
- Deliberate package-proof break: 1 fail, exit 1. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.jBKMyqZ1tE`.
- F6 real CLI probe: exit 0. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.kYadtAjvCJ`.
- F7 real CLI/concurrent-edit probe: exit 0. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/tmp.bA1Xu31TAR`.
- Probes use allocated fixture worktrees at the configured root, fake Herdr, real Git and local bare remotes. The F7 Git wrapper schedules an actual worktree file write between the preflight and move-level status reads, then delegates every command to real Git. It does not mock the batch unit. Fixture homes, wrappers and temporary scripts were deleted in finally/completion. No real remote or Herdr mutations.
- `git diff --check 4d16f8c...HEAD`: exit 0. Worktree clean. Report records full suite 484 pass, changed suite 336 pass, format/typecheck green. Targeted rerun justified by the code changes and specific solo/dirt concerns; no broader rerun necessary for this verdict.

### F6. Reconciliation discards committed solo-seat repairs on a red check

Location: src/next.ts:873, the newly added unconditional restoreHolder in reconcileBatch; related restoreHolder calls in solo restack need the same provenance distinction.

Realistic source: skills/merge-issue/SKILL.md's `attempt solo` path explicitly tells B to commit scoped outstanding changes and resolve/rebase its own branch, then route red checks through `phase <holder> check.fix --slot B --attempt <id>`. A solo record saves holder.head before those authorized commits. The memberless red call moves the leaf to check.fix, and its mergeWake reconciles the retained record. With no landed candidate, the new restoreHolder resets the clean worktree to the older holder.head.

CLI proof: allocate a holder, commit its original file, enter merge with solo true, and dispatch its solo record. Commit `solo-fix` as the merge seat. HEAD is then `ffae528f8b52003782b0dc4ab114d8afaa461c85`, while saved holder.head is `f1e9a05a5bb3bc03c21ab3e00814f3f9405dc0c0`. `phase holder check.fix --slot B --attempt <id>` exits 0, prints `moved check.fix`, and has no stderr. Afterwards HEAD equals the older saved head and solo-fix is absent from the worktree.

Consequence today: the supported red-solo handoff silently removes completed repair/conflict-resolution work before A can inspect and fix the failing version. This is a data-loss regression introduced by the repair, violating criterion 3's red-solo repair path and the skill's scoped-commit contract. Restore a saved holder range only when removing an applied carried stack. Preserve the current standalone solo branch through check.fix, failed recovery and solo restack, including authorized rebase/fix commits. Add a CLI regression that commits during the solo pass, routes red and asserts the committed head/file survive.

### F7. Late dirty results are ignored, so merge cleanup deletes the preserved edit

Location: src/next.ts:1039-1050 and src/phase.ts:557-563 ignore applyStack's new `{ dirty }` return; src/batch.ts:65-91 produces it.

Realistic source: a waiting member keeps its live panes and worktree. Its seat or the operator writes a file after worktreeDirty's preflight but before the move-level status read. Filesystem writers are not serialized by the Akrogon state lock. The new move correctly detects that late dirt and returns dirty-ref after preserving files, but the caller records the batch applied with that member still included and not solo-marked. The member's direct commitMove on publication bypasses its worktree cleanliness, and ordinary completed cleanup force-removes its worktree.

CLI proof: two allocated committed merge leaves. A fixture-local Git wrapper writes `operator edit` to the member's uncommitted file at the second member `git -C <worktree> status --porcelain` call, after the preflight. Dispatch exits 0; the late-edit marker and worktree file exist. Member solo is undefined and the holder record still includes member. Holder `merged --check --attempt` prints ok, `merged --attempt` moves both leaves and closes the issue, and `next --all` exits 0. The member is merged but its operator edit no longer exists because cleanup removed the worktree.

Consequence today: A F2's data-loss source remains reachable despite the new dirty guard. The repair introduced a result intended to prevent this state but both apply callers ignore it. Violates the existing uncommitted-work invariant and criterion 11. Handle the authoritative move result before recording an applied batch: retain/isolate dirty leaves and rebuild or enter the solo path as appropriate. Ensure a dirty member cannot be completed and force-cleaned as carried work. Test the late-write boundary as well as dirt present before preflight, and review both initial apply and refused-push restack.

### Trailers, docs and nonblocking concerns

All Test-Change trailers in 4d16f8c..HEAD were inspected. c8d6b6a adds holder-range and dirty-worktree regressions citing B F2/A F2. a213ccd updates batch record literals and schema tests for required holder provenance and adds criterion 9's package fixture. No old assertion was weakened or removed without a source. No AREA.md changed or was deleted.

Reviewed the unchanged merge skill and docs/guide/{merge,state}.md for the repaired behavior. The solo-commit instructions are the real source for F6. The state guide still omits holder provenance from its field inventory, but commands own those fields and the guide tells operators not to hand-edit them. This omission has no demonstrated current broken operator action, so it is a Nit: add the field description alongside the next relevant docs change; promote only if a supported documented action relies on constructing or interpreting that incomplete shape. No reusable mechanism lesson established.

The new worktreeDirty helper is duplicated in next.ts and phase.ts, but duplication alone has no concrete present consequence and opens no Fix. Existing full checks and static-dirt tests are green, but they do not catch F6/F7. No operator-only actions. The latest repair findings are F6 and F7; these replace the earlier Handed to A list for the next repair pass.

## 2026-10-06 check.repair round 2

Input: latest re-check at a213ccd0006faf7f48c530d945d8cb2b2433821a. Only its F6 and F7 are open; the prior Handed to A items were superseded by that re-check.
Final repair head: 43729a61d82935f52739ac727bd7bfcfd100e945.
Result: both findings repaired. No Handed to A items or operator actions remain. Plan/design unchanged.

### F6 repaired: preserve the live standalone holder

- Test commit e243a78 adds actual solo-seat commits followed by check.fix, failed, and a refused-push restack conflict. `bun test tests/batch-dispatch.test.ts tests/batch-merge.test.ts --test-name-pattern 'solo-seat commits|solo restack conflict' --timeout=30000` fails all 3 before the fix: each HEAD is reset to the older saved head.
- Fix commit 0f5fa24 makes restoreHolder take the batch record and restore only a non-solo stack. Every restore caller shares this distinction. Solo restack uses its captured current holderHead for dirty-holder reference writes and updated provenance, retaining scoped solo commits instead of substituting the older saved head.
- Pass-after command adds the existing clean dissolution and member-conflict restack regressions to those 3 cases: 5 pass, 0 fail. Carried members are still removed from the holder when required.
- Test commit ecb8112 also proves a memberless non-solo holder keeps the integration head that failed its check. Before: 1 fail, red reconciliation resets that head to the pre-integration head. Fix 33b3f66 limits unlanded reconciliation's holder restore to records carrying members. After: this case plus both solo handoffs, 3 pass, 0 fail. A standalone red handoff now keeps the failing version for repair.

### F7 repaired: consume the authoritative apply result

- Test commit dfc7f80 adds a fixture-local Git wrapper that writes a real worktree file between the caller preflight and move-level status read. Four CLI cases cover holder/member edits during initial apply and refused-push restack. `bun test tests/batch-dispatch.test.ts tests/batch-merge.test.ts --test-name-pattern 'late .* dirt' --timeout=30000`: 4 fail before the fix because the dirty leaves remain recorded members of an applied stack.
- Fix 5c46a2f consumes applyStack's dirty result in both production callers before saving an applied record. A partial apply is undone to saved member heads and the captured standalone holder head. Dirt discovered during that restoration is included too. Dirty members are solo-marked and excluded before rebuilding; a dirty holder gets a memberless solo record. Restack clears obsolete top/tested_top/candidate fields when it must rebuild or return to solo.
- The initial-member case goes through actual holder publication and the next cleanup pass, proving the edit stays in its unmerged solo member's worktree instead of being force-cleaned.
- Additional test f1c4efa writes a tracked edit after move's own status read, immediately before Git reset. Before: 1 fail, content is replaced with `initial`. The same F7 fix replaces destructive reset --hard with Git's reset --keep and reads remaining dirt afterwards, returning it to the existing isolation path. Git can preserve the edit or refuse an overlapping reset without destroying it. After: the tracked edit is retained and the member is isolated.
- Combined targeted command covering all late-edit cases, the solo cases and existing apply/restore behavior: 9 pass, 0 fail, 68 assertions.

### Verification harness and final checks

The first full run had 490 pass and 3 engine-test timeouts (build order, member conflict, apply/restore). Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/repair2-full.log`. Running the engine file alone gave 10 pass in 110 ms. Inspection confirms batch.test.ts and batch-merge.test.ts mutate the process-global AKROGON_LEAF_TEMP_ROOT in concurrent fixtures and restore it in afterEach. That violates tests/AREA.md's existing rule to use test.serial for shared global state. Commit 43729a6 serializes those files' tests without changing any assertion. The precise cause of the earlier subprocess timeouts is not claimed; the shared fixture state is now isolated and the same full command passes. No default-branch failure claim or base run was needed for this repaired leaf's verification concern.

- `bun run format`: exit 0. Final log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/repair2-format-final.log`. Formatter-only changes committed in 3389f9a; serial-call formatting follows the configured formatter.
- `bun run typecheck`: exit 0 on final code/tests.
- `bun test --timeout=30000`: 493 pass, 0 fail, 5331 assertions, 21.32 seconds. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/repair2-full-final.log`.
- `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 --timeout=30000`: 474 pass, 0 fail, 4108 assertions, 19.25 seconds. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/repair2-changed.log`.
- Planned batch proof (with --timeout=30000): 51 pass, 0 fail, 575 assertions. Log: `/tmp/akrogon-1000/merge-batch-0a209e19a6f8/repair2-batch.log`. Final full/changed commands include all of these cases after the remaining harness changes.
- Plan's criterion proofs run with the full suite: green ordering/completion and attempt/departure guards; member conflict, red dissolution and red standalone repair; holder exits/reconciliation; dependent wake and retention; package installation on the top and restored member; interrupted build, late join, failed fetch, solo re-entry, notice and refused-push restack. F6/F7 add the previously missing committed-solo and late-edit preservation boundaries.
- `git diff --check`: exit 0. Worktree clean. Fixture homes contain the injected-edit markers/Git wrappers and are removed in finally. No iteration helpers outside those fixture homes remain. No merge_checks run.

All own repair commits that touch existing test files carry exact-path Test-Change trailers. New cases do not alter existing expectations. The shared-state scheduling change cites the real configured concurrent harness, observed check failures and tests/AREA.md's existing rule. No deferred Nit establishes a reusable lesson with verified mechanism, so no learning files were written. The state-guide field-inventory Nit remains nonblocking as previously recorded.

## 2026-10-06 merge

Reviewed and integrated head: 43729a61d82935f52739ac727bd7bfcfd100e945. `git fetch origin` succeeded. Rebase onto origin/main at 1edd0c0b02fa8094f62eb04225b2a624cfa94c01 reported the branch already up to date, with no conflicts or changed commits. Refreshed `akrogon config` retains that AKROGON_BASE. Installed merge protocol is the existing seat-owned push protocol, and this live leaf has no batch attempt record or attempt prompt.

All configured checks passed on the unchanged integration:
- `bun run format`: exit 0, no changes. Log: /tmp/akrogon-1000/merge-batch-0a209e19a6f8/merge-format.log.
- `bun test --timeout=30000`: 493 pass, 0 fail, 5331 assertions, 21.77 seconds. Log: /tmp/akrogon-1000/merge-batch-0a209e19a6f8/merge-test.log.
- `bun run typecheck`: exit 0. Log: /tmp/akrogon-1000/merge-batch-0a209e19a6f8/merge-typecheck.log.
- `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`: 474 pass, 0 fail, 4108 assertions, 19.61 seconds. Log: /tmp/akrogon-1000/merge-batch-0a209e19a6f8/merge-changed.log.

No merge_checks or advisory commands are configured. `git diff --check` passed and worktree is clean. `akrogon phase merge-batch merged --slot B --check` returned `ok` both before checks and after all green checks. No reusable held Nit establishes a verified mechanism lesson. All five leaf briefs under completion owner merge-turn and its ISSUE.md were gathered before the completion call.

Publication: `git push origin HEAD:main` exited 0, fast-forwarding 1edd0c0 to 43729a6 at https://github.com/Tamdoma/akrogon.git. A fresh fetch succeeded, origin/main equals 43729a61d82935f52739ac727bd7bfcfd100e945, and the intended head's ancestor check exited 0. Push is confirmed before lifecycle completion.
