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
