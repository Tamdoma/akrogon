# Carries go stale when a later decision locks over them

Parallel Merge carried "broadcast failure must be visible in status" into Status View. Repeat Safety, resolved later, locked "one retry, nothing recorded". The carry stayed in the file and slot B had to find the conflict during its blind pass.

Rule: before writing a batch, reread every "From #" line in the decision file against the resolutions written after its date. A carry older than a lock on the same subject is a candidate for retirement, and the batch says so instead of asking a question the lock already answered.
