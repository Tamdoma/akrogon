# Review B: F6–F8 repair

Verdict: **ready**

Prior reviewed head: `37aa0a834633bc56fabeb68557c81858bfa4a47a`  
Reviewed head: `364de7d0309db7e73c18e6807a3d010e7211cd73`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/spaces-follow`

Reviewed only the repair range and the three outstanding findings. No new defects or Nits found.

- **F6 resolved.** The thumb starts a drag, movement changes the offset proportionally and clamps it, and release or leaving the list ends the drag. The host probe exercises these paths. Inspected `live/f6-01-top-crop.png` and `f6-02-dragged-crop.png`, which show the reported native pointer drag moving the list.
- **F7 resolved.** The bar always renders a 12 px status slot, independently of the dot or spinner inside it. The real-render host probe confirms identical outer slots for inactive `done` and selected `idle`, including an actual dot in the first render. The supplied `f7-01-done-crop.png` and `f7-02-selected-crop.png` show stable positions but do not themselves show the dot transition. The probe covers that missing case.
- **F8 resolved.** Ownership follows terminal ancestry independently of pane presence and retains the farthest ancestor pane in this tab. The same input returns `kid` on the prior source and `root` on this head. The added regression test passes.

## Verification

HEAD matches the supplied SHA and the worktree is clean. Ran `bun test`: **51 pass, 0 fail, 92 expectation calls**. Both changed mods pass `herdr-app check`. The current run follows the added test. No skips, disabled cases or changed existing expectations were introduced.

Retained logs, all read back with `akrogon log`:

- `check review-B5-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B5-diff-1793744256008-1233542.log`
- `check review-B5-behavior: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B5-behavior-1793744319640-1238426.log`
- `check review-B5-tests: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B5-tests-1793744276016-1234607.log`
- `check review-B5-spaces-list: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B5-spaces-list-1793744275988-1234605.log`
- `check review-B5-panel-bar: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B5-panel-bar-1793744275989-1234606.log`

No AREA or documentation files changed. No additional documentation correction is needed for these repairs. The host probe used stubs for native APIs and performed no desktop input, agent launch or deployment.

## Test-Change trailer

`364de7d`: `Test-Change: tests/panel-bar.test.js adds one tabOwner case for an ancestor without a pane between the owner and the agent (review B round 4 F8); no existing expectation changed.`

Accepted against F8. The case matches the reviewed failure scenario and preserves existing expectations.
