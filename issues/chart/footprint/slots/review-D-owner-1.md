# Slot D review, owner roots

## owner-locks

Verdict fix

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- Head `d29ba6612195a0eff7e3a45a804947e32aebd884`

1. **F1. A mixed-release pass can stop a newly admitted run in the same slice.** `src/admission.ts:51–52` drops the slice lock that the old `stopSlice` takes. An old `next` can activate the new release during self-update and then run its own reconcile code (`src/next.ts:1470–1472`, `:1527–1536`). I paused the old CLI at a stubbed `systemctl stop` after its liveness check, then ran a check targeting that same finished leaf. The old CLI's admission waited. The new CLI's check started while stop was paused, and the old sweep still issued the stop. Keep the two releases mutually exclusive during rollout, or drain old reconcile invocations before switching admissions.

All 53 tests passed across `leaf-slices`, `run-permit` and `state-home`.

## owner-workers

Verdict fix

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- Head `a5b8829a7bfe5a9b9c44d4406de7b6f5707e240e`

2. **F2. A peer leaf's primary worktree can block a phase move and be presented as safe to remove.** `src/phase.ts:424–435` classifies worktrees by basename. Both `workers` and `workers-u1` are valid leaf slugs (`src/state.ts:127`), and both can have active primary worktrees. In a two-leaf fixture, a green `workers` move from `implement` to `check.review` succeeded on base. Head refused and told the operator to remove the active peer leaf's primary worktree. Exclude worktrees already owned as primary checkouts before matching worker names.

All 69 tests passed in `phase.test.ts`.

## owner-skills

Verdict fix

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- Head `62622ad4b00f77eb6cd155c1f0c5b666cc279a1e`

3. **F3. Closing a symlinked case deletes files outside the consult root.** `skills/watch-issues/scripts/consults.ts:247–266` checks the case's textual parent and then operates on the symlink target. In a disposable state home, I linked a direct child of `consults/` to a separate archive directory. `close` returned zero, deleted the archive's evidence file and wrote `status` there. Validate the real case directory before enumerating or removing its contents.
4. **F4. Reconcile can delete an unlocked direct attempt and its uncommitted work.** `skills/chart-issues/assets/direct-route.md:7` permits any slug and removes the lock. Reconcile keeps locked trees at `src/reconcile.ts:995–997`, then treats unlocked names beginning with `verify-` or `batch-` as scratch at `:1035–1048`. I created a dirty `verify-legacy` tree by the old recipe and a dirty `verify-new` tree by the new one. With no pane or process in either tree, reconcile kept the old tree and force-removed the new tree with its edit. Keep a protection reconcile understands or explicitly exclude its scratch names when choosing a direct-attempt slug.
5. **F5. Landing an existing locked attempt gets stuck at cleanup.** `skills/chart-issues/assets/direct-route.md:19` removes the unlock step. An attempt created by the previous recipe stays locked across a skill update. In a disposable checkout, the new documented `git worktree remove` command returned 128 for that worktree. The same removal succeeded after unlocking it. Handle existing locks at cleanup and lifecycle handoff.

All seven tests passed in `consults.test.ts`, including old `resumed` records. The new sparse checkout recipe populated source files and excluded `issues/` in the Git fixture.

Every branch passed `git diff --check`. The touched test files ran with `--timeout=120000 --max-concurrency=5`. The mixed-release, peer-leaf and skill behavior probes used disposable fixtures.
