# Review B

Phase: check.review. Verdict: fix.

Base: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`.
Reviewed head: `564a125c81dde5325668f64c6419efaf62d6b7ca`.

Read the brief, design, plan, implementation report, affected merge skill, reference index, command area and dispatch guide. Debate is disabled, so no positions or rebuttal artifacts are expected. No peer review was read. No code was changed or committed.

## F1: Ignored directories are entered before ignore classification

`src/batch.ts:22-34` recursively calls `readdirSync` on every directory except `.git` and gitlinks. Only after that traversal does `git check-ignore` classify ignored directories. The second file-list command at lines 9-11 also enumerates ignored contents. Preserving ignored directories during deletion does not satisfy the design's requirement never to enter them.

Source and criterion: the locked brief's What section explicitly says never to enter ignored paths, and criterion 2 names ignored paths such as `node_modules/` and `.temp/` as protected content. A merge holder's ignored cache or dependency tree therefore reaches this traversal through `dispatchMergeLeaf` -> `dispatchLeaf` -> `dispatchSlot` -> `removeEmptyUntrackedDirs`. This is a named outcome of the brief, not a requirement inferred from a handcrafted input.

Consequence today: every merge prompt scans ignored trees. An unreadable directory anywhere inside such a tree aborts dispatch even though Git considers the holder clean and the ignored directory should be outside cleanup. The command sends no merge prompt and leaves the ordinary empty directory present.

Verified through the real CLI with the existing `fixture`, `fakeHerdr`, `leaf`, `cli`, `readState` and `saveState` helpers in an inline `bun -e` probe. Allocated a holder via `next holder`, committed `.gitignore` containing `.env` and `.cache/`, created `.cache/` and `empty/`, ran `chmodSync(cache, 0)`, moved the fixture leaf to merge, cleared fake-Herdr prompts and ran `next --all`. No Git operation or cleanup unit was mocked. Results:

```text
git status --porcelain: empty
git check-ignore .cache: .cache
next --all exit: 1
stderr: {"repo":"repo","path":".../issues/open/issue/holder","slug":"holder","error":"EACCES: permission denied, scandir '.../issues/worktrees/holder/.cache'"}
merge prompts: []
empty/ still exists: true
```

The fixture's full failing directory was `/tmp/akrogon-1000/merge-clean-worktree-3ea9278d4217/akrogon-O9rdHC/repo/issues/worktrees/holder/.cache`. Permissions were restored in `finally` and the entire fixture removed. An initial probe omitted the `.env` ignore rule and was rejected by the existing environment-link guard before cleanup. The corrected probe above retained that rule and reached the new traversal.

Fix: classify ignored paths before descending into them, preserve their ancestors, and avoid enumerating ignored contents through `ls-files -o -i`. Keep file preservation and non-recursive deletion. Add a CLI regression proving an ignored unreadable directory does not stop the prompt and ordinary empty directories are still removed. Current tests check ignored contents remain, but do not catch entry into those directories. Plan D2 currently places ignore classification after traversal, so the implementation must honor the binding design despite that algorithm detail.

## Verification

- Reran `bun test tests/batch-dispatch.test.ts --timeout=30000` for the ignored-traversal concern: exit 0, 28 pass, 0 fail, 315 assertions. Applied and solo cleanup, dirty-file preservation and removal-error propagation remain green.
- Reused the implementation report's evidence for unchanged blocking checks: format and typecheck passed, full tests 649 pass / 0 fail, changed tests 619 pass / 0 fail. No code changed during review, so no broader rerun was warranted.
- Fail-first evidence in the implementation report records the four new removal assertions failing before implementation and passing afterward.
- Reviewed both merge-skill clauses at lines 41 and 51. Both state that empty untracked folders were removed before the prompt and ignored files remain. No AREA.md changed. The dispatch guide's holder-only merge behavior remains accurate.
- Inspected both top and solo paths, the post-allocation worktree state, the idle gate, and exception propagation. The no-worktree guard skips cleanup. The finding above is caused directly by the leaf diff, so no base-red comparison applies.

## Test-Change trailers

`d935fec7890ccc42dadae3d69131d5ad556509cd` contains:

```text
Test-Change: tests/batch-dispatch.test.ts added T1 applied-form removal case, T2 solo-form removal case, T4 failed-removal case, and a planted empty-dirty dir plus its removal assertion inside the existing dirty-holder solo test; no existing expectation changed
```

This is the only changed existing file matched by `src/test-files.ts`. The diff adds three cases and extends the existing dirty-holder test without changing an old expectation. The trailer accurately describes those additions, which need no cited contradictory source. No other commit in the reviewed range contains a Test-Change trailer.

## Disposition

One blocking Fix, F1. No Nits or operator actions. Request `check.repair` with verdict `fix`; actual movement is determined by the command's aggregation of the initial reviews.

## 2026-10-10 check.repair

Read both initial reviews at head `564a125c81dde5325668f64c6419efaf62d6b7ca`. F1 was the only Fix. Repaired head: `239fbf262d93cb86b0b16e481ee4ded4e494059a`.

F1 repaired in two commits:

- `823ea07613a4d8075c08226f7e8cddf432db5047` adds a CLI regression with unreadable ignored `.cache/` and nested `up/node_modules/`, ignored file contents, ordinary empty siblings, a clean Git status and an applied merge prompt. Its Test-Change trailer states what was added and that no existing expectation changed.
- `239fbf262d93cb86b0b16e481ee4ded4e494059a` changes cleanup to list tracked paths only for gitlink protection and classify each directory's children with `git check-ignore` before descending. Ignored directories preserve their ancestors without being entered. Physical files still preserve their parents, and removal remains deepest-first and non-recursive. Plan D2's algorithm detail is superseded by this repair to satisfy the existing binding design. No plan or design document changed.

Fail-before evidence: `bun test tests/batch-dispatch.test.ts --test-name-pattern 'unreadable ignored folders' --timeout=30000` exited 1 at the new dispatch-success assertion (`Expected: 0`, `Received: 1`), with 0 pass, 1 fail and 28 filtered out. The test was committed before implementation.

Pass-after evidence: `bun test tests/batch-dispatch.test.ts --timeout=30000` exited 0 with 29 pass, 0 fail and 325 assertions. The new regression proves ignored unreadable paths cannot block the prompt, both empty siblings disappear, the parent containing an ignored directory survives and ignored contents remain identical. Fixture permissions are restored in `finally` before cleanup.

### Done-criteria and checks

| Criterion | Repair verification |
| --- | --- |
| 1 | Applied and solo cleanup tests pass. Original fail-first evidence remains in the implementation report. |
| 2 | Applied cleanup retains tracked files, ignored contents and the environment link. The new regression additionally proves ignored paths are not entered and their ancestors survive. |
| 3 | Dirty-holder and solo tests preserve uncommitted tracked changes and untracked file bytes while deleting only empty folders. |
| 4 | The removal-error test still exits 1 with the folder path and sends no prompt. The no-worktree guard in `dispatchSlot` is unchanged. |
| 5 | `rg -n 'empty untracked' skills/merge-issue/SKILL.md` confirms both clauses at lines 41 and 51. |
| 6 | All four configured blocking checks passed, as recorded below. |

`bun run format`: exit 0. It formatted the repaired helper and rewrote pre-existing drift in `src/status.ts`; only that unrelated formatter change was restored. `bun run typecheck`: exit 0. `bun test --timeout=30000`: exit 0, 650 pass, 0 fail, 33 files, 51.90 seconds. `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 620 pass, 0 fail, 28 files, 51.08 seconds, with base `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`. No merge_checks ran.

