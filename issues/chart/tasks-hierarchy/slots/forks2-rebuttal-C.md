# Remaining forks rebuttal C on forks2-merged.md

- row, A "body expands, seat icon jumps": direction 1b is "a click jumps to the agent's pane or log". The body click is the click; an icon-only jump makes the operator aim at an 18 px target for the thing they asked the click to do.

- row, A "one line, second line only for Needs you": direction 2a wants name, state word and one short reason on a row. A Working row with no second line shows no state word and no reason, and at 368 px one line cannot hold a 30-character slug plus the phase word, the time and two seat icons at 18.67 px text (`main.js` row widths; `layouts/flat.json` panel 368 px).

- row, B "a third line for the reason when it does not fit": 2a says little text per row, and the open-row notes agree the expansion shows the full reason wrapping. A third line at 368 px makes every failed row three lines on the narrow panel that 5c puts first; truncate on line 2 and let the chevron show the rest.

- row, B's diagnostic log viewer as the no-target fallback: the operator's "pane or log" allows it, but akrogon records no per-seat log path (`src/state.ts` schema has `tab` and `pane`, nothing for a log), so the viewer needs the producer to name a file first. Until the producer leaf adds one, the existing Files pin on the worktree opens the same review and report files with no new surface; sections Taken's "removing over adding" favors it. Keep B's viewer as the step after a `log` field exists, not the first fallback.

- type-and-color, A "reason in `dim`": the reason is the one phrase the operator reads (1b, 2a). `dim` is #687061 on #1F241E in this theme (`themes/omarchy.json`), roughly 3:1, the color the shipped lists use for durations and labels, not for the line that carries the meaning (`mods/agents/main.js` row: name in foreground or muted, duration in dim). The reason belongs in `muted` with the size step carrying the hierarchy.

- type-and-color, B "program artwork kept; recoloring exceeds the lock": direction 4a is grey and white "like the sidebar", and the sidebar's agent icons were made one color today at the operator's request (herdr-setup `mods/agents-by-tab/main.js`, the content brief's Live surface note). The seat lock asked for herdr-app's icons at row size; 4a, said later, sets their color. The later operator word wins.

- scale, B "all Tasks text scales, header grows to fit": 6c says follow herdr-app's own panels so decisions carry over. Files and Changes keep a fixed 42 px header (`mods/files/main.js` render, `mods/changes/main.js` header), and the three views swap in one panel-body stack (`panel-bar/routine.js` select), so a taller Tasks header makes the header jump when switching views. Chrome fixed, rows scaled.

- width, A "cap 760 per D19, keep opening full": 5c says wide must not look empty; a 760 px column on the roughly 1290 px full panel leaves 40% blank, which is what the cap did in tt-01 with the pill at the far edge. D19's cap existed to keep the pill and time near the slug; with both inline on line 2 the cap has no job. Opening full from closed contradicts 2b: the operator opens on the dot while working and wants the terminal kept.

- machine-lines, my per-row waiting-run lines: withdrawn. 3a says the waiting-run warning stays one short line; B's single "run waiting" line with the table on demand fits it better than one line per repo.
