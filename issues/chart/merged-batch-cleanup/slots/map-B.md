# Territory map: B

Independent of A's map. Binding inputs: session signposts Question, Taken and Needs. Intake was retained from the signposts consultation. No tests run, product edits, live cleanup or paid calls in this consultation.

## Evidence

- E1. `src/next.ts`, `nextCommand`: every touched-repository route runs `reconcileRepos` inside the global lock before calling `mergePass` outside it. `reconcileBatch` later clears both an already-merged holder's batch and a holder it moves through `commandMerged`. A successful releasing invocation therefore leaves cleanup behind it. `unpausePass` has the same ordering.
- E2. `src/next.ts`, `mergeTurn`: batch recovery happens before selecting the next merge holder. `mergePass` can return after that turn even when there was no merge holder at entry. No final cleanup follows. `mergeWake` calls `mergePass` directly, so a change confined to `nextCommand` does not cover every caller capable of releasing a batch.
- E3. `src/reconcile.ts`, `reconcile` and nested `mergedWorktree`: a recorded batch prevents merged worktree cleanup. The no-worktree branch also requires no batch before ending seats or closing a live tab. Once eligible, the existing path ends recorded seats, closes the shown tab, removes the worktree non-forcibly, clears its state pointer and deletes its branch with `git branch -d` (`closeTabOf`, `endFinishedSeats`, `removeMergedWorktree`). Preserve these functions rather than duplicate teardown.
- E4. `src/listen.ts`, `listenCommand`/`subscribe`/`onLine`: terminal turn, blocked, finished and lost events request `next --wake`; subscription snapshots request resume. A batch state-file write is not such an event. Failure retries do not supply a later pass after a successful invocation. This explains why the final idle leaf can remain indefinitely.
- E5. `src/next.ts`, `reconcileRepos`: each call rediscovers leaves and obtains terminal inventories as needed, then runs `reconcileHost`. `src/reconcile.ts`, `reconcileNeedsPanes` skips a batched worktree as a candidate. A cleanup placed after release must obtain fresh state and inventories, not reuse the earlier eligibility decision or a terminal snapshot from before broadcast dispatch.

## Safety: what the batch protects

- S1. **Live command ownership.** `src/next.ts`, `reconcileBatch` refuses release while `landAlive(batch.attempt)` is true. `src/land.ts`, `land`, still calls `landedWake` after `landPush` returns. `src/next.ts`, `landedWake`/`mergeWake`, can self-update, dispatch the next merge, dispatch dependents and close a non-broadcast tab. Clearing at the phase write would make cleanup eligible before those follow-ups finish. The process is launched in the leaf slice but with the registered repository as cwd (`src/land.ts`, `launchLand`), so a worktree cwd check alone does not prove that the service is finished.
- S2. **Scratch copy.** `src/batch.ts`, `buildStack` writes a separate `batch-<id>.owner` before creating its detached copy and removes both in `finally`. `src/reconcile.ts`, `reconcile`'s registered batch-copy branch, refuses a live owner and applies terminal/process vetoes before removal. That copy is not protected solely by `state.batch`, and normally it is gone before the applied holder is handed to land (`src/next.ts`, `mergeTurn`). Do not invent another scratch marker.
- S3. **Attempt and publication recovery.** `src/phase.ts`, `batchPush` writes the candidate before push, appends the successful attempt, persists `recorded: true`, then calls the merged move. `finishPush` does the same when a failed-looking push actually landed. `src/next.ts`, `reconcileBatch` records an unrecorded recovered outcome before moving or releasing and retains failed published holders for their recovery notice. Early clearing must not erase a candidate before these decisions. A normal successful merged move already has its attempt recorded, so attempt accounting alone is not a reason to retain the batch forever.
- S4. **Follow-up work and broadcast.** `src/phase.ts`, `commitMove` saves merged state before owner completion and log collection, retains the batch, and can raise `MoveCommittedError` afterward. `commandMerged` writes the owner's broadcast handoff. `src/reconcile.ts`, `broadcastInProgress`, independently preserves pending or working broadcast B, including when terminal reads fail. A merged phase is therefore not proof that all completion work is finished.
- S5. **Release is not unconditional deletion.** Cleanup after the existing guarded release retains broadcast, unavailable inventory, foreign-pane, process, owner, locked-worktree and Git-cleanliness vetoes (`src/reconcile.ts`, `reconcile`, `mergedWorktree`, `removeWorktree`, `worktreeRemovable`). `sliceKeepReason` and `reconcileHost` protect own slices, live recorded runs and live tabs. They do not directly check `landAlive` or `state.batch`, so do not claim the batch is an independent slice-service lock. Early release still changes when seats and their tab can disappear and deserves a live-land regression.

