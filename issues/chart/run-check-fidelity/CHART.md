# Chart: run-check-fidelity

## Destination

A command run by `akrogon run-check` gets its arguments unchanged (#112) and a UTF-8 locale (#111), and the install guide states the systemd version and the gh token storage checks need (#110).

Route: lifecycle (debate no)

## Forks taken

- [Check contract](forks/check-contract.md): 1a expand-environment=no + systemd >= 254 docs; 2a LANG=C.UTF-8 overridable; 3a docs only, gh file storage or declared GH_TOKEN; 4a one leaf

## Open forks

none

## Fog

## Off route

- mise gh shim hang (#110): host shim issue; the run guard stops the scope when the wrapper dies; a run deadline is a product change with no agreed limit (A,B,C).
- D-Bus proxy or bus restore, akrogon copying GH_TOKEN: foreclosed 2026-10-13 (host-test-load/leaf-stop).

- #110 partial match: credential part delivered by check-env-fidelity (docs); the mise shim hang stays uncovered, so #110 is kept out of leaf sources and stays open on GitHub (A,B,C leaf review).

## Pending steps

none

## Mode record

- mode 2026-10-22T18:29:00Z w8:pNP f254b4d3-ac0a-4455-aec0-366ac6ba64c7: on; handed: Tamdoma/akrogon#110-#116 (charts run-check-fidelity, config-walls, orphan-pane); consultants B w8:pV5 codex, C w8:pV6 pi

## Autopilot

- switch-on: INTAKE.md "Source: operator 2026-10-22 door start"
- consultant: B w8:pV5 (codex), C w8:pV6 (pi); no loss
- route: lifecycle, debate no
- recorded only: uncommitted lesson learnings/history/2026-10-22-run-check-tmpdir-cross-device.md and its LESSONS.md line (another session's work, run-check TMPDIR on /var/tmp vs worktree on /home); not handed, left untouched
- recorded only: flaky tests "overview reads multiple repos outside git…" (4) and "two simultaneous base runs produce one notification" (1); outside the handed list
- handed off: issues/open/run-check-fidelity/check-env-fidelity (sources #111, #112), akrogon status shows plan.synthesis
- recorded only: #110 stays open (partial match, mise shim hang uncovered)
- usage: USAGE.md
- friction: A's own `timeout 100` wrapper cut the rebuttal wait for C; C was already prompted and collected with peer-wait; no consultant dropped

Handed off 2026-10-22
