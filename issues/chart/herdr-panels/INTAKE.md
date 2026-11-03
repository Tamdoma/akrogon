# Intake: herdr-panels

## Scope

Destination: the operator's herdr-app customizations in /home/ivan/Work/omarchy-customizations/herdr-app (GitHub ivanjuras/omarchy-customizations), installed into ~/.config/herdr-app and linked into every herdr-app session home. Not registered with akrogon (`akrogon config` there: `repo: none`). Filed here in akrogon as intake only, not charted yet (operator 2026-11-03, message 7). The opening territory maps from seats A (claude), B (codex), C (pi) and D (agy), written before charting was paused, are in `slots/map-A.md` to `slots/map-D.md`, with the brief they answered in `slots/map-brief.md`. That brief names its original /tmp paths.

Proposed grouping: A1 Changes scopes, A2 Files reading, A3 worktree picker and open-as-pane, A4 Tasks board, A5 Needs-you inbox, A6 decision buttons, A8 Spaces sizing and scroll. A7 (cost meter) dropped by the operator.

## Provenance

- Operator: chart-door session bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab (pane t15, herdr-app session infra), 2026-11-03, messages 1-3 below

## Source: operator 2026-11-03

1. "Read ~/.config/herdr-app/AGENTS.md. Can you give me some ideas on how to improve the layout here? Look at the logs of what we've done so far in the last 2 weeks across all repos on this PC, and tell me what I could modify or add to make the interface serve its purpose better. Look at the Files and Changes tabs in the top right. Anything else useful that we could add?"

2. "Let's use chart-issues to chart out everything except A7, because I don't need the cost meter at all. Also, the spaces then has to be scrollable vertically, because I use different spaces a lot. Use slot b consultant (codex) and slot c consultant (pi) and slot d consultant (agy) with their default models that are already on. Interview me for fine details, we need to get this done properly. I need the changes to be as useful as possible, the UI of the individual additions has to also be beautiful. For example, using the logos from different agent types, like logo from Claude, logo from i, and logo from Codex, etc. It needs to be beautiful, but the underlying theme has to stay the same."

3. "We're using the new herdr-app, not the old herdr, so creating tabs and agents is a bit different. Actually, we created and prepared the issue for that so look into that issue on how we resolved it. As soon as herdr-app is ready to go (I'm still waiting for Moshi integration), we'll change akrogon over, but for now, just look at that when charting."

4. "Ok, can you actually stack b,c,d slots below each other, and not next to each other? In order." / "So, slot A (you) has to take 50% of the width. The other 50% is stacked vertically by b, c and d." / "They should all take the same amount of height (33% each)."

5. "Also, the names for those consultants should be "slot-b", "slot-c" and "slot-d" for the charting process. Just put it into the intake, so we don't forget that, and apply immediately."

6. "the work needs to be written in a proper folder, according to the current akrogon rules, not randomly like this into the tmp folder. As I'm giving you these instructions, keep looking at how akrogon works today, and then fill out and update the intake.md file so we have the file up to date for later charting."

7. "Wait, why is that folder back in the omarchy-customizations? Move it over to akrogon as an issue. We're not gonna chart it out yet."

Messages 4-6 are about how this door runs its consultants; they are also recorded in /home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md.

## Agent findings

From ~1,240 typed operator prompts across 605 Claude Code sessions, 2026-10-20 to 2026-11-03 (akrogon, tamdoma framework, lingua-relay, boulevard-automation, mdcny-ghl-data-pulls, client sites):
- The operator runs a fleet: chart doors, akrogon leaves moving plan -> implement -> check -> merge, slot B/C consultant panes, watch-<repo> tabs, handovers between panes. Tabs per space follow t-/c-/w- (terminal, chart door, watcher).
- ~83 prompts ask state: "Is everything moving? Nothing stuck?", "Where is the holdup?", "did it merge?", "what was handed off? I don't see it in akrogon status", "where is that visible? In what tab?", "Check the questions in deploy-combined tab".
- ~220 prompts are decision-code replies such as "1a | 2a | 3b", "a1 - ... | a3 - ...", "go 01b"; 263 are the alias "elid".

