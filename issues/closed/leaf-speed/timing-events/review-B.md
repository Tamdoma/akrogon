# Review B: timing-events

Date: 2026-10-13
Base: `df8868911100bf863224f71a51e70bb489d3b5d9`
Reviewed head: `bdd450084628c4dbb8647052fea8e00085303ef4`
Verdict: **fix**

## Fixes

### F1. A picked input blocker leaves an obsolete prerequisite wait open

Location: `src/next.ts:773-778`, with the skipped return at `797-800`.

Realistic source: an operator edits the documented `blocked-by` field to remove a prerequisite, then runs `akrogon next <slug>` while a required readiness input is missing. `docs/guide/state.md` identifies `blocked-by` as an operator-editable field. `blockDetail` now returns `inputs`, not `deps`, but the picked branch throws before `end('none')`; the catch reports and returns `skipped` without recording the end.

Consequence today: the existing prerequisite wait stays open even though the prerequisite no longer blocks this leaf. The timing record attributes subsequent input-blocked time to that prerequisite until another prompt or end appears. This violates criterion 4's requirement to end a wait when its reason stops, and U5's planned end recording on skipped exits.

Verification: ran a Bun stdin probe using existing `fixture`, `fakeHerdr`, `leaf`, `cli`, `yaml`, `readState` and `saveState`, without editing code. Created an initial-plan leaf with `blocked-by: [dep]` and a required missing file `approval.txt`, called real `next waiting`, removed the prerequisite field, then called real `next waiting` again. Both fixture and generated records were removed in `finally`.

Observed:

```text
first next: exit 0, waiting: waiting on dep (plan.synthesis)
second next: exit 1, Leaf inputs are missing: waiting: file approval.txt in repo
all timing rows: visit_start(plan.synthesis, 0), wait(prerequisite, blocking=dep)
expected after second next: wait(none)
actual: no end row
```

Repair: close the obsolete wait before refusing the picked leaf for missing inputs. Preserve the existing CLI error and prerequisite waits for actual dependency refusals. Add the smallest boundary regression for this demonstrated source.

### F2. Repo pause state and timing events can be reordered by concurrent commands

Location: `src/pause.ts:63-64`; lock release in `src/state.ts:218-223`.

Realistic source: two operator CLI invocations, `akrogon pause` and `akrogon unpause`, overlap for the same registered repo. Both are supported live commands. `setPaused` serializes the state writes through the global lock, but `pauseCommand` appends its event only after `setPaused` has returned and released that lock.

Reachable schedule: pause writes paused state and releases the lock, then its process is descheduled before the append. Unpause acquires the lock, removes the pause state, releases it and appends `off`. The first process resumes and appends `on`. The final state is unpaused but the last timing event says paused. The `await child.exited` after closing lock stdin also leaves an asynchronous interval before the outer append.

Consequence today: persisted pause intervals can disagree with the serialized repo state, causing an ended pause to appear open. This breaks the intended ordered pause record and plan D9's explicit requirement to append after the state write under its lock. The U4 worker brief instead says the released lock is fine, which contradicts D9.

Verification: traced the actual CLI entry points in `src/akrogon.ts:124-132`, `pauseCommand`, `setPaused`, and `withLock`. This is a concurrency trace grounded in the two real commands, not a claim of an observed production incident. The existing pause test is sequential and cannot catch the schedule.

Repair: append the event inside the same lock as the corresponding state write. Keep one lock acquisition and preserve the public command behavior. Add a focused regression that prevents the event write from occurring after another pause-state mutation.

## Verification and scope

- Read brief, design, plan, implementation report, reference index, affected files guide, state/phases/next documentation and ponytail guidance before concluding. Debate is disabled and no positions-B/rebuttal-B artifacts exist.
- Independently ran the setup under the install lock, then `bun test tests/timing.test.ts` on reviewed head: **5 pass, 0 fail, 95 assertions**, 2.69 seconds. No code or test files changed.
- Inspected retained format, typecheck, test_changed and test logs. Results match the report: exit 0 for format/typecheck, 679 pass / 0 fail for changed tests, 848 pass / 0 fail for the full suite. These runs follow the latest behavioral/test amendment at `2946c07`; reviewed head adds only a trailer-only commit. No runner filtering or disabling was introduced. The criterion scenarios ran within the planned suite. Planning records the five tests red before implementation.
- Reviewed all changed code, docs and tests. The report's short head omits the final trailer-only commit, which has no verification consequence. No merge_checks exist.
- Listed paths named by each changed AREA.md from the worktree root in one command. All source/test/doc pointers exist. Absent paths are generated registered-root artifacts: `issues/`, `issues/base-runs.jsonl`, `issues/red-records.jsonl`, `issues/timings.jsonl`, `issues/config.yaml`, `issues/merge-attempts.jsonl`, plus generated `reconcile/`. They are not dead source pointers. The files-guide timing section matches the added event surface, including park/unpark writes; sync eligibility includes the new JSONL record.
- No lessons were removed. No operator-only actions or failing checks require comparison records. No peer review was read or contacted.

## Test-Change trailers

1. `2946c07`: `Test-Change: tests/timing.test.ts parked-dep drive now expects next's non-zero refusal (existing src/next.ts fatal-dep-label behavior) and asserts the parked wait is still recorded; prettier line collapse`. Accepted: the base implementation already refuses picked parked dependencies, and this corrects the planned expectation to that real existing CLI contract while retaining the parked-wait assertion. Current suite proof includes this change.
2. `bdd4500`: `Test-Change: tests/AREA.md doc-index bullet for tests/timing.test.ts, not a test expectation (docs update)`. Accepted: `src/test-files.ts` matches this documentation path because it is under `tests/`; the change only adds the new suite's index pointer and changes no expectation.

