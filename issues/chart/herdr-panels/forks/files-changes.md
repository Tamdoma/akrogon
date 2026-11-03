# Files and Changes (A1-A3)

## Question

Q1 clone or new panels; Q2 the Commit button; Q3 Changes views; Q4 Files Recent; Q5 open-as-pane.

### Carries

Existing interfaces stay as they are (round 2). New features live in the right panel.

## Findings

Seat notes `slots/files-changes-{A,B,C,D}.md`, merged `slots/files-changes-merged.md`, final shape `slots/files-changes-final.md`, focused checks `slots/files-changes-final-check-{B,C,D}.md`.

## Taken

Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

- 1a: Files and Changes are cloned into herdr-setup (ids `files`, `changes`). Each opens in today's view; additions are one header control row.
- 2a: the Commit message and button are removed from Changes.
- 3a: Changes views Working (default) | Branch (merge base with the default branch: `origin/HEAD`, else `main`, else `master`, shown) | Commits (last 20; click shows that commit's files and diff; merges against the first parent, root against the empty tree). Empty Working on a branch offers "view Branch diff (N files)"; an empty Branch says "nothing on this branch beyond <base>".
- 4a: Files gets a Recent button beside the filter: uncommitted files first, then files from the last 20 commits that still exist.
- 5a: no open-as-pane button.
- Defaults agreed by all seats: formatted markdown with Raw; repo-wide name filter (`git ls-files -co --exclude-standard`, hidden outside git); one worktree pin per space shared by both panels, {machine, folder}, label with repo (branch), list from `git worktree list --porcelain`, × follows the focused pane again; a vanished pin shows "<slug> worktree is gone" until × or another pick; an open file re-reads when it changes on disk; git reads keep the no-lock flags.
