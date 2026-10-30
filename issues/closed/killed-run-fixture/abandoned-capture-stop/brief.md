# Brief: abandoned-capture-stop

## What

`akrogon phase` refuses every non-failed move of a leaf while the leaf folder holds an abandoned run-check capture pair (`capture-<name>-<run>-out.log`/`-err.log` whose run has no live holder) with no non-blank `cleared-<run>.md` beside it. The refusal names each pair and the clear step. A pair is live while the run-check wrapper or any process holding the run's stdout lives, told by one shared flock on the capture-out file's open description. check-issue and implement-issue tell a seat to recover before any rerun: read the pair, run the leaf grant's discovery, cleanup and absence read for that run, write `cleared-<run>.md`.

## Why

Tamdoma/akrogon#124: a live run-check killed before its test's `finally` ran left a production test user with cloud data. The seat reran the probe green, moved the leaf, and the leftover stayed until another seat's absence read found it. When the wrapper dies, `startRunGuard` stops the test scope, and bun 1.4.4 runs no `finally` on SIGTERM (measured 2026-10-28). The only trace left is the capture pair, which no step reads before a move.

## Done-criteria

1. After a run-check's wrapper is SIGKILLed and its command has ended, `akrogon phase` on that leaf to any non-failed phase, `--check` and a single slot's completion included, exits non-zero, names the pair and the clear step, and leaves `state.yaml` and the leaf's phase history unchanged. A move to `failed` and operator recovery from `failed` still succeed.
2. A live run's pair never refuses a move: while a run-check's command runs (nested run-check included), after its wrapper was SIGKILLed while the command or a descendant holding its stdout still runs, and while a surviving wrapper publishes after its command ends, `akrogon phase` on that leaf is not refused by that pair.
3. A non-blank `cleared-<run>.md` beside an abandoned pair lets the move pass, while an empty or whitespace-only one still refuses. After clearing, the capture files keep their names and bytes, and `akrogon log <printed capture path>` still prints them.
4. The liveness probe never creates a file. A pair whose files are unlinked between discovery and probe, as normal publication does, neither refuses nor leaves a capture file behind.
5. A run-check that completes normally, with exit 0 or not, leaves no capture pair, and no move is refused for it.
6. check-issue (`## check.review`, `## check.repair`) and implement-issue (`## implement`, `## check.fix`) SKILL.md tell a seat that, after a run-check printed no `check <label>:` line, it recovers before any rerun or move: it reads the pair, runs the leaf grant's own discovery, cleanup and authenticated absence read for that run (not only the IDs the pair printed), writes a non-blank `cleared-<run>.md` beside the pair stating what it found, cleaned and read, and moves the leaf to `failed` with that reason when it cannot. A later green run clears nothing.
7. When `learnings/history/2026-10-28-killed-run-fixture-leak.md` exists on the leaf's base, its `learnings/LESSONS.md` line is removed and `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` is appended to that history file, per the lesson rule's Retire clause. When it is absent, `implementation/report.md` records the absence and no lesson file changes.