Check logs are under the exported leaf TMPDIR `/tmp/akrogon-1000/merge-clean-worktree-3ea9278d4217`: `merge-clean-format.log`, `merge-clean-tests.log`, `merge-clean-changed.log`. Each command's completed exit status was captured separately from log inspection. `git diff --check` passed and the worktree is clean after both repair commits.

A's N1 about traversal of ignored dependency trees is resolved by the same repair. B holds no remaining reusable Nit. No learning artifact is needed for an unresolved concern. No Fix is handed to A and no operator action remains. Request merge.

## 2026-10-10 merge gate

Attempt `dbc5bb3a-fd96-4760-a3a1-3b02850325fb`, applied top `78ad86681903fd5614fbe4c142c0a6306d8225dd`, built on `5356df31d46384164b0900afcd70720f6de59b31`. The recorded attempt and top matched live state and HEAD. This batch has no carried members. The repaired helper and dispatch test file are identical to repaired head `239fbf262d93cb86b0b16e481ee4ded4e494059a`; the command rebased the leaf onto newer main while building the stack. B neither committed nor fetched nor rebased during this applied-top pass.

Ran every configured check on the recorded top with freshly configured base `5356df31d46384164b0900afcd70720f6de59b31`:

- `bun run format`: exit 0. Restored only formatter-created drift in previously clean `src/status.ts`, preserving the recorded top.
- `bun test --timeout=30000`: exit 0, 666 pass, 0 fail, 33 files, 61.30 seconds.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 635 pass, 0 fail, 28 files, 55.24 seconds.

