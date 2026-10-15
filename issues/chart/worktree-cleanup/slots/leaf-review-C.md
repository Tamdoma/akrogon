# Leaf draft review, slot C

Drafts under ~/.claude/jobs/6a0d8d81/tmp/drafts/worktree-cleanup, main f3557d8, host facts 2026-10-15 evening. Read-only.

## finished-leaf-processes

F1. Criterion 1 kills a check an operator runs on a tabless leaf. Every `run-check` unit runs in the leaf slice (`src/run-check.ts:176`, `runSlice(leafSlice(repo, slug))` returns the leaf slice itself unless `AKROGON_RUN_SLICE` is set, `src/scope.ts:25-31`), and `akrogon verify` or `akrogon phase <slug> merged --check` needs only a cwd, no pane or tab (`src/akrogon.ts:188-194`). The after-merge fork records that case as gap (a): the merge run from outside seat B with the holder tab already closed. A `tab_closed` or targeted pass from another tab's hook then sees "merged or failed, tab gone" and stops the slice mid-verify. Correction: add to criterion 1 and the design "and no `akrogon-run-*` unit with a live admission record names that slice" (records carry `slice`, `scope` and `state: live|ended`, `src/admission.ts:22-36`); criterion 2 gains "or whose slice holds a live run".

F2. "This also stops the empty slices of finished leaves that stay loaded today (51 on this host)" cannot be met by mapping slices through `leafSlice` over known slugs. Host fact: 50 `akrogon-l*.slice` units are loaded; hashing `<repo.name>/<slug>` (`src/scope.ts:13-15`) for every leaf record in open and closed of all 11 registered repos (316 records) matches 6 of them. The other 44 have no leaf record anywhere, so neither option in "Open for the plan" reaches them. Correction: either the slice step stops every loaded `akrogon-l*.slice` whose cgroup has no process and no live run record (the prefix is akrogon's own), or the sentence is dropped and the 44 stay for the operator.

F3. Order inside a pass is nobody's. store-sweep deletes a finished leaf's temp only when "its slice has no running unit"; this leaf stops that slice. Both edit the same `reconcile` in `src/reconcile.ts` with `blocked-by: []` on both sides. If the temp check runs before the slice stop, every F4-shaped leftover waits one more pass, and with no ordering the two implementers guess. Correction: this leaf's design states "the slice step runs before the leaf temp and unowned checks of the same pass", and store-sweep's state.yaml lists `blocked-by: [finished-leaf-processes]`.

## store-sweep

S1. Criterion 4 contradicts the design's first Q2 bullet. The bullet keeps "a dead-owner `run-*` dir is removed on every pass, as today (src/reconcile.ts:424-427)", and today that removal does not look at the pane list (the run loop at `src/reconcile.ts:410-426` never reads `live`); criterion 4 says "a pass with the pane list unavailable deletes nothing", and the fifth bullet says "Pane list unavailable → keep" for every deletion. Correction: pick one and write it in both places. Given 2a (ownership proves, the process check only blocks), the dead-owner run dir is removed without a pane list and criterion 4 says "deletes nothing except a `run-*` dir whose owner is dead".

S2. `<repo>/issues/.lock` "when the repo root is not the global home" guards nothing and misleads. The live global lock is `<globalHome>/.lock` (`src/next.ts:943`, `:1201`, `resolve(globalHome(), '.lock')`), not `issues/.lock`; akrogon has no `issues/.lock` (host fact) and no writer in src. Correction: drop the qualifier; the live-lock sentence already names the global `.lock`.

S3. Line cites: "today's finished rule (src/reconcile.ts:432-441)" is at `:430-439`; the dead-owner removal is at `:423-426`. "As today's finished rule" also overstates: today's rule has tab and pane checks only, no slice check (`:431-436`).

S4. `statusCommand` is owned twice with no order: kept-status owns the plain branch and store-sweep adds the host-report lines to the same branch (`src/status.ts:338`, where today only the slug branch prints `Kept:` at `:352`). Correction: store-sweep `blocked-by: [kept-status]`, and its status lines reuse kept-status's label and placement.

## scratch-copy-removal

R1. Wrong path: `skills/implement-issue/references/worker-protocol.md` does not exist; the file is `skills/implement-issue/worker-protocol.md` (host fact).

R2. Wrong name: `removeMergedWorktree`'s "`git branch -d` step" is in `mergedWorktree` / the merged path at `src/reconcile.ts:235-259` and the branch drop at `:219`. Worker copies reach `removeWorktree` (`:395`) and never that path, so the open question answers itself: no branch step for workers.

R3. "Today's guard" for a failed owner's worker is not named. It is `worktreeRemovable` (`src/reconcile.ts:43-60`: uncommitted changes, rebase or merge markers, unreachable commits) applied by `removeWorktree`. Criterion 5's failed case holds only because of the unreachable-commit and untracked-file lines; say so, or the test asserts a kept reason the implementer has to guess.

R4. A `verify-*` copy with no record is unruled. The design removes a copy "whose record has `end` or whose owner is dead" and drops the reachability and dirty checks for these copies; a copy with no record (today: generic path with the guards, `src/reconcile.ts:373-379` then `:395`) is neither. The record is appended before the copy is made (`src/verify.ts:124-146`), so a recordless copy is a stray. Correction: state "no record: removed like a dead owner".

## stacked-member-close

M1. Wrong surface. The lost close did not live in `mergeTurn`, `commitMove` or `dispatchDependents`: `closableMembers` was called from `reconcileBatch` and its tabs closed at the end of the same locked block after `dispatchDependents` (`git show 6640ab5~1:src/next.ts:1014`, `:1019`, `:1057-1059`). Today that function is `reconcileBatch` at `src/next.ts:918-990`, run by `mergePass` inside `mergeWake` after `akrogon phase` returns, under the global lock (`:943`). Correction: own `reconcileBatch`; the open question "inside `akrogon phase` or in `mergeWake`" is answered by the reference: in `mergeWake`.

## kept-status

none.

## test-isolation

none. (`tests/next.test.ts:383` is a real leak: `f.env` is not a `Fixture` field (`tests/helpers.ts:44-70`), so that spawn has no `AKROGON_LEAF_TEMP_ROOT` and writes the real `/var/tmp/akr-1000`.)

## ISSUE.md

none beyond F3 and S4: no leaf lists a `blocked-by`, while four leaves edit `reconcile` in `src/reconcile.ts` and two edit `statusCommand`.
