# Brief: total-time-column

## What
Replace the `AGE` column in the `akrogon status` leaf table with a `TIME` column holding the leaf's total work time. The clock starts at the leaf's first `prompt` record with `outcome: delivered` in `issues/timings.jsonl`. For a `merged` or `failed` leaf it ends at the last `issues/log.jsonl` move into that phase and does not change on later runs. For any other phase it ends at the current time. The value prints as `<hours>h<two-digit minutes>m`, for example `0h29m` or `17h28m`.

## Why
AGE today is the time since the last move into the current phase. For a merged leaf that is the time since the merge, so it grows on every `akrogon status` run and says nothing about how long the work took (framework/block-ledger showed `1048m` for 29 minutes of work).

## Done-criteria
1. The leaf table header reads `TIME` where it read `AGE`. The `--charts` table is unchanged.
2. A `merged` leaf and a `failed` leaf with a delivered prompt and a move into their phase show the time from the first delivered prompt to that move, and two `akrogon status` runs at different times print the same value.
3. A leaf in any other phase with a delivered prompt shows the time from its first delivered prompt to now.
4. A leaf with no delivered prompt record (none at all, only `outcome: failed` prompts, or only another slug's prompts) shows `-`. A finished leaf with a delivered prompt but no move into its phase, or an end before its start, also shows `-`.
5. Values print as `<h>h<mm>m`: 29 minutes is `0h29m`, 1048 minutes is `17h28m`.
6. Proven by the repo's existing `test` check (`bun test`) through `akrogon status` runs on fixture repos.
