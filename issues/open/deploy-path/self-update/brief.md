# Brief: self-update

## What
Landed akrogon work reaches the running command, skills and dependencies without a manual `git pull`. One self-update step runs only for the repo whose root is the command's own checkout (realpath(repo.root) == realpath(toolRoot)). It fetches the default branch, fast-forwards the root with `git merge --ff-only` when the root is on the default branch and strictly behind, then on every run runs `bun install --frozen-lockfile` and reconciles skill links. It prints one line and never throws: `deployed <old>..<new>` after a fast-forward, `current <sha>` when already up to date and install and links succeeded, otherwise the failure line. (A,C)

Triggers: the merge wake after `akrogon phase` for the akrogon repo when the committed move lands at `merged` (before the pause check; the phase result carries the committed phase so the caller can tell) (A,B,C), and `akrogon next --resume`, `next --all` and a manual `next` whose selected repos include akrogon. `akrogon next` prints one line when the root is still behind after its fetch.

`docs/guide/install.md:37-41` ("Update it with: git pull") is replaced with how landed work now deploys itself and when the operator still acts.

## Why
The root checkout is the installed program (src/install.ts:15-22). Nothing updates it after a merge, so landed fixes stay inert until the operator pulls. On 2026-10-10 the root was 52 commits behind while framework ran the 10-07 command. The same lag was recorded 2026-09-27 (learnings/LESSONS.md:18) with no guard.

## Done-criteria
1. A root checkout behind its remote, holding an unrelated uncommitted edit, is fast-forwarded by an akrogon merge landing; the edit is kept and the step prints `deployed <old>..<new>`.
2. When an uncommitted edit overlaps an incoming change, the step changes nothing and prints the failing step, the git error, the lag count and the remedy.
3. A root on another branch, a detached HEAD, or a root ahead of or diverged from the remote is left untouched and reported, with `akrogon sync` named as the remedy when ahead or diverged.
4. A failed `bun install` or link step is reported and runs again at the next trigger.
5. A merge landing in a consumer repo never runs the step.
6. A skill folder added on the remote gets its links after the step, and a link to a removed skill folder is removed. A conflicting destination is printed, not thrown.
7. The merge result and the `next` result are unchanged when the step fails.
8. `akrogon next` prints one line when it leaves the root behind.
9. docs/guide/install.md describes the self-update and no longer tells the operator to `git pull`.
