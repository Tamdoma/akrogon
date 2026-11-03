# Direct review B: Tasks attempt 2, round 1

Verdict: **ready**

Base: `59939cfb94187e9d8b25ad290cfc3969dc80ff17`  
Reviewed head: `554e16545e53b546cf03b44b86148fd478d19db4`  
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/tasks-look-2`

Reviewed all four changed files against `direct/brief-9.md`, CHART.md attempt 2, D19 and the retained tasks-mod contract. The newer operator decisions replace the earlier seat-letter and pill presentation requirements.

No blocking findings or Nits.

## Behavior and proof

Row clicks and all four folds now notify immediately. Reused the existing host fixture and event handlers to verify the regression: the base row click emits zero notifications and fails the assertion; the reviewed head emits one notification for the row and one for each fold, five total. No native input or paid launch was used.

`check review-B3-click-before-arg: 1 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B3-click-before-arg-1793741774250-771868.log`

`check review-B3-click-after: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B3-click-after-1793741801113-772545.log`

The first stdin-fed `review-B3-click-before` invocation executed no probe and is excluded from evidence. The corrected argument-fed invocation above fails specifically on `0 !== 1` against the base implementation.

Both seats use the matched program's icon and tint, without letters; a working seat spins. Dimensions and text follow `settings().font_size`, with the documented default of 14. The live `issues/chart/herdr-panels/direct/live/ui-after-tasks-icons.png` shows the larger icons, text and status pills. The pill retains its opaque background under the tint. The second line excludes the repeated group, disappears when empty, and unknown time renders blank. Existing pin and chart behavior remains covered.

Read the retained logs back with `akrogon log`:

- `direct/check-t2-tests-1793740683255-728842.log`: **22 tests pass, 0 fail, 69 expectation calls**, including the final seat-icon expectation and immediate redraw case.
- `direct/check-t2-typecheck-1793740685730-729057.log`: `bun run typecheck` passes.
- `direct/check-t2-modcheck-1793740685847-729210.log`: `herdr-app check herdr-app/tasks` passes.

The passing test log includes the latest changed cases. No skips, filters or disabled tests were introduced. Green checks were reused. `brief-9.md`, these logs and the retained live shot supply the proof mapping despite there being no separate direct plan/report for attempt 2.

HEAD matches the supplied head and the worktree is clean. Read the inspection and probe logs back:

`check review-B3-task-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/check-review-B3-task-diff-1793741675354-769094.log`

Read the existing Tasks documentation in `src/AREA.md` and the binding brief/design. No AREA file changed and no additional documented behavior needs correction.

## Test-Change trailers

- `fe3644dd`: `tests/tasks-mod-host.test.ts` passes the click callback's `cx` and adds redraw coverage; `tests/tasks-mod.test.ts` adds the nonrepeated group case. Accepted against brief 9 criteria 1 and 4 and the cited operator complaint.
- `bc7d268a`: the host seat case changes to working-seat-only presentation and adds mocked `settings().font_size`. Accepted as the intermediate Q2 O1 decision, subsequently superseded by Q4.
- `554e1654`: the host seat case changes to both program icons without letters and retains the working spinner. Accepted against Q4 and brief 9 criterion 2. This is the final expectation verified by the green run.

Review complete. No deployment, phase move or code edit performed.
