# Implementation report: merge-attempt-pressure

Base `1d7d536`, head `333f645`. Two commits: `b3d77fe` (U1 code + docs), `333f645` (U2 tests, formatted).

## Changed files and reasons

- `src/attempts.ts` — `PressureSnapshot`, `readPressure(dir='/proc/pressure')` (absent dir → `undefined`; present dir makes cpu/memory/io + `dir/../sys/kernel/random/boot_id` mandatory, malformed throws naming path), `pressure` field on `attemptRecordSchema`, `end?: PressureSnapshot` param on `appendAttempt` writing end-minus-start diffs only on matching boot id.
- `src/state.ts` — `pressure_start` optional on `batchSchema` (boot id + three counters).
- `src/next.ts` — `pressureDir` threaded through `reconcileBatch`/`mergeTurn`/`mergePass`/`mergeWake`/`nextCommand`/`unpausePass`; start read inside the creation `withLock` before `dropHeld`/`saveState`; lazy end read in `reconcileBatch` before the landed branch; `end` passed to all three `appendAttempt` sites.
- `src/phase.ts` — `pressureDir` on `phaseCommand`/`batchPush`/`finishPush`; one lazy `end` read inside the `else` after `--check`/`batchCheck`, before `redOnBase`/`culprit`/`batchPush`/split/red branches; `end` carried on `BatchPending` so `finishPush` reuses the pre-push snapshot.
- `docs/guide/files.md` — `pressure` bullet under `## merge-attempts.jsonl` (unit, three absence states).
- `docs/guide/state.md` — `pressure_start` added to the batch record sentence.
- `tests/merge-attempts.test.ts` — `psiFile`/`pressureDir`/`withStart`/`saveBatch`/`phaseBody`/`nextBody`/`mergePassBody`/`spawn` helpers plus 12 serial tests; existing expectations untouched (trailer on `333f645`).

## Criterion evidence

- C1 (merged/red/split/held/reuse/ejected + reconcile line carry exact deltas): 7 tests in `tests/merge-attempts.test.ts` — `bun test tests/merge-attempts.test.ts --timeout=30000` → 20 pass 0 fail [4.86s]. Exact integer diffs asserted; restack case asserts counters span creation (`reuse` outcome, deltas 10/20/40 from start 5/6/7 against end 15/26/47).
- C2 (old batch / no dir / boot-id mismatch → line as today): 3 tests — no-`pressure_start` even against a malformed dir (lazy read never opens), absent dir, changed boot id; each exit 0, one line, `pressure` undefined.
- C3 (malformed stops before irreversible): 2 tests — ending call exits non-zero naming `<dir>/cpu` and `total=`, no line, batch record unchanged, remote tip unchanged; creation via `mergePass` exits non-zero naming the path, no `batch` written, no line.
- C4 (docs/schema): bullets above; `docs-links` covered by full suite.
- C5 (blocking `checks`):
  - `bun run format` — clean; prettier rewrote `tests/merge-attempts.test.ts` (amended into `333f645`) and pre-existing drift in `src/status.ts`, which was reverted per the 2026-10-08 lesson.
  - `bun run typecheck` — clean.
  - `bun test --timeout=30000` — 658 pass, 0 fail, 33 files [55.08s] (~1 min wall).
  - `bun test --changed=$AKROGON_BASE --timeout=30000` — 533 pass, 0 fail, 18 files [50.64s] (~1 min wall).
- `merge_checks`: none configured; no whole run beyond the `test` check above.

## Worker returns (folded)

- U1 `bfca985` → `b3d77fe`: all 10 criteria met; noted limitation kept — `batchPush`/`finishPush` accept `pressureDir` without using it (`end` arrives via `BatchPending`), and `mergeTurn`'s start read can run once before the `heldNow` early-return (required by before-`dropHeld` ordering).
- U2 `761aaf0` → `333f645`: 12 tests; deviations were harness mechanics only (10-param arg padding, `attempt: 'a1'` required with slot B). Deliberate red check done and reverted.

## Known limitations

- `readPressure` throws raw `readFileSync` errors for missing/unreadable files (path included in the native error); parse failures get the custom path-naming error.
- Old batches on a host without PSI are never read (lazy), so a broken PSI surface cannot delay merges recorded before this change — criterion 2.
- Host-wide counters: stall recorded is machine-wide during the attempt window, matching the brief's #69 intent.

## Unverified criteria

None. All five done-criteria carry passing proof above.
