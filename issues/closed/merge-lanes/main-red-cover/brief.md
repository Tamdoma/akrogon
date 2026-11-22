# Brief: main-red-cover

## What

The merge land run accepts a red head in its first turn, with no rerun, no base run and no seat, when every failing unit is a named test title that is an unresolved red on main from a completed base run at or before the head's merge-base. A covered unit resolves when a later completed run on landed main passes that command, or fails it without that unit and with only named failures. `requireGreenReceipt` (`knownRedReceipt`) accepts the covered head, reading stored `failures` first as `newRedUnits` does, so `landGates` and `landPush` pass it. A head with a nameless failing unit (`(script)`, `(unnamed)`, `(no test name)`, `(log gone)`) or any uncovered unit is not covered and takes the ordinary red path.

## Why

When main itself is red, every queued leaf fails on the same test and pays extra runs: the framework streak `skills-typecheck-switch` (11-15..17) cost 41 head and 19 base runs, about 10 h of line (forks/red-exit.md Findings). The bar stays the one the operator set in base-red forks/red-base-policy.md: a red already on main does not block a leaf.

## Done-criteria

1. A head whose every failing unit is a named title found red in a completed base run at or before its merge-base, and not resolved since, lands in its first land run with one verify, no base run, no prompt, and a `merged` row in `merge-attempts.jsonl`. Proof: own test in `bun test` at the command boundary.
2. A head is not covered, and takes the ordinary red path, when any failing unit is nameless, is not an unresolved red on main, or was seen red only in a base run after its merge-base. Proof: own tests in `bun test`.
3. After a later completed landed-main run passes the command, or fails it without the unit and with only named failures, a head failing that unit is no longer covered; a landed run with a nameless failure resolves nothing. Proof: own tests in `bun test`.
4. `landGates` and `landPush` accept a covered head and refuse an uncovered red one. Proof: own tests in `bun test`.
