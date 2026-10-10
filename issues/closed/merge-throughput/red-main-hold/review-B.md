# Review B: red-main-hold

Date: 2026-10-10
Phase: check.review
Base: 547063c52e068702aaa9e77117b749e9d1341275
Reviewed head: ec9fe3810ae88935046265d19b73e4d68d278cd6
Verdict: fix

Read brief.md, plan.md, design.md and implementation/report.md before the diff. Debate is disabled, so no leaf positions-B.md or rebuttal-B.md is expected. Review is independent of A's review. No code changed or committed.

## Fixes

### F1. Missing --slot bypasses stale-attempt validation

Location: src/phase.ts:773-776 and 801-806.

The red-on-base boundary requires a command but does not require a slot or attempt. Its stale-attempt guard runs only when slot is defined, and the hold branch bypasses transition's required-slot validation.

Criterion 2 explicitly requires a stale attempt to be refused without changes. Plan D3 also requires --slot and --attempt. The real CLI accepts `akrogon phase hold check.fix --attempt stale-a0 --red-on-base <current-main> --command 'bun test'` on an applied solo attempt a1: exit 0, prints the hold, clears the batch, and stores a hold whose attempt is a1. A stale invocation can therefore restore the current holder and stop all repository merges. This is a criterion failure, not merely a handcrafted-input concern.

Proof: isolated git repo, real phase CLI, applied solo batch, fake Herdr. Observed output: `held repo on db24d9b0528d5e37d666acc3d4a7e904f24c70e1: bun test`; exit 0; batch absent; held.repo.attempt = a1 despite supplied stale-a0. The existing refusal battery always includes --slot B and misses this route.

Required repair: enforce the planned slot/attempt requirements for --red-on-base before mutation, retaining unconditional stale-attempt refusal for this ending. Add refusal coverage for a missing slot with stale/missing attempt and unchanged state, hold and attempt log.

### F2. An overlapping next call deletes a newer hold

Location: src/next.ts:1025-1032, src/hold.ts:69-70.

Site 1 reads and compares a hold outside the lock, then clearHeld unconditionally deletes whichever hold exists when it acquires the lock. The in-lock site-2 check cannot protect a hold already deleted at site 1.

Real source: simultaneous manual next and Herdr hook next calls (plugin/herdr-plugin.toml routes multiple events through plugin/next.sh), followed by B's normal red-on-base phase call. Trace: next P reads hold H0 and compares it to advanced main M1. While P waits, next Q clears H0 and creates an attempt on M1. B reports base red on M1 and writes H1, clearing Q's batch. P resumes its old comparison and clearHeld deletes H1. P then starts another attempt on unchanged red M1. This violates criterion 3 and the inside-lock guard's purpose in D5.

Proof: two real `next` CLIs and a real `phase ... check.fix --slot B --attempt <Q-attempt> --red-on-base <M1> --command 'bun test'` in an isolated git repo. A git wrapper paused only P's first `diff --quiet H0 M1` to control scheduling, without changing its result. Q exited 0 and wrote a batch. B exited 0 and held M1 = 688011ffc217585ed3e5323843ced15fcdbec666. Before releasing P, held.repo.sha equalled M1 and the batch was absent. After P exited 0, held.yaml was empty and a new applied batch b6101ace-6c81-48f2-ac96-cb0e79405b58 had built_on = M1. Thus the implementation report's claim that no hold writer can run during this window is false.

Required repair: re-read and judge the current hold under the same lock as deletion, or defer clearing to the existing locked build guard. Keep comparison and deletion atomic. Add a regression reproducing the overlapping CLI sequence.

## Verification

- Report records all configured checks green at this head: full suite 629 pass, changed suite 45 pass, typecheck clean, format run with unrelated pre-existing reflow restored. Those unchanged-head results were reused.
- Concern-driven rerun: `bun test tests/hold.test.ts tests/pause-status.test.ts tests/command-reference.test.ts --timeout=30000`: 23 pass, 0 fail, 1455 assertions, 2.13s. These tests do not catch F1 or F2.
- Temporary CLI probes: 2 pass, 0 fail, 10 assertions. Their assertions confirmed the two incorrect outcomes above. Fixtures and probe source were removed after recording the evidence.
- No failed configured check or red-on-base disposition arose during this review.
- Implementation reports deliberate breaks for hold writing and the site-1 return. No missing-test finding beyond the regressions in F1/F2.

## Documentation and AREA paths

Changed behavior reviewed against README.md, docs/guide/merge.md, docs/guide/next.md, docs/guide/cheat.md and skills/merge-issue/SKILL.md. Their hold-ending descriptions match the intended behavior. docs/reference-index.md still points to src/AREA.md. One root-relative shell listing checked every path named by changed src/AREA.md: src/akrogon.ts, src/preflight.ts, src/config.ts, src/init.ts, src/phase.ts, src/shell.ts, src/readiness.ts, docs/reference-index.md, tests/helpers.ts and tests/phase.test.ts all exist. No dead-pointer Fix.

## Test-Change trailers

Reviewed 547063c52e068702aaa9e77117b749e9d1341275..HEAD against src/test-files.ts and the corresponding diffs:

- deb4065: `tests/command-reference.test.ts contract extended for --red-on-base/--command and unhold`. Supported by plan D8/U4 and brief criterion 8.
- ec9fe38: `tests/command-reference.test.ts formatting reflow of the new contract line; no expectation changed`. Diff is formatting only.
- 3612c45: `tests/pause-status.test.ts added held heading (alone and with paused), held slug line, unpause hold line and invalid held.yaml cases; no existing expectation changed`. Diff adds cases, preserving prior assertions.
- 800dda6: `tests/hold.test.ts added four cases (hold blocks next at fetched sha, hold survives a record-folder-only advance, real advance clears hold and starts an attempt, unhold then next dispatches); no existing expectation changed`. Supported by additive diff and criteria 3-5.

