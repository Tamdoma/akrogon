# Fork notes: slot C, chart merge-test-facts, fork test-facts

Date: 2026-11-25
Locks applied: Tamdoma/akrogon#154 (`INTAKE.md`), signposts `1a`, `2a`, `3a`, `4a`, `6a`, operator instruction (systems simplicity, clarity, elegance), `issues/chart/footprint` (`b9fe5027` plain-log deletion).

---

## Q1. Which per-test durations does a finished verify command row keep?

### Pick: `a` — The K slowest named tests of the command as `{name, ms}` (failures included), K fixed in code

- **Reason:** Strictly bounded O(K) bytes per row regardless of suite size or CPU/IO load spikes, while still fitting cleanly inside `issues/verify-runs.jsonl`'s existing whole-file read / Zod-parse / atomic-rewrite architecture (`src/verify.ts` `readVerifyRuns`, `runOnce`) and honoring signposts `3a` (smallest field, no new record kinds), `6a` (optional field, old records keep parsing), and `issues/chart/footprint` (no kept multi-MB logs). Every row is also self-bounding: the Kth entry's `ms` gives an exact ceiling (`<= slowest[K-1].ms`) for every unlisted test. Parsing reuses the same Bun `(pass)`/`(fail)` line grammar `failureNames` (`src/flaky.ts`) already owns, with no per-file state machine needed across parallel workers.
- **Cost:**
  - Once a specific watched test becomes faster than the Kth slowest test in the suite, its exact duration disappears from the row and readers get an upper bound (`<= Kth ms`) rather than an exact median. For example, across 17 current open framework merge logs, `capture-review.test.ts` (88–169 s under load in `INTAKE.md`) now runs 5,968–12,241 ms and ranks #42–#103 (median #48): it drops out completely at K=20 (median cutoff 17,938 ms) and sits right on the boundary at K=50 (median cutoff 6,451 ms).
  - Fixed per-row payload growth: at K=20, ~2.4 KB/row (~3.6 MB/month at ~50 merge runs/day); at K=50, ~5.9 KB/row (~8.9 MB/month).
  - Because `verifyRunSchema` uses `z.strictObject`, older akrogon binaries cannot parse rows carrying the new field (same deployment constraint already accepted for `failures`, `patch_id`, and `slow.accepted_notice`).

### Rejected options

- **`b` (Every test as `{name, ms, outcome}`):** Breaks `verify-runs.jsonl`'s whole-file rewrite model. A single real framework merge verify log holds 11,749–12,003 timed tests; serializing every test as `{name, ms, outcome}` adds **1.56–1.60 MB per merge row** (~2,150× the current 737 B mean row). At framework's 39–54 merge rows/day, that adds **62–86 MB/day (1.9–2.6 GB/month)** to a file that `runOnce` reads, Zod-parses, and rewrites whole under `akrogon-verify-runs.lock` 90–200 times/day (leaf + merge combined) and that `akrogon status` parses synchronously on every call. In a Bun 1.4.5 benchmark, even 100 merge rows (~2–2.5 days) at 10,000 tests/row is 101 MB and takes 235 ms parse+Zod + 94 ms stringify; after one month (~2.4 GB), every verify pass and `status` call stalls or OOMs and causes ~240 GB/day of write amplification.
- **`c` (Per-file totals, or tests over a duration floor):**
  - *Per-file totals:* A framework merge log spans 790–804 test files (**65–66 KB/row**, ~90× current row size, ~100 MB/month at 50 merge/day, +102 MB over 1,567 rows), still 10–25× heavier than top-K. It also obscures which test inside a multi-test file regressed and requires stateful file-header tracking across interleaved `--parallel=8` streams (3,498 repeated file headers observed for 803 unique files in one log).
  - *Duration floor:* Unbounded under the exact load-spike condition `#154` investigates. Even on healthy runs, `>= 1000 ms` keeps 402–539 tests (48–65 KB/row) and `>= 5000 ms` keeps 76–116 tests (8.9–13.8 KB/row); under heavy contention, hundreds or thousands of tests cross the floor simultaneously and bloat the row unpredictably. Conversely, fast repos or recovered suites record zero entries and lose any upper-bound ceiling.
