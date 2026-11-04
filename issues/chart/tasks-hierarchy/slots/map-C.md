# Map C: Tasks board hierarchy and initial layout

Inputs read: `herdr-app/tasks/main.js`, `model.js`, `model.d.ts`, `schedule.js` (whole); `live/tt-01-tasks.png` (full size, today 23:18) and `live/ui-after-tasks-icons.png` (22:05, more rows, pre-cleanup); shipped `mods/agents/main.js`, `mods/files/main.js`, `mods/changes/main.js` render, `mods/tabs/main.js`; AGENTS.md sections "The look", "A mod", "UI", "The `herdr` module", settings fonts; `themes/omarchy.json`, `settings.json`; D19 and look.md "Taken"; herdr-setup `panel-bar/main.js`, `spaces-list`/`agents-by-tab` style lines; `layouts/flat.json` panel node; `hyprctl monitors`. Skipped: tests beyond the props they drive, the gpui-kit beyond the text methods, other live screenshots.

## Summary

The board has five text levels (panel title, repo, group, slug, second line) drawn at three sizes and two weights that are one step apart, so nothing leads. The row's state (working, blocked, failed, parked) is carried only by a 15 px stage word at the far right and a spinner that replaces a seat icon, while the slug stays the same color and weight in every state. On top of that, every Tasks size is scaled by 18.67/13 = 1.44 while the sidebar, tabs and the sibling Files and Changes views stay at herdr-app's fixed 13 px, so the panel reads as a different app. The initial layout is a 368 px side panel that the row design does not fit at this scale. Most of this is decidable without the operator; three questions need them.

## Findings (what is visibly wrong)

F1. Three levels share one size and nearly one weight. Panel title "Tasks" is 13 semibold (`main.js:329-330`), the repo heading "framework" is 13 semibold (`main.js:301-302`), the slug is 13 medium (`main.js:259`). In tt-01-tasks.png "Tasks", "framework" and "fixture-weave-recorder" are the same height; only the group label "about-titles" (11.5 medium dim, `main.js:308`) steps down. Practitioner: a hierarchy needs at least two of size, weight and color to change between adjacent levels. Here only weight changes between repo and slug, and nothing changes between title and repo.

F2. The second line is almost as loud as the slug. It is 11 (16 px here) in `t.muted` (`main.js:265`). The omarchy theme's muted is `#C9C3AF` against foreground `#E8DFC9` (`themes/omarchy.json` colors): roughly 0.85 vs 0.92 relative luminance, a difference the eye barely registers at this size. The only real step down in this theme is `dim` (`#687061`). "check.review → check.repair" and "blocked-by fixture-weave-recorder (check.repair)" therefore read as rows, not as annotations of rows. Source: theme file plus model knowledge of contrast ratios (no stronger source searched).

F3. Row state does not reach the slug. The slug color is `t.ansi1` when red, `t.muted` when merged, else `t.foreground` (`main.js:260`). Working, blocked, stopped and planned rows get the same slug color and weight. In tt-01-tasks.png the working row and the blocked row differ only by the spinner and the pill word 1.4 k px to the right. This is the operator's "active issue has the same color and typography". Settled part: the stage palette itself (look.md Taken 6b, 5b 1a). Open part: whether the slug or row carries any of that state.

F4. The pill and time sit at the far edge. `list` is capped at `S(880)` = 1264 logical px (`main.js:341`); the monitor is 2560 at scale 1.6, so the full-width panel is about 1290 logical px, and the cap removes 26 px. D19 states a 760 px column. The code comment ("the pill and time stay near the slug") is not what the screenshot shows: the pill is at the window's right margin. Either the cap is 760 unscaled, or the pill moves next to the slug.

F5. The alert line is the loudest thing on the board and often about something not on the board. It is foreground text at 12 with a 6 px dot (`main.js:223-227`), placed above the first repo. In tt-01 it names lingua-relay, a repo the board does not list because it is quiet (`model.js:178-180`). The one line that should look like a warning is styled like a row, and the one row that should look like a leaf is styled like a heading.

F6. The whole panel is 1.44x herdr-app's chrome. `K = font_size / 13` with `font_size` 18.67 (`main.js:325`, `settings.json`). Header 60 px vs shipped 42 (`mods/files/main.js` render h42), slug 18.5 px vs sidebar rows 13 (`mods/agents/main.js` row text_size 13) and tabs 12.8 (`mods/tabs/main.js`). The herdr-setup `files-view` and `changes-view` do not scale (only the editor font, `files-view/main.js:166`), so switching views changes the header height in place. The lock "text follows settings().font_size" is operator-settled; what it does to the panel's fit with its neighbours is not, see Q1.

