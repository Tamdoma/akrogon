# Brief: status-empty-open-fix

## What
`akrogon status` treats a missing `issues/open` as zero leaves instead of crashing, and a registered repo with no open leaves prints its name followed by an indented `no open leaves` line. Exit 0 in both cases.

## Why
After the last issue closes, `issues/open` may not exist and status crashes with ENOENT; an empty repo prints only its name (#1). Observed live in this repo today: `akrogon status` printed only `akrogon`.

## Done-criteria
1. `bun test tests/status.test.ts` passes with new cases: a registered repo with no `issues/open` directory prints `<name>` then an indented `no open leaves` line and exits 0; a repo with an empty `issues/open` prints the same; a repo with leaves prints no such line; the existing row regex does not match the new line; a missing repo directory or bad config still prints the `unreadable` JSON line and exits 1.
2. CLI end-to-end run against a temp registered repo with no open folder leaves `implementation/cli-artifact.log` with the output and exit code.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
