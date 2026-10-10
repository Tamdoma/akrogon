# Brief: merge-attempt-pressure

## What
Each line in `issues/merge-attempts.jsonl` gains the host stall time during that attempt: for cpu, memory and io, the increase of the `some` `total` counter (microseconds) in `/proc/pressure/<resource>`.
- Start: when the command creates the batch (beside `started`) it reads the three counters and the boot id (`/proc/sys/kernel/random/boot_id`) and stores them as a field of the batch record (src/state.ts batch schema), carried by every `...batch` rebuild on restack. (B,C)
- End: the call that ends the attempt reads the counters and boot id before any push or state change, and `appendAttempt` writes the differences. (B)
- No pressure field is written when: the batch has no start counters (recorded before this change, or `/proc/pressure` absent at start), or the end boot id differs from the start one (host rebooted; counters restarted). Each of these is a permitted state, not an error. (B)
- A `/proc/pressure` file that exists but cannot be read or parsed is an error: the call stops before anything irreversible with the path and the read error, as other refused phase calls do. (B)
- Counter reads go through one function taking the pressure directory as a parameter, defaulting to `/proc/pressure`; no environment variable or config key. (C)

## Why
Tamdoma/akrogon#69 claims heavy test runs from many seats overload the host and cause merge bounces. No failure has been traced to load (framework#207 classified flakes by agent judgment; two of five named flakes occurred at the lowest activity seen). Stall time over the whole attempt, recorded on every attempt, lets a red attempt be compared with green ones; a host-wide test-run limit is charted only if red attempts show stall that green ones do not.

## Done-criteria
1. A merged, red, split, held, reuse and ejected attempt each append one line whose pressure field holds cpu, memory and io stall increases as non-negative integers from batch creation; one case restacks the batch (decision `rerun` then `reuse`) and still carries its start counters. (C)
2. A batch recorded before this change, a host without `/proc/pressure`, and an end boot id that differs from the start one each append the line exactly as today without a pressure field, and no merge is refused or delayed. (B)
3. A present but unreadable or malformed pressure file stops the batch creation or the ending call before any push or state change, naming the path and error. (B)
4. docs/guide/files.md `## merge-attempts.jsonl` and the line schema in src/attempts.ts describe the field, its unit and when it is absent. (C)
5. The blocking `checks` pass.
