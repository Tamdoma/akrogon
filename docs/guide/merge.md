# Merge

Seat A merges reviewed work. It fetches the configured remote, rebases onto the default branch and runs the configured checks.

For CSV export, those checks should cover quoting, empty input and the existing JSON export.

The push must be fast-forward. If another leaf lands first, A fetches, rebases and checks again. It does not force-push over the other change.

If rebase conflicts occur, A resolves them and records evidence of what changed. If checks fail, the leaf returns to repair. Other push errors are reported with their cause.

After confirming that the push landed, A records completion:

```sh
akrogon phase export-csv merged --slot A
```

Do not run that command just to make a blocked leaf disappear. It means the code has landed.

When all leaves in an issue are merged, the command can report:

```text
issue complete
```

Completed records move to the closed store. An issue inside an epic waits for the whole epic before the top-level folder moves.

The merge seat closes its tab as its last action. A manual repository sweep or startup cleanup removes completed worktrees and branches:

```sh
cd ~/Work/widgets
akrogon next
```

## The broadcast

If Discord targets are configured, the merge seat sends a completion update when the issue completes. It sends the update itself, in the same session.

The message describes the user-visible change. For our example:

```text
Before:
- Exported data needed another conversion step for a spreadsheet.

Now:
- Users can export CSV directly.
- Values containing commas and quotes stay in their fields.
```

That is an example, not a measured claim about your project. The actual message must match the completed briefs.

Webhook variable names belong in repository configuration. Their values are read from:

```text
~/.config/akrogon/env
```

A failed broadcast does not reopen the issue or undo the merge. Read the reported delivery error before deciding what to resend.

## merge-issue: check the version that will land

Other leaves may merge while CSV export is in review. A rebase can change the code the checks need to exercise.

The merge skill runs checks after integration with the current default branch. This gives you evidence for the version being pushed, including any conflict resolution.

A successful merge ends the leaf's code work. Deployment remains your project's responsibility.

## broadcast-issue: explain the completed outcome

The broadcast skill turns completed briefs into a factual before-and-after update for configured Discord targets. It runs when the whole issue completes, not after every leaf.

This gives people following the project a short account of what they can now do. It should report the actual outcome, not implementation jargon or benefits that were never measured.

Previous: [gacp](gacp.md) · Next: [In practice](in-practice.md) · [Home](../../README.md)