## Material forks

### F1. Can batch lifetime end at the merged move?

- a. Clear it in the merged transition. Removes the observed transient state and subsequent fetch. Risks changing the current live-land ownership boundary and committed-follow-up recovery. A broad `commitMove` change also affects seat-owned transitions and failed recovery, beyond the command path.
- b. Keep the existing release authority and order cleanup after it. Preserves `landAlive`, candidate verification and attempt bookkeeping. Requires correcting the orchestration order rather than just a state assignment.

**Recommend b on inspected evidence.** Scratch and attempt concerns are independently resolved, but no inspected contract says merged permits tearing down a still-running land service's leaf resources. If A can prove a safe terminal boundary for a, prefer removal under signpost 3a. Do not infer safety solely from `phase: merged`. Sources: S1–S5.

### F2. How should cleanup follow release?

- a. Move the existing reconciliation to a final stage after merge processing. Removes the bad order without adding a second full sweep. Risks changing pre-merge cleanup behavior and multi-repo host-report batching.
- b. Keep the initial pass and run the existing reconciliation after eligible merged-batch release. Smaller behavioral change, but repeated repository/host scans and two report writes may be introduced. Avoid a second teardown implementation.
- c. Separate batch recovery/release from merge dispatch, placing release before the existing cleanup. Can retain cleanup before new launches, but creates a new orchestration boundary and risks duplicate recovery or nested global-lock acquisition.

**Prefer testing a first, then b if pre-merge cleanup is required.** Option c needs a concrete benefit before adding a stage. None requires a timer, new durable state or listener change. Sources: E1–E5 and `src/next.ts`, `mergeTurn`'s fetch/build/launch work outside and inside separate global-lock sections.

### F3. Where does the completion guarantee belong?

- a. At the shared merge-processing boundary, covering `nextCommand`, `unpausePass` and `mergeWake`.
- b. At callers, with an explicit cleanup stage for every release-capable entry point.

**Prefer a if it preserves one appropriately scoped cleanup and existing lock boundaries.** It prevents a caller from forgetting cleanup. Its cost is potentially converting every `mergeWake` into a repo and host sweep, including calls from the still-running land service. Option b preserves caller batching but requires proving all three call paths. A fix only in `nextCommand` is incomplete. Sources: `src/next.ts`, the three callers and `mergePass`; `src/land.ts`, `handOff` and `land`.

### F4. Which regression proves the reported class cheaply?

- a. Seed a closed merged holder with a releasable batch, then assert cleanup after one `next`.
- b. Drive a whole successful `land`, finish any broadcast, then assert cleanup after one releasing `next`.

**Use a for the primary red/green test and a small recovery-route companion.** It isolates the defect with fewer checks and launches. Use the existing green-merge cases for land/broadcast safety rather than making every regression replay publication. Sources: `tests/batch-dispatch.test.ts`, `cleanup retains a merged holder worktree while publication recovery is blocked`; `tests/green-merge.test.ts`, `a green top lands with no seat`, `a land run that died after its push recovers to merged once`, and `next keeps a working broadcast seat until it finishes`.

## Practitioner questions and pitfalls

