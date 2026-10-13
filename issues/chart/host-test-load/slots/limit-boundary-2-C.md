# Blind notes 2, slot C: limit-boundary after measurement

Question: is 1a still the right boundary, and what must change. Read 2026-10-13.

## 1. Pick: 1a survives, reshaped in three binding ways

1a stays the boundary, but neither half survives in its round-1 shape. The permit becomes the primary limit, the seat containment only works with the session bus cut at both env layers, and the slice ceiling changes from hard caps to soft pressure.

### Permit: unchanged, and now measured as sufficient at 1

One run alone made host load about 12 on 32 threads (fork, Measurement 2026-10-13). That is the first evidence that a permit of 1 is a host-safe state, not just a guess. The seat slice no longer needs to make concurrent runs safe; it needs to make the one admitted run and any ad-hoc run stoppable. On the operator's slowdown question: nothing in the reshaped 1a slows a single run on an idle host (soft weights below only bite under contention). The cost stays where it was: heavy runs from parallel leaves queue instead of overlapping, and a full solo run's duration is still unmeasured because the measurement was stopped at 2.5 minutes.

### Bus cut: both layers, invalid bus address, display untouched

Chrome escapes because it can reach `org.freedesktop.systemd1` on its session bus (fork, Chrome self-scoping mechanism). The cut must be an explicitly invalid `DBUS_SESSION_BUS_ADDRESS` (the probed `unix:path=/nonexistent` shape), set in two places:

- Seat placement env, so ad-hoc commands and worker shells inherit it. Run-env alone leaves the incident's actual bypass class (direct `bun run test:changed`, worker scripts) free to self-scope out of the seat unit, and seat containment without the seat-env cut is false advertising.
- `constructedEnv` (`src/run-check.ts:41-56`), set after the `env`/`pass_env` loop, and used by base-run too (`src/base-run.ts:153`). This layer is not redundant: the whitelist drops the seat's bus variable but `pass_env` re-adds `XDG_RUNTIME_DIR` (framework `issues/config.yaml:20`), and the session bus lives at `$XDG_RUNTIME_DIR/bus` (present on this host, `/run/user/1000/bus`), so an omitted variable is still a discoverable bus. Only an explicit invalid address cuts it. `DBUS_SESSION_BUS_ADDRESS` belongs in the reserved constructed-names set (`src/config.ts:69-88`) so a repo `pass_env` cannot silently reopen the hole.

`DISPLAY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` stay exactly as passed today. Framework passes them on purpose, and the Wayland socket is found through `XDG_RUNTIME_DIR`; cutting the runtime dir to hide the bus would break the display path along with it.

Does anything need the bus? No first-party use found: no dbus, portal, or notify calls in blepsis `scripts/`, akrogon `src/` or `skills/`, or framework workflow and hook scripts (grep, 2026-10-13). That is absence from a search, not proof. What a grep cannot see: a git credential helper using the secret service, `gh` keyring use, `xdg-open`, or a headed test wanting a portal. A door probe with the seat env cut (seat smoke operations plus one browser suite) is required before handoff and is pending. The failure mode is at least visible: a tool that needs the bus fails with a connection error. If the probe finds a real bus need, the fallback is a private session bus per contained tree, where `org.freedesktop.systemd1` has no owner and Chrome still skips self-scoping per its source condition, accepting the extra daemon lifecycle. If the seat probe fails outright, the seat half of 1a is dead and the honest boundary degrades to contain-only-runs (rejected below as the answer, named here as the fallback).

The `SNAP` or `FLATPAK_SANDBOX_DIR` sentinel is rejected as the primary cut. It preserves the bus, but it works by lying to every snap and flatpak aware program in the tree, including Chromium itself, whose other snap behavior (profile and path handling) is unprobed. Silent behavior change in the exact binary being contained is worse than a loud bus failure. Keep it noted only if some Chrome binary ignores a bogus bus address.

### Ceiling: no hard caps; soft pressure only

The measurement disproves each hard cap at a useful value:

- No `TasksMax`. One run exceeds 3000 tasks and a task cap converts to creation failures and core dumps (fork measurement; `systemd.resource-control` man page: `pids.max`). A value high enough to never fire is decoration, and the true peak is still unknown above 3000.
- No `CPUQuota` as the working limit. Even at 1600% the solo run was throttled 30 s in 150 s. Quota on the slice would slow legitimate single runs and feed browser timeouts.
- No `MemoryMax` as the working limit. It invokes the OOM killer inside the unit (man page), which reads as crashed tests. The man page itself recommends it only as the last line of defense.

Instead: `CPUWeight` low on the akrogon slice relative to the operator's session (relative share under contention only, so tests use an idle host at full speed and lose to the operator when both want CPU), and a generous `MemoryHigh` (throttle and reclaim, may be exceeded, never kills). Both match the actual complaint, an unusable PC, better than any cap: the permit bounds how much work exists, the weights decide who suffers when work overlaps the operator. Cost: weights do not bound an idle-host run at all, so fans and heat from one admitted run remain; measured load 12 says that is acceptable. Values stay unwritten until a full solo run completes; 13.9 GB and 228 Chrome processes at 2 minutes is a floor, not a peak.

## 2. Rejected options

