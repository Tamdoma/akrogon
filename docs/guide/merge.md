# Merge

Seat B merges reviewed work. It fetches the configured remote, rebases onto the default branch and runs every `checks` command, then every `merge_checks` command.

Each registered repo has one merge turn, held by the earliest eligible leaf in `merge` (merge stamp, then the last `to: merge` log record, then slug; a leaf with neither sorts last). Only the holder's seat B is prompted; a waiting leaf keeps its tab, panes and `max_active` slot, and `akrogon status` names the holder and each place. For a waiting leaf, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. When the turn frees, the next holder is prompted without a manual `akrogon next`.

For CSV export, those checks should cover quoting, empty input and the existing JSON export.

Every phase move except a move to `failed` also checks that the branch's changed old test files each carry a `Test-Change: <path> <source and reason>` trailer in a commit's final trailer block. `src/test-files.ts` defines which paths count as test files. Right before the push B runs the move in check-only mode:

```sh
akrogon phase export-csv merged --slot B --check
```

It prints ok when the move's guards pass. A refusal names each uncited file and the trailer line to add; a later commit, including an empty one, may carry it.

The push must be fast-forward. If another leaf lands first, B fetches, rebases and checks again. It does not force-push over the other change.

If rebase conflicts occur, B resolves them and records evidence of what changed. If checks fail, the leaf returns to repair. Other push errors are reported with their cause.

After confirming that the push landed, B records completion:

```sh
akrogon phase export-csv merged --slot B
```

Do not run that command just to make a blocked leaf disappear. It means the code has landed.

When the last leaf of a standalone issue merges, the command reports:

```text
issue complete <issue>
```

When the last leaf of an epic merges, it reports:

```text
epic complete <epic>
```

Completed records move to the closed store. An issue inside an epic prints no completion line and waits for the whole epic before the top-level folder moves.

Once the merge seat goes idle or exits after `merged`, the command closes its tab, and a manual repository sweep or startup cleanup closes any tab left behind. The closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep or startup catch-up when the tab already has no live panes; only those sweeps remove completed worktrees and branches, after the issue folder has moved:

```sh
cd ~/Work/widgets
akrogon next
```

## The broadcast

If Discord targets are configured, the merge seat sends a completion update when a standalone issue or a whole epic completes. It sends the update itself, in the same session.

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

The broadcast skill turns completed briefs into a factual before-and-after update for configured Discord targets. It runs once when a standalone issue or a whole epic completes, not after every leaf or inner issue.

This gives people following the project a short account of what they can now do. It should report the actual outcome, not implementation jargon or benefits that were never measured.

Previous: [gacp](gacp.md) · Next: [In practice](in-practice.md) · [Home](../../README.md)
