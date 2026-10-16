# Design: release-any-phase

## Binding decisions, verbatim

### Release
From [release.md](../../../chart/temp-release/forks/release.md).
2026-10-16, A on operator autopilot delegation (operator, verbatim: "only you decide for me and start the charts when they're handed off"): `1a | 2a | 3a`.
Reason: 116 of 117 failed leaves last month resumed in the same tab (median 12-19 min), so failed tabs stay; one rule for every phase removes the merged-or-failed special case and closes the unfinished-tab and unreadable-inventory gaps; disk temp uses no RAM and c698170's overnight admission incident is the newer evidence.
Final shape (C no disagreements; B F1, F2 applied):
1. Failed leaves keep their tab. No change.
2. Both slice-stop paths (src/reconcile.ts:476-500 per repo, :1045-1068 host) stop the loaded slice of any leaf, whatever its phase, whose recorded tab is proven gone, that is not the pass's own slice and that no live run record names. An unfinished leaf with no recorded tab is not stopped. `reconcileNeedsPanes` (src/reconcile.ts:397-405) requests real pane inventory for every such candidate with a recorded tab, even when its temp folder is absent; a skipped or unavailable inventory never counts as a vanished tab.
3. Leaf temp deletion (src/reconcile.ts:951-973) keeps the temp with an inventory-unavailable reason when the unit list is unreadable, for every phase.
4. Every dispatch path, manual merge dispatch included (src/next.ts:1169-1175), takes the global lock that reconcile holds, so a pass never stops or deletes temp for a dispatch that recorded its tab but has not adopted seats; tab-loss cleanup finishes before replacement seats join the same slice, and a later pass keeps them. The admission-lock recheck stays.
5. After a tab-loss stop the existing tab_closed flow still re-dispatches the leaf.
6. Parked leaves stay outside the leaf map; their temp stays with the unowned sweep.
7. Leaf temp stays at `/var/tmp/akr-<uid>/<4>/<8>`.
Foreclosed: closing failed tabs at failure (1b), accepting the gaps (2b), moving temp back to tmpfs `/tmp` (3b), a parked-leaf release rule.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proven by reconcile and dispatch runs against the existing fakes (tests/fake-herdr.ts, tests/fake-systemctl.ts, tests/fake-busctl.ts, tests/fake-proc.ts) with a temporary AKROGON_HOME and AKROGON_LEAF_TEMP_ROOT; never the real user systemd manager, herdr or `/var/tmp`. Criterion 1 is the reported gap: its test fails on today's code and passes after. Each other criterion shows one deliberate break turning its test red. Criterion 7's race is shown by holding a dispatch between tab record and seat adoption (a fake herdr or busctl step that blocks) while a second pass starts. No live model or outside call.

## Leaf architecture

Owned surfaces: `src/reconcile.ts` (the `finished` gate in both slice-stop paths, `sliceKeepReason`, `reconcileNeedsPanes`, the leaf-temp branch), `src/next.ts` (`dispatchMergeLeaf` manual path and any other dispatch path found outside the global lock), and tests under `tests/` for reconcile, leaf slices and dispatch.

State changed and its consumers:
- Slices of unfinished leaves can now be stopped. Consumers: the `tab_closed` re-dispatch (src/next.ts:1445-1470), `akrogon stop`/`start` (src/stop.ts), `akrogon leftovers` keep reasons (src/leftovers.ts).
- A new keep reason for unreadable unit inventory on leaf temp. Consumers: `akrogon leftovers` display.
- Manual merge dispatch now waits on the global lock. Consumers: the operator's `akrogon next <slug>`; a long reconcile pass delays it.
- Open for the plan: whether other dispatch paths run outside the global lock today.

Exclusions: failed-tab closing; parked leaves; the temp root location; framework child-process and socket fixes (framework-temp-owners chart).
