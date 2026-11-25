# Slot B review

Base `8d0df9dd2cc0274401346de5fb89ccc48174f570`. Reviewed head `7adb11a700cac79ad76560670786b84282550ccd`.

Verdict `fix`.

## Fixes

- **F1 — Allocation moves a ref reserved by an active rebase.** An operator checks out the commit-free leaf branch in a separate worktree and pauses `git rebase -i` at an edit. Git's worktree list reports that worktree as detached, so the guard in `src/next.ts:380` misses it and the bound reset at line 388 moves the branch. The later checkout fails because Git still treats the branch as in use there. The probe observed the branch move from the stale SHA to the tracking SHA despite allocation exiting 1. The same Git checkout attempted before allocation already named that worktree as the branch holder. Criterion 3 and the design's branch protection require refusal before moving the ref. The existing criterion 3 test covers a symbolic HEAD and misses the rebase case. Evidence is the interactive-rebase scenario in the allocation-boundaries log below.
- **F2 — Allocation removes the store checkout before it detects a second checkout.** An operator can use `git worktree add --force <elsewhere> <slug>` while the clean commit-free store worktree remains on the same branch. Both worktrees are registered. `src/next.ts:372` removes the store checkout before the holder check at line 380. The probe started with the store present and ended with it gone even though allocation exited 1. Criterion 3 says refusal must leave both worktrees and the ref in place. Plan D5 assumes this two-checkout state cannot occur and the planned test starts with the store absent. Evidence is the forced-second-checkout scenario in the allocation-boundaries log.
- **F3 — A dirty locked checkout gets an unusable recovery step.** An operator locks a leftover worktree and edits a tracked file. At `src/next.ts:351`–365 the dirty refusal lists the file and tells the operator to run `git worktree remove --force`. It exits before the lock check, so the message omits the required `git worktree unlock` step. Git refuses a single-force remove while the worktree is locked. Criterion 2 requires the changed files and the unlock instruction when both conditions hold. Evidence is the dirty-locked scenario in the allocation-boundaries log.
- **F4 — Recovery commands fail when a configured worktree path contains spaces.** An operator can set the documented `worktree_root` to an external directory such as `checkout store`. The lock refusal at `src/next.ts:370` interpolates that path without shell quoting. Copying the emitted unlock command verbatim exits 129 with Git usage, leaving the worktree locked. The other newly emitted remove instructions interpolate paths the same way. Criterion 2 requires a usable operator step. Evidence is the configured-store scenario in the allocation-contract log.

## Verification

- `akrogon verify` receipt `8db66d72-3f07-4693-bfb3-e59a8b6533a5` matches this head and base. Setup, format, typecheck and test passed. The test log reports 1,449 passing tests, followed by 1,085 passing changed-file reruns.
- Read the final criterion 1–6 logs with `akrogon log`, then checked the red-first and deliberate-break logs against the plan. The current green runs use the planned commands. The planned test file is unchanged from its replayed planning commit `77a151b6`, and the final receipt follows the existing-test correction. The green tests cover the planned cases. F1–F4 show gaps in the refusal cases.
- `check review-b-allocation-boundaries: 0 implementation/check-review-b-allocation-boundaries-1795593550361-2980012.log`. The probe drove `akrogon next` at the reviewed head using disposable Git repositories and the existing dispatch fixture. Exit 0 means the probe captured the expected refusal results for inspection. Each allocation itself exited 1, with the side effects and recovery text recorded above.
- `check review-b-allocation-contract: 0 implementation/check-review-b-allocation-contract-1795593627553-2987251.log`. Confirmed that `akrogon config` after a successful replacement reports `AKROGON_BASE` equal to the tracking SHA. Also captured the configured-store recovery command failing with Git exit 129.
- The criterion 6 diff removes the stale-base lesson and appends the matching `Applied` line. The first-allocation gate is reached through `dispatchLeaf` → `allocate` → `ensureWorktree`. The observed refusals do not admit a seat on the stale base. No paid or live operations.

## Test-Change trailers

