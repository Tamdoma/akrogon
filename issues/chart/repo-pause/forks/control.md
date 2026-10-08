# Control

## Question
Q1. Where is the pause stored (machine-local state under the akrogon home vs a key in the repo's `issues/config.yaml`), and what command sets and clears it?
Q2. Does unpause only permit future dispatch, or also run a pass?
Q3. How does `akrogon status` show a paused repo?

### Carries
- [Boundary](boundary.md)

## Findings
See slots/control-merged.md and slots/control-rebuttal-B.md.
- Agreed (A,B): separate schema-validated state file under globalHome(), new .gitignore entry (config.yaml and issues/config.yaml are tracked), missing file = nothing paused, invalid file = error; paired `akrogon pause` / `akrogon unpause` under the global lock with the rename writer (src/shell.ts:67); idempotent with printed result; keyed by registered repo name in this AKROGON_HOME; status annotates paused repos only, beside the repo heading (src/status.ts:379), in --charts and targeted leaf status, without changing phases, blockers, queue or capacity.
- Target: A moved to B after rebuttal: no argument, current registered repo via requireRepo like park (src/park.ts:47, src/config.ts:188), from subdirectories and worktrees.
- Unpause differ: A recommends clear then one repo-scoped startup-style pass (src/next.ts:1272 filter, scoped to one repo); B recommends clear only. B rebuttal: the pass can start unstarted dependents through dispatchDependents (src/next.ts:1151), and a successful clear must report separately from a failed pass.
Research: Temporal schedule pause/unpause/trigger separate (docs.temporal.io/cli/schedule, python.temporal.io ScheduleHandle), Argo CD automation flag, kubectl cordon/uncordon, Astronomer pause DAG recipe; read 2026-10-08.

## Taken
Operator 2026-10-08: `1 - Then what's the difference between pause and park? | 2a | 3a |`, then after the explanation: `1a`
- 1a: `akrogon pause` / `akrogon unpause` take no argument and act on the registered repo of the current folder (requireRepo, like park, incl. worktrees). State lives in a separate schema-validated, gitignored file under globalHome(), keyed by registered repo name; missing file = nothing paused, invalid file = error; written under the global lock with the rename writer; idempotent, prints the repo and resulting state. Foreclosed: 1b repo-key argument; storage in config.yaml or issues/config.yaml (both tracked).
- 2a: unpause clears the pause, then runs one startup-style pass scoped to that repo (allocated or merged leaves, cleanup, merge pass, with existing dependent cascades). Reason: closed seats have no pane left to fire an event, so the model-swap flow needs unpause to relaunch. It never starts a leaf that had no tab, worktree or merged phase except through the existing dependent cascade. The clear is reported separately from any pass error. Foreclosed: 2b clear only.
- 3a: `akrogon status` annotates paused repos only, beside the repo heading, incl. empty repos, --charts and targeted leaf status; phases, blockers, queue and capacity unchanged. Foreclosed: 3b active/paused on every repo.

