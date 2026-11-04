# Review B: Spaces follow, tab sizing/ownership and Needs-you removal

Verdict: **fix**

Base: `20cd68b0ab245863e76341a7e51ef832ecd1c00a`  
Reviewed head: `37aa0a834633bc56fabeb68557c81858bfa4a47a`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/spaces-follow`

Includes all four commits and the corrected removal head. Finding numbers continue the earlier herdr-panels reviews.

## F6: The Spaces scrollbar cannot be dragged

**Fix.** `mods/spaces-list/main.js:400–406` replaces the shipped native scroll area with a clipped absolute column and a plain painted thumb. The thumb has no pointer handlers. Only wheel events and selection following change `offset`.

Failure scenario: the user grabs the visible scrollbar and drags it to reach another space. The shipped `overflow_y_scrollbar()` drives the list, but this replacement does nothing. The event-handler probe confirms the thumb has no handlers. Preserve that existing scrolling interaction alongside keyboard following and wheel scrolling. This is a regression from the shipped Spaces mod, not a request for another feature.

## F7: Selecting a finished tab still changes its width

**Fix.** `mods/panel-bar/main.js:184–189` reserves close-button space but still conditionally inserts the status indicator.

Failure scenario: an agent finishes in an inactive tab, giving the tab `done` status. The user selects it. Herdr marks the agent seen and changes it to `idle`, as documented in the installed manual's Agents section. The 6 px dot and its 7 px flex gap disappear, shrinking the tab by 13 logical px and shifting later tabs. The shell-only screenshots do not exercise this case. Reserve the status indicator's space too, and cover the done-to-selected-idle transition.

The probe renders the real bar for that documented transition: four children including a 6 px dot become three children without the dot, with the same 7 px gap and close-button reservation.

## F8: Tab ownership stops at a pane-less intermediary

**Fix.** `mods/panel-bar/routine.js:58–60` looks up the immediate parent in `paneOf` before continuing. An ancestor without a pane ends the walk even if its parent has a pane in this tab.

Failure scenario: a silent Claude parent has a pane, its background sub-agent has no pane, and that sub-agent's Codex child is given a pane with `terminal.keep`. The installed Herdr manual documents background sub-agents, parent links and `terminal.keep`. These are supported operations. With the Codex pane first, `tabOwner()` returns Codex instead of the farthest Claude ancestor, reproducing the reported wrong-icon problem through a deeper agent tree.

The direct function probe returns `kid` for `root → middle without a pane → kid`, where the root pane should own the tab. Traverse terminal ancestry independently of whether each intermediary has a pane. The new test covers only a direct parent with a pane.

## Needs-you removal and Files toggle

No additional breaking leftover found in the reviewed paths:

- `VIEWS` excludes Needs you, so stale `workspace.panels` entries cannot create a button or handle a request. Keeping an inert entry in the seed union does not restore the removed view.
- Per-space restore validates the remembered view against enabled views and treats a remembered Needs-you value as closed. The layout block, bar import/count, prefix `y`, mod, tests and fixtures are removed. The existing invalid-view close path remains.
- Old install symlinks may remain dangling, but neither the current layout nor the bar references that mod. The install/session-link loops do not dereference its deleted source while linking. No install failure is established by that residue alone.
- Prefix `f` sends `toggle files`. The routine's existing toggle behavior and the supplied `pf-01`/`pf-02` evidence support opening and closing Files.

The operator's removal instruction authorizes deleting the Needs-you tests and replacing their view identifiers in remaining cases. This is not weakened coverage of a retained feature.

## Verification

Compared the entire Spaces clone against the installed shipped `spaces/main.js`. Row drag/reorder, context-menu, machine-header/fold, compact-row and hover handlers are unchanged. A host probe of the real class passes selection following across nine rows and wheel clamping at both ends. F6 concerns the removed native scrollbar interaction.

Inspected `sf-04-ninth-crop.png`, `sf-06-tab2-crop.png`, `sf-07-wheel-up-crop.png`, `owner-02-crop.png` and `pf-02-closed-small.png`. They support the basic scroll, shell-tab sizing, direct-parent icon and Files-close cases, without covering F6–F8's failure scenarios.

At the corrected head: **50 tests pass, 0 fail, 91 expectation calls**. The earlier 63 count predates the authorized Needs-you deletion. Checks pass for spaces-list, panel-bar and prefix. HEAD matches and the worktree is clean. No deployment, desktop input or paid launch was performed.

Retained logs, read back with `akrogon log`:

- `check review-B4-tests: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-tests-1793743798498-1200474.log`
- `check review-B4-behavior: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-behavior-1793743930984-1207597.log` records the diagnostic results for F6–F8 and passing scroll/clamp assertions. It uses host stubs, not native pointer input.
- `check review-B4-spaces-list: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-spaces-list-1793743956800-1208797.log`
- `check review-B4-panel-bar: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-panel-bar-1793743956801-1208798.log`
- `check review-B4-prefix: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-prefix-1793743956797-1208799.log`
- `check review-B4-area: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B4-area-1793743798456-1200476.log` lists the changed AREA's concrete paths as existing. The mod-name placeholder is a template.

Read README, the documentation index and the installed app's model/API descriptions. No additional documentation defect found.

## Test-Change trailers

- `bfb12cb`: adds the silent-parent `tabOwner` case, citing the operator's icon report. Accepted source, but it does not cover F8's pane-less intermediary.
- `37aa0a8`: removes Needs-you tests/fixtures and count cases, updates view lists and adds stale-entry exclusion. Accepted against the operator's explicit removal instruction. Retained feature expectations remain covered.

No additional Nits or operator actions.
