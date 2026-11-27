# Merging and announcements

When a leaf passes review, it enters `merge`. Akrogon rebases it onto your default branch, runs the full merge checks and gates on a fresh checkout, pushes fast-forward, completes the issue or epic when its last leaf lands, and sends an optional plain-language Discord summary.

You do not run merge commands by hand. `akrogon next` (and the automatic wakes from `akrogon-listener.service`) drives the merge turn for you.

Continuing `client-portal`'s `weekly-client-report`, `csv-export` has just cleared review and entered `merge`, while `scheduled-email` is still waiting on `csv-export`.

## One merge turn per repository

Each registered repository has **one merge turn** at a time. Leaves in `merge` line up in a single queue per repository so only one leaf lands onto `<remote>/<default_branch>` (`origin/main`) at a time, and waiting leaves are untouched while the holder runs.

Akrogon orders eligible `merge` leaves by three rules:

1. **Active batch holder first**: A leaf already holding a `batch` record keeps the turn until its attempt finishes.
2. **Most unmerged dependents next**: Transitive count of unmerged leaves waiting on it, so `csv-export` (blocking `scheduled-email`) lands ahead of a leaf with zero dependents.
3. **Earliest `merge_stamp`**: The timestamp recorded when the leaf entered `merge` (falling back to `issues/log.jsonl` and then slug order).

If a leaf exits `merge` for repair and returns, its **first return keeps its original `merge_stamp`** so one repair bounce does not drop it to the back of the queue. A **second return mints a new `merge_stamp`**.

Run `akrogon status` from `t-client-portal` to see the queue:

- The `TURN` column shows `holder` for place 1 and `2`, `3`, and so on for waiting leaves.
- The `NOTE` column shows `land` while the holder has an active land batch, and `akrogon status csv-export` prints `land alive: akrogon-land-<id>` (or `land dead:` if the unit exited).

## Command-owned landing with no seat

Merge holds **no seat**. No prompt names `merge-issue`, and `akrogon phase` refuses `--slot` or `--attempt` on a `merge` leaf.

When `csv-export` gets the merge turn, `akrogon next` handles the rebase and launches the land run on its own:

1. **Reconciles existing batches**: If a dead land unit had already pushed its candidate commit, Akrogon reconciles the leaf straight to `merged`; if an applied batch lost its land unit before pushing, Akrogon relaunches `akrogon land` under the same attempt ID.
2. **Fetches and rebases**: Fetches `<remote>` (`origin`), records a new `batch` in `state.yaml`, rebases `csv-export` onto `<remote>/<default_branch>` in a disposable worktree, and strips any resurrected retired lines from `learnings/LESSONS.md` as a fixup commit (`lessons: retire applied lines`) if needed.
3. **Applies and starts the land unit**: Moves branch `csv-export` to the rebased `top`, marks `batch.applied: true`, and starts:

   ```sh
   akrogon land csv-export --attempt <id>
   ```

   as the background systemd user unit **`akrogon-land-<id>`** (with its verify pass and check runs placed under **`akrogon-land.slice`**, and no seat identity).

If the rebase conflicts or the `csv-export` worktree has uncommitted edits at turn start, the leaf never reaches `akrogon land`; the merge turn moves it straight to `check.repair` with `state.merge_exit` recorded.

## Checks, land gates, and pushing

`akrogon land csv-export --attempt <id>` holds the repository's check admission line for the whole attempt (later runs for `client-portal` wait until the land run finishes) and performs three steps:

