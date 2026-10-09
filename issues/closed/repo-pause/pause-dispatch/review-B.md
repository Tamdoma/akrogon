# Review B: pause-dispatch

- Phase: check.review, initial blind review, 2026-10-09.
- Base: `bab3a63e4c88d08a0fdd0acb66e5fe164215fae9`.
- Reviewed head: `5b4c69ba9835cf1bac7418d1df148441dd37e9f1`.
- Verdict: **fix**.

## Findings

### F1: Automatic landed-batch dependent launches run outside the global lock

Fix. Source: an ordinary successfully pushed multi-leaf merge batch, reconciled by startup `next --resume` or the automatic phase merge wake, with a leaf blocked by a carried member. `mergeTurn -> reconcileBatch` moves the landed members under its lock, then releases that lock. `src/next.ts:895-900` checks pause outside the lock and calls `dispatchDependents -> sweep -> dispatchLeaf -> allocate/dispatchSlot` without reacquiring it. The checks in sweep and dispatchLeaf therefore do not protect the launches. The new dispatchMergeLeaf wrapper protects the holder but misses this sibling launch path. Tab closes in that same unlocked loop also race pause.

Consequence today: `akrogon pause` can acknowledge while this automatic dependent allocation is in flight, after which that pass creates the tab and panes, starts agents, and sends the dependent prompt. This defeats the model-change workflow and violates AC5 and the design's locked start/prompt rule. Existing race A exercises the holder's merge path and race B the main sweep, so neither catches this cascade.

Verified with two real CLI processes and the existing isolated repo/fake-herdr boundary:

1. Allocate holder and member with manual next. Commit a holder change, set both to merge, and create `dep` blocked by member.
2. Run manual `next --all` to build/apply the batch, push holder to origin/main, and record batch.candidate = batch.top. This reproduces the supported recovery after a push before the merged phase move.
3. Run `next --resume` with a shell barrier before fake herdr executes `tab create --label dep`. This point is after dispatchLeaf's pause read.
4. While blocked, run the real `pause` command. It exits 0 and prints `repo paused` before releasing the barrier.
5. Release the automatic process. It exits 0, leaves `paused.yaml` as `repo: true`, and creates dep's tab, A/B panes, agent session and `plan-issue dep slot=A phase=plan.synthesis ...` prompt.

Observed output: pause `{code: 0, stdout: "repo paused", stderr: ""}`. Resume `{code: 0, stdout: "moved merged\nmoved merged\nissue complete issue\n", stderr: ""}`. Dep state has tab `w1:t10`, panes A `w1:p11` and B `w1:p12`, prompted A `session-13`. Fake-herdr records the dep prompt after pause completion. Fixtures were removed in finally.

Repair the lock boundary for post-reconciliation automatic tab closes and dependent dispatch, without nesting the lock for callers already inside the main sweep. Add this landed-batch race scenario at the CLI boundary.

### F2: Working plugin events bypass invalid pause-state validation

Fix. Source: Herdr's real `pane_agent_status_changed` event with `agent_status: working`, one of the four named automatic event entry points. `src/next.ts:1289` returns before the newly added `readPaused()` at line 1290.

Consequence today: a malformed paused.yaml is silently accepted by this automatic next run, instead of returning an error naming the file. Violates AC8 and D9. Existing invalid-file coverage tests --resume and a manual target but not this early-return event.

Verified at the CLI boundary: write `[invalid]` to the fixture pause file and invoke bare next with event `{event: "pane_agent_status_changed", data: {type: "pane_agent_status_changed", pane_id: "p1", agent_status: "working"}}`. Result `{code: 0, stdout: "", stderr: ""}`. AC8 requires non-zero and the file path. The fixture was removed in finally.

Validate pause state before the working-event short circuit and add its boundary regression test.

## Verification and scope

Read brief, full plan including implementation notes, design, implementation report, readiness, reference index and affected operator guide. Debate is disabled, so no B positions/rebuttal are expected. Reviewed the whole base-to-head diff, every dispatchLeaf/dependent call path, state lock implementation and batch-recovery tests. No AREA.md changed. The operator guide and command rows accurately describe the intended contract, but F1 contradicts that contract during the real landed-batch cascade.