- **`d` (Keep merge verify logs past leaf completion — undo `b9fe5027` for merge scope):** Directly reverses `issues/chart/footprint` (`b9fe5027`) and contradicts signpost `3a`. Measured size of open full framework `check-verify-*.log` files is 4.01–4.18 MB each; at 39–54 merge runs/day, keeping them adds **160–225 MB/day (4.8–6.8 GB/month)** of unstructured text in `issues/closed/` and forces every analysis to re-parse hundreds of multi-MB logs from disk.

### Evidence

- **Tier 1 (measured repo ledger, 2026-11-25):** `/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl`: 3,666 rows, 2,701,503 B (2.70 MB), mean 736.9 B/row (min 409 B, p50 687 B, p95 881 B, max 14,436 B). Scope split: 2,099 `leaf` (`cheap`, 52.5/day mean, 46 median, 160 max; last 10 days avg ~76/day) and 1,567 `merge` (`verify`, 39.2/day mean, 33 median, 143 max; last 10 days avg ~54/day). `/home/ivan/Work/infra/akrogon/issues/verify-runs.jsonl`: 798 rows, 1.05 MB (462 leaf, 336 merge).
- **Tier 1 (source read, 2026-11-25):** `src/verify.ts` (`readVerifyRuns`, `runOnce`, `greenRun`, `redRun`, `knownRedReceipt`, `uncoveredMainRedUnits`), `src/status.ts` (status repo scan), `src/flaky.ts` (`flakyCommand`), `src/land.ts` (`redRunId`, `taken8Trigger`). Every reader synchronously reads, `JSON.parse`s, and Zod-validates every line of `verify-runs.jsonl`; `runOnce` rewrites the whole file atomically via temp file + `renameSync` under `akrogon-verify-runs.lock` on every pass.
- **Tier 1 (measured real framework verify logs, 2026-11-25):** 17 open full `check-verify-*.log` files under `/home/ivan/Work/infra/tamdoma/framework/issues/open/` (4.01–4.18 MB each, ~29,000 lines, 0 ANSI escapes, 74–78 prefixed streams, 790–804 `.test.ts` files, 11,749–12,003 timed `(pass)`/`(fail)` lines + 123–130 sub-ms `(pass)` lines with no `[ms]` + 18 `(skip)` lines). Measured JSON sizes per merge row:
  - K=20: 2,306–2,479 B (med 2,427 B), cutoff 17,500–26,851 ms (med 17,938 ms).
  - K=50: 5,792–6,102 B (med 5,916 B), cutoff 5,992–13,263 ms (med 6,451 ms).
  - K=100: 11,319–12,249 B (med 11,665 B), cutoff 3,600–6,557 ms (med 4,003 ms).
  - Floor `>= 5000 ms`: 76–116 tests (8,908–13,840 B); `>= 1000 ms`: 402–539 tests (48,516–64,709 B); `>= 100 ms`: 2,475–2,565 tests (297,530–308,005 B).
  - Per-file totals: 790–803 files (64,792–65,812 B).
  - All tests `{name, ms, outcome}`: 1,563,950–1,595,015 B.
- **Tier 1 (live Bun 1.4.5 probe & benchmark, 2026-11-25):**
  - Bun 1.4.5 non-TTY output (matching `src/run-check.ts` `spawnLogged` file redirection): `(pass) fast pass` (omits `[ms]` when duration rounds to 0), `(pass) medium pass [25.11ms]`, `(pass) over 1s pass [1050.60ms]` (always `ms`, even at `300002.91ms`; only the `Ran N tests across M files. [8.48s]` footer uses `s`), `(fail) assert fail [15.09ms]`, `(skip) skipped test`, `(todo) todo test`.
  - Benchmark in Bun 1.4.5: current ledger (3,666 rows, 2.70 MB) = 44.7 ms parse+Zod, 4.5 ms stringify; K=20 on 1,567 merge rows (+3.09 MB) = +26.0 ms parse+Zod, +3.0 ms stringify; ALL 10,000 tests on just 100 merge rows (+101 MB) = +235.0 ms parse+Zod, +93.5 ms stringify.
