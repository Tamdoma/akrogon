# Plan: verify-test-facts

Slot A synthesis, 2026-11-25. Brief and design read from this folder; live surfaces inspected at 085f2f88 in the worktree.

## Read-first

- `issues/open/merge-test-facts/verify-test-facts/brief.md`, `design.md` (this leaf)
- `issues/chart/merge-test-facts/forks/test-facts.md` — the P1/P2 output-shape evidence and binding decisions verbatim
- `src/verify.ts` — `verifyRunSchema`, `commandRow`, `runOnce`, `verifyCaller`, blocked/reused row writers
- `src/flaky.ts` — `failureNames` and the `chain` tokenizer; its regex `(?:\(fail\) |(.+?)\| \(fail\) )(.+?)(?: \[[\d.]+m?s\])?$` is today's name grammar
- `src/verify-pass.ts` — `passCaller` already carries `caller.attempt` into the `LeafTarget`
- `src/run-check.ts` `leafFields` — puts `state.batch.attempt` onto every merge-phase caller
- `tests/verify.test.ts` — the real-CLI harness (`fixture`, `callerWorktree`, `mergeLeaf`, `verify`, `records`) and the rerun tests at lines 2705-2810
- `tests/helpers.ts` — `cli`, `seedRun`, `yaml`, `fakeAkrogon`
- `tests/docs-links.test.ts` — existing `files.md` content assertions (the `(script)` line near line 288)
- `docs/reference/files.md` line 71 — the `verify-runs.jsonl` row to extend
- `src/AREA.md` line 17 — the verify description to extend
- `tests/AREA.md` line 18 — the verify.test.ts description to extend
- Observed shapes (fresh probe this pass, bun 1.4.5, unwrapped and `sed`-wrapped): `(pass) fast pass [0.01ms]`, `(pass) slow pass [1200.83ms]`, `(fail) times out [50.06ms]` followed immediately by `  ^ this test timed out after 50ms.`, a thrown `error: this test timed out after 50ms.` printing *before* its `(fail) thrower` line with no caret line, and a chain prefix shape `wrap | sh test/p.sh |   ^ this test timed out after 50ms.`. Bun prints ms in brackets for passes above ~0.005 ms and nothing below; the end summary does not repeat `(fail)` lines in bun 1.4.5.

## Decisions

- D1. One scan (answers "Open for the plan", design binding decision 6): refactor `failureNames` in `src/flaky.ts` into one ordered line scan `scanBunOutput(text)` returning `{ names, timeouts, durations }`, where `names` is byte-identical to today's `failureNames` output, `timeouts` is the per-chain caret-attached names, and `durations` is the raw deduped `{name, ms}` map (integer-rounded, max-per-name). `failureNames` becomes a thin wrapper returning `.names`. Reason: timeouts need line order and durations need pass lines; a second regex pass would duplicate the naming normalization and risk drift, and the extensive existing `flaky.test.ts`/`verify.test.ts` suites pin byte-identity of the refactor.
- D2. Schema, `src/verify.ts`: command row gains `timeouts?: string[]` (`.min(1)` + unique) and `durations?: {name: string, ms: number}[]` (`ms` `.int().nonnegative()`, `.min(1)` entries, unique names, enforced with `z.refine`/`z.superRefine`); `rerun` object gains the same two optional fields; the run gains `attempt?: string`. `z.strictObject` stays, so any row carrying the new keys does not parse under the older schema — which is exactly the documented stance of the previous additive fields.
- D3. Timeout attachment: iterate lines once, tracking for each chain (the `chain()` token tuple before `| `, `[]` for unwrapped) the most recent `(fail)` name of that chain. A line matching `^(?:<prefix>\| )?  \^ this test timed out after [\d.]+ms\.$` attaches to its own chain's most recent `(fail)` name, only if that name is a real test title — the final `timeouts` list is additionally intersected with the leg's `failures`, which already excludes `(script)`/`(no test name)` only when absent, so the intersection itself drops nothing a real Bun output can produce but is the schema's guard. Lines from other chains in between do not break attachment.
- D4. Durations in `commandRow`: parse raw durations from the command's own output; keep the 20 largest by ms (stable order on ties) unioned with every entry whose name is in that leg's `failures`; output sorted by ms descending. Written only when `record.scope === 'merge'` (covers base comparison rows, which share `scope: 'merge'` with `compares` set) and at least one timed line parsed. Blocked rows and setup-copy rows never pass through `commandRow`, and no writer sets `reused` since 37d5975e, so neither can carry the field.
- D5. Rerun legs: the first run's facts are computed from `first.output` and written inside the `rerun` object; the rerun leg's facts come from `second.output` and sit at top level, with top-level `timeouts` intersected with the row's final `failures` (the `still`-or-all list), so the subset invariant holds even when the rerun timed out a test the first run never failed.
- D6. `attempt`: in `runOnce`'s receipt construction, spread `...(passCaller(record).attempt === undefined ? {} : { attempt: passCaller(record).attempt })` into the first append. A crashed pass keeps it; a joined pass writes no new row (unchanged behavior); `samePass` is untouched.
- D7. Docs: extend `docs/reference/files.md`'s `verify-runs.jsonl` row with `timeouts`, `durations` (merge scope, the 20 slowest plus failures, per leg on a rerun) and `attempt` (the attempt that launched the pass), and state a ledger holding them does not parse under an older akrogon. Also one line each in `src/AREA.md`'s verify paragraph and `tests/AREA.md`'s verify.test.ts line.
- D8. `ms` rounding: `Math.round`; bracket values like `[0.06ms]` round to 0 and still count as entries (non-negative integer, no floor). Only `ms`-suffixed brackets count; `Ran N tests across ... [1253.00ms]` does not match the anchored `(pass|fail)` shape.

