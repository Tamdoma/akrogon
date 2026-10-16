# Brief: release-rollback

## What
`akrogon rollback` points `~/.akrogon/current` at the previous release, restores that release's links and writes the hold record so later deploys skip the rolled-back commit until main moves to a newer commit, which then deploys normally. Consumes release-deploy's releases, `current` link, previous-release record, link step and hold reader.

## Why
A merged change can break the installed command, including its own deploy. Today the only way back is a hand-made git operation in the workspace checkout.

## Done-criteria
1. `akrogon rollback` switches `current` to the previous release by renaming a temporary link and prints the old and new commit.
2. After a rollback, an `akrogon next` pass with main still at the rolled-back commit does not redeploy it and prints that it is held; once main moves to a newer commit, that commit deploys and the hold ends.
3. Rollback works when the current release cannot start: README names manual steps that need no akrogon code from the current release (flip `current` to the previous release by renaming a temporary link, write the hold record, run the previous release's `install` to restore its links), and following them gives the same end state as `akrogon rollback`. (B,C)
4. With no previous release, `akrogon rollback` exits non-zero naming why and changes nothing.
5. With a state home `config.yaml` carrying a key the running release's schema rejects, the command exits non-zero with an error naming that file and the rejected key, and changes no state. (C)
6. After rollback the skill links match the previous release: a skill the bad release added has no dangling link and a skill it removed is linked again, through release-deploy's link step; a failed link step leaves `current` on the previous release and is printed. (B)
