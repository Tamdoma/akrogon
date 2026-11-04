# Fork notes, slot A: remaining forks

## machine-lines

Pick: one block above Needs you, drawn only when it has a line. Red lines: scan error with "rows from Nm ago" when old rows stay; deploy failed with its step; repo unreadable or errored, naming the repo. One grey line: "run waiting in <repo>" for `env.run` (direction 3a: short line, no fields). The historical slow merge leaves the board (it is history, not a problem; direction 1a, 3a age never makes a row loud). Old Failed and Missing task alerts go (rows own them, sections Taken).
Reason: the header problem count always has a visible line to point at (sections Taken 8). Cost: the run line loses its table; the CLI keeps it.
Rejected: alerts at the bottom (opened on the dot, 2b, the operator must see the cause first); slow merge kept quiet (still clutter with no action).
Evidence: `model.js` alerts; `main.js` render (`this.error` keeps old rows, `stamp` unused); `src/status.ts` env.run built when a run waits.
Pitfalls: `env.run` is a multi-line table; show only the repo names parsed from nothing: use the repo list the producer already has? The mod cannot parse the table safely. Removed by showing "a run is waiting" plus repo only if the producer gives it; else the generic line. Question: none.

## row

Pick, one line at 368 px: seat icons (locked) · grey repo prefix + slug (slug truncates first) · right side: reason phrase in grey, time. Second line only for Needs you rows: the problem phrase in red (failed reason, missing name, "merge job stopped", "waiting on parked X"). "blocks N" joins the reason when N > 0. Time: busy duration for Working, phase age otherwise, short form "9m", "4h". Subphase in the reason for Working ("check repair") and Waiting ("next: B").
Click: the row expands (open-row fork). A separate "go to seat" target on the busy seat icon runs `run("pane.focus", {pane})` when the producer reports a herdr-app pane for that seat; today akrogon seats run in the old herdr session (state `pane.A/B` are herdr pane ids, not herdr-app), so the target is absent until the herdr-app chart moves seats; no guessed pane.
Reason: 2a little text, 1b points, 6c follows the Agents list (its rows run `pane.focus`, `mods/agents/main.js`). Cost: 1b is only half delivered until seats live in herdr-app.
Rejected: click opens the seat's log in Files (no log path in the envelope; logs are resolved from herdr agent sessions by the watch observe script; a second producer surface for a short-lived need); two lines on every row (2a).
Evidence: `src/state.ts` pane, tab fields; `skills/watch-issues/scripts/observe.ts` resolveLog; shipped agents `run("pane.focus")`, `run("terminal.peek")`.
Pitfalls: producer emits `pane` per seat only when it is a herdr-app terminal (resolved by herdr-app address), never the old herdr id. Question: the herdr-app chart owns where seats run; this board only reads the field.

## open-row

Pick: expansion stays (click on the row). Shows: the problem in full (no truncation), what it waits on, the last 3 moves with age, Files and Changes buttons, kept list (locked). Leaves: seat config sources, command text, plan and worktree paths as text (Files/Changes open them), attempts. No selected fill; a chevron or a thin left marker shows it is open.
Reason: 1b + 2a: the row points, the expansion is the short why. Cost: plan path not visible; Files opens the worktree.
Rejected: no expansion (failure text longer than one line would be unreadable anywhere on the board); keep all fields (clutter the operator called out).
Evidence: `main.js` row detail; `field()` truncates.

## type-and-color

Pick: three tiers. Section labels 11.5 dim semibold (like the sidebar's "Spaces"/"Agents"). Slug 13 medium foreground. Everything else (repo prefix, reason, time, detail) 11.5 `dim`. Red (`ansi1`) only for Needs you text and the problem count; no stage pills (stage text lives in the reason, grey). Spinner in foreground. Hover uses `t.hover`; open row no fill. Seat icons follow the sidebar's one-color treatment (direction 4a "like the sidebar"), shapes unchanged.
Reason: 4a, 1a. Cost: host tests for pill compositing go (Test-Change).
Rejected: keep pills calmer (4a says color only for problems).
Evidence: herdr-setup agents-by-tab TONE and mono icons; D19 pill rule is overridden for Tasks by 4a.

## scale

Pick: the font-size factor scales text and row heights only; header height 42, paddings and the panel frame stay at herdr-app's fixed values so Tasks lines up with Files and Changes (6c).
Reason: the lock is "text follows font size"; the 60 px header and 1.44x paddings are the mismatch (map P7). Cost: one more rule to keep: `S()` for text and row height, plain numbers for chrome.

## width

Pick: design at 368 px; full width caps content at 760 (D19) with the header spanning the same 760 so the count sits above the list; Tasks keeps opening at its current width (no herdr-setup change).
Reason: 5c narrow first; D19 is the standing rule; removing a second repo change. Cost: wide still has empty space on the right, but the header and list align.
Rejected: split view (adds a pane; D19); Tasks opening at side width only (herdr-setup exception for one view).
