# Slot B initial review

Verdict: fix

Base: f412697ad52dc15796dd5b4de460e8ffbe2ae144
Reviewed head: c1818141fb6a9fdd8738d39918f4bc029f336506
Scope: whole initial diff, brief C1–C8, design, plan and implementation report. Debate is no, so no positions/rebuttal artifacts were produced. Peer review was not read.

## Findings

### F1 — Fix: crash recovery skips a member already moved to its tip

Location: src/next.ts:967–976, especially the branch-head predicate at :972.
Source: the real green push path in src/phase.ts calls move(member.tip) before commitMove(merged). A process crash between those operations leaves the pushed candidate on main, the member branch at member.tip, and its phase still merge. Reconcile recognizes the landed candidate, but rejects that branch because tip differs from the original member.head. It then completes the holder and clears the only batch record. The landed member remains merge and its owner completion is missed by this recovery.

This violates brief C5 (every still-merge member completed after a landed push) and plan D3. Accept the recorded applied tip as a recoverable state as well as the original head, preserving genuine drift protection. The same ordering exists in finishPush and reconcile itself.

Proof: cloned the existing `reconcile moves every still-merge stacked member to merged exactly once` case, adding `await command(['git', 'reset', '--hard', tips.get('bb')!], readState(bb.path).worktree!);` immediately after recording the landed candidate and before next. This simulates the exact completed move before the missing phase write. Expected bb phase merged, received merge. Existing test only simulates a crash before all member moves.

### F2 — Fix: red fallback can immediately build another stack

Locations: src/phase.ts:815–823, src/next.ts:1049 and src/batch.ts:83–105.
Source: while aa+bb+cc is being verified, another reviewed leaf dd enters merge. B's normal check.fix call records only bb/cc as red, clears the batch, and wakes normal mergeTurn. pickMembers excludes bb/cc but includes dd. The command prints holder restarts alone while applying a new aa+dd stack. A changed member head during verification has the same issue. Repeated arrivals can postpone the required holder-alone proof.

This violates brief C3 and locked all-or-holder design. Restart this fallback explicitly with no members, rather than relying on red-head filtering to imply an empty member list.

Proof: cloned the existing `a red stack records member heads, clears the batch and restarts the holder alone` case and moved dd into merge immediately before its first red check.fix call, with `toMerge(dd.path, '2026-09-14T00:00:00.000Z');`. Expected rebuilt members [], received [{slug: dd, ...}]. The command itself returned zero and printed the claimed alone restart.

### F3 — Fix: operator docs and merge skill describe member branches moving before verification

Locations: docs/guide/merge.md:7, docs/guide/next.md:157, skills/merge-issue/SKILL.md:35.
Source: the merge seat reads this skill for an actual members= turn. All three passages say the live branches move to built tips before the holder is prompted. In the implemented contract only the holder branch moves then. Waiting members stay at their original heads until landing. Following the published description to inspect a member branch therefore inspects a different tree from its tested contribution, and the guide contradicts its own later post-push move description.

Brief C6 and plan D3 require the docs to describe this turn consistently. State that only the holder moves before the prompt and members move after landing. Trace: buildStack builds detached; next applies only applyTop(holder); batchPush moves member tips after successful push. No behavioral code change is requested by F3.

## Verification

- `akrogon verify` at reviewed HEAD exited 0, reusing green receipt `03df9e74-b1a5-4af8-b7e5-adf21d252f85`, tree `d088054596cb29d531fdbda3451446b30b3d7e60`. HEAD and implementation commit 7f2ee05 have this identical tree. The report's short run id 980c86c3 is not the reused receipt id.
- Existing implementation logs record 836 passing tests, clean format and clean typecheck. Planned scenarios are present in tests/batch-dispatch.test.ts and batch.test.ts and included by the full suite. No runner/config skip or filtering change was found. The green proof is after the latest test/helper change; c181814 changes only trailers.
- After the configured locked setup, ran `akrogon run-check --name test -- bun test <TMPDIR>/stacked-review-4qydn8kc/review.test.ts`. Run `3fe338a3-b495-4113-b131-b91cc7b04b5f`, exit 1: 0 pass, 2 fail. Both failures are caused by changed product paths above, so the unrelated-red retry rule does not apply. Output: implementation/check-test-1792051637012-541137.log. The probe used the existing dispatch fixture/helpers and the two insertions described above. Temporary probe files were removed after recording this evidence. No code or suite test was changed or committed.
- `git diff --check f412697...HEAD` passed. No batch_limit or culprit match in src. No cap/split/config extension found.
- Read the changed merge skill and merge/next/state/files guides plus unchanged phases guide and reference index. F3 records the documented behavior mismatch.
- Listed src/AREA.md named repository paths in one command. Every source, helper and index pointer exists. `issues/`, `issues/timings.jsonl` and `issues/verify-runs.jsonl` are absent in this sparse worktree and represent generated authoritative-checkout state, not dead source pointers. No pointer Fix.
- No retired lesson line removal is in the diff. No operator action or reusable Nit remains.

