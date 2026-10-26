# Brief: one-test-run

## What

A repo can list check names in a new `full` config field. Runs of a listed check from the same registered repo run one at a time, in arrival order, across every leaf, seat and verify of that repo. A run of another repo, or of a check not listed, starts at once. A waiting run prints one line naming the run it waits for. `akrogon stop-run <id>` cancels a waiting run. `akrogon status` shows the line as a table only while at least one run waits.

Setting `full: [test]` in akrogon's own config is a step on main after this leaf is deployed, not part of this leaf.

## Why

Two copies of akrogon's whole test suite at once overload the host: over 14 days, 48 of 73 overlapped akrogon runs passed against 122 of 190 solo, and two at once take about as long as two in a row. The same line existed host-wide on 2026-10-24 and was removed the same day because akrogon then waited behind framework's 20-minute verify (revert 20455420). A per-repo line keeps the gain and removes that cross-repo wait.

## Done-criteria

1. Two runs of a check listed in `full`, from two leaves of the same registered repo sharing one state home, do not overlap when the holder ends normally: the second starts its command only after the first has ended and its record is gone, and it prints one stderr line naming the holder's repo, leaf and check. Three such runs start in the order they arrived. (A,B)
2. While a listed run of repo X holds the line, a run of repo X whose name is not listed starts at once, and a run of another registered repo whose own `full` list names the same check starts at once.
3. A listed run started inside a run that already holds the same repo's line runs at once and creates no record. A listed run started inside a run of an unlisted check of the same repo takes its own turn behind the live holder.
4. A holder or a waiter killed with SIGKILL does not stop the next waiter from starting.
5. `akrogon stop-run <id>`, run from the waiting run's scope, cancels a waiting run: it leaves the queue at once, so the next waiter starts when the holder ends, and its record is not written again. The cancelled run exits non-zero without starting its command; a suspended one does so when it resumes. (A,B)
6. While at least one listed run waits, `akrogon status` prints the line with the same table renderer as the leaf table: holder first, then waiters in queue order, each with repo, leaf, check, state, age and run id. With no run waiting it prints nothing about the line.
7. A waiting run counts as a live run for reconcile's slice protection (its leaf slice is not stopped) and for the state-home migration gate (migration does not proceed while it waits).
8. A `full` entry that names neither a `checks` nor a `merge_checks` key is refused when the config is read, with a message naming the entry.
