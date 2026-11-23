# Per-test time limits (slot C)

## Measured baseline from akrogon logs

- **5 recent direct `check-test-*.log` runs (`land-own-reds`, 6,758 passing test observations, 1,351–1,352 tests/run):**
  - Passing durations: `p50 = 784 ms`, `p95 = 4.77 s`, `p99 = 11.07 s`, `p99.9 = 18.04 s`, **`max = 24.99 s`** (26 passes >15 s, 5 passes >20 s).
  - Even on the fastest run (`p50 = 394 ms`, wall `202 s`), one valid test (`an unreceipted due is resent once then dropped...`) takes **`24.7–25.0 s` on all 5 runs** — only **3 s** below `WAIT_MS = 28 s` and **5 s** below `--timeout=30000`.
  - Under load (run 5: wall `353 s`, `p50 = 1.48 s`, `p99 = 15.11 s`), ordinary git-worktree tests stretched to **`18.0–18.4 s`** and still passed.
- **`issues/verify-runs.jsonl` (573 completed runs):** green `p50 = 128 s`, `p95 = 245 s`, `max = 547 s`; red `p50 = 147 s`, `p95 = 430 s`, `max = 988 s`.
- **Conclusion:** Yes — **30 s is arbitrary and too tight** (inherited from `03f1aa5a`, 2026-10-02). Sitting 5 s above the real passing tail turns a deadlock guard into a false-red generator (67% of recent red runs in `F-load`).

---

## 1. What a per-test limit is for, and what happens with no limit

**Verified on `one-test-cap` (`src/run-check.ts`, `src/verify.ts`, `src/land.ts`, `src/scope.ts`):** neither `run-check`, `verify`, nor `land` has **any** outer command deadline (`TimeoutStopSec=5` only bounds SIGTERM→SIGKILL after a stop; `src/listen.ts:17` `PASS_DEADLINE_MS = 20 m` only kills `akrogon next`, never `akrogon-verify-*` or `akrogon-land-*`).

With **no per-test limit (`--timeout=0`)**:
1. A genuine deadlock (lost `hc` event, wedged `flock`, hung child) holds `akrogon-verify-<id>` and the repo's **land hold** (`src/admission.ts:126`) **indefinitely**, freezing the merge lane until manual intervention.
2. Even if an outer suite deadline (e.g. 15 min) killed `bun test` instead: external SIGKILL prints **no `(fail) <title>` line** (`(no test name)` in `src/flaky.ts:48`). That breaks **P1 unit rerun**, breaks **`akrogon flaky`**, breaks **`mainRedCover`**, forces `check.repair` to guess which of 1,352 tests hung, and skips `finally` cleanup (leaking `hc` cores and zombies).

**What a per-test limit IS for:** a **deadlock circuit-breaker + fault locator + cleanup trigger** (rejecting `WAIT_MS` inside the test so `try/finally` stops its `hc` core before Bun abandons the `await`). It is **not** a performance budget (`merge-slow` in `verify-runs.jsonl` already catches suite speed regressions).

---

## 2. A bigger fixed limit (60 s vs 120 s)

- **60 s (`WAIT_MS = 55 s`):** Gives ~2.4x margin over the 25 s timer test and ~3.2x over 18 s loaded tests — likely enough on this 32-core PC after `4×5`, but still tight on an 8-core PC or a 3x I/O spike.
- **120 s (`WAIT_MS = 115 s`):** Gives ~4.8x margin over the 25 s test and ~6.5x over 18 s loaded tests — clears virtually every load spike on both 32-core and 8-core PCs once concurrency is bounded.
- **What it hides:** Only single-test regressions between 30 s and 120 s — which a per-test timeout should not police anyway (random merge reds are the wrong alert for a 40 s test; suite duration / `merge-slow` is the right one).
- **What a real hang costs (key asymmetry):** With `4×5` (20 tests in flight across a ~200 s suite), one hung test runs in parallel with the other 19. A hang starting in the first half of the suite finishes at `t + 120 s <= 200 s` (**0 extra wall seconds**); a hang in the final minute adds at most ~60–90 s, and real hangs are rare (~1–2% of runs). By contrast, a single false 30 s timeout costs an entire red land + bounce + repair seat + re-verify (**15–30 min + LLM spend**).

---

## 3. Adaptive limit vs bounding load + one fixed number

- **Adaptive to live `/proc/loadavg`:** Bad — load swings `15 → 80` *mid-suite* (`INTAKE.md:24`), so caps decided at start are wrong minutes later and non-reproducible across runs.
- **Adaptive to historical per-test durations:** High part count, cold-start/new-test gaps, output-parser coupling, and self-poisoning feedback when slow runs inflate future caps.
- **Scale CONCURRENCY to the PC, not the timeout:**
  - Bounding concurrency to the host (`parallel = max(1, floor(cores / 8))`, `--max-concurrency=5`, plus host heavy-run cap `N = max(1, floor(cores / 12))`) keeps per-test CPU share roughly invariant across PCs (~1–2 cores/test on both an 8-core laptop and a 32-core workstation; only total suite wall time scales with cores).
  - Once contention is bounded, **one generous fixed deadlock cap (`120 s`) fits every PC** with zero dynamic state, zero nondeterminism, and zero new moving parts.

---

## 4. Pick, rule, and proof

- **Pick:** Keep a per-test deadlock cap, raise it from `30 s` to **`120 s`** (`--timeout=120000` in `issues/config.yaml:9`), and set **`WAIT_MS = SUITE_TIMEOUT_MS - 5_000`** (`115_000 ms`, giving `finally` 5 s instead of 2 s to stop `hc` cores and remove worktrees under load). Pair with bounded concurrency (`--max-concurrency=5`, host-sized parallelism / heavy-run cap `N`) and `run-scratch` tmpfs.
- **Single source of truth catch (probed on Bun 1.4.5):** `bunfig.toml` `[test] timeout` is **silently ignored** by Bun 1.4.5 (just like `backend` in `#122`), so `--timeout=120000` must stay on the CLI in `issues/config.yaml:9`. To prevent drift with `tests/helpers.ts:22` (`SUITE_TIMEOUT_MS`), derive `SUITE_TIMEOUT_MS` from `issues/config.yaml` (or one env var) or guard equality in a unit test.
- **What proves it:**
  1. **Zero** load-timeout reds (tests failing at `WAIT_MS` or `120 s` that pass on rerun) across 20 consecutive akrogon verifies under normal multi-repo load (vs 67% of red runs in `F-load`).
  2. A synthetic deadlock test still fails with its exact `(fail) <title>` and cleans up its `hc` core with zero surviving descendants within `<= 120 s`.
