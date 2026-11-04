# Fork notes C: remaining forks

Read: direction.md whole; list-shape and sections Taken; the six forks' Question and Carries; `herdr-app/tasks/main.js`, `model.js`; `src/status.ts` leafJson, `src/state.ts` schema (tab, pane), `src/land.ts`; AGENTS.md "The look", "UI", "Commands" (panes, agents), "The `herdr` module"; shipped `mods/agents/main.js`, `mods/files/main.js` render, `mods/changes/main.js` header, `mods/tabs/main.js` sizes; `themes/omarchy.json`; `settings.json`; herdr-setup `panel-bar/routine.js` and `main.js` open and shrink logic; D19; tt-01-small.png. All read 2026-11-03 or 2026-11-04. Direction answers are operator tier; shipped mods and akrogon src are primary code; the rest is practitioner judgment where marked.

## 1. machine-lines

Pick. One block above Needs you, drawn only when it has a line, no heading. Each line is one short label and value, red for what counts in `env.red` plus the mod's own scan failure, dim for the waiting-run warning:
- scan failed: "status failed · rows from 12m ago" with the first line of stderr; the age from the mod's last good stamp (`main.js` start, `this.stamp`).
- deploy failed: "deploy failed at <step>: <error>"; the attempted sha stays out.
- repo unreadable: "<repo> · <file name> unreadable: <error>"; repo error: "<repo> · <error>".
- waiting run: the producer's `run` table minus its title and header line, each data row as one dim line (3a: short line, no fields).
- slow merge: off the board. It is history, not a problem (1a), and 3a kept age out of red. The CLI keeps it.
Reason: the block is where the header count points when no task row is red (sections Taken 8, direction 2b). Cost: `alerts()` in `model.js` loses the Failed and Missing lines and gains the scan age; the test 'an error envelope keeps healthy repos and yields alert lines' changes with a Test-Change citation.

Rejected. Machine lines below the rows (my earlier D4 O1): 2b opens the board on the dot; a deploy failure must be the first thing seen. A heading "Machine": a label for one to three lines, adding over removing. The run table as one truncated line: the table has one row per repo and the first line is its title, which says nothing.

Evidence. `model.js` alerts (run, deploy, failed, missing, unreadable, error, slow); `status.ts` envelope section builds `run` from `render(lineHeader, ...)` with a title line; `main.js` render draws `this.error` as an alert and keeps old `model` rows; panel-bar `redDot` = `env.red > 0`; direction 1a, 2b, 3a.

Pitfalls. A scan failure with no earlier envelope shows the block alone over "Loading"; removed by the existing empty-state text staying below the block. The run table's shape is owned by the producer and may change; removed by the mod splitting on newlines only and never parsing columns. A red line with no row to click is fine here: the machine block is read, not clicked.

Question not asked. Should the scan-failed line show the exact command's stderr or only "status failed"? Default: stderr's first line, truncated.

## 2. row

Pick, at 368 px (two lines) and at full width (the same two lines, longer):
- Line 1: grey repo prefix "framework /" in dim, slug in foreground, then the two seat icons at the line's right end, the busy one spinning. Nothing else on line 1.
- Line 2: state word in dim (the full phase, "check.review", so subphase is visible), the reason phrase (red on a Needs you row, muted otherwise), then "· 12m" (busy duration on Working, phase age otherwise) and "· blocks 2" when above zero, all inline after the reason, never right-aligned.
- Click on the row body: jump. Target rule in one order: the busy seat's pane; else the leaf's recorded pane for the seat the row names (next: B → pane B); else the leaf's tab; else pin the worktree into Files (today's pin). The producer adds `tab` and `pane: {a, b}` to each leaf (state already holds them: `src/state.ts` schema `tab`, `pane`), and the mod runs `pane.focus {pane}` or `tab.select {id}` (AGENTS.md Commands).
Reason: 2a (name, state word, one reason), 4c ("blocks N" on the row), 1b (click points). Keeping line 1 to name and seats makes the slug the one thing at the row's left edge at every width, and keeping the time inline means nothing drifts to the far edge at full width, which answers 5c without a cap. Cost: producer leaf adds two fields; mod `row()` rewritten; tests for tags and the second line cite Test-Change.

Rejected. Seats before the slug (today): 60 px of inset before the name at 368 px (my F10). Time right-aligned: lands 900 px from the slug at full width (tt-01). Pill word for state: 4a removes the colored pills; a dim phase word costs nothing and shows the subphase. A "go to pane" button instead of the body click: 1b says the click jumps. Jump to a log file for failed leaves: akrogon records no per-seat log path in state; the failed leaf's tab usually survives (`src/next.ts` keeps the tab unless the cause is attempts), so the tab is the better target and Files is the fallback.

