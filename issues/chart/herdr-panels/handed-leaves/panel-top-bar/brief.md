# Brief: panel-top-bar

## What

Clone herdr-app's shipped `tabs` mod into `mods/` and point `layouts/flat.json`'s `tabs` block at it. Its top bar shows, left of the panel buttons, a ⤢/⤡ button while the panel is open, then Tasks, Needs you, Files, Changes. It owns the one open/close routine every entry point uses (its buttons, `ctrl-b t`, `ctrl-b y`, `ctrl-b f`, and the `panel.request` shared value other mods set), the `ctrl-b t` and `ctrl-b y` keys in `mods/prefix`, the removal of `max: 900` from flat.json's `panel`, a `tasks` block in flat.json's `panel-body`, and seeding `workspace.panels` in `bin/herdrapp` and `install`. It shows a Needs-you count and a Tasks red dot.

## Why

Every new right-panel view must open filling the terminal area, close back to the terminal, and be reachable by key (operator rounds 4 and 5). The shipped tabs mod hardcodes Files and Changes and opens at 368 px.

## Done-criteria

1. In a throwaway session on flat, clicking Files opens the panel filling the whole terminal area on a window wider than 1168 logical px (`main` hidden, no 900 px cap), with the left sidebar unchanged; clicking Files again closes it and the terminal shows with keyboard focus in the pane that had it.
2. While the panel is open, ⤡ shrinks it to 368 px with the terminal shown and ⤢ returns it to full; closing and opening again starts full.
3. For views whose mod is present (a placeholder mod folder in the throwaway session counts), `ctrl-b t`, `ctrl-b y` and a `panel.request` `toggle` close the panel when their view shows and switch to their view, keeping the current size, when another view shows; `ctrl-b f` and `open` never close. Closing from a reply box returns keyboard focus to the terminal. (D)
4. A view whose block names a mod that is neither shipped (listed in the session's `installed.json`) nor present in the session's `mods/` has no button and its key does nothing, and `herdr-app status` shows no error; shipped Files and Changes always count as present (D).
5. Switching spaces while full shows `main`, puts the panel at side size and restores that space's remembered panel or none; each space's remembered panel from before this leaf is kept, read once from the shipped tabs mod's store (B,D).
6. A window stopped while the panel is full reopens with `main` shown and the panel at side size.
7. Focusing a terminal while the panel is full (sidebar agent click, tab click) returns the panel to side size so the terminal shows.
8. After `./install`, the main window's and every existing session's `shared.json` `workspace.panels` hold `tasks`, `needs-you`, `files`, `changes`; a session created afterwards with `herdrapp --session` holds them too (C).
9. In a window too narrow for the labels, the panel buttons show icons only, each with its name on hover and as its accessible label (B).
10. The Needs-you button shows a count when terminals are `blocked` or top-level `done`, red (`ansi1`) when any is `blocked`. The Tasks button shows a red (`ansi1`) dot when an `akrogon status --json` envelope reports `red` > 0, and no dot and no error when `akrogon` is missing or exits without an envelope (today's installed release rejects `--json`) (B,C).
11. Screenshots of the count and the dot on the top bar in the operator's current Omarchy theme (herdr theme `omarchy`) show them readable (B).

Live checks run in a throwaway session (`herdrapp --session <name>`, with `HERDR_APP_HOME` and `HC_SESSION` pointed at it and `HC_TERMINAL_*`, `HC_SCOPE` unset), deleted afterwards. The worktree's `layouts/flat.json` and changed `mods/*` are linked into that session home directly; `./install` is never run from a worktree, since it relinks the operator's live `~/.config/herdr-app` (D). Sessions with `herdr-app shot` evidence run one after another: every window shares the one display, and a covered window stops drawing, so each shot follows `herdrapp session stop` and `attach` (P6) (D). Screenshots use only the operator's current Omarchy theme, the herdr theme `omarchy`; no other theme is generated or switched to (operator 2026-11-03). A throwaway session's `themes` folder and `settings.json` are symlinks into the operator's real `~/.config/herdr-app`, so a check never writes through them, never runs `app.theme`, and never creates, renames, moves or deletes anything under `~/.config/herdr-app/` (an earlier check renamed `omarchy.json` there and broke the operator's live theme). The routine's decision (state and request in, layout commands out) and the dot's envelope reading (hand-written envelopes with and without `red`) are pure modules proven by the repo's `test` check. The dot against a real `akrogon status --json` waits for akrogon leaf `status-json` to land and deploy; that end-to-end look is the chart's pending check, not this leaf's criterion (B,C).
