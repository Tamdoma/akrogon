# Review B: refuse-failed-runs

2026-11-16, initial `check.review`, slot B. Reviewed independently without reading or contacting the peer.

- Base: `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`.
- Reviewed head: `007124834b61fa2f735b96be20c595f3588109e1`.
- Reviewed tree: `1e044b37d5dafe69f64fa03836da8906772a7d11`.
- Verdict: **ready**. No Fixes, Nits or operator actions.

## Behavior and contract review

- C1: `runCheck` and all verify stages reach `checkedRun`. The early refusal precedes scratch creation and admission. `leafFields` supplies a phase for both leaf and worker callers, while the actual checkout holder has no phase. `failedRefusal` reads the leaf's current state instead of deciding from the caller snapshot, emits the recovery message and throws the existing CLI refusal error.
- C2: the second fresh read runs inside the admission callback, after the fenced owner check and before capture creation or command spawn. It also runs for nested admission. Refusal releases the owner lock, admission record and temporary run root through existing finalizers, without creating `refusal.json`.
- C3: each refusal appends exactly one `check_refused` row, carrying the fresh failed phase and caller run/name/scope/slug plus available unit and attempt. The strict timing union accepts it. A refusal throws before another gate or any `check_start`/`check_end` row.
- C4: no phase check was added to publication. Already accepted commands finish. Caller resolution still takes precedence over `--holder`, so passing that option inside a leaf or worker does not bypass the gate. Actual checkout holders remain exempt. Verify receipt reuse and live-pass join return before `checkedRun` and remain unchanged.

Plan N1: keeping the slug in the missing-record recovery hint still satisfies the brief's observable requirement to name no recovery phase. The design's corrected hint omits that slug too. Both require the operator to supply a recovery phase, and this textual difference changes no recovery behavior, so it is not a defect under the function-over-form rule.

## Verification evidence

Existing evidence was sufficient. No checks were rerun and no covered operation was launched during review. Logs below were read through `akrogon log`; exits also agree with the timing ledger and verify receipts.

- V1: C1–C4 CLI tests are green in the two whole-file commands explicitly named by the plan: `bun test --timeout=30000 tests/run-check.test.ts` and `bun test --timeout=30000 tests/verify.test.ts`. `check impl-run-check-tests2: 0 implementation/check-impl-run-check-tests2-1794845200363-1061329.log` records 31 pass, 0 fail. `check impl-verify-tests2: 0 implementation/check-impl-verify-tests2-1794845204230-1064050.log` records 71 pass, 0 fail. These run after the last changes to those tests (`ed6c1ec4`, formatting only). No helpers, fixtures or runner configuration changed afterward. The commands include every criterion case, including the holder case whose title differs from the plan's narrower filter.
- V2: the required late-read deliberate break is red: `check plan-break-late: 1 implementation/check-plan-break-late-1794844999351-1028739.log`. The real queued CLI exits 0 instead of the required 1 when that read is removed. The corresponding test is green in V1. Its subsequent formatting changed no behavior.
- V3: completed verify receipt `3299dd9c-2c7c-46a3-817b-d8b81eb027ac` has setup, format, typecheck and test all at exit 0. It covers the reviewed tree exactly. Receipt SHA `7caad67d` and reviewed head have identical trees because the final commit only supplies test-change trailers. Read logs: `implementation/check-format-1794845415276-1979781.log`, `implementation/check-typecheck-1794845418499-1979781.log`, and `implementation/check-test-1794845511438-1979781.log`. The configured suite ran `bun test --timeout=30000 --parallel=4 --no-isolate`: 1199 pass, 0 fail across 83 files. No planned test was skipped, filtered out of that suite, disabled or replaced. No proof-command correction is needed.
- V4: read both earlier red suite logs and the retry. `implementation/check-test-1794845268214-1083630.log` failed only the old state-inventory expectation, correctly repaired under C1. `implementation/check-test-1794845395447-1597647.log` completed with only the door-exchange wait-code race, expecting `0` but reading an empty file. The branch changes neither that test nor its door/hc implementation. `check impl-door-retry: 0 implementation/check-impl-door-retry-1794845406215-1909352.log` passes that case, and V3 repeats the original configured suite on the unchanged tree and passes. Agree with **inconsistent**, not known-red. No base cover, blocked command or base-red filing is claimed.
- V5: all 39 existing `implementation/check-*.log` files match leaf `check_end` rows in `issues/timings.jsonl`. No capture pairs remain. Readiness has no grants, retained resources or required environment names. Artifacts describe local fixture tests only, with no unexplained paid or live activity.

## Test-Change audit

The changed old-test paths under `src/test-files.ts` are exactly `tests/run-check.test.ts`, `tests/verify.test.ts` and `tests/state-inventory.test.ts`.

Trailers in `7cee541d..00712483`:

```text
929f274c
Test-Change: tests/run-check.test.ts adds six tests for the failed-leaf refusal; no existing expectation changed
Test-Change: tests/verify.test.ts adds four tests for the failed-leaf refusal and unchanged reuse/join/holder paths; no existing expectation changed

7caad67d
Test-Change: tests/state-inventory.test.ts reorders run-check before the phase failed move; brief criterion 1 (a leaf-scoped run is refused while the leaf is failed) contradicts the old expectation

00712483
Test-Change: tests/run-check.test.ts prettier formatting only; no existing expectation changed
Test-Change: tests/verify.test.ts prettier formatting only; no existing expectation changed
```

The new criterion cases add coverage without changing old expectations. The later edits to those two files only format the additions. The state-inventory reorder has a valid cited source: C1 makes its prior successful run on an already failed leaf wrong. Running that same probe before the failure transition preserves the original healthy-sibling isolation check. The current full suite proves the reordered case too.

## Documentation, area paths and lessons

Opened `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`, `docs/reference-index.md` and the changed `src/AREA.md`. The new refusal, acceptance point, timing event and exemptions are documented. The checks page already states that holder selection applies outside leaf worktrees. No new broken link or misleading operational instruction was found.

One shell command extracted and listed repository-relative paths named by `src/AREA.md` with their existence from the worktree root. All 35 named `src/`, `tests/` and `docs/` files exist. The absent worktree paths were `issues/chart/`, `issues/closed/`, `issues/timings.jsonl` and `issues/verify-runs.jsonl`; these are intentionally checkout-owned runtime records. A read-back confirmed all four exist in the registered checkout. No dead source pointer was introduced.

The diff does not alter `learnings/LESSONS.md`. Read the registered checkout's `learnings/history/2026-11-15-background-wait-fails-leaf.md`: the implementation stops its post-failure relaunch path, while the no-report counter mechanism is outside this leaf. No lesson retirement or `Applied` claim was made. No reusable Nit remains to record.
