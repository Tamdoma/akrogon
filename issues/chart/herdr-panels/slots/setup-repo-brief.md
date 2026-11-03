# Focused check: herdr-setup repo (round 1 final shape)

You are a consultant seat (letter in the one-line prompt). Edit no file except your return file. Do not contact the operator. Run no command that changes anything; read-only commands are fine.

## What the operator decided (verbatim, 2026-11-03)

- "Yes, and it needs to be turned into a repo. I've created the remote repo so it needs to be connected to it: https://github.com/Tamdoma/herdr-setup.git. Also, we need to make sure that all of the customizations I've done so far on herdr-app for myself are also there, not just the layout itself. Is that doable and according to herdr-app conventions, and if not, what's the best architecture?"
- "go, but consult with consultants first. | 2 - 2a"

Settled context is in /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md, section "Round 1".

## Proposed final shape (A will execute this after your checks)

Source today: /home/ivan/Work/omarchy-customizations/herdr-app/ (apply-herdr-app-theme, herdrapp, keys.json, layouts/flat.json, layouts/board.json, mods/{agents-by-tab,board,prefix,session-status,tab-left,tab-right}, README.md, settings.json), 13 commits touching it. Installed today by /home/ivan/Work/omarchy-customizations/install.sh:294-328 by copying into ~/.config/herdr-app. Live copies match the source byte for byte (checked 2026-11-03). Session homes ~/.config/herdr-app-sessions/<name>/ link personal paths to ~/.config/herdr-app (herdrapp `personal_paths`, `open_session`).

Target layout, /home/ivan/Work/infra/herdr-setup (new, remote empty):

```
layouts/flat.json, layouts/board.json
mods/<the six mods>/
keys.json
settings.json            template, copied (not linked)
bin/herdrapp
omarchy/apply-herdr-app-theme
install                  idempotent
README.md                from herdr-app/README.md, paths updated
.gitignore               jsconfig.json, *.d.ts (herdr-app writes these into mod folders)
```

Steps:
1. In omarchy-customizations: `git subtree split --prefix=herdr-app -b herdr-setup-split` (history of the 13 commits, files at root).
2. `git init` /home/ivan/Work/infra/herdr-setup, pull that branch, `git mv herdrapp bin/herdrapp`, `git mv apply-herdr-app-theme omarchy/apply-herdr-app-theme`, add `install`, `.gitignore`, README edits. Add remote origin https://github.com/Tamdoma/herdr-setup.git. No push until the operator says so.
3. `install` does: install herdr-app if missing (same curl line as today); link `~/.config/herdr-app/mods/<name>` -> repo `mods/<name>` for each mod; link `~/.config/herdr-app/layouts/<name>.json` -> repo for each layout; link `keys.json`; copy `settings.json` only when absent (herdr-app and the settings screen write it; the Omarchy installer sets font keys in it); link `~/.local/bin/herdrapp` -> `bin/herdrapp`; `omarchy hook install theme-set <repo>/omarchy/apply-herdr-app-theme` and run it once when `omarchy` exists. Existing real files/dirs at a link target are backed up first. Does not switch the layout (today's installer forces `board` while the operator runs `flat`).
4. omarchy-customizations: delete `herdr-app/`; replace install.sh's Herdr app block with: clone https://github.com/Tamdoma/herdr-setup.git to ~/Work/infra/herdr-setup if missing, run its `install`, then the existing font jq edit on ~/.config/herdr-app/settings.json. Update README.md:143-144 and GUIDE.md:407 to point at herdr-setup. hypr/terminal-opacity.lua and hypr/bindings.lua stay (Hyprland loads them). Commit there.
5. Verify: `herdr-app check` on every mod; `herdr-app status` shows no errors; each session home's links resolve; a write probe: `herdr-app do app.zoom_in` then `app.zoom_reset`, then confirm keys.json and layout links are still links (does herdr-app replace a linked file when it writes?).

## Your task

One focused check of this shape as the person who will live with it. Return only: wrong steps, missing customizations, convention violations (cite /home/ivan/.config/herdr-app/AGENTS.md by section), risks the shape does not remove, each with evidence (path:line or command output, date). If none, write exactly "No disagreement." Keep it short.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/setup-repo-check-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/setup-repo-check-<YOUR LETTER>.md"
