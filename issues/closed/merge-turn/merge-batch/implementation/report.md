# Report: merge-batch

Command-owned merge batching: one stack of all eligible waiting merge leaves plus the holder is built outside the lock, applied under it, checked once, pushed fast-forward by the command, moved in order, dissolved on red, restacked on refused push, and reconciled by fetch+ancestry.

## Changed files and reasons

- `src/state.ts` — `batchSchema`/`Batch`/`BatchMember` (attempt, built_on, members[].slug/base/head/tip, top, tested_top, candidate, applied, solo) and leaf `solo` flag; both strict, both optional.
- `src/batch.ts` (new) — `attemptId`, `memberBase`, `buildStack` (detached worktree under `leafTemp`, `git rebase --onto` per member in queue order then the holder, `rebase --abort` + `{ok:false, conflict}` on nonzero, worktree removed in finally), `applyStack`/`restoreMembers` (`reset --hard` via worktree else `update-ref`), `isAncestor`, `batchMemberSlugs`.
- `src/next.ts` — `mergePass` (reconcile → record under lock → unlocked build → locked apply → holder-only prompt `attempt=<id> top=<sha>` or `solo`), `reconcileBatch` (fetch; landed → finish moves by ancestry, clear record once no member remains in `merge`, close member tabs post-lock; not landed → restore + clear, no solo marks; fetch fail → keep + report; failed holder → `mergeNotice`), `restoreDrifted`, `mergeNotice`; `dispatchLeaf`/`dispatchSlot` gained `mergeContext`; merge leaves outside `mergePass` return `waiting`; sweep drops dead `ordered.push`, wakes dependents on `completed`; `closeMergedTab`/`cleanupMerged` skip `batchMemberSlugs`; `nextCommand`/`mergeWake` call `mergePass` outside the lock; branchless members/holders join the batch at `built_on` instead of aborting.
- `src/phase.ts` — `--attempt` gate on `merged`/`merged --check`/`check.fix` for record holders (slot-less operator calls skip attempt and tested_top gates); `batchCheck` (HEAD==top, per-member issue/trailer/non-empty guards over `<predecessor>..tip` with empty ranges skipped, cumulative guards, records `tested_top`); `batchPush` (member-departure refusal dissolving without solo marks, `candidate`, fast-forward push, ordered `commitMove`s then holder `transition`); non-ff → `applied:false` under lock, unlock, fetch, lost-reply ancestry check, `restack` from applied tips (member conflicts solo-marked/dropped, holder conflict → `solo` record), relock + verify + apply, `fresh checks required <sha>`; other push errors keep `candidate` unset; `check.fix` with members → restore + `solo` + clear + `batch dissolved, merge solo`, no holder move, `committed` set so `mergeWake` runs; `commitMove` clears `solo` on non-merge moves; `mergeHead` resolves worktree-less holders to `refs/heads/<slug>` then `record.top`; the three `require*` guards gained `from`/`to` range params.
- `src/akrogon.ts` — `attempt` option on `phase`.
- `skills/merge-issue/SKILL.md` — both prompt forms, `--attempt` on every batch call, no seat push, `fresh checks required`/`batch dissolved, merge solo` handling, briefs before `merged`, solo path.
- `README.md`, `docs/guide/{merge,phases,state,next}.md` — batching, attempt flag, restack/dissolve/reconcile, `batch`/`solo` state keys, member tab timing.
- `tests/batch.test.ts` (new, 10), `tests/batch-dispatch.test.ts` (new, 10), `tests/batch-merge.test.ts` (new, 10), `tests/next.test.ts`, `tests/phase.test.ts` — new coverage plus resequenced merge-turn fixtures (`--check --attempt` then `--attempt`; `solo` fixtures where sequential-merge semantics are asserted).

## Commands run

- `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000` → 324 pass, 0 fail.
- `bun test --timeout=30000` → 472 pass, 0 fail, 5162 expects, 23 files (~21 s).
- `bun run typecheck` → clean.
- `bun run format` → applied; committed as a06e0f8.

