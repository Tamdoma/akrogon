# Content map C: what the Tasks board shows and what it should

Inputs read: `herdr-app/tasks/main.js`, `model.js`, `model.d.ts`, `schedule.js` (whole); `src/status.ts` sections leafJson, leafRed, undelivered, note, run line, envelope; `src/state.ts` broadcastPending; `src/land.ts` landAlive; `skills/watch-issues/SKILL.md` sections Observe and Judge; `src/AREA.md` Tasks entry; shipped `mods/agents/main.js` SECTION and status(); herdr-setup `panel-bar/routine.js` redDot and `main.js` red dot, `layouts/flat.json` panel node, git log of `mods/needs-you`; test names in `tests/tasks-mod.test.ts` and `tests/tasks-mod-host.test.ts`; screenshots `live/tt-01-small.png` (today, after cleanup) and `live/ui-after-tasks-icons.png` (22:05, seven rows, before cleanup). Skipped: the rest of status.ts, the log and timing files, other screenshots.

## 1. Inventory: every element and its source

Header
- E1 Title "Tasks": static (`main.js` render).
- E2 Count "N open": rows with a slug and a pill, so blocked, stopped and paused-grey rows count and merged rows do not (`main.js` render, `open`). In tt-01 "2 open" counts one working leaf and one leaf blocked on it.

Alert lines, above the first repo, foreground text with a colored dot (`main.js` alertLine; `model.js` alerts)
- E3 Scan error: exec or parse failure text (`main.js` render, `this.error`).
- E4 Run line: `env.run`, which status.ts builds as a multi-line ASCII table ("run line (one per repo)" plus header and rows, `status.ts` envelope section) when any verify run is waiting. The board prints that table text inside one alert line.
- E5 Deploy failed: `env.deploy` attempted sha, step, error (`release.ts` readDeployRecord).
- E6 "Failed: repo/slug" per leaf in phase failed.
- E7 "Missing: ..." per `leaf.missing` gap (kind, name, holder, steps).
- E8 Repo unreadable path and error; repo error when nothing unreadable.
- E9 "Slow merge: repo first seen at leaf run, last Nm vs normal Nm" (`repo.slow`), for any registered repo, listed or quiet.

Repo section (`main.js` repoSection; `model.js` board)
- E10 Repo name, 13 semibold, plus "paused" tag (`repo.paused`). Repos with no leaves and no errors are left out.
- E11 Group heading per folder segment under `issues/open` (`leaf.group`), 11.5 dim, inserted where the path changes.
- E12 Merge queue note: slug, "holder" or place, "no merge record" (`repo.queue`).
- E13 Parked note: parked slugs (`repo.parked`).

Row (`main.js` row; `model.js` leafRow)
- E14 Two seat icons: program matched by harness key or first run word (`seatProgram`); the busy seat (`busy_since` set) shows the spinner instead.
- E15 Slug: red when `leaf.red` (failed, missing gap, or a delivery error on a non-busy seat, `status.ts` leafRed), muted when merged, else foreground.
- E16 Pill: first word of the phase; none when merged; grey when stopped or repo paused; stage color otherwise.
- E17 Time: `clock(now - phase_since)` as "0h 09m"; blank when the log has no entry record.
- E18 Second line, tags then last move, joined by "·": blocked-by slug (dep phase or parked/unreadable/missing), stopped, broadcast pending, land alive/dead, a/b prompt code, failure cause: reason, missing kind name, fix rounds N; then the last history line as "from → to".

Open row detail (`main.js` row, `d`)
- E19 failed: cause: reason.
- E20 seats: "A harness command — source path", same for B.
- E21 plan: absolute path of plan.md. E22 worktree: absolute path.
- E23 blocked by. E24 missing (red, with steps). E25 kept: repo kept paths and reasons (locked: stays).
- E26 history: last 10 moves with "Nm ago".
- E27 Buttons Files and Changes: pin the worktree into that panel view (`pinIntent`, shared `worktree.pin` and `panel.request`).

Computed and never drawn: `detail.done`, `detail.attempts`, `detail.verdict` (`model.js` leafRow); `board.quiet` (`model.js` board); envelope `first_prompt`, `red`, `generated`, global `kept`, `merges`, `charts`, `unpacked`, `deploy.active` (`model.d.ts`).

