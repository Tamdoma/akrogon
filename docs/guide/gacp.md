# gacp

A tiny shell function for pushing issue edits. Stage this directory, commit the whole staged index on main, rebase, push. That's it. I use it after hand-editing issues/ when I don't want sync strictness.

Prerequisites: git checkout on main, remote named origin with main. Which directory you're in: the repo checkout where you edited issues/ — for us, ~/Work/widgets. gacp stages the current subtree, not the whole repo, so cd where you mean it.

## The function

Paste this into ~/.bashrc, then run source ~/.bashrc. The outer parens make it a subshell, so set -e and exit never touch your interactive shell. That bit matters — without the subshell, a failed gacp could close your shell. With it, it just returns non-zero.

```bash
gacp() (
set -euo pipefail
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "gacp: on '$branch', not main. Finish or abort the rebase first: git rebase --continue / git rebase --abort" >&2
  exit 1
fi
git add .
git diff --cached --quiet || git commit -m "${1:-add issues}"
if ! git pull --rebase --autostash origin main; then
  conflicts="$(git diff --name-only --diff-filter=U)"
  git rebase --abort
  echo "gacp: conflict, rebase aborted, checkout unchanged. Files:" >&2
  echo "$conflicts" >&2
  echo "Resolve by hand: git pull --rebase --autostash origin main, fix the files, git add -A && GIT_EDITOR=true git rebase --continue && gacp" >&2
  exit 1
fi
git push origin main
)
```

To install: copy the block above into the end of ~/.bashrc, save, then source ~/.bashrc in every open shell. Test with type gacp — it should print the function, not command not found.

## Beginner walkthrough, line by line

set -euo pipefail means fail fast. Any command fails, undefined variable, or broken pipe kills the function right there. You want that. Silent half-pushes are worse than loud stops.

branch gets the current branch name. If you're not on main, it stops and tells you to finish or abort the rebase first. Why main only? Because issue files live on main in the registered checkout. Pushing them from a leaf branch would mix code and issues, which the phase command forbids anyway.

git add . stages the current directory subtree. Not the whole repo — the folder you're in plus below. If you're in ~/Work/widgets/issues/open/export-csv, it stages that. If you're in ~/Work/widgets, it stages everything under it that's not ignored. I usually run it from the repo root so I don't miss a file. Heads up: this stages whatever is there, including unrelated edits if you left them lying around. That's the difference from sync, see below.

git diff --cached --quiet checks if anything is staged. If yes, commit with your message or add issues by default. So gacp means commit message add issues, gacp my message means commit my message. The commit includes everything staged, not just issues/ — again, looser than sync.

git pull --rebase --autostash origin main fetches and replays your commit on top of the remote. Autostash stashes unrelated unstaged edits, reapplies after. If the rebase works, git push origin main pushes. Done.

If the pull fails: it grabs the conflicting file list, aborts the rebase, prints checkout unchanged plus the files, and prints the manual fix line. Here is the honest bit — checkout unchanged is not a full rollback. Your commit already exists locally before the pull ran. The rebase abort undoes the replay, not the commit. Your work is safe, but it's committed, not uncommitted. To truly undo, you would reset soft after. The script doesn't do that for you, and that's fine as long as you know.

What you should see on success: nothing much, maybe rebase lines and push output. On conflict: gacp conflict, rebase aborted, checkout unchanged, plus file list and the resolve-by-hand line. What to do when it fails: follow that line — pull rebase by hand, fix files, add, continue with GIT_EDITOR=true so it doesn't open an editor, then gacp again.

## When to use gacp vs akrogon sync

Use akrogon sync when you want strict and safe: it commits only eligible issue records — issues/ minus seeds, locks, worktrees — and refuses the wrong branch and any staged paths outside them. If you left half-done code staged, sync stops and tells you. That's what you want most days.

Use gacp after editing issues/ when you want quick and loose: stage this directory, commit the whole staged index on main, rebase, push. It doesn't check eligibility. It will happily commit whatever you staged. That's handy for a fast issues push, dangerous if your checkout is messy. My rule: clean checkout, gacp is fine. Messy checkout, sync saves me from myself.

Concrete use: you just hand-wrote issues/open/export-csv/export-csv/brief.md and state.yaml in ~/Work/widgets. You cd ~/Work/widgets, run gacp add export-csv leaf. It stages, commits, rebases, pushes. Then akrogon next export-csv picks it up. Or run akrogon sync instead if you have other edits lying around — sync will refuse rather than sweep them in.

Previous: [Files](files.md) · Next: [Merge](merge.md) · [Home](../../README.md)
