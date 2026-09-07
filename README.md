# akrogon-new

Rebuild of the issue lifecycle from the July 28 skills plus the current intake skills, with a thin herdr driver on top. Nothing is decided yet. The chart decides: run `/chart-issues` in this checkout; its input is `issues/chart/INTAKE.md`.

## Layout

- `skills/` is the working skill set. Lifecycle skills are the July 28 snapshot of `tamdoma/issue-lifecycle` at commit `2f1fdbc3` (consult, check, implement, merge, explain, broadcast, init). Intake skills are the current akrogon versions (chart-issues, create-issue, consolidate-issues, seed-issue). `braindump-issues` is new, the intake-folding skill. Nothing here is installed into any harness yet.
- `issues/` is the scaffold from the July 28 init-issues: `config.yaml`, `open/`, `worktrees/` (ignored), `.scripts/` (the 3,970-line July 28 payload, self-test passing), and `chart/INTAKE.md`.
- `reference/` holds the four things from the current akrogon repo (`~/Work/infra/akrogon`) that the intake names as worth keeping, to build on or rewrite, never to run as is: `akrogon-scripts/branch-watcher.ts` (38 lines), `akrogon-scripts/alert-webhook.ts` (the Moshi push, 220 lines, no imports), `akrogon-config.yaml` (the repos block and model per seat), and `lessons/` (history to keep).
- `new-beginning/`: the session notes that produced the intake, the July 20 and July 28 skill snapshots, and the July 28 keep/cut list. Delete once the chart no longer needs them.

## Not copied

Nothing else from the current akrogon repo is here: not the reconciler, judge, verification, merge-finalize, board, the current lifecycle skills, issue-master, or its docs. The intake treats them as the example not to follow. They stay at `~/Work/infra/akrogon` for reading.
