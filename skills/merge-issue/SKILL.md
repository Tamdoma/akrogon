---
name: merge-issue
description: The command-owned merge turn and land run — the batch record, the verify, gates and push, each exit into check.repair or failed, and how the operator lands a held leaf or intervenes. Merge holds no seat: no prompt names merge-issue and no phase call takes a slot.
---

# Merge issue

Merge holds no seat. Its route carries no skill and no slots, and its legal moves are `merged`, `check.repair` and `failed`. This file documents the turn the command runs, the batch record in the leaf's `state.yaml`, every exit and what the operator can do. The repair seat that receives an exited leaf reads the check-issue skill's `check.repair` section.

## The merge turn

Each registered repo holds one merge turn, and each leaf in `merge` takes its own turn in merge-queue order; a waiting leaf is never touched by another leaf's turn. First return to merge keeps the `merge_stamp` it entered with; a second return mints a new one.

A merge pass (`akrogon next`, an unpause, a wake) works in this order:

1. Reconcile every recorded batch: a live `akrogon-land-<id>` unit keeps its batch, even one left `applied: false` mid-restack; a dead unit with an applied, pushed `candidate` reconciles the leaf to `merged`; one whose push never landed writes the attempt row `red` and clears the batch.
2. A holder whose applied batch lost its land run relaunches `akrogon land <slug> --attempt <id>` under the same attempt.
3. Otherwise the command records a new batch — `attempt`, `started`, `pressure_start`, `built_on` (the fetched `<remote>/<default_branch>`), `holder` (the branch's merge-base and head before the rebase) and `tools`, with `applied: false` — rebases the holder's branch onto the base in disposable state, removes resurrected retired lesson lines as a fixup commit on the top, moves the holder's live branch to the top, stamps the batch `applied` with the rebased `top`, and launches the land run.

A build conflict or a dirty holder worktree never reaches land: the turn exits the leaf to `check.repair` with `merge_exit` {reason: `conflict` | `dirty`, base}.

## The land run

`akrogon land <slug> --attempt <id>` runs as the user unit `akrogon-land-<id>` — no prompt, no seat, no seat identity. It claims the leaf only while the leaf is in merge on its attempt:

1. `akrogon verify --attempt <id>` on the candidate worktree head: every `checks` command not named in `merge_covers`, then every `merge_checks` command at once. It is the only runner of `merge_checks`; `akrogon run-check` refuses them.
2. The land gates — everything a refused non-failed move enforces, plus the merge ones: clean worktree, no `issues/` files on the branch, `Test-Change:` trailers over the pushed range, no retired-lesson line resurrected in the range, HEAD descending from the recorded `top`, and a green merge receipt for HEAD. Passing stamps `batch.tested_top` and `batch.tested_main`.
3. One fast-forward push. A landed push moves the leaf to `merged` with no seat.

### Red verify judgment inside land

A red merge-scope verify first takes the covered-main check: when every failing unit is a named test still unresolved on main, the head lands with the run as its own receipt.

When that misses and the previous red merge run sits on the same recorded holder head — every failing unit of the current run a real test title, at least one failing unit the cover misses repeating in that previous run — land runs the base pass itself, with `--known-red` semantics, skipping it when a green row already exists at the merge-base tree. A green base row or a green base pass exits `check.repair` with `base_verdict` naming the base run; a base red on every failing unit covers the head, which lands. A nameless failure — `(script)`, `(unnamed)`, `(no test name)`, `(log gone)` — or a holder head that changed since the record never triggers the base pass.

### Exits

An exit writes `state.merge_exit` and clears `batch`, then moves the leaf to `check.repair`, whose seat's prompt carries `merge-exit=<reason>` plus `run=<id>`, `refusal=<text>`, `base=<sha>`, `base_verdict=<id>` and `top=<sha>` as present:

| Reason       | When                                                                | Fields                                  |
| ------------ | ------------------------------------------------------------------- | --------------------------------------- |
| `red`      | The verify run is red, with no cover on main and none from the base pass. | `run`, `top`, `base_verdict?` |
| `gate`     | A land gate refused.                                                       | `refusal`, `top`              |
| `conflict` | The rebase or restack conflicted, or the turn failed before apply.         | `base`, `top` on a land exit  |
| `dirty`    | The holder worktree held uncommitted work at apply or restack.             | `base`, `top` on a land exit  |

Push outcomes are not exits: a first non-fast-forward refusal restacks onto the new remote tip inside the same run and pushes again; a second clears the batch, writes the attempt row `red`, prints `held <slug> attempt=<id>` and keeps the leaf in merge at its queue place for the next pass to rebuild; a push error that is not a refusal moves the leaf to `failed` with git's stderr in `failure.reason`.

`merge_exit` clears when the leaf leaves `check.repair`. A `check.repair → merge` move skips the leaf green-receipt requirement exactly when `merge_exit.reason` is `red` and `merge_exit.top` equals the worktree HEAD — the unedited returning leaf already holds its merge-scope proof; anything else still needs the receipt.

## Phase calls on a merge leaf

A call on a merge leaf carrying `--slot` or `--attempt` is refused: `A seat cannot make merge calls: <requested>`. `merged --check` is refused: `--check is the seat protocol and merge holds no seat: run the move without --check`. `merged` or `check.fix` on a leaf that does not hold the turn is refused, naming the holder when one holds it. `check.fix` is always refused on a merge leaf: `Merge moves to check.repair itself; a second red takes check.fix from check.repair`.

The one legal move call is the operator's slot-less `akrogon phase <slug> merged`, which lands the leaf's applied batch: it pushes the tested head fast-forward, restacks once on a non-fast-forward refusal and pushes again, completes the owner and moves the leaf — or fails the call when nothing was pushed. Any seat or the operator can still stop the leaf with `akrogon phase <slug> failed --reason "<text>"`, and a failed leaf's operator recovery back into `merge` re-enters the queue.

## Operator surface

The retired hold verbs exit with an error pointing at the check-issue skill's `check.repair` section; a merge exit goes to `check.repair`, never to a seat inside merge.

`akrogon status` shows `land` on any merge-phase leaf holding a batch, with the unit name and liveness under the leaf's detail. A merge leaf holding a batch keeps its systemd slice in cleanup under the `merge batch` reason, and `stop --all` stops a tab-less merge leaf holding a batch. `akrogon timing` counts a seatless close into `merged` or `check.repair` as a seatless visit.
