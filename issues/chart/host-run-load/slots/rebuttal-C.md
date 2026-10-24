# Rebuttal: seat C

R1. Detail 5 exempts too much. Every held run sets `AKROGON_RUN` for its children (`src/run-check.ts:223`), and any child matching a live record bypasses admission (`src/admission.ts:143-144`). So a verify started inside a non-full outer run runs its full command with no slot, overlapping the holder. Exemption should require the parent record itself to be full; a non-full parent holds nothing, so queuing the inner run cannot self-deadlock. The listed test covers only nested-inside-full.

R2. Details 1 and 7 understate full suites missed inside run-check. `--name` is caller-chosen, default `run`, and argv is never matched against the config command (`src/run-check.ts:141-162`). `run-check --name bisect -- npx vitest run` is unbounded. Starting values also mark 3 of 11 registered repos: lens and Himne `test`/`test_changed` are full vitest runs (lens `issues/config.yaml:9-10`, Himne `issues/config.yaml:8-9`), blepsis `test` likewise, all unmarked. Their seat and verify suites can still overlap a framework verify.

R3. Detail 2 frees the slot before the old suite's processes stop. `release()` writes state `ended` (`src/admission.ts:175-176`) at `src/run-check.ts:243`, before `await stopRunUnits(...)` at `:244`. A waiter counting only `live` records (`src/admission.ts:103`) can start while the previous suite's Chromium or workerd units are still stopping.

R4. Details 3 and 4 can starve on a stopped head waiter. Liveness is only pid start-time equality (`src/admission.ts:86-87`). A SIGSTOPped or zombie waiter still matches, never flips itself live, and blocks every younger waiter indefinitely. Nothing in 1-7 bounds or skips a live-but-not-progressing waiter.