Evidence. `main.js` row (inset `ROW_INSET`, time column `w(S(44))`); `model.js` leafRow; `src/state.ts` `tab`, `pane`; `src/next.ts` dispatch records `pane.A`/`pane.B` and keeps the tab on failure; AGENTS.md Commands `pane.focus {pane | terminal}`, `tab.select {id}`; direction 1b, 2a, 4c, 5c; Agents list row h30 px8 with duration 11 dim at the right (`mods/agents/main.js`).

Pitfalls. Akrogon's pane ids come from herdr sessions while herdr-app's `pane.focus` takes a pane or a terminal address; whether the ids coincide is unverified. Removed by a check in the producer leaf (herdr-app status lists terminals; compare one id) before the mod relies on it, and by the tab fallback. A jump while the panel is full hides nothing: panel-bar already shrinks on a terminal jump (`panel-bar/main.js` render, "A jump to a terminal while full shrinks"). A long reason at 368 px truncates; removed by the expansion showing it whole (open-row). Slug longer than the line at 368 px: `truncate` on the slug, seats `flex_none`.

Question not asked. When both seats are busy (check.review with A and B), which pane does the click take? Default: A.

## 3. open-row

Pick. The row still expands, from a chevron at line 1's far right (11 px, `workspace-chrome/chevron-right|down`, as the Agents list's groups), not from the body click. Expanded content, in order: the reason in full, wrapping, not truncated; the waiting reason with the blocker's state; the last three moves with ages; the kept lines (locked); Files and Changes as D19 buttons (muted text, fill on hover). Out: seat config and source, command text, plan path, worktree path, history beyond three, done, attempts, verdict. No fill on the open row; the chevron's direction is the open state.
Reason: 1b takes the body click, 2a wants more on click, so the "more" needs its own small target. The failure text at 368 px is the one thing that cannot fit a line. Cost: a chevron element and a wrap-capable text child; the `props().fill === "selected"` proof prop loses its subject and goes with a Test-Change citation on 'stage tint is composited...' and the expand proof.

Rejected. No expansion: loses Files/Changes and the full failure text. Body click expands and the expansion holds a "pane" button: contradicts 1b. Keep the `t.selected` fill for open: that fill means focused item in every shipped list; the chevron says open.

Evidence. `main.js` row detail and buttons; `mods/agents/main.js` group chevron; D19 Buttons; direction 1b, 2a; `tests/tasks-mod-host.test.ts` 'expanding a leaf shows the recorded repository kept paths and reasons' (kept stays).

Pitfalls. A chevron 11 px wide is a small target at a 368 px row; removed by giving it the row's full height and 24 px width as a hit area. The expansion's wrapping text needs a `min_w(0)` parent or gpui will not wrap; removed by the same `v_flex().min_w(0)` the detail already uses.

## 4. type-and-color

