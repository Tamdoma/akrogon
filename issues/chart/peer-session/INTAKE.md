# Intake: peer-session

## Scope

The chart-issues peer scripts address operator-named panes through the inherited herdr session. Destination: akrogon (skills/chart-issues). Split from herdr-session call-coverage Q3.

## Provenance

- Operator: 2026-10-29 door message (autopilot switch-on)
- Operator: 2026-10-24 door answer in herdr-session call-coverage

## Source: operator 2026-10-24

3a - but we need to map it out immediately after this is done.

## Source: operator 2026-10-29T07:29Z

Previous message (door, 2026-10-29) listed peer-session and pull-gh-path as the two open charts; the operator replied:

chart them out with the consultant slot b on autopilot. Systems thinking, less code is always better, function over form, simplicity, clarity and elegance. Go. Autopilot and send to watch-akrogon when you're done charting.

## Agent findings

- Callers, from [herdr-session call-coverage notes B](../herdr-session/slots/call-coverage-B.md) C17-C19 and [C](../herdr-session/slots/call-coverage-C.md): skills/chart-issues/scripts/peer-ask.ts:36,49; peer-wait.ts:95,117; peer-restart.ts:60 (call sites 115,126,153,177,243, kill -TERM at 215); peer-create.ts:61,68; door-reset.ts:74-80 (prompts 121,126,130,149, detached child 175-178). Prose: the questions.md wait chain and the SKILL.md agent list.
- Risk: on a stale inherited socket, peer-restart's process-info read on a same-id pane in another session selects the wrong process group for kill -TERM, and peer-ask can prompt a same-id pane elsewhere.
- Open method: B wants an explicit validated door session passed through every script and the detached child. C wants each script to find the session from its given pane id (unique hit, else refuse), because seats.yaml records no herdr session name.
