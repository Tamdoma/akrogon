# Review A: survival-test-wait

Base `a33d967b5dd07829b81b9dd87802c8a72f8effbd`; reviewed head
`123c9181f2a09cd35dcf5be820a18b8649d82426`.

## Diff

One line: `await waitInactive(`akrogon-verify-${receipt.run}.service`)` after the
receipt poll in the survivor proof of `tests/run-units.test.ts`. Matches plan D1
and W2/Taken 4 exactly: the proof now judges cleanup after the pass service
exits. Placement is sound — the receipt only exists in the ledger after the
service is already running `runOnce`, so `waitInactive` cannot return during
activation, and every existing expectation is unchanged (cited by the
`Test-Change` trailer on `123c9181`).

## Criteria

Verified against `implementation/report.md` and the cited `check <label>:` logs:

- C1: `check c1-base: 1` (false-red reproduced at `receipt.path`), `check
  c1-head: 0` under the 2 s delay — fail-before/pass-after both recorded.
- C2: `check c2-leftover: 1` — the kept assertion still turns red when the
  checkout is left behind.
- C3: `check c3-hang: 1` — `Timed out waiting for
  akrogon-verify-5d9bf003-...service to become inactive` at 16.56 s, naming the
  service, under the test's 90 s cap.
- C4: `check c4-clean: 0` — all eight expectations intact on the clean head.

Receipts: verify run 3 green on `123c9181` (`verify leaf ...: green`). Runs 1–2
red on unrelated intermittent tests (agy reset-helper, notice-file); the
standalone `test` retry was green → recorded `inconsistent`, and
`--known-red` judged `fail` correctly since the merge-base tree already holds a
whole-green row (no linked base run exists to cover the head entries). Both red
runs named real tests, none in the leaf's diff; the final green receipt stands.

## AREA.md

No `AREA.md` in the diff. `tests/AREA.md` names the survivor proof's file in
aggregate terms that remain accurate; no documented behavior changed — the test
still proves the same outcome, judged after service exit per the product
contract.

## Nits

- N1: The never-exit scratch vehicle (`await new Promise(() => {})`) leaked its
  service: `launchPass` pins `--slice=akrogon.slice`, so the leaked unit lives
  outside `akrogon-test-*.slice` and `afterAll`'s `stopTestSlice` never reaches
  it. Three `akrogon-verify-*.service` units from this leaf's runs were left
  `active running` until I stopped them by name (`systemctl --user stop`, all
  gone). Consequence while live: indefinitely-running processes holding their
  pass dirs under `/var/tmp/akr-1000/.../verify-passes/` (fixture-scoped, so no
  real-repo join hazard). Deferred to Nit: the scratch was never committed, the
  residue is remediated, and the proof it produced is valid. Promotion evidence:
  a repeated need for a never-exit scratch elsewhere in this suite, where a
  self-releasing shim (cleanup-join's release-file gate on `worktree remove`)
  would leave nothing behind.

## Verdict

nits — no Fix; the diff implements the locked contract exactly and every
done-criterion is proven.
