# display-env, slot B notes

## Q1. Which display variables does run-check pass, with no pass_env entry?

### Pick: b — the full set `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, each only when the caller has it

Reason: the thing being forwarded is the caller's graphical session, and that is a unit, not a menu. A Linux session is either X11 (`DISPLAY`, `XAUTHORITY`) or Wayland (`WAYLAND_DISPLAY` plus the socket's parent directory `XDG_RUNTIME_DIR`). Half-forwarding fails deterministically, and probes on this host prove both halves:

- Wayland is dead without `XDG_RUNTIME_DIR` even when `WAYLAND_DISPLAY` is set: libwayland opens the socket relative to `XDG_RUNTIME_DIR` (primary doc), and my probe `b-wl-noruntime` failed to launch with `WAYLAND_DISPLAY=wayland-1` present but `XDG_RUNTIME_DIR` stripped, while `b-wl-full` with both opened a window.
- X11 needs only `DISPLAY` here: `b-x11-display-only` opened a window with `DISPLAY` alone, and `b-x11-fake-runtime` opened one even with `XDG_RUNTIME_DIR` pointed at a nonexistent directory.
- Chromium does not auto-select Wayland: with `DISPLAY` stripped, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` correct, a default launch still failed (`b-wl-default`); only `--ozone-platform=wayland` used Wayland. So `DISPLAY` is load-bearing for Chromium even on a Wayland session, through Xwayland.

`XAUTHORITY` earns its place because xauth-based X11 sessions exist (X(7): the authority file is `$XAUTHORITY` else `$HOME/.Xauthority`), forwarding it costs nothing when unset (this host: unset, `~/.Xauthority` nonexistent, X11 authless), and "forward what the caller has" needs no per-session-type detection code.

Cost: `XDG_RUNTIME_DIR` is not only the Wayland socket's home. It holds the user bus, hc's `herdr-core/` sockets, and systemd user-manager plumbing. Forwarding it hands the payload the caller's real session infrastructure. mitigations are hollow — the bus stays cut by `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, but everything else in that directory becomes reachable. This host's `/run/user/1000` carries live `hc-serve-*` and `hc-hold-*` sockets. Accept this: a headed proof is by definition a session-attached act, and the only alternative (a synthetic runtime dir with a bind-mounted socket) is machinery far past this fix. Also note the direction is caller-controlled: a caller in a headless SSH shell forwards nothing, so nothing is ever invented.

### Rejected: a — only `DISPLAY` and `XAUTHORITY`

- It cannot forward a Wayland session at all: no `WAYLAND_DISPLAY`, and no `XDG_RUNTIME_DIR` to resolve it against. Native Wayland clients (Chromium with `--ozone-platform=wayland`, SDL, GTK4 defaulting) stay broken under run-check.
- Even the Chromium case it "solves" works only through Xwayland, which not every Wayland session runs, and silently pins every headed proof to the X11 emulation layer.
- The display variables of one session travel together or not at all; keeping `XDG_RUNTIME_DIR` out on purity grounds buys isolation theater while the real X11 socket is already exposed by the same forwarding.

### Evidence

