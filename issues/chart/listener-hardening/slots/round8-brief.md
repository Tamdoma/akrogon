# Round 8 (door A): link hints in the herdr-app window, and the best key

Operator, verbatim: "Can we use the ctrl + shift + l to actually open the links (relative and absolute all of them) with letters? Look at how I did it with foot" and then "it's fine, consult with others, find me the best key to do it."

Operator accepted: letters shown in a popup list (one line per link, `a  src/next.ts:12`), since herdr-app mods cannot draw over terminal text.

## Facts (verify)
- Foot: `~/.config/foot/open-path.ini` binds `regex-launch=[paths] Control+Shift+p` with one regex for URLs and absolute/relative/~ paths with `:line:col`; launch `~/.local/bin/foot-open-path` (URL -> xdg-open, file -> `code --goto`, relative resolved against foreground cwd).
- herdr-app: live config `$HERDR_APP_HOME/keys.json` is a link to `/home/ivan/Work/infra/herdr-setup/keys.json`. `ctrl-shift-l` is taken by `layout.switch`; `ctrl-shift-k` opens `mod.open:picker`. AGENTS.md and `herdr.d.ts`, `gpui-kit.d.ts` in `$HERDR_APP_HOME` (`/home/ivan/.config/herdr-app-sessions/infra`) document mods, `openOverlay`, `exec`, `hc`, `on_key_down`. The shipped `mods/picker/main.js` is a working keyboard popup pattern.
- Plan: a herdr-setup mod `link-hints` opened by one key: read the focused terminal's visible screen (hc read or the mod API), match with foot's regex, list matches with home-row letters, a letter opens it (URL -> xdg-open, file -> `code --goto`, relative against the focused pane's cwd, missing file -> visible error), Esc closes.

## Questions, answer each
1. The best key. Requirements: not used by herdr-app (`keys.json` global and pane sections, `herdr-app commands`/`keys()`), not stolen from programs the operator runs in panes (Claude Code, Codex, pi, bash/readline, vim/less), works on the operator's keyboard layout (check `~/.config/hypr` input settings: layout, variant), no Hyprland/omarchy binding conflict (`~/.config/hypr/bindings.lua` and omarchy defaults), memorable given foot's Ctrl+Shift+P habit and the operator's ask for Ctrl+Shift+L. Give one recommendation plus one runner-up, and what moves if it needs a key that is taken (e.g. `layout.switch`).
2. Any flaw in the plan above that would make it fail or surprise (how a mod gets the focused terminal's text and cwd, wrapped lines splitting a path, alternate-screen apps like Claude Code, scrollback vs visible screen, remote-machine panes). Point to the doc or code line.

Read-only: do not edit files, press keys in the window or touch the operator's terminals. Write `round8-<letter>.md`, short. Reply with the path.

## Operator addition
Operator, verbatim: "Also, I don't want to be changing the layout at all, so you can overwrite that." So `layout.switch` can be removed and `ctrl-shift-l` is free to take. Question 1 becomes: is Ctrl+Shift+L safe (no conflict with pane programs, Hyprland/omarchy, keyboard layout)? If yes, say so; only propose another key if you find a concrete conflict.