- 1b, now including its improved form "contain only runs, bus cut in run env": rejected as the answer for the round-1 reason, strengthened. Ad-hoc runs were most of the incident, and without the seat-env cut their browsers escape even seat-level measurement. It is the named fallback if the seat bus probe fails, and the natural first leaf, but picking it now decides the operator keeps killing seats by hand during the next incident.
- 1c hard ceiling: rejected on evidence now, not argument. `TasksMax=3000` produced 41 in-scope core dumps in about 2 minutes. Its soft form is absorbed into the pick.
- 1d: unchanged, counts panes.
- Browser-level limit (new): rejected. The launch surfaces are many and bypassable by construction: framework's site-nav runner sets `CHROME_PATH=/usr/bin/chromium` inside the process (framework `.claude/skills/dev-render-satellite/test/site-nav-e2e-run.ts:123`), run-check refuses `CHROME_PATH` and `CDP_BROWSER_BINARY` at its own boundary (`src/run-check.ts:21-28`), and Playwright launches its bundled headless-shell by path. A global browser counter would need every launcher patched across three repos and still would not bound the non-browser load: the measured run reached over 3000 tasks with 228 Chrome processes, so tasks and threads dominate the count and browsers are not the load unit.
- Manage Chrome's own `app-*.scope` units (new): rejected as the mechanism. Those units are named by pid only, the operator's own Chrome matches the same pattern (measurement cleanup had to spare PID 2326745), and attributing a unit to a leaf is time-and-pid guesswork. Fine as a manual incident sweep with evidence; dangerous as an automatic stop.
- Bus cut at run env only, or seat env only: rejected. Run-only leaves ad-hoc escaped; seat-only is undone by `constructedEnv` rebuild plus `XDG_RUNTIME_DIR` passthrough, above.

## 3. Evidence

- better-than-training · fork Measurement 2026-10-13 and `learnings/history/2026-10-13-chrome-escapes-cgroup.md` · solo run: tasks over 3000, 13.9 GB, 228 Chrome processes, load about 12, 41 core dumps at the task cap, 9 escaped browsers in `app-*.scope` units · removed hard caps, justified permit at 1, and killed containment-without-bus-cut.
- better-than-training · Chromium `components/dbus/xdg/systemd.cc` via fork mechanism section, plus door probe with `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, 2026-10-13 · self-scoping is skipped when the bus is unreachable or systemd1 has no owner · made the bus cut a binding part of 1a. Limits as recorded in the fork: one Chrome binary; Chromium and headless-shell unprobed.
- better-than-training · `src/run-check.ts:41-56`, framework `issues/config.yaml:20`, host check `/run/user/1000/bus`, 2026-10-13 · run env omits the bus variable but passes the runtime dir that locates the bus · forced the explicit invalid address in `constructedEnv`, after `pass_env`.
- better-than-training · local `systemd.resource-control` man page, 2026-10-13 · `CPUWeight` splits CPU relatively, `MemoryHigh` throttles and may be exceeded, `MemoryMax` invokes the in-unit OOM killer and is recommended only as last line of defense · selected soft pressure over caps.
- model-knowledge · searches above found nothing stronger for: which seat tools use the secret service or portals, whether any dbus client library autolaunches a daemon on a bad address instead of failing, and Chromium's other snap-mode behavior under a fake `SNAP`. Each is a probe, not a citation.

## 4. Pitfalls, and what removes each

- A Chrome binary other than the probed one still escapes (Chromium, Playwright headless-shell). An escaped browser lands in `app.slice`, outside the akrogon slice weights and stop. Removed by door probes launching each binary under the cut env and checking its cgroup, pending. This is required operation proof, not optional measurement.
- A seat tool needs the real bus and fails days later, far from the change. Removed by the seat smoke probe under cut env before handoff, pending, and by the failure being a loud connection error naming the bus.
- A repo config passes `DBUS_SESSION_BUS_ADDRESS` through `pass_env` and reopens the hole. Removed by adding it to the reserved constructed names (`src/config.ts:69-88`) and setting the cut after the passthrough loop, both binding parts of the pick.
- `MemoryHigh` or weights sized from the aborted 2.5 minute run throttle a full run into timeouts. Removed by finishing the solo full-run measurement before any value is written; still outstanding.
- Seat-env bus cut also reaches the operator's own typing in a leaf pane and seat-run visible browsers, which then live and die with the seat scope. Not removed; it is the cost of containing ad-hoc work, and the fork's stop question must say so plainly.
- Permit of 1 with a still-unknown full-run peak: if the back half of `framework:verify:core` is far heavier than the first 2 minutes, one admitted run alone could still swamp the host and no part of 1a helps. Removed only by the same full-run measurement; if it shows that, the counted unit changes and this fork reopens.

## 5. Questions this fork does not ask

- What is the queueing delay the operator actually feels at permit 1: how many minutes does a full solo run take, and how often do two leaves want it at once in the timing record? The operator's slowdown question is still only half answered (single run unslowed; total wait unknown).
- Who may stop an escaped `app-*.scope` browser, under what evidence, given the operator's own Chrome matches the pattern? The stop fork needs this as its own question.
- Should non-run browser work the operator asks for directly (a blepsis session from a seat) join the permit or the slice, or is operator-invoked work exempt by definition?
