# Limits

Keep these boundaries in mind when deciding what to dispatch.

- **Dependencies govern dispatch.** They are checked on each pass, including for leaves with tabs. Changing a dependency does not interrupt a prompt already running.
- **Dependencies name leaves.** To wait for several independent leaves, list each one. Naming one “last leaf” works only if its own dependencies cover the others.
- **Capacity is global.** The max_active limit applies across registered repositories. It must be a positive integer. Existing allocations can continue at the limit.
- **There is no priority field.** Old priority values are ignored. Use dependencies for actual prerequisites and parking to keep work out of the queue.
- **Folder targeting is temporary.** It limits that dispatch pass. Later sweeps can consider other open leaves.
- **Cleanup is separate from idle events.** Manual repository sweeps and startup cleanup remove completed worktrees. A normal hook pass does not delete them.
- **Failed leaves do not restart themselves.** Read the reason and resume an appropriate active phase.

For example, start CSV export without dispatching another folder in that pass:

```sh
cd ~/Work/widgets
akrogon next issues/open/export-csv
```

That command does not reserve capacity for the folder.

Keep lifecycle records in the registered checkout and code changes in the leaf worktree:

```text
~/Work/widgets/issues/open/export-csv/export-csv/
~/Work/widgets/issues/worktrees/export-csv/
```

The second path uses the default worktree root. Your configuration may choose another.

Normal phase moves enforce worktree and artifact conditions. Recording a failure is allowed without first cleaning a blocked worktree. Do not assume that every phase move applies the same checks.

Sync commits only eligible issue records. It refuses unrelated staged files. It can preserve unrelated unstaged changes during its rebase, but conflicts still need attention.

A blocked or unknown agent is not treated as idle. Repeated failed prompt deliveries count toward failure, while a successful delivery resets that seat's attempts. A permission dialog is not proof of a delivery failure.

Only the merge seat sends the completion broadcast. A failed notification leaves the code merge complete.

## What remains your responsibility

You choose the work, resolve product decisions and provide permissions or credentials that agents cannot obtain.

Keep the contracts accurate. A two-seat review can check the agreed behavior, but it cannot make a missing product requirement appear.

For CSV export, choosing the wrong columns is still wrong even if both agents implement and test that choice correctly.

Previous: [In practice](in-practice.md) · Next: [Problems](problems.md) · [Home](../../README.md)
