# Review A: stored-failure-names

Base `ec988c5c`, reviewed head `b73a4cef` (5 commits: planned tests, A's two cited test corrections, schema+writer+readers, docs x2).

## What the diff does

`verifyRunSchema` command entry gains optional `failures` (non-empty, deduplicated). `runOnce` stores `await failedTests(repo, log)` only where that entry's own `checkedRun` produced the log and `code !== 0`, skipping a `['(log gone)']` result. `flips` and `newRedUnits` read `entry.failures ?? failedTests(...)`; `knownRedReceipt`/`requireGreenReceipt` never touch the field. `docs/reference/files.md` and `src/AREA.md` state the contract.

## Claims checked against the diff and criteria

- C1: writer sites match the design exactly — the sequential `checkedRun` push and the `merge_checks` settled push only; setup-copied pushes (`setup.code`/`setup.log`) and `blocked` pushes can't reach the writer code. `['(log gone)']` is never stored.
- C2: `flips` reads `prior.failures` first; stored names survive a removed log (planned test green).
- C3: `newRedUnits` reads stored names on both its `me` read and its earlier-run match read (planned test green incl. the different-name half).
- C4: `knownRedReceipt` still calls `failedTests(repo, entry.log)` and `failedTests(repo, onBase.log)` unconditionally — a stored-equal pair with a gone head or base log still refuses; `verify --known-red` prints `fail` for the gone head log (planned test green).
- C5: optional field parses rows without it; schema pins non-empty + deduped; existing packed/gone/corrupt-archive cases green.
- C6: both named docs state field, carriers, stored-first readers, never-read receipt and older-akrogon parse cost. Grep hits: files.md:71, files.md:93, AREA.md:17, AREA.md:31.

## Trace-through checks

- `failedTests(repo, log)` inside `runOnce` reads the just-written log: `readLog` resolves an `issues/` path to its owner dir and reads the plain file (exists), a holder path falls through `nomatch` → `existsSync` → plain read. No reachable throw for a live log; a `['(log gone)']` result (deleted between write and read) is stored as nothing, per D2 — unreachable without an external removal in the same process window, so no criterion is breakable.
- Whole-ledger rewrite (locked `finally` in `runOnce`): `runs[index] = {...runs[index], ...}` preserves `failures` on notice/slow/rewrite updates; rows come from `readVerifyRuns` (schema parse) so the field survives the fold.
- `flips` keying, `newRedUnits` `reused`/`blocked`/`compares`/resolution logic and `matching` all unchanged — stored-first swaps only the name source.
- `seedRun`/`greenReceipt` helpers parse through the new schema: stored `failures` rows in tests are real parsed rows.
- `Red = VerifyRun['commands'][number]` carries the whole entry; `prior.log` fallback kept for fieldless rows.
- `failedTests` call added inside the `merge_checks` settle loop runs after `result.status === 'fulfilled'` is established (`result.value`) — never on a rejected member.

## AREA.md path check

`grep` of every path named in `src/AREA.md`: all `src/`, `skills/`, `tests/`, `docs/` paths exist. The only misses are runtime records (`issues/verify-runs.jsonl`, `issues/timings.jsonl`, `issues/chart/`, `issues/closed/`) created at run time in the checkout, not checked-in files — consistent with the doc's intent.

## Test-writing rules

Both test commits carry `Test-Change:` trailers for the changed `tests/` files. Correction commit `6e7c003e` cites real output (exit 2 for the broken `sh -c`, merge-base predating the beta push) — meets A's cited-correction exception; no existing expectation changed.

## Nits

- `docs/reference/files.md` line 71's long em-dash clause reads awkwardly (`—, start and end`). Cosmetic only; the clause is complete and accurate. Promote to Fix only if a reader can't parse the sentence.
- `docs/reference/checks.md` line 62 describes the receipt as "each command, its exit code and its log path" without `failures`. Criterion 6 names only `files.md` and `src/AREA.md`; the sentence stays true (it lists fields, not every field) and the field is documented where the criterion requires. Promotion would need a doc-coverage criterion.

## Evidence

- `akrogon verify` on `b73a4cef`: green receipt `c4a0e3a4` (format 0, typecheck 0, test 0 — 1177 tests, recorded in `implementation/report.md` and `issues/verify-runs.jsonl`).
- Criterion proof reruns at implement end: `check impl-targeted: 0`, `check impl-flaky: 0`, `check impl-c5: 0`, `check impl-c6: 0` (logs under `implementation/`).
- Planned reds recorded in `plan.md` with deliberate-break demonstrations E1–E6.

## Verdict

`ready`
