# Look: seat A notes

Evidence: better-than-training, read 2026-11-03: herdr.d.ts:259-264 (theme tokens), shipped files/main.js:159-160 (card: `rounded(10)`, `border_1`, `bg(t.background)`, 42 px header), herdr-setup layouts/flat.json (`main` panes radius 0, border `raised`, focus `accent`), herdr-setup mods/agents-by-tab/main.js:65-68,176,202,284 (logos, spinner).

## 1. Panel shape

Pick: all four views use the shipped Files card exactly (rounded 10, 1 px border, background, 42 px header row) at side size and at full width. Tasks and Needs-you copy that frame so the four look like one family. Cost: at full width the rounded card sits beside flat terminal panes (radius 0); acceptable because the terminal is hidden while full.
Rejected: radius 0 to match terminal panes (D's map). It changes Files and Changes, which the operator likes as they are.

## 2. Logos

Pick: copy `icon(p, size, color)` from agents-by-tab (main.js:65-68) unchanged: `Program.icon`, tinted glyph in `t.foreground` or the picture as is; 16 px on Tasks and Needs-you rows like the Agents list rows (main.js:284). Two seats: A's logo then B's, 2 px apart, 16 px each. Working seat: the same spinner as the Agents list (main.js:202, `t.working`). No harness names (Round 2, A8).
Rejected: a per-harness color badge or names. The operator said logos already identify harnesses.
Pitfall: Tasks gets seat kinds from akrogon config (`claude`, `codex`), not from a live terminal. Map kind → Program by the app's program table (the same one agents() uses), never by a hand-written name → icon table. Probe: herdr.d.ts exposes the program table to mods.

## 3. Top bar

Pick: four buttons in the shipped style (tabs/main.js panelButton: 26 px, 14 px icon + label), order Tasks, Needs you, Files, Changes, then ⤢/⤡ (icon only) while the panel is open. Needs you shows a count pill only when > 0 (`t.blocked` background when any agent is blocked, else `t.done`). Narrow window: labels drop, icons stay. Icons: list-check for Tasks, message-question for Needs you, from the app's own icon set if it has them.
Rejected: count on Tasks. Red rows inside carry that.

## 4. Status colors

Pick: only named tokens. Red (real block) = `t.blocked` for the row's tag and a 2 px left bar; stage pills `t.muted` text on `t.raised`; merge holder `t.done`; alerts banner `t.blocked` text on `t.raised`; slow merge `t.ansi3` (amber, not red); working spinner `t.working`. No hex. Theme switch (omarchy hook) recolors everything.
Pitfall: `blocked` may be orange in some themes, so "red" means "the theme's blocked color". Say so to the operator.
