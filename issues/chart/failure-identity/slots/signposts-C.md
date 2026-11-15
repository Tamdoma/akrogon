# Signposts angles — slot C (`failure-identity`, Tamdoma/akrogon#134)

Context against the repo's standing signposts (`issues/chart/factory-wins/forks/signposts.md` `## Question`, `## Taken`) and the #133 decisions this report touches (`issues/chart/known-red-nameless/forks/signposts.md` `## Question`, `## Taken`; `issues/chart/known-red-nameless/forks/coverage-rule.md` `## Taken`):

- `factory-wins` set `1a` (fewer parts first, then operator time, clock time, tokens), `6a` (changes in `akrogon` only), `7a` (earlier decisions stay binding unless the operator names one to reopen), and `5b` (one bounded paid run allowed with cap).
- Live inspection of `tamdoma/framework` and `akrogon` confirms three extra facts that sharpen the signposts below:
  1. `framework`'s `(no test name)` flip count grew from 12 to 13 today (`2026-11-11T19:20:26Z`, `predeploy-replan-route`, another `test:remote-image` flip). On red `test:remote-image` runs, **both** the planted proxy control (`[FAIL] no network attempts during build: CONNECT cdn.shopify.com:443`, exit 0) and the real failure (`[FAIL] no network attempts during build: GET /; GET /`, exit 1) appear on the same `framework:verify:rest-d | test:remote-image |` stream — so scraping `[FAIL]` lines even after filtering to failed sub-scripts still captures planted negative-test output, whereas Bun's fan-out exit line (`test:remote-image | Exited with code 1`) cleanly names the failed leaf script.
  2. In `known-red-nameless` (`coverage-rule.md` `## Taken`), seat judgment is split between "logged a real test name" (no full-log causal check required) and `'(no test name)'` (full two-log causal check required). Today `(fail) (unnamed)` hook timeouts bypass both halves: `knownRedReceipt` matches `'(unnamed)' === '(unnamed)'` across different scripts/files, and the seat rule treats `'(unnamed)'` as a logged test name. Any new script-level identity (such as `test:remote-image`) will open the same loophole unless coarse identities still trigger the seat's two-log causal read.
  3. `akrogon`'s own 1 `(log gone)` flip (`dc87c768`, `2026-10-24`) came from `verify --holder /tmp/.../scratchpad/dropfull`: `locate` in `src/evidence.ts` rejects every path outside `issues/(open|closed|parked|chart)/` as `nomatch`, so `--holder` runs outside `issues/` read as `(log gone)` immediately — even while the log file still exists on disk, and even at the end of `runOnce` if persistence calls `readLog`.

---

## Proposed signposts (6 questions)

### 1. When failure detail and simplicity pull apart, which wins?

- **1a (recommended)** Fewer parts and zero false identities first, then the operator's triage time, then clock time, then tokens (carries `factory-wins` `1a` and adds precision over guesswork: a coarser true script/file identity beats a heuristic assertion scrape that can misname planted negative output).
- **1b** Maximum failure specificity first (name the inner failed assertion wherever text exists in the log, accepting runner heuristics or an output marker), then fewer parts, operator time, clock time, tokens.
- **1c** Strict block-on-ambiguity first (never cover or group two reds whose exact inner assertion cannot be mechanically proven equal, even if more leaves stop on red main), then fewer parts, operator time, clock time, tokens.
- **Steers:** parser depth in `failedTests`, whether script-level identity suffices for custom harnesses, receipt schema size, and tie-breaking across every downstream fork.

### 2. Does `known-red-nameless` `3a` (the command checks facts and the seat judges causal fit from both logs) reopen for `verify --known-red`?

- **2a (recommended)** Keep `3a`'s division of labor and close the seam between its two halves: `knownRedReceipt` mechanically compares extracted unit identities (named test, script/file-qualified hook timeout, or failed fan-out script — so script X on head never covers script Y on base) while keeping same-check cover when a single non-fan-out command yields no sub-unit (`1a`), **and** update the four seat rules (`skills/implement-issue` `## Shared context`, `skills/check-issue` `check.review`, `skills/merge-issue`, `skills/chart-issues` `## Direct route`) so any coarse or unnamed-hook identity (script fallback, `(unnamed)`, or nameless check) requires the full two-log causal check rather than counting as a self-proving test name. A missing log on head or base still never covers.
- **2b** Reopen `3a` toward mechanical sub-failure matching: `knownRedReceipt` must also compare normalized failure lines/signatures inside custom scripts and nameless checks so two different failures inside the same script/command fail the CLI gate before seat review.
- **2c** Reopen `1a`/`3a` to require specific named tests/assertions: coarse script-only or nameless reds no longer qualify for `--known-red` cover and block until main is fixed.
- **Steers:** `knownRedReceipt` in `src/verify.ts`, whether all four seat skills change alongside the code, and which head-vs-base counterexamples must fail mechanically vs at seat review.

### 3. How far into non-`bun test` logs may `akrogon` reach to name a failure, and does `known-red-nameless` `4a` (no new repo config) hold?

