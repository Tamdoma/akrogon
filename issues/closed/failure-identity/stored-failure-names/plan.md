# Plan: stored-failure-names

Slot A, plan.synthesis, 2026-11-11. Blocked-by `failure-names` is merged; the name reader is `failedTests` (src/flaky.ts), already on this branch. Brief and design agree; no conflicts, no operator blockers, no credentials (`env_names` empty, no `Missing:` lines in `akrogon status`).

## Decisions

- **D1 (schema):** `verifyRunSchema`'s command entry gains `failures?: string[]` — `z.array(z.string()).min(1).refine((list) => new Set(list).size === list.length).optional()` inside the existing `z.strictObject`. Optional keeps pre-leaf rows parsing; `min(1)` and the dedup refine are the field's whole shape contract. Type is `VerifyRun['commands'][number]['failures']`.
- **D2 (writer sites):** only the two `runOnce` (src/verify.ts) sites where an entry's own `checkedRun` produced the log store names: the sequential-check push and the `merge_checks` member push (`result.value` of the settled entries). Each stores `await failedTests(repo, log)` read at the just-written log path, unless the list is exactly `['(log gone)']` — then no field, so no stored list ever holds `(log gone)`. Entries pushed for a failed setup (they copy `setup.code`/`setup.log`) and entries pushed `blocked` get none, whether the copied exit is non-zero or not. The base pass `verify --known-red` starts goes through the same `runOnce`, so base rows store names identically. The reader returns a non-empty deduplicated list or `['(log gone)']`, so D1's shape is met by construction.
- **D3 (stored-first readers):** `flips` (src/flaky.ts) reads `prior.failures ?? (await failedTests(repo, prior.log))` — `Red` gains `failures`. `newRedUnits` (src/verify.ts) uses `item.failures ?? (await failedTests(repo, item.log))` at both its read sites: the units of `me` and the earlier-runs match. A row without the field reads its log exactly as today.
- **D4 (never-read + ledger rewrites):** `knownRedReceipt` keeps reading both logs through `failedTests` and never touches `failures` — a gone head or base log still yields `(log gone)` and refuses. The only whole-ledger rewrite is the locked final rewrite in `runOnce`; it parses rows via `readVerifyRuns` and writes the parsed objects back whole (spread or replaced `runs[index]`), so `failures` rides through every `pending`→`shown` fold, notice record and slow update with no extra code.
- **D5 (docs):** `docs/reference/files.md` states `failures` on the `verify-runs.jsonl` row (which entries carry it, that `flaky` and `newRedUnits` read stored names first, that the known-red receipt never reads it, and that an akrogon older than this change cannot parse a ledger holding it). `src/AREA.md`'s verify paragraph states the same writer/reader rules at the entry description.

## Open-for-plan answers (design)

- Exact writer sites and `--known-red` base runs: answered by D2 — sequential site and member site only; base passes share `runOnce` and store identically.
- Every ledger rewrite site: answered by D4 — the single locked rewrite in `runOnce` writes parsed rows whole; no other file writes `verify-runs.jsonl` (grep over `src/` shows readers only: `scanRepo` in src/status.ts, `flakyCommand`).

## Interfaces

- `VerifyRun['commands'][number].failures: string[] | undefined` — non-empty, deduplicated when present (D1).
- `failedTests(repo, log): Promise<string[]>` — existing reader, called unchanged.
- `Red` in src/flaky.ts widens to `{ name: string; command: string; log: string; failures?: string[] }` or stores the whole entry.

## Read-first

- `brief.md`, `design.md` (this leaf folder).
- src/verify.ts — `verifyRunSchema`, `runOnce` (all `ran.push` sites and the locked rewrite), `newRedUnits`, `knownRedReceipt`, `requireGreenReceipt`.
- src/flaky.ts — `failedTests` (the reader, untouched), `flips`, `flakyLines`, `flakyCommand`.
- tests/helpers.ts — `fixture`, `cli`, `seedRun`, `leaf`, `fakeAkrogon`, `hcCore`/`noticeFolder` usage.
- tests/verify.test.ts — `failureScript`, `records`, `callerWorktree`, `baseRecord`, `noticesOf`, `noticeEnv`; the linked-pair and `--known-red` cases.
- tests/flaky.test.ts — the `run`/`Step` row builder and the packed/gone-log cases.
- tests/receipt-gates.test.ts — linked-pair gate cases (kept; untouched).
- docs/reference/files.md (`verify-runs.jsonl` row + flaky paragraph), src/AREA.md (verify paragraph).
- learnings/LESSONS.md — read; no lesson alters this plan. Relevant caution applied: no prose-wording assertions in tests (2026-10-01); assertions are on recorded fields, notice count/identity and exit codes.

