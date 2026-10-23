# Opening map brief, slot B

You are consultant slot B for a chart-issues door (slot A in pane w8:pNP) on the akrogon repo /home/ivan/Work/infra/akrogon. Work blind: read no other slot's notes under /home/ivan/Work/infra/akrogon/issues/chart/gh-shim-hang/slots. Write nothing in the repo except your return file.

## Intake (read verbatim)
/home/ivan/Work/infra/akrogon/issues/chart/gh-shim-hang/INTAKE.md

## Context
- The credential half of #110 was charted in /home/ivan/Work/infra/akrogon/issues/chart/run-check-fidelity (read CHART.md and forks/check-contract.md) and delivered as a docs line in docs/guide/setup.md (pass_env bullet), commit bd996a7a. That chart put the mise shim hang Off route: "host shim issue; the run guard stops the scope when the wrapper dies; a run deadline is a product change with no agreed limit."
- The operator now asks to fix what remains of #110 on autopilot.
- Live surfaces: src/run-check.ts (checkedRun, constructedEnv), src/scope.ts (runUnitArgv, startRunGuard, stopRunUnits), src/admission.ts, docs/guide/setup.md, learnings/LESSONS.md, the mise docs for shims and `mise use`.
- The report came from another machine (/home/rudi). On this machine (mise 2026.10.15, gh 2.102.1 from mise, no ~/.local/bin/gh shim) A ran, under env -i HOME PATH TMPDIR DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent: `mise x gh -- gh --version` (0.04 s, exit 0) and `MISE_GLOBAL_CONFIG_FILE=<scratch> mise use -g --quiet gh` (fast, exit 0). You may run read-only or scratch-config probes; never touch the real global mise config.
- Locks: none. Operator values: simplest fix, remove before adding, lean code, remove a problem class rather than guard a case.

## Task
Your own position, under 80 lines:
1. Is anything in akrogon still wrong after bd996a7a? Name the concrete failure, or say none, with path:line evidence.
2. The material forks with options (include "no code: close #110"), your pick with reason and cost, rejected options with reasons, and what each could break later.
3. Evidence with tier and date, pitfalls with what removes each, and any question you would ask that this brief does not.

Return file (exact path, write it when done): /home/ivan/Work/infra/akrogon/issues/chart/gh-shim-hang/slots/map-B.md
