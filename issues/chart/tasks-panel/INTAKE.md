# Intake: tasks-panel

## Scope

Destination: akrogon. `akrogon status --json` and the Tasks board, a herdr-app mod shipped from akrogon, shown in herdr-setup's right panel. Split from `issues/chart/herdr-panels` (item A4 there) when herdr-setup was registered; the rounds, seat notes and probes stay in that folder.

## Provenance

- Operator: chart-door session bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab (pane t15), 2026-11-03; messages in `issues/chart/herdr-panels/INTAKE.md` "Source: operator 2026-11-03", "Round 1", "Round 3", "Round 3b".

## Source: operator 2026-11-03

"2 - Does that mean we don't even need to have the "akrogon status" terminal CLI command anymore? Can we actually turn it into a UI feature here that we're building right now, along with the new additions we're building?"

"go, but consult with consultants first. | 2 - 2a"

"1b - because it's not unusual for the agents to work for more than 1h. The red is when something's really blocked, not time-dependent | 2a | 3a - I need a very intuitive keyboard shortcut to pull that panel up. Come up with it and let me decide. Keep in mind, I'm still using the prefix (look it up, herdr-app customization I've added) | 4a | 5a | File the seed."

"1a | 2a" (round 3b)

## Agent findings

See `issues/chart/herdr-panels/INTAKE.md` "Agent findings", "Probes" (P5: a mod's `exec("akrogon", ["status"])` runs in ~370 ms from PATH; a layout block naming a missing mod errors only while shown) and `issues/chart/herdr-panels/slots/tasks-panel-final.md`.
