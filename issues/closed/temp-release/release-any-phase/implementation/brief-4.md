# Sub-brief 4: execute deliberate-break proofs B1–B5 plus the needsPanes variant

Worktree: /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u4 (detached at `0bea6be`, the leaf head). Review finding F3 (review-B.md) requires each deliberate break in `plan.md` executed against the final proof content, with red/green commands and kept logs recorded.

## 1. Goal

For each break below: apply the edit in the worktree, run the criterion file through `akrogon run-check --name break-<tag> -- bun test tests/release-any-phase.test.ts --timeout=30000`, capture which tests go red, then `git checkout -- src/` (revert) and confirm `git status --porcelain src/` is clean. At the end run one full green pass `akrogon run-check --name cfix-final -- bun test tests/release-any-phase.test.ts --timeout=30000`. Commit nothing.

## 2. Acceptance criteria

- A1: every break's run-check citation (`check break-<tag>: <exit> <path>`) and the list of tests it turned red.
- A2: `src/` is clean (no residual break edits) when you finish; confirm with `git status`.
- A3: final green run cited with exit 0 and its log path.
- A4: if a break produces NO red where the plan predicted one, do not tune the test — report the discrepancy verbatim as a mismatch.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/plan.md` — breaks B1–B5.
- `/home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/review-B.md` — F1–F3, and the specific demand that a `reconcileNeedsPanes` break turns the isolated no-temp criterion-3 test red.
- `src/reconcile.ts` — `sliceKeepReason`, `reconcileNeedsPanes`, the per-repo slice loop (~line 488), the leaf-temp `loadedSlices === null` keep (~line 965), `reconcileHost` (~line 1060).
- `src/next.ts` — `dispatchMergeLeaf` manual branch (~line 1171).
- `tests/release-any-phase.test.ts` — the 11 criterion tests.

## 4. Breaks (apply one at a time, in `src/` only)

- **B1**: in `reconcile()`'s slice loop add `if (!finished(leaf)) continue;` as the first statement inside `for (const leaf of leaves) {` (~line 490). Plan predicts reds among: the criterion-1/2/3/8 tests and the criterion-6 host test.
- **B1-needspanes**: in `reconcileNeedsPanes` change `leaves.filter((leaf) => finished(leaf) || leaf.state.tab !== undefined)` to `leaves.filter((leaf) => leaf.state.phase === 'merged' || leaf.state.phase === 'failed')`. Predicted red: `an unfinished leaf with a live tab and no temp folder keeps its slice`. This is the isolation B required; it must go red.
- **B2**: delete the line `if (leaf.state.tab === undefined && !finished(leaf)) return 'unfinished leaf';` in `sliceKeepReason`. Predicted red: `an unfinished leaf with no recorded tab keeps its loaded slice` and the criterion-6 host test.
- **B3**: delete the `if (loadedSlices === null) { keep(dir, 'unit list unavailable', ...); continue; }` block in the leaf-temp branch (~lines 966-970, keep the `const slice` line and everything after). Predicted red: `an unreadable unit list keeps merged, failed and unfinished leaf temps`.
- **B4**: in `reconcileHost`, re-add `if (match !== undefined && !finished(match.leaf)) continue;` right after `const match ... = leafOf.get(slice);` (~line 1064). Predicted red: `the host slice step keeps unfinished leaf slices under the same tab rules`.
- **B5**: in `dispatchMergeLeaf`'s manual branch unwrap the `withLock` so it is `await dispatchLeaf(global, repo, leaf, false, invocation, mergeContext, false, attempt); return;` (~lines 1172-1174). Predicted red: `a manual merge dispatch holds the global lock while it records the tab and adopts seats`. Note this test is timing-sensitive; if it is green under B5, run it once more before reporting green-under-break.

## 5. Do-not

- No commits, no edits under `tests/` or in `plan.md`/`report.md`, no `akrogon verify`, no broad `bun test` of other files.
- Do not leave any break applied: after each run, `git checkout -- src/` and confirm clean.
- Never `pkill`/`killall` — stuck runs are reported, not pattern-killed.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`.
2. For each break in order B1, B1-needspanes, B2, B3, B4, B5: apply → run-check → record reds → revert → confirm clean.
3. Final full green run (`cfix-final`).
4. Write your results table to `implementation/brief-4-results.md` under the leaf folder (path below), then return the condensed report.

Advisory size: ~25 turns.

## 7. Commands

- `akrogon run-check --name break-<tag> -- bun test tests/release-any-phase.test.ts --timeout=30000` from the worktree.
- `git checkout -- src/ && git status --porcelain src/` after each break.

## 8. Done-when and report

Done when every break has a cited run, each red list is recorded, `src/` is clean, and the final green run is cited. Write the full table (break, predicted, actual reds, check citation) to `/home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/brief-4-results.md` and return it condensed.
