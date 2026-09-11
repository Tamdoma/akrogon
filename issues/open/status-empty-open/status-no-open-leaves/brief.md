# Brief: status-no-open-leaves

## What
`akrogon status` prints a readable table instead of `key=value` rows. Per registered repo: the repo name as a heading, then one row per open leaf, grouped under their folder path, with the columns LEAF, PHASE, AGE, BLOCKED BY, NOTE. NOTE is empty unless something is non-default: attempts above zero, fix rounds above zero, a verdict, or a missing tab for a leaf past planning. Column widths fit the longest cell. A missing `issues/open` folder counts as zero leaves. A repo with zero leaves prints its name followed by an indented `no open leaves` line. Exit 0. Every other unreadable path (missing repo dir, bad config.yaml) keeps today's `unreadable` JSON line and exit 1. `akrogon status <slug>` is unchanged.

## Why
A healthy repo whose last issue closed makes status fail with an `unreadable` line, a repo with an empty open folder prints only its name, and the leaf rows wrap across two terminal lines and cannot be read at a glance.

## Done-criteria
1. With `issues/open` absent and everything else valid, `akrogon status` exits 0, prints no `unreadable` line, and prints the repo name followed by `  no open leaves`.
2. With `issues/open` present and empty, the output is identical to criterion 1.
3. With open leaves, each leaf is one table row under its repo and folder group, with a header line naming LEAF, PHASE, AGE, BLOCKED BY, NOTE, columns aligned by the longest cell. No `key=value` fields appear.
4. NOTE is empty for a fresh leaf and names attempts, fix rounds, and verdict only when they are non-zero or set, in a short form such as `attempts A1 B2 · fix 1 · A:fix`.
5. `Failed:` lines and the `unreadable` JSON line are unchanged. A missing repo directory and an invalid `issues/config.yaml` still produce the `unreadable` line and exit 1.
6. `tests/status.test.ts` covers criteria 1 to 5, replacing the leaf-row field regex with assertions on the table rows.
7. `bun test`, `bun run typecheck` and `bun run format` pass.
