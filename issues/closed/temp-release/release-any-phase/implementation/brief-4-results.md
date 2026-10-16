# Brief 4 results: deliberate-break proofs B1–B5 + needsPanes variant

Worktree: /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u4 (detached at 0bea6be).
Command per run: `akrogon run-check --name break-<tag> -- bun test tests/release-any-phase.test.ts --timeout=30000`. Every break reverted with `git checkout -- src/`; `git status --porcelain src/` confirmed empty after each revert and after the final green.

| Break | Predicted reds | Actual reds | Match | Check citation |
|---|---|---|---|---|
| B1 — `if (!finished(leaf)) continue;` in per-repo slice loop (reconcile.ts) | criteria 1/2/3/8 tests + criterion-6 host test | 8 red: c1 (unfinished leaf slice stopped + temp removed), c2 (live run record keeps unfinished slice), c3a (live tab keeps slice + temp), c3b (live tab, no temp folder), c3c (pane list unavailable), c4 (no recorded tab keeps slice), c7 (manual merge dispatch lock), c8 (tab_closed re-dispatch keep). Host test stayed green (reconcileHost has its own loop). | Wider than predicted: c4 and c7 also red — skipping unfinished leaves in the loop kills the `unfinished leaf` keep (c4) and the post-dispatch `live tab` keep (c7). No predicted-red stayed green, so no mismatch per A4. | `check break-b1: 1 .../implementation/check-break-b1-1792118356677-4065605.log` |
| B1-needspanes — candidates filter `finished(leaf) || tab !== undefined` → `phase === 'merged' || phase === 'failed'` | c3b `an unfinished leaf with a live tab and no temp folder keeps its slice` | 1 red: exactly c3b (`stop` call appeared because needsPanes returned false → live = null → no `live tab` keep) | Match | `check break-b1-needspanes: 1 .../implementation/check-break-b1-needspanes-1792118400546-4088230.log` |
| B2 — delete `if (leaf.state.tab === undefined && !finished(leaf)) return 'unfinished leaf';` | c4 `an unfinished leaf with no recorded tab keeps its loaded slice` + criterion-6 host test | 2 red: c4 (slice stopped) and c6 `the host slice step keeps unfinished leaf slices under the same tab rules` (host no-tab slice stopped) | Match | `check break-b2: 1 .../implementation/check-break-b2-1792118420104-4100108.log` |
| B3 — delete the `loadedSlices === null` keep block in the leaf-temp branch | c5 `an unreadable unit list keeps merged, failed and unfinished leaf temps` | 1 red: exactly c5 (temps deleted, `existsSync(temp)` false) | Match | `check break-b3: 1 .../implementation/check-break-b3-1792118436355-4110667.log` |
| B4 — re-add `if (match !== undefined && !finished(match.leaf)) continue;` in reconcileHost | c6 `the host slice step keeps unfinished leaf slices under the same tab rules` | 1 red: exactly c6 (expected `stop <goneSlice>` absent — unfinished leaves skipped) | Match | `check break-b4: 1 .../implementation/check-break-b4-1792118455318-4122301.log` |
| B5 — unwrap `withLock` in dispatchMergeLeaf manual branch | c7 `a manual merge dispatch holds the global lock while it records the tab and adopts seats` | 1 red: exactly c7 (busctlCalls 3 vs 2 — the unlocked concurrent pass adopted an extra seat mid-dispatch) | Match | `check break-b5: 1 .../implementation/check-break-b5-1792118470708-4133564.log` |

## Final green

`check cfix-final: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-cfix-final-1792118483856-4141685.log` — 11 pass, 0 fail, 74 expect calls.

## Notes

- No commits made. No edits under `tests/`.
- B5 was red on the first run, so the timing-sensitive re-run clause did not apply.
- B1's extra reds (c4, c7) are consistent with a broader break (whole unfinished-leaf skip, not just the tab-gone keep); recorded verbatim per A4.
