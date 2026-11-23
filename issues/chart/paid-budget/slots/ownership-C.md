**Pick: O3 — non-blocking `flock` (`flock -F -n -x`) on `${realRuntime}/akr-e2e-watch.lock`**, using `src/flock.ts:15-30`'s `tail --pid=$PPID -f /dev/null` pattern (kernel-released even on `SIGKILL`). O2 needs an operator grant change; O1 still strands `coreRuntime` on judge `SIGKILL` and weakens `absent()` by removing `coreRuntime` only *after* `absence.json` is written.

**Flow:**
1. Acquire `akr-e2e-watch.lock` non-blocking at `tests/e2e/watch-consults.e2e.ts:137` (fast refusal if contended), then one `try { check absent(); mkdtempSync; spawn body; teardown(); rmSync(coreState, coreRuntime, leafTemp); check absent() on BOTH; rmSync(out) + cpSync(control, out); } finally { release lock }`.
2. Closes **F21** (`<out>` replaced as a set under the lock), **F22** (startup throws and `SIGKILL` auto-release the flock with no stranded `coreRuntime`), and **F23** (no successor can enter `absent()` or create `coreRuntime` before the first judge finishes `absent()` and `<out>` publish, without exempting `coreRuntime` from `absent()`).

**Remaining race (exact interleaving):**
- `tests/e2e/watch-live.e2e.ts` and `tests/e2e/watch-stop.e2e.ts` share `akr-e2e-watch` through `startWatchTier` (`tests/e2e/watch-tier.ts:66`), which takes no lock. Interleaving: `watch-consults` finishes `rmSync(coreRuntime)` (`watch-consults.e2e.ts:120`) → `watch-live` runs `startWatchTier` and creates `coreRuntime`/`coreState` → `watch-consults` runs `absent()` (`:127`) and fails on `watch-live`'s files. Fix: take the same flock in `watch-tier.ts` for all three e2e files.
- If the judge is `SIGKILL`ed *after* the body creates `coreRuntime`/`coreState`, the flock drops and the next run's `absent()` rightly refuses on the real leftover (desired safety).

**Delete:**
- `claimCoreRuntime()` (`tests/e2e/watch-tier.ts:57-61`) and its non-recursive `mkdirSync(coreRuntime)` lock pattern.
- The unprotected startup gap between claim and teardown (`tests/e2e/watch-consults.e2e.ts:137-175`).
- The merge-copy `mkdirSync(out) + cpSync` (`tests/e2e/watch-consults.e2e.ts:122-123`), replaced by `rmSync(out, { recursive: true, force: true })` then `cpSync`.
