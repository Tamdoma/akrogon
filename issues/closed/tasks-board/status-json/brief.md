# Brief: status-json

## What

`akrogon status --json` prints one JSON envelope covering every registered repo from any folder (the text command keeps its current-repo filter). The envelope carries everything the text `status` and `status --charts` show, each leaf's `status <slug>` detail, the last 5 merges across repos, the watch targets a viewer should follow, and `red`, the number of rows that mark a real block.

## Why

The Tasks board in herdr-app reads only this (fork `issues/chart/tasks-panel/forks/status-json.md`), and herdr-setup's top bar reads `red` for its Tasks dot.

## Done-criteria

1. Run from a registered repo and from `/`, `akrogon status --json` lists every registered repo with its name and root, with a schema version and generated time (D).
2. Every line kind text `status` prints for a fixture state set (failed, Missing, unpacked, slow merge, deploy failed, paused, stopped, blocked-by, merge queue holder and place, broadcast pending, land, run line) has its fact in the JSON.
3. With one registered repo unreadable, the command exits 1 and still prints the full envelope with the healthy repos and that repo's error.
4. Each open leaf carries slug, group path, phase, phase-entry time, first-prompt time, stopped, blocked-by, broadcast pending, land, busy since, done, attempts, fix rounds, verdict, delivery errors, failure, missing gaps, worktree path, plan path, whether it is red, its A and B seats (harness key, first word of the harness command, source) and its last 10 history lines; kept paths sit on the repo and the host, as text `status` reads them (D).
5. The envelope's last merges hold the 5 most recent merged leaves across repos, closed issues included, with repo, slug, merged time and total time; each repo carries its open charts as `--charts` shows them (D).
6. `red` counts each leaf that is failed, has a prompt not delivered or a Missing key once, plus one for a failed deploy and one per unreadable repo or leaf, and never depends on time (D).
7. `watch.folders` names each repo's `issues/` and `~/.akrogon/runs/`; `watch.files` names `~/.akrogon/config.yaml`, `paused.yaml`, `stopped.yaml`, `reconcile-host.json`, `deploy.yaml` and the `current` release link; never `~/.akrogon` itself (B,C).
8. Running it writes nothing under any repo or `~/.akrogon`.

Proof: the repo's `test` check over fixture repos, as the existing status tests do.
