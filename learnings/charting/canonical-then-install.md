# Edit the canonical skill, then install

## What was not good
Three copies of the chart skill exist, one per harness root, plus the canonical one in `skills/chart-issues`. Editing an installed copy is lost on the next install and leaves the partner harness on the old text.

## What the updated way does
Change the canonical asset in this repo, run `bash skills/chart-issues/scripts/install.sh`, verify with `diff -q` against the Claude and Codex roots.

## Why
The installer replaces the copies wholesale. Only the canonical folder is tracked in git.

## How it gets improved
If a second skill gains the same three-root install, one installer should serve both. Until then, one script per skill.

Update 2026-09-08: the three skill roots are now symlinks to the canonical folder, so an edit is live at once and the copy step is obsolete. The installer's error on a symlinked root is harmless.
