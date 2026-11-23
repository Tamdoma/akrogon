# Design C: wake-cost final shape

## 1. `readTimings` and `repoInventory` callers

- **`readTimings` in wake (3 sites — all eliminated):**
  1. `src/next.ts:703` (`processLeaf` checks if `visit_start` ever fired for `slug`) → store `visited?: true` in `state.yaml` (`src/state.ts:126`), set on first `visit_start`.
  2. `src/timing.ts:141-144` (`recordWait`, called at `src/next.ts:674,728,765,772,1023` — main culprit) → dedupe against `state.wait?.reason` instead of `waitReasonAt(readTimings(...))`, writing `wait: { reason, at }` on change and clearing on `'none'` / prompt / move.
  3. `src/next.ts:840` (`resumeRepos` calls `capacityWaits(readTimings(...))` for FIFO refill order at `:861-867`) → read `{ slug, at: state.wait.at }` from open leaves where `state.wait?.reason === 'capacity'`.
  - Non-wake callers (`src/timing-report.ts:234,331`, `src/status.ts:116`) keep reading `timings.jsonl`.
- **`repoInventory` / `allLeaves` callers (open-only vs closed):**
  - **Open-only (`['open']`):** `src/run-check.ts:187`, `src/verify.ts:641`, `src/config.ts:511`, `src/phase.ts:319,975`, `src/reconcile.ts:281`, `src/stop.ts:64` (already `['open']`), and `src/next.ts:109` (`discover`, feeding `:386,818,845,864,882,891,1006,1015,1042,1074,1116`).
  - **Need closed slugs:** (a) `src/next.ts:677` → `blockDetail` (`src/turn.ts`) only needs to know if a `blocked-by` slug exists under `issues/closed/` (skip entirely when `blocked-by` is empty); (b) `src/reconcile.ts:1307` (`reconcileHost`, once per host pass) needs closed slugs for `leafSlice` cleanup; (c) `src/status.ts:88,742` and `src/timing-report.ts` (explicit CLI).

## 2. Residue audit (historical rows verified on disk)

Both `akrogon` and `framework` historical JSONL files **still contain** `reused` (`verify-runs.jsonl`), `members` (`merge-attempts.jsonl` & `timings.jsonl`), and `held`/`reuse`/`ejected` (`merge-attempts.jsonl`), and all schemas are `z.strictObject`:
- **Delete outright:** `Batch.decision` (`src/state.ts:83` — 0 readers/writers, 0 open leaves carry it); dead `issues/red-records.jsonl` files on disk (0 code/test/doc refs anywhere in `src/`/`tests/`).
- **Keep in READ schemas, narrow WRITERS only:**
  - `src/attempts.ts:8,35` (`split`/`held`/`reuse`/`ejected`, `members`) and `src/timing.ts:69` (`members`): must stay in read schemas so historical rows parse (and `src/timing-report.ts:354` reads old `ejected` rows); narrow `appendAttempt` write outcome type to `'merged' | 'red'` and drop any dead writer params.
  - `src/verify.ts:79` (`reused`): no writer remains, but keep `reused?: string` in `verifyRunSchema` **and** keep the `item.reused === undefined` read filters (`src/verify.ts:226,333,364,459,470`, `src/flaky.ts:120,158`) so historical reused rows aren't miscounted as fresh runs in `flaky` / `normal_ms`.

## 3. Measured cost on this host (before vs expected after)

| Repo | `timings.jsonl` | `readTimings` | Full `repoInventory` | Open-only `repoInventory` |
|---|---|---|---|---|
| `akrogon` | 5.26 MB (19,950 rows) | 46 ms | 21 ms (0 open / 289 closed) | **0 ms** |
| `framework` | 28.92 MB (102,537 rows) | **189 ms** (398 ms load) | **55 ms** (4 open / 1,112 closed) | **1 ms** (55×) |

- **Per `next --wake` (under global `.lock`):** today ~10–38 `readTimings` + ~15–25 full `repoInventory` = **~3–18 s** of synchronous parsing (plus **54 ms** wasted on every `run-check` in `framework`). **After:** 0 `readTimings` + ~20 open-only walks = **< 50 ms** (~60–300× faster) and `run-check` drops 54 ms/call.

## 4. Fewest-parts shape & open forks

1. **Wake state (`src/state.ts:126`, `src/timing.ts:141`, `src/next.ts:703,840`):** add optional `visited` + `wait: { reason, at }` to `stateSchema`; remove all 3 `readTimings` calls from wake.
2. **Open-only inventory (`src/state.ts:266`, `src/next.ts:109`, `src/run-check.ts:187`, `src/verify.ts:641`, `src/config.ts:511`, `src/phase.ts:319,975`):** walk `['open']` everywhere closed leaves aren't needed; resolve closed `blocked-by` targets only when `blocked-by.length > 0`.
3. **Residue:** delete `Batch.decision` (`src/state.ts:83`) + dead `issues/red-records.jsonl`; narrow `appendAttempt` writer while keeping read schemas intact for old rows.

**Open forks:**
- **F1 — `stateSchema` (`z.strictObject`) rollback:** (a) 2-release rollout (R1 accepts optional `visited`/`wait`, R2 writes them) vs (b) 1-release deploy (breaks rollback if any open leaf carries the new keys). **Pick: (a).**
- **F2 — Closed `blocked-by` lookup:** (a) per-slug check (`issues/closed/` folder match only when `blocked-by.length > 0`, 0 ms on unblocked leaves) vs (b) one cached `closedSlugs` dir scan per `Invocation` (~2 ms). **Pick: (a).**
