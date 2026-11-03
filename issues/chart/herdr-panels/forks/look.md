# Look of the new panels, stage colors and keys

## Question

Q1 panel edges; Q2 two-seat logos; Q3 top bar order and the Needs-you key; Q4 narrow window; Q5 counts; Q6 stage colors; Q7 red.

### Carries

Operator, message 2: "the UI of the individual additions has to also be beautiful. For example, using the logos from different agent types ... It needs to be beautiful, but the underlying theme has to stay the same."

## Findings

Seat notes `slots/look-{A,B,C,D}.md`, `slots/look2-{A,B,C,D}.md`, merged and rebuttals beside them; final shape `slots/look-final.md` with focused checks `slots/look-final-check-{B,C,D}.md`. Probe L2: herdr's program table covers claude, codex, pi and antigravity (`run: ["agy"]`).


Proof, 2026-11-03, operator's local user `ivan`, herdr-app 0.1.12. Target: throwaway session `probe4` with a throwaway mod. `knownAgents()` returned claude (`run: ["claude"]`), codex (`["codex"]`), pi (`["pi"]`, `tint: true`), antigravity (`["agy"]`), all installed; `TextView` imports from `gpui-base` (`gpui-kit` fails `herdr-app check`); a mod in a hidden panel or inactive stack child did not run until shown. Cleanup: session deleted. Limits: cross-mod `setShared` reading and `TextView.markdown` rendering were not observed.

## Taken

Operator, verbatim (round 5): "1b | 2a | 3a - I also need a keyboard shortcut for "Needs you", find the most intuitive one that's not taken | 4a | 5a | 6b - but pick a palette that actually makes sense, not a random one. Do some research on this. It needs to fit the overall Omarchy theme, too (not the colors per se, but saturation, etc) | 7a"

Operator, verbatim (round 5b): "1a | 2a |"

- 1b: straight edges on all four views; no outer radius or border; rows inside keep small rounding.
- 2a: "<logo>A <logo>B", 16 px logos via the agents-by-tab `icon()` helper; no match shows the letter only.
- 3a: top bar ⤢, Tasks, Needs you, Files, Changes; ⤢ left of the buttons.
- 4a: narrow window folds buttons to icons with hover names.
- 5a: Needs you count when > 0 (red when an agent is blocked); Tasks red dot when any row is red.
- 6b + 5b 1a: plan blue `ansi4`, implement cyan `ansi6`, check magenta `ansi5` (fix rounds too), merge green `ansi2`, failed red `ansi1`, parked/stopped/paused grey, yellow `ansi3` only for slow merge. Pill: stage word in `t.foreground` on its own `t.background` base with a ~12% stage tint layer, plus a 6 px stage-colored dot. Merged rows have no pill.
- 7a: red is the theme's `ansi1`; the omarchy hook and Agents list stay as they are.
- 5b 2a: `ctrl-b y` toggles Needs you; `ctrl-b t` toggles Tasks (round 3b); a key over another view switches views.