## Test-Change trailers and source judgment

Listed below from f412697..HEAD. The schema expectation change is required by C1/D1, original-member ancestry deletion is required by rebase design D2, prompt changes by C1/D9, member-tip ancestry rather than branch persistence by merged cleanup, and batch literals/state parsing by required parsed members. Wake-related assertion changes match immediate dispatch. Added red/base/head/drift cases extend the same criteria. The wildcard citation in 7f2ee05 is not an exact file citation, but c181814 supplies the individual paths. No unsupported existing expectation change found.

- `672d07a` Test-Change: tests/batch-dispatch.test.ts stacked-turn plan.md: added cases for stacked green, skipped/conflicting member, solo and stopped exclusion, red-stack restart and red-skip, drift refusal and reconcile; helpers carry the members prompt context.
- `672d07a` Test-Change: tests/batch.test.ts design.md leaf architecture: batch schema gains members, so a members key parses; memberless record still rejected keys stay rejected.
- `7f2ee05` Test-Change: tests/batch-dispatch.test.ts design.md stacked-turn rebase: drop the merge-only isAncestor assertion; the head-change proof now rides a restack on the same base; a new case proves red member heads stack again once the base moves; reconcile asserts member tips on origin/main since merged cleanup reaps the branch.
- `7f2ee05` Test-Change: tests/batch.test.ts src/batch.ts StackResult: buildStack returns a required tips map, so the ok:true assertion uses toMatchObject.
- `7f2ee05` Test-Change: tests/*.test.ts src/state.ts Batch.members: the parsed member list is required, so batch literals carry members: [] and mergeText renders the members context.
- `c181814` Test-Change: tests/batch-dispatch.test.ts design.md stacked-turn rebase: drop the merge-only isAncestor assertion; head-change proof rides a same-base restack; new case proves red member heads stack on a moved base; reconcile asserts member tips on origin/main since merged cleanup reaps the branch; mergeText/expectedPrompt render the members context.
- `c181814` Test-Change: tests/batch-merge.test.ts src/state.ts Batch.members: the parsed member list is required, so batch literals carry members: [].
- `c181814` Test-Change: tests/batch.test.ts src/batch.ts StackResult: buildStack returns a required tips map, so the ok:true assertion uses toMatchObject; schema case keeps members defaults.
- `c181814` Test-Change: tests/dependents-first.test.ts src/state.ts Batch.members: the parsed member list is required, so the batch literal carries members: [].
- `c181814` Test-Change: tests/helpers.ts src/state.ts Batch.members: the parsed member list is required, so the batch literal carries members: [].
- `c181814` Test-Change: tests/merge-attempts.test.ts src/state.ts Batch.members: the parsed member list is required, so batch fixtures carry members: [].
- `c181814` Test-Change: tests/next.test.ts src/next.ts mergeContext: merge prompts now render members=<csv> for stacked turns, so mergeText builds the same context.
- `c181814` Test-Change: tests/phase.test.ts src/state.ts Batch.members: the parsed member list is required, so batch literals carry members: [].
- `c181814` Test-Change: tests/receipt-gates.test.ts src/state.ts Batch.members: the parsed member list is required, so the batch literal carries members: [].
- `c181814` Test-Change: tests/reconcile.test.ts src/state.ts Batch.members: the parsed member list is required, so the batch literal carries members: [].
- `c181814` Test-Change: tests/state.test.ts src/state.ts Batch.members: the parsed member list is required, so canonical is parsed through stateSchema before seeding.
- `c181814` Test-Change: tests/timing.test.ts src/state.ts Batch.members: the parsed member list is required, so the batch literal carries members: [].
- `c181814` Test-Change: tests/verify.test.ts src/state.ts Batch.members: the parsed member list is required, so batch literals carry members: [].


## 2026-10-15 check.repair — slot B

Starting head: c1818141fb6a9fdd8738d39918f4bc029f336506. Repaired head: 1571720. Read both initial reviews. A's N1 is the same mechanism as F1. A's N2 describes the explicitly chosen head/base skip key and does not require a change. No operator actions, handed-to-A items or reusable Nits remain.

### Repairs and evidence

- F1: reproduction commit ad8443c, fix e521540. `akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts -t 'reconcile completes a landed member'` exited 1 before the fix (expected merged, received merge), then 0 with 1 passing test after it. Logs: implementation/check-test-1792051853839-910743.log and implementation/check-test-1792051866868-918786.log. Reconcile now accepts a member already at its recorded tip, in addition to the original head, while rejecting genuine head drift. Checked the other landing paths: batchPush and finishPush already move a member then commit its phase; neither has this rejecting branch-head predicate. Reconcile itself is the shared recovery path for interruptions in all three loops.
- F2: reproduction commit 3d05d69, fix ddfa862. `akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts -t 'a red stack restarts only its holder'` exited 1 before the fix (expected [], received cc member), then 0 with 1 passing test after it. Logs: implementation/check-test-1792051885052-948788.log and implementation/check-test-1792051908925-1080506.log. Red now replaces the old stack with a pending empty member snapshot before waking the merge turn. Rebuilding an interrupted attempt preserves its member snapshot and replaces the attempt under the lock, rather than clearing the record before fetch. This avoids both admitting new waiters and losing the holder-only intent in a crash between clearing and recreating the record. No new schema field or mode flag. Final targeted rerun `akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts -t 'a red stack restarts only its holder|an interrupted build'`: exit 0, 2 passing tests, log implementation/check-test-1792051928200-1144996.log. The other member picker is restack, which already preserves an empty member list for a memberless holder. Plan Implementation notes records the required brief C3 step.
- F3: docs commit 1571720. Before: merge.md and the merge skill said “moves the live branches to their built tips” / “moves the live branches to the built tips”; next.md said “moves the branches under the lock”. After: each says only the holder branch moves before the prompt and members retain their original heads until landing. Manual comparison against applyTop(holder) and post-push move(member.tip) confirms the wording. The later post-push paragraphs remain consistent. No wording tests added.

Each behavior Fix has its own reproduction-test commit followed by its fix commit. The only new tests are those two reproductions. Their exact-path Test-Change trailers cite review-B F1/F2 and the real crash/arrival sources. No existing expectation changed. No brief or design edit, dependency, live mutation or temporary helper was needed.

### Planned proof after repairs

`akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts tests/batch.test.ts` at 1571720 exited 0: 41 pass, 0 fail. Log: implementation/check-test-1792051952708-1205165.log. This reruns every planned C1–C5 scenario, including the original A-authored red fallback, moved-base skip, drift refusal and crash recovery proofs, plus C7 schema proofs. It also reruns both B-authored regressions. C6 checked against the docs above. No batch-size cap, split, culprit command or config setting added. `git diff --check` and the changed TypeScript formatter check passed. Full checks are run through akrogon verify below.

Full verification: `akrogon verify` on committed head 1571720c84c43d1ae47297694caf7f2296226bbf exited 0 (`verify leaf 1571720c84c43d1ae47297694caf7f2296226bbf: green`), run 64acb02b-8863-44c0-9ae8-31bc34086219. Setup, format and typecheck exited 0. Full test suite: 838 pass, 0 fail across 49 files. Format log: implementation/check-format-1792051962502-1263689.log. Typecheck log: implementation/check-typecheck-1792052059617-1263689.log. No merge_checks were run. Working tree is clean. All F1–F3 are repaired, and the planned proofs B did not author pass on the repaired head.

## 2026-10-15 merge — attempt 788a8cab-d6cd-4cf8-b7c4-339cc9024eb8

Applied top: f3557d8dc8a74459eefcc63dacb419332df1659e. Base: d29fe5b7c81f07370c66f2a33a5653b82303522a. Prior reviewed/repaired head: 1571720c84c43d1ae47297694caf7f2296226bbf. No carried members. Worktree clean. `git range-diff f412697..1571720 d29fe5b..f3557d8` shows all ten commits unchanged by the mechanical rebase.

`akrogon verify --attempt 788a8cab-d6cd-4cf8-b7c4-339cc9024eb8` exited 0: verify merge f3557d8dc8a74459eefcc63dacb419332df1659e green, run 4f74be92-06aa-4727-b91f-4a2a27816def. Setup, format and typecheck passed. Full tests: 845 pass, 0 fail across 49 files. No advisory checks configured. Format log: implementation/check-format-1792052108817-1612756.log. Typecheck log: implementation/check-typecheck-1792052206346-1612756.log.

Completion owner merge-batch has only stacked-turn; read ISSUE.md and its brief before the push. Outcome for broadcast: compatible waiting changes can land together after one verification and push; a failed combined check restarts just the holder and avoids repeating the same heads on the same base.

`merged --check` exited 0 and printed `ok`. The subsequent `merged` call exited 0 and printed `moved merged`, `issue complete merge-batch`, and `deployed d29fe5b7c81f..f3557d8dc8a7`. Confirmed f3557d8dc8a74459eefcc63dacb419332df1659e is an ancestor of origin/main. The completion owner moved to issues/closed/merge-batch.
