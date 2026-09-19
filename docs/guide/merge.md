# Merge

How work lands, and how the team hears about it. A merges, then A tells everyone. One actor, end to end. I like that — no handoff to lose the plot.

What it's: the merge phase plus the broadcast. Why it exists: reviewed code still needs to land cleanly on main and the team still needs to know. How it works: the merge-issue skill in seat A, in the leaf worktree, finishing with akrogon phase merged. The files that make it so are the branch itself and review-A.md where A records what happened.

A doesn't merge into your checkout. It fetches, rebases the leaf branch on origin/main, runs every check, and pushes the branch as the new main fast-forward only. If two leaves finish at once, git rejects the second push, A fetches, rebases again and retries. If the rebase conflicts, A resolves it, records it in review-A.md and reruns the checks; only a red check goes to check.fix, and the repair is re-reviewed. Other push errors are reported with cause, not retried as competing merges.

After the push, A runs akrogon phase export-csv merged --slot A. If that was the last leaf of the issue, the command prints issue complete, moves the folder to issues/closed/, and closes any linked GitHub issues. A then sends the broadcast itself, in the same session, and closes its own tab as its very last act. The worktree and branch wait for the next hand-typed next or startup sweep to be removed.

Concrete use: export-csv passed review with nits. A rebases export-csv onto origin/main, runs format, test, typecheck, pushes. Push succeeds. A runs phase merged, sees issue complete, sends the broadcast below, closes the tab. You run akrogon sync in ~/Work/widgets to pull the issue files closed. Done. The feature is on main.

## The broadcast

One message per issue, not per leaf. Two sections: before, now. Written for every team member, not just developers. No jargon, no file names, no command names. The repo name always comes first in the title. Split into several Discord posts at section boundaries if long — 2000 chars per message max — never shortened to fit.

For export-csv it might look like:

    widgets: Export widgets to CSV in one command (09/11/26)

    Before
    - Getting widget data out meant copy-pasting from the UI or writing a one-off script.
    - Large lists were slow to move and easy to mess up.

    Now
    - widgets export --format csv prints id,name,price rows to stdout with a header.
    - The existing JSON export still works the same.

Small issue, short bullets. A big issue gets more, parts merged when that reads better, no shipped outcome dropped. Targets are the names listed under broadcast.discord.webhook_env, values live only in ~/.config/akrogon/env. Only the merge slot sends, never a subagent or another model — the tab closes as soon as this pane goes idle after merged, so anything handed off could be cut short.

A failed broadcast is visible in the pane but doesn't reopen the issue. The merge is already done. Check the env file, send by hand with the sender script from the skill folder if you care. I've had one fail because I renamed the webhook var and forgot the env. The code was still merged. Just noisy.

Previous: [gacp](gacp.md) · Next: [In practice](in-practice.md) · [Home](../../README.md)
