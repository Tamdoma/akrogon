# Brief: cli-help

## What

`akrogon <verb> --help` prints that verb's name and the flags the parser declares for it, plus the verb's existing `Usage:` line where `src` already holds one, on stdout, and exits 0. `akrogon --help` prints the verb list on stdout and exits 0. An unknown flag prints one line on stderr that names the flag and the verb's declared flags, and exits 1. A `timing --since` value in the wrong form prints the existing timing usage line on stderr and exits 1. None of these prints a stack trace or a code frame. The help text is built from the same option declaration the parser uses; no help text is written by hand. Every other behavior of the command stays as it is.

## Why

A seat that wants to learn a verb's flags types `akrogon <verb> --help` and gets `TypeError: Unknown option '--help'` with a code frame, exit 1, so it learns nothing and reads the source instead. Since 2026-10-25 that trace is in 116 of 676 pi sessions, 19 of 482 codex sessions and 39 of 912 claude sessions on this host; the verbs asked most are `run-check`, `phase` and `verify`. Other guessed flags (`--compare`, `--leaf`, `--flow`, `--done`, `--base`) end in the same trace. `akrogon timing --flow --since 2026-10-25T00:00:00Z` ends in a ZodError dump although the usage line that names both `--since` forms already exists (issues/chart/factory-wins/forks/contracts.md, Findings).

## Done-criteria

1. For every verb in the command's verb list, `akrogon <verb> --help` exits 0, prints the verb and every flag the parser accepts for that verb on stdout, with no flag missing and none the parser would reject, and prints nothing on stderr. For a verb whose `Usage:` line exists in `src` on the base (`pack`, `stop`, `timing`, `guard`, `run-check`), the output also holds that line.
2. `akrogon --help` exits 0 and prints the verb list on stdout, with nothing on stderr.
3. An unknown flag on a verb exits 1 with empty stdout and a stderr message that names the unknown flag and that verb's declared flags and holds no stack trace or code frame. `--help` given together with an unknown flag ends the same way, exit 1 on the unknown flag.
4. `akrogon timing --flow --since 2026-10-25T00:00:00Z` and `akrogon timing --cohort --since 2026-10-25` each exit 1 with the timing usage line on stderr and no ZodError text. `--flow --since <YYYY-MM-DD>` and `--cohort --since <iso>` in their designed forms behave as on the base.
5. Help and the two argument errors do no command work: run with an empty home (no config, no state), `akrogon <verb> --help` and an unknown flag end as criteria 1 and 3 say and create no file, and `akrogon stop --help` stops nothing.
6. In `akrogon run-check --name <label> -- <command> --help`, the `--help` after `--` reaches the child command and is not answered by akrogon.
7. An error that is neither an unknown flag nor a wrong `--since` form is reported as on the base, with the same exit code and message, shown for one wrong positional shape and one runtime error.
