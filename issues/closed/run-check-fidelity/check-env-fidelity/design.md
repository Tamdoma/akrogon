# Design: check-env-fidelity

## Binding decisions, verbatim

Chart: issues/chart/run-check-fidelity, fork [check-contract](../../../chart/run-check-fidelity/forks/check-contract.md). Taken 2026-10-22, A's pick under autopilot (not operator words): `1a 2a 3a 4a`.

- 1a: `runUnitArgv` passes `--expand-environment=no` before `--`. docs/guide/install.md states systemd 254 or later. Reason: removes the rewrite for every caller with one argument. Rejected: 1b escaping (encoding layer, double-escape risk), 1c docs (trap stays). Binding: the proof runs through real systemd-run and also through a nested run.
- 2a: constructedEnv sets `LANG=C.UTF-8` before the env/pass_env names are copied; LANG and LC_ALL stay unreserved so a repo can override. Reason: same result from every caller; one line. Rejected: 2b caller variance in evidence; 2c trap stays.
- 3a: no code. docs/guide/setup.md says the cut bus hides keyring credentials: gh must keep its token in its own file, or the repo declares GH_TOKEN in env or pass_env. Reason: honors the 2026-10-13 lock (issues/closed/host-test-load/leaf-stop/design.md, "Addendum after proof T1": gh file storage; foreclosed a D-Bus filter proxy and akrogon copying GH_TOKEN into seat env) and adds nothing. Rejected: 3b breaks browser containment and was foreclosed.
- 4a: one leaf. Reason: three edits of one or two lines each.
- Sources (A,B,C): #110 is a partial match. Its credential part is delivered here, its mise shim hang is uncovered, so #110 stays out of `sources` and open on GitHub; only #111 and #112 close with this leaf.
- Off route: the mise gh shim hang (#110) is a host shim issue; the run guard already stops the scope when the wrapper dies, and a run deadline is a product change nobody asked for. No timeout is added.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: criteria 1 and 2 are proven by the cheapest test at the real boundary, the `akrogon run-check` command. Criterion 1 needs the real systemd-run, because the defect is systemd-run's own expansion and the fake seam (tests/fake-systemd-run.sh) cannot show it; tests/run-units.test.ts already spawns the entry with the real systemd-run under the `akrogon-test-*` slice, so no machinery is added. Criterion 1 shows its test failing before the flag and passing after. Criterion 2 runs through the existing run-check fixtures (tests/run-check.test.ts); one deliberate break (removing the LANG line) turns it red. Criterion 3 is a docs edit; docs/guide link checks already run in `test`. No live run, no outside call, no new test runner.

## Leaf architecture

Owned surfaces: src/scope.ts `runUnitArgv`; src/run-check.ts `constructedEnv`; docs/guide/install.md systemd requirement line; docs/guide/setup.md `pass_env` bullet; (A,C) the tests that prove criteria 1 and 2.

- `runUnitArgv(slice, run, argv, cutBus)` returns `systemd-run --user --scope --quiet --expand-environment=no --unit=… --slice=… -p … -- env DBUS_SESSION_BUS_ADDRESS=<cutBus> <argv>`. The flag goes before `--`. Consumers: src/run-check.ts (scope path) and src/verify.ts through printed checks; both pass the caller argv after `--`. tests/fake-systemd-run.sh skips every flag before `--`, so fake-seam tests keep working.
- The nested path (`admission.kind === 'nested'` in src/run-check.ts) spawns argv directly and needs no change; criterion 1 proves it stays literal.
- `constructedEnv(repo, runRoot)` sets `env.LANG = 'C.UTF-8'` after the `copied` loop and before the `env`/`pass_env` loop, so a declared `LANG` wins. Consumers that compare the constructed env (the allowlist test in tests/run-check.test.ts) see one more key; that test's expectation changes with this reason. LANG and LC_ALL are not added to the reserved names in src/config.ts.
- Other systemd-run callers (src/land.ts `launchLand`, src/scope.ts `startRunGuard`) pass no caller argv and are excluded.
- Open for the plan: whether the existing real-unit nested test in tests/run-units.test.ts can carry criterion 1's nested case, or a new test is needed.
- Exclusions: no run deadline, no D-Bus proxy, no GH_TOKEN copying, no change to `copied` or `forbidden`.
