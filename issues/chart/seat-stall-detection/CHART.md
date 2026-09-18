# Chart: akrogon detects and recovers a stalled seat without an operator-run pass

## Destination
A seat that has been busy past the stall threshold is detected while no herdr event fires, and the stall leads to a defined recovery action rather than nothing.

## Forks taken
- [Seat stall detection and recovery](forks/stall-detection.md): pi-extensions owns Tamdoma/akrogon#16; no clock, poll or watchdog anywhere.
- [Does akrogon need a detector at all?](forks/no-akrogon-detector.md): no. This destination is ruled out entirely.

## Fog
None. Every question that remained was dissolved by ruling the destination out.

## Off route
- **This entire destination.** No akrogon-side stall detection or recovery is built. A known admission fault is announced by the pi manager that already holds the fact, so nothing observes from outside. A stall produced by pure silence stays permanently invisible, accepted knowingly by the operator on 2026-09-18.
- Any systemd user timer, `akrogon watch` process or elapsed-time trigger. Operator rule: no hidden watchdogs, clocks or polling.
- A herdr plugin trigger. Herdr v0.9.1 plugin manifests declare only `[[startup]]`, `[[events]]`, `[[actions]]`, `[[panes]]` and `[[build]]`, and startup hooks are documented as "one-shot initialization commands rather than supervised daemons" (herdr docs/plugins.mdx, read 2026-09-18). No periodic trigger exists.
- The pi-extensions admission defect. Separate destination, separate registered repo, charted at `~/.pi/agent/extensions/issues/chart/subagent-admission-stall/`.
- Changing the generated `~/.pi/agent/extensions/herdr-agent-state.ts` integration, which is herdr-managed and warns against direct edits (`:1-3`). (B, R5 of map)

## Territory findings
- `plugin/herdr-plugin.toml:7-27` declares one startup sweep and four event hooks. `plugin/next.sh:1-3` execs `akrogon next` and exits.
- `nextCommand` returns early on a `pane_agent_status_changed` event whose status is `working` (`src/next.ts:602`). A pane already stuck at `working` emits no further status change, so nothing runs.
- (B, correcting the intake) `observeBusy` is reached from `dispatchSlot` and also from `dispatchLeaf` across existing seat panes (`src/next.ts:370, 409, 427, 464-469`). Every path still requires a `next` invocation.
- `observeBusy` (`src/next.ts:175-204`) records `busy_since`, fires one `herdr notification show` past `STALL_MS` (60 min) and sets `busy_notified`. It never stops or re-dispatches. The timestamp never advances on progress while the pane stays busy (`:186-191`).
- `busy()` treats `working`, `blocked` and `unknown` alike; `idle()` is `idle` or `done` (`src/next.ts:165-169`). A blocked seat is deliberately undispatchable.
- `next --all` inside a registered repo sweeps only that repo; outside one it sweeps all (`src/next.ts:627-635`). A timer with the wrong cwd silently excludes repos. (B, R4)
- Dispatch already re-reads phase and done state and caps attempts at three (`src/next.ts:365-384`).
- Akrogon's pane schema carries status and session identity, not a progress timestamp or a blocked reason (`src/shell.ts:74-81`). The extension emits `herdr:blocked` for operator questions (`~/.pi/agent/extensions/tamdoma-subagents/index.ts:108-110`), which is a question signal, not a progress signal. (B, R3)
- `akrogon install` already links the herdr plugin (`src/install.ts:52`), so it is the existing home for installing any OS-level timer. (A)
- Cross-repo `blocked-by` is not supported: dependency lookup uses the selected repo's inventory (`src/next.ts:151-154, 488-489`). (B)

Closed 2026-09-18: destination ruled out, nothing handed off. The work moved to `~/.pi/agent/extensions/issues/chart/subagent-admission-stall/` and `issues/chart/stall-notifier-removal/`.