- `17953b9b`, `tests/AREA.md`. The trailer cites the plan's documentation checklist. The diff adds the entry for `tests/first-allocation.test.ts` and changes no assertion. `src/test-files.ts` includes paths under `tests/`.
- `7adb11a7`, `tests/next.test.ts`. The trailer cites brief criterion 2. Committing the ignore-rule edit keeps the fixture on the own-commit adoption path so it reaches the original env safeguard. The test still asserts the same refusal and absence of a seat start. The earlier verify log `check-test-1795593129198-2016814.log` shows the old fixture failing after allocation began refusing dirty commit-free leftovers. `check-env-refusal-fix-1795593168624-2321948.log` shows both env safeguard cases passing after the setup correction.

## Documentation

Read both changed AREA pages, their reference index, the relevant command and file references, the recovery example and the direct-route growth stop. The repository-root path listing confirmed the new test pointer and both source pointers exist. The absent `tests/budget.test.ts` pointer was already on the reviewed base and has no consequence for this leaf's checks. Generated records and path templates belong to the registered checkout. The growth-stop handoff still supplies a partial commit on the slug branch.

## check.repair — 2026-11-25

Both initial reviews cover head `7adb11a700cac79ad76560670786b84282550ccd`. A recorded one Nit and no Fixes or operator actions. All four Fixes require a code change and a regression case. The existing criterion 2 and 3 tests pass on this head. The review probes document the failures and do not serve as passing acceptance tests. B made no code or test edits and ran no new checks in this pass.

### Handed to A

- **F1** — Criterion 3. Protect the branch Git reserves for the paused rebase. Add a real dispatch case where the other worktree starts an interactive rebase and pauses before allocation. Assert refusal naming that worktree and preservation of the branch SHA and rebase state. The existing test covers a worktree with a symbolic HEAD. Reproduction is in `check-review-b-allocation-boundaries-1795593550361-2980012.log`.
- **F2** — Criterion 3. Detect a second checkout before removing the store worktree. Add the `git worktree add --force` case with both paths present and assert that both worktrees and the ref survive refusal. This is a check before mutation within the existing lock and still leaves the required check before the reset. The existing test has no store path. Reproduction is in the same allocation-boundaries log.
- **F3** — Criterion 2. Include the unlock command and changed files when a checkout is dirty and locked. Add a dispatch case with a Git lock and a tracked-file edit. The existing tests exercise a clean locked checkout and an unlocked dirty checkout separately. Reproduction is in the same allocation-boundaries log.
- **F4** — Criterion 2. Quote paths in emitted Git recovery commands. Add a dispatch case with spaces in `worktree_root` and verify the emitted unlock command actually runs against the intended disposable worktree. The existing lock test only checks for the command name in a path without spaces. Reproduction is in `check-review-b-allocation-contract-1795593627553-2987251.log`.

## check.review — 2026-11-25 — repair round 1

Reviewed base `8d0df9dd2cc0274401346de5fb89ccc48174f570`, prior reviewed head `7adb11a700cac79ad76560670786b84282550ccd`, repaired head `07261665df2ba8c7010c866ff964da389dcda8f7`. Verdict `fix`.

### Prior findings

- **F1** — The paused interactive rebase case now passes. The same criterion 3 branch-reservation failure remains during an ordinary `git bisect start <bad> <good>` in another worktree. The bisect detaches HEAD while native `git worktree add` refuses the branch as already in use by that worktree. At `src/next.ts:306–319` the scan only sees symbolic checkouts and rebase state. `akrogon next` moved the ref to tracking, then failed with the original Git checkout refusal. The probe ran before any interleaving checkout and is evidence that F1's reservation protection remains partial. `check-recheck-b-worktree-reservations-1795595152001-796944.log`.
- **F2** — The forced second checkout case now refuses before removal and preserves both worktrees and the ref.
- **F3** — The dirty locked case now includes the unlock command and changed file, and preserves the edited file.
- **F4** — The spaced-store test executes the quoted unlock command successfully against the intended worktree.

### Fixes introduced by the repair

