# Opening map, merged (A, B)

Sources: slots/map-A.md, slots/map-B.md. Inspected at main a93fec75, 2026-11-09.

## Agreed surface

- `knownRedReceipt` (src/verify.ts) is the one acceptance function; `requireGreenReceipt` and every phase gate (`transition` into `check.review`, `check.repair` into `merge`, `recordTested`, `batchCheck`, `landGates`, `batchPush`, direct-guards) inherit it, so one change reaches every route of signpost 5a (A,B).
- The name guard is the only obstruction; `completed`, `sameCommands`, the `compares` link, the merge-base match and the blocked-entry rules already hold and are not duplicated (A,B).
- Command acceptance and the seat's causal agreement are two separate facts; the agreement lives in the seat's report, and no new persisted approval, schema field or config is added (B; A agrees, signposts 3a 4a).
- `failedTests` also feeds `flips` and `newRedUnits`, which already carry `(no test name)` as a unit; reporting and notice identity do not change (A,B).
- seed-issue `## Lifecycle filing` takes a command path and needs no test name; a covered nameless red files the broken main check unchanged (A,B).
- One leaf: code, seat texts and docs are one behavior change; splitting leaves a window where the command accepts what the instructions forbid (A,B).
- Real records of the reported red: slots/evidence/herdr-setup-pair-2026-11-09.log, a linked completed pair, `shell` exit 127 on both sides, both logs present and identical, no `(fail)` line (A). Short-circuit confirmed locally by B's V1 (`bash -n` chain stops at the missing file, third command never runs) (B).

## Where the slots differ

- The command gate. A: drop only `(no test name)` from the guard, so the marker compares like a name and the named-test path is untouched; optional added fact, the same exit code. B: make the gate uniform, removing test-name comparison from acceptance for every red, so a named `alpha` head against a named `beta` base becomes machine-eligible and only the seat refuses it.
- Missing evidence. A: keep the `(log gone)` sentinel as the guard. B: read each candidate pair through `readLog` and drop the coupling to test-name extraction.
- Seat text homes. B adds: check-issue's rule sits in its check.review section, and src/AREA.md's verify paragraph states the named-test contract; A adds docs/reference/checks.md `## Known red` and its error-table row.

## Forks

1. coverage-rule: Q1 what the command accepts; Q2 what the seat must judge before a nameless cover counts.

No other material fork (A,B). Rejected by both: requiring every hidden unit to run, an exit-code denylist for crashes, new receipt state, a leaf per consumer.

## Pitfalls, each with what removes it

- A check that prints every error carries the leaf's new errors beside the base's (A): the seat rule requires that the head log shows no failure the base log lacks.
- A crashed, killed or timed-out run looks nameless on both sides (A,B): the seat rule's own-verdict clause; a finished command reporting a runner crash is not proof tests ran (B).
- The command's `pass` read as causal approval (B): all four seat paths state both obligations.
- Missing logs passing after a move or pack (B): `(log gone)` never covers; packed evidence still reads.
- Unrelated receipts or config changes giving cover (B): keep the whole-row, command-identity, link and merge-base checks.
- Still-true refusal cases deleted as outdated (A,B): the leaf keeps every case that stays true under the taken rule.
- Skill text reaches seats and doors only at the next release link (A).
