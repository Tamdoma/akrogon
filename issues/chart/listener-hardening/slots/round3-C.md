# Round 3, slot C: do the two commits match the round 2 design

Read: `git -C <k3 worktree> log -p origin/main..HEAD` (938dfead, 33482859), `src/reconcile.ts:395-409`, `issues/closed/herdr-app/hc-engine/engine-on-hc/design.md:110`, `plan.md:55`.

Commit 938dfead (R1): matches. One token removed (`src/next.ts:509`), delivery still accepts `idle` and `done` (`:452`), the stand-in's `done` mode reproduces Claude's turn end, the new test waits for `turn >= 1` and `done` before the second pass. Note for the record, not a defect: `plan.md:55` step 6 does say "status not `done`", so the plan, not only the code, carried the old-herdr reading; the commit message blames the code alone.

Commit 33482859 (Part 2): matches the three-flag design. Parent is the leaf's live A or null in one expression (`src/seat.ts:222-226`), `--outlive-parent --no-notify` ride on `parent.outlive` (`src/hc.ts:303-305`), consultants keep `outlive: false` and so keep dying with their door, labels unchanged, no new state field, nothing in listener, watcher, reconcile or teardown reads `parent`. `leafSeats` lists finished seats too (`src/reconcile.ts:396-403`) and the `state === 'live'` check covers that; no import cycle (`reconcile.ts` does not import `seat.ts`).

Defects:

- D1 `tests/hc-start.test.ts:119-120` (new test): the outlive assertion is read right after `hc kill a.address` returns; `hc kill` hangs up and then escalates, so on a slow end B could still read `live` for a moment even without `--outlive-parent`, and the assertion proves nothing in that run. Fix: `await core.waitFor(a.address, (t) => t.state === 'finished')` before `expect((await core.get(b.address)).state).toBe('live')`. The test still fails on the old code at `:117` (`b.parent` null), so the Test-Change claim holds either way.

Not a code defect, for the door: start-and-pane Q1 1a and the engine design say leaf seats start `--no-parent`; B now starts under A by the operator's round 2 direction. Record that correction next to the Taken text so the next reader does not call the code a deviation.

Verdict: ready
