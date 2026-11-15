# Review A: cleanup-last-in-pass

Base: `50d925f2d952fcfca06db529b49b9cfe21efe22c`. Reviewed head: `a47c26959831de2d3d8a02335d20b63483c4b918` (`origin/main..HEAD`: product fix `51fb66fa`, test additions `0aad47de`, test correction `09b563d6` + format `a47c2695`).

## Evidence read

- `implementation/report.md`: C1/C2 red on base (`check-cleanup-last-c1-1794236108418-2654528.log`, `check-cleanup-last-criteria-1794236102205-2647180.log`), green on head (`check-cleanup-last-c1-after-1794236192955-2723598.log`, `check-cleanup-last-c2-after-1794236196864-2727598.log`); retention files 61 pass (`check-cleanup-last-retention-1794236210492-2730884.log`); `akrogon verify` green on head a47c2695 (1148 tests, `check-test-1794236525694-3554339.log`). Two inconsistent suite reds recorded with both logs each (door-reset agy stages, next merged-phase closes tab). Credible and complete.
- Diff read against src/next.ts, src/reconcile.ts, src/phase.ts, tests; plan D1–D7 traced.

## Findings

**Fix 1 — `touched.size > 0` suppresses cleanup the base ran.**

Source: `src/next.ts` `nextCommand`. On the base, every selection mode that entered the gated block called `reconcileRepos(...)` unconditionally; an empty repo list still ran `reconcileHost` over every registered repo (src/reconcile.ts: `reconcileRepos` → `reconcileHost(registeredRepos(readGlobal(), ...))`), removing orphan loaded slices, failed `akrogon-run-*` units and host leftovers while keeping leaf-matched slices via `!acting.has(...)` and writing `reconcile-host.json`.

On the head, `if (touched.size > 0)` skips the call entirely when no repo was touched: `next --resume`/`next --wake` with every registered repo paused (`active` empty), or zero registered repos. `akrogon listen` enqueues `next --wake` on every turn end, blocked status and terminal exit (src/listen.ts:93) — so while the operator has all repos paused, each wake event still produced a host sweep on the base and now produces nothing. Consequence today: orphan `akrogon-*` slices and filesystem leftovers (e.g. dead leaf slices whose folders are gone, `akrogon-l*` empties, retired locks and tmp dirs) stop being removed for the duration of a full pause, and the `Kept:`/`akrogon leftovers` host report goes stale, where the base kept cleaning them on those same events. Hits the brief's contract that cleanup runs "once per invocation ... for the same repos ... as today": the head runs it fewer times than the base. Repair is the plan's own shape: the outer `selection === undefined || leaves.length > 0` gate already scopes the block (plan D1); drop the `touched.size > 0` guard so `reconcileRepos` runs unconditionally after the merge loop.

## Confirmed non-findings

- `unpausePass` `try/finally` restores the base guarantee (cleanup runs even when `mergePass` throws); `reconcileBatch`/`mergeTurn` already take the lock internally, so the moved call takes it after the loop, never nested — D2 held.
- `.some(e => e.isAutomatic)` is uniform per invocation by construction (selection/`--all` → false, `--resume`/`--wake` → true); the recheck `isAutomatic && isPaused` inside `reconcileRepos` still honors a pause raised during the merge step — D1 held.
- `mergeWake` untouched — D3 held. `broadcastPass`/`renameTabs`/`mergeTurn` need no earlier cleanup — D4's trace holds; the vanished-worktree ordering delta self-heals within one pass as planned.
- `docs/use/park-pause-stop.md:57` corrected; the `docs/` + `src/AREA.md` grep shows no other ordering claim (`docs/reference/state-and-phases.md:124` names `reconcileBatch`, unaffected). No AREA.md files are in the diff. `docs/reference/commands.md` states no order — unaffected.
- `tests/reconcile.test.ts` correction keeps the `batch` veto exercised by a surviving record (`owner: 'command'` + live `akrogon-land-a1.service` in fake systemctl); assertions and siblings unchanged; green on head. A change with a cited source (the design's ordering-dependent-expectation rule), so it passes the test-change bar.
- New criterion tests assert at the real boundary (CLI against fixture repo, private hc core, fake systemctl); C1 asserts after one invocation; C2's second pass asserts removal-lessness (empty `readRemoved`, byte-identical state, zero mutating hc calls). No mocks of the unit under test.
- The `tab.close` filter in C2's pass-2 shim-log read does not cover `do` calls, but pass-2 state equality and `readRemoved` catch a stray close's effects; no defect.

## Missing env

`akrogon status` carried no `Missing:` blocker for this leaf's proofs; none needed.

## Verdict

`fix` — one Fix (the `touched.size` gate).