- P1. **Does cleanup run on a fresh view?** A merged move can relocate the owner from open to closed. Rediscover after merge processing. The release code already re-finds the moved leaf. Reusing the pre-move leaf list or batched `reconcileNeedsPanes` result defeats the fix. Sources: `src/next.ts`, `reconcileBatch`, `reconcileRepos`; `src/phase.ts`, `completeOwner`.
- P2. **Is the global lock held exactly once?** `reconcileBatch` acquires it itself, and merge processing performs fetch/build operations outside it. Do not put all of `mergePass` inside the earlier lock. Put final cleanup under the existing locking contract without nesting. Sources: `src/next.ts`, `nextCommand`, `reconcileBatch`, `mergeTurn`, `unpausePass`.
- P3. **Does broadcast get killed or restarted?** Recovery may create `state.broadcast` after `mergeTurn`'s initial `broadcastPass`. Pending state must survive cleanup until the next legitimate broadcast dispatch. A working broadcast must survive every pass, then clean up on its finish event without being sent twice. Sources: `src/next.ts`, `mergeTurn`, `broadcastPass`; `src/reconcile.ts`, `broadcastInProgress`; the named green-merge broadcast test.
- P4. **Are mode and pause boundaries preserved?** Explicit next and unpause differ from automatic wake/resume. Keep `isAutomatic` and pause rechecks through any final cleanup, including a pause occurring during merge work. Do not perform the host step with a falsely broad set of acting repos. Sources: `src/next.ts`, `nextCommand`, `unpausePass`, `reconcileRepos`; `src/reconcile.ts`, `reconcileHost`; `tests/pause-next.test.ts`, `unpause runs deferred merged cleanup`.
- P5. **Does the proof secretly use a second pass?** Two existing green-merge tests call next twice before checking completion. The recovery test must assert immediately after the first releasing invocation. Use terminal waiting only to settle setup, not to cause another engine event. Sources: the two green-merge recovery/broadcast tests named in F4.
- P6. **Are resources and refusal behavior both checked?** Check seats, tab-close call when a fake window is open, worktree registration/path, branch and state pointer. Keep the existing fetch-failure retention test and working-broadcast test green. Non-force deletion and conservative keeps already cover unsafe data removal. Sources: `src/reconcile.ts`, `removeWorktree`, `removeMergedWorktree`, `closeTabOf`; `tests/batch-dispatch.test.ts`, the named publication-recovery retention test.
- P7. **Is an open-owner leaf being mistaken for the reported closed-owner case?** `src/reconcile.ts`, `mergedWorktree`, returns after closing a live tab whenever the leaf remains under `issues/open`. Thus moving one cleanup pass later is not proof that every open-owner resource disappears in that pass. Preserve the existing rule, distinguish this retention in acceptance, and do not widen the chart into changing it without a separate decision. The second release-route test should start without a live tab to isolate release ordering.

## Cheapest red/green proof

T1. Extend the existing `tests/batch-dispatch.test.ts` fixture pattern used by the publication-recovery retention test. Allocate one holder and wait for its seats to finish. Create a real applied command batch, publish its candidate to the fixture remote, and move the owner to closed merged state through `commitMove`, retaining the batch. Use no broadcast for this primary ordering test. Keep the fixture land service inactive, the worktree clean and the remote readable. Run exactly one `next --all` after this setup.

Assert that the batch and worktree pointer are absent, the worktree path and Git registration are gone, `refs/heads/holder` is absent, recorded seats are removed, and an adopted tab was closed when using the existing fake-window fixture. On base, batch release succeeds but these cleanup assertions fail because reconciliation already ran. On the fix, all assertions must pass in that invocation. Preserve captured seat addresses/worktree before cleanup. Test behavior, not exact report wording or call ordering.

T2. Cover the other binding release route by seeding a merge-phase holder with a landed candidate and an incomplete owner so no broadcast is needed. Settle and end its fixture seats before the releasing invocation so no live tab creates the separate open-owner retention described in P7. One pass must move it to merged, record exactly one attempt, release the batch and remove eligible resources. Adapt the existing green-merge recovery test instead of adding a parallel fixture. A second pass may check idempotence only after the first-pass assertions.

T3. Reuse the existing guards: publication fetch failure retains the batch/worktree/branch, a live command attempt remains untouched, and working broadcast survives until completion. If F1a is selected, add a specifically merged-but-land-service-active case because the existing live-attempt test starts in merge phase. Run relevant existing batch, green-merge and pause checks plus required repository checks during implementation. No live framework cleanup is part of acceptance.

Test isolation evidence: `tests/AREA.md`, Non-obvious patterns and Key files; `tests/hc-fixture.ts`, `hcFixture`; `tests/batch-dispatch.test.ts`, `dispatchFixture`. Existing tests use temporary Git repos, a dedicated hc core, stand-in seats, a fake app and fake systemctl. This is local fixture proof, not permission to touch the operator's session.

## Operator-only needs

None. No additional key, paid call, live grant or approval is foreseen for this map's recommended proof route.