Reran `bun test tests/pause-next.test.ts --timeout=30000` for the concrete lock/entry-point concerns: 16 pass, 0 fail, 115 expects. The two additional boundary reproductions above establish gaps despite that green suite. Reused report evidence for the other criteria and configured checks on the same unchanged head: full suite 564 pass/0 fail, typecheck clean, format command succeeded, changed tests 29 pass/0 fail, state/status/docs proofs green. No source edits or commits during review. No live Herdr run or external grants required by design.

Report lesson claim was checked against `learnings/history/2026-10-08-pause-dispatch.md` and the reported repeated formatter drift. Recorded a separate reusable lock-boundary lesson in the registered checkout, left uncommitted for the operator.

## Test-Change trailers

`ff610ec75699aac65a425e0c5eeef6bd23402bd6`:

`Test-Change: tests/command-reference.test.ts added pause and unpause contracts, no existing expectation changed`

Judgment: valid. Plan D10 explicitly requires these two new command contracts and README rows. No old assertion or fixture expectation was changed or deleted. Other test files in this diff are new, so the existing-file trailer rule does not apply.

## Nits and operator actions

None.

## check.repair: 2026-10-09

Prior reviewed head: `5b4c69ba9835cf1bac7418d1df148441dd37e9f1`.
Repaired head: `5267cf367f1aecaf44eb8d9ac5e8fa1c5a2c6c41`.
Read both initial reviews. All three Fixes repaired. No items handed to A and no operator actions remain.

### B-F1: Landed-batch cascade lock

- Test commit `ee1322c`: added a real CLI landed-batch dependent-launch race using a fake-herdr barrier. Manual allocation/build, a real push and recorded candidate reproduce the supported interrupted-publication recovery. The automatic resume reaches dependent tab creation, then a separate real pause process must wait for the global lock. After launch completes and pause records, later automatic dispatch is suppressed.
- Fail before: `bun test tests/pause-next.test.ts -t 'landed-batch dependent' --timeout=30000`, exit 1, 0 pass/1 fail. At `expect(pausing.exitCode).toBe(null)`, expected null, received 0: pause had acknowledged during dependent allocation.
- Fix commit `abb18ed`: post-reconciliation tab closes and dependent dispatch now execute inside a global-lock section, with the automatic pause read inside that section. The earlier reconciliation lock has already released, so this introduces no nested lock. Manual dispatch still bypasses pause.
- Pass after: same command, exit 0, 1 pass/0 fail, 11 expects. Also green in both full and changed suites, including the existing landed-batch wake/dependent regression.

### B-F2: Working-event invalid state

- Test commit `843ac43`: added a malformed pause file plus the real working-status event shape at the CLI boundary.
- Fail before: `bun test tests/pause-next.test.ts -t 'automatic working event' --timeout=30000`, exit 1, 0 pass/1 fail. Expected non-zero, received 0.
- Fix commit `1b93292`: moved readPaused before the working-event short circuit.
- Pass after: same command, exit 0, 1 pass/0 fail, 3 expects. The error names the pause file and no mutating Herdr calls occur.

### A-F1: Manual paused dependent and merge coverage

- Commit `5267cf3`: two new CLI tests cover a manual target completing a merged leaf and starting its blocked dependent, and a manual target triggering the waiting merge holder's B prompt. Both assert pause remains recorded. No production behavior change was needed.
- Normal proof: `bun test tests/pause-next.test.ts -t 'manual next target' --timeout=30000`, exit 0, 3 pass/0 fail, 12 expects.
- Deliberate break 1: changed only the selection-single dependent call's automatic flag from false to true, then ran `bun test tests/pause-next.test.ts -t 'completes a leaf and dispatches' --timeout=30000`. Exit 1, expected dependent prompt true, received false. Restored src/next.ts exactly afterwards.
- Deliberate break 2: changed only selection's touched-merge automatic flag from false to true, then ran `bun test tests/pause-next.test.ts -t 'prompts the waiting merge holder' --timeout=30000`. Exit 1, expected holder prompt true, received false. Restored src/next.ts exactly afterwards.
- Both tests pass on the final source in the full and changed suites.

### Required checks and every acceptance criterion

All executed in this leaf worktree on repaired head. No merge_checks run.

