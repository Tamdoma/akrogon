# Plan: survival-test-wait

One test edit. No product code. The proof waits for the pass service to exit before
judging cleanup, per verify-lifetime Taken point 4 and W2 of the quick-fix contracts.

## Decisions

- D1: In `tests/run-units.test.ts`, in `a verify pass survives its caller being
  SIGKILLed mid-check and finishes like an uninterrupted run`, keep the existing
  receipt poll (it still learns the run id and still requires `end`, proving the
  check ran to its end) and add `await waitInactive(`akrogon-verify-${receipt.run}.service`)`
  immediately after it, before every existing expectation. No expectation changes;
  the wait absorbs cleanup time instead of racing it. Placement is safe: the receipt
  is appended inside `runOnce`, which only runs inside the service, so the unit is
  already active when the receipt exists and `waitInactive` cannot return during
  activation. This answers "Open for the plan" item 1: the poll stays.
- D2: Scratch delay for criterion 1 = `await Bun.sleep(2000);` inserted before
  `if (existsSync(target)) await command(['git', 'worktree', 'remove', '--force', target], repo.root);`
  in `src/verify.ts`. The base test polls `end` every 200 ms and asserts the path is
  gone immediately, so 2 s of delay makes `existsSync(receipt.path)` true at the
  assert every time on this host. Never committed. Answers "Open for the plan" item 3.
- D3: Criterion 3's never-exiting service = scratch `await new Promise(() => {});`
  at the same insertion point. The receipt is already complete, the service stays
  active past `waitInactive`'s 12 s bound, and `afterAll`'s `stopTestSlice`
  (`systemctl --user stop` on the test slice, `TimeoutStopSec=5`) kills it; no long
  scheduled sleep and no unit name needed for cleanup. Answers "Open for the plan"
  item 2.
- D4: Criterion 2's leftover checkout = scratch replacement `if (existsSync(target) && false)`
  on the removal line. Receipt complete, service exits, path stays.
- D5: Base test file for criterion 1 = `git show HEAD~1:tests/run-units.test.ts`
  written over the worktree copy after the test commit, restored after; identical
  to keeping one scratch-free path. The leaf branch holds exactly one commit.
- D6: Proof runner = `akrogon run-check --name <label> -- sh -c 'bun install
  --frozen-lockfile --backend=copyfile && akrogon guard own-modules && bun test
  --timeout=30000 --no-isolate tests/run-units.test.ts -t "survives its caller"'`.
  Single-file, name-filtered; `--no-isolate` matches the configured `test` check's
  flags; the test's own 90 s timeout stands.

## Read-first

- `tests/run-units.test.ts` (helpers `waitInactive`, `waitCheckRecord`,
  `leafReceipts`, `spawnScoped`, `realFixture`, `leafWorktree`, `rewriteConfig`,
  `outDir`; the survivor test at ~line 958; cleanup-join git-shim precedent at ~895)
- `src/verify.ts` (`runOnce` receipt rename then `worktree remove` at ~line 604;
  `launchPass` unit name; `passForwarded` PATH)
- `src/verify-pass.ts` (`passUnit(id)` = `akrogon-verify-<id>`)
- `src/scope.ts` (`sessionBusAddress` falls back to `XDG_RUNTIME_DIR/bus` when the
  env path does not exist, so real systemctl works inside `run-check`)
- `issues/chart/factory-wins/forks/contracts.md` (W2), `issues/chart/verify-lifetime/forks/run-lifetime.md` (Taken 4)

## Interfaces used (unchanged)

- `waitInactive(unit: string, ms = 12000)` — throws `Timed out waiting for <unit>
  to become inactive`.
- Service name `akrogon-verify-<run>.service` from `passUnit` + `systemd-run --unit`.

## Waves (serial-solo: one unit)

- Wave 1 / U1: owns `tests/run-units.test.ts` (the single wait edit, committed with
  the `Test-Change` trailer) and the uncommitted scratch runs in `src/verify.ts`.
  Serial because every criterion run exercises the same test and the same shared
  fixture; no parallel worker can own a disjoint path.

## Doc checklist

No agent or human doc is affected: the change is one wait inside one test.

## Criteria

Every run executes the same survivor test; `run-check` prints `check <label>: <exit> <path>`
and the failing log is read via `akrogon log <path>`.

### Criterion 1 — delayed removal: red at base, green at head

- Test: `a verify pass survives its caller being SIGKILLed mid-check ...` (base file under D2 scratch; head file under D2 scratch).
- Proof commands: two D6 runs labeled `c1-base` and `c1-head`, expected exits 1 then 0.
- Observation: real boundary = the product's own `runOnce` finally block slowed by 2 s.
  Before: base run fails with `expect(existsSync(receipt.path)).toBe(false)` → received true
  (the shipped false-red). After: head run green — the wait absorbs the delay and all
  expectations hold. Product failure caught: receipt asserted clean while cleanup in
  flight. Size: minutes (one verify pass each ~15-20 s). Rerun trigger: reapply the
  D2 scratch and rerun both labels; the runs replay a real `akrogon verify` + real
  systemd service on the fixture — no model or outside stage.
