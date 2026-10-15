# Store hygiene: Taken draft (operator 2026-10-15: "1a | 2a | 3a")

## Q1 → 1a scope
- Clean akrogon's own places: each repo's worktree store and legacy `<repo>/issues/worktrees`; leaf temp root `/var/tmp/akr-<uid>` (repo dirs, leaf dirs, run dirs, stray entries); retired `/tmp/akr-<uid>`; `~/.akrogon/worktrees/<name>` for a name that is no registered repo; state akrogon writes in the global home (reconcile reports pruned to paths that exist, non-record files in `runs/`); retired lock files no current code takes (`~/.akrogon/run.lock`, `~/.akrogon/framework-tests.lock`, `<repo>/.git/akrogon-base-runs.lock`, `<repo>/issues/.lock` when the repo root is not the global home), each deleted only when no process holds it open.
- When a leaf ends (phase `merged`), stop its leaf slice (`systemctl --user stop <leafSlice(repo, slug)>`, the call src/stop.ts:52 makes) so its leftover processes end. Guard units get `CollectMode=inactive-or-failed` like `runUnitArgv` (src/scope.ts:53-54, :66-78); failed `akrogon-run-*` units already loaded are cleared with `systemctl --user reset-failed`.
- Fix akrogon tests that write into the real HOME or leaf temp root, and end their fake seats in teardown. Done-criterion: `bun test` adds no entry to `/var/tmp/akr-<uid>` or `~/.akrogon/worktrees` and leaves no process behind.
- Never touched: `~/.config/akrogon/env`, config.yaml, paused.yaml, stopped.yaml, the current `.lock`, installed links, repo issue records and logs (chart check-evidence), other tools' files (Claude Code worktrees, pi command logs, `.evidence`).

## Q2 → 2a proof
- Leaf-owned items: `leafTemp(repo, slug)` with everything in it, and store or legacy-root entries named `<slug>` or `<slug>-<anything>`, matched against all known slugs longest first. Deleted when the leaf is `merged` and its slice has no running unit. The leaf worktree itself keeps the taken rules (dirty → kept as `uncommitted changes`; workers per scratch-copy-removal 3a).
- Unowned items in those places (no slug match: `.dcf*.node-gyp`, `.temp`, stray files, dangling symlinks, empty dirs, unregistered repo dirs): deleted when no leaf of that repo is running, meaning no leaf of the repo has a live tab or a slice with a running unit. An unregistered repo has no leaves.
- Both kinds also need: no live herdr pane with cwd inside; no process of this user with cwd or an open file inside (`/proc/<pid>/cwd`, `/proc/<pid>/fd/*`). Pane list unavailable → keep. Registered worktrees follow the taken rules only.

## Q3 → 3a timing
- Runs in every reconcile pass (`akrogon next`, `--all`, `--resume`, `tab_closed`, the post-merge pass) for every registered repo, including repos with no open leaves, plus one host-wide step per pass for items tied to no registered repo (retired `/tmp/akr-<uid>`, unregistered repo dirs, retired locks, `runs/` leftovers), reached from both `reconcileRepos` and the `tab_closed` path.
- `reconcileNeedsPanes` counts every new candidate kind (F3), so no new candidate is judged with the empty pane list.
- Unprovable items stay, recorded in `reconcile/<repo>.json` with the reason and what clears it, and shown in plain `akrogon status` (after-merge 4a). The next pass deletes them once the reason clears. Nothing is deleted for age.
- A failed delete is reported with path and error; absence is checked after each delete. Today's junk (F1) goes through the same rules on the first pass; no separate migration.
