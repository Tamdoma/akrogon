# Brief: files-panel

## What

Clone herdr-app's shipped `files` mod into `mods/` and point flat.json's `files` block at it. It opens in today's tree view; its header gains one control row: a name filter over the whole repo, a Recent button, and a worktree pin label. A `.md` file opens formatted with a Raw toggle. The panel has straight outer edges.

## Why

Leaf work happens in `~/.akrogon/worktrees/<repo>/<slug>` while door panes sit in the main checkout, and markdown shows as raw code today (operator round 4).

## Done-criteria

1. On first open in a session, the panel matches today's Files view plus the header control row, with no outer radius or border.
2. A `.md` file opens formatted; Raw shows its source and switches back (D: no scroll-position API exists, so none is promised).
3. Typing in the filter lists matching paths from the whole repo, closed folders included, ignored files left out; outside a git repo the filter is hidden.
4. Recent lists uncommitted files first, then files from the last 20 commits that still exist.
5. Picking a worktree from the pin label shows that worktree's files in this space; × returns to following the focused pane; another space is unaffected.
6. When the pinned worktree folder is deleted, the panel shows "<slug> worktree is gone" in place of the tree until × or another pick.
7. An open file re-reads when it changes on disk.

Live checks run in a throwaway session (`herdrapp --session <name>`, with `HERDR_APP_HOME` and `HC_SESSION` pointed at it and `HC_TERMINAL_*`, `HC_SCOPE` unset), deleted afterwards. The worktree's `layouts/flat.json` and changed `mods/*` are linked into that session home directly; `./install` is never run from a worktree, since it relinks the operator's live `~/.config/herdr-app` (D). Sessions with `herdr-app shot` evidence run one after another: every window shares the one display, and a covered window stops drawing, so each shot follows `herdrapp session stop` and `attach` (P6) (D). Screenshots use only the operator's current Omarchy theme, the herdr theme `omarchy`; no other theme is generated or switched to (operator 2026-11-03). A throwaway session's `themes` folder and `settings.json` are symlinks into the operator's real `~/.config/herdr-app`, so a check never writes through them, never runs `app.theme`, and never creates, renames, moves or deletes anything under `~/.config/herdr-app/` (an earlier check renamed `omarchy.json` there and broke the operator's live theme). Path listing and Recent ordering are pure functions over git output, proven by the repo's `test` check against a temporary git repo.
