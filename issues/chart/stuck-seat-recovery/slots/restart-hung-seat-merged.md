# Restart hung seat: merged

Read 2026-09-28. Attribution (A), (B), (C) or combinations.

## Cause of #35 (A,B,C)

- `pi:tools.ts:96-98`: a child cwd outside the parent root awaits `ctx.ui.confirm(...)` with no options. pi's dialog options accept `signal` and `timeout` (types.d.ts:36-41), but the tool's abort signal is not passed, so esc cannot end the wait. (A,B,C)
- Every child cwd was a sibling unit worktree (`…/issues/worktrees/pool-smell-freeze-u1`), outside the parent worktree root. Both sessions end on one assistant message with 2 or 3 parallel `subagent_spawn` calls and no tool result. The operator restarted both by hand at 07:37Z, after about 1h49m and 1h40m. (C, from session logs)
- pi has one dialog slot. A new dialog replaces the shown one, and the replaced promise never settles (`interactive-mode.js:1953-1976`). With N parallel spawns, N-1 confirms are lost and one waits for a human who is not there. (B,C)
- The seat is launched unattended (`pi ... -a --exclude-tools request_user_input`), yet the extension still asks a human. `-a` only trusts project files. (A,C)
- herdr trusts pi's lifecycle hooks and skips screen detection, so a tool that never returns shows `working` forever (`herdr-agent-state.ts:191-198`, herdr agents.mdx:42). (B,C)
- #32 and #35 are the same family (a promise inside tamdoma-subagents that nobody settles, then a herdr status that never changes) but need separate fixes. (B,C) A had called them one class.

## Source fix (A,B,C agree it comes first)

- (A,C) Approve by rule a child cwd that is a worktree of the same repository, fail fast with the existing error (`tools.ts:97`) otherwise, and pass the signal to any remaining confirm.
- (B) Keep asking, but serialize spawns through pi's sequential-tool contract (extensions.md:134, agent-loop.js:287) and pass the signal. B: "Unattended operation does not authorize silently approving outside-root access."
- (C) Also report `ui_prompt_start` as herdr blocked, so any real prompt shows as blocked instead of working.

## Can "stuck" be proven without a clock?

- Silence cannot prove a deadlock. A timeout is a policy, not proof. (B,C)
- State evidence exists for known classes only (C): E1 a session file ending in tool calls with no result, E2 a UI prompt open in an unattended seat, E3 a working parent with a pending spawn and no worker process. E1 alone also matches a long legitimate bash run.
- A hang with no such state (a network promise inside a tool) has no clock-free signature. seat-stall-detection accepted that on 2026-09-18. #35's "watcher as full replacement" contradicts that acceptance. (B,C)
- Every practitioner mechanism found uses elapsed time: Kubernetes liveness probes, systemd WatchdogSec, Temporal heartbeat timeouts, Erlang supervisor shutdown. (B,C)

## Restart mechanics, if chosen (B,C)

- herdr has no stop or kill verb. Ctrl+C goes to the open dialog. The reliable stop is SIGTERM to the pi pid from `herdr pane process-info`, a bounded wait, then SIGKILL. (B,C)
- Worker shells are detached process groups (`worker-shell.ts:184`) and can outlive pi. SIGKILL first orphans them. (B,C)
- akrogon already relaunches an empty pane: `pane.exited` runs next, and `dispatchSlot` starts the harness and prompts the phase, capped at 3 attempts (`next.ts:386-396,431-480`). The missing piece is only the stop. (C) B adds that a delivered prompt resets attempts (`next.ts:361`), so the cap needs its own restart counter.
- Relaunch is a fresh session. The worktree and state.yaml survive, and in-memory approvals and child handles are lost. Never use project-wide `--continue` with two seats on one worktree. (B,C)

## Recommendations

- (A) Source fix only, watcher stays notify-only.
- (C) Source fix now. Add `akrogon restart <slug> <slot>` gated on state evidence (E2 or a pending spawn), with no clock, only if the operator confirms total absence.
- (B) Source fix, plus an explicit exception to the no-clock rule inside the operator-started watch (about 1 h since last session activity), plus a restart verb with identity checks, one restart per leaf, phase and slot, and a fresh session.

## Sources

- better-than-training · tamdoma-subagents tools.ts, manager.ts, worker-shell.ts, index.ts; pi 0.85.1 dist and 0.87.1 docs; herdr-agent-state.ts; herdr docs and CLI; akrogon next.ts, shell.ts, plugin, watch-issues SKILL.md; pi session logs for both hung seats. Read 2026-09-28. (A,B,C)
- practitioner · Justin Young, Anthropic, Effective harnesses for long-running agents, 2025-11-26 · rebuild context from durable artifacts in a fresh session. (B)
- practitioner · Malcolm Featonby, AWS Builders' Library, Making retries safe with idempotent APIs · a retried operation may already have had its effect. (B)
- better-than-training · Kubernetes probes, systemd.service(5), Temporal activity timeouts, Erlang supervisor, Google SRE cascading failures, accessed 2026-09-28 · all detect hangs with elapsed time. (B,C)
- Empty: no pi dialog queue, no herdr kill verb, no akrogon restart verb, no clock-free detector for silent hangs. (B,C)
