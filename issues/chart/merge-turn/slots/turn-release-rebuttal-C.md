# turn-release rebuttal, slot C

Read `slots/turn-release-merged.md`, `turn-release-A.md` and `turn-release-B.md`. One disagreement. Q1 and Q3 stand as merged.

## Q2 · A's zombie-publisher check does not close the gap

A's proposal: the pre-push check also refuses when the holder is not in `merge`, "checked under the lock right before the push". The direction is right. The gap stays open, because the check and the push are two separate steps run by the seat. The seat runs `akrogon phase <slug> merged --slot B --check` (`skills/merge-issue/SKILL.md:47`), the command returns and drops the lock (`src/phase.ts:330-334`), and then the seat runs `git push` on its own (`SKILL.md:49`). The lock covers the first step only.

The order that breaks it:

1. The old holder's seat passes the check, then stalls before its push.
2. The operator moves it to `failed`. Cleanup sees the top is not on main, restores every member and clears the record. The next holder is prompted and starts a 35-minute run.
3. The old seat wakes and pushes the old top. Main has not moved, so the fast-forward-only push succeeds.

Result: the old batch's code is on main. Its members were restored to their old heads, so the existing test for "already landed" (`git merge-base --is-ancestor`, `SKILL.md:49`) says no for each of them. The new batch then rebuilds on top of commits that already contain its own changes. No untested code lands, since the old top was green. But the record no longer matches main, and a person has to sort it out. The window is as long as the next run, about 35 minutes.

What removes the class: the command does the push itself, in the same locked step as the check. Under the lock it confirms the holder and every member are still in `merge` and pushes the recorded top. A seat never runs `git push` for a batch. A late seat can then only call the command, and the command refuses it. Cost: the global lock is held during one network push, which takes seconds, and a push failure has to be reported by the command to the seat.

With that, B's "proven stopped" condition is not needed, and I do not accept it as a requirement. A local command cannot prove that an agent or its child processes have stopped, and the cleanup would wait on a proof nobody can give.

If the command-owned push is rejected, the smaller fix is to keep the batch record after a restore until every member has left `merge`, so a later pass can still find that the old top landed and put the members back to the landed state. This guards the case and does not remove it.

Done-criterion to add: after the holder is failed and cleanup has run, a push attempt from the old holder's seat does not change main.
