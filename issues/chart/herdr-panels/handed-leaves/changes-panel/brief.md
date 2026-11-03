# Brief: changes-panel

## What

Clone herdr-app's shipped `changes` mod into `mods/` and point flat.json's `changes` block at it. The Commit message and button go. A header switch shows Working (default, today's view) | Branch | Commits, plus the worktree pin label shared with Files. Straight outer edges.

## Why

Agents commit their own work, so Changes shows nothing for a leaf, and Commit runs `git add -A` then `git commit`, sweeping akrogon's `issues/*.jsonl` and other agents' edits (operator round 4).

## Done-criteria

1. On first open the panel matches today's Changes Working view without the Commit row, plus the header switch, with no outer radius or border.
2. Branch shows the diff from the merge base with `origin/HEAD` (else `main`, else `master`) to HEAD, naming the base in the header; on a branch with nothing beyond the base it says "nothing on this branch beyond <base>".
3. Commits lists the last 20 commits; clicking one shows its files and diff, a merge against its first parent and the root commit against the empty tree.
4. An empty Working view on a branch with commits offers "view Branch diff (N files)", and clicking it opens Branch.
5. The worktree pin behaves as in Files: picking a worktree shows its changes in this space, × follows the focused pane again, a deleted pinned worktree shows "<slug> worktree is gone".

Live checks run in a throwaway session (`herdrapp --session <name>`, with `HERDR_APP_HOME` and `HC_SESSION` pointed at it and `HC_TERMINAL_*`, `HC_SCOPE` unset), deleted afterwards. The worktree's `layouts/flat.json` and changed `mods/*` are linked into that session home directly; `./install` is never run from a worktree, since it relinks the operator's live `~/.config/herdr-app` (D). Sessions with `herdr-app shot` evidence run one after another: every window shares the one display, and a covered window stops drawing, so each shot follows `herdrapp session stop` and `attach` (P6) (D). Screenshots use only the operator's current Omarchy theme, the herdr theme `omarchy`; no other theme is generated or switched to (operator 2026-11-03). A throwaway session's `themes` folder and `settings.json` are symlinks into the operator's real `~/.config/herdr-app`, so a check never writes through them, never runs `app.theme`, and never creates, renames, moves or deletes anything under `~/.config/herdr-app/` (an earlier check renamed `omarchy.json` there and broke the operator's live theme). Base resolution and commit-list parsing are pure functions over git output, proven by the repo's `test` check against temporary git repos (merge, root and empty-branch cases).