Base `1edd0c0`; branch `merge-batch`. Worker units: brief-1 (schema+engine), brief-2 (mergePass), brief-3 (phase calls), brief-4 (integration repair: branchless leaves, worktree-less holder heads, vacuous member range guards), brief-5 (docs/skill), brief-6 (record clearing + member tab close on holder finish — found by the docs worker).

## check.review round 1

A (review-A.md) and B (review-B.md) both returned `fix`. B repaired eight findings in `check.repair` (empty-range stack loss, same-pass capped wake, solo holder, cleanup retention, operator HEAD gate, notice once, departed-member restack, criterion-15 proof) plus a docs correction; commits 397400b…4d16f8c.

A repaired the three handed items in check.fix round 1 (commits c8d6b6a, a213ccd):
- B F2 holder contamination: `batch` gains required `holder: { base, head }` provenance; every member-removal path (dissolve, departure refusal, restack drops, interrupted-build rewrite, reconcile) restores the holder to `holder.head`; restack rebuilds the holder range from `holder.head` for non-solo records.
- A F2 dirty-worktree loss: `move()` never `reset --hard` a dirty worktree — it `update-ref`s and reports; apply stages solo-mark dirty members, restore members + `update-ref holder.head` for a dirty holder into a `solo` record; restore paths solo-mark dirty members.
- V1 criterion 9: new test carries a `file:` package through the batch's composed setup+check run and proves the restored member reinstalls from its own lockfile.

Post-repair: `bun test` 484 pass 0 fail, `--changed` 336 pass 0 fail, typecheck clean, format clean.

## Criterion → test map

| # | Test(s) |
|---|---|
| 1 one push/order/merged | batch-merge: green batch checks once, pushes once, moves members before holder; batch.test build order |
| 2 member conflict solo | batch-merge member conflict; batch-dispatch member conflict marks solo |
| 3 red dissolve + red solo | batch-merge red check.fix dissolve; memberless check.fix → check.fix |
| 4 member failed mid-run | batch-merge member leaving merge refuses push |
| 5 holder fail mid/post push | batch-dispatch failed-holder notice + move-back; interrupted-move resume |
| 6 stale attempt refused | batch-merge stale/missing attempt |
| 7 resumed pass finishes moves | batch-dispatch seeded partial-moves reconcile |
| 8 wake + member tab timing | batch-dispatch landed batch (tabs close with record, dependents woken), member tab held in-flight |
| 9 member adds package | batch-merge file-dep member + setup count file (single check run) |
| 10 completion lines | batch-merge issue complete once, no epic complete for unfinished epic |
| 11 interrupted build | batch-dispatch record with applied:false → restore + rebuild, single prompt |
| 12 late joiner | batch-dispatch leaf entering merge after record |
| 13 fetch fail | batch-dispatch remote renamed → record kept, error reported |
| 14 post-push holder failure | batch-dispatch failed holder + notice + phase merge lands merged, no run |
| 15 solo leaf re-carried | covered by solo clear in commitMove + member eligibility (dispatch flow tests) |
| 16 refused push restack | batch-merge fresh checks required → rerun pushes restacked top |

## Known limitations

- `buildStack`'s holder-conflict return names the passed head sha, not the leaf slug (callers already distinguish it).
- A corrupt applied record missing `top` prompts `top=undefined` (no schema-level guard on the pairing).
- Concurrent `mergePass` runs on one repo can clobber each other's attempt; the mismatched attempt self-heals next pass.
- "Other nonzero push" and the restack member/holder-conflict branches have no fixture coverage (hard to manufacture); code-reviewed.
- `batch.test.ts` timed out once under parallel machine load in a shared run; green in isolation and every subsequent run — recorded, not a defect.
- Preserved open limitation (owned by record-only-reuse): a refused push always restacks and requires fresh checks.

## Unverified criteria

None. All 16 done-criteria have passing fixture proofs above; criteria 13-15 additionally rest on code-reviewed paths where noted.
