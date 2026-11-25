# Rebuttal: slot C, chart merge-test-facts, fork test-facts

Target: `issues/chart/merge-test-facts/slots/fork-test-facts-merged.md` (2026-11-25).
Disagreements and added evidence on `## Points where slots differ` only (items 1, 2, 4, 5, 6; item 3 agrees with the merge-only majority).

---

## 1. K value: reject 10 (A) and <=20 (B); lock K=50 (with D)

- **Evidence:**
  - Tier 1 (measured 17 open full framework `check-verify-*.log` files, 2026-11-25): K=10 cuts off at 31.9–35.3 s (~1.2 KB/row); K=20 cuts off at 17.5–26.9 s, median 17.9 s (~2.4 KB/row); K=50 cuts off at 6.0–13.3 s, median 6.5 s (~5.9 KB/row). Across all 17 logs, `capture-review.test.ts` (the seed's own `INTAKE.md` `## Observation` target, 88–169 s under load vs 3.3 s alone) now runs 5,968–12,241 ms and ranks #42–#103 (median #48).
  - Tier 1 (Bun 1.4.5 benchmark on 1,567 merge-row payloads, 2026-11-25): K=50 (+7.74 MB total across 1,567 rows) parses+Zod-validates in 18.4 ms and stringifies in 6.6 ms (comparable to K=20's 26.0 ms / 3.0 ms and smaller than the current 2.7 MB ledger's 44.7 ms). Under merge-only scope (Q4b, ~54 merge runs/day recent), K=50 adds ~318 KB/day (~9.5 MB/month), vs ~130 KB/day (~3.9 MB/month) at K=20.
- **Consequence if built with K=10 or K=20:** Every test in the 6–35 s band — including the seed's `capture-review.test.ts` once heavy load subsides — drops off the record into a coarse `<= 18–35 s` bound, blinding operators to regressions creeping from 6 s to 15–30 s to save only ~3.5 KB/row (~5.5 MB/month).

## 2. Failures always in the duration list: reject "no" (A); add evidence for "yes" (B, D)

- **Evidence:**
  - Tier 1 (observed real framework log `check-verify-1795566622096-2368929.log`, 2026-11-25): `first-publication holder cleanup with no cycle history does not enter deploy preflight` timed out at `5009.97ms` (`^ this test timed out after 5000ms.`). That duration sits **below** K=50's median cutoff (6,451 ms) and far below K=10/K=20; assertion failures typically run 0.1–500 ms.
- **Consequence if built without always including failing tests:** Even real Bun timeouts (at Bun's 5,000 ms default) lose their duration in `verify-runs.jsonl`, failing the seed's requirement to know how long failing tests ran. Unioning timed failing tests on top of K costs ~100–300 B only on red rows (typically 1–3 failures).

## 4. `samePass` gains `caller.attempt`: disagree with keeping `samePass` attempt-blind (A, B, D)

- **Evidence:**
  - Tier 1 (source read `src/verify.ts` `samePass`, `passOnce`, `runOnce`, and `src/phase.ts` `recordTested`, `landGates`, 2026-11-25): `samePass` omits `caller.attempt`. When `land` crashes mid-verify and `mergeTurn` starts a new attempt on the same tree while the detached `akrogon-verify-<id>` service is still running — or when a manual non-attempt `verify` on the leaf worktree is already live when a land attempt starts — the new attempt joins the live pass. If that joined pass exits **red**, `landAttempt` exits via `repairExit` before `recordTested` runs, so `attempt.tested_top` is never set (observed absent on 91 of 92 red attempts since 2026-11-21 in `framework/issues/merge-attempts.jsonl`).
- **Consequence if built without `caller.attempt` in `samePass`:** A red attempt that joined a live pass launched without an attempt (or by a prior crashed attempt) has neither a `verify-runs` row carrying its `attempt` id nor a `tested_top` fallback — reproducing the exact unjoinable-red-attempt failure mode `#154` fixes. Including `record.caller.attempt === key.caller.attempt` in `samePass` is a 1-line guard that guarantees every attempt that runs verify owns its own `attempt`-tagged row.

## 5. Where the full run's duration list sits on a rerun row: reject splitting durations onto `rerun` (A); place full-run durations at top level only

- **Evidence:**
  - Tier 1 (observed framework `verify-runs.jsonl` row `a538e572` and logs `check-verify-1795566622096-2368929.log` vs `check-verify-1795566622932-2368929.log`, 2026-11-25): On a rerun row, the first leg (`rerun.log`) is the 4.1 MB / ~12,000-test full suite, while the second leg (`cmd.log`) is a 2.2 KB / 1-test rerun. Across framework `verify-runs.jsonl`, 19 of 1,562 merge runs (1.2%) carry `rerun` — disproportionately the exact flaky-timeout rows `#154` investigates (e.g., `a538e572`).
  - Tier 1 (source read `src/verify.ts` `commandRow`, 2026-11-25): The top-level command row is already a combined command summary (when the rerun exits non-zero without named failures, top-level `failures` keeps the first run's `failures`), while `rerun` exists specifically to retain the superseded red verdict (`exit`, `log`, `failures`, and now `timeouts`) for `src/flaky.ts` flip counting.
- **Consequence if built following A's leg-split (top-level durations from rerun, full-run durations under `rerun`):** Every duration reader that inspects `cmd.durations` without a `cmd.rerun?.durations ?? cmd.durations` branch silently ingests 1–3 test rerun timings on the exact 1.2% of merge runs where a load timeout occurred, and the schema duplicates the duration field onto `rerun` against signpost `3a`. Always parsing top-level `durations` from `first.output` (and adding no `durations` field to `rerun`) keeps one uniform read path and one smaller schema.

## 6. Duplicate titles: reject stream-qualified titles (B, D options); dedupe bare titles keeping max `ms` under `failureNames`' rule (with A)

- **Evidence:**
  - Tier 1 (measured `check-verify-1795553672666-2146688.log` and source read `src/flaky.ts` `failureNames`, 2026-11-25): Of 12,097 `(pass)`/`(fail)` lines, 12,082 are unique by bare title and 12,084 by `(prefix, name)` — stream qualification disambiguates only **2 of 11** duplicate titles. The other 9 occur *within the same stream* (mostly `test.each` literal `%s` titles such as `timeout child closes its browser and removes scratch on forced failure=%s` in `test:audit-design-impeccable` at `24191.09ms` and `4121.87ms`). Meanwhile `failureNames` emits bare titles (qualifying only `(unnamed)` with the stream's innermost token).
- **Consequence if built with stream qualifiers on duration names:** Breaks exact string joins between `durations[].name` and `failures[]`/`timeouts[]`, bloats every duration entry by ~20–35 bytes (+1.0–1.75 KB/row at K=50), and still fails to deduplicate 9 of 11 collisions (requiring max-`ms` deduplication anyway).
