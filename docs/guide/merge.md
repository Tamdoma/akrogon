# Merge

Seat B merges reviewed work. It runs every `checks` command not named in `merge_covers`, then every `merge_checks` command, on the code that will land.

Each registered repo has one merge turn. A leaf holding a batch record keeps it; otherwise it is held by the eligible leaf in `merge` with the most unmerged leaves waiting on it through `blocked-by`, directly or transitively (ties keep merge stamp, then the last `to: merge` log record, then slug; a leaf with no record sorts last among equal counts). Only the holder's seat B is prompted; a waiting leaf keeps its tab, panes and `max_active` slot, and `akrogon status` names the holder and each place. For a waiting leaf, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. When the turn frees, the next holder is prompted without a manual `akrogon next`.

The command batches waiting leaves into the holder's merge, carrying at most `batch_limit` - 1 members (default 3). It records a batch on the holder, then outside the global lock builds one stack — every member branch in turn order, then the holder's, onto the fetched default branch — moves each live branch to its built tip and prompts the holder's B with the attempt id and the stack top. The stack build re-removes a retired lesson line a union merge resurrected, and `merged --check` refuses a pushed range still holding one. Carried members are never prompted and never run their own checks: one check run on the top and one push land every member with the holder. While the batch is in flight a member keeps its tab, panes and worktree; after it lands, sweeps remove its worktree and branch like any merged leaf, and its tab closes once the record clears — when the holder has left `merge` and no carried member remains there. A leaf entering `merge` after the record is written is not carried and waits for a later batch. A member whose branch cannot be stacked mechanically is restored to its saved head and excluded from that attempt only — its slug stays on the attempt record and the next attempt can carry it; if the holder's own branch is the one that conflicts, every member is restored and the holder is prompted `solo` so its B resolves the rebase by hand.

For CSV export, those checks should cover quoting, empty input and the existing JSON export.

Every phase move except a move to `failed` also checks that the branch's changed old test files each carry a `Test-Change: <path> <source and reason>` trailer in a commit's final trailer block. `src/test-files.ts` defines which paths count as test files. The `plan.synthesis` to `implement` move records every path the branch changed against the target, and later moves refuse a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change` trailer names it in the last commit touching it or a later commit. When no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count. After its one check run on the stack top, B runs the move in check-only mode with the attempt id from its prompt:

```sh
akrogon phase export-csv merged --slot B --check --attempt <id>
```

It prints ok when the move's guards pass — HEAD equal to the recorded top and the trailer rule over each carried member's range and the whole stack — and records the tested top. A refusal names each uncited file and the trailer line to add; a later commit, including an empty one, may carry it. Every `merged`, `merged --check` and `check.fix` call carries `--attempt <id>`; a stale or missing id is refused and changes nothing.

The command owns the push. `akrogon phase <slug> merged --attempt <id>` pushes the tested top fast-forward and moves every carried member to `merged` before the holder; seats never run `git push`. A non-fast-forward refusal restacks the batch onto the new remote tip and prints exactly one line:

```text
reuse tested=<T1-sha> pushed=<T2-sha>
rerun tested=<T1-sha|none> pushed=<T2-sha>
rerun rebase <slug> onto <sha>
```

`reuse` means old and new main are equal outside `issues/` and `learnings/`, the tested top and the restacked top are equal outside them too, `issues/config.yaml` is unchanged and the restack had no conflict, so the earlier green check run stays valid: B copies the line into `review-B.md`, then runs `--check`, the briefs and `merged` under the same attempt without rerunning the checks. `rerun` means the worktree already sits at `<T2-sha>` and fresh checks are required, so B reruns its checks, `--check` and `merged` under the same attempt; `none` means no `--check` ran before the refusal. A member that conflicted during the restack is restored and excluded from that attempt, its slug kept on the record, and `rerun rebase` means the holder's branch itself no longer fits the new base, so B rebases by hand first.

If checks fail, B first judges the cause. A red run with no cause in the stack's diff reruns the same command once on the fetched default branch; red there means main is broken, and B reports `check.fix --attempt <id> --red-on-base <sha> --command <exact command>` with that sha. The leaf stays in `merge`, the batch record is cleared without halving, and the repository is held against further merge attempts until fetched main differs from the held sha outside `issues/` and `learnings/`; a `--red-on-base` refusal means main already moved, so B refetches and re-judges. `akrogon unhold` clears a hold by hand. A hold may name one merge leaf via `akrogon hold-fix <slug>` to take the turn solo while the hold exists. When the evidence attributes the red run to the holder or one carried member, B writes the finding into that culprit's `review-B.md` and reports `check.fix --attempt <id> --culprit <slug>`: every member and the holder restore to saved heads, the record clears, and only the culprit moves to `check.fix`. An unattributed red run reports `check.fix --attempt <id>` as before: with carried members this prints `batch split, holder keeps <n> of <m> members` — each member is restored to its saved head and the holder keeps the turn with at most the first half of them, so repeated red runs narrow to the leaf that breaks the checks while the others land in batches — and with none the leaf moves to `check.fix` as before. Other push errors are reported with their cause.

Once the checks are green and the completion owners' briefs are gathered, B lands the batch:

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

Completed records move to the closed store. An issue inside an epic prints no completion line and waits for the whole epic before the top-level folder moves. One batch can print several completion lines, one per standalone issue or epic whose last open leaf it lands.

If the holder leaves `merge` mid-run, the next pass reconciles the record instead of rebuilding: it fetches the remote, then either finishes the moves by ancestry — a carried member whose applied tip is already on the remote, and the holder itself when its pushed top landed, merges without another run — or restores every member still in `merge` to its saved head and clears the record. A failed fetch restores nothing and reports only the error. A holder failed after its push landed gets a notification naming `akrogon phase <slug> merge`; moving it back to `merge` lands it by ancestry with no prompt and no check run.

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

That is an example, not a measured claim about your project. The actual message must match the completed briefs. Before `merged`, B gathers the briefs of every completion owner the batch can close — the batch may complete more than the holder's own issue — and one broadcast runs per printed completion line.

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