- **3a (recommended)** Keep `4a` (zero new config in consumer repos) and extract identities from **verdict-owning tool structure only**: `bun test` `(fail)` lines (qualified with enclosing file / `bun run` script prefix so `(unnamed)` hook timeouts carry their script and file), `bun run` fan-out leaf scripts that exited non-zero (`<script> | Exited with code <n>`, excluding wrapper stage scripts) when no inner test identity matched on that stream, standard runner failure summaries only if proven collision-free across repos in the map (e.g. Playwright), and the check name / nameless marker when a single command has no sub-units. Never scrape free-form `[FAIL]` or `Error:` prose from custom scripts.
- **3b** Keep `4a` (zero config) and also parse common custom assertion patterns (`[FAIL] ...`, `tsc`/lint error codes) from failed streams, accepting heuristic rules and planted-control traps (such as `proxy-control.js` printing `[FAIL]` before `run.js` fails in `test:remote-image`) to show assertion text in `flaky` and notices.
- **3c** Reopen `4a` narrowly: keep automatic structural extraction as in `3a`, plus recognize one optional zero-config stdout failure marker (or optional per-check regex in `issues/config.yaml`) so custom scripts can opt into exact assertion names without heuristic scraping.
- **Steers:** `failedTests` grammar and maintenance surface across all 12 repos, whether `issues/config.yaml` changes, granularity of `test:remote-image` / `test:variant-parity` entries, and false-positive risk on negative-test fixtures.

### 4. How should `(log gone)` after evidence retirement be solved, and what happens to the 37 already-retired flips (`36` in `framework`, `1` in `akrogon`)?

- **4a (recommended)** Persist extracted failure identities on each red command entry in `verify-runs.jsonl` when `verify` finishes (reading captured output before or independent of `issues/` boundary restriction); for older rows lacking that field, fall back to reading surviving logs on disk (which immediately resolves all 15 post-Oct-27 nameless/unnamed flips in `framework`) and leave already-retired logless rows as retired (`(log gone)`), with no Git-history lookup and no historical ledger rewrite. Live log bytes remain mandatory for `verify --known-red` (`1a`).
- **4b** Persist on write as in `4a`, **plus** add an explicit `akrogon` backfill command (reading surviving logs and an optional `--from-rev` Git commit for retired `evidence.tar.zst` packs) so historical `verify-runs.jsonl` rows can be populated once without runtime Git cost.
- **4c** Keep `verify-runs.jsonl` schema unchanged (or forward-only) and teach `readLog` in `src/evidence.ts` to fall back to Git history when `issues/closed/<owner>/evidence.tar.zst` was deleted, recovering `framework`'s 36 rows dynamically on read at the cost of Git/zstd latency and shallow-clone fragility (still leaves `/tmp` `--holder` rows unrecoverable).
- **Steers:** `verifyRunSchema` and `runOnce` in `src/verify.ts`, `src/evidence.ts` responsibilities, `newRedUnits` incident continuity after pack retirement, and whether a migration command or leaf is charted.

### 5. What is the reach of this chart across repos and `akrogon` surfaces?

- **5a (recommended)** `akrogon` only (`factory-wins` `6a` holds): update `failedTests`, `flaky`, `knownRedReceipt` + the four known-red seat rules, `newRedUnits` `main-red` notices, receipt identity persistence in `verify-runs.jsonl`, and plain-file reading for surviving `--holder` logs outside `issues/`. Make no edits in `tamdoma/framework` (its custom harnesses, its ledger, and fixing the `test:remote-image` flake stay in `framework` once the `akrogon` release lands).
- **5b** Reporting and persistence only in `akrogon`: update `failedTests`, `flaky`, `newRedUnits`, and `verify-runs.jsonl` persistence, leaving `knownRedReceipt` and the four seat skill files as #133 left them.
- **5c** Reopen `factory-wins` `6a` for `tamdoma/framework`: also run a historical backfill on `framework/issues/verify-runs.jsonl` from `aac40283de^` and/or adjust `framework` scripts or open a `framework` chart/report for `test:remote-image`.
- **Steers:** destination repo boundary, owned files (`src/flaky.ts`, `src/verify.ts`, `src/evidence.ts`, seat skills), leaf split, and handoff steps.

### 6. How much may charting and leaf proofs spend (revisiting `factory-wins` `5b`)?

- **6a (recommended)** No paid calls and no live mutations (return from `factory-wins` `5b` to `known-red-nameless` `6a`): prove behavior with local automated tests on isolated fixtures plus read-only checks during charting against recorded `akrogon` and `framework` logs (and read-only `git show aac40283de^:...` inspection if needed).
- **6b** Zero paid calls, plus one live non-paid `akrogon flaky` / `verify --known-red` smoke check on temporary worktrees before handoff or close.
- **6c** Keep `factory-wins` `5b` (allow one bounded paid seat-review run on a nameless/script-level known-red fixture, subject to an operator budget cap).
- **Steers:** the needs sheet, leaf done-criteria proofs, and whether any stage waits on paid or live grants.

**Recommended reply key:** `1a 2a 3a 4a 5a 6a`

---

## Foreseen operator-only needs and authorizations

none

*(Conditional note for A: `none` holds under `1a–6a`, because reading `tamdoma/framework` logs and Git history during charting is local and read-only, lifecycle handoff in `akrogon` was requested by the operator at intake, and closing `Tamdoma/akrogon#134` on delivery is covered by Open. A needs-sheet row arises only if the operator selects `5c` — grant to mutate `tamdoma/framework` — or `6c` — paid-run budget cap.)*