Findings on the shipped Files and Changes panels (`~/.config/herdr-app/mods/files/main.js`, `mods/changes/main.js`):
- F1 both follow the focused pane's live folder; door and watcher panes sit in the main checkout, leaf work happens in `~/.akrogon/worktrees/<repo>/<slug>`.
- F2 Changes shows only uncommitted work; agents commit their own work.
- F3 Commit runs `git add -A` then `git commit -m` (changes/main.js `commit()`), sweeping akrogon's `issues/*.jsonl` and other agents' edits.
- F4 Files previews markdown as raw code (Editor, no TextView.markdown).
- F5 Files has no filter/search; panel 368px; Changes file list capped at 200px.

Proposed items the operator kept (A7 cost meter dropped by the operator):
- A1 Changes: scope switch Working tree | Branch vs main | Recent commits; remove the Commit button or make it commit only selected files.
- A2 Files: render .md formatted, filter/search, "changed recently" view.
- A3 Files and Changes: worktree picker for the space's repo; "Open as pane" for full width.
- A4 Tasks board: right panel, a "Tasks" tab beside Files and Changes, shown by default; one row per open akrogon leaf across registered repos (repo, slug, phase, slot, time in phase, red past normal), merge queue, last merges; click jumps to the leaf's pane; fed by `issues/log.jsonl` via watchFolder.
- A5 Needs-you inbox: left sidebar above Agents, only when an agent waits; question text and a reply box that types into that agent.
- A6 Decision buttons: thin strip under the terminal, only when the focused agent's last reply offers coded options; clicks build "1a | 2a" and send it.
- A8 Spaces block smaller, Agents gets the rest. Operator addition: Spaces must scroll vertically.
Placement sketch A gave the operator (not yet an operator decision): A4 right panel stack first tab; A5 left sidebar above Agents; A6 strip under the terminal; A8 sidebar.

## Round 1 (2026-11-03): where the code lives, where Tasks gets its data

Round text and seat positions: `slots/map-merged.md`, `slots/map-rebuttal-B.md`, `-C.md`, `-D.md`. A presented 1a (panels in akrogon), 1b (register omarchy-customizations), 1c (split), and 2a (`akrogon status --json`) vs 2b (mod reads akrogon files).

Operator, verbatim, in order:
- "1 - So those new panels would not show up if I click on a different workspace in Herder. How does that work? | 2 - Does that mean we don't even need to have the "akrogon status" terminal CLI command anymore? Can we actually turn it into a UI feature here that we're building right now, along with the new additions we're building?"
- "1 - but this code If it lives inside of the Acrogon repo, it still impacts everything else, am I correct? All the other spaces as well?"
- "But does it make sense to have the actual Herder code inside of Akron? To me it doesn't make any sense."
- "What's the actual herdr-app way and recommended way to do it?"
- "so if we put it into ~/Work/infra it's still according to herdr-app rules?"
- "Yes, and it needs to be turned into a repo. I've created the remote repo so it needs to be connected to it: https://github.com/Tamdoma/herdr-setup.git. Also, we need to make sure that all of the customizations I've done so far on herdr-app for myself are also there, not just the layout itself. Is that doable and according to herdr-app conventions, and if not, what's the best architecture?"
- "go, but consult with consultants first. | 2 - 2a"

Settled:
- Q1: the operator's herdr-app setup gets its own repo, `/home/ivan/Work/infra/herdr-setup` (remote https://github.com/Tamdoma/herdr-setup.git), holding every personal herdr-app customization, not only the layout. General panels (Files, Changes, Spaces, Needs-you, decision buttons) live there. Only the Tasks board is akrogon's and ships from akrogon as a herdr mod, as akrogon ships its old-herdr plugin today (`plugin/herdr-plugin.toml`). Reason: herdr UI code does not belong in akrogon; herdr-app's manual ("Layouts and mods other people made") treats a layout and its mods as one shareable folder, and a mod as its own folder.
- Q2: 2a. akrogon gains `akrogon status --json`; the Tasks board reads only that and shows everything `akrogon status` shows (paused, stopped, blocked-by, Missing:, deploy failed, broadcast pending, slow merge, merge queue), so the operator never needs to run the command. The text command stays: agents read it (23 files, e.g. `skills/watch-issues/SKILL.md:22`, `Missing:` lines in plan/implement seats).
- Answered along the way: panels are part of the layout, so they show in every space of every herdr-app window; a window sees only its own session's terminals, so Tasks rows from another session have no jump target.

