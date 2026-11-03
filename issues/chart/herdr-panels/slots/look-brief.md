# Fork brief: look of the new panels (round 5)

You are a consultant seat (letter in the one-line prompt). Work alone; you will not see the other seats' notes. Edit no file except your return file. Do not contact the operator. Read-only commands are fine; do not send text to any terminal except the final line.

## Context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md. Read "Source: operator 2026-11-03" message 2 (beautiful, agent logos, theme unchanged), "Round 2" (A8 b: logos already identify harnesses, no names added), "Round 3", "Round 3b", "Round 4".
- Final shapes: slots/tasks-panel-final.md, slots/files-changes-final.md; Needs-you in INTAKE "Round 2".
- Look sources: /home/ivan/.config/herdr-app/AGENTS.md (UI, theme, Program icons sections; search, do not read whole), herdr.d.ts, gpui-kit.d.ts; shipped mods files, changes, tabs, agents, spaces; the operator's mods in /home/ivan/Work/infra/herdr-setup/mods (agents-by-tab draws the logos the operator approved); layouts/flat.json; the active theme (find it from settings.json and ~/.config/herdr-app/themes or the omarchy hook in herdr-setup/omarchy).
- Earlier seat positions: slots/map-merged.md "Where seats differ" 6 (panel card radius) and "Questions seats raised" (logos tinted vs full color).

## Questions for your notes

1. Panel shape: the right panel today (rounded card or flat edge, padding, border) and what it should be at side size and at full width.
2. Logos: how Tasks rows and Needs-you rows draw harness logos so they match the left Agents list exactly (same source, size, tint), and what a row with two seats looks like.
3. Top bar: icons and labels for Tasks and Needs you beside Files and Changes, plus the ⤢/⤡ toggle, and what happens in a narrow window (labels collapse to icons?). Does Needs you show a count badge?
4. Status colors: which theme() tokens mark red (real blocks), stage pills, tags, alerts, so everything follows the theme when it changes. Name any token the theme lacks.

## Notes format

For each question, your own position: (1) pick with reason and cost; (2) rejected options with reasons; (3) evidence with tier, source path:line, date; (4) pitfalls and what removes each; (5) any question you would ask that this fork does not. Name any probe that must run before building.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-<YOUR LETTER>.md"
