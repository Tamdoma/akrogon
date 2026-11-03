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
