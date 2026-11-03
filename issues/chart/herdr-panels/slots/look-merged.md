# Look: merged notes (A, B, C, D)

## Agreed

- Same header geometry in all four views as shipped Files/Changes: 42 px header, 14 px padding, 13 px text; no bigger fonts or padding at full width (A,B,C,D).
- Logos drawn by the `icon(p, size, color)` helper copied from agents-by-tab (main.js:66-68): tinted glyph only when `Program.tint`, else the picture as is; never a hand-written name → icon table for paths; no harness names (A,B,C,D). Needs-you takes the Program from the live terminal (A,B,C,D).
- Working seat shows the Agents-list spinner (`t.working`) (A,C,D).
- New buttons use the shipped `panelButton` shape (26 px, 14 px icon, 12 px label) (A,B,C,D). Needs-you shows a count only when > 0 (A,B,C,D).
- Only theme() tokens, no hex; time uncolored; slow merge amber `ansi3` (A,B,C,D). theme() has no error/warning token (B,C,D).

## Measured facts

- flat.json gives `work-body` padding 0 and gap 0 and `main` radius 0, while shipped Files/Changes draw `rounded(10)` + `border_1`, made for the shipped `main.json` (padding 8, gap 8, radius 10); in flat this leaves corner notches and doubled 1 px borders (D, files/main.js:159, flat.json, main.json:103-119).
- Claude, Codex and Antigravity icons are full color (`tint: false`), Pi is a white glyph (`tint: true`) (D, icons/*.svg).
- The omarchy hook writes no `blocked`, `working`, `done`, `idle` colors; herdr derives them (D, apply-herdr-app-theme:37-53).
- Contrast on current omarchy background: dim 3.07:1, muted 8.96:1, ansi1 5.16:1, ansi3 7.60:1 (B).

## Where seats differ

1. Panel outer shape.
   - Keep today's rounded card at both widths (A,B,C).
   - Flat edge, no outer border, at both widths; rows inside stay rounded (D).
2. Logos.
   - Size 16 px (A,B,D) vs 14 px (C). C also tints every logo; A,B,D follow the tint flag like the Agents list.
   - Two seats: two logos side by side, the idle seat dimmed (D; A side by side without dimming) vs "A <logo>  B <logo>" with letters (B,C).
   - Before the port, Tasks finds a seat's logo from akrogon's harness name via `knownAgents()` (C,D; D adds the command's first word to the JSON) vs only from a proven program-table lookup, else letter only (B).
3. Top bar.
   - Order Tasks, Needs you, Files, Changes (A,D) vs Files, Changes, Tasks, Needs you (B).
   - ⤢/⤡ in the top bar (A,B,D; D puts it left of the buttons so they never shift) vs in the panel header (C).
   - Narrow window: labels collapse to icons with tooltips (A,B,D) vs never; the tab strip scrolls first (C).
   - Count style: colored pill, `blocked` when any agent is blocked else `done` (A,D; B neutral for done-only) vs small dim number (C). Tasks gets a red dot when any row is red (D).
4. Colors.
   - Red = `t.blocked` (A,C,D) vs `ansi1`, the palette's red, since "blocked" is not promised to be red (B). D: make the omarchy hook write `blocked` = red, `working` = yellow, `done` = green, `idle` = muted, so `blocked` is red.
   - Stage pills neutral (`muted` on `raised`) (A,B,D) vs the CLI's phase colors (plan blue, implement amber, check magenta, merge green) (C).