1. **Runs merge verification**: Executes `akrogon verify --attempt <id>` on a fresh checkout of the candidate head. Merge verification runs `setup`, then every `checks` entry **not** listed in `merge_covers` (non-`full` in config order, then `full`), and once those are green, runs every **`merge_checks`** entry **in parallel**. `akrogon verify --attempt <id>` is the only runner of `merge_checks`; `akrogon run-check` refuses them.
2. **Enforces land gates**: Checks that the worktree is clean, no files under `issues/` are touched on the branch, every changed or added test file has its required `Test-Change:` trailer over the pushed range (plus frozen-plan checks), no retired lesson line was resurrected in the range, HEAD descends from the recorded `top`, and a qualifying green merge receipt (or main-red cover) exists for HEAD. Passing stamps `batch.tested_top` and `batch.tested_main`.
3. **Pushes fast-forward**: Pushes the tested head fast-forward to `<remote>/<default_branch>` (never `--force`):
   - **Success**: Records the attempt as `merged` and moves `csv-export` to `merged` with no seat.
   - **First non-fast-forward refusal**: Someone else pushed to `main` while checks ran. Land fetches the new remote tip, restacks, re-verifies and re-gates, and retries the push **once** inside the same run.
   - **Second non-fast-forward refusal**: Land logs the attempt `red`, clears `batch`, prints `held csv-export attempt=<id>`, and **keeps `csv-export`'s queue place** in `merge` so the next pass rebuilds on the updated base.
   - **Any other push error** (auth, network, server error): Land logs the attempt `red`, clears `batch`, and moves the leaf to `failed` with git's stderr in `failure.reason` for operator recovery.

If you ever need to land an already-applied batch manually from `t-client-portal`, the one operator move allowed on a `merge` holder is slot-less `akrogon phase <slug> merged`.

## When checks go red or a gate refuses

Because merge holds no seat, any uncovered red verify, refused gate, rebase conflict, or dirty worktree moves the leaf out of `merge` into **`check.repair`**, clears `batch`, and records **`state.merge_exit`**. The next pass prompts **slot B** with `merge-exit=<reason>` and the recorded fields:

| `merge-exit=` | What happened | Recorded fields |
| --- | --- | --- |
| `red` | `akrogon verify --attempt <id>` went red and neither main-red cover nor land's base comparison pass covered it. | `run=<id>`, `top=<sha>`, `base_verdict=<id>` (when a base check ran or matched) |
| `gate` | A land gate refused (for example, missing `Test-Change:` trailer or resurrected retired lesson). | `refusal=<text>`, `top=<sha>` |
| `conflict` | The rebase at turn start or during a land restack conflicted. | `base=<sha>` (plus `top=<sha>` on a land exit) |
| `dirty` | The leaf worktree held uncommitted work at apply or restack. | `base=<sha>` (plus `top=<sha>` on a land exit) |

Before exiting on `red`, `akrogon land` checks two built-in covers automatically:

- **Main-red cover**: If every failing unit is a named test title already failing the same command in an unresolved base comparison run on `main`, the head lands with that run as its receipt.
- **Repeated-red base check**: If a returning leaf fails again on the exact same recorded holder head with at least one repeating named test title that the cover missed, land runs the base commit itself (or reuses an existing green row on the merge-base tree). If the base is red on every failing unit, the head lands; if the base is green, land exits to `check.repair` with `base_verdict=<id>` pointing to that green base evidence.

When a leaf lands in `check.repair` from merge, **slot B** reads the kept logs with `akrogon log` (and may run the narrowest failing command through `akrogon run-check`, never the whole `merge_checks` suite) and takes one of four outcomes:

1. **Repairs directly and returns to `merge`**: For mechanical gate refusals (such as adding a missing `Test-Change:` trailer or removing a resurrected retired lesson), `conflict` or `dirty` rebases onto `base`, or leaf-caused Fixes within B's repair authority, B commits the fix, runs `akrogon verify`, and moves back to `merge`.
2. **Sends leaf-caused fixes to slot A (`check.fix`)**: When the failure is caused by the leaf's diff and falls under B's `Handed to A` exceptions (for example, needing both code and test edits), B records the failing output and hands it to slot A in `check.fix`. A second red of the same named test title on an unchanged head counts as leaf-caused when `base_verdict` shows it green on `main`. After A repairs and reruns the reproducing command cleanly, B re-checks before returning to `merge`.
3. **Returns an inconsistent or flaky red unchanged**: When a failing unit has no cause in the leaf's diff, passes B's narrowest rerun on HEAD, and shows no traced defect on `main`, B makes no commit on the leaf branch and returns it unchanged with `akrogon phase <slug> merge --slot B`. Because HEAD still equals `merge_exit.top` for a `red` exit, Akrogon skips the leaf green-receipt gate.
4. **Stops on a main-caused red (`failed`)**: When B proves the failure comes from `main` (still red on a narrow rerun with no cause in the leaf diff, red on a base receipt, or traced to a race in `main`'s code) and the main-red cover missed it, B records the failing unit and evidence in `review-B.md` and stops the leaf with `akrogon phase <slug> failed --slot B --reason "<main red; see review-B.md>"` so `main` can be fixed before recovery.

`state.merge_exit` clears automatically as soon as the leaf leaves `check.repair`.

## Issue and epic completion

Watch what happens across both leaves of `weekly-client-report`:

1. **When `csv-export` lands**: `csv-export` moves to `merged`. Because `scheduled-email` is still open under `issues/open/weekly-client-report/`, the issue stays open. Akrogon immediately wakes **`scheduled-email`** (whose `blocked-by: [csv-export]` is now satisfied), closes `csv-export`'s herdr tab, and removes `csv-export`'s finished worktree and slice.
2. **When `scheduled-email` lands**: Because `scheduled-email` is the last leaf of `weekly-client-report`, Akrogon completes the whole issue automatically:
   - Closes every linked GitHub issue recorded in `sources` with a delivery note.
   - Deletes plain `*.log` files inside `issues/open/weekly-client-report/` (each run's failing test names remain stored on its row in `issues/verify-runs.jsonl`, and `akrogon log` still reads older logs packed into `evidence.tar.zst`).
   - Moves `issues/open/weekly-client-report/` to `issues/closed/weekly-client-report/`.
   - Prints one completion line:

     ```text
     issue complete weekly-client-report
     ```

For multi-issue epics, individual issues inside the epic stay quiet when they finish; the folder moves to `issues/closed/<epic>/` and prints `epic complete <epic>` once every leaf of the whole epic is `merged`.

## Announcements

If your repository sets `broadcast.discord.webhook_env` in `issues/config.yaml`, Akrogon sends **one** plain-language Discord update per completed standalone issue or completed epic (never one per leaf).

When the command's land run completes `weekly-client-report`:

1. Akrogon records a `broadcast` handoff on `scheduled-email`, and `akrogon status` shows `broadcast pending`.
2. `akrogon next` prompts **slot B** once with [broadcast-issue](../../skills/broadcast-issue/SKILL.md), passing the `issues/closed/weekly-client-report/` folder, pushed commit SHA, and linked sources.
3. Slot B reads the completed briefs from `issues/closed/weekly-client-report/` and composes one update written for the whole team, not just developers:
   - A one-line `<repo>: <headline>` summary in plain English.
   - A **`before`** list explaining what was wrong or missing.
   - A **`now`** list explaining what is better for users, with no code jargon, file paths, command names, or test counts.
4. The broadcast script reads the webhook URLs **only** from `~/.config/akrogon/env` (never from inherited shell variables) and delivers to each configured target, with one immediate retry if a target fails.

If you land a completing leaf manually with `akrogon phase <slug> merged`, run `broadcast-issue` yourself for the printed completion line.

A failed Discord broadcast reports its error (with secret values redacted), but **never undoes the merge or reopens the issue**.

For exact merge procedures, phase rules, and check settings, see [merge-issue](../../skills/merge-issue/SKILL.md), [check-issue](../../skills/check-issue/SKILL.md), [Checks](../reference/checks.md), [State and phases](../reference/state-and-phases.md), and [Settings](../reference/config.md).

Previous: [Lifecycle](09-lifecycle.md) · Next: [While you are away](11-while-you-are-away.md)
