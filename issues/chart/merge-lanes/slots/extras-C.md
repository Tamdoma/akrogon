# Fork notes: extras (slot C)

Date: 2026-11-21. Blind notes on `forks/extras.md` Q1–Q3 against locks in `forks/signposts.md` `## Taken` (1a speed from first entry, no new red on main, PC inside limits, token cost does not grow; 2a; 3a; 5a) and `forks/red-exit.md` & `forks/waiting-seats.md` `## Taken`.

---

## Q1 — Are D1 and D2 removed by `red-exit` Taken 1?

- **Pick**: **Yes — both D1 and D2 are removed from the merge line by `red-exit` Taken 1 and need no separate leaves, only regression tests in the `red-exit` leaf plus a 1-line crash-window hardening in `reconcileBatch` (`src/next.ts:873`).**
  - **Reason**:
    - *D1*: Removing seat-owned `batchPush` (`red-exit` Taken 1) removes the 11-18 race (`built-link-orphans`, `consent-ad-signals`) completely because command-owned batches are already guarded by `landAlive(batch.attempt)` throughout `batchPush -> finishPush -> restack` in `reconcileBatch` (`src/next.ts:896`) and `mergeTurn` (`src/next.ts:946,985`). One tiny residual window remains if `akrogon-land` itself crashes mid-`finishPush` after `batchPush` wrote `{ applied: false, candidate: head }` (`src/phase.ts:775-785`): `reconcileBatch` (`src/next.ts:873`) checks `record.applied === true && record.candidate !== undefined` and returns early, letting `mergeTurn` overwrite `batch` without checking whether `candidate` landed. Changing `:873` (and `:893`) to check `record.candidate !== undefined` closes that crash window in 1 line.
    - *D2*: Removing seat prompts in `merge` removes D2 from the merge line completely. Ledger trace of `status-page-schema-graph` (`2026-11-21T07:33:47Z..09:34:36Z`) shows B remained alive/unpromptable while `merge_turn`/`none` flipped every ~30s for 2h01m until `seat_lost` fired at `09:34:36Z` (meanwhile 521 events ran on other leaves until `checker-command` filled `max_active` at `08:09Z`). Under `red-exit` Taken 1, `land` moves the leaf to `check.repair` and immediately starts the next holder; a stuck seat in `check.repair` affects only that leaf and is already guarded by `observeBusy` (`src/next.ts:146,202`, 60m notice) and `seat_lost`.
  - **Cost**: Two regression tests in the `red-exit` leaf (a dead/unpromptable B seat on red exit does not delay the next holder; a dead `land` with `candidate !== undefined, applied: false` reconciles ancestry before starting a new batch) and a 1-line guard update at `src/next.ts:873,893`.
  - **Consumers whose behavior changes**: `src/next.ts` (`reconcileBatch` `:873,893` — reconciles any `inMerge` batch carrying `candidate !== undefined` once `landAlive` is false; `mergeTurn` already has no seat-owned batch path under `red-exit` Taken 1).
- **Rejected options**:
  - *Separate leaves for D1 and/or D2*: duplicates work `red-exit` Taken 1 already resolves by deletion and splits edits to `src/next.ts` (`reconcileBatch`, `mergeTurn`) across multiple leaves unnecessarily.
  - *No test / leave `:873` unchanged*: leaves the `land`-crash-mid-`finishPush` ancestry hole untested and unclosed.
- **Evidence**:
  - `better-than-training` · `src/next.ts:873,893,896,946,985`, `src/phase.ts:775-785` (2026-11-21) · `landAlive` guards command-owned batches during live `finishPush`/`restack`, while `:873` skips `candidate !== undefined` if `applied === false` after a `land` crash.
  - `better-than-training` · `framework/issues/timings.jsonl` (`2026-11-21T07:17Z..09:50Z`, read 2026-11-21) · `status-page-schema-graph` held the line for 2h01m (`07:33:47Z..09:34:36Z`) while 521 events ran on other leaves until `08:09Z` when waiting merge leaves saturated `max_active`.
