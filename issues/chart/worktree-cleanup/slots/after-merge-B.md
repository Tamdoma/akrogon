# Notes

Slot B, 2026-10-15. Independent notes from the permitted intake, Question/Carries, Taken section and code. Akrogon HEAD: `f3557d8dc8a74459eefcc63dacb419332df1659e`. Code was read only. No lifecycle command, cleanup or test execution was performed.

## Q1. Stacked members and dirty leaf worktrees

### 1. Evidence and finding

**F1. A member misses the immediate `reconcileBatch` close, but that does not establish a permanent tab/worktree leak.** The full code trace is:

- Normal push moves members to `merged` first (`src/phase.ts:629-634`); confirmed-after-error push does the same (`:737-744`). `commitMove` saves phase and calls `completeOwner`, which can move the owner into `issues/closed`, but does not close its tab (`:127-162,190-224`).
- The phase CLI calls `mergeWake` in finally (`src/akrogon.ts:66-86`). That calls `mergePass`, not general worktree reconcile (`src/next.ts:1192-1207`). In `reconcileBatch`, an already-merged member is excluded from `moved` (`:967-977`), so `:990-994` does not close that member. Crash-recovered members still in `merge` do take this close path. The holder batch is eventually cleared (`:979-988`).
- The holder B's subsequent idle/done or exit/close hook is another path. `nextCommand` skips working events (`:1352`), resolves the pane's owner (`:1461-1467`, `:219-220`), completes/discovers it across open and closed folders (`:772-775,164-167`), and closes the merged owner's tab when the event belongs to B and is not blocked/unknown (`:1478-1489`). An A-only pane event does not take that close branch. Pane exits remain attributable through recorded pane IDs even if the pane no longer exists (`:219-220`).
- **The holder's `tab_closed` event then reconciles every discovered leaf in that repository**, not just the holder (`:1429-1445`). For a merged member with no batch, `mergedWorktree` closes its live tab (`src/reconcile.ts:235-249`) and removes its worktree if the safety checks permit (`:255-259,198-221`). Closed owner records are discoverable. An open owner may need the next closure event/pass before removal (`:247-253`). A member `tab_closed` event provides that continuation.
- General reconciliation also runs for targeted manual next (`next.ts:1399`), `next --all` (`:1400-1410`), startup/resume (`:1412-1428`) and unpause (`:1509-1524`). It can close a merged tab even if the state has no worktree (`reconcile.ts:265-273`). The two actual tab-close helpers are `closeMergedTab` (`:113-118`) and reconcile's `closeTab` (`:224-229`), with call sites above. Merged dispatch returns before allocation, so allocation's pane replacement is not another normal merged cleanup route (`next.ts:772-775,828`).
- These hooks are configured in `plugin/herdr-plugin.toml:10-27`; `plugin/next.sh:3` executes `akrogon next`. Automatic paths respect pause. Hook failure, unavailable pane inventory, a surviving batch record, dirty contents, or a live foreign pane can postpone cleanup. Do not equate an expected asynchronous delay while the holder finishes with a proven missing cleanup path.

**F2. Real batch evidence does not support “members never close.”** Framework `issues/merge-attempts.jsonl:83` records holder `technical-pack-selection`, member `favicon-audit`, attempt `3b9d71b6-8250-4aea-a57b-986dfeff00c3`, merged 2026-10-14 at 17:01:03Z. `issues/log.jsonl:2778-2779` records the member then holder moving to merged at 17:01:06Z. The closed member state, `issues/closed/satellite-favicon/favicon-audit/state.yaml:1-23`, records tab `wA:tF5` and no worktree field. The holder's closed state records tab `wA:tF4` and no worktree field. Today's read-only `herdr tab list --workspace wA` lists only `wA:t2M`, `wA:t6B`, and `wA:t7V`. Thus those tabs and recorded worktree pointers are gone. This proves eventual absence, not who removed them or how quickly. The code trace establishes the normal automatic path without assuming historical timing.

