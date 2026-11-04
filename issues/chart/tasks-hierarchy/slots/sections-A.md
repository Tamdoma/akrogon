# Fork notes, slot A: sections

## Pick

1. Needs attention = the producer's `leafRed` facts: phase failed, a recorded missing artifact, a recorded delivery error on a seat with no busy timestamp (`src/status.ts` leafRed, undelivered). Add one fact in the producer, not the mod: blocked on a dependency labelled parked, missing or unreadable, since that wait never clears by itself. Reason: one predicate drives the CLI count, the panel-bar dot and the section, so they cannot disagree. Cost: a producer change in `src/status.ts` with its test; the dot lights for that case too.
2. Between seats (live phase, no blocker, a required unfinished seat idle; required seats per `skills/watch-issues/SKILL.md` Judge) goes in Waiting with the reason "next: B" and its age. Reason: akrogon phase commands prompt the next seat themselves, so this state is normally short; nothing records whether a dispatcher will come, so calling it needs-attention would be a guess. Cost: a leaf left between seats overnight looks calm; its age is the only signal.
3. Stopped goes with Paused/parked (one "Paused" section): an operator-set hold in `stopped.yaml` (`src/stop.ts`), not a problem.
4. Merged leaves under a still-open epic go in a Done section at the bottom, one line per owner: "identity: 3 of 5 merged", expanding to the slugs. Reason: it matches the Agents list's Done section and keeps epic progress without a row per merged leaf. Cost: one more section; hidden when empty.
5. Header count = `env.red` (problem tasks + unreadable repos + deploy failure), shown red as "N need attention" only when above zero; otherwise "N working". Reason: equals the panel-bar dot by construction; machine problems also need the operator.

## Rejected

- Needs attention computed in the mod: dot and board can disagree (C's point, agreed).
- Between seats as needs-attention: false alarms on every normal hand-off between seats.
- Stopped as needs-attention: the operator stopped it on purpose.
- Merged rows dropped entirely: hides epic progress and is a removal the operator did not ask for (Last merges was a different list, the envelope `merges`).
- Merged rows as dim rows (now): a large epic fills the list with grey.
- Task-only header count: a deploy failure lights the dot with no matching number on the board.

## Evidence

- better-than-training · `src/status.ts` leafRed, undelivered, envelope `red: leafReds + unreadables + deploy failed`, read 2026-11-04.
- better-than-training · `skills/watch-issues/SKILL.md` Judge: required seats by phase; "Waiting" and "Merged still under open" defined there, read 2026-11-04.
- better-than-training · herdr-setup `mods/panel-bar/routine.js` redDot = `envelope.red > 0`, read 2026-11-03.
- better-than-training · shipped Agents list sections Needs you / Done / Working / Idle (`~/.config/herdr-app/mods/agents/main.js`), read 2026-11-03.

## Pitfalls

- A machine problem counted in the header has no task row: the machine lines (next fork) must show it, so the number always has something to point at.
- Widening `leafRed` changes `akrogon status` output and the dot: the producer leaf carries a test for the new fact and the mod reads the flag, never re-derives it.
- "Between seats" derivation needs the required-seat table; put it in the producer beside `leafRed` so the watch rule and the board share one table.
- A row can be Needs attention and have a busy seat (delivery error recorded while the other seat works): section by attention, spinner still shows.

## Question I would add

Does anything start the next seat for you during the day (a watch running), or do you run `akrogon next` yourself? If you run it yourself, a leaf between seats is waiting on you and could go to Needs attention after some minutes.