- **Tier 2 (seed report, 2026-11-23):** `INTAKE.md` (`## Observation`) reporting `capture-review.test.ts` at 88–169 s daily median at merge vs 3.3 s alone from 900 pre-`b9fe5027` logs.

### Pitfalls and removals

- **Summary section double-counts failing tests:** In Bun 1.4.5 multi-file/parallel runs (observed in `check-verify-1795553672666-2146688.log` and `check-verify-1795549654908-735600.log`), each failing test prints `(fail) <name> [<n>ms]` inline and repeats it at the end of the same stream under `<N> tests failed:`. *Removal:* Track per-stream summary entry when `<N> tests failed:` appears on a stream and ignore `(fail)` lines from that stream's summary block.
- **Rerun rows replace top-level `log` with the narrow 1–3 test rerun:** Observed in `verify-runs.jsonl` row `a538e572` and `src/verify.ts` (`commandRow`): `first.output` is the 4.1 MB full suite; `second.output` is a 2.2 KB single-test rerun. Extracting durations from `second.output` erases the suite's durations on every rerun-recovered merge. *Removal:* Always parse command-level durations from `first.output` (the full run), never `second.output`.
- **Duplicate test titles (`test.each` literal `%s` and shared titles across streams):** Observed 11 duplicate titles in one verify log (e.g., `timeout child closes its browser and removes scratch on forced failure=%s` running 24,191 ms and 4,121 ms). A multi-case `test.each` can crowd out top-K or violate unique-name assumptions. *Removal:* Deduplicate by normalized test name keeping the maximum `ms` (matching `failures`'s uniqueness invariant).
- **`(unnamed)` failures with long durations:** Observed `(fail) (unnamed) [241101.39ms]` (`beforeAll` deadline in `test:emdash-routes` in `check-verify-1795549654908-735600.log`). *Removal:* Qualify `(unnamed)` with its stream's innermost token (`(unnamed) test:emdash-routes`), identical to `failureNames` (`src/flaky.ts`), so hook failures stay identifiable and consistent with `failures`.
- **Non-test commands and blocked/reused/setup-failed rows:** Commands like `format` and `typecheck` (in `akrogon`) or `blocked`/`reused` entries print no Bun test duration lines. *Removal:* Omit the optional field when zero timed test lines are parsed; store `ms` as rounded non-negative integer (`z.number().int().nonnegative()`).

### Questions the fork does not ask

1. **What exact value of `K` should be fixed in code?** Measured across 17 framework merge logs: K=20 (~2.4 KB/row, median cutoff 17.9 s) misses 6–12 s tests like post-fix `capture-review.test.ts`; K=50 (~5.9 KB/row, median cutoff 6.5 s) catches down to ~6.5 s at ~8.9 MB/month. Should K be locked at 30 or 50 rather than left unspecified?
2. **Should failing tests always be included in the duration list even if faster than the Kth slowest test?** In `check-verify-1795566622096-2368929.log`, a real 5 s timeout (`5009.97ms` in `test:cf-pages-deploy`) ran faster than K=50's median cutoff (6,451 ms), so pure top-K omits its duration even though it failed. Adding failing tests (typically 1–3) on top of K costs ~100–300 B only on red rows and guarantees every named failure has a recorded duration.

---

## Q2. How is "this failure was a timeout" recorded?

### Pick: `a` — Optional `timeouts: string[]`, the subset of `failures` whose own stream prints Bun's `this test timed out after <n>ms` line, with the same split inside `rerun`

- **Reason:** Preserves complete verdict neutrality and backward compatibility (`6a`, `3a`). Every existing consumer of `entry.failures` (`knownRedReceipt`, `resolvedOnMain`, `uncoveredMainRedUnits`, `newRedUnits` in `src/verify.ts`; `flips` in `src/flaky.ts`; `taken8Trigger` in `src/land.ts`) reads `string[]` without change. Costs **0 bytes** on green runs and non-timeout red runs (omitted when empty). Directly captures Bun's authoritative timeout signal per stream regardless of which per-script or per-test timeout value was configured, and preserves first-run flaky timeouts inside `rerun` when the rerun passes (observed live in framework row `a538e572`).
- **Cost:**
  - Adds a second parallel optional array alongside `failures` on both the command row and `rerun`, with a subset invariant (`timeouts ⊆ failures`) to enforce in `verifyRunSchema` and `commandRow`.
  - Older akrogon binaries cannot parse a row carrying `timeouts` (`z.strictObject`).
  - Records only Bun test-runner timeouts (`  ^ this test timed out after <n>ms.`), not custom internal deadlines that fail via `expect()` or thrown errors (such as the 240 s `astro dev` deadline observed as `(fail) (unnamed) [241101.39ms]` without a Bun timeout line).

### Rejected options

- **`b` (`failures` entries become objects `{test, ms, timed_out}`):** Mutates an existing load-bearing field read across 6+ functions in 3 modules (`src/verify.ts`, `src/flaky.ts`, `src/land.ts`). Under signpost `6a` ("old records keep parsing with no migration"), every reader and schema would permanently have to support a union of `string | {test, ms, timed_out}`, violating simplicity and verdict neutrality, and duplicating `ms` already captured under Q1.
- **`c` (Inferred from a duration at or above the test timeout):** Empirically impossible. Real framework logs prove a single `bun run framework:verify` command runs sub-scripts under at least three different Bun timeouts simultaneously: `5000ms` (default, e.g. `test:cf-pages-deploy`), `30000ms` (`hooks:selftest --timeout=30000`), and `300000ms` (`test:cf-workers-deploy`), plus per-test overrides. A `5009.97ms` failure in `test:cf-pages-deploy` **was** a timeout (`after 5000ms`), while passing tests in the same run take 52,228–78,847 ms and a 241,101 ms `beforeAll` failure was **not** a Bun timeout. No duration threshold can separate timeouts from slow assertion failures.

### Evidence

- **Tier 1 (observed real framework logs, 2026-11-25):**
  - `check-verify-1795549654908-735600.log` (`test:cf-workers-deploy`, inline and repeated in `1 tests failed:` summary):
    - `framework:core-lane-a                 | test:cf-workers-deploy | (fail) capture rejects naming a registered service worker and settles every handler [300002.91ms]`
    - `framework:core-lane-a                 | test:cf-workers-deploy |   ^ this test timed out after 300000ms.`
  - `check-verify-1795566622096-2368929.log` (`test:cf-pages-deploy`, inline and repeated in `1 tests failed:` summary):
    - `framework:verify:rest-c               | test:cf-pages-deploy                         | (fail) first-publication holder cleanup with no cycle history does not enter deploy preflight [5009.97ms]`
    - `framework:verify:rest-c               | test:cf-pages-deploy                         |   ^ this test timed out after 5000ms.`
  - Corresponding `verify-runs.jsonl` row `a538e572`: `exit: 0` (rerun passed in `check-verify-1795566622932-2368929.log`), `rerun: { exit: 1, log: ..., failures: ["first-publication holder cleanup with no cycle history does not enter deploy preflight"] }` — proving flaky timeouts survive only if `rerun` carries `timeouts`.
  - Same log `check-verify-1795549654908-735600.log`: `(fail) (unnamed) [241101.39ms]` with no `^ this test timed out` line (internal 240,000 ms deadline inside `beforeAll`), and `check-verify-1795553672666-2146688.log` passing tests up to `62080ms` (and `78847ms` in `check-verify-1795487484756-1065562.log`).
- **Tier 1 (live Bun 1.4.5 probe, 2026-11-25):** Non-TTY stderr for `test('timeout 50ms', ..., 50)` and `test('timeout 1100ms', ..., 1100)` prints `(fail) <name> [<n>ms]` followed immediately by `  ^ this test timed out after <limit>ms.` (two leading spaces, `^`, trailing period; always `ms`). A test throwing `new Error('this test timed out after 50ms.')` prints `error: this test timed out after 50ms.` *before* `(fail)`, never `  ^ this test timed out after ...` *after* `(fail)`.
- **Tier 1 (source read, 2026-11-25):** `src/verify.ts` (`failuresSchema`, `verifyRunSchema`, `commandRow`, `knownRedReceipt`, `resolvedOnMain`, `uncoveredMainRedUnits`, `newRedUnits`), `src/flaky.ts` (`failureNames`, `flips`), `src/land.ts` (`taken8Trigger`).

### Pitfalls and removals

- **Interleaved concurrent streams detach the timeout line from its `(fail)` line:** In 78-stream parallel output, other streams print lines between stream S's `(fail)` line and stream S's `  ^ this test timed out after <n>ms.` line. *Removal:* Maintain a per-stream map `lastFailByStream: Map<string, string>` keyed by normalized stream chain (`chain()` from `src/flaky.ts`); record a timeout only when stream S emits the exact `  ^ this test timed out after \d+ms.` line immediately after stream S's `(fail)` line (clear stream S's entry on any other line emitted by stream S).
- **False positive from test/error text containing `"this test timed out after"`:** *Removal:* Require the exact anchored Bun format (`^(?:(.+?)\| )?  \^ this test timed out after \d+ms\.$`) immediately following a `(fail)` line on the same stream, never loose substring matching.
- **Rerun filtering breaking `timeouts ⊆ failures`:** On a rerun where first run had 1 timeout + 1 assertion failure and rerun fails only the assertion (or exits non-zero with no named failures), copying first-run `timeouts` onto the top-level command row would falsely claim the rerun timed out or include a test absent from top-level `failures`. *Removal:* Parse `firstTimeouts` from `first.output` (stored on `rerun.timeouts` when non-empty) and `secondTimeouts` from `second.output`; store top-level `timeouts` only when `second.code !== 0`, intersected with top-level `failures` (omitted when empty).
- **Summary repetition duplicating names:** Bun repeats both `(fail)` and `  ^ this test timed out` in `<N> tests failed:`. *Removal:* Deduplicate `timeouts` (`[...new Set(...)]`) and enforce the same non-empty unique schema + `timeouts ⊆ failures` refinement in `verifyRunSchema`.
- **TTY vs non-TTY output in tests:** Live Bun 1.4.5 prints `✗`/`✓` when stderr is a TTY and `(fail)`/`(pass)` when redirected to a file. `spawnLogged` (`src/run-check.ts`) always redirects to files, so production captures always use `(fail)`/`(pass)`. *Removal:* Unit/boundary tests must capture Bun output through non-TTY pipes/files (matching `spawnLogged`).

