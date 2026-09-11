# Brief: pull-close

Chart skill version: 4

## What

Add `akrogon pull` (current registered repo) and `akrogon pull --all` (every registered repo): list the repo's open GitHub issues through `gh` using the checkout's origin and mirror them by number into `issues/seeds/<number>-<slug>.md`, exactly one file per number: after a complete successful listing, a file whose number is absent is deleted (closed issue) and a file whose slug no longer matches is renamed (retitled issue), and a listing that fails deletes nothing; a non-GitHub or missing origin is a visible failure, and `--all` continues with the other repos and exits non-zero naming the failed ones. Add the GitHub close inside the `merged` transition, under the issue lock, in the same step as the move to `issues/closed/`: for every `sources` entry in every leaf state under the moved folder (a leaf without the key contributes nothing), run `gh issue close -R owner/repo n --comment "merged <commit>"` where the commit is the merged head of the leaf whose transition moved the folder, checking the issue state first, one retry, failure printed, never reversing the move. Add `akrogon pull --all` to the plugin's startup hook declaration before `next --all`.

## Why

Colleagues' reports live on GitHub; the operator wants them on disk to chart from and closed without a hand (# GitHub Intake, handoff 3-A).

## Done-criteria

1. `akrogon pull` on a substituted listing writes one seed file per open issue, deletes the file of an issue absent from the listing, renames the file of a retitled issue so one file per number remains, and a listing that fails part-way deletes nothing (test).
2. `akrogon pull` in a repo whose origin is not GitHub exits non-zero with the reason; `--all` with one such repo still mirrors the others and exits non-zero naming it (test).
3. The `merged` transition that moves a folder to `issues/closed/` closes every source under it, inside the issue lock, with the merged commit in the comment, skips an issue already closed, retries once, and prints a failure without undoing the move (test with gh substituted, fixture with an issue-owned and an epic-owned source and one leaf without `sources`).
4. The plugin's startup declaration lists `akrogon pull --all` before `akrogon next --all` (file-shape test).
