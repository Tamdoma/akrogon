# Brief: slow-merge-notice

## What

After each completed merge-scope `akrogon verify` run, compare its wall time (`end - start`) with the repo's recent normal merge time. When it is much slower, record that on the run's receipt, print a `verify slow:` line, send one herdr notification per slowdown episode and show a `Slow merge:` line in `akrogon status` while the episode is open, naming the leaf where the slowdown was first seen. Merge exit status and receipt eligibility do not change.

## Why

Tamdoma/akrogon#123: in the framework repo merge verify went from about 6 to about 21 minutes from 2026-10-27 and stayed there for about 45 merges before a human noticed. `issues/verify-runs.jsonl` already records `start` and `end`, but no reader compares durations.

## Done-criteria

1. With at least 5 eligible earlier merge runs, a completed merge-scope verify run whose wall time is more than 1.5x their median and at least 2 minutes more prints a `verify slow:` line with measured minutes, normal minutes and "first seen at <leaf> <run>", stores the comparison on its receipt and sends one herdr `<repo> merge slow` notification; the same run's verify exit code and `requireGreenReceipt` result are what they would be without the check, so a slow green merge still lands.
2. Eligibility follows the binding decision: a run with a `reused` or `blocked` entry, setup not 0, or no `end` never enters the normal but a completed partial head run is still checked; a run with `compares` (known-red base) is neither checked nor counted; with fewer than 5 eligible earlier runs no run is flagged; leaf-scope runs are never checked.
3. Within an open episode, later checked runs compare with the episode's pre-jump normal, cite the episode's first run and send no second notification; an episode whose notification is undelivered or failed is sent by the next completed merge run of that episode; a fresh eligible run back under the threshold closes the episode as recovered; once the last 20 eligible runs all lie inside the episode it closes as accepted, with a `verify slow:` line saying so.
4. `akrogon status` prints a `Slow merge:` line naming the repo, the first-seen leaf and run, measured and normal minutes while that repo's latest episode is open, and no such line otherwise.
