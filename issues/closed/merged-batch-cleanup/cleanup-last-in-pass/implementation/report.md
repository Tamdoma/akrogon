# Implementation report: cleanup-last-in-pass

Base: `50d925f2d952fcfca06db529b49b9cfe21efe22c` (`AKROGON_BASE`). Head: `a47c26959831de2d3d8a02335d20b63483c4b918` on branch `cleanup-last-in-pass`. Fetch+rebase at pass start: branch already up to date with `origin/main`; no commits moved.

## Changes

- `src/next.ts` — `nextCommand`: the three `reconcileRepos` calls inside the pre-merge `withLock` (single-leaf selection, both `--all` branches, `--resume`/`--wake`) were removed; one `reconcileRepos` now runs after the per-repo `mergePass`/`renameTabs` loop under a fresh `withLock`, over `touched` repos with the invocation's uniform `isAutomatic` (`.some`). `unpausePass`: sweep lock unchanged; `mergePass` then `reconcileRepos` inside `try`/`finally` + `withLock`, so a `mergePass` error still leaves one cleanup per invocation. `mergeWake` untouched.
- `docs/use/park-pause-stop.md` — line 57 reordered: merge pass, then the cleanup that waited.
- `tests/batch-dispatch.test.ts` — two new criterion tests (commit `0aad47de`): `the pass that releases a merged holder batch cleans up the holder in the same invocation` (criterion 1) and `the releasing pass leaves a merged holder fully cleaned for the next pass` (criterion 2).
- `tests/reconcile.test.ts` — corrected the `batch` refusal case (commits `09b563d6`, `a47c2695`): the pass now releases a dead record before cleanup runs, so a `batch` that must still veto old-worktree migration is seeded as `owner: 'command'` with a running `akrogon-land-a1.service` in the fake systemctl. The design sanctions this correction ("an existing test whose expectation depended on cleanup running before the merge step is corrected with its reason"). Old expectation: an `applied: false`, ownerless, `candidate`-less record still vetoes cleanup. New: a live command-owned attempt's record vetoes it.

## Proof results

| Criterion | Command | Head | Result |
|---|---|---|---|
| C1 | `bun test --timeout=60000 tests/batch-dispatch.test.ts -t 'the pass that releases'` | `51fb66fa` | green — batch gone, worktree path gone and unregistered, branch gone, `tab.close` issued, zero holder terminals. `check cleanup-last-c1-after: 0` (`implementation/check-cleanup-last-c1-after-1794236192955-2723598.log`). Red on base: `check cleanup-last-c1: 1` (`check-cleanup-last-c1-1794236108418-2654528.log`, `state.worktree` still recorded). |
| C2 | `bun test --timeout=60000 tests/batch-dispatch.test.ts -t 'the releasing pass'` | `51fb66fa` | green — one `merged` attempt line, batch cleared, worktree/branch/leaf-temp removed in pass 1; pass 2: `readRemoved` empty, state identical, zero mutating hc calls. `check cleanup-last-c2-after: 0` (`check-cleanup-last-c2-after-1794236196864-2727598.log`). Red on base: `check cleanup-last-criteria: 1` (`check-cleanup-last-criteria-1794236102205-2647180.log`). |
| C3 | `bun test --timeout=60000 tests/batch-dispatch.test.ts tests/pause-next.test.ts tests/hc-teardown.test.ts && bun test --timeout=90000 tests/green-merge.test.ts` | `51fb66fa` | 61 pass 0 fail. `check cleanup-last-retention: 0` (`check-cleanup-last-retention-1794236210492-2730884.log`). Covers unconfirmed publication, live land attempt, working broadcast seat, seat-owned completion tab, deferred unpause cleanup. |
| Focused | `bun test --timeout=60000 tests/next.test.ts` | `51fb66fa` | 196 pass 0 fail. `check cleanup-last-next: 0`. |
| Focused | `bun test --timeout=60000 tests/reconcile.test.ts` | `a47c2695` | 45 pass 0 fail. `check reconcile-file: 0`. |
| checks format | configured command | `a47c2695` | green. `check format: 0` (`check-format-1794236231721-2853481.log`). |
| checks typecheck | configured command | `a47c2695` | green. `check typecheck: 0` (`check-typecheck-1794236236128-2857221.log`). |
| verify | `akrogon verify` | `a47c2695` | green — format/typecheck/test, 1148 tests. `check test: 0` (`check-test-1794236525694-3554339.log`). |

`verify` wall time ~1 minute per run; the focused `next.test.ts` run ~12 s.

## Inconsistent checks (red on one run, green on retry, no cause in the diff)

- `tests/door-reset.test.ts` `agy: the reset helper runs its stages in order...` — red in `check test: 1` (`check-test-1794236313278-2863640.log`: stage log `started` only, later stages missing), green on same-command retry `check door-reset-retry: 0` (`check-door-reset-retry-1794236337516-3188878.log`). Timing-shaped; nothing in the diff (next.ts pass ordering, reconcile.test seed) reaches the door-reset helper.
- `tests/next.test.ts` `merged phase closes tab on typed next and starts the dependent` — red in `check test: 1` (`check-test-1794236439927-3239663.log`: dependent `attempts.A` 0, its seat start never confirmed inside the pass), green on retry `check next-closes-tab-retry: 0` (`check-next-closes-tab-retry-1794236457990-3550526.log`) and green in the full-suite rerun `check test: 0` (`check-test-1794236525694-3554339.log`). The seat-start confirmation is timing-sensitive; the same test passed in the earlier focused run `check cleanup-last-next: 0` on the same product code.

## Notes and limitations

- Known limits from the design kept verbatim: L1 (a no-broadcast `landedWake` landing whose unit still reads active keeps the batch until a later pass — pre-existing gap), L2 (a `mergeWake` releasing another holder's batch leaves that holder to the next event). The merged leaf's loaded slice still stops a pass after its tab close (slice scan precedes leaf handling inside `reconcile`); unchanged.
- Criterion 1's "no recorded seats" is observed as zero holder-labelled hc terminals (live or finished); `state.seat` refs persist by existing design.
- One ordering delta recorded in plan D4: a merge-phase leaf whose recorded worktree directory vanished now reaches `mergeTurn` with the stale record — `ensureWorktree` recreates a same-path directory, or throws the recorded path-vs-store mismatch which self-heals when the moved cleanup clears the record next pass. Same outcome, one pass later in a corner case.
- No env vars needed; `akrogon status` `Missing:` lines carried no blocker. No grants or paid operations used.
