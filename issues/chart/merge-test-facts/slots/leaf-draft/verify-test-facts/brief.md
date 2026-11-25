# Brief: verify-test-facts

## What

A finished `issues/verify-runs.jsonl` row keeps three facts that today live only in the command log, which owner completion deletes when the leaf closes (b9fe5027):

1. `timeouts`: on any command row whose own output ran red, the names in that row's `failures` whose own Bun stream prints the timeout line right after their `(fail)` line. Every scope.
2. `durations`: on merge-scope command rows (base comparison rows included), the 20 slowest Bun-timed tests of the command's own output plus every failure name with a timed line, each as `{name, ms}` with integer ms.
3. `attempt`: on the run, the land attempt that launched the pass, copied from the pass record's caller when present.

On a rerun row each leg's `timeouts` and `durations` sit beside that leg's own log: the first run's inside `rerun`, the rerun's at top level. `failures` stays byte-identical to today for every input. Rows written before this change keep parsing. docs/reference/files.md describes the new fields.

## Why

Tamdoma/akrogon#154. Since b9fe5027 every framework merge verify log is deleted at leaf close. The row keeps failure names, but nothing says which failures were timeouts or how long tests ran, and a merge-attempts row cannot be joined to its verify runs (a consultant count found 7 of 73 red attempts unjoinable). The framework chart that removed test load from its merge suite needs exactly these facts to see whether load reds ended. The facts are parsed from the same captured output `commandRow` already reads for `failures`, so they survive the log.

## Done-criteria

1. A merge-scope verify whose command prints Bun `(pass)`/`(fail)` lines with `[<n>ms]` suffixes, under wrapper chains `<a> | <b> | `, records on that command row `durations` holding the 20 largest timed tests and every timed failure name, with integer ms, names exactly as `failures` names them, one entry per name keeping its largest ms, and the end-summary repeat of a fail line counted once. After the command's published log is deleted, the row still holds them. Lines without a `[<n>ms]` suffix and look-alike lines such as `PASS x (pass)` add nothing. Proof: own test through the real `akrogon verify` CLI in a temp repo.
2. A red verify run whose command output holds, on interleaved wrapper streams, one failure followed in its own stream by `  ^ this test timed out after <n>ms.`, one assertion failure, and a thrown error whose text reads `this test timed out after <n>ms.`, records `timeouts` holding only the first name, at leaf scope and at merge scope, and its `failures` equal to what the same output gives today. A green row, and a red row with no timeout line, carry no `timeouts`. Proof: own test through the real CLI.
3. A merge rerun row (red first run with at most 3 named failures, rerun configured) keeps the first run's `durations` and `timeouts` inside `rerun` and the rerun's own at top level, with top-level `timeouts` a subset of top-level `failures`. Proof: own test through the real CLI with a configured `rerun` entry.
4. A leaf-scope verify row carries no `durations`; a merge-scope base comparison (`compares`) row does. A command row recorded `blocked` carries neither field. Proof: own test through the real CLI. (B,C,D)
5. `akrogon verify --attempt <id>` writes `attempt: <id>` on its run row; a verify without an attempt writes no `attempt`. Proof: own test through the real CLI. (C)
6. A `verify-runs.jsonl` holding rows written before this change (no `timeouts`, `durations` or `attempt`) parses unchanged under the new schema. Proof: own test reading a fixture ledger of old rows.
7. docs/reference/files.md's `verify-runs.jsonl` row describes `timeouts`, `durations` (merge scope, the 20 slowest plus failures, per leg on a rerun) and `attempt` (the attempt that launched the pass), and states that a ledger holding them does not parse under an older akrogon.
