# Files and Changes: seat A notes

Evidence: better-than-training, shipped mods read 2026-11-03: `~/.config/herdr-app/mods/changes/main.js` (206 lines), `files/main.js` (169), `worktree/main.js` (359); `gpui-kit.d.ts:20709` (`TextView.markdown`).

## 1. Change Files/Changes or add new panels

Pick: clone both into herdr-setup and keep the default view identical to today. Every addition is a control that starts in today's state: Changes opens on "Uncommitted" (today's view), Files opens on the tree (today's view). The only change visible without clicking is one small control row in each header, plus the removed Commit row in Changes (if the operator agrees, Q2). Cost: two clones to keep in step with herdr-app updates (`cloned_from` diffs).
Rejected: new separate panels ("Branch diff", "Review") beside Files and Changes. The button row grows to six and the same file/diff view exists twice.
Rejected: leave Files and Changes untouched and drop A1-A3. F1-F3 stay (leaf work invisible in Changes, Commit sweeps `issues/*.jsonl`).
Pitfall: the operator's "existing interfaces unchanged" lock. Removed by a done-criterion: a shot of each panel on first open matches today's except the header control (and Commit, per Q2).

## 2. Changes: Commit and scopes

Pick: remove the Commit row. It runs `git add -A` then `git commit -m` (changes/main.js:151-158), which takes every agent's edits and akrogon's `issues/*.jsonl` into one commit. Agents commit their own work. Cost: the operator commits in a terminal or through an agent.
Rejected: commit selected files only. Adds checkboxes to every row, a visible change for a rarely used action.
Scopes: a three-way switch in the header, "Uncommitted | Branch | Commits", default Uncommitted. Branch = `git diff <merge-base with default branch>` where the default is `origin/HEAD` (fallback none: show "no default branch" text, never guess `main`). Commits = the last 20 commits of HEAD, click one to see its diff. The switch remembers per space like the panel choice. Cost: three git calls per refresh in Branch scope.
Pitfall: Branch on the main checkout shows nothing (HEAD is the default branch). Text says "on the default branch" instead of an empty list.

## 3. Files: markdown, filter, recent

Pick: `.md` opens formatted (`TextView.markdown`) with a "Raw" toggle in the preview header. A filter box over repo-wide paths from `git ls-files -co --exclude-standard` (tracked and untracked, ignored left out); outside git, filter the loaded entries. No "changed recently" view: Changes' Branch and Commits scopes answer "what changed".
Rejected: filter loaded entries only. The tree is lazy (files/main.js `entries` map), so it would miss everything in closed folders. Rejected: mtime "recent". Build output and logs dominate it.
Probe: `TextView.markdown` renders a real chart file (tables, code blocks) readably at 368 px.

## 4. Worktree picker and open-as-pane

Pick: no picker list in v1. Files and Changes follow the focused pane as today, or a worktree pinned from a Tasks row ("Show changes", round 3 2a). While pinned, a chip "<slug> ×" in the header shows it; × returns to following the pane. Cost: a worktree not open in any pane and not an akrogon leaf needs the shipped worktree dialog (prefix shift-g) or a pane.
Rejected: a picker listing `git worktree list` in each header. One more control for a case Tasks already covers.
Open-as-pane: skip. Dragging the panel divider wider already widens diffs. Probe: confirm the flat layout's panel divider drags (layouts/flat.json `panel` size).
Would ask: does the operator ever use the Commit button?