### Round 1 follow-through: herdr-setup repo built (2026-11-03)

Seats B, C and D each ran one focused check of the move plan (`slots/setup-repo-brief.md`, returns `slots/setup-repo-check-B.md`, `-C.md`, `-D.md`). Their fixes were folded in before anything was changed. A built it:

- `/home/ivan/Work/infra/herdr-setup` (branch `main`, remote origin https://github.com/Tamdoma/herdr-setup.git, not pushed). It carries the 13 earlier commits from omarchy-customizations' `herdr-app/` (`git subtree split`), then `51a23a6`. Shape: `layouts/`, `mods/` (agents-by-tab, board, prefix, session-status, tab-left, tab-right), `keys.json`, `settings.json` (herdr-app's own shape), `bin/herdrapp`, `omarchy/apply-herdr-app-theme`, `install`, `README.md`, `.gitignore` (jsconfig.json, *.d.ts, *.error, *.reset-*, *.old-*).
- `./install` links keys.json, settings.json, each mod and each layout into `~/.config/herdr-app` (`ln -sfn`; anything already there moves to `~/.local/state/herdr-setup/backup-<time>/`), links `~/.local/bin/herdrapp`, runs the new `herdrapp session link` (links personal files into every existing session home), and installs a one-line Omarchy theme hook that runs the repo's copy (`omarchy hook install` copies files, finding C). A second run moved nothing and left the repo clean.
- omarchy-customizations `6e6ff59` (not pushed): `herdr-app/` removed; `install.sh` clones herdr-setup if missing, runs its `install`, then writes the font into `settings.json` through the link. README and GUIDE point at herdr-setup. Hyprland files (`hypr/terminal-opacity.lua`, `hypr/bindings.lua`) stay there.
- Push order when the operator approves: herdr-setup first, then omarchy-customizations, so a fresh install never clones an empty repo (finding B).

Findings that matter for building the panels:
- herdr-app writes through a linked `settings.json` without replacing the link: `app.zoom_in` then `app.zoom_reset` in the infra window changed the main settings file's mtime while the session's link stayed a link (probe 2026-11-03). This settled B/C/D's disagreement: zoom lives in settings.json (D), and linking settings is safe (C's alternative).
- Layout edits in the repo reload live in a running session window: breaking `layouts/flat.json` showed "layouts/flat.json was not applied" in `herdr-app status` within 3 s, and restoring it cleared the error.
- Mod edits do not hot-reload in a session window. They don't through the new links, and they didn't with the old setup either (control test: real folder in `~/.config/herdr-app/mods`, linked into the session). A session window loads personal mods through links and does not watch them. Switching layouts (`layout.switch` board, then flat) or reopening the window loads the edit. A panel leaf's done-criteria must reload this way before judging a change in a session window.

### Default layout (2026-11-03)

Operator, verbatim: "push both, then next round. Make sure that what we do is the default layout. I want everything we're doing to be the default layout. Is that clear?"

Settled: every panel and change in this work goes into the `flat` layout, and `flat` is the layout every herdr-app window opens with (main window, every session, new sessions). `board` gets none of the new work. Done 2026-11-03: herdr-setup `7801cde` makes `./install` select `flat` (switch an open window, else `shared.json` `layout`); new sessions copy the main window's layout (`bin/herdrapp`). Both repos pushed: herdr-setup `main` at `7801cde` (first), omarchy-customizations `6e6ff59`. The escape hatch (`Ctrl+Alt+Shift+Esc`) still returns to Herdr's shipped `main`; nothing can change that (AGENTS.md "Changing things safely").

