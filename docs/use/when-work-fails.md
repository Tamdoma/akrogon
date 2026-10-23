# When work fails

A failed leaf is a recorded stop, not lost work. The leaf moves to the `failed` phase and keeps its plan, reviews, code and the reason it stopped. You fix the cause and send the leaf back to work from where it still needs it.

![Failure recovery: an attempt stops in failed with a recorded reason, the plan, reviews and code are kept, and the leaf is carried forward or retried from the active phase that still needs work](../pictures/failure-recovery.svg)

## What you see

A seat stops a leaf when it hits a blocker it cannot clear itself, such as a missing credential. It runs `akrogon phase <slug> failed --slot <A|B> --reason "<what blocks the work>"` and ends its pass. It does not wait in the chat for your answer.

The command then records the reason in the leaf's `failure` field, shows a desktop notice and renames the leaf's tab to `<slug> failed`. The board lists the leaf as failed, and `akrogon next` gives it no more work.

## Recover a failed leaf

1. Read the leaf's state and history:

   ```sh
   akrogon status <slug>
   ```

   The failed line shows the reason. It often points to a file in the leaf folder with more detail, such as `plan.md` or `implementation/report.md`. For a missing credential, the `Missing:` lines name the variable to add.

2. Fix the cause. A missing value needs you to add it, for example to the worktree's `.env`. Broken code needs a repair. Retrying without changing anything brings back the same stop.

3. Move the leaf back to the active phase that fits the remaining work, with no `--slot`:

   ```sh
   akrogon phase <slug> implement
   ```

   A call with `--slot` cannot move a failed leaf. Only you can, and only to an active phase. The move clears the `failure` record and keeps `fix_rounds`, so a review after a repair round stays B only. Recovery into `check.review` or `merge` still runs the test-change checks.

4. Start it again:

   ```sh
   akrogon next <slug>
   ```

`akrogon next <slug>` on a leaf still in failed refuses with `Leaf is failed and needs phase recovery`. Do step 3 first.

Do not edit `state.yaml` by hand to clear a failure. The commands own those fields. See [State and phases](../reference/state-and-phases.md) for every phase and field, and [phase.ts](../../src/phase.ts) for the moves.

## Other refusals

These are not failed leaves. A command refuses and tells you why. Fix the condition it names and run it again.

- **A phase move is refused.** Common causes are uncommitted work in the worktree, files under `issues/` changed on the leaf branch, an empty branch, a missing green `akrogon verify` receipt, or a changed test file with no `Test-Change:` trailer. See [Checks](../reference/checks.md).
- **A leaf waits on a failed leaf.** A leaf whose `blocked-by` names a failed leaf gets no work until that leaf is recovered and merged. `akrogon next <slug>` refuses with `Leaf dependencies are not merged`.
- **Sync refuses.** `akrogon sync` runs only in the registered checkout on its default branch, and refuses staged files outside issue records. Check with `git status --short` and `git diff --cached --name-only`, then decide what to do with those files. See [sync.ts](../../src/sync.ts).
- **The merge cannot push.** The land run hands the attempt to seat B. See [Merge and announce](merge-and-announce.md).

Next: [Roll back a release](roll-back-a-release.md)
