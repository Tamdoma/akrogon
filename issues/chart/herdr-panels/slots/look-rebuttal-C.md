# Look rebuttal C — disagreements with the merged notes

## Positions I withdraw (merged records them correctly; evidence settles them)

- Logo size and tinting: A,B,D win. Agents-by-tab draws row icons at 16px (`icon(a.program, 16, ...)` main.js:284; the 14px at :176 is the space-header icon) and follows `Program.tint` — Claude/Codex/Antigravity are full-color pictures today (D's measured fact). "Match the Agents list" means 16px + tint flag, not 14px + all-tinted. My line "tinted glyph in dim/muted" contradicted the same-file helper I cited; withdrawn.
- ⤢/⤡ placement: A,B,D's top-bar pick wins. One button beside the panelButtons it belongs with, always visible in every view including full width, zero duplication; my panel-header pick means four mods each implementing the same control. Keep only my constraint: the state is per-panel, not per-view.

## Where my position should win

- F1 Two-seat rows: `A <logo> B <logo>` with letters (B,C) over D's two logos with the idle seat dimmed. Seat letters are the dispatch identity the operator reads everywhere (`busy A 42m`, `verdict B:fix`); a dimmed logo conflates "which harness" with "which state" and duplicates the busy/done tags the row already carries. Letters cost 8px.
- F2 Narrow window: never collapse labels (mine). The buttons are `flex_none`; the tab strip is `flex_1` with `overflow_x_scrollbar` (tabs/main.js tab-scroll) — the tab list absorbs the squeeze exactly as it does today. Icon-only buttons are unlabeled affordances: the operator reads labels to find the new features. Collapse+tooltip solves a <~700px-window case by degrading every narrow-but-usable case.
- F3 Count style: small dim number (mine) over A,D's colored pill. A `blocked`-colored pill on Needs-you double-reports blocked (sound + toast + tab dot already exist) and trains the operator to ignore the badge; dim number says "2 rows" without shouting. And no Tasks red dot (D): the red lives on the row; a dot on the button turns the bar into an alarm strip for the same information.
- F4 Red token: `t.blocked` (A,C,D) stands, but adopt D's fix on top: write `blocked`/`working`/`done`/`idle` into themes/omarchy.json from the hook. That kills B's real objection ("blocked" isn't promised red — it's derived; measured fact: the hook writes no such colors) without swapping semantics for a palette index. One jq line in herdr-setup/omarchy/apply-herdr-app-theme, under our control, keeps the token semantic AND makes it red.
- F5 Stage pills keep the CLI's phase colors (mine) over neutral muted-on-raised (A,B,D). The colors are not decoration, they are the scan index: `akrogon status` already paints plan=34/implement=33/check=35/merge=32 (status.ts phaseColor); the operator's eye is trained on that. Neutral pills make a 20-leaf board a wall of identical text — the exact scan the panel exists for. ansi tokens are theme-derived (herdr.d.ts theme() lists ansi0..15), so this stays inside the no-hex rule. Calmer isn't the goal; matching his existing reading pattern is.

## Misattribution

- F6 "Working seat shows the Agents-list spinner (A,C,D)" — C's notes don't propose a spinner; I wrote logo+msg+age rows only. Correct the tag or drop the claim's C.

## Dropped material

- F7 D's corner-notch finding (flat.json `padding:0, gap:0, radius:0` vs the mods' `rounded(10)` card) explains a seam the operator sees today — record it as a known artifact in the look contract, or new panels will be "fixed" to look *different* from the approved ones. Today's notched card is the approved shape; matching it includes the notch.
