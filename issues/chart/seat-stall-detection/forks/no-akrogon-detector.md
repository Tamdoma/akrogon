# Does akrogon need a detector at all?

## Question

Q8. Is the akrogon-side detection and recovery destination ruled out entirely, leaving the whole of #16 to pi-extensions?

### Carries
- Operator rule: no hidden watchdogs, clocks or polling anywhere. Q5 and Q6 direction above.
- `skills/chart-issues/assets/shapes.md` requires ruled-out work to record its reason in Off route, not a pretended fork.

## Findings
- (B) The complete plugin hook event list in herdr v0.9.1 is 22 names, from `PLUGIN_HOOK_EVENT_KINDS` in `src/api/schema/events.rs:286-328`. There is no `stalled`, `agent.error`, `agent.idle` or `agent.blocked` hook. Blocked and idle are values carried on `pane.agent_status_changed`, which akrogon already subscribes to (`plugin/herdr-plugin.toml:13-27`). Adding hooks cannot turn an unchanged `working` state into an event.
- (B, D1) No akrogon change is needed for a known admission fault to become visible. A blocked report from pi produces the status-change hook, `nextCommand` accepts it (`src/next.ts:599-612`), `observeBusy` records the episode and `dispatchSlot` returns without acting (`:165-204, 365-371`). Existing blocked handling is conservative and correct.
- (B, R5) A zero-clock generic stall detector is impossible on these interfaces. A shutdown promise that never settles, a hung live child, a frozen parent event loop or a dropped state-report connection produce no event at all. Accepting the no-clock rule means accepting that this class stays invisible.
- (A) The existing 60 minute notifier in `observeBusy` (`src/next.ts:191-203`) can only run when some other event happens to arrive, which is never the case during the stall it exists to catch. It is a clock that structurally cannot fire when it matters.

## Taken
2026-09-18, operator (`1-A 2-A 3-A 4-A`):

Q8 taken: the akrogon detection and recovery destination is ruled out entirely. All of #16 becomes pi-extensions work.
Reason: a known admission fault is announced by the component that already knows it, so nothing needs to observe from outside; herdr has no hook that fires on stillness and existing blocked handling in akrogon is already correct.
Forecloses: the systemd user timer, a long-lived `akrogon watch`, any elapsed-time stall trigger, and any reduced akrogon detection leaf.
Accepted consequence, stated before the answer: a stall produced by pure silence (a shutdown promise that never settles, a hung live child, a frozen parent event loop, a dropped state-report connection) stays invisible permanently. There is no zero-clock way to catch it.

Separate answer, same reply: the dead 60 minute notifier in `observeBusy` is deleted. That is akrogon work and is charted at `issues/chart/stall-notifier-removal/`.