### Questions the fork does not ask

1. **Should `timeouts` be recorded on every scope (matching `failures`) even if Q4 restricts durations to merge scope?** Yes by default — it costs 0 bytes on green and non-timeout red runs and keeps `failures`/`timeouts` symmetric across scopes — worth locking explicitly so Q4 does not accidentally gate `timeouts`.
2. **Should Bun's timeout limit (`<n>ms` from `after <n>ms.`) be discarded or kept?** Keeping `timeouts: string[]` drops the configured limit (e.g., 5s vs 30s vs 300s). For `#154`, knowing *which* failures timed out is sufficient (and top-K durations show elapsed time for slow timeouts), so `string[]` is the simplest smallest field (`3a`).

---

## Q3. How does a land attempt join to its verify runs?

### Pick: `a` — Optional `attempt` on the `verify-runs.jsonl` row, written from the pass caller the pass already carries

- **Reason:** Matches the true relational cardinality (one land attempt -> 0, 1, or N verify runs) with a single-writer foreign key on the child row and minimal code surface (`3a`). `PassRecord.caller` (`src/verify-pass.ts`) and `verifyCaller` (`src/verify.ts`) **already carry `attempt`** all the way into `runOnce` (`passCaller(record)`), which currently drops it when building `receipt`. Writing `attempt` inside `runOnce`'s initial locked append (before checkout/commands) means:
  1. One writer (`runOnce`) instead of plumbing state through `state.yaml` (`batchSchema`) and **9 scattered `appendAttempt` call sites** across `src/land.ts` (`repairExit`, `keepPlace`, `commandFailed`), `src/phase.ts` (`batchPush`, `finishPush`), and `src/next.ts` (`reconcileBatch` red/merged, legacy `mergeTurn` red, `mergeTurnExit`).
  2. Crash-resilient joins: even if `land` dies mid-verify and `reconcileBatch` later writes the attempt row, the verify row already carries `attempt`.
  3. Clean 1-to-many attribution for attempts with multiple verify runs (observed 32 times since 2026-11-21: restack reruns, `taken8Trigger` base runs, and restarted land runs) and manual `akrogon verify --attempt <id>` calls.
