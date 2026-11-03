# Fork brief: stage palette and Needs-you shortcut (round 5b)

You are a consultant seat (letter in the one-line prompt). Work alone; you will not see the other seats' notes. Edit no file except your return file. Do not contact the operator. Read-only commands and web research are fine; do not send text to any terminal except the final line.

## Context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md, sections "Round 3", "Round 3b", "Round 5" (operator answers verbatim there).
- The operator picked colored stage pills (6b) "but pick a palette that actually makes sense, not a random one. Do some research on this. It needs to fit the overall Omarchy theme, too (not the colors per se, but saturation, etc)". Locks: red (`ansi1`, theme's red) means only real blocks; slow merge is amber (`ansi3`); only theme() tokens, no hex; time uncolored. Stages a leaf passes: plan (with plan-rebuttal, plan-merge sub-steps), implement, check (and fix rounds), merge; also failed, parked, merged.
- Theme facts: current Omarchy theme "sage-terra", palette at /home/ivan/.local/state/omarchy/current/theme/colors.toml; herdr theme at /home/ivan/.config/herdr-app/themes/omarchy.json (ansi0..15 come from the Omarchy palette; accent = green = #A3B18A). Omarchy ships many themes; the choice must hold across them, not only sage-terra (look at other Omarchy themes' colors.toml if installed, e.g. under ~/.local/share/omarchy/themes/).
- akrogon's CLI today: src/status.ts phaseColor (plan 34 blue, implement 33 yellow, check 35 magenta, merge 32 green).
- Shortcut: prefix is ctrl-b then a key, in /home/ivan/Work/infra/herdr-setup/mods/prefix/main.js (ACTIONS); `t` is now Tasks, `f` Files, `o` jumps to the agent that needs you most. Global keys in /home/ivan/Work/infra/herdr-setup/keys.json.

## Questions

1. Which stage gets which color, and why? Ground it in practitioner sources (design systems or teams with a track record on status colors: name them, say why each is worth hearing, where they agree and disagree), and in the reserved meanings above.
2. How the pill is drawn so it matches the theme's saturation and contrast (text color, tinted background alpha, border), with any contrast numbers you compute for the current theme.
3. The most intuitive free key for opening the Needs-you panel (prefix or global), with what each candidate collides with.

## Notes format

For each question: pick with reason and cost; rejected options with reasons; evidence with tier (operator, practitioner, better-than-training, model-knowledge with searches run), source with URL or path:line, date; pitfalls and what removes each.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look2-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look2-<YOUR LETTER>.md"
