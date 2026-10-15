# Next

The next command makes one dispatch pass. It checks the current state, finds eligible work and prompts the seats needed for that phase.

It does not stay running as a background worker.

## The four forms

Run these examples from the widgets repository unless noted otherwise.

Start or continue one leaf:

```sh
cd ~/Work/widgets
akrogon next issues/open/export-csv/export-csv
```

Start or continue every leaf of an issue or epic by name:

```sh
akrogon next csv
akrogon next data-exports
```

Consider leaves under a path:

```sh
akrogon next issues/open/export-csv
```

A bare name must match exactly one candidate. A name matching two or more is refused before anything starts, with each match listed by kind and path. When an issue and its leaf share a name, select by folder path:

```sh
akrogon next issues/open/export-csv/export-csv
```

An input that exists as a folder from the current directory keeps path meaning, even if an owner or leaf elsewhere shares the name.

Sweep the current repository:

```sh
akrogon next
```

Sweep explicitly:

```sh
akrogon next --all
```

Inside a registered repository, the last command covers that repository. Outside one, it covers all registered repositories. A Herdr hook can also provide context for a targeted pass.

Herdr events trigger further passes as agents work. Startup resumes allocated work only and cleans up completed worktrees. You can run a manual pass when you want to move work forward.

A completion starts only its dependents in the same repository.

## Parking work you don't want yet

Park a whole issue to remove it from the open queue:

```sh
akrogon park export-csv
```

Restore it when ready:

```sh
akrogon unpark export-csv
akrogon next issues/open/export-csv/export-csv
```

Use top-level issue folder names. Parking moves the issue's files:

```text
issues/open/export-csv/
issues/parked/export-csv/
```

Akrogon refuses to park allocated work or leave open work depending on parked leaves.

```text
issues/open/export-csv/
          |
        park        only when eligible
          v
issues/parked/export-csv/
          |
       unpark
          v
issues/open/export-csv/
          |
   eligible for dispatch again
```

Park export-csv when you want it out of future sweeps. Unparking restores queue membership, not permission to bypass dependencies or capacity. With the all option, it skips issues that cannot be parked:

```sh
akrogon park --all
```

## Pausing automatic dispatch for a repository

Pause stops automatic dispatch for the current repository without moving any files:

```sh
akrogon pause
```

While paused, the Herdr hooks, startup resume, the merge wake after a phase move, and the dependent starts, merge pass and cleanup inside those runs do nothing for that repo. Operator-typed `akrogon next <target>`, bare `akrogon next` and `akrogon next --all` still run in full, and the repo stays paused afterwards.

Resume with one pass that relaunches closed seats and runs deferred cleanup:

```sh
akrogon unpause
```

Pause differs from park: park removes whole unallocated issues from the open queue until unparked, while pause freezes automatic work for the entire repo including allocated leaves, and unpause dispatches again right away. `akrogon status` marks paused repos.

## Stopping a leaf

Stop ends every process a leaf's seats started, including browsers and worker scripts:

```sh
akrogon stop <slug>
```

Stop records the leaf as stopped in `stopped.yaml` in the akrogon home on this host, then stops the leaf's systemd slice. Herdr closes the leaf's panes. The worktree and saved harness sessions stay. If the slice stop fails, the leaf stays stopped, the error prints and the command exits non-zero. Run stop again to retry.

Stop every allocated leaf of the current repository:

```sh
akrogon stop --all
```

It prints one result line per leaf. One failure does not stop the others, and the command exits non-zero if any leaf failed.

While a leaf is stopped, automatic passes skip it quietly. A typed `akrogon next <slug>`, bare `akrogon next` or `akrogon next --all` reports the leaf with an error naming `akrogon start <slug>` and exits non-zero. The merge turn builds no stack and prompts no merge seat for it. A stopped leaf that already holds the merge turn keeps it, so the repository's other merge leaves wait until it is started. `akrogon status` shows stopped in the NOTE column, and `akrogon status <slug>` prints a `stopped:` line.

Start removes the stopped record and runs the targeted next pass for that leaf by its folder path:

```sh
akrogon start <slug>
```

Start exits non-zero on a leaf that is not stopped.

Panes you split by hand in a leaf tab are outside the slice and survive a stop. Pause kills nothing: it only freezes automatic dispatch.