**F3. Correct “pre-rebase HEAD.”** `src/batch.ts:164-166` updates the branch ref while leaving index/worktree files alone. For an attached worktree, symbolic HEAD resolves to the moved branch, so the files/index remain old, not necessarily HEAD. The original dirt can include real uncommitted edits as well as generated files. The batch verifies committed branch content, not those local edits. `worktreeRemovable` deliberately refuses any nonempty porcelain status (`reconcile.ts:43-46`). Git's primary docs confirm the ref-update operation and that removing unclean worktrees requires force: https://git-scm.com/docs/git-update-ref.html and https://git-scm.com/docs/git-worktree.html, checked 2026-10-15.

Evidence tier: inspected primary code, actual local lifecycle records and read-only command output, plus primary Git documentation. No live historical closure timing was reconstructed. Existing `tests/next.test.ts:614-662` distinguishes pane hooks from tab-closed reconciliation; `tests/batch-dispatch.test.ts:958-991` tests phase recovery but does not itself prove normal holder-hook closure timing.

### 2. Pick, reason and cost

**D1. Keep the existing holder-release/hook-driven tab cleanup and ordinary clean-leaf removal. Keep and report dirty primary leaf worktrees.** The claimed missing close is not established after tracing the holder's tab-closed event. A dirty primary checkout is different from the deliberately disposable verify/build/worker copies covered by Taken. Its uncommitted content did not pass review just because its branch merged.

Cost: dirty primary worktrees can continue to occupy disk and require an explicit owner decision. Normal closure remains asynchronous and depends on delivered hooks or the existing resume/manual recovery paths. A behavioral proof should exercise the whole ordinary push → holder B idle → holder tab closed → member cleanup sequence, rather than assert that every member appears in the local `moved` list.

### 3. Rejected options

**O1. Force-remove every merged primary leaf worktree.** Reject. It discards local edits not present in the tested commit. The worker disposal decision explicitly accepted abandoned worker commits; it did not declare primary leaf edits disposable.

**O2. Add another immediate member-close mechanism based only on the skipped `moved` list.** Reject without an observed failure of the existing event chain or a new requirement for closure before holder release. It changes timing and duplicates responsibility while the holder may still be completing owner work. Do not close the holder during its own phase command because its merge seat still has completion work.

**O3. Depend solely on manual cleanup.** Reject. Automatic hook and resume cleanup already exists; retain it.

### 4. Pitfalls and what removes them

**R1. Mistaking a missed local close call for a leak.** Trace and prove the configured downstream tab-closed event, including a member already in `issues/closed` and an owner still open.

**R2. Removing evidence or edits never tested.** Preserve the dirty primary-worktree guard and show the path/reason in plain status. If automatic disposal of primary dirt is desired, obtain that distinct loss decision first.

**R3. Treating present absence as proof of historical automatic cleanup.** State F2's limit. A historical leak claim needs event/command evidence, not just old state tab IDs.

### 5. Additional question

**Q1a. Does “right after merge” mean after the holder finishes its completion work and releases its tab, or before that?** Current behavior supports the former. This timing choice is distinct from deleting dirty primary content. Do not widen this chart into dependent-dispatch changes merely because that call shares the `moved` loop.

## Q2. Kept reasons in plain status

### 1. Pick, reason and cost

**D2. Yes. Show each saved kept path and reason once under its repository in ordinary status, including when there are no open leaves.** This exposes exactly the leftovers the chart is intended to address. Reuse the persisted report. Cost: additional output for real leftovers and a report that reflects the last reconciliation rather than a fresh filesystem scan.

### 2. Rejected options

**O4. Keep reasons only in `status <slug>`.** Reject. An unknown folder need not have a valid slug, and the operator should not need to pick an unrelated closed leaf to see repository-level cleanup failures.

**O5. Make status run reconcile to refresh its output.** Reject. A read command would close tabs/delete files and inherit cleanup failures. This is unnecessary for exposing existing evidence.

### 3. Evidence

Primary code, inspected 2026-10-15: `src/status.ts:342-352` prints kept reasons only in the slug branch. The overview selects repositories at `:370-374`, renders each at `:394-410`, and can print `no open leaves` at `:409` without consulting the kept report. `src/reconcile.ts:22-40,447` defines and updates one persisted report per repository. It is not a real-time inventory.