Pick, all sizes before the scale rule in fork 5:
- Header: shipped 42 px, title 13 semibold, count 12 in `t.ansi1` when `env.red` is above zero, absent otherwise.
- Section label: 11 medium, `t.dim`, with the count after it in dim (the Agents list's group row); the Needs you label alone in `t.ansi1`.
- Repo prefix: slug size, `t.dim`. Slug: 13, normal weight, `t.foreground`; muted on Paused rows (the Agents list's idle names).
- Line 2: 11; state word `t.dim`; reason `t.muted`, or `t.ansi1` on a Needs you row; time and "blocks N" `t.dim`.
- Pills: gone. The state word on line 2 replaces them.
- Red marks exactly: header count, Needs you label, the reason phrase on a Needs you row, machine red lines. The slug never turns red.
- Spinner: `t.muted`, not `t.working` (4a: no color outside problems). Seat icons as the sidebar draws them today (`agents-by-tab` treatment, same code path), so the two lists match.
- Hover: `t.hover` fill. Open row: no fill. `t.selected` unused.
Reason: 4a, 6c; one red meaning. Contrast: the reason is the line the operator reads, so it gets `t.muted` (#C9C3AF on #1F241E) rather than `t.dim` (#687061), which is kept for labels and times. Cost: text edits in `row()`, `repoSection()` replaced by a section label, `pillFor` and `withAlpha` deleted with the pill test.

Rejected. Slug in red on problems: two red things per row and the name becomes hard to read at a glance. A red 6 px dot before the reason (today's alert style): a part that says what the color already says. Section labels colored by state as the Agents list does (`t[g.status]`): 4a overrides it for Tasks. Spinner in `t.working`: a color on a non-problem.

Evidence. `themes/omarchy.json` colors (foreground, muted, dim, hover, selected); `mods/agents/main.js` section label 11 medium, row name muted when idle, duration 11 dim, spinner 12 `t.working`; `mods/files/main.js` header h42 px14 13 semibold, count 12 dim; D19 Section labels and Buttons; direction 4a, 6c. Contrast figures: model knowledge of relative luminance, no stronger source searched.

Pitfalls. `muted` and `foreground` are nearly one color in this theme and distinct in graphite and paper; removed by stepping line 2 down by size (11 vs 13) as well as color, so the ladder holds in every theme. Red text on a hovered row sits on `t.hover`; `t.ansi1` on #2A3028 stays readable, no compositing needed once pills are gone.

## 5. scale

Pick. Row content follows `settings().font_size`: slug, reason, state word, time, section label, and the row's own height, seat icon and chevron sizes (the lock says icons are sized to the row). Everything that is panel chrome stays at herdr-app's fixed px: header height and text, horizontal paddings, the machine block, button heights. So K multiplies the row and nothing else.
Reason: the lock is about reading the task text at terminal size; 6c says the panel should feel like Files and Changes, whose headers are fixed 42 px. With the terminal at 18.67 the row text is 18.67 and the header stays 42, the proportion of the Agents list ("Agents" 11.5 label over 13 rows) at a larger body. Cost: `S()` applied to a shorter list of sizes; nothing new.

Rejected. Scale everything (today): header 60 px beside Files at 42; the panel reads as a different app (my F6). Scale nothing but the slug: the reason line at 11 px under an 18.67 px slug is a 1.7:1 step, too steep to read as one row.

Evidence. `main.js` render, `K = font_size / 13`, `S()` on every size; `settings.json` font_size 18.67; AGENTS.md "The look" (mods' text sizes are their own px and follow zoom); `mods/files/main.js` h42; direction 6c; lock wording.

Pitfalls. herdr-app's `zoom` already scales mod text; a mod that also multiplies by font_size double-scales under zoom. Removed by reading the lock as "row text equals terminal size" and nothing more, which this pick does. A size not routed through `S()` silently stops following; removed by one `S()` list in one place, the row function.

Question not asked. Should the header count and section labels follow the terminal size too? Default here: no, they are chrome.

## 6. width

Pick. Narrow first: the two-line row above fits 368 px with a 30-character slug at 18.67 px (368 minus 16 padding, two 18 px icons and gaps). No content cap at full width; the row is left-weighted (nothing right-aligned except the chevron), so a wide panel shows the same rows with reasons untruncated, not an empty right half. Header and list share the same left edge (header px14, list rows px8 inside a p6 scroll area). Tasks opens at side width: change panel-bar `request` so an opening from closed runs SIDE, not FULL, and the ⤢ button grows. One herdr-setup change with its routine test.
Reason: 5c; 2b (opened on the dot while working, the terminal should stay). Cost: a second repo touched (herdr-setup routine.js and its test); the D19 760 cap is dropped for Tasks because the cap existed to keep the pill and time near the slug, and both now sit inline.

Rejected. Cap 760 per D19: with time inline the cap only creates an empty right half, the thing 5c forbids. A width threshold with `on_size_change` dropping parts below 420 px (my earlier D8): the two-line row needs no threshold; fewer moving parts. Keep opening full (today's `request`): the operator opens on the dot to look, not to leave the terminal.

Evidence. `panel-bar/routine.js` request (from closed: select, show panel, hide main, FULL), shrink, SIDE 368 px; `panel-bar/main.js` window start shrinks and a terminal jump shrinks; `layouts/flat.json` panel px 368 min 280; `main.js` render `max_w(S(880))`; D19 Reading width; direction 5c, 2b; gpui-kit `on_size_change` exists but is not needed.

Pitfalls. A slug and a repo prefix together can pass 30 characters; removed by truncating the slug, never the prefix, with the prefix `flex_none`. The route's "opens full" behavior may be relied on by the Files view (a file beside a tree wants width); removed by changing only the Tasks view's opening, keyed on `req.view`, or by asking. Panel min 280 px: the row still holds at 280 with a 22-character slug.

Question not asked. Should Files and Changes keep opening full while Tasks opens at the side, or should all three open at the side? Default: Tasks only, smallest change.