- **Cost:**
  - One narrow gap: when a land attempt hits a reused green receipt (`greenRun` in `src/verify.ts` `verify`, observed 1 of 265 merged attempts since 2026-11-15: `6bd0b547` reusing `a538e572`), no new `verify-runs` row is written, so `verify-runs` holds no row with that `attempt` id. However, `recordTested` (`src/phase.ts` `landGates`) sets `tested_top` on the merged attempt row, which already joins back to the reused green receipt via `sha`/`tree`.
  - Joining from an attempt to its verify runs requires scanning `verify-runs.jsonl` by `attempt` (which callers already read in full via `readVerifyRuns`).
  - Adds ~48 bytes only to attempt-bearing verify rows; older akrogon binaries cannot parse rows carrying `attempt` (`z.strictObject`).

### Rejected options

- **`b` (A verify run id or list on the `merge-attempts.jsonl` row):** Wrong side of a 1-to-many link with fragmented writers. Only `landAttempt` (`src/land.ts`) holds `result.id` in memory; `batchPush`, `finishPush`, `reconcileBatch`, `keepPlace`, and `commandFailed` do not, forcing a second schema change in `src/state.ts` (`batchSchema`) plus extra locked `state.yaml` writes after every `verify()` call. Worse, if `land` crashes *during* `verify()` (before `verify()` returns), `state.batch` never receives the run id, so `reconcileBatch` writes a red attempt row that still cannot join to its verify run. Also requires handling a list (not a single id) because attempts regularly run 2+ verify passes (restack, base comparison).
- **`c` (Both):** Duplicates the foreign key in two ledgers, violating single source of truth and signpost `3a` ("smallest field"). Pays all the write-path complexity of `b` (`batchSchema`, 9 `appendAttempt` sites, crash-during-verify divergence where `verify-runs` has `attempt` while `merge-attempts` lacks the run id) just to avoid a 1-in-265 `tested_top` fallback on reused green receipts.

