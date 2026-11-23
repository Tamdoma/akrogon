# Slot C — Archives Experiment (`footprint` / `archives`)

## Summary verdict

**Recommend (b): stop committing `evidence.tar.zst` and store a small failure extract (≤20 lines / ≤2 KiB per failing command) on red rows of `issues/verify-runs.jsonl`.**

- **Current archive footprint on disk:** `akrogon` has **118** `evidence.tar.zst` files (**13.98 MiB**); `framework` has **279** (**138.34 MiB**), growing monotonically in git history. A single red `framework:verify` log is ~3.9 MiB / ~28,300 lines of passing-test noise surrounding ~10–20 failure lines.
- **Empirical split across the 6 leaves:** **3/6 needed the archive** (all 3 `akrogon` leaves, which had leaf-scope red runs) and **3/6 did not** (all 3 `framework` leaves, which had only merge-scope red runs).
  - **Why the 3 `framework` leaves passed without archives:** every red run was a `merge -> check.repair` exit, which forced slot B to read the plain log before close and transcribe what/where/why into `review-B.md`. Relying on `verify-runs.jsonl` alone would have failed on `framework` too (`exit=137` → `(no test name)`, `(script) test:motion-probe`, `(script) test:factory-update`, `(unnamed)` hook timeouts).
  - **Why the 3 `akrogon` leaves failed without archives:** leaf-scope reds have no forced triage transcription. `verify-runs.jsonl` stores test titles in `failures`, but drops **why** (timeout vs assertion vs race vs file list) and collapses non-`bun test` failures (`format`, `typecheck`, `Signaled: SIGKILL`) to `["(no test name)"]`. Worse, in 2 of the 3 `akrogon` leaves, `implementation/report.md` prose mischaracterized real assertion/exit-code failures as "timeouts".

---

## Six-leaf audit (Pass 1 without archive vs Pass 2 with archive)

