# Brief: stored-failure-names

## What

A red command entry in the run record (`issues/verify-runs.jsonl`) keeps its failure names. `verifyRunSchema` (src/verify.ts) gains an optional `failures` field on a command entry: a non-empty deduplicated string array holding exactly what the name reader returns for that entry's live log when the run is written, present only where the command itself ran and exited non-zero. `flips` (src/flaky.ts) and `newRedUnits` (src/verify.ts) use the stored names when present and read the log otherwise, so `akrogon flaky` and red-main notices keep their names after a repo retires its evidence. `knownRedReceipt` never reads the field and still needs both real logs. docs/reference/files.md and src/AREA.md state the field.

It consumes one output of `failure-names` (blocked-by): the name reader's grammar. A stored name is written once and never re-read from the log, so it must come from the new reader; rows written before this leaf carry no field and keep being read from their logs.

No second file, no recovery of rows whose log is already gone, no change to which runs are written or when.

## Why

Tamdoma/akrogon#134: 36 of framework's flips show as `(log gone)`. The names are computed from the log bytes at read time and the run record keeps only the check name, exit and log path, so when framework retired its closed-leaf evidence on 2026-10-27 the names went with it. The same loss hits a log written to a holder that is later deleted. Each report also unpacks every archive again to read names that never change.

## Done-criteria

1. A run written by `akrogon verify` in which a configured check ran and exited non-zero records `failures` on that command entry, equal to the names the reader returns for its log. An entry at exit 0, an entry recorded `blocked` and an entry recorded because setup failed carry no `failures`, and no stored list holds `(log gone)`. (C: these are the entry shapes `akrogon verify` writes today; it writes no `reused` entry.)
2. After such a red run and a later green run on the same tree, with the red log and its archive removed, `akrogon flaky` lists the flip under its stored names and not as `(log gone)`. It fails on the base and passes after.
3. With the log of an unresolved, already-noticed red on main removed, a repeat of the same stored name is not reported as a new red, and a different name is.
4. A completed linked head and base pair whose rows store equal `failures` does not satisfy the receipt gate when the head log or the base log is gone at comparison time; the runs stay recorded. For a gone head log, `akrogon verify --known-red` on that head prints `verify known-red <sha>: fail`. A fresh base run that `verify --known-red` itself starts and whose log is readable is compared as today. (B,C)
5. A ledger row without `failures` still parses and its names are read from its log as before: a readable plain or packed log gives its names, a retired log gives `(log gone)`, and a corrupt archive or a missing archive member still raises its own error.
6. docs/reference/files.md (the `verify-runs.jsonl` description) and src/AREA.md's verify paragraph state the field, which entries carry it, who reads it and who never does, and that an akrogon older than this change cannot read a ledger that holds it.