### 4. Pitfalls and what removes them

**R4. Hidden leftovers after all leaves finish.** Test an overview with no open leaves and a nonempty kept report.

**R5. Duplicate or misleading warnings.** Print per repository, once, as last-reconcile results. Do not imply that status just rechecked each path. Keep the current selected-repository behavior and existing error handling outside this change.

### 5. Additional question

**Q2a. Is this request limited to ordinary status, or also `status --charts`?** Pick ordinary status for the stated scope. Do not accidentally change the chart-only view through shared rendering placement without deciding it.

## Q3. Unregistered folders

### 1. Pick, reason and cost

**D3. Keep and report unregistered folders.** A matching slug prefix is a naming coincidence, not proof that the folder is a disposable checkout owned by that completed leaf. Cost: the specific command-log folder, or future unknown folders, may need reviewed manual removal.

### 2. Rejected options

**O6. Delete every unregistered `<finished-slug>-*` folder.** Reject. It covers arbitrary data and other legitimate names, and Git's worktree removal cannot establish what a non-worktree folder contains. It also extends the Taken rule for registered `<slug>-u<N>` copies.

**O7. Silently ignore unknown folders.** Reject. It hides the retained disk use. Q2 makes the current keep reason useful without adding an ownership system for unknown files.

### 3. Evidence

Primary code and operator-provided intake, inspected 2026-10-15: registered paths come from `git worktree list --porcelain` (`src/reconcile.ts:154-159`); directory candidates are broader (`:330-335`). Unregistered candidates are retained at `:350-352`. Exact real leaf matches precede worker-suffix classification (`:345-371,385-389`). The intake describes `prose-asserts-u1-cmdlogs` as four loose logs, not a Git worktree. Taken explicitly settles worker copies, not all leaf-prefixed directories.

### 4. Pitfalls and what removes them

**R6. Prefix deletion catches unrelated data or another leaf.** Preserve the registration/real-leaf distinction and report unknown paths. A later deletion requires positive ownership or an explicit reviewed path, not a broader glob.

**R7. Saving disk by losing needed logs.** Inspect and preserve required evidence before any separately approved manual cleanup. Evidence retention belongs to its existing contract, not a name-based deletion rule.

### 5. Additional question

**Q3a. Does delivery require cleaning a particular existing unknown folder, or only preventing/removing known worktree leftovers?** The reported folder was already manually removed according to the intake. Do not add a generic loose-folder collector to reproduce that one cleanup.

# Final-shape check

**F4. The new build naming mechanism does not yet guarantee that a running build stays protected.** The problem is lifetime, not the spelling of the name:

1. A first `mergeTurn` saves batch attempt A under the global lock (`src/next.ts:1036-1073`), releases that lock, and runs `buildStack` outside it (`:1078-1083`).
2. A second pass can discover the same holder while attempt A is unapplied. `reconcileBatch` leaves that record alone (`:929-930`), but the next `mergeTurn` accepts a matching unapplied record (`:1039-1045`) and replaces it with newly generated attempt B (`:1053-1063`). There is no build-lifetime lock in `plugin/next.sh:3` or `src/akrogon.ts:90-95`.
3. A is still building, but `reconcile.ts:192-194,381-383` now sees only B. Under Taken's new rule, a concurrent targeted/all/tab-closed reconciliation can force-remove `batch-A` because no current leaf record names A. There need be no pane inside this program-created build directory. A superseded builder also currently clears the newer batch record after it returns (`next.ts:1091-1093`), which can remove B's protection while B still runs.

This is a concrete code interleaving, not a live reproduction. Naming the copy after the current attempt fixes the present random-ID mismatch only while that record remains unchanged. Add the binding requirement that protection lasts until the owning build exits, including overlapping passes and attempt supersession. Settle whether serialization or a durable live-build identity supplies that property before handoff, then prove it by pausing a real fixture build, driving a second pass plus reconciliation, and confirming neither live copy is removed. A single running-build test with an unchanged record would miss this case.

The accepted removal policies are not reopened by this objection. It concerns the newly proposed mechanism needed to uphold Taken's own running-build guarantee.