- Condition checks at planning:
  - C1.a "base shows red under the delay": decision D1 could be broken by a wait
    that polls the path instead of the service — then base goes green and nothing
    discriminates. Violation shown red at planning: base file + temp loop
    `while (existsSync(receipt.path)) await Bun.sleep(50);` under the D2 scratch →
    the run exits 0 where criterion 1 requires red. Output recorded below.

### Criterion 2 — leftover checkout stays caught

- Test: same test, head file, under D4 scratch (removal line becomes `existsSync(target) && false`).
- Proof command: D6 labeled `c2-leftover`, expected exit 1.
- Observation: before = receipt complete and service exits, checkout left behind;
  after = `existsSync(receipt.path)` true → red at the same assertion that carries
  the flake today. Product failure caught: cleanup silently skipped. Size: minutes.
  Rerun trigger: reapply D4 scratch, rerun label.
- Condition checks at planning:
  - C2.a "proof is red when the checkout is left behind": broken if the assertion
    is dropped. Violation shown red at planning: temp delete of
    `expect(existsSync(receipt.path)).toBe(false);` + wait kept, under D4 scratch →
    run exits 0 where the criterion requires red. Output recorded below.

### Criterion 3 — never-exiting service fails through the bounded wait

- Test: same test, head file, under D3 scratch (service never exits after the
  receipt is complete).
- Proof command: D6 labeled `c3-hang`, expected exit 1.
- Observation: failure text `Timed out waiting for akrogon-verify-<run>.service to
  become inactive` names the waited service; the run ends well before the test's
  own 90 s cap (the bound is 12 s). Product failure caught: a pass whose cleanup
  never finishes reported as if finished. Size: minutes. Rerun trigger: reapply D3
  scratch, rerun label. Restart boundary: the hung service is inside the test's
  `akrogon-test-*.slice`; `afterAll`'s `stopTestSlice` stops and reset-faileds it,
  so the run leaves nothing behind.
- Condition checks at planning:
  - C3.a "fails through the bounded wait": broken by no wait. Temp delete of the
    `waitInactive` line under D3 scratch → red at the path assertion within ~1 s,
    i.e. not through the bounded wait and naming nothing. Output recorded below.
  - C3.b "does not run to the test's own time cap": broken by a bound ≥ cap. Temp
    `waitInactive(..., 120000)` under D3 scratch → the run dies at the 90 s cap
    with no `Timed out waiting` line. Output recorded below.

### Criterion 4 — clean head run keeps today's evidence

- Test: same test, head file, no scratch.
- Proof command: D6 labeled `c4-clean`, expected exit 0.
- Observation: SIGKILL of the caller (`result.signalCode` = `SIGKILL`), receipt
  `setup` 0, one command exit 0, log name `check-`, log file exists, `receipt.path`
  gone, `check-done` exists — the same evidence as before plus the service wait.
  Size: minutes. Rerun trigger: rerun label on a clean tree.
- Condition checks at planning: the diff adds one statement and removes none, so
  every existing expectation is unreachable by D1's change; no decision can drop
  them. Their discriminating power is re-proven by C2.a above (the path assertion
  alone turns C2 red).

## Planning runs (recorded output)

- v4-cap: `check v4-cap: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-v4-cap-1794392719349-2463717.log`
  — bound 120000 under never-exit scratch: `this test timed out after 90000ms`,
  no `Timed out waiting` line, `1 expect() calls`. Proves C3.b.
- v3-nowait: `check v3-nowait: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-v3-nowait-1794392727106-2601559.log`
  — wait line deleted: `Expected: false / Received: true` at line 989 in 4.44 s,
  naming no service, `7 expect() calls`. Proves C3.a.
- v2-drop: `check v2-drop: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-v2-drop-1794392735109-2665470.log`
  — path assertion deleted under leftover scratch: `(pass)` in 4.61 s where the
  criterion requires red. Proves C2.a.
- v1-pathpoll: `check v1-pathpoll: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-v1-pathpoll-1794392745875-2716320.log`
  — base file + `while (existsSync(receipt.path))` poll under the 2 s delay:
  `(pass)` in 6.52 s where the criterion requires red at base. Proves C1.a.
- c4-clean: `check c4-clean: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c4-clean-1794392754436-2773133.log`
  — head test on clean tree: `(pass)` in 4.45 s, `8 expect() calls` — SIGKILL,
  setup 0, command exit 0, log kept, path gone, check-done present. Proves
  criterion 4.

## Commit

`Test-Change: tests/run-units.test.ts issues/open/factory-quick-fixes/survival-test-wait/brief.md criterion 1: the pass writes its receipt before removing its checkout, so the proof waits for the pass service (waitInactive) before asserting the checkout is gone; no expectation changed`

## Implement handoff

Serial-solo: implement A runs c1-base, c1-head, c2-leftover, c3-hang, c4-clean per
the criteria above, records each `check <label>: <exit> <path>` line and the
decisive log excerpt in `implementation/report.md`, reverts every scratch edit
(clean `git status` before dispatch), and finishes `check.review`.