- **Pitfalls & removals**:
  - *Single-leaf silent stall if a seat hangs in `check.repair` with a non-`working` status* (so `observeBusy`'s 60m `STALL_MS` at `src/next.ts:159` does not start counting): **Removal**: outside merge-lanes scope (general seat health); record if seen again in `check.repair`.
  - *Overlap with `failed-merge-resume`*: that open leaf also edits `reconcileBatch` (`src/next.ts:873`); `red-exit` builds on top of it after it lands.
- **Unasked question**: On `status-page-schema-graph` (`07:33Z..09:34Z`), why did `dispatchSlot` neither prompt B nor log a `Busy leaf` notice after 60m — was B stuck in `status === 'working'` with an already-shown notice, or in `status === null` (which bypasses both `observeBusy` at `:159` and `deliver` at `:557`)? Worth a quick post-chart note if another 2h silent seat stall occurs.

---

## Q2 — D3: Slow alarm baseline (`src/verify.ts` `decideSlow`)

- **Pick**: **In this chart's scope, as one small independent leaf** (`slow-alarm-baseline`), fixing `src/verify.ts` (`slowEligible` `:172-178` and `decideSlow` `:353-426`) with three surgical changes:
  1. **Green-only `slowEligible`**: require `run.commands.every((item) => item.exit === 0)` so fast-fail red runs (11 observed `<60s` runs in framework since `2026-10-28`) neither drag the rolling median down nor prematurely close an open slow episode as `recovered`.
  2. **Second drift check (14-day rolling-median floor)**: compare the current 20-run green rolling median (`med20`, from 5 runs) against `min(med20)` over the past 14 days (same `> 1.5× && >= +2m` bar). Zero persistent pin state, zero manual reset: ratchets down *immediately* when `suite-regrowth` drops verify from 13m to 5m, catches gradual step regrowth, stays open in `akrogon status` for up to 14 days while slower, and clears automatically once speed returns or after 14 days at a deliberate new permanent normal.
  3. **Spike recovery hysteresis**: close an open spike episode `recovered` only after 3 consecutive green eligible runs `<= 1.25 × normal` (not 1 run at `<= 1.5 × normal`, which closed `project-wrangler` at 1.46× on 11-12).
  - **Reason**: Verify is **91%** of merge lane time; preventing a repeat 5 -> 13m silent regrowth directly protects Lock 1a over the repo's lifetime and fulfills the explicit handoff from `suite-regrowth` (`suite-cuts.md` Q5 / `CHART.md ## Off route`). `decideSlow` is a ~75-line self-contained pure function in `src/verify.ts` with zero coupling to `red-exit` or `waiting-seats`.
  - **Cost**: ~40 lines in `src/verify.ts` + unit tests; `verify-runs.jsonl` schema needs no breaking change (the existing `slow: { ms, normal_ms, first, close, notice }` object works for both spike and drift episodes, with `normal_ms` holding the tripped baseline).
  - **Consumers whose behavior changes**: `src/verify.ts` (`slowEligible` `:172-178`, `decideSlow` `:353-426`), `src/status.ts` (`:118,684-692,898-911` — already renders any open `slow` episode with `first !== undefined && close === undefined`, no change needed unless naming drift vs spike).
- **Rejected options**:
  - *Record for its own chart*: leaves post-`suite-regrowth` ~5m merge speed unprotected against another silent climb, even though `suite-regrowth` explicitly handed D3 to `merge-lanes` and the fix is one small independent leaf.
  - *Pinned baseline reset only by an `accepted` close*: simulated on framework (`2026-10-28..11-21`), 20-run auto-`accepted` fires every ~12h in a busy repo (47–87 runs/day), silently marching the pin `4.3 -> 6.4 -> 9.0 -> 12.4m` and clearing `Slow merge:` from `akrogon status` before the operator acts (while removing `accepted` would alarm forever after a deliberate permanent test addition).
  - *Single longer run-count window (e.g., 100 runs)*: at 47–87 runs/day, 100 runs is only ~1.5–2 days and still absorbs 9-day drift; a 1000-run window reacts too slowly to real speedups like `suite-regrowth`.
- **Evidence**:
  - `better-than-training` · simulation over `framework` (405 green runs `10-28..11-21`), `akrogon` (73 green runs), and `lingua-relay` (50 green runs) `issues/verify-runs.jsonl` (run 2026-11-21) · 14d-min drift check produces **0 false alarms** in `framework` `10-28..11-11` and **0** in `akrogon`, opens in `framework` on **`2026-11-12`** (`6.87m vs 4.36m = 1.57×`), and stays open through **`2026-11-21`** (`13.45m vs 4.60m = 2.92×`); catches `lingua-relay`'s `0.20m -> 4.11m` growth.
  - `better-than-training` · `src/verify.ts:172-178,378` & `framework/issues/verify-runs.jsonl` (2026-11-21) · `slowEligible` currently accepts red runs, letting **11 fast-fail red runs (`<60s`)** since `10-28` pull the median down and trigger false `recovered` closes.
  - `better-than-training` · `/home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth/CHART.md ## Off route` & `forks/suite-cuts.md` Q5 (2026-11-21) · explicitly carried D3 to `merge-lanes`.
- **Pitfalls & removals**:
  - *Low-volume repos where 14 days spans fewer than 20 runs*: comparing `med20` against `min(med20)` over 14d could compare two overlapping 5-run windows. **Removal**: only run the drift check once `>= 20` green eligible runs exist in the repo, comparing current `med20` against `min(med20)` of full 20-run windows ending within the past 14 days (falling back to the spike check alone on brand-new/low-volume repos).
  - *Config change (e.g., adding a new `merge_checks` command)*: intentionally increases wall time. **Removal**: already handled automatically — after 14 days at the new duration, the older fast window ages out and the drift alarm clears cleanly with zero manual intervention.
- **Unasked question**: `suite-cuts.md` Q5 also carried that `verify-runs.jsonl` holds no per-command/per-script seconds (`src/verify.ts:66-80` omits `duration_ms` on `commands[]`, unlike `timings.jsonl` `check_end`). Should `slow-alarm-baseline` also record `duration_ms` on each `commands[]` entry in `verify-runs.jsonl` (trivial — `runOnce` already wraps each `checkedRun`), leaving internal sub-script parsing out of akrogon?

---

## Q3 — Receipt-free `landGates` before `verify`

- **Pick**: **Yes — run the receipt-free guards (`batchGuards` + `moveGuards`, ~0.2s) before `verify` in `src/land.ts:86`, and keep full `landGates` (including `recordTested`) after `verify`, folded into the `red-exit` leaf (NOT a separate leaf).**
  - **Reason**: `batchGuards` (`src/phase.ts:668-687`: `applied`, `requireBatchTop`, `requireNoIssueFiles`, `requireTestChangeCitations`, `retiredLessonsPresent`) and `moveGuards` (`src/phase.ts:380-390`: `refuseAbandonedCaptures`, `requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations`, `requireFrozenCitations`) need no verify receipt and run in ~0.2s. Calling them before `verify` in `src/land.ts` (already edited by `red-exit`) is ~5 lines of code reusing existing functions, and guarantees a dirty worktree, abandoned capture, missing `Test-Change:` trailer, or resurrected retired lesson never wastes a 5–13m merge suite.
  - **Cost**: ~5 lines extracting `landPreGates` (`batchGuards` + `moveGuards`) in `src/phase.ts:716` and calling it under `.lock` before `verify` in `src/land.ts:86` (~0.2s lock hold per attempt). Observed frequency is low (`0/248` attempts in `framework` `2026-11-14..21`, `3` all-time), which is why it should fold into `red-exit` rather than warranting its own leaf.
  - **Consumers whose behavior changes**: `src/phase.ts` (`landPreGates` extracted from `landGates` `:716-720`), `src/land.ts` (`land` `:85-101` runs `landPreGates` before `verify`, handing off `{ reason: 'gate', refusal, top }` to `check.repair` on failure, and keeps `landGates` after `verify`).
- **Rejected options**:
  - *Keep all guards after `verify`*: saves ~5 lines but burns a full 5–13m verify suite whenever a rebase introduces a trailer/lesson refusal or a waiting leaf's worktree gets dirtied before its turn.
  - *Run guards only before `verify` (drop them after `verify`)*: unsafe — a parallel process or abandoned capture could dirty the worktree or leaf folder during a 5–13m verify run.
- **Evidence**:
  - `better-than-training` · `src/phase.ts:380-390,668-720`, `src/land.ts:82-109` (2026-11-21) · `landGates` runs `batchGuards`, `moveGuards`, then `recordTested`; only `recordTested` calls `requireGreenReceipt`.
  - `better-than-training` · `framework/issues/{merge-attempts,timings}.jsonl` (read 2026-11-21) · `0/248` post-green hand-offs in `2026-11-14..21`; `3` all-time (`template-anchor-ids` and `price-cell-evidence` 2026-11-05, `print-plan-dirty-tree` 2026-11-13) because `check.review`/`check.repair -> merge` already run `moveGuards` (`src/phase.ts:438`) and `buildStack` strips retired lessons (`src/batch.ts:105`).
- **Pitfalls & removals**:
  - *`landPreGates` refusal has no `red` verify run id*: **Removal**: `red-exit` Taken 1 & 4 already separate `gate` exits from `red` exits (carrying `refusal` + `top`, and still requiring a leaf receipt on `check.repair -> merge` since `red` skip applies to red exits only).
  - *`refuseEnclosingCompletion` (`src/phase.ts:757`)*: still runs inside `batchPush`; could also fail fast before `verify` if desired, though self-close happens only inside a `run-check` capture on akrogon itself.
- **Unasked question**: On a `land` loop after a non-fast-forward `restack` (`src/land.ts:106-107`), `landPreGates` runs again automatically on the new top before the 2nd verify — confirming that loop placement at the top of the `for` loop (`src/land.ts:84`) covers both initial and restacked tops in one call site.
