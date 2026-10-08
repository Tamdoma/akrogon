# Control merged notes
## Q1 storage and command
- Separate schema-validated state file under globalHome(), new .gitignore entry, missing file = nothing paused, unreadable/invalid = error (A,B). Machine config.yaml and issues/config.yaml are both tracked (`git ls-files`, B; A's earlier "gitignored" claim was wrong), so neither holds runtime state (A,B).
- Paired set/clear verbs `akrogon pause` / `akrogon unpause`, written under the global lock with the rename writer src/shell.ts:67 (A,B). Not a toggle, not park (B).
- Repeat: idempotent, prints the repo and resulting state (B). A had refusal; A accepts B (retries safe, output is not silent).
- Target: (A) required registered repo key, works from any cwd, refuses unknown keys. (B) no argument, resolve the current repo like park (src/park.ts:47, requireRepo), works from subdirectories and worktrees.
- Identity: keyed by registered repo name in this AKROGON_HOME; a key rename drops the pause (B, A agrees).
## Q2 unpause
- (A) clear, then run one startup-style pass scoped to that repo (allocated or merged leaves, cleanup, merge pass), because after closed seats no pane exists to fire an event and Boundary 1a deferred cleanup. Cost: launches at once.
- (B) clear only, print that pending work waits for the next event or a manual `next`/`next --all`. Cost: closed seats stay closed until then.
- Both reject a full repo sweep that starts unstarted leaves (A,B).
## Q3 status
- Annotate only paused repos beside the repo heading (src/status.ts:379), incl. empty repos and --charts (A,B); targeted leaf status shows it too (B). No change to phases, blockers, queue, capacity (A,B).
## Evidence
- Temporal schedule pause/unpause/trigger as separate operations, docs.temporal.io/cli/schedule and python.temporal.io ScheduleHandle (A,B); Argo CD automation flag separate from sync state (B); kubectl cordon/uncordon (A); Astronomer pause/unpause DAG recipe 2025-05-16 (B).
## Differ
- Target: repo key (A) vs current repo (B).
- Unpause: scoped pass (A) vs clear only (B).
