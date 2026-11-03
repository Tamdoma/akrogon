# Direct review B, round 2

Verdict: **fix**

Destination: `herdr-setup`  
Original base: `b1d904d645a45c991d0682e0571aa07761a060b0`  
Prior reviewed head: `c0660fdefb242dbade2f6965b3fbd0c4db9639c8`  
Reviewed head: `80f89e2dbd16e048bcfbbb26cf6e63ef1d08e9f7`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel`

Reviewed only the repair range, against the updated plan including D19, the report's Repair round 1, and the binding contracts.

## Earlier findings

| Finding | Result |
| --- | --- |
| F1, repo-wide filter | Resolved. `LIST_ARGS` uses the root pathspec; cwd-relative results still open correctly. New subfolder cases pass. |
| F2, Recent after a filter | Resolved. Selecting Recent clears the input; typing leaves Recent. Tests and `f4-07-recent.png` cover the transition. |
| F3, saved-open unavailable mod | Still open as a confirmed upstream limitation under the current criterion. See below. |
| F4, interaction proof | Resolved for this implementation review. The report now records actual clicks, keys, observations and shots. See proof judgment below. |

## F3 remains: the required no-error outcome still fails

The retained `check-pt4-saved-open-1793738000637-617869.log` confirms the same case: Tasks was open, its mod was removed, and the window reloaded. `herdr-app status` reports `mod tasks: no mod folder ...`; selecting another view leaves it recorded, and only another reload clears it.

The report explains why herdr-app records this before herdr-setup's mod runs. That is useful evidence for returning the requirement mismatch, as requested in round 1. It does not make panel-top-bar criterion 4 pass. Drafting upstream feedback also does not satisfy the outcome. The door must resolve this criterion/upstream dependency before declaring it complete. This finding does not request an unrelated herdr-setup workaround.

## F5: The picker repair switches to the wrong repository

**New Fix introduced by `80f89e2`.** `mods/files-view/main.js:198–201` and `mods/changes-view/main.js:194–197` now always list worktrees from `followed()`, including while a valid pin displays a different repo. The contract requires the picker for the shown repo.

Actual integration source: Tasks' Files/Changes buttons pin a selected leaf into the current space, including leaves from another repo. A successful live status scan still contains `framework/fixture-weave-recorder`. Passing that real leaf through Tasks' `pinIntent()` produces its framework worktree pin. With the space following akrogon, the repaired picker lists akrogon and its worktrees instead of framework's worktrees. The user cannot choose another worktree of the project being viewed. This breaks files-panel criterion 5 and changes-panel criterion 5's shared pin behavior.

There is also a machine mismatch in Files: the list now comes from `from.on`, but `pin()` still writes `this.context.on` (`main.js:209–210`), the old pin's machine. The documented pin interface permits those machines to differ, including a local Tasks pin in a remote space. A picked path can therefore be opened on the wrong machine. Changes preserves its picker machine in `pickOn`; Files must preserve the same provenance.

Keep the valid pinned repo as the picker's source, handle the gone-pin case without losing that context, and save the machine that supplied the selected list. Add a regression for Tasks pinning another repo into the current space.

`check review-B2-picker-source: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-picker-source-1793740885040-737249.log`

## Proof judgment and checks

Inspected `f4-07-recent.png`, `f4-09-reread.png`, `f4-04b-narrow-hover.png`, `f4-12c-sent.png` and `f4-14b-loaded.png`, alongside the report's criterion mapping. They support the repaired list transition, formatted file reload, narrow tooltip, send transition and retained draft/history loading. The report records the other click/key outcomes, including Markdown/Raw, commit selection, focus return and store migration.

For NY 5, the original plan already assigns the stale decision to pure tests. Those tests pass, and the unchanged send handler visibly returns with a message before any `hc send` when stale. I accept that boundary. Round 1's demand for a timed live race was too broad. The paid-agent cleanup log confirms t3–t6 are absent from live terminals. This is not a claim that the continuing repair session has been deleted. No paid launches or desktop input were performed during this re-check.

The report did not retain current green checks after the repair, so I ran the planned commands on the reviewed head. All cited logs were read back with `akrogon log`:

`check review-B2-tests: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-tests-1793740762316-734465.log`

`bun test`: **56 pass, 0 fail, 120 expectation calls**. No tests were skipped, disabled or weakened.

`check review-B2-files-view: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-files-view-1793740771275-734751.log`

`check review-B2-changes-view: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-changes-view-1793740771275-734749.log`

`check review-B2-needs-you: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-needs-you-1793740771275-734750.log`

Each changed mod passes `herdr-app check`. HEAD matches the supplied SHA and the worktree was clean:

`check review-B2-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B2-diff-1793740677986-728601.log`

No AREA or documentation files changed in the repair. The updated D19 records the authorized look change. No new documentation defect found.

## Test-Change trailers

- `09fe795`: `Test-Change: tests/files-view.test.js adds cases for listing from a subfolder, Recent paths from a subfolder and the filter/Recent modes (review B round 1 F1, F2); no existing expectation changed`. Accepted against F1/F2.
- `ad7bb29`: `Test-Change: tests/needs-you.test.js adds one case for withoutOptions; no existing expectation changed`. Accepted against D19's presentation change. Existing expectations remain intact.

No additional Nits. No code edits, commits or phase moves performed.
