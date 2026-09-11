# Brief: status-no-open-leaves

## What
`akrogon status` treats a missing `issues/open` folder as zero leaves. A repo with zero leaves prints its name followed by an indented `no open leaves` line instead of the table header. Exit 0. Every other unreadable path (missing repo dir, bad config.yaml) keeps today's `unreadable` JSON line and exit 1. The leaf table (LEAF, PHASE, AGE, BLOCKED BY, NOTE) already exists and is unchanged. `akrogon status <slug>` is unchanged.

## Why
A healthy repo whose last issue closed makes status fail with an `unreadable` line, and a repo with an empty open folder prints only its name and a bare table header.

## Done-criteria
1. With `issues/open` absent and everything else valid, `akrogon status` exits 0, prints no `unreadable` line, and prints the repo name followed by `  no open leaves`.
2. With `issues/open` present and empty, the output is identical to criterion 1.
3. A zero-leaf repo prints no table header line. With open leaves, the table output is unchanged.
4. `Failed:` lines and the `unreadable` JSON line are unchanged. A missing repo directory and an invalid `issues/config.yaml` still produce the `unreadable` line and exit 1.
5. `tests/status.test.ts` covers criteria 1 to 4, and the existing `verify(open)` assertions for a missing or file-typed `issues/open` are updated: a missing folder now succeeds, a regular file at that path still fails.
6. `bun test`, `bun run typecheck` and `bun run format` pass.
