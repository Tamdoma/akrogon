# Blind notes: display-env, slot D

Evidence tiers used below: T1 = observed run on this host 2026-11-25 (logs under `issues/chart/run-check-display/direct/check-d-*.log`). T2 = akrogon source at main `085f2f88` (2026-11-24), read 2026-11-25. T3 = vendor or spec document, fetched 2026-11-25.

## Q1. Which display variables does run-check pass with no `pass_env` entry?

### 1. Pick

b. Pass all four, each only when the caller has it: `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`.

Reason: the four names together are the address of the caller's graphical session. They work as two pairs that cannot be split: `DISPLAY` plus its auth file pointer, and `WAYLAND_DISPLAY` plus the directory that holds the Wayland socket. Passing a subset leaves one whole display protocol unable to open a window, which is the exact failure in #155, repeated for a different consumer. This host's session is Wayland (`XDG_SESSION_TYPE=wayland` in the caller shell); `DISPLAY=:0` exists only because Xwayland is running. A default that forwards the X pair only hardcodes Xwayland as a requirement for headed proofs.

Cost: every checked command in every repo, not only headed ones, now sees the operator's real runtime directory and display addresses. Any check that reads session services from `XDG_RUNTIME_DIR` (akrogon's own hc discovery does) or that decides headless versus headed by sniffing `DISPLAY` can change behavior. That cost is accepted and covered by a done-criterion below.

### 2. Rejected option

a (X11 pair only). It fixes today's proven consumer, because Playwright's Chromium defaults to the X11 platform and `DISPLAY` alone passed my probe. It does not remove the failure class: a consumer that talks native Wayland still exits before testing anything, and `WAYLAND_DISPLAY` without `XDG_RUNTIME_DIR` is a dead value, so a cannot be repaired later by adding one name. The fix would need a second change the first time a headed proof runs without Xwayland.

### 3. Evidence