- `bun run format`: exit 0. Only unrelated pre-existing phaseColor rewrap in src/status.ts changed, inspected and restored. Repair source and tests were already formatted.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 568 pass/0 fail, 6009 expects, 29 files, 29.84 seconds.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with config's base `bab3a63e4c88d08a0fdd0acb66e5fe164215fae9`: exit 0, 33 pass/0 fail, 1374 expects, 4 files, 2.65 seconds. The first invocation inherited the old pre-rebase base `3e034de` and also passed, 82 tests/6 files. Corrected to the configured base for the final proof.
- AC1: full and changed runs of pause.test.ts cover root/subfolder/worktree, repeated pause/unpause, outside-repo refusal and missing state.
- AC2: full and changed runs cover all four automatic events and mixed paused/unpaused resume.
- AC3: phase-move test passes, with committed move and silent paused wake.
- AC4: all manual forms plus the two added dependent/merge tests pass, with pause retained.
- AC5: race A, race B and the new landed-batch dependent race pass. Source trace confirms pause writes and automatic cascade launches use the same lock.
- AC6: unpause relaunch/current config, cleanup, cascade-only start and failure-with-clear tests pass.
- AC7: board/empty/charts/targeted/unpaused status tests pass.
- AC8: invalid state tests pass across pause/unpause/status/next, including the added working event.
- AC9: full suite's docs-links tests pass, and `rg -n 'akrogon pause|akrogon unpause' docs/guide/next.md docs/guide/cheat.md` confirms command references at next.md:91,99 and cheat.md:113,114. Guide prose was checked in initial review.
- `git diff --check`: exit 0. Worktree clean. Only src/next.ts and tests/pause-next.test.ts changed during repair. No temporary helpers remain.

All three commits modifying the existing test file have Test-Change trailers citing their review finding and acceptance requirement. They add tests without changing or deleting any prior assertion or fixture.

### Remaining Nit

A-N1 remains deferred: general merge-turn descriptions omit the pause qualifier, but next.md's pause section states the exception. No current wrong behavior or operator confusion established. An operator report of confusion or a required doc-coverage rule would promote this to a Fix. Recorded the reusable conditional-dispatch documentation concern under the registered checkout's learnings/history and LESSONS.md, left for the operator to commit. B's earlier cascade-lock lesson is already recorded and was not duplicated.

Repair disposition: ready for merge. No handoff and no open operator actions.

## merge: 2026-10-09

Attempt: `9fbaacbe-165a-4bc7-b68c-c0e42f6b543e`.
Applied stack top / tested HEAD: `1c371b75b3d06a912be1d5fae1e10c8c49c289ff`.
Configured base and batch built_on: `763970e0881ab83cdf9f222266145c2a468bb4a5`.
Holder reviewed repair head: `5267cf367f1aecaf44eb8d9ac5e8fa1c5a2c6c41`. No carried members.

The command applied the holder's stack onto newer main. No commits, fetch or rebase performed by this merge seat. Reused the plan, implementation report and both reviews from the completed review/repair passes. Read completion owner repo-pause/ISSUE.md and its sole pause-dispatch brief. One standalone issue can complete, no epic.

Checks on the applied top:

- `bun run format`: exit 0. Only the known unrelated phaseColor rewrap was produced, inspected and restored. Worktree clean again, HEAD unchanged.
- `bun test --timeout=30000`: exit 0, 571 pass, 0 fail, 6022 expects, 29 files, 28.35 seconds.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, using refreshed config base `763970e0881ab83cdf9f222266145c2a468bb4a5`: exit 0, 33 pass, 0 fail, 1374 expects, 4 files, 3.56 seconds.
- No configured merge_checks or advisory commands.

No open operator actions, missing input values or live proof requirements. Completion will be performed only through the phase command, with this exact attempt ID.

Merge outcome:

- `akrogon phase pause-dispatch merged --slot B --check --attempt 9fbaacbe-165a-4bc7-b68c-c0e42f6b543e`: exit 0, `ok`.
- `akrogon phase pause-dispatch merged --slot B --attempt 9fbaacbe-165a-4bc7-b68c-c0e42f6b543e`: exit 0, `moved merged` and `issue complete repo-pause`.
- Authenticated remote read-back `git ls-remote origin refs/heads/main` confirms main is `1c371b75b3d06a912be1d5fae1e10c8c49c289ff`.
- Completion owner is now under issues/closed/repo-pause. Worktree remains clean. No restack or additional check run was needed.
