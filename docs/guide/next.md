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

## How order is decided

A leaf must have valid state and satisfied dependencies. Failed leaves are skipped.

The global max_active setting limits new leaf allocations across repositories. Existing tabs can keep progressing at the limit. Each leaf normally has two seats, so this is not a count of agent processes.

Leaves in `merge` take their repository's single merge turn: the merge pass writes a batch record on the holder, builds the stacked branches outside the global lock, applies them under the lock, and prompts only the holder's B while the rest wait. Every committed `phase` move and the end of each pass re-sweep `merge` leaves, so the next holder is prompted as soon as the turn frees.

A working, blocked or unknown seat is not treated as idle. A recently delivered prompt also gets a grace period.

A dispatch pass attempts leaves with more unmerged leaves waiting on them through `blocked-by`, directly or transitively, before leaves with fewer; ties keep the previous visit order with merged leaves first.

Each dispatch pass makes at most one delivery attempt per pending seat. Repeated delivery failures can put the leaf into failed. Running next again does not resume a failed leaf. Read its cause and choose a recovery phase first.

## When picked work cannot start

A typed pass reports every picked leaf it cannot start. Picked means the `next <target>` selection, the typed bare `next` selection without event JSON, and the `next --all` sweep inside one repo or across every repo outside one. Each picked leaf gets at most one line naming the leaf and why, ready siblings still start, and any line sets exit 1.

Reasons come in order. A failed leaf needs phase recovery first. Otherwise every unmerged dependency is named with its phase, or `parked`, `missing`, or `unreadable`. Otherwise every missing input is named by kind, name, and holder, never values. Dependencies win over inputs.

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