- E1 (T1, probe `d-headed-none`, 2026-11-25): headed Chromium launch under run-check with no display variables fails with Playwright's "launched a headed browser without having a XServer running" message. Baseline `d-env-baseline` confirms the payload holds none of the four names today, while holding `HOME` and the cut `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`.
- E2 (T1, probe `d-headed-display-only`, 2026-11-25): `DISPLAY=:0` alone, with no `XDG_RUNTIME_DIR`, no `WAYLAND_DISPLAY`, and `XAUTHORITY` unset (no `~/.Xauthority` exists on this host), opens the page and exits 0. So on this host the X path needs nothing else.
- E3 (T1, probes `d-headed-wayland-xdg` and `d-headed-wayland-ozone`, 2026-11-25): `WAYLAND_DISPLAY` plus `XDG_RUNTIME_DIR` with no `DISPLAY` fails under Playwright 1.63.0 defaults, and passes with `--ozone-platform=wayland`. The Wayland pair works when a consumer asks for it; forwarding it costs nothing for consumers that do not.
- E4 (T1, probe `d-headed-wayland-noxdg`, 2026-11-25): `WAYLAND_DISPLAY` alone, even with `--ozone-platform=wayland`, fails. The socket lives at `$XDG_RUNTIME_DIR/wayland-1` on this host (observed 2026-11-25), so the pair cannot be split.
- E5 (T1, probe `d-headed-wayland-sessiontype`, 2026-11-25): adding `XDG_SESSION_TYPE=wayland` to the Wayland pair makes the default launch pass with no ozone flag. See part 5.
- E6 (T3, X(7), X.Org X11R7.7 manual, fetched 2026-11-25): `DISPLAY` is "the only mandatory environment variable" for X and "must point to an X server"; `XAUTHORITY` "must point to a file that contains authorization data" and defaults to `$HOME/.Xauthority`. `HOME` is already forwarded, so the env var matters exactly when a display manager placed the authority file somewhere non-default. Only-if-set forwarding covers that case at zero effect on hosts like this one, where it is unset.
- E7 (T3, XDG Base Directory Specification v0.8, 2021-05-08, fetched 2026-11-25): `XDG_RUNTIME_DIR` is where "user-specific non-essential runtime files and other file objects (such as sockets, named pipes, ...) should be stored", bound to the login session. It is a session address, not application data.
- E8 (T2, `src/run-check.ts` `copied` and `constructedEnv`, `src/scope.ts` `runUnitArgv`): `constructedEnv` already copies each listed name only when the caller has it, and `runUnitArgv` already returns `XDG_RUNTIME_DIR` to the payload when the constructed env carries it and unsets it otherwise. Option b is one list change; no scope change, no synthesis of values.
- E9 (T2, framework config `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml`, read 2026-11-25): it lists `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`. The fork's Q1b text says the framework repo lists the full set including `XAUTHORITY`; it does not. The three-name list is still production evidence that a real repo needs the session set under the current opt-in system.
- E10 (T2, intake #155, observation 2026-11-24): the calling shell had all session variables, the payload had none, and setting `DISPLAY` and `XDG_RUNTIME_DIR` inside the command made both headed tests pass.

### 4. Pitfalls

- P1: checks can now reach real session sockets through `XDG_RUNTIME_DIR` by standard lookup (hc session sockets, `bus`, pipewire, keyring all live in that directory here). What removes it: nothing fully, and it is not a new capability, because a run-check payload already runs as the operator's uid with the real `HOME` and no filesystem sandbox, so it could open those paths directly today. What bounds the practical risk: `DBUS_SESSION_BUS_ADDRESS` stays explicitly cut, and akrogon's own test fixtures already pin scratch runtime dirs (for example `tests/e2e/tier.ts` sets `XDG_RUNTIME_DIR` per tier). A test that only passed because the variable was absent is a fixture bug; the leaf fixes it by pinning the directory.
- P2: a tool that sniffs `DISPLAY` to choose headless mode may switch to headed now. Playwright does not (headless is its explicit default), and no current consumer in evidence does. What removes it: the leaf's proof runs akrogon's own cheap suite and one existing headless browser path under the new default and keeps them green with no window.
- P3: `XAUTHORITY` is a credential pointer; the cookie in that file grants display access. Forwarding shares it with every check. What removes the added risk: the same payload already gets `HOME`, under which the default authority file sits, so the capability class does not change; only-if-set forwarding adds nothing on hosts where it is unset.
- P4: a repo that already lists these names in `pass_env` (framework lists three) now has them arrive twice in name lists. What removes it: `constructedEnv` assigns the same caller value twice, which is a no-op, and `launchPass` already deduplicates names with a `Set`. No config migration (signpost 6a).
- P5: a caller shell holding a stale display value (for example after a session restart) passes a dead address instead of none. What removes it: nothing in this leaf; the caller's env is the only source akrogon has, the same as for `HOME` and `PATH`. Probing socket existence before forwarding would add a second policy for no proven need.

### 5. Question the fork does not ask

Should the set include `XDG_SESSION_TYPE`? E5 shows Chromium's default platform selection reads it: without it the default launch ignores the Wayland pair, with it the same launch opens a native Wayland window. Under b as written, on a host with no Xwayland, a default headed Playwright launch would still fail. Counterweight: forwarding it on a host that has both displays can switch existing headed proofs from the X11 rendering path to the Wayland one. The fork's two options cannot express this choice, and it changes what "full set" means.

### Done-criteria I would write for this part

- C1: `akrogon run-check -- env` in a repo whose `pass_env` is empty prints the caller's value for each of the four names the caller has, and omits a name the caller does not have. Cheapest test: the env probe itself at the real CLI, run once normally and once with one name removed from the caller (`env -u WAYLAND_DISPLAY akrogon run-check ...`).
- C2: a headed Chromium launch through run-check, with no `pass_env` entry and no display variable set inside the command, opens a page and exits 0. Cheapest test: the same inline Playwright script used in my probes (`about:blank`, close in the same script) run from the Himne checkout.
- C3: a headless Chromium launch and akrogon's cheap suite still pass under the new default, with the caller holding a full desktop session. Cheapest test: the repo's existing cheap check under run-check or verify, plus the inline script with `headless: true`.
- C4: a caller with none of the four names gets a payload with none of them (nothing synthesized). Cheapest test: C1's probe with all four removed from the caller.
- C5: the framework repo's config, unchanged, still yields the same three values under run-check. Cheapest test: C1's env probe pointed at that repo.

## Q2. Do verify passes get the same display variables?

### 1. Pick

b. `passForwarded` (verify pass service) and `launchLand` (land service) forward the same names, each only when set.

Reason: one function, `constructedEnv`, already decides the environment for both run-check commands and verify commands. Verify runs its setup and checks through `checkedRun`, which builds the payload env with that same function. The only thing standing between a verify payload and the display set is whether the systemd service's own `process.env` carries the names for `constructedEnv` to read. The comment on `passForwarded` already states the rule for that list: the names "only carry what the caller's own constructedEnv and overrides already select". Adding names to `copied` and not to the two service lists breaks that rule and creates an env that depends on which door the same command entered through.

Cost: a headed command configured as a repo check can now open windows during verify and during a land, and a headed gate depends on a live desktop session. Both are properties of the repo's own check command, which akrogon already honors today when the repo lists the names in `pass_env` (framework does).

### 2. Rejected option

a (verify keeps today's environment). It produces the worst failure shape available here: a seat proves a headed command green under run-check, then verify or merge verify runs the identical command red with "Missing X server or $DISPLAY", while a local env probe says the environment is correct. It also does not even preserve today's shape cleanly: `passForwarded` already contains `XDG_RUNTIME_DIR` and `launchLand` already sets it, so under Q1b plus Q2a a verify payload would receive `XDG_RUNTIME_DIR` but no display name, a third env shape that matches neither today nor run-check. Keeping merge verify display-less on purpose would need an argument that a gate must be display-less even when the repo configured a headed check; starving the env makes that check red, not headless.

### 3. Evidence

- E11 (T2, `src/verify.ts` `runOnce` and `src/run-check.ts` `checkedRun`): verify runs setup and every check command through `checkedRun`, the same path that builds the run-check payload env at `constructedEnv`. There is one env policy function for both doors.
- E12 (T2, `src/verify.ts` `passForwarded` and `launchPass`): the pass service receives only the names in `passForwarded` plus the repo's `env` and `pass_env`, set via `--setenv`. `XDG_RUNTIME_DIR` is already in `passForwarded`; the three display names and `XAUTHORITY` are not.
- E13 (T2, `src/land.ts` `launchLand`): the land service gets fixed `--setenv` entries including `XDG_RUNTIME_DIR` from `runtimeDir()`, and only-if-set entries for `AKROGON_HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`. Land then runs verify in-process, so whatever land lacks, its verify pass lacks. Land also already requires the user session (systemd `--user` plus the session bus address), so a live session is an existing precondition, not one this change adds.
- E14 (T2, framework config read 2026-11-25, and `launchPass` including `repo.config.pass_env`): a repo that opts in today already gets display parity between run-check and verify. Option b makes the existing opt-in behavior the default rather than inventing new behavior.
- E15 (T2, intake #155, 2026-11-24): the operator's headed-only requirement put headed runs on the lifecycle path, so verify and merge verify are places a headed proof is expected to run, not places it should be starved.

### 4. Pitfalls

- P6: three lists (`copied`, `passForwarded`, `launchLand`'s setenv names) can drift apart in a later edit, recreating the split silently. What removes it: one shared exported name list for the display set, consumed by all three sites, so the set exists in exactly one place.
- P7: `launchLand`'s fixed entries use `?? ''` and `runtimeDir()`'s synthesized fallback; copying that pattern for display names would set `DISPLAY=` (present but empty), which is a different state from unset and breaks clients that test presence. What removes it: use the only-if-set `flatMap` pattern already present in `launchLand` for the `AKROGON_*` names, and never synthesize a display value.
- P8: windows appearing during an unattended land can steal focus or sit open if the command hangs. What removes it: nothing in akrogon, correctly, because headed versus headless is the check command's own flag; a repo that wants a quiet gate configures a headless check. The env only permits what the command asks for.
- P9: verify's setup command also goes through `checkedRun`, so setup receives the display set too. What removes it: nothing needed; it is the same single policy, and setup ignoring the variables is the normal case.
- P10: merge verify inside a land runs long after the seat that launched it; if the operator logged out mid-land, a headed gate goes red for an env reason. What removes it: nothing in this leaf, and the exposure is pre-existing: the land service itself needs the user session bus to run at all (E13), and a headed gate is red in that state under today's opt-in too.

### 5. Question the fork does not ask

The fork treats "the same display variables" as the whole parity question, but the DBus cut is asymmetric across the doors and unmentioned: a run-check payload gets `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, while forwarding `XDG_RUNTIME_DIR` makes the real bus reachable by path (`$XDG_RUNTIME_DIR/bus`), and akrogon's own `sessionBusAddress()` re-derives the real bus from the runtime dir when the cut address does not exist. Does the leaf keep the DBus cut exactly as the stated policy while the runtime dir makes it porous, and should checks.md say so in the same paragraph? My picks assume yes, keep the cut unchanged, but the fork never asks.

### Done-criteria I would write for this part

- C6: a verify run of a check that prints its environment shows the same display values as the same command under run-check, in a repo with empty `pass_env`. Cheapest test: an env-printing check run through `akrogon verify` at the real boundary in a fixture or scratch repo, compared with C1's output.
- C7: a land's merge verify sees the same values. Cheapest test: the existing fake-systemd capture (`FAKE_SYSTEMD_RUN_LOG` is already forwarded for this purpose) shows the display names reaching both the land unit and the pass unit argv, only when the caller has them; plus C6 for the live path.
- C8: when the caller has no display variables, service argv contains no display `--setenv` entry at all (no empty values). Cheapest test: the same fake-systemd capture with the names removed from the caller.
- C9: docs match behavior: the check-environment paragraph in `docs/reference/checks.md` and the `pass_env` row in `docs/reference/config.md` state that display session variables are basics every check gets, and the "run-check drops DISPLAY" lesson line is retired. Cheapest test: read the two paragraphs against C1 and C6 output.