A single check run stops on its own with `akrogon stop-run [<run-id>]`: the `run <id>` line the run printed at start carries the id, a run started by another pane is refused, and with no id it stops only when the caller has exactly one live run. It stops only runs the caller's pane scope launched, so other seats' and leaves' runs are unaffected.

## How order is decided

A leaf must have valid state and satisfied dependencies. Failed leaves are skipped.

The global max_active setting limits new leaf allocations across repositories. Existing tabs can keep progressing at the limit. Each leaf normally has two seats, so this is not a count of agent processes.

Leaves in `merge` take their repository's single merge turn: the merge pass writes a batch record on the holder snapshotting the other unstopped eligible `merge` leaves as members, rebases the holder's branch onto the remote base and each member onto the tip outside the global lock, moves only the holder's branch under the lock, keeping member branches at their original heads until the push lands — a member whose rebase conflicts is skipped and stays in `merge` — and prompts only the holder's B while the rest wait. Every committed `phase` move and the end of each pass re-sweep `merge` leaves, so the next holder is prompted as soon as the turn frees.

Each leaf pane shell runs in its own systemd scope under a per-leaf slice under `akrogon.slice` before a seat starts in it. A recorded pane found outside its scope, as after a Herdr restore, is closed and recreated before any prompt. A pane whose cgroup cannot be read is left open, and the leaf is skipped that pass with the error. A failed boxing also skips the leaf. Panes you split by hand in a leaf tab are not boxed.

The same per-leaf slice outlives the leaf until cleanup: a reconcile pass stops the slice of a merged or failed leaf once its tab is gone, ending processes the seats left running, unless a live run record names the slice or the pass itself runs inside it. A pass that cannot fetch the pane list stops nothing whose tab is recorded. Loaded `akrogon-l*` slices matching no leaf record are stopped only while empty, and failed `akrogon-run-*` units are cleared each pass. Kept slices and units appear as `Kept by last cleanup:` lines in `akrogon status`.

A working, blocked or unknown seat is not treated as idle. A recently delivered prompt also gets a grace period.

A dispatch pass attempts leaves with more unmerged leaves waiting on them through `blocked-by`, directly or transitively, before leaves with fewer; ties keep the previous visit order with merged leaves first.

Each dispatch pass makes at most one delivery attempt per pending seat. A failed delivery records the error and attempt count and is retried on the next pass; delivery faults never move the leaf to `failed`. Running next again does not resume a failed leaf. Read its cause and choose a recovery phase first.

## When picked work cannot start

A typed pass reports every picked leaf it cannot start. Picked means the `next <target>` selection, the typed bare `next` selection without event JSON, and the `next --all` sweep inside one repo or across every repo outside one. Each picked leaf gets at most one line naming the leaf and why, and ready siblings still start.

Reasons come in order. A failed leaf needs phase recovery first. Otherwise every unmerged dependency is named with its phase, or `parked`, `missing`, or `unreadable`. Otherwise every missing input is named by kind, name, and holder, never values. Dependencies win over inputs.

A leaf whose dependencies are all open leaves still in progress is waiting normally: it prints a plain `waiting: <slug> on <dependency> (<phase>)` line on stdout and does not change the exit code. Every other reason, including a `failed`, `parked`, `missing` or `unreadable` dependency, is an error line on stderr and sets exit 1.

For waits, automatic passes stay quiet: `--resume`, Herdr events, the merge wake after `phase`, dependents started by a completion, and merge turn, capacity, and busy seats never produce a line. Real errors still report.

## Release work without managing every prompt

Manual dispatch is the normal way to start work. A completed leaf starts only same-repository leaves that depend on it; every other leaf waits for a manual `akrogon next`. Once a leaf is running, the state and Herdr events let the seats progress without you copying the next skill prompt between panes.

Use parking for work that should stay out of later manual sweeps. Use dependencies for work that truly needs another result first.

For CSV export, the formatter and an unrelated settings fix can run independently. A download button that calls the new formatter has a real dependency.

```text
export-csv -- merges --> download-button may run
                             blocked-by: export-csv

settings-fix ----------> can run independently

New allocations share the global max_active limit.
```

For export-csv, finish the formatter before starting a button that depends on it. An unrelated settings fix needs no ordering edge.

Previous: [Chart](chart.md) · Next: [Phases](phases.md) · [Home](../../README.md)
