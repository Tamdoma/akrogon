# dependency-setup follow-up, slot C

Read the "After rebuttals" and "Concurrency probe" sections of `slots/dependency-setup-merged.md`.

## Pick: (y), one `setup` key that `akrogon config` puts in front of every check, lock included

I accept that 1a as I recommended it is wrong. The probe shows installs running at once in one worktree fail even when nothing changes, so a bare prefix gives red checks with no cause.

Why (y):

- It keeps the one property that made 1a safe: the install runs at the same moment, in the same worktree and on the same commit as the check, whoever runs it. Nobody has to list the moments when a lockfile can change.
- The lock is written once, by akrogon, with the right path. The probe showed the lock removes the failures (three rounds, all exit 0) and that the path must sit under the git dir so the worktree stays clean (`src/phase.ts:225-226`). `git rev-parse --git-path` gives each worktree its own lock, so different leaves do not wait on each other.
- Seats and workers change nothing. They already take their commands from `akrogon config` (`skills/implement-issue/SKILL.md:27,55`).

New: one optional config key (`setup`, `src/config.ts:28-49`), and a few lines where `akrogon config` builds each printed check as lock, setup, then the check. Reused: the `checks` and `merge_checks` lists, every place that runs them, and the existing failure handling for a red check.

Cost: the command a seat runs is longer than the line in the config file. `akrogon config` shows the full command, so it is visible in one place.

## Why not (x)

It is the same behaviour as (y) with no akrogon code, but every repo must copy a long lock-and-install prefix onto every check line. One line with a typo or without the lock brings back the random reds, and nothing reports it. (x) puts the hard part in the place most likely to get it wrong.

## Why not (z)

(z) goes back to a list of moments when akrogon installs, and a missed moment fails without any error because the worktree still borrows the main checkout's packages. The list is already longer than "creation and batch stack":

- After a red batch, the command restores every member to its saved head (`forks/merge-order.md` Taken Q3). The holder's worktree then holds the packages of the batch top, not of its own lockfile, and its solo run would use them.
- A seat still resolves rebase conflicts itself (`skills/merge-issue/SKILL.md:41`), and a conflict can be in the lockfile.
- Seats create detached base checkouts and install there by hand (`skills/implement-issue/SKILL.md:38`, `skills/check-issue/SKILL.md:61`).

(z) also needs more code than (y): the key, at least three call sites, a failure path, and moving worktree creation work outside the global lock (`src/next.ts:338,774`).

## One thing to confirm before handoff

The probe did not capture why the installs failed. The lock stops two installs from running together. It does not stop a real install (lockfile changed) from running while another check in the same worktree is in the middle of a test. That can only happen when a seat changes packages while a check runs, which is the seat's own work. The probe should be repeated once with the composed command from (y): several checks at once in one worktree, all green.