## Round 2 (2026-11-03): agents waiting on the operator (A5 Needs-you, A6 answer bar)

Seat notes: `slots/agent-questions-{A,B,C,D}.md`, merged `slots/agent-questions-merged.md`, rebuttals `slots/agent-questions-rebuttal-{B,C,D}.md`.

Operator, verbatim: "1a | 2a | 3a | 4a | 5 - draw it so I can see it. I like the way the terminal area is done here. I don't want to change that main part. I want it all to be under the new pane like what Files and Changes are today."

Settled:
- 1a: Needs-you lists agents stuck on a prompt (`blocked`, with hc's `kind`) and every top-level agent that finished (`done`), each with its last lines and a reply box. Sub-agents (consultants) appear only when blocked. A row with a half-written reply stays until sent or its turn advances.
- 2a: options come from the agent's visible screen (`hc read --lines 0`, 1 ms, measured by D); buttons only when the last reply has 2+ options sharing a number, a "(recommended)" mark, or a "Reply `1a 2b`" line; a "load the rest" button reads history once when question 1 scrolled off. Done-criterion before build: real saved screens from claude, codex, pi and agy as fixtures, zero false buttons.
- 3a: finished agents get plain `hc send` (no focus switch); `blocked` with `kind: question` gets `hc send --force` only after a per-harness probe proves it, until then the button opens the agent; permission and auth always open the agent. Re-check terminal, state and turn right before sending; refuse on change.
- 4a: option buttons fill an editable draft, Send submits; "Recommended" fills every recommended pick; "elid" sends "elid" at once.
- Q5 placement: the terminal area stays exactly as it is. Everything new goes in the right-hand panel, like Files and Changes today. A drew the layout for the operator's review (pending).
- Q5 placement, after A's drawing (right panel with Tasks, Needs you, Files, Changes buttons; Needs-you cards hold the answer bar): operator, verbatim: "I don't want to be complicating the existing interfaces. I like what they are today." Settled: existing interfaces stay as they are. The left Agents list keeps its Done group (finished agents show both there and in Needs you). The terminal area does not change. New features live only in the right-hand panel, reached by buttons beside Files and Changes.
- A8, after A's sidebar drawing (a: as today, b: Spaces gets a smaller fixed share and scrolls): operator, verbatim: "Ok, b is better. That thing in brackets, does it have to have that name? I can already see what agent harness they are based on the logos: [screenshot of the Agents list with logos]. What would change compared to what they are today, except for the height?" Settled: b. Only the heights in `layouts/flat.json` change (Spaces a fixed share of about 5 rows and scrolls, Agents takes the rest); the Spaces and Agents rows, logos and names stay exactly as today, with no harness names added.

## Round 3 (2026-11-03): Tasks panel (A4)

Seat notes: `slots/tasks-panel-{A,B,C,D}.md`, merged `slots/tasks-panel-merged.md`, rebuttals `slots/tasks-panel-rebuttal-{B,C,D}.md`. A presented the round, then drawings per option on request, then the drawings blended under each question.

Operator, verbatim: "1b - because it's not unusual for the agents to work for more than 1h. The red is when something's really blocked, not time-dependent | 2a | 3a - I need a very intuitive keyboard shortcut to pull that panel up. Come up with it and let me decide. Keep in mind, I'm still using the prefix (look it up, herdr-app customization I've added) | 4a | 5a | File the seed. [screenshot of the round with drawings] <- put this image into the seed as well for reference. Only show drawings / diagrams when it makes sense to make it much easier for the operator to make a decision. The fork still has to contain all the elements (research, etc, everything that it has to contain)."

Settled:
- 1: red never depends on time. Red marks a real block only. Time shows on every row, uncolored. 1b as presented also made a seat busy over 60 min red (`src/next.ts:220` `STALL_MS`); the operator's reason contradicts that part, so it went back as round 3b question 2.
- 2a: a click opens the row in place with the `akrogon status <slug>` contents (history, seats, plan path, kept paths) and buttons that point Files and Changes at the leaf's worktree. After akrogon's herdr-app port, Go to A / Go to B buttons focus the live seat terminals by akrogon's labels; no folder or tab-name guessing.
- 3a: the panel stays closed until opened, like Files and Changes today; Tasks is a button beside them. The operator wants a keyboard shortcut that uses the prefix (`ctrl-b`, herdr-setup `mods/prefix/main.js`); A proposes, operator decides (round 3b question 1).
- 4a: a folded "Last merges (5)" section across repos, with age and total time.
- 5a: open charts (the `akrogon status --charts` rows) folded under each repo.
- A's stated defaults, not contested: `akrogon status --json` always covers all registered repos (text `status` keeps its current-repo filter); the fleet JSON carries each leaf's detail so a row opens instantly; the panel is read-only (no Pack, Stop, Merge).
- Agreed by all seats (merged "Agreed"): repo groups with epic/issue folders; alerts on top and tagged on their row; two-line rows with Program logos; paused on the repo header; empty healthy repos fold into one line; the run line (check admission) is shown; the mod renders healthy repos when status exits 1.

Round format, operator: drawings go into a round only where they make the decision much easier, and every round still carries all parts of `skills/chart-issues/assets/questions.md` "Operator questions and peer exchange". A's round 3 as first shown dropped the Research, How to choose, Pitfalls avoided and Challenge check lines. Seed filed: https://github.com/Tamdoma/akrogon/issues/125 (screenshot on branch `seed-assets`).

### Round 3b (2026-11-03): Tasks shortcut and the red rule

Operator, verbatim: "okay, when you're done, let's continue with everything", then "elid" (A re-presented the round in simpler words), then "1a | 2a".

Settled:
- 1a: `ctrl-b t` (prefix, then t) opens the right panel on Tasks; pressed while Tasks shows, it closes the panel. Added to `herdr-setup/mods/prefix/main.js` ACTIONS; `t` was unused there. `alt-t` rejected: Claude Code binds it to thinking on/off (installed 2.1.317, `"meta+t":"chat:thinkingToggle"`). `ctrl-b f` keeps its current open-only behavior. Done-criterion: `ctrl-b t` opens and then closes Tasks in a new space.
- 2a: no time-based red. Red marks real blocks only: failed, prompt not delivered, Missing key, deploy failed, unreadable repo; after akrogon's herdr-app port also a seat `blocked` on a prompt. The 60-min busy rule (`src/next.ts:220`) is not a red signal. Time shows on every row, uncolored.
- Final shape after rounds 3 and 3b: `slots/tasks-panel-final.md`. Focused check by B, C, D (`slots/tasks-panel-final-check-{B,C,D}.md`) found three defects, fixed in the final shape: a 60 s redraw while visible keeps shown times current without re-running the command (B,C,D); watch only `~/.akrogon` control paths, not its worktrees (B); last merges live in the envelope with per-repo total time (D); `workspace.panels` is seeded by `bin/herdrapp` and updated once by `install` (C).

## Round 4 (2026-11-03): Files and Changes (A1-A3), panel width

Seat notes: `slots/files-changes-{A,B,C,D}.md`, merged `slots/files-changes-merged.md`, rebuttals `slots/files-changes-rebuttal-{B,C,D}.md`. A presented questions 1-5, then, after the operator asked "is it possible that when the tab is opened to take up all the space? in the terminal section (not the left sidebar)?", question 6 (a full-width toggle via `layout.hide main` + `layout.resize panel`; probe pending: terminals keep running and come back unchanged).

Operator, verbatim: "Then elid me everything (full forks) so I can decide easier. The new panel should be full width immediately by default."

A re-presented questions 1-6 in simpler words with question 6 reshaped: which panels open full width. Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

Settled:
- 1a: Files and Changes are cloned into herdr-setup (ids `files`, `changes` kept in flat.json). Each opens in today's view; additions are one header control row. Done-criterion: a first-open shot of each matches today plus that row.
- 2a: the Commit message and button are removed from Changes.
- 3a: Changes views Working (default, today's) | Branch (merge base with the default branch to HEAD; default from `origin/HEAD`, else `main`, else `master`, the base shown) | Commits (last 20 of HEAD; click shows that commit's files and diff; merge commits against the first parent, root commit against the empty tree). Empty Working on a branch offers "view Branch diff (N files)".
- 4a: Files gets a Recent button beside the filter: uncommitted files first, then files from the last 20 commits that still exist.
- 5a: no open-as-pane button; full width (6a) covers wide reading.
- 6a: every right-panel view (Tasks, Needs you, Files, Changes) opens filling the terminal area (`layout.hide main`, panel stretched); the left sidebar stays. A ⤡ button shrinks it to the 368 px side size, ⤢ makes it full again; every new opening starts full. Closing the panel brings the terminal back. Switching spaces shows the terminal again. Probe pending before handoff: in a throwaway session, terminals keep running while `main` is hidden and return unchanged; the saved panel size per layout never sticks at full.
- Agreed by all seats, recorded as defaults: formatted markdown with Raw; repo-wide name filter (`git ls-files -co --exclude-standard`, hidden outside git); one worktree pin per space shared by both panels, carrying machine and folder, shown as a label with repo/branch, picked from `git worktree list --porcelain`, × returns to following the focused pane; a pinned worktree that disappears shows as gone until another pick (B); Tasks' Files/Changes buttons set the pin and open that panel; an open file refreshes when it changes on disk (D); git reads keep the no-lock flags.
- Final shape after round 4: `slots/files-changes-final.md`. Focused check by B, C, D (`slots/files-changes-final-check-{B,C,D}.md`) found, and the final shape now fixes: flat.json `panel` `max: 900` would stop full width (B,D), so it goes; space switch, close and terminal jumps could leave a blank window or wipe per-space memory (B,C,D), so one open/close routine in the tabs clone serves every entry point (buttons, `ctrl-b t`, `ctrl-b f`, Tasks buttons), a space switch restores at side size with the terminal shown, and a jump to a terminal while full shrinks to side size; the ⤢/⤡ toggle sits once in the top bar, not in four mod headers (D); an empty Branch view explains itself (C); a vanished pin shows "worktree is gone" in place of the list (C).

## Round 5 (2026-11-03): look of the new panels

Seat notes: `slots/look-{A,B,C,D}.md`, merged `slots/look-merged.md`, rebuttals `slots/look-rebuttal-{B,C,D}.md`. A presented seven questions, then re-presented them simpler on "elid".

Operator, verbatim: "1b | 2a | 3a - I also need a keyboard shortcut for "Needs you", find the most intuitive one that's not taken | 4a | 5a | 6b - but pick a palette that actually makes sense, not a random one. Do some research on this. It needs to fit the overall Omarchy theme, too (not the colors per se, but saturation, etc) | 7a"

Settled:
- 1b: all four right-panel views (Tasks, Needs you, Files, Changes) use straight edges: no outer radius, no outer border, flat against the bars and dividers of the flat layout; rows inside keep their small rounding. Files and Changes clones change this one thing.
- 2a: a two-seat row shows "<logo>A <logo>B"; logos from herdr's program table via the agents-by-tab helper at 16 px; no match shows the letter only.
- 3a: top bar order ⤢, Tasks, Needs you, Files, Changes; ⤢ sits left of the buttons so they never shift. Needs-you shortcut: A proposes, operator decides (round 5b).
- 4a: in a narrow window the panel buttons fold to icons with hover names and accessible labels.
- 5a: Needs you shows a count when > 0 (colored when any agent is blocked); Tasks shows a small red dot when any row is red.
- 6b: stages get colors, from a researched palette that fits the Omarchy theme's saturation (round 5b).
- 7a: red in the new panels is the theme's own red (`ansi1`); the omarchy hook and the Agents list colors stay as they are.
- Defaults, not contested: same header geometry and text sizes as Files/Changes at both widths; working seat spinner as the Agents list.

### Round 5b (2026-11-03): stage palette and Needs-you key

Seat notes: `slots/look2-{A,B,C,D}.md`, merged `slots/look2-merged.md`, rebuttals `slots/look2-rebuttal-{B,C,D}.md`. A presented two questions with B's merge-cyan view under the challenge check, then re-presented them simpler on "elid".

Operator, verbatim: "1a | 2a |"

Settled:
- 1a: plan blue `ansi4`, implement cyan `ansi6`, check magenta `ansi5` including check.fix and check.repair, merge green `ansi2`; failed red `ansi1`; parked, stopped and paused grey. Yellow `ansi3` stays the slow-merge warning only. B's merge-cyan lost. Research: Atlassian Lozenge, Primer color, Carbon status indicators (red failed, green done, grey inactive); the Omarchy palette's two saturation tiers (soft blue/cyan/magenta/green for stages, loud red/yellow for alarms) (D); matte-black's yellow slot is dark red (D).
- 2a: `ctrl-b y` toggles Needs you, through the same open/close routine as `ctrl-b t`.
- Agreed by all seats, recorded as defaults: colors only from the theme's ANSI slots; a pill is the stage word in `t.foreground` on a ~12% tint of the stage color drawn as a separate fill layer (never element opacity, gpui-kit.d.ts:1389), plus a 6 px dot in the stage color; no colored pill text (fails 4.5:1 in 9-15 of 25 themes; foreground on tint ≥ 5.64:1 in all 25, B); merged rows in Last merges are muted text without a pill (C).
- Probe pending: a screenshot of every pill in sage-terra, miasma and one light theme confirms cyan and green read apart and the tint is visible (C, D).
- Final shape after round 5b: `slots/look-final.md`. Focused check by B, C, D (`slots/look-final-check-{B,C,D}.md`) found, and the final shapes now fix: the pill tint gets its own `t.background` base so selected rows keep contrast (B); a view key over another view switches views, over its own view closes (C); the Needs-you count is a number with a red dot and tint when an agent is blocked (C; C's "not a real block" lost to operator 5a); `knownAgents()` matches `p.key` or `p.run[0]`, with the harness command's first word in `--json` (D); prefix keys and Tasks reach the tabs open/close routine through a `panel.request` shared value, and close returns keyboard focus to the terminal (D, recorded in `files-changes-final.md`).

## Probes (2026-11-03)

- P6 full width, run in a throwaway session `p6probe` (created with `herdrapp --session p6probe`, deleted after; herdr-setup untouched). Commands: `herdr-app do layout.select {stack: panel-body, child: files}`, `layout.show panel`, `layout.hide main`, `layout.resize {id: panel, weight: 1}`; restore `layout.show main`, `layout.hide panel`, `layout.resize {id: panel, px: 368}`. Results:
  - With flat.json as it is, the panel stops at `max: 900` and leaves an empty strip on a 1590 px window (`slots/probes/p6-flat-max900.png`). On a copy without `max`, the panel fills the whole terminal area (`slots/probes/p6-nomax-full.png`). This confirms removing `max: 900`.
  - A terminal printing a tick every second kept counting while `main` was hidden (`hc read`), and after restore.
  - Hidden and size state is saved per layout in the session's `layouts/.state/<layout>.json` and survives closing the window: a window stopped while full reopened full with `main` hidden. After restore the state file is removed (back to the file's defaults). New requirement, added to `slots/files-changes-final.md`: the tabs clone returns to side size with `main` shown when the window starts.
  - Not proven: a fresh screenshot of the restored view. `herdr-app shot` saves the last drawn frame, and a window covered by another fullscreen window stops drawing, so shots go stale; stopping and reattaching the session draws a fresh frame. The restore was confirmed through the state file and `hc read`.
- L2 logos: herdr's program table (embedded in `~/.local/share/herdr-app/herdr-app`) has keys `claude`, `codex`, `pi` with `run` equal to the key, and `antigravity` with `run: ["agy"]`. akrogon's harness keys (`~/.akrogon/config.yaml:23-26`) are `claude`, `codex`, `pi`. Matching `p.key` or `p.run[0]` finds all four. The live `knownAgents()` call is checked when the Tasks mod is built.
- Left for the build, as done-criteria rather than probes: L1 pill screenshots across themes, L3 key toggles and focus, L4 straight edges, P1 status parity fixtures, the reply parser fixtures.