- **F5 — A symlinked home makes allocation mistake the store checkout for another worktree.** On a machine where the home path is a symlink, the default store from `worktreeStore` uses the home alias, while Git's registered worktree list records the actual path. The new pre-removal scan compares the raw strings at `src/next.ts:306–310`, includes its own store in the list of other worktrees and refuses the only checkout. A real CLI probe with a symlinked `HOME` and a clean commit-free leftover exited 1 with its own path in the checked-out-elsewhere error and left the branch stale. The same scenario on `7adb11a7` exited 0 and moved the branch to tracking. Criterion 1 requires replacement in this scenario. Use the same worktree identity for the store, the lock lookup and the reservation scan. Evidence is the symlinked-home scenario in `check-recheck-b-recovery-and-store-1795595198439-819449.log` and `check-recheck-b-store-baseline-1795595224307-824619.log`.
- **F6 — The new rebase refusal offers a command that deletes active work.** An operator pauses an interactive rebase at an edit, modifies a tracked file and runs allocation. The new refusal at `src/next.ts:384–387` offers `git worktree remove --force` as an alternative to continuing or aborting the rebase, without telling the operator to save the edit or finish the rebase first. In a disposable checkout, Git's unforced removal refused with exit 128, while the exact command printed by allocation exited 0 and deleted the checkout and its uncommitted edit. This adds a destructive operator step to criterion 3's preservation refusal. The locked design already provides the safe rebase recovery actions and calls for inspecting or saving work before force removal. Evidence is the force-remove scenario in `check-recheck-b-recovery-and-store-1795595198439-819449.log`.

### Evidence and scope

- `check recheck-b-range: 0 implementation/check-recheck-b-range-1795595198007-819448.log` confirms the initial three commits stayed identical and only `7bc852cd` and `07261665` were added. Main advanced during this pass; the repaired head and its merge base stayed as recorded above.
- Read the red-first and green logs. `check-check-repair-tests-red4-1795594792028-4014735.log` has the four new failures with all 16 originals passing. `check-check-repair-green4-1795594804676-4019278.log` has 20 passes. The repaired head contains the same test content as the red-first commit. Both repair trailers cite `tests/first-allocation.test.ts` and the original review's realistic operator actions. No prior test or assertion was removed.
- Criteria 2 and 3 ran with the planned test filters in `check-check-repair-c2-1795594829095-4025003.log` and `check-check-repair-c3-1795594829655-4026295.log`. Ran the planned criterion 1, 4 and 5 filters on the reviewed head to fill the individual-command evidence gap. `check-first-alloc-c1-1795595224276-824621.log`, `check-first-alloc-c4-1795595224265-824620.log`, and `check-first-alloc-c5-1795595223917-824622.log` passed 4, 2 and 1 cases respectively. Criterion 6 inputs stayed unchanged.
- `akrogon verify` receipt `e14b40c4-7445-476e-83c8-e6163ea9ab23` is green for the reviewed head. The full test log `check-test-1795595058575-4027741.log` reports 1,453 tests and 1,105 changed-file reruns, all passing. Setup, format and typecheck passed. No paid or covered operations.
- `src/AREA.md` and its index and worktree config references were checked. The repository-root path listing confirms `src/next.ts`, `src/reconcile.ts`, and the index exist. F1 and F5 qualify the repaired reservation behavior described there.

## check.repair — 2026-11-25 — round 2

Reviewed handoff head `07261665df2ba8c7010c866ff964da389dcda8f7`. The three open fixes each pair a code change with a case missing from the existing acceptance tests. No branch files were edited and no operator action is open.

For the repeated F1 reservation defect, the first repair covered the two rebase state directories. The source search found a single allocation reservation scan and no bisect handling or test. The native Git probe shows why replacing the worktree listing with `%(worktreepath)` or `git branch -vv` would still miss this state. Both lose the holder when bisect detaches HEAD, while `git worktree add --no-checkout` continues to refuse it. `check repair-b-native-reservation: 0 implementation/check-repair-b-native-reservation-1795595349835-855865.log`.

### Handed to A