## Phase result

`akrogon phase timing-events check.repair --slot B --verdict fix` returned `recorded`. Slot B is complete. The command is waiting for the other initial verdict, so no phase movement is claimed.


## check.repair — 2026-10-13

Repair starts from reviewed head `bdd450084628c4dbb8647052fea8e00085303ef4`; repaired head `e00f5dd`. Read both initial reviews: A has no Fixes or operator actions, B has F1 and F2. Both are repaired. No changes to plan/design or test expectations were required.

### F1 repaired

- Reproduction commit: `cdf0f9d` adds the real CLI regression to `tests/timing.test.ts`, with a Test-Change trailer citing F1's operator edit and missing readiness input.
- Before fix: `bun test tests/timing.test.ts -t 'wait ends'` exits 1, 0 pass / 1 fail. Expected reasons `[prerequisite, none]`; actual `[prerequisite]`. The CLI still reports the missing input and exits 1.
- Fix commit: `ed590c7` closes the previous wait before the picked-input refusal. The automatic waiting path returns without a second timing read; dependency-refusal behavior is unchanged.
- After fix: same command exits 0, 1 pass / 0 fail, 4 assertions.

### F2 repaired

- Reproduction commit: `743be87` adds a real `pause` CLI regression. Its fixture wraps the actual `/usr/bin/flock` and snapshots the timing file immediately after the actual lock child exits, before allowing the parent command to finish. This proves whether the event exists at the unlock boundary without mocking pause state or timing writes. Fixture resources are removed by `f.clean()` in `finally`.
- Before fix: `bun test tests/timing.test.ts -t 'repo pause event'` exits 1, 0 pass / 1 fail. Expected one persisted pause event at unlock; actual zero.
- Fix commit: `e00f5dd` passes Repo into `setPaused` and appends the timing event after writing pause state, inside its existing lock. Caller search found only `pauseCommand`; no other call sites require changes. The command still acquires one lock.
- After fix: same command exits 0, 1 pass / 0 fail, 3 assertions.

### Final verification

All four resolved checks passed on repaired head `e00f5dd`. Format changed no files. Full suite: 850 pass / 0 fail, 8703 assertions, 82.50 seconds. Changed tests: 681 pass / 0 fail, 6418 assertions, 61.59 seconds. Both runs include all five planned criterion tests and both repair regressions. Format and typecheck exited 0. No merge_checks were run (configuration has none). Both reproduction tests are the only new tests added in this repair pass, and existing assertions remain unchanged. No Handed to A items or operator actions remain.

Final check commands ran through `akrogon run-check --name <name> -- sh -c <resolved command>`, each with the configured locked `bun install --frozen-lockfile` setup and `akrogon guard own-modules`. Base was `df8868911100bf863224f71a51e70bb489d3b5d9`. Retained logs and check bodies:

- `format`: `bun run format`. Log: `implementation/check-format-1791848137060-3257966.log`. Exit 0.
- `typecheck`: `bun run typecheck`. Log: `implementation/check-typecheck-1791848142736-3258144.log`. Exit 0.
- `test`: `bun test --timeout=30000`. Log: `implementation/check-test-1791848230431-3258416.log`. Exit 0.
- `test_changed`: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`. Log: `implementation/check-test_changed-1791848298162-3476412.log`. Exit 0.

Working tree is clean, only the two repair code paths and their reproduction tests changed, and all repair commits carry the required test citations. No reusable Nit is held by B, no lesson change is required, and no temporary repair helpers were created. `akrogon phase timing-events merge --slot B` exited 0 and returned `moved merge`.


## Merge — 2026-10-13

Attempt: `1e5b5b89-715c-4ab9-807a-11b63f85bece`.
Base/built_on: `df8868911100bf863224f71a51e70bb489d3b5d9`.
Applied top and HEAD: `e00f5dd16389292e7557bc347b4c0b2a8d1c6a8a`.
Members: none. Worktree clean. No fetch, rebase or commits in this applied-stack pass. Configuration has empty merge_covers, merge_checks and advisory lists, so all four checks are required. Readiness has no inputs, grants or retained resources.

All four checks passed on the applied top. Format and typecheck exited 0; formatting changed no files. Full suite: 850 pass / 0 fail, 8703 assertions, 81.73 seconds. Changed tests: 681 pass / 0 fail, 6418 assertions, 59.15 seconds. Every check uses the printed locked frozen install setup and own-modules guard through run-check. The check bodies are the same commands recorded under final repair verification above. No advisory failures or comparison records exist.

Completion owner inspection: `leaf-speed/ISSUE.md` lists timing-events, timing-readout and serial-plan-solo. Serial-plan-solo is merged, but timing-readout remains plan.synthesis and depends on timing-events. This attempt cannot complete leaf-speed, and no epic or other batch member can close.

Merge check logs (each exit 0):

- `format`: `implementation/check-format-1791848333933-3681469.log`.
- `typecheck`: `implementation/check-typecheck-1791848339363-3681600.log`.
- `test`: `implementation/check-test-1791848423941-3681730.log`.
- `test_changed`: `implementation/check-test_changed-1791848486199-3899725.log`.


`akrogon phase timing-events merged --slot B --check --attempt 1e5b5b89-715c-4ab9-807a-11b63f85bece` exited 0 and returned `ok`, accepting the top and test-change citations.

`akrogon phase timing-events merged --slot B --attempt 1e5b5b89-715c-4ab9-807a-11b63f85bece` exited 0 and returned:

```text
moved merged
deployed df8868911100..e00f5dd16389
```

No restack, reuse, rerun, completion-owner line or broadcast occurred. The command pushed the tested top and moved the leaf to merged. The containing leaf-speed issue remains open for timing-readout.
