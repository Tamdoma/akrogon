# Report: session-ceiling

Base `fdc5acdd`, head `0b593c47` (branch session-ceiling; `cd24a3e4` trailer-only commit, review-B repairs `8ad8e087`..`268948f7`, slot-A `e7fb4b09` test repair, `0b593c47` prettier). Original implement run: W1 U-budget (`5912afbb`, worker Merry) + U-docs (`5e24b802`, worker Pippin); W2 U-runner (`6d869911`, worker Frodo). Cherry-picks: `72aae4c0`, `98c82d25`, `37bcea56`; A commits `5876acf8` (test correction), `074e2e0b` (prettier).

## Changed files and reasons

- `src/config.ts` — `globalSchema` optional strict `paid_budget`; `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` joined `repoSchema`'s `constructed` set (D1, D8).
- `src/budget.ts` (new) — `reserve(repo, slug, run, sessionsText)`: positive-integer parse, `paid_budget` presence, exclusive `withLock` on `<globalHome>/budget.lock`, strict `budget.jsonl` reader, rolling-24h sum across repos, `fits at <ISO>`/`never fits` refusals, `{at, repo, slug, run, sessions}` append (D2, D3, D6, D7).
- `src/run-check.ts` — `runCheck`/`checkedRun` trailing `sessions?: string`; reservation after first `failedRefusal`, before `mkdtempSync`; `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` set on the reserved run's env only (D5). `copied`/`constructedEnv` unchanged.
- `src/akrogon.ts` — passes parsed `values.sessions` through (D4).
- `src/usage.ts` — `sessions` flag in `VERB_OPTIONS['run-check']`, `RUN_CHECK_USAGE` gains `[--sessions <n>]` (D4).
- `src/state-home.ts` — `budget.jsonl` in `copiedEntries` (D9).
- `docs/reference/commands.md` run-check row; `docs/reference/config.md` `paid_budget` row, YAML sample, reserved-name prose; `src/AREA.md`, `tests/AREA.md` (U-docs).
- `tests/budget.test.ts` (new, plan), `tests/config.test.ts`, `tests/state-home.test.ts`, `tests/command-reference.test.ts` (plan test commit `7517bdf0`); `5876acf8` corrected one expectation (below).

## Commands run and results

- `bun install --frozen-lockfile --backend=copyfile` — clean (worker worktrees + lane).
- `akrogon run-check --name budget-c1 -- bun test tests/budget.test.ts` → `check budget-c1: 0 .../check-budget-c1-1795354244974-2120456.log` (13/13).
- `akrogon run-check --name budget-c7 -- bun test tests/config.test.ts -t 'AKROGON_SESSIONS|paid_budget'` → `check budget-c7: 0 .../check-budget-c7-1795354226650-2115367.log` (2/2).
- `akrogon run-check --name budget-c8 -- bun test tests/state-home.test.ts -t 'budget ledger'` → `check budget-c8: 0 .../check-budget-c8-1795354228632-2115658.log` (1/1).
- `akrogon run-check --name budget-contract -- bun test tests/command-reference.test.ts` → `check budget-contract: 0 .../check-budget-contract-1795354228756-2115771.log`.
- `akrogon run-check --name budget-help -- bun test tests/cli-help.test.ts tests/run-check.test.ts` → `check budget-help: 0 .../check-budget-help-1795354231065-2115842.log` (40/40, regression sweep over run-check and help).
- `akrogon verify` on `5876acf8`: format red on `src/budget.ts`/`tests/budget.test.ts`; repaired by `074e2e0b`.
- `akrogon verify` on `074e2e0b`: `verify leaf 074e2e0b5ea35dc91f027de7a403da3ceb2ccf87: green` — setup/format/typecheck/test 0; test ran 1331 tests across 88 files in ~179 s (`check-test-1795354430969-2121749.log`).

## 2026-11-22 check.fix (slot A, after review-B)