### Evidence

- **Tier 1 (source read, 2026-11-25):**
  - `src/verify-pass.ts` (`passRecordSchema`, `passCaller`): `caller.attempt` is already persisted on `PassRecord` and returned by `passCaller(record)`.
  - `src/verify.ts` (`verifyCaller`, `passOnce`, `runOnce`, `verify`, `samePass`): `verifyCaller` resolves `--attempt <id>` via `leafFields` (populating `caller.attempt`); `runOnce` calls `passCaller(record)` and omits `attempt` from `receipt`.
  - `src/phase.ts` (`recordTested`, `landGates`, `batchPush`, `finishPush`), `src/land.ts` (`landAttempt`, `repairExit`, `keepPlace`, `commandFailed`), `src/next.ts` (`reconcileBatch`, `mergeTurn`, `mergeTurnExit`): `tested_top` is set only in `recordTested` (inside `landGates`, after verify passes), explaining why red verify exits lack `tested_top`; 9 total `appendAttempt` call sites across 3 files.
- **Tier 1 (measured repo ledgers, 2026-11-25):** `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl` (1,268 rows, 475,900 B) joined against `verify-runs.jsonl`:
  - Since 2026-11-21: 91 of 92 red attempts have no `tested_top` (so sha-join fails on 99% of red attempts).
  - Window-based joins since 2026-11-21: 32 attempts had **2** verify runs in-window (21 `merged`, 11 `red`, covering both restack different-SHA pairs and same-SHA retry/base pairs); 6 `red` attempts had **0** verify runs in-window (lasting 1.5–13 s — pre-verify conflict/dirty exits in `mergeTurnExit`); 1 `merged` attempt of 265 since 2026-11-15 (`6bd0b547`, `satellite-pages-derive-currency`) had **0** in-window verify runs because it reused prior green run `a538e572` (which matched `attempt.tested_top`).
