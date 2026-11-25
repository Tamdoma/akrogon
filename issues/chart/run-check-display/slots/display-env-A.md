# display-env, slot A notes (blind)

## Q1 which names

- Pick: a, the X11 pair `DISPLAY` + `XAUTHORITY`, copied only when the caller has them. Reason: P2 shows `DISPLAY` alone opens Playwright 1.63 Chromium under run-check on this host. `XAUTHORITY` is the other half of an X11 connection (X(7): clients read the cookie from `$XAUTHORITY`, else `$HOME/.Xauthority`; GNOME/GDM Xwayland put it under /run/user). Cost: a Wayland-native client with no Xwayland still gets no display.
- Rejected b: P3 shows `WAYLAND_DISPLAY` + `XDG_RUNTIME_DIR` alone do not open Playwright's Chromium (default ozone backend is X11). Adding `XDG_RUNTIME_DIR` for every repo hands every check the real runtime dir, where src/hc.ts and src/listen.ts find live hc sessions, so akrogon's own suite under run-check could reach the real hc socket. `runUnitArgv` (src/scope.ts) deliberately unsets it unless the repo asks. Repos that need Wayland already list it (framework `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`), and that keeps working.
- Evidence: better-than-training · probes P0-P3, issues/chart/run-check-display/direct, 2026-11-25 · DISPLAY suffices, Wayland vars do not. better-than-training · src/run-check.ts `copied`/`constructedEnv`, src/scope.ts `runUnitArgv`, src/config.ts reserved `constructed` set (DISPLAY not reserved, so pass_env entries stay valid), 2026-11-25. model-knowledge · X(7) XAUTHORITY semantics, not reachable on this host (XAUTHORITY unset).
- Pitfalls: (1) A test that used to run headless by accident opens a window: Playwright launches headless unless asked, so `DISPLAY` alone opens nothing; removed by the default. (2) A repo already listing `DISPLAY` in pass_env: same value assigned twice, stays valid; done-criterion 2. (3) Existing run-check env allow-list test (tests/run-check.test.ts) hand-copies names; the leaf updates it.
- Question not asked: none.

## Q2 verify

- Pick: a, verify unchanged. Reason: the failure and the lesson are on run-check, where seats run headed proofs. Configured `checks` are headless by standing design, and merge verify runs in a background land service where a window has no viewer. The verify service already forwards only `passForwarded` plus the repo's env/pass_env, so verify stays display-less with no added code. Cost: a repo that puts a headed command in `checks` still needs `pass_env` for verify (and land does not forward pass_env at all today; pre-existing, not this chart).
- Rejected b: three edit sites (copied, passForwarded, launchLand) for a case no intake reports; makes land-time merge verify able to pop windows.
- Pitfalls: run-check green but verify red for the same headed command. Removed by scope: headed proofs are run-check proofs; the docs line in docs/reference/checks.md states run-check passes the display names.

## Done-criteria I would write

1. A command run through `akrogon run-check` in a repo with empty `pass_env` receives the caller's `DISPLAY` and `XAUTHORITY` values when the caller has them, and neither name when the caller lacks them. Proof: own test through the real CLI in tests/run-check.test.ts (fails on main, passes after).
2. A repo listing `DISPLAY` in `pass_env` loads and its command still receives the caller's value. Proof: same test file.
3. docs/reference/checks.md names the display variables run-check passes.
4. Lesson "run-check drops DISPLAY" retired: line removed from learnings/LESSONS.md and `Applied <date> by <file:line>: ...` appended to learnings/history/2026-11-24-run-check-drops-display.md in the leaf diff.
