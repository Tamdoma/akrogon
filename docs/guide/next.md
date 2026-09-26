# Next

The next command makes one dispatch pass. It checks the current state, finds eligible work and prompts the seats needed for that phase.

It does not stay running as a background worker.

## The four forms

Run these examples from the widgets repository unless noted otherwise.

Start or continue one leaf:

```sh
cd ~/Work/widgets
akrogon next export-csv
```

Consider leaves under a path:

```sh
akrogon next issues/open/export-csv
```

Sweep the current repository:

```sh
akrogon next
```

Sweep explicitly:

```sh
akrogon next --all
```

Inside a registered repository, the last command covers that repository. Outside one, it covers all registered repositories. A Herdr hook can also provide context for a targeted pass.

Herdr events trigger further passes as agents work. Startup also runs a sweep. You can run a manual pass when you want to move work forward.

A completion starts only its dependents in the same repository.

## Parking work you don't want yet

Park a whole issue to remove it from the open queue:

```sh
akrogon park export-csv
```

Restore it when ready:

```sh
akrogon unpark export-csv
akrogon next export-csv
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

## How order is decided

A leaf must have valid state and satisfied dependencies. Handbuilt and failed leaves are skipped.

The global max_active setting limits new leaf allocations across repositories. Existing tabs can keep progressing at the limit. Each leaf normally has two seats, so this is not a count of agent processes.

A working, blocked or unknown seat is not treated as idle. A recently delivered prompt also gets a grace period.

Each dispatch pass makes at most one delivery attempt per pending seat. Repeated delivery failures can put the leaf into failed. Running next again does not resume a failed leaf. Read its cause and choose a recovery phase first.

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
