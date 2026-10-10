# Review A: merge-attempt-pressure

Base `1d7d536`, reviewed head `333f645`. `debate: no`, so no positions/rebuttals expected or consulted.

## Verified

- Diff `1d7d536..333f645` = `b3d77fe` (code + docs) + `333f645` (tests, `Test-Change:` trailer correct — added cases, no existing expectation changed).
- Read placement matches criterion 3: `phaseCommand` reads `end` lazily inside the `else` after `batchCheck`, before `git fetch`/`saveState`/`writeHeld`/`git push`/`memberEntries` restores in every ending; `end` rides `BatchPending` so `finishPush` reuses the pre-push snapshot; `mergeTurn` reads inside `withLock` before `dropHeld`; `reconcileBatch` reads before the landed branch. `--check` never reads.
- Lazy read confirmed: `record.pressure_start === undefined ? undefined : readPressure(dir)` — pre-change batches never touch the dir; the criterion-2 test proves it against a malformed dir.
- Injection via trailing `pressureDir` param, threaded `phaseCommand`/`nextCommand`/`mergePass`/`mergeTurn`/`reconcileBatch`/`mergeWake`/`unpausePass`; all call sites verified by grep — no caller misses the param, `akrogon.ts` untouched. No env var or config key (brief requirement).
- `boot_id` resolves via `dir/../sys/kernel/random/boot_id` — one fake dir covers both inputs in tests.
- `pressure` diffs asserted as exact integers in 7 criterion-1 tests (merged, reuse-after-restack, solo red, split, held, ejected, reconciled merged); absence in 3 criterion-2 tests; stop-before-irreversible in 2 criterion-3 tests (stderr names `<dir>/cpu`, no line, batch/remote unchanged). Tests spawn real `phaseCommand`/`nextCommand`/`mergePass` — real boundary, no mocks.
- Docs: `docs/guide/files.md` `pressure` bullet (unit + three absence states) and `docs/guide/state.md` `pressure_start` in the batch sentence. Grep found no other doc/skill enumerating attempt or batch fields.
- Path listing: all 8 diff-touched paths exist from repo root. Live `/proc/pressure` probe: `readPressure()` + `appendAttempt` into a scratch repo produced a valid line with `pressure` deltas (0/0/0 on an idle host). 658 tests, typecheck, format all green on the lane.

## Findings

- N1 (Nit): `reconcileBatch` and `mergeTurn` read `readPressure` unconditionally once `pressure_start` exists / on every creation-turn entry — the read also runs on paths where no `appendAttempt` follows (`batch.recorded === true`, held-turn early return). Consequence today: wasted procfs reads, and a malformed PSI could abort a reconcile that would not have appended. Deferred: malformed PSI on a batch with `pressure_start` blocking is arguably intended strictness (criterion 3 says a malformed file stops the ending call); the wasted read is microseconds. Would promote to Fix only with evidence of a real reconcile blocked by PSI on an already-recorded batch.
- N2 (Nit): `batchPush`/`finishPush` take `pressureDir` without using it (`end` arrives via `BatchPending`). Consequence today: none; typecheck clean. Deferred: plan D6 mandated symmetric threading and dropping it would break the injection seam the tests rely on for future end-read sites; a dead param is a style nit only.

## Verdict

nits — both findings are deferred concerns without a concrete defect today; every done-criterion carries a passing test and the checks all pass.
