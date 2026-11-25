# Rebuttal: display-env, slot C

## Disagreement: Done-criterion 2 — "charting probe only" (A)

- **Point**: Merging Done-criterion 2 as a charting probe only (A, lines 50 and 58) instead of a leaf proof.
- **Fact**: Every charting probe ran against the unfixed installed `akrogon` binary and had to inject `DISPLAY=:0` (or the Wayland pair) inside the checked command; none of them proved that the fixed `akrogon run-check` itself forwards display variables into a real headed Chromium launch when `pass_env: []` and the command sets no display variables. A's objection ("akrogon has no Playwright dependency") applies only to committing a Playwright test under `tests/`, not to running a free one-off host proof against the leaf's CLI.
- **Evidence**:
  - Tier 1 (probe, 2026-11-25): `check-probe-c-env-1795568071281-3324217.log` (installed `akrogon run-check` drops all display vars); `check-probe-c-pw-matrix-1795568073846-3324215.log` and `check-probe-c-wayland-and-svc-1795568114155-3342862.log` (all passing headed launches injected display vars inside the command).
  - Tier 1 (probe, 2026-11-25): `check-probe-c-chrome-cgroup2-1795568235686-3405904.log` (headed Chromium stayed inside `akrogon-run-<id>.scope` in ~1 s, free on this host).
- **Consequence**: Keep Done-criterion 2 as a required free leaf proof run on this host against the leaf's CLI (e.g., `bun src/akrogon.ts run-check` invoking Playwright from `/home/ivan/Work/personal/Himne/node_modules`, with `pass_env: []` and no display vars in the command), rather than omitting it from leaf verification or adding Playwright to akrogon's committed test suite.
