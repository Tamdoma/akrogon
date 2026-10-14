# Merge

Seat B merges reviewed work. It runs `akrogon verify --attempt <id>`, which checks the code that will land out fresh and runs every `checks` command not named in `merge_covers`, then every `merge_checks` command.

Each registered repo has one merge turn. A leaf holding a batch record keeps it; otherwise it is held by the eligible leaf in `merge` with the most unmerged leaves waiting on it through `blocked-by`, directly or transitively (ties keep merge stamp, then the last `to: merge` log record, then slug; a leaf with no record sorts last among equal counts). Only the holder's seat B is prompted; a waiting leaf keeps its tab, panes and `max_active` slot, and `akrogon status` names the holder and each place. For a waiting leaf, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. When the turn frees, the next holder is prompted without a manual `akrogon next`.

The command merges one leaf at a time. It records a batch on the holder (`built_on` names the remote base), then outside the global lock rebases the holder's branch onto the fetched default branch in disposable state, moves the live branch to the rebased top and prompts the holder's B with the attempt id and that top. The rebase re-removes a retired lesson line a union merge resurrected, and `merged --check` refuses a pushed range still holding one. If the branch cannot be rebased mechanically, or its worktree is dirty, the branch stays where it was and B is prompted `solo` to rebase it by hand.

For CSV export, those checks should cover quoting, empty input and the existing JSON export.

Every phase move except a move to `failed` also checks that the branch's changed old test files each carry a `Test-Change: <path> <source and reason>` trailer in a commit's final trailer block. `src/test-files.ts` defines which paths count as test files. The `plan.synthesis` to `implement` move records every path the branch changed against the target, and later moves refuse a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change` trailer names it in the last commit touching it or a later commit. When no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count. After its check run on the rebased top, B runs the move in check-only mode with the attempt id from its prompt:

```sh
akrogon phase export-csv merged --slot B --check --attempt <id>
```

It prints ok when the move's guards pass — HEAD descending from the recorded top, the trailer rule over the pushed range, and a green merge receipt for HEAD under the current config — and records the tested top. A refusal names each uncited file and the trailer line to add; a later commit, including an empty one, may carry it. Every `merged`, `merged --check` and `check.fix` call carries `--attempt <id>`; a stale or missing id is refused and changes nothing.

The command owns the push. `akrogon phase <slug> merged --attempt <id>` pushes the tested head fast-forward and moves the leaf to `merged`; seats never run `git push`, and a merge leaf with no batch record is refused `merged`. A non-fast-forward refusal rebases the leaf onto the new remote tip and prints exactly one line:

```text
rerun tested=<T1-sha|none> pushed=<T2-sha>
rerun rebase <slug> onto <sha>
```

`rerun` means the worktree already sits at `<T2-sha>` and the push needs a green receipt for that tree, so B reruns `akrogon verify` (which reuses a receipt only for an identical tree), `--check` and `merged` under the same attempt; `none` means no `--check` ran before the refusal. `rerun rebase` means the holder's branch itself no longer fits the new base, so B rebases by hand first.

If verify is red, B first judges the cause. A red run with no cause in the leaf's diff gets one rerun of `akrogon verify`: a green rerun is `inconsistent` and goes on to `merged --check`, and a red rerun ends with `check.fix --attempt <id>`, which moves the leaf to `check.fix`. Other push errors are reported with their cause.

Once the checks are green and the completion owners' briefs are gathered, B lands the leaf:

```sh
akrogon phase export-csv merged --slot B --attempt <id>
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

If the holder leaves `merge` mid-run, the next pass reconciles the record instead of rebuilding: it fetches the remote, then either moves the holder to `merged` by ancestry when its pushed head landed, with no other run, or clears the record. A failed fetch changes nothing and reports only the error. A holder failed after its push landed gets a notification naming `akrogon phase <slug> merge`; moving it back to `merge` lands it by ancestry with no prompt and no check run.

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

That is an example, not a measured claim about your project. The actual message must match the completed briefs. Before `merged`, B gathers the completion owner's briefs, and one broadcast runs for the printed completion line.

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