- **F1** — Criterion 3. Repair the branch reservation check at its source. Add the existing dispatch fixture's active-bisect case with the branch behind tracking, and prove allocation names the holder, preserves the slug ref and leaves the bisect active. The existing rebase case already passes on the defective head. Red CLI evidence is in `check-recheck-b-worktree-reservations-1795595152001-796944.log`.
- **F5** — Criterion 1. Match the store and Git's registered checkout by filesystem identity for both reservation and lock lookup. Add the default-store case with a symlinked `HOME`, and prove first allocation replaces the only checkout and advances the ref to tracking. The existing clean-leftover case uses a direct path and passes on the defective head. Red and previous-head green evidence are in `check-recheck-b-recovery-and-store-1795595198439-819449.log` and `check-recheck-b-store-baseline-1795595224307-824619.log`.
- **F6** — Criterion 3. Remove the force-removal alternative from the active rebase refusal and keep the rebase recovery steps. The existing test only checks refusal and rebase presence, so it passes while the destructive command is offered. Add a regression check for the literal removal command on a paused rebase with an uncommitted edit. The disposable checkout and edit were deleted by the emitted command in `check-recheck-b-recovery-and-store-1795595198439-819449.log`.

## check.review — 2026-11-25 — repair round 2

Prior reviewed base `8d0df9dd2cc0274401346de5fb89ccc48174f570`, prior head `07261665df2ba8c7010c866ff964da389dcda8f7`. Reviewed base `2185ddfc1cc63c5ae4af3197b7ccd3619bcc322b`, head `f23eb8a254ae411b298111cde3f2e109637f1943`. Verdict `fix`.

### Prior findings

- **F1** — The active-bisect regression now refuses allocation and preserves the slug ref and store. The paused rebase regression remains green.
- **F5** — The symlinked-home regression now replaces the only clean checkout and advances both HEAD and the slug ref to tracking. F8 is a separate regression in the new lock lookup.
- **F6** — A paused rebase with an uncommitted edit now gets rebase recovery commands, with no force-removal command emitted.

### Fixes introduced by the repair

- **F7 — The rebase dropped the required lesson retirement and restored the retired DISPLAY lesson.** A rebased the leaf onto `2185ddfc`, which includes `5530b6c8` retiring `run-check drops DISPLAY`. The replay of `17953b9b` as `92265d1a` keeps `leaf worktree kept at a stale base` active despite its `Applied` history and adds the DISPLAY line back. The exact planned criterion 6 proof exits 1 because the stale-base line is still active. The DISPLAY restoration also undoes the base's retirement. Remove both active lines while preserving their history and the base's other lessons. Evidence is the lesson hunk in `check-recheck-b-round2-range-1795596146530-1831971.log`, the diff from the reviewed base and `check-first-alloc-c6-1795596191051-1852975.log`.
- **F8 — A deleted, unrelated worktree can block first allocation.** An operator deletes an unrelated linked worktree directory before Git prunes its registration. Git still reports the path as `prunable`. When that row precedes the leaf's existing store checkout, the new lock lookup at `src/next.ts:408–410` calls `realpathSync` on the missing path and aborts with ENOENT. A real `akrogon next` probe with a configured store and this Git listing exited 1, leaving the clean leftover at its stale SHA. The same scenario on the rebased pre-repair commit `832d8afc` exited 0 and advanced to tracking. Criterion 1 requires replacement. Reuse the missing-path-safe identity comparison already used by the reservation scan so the lock lookup tolerates an unrelated stale registration. Both runs are in `check-recheck-b-prunable-worktree-1795596252221-1883385.log`.

### Evidence and scope

- `check recheck-b-round2-range: 0 implementation/check-recheck-b-round2-range-1795596146530-1831971.log` identifies the changed replay `92265d1a` and new commits `ed63ae45` and `f23eb8a2`. Other replayed leaf patches match their prior versions.
- `check-check-repair2-tests-red2-1795595639585-880181.log` shows the three regression tests red. Their committed test blob is unchanged between `ed63ae45` and the reviewed head. `check-check-repair2-green3-1795595813908-911900.log` shows all 23 cases green post-rebase. Both trailers name `tests/first-allocation.test.ts` and cite the realistic operator actions from F1, F5 and F6. No previous test or assertion was removed.
- Ran all six planned criterion commands on the reviewed head. Criteria 1–5 passed under the exact filters, with 5, 7, 8, 2 and 1 cases respectively. Kept logs are `check-first-alloc-c1-1795596191629-1852986.log`, `check-first-alloc-c2-1795596191546-1852977.log`, `check-first-alloc-c3-1795596191700-1852987.log`, `check-first-alloc-c4-1795596191611-1852988.log` and `check-first-alloc-c5-1795596191202-1852985.log`. Criterion 6 fails for the leaf-caused F7.
- `akrogon verify` receipt `d0122021-c863-4ccf-94c3-44098c2dde7b` matches the reviewed head and base. Setup, format, typecheck and test passed. `check-test-1795596102583-916309.log` reports 1,464 passing tests and 1,120 passing changed-file reruns.
- Checked `src/AREA.md`, its index and the `worktree_root` references. The repository-root listing confirms the changed source pointers exist. F8 qualifies the new filesystem-identity claim. No paid or covered operations.

