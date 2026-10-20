# Seat A blind notes: stuck-repair

Live framework tree and GitHub read 2026-10-19; akrogon HEAD e522c186.

## Facts

- The #103 leaves are no longer stuck: component-loader, coverage-roles, meta-summary-table (check-accuracy), landing-composition, admin-csp, account-access sit under framework `issues/closed`; their sources #276, #242, #243, #273, #274, #185 are CLOSED (2026-10-17/18).
- Twin: `open/satellite-plan-fit` holds 6 merged leaves. Sources #281, #284, #292, #294 are CLOSED (closed at each leaf's own merge, worktree present). #282 and #285 (pool-parity, the last to merge) are OPEN: `completeOwner` threw at the destination check (`src/phase.ts:201`) before `closeSources`. pool-parity still records its worktree; reconcile keeps it (`src/reconcile.ts:691`, `ownerCompletes` true).
- 708 wave-2 log paths in `issues/timings.jsonl` and 49 in `verify-runs.jsonl` contain `satellite-plan-fit` as the owner segment; `locate` resolves owner by that name (`src/evidence.ts:46-52`).
- Closed EPIC.md lists page-draw-preview, brand-override. Open EPIC.md lists the 6 wave-2 leaves and says the earlier leaves are closed.

## Pick

A one-time step on main, done by the door now (no code needed): move the 6 wave-2 issue folders into `issues/closed/satellite-plan-fit/`, append the wave-2 list to the closed EPIC.md (one index), run `akrogon pack issues/closed/satellite-plan-fit` so the 708 loose logs join the existing archive, close #282 and #285 with `akrogon close <source> --by pool-parity`, remove the empty open folder, commit. Reason: keeps the owner name, so all 757 recorded log paths still resolve; reuses existing commands (`pack`, `close`); no wait on the code leaf. Cost: hand-merging one EPIC.md and a manual folder move on main once. Next reconcile sees pool-parity under closed and removes its worktree.

Rejected:
- Rename to `satellite-plan-fit-2`, then let akrogon complete it (works today: pool-parity has a worktree). Requires rewriting 757 paths in two history files; editing recorded history is riskier than moving folders.
- Wait for the code leaf. The new guard refuses the twin and `completeOwner` still throws; no automatic path exists under owner-reuse 1a.

Pitfalls:
- `akrogon pack` on a closed owner first checks git tracked-vs-index (`src/pack-command.ts:43-45`); stage the moved folders before packing or the check refuses. The door verifies by running it.
- Member name conflicts in the archive: wave-2 logs live under different issue folders than wave-1, so no shared member; `packFolder` refuses differing bytes if one existed.
- A live pane in pool-parity's tab: reconcile closes or keeps it per its own rules; check `akrogon status` after.
- This is a step on main touching `issues/`, so it cannot be a leaf (shapes.md Preflight). It is a door step, verified by `akrogon status` showing no satellite-plan-fit leaves open, `readLog` of one wave-2 log path succeeding, and #282, #285 CLOSED.

Question the fork does not ask: should the repair wait until the guard leaf lands, so the guard is proven on this live twin first? I would not: a fixture proves the guard, and waiting keeps two issues open for no gain.