- **Tier 2 (seed report, 2026-11-23):** `INTAKE.md` (`## Observation`) noting 7 of 73 red attempts since 2026-11-21 could not be joined without a run/attempt link.

### Pitfalls and removals

- **`samePass` (`src/verify.ts`) omits `caller.attempt` from the live-pass join key:** If a new attempt ever joined an already-running live pass from another attempt (or non-attempt caller) on the same tree, the `verify-runs` row would record only the first starter's `attempt`. *Removal:* Add `record.caller.attempt === key.caller.attempt` to `samePass` so live-pass joins never misattribute an attempt.
- **Reused green receipts (0 rows with `attempt`):** A merged attempt that reuses a prior green receipt (`verify()` `greenRun` hit) writes no new `verify-runs` row. *Removal:* Document the two-step consumer join: match `verify-runs` by `attempt` first; if empty and `tested_top` is present, fall back to the green `verify-runs` row matching `sha === tested_top` (or `tree`).
- **Consumers assuming 1-to-1 cardinality:** Attempts with restack or `taken8Trigger` base runs produce 2+ verify rows with the same `attempt`, and conflict/dirty exits produce 0. *Removal:* Treat `attempt -> verify runs` as 0..N, distinguishing head runs (`compares === undefined`) from base runs (`compares !== undefined`) and ordering by `start`/`end`.

### Questions the fork does not ask

1. **Should `samePass` (`src/verify.ts`) add `caller.attempt` to the pass join key?** Recommended yes (1-line check) so a pass started without `--attempt` or under a prior attempt is never silently attributed to a different attempt.
2. **When `verify()` reuses a green receipt for a land attempt, is the `tested_top -> sha` fallback sufficient, or should anything else be recorded?** At 1 in 265 merged attempts and with `tested_top` already recorded by `landGates`, the fallback is sufficient with zero extra writes; worth confirming as the contract.

---

## Q4. Which runs keep durations?

### Pick: `b` — Merge-scope runs only (the scope the seed asks about)

- **Reason:** Matches both the seed outcome (`INTAKE.md`: *"its merge verify record still answers..."*) and `src/verify.ts`'s existing architectural boundary, where merge-path performance telemetry and retry machinery (`slowChecked`, `inheritedPatchId`, `rerun` in `commandRow`) are already scoped to `record.scope === 'merge'`. Measuring framework's ledger shows that `leaf`-scope runs (`cheap`, 530 unit tests, max 6.6 s, median 1 ms) make up **57.3% of all verify rows** (52.5/day mean, ~76/day recent) yet run none of the merge suite (`hooks:selftest`, `core-lane-*`, `verify:rest-*`). Because `cheap` still has >50 tests, recording top-K on leaf runs costs the **exact same bytes per row** (~2.5–6.6 KB) as merge runs — more than **doubling** `verify-runs.jsonl` size and full-file rewrite traffic (~2.3–2.4×) purely to store sub-second `cheap` test durations (down to 115–184 ms). Gating duration extraction in `commandRow` on `record.scope === 'merge'` (alongside the existing `rerun` gate) keeps the ledger compact (`3a`, `footprint`) and stays trivially reversible in 1 line with zero schema change if post-close leaf durations are ever needed.
- **Cost:**
  - After a leaf closes, its leaf-scope `cheap` runs hold no per-test durations (though while the leaf is open, its `check-cheap-*.log` remains on disk, and its `failures`/`timeouts` still survive in `verify-runs.jsonl`).
  - Adds one `record.scope === 'merge'` branch in `commandRow` (which already checks `record.scope === 'merge'` for `rerun`).

