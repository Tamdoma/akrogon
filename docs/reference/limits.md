# Limits

This page lists what Akrogon does not do for you, and the work that stays yours. Phases and recovery are explained in [state-and-phases.md](state-and-phases.md).

## What Akrogon does not do

- It does not start new leaves on its own. Automatic passes resume leaves that already have a tab or worktree, and start the leaves that list a just-merged leaf in `blocked-by`. A leaf that never ran starts only when you run `akrogon next`. See [src/next.ts](../../src/next.ts).
- It does not rank leaves. There is no priority field. A pass tries merged leaves first, then leaves with more dependents. Use `blocked-by` for real prerequisites and parking to keep work out of the queue.
- It does not follow dependency chains for you. `blocked-by` names single leaves. To wait for several leaves, list each one.
- It does not stop a seat that is already working when you change a dependency. Dependencies are checked again on each pass before a seat is started.
- It does not run more than `max_active` leaves at once. The limit counts live leaves across every registered repository, not per repository. A leaf that already has a tab keeps working at the limit.
- It does not reserve capacity for a target. `akrogon next <folder or slug>` only limits that one pass. Later passes can pick any open leaf.
- It does not restart a failed leaf. A seat cannot move a leaf out of failed. Automatic passes skip it. See [src/phase.ts](../../src/phase.ts).
- It does not dispatch a leaf with a missing input. `akrogon next` refuses it until the need is supplied.
- It does not dispatch in a paused repository on automatic passes. A manual `akrogon next` still works there. See [src/pause.ts](../../src/pause.ts).
- It does not park an issue that has a running leaf, or a set of issues that would leave an open leaf waiting on a leaf that is no longer reachable. See [src/park.ts](../../src/park.ts).
- It does not decide product questions or approve anything for you. Seats record an action only you can take and stop the leaf on it, instead of guessing. See [check-issue](../../skills/check-issue/SKILL.md).
- It does not run the operator-only skills by itself. [chart-issues](../../skills/chart-issues/SKILL.md), [learn-issues](../../skills/learn-issues/SKILL.md) and [watch-issues](../../skills/watch-issues/SKILL.md) start only when you start them.

## What stays your job

- Choose the work. You open the chart door, answer each fork and approve the handoff. A recommendation cannot stand in for your answer. See [chart-issues](../../skills/chart-issues/SKILL.md).
- Keep contracts correct. Review checks the diff against the contract. It cannot add a requirement the contract left out. If you approve the wrong columns for a CSV export, a correct build of those columns is still wrong.
- Supply needs and credentials. The chart door lists every key, file and approval a leaf needs. You create missing outside-account keys and give approvals, including grant and secret-save approvals.
- Do the operator actions a review names. When a fix needs a permission, token scope or live change that only you can grant, the review seat writes the exact action under `Operator actions` in its review file. The leaf stops as failed once the other fixes are done.
- Recover failed leaves. Read `failure.reason`, fix the blocker, then move the leaf yourself with no `--slot` to the phase that fits the remaining work, and run `akrogon next <slug>`. The commands are in [state-and-phases.md](state-and-phases.md).
- Pause, stop and park work. `akrogon pause` and `akrogon unpause` hold or release automatic passes for one repository. `akrogon stop <slug>` and `akrogon start <slug>` hold or release one leaf. `akrogon park <issue>` and `akrogon unpark <issue>` move an issue out of or back into `issues/open`.
- Review lessons. `learn-issues` leaves its edits uncommitted. A lesson transfer completes only when you approve the diff, and you decide whether to run each printed `/seed-issue` line. Lesson lines that review seats write are left for you to commit.
- Start and stop the watch. `watch-issues` runs only while you keep it running, and it never recovers a leaf that failed on a credential, permission or decision only you can provide.