1. `better-than-training` · probed on this host 2026-11-24, free run-check probes under holder `issues/chart/run-check-display/direct/` (logs `check-b-x11-display-only-*`, `check-b-wl-full-*`, `check-b-wl-noruntime-*`, `check-b-x11-fake-runtime-*`, `check-b-wl-default-*`): headed Playwright/Chromium 1.63 opens a window inside run-check with `DISPLAY` alone (X11) and with `WAYLAND_DISPLAY`+`XDG_RUNTIME_DIR` (Wayland, forced ozone); fails when `XDG_RUNTIME_DIR` is stripped from the Wayland pair; fails by default when `DISPLAY` is stripped. Changed: settles that Q1a is insufficient and Q1b's four names are each individually necessary somewhere.
2. `better-than-training` · Wayland client API doc, `wl_display_connect` (wayland.freedesktop.org/docs/html/apb.html, read 2026-11-24): "If name is a relative path, then the socket is opened relative to the XDG_RUNTIME_DIR directory"; default socket name `wayland-0` or `$WAYLAND_DISPLAY`. Confirms the probe's mechanism.
3. `better-than-training` · X(7)/xauth(1) man pages on this host, read 2026-11-24: X11 authorization reads `$XAUTHORITY`, defaulting to `$HOME/.Xauthority`; this host has neither (xauthless Xwayland), so `XAUTHORITY` is session-dependent — exactly why it must be conditional-forwarded rather than required or ignored.
4. `better-than-training` · akrogon source, read 2026-11-24: `src/run-check.ts` `copied` (HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME) and `constructedEnv` copy-once-when-set semantics; `runUnitArgv` already unsets `XDG_RUNTIME_DIR` when constructedEnv does not carry it, so the absence direction of "only when the caller has it" is already implemented — the fix is four names in `copied`, nothing else in the mechanism.
5. `better-than-training` · framework repo `issues/config.yaml` line 7, read 2026-11-24: `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]` — the consumer side already converged on this set minus `XAUTHORITY`, independently.
6. `operator` · intake/lesson history (Tamdoma/akrogon#155, `learnings/history/2026-11-24-run-check-drops-display.md`): two independent Himne leaves hit the same failure and the same manual workaround, confirming this is a class, not an incident.

### Pitfalls and what removes them

- P1. akrogon's own test suite runs under run-check/verify in dogfooding; the suite's `cli` helper (`tests/helpers.ts`) spreads `process.env`, so forwarded display names plus `XDG_RUNTIME_DIR` would leak the operator's real hc socket directory into fixture runs that expect scratch ones. Removed by the suite fixtures pinning or scrubbing the four names in the harness env (they already pin `HOME`, `AKROGON_HOME`, `XDG_RUNTIME_DIR` in `procFixture`/hc-fixture paths — extend the same pattern, one place).
- P2. Chromium needs `DISPLAY` even on Wayland sessions (probe `b-wl-default`), so a Wayland host with Xwayland disabled still fails headed Chromium. Nothing akrogon can forward removes this; it is upstream ozone behavior, and the failing error message is accurate. No action — name it so nobody expects forwarding to fix display-less-by-policy sessions.
- P3. Two checks opening windows concurrently is inherent to any headed proof, not introduced by forwarding. Removed by nothing in this fork; admission already serializes what repos mark `full`.
- P4. A repo's existing `pass_env` entries for these names become redundant. They stay valid (same copy semantics, no conflict), so signpost 6a holds with zero migration. Nothing to remove; confirm the config docs sentence.

### Questions the fork does not ask

- Should `constructedEnv` forward the caller's `WAYLAND_SOCKET` too? I considered it: it is an fd number valid only in the caller's process, so forwarding it across the systemd-run boundary would be actively wrong (dangling fd number). The leaf must exclude it explicitly or the mechanism breaks wayland fd-inherited launches. Worth one sentence in the implementation plan so nobody "completes" the set.
- Does `ssh -X`-style forwarding (`DISPLAY=localhost:10.0` plus a real `~/.Xauthority`) work through the systemd scope? It should (TCP, no abstract socket), but no probe covered it; acceptable as untested since the mechanism is the same copy.

## Q2. Do verify passes and land get the same display variables?

### Pick: b — yes, same names through `passForwarded` and `launchLand`

Reason: the merge gate must see the same binary behavior the leaf saw. A repo that configures a headed check in `checks` or `merge_checks` (Himne already does headed Playwright proofs, per the lesson history) gets a green run-check and a red verify for a reason invisible in the test output — the exact confusion the intake describes ("the red reads like a test failure"), one level later in the lifecycle where it costs a merge stall and a repair round. The environment is part of the command's meaning; `verifyCommands` already pins the command strings exactly (`sameCommands`); the display env is the one input left that differs by service rather than by caller intent. Mechanically it is small and symmetric: `launchPass` forwards `passForwarded` names through `--setenv`, and the service's `checkedRun` rebuilds env through `constructedEnv` — so once the four names are in `copied` (Q1) and in `passForwarded`/`launchLand`'s setenv lists, verify payloads receive exactly what run-check payloads receive. `XDG_RUNTIME_DIR` is already forwarded in both services today (for systemd machinery), so the delta is three names.

### Rejected: a — verify keeps today's environment

- It creates a verify/run-check divergence class: the same command string, same tree, different outcome depending on which service ran it. This is worse than either consistent choice because the failure appears at merge time with maximum confusion cost, and the operator's headed-proof lock makes display-dependent checks a normal case, not an edge.
- "Verify display-less is more deterministic" is false comfort: the determinism it buys is a guaranteed-wrong answer for any display-touching check, and it does not make verify reproducible anyway since `HOME`/`PATH` and the caller-selected `pass_env` already flow through.

### Evidence

1. `better-than-training` · akrogon source, read 2026-11-24: `src/verify.ts` `passForwarded` list (already carries `XDG_RUNTIME_DIR`, `HOME`, `PATH`) and `launchPass` `--setenv` filtering `env[name] !== undefined`; `src/land.ts` `launchLand` hardcodes PATH/HOME/XDG_RUNTIME_DIR/DBUS and three AKROGON_* names — display names absent in both. The service-side env rebuild inside a pass is the same `constructedEnv` run-check uses, so one `copied` change propagates inside services for free; only the two launchers need the names admitted.
2. `better-than-training` · probed 2026-11-24: verify's merge path reruns failing merge commands once (`commandRow` rerun through `checkedRun`), so a display-divergent red gets retried and re-recorded, multiplying log confusion — observed in code, not live.
3. `model-knowledge` · no outside practitioner source governs this; it is an internal consistency question about akrogon's own services, so repo evidence is the highest applicable tier. Searched nothing further.

### Pitfalls and what removes them

- P5. Merge verify inside a land runs unattended, so headed checks during merge open windows on the operator's screen at uncontrolled times. This is the configured check's own behavior surfacing honestly, not a new side effect — removed by nothing, and should not be: suppressing it is option Q2a in disguise. A repo that does not want it does not configure headed merge checks.
- P6. Same as P1 for verify: the suite's fake-systemctl fixtures must pin the names so unit argv assertions stay hermetic. Removed the same way (harness env scrub in one helper).
- P7. `launchLand`'s setenv list is unconditional (`--setenv=PATH=...` style with empty fallback), unlike `launchPass`'s `!== undefined` filter. If display names are added in the unconditional style, an absent `DISPLAY` becomes `DISPLAY=` (empty-but-set), which is worse than absent: some clients treat empty `DISPLAY` as set. Removed by using the conditional filter pattern in `launchLand` for the new names (match `launchPass` semantics: absent in caller means absent in service).

### Questions the fork does not ask

- Should `akrogon stop`/seat-launch envs get the same treatment for consistency? No — they never run repo check commands; asking it in the leaf review is scope creep. I note it so it is consciously excluded.
- Does the verify-pass service, once forwarded `DISPLAY`, need `XAUTHORITY` read access inside its sandbox? There is no filesystem sandbox in run scopes (only env shaping), so nothing to do — but the leaf plan should say this explicitly, since a reader comparing with bubblewrap-style CI runners will wonder.

## Done-criteria I would write for the leaf (observable results) and cheapest proofs

- D1. In any repo with `pass_env: []`, `akrogon run-check -- env` prints `DISPLAY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` with the caller's exact values when the caller session carries them, and prints nothing for a name the caller does not carry. Cheapest proof: free `run-check -- env` invocations on this host, with and without the names exported in the caller — exactly the probe shape I already ran (seconds, no model).
- D2. `npx playwright test --headed` (or a bare chromium launch) under `akrogon run-check` in a `pass_env: []` repo opens a window and exits 0 with no display variables set anywhere in the command or repo config. Cheapest proof: the headed probe of this chart run once against the fixed build on this host — the same probe that is red today.
- D3. A command run inside an `akrogon verify` pass observes the same four names with the caller's values; an absent caller name is absent, never empty. Cheapest proof: the existing fake-systemctl/fake-systemd-run fixture harness driving `launchPass`/`launchLand` and asserting the constructed unit argv plus the payload-visible env — free, hermetic, no real systemd needed (matches signpost 2a).
- D4. `akrogon run-check -- env -u DISPLAY sh -c 'echo "XDG_RUNTIME_DIR=<$XDG_RUNTIME_DIR>"'` shows the runtime dir still disappearing when the caller lacks it, i.e. the `runUnitArgv` unset behavior still works and no empty-string `DISPLAY`/`WAYLAND_DISPLAY`/`XAUTHORITY` ever appears in payloads. Cheapest proof: free env probes, same shape as D1's negative case.
- D5. `docs/reference/checks.md`'s environment paragraph and `config.md`'s `pass_env` row match the implemented behavior (names listed, conditional semantics stated), and the `run-check drops DISPLAY` line in `learnings/LESSONS.md` is retired in the leaf's own diff. Cheapest proof: doc text inspection plus the lesson-retire diff hunk — no execution.
- D6. akrogon's own suite passes with the harness pinning the four names, proving no fixture depends on ambient display state. Cheapest proof: `bun test` (or the repo's cheap check) — free, already the gate.
