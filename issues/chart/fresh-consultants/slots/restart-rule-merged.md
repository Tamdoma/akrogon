# restart-rule, merged notes

## Q1 when
- Restart when the door enters a chart, before its first consultant exchange, and again when it re-enters a chart after the consultants worked on another chart; keep the sessions for all exchanges while the door stays on that chart (A,B,C). Reason: the growth is across charts; briefs are self-contained (questions.md:48). Cost: one restart per chart entry and re-reading code.
- "Left the chart" means another chart used the consultants; A's local work or compaction alone does not trigger a restart (B,C).
- Shared opening map: one fresh start before it, then chart-boundary restarts (A,B).
- Rejected: once per door, keeps the reported growth (A,B,C). Before every exchange, discards same-chart context and adds launches (A,B,C).

## Q2 how and which panes
- O1 in-place: end the agent's foreground process (pid from `herdr pane process-info --pane <id>`), then `herdr agent start <name> --kind <kind> --pane <same pane> -- <args>` (A). Pane id, layout and the peer-panes lock stay untouched; supplied and door-created panes are handled alike. Proven by A's probe (below). Cost: departs from the operator's literal recipe.
- O2 close + split + start for the named consultants, supplied panes included under the operator's explicit words, written as a narrow exception to the peer-panes lock (B,C). Cost: pane ids change every restart; a supplied pane elsewhere in a layout is recreated next to A, so placement can change (B,C). Close in reverse order so a later peer is not stranded (C).
- O3 only door-created panes: rejected, leaves supplied consultants growing (A,B,C).
- Launch recipe: save kind, lowercase unique name and native args before the stop (A,B,C); argv from process-info (A); the no-argument proof does not cover arbitrary saved settings (B).
- Restart only after every open exchange is collected (A,B,C); never A or unrelated panes (B,C); never revive a dropped consultant (A,B,C).

## Q3 failures and the first codex turn
- First codex exchange after a start: keep today's behavior, a return file ends it as done, a missing file waits to budget as unproven (A,B,C). Rejected: new fail-fast binding for a rare path (A,B,C); a zero boundary from a null session is unsafe (B).
- Failed restart step: attended, end the turn and report the failed command and surviving panes (B,C); autopilot, drop that consultant for the session and continue with the rest (A,C), or stop and ask the operator without a new drop category (B).
- Run restart steps one at a time and record each result before the next (C); no automatic retries (A,B,C).

## Evidence
- A probe, 2026-10-17, herdr 0.9.1, throwaway pane w8:pRZ: `herdr agent start probe-a --kind codex`; `kill -TERM <pid from process-info>` returned the shell in 2 s; `herdr agent start probe-b --kind codex --pane w8:pRZ` ready in ~3.4 s, same pane id, session none until a turn; same cycle twice with pi, a new session path per start; pane closed after, no rollout or pi file left (A).
- #99 comment: close + split + start proven for codex and pi with no args (A,B,C).
- peer-ask.ts:66-75 null seeds; peer-wait.ts:143-155 adoption, :188 unproven, :291 done on file (A,B,C); turn-end-signal.md Taken permits unproven waits (B,C).
- tests/fake-herdr.ts:238 invents an immediate session on start, unlike real codex (B).
- herdr has no dedicated agent-stop command (C); A's probe used a process signal instead.

## Points where slots differ
- Q2: in-place restart (A) vs close + split + start under the operator's words (B,C). B and C judged in-place unproven; A's probe is new evidence they did not have.
- Q3 autopilot failure: drop and continue (A,C) vs stop and ask (B).

## Open
- Does replacement authority for supplied panes last the whole door session (C)?
