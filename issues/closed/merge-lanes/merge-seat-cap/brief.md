# Brief: merge-seat-cap

## What

`activeCount` stops counting leaves in phase `merge` against `max_active`, in both its live-session and refused-session branches; leaves in `check.repair` and every other unfinished phase count as today, and the `unknown` and `unreadable` terms are unchanged. A dispatch refused for capacity records the wait reason `capacity`, and the timing report lists it as a named wait kind. The `max_active` text (`docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, the `seatCommand` error) says it counts leaves outside merge, and `docs/reference/files.md` lists the `capacity` wait.

## Why

When the cap bound in the week 2026-11-14..21 (11.8 h at 12 or more seated leaves), 9 to 13 of the seated leaves were waiting in `merge`, so new work could not start while nothing worked (forks/waiting-seats.md Findings). Signpost 6a: leaves waiting in merge stop counting against max_active. A cap refusal writes `wait none` today, one of seven `none` writers, so its effect cannot be counted.

## Done-criteria

1. With `max_active` reached only because leaves in `merge` hold live seats, a new leaf is given seats; with the same count made of leaves in `check.repair` or `implement`, it is refused. Both hold when the repo's hc session is refused. Proof: own tests in `bun test` at the command boundary.
2. A dispatch refused for capacity writes one `wait` row with reason `capacity`, `akrogon timing` lists that wait under its own kind, and timing ledgers written before this change parse as today. Proof: own tests in `bun test`.
3. The `max_active` text in `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md` and the `seatCommand` capacity error says merge leaves are not counted, and `docs/reference/files.md` lists `capacity` among the wait reasons. Proof: the reviewing seat reads the named text.