No merge_covers, merge_checks or advisory commands are configured. Each terminal exit status was captured before inspecting log tails. Logs are `merge-gate-format.log`, `merge-gate-tests.log` and `merge-gate-changed.log` under exported leaf TMPDIR `/tmp/akrogon-1000/merge-clean-worktree-3ea9278d4217`. Worktree status and `git diff --check` are clean. F1 remains resolved, with its regression included in both test runs.

Read the completion owner's `clean-merge-gate/ISSUE.md` and the sole leaf brief before publication. Its shipped outcome is empty-folder cleanup before both merge prompt forms, preserving files and ignored paths, with cleanup errors stopping dispatch. Pending publication is performed only by the lifecycle command under this attempt.

### Publication refusal and red restack

The initial `merged --check --attempt dbc5bb3a-fd96-4760-a3a1-3b02850325fb` returned `ok`. The publication call exited 0 but did not complete the merge. It printed:

```text
rerun tested=78ad86681903fd5614fbe4c142c0a6306d8225dd pushed=75ff06c36f6b22dc9c70b4a3eca274c4fc0f3c93
```

The command restacked onto newly advanced main. Refreshed config gives base/rebase target `f3199df89b25b4f215df04f8703ef6d71880cd6a`; live tested head is `75ff06c36f6b22dc9c70b4a3eca274c4fc0f3c93`, under the same attempt. B committed nothing and performed no fetch or rebase. The cleanup helper is unchanged by this restack.

Reran the configured gate: `bun run format` exited 0, with only formatter-created changes to previously clean `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` restored. `bun run typecheck` exited 0. `bun test --timeout=30000` exited 1: 658 pass, 9 fail, 667 tests across 33 files in 54.08 seconds. Worktree status is clean. The changed-tests command was not reached after the blocking full-suite failure.

Failing tests:

```text
tests/dependents-first.test.ts:
next --all dispatches a leaf with unmerged dependents before an earlier leaf with none
  line 103: Expected exit 1, received 0

tests/peer-wait.test.ts:
done while herdr still reports working
done when the return file is written during a timed-out wait
blocked wins over a non-empty return file
passes a non-timeout herdr failure through unchanged
failure on idle with the return file missing
failure on done with a 0-byte return file
budget keeps the last status herdr returned
budget clamps each wait timeout to the remaining budget
  expected successful outcomes return exit 1
  non-timeout failure comparison instead receives:
  herdr agent list failed (exit 1)
  Unexpected fixture invocation: ["agent","list"]
  at tests/fake-herdr.ts:259
```

Complete failing output is saved beside this review as `merge-rerun-tests.log`. Other rerun logs remain under the exported leaf TMPDIR as `merge-rerun-format.log` and `merge-rerun-tests.log`. Captured each terminal exit status before inspecting output. No completion line was printed, no issue closure was confirmed and no broadcast was sent. Route these red gate failures to `check.fix` under the existing attempt, as the merge skill requires.

## 2026-10-10 check.review after check.fix

