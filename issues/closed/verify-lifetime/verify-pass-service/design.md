# Design: verify-pass-service

## Binding decisions, verbatim

### run-lifetime (issues/chart/verify-lifetime/forks/run-lifetime.md), A's autopilot pick 2026-10-27: `1a 2a 3a`

1. Each verify pass (one `runOnce`) runs in its own systemd user transient service launched like `src/land.ts` `launchLand`, placed in `akrogon.slice`, not a leaf slice. Its checks keep today's placement through `checkedRun`. Reconcile rules are unchanged: the live-run veto keeps running and waiting checks, and the pass service is never a slice-stop target. The calling `akrogon verify` only waits and prints. Killing the caller, its process group or its pane scope leaves the pass running.
2. The pass carries the starting caller's scope (`callerScope()` in the caller), so every check record it creates keeps that scope as owner, as today. Plain `akrogon stop-run` and `stop-run <check run id>` behave as today. New: `akrogon verify` prints its pass id before any check, and `akrogon stop-run <verify run id>`, authorized by the same scope match, stops the whole pass: current check, later checks and any waiting admission.
3. Join key: starting caller scope, caller target as `verifyCaller` resolves it (leaf folder, or the exact holder path), tree, verify scope, exact command set and `compares` link. A repeat `akrogon verify` joins only a pass whose service is active and whose key matches. Anything else starts its own pass.
4. The waiter waits for the pass service to exit, then prints the same per-command lines and returns the same exit code an attached run would, including a failure after the receipt is written (main-red notice, checkout removal), and non-zero for a receipt with no `end`. A dead pass is never joined.
5. At most one live pass per join key. Admission policy unchanged and not described as a host bound.
6. Receipts: no `end` still means incomplete and never reused. No reason field, no signal handler. Completed-receipt gates (`completed`, `greenRun`, `reuseSource`, `requireGreenReceipt`, `knownRedReceipt`) unchanged.
7. The test "a run killed during setup leaves a record with start and no end or removal" (tests/verify.test.ts) encodes the old caller-bound lifetime; the leaf owns changing it.

Reason: 1a removes the whole class (tool timeout, pane loss, task stop) with nothing for a seat to remember; the instruction fix of 2026-10-15 was in place for all 21 pi kills. 2a keeps one live pass per caller and keeps cancel rights where stop-run puts them today. 3a keeps receipts truthful without schema.

Foreclosed: seat instructions only (probabilistic, already failed 21 times); raising pi's default timeout (reverses the operator's 2026-10-15 overnight-recs D3 answer); joins across leaves or scopes; no join; a reason field or abandoned marking on receipts; signal handlers.

### Standing design

Installed path: /home/ivan/.akrogon/current/skills/chart-issues/assets/standing-design.md. How it applies here:

- Criteria 1-5 are proven at the CLI boundary with real systemd user units, (A,B) the way the existing real-unit tests in `tests/run-units.test.ts` and `tests/verify.test.ts` run. These use the repo's existing runner, fixture repos and cleanup helpers, which do not count as machinery. The leaf builds no runner or fixture factory.
- Criterion 1 is a proven bug: its test fails on the base (the pass dies with the caller) and passes after.
- Criteria 2-5 are new behavior: each test is shown turning red under one deliberate break.
- The test named in decision 7 holds an outdated expectation. Change or delete it with its reason, and follow the repo's `Test-Change:` commit trailer rule (`src/test-files.ts`, implement-issue).
- Criterion 6 is proven by reading the changed doc rows and AREA lines back against the shipped behavior in review, not by a runtime or text-shape test. (A,B)
- No model or outside account is involved. No secret is read.

## Leaf architecture

Owned surfaces: `src/verify.ts` (`verify`, `runOnce`, `reportRun`, the receipt record), `src/stop-run.ts` (`stopRunCommand`), the `verify` and `stop-run` wiring in `src/akrogon.ts`, the scope carrier in `src/run-check.ts` (`checkedRun`) and `src/admission.ts` (`callerScope`) (A,B), `src/land.ts` only where its `verify()` call needs an edit to get a pass service (A,B), tests for the criteria, `docs/reference/commands.md` (verify and stop-run rows), `src/AREA.md` (verify and run-check lines).

Interfaces:

- `akrogon verify [--sha] [--attempt] [--holder] [--known-red]`: the flags are unchanged. A new first line `run <pass id>` uses the same `run <id>` form check runs print, so the existing seat instructions in `skills/check-issue/SKILL.md` and `skills/implement-issue/worker-protocol.md` ("stop a run with `akrogon stop-run <run-id>`, the id the `run` line printed at run start carries") cover a pass unchanged. A known-red call prints one `run` line per pass.
- `akrogon stop-run <id>`: resolves a check run as today, otherwise a live pass whose recorded starting scope equals `callerScope()`.
- Pass service: unit name derived from the pass id, `--slice=akrogon.slice`, `CollectMode=inactive-or-failed`, the env `launchLand` forwards, the starting caller scope, and every input `src/run-check.ts` `constructedEnv` reads from the caller's process (configured `env` and `pass_env` names, `XDG_CACHE_HOME` and the other process variables it selects) with the caller's values, so checks see the same environment as an attached run. This changes transport only, not the environment policy. (A,B)

Changed states and their consumers:

- Check-run owner scope. Today `src/admission.ts` `callerScope` reads the caller's cgroup or the `AKROGON_RUN` token. Inside a service there is no `.scope`, so the pass must hand its starting scope to `checkedRun` and admission. Consumers: `src/run-check.ts` `checkedRun` (writes `scope: callerScope()`), `src/stop-run.ts` `stopRunCommand` (scope filter), `src/admission.ts` `liveRuns`/`withAdmission`, `src/reconcile.ts` `sliceKeepReason` (live-run veto). Ordinary `run-check` cancellation and admission policy stay unchanged. The existing `AKROGON_RUN` token is not a plain scope carrier: `nested` also decides whether a check gets its own admission and unit, so reusing it changes more than the owner. (A,B) Open for the plan: the exact carrier and that `liveRuns` records still parse.
- Receipt `pid`. It becomes the pass service's process. Consumers: `src/verify.ts` notice liveness (`run.boot_id === boot && pidAlive(run.pid)`), `src/reconcile.ts` `verify-*` store-leftover owner checks. Both stay correct when `pid` is the process that owns the checkout, which the pass process is.
- Pass liveness and outcome. The waiter needs the pass service's exit status after a collected unit is gone (criterion 3). Open for the plan: where the pass leaves its exit status for every waiter (for example a status file beside the receipt lock, removed by the pass's own cleanup or reconcile), without a receipt schema change.
- `src/land.ts` calls `verify()` inside the `akrogon-land-<attempt>` service, which sits in a leaf slice. That call gets a pass service in `akrogon.slice` like every caller (binding decision 1). Land's receipts, exit codes and `requireGreenReceipt` result stay the same. (A,B)
- `src/reconcile.ts` removes dead `verify-*` checkouts by owner state. A live pass service's checkout must stay kept. Open for the plan: confirm the owner check sees the pass process alive.

Exclusions: no change to `skills/` text, admission policy, reconcile rules, receipt schema, pi-extensions (owner: operator's 2026-10-15 D3 answer) or `src/run-check.ts` cancellation for ordinary `run-check` calls.

Dependencies: none.