Empty states: "Loading tasks…"; error text plus "Board unavailable; retrying on the next tick"; "No registered repos" only when no repo has rows and none is quiet (`main.js` render).

## 2. From the operator's seat

In two seconds
- How many leaves need me, and which ones, each with one phrase saying why.
- Which leaves are working right now and for how long the seat has been busy.
- Whether the machine is broken: scan failed, deploy failed, a repo unreadable. Only when it is.

On demand (one click)
- Why a row waits: the blocker and its state, the queue place, the missing gap's steps.
- The last few moves with ages, the verdict after a review, attempt and fix-round counts.
- The buttons to open the worktree in Files or Changes.

Never on this board
- Seat configuration and its source file (E20): operator tuning lives in akrogon.yaml, not on a status board.
- Absolute paths as text (E21, E22): the Files button is the action; a path the operator cannot click is noise.
- The CLI's run-line table (E4) and the deploy sha (E5): the board needs a short fact ("deploy failed at step X"), not the terminal output.
- The group folder as its own heading row (E11): a folder path is not a state; with two rows it doubles the headings (tt-01).
- A slow-merge line for a repo with no open work (E9): nothing on the board to act on. Keep it on the red count or the CLI.

## 3. Categories

Category sources: herdr-app's Agents list already sections by state (Needs you, Working, Done, Idle; `mods/agents/main.js` SECTION), and akrogon's own watch rule classifies leaves as waiting, failed-on-human-prerequisite, failed-otherwise, busy (`skills/watch-issues/SKILL.md` Judge). The Needs you panel was removed today (herdr-setup commit "Remove the Needs you panel"), so Tasks is the one board left; the panel-bar's red dot on the Tasks button is `envelope.red > 0` (`panel-bar/routine.js` redDot).

- K1 Needs me. Leaf failed (E6, E19), missing gap (E7, E24), delivery error on an idle seat (E18 "a prompt code"), stopped (E18), blocked on a parked, missing or unreadable dependency (E18 blocked-by label), land dead (E18), broadcast pending past its pass (E18). Today these are spread over a red slug, a tag, an alert line and a detail line for the same leaf (ui-after-tasks-icons.png: "Failed: framework/fixture-weave-recorder" on top, the red slug, and "blocked: criterion 1 unprovable..." below it, three places for one fact). Collapse to one row with one reason phrase. Missing: the reason phrase itself as the row's second line; today the second line is tags plus last move.
- K2 Working. Any seat with `busy_since` set in a live phase (E14 spinner). Missing: the busy clock. The envelope carries `busy_since` and the CLI prints "busy A 0h 12m" (`status.ts` note); the board drops it and shows the phase age instead. A seat busy 3 hours is the operator's stuck-agent signal (watch-issues Judge, Busy).
- K3 Waiting on another leaf. `blocked_by` where the dependency is a live leaf (E18, E23). Nothing for the operator to do; show the blocker's slug and its state, dim.
- K4 Queued. A live phase, not stopped, no blocker, and the phase's required seat not busy (required seats per phase: watch-issues Judge). Not derivable from the pill alone. Fork FC3 below decides whether it reads as "queued" or "needs me".
- K5 Recently done. Merged leaves still under `issues/open` because an owner epic is not complete (E15 muted, E16 no pill). Not actionable. The removed Last merges fold stays removed.
- K6 Machine. Scan error (E3), deploy failed (E5), repo unreadable or error (E8), slow merge (E9), run line waiting (E4). Not leaves. Draw as a short block, red only for E3, E5, E8.

What goes: E11 group headings as rows; E2 "N open" (counts a blocked row as open); E20 seat sources; E21 and E22 as text; E4 as a table. What moves: E12 queue place and E13 parked become row facts or detail, not repo notes. What stays: E25 kept (locked), E27 buttons, E26 history on demand, E14 seat icons (locked).

Missing that the operator would act on
- X1 One reason phrase per needs-me row (K1).
- X2 Busy duration per working seat (K2), from `busy_since`.
- X3 The verdict after check.review (`detail.verdict`, computed, never drawn): whether B said Fix is what decides the operator's next look.
- X4 Which seat the phase waits on (required seat per phase) so "check" with A idle and B idle reads differently from "check" with B busy.
- X5 Attempts and fix rounds together as one risk count (computed, never drawn except fix rounds as a tag).
- X6 Needs-me count in the header, red, equal to what the panel-bar dot counts.

