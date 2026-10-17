# restart-rule, slot A notes (written before reading B and C)

## Q1 pick: restart whenever the door enters a chart, before that chart's first exchange (first entry or resume); before the shared opening map when a pass opens
Reason: the measured growth is across charts in one pass (B 7.4M input, C ~84k/call over three charts). One consultant session per chart entry bounds consultant context to one chart and makes consultant usage per chart exact for usage-windows. Every exchange already travels as a self-contained brief (questions.md:48), so no cross-chart memory is lost that a brief relied on.
Cost: one restart per chart entry, ~5 s per consultant measured (kill 2 s + start 3.4 s, probe below); consultants re-read code they read in the previous chart.
Rejected: once per door open: keeps the reported growth for every chart after the first. Before every exchange: rebuttal and leaf review reuse the code reading done for the notes in the same chart; more restarts for little context saving.

## Q2 pick: in-place restart of every named consultant: end the agent's foreground process, then `herdr agent start <lowercase name> --kind <same kind> --pane <same pane> -- <same args>`
Reason: it keeps the operator's reason (no warm-up or short messages, a real fresh process) and removes the pane problems instead of guarding them: the pane id, layout and seats.yaml pane field stay; the peer-panes lock (never move supplied panes) is untouched because no pane is closed, moved or created; supplied and door-created panes are handled the same way. Args come from `herdr pane process-info --pane <id>` argv, read before the stop.
Cost: departs from the operator's literal recipe (close + split + start); that recipe is the fallback the operator already tested.
Rejected: close + split + start: changes pane ids and rebuilds layout next to A, which moves a supplied pane that lived elsewhere (lock breach) and needs args read anyway. Only door-created panes: leaves supplied consultants, the common case in this repo's sessions, growing.

## Q3 pick: a failed stop or start drops that consultant for the session under autopilot and is reported to the operator when attended, never retried in a loop; accept the codex first-turn unproven wait
Reason: matches the existing drop rule (SKILL.md Autopilot) and the peer-ask refusal rule (questions.md:46). The first codex exchange after a start seeds session null and boundary null (peer-ask.ts:66-75); peer-wait adopts the session later (peer-wait.ts:153) and the success path (:291) needs no id; only a missing return file waits the full budget (:188). That case is rare and bounded.
Cost: a missing file on the first codex exchange costs one budget before escalation.
Rejected: give codex a boundary at start (new code to find the rollout created after start) for a rare path.

## Evidence
- better-than-training, live probe 2026-10-17, herdr 0.9.1: throwaway pane w8:pRZ; `herdr agent start probe-a --kind codex`; `kill -TERM <pid from process-info>` returned the shell in 2 s; `herdr agent start probe-b --kind codex --pane w8:pRZ` ready in ~3.4 s, same pane id, session none until a turn; same cycle with pi gave a new session file path at each start; pane closed after, no rollout or pi file left (pi writes the file only on the first message).
- better-than-training: #99 comment (close + split + start test, codex null session adopted, pi new file).
- operator: restart words in Carries.

## Pitfalls
- Restarting during an open exchange: restart only at chart entry, after every prompted turn is collected.
- Reviving a dropped consultant: restart only consultants still named and not dropped.
- Wrong args or kind: read argv and kind before the stop, start with the same values; lowercase agent name.
- Seat record: a restart changes the session, so the existing append rule (SKILL.md:37) writes a new seat entry; codex's id appears after its first turn.
- Docs: grep docs/guide/chart.md for the consultant rule (LESSONS.md:12).

## Question the fork does not ask
- Does A itself get a fresh context per chart? Out of scope (operator practice).
