# Intake: seat-stall-detection

## Scope
The akrogon half of Tamdoma/akrogon#16: autonomous observation of a busy seat during event silence, and what a detected stall does. The pi-extensions half is charted separately at `~/.pi/agent/extensions/issues/chart/subagent-admission-stall/`. Which of the two owns the report's completion is Q4.

## Provenance
- GitHub: Tamdoma/akrogon#16

## Source: Tamdoma/akrogon#16
URL: https://github.com/Tamdoma/akrogon/issues/16

Unverified intake.

## Observation
Leaf `astro-mpa-generation` (repo tamdoma/framework, phase `check.fix`, seat B, pane wA:p81) sat idle for 2h07m with the seat reported as `working` while nothing ran.

Parent pi session transcript: `~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-astro-mpa-generation--/2026-09-18T10-42-32-283Z_01a0b41c-5adb-7096-934a-6b09dad41069.jsonl`

Timeline (UTC, 2026-09-18):
- 11:07 to 11:44: subagents sa-1 .. sa-5 spawned one at a time, each returned `running` immediately and completed. All five worker briefs done.
- 11:44:57: `subagent_wait` for sa-5 returned `completed`, with `Retirement: shutdown failed: Child session_shutdown failed: ... Worker shell supervisor exited before retirement: pid=2135980 code=null signal=SIGTERM` (worker-shell.ts:109). sa-5 is listed afterwards with `retirementReady: false`.
- 12:06:44: `subagent_spawn` for the sixth brief returned `{"id":"sa-6","state":"queued"}` instead of `running`. No other child was running.
- 12:06:45: `subagent_wait ids=[sa-6]` blocked.
- 14:13:02: the wait ended only because the operator interrupted the pane (`Subagent wait aborted: ids=[sa-6]`, `Error: The operation was aborted.`). `subagent_check` at 14:13:13 still showed `state: queued`, `lastActivityAt` unchanged since spawn, zero metrics. A second wait was aborted at 14:14. `subagent_cancel` at 14:15 moved sa-6 to `cancelled`.
- The pane received a re-prompt `implement-issue astro-mpa-generation slot=B phase=check.fix` with no new work having happened.

On the akrogon side during the same window:
- `issues/open/astro-mpa-default/astro-mpa-generation/state.yaml` had `busy_since.B: 2026-09-18T12:05:21Z` and `busy_notified: {}` at 14:15.
- `issues/log.jsonl` has no entry for this leaf after 12:05:17Z.
- No herdr notification was shown for the busy seat. No `akrogon next` run touched the leaf in the window. Nothing cancelled, re-prompted, or re-dispatched the seat.

Code surfaces inspected (not a diagnosis, listed so the intake is reproducible):
- `~/.pi/agent/extensions/tamdoma-subagents/manager.ts`: `concurrency = 1` (line 267); `availableCapacity()` subtracts `retiringHandles` and `uncertainRetirements` (lines 1190-1195); a failed `handle.shutdown()` adds the handle to `uncertainRetirements` (lines 1081, 1094, 1118) and only a later successful shutdown of that same handle removes it (line 1111); `runScheduler()` admits `queued` children only while capacity > 0; no timer or deadline exists for a child in `queued`.
- `akrogon/src/next.ts`: `observeBusy()` records `busy_since`, and after `STALL_MS` (60 min) runs `herdr notification show` once and sets `busy_notified`. It is called only inside `dispatchSlot()` from `akrogon next`. `busy(pane)` treats `working|blocked|unknown` the same. No path stops or re-dispatches a busy seat.

## Location
Project: akrogon (dispatch) + pi extension `tamdoma-subagents` (worker scheduling). Surface: `akrogon next` dispatch loop, `state.yaml` busy fields, `subagent_spawn` / `subagent_wait` in a seat pane. Workflow: implement-issue leaf in `check.fix` on seat B.

## Reproduction
Observed once, 2026-09-18. Reported shape:
1. In one pi seat session, spawn and wait on several subagents sequentially with concurrency 1.
2. Have one child's retirement fail (worker shell supervisor exits with SIGTERM before shutdown completes).
3. Spawn the next child. It returns `queued` and never transitions. `subagent_wait` blocks until the operator aborts.
4. Leave the seat alone. Without an `akrogon next` pass, `busy_since` ages past 60 min and nothing fires.

## Expected behavior
- A child that cannot be admitted because no capacity is free should not sit in `queued` indefinitely. Either the spawn is refused with the reason (capacity held by an unretired handle), or the queued child times out and the wait returns an error.
- A seat that has been busy past the stall threshold should be detected without depending on an operator-run `akrogon next`, and the stall should lead to a stop and re-dispatch of the seat, not only a notification.
- A seat blocked in a tool wait with no child activity should not count as `working`.

## Urgency
High. The seat was lost for over two hours of wall clock with no signal, and only a manual operator interrupt recovered it. Workaround: operator interrupts the pane, runs `subagent_cancel` on the queued child, and restarts the pi session before re-prompting.

## Agent findings
- The reported akrogon mechanism is confirmed, with one correction: `observeBusy` is also called from `dispatchLeaf` (`src/next.ts:464-469`), not only inside `dispatchSlot`.
- The reason no notification fired is triggering, not the 60 minute threshold. `akrogon next` runs only at herdr startup and on four herdr events (`plugin/herdr-plugin.toml:7-27`), and `nextCommand` returns early on a `working` status event (`src/next.ts:602`). A pane already stuck at `working` emits nothing.
- Herdr v0.9.1 plugin manifests support no periodic trigger, and startup hooks are documented as one-shot rather than supervised daemons. An autonomous detector must be an OS timer or a long-lived process outside the plugin surface.
