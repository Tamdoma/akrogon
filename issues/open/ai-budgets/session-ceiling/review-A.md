# Review A: session-ceiling

Base `fdc5acdd`, reviewed head `cd24a3e4`. Diff reviewed `fdc5acdd..cd24a3e4` (14 files). Plan D1-D10, brief C1-C8 and design items 1-9 + corrections checked against the diff.

## Judgment per decision and criterion

- D1 schema: `paid_budget` strictObject with positive ints and nonblank `approved` fields; optional on the strict `globalSchema`, so the key parses and every other key still refuses. Verified in `tests/config.test.ts` new cases (green in `check-budget-c7-1795354226650-2115367.log`).
- D2/D3 ledger+lock: `src/budget.ts` reads `budget.jsonl` strictly (malformed line → `Invalid <path> row <i>: <line>`), filters `at > now-24h`, sums all repos, appends under `withLock(<globalHome>/budget.lock)` released before `withAdmission`. `admission.lock` is only ever taken inside `withAdmission`/`awaitLineTurn` — after `reserve` returns — so "never nested" holds by ordering.
- D4/D5 wiring: flag parsed at `akrogon.ts` boundary, `sessions?: string` threaded `runCheck → checkedRun`, `reserve` called after `refuse()`, `merge_checks` refusal, early `ownerRefusal`, `leafTarget` and first `failedRefusal`, before `mkdtempSync` — matching design 2' and C6. `env` gets the two variables only when a reservation returned; `copied` untouched (C7 non-inheritance proven by the nested test).
- D8: both names in `constructed`; T-case `config refuses AKROGON_SESSIONS and AKROGON_SESSION_MINUTES in env and pass_env` green.
- D9: `budget.jsonl` in `copiedEntries`; move case green. `init` and `migrateStateHome` both spread unknown global keys, so the doc claim "written only by the operator" holds (no akrogon command writes `paid_budget` itself).
- C1-C8 proofs: `budget-c1` 13/13, `budget-c7` 2/2, `budget-c8` 1/1, `budget-contract` 4/4, `budget-help` 40/40 all green on the reviewed tree; `akrogon verify` green (`verify leaf 074e2e0b…: green`, same tree as `cd24a3e4`).
- `fits at` semantics verified against `src/budget.ts`: rows ascending, first row whose expiry leaves `later + n <= cap`; stale and cross-repo rows handled by the window filter; `n > cap` → `never fits`; boundary `total + n == cap` admits.
- Criterion 6: all four early refusal kinds (env `refuse()`, `merge_checks` argv, owner-closed `ownerRefusal`, first `failedRefusal`) asserted no-row; late `failedRefusal` via the `full` queue keeps its row — both proven.
- AREA.md path listing: every path named by the changed `src/AREA.md`/`tests/AREA.md` lines exists (`src/budget.ts`, `tests/budget.test.ts`, plus all previously named files). Doc claims in `commands.md`/`config.md` match the implemented behavior.
- Test-quality rules: no mocks of the unit under test; expectations are behavior-shaped (exit codes, file contents, env values); one corrected expectation carries a `Test-Change:` trailer citing the real observed output; `cd24a3e4` supplies the `tests/AREA.md` trailer.

## Findings

N1 — `implementation/report.md` records head `074e2e0b`; the committed head is `cd24a3e4` (the trailer-only empty commit made at the phase gate, after the report). Deferred: the verify receipt is tree-matched (`cd24a3e4` shares `074e2e0b`'s tree), the `check.review` gate already accepted it, and `git log` shows the real order, so nothing downstream is misled today. Promotes to a Fix only if a later pass reads the report's head as authoritative for a range-diff and cannot resolve it.

N2 — `src/budget.ts`'s `earliest === undefined → never fits` branch is unreachable: with `n <= cap` the newest in-window row always satisfies `later + n <= cap` (its `later` is 0), so `find` never misses. Deferred: the line is correct where it stands and removal gains nothing over clarity for a future reader tracing the two refusal shapes. Promotes only if the refusal contract changes (e.g. a per-repo cap where the newest row can also fail).

## Verdict

nits