| # | Repo | Closed leaf | Archive size / files | Red runs | Archive needed? | Missing without archive |
|---|---|---|---|---|---|---|
| 1 | `akrogon` | `watch-consultants/failed-merge-resume` | 256.5 KiB / 218 | 5 verify (3 leaf, 2 merge), 1 merge red | **yes** (leaf reds; **no** for merge red) | Exact assertion + line (`expect(code).toBe(0)` / `Received: 1` at L4625, L2690) and verbatim 15 s timeout proof on the 3 leaf-verify reds |
| 2 | `akrogon` | `ai-budgets/session-ceiling` | 199.1 KiB / 224 | 10 verify (2 format, 8 test) | **yes** | File list for 2nd Prettier red (`tests/budget.test.ts`, `(no test name)`); true failure modes across 8 test reds (assertions `stale.socket`, `no open merge run to backdate`, `agy` diff — contradicting `report.md`'s "all 15 s/5 s timeouts") |
| 3 | `akrogon` | `merge-lanes/merge-red-exit` | 263.3 KiB / 292 | 3 verify (1 format, 2 test) | **yes** | 12 unformatted file paths (`(no test name)`); true failure cause on both test reds (`expect(code).toBe(0)` / `Received: 1` at L3316 & L299, contradicting `report.md`'s "5 s timeouts") |
| 4 | `framework` | `template-files-are-stems/template-files-are-stems` | 446.9 KiB / 41 | 1 merge verify, 1 merge red | **no** | Only the 4-line verbatim stack frame (`Received: false` at `media-range.test.ts:314:35`); `verify-runs.jsonl` + `review-B.md` already answered what/where/why |
| 5 | `framework` | `one-gate-path/one-gate-path` | 1,029.6 KiB / 116 | 5 merge verify, 6 merge reds, 1 `failed` | **no** (with `review-B.md`; **yes** from ledgers alone) | Verbatim lines inside five 223 KiB–3.95 MiB logs; `review-B.md` transcribed all 5 reds (and even had *more* detail than the log on Red 3's Playwright trace). Ledgers alone missed `SIGKILL` target (`test:satellite-fixture-network`) on `exit=137` and fixture/spec details on `(script)`/`(unnamed)` reds |
| 6 | `framework` | `inline-markdown-refuses-blocks/inline-markdown-refuses-blocks` | 456.1 KiB / 29 | 1 merge verify, 1 merge red | **no** | Only verbatim assertion lines and `1 fixture file(s) failed: bun-pin-drop.fixtures.ts`; `verify-runs.jsonl` + `review-B.md` already answered what/where/why |

### 1. `akrogon`: `issues/closed/watch-consultants/failed-merge-resume`
- **Pass 1 (without archive):**
  - *Merge reds* (`54e47ca5`, `ffaf727a`, attempt `d8d2cbd7:red` → `2acbdd1d:merged`): `verify-runs.jsonl` names `test` (`bun test --timeout=30000 --parallel=4 --no-isolate`, exit 1) failing `agy reset helper ...`; `review-B.md` (L20–34) and `implementation/report.md` (L32–38) answer what, where, and why (`tests/door-reset.test.ts`, six-stage assertion saw only `started` under stand-in timing; isolated rerun 16/16; full verify 1263/0).
  - *Leaf-verify reds* (`d7d98be1`, `69f24048`, `b6a7a1a0` on `e9836c91`): `verify-runs.jsonl` lists the failing test titles (`a failed holder...`, `next --all...`, `worktree release...`, `manual next...`, `a live check.fix...`); `report.md` L23 mentions "5 ×15 s per-test timeouts in `batch-dispatch.test.ts`" for Run 1 and names the Run 2 test, calling them host-load flakes with no error text.
- **Pass 2 (with `watch-consultants/evidence.tar.zst`, 256.5 KiB, 218 files):**
  - Confirms `d7d98be1` hit `^ this test timed out after 15000ms` on all 5 tests.
  - Reveals `69f24048` failed `expect(code).toBe(0)` (`Received: 1`) at line 4625, and `b6a7a1a0` failed `expect(code).toBe(0)` (`Received: 1`) at line 2690.
- **Score:** `archive needed: yes` (for leaf-verify "why" and file:line; `no` for the merge red). Missing: failure mode + assertion/line excerpt for runs 2 and 3.

### 2. `akrogon`: `issues/closed/ai-budgets/session-ceiling`
- **Pass 1 (without archive):**
  - `verify-runs.jsonl` records 2 `format` reds (`5876acf8`, `e7fb4b09`, both `failures: ["(no test name)"]`) and 8 `test` reds naming 2–22 tests per run (`agy reset helper`, `named target equivalence`, `slow-merge`, `reconcile`, `watch`).
  - `report.md` L24/L53 names `src/budget.ts` and `tests/budget.test.ts` for the 1st format red (`5876acf8`), says nothing about which file failed the 2nd format red (`061e575f` on `e7fb4b09`), and L36 summarizes the 7 consecutive test reds as *"all 15 s/5 s timeouts in tests/..."*.
- **Pass 2 (with `ai-budgets/evidence.tar.zst`, 199.1 KiB, 224 files):**
  - `check-format-1795355292088-2528065.log` names `[warn] tests/budget.test.ts` for the 2nd format red.
  - The 8 red `test` logs show they were **not** all timeouts: alongside `15000ms` timeouts (`next --resume`, `a dependent whose seat start...`), they contain real assertion/race failures: `expect(await listening(stale.socket)).toBe(false) / Received: true` (L130), `error: no open merge run to backdate` (`slow-merge`), and `agy` `- Expected - 5`.
- **Score:** `archive needed: yes`. Missing: unformatted file path on `(no test name)` format run `061e575f`, and actual error/assertion excerpts across all 8 test runs (without them, `report.md` actively misled on cause).

### 3. `akrogon`: `issues/closed/merge-lanes/merge-red-exit`
- **Pass 1 (without archive):**
  - `verify-runs.jsonl` records 1 `format` red (`fa4d7be2`, `failures: ["(no test name)"]`) and 2 `test` reds (`98eb50e7`, `48323128`) naming 3 tests (`unpause relaunches...`, `solo cleanup...`, `dispatch recreates a deleted .env...`).
  - `report.md` L28/L33 only writes *"Two earlier verify runs went red on flakes that pass solo"* alongside *"occasional 5 s timeouts in hc/timer tests"*; `review-B.md` documents review findings F1–F8, not those 3 leaf-verify reds.
- **Pass 2 (with `merge-lanes/evidence.tar.zst`, 263.3 KiB, 292 files):**
  - `check-format-1795301614795-732257.log` names the exact 12 unformatted files (`src/{land,next,phase,reconcile}.ts` + 8 `tests/*.test.ts`).
  - Both red `test` logs show exit-code assertions (`expect(code).toBe(0) / Received: 1` at L3316 in `98eb50e7`, L299 in `48323128`), not 5 s timeouts.
- **Score:** `archive needed: yes`. Missing: the 12 unformatted file paths (`(no test name)`) and the actual assertion/line excerpts (contradicting `report.md`).

### 4. `framework`: `issues/closed/template-files-are-stems/template-files-are-stems`
- **Pass 1 (without archive):**
  - `verify-runs.jsonl` records merge red `614401be` (`bun run framework:verify`, exit 1, `failures: ["serveMediaRange streams a late window and cancels the source before it ends"]`). `merge-attempts.jsonl` shows `d81b3432:red` → `fbca00ed:merged`; `log.jsonl` shows `merge -> check.repair -> merge -> merged`.
  - `review-B.md` L63–69 explicitly answers what, where, and why: `test:cf-workers-deploy` → `media-range.test.ts:314`, intermittent Miniflare cancellation timing failure outside the leaf, passed on narrow retry.
- **Pass 2 (with `template-files-are-stems/evidence.tar.zst`, 446.9 KiB, 41 files):**
  - `check-verify-1795350978554-645078.log` (3.82 MiB, 28,219 lines) adds only 4 useful lines at L7421–7424 (`Received: false` + stack frame at `media-range.test.ts:314:35`).
- **Score:** `archive needed: no`. Missing: only the 4-line verbatim assertion frame.

### 5. `framework`: `issues/closed/one-gate-path/one-gate-path`
- **Pass 1 (without archive):**
  - `verify-runs.jsonl` records 5 red merge runs (`a1a7b961`, `1ed6a27d` exit 137 `failures: ["(no test name)"]`, `dc408352`, `71eafb32`, `2e2a2cda`), and `log.jsonl` records `check.repair -> failed` (`main red in test:motion-probe: reduced-m...`).
  - `review-B.md` L94–275 thoroughly documents all 5 red merge runs: (1) `a1a7b961` Emdash/hooks/satellite timeouts + `bun-pin-drop.fixtures.ts` `ETIMEDOUT` + first-paint 7/8; (2) `1ed6a27d` `test:satellite-fixture-network | Signaled: SIGKILL` (exit 137 from `timeout --signal=KILL 75s`, no OOM); (3) `dc408352` EmDash `bunx astro dev --force` exit 1 + `motion-probe.spec.ts:90` reduced-motion `in_viewport: false` / `scroll_y: 0` (trace preserved in `implementation/merge-dc408352-motion-probe-trace.zip`); (4) `71eafb32` 17m 6s slow run with 13 case timeouts + 12 s satellite watchdog; (5) `2e2a2cda` `capture starts live collection...` 15 s timeout in `chain-evidence.test.ts`.
- **Pass 2 (with `one-gate-path/evidence.tar.zst`, 1,029.6 KiB, 116 files):**
  - Five huge logs (223 KiB–3.95 MiB, ~115,000 lines total) confirm `L2097: test:satellite-fixture-network | Signaled: SIGKILL` (`1ed6a27d`) and `L15889: motion-probe: playwright spec failed or wrote no states file` (`dc408352`). On Red 3, `review-B.md` actually held *more* detail (from the Playwright trace) than the archived log.
- **Score:** `archive needed: no` (thanks to `review-B.md`). **Caveat:** from `verify-runs.jsonl` alone, `exit=137` (`(no test name)` because `src/flaky.ts:26` ignores `Signaled:`) and `(script)`/`(unnamed)` failures would be opaque without an excerpt.

### 6. `framework`: `issues/closed/inline-markdown-refuses-blocks/inline-markdown-refuses-blocks`
- **Pass 1 (without archive):**
  - `verify-runs.jsonl` records merge red `fcf8d45b` (`bun run framework:verify`, exit 1) with `failures: ["private browser boundary > after a font check ends...", "private browser boundary > the private launch picks CDP_BROWSER_BINARY...", "(script) test:factory-update"]`.
  - `review-B.md` L60–68 answers what, where, and why for all three: no live DevTools port on held font refusal, `net::ERR_CONNECTION_REFUSED` on binary-selection, and `bun-pin-drop.fixtures.ts` passing in scoped rerun (`bun-pin-drop-ok`); all 3 `inconsistent` against green exact base `06cc39dd`.
- **Pass 2 (with `inline-markdown-refuses-blocks/evidence.tar.zst`, 456.1 KiB, 29 files):**
  - `check-verify-1795395006009-650341.log` (3.92 MiB, 28,323 lines) confirms `L23705: 1 fixture file(s) failed: bun-pin-drop.fixtures.ts` and verbatim stack frames for the two browser tests.
- **Score:** `archive needed: no`. Missing: only verbatim assertion/fixture lines already summarized in `review-B.md`.

---

## Code paths and smallest change for Option (b)

### Exact code paths today (verified on `main` `f323d9fc`)
- **Archive writers:**
  - `src/pack.ts:59-105` (`packFolderLocked`) — globs `**/*.log`, merges into `evidence.tar.zst` via `Bun.Archive` + `Bun.zstdCompressSync(..., { level: 19 })`, verifies members via `locate`/`readMember`, unlinks plain `.log` files.
  - `src/phase.ts:391-407` (`completeOwner`, line `401`) — calls `packFolderLocked(repo, owner, leaf.path)` under `flockHold(owner/.lock, '-x')` + `.closing` marker right before `renameSync(owner, completed.destination)`.
  - `src/pack-command.ts:122,141-162` (`akrogon pack`) — manual entry point calling `packFolder` (`src/pack.ts:46-55`), paired with `unpackedEntries` in `src/status.ts:420-455,693,887` (`Unpacked:` warnings).
- **Archive / log readers:**
  - `src/evidence.ts:54-104` (`readMember`, `readLog`, `readLogAcross`) — powers `akrogon log <path>` (`src/akrogon.ts:311-315`) and `src/flaky.ts:54-66` (`failedTests`).
  - `src/flaky.ts:24-49` (`names`) — parses `(fail)` titles, `(unnamed) <stream>`, and `(script) <stream>` from a log; ignores `Signaled:` and free text, returning `['(no test name)']`.
  - `src/verify.ts:657-666` (`commandRow`) — computes `failures` from `first.log` when `first.code !== 0` and writes it into `verify-runs.jsonl` (`verifyRunSchema` at `src/verify.ts:58-99`, `commands[]` is `z.strictObject` at `src/verify.ts:74-85`).
  - **Reader hazard to fix before deleting logs at close:** `knownRedReceipt` at `src/verify.ts:259-272` unconditionally calls `failedTests(repo, entry.log)` and `failedTests(repo, onBase.log)` (rejecting on `(log gone)`) instead of checking `entry.failures` / `onBase.failures` first. Every other caller (`resolvedOnMain` at `src/verify.ts:338`, `mainRedCover` at `src/verify.ts:365,376`, `flips` at `src/flaky.ts:123,130`, `taken8Trigger` at `src/land.ts:169`) already prefers stored `failures`.

### Smallest change
1. **Capture a bounded failure extract when writing red `verify-runs.jsonl` rows (`src/verify.ts:74-85,657-666`, helper in `src/flaky.ts`):**
   - Add `excerpt: z.string().optional()` to `commands[]` (and `rerun`) in `verifyRunSchema` (`src/verify.ts:74-85`).
   - When `code !== 0` in `commandRow` (`src/verify.ts:665`), extract up to ~20 lines / ~2 KiB from the plain log (which is always on disk at run end): collect matching context windows around `(fail)`, `Signaled:`, `Exited with code (?!0)`, `[warn]` (Prettier), and `error TS` (tsc), falling back to the last 20 non-empty lines when none match. Also consider letting `names()` (`src/flaky.ts:27-49`) keep `Signaled:` stream tokens in the excerpt (without changing `nameless()` semantics for `flaky` / `mainRedCover`).
2. **Stop creating `evidence.tar.zst` at close (`src/phase.ts:401`, `src/pack.ts`):**
   - Replace `packFolderLocked` at `src/phase.ts:401` with a `pruneLogsLocked(repo, owner)` helper under the exact same exclusive `.lock` + `.closing` + `enclosingCapture` + `refuseAbandonedCaptures` guard: unlink plain `**/*.log` files (still refusing symlinks) without writing `evidence.tar.zst`. Plain logs remain on disk for all open leaves/active captures (so `akrogon log`, `check.review`, and `check.repair` keep full logs while work is live).
3. **Decouple `knownRedReceipt` from closed-leaf logs (`src/verify.ts:259-272`):**
   - Prefer `entry.failures` and `onBase.failures` when present, calling `failedTests` only for legacy rows lacking `failures`.
4. **Keep historical archive reads, retire archive creation UX:**
   - Keep `src/evidence.ts:54-104` unchanged so `akrogon log` still reads existing committed `evidence.tar.zst` files (no history rewrite).
   - Update `src/status.ts:420-455` (`unpackedEntries`) and `src/pack-command.ts` so closed owners / ended charts with leftover plain `.log` files are cleaned up (pruned) rather than packed into new archives.
