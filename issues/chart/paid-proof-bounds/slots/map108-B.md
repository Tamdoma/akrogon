# Slot B map addendum: #108

Confirmed completion failure. The deeper defect is that a chart reused one completion-owner identity across independently handed-off groups, and command admission accepted both its open and closed copies. Recommend a separate C7 chart for owner identity and admission, preserving C2 (#103) for completion evidence that survives worktree cleanup. Seven charts total.

Paths are relative to `/home/ivan/Work/infra/akrogon`. `framework/` means `/home/ivan/Work/infra/tamdoma/framework`. Inspected HEAD: `b5a877c1`. This was read-only investigation with disposable scratch reproductions. No lifecycle command or live source closure was run.

## F11 — Mechanism confirmed, requested remedy is a design choice

`src/phase.ts:completeOwner` computes the top-level issue/epic owner, tests whether all its materialized leaves are merged, and refuses an existing `issues/closed/<basename(owner)>` before source closure, packing or moving files. `renameSync(owner, destination)` later assumes an unoccupied destination. Both copies of `framework/issues/{open,closed}/satellite-plan-fit` currently exist. All six open leaf states read `phase: merged`; only pool-parity still records a worktree.

A disposable reproduction called `completeOwner` with a merged, unsourced new leaf and an existing closed owner. It produced `Completion destination exists`, retained both trees, preserved the closed `EPIC.md`, and created no `.closing` marker. This isolates #108 from #103: a missing worktree or GitHub source is not required to trigger it.

The refusal protects archived history. Deleting it is not a fix: directory rename does not merge nonempty trees, and both trees contain different `EPIC.md` files. The requested behavior “complete into the existing closed epic” therefore needs an explicit reopening/aggregation policy. It is not the existing lifecycle contract: `skills/chart-issues/assets/shapes.md`, Preflight and validation, already forbids the closed-owner collision, even for an empty closed folder.

Status is not inventing live work. The leaves really remain in the open tree after completion fails. The defect is incomplete archival, while their merged phase remains truthful (`src/phase.ts:completeOwner`; `src/status.ts:scanRepo`).

## F12 — How the leaves got past the rule

The chart itself records the sequence. `framework/issues/chart/satellite-plan-fit/CHART.md`, Destination, says page-draw-preview and brand-override transferred on 2026-10-17, while five other drafts remained held for a Sonnet launch proof and persona-text-bounds awaited a decision. Handoff records a new `issues/open/satellite-plan-fit/EPIC.md` on 2026-10-18, explicitly says “earlier leaves closed”, and nevertheless claims “Gaps empty, no collisions”. The new open `EPIC.md:3` also explicitly references the earlier closed owner.

This was a partial handoff of the same thematic chart, followed by reuse after the first group finished. It was not an accidental rename by completion. The mode record identifies the chart door as pane `wA:pMT`, session `773ba851-3d2f-4491-861b-1432f9e5c45a`, with consultant B `wA:pMS`. That identifies recorded chart responsibility, not the exact filesystem-writing process. I did not inspect private session transcripts.

`framework/issues/log.jsonl` corroborates the order: brand-override merged at `2026-10-18T03:38:51.631Z`, page-draw-preview at `04:38:41.889Z`; the first later implementation transitions are replay-cases at `08:02:48.619Z` and hub-child-links at `08:03:33.594Z`. Pool-parity, the last of the new group, merged at `2026-10-19T03:00:36.826Z`. Framework commit `ec649c713` (“add issues”, 2026-10-18 17:17:49 +0200) adds both open and closed epic indexes. That commit is persistence evidence, not proof of the original write time.

The prohibition predates this incident: akrogon commit `1956e56c` introduced the closed-owner refusal in shapes on 2026-09-11. But it is prose at a direct-filesystem handoff. `src/preflight.ts:preflightCommand` checks remote/tracking refs, not proposed owner occupancy. `src/turn.ts:eligibility` checks dependencies and inputs, not owner collision. `tests/next.test.ts:5700`, “closed owner name does not block an open same-name owner”, explicitly expects the open owner's leaf to dispatch. The handoff rule and accepted dispatch behavior disagree.

## F13 — One level deeper: topic identity and completion identity are conflated

`completeOwner` can see only leaf state folders, not held drafts or future work recorded in a chart. It correctly sees the first two materialized leaves as a complete owner. Reusing the same basename for later work then gives two different completion groups the same storage identity. Adding a count of future leaves, placeholder failed leaves or a pending-epic reservation system would add lifecycle machinery for work that is not ready to enter it.

**Smallest coherent simplification:** keep the chart as the long-lived topic and give each independently completable handoff group a unique owner name. Remove same-name open/closed owner coexistence from valid work admission. Preserve the existing one-directory packing and rename operation. A small shared owner-occupancy validation is needed at an actual command boundary before work dispatch/initial phase progression, with the handoff audit using the same identity rule. The error must be owner-local, not another repository-wide failure like #102. Direct filesystem writes can still create invalid records; do not claim a dispatch guard prevents those writes.

This does not require renaming leaf slugs, adding reopening states, merging archives at completion, or delaying independent ready leaves behind an unrelated human prerequisite. It changes what is considered a valid completion group. Existing chart grouping can remain unchanged. Evidence: `completeOwner`, `eligibility`, the partial-handoff chart record, and the existing shapes prohibition.

## D10 — Immutable completion groups or a reopened canonical owner?

Recommend immutable completed groups and a fresh owner for follow-up handoffs. This preserves the current documented contract and makes the archive-destination collision impossible for admitted work, without implementing an archive union during completion.

The material alternative is explicit reopening: move the existing closed owner, including its archive and old merged leaves, back into the canonical open location **before** adding new leaves. There must be one owner directory, not two simultaneous copies. That can reuse current `packFolder` behavior when the combined owner later closes, but changes the meaning of closed history, status and completion announcements. It needs a defined operation and recovery semantics. If the operator wants that behavior, choose it explicitly rather than teach `completeOwner` to silently combine arbitrary directories.

A third option, automatic union into an existing closed owner at completion, is the most complex. It needs collision handling for child directories and indexes, two-archive merging, source ownership across the union, interruption recovery and prevention of new handoff writes during consolidation. The current code supplies no such transaction (`src/phase.ts:completeOwner`; `src/pack.ts:packFolder`). Do not take that route merely because the seed describes it as expected behavior.

**Q9.** Is “satellite-plan-fit” intended as a permanent topic or one finite completion owner? If it is a topic, the chart already provides that identity. If it is one reopenable owner, what event reopens it and what counts as one completion announcement? A policy answer is needed before choosing the implementation, not before confirming the bug.

**R9.** Refusing the invalid owner only when all leaves merge is too late. Conversely, holding every ready leaf until all future drafts exist introduces a dependency the products do not have. Use admission identity, not delayed useful work, to resolve the conflict. The current dispatch test must be reconsidered as part of that contract change.

## F14 — Packing and evidence make generic directory merging unsafe

`src/pack.ts:packFolder` merges loose `.log` files with **one archive in the same owner folder**, compares bytes for duplicate member names, verifies the new archive, and only then removes plain logs. It does not accept two owner roots or merge two existing archives. `EPIC.md`, issue indexes and non-log artifacts are outside that merge logic. The current closed satellite-plan-fit folder has a 383,172-byte `evidence.tar.zst`; the open owner has no top-level archive at inspection. Preserving that old archive is mandatory even in this relatively simple case.

There is already another concrete consequence of the duplicate identity. `src/evidence.ts:locate` returns owner candidates in open, closed, parked order. `readLog` searches plain files, then uses the first existing owner for archived evidence. A scratch reproduction with an archived old log under closed and an empty same-name open owner failed with “no log for recorded path”. Removing the open twin made the same archived log readable. So the duplicate owner can hide historical evidence even before the final move fails. This is within the same identity defect, not a reason to add a second archive-search fallback.

`src/reconcile.ts:ownerCompletes` duplicates the “all leaves merged” calculation but ignores destination occupancy. Its `mergedWorktree` branch can consequently retain a worktree for an owner that completion cannot move. Removing that retention would not repair the collision and could expose #103 sooner. Share owner identity semantics where needed, while keeping cleanup separate from fixing archived history.

**Q10.** How should the already-invalid pair be repaired without breaking recorded evidence paths? A simple rename of the newer owner changes the owner component used by `src/evidence.ts:locate`, so existing absolute evidence references need an explicit migration/read-back plan. A one-time consolidation under the old name preserves those owner paths but requires index reconciliation and archive preservation. Neither should be implemented as an unreviewed recursive move.

**R10.** A production repair must preserve all eight leaves, source identities, indexes, original archive members and logs, and be restartable without overwriting different content. Packing succeeds only after archived paths resolve to the intended owner. Repair is work on authoritative issue records, not a leaf code diff under `issues/`, consistent with shapes' existing rule. No such repair was performed in this map.

## D11 — Relation to #103 and recommended split

Keep #108 separate from C2/#103. Both surface in `completeOwner`, but they fail for independent reasons:

- #103: source closure depends on disposable worktree HEAD instead of durable landing evidence, even with a unique owner and free archive destination.
- #108: owner identity is reused across open and closed, even without any sources or worktree dependency. It also affects dispatch and historical log lookup before completion.

C2's durable commit change does not decide whether an epic can reopen. C7's identity rule does not provide missing commit evidence. A common file is not an implementation dependency.

**C7 — Completion-owner identity:** each independently handed-off completion group has one unambiguous owner across active and archived records, so admitted work can close without overwriting history or hiding its evidence.

The recommended split is now **seven charts**, preserving C1–C6. If the operator instead chooses explicit canonical reopening, C7 still owns that identity transition and can be delivered independently of durable source closure. The existing satellite-plan-fit recovery must check both defects: five of its six open merged leaves have no worktree, so removing the destination collision may reveal #103 next. That is a recovery dependency for this dataset, not a reason to couple all code work.

#102 shares inconsistent inventory boundaries and is relevant when placing the owner-local refusal. #105 shares a handoff rule that was documented but not respected. #104 and #107 share no required mechanism with this issue. These similarities justify consistent policy, not a combined generic “lifecycle reliability” chart.

## Sources and limits

- **S9 — operator tier:** the supplied #108 report and brief, including the preference for deleting complexity. The report's desired append-to-closed behavior is intake to chart, not an already-taken reopen policy.
- **S10 — practitioner tier:** `framework/issues/chart/satellite-plan-fit/CHART.md` and its two epic indexes document the partial handoff and explicit reuse. The chart's “no collisions” assertion is contradicted by those same records. The record identifies the chart session but does not establish which individual process wrote each file.
- **S11 — better-than-training tier:** current source and test cited above, inspected state files, framework transition records and Git history, plus disposable direct-function reproductions for the completion refusal and archived-log shadowing. Both scratch directories were removed. No external GitHub operation was needed or attempted.
- **S12 — model judgment:** the recommended chart split and identity policy follow from those mechanisms. No outside practitioner claim is relied on. Searches were local: named owner state/index files, chart Destination/Handoff/Mode record, completion/packing/evidence functions, collision tests, transition history, and the Git history of the handoff prohibition. I did not inspect private seat transcripts or modify the live collision.