- F3: `refusals before the reservation` now passes `--leaf` at the real `issues/closed/...` path so the run reaches `ownerRefusal` (`owner closed` asserted). Shown load-bearing by the C6 deliberate break below.
- F4: new `an unreadable ledger refuses naming the file and leaves its bytes intact` — mode-000 ledger, `Cannot read <path>` asserted, no spawn, bytes intact after chmod restore. Shown red first against a swallowed read error (`check budget-f4: 1 .../check-budget-f4-1795355227330-2506270.log`), then green (`check-budget-f4-1795355230137-2507416.log`). Commit `e7fb4b09` with `Test-Change:` trailer.
- F7: deliberate-break evidence captured per criterion in plan.md (`check-budget-db-*` logs); every edit reverted, `check budget-c1: 0 .../check-budget-c1-1795355275347-2521463.log` (16/16).
- Re-proofs on repaired head: `budget-c1` 16/16, `budget-c7` 3/3, `budget-c8` 1/1, `budget-contract` 44/44 — green (`check-budget-c1-1795355275347-2521463.log`, `check-budget-c7-1795355284764-2523507.log`, `check-budget-c8-1795355284965-2523837.log`, `check-budget-contract-1795355287326-2523941.log`).

## Host-load verify note

Seven consecutive `akrogon verify` runs on the final tree went red only on timing failures outside the diff: format and typecheck green; test failed 1-11 of 1335 per run, all 15 s/5 s timeouts in `tests/next.test.ts`, `tests/door-reset.test.ts`, `tests/hc-identity.test.ts`, `tests/slow-merge.test.ts`, `tests/leaf-slices.test.ts` (zero files touched by this leaf). The same files pass in isolation and serially: `check budget-recheck: 0 .../check-budget-recheck-1795365501669-1914479.log` (223/223 with `--max-concurrency 1`), `check-budget-flake-1795355535839-2871785.log`, `check-budget-flake3-1795359126742-2660944.log`. A `--known-red` pass ran the base `fdc5acdd` under the same contention: it failed the same class of tests, which confirms the failures are host load, but wandering names cannot form a known-red cover. Host load averaged 40-146 with up to 13 foreign `verify-` worktrees during the window. On the first quiet minute (`load 6.3`) the full suite passed: `verify leaf d8957dad4249f5bcd13645a94011636ff1f7448d: green`, receipt `b9fedba2-1e2c-420a-b0fa-9c794d83b883`, 1335/1335 (`check-test-1795365750589-2225645.log`).

## Criterion proofs

- C1: `budget-c1` tests "a reserved run exports …" and "an unreserved run exports neither …" — green on `074e2e0b`.
- C2: "a reservation over the rolling 24-hour ceiling is refused …", "a request larger than the ceiling never fits", "a reservation at the ceiling admits" — green on `074e2e0b`.
- C3: "--sessions without paid_budget refuses …", "a non-integer or non-positive --sessions refuses …" — green.
- C4: "a malformed ledger row refuses …", "a failed ledger append refuses …" — green.
- C5: "a reserved run waits behind the budget lock …" — green.
- C6: "refusals before the reservation write no ledger row", "a run refused after reserving keeps its row" — green.
- C7: `budget-c7` reserved-name cases + "a nested run-check inherits neither …" — green.
- C8: "config prints paid_budget from the machine config" (`budget-c7`), "the session budget ledger moves with the state home" (`budget-c8`) — green.
- Doc/usage contract: `budget-contract` green; `cli-help` green via `budget-help`.

## Repairs and corrections

- Test expectation correction (`5876acf8`, `Test-Change:`): `/fits at (\S+)/` captured Bun's echoed source frame `${new` instead of the ISO in the error line. Real output `fits at 2026-11-23T11:27:53.262Z` observed in `check-budget-c1-1795354027222-2094828.log`; pattern tightened to require a date start. Returned by U-runner as a mismatch (planned test wrong), resolved as A's cited expectation correction.
- Format repair (`074e2e0b`): prettier reformat of `src/budget.ts` and `tests/budget.test.ts` after the first `akrogon verify` went red on format only.
- No worker mismatches beyond the above; no known-red retries; no refresh moves (base stayed `fdc5acdd`).

## Known limitations

- `budget.lock` itself is not moved by `state-home` (design names `budget.jsonl` only); the lock guards in-flight reservations and the move does not participate (plan L1).
- The operator adds `paid_budget` to `~/.akrogon/config.yaml` only once this build is installed (design 5'); until then `--sessions` refuses naming the key — intended.
- `akrogon verify` never reserves and exports neither variable (design exclusion).
- Paid-call guard for the e2e entry points and the seat prose (`lifecycle-rules.md`) belong to budget-rules (L2), which is blocked by this leaf, not implemented here.

## Unverified criteria

None.
