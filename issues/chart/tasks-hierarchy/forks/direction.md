# Fork: direction (operator priorities for autopilot)

## Question

Seven high-level questions asked before A answers later rounds under autopilot: board purpose, row density, producer changes, colors, width, who starts the next seat, must keep / must go.

## Taken

Operator 2026-11-04, reply verbatim: "1a | 2a | 3 - what do you want to change exactly? | 4a | 5c | 6a |"

- 1a: the board is for spotting problems; problems loud, the rest calm.
- 2a: little text per row: name, state word, one short reason; more on click.
- 3a (operator 2026-11-04, after A's explanation, reply verbatim: "3a"): change akrogon status too. (1) Two more problem cases in the producer's red flag: a task waiting on something that will never finish (dependency parked, missing or unreadable) and a merge whose background job died. (2) Report which seat a task waits for. The waiting-run warning stays a short line; fields for it are skipped. One small akrogon leaf before the board leaf.
- 4a: grey and white, color only for problems (like the sidebar). Overrides D19's colored status pills for Tasks.
- 5c: works narrow first, wide must not look empty.
- 6a: something automatic starts the next seat; between seats shows as calm Waiting.
- 7: not answered; treated as no extra must-keep or must-go beyond existing locks.

## Round 2 (angles from slot C, slots/direction-C.md)

Operator 2026-11-04, reply verbatim: "For questions for this issue: 1b | 2b | 3a | 4c | 5a | 6c | 7a"

- 1b: the board points; one short phrase, a click jumps to the agent's pane or log where the problem is read.
- 2b: opened when the red dot lights; opens on Needs you first, other sections may fold.
- 3a: age never turns a row red; time is shown, only recorded problems are loud.
- 4c: within a section, the row blocking the most other tasks first (each row shows how many wait on it).
- 5a: Needs you holds tasks only; charts stay off the board.
- 6c: the board is a draft for herdr-app's own version; follow how herdr-app's own panels work so decisions carry over.
- 7a: chart the direction-round idea (Tamdoma/akrogon#128) right after this chart in the same autopilot run.