## Checklist → waves

- **U1** (wave 1): src/verify.ts (`failures` schema field, both writer sites, `newRedUnits` stored-first ×2), src/flaky.ts (`Red` widens, `flips` stored-first). Proves criteria 1–5. Owned paths: src/verify.ts, src/flaky.ts.
- **U2** (wave 1): docs/reference/files.md, src/AREA.md. Proves criterion 6. Disjoint paths from U1, no shared fixture, no ordering dependency.
- Wave 1 = {U1, U2}. No shared test resource (fixtures are per-test temp repos), no prerequisite.

Docs touched: docs/reference/files.md and src/AREA.md (one edit each, D5). No other doc names the command-entry fields; tests/AREA.md and docs/reference-index.md unchanged.

## Done-criterion proofs

### C1 — written rows record `failures` only on own-run red entries

- **Test:** `a red check stores its failure names while green, blocked and setup-failed entries store none` and `a red merge_checks member stores its script name while blocked members store none` (new, tests/verify.test.ts).
- **Observation:** real `akrogon verify` CLI runs on an isolated fixture: run 1 setup exits 9 → every entry `exit 9`, none hold `failures`; run 2 `red` exits 7 → `commands[i].failures` equals `['alpha']` (the reader's output for its log), `ok` exit 0 holds none, `full1` recorded `blocked` holds none; run 3 at merge scope → red member stores `['(script) t:m']`, blocked members none. Catches: field dropped, wrong site, stored on setup/blocked copies, `(log gone)` stored.
- **Command:** `akrogon run-check --name stored-failures-c1 -- bun test tests/verify.test.ts --test-name-pattern 'stores its failure names|stores its script name'`
- **Size:** minutes. **Rerun:** any edit to src/verify.ts `runOnce`/`verifyRunSchema` or this test file; implement-end rerun.
- **Red evidence:** base run below — `failures` is `undefined` on the red entry.
- **Condition checks:** "no stored list holds `(log gone)`" — unreachable by construction: `failedTests` reads the log `checkedRun` just wrote at its absolute path in the same `runOnce` invocation; the `(log gone)` guard covers the only race. "Blocked/setup entries carry none" — breakable; deliberate break E1 (record `failures` on every non-zero-exit push) run red beside the test. "A `reused` entry" — `runOnce` writes none (brief note C).

### C2 — stored names survive the log for `akrogon flaky`

- **Test:** `a stored failures name survives its red log while a fieldless row still reads its log` (new, tests/flaky.test.ts; `Step` gains `failures?`). check.fix added `a verify-written red run flips to green on the same tree and flaky reports the stored name after its log is gone` (tests/verify.test.ts), the chained producer-to-consumer proof B's F1 required: `akrogon verify` writes the red run, a same-tree green follows, the red log is removed, `flakyLines` and `akrogon flaky` report `alpha`.
- **Observation:** real verify-written rows on one tree: red 7 → green 0 → red log removed → the consumer lists the stored name, not `(log gone)`. Seeded rows cover the fieldless-read path: a parallel row without the field and a gone log still lists `(log gone)`. Catches: stored names ignored; fieldless rows broken.
- **Command:** `akrogon run-check --name stored-failures-c2 -- bun test tests/flaky.test.ts --test-name-pattern 'stored failures name'` plus `bun test tests/verify.test.ts --test-name-pattern 'flips to green on the same tree'`
- **Size:** seconds. **Rerun:** src/flaky.ts or the test file changes; implement-end rerun.
- **Red evidence:** base run — `flakyLines` reports `(log gone)` for the stored row; deliberate break E2 (schema accepts `failures`, `flips` still reads the log) records the clean red.
- **Condition checks:** "stored first, log otherwise" — the tree-B fieldless row in the same test proves the otherwise-branch keeps working.

### C3 — a repeated stored name stays covered for red-main notices

- **Test:** `a stored name keeps an unresolved main-red covered after its log is gone while a different name reports` (new, tests/verify.test.ts).
- **Observation:** fixture hc core; a seeded unresolved, `pending`-noticed red base row stores `failures: ['alpha']` and its log is removed. `akrogon verify --known-red` on a red head writes a base run red on `alpha`: `newRedUnits` matches the stored name against the noticed row → no second notice file (`noticeFiles` stays 1, no `notice` recorded on the fresh base row). Then `failure` changes to `beta` on main and a repeat `--known-red` → one new `main red` notice naming `beta`. Catches: stored names ignored on the earlier-run match (re-notifies an already-noticed name) and a false cover (a different name not reported).
- **Command:** `akrogon run-check --name stored-failures-c3 -- bun test tests/verify.test.ts --test-name-pattern 'keeps an unresolved main-red covered'`
- **Size:** minutes. **Rerun:** `newRedUnits` or the test file changes; implement-end rerun.
- **Red evidence:** deliberate break E3 (schema accepts `failures`, `newRedUnits` still reads logs → the gone seeded log yields `(log gone)`, `alpha` is uncovered → a second notice is written → the `toHaveLength(1)` assert fails).
- **Condition checks:** "unresolved + already-noticed stays covered" — the seeded `pending` row whose file exists is exactly `noticeCovers`' cover; the violation E3 is the reachable break (log read instead of stored). "different name is reported" — the `beta` stage of the same test.

### C4 — stored names never satisfy the receipt when a linked log is gone

- **Test:** `stored names never satisfy the receipt when a linked head or base log is gone` and `verify --known-red fails a gone head log whose row stores the same names as its base` (new, tests/verify.test.ts).
- **Observation 1 (gate):** seeded head/base pair, both rows completed, equal `failures: ['alpha']`, linked by `compares`; with the head log removed `requireGreenReceipt(repo, head, 'leaf')` rejects `No green leaf verify receipt`; restore head log, remove base log → rejects again; both rows remain in `verify-runs.jsonl`. Catches: receipt reading `failures`.
- **Observation 2 (CLI):** real `verify --known-red` produces a passing linked pair — both rows store `['alpha']` (also proves the `--known-red` base pass shares the writer). Remove the head entry's log, rerun `verify --known-red` → prints `verify known-red <sha>: fail`, exit 1; the fresh base run it starts (readable log, red on `alpha`) is compared as today. Catches: stored names letting a gone log through at the command boundary.
- **Command:** `akrogon run-check --name stored-failures-c4 -- bun test tests/verify.test.ts --test-name-pattern 'stored names never satisfy|gone head log whose row'`
- **Size:** minutes. **Rerun:** `knownRedReceipt`, `verify --known-red` path or the test file changes; implement-end rerun.
- **Red evidence:** base run — `records(f).map(...).failures` asserts red (field absent); deliberate break E4 (schema + `knownRedReceipt` prefers `entry.failures` over the log) → the gone-head rerun prints `pass` → red.
- **Condition checks:** "head log gone refuses" and "base log gone refuses" — both covered by the gate test's two halves; E4 is the reachable break for both. "a fresh readable base run is compared as today" — the CLI test's second `--known-red` starts a fresh base run whose readable log is read. "the runs stay recorded" — ledger length asserted.

### C5 — fieldless rows parse and read logs as before

- **Proof:** existing tests, unchanged — `the receipt schema accepts both old entries and entries carrying a reused source run` (tests/verify.test.ts) and tests/flaky.test.ts's plain, packed, deleted-log (`(log gone)`), corrupt-archive and missing-member cases, which all run on rows without the field. Plus `the receipt schema rejects an empty or duplicated failures list while accepting a stored list` (new, tests/verify.test.ts) pinning the shape: `['a','b']` accepted, `[]` and `['a','a']` rejected.
- **Command:** `akrogon run-check --name stored-failures-c5 -- bun test tests/flaky.test.ts tests/verify.test.ts --test-name-pattern 'receipt schema|flaky'`
- **Size:** minutes. **Rerun:** schema, `flips`, `failedTests` or the named files change; implement-end rerun.
- **Red evidence:** the new schema test is red on base for `failures: ['a','b']` rejected by `unrecognized_keys`; deliberate break E6 (schema without the dedup refine) shows the `['a','a']` case red. Existing cases need no red.
- **Condition checks:** "row without `failures` still parses, names read from log; retired → `(log gone)`; corrupt archive / missing member raise their own error" — each clause is an existing named case; adding the optional field is the only decision touching them, covered by rerun of those files.

### C6 — docs state the field

- **Proof:** docs/reference/files.md (`verify-runs.jsonl` row and the flaky paragraph) and src/AREA.md (verify paragraph) state the field, its carriers, its two stored-first readers, the receipt's never-read and the older-akrogon parse cost. Text criterion, verified by reading; the link-integrity test keeps the files consistent.
- **Command:** `akrogon run-check --name stored-failures-c6 -- sh -c 'grep -n "failures" docs/reference/files.md src/AREA.md && bun test tests/docs-links.test.ts'`
- **Size:** seconds. **Rerun:** either doc changes; implement-end rerun.
- **Red evidence:** grep exits 1 on base (no `failures` mention yet).

## Red evidence (recorded during this pass)

All checks run through `akrogon run-check`; logs under `<leaf>/implementation/`. The tests read `failures` through a `failuresOf` cast helper so `tsc` stays green before the field lands.

- **C1** — `check stored-failures-c1: 1` (check-stored-failures-c1-1794436405702-1346001.log): both new tests red on base, `failuresOf(red)` → `undefined` vs `['alpha']` and `failuresOf(member)` → `undefined` vs `['(script) t:m']`. Deliberate break E1 `check stored-failures-e1: 1` (check-stored-failures-e1-1794436435193-1376929.log): naive `exit !== 0` writer — setup-failed entries carry `failures` → `not.toHaveProperty('failures')` fails. During E1 the `later` member's expectation was corrected to `['(no test name)']` (its log has no Bun lines; recorded correction, still the criterion's real result).
- **C2** — `check stored-failures-c2: 1` (check-stored-failures-c2-1794436408044-1349223.log): the stored-name row folds into `(log gone)` (count 2) instead of listing `alpha`. Deliberate break E2 `check stored-failures-e2: 1` (check-stored-failures-e2-1794436417941-1359470.log): schema accepts the field but `flips` still reads the log — same clean red, so the assert discriminates the stored-first rule, not the schema gap.
- **C3** — `check stored-failures-c3: 1` (check-stored-failures-c3-1794436410158-1351351.log): base red at `seedRun`, `unrecognized_keys: failures`. Deliberate break E3 `check stored-failures-e3: 1` (check-stored-failures-e3-1794436415393-1356272.log): schema accepts the field, `newRedUnits` reads the log → gone seeded log yields `(log gone)`, `alpha` is uncovered → a second notice is written (`toHaveLength(1)` fails with 2).
- **C4** — `check stored-failures-c4b: 1` (check-stored-failures-c4b-1794436451283-1393660.log): gate test red on base at `seedRun` (`unrecognized_keys`); `check stored-failures-c4: 1` (schema-only, check-stored-failures-c4-1794436418454-1359766.log): gate test passes under schema-only (kept — its refusal clauses hold either way) while the CLI test fails on `failures` undefined. Deliberate break E4 `check stored-failures-e4: 1` (check-stored-failures-e4-1794436426827-1368385.log): `knownRedReceipt` prefers stored names → `requireGreenReceipt` resolves with the head log gone (`rejects` assert fails). E4b `check stored-failures-e4b: 1` (check-stored-failures-e4b-1794436441758-1383358.log): naive writer + stored-preferring receipt → the gone-head rerun prints `verify known-red <sha>: pass` (`code` 0 vs expected 1).
- **C5** — `check stored-failures-c5: 1` (check-stored-failures-c5-1794436457468-1399349.log): existing fieldless-row cases pass (plain, packed, deleted, corrupt archive, missing member, old/reused schema acceptance); the new schema test is base-red at the acceptance assert (`failures` rejected by `unrecognized_keys`). Deliberate break E6 `check stored-failures-e6: 1` (check-stored-failures-e6-1794436446595-1389035.log): schema without the dedup refine accepts `['alpha','alpha']`.
- **C6** — `check stored-failures-c6: 1` (check-stored-failures-c6-1794436468718-1411552.log): no backticked `failures` in either doc. Proof command for the criterion: `sh -c "grep -nF '\`failures\`' docs/reference/files.md src/AREA.md"` plus `bun test tests/docs-links.test.ts` at implement end.
- **Combined** — `check stored-failures-final: 1` (check-stored-failures-final-1794436535158-1475726.log): all seven new tests red together on base; the only pass is the pre-existing old-entry schema test.

## Shared command output / count lines

No paid or live operations this pass (`grants: []`, readiness `produces: []`). Every criterion run goes through `akrogon run-check --name stored-failures-<label>`; `check <label>: <exit> <path>` lines cited below.