## check.repair — 2026-11-25 — round 3

- **F7 repaired** in `e1aafe4f0bbd89b82d99a127d837892ed3cb955f`. The rebase replay had left the stale-base lesson active and re-added the DISPLAY lesson retired on main. The repair removes those two active entries and preserves both `Applied` history records. The cumulative lesson list diff against `2185ddfc` now contains only the stale-base removal. Criterion 6 went from `check first-alloc-c6: 1 implementation/check-first-alloc-c6-1795596191051-1852975.log` on `f23eb8a2` to `check first-alloc-c6: 0 implementation/check-first-alloc-c6-1795596353520-1897474.log` on `e1aafe4f`. Criteria 1–5 inputs were unchanged by the lesson fix.

### Handed to A

- **F8** — Criterion 1. Use the same missing-path-safe worktree identity comparison in the lock lookup and reservation scan. Add a dispatch regression where Git lists a deleted unrelated checkout before the existing clean store checkout, and assert allocation succeeds and advances the slug ref and HEAD to tracking. The symlink and clean-leftover acceptance tests pass on the defective head because their Git listings contain no missing row. The comparison probe in `check-recheck-b-prunable-worktree-1795596252221-1883385.log` shows ENOENT on `f23eb8a2` and successful allocation on `832d8afc`. The code change and its missing acceptance case are paired.

## check.review — 2026-11-25 — repair round 3

Reviewed base `2185ddfc1cc63c5ae4af3197b7ccd3619bcc322b`, prior head `f23eb8a254ae411b298111cde3f2e109637f1943`, repaired head `ce0cbbd825cbed80742e58947a4aff39847145a4`. The base is unchanged. Verdict `ready`.

- **F7 closed.** The cumulative lesson list diff removes only the stale-base entry. The DISPLAY entry retired on main stays absent, and both `Applied` history records are intact. `check first-alloc-c6: 0 implementation/check-first-alloc-c6-1795596958201-2861955.log` verifies the planned criterion on the reviewed head.
- **F8 closed.** The lock lookup uses the same `canonicalPath` comparison as the reservation scan. A missing unrelated checkout no longer causes ENOENT in the lock lookup. The new case creates a prunable row before the clean store checkout and verifies allocation succeeds and both HEAD and the slug ref reach tracking. `check-check-repair3-tests-red2-1795596562679-1915929.log` shows the case fail on the old behavior at the allocation result, and `check-check-repair3-green-1795596586513-1923027.log` shows all 24 cases pass. The test blob is identical at the red-first commit `2c162643` and reviewed head. Both repair trailers cite `tests/first-allocation.test.ts` and F8's deleted-worktree scenario. No existing test was removed or weakened.
- Criterion 1 passed all six cases in `check-check-repair3-c1-1795596596065-1932225.log`. The planned criterion 2–5 reruns passed 7, 8, 2 and 1 cases in `check-first-alloc-c2-1795596958576-2861954.log`, `check-first-alloc-c3-1795596958822-2861957.log`, `check-first-alloc-c4-1795596958706-2861959.log` and `check-first-alloc-c5-1795596958308-2861961.log`.
- Verify receipt `47f52dc2-4f63-4ade-86f2-0015ec4a308d` matches the head and base. Setup, format and typecheck passed. The test log `check-test-1795596893333-1933963.log` shows 1,465 tests and 1,125 changed-file reruns, all passing.
- Reviewed the first-allocation documentation in `src/AREA.md` against the repair. The worktree identity contract still holds. No documented behavior changed. No new findings or operator actions.
