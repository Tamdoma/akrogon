# Files and Changes: merged notes (A, B, C, D)

## Agreed

- Clone `files` and `changes` into herdr-setup; flat keeps the ids `files` and `changes`; no new panels or buttons for these features (A,B,C,D).
- Each panel opens in today's view: Changes on uncommitted work, Files on the tree (A,B,C,D).
- Remove the Commit message and button (`changes/main.js:151-160`, `git add -A`) (A,B,C,D). Selected-file staging rejected (A,B,C,D).
- Changes "Branch" scope = diff from the merge base with the repo's default branch (from `origin/HEAD`) to HEAD; on the default branch itself it says so instead of an empty list (A,B,C,D).
- `.md` opens formatted (`TextView.markdown`) with a Raw toggle back to today's code view (A,B,C,D).
- File-change time (mtime) rejected for "recent" (A,B,C,D). Path search only, not file contents (A,B,C,D).
- One worktree pin per space shared by Files and Changes; default follows the focused pane as today; a visible "<slug> ×" chip shows the pin and × returns to following (A,B,C,D). Tasks' Files/Changes buttons set that pin (A,B,C,D). A pinned worktree that disappears (leaf merged) clears visibly, never silently (B,C,D).
- Git reads keep the existing no-lock flags (`changes/main.js:14`) (A,B,D).

## Where seats differ

1. Changes scopes.
   - Working | Branch | Commits: last N commits, click one to see its diff; N = 20 (A,B), 15 (D).
   - Working | Branch only; a commit log in 368 px is a second job nobody asked for (C).
   No default branch found: show "no default branch", never guess (A); ask for a base (B); fall back to main then master (C,D).
2. Files filter.
   - Repo-wide paths from `git ls-files -co --exclude-standard`, so it finds files in folders not opened yet (A,B,D).
   - Loaded folders only, keeping the 500/5,000 caps (files/main.js:14) (C).
3. Files "Recent" view.
   - None; Changes' Branch and Commits answer "what changed" (A).
   - A Recent toggle: uncommitted files first, then files from the last 20-30 commits (B,C,D).
4. Worktree picker.
   - Chip only, set from Tasks; no list (A).
   - Chip opens a list from `git worktree list --porcelain` (main first, then linked, akrogon leaf worktrees included) (B,C,D).
5. Open as pane.
   - Skip; drag the panel wider (A,B).
   - A [↗] button opens the file or diff as a mod pane (`pane.split {mod, props}`) pinned to its source (C,D). Cost: it takes terminal space until closed.
6. Smaller extras (one seat each).
   - Empty Working on a branch shows "clean, view branch diff (N files)" (D).
   - An open file refreshes when it changes on disk (D).
   - Changes file list cap 200 px → 260 px (D).
   - A Tasks Files/Changes button also opens the panel (C asks; D selects it).

## Probes named

- P1 the cloned panels at 368 px and wider, today's behavior intact (B,C,D).
- P2 git fixtures for every scope: dirty, clean branch, detached, non-main default, root and merge commits, renames, binary (B).
- P3 `TextView.markdown` on a real chart file (tables, code, links) at 368 px (A,B,C).
- P4 Tasks → pin → both panels, with focus changes and a deleted worktree (B); `setShared` re-renders the other mod live (C).
- P5 `pane.split {mod, props}` keeps its pinned source (C, if 5 is taken).
