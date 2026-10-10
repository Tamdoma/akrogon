# Brief: merge-attempt-records

## What
Every merge attempt end appends one JSON line to `issues/merge-attempts.jsonl` in the leaf's registered repo, written by the command beside `issues/log.jsonl` with the same append and lock handling: attempt id, repo, holder, members, built_on, tested top, outcome, start and end time. The batch record gains a `started` time set when the batch is created (src/next.ts:1031) so start is the batch creation. This leaf writes outcomes `merged`, `red`, `split` and `reuse` and owns the line schema with outcome values `merged | red | split | held | reuse | ejected` and an optional `culprit` slug; `held` is written by red-main-hold and `ejected` by red-batch-culprit.

## Why
Merge turn time and red rate cannot be measured today: splits write no log line and green batches write one line per member (#66). Batch size and ordering choices need attempt-level data.

## Done-criteria
1. A green batch of a holder and 2 members, including one landed through command recovery after a lost push reply (src/next.ts:895-940), appends exactly one line with outcome `merged`, both members listed, and start before end.
2. A red solo attempt appends one line with outcome `red`; a red batch with members appends one with outcome `split`; an attempt whose push was refused, restacked to decision reuse and then pushed appends exactly one line, with outcome `reuse`, at the successful push; `reuse` means landed (A,B,C).
3. An unlanded batch discarded by recovery in src/next.ts:895-940 appends one line with outcome `red` (A,B).
4. `issues/log.jsonl` lines and its readers are unchanged.
5. A stale or refused phase call appends no line.
6. docs/guide/files.md (or the guide page that lists issues/ files) describes merge-attempts.jsonl and its fields.
7. The blocking `checks` pass.
