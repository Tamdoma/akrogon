# Design: tasks-side-open

## Binding decisions, verbatim

### width

Question: Narrow first, wide not empty (direction 5c): the row at the panel's opening side width (368 px), the content cap at full width (D19 says 760, code says S(880)), header alignment with the list, and whether Tasks opens at side width or full width (a herdr-setup panel-bar change).

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
Narrow first; the `S(880)` cap goes; header and list share the left edge; no `on_size_change` threshold (B,C; direction 5c; D19's 760 cap is overridden for Tasks because its job, keeping pill and time near the slug, is gone). Tasks opens at side width when opened from closed; Files and Changes unchanged; the ⤢ toggle in the open view stays effective (B,C; direction 2b). A herdr-setup panel-bar change keyed on the Tasks view (A's notes rejected: 760 cap and opening full).

### direction

Question: Seven high-level questions asked before A answers later rounds under autopilot: board purpose, row density, producer changes, colors, width, who starts the next seat, must keep / must go.

Answer and reason:

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

Exclusions: only width's "Tasks opens at side width when opened from closed; Files and Changes unchanged; the toggle in the open view stays effective" binds here. Everything else in width (cap, alignment) and every other fork binds the Tasks mod (owner: akrogon leaf tasks-sections-board).

Standing design: /home/ivan/.akrogon/releases/7f697eee16682629d75754ef90d74686ecabc565/skills/chart-issues/assets/standing-design.md
Interpretation: no auth, secrets or backend mutations. Proof is the existing pure-function test of the panel bar's decisions (`tests/panel-bar.test.js` over `mods/panel-bar/routine.js`); no host run needed, no machinery. One deliberate break (Tasks opening full again) must turn the test red.

## Leaf architecture

Owned surfaces: `mods/panel-bar/routine.js` (request), `tests/panel-bar.test.js`. `main.js` is unchanged: it derives `full` from the live layout on every render (`full: Boolean(main?.hidden)`), so `shrink` and `grow` read the side opening correctly (C).

Interfaces: `request(state, req)` from closed returns, for `req.view === "tasks"`, the select, `layout.show` panel and SIDE commands with main shown; other views keep the current FULL sequence.

States this changes and their consumers:
- The window-start shrink and terminal-jump shrink in `main.js` already handle a non-full panel.
- Tasks does not depend on the opening width (its layout works at any width per tasks-sections-board).

Exclusions: Tasks mod layout (akrogon tasks-sections-board); Files and Changes behavior.
