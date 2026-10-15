# Brief: test-isolation

## What
akrogon's own test suite stops writing into the real home and the real leaf temp root, and ends every process it starts.

## Why
Store-hygiene F1, F4: 35-45 empty repo dirs in `/var/tmp/akr-1000`, an empty `~/.akrogon/worktrees/repo`, and 16 fake seats still sleeping since 2026-10-13 all come from the suite. Cleanup alone would hide a refill.

## Done-criteria
1. A full `bun test` run adds no entry under the real `/var/tmp/akr-<uid>`, `/tmp/akr-<uid>` or `~/.akrogon/worktrees`.
2. After a full `bun test` run exits, no process the suite started is still running.