## Needed interfaces

- `scanBunOutput(text: string): { names: string[]; timeouts: string[]; durations: { name: string; ms: number }[] }` in `src/flaky.ts` (new, exported for nothing else initially; `failureNames` keeps its signature).
- `commandRow` in `src/verify.ts` gains computation of the two fields per leg; `runOnce`'s receipt object gains `attempt`. No other file changes.

## Units and waves

- U1 (the only unit): all owned paths — `src/flaky.ts`, `src/verify.ts`, `tests/verify.test.ts` (new tests, proof unit), `tests/fixtures/verify-runs-legacy.jsonl`, `tests/docs-links.test.ts` (one extended assertion), `docs/reference/files.md`, `src/AREA.md`, `tests/AREA.md`. Proof tests land first as their own commit, then product code.
  One wave holding exactly one unit: the run is serial-solo; A implements it itself per implement-issue's rule.

No other unit exists; shared-path splitting is pointless here since every test lives in `tests/verify.test.ts` and the product change is one mechanism.

## Done-criteria proofs, conditions and red evidence

Runner semantics follow the repo: `bun test --timeout=120000`, narrow with `-t` on `tests/verify.test.ts` (and whole-file for `tests/docs-links.test.ts`). All free; no paid launch, no live run, no credentials (`akrogon status` shows `env_names: []`, no `Missing:` lines).

### T1 — criterion 1 (durations on a merge-scope row)

New test in `tests/verify.test.ts`, working name: `a merge row records the 20 slowest durations plus every timed failure and keeps them after the log is gone`. A committed `check.sh` prints (copied observed shapes): 24 chain-prefixed timed passes `wrap | sh check-durations.sh | (pass) tNN [<ms>.00ms]` descending distinct ms (2000 down by 80), plus `(pass) untimed` without a bracket, plus `dupe` printed twice at `[1550.00ms]` and `[1450.00ms]`, a chained `(fail) zeta [5.00ms]` repeated with `[7.00ms]` second, one chained `(fail) (unnamed) [60.00ms]`, an unchained `(fail) plain-fail [3.50ms]`, one chained `(pass) theta [96.00ms]`, plus decoys `PASS x (pass) [9ms]` and `(pass) eta` (no bracket); `exit 7`. Merge-phase caller, `verify --attempt`, then delete the published log and re-read the ledger.

