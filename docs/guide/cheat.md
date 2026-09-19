# Cheat sheet

Everything on one screen. Print it. I've got it taped to my monitor, slightly crooked.

    once per machine
    bun install && bun src/akrogon.ts install

    once per repo
    akrogon init --toolkit typescript="bun test"
    akrogon config

    create work, in your own agent session
    /seed-issue       /chart-issues
    akrogon pull
    akrogon sync

    run, with export-csv in widgets as the example
    akrogon next --all
    akrogon next issues/open/export-csv
    akrogon next export-csv
    akrogon phase export-csv check.review --slot B --verdict fix
    akrogon phase export-csv merge --slot A --verdict nits

    look
    akrogon status
    akrogon status export-csv
    akrogon status --charts
    tail issues/log.jsonl
    herdr plugin log list --plugin akrogon

    order
    blocked-by: [export-csv]
    hand_built: true
    max_active: 0
    akrogon park search billing
    akrogon unpark search
    akrogon unpark --all

    files
    ~/Work/infra/akrogon/config.yaml
    ~/Work/widgets/issues/config.yaml
    ~/.config/akrogon/env
    issues/open/export-csv/export-csv/state.yaml
    issues/worktrees/export-csv

Notes I keep forgetting: sync commits only eligible issues, not everything. next --all inside a repo means that repo, outside means everywhere. priority is ignored. failed can resume to any active phase, not just implement. gacp is loose, sync is strict.

Previous: [Learn](learn.md) · Next: [README](../../README.md) · [Home](../../README.md)