### Rejected options

- **`a` (Every command row with test output, any scope):** Over-collects for no consumer need and more than doubles ledger bloat and write amplification. At framework's recent rates (~76 leaf/day + ~54 merge/day), Q4a vs Q4b increases monthly growth from ~3.6 MB/month to ~8.5 MB/month (at K=20) or from ~8.9 MB/month to ~21 MB/month (at K=50), filling >55% of the payload with 115–184 ms `cheap` unit tests inside a file that `runOnce` rewrites whole 130+ times/day and `akrogon status` parses synchronously on every call.

### Evidence

- **Tier 1 (measured repo ledgers, 2026-11-25):**
  - Framework `verify-runs.jsonl`: 2,099 `leaf` rows (`cheap`, 57.3%, 52.5/day mean, 46 median, 160 max; last 10 days avg ~76/day) vs 1,567 `merge` rows (`verify`, 42.7%, 39.2/day mean, 33 median, 143 max; last 10 days avg ~54/day; of which 69 = 4.4% are `compares` base runs).
  - Akrogon `verify-runs.jsonl`: 462 `leaf` rows (57.9%, 17.8/day mean) vs 336 `merge` rows (42.1%, 13.4/day mean).
- **Tier 1 (measured real `check-cheap-*.log`, 2026-11-25):** `check-cheap-1795569729093-425298.log` (238 KB, 530 timed tests across 14 files; min 0 ms, p50 1 ms, p90 103 ms, p99 487 ms, max 6,641 ms):
  - Top K=20: 2,476 B (Kth = 184 ms) — essentially identical bytes to merge `check-verify` (2,427 B).
  - Top K=50: 6,593 B (Kth = 115 ms) — actually *larger* per row than merge `check-verify` (5,916 B) because of longer test titles.
- **Tier 1 (source read, 2026-11-25):** `src/verify.ts` (`slowChecked`, `inheritedPatchId`, `commandRow`) already scopes merge timing/retry features to `scope === 'merge'`, while `failures` is scope-agnostic.

### Pitfalls and removals

- **Accidentally gating Q2 `timeouts` on `scope === 'merge'` along with Q1 durations:** Timeout classification belongs with `failures` (scope-agnostic, 0 bytes on green/non-timeout rows) so leaf-scope red runs and `flaky` keep full failure truth. *Removal:* Gate only duration extraction on `record.scope === 'merge'`; run timeout extraction whenever `failures` is extracted (any scope).
- **Excluding `compares` base runs from merge-scope durations:** A merge base-comparison run (`scope === 'merge'`, `compares !== undefined`) is only 4.4% of merge rows (69 of 1,567) and lets readers compare head vs base per-test durations on the same commit pair. *Removal:* Gate on `record.scope === 'merge'` without excluding `compares`.

### Questions the fork does not ask

1. **Within merge scope, should `compares` (base comparison) runs keep durations too?** Recommended yes (`record.scope === 'merge'` only): negligible extra volume (~4.4% of merge rows) and enables direct head-vs-base per-test duration comparison on main-red/slow investigations.
2. **At what ledger size should `verify-runs.jsonl` stop being rewritten whole on every pass?** Even under Q4b + Q1a (K=20–50), 6–12 months of framework merges (~10,000–20,000 merge rows) will push `verify-runs.jsonl` to 30–120 MB rewritten 130×/day; out of scope for this leaf (`4a`), but worth flagging as a future seam for `issues/chart/footprint`.