F7. Seat icons carry little and cost the most width. In ui-after-tasks-icons.png every row shows the same pi glyph and claude tile, two 26 px icons plus a 29 px inset before any slug (`main.js:30-32`). The spinner replaces the busy seat's icon (`main.js:40`), so the icon that would say which program is working is the one hidden. Settled by lock (icons, no letters, row-sized, a working seat spins). Not settled: their place in the row and whether identical seats on every row repeat.

F8. Open equals selected. An expanded row is filled `t.selected` (`main.js:252`), the fill the Agents list and spaces list use for the focused item (`mods/agents/main.js` row `.when(a.focused, bg(t.selected))`). Nothing in Tasks is "selected" in that sense; the row is disclosed. The detail buttons are always filled `t.hover` (`main.js:288`), where D19 says buttons are borderless until hovered.

F9. The repo heading is a level the common case does not need. With one repo holding open work (tt-01), "framework" plus "about-titles" are two headings for two rows. The repo heading also carries the paused tag (`main.js:303`) and the queue and parked notes (`main.js:311-312`), so it cannot simply vanish.

F10. At the panel's initial size the rows do not fit. `flat.json` opens the panel at 368 px, min 280. With this scale: padding 16 + inset 60 + pill about 60 + time column 63 + gaps leaves roughly 150 px for the slug at 18.5 px, about 9 characters. "fixture-weave-recorder" truncates to "fixture-w…". No screenshot of the side-width state exists in `live/`; this is arithmetic from `main.js:30-32, 262` and the layout node.

## Forks (decisions with options)

