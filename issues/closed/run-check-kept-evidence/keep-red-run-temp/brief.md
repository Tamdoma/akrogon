# Brief: keep-red-run-temp

## What

`checkedRun` (src/run-check.ts) stops deleting a run root when the command exits nonzero: it marks the root with an empty `.akrogon-kept` file and leaves it in place. `reconcile` (src/reconcile.ts) leaves a marked run root alone, without reporting it as kept and without blocking the leaf temp's release, so the root goes away with the leaf temp. Every `checkedRun` caller (`akrogon run-check`, `akrogon verify`) gets this. Green runs, refusals, thrown errors and crashed-run cleanup behave as today. The docs state the new lifetime.

## Why

Tamdoma/akrogon#145: a paid capture run through `akrogon run-check` failed and printed "failure evidence kept at /var/tmp/akr-1000/.../run-xbf9lE/...", a path under the run's TMPDIR, which run-check deleted at exit. The cause could only be found with a second paid run. The chart reproduced it for free (issues/chart/run-check-kept-evidence/forks/kept-run-root.md, charting observation) (C).

## Done-criteria

1. A command run through `akrogon run-check` from a leaf worktree that writes a file under `$TMPDIR` and exits nonzero leaves that file readable after run-check exits, and its run root holds `.akrogon-kept`; the same command exiting 0 leaves no run root; a publish-refused run keeps its root with `refusal.json` and no `.akrogon-kept` as today.
2. A red command inside `akrogon verify` keeps its TMPDIR the same way, and a green command's TMPDIR is removed.
3. A `reconcile` pass over a leaf temp holding a marked run root, while the leaf's tab lives, keeps the root and adds no kept entry for it (none in `status` `Kept:` lines or `akrogon leftovers`); once the tab is gone the pass removes the whole leaf temp, marked root included; a marked root whose `.owner` names a live pid still yields no kept entry and does not block that release.
4. An unmarked run root with a dead `.owner` is still removed on the next `reconcile` pass, and an unmarked root with a live owner is still kept as "run in progress".
5. A red command that deleted its own `$TMPDIR` still has its exit code returned by run-check (and recorded by verify) and leaves no run root. (B)
6. docs/reference/checks.md (the private `TMPDIR` sentence) and src/AREA.md (run-check and reconcile lines) state that a red run's TMPDIR is kept until the leaf temp is released and a `--holder` run's until the idle sweep.
