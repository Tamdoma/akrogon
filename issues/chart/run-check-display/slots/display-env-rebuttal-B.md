# display-env rebuttal, slot B

Disagreement-only. Probed live on this host 2026-11-25 with raw `systemd-run --user --pipe --collect` services (free, no model, no file changes): the control service's env carried the user manager's `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_SESSION_TYPE=wayland`; `-p UnsetEnvironment=DISPLAY` removed `DISPLAY` from the service env entirely; the space-separated form `UnsetEnvironment=DISPLAY WAYLAND_DISPLAY` removed both.

## R1. The pitfall "never `--unsetenv`" is wrong, and wrongly attributed to me

Merged text: "display names must use its only-if-set `flatMap` pattern, never `--setenv=DISPLAY=` and never `--unsetenv` (B,C,D)."

Fact: `UnsetEnvironment=` is a standard systemd.exec unit property (man systemd.exec, since systemd 228; this host runs 262), passable through `systemd-run -p`, and my probe shows it working exactly as needed. It is also the only mechanism that implements the fork's chosen contract — "each only when the caller has it" — for the service launchers, because transient user services inherit the user manager's environment before any `--setenv` filtering applies (C's probe and mine agree on the inheritance). The conditional-setenv pattern alone cannot make an absent caller name absent in the service on a desktop host; it can only avoid making it empty. "Never `--unsetenv`" therefore forbids the correct fix and mandates the broken one.

Evidence: `better-than-training`, live probe 2026-11-25 described above, plus man systemd.exec on this host.

Consequence: the leaf should use `-p UnsetEnvironment=<the absent display names>` in `launchPass` and `launchLand` whenever the caller lacks them (conditional, exactly mirroring the only-if-set `--setenv` filter — one rule, two directions). This is one property per launcher, no new record kinds, signpost-compliant. My own Q2 notes never endorsed "never `--unsetenv`"; my P7 required absent-in-caller to mean absent-in-service and proposed the conditional filter because I had not yet probed the inheritance. The inheritance evidence refutes the filter as sufficient; `UnsetEnvironment` is what P7 actually requires.

## R2. The merged open question's recommendation is self-contradictory

Merged text: "Headless SSH caller on a host with a logged-in desktop: verify then inherits the manager's `DISPLAY`. Keep only-if-set with no `--unsetenv` (C recommends; one rule)."

Fact: this recommendation keeps the exact verify/run-check divergence the fork exists to remove, just in the opposite direction: run-check passes nothing (correctly — the caller has nothing) while verify inherits the manager's desktop `DISPLAY` and behaves differently from run-check for the same command. The scenario it names is not an edge case; it is the common shape of a seat or operator shell running headless on a desktop machine. `UnsetEnvironment` resolves it with the same one rule: caller-absent means service-absent, enforced.

Evidence: same probe and source reading as R1, `better-than-training`, 2026-11-25.

Consequence: the open question closes in favor of `UnsetEnvironment`; there is no remaining trade-off to operator-decide here.

## R3. `XDG_SESSION_TYPE` already leaks into verify and land today, whatever Q1 decides

The merged open question treats `XDG_SESSION_TYPE` as a forward-or-not question for run-check and leaves it open. Missed fact: my control service shows the user manager's env already carries `XDG_SESSION_TYPE=wayland`, so verify and land services inherit it today regardless of the fork's answer. Since D's probe shows `XDG_SESSION_TYPE=wayland` flips a default Chromium launch onto the native Wayland path, verify payloads can already behave differently from run-check payloads on this axis on hosts like this one.

Evidence: `better-than-training`, the control-service probe 2026-11-25; D's ozone-selection probe as recorded in the merged file.

Consequence: the leaf cannot leave this name undecided. Whichever way Q1 goes, the launchers need an explicit rule for it — and given that forwarding it moves existing headed proofs from the probed X11 path to a less-probed compositor path, I lean exclude for run-check and `UnsetEnvironment` it in the launchers, keeping behavior on the X11 path every slot probed. (I still do not pick adding it to the forwarded set; this is narrower: the leaf must decide it, not defer it.)

## R4. Done-criterion 4 does not test what it claims

Merged text: "with the caller lacking the three non-runtime names, the pass and land unit argv carry no `--setenv` for them."

Fact: absent `--setenv` flags do not establish absent values, because the manager environment supplies them anyway. A leaf implementing exactly this criterion would pass its proof while shipping the divergence in R2.

Evidence: same inheritance probe, `better-than-training`, 2026-11-25.

Consequence: the observable criterion should be the payload-visible env — a verify-pass command observing no value for caller-absent names — and the cheapest test asserts the `UnsetEnvironment` property in the unit argv through `FAKE_SYSTEMD_RUN_LOG` (or the payload env through the fake-systemd harness), not the absence of `--setenv`.

No other disagreement: the Q1b/Q2b consensus, the evidence table, the remaining pitfalls, and the correction of my original runtime-dir cost framing (hc's `/run/user/$UID` fallback means the variable's absence never isolated hc) all match my positions or improve them.