Verdict: ready. Prior reviewed/restacked head: `75ff06c36f6b22dc9c70b4a3eca274c4fc0f3c93`. Current base: `9e2dfbebcfd98e647d34bed995741410ce95c2e4`. Reviewed head: `e7d0e6d9e877a6ae46edd89aac37ae0e946aaecc`.

Read A's two check.fix report entries. The first pass established the nine failures also occurred on base `f3199df89b25b4f215df04f8703ef6d71880cd6a` and stopped. Upstream subsequently repaired the fixtures and expectation, and the leaf was restacked. A made no additional leaf edits in the resumed pass.

Compared `git range-diff f3199df89b25b4f215df04f8703ef6d71880cd6a..75ff06c36f6b22dc9c70b4a3eca274c4fc0f3c93 9e2dfbebcfd98e647d34bed995741410ce95c2e4..HEAD`. All five leaf patches are preserved. The two marked differences contain only context from the upstream `removeRetiredLessons` import in `src/batch.ts`. Cleanup behavior, its tests, shell stdin support and dispatch wiring have no additional repair changes. F1 remains resolved. No new defect was introduced by repair.

Confirmed upstream addresses the observed failures: fake-Herdr now answers `agent list` and honors `agent wait --until`; the two idle/done tests allow the existing ten-second grace wait to finish; the dependents-first test expects the documented successful waiting outcome while retaining its prompt-order assertion.

Reran the specific previously failing boundary: `bun test tests/dependents-first.test.ts tests/peer-wait.test.ts --timeout=30000` exited 0 with 13 pass, 0 fail and 53 assertions in 10.67 seconds. Reused A's unchanged-head check evidence: format and typecheck exit 0, full suite 677 pass / 0 fail across 34 files, changed suite 659 pass / 0 fail across 31 files. The 29 dispatch tests pass in both reported runs. No further full-suite rerun is justified by this re-check.

The current `<target>..HEAD` range has two Test-Change trailers:

```text
c4dea1c249fb2ffb9beef16f1b5672721779b852:
Test-Change: tests/batch-dispatch.test.ts added T1 applied-form removal case, T2 solo-form removal case, T4 failed-removal case, and a planted empty-dirty dir plus its removal assertion inside the existing dirty-holder solo test; no existing expectation changed

3dd61f164774f6ea9df3daa63336e818082f835b:
Test-Change: tests/batch-dispatch.test.ts added an F1 regression for unreadable ignored cache and dependency directories through merge dispatch; no existing expectation changed
```

Both remain accurate additions under the path rule in `src/test-files.ts`; no old expectation changed within this leaf. No additional documentation or AREA.md repair diff exists. The previously reviewed merge clauses remain in place. Worktree status is clean. No open Fix, Nit, operator action or reusable unresolved lesson remains. Request merge with verdict ready.

## 2026-10-10 merge attempt fca7a378

Attempt `fca7a378-b14b-4b79-950f-0371e0e5d69f`, recorded and tested top `7933573d3de984896925d0d580a0c778e8dea516`, refreshed base `975139ddda571ae01f5a5d4cc3b4b5ad629ab43e`. Live state and HEAD match the prompt. No carried members. B committed nothing and performed no fetch or rebase.

All configured checks passed on this top:

- `bun run format`: exit 0. Restored only formatter-created drift in previously clean `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`.
- `bun test --timeout=30000`: exit 0, 677 pass, 0 fail, 34 files, 70.16 seconds.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 646 pass, 0 fail, 29 files, 54.74 seconds, using the refreshed base above.

No merge_covers, merge_checks or advisory commands are configured. Each completed exit status was captured before inspecting logs. Logs are `merge-final-format.log`, `merge-final-tests.log` and `merge-final-changed.log` under exported leaf TMPDIR `/tmp/akrogon-1000/merge-clean-worktree-3ea9278d4217`. Worktree status and `git diff --check` are clean. Previously failing tests and the ignored-directory regression are green. The reviewed implementation report, reviews and completion-owner brief supply the context for closing clean-merge-gate and its required broadcast.