## 4. Forks that change the outcome

FC1 List shape: state sections across repos, or repo sections with state inside.
- O1 (recommended). Sections by category (K1, K2, K3+K4, K5), repo shown as a dim prefix on the slug ("framework / about-identity-title"); K6 as its own block. Matches the Agents list beside it. Later: rows jump between sections as state changes (the Agents list does the same; accepted there); repo-level facts (paused, queue, parked) lose their heading and become row facts or a K6 line.
- O2. Keep repo sections, order rows by category inside each. With five repos the needs-me rows scatter over the list (ui-after-tasks-icons.png had two repos; the quiet list named eleven more).
- O3. As is (folder order). The operator's complaint stays.
Ask: no, O1 follows the shipped list; D19 asks the panel to match herdr-app's mods.

FC2 Where "needs me" is defined.
- O1 (recommended). In the producer: widen `leafRed` (`status.ts`) to the K1 set, so the CLI red count, the panel-bar dot and the board agree on one definition. A second leaf in akrogon src with a test; `envelope.red` changes meaning for the dot too.
- O2. In the mod: compute K1 from the leaf fields in `model.js`. One repo, but the dot and the board can disagree (dot off, board shows needs-me rows).
Ask: no.

FC3 An idle required seat with no blocker (K4): queued or needs me.
- O1 (recommended). "Queued" with a dim "waiting for next" phrase. `akrogon next` is run by the operator or by the watch cron (watch-issues Observe); the envelope does not say whether a dispatcher will come. Later: when no watch runs, a leaf can sit queued all night without the red count moving.
- O2. Needs me. Honest without a watch, noisy with one (every leaf between prompts turns red for a pass).
- O3. Add to the envelope when the last `next` pass ran, and show queued rows as needs-me when the last pass is older than N minutes. Producer change plus a threshold to tune.
Ask: yes, this is the operator's working habit (does a watch run during the day).

FC4 The time column.
- O1 (recommended). Time since the row's category began: `busy_since` for working rows, `phase_since` otherwise, in the short `since` form ("9m", "4h"). One rule, two to seven characters narrower than "0h 09m" at 368 px.
- O2. Phase age always, busy clock in the second line of working rows. Two numbers per working row.
Ask: no.

FC5 The second line.
- O1 (recommended). The row's category reason: the needs-me phrase (K1), the blocker and its state (K3), "waiting for next" (K4), nothing for K2 and K5. The last move stays in detail with its age.
- O2. As now (tags plus last move). The last move "check.review → check.repair" repeats what the pill and the detail say.
Ask: no.

FC6 Recently done rows (K5).
- O1 (recommended). One dim line per repo, "3 merged, waiting on siblings", expanding to the slugs. Rows the operator never acts on stop costing a row each.
- O2. Dim rows as now. Nothing to change; a large epic fills the list with grey.
Ask: no.

FC7 Machine block (K6) placement and shape.
- O1 (recommended). Red items (E3, E5, E8) on top as short label-and-value lines; E9 and E4 below the rows, dim; E4 reshaped at the producer into fields (repo, waiting since) instead of a text table. Producer change for E4.
- O2. All on top as now. The loudest line is about a quiet repo (tt-01).
Ask: no.

FC8 Actions on the board (restart a failed leaf, run next, stop a seat).
- O1 (recommended). None. The mod is read-only by design (`main.js` header, `AREA.md` Tasks entry) and the operator said the move to herdr-app is near; buttons that exec akrogon widen the scope and need confirmation flows.
- O2. Add "next" and "restart" per row. Fast, but a misclick re-prompts a seat.
Ask: no.

Tests touched by any of the above: 'board orders the current space repo first...' (FC1), 'leaf rows carry seat logo choices, red flag, uncolored time and tags' (FC4, FC5), "a leaf's second line shows its last move" (FC5), 'a leaf row under its group heading...' (group headings go), 'paused repository rows use grey pills' (FC1 repo facts). Each needs a Test-Change citation.