D1. Type scale: how the five levels differ.
- O1 (recommended). Fix the ladder at three visible tiers: title and repo as section labels (11.5 medium dim, the sidebar's "Agents", D19 "Section labels"), slug as the one foreground 13 level, everything else 11 in `dim`. Groups become a prefix or a dim label at 11. Minimal code: five text_size and color edits. Later: nothing new to maintain, one ladder shared with the sidebar.
- O2. Keep five levels and spread them by size (title 13 semibold, repo 12 semibold, group 11 dim, slug 13 medium, second 11 dim). Keeps the repo as a heading. Later: five sizes drift apart from herdr-app's own three (13, 12.8, 11.5, 11) and the panel keeps reading as its own app.
- O3. Weight only (slug semibold, rest normal). Cheapest but the theme's muted/foreground gap (F2) stays invisible.
Settled by locks: none. Ask: no, a practitioner call; O1 is consistent with D19.

D2. Where row state shows.
- O1 (recommended). Pill moves to the slug's right, directly after the text, and the time stays at the row's end; the slug keeps one color except red. State is then read in one eye movement. Later: a long slug pushes the pill; `truncate` on the slug with `flex_none` on the pill holds it.
- O2. Slug takes the stage color (blue plan, cyan implement, ...) and the pill goes. Strongest signal, but six colored slugs in a list fight each other, and the look.md palette was accepted for pills, not for text at 18 px. Reopens a settled look.
- O3. A 2 px left bar in the stage color on the row (as spaces-list's accent bar, `spaces-list/main.js:318`), pill stays. Quiet and cheap. Later: a bar plus a pill plus a spinner is three state marks per row.
Ask: no. Settled: colors and pill shape (look.md 6b, D19). Open: placement only.

D3. The reading column at full width.
- O1 (recommended). Cap at 760 unscaled per D19, left aligned. Pill and time land near the slug on any monitor. Later: a 760 column on a 1290 panel leaves 500 px empty on the right; that is the Needs-you rule too, so the two views match.
- O2. Keep `S(880)` and accept the far-edge pill. Matches nothing.
- O3. No cap, pill next to the slug (D2 O1), time at the far edge. The time becomes the only far element; it is dim and small, so it can afford it.
Ask: no, D19 already decided 760; the code does not follow it.

D4. Alerts.
- O1 (recommended). Alerts move below the rows, into a dim 11 block headed "alerts" (the shipped `note` style, `main.js:316`), and the header count turns red when any alert is red (the panel-bar already carries the red dot, `panel-bar/main.js:225`). Rows come first; the board is about rows.
- O2. Keep alerts on top but style them as notes (11 dim, colored dot only). Same cost, keeps "warnings first" semantics.
- O3. Attach repo alerts to their repo section and drop the ones about quiet repos. Loses the slow-merge warning for lingua-relay entirely, which is the one the operator saw today.
Ask: Q2 (does a warning about a quiet repo belong on this board at all).

D5. The repo heading when one repo is shown.
- O1 (recommended). Always draw it as a section label (11.5 medium dim); it costs 28 px and keeps paused, queue and parked anchored. One rule, no special case.
- O2. Drop the heading when `repos.length === 1` and prefix the group label with the repo name. Saves a row; adds a branch that a second repo flips at run time, so the list jumps when another repo gets work.
Ask: no.

D6. Open-row treatment.
- O1 (recommended). Open rows keep no fill; a chevron (`mods/workspace-chrome/chevron-down.svg`, as files rows do) at the row's start turns, and the detail is indented under it. `t.selected` is then free for a future focused row. Detail buttons become D19 buttons (muted text, fill on hover).
- O2. Keep `t.selected` fill for open. Nothing to do now; later a keyboard focus or "current leaf" has no fill left.
Ask: no.

D7. Seats in the row (within the lock).
- O1 (recommended). Seats move after the slug, before the pill, at 16 px (the Agents row icon size) with the spinner overlaid on the busy seat's icon rather than replacing it. The slug starts at the row's left edge and the 60 px inset goes. Fits 368 px.
- O2. Seats stay left at 26 px, as now. Lock-compliant, fails F10 at the initial width.
- O3. Seats left but 16 px.
Ask: Q3, because "here they need to be big to fit the design" was said about the current design and O1 changes the design around them.

D8. Initial layout.
- O1 (recommended). Design the row for 368 px first: one line slug + pill + spinner; the second line only when it exists; time and seats right of the slug and dropped below about 420 px via `on_size_change` (AGENTS.md "A mod", Size). Full width is then the same row with room.
- O2. Open the Tasks panel full by default. One layout edit in herdr-setup, but the operator's panel memory per space (`mods/tabs/main.js` syncPanel) and the ⤢ button already own that state, and it hides the problem rather than fixing it.
Ask: no.

## Questions

Q1 (ask). The font lock scales the whole panel to 1.44x herdr-app's chrome (F6). Does "what we have in normal terminals" mean the row text only, or the header and geometry too? Recommend: header stays at the shipped 42/13 so the panel top matches Files and Changes, body text follows the terminal size. The lock as worded does not say.

Q2 (ask). Should a warning about a repo with no open work (lingua-relay slow merge) appear on the Tasks board, or only on the panel-bar red dot and Needs you? Decides D4.

Q3 (ask). May the seats move right of the slug and shrink to the Agents icon size when the design around them changes (D7 O1)? The lock sized them "to fit the design"; the design is what is being changed.

Settled, not asked: stage palette and pill shape, seat icons without letters, removed folds stay removed, the kept row stays, font follows settings().font_size for the text itself, clicks redraw at once.

## Risks over the work's lifetime

R1. Per-view scaling drift. Tasks scales with `K`, the sibling views do not. Any geometry fix in one view will be redone in the other unless the scale rule is decided once for the panel (Q1). Caught by nothing: no test compares views.

R2. Theme dependence. `muted` vs `foreground` is a usable step in graphite and paper and not in omarchy (F2). A hierarchy built on `muted` looks right in the shipped themes and wrong on this machine. Use `dim` for the secondary tier, or size, not `muted`.

R3. Expanded-row screenshot props. Tests drive `props().fill` and `props().expand` (`main.js:244-246`). D6 O1 removes the "selected" fill meaning, so the `fill: "selected"` proof prop loses its subject; drop it in the same change or it silently proves nothing.

R4. Pill next to the slug hides under truncation. With D2 O1 the pill must be `flex_none` after a `min_w(0).truncate()` slug, or long slugs push it off at 368 px.

R5. Alert placement and the red count. If alerts move below (D4 O1), the header count must carry the red, or a failed leaf scrolls out of view in a long list.

R6. Width-dependent row shape (D8 O1) needs `on_size_change`, which re-renders on every drag; the gpui rule "every redraw redraws the window" (AGENTS.md "A mod") makes a width-conditional layout cost only during drags, acceptable, but the condition must be one threshold, not several.

R7. Two directions of "match": D19 says match herdr-app's mods; the font lock says match the terminal. Each later tweak will be argued from one or the other. Record the answer to Q1 as a lock so the next change does not reopen it.

## Smallest plan that answers the intake

Without the questions: D1 O1, D2 O1, D3 O1, D5 O1, D6 O1. That is text sizes, colors and the pill's position in `row()` and `repoSection()`, a 760 cap in `render()`, a chevron, and the detail buttons restyled. Model.js unchanged. With Q1 and Q3 answered as recommended: the header unscaled and the seats moved right at 16 px, which makes D8 O1 fall out of the same edit.
