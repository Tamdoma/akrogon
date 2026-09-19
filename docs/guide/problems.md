# Problems

What you see, what it means, what to do. Keep this open in a tab. You'll need it at 11pm once, and then you'll memorise the top three. Prerequisites: installed, repo set up. Which directory you're in: the registered checkout for sync and phase moves, anywhere for status and next with a slug. The command to see is usually akrogon status or akrogon next export-csv, then fix per row below.

Startup dialog in a pane. Means the agent is blocked on a prompt only a human can answer. Do: answer it. The hook continues. No attempt is counted. Blocked is free.

Attempts climbing to 2. Means the prompt did not take, twice — failed deliveries, not successful prompts. Do: look at the pane. Check herdr plugin log. After three consecutive failures the leaf fails with cause attempts. One more miss and it's failed, so look now, not later.

Phase failed. Means three fix rounds exhausted, or three prompt failures, or a seat declared a stop it could not clear. Do: read the reviews, fix the brief if the brief was the problem, then akrogon phase <slug> <phase> to any active phase — synthesis, implement, review, fix, merge, wherever it should resume. Not just implement. The command clears attempts and fix_rounds. Seats stop like this when they hit operator-only blockers: missing env values, permissions they can't grant. They write the blocker and exact action into the review or report, then fail with reason. Read that file first.

Leaf never starts. Means a blocker is not merged, it's hand-built, or every seat is taken. Do: akrogon next <slug> prints the exact reason. For us, akrogon next export-csv. It will say dependencies not merged, hand-built can't be dispatched, or nothing because no seat. No seat means max_active full — wait or raise it.

Push rejected at merge. Means another leaf landed first. Do: nothing. A fetches, rebases, retries fast-forward only. This is normal with parallel leaves. Only worry if it loops forever, which I've never seen.

Merge conflict. Means two leaves touched the same lines. Do: nothing. A resolves it in the merge, records the resolution in review-A.md and reruns the checks. Only a red check sends it to check.fix. I used to jump in. Don't. Let A do it.

Transition refused. Means the agent called phase twice. Do: nothing. The first call worked, the second was correctly rejected because the slot already reported. If you see this a lot, the skill is being keen, not broken.

Issue files on leaf branch. Means B committed something under issues/ on the branch. Do: B removes it from the branch and writes it in the checkout instead. The skill text tells it so. If you did it by hand in the worktree, move the file to the registered checkout yourself. The branch must stay code-only.

Uncommitted work in worktree. Means B tried to hand off with a dirty worktree. Do: B commits. The rule exists because two leaves once passed review with all work uncommitted, and the cleanup deleted it. Real story. Commit before phase, always.

Rebase conflicts on akrogon sync. Means your checkout and the remote both changed the same file. Do: resolve, then git add -A and GIT_EDITOR=true git rebase --continue and git push. With the code-only rule this should no longer happen for issue files, but it can still happen if two checkouts edit the same issue file. I sync often to avoid it.

Broadcast did not arrive. Means the webhook env is missing, or the merge pane closed before sending. Do: check ~/.config/akrogon/env for the names in broadcast.discord.webhook_env. Send by hand with the sender script from the skill folder, using the issue briefs, if you care. The merge is still done.

A lingering tab or worktree after merge. Means the startup sweep has not run yet, or the merge died before cleanup. Do: akrogon next --all, or restart Herdr. Or close by hand. Harmless either way.

Unrelated worktree. Means a folder at the worktree path belongs to a different repo — git common dir mismatch. Do: remove it by hand. A worktree parked mid-rebase is fine and is dispatched normally, so don't nuke those. Only the unrelated ones.

One JSON line naming a repo, count and paths. Means leaves stored under a different repo key, e.g. inherited from another repo. Foreign leaves. Do: nothing automatic — they are never dispatched, cleaned or counted; move or fix them by hand. Check the stored repo value vs the registered key. Usually a copy-paste with the wrong repo line. I've done that moving export-csv out of widgets between toys.

Previous: [Limits](limits.md) · Next: [Learn](learn.md) · [Home](../../README.md)
