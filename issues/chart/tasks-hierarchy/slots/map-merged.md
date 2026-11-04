# Merged opening map (A, B, C)

Sources: map-A.md, map-B.md, map-C.md in this folder. Tags show which slots wrote the point.

## Problems seen (agreed)

- P1 Levels do not separate: panel title, repo heading and slug are all 13 px, repo semibold vs slug medium; only the group label steps down (A,B,C).
- P2 Row state does not reach the title: working, waiting, planned rows share slug color and weight; only the far-right pill and the seat spinner differ (A,B,C). "Active issue" can mean working now, needing the operator, or the row being inspected; the model has no selected row (B).
- P3 The second line is nearly as loud as the slug: `t.muted` (#C9C3AF) vs foreground (#E8DFC9) in the omarchy theme is a barely visible step; `t.dim` (#687061) is the real step (C).
- P4 Pill and time sit at the far edge: list cap `S(880)`, D19 says 760 (B,C); ≈947 px at the default size 14 (B), ≈1264 px at the operator's font size 18.67 (C); header spans the full panel while the list stops (A).
- P5 The alert line is the loudest line and can name a repo not on the board (lingua-relay slow merge above framework) (A,B,C).
- P6 The open row uses `t.selected`, the fill herdr-app uses for the focused item; its detail lines are one uniform muted size with long absolute paths; detail buttons are always filled (A,B,C).
- P7 Tasks scales every size by font_size/13 = 18.67/13 = 1.44x while the sidebar, tabs, Files and Changes stay at herdr-app's 13 px; header 60 px vs 42 (C).
- P8 At the panel's opening width (368 px) seats + inset + pill + time leave about 9 characters for the slug (C, arithmetic; no side-width screenshot exists).
- P10 Task alerts repeat row evidence: a failed leaf shows as a top alert and as its row; a missing input shows as a top alert, a row tag and a detail line (A,B).
- P11 Slow merge is history, not a live stall: it is the last verify run carrying a slow record (`src/status.ts` scan), yet it gets first-glance prominence (B).
- P12 After a later scan error the old rows stay with no age shown; `stamp` is recorded but not rendered (B).
- P13 The header "N open" counts every row with a pill, so blocked and stopped rows count; the useful count is rows needing the operator, equal to the panel-bar dot (C).
- P14 The run alert (`env.run`) is a multi-line CLI table printed in one alert line; only the producer can give it fields (C).
- P9 Colors: six stage tints and full-color seat icons, while the sidebar went one-color today on request (A). C and B treat the stage palette and pill shape as settled by look.md/D19.

## Forks

- M1 What earns emphasis: working rows (B O1), rows needing the operator (B O2), state-led sections like herdr-app's Agents list (A), or keep titles equal and move the pill next to the slug (C D2 O1). Ask (A,B). C: after the operator's second note this is a content question; the row that needs the operator earns emphasis, defined by the producer's `leafRed` that also drives the panel-bar red dot (C rebuttal).
- M2 Type ladder: three tiers, section labels dim 11.5 (title, repo), slug the one foreground level, secondary text in `dim` not `muted` (A,C); keep five levels spread by size (C O2). Practitioner call, propose not ask (A,C); B: improve within D19, and do not fix it by blanket dimming a line that mixes obstruction reasons with history.
- M3 Scale: does "follow the terminal font size" cover header and geometry or row text only (C Q1). Ask (C).
- M4 Width and opening layout: design the row for 368 px first, extras dropped below ~420 px (C D8); cap 760 per D19 (C D3, B); keep full width but use it (A: centered or split view; a split view reopens D19's 760 px column rule, C); open Tasks at side width vs full (A). Ask normal use: side column or full width, how many tasks (B Q2).
- M5 Alerts: below rows as dim notes with the header count turning red (C O1), on top but quieter (C O2), attached to their repo (B O10, C O3 drops quiet-repo warnings). B asks whether the historical slow-merge advisory should precede tasks at all (B Q3); C asks whether a quiet repo's warning belongs on the board (C Q2). Repo read errors stay visible either way (B).
- M6 Open row: the current reason before routine history (A,B); seat sources and other diagnostics leave the first glance but stay in the expansion (B), or go (A); short paths (A); no selected fill, a chevron instead, D19 buttons (C D6). Propose (A,C).
- M7 Seats: move after the slug at 16 px with the spinner over the busy seat's icon (C D7 O1, needs operator because of the "big" lock, C Q3); one-color seat icons like the sidebar (A).
- M9 Which categories the data can truthfully show: working (`busy_since`, `land.alive`), waiting on a dependency (`blocked_by`), merge queue, paused/stopped, problem reasons (failure, missing, delivery error). No field says "needs operator input"; an idle seat does not prove queued or needs-me. A row can carry a problem and a live spinner at once (B).
- M8 Pills: keep stage colors (B,C: settled; look.md Taken 6b and D19 set status color text on a 15% fill, and the Agents list beside Tasks still colors its status pill) vs one-color with only operator-needed states colored (A; today's one-color change covered avatars and agent icons, not pills, C).

## Pitfalls (with what removes each)

- Host tests lock pill compositing, seat icons and `props().fill`/`expand` proof props; a redesign updates them with Test-Change citations and drops a proof prop whose meaning goes (A,C). Keep the functional host/model checks and judge each change by its effect (B).
- Every size through `S()` or it stops following font size; the panel-wide scale rule decided once (M3) so Tasks and Files/Changes do not drift (A,C).
- Long slugs must not push the pill off: `truncate` slug, `flex_none` pill (C).
- A width-dependent row needs one threshold via `on_size_change` (C).
- Muting must keep failures, blocked reasons and stale-scan warnings readable; build the secondary tier on `dim` or size, not `muted` (C); separate obstruction reasons from routine history before muting anything (B).
- Proof renders the states that collide (working+red, expanded blocked, several repos, long slugs) at 368 px and full width; no pixel tests (B).
- Live proof uses a session window on an existing workspace, never a new or removed headless output (A; today's lesson).
- Two repos to land if the opening width changes (herdr-setup panel-bar) (A).
- The Needs you panel was removed today, so Tasks is the only board: a category it drops shows nowhere in the app except the CLI (C).
- `busy_since`, `verdict`, `attempts`, `done` reach the model but are never drawn; a restyle of only what is drawn leaves the busy duration and the review verdict off the board (C).

## Where slots differ

- Organization: keep repo then issue group with row states (B) vs sections by category across repos (A leans; C recommends, citing the Agents list `mods/agents/main.js` SECTION and D19's match-the-mods rule).
- Whether to ask about emphasis (A,B ask; C settles it by pill placement).
- Stage colors: settled (B,C) or open for one-color (A).
- Full width: 760 cap left aligned (B,C) vs using the width with a split view (A).
