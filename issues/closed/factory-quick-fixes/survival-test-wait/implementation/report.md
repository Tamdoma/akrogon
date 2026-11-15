# Report: survival-test-wait

Serial-solo run (plan's single wave held one unit). One test-line change; no
product code. Scratch edits ran and were reverted; the committed head holds no
trace of them.

## Changed files

- `tests/run-units.test.ts` (commit `123c9181`, `Test-Change` trailer): the
  survivor proof now runs `await waitInactive(`akrogon-verify-${receipt.run}.service`)`
  after the receipt poll, before judging the checkout. No expectation changed.
- No `src/` change. No doc change (plan's doc checklist: none affected).

## Refresh

Fetched origin; `origin/main` = `a33d967b` was already the leaf's parent, so no
rebase ran. Base: `a33d967b5dd07829b81b9dd87802c8a72f8effbd`. Committed head:
`123c9181f2a09cd35dcf5be820a18b8649d82426`.

## Done-criteria

All runs: `akrogon run-check --name <label> -- sh -c 'akrogon guard own-modules &&
bun test --timeout=30000 --no-isolate tests/run-units.test.ts -t "survives its
caller"'` in the leaf worktree on commit `123c9181` (base runs restore the
`a33d967b` test file; scratch edits to `src/verify.ts` are uncommitted and
reverted after each run).

### Criterion 1 — delayed removal: red at base, green at head

Scratch: `await Bun.sleep(2000);` before `git worktree remove` in `runOnce`'s
finally. Both runs recorded:

- `check c1-base: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c1-base-1794392780338-2861247.log`
  — base test file, red in 4.54 s: `Expected: false / Received: true` at the
  `existsSync(receipt.path)` assertion, the shipped false-red reproduced.
- `check c1-head: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c1-head-1794392788477-2895230.log`
  — head test file, green in 6.44 s, 8 expects: the wait absorbed the delay.

### Criterion 2 — leftover checkout stays caught

Scratch: `existsSync(target) && false` on the removal line.

- `check c2-leftover: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c2-leftover-1794392796674-2965097.log`
  — red in 4.51 s: `Expected: false / Received: true` at `receipt.path` (line 990).

### Criterion 3 — never-exiting service fails through the bounded wait

Scratch: `await new Promise(() => {});` before the removal; the test's `afterAll`
`stopTestSlice` stopped the hung unit on exit.

- `check c3-hang: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c3-hang-1794392816705-3013567.log`
  — red in 16.56 s: `Timed out waiting for
  akrogon-verify-5d9bf003-5ca3-42c2-8d88-afd693356209.service to become inactive`
  thrown by `waitInactive` — names the service, well before the test's 90 s cap.

### Criterion 4 — clean head run

- `check c4-clean: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c4-clean-1794392823564-3107576.log`
  — green in 4.58 s, 8 expects: SIGKILL delivered, receipt `setup` 0, one command
  exit 0, `check-` log kept, `receipt.path` gone, `check-done` present.

## Checks and verify receipts

- `akrogon verify` run 1 (head `123c9181`): red — `test` exit 1,
  `check test: 1 .../check-test-1794392897855-3140205.log`; sole failure `agy: the
  reset helper runs its stages in order and fresh A gets the start prompt on a new
  transcript` (`tests/door-reset.test.ts`, expected 4 stages, received 0; codex
  and pi variants passed). No cause in the diff (one line in
  `tests/run-units.test.ts`).
- Retry of the recorded `test` command (single retry under the red-without-cause
  rule): `check test: 0 .../check-test-1794393017394-3516554.log` — 1152 pass,
  0 fail, 59.40 s. The `test` check is **inconsistent**: failing log
  `check-test-1794392897855-3140205.log`, passing retry log
  `check-test-1794393017394-3516554.log`.
- `akrogon verify` run 2: red — `test` exit 1,
  `check test: 1 .../check-test-1794393137734-4101725.log`; failures: the same agy
  reset-helper test plus `two simultaneous base runs produce one notice file`
  (both unrelated to the diff).
- `akrogon verify --known-red`: `verify known-red 123c9181f2a09cd35dcf5be820a18b8649d82426: fail`.
  The merge-base tree `a33d967b` already holds a whole-green row (run `ba789c4c`),
  so no linked base pass was launched and the head's red `test` entry cannot be
  covered — consistent with the failures being intermittent rather than base reds.
- `akrogon verify` run 3: green —
  `check test: 0 .../check-test-1794393238807-540351.log`, 1152 pass, 0 fail;
  `verify leaf 123c9181f2a09cd35dcf5be820a18b8649d82426: green`. format and
  typecheck green on every run.

## Wall time

Criterion proofs: seconds each (4.5–16.6 s per run). Verify suite: ~60 s per run
plus pass overhead; three verify runs total.

## Grant use

No grants consumed: no paid or live operation beyond local verify passes.

## Known limitations

- The agy reset-helper and notice-file tests are intermittent on this host (green
  on the standalone retry and on verify run 3, red on verify runs 1–2); outside
  this leaf's scope.
- The never-exit scratch run leaves cleanup to `stopTestSlice`; observed to stop
  the unit (run exited, slice cleaned).