Assertions: `durations` holds exactly 23 entries — t01..t19 plus `dupe` (1550, max of its two lines) sorted by ms desc, plus `(unnamed) sh check-durations.sh` (ms 60), `zeta` (max 7, not 5) and `plain-fail` (ms 4, rounded); integer ms throughout; `untimed`, `eta`, `PASS x` absent; t20..t24 and theta below the cutoff absent (dupe's inclusion pushes t20 out, which itself proves dedupe keeps the list at its true length); after deleting the row's log the ledger row parses identically with durations intact. t01..t24 step down by 80 ms from 2000 so no fixture ms collides with another entry's ms.

Proof command: `akrogon run-check --name crit-durations -- bun test --timeout=120000 tests/verify.test.ts -t "20 slowest"`. Size: minutes (verify pass chain ~20-60 s). Rerun trigger: any change to scan, aggregation or schema inputs.

Conditions checked against D1/D3/D4:

- T1c cutoff at 20 (T1a's teeth): theta at 96 ms sits below every entry in the top 20 and must be absent — case present in T1. Red form at plan time: missing behavior (no implementation exists); the violation red attaches to implementation review per the standing design's deliberate-break line. Recorded red: see below.
- T1d failure-inclusion (zeta/plain-fail below cutoff included): case present in T1, same red form.
- T1e max-per-name (zeta 7 not 5, dupe 900 not 30): case present in T1, same red form.
- T1f rounding integrity (3.50→4): case present in T1, same red form.
- T1g unbracketed/look-alike lines add nothing: traced — under D1's anchored scan there is no code path that can record an unbracketed line; the case still exists inside T1 (`untimed`, `PASS x`) as a regression pin.
- T1h post-deletion persistence: no decision can reach this — durations are stored bytes on the row, not re-derived (the deletion step exists in T1 to prove storage, not recomputation). `commandRow` never re-reads logs for fields.

### T2 — criterion 2 (timeouts, both scopes, byte-identical failures)

New test: `a red row records only stream-attached timeouts at leaf and merge scope with failures unchanged`. Committed `check.sh` prints, unchained at leaf scope and chain-prefixed at merge scope (two fixture scripts or one script detecting nothing — simpler: one unchained script for the leaf run, one chained script for the merge run):

- `(fail) alpha-timeout [50.06ms]` then immediately `  ^ this test timed out after 50ms.` — but interleaved with chain `wrap-b`: in the chained variant, lines of `wrap-b` (`(pass) b-ok [3.0ms]`) sit between alpha's fail line and alpha's timeout line;
- decoy: `wrap-b |   ^ this test timed out after 100ms.` printed right after `wrap-b | (pass) b-ok [3.00ms]` (a caret whose chain's last line is a pass — must attach nowhere);
- `(fail) beta-assert [0.13ms]` with no caret (assertion failure);
- `error: this test timed out after 50ms.` then `(fail) gamma-thrower [0.06ms]` (thrown error; the caret form never appears for it);
- `exit 7`. A second green check `ok: echo ok` and a third red check `plain: echo "(fail) delta"; exit 1` with no timeout line.

Assertions: `timeouts` equals exactly `['alpha-timeout']` at leaf scope and at merge scope (merge run done with `--attempt` on the merge caller); `failures` equals exactly `['alpha-timeout', 'beta-assert', 'gamma-thrower']` (deduped, byte-exact — the value `failureNames` gives this output today); `ok` carries no `timeouts` and no `failures`; `plain` carries `failures: ['delta']` and no `timeouts`.

Proof command: `akrogon run-check --name crit-timeouts -- bun test --timeout=120000 tests/verify.test.ts -t "stream-attached timeouts"`. Size: minutes. Rerun trigger: scan or attachment logic change.

Conditions:

- T2a same-chain attachment across interleaving (the alpha case): case present in T2, red form as T1.
- T2b chain mismatch never attaches (the b-chain decoy): case present in T2, red form as T1.
- T2c thrown-error text never attaches (gamma): case present in T2, red form as T1. Note: gamma's own `(fail)` line *is* in chain `[]`; a violating implementation that attaches carets to the nearest preceding fail regardless of the caret line's presence would wrongly include gamma — the exact-positive assertion `['alpha-timeout']` has teeth here.
- T2d no timeouts on green or non-timeout red rows: case present in T2 (checks `ok` and `plain`), red form as T1.
- T2e `(script)`/`(no test name)` never enter timeouts: traced — D3 intersects with the leg's `failures` *and* caret lines only follow `(fail)` lines, while `(script)` names come from `Exited with code` lines that are never followed by a caret; no new case.
- T2f failures byte-identical to today: byte-exact equality assertions in T2 (and T1/T3/T4) against lists written from today's regex semantics. Plan-time violation red IS possible here since `failureNames` exists today: temporary edit breaking byte-identity (append `(no test name)` unconditionally in `failureNames`) makes T2 red on the failures assertion. Recorded below; edit discarded before the test commit.

### T3 — criterion 3 (rerun legs)

New test: `a merge rerun row keeps per-leg durations and timeouts with top-level timeouts a subset of failures`. Modeled on the existing rerun test at line 2705: `checks: { unit: <script printing chained timed passes + (fail) alpha […] + caret + (fail) beta […]; exit 1>, whole: 'echo whole' }`, `full: ['whole']`, `rerun: { unit: <script printing (fail) alpha […] + caret; exit 1> }`, merge-phase caller, `verify --attempt` exits 1.

Assertions: `rerun` object carries `durations` (the first leg's passes plus alpha/beta) and `timeouts: ['alpha']`; top-level `durations` holds only the rerun leg's lines; top-level `timeouts` equals `['alpha']` and is a subset of top-level `failures` (`['alpha']` since the rerun names alpha again). Second stage: change the rerun script to fail `gamma-new` (never in the first leg, with a caret), proving top-level `timeouts` is empty/absent and no `gamma-new` enters top-level `timeouts` while top-level `failures` falls back to all first-run names.

Proof command: `akrogon run-check --name crit-rerun-legs -- bun test --timeout=120000 tests/verify.test.ts -t "per-leg durations"`. Size: minutes. Rerun trigger: commandRow or scan change.

Conditions:

- T3a per-leg placement: exact assertions in T3, red form as T1.
- T3b subset invariant under fallback: the gamma-new stage, red form as T1.
- T3c first-leg facts beside first-leg log: `rerun.durations` holds the first output's passes which the rerun output never printed — teeth.

### T4 — criterion 4 (scope and blocked gates)

New test: `leaf rows carry no durations, merge and base comparison rows do, blocked rows neither`. One fixture: `checks: { red: <timed chained red script>, ok: 'echo ok' }`, `merge_checks: { member: <timed chained red script> }`. Leaf verify first: row carries no `durations` on any entry. Then merge `--attempt` verify: the red `checks` entry blocks the member; red row carries `durations` and `timeouts`, blocked member row carries neither despite its copied log containing timed lines. Then `--known-red` with the same red on the base (fixture committed to main like `failureScript`): the `compares` row carries `durations`.

Proof command: `akrogon run-check --name crit-scope-gates -- bun test --timeout=120000 tests/verify.test.ts -t "leaf rows carry no durations"`. Size: minutes. Rerun trigger: scope gate or blocked-row writer change.

Conditions:

- T4a leaf-scope exclusion: cannot break under D4's gate alone (`record.scope === 'merge'`), but the case pins it; red form as T1.
- T4b blocked rows never gain fields: the blocked member assertion has teeth because the copied log holds timed lines; red form as T1.

### T5 — criterion 5 (attempt)

New test: `verify --attempt stamps the attempt on its run row and a verify without an attempt writes none`. Merge caller `batch.attempt: 'att-facts'`: `verify --attempt att-facts` → row carries `attempt: 'att-facts'`; leaf-scope caller plain `verify` → its row carries no `attempt` key (not even undefined in the JSON text — assert via the raw ledger line lacking `"attempt"`).

Proof command: `akrogon run-check --name crit-attempt -- bun test --timeout=120000 tests/verify.test.ts -t "stamps the attempt"`. Size: minutes. Rerun trigger: runOnce or verify-pass caller change.

Conditions:

- T5a present when the pass caller carries it: case in T5, red form as T1.
- T5b absent otherwise: plan-time violation red possible: temporary edit making the copy unconditional (`attempt: passCaller(record).attempt` would still be undefined — real violation: hardcode `attempt: 'x'` in runOnce receipt construction) turns the leaf row assertion red. Recorded below; edit discarded. Note the design's stated limit stands: `leafFields` puts `batch.attempt` on every merge-phase caller, so a merge-phase leaf verifying without `--attempt` still writes `attempt` — that behavior is a consequence of the locked caller-copy decision and is not tested either way.

### T6 — criterion 6 (legacy rows parse)

New test in `tests/verify.test.ts`: `a legacy verify-runs ledger without the new fields parses unchanged`. New file `tests/fixtures/verify-runs-legacy.jsonl`: 4 rows copied verbatim from this repo's live pre-change ledger (rows carrying `failures`, `compares`, `patch_base`/`patch_id`, `slow`, blocked entries) plus one synthesized pre-change-schema `rerun` row modeled on today's rerun shape. Test copies it into a fixture repo's `issues/verify-runs.jsonl` and reads through `readVerifyRuns` (the same parse every consumer uses), expecting success and key equality.

Proof command: `akrogon run-check --name crit-legacy-parse -- bun test --timeout=120000 tests/verify.test.ts -t "legacy verify-runs"`. Size: seconds. Rerun trigger: schema change.

Conditions:

- T6a every new field optional (signpost 6a / binding decision 7): plan-time violation red possible: temporary schema edit making `timeouts` required turns this test red. Recorded below; edit discarded. Note: the test is green on the unmodified pre-change tree (old rows parse under the old schema too) — it cannot show a missing-behavior red, so its plan-time red comes from this violation edit alone, and its lasting value is a regression pin.

### T7 — criterion 7 (docs)

Extend the existing `files.md` assertion block in `tests/docs-links.test.ts` (near line 288): assert the `verify-runs.jsonl` row mentions `timeouts`, `durations`, `attempt`, the per-leg rerun placement, merge scope and the older-akrogon parse statement. Wording assertions kept to field names and fixed phrases, not prose shape.

Proof command: `akrogon run-check --name crit-docs -- bun test --timeout=120000 tests/docs-links.test.ts`. Size: seconds. Rerun trigger: docs or schema change.

### Test-Change trailer

The plan-test commit adds cases to existing `tests/verify.test.ts` and `tests/docs-links.test.ts`, so it carries `Test-Change: tests/verify.test.ts, tests/docs-links.test.ts new done-criterion proofs red on unmodified head` per the trailer rule.

## Red evidence

Tests committed on the leaf branch in 49297476 before any product code, with the `Test-Change` trailer. All runs in the leaf worktree through `akrogon run-check`; each red shows the pre-change assertions passing (exit code, failures list, rerun shape) and only the new-field assertions failing.

- T1 red: `check crit-durations-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-test-facts/verify-test-facts/implementation/check-crit-durations-red-1795577942009-1308904.log` — `entry.failures` passed as `['zeta', '(unnamed) sh check-durations.sh', 'plain-fail']`, then `durations` received `undefined` where the exact 23-entry list was expected.
- T2 red (missing behavior): `check crit-timeouts-red: 1 .../check-crit-timeouts-red-1795577952229-1309626.log` — `failures` passed byte-exact, `timeouts` received `undefined`.
- T2f red (violation edit, appended `'(violation)'` to every `failureNames` result, reverted after the run): `check crit-timeouts-violation-red: 1 .../check-crit-timeouts-violation-red-1795577985406-1313258.log` — the byte-exact failures assertion fails first.
- T3 red: `check crit-rerun-legs-red: 1 .../check-crit-rerun-legs-red-1795577956185-1310476.log` — existing rerun shape (`exit`, `failures`) passed, `rerun.timeouts` received `undefined`.
- T4 red: `check crit-scope-gates-red: 1 .../check-crit-scope-gates-red-1795577956533-1310833.log` — `timeouts` missing.
- T5 red (missing behavior): `check crit-attempt-red: 1 .../check-crit-attempt-red-1795577967812-1311789.log` — `run.attempt` undefined.
- T5b red (violation edit, `attempt: 'att-violation'` stamped unconditionally in `runOnce`, reverted): `check crit-attempt-violation-red: 1 .../check-crit-attempt-violation-red-1795577989360-1313985.log` — the leaf-scope no-attempt assertion fails first.
- T6 baseline green on the unmodified schema: `check crit-legacy-parse: 0 .../check-crit-legacy-parse-1795577979110-1312692.log` (expected; the test is a regression pin).
- T6a red (violation edit, `timeouts` made required in the command row schema, reverted): `check crit-legacy-violation-red: 1 .../check-crit-legacy-violation-red-1795577993009-1314385.log`.
- Schema invariants red: `check crit-schema-pins-red: 1 .../check-crit-schema-pins-red-1795577979238-1312810.log` — all new-field parses rejected pre-change (strictObject), proof the pins are new.
- T7 red: `check crit-docs-red2: 1 .../check-crit-docs-red2-1795577972734-1312469.log` — the exact `verify-runs.jsonl` table row lacks every new field name. (crit-docs-red, the first run, matched the `closed/` row because `verify-runs.jsonl` appears in its prose; the matcher now anchors on the row start `| \`verify-runs.jsonl\``.)

## Notes for review

- Brief criterion 5's parenthetical "a verify without an attempt writes no attempt" is read through the design: `attempt` copies the pass caller when present, and a merge-phase leaf caller carries `batch.attempt` even without the `--attempt` flag (pre-existing `leafFields` behavior). The locked design wins; tests assert only the two unambiguous cases.
- `rerun` rows in the wild: this repo's live ledger holds no rerun rows; the legacy fixture's rerun row is synthesized from today's schema and documented as such in the test.

## Implementation notes

- 2026-11-25: Under design decision 6, replaced D1's combined line scan with the original whole-text failure extraction and a separate ordered fact scan. The combined scan lost CRLF names in `check-repro-f1-red-1795579357810-2490878.log`. The original extraction preserved them in `check-fix-repros-1795580817018-3316492.log`.