No uncited changed or deleted old expectation found.

## Operator actions

None.


## 2026-10-10 check.repair

Prior reviewed head: ec9fe3810ae88935046265d19b73e4d68d278cd6.
Repaired head: 3fde73f.
All recorded Fixes repaired. A's two Nits concern the same mechanisms and are resolved by these repairs. No remaining Nit, Handed to A item or operator action.

### F1 repair

- Test commit e1dda32 adds a real CLI refusal test for missing slot with missing/stale attempt, and slot A with the current attempt. It asserts nonzero exit and unchanged batch, holder head, hold, attempt log and notification calls. Existing expectations are unchanged.
- Before fix: `bun test tests/hold.test.ts -t 'requires slot B' --timeout=30000` exited 1, 0 pass / 1 fail. At tests/hold.test.ts:474, expected exit code not 0 but received 0.
- Fix commit b0b4860 requires slot B at the red-on-base argument boundary. The existing stale-attempt guard now always runs for this ending, including missing attempts.
- After fix: `bun test tests/hold.test.ts -t 'requires slot B|refused --red-on-base' --timeout=30000` exited 0, 2 pass / 0 fail, 55 assertions.

### F2 repair

- Test commit ebae227 drives two overlapping real next CLIs and a real red-on-base phase CLI. A temporary git wrapper pauses only the first comparison to reproduce the recorded interleaving. Its fixture and wrapper are cleaned on both success and failure. It asserts the newer hold survives, no fresh batch appears, and the sole attempt outcome remains held. Existing expectations are unchanged.
- Before fix: `bun test tests/hold.test.ts -t 'overlapping next' --timeout=30000` exited 1, 0 pass / 1 fail. At tests/hold.test.ts:737, the expected new hold record was undefined.
- Fix commit 3fde73f removes the site-1 deletion and its unused import. Site 1 still refuses an unchanged main immediately. Clearing a moved hold is deferred to site 2, where the current record is read, compared and deleted under the existing batch-creation lock. No second locking mechanism is added.
- After fix: `bun test tests/hold.test.ts --timeout=30000` exited 0, 12 pass / 0 fail, 163 assertions. This includes F2 and both unchanged-main/moved-main paths.

### Required checks and criterion proof

- `bun run format`: exit 0. Only unrelated pre-existing src/status.ts phaseColor reflow appeared and was restored. Changed files already matched formatting. Worktree clean after commits.
- `bun test --timeout=30000`: exit 0, 631 pass / 0 fail, 6698 assertions, 32 files, 45.98s.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 47 pass / 0 fail, 1737 assertions, 4 files. AKROGON_BASE was 547063c52e068702aaa9e77117b749e9d1341275.
- Criteria 1 and 7: batch/solo hold tests prove restore, record clearing, hold fields, exactly one held attempt and notification.
- Criterion 2: refusal battery plus F1 regression prove stale/missing-attempt and slot requirements preserve state.
- Criteria 3 and 4: unchanged/record-folder-only main, real main advance and F2 overlap tests prove blocking and locked clearing.
- Criterion 5: unhold tests cover root, subfolder, leaf worktree, absence and subsequent dispatch.
- Criterion 6: pause-status tests prove independent status markers, slug output and unpause printing.
- Criterion 8: command-reference tests pass, and previously reviewed hold skill/guide descriptions remain consistent with the repairs.
- Criterion 9: all configured checks above passed. No merge_checks ran.

Each Fix has separate test-before-fix commits. Both changed-test commits carry Test-Change trailers citing the recorded source and preserving existing assertions. No code outside the two Fixes was changed. The initial report's site-1 race limitation is superseded by F2's proof and repair above.

Result: ready for merge.


## 2026-10-10 merge

Attempt: 63cbd7a4-942f-4892-9d9a-3fd72969aad3.
Base: 547063c52e068702aaa9e77117b749e9d1341275.
Tested top: 3fde73f7197f35ea17ba2ff06c0705c535f9f75e.
Applied batch has no carried members. HEAD matches recorded top. No fetch, rebase or commit by the merge seat.

- `bun run format`: exit 0. Its sole unrelated pre-existing src/status.ts phaseColor reflow was inspected and restored. Working tree clean.
- `bun test --timeout=30000`: exit 0, 631 pass / 0 fail, 6698 assertions, 32 files, 46.93s.
- `bun run typecheck`: exit 0.
- Configured test_changed command with AKROGON_BASE above: exit 0, 47 pass / 0 fail, 1737 assertions, 4 files, 7.39s.
- merge_covers, merge_checks and advisory are empty.
- Completion-owner inventory: merge-throughput still has batch-limit-repo in implement and hold-fix-leaf, merge-bounce-rounds and red-batch-culprit in plan.synthesis. This memberless attempt cannot complete the owner, so no completion brief set or broadcast is expected.


Merge result: `akrogon phase red-main-hold merged --slot B --check --attempt 63cbd7a4-942f-4892-9d9a-3fd72969aad3` exited 0 and printed `ok`. The corresponding `merged` call exited 0 and printed `moved merged`. No issue complete or epic complete line was printed, so no broadcast-issue run was required. Read-back `git ls-remote origin refs/heads/main` returned 3fde73f7197f35ea17ba2ff06c0705c535f9f75e, leaf state is merged, and worktree is clean.
