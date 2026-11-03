# Brief: spaces-scroll

## What

In `layouts/flat.json`, the sidebar's `spaces` block gets a fixed height of about five rows and the `agents` block takes the rest. The Spaces and Agents rows themselves do not change.

## Why

The operator uses many spaces and the Spaces block takes half the sidebar (operator message 2, round 2 A8).

## Done-criteria

1. In a throwaway session with eight spaces, the Spaces list shows about five rows and scrolls to the rest, and the Agents list fills the remaining height.
2. Space rows, logos and names look as before.

Live checks run in a throwaway session (`herdrapp --session <name>`, with `HERDR_APP_HOME` and `HC_SESSION` pointed at it and `HC_TERMINAL_*`, `HC_SCOPE` unset), deleted afterwards. The worktree's `layouts/flat.json` and changed `mods/*` are linked into that session home directly; `./install` is never run from a worktree, since it relinks the operator's live `~/.config/herdr-app` (D). Sessions with `herdr-app shot` evidence run one after another: every window shares the one display, and a covered window stops drawing, so each shot follows `herdrapp session stop` and `attach` (P6) (D). Theme screenshots never change the operator's Omarchy theme: each theme's herdr theme file is generated into the throwaway session home by running herdr-setup's `omarchy/apply-herdr-app-theme` with `XDG_STATE_HOME` pointed at a temporary folder holding that theme's files under `omarchy/current/theme` and `HERDR_APP_HOME` at the session home (A).
